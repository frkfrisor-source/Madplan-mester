import { z } from 'zod';
import { insertMealPlanSchema, mealPlans, meals, shoppingLists } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  mealPlans: {
    create: {
      method: 'POST' as const,
      path: '/api/meal-plans',
      input: z.object({
        preferences: z.object({
          isVegan: z.boolean(),
          isVegetarian: z.boolean(),
          isGlutenFree: z.boolean(),
          allergies: z.array(z.string()),
          servings: z.number().min(1).max(20),
          days: z.number().min(1).max(14).default(7),
          includeBreakfast: z.boolean().default(true),
          includeLunch: z.boolean().default(true),
        })
      }),
      responses: {
        201: z.object({
          mealPlanId: z.number(),
          status: z.enum(['processing', 'complete', 'failed']),
        }),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/meal-plans/:id',
      responses: {
        200: z.object({
          plan: z.custom<typeof mealPlans.$inferSelect>(),
          meals: z.array(z.custom<typeof meals.$inferSelect>()),
          shoppingList: z.custom<typeof shoppingLists.$inferSelect>().optional(),
        }),
        404: errorSchemas.notFound,
      },
    },
    list: {
        method: 'GET' as const,
        path: '/api/meal-plans',
        responses: {
            200: z.array(z.custom<typeof mealPlans.$inferSelect>()),
        }
    }
  },
  shoppingLists: {
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/shopping-lists/:id/items',
      input: z.object({
        categoryIndex: z.number(),
        itemIndex: z.number(),
        checked: z.boolean()
      }),
      responses: {
        200: z.custom<typeof shoppingLists.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE EXPORTS
// ============================================
export type CreateMealPlanInput = z.infer<typeof api.mealPlans.create.input>;
export type MealPlanResponse = z.infer<typeof api.mealPlans.get.responses[200]>;
