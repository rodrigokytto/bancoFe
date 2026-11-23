import React, { useState, useEffect, useMemo, useRef } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl, MENU } from "../../../shared/zumaData";
import { kdsAudio } from "../lib/kdsAudio";
import { orderEventBus, MesaDishReadyEvent, TableClosedEvent } from "../lib/orderEvents";
import { ModalPagamentoMesa } from "../components/mesas/ModalPagamentoMesa";
import { ModalPreContaMesa } from "../components/mesas/ModalPreContaMesa";
import { ShieldCheck, Printer, FileText } from "lucide-react";
import {
  UtensilsCrossed,
  Bell,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  Users,
  Receipt,
  Download,
  Smartphone,
  Maximize2,
  QrCode,
  Volume2,
  VolumeX,
  CreditCard,
  Sparkles,
  Clock,
  ChevronRight,
  Share2,
  ArrowRightLeft,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ChefHat,
  Flame,
  Wine,
  Check,
  Percent,
  Copy,
  Send,
  Eye,
  Filter,
  Layers,
  TrendingUp,
  Award,
  CircleDot,
  Moon,
  Sun,
  X,
  Coffee,
  Beer
} from "lucide-react";
import { toast } from "sonner";
import { ModalInstalarPdv } from "../components/pdv/ModalInstalarPdv";
import { useOfflineSync } from "../lib/offlineSyncEngine";
import { WifiOff, Cloud, RefreshCw } from "lucide-react";

// ==============================================================================
// TIPOS E NORMALIZAÇÃO DE BUSCA
// ==============================================================================

export interface CardapioItemRapido {
  id: string;
  nome: string;
  categoria: "sushi" | "especial" | "quente" | "entrada" | "bebida" | "sobremesa";
  categoriaOrigem: string;
  categoriaLabel: string;
  preco: number;
  praca: "sushibar" | "wok" | "fritadeira" | "bar";
  tempoMedioMin: number;
  descricao: string;
  adicionaisDisponiveis?: Array<{ nome: string; preco: number }>;
}

export function normalizeSearchText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ==============================================================================
// CATÁLOGO OFICIAL 151+ ITENS ZUMA TANGARÁ DA SERRA
// ==============================================================================

export const CARDAPIO_ZUMA_COMPLETO: CardapioItemRapido[] = (() => {
  const items: CardapioItemRapido[] = [];
  let counter = 1;

  for (const [cat, lista] of Object.entries(MENU)) {
    for (const [nome, preco] of lista) {
      let praca: "sushibar" | "wok" | "fritadeira" | "bar" = "sushibar";
      let categoria: "sushi" | "especial" | "quente" | "entrada" | "bebida" | "sobremesa" = "sushi";
      let tempoMedioMin = 10;
      let descricao = `Item oficial do Zuma Tangará da Serra (${cat})`;
      let adicionaisDisponiveis: Array<{ nome: string; preco: number }> | undefined = undefined;

      if (cat === "Bebidas") {
        praca = "bar";
        categoria = "bebida";
        tempoMedioMin = 2;
        descricao = /cerveja|heineken|kirin|stella|corona|eisenbahn/i.test(nome)
          ? "Cerveja servida trincando no copo caldereta gelado"
          : /saqu[eê]|caipi|drink|gin|mule|spritz/i.test(nome)
          ? "Coquetelaria e destilados orientais artesanais do Zuma"
          : /suco|limonada/i.test(nome)
          ? "Suco natural e refrescante batido na hora"
          : /soda/i.test(nome)
          ? "Soda italiana artesanal com xarope nobre e água gaseificada"
          : /energ[eé]tico|red bull|monster/i.test(nome)
          ? "Bebida energética servida gelada"
          : "Refrigerante lata gelado acompanhado de copo com gelo e limão";

        if (/saqu[eê]|drink|gin|caipi|mule/i.test(nome)) {
          adicionaisDisponiveis = [
            { nome: "Dose Extra de Destilado", preco: 12.0 },
            { nome: "Borda com Flor de Sal", preco: 0.0 },
            { nome: "Gelo e Limão Siciliano", preco: 0.0 },
          ];
        } else {
          adicionaisDisponiveis = [
            { nome: "Copo com Gelo e Limão", preco: 0.0 },
            { nome: "Sem Gelo", preco: 0.0 },
          ];
        }
      } else if (cat === "Pratos quentes" || cat === "Poke") {
        praca = "wok";
        categoria = "quente";
        tempoMedioMin = 14;
        descricao = `Prato quente preparado na hora no wok oriental com ingredientes frescos`;
        adicionaisDisponiveis = [
          { nome: "Carne Mignon Extra", preco: 14.0 },
          { nome: "Mix de Shimeji Extra", preco: 12.0 },
          { nome: "Legumes Salteados Extras", preco: 6.0 },
        ];
      } else if (cat === "Hot rolls" || cat === "Porções" || /furai|crocante|empanado/i.test(nome)) {
        praca = "fritadeira";
        categoria = "quente";
        tempoMedioMin = 10;
        descricao = `Fritura dourada e crocante na farinha panko japonesa`;
        adicionaisDisponiveis = [
          { nome: "Crispy de Couve Frita Extra", preco: 4.0 },
          { nome: "Molho Tarê Artesanal Extra", preco: 4.0 },
          { nome: "Cream Cheese Philadelphia Extra", preco: 6.0 },
        ];
      } else if (cat === "Sobremesas") {
        praca = /hot|rolinho/i.test(nome) ? "fritadeira" : "sushibar";
        categoria = "sobremesa";
        tempoMedioMin = 8;
        descricao = `Sobremesa exclusiva com toque doce oriental do Zuma`;
        adicionaisDisponiveis = [
          { nome: "Bola de Sorvete de Creme Extra", preco: 8.0 },
          { nome: "Calda de Nutella Extra", preco: 5.0 },
        ];
      } else if (cat === "Entradas") {
        categoria = "entrada";
        praca = /guioza|gohan/i.test(nome) ? "wok" : /furai|crocante|trouxinha|rolinho/i.test(nome) ? "fritadeira" : "sushibar";
        tempoMedioMin = 7;
        descricao = `Aperitivo e entrada da tradicional culinária japonesa`;
        adicionaisDisponiveis = [
          { nome: "Molho Ponzu Cítrico Extra", preco: 5.0 },
          { nome: "Wasabi Artesanal Extra", preco: 5.0 },
        ];
      } else if (cat === "Combinados") {
        categoria = "sushi";
        tempoMedioMin = /56|68|106/i.test(nome) ? 22 : 14;
        descricao = `Combinado especial selecionado com os melhores cortes do dia`;
        adicionaisDisponiveis = [
          { nome: "Wasabi Artesanal Extra", preco: 5.0 },
          { nome: "Gengibre Gari Extra", preco: 6.0 },
          { nome: "Molho Tarê Artesanal", preco: 4.0 },
          { nome: "Cream Cheese Philadelphia Extra", preco: 6.0 },
        ];
      } else {
        categoria = /trufado|flambado|especial/i.test(nome) ? "especial" : "sushi";
        praca = "sushibar";
        tempoMedioMin = /sashimi/i.test(nome) ? 6 : 9;
        descricao = `Serralharia japonesa com salmão fresco, shari temperado e alga nori`;
        adicionaisDisponiveis = [
          { nome: "Azeite Trufado & Flor de Sal", preco: 8.0 },
          { nome: "Wasabi Artesanal Extra", preco: 5.0 },
          { nome: "Gengibre Gari Extra", preco: 6.0 },
          { nome: "Molho Tarê Artesanal", preco: 4.0 },
          { nome: "Cream Cheese Philadelphia Extra", preco: 6.0 },
        ];
      }

      items.push({
        id: `ZUMA_${String(counter++).padStart(3, "0")}`,
        nome,
        categoria,
        categoriaOrigem: cat,
        categoriaLabel: cat,
        preco,
        praca,
        tempoMedioMin,
        descricao,
        adicionaisDisponiveis,
      });
    }
  }

  return items;
})();

const OBSERVACOES_RAPIDAS_CHIPS = [
  "Sem cebolinha",
  "Sem wasabi",
  "Tarê à parte",
  "Sem gergelim",
  "Pouco shoyu",
  "Bem passado",
  "Ponto selado",
  "Copo com gelo e limão",
  "Alérgico a crustáceos",
  "Caprichar no gengibre",
];

interface PratoProntoItem {
  id: string;
  tableNumber: number;
  orderNumber: number;
  items: string[];
  station: string;
  waiter?: string;
  timestamp: string;
  entregue?: boolean;
}

export const AppGarcom: React.FC = () => {
  // Navegação Interna por Abas Segmentadas
  const [activeTab, setActiveTab] = useState<"mesas" | "comanda" | "pass" | "turno">("mesas");
  const [setorAtivo, setSetorAtivo] = useState<string>("todos");
  const [categoriaCardapio, setCategoriaCardapio] = useState<string>("todos");
  const [somAtivo, setSomAtivo] = useState(true);
  const [modoEscuroOled, setModoEscuroOled] = useState(false);
  const [modalInstalar, setModalInstalar] = useState(false);
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Estados do Garçom
  const [selectedTableNum, setSelectedTableNum] = useState<number>(3);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalPreConta, setModalPreConta] = useState(false);
  const [reciboVisualizacao, setReciboVisualizacao] = useState<{
    id: string;
    tableNumber: number;
    total: number;
    paymentMethod: string;
    operator: string;
    nfcNumber: string;
    splitCount: number;
    timestamp: string;
    hora: string;
    itensQtd: number;
    gorjeta10: number;
  } | null>(null);

  const [mesasBaixadasTurno, setMesasBaixadasTurno] = useState<Array<{
    id: string;
    tableNumber: number;
    total: number;
    paymentMethod: string;
    operator: string;
    nfcNumber: string;
    splitCount: number;
    timestamp: string;
    hora: string;
    itensQtd: number;
    gorjeta10: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem("zuma_garcom_mesas_baixadas");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Erro ao ler mesas baixadas:", e);
    }
    return [
      {
        id: "fc_demo_1",
        tableNumber: 12,
        total: 284.50,
        paymentMethod: "Sicredi Pix Direto MT",
        operator: "Matheus (Salão)",
        nfcNumber: "6240",
        splitCount: 2,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hora: "19:15",
        itensQtd: 6,
        gorjeta10: 28.45,
      },
      {
        id: "fc_demo_2",
        tableNumber: 7,
        total: 168.00,
        paymentMethod: "Cartão Débito (Stone P2)",
        operator: "Matheus (Salão)",
        nfcNumber: "6238",
        splitCount: 1,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        hora: "18:22",
        itensQtd: 3,
        gorjeta10: 16.80,
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("zuma_garcom_mesas_baixadas", JSON.stringify(mesasBaixadasTurno));
    } catch (e) {
      console.warn("Erro ao salvar histórico de mesas baixadas:", e);
    }
  }, [mesasBaixadasTurno]);
  const [modalComanda, setModalComanda] = useState(false);
  const [modalAbrirMesa, setModalAbrirMesa] = useState(false);
  const [modalDividirConta, setModalDividirConta] = useState(false);
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalQrCodeMesa, setModalQrCodeMesa] = useState(false);
  const [modalItemAdicional, setModalItemAdicional] = useState<CardapioItemRapido | null>(null);

  // Inputs dos Modais
  const [abrirQtdPessoas, setAbrirQtdPessoas] = useState<number>(2);
  const [abrirNomeCliente, setAbrirNomeCliente] = useState<string>("Cliente Salão");
  const [abrirNomeGarcom, setAbrirNomeGarcom] = useState<string>("Matheus (Salão)");
  const [buscaCardapio, setBuscaCardapio] = useState("");
  const [observacaoItem, setObservacaoItem] = useState("");
  const [qtdItemLancamento, setQtdItemLancamento] = useState<number>(1);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<Array<{ nome: string; preco: number }>>([]);
  const [dividirPessoas, setDividirPessoas] = useState<number>(2);
  const [incluirGorjeta10, setIncluirGorjeta10] = useState<boolean>(true);
  const [mesaDestinoTransferencia, setMesaDestinoTransferencia] = useState<number>(4);

  // Fila de Pratos Prontos no Pass da Cozinha (sincronizados com KDS)
  const [pratosProntosPass, setPratosProntosPass] = useState<PratoProntoItem[]>([
    {
      id: "pass_01",
      tableNumber: 4,
      orderNumber: 1042,
      items: ["Hot Roll Especial Trufado (8 Pçs)", "Guioza Suína (6 Pçs)"],
      station: "Fritadeira / Wok",
      waiter: "Bruna (Salão)",
      timestamp: "19:42",
      entregue: false,
    },
    {
      id: "pass_02",
      tableNumber: 9,
      orderNumber: 1045,
      items: ["Barca Especial 50 Pçs"],
      station: "Sushibar",
      waiter: "Matheus (Salão)",
      timestamp: "19:46",
      entregue: false,
    },
  ]);

  // Queries e Mutations tRPC reais
  const utils = trpc.useUtils();
  const tablesQuery = trpc.zuma.listTables.useQuery(undefined, { refetchInterval: 3000 });

  const openTableMutation = trpc.zuma.openTable.useMutation({
    onSuccess: (data) => {
      kdsAudio.playReadyChime();
      toast.success(`Mesa ${data.tableNumber} aberta com sucesso!`, { icon: "🥢" });
      setModalAbrirMesa(false);
      setSelectedTableNum(data.tableNumber);
      setModalComanda(true);
      tablesQuery.refetch();
    },
    onError: (err) => {
      kdsAudio.playSlaWarningChime();
      toast.error(`Erro ao abrir mesa: ${err.message}`);
    },
  });

  const addTableItemMutation = trpc.zuma.addTableItem.useMutation({
    onSuccess: () => {
      kdsAudio.playNewOrderChime();
      toast.success("Item lançado na comanda móvel com sucesso!", { icon: "🍣" });
      setModalItemAdicional(null);
      setObservacaoItem("");
      setQtdItemLancamento(1);
      setAdicionaisSelecionados([]);
      tablesQuery.refetch();
    },
    onError: (err) => {
      kdsAudio.playSlaWarningChime();
      toast.error(`Erro ao lançar item: ${err.message}`);
    },
  });

  const sendTableToKitchenMutation = trpc.zuma.sendTableToKitchen.useMutation({
    onSuccess: (data) => {
      kdsAudio.playReadyChime();
      toast.success(`🚀 Pedido da Mesa ${data.tableNumber} enviado às praças do KDS Cozinha!`, {
        icon: "👨‍🍳",
      });
      orderEventBus.emit({
        orderId: `MESA-${data.tableNumber}-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        channel: "mesa",
        tableNumber: data.tableNumber,
        customerName: mesaAtiva?.customerName || `Mesa ${data.tableNumber}`,
        items: (mesaAtiva?.orderItems || []).map((it) => ({
          name: it.itemName,
          praça: it.station === "sushibar" ? "sushibar" : it.station === "bar" ? "bar" : "quente",
          fireOnDemand: false,
          prepMinutes: 12,
          price: it.unitPrice,
          salmonWeightGrams: 160,
        })),
        totalValue: mesaAtiva?.total || 0,
        status: "novo",
      });
      tablesQuery.refetch();
    },
    onError: (err) => {
      kdsAudio.playSlaWarningChime();
      toast.error(`Erro ao despachar para cozinha: ${err.message}`);
    },
  });

  const cancelTableItemMutation = trpc.zuma.cancelTableItem.useMutation({
    onSuccess: (data: any, variables: any) => {
      kdsAudio.playCancellationAlertChime();

      // Emitir evento para Cozinha KDS (alerta sonoro e visual imediato cross-tab)
      orderEventBus.emitItemCancelled({
        tableNumber: data.tableNumber,
        itemIndex: 0,
        itemName: data.item?.itemName || variables.itemId,
        itemPrice: data.item?.unitPrice || 0,
        cancelledBy: variables.cancelledBy || "Garçom",
        reason: variables.reason,
        reallocatedTo: data.reallocatedTo || null,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      });

      if (data.reallocated && data.reallocatedTo) {
        toast.success(`♻️ Item Cancelado na Mesa ${data.tableNumber}!`, {
          description: `Produção reaproveitada com sucesso para ${data.reallocatedTo.identifier} (Zero Desperdício). Total recalculado para ${formatBrl(data.newTotal)}.`
        });
      } else {
        toast.info(`🛑 Item Cancelado na Mesa ${data.tableNumber}`, {
          description: `Alerta enviado à cozinha para interromper preparo imediato. Novo total: ${formatBrl(data.newTotal)}.`
        });
      }
      tablesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao cancelar item: ${err.message}`);
    },
  });

  const transferTableMutation = trpc.zuma.transferTable.useMutation({
    onSuccess: (data) => {
      kdsAudio.playReadyChime();
      toast.success(`Mesa ${data.fromTableNumber} transferida integralmente para a Mesa ${data.toTableNumber}!`);
      setModalTransferir(false);
      setSelectedTableNum(data.toTableNumber);
      tablesQuery.refetch();
    },
    onError: (err) => {
      kdsAudio.playSlaWarningChime();
      toast.error(`Erro ao transferir mesa: ${err.message}`);
    },
  });

  const closeTableMutation = trpc.zuma.closeTable.useMutation({
    onSuccess: (data, variables) => {
      kdsAudio.playReadyChime();
      toast.success(
        `Mesa ${String(data.tableNumber).padStart(2, "0")} baixada e liberada com sucesso! Total: ${formatBrl(data.finalTotal)} · NFC-e #${data.nfcNumber} autorizada SEFAZ-MT.`,
        { icon: "✅" }
      );

      // Emite evento no barramento reativo para liberar o PDV e o Salão em tempo real
      orderEventBus.emitTableClosed({
        tableNumber: data.tableNumber,
        total: data.finalTotal,
        paymentMethod: variables.paymentMethod || "Pix Sicredi Direto MT",
        operator: variables.operator || abrirNomeGarcom,
        nfcNumber: String(data.nfcNumber),
        splitCount: variables.splitCount || 1,
        canal: "App do Garçom Móvel",
        timestamp: new Date().toISOString()
      });

      // Atualiza caches do tRPC
      tablesQuery.refetch();
      utils.zuma.listTables.invalidate();
      utils.zuma.getAuditTrail.invalidate();
      utils.zuma.getCashRegister.invalidate();
      utils.zuma.listOrders.invalidate();
      utils.zuma.getFinancialAccounts.invalidate();
      utils.zuma.getContasReceber.invalidate();
      utils.zuma.getExtratoBancario.invalidate();
      utils.zuma.getShiftFinancialDre.invalidate();
      utils.zuma.getFiscalInvoices.invalidate();

      // Grava no histórico local do turno
      const novoFechamento = {
        id: `fc_${Date.now()}_${data.tableNumber}`,
        tableNumber: data.tableNumber,
        total: data.finalTotal,
        paymentMethod: variables.paymentMethod || "Pix Sicredi MT",
        operator: variables.operator || abrirNomeGarcom,
        nfcNumber: String(data.nfcNumber),
        splitCount: variables.splitCount || 1,
        timestamp: new Date().toISOString(),
        hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        itensQtd: mesaAtiva?.orderItems.length || 0,
        gorjeta10: data.finalTotal * 0.1,
      };

      setMesasBaixadasTurno(prev => [novoFechamento, ...prev]);

      setModalPagamento(false);
      setModalComanda(false);
      setSelectedTableNum(null as any);
    },
    onError: (err) => {
      kdsAudio.playSlaWarningChime();
      toast.error(`Erro ao baixar mesa: ${err.message}`);
    }
  });

  // Listener para sincronização cruzada de mesas encerradas
  useEffect(() => {
    const unsub = orderEventBus.subscribeTableClosed(() => {
      tablesQuery.refetch();
    });
    return () => unsub();
  }, [tablesQuery]);

  // Escuta de Pratos Prontos da Cozinha (Cross-tab realtime via orderEvents)
  useEffect(() => {
    const unsub = orderEventBus.subscribeMesaDishReady((dishReady: MesaDishReadyEvent) => {
      kdsAudio.playReadyChime();
      toast.success(
        `🍽️ PRATO PRONTO NO PASS! Mesa ${dishReady.tableNumber} (${dishReady.station}): ${dishReady.items.join(", ")}`,
        { duration: 6000 }
      );
      setPratosProntosPass((prev) => [
        {
          id: `pass_${Date.now()}`,
          tableNumber: dishReady.tableNumber,
          orderNumber: dishReady.orderNumber || 1000 + dishReady.tableNumber,
          items: dishReady.items,
          station: dishReady.station,
          waiter: dishReady.waiter || "Salão",
          timestamp: dishReady.timestamp || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          entregue: false,
        },
        ...prev,
      ]);
    });
    return unsub;
  }, []);

  // Captura do evento de instalação PWA
  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const alternarFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      toast.info("Modo Tela Cheia ativado para operação no salão.");
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const instalarAppDireto = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          toast.success("App do Garçom instalado na tela inicial!");
        }
        setDeferredPrompt(null);
      });
    } else {
      setModalInstalar(true);
    }
  };

  // 27 Mesas Físicas Mapeadas
  const tables = tablesQuery.data || [];
  const mesaAtiva = tables.find((t) => t.tableNumber === selectedTableNum);

  const getSetorMesa = (num: number) => {
    if (num >= 1 && num <= 9) return "Salão Principal";
    if (num >= 10 && num <= 15) return "Deck Jardim";
    if (num >= 16 && num <= 20) return "VIP Casais";
    return "Sushi Bar Balcão";
  };

  const selecionarMesa = (num: number) => {
    setSelectedTableNum(num);
    const mesa = tables.find((t) => t.tableNumber === num);
    if (!mesa || mesa.status === "livre") {
      setAbrirNomeCliente(`Cliente Mesa ${num}`);
      setModalAbrirMesa(true);
    } else {
      setModalComanda(true);
    }
    kdsAudio.playReadyChime();
  };

  const abrirModalAdicionais = (prod: CardapioItemRapido) => {
    setModalItemAdicional(prod);
    setAdicionaisSelecionados([]);
    setObservacaoItem("");
    setQtdItemLancamento(1);
  };

  const toggleAdicional = (add: { nome: string; preco: number }) => {
    setAdicionaisSelecionados((prev) => {
      const exists = prev.some((a) => a.nome === add.nome);
      if (exists) return prev.filter((a) => a.nome !== add.nome);
      return [...prev, add];
    });
  };

  const confirmarLancamentoItem = () => {
    if (!modalItemAdicional) return;
    addTableItemMutation.mutate({
      tableNumber: selectedTableNum,
      itemName: modalItemAdicional.nome,
      quantity: qtdItemLancamento,
      unitPrice: modalItemAdicional.preco,
      station: modalItemAdicional.praca,
      adicionais: adicionaisSelecionados,
      observacoes: observacaoItem,
      operator: abrirNomeGarcom,
    });
  };

  const marcarPratoEntregue = (id: string, tableNumber: number) => {
    setPratosProntosPass((prev) =>
      prev.map((p) => (p.id === id ? { ...p, entregue: true } : p))
    );
    kdsAudio.playReadyChime();
    toast.success(`Prato entregue com sucesso aos clientes da Mesa ${String(tableNumber).padStart(2, "0")}!`, {
      icon: "✅",
    });
  };

  const pedirFechamento = () => {
    if (!mesaAtiva) {
      toast.error("Nenhuma mesa selecionada para fechar conta.");
      return;
    }
    if (mesaAtiva.orderItems.length === 0) {
      toast.warning(`A Mesa ${String(mesaAtiva.tableNumber).padStart(2, "0")} está aberta sem itens lançados.`);
      return;
    }
    setModalComanda(false);
    setModalPagamento(true);
  };

  // Métricas do Garçom no Turno Atual
  const mesasListadas = Array.from({ length: 27 }, (_, i) => {
    const num = i + 1;
    const realTable = tables.find((t) => t.tableNumber === num);
    const setor = getSetorMesa(num);
    const temPratoPronto = pratosProntosPass.some((p) => p.tableNumber === num && !p.entregue);
    return {
      num,
      setor,
      status: realTable?.status || "livre",
      total: realTable?.total || 0,
      customerCount: realTable?.customerCount || 0,
      customerName: realTable?.customerName || "",
      waiter: realTable?.waiter || "Salão",
      orderItems: realTable?.orderItems || [],
      temPratoPronto,
    };
  });

  const mesasFiltradas = mesasListadas.filter((m) => {
    if (setorAtivo === "todos") return true;
    if (setorAtivo === "salao") return m.setor === "Salão Principal";
    if (setorAtivo === "deck") return m.setor === "Deck Jardim";
    if (setorAtivo === "vip") return m.setor === "VIP Casais";
    if (setorAtivo === "balcao") return m.setor === "Sushi Bar Balcão";
    return true;
  });

  const mesasOcupadasCount = mesasListadas.filter((m) => m.status === "ocupada").length;
  const mesasLivresCount = mesasListadas.filter((m) => m.status === "livre").length;
  const chamandoCount = mesasListadas.filter((m) => m.status === "conta").length;
  const pratosProntosNaoEntregues = pratosProntosPass.filter((p) => !p.entregue);

  // Faturamento e Comissão 10%
  const totalSalãoAcumulado = mesasListadas.reduce((acc, m) => acc + (m.total || 0), 0);
  const totalMinhasMesas = mesasListadas
    .filter((m) => m.waiter?.includes("Matheus") || m.status === "ocupada")
    .reduce((acc, m) => acc + (m.total || 0), 0);
  const comissaoGorjetaEstimada = totalMinhasMesas * 0.1;

  // Divisão de Conta da Mesa Ativa
  const totalMesaAtiva = mesaAtiva?.total || 0;
  const taxaServico10Mesa = incluirGorjeta10 ? totalMesaAtiva * 0.1 : 0;
  const totalFinalComGorjeta = totalMesaAtiva + taxaServico10Mesa;
  const valorPorPessoa = totalFinalComGorjeta > 0 ? totalFinalComGorjeta / Math.max(1, dividirPessoas) : 0;

  // Filtro Inteligente do Cardápio Completo (151 Itens Oficiais)
  const itensCardapioFiltrados = useMemo(() => {
    const query = normalizeSearchText(buscaCardapio);
    return CARDAPIO_ZUMA_COMPLETO.filter((p) => {
      // 1. Filtro por categoria selecionada
      let matchCat = true;
      if (categoriaCardapio !== "todos") {
        if (categoriaCardapio === "bebida") {
          matchCat = p.categoria === "bebida";
        } else if (categoriaCardapio === "combinados") {
          matchCat = p.categoriaOrigem === "Combinados";
        } else if (categoriaCardapio === "sushi") {
          matchCat = p.categoria === "sushi" || p.categoria === "especial";
        } else if (categoriaCardapio === "quente") {
          matchCat = p.categoria === "quente";
        } else if (categoriaCardapio === "entrada") {
          matchCat = p.categoria === "entrada";
        } else if (categoriaCardapio === "sobremesa") {
          matchCat = p.categoria === "sobremesa";
        }
      }

      // Se não houver termo de busca digitado, respeita a pílula de categoria selecionada
      if (!query) return matchCat;

      // 2. Busca multi-termo flexível em tempo real (ex: "coca cola" acha "Coca-Cola Lata 350ml" e "Coca-Cola Zero 350ml")
      const nomeNorm = normalizeSearchText(p.nome);
      const catNorm = normalizeSearchText(p.categoriaLabel);
      const descNorm = normalizeSearchText(p.descricao);
      const pracaNorm = normalizeSearchText(p.praca);
      const origNorm = normalizeSearchText(p.categoriaOrigem || "");

      const words = query.split(" ").filter(Boolean);
      const matchesSearch = words.every(
        (w) =>
          nomeNorm.includes(w) ||
          catNorm.includes(w) ||
          descNorm.includes(w) ||
          pracaNorm.includes(w) ||
          origNorm.includes(w)
      );
      return matchesSearch;
    }).sort((a, b) => {
      if (!query) return 0;
      const aName = normalizeSearchText(a.nome);
      const bName = normalizeSearchText(b.nome);
      const aStarts = aName.startsWith(query);
      const bStarts = bName.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  }, [buscaCardapio, categoriaCardapio]);

  return (
    <div className={`min-h-screen ${modoEscuroOled ? "bg-black text-zinc-100 dark" : "bg-zinc-50/60 text-zinc-900"} pb-20 select-none transition-colors duration-200`}>
      <div className="max-w-5xl mx-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
        
        {/* ============================================================== */}
        {/* 1. TOP BAR SLIM: IDENTIFICAÇÃO DO GARÇOM & STATUS OPERACIONAL  */}
        {/* ============================================================== */}
        <header className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-[var(--ink)] truncate">
                  {abrirNomeGarcom}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                  <CircleDot className="w-2.5 h-2.5 fill-emerald-500" />
                  Salão 27 Mesas
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 truncate">
                <span>Gorjeta Estimada (10%):</span>
                <strong className="text-emerald-600 font-mono font-bold">
                  {formatBrl(comissaoGorjetaEstimada)}
                </strong>
              </div>
            </div>
          </div>

          {/* Ações Rápidas de Topo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                kdsAudio.setEnabled(!somAtivo);
                setSomAtivo(!somAtivo);
                toast.info(somAtivo ? "Sons táteis desativados" : "Sons táteis ativados");
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                somAtivo
                  ? "bg-zinc-100 dark:bg-zinc-800 border-[var(--line)] text-emerald-600"
                  : "bg-zinc-100 dark:bg-zinc-800 border-[var(--line)] text-[var(--muted)]"
              }`}
              title={somAtivo ? "Silenciar áudio" : "Ativar áudio"}
            >
              {somAtivo ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setModoEscuroOled(!modoEscuroOled)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-[var(--line)] text-[var(--ink)] cursor-pointer"
              title="Modo Noturno / OLED"
            >
              {modoEscuroOled ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            <button
              onClick={alternarFullscreen}
              className="hidden sm:flex p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-[var(--line)] text-[var(--ink)] cursor-pointer"
              title="Tela Cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Indicador de Nuvem & Offline */}
            <button
              onClick={() => setModalInstalar(true)}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                isOnline && pendingCount === 0
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : isSyncing
                  ? "bg-blue-50 text-blue-800 border-blue-300 animate-pulse"
                  : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
              title="Status da Sincronização em Nuvem (Google Cloud Run)"
            >
              {isOnline && pendingCount === 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline">Nuvem OK</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                  <span className="hidden sm:inline">Sincronizando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span>Offline ({pendingCount})</span>
                </>
              )}
            </button>

            <button
              onClick={() => setModalInstalar(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Instalar App do Garçom no iPhone, iPad ou Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* 2. SEGMENTED CONTROL: ABAS DO APP DO GARÇOM                    */}
        {/* ============================================================== */}
        <nav className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-1.5 shadow-xs grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab("mesas")}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "mesas"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mesas (27)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("comanda");
              setModalComanda(false);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "comanda"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Mesa {String(selectedTableNum).padStart(2, "0")}</span>
          </button>

          <button
            onClick={() => setActiveTab("pass")}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === "pass"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pass KDS</span>
            {pratosProntosNaoEntregues.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shrink-0 animate-pulse">
                {pratosProntosNaoEntregues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("turno")}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "turno"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Meu Turno</span>
          </button>
        </nav>

        {/* ALERTA FLUTUANTE DE PRATOS PRONTOS NO PASS */}
        {pratosProntosNaoEntregues.length > 0 && activeTab !== "pass" && (
          <div
            onClick={() => setActiveTab("pass")}
            className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition shadow-xs animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                🍣 <strong>{pratosProntosNaoEntregues.length} prato(s) pronto(s) no Pass da Cozinha</strong> aguardando entrega!
              </span>
            </div>
            <span className="text-[11px] underline flex items-center gap-0.5">
              Ver Pass <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 1: MAPA TÁTIL DE 27 MESAS DO RESTAURANTE                  */}
        {/* ============================================================== */}
        {activeTab === "mesas" && (
          <div className="space-y-3">
            {/* Filtros de Setor em Pílulas */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto shadow-xs">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "todos", label: "Todas (27)" },
                  { id: "salao", label: "Salão Principal (9)" },
                  { id: "deck", label: "Deck Jardim (6)" },
                  { id: "vip", label: "VIP Casais (5)" },
                  { id: "balcao", label: "Sushi Balcão (7)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSetorAtivo(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      setorAtivo === s.id
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Legenda Resumida */}
              <div className="hidden sm:flex items-center gap-3 text-xs shrink-0 font-medium">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {mesasLivresCount} Livres
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {mesasOcupadasCount} Ocupadas
                </span>
                {chamandoCount > 0 && (
                  <span className="flex items-center gap-1 text-orange-600 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    {chamandoCount} Conta
                  </span>
                )}
              </div>
            </div>

            {/* Grid Tátil das 27 Mesas */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5">
              {mesasFiltradas.map((m) => {
                const isSelected = selectedTableNum === m.num;
                let cardTheme = "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)]";
                let badgeText = "Livre";
                let badgeColor = "text-[var(--muted)] bg-zinc-100 dark:bg-zinc-800";

                if (m.temPratoPronto) {
                  cardTheme = "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/50 shadow-sm";
                  badgeText = "Prato no Pass!";
                  badgeColor = "text-emerald-700 bg-emerald-500/20 font-black";
                } else if (m.status === "conta") {
                  cardTheme = "bg-orange-500/15 border-orange-500 text-orange-800 dark:text-orange-300 ring-2 ring-orange-500/40 shadow-sm";
                  badgeText = "Pediu Conta";
                  badgeColor = "text-orange-700 bg-orange-500/20 font-black";
                } else if (m.status === "ocupada") {
                  cardTheme = "bg-blue-500/10 border-blue-500/40 text-blue-800 dark:text-blue-300 shadow-xs";
                  badgeText = formatBrl(m.total);
                  badgeColor = "text-blue-700 dark:text-blue-300 bg-blue-500/20 font-black font-mono";
                }

                return (
                  <div
                    key={m.num}
                    data-table-num={m.num}
                    onClick={() => selecionarMesa(m.num)}
                    className={`border rounded-2xl p-2.5 cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[96px] text-center relative ${cardTheme} ${
                      isSelected ? "ring-2 ring-orange-500" : "hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] uppercase font-bold text-[var(--muted)]">
                      <span className="truncate">{m.setor.split(" ")[0]}</span>
                      {m.status === "ocupada" && (
                        <span className="flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />
                          {m.customerCount || 2}
                        </span>
                      )}
                    </div>

                    <div className="my-1">
                      <span className="text-xl sm:text-2xl font-black text-[var(--ink)] block">
                        {String(m.num).padStart(2, "0")}
                      </span>
                    </div>

                    <span className={`text-[10px] rounded-md px-1.5 py-0.5 truncate block ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 2: COMANDA ATIVA & CARDÁPIO COMPLETO 151 ITENS            */}
        {/* ============================================================== */}
        {activeTab === "comanda" && (
          <div className="space-y-3">
            {/* Header da Mesa Selecionada */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedTableNum(Math.max(1, selectedTableNum - 1))}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-[var(--line)] text-xs font-bold"
                  >
                    ←
                  </button>
                  <div className="px-3 py-1 bg-orange-600 text-white font-black text-sm rounded-xl">
                    Mesa {String(selectedTableNum).padStart(2, "0")}
                  </div>
                  <button
                    onClick={() => setSelectedTableNum(Math.min(27, selectedTableNum + 1))}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-[var(--line)] text-xs font-bold"
                  >
                    →
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {getSetorMesa(selectedTableNum)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      mesaAtiva?.status === "ocupada" ? "bg-blue-500/20 text-blue-600" : "bg-emerald-500/20 text-emerald-600"
                    }`}>
                      {mesaAtiva?.status === "ocupada" ? "Em Atendimento" : "Mesa Livre"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    {mesaAtiva?.customerName || "Mesa Pronta para Abertura"} · Garçom: {mesaAtiva?.waiter || abrirNomeGarcom}
                  </p>
                </div>
              </div>

              {/* Botões Rápidos de Ação da Mesa */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                {mesaAtiva?.status === "ocupada" ? (
                  <>
                    <button
                      onClick={() => setModalPreConta(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Imprimir conferência de mesa (bobina 80mm) ou enviar WhatsApp"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Pré-Conta
                    </button>
                    <button
                      onClick={() => setModalDividirConta(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Dividir Conta
                    </button>
                    <button
                      onClick={() => setModalTransferir(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                      Transferir
                    </button>
                    <button
                      onClick={() => setModalQrCodeMesa(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      QR Mesa
                    </button>
                    <button
                      onClick={pedirFechamento}
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Pedir Conta
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModalAbrirMesa(true)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Abrir Comanda da Mesa
                  </button>
                )}
              </div>
            </div>

            {/* Split View: Itens da Comanda & Cardápio Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* COLUNA ESQUERDA: ITENS JÁ LANÇADOS NA MESA (5 colunas) */}
              <div className="md:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Itens da Comanda ({mesaAtiva?.orderItems.length || 0})
                  </span>
                  <span className="font-mono font-bold text-xs text-orange-600">
                    Total: {formatBrl(totalMesaAtiva)}
                  </span>
                </div>

                {(!mesaAtiva || mesaAtiva.orderItems.length === 0) ? (
                  <div className="py-8 text-center text-xs text-[var(--muted)] space-y-1">
                    <UtensilsCrossed className="w-7 h-7 mx-auto text-zinc-300 dark:text-zinc-700" />
                    <p className="font-bold">Comanda vazia</p>
                    <p className="text-[11px]">Selecione pratos e bebidas ao lado para lançar.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {mesaAtiva.orderItems.map((it, idx) => {
                      const isCancelled = it.status === "cancelado";
                      const addsTotal = (it.adicionais || []).reduce((acc, a) => acc + a.preco, 0);
                      const itemPrice = (it.unitPrice + addsTotal) * it.quantity;

                      return (
                        <div
                          key={it.id || idx}
                          className={`p-2.5 rounded-xl border flex items-start justify-between text-xs transition ${
                            isCancelled
                              ? "bg-red-500/10 border-red-500/30 dark:bg-red-950/20"
                              : "bg-[var(--surface2)] border-[var(--line)] hover:border-zinc-400"
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-black truncate ${isCancelled ? "line-through text-red-500 dark:text-red-400" : "text-[var(--ink)]"}`}>
                                {it.itemName}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-600">
                                {it.station}
                              </span>
                              {isCancelled && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                                  Cancelado
                                </span>
                              )}
                            </div>
                            {it.adicionais && it.adicionais.length > 0 && (
                              <div className="text-[10px] text-emerald-600 font-medium">
                                + {it.adicionais.map((a) => a.nome).join(", ")}
                              </div>
                            )}
                            {it.observacoes && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                                Obs: {it.observacoes}
                              </div>
                            )}
                            {isCancelled && (it as any).reallocatedTo && (
                              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                ♻️ Reaproveitado na {(it as any).reallocatedTo.identifier} (Zero Desperdício)
                              </div>
                            )}
                            {!(it as any)?.reallocatedTo && isCancelled && (
                              <div className="text-[10px] font-medium text-red-500 italic mt-0.5">
                                Motivo: {it.cancelReason || "Cancelado pelo garçom"}
                              </div>
                            )}
                            <div className={`text-[10px] font-mono ${isCancelled ? "line-through text-red-400" : "text-[var(--muted)]"}`}>
                              {it.quantity}x {formatBrl(it.unitPrice + addsTotal)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-1">
                            <span className={`font-mono font-bold ${isCancelled ? "line-through text-red-500 dark:text-red-400" : "text-orange-600"}`}>
                              {formatBrl(itemPrice)}
                            </span>
                            {!isCancelled && (
                              <button
                                onClick={() => {
                                  const motivo = prompt("Motivo do cancelamento do item:", "Cliente desistiu");
                                  if (motivo) {
                                    cancelTableItemMutation.mutate({
                                      tableNumber: mesaAtiva.tableNumber,
                                      itemId: it.id || it.itemName,
                                      reason: motivo,
                                      cancelledBy: abrirNomeGarcom,
                                    });
                                  }
                                }}
                                className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                                title="Cancelar Item"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Subtotal & Envio ao KDS */}
                {mesaAtiva && mesaAtiva.orderItems.length > 0 && (
                  <div className="pt-2 border-t border-[var(--line)] space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[var(--muted)]">Subtotal com 10%:</span>
                      <strong className="text-base text-orange-600 font-black">{formatBrl(totalMesaAtiva)}</strong>
                    </div>
                    <button
                      onClick={() =>
                        sendTableToKitchenMutation.mutate({
                          tableNumber: mesaAtiva.tableNumber,
                          operator: abrirNomeGarcom,
                        })
                      }
                      disabled={sendTableToKitchenMutation.isPending}
                      className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {sendTableToKitchenMutation.isPending ? "Despachando..." : "Despachar ao KDS Cozinha"}
                    </button>
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA: CARDÁPIO COMPLETO (151 ITENS) & BUSCA INTELIGENTE (7 colunas) */}
              <div className="md:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3.5 shadow-xs space-y-3">
                {/* Barra de Busca de Pratos e Bebidas */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
                  <input
                    data-testid="busca-cardapio-split"
                    type="text"
                    inputMode="search"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={buscaCardapio}
                    onChange={(e) => setBuscaCardapio(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={{ fontSize: "16px" }}
                    placeholder="Buscar pratos ou bebidas (ex: coca cola, heineken, combo 26, hot filadelfia)..."
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-hidden min-h-[44px]"
                  />
                  {buscaCardapio && (
                    <button
                      onClick={() => setBuscaCardapio("")}
                      className="absolute right-2.5 top-2.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Pílulas de Categoria do Cardápio Completo */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: "todos", label: "Tudo (151)" },
                    { id: "bebida", label: "🍹 Bebidas & Drinks (32)" },
                    { id: "combinados", label: "🍣 Combinados (16)" },
                    { id: "sushi", label: "🥢 Sushis & Uramakis" },
                    { id: "quente", label: "🍲 Wok & Quentes" },
                    { id: "entrada", label: "🥟 Entradas & Porções" },
                    { id: "sobremesa", label: "🍰 Sobremesas" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategoriaCardapio(c.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                        categoriaCardapio === c.id
                          ? "bg-orange-600 text-white shadow-2xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Grid de Pratos e Bebidas Filtrados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[390px] overflow-y-auto pr-1">
                  {itensCardapioFiltrados.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-xs text-[var(--muted)]">
                      Nenhum item encontrado para "{buscaCardapio}". Verifique a digitação ou limpe o filtro.
                    </div>
                  ) : (
                    itensCardapioFiltrados.map((prod) => (
                      <div
                        key={prod.id}
                        data-product-id={prod.id}
                        onClick={() => abrirModalAdicionais(prod)}
                        className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:border-orange-500/50 transition cursor-pointer flex flex-col justify-between space-y-1.5 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <strong className="text-xs font-bold text-[var(--ink)] block group-hover:text-orange-600 transition">
                              {prod.nome}
                            </strong>
                            <p className="text-[10px] text-[var(--muted)] line-clamp-2">
                              {prod.descricao}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-xs text-orange-600 shrink-0">
                            {formatBrl(prod.preco)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]/50 text-[10px]">
                          <span className="text-[var(--muted)] flex items-center gap-1">
                            <span className="px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-700 font-bold text-[9px] uppercase">
                              {prod.praca}
                            </span>
                            <span>~{prod.tempoMedioMin} min</span>
                          </span>
                          <button
                            type="button"
                            data-action-lançar={prod.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalAdicionais(prod);
                            }}
                            className="text-orange-600 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Lançar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 3: PASS DA COZINHA & PRATOS PRONTOS (KDS INTEGRATION)       */}
        {/* ============================================================== */}
        {activeTab === "pass" && (
          <div className="space-y-3">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-emerald-500" />
                  Balcão de Expedição & Pass da Cozinha
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Pratos finalizados pelas praças de preparo (Sushibar / Wok / Fritadeira / Bar) aguardando retirada para o salão.
                </p>
              </div>
              <button
                onClick={() => {
                  orderEventBus.emitMesaDishReady({
                    tableNumber: 3,
                    orderNumber: 1048,
                    items: ["Combo 26 Peças", "Coca-Cola Zero 350ml"],
                    station: "Sushibar / Bar",
                    waiter: abrirNomeGarcom,
                    timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-[var(--line)] text-xs font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer hover:bg-zinc-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Simular Prato Pronto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pratosProntosPass.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
                    item.entregue
                      ? "bg-zinc-50 dark:bg-zinc-900 border-[var(--line)] opacity-60"
                      : "bg-emerald-500/10 border-emerald-500/40 text-[var(--ink)] ring-2 ring-emerald-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                        {String(item.tableNumber).padStart(2, "0")}
                      </span>
                      <div>
                        <strong className="text-xs font-black block">Mesa {String(item.tableNumber).padStart(2, "0")}</strong>
                        <span className="text-[10px] text-[var(--muted)]">{getSetorMesa(item.tableNumber)}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--muted)]">
                      Pronto às {item.timestamp}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Pratos Prontos no Pass ({item.station}):
                    </span>
                    <ul className="text-xs space-y-1 font-medium">
                      {item.items.map((it, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    {item.entregue ? (
                      <div className="text-center py-1.5 text-xs font-bold text-zinc-500 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Prato entregue aos clientes
                      </div>
                    ) : (
                      <button
                        onClick={() => marcarPratoEntregue(item.id, item.tableNumber)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar Entrega na Mesa {String(item.tableNumber).padStart(2, "0")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 4: MEU TURNO & GORJETAS 10% DO GARÇOM                      */}
        {/* ============================================================== */}
        {activeTab === "turno" && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-5 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-orange-200">
                    Extrato do Turno · Jantar
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">{abrirNomeGarcom}</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-bold">
                  10% Gorjeta Garantida
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/20">
                <div>
                  <span className="text-[11px] text-orange-200 block">Sua Comissão Hoje</span>
                  <span className="text-2xl font-black font-mono">{formatBrl(comissaoGorjetaEstimada)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-orange-200 block">Total Faturado no Salão</span>
                  <span className="text-xl font-bold font-mono">{formatBrl(totalMinhasMesas)}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-orange-200 block">Mesas Atendidas</span>
                  <span className="text-xl font-bold font-mono">19 de 27 Mesas</span>
                </div>
              </div>
            </div>

            {/* Repasse Instantâneo Sicredi */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-[var(--ink)] block">
                  Chave Pix de Repasse Cadastrada:
                </strong>
                <span className="text-xs text-[var(--muted)] font-mono">
                  matheus.garcom@zuma.com.br (Sicredi MT)
                </span>
              </div>
              <button
                onClick={() => toast.success("Solicitação de repasse das gorjetas enviada ao Fechamento de Caixa!")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Solicitar Repasse Diário
              </button>
            </div>

            {/* HISTÓRICO & LOGS DE AUDITORIA DE MESAS BAIXADAS NO TURNO */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[var(--ink)]">
                      Histórico &amp; Logs de Mesas Baixadas ({mesasBaixadasTurno.length})
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      Registro em tempo real de quem fechou, forma de pagamento e NFC-e SEFAZ MT
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-bold font-mono">
                  Total Baixado: {formatBrl(mesasBaixadasTurno.reduce((acc, m) => acc + m.total, 0))}
                </span>
              </div>

              {mesasBaixadasTurno.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted)] italic">
                  Nenhuma mesa baixada por você neste turno até o momento. Ao pedir conta e finalizar, a mesa aparecerá aqui automaticamente.
                </div>
              ) : (
                <div className="space-y-2">
                  {mesasBaixadasTurno.map((mb) => (
                    <div
                      key={mb.id}
                      className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] hover:border-zinc-400 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                            M{mb.tableNumber}
                          </span>
                          <div>
                            <span className="font-black text-xs text-[var(--ink)] block">
                              Mesa {String(mb.tableNumber).padStart(2, "0")} · {getSetorMesa(mb.tableNumber)}
                            </span>
                            <span className="text-[10px] text-[var(--muted)]">
                              Baixada às {mb.hora} · {mb.itensQtd} itens
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-xs text-emerald-600 block">
                            {formatBrl(mb.total)}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            +10%: {formatBrl(mb.gorjeta10)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[var(--line)]/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-[var(--line)] font-bold text-[10px] text-[var(--ink)]">
                            💳 {mb.paymentMethod}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                            📑 NFC-e #{mb.nfcNumber}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]">
                            Operador: <strong className="text-[var(--ink)]">{mb.operator}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setReciboVisualizacao(mb)}
                            className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            Ver Recibo
                          </button>
                          <button
                            onClick={() => {
                              toast.success(`2ª via da Mesa ${mb.tableNumber} despachada para o Caixa Balcão 80mm!`);
                            }}
                            className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-zinc-600" />
                            2ª Via
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL PRINCIPAL DE COMANDA DA MESA (COM CARDÁPIO 151 ITENS)    */}
        {/* ============================================================== */}
        {modalComanda && mesaAtiva && (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
              
              {/* Header da Comanda */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 shrink-0">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--ink)] flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    Comanda · Mesa {String(mesaAtiva.tableNumber).padStart(2, "0")}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {getSetorMesa(mesaAtiva.tableNumber)} · Garçom: {mesaAtiva.waiter || abrirNomeGarcom} · {mesaAtiva.customerCount || 2} Lugares
                  </p>
                </div>
                <button
                  data-testid="fechar-modal-comanda"
                  onClick={() => {
                    setModalComanda(false);
                    setBuscaCardapio("");
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Corpo da Comanda com Rolagem */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {/* Lista de Itens Lançados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Itens Lançados ({mesaAtiva.orderItems.length})
                    </h4>
                    <button
                      onClick={() => setModalTransferir(true)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      Transferir Mesa
                    </button>
                  </div>

                  {mesaAtiva.orderItems.length === 0 ? (
                    <div className="p-3 rounded-xl bg-[var(--surface2)] text-center text-xs text-[var(--muted)]">
                      Mesa aberta sem pedidos. Busque pratos e bebidas abaixo para lançar.
                    </div>
                  ) : (
                    mesaAtiva.orderItems.map((it, idx) => {
                      const isCancelled = it.status === "cancelado";
                      const addsTotal = (it.adicionais || []).reduce((acc, a) => acc + a.preco, 0);
                      const itemPrice = (it.unitPrice + addsTotal) * it.quantity;

                      return (
                        <div
                          key={it.id || idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            isCancelled
                              ? "bg-red-500/10 border-red-500/30 dark:bg-red-950/20"
                              : "bg-[var(--surface2)] border-[var(--line)]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className={`block ${isCancelled ? "line-through text-red-500 dark:text-red-400" : "text-[var(--ink)]"}`}>{it.itemName}</strong>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600">
                                {it.station}
                              </span>
                              {isCancelled && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                                  Cancelado
                                </span>
                              )}
                            </div>
                            {it.adicionais && it.adicionais.length > 0 && (
                              <div className="text-[10px] text-emerald-600">
                                + {it.adicionais.map((a) => `${a.nome} (${formatBrl(a.preco)})`).join(", ")}
                              </div>
                            )}
                            {it.observacoes && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                                Obs: {it.observacoes}
                              </div>
                            )}
                            {isCancelled && (it as any).reallocatedTo && (
                              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                ♻️ Reaproveitado na {(it as any).reallocatedTo.identifier} (Zero Desperdício)
                              </div>
                            )}
                            {!(it as any)?.reallocatedTo && isCancelled && (
                              <div className="text-[10px] font-medium text-red-500 italic mt-0.5">
                                Motivo: {it.cancelReason || "Cancelado pelo garçom"}
                              </div>
                            )}
                            <span className={`text-[10px] font-mono ${isCancelled ? "line-through text-red-400" : "text-[var(--muted)]"}`}>
                              {it.quantity}x · {formatBrl(it.unitPrice + addsTotal)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold text-xs ${isCancelled ? "line-through text-red-500 dark:text-red-400" : "text-orange-600"}`}>
                              {formatBrl(itemPrice)}
                            </span>
                            {!isCancelled && (
                              <button
                                onClick={() => {
                                  const motivo = prompt("Motivo do cancelamento do item:", "Cliente desistiu");
                                  if (motivo) {
                                    cancelTableItemMutation.mutate({
                                      tableNumber: mesaAtiva.tableNumber,
                                      itemId: it.id || it.itemName,
                                      reason: motivo,
                                      cancelledBy: abrirNomeGarcom,
                                    });
                                  }
                                }}
                                className="p-1 rounded-md text-red-500 hover:bg-red-500/10 cursor-pointer"
                                title="Cancelar Item"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Total Parcial */}
                <div className="p-3 rounded-2xl bg-[var(--surface2)] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--ink)] block">Total Parcial da Mesa:</span>
                    <span className="text-[10px] text-[var(--muted)]">Com 10% de serviço incluso</span>
                  </div>
                  <span className="text-lg font-black font-mono text-orange-600">
                    {formatBrl(mesaAtiva.total)}
                  </span>
                </div>

                {/* Seção Cardápio Rápido & Busca 151 Itens */}
                <div className="space-y-2 pt-1 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--ink)]">Cardápio Rápido:</span>
                    <div className="relative flex-1 max-w-xs">
                      <input
                        data-testid="busca-cardapio-modal"
                        type="text"
                        inputMode="search"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="Buscar prato ou bebida (ex: coca cola)..."
                        value={buscaCardapio}
                        onChange={(e) => setBuscaCardapio(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        style={{ fontSize: "16px" }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] focus:outline-hidden min-h-[40px]"
                      />
                      {buscaCardapio && (
                        <button
                          onClick={() => setBuscaCardapio("")}
                          className="absolute right-2 top-1 text-xs text-[var(--muted)]"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pílulas de Categoria no Modal */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                    {[
                      { id: "todos", label: "Tudo" },
                      { id: "bebida", label: "🍹 Bebidas" },
                      { id: "combinados", label: "🍣 Combos" },
                      { id: "sushi", label: "🥢 Sushi" },
                      { id: "quente", label: "🍲 Quentes" },
                      { id: "entrada", label: "🥟 Entradas" },
                      { id: "sobremesa", label: "🍰 Doces" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategoriaCardapio(c.id)}
                        className={`px-2 py-0.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                          categoriaCardapio === c.id
                            ? "bg-orange-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--ink)]"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* Lista de Resultados Rápidos (151 Itens) */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {itensCardapioFiltrados.length === 0 ? (
                      <div className="col-span-2 py-4 text-center text-xs text-[var(--muted)]">
                        Nenhum item encontrado para "{buscaCardapio}".
                      </div>
                    ) : (
                      itensCardapioFiltrados.slice(0, 40).map((prod) => (
                        <button
                          key={prod.id}
                          data-action-lançar={prod.id}
                          onClick={() => abrirModalAdicionais(prod)}
                          className="p-2 rounded-xl bg-[var(--surface2)] hover:bg-orange-500/10 border border-[var(--line)] text-left text-xs transition flex justify-between items-center cursor-pointer group"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="font-bold text-[var(--ink)] group-hover:text-orange-600 transition truncate block text-[11px]">
                              {prod.nome}
                            </span>
                            <span className="text-[9px] text-[var(--muted)] block">
                              {prod.praca}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-orange-600 shrink-0">
                            {formatBrl(prod.preco)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Ações da Mesa no Rodapé */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[var(--line)] shrink-0">
                <button
                  onClick={() => setModalPreConta(true)}
                  className="py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Pré-Conta
                </button>
                <button
                  onClick={() => setModalDividirConta(true)}
                  className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-[var(--ink)] text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Dividir
                </button>
                <button
                  onClick={pedirFechamento}
                  className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Pagar / Fechar
                </button>
                <button
                  onClick={() =>
                    sendTableToKitchenMutation.mutate({
                      tableNumber: mesaAtiva.tableNumber,
                      operator: abrirNomeGarcom,
                    })
                  }
                  disabled={sendTableToKitchenMutation.isPending}
                  className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {sendTableToKitchenMutation.isPending ? "Enviando..." : "Enviar KDS"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: ABRIR MESA (SE ESTIVER LIVRE)                         */}
        {/* ============================================================== */}
        {modalAbrirMesa && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                  Abrir Mesa {String(selectedTableNum).padStart(2, "0")}
                </h3>
                <button
                  onClick={() => setModalAbrirMesa(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] block mb-1">Quantidade de Pessoas:</label>
                  <div className="flex items-center justify-between gap-2">
                    {[1, 2, 4, 6, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setAbrirQtdPessoas(n)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          abrirQtdPessoas === n
                            ? "bg-orange-600 text-white border-orange-500 shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 border-[var(--line)] text-[var(--muted)]"
                        }`}
                      >
                        {n} {n === 1 ? "Pessoa" : "Lugares"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--muted)] block mb-1">Nome / Referência:</label>
                  <input
                    type="text"
                    value={abrirNomeCliente}
                    onChange={(e) => setAbrirNomeCliente(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={{ fontSize: "16px" }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden min-h-[44px]"
                    placeholder="Ex: Família Yamamoto"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--muted)] block mb-1">Garçom Atendente:</label>
                  <input
                    type="text"
                    value={abrirNomeGarcom}
                    onChange={(e) => setAbrirNomeGarcom(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={{ fontSize: "16px" }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden min-h-[44px]"
                  />
                </div>
              </div>

              <button
                onClick={() =>
                  openTableMutation.mutate({
                    tableNumber: selectedTableNum,
                    customerCount: abrirQtdPessoas,
                    customerName: abrirNomeCliente,
                    waiter: abrirNomeGarcom,
                  })
                }
                disabled={openTableMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {openTableMutation.isPending ? "Abrindo..." : "Confirmar Abertura de Mesa"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: CUSTOMIZAÇÃO & ADICIONAIS DO PRATO (DRAWER RÁPIDO)    */}
        {/* ============================================================== */}
        {modalItemAdicional && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                <div>
                  <h3 className="text-sm font-black text-[var(--ink)]">{modalItemAdicional.nome}</h3>
                  <span className="text-xs text-orange-600 font-mono font-bold">
                    {formatBrl(modalItemAdicional.preco)} · Praça: {modalItemAdicional.praca}
                  </span>
                </div>
                <button
                  onClick={() => setModalItemAdicional(null)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Seletor de Quantidade */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <span className="text-xs font-bold text-[var(--muted)]">Quantidade:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQtdItemLancamento(Math.max(1, qtdItemLancamento - 1))}
                    className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold w-6 text-center">{qtdItemLancamento}</span>
                  <button
                    onClick={() => setQtdItemLancamento(qtdItemLancamento + 1)}
                    className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Adicionais Opcionais */}
              {modalItemAdicional.adicionaisDisponiveis && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--ink)] block">Adicionais Opcionais:</span>
                  {modalItemAdicional.adicionaisDisponiveis.map((add) => {
                    const selected = adicionaisSelecionados.some((a) => a.nome === add.nome);
                    return (
                      <button
                        key={add.nome}
                        onClick={() => toggleAdicional(add)}
                        className={`w-full p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                          selected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold"
                            : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)]"
                        }`}
                      >
                        <span>{add.nome}</span>
                        <span className="font-mono">+{formatBrl(add.preco)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Chips de Observações Rápidas */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[var(--muted)] block">Observações Rápidas:</span>
                <div className="flex flex-wrap gap-1">
                  {OBSERVACOES_RAPIDAS_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() =>
                        setObservacaoItem((prev) => (prev ? `${prev}, ${chip}` : chip))
                      }
                      className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-[var(--line)] text-[10px] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ou digite observação personalizada..."
                  value={observacaoItem}
                  onChange={(e) => setObservacaoItem(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  style={{ fontSize: "16px" }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden min-h-[44px]"
                />
              </div>

              <button
                onClick={confirmarLancamentoItem}
                disabled={addTableItemMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {addTableItemMutation.isPending ? "Lançando..." : "Confirmar e Adicionar à Mesa"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: DIVISÃO TÁTIL DE CONTA (2x a 10x)                    */}
        {/* ============================================================== */}
        {modalDividirConta && mesaAtiva && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 my-auto">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  Dividir Conta · Mesa {String(mesaAtiva.tableNumber).padStart(2, "0")}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Consumo: <strong className="text-orange-600">{formatBrl(totalMesaAtiva)}</strong>
                </p>
              </div>

              {/* Seletor de Pessoas */}
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3.5 rounded-2xl space-y-2.5">
                <span className="text-xs font-bold text-[var(--muted)] block">Dividir em quantas pessoas?</span>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setDividirPessoas(Math.max(1, dividirPessoas - 1))}
                    className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--line)] font-bold text-base flex items-center justify-center cursor-pointer active:scale-95 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    max="99"
                    value={dividirPessoas}
                    onChange={(e) => setDividirPessoas(Math.max(1, parseInt(e.target.value) || 1))}
                    onFocus={(e) => e.target.select()}
                    style={{ fontSize: "22px" }}
                    className="w-16 h-11 text-center font-black font-mono text-2xl text-[var(--ink)] bg-[var(--surface)] rounded-xl border border-[var(--line)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setDividirPessoas(dividirPessoas + 1)}
                    className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--line)] font-bold text-base flex items-center justify-center cursor-pointer active:scale-95 transition"
                  >
                    +
                  </button>
                </div>

                <div className="flex justify-center gap-1.5 pt-1">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setDividirPessoas(n)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        dividirPessoas === n
                          ? "bg-blue-600 text-white"
                          : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]"
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Gorjeta 10% */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs">
                <span className="font-bold text-[var(--ink)]">Taxa de Serviço Garçom (10%):</span>
                <button
                  onClick={() => setIncluirGorjeta10(!incluirGorjeta10)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    incluirGorjeta10 ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {incluirGorjeta10 ? "Incluso" : "Isento"}
                </button>
              </div>

              {/* Resultado do Rateio */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  Valor por Pessoa ({dividirPessoas}x)
                </span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatBrl(valorPorPessoa)}
                </div>
                <span className="text-[10px] text-[var(--muted)]">
                  Total Final com taxa: {formatBrl(totalFinalComGorjeta)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const texto = `🍣 Zuma Oriental · Mesa ${mesaAtiva.tableNumber}\nTotal da conta: ${formatBrl(totalFinalComGorjeta)}\nDivisão para ${dividirPessoas} pessoas: *${formatBrl(valorPorPessoa)} por pessoa*\nChave Pix Sicredi: pix@zuma.kytto.com.br`;
                    navigator.clipboard.writeText(texto);
                    toast.success("Resumo copiado para enviar no WhatsApp!");
                  }}
                  className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-[var(--line)] text-[var(--ink)] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  Copiar Zap
                </button>

                <button
                  onClick={() => {
                    toast.success(`Rateio de ${dividirPessoas}x de ${formatBrl(valorPorPessoa)} enviado ao Caixa!`);
                    setModalDividirConta(false);
                  }}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Enviar ao Caixa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 4: TRANSFERÊNCIA / TROCA DE MESA                         */}
        {/* ============================================================== */}
        {modalTransferir && mesaAtiva && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                  Transferir Mesa {String(mesaAtiva.tableNumber).padStart(2, "0")}
                </h3>
                <button
                  onClick={() => setModalTransferir(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--muted)] block mb-1">Mesa de Destino:</label>
                <select
                  value={mesaDestinoTransferencia}
                  onChange={(e) => setMesaDestinoTransferencia(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden"
                >
                  {Array.from({ length: 27 }, (_, i) => i + 1)
                    .filter((n) => n !== mesaAtiva.tableNumber)
                    .map((n) => (
                      <option key={n} value={n}>
                        Mesa {String(n).padStart(2, "0")} ({getSetorMesa(n)})
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() =>
                  transferTableMutation.mutate({
                    fromTableNumber: mesaAtiva.tableNumber,
                    toTableNumber: mesaDestinoTransferencia,
                  })
                }
                disabled={transferTableMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {transferTableMutation.isPending ? "Transferindo..." : "Confirmar Transferência"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 5: QR CODE DA MESA (AUTO-PEDIDO / PAGAMENTO PIX)         */}
        {/* ============================================================== */}
        {modalQrCodeMesa && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                <span className="text-xs font-bold text-[var(--ink)]">
                  Auto-Pedido · Mesa {String(selectedTableNum).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setModalQrCodeMesa(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[var(--muted)]">
                Mostre este QR Code para o cliente escanear e pedir direto do próprio smartphone:
              </p>

              <div className="p-4 bg-white rounded-2xl border border-[var(--line)] inline-block shadow-sm">
                <div className="w-40 h-40 bg-zinc-950 rounded-xl p-3 flex flex-col justify-between items-center text-white">
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 border-4 border-orange-500 rounded-sm" />
                    <div className="w-8 h-8 border-4 border-white rounded-sm" />
                  </div>
                  <div className="text-[10px] font-mono font-bold text-orange-400">
                    ZUMA MESA {String(selectedTableNum).padStart(2, "0")}
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="w-8 h-8 border-4 border-white rounded-sm" />
                    <div className="w-6 h-6 bg-orange-500 rounded-sm" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[var(--muted)]">
                URL da Mesa: <code className="text-orange-600 font-mono">https://zuma.kytto.com.br/mesa?n={selectedTableNum}</code>
              </div>

              <button
                onClick={() => setModalQrCodeMesa(false)}
                className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[var(--ink)] font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: PRÉ-CONTA / CONFERÊNCIA DE MESA 80MM & WHATSAPP         */}
        {modalPreConta && mesaAtiva && (
          <ModalPreContaMesa
            isOpen={modalPreConta}
            onClose={() => setModalPreConta(false)}
            mesaNumero={mesaAtiva.tableNumber}
            mesaNome={`Mesa ${String(mesaAtiva.tableNumber).padStart(2, "0")}`}
            garcomNome={abrirNomeGarcom}
            clienteNome={mesaAtiva.customerName || undefined}
            itens={(mesaAtiva.orderItems || []).map((i) => ({
              nome: i.itemName,
              qtd: i.quantity,
              valorUnit: i.unitPrice,
              obs: i.observacoes,
            }))}
            consumoBase={mesaAtiva.subtotal || totalMesaAtiva}
            incluirGorjeta={incluirGorjeta10}
            onToggleGorjeta={(ativo) => setIncluirGorjeta10(ativo)}
            splitPessoas={dividirPessoas}
            onChangeSplitPessoas={(n) => setDividirPessoas(n)}
          />
        )}

        {/* MODAL: PAGAMENTO COMPLETO NA MESA & BAIXA AUTOMÁTICA          */}
        {/* ============================================================== */}
        {modalPagamento && mesaAtiva && (
          <ModalPagamentoMesa
            isOpen={modalPagamento}
            onClose={() => setModalPagamento(false)}
            mesaNumero={mesaAtiva.tableNumber}
            mesaNome={`Mesa ${String(mesaAtiva.tableNumber).padStart(2, "0")}`}
            garcomNome={abrirNomeGarcom}
            clienteNome={mesaAtiva.customerName || undefined}
            itens={(mesaAtiva.orderItems || []).map((i) => ({
              nome: i.itemName,
              qtd: i.quantity,
              valorUnit: i.unitPrice,
              obs: i.observacoes,
            }))}
            consumoBase={mesaAtiva.subtotal || totalMesaAtiva}
            taxaServicoAtiva={incluirGorjeta10}
            descontoCashback={mesaAtiva.discountAmount || 0}
            modoFechamento={dividirPessoas > 1 ? "DIVIDIDO" : "TOTAL"}
            splitPessoas={dividirPessoas}
            onConfirmarPagamentoEBaixa={(detalhes) => {
              closeTableMutation.mutate({
                tableNumber: mesaAtiva.tableNumber,
                paymentMethod: detalhes.formaPagamento,
                operator: abrirNomeGarcom,
                role: "garcom",
                canal: "App do Garçom Móvel",
                splitCount: dividirPessoas > 1 ? dividirPessoas : 1,
              });
            }}
          />
        )}

        {/* ============================================================== */}
        {/* MODAL: 2ª VIA DO RECIBO / COMPROVANTE TÉRMICO DA MESA BAIXADA  */}
        {/* ============================================================== */}
        {reciboVisualizacao && (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-[var(--ink)]">
                    Recibo Mesa {String(reciboVisualizacao.tableNumber).padStart(2, "0")}
                  </h3>
                </div>
                <button
                  onClick={() => setReciboVisualizacao(null)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Simulação Bobina Térmica 80mm */}
              <div className="bg-white text-zinc-900 font-mono text-[11px] p-4 rounded-xl border border-zinc-200 shadow-inner space-y-2">
                <div className="text-center border-b border-dashed border-zinc-300 pb-2">
                  <strong className="block text-xs">ZUMA COZINHA ORIENTAL</strong>
                  <span>CNPJ: 36.296.848/0001-57</span>
                  <span className="block text-[10px]">Tangará da Serra - MT</span>
                  <span className="block text-[10px]">NFC-e SEFAZ MT #{reciboVisualizacao.nfcNumber} (AUTORIZADA)</span>
                </div>

                <div className="flex justify-between">
                  <span>Mesa: {String(reciboVisualizacao.tableNumber).padStart(2, "0")}</span>
                  <span>Hora: {reciboVisualizacao.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span>Garçom:</span>
                  <span>{reciboVisualizacao.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span>Forma:</span>
                  <span className="font-bold">{reciboVisualizacao.paymentMethod}</span>
                </div>
                {reciboVisualizacao.splitCount > 1 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Dividido:</span>
                    <span>{reciboVisualizacao.splitCount} pessoas</span>
                  </div>
                )}

                <div className="border-t border-dashed border-zinc-300 pt-2 flex justify-between font-bold text-xs">
                  <span>TOTAL PAGO:</span>
                  <span className="text-emerald-700">{formatBrl(reciboVisualizacao.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Gorjeta (10%):</span>
                  <span>{formatBrl(reciboVisualizacao.gorjeta10)}</span>
                </div>

                <div className="border-t border-dashed border-zinc-300 pt-2 text-center text-[9px] text-zinc-500">
                  <span>Chave Sicredi MT: 36.296.848/0001-57</span>
                  <span className="block">Obrigado pela preferência!</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    toast.success(`Impressão enviada para a impressora do Caixa Balcão 80mm!`);
                  }}
                  className="py-2.5 rounded-xl bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir 2ª Via
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText?.(`Recibo Zuma Mesa ${reciboVisualizacao.tableNumber} - Total: ${formatBrl(reciboVisualizacao.total)} · NFC-e #${reciboVisualizacao.nfcNumber}`);
                    toast.success("Comprovante copiado para envio no WhatsApp!");
                  }}
                  className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        <ModalInstalarPdv
          isOpen={modalInstalar}
          onClose={() => setModalInstalar(false)}
        />

      </div>
    </div>
  );
};
