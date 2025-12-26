import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { MealCard } from "@/components/MealCard";
import { useMealPlan, useUpdateShoppingItem } from "@/hooks/use-meal-plans";
import { format, addDays } from "date-fns";
import { da } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CalendarDays, ShoppingCart, CheckCircle2, Circle, ArrowLeft, Share2 } from "lucide-react";
import { type Meal } from "@shared/schema";

export default function PlanDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const planId = parseInt(id || "0");
  const { data, isLoading, error } = useMealPlan(planId);
  const updateItem = useUpdateShoppingItem();
  
  const [activeTab, setActiveTab] = useState<'meals' | 'shopping'>('meals');

  if (isLoading || (data && data.meals.length === 0)) {
    return (
      <Layout>
        <LoadingState message="Vi sammensætter din menu..." />
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Der opstod en fejl</h2>
          <button onClick={() => setLocation("/")} className="text-primary hover:underline">
            Gå til forsiden
          </button>
        </div>
      </Layout>
    );
  }

  const { plan, meals, shoppingList } = data;

  // Group meals by date
  const mealsByDate = meals.reduce((acc, meal) => {
    // Ensure date is handled consistently. 
    // Backend sends ISO strings, but Drizzle/pg might auto-convert. 
    // Safest to just take the YYYY-MM-DD part or use format
    const dateKey = format(new Date(meal.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  // Sort dates
  const sortedDates = Object.keys(mealsByDate).sort();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Tilbage
            </button>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Din Ugeplan
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(plan.startDate), "d. MMM", { locale: da })} - {format(new Date(plan.endDate), "d. MMM yyyy", { locale: da })}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('meals')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                activeTab === 'meals' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Madplan
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                activeTab === 'shopping' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              Indkøb
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'meals' ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {sortedDates.map((dateStr, index) => {
              const date = new Date(dateStr);
              const dayMeals = mealsByDate[dateStr].sort((a, b) => {
                const order = { breakfast: 1, lunch: 2, snack: 3, dinner: 4 };
                return (order[a.type as keyof typeof order] || 99) - (order[b.type as keyof typeof order] || 99);
              });
              
              const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

              return (
                <div key={dateStr} className="scroll-mt-24" id={`day-${index}`}>
                  <div className="flex items-center gap-4 mb-4 sticky top-16 md:top-24 bg-background/95 backdrop-blur-sm z-10 py-4 border-b border-dashed border-border/50">
                    <div className={cn(
                      "flex flex-col items-center justify-center w-12 h-14 rounded-xl border",
                      isToday ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-card text-foreground border-border"
                    )}>
                      <span className="text-xs font-medium uppercase">{format(date, 'EEE', { locale: da })}</span>
                      <span className="text-xl font-bold font-display">{format(date, 'd')}</span>
                    </div>
                    <h2 className="text-xl font-bold font-display">
                      {format(date, 'EEEE', { locale: da })}
                      {isToday && <span className="ml-2 text-sm font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">I dag</span>}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {dayMeals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-right-4 duration-500">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-secondary/20">
                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Indkøbsliste
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Alt hvad du skal bruge til denne uge.
                </p>
              </div>

              {!shoppingList || (shoppingList.items as any[]).length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  Ingen varer på listen endnu.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {(shoppingList.items as any[]).map((categoryGroup, catIndex) => (
                    <div key={categoryGroup.category} className="p-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                        {categoryGroup.category}
                      </h3>
                      <ul className="space-y-3">
                        {categoryGroup.items.map((item: any, itemIndex: number) => (
                          <li key={`${catIndex}-${itemIndex}`} className="flex items-start gap-3 group">
                            <button 
                              onClick={() => {
                                if (shoppingList) {
                                  updateItem.mutate({
                                    listId: shoppingList.id,
                                    categoryIndex: catIndex,
                                    itemIndex: itemIndex,
                                    checked: !item.checked
                                  });
                                }
                              }}
                              className={cn(
                                "mt-0.5 transition-colors",
                                item.checked ? "text-primary" : "text-muted-foreground hover:text-primary"
                              )}
                            >
                              {item.checked ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>
                            <span className={cn(
                              "flex-1 text-base transition-all",
                              item.checked ? "text-muted-foreground line-through decoration-border" : "text-foreground"
                            )}>
                              {item.name}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                              {item.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
