import { motion } from "framer-motion";

export function LoadingState({ message = "Arbejder..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 border-4 border-muted rounded-full"
        />
        <motion.div
          className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🥕</span>
        </div>
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-medium text-muted-foreground font-display"
      >
        {message}
      </motion.p>
    </div>
  );
}
