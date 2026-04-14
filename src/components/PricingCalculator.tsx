import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator, Clock, Package, TrendingUp, Target, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Separator } from "@/components/ui/separator";

interface ExpenseRow {
  id: string;
  nome: string;
  valor: number;
}

export default function PricingCalculator() {
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Labor State
  const [ganhoDesejado, setGanhoDesejado] = useState<number>(0);
  const [ganhoDesejadoDisplay, setGanhoDesejadoDisplay] = useState('0,00');
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
  const [margemLucro, setMargemLucro] = useState<number>(10);

  // Yield State
  const [quantidadeProduzida, setQuantidadeProduzida] = useState<number>(0);

  // Idea 3: Break-even Point State
  const [custosFixosMensais, setCustosFixosMensais] = useState<number>(0);
  const [custosFixosDisplay, setCustosFixosDisplay] = useState('0,00');

  const [isResetting, setIsResetting] = useState(false);

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
  
  const precoVendaTotal = useMemo(() => {
    const margemDecimal = margemLucro / 100;
    return custoTotal * (1 + margemDecimal);
  }, [custoTotal, margemLucro]);

  const precoVendaUnitario = useMemo(() => {
    return precoVendaTotal / (quantidadeProduzida || 1);
  }, [precoVendaTotal, quantidadeProduzida]);

  const lucroTotal = precoVendaTotal - custoTotal;
  const lucroUnitario = lucroTotal / (quantidadeProduzida || 1);

  // Idea 3: Break-even Calculation
  const pontoEquilibrio = useMemo(() => {
    if (lucroUnitario <= 0) return 0;
    return Math.ceil(custosFixosMensais / lucroUnitario);
  }, [custosFixosMensais, lucroUnitario]);

  // Handlers
  const addExpense = () => {
    if (!currentExpenseName || currentExpenseValue === '') return;
    setExpenses([...expenses, { 
      id: crypto.randomUUID(), 
      nome: currentExpenseName, 
      valor: Number(currentExpenseValue) 
    }]);
    setCurrentExpenseName('');
    setCurrentExpenseValue('');
    setCurrentExpenseDisplay('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const resetCalculator = () => {
    setIsResetting(true);
    setGanhoDesejado(0);
    setGanhoDesejadoDisplay('0,00');
    setHorasPorDia(0);
    setDiasPorMes(0);
    setExpenses([]);
    setCurrentExpenseName('');
    setCurrentExpenseValue('');
    setCurrentExpenseDisplay('');
    setCustosExtras(0);
    setCustosExtrasDisplay('0,00');
    setTempoPreparo(0);
    setMargemLucro(10);
    setQuantidadeProduzida(0);
    setCustosFixosMensais(0);
    setCustosFixosDisplay('0,00');
    
    // Reset the animation state after a short delay
    setTimeout(() => setIsResetting(false), 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Inputs Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Mão de Obra */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
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
          </motion.div>

          {/* 2. Gastos com Materiais */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  2. Gastos com Materiais
                </CardTitle>
                <CardDescription>Adicione os materiais e valores gastos para este produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        <Button onClick={addExpense} className="shrink-0" disabled={!currentExpenseName || currentExpenseValue === ''}>
                          <Plus className="w-4 h-4 mr-2" /> Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {expenses.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-xs text-slate-400">Nenhum material adicionado ainda.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      <AnimatePresence initial={false}>
                        {expenses.map((row) => (
                          <motion.div 
                            key={row.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors"
                          >
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
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. Tempo, Custos Fixos e Margem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  3. Custos e Metas
                </CardTitle>
                <CardDescription>Custos fixos ajudam a calcular o ponto de equilíbrio.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Tempo de Produção (h)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 1.5" 
                    value={tempoPreparo || ''} 
                    onChange={e => setTempoPreparo(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custos Extras (Unid)</Label>
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
                  <Label>Custos Fixos (Mês)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                    <Input 
                      type="text" 
                      placeholder="Ex: Aluguel" 
                      value={custosFixosDisplay} 
                      onChange={e => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || !isNaN(Number(val))) {
                          setCustosFixosDisplay(e.target.value);
                          setCustosFixosMensais(val === '' ? 0 : Number(val));
                        }
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Margem Lucro (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 35" 
                    value={margemLucro || ''} 
                    onChange={e => setMargemLucro(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Result Column */}
        <div className="space-y-6">
          <motion.div 
            ref={resultCardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-slate-900 text-white border-none shadow-xl">
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
                    <span className="text-slate-400 font-medium">Custo de Produção Total:</span>
                    <span className="text-xl font-bold">{custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>

                <div className="p-6 bg-primary rounded-2xl space-y-4 text-center">
                  <div>
                    <p className="text-xs uppercase font-black tracking-widest text-primary-foreground/80">Preço de Venda Total (Lote)</p>
                    <h2 className="text-4xl font-black text-primary-foreground">
                      {precoVendaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h2>
                  </div>
                  
                  <Separator className="bg-primary-foreground/20" />

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-primary-foreground/70">Quantidade Produzida (Rendimento)</Label>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="Ex: 50"
                      value={quantidadeProduzida || ''}
                      onChange={e => setQuantidadeProduzida(Number(e.target.value))}
                      className="bg-white/10 border-white/20 text-white text-center h-8 focus:bg-white/20"
                    />
                  </div>

                  <div className="pt-2">
                    <p className="text-xs uppercase font-black tracking-widest text-primary-foreground/80">Preço por Unidade</p>
                    <h3 className="text-2xl font-black text-secondary">
                      {precoVendaUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-[10px] text-primary-foreground/60">Lucro por Unid: {lucroUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({margemLucro}%)</p>
                  </div>
                </div>

                {/* Idea 3: Break-even Point UI */}
                {custosFixosMensais > 0 && (
                  <div className="p-4 bg-slate-800/50 border border-white/5 rounded-xl flex items-center gap-3">
                    <Target className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Meta de Vendas</p>
                      <p className="text-sm">Venda <span className="text-secondary font-bold">{pontoEquilibrio} unidades</span> para pagar seus custos fixos.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Resumo das Fórmulas</h4>
                  <div className="space-y-2 text-[10px] font-mono opacity-60">
                    <p>• Mão de Obra = (Ganho / Horas Mês) * Tempo</p>
                    <p>• Preço Total = Custo Total * (1 + Margem/100)</p>
                    <p>• Preço Unitário = Preço Total / Quantidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="border-none shadow-sm bg-white p-4">
              <Button 
                onClick={resetCalculator} 
                variant="outline" 
                className="w-full text-slate-500 hover:text-destructive hover:bg-destructive/5 border-slate-200"
              >
                <motion.div
                  animate={{ rotate: isResetting ? -360 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="mr-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.div>
                Zerar Calculadora
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
