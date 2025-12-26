import { Link, useLocation } from "wouter";
import { Home, Plus, ShoppingCart, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border/50 z-50 pb-safe md:top-0 md:bottom-auto md:border-b md:border-t-0 md:pb-0">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-around md:justify-end md:gap-8 h-16 items-center">
          
          <div className="hidden md:flex mr-auto items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary">Madplan.ai</span>
          </div>

          <Link href="/" className={cn(
            "flex flex-col items-center justify-center w-16 h-full md:flex-row md:w-auto md:gap-2 transition-colors duration-200",
            isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Home className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] font-medium mt-1 md:mt-0 md:text-sm">Hjem</span>
          </Link>

          <Link href="/create" className={cn(
            "flex flex-col items-center justify-center w-16 h-full md:flex-row md:w-auto md:gap-2 transition-colors duration-200",
            isActive("/create") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <div className={cn(
              "p-2 rounded-xl transition-all",
              isActive("/create") ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground"
            )}>
              <Plus className="w-6 h-6 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] font-medium mt-1 md:hidden">Ny Plan</span>
            <span className="hidden md:inline font-medium text-sm">Ny Madplan</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
