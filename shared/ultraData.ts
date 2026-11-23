// ==============================================================================
// SISTEMA ULTRA · COCKPIT OPERACIONAL DE ULTRA PERFORMANCE & GESTÃO 360°
// Integrado ao sistema Nossa Gente (RH/Equipe) via Sincronização por Eventos Internos
// Zuma Cozinha Oriental · Tangará da Serra (MT) · CNPJ: 36.296.848/0001-57
// ==============================================================================

export interface UltraKpiMetrics {
  faturamentoDia: number;
  pedidosHoje: number;
  ticketMedio: number;
  tempoMedioPreparoMin: number;
  metaTempoPreparoMin: number;
  mesasOcupadas: number;
  totalMesas: number;
  ocupacaoSalãoPct: number;
  pedidosDeliveryHoje: number;
  taxaAssertividadePct: number;
  margemContribuicaoPct: number;
  ebitdaEstimadoDia: number;
  indiceProdutividadeBrigada: number; // 0 a 100
  insumosCriticosEmAlerta: number;
}

export interface UltraStation {
  id: string;
  name: string;
  category: "sushibar" | "quente" | "bar" | "salao" | "expedicao" | string;
  leadName: string;
  leadRole: string;
  assignedCollaborator?: string;
  colaboradoresEscalados: string[];
  cargaTrabalhoPct: number;
  pedidosEmFila: number;
  tempoMedioMin: number;
  slaMetaMin: number;
  status: "NORMAL" | "ALERTA" | "SOBRECARGA" | "OPERANDO" | "PAUSADO" | "HIGIENIZACAO" | "SETUP";
  temperaturaAtual?: number;
  tempAlvo?: string;
}

export interface UltraSyncEvent {
  id: string;
  timestamp: string;
  eventType?: 
    | "ORDER_DELIVERED_COMMISSION_ACCREDITED" 
    | "FACIAL_BIOMETRIC_PUNCH" 
    | "SUSHIBAR_SLA_ALERT" 
    | "INSPECTION_ANVISA_REGISTERED" 
    | "STOCK_OUTAGE_TRIGGER_SYNC" 
    | "SHIFT_SWAP_APPROVED"
    | "DISPATCH_DELIVERY_MOTOBOY"
    | string;
  type?: string;
  sourceSystem?: "ULTRA_OPERACIONAL" | "NOSSA_GENTE_RH" | "ZUMA_KDS" | "TELEMETRIA_FRIO" | "NOSSA_GENTE" | "ULTRA_SISTEMA" | string;
  originSystem?: string;
  targetSystem?: "NOSSA_GENTE_RH" | "ULTRA_OPERACIONAL" | "FINANCEIRO_DRE" | "IFOOD_MERCHANT" | "NOSSA_GENTE" | "ULTRA_SISTEMA" | string;
  title?: string;
  summary?: string;
  description?: string;
  colaboradorId?: string;
  colaboradorNome?: string;
  collaboratorId?: string;
  collaboratorName?: string;
  valorFinanceiro?: number;
  metadata?: Record<string, any>;
  payload?: any;
  status: "SINCRONIZADO" | "PROCESSANDO" | "PENDENTE" | "PROCESSADO" | string;
  internalChecksum?: string;
}

export interface UltraInspection {
  id: string;
  timestamp: string;
  tipo?: "TEMPERATURA_PESCADOS" | "ULTRACONGELADOR_CHOQUE" | "PADRAO_OURO_PRATO" | "CHECKLIST_ABERTURA" | "HIGIENIZACAO_ANVISA" | string;
  category?: string;
  local?: string;
  itemEvaluated?: string;
  stationId?: string;
  temperaturaMedida?: number;
  valueMeasured?: string;
  targetStandard?: string;
  temperaturaFaixaSegura?: string;
  conforme?: boolean;
  status?: "CONFORME" | "ALERTA" | "NAO_CONFORME" | string;
  responsavelId?: string;
  responsavelNome?: string;
  responsavelCargo?: string;
  inspectorName?: string;
  fotoArmazenadaSeguraUrl?: string;
  photoUrl?: string;
  fotoDescricao?: string;
  photoDescription?: string;
  observacoes?: string;
  notes?: string;
  acaoCorretiva?: string;
  secureStorageHash?: string;
  anvisaStandardCode?: string;
}

export interface UltraEquipment {
  id: string;
  tag: string;
  nome: string;
  categoria: "Frio Extremo" | "Resfriados Nobres" | "Pesagem & Varejo" | "Cocção & Sous-vide" | "Spooler Térmico";
  localizacao: string;
  temperaturaAtual: number;
  temperaturaMinima: number;
  temperaturaMaxima: number;
  unidade: "°C" | "kg" | "ms";
  status: "OPERACIONAL" | "ATENCAO" | "CRITICO";
  voltagem: string;
  consumoKwh: number;
  ultimaCalibracao: string;
  proximaManutencao: string;
  sensorId: string;
  alertasAtivos: string[];
}

export interface ColaboradorNossaGente {
  id: string;
  nome: string;
  cargo: string;
  departamento: "Sushibar" | "Cozinha Quente" | "Salão & Atendimento" | "Delivery & Frota" | "Gestão & Qualidade";
  turnoHoje: "Jantar (17:30 - 23:30)" | "Almoço Executivo (10:30 - 15:00)" | "Folga Semanal";
  statusPonto: "Presente (Biometria Facial)" | "Em Intervalo" | "Aguardando Entrada";
  horarioEntradaRegistrado: string;
  pedidosExecutadosHoje: number;
  comissaoAcumuladaHoje: number;
  scoreQualidade: number; // 0 - 100
  fotoUrl: string;
}

// ==============================================================================
// DADOS OPERACIONAIS INICIAIS DO ULTRA (ZUMA TANGARÁ DA SERRA)
// ==============================================================================

export const INITIAL_ULTRA_KPIS: UltraKpiMetrics = {
  faturamentoDia: 18450.90,
  pedidosHoje: 146,
  ticketMedio: 126.37,
  tempoMedioPreparoMin: 13.2,
  metaTempoPreparoMin: 15.0,
  mesasOcupadas: 19,
  totalMesas: 27,
  ocupacaoSalãoPct: 70.4,
  pedidosDeliveryHoje: 82,
  taxaAssertividadePct: 99.3,
  margemContribuicaoPct: 68.4,
  ebitdaEstimadoDia: 5890.30,
  indiceProdutividadeBrigada: 94.2,
  insumosCriticosEmAlerta: 1, // Salmão perto de 38kg (compras disparadas)
};

export const INITIAL_ULTRA_STATIONS: UltraStation[] = [
  {
    id: "st_sushibar",
    name: "Sushibar Nobre (Praça Fria)",
    category: "sushibar",
    leadName: "Kenji Sato",
    leadRole: "Chefe Sushiman Executivo",
    colaboradoresEscalados: ["Kenji Sato", "Mateus Silva Pereira", "Guilherme Santos"],
    cargaTrabalhoPct: 78,
    pedidosEmFila: 5,
    tempoMedioMin: 12.8,
    slaMetaMin: 15.0,
    status: "NORMAL",
    temperaturaAtual: 1.2,
    tempAlvo: "0.0°C a +2.0°C"
  },
  {
    id: "st_quente",
    name: "Cozinha Quente (Robatas, Woks & Frituras)",
    category: "quente",
    leadName: "Maria Aparecida Souza",
    leadRole: "Chefe de Praça Quente",
    colaboradoresEscalados: ["Maria Aparecida Souza", "Carlos Eduardo Lima"],
    cargaTrabalhoPct: 65,
    pedidosEmFila: 3,
    tempoMedioMin: 10.4,
    slaMetaMin: 12.0,
    status: "NORMAL",
    temperaturaAtual: 24.5,
    tempAlvo: "Ambiente Exaustão Ativa"
  },
  {
    id: "st_bar",
    name: "Bar & Mixologia Oriental",
    category: "bar",
    leadName: "Lucas Evangelista",
    leadRole: "Barman & Mixologista",
    colaboradoresEscalados: ["Lucas Evangelista"],
    cargaTrabalhoPct: 52,
    pedidosEmFila: 2,
    tempoMedioMin: 4.2,
    slaMetaMin: 6.0,
    status: "NORMAL",
    temperaturaAtual: -1.5,
    tempAlvo: "Choperia -1.5°C"
  },
  {
    id: "st_salao",
    name: "Salão Nobre & Tatames VIP (27 Mesas)",
    category: "salao",
    leadName: "Aline Cristina Dantas",
    leadRole: "Gerente Geral de Salão",
    colaboradoresEscalados: ["Aline Dantas", "Juliana Meireles", "Roberto Camargo", "Felipe Antunes"],
    cargaTrabalhoPct: 74,
    pedidosEmFila: 4,
    tempoMedioMin: 2.5,
    slaMetaMin: 3.0,
    status: "NORMAL"
  },
  {
    id: "st_expedicao",
    name: "Expedição & Delivery Rápido Tangará",
    category: "expedicao",
    leadName: "Cleber Marcondes",
    leadRole: "Coordenador de Frotas",
    colaboradoresEscalados: ["Cleber Marcondes", "Danilo Prado", "Tiago Veiga", "Marcos Vinicius"],
    cargaTrabalhoPct: 84,
    pedidosEmFila: 6,
    tempoMedioMin: 18.5,
    slaMetaMin: 22.0,
    status: "ALERTA"
  }
];

export const INITIAL_ULTRA_EQUIPMENTS: UltraEquipment[] = [
  {
    id: "eq_ultracongelador",
    tag: "ULTRA-CHOQUE-01",
    nome: "Ultracongelador de Choque -40°C Criotec Professional",
    categoria: "Frio Extremo",
    localizacao: "Antecâmara do Sushibar",
    temperaturaAtual: -39.4,
    temperaturaMinima: -42.0,
    temperaturaMaxima: -36.0,
    unidade: "°C",
    status: "OPERACIONAL",
    voltagem: "380V Trifásico",
    consumoKwh: 4.8,
    ultimaCalibracao: "15/10/2026 (SIF / Inmetro)",
    proximaManutencao: "15/04/2027",
    sensorId: "SNS-ULTRA-40-C01",
    alertasAtivos: []
  },
  {
    id: "eq_camara_salmao",
    tag: "CAM-RESF-01",
    nome: "Câmara de Resfriados Pescados Nobres (0°C a +2°C)",
    categoria: "Resfriados Nobres",
    localizacao: "Área de Manipulação Suja / Câmara 1",
    temperaturaAtual: 1.1,
    temperaturaMinima: 0.0,
    temperaturaMaxima: 2.2,
    unidade: "°C",
    status: "OPERACIONAL",
    voltagem: "220V Bifásico",
    consumoKwh: 2.2,
    ultimaCalibracao: "01/11/2026",
    proximaManutencao: "01/05/2027",
    sensorId: "SNS-TEMP-CAM01",
    alertasAtivos: []
  },
  {
    id: "eq_camara_congelados",
    tag: "CAM-CONG-02",
    nome: "Câmara de Congelados Matérias-Primas (-20°C)",
    categoria: "Frio Extremo",
    localizacao: "Estoque Frio Fundo",
    temperaturaAtual: -19.6,
    temperaturaMinima: -22.0,
    temperaturaMaxima: -17.5,
    unidade: "°C",
    status: "OPERACIONAL",
    voltagem: "380V Trifásico",
    consumoKwh: 3.5,
    ultimaCalibracao: "01/11/2026",
    proximaManutencao: "01/05/2027",
    sensorId: "SNS-TEMP-CAM02",
    alertasAtivos: []
  },
  {
    id: "eq_balanca_toledo",
    tag: "BAL-PRIX6-01",
    nome: "Balança Computadora Toledo Prix 6 Touch com Etiquetador EAN",
    categoria: "Pesagem & Varejo",
    localizacao: "Bancada Central Sushibar",
    temperaturaAtual: 22.0,
    temperaturaMinima: 0.0,
    temperaturaMaxima: 30.0,
    unidade: "kg",
    status: "OPERACIONAL",
    voltagem: "110V/220V Automático",
    consumoKwh: 0.08,
    ultimaCalibracao: "02/09/2026 (Inmetro IPEM-MT)",
    proximaManutencao: "02/09/2027",
    sensorId: "IPEM-MT-88412",
    alertasAtivos: []
  },
  {
    id: "eq_sousvide",
    tag: "SOUS-VIDE-PRO",
    nome: "Termocirculador de Precisão Sous-Vide PolyScience 30L",
    categoria: "Cocção & Sous-vide",
    localizacao: "Praça Quente",
    temperaturaAtual: 63.5,
    temperaturaMinima: 63.0,
    temperaturaMaxima: 64.0,
    unidade: "°C",
    status: "OPERACIONAL",
    voltagem: "220V",
    consumoKwh: 1.4,
    ultimaCalibracao: "10/10/2026",
    proximaManutencao: "10/04/2027",
    sensorId: "POLY-SV-01",
    alertasAtivos: []
  }
];

export const INITIAL_COLABORADORES_NOSSA_GENTE: ColaboradorNossaGente[] = [
  {
    id: "COL-01",
    nome: "Kenji Sato",
    cargo: "Chefe Sushiman Executivo",
    departamento: "Sushibar",
    turnoHoje: "Jantar (17:30 - 23:30)",
    statusPonto: "Presente (Biometria Facial)",
    horarioEntradaRegistrado: "17:15",
    pedidosExecutadosHoje: 42,
    comissaoAcumuladaHoje: 147.00,
    scoreQualidade: 98,
    fotoUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop"
  },
  {
    id: "COL-02",
    nome: "Mateus Silva Pereira",
    cargo: "Segundo Sushiman (Cortes Nobres)",
    departamento: "Sushibar",
    turnoHoje: "Jantar (17:30 - 23:30)",
    statusPonto: "Presente (Biometria Facial)",
    horarioEntradaRegistrado: "17:22",
    pedidosExecutadosHoje: 36,
    comissaoAcumuladaHoje: 108.00,
    scoreQualidade: 95,
    fotoUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop"
  },
  {
    id: "COL-04",
    nome: "Aline Cristina Dantas",
    cargo: "Gerente Geral de Salão & Atendimento",
    departamento: "Salão & Atendimento",
    turnoHoje: "Jantar (17:30 - 23:30)",
    statusPonto: "Presente (Biometria Facial)",
    horarioEntradaRegistrado: "17:10",
    pedidosExecutadosHoje: 58,
    comissaoAcumuladaHoje: 185.50,
    scoreQualidade: 99,
    fotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop"
  },
  {
    id: "COL-05",
    nome: "Lucas Evangelista",
    cargo: "Barman & Mixologista",
    departamento: "Salão & Atendimento",
    turnoHoje: "Jantar (17:30 - 23:30)",
    statusPonto: "Presente (Biometria Facial)",
    horarioEntradaRegistrado: "17:28",
    pedidosExecutadosHoje: 29,
    comissaoAcumuladaHoje: 87.00,
    scoreQualidade: 96,
    fotoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop"
  },
  {
    id: "COL-07",
    nome: "Cleber Marcondes",
    cargo: "Piloto Líder de Delivery",
    departamento: "Delivery & Frota",
    turnoHoje: "Jantar (17:30 - 23:30)",
    statusPonto: "Presente (Biometria Facial)",
    horarioEntradaRegistrado: "17:30",
    pedidosExecutadosHoje: 18,
    comissaoAcumuladaHoje: 126.00,
    scoreQualidade: 97,
    fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
  },
  {
    id: "COL-08",
    nome: "Maria Aparecida Souza",
    cargo: "Chefe de Praça Quente",
    departamento: "Cozinha Quente",
    turnoHoje: "Jantar (17:30 - 23:30)",
    statusPonto: "Presente (Biometria Facial)",
    horarioEntradaRegistrado: "17:18",
    pedidosExecutadosHoje: 31,
    comissaoAcumuladaHoje: 93.00,
    scoreQualidade: 94,
    fotoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop"
  }
];

export const INITIAL_ULTRA_SYNC_EVENTS: UltraSyncEvent[] = [
  {
    id: "ev_sync_001",
    timestamp: "19:42:10",
    eventType: "ORDER_DELIVERED_COMMISSION_ACCREDITED",
    sourceSystem: "ULTRA_OPERACIONAL",
    targetSystem: "NOSSA_GENTE_RH",
    title: "Comissão Creditada · Pedido Mesa 07 (#ZUM-8812)",
    description: "Combo Especial Zuma 68 Peças entregue em 13.5 min. Comissão de R$ 23,09 rateada entre Aline Dantas (Garçom) e Brigada de Sushibar.",
    colaboradorId: "COL-04",
    colaboradorNome: "Aline Cristina Dantas",
    valorFinanceiro: 23.09,
    metadata: {
      orderId: "ZUM-8812",
      table: 7,
      totalBrl: 230.90,
      prazoSlaMin: 15,
      tempoEfetivoMin: 13.5
    },
    status: "SINCRONIZADO"
  },
  {
    id: "ev_sync_002",
    timestamp: "19:35:44",
    eventType: "INSPECTION_ANVISA_REGISTERED",
    sourceSystem: "ULTRA_OPERACIONAL",
    targetSystem: "NOSSA_GENTE_RH",
    title: "Aferição Térmica Periódica Salmão Nobre (2h)",
    description: "Kenji Sato executou medição de espessura térmica do lombo de salmão: 1.2°C (Conforme padrão ANVISA RDC 216). Foto armazenada no cofre seguro.",
    colaboradorId: "COL-01",
    colaboradorNome: "Kenji Sato",
    metadata: {
      lote: "SALM-LT-20261121",
      temperatura: 1.2,
      limiteMax: 2.0,
      segura: true
    },
    status: "SINCRONIZADO"
  },
  {
    id: "ev_sync_003",
    timestamp: "19:28:12",
    eventType: "DISPATCH_DELIVERY_MOTOBOY",
    sourceSystem: "ULTRA_OPERACIONAL",
    targetSystem: "NOSSA_GENTE_RH",
    title: "Despacho Rápido Delivery · Rota Jardim Europa",
    description: "Cleber Marcondes iniciou corrida de 3 pedidos agrupados. Taxa de entrega de R$ 21,00 creditada na folha do piloto.",
    colaboradorId: "COL-07",
    colaboradorNome: "Cleber Marcondes",
    valorFinanceiro: 21.00,
    metadata: {
      pedidos: ["ZUM-8809", "ZUM-8810", "ZUM-8811"],
      bairro: "Jd. Europa",
      tempoEstimadoMin: 14
    },
    status: "SINCRONIZADO"
  },
  {
    id: "ev_sync_004",
    timestamp: "19:15:00",
    eventType: "FACIAL_BIOMETRIC_PUNCH",
    sourceSystem: "NOSSA_GENTE_RH",
    targetSystem: "ULTRA_OPERACIONAL",
    title: "Ponto Eletrônico Facial Registrado · Portaria 671 MTE",
    description: "Mateus Silva Pereira confirmou presença com biometria facial e geolocalização em Tangará da Serra. Liberado no KDS do Sushibar.",
    colaboradorId: "COL-02",
    colaboradorNome: "Mateus Silva Pereira",
    metadata: {
      geoloc: "-14.6231, -57.4872 (Tangará da Serra)",
      ipOrigem: "192.168.15.42",
      rep: "REP-P Virtual Zuma"
    },
    status: "SINCRONIZADO"
  },
  {
    id: "ev_sync_005",
    timestamp: "18:50:22",
    eventType: "STOCK_OUTAGE_TRIGGER_SYNC",
    sourceSystem: "ULTRA_OPERACIONAL",
    targetSystem: "IFOOD_MERCHANT",
    title: "Sincronização de Estoque Preditivo com Cozinha",
    description: "Estoque de Salmão atingiu 38.5kg. Sistema Ultra calculou 1.8 dias de cobertura e enviou sinalização preventiva ao chefe de compras e sushibar.",
    metadata: {
      insumo: "SALM-01",
      saldoKg: 38.5,
      status: "ATENCAO_COMPRAS"
    },
    status: "SINCRONIZADO"
  }
];

export const INITIAL_ULTRA_INSPECTIONS: UltraInspection[] = [
  {
    id: "insp_001",
    timestamp: "21/11/2026 19:35",
    tipo: "TEMPERATURA_PESCADOS",
    local: "Bancada Central do Sushibar (Lombo Salmão)",
    temperaturaMedida: 1.2,
    temperaturaFaixaSegura: "0.0°C a +2.0°C",
    conforme: true,
    responsavelId: "COL-01",
    responsavelNome: "Kenji Sato",
    responsavelCargo: "Chefe Sushiman Executivo",
    fotoArmazenadaSeguraUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop",
    fotoDescricao: "Termômetro digital espetado no centro do lombo de salmão fresco chileno. Leitura estabilizada em 1.2°C.",
    observacoes: "Textura firme, coloração vibrante sem exudato, corte higienizado a cada lote.",
    acaoCorretiva: "Nenhuma. Conforme RDC 216 e SIF."
  },
  {
    id: "insp_002",
    timestamp: "21/11/2026 18:00",
    tipo: "ULTRACONGELADOR_CHOQUE",
    local: "Câmara de Choque Criotec (-40°C)",
    temperaturaMedida: -39.4,
    temperaturaFaixaSegura: "-42.0°C a -36.0°C",
    conforme: true,
    responsavelId: "COL-01",
    responsavelNome: "Kenji Sato",
    responsavelCargo: "Chefe Sushiman Executivo",
    fotoArmazenadaSeguraUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop",
    fotoDescricao: "Visor do painel microprocessado do ultracongelador marcando -39.4°C com ciclo de sanificação ativado.",
    observacoes: "Protocolo preventivo anti-parasitário aplicado em cortes crus.",
    acaoCorretiva: "Conforme protocolo internacional FDA/Anvisa."
  },
  {
    id: "insp_003",
    timestamp: "21/11/2026 17:30",
    tipo: "CHECKLIST_ABERTURA",
    local: "Salão Nobre, Deck e Bar de Drinks",
    conforme: true,
    responsavelId: "COL-04",
    responsavelNome: "Aline Cristina Dantas",
    responsavelCargo: "Gerente Geral de Salão",
    fotoArmazenadaSeguraUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop",
    fotoDescricao: "Inspeção visual das 27 mesas com sousplats, hashis lacrados e climatização em 22°C.",
    observacoes: "Checklist 100% aprovado. Brigada uniformizada, unhas aparadas e EPIs conferidos.",
    acaoCorretiva: "Abertura autorizada para o Turno Jantar."
  },
  {
    id: "insp_004",
    timestamp: "21/11/2026 19:10",
    tipo: "PADRAO_OURO_PRATO",
    local: "Pass de Saída do Sushibar",
    conforme: true,
    responsavelId: "COL-02",
    responsavelNome: "Mateus Silva Pereira",
    responsavelCargo: "Segundo Sushiman",
    fotoArmazenadaSeguraUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop",
    fotoDescricao: "Barca Especial Zuma 68 Peças montada para Mesa 12. Comparação fotográfica com a Ficha Técnica BOM.",
    observacoes: "Proporção de salmão, atum, cream cheese e nori em 100% de conformidade com a receita padrão.",
    acaoCorretiva: "Prato liberado com selo Padrão Ouro de Qualidade."
  }
];

// ==============================================================================
// PASSAPORTE DO SALMÃO 360° · RASTREABILIDADE TOTAL DO FIORDE À MESA
// POP-ZUMA-004 · RDC 216 ANVISA · SIF Ministério da Agricultura · MAPA
// ==============================================================================

export interface SalmonPassportLot {
  id: string;
  codigoLote: string;
  variedade: string;
  fazendaOrigem: string;
  paisOrigem: string;
  regiaoChile: string;
  certificacoes: string[];
  dataDespescaChile: string;
  vooTransporte: string;
  chegadaCuiaba: string;
  chegadaTangara: string;
  transportadoraRefrigerada: string;
  temperaturaRecebimentoC: number;
  phMedido: number;
  pesoTotalRecebidoKg: number;
  pesoDisponivelKg: number;
  rendimentoAparasPct: number;
  inspecaoOrganoleptica: {
    olhos: string;
    guelras: string;
    odor: string;
    elasticidadeCarne: string;
    rigorMortis: string;
    classificacaoGeral: "PADRÃO OURO SASHIMI GRADE A+" | "PADRÃO PREMIUM";
  };
  cicloUltracongelamentoChoque: {
    equipamento: string;
    inicioCiclo: string;
    terminoCiclo: string;
    duracaoHoras: number;
    temperaturaMinimaAlcancada: number;
    finalidadeNormativa: string;
    laudoMicrobiologicoStatus: string;
    laudoNumero: string;
  };
  responsavelTecnico: {
    chefExecutivo: string;
    nutricionistaRT: string;
    crn: string;
  };
  hashSha256Laudo: string;
  qrCodePayload: string;
  status: "ATIVO_EM_CONSUMO" | "RESERVA_TECNICA" | "ESGOTADO";
}

export const INITIAL_SALMON_PASSPORTS: SalmonPassportLot[] = [
  {
    id: "PASS-SALM-088",
    codigoLote: "CL-REL-8842-ZUMA",
    variedade: "Salmo Salar Atlântico Premium Especial",
    fazendaOrigem: "Fiordes de Reloncaví, Puerto Montt",
    paisOrigem: "Chile",
    regiaoChile: "Região dos Lagos (X Región de Los Lagos)",
    certificacoes: [
      "ASC (Aquaculture Stewardship Council)",
      "BAP 4-Star (Best Aquaculture Practices)",
      "Global G.A.P. Certified",
      "SIF Importação 4120 / MAPA"
    ],
    dataDespescaChile: "18/11/2026 06:00",
    vooTransporte: "LATAM Cargo LA-8051 (SCL Santiago -> GRU São Paulo)",
    chegadaCuiaba: "19/11/2026 21:40 (Câmara Frigorífica Pantanal)",
    chegadaTangara: "20/11/2026 14:15",
    transportadoraRefrigerada: "TransFrio Pantanal Express (TermoKing -0.5°C a +1.0°C monitorado via satélite)",
    temperaturaRecebimentoC: 0.8,
    phMedido: 6.18,
    pesoTotalRecebidoKg: 60.0,
    pesoDisponivelKg: 38.5,
    rendimentoAparasPct: 99.4,
    inspecaoOrganoleptica: {
      olhos: "Salientes, transparentes e brilhantes, sem turvação ou manchas hemorrágicas",
      guelras: "Coloração vermelho-rubi vivo, odor fresco iodado marinho sem viscosidade",
      odor: "Característico e agradável de brisa oceânica do Pacífico Sul",
      elasticidadeCarne: "Firme e elástica; retorno imediato após compressão digital leve (Grau 10/10)",
      rigorMortis: "Pós-rigor com textura aveludada e teor de ômega-3 preservado",
      classificacaoGeral: "PADRÃO OURO SASHIMI GRADE A+"
    },
    cicloUltracongelamentoChoque: {
      equipamento: "Ultracongelador de Choque Criotec Professional -40°C",
      inicioCiclo: "20/11/2026 15:30",
      terminoCiclo: "21/11/2026 15:30",
      duracaoHoras: 24,
      temperaturaMinimaAlcancada: -40.3,
      finalidadeNormativa: "Profilaxia total contra parasitas (Anisakis simplex) segundo POP-ZUMA-004 e RDC 216/ANVISA",
      laudoMicrobiologicoStatus: "100% Em Conformidade · Ausência de Patógenos",
      laudoNumero: "LAUDO-LAB-MT-2026-8812"
    },
    responsavelTecnico: {
      chefExecutivo: "Kenji Sato",
      nutricionistaRT: "Dra. Camila Bittencourt",
      crn: "CRN-MT 14208"
    },
    hashSha256Laudo: "e8b2c45d91fa771a3e6f982b1c440a2f99bc74128509e5114870f2a991823bb1",
    qrCodePayload: "https://zuma.kytto.com.br/passaporte-salmao/CL-REL-8842-ZUMA",
    status: "ATIVO_EM_CONSUMO"
  },
  {
    id: "PASS-SALM-087",
    codigoLote: "CL-AYS-8790-ZUMA",
    variedade: "Salmo Salar Atlântico Nobre Reserva",
    fazendaOrigem: "Fiordes de Aysén, Patagônia Chilena",
    paisOrigem: "Chile",
    regiaoChile: "Região de Aysén (XI Región)",
    certificacoes: [
      "ASC Certified",
      "Friend of the Sea",
      "SIF Importação 4120 / MAPA"
    ],
    dataDespescaChile: "15/11/2026 08:30",
    vooTransporte: "LATAM Cargo LA-8049 (SCL -> GRU)",
    chegadaCuiaba: "16/11/2026 23:10",
    chegadaTangara: "17/11/2026 13:45",
    transportadoraRefrigerada: "TransFrio Pantanal Express",
    temperaturaRecebimentoC: 0.9,
    phMedido: 6.22,
    pesoTotalRecebidoKg: 50.0,
    pesoDisponivelKg: 4.2,
    rendimentoAparasPct: 99.1,
    inspecaoOrganoleptica: {
      olhos: "Transparentes e côncavos normais",
      guelras: "Vermelho brilhante sem mucilagem",
      odor: "Fresco característico",
      elasticidadeCarne: "Firmeza excelente",
      rigorMortis: "Estabilizado",
      classificacaoGeral: "PADRÃO OURO SASHIMI GRADE A+"
    },
    cicloUltracongelamentoChoque: {
      equipamento: "Criotec Professional -40°C",
      inicioCiclo: "17/11/2026 15:00",
      terminoCiclo: "18/11/2026 15:00",
      duracaoHoras: 24,
      temperaturaMinimaAlcancada: -40.1,
      finalidadeNormativa: "Eliminação Anisakis simplex RDC 216",
      laudoMicrobiologicoStatus: "Aprovado",
      laudoNumero: "LAUDO-LAB-MT-2026-8790"
    },
    responsavelTecnico: {
      chefExecutivo: "Kenji Sato",
      nutricionistaRT: "Dra. Camila Bittencourt",
      crn: "CRN-MT 14208"
    },
    hashSha256Laudo: "f9c3d56e02ab882b4f7e093c2d551b3e00cd85239610f6225981g3b002934cc2",
    qrCodePayload: "https://zuma.kytto.com.br/passaporte-salmao/CL-AYS-8790-ZUMA",
    status: "RESERVA_TECNICA"
  }
];

// ==============================================================================
// CENTRAL DE GATILHOS INTELIGENTES OPERACIONAIS (ZUMA SMART TRIGGERS)
// Regras reativas e preditivas em tempo real para Restaurante e Sushibar de Alto Padrão
// ==============================================================================

export interface SmartTriggerRule {
  id: string;
  nome: string;
  categoria: "FRIO" | "ESTOQUE_IFOOD" | "METEOROLOGIA_DR_CLIMA" | "SOBRECARGA_KDS" | "MOTOBOYS_PIX" | "AUDITORIA_ANVISA";
  descricao: string;
  condicaoDisparo: string;
  acaoAutomatica: string;
  ativo: boolean;
  ultimoDisparo?: string;
  totalDisparosHoje: number;
  severidade: "CRITICA" | "ALERTA" | "OPERACIONAL" | "INFO";
  icone: string;
  logRecente?: string;
}

export const INITIAL_SMART_TRIGGERS: SmartTriggerRule[] = [
  {
    id: "trig_frio_critico",
    nome: "Sentinela da Cadeia de Frio Extremo (-40°C & Câmaras)",
    categoria: "FRIO",
    descricao: "Monitora telemetria IoT dos 5 equipamentos Criotec e câmara de salmão a cada 15 segundos.",
    condicaoDisparo: "Temperatura da Criotec > -36°C ou Câmara > +2.5°C por mais de 3 minutos consecutivos",
    acaoAutomatica: "Emite alarme sonoro no Cockpit, registra log no barramento de eventos internos e aciona manutenção técnica",
    ativo: true,
    ultimoDisparo: "Hoje às 14:10 (Alerta preventivo degelo - normalizado em 4 min)",
    totalDisparosHoje: 1,
    severidade: "CRITICA",
    icone: "ThermometerSnowflake",
    logRecente: "Sensor Criotec retornou a -40.1°C após fechamento da antecâmara."
  },
  {
    id: "trig_ruptura_ifood",
    nome: "Pausa Anti-Ruptura de Cardápio iFood & Loja Própria",
    categoria: "ESTOQUE_IFOOD",
    descricao: "Cruza saldo do estoque BOM em tempo real com pedidos em preparo no KDS.",
    condicaoDisparo: "Saldo físico disponível do Salmão Chileno < 15.0 kg ou Embalagem Barca Kraft < 20 un",
    acaoAutomatica: "Executa PATCH na API iFood Merchant pausando combinados correspondentes e notifica Chefe de Praça",
    ativo: true,
    ultimoDisparo: "Ontem às 22:45 (Camarão Rosa Esgotado · Pausado em 850ms)",
    totalDisparosHoje: 0,
    severidade: "ALERTA",
    icone: "ShieldAlert",
    logRecente: "Estoque atual de Salmão em 38.5kg. Margem de segurança de 1.8 dias operacionais."
  },
  {
    id: "trig_dr_clima_chuva",
    nome: "Operação Tempestade Dr. Clima Tangará da Serra",
    categoria: "METEOROLOGIA_DR_CLIMA",
    descricao: "Conecta à API meteorológica local de Tangará da Serra e radar de precipitação.",
    condicaoDisparo: "Precipitação acumulada > 15mm/h ou probabilidade de chuva torrencial > 85%",
    acaoAutomatica: "Acresce +12 min na estimativa do delivery, bonifica taxa de chuva aos motoboys e dispara push de combinados quentes e lámen",
    ativo: true,
    ultimoDisparo: "Hoje às 17:40 (Chuva passageira 18mm no Jd. Europa · Tempo +12min ativado)",
    totalDisparosHoje: 2,
    severidade: "OPERACIONAL",
    icone: "CloudRain",
    logRecente: "Disparo executado com sucesso: 14 clientes VIP receberam oferta de Lámen Especial."
  },
  {
    id: "trig_kds_surge",
    nome: "Proteção contra Sobrecarga no Sushibar (KDS Surge Guard)",
    categoria: "SOBRECARGA_KDS",
    descricao: "Avalia a cadência e tempo de ciclo de produção de cada praça do KDS.",
    condicaoDisparo: "Fila do Sushibar > 7 comandas ou Tempo Médio de Espera > 20 minutos",
    acaoAutomatica: "Remaneja sushiman de apoio, sinaliza mesas no App Garçom para oferta de entrada cortesia e rebalanceia praça",
    ativo: true,
    ultimoDisparo: "Hoje às 20:15 (Pico de 8 comandas simultâneas · Suporte Mateus Pereira ativado)",
    totalDisparosHoje: 1,
    severidade: "ALERTA",
    icone: "Flame",
    logRecente: "Tempo médio reduzido de 21.4 min para 12.8 min após remanejamento."
  },
  {
    id: "trig_motoboys_pix",
    nome: "Acerto Automático de Diárias e Corridas de Motoboys",
    categoria: "MOTOBOYS_PIX",
    descricao: "Contabiliza entregas concluídas por geolocalização e calcula a liquidação financeira dos entregadores.",
    condicaoDisparo: "Fechamento de turno de expedição ou solicitação de liquidação pelo coordenador de frotas",
    acaoAutomatica: "Agrupa total de corridas, taxa de entrega por zona e gera lote de transferência PIX Sicredi instantâneo",
    ativo: true,
    ultimoDisparo: "Ontem às 23:40 (R$ 486,00 liquidados entre 4 entregadores via chave PIX)",
    totalDisparosHoje: 0,
    severidade: "OPERACIONAL",
    icone: "Coins",
    logRecente: "Taxas e diárias calculadas com precisão e reconciliadas com a comissão do delivery."
  },
  {
    id: "trig_auditoria_anvisa",
    nome: "Auditoria Criptográfica e Checkpoint Sanitário ANVISA",
    categoria: "AUDITORIA_ANVISA",
    descricao: "Verifica a cada 2 horas o registro obrigatório de temperatura de pescados e óleo de fritura.",
    condicaoDisparo: "Mais de 120 minutos sem nova medição térmica com foto armazenada no cofre seguro",
    acaoAutomatica: "Envia lembrete sonoro no KDS do Sushibar para o Chefe Executivo registrar a temperatura e carimbo SHA-256",
    ativo: true,
    ultimoDisparo: "Hoje às 17:35 (Checkpoint de 2h realizado por Kenji Sato · Hash gerado)",
    totalDisparosHoje: 3,
    severidade: "INFO",
    icone: "ShieldCheck",
    logRecente: "Conformidade 100% com o POP-ZUMA-004 e Manual de Boas Práticas."
  }
];
