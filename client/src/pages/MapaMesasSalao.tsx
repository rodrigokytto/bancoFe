import React, { useState, useEffect } from "react";
import { 
  UtensilsCrossed, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Receipt, 
  Sparkles, 
  Camera, 
  Flame, 
  ArrowRightLeft, 
  Wine, 
  Beer, 
  Coffee, 
  X, 
  Zap,
  Split,
  Layers,
  ChevronRight,
  TrendingUp,
  Search,
  Check,
  Download,
  Eye,
  Radio,
  ShieldCheck,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { SplitBillModal } from "../components/mesas/SplitBillModal";
import { ModalCardapioCompleto, ItemLancamentoPayload } from "../components/mesas/ModalCardapioCompleto";
import { ModalClienteCrm, ClienteCrmDetalhado, BASE_CLIENTES_DEMO } from "../components/mesas/ModalClienteCrm";
import { ModalPagamentoMesa } from "../components/mesas/ModalPagamentoMesa";
import { formatBrl } from "../../../shared/zumaData";
import { Minus, UserPlus, Gift, Trash2 } from "lucide-react";
import { JuntarMesasModal } from "../components/mesas/JuntarMesasModal";
import { orderEventBus } from "../lib/orderEvents";

export type AmbianceType = "SALAO_NOBRE" | "DECK_JARDIM" | "TATAMES_VIP" | "BALCAO_OMAKASE";

export interface MesaOperacional {
  id: number;
  nome: string;
  ambiance: AmbianceType;
  lugares: number;
  status: "LIVRE" | "OCUPADA" | "PRODUCAO" | "RODIZIO" | "AGUARDANDO_CONTA";
  tempoMinutos: number;
  consumoTotal: number;
  clientesQtd: number;
  clienteNome?: string;
  garcomNome: string;
  camera: string;
  alertaIa?: string;
  pecasServidas?: number;
  itens: { nome: string; qtd: number; valorUnit: number }[];
}

const INITIAL_MESAS: MesaOperacional[] = [
  // 1. Salão Nobre (Mesas 01 a 10)
  {
    id: 1,
    nome: "Mesa 01",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 48,
    consumoTotal: 286.00,
    clientesQtd: 3,
    clienteNome: "Família Barbosa",
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    pecasServidas: 38,
    itens: [
      { nome: "Combinado Salmão Lovers (24 pçs)", qtd: 1, valorUnit: 89.90 },
      { nome: "Hot Filadélfia Especial (12 pçs)", qtd: 2, valorUnit: 48.00 },
      { nome: "Cerveja Kirin Ichiban 600ml", qtd: 3, valorUnit: 22.00 },
      { nome: "Água com Gás San Pellegrino", qtd: 2, valorUnit: 17.05 }
    ]
  },
  {
    id: 2,
    nome: "Mesa 02",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    itens: []
  },
  {
    id: 3,
    nome: "Mesa 03",
    ambiance: "SALAO_NOBRE",
    lugares: 6,
    status: "OCUPADA",
    tempoMinutos: 25,
    consumoTotal: 342.00,
    clientesQtd: 4,
    clienteNome: "Dr. Marcelo & Amigos",
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    pecasServidas: 42,
    itens: [
      { nome: "Barca Especial Zuma (60 pçs)", qtd: 1, valorUnit: 198.00 },
      { nome: "Carpaccio de Salmão Trufado", qtd: 2, valorUnit: 52.00 },
      { nome: "Garrafa Vinho Branco Sauvignon Blanc", qtd: 1, valorUnit: 92.00 }
    ]
  },
  {
    id: 4,
    nome: "Mesa 04",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "RODIZIO",
    tempoMinutos: 62,
    consumoTotal: 398.00,
    clientesQtd: 2,
    clienteNome: "Casal Mendes",
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    pecasServidas: 54,
    itens: [
      { nome: "Rodízio Omakase Premium", qtd: 2, valorUnit: 179.00 },
      { nome: "Cocktail Zumi Yuzu Tonic", qtd: 2, valorUnit: 20.00 }
    ]
  },
  {
    id: 5,
    nome: "Mesa 05",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    itens: []
  },
  {
    id: 6,
    nome: "Mesa 06",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 35,
    consumoTotal: 215.00,
    clientesQtd: 2,
    clienteNome: "Camila Guimarães",
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    pecasServidas: 28,
    itens: [
      { nome: "Combinado Tradicional 30 Pçs", qtd: 1, valorUnit: 125.00 },
      { nome: "Uramaki Ebi Spicy (8 pçs)", qtd: 1, valorUnit: 46.00 },
      { nome: "Suco Natural Maracujá com Gengibre", qtd: 2, valorUnit: 22.00 }
    ]
  },
  {
    id: 7,
    nome: "Mesa 07",
    ambiance: "SALAO_NOBRE",
    lugares: 6,
    status: "OCUPADA",
    tempoMinutos: 52,
    consumoTotal: 412.00,
    clientesQtd: 5,
    clienteNome: "Mesa Corporativa Agro MT",
    garcomNome: "Matheus Lima",
    camera: "CAM-01",
    alertaIa: "Gesto de mão detectado por IA há 48s sem garçom na mesa",
    pecasServidas: 46,
    itens: [
      { nome: "Barca Imperial 70 Pçs", qtd: 1, valorUnit: 210.00 },
      { nome: "Guioza Bovina na Chapa (6 pçs)", qtd: 2, valorUnit: 34.00 },
      { nome: "Shimeji na Manteiga Especial", qtd: 2, valorUnit: 38.00 },
      { nome: "Cerveja Heineken Long Neck", qtd: 6, valorUnit: 16.00 }
    ]
  },
  {
    id: 8,
    nome: "Mesa 08",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "AGUARDANDO_CONTA",
    tempoMinutos: 74,
    consumoTotal: 310.00,
    clientesQtd: 3,
    clienteNome: "Roberto Faria & Família",
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    pecasServidas: 36,
    itens: [
      { nome: "Combinado Especial do Chef 40 Pçs", qtd: 1, valorUnit: 168.00 },
      { nome: "Robata de Salmão com Tarê", qtd: 3, valorUnit: 24.00 },
      { nome: "Refrigerante Coca-Cola Zero", qtd: 4, valorUnit: 9.00 },
      { nome: "Sobremesa Tempurá de Sorvete", qtd: 2, valorUnit: 22.00 }
    ]
  },
  {
    id: 9,
    nome: "Mesa 09",
    ambiance: "SALAO_NOBRE",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 20,
    consumoTotal: 185.00,
    clientesQtd: 2,
    clienteNome: "Letícia & Pedro",
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    pecasServidas: 22,
    itens: [
      { nome: "Combinado Fit Salmão & Atum 20 Pçs", qtd: 1, valorUnit: 95.00 },
      { nome: "Sunomono Especial com Polvo", qtd: 1, valorUnit: 38.00 },
      { nome: "Chá Gelado da Casa c/ Limão Siciliano", qtd: 2, valorUnit: 16.00 }
    ]
  },
  {
    id: 10,
    nome: "Mesa 10",
    ambiance: "SALAO_NOBRE",
    lugares: 6,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    itens: []
  },

  // 2. Deck Jardim & Lounge (Mesas 11 a 18)
  {
    id: 11,
    nome: "Mesa 11 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 40,
    consumoTotal: 295.00,
    clientesQtd: 3,
    clienteNome: "Thiago & Colegas",
    garcomNome: "Matheus Lima",
    camera: "CAM-05",
    pecasServidas: 32,
    itens: [
      { nome: "Combinado Deck Tropical 32 Pçs", qtd: 1, valorUnit: 135.00 },
      { nome: "Tartar de Salmão com Chips de Batata", qtd: 1, valorUnit: 48.00 },
      { nome: "Gin Tônica Tanqueray c/ Especiarias", qtd: 3, valorUnit: 34.00 }
    ]
  },
  {
    id: 12,
    nome: "Mesa 12 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 55,
    consumoTotal: 340.00,
    clientesQtd: 4,
    clienteNome: "Grupo Fazenda Primavera",
    garcomNome: "Sofia Rezende",
    camera: "CAM-05",
    pecasServidas: 44,
    itens: [
      { nome: "Barca Deck Lounge 50 Pçs", qtd: 1, valorUnit: 180.00 },
      { nome: "Niguiri Trufado com Flor de Sal (8 pçs)", qtd: 2, valorUnit: 42.00 },
      { nome: "Balde Cerveja Corona (6 unid)", qtd: 1, valorUnit: 76.00 }
    ]
  },
  {
    id: 13,
    nome: "Mesa 13 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 2,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Sofia Rezende",
    camera: "CAM-05",
    itens: []
  },
  {
    id: 14,
    nome: "Mesa 14 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 65,
    consumoTotal: 420.00,
    clientesQtd: 4,
    clienteNome: "Renata & Família",
    garcomNome: "Matheus Lima",
    camera: "CAM-05",
    pecasServidas: 50,
    itens: [
      { nome: "Festival Salmão Supreme (50 pçs)", qtd: 1, valorUnit: 189.00 },
      { nome: "Uramaki Dragão Especial (8 pçs)", qtd: 2, valorUnit: 48.00 },
      { nome: "Vinho Rosé Provence 750ml", qtd: 1, valorUnit: 135.00 }
    ]
  },
  {
    id: 15,
    nome: "Mesa 15 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 6,
    status: "OCUPADA",
    tempoMinutos: 32,
    consumoTotal: 275.00,
    clientesQtd: 3,
    clienteNome: "Comitiva Agrícola",
    garcomNome: "Matheus Lima",
    camera: "CAM-05",
    pecasServidas: 34,
    itens: [
      { nome: "Combinado Salmão & Atum Grill", qtd: 1, valorUnit: 145.00 },
      { nome: "Yakissoba Especial de Mignon", qtd: 2, valorUnit: 48.00 },
      { nome: "Chopp Artesanal IPA 500ml", qtd: 4, valorUnit: 18.00 }
    ]
  },
  {
    id: 16,
    nome: "Mesa 16 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 4,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Sofia Rezende",
    camera: "CAM-05",
    itens: []
  },
  {
    id: 17,
    nome: "Mesa 17 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 4,
    status: "OCUPADA",
    tempoMinutos: 50,
    consumoTotal: 312.00,
    clientesQtd: 2,
    clienteNome: "Fábio & Beatriz",
    garcomNome: "Matheus Lima",
    camera: "CAM-05",
    pecasServidas: 38,
    itens: [
      { nome: "Experiência Omakase 2 Pessoas", qtd: 1, valorUnit: 220.00 },
      { nome: "Cocktail Moscow Mule Zuma", qtd: 2, valorUnit: 26.00 },
      { nome: "Harumaki de Nutella c/ Banana", qtd: 2, valorUnit: 20.00 }
    ]
  },
  {
    id: 18,
    nome: "Mesa 18 (Deck)",
    ambiance: "DECK_JARDIM",
    lugares: 4,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Sofia Rezende",
    camera: "CAM-05",
    itens: []
  },

  // 3. Tatames VIP Japoneses (Mesas 19 a 24)
  {
    id: 19,
    nome: "Tatame VIP 19",
    ambiance: "TATAMES_VIP",
    lugares: 6,
    status: "RODIZIO",
    tempoMinutos: 68,
    consumoTotal: 537.00,
    clientesQtd: 3,
    clienteNome: "Comitiva Produtores Safra MT",
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    pecasServidas: 72,
    itens: [
      { nome: "Rodízio Omakase Imperial", qtd: 3, valorUnit: 179.00 }
    ]
  },
  {
    id: 20,
    nome: "Tatame VIP 20",
    ambiance: "TATAMES_VIP",
    lugares: 8,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    itens: []
  },
  {
    id: 21,
    nome: "Tatame VIP 21",
    ambiance: "TATAMES_VIP",
    lugares: 8,
    status: "OCUPADA",
    tempoMinutos: 90,
    consumoTotal: 648.00,
    clientesQtd: 6,
    clienteNome: "Aniversário Dra. Helena",
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    pecasServidas: 86,
    itens: [
      { nome: "Barca Omakase Imperial (100 pçs)", qtd: 1, valorUnit: 348.00 },
      { nome: "Garrafa de Vinho Chablis Grand Cru", qtd: 1, valorUnit: 195.00 },
      { nome: "Sobremesa Petit Gateau Matcha", qtd: 3, valorUnit: 35.00 }
    ]
  },
  {
    id: 22,
    nome: "Tatame VIP 22",
    ambiance: "TATAMES_VIP",
    lugares: 6,
    status: "OCUPADA",
    tempoMinutos: 30,
    consumoTotal: 380.00,
    clientesQtd: 4,
    clienteNome: "Família Sato",
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    pecasServidas: 40,
    itens: [
      { nome: "Barca Tradicional 60 Pçs", qtd: 1, valorUnit: 180.00 },
      { nome: "Tempurá Misto Especial", qtd: 2, valorUnit: 52.00 },
      { nome: "Chá Verde Japonês Quente Bule", qtd: 2, valorUnit: 22.00 },
      { nome: "Saquê Quente Hakutsuru", qtd: 1, valorUnit: 52.00 }
    ]
  },
  {
    id: 23,
    nome: "Tatame VIP 23",
    ambiance: "TATAMES_VIP",
    lugares: 6,
    status: "LIVRE",
    tempoMinutos: 0,
    consumoTotal: 0,
    clientesQtd: 0,
    garcomNome: "Sofia Rezende",
    camera: "CAM-04",
    itens: []
  },
  {
    id: 24,
    nome: "Tatame VIP 24",
    ambiance: "TATAMES_VIP",
    lugares: 8,
    status: "OCUPADA",
    tempoMinutos: 42,
    consumoTotal: 490.00,
    clientesQtd: 5,
    clienteNome: "Diretoria Concreto Serrano",
    garcomNome: "Matheus Lima",
    camera: "CAM-04",
    pecasServidas: 58,
    itens: [
      { nome: "Barca Nobre Omakase 80 Pçs", qtd: 1, valorUnit: 290.00 },
      { nome: "Ceviche Misto Peruano/Japonês", qtd: 2, valorUnit: 48.00 },
      { nome: "Garrafa Whisky Macallan 12 Anos", qtd: 1, valorUnit: 320.00 }
    ]
  },

  // 4. Balcão Omakase VIP (Lugares 25 a 27)
  {
    id: 25,
    nome: "Balcão VIP 25",
    ambiance: "BALCAO_OMAKASE",
    lugares: 2,
    status: "RODIZIO",
    tempoMinutos: 50,
    consumoTotal: 358.00,
    clientesQtd: 2,
    clienteNome: "Casal Omakase",
    garcomNome: "Hiroshi Tanaka",
    camera: "CAM-03",
    pecasServidas: 32,
    itens: [
      { nome: "Experiência Omakase 10 Passos", qtd: 2, valorUnit: 179.00 }
    ]
  },
  {
    id: 26,
    nome: "Balcão VIP 26",
    ambiance: "BALCAO_OMAKASE",
    lugares: 2,
    status: "OCUPADA",
    tempoMinutos: 38,
    consumoTotal: 264.00,
    clientesQtd: 2,
    clienteNome: "Lucas & Mariana",
    garcomNome: "Hiroshi Tanaka",
    camera: "CAM-03",
    pecasServidas: 26,
    itens: [
      { nome: "Sashimi Tasting Hiroshi (18 pçs)", qtd: 1, valorUnit: 120.00 },
      { nome: "Niguiri Vieiras Canadenses (4 pçs)", qtd: 2, valorUnit: 44.00 },
      { nome: "Coquetel Saketini c/ Pepino Japonês", qtd: 2, valorUnit: 28.00 }
    ]
  },
  {
    id: 27,
    nome: "Balcão VIP 27",
    ambiance: "BALCAO_OMAKASE",
    lugares: 2,
    status: "OCUPADA",
    tempoMinutos: 45,
    consumoTotal: 298.00,
    clientesQtd: 2,
    clienteNome: "Rodrigo & Convidado",
    garcomNome: "Hiroshi Tanaka",
    camera: "CAM-03",
    pecasServidas: 30,
    itens: [
      { nome: "Omakase Degustação do Chef", qtd: 2, valorUnit: 149.00 }
    ]
  }
];

export function MapaMesasSalao() {
  const [mesas, setMesas] = useState<MesaOperacional[]>(INITIAL_MESAS);
  const [filtroAmbiance, setFiltroAmbiance] = useState<"TODAS" | AmbianceType>("TODAS");
  const [filtroStatus, setFiltroStatus] = useState<"TODAS" | "OCUPADA" | "LIVRE" | "ALERTA_IA">("TODAS");

  // Escutar pratos prontos no KDS 2.0 (Cozinha Inteligente)
  useEffect(() => {
    const unsubDish = orderEventBus.subscribeMesaDishReady(ready => {
      toast.success(`🍱 Pratos da Mesa #${ready.tableNumber} prontos no Pass!`, {
        description: `Itens: ${ready.items.join(", ")} · Praça: ${ready.station} · Garçom acionado para entrega imediata.`
      });

      setMesas(prev => prev.map(m => {
        if (m.id === ready.tableNumber) {
          return {
            ...m,
            status: "RODIZIO",
            alertaIa: "Prato Pronto no Pass Sushibar (Avisar Garçom)"
          };
        }
        return m;
      }));
    });

    const unsubClosed = orderEventBus.subscribeTableClosed(closed => {
      toast.info(`Mesa ${String(closed.tableNumber).padStart(2, "0")} baixada pelo Garçom (${closed.operator})!`, {
        description: `Forma: ${closed.paymentMethod} · Total: ${formatBrl(closed.total)} · Salão liberado.`
      });
      setMesas(prev => prev.map(m => m.id === closed.tableNumber ? {
        ...m,
        status: "LIVRE",
        consumoTotal: 0,
        clientesQtd: 0,
        clienteNome: undefined,
        itens: [],
        tempoMinutos: 0,
        alertaIa: undefined
      } : m));
      setSelectedMesa(curr => curr?.id === closed.tableNumber ? null : curr);
    });

    return () => {
      unsubDish();
      unsubClosed();
    };
  }, []);
  const [selectedMesa, setSelectedMesa] = useState<MesaOperacional | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCftvModalOpen, setIsCftvModalOpen] = useState(false);
  const [selectedCameraStream, setSelectedCameraStream] = useState<string>("CAM-04");
  const [visionMode, setVisionMode] = useState<"NORMAL" | "POSE_IA" | "TERMICO">("POSE_IA");
  const [splitPessoas, setSplitPessoas] = useState(1);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isJuntarModalOpen, setIsJuntarModalOpen] = useState(false);
  const [taxaServicoAtiva, setTaxaServicoAtiva] = useState(true);
  const [isCardapioModalOpen, setIsCardapioModalOpen] = useState(false);
  const [isClienteCrmModalOpen, setIsClienteCrmModalOpen] = useState(false);
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [modoFechamento, setModoFechamento] = useState<"TOTAL" | "DIVIDIDO">("DIVIDIDO");
  const [descontoCashback, setDescontoCashback] = useState(0);
  const [observacaoPreparo, setObservacaoPreparo] = useState("");

  const mesasOcupadas = mesas.filter(m => m.status !== "LIVRE").length;
  const faturamentoSalao = mesas.reduce((acc, m) => acc + m.consumoTotal, 0);
  const ticketMedio = mesasOcupadas > 0 ? faturamentoSalao / mesasOcupadas : 0;
  const totalPessoas = mesas.reduce((acc, m) => acc + m.clientesQtd, 0);
  const taxaServicoTotal = faturamentoSalao * 0.1;

  const closeTableMutation = trpc.zuma.closeTable.useMutation({
    onSuccess: (data: any) => {
      toast.success(`NFC-e #${data.nfcNumber || "6102"} emitida e autorizada pela SEFAZ-MT!`, {
        description: `Estoque de salmão e insumos baixado via ficha técnica (BOM).`
      });
    },
  });

  const addTableItemMutation = trpc.zuma.addTableItem.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Comanda enviada para a praça KDS! Subtotal: R$ ${data.subtotal?.toFixed(2) || "0.00"}`);
    },
  });

  const transferTableMutation = trpc.zuma.transferTable.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Mesa #${data.fromTableNumber} transferida para a Mesa #${data.toTableNumber}!`, {
        description: "Comanda, consumo e itens sincronizados no KDS e salão."
      });
    },
    onError: (err: any) => {
      toast.error(`Erro ao transferir mesa: ${err.message}`);
    }
  });

  const joinTablesMutation = trpc.zuma.joinTables.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Mesas agrupadas com sucesso!`, {
        description: `Mesa #${data.sourceTableNumber} mesclada na Mesa #${data.targetTableNumber}. Novo total: R$ ${data.newTotal?.toFixed(2) || ""}.`
      });
    },
    onError: (err: any) => {
      toast.error(`Erro ao agrupar mesas: ${err.message}`);
    }
  });

  const handleOpenMesa = (mesa: MesaOperacional) => {
    setSelectedMesa(mesa);
    const qtd = mesa.clientesQtd > 0 ? mesa.clientesQtd : 1;
    setSplitPessoas(qtd);
    setModoFechamento(qtd > 1 ? "DIVIDIDO" : "TOTAL");
    setDescontoCashback(0);
    setModalOpen(true);
  };

  const handleLancarItemCompleto = (payload: ItemLancamentoPayload) => {
    if (!selectedMesa) return;
    const novosItens = [...selectedMesa.itens];
    const idxExistente = novosItens.findIndex(i => i.nome === payload.nome);
    if (idxExistente >= 0) {
      novosItens[idxExistente] = {
        ...novosItens[idxExistente],
        qtd: novosItens[idxExistente].qtd + payload.qtd
      };
    } else {
      novosItens.push({
        nome: payload.nome + (payload.observacao ? ` (${payload.observacao})` : ""),
        qtd: payload.qtd,
        valorUnit: payload.valorUnit
      });
    }

    const acrescimo = payload.valorUnit * payload.qtd;
    const novoConsumo = selectedMesa.consumoTotal + acrescimo;
    const mesaAtualizada: MesaOperacional = {
      ...selectedMesa,
      itens: novosItens,
      consumoTotal: novoConsumo,
      status: selectedMesa.status === "LIVRE" ? "OCUPADA" : selectedMesa.status,
      pecasServidas: (selectedMesa.pecasServidas || 0) + (payload.qtd * 6)
    };

    setMesas(prev => prev.map(m => m.id === selectedMesa.id ? mesaAtualizada : m));
    setSelectedMesa(mesaAtualizada);

    addTableItemMutation.mutate({
      tableNumber: selectedMesa.id,
      itemName: payload.nome,
      quantity: payload.qtd,
      unitPrice: payload.valorUnit,
      station: payload.station
    });

    orderEventBus.emit({
      orderId: `mesa-${selectedMesa.id}-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      channel: "mesa",
      tableNumber: selectedMesa.id,
      customerName: selectedMesa.clienteNome || `Mesa #${selectedMesa.id}`,
      items: [
        {
          name: payload.nome,
          praça: payload.station,
          fireOnDemand: payload.fireOnDemand,
          prepMinutes: payload.station === "sushibar" ? 8 : 12,
          price: payload.valorUnit,
          salmonWeightGrams: payload.station === "sushibar" ? 120 : 60
        }
      ],
      totalValue: acrescimo,
      status: "novo"
    });
  };

  const handleRemoverItem = (idxRemover: number) => {
    if (!selectedMesa) return;
    const item = selectedMesa.itens[idxRemover];
    if (!item) return;
    const decrescimo = item.qtd * item.valorUnit;
    const novosItens = selectedMesa.itens.filter((_, idx) => idx !== idxRemover);
    const novoConsumo = Math.max(0, selectedMesa.consumoTotal - decrescimo);
    const mesaAtualizada: MesaOperacional = {
      ...selectedMesa,
      itens: novosItens,
      consumoTotal: novoConsumo
    };
    setMesas(prev => prev.map(m => m.id === selectedMesa.id ? mesaAtualizada : m));
    setSelectedMesa(mesaAtualizada);
    toast.info(`Item ${item.nome} removido da comanda.`);
  };

  const handleVincularCliente = (cliente: ClienteCrmDetalhado) => {
    if (!selectedMesa) return;
    const mesaAtualizada: MesaOperacional = {
      ...selectedMesa,
      clienteNome: cliente.nome,
      clientesQtd: selectedMesa.clientesQtd > 0 ? selectedMesa.clientesQtd : 2
    };
    setMesas(prev => prev.map(m => m.id === selectedMesa.id ? mesaAtualizada : m));
    setSelectedMesa(mesaAtualizada);
  };

  const handleAplicarCashback = (valor: number) => {
    setDescontoCashback(valor);
  };

  const handleOpenCftv = (cameraName?: string) => {
    if (cameraName) setSelectedCameraStream(cameraName);
    setIsCftvModalOpen(true);
  };

  const handleLancarItemRapido = (itemNome: string, valor: number) => {
    if (!selectedMesa) return;
    const nomeComObs = observacaoPreparo.trim() ? `${itemNome} (Obs: ${observacaoPreparo.trim()})` : itemNome;
    const novosItens = [...selectedMesa.itens, { nome: nomeComObs, qtd: 1, valorUnit: valor }];
    const novoConsumo = selectedMesa.consumoTotal + valor;
    const mesaAtualizada: MesaOperacional = {
      ...selectedMesa,
      itens: novosItens,
      consumoTotal: novoConsumo,
      status: selectedMesa.status === "LIVRE" ? "OCUPADA" : selectedMesa.status,
      pecasServidas: (selectedMesa.pecasServidas || 0) + 12
    };

    setMesas(prev => prev.map(m => m.id === selectedMesa.id ? mesaAtualizada : m));
    setSelectedMesa(mesaAtualizada);
    toast.success(`${nomeComObs} lançado na ${selectedMesa.nome} com sucesso!`);
    addTableItemMutation.mutate({
      tableNumber: selectedMesa.id,
      itemName: nomeComObs,
      quantity: 1,
      unitPrice: valor,
      station: itemNome.toLowerCase().includes("ichiban") || itemNome.toLowerCase().includes("saquê") ? "bar" : "sushibar"
    });
    setObservacaoPreparo("");
  };

  const handleExecutarTransferencia = (destinoId: number) => {
    if (!selectedMesa) return;
    const dest = mesas.find(m => m.id === destinoId);
    if (!dest) return;

    transferTableMutation.mutate({
      fromTableNumber: selectedMesa.id,
      toTableNumber: destinoId
    });

    setMesas(prev => prev.map(m => {
      if (m.id === destinoId) {
        return {
          ...m,
          status: "OCUPADA",
          consumoTotal: selectedMesa.consumoTotal,
          clientesQtd: selectedMesa.clientesQtd,
          clienteNome: selectedMesa.clienteNome,
          tempoMinutos: selectedMesa.tempoMinutos,
          itens: [...selectedMesa.itens],
          pecasServidas: selectedMesa.pecasServidas,
          alertaIa: selectedMesa.alertaIa
        };
      }
      if (m.id === selectedMesa.id) {
        return {
          ...m,
          status: "LIVRE",
          consumoTotal: 0,
          clientesQtd: 0,
          clienteNome: undefined,
          tempoMinutos: 0,
          itens: [],
          pecasServidas: 0,
          alertaIa: undefined
        };
      }
    return m;
    }));

    setIsJuntarModalOpen(false);
    setModalOpen(false);
    setSelectedMesa(null);
  };

  const handleExecutarJuncao = (destinoId: number) => {
    if (!selectedMesa) return;
    const dest = mesas.find(m => m.id === destinoId);
    if (!dest) return;

    joinTablesMutation.mutate({
      sourceTableNumber: selectedMesa.id,
      targetTableNumber: destinoId
    });

    setMesas(prev => prev.map(m => {
      if (m.id === destinoId) {
        return {
          ...m,
          status: "OCUPADA",
          consumoTotal: m.consumoTotal + selectedMesa.consumoTotal,
          clientesQtd: m.clientesQtd + selectedMesa.clientesQtd,
          itens: [...m.itens, ...selectedMesa.itens],
          pecasServidas: (m.pecasServidas || 0) + (selectedMesa.pecasServidas || 0),
          clienteNome: m.clienteNome || selectedMesa.clienteNome
        };
      }
      if (m.id === selectedMesa.id) {
        return {
          ...m,
          status: "LIVRE",
          consumoTotal: 0,
          clientesQtd: 0,
          clienteNome: undefined,
          tempoMinutos: 0,
          itens: [],
          pecasServidas: 0,
          alertaIa: undefined
        };
      }
    return m;
    }));

    setIsJuntarModalOpen(false);
    setModalOpen(false);
    setSelectedMesa(null);
  };

  const handleFecharConta = () => {
    if (!selectedMesa) return;
    setIsPagamentoModalOpen(true);
  };

  const handleConfirmarJuntar = (origemId: number, destinoId: number) => {
    setMesas(prev => {
      const origem = prev.find(m => m.id === origemId);
      const destino = prev.find(m => m.id === destinoId);
      if (!origem || !destino) return prev;
      const itensAgrupados = [...destino.itens, ...origem.itens];
      const consumoAgrupado = destino.consumoTotal + origem.consumoTotal;
      const clientesAgrupados = (destino.clientesQtd || 0) + (origem.clientesQtd || 0);

      return prev.map(m => {
        if (m.id === destinoId) {
          return {
            ...m,
            itens: itensAgrupados,
            consumoTotal: consumoAgrupado,
            clientesQtd: clientesAgrupados,
            pecasServidas: (m.pecasServidas || 0) + (origem.pecasServidas || 0),
            alertaIa: `Mesa agrupada com ${origem.nome}`
          };
        }
        if (m.id === origemId) {
          return {
            ...m,
            status: "LIVRE",
            consumoTotal: 0,
            clientesQtd: 0,
            itens: [],
            clienteNome: undefined,
            tempoMinutos: 0,
            alertaIa: `Vinculada à ${destino.nome}`
          };
        }
        return m;
      });
    });
    setModalOpen(false);
  };

  const handleConfirmarTransferir = (origemId: number, destinoId: number) => {
    setMesas(prev => {
      const origem = prev.find(m => m.id === origemId);
      const destino = prev.find(m => m.id === destinoId);
      if (!origem || !destino) return prev;

      return prev.map(m => {
        if (m.id === destinoId) {
          return {
            ...m,
            status: "OCUPADA",
            itens: origem.itens,
            consumoTotal: origem.consumoTotal,
            clientesQtd: origem.clientesQtd,
            clienteNome: origem.clienteNome,
            tempoMinutos: origem.tempoMinutos,
            pecasServidas: origem.pecasServidas
          };
        }
        if (m.id === origemId) {
          return {
            ...m,
            status: "LIVRE",
            consumoTotal: 0,
            clientesQtd: 0,
            itens: [],
            clienteNome: undefined,
            tempoMinutos: 0
          };
        }
        return m;
      });
    });
    setModalOpen(false);
  };

  const handleFinalizarContaSplit = (totalPago: number) => {
    if (!selectedMesa) return;
    setMesas(prev => prev.map(m => m.id === selectedMesa.id ? {
      ...m,
      status: "LIVRE",
      consumoTotal: 0,
      clientesQtd: 0,
      clienteNome: undefined,
      itens: [],
      tempoMinutos: 0,
      alertaIa: undefined
    } : m));
    setModalOpen(false);
  };

  const handleExportarRelatorio = () => {
    const dataReport = {
      timestamp: new Date().toISOString(),
      restaurante: "Zuma Cozinha Oriental - Tangará da Serra (MT)",
      totalMesas: 27,
      mesasOcupadas,
      taxaOcupacao: `${((mesasOcupadas / 27) * 100).toFixed(1)}%`,
      consumoAberto: `R$ ${faturamentoSalao.toFixed(2)}`,
      taxaServico10: `R$ ${taxaServicoTotal.toFixed(2)}`,
      ticketMedio: `R$ ${ticketMedio.toFixed(2)}`,
      mesas: mesas.map(m => ({
        mesa: m.nome,
        status: m.status,
        consumo: m.consumoTotal,
        garcom: m.garcomNome,
        camera: m.camera,
        alerta: m.alertaIa || "Nenhum"
      }))
    };
    const blob = new Blob([JSON.stringify(dataReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_salao_zuma_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success("Relatório operacional do salão exportado com sucesso!");
  };

  const filteredMesas = mesas.filter(m => {
    if (filtroAmbiance !== "TODAS" && m.ambiance !== filtroAmbiance) return false;
    if (filtroStatus === "OCUPADA" && m.status === "LIVRE") return false;
    if (filtroStatus === "LIVRE" && m.status !== "LIVRE") return false;
    if (filtroStatus === "ALERTA_IA" && !m.alertaIa) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho do Salão */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
              Salão 360° · 27 Mesas Ativas
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-bold">
              Ultra Vision AI Telemetria 4K
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
              Sicredi Pix Direto Taxa 0%
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
            Mapa de Mesas & Operação de Salão
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-3xl leading-relaxed">
            Gestão visual das 27 mesas do Zuma Cozinha Oriental em Tangará da Serra. Salão Nobre, Deck Jardim, Tatames Japoneses VIP e Balcão Omakase monitorados por visão computacional com detecção de chamados e divisão de contas instantânea.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenCftv("CAM-04")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ver Câmeras Salão (CAM-04/05)</span>
          </button>
          <button
            onClick={handleExportarRelatorio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório</span>
          </button>
          <Link
            href="/nossa-gente"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-xs no-underline"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipe Garçons (8)</span>
          </Link>
        </div>
      </div>

      {/* Grid de KPIs do Salão */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span className="font-bold">Ocupação do Salão</span>
            <UtensilsCrossed className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-[var(--ink)]">
            {mesasOcupadas} <span className="text-sm font-normal text-[var(--muted)]">/ 27 mesas</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {((mesasOcupadas / 27) * 100).toFixed(1)}% de ocupação no jantar
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span className="font-bold">Consumo Aberto no Salão</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {faturamentoSalao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[var(--muted)] font-medium mt-1">
            {totalPessoas} clientes presentes no momento
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span className="font-bold">Ticket Médio por Mesa</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            R$ {ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            +18% vs média gastronômica MT
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span className="font-bold">Taxa de Serviço 10% Salão</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            R$ {taxaServicoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[var(--muted)] font-medium mt-1">
            Rateio direto para os 8 colaboradores
          </div>
        </div>
      </div>

      {/* Barra de Filtros: Ambientes & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filtros de Ambientes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "TODAS", label: "Todas as Mesas (27)" },
            { id: "SALAO_NOBRE", label: "Salão Nobre (Mesas 01-10)" },
            { id: "DECK_JARDIM", label: "Deck Jardim & Lounge (Mesas 11-18)" },
            { id: "TATAMES_VIP", label: "Tatames VIP Japoneses (Mesas 19-24)" },
            { id: "BALCAO_OMAKASE", label: "Balcão Omakase VIP (Lugares 25-27)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroAmbiance(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                filtroAmbiance === tab.id
                  ? "bg-[var(--salmon)] text-white shadow-2xs"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFiltroStatus("TODAS")}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
              filtroStatus === "TODAS" ? "bg-[var(--surface2)] text-[var(--ink)] font-bold" : "text-[var(--muted)]"
            }`}
          >
            Todos Status
          </button>
          <button
            onClick={() => setFiltroStatus("OCUPADA")}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
              filtroStatus === "OCUPADA" ? "bg-blue-500/20 text-blue-600 font-bold" : "text-[var(--muted)]"
            }`}
          >
            Ocupadas ({mesasOcupadas})
          </button>
          <button
            onClick={() => setFiltroStatus("LIVRE")}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
              filtroStatus === "LIVRE" ? "bg-emerald-500/20 text-emerald-600 font-bold" : "text-[var(--muted)]"
            }`}
          >
            Livres ({27 - mesasOcupadas})
          </button>
          <button
            onClick={() => setFiltroStatus("ALERTA_IA")}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
              filtroStatus === "ALERTA_IA" ? "bg-red-500/20 text-red-600 font-bold" : "text-[var(--muted)]"
            }`}
          >
            Alertas IA (1)
          </button>
        </div>
      </div>

      {/* Grid das Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMesas.map(mesa => {
          const isLivre = mesa.status === "LIVRE";
          const temAlerta = !!mesa.alertaIa;

          return (
            <div
              key={mesa.id}
              onClick={() => handleOpenMesa(mesa)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                temAlerta
                  ? "bg-red-500/5 border-red-500/40 hover:border-red-500 shadow-xs"
                  : isLivre
                  ? "bg-[var(--surface)] border-[var(--line)] opacity-80 hover:opacity-100 hover:border-[var(--salmon)] shadow-2xs"
                  : "bg-[var(--surface)] border-[var(--line)] hover:border-blue-400 shadow-2xs"
              }`}
            >
              {/* Badge de Alerta IA */}
              {temAlerta && (
                <div className="mb-2 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>IA: Gesto de Mão Detectado</span>
                </div>
              )}

              {/* Topo do Card de Mesa */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-[var(--ink)]">{mesa.nome}</span>
                    <span className="text-[11px] text-[var(--muted)] font-medium">({mesa.lugares} lug)</span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] block">
                    {mesa.ambiance === "SALAO_NOBRE" && "Salão Nobre"}
                    {mesa.ambiance === "DECK_JARDIM" && "Deck Jardim"}
                    {mesa.ambiance === "TATAMES_VIP" && "Tatame Tradicional"}
                    {mesa.ambiance === "BALCAO_OMAKASE" && "Balcão Sushibar"}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isLivre
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : mesa.status === "RODIZIO"
                    ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                    : mesa.status === "AGUARDANDO_CONTA"
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                }`}>
                  {isLivre ? "Livre" : mesa.status === "RODIZIO" ? "Rodízio" : mesa.status === "AGUARDANDO_CONTA" ? "Conta" : "Ocupada"}
                </span>
              </div>

              {/* Informações de Consumo */}
              {isLivre ? (
                <div className="py-4 text-center text-xs text-[var(--muted)] font-medium">
                  Mesa higienizada e pronta para receber clientes.
                  <div className="mt-2 text-[11px] font-bold text-[var(--salmon)] group-hover:underline">
                    + Abrir Mesa Agora
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[var(--muted)] text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {mesa.tempoMinutos} min
                    </span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      R$ {mesa.consumoTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[11px] text-[var(--ink)] font-semibold truncate">
                    {mesa.clienteNome || "Cliente Mesa"} · {mesa.clientesQtd} pessoas
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                    <span>Garçom: <strong className="text-[var(--ink)]">{mesa.garcomNome}</strong></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCftv(mesa.camera);
                      }}
                      className="font-mono text-purple-600 dark:text-purple-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <Camera className="w-2.5 h-2.5" /> {mesa.camera}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Câmeras CFTV 4K ao Vivo */}
      {isCftvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-4xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header CFTV */}
            <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[var(--ink)]">
                      CFTV 4K Ultra Vision AI — Salão & Cozinha
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <Radio className="w-2.5 h-2.5" /> AO VIVO
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Câmera ativa: <strong className="text-[var(--ink)]">{selectedCameraStream}</strong> · Latência de transmissão: 2.1ms
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCftvModalOpen(false)}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo CFTV: Feed de Vídeo Simulado com Bounding Boxes */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Seletor de Câmeras */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "CAM-01", label: "CAM-01 (Recepção & Caixa)", setor: "Frente de Loja" },
                  { id: "CAM-02", label: "CAM-02 (Cozinha Quente)", setor: "Preparo Quente" },
                  { id: "CAM-03", label: "CAM-03 (Sushibar Omakase)", setor: "Sushibar" },
                  { id: "CAM-04", label: "CAM-04 (Salão Nobre)", setor: "Salão Principal" },
                  { id: "CAM-05", label: "CAM-05 (Deck Jardim)", setor: "Deck Externo" }
                ].map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCameraStream(cam.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCameraStream === cam.id
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Feed Visual com Bounding Boxes */}
              <div className="relative rounded-2xl bg-black border border-[var(--line)] overflow-hidden aspect-video flex items-center justify-center text-white">
                {/* Background simulado de restaurante */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-zinc-900 to-neutral-950 flex flex-col justify-between p-4 opacity-90">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      ZUMA TANGARÁ DA SERRA · {selectedCameraStream} · 3840x2160 @ 60fps
                    </span>
                    <span>{new Date().toLocaleTimeString("pt-BR")}</span>
                  </div>

                  {/* Bounding Box 1: Cliente na Mesa 07 */}
                  <div className="absolute top-[28%] left-[22%] w-[26%] h-[45%] border-2 border-red-500 rounded-lg p-2 bg-red-500/10 flex flex-col justify-between">
                    <div className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-xs w-max flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-2.5 h-2.5" /> GESTO DE MÃO (MESA 07)
                    </div>
                    <div className="text-[10px] font-mono text-red-200 bg-black/60 p-1 rounded-xs">
                      Dwell time: 52 min · Garçom: Matheus Lima
                    </div>
                  </div>

                  {/* Bounding Box 2: Colaborador com EPI */}
                  <div className="absolute top-[32%] right-[24%] w-[22%] h-[48%] border-2 border-emerald-500 rounded-lg p-2 bg-emerald-500/10 flex flex-col justify-between">
                    <div className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-xs w-max flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-2.5 h-2.5" /> ANVISA COMPLIANT
                    </div>
                    <div className="text-[10px] font-mono text-emerald-200 bg-black/60 p-1 rounded-xs">
                      Touca: 100% · Avental: 100% · Ponto Portaria 671 OK
                    </div>
                  </div>

                  {/* Rodapé da Câmera */}
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-black/40 p-2 rounded-xl backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">● AI DETECT ATIVO</span>
                      <span>Pessoas detectadas: 8</span>
                      <span>Ocupação visual: 72%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setVisionMode("NORMAL")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${visionMode === "NORMAL" ? "bg-white text-black" : "text-zinc-400"}`}
                      >
                        RGB 4K
                      </button>
                      <button
                        onClick={() => setVisionMode("POSE_IA")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${visionMode === "POSE_IA" ? "bg-purple-600 text-white" : "text-zinc-400"}`}
                      >
                        Pose IA
                      </button>
                      <button
                        onClick={() => setVisionMode("TERMICO")}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${visionMode === "TERMICO" ? "bg-red-600 text-white" : "text-zinc-400"}`}
                      >
                        Térmico
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="p-3 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--ink)]">Ação de Campo:</span>
                  <span className="text-[var(--muted)]">Mesa 07 solicitando atendimento no Salão Nobre.</span>
                </div>
                <button
                  onClick={() => {
                    toast.success("Garçom Matheus Lima notificado via Smartwatch & Central!", {
                      description: "Direcionado com prioridade máxima para a Mesa 07."
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer transition-all shadow-xs"
                >
                  Despachar Garçom para Mesa 07
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interativo de Detalhes da Mesa */}
      {modalOpen && selectedMesa && (() => {
        const baseConsumo = selectedMesa.consumoTotal;
        const taxaServico = taxaServicoAtiva ? baseConsumo * 0.1 : 0;
        const totalLiquido = Math.max(0, baseConsumo + taxaServico - descontoCashback);
        const pessoasCalculo = modoFechamento === "TOTAL" ? 1 : Math.max(1, splitPessoas);
        const cotaPorPessoa = totalLiquido / pessoasCalculo;

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] text-[var(--ink)] w-full max-w-3xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header do Modal com Dados da Mesa e CRM Cliente */}
            <div className="p-4 sm:p-5 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface2)]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--salmon)] text-white font-black flex items-center justify-center text-sm shadow-xs">
                  {selectedMesa.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[var(--ink)]">
                      {selectedMesa.nome} · {selectedMesa.ambiance.replace("_", " ")}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      selectedMesa.status === "OCUPADA" ? "bg-blue-500/15 text-blue-600" : "bg-emerald-500/15 text-emerald-600"
                    }`}>
                      {selectedMesa.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Garçom: <strong className="text-[var(--ink)]">{selectedMesa.garcomNome}</strong> · Câmera: {selectedMesa.camera} (Ultra AI)
                  </p>
                </div>
              </div>

              {/* Botão de CRM & Perfil Completo do Cliente */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsClienteCrmModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-500/20 cursor-pointer transition shadow-2xs"
                  title="Abrir Cadastro, Preferências, Alergias e Histórico do Cliente"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedMesa.clienteNome ? `Cliente: ${selectedMesa.clienteNome}` : "Vincular Cliente (CRM)"}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>

                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Lançamento Rápido + Botão de Catálogo Completo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                    Lançamento de Itens no KDS 2.0
                  </span>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                    Sincronizado c/ Cozinha Quente &amp; Sushibar
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleLancarItemRapido("Barca Especial (50 pçs)", 148.00)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/50 hover:bg-[var(--salmon)] hover:text-white transition-all font-bold text-left cursor-pointer group"
                  >
                    <span className="block text-xs font-black">Barca Especial</span>
                    <span className="text-[10px] text-[var(--muted)] group-hover:text-white/80">50 pçs · R$ 148,00</span>
                  </button>

                  <button
                    onClick={() => handleLancarItemRapido("Combinado Salmão Lovers", 89.90)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/50 hover:bg-[var(--salmon)] hover:text-white transition-all font-bold text-left cursor-pointer group"
                  >
                    <span className="block text-xs font-black">Salmão Lovers</span>
                    <span className="text-[10px] text-[var(--muted)] group-hover:text-white/80">24 pçs · R$ 89,90</span>
                  </button>

                  <button
                    onClick={() => handleLancarItemRapido("Sashimi Trufado (10 pçs)", 58.00)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/50 hover:bg-[var(--salmon)] hover:text-white transition-all font-bold text-left cursor-pointer group"
                  >
                    <span className="block text-xs font-black">Sashimi Trufado</span>
                    <span className="text-[10px] text-[var(--muted)] group-hover:text-white/80">10 pçs · R$ 58,00</span>
                  </button>

                  <button
                    onClick={() => handleLancarItemRapido("Hot Filadélfia (12 pçs)", 48.00)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/50 hover:bg-[var(--salmon)] hover:text-white transition-all font-bold text-left cursor-pointer group"
                  >
                    <span className="block text-xs font-black">Hot Filadélfia</span>
                    <span className="text-[10px] text-[var(--muted)] group-hover:text-white/80">12 pçs · R$ 48,00</span>
                  </button>

                  <button
                    onClick={() => handleLancarItemRapido("Cerveja Kirin Ichiban", 22.00)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/50 hover:bg-[var(--salmon)] hover:text-white transition-all font-bold text-left cursor-pointer group"
                  >
                    <span className="block text-xs font-black">Kirin Ichiban</span>
                    <span className="text-[10px] text-[var(--muted)] group-hover:text-white/80">600ml · R$ 22,00</span>
                  </button>

                  <button
                    onClick={() => handleLancarItemRapido("Saquê Dourado Junmai", 78.00)}
                    className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/50 hover:bg-[var(--salmon)] hover:text-white transition-all font-bold text-left cursor-pointer group"
                  >
                    <span className="block text-xs font-black">Saquê Junmai</span>
                    <span className="text-[10px] text-[var(--muted)] group-hover:text-white/80">Garrafa · R$ 78,00</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Observação técnica de preparo (ex: sem gergelim, maçaricado extra, alérgico a crustáceos)..."
                    value={observacaoPreparo}
                    onChange={(e) => setObservacaoPreparo(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--salmon)]"
                  />
                  {observacaoPreparo && (
                    <button
                      onClick={() => setObservacaoPreparo("")}
                      className="px-2 py-1.5 rounded-xl text-xs text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Botão de Destaque para Lançar Qualquer Item do Cardápio Completo */}
                <button
                  onClick={() => setIsCardapioModalOpen(true)}
                  className="w-full mt-2.5 p-3 rounded-2xl border-2 border-dashed border-[var(--salmon)]/60 bg-[var(--salmon)]/10 hover:bg-[var(--salmon)]/20 text-[var(--salmon)] font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>🔎 Abrir Cardápio Completo Zuma (100+ Itens • Sushibar, Wok, Hot Rolls, Bebidas, Sobremesas)</span>
                </button>
              </div>

              {/* Itens Consumidos na Mesa */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                    Itens Consumidos na Mesa ({selectedMesa.itens.length})
                  </span>
                  <button
                    onClick={() => setIsCardapioModalOpen(true)}
                    className="text-xs text-[var(--salmon)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Lançar Outro Item
                  </button>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/20 divide-y divide-[var(--line)] overflow-hidden">
                  {selectedMesa.itens.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--muted)]">
                      Nenhum item lançado ainda nesta mesa.
                    </div>
                  ) : (
                    selectedMesa.itens.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-[var(--surface2)]/50 transition">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center font-bold text-[10px]">
                            {it.qtd}x
                          </span>
                          <span className="font-semibold text-[var(--ink)]">{it.nome}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[var(--ink)]">
                            R$ {(it.qtd * it.valorUnit).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoverItem(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition"
                            title="Remover item da mesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Divisão de Contas Sem Limite & Fechamento Total */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                {/* Seletor de Modo: Fechar Total vs Dividir Conta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-500/20">
                  <div className="flex items-center gap-2">
                    <Split className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-xs text-indigo-950 dark:text-indigo-100">
                      Forma de Fechamento da Conta
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl bg-white/70 dark:bg-black/40 p-1 border border-indigo-500/20">
                    <button
                      onClick={() => {
                        setModoFechamento("TOTAL");
                        setSplitPessoas(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        modoFechamento === "TOTAL" 
                          ? "bg-indigo-600 text-white shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      ⚡ Fechar Total (1 Pessoa)
                    </button>
                    <button
                      onClick={() => {
                        setModoFechamento("DIVIDIDO");
                        if (splitPessoas === 1) setSplitPessoas(Math.max(2, selectedMesa.clientesQtd || 2));
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        modoFechamento === "DIVIDIDO" 
                          ? "bg-indigo-600 text-white shadow-2xs" 
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      👥 Dividir Conta (Sem Limite)
                    </button>
                  </div>
                </div>

                {modoFechamento === "DIVIDIDO" ? (
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                        Quantidade de Pessoas a Dividir:
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSplitPessoas(prev => Math.max(1, prev - 1))}
                          className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 border border-indigo-500/30 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={splitPessoas}
                          onChange={e => setSplitPessoas(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-14 text-center font-black font-mono text-sm py-1 rounded-lg bg-white dark:bg-black/40 border border-indigo-500/30 text-indigo-900 dark:text-indigo-100"
                        />
                        <button
                          onClick={() => setSplitPessoas(prev => prev + 1)}
                          className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 border border-indigo-500/30 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 ml-1">pessoas</span>
                      </div>
                    </div>

                    {/* Presets Rápidos sem limite de 6 */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs scrollbar-none">
                      <span className="text-[10px] text-[var(--muted)] mr-1">Presets:</span>
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(n => (
                        <button
                          key={n}
                          onClick={() => setSplitPessoas(n)}
                          className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold transition cursor-pointer ${
                            splitPessoas === n 
                              ? "bg-indigo-600 text-white shadow-2xs" 
                              : "bg-white/60 dark:bg-black/20 hover:bg-white text-[var(--ink)]"
                          }`}
                        >
                          {n === 1 ? "1 (Total)" : `${n}p`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-indigo-900 dark:text-indigo-200 bg-white/40 dark:bg-black/20 p-2.5 rounded-xl border border-indigo-500/10">
                    💳 Pagamento total em fatura única para <strong>{selectedMesa.clienteNome || "o cliente da mesa"}</strong>.
                  </div>
                )}

                {/* Taxa de Serviço e Descontos */}
                <div className="pt-2 border-t border-indigo-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-indigo-900 dark:text-indigo-200">
                      <input
                        type="checkbox"
                        checked={taxaServicoAtiva}
                        onChange={(e) => setTaxaServicoAtiva(e.target.checked)}
                        className="rounded accent-indigo-600 cursor-pointer"
                      />
                      <span>Incluir Taxa de Serviço 10% (Rateio Equipe Nossa Gente)</span>
                    </label>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      {taxaServicoAtiva ? `+ R$ ${(selectedMesa.consumoTotal * 0.1).toFixed(2)}` : "R$ 0,00"}
                    </span>
                  </div>

                  {descontoCashback > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" /> Desconto Clube Zumi Cashback:
                      </span>
                      <span className="font-mono">- R$ {descontoCashback.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Resumo Final */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-indigo-500/20 text-sm font-black">
                    <div>
                      <span className="text-indigo-950 dark:text-indigo-100 block">
                        {modoFechamento === "DIVIDIDO" && splitPessoas > 1
                          ? `Total Final (${splitPessoas}x de R$ ${(totalLiquido / splitPessoas).toFixed(2)})`
                          : "Total Final a Liquidar"}
                      </span>
                      {modoFechamento === "DIVIDIDO" && splitPessoas > 1 && (
                        <span className="text-[11px] text-[var(--muted)] font-normal">
                          Cota individual: R$ ${(totalLiquido / splitPessoas).toFixed(2)} por pessoa
                        </span>
                      )}
                    </div>
                    <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
                      R$ {totalLiquido.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSplitModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 cursor-pointer transition shadow-xs"
                >
                  <Split className="w-4 h-4" />
                  <span>Divisão Avançada (Split Bill)</span>
                </button>

                <button
                  onClick={() => setIsJuntarModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 cursor-pointer transition shadow-xs"
                >
                  <Layers className="w-4 h-4" />
                  <span>Juntar / Transferir Mesa</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success("NFC-e SEFAZ-MT gerada!", {
                      description: "Chave: 51261136296848000157650010000049281893728192 emitida com sucesso."
                    });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Emitir NFC-e</span>
                </button>

                <button
                  onClick={() => setIsPagamentoModalOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-all shadow-sm cursor-pointer active:scale-98"
                  title="Pagar na Mesa pelo Garçom & Despachar Multicanal"
                >
                  <Receipt className="w-4 h-4" />
                  <span>⚡ Pagar na Mesa &amp; Despachar (Caixa, WhatsApp, E-mail)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal Cardápio Completo (100+ Itens Zuma) */}
      {isCardapioModalOpen && selectedMesa && (
        <ModalCardapioCompleto
          isOpen={isCardapioModalOpen}
          onClose={() => setIsCardapioModalOpen(false)}
          mesaNumero={selectedMesa.id}
          mesaNome={selectedMesa.nome}
          onLancarItem={handleLancarItemCompleto}
        />
      )}

      {/* Modal CRM Cliente & Histórico & Cashback */}
      {isClienteCrmModalOpen && selectedMesa && (
        <ModalClienteCrm
          isOpen={isClienteCrmModalOpen}
          onClose={() => setIsClienteCrmModalOpen(false)}
          mesaNumero={selectedMesa.id}
          clienteAtualNome={selectedMesa.clienteNome}
          onVincularCliente={handleVincularCliente}
          onAplicarCashback={handleAplicarCashback}
        />
      )}

      {/* Modal Pagamento na Mesa & Despacho Multicanal (Caixa, WhatsApp, E-mail) */}
      {isPagamentoModalOpen && selectedMesa && (
        <ModalPagamentoMesa
          isOpen={isPagamentoModalOpen}
          onClose={() => setIsPagamentoModalOpen(false)}
          mesaNumero={selectedMesa.id}
          mesaNome={selectedMesa.nome}
          garcomNome={selectedMesa.garcomNome}
          clienteNome={selectedMesa.clienteNome}
          itens={selectedMesa.itens}
          consumoBase={selectedMesa.consumoTotal}
          taxaServicoAtiva={taxaServicoAtiva}
          descontoCashback={descontoCashback}
          modoFechamento={modoFechamento}
          splitPessoas={splitPessoas}
          onConfirmarPagamentoEBaixa={(detalhes) => {
            closeTableMutation.mutate({
              tableNumber: selectedMesa.id,
              paymentMethod: detalhes.formaPagamento,
              operator: selectedMesa.garcomNome || "Salão Zuma",
              role: "garcom",
              canal: "Salão Zuma 360°",
              splitCount: modoFechamento === "TOTAL" ? 1 : Math.max(1, splitPessoas)
            });

            orderEventBus.emitTableClosed({
              tableNumber: selectedMesa.id,
              total: detalhes.totalPago,
              paymentMethod: detalhes.formaPagamento,
              operator: selectedMesa.garcomNome || "Salão Zuma",
              nfcNumber: detalhes.chaveNfce ? detalhes.chaveNfce.slice(-4) : "6041",
              splitCount: modoFechamento === "TOTAL" ? 1 : Math.max(1, splitPessoas),
              canal: "Salão Zuma 360°",
              timestamp: new Date().toISOString()
            });

            setMesas(prev => prev.map(m => m.id === selectedMesa.id ? {
              ...m,
              status: "LIVRE",
              consumoTotal: 0,
              clientesQtd: 0,
              clienteNome: undefined,
              itens: [],
              tempoMinutos: 0,
              alertaIa: undefined
            } : m));

            setModalOpen(false);
            setIsPagamentoModalOpen(false);
            setSelectedMesa(null);
          }}
        />
      )}
      {/* Modal Split Bill Avançado */}
      {isSplitModalOpen && selectedMesa && (
        <SplitBillModal
          mesa={selectedMesa}
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          onFinalizarConta={handleFinalizarContaSplit}
        />
      )}

      {/* Modal Juntar Mesas / Transferência */}
      {isJuntarModalOpen && selectedMesa && (
        <JuntarMesasModal
          origemMesa={selectedMesa}
          todasMesas={mesas}
          isOpen={isJuntarModalOpen}
          onClose={() => setIsJuntarModalOpen(false)}
          onConfirmarJuntar={handleConfirmarJuntar}
          onConfirmarTransferir={handleConfirmarTransferir}
        />
      )}
    </div>
  );
}
export default MapaMesasSalao;
