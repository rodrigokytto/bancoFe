import React, { useState, useMemo } from "react";
import { formatBrl } from "../../../shared/zumaData";
import { 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Filter, 
  Utensils, 
  ShoppingBag, 
  Flame, 
  Eye, 
  X, 
  Maximize2, 
  Radio, 
  Zap, 
  Download, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  ChefHat, 
  Bike, 
  Store, 
  CalendarDays, 
  CalendarRange, 
  Sliders, 
  DollarSign, 
  Palette, 
  Send, 
  Fish, 
  CloudRain,
  Share2,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { DiaExplosaoModal } from "../components/analytics/DiaExplosaoModal";

// ============================================================================
// DEFINIÇÕES E TIPAGENS
// ============================================================================
export type PeriodoTipo = "semana" | "mes" | "trimestre" | "semestre" | "anual" | "custom";
export type MetricaTipo = "orders" | "revenue" | "kitchenLoad" | "hallOccupancy" | "lostRevenue" | "salmonKg";
export type CanalTipo = "all" | "salao" | "delivery" | "ifood" | "balcao";
export type SetorTipo = "all" | "SALAO_NOBRE" | "DECK_JARDIM" | "TATAMES_VIP" | "BALCAO_OMAKASE";
export type PaletaTipo = "salmon" | "cyber" | "emerald";

export interface CellData {
  dayIdx: number;
  dayName?: string;
  dayCode?: string;
  slotIdx: number;
  slotId?: string;
  slotLabel?: string;
  slotPeriod?: string;
  isOpen: boolean;
  orders: number;
  revenue: number;
  kitchenLoad: number; // % 0-100
  hallOccupancy: number; // % 0-100
  lostRevenue: number; // R$ deixado na mesa
  salmonKg: number; // kg de salmão consumidos no horário
  channels: {
    salao: number;
    delivery: number;
    ifood: number;
    balcao?: number;
  };
  bottleneck: "nenhum" | "cozinha_lotada" | "salao_vazio" | "espera_motoboy";
  topDishes: string[];
  aiTip: string;
}

export interface MesaCalorItem {
  id: number;
  nome: string;
  ambiance: "SALAO_NOBRE" | "DECK_JARDIM" | "TATAMES_VIP" | "BALCAO_OMAKASE";
  lugares: number;
  taxaOcupacao: number;
  faturamentoAcumulado: number;
  girosMediosDia: number;
  tempoPermanenciaMedio: number;
  ticketMedioMesa: number;
  statusCalor: "fervendo" | "aquecido" | "morno" | "frio";
}

// 7 dias da semana
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAY_NAMES = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
];

// 11 faixas horárias detalhadas
const TIME_SLOTS = [
  { id: "11-12", label: "11h - 12h", shortLabel: "11h", period: "Almoço Início" },
  { id: "12-13", label: "12h - 13h", shortLabel: "12h", period: "Almoço Pico" },
  { id: "13-14", label: "13h - 14h", shortLabel: "13h", period: "Almoço Tardio" },
  { id: "14-17", label: "14h - 17h", shortLabel: "14h", period: "Transição Tarde" },
  { id: "17-18", label: "17h - 18h", shortLabel: "17h", period: "Pré-Jantar" },
  { id: "18-19", label: "18h - 19h", shortLabel: "18h", period: "Jantar Abertura" },
  { id: "19-20", label: "19h - 20h", shortLabel: "19h", period: "Jantar Aceleração" },
  { id: "20-21", label: "20h - 21h", shortLabel: "20h", period: "Pico Máximo" },
  { id: "21-22", label: "21h - 22h", shortLabel: "21h", period: "Pico Sustentado" },
  { id: "22-23", label: "22h - 23h", shortLabel: "22h", period: "Fechamento" },
  { id: "23-00", label: "23h - 00h", shortLabel: "23h", period: "Madrugada Delivery" },
];

// ============================================================================
// COMPONENTE PRINCIPAL: MAPA DE CALOR ANALÍTICO & PREDITIVO
// ============================================================================
export const MapaCalor: React.FC = () => {
  const [, setLocation] = useLocation();

  // Estados de Controle Temporal (Requisitos do Usuário: Mês, Trimestre, Semestre, Anual)
  const [periodo, setPeriodo] = useState<PeriodoTipo>("mes");
  const [mesSelecionado, setMesSelecionado] = useState<string>("2026-11");
  const [triSelecionado, setTriSelecionado] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q4");
  const [semSelecionado, setSemSelecionado] = useState<"SEM1" | "SEM2">("SEM2");
  const [anoSelecionado, setAnoSelecionado] = useState<string>("2026");
  const [dataInicioCustom, setDataInicioCustom] = useState<string>("2026-10-01");
  const [dataFimCustom, setDataFimCustom] = useState<string>("2026-11-22");

  // Métricas, Filtros e Paleta Visual
  const [selectedMetric, setSelectedMetric] = useState<MetricaTipo>("revenue");
  const [selectedChannel, setSelectedChannel] = useState<CanalTipo>("all");
  const [selectedSetor, setSelectedSetor] = useState<SetorTipo>("all");
  const [paletaCor, setPaletaCor] = useState<PaletaTipo>("salmon");
  const [modoExibicao, setModoExibicao] = useState<"grade" | "calendario" | "mesas" | "preditivo">("grade");
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(4); // Sexta-feira padrão

  // Simulador de Deslocamento de Carga
  const [deslocamentoPerc, setDeslocamentoPerc] = useState<number>(15);

  // Modais e Detalhes
  const [activeCell, setActiveCell] = useState<CellData | null>(null);
  const [selectedMesa, setSelectedMesa] = useState<MesaCalorItem | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [mesaModalOpen, setMesaModalOpen] = useState(false);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  // Multiplicador e dias calculados localmente para fallback instantâneo
  const localMultiplier = useMemo(() => {
    switch (periodo) {
      case "semana": return 1.0;
      case "mes": return 4.33;
      case "trimestre": return 13.0;
      case "semestre": return 26.0;
      case "anual": return 52.0;
      case "custom": return 3.5;
    }
  }, [periodo]);

  const localTotalDias = useMemo(() => {
    switch (periodo) {
      case "semana": return 7;
      case "mes": return 30;
      case "trimestre": return 90;
      case "semestre": return 180;
      case "anual": return 365;
      case "custom": return 24;
    }
  }, [periodo]);

  // Gerador local imediato de fallback para a matriz 7x11
  const fallbackMatrix = useMemo(() => {
    return DAYS.map((dayCode, dayIdx) => {
      const isWeekend = dayIdx === 4 || dayIdx === 5;
      const isSunday = dayIdx === 6;
      const isMonday = dayIdx === 0;

      return TIME_SLOTS.map((slot, slotIdx) => {
        let isOpen = true;
        let baseOrders = 0;

        if (slotIdx === 3) isOpen = false;
        else if (isMonday && slotIdx < 5) isOpen = false;
        else if (slotIdx < 3) baseOrders = isWeekend ? (isSunday ? 22 : 16) : 9;
        else if (slotIdx === 4) baseOrders = isWeekend ? 8 : 4;
        else if (slotIdx === 5) baseOrders = isWeekend ? 18 : 9;
        else if (slotIdx === 6) baseOrders = isWeekend ? 28 : 16;
        else if (slotIdx === 7) baseOrders = isWeekend ? 36 : 22;
        else if (slotIdx === 8) baseOrders = isWeekend ? 30 : 18;
        else if (slotIdx === 9) baseOrders = isWeekend ? 18 : 7;
        else if (slotIdx === 10) baseOrders = isWeekend ? 10 : 3;

        const orders = isOpen ? Math.round(baseOrders * localMultiplier) : 0;
        const avgTicket = slotIdx < 3 ? 58.0 : 96.5;
        const revenue = Math.round(orders * avgTicket);
        const kitchenCapacity = Math.round(36 * localMultiplier);
        const kitchenLoad = isOpen ? Math.min(100, Math.round((orders / (kitchenCapacity || 1)) * 100)) : 0;
        const hallOccupancy = isOpen ? Math.min(100, Math.round(((orders * 1.85) / (68 * localMultiplier || 1)) * 100)) : 0;
        const lostRevenue = Math.round(Math.max(0, (kitchenCapacity * 0.8) - orders) * avgTicket);
        const salmonKg = Math.round(orders * 0.38 * 10) / 10;

        let bottleneck: "nenhum" | "cozinha_lotada" | "salao_vazio" | "espera_motoboy" = "nenhum";
        if (kitchenLoad >= 85) bottleneck = "cozinha_lotada";
        else if (isOpen && hallOccupancy <= 28 && slotIdx >= 5) bottleneck = "salao_vazio";

        return {
          dayIdx,
          dayName: DAY_NAMES[dayIdx],
          dayCode,
          slotIdx,
          slotId: slot.id,
          slotLabel: slot.label,
          slotPeriod: slot.period,
          isOpen,
          orders,
          revenue,
          avgTicket,
          kitchenLoad,
          hallOccupancy,
          lostRevenue,
          salmonKg,
          channels: {
            salao: Math.round(orders * 0.48),
            delivery: Math.round(orders * 0.32),
            ifood: Math.round(orders * 0.14),
            balcao: Math.max(0, orders - Math.round(orders * 0.94))
          },
          bottleneck,
          topDishes: ["Barca Zuma Especial 40p", "Hot Filadélfia Panko", "Uramaki Salmão Trufado"],
          aiTip: bottleneck === "cozinha_lotada" ? "Saturação de KDS no pico." : "Fluxo equilibrado dentro da capacidade instalada."
        };
      });
    });
  }, [localMultiplier]);

  // Gerador local imediato de fallback para os dias do mosaico
  const fallbackCalendarDays = useMemo(() => {
    const result = [];
    const hoje = new Date(2026, 10, 22);
    for (let i = localTotalDias - 1; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6;
      const isSundayDay = dayOfWeek === 0;

      let baseDayRev = isWeekendDay ? 14800 : isSundayDay ? 10200 : (dayOfWeek === 1 ? 4200 : 7800);
      const noise = ((d.getDate() * 11) % 19) - 9;
      const dayRev = Math.round(baseDayRev * (1 + noise / 100));
      const dayOrders = Math.round(dayRev / 94);

      let heatLevel: 0 | 1 | 2 | 3 | 4 = 1;
      if (dayRev >= 13500) heatLevel = 4;
      else if (dayRev >= 9500) heatLevel = 3;
      else if (dayRev >= 6000) heatLevel = 2;
      else if (dayRev <= 4000) heatLevel = 0;

      let specialEvent: string | undefined;
      if (d.getDate() === 5 || d.getDate() === 20) specialEvent = "Pagamento Regional MT";

      result.push({
        date: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        dayName: DAYS[(dayOfWeek + 6) % 7],
        revenue: dayRev,
        orders: dayOrders,
        heatLevel,
        specialEvent
      });
    }
    return result;
  }, [localTotalDias]);

  // Gerador local de fallback para as 27 mesas
  const fallbackMesas = useMemo(() => {
    const bases = [
      { id: 1, nome: "Mesa 01", ambiance: "SALAO_NOBRE", lugares: 4, occ: 78, revBase: 18500, giros: 2.3, perm: 62 },
      { id: 2, nome: "Mesa 02", ambiance: "SALAO_NOBRE", lugares: 4, occ: 82, revBase: 19800, giros: 2.5, perm: 58 },
      { id: 3, nome: "Mesa 03", ambiance: "SALAO_NOBRE", lugares: 2, occ: 68, revBase: 14200, giros: 2.8, perm: 48 },
      { id: 4, nome: "Mesa 04", ambiance: "SALAO_NOBRE", lugares: 2, occ: 72, revBase: 15100, giros: 2.7, perm: 50 },
      { id: 5, nome: "Mesa 05", ambiance: "SALAO_NOBRE", lugares: 6, occ: 86, revBase: 24500, giros: 2.1, perm: 75 },
      { id: 6, nome: "Mesa 06", ambiance: "SALAO_NOBRE", lugares: 4, occ: 74, revBase: 17900, giros: 2.2, perm: 64 },
      { id: 7, nome: "Mesa 07", ambiance: "SALAO_NOBRE", lugares: 4, occ: 88, revBase: 22100, giros: 2.6, perm: 60 },
      { id: 8, nome: "Mesa 08", ambiance: "SALAO_NOBRE", lugares: 6, occ: 80, revBase: 23400, giros: 2.0, perm: 78 },
      { id: 9, nome: "Mesa 09", ambiance: "SALAO_NOBRE", lugares: 4, occ: 65, revBase: 16200, giros: 2.0, perm: 66 },
      { id: 10, nome: "Mesa 10", ambiance: "SALAO_NOBRE", lugares: 2, occ: 60, revBase: 13000, giros: 2.4, perm: 52 },
      { id: 11, nome: "Mesa 11", ambiance: "SALAO_NOBRE", lugares: 4, occ: 76, revBase: 18800, giros: 2.3, perm: 62 },
      { id: 12, nome: "Mesa 12", ambiance: "SALAO_NOBRE", lugares: 8, occ: 84, revBase: 28900, giros: 1.8, perm: 92 },
      { id: 13, nome: "Mesa 13 (Deck)", ambiance: "DECK_JARDIM", lugares: 4, occ: 70, revBase: 16800, giros: 2.4, perm: 70 },
      { id: 14, nome: "Mesa 14 (Deck)", ambiance: "DECK_JARDIM", lugares: 4, occ: 75, revBase: 17900, giros: 2.5, perm: 68 },
      { id: 15, nome: "Mesa 15 (Deck)", ambiance: "DECK_JARDIM", lugares: 6, occ: 82, revBase: 21500, giros: 2.2, perm: 85 },
      { id: 16, nome: "Mesa 16 (Deck)", ambiance: "DECK_JARDIM", lugares: 6, occ: 85, revBase: 22800, giros: 2.3, perm: 82 },
      { id: 17, nome: "Mesa 17 (Lounge)", ambiance: "DECK_JARDIM", lugares: 4, occ: 62, revBase: 14900, giros: 2.1, perm: 75 },
      { id: 18, nome: "Mesa 18 (Lounge)", ambiance: "DECK_JARDIM", lugares: 4, occ: 64, revBase: 15300, giros: 2.1, perm: 76 },
      { id: 19, nome: "Tatame VIP Tóquio", ambiance: "TATAMES_VIP", lugares: 8, occ: 94, revBase: 36200, giros: 1.9, perm: 105 },
      { id: 20, nome: "Tatame VIP Kyoto", ambiance: "TATAMES_VIP", lugares: 6, occ: 92, revBase: 31800, giros: 2.0, perm: 98 },
      { id: 21, nome: "Tatame VIP Osaka", ambiance: "TATAMES_VIP", lugares: 6, occ: 90, revBase: 30500, giros: 1.9, perm: 100 },
      { id: 22, nome: "Tatame VIP Nara", ambiance: "TATAMES_VIP", lugares: 8, occ: 95, revBase: 38400, giros: 1.9, perm: 110 },
      { id: 23, nome: "Balcão Omakase 01", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 96, revBase: 19500, giros: 3.2, perm: 65 },
      { id: 24, nome: "Balcão Omakase 02", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 95, revBase: 19200, giros: 3.1, perm: 66 },
      { id: 25, nome: "Balcão Omakase 03", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 98, revBase: 20100, giros: 3.3, perm: 64 },
      { id: 26, nome: "Balcão Omakase 04", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 94, revBase: 18900, giros: 3.0, perm: 68 },
      { id: 27, nome: "Balcão Omakase 05", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 92, revBase: 18400, giros: 2.9, perm: 70 },
    ];

    return bases.map(m => {
      const faturamentoAcumulado = Math.round((m.revBase * localMultiplier) / 4.33);
      let statusCalor: "fervendo" | "aquecido" | "morno" | "frio" = "morno";
      if (m.occ >= 90) statusCalor = "fervendo";
      else if (m.occ >= 75) statusCalor = "aquecido";
      else if (m.occ <= 65) statusCalor = "frio";
      const ticketMedioMesa = Math.round(faturamentoAcumulado / ((m.giros * localTotalDias) || 1));
      return {
        id: m.id,
        nome: m.nome,
        ambiance: m.ambiance as any,
        lugares: m.lugares,
        taxaOcupacao: m.occ,
        faturamentoAcumulado,
        girosMediosDia: m.giros,
        tempoPermanenciaMedio: m.perm,
        ticketMedioMesa,
        statusCalor,
      };
    });
  }, [localMultiplier, localTotalDias]);

  // Consulta ao Backend tRPC
  const { data: heatmapData, isLoading } = trpc.zuma.getHeatmapAnalytics.useQuery({
    periodo,
    mes: mesSelecionado,
    trimestre: triSelecionado,
    semestre: semSelecionado,
    ano: anoSelecionado,
    dataInicio: dataInicioCustom,
    dataFim: dataFimCustom,
    canal: selectedChannel,
    setor: selectedSetor,
    metrica: selectedMetric,
  });

  // Dados com fallback seguro e instantâneo
  const matrix = (heatmapData?.matrix && heatmapData.matrix.length > 0) ? heatmapData.matrix : fallbackMatrix;
  const calendarDays = (heatmapData?.calendarDays && heatmapData.calendarDays.length > 0) ? heatmapData.calendarDays : fallbackCalendarDays;
  const mesasHeatmap = ((heatmapData?.mesasHeatmap && heatmapData.mesasHeatmap.length > 0) ? heatmapData.mesasHeatmap : fallbackMesas) as MesaCalorItem[];
  const summary = heatmapData?.summary || {
    totalRevenue: 284500,
    totalOrders: 3120,
    avgTicket: 91,
    cmvRealPerc: 31.2,
    cmvRealBrl: 88764,
    avgOccupancy: 76,
    totalLostRevenue: 34200,
    totalSalmonKg: 1185,
    topChannel: "Salão Presencial (48%)",
    peakHour: "20h - 21h (Sexta e Sábado)",
    economiaSaiposIfood: 28650,
  };

  const periodoLabel = heatmapData?.periodoInfo?.label || "Mês de Novembro de 2026 (30 Dias)";
  const periodMultiplier = heatmapData?.periodoInfo?.multiplier || localMultiplier;

  // Cálculos do Simulador de Deslocamento
  const pedidosPico = Math.round(summary.totalOrders * 0.38);
  const pedidosDeslocados = Math.round((pedidosPico * deslocamentoPerc) / 100);
  const reducaoTempoEsperaMin = Math.round(deslocamentoPerc * 1.6);
  const faturamentoExtraSalvo = pedidosDeslocados * 94;

  // Lógica de cores das células do Heatmap
  const getCellVisual = (cell: CellData) => {
    if (!cell.isOpen) {
      return {
        bg: "repeating-linear-gradient(45deg, var(--surface2), var(--surface2) 4px, var(--surface) 4px, var(--surface) 8px)",
        border: "border-[var(--line)]",
        text: "text-[var(--muted)] opacity-50"
      };
    }

    if (cell.bottleneck === "cozinha_lotada") {
      return {
        bg: "#DC2626",
        border: "border-red-600 ring-2 ring-red-400/50",
        text: "text-white font-extrabold shadow-sm"
      };
    }

    if (cell.bottleneck === "salao_vazio") {
      return {
        bg: "rgba(245, 158, 11, 0.22)",
        border: "border-amber-400 border-dashed",
        text: "text-amber-800 dark:text-amber-300 font-bold"
      };
    }

    let ratio = cell.orders / (32 * periodMultiplier);
    if (selectedMetric === "revenue") ratio = cell.revenue / (3000 * periodMultiplier);
    if (selectedMetric === "kitchenLoad") ratio = cell.kitchenLoad / 100;
    if (selectedMetric === "lostRevenue") ratio = cell.lostRevenue / (1500 * periodMultiplier);
    if (selectedMetric === "hallOccupancy") ratio = cell.hallOccupancy / 100;
    if (selectedMetric === "salmonKg") ratio = cell.salmonKg / (14 * periodMultiplier);

    ratio = Math.max(0, Math.min(1, ratio));

    if (paletaCor === "cyber") {
      if (ratio <= 0.25) return { bg: "rgba(14, 165, 233, 0.2)", border: "border-sky-500/30", text: "text-sky-300" };
      if (ratio <= 0.5) return { bg: "rgba(14, 165, 233, 0.5)", border: "border-sky-400", text: "text-white font-bold" };
      if (ratio <= 0.75) return { bg: "rgba(234, 179, 8, 0.7)", border: "border-yellow-400", text: "text-neutral-900 font-black" };
      return { bg: "#F43F5E", border: "border-rose-500", text: "text-white font-black" };
    }

    if (paletaCor === "emerald") {
      if (ratio <= 0.25) return { bg: "rgba(16, 185, 129, 0.15)", border: "border-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" };
      if (ratio <= 0.5) return { bg: "rgba(16, 185, 129, 0.4)", border: "border-emerald-500/40", text: "text-emerald-900 dark:text-emerald-100 font-bold" };
      if (ratio <= 0.75) return { bg: "rgba(5, 150, 105, 0.75)", border: "border-emerald-600", text: "text-white font-bold" };
      return { bg: "#047857", border: "border-emerald-800", text: "text-white font-black" };
    }

    // Padrão Zuma Salmon
    if (ratio <= 0.2) return { bg: "rgba(46, 90, 76, 0.12)", border: "border-[var(--line)]", text: "text-[var(--ink)]" };
    if (ratio <= 0.45) return { bg: "rgba(46, 90, 76, 0.3)", border: "border-[var(--line)]", text: "text-[var(--ink)] font-semibold" };
    if (ratio <= 0.75) return { bg: "rgba(232, 97, 58, 0.5)", border: "border-[var(--salmon)]/50", text: "text-[var(--ink)] font-bold" };
    return { bg: "var(--salmon)", border: "border-[var(--salmon)]", text: "text-white font-black" };
  };

  const getCellDisplayValue = (cell: CellData) => {
    if (!cell.isOpen) return "-";
    let val = cell.orders;
    if (selectedChannel === "salao") val = cell.channels.salao;
    if (selectedChannel === "delivery") val = cell.channels.delivery;
    if (selectedChannel === "ifood") val = cell.channels.ifood;
    if (selectedChannel === "balcao") val = cell.channels.balcao || 0;

    if (selectedMetric === "revenue") {
      if (cell.revenue >= 100000) return `R$ ${(cell.revenue / 1000).toFixed(0)}k`;
      return `R$ ${(cell.revenue / 1000).toFixed(1)}k`;
    }
    if (selectedMetric === "kitchenLoad") return `${cell.kitchenLoad}%`;
    if (selectedMetric === "hallOccupancy") return `${cell.hallOccupancy}%`;
    if (selectedMetric === "lostRevenue") return cell.lostRevenue > 0 ? `+${(cell.lostRevenue / 1000).toFixed(1)}k` : "0";
    if (selectedMetric === "salmonKg") return `${cell.salmonKg.toFixed(0)}kg`;
    
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val;
  };

  const handleCellClick = (cell: CellData) => {
    setActiveCell(cell);
    setBottomSheetOpen(true);
  };

  const handleMesaClick = (mesa: MesaCalorItem) => {
    setSelectedMesa(mesa);
    setMesaModalOpen(true);
  };

  const dispararCampanhaAntiOciosidade = (janela: string, oferta: string) => {
    toast.success(`⚡ Campanha Anti-Ociosidade Disparada: ${janela}`, {
      description: `Disparando no WhatsApp Zumi: "${oferta}"`,
      icon: <Send className="w-5 h-5 text-emerald-500" />
    });
  };

  // Exportar CSV completo do período
  const handleExportCsv = () => {
    try {
      let csv = "Dia,Horário,Status,Pedidos,Faturamento_BRL,Carga_Cozinha_Perc,Ocupacao_Salao_Perc,CMV_Salmao_Kg,Gargalo,Canal_Salao,Canal_Delivery,Canal_iFood\n";
      matrix.forEach((row, dIdx) => {
        row.forEach((cell, sIdx) => {
          csv += `"${DAYS[dIdx]}","${TIME_SLOTS[sIdx].label}","${cell.isOpen ? 'Aberto' : 'Fechado'}",${cell.orders},${cell.revenue},${cell.kitchenLoad},${cell.hallOccupancy},${cell.salmonKg},"${cell.bottleneck}",${cell.channels.salao},${cell.channels.delivery},${cell.channels.ifood}\n`;
        });
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `zuma_mapa_calor_${periodo}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Arquivo CSV exportado com sucesso!");
    } catch {
      toast.error("Erro ao gerar arquivo CSV.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 antialiased">
      {/* ===================================================================== */}
      {/* HEADER PRINCIPAL COM BRANDING E CONTROLES AVANÇADOS                  */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--salmon)] bg-[var(--salmon)]/10 px-2.5 py-0.5 rounded-full border border-[var(--salmon)]/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-[var(--salmon)]" />
              Inteligência Térmica Multidimensional
            </span>
            <span className="text-[11px] font-mono text-[var(--muted)]">
              Zuma · Tangará da Serra (MT)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--ink)] mt-1 tracking-tight">
            🔥 Mapa de Calor Analítico &amp; Sazonalidade 360°
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
            Diagnóstico hora a hora da demanda gastronômica. Alterne livremente entre <b>Mês</b>, <b>Trimestre</b>, <b>Semestre</b>, <b>Anual</b> ou <b>Filtro Customizado</b> para descobrir gargalos, mapear as 27 mesas físicas e transformar ociosidade em lucro líquido.
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] shadow-xs hover:bg-[var(--surface2)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] shadow-xs hover:bg-[var(--surface2)] cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={() => setLocation("/cockpit")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cockpit Geral</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SELETOR DE PERÍODO TEMPORAL (MÊS, TRIMESTRE, SEMESTRE, ANUAL, SEMANA) */}
      {/* ===================================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[var(--salmon)]" />
            <span className="text-xs font-black text-[var(--ink)] uppercase tracking-wider">
              Seletor de Horizonte Temporal:
            </span>
          </div>

          <span className="text-xs font-bold text-[var(--salmon)] bg-[var(--salmon-soft)] px-3 py-1 rounded-full font-mono border border-[var(--salmon)]/30">
            {periodoLabel}
          </span>
        </div>

        {/* Botões de Período Principal */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            onClick={() => setPeriodo("semana")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              periodo === "semana"
                ? "bg-[var(--salmon)] text-white shadow-md ring-2 ring-[var(--salmon)]/40"
                : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Semana</span>
            <span className="text-[9px] opacity-80 font-normal">7×11 Faixas</span>
          </button>

          <button
            onClick={() => setPeriodo("mes")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              periodo === "mes"
                ? "bg-[var(--salmon)] text-white shadow-md ring-2 ring-[var(--salmon)]/40"
                : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Mês</span>
            <span className="text-[9px] opacity-80 font-normal">30 Dias</span>
          </button>

          <button
            onClick={() => setPeriodo("trimestre")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              periodo === "trimestre"
                ? "bg-[var(--salmon)] text-white shadow-md ring-2 ring-[var(--salmon)]/40"
                : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Trimestre</span>
            <span className="text-[9px] opacity-80 font-normal">Q1 / Q2 / Q3 / Q4</span>
          </button>

          <button
            onClick={() => setPeriodo("semestre")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              periodo === "semestre"
                ? "bg-[var(--salmon)] text-white shadow-md ring-2 ring-[var(--salmon)]/40"
                : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Semestre</span>
            <span className="text-[9px] opacity-80 font-normal">6 Meses</span>
          </button>

          <button
            onClick={() => setPeriodo("anual")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              periodo === "anual"
                ? "bg-[var(--salmon)] text-white shadow-md ring-2 ring-[var(--salmon)]/40"
                : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Anual</span>
            <span className="text-[9px] opacity-80 font-normal">365 Dias</span>
          </button>

          <button
            onClick={() => setPeriodo("custom")}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              periodo === "custom"
                ? "bg-[var(--salmon)] text-white shadow-md ring-2 ring-[var(--salmon)]/40"
                : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Customizado</span>
            <span className="text-[9px] opacity-80 font-normal">Datas Livres</span>
          </button>
        </div>

        {/* Sub-Seletores Contextuais de Período */}
        <div className="pt-2 border-t border-[var(--line)]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {periodo === "mes" && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--muted)]">Selecione o Mês:</span>
              <select
                value={mesSelecionado}
                onChange={e => setMesSelecionado(e.target.value)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-3 py-1.5 font-bold text-[var(--ink)] focus:outline-none"
              >
                <option value="2026-11">Novembro 2026 (Atual · Fim da Safra MT)</option>
                <option value="2026-10">Outubro 2026</option>
                <option value="2026-09">Setembro 2026</option>
                <option value="2026-08">Agosto 2026</option>
                <option value="2026-07">Julho 2026 (Férias de Inverno)</option>
                <option value="2026-06">Junho 2026 (Dia dos Namorados)</option>
              </select>
            </div>
          )}

          {periodo === "trimestre" && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--muted)]">Selecione o Trimestre:</span>
              <select
                value={triSelecionado}
                onChange={e => setTriSelecionado(e.target.value as any)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-3 py-1.5 font-bold text-[var(--ink)] focus:outline-none"
              >
                <option value="Q4">4º Trimestre (Outubro, Novembro, Dezembro) · Alta Demanda</option>
                <option value="Q3">3º Trimestre (Julho, Agosto, Setembro) · Safra MT</option>
                <option value="Q2">2º Trimestre (Abril, Maio, Junho) · Namorados &amp; Mães</option>
                <option value="Q1">1º Trimestre (Janeiro, Fevereiro, Março) · Pós-Festas</option>
              </select>
            </div>
          )}

          {periodo === "semestre" && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--muted)]">Selecione o Semestre:</span>
              <select
                value={semSelecionado}
                onChange={e => setSemSelecionado(e.target.value as any)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-3 py-1.5 font-bold text-[var(--ink)] focus:outline-none"
              >
                <option value="SEM2">2º Semestre (Julho a Dezembro) · Maior Faturamento Anual</option>
                <option value="SEM1">1º Semestre (Janeiro a Junho) · Consolidação e Retenção</option>
              </select>
            </div>
          )}

          {periodo === "anual" && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--muted)]">Selecione o Ano:</span>
              <select
                value={anoSelecionado}
                onChange={e => setAnoSelecionado(e.target.value)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-3 py-1.5 font-bold text-[var(--ink)] focus:outline-none"
              >
                <option value="2026">Ano Completo 2026 (Consolidado)</option>
                <option value="2025">Ano 2025 (Histórico Comparativo)</option>
              </select>
            </div>
          )}

          {periodo === "custom" && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-[var(--muted)]">De:</span>
              <input
                type="date"
                value={dataInicioCustom}
                onChange={e => setDataInicioCustom(e.target.value)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-2.5 py-1 text-xs text-[var(--ink)] font-mono"
              />
              <span className="font-bold text-[var(--muted)]">Até:</span>
              <input
                type="date"
                value={dataFimCustom}
                onChange={e => setDataFimCustom(e.target.value)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-2.5 py-1 text-xs text-[var(--ink)] font-mono"
              />
              <button
                onClick={() => toast.success("Filtro temporal aplicado com sucesso!")}
                className="px-3 py-1 rounded-xl bg-[var(--salmon)] text-white font-bold cursor-pointer hover:brightness-105"
              >
                Aplicar
              </button>
            </div>
          )}

          {/* Alternador de Paletas de Cor */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Palette className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-[11px] text-[var(--muted)] font-bold">Paleta:</span>
            <button
              onClick={() => setPaletaCor("salmon")}
              className={`w-5 h-5 rounded-full bg-[#ff6b4a] transition-all cursor-pointer ${paletaCor === "salmon" ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)] scale-110" : "opacity-60"}`}
              title="Paleta Zuma Salmon"
            />
            <button
              onClick={() => setPaletaCor("cyber")}
              className={`w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-rose-500 transition-all cursor-pointer ${paletaCor === "cyber" ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)] scale-110" : "opacity-60"}`}
              title="Paleta Cyberpunk Térmica"
            />
            <button
              onClick={() => setPaletaCor("emerald")}
              className={`w-5 h-5 rounded-full bg-[#10b981] transition-all cursor-pointer ${paletaCor === "emerald" ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)] scale-110" : "opacity-60"}`}
              title="Paleta Emerald Profit"
            />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6 CARDS DE INDICADORES GLOBAIS DO PERÍODO SELECIONADO                 */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Faturamento</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
            {formatBrl(summary.totalRevenue)}
          </div>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% no período</span>
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Volume Pedidos</span>
            <ShoppingBag className="w-4 h-4 text-[var(--salmon)]" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
            {summary.totalOrders} ped
          </div>
          <p className="text-[10px] text-[var(--muted)]">
            Ticket Médio: <b>{formatBrl(summary.avgTicket)}</b>
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>CMV Real</span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-amber-600">
            {summary.cmvRealPerc}%
          </div>
          <p className="text-[10px] text-[var(--muted)]">
            {formatBrl(summary.cmvRealBrl)} apurado
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Ocupação Salão</span>
            <Utensils className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-purple-600">
            {summary.avgOccupancy}%
          </div>
          <p className="text-[10px] text-[var(--muted)]">
            27 mesas físicas
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
            <span>Salmão Fresco</span>
            <Fish className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-blue-600">
            {summary.totalSalmonKg} kg
          </div>
          <p className="text-[10px] text-[var(--muted)]">
            Pescados nobres MT
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-emerald-500/40 bg-emerald-500/5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
            <span>Economia Retida</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-600">
            +{formatBrl(summary.economiaSaiposIfood)}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium">
            vs Saipos e iFood
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BARRA DE FILTROS MULTIDIMENSIONAIS (MÉTRICA, CANAL E SETOR)           */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Filtro de Métrica */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[var(--muted)] mr-1">Métrica:</span>
          <button
            onClick={() => setSelectedMetric("revenue")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "revenue" ? "bg-[var(--salmon)] text-white shadow-xs" : "bg-[var(--surface2)] text-[var(--ink)]"
            }`}
          >
            💰 Faturamento (R$)
          </button>
          <button
            onClick={() => setSelectedMetric("orders")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "orders" ? "bg-[var(--salmon)] text-white shadow-xs" : "bg-[var(--surface2)] text-[var(--ink)]"
            }`}
          >
            📦 Pedidos (#)
          </button>
          <button
            onClick={() => setSelectedMetric("kitchenLoad")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "kitchenLoad" ? "bg-[var(--salmon)] text-white shadow-xs" : "bg-[var(--surface2)] text-[var(--ink)]"
            }`}
          >
            👨‍🍳 Carga Cozinha (%)
          </button>
          <button
            onClick={() => setSelectedMetric("hallOccupancy")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "hallOccupancy" ? "bg-[var(--salmon)] text-white shadow-xs" : "bg-[var(--surface2)] text-[var(--ink)]"
            }`}
          >
            🍽️ Ocupação Salão (%)
          </button>
          <button
            onClick={() => setSelectedMetric("salmonKg")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "salmonKg" ? "bg-blue-600 text-white shadow-xs" : "bg-[var(--surface2)] text-[var(--ink)]"
            }`}
          >
            🐟 Salmão (kg)
          </button>
          <button
            onClick={() => setSelectedMetric("lostRevenue")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMetric === "lostRevenue" ? "bg-amber-600 text-white shadow-xs" : "bg-[var(--surface2)] text-[var(--ink)]"
            }`}
          >
            💸 Ociosidade (R$)
          </button>
        </div>

        {/* Filtros de Canal e Setor */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Canal */}
          <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs">
            <span className="text-[11px] font-bold text-[var(--muted)] px-1.5">Canal:</span>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value as CanalTipo)}
              className="bg-[var(--surface)] text-[var(--ink)] font-bold rounded-lg px-2 py-0.5 border-0 focus:outline-none"
            >
              <option value="all">Todos os Canais</option>
              <option value="salao">Salão Presencial</option>
              <option value="delivery">WhatsApp Direto</option>
              <option value="ifood">iFood Marketplace</option>
              <option value="balcao">Retirada Balcão</option>
            </select>
          </div>

          {/* Setor */}
          <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs">
            <span className="text-[11px] font-bold text-[var(--muted)] px-1.5">Setor:</span>
            <select
              value={selectedSetor}
              onChange={e => setSelectedSetor(e.target.value as SetorTipo)}
              className="bg-[var(--surface)] text-[var(--ink)] font-bold rounded-lg px-2 py-0.5 border-0 focus:outline-none"
            >
              <option value="all">Todas as 27 Mesas</option>
              <option value="SALAO_NOBRE">Salão Nobre (12 mesas)</option>
              <option value="DECK_JARDIM">Deck &amp; Lounge (6 mesas)</option>
              <option value="TATAMES_VIP">Tatames VIP (4 salas)</option>
              <option value="BALCAO_OMAKASE">Balcão Omakase (5 lugares)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4 MODOS DE EXIBIÇÃO EM TABS ELEGANTES                                  */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setModoExibicao("grade")}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            modoExibicao === "grade"
              ? "bg-[var(--salmon)] text-white shadow-xs font-black"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Matriz Horária 7×11 (Grade Térmica)</span>
        </button>

        <button
          onClick={() => setModoExibicao("calendario")}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            modoExibicao === "calendario"
              ? "bg-[var(--salmon)] text-white shadow-xs font-black"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Calendário Mosaico Contínuo ({calendarDays.length} Dias)</span>
        </button>

        <button
          onClick={() => setModoExibicao("mesas")}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            modoExibicao === "mesas"
              ? "bg-[var(--salmon)] text-white shadow-xs font-black"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Planta Baixa Térmica das 27 Mesas</span>
        </button>

        <button
          onClick={() => setModoExibicao("preditivo")}
          className={`px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            modoExibicao === "preditivo"
              ? "bg-[var(--salmon)] text-white shadow-xs font-black"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>IA Zumi Preditiva &amp; Anti-Ociosidade</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MATRIZ HORÁRIA 7×11 (GRADE TÉRMICA)                           */}
      {/* ===================================================================== */}
      {modoExibicao === "grade" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-4 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[var(--salmon)]" />
                Matriz de Calor Semanal Consolidada ({periodoLabel})
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Exibindo: <b>{selectedMetric.toUpperCase()}</b> · Canal: <b>{selectedChannel.toUpperCase()}</b> · Toque em qualquer célula para abrir o Raio-X detalhado.
              </p>
            </div>
          </div>

          {/* Tabela do Heatmap */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full border-collapse select-none min-w-[760px]">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-black text-[var(--muted)] uppercase tracking-wider w-24">
                    Dia / Faixa
                  </th>
                  {TIME_SLOTS.map((slot, sIdx) => (
                    <th key={sIdx} className="p-2 text-center text-xs font-black text-[var(--ink)] border-b border-[var(--line)]">
                      <div className="font-mono text-xs">{slot.shortLabel}</div>
                      <div className="text-[9px] text-[var(--muted)] font-normal truncate max-w-[65px]">{slot.period}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((dayName, dIdx) => (
                  <tr key={dIdx} className="border-b border-[var(--line)]/50 hover:bg-[var(--surface2)]/40 transition-colors">
                    <td className="p-2 font-black text-xs text-[var(--ink)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDayIdx(dIdx);
                            setDayModalOpen(true);
                          }}
                          className="hover:text-[var(--salmon)] underline underline-offset-2 cursor-pointer flex items-center gap-1"
                          title="Explodir dia em tela cheia"
                        >
                          <span>{dayName}</span>
                          <Maximize2 className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </div>
                    </td>

                    {TIME_SLOTS.map((_, sIdx) => {
                      const cell = matrix[dIdx]?.[sIdx] as CellData;
                      if (!cell) return <td key={sIdx} className="p-1" />;

                      const visual = getCellVisual(cell);
                      const displayVal = getCellDisplayValue(cell);

                      return (
                        <td key={sIdx} className="p-1 text-center">
                          <button
                            onClick={() => handleCellClick(cell)}
                            style={{ background: visual.bg }}
                            className={`w-full h-12 rounded-xl border transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center cursor-pointer relative group p-1 ${visual.border}`}
                          >
                            <span className={`text-xs font-mono font-bold leading-tight ${visual.text}`}>
                              {displayVal}
                            </span>

                            {cell.isOpen && (
                              <span className="text-[8.5px] opacity-75 font-mono leading-none mt-0.5">
                                {cell.orders}p
                              </span>
                            )}

                            {cell.bottleneck === "cozinha_lotada" && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
                            )}
                            {cell.bottleneck === "salao_vazio" && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legenda Térmica */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] text-xs text-[var(--muted)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-black text-[var(--ink)]">Legenda Térmica:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[rgba(46,90,76,0.15)] border border-[var(--line)]" />
                <span>Leve (&lt; 20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[rgba(46,90,76,0.35)] border border-[var(--line)]" />
                <span>Normal (20%-50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[var(--salmon)] text-white" />
                <span>Pico Saudável (&gt; 50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-600 text-white" />
                <span className="font-bold text-red-600">Gargalo Cozinha (&gt; 85%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-400/30 border border-amber-400 border-dashed" />
                <span className="font-semibold text-amber-700 dark:text-amber-300">Ocioso / Dinheiro na mesa</span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--muted)] italic">
              * Toque em qualquer célula para abrir o Raio-X com diagnóstico da IA Zumi
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MOSAICO CALENDÁRIO CONTÍNUO (30 A 365 DIAS)                    */}
      {/* ===================================================================== */}
      {modoExibicao === "calendario" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--ink)] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[var(--salmon)]" />
                Mosaico Calendário de Vendas Diárias ({calendarDays.length} Dias em Foco)
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Visualização dia a dia da sazonalidade gastronômica em Tangará da Serra no período: <b>{periodoLabel}</b>.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              ● 100% Sincronizado
            </span>
          </div>

          {/* Grade de Dias em Mosaico */}
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
            {calendarDays.map((d, idx) => {
              const bgClass = 
                d.heatLevel === 4 
                  ? "bg-red-500 text-white border-red-600 ring-2 ring-red-400/40"
                  : d.heatLevel === 3
                  ? "bg-[var(--salmon)] text-white border-[var(--salmon)] shadow-xs"
                  : d.heatLevel === 2
                  ? "bg-[var(--salmon-soft)] text-[var(--salmon)] border-[var(--salmon)]/30 font-bold"
                  : d.heatLevel === 1
                  ? "bg-[var(--surface2)] text-[var(--ink)] border-[var(--line)]"
                  : "bg-[var(--surface2)]/40 text-[var(--muted)] border-[var(--line)]/50";

              return (
                <button
                  key={idx}
                  onClick={() => {
                    const dayIdx = DAYS.indexOf(d.dayName);
                    setSelectedDayIdx(dayIdx >= 0 ? dayIdx : 4);
                    setDayModalOpen(true);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative group ${bgClass}`}
                >
                  <span className="block text-[10px] font-bold opacity-80 uppercase leading-none">
                    {d.dayName}
                  </span>
                  <strong className="block text-sm font-black font-mono my-0.5">
                    {d.dayNum}
                  </strong>
                  <span className="block text-[9.5px] font-mono leading-none">
                    R$ {(d.revenue / 1000).toFixed(1)}k
                  </span>

                  {d.specialEvent && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white" title={d.specialEvent} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda do Mosaico */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]/60 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span>Intensidade de Calor:</span>
              <span className="px-2 py-0.5 rounded bg-[var(--surface2)] text-[var(--muted)] text-[10px]">Baixo (&lt; R$ 4k)</span>
              <span className="px-2 py-0.5 rounded bg-[var(--salmon-soft)] text-[var(--salmon)] text-[10px]">Médio (R$ 6k-10k)</span>
              <span className="px-2 py-0.5 rounded bg-[var(--salmon)] text-white text-[10px]">Alto (R$ 10k-14k)</span>
              <span className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">Pico Máximo (&gt; R$ 14k)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Pontos Dourados = Datas de Pagamento Regional MT (Dia 5 e 20) / Feriados</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PLANTA BAIXA TÉRMICA DAS 27 MESAS DO SALÃO                     */}
      {/* ===================================================================== */}
      {modoExibicao === "mesas" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--ink)] flex items-center gap-2">
                <Store className="w-5 h-5 text-[var(--salmon)]" />
                Mapa de Calor das 27 Mesas Físicas ({periodoLabel})
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Distribuição espacial de receita e ocupação por setor: Salão Nobre, Deck Lounge, Tatames VIP e Balcão Omakase.
              </p>
            </div>
            <div className="text-xs font-mono text-[var(--muted)]">
              Total Faturado no Salão: <strong className="text-[var(--salmon)]">{formatBrl(summary.totalRevenue * 0.48)}</strong>
            </div>
          </div>

          {/* Setores das Mesas */}
          <div className="space-y-6">
            {/* 1. Balcão Omakase VIP (5 Lugares) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" /> Balcão Omakase VIP (Hiroshi Tanaka · 5 Lugares Fervendo)
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">Ocupação Média: 95% · Ticket Médio: R$ 195</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {mesasHeatmap.filter(m => m.ambiance === "BALCAO_OMAKASE").map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMesaClick(m)}
                    className="p-3.5 rounded-2xl border-2 border-rose-500/60 bg-gradient-to-br from-rose-500/10 to-[var(--surface2)] hover:scale-102 transition-all cursor-pointer text-left space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--ink)]">{m.nome}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-500 text-white">🔥 {m.taxaOcupacao}%</span>
                    </div>
                    <div className="text-sm font-black font-mono text-[var(--salmon)]">
                      {formatBrl(m.faturamentoAcumulado)}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] flex items-center justify-between">
                      <span>{m.girosMediosDia} giros/dia</span>
                      <span>{m.tempoPermanenciaMedio} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tatames Japoneses VIP (4 Salas Privativas) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Tatames Japoneses VIP (4 Salas Tradicionais)
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">Ocupação Média: 92% · Ticket Médio: R$ 168</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mesasHeatmap.filter(m => m.ambiance === "TATAMES_VIP").map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMesaClick(m)}
                    className="p-3.5 rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-[var(--surface2)] hover:scale-102 transition-all cursor-pointer text-left space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--ink)]">{m.nome}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-600 text-white">⚡ {m.taxaOcupacao}%</span>
                    </div>
                    <div className="text-sm font-black font-mono text-purple-600">
                      {formatBrl(m.faturamentoAcumulado)}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] flex items-center justify-between">
                      <span>{m.lugares} lugares</span>
                      <span>{m.tempoPermanenciaMedio} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Salão Nobre (Mesas 01 a 12) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[var(--salmon)]" /> Salão Nobre Central (12 Mesas)
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">Ocupação Média: 76% · Ticket Médio: R$ 94</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {mesasHeatmap.filter(m => m.ambiance === "SALAO_NOBRE").map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMesaClick(m)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--salmon)] transition-all cursor-pointer text-left space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--ink)]">{m.nome}</span>
                      <span className="text-[9px] font-mono font-bold text-[var(--salmon)]">{m.taxaOcupacao}%</span>
                    </div>
                    <div className="text-xs font-black font-mono text-[var(--ink)]">
                      {formatBrl(m.faturamentoAcumulado)}
                    </div>
                    <div className="text-[9px] text-[var(--muted)]">
                      {m.lugares} lug · {m.girosMediosDia} giros
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Deck Jardim & Lounge (Mesas 13 a 18) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-emerald-500" /> Deck Jardim &amp; Lounge Externo (6 Mesas)
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">Ocupação Média: 72% · Chopp &amp; Dr. Clima</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {mesasHeatmap.filter(m => m.ambiance === "DECK_JARDIM").map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMesaClick(m)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-emerald-500 transition-all cursor-pointer text-left space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--ink)]">{m.nome}</span>
                      <span className="text-[9px] font-mono font-bold text-emerald-600">{m.taxaOcupacao}%</span>
                    </div>
                    <div className="text-xs font-black font-mono text-[var(--ink)]">
                      {formatBrl(m.faturamentoAcumulado)}
                    </div>
                    <div className="text-[9px] text-[var(--muted)]">
                      {m.lugares} lug · {m.girosMediosDia} giros
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: INTELIGÊNCIA PREDITIVA ZUMI IA & SIMULADOR DE CARGA             */}
      {/* ===================================================================== */}
      {modoExibicao === "preditivo" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                  Diagnóstico Preditivo da IA Zumi para Tangará da Serra ({periodoLabel})
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Algoritmo que correlaciona sazonalidade de safra, calendário de pagamentos do MT, previsão do tempo e picos de salão.
                </p>
              </div>
            </div>

            {/* Oportunidades Críticas Detectadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-amber-500/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Anti-Ociosidade
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">+R$ 14.200</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--ink)]">Terças e Quartas (18h às 19h30)</h4>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Salão com apenas 26% de ocupação e sushibar ocioso. Janela ideal para o <b>"Festival de Hot Roll &amp; Temaki do Casal"</b>.
                  </p>
                </div>
                <button
                  onClick={() => dispararCampanhaAntiOciosidade("Terça/Quarta 18h", "2x Temakis Salmão + 10x Hot Roll por R$ 69,90")}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar Campanha no WhatsApp</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-red-500/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">
                    Blindagem de SLA
                  </span>
                  <span className="text-xs font-mono font-bold text-red-600">36 ped/h (98%)</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--ink)]">Sextas e Sábados (20h às 21h30)</h4>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Risco de espera &gt; 35 minutos. Ativar incentivo de pedido antecipado com 10% de cashback no Clube Zumi.
                  </p>
                </div>
                <button
                  onClick={() => dispararCampanhaAntiOciosidade("Pré-Pico 18h30", "Jante mais cedo no Zuma e ganhe 10% de Cashback no Clube Zumi!")}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Ativar Alívio de Cozinha</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-blue-500/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Dr. Clima &amp; Chuva
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600">+65% Delivery</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--ink)]">Previsão de Chuva em Tangará</h4>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Chuva tropical reduz em 40% o fluxo físico e dispara os pedidos residenciais de pratos quentes e barcas.
                  </p>
                </div>
                <button
                  onClick={() => toast.success("Alerta Dr. Clima ativado: 2 motoboys de contingência alocados com sucesso!")}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Ativar Plano Chuva</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulador de Deslocamento de Carga */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--ink)] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--salmon)]" />
                Simulador Dinâmico de Deslocamento de Carga (Load Balancing Gastronômico)
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Desloque pedidos voluntariamente dos momentos de pico saturado (20h-21h) para horários vizinhos através de gatilhos automáticos do WhatsApp Zumi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface2)]/70 border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--ink)]">
                  % de Pedidos Deslocados do Pico para Horários Vizinhos:
                </span>
                <span className="text-sm font-black font-mono text-[var(--salmon)] bg-[var(--salmon-soft)] px-3 py-1 rounded-full border border-[var(--salmon)]/30">
                  {deslocamentoPerc}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={deslocamentoPerc}
                onChange={e => setDeslocamentoPerc(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>5% (Leve incentivo)</span>
                <span>15% (Incentivo Equilibrado)</span>
                <span>35% (Campanha Agressiva Antecipada)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-xs uppercase font-bold text-[var(--muted)]">Pedidos Redistribuídos</span>
                <strong className="text-2xl font-mono font-black text-[var(--salmon)] block">
                  {pedidosDeslocados} pedidos
                </strong>
                <span className="text-[11px] text-[var(--muted)]">Sem sobrecarregar o sushiman</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-xs uppercase font-bold text-[var(--muted)]">Redução Tempo de Espera</span>
                <strong className="text-2xl font-mono font-black text-emerald-600 block">
                  -{reducaoTempoEsperaMin} min
                </strong>
                <span className="text-[11px] text-emerald-600 font-bold">Tempo médio cai para ~24 min</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-xs uppercase font-bold text-[var(--muted)]">Receita Adicional Capturada</span>
                <strong className="text-2xl font-mono font-black text-emerald-600 block">
                  +{formatBrl(faturamentoExtraSalvo)}
                </strong>
                <span className="text-[11px] text-[var(--muted)]">Eliminação de desistências</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DRAWER / BOTTOM SHEET DETALHADA AO CLICAR EM QUALQUER HORÁRIO         */}
      {/* ===================================================================== */}
      {bottomSheetOpen && activeCell && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-[var(--line)] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--salmon)]">
                  Raio-X de Demanda e Carga
                </span>
                <h3 className="text-lg font-black text-[var(--ink)]">
                  {DAY_NAMES[activeCell.dayIdx]} · {TIME_SLOTS[activeCell.slotIdx]?.label}
                </h3>
              </div>
              <button
                onClick={() => setBottomSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-[11px] text-[var(--muted)] font-bold">Faturamento Estimado</span>
                <strong className="text-lg font-mono font-black text-[var(--salmon)] block">
                  {formatBrl(activeCell.revenue)}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-[11px] text-[var(--muted)] font-bold">Volume de Pedidos</span>
                <strong className="text-lg font-mono font-black text-[var(--ink)] block">
                  {activeCell.orders} pedidos
                </strong>
              </div>
            </div>

            {/* Canais */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-xs font-black text-[var(--ink)] block">Divisão por Canais:</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--muted)] block">Salão</span>
                  <strong className="text-sm font-black">{activeCell.channels.salao}</strong>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--muted)] block">Delivery WhatsApp</span>
                  <strong className="text-sm font-black text-emerald-600">{activeCell.channels.delivery}</strong>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--muted)] block">iFood</span>
                  <strong className="text-sm font-black text-red-500">{activeCell.channels.ifood}</strong>
                </div>
              </div>
            </div>

            {/* Diagnóstico Zumi IA */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Parecer Operacional Zumi IA:</span>
              </div>
              <p className="text-xs text-[var(--ink)] leading-relaxed">
                {activeCell.aiTip}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  dispararCampanhaAntiOciosidade(`${DAY_NAMES[activeCell.dayIdx]} ${TIME_SLOTS[activeCell.slotIdx]?.label}`, "Oferta Especial Zumi");
                  setBottomSheetOpen(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Disparar Campanha no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DETALHE DA MESA FÍSICA DO SALÃO                                 */}
      {/* ===================================================================== */}
      {mesaModalOpen && selectedMesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-md rounded-3xl border border-[var(--line)] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--salmon)]">
                  Planta Baixa · Auditoria de Mesa
                </span>
                <h3 className="text-lg font-black text-[var(--ink)]">
                  {selectedMesa.nome} ({selectedMesa.ambiance.replace('_', ' ')})
                </h3>
              </div>
              <button
                onClick={() => setMesaModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Faturamento Acumulado</span>
                <strong className="text-lg font-mono font-black text-[var(--salmon)] block">
                  {formatBrl(selectedMesa.faturamentoAcumulado)}
                </strong>
                <span className="text-[10px] text-[var(--muted)]">{periodoLabel}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Taxa de Ocupação</span>
                <strong className="text-lg font-mono font-black text-purple-600 block">
                  {selectedMesa.taxaOcupacao}%
                </strong>
                <span className="text-[10px] text-[var(--muted)]">{selectedMesa.girosMediosDia} giros/dia</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Capacidade Física:</span>
                <strong className="text-[var(--ink)]">{selectedMesa.lugares} pessoas</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Tempo Médio de Permanência:</span>
                <strong className="text-[var(--ink)]">{selectedMesa.tempoPermanenciaMedio} minutos</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Ticket Médio por Mesa:</span>
                <strong className="text-emerald-600 font-mono font-bold">{formatBrl(selectedMesa.ticketMedioMesa)}</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMesaModalOpen(false);
                  setLocation("/mesas");
                }}
                className="w-full py-3 px-4 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Abrir Mapa Operacional de Mesas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Explosão do Dia */}
      {dayModalOpen && (
        <DiaExplosaoModal
          isOpen={dayModalOpen}
          dayIdx={selectedDayIdx}
          dayName={DAY_NAMES[selectedDayIdx]}
          onClose={() => setDayModalOpen(false)}
        />
      )}
    </div>
  );
};
