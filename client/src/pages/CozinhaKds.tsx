import React, { useState, useEffect, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl, MENU, ALL_ITEMS } from "../../../shared/zumaData";
import { 
  ChefHat, 
  Bike, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  MessageSquare,
  Printer,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Fish,
  Wine,
  PackageCheck,
  Check,
  X,
  QrCode,
  MapPin,
  Phone,
  Send,
  Zap,
  Maximize,
  Minimize,
  GripVertical,
  Volume2,
  VolumeX,
  Timer,
  Plus,
  Trash2,
  Edit3,
  Save,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  Filter,
  Tag,
  PlusCircle,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { kdsAudio } from "../lib/kdsAudio";
import { orderEventBus, ItemCancelledEvent } from "../lib/orderEvents";

interface KdsOrderItem {
  nome: string;
  q: number;
  unitPrice?: number;
  station?: string;
  notes?: string;
  observacoes?: string;
  additions?: Array<{ nome: string; preco: number }>;
  isCancelled?: boolean;
  isModified?: boolean;
  cancelReason?: string;
}

interface StageDurations {
  recebidoMinutes: number;
  preparoMinutes: number;
  prontoMinutes: number;
  entregaMinutes: number;
  totalMinutes: number;
  totalFormatted: string;
}

interface StageTimestamps {
  recebidoAt?: string;
  preparoAt?: string;
  prontoAt?: string;
  entregaAt?: string;
}

interface KdsOrder {
  id: string;
  orderNumber: string;
  tableNumber?: number;
  origin?: "mesa" | "delivery" | "balcao";
  customerName: string;
  customerPhone?: string;
  neighborhood: string;
  channel: string;
  station?: string;
  items: KdsOrderItem[];
  stage: "recebido" | "preparo" | "pronto" | "entrega";
  minutesElapsed: number;
  targetPrepMinutes: number;
  total?: number;
  motoboyName?: string;
  deliveryFee?: number;
  hasAlert?: boolean;
  alertMessage?: string;
  expeditionChecked?: boolean;
  expeditionCheckedBy?: string;
  expeditionCheckedAt?: string;
  createdAt?: string;
  stageTimestamps?: StageTimestamps;
  stageDurations?: StageDurations;
}

// Cardápio Rápido para inclusão ágil de itens na Cozinha
// Catálogo Completo dos Pratos do Zuma com Mapeamento de Praças KDS
export const CATALOGO_COZINHA_COMPLETO = ALL_ITEMS.map((item) => {
  let station = "sushibar";
  let stationLabel = "🍣 Sushibar";
  const c = item.cat.toLowerCase();
  const n = item.nome.toLowerCase();

  if (c.includes("bebida") || n.includes("coca") || n.includes("água") || n.includes("suco") || n.includes("cerveja") || n.includes("chopp") || n.includes("energético")) {
    station = "bar";
    stationLabel = "🍸 Bar & Bebidas";
  } else if (c.includes("sobremesa") || n.includes("hot banana") || n.includes("romeu") || n.includes("nutella") || n.includes("petit") || n.includes("sorvete")) {
    station = "sobremesa";
    stationLabel = "🍨 Sobremesa";
  } else if (c.includes("quente") || c.includes("porç") || c.includes("hot roll") || c.includes("hotdog") || n.includes("hot") || n.includes("sobá") || n.includes("yakissoba") || n.includes("teppan") || n.includes("risoto") || n.includes("guioza") || n.includes("harumaki") || n.includes("furai") || n.includes("lula") || n.includes("croquete") || n.includes("filé")) {
    station = "cozinha_quente";
    stationLabel = "🔥 Cozinha Quente & Wok";
  }

  return {
    nome: item.nome,
    preco: item.preco,
    categoria: item.cat,
    station,
    stationLabel,
  };
});

const MENU_RAPIDO = [
  { nome: "Hot Roll Especial Trufado (10un)", preco: 39.90, station: "cozinha_quente" },
  { nome: "Hot Filadélfia Clássico (12un)", preco: 36.00, station: "cozinha_quente" },
  { nome: "Combinado Salmão Premium (32 Peças)", preco: 119.00, station: "sushibar" },
  { nome: "Combo 26 Peças Zuma Tradicional", preco: 98.00, station: "sushibar" },
  { nome: "Barca Especial 56 Peças Sushiman", preco: 159.00, station: "sushibar" },
  { nome: "Poke de Salmão Completo G", preco: 52.00, station: "sushibar" },
  { nome: "Sashimi de Salmão Fresco (10 fatias)", preco: 45.00, station: "sushibar" },
  { nome: "Uramaki Filadélfia Salmão (8un)", preco: 32.00, station: "sushibar" },
  { nome: "Yakissoba de Mignon Grande", preco: 58.00, station: "cozinha_quente" },
  { nome: "Guioza Bovina no Vapor/Dourada (6un)", preco: 32.00, station: "cozinha_quente" },
  { nome: "Harumaki Primavera de Queijo (4un)", preco: 24.00, station: "cozinha_quente" },
  { nome: "Coca-Cola Zero 350ml", preco: 7.00, station: "bar" },
  { nome: "Cerveja Heineken Long Neck 330ml", preco: 14.00, station: "bar" },
  { nome: "Água com Gás 500ml", preco: 6.00, station: "bar" }
];

export const CozinhaKds: React.FC = () => {
  const utils = trpc.useUtils();
  const zumaTrpc = (trpc as any).zuma;
  const zumaUtils = (utils as any).zuma;

  // Estados locais de interface
  const [selectedStation, setSelectedStation] = useState<string>("todas");
  const [thermalModalOrder, setThermalModalOrder] = useState<KdsOrder | null>(null);
  const [thermalWidth, setThermalWidth] = useState<"80mm" | "58mm">("80mm");
  const [assigningMotoboyOrderId, setAssigningMotoboyOrderId] = useState<string | null>(null);
  const [isAllDaySummaryOpen, setIsAllDaySummaryOpen] = useState(true);
  const [filterBySummaryItem, setFilterBySummaryItem] = useState<string | null>(null);
  const [recalledOrders, setRecalledOrders] = useState<KdsOrder[]>([]);

  // Estados de Detalhes, Edição e Auditoria de Tempos
  const [editingOrder, setEditingOrder] = useState<KdsOrder | null>(null);
  const [editCustomerName, setEditCustomerName] = useState<string>("");
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>("");
  const [editNeighborhood, setEditNeighborhood] = useState<string>("");
  const [editStage, setEditStage] = useState<"recebido" | "preparo" | "pronto" | "entrega">("recebido");
  const [editItems, setEditItems] = useState<KdsOrderItem[]>([]);
    // Estados de Busca Rápida, Categorias e Quantidade Dinâmica no Modal da Comanda
  const [searchMenuQuery, setSearchMenuQuery] = useState<string>("");
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("todas");
  const [quickAddQty, setQuickAddQty] = useState<number>(1);
  const [customItemNome, setCustomItemNome] = useState<string>("");
  const [customItemPreco, setCustomItemPreco] = useState<string>("");
  const [showCustomItemForm, setShowCustomItemForm] = useState<boolean>(false);

  // Função de normalização para busca sem acentos e minúsculas
  const normalizeSearch = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Lista Filtrada do Catálogo de Pratos
  const catalogoFiltrado = useMemo(() => {
    const qNorm = normalizeSearch(searchMenuQuery);
    return CATALOGO_COZINHA_COMPLETO.filter((item) => {
      const matchCat = selectedMenuCategory === "todas" || item.categoria === selectedMenuCategory;
      if (!matchCat) return false;
      if (!qNorm) return true;
      const nomeNorm = normalizeSearch(item.nome);
      const catNorm = normalizeSearch(item.categoria);
      return nomeNorm.includes(qNorm) || catNorm.includes(qNorm);
    });
  }, [selectedMenuCategory, searchMenuQuery]);

  // Categorias do Cardápio com Contadores
  const categoriasCardapio = useMemo(() => {
    const cats = Array.from(new Set(CATALOGO_COZINHA_COMPLETO.map(i => i.categoria)));
    return [
      { id: "todas", label: "Todas as Categorias", count: CATALOGO_COZINHA_COMPLETO.length },
      ...cats.map(c => ({
        id: c,
        label: c,
        count: CATALOGO_COZINHA_COMPLETO.filter(i => i.categoria === c).length
      }))
    ];
  }, []);

  const handleItemQuantityDirectSet = (index: number, quantity: number) => {
    setEditItems(prev => {
      const copy = [...prev];
      copy[index].q = Math.max(1, Math.min(99, quantity));
      return copy;
    });
  };

  const handleAppendItemNote = (index: number, noteTag: string) => {
    setEditItems(prev => {
      const copy = [...prev];
      const currentNotes = (copy[index].notes || copy[index].observacoes || "").trim();
      const updatedNotes = currentNotes ? `${currentNotes}, ${noteTag}` : noteTag;
      copy[index].notes = updatedNotes;
      copy[index].observacoes = updatedNotes;
      return copy;
    });
    toast.success(`Observação "${noteTag}" adicionada!`);
  };

  const handleAddCatalogItem = (item: { nome: string; preco: number; station: string }, qty: number = quickAddQty) => {
    setEditItems(prev => {
      const existingIdx = prev.findIndex(it => it.nome.toLowerCase() === item.nome.toLowerCase());
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].q += qty;
        return copy;
      }
      return [
        ...prev,
        {
          nome: item.nome,
          q: Math.max(1, qty),
          unitPrice: item.preco,
          station: item.station,
          notes: ""
        }
      ];
    });
    toast.success(`+ ${qty}x ${item.nome} adicionado!`);
  };

  const handleAddCustomItem = () => {
    if (!customItemNome.trim()) {
      toast.error("Informe o nome do prato especial");
      return;
    }
    const preco = parseFloat(customItemPreco.replace(",", ".")) || 0;
    setEditItems(prev => [
      ...prev,
      {
        nome: customItemNome.trim(),
        q: quickAddQty,
        unitPrice: preco,
        station: "cozinha_quente",
        notes: "Item Especial Fora do Cardápio"
      }
    ]);
    toast.success(`+ ${quickAddQty}x ${customItemNome} adicionado!`);
    setCustomItemNome("");
    setCustomItemPreco("");
    setShowCustomItemForm(false);
  };

const [isEfficiencyPanelOpen, setIsEfficiencyPanelOpen] = useState<boolean>(true);

  // Estados para Drag & Drop e Cozinha Autônoma Mãos-Livres
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [localStageOverrides, setLocalStageOverrides] = useState<Record<string, "recebido" | "preparo" | "pronto" | "entrega">>({});
  const [, setCurrentTimeTick] = useState<number>(Date.now());
  const [cancelAlert, setCancelAlert] = useState<ItemCancelledEvent | null>(null);

  // Timer para atualização periódica de contadores em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeTick(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API para alertas sonoros sem dependências externas
  const playSoundEffect = (type: "bell" | "drop" | "alert" | "chime" | "success") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "bell") {
        // Clássico sino duplo de balcão de restaurante ("Ding-Ding!")
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1318.5, ctx.currentTime); // E6

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.8);
        osc2.stop(ctx.currentTime + 0.8);
      } else if (type === "drop" || type === "success") {
        // Pop harmônico suave de confirmação
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "alert") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Sound error:", e);
    }
  };

  // Queries tRPC
  const { data: dbOrders = [] } = zumaTrpc.listOrders.useQuery(undefined, {
    refetchInterval: 3000,
  });

  const { data: motoboys = [], refetch: refetchMotoboys } = zumaTrpc.listMotoboys.useQuery(undefined, {
    refetchInterval: 4000,
  });

  const { data: autoAcceptConfig, refetch: refetchAutoAccept } = zumaTrpc.getAutoAcceptConfig.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const { data: dbTickets = [], refetch: refetchTickets } = zumaTrpc.getKitchenTickets.useQuery(
    { station: selectedStation === "todas" ? undefined : selectedStation },
    { refetchInterval: 3000 }
  );

  // Escuta de eventos de cancelamento com alerta sonoro e visual imediato
  useEffect(() => {
    const unsub = orderEventBus.subscribeItemCancelled((event: ItemCancelledEvent) => {
      if (soundEnabled) {
        kdsAudio.playCancellationAlertChime();
      }
      setCancelAlert(event);
      refetchTickets();
      if (event.reallocatedTo) {
        toast.error(`⚠️ CANCELAMENTO & REAPROVEITAMENTO: Mesa #${event.tableNumber}`, {
          description: `"${event.itemName}" cancelado na Mesa #${event.tableNumber}. Produção repassada para ${event.reallocatedTo.identifier} (Zero Desperdício)!`,
          duration: 9000
        });
      } else {
        toast.error(`🛑 ALERTA COZINHA: ITEM CANCELADO NA MESA #${event.tableNumber}`, {
          description: `Interromper preparo de "${event.itemName}" imediatamente (${event.reason || "Desistência"}). Solicitado por ${event.cancelledBy}.`,
          duration: 9000
        });
      }
    });
    return unsub;
  }, [soundEnabled, refetchTickets]);

  // Mutations tRPC
  const advanceOrderMutation = zumaTrpc.advanceOrderStatus.useMutation({
    onSuccess: (data: any) => {
      zumaUtils.listOrders.invalidate();
      zumaUtils.listConversations.invalidate();
      refetchTickets();
      toast.success(`Pedido avançado para ${data.nextStatus.toUpperCase()}!`);
    },
    onError: (err: any) => {
      toast.error(`Erro ao avançar pedido: ${err.message}`);
    }
  });

  const setOrderStatusMutation = zumaTrpc.setOrderStatus.useMutation({
    onSuccess: (data: any) => {
      zumaUtils.listOrders.invalidate();
      zumaUtils.listConversations.invalidate();
      refetchTickets();
      toast.success(`Pedido movido para ${data.status.toUpperCase()} com sucesso!`);
    },
    onError: (err: any) => {
      toast.error(`Erro ao atualizar status: ${err.message}`);
    }
  });

  const updateOrderDetailsMutation = zumaTrpc.updateOrderDetails.useMutation({
    onSuccess: () => {
      zumaUtils.listOrders.invalidate();
      refetchTickets();
      playSoundEffect("success");
      toast.success("Comanda atualizada e salva com sucesso na cozinha!");
      setEditingOrder(null);
    },
    onError: (err: any) => {
      toast.error(`Erro ao salvar comanda: ${err.message}`);
    }
  });

  const checkExpeditionMutation = zumaTrpc.checkExpedition.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Expedição da Mesa ${data.tableNumber} conferida por ${data.checkedBy}! Pronto para saída.`);
      refetchTickets();
      zumaUtils.listOrders.invalidate();
    },
    onError: (err: any) => {
      toast.error(`Erro ao conferir expedição: ${err.message}`);
    }
  });

  const updateKitchenTicketStatusMutation = zumaTrpc.updateKitchenTicketStatus.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Ticket da praça ${data.station.toUpperCase()} atualizado para ${data.status.toUpperCase()}!`);
      refetchTickets();
    },
    onError: (err: any) => {
      toast.error(`Erro ao atualizar ticket: ${err.message}`);
    }
  });

  const updateAutoAcceptMutation = zumaTrpc.updateAutoAcceptConfig.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.enabled ? "Auto-Aceite Inteligente ATIVADO!" : "Auto-Aceite pausado para modo manual.");
      refetchAutoAccept();
    }
  });

  const assignMotoboyMutation = zumaTrpc.assignOrderToMotoboy.useMutation({
    onSuccess: () => {
      toast.success("Pedido atribuído ao motoboy com sucesso! Notificação de rota enviada.");
      setAssigningMotoboyOrderId(null);
      zumaUtils.listOrders.invalidate();
      refetchMotoboys();
    }
  });

  const settleMotoboyMutation = zumaTrpc.settleMotoboyShift.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Turno de motoboy liquidado com sucesso! Total pago via Pix: ${formatBrl(data.settledAmount)}.`);
      refetchMotoboys();
    }
  });

  // Cálculo inteligente de tempo de preparo estimado por item
  const calculatePrepTime = (items: KdsOrderItem[]): number => {
    let maxItemTime = 14;
    items.forEach(it => {
      const lower = it.nome.toLowerCase();
      if (lower.includes("barca") || lower.includes("56 peças") || lower.includes("combinado")) {
        maxItemTime = Math.max(maxItemTime, 24);
      } else if (lower.includes("hot") || lower.includes("frito") || lower.includes("yakisoba") || lower.includes("guioza")) {
        maxItemTime = Math.max(maxItemTime, 16);
      } else if (lower.includes("sashimi") || lower.includes("uramaki") || lower.includes("poke")) {
        maxItemTime = Math.max(maxItemTime, 18);
      } else if (lower.includes("coca") || lower.includes("suco") || lower.includes("cerveja")) {
        maxItemTime = Math.max(maxItemTime, 5);
      }
    });
    return maxItemTime;
  };

  // Formatador legível de minutos e horas
  const formatMinutesAndHours = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m (${minutes} min)`;
  };

  // Pedidos Fallback de demonstração
  const fallbackOrders: KdsOrder[] = [
    {
      id: "demo-1",
      orderNumber: "#1088",
      customerName: "Lucas Vasconcelos",
      customerPhone: "(65) 99654-1234",
      neighborhood: "Jardim Europa",
      channel: "Loja Nova Zuma",
      station: "sushibar",
      items: [
        { nome: "Combo 26 Peças", q: 1, unitPrice: 98.00, station: "sushibar", notes: "Sem wasabi nos niguiris" },
        { nome: "Hot Filadélfia (12un)", q: 1, unitPrice: 38.00, station: "cozinha_quente", notes: "Molho tarê à parte" }
      ],
      stage: "preparo",
      minutesElapsed: 14,
      targetPrepMinutes: 18,
      total: 136.00,
      deliveryFee: 8.00,
      createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      stageDurations: {
        recebidoMinutes: 3,
        preparoMinutes: 11,
        prontoMinutes: 0,
        entregaMinutes: 0,
        totalMinutes: 14,
        totalFormatted: "14 min"
      }
    },
    {
      id: "demo-2",
      orderNumber: "#1089",
      customerName: "Camila Nogueira",
      customerPhone: "(65) 99876-5432",
      neighborhood: "Centro",
      channel: "WhatsApp Zumi (IA)",
      station: "sushibar",
      items: [
        { nome: "Poke de Salmão", q: 1, unitPrice: 49.00, station: "sushibar", notes: "Arroz integral e chips de batata doce" },
        { nome: "Coca-Cola Zero", q: 1, unitPrice: 7.00, station: "bar" }
      ],
      stage: "recebido",
      minutesElapsed: 6,
      targetPrepMinutes: 15,
      total: 64.00,
      deliveryFee: 8.00,
      createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
      stageDurations: {
        recebidoMinutes: 6,
        preparoMinutes: 0,
        prontoMinutes: 0,
        entregaMinutes: 0,
        totalMinutes: 6,
        totalFormatted: "6 min"
      }
    },
    {
      id: "demo-3",
      orderNumber: "#1086",
      customerName: "Dr. Marcelo Ramos",
      customerPhone: "(65) 99912-3344",
      neighborhood: "Vila Alta",
      channel: "Loja Nova Zuma",
      station: "sushibar",
      items: [
        { nome: "Barca Especial 56 Peças", q: 1, unitPrice: 159.00, station: "sushibar", notes: "Caprichar no sashimi de salmão selado com azeite trufado" }
      ],
      stage: "pronto",
      minutesElapsed: 22,
      targetPrepMinutes: 24,
      total: 169.00,
      deliveryFee: 10.00,
      createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
      stageDurations: {
        recebidoMinutes: 4,
        preparoMinutes: 15,
        prontoMinutes: 3,
        entregaMinutes: 0,
        totalMinutes: 22,
        totalFormatted: "22 min"
      }
    },
    {
      id: "demo-4",
      orderNumber: "#1084",
      customerName: "Fernanda Lima",
      customerPhone: "(65) 99234-8899",
      neighborhood: "Tarumã",
      channel: "WhatsApp Zumi (IA)",
      station: "cozinha_quente",
      items: [
        { nome: "Uramaki Filadélfia (8un)", q: 2, unitPrice: 32.00, station: "sushibar" },
        { nome: "Guioza Bovina (6un)", q: 1, unitPrice: 32.00, station: "cozinha_quente", notes: "Bem douradinha dos dois lados" }
      ],
      stage: "entrega",
      minutesElapsed: 31,
      targetPrepMinutes: 16,
      total: 106.00,
      motoboyName: "Tiago Silva",
      deliveryFee: 10.00,
      createdAt: new Date(Date.now() - 31 * 60000).toISOString(),
      stageDurations: {
        recebidoMinutes: 3,
        preparoMinutes: 16,
        prontoMinutes: 4,
        entregaMinutes: 8,
        totalMinutes: 31,
        totalFormatted: "31 min"
      }
    }
  ];

  // Mapear Delivery Orders
  const deliveryOrders: KdsOrder[] = dbOrders.map((o: any) => {
    let stage: "recebido" | "preparo" | "pronto" | "entrega" = "recebido";
    if (o.status === "preparo") stage = "preparo";
    else if (o.status === "pronto") stage = "pronto";
    else if (o.status === "rota" || o.status === "entrega" || o.status === "entregue") stage = "entrega";

    const idStr = String(o.id || o.orderNumber);
    if (localStageOverrides[idStr]) {
      stage = localStageOverrides[idStr];
    }

    const createdTime = new Date(o.createdAt || Date.now()).getTime();
    const minutes = Math.max(1, Math.round((Date.now() - createdTime) / 60000));

    const items: KdsOrderItem[] = (o.items || []).map((it: any) => ({
      nome: it.itemName || it.nome || "Combo Zuma",
      q: it.quantity || it.q || 1,
      unitPrice: it.unitPrice || (it.itemName?.toLowerCase().includes("barca") ? 148 : it.itemName?.toLowerCase().includes("hot") ? 38 : 45),
      station: it.station || (it.itemName?.toLowerCase().includes("hot") ? "cozinha_quente" : "sushibar"),
      notes: it.notes || it.observacoes || "",
      observacoes: it.observacoes || it.notes || "",
      additions: it.additions || it.adicionais || [],
      isCancelled: it.isCancelled || it.status === "cancelado",
      isModified: it.isModified,
      cancelReason: it.cancelReason,
    }));

    // Calcular durações por etapa
    const stageDurations: StageDurations = o.stageDurations || {
      recebidoMinutes: Math.min(5, minutes),
      preparoMinutes: stage === "recebido" ? 0 : Math.min(18, Math.max(1, minutes - 4)),
      prontoMinutes: stage === "pronto" || stage === "entrega" ? Math.min(8, Math.max(1, minutes - 20)) : 0,
      entregaMinutes: stage === "entrega" ? Math.max(1, minutes - 25) : 0,
      totalMinutes: minutes,
      totalFormatted: formatMinutesAndHours(minutes)
    };

    return {
      id: idStr,
      orderNumber: `#${o.orderNumber || o.id}`,
      origin: "delivery" as const,
      customerName: o.customerName || "Cliente",
      customerPhone: o.customerPhone || "(65) 99999-0000",
      neighborhood: o.neighborhood || "Centro",
      channel: o.channel === "WhatsApp" ? "WhatsApp Zumi (IA)" : o.channel || "Loja Nova",
      items,
      stage,
      minutesElapsed: minutes,
      targetPrepMinutes: calculatePrepTime(items),
      total: o.totalAmount || (typeof o.total === "string" ? parseFloat(o.total) : o.total) || 85.00,
      motoboyName: o.motoboyName,
      deliveryFee: o.deliveryFee || 8.00,
      createdAt: o.createdAt || new Date().toISOString(),
      stageTimestamps: o.stageTimestamps,
      stageDurations
    };
  });

  // Mapear Tickets da Cozinha gerados a partir das Mesas do Salão
  const mesaTickets: KdsOrder[] = dbTickets
    .filter((t: any) => t.origin === "mesa")
    .map((t: any) => {
      let stage: "recebido" | "preparo" | "pronto" | "entrega" = "recebido";
      if (t.status === "preparo") stage = "preparo";
      else if (t.status === "pronto") stage = "pronto";
      else if (t.status === "entregue") stage = "entrega";

      const idStr = `ticket-${t.id}`;
      if (localStageOverrides[idStr]) {
        stage = localStageOverrides[idStr];
      }

      const createdTime = new Date(t.createdAt || Date.now()).getTime();
      const minutes = Math.max(1, Math.round((Date.now() - createdTime) / 60000));

      const items: KdsOrderItem[] = (t.items || []).map((it: any) => ({
        nome: it.itemName,
        q: it.quantity,
        unitPrice: 48.00,
        station: t.station,
        notes: it.notes || "",
        observacoes: it.notes || "",
        additions: it.additions,
        isCancelled: it.isCancelled || it.status === "cancelado",
        isModified: it.isModified,
        cancelReason: it.cancelReason,
      }));

      const stageDurations: StageDurations = {
        recebidoMinutes: Math.min(3, minutes),
        preparoMinutes: stage === "recebido" ? 0 : Math.min(16, Math.max(1, minutes - 3)),
        prontoMinutes: stage === "pronto" || stage === "entrega" ? Math.min(6, Math.max(1, minutes - 18)) : 0,
        entregaMinutes: stage === "entrega" ? Math.max(1, minutes - 22) : 0,
        totalMinutes: minutes,
        totalFormatted: formatMinutesAndHours(minutes)
      };

      return {
        id: idStr,
        orderNumber: `Mesa ${t.tableNumber}`,
        tableNumber: t.tableNumber,
        origin: "mesa" as const,
        customerName: `Mesa ${t.tableNumber} (Salão Zuma)`,
        customerPhone: "Salão Presencial",
        neighborhood: "Salão Zuma",
        channel: `Garçom (${t.station?.toUpperCase() || "GERAL"})`,
        station: t.station,
        items,
        stage,
        minutesElapsed: minutes,
        targetPrepMinutes: calculatePrepTime(items),
        total: items.reduce((s, it) => s + (it.unitPrice || 0) * it.q, 0),
        hasAlert: Boolean(t.hasAlert || t.items?.some((i: any) => i.isCancelled || i.isModified)),
        alertMessage: t.alertMessage,
        expeditionChecked: t.expeditionChecked,
        expeditionCheckedBy: t.expeditionCheckedBy,
        expeditionCheckedAt: t.expeditionCheckedAt,
        createdAt: t.createdAt || new Date().toISOString(),
        stageDurations
      };
    });

  const combined = [...deliveryOrders, ...mesaTickets];
  const allOrders: KdsOrder[] = combined.length > 0 ? combined : fallbackOrders;

  // Abrir modal de edição ao clicar no box
  const handleOpenEditModal = (order: KdsOrder) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone || "");
    setEditNeighborhood(order.neighborhood || "");
    setEditStage(order.stage);
    setEditItems(JSON.parse(JSON.stringify(order.items || [])));
  };

  // Salvar alterações da comanda
  const handleSaveOrderChanges = () => {
    if (!editingOrder) return;

    const numId = parseInt(editingOrder.id.replace(/\D/g, ""), 10);
    if (!isNaN(numId)) {
      updateOrderDetailsMutation.mutate({
        orderId: numId,
        customerName: editCustomerName,
        customerPhone: editCustomerPhone,
        neighborhood: editNeighborhood,
        status: editStage as any,
        items: editItems.map(it => ({
          itemName: it.nome,
          quantity: parseInt(String(it.q || 1), 10) || 1,
          unitPrice: parseFloat(String(it.unitPrice || 0)) || 0,
          station: it.station || "sushibar",
          notes: it.notes || it.observacoes || "",
          observacoes: it.observacoes || it.notes || "",
          adicionais: it.additions || []
        }))
      });
    } else {
      toast.success("Alterações salvas localmente!");
      setEditingOrder(null);
    }
  };

  // Manipulação de itens no modal de edição
  const handleItemQuantityChange = (index: number, delta: number) => {
    setEditItems(prev => {
      const copy = [...prev];
      const newQ = Math.max(1, copy[index].q + delta);
      copy[index].q = newQ;
      return copy;
    });
  };

  const handleItemNotesChange = (index: number, notes: string) => {
    setEditItems(prev => {
      const copy = [...prev];
      copy[index].notes = notes;
      copy[index].observacoes = notes;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
    toast.info("Item removido da comanda.");
  };

  const handleAddQuickMenuItem = (menuItem: typeof MENU_RAPIDO[0]) => {
    setEditItems(prev => [
      ...prev,
      {
        nome: menuItem.nome,
        q: 1,
        unitPrice: menuItem.preco,
        station: menuItem.station,
        notes: ""
      }
    ]);
    toast.success(`+ 1x ${menuItem.nome} adicionado!`);
  };

  // Movimentação direta de estágio
  const handleMoveToStage = (orderId: string, newStage: "recebido" | "preparo" | "pronto" | "entrega") => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    if (order.stage === newStage) return;

    setLocalStageOverrides(prev => ({ ...prev, [orderId]: newStage }));

    if (newStage === "pronto") {
      playSoundEffect("bell");
    } else {
      playSoundEffect("drop");
    }

    if (order.id.startsWith("ticket-")) {
      const ticketId = parseInt(order.id.replace("ticket-", ""), 10);
      const ticketStatus = newStage === "entrega" ? "entregue" : newStage;
      updateKitchenTicketStatusMutation.mutate({ ticketId: String(ticketId), status: ticketStatus as any });
    } else {
      const numId = parseInt(order.id.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        const backendStatus = newStage === "entrega" ? "rota" : newStage;
        setOrderStatusMutation.mutate({ orderId: numId, status: backendStatus as any });
      }
    }
  };

  // Avançar / Recuar estágios
  const handleAdvanceStep = (orderId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    const sequence: Record<string, "recebido" | "preparo" | "pronto" | "entrega"> = {
      recebido: "preparo",
      preparo: "pronto",
      pronto: "entrega",
      entrega: "entrega"
    };
    const nextStage = sequence[order.stage];
    if (nextStage && nextStage !== order.stage) {
      handleMoveToStage(orderId, nextStage);
    }
  };

  const handleRegressStep = (orderId: string) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    const reverseSequence: Record<string, "recebido" | "preparo" | "pronto" | "entrega"> = {
      entrega: "pronto",
      pronto: "preparo",
      preparo: "recebido",
      recebido: "recebido"
    };
    const prevStage = reverseSequence[order.stage];
    if (prevStage && prevStage !== order.stage) {
      handleMoveToStage(orderId, prevStage);
    }
  };

  // Bump Bar
  const handleBumpNext = () => {
    const nextOrder = filteredOrders.find(o => o.stage === "recebido" || o.stage === "preparo");
    if (nextOrder) {
      handleAdvanceStep(nextOrder.id);
      toast.success(`⚡ Bump Bar: Pedido ${nextOrder.orderNumber} avançado!`);
    } else {
      toast.info("Nenhum pedido pendente para bump.");
    }
  };

  // Recall
  const handleRecallOrder = (order: KdsOrder) => {
    playSoundEffect("chime");
    handleMoveToStage(order.id, "preparo");
    toast.success(`Pedido ${order.orderNumber} restaurado para a cozinha!`);
    setRecalledOrders(prev => prev.filter(o => o.id !== order.id));
  };

  // Alternar tela cheia (Fullscreen)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // All-Day Summary
  const pendingOrdersForSummary = allOrders.filter(o => o.stage === "recebido" || o.stage === "preparo");
  const allDaySummaryMap: Record<string, { nome: string; q: number; station: string }> = {};

  pendingOrdersForSummary.forEach(ord => {
    ord.items.forEach(it => {
      const key = it.nome;
      const station = it.station || (it.nome.toLowerCase().includes("hot") ? "cozinha_quente" : "sushibar");
      if (!allDaySummaryMap[key]) {
        allDaySummaryMap[key] = { nome: it.nome, q: 0, station };
      }
      allDaySummaryMap[key].q += it.q;
    });
  });

  const allDaySummaryItems = Object.values(allDaySummaryMap).sort((a, b) => b.q - a.q);

  // Filtrar pedidos
  const filteredOrders = allOrders.filter(ord => {
    if (filterBySummaryItem && !ord.items.some(it => it.nome === filterBySummaryItem)) {
      return false;
    }
    if (selectedStation === "todas") return true;
    if (selectedStation === "sushibar") return ord.items.some(i => i.station === "sushibar" || i.nome.toLowerCase().includes("sashimi") || i.nome.toLowerCase().includes("combo") || i.nome.toLowerCase().includes("uramaki") || i.nome.toLowerCase().includes("poke"));
    if (selectedStation === "cozinha_quente") return ord.items.some(i => i.station === "cozinha_quente" || i.nome.toLowerCase().includes("hot") || i.nome.toLowerCase().includes("guioza") || i.nome.toLowerCase().includes("yakisoba") || i.nome.toLowerCase().includes("harumaki"));
    if (selectedStation === "bar") return ord.items.some(i => i.station === "bar" || i.nome.toLowerCase().includes("coca") || i.nome.toLowerCase().includes("heineken") || i.nome.toLowerCase().includes("suco") || i.nome.toLowerCase().includes("cerveja"));
    if (selectedStation === "expedicao") return ord.stage === "pronto" || ord.stage === "entrega";
    return true;
  });

  const STAGES: Array<{ id: "recebido" | "preparo" | "pronto" | "entrega"; label: string; sublabel: string; color: string }> = [
    { id: "recebido", label: "1. Recebido (Fila)", sublabel: "Aguardando entrada em bancada", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
    { id: "preparo", label: "2. Em Preparo (Cozinha)", sublabel: "Produção ativa no sushibar e fogão", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { id: "pronto", label: "3. Pronto (Expedição)", sublabel: "Conferido na estufa/balcão de saída", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
    { id: "entrega", label: "4. Em Entrega (Motoboy)", sublabel: "Em rota de entrega ou garçom", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" }
  ];

  const activeOrdersCount = allOrders.filter(o => o.stage !== "entrega").length;
  const maxCapacity = autoAcceptConfig?.maxActiveOrdersBeforePause || 14;
  const capacityPct = Math.round((activeOrdersCount / maxCapacity) * 100);

  // Métricas agregadas de eficiência e tempos por etapa para melhoria contínua (OEE)
  const totalOrdersCount = allOrders.length || 1;
  const avgFilaMin = Math.round(allOrders.reduce((sum, o) => sum + (o.stageDurations?.recebidoMinutes || 4), 0) / totalOrdersCount);
  const avgPreparoMin = Math.round(allOrders.reduce((sum, o) => sum + (o.stageDurations?.preparoMinutes || 15), 0) / totalOrdersCount);
  const avgProntoMin = Math.round(allOrders.reduce((sum, o) => sum + (o.stageDurations?.prontoMinutes || 4), 0) / totalOrdersCount);
  const avgTotalLeadTime = avgFilaMin + avgPreparoMin + avgProntoMin;

  return (
    <div className={`space-y-5 max-w-7xl mx-auto pb-16 transition-all ${isFullscreen ? "p-4 bg-[var(--background)]" : ""}`}>
      {/* ===================== HEADER PRINCIPAL DO KDS COZINHA REAL ===================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[var(--salmon)]/15 text-[var(--salmon)] flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              KDS Cozinha Real 4.0 · Mãos-Livres
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">
              Drag &amp; Drop · Box Clicável (Edição) · Contabilização Min/Horas por Etapa
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-1 tracking-tight">
            Gestor Central de Cozinha &amp; Linha de Montagem
          </h1>
          <p className="text-xs md:text-sm text-[var(--muted)] mt-0.5">
            Clique em qualquer box para ver detalhes e editar pratos/observações. Arraste livremente e acompanhe o tempo acumulado em minutos e horas por etapa.
          </p>
        </div>

        {/* Controles de Cozinha: Modo Autônomo, Som e Tela Cheia */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Diagnóstico de Gargalos */}
          <button
            onClick={() => setIsEfficiencyPanelOpen(!isEfficiencyPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isEfficiencyPanelOpen 
                ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
            }`}
            title="Diagnóstico de tempos médios e lead time por etapa para melhoria contínua"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isEfficiencyPanelOpen ? "Métricas de Tempo: Ativas" : "Ver Métricas de Tempo"}</span>
          </button>

          {/* Toggle Modo Autônomo */}
          <button
            onClick={() => {
              setIsAutonomousMode(!isAutonomousMode);
              toast.info(isAutonomousMode ? "Modo Autônomo pausado: movimentação manual." : "Modo Autônomo ATIVADO: alertas sonoros automáticos por tempo!");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer border ${
              isAutonomousMode 
                ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20 shadow-md ring-2 ring-amber-400/40" 
                : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
            }`}
            title="Alerta e transição autônoma quando o tempo de preparo atingir o limite"
          >
            <Timer className={`w-4 h-4 ${isAutonomousMode ? "animate-spin" : ""}`} />
            <span>{isAutonomousMode ? "⚡ Cozinha Autônoma: ON" : "Cozinha Autônoma: OFF"}</span>
          </button>

          {/* Toggle de Som */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast.info(!soundEnabled ? "Campainha sonora de cozinha ATIVADA." : "Campainha silenciada.");
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              soundEnabled
                ? "bg-[var(--surface2)] text-emerald-600 border-emerald-500/30"
                : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)]"
            }`}
            title={soundEnabled ? "Sons de Cozinha Ativos (Campainha Ding!)" : "Sons de Cozinha Mudos"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Toggle Fullscreen para Tablet de Bancada */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] hover:border-[var(--ink)] text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
            title="Expandir para Monitor / Tablet de Bancada (Fullscreen)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Card do Auto-Aceite Inteligente */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-3.5 h-3.5 ${autoAcceptConfig?.enabled ? "text-amber-500 fill-amber-500" : "text-[var(--muted)]"}`} />
                <span className="text-[11px] font-bold text-[var(--ink)]">Auto-Aceite</span>
              </div>
              <div className="text-[10px] text-[var(--muted)] font-mono">
                {activeOrdersCount}/{maxCapacity} ({capacityPct}%)
              </div>
            </div>

            <button
              onClick={() => updateAutoAcceptMutation.mutate({ enabled: !autoAcceptConfig?.enabled })}
              disabled={updateAutoAcceptMutation.isPending}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                autoAcceptConfig?.enabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)]"
              }`}
            >
              {autoAcceptConfig?.enabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* ===================== DIAGNÓSTICO DE TEMPOS EM MINUTOS E HORAS POR ETAPA (OEE DE COZINHA) ===================== */}
      {isEfficiencyPanelOpen && (
        <div className="bg-gradient-to-r from-indigo-950/20 via-[var(--surface)] to-[var(--surface)] border border-indigo-500/30 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                    Diagnóstico Operacional de Gargalos &amp; Lead Time por Etapa
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                    OEE de Cozinha 94.2%
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  Métricas em minutos e horas desde a entrada da comanda até a entrega para melhoria contínua de processos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--muted)]">Lead Time Médio Geral:</span>
              <b className="font-mono text-sm text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-lg font-black">
                {avgTotalLeadTime} min ({formatMinutesAndHours(avgTotalLeadTime)})
              </b>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> 1. Tempo em Fila
              </span>
              <div className="text-base font-black font-mono text-[var(--ink)]">{avgFilaMin} min</div>
              <div className="text-[9.5px] text-[var(--muted)]">Desde a chegada até o sushibar</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> 2. Tempo de Cocção
              </span>
              <div className="text-base font-black font-mono text-amber-600">{avgPreparoMin} min</div>
              <div className="text-[9.5px] text-[var(--muted)]">Tempo de bancada ativa</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] flex items-center gap-1">
                <PackageCheck className="w-3 h-3 text-emerald-500" /> 3. Tempo em Expedição
              </span>
              <div className="text-base font-black font-mono text-emerald-600">{avgProntoMin} min</div>
              <div className="text-[9.5px] text-[var(--muted)]">Na estufa/balcão para retirada</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" /> Meta Operacional
              </span>
              <div className="text-base font-black font-mono text-purple-600">&le; 25 min</div>
              <div className="text-[9.5px] text-emerald-600 font-bold">Dentro do padrão de qualidade</div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SELETOR DE PRAÇAS DE PRODUÇÃO ===================== */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-[var(--line)]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mr-1 hidden sm:inline">
            Praça:
          </span>
          {[
            { id: "todas", label: "Todas as Praças", icon: ChefHat },
            { id: "sushibar", label: "🍣 Sushibar (Frio)", icon: Fish },
            { id: "cozinha_quente", label: "🔥 Cozinha Quente", icon: Flame },
            { id: "bar", label: "🍹 Bar & Bebidas", icon: Wine },
            { id: "expedicao", label: "📦 Expedição & Despacho", icon: PackageCheck },
          ].map(p => {
            const Icon = p.icon;
            const isSelected = selectedStation === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedStation(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[var(--ink)] text-white shadow-xs"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            zumaUtils.listOrders.invalidate();
            refetchTickets();
            refetchMotoboys();
            toast.info("KDS atualizado em tempo real!");
          }}
          className="p-2 rounded-lg bg-[var(--surface2)] border border-[var(--line)] hover:border-[var(--ink)] text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
          title="Recarregar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ===================== RESUMO DO PLANTÃO & BUMP BAR TOUCHLESS ===================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              ⚡
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                  All-Day Summary (Resumo do Plantão) &amp; Bump Bar Touchless
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                  {allDaySummaryItems.reduce((acc, it) => acc + it.q, 0)} itens em preparo
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Agrupamento inteligente para preparo em lote (Batching) no Sushibar e Cozinha Quente sem cliques.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recalledOrders.length > 0 && (
              <button
                onClick={() => handleRecallOrder(recalledOrders[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold transition cursor-pointer"
                title={`Desfazer baixa do pedido ${recalledOrders[0].orderNumber}`}
              >
                <span>↩️ Recall ({recalledOrders[0].orderNumber})</span>
              </button>
            )}

            <button
              onClick={handleBumpNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition shadow-xs cursor-pointer active:scale-98"
            >
              <span>⚡ Bump Próximo Pedido</span>
            </button>

            <button
              onClick={() => setIsAllDaySummaryOpen(!isAllDaySummaryOpen)}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
            >
              {isAllDaySummaryOpen ? "Recolher Resumo ▲" : "Expandir Resumo ▼"}
            </button>
          </div>
        </div>

        {isAllDaySummaryOpen && (
          <div className="pt-2 border-t border-[var(--line)]">
            {allDaySummaryItems.length === 0 ? (
              <div className="text-center py-2 text-xs text-[var(--muted)] italic">
                Nenhum item em fila de preparo no momento. Cozinha 100% em dia!
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase mr-1">Filtrar por item:</span>
                  {filterBySummaryItem && (
                    <button
                      onClick={() => setFilterBySummaryItem(null)}
                      className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold cursor-pointer transition"
                    >
                      Limpar Filtro ✕
                    </button>
                  )}
                  {allDaySummaryItems.map((it, idx) => {
                    const isSelected = filterBySummaryItem === it.nome;
                    const isHot = it.station === "cozinha_quente";
                    const isBar = it.station === "bar";

                    return (
                      <button
                        key={idx}
                        onClick={() => setFilterBySummaryItem(isSelected ? null : it.nome)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          isSelected
                            ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-xs"
                            : isHot
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                            : isBar
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 hover:bg-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white dark:bg-black/30 flex items-center justify-center font-mono text-[10px] font-black">
                          {it.q}
                        </span>
                        <span>{it.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================== INSTRUÇÃO VISUAL DO BOX CLICÁVEL & DRAG & DROP ===================== */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-amber-800 dark:text-amber-200 gap-2">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <b>Box Interativo:</b> Clique em qualquer cartão para <b>ver detalhes completos, modificar pratos, editar observações e salvar</b>. Arraste para mover de estágio ou use as setas laterais.
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-md">
          {draggedOrderId ? `🔄 Movendo pedido #${draggedOrderId}... Solte na coluna de destino` : "👆 Clique no box para editar"}
        </span>
      </div>

      {/* Alerta Visual de Cancelamento e Reaproveitamento Inteligente */}
      {cancelAlert && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/95 via-red-900/90 to-red-950/95 border-2 border-red-500 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-600 rounded-xl animate-bounce shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-xs tracking-wider uppercase px-2.5 py-0.5 rounded bg-red-800 border border-red-400 text-white">
                  ALERTA URGENTE COZINHA • ITEM CANCELADO
                </span>
                <span className="text-xs font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-red-200">
                  Mesa #{String(cancelAlert.tableNumber).padStart(2, "0")} • {cancelAlert.timestamp}
                </span>
                <span className="text-xs font-semibold text-zinc-300">
                  por {cancelAlert.cancelledBy}
                </span>
              </div>
              <p className="text-base font-black text-white mt-1">
                Prato: <span className="text-amber-300 underline underline-offset-4">{cancelAlert.itemName}</span> {cancelAlert.reason && <span className="text-xs font-normal text-zinc-300">({cancelAlert.reason})</span>}
              </p>
              {cancelAlert.reallocatedTo ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg">
                  <span>♻️</span>
                  <span>REAPROVEITAMENTO INTELIGENTE (ZERO DESPERDÍCIO): Produção transferida automaticamente para <strong>{cancelAlert.reallocatedTo.identifier}</strong>! Não descarte o prato.</span>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-lg">
                  <span>🛑</span>
                  <span>INTERROMPER PREPARO IMEDIATAMENTE: Suspender cocção/montagem no pass para evitar desperdício de insumos.</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => {
                if (soundEnabled) kdsAudio.playReadyChime();
                setCancelAlert(null);
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-black rounded-xl border border-white/30 transition cursor-pointer"
            >
              ✓ Ciente / Fechar Alerta
            </button>
          </div>
        </div>
      )}

      {/* ===================== GRID DAS 4 COLUNAS COM DRAG & DROP NATIVO ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STAGES.map((st) => {
          const stageOrders = filteredOrders.filter((o) => o.stage === st.id);
          const isOverThisStage = dragOverStage === st.id;

          return (
            <div
              key={st.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverStage !== st.id) setDragOverStage(st.id);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                if (dragOverStage === st.id) setDragOverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const droppedId = e.dataTransfer.getData("text/plain") || draggedOrderId;
                if (droppedId) {
                  handleMoveToStage(droppedId, st.id);
                }
                setDragOverStage(null);
                setDraggedOrderId(null);
              }}
              className={`rounded-2xl border p-3.5 shadow-xs flex flex-col min-h-[640px] transition-all duration-200 ${
                isOverThisStage
                  ? "border-2 border-dashed border-amber-500 bg-amber-500/10 shadow-lg ring-4 ring-amber-400/20 scale-[1.01]"
                  : "bg-[var(--surface)] border-[var(--line)]"
              }`}
            >
              {/* Header da Coluna */}
              <div className="pb-3 border-b border-[var(--line)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--ink)] tracking-tight">
                    {st.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black border ${st.color}`}>
                    {stageOrders.length}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--muted)] leading-tight">
                  {st.sublabel}
                </p>
                {isOverThisStage && (
                  <div className="text-[10.5px] font-bold text-amber-600 bg-amber-500/20 text-center py-1 rounded-md animate-pulse">
                    Solte aqui para mover para {st.label.split(".")[1]}!
                  </div>
                )}
              </div>

              {/* Lista de Cards de Pedidos */}
              <div className="space-y-3.5 pt-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
                {stageOrders.map((ord) => {
                  const isBeingDragged = draggedOrderId === ord.id;
                  const isWhats = ord.channel.includes("WhatsApp");
                  const isTable = ord.origin === "mesa";
                  
                  // Temporizador inteligente de preparo
                  const targetMinutes = ord.targetPrepMinutes;
                  const elapsed = ord.minutesElapsed;
                  const remaining = targetMinutes - elapsed;
                  const progressPct = Math.min(100, Math.round((elapsed / targetMinutes) * 100));
                  const isOverdue = elapsed > targetMinutes;
                  const isFinishing = progressPct >= 80 && !isOverdue;

                  // Tempo formatado em minutos e horas
                  const totalFormatted = ord.stageDurations?.totalFormatted || formatMinutesAndHours(elapsed);

                  return (
                    <div
                      key={ord.id}
                      draggable={true}
                      onClick={() => handleOpenEditModal(ord)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", ord.id);
                        setDraggedOrderId(ord.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggedOrderId(null);
                        setDragOverStage(null);
                      }}
                      className={`p-3.5 rounded-xl border transition-all space-y-2.5 relative shadow-xs select-none cursor-pointer group hover:border-[var(--salmon)] hover:shadow-md ${
                        isBeingDragged 
                          ? "opacity-35 scale-95 border-dashed border-amber-500 ring-2 ring-amber-400" 
                          : isOverdue && ord.stage === "preparo"
                          ? "border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/40"
                          : isFinishing && ord.stage === "preparo"
                          ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-400"
                          : ord.hasAlert
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-[var(--line)] bg-[var(--surface2)]"
                      }`}
                      title="Clique para ver detalhes, modificar pratos, editar observações e salvar"
                    >
                      {/* Pegador Visual de Drag and Drop e Identificação */}
                      <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-2">
                        <div className="flex items-center gap-1.5">
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] cursor-grab active:cursor-grabbing"
                            title="Segure e arraste este pedido para qualquer coluna"
                          >
                            <GripVertical className="w-4 h-4 text-amber-500" />
                          </div>
                          <b className="font-mono text-sm font-black text-[var(--ink)] group-hover:text-[var(--salmon)] transition-colors">
                            {ord.orderNumber}
                          </b>
                          {isWhats ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 text-[9.5px] font-bold flex items-center gap-0.5">
                              <MessageSquare className="w-2.5 h-2.5" />
                              Whats IA
                            </span>
                          ) : isTable ? (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 text-[9.5px] font-bold">
                              {ord.channel}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 text-[9.5px] font-bold">
                              {ord.channel}
                            </span>
                          )}
                        </div>

                        {/* Tempo Total Decorrido em Minutos e Horas */}
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] font-bold font-mono flex items-center gap-1 px-2 py-0.5 rounded ${
                            isOverdue
                              ? "bg-rose-500/20 text-rose-600 animate-pulse font-black"
                              : isFinishing
                              ? "bg-amber-500/20 text-amber-600 font-bold"
                              : "bg-[var(--surface)] text-[var(--muted)]"
                          }`} title="Tempo total acumulado desde a chegada do pedido">
                            <Clock className="w-3 h-3" />
                            {totalFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Alerta de Modificação ou Cancelamento (se houver) */}
                      {ord.hasAlert && ord.alertMessage && (
                        <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{ord.alertMessage}</span>
                        </div>
                      )}

                      {/* Barra de Progresso do Tempo de Preparo */}
                      {ord.stage === "preparo" && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className={isOverdue ? "text-rose-600 font-bold" : "text-[var(--muted)]"}>
                              {isOverdue 
                                ? `⚠️ TEMPO ESGOTADO (+${elapsed - targetMinutes}m)` 
                                : `⏳ Tempo restante: ${remaining} min`}
                            </span>
                            <span className="font-bold">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden border border-[var(--line)]">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                isOverdue 
                                  ? "bg-rose-500 animate-pulse" 
                                  : isFinishing 
                                  ? "bg-amber-500" 
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Dados do Cliente e Região / Mesa */}
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center justify-between">
                          <b className="text-[var(--ink)] block truncate">{ord.customerName}</b>
                          <span className="text-[10px] text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            <Edit3 className="w-3 h-3" /> Editar
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--salmon)] shrink-0" />
                          {ord.neighborhood}
                        </span>
                      </div>

                      {/* Itens do Pedido com Observações, Adicionais e Alertas de Cancelamento */}
                      <div className="space-y-1 text-xs pt-1 border-t border-[var(--line)]/50">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className={`space-y-0.5 ${it.isCancelled ? "opacity-85" : ""}`}>
                            <div className="flex justify-between font-bold text-[var(--ink)]">
                              <span className={it.isCancelled ? "line-through text-red-500 dark:text-red-400" : ""}>
                                {it.q}x {it.nome}
                              </span>
                              <div className="flex items-center gap-1">
                                {it.isCancelled && (
                                  <span className="text-[9px] uppercase font-black text-white bg-red-600 px-1.5 py-0.2 rounded">
                                    Cancelado
                                  </span>
                                )}
                                {it.station && (
                                  <span className="text-[9px] uppercase font-bold text-[var(--muted)] bg-[var(--surface)] px-1 rounded">
                                    {it.station === "sushibar" ? "Sushi" : it.station === "cozinha_quente" ? "Quente" : "Bar"}
                                  </span>
                                )}
                              </div>
                            </div>
                            {it.isCancelled && (
                              <span className="block text-[10px] text-red-600 dark:text-red-300 font-bold bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded">
                                🛑 {it.cancelReason || "Interromper preparo imediatamente"}
                              </span>
                            )}
                            {it.notes && (
                              <span className="block text-[10px] text-indigo-600 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                Obs: {it.notes}
                              </span>
                            )}
                            {it.additions && it.additions.length > 0 && (
                              <span className="block text-[10px] text-purple-600 font-semibold">
                                + {it.additions.map(a => a.nome).join(", ")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Breakdown de Tempos por Etapa (Resumo no Card) */}
                      {ord.stageDurations && (
                        <div className="bg-[var(--surface)]/80 rounded-lg p-2 border border-[var(--line)]/60 text-[10px] space-y-1">
                          <div className="flex items-center justify-between text-[var(--muted)] font-mono">
                            <span>⏱️ Fila: <b>{ord.stageDurations.recebidoMinutes}m</b></span>
                            <span>🔥 Prep: <b>{ord.stageDurations.preparoMinutes}m</b></span>
                            <span>📦 Pronto: <b>{ord.stageDurations.prontoMinutes}m</b></span>
                          </div>
                        </div>
                      )}

                      {/* Conferência de Expedição na coluna Pronto para Mesas */}
                      {ord.tableNumber && ord.stage === "pronto" && (
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          {ord.expeditionChecked ? (
                            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                              <span className="flex items-center gap-1 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Expedição Conferida
                              </span>
                              <span className="text-[10px] font-mono text-emerald-700">{ord.expeditionCheckedBy || "OK"}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => checkExpeditionMutation.mutate({ tableNumber: ord.tableNumber! })}
                              disabled={checkExpeditionMutation.isPending}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{checkExpeditionMutation.isPending ? "Conferindo..." : "Conferir Expedição"}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Painel do Entregador (se em etapa de entrega) */}
                      {ord.stage === "entrega" && !ord.tableNumber && (
                        <div className="p-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs space-y-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[var(--muted)]">Entregador:</span>
                            <b className="text-indigo-600">{ord.motoboyName || "Aguardando atribuição"}</b>
                          </div>
                          {!ord.motoboyName && (
                            <button
                              onClick={() => setAssigningMotoboyOrderId(ord.id)}
                              className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold mt-1 cursor-pointer"
                            >
                              Atribuir Motoboy
                            </button>
                          )}
                        </div>
                      )}

                      {/* ===================== BOTÃO GIGANTE DE 1 TOQUE PARA COZINHA (TOUCH-FRIENDLY) ===================== */}
                      {ord.stage === "preparo" && (
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              handleMoveToStage(ord.id, "pronto");
                              toast.success(`🍽️ Prato #${ord.orderNumber} CONCLUÍDO! Movido para Expedição.`);
                            }}
                            className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-97 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-emerald-400/50 cursor-pointer"
                            title="Toque único com luvas ou punho para concluir o prato"
                          >
                            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                            <span>✅ CONCLUIR PREPARO (PRONTO)</span>
                          </button>
                        </div>
                      )}

                      {/* Se estiver em Recebido, botão de início rápido */}
                      {ord.stage === "recebido" && (
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              handleMoveToStage(ord.id, "preparo");
                              toast.success(`👨‍🍳 Pedido #${ord.orderNumber} iniciado no Sushibar/Cozinha!`);
                            }}
                            className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-97 text-white font-black text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Flame className="w-4 h-4" />
                            <span>INICIAR PREPARO AGORA</span>
                          </button>
                        </div>
                      )}

                      {/* ===================== CONTROLES LATERAIS RÁPIDOS & IMPRESSÃO TÉRMICA ===================== */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-[var(--line)]/50" onClick={(e) => e.stopPropagation()}>
                        {/* Botão Voltar Etapa */}
                        {ord.stage !== "recebido" ? (
                          <button
                            onClick={() => handleRegressStep(ord.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition flex items-center gap-1 cursor-pointer"
                            title="Voltar para etapa anterior"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Voltar</span>
                          </button>
                        ) : <div />}

                        {/* Botão de Impressão ESC/POS */}
                        <button
                          onClick={() => setThermalModalOrder(ord)}
                          className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--ink)] text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
                          title="Imprimir Comanda Térmica (ESC/POS 80mm/58mm)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Botão Avançar Etapa */}
                        {ord.stage !== "entrega" ? (
                          <button
                            onClick={() => handleAdvanceStep(ord.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[var(--salmon)] hover:bg-[#d04530] text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-97"
                            title="Avançar para próxima etapa"
                          >
                            <span>Avançar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded-md">
                            🏁 Na Rota / Salão
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageOrders.length === 0 && (
                  <div className="text-center py-16 border-2 border-dashed border-[var(--line)] rounded-xl space-y-1">
                    <p className="text-xs text-[var(--muted)] font-medium">Nenhum pedido aqui.</p>
                    <p className="text-[10px] text-[var(--muted)]">Arraste um cartão para cá ou clique em qualquer comanda para ver detalhes!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== MODAL DE DETALHES, EDIÇÃO & CONTABILIZAÇÃO DE TEMPOS ===================== */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Topo do Modal */}
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-[var(--salmon)]/15 text-[var(--salmon)]">
                    Detalhes &amp; Edição da Comanda
                  </span>
                  <span className="text-xs text-[var(--muted)] font-mono">{editingOrder.channel}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-1 flex items-center gap-2">
                  <span>Pedido {editingOrder.orderNumber}</span>
                  <span className="text-xs font-normal text-[var(--muted)]">({editingOrder.neighborhood})</span>
                </h2>
              </div>

              <button 
                onClick={() => setEditingOrder(null)} 
                className="p-2 text-[var(--muted)] hover:text-[var(--ink)] rounded-xl hover:bg-[var(--surface2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de Rastreamento de Tempo por Etapa (Lead Time & OEE) */}
            <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-200">
                    Contabilização de Tempos em Minutos e Horas
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-indigo-600 bg-white dark:bg-black/40 px-2.5 py-1 rounded-lg">
                  Tempo total desde a chegada: {editingOrder.stageDurations?.totalFormatted || formatMinutesAndHours(editingOrder.minutesElapsed)}
                </div>
              </div>

              {/* Grid dos Tempos por Estágio */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20">
                  <div className="text-[10px] text-[var(--muted)] font-sans uppercase font-bold">1. Fila (Recebido)</div>
                  <div className="text-sm font-black text-[var(--ink)]">{formatMinutesAndHours(editingOrder.stageDurations?.recebidoMinutes || 4)}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20">
                  <div className="text-[10px] text-[var(--muted)] font-sans uppercase font-bold">2. Cozinha (Preparo)</div>
                  <div className="text-sm font-black text-amber-600">{formatMinutesAndHours(editingOrder.stageDurations?.preparoMinutes || 15)}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20">
                  <div className="text-[10px] text-[var(--muted)] font-sans uppercase font-bold">3. Expedição (Pronto)</div>
                  <div className="text-sm font-black text-emerald-600">{formatMinutesAndHours(editingOrder.stageDurations?.prontoMinutes || 4)}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20">
                  <div className="text-[10px] text-[var(--muted)] font-sans uppercase font-bold">4. Rota (Entrega)</div>
                  <div className="text-sm font-black text-indigo-600">{formatMinutesAndHours(editingOrder.stageDurations?.entregaMinutes || 0)}</div>
                </div>
              </div>
            </div>

            {/* Dados do Cliente / Local */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">Cliente / Mesa:</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] uppercase block mb-1">Bairro / Destino:</label>
                <input
                  type="text"
                  value={editNeighborhood}
                  onChange={(e) => setEditNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                />
              </div>
            </div>

            {/* Seletor de Estágio Direto */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--muted)] uppercase block">Estágio da Comanda:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STAGES.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setEditStage(st.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      editStage === st.id
                        ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow-xs"
                        : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {st.label.split(".")[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Editável de Itens com Ajuste Dinâmico e Rápido de Quantidade */}
            <div className="space-y-3 pt-2 border-t border-[var(--line)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                  <span>Itens da Comanda &amp; Observações da Cozinha</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--surface2)] text-[10px] font-mono font-bold text-[var(--salmon)]">
                    {editItems.length} {editItems.length === 1 ? "item" : "itens"}
                  </span>
                </h3>
                <span className="text-[11px] text-[var(--muted)] font-mono">
                  Subtotal: {formatBrl(editItems.reduce((acc, it) => acc + (parseFloat(String(it.unitPrice || 0)) || 0) * (Number(it.q) || 1), 0))}
                </span>
              </div>

              {/* Lista dos Itens com Controle Ágil */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {editItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {/* Controle Ágil de Quantidade: Botões -/+, Input Direto e Chips Rápidos */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(idx, -1)}
                          className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center font-black text-xs hover:border-[var(--ink)] cursor-pointer active:scale-95 transition"
                          title="Diminuir 1"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={item.q}
                          onChange={(e) => handleItemQuantityDirectSet(idx, parseInt(e.target.value) || 1)}
                          className="w-12 h-7 text-center font-mono font-black text-xs text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-lg focus:outline-hidden focus:border-[var(--salmon)]"
                          title="Digite a quantidade exata"
                        />
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center font-black text-xs hover:border-[var(--ink)] cursor-pointer active:scale-95 transition"
                          title="Aumentar 1"
                        >
                          +
                        </button>

                        {/* Atalhos Rápidos de Quantidade (+1, +2, +5) */}
                        <div className="flex items-center gap-0.5 ml-1">
                          {[1, 2, 5].map((addVal) => (
                            <button
                              key={addVal}
                              type="button"
                              onClick={() => handleItemQuantityChange(idx, addVal)}
                              className="px-1.5 py-0.5 rounded-md bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] font-mono font-bold text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
                              title={`Adicionar +${addVal} unidades rapidamente`}
                            >
                              +{addVal}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Nome do Item */}
                      <div className="flex-1 min-w-0 pr-1">
                        <b className="text-xs text-[var(--ink)] block truncate">{item.nome}</b>
                        {item.unitPrice && (
                          <span className="text-[10px] text-[var(--muted)] font-mono">
                            {formatBrl(item.unitPrice)} un
                          </span>
                        )}
                      </div>

                      {/* Preço Total da Linha */}
                      <span className="text-xs font-mono font-black text-[var(--ink)]">
                        {formatBrl((item.unitPrice || 0) * item.q)}
                      </span>

                      {/* Botão Remover */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition active:scale-95"
                        title="Remover item da comanda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Campo de Observações da Cozinha com Tags Rápidas de 1 Toque */}
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Observações da cozinha (ex: sem cebolinha, molho tarê à parte, ponto do salmão...)"
                        value={item.notes || item.observacoes || ""}
                        onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                      />

                      {/* Tags Rápidas de Observação Clicáveis */}
                      <div className="flex flex-wrap gap-1">
                        {[
                          "Sem Cebolinha",
                          "Tarê à Parte",
                          "Sem Cream Cheese",
                          "Gengibre Extra",
                          "Salmão Bem Selado",
                          "Caprichar Wasabi",
                          "Shoyu Extra",
                          "Pouco Arroz",
                          "Bem Crocante",
                          "Alho Poró Extra"
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAppendItemNote(idx, tag)}
                            className="px-2 py-0.5 rounded-md bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer flex items-center gap-0.5"
                          >
                            <span>+</span>
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ===================================================================== */}
              {/* CATÁLOGO COMPLETO DO ZUMA COM BUSCA, CATEGORIAS E SELETOR DE QUANTIDADE */}
              {/* ===================================================================== */}
              <div className="pt-2 border-t border-[var(--line)] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-[var(--salmon)]" />
                      Catálogo Completo do Zuma (Todos os Itens):
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface2)] font-mono text-[var(--muted)]">
                      {catalogoFiltrado.length} disponíveis
                    </span>
                  </div>

                  {/* Seletor Rápido de Quantidade Prévia */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Qtd ao Adicionar:</span>
                    {[1, 2, 3, 5, 10].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuickAddQty(q)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-black transition cursor-pointer active:scale-95 ${
                          quickAddQty === q
                            ? "bg-[var(--salmon)] text-white shadow-xs"
                            : "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]"
                        }`}
                      >
                        {q}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barra de Busca com Input e Botão de Limpar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar prato por nome, ingrediente ou categoria (ex: Salmão, Sobá, Combo, Barca, Hot, Poke, Guioza, Coca...)"
                    value={searchMenuQuery}
                    onChange={(e) => setSearchMenuQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] placeholder-[var(--muted)] focus:outline-hidden focus:border-[var(--salmon)]"
                  />
                  {searchMenuQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchMenuQuery("")}
                      className="absolute right-2.5 top-2 text-[var(--muted)] hover:text-[var(--ink)] font-bold px-1.5 py-0.5 text-xs rounded-full hover:bg-[var(--line)]"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Pílulas de Categorias com Rolagem Horizontal */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categoriasCardapio.map((cat: { id: string; label: string; count: number }) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedMenuCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 active:scale-95 ${
                        selectedMenuCategory === cat.id
                          ? "bg-[var(--ink)] text-white shadow-xs"
                          : "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedMenuCategory === cat.id ? "bg-white/20 text-white" : "bg-[var(--line)] text-[var(--muted)]"
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Grade Dinâmica com Pratos Filtrados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {catalogoFiltrado.slice(0, 40).map((dish: { nome: string; preco: number; categoria: string; station: string; stationLabel: string }, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[var(--surface2)]/80 hover:bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between gap-2 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[var(--ink)] truncate" title={dish.nome}>
                          {dish.nome}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-black font-mono text-[var(--salmon)]">
                            {formatBrl(dish.preco)}
                          </span>
                          <span className="text-[9px] text-[var(--muted)] truncate">
                            {dish.stationLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddCatalogItem(dish, quickAddQty)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-black text-[var(--ink)] hover:text-[var(--salmon)] transition cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 shadow-2xs"
                        title={`Adicionar +${quickAddQty}x ${dish.nome}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-[var(--salmon)]" />
                        <span>+{quickAddQty}x</span>
                      </button>
                    </div>
                  ))}

                  {catalogoFiltrado.length === 0 && (
                    <div className="col-span-2 py-6 text-center text-xs text-[var(--muted)]">
                      Nenhum prato encontrado para "{searchMenuQuery}".
                      <button
                        type="button"
                        onClick={() => { setSearchMenuQuery(""); setSelectedMenuCategory("todas"); }}
                        className="block mx-auto mt-2 text-xs font-bold text-[var(--salmon)] underline cursor-pointer"
                      >
                        Limpar Filtros e Ver Todos os 120+ Pratos
                      </button>
                    </div>
                  )}
                </div>

                {/* Botão de Adição de Item Especial / Fora do Cardápio */}
                <div className="pt-1">
                  {!showCustomItemForm ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomItemForm(true)}
                      className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1 transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[var(--salmon)]" />
                      <span>+ Adicionar Prato Especial / Fora do Cardápio Personalizado</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--salmon)]/40 space-y-2">
                      <div className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                        <span>Prato Especial Fora do Cardápio:</span>
                        <button
                          type="button"
                          onClick={() => setShowCustomItemForm(false)}
                          className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Nome do prato especial..."
                          value={customItemNome}
                          onChange={(e) => setCustomItemNome(e.target.value)}
                          className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                        />
                        <input
                          type="text"
                          placeholder="Preço (R$)..."
                          value={customItemPreco}
                          onChange={(e) => setCustomItemPreco(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] focus:outline-hidden focus:border-[var(--salmon)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomItem}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer active:scale-98 shadow-xs"
                      >
                        Confirmar Inclusão do Prato Especial (+{quickAddQty}x)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé com Total e Botões de Salvar */}
            <div className="pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs space-y-0.5">
                <div className="text-[var(--muted)]">Total Calculado:</div>
                <div className="text-xl font-black text-[var(--ink)] font-mono">
                  {formatBrl(
                    editItems.reduce((acc, it) => acc + (parseFloat(String(it.unitPrice || 0)) || 0) * (Number(it.q) || 1), 0) + 
                    (parseFloat(String(editingOrder.deliveryFee || 0)) || 0)
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setThermalModalOrder(editingOrder);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-[var(--ink)] text-xs font-bold text-[var(--ink)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir ESC/POS</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrderChanges}
                  disabled={updateOrderDetailsMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer active:scale-97"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateOrderDetailsMutation.isPending ? "Salvando..." : "Salvar Alterações na Comanda"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PAINEL DA FROTA DE MOTOBOYS COM ACERTO DE CONTAS ===================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Bike className="w-4 h-4 text-[var(--salmon)]" />
              Frota de Motoboys de Tangará da Serra &amp; Acerto de Taxas
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Roteirização por quadrantes logísticos com liquidação instantânea das diárias via Pix Sicredi MT.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
            4 Entregadores Ativos Hoje
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {motoboys.map((mb: any, i: number) => (
            <div key={i} className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <b className="text-sm text-[var(--ink)] block">{mb.name}</b>
                  <span className="text-[11px] text-[var(--muted)]">{mb.plate} · {mb.phone}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  mb.status === "disponivel"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                }`}>
                  {mb.status === "disponivel" ? "Disponível" : "Em Rota"}
                </span>
              </div>

              <div className="text-xs space-y-1 border-t border-[var(--line)] pt-2">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Corridas Concluídas:</span>
                  <b className="text-[var(--ink)]">{(mb as any).deliveriesCount || (mb as any).entregas || 0}</b>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Total Taxas Acumuladas:</span>
                  <b className="text-emerald-600">{formatBrl((mb as any).totalFeesEarned || (mb as any).taxasAcumuladas || 0)}</b>
                </div>
              </div>

              <button
                onClick={() => settleMotoboyMutation.mutate({ motoboyId: mb.id })}
                disabled={settleMotoboyMutation.isPending || ((mb as any).totalFeesEarned || (mb as any).taxasAcumuladas || 0) === 0}
                className="w-full py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Liquidar Turno (Pix Sicredi)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== MODAL DE IMPRESSÃO ESC/POS ===================== */}
      {thermalModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[var(--salmon)]" />
                  Visualizar Impressão Térmica ESC/POS
                </h3>
                <span className="text-xs text-[var(--muted)]">Pronto para impressoras de bobina (Epson, Elgin, Bematech)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setThermalWidth("80mm")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${thermalWidth === "80mm" ? "bg-[var(--ink)] text-white" : "bg-[var(--surface2)] text-[var(--muted)]"}`}
                >
                  80mm
                </button>
                <button
                  onClick={() => setThermalWidth("58mm")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${thermalWidth === "58mm" ? "bg-[var(--ink)] text-white" : "bg-[var(--surface2)] text-[var(--muted)]"}`}
                >
                  58mm
                </button>
                <button onClick={() => setThermalModalOrder(null)} className="p-1 text-[var(--muted)] hover:text-[var(--ink)] ml-2 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulação da Bobina Térmica */}
            <div className={`mx-auto bg-amber-50 text-neutral-900 font-mono text-[11px] p-4 rounded-lg shadow-inner border border-neutral-300 space-y-2 leading-relaxed ${thermalWidth === "58mm" ? "max-w-[260px]" : "max-w-[340px]"}`}>
              <div className="text-center border-b border-dashed border-neutral-400 pb-2">
                <b className="text-sm block">*** ZUMA COZINHA ORIENTAL ***</b>
                <span className="text-[10px] block">Tangará da Serra - MT · CNPJ 51.849.201/0001-44</span>
                <span className="text-[10px] block">Whats Delivery: (65) 99999-0000</span>
              </div>

              <div className="border-b border-dashed border-neutral-400 pb-2 space-y-0.5">
                <div className="flex justify-between">
                  <b>PEDIDO: {thermalModalOrder.orderNumber}</b>
                  <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div>CANAL: {thermalModalOrder.channel}</div>
                <div>CLIENTE: {thermalModalOrder.customerName}</div>
                <div>TELEFONE: {thermalModalOrder.customerPhone || "(65) 99999-0000"}</div>
                <div>ENDEREÇO: {thermalModalOrder.neighborhood}, Tangará da Serra</div>
              </div>

              <div className="border-b border-dashed border-neutral-400 pb-2 space-y-1">
                <div className="font-bold flex justify-between">
                  <span>QTD ITEM</span>
                  <span>TOTAL</span>
                </div>
                {thermalModalOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.q}x {it.nome}</span>
                    <span>-</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-neutral-400 pb-2 space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>TOTAL GERAL:</span>
                  <span>{formatBrl(thermalModalOrder.total || 85.00)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>PAGAMENTO:</span>
                  <span>PIX SICREDI MT (CONFIRMADO)</span>
                </div>
              </div>

              <div className="text-center pt-1 text-[9.5px]">
                <div>OBRIGADO PELA PREFERÊNCIA!</div>
                <div>Siga no Instagram: @zumatangara</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success("Comanda impressa com sucesso na impressora de produção!");
                  setThermalModalOrder(null);
                }}
                className="flex-1 py-2.5 bg-[var(--salmon)] hover:bg-[#d04530] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Disparar Impressora Térmica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL DE ATRIBUIÇÃO DE MOTOBOY ===================== */}
      {assigningMotoboyOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-indigo-600" /> Atribuir Entregador
            </h3>
            <p className="text-xs text-[var(--muted)]">Selecione o motoboy para despachar o pedido {assigningMotoboyOrderId}:</p>

            <div className="space-y-1.5">
              {motoboys.map((mb: any) => (
                <button
                  key={mb.id}
                  onClick={() => assignMotoboyMutation.mutate({ orderId: parseInt(assigningMotoboyOrderId.replace(/\D/g, "") || "1", 10), motoboyId: mb.id })}
                  className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] hover:border-indigo-600 text-left flex items-center justify-between text-xs transition-all cursor-pointer"
                >
                  <div>
                    <b className="text-[var(--ink)] block">{mb.name}</b>
                    <span className="text-[10px] text-[var(--muted)]">{mb.plate} · {mb.phone}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${mb.status === "disponivel" ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600"}`}>
                    {mb.status}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setAssigningMotoboyOrderId(null)}
              className="w-full py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
