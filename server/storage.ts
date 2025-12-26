import { db } from "./db";
import { 
  mealPlans, meals, shoppingLists,
  type MealPlan, type InsertMealPlan, 
  type Meal, type InsertMeal,
  type ShoppingList,
  type CreateMealPlanRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Meal Plans
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  getMealPlans(userId: string): Promise<MealPlan[]>;
  
  // Meals
  createMeals(mealsData: InsertMeal[]): Promise<Meal[]>;
  getMealsByPlanId(planId: number): Promise<Meal[]>;
  
  // Shopping Lists
  createShoppingList(list: { mealPlanId: number, items: any }): Promise<ShoppingList>;
  getShoppingListByPlanId(planId: number): Promise<ShoppingList | undefined>;
  getShoppingList(id: number): Promise<ShoppingList | undefined>;
  updateShoppingList(id: number, items: any): Promise<ShoppingList>;
}

export class DatabaseStorage implements IStorage {
  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    const [newPlan] = await db.insert(mealPlans).values(plan).returning();
    return newPlan;
  }

  async getMealPlan(id: number): Promise<MealPlan | undefined> {
    const [plan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return plan;
  }
  
  async getMealPlans(userId: string): Promise<MealPlan[]> {
      // Simple implementation - in real app would filter by user
      return db.select().from(mealPlans).orderBy(desc(mealPlans.createdAt));
  }

  async createMeals(mealsData: InsertMeal[]): Promise<Meal[]> {
    return await db.insert(meals).values(mealsData).returning();
  }

  async getMealsByPlanId(planId: number): Promise<Meal[]> {
    return await db.select().from(meals).where(eq(meals.mealPlanId, planId));
  }

  async createShoppingList(list: { mealPlanId: number, items: any }): Promise<ShoppingList> {
    const [newList] = await db.insert(shoppingLists).values(list).returning();
    return newList;
  }

  async getShoppingListByPlanId(planId: number): Promise<ShoppingList | undefined> {
    const [list] = await db.select().from(shoppingLists).where(eq(shoppingLists.mealPlanId, planId));
    return list;
  }

  async getShoppingList(id: number): Promise<ShoppingList | undefined> {
    const [list] = await db.select().from(shoppingLists).where(eq(shoppingLists.id, id));
    return list;
  }

  async updateShoppingList(id: number, items: any): Promise<ShoppingList> {
    const [updated] = await db.update(shoppingLists)
      .set({ items })
      .where(eq(shoppingLists.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
