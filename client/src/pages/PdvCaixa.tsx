import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { ALL_ITEMS, MENU, formatBrl } from "../../../shared/zumaData";
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Smartphone, 
  Radio,
  UtensilsCrossed,
  Layers,
  Users,
  Divide,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles,
  FileText,
  Clock,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Barcode, Shirt, Volume2, Navigation, Phone, CloudRain, Send } from "lucide-react";
import { orderEventBus } from "../lib/orderEvents";
import { ImpressaoTermicaModal } from "../components/pdv/ImpressaoTermicaModal";
import { AcertoMotoboyModal } from "../components/pdv/AcertoMotoboyModal";
import { GestaoCardapioIfoodModal } from "../components/pdv/GestaoCardapioIfoodModal";
import { GestaoBairrosFreteModal } from "../components/delivery/GestaoBairrosFreteModal";
import { AuditoriaCancelamentosModal } from "../components/pdv/AuditoriaCancelamentosModal";
import { RateioGorjetasModal } from "../components/pdv/RateioGorjetasModal";
import { GestaoCuponsFidelidadeModal } from "../components/pdv/GestaoCuponsFidelidadeModal";
import { FechamentoMesaModal } from "../components/pdv/FechamentoMesaModal";
import { TrilhaAuditoriaModal } from "../components/pdv/TrilhaAuditoriaModal";
import { DreTurnoView } from "../components/pdv/DreTurnoView";
import { ContingenciaFiscalModal } from "../components/pdv/ContingenciaFiscalModal";
import { ModalEditarMesa } from "../components/pdv/ModalEditarMesa";
import { ModalIncluirItemMesa } from "../components/pdv/ModalIncluirItemMesa";
import { ModalEditarItemMesa } from "../components/pdv/ModalEditarItemMesa";
import { ModalSplitBillPdv } from "../components/pdv/ModalSplitBillPdv";
import { ModalEmissaoFiscalPdv } from "../components/pdv/ModalEmissaoFiscalPdv";
import { ModalInstalarPdv } from "../components/pdv/ModalInstalarPdv";
import { useOfflineSync } from "../lib/offlineSyncEngine";
import { Download, Cloud, Laptop } from "lucide-react";
import { Edit3, Save } from "lucide-react";
import { MapPin, ShieldAlert, Scale, Gift, Tag } from "lucide-react";
import { 
  ArrowRightLeft, 
  GitMerge, 
  MoveRight, 
  ShoppingBag, 
  Bike,
  CheckSquare,
  Square,
  TrendingUp,
  WifiOff,
  Wifi,
  Crown,
  ChevronDown,
  UserCheck,
  UserPlus,
  Truck,
  Building2,
  Store,
  Calendar,
  ExternalLink,
  Eye,
  BadgePercent
} from "lucide-react";

type Company = "gastronomia" | "moda";

interface CartLine {
  nome: string;
  preco: number;
  q: number;
  departamento?: Company;
  variacao?: string;
  ean13?: string;
}

export const PdvCaixa: React.FC = () => {
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const tabParam = searchParams?.get("tab") as any;
  const initialTab = ["pdv_balcao", "mesas_salao", "gestao_caixa", "dre_turno"].includes(tabParam) ? tabParam : "pdv_balcao";
  type OperationalTab = "pdv_balcao" | "mesas_salao" | "malas_condicionais" | "gestao_caixa" | "dre_turno";
  const [activeTab, setActiveTab] = useState<OperationalTab>(initialTab as any);

  // ===================== UNIDADE DE NEGÓCIO ATIVA (HOLDING ZUMA) =====================
  const [activeCompany, setActiveCompany] = useState<Company>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qEmp = params.get("empresa");
      if (qEmp === "moda" || qEmp === "gastronomia") return qEmp;
      const saved = localStorage.getItem("zuma_active_company");
      if (saved === "moda" || saved === "gastronomia") return saved as Company;
    }
    return "gastronomia";
  });

  const handleSwitchCompany = (company: Company) => {
    setActiveCompany(company);
    if (typeof window !== "undefined") {
      localStorage.setItem("zuma_active_company", company);
      const url = new URL(window.location.href);
      url.searchParams.set("empresa", company);
      window.history.replaceState(null, "", url.toString());
    }
    if (company === "moda") {
      if (activeTab === "mesas_salao" || activeTab === "dre_turno") {
        setActiveTab("pdv_balcao");
      }
      toast.success("👗 Frente de Caixa Zuma Moda & Boutique ativada!", {
        description: "CNPJ: 36.296.848/0002-38 · Catálogo de vestuário, grade P/M/G e malas condicionais."
      });
    } else {
      toast.success("🍣 Frente de Caixa Zuma Gastronomia ativada!", {
        description: "CNPJ: 36.296.848/0001-57 · Culinária japonesa, comandas de salão e delivery MT."
      });
    }
  };

  // ===================== ESTADOS DO PDV BALCÃO =====================
  const [barcodeScanInput, setBarcodeScanInput] = useState("");
  const [selectedModaSize, setSelectedModaSize] = useState<string>("M");
  const [selectedModaColor, setSelectedModaColor] = useState<string>("Off-White");
  const [selectedModaCollection, setSelectedModaCollection] = useState<string>("TODAS");
  const [modaSaleMode, setModaSaleMode] = useState<"balcao" | "condicional" | "envio_mt">("balcao");
  const [modaConsultant, setModaConsultant] = useState<string>("Camila Prado (Consultora VIP Boutique)");
  const [isGiftWrap, setIsGiftWrap] = useState<boolean>(true);
  const [selectedCat, setSelectedCat] = useState("Combinados");
  const [searchFilter, setSearchFilter] = useState("");

  // Carrinho 100% isolado da Gastronomia (Apenas sushis e bebidas japonesas)
  const [cartGastronomia, setCartGastronomia] = useState<CartLine[]>([
    { nome: "Combo 26 Peças (Sashimis & Niguiris)", preco: 69.90, q: 1, departamento: "gastronomia", ean13: "7890001000261" },
    { nome: "Hot Filadélfia Trufado (12un)", preco: 31.90, q: 1, departamento: "gastronomia", ean13: "7890001000262" }
  ]);

  // Carrinho 100% isolado da Moda & Boutique (Apenas roupas, linho puro, vestidos e acessórios)
  const [cartModa, setCartModa] = useState<CartLine[]>([
    { nome: "Camisa Linho Puro Riviera", preco: 289.00, q: 1, departamento: "moda", variacao: "Tam M · Off-White", ean13: "7891234567810" }
  ]);

  // Ponteiro do carrinho correspondente à empresa ativa
  const cart = activeCompany === "gastronomia" ? cartGastronomia : cartModa;
  const setCart = (updater: CartLine[] | ((prev: CartLine[]) => CartLine[])) => {
    if (activeCompany === "gastronomia") {
      setCartGastronomia(updater);
    } else {
      setCartModa(updater);
    }
  };
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credito" | "debito" | "dinheiro" | "apple_pay">("pix");
  const [cashGiven, setCashGiven] = useState<number>(400);
  const [cpf, setCpf] = useState("");
  const [customerName, setCustomerName] = useState("Cliente Balcão Híbrido");

  // ===================== ESTADOS DE DELIVERY TANGARÁ DA SERRA =====================
  const [saleMode, setSaleMode] = useState<"balcao" | "delivery">("balcao");
  const [deliveryPhone, setDeliveryPhone] = useState("(65) 99981-3320");
  const [deliveryStreet, setDeliveryStreet] = useState("Av. Brasil");
  const [deliveryNumber, setDeliveryNumber] = useState("1420 S");
  const [deliveryComplement, setDeliveryComplement] = useState("Apto 302");
  const [deliveryReference, setDeliveryReference] = useState("Próximo à Praça dos Pioneiros");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>("centro");
  const [deliveryCep, setDeliveryCep] = useState("78300-000");
  const [selectedMotoboy, setSelectedMotoboy] = useState("Lucas Silva (Honda Bros 160)");
  const [deliveryTrocoPara, setDeliveryTrocoPara] = useState<number>(0);
  const [rainModeActive, setRainModeActive] = useState(true);

  // Consulta dos 38 Bairros & CEPs de Tangará da Serra
  const { data: deliveryNeighborhoods = [] } = trpc.zuma.getDeliveryNeighborhoods.useQuery();

  // ===================== ESTADOS DO MAPA DE MESAS =====================
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(3);
  const [isOpeningTableModal, setIsOpeningTableModal] = useState(false);
  const [newTableGuests, setNewTableGuests] = useState(2);
  const [newTableWaiter, setNewTableWaiter] = useState("Matheus (Salão)");
  const [isSplittingBill, setIsSplittingBill] = useState(false);
  const [splitCountInput, setSplitCountInput] = useState(2);

  // ===================== ESTADOS DE PARIDADE SAIPOS + =====================
  const [isImpressaoModalOpen, setIsImpressaoModalOpen] = useState(false);
  const [impressaoPayload, setImpressaoPayload] = useState<any>({
    tipoComanda: "pre_conta",
    mesa: 3,
    itens: [],
    subtotal: 0,
    taxaServico: 0,
    total: 0
  });
  const [isAcertoMotoboyModalOpen, setIsAcertoMotoboyModalOpen] = useState(false);
  const [isIfoodCardapioModalOpen, setIsIfoodCardapioModalOpen] = useState(false);
  const [isBairrosFreteModalOpen, setIsBairrosFreteModalOpen] = useState(false);
  const [isAuditoriaModalOpen, setIsAuditoriaModalOpen] = useState(false);
  const [isRateioGorjetasModalOpen, setIsRateioGorjetasModalOpen] = useState(false);
  const [isCuponsModalOpen, setIsCuponsModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isFechamentoMesaModalOpen, setIsFechamentoMesaModalOpen] = useState(false);
  const [isTrilhaAuditoriaModalOpen, setIsTrilhaAuditoriaModalOpen] = useState(false);
  const [isContingenciaModalOpen, setIsContingenciaModalOpen] = useState(false);
  const [cashClosedSummary, setCashClosedSummary] = useState<any>(null);

  // Estados para Organização do Menu Superior e Clientes VIP / Entrega MT
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [orderType, setOrderType] = useState<"balcao" | "delivery">("balcao");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id?: number;
    code?: string;
    name: string;
    phone?: string;
    neighborhood?: string;
    address?: string;
    cep?: string;
    cidade?: string;
    segment?: string;
    isVip?: boolean;
    tags?: string[];
  } | null>({
    name: "Rodrigo Ribeiro Gonçalves",
    code: "VIP-01",
    phone: "(65) 99812-4401",
    neighborhood: "Centro",
    address: "Av. Brasil, 450",
    cep: "78300-000",
    cidade: "Tangará da Serra",
    segment: "vip",
    isVip: true
  });
  const [selectedDeliveryBairroId, setSelectedDeliveryBairroId] = useState<string>("tga-01");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phone: "",
    neighborhood: "Centro",
    address: "",
    cep: "78300-000",
    cidade: "Tangará da Serra",
    isVip: true,
    notes: ""
  });

  // Novos estados para os modais avançados de Mesas, Split e Fiscal
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<any>(null);
  const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);
  const [isFiscalNfceModalOpen, setIsFiscalNfceModalOpen] = useState(false);
  const [fiscalModalPayload, setFiscalModalPayload] = useState<any>(null);
  const [tableSavedFeedback, setTableSavedFeedback] = useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const {
    isOnline,
    isSimulatedOffline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    queueAction
  } = useOfflineSync();

  // Operações Avançadas de Salão (Juntar Mesas, Transferir Mesas, Transferir Itens)
  const [isJoinTableModalOpen, setIsJoinTableModalOpen] = useState(false);
  const [targetJoinTableNumber, setTargetJoinTableNumber] = useState<number>(4);
  const [isTransferTableModalOpen, setIsTransferTableModalOpen] = useState(false);
  const [targetTransferTableNumber, setTargetTransferTableNumber] = useState<number>(7);
  const [isTransferItemModalOpen, setIsTransferItemModalOpen] = useState(false);
  const [selectedItemIndexToTransfer, setSelectedItemIndexToTransfer] = useState<number>(0);
  const [targetItemTableNumber, setTargetItemTableNumber] = useState<number>(5);

  // Taxa de Serviço 10% e Couvert
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState(true);
  const [couvertPerPerson, setCouvertPerPerson] = useState<number>(0);

  // ===================== ESTADOS DA GESTÃO DE CAIXA =====================
  const [isSangriaModal, setIsSangriaModal] = useState(false);
  const [isSuprimentoModal, setIsSuprimentoModal] = useState(false);
  const [isFechamentoCegoModal, setIsFechamentoCegoModal] = useState(false);
  const [movementAmount, setMovementAmount] = useState<number>(50);
  const [movementReason, setMovementReason] = useState("");
  const [countedCashInput, setCountedCashInput] = useState<number>(340);
  const [cashOperator, setCashOperator] = useState("Mariana Costa (Caixa Operador)");
  const [fechamentoNotes, setFechamentoNotes] = useState("");

  // ===================== QUERIES E MUTATIONS =====================
  const utils = trpc.useUtils();
  const tablesQuery = trpc.zuma.listTables.useQuery(undefined, { refetchInterval: 3000 });
  const cashRegisterQuery = trpc.zuma.getCashRegister.useQuery(undefined, { refetchInterval: 3000 });

  // Busca Inteligente de Clientes e Tabela de Frete dos 62 Bairros/Cidades MT
  const { data: customerSearchResults = [] } = trpc.zuma.searchPdvCustomers.useQuery(
    { query: customerSearchQuery },
    { enabled: customerSearchQuery.length >= 1 }
  );

  const { data: allDeliveryBairros = [] } = trpc.zuma.getDeliveryNeighborhoods.useQuery();

  const createCustomerMutation = trpc.zuma.createOrUpdateCustomerPdv.useMutation({
    onSuccess: (newCust) => {
      toast.success(`Cliente ${newCust.name} (${newCust.code || "VIP"}) cadastrado com sucesso!`);
      setSelectedCustomer(newCust);
      setCustomerName(newCust.name);
      if (newCust.phone) setCpf(newCust.phone);
      setIsNewCustomerModalOpen(false);
    },
    onError: (err) => {
      toast.error(`Erro ao cadastrar cliente: ${err.message}`);
    }
  });
  const offlineQuery = trpc.zuma.isOfflineMode.useQuery(undefined, { refetchInterval: 4000 });
  const contingencyQueueQuery = trpc.zuma.getFiscalContingencyQueue.useQuery(undefined, { refetchInterval: 4000 });
  const clothingProductsQuery = trpc.zuma.getClothingProducts.useQuery();
  const clothingProducts = clothingProductsQuery.data || [];
  const conditionalBagsQuery = trpc.zuma.getClothingConditionalBags.useQuery();
  const conditionalBags = conditionalBagsQuery.data || [];

  const createOrderMutation = trpc.zuma.createOrder.useMutation({
    onSuccess: (data) => {
      utils.zuma.listOrders.invalidate();
      utils.zuma.listStock.invalidate();
      
      const isDelivery = saleMode === "delivery";
      if (isDelivery) {
        const orderIdStr = `ZUM-${data.orderNumber}`;
        const otpCode = String(Math.floor(1000 + Math.random() * 9000));
        
        // 1. Notificar Cozinha KDS via EventBus
        orderEventBus.emit({
          orderId: orderIdStr,
          channel: "delivery",
          customerName: customerName || "Cliente Delivery",
          tableNumber: 0,
          items: cart.map(i => ({
            name: i.nome,
            praça: (i.departamento === "moda" ? "expedicao" : i.nome.toLowerCase().includes("hot") ? "quente" : "sushibar") as "sushibar" | "quente" | "fritura" | "bar" | "expedicao",
            prepMinutes: 12,
            price: i.preco,
            salmonWeightGrams: 80,
          })),
          totalValue: finalTotal,
          status: "novo",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        } as any);

        // 2. Despachar para o App do Entregador
        orderEventBus.emitDispatchToMotoboy({
          id: `CORR-${data.orderNumber}`,
          pedidoId: orderIdStr,
          cliente: {
            nome: customerName || "Cliente Delivery",
            telefone: deliveryPhone,
            endereco: `${deliveryStreet}, ${deliveryNumber}`,
            bairro: currentNeighborhood.name,
            complemento: deliveryComplement,
            lat: -14.622915 + (Math.random() - 0.5) * 0.015,
            lng: -57.493922 + (Math.random() - 0.5) * 0.015,
          },
          itens: cart.map(i => `${i.q}x ${i.nome}`).join(" + "),
          taxaEntrega: deliveryFee,
          valorTotal: finalTotal,
          formaPagamento: paymentMethod === "pix" ? "Pix Sicredi (Pagar ao Entregador)" : paymentMethod === "dinheiro" ? `Dinheiro (Troco p/ R$ ${cashGiven})` : "Cartão Maquininha",
          status: "aguardando",
          codigoOtp: otpCode,
          distanciaKm: currentNeighborhood.distanceKm || 2.5,
          tempoEstimadoMin: currentNeighborhood.avgTimeMin || 25,
          motoboyId: "MOTO-01",
          motoboyNome: selectedMotoboy,
          timestamp: new Date().toISOString(),
        });

        // 3. Abrir Impressão Térmica formatada como Via do Motoboy
        setImpressaoPayload({
          tipoComanda: "motoboy_entrega",
          mesa: "Delivery",
          cliente: customerName || "Cliente Delivery",
          telefone: deliveryPhone,
          endereco: `${deliveryStreet}, ${deliveryNumber}${deliveryComplement ? ` · ${deliveryComplement}` : ''}`,
          bairro: `${currentNeighborhood.name} (Tangará da Serra - MT)`,
          itens: cart.map(i => ({ nome: i.nome, q: i.q, preco: i.preco })),
          subtotal,
          taxaEntrega: deliveryFee,
          total: finalTotal,
          formaPagamento: paymentMethod === "pix" ? "Pix Sicredi" : paymentMethod === "apple_pay" ? "Apple Pay" : paymentMethod === "credito" ? "Cartão de Crédito" : paymentMethod === "debito" ? "Cartão de Débito" : "Dinheiro",
          trocoPara: paymentMethod === "dinheiro" ? cashGiven : 0,
        });
        setIsImpressaoModalOpen(true);
        toast.success(`Pedido Delivery #${data.orderNumber} despachado p/ Cozinha e Motoboy! OTP: ${otpCode}`);
      } else {
        toast.success(`Venda Balcão #${data.orderNumber} finalizada! NFC-e emitida e estoque baixado.`);
      }

      setCart([]);
      setCpf("");
    },
    onError: (err) => {
      toast.error(`Erro ao finalizar venda: ${err.message}`);
    }
  });

  const openTableMutation = trpc.zuma.openTable.useMutation({
    onSuccess: () => {
      toast.success(`Mesa ${selectedTableNumber} aberta com sucesso!`);
      setIsOpeningTableModal(false);
      tablesQuery.refetch();
    }
  });

  const addTableItemMutation = trpc.zuma.addTableItem.useMutation({
    onSuccess: () => {
      toast.success("Item lançado na comanda da mesa e enviado ao KDS!");
      tablesQuery.refetch();
    }
  });

  const saveTableMutation = trpc.zuma.saveTable.useMutation({
    onSuccess: (data) => {
      setTableSavedFeedback(`Salvo às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`);
      toast.success(`Mesa ${data.tableNumber} salva com sucesso!`, {
        description: `Total atual: ${formatBrl(data.table.total)} · Comanda sincronizada.`,
        icon: "💾"
      });
      tablesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar mesa: ${err.message}`);
    }
  });

  const updateTableItemQuickMutation = trpc.zuma.updateTableItem.useMutation({
    onSuccess: () => {
      tablesQuery.refetch();
    }
  });

  const joinTablesMutation = trpc.zuma.joinTables.useMutation({
    onSuccess: (data) => {
      toast.success(`Mesas unificadas com sucesso! Comanda consolidada na Mesa ${data.targetTableNumber}.`);
      setIsJoinTableModalOpen(false);
      tablesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao juntar mesas: ${err.message}`);
    }
  });

  const transferTableMutation = trpc.zuma.transferTable.useMutation({
    onSuccess: (data) => {
      toast.success(`Mesa ${data.fromTableNumber} transferida integralmente para a Mesa ${data.toTableNumber}!`);
      setIsTransferTableModalOpen(false);
      setSelectedTableNumber(data.toTableNumber);
      tablesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao transferir mesa: ${err.message}`);
    }
  });

  const transferTableItemMutation = trpc.zuma.transferTableItem.useMutation({
    onSuccess: (data) => {
      toast.success(`Prato "${data.movedItem}" movido para a comanda da Mesa ${data.toTableNumber}!`);
      setIsTransferItemModalOpen(false);
      tablesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao mover prato: ${err.message}`);
    }
  });

  const updateServiceFeeMutation = trpc.zuma.updateTableServiceFee.useMutation({
    onSuccess: () => {
      tablesQuery.refetch();
    }
  });

  const closeTableMutation = trpc.zuma.closeTable.useMutation({
    onSuccess: (data) => {
      toast.success(`Mesa ${data.tableNumber} encerrada! Total: ${formatBrl(data.finalTotal)} · NFC-e #${data.nfcNumber} autorizada.`);
      tablesQuery.refetch();
    }
  });

  const addMovementMutation = trpc.zuma.addCashMovement.useMutation({
    onSuccess: (mov) => {
      toast.success(`${mov.type === "sangria" ? "Sangria" : "Suprimento"} de ${formatBrl(mov.amount)} registrado!`);
      setIsSangriaModal(false);
      setIsSuprimentoModal(false);
      setMovementReason("");
      cashRegisterQuery.refetch();
    }
  });

  const closeCashMutation = trpc.zuma.closeCashRegister.useMutation({
    onSuccess: (reg) => {
      setCashClosedSummary(reg);
      toast.success(`Caixa fechado com sucesso! Conferência cega registrada.`);
      setIsFechamentoCegoModal(false);
      cashRegisterQuery.refetch();
    }
  });

  // Sincronização em tempo real de fechamento e liberação de mesas (Garçom / Salão)
  useEffect(() => {
    const unsub = orderEventBus.subscribeTableClosed((data) => {
      toast.success(
        `Mesa ${String(data.tableNumber).padStart(2, "0")} baixada pelo Garçom (${data.operator})!`,
        {
          description: `Total: ${formatBrl(data.total)} · Forma: ${data.paymentMethod} · NFC-e #${data.nfcNumber || "OK"}`,
          icon: "🧾",
        }
      );
      playCheckoutBeep();
      tablesQuery.refetch();
      cashRegisterQuery.refetch();
      if (selectedTableNumber === data.tableNumber) {
        setSelectedTableNumber(1);
      }
    });

    return () => unsub();
  }, [selectedTableNumber, tablesQuery, cashRegisterQuery]);

  // Funções Auxiliares do PDV Balcão
  const playCheckoutBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  };

  const addToCart = (
    nome: string, 
    preco: number, 
    departamento: Company = activeCompany,
    variacao?: string,
    ean13?: string
  ) => {
    // Validação estrita de isolamento de catálogo por empresa
    if (departamento !== activeCompany) {
      if (departamento === "gastronomia") {
        toast.error("Item de Restaurante! Alterne para Zuma Gastronomia no topo do PDV.");
      } else {
        toast.error("Item de Vestuário! Alterne para Zuma Moda & Boutique no topo do PDV.");
      }
      return;
    }

    if (departamento === "gastronomia") {
      setCartGastronomia(prev => {
        const itemKey = variacao ? `${nome} (${variacao})` : nome;
        const existing = prev.find(i => i.nome === itemKey);
        if (existing) {
          return prev.map(i => i.nome === itemKey ? { ...i, q: i.q + 1 } : i);
        }
        return [...prev, { nome: itemKey, preco, q: 1, departamento: "gastronomia", variacao, ean13 }];
      });
    } else {
      setCartModa(prev => {
        const itemKey = variacao ? `${nome} (${variacao})` : nome;
        const existing = prev.find(i => i.nome === itemKey);
        if (existing) {
          return prev.map(i => i.nome === itemKey ? { ...i, q: i.q + 1 } : i);
        }
        return [...prev, { nome: itemKey, preco, q: 1, departamento: "moda", variacao, ean13 }];
      });
    }
  };

  const handleScanBarcode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;
    playCheckoutBeep();

    if (activeCompany === "moda") {
      // 1. Procura em produtos de vestuário
      const modaProd = clothingProducts.find(p => p.ean13 === code || p.ref.toLowerCase() === code.toLowerCase());
      if (modaProd) {
        const defaultVar = `Tam ${selectedModaSize} · ${selectedModaColor}`;
        addToCart(modaProd.name, modaProd.salePrice, "moda", defaultVar, modaProd.ean13);
        toast.success(`👗 Bipe EAN-13: ${modaProd.name} (${defaultVar}) adicionado à sacola!`);
        setBarcodeScanInput("");
        return;
      }
      // Alerta se bipar comida na loja de roupas
      if (code === "7890001000261" || code.toLowerCase().includes("combo") || code.toLowerCase().includes("temaki")) {
        toast.error("Este código EAN é de um prato japonês! Alterne para a empresa Zuma Gastronomia no topo.");
        return;
      }
      toast.error(`Código EAN-13 "${code}" não localizado no catálogo de roupas da boutique.`);
    } else {
      // 2. Procura em produtos gastronômicos
      if (code === "7890001000261" || code.toLowerCase().includes("combo")) {
        addToCart("Combo 26 Peças", 69.90, "gastronomia", undefined, "7890001000261");
        toast.success("🍣 Bipe EAN-13: Combo 26 Peças adicionado à comanda!");
        setBarcodeScanInput("");
        return;
      }

      if (code === "7890001000049" || code.toLowerCase().includes("temaki")) {
        addToCart("Temaki Salmão Completo", 34.90, "gastronomia", undefined, "7890001000049");
        toast.success("🍣 Bipe EAN-13: Temaki Salmão Completo adicionado à comanda!");
        setBarcodeScanInput("");
        return;
      }

      if (code === "7890001000124" || code.toLowerCase().includes("coca")) {
        addToCart("Coca-Cola Zero 350ml", 7.90, "gastronomia", undefined, "7890001000124");
        toast.success("🍣 Bipe EAN-13: Coca-Cola Zero 350ml adicionada à comanda!");
        setBarcodeScanInput("");
        return;
      }

      // Alerta se bipar roupa no restaurante
      if (clothingProducts.some(p => p.ean13 === code || p.ref.toLowerCase() === code.toLowerCase())) {
        toast.error("Este código EAN é de uma peça de vestuário! Alterne para a empresa Zuma Moda & Boutique no topo.");
        return;
      }

      // 3. Procura no cardápio geral
      const foundDish = ALL_ITEMS.find(it => it.nome.toLowerCase().includes(code.toLowerCase()));
      if (foundDish) {
        addToCart(foundDish.nome, foundDish.preco, "gastronomia");
        toast.success(`🍣 Bipe: ${foundDish.nome} adicionado à comanda!`);
        setBarcodeScanInput("");
        return;
      }

      toast.error(`Código de barras "${code}" não localizado no cardápio de gastronomia.`);
    }
  };

  const updateQuantity = (nome: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.nome === nome) {
            const newQ = i.q + delta;
            return newQ > 0 ? { ...i, q: newQ } : null;
          }
          return i;
        })
        .filter(Boolean) as CartLine[];
    });
  };

  // Dados do Bairro Selecionado e Cálculos de Frete de Tangará
  const currentNeighborhood = deliveryNeighborhoods.find(n => n.id === selectedNeighborhoodId) || deliveryNeighborhoods[0] || {
    id: "centro",
    name: "Centro",
    zone: "Centro",
    fee: 6.0,
    rainSurcharge: 3.0,
    freeShippingMin: 100.0,
    avgTimeMin: 20,
    distanceKm: 1.0,
    cep: "78300-000"
  };

  const subtotal = cart.reduce((s, i) => s + i.preco * i.q, 0);
  const selectedBairro = allDeliveryBairros.find(b => b.id === selectedDeliveryBairroId || b.id === selectedNeighborhoodId) || allDeliveryBairros[0] || currentNeighborhood;

  const isVipCustomer = Boolean(
    selectedCustomer?.isVip || 
    selectedCustomer?.segment === "vip" || 
    (selectedCustomer?.code && selectedCustomer.code.startsWith("VIP")) ||
    (selectedCustomer?.tags && selectedCustomer.tags.includes("VIP"))
  );

  const isFreeShipping = isVipCustomer || (subtotal > 0 && subtotal >= (selectedBairro.freeShippingMin || currentNeighborhood.freeShippingMin || 100.0));
  const isFreeDeliveryByThreshold = !isVipCustomer && (subtotal > 0 && subtotal >= (selectedBairro.freeShippingMin || 100.0));
  
  const isDeliveryMode = saleMode === "delivery" || orderType === "delivery";
  const deliveryFee = isDeliveryMode 
    ? (isVipCustomer ? 0 : (isFreeShipping ? 0 : (selectedBairro.fee + (rainModeActive ? (selectedBairro.rainSurcharge || 3.0) : 0))))
    : 0;
  const calculatedDeliveryFee = deliveryFee;
  const finalTotal = Math.max(0, subtotal + deliveryFee - (appliedCoupon?.discount || 0));
  const totalWithDelivery = finalTotal;
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashGiven - finalTotal) : 0;

  const handleSelectNeighborhood = (id: string) => {
    setSelectedNeighborhoodId(id);
    setSelectedDeliveryBairroId(id);
    const found = allDeliveryBairros.find(n => n.id === id) || deliveryNeighborhoods.find(n => n.id === id);
    if (found && found.cep) {
      setDeliveryCep(found.cep);
    }
  };

  const handleCepInput = (cepTyped: string) => {
    setDeliveryCep(cepTyped);
    const clean = cepTyped.replace(/\D/g, "");
    if (clean.length >= 4) {
      const match = (allDeliveryBairros.length ? allDeliveryBairros : deliveryNeighborhoods).find(b => {
        const bClean = (b.cep || "").replace(/\D/g, "");
        if (bClean.startsWith(clean)) return true;
        const ini = b.cepInicial ? b.cepInicial.replace(/\D/g, "") : "";
        const fim = b.cepFinal ? b.cepFinal.replace(/\D/g, "") : "";
        if (ini && fim && clean >= ini.substring(0, clean.length) && clean <= fim.substring(0, clean.length)) return true;
        return false;
      });
      if (match) {
        setSelectedNeighborhoodId(match.id);
        setSelectedDeliveryBairroId(match.id);
      }
    }
  };

  const FREQUENT_CUSTOMERS_TANGARA = [
    { nome: "Thiago Silveira", tel: "(65) 99981-3320", bairroId: "tga-01", rua: "Rua Júlio Martinez Benevides", num: "820", comp: "Apto 302 - Ed. Buritis", ref: "Próximo à Praça dos Pioneiros" },
    { nome: "Dra. Vanessa Lima", tel: "(65) 99812-4410", bairroId: "tga-03", rua: "Av. Lions Internacional", num: "2150", comp: "Casa 4", ref: "Condomínio Fechado" },
    { nome: "Eng. Carlos Mendes", tel: "(65) 99650-8820", bairroId: "tga-06", rua: "Rua 24", num: "612", comp: "Casa", ref: "Em frente ao Mercado Esperança" },
    { nome: "Mariana Sampaio", tel: "(65) 99234-5566", bairroId: "tga-07", rua: "Rua 19", num: "340", comp: "Sobrado", ref: "Portão Cinza" },
  ];

  const handleFillFrequentCustomer = (c: typeof FREQUENT_CUSTOMERS_TANGARA[0]) => {
    setCustomerName(c.nome);
    setDeliveryPhone(c.tel);
    setSelectedNeighborhoodId(c.bairroId);
    setSelectedDeliveryBairroId(c.bairroId);
    setDeliveryStreet(c.rua);
    setDeliveryNumber(c.num);
    setDeliveryComplement(c.comp);
    setDeliveryReference(c.ref);
    const neigh = allDeliveryBairros.find(n => n.id === c.bairroId) || deliveryNeighborhoods.find(n => n.id === c.bairroId);
    if (neigh && neigh.cep) setDeliveryCep(neigh.cep);
    toast.success(`Dados de ${c.nome} preenchidos!`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error("O carrinho está vazio.");
    const isDelivery = saleMode === "delivery";
    const fullAddress = isDelivery 
      ? `${deliveryStreet}, ${deliveryNumber}${deliveryComplement ? ` · ${deliveryComplement}` : ''}${deliveryReference ? ` (${deliveryReference})` : ''}`
      : undefined;

    createOrderMutation.mutate({
      customerName: isDelivery ? (customerName || "Cliente Delivery") : customerName,
      customerPhone: isDelivery ? deliveryPhone : "(65) 99999-0000",
      channel: activeCompany === "moda" 
        ? (modaSaleMode === "condicional" ? "Mala Condicional Boutique (3 Dias)" : modaSaleMode === "envio_mt" ? "Envio Encomenda MT Boutique" : "Balcão Zuma Boutique") 
        : (isDelivery ? "Delivery Tele-Entrega Tangará" : "Balcão PDV Gastronomia"),
      neighborhood: isDelivery ? currentNeighborhood.name : "Zuma Tangará",
      deliveryFee: isDelivery ? deliveryFee : 0,
      deliveryAddress: fullAddress,
      deliveryCep: isDelivery ? deliveryCep : undefined,
      deliveryNotes: activeCompany === "moda"
        ? `Consultora: ${modaConsultant}. Embalagem presente: ${isGiftWrap ? 'Sim' : 'Não'}`
        : (isDelivery ? `Despachado p/ ${selectedMotoboy}. CEP: ${deliveryCep}` : undefined),
      motoboyName: isDelivery ? selectedMotoboy : undefined,
      trocoPara: paymentMethod === "dinheiro" && deliveryTrocoPara > 0 ? deliveryTrocoPara : undefined,
      empresa: activeCompany,
      items: cart.map(i => ({
        itemName: i.nome,
        category: activeCompany === "moda" ? "Moda" : "Gastronomia",
        quantity: i.q,
        unitPrice: i.preco,
      })),
      paymentMethod: paymentMethod === "pix" ? "Pix Sicredi" : paymentMethod === "apple_pay" ? "Apple Pay" : paymentMethod === "credito" ? "Cartão de Crédito" : paymentMethod === "debito" ? "Cartão de Débito" : "Dinheiro",
      hasCpf: !!cpf,
      cpf: cpf || undefined,
    });
  };

  // Dados do Cardápio Filtrado
  const categoryItems = (MENU[selectedCat] || [])
    .filter(([nome]) => !searchFilter || nome.toLowerCase().includes(searchFilter.toLowerCase()))
    .map(([nome, preco]) => ({ nome, preco }));

  const tables = tablesQuery.data || [];
  const selectedTable = tables.find(t => t.tableNumber === selectedTableNumber) || tables[0];
  const cashRegister = cashRegisterQuery.data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ========================================================= */}
      {/* SELETOR PROEMINENTE DE EMPRESA / HOLDING ZUMA             */}
      {/* ========================================================= */}
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl p-3 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            Unidade de Negócio Ativa da Holding Zuma
          </span>
          <span className="text-[11px] font-mono text-[var(--muted)] bg-[var(--surface2)] px-2.5 py-0.5 rounded-full border border-[var(--line)]">
            Isolamento Fiscal &amp; Catálogo 100% Separados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card Empresa 1: Zuma Gastronomia & Sushibar */}
          <button
            type="button"
            onClick={() => handleSwitchCompany("gastronomia")}
            className={`p-3.5 rounded-xl border-2 transition-all flex items-start gap-3.5 text-left cursor-pointer ${
              activeCompany === "gastronomia"
                ? "bg-orange-500/10 border-orange-500 shadow-md ring-2 ring-orange-500/20"
                : "bg-[var(--surface2)] border-[var(--line)] hover:border-orange-300 opacity-70 hover:opacity-100"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              activeCompany === "gastronomia" ? "bg-orange-500 text-white shadow-xs" : "bg-[var(--line)] text-[var(--muted)]"
            }`}>
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[var(--ink)]">
                  🍣 Zuma Gastronomia &amp; Sushibar
                </span>
                {activeCompany === "gastronomia" && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider shadow-2xs">
                    Em Operação
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[var(--muted)] font-mono mt-0.5">
                CNPJ: 36.296.848/0001-57 · Culinária Japonesa, Salão &amp; Delivery MT
              </div>
              <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold mt-1">
                Carrinho: {cartGastronomia.length} {cartGastronomia.length === 1 ? "item japonês" : "itens japoneses"} ({formatBrl(cartGastronomia.reduce((s, i) => s + i.preco * i.q, 0))})
              </div>
            </div>
          </button>

          {/* Card Empresa 2: Zuma Moda & Boutique */}
          <button
            type="button"
            onClick={() => handleSwitchCompany("moda")}
            className={`p-3.5 rounded-xl border-2 transition-all flex items-start gap-3.5 text-left cursor-pointer ${
              activeCompany === "moda"
                ? "bg-purple-600/10 border-purple-600 shadow-md ring-2 ring-purple-600/20"
                : "bg-[var(--surface2)] border-[var(--line)] hover:border-purple-300 opacity-70 hover:opacity-100"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              activeCompany === "moda" ? "bg-purple-600 text-white shadow-xs" : "bg-[var(--line)] text-[var(--muted)]"
            }`}>
              <Shirt className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[var(--ink)]">
                  👗 Zuma Moda &amp; Boutique
                </span>
                {activeCompany === "moda" && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px] uppercase tracking-wider shadow-2xs">
                    Em Operação
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[var(--muted)] font-mono mt-0.5">
                CNPJ: 36.296.848/0002-38 · Linho Puro Riviera, Vestidos &amp; Malas Condicionais
              </div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                Sacola: {cartModa.length} {cartModa.length === 1 ? "peça de roupa" : "peças de roupas"} ({formatBrl(cartModa.reduce((s, i) => s + i.preco * i.q, 0))})
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Header Principal Adaptativo por Empresa */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              activeCompany === "gastronomia"
                ? "bg-orange-500/10 text-orange-600"
                : "bg-purple-600/10 text-purple-600"
            }`}>
              {activeCompany === "gastronomia" ? "🍣 Frente de Caixa & Salão · Zuma Gastronomia" : "👗 Frente de Caixa & Boutique · Zuma Moda"}
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">
              {activeCompany === "gastronomia" ? "CNPJ: 36.296.848/0001-57" : "CNPJ: 36.296.848/0002-38"} · Tangará da Serra (MT)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-1">
            {activeCompany === "gastronomia" 
              ? "Frente de Caixa, Mapa de Mesas & Turno Gastronômico" 
              : "Frente de Caixa Boutique, Grade & Malas Condicionais"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            {activeCompany === "gastronomia"
              ? "Venda balcão express, delivery com motoboys MT, comanda de salão (27 mesas), motor offline e NFC-e restaurante."
              : "Venda balcão boutique, controle por grade (P/M/G), leitor EAN-13, malas de provador (3 dias) e NFC-e varejo."}
          </p>
        </div>

        {/* Barra de Ações Operacionais Agrupadas e Status Consolidado */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Card de Status Unificado do Caixa & Nuvem */}
          <div className="flex items-center bg-[var(--surface2)] border border-[var(--line)] rounded-xl p-1 text-xs shadow-2xs">
            {/* Status do Caixa */}
            <button
              onClick={() => setActiveTab("gestao_caixa")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--ink)] font-semibold transition cursor-pointer"
              title="Clique para gerenciar sangrias, suprimentos e fechamento de turno"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Caixa Aberto</span>
              <span className="text-[var(--muted)] font-mono text-[11px] hidden sm:inline">· {activeCompany === "moda" ? "Camila (Boutique)" : (cashRegister?.operator || "Mariana")}</span>
            </button>

            <span className="w-px h-4 bg-[var(--line)] mx-1" />

            {/* Status da Nuvem & Modo Offline */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                isOnline && pendingCount === 0
                  ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                  : isSyncing
                  ? "text-blue-600 animate-pulse hover:bg-blue-500/10"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
              title="Status da conexão com Google Cloud Run e fila de contingência"
            >
              {isOnline && pendingCount === 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Nuvem Ativa</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline ({pendingCount})</span>
                </>
              )}
            </button>
          </div>

          {/* Botão Primário 1: Bairros & Frete MT */}
          <button
            onClick={() => setIsBairrosFreteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Gestão de CEPs de Tangará da Serra e Cidades do Estado de MT"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Bairros &amp; Frete MT</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-white text-[10px] font-mono">
              {allDeliveryBairros.length || 62}
            </span>
          </button>

          {/* Botão Primário 2: Central Fiscal NFC-e */}
          <button
            onClick={() => setIsContingenciaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Central de Emissão Fiscal NFC-e SEFAZ-MT"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Fiscal NFC-e</span>
            {(contingencyQueueQuery.data?.length || 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                {contingencyQueueQuery.data?.length}
              </span>
            )}
          </button>

          {/* Botão Primário 3: Instalar PDV (Win / Mac / iPad) */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Instalar App no Windows 10/11, macOS ou iPad"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar PDV</span>
          </button>

          {/* Menu Dropdown Agrupado: Ferramentas */}
          <div className="relative">
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Ferramentas</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
            </button>

            {isToolsMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1"
                onMouseLeave={() => setIsToolsMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Operações da Empresa
                </div>
                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    const isBalcao = activeTab === "pdv_balcao";
                    setImpressaoPayload({
                      tipoComanda: "pre_conta",
                      mesa: isBalcao ? (activeCompany === "moda" ? "Balcão Boutique Moda" : "Balcão Gastronomia") : selectedTableNumber,
                      cliente: isBalcao ? (selectedCustomer?.name || customerName) : "Cliente Salão",
                      itens: isBalcao 
                        ? cart.map(i => ({ nome: i.nome, q: i.q, preco: i.preco }))
                        : selectedTable?.orderItems?.map(i => ({ nome: i.itemName, q: i.quantity, preco: i.unitPrice })) || [
                            { nome: "Combo 26 Peças", q: 1, preco: 69.90 },
                            { nome: "Hot Filadélfia Trufado", q: 1, preco: 31.90 }
                          ],
                      subtotal: isBalcao ? subtotal : (selectedTable?.subtotal || 101.80),
                      taxaServico: isBalcao ? 0 : (selectedTable?.subtotal || 101.80) * 0.1,
                      total: isBalcao ? totalWithDelivery - (appliedCoupon?.discount || 0) : (selectedTable?.subtotal || 101.80) * 1.1,
                      formaPagamento: paymentMethod === "pix" ? "Pix Sicredi" : paymentMethod === "apple_pay" ? "Apple Pay" : paymentMethod === "credito" ? "Cartão de Crédito" : paymentMethod === "debito" ? "Cartão de Débito" : "Dinheiro"
                    });
                    setIsImpressaoModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold">Bobina Térmica 80mm</div>
                    <div className="text-[10px] text-[var(--muted)]">Impressão de comprovante e DANFE</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsCuponsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold">Cupons &amp; Fidelidade</div>
                    <div className="text-[10px] text-[var(--muted)]">Campanhas e descontos VIP</div>
                  </div>
                </button>

                {activeCompany === "gastronomia" && (
                  <button
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      setIsIfoodCardapioModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-bold">Pausar Cardápio iFood</div>
                      <div className="text-[10px] text-[var(--muted)]">Pausar itens ou delivery por horário</div>
                    </div>
                  </button>
                )}

                <div className="border-t border-[var(--line)] my-1" />

                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Auditoria &amp; Prevenção de Perdas
                </div>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsAuditoriaModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold">Auditoria &amp; PIN Gerencial</div>
                    <div className="text-[10px] text-[var(--muted)]">Cancelamentos e estornos com PIN</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsTrilhaAuditoriaModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Trilha de Auditoria</div>
                    <div className="text-[10px] text-[var(--muted)]">Logs de operadores, caixa e SEFAZ</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação entre os Modos Operacionais da Empresa Selecionada */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 overflow-x-auto">
        {activeCompany === "gastronomia" ? (
          <>
            <button
              onClick={() => setActiveTab("pdv_balcao")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "pdv_balcao"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Venda Rápida (Balcão &amp; Delivery MT)</span>
            </button>

            <button
              onClick={() => setActiveTab("mesas_salao")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "mesas_salao"
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Mapa de Mesas &amp; Comandas de Salão</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-mono">
                {tables.filter(t => t.status === "ocupada" || t.status === "conta").length} Ocupadas
              </span>
            </button>

            <button
              onClick={() => setActiveTab("gestao_caixa")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "gestao_caixa"
                  ? "bg-[var(--ink)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Gestão de Turno, Sangrias &amp; Fechamento Cego</span>
            </button>

            <button
              onClick={() => setActiveTab("dre_turno")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "dre_turno"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-purple-300" />
              <span>DRE Diário do Turno (CMV Real &amp; EBITDA)</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("pdv_balcao")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "pdv_balcao"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Caixa Balcão Boutique (Venda Direta)</span>
            </button>

            <button
              id="tab-btn-malas-condicionais"
              onClick={() => setActiveTab("malas_condicionais")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                (activeTab as any) === "malas_condicionais"
                  ? "bg-[#ff6b4a] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Malas Condicionais (Provador em Casa · 3 Dias)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-mono">
                {conditionalBags.length} Ativas
              </span>
            </button>

            <button
              onClick={() => setActiveTab("gestao_caixa")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "gestao_caixa"
                  ? "bg-[var(--ink)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Gestão de Caixa da Boutique</span>
            </button>

            <a
              href="/moda"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-500/10 transition whitespace-nowrap ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Central Zuma Moda ↗</span>
            </a>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODO 1: VENDA RÁPIDA PDV BALCÃO                           */}
      {/* ========================================================= */}
      {activeTab === "pdv_balcao" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Lado Esquerdo: Catálogo de Produtos e Busca */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
              
              {/* Header do Catálogo da Empresa Ativa */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeCompany === "gastronomia" ? "bg-orange-500 text-white" : "bg-purple-600 text-white"
                  }`}>
                    {activeCompany === "gastronomia" ? <UtensilsCrossed className="w-4 h-4" /> : <Shirt className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[var(--ink)]">
                      {activeCompany === "gastronomia" 
                        ? "🍣 Cardápio Zuma Gastronomia & Sushibar" 
                        : "👗 Coleções & Vestuário · Zuma Moda & Boutique"}
                    </h2>
                    <p className="text-[11px] text-[var(--muted)]">
                      {activeCompany === "gastronomia"
                        ? "Pratos, combinados, hossomakis, uramakis e drinques japoneses"
                        : "Linho Puro Riviera, Vestidos Midi, Alfaiataria Nobre & Acessórios"}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeCompany === "gastronomia" 
                    ? "bg-orange-500/10 text-orange-600" 
                    : "bg-purple-600/10 text-purple-600"
                }`}>
                  {activeCompany === "gastronomia" ? "Restaurante" : "Boutique"}
                </span>
              </div>

              {/* Barra de Leitor & Scanner de Código de Barras EAN-13 */}
              <div className="p-3 bg-[var(--surface2)] border border-[var(--line)] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
                  <div className="flex items-center gap-1 text-[var(--ink)]">
                    <Barcode className="w-4 h-4 text-orange-600" />
                    <span>Leitor &amp; Scanner de Código de Barras (EAN-13)</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono font-bold">
                    <Volume2 className="w-3 h-3" /> Bipe Sonoro Ativo (Web Audio)
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={barcodeScanInput}
                      onChange={e => setBarcodeScanInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          handleScanBarcode(barcodeScanInput);
                        }
                      }}
                      placeholder={activeCompany === "gastronomia" ? "Aponte o leitor laser ou digite o EAN do prato/bebida..." : "Aponte o leitor laser ou digite o EAN da peça de roupa..."}
                      className="w-full pl-3 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
                    />
                  </div>
                  <button
                    onClick={() => handleScanBarcode(barcodeScanInput)}
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Bipar EAN</span>
                  </button>
                </div>

                {/* Atalhos Rápidos de Simulação de Bipe EAN-13 Específicos da Empresa */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[var(--muted)] font-medium">Bipes rápidos de teste:</span>
                  {activeCompany === "gastronomia" ? (
                    <>
                      <button
                        onClick={() => handleScanBarcode("7890001000261")}
                        className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:border-orange-500 text-[10px] font-mono text-[var(--ink)] flex items-center gap-1 transition cursor-pointer"
                        title="Combo 26 Peças EAN 7890001000261"
                      >
                        <span>🍣 Combo 26p (7890001000261)</span>
                      </button>
                      <button
                        onClick={() => handleScanBarcode("7890001000049")}
                        className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:border-orange-500 text-[10px] font-mono text-[var(--ink)] flex items-center gap-1 transition cursor-pointer"
                        title="Temaki Salmão EAN 7890001000049"
                      >
                        <span>🍣 Temaki Salmão (7890001000049)</span>
                      </button>
                      <button
                        onClick={() => handleScanBarcode("7890001000124")}
                        className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:border-orange-500 text-[10px] font-mono text-[var(--ink)] flex items-center gap-1 transition cursor-pointer"
                        title="Coca-Cola Zero EAN 7890001000124"
                      >
                        <span>🥤 Coca-Cola Zero (7890001000124)</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleScanBarcode("7891234567810")}
                        className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:border-purple-500 text-[10px] font-mono text-[var(--ink)] flex items-center gap-1 transition cursor-pointer"
                        title="Camisa Linho Riviera EAN 7891234567810"
                      >
                        <span>👗 Camisa Linho (7891234567810)</span>
                      </button>
                      <button
                        onClick={() => handleScanBarcode("7891234567827")}
                        className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] hover:border-purple-500 text-[10px] font-mono text-[var(--ink)] flex items-center gap-1 transition cursor-pointer"
                        title="Vestido Midi Seda EAN 7891234567827"
                      >
                        <span>👗 Vestido Midi (7891234567827)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Barra de Busca de Itens */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder={activeCompany === "gastronomia" ? "Buscar prato por nome ou código..." : "Buscar peça de roupa por nome, ref ou coleção..."}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
                  />
                </div>
              </div>

              {/* EXIBIÇÃO EXCLUSIVA DE GASTRONOMIA */}
              {activeCompany === "gastronomia" && (
                <>
                  {/* Categorias em Pílulas */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {Object.keys(MENU).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCat(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                          selectedCat === cat
                            ? "bg-orange-600 text-white font-bold shadow-xs"
                            : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Grid de Itens Gastronomia */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {categoryItems.map(item => (
                      <button
                        key={item.nome}
                        onClick={() => {
                          playCheckoutBeep();
                          addToCart(item.nome, item.preco, "gastronomia");
                        }}
                        className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-orange-500 hover:bg-[var(--surface)] transition-all text-left flex flex-col justify-between min-h-[90px] group shadow-xs cursor-pointer"
                      >
                        <span className="text-xs font-bold text-[var(--ink)] line-clamp-2 leading-tight group-hover:text-orange-600">
                          {item.nome}
                        </span>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--line)]/50">
                          <span className="font-mono text-xs font-bold text-[var(--good)]">
                            {formatBrl(item.preco)}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--ink)] text-xs font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* EXIBIÇÃO EXCLUSIVA DE MODA & VESTUÁRIO */}
              {activeCompany === "moda" && (
                <div className="space-y-3">
                  {/* Pílulas de Coleções & Categorias de Moda */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {["TODAS", "Alto Verão 2026", "Alfaiataria Nobre", "Básicos Essenciais", "Camisas & Polos", "Vestidos & Macacões"].map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedModaCollection(col)}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                          selectedModaCollection === col
                            ? "bg-purple-600 text-white font-bold shadow-xs"
                            : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>

                  {/* Grid de Roupas com Grade P/M/G/GG e Cores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                    {clothingProducts
                      .filter(p => {
                        const matchSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.ref.toLowerCase().includes(searchFilter.toLowerCase());
                        const matchCol = selectedModaCollection === "TODAS" || p.collection === selectedModaCollection || p.category === selectedModaCollection;
                        return matchSearch && matchCol;
                      })
                      .map(prod => {
                        const totalStock = prod.grid.reduce((sum, g) => sum + g.stock, 0);
                        const sizesAvailable = Array.from(new Set(prod.grid.map(g => g.size)));
                        const colorsAvailable = Array.from(new Set(prod.grid.map(g => g.color)));

                        return (
                          <div
                            key={prod.id}
                            className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-purple-500 transition-all space-y-2.5 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className="font-bold text-xs text-[var(--ink)] block leading-tight">
                                  {prod.name}
                                </span>
                                <span className="text-[10px] text-[var(--muted)] font-mono">
                                  Ref: {prod.ref} · {prod.collection}
                                </span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[10px] font-bold shrink-0">
                                {totalStock} un
                              </span>
                            </div>

                            {/* Seleção Rápida de Grade P/M/G */}
                            <div className="space-y-1 pt-1 border-t border-[var(--line)]/50">
                              <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
                                <span>Tamanho na Grade:</span>
                                <span className="font-mono">{selectedModaSize}</span>
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                {sizesAvailable.map(sz => {
                                  const stockSz = prod.grid.filter(g => g.size === sz).reduce((s, g) => s + g.stock, 0);
                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => setSelectedModaSize(sz)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                        selectedModaSize === sz
                                          ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                          : "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-purple-400"
                                      }`}
                                    >
                                      {sz} ({stockSz})
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--line)]/50">
                              <span className="font-mono font-black text-sm text-[var(--ink)]">
                                {formatBrl(prod.salePrice)}
                              </span>
                              <button
                                onClick={() => {
                                  playCheckoutBeep();
                                  const varLabel = `Tam ${selectedModaSize} · ${colorsAvailable[0] || selectedModaColor}`;
                                  addToCart(prod.name, prod.salePrice, "moda", varLabel, prod.ean13);
                                  toast.success(`👗 ${prod.name} (${varLabel}) adicionado à sacola!`);
                                }}
                                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Adicionar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Lado Direito: Comanda da Gastronomia OU Sacola da Boutique */}
            <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
              
              {/* Header da Comanda / Sacola */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${activeCompany === "gastronomia" ? "bg-orange-500/10 text-orange-600" : "bg-purple-600/10 text-purple-600"}`}>
                    {activeCompany === "gastronomia" ? <ShoppingCart className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--ink)]">
                      {activeCompany === "gastronomia" ? "Comanda Zuma Gastronomia" : "Sacola Zuma Moda & Boutique"}
                    </h2>
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      {activeCompany === "gastronomia" ? "CNPJ: 36.296.848/0001-57" : "CNPJ: 36.296.848/0002-38"}
                    </span>
                  </div>
                </div>

                {/* Seletor de Modalidade Específico de Cada Empresa */}
                {activeCompany === "gastronomia" ? (
                  <div className="flex bg-[var(--surface2)] p-0.5 rounded-lg border border-[var(--line)] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setSaleMode("balcao");
                        setOrderType("balcao");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        saleMode === "balcao" && orderType === "balcao"
                          ? "bg-[var(--surface)] text-[var(--ink)] shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>🏢 Balcão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSaleMode("delivery");
                        setOrderType("delivery");
                      }}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        saleMode === "delivery" || orderType === "delivery"
                          ? "bg-blue-600 text-white shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>🛵 Delivery MT</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex bg-[var(--surface2)] p-0.5 rounded-lg border border-[var(--line)] text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setModaSaleMode("balcao")}
                      className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        modaSaleMode === "balcao"
                          ? "bg-purple-600 text-white shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>🛍️ Venda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModaSaleMode("condicional")}
                      className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        modaSaleMode === "condicional"
                          ? "bg-[#ff6b4a] text-white shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>👗 Mala 3D</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModaSaleMode("envio_mt")}
                      className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        modaSaleMode === "envio_mt"
                          ? "bg-blue-600 text-white shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span>📦 MT</span>
                    </button>
                  </div>
                )}
              </div>

              {/* IDENTIFICAÇÃO INTELIGENTE DO CLIENTE (CRM ZUMA) & REGRA VIP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[var(--muted)] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    {activeCompany === "gastronomia" ? "Cliente & Fidelidade Zuma" : "Cliente & Medidas VIP Boutique"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Novo Cliente</span>
                  </button>
                </div>

                {/* Card do Cliente Selecionado */}
                {selectedCustomer ? (
                  <div className={`p-3 rounded-xl border transition-all ${
                    isVipCustomer 
                      ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30" 
                      : "bg-[var(--surface2)] border-[var(--line)]"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isVipCustomer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9.5px] uppercase shadow-xs">
                              <Crown className="w-3 h-3 fill-slate-950" />
                              Cliente VIP
                            </span>
                          )}
                          <span className="font-extrabold text-xs text-[var(--ink)] truncate">
                            {selectedCustomer.name}
                          </span>
                          {selectedCustomer.code && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] font-bold">
                              {selectedCustomer.code}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-2 flex-wrap">
                          {selectedCustomer.phone && (
                            <span>📱 {selectedCustomer.phone}</span>
                          )}
                          {selectedCustomer.neighborhood && (
                            <span>📍 {selectedCustomer.neighborhood}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearchQuery("");
                          setIsCustomerDropdownOpen(true);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
                      >
                        Trocar
                      </button>
                    </div>

                    {/* Aviso de Entrega Grátis VIP na Gastronomia */}
                    {isVipCustomer && activeCompany === "gastronomia" && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center gap-1.5 text-amber-800 dark:text-amber-200 font-extrabold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>ISENÇÃO TOTAL: Entrega 100% Grátis Cortesia VIP Zuma</span>
                      </div>
                    )}

                    {/* Aviso de Mala Condicional VIP na Moda */}
                    {isVipCustomer && activeCompany === "moda" && (
                      <div className="mt-2 pt-2 border-t border-purple-500/20 flex items-center gap-1.5 text-purple-800 dark:text-purple-200 font-extrabold text-[11px]">
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Crédito VIP Boutique: Provador Liberado sem Caução</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={e => {
                          setCustomerSearchQuery(e.target.value);
                          setIsCustomerDropdownOpen(true);
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        placeholder="Buscar cliente por Código (ex: VIP-01), Nome ou WhatsApp..."
                        className="w-full pl-8 pr-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>

                    {isCustomerDropdownOpen && customerSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl max-h-56 overflow-y-auto z-40 divide-y divide-[var(--line)] text-xs">
                        {customerSearchResults.map((cust: any) => {
                          const isVip = Boolean(cust.isVip || cust.segment === "vip" || (cust.code && cust.code.startsWith("VIP")));
                          return (
                            <button
                              key={cust.id}
                              type="button"
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setCustomerName(cust.name);
                                if (cust.phone) setCpf(cust.phone);
                                setIsCustomerDropdownOpen(false);
                              }}
                              className="w-full p-2.5 text-left hover:bg-[var(--surface2)] transition flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {isVip ? (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] flex items-center gap-0.5">
                                      <Crown className="w-2.5 h-2.5" /> VIP
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-bold text-[9px]">
                                      {cust.code || "CLI"}
                                    </span>
                                  )}
                                  <span className="font-bold text-[var(--ink)] truncate">{cust.name}</span>
                                </div>
                                <div className="text-[10px] text-[var(--muted)] font-mono">
                                  {cust.phone} · {cust.neighborhood || "Tangará da Serra"}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* OPÇÕES EXCLUSIVAS DA BOUTIQUE (Consultora e Embalagem Presente) */}
              {activeCompany === "moda" && (
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-purple-900 dark:text-purple-300">
                      Atendimento Boutique:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[var(--ink)]">
                      <input
                        type="checkbox"
                        checked={isGiftWrap}
                        onChange={e => setIsGiftWrap(e.target.checked)}
                        className="rounded accent-purple-600"
                      />
                      <span>🎁 Embalagem Presente</span>
                    </label>
                  </div>
                  <select
                    value={modaConsultant}
                    onChange={e => setModaConsultant(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-semibold text-[var(--ink)]"
                  >
                    <option value="Camila Prado (Consultora VIP Boutique)">Camila Prado (Consultora VIP Boutique)</option>
                    <option value="Juliana Rossi (Personal Stylist)">Juliana Rossi (Personal Stylist)</option>
                    <option value="Beatriz Mendonça (Consultora de Imagem)">Beatriz Mendonça (Consultora de Imagem)</option>
                  </select>
                </div>
              )}

              {/* SELEÇÃO DE BAIRRO / CEP DE MATO GROSSO (SE FOR DELIVERY NA GASTRONOMIA) */}
              {activeCompany === "gastronomia" && orderType === "delivery" && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Bairro / CEP de Destino MT:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsBairrosFreteModalOpen(true)}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Gerenciar Fretes ({allDeliveryBairros.length})
                    </button>
                  </div>

                  <select
                    value={selectedDeliveryBairroId}
                    onChange={e => setSelectedDeliveryBairroId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg font-semibold text-xs text-[var(--ink)] focus:outline-hidden"
                  >
                    {allDeliveryBairros.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.cidade || "Tangará da Serra"}) — R$ {Number(b.fee).toFixed(2)} (CEP: {b.cep || "Geral"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* LISTA DE ITENS DO CARRINHO (ESTRITAMENTE ISOLADO POR EMPRESA) */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-[var(--muted)] text-xs border border-dashed border-[var(--line)] rounded-xl">
                    {activeCompany === "gastronomia" 
                      ? "Nenhum prato na comanda gastronômica. Selecione sushi no cardápio à esquerda." 
                      : "Nenhuma peça na sacola da boutique. Selecione roupas no catálogo à esquerda."}
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--surface2)] border border-[var(--line)]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[var(--ink)] truncate">
                            {item.nome}
                          </span>
                          {item.departamento === "moda" ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600">
                              👗 Roupa
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/10 text-orange-600">
                              🍣 Sushi
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] font-mono">
                          <span>{formatBrl(item.preco)} cada</span>
                          {item.ean13 && <span>· EAN: {item.ean13}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.nome, -1)}
                          className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--ink)] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-xs">{item.q}</span>
                        <button
                          onClick={() => updateQuantity(item.nome, 1)}
                          className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--ink)] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs text-[var(--ink)] min-w-[65px] text-right">
                        {formatBrl(item.preco * item.q)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Informações de Pagamento / Mala Condicional */}
              <div className="pt-2 border-t border-[var(--line)] space-y-2">
                {activeCompany === "moda" && modaSaleMode === "condicional" ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5 font-black">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Mala Condicional (Provador em Casa · 3 Dias)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      As peças saem consignadas com a cliente sem cobrança no cartão neste momento. Prazo de devolução ou acerto: 3 dias úteis. Emissão automática do Termo de Responsabilidade com CPF.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: "pix", label: "Pix", icon: QrCode },
                        { id: "credito", label: "Crédito", icon: CreditCard },
                        { id: "debito", label: "Débito", icon: CreditCard },
                        { id: "dinheiro", label: "Dinheiro", icon: Banknote },
                      ].map(m => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              paymentMethod === m.id
                                ? (activeCompany === "gastronomia" ? "bg-orange-600 border-orange-600 text-white shadow-2xs" : "bg-purple-600 border-purple-600 text-white shadow-2xs")
                                : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* CPF na Nota */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={cpf}
                        onChange={e => setCpf(e.target.value)}
                        placeholder="CPF na NFC-e (Programa Nota MT)"
                        className="flex-1 px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-mono text-[var(--ink)]"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Totais e Botão de Finalização Específico de Cada Empresa */}
              <div className="pt-3 border-t border-[var(--line)] space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-[var(--ink)]">{formatBrl(subtotal)}</span>
                  </div>

                  {activeCompany === "gastronomia" && (orderType === "delivery" || saleMode === "delivery") && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        Taxa de Entrega ({selectedBairro.name || currentNeighborhood.name}):
                      </span>
                      {isVipCustomer ? (
                        <span className="font-black text-emerald-600 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          GRÁTIS (VIP 👑)
                        </span>
                      ) : isFreeShipping || isFreeDeliveryByThreshold ? (
                        <span className="font-black text-emerald-600">
                          GRÁTIS (Acima de {formatBrl(selectedBairro.freeShippingMin || 100)})
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-[var(--ink)]">
                          {formatBrl(deliveryFee)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {activeCompany === "moda" && modaSaleMode === "condicional" ? "Valor em Consignação:" : "Total Geral a Pagar:"}
                    </span>
                    <span className={`text-xl font-black font-mono ${activeCompany === "gastronomia" ? "text-orange-600" : "text-purple-600"}`}>
                      {formatBrl(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação por Empresa e Modalidade */}
                {activeCompany === "gastronomia" ? (
                  <button
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending || cart.length === 0}
                    className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {saleMode === "delivery" ? (
                      <>
                        <Bike className="w-4 h-4" />
                        <span>{createOrderMutation.isPending ? "Despachando Pedido..." : "Despachar Delivery (KDS + Motoboy) & NFC-e"}</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4" />
                        <span>{createOrderMutation.isPending ? "Emitindo NFC-e..." : "Finalizar Venda & Emitir NFC-e Restaurante"}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (cart.length === 0) return toast.error("A sacola da boutique está vazia.");
                      if (modaSaleMode === "condicional") {
                        toast.success("👗 Termo de Mala Condicional (3 Dias) emitido com sucesso!", {
                          description: `Cliente: ${selectedCustomer?.name || customerName} · ${cart.length} peças consignadas.`
                        });
                        setCartModa([]);
                      } else {
                        handleCheckout();
                      }
                    }}
                    disabled={createOrderMutation.isPending || cart.length === 0}
                    className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {modaSaleMode === "condicional" ? (
                      <>
                        <Shirt className="w-4 h-4" />
                        <span>Emitir Termo de Mala Condicional (3 Dias) &amp; Liberar Peças</span>
                      </>
                    ) : modaSaleMode === "envio_mt" ? (
                      <>
                        <Truck className="w-4 h-4" />
                        <span>Despachar Encomenda Boutique &amp; Emitir NFC-e</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4" />
                        <span>{createOrderMutation.isPending ? "Emitindo..." : "Finalizar Venda Boutique & Emitir NFC-e Varejo"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO EXTRA MODA: GESTÃO DE MALAS CONDICIONAIS             */}
      {/* ========================================================= */}
      {(activeTab as any) === "malas_condicionais" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-600/10 text-purple-600">
                  Provador em Casa · Zuma Moda &amp; Boutique
                </span>
                <h2 className="text-xl font-extrabold text-[var(--ink)] mt-1">
                  Central de Malas Condicionais (3 Dias)
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Controle de peças em consignação, prazos de devolução de 72h e conversão em vendas.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab("pdv_balcao");
                  setModaSaleMode("condicional");
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Montar Nova Mala</span>
              </button>
            </div>

            {/* KPIs de Malas Condicionais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Malas em Aberto</span>
                <span className="text-2xl font-black text-purple-600 font-mono mt-1 block">
                  {conditionalBags.length || 2}
                </span>
                <span className="text-[10px] text-[var(--muted)]">Com clientes VIP</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Peças em Provador</span>
                <span className="text-2xl font-black text-[var(--ink)] font-mono mt-1 block">
                  {conditionalBags.reduce((s: number, b: any) => s + (b.items?.length || 0), 0) || 6}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Grade ativa</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Valor Consignado</span>
                <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
                  {formatBrl(conditionalBags.reduce((s: number, b: any) => s + (b.items?.reduce((si: number, it: any) => si + (it.price || 0), 0) || 0), 0) || 1644.0)}
                </span>
                <span className="text-[10px] text-[var(--muted)]">Em trânsito 72h</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Taxa de Conversão</span>
                <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                  78.4%
                </span>
                <span className="text-[10px] text-[var(--muted)]">Média histórica</span>
              </div>
            </div>

            {/* Lista das Malas Condicionais Ativas */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)] block">
                Malas Ativas em Posse das Clientes:
              </span>

              {conditionalBags.map((bag: any) => {
                const totalMala = bag.items.reduce((s: number, i: any) => s + i.price, 0);
                return (
                  <div
                    key={bag.id}
                    className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)]/50 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[var(--ink)]">{bag.customerName}</span>
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                            {bag.dueAt}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--muted)] font-mono">
                          {bag.customerPhone} · Retirada: {bag.openedAt}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--muted)] block">Total em Consignação:</span>
                        <span className="font-mono font-black text-base text-purple-600">{formatBrl(totalMala)}</span>
                      </div>
                    </div>

                    {/* Peças da Mala */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {bag.items.map((it: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[var(--ink)] block">{it.productName}</span>
                            <span className="text-[10px] text-[var(--muted)] font-mono">Tam {it.size} · {it.color}</span>
                          </div>
                          <span className="font-mono font-bold text-xs">{formatBrl(it.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]/50">
                      <button
                        onClick={() => {
                          toast.success(`Peças de ${bag.customerName} devolvidas ao estoque com sucesso!`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[var(--line)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-bold transition cursor-pointer"
                      >
                        Registrar Devolução
                      </button>
                      <button
                        onClick={() => {
                          bag.items.forEach((it: any) => {
                            addToCart(it.productName, it.price, "moda", `Tam ${it.size} · ${it.color}`);
                          });
                          setActiveTab("pdv_balcao");
                          setModaSaleMode("balcao");
                          toast.success(`Peças de ${bag.customerName} adicionadas à sacola para emissão de NFC-e!`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Efetivar Venda &amp; Emitir NFC-e</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 2: MAPA DE MESAS & COMANDAS DE SALÃO (KEETO POS)     */}
      {/* ========================================================= */}
      {activeTab === "mesas_salao" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Grid Interativo de Mesas (Esquerda) */}
            <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
                    Salão Zuma · 24 Mesas &amp; Comandas Mobile
                  </h2>
                  <p className="text-xs text-[var(--muted)]">Clique em uma mesa para lançar pedidos, rachar a conta ou emitir o fechamento fiscal.</p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-[var(--good)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--good)]" /> Livre
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" /> Ocupada
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Conta
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Reservada
                  </span>
                </div>
              </div>

              {/* Grid das Mesas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tables.map(table => {
                  const isSelected = table.tableNumber === selectedTableNumber;
                  const isOcupada = table.status === "ocupada";
                  const isConta = table.status === "conta";
                  const isReservada = table.status === "reservada";
                  const isLivre = table.status === "livre";

                  return (
                    <button
                      key={table.tableNumber}
                      onClick={() => setSelectedTableNumber(table.tableNumber)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[110px] ${
                        isSelected 
                          ? "ring-2 ring-[var(--salmon)] border-transparent shadow-md bg-[var(--surface)]" 
                          : "bg-[var(--surface2)] border-[var(--line)] hover:border-[var(--ink)]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-extrabold text-sm text-[var(--ink)]">
                          {table.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isLivre ? "bg-[var(--good)]/10 text-[var(--good)]" :
                          isOcupada ? "bg-indigo-600/10 text-indigo-700" :
                          isConta ? "bg-amber-500/10 text-amber-700 animate-pulse" :
                          "bg-purple-500/10 text-purple-700"
                        }`}>
                          {table.status}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs mt-2">
                        {isLivre ? (
                          <span className="text-[11px] text-[var(--muted)]">Capacidade: {table.capacity} pessoas</span>
                        ) : (
                          <>
                            <span className="text-[11px] text-[var(--muted)] block truncate">{table.waiter}</span>
                            <span className="font-mono font-bold text-xs text-[var(--ink)] block">
                              {formatBrl(table.total)}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel da Mesa Selecionada & Comanda (Direita) */}
            <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-sm space-y-4">
              {/* Cabeçalho da Mesa */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[var(--ink)] flex items-center gap-1.5">
                      {selectedTable?.name || `Mesa ${selectedTableNumber}`}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                      selectedTable?.status === "livre" ? "bg-[var(--good)]/10 text-[var(--good)]" :
                      selectedTable?.status === "ocupada" ? "bg-indigo-600/10 text-indigo-700" :
                      selectedTable?.status === "conta" ? "bg-amber-500/10 text-amber-700 animate-pulse" :
                      "bg-purple-500/10 text-purple-700"
                    }`}>
                      {selectedTable?.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    {selectedTable?.customerName && (
                      <span className="font-semibold text-[var(--ink)]">{selectedTable.customerName}</span>
                    )}
                    {selectedTable?.waiter && (
                      <span>· {selectedTable.waiter}</span>
                    )}
                    {selectedTable?.customerCount && (
                      <span>· {selectedTable.customerCount} pessoas</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedTable?.status !== "livre" ? (
                    <>
                      <button
                        onClick={() => setIsEditTableModalOpen(true)}
                        className="px-2.5 py-1.5 bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Editar dados da mesa (nome, clientes, garçom, status, observações)"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => saveTableMutation.mutate({ tableNumber: selectedTableNumber })}
                        disabled={saveTableMutation.isPending}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Salvar alterações da mesa e sincronizar no servidor"
                      >
                        <Save className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{saveTableMutation.isPending ? "Salvando..." : "Salvar"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsOpeningTableModal(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Abrir Mesa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback de salvamento */}
              {tableSavedFeedback && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Comanda sincronizada com sucesso
                  </span>
                  <span className="font-mono text-[10px]">{tableSavedFeedback}</span>
                </div>
              )}

              {/* Observações da Mesa */}
              {selectedTable?.notes && (
                <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <span className="font-bold text-[10px] uppercase text-amber-700 block">Nota da Mesa:</span>
                  {selectedTable.notes}
                </div>
              )}

              {/* Comanda da Mesa */}
              {selectedTable?.status !== "livre" ? (
                <div className="space-y-3.5">
                  {/* Botões de Ação em Destaque: Incluir Pratos e Dividir Conta */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsAddItemModalOpen(true)}
                      className="py-2.5 px-3 bg-[var(--salmon)] hover:bg-[#d4532e] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Incluir Pratos</span>
                    </button>

                    <button
                      onClick={() => setIsSplitBillModalOpen(true)}
                      className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Dividir Conta</span>
                    </button>
                  </div>

                  {/* Barra de Ações Rápidas Secundárias */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs">
                    <button
                      onClick={() => setIsJoinTableModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--line)]/50 border border-[var(--line)] rounded-lg font-semibold text-[11px] text-[var(--ink)] cursor-pointer"
                      title="Unir comandas com outra mesa"
                    >
                      <GitMerge className="w-3 h-3 text-purple-600" />
                      <span>Juntar</span>
                    </button>

                    <button
                      onClick={() => setIsTransferTableModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--line)]/50 border border-[var(--line)] rounded-lg font-semibold text-[11px] text-[var(--ink)] cursor-pointer"
                      title="Mudar clientes para outra mesa"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                      <span>Transferir</span>
                    </button>

                    <button
                      onClick={() => {
                        setImpressaoPayload({
                          tipoComanda: "pre_conta",
                          mesa: selectedTableNumber,
                          garcom: selectedTable?.waiter || "Salão",
                          itens: selectedTable?.orderItems?.map(i => ({ nome: i.itemName, q: i.quantity, preco: i.unitPrice })) || [],
                          subtotal: selectedTable?.subtotal || 0,
                          taxaServico: serviceFeeEnabled ? (selectedTable?.subtotal || 0) * 0.1 : 0,
                          total: (selectedTable?.subtotal || 0) * (serviceFeeEnabled ? 1.1 : 1.0) + (couvertPerPerson * (selectedTable?.customerCount || 2))
                        });
                        setIsImpressaoModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 rounded-lg font-semibold text-[11px] cursor-pointer ml-auto"
                      title="Imprimir cupom de conferência antes do fechamento"
                    >
                      <Printer className="w-3 h-3 text-amber-600" />
                      <span>Pré-Conta</span>
                    </button>

                    <button
                      onClick={() => setIsTrilhaAuditoriaModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--line)]/50 border border-[var(--line)] rounded-lg font-semibold text-[11px] text-[var(--ink)] cursor-pointer"
                      title="Auditoria desta mesa"
                    >
                      <FileText className="w-3 h-3 text-emerald-600" />
                      <span>Auditoria</span>
                    </button>
                  </div>

                  {/* Lista de Itens Lançados */}
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
                    <span className="font-bold text-[var(--ink)]">
                      Pratos Lançados ({selectedTable?.orderItems?.filter(i => i.status !== "cancelado").length || 0}):
                    </span>
                    <span>Praça & Totais</span>
                  </div>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {selectedTable?.orderItems?.filter(i => i.status !== "cancelado").map((it, idx) => (
                      <div 
                        key={it.id || idx} 
                        className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] hover:border-neutral-300 text-xs space-y-1.5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[var(--ink)]">{it.quantity}x {it.itemName}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-neutral-200 text-neutral-800">
                                {it.station}
                              </span>
                            </div>
                            {it.adicionais && it.adicionais.length > 0 && (
                              <div className="text-[10px] text-amber-700 mt-0.5">
                                + {it.adicionais.map((a: any) => a.nome).join(", ")}
                              </div>
                            )}
                            {it.observacoes && (
                              <div className="text-[10px] text-indigo-700 italic mt-0.5">
                                Obs: {it.observacoes}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-extrabold text-xs text-[var(--ink)] block">
                              {formatBrl(it.quantity * it.unitPrice)}
                            </span>
                            <span className="text-[10px] text-[var(--muted)] font-mono">
                              {formatBrl(it.unitPrice)} un
                            </span>
                          </div>
                        </div>

                        {/* Controles de Ação do Item */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-[var(--line)]/60 text-[11px]">
                          {/* Botões Rápidos de Quantidade */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (it.quantity > 1) {
                                  updateTableItemQuickMutation.mutate({
                                    tableNumber: selectedTableNumber,
                                    itemId: it.id || it.itemName,
                                    quantity: it.quantity - 1,
                                    operator: "Frente de Caixa"
                                  });
                                } else {
                                  setSelectedItemToEdit(it);
                                  setIsEditItemModalOpen(true);
                                }
                              }}
                              className="w-5 h-5 rounded bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] flex items-center justify-center font-bold text-neutral-700 cursor-pointer"
                              title="Diminuir quantidade"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold font-mono">{it.quantity}</span>
                            <button
                              onClick={() => {
                                updateTableItemQuickMutation.mutate({
                                  tableNumber: selectedTableNumber,
                                  itemId: it.id || it.itemName,
                                  quantity: it.quantity + 1,
                                  operator: "Frente de Caixa"
                                });
                              }}
                              className="w-5 h-5 rounded bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] flex items-center justify-center font-bold text-neutral-700 cursor-pointer"
                              title="Aumentar quantidade"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedItemToEdit(it);
                                setIsEditItemModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] font-bold text-indigo-700 flex items-center gap-1 cursor-pointer"
                              title="Editar observações, valor unitário ou excluir"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Corrigir</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedItemIndexToTransfer(idx);
                                setIsTransferItemModalOpen(true);
                              }}
                              className="p-1 hover:bg-[var(--line)] rounded text-[var(--muted)] hover:text-blue-600 cursor-pointer"
                              title="Transferir para outra mesa"
                            >
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!selectedTable?.orderItems || selectedTable.orderItems.length === 0) && (
                      <div className="py-6 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-xl">
                        Nenhum prato lançado nesta mesa ainda.<br/>
                        Clique em <strong>+ Incluir Pratos</strong> acima para abrir o cardápio.
                      </div>
                    )}
                  </div>

                  {/* Subtotal, Taxas e Totais */}
                  <div className="pt-2 border-t border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)]">Subtotal Itens:</span>
                      <span className="font-mono font-bold">{formatBrl(selectedTable?.subtotal || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                      <button
                        onClick={() => setServiceFeeEnabled(!serviceFeeEnabled)}
                        className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 cursor-pointer"
                      >
                        {serviceFeeEnabled ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-[var(--muted)]" />
                        )}
                        <span>Taxa de Serviço Garçom (10%)</span>
                      </button>
                      <span className="font-mono font-bold">
                        {serviceFeeEnabled ? formatBrl((selectedTable?.subtotal || 0) * 0.1) : "R$ 0,00"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
                      <div>
                        <span className="text-sm font-extrabold text-[var(--ink)] block">Total Final:</span>
                        <span className="text-[10px] text-[var(--muted)]">
                          {selectedTable?.customerCount ? `${formatBrl((selectedTable?.total || 0) / selectedTable.customerCount)} por pessoa (${selectedTable.customerCount}x)` : ""}
                        </span>
                      </div>
                      <span className="text-xl font-black font-mono text-[var(--salmon)]">
                        {formatBrl(selectedTable?.total || 0)}
                      </span>
                    </div>

                    {/* Botões de Ação Primária do PDV */}
                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={() => setIsSplitBillModalOpen(true)}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>Dividir a Conta (Split Bill & Pagamento Integrado)</span>
                      </button>

                      <button
                        onClick={() => {
                          setFiscalModalPayload({
                            total: selectedTable?.total || 0,
                            payments: [{ method: "pix", amount: selectedTable?.total || 0 }]
                          });
                          setIsFiscalNfceModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Emitir Nota Fiscal com CPF (NFC-e SEFAZ-MT)</span>
                      </button>

                      <button
                        onClick={() => setIsFechamentoMesaModalOpen(true)}
                        className="w-full py-1.5 bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Fechar Comanda Rápida / Desconto Gerencial</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[var(--muted)] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--muted)]">
                    <UtensilsCrossed className="w-6 h-6 stroke-1" />
                  </div>
                  <p className="italic">
                    Mesa livre no momento.<br/>
                    Clique no botão <strong>Abrir Mesa</strong> acima para iniciar atendimento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 3: GESTÃO DE TURNO DO CAIXA & CONFERÊNCIA CEGA       */}
      {/* ========================================================= */}
      {activeTab === "gestao_caixa" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Fundo de Troco Inicial</span>
              <div className="text-2xl font-extrabold text-[var(--ink)] font-mono mt-1">
                {formatBrl(cashRegister?.initialCash || 200)}
              </div>
              <span className="text-xs text-[var(--muted)]">Abertura às 16:30</span>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Dinheiro Físico na Gaveta</span>
              <div className="text-2xl font-extrabold text-[var(--good)] font-mono mt-1">
                {formatBrl(((cashRegister?.initialCash || 200) + (cashRegister?.totalsByMethod?.dinheiro || 340)) - (cashRegister?.cashOut || 150))}
              </div>
              <span className="text-xs text-[var(--good)] font-medium">Saldo auditado em tempo real</span>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Pix Sicredi &amp; Sicoob (0% Taxa)</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
                {formatBrl(cashRegister?.totalsByMethod?.pix || 2120)}
              </div>
              <span className="text-xs text-[var(--muted)]">Liquidado na conta da cooperativa</span>
            </div>

            <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Cartões &amp; Apple Pay</span>
              <div className="text-2xl font-extrabold text-[var(--ink)] font-mono mt-1">
                {formatBrl((cashRegister?.totalsByMethod?.credito || 2350) + (cashRegister?.totalsByMethod?.debito || 1130) + (cashRegister?.totalsByMethod?.apple_pay || 480))}
              </div>
              <span className="text-xs text-[var(--muted)]">Crédito, Débito e Contactless</span>
            </div>
          </div>

          {/* Ações de Sangria, Suprimento e Fechamento */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSangriaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Registrar Sangria (Retirada)</span>
            </button>

            <button
              onClick={() => setIsSuprimentoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Registrar Suprimento (Entrada de Troco)</span>
            </button>

            <button
              onClick={() => setIsRateioGorjetasModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Rateio oficial da Taxa de Serviço 10% (Lei 13.419/17)"
            >
              <Scale className="w-4 h-4" />
              <span>Rateio Gorjetas (10%)</span>
            </button>

            <button
              onClick={() => setIsAcertoMotoboyModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Bike className="w-4 h-4" />
              <span>Acerto de Motoboys do Turno</span>
            </button>

            <button
              onClick={() => setIsFechamentoCegoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs ml-auto"
            >
              <Lock className="w-4 h-4" />
              <span>Fechamento Cego de Caixa</span>
            </button>
          </div>

          {/* Histórico de Movimentações do Turno */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--salmon)]" />
              Livro Caixa do Turno · Movimentações &amp; Auditoria
            </h3>

            <div className="overflow-x-auto border border-[var(--line)] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface2)] border-b border-[var(--line)] text-[var(--muted)] font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Horário</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Motivo / Descrição</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {cashRegister?.movements?.map(mov => (
                    <tr key={mov.id} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="py-2 px-3 font-mono text-[11px] text-[var(--muted)]">
                        {new Date(mov.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          mov.type === "sangria" ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[var(--ink)] font-medium">
                        {mov.reason}
                      </td>
                      <td className="py-2 px-3 text-[var(--muted)]">
                        {mov.operator}
                      </td>
                      <td className={`py-2 px-3 font-mono font-bold text-right ${
                        mov.type === "sangria" ? "text-red-600" : "text-[var(--good)]"
                      }`}>
                        {mov.type === "sangria" ? `-${formatBrl(mov.amount)}` : `+${formatBrl(mov.amount)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL ABRIR MESA ===================== */}
      {isOpeningTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--ink)]">Abrir Mesa {selectedTableNumber}</h3>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[var(--muted)] block mb-1">Número de Pessoas:</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newTableGuests}
                  onChange={e => setNewTableGuests(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded"
                />
              </div>

              <div>
                <label className="text-[var(--muted)] block mb-1">Garçom Responsável:</label>
                <select
                  value={newTableWaiter}
                  onChange={e => setNewTableWaiter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded"
                >
                  <option value="Matheus (Salão)">Matheus (Salão)</option>
                  <option value="Bruna (Salão)">Bruna (Salão)</option>
                  <option value="Laura (Salão)">Laura (Salão)</option>
                  <option value="Felipe (Salão)">Felipe (Salão)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsOpeningTableModal(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => openTableMutation.mutate({ tableNumber: selectedTableNumber, customerCount: newTableGuests, waiter: newTableWaiter })}
                className="flex-1 py-1.5 rounded bg-indigo-600 text-white text-xs font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL SANGRIA ===================== */}
      {isSangriaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4" /> Registrar Sangria de Caixa
            </h3>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[var(--muted)] block mb-1">Valor da Retirada (R$):</label>
                <input
                  type="number"
                  value={movementAmount}
                  onChange={e => setMovementAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[var(--muted)] block mb-1">Motivo da Sangria:</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  placeholder="Ex: Compra emergencial de gelo / Recolhimento cofre"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSangriaModal(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => addMovementMutation.mutate({ type: "sangria", amount: movementAmount, reason: movementReason || "Sangria" })}
                className="flex-1 py-1.5 rounded bg-red-600 text-white text-xs font-bold"
              >
                Confirmar Sangria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL SUPRIMENTO ===================== */}
      {isSuprimentoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
              <ArrowUpCircle className="w-4 h-4" /> Registrar Suprimento (Entrada de Troco)
            </h3>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[var(--muted)] block mb-1">Valor do Suprimento (R$):</label>
                <input
                  type="number"
                  value={movementAmount}
                  onChange={e => setMovementAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[var(--muted)] block mb-1">Motivo do Suprimento:</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  placeholder="Ex: Moedas e notas de troco trazidas do banco"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSuprimentoModal(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => addMovementMutation.mutate({ type: "suprimento", amount: movementAmount, reason: movementReason || "Suprimento de Troco" })}
                className="flex-1 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold"
              >
                Confirmar Entrada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL FECHAMENTO CEGO ===================== */}
      {isFechamentoCegoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Fechamento Cego de Caixa
              </h3>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Digite o valor exato contado fisicamente na gaveta de dinheiro. O sistema fará a conciliação cega e apontará se houve quebra de caixa.
              </p>
            </div>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[var(--muted)] block mb-1">Operador do Caixa:</label>
                <input
                  type="text"
                  value={cashOperator}
                  onChange={e => setCashOperator(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-xs"
                />
              </div>

              <div>
                <label className="text-[var(--muted)] block mb-1">Total em Dinheiro Contado (R$):</label>
                <input
                  type="number"
                  value={countedCashInput}
                  onChange={e => setCountedCashInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-[var(--muted)] block mb-1">Observações do Operador:</label>
                <input
                  type="text"
                  value={fechamentoNotes}
                  onChange={e => setFechamentoNotes(e.target.value)}
                  placeholder="Ex: Turno encerrado sem divergências"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsFechamentoCegoModal(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => closeCashMutation.mutate({ countedCash: countedCashInput, operator: cashOperator, notes: fechamentoNotes })}
                className="flex-1 py-1.5 rounded bg-[var(--ink)] text-white text-xs font-bold"
              >
                Concluir Fechamento
              </button>
            </div>
          </div>
        </div>
      )}

            {/* ========================================================= */}
      {/* MODO 4: DRE DO TURNO EM TEMPO REAL & CMV REAL              */}
      {/* ========================================================= */}
      {activeTab === "dre_turno" && (
        <div className="mt-4">
          <DreTurnoView />
        </div>
      )}

      {/* ===================== MODAL JUNTAR MESAS ===================== */}
      {isJoinTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <GitMerge className="w-4 h-4 text-purple-600" />
              Juntar Mesa {selectedTableNumber} com outra Mesa
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Todos os itens e clientes da Mesa {selectedTableNumber} serão consolidados na mesa de destino selecionada.
            </p>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">Mesa de Destino:</label>
              <select
                value={targetJoinTableNumber}
                onChange={e => setTargetJoinTableNumber(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-semibold"
              >
                {tables
                  .filter(t => t.tableNumber !== selectedTableNumber)
                  .map(t => (
                    <option key={t.tableNumber} value={t.tableNumber}>
                      {t.name} ({t.status.toUpperCase()} - {t.orderItems?.length || 0} itens)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsJoinTableModalOpen(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => joinTablesMutation.mutate({ sourceTableNumber: selectedTableNumber, targetTableNumber: targetJoinTableNumber })}
                disabled={joinTablesMutation.isPending}
                className="flex-1 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                {joinTablesMutation.isPending ? "Unificando..." : "Confirmar Junção"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL TRANSFERIR MESA ===================== */}
      {isTransferTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Transferir Mesa {selectedTableNumber}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Mudar a comanda integral da Mesa {selectedTableNumber} para uma nova mesa ou Tatame VIP.
            </p>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">Transferir Para:</label>
              <select
                value={targetTransferTableNumber}
                onChange={e => setTargetTransferTableNumber(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-semibold"
              >
                {tables
                  .filter(t => t.tableNumber !== selectedTableNumber && t.status === "livre")
                  .map(t => (
                    <option key={t.tableNumber} value={t.tableNumber}>
                      {t.name} (LIVRE - Cap: {t.capacity} pessoas)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsTransferTableModalOpen(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => transferTableMutation.mutate({ fromTableNumber: selectedTableNumber, toTableNumber: targetTransferTableNumber })}
                disabled={transferTableMutation.isPending}
                className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                {transferTableMutation.isPending ? "Transferindo..." : "Confirmar Mudança"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL TRANSFERIR ITEM ===================== */}
      {isTransferItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <MoveRight className="w-4 h-4 text-amber-600" />
              Mover Prato para Outra Mesa
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Item selecionado: <strong>{selectedTable?.orderItems?.[selectedItemIndexToTransfer]?.itemName}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] block mb-1">Mesa Destino:</label>
              <select
                value={targetItemTableNumber}
                onChange={e => setTargetItemTableNumber(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-semibold"
              >
                {tables
                  .filter(t => t.tableNumber !== selectedTableNumber)
                  .map(t => (
                    <option key={t.tableNumber} value={t.tableNumber}>
                      {t.name} ({t.status.toUpperCase()})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsTransferItemModalOpen(false)}
                className="flex-1 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => transferTableItemMutation.mutate({
                  fromTableNumber: selectedTableNumber,
                  toTableNumber: targetItemTableNumber,
                  itemIndex: selectedItemIndexToTransfer
                })}
                disabled={transferTableItemMutation.isPending}
                className="flex-1 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                {transferTableItemMutation.isPending ? "Movendo..." : "Mover Prato"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAIS AVANÇADOS SAIPOS PARITY + ===================== */}
      <ImpressaoTermicaModal
        isOpen={isImpressaoModalOpen}
        empresa={activeCompany}
        onClose={() => setIsImpressaoModalOpen(false)}
        tipoComanda={impressaoPayload.tipoComanda}
        mesa={impressaoPayload.mesa}
        garcom={impressaoPayload.garcom}
        itens={impressaoPayload.itens}
        subtotal={impressaoPayload.subtotal}
        taxaServico={impressaoPayload.taxaServico}
        total={impressaoPayload.total}
      />

      <AcertoMotoboyModal
        isOpen={isAcertoMotoboyModalOpen}
        onClose={() => setIsAcertoMotoboyModalOpen(false)}
        onSettled={() => {
          cashRegisterQuery.refetch();
        }}
      />

      <GestaoCardapioIfoodModal
        isOpen={isIfoodCardapioModalOpen}
        onClose={() => setIsIfoodCardapioModalOpen(false)}
      />

      <GestaoBairrosFreteModal
        isOpen={isBairrosFreteModalOpen}
        onClose={() => setIsBairrosFreteModalOpen(false)}
      />

      <AuditoriaCancelamentosModal
        isOpen={isAuditoriaModalOpen}
        onClose={() => setIsAuditoriaModalOpen(false)}
      />

      <RateioGorjetasModal
        isOpen={isRateioGorjetasModalOpen}
        onClose={() => setIsRateioGorjetasModalOpen(false)}
      />

      <GestaoCuponsFidelidadeModal
        isOpen={isCuponsModalOpen}
        onClose={() => setIsCuponsModalOpen(false)}
        onApplyCoupon={(code, discount) => {
          setAppliedCoupon({ code, discount });
          setIsCuponsModalOpen(false);
        }}
      />

      <FechamentoMesaModal
        isOpen={isFechamentoMesaModalOpen}
        onClose={() => setIsFechamentoMesaModalOpen(false)}
        table={selectedTable}
        onSuccess={() => {
          tablesQuery.refetch();
          cashRegisterQuery.refetch();
        }}
      />

      <TrilhaAuditoriaModal
        isOpen={isTrilhaAuditoriaModalOpen}
        onClose={() => setIsTrilhaAuditoriaModalOpen(false)}
        tableNumber={selectedTable?.status !== "livre" ? selectedTableNumber : undefined}
      />
      <ContingenciaFiscalModal
        isOpen={isContingenciaModalOpen}
        onClose={() => setIsContingenciaModalOpen(false)}
      />

      {/* Novos Modais Avançados de PDV & Mesas */}
      <ModalEditarMesa
        isOpen={isEditTableModalOpen}
        onClose={() => setIsEditTableModalOpen(false)}
        table={selectedTable}
        onSuccess={() => tablesQuery.refetch()}
      />

      <ModalIncluirItemMesa
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        tableNumber={selectedTableNumber}
        tableName={selectedTable?.name || `Mesa ${selectedTableNumber}`}
        onSuccess={() => tablesQuery.refetch()}
      />

      <ModalEditarItemMesa
        isOpen={isEditItemModalOpen}
        onClose={() => {
          setIsEditItemModalOpen(false);
          setSelectedItemToEdit(null);
        }}
        tableNumber={selectedTableNumber}
        item={selectedItemToEdit}
        onSuccess={() => tablesQuery.refetch()}
      />

      <ModalSplitBillPdv
        isOpen={isSplitBillModalOpen}
        onClose={() => setIsSplitBillModalOpen(false)}
        table={selectedTable}
        onSuccess={() => tablesQuery.refetch()}
        onOpenFiscalModal={(dados) => {
          setFiscalModalPayload(dados);
          setIsFiscalNfceModalOpen(true);
        }}
      />

      <ModalEmissaoFiscalPdv
        isOpen={isFiscalNfceModalOpen}
        empresa={activeCompany}
        onClose={() => setIsFiscalNfceModalOpen(false)}
        table={selectedTable}
        totalAmount={fiscalModalPayload?.total || selectedTable?.total || 0}
        payments={fiscalModalPayload?.payments}
        onSuccess={() => tablesQuery.refetch()}
      />

      <ModalInstalarPdv
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* MODAL DE CADASTRO RÁPIDO DE CLIENTE (COM FLAG VIP & FRETE GRÁTIS) */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black text-[var(--ink)]">
                  Cadastrar Cliente no Zuma CRM
                </h4>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCustomerMutation.mutate({
                  name: newCustForm.name,
                  phone: newCustForm.phone,
                  neighborhood: newCustForm.neighborhood,
                  address: newCustForm.address,
                  cep: newCustForm.cep,
                  cidade: newCustForm.cidade,
                  isVip: newCustForm.isVip,
                  notes: newCustForm.notes
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newCustForm.name}
                  onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })}
                  placeholder="Ex: Dra. Juliana Albuquerque"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Telefone WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustForm.phone}
                    onChange={e => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    placeholder="(65) 99812-0000"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Bairro / Região MT
                  </label>
                  <input
                    type="text"
                    value={newCustForm.neighborhood}
                    onChange={e => setNewCustForm({ ...newCustForm, neighborhood: e.target.value })}
                    placeholder="Centro, Jd Europa..."
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={newCustForm.cep}
                    onChange={e => setNewCustForm({ ...newCustForm, cep: e.target.value })}
                    placeholder="78300-000"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={newCustForm.cidade}
                    onChange={e => setNewCustForm({ ...newCustForm, cidade: e.target.value })}
                    placeholder="Tangará da Serra"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Endereço Completo (Rua / Número / Apto)
                </label>
                <input
                  type="text"
                  value={newCustForm.address}
                  onChange={e => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  placeholder="Av. Brasil, 120 - Apto 402"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                />
              </div>

              {/* CHECKBOX CLIENTE VIP (FRETE GRÁTIS VITALÍCIO) */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-black text-amber-900 dark:text-amber-200 text-xs block">
                      Cliente VIP Zuma
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      Garante Entrega 100% Grátis em todos os pedidos
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={newCustForm.isVip}
                  onChange={e => setNewCustForm({ ...newCustForm, isVip: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createCustomerMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {createCustomerMutation.isPending ? "Cadastrando..." : "Salvar & Vincular ao Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};
