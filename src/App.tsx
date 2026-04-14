import { Calculator } from "lucide-react";
import PricingCalculator from "./components/PricingCalculator";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-primary" />
              Meu Preço
            </h1>
            <p className="text-slate-500">Calculadora de Precificação para Produtos</p>
          </div>
        </header>

        <main>
          <PricingCalculator />
        </main>

        <footer className="pt-12 pb-6 text-center text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} Meu Preço - Ferramenta de Apoio ao Pequeno Negócio</p>
        </footer>
      </div>
    </div>
  );
}