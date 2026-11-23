import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Bike,
  LocateFixed,
  Navigation,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  MessageCircle,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Compass,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Radio,
  Battery,
  Wifi,
  Sparkles,
  Camera,
  Layers,
  Send,
  RotateCcw,
  Zap,
  Sliders,
  CheckSquare,
  PenTool,
  Wallet,
  Sun,
  Moon,
  TrendingUp,
  CloudRain,
  Route,
  AlertTriangle,
  Flame,
  Check,
  ArrowRight,
  Fuel,
  Leaf,
  Download,
  ListOrdered,
  Copy,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { orderEventBus, MotoboyDispatchedDeliveryEvent } from "../lib/orderEvents";
import { trpc } from "../lib/trpc";
import {
  LAT_ZUMA,
  LNG_ZUMA,
  ENDERECO_BASE_ZUMA,
  TANGARA_PONTOS_CRITICOS,
  WAYPOINT_SEGURO_CHUVA_FIGUEIRA,
  calcularRotaTangara,
  otimizarLoteEntregas,
  otimizarLoteEntregasComGeometriaViaria,
  gerarDeepLinksNavegacao,
  calcularBearing,
  calcularTelemetriaRota,
  exportarRotaGpx,
  exportarRotaKml,
  type RouteTelemetryEco,
  type RoutingProfile,
  type OptimalRouteResult,
  type RouteStep,
  type TangaraCriticalPoint,
  type BatchOptimizationResult,
  type BatchDeliveryOrder,
  type OptimizedStopInfo,
  type EstrategiaRoteirizacaoIa,
  type CategoriaTermica
} from "../../../shared/tangaraRoutingEngine";
import {
  tocarChimeInterfone,
  obterMelhorVozPtBr,
  falarVozHumana,
  DIALOGOS_COPILOT_ZUMA
} from "../lib/humanVoiceCopilot";

export interface DeliveryStep {
  instrucao: string;
  rua: string;
  distanciaMetros: number;
  manobra: "depart" | "continue" | "turn-right" | "turn-left" | "arrive" | "roundabout";
  icone?: string;
}

export interface DeliveryOrder {
  id: string;
  pedidoId: string;
  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
    bairro: string;
    complemento?: string;
    lat: number;
    lng: number;
  };
  itens: string;
  taxaEntrega: number;
  valorTotal: number;
  formaPagamento: string;
  status: "aguardando" | "em_rota" | "chegou_ao_local" | "entregue";
  codigoOtp: string;
  distanciaKm: number;
  tempoEstimadoMin: number;
  passosRota: DeliveryStep[];
  rotaGeometria: [number, number][];
  // Telemetria e Otimização da IA Kytto
  horarioPedido?: string;
  minutosEspera?: number;
  slaMaxMin?: number;
  categoriaTermica?: CategoriaTermica;
  ordemParada?: number;
  distanciaTrechoKm?: number;
  tempoTrechoMin?: number;
  tempoAcumuladoMin?: number;
  horarioPrevistoEntrega?: string;
  esperaTotalClienteMin?: number;
  temperaturaPreservadaPct?: number;
  statusTermico?: "quente_fumegante" | "fresco_preservado" | "temperatura_segura" | "risco_termico";
  badgeTermicoLabel?: string;
  corBadgeTermico?: string;
  statusSla?: "no_prazo" | "limite" | "urgente_atendido";
  satisfacaoPrevistaNps?: number;
  motivoDecisaoIa?: string;
}

// Síntese de Voz Nativa pt-BR
function falarInstrucaoVoz(texto: string) {
  falarVozHumana(texto, { rate: 1.02 }, true);
}

// ============================================================================
// LOTES DE ENTREGAS REAIS DE TANGARÁ DA SERRA - MT
// Suporta tanto o lote express (3 entregas) quanto o super lote de pico (10 entregas)
// ============================================================================

export const LOTE_EXPRESS_3_ENTREGAS: DeliveryOrder[] = [
  {
    id: "CORR-701",
    pedidoId: "ZUM-8841",
    cliente: {
      nome: "Thiago Silveira",
      telefone: "(65) 99981-3320",
      endereco: "Rua Júlio Martinez Benevides, 820",
      bairro: "Centro",
      complemento: "Apto 302 - Edifício Buritis",
      lat: -14.619800,
      lng: -57.489500,
    },
    itens: "Barca Especial 50 Pçs + 2x Coca Zero + 1x Hot Roll Nutella",
    taxaEntrega: 14.0,
    valorTotal: 184.0,
    formaPagamento: "Apple Pay (Pago Online)",
    status: "em_rota",
    codigoOtp: "4192",
    distanciaKm: 1.4,
    tempoEstimadoMin: 4,
    horarioPedido: "18:42",
    minutosEspera: 42,
    slaMaxMin: 45,
    categoriaTermica: "frio_nobre",
    passosRota: [
      { instrucao: "Saia do Zuma Oriental na Rua Celso Rosa Lima", rua: "Rua Celso Rosa Lima, 142-W", distanciaMetros: 120, manobra: "depart", icone: "🚀" },
      { instrucao: "Vire à direita na Avenida Brasil", rua: "Avenida Brasil", distanciaMetros: 420, manobra: "turn-right", icone: "➡️" },
      { instrucao: "Siga reto passando pela Praça dos Pioneiros", rua: "Avenida Brasil", distanciaMetros: 380, manobra: "continue", icone: "⬆️" },
      { instrucao: "Vire à esquerda na Rua Júlio Martinez Benevides", rua: "Rua Júlio Martinez Benevides", distanciaMetros: 350, manobra: "turn-left", icone: "⬅️" },
      { instrucao: "Chegada ao Edifício Buritis nº 820", rua: "Rua Júlio Martinez Benevides, 820", distanciaMetros: 100, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.62284, -57.49382],
      [-14.62311, -57.49361],
      [-14.62282, -57.49322],
      [-14.62226, -57.49250],
      [-14.62138, -57.49137],
      [-14.62138, -57.49136],
      [-14.62138, -57.49134],
      [-14.62136, -57.49130],
      [-14.62132, -57.49129],
      [-14.62131, -57.49130],
      [-14.62043, -57.49017],
      [-14.61989, -57.48943],
    ],
  },
  {
    id: "CORR-702",
    pedidoId: "ZUM-8845",
    cliente: {
      nome: "Dra. Camila Rocha",
      telefone: "(65) 99655-8899",
      endereco: "Av. Tancredo Neves, 1450",
      bairro: "Jardim Europa",
      complemento: "Clínica Harmonize",
      lat: -14.636000,
      lng: -57.498500,
    },
    itens: "Combo Salmão Lovers 24 Pçs + Temaki Filadélfia Sem Arroz",
    taxaEntrega: 12.0,
    valorTotal: 126.5,
    formaPagamento: "Cartão de Crédito na Entrega",
    status: "aguardando",
    codigoOtp: "7820",
    distanciaKm: 1.9,
    tempoEstimadoMin: 6,
    horarioPedido: "18:50",
    minutosEspera: 34,
    slaMaxMin: 45,
    categoriaTermica: "frio_nobre",
    passosRota: [
      { instrucao: "Saia da base Zuma pela Rua Celso Rosa Lima", rua: "Rua Celso Rosa Lima", distanciaMetros: 140, manobra: "depart", icone: "🚀" },
      { instrucao: "Acesse a Avenida Brasil sentido Sul", rua: "Avenida Brasil", distanciaMetros: 750, manobra: "continue", icone: "⬆️" },
      { instrucao: "Passe pela rotatória e pegue a Avenida Mauá", rua: "Avenida Mauá", distanciaMetros: 580, manobra: "roundabout", icone: "🔄" },
      { instrucao: "Chegada à Clínica Harmonize no Jardim Europa", rua: "Av. Tancredo Neves, 1450", distanciaMetros: 120, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.622915, -57.493922],
      [-14.623111, -57.493633],
      [-14.623500, -57.493200],
      [-14.626800, -57.495200],
      [-14.631500, -57.497500],
      [-14.636000, -57.498500],
    ],
  },
  {
    id: "CORR-703",
    pedidoId: "ZUM-8848",
    cliente: {
      nome: "Lucas Ferreira",
      telefone: "(65) 99877-1122",
      endereco: "Rua Seis, 410",
      bairro: "Jardim Tarumã",
      complemento: "Casa com portão preto",
      lat: -14.641500,
      lng: -57.502000,
    },
    itens: "2x Yakisoba Especial Filé e Frango + 1x Sunomono Salmão",
    taxaEntrega: 14.0,
    valorTotal: 118.0,
    formaPagamento: "Pix Sicredi (Pagar ao Entregador)",
    status: "aguardando",
    codigoOtp: "3309",
    distanciaKm: 3.2,
    tempoEstimadoMin: 8,
    horarioPedido: "18:46",
    minutosEspera: 38,
    slaMaxMin: 45,
    categoriaTermica: "quente_critico",
    passosRota: [
      { instrucao: "Saia do Zuma Oriental pela Rua Celso Rosa Lima", rua: "Rua Celso Rosa Lima", distanciaMetros: 140, manobra: "depart", icone: "🚀" },
      { instrucao: "Siga reto pelo corredor da Avenida Brasil", rua: "Avenida Brasil", distanciaMetros: 1100, manobra: "continue", icone: "⬆️" },
      { instrucao: "Vire à direita na Rua Alziro Zarur", rua: "Rua Alziro Zarur", distanciaMetros: 650, manobra: "turn-right", icone: "➡️" },
      { instrucao: "Chegada ao destino no Jardim Tarumã", rua: "Rua Seis, 410", distanciaMetros: 150, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.622915, -57.493922],
      [-14.623111, -57.493633],
      [-14.626800, -57.495200],
      [-14.631500, -57.497500],
      [-14.636000, -57.498500],
      [-14.641500, -57.502000],
    ],
  },
];

export const LOTE_PICO_10_ENTREGAS: DeliveryOrder[] = [
  ...LOTE_EXPRESS_3_ENTREGAS,
  {
    id: "CORR-704",
    pedidoId: "ZUM-8850",
    cliente: {
      nome: "Eng. Carlos Eduardo",
      telefone: "(65) 99933-4411",
      endereco: "Rua 24-A, 115",
      bairro: "Parque Universitário",
      complemento: "Sobrado esquina com a Rua 19",
      lat: -14.612000,
      lng: -57.481000,
    },
    itens: "Teppanyaki de Salmão com Legumes + 1x Porção de Guioza Frito (6 un)",
    taxaEntrega: 15.0,
    valorTotal: 142.0,
    formaPagamento: "Pix Sicredi (Pago Online)",
    status: "aguardando",
    codigoOtp: "5124",
    distanciaKm: 2.8,
    tempoEstimadoMin: 7,
    horarioPedido: "18:55",
    minutosEspera: 29,
    slaMaxMin: 45,
    categoriaTermica: "quente_critico",
    passosRota: [
      { instrucao: "Acesse a Rua 19 sentido Norte", rua: "Rua 19", distanciaMetros: 600, manobra: "continue", icone: "⬆️" },
      { instrucao: "Vire à direita na Av. Ismael José do Nascimento", rua: "Av. Ismael José do Nascimento", distanciaMetros: 850, manobra: "turn-right", icone: "➡️" },
      { instrucao: "Chegada ao Parque Universitário", rua: "Rua 24-A, 115", distanciaMetros: 120, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.622915, -57.493922],
      [-14.621200, -57.492800],
      [-14.618000, -57.488000],
      [-14.612000, -57.481000],
    ],
  },
  {
    id: "CORR-705",
    pedidoId: "ZUM-8852",
    cliente: {
      nome: "Mariana Albuquerque",
      telefone: "(65) 99812-7788",
      endereco: "Rua José Corsino, 320",
      bairro: "Vila Alta",
      complemento: "Residencial Flamboyant, Bloco B",
      lat: -14.629500,
      lng: -57.478000,
    },
    itens: "Carpaccio Trufado de Salmão + Uramaki Ebi Especial 16 Pçs",
    taxaEntrega: 13.0,
    valorTotal: 139.0,
    formaPagamento: "Apple Pay (Pago Online)",
    status: "aguardando",
    codigoOtp: "8812",
    distanciaKm: 2.1,
    tempoEstimadoMin: 5,
    horarioPedido: "18:58",
    minutosEspera: 26,
    slaMaxMin: 45,
    categoriaTermica: "frio_nobre",
    passosRota: [
      { instrucao: "Siga pela Av. Tancredo Neves sentido Leste", rua: "Av. Tancredo Neves", distanciaMetros: 950, manobra: "continue", icone: "⬆️" },
      { instrucao: "Passe pela Rotatória Lions e acesse a Rua das Palmeiras", rua: "Rua das Palmeiras", distanciaMetros: 420, manobra: "turn-left", icone: "⬅️" },
      { instrucao: "Chegada ao condomínio na Vila Alta", rua: "Rua José Corsino, 320", distanciaMetros: 110, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.622915, -57.493922],
      [-14.622000, -57.490500],
      [-14.630000, -57.482000],
      [-14.629500, -57.478000],
    ],
  },
  {
    id: "CORR-706",
    pedidoId: "ZUM-8855",
    cliente: {
      nome: "Dr. Marcelo Mendes",
      telefone: "(65) 99611-9900",
      endereco: "Rua 26, 780",
      bairro: "Jardim Shangri-lá",
      complemento: "Próximo à Praça Central do Shangri-lá",
      lat: -14.618000,
      lng: -57.512000,
    },
    itens: "Hot Roll Couve Crispy 12 Pçs + Yakisoba Nobre de Camarão",
    taxaEntrega: 15.0,
    valorTotal: 158.0,
    formaPagamento: "Cartão Débito na Entrega",
    status: "aguardando",
    codigoOtp: "6743",
    distanciaKm: 2.4,
    tempoEstimadoMin: 6,
    horarioPedido: "19:02",
    minutosEspera: 22,
    slaMaxMin: 45,
    categoriaTermica: "quente_critico",
    passosRota: [
      { instrucao: "Acesse a Rua 26 sentido Oeste em direção ao Shangri-lá", rua: "Rua 26 Oeste", distanciaMetros: 1100, manobra: "continue", icone: "⬆️" },
      { instrucao: "Chegada ao endereço residencial no Shangri-lá", rua: "Rua 26, 780", distanciaMetros: 100, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.622915, -57.493922],
      [-14.620000, -57.502000],
      [-14.618000, -57.512000],
    ],
  },
  {
    id: "CORR-707",
    pedidoId: "ZUM-8858",
    cliente: {
      nome: "Patrícia Ramos",
      telefone: "(65) 99944-2233",
      endereco: "Av. Lions Internacional, 2100",
      bairro: "Monte Líbano",
      complemento: "Condomínio Portal das Flores",
      lat: -14.632000,
      lng: -57.515000,
    },
    itens: "Poke Salmão Tropical + Shimeji Especial na Manteiga",
    taxaEntrega: 16.0,
    valorTotal: 115.0,
    formaPagamento: "Pix Sicredi (Pagar ao Entregador)",
    status: "aguardando",
    codigoOtp: "9021",
    distanciaKm: 3.5,
    tempoEstimadoMin: 8,
    horarioPedido: "19:06",
    minutosEspera: 18,
    slaMaxMin: 45,
    categoriaTermica: "misto",
    passosRota: [
      { instrucao: "Siga pelo corredor da Av. Lions Internacional sentido Sul", rua: "Av. Lions Internacional", distanciaMetros: 1200, manobra: "continue", icone: "⬆️" },
      { instrucao: "Chegada à portaria do Monte Líbano", rua: "Av. Lions Internacional, 2100", distanciaMetros: 150, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.618000, -57.512000],
      [-14.626000, -57.514000],
      [-14.632000, -57.515000],
    ],
  },
  {
    id: "CORR-708",
    pedidoId: "ZUM-8860",
    cliente: {
      nome: "Gustavo Henrique",
      telefone: "(65) 99899-5566",
      endereco: "Rua 19, 540",
      bairro: "Jardim Cidade Alta",
      complemento: "Próximo ao Campus da UNEMAT",
      lat: -14.645000,
      lng: -57.472000,
    },
    itens: "Barca Família Zuma 60 Pçs + Hot Roll Nutella Morango",
    taxaEntrega: 16.0,
    valorTotal: 220.0,
    formaPagamento: "Cartão de Crédito na Entrega",
    status: "aguardando",
    codigoOtp: "4432",
    distanciaKm: 3.8,
    tempoEstimadoMin: 9,
    horarioPedido: "19:10",
    minutosEspera: 14,
    slaMaxMin: 45,
    categoriaTermica: "frio_nobre",
    passosRota: [
      { instrucao: "Desça pela Av. Universitária sentido UNEMAT", rua: "Avenida Universitária", distanciaMetros: 1400, manobra: "continue", icone: "⬆️" },
      { instrucao: "Chegada ao destino no Jardim Cidade Alta", rua: "Rua 19, 540", distanciaMetros: 120, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.630000, -57.482000],
      [-14.638000, -57.476000],
      [-14.645000, -57.472000],
    ],
  },
  {
    id: "CORR-709",
    pedidoId: "ZUM-8863",
    cliente: {
      nome: "Juliana Castro",
      telefone: "(65) 99633-8822",
      endereco: "Rua Sebastião Barreto, 95",
      bairro: "Jardim dos Ipês",
      complemento: "Casa térrea com jardim",
      lat: -14.615000,
      lng: -57.473000,
    },
    itens: "Combinado Fresh Zuma 20 Pçs + 2x Suco Natural Laranja",
    taxaEntrega: 14.0,
    valorTotal: 98.0,
    formaPagamento: "Apple Pay (Pago Online)",
    status: "aguardando",
    codigoOtp: "1985",
    distanciaKm: 2.3,
    tempoEstimadoMin: 5,
    horarioPedido: "19:14",
    minutosEspera: 10,
    slaMaxMin: 45,
    categoriaTermica: "frio_nobre",
    passosRota: [
      { instrucao: "Siga pela Rua Júlio Martinez Benevides em direção aos Ipês", rua: "Rua Júlio Martinez Benevides", distanciaMetros: 900, manobra: "continue", icone: "⬆️" },
      { instrucao: "Chegada ao Jardim dos Ipês", rua: "Rua Sebastião Barreto, 95", distanciaMetros: 100, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.619800, -57.489500],
      [-14.617000, -57.481000],
      [-14.615000, -57.473000],
    ],
  },
  {
    id: "CORR-710",
    pedidoId: "ZUM-8867",
    cliente: {
      nome: "Roberto Nogueira",
      telefone: "(65) 99922-3377",
      endereco: "Av. Brasil Norte, 2890",
      bairro: "Tangará II",
      complemento: "Em frente à praça do Tangará II",
      lat: -14.605000,
      lng: -57.505000,
    },
    itens: "2x Temaki Salmão Completo Maçaricado + Coca-Cola Lata",
    taxaEntrega: 15.0,
    valorTotal: 86.0,
    formaPagamento: "Dinheiro (Troco para R$ 100)",
    status: "aguardando",
    codigoOtp: "7311",
    distanciaKm: 3.1,
    tempoEstimadoMin: 7,
    horarioPedido: "19:18",
    minutosEspera: 6,
    slaMaxMin: 45,
    categoriaTermica: "misto",
    passosRota: [
      { instrucao: "Acesse o corredor da Av. Brasil Norte", rua: "Avenida Brasil Norte", distanciaMetros: 1800, manobra: "continue", icone: "⬆️" },
      { instrucao: "Chegada ao bairro Tangará II", rua: "Av. Brasil Norte, 2890", distanciaMetros: 150, manobra: "arrive", icone: "🏁" },
    ],
    rotaGeometria: [
      [-14.621200, -57.492800],
      [-14.612000, -57.498000],
      [-14.605000, -57.505000],
    ],
  },
];

// O padrão do aplicativo agora carrega as 10 entregas de pico para otimização da IA Kytto
const INITIAL_DELIVERIES: DeliveryOrder[] = LOTE_PICO_10_ENTREGAS;


export function AppEntregador() {
  // Abas do App Minimalista
  const [activeTab, setActiveTab] = useState<"navegacao" | "pedidos" | "carteira" | "suporte">("navegacao");
  const [modoEscuroOled, setModoEscuroOled] = useState(false);

  // Perfil de Roteamento Selecionado
  const [perfilRota, setPerfilRota] = useState<RoutingProfile>("mais_rapida");
  const [providerRotaAtual, setProviderRotaAtual] = useState<string>("google_maps_routes");
  const [recalculandoRota, setRecalculandoRota] = useState(false);
  const [pontosCriticosAtivos, setPontosCriticosAtivos] = useState<TangaraCriticalPoint[]>([]);

  // Referências Leaflet & Canvas
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerMotoRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const polylineCasingRef = useRef<L.Polyline | null>(null);
  const polylineMasterClusterRef = useRef<L.Polyline | null>(null);
  const polylineCircuitoCompletoRef = useRef<L.Polyline | null>(null);
  const polylineCircuitoCasingRef = useRef<L.Polyline | null>(null);
  const [modoVisualizacaoRota, setModoVisualizacaoRota] = useState<"ativa" | "circuito_completo">("ativa");
  const [loteTipo, setLoteTipo] = useState<"10_entregas" | "3_entregas">("10_entregas");
  const [estrategiaIa, setEstrategiaIa] = useState<EstrategiaRoteirizacaoIa>("kytto_multiobjetivo");
  const markersClientesRef = useRef<L.Marker[]>([]);
  const markersPontosCriticosRef = useRef<L.Marker[]>([]);
  const floodLayersRef = useRef<L.Layer[]>([]);


  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);

  // Estados Operacionais
  const [corridas, setCorridas] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  const [corridaAtiva, setCorridaAtiva] = useState<DeliveryOrder>(INITIAL_DELIVERIES[0]);

  const handleAlternarLote = (tipo: "10_entregas" | "3_entregas") => {
    setLoteTipo(tipo);
    const novo = tipo === "10_entregas" ? LOTE_PICO_10_ENTREGAS : LOTE_EXPRESS_3_ENTREGAS;
    setCorridas(novo);
    setCorridaAtiva(novo[0]);
    setResultadoTsp(null);
    toast.info(`Sessão configurada para ${tipo === "10_entregas" ? "10 entregas de pico" : "3 entregas express"}`);
  };
  const [simulando, setSimulando] = useState(false);
  const [indicePonto, setIndicePonto] = useState(0);
  const [velocidade, setVelocidade] = useState(38);
  const [headingAngulo, setHeadingAngulo] = useState(45);
  const [gpsNativoAtivo, setGpsNativoAtivo] = useState(false);
  const [gpsPrecisaoMetros, setGpsPrecisaoMetros] = useState(2.1);
  const [vozAtiva, setVozAtiva] = useState(true);
  const [passoAtualIndex, setPassoAtualIndex] = useState(0);

  // Otimização TSP de Entregas Agrupadas
  const [resultadoTsp, setResultadoTsp] = useState<BatchOptimizationResult | null>(null);
  const [circuitoIniciado, setCircuitoIniciado] = useState(false);
  const [modalCircuitoFinalizado, setModalCircuitoFinalizado] = useState(false);
  const [modoCircuitoContinuo, setModoCircuitoContinuo] = useState(true);

  // Modal de Conclusão / Comprovação
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [formaPagamentoRecebida, setFormaPagamentoRecebida] = useState("apple_pay");
  const [otpDigitado, setOtpDigitado] = useState("");
  const [valorPagoDinheiro, setValorPagoDinheiro] = useState(200);
  const [fotoComprovanteAnexa, setFotoComprovanteAnexa] = useState(false);

  // Controles Avançados de Mapa & Telemetria
  const [tipoMapa, setTipoMapa] = useState<"ruas" | "satelite" | "escuro">("ruas");
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [velocidadeSimulacao, setVelocidadeSimulacao] = useState<1 | 2 | 5>(1);
  const [alertaRadarProximo, setAlertaRadarProximo] = useState<TangaraCriticalPoint | null>(null);
  const [modalPassosAberto, setModalPassosAberto] = useState(false);
  const [telemetriaEco, setTelemetriaEco] = useState<RouteTelemetryEco>(calcularTelemetriaRota(1.4, "mais_rapida"));

  // tRPC Queries & Mutations
  const { data: motoboysData, refetch: refetchMotoboy } = trpc.zuma.listMotoboys.useQuery();
  const calcularRotaMutation = trpc.zuma.calcularRotaTangara.useMutation();
  const advanceOrderStatusMutation = trpc.zuma.advanceOrderStatus.useMutation();
  const settleShiftMutation = trpc.zuma.settleMotoboyShift.useMutation();

  // Índice atual e próxima corrida da fila
  const currentIndex = corridas.findIndex((c) => c.id === corridaAtiva.id);
  const proximaCorrida = useMemo(() => {
    if (currentIndex === -1) return null;
    return (
      corridas.slice(currentIndex + 1).find((c) => c.status !== "entregue") ||
      corridas.find((c) => c.id !== corridaAtiva.id && c.status !== "entregue") ||
      null
    );
  }, [corridas, currentIndex, corridaAtiva.id]);

  // Progresso em tempo real do trecho ativo
  const progressoTrecho = useMemo(() => {
    if (!corridaAtiva?.rotaGeometria?.length) return 0;
    return Math.min(1, indicePonto / (corridaAtiva.rotaGeometria.length - 1 || 1));
  }, [indicePonto, corridaAtiva?.rotaGeometria?.length]);

  const distanciaRestanteKm = useMemo(() => {
    const totalKm = corridaAtiva?.distanciaKm || 1.4;
    return Math.max(0, Number((totalKm * (1 - progressoTrecho)).toFixed(2)));
  }, [corridaAtiva?.distanciaKm, progressoTrecho]);

  const tempoRestanteMin = useMemo(() => {
    const totalMin = corridaAtiva?.tempoEstimadoMin || 4;
    return Math.max(0, Math.ceil(totalMin * (1 - progressoTrecho)));
  }, [corridaAtiva?.tempoEstimadoMin, progressoTrecho]);

  // Função para recalcular rota com o motor inteligente de Tangará da Serra
  const atualizarRotaComMotor = async (
    destino: { lat: number; lng: number },
    perfil: RoutingProfile,
    origemCustom?: { lat: number; lng: number }
  ) => {
    setRecalculandoRota(true);
    try {
      const posOrigem = origemCustom || (markerMotoRef.current
        ? { lat: markerMotoRef.current.getLatLng().lat, lng: markerMotoRef.current.getLatLng().lng }
        : { lat: LAT_ZUMA, lng: LNG_ZUMA });

      if (origemCustom && markerMotoRef.current) {
        markerMotoRef.current.setLatLng([origemCustom.lat, origemCustom.lng]);
      }

      let rotaResult: OptimalRouteResult;
      try {
        rotaResult = await calcularRotaMutation.mutateAsync({
          origemLat: posOrigem.lat,
          origemLng: posOrigem.lng,
          destinoLat: destino.lat,
          destinoLng: destino.lng,
          perfil
        });
      } catch {
        rotaResult = await calcularRotaTangara(posOrigem, destino, perfil);
      }

      setCorridaAtiva(prev => ({
        ...prev,
        distanciaKm: rotaResult.distanciaKm,
        tempoEstimadoMin: rotaResult.tempoEstimadoMin,
        passosRota: rotaResult.passosRota as DeliveryStep[],
        rotaGeometria: rotaResult.rotaGeometria
      }));

      setProviderRotaAtual(rotaResult.provider);
      setPontosCriticosAtivos(rotaResult.pontosCriticosNoTrajeto);
      setTelemetriaEco(rotaResult.telemetriaEco || calcularTelemetriaRota(rotaResult.distanciaKm, perfil));

      if (vozAtiva) {
        const perfilNome = perfil === "mais_rapida" ? "mais rápida via avenidas" : perfil === "segura_chuva" ? "segura chuva sem baixadas" : "menor distância";
        falarInstrucaoVoz(`Rota recalculada: ${perfilNome}. ${rotaResult.distanciaKm} quilômetros, ${rotaResult.tempoEstimadoMin} minutos.`);
      }

      toast.success("🛣️ Rota Tangará Atualizada!", {
        description: `${rotaResult.distanciaKm} km · ~${rotaResult.tempoEstimadoMin} min via ${rotaResult.provider === "google_maps_routes" ? "Google Maps Routes Oficial" : rotaResult.provider === "osrm_live" ? "OpenStreetMap OSRM Live" : "Malha Viária Tangará"}`
      });
    } catch (err: any) {
      toast.error("Erro ao recalcular rota: " + (err.message || "Tente novamente"));
    } finally {
      setRecalculandoRota(false);
    }
  };

  // Alternar perfil de roteamento
  const handleTrocarPerfil = (novoPerfil: RoutingProfile) => {
    setPerfilRota(novoPerfil);
    if (corridaAtiva) {
      atualizarRotaComMotor({ lat: corridaAtiva.cliente.lat, lng: corridaAtiva.cliente.lng }, novoPerfil);
    }
    if (vozAtiva) {
      if (novoPerfil === "segura_chuva") {
        falarVozHumana(DIALOGOS_COPILOT_ZUMA.seguraChuva(), undefined, true);
      } else if (novoPerfil === "menor_distancia") {
        falarVozHumana(DIALOGOS_COPILOT_ZUMA.menorTrajeto(), undefined, true);
      } else {
        falarVozHumana(DIALOGOS_COPILOT_ZUMA.maisRapida(), undefined, true);
      }
    }
  };

  // Exportação GPX e KML da Rota Tangará da Serra
  const baixarGpx = () => {
    try {
      const gpxContent = exportarRotaGpx(
        `Zuma Pilot Tangara #${corridaAtiva.pedidoId} - ${corridaAtiva.cliente.nome}`,
        corridaAtiva.rotaGeometria
      );
      const blob = new Blob([gpxContent], { type: "application/gpx+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rota_zuma_${corridaAtiva.pedidoId}_tangara.gpx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Arquivo GPX exportado com sucesso para Garmin/GPS!");
    } catch (err: any) {
      toast.error("Erro ao gerar GPX: " + err.message);
    }
  };

  const baixarKml = () => {
    try {
      const kmlContent = exportarRotaKml(
        `Zuma Pilot Tangara #${corridaAtiva.pedidoId} - ${corridaAtiva.cliente.nome}`,
        corridaAtiva.rotaGeometria
      );
      const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rota_zuma_${corridaAtiva.pedidoId}_tangara.kml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Arquivo KML exportado com sucesso para Google Earth!");
    } catch (err: any) {
      toast.error("Erro ao gerar KML: " + err.message);
    }
  };

  // Recalcula a rota viária real de Tangará da Serra no carregamento inicial
  useEffect(() => {
    if (corridaAtiva) {
      atualizarRotaComMotor({ lat: corridaAtiva.cliente.lat, lng: corridaAtiva.cliente.lng }, perfilRota);
    }
  }, []);

  // Escuta despachos em tempo real vindos do KDS 2.0 Cozinha Inteligente
  useEffect(() => {
    const unsub = orderEventBus.subscribeDispatchToMotoboy(async dispatch => {
      toast.success(`🛵 Nova Corrida #${dispatch.pedidoId} Atribuída!`, {
        description: `${dispatch.cliente.nome} (${dispatch.cliente.bairro}) · Taxa: R$ ${dispatch.taxaEntrega.toFixed(2)}`
      });

      if (vozAtiva) {
        falarInstrucaoVoz(`Nova entrega recebida para ${dispatch.cliente.nome} no bairro ${dispatch.cliente.bairro}`);
      }

      // Calcula a rota viária real para o novo endereço em Tangará da Serra
      const rotaReal = await calcularRotaTangara(
        { lat: LAT_ZUMA, lng: LNG_ZUMA },
        { lat: dispatch.cliente.lat, lng: dispatch.cliente.lng },
        perfilRota
      );

      const novaCorrida: DeliveryOrder = {
        id: dispatch.id,
        pedidoId: dispatch.pedidoId,
        cliente: {
          nome: dispatch.cliente.nome,
          telefone: dispatch.cliente.telefone,
          endereco: dispatch.cliente.endereco,
          bairro: dispatch.cliente.bairro,
          complemento: dispatch.cliente.complemento,
          lat: dispatch.cliente.lat,
          lng: dispatch.cliente.lng,
        },
        itens: dispatch.itens,
        taxaEntrega: dispatch.taxaEntrega,
        valorTotal: dispatch.valorTotal,
        formaPagamento: dispatch.formaPagamento,
        status: dispatch.status,
        codigoOtp: dispatch.codigoOtp,
        distanciaKm: rotaReal.distanciaKm,
        tempoEstimadoMin: rotaReal.tempoEstimadoMin,
        passosRota: rotaReal.passosRota as DeliveryStep[],
        rotaGeometria: rotaReal.rotaGeometria
      };

      setCorridas(prev => {
        const jaExiste = prev.some(c => c.id === novaCorrida.id || c.pedidoId === novaCorrida.pedidoId);
        if (jaExiste) return prev;
        return [novaCorrida, ...prev];
      });
      setCorridaAtiva(novaCorrida);
    });

    return unsub;
  }, [vozAtiva, perfilRota]);

  // Inicializar Mapa Leaflet de Tangará da Serra
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      fadeAnimation: true,
    }).setView([LAT_ZUMA, LNG_ZUMA], 15);

    const layerPadrao = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Google Maps Routes (GCP kytto-514916) · Esri Street Map · Tangará da Serra",
    }).addTo(map);
    tileLayerRef.current = layerPadrao;

    // Marcador Sede Zuma Cozinha Oriental
    const iconeZuma = L.divIcon({
      className: "custom-zuma-marker",
      html: '<div style="background:#E8613A;color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 6px 16px rgba(232,97,58,0.5);">🍣</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    L.marker([LAT_ZUMA, LNG_ZUMA], { icon: iconeZuma })
      .addTo(map)
      .bindPopup(`<strong>Zuma Cozinha Oriental</strong><br>${ENDERECO_BASE_ZUMA}`);

    // Marcador Moto Entregador com Rotação Dinâmica de Rumo
    const iconeMoto = L.divIcon({
      className: "custom-moto-marker",
      html: `<div id="marker-moto-clean" style="background:#0284C7;color:white;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 6px 20px rgba(2,132,199,0.7);transition:transform 0.3s ease;transform:rotate(${headingAngulo}deg);">🛵</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
    const markerMoto = L.marker([LAT_ZUMA, LNG_ZUMA], { icon: iconeMoto, zIndexOffset: 1000 }).addTo(map);
    markerMotoRef.current = markerMoto;

    // Círculo de Precisão GNSS RTK
    const accuracyCircle = L.circle([LAT_ZUMA, LNG_ZUMA], {
      radius: 6,
      color: "#0284C7",
      fillColor: "#38BDF8",
      fillOpacity: 0.15,
      weight: 1.5,
    }).addTo(map);
    accuracyCircleRef.current = accuracyCircle;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Garante re-renderização perfeita do Leaflet ao alternar abas
  useEffect(() => {
    if (activeTab !== "carteira" && mapRef.current) {
      const t1 = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
      const t2 = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeTab]);


  // Alternância Dinâmica de Camada do Mapa (Ruas, Satélite HD e Modo Escuro OLED)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    let url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
    let attr = "Google Maps Routes (GCP kytto-514916) · Esri Street Map · Tangará da Serra";
    let maxZoom = 19;
    if (tipoMapa === "satelite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attr = "Esri World Imagery HD Satélite · Tangará da Serra";
      maxZoom = 19;
    } else if (tipoMapa === "escuro") {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attr = "OpenStreetMap · Malha Viária Tangará";
      maxZoom = 19;
    }
    const newTile = L.tileLayer(url, { maxZoom, attribution: attr }).addTo(map);
    tileLayerRef.current = newTile;
  }, [tipoMapa]);

  // Atualizar Rota, Marcadores de Destinos e Radares de Tangará da Serra
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !corridaAtiva) return;

    // Limpa marcadores anteriores
    markersClientesRef.current.forEach((m) => map.removeLayer(m));
    markersClientesRef.current = [];

    markersPontosCriticosRef.current.forEach((m) => map.removeLayer(m));
    markersPontosCriticosRef.current = [];

    floodLayersRef.current.forEach((l) => map.removeLayer(l));
    floodLayersRef.current = [];

    // Adiciona marcadores das entregas pendentes
    corridas.forEach((c, idx) => {
      const isAtiva = c.id === corridaAtiva.id;
      const iconeCliente = L.divIcon({
        className: "custom-cli-marker",
        html: `<div style="background:${isAtiva ? "#E8613A" : "#10B981"};color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2.5px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-weight:900;">${idx + 1}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const marker = L.marker([c.cliente.lat, c.cliente.lng], { icon: iconeCliente })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;line-height:1.4;min-width:160px;">
            <div style="font-weight:900;color:#0F172A;font-size:13px;">#${c.ordemParada || idx + 1} ${c.cliente.nome}</div>
            <div style="color:#64748B;font-size:11px;">${c.cliente.bairro} · ${c.cliente.endereco}</div>
            <div style="margin-top:4px;padding:3px 6px;border-radius:6px;background:${c.categoriaTermica === 'quente_critico' ? '#FEF3C7' : '#E0F2FE'};color:${c.categoriaTermica === 'quente_critico' ? '#B45309' : '#0369A1'};font-weight:bold;font-size:10px;display:inline-block;">
              ${c.badgeTermicoLabel || (c.categoriaTermica === 'quente_critico' ? '🔥 Quente (>68°C)' : '❄️ Salmão Nobre')}
            </div>
            <div style="margin-top:4px;color:#059669;font-weight:bold;font-size:11px;">
              Taxa: +R$ ${c.taxaEntrega.toFixed(2)} · ${c.minutosEspera ? `Espera: ${c.minutosEspera}m` : ''}
            </div>
          </div>
        `);
      markersClientesRef.current.push(marker);
    });

    // Área de Risco Crítico de Alagamento (Baixada do Córrego Figueira)
    const circuloAlagamento = L.circle([-14.6310, -57.4960], {
      radius: 200,
      color: "#EF4444",
      fillColor: "#EF4444",
      fillOpacity: perfilRota === "segura_chuva" ? 0.35 : 0.18,
      weight: 2,
      dashArray: "6, 6",
    }).addTo(map);
    circuloAlagamento.bindPopup(
      `<strong>🌊 Baixada do Córrego Figueira</strong><br>Ponto crítico de enxurrada e alagamento viário.<br><span style="color:${perfilRota === "segura_chuva" ? "#10B981" : "#EF4444"};font-weight:bold;">${perfilRota === "segura_chuva" ? "🛡️ Desvio ativo com sucesso" : "⚠️ Cuidado com poças e aquaplanagem"}</span>`
    );
    floodLayersRef.current.push(circuloAlagamento);

    // Se perfil Segura Chuva estiver ativo, adiciona marcador de waypoint elevado seguro
    if (perfilRota === "segura_chuva") {
      const iconeSeguro = L.divIcon({
        className: "custom-seguro-marker",
        html: `<div style="background:#10B981;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 4px 14px rgba(16,185,129,0.6);animation:bounce 2s infinite;">🛡️</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const markerSeguro = L.marker(
        [WAYPOINT_SEGURO_CHUVA_FIGUEIRA.lat, WAYPOINT_SEGURO_CHUVA_FIGUEIRA.lng],
        { icon: iconeSeguro }
      )
        .addTo(map)
        .bindPopup(
          "<strong>🛡️ Waypoint Seguro Elevado</strong><br>Avenida Tancredo Neves · Via drenada com asfalto de alta aderência contornando a baixada alagada."
        );
      floodLayersRef.current.push(markerSeguro);
    }

    // Adiciona pontos críticos viários (Alagamentos, Radares e Semáforos)
    TANGARA_PONTOS_CRITICOS.forEach((ponto) => {
      const isAlagamento = ponto.tipo === "alagamento_chuva";
      const isRadar = ponto.tipo === "radar";
      const bg = isAlagamento ? "#EF4444" : isRadar ? "#DC2626" : "#F59E0B";
      const emoji = isAlagamento ? "🌊" : isRadar ? "📷" : "🚦";
      const iconeCritico = L.divIcon({
        className: "custom-critico-marker",
        html: `<div style="background:${bg};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${emoji}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([ponto.lat, ponto.lng], { icon: iconeCritico })
        .addTo(map)
        .bindPopup(`<strong>${ponto.nome}</strong><br>${ponto.descricao}`);
      markersPontosCriticosRef.current.push(marker);
    });

    // Atualiza a Polilinha Encadeada do Cluster Master (se houver otimização ativa)
    if (polylineMasterClusterRef.current) {
      map.removeLayer(polylineMasterClusterRef.current);
      polylineMasterClusterRef.current = null;
    }
    if (polylineCircuitoCompletoRef.current) {
      map.removeLayer(polylineCircuitoCompletoRef.current);
      polylineCircuitoCompletoRef.current = null;
    }
    if (polylineCircuitoCasingRef.current) {
      map.removeLayer(polylineCircuitoCasingRef.current);
      polylineCircuitoCasingRef.current = null;
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (polylineCasingRef.current) {
      map.removeLayer(polylineCasingRef.current);
      polylineCasingRef.current = null;
    }

    if (modoVisualizacaoRota === "circuito_completo" && resultadoTsp) {
      const geomCompleta = (resultadoTsp.geometriaViariaDetalhada && resultadoTsp.geometriaViariaDetalhada.length > 2)
        ? resultadoTsp.geometriaViariaDetalhada
        : resultadoTsp.rotaEncadeadaGeometria;

      if (geomCompleta && geomCompleta.length > 2) {
        const casing = L.polyline(geomCompleta, {
          color: "#4C1D95",
          weight: 9,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        polylineCircuitoCasingRef.current = casing;

        const line = L.polyline(geomCompleta, {
          color: "#A855F7",
          weight: 5.5,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        polylineCircuitoCompletoRef.current = line;

        try {
          map.fitBounds(line.getBounds(), { padding: [40, 40] });
        } catch (e) {}
      }
    } else {
      // Modo Parada Ativa: desenha a rota individual da parada selecionada
      if (resultadoTsp && resultadoTsp.rotaEncadeadaGeometria && resultadoTsp.rotaEncadeadaGeometria.length > 2) {
        const masterLine = L.polyline(resultadoTsp.rotaEncadeadaGeometria, {
          color: "#10B981",
          weight: 3,
          opacity: 0.6,
          dashArray: "6, 8",
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        polylineMasterClusterRef.current = masterLine;
      }

      if (corridaAtiva.rotaGeometria && corridaAtiva.rotaGeometria.length > 0) {
        const casing = L.polyline(corridaAtiva.rotaGeometria, {
          color: "#0369A1",
          weight: 8,
          opacity: 0.65,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        polylineCasingRef.current = casing;

        const line = L.polyline(corridaAtiva.rotaGeometria, {
          color: perfilRota === "segura_chuva" ? "#10B981" : perfilRota === "menor_distancia" ? "#F59E0B" : "#38BDF8",
          weight: 4.5,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        polylineRef.current = line;

        try {
          map.fitBounds(line.getBounds(), { padding: [50, 50] });
        } catch (e) {}
      }
    }

    if (markerMotoRef.current && corridaAtiva.rotaGeometria.length > 0) {
      markerMotoRef.current.setLatLng(corridaAtiva.rotaGeometria[0]);
    }
    if (accuracyCircleRef.current && corridaAtiva.rotaGeometria.length > 0) {
      accuracyCircleRef.current.setLatLng(corridaAtiva.rotaGeometria[0]);
    }

    setIndicePonto(0);
    setPassoAtualIndex(0);
  }, [corridaAtiva, corridas, perfilRota, resultadoTsp, modoVisualizacaoRota]);

  // Simulação de Deslocamento com Rumo, Voz e Velocímetro
  useEffect(() => {
    if (!simulando || !corridaAtiva) return;

    const tickDelay = Math.max(160, Math.round(1100 / velocidadeSimulacao));
    const interval = setInterval(() => {
      setIndicePonto((prev) => {
        const next = prev + 1;
        const total = corridaAtiva.rotaGeometria.length;
        if (next >= total) {
          setSimulando(false);
          // Abre automaticamente o modal de confirmação de entrega ao chegar no destino!
          setModalFinalizar(true);

          const nomeCli = corridaAtiva.cliente.nome;
          const bairroCli = corridaAtiva.cliente.bairro;
          const numParada = corridaAtiva.ordemParada || (currentIndex + 1);

          toast.success(`🏁 Chegamos na Parada #${numParada}: ${nomeCli}!`, {
            description: `${bairroCli} · Confirme a entrega para traçar a rota da próxima parada imediatamente.`
          });

          if (vozAtiva) {
            falarVozHumana(
              `Chegamos no destino de ${nomeCli} no ${bairroCli}, parceiro! Confirma a entrega na tela que já vamos traçar a rota pra próxima parada!`,
              undefined,
              true
            );
          }
          return total - 1;
        }

        const pontoAtual = corridaAtiva.rotaGeometria[prev];
        const novoPonto = corridaAtiva.rotaGeometria[next];

        const bearing = calcularBearing(pontoAtual[0], pontoAtual[1], novoPonto[0], novoPonto[1]);
        setHeadingAngulo(bearing);

        if (markerMotoRef.current) {
          markerMotoRef.current.setLatLng(novoPonto);
          const el = document.getElementById("marker-moto-clean");
          if (el) {
            el.style.transform = `rotate(${Math.round(bearing)}deg)`;
          }
        }

        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng(novoPonto);
        }

        if (mapRef.current) {
          mapRef.current.panTo(novoPonto, { animate: true, duration: 0.9 });
        }

        // Detecção em tempo real de proximidade de radar
        const radar = TANGARA_PONTOS_CRITICOS.find(
          (p) => p.tipo === "radar" && Math.abs(p.lat - novoPonto[0]) < 0.0022 && Math.abs(p.lng - novoPonto[1]) < 0.0022
        );
        if (radar) {
          setAlertaRadarProximo(radar);
        } else {
          setAlertaRadarProximo(null);
        }

        const passoIdx = Math.min(
          Math.floor((next / total) * corridaAtiva.passosRota.length),
          corridaAtiva.passosRota.length - 1
        );

        if (passoIdx !== passoAtualIndex) {
          setPassoAtualIndex(passoIdx);
          const passo = corridaAtiva.passosRota[passoIdx];
          if (vozAtiva && passo) {
            falarInstrucaoVoz(passo.instrucao);
          }
        }

        setVelocidade(Math.floor(34 + Math.random() * 8));
        setGpsPrecisaoMetros(Number((1.8 + Math.random() * 0.7).toFixed(1)));

        return next;
      });
    }, tickDelay);

    return () => clearInterval(interval);
  }, [simulando, corridaAtiva, passoAtualIndex, vozAtiva, velocidadeSimulacao]);

  // Ativar GPS Real
  const alternarGpsReal = () => {
    if (gpsNativoAtivo) {
      setGpsNativoAtivo(false);
      toast.info("GPS Real desativado. Modo simulação ativo.");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsNativoAtivo(true);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsPrecisaoMetros(Number((accuracy || 2.4).toFixed(1)));

        if (markerMotoRef.current) markerMotoRef.current.setLatLng([latitude, longitude]);
        if (accuracyCircleRef.current) accuracyCircleRef.current.setLatLng([latitude, longitude]);
        if (mapRef.current) mapRef.current.setView([latitude, longitude], 17);
        toast.success(`GPS de Alta Precisão Conectado (±${(accuracy || 2.4).toFixed(1)}m)`);
      },
      (err) => {
        toast.error("GPS indisponível: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };


  // Centralizar na Base Zuma Oriental
  const centrarBaseZuma = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([LAT_ZUMA, LNG_ZUMA], 16, { animate: true });
  };

  // Enquadrar todas as 10 entregas no mapa de Tangará da Serra
  const centrarRotaGeral = () => {
    const map = mapRef.current;
    if (!map) return;
    setModoVisualizacaoRota("circuito_completo");
    const geom = (resultadoTsp?.geometriaViariaDetalhada && resultadoTsp.geometriaViariaDetalhada.length > 2)
      ? resultadoTsp.geometriaViariaDetalhada
      : resultadoTsp?.rotaEncadeadaGeometria;
    if (geom && geom.length > 2) {
      map.fitBounds(L.latLngBounds(geom), { padding: [40, 40], maxZoom: 15 });
    } else {
      const pontos: [number, number][] = [
        [LAT_ZUMA, LNG_ZUMA],
        ...corridas.map(c => [c.cliente.lat, c.cliente.lng] as [number, number])
      ];
      map.fitBounds(L.latLngBounds(pontos), { padding: [40, 40], maxZoom: 15 });
    }
  };

  // Focar suavemente em uma parada específica e abrir o popup
  const focarParadaNoMapa = (c: DeliveryOrder) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([c.cliente.lat, c.cliente.lng], 16, { duration: 0.8 });
    const m = markersClientesRef.current.find(mk => {
      const ll = mk.getLatLng();
      return Math.abs(ll.lat - c.cliente.lat) < 0.0001 && Math.abs(ll.lng - c.cliente.lng) < 0.0001;
    });
    if (m) {
      setTimeout(() => m.openPopup(), 850);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Definir como próxima entrega e ir para navegação
  const focarEIniciarEntrega = (c: DeliveryOrder) => {
    setCorridaAtiva(c);
    setModoVisualizacaoRota("ativa");
    setActiveTab("navegacao");
    focarParadaNoMapa(c);
  };

  // Otimização Multiponto IA Kytto Multiobjetivo (SLA + Térmico + Menor Trajeto + Combustível)
  const handleOtimizarRotaMultiponto = async () => {
    setRecalculandoRota(true);
    try {
      const posAtual = markerMotoRef.current
        ? { lat: markerMotoRef.current.getLatLng().lat, lng: markerMotoRef.current.getLatLng().lng }
        : { lat: LAT_ZUMA, lng: LNG_ZUMA };

      const batchInput: BatchDeliveryOrder[] = corridas.map(c => ({
        id: c.id,
        pedidoId: c.pedidoId,
        clienteNome: c.cliente.nome,
        endereco: c.cliente.endereco,
        bairro: c.cliente.bairro,
        lat: c.cliente.lat,
        lng: c.cliente.lng,
        taxaEntrega: c.taxaEntrega,
        horarioPedido: c.horarioPedido,
        minutosEspera: c.minutosEspera,
        slaMaxMin: c.slaMaxMin,
        categoriaTermica: c.categoriaTermica,
        itensDescricao: c.itens,
        valorTotal: c.valorTotal,
        telefone: c.cliente.telefone,
        complemento: c.cliente.complemento,
        codigoOtp: c.codigoOtp,
        formaPagamento: c.formaPagamento
      }));

      const resultado = await otimizarLoteEntregasComGeometriaViaria(posAtual, batchInput, estrategiaIa, perfilRota);
      setResultadoTsp(resultado);

      // Reordena e enriquece o array de corridas com os indicadores calculados pela IA Kytto
      const corridasReordenadas: DeliveryOrder[] = resultado.ordemOtimizada.map((opt, idx) => {
        const original = corridas.find(c => c.id === opt.id) || corridas[idx];
        return {
          ...original,
          ordemParada: opt.ordemParada,
          distanciaTrechoKm: opt.distanciaTrechoKm,
          tempoTrechoMin: opt.tempoTrechoMin,
          tempoAcumuladoMin: opt.tempoAcumuladoMin,
          horarioPrevistoEntrega: opt.horarioPrevistoEntrega,
          esperaTotalClienteMin: opt.esperaTotalClienteMin,
          temperaturaPreservadaPct: opt.temperaturaPreservadaPct,
          statusTermico: opt.statusTermico,
          badgeTermicoLabel: opt.badgeTermicoLabel,
          corBadgeTermico: opt.corBadgeTermico,
          statusSla: opt.statusSla,
          satisfacaoPrevistaNps: opt.satisfacaoPrevistaNps,
          motivoDecisaoIa: opt.motivoDecisaoIa,
          status: idx === 0 ? "em_rota" : original.status === "entregue" ? "entregue" : "aguardando"
        };
      });

      setCorridas(corridasReordenadas);
      if (corridasReordenadas.length > 0) {
        setCorridaAtiva(corridasReordenadas[0]);
      }

      setModoVisualizacaoRota("circuito_completo");
      setActiveTab("navegacao");

      toast.success("✨ Circuito IA dos 10 Pedidos Otimizado!", {
        description: `Economia de ${resultado.economiaKm} km (~${resultado.economiaMin} min). Traçado viário de 10 paradas ativo no mapa!`
      });

      if (vozAtiva) {
        falarVozHumana(
          DIALOGOS_COPILOT_ZUMA.otimizacaoTsp10(resultado.economiaKm, resultado.economiaMin, resultado.totalTaxas),
          undefined,
          true
        );
      }

      setTimeout(() => {
        const map = mapRef.current;
        if (!map) return;
        map.invalidateSize({ animate: false });
        const geom = (resultado.geometriaViariaDetalhada && resultado.geometriaViariaDetalhada.length > 2)
          ? resultado.geometriaViariaDetalhada
          : resultado.rotaEncadeadaGeometria;
        if (geom && geom.length > 2) {
          map.fitBounds(L.latLngBounds(geom), { padding: [40, 40] });
        }
      }, 200);
    } catch (err: any) {
      toast.error("Erro ao otimizar circuito com IA: " + (err.message || "Tente novamente"));
    } finally {
      setRecalculandoRota(false);
    }
  };

    // Canvas Assinatura Touch
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsSigning(true);
  };

  const drawSignature = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSigning) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#0284C7";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    setSignatureDone(true);
  };

  const stopDrawing = () => setIsSigning(false);

  const limparAssinatura = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDone(false);
  };

  // Iniciar Circuito Sequencial das 10 Paradas
  const handleIniciarCircuito = () => {
    setCircuitoIniciado(true);
    setModoCircuitoContinuo(true);
    const primeira = corridas[0];
    if (primeira) {
      setCorridaAtiva({ ...primeira, status: "em_rota" });
      setModoVisualizacaoRota("ativa");
      atualizarRotaComMotor(
        { lat: primeira.cliente.lat, lng: primeira.cliente.lng },
        perfilRota,
        { lat: LAT_ZUMA, lng: LNG_ZUMA }
      );
      focarParadaNoMapa(primeira);

      toast.success(`🚀 Circuito Iniciado! Rumo à Parada #1: ${primeira.cliente.nome}`, {
        description: `${primeira.cliente.bairro} · +R$ ${primeira.taxaEntrega.toFixed(2)}`
      });

      if (vozAtiva) {
        falarVozHumana(
          DIALOGOS_COPILOT_ZUMA.iniciarCircuito(corridas.length, primeira.cliente.nome, primeira.cliente.bairro),
          undefined,
          true
        );
      }

      // Inicia automaticamente o deslocamento em tempo real rumo à Parada 1
      setTimeout(() => {
        setIndicePonto(0);
        setPassoAtualIndex(0);
        setSimulando(true);
      }, 1200);
    }
  };

  // Retornar à Base Zuma Oriental após concluir todo o circuito
  const handleRetornarBase = () => {
    setModalCircuitoFinalizado(false);
    const posAtual = markerMotoRef.current
      ? { lat: markerMotoRef.current.getLatLng().lat, lng: markerMotoRef.current.getLatLng().lng }
      : { lat: corridaAtiva.cliente.lat, lng: corridaAtiva.cliente.lng };

    atualizarRotaComMotor({ lat: LAT_ZUMA, lng: LNG_ZUMA }, perfilRota, posAtual);
    centrarBaseZuma();
    toast.success("🏠 Rota de Retorno à Sede Zuma Traçada!", {
      description: "Tangará da Serra · Av. Brasil, 450 - Centro"
    });
    if (vozAtiva) {
      falarVozHumana(
        "Circuito finalizado com perfeição, parceiro! Rota de retorno para a base Zuma Oriental traçada. Bom descanso e te vejo no próximo turno!",
        undefined,
        true
      );
    }
  };

  // Finalização da Entrega
  const finalizarEntrega = async () => {
    if (otpDigitado && otpDigitado !== corridaAtiva.codigoOtp) {
      toast.error(`Código OTP incorreto! O código do cliente é: ${corridaAtiva.codigoOtp}`);
      return;
    }

    try {
      const numericOrderId = parseInt(corridaAtiva.pedidoId.replace(/\D/g, ""), 10);
      if (numericOrderId) {
        try {
          await advanceOrderStatusMutation.mutateAsync({ orderId: numericOrderId });
        } catch (e) {}
      }

      const posFinalAtual = { lat: corridaAtiva.cliente.lat, lng: corridaAtiva.cliente.lng };
      const paradaAtualNumero = corridaAtiva.ordemParada || (currentIndex + 1);

      const novasCorridas = corridas.map((c) =>
        c.id === corridaAtiva.id ? { ...c, status: "entregue" as const } : c
      );
      setCorridas(novasCorridas);
      setModalFinalizar(false);
      setSimulando(false);
      limparAssinatura();
      setOtpDigitado("");
      setFotoComprovanteAnexa(false);

      toast.success(`🎉 Entrega #${paradaAtualNumero} Concluída! Taxa de R$ ${corridaAtiva.taxaEntrega.toFixed(2)} creditada.`, {
        description: `Cliente ${corridaAtiva.cliente.nome} (${corridaAtiva.cliente.bairro}) notificado via WhatsApp.`
      });

      // Localiza a próxima parada da sequência do circuito
      const proxima =
        corridas.slice(currentIndex + 1).find((c) => c.status !== "entregue") ||
        novasCorridas.find((c) => c.status !== "entregue") ||
        null;

      if (proxima) {
        const proxIdx = corridas.findIndex((c) => c.id === proxima.id);
        const numeroParadaProx = proxima.ordemParada || (proxIdx + 1);

        setCorridaAtiva({
          ...proxima,
          status: "em_rota"
        });

        // Recalcula rota ponto-a-ponto da entrega atual até a próxima
        atualizarRotaComMotor(
          { lat: proxima.cliente.lat, lng: proxima.cliente.lng },
          perfilRota,
          posFinalAtual
        );

        focarParadaNoMapa(proxima);

        if (vozAtiva) {
          falarVozHumana(
            DIALOGOS_COPILOT_ZUMA.avancarParaProxima(
              paradaAtualNumero,
              corridas.length,
              proxima.cliente.nome,
              proxima.cliente.bairro,
              corridaAtiva.taxaEntrega
            ),
            undefined,
            true
          );
        }

        // Se o modo contínuo estiver ativo, já inicia o deslocamento em tempo real para a próxima parada!
        if (modoCircuitoContinuo) {
          setTimeout(() => {
            setIndicePonto(0);
            setPassoAtualIndex(0);
            setSimulando(true);
            toast.info(`🛵 Em deslocamento em tempo real para Parada #${numeroParadaProx}: ${proxima.cliente.nome}`, {
              description: `Traçado viário ativo de ${corridaAtiva.cliente.bairro} para ${proxima.cliente.bairro}`
            });
          }, 1400);
        }
      } else {
        // Circuito das 10 entregas finalizado com êxito!
        setModalCircuitoFinalizado(true);
        const totalTaxas = corridas.reduce((acc, c) => acc + c.taxaEntrega, 0);

        toast.success(`🏆 Circuito dos 10 Pedidos Concluído com Sucesso!`, {
          description: `Total de 10 entregas realizadas! Faturamento: R$ ${totalTaxas.toFixed(2)}`
        });

        if (vozAtiva) {
          falarVozHumana(
            DIALOGOS_COPILOT_ZUMA.circuitoCompletoFinalizado(corridas.length, totalTaxas),
            undefined,
            true
          );
        }
      }

      refetchMotoboy();
    } catch (e: any) {
      toast.error("Erro ao concluir entrega: " + (e.message || "Tente novamente"));
    }
  };

  // Enviar Mensagem Rápida WhatsApp
  const enviarChipWhatsapp = (mensagem: string) => {
    const phone = corridaAtiva?.cliente.telefone.replace(/\D/g, "");
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
    toast.success("WhatsApp aberto com mensagem de rota!");
  };

  // Exportar Rota em GPX para GPS dedicado / Garmin
  const handleExportarGpx = () => {
    if (!corridaAtiva || corridaAtiva.rotaGeometria.length === 0) return;
    const gpx = exportarRotaGpx(`Rota_${corridaAtiva.id}_${corridaAtiva.cliente.nome}`, corridaAtiva.rotaGeometria);
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rota_zuma_${corridaAtiva.id}.gpx`;
    a.click();
    toast.success("Arquivo GPX exportado para GPS/Garmin!", { icon: "📥" });
  };

  // Exportar Rota em KML para Google Earth / Maps
  const handleExportarKml = () => {
    if (!corridaAtiva || corridaAtiva.rotaGeometria.length === 0) return;
    const kml = exportarRotaKml(`Rota_${corridaAtiva.id}`, corridaAtiva.rotaGeometria);
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rota_zuma_${corridaAtiva.id}.kml`;
    a.click();
    toast.success("Arquivo KML exportado para Google Earth!", { icon: "🗺️" });
  };

  const passoAtual = corridaAtiva?.passosRota[passoAtualIndex] || corridaAtiva?.passosRota[0];

  const totalGanhosHoje = useMemo(() => {
    const concluidas = corridas.filter(c => c.status === "entregue");
    const soma = concluidas.reduce((acc, c) => acc + c.taxaEntrega, 0);
    return soma + 112.0;
  }, [corridas]);

  // Deep links de navegação para a entrega ativa
  const deepLinksAtivos = useMemo(() => {
    if (!corridaAtiva) return null;
    const waypoint = perfilRota === "segura_chuva" ? WAYPOINT_SEGURO_CHUVA_FIGUEIRA : undefined;
    return gerarDeepLinksNavegacao(
      { lat: LAT_ZUMA, lng: LNG_ZUMA },
      { lat: corridaAtiva.cliente.lat, lng: corridaAtiva.cliente.lng },
      waypoint
    );
  }, [corridaAtiva, perfilRota]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      modoEscuroOled ? "bg-black text-white" : "bg-[var(--surface2)] text-[var(--ink)]"
    } pb-20 sm:pb-8`}>
      
      {/* ============================================================== */}
      {/* 1. BARRA SUPERIOR MINIMALISTA & TELEMETRIA SLIM                */}
      {/* ============================================================== */}
      <header className={`sticky top-0 z-30 px-3 sm:px-6 py-2.5 backdrop-blur-md border-b transition-all ${
        modoEscuroOled ? "bg-black/85 border-slate-800" : "bg-[var(--surface)]/90 border-[var(--line)]"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Perfil & Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight">Carlos Silva</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-[var(--muted)] hidden sm:inline">CG 160 · QBM-4819</span>
              </div>
              <div className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                <span>±{gpsPrecisaoMetros}m RTK</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tangará da Serra</span>
              </div>
            </div>
          </div>

          {/* Abas de Navegação Minimalistas */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--line)]">
            <button
              onClick={() => setActiveTab("navegacao")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "navegacao" ? "bg-sky-600 text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>GPS</span>
            </button>
            <button
              onClick={() => setActiveTab("pedidos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "pedidos" ? "bg-sky-600 text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Fila ({corridas.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("carteira")}
              data-tab="carteira"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === "carteira" ? "bg-sky-600 text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Carteira</span>
            </button>
          </div>

          {/* Controles de Rápido Acesso */}
          <div className="flex items-center gap-1.5">
            {/* Voz Toggle */}
            <button
              onClick={() => {
                const novo = !vozAtiva;
                setVozAtiva(novo);
                toast.info(novo ? "Voz GPS Ativada" : "Voz Silenciada");
              }}
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                vozAtiva ? "bg-purple-500/15 text-purple-600 border-purple-500/30" : "border-[var(--line)] text-[var(--muted)]"
              }`}
              title={vozAtiva ? "Voz ligada" : "Voz desligada"}
            >
              {vozAtiva ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Tema Noturno / Diurno */}
            <button
              onClick={() => setModoEscuroOled(!modoEscuroOled)}
              className="p-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              title="Alternar Modo Noite / Dia"
            >
              {modoEscuroOled ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. ÁREA DE MAPA & NAVEGAÇÃO / FILA (SEMPRE MONTADA NO DOM)     */}
      {/* ============================================================== */}
      <div className={activeTab === "carteira" ? "hidden" : "max-w-4xl mx-auto p-2 sm:p-4 space-y-3"}>
        
        {/* BARRA DE CONTROLES DO MAPA TANGARÁ (100% EXTERNA AO MAPA - ZERO SOBREPOSIÇÃO) */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-2 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs overflow-x-auto scrollbar-none">
          {/* Esquerda: GPS RTK & Simulação */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={alternarGpsReal}
              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                gpsNativoAtivo
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>{gpsNativoAtivo ? "GPS RTK" : "Ativar GPS"}</span>
            </button>

            <button
              onClick={() => {
                if (!simulando) {
                  if (indicePonto >= corridaAtiva.rotaGeometria.length - 1) setIndicePonto(0);
                  setSimulando(true);
                } else {
                  setSimulando(false);
                }
              }}
              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                simulando
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
              }`}
            >
              {simulando ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{simulando ? "Pausar" : "Simular"}</span>
            </button>

            <button
              onClick={() => {
                setModoCircuitoContinuo(!modoCircuitoContinuo);
                if (!modoCircuitoContinuo) {
                  toast.success("🚀 Modo Encadeado Contínuo Ativado!", {
                    description: "Ao chegar em cada cliente, pedirá confirmação e traçará a rota para o próximo automaticamente."
                  });
                }
              }}
              className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                modoCircuitoContinuo
                  ? "bg-purple-600 text-white shadow-xs ring-1 ring-purple-300"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
              title="Avanço contínuo encadeado: traça rota 1->2, 2->3, 3->4 e assim por diante"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{modoCircuitoContinuo ? "Encadeado Ativo" : "Encadear Paradas"}</span>
            </button>

            {simulando && (
              <div className="flex items-center gap-0.5 bg-[var(--surface2)] p-0.5 rounded-xl border border-[var(--line)] text-[9px] font-bold">
                {([1, 2, 5] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVelocidadeSimulacao(v)}
                    className={`px-1 py-0.5 rounded-md font-mono transition cursor-pointer ${
                      velocidadeSimulacao === v ? "bg-sky-600 text-white font-black" : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Centro: Camadas do Mapa (Ruas, Satélite HD, OLED Escuro) */}
          <div className="flex items-center gap-0.5 bg-[var(--surface2)] p-0.5 rounded-xl border border-[var(--line)] text-[10px] font-bold shrink-0">
            {(["ruas", "satelite", "escuro"] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoMapa(tipo)}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  tipoMapa === tipo ? "bg-sky-600 text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {tipo === "ruas" ? "Ruas" : tipo === "satelite" ? "Satélite" : "OLED"}
              </button>
            ))}
          </div>

          {/* Direita: Enquadramento & Centralização */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={centrarRotaGeral}
              className="px-2 py-1 rounded-xl text-[11px] font-bold bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition flex items-center gap-1 cursor-pointer"
              title="Enquadrar todas as 10 entregas"
            >
              <LocateFixed className="w-3 h-3 text-sky-500" />
              <span>Rota Toda</span>
            </button>

            <button
              onClick={centrarBaseZuma}
              className="px-2 py-1 rounded-xl text-[11px] font-bold bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition flex items-center gap-1 cursor-pointer"
              title="Centralizar na Base Zuma Oriental"
            >
              <span>🍣 Base</span>
            </button>
          </div>
        </div>

        {/* SELETOR DE MODO DE VISUALIZAÇÃO: PARADA ATIVA VS CIRCUITO COMPLETO IA */}
        {resultadoTsp && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-purple-500/15 border border-purple-500/30 text-xs">
            <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Visualização do Traçado:</span>
              <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {modoVisualizacaoRota === "circuito_completo" ? "10 Paradas Ponto a Ponto" : `Parada #${corridaAtiva.ordemParada || 1}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => {
                  setModoVisualizacaoRota("ativa");
                  if (corridaAtiva?.rotaGeometria?.length) {
                    mapRef.current?.fitBounds(L.latLngBounds(corridaAtiva.rotaGeometria), { padding: [40, 40] });
                  }
                }}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                  modoVisualizacaoRota === "ativa"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                🎯 Parada Ativa (#{corridaAtiva.ordemParada || 1})
              </button>
              <button
                onClick={() => {
                  setModoVisualizacaoRota("circuito_completo");
                  const geom = resultadoTsp.geometriaViariaDetalhada || resultadoTsp.rotaEncadeadaGeometria;
                  if (geom && geom.length > 2) {
                    mapRef.current?.fitBounds(L.latLngBounds(geom), { padding: [40, 40] });
                  }
                }}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                  modoVisualizacaoRota === "circuito_completo"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Circuito Completo IA (10 Paradas Ponto a Ponto)</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTAINER DO MAPA LEAFLET: 100% LIMPO E LIVRE DE QUALQUER SOBREPOSIÇÃO */}
        <div className="relative rounded-2xl overflow-hidden border border-[var(--line)] shadow-sm bg-[var(--surface)]">
          <div ref={mapContainerRef} className="w-full h-[370px] sm:h-[450px] z-0" />

          {/* LIVE HUD OVERLAY DE NAVEGAÇÃO EM TEMPO REAL */}
          {activeTab === "navegacao" && corridaAtiva && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[500] pointer-events-auto">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* Lado Esquerdo: Manobra & Parada Ativa */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-md">
                    {passoAtual?.icone || (
                      passoAtual?.manobra === "turn-right" ? "➡️" : passoAtual?.manobra === "turn-left" ? "⬅️" : "⬆️"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>PARADA #{corridaAtiva.ordemParada || (currentIndex + 1)} · {corridaAtiva.cliente.bairro}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-black truncate text-white">
                      {corridaAtiva.cliente.nome}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono truncate">
                      Restante: {distanciaRestanteKm} km · ~{tempoRestanteMin} min {simulando && "• 🛵 Em tempo real"}
                    </div>
                  </div>
                </div>

                {/* Centro/Direita: Velocímetro & Botões de Ação Imediata */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 font-mono shrink-0">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-xs font-black text-amber-300">{velocidade} km/h</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSimulando(!simulando);
                        if (!simulando) toast.info("Deslocamento em tempo real iniciado!");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-sm ${
                        simulando
                          ? "bg-amber-500 hover:bg-amber-600 text-black"
                          : "bg-sky-600 hover:bg-sky-500 text-white"
                      }`}
                      title={simulando ? "Pausar deslocamento" : "Iniciar deslocamento em tempo real"}
                    >
                      {simulando ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="hidden xs:inline">{simulando ? "Pausar" : "Andar"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalFinalizar(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md animate-pulse"
                      title="Confirmar chegada e entrega no cliente"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cheguei / Confirmar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD DE TELEMETRIA DO CIRCUITO COMPLETO DOS 10 PEDIDOS (TSP IA) */}
        {modoVisualizacaoRota === "circuito_completo" && resultadoTsp && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-teal-500/15 border border-purple-500/30 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-purple-700 dark:text-purple-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> Circuito Completo dos 10 Pedidos (TSP IA)
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-purple-600 text-white">
                Economia: -{resultadoTsp.economiaKm} km (~{resultadoTsp.economiaMin} min)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">DISTÂNCIA TOTAL</div>
                <div className="font-black text-sm text-purple-600 dark:text-purple-400 mt-0.5">{resultadoTsp.distanciaTotalKm} km</div>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">TEMPO TOTAL IA</div>
                <div className="font-black text-sm text-sky-600 dark:text-sky-400 mt-0.5">~{resultadoTsp.tempoTotalMin} min</div>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">TOTAL EM TAXAS</div>
                <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">R$ {resultadoTsp.totalTaxas.toFixed(2)}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">ECONOMIA GASOLINA</div>
                <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">~{resultadoTsp.litrosGasolinaEconomizados} L (-R$ {resultadoTsp.economiaReaisCombustivel.toFixed(2)})</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-purple-500/20">
              <span>Mostrando rota viária contínua passando por todas as 10 entregas em Tangará da Serra.</span>
              <button
                onClick={() => {
                  setModoVisualizacaoRota("ativa");
                  if (corridaAtiva?.rotaGeometria?.length) {
                    mapRef.current?.fitBounds(L.latLngBounds(corridaAtiva.rotaGeometria), { padding: [40, 40] });
                  }
                }}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer shrink-0 ml-2"
              >
                Voltar à Parada #{corridaAtiva.ordemParada || 1} →
              </button>
            </div>

            {/* Ação de Início do Circuito */}
            <div className="pt-2 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs text-purple-900 dark:text-purple-200">
                <span className="font-bold">Pronto para rodar?</span> Inicie o circuito para navegar parada a parada com Copilot por voz.
              </div>
              <button
                type="button"
                onClick={handleIniciarCircuito}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Iniciar Circuito (Ir para Parada #1 · {corridas[0]?.cliente.nome})</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA: FILA DE PEDIDOS & OTIMIZADOR MULTIOBJETIVO IA KYTTO */}
        {activeTab === "pedidos" && (
          <div className="space-y-4 pt-1">
            {/* TOPO COM TÍTULO E SELETOR DE LOTE (10 ENTREGAS VS 3 ENTREGAS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[var(--ink)]">Fila de Entregas da Sessão</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white font-mono font-black text-xs">
                  {corridas.length} Pedidos
                </span>
                {resultadoTsp && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> IA Kytto Ativa
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Roteamento inteligente de Tangará da Serra com preservação de SLA, temperatura e economia de combustível
              </p>
            </div>

            {/* Alternador de Carga: 10 Entregas (Pico) vs 3 Entregas (Express) */}
            <div className="flex items-center gap-1 p-1 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] self-start sm:self-auto">
              <button
                onClick={() => handleAlternarLote("10_entregas")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  loteTipo === "10_entregas"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Super Lote (10 Entregas)
              </button>
              <button
                onClick={() => handleAlternarLote("3_entregas")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  loteTipo === "3_entregas"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Lote Express (3)
              </button>
            </div>
          </div>

          {/* PAINEL DE ESTRATÉGIAS DA IA KYTTO */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[var(--ink)] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-500" /> Estratégia de Roteamento da IA Kytto:
              </span>
              <span className="text-[10px] font-mono text-[var(--muted)] hidden sm:inline">
                Tangará da Serra · Frota Zuma
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setEstrategiaIa("kytto_multiobjetivo")}
                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                  estrategiaIa === "kytto_multiobjetivo"
                    ? "bg-sky-500/15 border-sky-500 ring-1 ring-sky-500/30 text-sky-700 dark:text-sky-300"
                    : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span>🧠 Multiobjetivo</span>
                </div>
                <div className="text-[10px] mt-0.5 leading-tight opacity-80">
                  Equilíbrio ouro: SLA + Térmico + Menor Trajeto
                </div>
              </button>

              <button
                onClick={() => setEstrategiaIa("prioridade_sla_fifo")}
                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                  estrategiaIa === "prioridade_sla_fifo"
                    ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30 text-amber-700 dark:text-amber-300"
                    : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span>⏱️ Prioridade SLA</span>
                </div>
                <div className="text-[10px] mt-0.5 leading-tight opacity-80">
                  Pedido solicitado primeiro atendido primeiro
                </div>
              </button>

              <button
                onClick={() => setEstrategiaIa("termico_frescor")}
                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                  estrategiaIa === "termico_frescor"
                    ? "bg-rose-500/15 border-rose-500 ring-1 ring-rose-500/30 text-rose-700 dark:text-rose-300"
                    : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span>🔥 Qualidade Térmica</span>
                </div>
                <div className="text-[10px] mt-0.5 leading-tight opacity-80">
                  Pratos quentes &gt;68°C e salmão nobre
                </div>
              </button>

              <button
                onClick={() => setEstrategiaIa("menor_distancia")}
                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                  estrategiaIa === "menor_distancia"
                    ? "bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <div className="text-xs font-black flex items-center gap-1">
                  <span>⛽ Menor Distância</span>
                </div>
                <div className="text-[10px] mt-0.5 leading-tight opacity-80">
                  Máxima economia de gasolina na CG 160
                </div>
              </button>
            </div>

            {/* BOTÃO PRINCIPAL DE DISPARO DA IA KYTTO */}
            <button
              onClick={handleOtimizarRotaMultiponto}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 hover:from-sky-500 hover:via-indigo-500 hover:to-amber-400 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ IAKytto Roteirizar Lote ({corridas.length} Entregas)</span>
            </button>
          </div>

          {/* TELEMETRIA EXECUTIVA DA IA KYTTO (QUANDO OTIMIZADO) */}
          {resultadoTsp && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-teal-500/15 border border-emerald-500/30 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300 border-b border-emerald-500/20 pb-2">
                <span className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" /> Rota Inteligente Calculada para {corridas.length} Entregas!
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-600 text-white self-start sm:self-auto">
                  Economia: -{resultadoTsp.economiaKm} km (~{resultadoTsp.economiaMin} min)
                </span>
              </div>

              {/* 4 CARDS DE TELEMETRIA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <span>⛽ Combustível CG 160</span>
                  </div>
                  <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ~{resultadoTsp.litrosGasolinaEconomizados} L (-R$ {resultadoTsp.economiaReaisCombustivel.toFixed(2)})
                  </div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5">{resultadoTsp.distanciaTotalKm} km total</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <span>⏱️ Pontualidade SLA</span>
                  </div>
                  <div className="font-black text-sm text-sky-600 dark:text-sky-400 mt-0.5">
                    {resultadoTsp.pontualidadeSlaPct}% no Prazo
                  </div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5">Espera max: {resultadoTsp.tempoMaximoEsperaClienteMin}m</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <span>🔥 Qualidade Térmica</span>
                  </div>
                  <div className="font-black text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                    {resultadoTsp.conformidadeTermicaPct}% Alimentos
                  </div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5">Quente &gt;68°C / Fresco</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-black/50 border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <span>💰 Taxas a Receber</span>
                  </div>
                  <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    R$ {resultadoTsp.totalTaxas.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5">~{resultadoTsp.tempoTotalMin} min de rodada</div>
                </div>
              </div>

              {/* JUSTIFICATIVA EXECUTIVA DA IA KYTTO */}
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-black/60 border border-[var(--line)] text-xs text-[var(--ink)] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-black text-sky-600 dark:text-sky-400">Diagnóstico da IA Kytto:</span>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">{resultadoTsp.explicacaoGeralIa}</p>
                </div>
              </div>
            </div>
          )}

          {/* LISTA DOS CARDS DAS ENTREGAS */}
          <div className="space-y-2.5">
            {corridas.map((c, idx) => {
              const isAtiva = c.id === corridaAtiva.id;
              const espera = c.minutosEspera || 20;
              const isSlaCritico = espera >= 35;
              const isQuenteCritico = c.categoriaTermica === "quente_critico";

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setCorridaAtiva(c);
                    atualizarRotaComMotor({ lat: c.cliente.lat, lng: c.cliente.lng }, perfilRota);
                    setActiveTab("navegacao");
                    toast.info(`Navegando para #${c.ordemParada || idx + 1} ${c.cliente.nome}`);
                  }}
                  className={`p-3.5 sm:p-4 rounded-3xl border transition cursor-pointer ${
                    isAtiva 
                      ? "bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/30 shadow-md" 
                      : "bg-[var(--surface)] border-[var(--line)] hover:border-sky-400 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Círculo com número da parada */}
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs ${
                        isAtiva
                          ? "bg-sky-600 text-white ring-2 ring-sky-300"
                          : "bg-black/10 dark:bg-white/10 text-[var(--ink)]"
                      }`}>
                        {c.ordemParada || idx + 1}
                      </span>

                      <div className="space-y-1.5">
                        {/* Linha 1: Nome do Cliente + Badges de Status */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-black text-sm text-[var(--ink)]">{c.cliente.nome}</span>
                          {isAtiva && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider">
                              Em Andamento
                            </span>
                          )}
                          {/* Badge de Horário / Antiguidade do Pedido */}
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border flex items-center gap-1 ${
                            isSlaCritico
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>Solicitado há {espera} min ({c.horarioPedido || "18:50"})</span>
                          </span>

                          {/* Badge Térmico */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            c.corBadgeTermico || (isQuenteCritico 
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" 
                              : "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30")
                          }`}>
                            {c.badgeTermicoLabel || (isQuenteCritico ? "🔥 Quente Perfeito (>68°C)" : "❄️ Salmão Fresco Nobre")}
                          </span>

                          {/* Previsão de Entrega (ETA) */}
                          {c.horarioPrevistoEntrega && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold border border-sky-500/20">
                              ETA: {c.horarioPrevistoEntrega}
                            </span>
                          )}
                        </div>

                        {/* Linha 2: Endereço completo e bairro */}
                        <div className="text-xs text-[var(--muted)] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{c.cliente.bairro} · {c.cliente.endereco} {c.cliente.complemento ? `(${c.cliente.complemento})` : ""}</span>
                        </div>

                        {/* Linha 3: Itens gastronômicos */}
                        <div className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-500/5 p-1.5 rounded-xl border border-sky-500/10 line-clamp-1">
                          🍱 {c.itens}
                        </div>

                        {/* Linha 4: Motivo da Decisão da IA Kytto (se houver) */}
                        {c.motivoDecisaoIa && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span><strong>IA Kytto:</strong> {c.motivoDecisaoIa}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lado Direito: Taxa e tempo */}
                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +R$ {c.taxaEntrega.toFixed(2)}
                      </span>
                      <div className="text-[11px] font-mono text-[var(--muted)]">
                        {c.distanciaTrechoKm ? `${c.distanciaTrechoKm} km` : `${c.distanciaKm} km`} · ~{c.tempoTrechoMin ? `${c.tempoTrechoMin} min` : `${c.tempoEstimadoMin} min`}
                      </div>
                      {c.satisfacaoPrevistaNps && (
                        <div className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          ⭐ {c.satisfacaoPrevistaNps}% NPS
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA: NAVEGAÇÃO GPS DA PARADA ATIVA */}
        {activeTab === "navegacao" && (
          <div className="space-y-3 pt-1">
            {/* BANNER CTA: INICIAR CIRCUITO SEQUENCIAL DOS 10 PEDIDOS */}
            {!circuitoIniciado && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black flex items-center gap-1.5 text-sm sm:text-base">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Circuito dos 10 Pedidos Otimizado
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                    Tangará da Serra
                  </span>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">
                  A rota viária contínua foi calculada pela IA Kytto. Inicie o circuito para navegar automaticamente da primeira à última entrega com confirmação em cada parada e instruções por voz humanizada.
                </p>
                <button
                  type="button"
                  onClick={handleIniciarCircuito}
                  className="w-full py-3.5 rounded-2xl bg-white text-purple-900 font-black text-sm shadow-md hover:bg-purple-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-purple-900 text-purple-900" />
                  <span>Iniciar Circuito (Ir para Parada #1 · {corridas[0]?.cliente.nome})</span>
                </button>
              </div>
            )}

            {/* STEPPER & BARRA DE PROGRESSO DO CIRCUITO DAS 10 ENTREGAS */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-black text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Circuito Encadeado
                  </span>
                  <span className="text-[var(--ink)] font-mono">
                    {corridas.filter((c) => c.status === "entregue").length} de {corridas.length} Entregues
                  </span>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    R$ {corridas.filter((c) => c.status === "entregue").reduce((acc, c) => acc + c.taxaEntrega, 0).toFixed(2)}
                  </span>
                  <span className="text-[var(--muted)]"> / R$ {corridas.reduce((acc, c) => acc + c.taxaEntrega, 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Barra de Progresso Visual */}
              <div className="w-full h-2 rounded-full bg-[var(--surface2)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{
                    width: `${(corridas.filter((c) => c.status === "entregue").length / corridas.length) * 100}%`
                  }}
                />
              </div>

              {/* Stepper Horizontal Scrollável com as 10 Paradas */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {corridas.map((c, idx) => {
                  const isEntregue = c.status === "entregue";
                  const isAtiva = c.id === corridaAtiva.id;
                  const numero = c.ordemParada || idx + 1;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCorridaAtiva(c);
                        focarParadaNoMapa(c);
                      }}
                      className={`shrink-0 px-2.5 py-1.5 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer ${
                        isAtiva
                          ? "bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-400/40"
                          : isEntregue
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border-[var(--line)]"
                      }`}
                      title={`Parada #${numero} - ${c.cliente.nome} (${c.cliente.bairro})`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] ${
                        isAtiva
                          ? "bg-white text-sky-700"
                          : isEntregue
                          ? "bg-emerald-600 text-white"
                          : "bg-[var(--line)] text-[var(--ink)]"
                      }`}>
                        {isEntregue ? "✓" : numero}
                      </div>
                      <div className="text-[11px] leading-tight">
                        <div className="font-bold truncate max-w-[90px]">{c.cliente.nome.split(" ")[0]}</div>
                        <div className="text-[9px] opacity-80 truncate max-w-[90px]">{c.cliente.bairro}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELETOR DE PERFIL DE ROTA VIÁRIA (MAIS RÁPIDA vs MENOR DISTÂNCIA vs SEGURA CHUVA) */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-[var(--line)] text-xs font-bold">
              <button
                onClick={() => handleTrocarPerfil("mais_rapida")}
                disabled={recalculandoRota}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  perfilRota === "mais_rapida"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Mais Rápida (Avenidas)</span>
              </button>

              <button
                onClick={() => handleTrocarPerfil("menor_distancia")}
                disabled={recalculandoRota}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  perfilRota === "menor_distancia"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Menor Trajeto (Atalhos)</span>
              </button>

              <button
                onClick={() => handleTrocarPerfil("segura_chuva")}
                disabled={recalculandoRota}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  perfilRota === "segura_chuva"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-cyan-200" />
                <span>Segura Chuva (100% Asfalto)</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{providerRotaAtual === "osrm_live" ? "OSRM · OpenStreetMap" : "Grafo Tangará Standby"}</span>
            </div>
          </div>

          {/* ALERTA DE RADARES / PONTOS CRÍTICOS DETECTADOS NA ROTA */}
          {pontosCriticosAtivos.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold">Atenção no trajeto:</span>
                <span className="line-clamp-1">{pontosCriticosAtivos[0].nome} ({pontosCriticosAtivos[0].descricao})</span>
              </div>
              {pontosCriticosAtivos[0].velocidadeMaximaKmH && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-mono font-black text-[10px] shrink-0">
                  Máx {pontosCriticosAtivos[0].velocidadeMaximaKmH} km/h
                </span>
              )}
            </div>
          )}

          {/* BANNER SEGURA CHUVA ATIVO */}
          {perfilRota === "segura_chuva" && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                  🛡️
                </div>
                <div>
                  <div className="font-black text-xs flex items-center gap-1.5">
                    <span>Modo Segura Chuva Ativo · Desvio Pluvial Inteligente</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-600/30 text-[10px] font-mono">100% Asfalto Drenado</span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    Baixada do Córrego Figueira e Linha 11 contornadas via Av. Tancredo Neves. Zero risco de aquaplanagem e enxurrada.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right font-mono">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Segurança</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-300">99.4%</span>
              </div>
            </div>
          )}

          {/* BANNER MENOR TRAJETO ATIVO */}
          {perfilRota === "menor_distancia" && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                  📐
                </div>
                <div>
                  <div className="font-black text-xs flex items-center gap-1.5">
                    <span>Menor Trajeto Viário Otimizado</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-600/30 text-[10px] font-mono">Malha Viária Real</span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    Roteamento estrito por quadras urbanas e esquinas de Tangará da Serra. Sem diagonais nem cortes aéreos.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right font-mono">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">Extensão</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-300">{corridaAtiva.distanciaKm} km</span>
              </div>
            </div>
          )}

          {/* BANNER FLUTUANTE DE MANOBRA (Apple Maps / Minimalist Driver UI) */}
          <div className={`rounded-2xl border p-3 sm:p-4 shadow-sm transition flex items-center justify-between gap-3 ${
            modoEscuroOled 
              ? "bg-slate-900/90 border-slate-800 text-white" 
              : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
                {passoAtual?.icone || (
                  passoAtual?.manobra === "turn-right"
                    ? "➡️"
                    : passoAtual?.manobra === "turn-left"
                    ? "⬅️"
                    : passoAtual?.manobra === "arrive"
                    ? "🏁"
                    : passoAtual?.manobra === "roundabout"
                    ? "🔄"
                    : "⬆️"
                )}
              </div>
              <div>
                <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <span>Em {passoAtual?.distanciaMetros || 120}m</span>
                  <span>•</span>
                  <span>Rumo {Math.round(headingAngulo)}°</span>
                  <span>•</span>
                  <span className="uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10">
                    {perfilRota.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black leading-tight line-clamp-1">
                  {passoAtual?.instrucao}
                </div>
                <div className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                  {passoAtual?.rua}
                </div>
                <button
                  onClick={() => setModalPassosAberto(true)}
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer mt-1"
                >
                  <ListOrdered className="w-3 h-3" />
                  <span>Ver {corridaAtiva.passosRota.length} etapas curva a curva</span>
                </button>
              </div>
            </div>

            {/* Velocímetro & ETA Pills */}
            <div className="flex flex-col items-end shrink-0 gap-1 font-mono">
              <div className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-black text-xs">
                ⚡ {velocidade} km/h
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                ~{corridaAtiva?.tempoEstimadoMin} min ({corridaAtiva?.distanciaKm} km)
              </div>
            </div>
          </div>

          {/* ALERTA VISUAL DE RADAR EM TEMPO REAL */}
          {alertaRadarProximo && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black flex items-center justify-between gap-3 shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>📷 ATENÇÃO: Radar {alertaRadarProximo.velocidadeMaximaKmH} km/h detectado à frente! Reduza a velocidade.</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-black/30 font-mono text-[10px] shrink-0">
                LIMITE DA VIA
              </span>
            </div>
          )}
            {/* CARD DE INFORMAÇÕES DA ENTREGA & NAVEGAÇÃO EXTERNA (Waze, Google Maps, Apple Maps) */}
          <div className={`p-4 rounded-2xl border shadow-sm space-y-3 transition ${
            modoEscuroOled ? "bg-slate-900 border-slate-800" : "bg-[var(--surface)] border-[var(--line)]"
          }`}>
            {/* Linha 1: Cliente e Taxa */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                  Destinatário · {corridaAtiva.cliente.bairro}
                </span>
                <h3 className="text-base font-black text-[var(--ink)] leading-tight">
                  {corridaAtiva.cliente.nome}
                </h3>
                <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="line-clamp-1">{corridaAtiva.cliente.endereco}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs border border-emerald-500/30">
                  +R$ {corridaAtiva.taxaEntrega.toFixed(2)}
                </span>
                <div className="text-[10px] text-[var(--muted)] mt-1 font-mono">
                  Total Pedido: R$ {corridaAtiva.valorTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Chips Rápidos de Comunicação WhatsApp */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={() => enviarChipWhatsapp("Olá! Já retirei seu pedido no Zuma Oriental e estou a caminho!")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 whitespace-nowrap cursor-pointer transition"
              >
                💬 A caminho
              </button>
              <button
                onClick={() => enviarChipWhatsapp("Chegando em 2 minutos ao seu endereço!")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 whitespace-nowrap cursor-pointer transition"
              >
                ⏱️ Chego em 2 min
              </button>
              <button
                onClick={() => enviarChipWhatsapp("Estou em frente ao seu portão/prédio!")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 whitespace-nowrap cursor-pointer transition"
              >
                📍 Estou no portão
              </button>
              <button
                onClick={() => enviarChipWhatsapp(`Por favor, tenha em mãos seu código de segurança: ${corridaAtiva.codigoOtp}`)}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold border border-sky-500/20 whitespace-nowrap cursor-pointer transition"
              >
                🔐 Solicitar OTP
              </button>
            </div>

            {/* Botões de Ação Externa (Google Maps GPS, Waze, Apple Maps, Ligar) */}
            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              <a
                href={deepLinksAtivos?.googleMaps || `https://www.google.com/maps/dir/?api=1&origin=${LAT_ZUMA},${LNG_ZUMA}&destination=${corridaAtiva.cliente.lat},${corridaAtiva.cliente.lng}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Abrir no Google Maps com Navegação Passo a Passo"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                <span>Google Maps</span>
              </a>
              <a
                href={deepLinksAtivos?.waze || `https://waze.com/ul?ll=${corridaAtiva.cliente.lat},${corridaAtiva.cliente.lng}&navigate=yes`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Abrir no Waze com Radares e Alertas de Tangará"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
                <span>Waze</span>
              </a>
              <a
                href={deepLinksAtivos?.appleMaps || `maps://?daddr=${corridaAtiva.cliente.lat},${corridaAtiva.cliente.lng}&dirflg=d`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Abrir no Apple Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Apple Maps</span>
              </a>
              <a
                href={`tel:${corridaAtiva.cliente.telefone.replace(/\D/g, "")}`}
                className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ligar</span>
              </a>
            </div>

            {/* CARD DE TELEMETRIA ECO & ENERGÉTICA TANGARÁ DA SERRA */}
            <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Leaf className="w-3.5 h-3.5" />
                  Telemetria Eco · Tangará da Serra
                </span>
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  Moto 160cc · Gasolina R$ 6,19/L
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-500" /> Consumo
                  </div>
                  <div className="text-xs font-black font-mono text-[var(--ink)] mt-0.5">
                    {telemetriaEco.consumoCombustivelLitros.toFixed(2)} L
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" /> Custo
                  </div>
                  <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    R$ {telemetriaEco.custoCombustivelReais.toFixed(2)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <Leaf className="w-3 h-3 text-teal-500" /> CO2
                  </div>
                  <div className="text-xs font-black font-mono text-[var(--ink)] mt-0.5">
                    {telemetriaEco.emissaoCo2Gramas.toFixed(0)} g
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] text-[var(--muted)] flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-500" /> Asfalto
                  </div>
                  <div className="text-xs font-black font-mono text-sky-600 dark:text-sky-400 mt-0.5">
                    {telemetriaEco.indiceAderenciaPistaPercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÕES DE EXPORTAÇÃO (GPX, KML) E ITINERÁRIO CURVA A CURVA */}
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalPassosAberto(true)}
                className="py-2 px-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-sky-500" />
                <span>Etapas ({corridaAtiva.passosRota.length})</span>
              </button>
              <button
                type="button"
                onClick={baixarGpx}
                className="py-2 px-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] flex items-center justify-center gap-1.5 transition cursor-pointer text-[var(--ink)]"
                title="Exportar trilha GPX para Garmin/Strava/GPS"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>GPX</span>
              </button>
              <button
                type="button"
                onClick={baixarKml}
                className="py-2 px-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] flex items-center justify-center gap-1.5 transition cursor-pointer text-[var(--ink)]"
                title="Exportar rota KML para Google Earth"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>KML</span>
              </button>
            </div>

            {/* BOTÃO PRINCIPAL: CONCLUIR ENTREGA & ASSINATURA */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setModalFinalizar(true)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {proximaCorrida
                    ? `Confirmar Entrega #${corridaAtiva.ordemParada || (currentIndex + 1)} (${corridaAtiva.cliente.nome.split(" ")[0]}) & Ir para Parada #${proximaCorrida.ordemParada || (currentIndex + 2)} →`
                    : `Confirmar Última Entrega (#${corridaAtiva.ordemParada || 10}) e Finalizar Circuito 🏆`}
                </span>
              </button>

              {proximaCorrida && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs">
                  <span className="text-[var(--muted)] flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-500" /> Próxima Parada da Fila:
                  </span>
                  <span className="font-bold text-sky-700 dark:text-sky-300">
                    #{proximaCorrida.ordemParada || (currentIndex + 2)} {proximaCorrida.cliente.nome} · {proximaCorrida.cliente.bairro} (+R$ {proximaCorrida.taxaEntrega.toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* 3. ABA: CARTEIRA DO ENTREGADOR                                 */}
      {/* ============================================================== */}
{activeTab === "carteira" && (
        <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4">
          {/* Card Principal de Saldo */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> Saldo Acumulado Hoje
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">Taxa 0% Sicredi MT</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono">
              R$ {totalGanhosHoje.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-100 leading-tight">
              Repasse integral automático das taxas de entrega diretamente para a sua conta Pix sem descontos.
            </p>

            <button
              onClick={async () => {
                const mbId = motoboysData?.[0]?.id || "moto_1";
                await settleShiftMutation.mutateAsync({ motoboyId: mbId });
                toast.success("Pix enviado com sucesso via Sicredi Tangará!");
                refetchMotoboy();
              }}
              className="w-full py-2.5 rounded-xl bg-white text-emerald-800 font-black text-xs shadow-sm hover:bg-emerald-50 transition cursor-pointer"
            >
              Transferir Agora via Pix Direto (Sicredi MT)
            </button>
          </div>

          {/* Dados Bancários */}
          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-xs space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-[var(--ink)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Chave Pix Cadastrada para Repasse
            </h4>
            <div className="p-2.5 rounded-xl bg-[var(--surface2)] font-mono text-[11px] flex justify-between items-center">
              <span>(65) 99812-4011 (Celular Sicredi Tangará)</span>
              <span className="text-emerald-600 font-bold">Verificada</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL DE COMPROVAÇÃO DE ENTREGA (PoD Touch & OTP)           */}
      {/* ============================================================== */}
      {modalFinalizar && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Comprovação de Entrega
                </h3>
                <p className="text-xs text-[var(--muted)]">{corridaAtiva.cliente.nome} · {corridaAtiva.cliente.bairro}</p>
              </div>
              <button
                onClick={() => setModalFinalizar(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Código OTP do Cliente */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                <span>Código OTP do Cliente:</span>
                <span className="text-[10px] text-emerald-600 font-mono">Dica: {corridaAtiva.codigoOtp}</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpDigitado}
                onChange={(e) => setOtpDigitado(e.target.value)}
                placeholder={`Ex: ${corridaAtiva.codigoOtp}`}
                className="w-full px-3 py-2 text-center text-xl font-mono tracking-widest rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-black text-[var(--ink)]"
              />
            </div>

            {/* Assinatura Touch no Canvas */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                <span className="flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-sky-500" /> Assinatura na Tela:
                </span>
                <button
                  type="button"
                  onClick={limparAssinatura}
                  className="text-[10px] text-sky-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar
                </button>
              </div>
              <div className="border border-[var(--line)] rounded-xl bg-white dark:bg-slate-900 p-1 flex justify-center">
                <canvas
                  ref={signatureCanvasRef}
                  width={340}
                  height={100}
                  onPointerDown={startDrawing}
                  onPointerMove={drawSignature}
                  onPointerUp={stopDrawing}
                  className="touch-none cursor-crosshair w-full max-w-[340px] h-[100px]"
                />
              </div>
              <p className="text-[10px] text-[var(--muted)] text-center">
                {signatureDone ? "✓ Assinatura capturada" : "O cliente assina com o dedo"}
              </p>
            </div>

            {/* Forma de Pagamento Efetivada */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)]">Forma Recebida:</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: "apple_pay", label: "Pix / Apple Pay", icon: Smartphone },
                  { id: "cartao", label: "Cartão Máquina", icon: CreditCard },
                  { id: "dinheiro", label: "Dinheiro", icon: Banknote },
                  { id: "online", label: "Pago Online", icon: ShieldCheck }
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormaPagamentoRecebida(f.id)}
                      className={`p-2 rounded-xl border font-bold flex items-center gap-1.5 text-left cursor-pointer transition ${
                        formaPagamentoRecebida === f.id
                          ? "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                          : "border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-sky-600" />
                      <span className="truncate">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CALCULADORA DE TROCO AUTOMÁTICA QUANDO EM DINHEIRO */}
            {formaPagamentoRecebida === "dinheiro" && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-amber-700 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-600" /> Calculadora de Troco
                  </span>
                  <span className="font-mono text-[11px]">Total: R$ {corridaAtiva.valorTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[var(--muted)] font-bold">Valor pago pelo cliente (R$):</label>
                  <input
                    type="number"
                    value={valorPagoDinheiro || ""}
                    onChange={(e) => setValorPagoDinheiro(Number(e.target.value))}
                    placeholder="Ex: 50.00"
                    className="w-full px-3 py-1.5 text-center text-lg font-mono font-black rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  />
                </div>
                {/* Botões Rápidos de Cédulas */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  {[corridaAtiva.valorTotal, 20, 50, 100, 200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setValorPagoDinheiro(val)}
                      className={`flex-1 py-1 rounded-lg border font-mono font-bold cursor-pointer transition ${
                        valorPagoDinheiro === val
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:border-amber-400"
                      }`}
                    >
                      {val === corridaAtiva.valorTotal ? "Exato" : `R$${val}`}
                    </button>
                  ))}
                </div>
                {/* Resultado do Troco */}
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">Troco a Devolver:</span>
                  <span className={`text-base font-black font-mono ${
                    valorPagoDinheiro >= corridaAtiva.valorTotal ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}>
                    {valorPagoDinheiro >= corridaAtiva.valorTotal
                      ? `R$ ${(valorPagoDinheiro - corridaAtiva.valorTotal).toFixed(2)}`
                      : "Valor Insuficiente"}
                  </span>
                </div>
              </div>
            )}

            {/* QR CODE PIX DINÂMICO SICREDI TANGARÁ DA SERRA */}
            {formaPagamentoRecebida === "apple_pay" && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" /> Pix Dinâmico · Sicredi Tangará
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                    R$ {corridaAtiva.valorTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126580014br.gov.bcb.pix0136financeiro@kytto.com.br520400005303986540${corridaAtiva.valorTotal.toFixed(2)}5802BR5916Zuma%20Tangara6016Tangara%20da%20Serra62070503***6304`}
                      alt="QR Code Pix Sicredi"
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-[10px] text-[var(--muted)]">Chave Pix Oficial Tangará da Serra:</div>
                    <div className="text-xs font-mono font-bold text-[var(--ink)]">financeiro@kytto.com.br</div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText("financeiro@kytto.com.br");
                        toast.success("Chave Pix copiada com sucesso!");
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copiar Chave Pix
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COMPROVANTE FOTOGRÁFICO DE ENTREGA (PoD) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-500" /> Foto da Fachada / Entrega:
                </span>
                <span className="text-[10px] text-[var(--muted)]">Opcional</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFotoComprovanteAnexa(!fotoComprovanteAnexa);
                    if (!fotoComprovanteAnexa) toast.success("Foto registrada com sucesso!");
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                    fotoComprovanteAnexa
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:border-sky-400"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{fotoComprovanteAnexa ? "✓ Foto Anexada" : "Capturar Foto do Portão"}</span>
                </button>
                {fotoComprovanteAnexa && (
                  <button
                    type="button"
                    onClick={() => setFotoComprovanteAnexa(false)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>

            {/* Ações Finais */}
            <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalFinalizar(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={finalizarEntrega}
                className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {proximaCorrida
                    ? `Confirmar & Ir para Parada #${proximaCorrida.ordemParada || (currentIndex + 2)} (${proximaCorrida.cliente.nome.split(" ")[0]}) →`
                    : `Confirmar & Concluir Circuito dos 10 Pedidos 🏆`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE CELEBRAÇÃO: CIRCUITO COMPLETO DOS 10 PEDIDOS FINALIZADO */}
      {/* ============================================================== */}
      {modalCircuitoFinalizado && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 text-center my-auto">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30">
              🏆
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs uppercase tracking-wider">
                Missão Cumprida · Tangará da Serra
              </span>
              <h3 className="text-xl font-black text-[var(--ink)]">
                Circuito dos 10 Pedidos Concluído!
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Todas as 10 entregas foram realizadas com excelência e validação completa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-left font-mono">
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">TOTAL FATURADO</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  R$ {corridas.reduce((acc, c) => acc + c.taxaEntrega, 0).toFixed(2)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">ENTREGAS NO PRAZO</div>
                <div className="text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5">
                  10 de 10 (100%)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">NPS MÉDIO ESTIMADO</div>
                <div className="text-lg font-black text-amber-500 mt-0.5">
                  98.2% ⭐
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">PRESERVAÇÃO TÉRMICA</div>
                <div className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  99.1% 🍣
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRetornarBase}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>🏠 Retornar à Base Zuma Oriental (Centro)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalCircuitoFinalizado(false)}
                className="w-full py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                Fechar e Ver Resumo da Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ETAPAS CURVA A CURVA DETALHADAS (ITINERÁRIO TANGARÁ)   */}
      {/* ============================================================== */}
      {modalPassosAberto && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
                  <Route className="w-5 h-5 text-sky-500" />
                  Itinerário Passo a Passo
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {corridaAtiva.distanciaKm} km · {corridaAtiva.tempoEstimadoMin} min via {providerRotaAtual === "osrm_live" ? "OpenStreetMap Tangará" : "Grafo Viário A*"}
                </p>
              </div>
              <button
                onClick={() => setModalPassosAberto(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {corridaAtiva.passosRota.map((passo, idx) => {
                const isPassoAtual = idx === passoAtualIndex;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition flex items-start gap-3 ${
                      isPassoAtual
                        ? "bg-sky-500/15 border-sky-500 ring-1 ring-sky-500/30"
                        : "bg-[var(--surface2)] border-[var(--line)]"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-black text-[var(--ink)] flex items-center justify-between">
                        <span>{passo.instrucao}</span>
                        <span className="text-[10px] font-mono text-[var(--muted)] ml-2 shrink-0">
                          {passo.distanciaMetros >= 1000
                            ? `${(passo.distanciaMetros / 1000).toFixed(1)} km`
                            : `${passo.distanciaMetros} m`}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>{passo.rua}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalPassosAberto(false)}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Fechar Itinerário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppEntregador;
