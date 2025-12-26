import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCreateMealPlan } from "@/hooks/use-meal-plans";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { ArrowLeft, Loader2, Leaf, WheatOff, Users, Calendar, AlertCircle, Plus, ChefHat } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Schema for the form
const formSchema = api.mealPlans.create.input;
type FormValues = z.infer<typeof formSchema>;

export default function CreatePlan() {
  const { mutate, isPending } = useCreateMealPlan();
  const [allergiesInput, setAllergiesInput] = useState("");
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferences: {
        isVegan: false,
        isVegetarian: false,
        isGlutenFree: false,
        allergies: [],
        servings: 2,
        days: 7,
      }
    }
  });

  const preferences = watch("preferences");

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  const handleAddAllergy = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allergiesInput.trim()) {
      e.preventDefault();
      const current = preferences.allergies || [];
      if (!current.includes(allergiesInput.trim())) {
        setValue("preferences.allergies", [...current, allergiesInput.trim()]);
      }
      setAllergiesInput("");
    }
  };

  const removeAllergy = (allergy: string) => {
    const current = preferences.allergies || [];
    setValue("preferences.allergies", current.filter(a => a !== allergy));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Tilbage til oversigt
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Design din uge
          </h1>
          <p className="text-muted-foreground mt-2">
            Fortæl os hvad du kan lide, så skaber vi en plan.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Dietary Section */}
          <section className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Kost & Præferencer
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                preferences.isVegan ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50"
              )}>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={preferences.isVegan}
                  onChange={(e) => {
                    setValue("preferences.isVegan", e.target.checked);
                    if(e.target.checked) setValue("preferences.isVegetarian", true);
                  }}
                />
                Vegansk
              </label>

              <label className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                preferences.isVegetarian ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50"
              )}>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={preferences.isVegetarian}
                  onChange={(e) => {
                    setValue("preferences.isVegetarian", e.target.checked);
                    if(!e.target.checked) setValue("preferences.isVegan", false);
                  }}
                />
                Vegetarisk
              </label>

              <label className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                preferences.isGlutenFree ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/50"
              )}>
                <input 
                  type="checkbox" 
                  className="hidden"
                  {...register("preferences.isGlutenFree")}
                />
                <WheatOff className="w-4 h-4" />
                Glutenfri
              </label>
            </div>
          </section>

          {/* Logistics Section */}
          <section className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Servings */}
              <div>
                <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Antal personer
                </h2>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    {...register("preferences.servings", { valueAsNumber: true })}
                  />
                  <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-xl font-bold font-display text-lg">
                    {preferences.servings}
                  </div>
                </div>
              </div>

              {/* Days */}
              <div>
                <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Antal dage
                </h2>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="14" 
                    className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    {...register("preferences.days", { valueAsNumber: true })}
                  />
                  <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-xl font-bold font-display text-lg">
                    {preferences.days}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Allergies Section */}
          <section className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Allergier & Undtagelser
            </h2>
            
            <div className="relative">
              <input
                type="text"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                onKeyDown={handleAddAllergy}
                placeholder="Skriv og tryk Enter (f.eks. 'Nødder')"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (allergiesInput.trim()) {
                    const current = preferences.allergies || [];
                    setValue("preferences.allergies", [...current, allergiesInput.trim()]);
                    setAllergiesInput("");
                  }
                }}
                className="absolute right-2 top-2 p-1.5 bg-secondary hover:bg-primary hover:text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {preferences.allergies && preferences.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {preferences.allergies.map((allergy) => (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={allergy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium"
                  >
                    {allergy}
                    <button 
                      type="button" 
                      onClick={() => removeAllergy(allergy)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      &times;
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Indtast ingredienser du vil undgå. Tryk Enter efter hver.
            </p>
          </section>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 ease-out flex items-center justify-center gap-3"
          >
            {isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Genererer Madplan...
              </>
            ) : (
              <>
                <ChefHat className="w-6 h-6" />
                Opret Madplan
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
