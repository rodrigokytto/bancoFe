import { createPortal } from "react-dom";
import React, { useState } from "react";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  X,
  Building2,
  Scale,
  Home,
  PieChart,
  Landmark,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

export interface SimuladorProps {
  isOpen: boolean;
  onClose: () => void;
  initialCriterio?: string;
}

export const SimuladorSerendipidadeModal: React.FC<SimuladorProps> = ({
  isOpen,
  onClose,
  initialCriterio = "credito"
}) => {
  const [criterioAtivo, setCriterioAtivo] = useState<string>(initialCriterio);
  const [isSimulando, setIsSimulando] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState<string | null>(null);

  // Estados dos Sliders do Simulador de Carteira
  const [volumeCarteira, setVolumeCarteira] = useState<number>(29430000); // R$ 29,43M
  const [taxaJurosMensal, setTaxaJurosMensal] = useState<number>(1.85); // 1.85% a.m.
  const [prazoMeses, setPrazoMeses] = useState<number>(36); // 36 meses
  const [ltvMedio, setLtvMedio] = useState<number>(58); // 58% LTV Casa Nova

  // Cálculos em tempo real
  const receitaMensalJuros = volumeCarteira * (taxaJurosMensal / 100);
  const receitaTotalPeriodo = receitaMensalJuros * prazoMeses;
  const spreadHolding = volumeCarteira * 0.008; // 0.8% a.m. spread líquido

  if (!isOpen) return null;

  const handleDispararComite = () => {
    setIsSimulando(true);
    setTimeout(() => {
      setIsSimulando(false);
      setPlanoAtivo(criterioAtivo);
      toast.success("Parâmetros da Mesa de Crédito enviados ao Comitê Executivo BancoFé!", {
        description: `Carteira de R$ ${(volumeCarteira / 1e6).toFixed(2)}M com taxa de ${taxaJurosMensal}% a.m. homologada.`,
      });
    }, 600);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#071510] text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight">Simulador Executivo da Mesa de Crédito</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  SCR Bacen
                </span>
              </div>
              <p className="text-xs text-white/60">Holding BancoFé S/A · CNPJ: 53.338.003/0001-04</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Critério */}
        <div className="px-6 py-2.5 bg-[var(--surface2)]/50 border-b border-[var(--line)] flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setCriterioAtivo("credito")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              criterioAtivo === "credito"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)]"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Mesa de Crédito (31 Ops)</span>
          </button>
          <button
            onClick={() => setCriterioAtivo("casanova")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              criterioAtivo === "casanova"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)]"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Casa Nova Imóveis (20 Proponentes)</span>
          </button>
          <button
            onClick={() => setCriterioAtivo("funding")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              criterioAtivo === "funding"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)]"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Funding &amp; Spread Holding</span>
          </button>
        </div>

        {/* Conteúdo do Simulador */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Grid de Sliders de Simulação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Slider 1: Volume da Carteira */}
            <div className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Volume da Carteira Ativa</span>
                <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                  R$ {(volumeCarteira / 1e6).toFixed(2)}M
                </span>
              </div>
              <input
                type="range"
                min="5000000"
                max="60000000"
                step="500000"
                value={volumeCarteira}
                onChange={(e) => setVolumeCarteira(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>R$ 5,0M</span>
                <span>R$ 30,0M</span>
                <span>R$ 60,0M</span>
              </div>
            </div>

            {/* Slider 2: Taxa Nominal de Juros */}
            <div className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Taxa de Juros Nominal</span>
                <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                  {taxaJurosMensal.toFixed(2)}% a.m.
                </span>
              </div>
              <input
                type="range"
                min="0.99"
                max="3.50"
                step="0.05"
                value={taxaJurosMensal}
                onChange={(e) => setTaxaJurosMensal(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>0.99% (Consignado)</span>
                <span>1.85% (Imobiliário)</span>
                <span>3.50% (Giro PJ)</span>
              </div>
            </div>

            {/* Slider 3: Prazo Médio */}
            <div className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">Prazo Médio de Amortização</span>
                <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                  {prazoMeses} meses
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                step="6"
                value={prazoMeses}
                onChange={(e) => setPrazoMeses(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>12 meses</span>
                <span>36 meses</span>
                <span>120 meses</span>
              </div>
            </div>

            {/* Slider 4: LTV Médio das Garantias */}
            <div className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--muted)] uppercase text-[10px] tracking-wider">LTV Médio das Garantias (Casa Nova)</span>
                <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">
                  {ltvMedio}% (Seguro)
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="1"
                value={ltvMedio}
                onChange={(e) => setLtvMedio(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)]">
                <span>30% (Super Conservador)</span>
                <span>60% (Recomendado)</span>
                <span>85% (Limite Máximo)</span>
              </div>
            </div>
          </div>

          {/* Cards de Métricas Consolidadas da Simulação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                Receita de Juros Mensal
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                R$ {receitaMensalJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[var(--muted)] block mt-1">
                Fluxo de caixa recorrente
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                Receita Total no Período
              </span>
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 font-mono">
                R$ {receitaTotalPeriodo.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[var(--muted)] block mt-1">
                Ao longo de {prazoMeses} parcelas
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block mb-1">
                Spread Líquido da Holding
              </span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-400 font-mono">
                R$ {spreadHolding.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mês
              </span>
              <span className="text-[10px] text-[var(--muted)] block mt-1">
                Margem líquida após funding CDI
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé Executivo */}
        <div className="px-6 py-4 bg-[var(--surface2)]/60 border-t border-[var(--line)] flex items-center justify-between">
          <div className="text-[11px] text-[var(--muted)]">
            <span>Modelagem algorítmica SAC &amp; PRICE conforme normativas Bacen.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] font-bold text-xs cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handleDispararComite}
              disabled={isSimulando}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isSimulando ? "Homologando..." : "Homologar no Comitê de Risco"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
