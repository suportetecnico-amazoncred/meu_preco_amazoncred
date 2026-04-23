import { useState, useEffect } from "react";
import { Calculator, Sun, Moon } from "lucide-react";
import PricingCalculator from "./components/PricingCalculator";
import { Button } from "./components/ui/button";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calculator className="w-8 h-8 text-primary" />
              Meu Preço
            </h1>
            <p className="text-muted-foreground">Calculadora de Precificação para Produtos</p>
          </div>
          <div className="absolute top-0 right-0 md:relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full hover:bg-primary/10 text-foreground"
              title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        <main>
          <PricingCalculator />
        </main>

        <footer className="pt-2 pb-6 text-center text-muted-foreground text-xs">
          <p>© {new Date().getFullYear()} Meu Preço - Amazoncred</p>
        </footer>
      </div>
    </div>
  );
}