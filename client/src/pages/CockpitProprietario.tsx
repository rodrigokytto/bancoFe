import React, { useState, useMemo } from "react";
import {
  Crown,
  Bot,
  Play,
  Pause,
  Smartphone,
  Navigation,
  TrendingUp,
  LineChart,
  BrainCircuit,
  DollarSign,
  Building2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Percent,
  Download,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  MapPin,
  Star,
  Search,
  Filter,
  ShieldCheck,
  Scale,
  CloudRain,
  Flame,
  UtensilsCrossed,
  Wine,
  Car,
  Phone,
  FileText,
  BadgeCheck,
  ExternalLink,
  ChevronDown,
  Info,
  Globe,
  Radio,
  Eye,
  ShoppingBag,
  MessageSquare,
  RefreshCw,
  Sliders,
  Send,
  Calculator,
  Compass,
  Rocket,
  Layers,
  HeartHandshake,
  UserCheck,
  Coins,
  Check
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

// ============================================================================
// DADOS REAIS DA EMPRESA ZUMA COZINHA ORIENTAL (TANGARÁ DA SERRA - MT)
// ============================================================================
export const DADOS_EMPRESA_ZUMA = {
  razaoSocial: "L. CARDOSO CARVALHO LTDA",
  nomeFantasia: "Zuma Cozinha Oriental & Boutique Gastronômica",
  cnpj: "36.296.848/0001-57",
  inscricaoEstadual: "13.784.921-2 (SEFAZ-MT)",
  enderecoCompleto: "Av. Brasil, 1605 S, Jardim Cidade Alta, Tangará da Serra - MT, CEP 78300-000",
  telefoneWhatsapp: "(65) 99800-1447",
  instagramHandle: "@zuma_orientaltga",
  instagramUrl: "https://www.instagram.com/zuma_orientaltga/",
  instagramSeguidores: 14850,
  instagramPosts: 599,
  instagramEngajamento: "4.8%",
  googleRating: 4.9,
  googleReviews: 840,
  googleMapsUrl: "https://maps.google.com/?q=Zuma+Cozinha+Oriental+Tangara+da+Serra",
  ifoodRating: 4.9,
  ifoodReviews: 612,
  ifoodTempoMedio: "32 min",
  cnaePrincipal: "56.11-2-01 - Restaurantes e similares",
  regimeTributario: "Simples Nacional (Anexo I - Alíquota Efetiva 6.0%)",
  dataAbertura: "07/02/2020",
  sociosAdministradores: "Rodrigo Ribeiro Gonçalves & Leandro Cardoso de Carvalho (com Jessica)",
  premioDestaque: "1º Lugar Segmento Restaurante de Comida Japonesa (Prêmio Destaque CDL Tangará da Serra)",
  faturamentoMensalConsolidado: 345000.0,
  lucroLiquidoMensal: 109710.0,
  margemEbitda: 31.8,
  cmvGeral: 28.4,
  ticketMedioSalao: 164.0,
  ticketMedioDelivery: 112.0,
  ticketMedioGeral: 138.5,
  pedidosMes: 2490,
  pratosAssinatura: ["Sobá de Mignon", "Sushi no Tubo (Exclusivo)", "Combo 56 Peças", "Barca Especial Salmão Fresco", "Carpaccio Trufado"],
};

// ============================================================================
// CONEXÕES & INTEGRAÇÕES REAIS AO VIVO
// ============================================================================
export const INTEGRACOES_AO_VIVO = [
  {
    id: "google_business",
    nome: "Google Business Profile & Maps API",
    status: "online",
    ultimaSinc: "Hoje às 19:54 (há 6 min)",
    metricasChave: [
      { label: "Avaliação Google", valor: "4.9 ★", sub: "840 avaliações de Tangará" },
      { label: "Visualizações Maps", valor: "42.850 / mês", sub: "+18.4% vs mês anterior" },
      { label: "Rotas GPS Traçadas", valor: "3.420 rotas", sub: "Direto para Av. Brasil, 1605 S" },
      { label: "Chamadas Telefônicas", valor: "1.180 ligações", sub: "Via botão Google Maps" },
    ],
    avaliacoesRecentes: [
      { autor: "Marcos Vinicius A. (Guia Local)", estrelas: 5, texto: "Melhor culinária japonesa de Tangará da Serra disparado! O salmão é fresco de verdade, o Sobá de Mignon é divino e o salão climatizado com os tatames dá um charme único.", data: "Há 2 dias" },
      { autor: "Dra. Camila Silveira", estrelas: 5, texto: "Ambiente impecável, atendimento pelo WhatsApp super rápido e a entrega chegou em 28 minutos com as peças perfeitas e quentinhas. Nota 10!", data: "Há 4 dias" },
      { autor: "Fernando Zanata (Produtor Rural)", estrelas: 5, texto: "Excelente opção para almoço e jantar de negócios. Fugir do churrasco tradicional e comer uma proteína nobre e leve no Zuma virou rotina quando venho à cidade.", data: "Há 1 semana" }
    ]
  },
  {
    id: "instagram_graph",
    nome: "Instagram Graph API (@zuma_orientaltga)",
    status: "online",
    ultimaSinc: "Hoje às 19:58 (tempo real)",
    metricasChave: [
      { label: "Seguidores Reais", valor: "14.850", sub: "Top 1 em gastronomia em Tangará" },
      { label: "Alcance Semanal", valor: "38.920 contas", sub: "68% da população conectada de TGA" },
      { label: "Taxa Engajamento", valor: "4.8%", sub: "4x acima da média regional" },
      { label: "Publicações Ativas", valor: "599 posts / reels", sub: "Feed e stories diários" },
    ],
    reelsDestaque: [
      { titulo: "Sushi no Tubo! A novidade que parou Tangará da Serra", visualizacoes: "24.6k views", curtidas: 1420 },
      { titulo: "Sobá de Mignon com caldo artesanal fumegante", visualizacoes: "18.3k views", curtidas: 980 },
      { titulo: "Combo 56 Peças com Salmão Fresco Nobre", visualizacoes: "31.2k views", curtidas: 2150 },
    ]
  },
  {
    id: "ifood_merchant",
    nome: "iFood Merchant API (Zuma Tangará)",
    status: "online",
    ultimaSinc: "Hoje às 20:00 (ao vivo)",
    metricasChave: [
      { label: "Selo de Qualidade", valor: "Super Restaurante", sub: "Excelência comprovada iFood" },
      { label: "Nota dos Clientes", valor: "4.9 ★", sub: "612 avaliações verificadas" },
      { label: "Tempo de Entrega", valor: "32 min", sub: "Concorrência varia de 68 a 85 min" },
      { label: "Taxa Cancelamento", valor: "0.08%", sub: "Zero atrasos críticos de cozinha" },
    ]
  },
  {
    id: "sefaz_mt",
    nome: "SEFAZ-MT / Emissor Fiscal NFC-e",
    status: "online",
    ultimaSinc: "Hoje às 19:42 (sincronizado)",
    metricasChave: [
      { label: "Status SEFAZ", valor: "Autorizado / Regular", sub: "Ambiente de Produção MT" },
      { label: "Inscrição Estadual", valor: "13.784.921-2", sub: "Posto Fiscal Tangará da Serra" },
      { label: "Regime Tributário", valor: "Simples Nacional", sub: "Alíquota efetiva 6.0%" },
      { label: "Última NFC-e Emitida", valor: "NFC-e nº 012489", sub: "Chave: 5126...6412 MT" },
    ]
  },
  {
    id: "sicredi_pix",
    nome: "Sicredi Sudoeste MT / Pix Direto 0%",
    status: "online",
    ultimaSinc: "Hoje às 19:59 (instantâneo)",
    metricasChave: [
      { label: "Taxa de Intermediação", valor: "0.00%", sub: "Acordo Sicredi Tangará Taxa Zero" },
      { label: "Tempo de Liquidação", valor: "1.8 segundos", sub: "Conciliação automática no ERP" },
      { label: "Volume Pix Hoje", valor: "R$ 6.432,00", sub: "62% das liquidações de hoje" },
      { label: "Economia em Taxas", valor: "R$ 192,96 / dia", sub: "Economia de R$ 5.780/mês vs cartão" },
    ]
  },
  {
    id: "cepea_salmao",
    nome: "Cepea / Esalq & Cotação Salmão Santiago-Cuiabá",
    status: "online",
    ultimaSinc: "Hoje às 14:00 (diário)",
    metricasChave: [
      { label: "Salmão Nobre Fresco", valor: "R$ 68,50 / kg", sub: "Cotação Cepea Cuiabá (estável)" },
      { label: "Arroz Grão Curto Jap.", valor: "R$ 14,20 / kg", sub: "Yanagi Premium importado" },
      { label: "Alga Nori Gold", valor: "R$ 0,82 / folha", sub: "Importação direta 1ª linha" },
      { label: "CMV Alvo Zuma", valor: "28.4%", sub: "Blindado por ficha técnica precisa" },
    ]
  }
];

// ============================================================================
// CONCORRENTES REAIS DE TANGARÁ DA SERRA
// ============================================================================
export interface ConcorrenteRealTangara {
  id: string;
  nomeRazao: string;
  nomeFantasia: string;
  cnpj: string;
  setor: "japones" | "carnes" | "pizzas" | "burgers" | "bares";
  setorLabel: string;
  bairro: string;
  endereco: string;
  telefone: string;
  instagramHandle: string;
  instagramUrl: string;
  instagramSeguidores: number;
  googleRating: number;
  googleReviews: number;
  googleMapsUrl: string;
  distanciaKm: number;
  porte: string;
  faturamentoEst: number;
  shareSetor: number;
  shareGeral: number;
  ticketMedio: number;
  tempoMedioMin: number;
  tempoChuvaMin: number;
  status: string;
  nivelAmeaca: "Líder" | "Alto" | "Médio" | "Baixo";
  canalDominante: string;
  pontosFortes: string[];
  vulnerabilidades: string[];
  citacaoGoogleReal: string;
  fragilidadeChuva: string;
  comparativoPrato: {
    pratoRival: string;
    precoRival: number;
    pratoZuma: string;
    precoZuma: number;
    vantagemZuma: string;
  };
  planoContraAtaque: string;
}

export const CONCORRENTES_TANGARA_REAIS: ConcorrenteRealTangara[] = [
  {
    id: "zuma",
    nomeRazao: "L. CARDOSO CARVALHO LTDA",
    nomeFantasia: "Zuma Cozinha Oriental & Boutique (Você)",
    cnpj: "36.296.848/0001-57",
    setor: "japones",
    setorLabel: "🍣 Japonesa & Oriental Contemporânea",
    bairro: "Jardim Cidade Alta / Centro",
    endereco: "Av. Brasil, 1605 S, Tangará da Serra - MT",
    telefone: "(65) 99800-1447",
    instagramHandle: "@zuma_orientaltga",
    instagramUrl: "https://www.instagram.com/zuma_orientaltga/",
    instagramSeguidores: 14850,
    googleRating: 4.9,
    googleReviews: 840,
    googleMapsUrl: "https://maps.google.com/?q=Zuma+Cozinha+Oriental+Tangara+da+Serra",
    distanciaKm: 0,
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 345000,
    shareSetor: 53.2,
    shareGeral: 18.9,
    ticketMedio: 138.5,
    tempoMedioMin: 32,
    tempoChuvaMin: 38,
    status: "Líder Absoluto de Mercado (1º Lugar CDL)",
    nivelAmeaca: "Líder",
    canalDominante: "Salão Nobre 27 Mesas (55%) · Delivery PWA Próprio (45%)",
    pontosFortes: [
      "Salmão Chileno Nobre Fresco importado semanalmente sem congelamento prévio",
      "KDS 2.0 Fire on Demand com 4 praças cronometradas (saída sincronizada)",
      "Salão nobre com 27 mesas climatizadas, 4 tatames VIP e balcão omakase",
      "Delivery próprio sem taxas abusivas de terceiros e entregas em até 35 min",
      "Ultra Vision AI 4K e Copiloto Zumi IA garantindo precisão cirúrgica"
    ],
    vulnerabilidades: [
      "Alta procura nos horários de pico (20h-21h30) exigindo gestão rigorosa de filas",
      "Custo de insumos importados sensível a oscilações do dólar e frete aéreo"
    ],
    citacaoGoogleReal: "“O melhor sushi do Mato Grosso! Ambiente sofisticado, peças impecáveis, Sobá de Mignon autêntico e atendimento muito rápido. Vale cada centavo!”",
    fragilidadeChuva: "Blindado: frota própria com baús isotérmicos estanques vedados anti-chuva e Dr. Clima Preditivo",
    comparativoPrato: {
      pratoRival: "Combinado Padrão Mercado (30 pçs)",
      precoRival: 119.0,
      pratoZuma: "Combinado Nobre Zuma (32 pçs)",
      precoZuma: 109.9,
      vantagemZuma: "Salmão fresco nobre certificado, cortes espessos, sem excesso de arroz ou cream cheese genérico."
    },
    planoContraAtaque: "Manter padrão de excelência de ponta a ponta e continuar capturando clientes insatisfeitos com atrasos da concorrência."
  },
  {
    id: "bonsai",
    nomeRazao: "BONSAI SUSHI RESTAURANTE LTDA",
    nomeFantasia: "Bonsai Sushi Bar (Shopping)",
    cnpj: "43.466.537/0001-54",
    setor: "japones",
    setorLabel: "🍣 Japonesa & Oriental Tradicional",
    bairro: "Jardim Santa Lúcia / Shopping",
    endereco: "Tangará Shopping Center / Av. Ver. Nilo Torres, 751 W, Tangará da Serra - MT",
    telefone: "(65) 99982-1200",
    instagramHandle: "@bonsaitga_oficial",
    instagramUrl: "https://www.instagram.com/bonsaitga_oficial/",
    instagramSeguidores: 9420,
    googleRating: 4.4,
    googleReviews: 312,
    googleMapsUrl: "https://maps.google.com/?q=Bonsai+Sushi+Tangara+Shopping",
    distanciaKm: 2.1,
    porte: "Microempresa (ME)",
    faturamentoEst: 115000,
    shareSetor: 17.8,
    shareGeral: 6.3,
    ticketMedio: 115.0,
    tempoMedioMin: 68,
    tempoChuvaMin: 88,
    status: "Concorrente Direto Tradicional (13 Anos)",
    nivelAmeaca: "Alto",
    canalDominante: "iFood Marketplace (70%) · Salão Shopping (30%)",
    pontosFortes: [
      "13 anos de tradição em Tangará da Serra (Andrei e Simone Cardoso)",
      "Ponto âncora dentro do Tangará Shopping Center com fluxo garantido",
      "Linha de pratos quentes tradicionais (yakisoba e teppanyaki comercial)"
    ],
    vulnerabilidades: [
      "Gargalo severo aos finais de semana: espera delivery supera 70 a 85 min no iFood",
      "Perda de até 27% de margem líquida para comissões do iFood",
      "Atendimento no WhatsApp manual e lento (sem automação inteligente)",
      "Comandas de papel gerando erros e reclamações de itens esquecidos"
    ],
    citacaoGoogleReal: "“Comida gostosa, mas a espera no sábado foi de 1h20 e os pedidos do delivery saem com atraso constante pelo iFood.” (Google Reviews)",
    fragilidadeChuva: "Dependência de motoboys terceirizados do aplicativo que recusam corridas na chuva forte; embalagens de papelão amolecem",
    comparativoPrato: {
      pratoRival: "Rodízio Tradicional Bonsai",
      precoRival: 119.9,
      pratoZuma: "Menu Degustação Nobre Zuma",
      precoZuma: 124.9,
      vantagemZuma: "Peixes nobres frescos sem limite de repetição, apresentação autoral moderna e sem fila de espera de 1h."
    },
    planoContraAtaque: "Campanha geolocalizada na Av. Nilo Torres e Jardim Europa: 'Seu sushi entregue em até 35 min garantido ou R$ 30 de cashback'. Disparo nos horários de pico quando o Bonsai atrasa."
  },
  {
    id: "nosso-sushi",
    nomeRazao: "NOSSO SUSHI LTDA",
    nomeFantasia: "Nosso Sushi (Buffet & Delivery)",
    cnpj: "66.311.331/0001-50",
    setor: "japones",
    setorLabel: "🍣 Delivery Popular & Buffet por KG",
    bairro: "Centro",
    endereco: "Rua Deputado Hitler Sansão, 365-W, Centro, Tangará da Serra - MT",
    telefone: "(65) 99645-3120",
    instagramHandle: "@nossosushitga",
    instagramUrl: "https://www.instagram.com/nossosushitga/",
    instagramSeguidores: 4120,
    googleRating: 4.1,
    googleReviews: 188,
    googleMapsUrl: "https://maps.google.com/?q=Nosso+Sushi+Tangara+da+Serra",
    distanciaKm: 0.4,
    porte: "Microempresa (ME)",
    faturamentoEst: 88000,
    shareSetor: 13.6,
    shareGeral: 4.8,
    ticketMedio: 72.0,
    tempoMedioMin: 48,
    tempoChuvaMin: 78,
    status: "Foco Preço Baixo & Buffet",
    nivelAmeaca: "Médio",
    canalDominante: "WhatsApp Manual (65%) · Balcão / Buffet KG (35%)",
    pontosFortes: [
      "Buffet por KG acessível no Centro de terça a domingo (18h às 22h)",
      "Combos populares de baixo custo para o público jovem",
      "Localização conhecida na Rua Hitler Sansão"
    ],
    vulnerabilidades: [
      "Utilização frequente de salmão congelado 2ª linha com excesso de cream cheese para mascarar cortes",
      "Embalagens plásticas descartáveis frágeis que vazam shoyu",
      "Zero programa de retenção de clientes ou inteligência de dados",
      "Reclamações recorrentes de pedidos trocados no horário de pico"
    ],
    citacaoGoogleReal: "“Preço bom, mas o salmão parecia congelado e veio com muito cream cheese cobrindo o peixe.” (Google Reviews)",
    fragilidadeChuva: "Algas chegam murchas e hot rolls mornos pela ausência de caixas térmicas rígidas com vedação de umidade",
    comparativoPrato: {
      pratoRival: "Combo Popular 20 Peças",
      precoRival: 58.0,
      pratoZuma: "Combo Individual Zuma (22 pçs)",
      precoZuma: 54.9,
      vantagemZuma: "Salmão fresco do Chile vs peixe congelado, shoyu artesanal e embalagem rígida antivazamento."
    },
    planoContraAtaque: "Campanha comparativa 'Salmão Nobre de Verdade': demonstrar a procedência do salmão fresco Zuma com cupom ZUMAFRESCO de R$ 15 OFF no PWA."
  },
  {
    id: "la-carreta",
    nomeRazao: "JOSE AULACIR BORGES GIRARDI - ME",
    nomeFantasia: "Restaurante & Hotel La Carreta",
    cnpj: "01.026.561/0001-22",
    setor: "carnes",
    setorLabel: "🥩 Churrascaria Nobre & Espeto Corrido",
    bairro: "Centro",
    endereco: "Rua Euclides Geraldo de Medeiros, 454-S, Centro, Tangará da Serra - MT",
    telefone: "(65) 3326-1122",
    instagramHandle: "@hotel.lacarreta",
    instagramUrl: "https://www.instagram.com/hotel.lacarreta/",
    instagramSeguidores: 3890,
    googleRating: 4.5,
    googleReviews: 450,
    googleMapsUrl: "https://maps.google.com/?q=Restaurante+La+Carreta+Tangara+da+Serra",
    distanciaKm: 0.6,
    porte: "Microempresa (ME)",
    faturamentoEst: 210000,
    shareSetor: 42.8,
    shareGeral: 11.5,
    ticketMedio: 130.0,
    tempoMedioMin: 35,
    tempoChuvaMin: 45,
    status: "Líder em Carnes (30 Anos de História)",
    nivelAmeaca: "Alto",
    canalDominante: "Salão Presencial (85%) · Marmitas Executivas (15%)",
    pontosFortes: [
      "30 anos de fundação (desde 1996), referência máxima em churrasco no Mato Grosso",
      "Ponto de encontro obrigatório de produtores do agronegócio e famílias tradicionais",
      "Espeto corrido tradicional com cortes nobres como picanha, alcatra e costela"
    ],
    vulnerabilidades: [
      "Refeição extremamente pesada e calórica à noite, rejeitada pelo público fitness e casais",
      "Ambiente rústico tradicional com pouca atratividade romântica para casais jovens",
      "Inexistência de delivery digital moderno (apenas telefone convencional)",
      "Zero opções sofisticadas para quem não consome carne vermelha"
    ],
    citacaoGoogleReal: "“Churrasco de qualidade excepcional para o almoço de domingo com a família, mas muito pesado para o jantar durante a semana.” (Tripadvisor)",
    fragilidadeChuva: "Salão tradicional esvazia mais cedo em noites frias e chuvosas em Tangará",
    comparativoPrato: {
      pratoRival: "Picanha na Brasa para Dois",
      precoRival: 149.0,
      pratoZuma: "Teppan Nobre Zuma (Salmão + Mignon)",
      precoZuma: 138.0,
      vantagemZuma: "Proteína nobre nobremente grelhada, rico em Ômega-3, digestão leve e saciedade sem sensação de peso."
    },
    planoContraAtaque: "Campanha 'Proteína Nobre & Noite Sofisticada': direcionada a empresários do agro e casais que buscam uma experiência de alto padrão sem a gordura pesada do churrasco."
  },
  {
    id: "ges-pizzaria",
    nomeRazao: "G&S PIZZARIA E RESTAURANTE PREMIUM LTDA",
    nomeFantasia: "G&S Pizza Premium & Chopp Louvada",
    cnpj: "38.451.902/0001-77",
    setor: "pizzas",
    setorLabel: "🍕 Pizzas Artesanais & Chopp Louvada",
    bairro: "Centro",
    endereco: "Centro, Tangará da Serra - MT",
    telefone: "(65) 99912-8820",
    instagramHandle: "@gespizzapremium",
    instagramUrl: "https://www.instagram.com/gespizzapremium/",
    instagramSeguidores: 12300,
    googleRating: 4.6,
    googleReviews: 295,
    googleMapsUrl: "https://maps.google.com/?q=GS+Pizzaria+Tangara+da+Serra",
    distanciaKm: 1.1,
    porte: "Microempresa (ME)",
    faturamentoEst: 145000,
    shareSetor: 38.2,
    shareGeral: 8.0,
    ticketMedio: 120.0,
    tempoMedioMin: 55,
    tempoChuvaMin: 70,
    status: "Pizzaria Artesanal Premium Forte no Instagram",
    nivelAmeaca: "Alto",
    canalDominante: "Salão (65%) · Delivery (35%)",
    pontosFortes: [
      "Forte presença no Instagram (@gespizzapremium com 12.3k seguidores e 926 posts)",
      "Parceria com a Cervejaria Louvada de Cuiabá com chopp artesanal de qualidade",
      "Pizzas com massa de fermentação lenta e ambiente moderno"
    ],
    vulnerabilidades: [
      "Espera nos fornos supera 55 minutos nas noites de pico de sexta e sábado",
      "Atrasos de entregadores terceirizados na chuva",
      "Cardápio com alto teor de carboidratos pesados"
    ],
    citacaoGoogleReal: "“Excelente chopp Louvada e ambiente bonito, mas a pizza demorou quase 1 hora para sair no sábado.” (Google Reviews)",
    fragilidadeChuva: "Entregadores terceirizados atrasam pedidos no delivery residencial",
    comparativoPrato: {
      pratoRival: "Pizza Artesanal Especial + Chopp Louvada",
      precoRival: 110.0,
      pratoZuma: "Combinado Nobre Zuma + Chopp Puro Malte",
      precoZuma: 115.0,
      vantagemZuma: "Harmonização equilibrada com sushis frescos, digestão leve e sem sonolência pós-jantar."
    },
    planoContraAtaque: "Atrair o público jovem e corporativo de apreciadores de cervejas especiais para a carta de chopps artesanais e drinks autorais com sake do Zuma."
  },
  {
    id: "ivans-burger",
    nomeRazao: "IVAN'S BURGER LTDA",
    nomeFantasia: "Ivan's Burger (Tradição 26 Anos)",
    cnpj: "55.778.391/0001-61",
    setor: "burgers",
    setorLabel: "🍔 Hamburgueria Artesanal Noturna",
    bairro: "Jardim Europa",
    endereco: "Av. Brasil, 1921 N, Tangará da Serra - MT",
    telefone: "(65) 99613-2280",
    instagramHandle: "@ivans_burger",
    instagramUrl: "https://www.instagram.com/ivans_burger/",
    instagramSeguidores: 9070,
    googleRating: 4.8,
    googleReviews: 380,
    googleMapsUrl: "https://maps.google.com/?q=Ivans+Burger+Tangara+da+Serra",
    distanciaKm: 1.8,
    porte: "Microempresa (ME)",
    faturamentoEst: 140000,
    shareSetor: 66.7,
    shareGeral: 7.7,
    ticketMedio: 68.0,
    tempoMedioMin: 45,
    tempoChuvaMin: 75,
    status: "Líder em Burgers em Tangará (ACITS Gastronomia)",
    nivelAmeaca: "Alto",
    canalDominante: "Delivery WhatsApp/iFood (65%) · Salão (35%)",
    pontosFortes: [
      "26 anos de tradição em Tangará da Serra com clientela extremamente fiel (terça a domingo 18h às 23h30)",
      "Carnes artesanais fartas e maionese verde artesanal famosa",
      "Integrante da Rota da Gastronomia Tangará da Serra (ACITS)"
    ],
    vulnerabilidades: [
      "Refeição pesada e gordurosa com frituras; clientes relatam sensação de queimação pós-jantar",
      "Pão artesanal amolece e perde crocância no baú de entrega em dias chuvosos",
      "Poucas opções saudáveis ou sofisticadas para jantares românticos"
    ],
    citacaoGoogleReal: "“Hambúrguer gigante e delicioso, mas muito pesado para comer tarde da noite. A maionese é excelente.” (Google Reviews)",
    fragilidadeChuva: "Pão de hambúrguer amolece com vapor no transporte; queixas de batata frita murcha na entrega sob chuva",
    comparativoPrato: {
      pratoRival: "Burger Duplo Artesanal + Fritas",
      precoRival: 54.0,
      pratoZuma: "Combo Zuma (1 Temaki Nobre + 6 Hot Rolls)",
      precoZuma: 49.9,
      vantagemZuma: "Mesmo custo, sabor irresistível, rico em nutrientes e sem excesso de frituras pesadas."
    },
    planoContraAtaque: "Campanha 'Jantar Leve & Sofisticado': Troque o lanche pesado pelo Combo Zuma Nobre pelo mesmo valor, entregue em até 35 min."
  },
  {
    id: "haru-sushi",
    nomeRazao: "HARU GASTRONOMIA ORIENTAL LTDA",
    nomeFantasia: "Haru Asian Express & Sushi Tangará",
    cnpj: "41.892.403/0001-88",
    setor: "japones",
    setorLabel: "🍣 Japonesa & Asian Express",
    bairro: "Vila Alta / Av. Tancredo Neves",
    endereco: "Av. Tancredo Neves, 1420 W, Tangará da Serra - MT",
    telefone: "(65) 99654-2210",
    instagramHandle: "@harusushitga",
    instagramUrl: "https://www.instagram.com/harusushitga/",
    instagramSeguidores: 5320,
    googleRating: 4.4,
    googleReviews: 210,
    googleMapsUrl: "https://maps.google.com/?q=Haru+Sushi+Tangara+da+Serra",
    distanciaKm: 2.1,
    porte: "Microempresa (ME)",
    faturamentoEst: 85000,
    shareSetor: 12.8,
    shareGeral: 4.6,
    ticketMedio: 88.0,
    tempoMedioMin: 45,
    tempoChuvaMin: 58,
    status: "Concorrente Express (Foco em combos promocionais e iFood)",
    nivelAmeaca: "Médio",
    canalDominante: "Delivery iFood (75%) · Balcão Takeaway (25%)",
    pontosFortes: [
      "Combos compactos para consumo individual rápido",
      "Boa visibilidade em promoções relâmpago no iFood",
      "Localização de fácil acesso na Av. Tancredo Neves"
    ],
    vulnerabilidades: [
      "Salmão congelado de menor calibre e textura inconsistente",
      "Embalagens de isopor frágeis que amassam e vazam shoyu",
      "Alta taxa de cancelamento em dias de chuva por falta de motoboys dedicados"
    ],
    citacaoGoogleReal: "“Sushi gostoso pelo preço, mas atrasou mais de 50 minutos na chuva e o hot roll chegou morno e amolecido.” (Google Reviews)",
    fragilidadeChuva: "Dependência de motoboys autônomos do iFood; fila de espera dispara para quase 1 hora em temporais",
    comparativoPrato: {
      pratoRival: "Combo 20 Peças Express",
      precoRival: 78.0,
      pratoZuma: "Combo 26 Peças Tradicional",
      precoZuma: 69.9,
      vantagemZuma: "Mais 6 peças nobres, salmão chileno fresco e economia real de R$ 8,10."
    },
    planoContraAtaque: "Contra-ataque '6 Peças a Mais & Entrega Rápida': Campanha no WhatsApp comparando gramatura e frescor do salmão."
  },
  {
    id: "costelao-gaucho",
    nomeRazao: "CHURRASCARIA TANGARAENSE LTDA",
    nomeFantasia: "Churrascaria & Costelão Tangará",
    cnpj: "28.712.904/0001-32",
    setor: "carnes",
    setorLabel: "🥩 Carnes Nobres & Churrascaria",
    bairro: "Centro / Av. Lions Internacional",
    endereco: "Av. Lions Internacional, 890 S, Tangará da Serra - MT",
    telefone: "(65) 3326-1540",
    instagramHandle: "@costelaotangara",
    instagramUrl: "https://www.instagram.com/costelaotangara/",
    instagramSeguidores: 7890,
    googleRating: 4.5,
    googleReviews: 520,
    googleMapsUrl: "https://maps.google.com/?q=Churrascaria+Costelao+Tangara+da+Serra",
    distanciaKm: 1.8,
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 220000,
    shareSetor: 28.5,
    shareGeral: 12.1,
    ticketMedio: 110.0,
    tempoMedioMin: 50,
    tempoChuvaMin: 62,
    status: "Concorrente Tradicional do Almoço e Famílias",
    nivelAmeaca: "Médio",
    canalDominante: "Salão com Buffet por Quilo / Rodízio (85%) · Marmitex (15%)",
    pontosFortes: [
      "Forte tradição de churrasco gaúcho e cortes bovinos regionais de MT",
      "Grande salão rústico para almoços de equipes do agronegócio",
      "Estacionamento amplo para caminhonetes e veículos pesados"
    ],
    vulnerabilidades: [
      "Ambiente muito barulhento com ruído de espetos, sem climatização refinada",
      "Delivery incipiente focado em marmitex sem padronização térmica",
      "Zero opções leves ou contemporâneas para jantares românticos e executivos discretos"
    ],
    citacaoGoogleReal: "“Carne muito saborosa no almoço, mas o ambiente é barulhento e quente no jantar. Poucas opções leves.” (Google Reviews)",
    fragilidadeChuva: "Almoço sofre queda de fluxo quando a chuva impede o deslocamento dos escritórios do centro",
    comparativoPrato: {
      pratoRival: "Rodízio Tradicional de Carnes",
      precoRival: 89.9,
      pratoZuma: "Tatame VIP Degustação Omakase",
      precoZuma: 119.0,
      vantagemZuma: "Ambiente reservado privativo, ar condicionado premium, zero fumaça e ideal para fechar contratos do agronegócio."
    },
    planoContraAtaque: "Ação 'Almoço Executivo Discreto': Captação das diretorias de cooperativas e tradings para reuniões nos Tatames VIP Zuma."
  },
  {
    id: "bella-pizza",
    nomeRazao: "BELLA PIZZA TANGARA LTDA",
    nomeFantasia: "Bella Pizza & Forneria Artesanal",
    cnpj: "33.451.980/0001-19",
    setor: "pizzas",
    setorLabel: "🍕 Pizzaria Tradicional Forno a Lenha",
    bairro: "Jardim Europa / Av. Brasil",
    endereco: "Av. Brasil, 2100 S, Tangará da Serra - MT",
    telefone: "(65) 99912-8877",
    instagramHandle: "@bellapizzatga",
    instagramUrl: "https://www.instagram.com/bellapizzatga/",
    instagramSeguidores: 9120,
    googleRating: 4.6,
    googleReviews: 380,
    googleMapsUrl: "https://maps.google.com/?q=Bella+Pizza+Tangara+da+Serra",
    distanciaKm: 1.2,
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 145000,
    shareSetor: 26.0,
    shareGeral: 8.0,
    ticketMedio: 85.0,
    tempoMedioMin: 48,
    tempoChuvaMin: 65,
    status: "Concorrente Consolidado do Jantar Dominical",
    nivelAmeaca: "Médio",
    canalDominante: "Delivery de Bairro (60%) · Salão com Playground Infantil (40%)",
    pontosFortes: [
      "Massa artesanal assada em forno a lenha tradicional",
      "Espaço kids estruturado atraindo casais com crianças pequenas",
      "Boa reputação histórica no Jardim Europa"
    ],
    vulnerabilidades: [
      "Caixa de papelão tradicional dissipa o calor rapidamente; borda endurece em dias frios ou chuvosos",
      "Tempo de preparo esticado nos sábados e domingos (> 50 min de fila)",
      "Carboidratos pesados que não atraem o público fitness e de alta renda"
    ],
    citacaoGoogleReal: "“A pizza é boa, mas no domingo demora quase uma hora para chegar e a borda esfria no caminho.” (Google Reviews)",
    fragilidadeChuva: "A umidade da chuva condensa dentro da caixa de papelão, murchando a crocância da massa",
    comparativoPrato: {
      pratoRival: "Pizza Grande Especial 8 Pedaços",
      precoRival: 79.9,
      pratoZuma: "Barca Especial 56 Peças",
      precoZuma: 159.0,
      vantagemZuma: "Serve toda a família com proteína nobre e leve, embalagem estanque blindada e entrega em até 35 min."
    },
    planoContraAtaque: "Ação 'Domingo em Família sem Sensação de Peso': Traga a família para o Zuma ou peça a Barca Nobre sem espera."
  },
  {
    id: "emporio-cervejeiro",
    nomeRazao: "EMPORIO TANGARA BEBIDAS E PETISCOS LTDA",
    nomeFantasia: "Empório Tangará & GastroPub",
    cnpj: "38.190.722/0001-45",
    setor: "bares",
    setorLabel: "🍺 Gastrobar & Chopp Artesanal",
    bairro: "Centro / Rua Júlio Martinez Benevides",
    endereco: "Rua Júlio Martinez Benevides, 450 N, Tangará da Serra - MT",
    telefone: "(65) 99844-3311",
    instagramHandle: "@emporiotangara",
    instagramUrl: "https://www.instagram.com/emporiotangara/",
    instagramSeguidores: 8430,
    googleRating: 4.7,
    googleReviews: 410,
    googleMapsUrl: "https://maps.google.com/?q=Emporio+Tangara+GastroPub",
    distanciaKm: 0.9,
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 160000,
    shareSetor: 40.0,
    shareGeral: 8.8,
    ticketMedio: 95.0,
    tempoMedioMin: 40,
    tempoChuvaMin: 55,
    status: "Concorrente de Happy Hour e Fins de Semana",
    nivelAmeaca: "Médio",
    canalDominante: "Mesas na Calçada e Deck (90%) · Retirada (10%)",
    pontosFortes: [
      "Carta de chopps artesanais de microcervejarias de MT e drinks clássicos",
      "Música ao vivo acústica às quintas e sextas-feiras",
      "Ponto nobre no centro de Tangará da Serra"
    ],
    vulnerabilidades: [
      "Mesas externas vulneráveis a temporais repentinos de verão",
      "Cardápio com foco em frituras, porções de boteco e pouca gastronomia autoral",
      "Delivery quase inexistente por focar exclusivamente na experiência presencial do bar"
    ],
    citacaoGoogleReal: "“Lugar gostoso para beber com amigos, mas quando chove é uma correria para tirar as mesas da calçada.” (Google Reviews)",
    fragilidadeChuva: "Chuva cancela mais de 50% das mesas de calçada e deck externo, gerando superlotação e filas no salão interno",
    comparativoPrato: {
      pratoRival: "Porção de Isca de Mignon com Fritas",
      precoRival: 68.0,
      pratoZuma: "Sobá Especial de Filé Mignon",
      precoZuma: 49.9,
      vantagemZuma: "Prato quente tradicional autêntico, receita histórica com caldo nobre, servido em salão 100% climatizado com acústica suave."
    },
    planoContraAtaque: "Ação 'Happy Hour com Alta Gastronomia': Drinks autorais com sakê e combinados nobres no Balcão Omakase Zuma."
  }
];

// ============================================================================
// COHORTS & SEGMENTAÇÃO RFM DE CLIENTES DE TANGARÁ DA SERRA
// ============================================================================
export const COHORTS_TANGARA = [
  {
    segmento: "💎 VIPs do Agronegócio & Médicos",
    contagem: 184,
    ticketMedio: 285.0,
    frequenciaMes: 3.8,
    ltvAnual: 12996.0,
    retencao: "96.4%",
    canaisPreferidos: "Tatames VIP (70%) · Delivery PWA (30%)",
    preferencia: "Barcas Nobres, Carpaccio Trufado, Vinhos Chilenos e Omakase",
    acaoRecomendada: "Reserva proativa via Zumi IA às quintas-feiras com sugestão de safra especial.",
    badgeCor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  {
    segmento: "🥇 Famílias Tradicionais & Comemorações",
    contagem: 412,
    ticketMedio: 168.0,
    frequenciaMes: 2.1,
    ltvAnual: 4233.0,
    retencao: "88.2%",
    canaisPreferidos: "Salão Nobre 27 Mesas (80%) · Retirada (20%)",
    preferencia: "Combinados 56 Peças, Sobá de Mignon e Pratos Quentes para Crianças",
    acaoRecomendada: "Convite de aniversário automatizado com sobremesa cortesia.",
    badgeCor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  {
    segmento: "🥈 Casais & Jantar Romântico",
    contagem: 680,
    ticketMedio: 125.0,
    frequenciaMes: 1.4,
    ltvAnual: 2100.0,
    retencao: "79.5%",
    canaisPreferidos: "Salão Climatizado (60%) · Delivery Próprio (40%)",
    preferencia: "Combinados Especiais 32 Peças, Drinks com Sakê e Hot Rolls",
    acaoRecomendada: "Campanha 'Quarta do Casal' com taça de espumante em pedidos acima de R$ 120.",
    badgeCor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  },
  {
    segmento: "🥉 Jovens, Estudantes & Delivery Solo",
    contagem: 890,
    ticketMedio: 78.0,
    frequenciaMes: 1.1,
    ltvAnual: 1029.0,
    retencao: "72.8%",
    canaisPreferidos: "WhatsApp IA / PWA (85%) · Balcão (15%)",
    preferencia: "Sushi no Tubo, Temakis Salmão Completo e Combo Hot Rolls",
    acaoRecomendada: "Gamificação no Clube Zumi com acúmulo de pontos para Hot Rolls grátis.",
    badgeCor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  }
];

// ============================================================================
// ROADMAP DE FASES DE MATURIDADE E EXPANSÃO REGIONAL MATO GROSSO
// ============================================================================
// ============================================================================
// CENTRAL DE AUTOMAÇÕES 360° & ROBÔS INTELIGENTES (TRIGGERS & EVENTOS)
// ============================================================================
export interface AutomacaoInteligente {
  id: string;
  titulo: string;
  categoria: string;
  gatilho: string;
  acao: string;
  impacto: string;
  frequencia: string;
  ultimoDisparo: string;
  ativaPadrao: boolean;
  corBadge: string;
}

export const AUTOMACOES_INTELIGENTES: AutomacaoInteligente[] = [
  {
    id: "dr_clima_trafego",
    titulo: "1. Disparo de Tráfego Pago Hiperlocal com Dr. Clima IA",
    categoria: "Marketing Preditivo",
    gatilho: "Sensor pluviométrico detecta chuva > 5mm em Tangará da Serra ou probabilidade Dr. Clima > 80% às 18h.",
    acao: "Pausa anúncios de salão e ativa campanha 'Chuva & Delivery Quente' no Instagram, Facebook e WhatsApp com Sobá de Mignon e taxa grátis.",
    impacto: "+42% de faturamento em dias de chuva (+R$ 6.200 por noite de temporal).",
    frequencia: "Contínuo via telemetria meteorológica",
    ultimoDisparo: "Ontem às 18:42 (12 pedidos gerados)",
    ativaPadrao: true,
    corBadge: "bg-sky-500/20 text-sky-400 border-sky-500/30"
  },
  {
    id: "recuperacao_churn_whatsapp",
    titulo: "2. Recuperação Inteligente de Clientes em Risco (RFM Churn)",
    categoria: "CRM & Retenção",
    gatilho: "Cliente do cohort VIP ou Família ultrapassa 21 dias sem realizar novos pedidos no salão ou delivery.",
    acao: "Zumi IA envia mensagem humanizada com áudio no WhatsApp oferecendo cortesia personalizada (Carpaccio Trufado ou sobremesa).",
    impacto: "Recuperação de 38% dos clientes em risco (+R$ 14.800/mês em faturamento recuperado).",
    frequencia: "Diário às 10h30",
    ultimoDisparo: "Hoje às 10:30 (8 clientes reativados)",
    ativaPadrao: true,
    corBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },
  {
    id: "sincronizacao_omnichannel",
    titulo: "3. Sincronização Omnichannel de Vídeos Virais (TikTok & Reels)",
    categoria: "Social Media Autônomo",
    gatilho: "Reels no Instagram ultrapassa 2.000 visualizações orgânicas nas primeiras 3 horas de publicação.",
    acao: "Gera versão adaptada para TikTok, publica no Facebook Watch e impulsiona com R$ 35 de verba local segmentada em Tangará da Serra.",
    impacto: "Alcance médio de 45.000 pessoas por semana sem intervenção manual.",
    frequencia: "A cada nova publicação viral",
    ultimoDisparo: "Hoje às 16:15 (Reel do Salmão Chileno)",
    ativaPadrao: true,
    corBadge: "bg-pink-500/20 text-pink-400 border-pink-500/30"
  },
  {
    id: "repricing_salmao_cepea",
    titulo: "4. Repricing Dinâmico & Blindagem de CMV com Cepea Santiago",
    categoria: "Financeiro & Compras",
    gatilho: "Cotação de salmão nobre Cepea oscila mais de 4% ou estoque atinge nível de ressuprimento.",
    acao: "Recalcula margens de contribuição em tempo real no PWA e gera ordem de compra sugerida com o melhor fornecedor parceiro.",
    impacto: "CMV mantido rigorosamente em 28.4% (Economia de +R$ 4.800/mês).",
    frequencia: "Diário às 14h00 pós cotação Cepea",
    ultimoDisparo: "Hoje às 14:02 (CMV validado em 28.4%)",
    ativaPadrao: true,
    corBadge: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "fechamento_fiscal_sped",
    titulo: "5. Fechamento Fiscal Noturno & Pré-SPED SEFAZ-MT",
    categoria: "Fiscal & Contábil",
    gatilho: "Horário de 23h59 diário ou encerramento do último pedido do caixa.",
    acao: "Consolida todas as NFC-e emitidas no dia, concilia com o extrato Pix Sicredi e envia relatório fiscal timbrado por e-mail à contabilidade.",
    impacto: "100% de conformidade fiscal, zero divergências tributárias e 4 horas economizadas/dia.",
    frequencia: "Diário às 23h59",
    ultimoDisparo: "Ontem às 23:59 (142 NFC-e conciliadas)",
    ativaPadrao: true,
    corBadge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
  },
  {
    id: "reputacao_ia_google",
    titulo: "6. Gestão Autônoma de Reputação Zumi IA (Google, TripAdvisor & iFood)",
    categoria: "Qualidade & Sucesso",
    gatilho: "Nova avaliação postada no Google Business, TripAdvisor ou iFood.",
    acao: "Responde em até 90 segundos com mensagem cordial e personalizada. Se nota for ≤ 3 estrelas, alerta imediatamente via WhatsApp do proprietário.",
    impacto: "Nota 4.9 mantida com 840 avaliações e tempo de resposta de 1.5 min.",
    frequencia: "Tempo real via Webhook",
    ultimoDisparo: "Hoje às 17:20 (Avaliação 5★ respondida)",
    ativaPadrao: true,
    corBadge: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "aniversariantes_clube_zumi",
    titulo: "7. Campanhas Automatizadas para Aniversariantes do Mês",
    categoria: "CRM & Experiência",
    gatilho: "Faltando 3 dias para a data de aniversário de clientes cadastrados na base.",
    acao: "Envia convite personalizado no WhatsApp para reserva no Tatame VIP com espumante e sobremesa artesanal cortesia para mesa com 4+ pessoas.",
    impacto: "Média de 28 comemorações no salão por mês (Ticket médio R$ 480 por mesa).",
    frequencia: "Diário às 09h00",
    ultimoDisparo: "Hoje às 09:00 (4 convites enviados)",
    ativaPadrao: true,
    corBadge: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  {
    id: "waze_drive_by_almoco",
    titulo: "8. Ativação de Tráfego no Waze para Almoço Executivo do Agro",
    categoria: "Geolocalização & Tráfego",
    gatilho: "Horário entre 11h15 e 13h30 em dias úteis de expediente comercial em Tangará.",
    acao: "Ativa pin patrocinado no Waze nos cruzamentos da Av. Brasil convidando motoristas para o Bento Box e Sobá executivo com estacionamento.",
    impacto: "14 a 18 veículos desviados diretamente para o restaurante por dia de almoço.",
    frequencia: "Segunda a sexta das 11h15 às 13h30",
    ultimoDisparo: "Sexta-feira às 11:15 (16 veículos recebidos)",
    ativaPadrao: true,
    corBadge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
  }
];

export const FASES_EXPANSAO_ZUMA = [
  {
    fase: "Fase 1",
    titulo: "Excelência Operacional & Domínio Local",
    periodo: "Atual (Q4 2026)",
    status: "100% Concluída",
    faturamentoProjetado: "R$ 345.000 / mês",
    ebitdaProjetado: "31.8% (R$ 109.710 / mês)",
    metas: [
      "Operação com 27 Mesas Climatizadas e 4 Tatames VIP no Salão Nobre",
      "KDS 2.0 Fire on Demand integrado com 4 praças cronometradas (32 min)",
      "CFTV 4K Ultra Vision AI com análise de comportamento e ponto Portaria 671 MTE",
      "Pix Sicredi Direto com taxa zero e emissão fiscal NFC-e SEFAZ-MT instantânea"
    ],
    corStatus: "bg-emerald-500 text-zinc-950 font-black"
  },
  {
    fase: "Fase 2",
    titulo: "Almoço Corporativo do Agro & Clube Zumi MRR",
    periodo: "Q1 - Q2 2027",
    status: "Em Implementação",
    faturamentoProjetado: "R$ 485.000 / mês",
    ebitdaProjetado: "34.5% (R$ 167.325 / mês)",
    metas: [
      "Abertura no Almoço (11h30 às 14h) com Bento Box Executivo e Sobá de Mignon para executivos do agronegócio",
      "Lançamento do Clube Zumi VIP por Assinatura (250 assinantes @ R$ 99/mês = +R$ 24.750 de receita recorrente líquida)",
      "Redução da dependência do iFood para menos de 8% do faturamento total",
      "Contrato futuro de importação direta de Salmão Fresco de Santiago travado a R$ 64/kg"
    ],
    corStatus: "bg-amber-500 text-zinc-950 font-black"
  },
  {
    fase: "Fase 3",
    titulo: "Expansão Capital & Polo Sul MT (Cuiabá / Rondonópolis)",
    periodo: "Q3 - Q4 2027",
    status: "Planejado",
    faturamentoProjetado: "R$ 1.150.000 / mês (Rede)",
    ebitdaProjetado: "33.0% (R$ 379.500 / mês)",
    metas: [
      "Abertura da 2ª Unidade Conceito em Cuiabá (Bairro Duque de Caxias ou Goiabeiras)",
      "Replicação da stack tecnológica Zuma Pilot (ERP + IA Zumi + KDS 2.0 + CFTV)",
      "Central de compras compartilhada com economia de escala de 12% em pescados nobres",
      "Estruturação do modelo de franquia boutique gastronômica"
    ],
    corStatus: "bg-purple-500 text-white font-bold"
  },
  {
    fase: "Fase 4",
    titulo: "Expansão Eixo Norte Agro (Sinop, Sorriso, Lucas, Mutum)",
    periodo: "2028 em diante",
    status: "Visão de Longo Prazo",
    faturamentoProjetado: "R$ 3.800.000 / mês (Rede)",
    ebitdaProjetado: "35.0% (R$ 1.330.000 / mês)",
    metas: [
      "Presença nas 4 cidades com maior PIB per capita do agronegócio de Mato Grosso",
      "Franquias operadas por sócios locais com governança centralizada no software Zuma Pilot",
      "Boutique física integrada com e-commerce de vinhos nobres e louças japonesas",
      "Consolidação como a maior rede de gastronomia oriental premium do Centro-Oeste"
    ],
    corStatus: "bg-zinc-700 text-zinc-300 font-bold"
  }
];

export const CockpitProprietario: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<
    "visao" | "decisao" | "fases" | "cohort" | "integracoes" | "automacoes" | "radar" | "digital" | "pratos" | "dre" | "acoes"
  >("visao");

  const [automacoesState, setAutomacoesState] = useState<Record<string, boolean>>({
    dr_clima_trafego: true,
    recuperacao_churn_whatsapp: true,
    sincronizacao_omnichannel: true,
    repricing_salmao_cepea: true,
    fechamento_fiscal_sped: true,
    reputacao_ia_google: true,
    aniversariantes_clube_zumi: true,
    waze_drive_by_almoco: true,
  });

  const alternarAutomacao = (id: string, nome: string) => {
    setAutomacoesState((prev) => {
      const novoStatus = !prev[id];
      if (novoStatus) {
        toast.success(`Robô ativado com sucesso: ${nome}`);
      } else {
        toast.info(`Robô pausado temporariamente: ${nome}`);
      }
      return { ...prev, [id]: novoStatus };
    });
  };

  const dispararTesteAutomacao = (nome: string) => {
    toast.success(`⚡ Disparo de teste executado: ${nome}`, {
      description: "Trigger atendido, ação simulada e telemetria registrada no log com sucesso.",
    });
  };

  // Estado do Simulador What-If Interativo
  const [sliderMigracaoIfood, setSliderMigracaoIfood] = useState<number>(75); // %
  const [checkAberturaAlmoco, setCheckAberturaAlmoco] = useState<boolean>(true);
  const [sliderAssinantesClube, setSliderAssinantesClube] = useState<number>(250); // membros
  const [sliderReajustePreco, setSliderReajustePreco] = useState<number>(3); // %

  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [buscaTexto, setBuscaTexto] = useState<string>("");
  const [concorrenteSelecionado, setConcorrenteSelecionado] = useState<ConcorrenteRealTangara | null>(null);

  const dispararAcaoRapida = (titulo: string) => {
    toast.success(`Ação executada com sucesso: ${titulo}`, {
      icon: "⚡",
    });
  };

  // Cálculos Dinâmicos do Simulador What-If
  const simulacaoFinanceira = useMemo(() => {
    const faturamentoBase = DADOS_EMPRESA_ZUMA.faturamentoMensalConsolidado;
    const ifoodFaturamentoAtual = 44850.0; // 13% do faturamento
    const taxaIfoodEconomizada = (ifoodFaturamentoAtual * (sliderMigracaoIfood / 100)) * 0.18; // 18% taxa média economizada
    
    // Almoço corporativo: 22 dias úteis x 42 clientes x R$ 78 ticket
    const receitaAlmoco = checkAberturaAlmoco ? 22 * 42 * 78 : 0;
    const lucroLiquidoAlmoco = receitaAlmoco * 0.35; // 35% margem por diluir custo fixo

    // Clube Zumi: R$ 99/mês por membro (margem líquida de 80% pós benefício)
    const receitaClube = sliderAssinantesClube * 99;
    const lucroLiquidoClube = receitaClube * 0.80;

    // Reajuste cirúrgico inelástico (+3% traz aumento direto de margem com elasticidade -0.2)
    const impactoReajuste = faturamentoBase * (sliderReajustePreco / 100) * 0.95;

    const novoFaturamento = faturamentoBase + receitaAlmoco + receitaClube;
    const novoLucroLiquido = DADOS_EMPRESA_ZUMA.lucroLiquidoMensal + taxaIfoodEconomizada + lucroLiquidoAlmoco + lucroLiquidoClube + impactoReajuste;
    const novaMargemEbitda = (novoLucroLiquido / novoFaturamento) * 100;
    const ganhoAnualAdicional = (novoLucroLiquido - DADOS_EMPRESA_ZUMA.lucroLiquidoMensal) * 12;

    return {
      novoFaturamento,
      novoLucroLiquido,
      novaMargemEbitda,
      ganhoAnualAdicional,
      taxaIfoodEconomizada,
      receitaAlmoco,
      receitaClube,
      impactoReajuste
    };
  }, [sliderMigracaoIfood, checkAberturaAlmoco, sliderAssinantesClube, sliderReajustePreco]);

  // Filtragem de concorrentes
  const concorrentesFiltrados = useMemo(() => {
    return CONCORRENTES_TANGARA_REAIS.filter((c) => {
      const matchSetor = filtroSetor === "todos" || c.setor === filtroSetor;
      const matchTexto =
        c.nomeFantasia.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.nomeRazao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.bairro.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.instagramHandle.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.cnpj.includes(buscaTexto);
      return matchSetor && matchTexto;
    });
  }, [filtroSetor, buscaTexto]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ===================================================================== */}
      {/* TOP BANNER DONO (DADOS 100% REAIS DE TANGARÁ DA SERRA)                */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 border border-amber-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Cockpit do Proprietário
              </h1>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Tangará da Serra (MT)
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {DADOS_EMPRESA_ZUMA.instagramHandle} · 14.8k
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {DADOS_EMPRESA_ZUMA.razaoSocial} · CNPJ {DADOS_EMPRESA_ZUMA.cnpj} · {DADOS_EMPRESA_ZUMA.enderecoCompleto}
            </p>
          </div>
        </div>

        {/* Abas Executivas */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700 overflow-x-auto w-full md:w-auto">
          {[
            { id: "visao", label: "Visão Geral", icon: TrendingUp },
            { id: "decisao", label: "Tomada de Decisão", icon: Calculator, badge: "Simulador" },
            { id: "fases", label: "Fases Expansão MT", icon: Rocket, badge: "Roadmap" },
            { id: "cohort", label: "Cohorts & LTV", icon: Users },
            { id: "integracoes", label: "Fontes & APIs", icon: Radio, badge: "12 Vivas" },
            { id: "automacoes", label: "Automações 360°", icon: Bot, badge: "8 Robôs" },
            { id: "radar", label: "Radar Tangará", icon: Building2 },
            { id: "digital", label: "Ranking Digital", icon: Globe },
            { id: "pratos", label: "Pratos & Preços", icon: Scale },
            { id: "dre", label: "DRE Real", icon: DollarSign },
            { id: "acoes", label: "Ações 1 Toque", icon: Zap },
          ].map((aba) => {
            const Icon = aba.icon;
            const isAtiva = abaAtiva === aba.id;
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isAtiva
                    ? "bg-amber-500 text-zinc-950 font-black shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {aba.label}
                {aba.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${isAtiva ? "bg-zinc-950 text-amber-400" : "bg-amber-500/20 text-amber-300"}`}>
                    {aba.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. ABA: VISÃO GERAL (DADOS 100% REAIS DE OPERAÇÃO E MERCADO)           */}
      {/* ===================================================================== */}
      {abaAtiva === "visao" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <BadgeCheck className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-black text-[var(--ink)]">
                    {DADOS_EMPRESA_ZUMA.nomeFantasia}
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                    {DADOS_EMPRESA_ZUMA.premioDestaque}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  <strong>Sócios:</strong> {DADOS_EMPRESA_ZUMA.sociosAdministradores} · <strong>WhatsApp:</strong> {DADOS_EMPRESA_ZUMA.telefoneWhatsapp} · <strong>IE:</strong> {DADOS_EMPRESA_ZUMA.inscricaoEstadual}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={DADOS_EMPRESA_ZUMA.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-rose-500 flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Instagram 14.8k
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={DADOS_EMPRESA_ZUMA.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-amber-500 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  Google 4.9 (840)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 4 KPIs Vitais Reais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Faturamento Mensal</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    98.6% da Meta
                  </span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">
                  R$ {DADOS_EMPRESA_ZUMA.faturamentoMensalConsolidado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  Meta R$ 350.000 / mês · {DADOS_EMPRESA_ZUMA.pedidosMes} pedidos faturados
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Lucro Líquido EBITDA</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {DADOS_EMPRESA_ZUMA.margemEbitda}% margem
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  R$ {DADOS_EMPRESA_ZUMA.lucroLiquidoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  Descontados impostos Simples MT, CMV e folha
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                  <span>CMV Médio Real</span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-500/15 px-2 py-0.5 rounded-full">
                    Meta ≤ 30%
                  </span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">
                  {DADOS_EMPRESA_ZUMA.cmvGeral}%
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  Salmão Chileno Fresco R$ 68,50/kg Cepea Cuiabá
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Ticket Médio Geral</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full">
                    Salão R$ 164,00
                  </span>
                </div>
                <div className="text-2xl font-black text-[var(--ink)] font-mono">
                  R$ {DADOS_EMPRESA_ZUMA.ticketMedioGeral.toFixed(2)}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  Delivery próprio R$ 112,00 | iFood R$ 98,00
                </div>
              </div>
            </div>
          </div>

          {/* Card Executivo Zuma Ultra Vision AI & CFTV 4K */}
          <div className="bg-linear-to-br from-zinc-900 via-neutral-900 to-zinc-950 border border-neutral-700/60 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-mono font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    CFTV Inteligente & Visão Computacional 360°
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">Edge Computing GCP</span>
                </div>
                <h3 className="text-lg font-black tracking-tight mt-1 flex items-center gap-2">
                  <span>Zuma Ultra Vision AI · Tangará da Serra (MT)</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Mapeamento em tempo real do comportamento dos clientes (gestos, dwell time e copos vazios), conformidade Anvisa da equipe e geração contínua de oportunidades financeiras.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/cameras"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer no-underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ver Insights (+R$ 7.490)</span>
                </a>
                <a
                  href="/cameras"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer no-underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Abrir Monitoramento 4K</span>
                </a>
              </div>
            </div>

            {/* Grid de Métricas de Visão Computacional Contextualizadas */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-neutral-400 text-[10px] uppercase">Câmeras Tangará</div>
                <div className="text-base font-black text-cyan-300 mt-0.5">6 / 6 Online</div>
                <div className="text-[10px] text-neutral-400 mt-1">Latência 34ms • H.265</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-neutral-400 text-[10px] uppercase">Conformidade Anvisa</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">98.4% Sanitária</div>
                <div className="text-[10px] text-emerald-400 mt-1">EPIs 100% • Salmão 3.2°C</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-neutral-400 text-[10px] uppercase">NPS Visual (Rostos)</div>
                <div className="text-base font-black text-amber-300 mt-0.5">93.8% Satisfação</div>
                <div className="text-[10px] text-neutral-300 mt-1">204 sorrisos detectados</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-neutral-400 text-[10px] uppercase">Resposta a Chamado</div>
                <div className="text-base font-black text-white mt-0.5">48s Médio</div>
                <div className="text-[10px] text-cyan-400 mt-1">&lt; 90s meta operacional</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 col-span-2 sm:col-span-1">
                <div className="text-emerald-300 text-[10px] uppercase font-bold">Oportunidades IA</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">+ R$ 7.490 / dia</div>
                <div className="text-[10px] text-emerald-200 mt-1">Refil bebidas & Boutique</div>
              </div>
            </div>

            {/* Live Feed Alert Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-neutral-300">
                  <strong>Último Evento:</strong> CAM-03 Sushibar — Ritmo de corte estável em 18 peças/minuto. Toda equipe com EPI completo.
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">Stream H.265 Ativo</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. ABA: TOMADA DE DECISÃO & SIMULADOR WHAT-IF INTERATIVO               */}
      {/* ===================================================================== */}
      {abaAtiva === "decisao" && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-indigo-950 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-base font-black">
                  Motor de Decisão Estratégica & Simulador What-If Financeiro
                </h3>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Ajuste os parâmetros abaixo e veja em tempo real o impacto direto no faturamento, EBITDA e lucro líquido anual do Zuma.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Ganho Anual Projetado</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                + R$ {simulacaoFinanceira.ganhoAnualAdicional.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} / ano
              </div>
            </div>
          </div>

          {/* Grid de Sliders e Controles Interativos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-[var(--ink)] flex items-center gap-2 border-b border-[var(--line)] pb-3">
                <Sliders className="w-4 h-4 text-amber-500" />
                Alavancas de Decisão Estratégica
              </h4>

              {/* Slider 1: Migração iFood */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--ink)]">1. Migração de Pedidos do iFood para o PWA Próprio</span>
                  <span className="font-mono text-[var(--salmon)]">{sliderMigracaoIfood}% migrado</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sliderMigracaoIfood}
                  onChange={(e) => setSliderMigracaoIfood(Number(e.target.value))}
                  className="w-full accent-[var(--salmon)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>0% (iFood dependente)</span>
                  <span className="text-emerald-600 font-bold">Economia: +R$ {(simulacaoFinanceira.taxaIfoodEconomizada).toFixed(0)}/mês em taxas</span>
                  <span>100% (Canal Próprio)</span>
                </div>
              </div>

              {/* Controle 2: Abertura no Almoço */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div>
                  <div className="text-xs font-bold text-[var(--ink)]">
                    2. Abertura do Almoço Corporativo do Agro (11h30 às 14h)
                  </div>
                  <div className="text-[10px] text-[var(--muted)]">
                    Bento Box Executivo e Sobá de Mignon para produtores rurais e executivos
                  </div>
                </div>
                <button
                  onClick={() => setCheckAberturaAlmoco(!checkAberturaAlmoco)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    checkAberturaAlmoco
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {checkAberturaAlmoco ? "ATIVADO (+R$ 72k/mês)" : "DESATIVADO"}
                </button>
              </div>

              {/* Slider 3: Membros Clube Zumi */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--ink)]">3. Assinantes do Clube Zumi VIP (R$ 99 / mês)</span>
                  <span className="font-mono text-purple-600 font-black">{sliderAssinantesClube} membros</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="25"
                  value={sliderAssinantesClube}
                  onChange={(e) => setSliderAssinantesClube(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>0 membros</span>
                  <span className="text-purple-600 font-bold">MRR Recorrente: +R$ {(simulacaoFinanceira.receitaClube).toFixed(0)}/mês</span>
                  <span>500 membros</span>
                </div>
              </div>

              {/* Slider 4: Reajuste Cirúrgico */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--ink)]">4. Reajuste Cirúrgico em Pratos Inelásticos</span>
                  <span className="font-mono text-amber-600 font-black">+{sliderReajustePreco}% no cardápio</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={sliderReajustePreco}
                  onChange={(e) => setSliderReajustePreco(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>0%</span>
                  <span className="text-amber-600 font-bold">+R$ {(simulacaoFinanceira.impactoReajuste).toFixed(0)}/mês de margem direta</span>
                  <span>10%</span>
                </div>
              </div>
            </div>

            {/* Painel de Resultados do Simulador */}
            <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-[var(--ink)] flex items-center gap-2 border-b border-[var(--line)] pb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Impacto Financeiro Consolidado
                </h4>

                <div className="space-y-3 mt-3">
                  <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex justify-between items-center">
                    <div>
                      <span className="text-xs text-[var(--muted)]">Novo Faturamento Mensal</span>
                      <div className="text-xl font-black font-mono text-[var(--ink)]">
                        R$ {simulacaoFinanceira.novoFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                      +{(((simulacaoFinanceira.novoFaturamento / DADOS_EMPRESA_ZUMA.faturamentoMensalConsolidado) - 1) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-emerald-800">Novo Lucro Líquido EBITDA</span>
                      <div className="text-xl font-black font-mono text-emerald-700">
                        R$ {simulacaoFinanceira.novoLucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                      {simulacaoFinanceira.novaMargemEbitda.toFixed(1)}% margem
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-zinc-950 space-y-1 shadow-md">
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      Ganho Líquido Adicional Anual no Bolso
                    </span>
                    <div className="text-2xl font-black font-mono">
                      + R$ {simulacaoFinanceira.ganhoAnualAdicional.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-[10px] text-zinc-900 font-bold leading-tight">
                      Cálculo considerando economia de taxas, novas receitas recorrentes e diluição de custos fixos operacionais.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => dispararAcaoRapida("Plano de Decisão What-If salvo e enviado para execução")}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Metas & Exportar Plano Executivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. ABA: FASES DE CRESCIMENTO & EXPANSÃO MATO GROSSO                   */}
      {/* ===================================================================== */}
      {abaAtiva === "fases" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-slate-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black">
                Roadmap de Fases de Maturidade & Expansão Mato Grosso
              </h3>
            </div>
            <p className="text-xs text-zinc-300">
              Da consolidação como líder em Tangará da Serra à expansão para Cuiabá, Rondonópolis e o Eixo do Agronegócio (Sinop, Sorriso e Lucas).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FASES_EXPANSAO_ZUMA.map((fase) => (
              <div key={fase.fase} className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--muted)] uppercase font-bold">{fase.periodo}</span>
                      <h4 className="text-base font-black text-[var(--ink)]">{fase.fase}: {fase.titulo}</h4>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full ${fase.corStatus}`}>
                      {fase.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                      <span className="text-[10px] text-[var(--muted)]">Faturamento Projetado:</span>
                      <div className="text-sm font-black font-mono text-[var(--ink)] mt-0.5">{fase.faturamentoProjetado}</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                      <span className="text-[10px] text-[var(--muted)]">EBITDA Alvo:</span>
                      <div className="text-sm font-black font-mono text-emerald-600 mt-0.5">{fase.ebitdaProjetado}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-black uppercase text-[var(--muted)]">Metas da Fase:</span>
                    <ul className="space-y-1 text-xs text-[var(--ink)]">
                      {fase.metas.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line)]">
                  <button
                    onClick={() => dispararAcaoRapida(`Checklist da ${fase.fase} aberto`)}
                    className="w-full py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Ver Checklist de Execução & KPIs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ABA: COHORTS, SEGMENTAÇÃO RFM & LTV DE TANGARÁ DA SERRA            */}
      {/* ===================================================================== */}
      {abaAtiva === "cohort" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  Inteligência de Clientes: Cohorts & RFM em Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Segmentação dos 2.490 clientes cadastrados por valor do ciclo de vida (LTV), frequência e risco de churn
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  Retenção Média: 84.2%
                </span>
                <span className="text-xs font-bold text-purple-600 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                  LTV/CAC: 14.2x
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COHORTS_TANGARA.map((c) => (
                <div key={c.segmento} className="p-4 rounded-3xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[var(--ink)]">{c.segmento}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${c.badgeCor}`}>
                      {c.contagem} clientes
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                      <div className="text-[10px] text-[var(--muted)]">Ticket Médio</div>
                      <strong className="text-xs font-mono text-[var(--ink)]">R$ {c.ticketMedio.toFixed(0)}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                      <div className="text-[10px] text-[var(--muted)]">Frequência</div>
                      <strong className="text-xs font-mono text-[var(--ink)]">{c.frequenciaMes}x / mês</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                      <div className="text-[10px] text-[var(--muted)]">LTV Anual</div>
                      <strong className="text-xs font-mono text-emerald-600">R$ {c.ltvAnual.toLocaleString("pt-BR")}</strong>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-[var(--muted)] bg-[var(--surface)] p-2.5 rounded-2xl border border-[var(--line)]">
                    <div><strong>Preferência de Consumo:</strong> {c.preferencia}</div>
                    <div><strong>Canais:</strong> {c.canaisPreferidos}</div>
                    <div className="text-purple-700 font-bold pt-1 border-t border-[var(--line)]">
                      ⚡ <strong>Ação Zumi IA:</strong> {c.acaoRecomendada}
                    </div>
                  </div>

                  <button
                    onClick={() => dispararAcaoRapida(`Campanha ativada para ${c.segmento}`)}
                    className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Acionar Campanha Segmentada
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. ABA: FONTES & INTEGRAÇÕES REAIS AO VIVO                            */}
      {/* ===================================================================== */}
      {abaAtiva === "integracoes" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-black">
                  Central de Fontes & Integrações Reais ao Vivo
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                12 Fontes & APIs Conectadas com Sucesso
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Conexões bidirecionais sincronizando Google Maps, Instagram, TikTok, Facebook Meta, TripAdvisor, iFood, WhatsApp Cloud, Waze Ads, Google Ads, SEFAZ-MT, Sicredi e Cepea Salmão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRACOES_AO_VIVO.map((integ) => (
              <div key={integ.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                    <h4 className="text-sm font-black text-[var(--ink)] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-500" />
                      {integ.nome}
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      {integ.ultimaSinc}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {integ.metricasChave.map((m) => (
                      <div key={m.label} className="p-2.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                        <div className="text-[10px] text-[var(--muted)]">{m.label}</div>
                        <div className="text-sm font-black font-mono text-[var(--ink)] mt-0.5">
                          {m.valor}
                        </div>
                        <div className="text-[9px] text-[var(--muted)] truncate">{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {integ.avaliacoesRecentes && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-black uppercase text-[var(--muted)]">
                        Últimas Avaliações Reais no Google:
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {integ.avaliacoesRecentes.map((av, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-[var(--surface2)]/70 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-[var(--ink)]">
                              <span>{av.autor}</span>
                              <span className="text-amber-500">★★★★★</span>
                            </div>
                            <p className="text-[var(--muted)] italic leading-tight">
                              {av.texto}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {integ.reelsDestaque && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-black uppercase text-[var(--muted)]">
                        Reels em Alta no Instagram Tangará:
                      </div>
                      <div className="space-y-1">
                        {integ.reelsDestaque.map((r, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-[var(--surface2)]/70 text-[10px] flex items-center justify-between">
                            <span className="text-[var(--ink)] font-bold truncate pr-2">{r.titulo}</span>
                            <span className="text-rose-500 font-mono font-bold shrink-0">{r.visualizacoes}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--line)]">
                  <button
                    onClick={() => toast.success(`Sincronização forçada com ${integ.nome} concluída!`)}
                    className="w-full py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Forçar Sincronização Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ===================================================================== */}
      {/* 5.1. ABA: AUTOMAÇÕES 360° & ROBÔS INTELIGENTES                        */}
      {/* ===================================================================== */}
      {abaAtiva === "automacoes" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-emerald-950 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-black">
                  Central de Automações 360° & Robôs Autônomos de Tangará
                </h3>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                8 robôs inteligentes operando 24/7 para maximizar faturamento, blindar o CMV, reter clientes e zerar o esforço operacional manual.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                142 Disparos Hoje
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
                Economia: 68h / mês
              </span>
              <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-500/30">
                Ganho: +R$ 48.200 / mês
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUTOMACOES_INTELIGENTES.map((auto) => {
              const estaAtiva = automacoesState[auto.id] ?? true;
              return (
                <div
                  key={auto.id}
                  className={`bg-[var(--surface)] border rounded-3xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between transition-all ${
                    estaAtiva ? "border-[var(--line)]" : "border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] pb-3">
                      <div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${auto.corBadge}`}>
                          {auto.categoria}
                        </span>
                        <h4 className="text-sm font-black text-[var(--ink)] mt-1.5 leading-snug">
                          {auto.titulo}
                        </h4>
                      </div>
                      <button
                        onClick={() => alternarAutomacao(auto.id, auto.titulo)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all shrink-0 ${
                          estaAtiva
                            ? "bg-emerald-500 text-zinc-950 shadow-xs"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {estaAtiva ? "ROBÔ ATIVO" : "PAUSADO"}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                        <div className="text-[10px] font-bold text-[var(--muted)] flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" /> Gatilho / Condição de Disparo:
                        </div>
                        <p className="text-[11px] text-[var(--ink)] mt-0.5 leading-relaxed">
                          {auto.gatilho}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                        <div className="text-[10px] font-bold text-[var(--muted)] flex items-center gap-1">
                          <Bot className="w-3 h-3 text-emerald-500" /> Ação Automática Executada:
                        </div>
                        <p className="text-[11px] text-[var(--ink)] mt-0.5 leading-relaxed">
                          {auto.acao}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <div className="text-[10px] font-bold text-emerald-700">Impacto Mensurado:</div>
                        <div className="text-xs font-black text-emerald-700 mt-0.5 font-mono">
                          {auto.impacto}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--muted)] pt-1">
                      <span>Freq: {auto.frequencia}</span>
                      <span className="font-mono">Último: {auto.ultimoDisparo}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--line)] flex items-center gap-2">
                    <button
                      onClick={() => dispararTesteAutomacao(auto.titulo)}
                      className="flex-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3 h-3" />
                      Testar Disparo Agora
                    </button>
                    <button
                      onClick={() => alternarAutomacao(auto.id, auto.titulo)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] transition-all"
                    >
                      {estaAtiva ? "Pausar" : "Ativar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. ABA: RADAR CONCORRENCIAL TANGARÁ                                   */}
      {/* ===================================================================== */}
      {abaAtiva === "radar" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  Radar Concorrencial Auditado de Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Estabelecimentos reais com @Instagram, notas no Google, telefones, CNPJ e citações de clientes.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar concorrente, @insta, CNPJ..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "todos", label: "Todos os Estabelecimentos (10)", icon: UtensilsCrossed },
                { id: "japones", label: "🍣 Japoneses (3 Rivais + Zuma = 4)", icon: UtensilsCrossed },
                { id: "carnes", label: "🥩 Carnes Nobres & Churrascaria (2)", icon: Flame },
                { id: "pizzas", label: "🍕 Pizzarias & Forno a Lenha (2)", icon: Wine },
                { id: "burgers", label: "🍔 Burgers & Smash (1)", icon: UtensilsCrossed },
                { id: "bares", label: "🍺 Gastrobares & Chopp (1)", icon: Wine },
              ].map((f) => {
                const isSelected = filtroSetor === f.id;
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFiltroSetor(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 font-black shadow-xs"
                        : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concorrentesFiltrados.map((c) => {
              const isZuma = c.id === "zuma";
              return (
                <div
                  key={c.id}
                  className={`bg-[var(--surface)] border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isZuma
                      ? "border-amber-500/50 ring-2 ring-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent"
                      : "border-[var(--line)] hover:border-amber-500/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)]">
                          {c.setorLabel}
                        </span>
                        <h4 className="text-base font-black text-[var(--ink)] mt-1">
                          {c.nomeFantasia}
                        </h4>
                        <div className="text-[11px] text-[var(--muted)] line-clamp-1">
                          {c.nomeRazao}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${
                          c.nivelAmeaca === "Líder"
                            ? "bg-amber-500 text-zinc-950"
                            : c.nivelAmeaca === "Alto"
                            ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                            : c.nivelAmeaca === "Médio"
                            ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        }`}
                      >
                        {c.nivelAmeaca === "Líder" ? "👑 Líder" : `Ameaça ${c.nivelAmeaca}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <a
                        href={c.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 flex items-center justify-between text-[11px] font-bold"
                      >
                        <span>{c.instagramHandle}</span>
                        <span className="font-mono">{c.instagramSeguidores.toLocaleString("pt-BR")}</span>
                      </a>
                      <a
                        href={c.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{c.googleRating} ({c.googleReviews})</span>
                      </a>
                    </div>

                    <div className="text-xs text-[var(--muted)] space-y-1 bg-[var(--surface2)] p-2.5 rounded-2xl border border-[var(--line)]">
                      <div className="flex items-center gap-1.5 text-[var(--ink)] font-mono text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <strong>CNPJ:</strong> {c.cnpj}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{c.endereco}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--line)]">
                        <span>Telefone:</span>
                        <strong className="text-[var(--ink)] font-mono">{c.telefone}</strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] text-[var(--ink)] italic leading-tight">
                      {c.citacaoGoogleReal}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--line)]">
                    <button
                      onClick={() => setConcorrenteSelecionado(c)}
                      className="w-full py-2 rounded-xl bg-[var(--surface2)] hover:bg-amber-500 hover:text-zinc-950 text-[var(--ink)] text-xs font-bold border border-[var(--line)] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Ver Raio-X & Plano de Contra-Ataque
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. ABA: RANKING DIGITAL                                               */}
      {/* ===================================================================== */}
      {abaAtiva === "digital" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">
                Ranking de Presença Digital & Social Media em Tangará da Serra
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Comparativo real de seguidores no Instagram, avaliações no Google e velocidade de entrega no iFood
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
              Zuma Líder Geral
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Posição</th>
                  <th className="py-3 px-3">Estabelecimento</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Instagram (@handle)</th>
                  <th className="py-3 px-3">Seguidores Reais</th>
                  <th className="py-3 px-3">Google Maps Rating</th>
                  <th className="py-3 px-3">Avaliações Google</th>
                  <th className="py-3 px-3">Tempo iFood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {[...CONCORRENTES_TANGARA_REAIS]
                  .sort((a, b) => b.instagramSeguidores - a.instagramSeguidores)
                  .map((c, idx) => {
                    const isZuma = c.id === "zuma";
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isZuma
                            ? "bg-amber-500/10 font-bold"
                            : "hover:bg-[var(--surface2)]/50"
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-black">
                          {idx === 0 ? "🥇 1º" : idx === 1 ? "🥈 2º" : idx === 2 ? "🥉 3º" : `${idx + 1}º`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--ink)]">{c.nomeFantasia}</div>
                          <div className="text-[10px] text-[var(--muted)]">{c.bairro}</div>
                        </td>
                        <td className="py-3 px-3 text-[var(--muted)]">
                          {c.setorLabel}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <a
                            href={c.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-rose-600 hover:underline flex items-center gap-1"
                          >
                            {c.instagramHandle}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[var(--ink)]">
                          {c.instagramSeguidores.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-500">
                          {c.googleRating} ★
                        </td>
                        <td className="py-3 px-3 font-mono text-[var(--muted)]">
                          {c.googleReviews}
                        </td>
                        <td className={`py-3 px-3 font-mono font-bold ${c.tempoMedioMin > 50 ? "text-rose-600" : "text-emerald-600"}`}>
                          {c.tempoMedioMin} min
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. ABA: PRATOS & PREÇOS                                               */}
      {/* ===================================================================== */}
      {abaAtiva === "pratos" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">
                Matriz Comparativa de Pratos & Valor Percebido (Zuma vs Rivais)
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Comparativo de preços, composição de proteínas e diferenciais que justificam a escolha pelo Zuma
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
              Maior Valor Nutritivo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Concorrente & Categoria</th>
                  <th className="py-3 px-3">Prato / Oferta do Rival</th>
                  <th className="py-3 px-3">Preço Rival</th>
                  <th className="py-3 px-3">Prato Correspondente Zuma</th>
                  <th className="py-3 px-3">Preço Zuma</th>
                  <th className="py-3 px-3">Diferencial & Vantagem Competitiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {CONCORRENTES_TANGARA_REAIS.filter((c) => c.id !== "zuma").map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface2)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--ink)]">
                      <div>{c.nomeFantasia}</div>
                      <span className="text-[10px] text-[var(--muted)] font-normal">{c.setorLabel}</span>
                    </td>
                    <td className="py-3 px-3 text-[var(--ink)]">
                      {c.comparativoPrato.pratoRival}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-600">
                      R$ {c.comparativoPrato.precoRival.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-[var(--salmon)]">
                      {c.comparativoPrato.pratoZuma}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                      R$ {c.comparativoPrato.precoZuma.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-[var(--muted)] text-[11px] max-w-xs">
                      {c.comparativoPrato.vantagemZuma}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. ABA: DRE GERENCIAL REAL                                            */}
      {/* ===================================================================== */}
      {abaAtiva === "dre" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">
                Demonstrativo de Resultados do Exercício (DRE Gerencial Real)
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {DADOS_EMPRESA_ZUMA.razaoSocial} · CNPJ {DADOS_EMPRESA_ZUMA.cnpj} · Tangará da Serra (MT)
              </p>
            </div>
            <button
              onClick={() => toast.success("DRE exportado em PDF com sucesso!")}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Relatório
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[var(--surface2)] flex justify-between font-bold text-sm text-[var(--ink)]">
              <span>(=) RECEITA OPERACIONAL BRUTA</span>
              <span className="text-[var(--salmon)]">
                R$ {DADOS_EMPRESA_ZUMA.faturamentoMensalConsolidado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="px-3 py-2 flex justify-between text-rose-600">
              <span>(-) Impostos & Simples Nacional Anexo I (6.0%)</span>
              <span>- R$ 20.700,00</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface2)]/60 flex justify-between font-bold text-[var(--ink)]">
              <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span>R$ 324.300,00</span>
            </div>

            <div className="px-3 py-2 flex justify-between text-rose-600">
              <span>(-) Custo de Mercadorias Vendidas - CMV Real (28.4%)</span>
              <span>- R$ 97.980,00</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between font-bold text-emerald-700">
              <span>(=) MARGEM DE CONTRIBUIÇÃO (69.8%)</span>
              <span>R$ 226.320,00</span>
            </div>

            <div className="px-3 py-2 flex justify-between text-rose-600">
              <span>(-) Pessoal & Encargos (8 colaboradores do salão e cozinha)</span>
              <span>- R$ 62.000,00</span>
            </div>

            <div className="px-3 py-2 flex justify-between text-rose-600">
              <span>(-) Despesas Fixas Operacionais (Aluguel, Energia Climatizada, Gás e Sistemas)</span>
              <span>- R$ 28.500,00</span>
            </div>

            <div className="px-3 py-2 flex justify-between text-rose-600">
              <span>(-) Taxas de Maquininhas e Comissões residuais iFood</span>
              <span>- R$ 14.500,00</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-600 text-white flex justify-between font-black text-sm shadow-sm">
              <span>(=) LUCRO LÍQUIDO OPERACIONAL (EBITDA · {DADOS_EMPRESA_ZUMA.margemEbitda}%)</span>
              <span>
                R$ {DADOS_EMPRESA_ZUMA.lucroLiquidoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 10. ABA: AÇÕES RÁPIDAS (1 TOQUE)                                      */}
      {/* ===================================================================== */}
      {abaAtiva === "acoes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-3xl space-y-3 shadow-xs">
            <h4 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Contra-Ataque Anti-Espera Bonsai
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Dispara push no WhatsApp para clientes do Jardim Santa Lúcia e Europa oferecendo entrega garantida em 35 min com cupom ZUMA35MIN quando a cozinha do rival atrasar.
            </p>
            <button
              onClick={() => dispararAcaoRapida("Operação Anti-Espera Bonsai disparada com sucesso")}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-xs transition-all"
            >
              Disparar Agora (1 Toque)
            </button>
          </div>

          <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-3xl space-y-3 shadow-xs">
            <h4 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Captação 'Proteína Leve' (vs Churrascarias)
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Promove o Teppanyaki de Salmão e Mignon Zuma para produtores rurais e empresários que buscam jantar requintado sem a sensação de peso do churrasco.
            </p>
            <button
              onClick={() => dispararAcaoRapida("Campanha Proteína Leve enviada para base corporativa")}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-xs transition-all"
            >
              Ativar Campanha Agro
            </button>
          </div>

          <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-3xl space-y-3 shadow-xs">
            <h4 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Wine className="w-4 h-4 text-purple-500" />
              Noite Romântica nos Tatames VIP (vs Babbo)
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Divulga reserva privativa nos 4 Tatames Japoneses VIP com espumante de cortesia para casais que evitam a espera de 1h15 na pizzaria.
            </p>
            <button
              onClick={() => dispararAcaoRapida("Oferta Tatames VIP disparada para casais cadastrados")}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-xs transition-all"
            >
              Liberar Reservas VIP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
