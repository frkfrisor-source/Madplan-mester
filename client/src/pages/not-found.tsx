import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">Siden blev ikke fundet</h1>
        <p className="text-muted-foreground text-lg max-w-md mb-8">
          Vi kunne ikke finde den side du ledte efter. Måske er opskriften blevet væk?
        </p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Gå til forsiden
        </Link>
      </div>
    </Layout>
  );
}
