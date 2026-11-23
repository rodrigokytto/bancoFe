import React, { useState, useRef, useMemo } from "react";
import { formatBrl } from "../../../shared/zumaData";
import { 
  Sparkles,
  Upload, 
  Check, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Filter, 
  Utensils, 
  ShoppingBag, 
  Flame, 
  Eye, 
  Info,
  ChevronRight,
  Share2,
  X,
  Maximize2,
  Radio,
  SlidersHorizontal,
  Zap,
  Send,
  DollarSign,
  Target,
  Award,
  Activity,
  Sun,
  Sunset,
  Moon,
  HelpCircle,
  Bot,
  Layers,
  CheckCircle2,
  Copy,
  Plus,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  DAYS,
  DAY_NAMES,
  TIME_SLOTS,
  CellData,
  SlotOpportunity,
  DayOpportunity,
  DAY_OPPORTUNITIES,
  generateMatrixData,
  simulateOrdersIncrease
} from "../lib/heatmapData";

interface PlanItem {
  dia: string;
  horario: string;
  publico: string;
  oferta: string;
  mensagem: string;
  prato: string;
  meta: number;
}

const DEFAULT_PLAN: PlanItem[] = [
  { dia: "Segunda", horario: "18h às 22h", publico: "Clientes ativos (últimos 45 dias)", oferta: "Segunda Express: 20 itens mais vendidos, entrega até 45 min", mensagem: "Segunda também é dia de Zuma! Abrimos hoje das 18h às 22h com entrega expressa. Bora? [link]", prato: "Hot Filadélfia (12un)", meta: 22 },
  { dia: "Terça", horario: "18h às 20h", publico: "Quem já pediu hot roll", oferta: "Hot Roll em dobro até 20h", mensagem: "Terça do Hot Roll! Pediu até as 20h, o Zumi manda em dobro. Só hoje: [link]", prato: "Hot Filadélfia (12un)", meta: 14 },
  { dia: "Quarta", horario: "11h às 14h e 18h às 20h", publico: "Quem pede poke, sashimi ou Fit", oferta: "Quarta Fit: poke + suco natural com preço fechado", mensagem: "Quarta leve: Poke de Salmão + suco natural por preço especial. Treino pago, fome resolvida. [link]", prato: "Poke de Salmão", meta: 12 },
  { dia: "Quinta", horario: "11h às 14h", publico: "Empresas e quem mora perto da Av. Brasil", oferta: "Zuma Executivo: prato do dia até R$ 39,90", mensagem: "Almoço novo no Zuma: Yakissoba, Teppan ou Poke, entregue rápido. De quinta a domingo, 11h às 14h. [link]", prato: "Yakissoba de Frango", meta: 18 },
  { dia: "Domingo", horario: "18h às 19h", publico: "Sumidos há 30 a 60 dias", oferta: "Cupom de R$ 15 até domingo + raspadinha", mensagem: "Faz tempo que a gente não se vê! O Zumi guardou R$ 15 pra você usar até domingo. [link]", prato: "Combo 26 Peças", meta: 16 }
];

export const Cockpit: React.FC = () => {
  const [, setLocation] = useLocation();
  const [matrixData] = useState<CellData[][]>(generateMatrixData);
  
  // Controles de Modo e Filtros
  const [viewMode, setViewMode] = useState<"dia" | "semana">("dia"); // Padrão 'dia' para celular perfeito!
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(3); // Quinta-feira padrão
  const [selectedMetric, setSelectedMetric] = useState<"orders" | "revenue" | "kitchenLoad" | "lostRevenue">("orders");
  const [selectedChannel, setSelectedChannel] = useState<"todos" | "salao" | "delivery" | "ifood">("todos");
  const [periodoCockpit, setPeriodoCockpit] = useState<"semana" | "mes" | "trimestre" | "semestre" | "anual">("mes");
  const [mesCockpit, setMesCockpit] = useState<string>("2026-11");
  const [triCockpit, setTriCockpit] = useState<string>("Q4");
  const [semCockpit, setSemCockpit] = useState<string>("SEM2");
  const [anoCockpit, setAnoCockpit] = useState<string>("2026");
  
  // Drawer / Bottom Sheet para Celular
  const [activeCell, setActiveCell] = useState<CellData>(matrixData[3][7]); // Quinta 20h-21h
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"oportunidade" | "simulador" | "whatsapp">("oportunidade");
  const [simulatedExtra, setSimulatedExtra] = useState<number>(6);

  const [plan, setPlan] = useState<PlanItem[]>(DEFAULT_PLAN);
  const [approvedIndices, setApprovedIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const dailySectionRef = useRef<HTMLDivElement>(null);

  // Multiplicador do horizonte temporal selecionado no Cockpit
  const cockpitMultiplier = useMemo(() => {
    switch (periodoCockpit) {
      case "semana": return 1.0;
      case "mes": return 4.33;
      case "trimestre": return 13.0;
      case "semestre": return 26.0;
      case "anual": return 52.0;
    }
  }, [periodoCockpit]);

  const cockpitPeriodoLabel = useMemo(() => {
    switch (periodoCockpit) {
      case "semana": return "Semana Atual (7 Dias)";
      case "mes": return mesCockpit === "2026-11" ? "Mês de Novembro/2026 (30 Dias)" : "Mês de Outubro/2026 (30 Dias)";
      case "trimestre": return triCockpit === "Q4" ? "4º Trimestre (Out · Nov · Dez · 90 Dias)" : "3º Trimestre (Jul · Ago · Set · 90 Dias)";
      case "semestre": return semCockpit === "SEM2" ? "2º Semestre 2026 (Safra MT · 180 Dias)" : "1º Semestre 2026 (180 Dias)";
      case "anual": return `Ano Completo ${anoCockpit} (365 Dias)`;
    }
  }, [periodoCockpit, mesCockpit, triCockpit, semCockpit, anoCockpit]);

  // Totais calculados
  const baseWeekRevenue = matrixData.flat().reduce((acc, c) => acc + c.revenue, 0);
  const baseWeekOrders = matrixData.flat().reduce((acc, c) => acc + c.orders, 0);
  const baseLostRevenue = matrixData.flat().reduce((acc, c) => acc + c.lostRevenue, 0);

  const totalWeekRevenue = Math.round(baseWeekRevenue * cockpitMultiplier);
  const totalWeekOrders = Math.round(baseWeekOrders * cockpitMultiplier);
  const totalLostRevenue = Math.round(baseLostRevenue * cockpitMultiplier);

  // Ação explodir dia
  const handleExplodeDay = (dayIdx: number) => {
    setSelectedDayIdx(dayIdx);
    setViewMode("dia");
    toast.success(`⚡ Explodindo ${DAY_NAMES[dayIdx]}: 11 faixas horárias detalhadas!`);
    if (dailySectionRef.current) {
      dailySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Clicar na célula abre a folha detalhada
  const handleCellClick = (cell: CellData, tab: "oportunidade" | "simulador" | "whatsapp" = "oportunidade") => {
    setActiveCell(cell);
    setModalTab(tab);
    setSimulatedExtra(cell.opportunity.actionType === "salao" ? 8 : 6);
    setBottomSheetOpen(true);
  };

  const handleApprove = (idx: number) => {
    setApprovedIndices(prev => new Set(prev).add(idx));
    toast.success("Ação aprovada! O Zumi programou o disparo para o horário estratégico.");
  };

  const handleEditCampaign = (item: PlanItem) => {
    localStorage.setItem("zuma_campaign_draft", JSON.stringify(item));
    setLocation("/campanhas");
  };

  const handleRunAiPilot = async () => {
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const newPlan = [
        { dia: "Terça", horario: "18h30 às 20h30", publico: "Clientes sumidos há 45 dias", oferta: "Hot Roll em Dobro + Raspadinha", mensagem: "Terça ninja no Zuma! Seu hot roll favorito em dobro hoje até 20h30. Pede no link: [link]", prato: "Hot Filadélfia (12un)", meta: 16 },
        { dia: "Quarta", horario: "11h às 13h30", publico: "Empresas e escritórios da Av. Brasil", oferta: "Almoço Executivo com Suco Grátis", mensagem: "Almoço corporativo sem fila: Yakissoba de Frango quentinho e suco de presente! [link]", prato: "Yakissoba de Frango", meta: 20 },
        { dia: "Quinta", horario: "19h às 21h", publico: "Amantes de Poke & Fit", oferta: "Poke de Salmão com 15% OFF", mensagem: "Quinta leve e nutritiva: Poke de Salmão fresquinho com 15% de desconto só hoje! [link]", prato: "Poke de Salmão", meta: 14 },
        { dia: "Sexta", horario: "18h às 19h (Pré-pico)", publico: "Clientes VIP e Fiéis", oferta: "Frete Grátis antecipado acima de R$ 80", mensagem: "Sextou mais cedo no Zuma! Pedindo antes das 19h o frete é por nossa conta: [link]", prato: "Combo 56 Peças", meta: 25 },
        { dia: "Domingo", horario: "17h30 às 19h", publico: "Famílias de Tangará", oferta: "Sobremesa Hot Nutella de brinde no Combo Família", mensagem: "Domingo em família: Combo Especial com Hot Nutella de presente pros pequenos! [link]", prato: "Especial Zuma 68 Peças", meta: 18 }
      ];
      setPlan(newPlan);
      setApprovedIndices(new Set());
      toast.success("Novo plano semanal gerado com sucesso pela IA do Zumi!");
    } catch {
      toast.error("Erro ao gerar plano. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper para cor de fundo da célula do heatmap
  const getCellVisual = (cell: CellData) => {
    if (!cell.isOpen) {
      return {
        bg: "repeating-linear-gradient(45deg, var(--surface2), var(--surface2) 4px, var(--surface) 4px, var(--surface) 8px)",
        border: "border-[var(--line)]",
        text: "text-[var(--muted)] opacity-60"
      };
    }

    if (cell.bottleneck === "cozinha_lotada") {
      return {
        bg: "#EF4444",
        border: "border-red-600 ring-2 ring-red-400/40",
        text: "text-white font-extrabold"
      };
    }

    if (cell.bottleneck === "salao_vazio") {
      return {
        bg: "rgba(245, 158, 11, 0.25)",
        border: "border-amber-400 border-dashed",
        text: "text-amber-900 dark:text-amber-200 font-bold"
      };
    }

    let ratio = cell.orders / 32;
    if (selectedMetric === "revenue") ratio = cell.revenue / 2800;
    if (selectedMetric === "kitchenLoad") ratio = cell.kitchenLoad / 100;
    if (selectedMetric === "lostRevenue") ratio = cell.lostRevenue / 1500;

    if (ratio <= 0.2) return { bg: "rgba(46, 90, 76, 0.12)", border: "border-[var(--line)]", text: "text-[var(--ink)]" };
    if (ratio <= 0.45) return { bg: "rgba(46, 90, 76, 0.28)", border: "border-[var(--line)]", text: "text-[var(--ink)] font-semibold" };
    if (ratio <= 0.75) return { bg: "rgba(232, 97, 58, 0.45)", border: "border-[var(--salmon)]/40", text: "text-[var(--ink)] font-bold" };
    return { bg: "var(--salmon)", border: "border-[var(--salmon)]", text: "text-white font-black" };
  };

  const getCellDisplayValue = (cell: CellData) => {
    if (!cell.isOpen) return "-";
    let val = cell.orders;
    if (selectedChannel === "salao") val = cell.channels.salao;
    if (selectedChannel === "delivery") val = cell.channels.delivery;
    if (selectedChannel === "ifood") val = cell.channels.ifood;

    if (selectedMetric === "revenue") return `R$ ${(cell.revenue / 1000).toFixed(1)}k`;
    if (selectedMetric === "kitchenLoad") return `${cell.kitchenLoad}%`;
    if (selectedMetric === "lostRevenue") return cell.lostRevenue > 0 ? `+${formatBrl(cell.lostRevenue).replace("R$", "")}` : "0";
    return val;
  };

  // Totais do dia selecionado
  const selectedDayCells = matrixData[selectedDayIdx];
  const selectedDayRevenue = selectedDayCells.reduce((acc, c) => acc + c.revenue, 0);
  const selectedDayOrders = selectedDayCells.reduce((acc, c) => acc + c.orders, 0);
  const selectedDayPeakSlot = selectedDayCells.reduce((max, c) => c.orders > max.orders ? c : max, selectedDayCells[0]);
  const selectedDayOpportunities = DAY_OPPORTUNITIES[selectedDayIdx] || [];
  const totalDayOpportunityBrl = selectedDayOpportunities.reduce((acc, o) => acc + o.potentialBrl, 0);

  // Simulação em tempo real para o modal ativo
  const activeSimulation = simulateOrdersIncrease(activeCell, simulatedExtra);

  // Helper de ícone de período
  const getSlotIcon = (slotIdx: number) => {
    if (slotIdx <= 2) return <Sun className="w-4 h-4 text-amber-500" />;
    if (slotIdx === 3) return <Clock className="w-4 h-4 text-blue-500" />;
    if (slotIdx === 4) return <Sunset className="w-4 h-4 text-orange-500" />;
    if (slotIdx >= 5 && slotIdx <= 8) return <Flame className="w-4 h-4 text-red-500" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-20 px-1 sm:px-0">
      {/* Header do Cockpit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--salmon)] bg-[var(--salmon)]/10 px-2 py-0.5 rounded-full">
              Zuma Pilot • Tangará da Serra
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-display font-extrabold text-[var(--ink)] mt-1">
            Cockpit de Vendas &amp; Horários
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Otimização inteligente da capacidade do salão, delivery e cozinha hora a hora com detecção de oportunidades financeiras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExplodeDay(3)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-sm"
          >
            <Zap className="w-4 h-4" /> Explodir Quinta-feira
          </button>
          <button
            onClick={handleRunAiPilot}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold hover:border-[var(--salmon)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--salmon)]" />
            {isGenerating ? "Analisando..." : "Atualizar IA"}
          </button>
        </div>
      </div>

      {/* KPI CARDS RESUMO EXECUTIVO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Faturamento Semanal</span>
            <TrendingUp className="w-4 h-4 text-[var(--good)]" />
          </div>
          <div className="text-lg sm:text-2xl font-mono-nums font-black text-[var(--ink)]">
            {formatBrl(totalWeekRevenue)}
          </div>
          <span className="text-[10px] text-[var(--good)] font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs semana anterior
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Volume de Pedidos</span>
            <ShoppingBag className="w-4 h-4 text-[var(--salmon)]" />
          </div>
          <div className="text-lg sm:text-2xl font-mono-nums font-black text-[var(--ink)]">
            {totalWeekOrders}
          </div>
          <span className="text-[10px] text-[var(--muted)] font-mono-nums">
            Média de {(totalWeekOrders / 7).toFixed(0)} pedidos/dia
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Oportunidades em Aberto</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-2xl font-mono-nums font-black text-amber-600">
            {formatBrl(totalLostRevenue)}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">
            Lacunas em horários de baixa
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Gargalo da Cozinha</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-lg sm:text-2xl font-mono-nums font-black text-red-600">
            Sex e Sáb (20h-21h)
          </div>
          <span className="text-[10px] text-red-600 font-bold">
            96% carga • Fire-on-Demand KDS
          </span>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL DO MAPA DE CALOR COM EXPLOSÃO E CONTROLES */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4">
        {/* Banner de Atalho para o Mapa de Calor Completo 360° */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[var(--salmon)]/15 via-[var(--surface2)] to-[var(--surface)] border border-[var(--salmon)]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--salmon)] text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--salmon)] bg-[var(--salmon)]/10 px-2 py-0.5 rounded-md border border-[var(--salmon)]/30">
                  Central Avançada
                </span>
                <h4 className="text-sm sm:text-base font-black text-[var(--ink)]">
                  Mapa de Calor Analítico &amp; Sazonalidade 360°
                </h4>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Filtros por Mês, Trimestre, Semestre e Anual, Planta Baixa das 27 Mesas do Salão e IA Zumi Preditiva.
              </p>
            </div>
          </div>

          <button
            onClick={() => setLocation("/mapa-de-calor")}
            className="px-4 py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Abrir Mapa de Calor 360°</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Seletor de Horizonte Temporal: Semana, Mês, Trimestre, Semestre, Anual */}
        <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-[var(--ink)] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[var(--salmon)]" />
              <span>Seletor de Período Temporal:</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--salmon)] bg-[var(--salmon-soft)] px-2.5 py-0.5 rounded-full border border-[var(--salmon)]/30">
              {cockpitPeriodoLabel}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            <button
              onClick={() => setPeriodoCockpit("semana")}
              className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                periodoCockpit === "semana"
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodoCockpit("mes")}
              className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                periodoCockpit === "mes"
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriodoCockpit("trimestre")}
              className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                periodoCockpit === "trimestre"
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriodoCockpit("semestre")}
              className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                periodoCockpit === "semestre"
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              Semestre
            </button>
            <button
              onClick={() => setPeriodoCockpit("anual")}
              className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                periodoCockpit === "anual"
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              Anual
            </button>
          </div>

          {/* Subseletores rápidos */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--line)]/50 text-[11px]">
            {periodoCockpit === "mes" && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--muted)]">Mês:</span>
                <select
                  value={mesCockpit}
                  onChange={e => setMesCockpit(e.target.value)}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2 py-0.5 font-bold text-[var(--ink)]"
                >
                  <option value="2026-11">Novembro/2026 (Mês Atual)</option>
                  <option value="2026-10">Outubro/2026</option>
                  <option value="2026-09">Setembro/2026</option>
                  <option value="2026-08">Agosto/2026</option>
                </select>
              </div>
            )}
            {periodoCockpit === "trimestre" && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--muted)]">Trimestre:</span>
                <select
                  value={triCockpit}
                  onChange={e => setTriCockpit(e.target.value)}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2 py-0.5 font-bold text-[var(--ink)]"
                >
                  <option value="Q4">4º Trimestre (Out · Nov · Dez)</option>
                  <option value="Q3">3º Trimestre (Jul · Ago · Set)</option>
                  <option value="Q2">2º Trimestre (Abr · Mai · Jun)</option>
                  <option value="Q1">1º Trimestre (Jan · Fev · Mar)</option>
                </select>
              </div>
            )}
            {periodoCockpit === "semestre" && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--muted)]">Semestre:</span>
                <select
                  value={semCockpit}
                  onChange={e => setSemCockpit(e.target.value)}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2 py-0.5 font-bold text-[var(--ink)]"
                >
                  <option value="SEM2">2º Semestre (Julho a Dezembro)</option>
                  <option value="SEM1">1º Semestre (Janeiro a Junho)</option>
                </select>
              </div>
            )}
            {periodoCockpit === "anual" && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--muted)]">Ano:</span>
                <select
                  value={anoCockpit}
                  onChange={e => setAnoCockpit(e.target.value)}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2 py-0.5 font-bold text-[var(--ink)]"
                >
                  <option value="2026">2026 (Consolidado)</option>
                  <option value="2025">2025 (Histórico)</option>
                </select>
              </div>
            )}

            <div className="ml-auto text-[10px] text-[var(--muted)] font-mono">
              Faturamento do Período: <strong className="text-[var(--salmon)]">{formatBrl(totalWeekRevenue)}</strong> ({totalWeekOrders} pedidos)
            </div>
          </div>
        </div>

        {/* Barra Superior de Alternância e Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <button
                onClick={() => setViewMode("dia")}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "dia"
                    ? "bg-[var(--salmon)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Explodir Dia ⚡
              </button>
              <button
                onClick={() => setViewMode("semana")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "semana"
                    ? "bg-[var(--salmon)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Grade Semanal (7x11)
              </button>
            </div>

            <span className="text-xs text-[var(--muted)] hidden md:inline">
              {viewMode === "dia" 
                ? `Exibindo 11 faixas detalhadas e oportunidades de ${DAY_NAMES[selectedDayIdx]}` 
                : "Visão consolidada de Segunda a Domingo"}
            </span>
          </div>

          {/* Filtros de Métricas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-[var(--muted)] font-semibold hidden sm:inline">Métrica:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
              >
                <option value="orders">Pedidos</option>
                <option value="revenue">Faturamento (R$)</option>
                <option value="kitchenLoad">Carga Cozinha (%)</option>
                <option value="lostRevenue">Oportunidade (R$)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-[var(--muted)] font-semibold hidden sm:inline">Canal:</span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
              >
                <option value="todos">Todos Canais</option>
                <option value="salao">Salão Presencial</option>
                <option value="delivery">Delivery Próprio</option>
                <option value="ifood">iFood</option>
              </select>
            </div>
          </div>
        </div>

        {/* SELETOR DE DIAS TÁTIL EM CHIPS (PERFEITO PARA IPHONE E DESKTOP) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] px-0.5">
            <span className="font-bold text-[var(--ink)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--salmon)]" /> Toque no dia para explodir faixas e oportunidades:
            </span>
            <span className="text-[11px] text-[var(--salmon)] font-extrabold sm:hidden">Deslize ↔</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {DAYS.map((d, dIdx) => {
              const isSelected = selectedDayIdx === dIdx && viewMode === "dia";
              const dayRevenue = matrixData[dIdx].reduce((acc, c) => acc + c.revenue, 0);
              const dayOrders = matrixData[dIdx].reduce((acc, c) => acc + c.orders, 0);

              return (
                <button
                  key={d}
                  onClick={() => handleExplodeDay(dIdx)}
                  className={`flex-1 min-w-[72px] sm:min-w-[90px] p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[var(--salmon)] border-[var(--salmon)] text-white shadow-md scale-102 ring-2 ring-[var(--salmon)]/40"
                      : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                  }`}
                >
                  <span className={`text-xs font-black ${isSelected ? "text-white" : "text-[var(--ink)]"}`}>
                    {d}
                  </span>
                  <span className={`text-[10px] font-mono-nums ${isSelected ? "text-white/90" : "text-[var(--muted)]"}`}>
                    {formatBrl(dayRevenue).replace(",00", "")}
                  </span>
                  <span className={`text-[9px] font-semibold ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                    {dayOrders} ped
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODO 1: ANÁLISE POR DIA (EXPLODIDA) COM OPORTUNIDADES     */}
        {/* ======================================================== */}
        {viewMode === "dia" && (
          <div ref={dailySectionRef} className="space-y-4 animate-in fade-in duration-200">
            {/* Header Executivo do Dia Explodido */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[var(--salmon)]/15 via-[var(--surface2)] to-[var(--surface)] border border-[var(--salmon)]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[var(--salmon)] px-2 py-0.5 rounded-md">
                    Visão Explodida
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-[var(--ink)]">
                    {DAY_NAMES[selectedDayIdx]}
                  </h3>
                  <span className="text-xs font-bold text-[var(--muted)] hidden sm:inline">
                    • 11 Faixas Horárias Mapeadas
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Faturamento estimado de <strong className="text-[var(--ink)]">{formatBrl(selectedDayRevenue)}</strong> ({selectedDayOrders} pedidos). 
                  Pico de atendimento às <strong className="text-red-600">{TIME_SLOTS[selectedDayPeakSlot.slotIdx].label}</strong> ({selectedDayPeakSlot.orders} pedidos, carga {selectedDayPeakSlot.kitchenLoad}%).
                </p>
              </div>

              {/* Box de Oportunidades Totais do Dia */}
              <div className="flex items-center gap-2.5 bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--salmon)]/40 shadow-xs shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Oportunidades do Dia:
                  </span>
                  <span className="text-base font-extrabold font-mono-nums text-emerald-600 block">
                    +{formatBrl(totalDayOpportunityBrl)}
                  </span>
                  <span className="text-[9px] text-[var(--muted)] font-medium">
                    3 estratégias detectadas
                  </span>
                </div>
              </div>
            </div>

            {/* PAINEL NOVO: TOP 3 OPORTUNIDADES ESTRATÉGICAS DO DIA SELECIONADO */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--salmon)]" />
                  <h4 className="text-xs sm:text-sm font-extrabold text-[var(--ink)]">
                    Top 3 Oportunidades Estratégicas para {DAY_NAMES[selectedDayIdx]}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-[var(--salmon)]">
                  Disparo Inteligente Zumi IA ⚡
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {selectedDayOpportunities.map((opp, idx) => {
                  const targetCell = matrixData[selectedDayIdx][opp.slotIdx];

                  return (
                    <div
                      key={opp.id}
                      className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)] transition-all flex flex-col justify-between space-y-3 shadow-xs group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono-nums font-bold text-[var(--salmon)] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {opp.timeWindow}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white ${opp.badgeColor}`}>
                            {opp.badge}
                          </span>
                        </div>

                        <h5 className="text-xs sm:text-sm font-extrabold text-[var(--ink)] leading-snug group-hover:text-[var(--salmon)] transition-colors">
                          {opp.title}
                        </h5>

                        <p className="text-[11px] text-[var(--muted)] leading-relaxed line-clamp-3">
                          {opp.diagnostic}
                        </p>

                        <div className="pt-1 flex items-center justify-between text-[11px] border-t border-[var(--line)]/60">
                          <span className="text-[var(--muted)] font-medium">Retorno Estimado:</span>
                          <span className="font-mono-nums font-black text-emerald-600 text-xs sm:text-sm">
                            +{formatBrl(opp.potentialBrl)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleCellClick(targetCell, "whatsapp")}
                          className="flex-1 py-2 px-2.5 rounded-lg bg-[var(--salmon)] text-white text-[11px] font-bold flex items-center justify-center gap-1 hover:brightness-105 active:scale-95 transition-all shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" /> Disparar Zumi IA
                        </button>
                        <button
                          onClick={() => handleCellClick(targetCell, "simulador")}
                          className="py-2 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] text-[11px] font-semibold hover:border-[var(--salmon)] transition-all flex items-center justify-center"
                          title="Simular incremento financeiro"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LISTA VERTICAL DAS 11 FAIXAS HORÁRIAS DETALHADAS */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-extrabold text-[var(--ink)]">
                  Detalhamento de Todas as 11 Faixas Horárias:
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  Toque na faixa para simular e abrir ações
                </span>
              </div>

              {TIME_SLOTS.map((slot, slotIdx) => {
                const cell = matrixData[selectedDayIdx][slotIdx];
                const isPeak = cell.bottleneck === "cozinha_lotada";
                const isIdle = cell.bottleneck === "salao_vazio";
                const isSelected = activeCell.dayIdx === selectedDayIdx && activeCell.slotIdx === slotIdx;
                const hasOpportunity = cell.opportunity.potentialBrl > 0;

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleCellClick(cell, "oportunidade")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-[var(--surface)] hover:border-[var(--salmon)] shadow-xs space-y-2.5 ${
                      isSelected 
                        ? "ring-2 ring-[var(--salmon)] border-transparent bg-gradient-to-r from-[var(--salmon)]/5 to-[var(--surface)]" 
                        : "border-[var(--line)]"
                    }`}
                  >
                    {/* Linha Superior: Horário, Período, Status e Valores */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col items-center justify-center font-mono-nums shrink-0">
                          {getSlotIcon(slotIdx)}
                          <span className="text-[10px] font-bold text-[var(--ink)] mt-0.5 leading-none">{slot.shortLabel}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <b className="text-xs sm:text-sm text-[var(--ink)]">{slot.label}</b>
                            <span className="text-[10px] text-[var(--muted)]">· {slot.period}</span>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {!cell.isOpen ? (
                              <span className="text-[10px] font-bold text-[var(--muted)] bg-[var(--surface2)] px-2 py-0.5 rounded-md">
                                Fechado / Pré-preparo
                              </span>
                            ) : isPeak ? (
                              <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Pico Gargalo ({cell.kitchenLoad}% Cozinha)
                              </span>
                            ) : isIdle ? (
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 rounded-md">
                                Ocioso (Dinheiro na mesa)
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[var(--good)] bg-[var(--good)]/10 px-2 py-0.5 rounded-md">
                                Equilibrado ({cell.kitchenLoad}% Cozinha)
                              </span>
                            )}

                            {cell.isOpen && (
                              <span className="text-[10px] text-[var(--muted)] font-mono-nums">
                                Ticket R$ {cell.avgTicket.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dados Financeiros e de Volume */}
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-base font-black font-mono-nums text-[var(--ink)]">
                          {cell.isOpen ? formatBrl(cell.revenue) : "-"}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-mono-nums">
                          {cell.isOpen ? `${cell.orders} pedidos` : "0 pedidos"}
                        </div>
                      </div>
                    </div>

                    {/* BOX DA OPORTUNIDADE EMBUTIDA NA FAIXA HORÁRIA */}
                    {cell.isOpen && hasOpportunity && (
                      <div className="p-2.5 rounded-lg bg-[var(--surface2)]/70 border border-[var(--salmon)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <b className="text-[var(--ink)] font-bold text-[11px] sm:text-xs">
                              💡 Oportunidade: {cell.opportunity.title}
                            </b>
                            <span className="text-[10px] font-mono-nums font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                              +{formatBrl(cell.opportunity.potentialBrl)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--muted)] line-clamp-1 pl-3">
                            {cell.opportunity.diagnostic}
                          </p>
                        </div>

                        {/* Botões de Ação na Faixa */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(cell, "simulador");
                            }}
                            className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] hover:border-[var(--salmon)] transition-all flex items-center gap-1"
                          >
                            <TrendingUp className="w-3 h-3 text-[var(--salmon)]" /> Simular Ganho
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(cell, "whatsapp");
                            }}
                            className="px-2 py-1 rounded bg-[var(--salmon)] text-white text-[10px] font-extrabold hover:brightness-105 transition-all flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" /> Disparar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Barra de Canais & Detalhes */}
                    {cell.isOpen && (
                      <div className="pt-2 border-t border-[var(--line)]/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
                          <span className="flex items-center gap-1 text-[var(--nori)] font-bold text-[10px] sm:text-[11px]">
                            <Utensils className="w-3 h-3" /> {cell.channels.salao} salão
                          </span>
                          <span className="flex items-center gap-1 text-[var(--salmon)] font-bold text-[10px] sm:text-[11px]">
                            <ShoppingBag className="w-3 h-3" /> {cell.channels.delivery} delivery
                          </span>
                          <span className="flex items-center gap-1 text-[#EA1D2C] font-bold text-[10px] sm:text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EA1D2C] text-white text-[7px] flex items-center justify-center font-black">iF</span> {cell.channels.ifood} ifood
                          </span>
                        </div>

                        <span className="text-[10px] text-[var(--salmon)] font-bold flex items-center gap-0.5">
                          Detalhes &amp; IA <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODO 2: GRADE SEMANAL (7 DIAS X 11 FAIXAS COM STICKY)     */}
        {/* ======================================================== */}
        {viewMode === "semana" && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--muted)] flex items-center justify-between sm:hidden px-1">
              <span>👉 Deslize para ver todos os dias</span>
              <span className="font-bold text-[var(--salmon)]">Toque no dia para explodir</span>
            </div>

            <div className="overflow-x-auto pb-2 border border-[var(--line)] rounded-xl bg-[var(--surface)]">
              <div className="min-w-[540px]">
                {/* Cabeçalho dos Dias */}
                <div className="grid grid-cols-8 gap-1 p-2 text-center text-xs font-bold text-[var(--muted)] border-b border-[var(--line)] bg-[var(--surface2)]/80">
                  <div className="text-left pl-2 font-mono text-[11px] sticky left-0 bg-[var(--surface2)] z-20 shadow-xs">
                    Horário
                  </div>
                  {DAYS.map((d, dIdx) => (
                    <button
                      key={d}
                      onClick={() => handleExplodeDay(dIdx)}
                      className="py-1 px-1 rounded-lg hover:bg-[var(--salmon)] hover:text-white transition-all font-extrabold flex flex-col items-center justify-center cursor-pointer group"
                      title={`Toque para explodir e ver ${DAY_NAMES[dIdx]}`}
                    >
                      <span className="group-hover:scale-110 transition-transform">{d}</span>
                      <span className="text-[9px] text-[var(--salmon)] group-hover:text-white font-normal">Explodir ⚡</span>
                    </button>
                  ))}
                </div>

                {/* 11 Faixas Horárias */}
                <div className="p-1 space-y-1">
                  {TIME_SLOTS.map((slot, slotIdx) => (
                    <div key={slot.id} className="grid grid-cols-8 gap-1 items-center">
                      {/* Coluna Sticky da Esquerda (Nunca Corta no Mobile!) */}
                      <div className="sticky left-0 bg-[var(--surface)] z-20 pl-2 pr-1 py-1 space-y-0.5 border-r border-[var(--line)] shadow-xs">
                        <span className="font-mono-nums font-bold text-xs text-[var(--ink)] block leading-tight">
                          {slot.shortLabel}-{slot.id.split("-")[1]}h
                        </span>
                        <span className="text-[9px] text-[var(--muted)] block truncate leading-tight">
                          {slot.period.split(" ")[0]}
                        </span>
                      </div>

                      {/* 7 Células dos Dias */}
                      {DAYS.map((d, dayIdx) => {
                        const cell = matrixData[dayIdx][slotIdx];
                        const visual = getCellVisual(cell);

                        return (
                          <button
                            key={`${d}-${slot.id}`}
                            onClick={() => handleCellClick(cell, "oportunidade")}
                            style={{ background: visual.bg }}
                            className={`h-10 rounded-lg border text-center flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                              visual.border
                            } hover:scale-105 active:scale-95`}
                          >
                            <span className={`text-xs ${visual.text} font-mono-nums`}>
                              {getCellDisplayValue(cell)}
                            </span>
                            {cell.bottleneck === "cozinha_lotada" && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legenda Responsiva para Celular */}
            <div className="p-3 bg-[var(--surface2)]/60 rounded-xl border border-[var(--line)] text-xs text-[var(--muted)] space-y-2">
              <span className="font-bold text-[var(--ink)] block">Legenda de Cores do Mapa:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[var(--surface2)] border border-[var(--line)] shrink-0" />
                  <span className="text-[11px]">Fechado / Prep</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400/40 border border-amber-400 border-dashed shrink-0" />
                  <span className="text-[11px]">Ocioso (Lacuna)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[var(--salmon)]/50 border border-[var(--salmon)] shrink-0" />
                  <span className="text-[11px]">Movimento Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500 border border-red-600 shrink-0" />
                  <span className="text-[11px] font-bold text-red-600">Gargalo (&gt;85%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SUPER MODAL / BOTTOM SHEET INTERATIVO COM SIMULADOR AO VIVO */}
      {/* ======================================================== */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] w-full max-w-xl rounded-t-[28px] sm:rounded-[24px] p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6">
            {/* Header da Folha com Drag Handle para Celular */}
            <div className="flex flex-col items-center sm:hidden pb-1">
              <div className="w-12 h-1.5 rounded-full bg-[var(--muted)]/30 mb-2" />
            </div>

            <div className="flex items-start justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--salmon)] block">
                  Inteligência de Horário &amp; Oportunidade
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[var(--ink)]">
                  {DAY_NAMES[activeCell.dayIdx]} • {TIME_SLOTS[activeCell.slotIdx].label}
                </h3>
                <span className="text-xs text-[var(--muted)]">
                  Período: {TIME_SLOTS[activeCell.slotIdx].period} • Tangará da Serra
                </span>
              </div>

              <button
                onClick={() => setBottomSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SELETOR DE ABAS INTERATIVAS NO MODAL */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <button
                onClick={() => setModalTab("oportunidade")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === "oportunidade"
                    ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                🎯 Oportunidade Zumi
              </button>
              <button
                onClick={() => setModalTab("simulador")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === "simulador"
                    ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                📈 Simulador (+R$)
              </button>
              <button
                onClick={() => setModalTab("whatsapp")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === "whatsapp"
                    ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                💬 WhatsApp Disparo
              </button>
            </div>

            {/* ABA 1: OPORTUNIDADE & DIAGNÓSTICO ESTRATÉGICO */}
            {modalTab === "oportunidade" && (
              <div className="space-y-3 animate-in fade-in">
                {/* Destaque da Oportunidade */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                      {activeCell.opportunity.tag}
                    </span>
                    <span className="text-base font-black font-mono-nums text-emerald-600">
                      +{formatBrl(activeCell.opportunity.potentialBrl)}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-[var(--ink)]">
                    {activeCell.opportunity.title}
                  </h4>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {activeCell.opportunity.diagnostic}
                  </p>

                  <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-[var(--ink)] block">
                      Ação Recomendada pela IA:
                    </span>
                    <p className="text-xs text-[var(--ink)]">
                      {activeCell.opportunity.action}
                    </p>
                  </div>
                </div>

                {/* Métricas Atuais da Janela */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                    <span className="text-[var(--muted)] block text-[10px]">Faturamento Atual:</span>
                    <span className="text-sm font-mono-nums font-extrabold text-[var(--ink)]">
                      {formatBrl(activeCell.revenue)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                    <span className="text-[var(--muted)] block text-[10px]">Volume:</span>
                    <span className="text-sm font-mono-nums font-extrabold text-[var(--ink)]">
                      {activeCell.orders} pedidos
                    </span>
                  </div>
                  <div className="p-2.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                    <span className="text-[var(--muted)] block text-[10px]">Carga Cozinha:</span>
                    <span className={`text-sm font-mono-nums font-extrabold ${activeCell.kitchenLoad >= 85 ? "text-red-600" : "text-[var(--ink)]"}`}>
                      {activeCell.kitchenLoad}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                    <span className="text-[var(--muted)] block text-[10px]">Ocupação Salão:</span>
                    <span className="text-sm font-mono-nums font-extrabold text-[var(--ink)]">
                      {activeCell.hallOccupancy}%
                    </span>
                  </div>
                </div>

                {/* Top Pratos */}
                <div className="space-y-1.5 pt-1 border-t border-[var(--line)]">
                  <span className="text-xs font-bold text-[var(--ink)] block">Top 3 Pratos Mais Demandados nesta Faixa:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCell.topDishes.map((dish, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs font-medium text-[var(--ink)]">
                        🍣 {dish}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: SIMULADOR DE FATURAMENTO AO VIVO */}
            {modalTab === "simulador" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                  <span className="text-xs font-bold text-[var(--ink)] block">
                    Selecione o Incremento de Pedidos para esta Faixa:
                  </span>
                  
                  {/* Botões Rápidos de Incremento */}
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 6, 10, 15].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setSimulatedExtra(amt)}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          simulatedExtra === amt
                            ? "bg-[var(--salmon)] text-white shadow-sm scale-102"
                            : "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                        }`}
                      >
                        +{amt} pedidos
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resultados da Simulação em Tempo Real */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--salmon)]/10 via-[var(--surface)] to-transparent border border-[var(--salmon)]/30 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--salmon)] block">
                    Impacto Projetado ao Vivo:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                      <span className="text-[var(--muted)] text-[10px] block">Receita Adicional Gerada:</span>
                      <span className="text-base sm:text-lg font-black font-mono-nums text-emerald-600">
                        +{formatBrl(activeSimulation.extraRevenue)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                      <span className="text-[var(--muted)] text-[10px] block">Novo Faturamento da Janela:</span>
                      <span className="text-base sm:text-lg font-black font-mono-nums text-[var(--ink)]">
                        {formatBrl(activeSimulation.newRevenue)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                      <span className="text-[var(--muted)] text-[10px] block">Nova Carga Cozinha:</span>
                      <span className={`text-base font-black font-mono-nums ${activeSimulation.isOverload ? "text-red-600" : "text-[var(--ink)]"}`}>
                        {activeSimulation.newKitchenLoad}% (de {activeCell.kitchenLoad}%)
                      </span>
                    </div>

                    <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                      <span className="text-[var(--muted)] text-[10px] block">Ocupação Salão:</span>
                      <span className="text-base font-black font-mono-nums text-[var(--ink)]">
                        {activeSimulation.newHallOccupancy}% (de {activeCell.hallOccupancy}%)
                      </span>
                    </div>
                  </div>

                  {activeSimulation.isOverload ? (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Atenção: A cozinha atingirá {activeSimulation.newKitchenLoad}%. Recomenda-se acionar o sushibar de apoio ou focar em combinados frios.
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Capacidade operacional absorve o incremento com segurança dentro do SLA de 20 minutos!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 3: WHATSAPP ZUMI IA & DISPARO */}
            {modalTab === "whatsapp" && (
              <div className="space-y-3 animate-in fade-in">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--ink)] block">
                    Mensagem Pré-configurada para Tangará da Serra:
                  </span>
                  <p className="text-[11px] text-[var(--muted)]">
                    Público-alvo: <strong>{activeCell.opportunity.targetAudience}</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-mono leading-relaxed relative group">
                  "{activeCell.opportunity.whatsappDraft || "Mensagem estratégica da Zumi IA para captação de clientes nesta faixa horária."}"
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeCell.opportunity.whatsappDraft);
                      toast.success("Mensagem copiada para a área de transferência!");
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--salmon)] transition-colors"
                    title="Copiar mensagem"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <span className="font-semibold">Potencial de Retorno:</span>
                  <span className="font-black font-mono-nums text-sm">+{formatBrl(activeCell.opportunity.potentialBrl)}</span>
                </div>
              </div>
            )}

            {/* Botões de Ação na Base do Modal */}
            <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  toast.success(`⚡ Campanha agendada com sucesso para ${DAY_NAMES[activeCell.dayIdx]} às ${TIME_SLOTS[activeCell.slotIdx].label}!`, {
                    description: `Público: ${activeCell.opportunity.targetAudience} • Ganho estimado: +${formatBrl(activeCell.opportunity.potentialBrl)}`
                  });
                  setBottomSheetOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[var(--salmon)] text-white text-xs font-extrabold hover:brightness-105 active:scale-98 transition-all shadow-md text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> Aprovar Disparo Zumi IA
              </button>
              <button
                onClick={() => setBottomSheetOpen(false)}
                className="px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLANO DE AÇÃO SEMANAL GERADO PELA IA */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--salmon)]" />
              <h2 className="text-sm sm:text-base font-bold text-[var(--ink)]">
                Plano de Ataque Semanal da IA Zumi
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Disparos estratégicos para preencher lacunas de ociosidade detectadas em Tangará da Serra.
            </p>
          </div>

          <span className="text-xs font-semibold text-[var(--muted)]">
            {approvedIndices.size} de {plan.length} aprovadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plan.map((item, idx) => {
            const isApproved = approvedIndices.has(idx);
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isApproved
                    ? "bg-[var(--good)]/5 border-[var(--good)]"
                    : "bg-[var(--surface2)] border-[var(--line)] hover:border-[var(--salmon)]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--salmon)] uppercase tracking-wide">
                      {item.dia} • {item.horario}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]">
                      +{item.meta} ped
                    </span>
                  </div>

                  <b className="text-xs sm:text-sm text-[var(--ink)] block leading-snug">
                    {item.oferta}
                  </b>

                  <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--muted)] italic">
                    "{item.mensagem}"
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)]">
                  <button
                    onClick={() => handleApprove(idx)}
                    disabled={isApproved}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isApproved
                        ? "bg-[var(--good)] text-white"
                        : "bg-[var(--salmon)] text-white hover:brightness-105 active:scale-98"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isApproved ? "Aprovado!" : "Aprovar Disparo"}
                  </button>

                  <button
                    onClick={() => handleEditCampaign(item)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] hover:border-[var(--salmon)] cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
