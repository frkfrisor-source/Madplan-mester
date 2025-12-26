import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conversations, messages } from "./models/chat";

// Export chat models for integration
export { conversations, messages };

// === TABLE DEFINITIONS ===

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // For now, we'll just store a session ID or similar
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  dietaryPreferences: jsonb("dietary_preferences").$type<{
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    allergies: string[];
    servings: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull().references(() => mealPlans.id),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  name: text("name").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").$type<string[]>().notNull(),
  instructions: text("instructions"), // Could be markdown
  estimatedTime: integer("estimated_time"), // minutes
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull().references(() => mealPlans.id),
  items: jsonb("items").$type<{
    category: string;
    items: { name: string; amount: string; checked: boolean }[];
  }[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ 
  id: true, 
  createdAt: true 
});

export const insertMealSchema = createInsertSchema(meals).omit({ 
  id: true 
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({ 
  id: true, 
  createdAt: true 
});


// === EXPLICIT API CONTRACT TYPES ===

export type MealPlan = typeof mealPlans.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type ShoppingList = typeof shoppingLists.$inferSelect;

export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type CreateMealPlanRequest = {
  preferences: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    allergies: string[];
    servings: number;
    days: number; // How many days to generate
  };
};

export type MealPlanResponse = {
  plan: MealPlan;
  meals: Meal[];
  shoppingList?: ShoppingList;
};

export type GeneratePlanResponse = {
  mealPlanId: number;
  status: 'processing' | 'complete' | 'failed';
  message?: string;
};
