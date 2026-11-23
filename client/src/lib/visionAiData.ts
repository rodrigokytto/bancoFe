export interface CameraStream {
  id: string;
  name: string;
  location: string;
  resolution: string;
  fps: number;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
  latencyMs: number;
  modelsActive: string[];
  metrics: {
    peopleDetected: number;
    tablesOccupied?: number;
    waiterInteractions?: number;
    handsRaised?: number;
    emptyGlassesDetected?: number;
    platesFinished?: number;
    hygieneScorePercent?: number;
    dishesWaitingHot?: number;
    queueLength?: number;
    averageDwellMinutes?: number;
    boutiqueVisitors?: number;
  };
  lastAlert?: {
    type: "INFO" | "WARNING" | "CRITICAL";
    message: string;
    timestamp: string;
  };
}

export interface StaffBehaviorReport {
  employeeId: string;
  name: string;
  role: "SUSHIMAN" | "GARCOM" | "COZINHEIRO" | "CAIXA";
  stationTimePercent: number;
  responsivenessScore: number;
  hygieneComplianceScore: number;
  speedScore: number;
  proactivityScore: number;
  activeSector: string;
  handWashLastMinutes: number;
  avgResponseSeconds: number;
  upsellAttemptsToday: number;
  summary: string;
  highlights: string[];
}

export interface ClientBehaviorReport {
  totalClientsToday: number;
  averageMealDurationMinutes: number;
  averageWaitTimeInitialMinutes: number;
  satisfactionVisualScorePercent: number;
  queuePeakHour: string;
  tableTurnoverRate: number;
  dwellByArea: {
    area: string;
    avgMinutes: number;
    ticketMedio: number;
    status: "ideal" | "atencao" | "otimo";
  }[];
  gesturesDetected: {
    handsRaisedToday: number;
    emptyGlassesNow: number;
    platesFinishedNow: number;
    seekingLookNow: number;
    menuHesitationNow: number;
  };
  visualEmotions: {
    delightSmilePercent: number;
    neutralConversingPercent: number;
    hesitationOrDiscomfortPercent: number;
  };
  boutiqueCrossOver: {
    visitorsFromRestaurantToday: number;
    conversionRatePercent: number;
    piecesTriedOrBought: number;
    additionalRevenueToday: number;
  };
  alertCounts: {
    handRaiseWaitingTooLong: number;
    abandonedQueue: number;
    unattendedTableOver5Min: number;
  };
}

export interface VisionAiInsight {
  id: string;
  category: "OPPORTUNITY" | "BOTTLENECK" | "IMPROVEMENT" | "SANITARY";
  title: string;
  description: string;
  estimatedFinancialImpact?: string;
  priority: "ALTA" | "MEDIA" | "CRITICA" | "INFORMATIVA";
  actionLabel: string;
  actionPayload: string;
  sourceCamera: string;
  affectedEntity: string;
  implemented: boolean;
}

export interface VisionDailyReport {
  date: string;
  shift: string;
  unit: string;
  totalPeopleAudited: number;
  anvisaComplianceGlobal: number;
  npsVisualBiometric: number;
  avgWaiterResponseTimeSec: number;
  totalInsightsGenerated: number;
  potentialRevenueGain: string;
  aiExecutiveSummary: string;
  anvisaAuditingChecklist: {
    item: string;
    status: "CONFORME" | "ALERTA" | "NAO_APLICAVEL";
    evidence: string;
  }[];
  topOpportunities: string[];
  bottlenecksIdentified: string[];
}

export const CAMERAS_REGISTRY: CameraStream[] = [
  {
    id: "cam-01-salao",
    name: "CAM-01 • Salão Nobre (Mesas 01-10)",
    location: "Salão Principal Climatizado",
    resolution: "3840x2160 (4K)",
    fps: 60,
    status: "ONLINE",
    latencyMs: 42,
    modelsActive: ["YOLOv11-Pose", "Gesture-HandRaise", "GlassRefill-Detector", "TableOccupancy-Net"],
    metrics: {
      peopleDetected: 24,
      tablesOccupied: 8,
      waiterInteractions: 14,
      handsRaised: 1,
      emptyGlassesDetected: 4,
      platesFinished: 2,
      averageDwellMinutes: 52,
    },
    lastAlert: {
      type: "WARNING",
      message: "Mesa #07 cliente levantou a mão há 48s e Mesa #02 com 3 taças vazias aguardando refil",
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: "cam-02-deck",
    name: "CAM-02 • Deck Jardim & Lounge",
    location: "Área Externa Climatizada (Mesas 11-18)",
    resolution: "3840x2160 (4K)",
    fps: 60,
    status: "ONLINE",
    latencyMs: 38,
    modelsActive: ["Crowd-Flow", "WeatherAdapt-Vision", "DrinkRefill-Net"],
    metrics: {
      peopleDetected: 18,
      tablesOccupied: 5,
      waiterInteractions: 9,
      handsRaised: 0,
      emptyGlassesDetected: 2,
      platesFinished: 1,
      averageDwellMinutes: 64,
    },
    lastAlert: {
      type: "INFO",
      message: "Deck operando com alta permanência; 2 mesas aptas para oferta de carta de drinks autorais",
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: "cam-03-sushibar",
    name: "CAM-03 • Sushibar & Bancada de Cortes",
    location: "Bancada Central de Pescados Nobres",
    resolution: "3840x2160 (4K Macro)",
    fps: 60,
    status: "ONLINE",
    latencyMs: 31,
    modelsActive: ["Anvisa-PPE-ToucaLuva", "KnifeSterilization-Net", "SpeedCut-Tracker", "HandHygiene-Timer"],
    metrics: {
      peopleDetected: 4,
      hygieneScorePercent: 99,
      averageDwellMinutes: 180,
    },
    lastAlert: {
      type: "INFO",
      message: "100% de conformidade com EPIs (toucas e luvas ativas nos 4 sushimen). Salmão a 3.2°C.",
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: "cam-04-cozinha",
    name: "CAM-04 • Cozinha Quente & Expedição Wok",
    location: "Bancada Térmica, Fritadeiras & Wok",
    resolution: "1920x1080 (FHD)",
    fps: 60,
    status: "ONLINE",
    latencyMs: 29,
    modelsActive: ["ThermalObject-SLA", "ExpeditionTimer-Net", "ChefSafety-EPI"],
    metrics: {
      peopleDetected: 3,
      dishesWaitingHot: 1,
      averageDwellMinutes: 120,
    },
    lastAlert: {
      type: "WARNING",
      message: "Guioza Vapor na expedição térmica há 2m 45s (SLA máx recomendado: 3m 00s)",
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: "cam-05-recepcao",
    name: "CAM-05 • Recepção & Fila de Espera",
    location: "Hall de Entrada & Lounge de Espera",
    resolution: "3840x2160 (4K)",
    fps: 60,
    status: "ONLINE",
    latencyMs: 45,
    modelsActive: ["FaceEmotion-NPS", "QueueLength-Estimator", "PatienceDwell-Net"],
    metrics: {
      peopleDetected: 8,
      queueLength: 3,
      averageDwellMinutes: 7,
    },
    lastAlert: {
      type: "INFO",
      message: "Fila de espera com 3 grupos (espera média 7.2 min). NPS de acolhimento: 94.2% positivo.",
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: "cam-06-caixa",
    name: "CAM-06 • Caixa PDV & Balcão Boutique",
    location: "Frente de Caixa & Araras de Moda",
    resolution: "1920x1080 (FHD)",
    fps: 60,
    status: "ONLINE",
    latencyMs: 26,
    modelsActive: ["SpeedCheckout-Tracker", "BoutiqueTraffic-Net", "POS-Sync"],
    metrics: {
      peopleDetected: 4,
      boutiqueVisitors: 12,
      averageDwellMinutes: 3,
    },
    lastAlert: {
      type: "INFO",
      message: "Fluxo cruzado Salão -> Boutique ativo: 3 clientes examinando novas peças de linho",
      timestamp: new Date().toISOString(),
    },
  },
];

export const MOCK_STAFF_BEHAVIOR: StaffBehaviorReport[] = [
  {
    employeeId: "emp-01",
    name: "Takeshi Sato",
    role: "SUSHIMAN",
    stationTimePercent: 94,
    responsivenessScore: 98,
    hygieneComplianceScore: 100,
    speedScore: 96,
    proactivityScore: 92,
    activeSector: "Sushibar Nobre",
    handWashLastMinutes: 18,
    avgResponseSeconds: 0,
    upsellAttemptsToday: 0,
    summary: "Ritmo impecável de corte (18 peças/min). Uso contínuo de touca, máscara e luvas nitrílicas. Higienização das mãos a cada 20 min.",
    highlights: [
      "100% de conformidade com protocolo HACCP/Anvisa",
      "Zero resíduo de espinha detectado pela câmera macro",
      "Manuseio cirúrgico da faca Yanagiba japonesa",
    ],
  },
  {
    employeeId: "emp-02",
    name: "Carlos Mendes",
    role: "GARCOM",
    stationTimePercent: 88,
    responsivenessScore: 95,
    hygieneComplianceScore: 96,
    speedScore: 92,
    proactivityScore: 96,
    activeSector: "Salão Nobre (Mesas 01-10)",
    handWashLastMinutes: 25,
    avgResponseSeconds: 48,
    upsellAttemptsToday: 14,
    summary: "Excelente circulação preventiva no Salão Nobre. Tempo médio de resposta a chamados de mesa: 48 segundos. Líder em oferta proativa de refil.",
    highlights: [
      "Tempo médio de atendimento a mãos levantadas: 48s (meta < 90s)",
      "14 abordagens proativas de reposição de saquê e drinks",
      "Empatia visual detectada em 96% das interações com clientes",
    ],
  },
  {
    employeeId: "emp-03",
    name: "Ana Oliveira",
    role: "GARCOM",
    stationTimePercent: 85,
    responsivenessScore: 89,
    hygieneComplianceScore: 95,
    speedScore: 88,
    proactivityScore: 88,
    activeSector: "Deck Jardim & Lounge",
    handWashLastMinutes: 22,
    avgResponseSeconds: 58,
    upsellAttemptsToday: 9,
    summary: "Atendimento dedicado na área externa do Deck. Boa empatia e cordialidade. Recomendada maior atenção aos copos vazios na extremidade do deck.",
    highlights: [
      "Ambiente externo desafiador mantido com SLA < 60s",
      "Acolhimento caloroso em datas comemorativas e aniversários",
      "Pode aumentar em 20% a taxa de oferta de sobremesas",
    ],
  },
  {
    employeeId: "emp-04",
    name: "Chef Marcos Lima",
    role: "COZINHEIRO",
    stationTimePercent: 96,
    responsivenessScore: 95,
    hygieneComplianceScore: 98,
    speedScore: 94,
    proactivityScore: 90,
    activeSector: "Cozinha Quente & Wok",
    handWashLastMinutes: 14,
    avgResponseSeconds: 0,
    upsellAttemptsToday: 0,
    summary: "Agilidade excepcional na saída de pratos quentes (Shimeji, Guioza e Yakisoba). Perfeita sincronização Fire-on-Demand com o sushibar.",
    highlights: [
      "Tempo médio de saída de quentes: 2m 20s (SLA máx: 3m 00s)",
      "Uso contínuo de avental térmico e proteção contra respingos",
      "Organização impecável das cubas de mise-en-place",
    ],
  },
];

export const MOCK_CLIENT_BEHAVIOR: ClientBehaviorReport = {
  totalClientsToday: 218,
  averageMealDurationMinutes: 56.4,
  averageWaitTimeInitialMinutes: 2.1,
  satisfactionVisualScorePercent: 93.8,
  queuePeakHour: "20h30 - 21h15",
  tableTurnoverRate: 2.3,
  dwellByArea: [
    { area: "Tatames VIP (Área Nobre)", avgMinutes: 78, ticketMedio: 285.0, status: "otimo" },
    { area: "Salão Principal (Mesas 01-10)", avgMinutes: 52, ticketMedio: 164.0, status: "ideal" },
    { area: "Deck Jardim Climatizado", avgMinutes: 64, ticketMedio: 148.0, status: "ideal" },
    { area: "Boutique de Roupas Zuma Moda", avgMinutes: 14, ticketMedio: 245.0, status: "otimo" },
  ],
  gesturesDetected: {
    handsRaisedToday: 38,
    emptyGlassesNow: 4,
    platesFinishedNow: 3,
    seekingLookNow: 1,
    menuHesitationNow: 2,
  },
  visualEmotions: {
    delightSmilePercent: 93.8,
    neutralConversingPercent: 4.2,
    hesitationOrDiscomfortPercent: 2.0,
  },
  boutiqueCrossOver: {
    visitorsFromRestaurantToday: 42,
    conversionRatePercent: 19.2,
    piecesTriedOrBought: 18,
    additionalRevenueToday: 4410.0,
  },
  alertCounts: {
    handRaiseWaitingTooLong: 1,
    abandonedQueue: 0,
    unattendedTableOver5Min: 0,
  },
};

export const MOCK_VISION_INSIGHTS: VisionAiInsight[] = [
  {
    id: "ins-01",
    category: "OPPORTUNITY",
    title: "Oportunidade Imediata de Upsell de Bebidas (Copos Vazios)",
    description: "Câmera 01 detectou 4 mesas (Mesas #02, #07, #08 e #14) com copos e garrafas de cerveja/saquê vazios há mais de 6 minutos. Os clientes estão engajados em conversa ativa.",
    estimatedFinancialImpact: "+ R$ 1.840,00 / noite",
    priority: "ALTA",
    actionLabel: "Bipar Garçom: Oferecer Refil de Bebidas",
    actionPayload: "DISPATCH_WAITER_REFILL_DRINKS",
    sourceCamera: "CAM-01 • Salão Principal",
    affectedEntity: "Mesas #02, #07, #08, #14",
    implemented: false,
  },
  {
    id: "ins-02",
    category: "OPPORTUNITY",
    title: "Ativação Cross-Selling Gastronomia -> Boutique de Moda",
    description: "6 grupos de casais e famílias no Salão Principal já finalizaram os pratos quentes e estão aguardando o fechamento da conta. Momento de pico para convidar para conhecer a nova coleção de moda linho e alfaiataria.",
    estimatedFinancialImpact: "+ R$ 2.450,00 / noite",
    priority: "ALTA",
    actionLabel: "Imprimir Voucher 15% Boutique no Fechamento",
    actionPayload: "PRINT_BOUTIQUE_COUPON_15",
    sourceCamera: "CAM-06 • Frente de Caixa & Boutique",
    affectedEntity: "Salão Principal & Deck",
    implemented: false,
  },
  {
    id: "ins-03",
    category: "OPPORTUNITY",
    title: "Giro Otimizado dos Tatames VIP para 2º Turno",
    description: "Tatame VIP #01 atingiu 74 minutos de permanência. A comanda de sushi foi liquidada e os clientes estão tomando água. Sugestão cordial de transição para o Lounge externo com licor cortesia para liberar o tatame para reserva das 21h30.",
    estimatedFinancialImpact: "+ R$ 3.200,00 / noite (Giro Tatame)",
    priority: "MEDIA",
    actionLabel: "Sugerir Cortesia Digestivo no Deck",
    actionPayload: "SUGGEST_LOUNGE_DIGESTIF",
    sourceCamera: "CAM-01 • Tatames VIP",
    affectedEntity: "Tatame VIP #01",
    implemented: false,
  },
  {
    id: "ins-04",
    category: "BOTTLENECK",
    title: "Gargalo Térmico na Expedição da Cozinha Quente",
    description: "A Câmera 04 identificou que pratos de Guioza e Shimeji estão aguardando na bancada aquecida por 2m 45s (próximo do limite de 3m). A praça de montagem fria está adiantada enquanto a saída de quentes concentra fila.",
    estimatedFinancialImpact: "Evita cancelamentos e perda de crocância",
    priority: "CRITICA",
    actionLabel: "Deslocar 1 Apoio para Passador de Quentes",
    actionPayload: "REBALANCE_KITCHEN_SUPPORT",
    sourceCamera: "CAM-04 • Cozinha Expedição",
    affectedEntity: "Bancada Cozinha Quente",
    implemented: false,
  },
  {
    id: "ins-05",
    category: "IMPROVEMENT",
    title: "Rebalanceamento de Carga entre Setores de Garçons",
    description: "O garçom Carlos Mendes está atendendo 12 mesas ativas no Salão Principal, enquanto Ana Oliveira atende 5 mesas no Deck. A redistribuição das Mesas #08 e #09 para a Ana reduzirá o tempo médio de atendimento de 48s para 28s.",
    estimatedFinancialImpact: "Aumento de 14% na velocidade de atendimento",
    priority: "MEDIA",
    actionLabel: "Rebalancear Mesas 08 e 09 para Ana",
    actionPayload: "REASSIGN_SECTOR_TABLES",
    sourceCamera: "CAM-01 e CAM-02",
    affectedEntity: "Carlos Mendes & Ana Oliveira",
    implemented: false,
  },
  {
    id: "ins-06",
    category: "SANITARY",
    title: "Check Sanitário Periódico Anvisa / HACCP (Higienização)",
    description: "Cronômetro de 30 minutos de higienização de mãos no Sushibar completou 22 minutos. A bancada de salmão fresco Cepea está em 3.2°C (temperatura ideal entre 2°C e 4°C). 100% de uso de EPIs.",
    estimatedFinancialImpact: "Blindagem jurídica e reputacional total",
    priority: "INFORMATIVA",
    actionLabel: "Validar Checklist Anvisa Diário",
    actionPayload: "CONFIRM_ANVISA_CHECK",
    sourceCamera: "CAM-03 • Sushibar",
    affectedEntity: "Bancada Sushibar Nobre",
    implemented: true,
  },
];

export const MOCK_DAILY_REPORT: VisionDailyReport = {
  date: "22 de Novembro de 2026",
  shift: "Turno Jantar (18h30 - 23h30)",
  unit: "Zuma Cozinha Oriental & Boutique • Tangará da Serra (MT)",
  totalPeopleAudited: 218,
  anvisaComplianceGlobal: 98.4,
  npsVisualBiometric: 93.8,
  avgWaiterResponseTimeSec: 48,
  totalInsightsGenerated: 14,
  potentialRevenueGain: "R$ 7.490,00 / noite",
  aiExecutiveSummary: `Auditoria contínua executada por 6 câmeras 4K com Edge AI no Zuma Tangará da Serra. 
O salão operou com pico de 88% de ocupação às 20h30. A conformidade sanitária na manipulação de salmão fresco manteve-se exemplar em 99%, sem desvios de EPIs. 
A análise facial biométrica registrou 93.8% de sorrisos e reações positivas após a degustação dos sushis e do Sobá de Mignon. 
O tempo de atendimento do garçom foi de 48 segundos, amplamente inferior à meta operacional de 90 segundos. 
A IA identificou R$ 7.490,00 em potenciais receitas adicionais ativando reposição de bebidas e integração de compras da Boutique.`,
  anvisaAuditingChecklist: [
    { item: "Uso obrigatório de toucas e redes de cabelo na bancada de peixe cru", status: "CONFORME", evidence: "Detectado em 100% das 4 horas de turno pela CAM-03" },
    { item: "Uso de luvas descartáveis para montagem de sashimis e sushis", status: "CONFORME", evidence: "Detecção visual contínua com troca a cada lote" },
    { item: "Higienização periódica das mãos a cada 30 minutos", status: "CONFORME", evidence: "Média de intervalo: 21 minutos entre lavagens de bancada" },
    { item: "Temperatura das cubas térmicas e balcão refrigerado (< 4°C)", status: "CONFORME", evidence: "Média aferida por sensor e visão térmica: 3.2°C estável" },
    { item: "Tempo de exposição de pratos quentes na expedição (< 3 minutos)", status: "ALERTA", evidence: "1 prato atingiu 2m 45s durante o pico das 20h45" },
    { item: "Distanciamento e circulação limpa nas áreas de trânsito", status: "CONFORME", evidence: "Corredores e passadiços 100% desobstruídos" },
  ],
  topOpportunities: [
    "Ativar refil de bebidas em mesas com copos vazios (+R$ 1.840,00/noite)",
    "Cross-selling com a Boutique de Roupas no fechamento de conta (+R$ 2.450,00/noite)",
    "Giro do 2º turno nos Tatames VIP com transição para Lounge (+R$ 3.200,00/noite)",
  ],
  bottlenecksIdentified: [
    "Pico de 2m45s na expedição de pratos quentes às 20h45 (resolvido com apoio de passador)",
    "Desbalanceamento momentâneo de 12 mesas para 1 garçom no salão principal",
  ],
};
