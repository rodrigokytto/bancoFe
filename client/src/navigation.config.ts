import React from "react";
import {
  MapPin,
  Crown,
  Flame,
  Clock,
  Building2,
  QrCode,
  Layers,
  Calculator,
  UtensilsCrossed,
  Bike,
  CreditCard,
  Boxes,
  CircleDollarSign,
  Receipt,
  FileArchive,
  CalendarCheck2,
  Wheat,
  Store,
  Users,
  Wrench,
  Truck,
  ShoppingBag,
  MessageSquare,
  Server,
  Zap,
  Megaphone,
  Sparkles,
  Star,
  RotateCcw,
  Share2,
  Radio,
  Thermometer,
  Smartphone,
  ShieldCheck,
  Camera,
  Target,
  TrendingUp,
  CloudRain,
  Maximize2,
  Eye,
  FileText,
  PackageCheck,
  Compass,
  Activity,
  Shirt,
  Landmark,
  Search,
} from "lucide-react";

export type IconType = React.ComponentType<{ className?: string }>;

export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: IconType;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
  permission?: "admin" | "user" | "all";
}

export interface NavSection {
  id: string;
  label: string;
  icon?: IconType;
  path?: string;
  items: NavItem[];
  permission?: "admin" | "user" | "all";
}

export interface NavDomain {
  id: string;
  label: string;
  icon: IconType;
  sections: string[]; // IDs de seções pertencentes a este domínio
  permission?: "admin" | "user" | "all";
}

export interface NavModule {
  id: string;
  label: string;
  icon: IconType;
  badge?: string;
  badgeColor?: string;
  defaultPath: string;
  description: string;
  domains: string[]; // IDs de domínios pertencentes a este módulo
  permission?: "admin" | "user" | "all";
}

/* ==========================================================================
   1. SEÇÕES E ITENS FOLHA (TELAS / ROTAS)
   ========================================================================== */

export const SECTIONS: Record<string, NavSection> = {
  // ---- MÓDULO 1: OPERAÇÃO & SALÃO ----
  bancofe_core_sec: {
    id: "bancofe_core_sec",
    label: "BancoFé Core Bancário & Liquidação",
    icon: Landmark,
    items: [
      { id: "bancofe_hub", path: "/bancofe", label: "BancoFé Hub Geral (PRD)", icon: Landmark, badge: "ISPB 799", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "bancofe_consulta360", path: "/consulta-360", label: "Consulta 360° CPF/CNPJ", icon: Search, badge: "11 Abas", badgeColor: "bg-cyan-600 text-white", highlight: true },
      { id: "bancofe_operacoes", path: "/admin/operacoes-financeiras", label: "Operações & Termos SCR", icon: Building2, badge: "Crédito 360°", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "bancofe_ecommerce", path: "/admin/ecommerce", label: "E-Commerce & Omnichannel", icon: Store, badge: "Multi-Loja", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "bancofe_precadastro", path: "/admin/pre-cadastro", label: "Pré-Cadastro 10x Produtos", icon: Calculator, badge: "Simulador", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "bancofe_radar", path: "/bancofe", label: "Radar MT & 20 Empresas", icon: Target, badge: "Tangará", highlight: true },
      { id: "bancofe_modulos", path: "/admin", label: "Gestão Módulos & Negócios", icon: Layers, badge: "Holding", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "bancofe_fechamento", path: "/admin/fechamento", label: "Fechamento & Contabilidade", icon: Receipt, badge: "COSIF", badgeColor: "bg-emerald-600 text-white" },
    ],
  },
  mesas_balcao: {
    id: "mesas_balcao",
    label: "Atendimento de Mesas & Balcão",
    icon: Calculator,
    items: [
      { id: "mapa_mesas", path: "/mesas", label: "Mapa de Mesas (27 Mesas)", icon: UtensilsCrossed, badge: "Salão 360", badgeColor: "bg-amber-600 text-white", highlight: true },
      { id: "pdv", path: "/pdv", label: "Frente de Caixa Touch", icon: Calculator, badge: "PDV", highlight: true },
      { id: "moda_roupas", path: "/moda", label: "Zuma Loja de Roupas & Moda", icon: Shirt, badge: "Boutique", badgeColor: "bg-purple-600 text-white", highlight: true },
      { id: "garcom", path: "/garcom", label: "App Garçom 27 Mesas", icon: UtensilsCrossed, badge: "Salão" },
      { id: "mesa_qr", path: "/mesa", label: "Auto-Pedido Mesa (QR)", icon: QrCode, badge: "Cliente", badgeColor: "bg-blue-600 text-white" },
    ],
  },
  pagamentos: {
    id: "pagamentos",
    label: "Pagamentos & Fechamento",
    icon: CreditCard,
    items: [
      { id: "central_pagamentos", path: "/pagamentos", label: "Central Pagamentos & Apple Pay", icon: CreditCard, badge: " Pay" },
    ],
  },
  pracas_preparo: {
    id: "pracas_preparo",
    label: "Praças de Preparo & Sequenciamento",
    icon: Flame,
    items: [
      { id: "cozinha_kds", path: "/cozinha", label: "KDS Cozinha (4 Praças)", icon: Flame, badge: "KDS" },
      { id: "kds_v2", path: "/kds-v2", label: "KDS 2.0 Fire on Demand", icon: Flame, badge: "KDS 2.0", badgeColor: "bg-orange-600 text-white" },
    ],
  },
  controle_termico: {
    id: "controle_termico",
    label: "Controle Térmico & Câmaras",
    icon: Thermometer,
    items: [
      { id: "telemetria_operacao", path: "/telemetria", label: "Telemetria IoT & Frio Anvisa", icon: Thermometer, badge: "IoT", badgeColor: "bg-cyan-600 text-white" },
    ],
  },
  expedicao_despacho: {
    id: "expedicao_despacho",
    label: "Expedição & Despacho",
    icon: Bike,
    items: [
      { id: "entregador", path: "/entregador", label: "App Entregador GPS Fiel", icon: Bike, badge: "GPS" },
      { id: "tabela_entregas", path: "/tabela-entregas", label: "Tabela de Preços & CEPs Tangará", icon: MapPin, badge: "MT", badgeColor: "bg-blue-600 text-white", highlight: true },
      { id: "operacao_360", path: "/operacao", label: "Operação 360° Unificada", icon: Layers, badge: "360°" },
    ],
  },
  canais_digitais: {
    id: "canais_digitais",
    label: "Canais Digitais Próprios",
    icon: ShoppingBag,
    items: [
      { id: "loja", path: "/loja", label: "Loja Delivery Próprio", icon: ShoppingBag, badge: "Apple Pay" },
      { id: "barca", path: "/barca", label: "Monte sua Barca 360°", icon: UtensilsCrossed, badge: "360°" },
    ],
  },
  central_apps_op: {
    id: "central_apps_op",
    label: "Aplicativos & APKs Operacionais",
    icon: Smartphone,
    items: [
      { id: "apps_op", path: "/apps", label: "Central de Apps, APKs & PWA", icon: Smartphone, badge: "Instalar", badgeColor: "bg-emerald-600 text-white", highlight: true },
    ],
  },

  // ---- MÓDULO 2: VENDAS, CRM & MARKETING ----
  mensageria_ia: {
    id: "mensageria_ia",
    label: "Mensageria & Transbordo",
    icon: MessageSquare,
    items: [
      { id: "zumi", path: "/zumi", label: "WhatsApp com IA Zumi", icon: MessageSquare, badge: "Zumi" },
      { id: "waha_admin", path: "/admin/waha", label: "Administração Whats (WAHA)", icon: Server, badge: "NOWEB", badgeColor: "bg-emerald-600 text-white" },
      { id: "atendimento", path: "/atendimento", label: "Cockpit Atendente Ao Vivo", icon: Zap, badge: "ao vivo", badgeColor: "bg-red-600 text-white" },
    ],
  },
  gestao_carteira: {
    id: "gestao_carteira",
    label: "Gestão de Carteira & LTV",
    icon: Users,
    items: [
      { id: "crm_operacoes_financeiras", path: "/admin/crm-financeira", label: "Operações Financeiras & CRM", icon: Building2, badge: "360°", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "clientes", path: "/clientes", label: "Base de Clientes & CRM", icon: Users },
      { id: "customer360", path: "/erp?tab=customer360", label: "Customer 360° & Score RFM", icon: Users, badge: "0-1000", badgeColor: "bg-violet-600 text-white" },
    ],
  },
  reativacao: {
    id: "reativacao",
    label: "Reativação Inteligente",
    icon: RotateCcw,
    items: [
      { id: "recuperacao", path: "/recuperacao", label: "Recuperação 4 Ondas Anti-Ban", icon: RotateCcw },
    ],
  },
  fidelidade: {
    id: "fidelidade",
    label: "Fidelidade & Assinaturas",
    icon: Star,
    items: [
      { id: "clube", path: "/clube", label: "Clube Zumi Fidelidade", icon: Star, badge: "clube" },
    ],
  },
  campanhas_leads: {
    id: "campanhas_leads",
    label: "Campanhas & Captação",
    icon: Megaphone,
    items: [
      { id: "campanhas", path: "/campanhas", label: "Campanhas Segmentadas", icon: Megaphone },
      { id: "leads", path: "/leads", label: "Captação & Quiz de Leads", icon: Sparkles, badge: "quiz" },
    ],
  },
  reputacao: {
    id: "reputacao",
    label: "Reputação Digital",
    icon: Star,
    items: [
      { id: "reputacao_google", path: "/reputacao", label: "Reputação Google & Avaliações", icon: Star },
    ],
  },
  convenios_b2b: {
    id: "convenios_b2b",
    label: "Vendas B2B & Convênios",
    icon: Building2,
    items: [
      { id: "agro_b2b", path: "/agro", label: "Zuma Agro B2B & Convênios", icon: Wheat, badge: "agro" },
      { id: "comercial_b2b", path: "/erp?tab=comercial", label: "Comercial B2B & Buffets", icon: Target, badge: "B2B", badgeColor: "bg-amber-600 text-white" },
    ],
  },

  // ---- MÓDULO 3: COMANDO & ESTRATÉGIA ----
  cockpits_principais: {
    id: "cockpits_principais",
    label: "Cockpits Gerenciais",
    icon: Crown,
    items: [
      { id: "cockpit_geral", path: "/cockpit", label: "Cockpit Geral em Tempo Real", icon: Crown, badge: "tempo real" },
      { id: "cockpit_proprietario", path: "/proprietario", label: "Cockpit do Proprietário D-7", icon: Crown, badge: "D-7" },
    ],
  },
  sazonalidade: {
    id: "sazonalidade",
    label: "Sazonalidade & Fluxo",
    icon: Flame,
    items: [
      { id: "mapa_calor", path: "/mapa-de-calor", label: "Mapa de Calor Analítico 360°", icon: Flame, badge: "Interativo", badgeColor: "bg-red-500 text-white", highlight: true },
    ],
  },
  inteligencia_competitiva: {
    id: "inteligencia_competitiva",
    label: "Inteligência Competitiva & Mercado",
    icon: Sparkles,
    items: [
      { id: "war_room", path: "/mercado", label: "IA e Mercado · War Room Tangará", icon: Sparkles, badge: "War Room", badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white", highlight: true },

    ],
  },
  meteorologia: {
    id: "meteorologia",
    label: "Meteorologia & Gatilhos de Venda",
    icon: CloudRain,
    items: [
      { id: "dr_clima", path: "/dr-clima", label: "Dr. Clima · Radar Meteorológico", icon: CloudRain, badge: "Clima", badgeColor: "bg-purple-600 text-white" },
    ],
  },
  visao_computacional: {
    id: "visao_computacional",
    label: "Visão Computacional & Câmeras",
    icon: Camera,
    items: [
      { id: "ultra_vision", path: "/cameras", label: "👁️ Ultra Vision AI (6 Câmeras 4K)", icon: Camera, badge: "Câmeras & IA", badgeColor: "bg-cyan-600 text-white" },
      { id: "ultra_telemetria", path: "/ultra", label: "⚡ Telemetria & Event Bus Ultra", icon: ShieldCheck, badge: "Eventos", badgeColor: "bg-purple-600 text-white" },
    ],
  },
  previsao_demanda: {
    id: "previsao_demanda",
    label: "Planejamento de Demanda",
    icon: TrendingUp,
    items: [
      { id: "previsao_compras", path: "/previsao-compras", label: "Previsão Preditiva de Compras", icon: TrendingUp, badge: "BOM & Estoque", badgeColor: "bg-amber-500 text-white", highlight: true },
    ],
  },
  cardapio_lucro: {
    id: "cardapio_lucro",
    label: "Rentabilidade de Cardápio",
    icon: Layers,
    items: [
      { id: "cardapio_bcg", path: "/cardapio", label: "Engenharia de Cardápio & Matriz BCG", icon: Layers },
    ],
  },
  capacidade_salao: {
    id: "capacidade_salao",
    label: "Ocupação do Salão & Capacidade",
    icon: Clock,
    items: [
      { id: "horarios_vazios", path: "/horarios", label: "Horários Vazios & Descontos", icon: Clock },
      { id: "capacidade_lotacao", path: "/capacidade", label: "Capacidade Operacional & Lotação", icon: Maximize2 },
      { id: "reservas_tatames", path: "/reservas", label: "Reservas & Tatames VIP", icon: CalendarCheck2 },
    ],
  },

  // ---- MÓDULO 4: ERP KYTTO & BACKOFFICE ----
  aquisicoes_compras: {
    id: "aquisicoes_compras",
    label: "Aquisições & Cotações",
    icon: Boxes,
    items: [
      { id: "compras_cotacoes", path: "/erp?tab=compras", label: "Compras & Cotações 3 Vias", icon: Boxes, badge: "XML 55", badgeColor: "bg-amber-600 text-white" },
      { id: "suprimentos_cuiaba", path: "/suprimentos", label: "Suprimentos & Cotações Cuiabá", icon: Boxes, badge: "Cuiabá" },
    ],
  },
  estoque_wms: {
    id: "estoque_wms",
    label: "Estoque & Armazenagem",
    icon: Boxes,
    items: [
      { id: "estoque_salmao", path: "/estoque", label: "Estoque Salmão Chileno Nobre", icon: Boxes, badge: "Pescados" },
      { id: "kardex_wms", path: "/erp?tab=estoque", label: "WMS, Kardex & Lotes", icon: Boxes, badge: "Kardex", badgeColor: "bg-cyan-600 text-white" },
    ],
  },
  controladoria_dre: {
    id: "controladoria_dre",
    label: "Controladoria & Finanças",
    icon: CircleDollarSign,
    items: [
      { id: "financeiro_dre", path: "/financeiro", label: "Financeiro & DRE Gerencial EBITDA", icon: CircleDollarSign, badge: "DRE" },
    ],
  },
  faturamento_billing: {
    id: "faturamento_billing",
    label: "Faturamento & Contratos B2B",
    icon: Receipt,
    items: [
      { id: "billing_contratos", path: "/erp?tab=billing", label: "Billing & Contratos B2B", icon: Receipt, badge: "Pix", badgeColor: "bg-purple-600 text-white" },
    ],
  },
  documentos_fiscais: {
    id: "documentos_fiscais",
    label: "Documentos Fiscais",
    icon: Receipt,
    items: [
      { id: "fiscal_nfce", path: "/fiscal", label: "Fiscal NFC-e SEFAZ-MT", icon: Receipt, badge: "SEFAZ" },
    ],
  },
  fechamento_contabil: {
    id: "fechamento_contabil",
    label: "Fechamento Contábil",
    icon: FileArchive,
    items: [
      { id: "fechamento_sped", path: "/fechamento-contabil", label: "Fechamento Mensal SPED 1-Click", icon: FileArchive, badge: "SPED", badgeColor: "bg-emerald-600 text-white" },
    ],
  },
  recursos_humanos: {
    id: "recursos_humanos",
    label: "Recursos Humanos & Equipe",
    icon: Users,
    items: [
      { id: "nossa_gente_rh", path: "/nossa-gente", label: "Nossa Gente (RH 360° & Ponto)", icon: Users, badge: "Sync Ultra", badgeColor: "bg-indigo-600 text-white", highlight: true },
      { id: "rh_depto", path: "/erp?tab=rh", label: "RH & Depto Pessoal", icon: Users, badge: "Folha", badgeColor: "bg-indigo-600 text-white" },
    ],
  },
  patrimonio_os: {
    id: "patrimonio_os",
    label: "Patrimônio & Manutenção",
    icon: Building2,
    items: [
      { id: "patrimonio_ativos", path: "/patrimonio", label: "Patrimônio & Imobilizados", icon: Building2, badge: "Ativos" },
      { id: "ordens_servico", path: "/erp?tab=os", label: "Ordens de Serviço 360", icon: Wrench, badge: "OS", badgeColor: "bg-orange-600 text-white" },
    ],
  },
  holding_kytto: {
    id: "holding_kytto",
    label: "Governança & Holding Kytto",
    icon: Building2,
    items: [
      { id: "erp_central", path: "/erp", label: "Central ERP 360° Master", icon: Building2, badge: "ADM", badgeColor: "bg-purple-600 text-white" },
      { id: "governanca_auditoria", path: "/erp?tab=governanca", label: "Governança & Auditoria", icon: Building2, badge: "Multi", badgeColor: "bg-slate-700 text-white" },
      { id: "expedicao_rotas", path: "/erp?tab=expedicao", label: "Expedição & Rotas B2B", icon: Truck, badge: "GPS", badgeColor: "bg-teal-600 text-white" },
      { id: "varejo_toledo", path: "/erp?tab=varejo", label: "Varejo & Balança Toledo Prix", icon: Store, badge: "EAN-13", badgeColor: "bg-blue-600 text-white" },
      { id: "agro_safra", path: "/erp?tab=agro", label: "Safra MT & Agro Parceiros", icon: Wheat, badge: "Safra", badgeColor: "bg-emerald-600 text-white" },
      { id: "concreto_holding", path: "/erp?tab=concreto", label: "Concreto Serrano (Holding)", icon: Building2, badge: "Holding", badgeColor: "bg-stone-600 text-white" },
    ],
  },

  // ---- MÓDULO 5: TECNOLOGIA & PLATAFORMA (TI) ----
  integracoes_pedidos: {
    id: "integracoes_pedidos",
    label: "Integrações de Pedidos & Mensageria",
    icon: Share2,
    items: [
      { id: "integracoes_apis", path: "/integracoes", label: "Central de Integrações & APIs", icon: Share2, badge: "8 Conexões", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "integracoes_ultra", path: "/integracoes?tab=nossa_gente_ultra", label: "Nossa Gente & Ultra (Event Bus)", icon: Activity, badge: "Sync Eventos", badgeColor: "bg-purple-600 text-white" },
      { id: "integracoes_saipos", path: "/integracoes?tab=saipos_sync", label: "Sincronizador Saipos", icon: ShieldCheck, badge: "Migração", badgeColor: "bg-blue-600 text-white" },
    ],
  },
  open_apis: {
    id: "open_apis",
    label: "Open APIs & Consultas Públicas",
    icon: Radio,
    items: [
      { id: "hub_conexoes", path: "/conexoes", label: "Hub Open APIs & CNPJ Tangará", icon: Radio, badge: "7 APIs" },
    ],
  },
  hub_apps_pwa: {
    id: "hub_apps_pwa",
    label: "Aplicações, APKs & Dispositivos",
    icon: Smartphone,
    items: [
      { id: "central_apps", path: "/apps", label: "Central de Aplicativos, APKs & PWA", icon: Smartphone, badge: "Instalar", badgeColor: "bg-emerald-600 text-white", highlight: true },
      { id: "telemetria_ti", path: "/telemetria", label: "Telemetria IoT & Frio (Sensores)", icon: Thermometer, badge: "IoT", badgeColor: "bg-cyan-600 text-white" },
    ],
  },
};

/* ==========================================================================
   2. DOMÍNIOS (SUBMÓDULOS RECOLHÍVEIS NA SIDEBAR)
   ========================================================================== */

export const MENU_DOMAINS: NavDomain[] = [
  {
    id: "bancofe_core_domain",
    label: "BancoFé Banking & Crédito",
    icon: Landmark,
    sections: ["bancofe_core_sec"],
  },
  // ---- OPERAÇÃO & SALÃO ----
  {
    id: "frente_loja",
    label: "Frente de Loja & Salão",
    icon: Calculator,
    sections: ["mesas_balcao", "pagamentos"],
  },
  {
    id: "cozinha_kds",
    label: "Cozinha & Produção KDS",
    icon: Flame,
    sections: ["pracas_preparo", "controle_termico"],
  },
  {
    id: "delivery_logistica",
    label: "Delivery & Logística",
    icon: Bike,
    sections: ["expedicao_despacho", "canais_digitais"],
  },
  {
    id: "apps_mobile_op",
    label: "Apps Operacionais Mobile",
    icon: Smartphone,
    sections: ["central_apps_op"],
  },

  // ---- VENDAS, CRM & MARKETING ----
  {
    id: "atendimento_omni",
    label: "Atendimento & WhatsApp IA",
    icon: MessageSquare,
    sections: ["mensageria_ia"],
  },
  {
    id: "crm_fidelidade",
    label: "CRM, Clientes & Fidelização",
    icon: Users,
    sections: ["gestao_carteira", "reativacao", "fidelidade"],
  },
  {
    id: "marketing_aquisicao",
    label: "Marketing, Leads & Reputação",
    icon: Megaphone,
    sections: ["campanhas_leads", "reputacao"],
  },
  {
    id: "vendas_b2b",
    label: "Vendas Corporativas & Convênios",
    icon: Target,
    sections: ["convenios_b2b"],
  },

  // ---- COMANDO & ESTRATÉGIA ----
  {
    id: "cockpits_executivos",
    label: "Painéis Executivos & Tempo Real",
    icon: Crown,
    sections: ["cockpits_principais", "sazonalidade"],
  },
  {
    id: "war_room",
    label: "War Room & Concorrência",
    icon: Sparkles,
    sections: ["inteligencia_competitiva"],
  },
  {
    id: "modelagem_preditiva",
    label: "Modelagem Preditiva & Sensores",
    icon: TrendingUp,
    sections: ["meteorologia", "visao_computacional", "previsao_demanda"],
  },
  {
    id: "otimizacao_receita",
    label: "Otimização de Receita & Ocupação",
    icon: Clock,
    sections: ["cardapio_lucro", "capacidade_salao"],
  },

  // ---- ERP KYTTO & BACKOFFICE ----
  {
    id: "suprimentos_estoque",
    label: "Suprimentos, Compras & Almoxarifado",
    icon: Boxes,
    sections: ["aquisicoes_compras", "estoque_wms"],
  },
  {
    id: "financas_controladoria",
    label: "Finanças, DRE & Contratos",
    icon: CircleDollarSign,
    sections: ["controladoria_dre", "faturamento_billing"],
  },
  {
    id: "fiscal_contabil",
    label: "Fiscal & Contabilidade",
    icon: Receipt,
    sections: ["documentos_fiscais", "fechamento_contabil"],
  },
  {
    id: "governanca_holding",
    label: "Gestão Corporativa, RH & Holding",
    icon: Building2,
    sections: ["recursos_humanos", "patrimonio_os", "holding_kytto"],
  },

  // ---- TECNOLOGIA & PLATAFORMA (TI) ----
  {
    id: "conectividade_apis",
    label: "Conectividade, APIs & Webhooks",
    icon: Share2,
    sections: ["integracoes_pedidos", "open_apis"],
  },
  {
    id: "infra_aplicacoes",
    label: "Infraestrutura & Dispositivos",
    icon: Smartphone,
    sections: ["hub_apps_pwa"],
  },
];

/* ==========================================================================
   3. MÓDULOS DE NEGÓCIO (SELETOR SUPERIOR DA SIDEBAR)
   ========================================================================== */

export const MODULES: NavModule[] = [
  {
    id: "bancofe_banking",
    label: "BancoFé Banking & Crédito",
    icon: Landmark,
    badge: "ISPB 799",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    defaultPath: "/bancofe",
    description: "Consulta 360° CPF/CNPJ, esteira de pré-cadastro de 10 produtos, radar regional MT, Pix DICT, Open Finance e Mesa Algorítmica.",
    domains: ["bancofe_core_domain"],
  },
  {
    id: "operacao",
    label: "Operação & Salão",
    icon: UtensilsCrossed,
    badge: "Tempo Real",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    defaultPath: "/pdv",
    description: "Frente de caixa touch, KDS de cozinha por praça, app do garçom, app do entregador e delivery.",
    domains: ["frente_loja", "cozinha_kds", "delivery_logistica", "apps_mobile_op"],
  },
  {
    id: "vendas_crm",
    label: "Vendas & Atendimento (CRM)",
    icon: MessageSquare,
    badge: "Zumi IA",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    defaultPath: "/zumi",
    description: "WhatsApp Zumi com IA, cockpit do atendente, CRM, campanhas, clube de fidelidade e leads.",
    domains: ["atendimento_omni", "crm_fidelidade", "marketing_aquisicao", "vendas_b2b"],
  },
  {
    id: "comando",
    label: "Comando & Estratégia",
    icon: Crown,
    badge: "Executivo",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    defaultPath: "/cockpit",
    description: "Cockpits gerenciais, war room concorrencial, previsão preditiva, mapas de calor e Dr. Clima.",
    domains: ["cockpits_executivos", "war_room", "modelagem_preditiva", "otimizacao_receita"],
  },
  {
    id: "erp_kytto",
    label: "ERP Kytto & Backoffice",
    icon: Building2,
    badge: "Kytto ADM",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    defaultPath: "/erp",
    description: "Suprimentos, cotações 3 vias, DRE gerencial, emissão fiscal NFC-e, SPED Bloco K e RH.",
    domains: ["suprimentos_estoque", "financas_controladoria", "fiscal_contabil", "governanca_holding"],
  },
  {
    id: "tecnologia_ti",
    label: "Tecnologia & Plataforma (TI)",
    icon: Share2,
    badge: "APIs & PWA",
    badgeColor: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    defaultPath: "/integracoes",
    description: "Central de integrações iFood/Waha/Sicredi, Open APIs, instaladores de APKs, PWAs e telemetria IoT.",
    domains: ["conectividade_apis", "infra_aplicacoes"],
  },
];

export const DEFAULT_MODULE = "bancofe_banking";
export const STORAGE_KEY_MODULE = "zuma_active_nav_module";

/* ==========================================================================
   4. FUNÇÕES UTILITÁRIAS DE CONSULTA E RESOLUÇÃO DE ROTAS
   ========================================================================== */

/**
 * Normaliza um caminho removendo barras finais e tratando alias
 */
export function normalizeNavPath(rawPath: string): string {
  if (!rawPath) return "/cockpit";
  const p = rawPath.trim();
  if (p === "/") return "/cockpit";
  if (p === "/heatmap") return "/mapa-de-calor";
  if (p === "/motor-compras") return "/previsao-compras";
  if (p === "/hub-conexoes") return "/conexoes";
  if (p === "/kds") return "/cozinha";
  if (p === "/iot") return "/telemetria";
  if (p === "/erpmaster" || p === "/compras") return "/erp";
  if (p === "/pacote-fiscal") return "/fechamento-contabil";
  if (p === "/ia-mercado" || p === "/ia-e-mercado") return "/mercado";
  if (p === "/saipos") return "/comparativo-saipos";
  if (p === "/clima" || p === "/simulador-clima") return "/dr-clima";
  if (p === "/vision-ai" || p === "/ultra-vision") return "/cameras";
  if (p === "/ultra-vision") return "/ultra";
  if (p === "/rh-facial" || p === "/gente") return "/nossa-gente";
  return p;
}

/**
 * Retorna o mapa de Seção para cada caminho (path)
 */
export function getSectionMap(): Map<string, { section: NavSection; item: NavItem }> {
  const map = new Map<string, { section: NavSection; item: NavItem }>();
  Object.values(SECTIONS).forEach((sec) => {
    sec.items.forEach((item) => {
      map.set(item.path, { section: sec, item });
    });
  });
  return map;
}

/**
 * Retorna o Domínio que contém determinada seção
 */
export function getDomainForSectionId(sectionId: string): NavDomain | undefined {
  return MENU_DOMAINS.find((dom) => dom.sections.includes(sectionId));
}

/**
 * Retorna o Módulo que contém determinado domínio
 */
export function getModuleForDomainId(domainId: string): NavModule | undefined {
  return MODULES.find((mod) => mod.domains.includes(domainId));
}

/**
 * Deriva a hierarquia completa a partir de uma URL ou caminho ativo
 */
export function getActiveHierarchy(currentLocation: string): {
  activeModule: NavModule;
  activeDomain?: NavDomain;
  activeSection?: NavSection;
  activeItem?: NavItem;
} {
  const norm = normalizeNavPath(currentLocation);
  const basePath = norm.split("?")[0];

  // 1. Tenta correspondência exata com query params (ex: /erp?tab=compras)
  let found = getSectionMap().get(norm);

  // 2. Se não achar, tenta apenas pelo basePath (ex: /erp)
  if (!found) {
    found = getSectionMap().get(basePath);
  }

  // 3. Se achar a seção e o item
  if (found) {
    const domain = getDomainForSectionId(found.section.id);
    if (domain) {
      const module = getModuleForDomainId(domain.id);
      if (module) {
        return {
          activeModule: module,
          activeDomain: domain,
          activeSection: found.section,
          activeItem: found.item,
        };
      }
    }
  }

  // Fallback seguro: módulo padrão (Comando)
  const defaultMod = MODULES.find((m) => m.id === DEFAULT_MODULE) || MODULES[0];
  return {
    activeModule: defaultMod,
  };
}

/**
 * Lista todos os caminhos conhecidos do sistema
 */
export function getAllMappedPaths(): Set<string> {
  const paths = new Set<string>();
  Object.values(SECTIONS).forEach((sec) => {
    sec.items.forEach((it) => paths.add(it.path));
  });
  return paths;
}

/**
 * Rede de segurança: detecta itens não mapeados
 */
export function getSafetyNetUnmappedItems(systemPaths: string[]): NavItem[] {
  const mapped = getAllMappedPaths();
  const unmapped: NavItem[] = [];

  systemPaths.forEach((p) => {
    const clean = p.split("?")[0];
    if (!mapped.has(p) && !mapped.has(clean)) {
      unmapped.push({
        id: `unmapped_${clean.replace(/[^a-zA-Z0-9]/g, "_")}`,
        path: p,
        label: `Rota: ${p}`,
        icon: Compass,
        badge: "Não mapeada",
        badgeColor: "bg-red-500 text-white",
      });
    }
  });

  return unmapped;
}
