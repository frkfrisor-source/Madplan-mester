import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <Navigation />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:pt-24 pb-24 md:pb-12 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
