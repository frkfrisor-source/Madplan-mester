import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register AI integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // --- Meal Plan Routes ---

  app.post(api.mealPlans.create.path, async (req, res) => {
    try {
      const input = api.mealPlans.create.input.parse(req.body);
      const preferences = input.preferences;

      // 1. Create the Meal Plan record first
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + preferences.days);

      const mealPlan = await storage.createMealPlan({
        userId: "demo-user", // Placeholder
        startDate,
        endDate,
        dietaryPreferences: preferences,
      });

      // 2. Generate content using OpenAI (async but we await for this MVP simplicity)
      // In a real production app, this should be a background job.
      
      const prompt = `
        Du er en erfaren dansk kok og ernæringsekspert. Lav en madplan for ${preferences.days} dage til en person med følgende præferencer:
        - Vegansk: ${preferences.isVegan ? 'Ja' : 'Nej'}
        - Vegetarisk: ${preferences.isVegetarian ? 'Ja' : 'Nej'}
        - Glutenfri: ${preferences.isGlutenFree ? 'Ja' : 'Nej'}
        - Allergier: ${preferences.allergies.join(', ') || 'Ingen'}
        - Antal portioner: ${preferences.servings}

        Formatér svaret som JSON med følgende struktur:
        {
          "meals": [
            {
              "day": 1, // dagnummer 1 til ${preferences.days}
              "type": "breakfast" | "lunch" | "dinner",
              "name": "Navn på retten",
              "description": "Kort beskrivelse",
              "ingredients": ["ingrediens 1", "ingrediens 2"],
              "instructions": "Korte instruktioner",
              "estimatedTime": 30 // minutter
            }
          ],
          "shoppingList": [
            {
              "category": "Frugt og Grønt" | "Mejeri" | "Kød" | "Kolonial" | "Andet",
              "items": [
                { "name": "Varenavn", "amount": "Mængde (f.eks. 500g)" }
              ]
            }
          ]
        }
        
        Vigtigt: 
        1. Svar KUN med JSON. 
        2. Alle tekster SKAL være på dansk.
        3. Lav 3 måltider per dag (morgenmad, frokost, aftensmad).
      `;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [
            { role: "system", content: "Du er en hjælpsom assistent der genererer madplaner som JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");
        
        const generatedData = JSON.parse(content);

        // 3. Store generated meals
        const mealsToInsert = generatedData.meals.map((m: any) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + (m.day - 1));
            return {
                mealPlanId: mealPlan.id,
                date: date,
                type: m.type,
                name: m.name,
                description: m.description,
                ingredients: m.ingredients,
                instructions: m.instructions,
                estimatedTime: m.estimatedTime
            };
        });
        
        await storage.createMeals(mealsToInsert);

        // 4. Store shopping list
        const shoppingListItems = generatedData.shoppingList.map((cat: any) => ({
            category: cat.category,
            items: cat.items.map((item: any) => ({ ...item, checked: false }))
        }));

        await storage.createShoppingList({
            mealPlanId: mealPlan.id,
            items: shoppingListItems
        });

        res.status(201).json({
          mealPlanId: mealPlan.id,
          status: 'complete'
        });

      } catch (aiError) {
        console.error("OpenAI Error:", aiError);
        // Even if AI fails, we return the plan ID (user might retry or we handle status)
        res.status(201).json({
             mealPlanId: mealPlan.id, 
             status: 'failed',
             message: 'Kunne ikke generere madplan lige nu.' 
        });
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.mealPlans.get.path, async (req, res) => {
    const planId = parseInt(req.params.id);
    const plan = await storage.getMealPlan(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const meals = await storage.getMealsByPlanId(planId);
    const shoppingList = await storage.getShoppingListByPlanId(planId);

    res.json({
      plan,
      meals,
      shoppingList
    });
  });

  app.get(api.mealPlans.list.path, async (req, res) => {
      const plans = await storage.getMealPlans("demo-user");
      res.json(plans);
  });

  app.patch(api.shoppingLists.updateItem.path, async (req, res) => {
    try {
        const listId = parseInt(req.params.id);
        const { categoryIndex, itemIndex, checked } = req.body;
        
        const list = await storage.getShoppingList(listId);
        if (!list) {
            return res.status(404).json({ message: 'Shopping list not found' });
        }

        // Deep clone items to avoid mutation issues (though not strictly necessary with simple objects)
        const items = JSON.parse(JSON.stringify(list.items));

        if (items[categoryIndex] && items[categoryIndex].items[itemIndex]) {
            items[categoryIndex].items[itemIndex].checked = checked;
            const updatedList = await storage.updateShoppingList(listId, items);
            res.json(updatedList);
        } else {
            res.status(400).json({ message: 'Invalid item index' });
        }
    } catch (err) {
        console.error("Update shopping list error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
