import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useMealPlans } from "@/hooks/use-meal-plans";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { ArrowRight, Plus, ChefHat, CalendarDays, Loader2 } from "lucide-react";

export default function Home() {
  const { data: mealPlans, isLoading } = useMealPlans();

  return (
    <Layout>
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
          Din Madplan
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Få personlige madplaner og indkøbslister genereret med kunstig intelligens, skræddersyet til dine præferencer.
        </p>
      </header>

      {/* Hero Action Card */}
      <Link href="/create" className="group block mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground shadow-xl shadow-primary/20 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-4 text-primary-foreground/90">
                <ChefHat className="w-4 h-4" />
                <span>AI Powered</span>
              </div>
              <h2 className="text-3xl font-display font-bold mb-2">Opret ny madplan</h2>
              <p className="text-primary-foreground/80 max-w-md">
                Vælg dine præferencer, allergier og antal dage, så klarer vi resten.
              </p>
            </div>
            <div className="bg-white text-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 group-hover:bg-white/90 transition-colors">
              Start nu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        </div>
      </Link>

      {/* Previous Plans */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground">Dine Madplaner</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : !mealPlans || mealPlans.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-card/50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Ingen madplaner endnu</h3>
            <p className="text-muted-foreground mb-6">Opret din første madplan for at komme i gang.</p>
            <Link href="/create" className="text-primary font-medium hover:underline">
              Opret nu &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <Link key={plan.id} href={`/plan/${plan.id}`}>
                <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      {(plan.dietaryPreferences as any).days} dage
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(plan.createdAt || new Date()), "d. MMM yyyy", { locale: da })}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                    Madplan #{plan.id}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mt-auto pt-4">
                    {(plan.dietaryPreferences as any).isVegan && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">Vegansk</span>
                    )}
                    {(plan.dietaryPreferences as any).isVegetarian && (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Vegetarisk</span>
                    )}
                    {(plan.dietaryPreferences as any).isGlutenFree && (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Glutenfri</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
