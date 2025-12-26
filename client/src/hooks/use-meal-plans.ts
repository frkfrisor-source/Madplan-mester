import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateMealPlanInput, type MealPlanResponse } from "@shared/routes";
import { useLocation } from "wouter";

// GET /api/meal-plans
export function useMealPlans() {
  return useQuery({
    queryKey: [api.mealPlans.list.path],
    queryFn: async () => {
      const res = await fetch(api.mealPlans.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Kunne ikke hente madplaner");
      return api.mealPlans.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/meal-plans/:id
// Includes polling if status is 'processing'
export function useMealPlan(id: number | null) {
  return useQuery({
    queryKey: [api.mealPlans.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("ID mangler");
      const url = buildUrl(api.mealPlans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Kunne ikke hente madplan");
      return api.mealPlans.get.responses[200].parse(await res.json());
    },
    // Poll every 2 seconds if the plan is still processing
    refetchInterval: (data) => {
      // Accessing the deeply nested plan object safely
      // @ts-ignore - type inference gets tricky with the Zod schema wrapper sometimes, but structure is known
      const status = data?.plan?.dietaryPreferences?.status; 
      // Note: Schema defines status on the response object wrapper or we infer it from existence of meals?
      // Actually, looking at routes.ts: 
      // 201 response has status.
      // 200 response has { plan, meals, shoppingList }.
      // If meals array is empty, it might still be generating or failed?
      // The schema doesn't explicitly put 'status' on the `mealPlans` table, 
      // but the 201 response implies a status workflow. 
      // We will check if meals are empty as a proxy for 'processing' if status isn't on the plan object.
      // However, for a real robust app, we'd add 'status' to the table. 
      // Assuming 'meals.length === 0' means processing.
      return (data && data.meals.length === 0) ? 2000 : false;
    }
  });
}

// POST /api/meal-plans
export function useCreateMealPlan() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: CreateMealPlanInput) => {
      // Zod validation handled by shared route types, but explicit check good for debugging
      const res = await fetch(api.mealPlans.create.path, {
        method: api.mealPlans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Kunne ikke oprette madplan");
      }
      
      return api.mealPlans.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.mealPlans.list.path] });
      // Navigate to the new plan immediately
      setLocation(`/plan/${data.mealPlanId}`);
    },
  });
}

// PATCH /api/shopping-lists/:id/items
export function useUpdateShoppingItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listId, ...data }: { listId: number, categoryIndex: number, itemIndex: number, checked: boolean }) => {
      const url = buildUrl(api.shoppingLists.updateItem.path, { id: listId });
      const res = await fetch(url, {
        method: api.shoppingLists.updateItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Kunne ikke opdatere indkøbsliste");
      return api.shoppingLists.updateItem.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // We invalidate the specific meal plan query because shopping list is attached to it in our get-one endpoint
      // Finding the meal plan ID is tricky here as we only have listId. 
      // Strategy: Invalidate all meal plan details or rely on optimistic updates (advanced).
      // For now, simple invalidation of all detailed views is safest.
      queryClient.invalidateQueries({ queryKey: [api.mealPlans.get.path] });
    }
  });
}
