import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator, Clock, Package, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ExpenseRow {
  id: string;
  nome: string;
  valor: number;
}

export default function PricingCalculator() {
  // Labor State
  const [ganhoDesejado, setGanhoDesejado] = useState<number>(1621);
  const [ganhoDesejadoDisplay, setGanhoDesejadoDisplay] = useState('1621,00');
  const [horasPorDia, setHorasPorDia] = useState<number>(0);
  const [diasPorMes, setDiasPorMes] = useState<number>(0);
  
  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [currentExpenseName, setCurrentExpenseName] = useState('');
  const [currentExpenseValue, setCurrentExpenseValue] = useState<number | ''>('');
  const [currentExpenseDisplay, setCurrentExpenseDisplay] = useState('');

  // Extra Costs & Margin
  const [custosExtras, setCustosExtras] = useState<number>(0);
  const [custosExtrasDisplay, setCustosExtrasDisplay] = useState('0,00');
  const [tempoPreparo, setTempoPreparo] = useState<number>(0);
  const [margemLucro, setMargemLucro] = useState<number>(35);

  // Calculations
  const totalHorasMensais = useMemo(() => {
    return horasPorDia * diasPorMes;
  }, [horasPorDia, diasPorMes]);

  const valorHora = useMemo(() => {
    if (totalHorasMensais <= 0) return 0;
    return ganhoDesejado / totalHorasMensais;
  }, [ganhoDesejado, totalHorasMensais]);

  const custoMateriais = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.valor, 0);
  }, [expenses]);

  const custoMaoDeObra = useMemo(() => {
    return valorHora * tempoPreparo;
  }, [valorHora, tempoPreparo]);

  const custoTotal = custoMateriais + custosExtras + custoMaoDeObra;
  
  const precoVenda = useMemo(() => {
    const margemDecimal = margemLucro / 100;
    // Evita divisão por zero ou valores negativos se a margem for 100% ou mais
    if (margemDecimal >= 1) {
      return custoTotal * (1 + margemDecimal); // Fallback para o cálculo antigo se margem >= 100%
    }
    return custoTotal / (1 - margemDecimal);
  }, [custoTotal, margemLucro]);

  // Handlers
  const addExpense = () => {
    if (!currentExpenseName || !currentExpenseValue) return;
    setExpenses([...expenses, { 
      id: crypto.randomUUID(), 
      nome: currentExpenseName, 
      valor: Number(currentExpenseValue) 
    }]);
    setCurrentExpenseName('');
    setCurrentExpenseValue('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Inputs Column */}
      <div className="lg:col-span-2 space-y-8">
        {/* 1. Mão de Obra */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              1. Mão de Obra
            </CardTitle>
            <CardDescription>Defina o valor do seu tempo de trabalho.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Meta de Ganho Mensal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                <Input 
                  type="text" 
                  placeholder="0,00" 
                  value={ganhoDesejadoDisplay} 
                  onChange={e => {
                    const val = e.target.value.replace(',', '.');
                    if (val === '' || !isNaN(Number(val))) {
                      setGanhoDesejadoDisplay(e.target.value);
                      setGanhoDesejado(val === '' ? 0 : Number(val));
                    }
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horas por Dia</Label>
              <Input 
                type="number" 
                placeholder="Ex: 8" 
                value={horasPorDia || ''} 
                onChange={e => setHorasPorDia(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Dias por Mês</Label>
              <Input 
                type="number" 
                placeholder="Ex: 22" 
                value={diasPorMes || ''} 
                onChange={e => setDiasPorMes(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-3 p-3 bg-slate-50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Total de Horas: {totalHorasMensais}h/mês</span>
                <span className="text-sm text-slate-500">Valor da sua hora calculada:</span>
              </div>
              <span className="font-bold text-primary text-lg">{valorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Gastos com Materiais */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              2. Gastos com Materiais
            </CardTitle>
            <CardDescription>Adicione os materiais e valores gastos para este produto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Form */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">O que você usou?</Label>
                  <Input 
                    placeholder="Ex: Tecido, Linha, Botão..." 
                    value={currentExpenseName} 
                    onChange={e => setCurrentExpenseName(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Quanto custou?</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                      <Input 
                        type="text" 
                        placeholder="0,00" 
                        value={currentExpenseDisplay} 
                        onChange={e => {
                          const val = e.target.value.replace(',', '.');
                          if (val === '' || !isNaN(Number(val))) {
                            setCurrentExpenseDisplay(e.target.value);
                            setCurrentExpenseValue(val === '' ? '' : Number(val));
                          }
                        }}
                        className="bg-white pl-9"
                      />
                    </div>
                    <Button onClick={() => {
                      addExpense();
                      setCurrentExpenseDisplay('');
                    }} className="shrink-0" disabled={!currentExpenseName || currentExpenseValue === ''}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Items */}
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400">Nenhum material adicionado ainda.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {expenses.map((row) => (
                    <div key={row.id} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{row.nome}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Material</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-900">
                          {row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeExpense(row.id)}
                          className="text-slate-300 hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Extras e Margem */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              3. Tempo e Lucro
            </CardTitle>
            <CardDescription>Adicione o tempo de produção e sua margem de lucro.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tempo de Preparo (Horas)</Label>
              <Input 
                type="number" 
                step="0.1"
                placeholder="Ex: 1.5" 
                value={tempoPreparo || ''} 
                onChange={e => setTempoPreparo(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Custos Extras</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                <Input 
                  type="text" 
                  placeholder="0,00" 
                  value={custosExtrasDisplay} 
                  onChange={e => {
                    const val = e.target.value.replace(',', '.');
                    if (val === '' || !isNaN(Number(val))) {
                      setCustosExtrasDisplay(e.target.value);
                      setCustosExtras(val === '' ? 0 : Number(val));
                    }
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Margem de Lucro (%)</Label>
              <Input 
                type="number" 
                placeholder="Ex: 100" 
                value={margemLucro || ''} 
                onChange={e => setMargemLucro(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Column */}
      <div className="space-y-6">
        <Card className="bg-slate-900 text-white border-none shadow-xl sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calculator className="w-6 h-6" />
              Resultado Final
            </CardTitle>
            <CardDescription className="text-slate-400">Cálculo em tempo real do seu produto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total em Materiais:</span>
                <span>{custoMateriais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Mão de Obra ({tempoPreparo}h):</span>
                <span>{custoMaoDeObra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Custos Extras:</span>
                <span>{custosExtras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Custo de Produção:</span>
                <span className="text-xl font-bold">{custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            <div className="p-6 bg-primary rounded-2xl space-y-2 text-center">
              <p className="text-xs uppercase font-black tracking-widest text-primary-foreground/80">Preço de Venda Sugerido</p>
              <h2 className="text-4xl font-black text-primary-foreground">
                {precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h2>
              <p className="text-[10px] text-primary-foreground/60">Lucro Bruto: {(precoVenda - custoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({margemLucro}%)</p>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Resumo das Fórmulas</h4>
              <div className="space-y-2 text-[10px] font-mono opacity-60">
                <p>• Mão de Obra = (Ganho / Horas Mês) * Tempo</p>
                <p>• Preço = Custo Total / (1 - Margem/100)</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
