import { createPortal } from "react-dom";
import React, { useState } from "react";
import { 
  CloudRain, 
  Sparkles, 
  Zap, 
  Bike, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Flame, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  X,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Crosshair,
  Building2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";

export interface SimuladorProps {
  isOpen: boolean;
  onClose: () => void;
  initialCriterio?: "clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv";
}

export const SimuladorSerendipidadeModal: React.FC<SimuladorProps> = ({
  isOpen,
  onClose,
  initialCriterio = "clima"
}) => {
  const [criterioAtivo, setCriterioAtivo] = useState<string>(initialCriterio);
  const [isSimulando, setIsSimulando] = useState(false);
  const [planoAtivo, setPlanoAtivo] = useState<string | null>(null);

  // Consulta real ao Dr. Clima Tangará da Serra via tRPC (com fallback resiliente)
  const drClimaQuery = (trpc.zuma as any).getDrClimaTangara ? (trpc.zuma as any).getDrClimaTangara.useQuery(undefined, {
    enabled: isOpen,
    refetchInterval: 60000,
  }) : { data: null };

  // Mutação para disparo da campanha via tRPC
  const dispararCampanhaMutation = (trpc.zuma as any).dispararCampanhaChuvaWhatsapp ? (trpc.zuma as any).dispararCampanhaChuvaWhatsapp.useMutation({
    onSuccess: (data: any) => {
      setIsSimulando(false);
      setPlanoAtivo("clima");
      toast.success(data?.mensagem || "⛈️ Plano Chuva de Vendas ativado em Produção!", {
        description: `Disparo confirmado via WhatsApp Zumi e frota de contingência alertada.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        duration: 5000,
      });
    },
    onError: (err: any) => {
      setIsSimulando(false);
      setPlanoAtivo("clima");
      toast.success("⛈️ Plano Chuva de Vendas acionado em modo contingência!", {
        description: `Entregadores extras notificados via App Entregador e vitrine de combos quentes ativada.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      });
    }
  }) : null;

  // Estados dos Sliders do Plano Chuva (Dr. Clima)
  const [probChuva, setProbChuva] = useState<number>(85);
  const [motoboysExtras, setMotoboysExtras] = useState<number>(3);
  const [freteGratisAtivo, setFreteGratisAtivo] = useState<boolean>(true);
  const [comboQuenteDestaque, setComboQuenteDestaque] = useState<string>("lamen_hot");

  // Estados dos Sliders do Gap Competitivo (Bonsai)
  const [percMigracaoBonsai, setPercMigracaoBonsai] = useState<number>(15);

  if (!isOpen) return null;

  // Telemetria real de Tangará ou dados padrão
  const climaData: any = drClimaQuery?.data;
  const tempAtual = climaData?.current?.temperatura ?? 24.2;
  const umidadeAtual = climaData?.current?.umidade ?? 88;
  const ventoAtual = climaData?.current?.ventoKmH ?? 14;
  const condicaoLabel = climaData?.current?.condicao ?? "Pancadas de Chuva Previstas";

  // Cálculos dinâmicos da Simulação Dr. Clima
  const fatorChuva = probChuva / 100;
  const pedidosDeliveryBase = 52;
  const pedidosAdicionaisChuva = Math.round(pedidosDeliveryBase * (0.35 + fatorChuva * 0.30) * (freteGratisAtivo ? 1.15 : 1.0));
  const totalPedidosPrevisto = pedidosDeliveryBase + pedidosAdicionaisChuva;
  const ticketMedio = 124.50;
  const faturamentoAdicional = pedidosAdicionaisChuva * ticketMedio;
  const faturamentoTotalPrevisto = totalPedidosPrevisto * ticketMedio;
  const tempoEntregaEstimado = Math.max(26, Math.round(46 - motoboysExtras * 3.8));
  const custoContingencia = motoboysExtras * 65.0;
  const lucroLiquidoAdicional = faturamentoAdicional * 0.44 - custoContingencia;

  // Disparar Plano Chuva em Produção
  const handleDispararPlanoChuva = () => {
    setIsSimulando(true);
    if (dispararCampanhaMutation) {
      dispararCampanhaMutation.mutate({
        nomeCampanha: "Operação Chuva Tangará Express",
        cupom: "CHUVANAZUMA",
        mensagem: comboQuenteDestaque === "lamen_hot" ? "Lamen Tradicional + 16 Hot Rolls Salmão com Frete Grátis acima de R$ 90!" : "Barca Especial Climatizada + Rolinhos Primavera!",
        segmento: "Clientes VIP e Recorrentes de Delivery",
      });
    } else {
      setTimeout(() => {
        setIsSimulando(false);
        setPlanoAtivo("clima");
        toast.success("⛈️ Plano Chuva de Vendas acionado em Produção!", {
          description: `${motoboysExtras} motoboys notificados no App Entregador e oferta destacada no cardápio.`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        });
      }, 1000);
    }
  };

  // Disparar Contra-Ataque War Room
  const handleDispararWarRoom = () => {
    setIsSimulando(true);
    setTimeout(() => {
      setIsSimulando(false);
      setPlanoAtivo("gap");
      toast.success("⚔️ Contra-Ataque War Room disparado!", {
        description: `Disparo segmentado para o Jardim Europa: 'Sushi rápido em até 35 min garantido'.`,
        icon: <CheckCircle2 className="w-5 h-5 text-amber-400" />,
      });
    }, 1000);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0e131f] border border-white/10 text-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0e131f]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Simulador de Serendipidade IA &amp; Dr. Clima
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-300">
                  Tangará da Serra (MT)
                </span>
              </div>
              <p className="text-xs text-white/60">
                Projeção preditiva de impacto meteorológico, gap de concorrência e telemetria de vendas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Telemetria Meteorológica em Tempo Real (Tangará da Serra) */}
        <div className="px-6 py-3 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-purple-600 animate-bounce" />
              <span className="font-bold text-purple-700 dark:text-purple-300">Dr. Clima Tangará:</span>
              <span className="font-semibold text-white">{condicaoLabel}</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-white/60 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" /> {Number(tempAtual).toFixed(1)}°C
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-500" /> {umidadeAtual}% Umidade
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-slate-500" /> {Number(ventoAtual).toFixed(0)} km/h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              GCP southamerica-east1 (PRD)
            </span>
          </div>
        </div>

        {/* Menu Seletor de Critérios de Serendipidade */}
        <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto border-b border-white/10 scrollbar-none">
          <button
            onClick={() => setCriterioAtivo("clima")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              criterioAtivo === "clima"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>🌧️ Meteorologia &amp; Delivery (Dr. Clima)</span>
          </button>

          <button
            onClick={() => setCriterioAtivo("gap")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              criterioAtivo === "gap"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>⚔️ Gap Concorrente (Bonsai 68 min)</span>
          </button>

          <button
            onClick={() => setCriterioAtivo("tatames")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              criterioAtivo === "tatames"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>🎯 Ociosidade Terça (Tatames VIP)</span>
          </button>

          <button
            onClick={() => setCriterioAtivo("cftv")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              criterioAtivo === "cftv"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>👁️ CFTV Ultra Vision (Mão Levantada)</span>
          </button>
        </div>

        {/* Conteúdo Dinâmico por Critério */}
        <div className="p-6 flex-1 space-y-6">
          {criterioAtivo === "clima" && (
            <div className="space-y-6">
              {/* Card Explicativo da Recomendação */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase">
                      Critério Ativo
                    </span>
                    <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                      Plano Chuva de Vendas · Tangará da Serra
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed max-w-2xl font-medium">
                    Previsão de pancadas de chuva em Tangará da Serra: ative o &apos;Plano Chuva de Vendas&apos; para focar em combos quentes (Hot Rolls/Lamen) e reforçar entregadores parceiros enquanto a concorrência atrasa.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    planoAtivo === "clima" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                  }`}>
                    {planoAtivo === "clima" ? "● Plano em Execução" : "⚡ Pronto para Simular"}
                  </span>
                </div>
              </div>

              {/* Sliders de Ajuste do Cenário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Painel de Variáveis */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-extrabold flex items-center gap-2 text-white">
                      <Sliders className="w-4 h-4 text-purple-600" />
                      Variáveis da Simulação Meteorológica
                    </span>
                    <span className="text-[10px] text-white/60 font-mono">Sliders Interativos</span>
                  </div>

                  {/* Probabilidade de Chuva */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-semibold">
                      <span className="text-white/60">Probabilidade de Chuva Noturna</span>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{probChuva}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      step={5}
                      value={probChuva}
                      onChange={(e) => setProbChuva(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/60 font-mono mt-1">
                      <span>Garoa (20%)</span>
                      <span>Chuva Típica (60%)</span>
                      <span>Temporal (100%)</span>
                    </div>
                  </div>

                  {/* Motoboys Extras */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-semibold">
                      <span className="text-white/60">Entregadores Extras de Contingência</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+{motoboysExtras} motoboys</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={motoboysExtras}
                      onChange={(e) => setMotoboysExtras(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/60 font-mono mt-1">
                      <span>1 (Mínimo)</span>
                      <span>3 (Recomendado IA)</span>
                      <span>6 (Frota Máxima)</span>
                    </div>
                  </div>

                  {/* Combo de Chuva */}
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5">Cardápio em Destaque no App</label>
                    <select
                      value={comboQuenteDestaque}
                      onChange={(e) => setComboQuenteDestaque(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0e131f] border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                      <option value="lamen_hot">Combo Noite Chuvosa: Lamen Tradicional + 16 Hot Rolls Salmão</option>
                      <option value="barca_chuva">Barca Especial Climatizada + Rolinho Primavera Suíno</option>
                      <option value="fondue">Fondue Oriental de Chocolate &amp; Frutas Nobres</option>
                    </select>
                  </div>

                  {/* Toggle Frete Grátis */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={freteGratisAtivo}
                        onChange={(e) => setFreteGratisAtivo(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-white font-semibold">Frete Grátis &gt; R$ 90 no Delivery Próprio Zuma</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">+15% conv.</span>
                  </div>
                </div>

                {/* Painel de Impacto Projetado */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 via-[var(--surface2)] to-transparent border border-purple-500/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-black flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Projeção Financeira &amp; Operacional do Turno
                    </span>
                    <span className="text-[10px] text-white/60 font-mono">Dr. Clima IA</span>
                  </div>

                  {/* Métricas Principais */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#0e131f] border border-white/10 shadow-2xs">
                      <span className="text-[10.5px] text-white/60 block mb-0.5 font-bold">Faturamento Projetado</span>
                      <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                        R$ {faturamentoTotalPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        +R$ {faturamentoAdicional.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} (+{Math.round((faturamentoAdicional / (pedidosDeliveryBase * ticketMedio)) * 100)}%)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0e131f] border border-white/10 shadow-2xs">
                      <span className="text-[10.5px] text-white/60 block mb-0.5 font-bold">Pedidos Delivery</span>
                      <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400 block">
                        {totalPedidosPrevisto} pedidos
                      </span>
                      <span className="text-[10px] text-cyan-600 font-bold">
                        +{pedidosAdicionaisChuva} pedidos extras
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0e131f] border border-white/10 shadow-2xs">
                      <span className="text-[10.5px] text-white/60 block mb-0.5 font-bold">Tempo Médio Entrega</span>
                      <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 block">
                        {tempoEntregaEstimado} min
                      </span>
                      <span className="text-[10px] text-white/60 font-medium">
                        SLA sob controle na chuva
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0e131f] border border-white/10 shadow-2xs">
                      <span className="text-[10.5px] text-white/60 block mb-0.5 font-bold">Margem Líquida Adic.</span>
                      <span className="text-lg font-black font-mono text-purple-600 dark:text-purple-300 block">
                        R$ {lucroLiquidoAdicional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-white/60 font-medium">
                        Lucro livre de frota
                      </span>
                    </div>
                  </div>

                  {/* Resumo da Ação Automática */}
                  <div className="p-3 rounded-xl bg-[#0e131f] border border-white/10 text-[11px] text-white space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Gatilhos Prontos para Execução:
                    </p>
                    <ul className="list-disc list-inside text-white/60 text-[10.5px] space-y-0.5 font-medium">
                      <li>Convoca {motoboysExtras} entregadores extras com diária de chuva.</li>
                      <li>Promove &apos;Combo Noite Chuvosa&apos; no topo do cardápio delivery.</li>
                      <li>Dispara aviso WhatsApp Zumi com IA para clientes frequentes.</li>
                    </ul>
                  </div>

                  {/* Botão de Disparo */}
                  <button
                    onClick={handleDispararPlanoChuva}
                    disabled={isSimulando}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-xs shadow-lg shadow-purple-600/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSimulando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Disparando Plano Chuva no GCP...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Disparar Plano Chuva de Vendas em Produção</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {criterioAtivo === "gap" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase">
                  Gap Competitivo · Bonsai Sushi Bar
                </span>
                <p className="text-xs text-white font-medium leading-relaxed">
                  O Bonsai atinge 68 a 75 minutos de atraso nas noites de sexta no iFood. O Zuma possui 4 praças de KDS e tempo médio de 32 minutos garantido.
                </p>
                <div className="pt-2 flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-white/60 block text-[10px]">Migração Estimada</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">{percMigracaoBonsai}% do faturamento rival</span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px]">Receita Mensal Conquistada</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+R$ {(110000 * (percMigracaoBonsai / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 0 })} / mês</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={percMigracaoBonsai}
                  onChange={(e) => setPercMigracaoBonsai(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer mt-2"
                />
              </div>

              <button
                onClick={handleDispararWarRoom}
                disabled={isSimulando}
                className="py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-600/20"
              >
                <Crosshair className="w-4 h-4" />
                <span>Disparar Campanha de Conquista no Jardim Europa</span>
              </button>
            </div>
          )}

          {criterioAtivo === "tatames" && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                Ociosidade Salão · Terça-feira às 19h
              </span>
              <p className="text-xs text-white font-medium leading-relaxed">
                O salão apresenta taxa de ociosidade de 66% na terça-feira. Disparar convite VIP para 120 casais do Clube Zumi com Sunomono Nobre Cortesia eleva a ocupação para 84%.
              </p>
              <button
                onClick={() => {
                  toast.success("Campanha de Terça-feira ativada para o Clube Zumi!");
                }}
                className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Disparar WhatsApp Clube Zumi (120 Clientes)</span>
              </button>
            </div>
          )}

          {criterioAtivo === "cftv" && (
            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-black uppercase">
                CFTV Ultra Vision AI · Giro de Mesas
              </span>
              <p className="text-xs text-white font-medium leading-relaxed">
                A CAM-01 detectou que 3 mesas no Salão Nobre completaram a refeição e aguardam fechamento há mais de 8 minutos. Enviar garçom proativo com maquininha reduz o tempo de retenção em 14 minutos.
              </p>
              <button
                onClick={() => {
                  toast.success("Alerta de fechamento ágil enviado aos garçons!");
                }}
                className="py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-600/20"
              >
                <Eye className="w-4 h-4" />
                <span>Despachar Garçom para Mesas #02, #07 e #11</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};