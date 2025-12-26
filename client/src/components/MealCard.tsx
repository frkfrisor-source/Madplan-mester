import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, Leaf, WheatOff, Drumstick } from "lucide-react";
import { type Meal } from "@shared/schema";
import { format } from "date-fns";
import { da } from "date-fns/locale";

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return "☕️";
      case 'lunch': return "🥗";
      case 'dinner': return "🍽️";
      case 'snack': return "🍎";
      default: return "🍴";
    }
  };

  const translateType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return "Morgenmad";
      case 'lunch': return "Frokost";
      case 'dinner': return "Aftensmad";
      case 'snack': return "Mellemmåltid";
      default: return type;
    }
  };

  return (
    <motion.div 
      layout
      className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer flex items-start gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl shadow-inner">
          {getMealIcon(meal.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {translateType(meal.type)}
            </span>
            <div className="h-px flex-1 bg-border/60" />
            {meal.estimatedTime && (
              <span className="flex items-center text-xs text-muted-foreground gap-1">
                <Clock className="w-3 h-3" />
                {meal.estimatedTime} min
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold font-display text-foreground leading-tight truncate">
            {meal.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {meal.description || "Ingen beskrivelse"}
          </p>
        </div>

        <button 
          className="text-muted-foreground hover:text-foreground transition-colors mt-2"
          aria-label={isExpanded ? "Luk" : "Åbn"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50 bg-secondary/30"
          >
            <div className="p-4 space-y-4">
              {meal.instructions && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-primary">Fremgangsmåde</h4>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {meal.instructions}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-sm mb-2 text-primary">Ingredienser</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(meal.ingredients as string[]).map((ingredient, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2 text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
