import React, { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Flame,
  Thermometer,
  Boxes,
  Receipt,
  Smartphone,
  Cpu,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  HelpCircle,
  UtensilsCrossed,
  Bike,
  QrCode,
  Calculator,
  CreditCard,
  Users,
  Store,
  Wheat,
  Share2
} from "lucide-react";

interface ComparisonItem {
  id: string;
  category: "pdv" | "cozinha" | "mesa" | "delivery" | "pescados" | "iot" | "ia" | "fiscal" | "multinegocio" | "custos";
  categoryLabel: string;
  feature: string;
  description: string;
  saiposStatus: "ausente" | "parcial" | "limitado" | "presente";
  saiposNote: string;
  zumaStatus: "nativo" | "avancado" | "exclusivo";
  zumaNote: string;
  impactoNegocio: string;
  linkTeste?: string;
}

const COMPARISON_DATA: ComparisonItem[] = [
  {
    id: "pdv-touch-multi",
    category: "pdv",
    categoryLabel: "PDV & Frente de Caixa",
    feature: "Frente de Caixa Touch 360° com Apple Pay, Pix Dinâmico e Balança Toledo Prix",
    description: "Operação ultra-ágil para balcão, comandas e mesas com fechamento cego de caixa, sangria, reforço e suporte a pesagem direta.",
    saiposStatus: "presente",
    saiposNote: "Possui PDV tradicional com fechamento de caixa e TEF. Não oferece suporte nativo a Apple Pay web direto nem balança industrial Toledo Prix parametrizada.",
    zumaStatus: "avancado",
    zumaNote: "PDV Touchscreen otimizado para tablets e monitores touch, com Apple Pay nativo, Pix instantâneo com conciliação automática, fechamento cego com auditoria e balança Prix EAN-13.",
    impactoNegocio: "Atendimento 40% mais rápido na fila do balcão e conferência de caixa sem divergências.",
    linkTeste: "/pdv"
  },
  {
    id: "kds-fire-demand",
    category: "cozinha",
    categoryLabel: "Cozinha & KDS",
    feature: "KDS 2.0 com Sequenciamento Fire-on-Demand (Frio x Quente)",
    description: "Sincronia milimétrica entre 4 praças: sushibar só prepara peças frias quando a cozinha quente estiver a minutos de finalizar.",
    saiposStatus: "limitado",
    saiposNote: "KDS convencional em ordem estrita de chegada (FIFO). Sushis saem em 4 min e ressecam esperando pratos quentes de 15 min.",
    zumaStatus: "exclusivo",
    zumaNote: "Lógica Fire-on-Demand integrada em 4 praças (Sushibar, Cozinha Quente, Bar e Expedição), SLA cronometrado e checklist tátil de expedição.",
    impactoNegocio: "Pratos chegam à mesa juntos na temperatura ideal. Redução de 92% nas reclamações de sushi ressecado ou prato frio.",
    linkTeste: "/kds-v2"
  },
  {
    id: "auto-atendimento-mesa",
    category: "mesa",
    categoryLabel: "Salão & Mesa",
    feature: "Auto-Atendimento na Mesa com Divisão de Conta Tátil & Pix Individual",
    description: "Cliente acessa via QR Code sem baixar app, visualiza comanda, divide conta em até 10 pessoas e chama garçom por motivo específico.",
    saiposStatus: "parcial",
    saiposNote: "Cardápio digital para visualização; divisão de comanda exige intervenção do garçom no PDV central e cobra mensalidade extra pelo cardápio.",
    zumaStatus: "avancado",
    zumaNote: "PWA nativo com divisão de conta imediata na própria mesa, chamada de garçom categorizada (gelo, pratos, dúvida, conta) e Pix individual.",
    impactoNegocio: "Aumento do giro de mesas no salão em 18 minutos no horário de pico do jantar.",
    linkTeste: "/mesa"
  },
  {
    id: "entregador-gps",
    category: "delivery",
    categoryLabel: "Delivery & Motoboys",
    feature: "Hub Integrador de Pedidos + App do Entregador com Rota GPS & Acerto",
    description: "Integração direta com iFood e WhatsApp, com despacho inteligente por raio/bairro e App PWA dedicado para motoboys.",
    saiposStatus: "presente",
    saiposNote: "Integra com iFood e possui gestor de entregadores básico, porém cobra taxas adicionais por pedidos de canais próprios e módulos extras.",
    zumaStatus: "avancado",
    zumaNote: "Hub unificado de pedidos (iFood API direta + WhatsApp Zumi IA), loja PWA própria sem comissões e App do Entregador com rastreamento GPS e acerto financeiro automatizado.",
    impactoNegocio: "Eliminação de taxas de 2% a 5% por pedido em canais próprios e controle total dos custos de entrega.",
    linkTeste: "/entregador"
  },
  {
    id: "salmao-kardex",
    category: "pescados",
    categoryLabel: "Pescados & Kardex",
    feature: "Desossa & Rendimento Salmão Chileno 3 Vias (58% / 15% / 27%)",
    description: "Cálculo do custo real por grama separando Filé Nobre (58%), Aparas/Tartar (15%) e Caldos/Descarte (27%).",
    saiposStatus: "ausente",
    saiposNote: "Apenas baixa simples linear (1 kg vendido = 1 kg baixado). Não calcula perda de evisceração, carcaça nem subprodutos da gastronomia oriental.",
    zumaStatus: "exclusivo",
    zumaNote: "Kardex paramétrico oficial do Zuma com rastreabilidade da carcaça ao sashimi e auditoria de rendimento do sushiman.",
    impactoNegocio: "Economia real de R$ 4.200/mês ao evitar perdas invisíveis na esteira de corte do salmão.",
    linkTeste: "/estoque"
  },
  {
    id: "telemetria-iot",
    category: "iot",
    categoryLabel: "Telemetria & Qualidade",
    feature: "Telemetria Térmica IoT de Câmara Fria & Alerta de Porta Aberta",
    description: "Monitoramento contínuo em tempo real de sensores (-1.5°C a +1°C, ultracongelador -40°C e vitrines com alerta Anvisa / SIF).",
    saiposStatus: "ausente",
    saiposNote: "Não possui hardware IoT nem suporte a sensores térmicos em câmaras ou balcões refrigerados.",
    zumaStatus: "exclusivo",
    zumaNote: "Sensores em tempo real com protocolo Anvisa/SIF para controle de parasitas (Anisakis) e alerta sonoro/visual de porta aberta e queda de energia.",
    impactoNegocio: "Risco zero de perda de lote de salmão (R$ 13.000+) por falha em compressor ou porta destravada.",
    linkTeste: "/telemetria"
  },
  {
    id: "ia-preditiva-cenarios",
    category: "ia",
    categoryLabel: "Inteligência Preditiva",
    feature: "Previsão de Faturamento com IA Preditiva (3 Cenários: Conservador, Base, Otimista)",
    description: "Projeção estatística baseada em sazonalidade de Tangará da Serra, ritmo diário, reservas futuras e corredor de 95% de confiança.",
    saiposStatus: "ausente",
    saiposNote: "Relatórios históricos em tabelas simples (pedidos por dia). Não possui algoritmos preditivos, cenários ou cálculo de ritmo diário necessário.",
    zumaStatus: "exclusivo",
    zumaNote: "Motor de Machine Learning preditivo com 3 cenários de faturamento, cálculo de dias úteis restantes e meta oficial calibrada.",
    impactoNegocio: "Previsibilidade total do fluxo de caixa e planejamento de compras antecipado com fornecedores.",
    linkTeste: "/mercado"
  },
  {
    id: "reativacao-rfm-ia",
    category: "ia",
    categoryLabel: "Inteligência Preditiva",
    feature: "Reativação Inteligente de Clientes Sumidos com Scoring RFM e WhatsApp Anti-Ban",
    description: "Detecção de clientes em risco de churn com geração de mensagens hiperpersonalizadas baseadas no prato favorito e LTV.",
    saiposStatus: "ausente",
    saiposNote: "Módulo de CRM básico sem inteligência de churn, sem personalização por histórico de consumo e sem proteção anti-ban para WhatsApp.",
    zumaStatus: "exclusivo",
    zumaNote: "Algoritmo RFM (Recência, Frequência e Valor), estimativa de dinheiro na mesa e copywriter de IA com disparos manuais seguros via WhatsApp.",
    impactoNegocio: "Recuperação de 28.4% dos clientes inativos com ROI direto imediato no faturamento.",
    linkTeste: "/mercado"
  },
  {
    id: "buracos-ociosidade",
    category: "ia",
    categoryLabel: "Inteligência Preditiva",
    feature: "Caça aos Buracos de Ociosidade na Agenda/Salão & Encaixes Rápidos VIP",
    description: "Detecção automática de vales de baixa ocupação no salão e delivery com cruzamento de perfis de clientes para preenchimento com 1 clique.",
    saiposStatus: "ausente",
    saiposNote: "Nenhuma funcionalidade de detecção de ócio ou convites de encaixe inteligente para horários mortos.",
    zumaStatus: "exclusivo",
    zumaNote: "Mapeamento dos horários mais críticos da semana com sugestão dos melhores clientes VIP para preenchimento de mesas ou provadores.",
    impactoNegocio: "Resgate de R$ 5.500+ semanais em capacidade que seria desperdiçada.",
    linkTeste: "/mercado"
  },
  {
    id: "fiscal-sped-bloco-k",
    category: "fiscal",
    categoryLabel: "Fiscal & Contábil",
    feature: "Emissão NFC-e SEFAZ-MT + Fechamento Mensal 1-Click com SPED Bloco K",
    description: "Geração instantânea de pacote ZIP com SPED Fiscal EFD ICMS/IPI (industrialização de pescados), XMLs e conciliação contábil.",
    saiposStatus: "parcial",
    saiposNote: "Emite NFC-e e exporta XMLs soltos em pasta. Não gera Bloco K de industrialização nem consolida pacote completo auditado para contador.",
    zumaStatus: "exclusivo",
    zumaNote: "1-Click ZIP com SPED Bloco K, XMLs auditados da SEFAZ-MT, DRE EBITDA e conciliação bancária completa.",
    impactoNegocio: "Economia de 25 horas mensais da equipe financeira e auditoria fiscal blindada.",
    linkTeste: "/fechamento-contabil"
  },
  {
    id: "multinegocio-oficial",
    category: "multinegocio",
    categoryLabel: "Negócio & Holding",
    feature: "Plataforma Unificada para Gastronomia Oriental + Loja de Roupas & Moda",
    description: "Gestão completa das duas operações oficiais Zuma (Gastronomia e Moda & Vestuário) com ERP integrado e sem silos.",
    saiposStatus: "ausente",
    saiposNote: "Sistema engessado exclusivamente para restaurantes simples. Incapaz de gerenciar varejo de moda, araras, tamanhos, cores ou provadores.",
    zumaStatus: "exclusivo",
    zumaNote: "Calibração instantânea entre Zuma Gastronomia e Zuma Loja de Roupas, com métricas, metas, estoque e perfis dedicados.",
    impactoNegocio: "Visão 360° unificada para o proprietário com uma única plataforma para os dois pilares da marca Zuma.",
    linkTeste: "/mercado"
  },
  {
    id: "tco-nuvem-gcp",
    category: "custos",
    categoryLabel: "Arquitetura & Custos",
    feature: "Propriedade Intelectual & Custo de Nuvem sob Demanda no Google Cloud Platform",
    description: "Controle absoluto do código-fonte (Git), sem mensalidades inflacionadas por volume de pedidos ou add-ons restritivos.",
    saiposStatus: "limitado",
    saiposNote: "Modelo SaaS proprietário fechado com mensalidades crescentes, taxas por integração, custo por filial e dependência de suporte externo.",
    zumaStatus: "exclusivo",
    zumaNote: "Plataforma própria Zuma conteinerizada em Cloud Run (GCP southamerica-east1), escalando a zero quando o salão está fechado.",
    impactoNegocio: "Economia anual recorrente de R$ 9.600 a R$ 18.000 em assinaturas de software e comissões.",
    linkTeste: "/integracoes"
  }
];

interface SaiposParityModule {
  moduloSaipos: string;
  recursoSaipos: string;
  statusParidade: "100% Coberto" | "Superior no Zuma";
  implementacaoZuma: string;
  diferencialZuma: string;
  rotaZuma: string;
}

const SAIPOS_PARITY_LIST: SaiposParityModule[] = [
  {
    moduloSaipos: "PDV Frente de Caixa",
    recursoSaipos: "Caixa rápido, sangria, reforço, fechamento cego e múltiplos pagamentos",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "PDV Touch 360° com Apple Pay, Pix instantâneo, TEF e balança Prix",
    diferencialZuma: "Opera tanto para Gastronomia quanto para Loja de Roupas, com fechamento cego auditado e contingência offline.",
    rotaZuma: "/pdv"
  },
  {
    moduloSaipos: "KDS Cozinha & Bar",
    recursoSaipos: "Tela de pedidos na cozinha com tempo de preparo e status",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "KDS 2.0 Fire-on-Demand com 4 praças simultâneas",
    diferencialZuma: "Sincronização milimétrica frio x quente para sushi não ressecar e checklist tátil de expedição.",
    rotaZuma: "/kds-v2"
  },
  {
    moduloSaipos: "Gestão de Mesas e Salão",
    recursoSaipos: "Mapa de mesas, lançamento de pedidos e fechamento de conta",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Mapa interativo 27 Mesas + Tatames VIP + App Garçom dedicado",
    diferencialZuma: "App Garçom mobile-first com status em tempo real da cozinha e divisão de conta flexível.",
    rotaZuma: "/garcom"
  },
  {
    moduloSaipos: "Cardápio Digital na Mesa",
    recursoSaipos: "QR Code para visualização de cardápio e pedido direto",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Auto-Pedido Mesa QR Code com Divisão de Conta Pix 2x-10x",
    diferencialZuma: "Cliente divide a conta e paga via Pix individual no próprio celular sem esperar garçom e sem taxas.",
    rotaZuma: "/mesa"
  },
  {
    moduloSaipos: "Hub de Delivery",
    recursoSaipos: "Integração de pedidos iFood, WhatsApp e cardápio próprio",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Central de Integrações & APIs + PWA Próprio sem taxas",
    diferencialZuma: "Conexão oficial iFood API + WhatsApp Zumi IA conversacional + Loja PWA própria com Apple Pay.",
    rotaZuma: "/integracoes"
  },
  {
    moduloSaipos: "Gestor de Motoboys",
    recursoSaipos: "Controle de despacho e cálculo de taxa por entrega",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "App do Entregador com Rota GPS ao vivo e Acerto de Contas",
    diferencialZuma: "Roteirização inteligente por raio, visualização de mapa em tempo real e conciliação de comissões.",
    rotaZuma: "/entregador"
  },
  {
    moduloSaipos: "Controle de Estoque & BOM",
    recursoSaipos: "Ficha técnica básica e baixa linear de insumos",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Estoque Salmão 3 Vias + Motor Preditivo de Compras Cuiabá",
    diferencialZuma: "Rastreabilidade da carcaça do salmão (58% filé / 15% tartar / 27% caldos) e telemetria térmica IoT.",
    rotaZuma: "/estoque"
  },
  {
    moduloSaipos: "Emissão Fiscal",
    recursoSaipos: "Emissão de NFC-e e SAT com exportação de XMLs soltos",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Emissor Fiscal NFC-e SEFAZ-MT + 1-Click SPED Bloco K (.ZIP)",
    diferencialZuma: "Contingência offline automática, cálculo monofásico e pacote pronto auditado para a contabilidade.",
    rotaZuma: "/fiscal"
  },
  {
    moduloSaipos: "Financeiro & DRE",
    recursoSaipos: "Contas a pagar/receber e relatório financeiro simples",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Financeiro & DRE EBITDA + Conciliação de iFood e Adquirentes",
    diferencialZuma: "Conciliação detalhada de taxas MDR de cartão e taxas de antecipação do iFood com fluxo projetado.",
    rotaZuma: "/financeiro"
  },
  {
    moduloSaipos: "CRM & Fidelidade",
    recursoSaipos: "Cadastro básico de clientes e cupom de desconto",
    statusParidade: "Superior no Zuma",
    implementacaoZuma: "Customer 360° + Clube Zumi + Scoring RFM com IA",
    diferencialZuma: "Reativação preditiva de clientes inativos por prato favorito e régua de relacionamento anti-ban.",
    rotaZuma: "/mercado"
  }
];

export const ComparativoSaipos: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<"paridade" | "matriz" | "calculadora" | "arquitetura">("paridade");

  // Calculadora de ROI
  const [faturamentoMensal, setFaturamentoMensal] = useState<number>(115000);
  const [comprasSalmaoMensal, setComprasSalmaoMensal] = useState<number>(38000);

  // Cálculos de economia
  const economiaKardex = comprasSalmaoMensal * 0.085; // 8.5% economia em perdas de corte e descarte
  const economiaSaas = 1250; // Mensalidade Saipos + módulos extras + taxas
  const ganhoMapaCalor = faturamentoMensal * 0.045; // 4.5% de incremento de vendas nas brechas do mapa de calor
  const economiaContabil = 800; // Horas economizadas contabilidade/fechamento
  const economiaTotal = economiaKardex + economiaSaas + ganhoMapaCalor + economiaContabil;

  const filteredItems = selectedCategory === "todos"
    ? COMPARISON_DATA
    : COMPARISON_DATA.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner Informativo */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white py-5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/25 text-white border border-white/30">
                  Paridade 100% + Superioridade Técnica
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-400 text-emerald-950">
                  Auditado
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Zuma Pilot 360° vs Saipos: Matriz de Paridade & Superioridade
              </h1>
              <p className="text-xs sm:text-sm text-white/90">
                100% das funcionalidades do Saipos cobertas, potencializadas por IA Preditiva, Telemetria IoT e suporte oficial a Gastronomia e Moda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/mercado">
              <button className="px-3.5 py-2 bg-purple-700 text-white font-bold text-xs rounded-xl hover:bg-purple-800 transition shadow-xs cursor-pointer flex items-center gap-1.5 border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Todos os Concorrentes</span>
              </button>
            </Link>
            <Link href="/erp">
              <button className="px-3.5 py-2 bg-white text-orange-700 font-bold text-xs rounded-xl hover:bg-orange-50 transition shadow-xs cursor-pointer flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Voltar ao ERP</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Banner de Status Executivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span className="font-bold">Paridade com Saipos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Coberto</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">10 de 10 módulos padrão ativos</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span className="font-bold">Inovações Exclusivas</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">+12 Recursos</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">IA, IoT, Desossa 3 Vias, RFM</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span className="font-bold">Economia Anual TCO</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">R$ 18.000+</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Zero taxa de pedido e mensalidade</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
              <span className="font-bold">Escopo de Negócio</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">2 Unidades</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Gastronomia + Loja de Roupas</p>
          </div>
        </div>

        {/* Navegação entre Abas */}
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("paridade")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "paridade"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Checklist de Paridade & Superioridade (10 Módulos)
          </button>
          <button
            onClick={() => setActiveTab("matriz")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "matriz"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            Matriz Comparativa Técnica Detalhada
          </button>
          <button
            onClick={() => setActiveTab("calculadora")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "calculadora"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Calculadora de ROI & Margem Recuperada
          </button>
          <button
            onClick={() => setActiveTab("arquitetura")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "arquitetura"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Arquitetura Técnica (GCP vs SaaS Fechado)
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: PARIDADE & SUPERIORIDADE TOTAL */}
        {activeTab === "paridade" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Paridade Funcional Completa com Saipos
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O Zuma Pilot não apenas possui 100% das ferramentas do Saipos, como implementa diferenciais exclusivos com inteligência artificial e hardware integrado.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    10 de 10 Módulos Superiores
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold">
                      <th className="py-2.5 px-3">Módulo Funcional</th>
                      <th className="py-2.5 px-3">Recurso Padrão Saipos</th>
                      <th className="py-2.5 px-3">Status no Zuma</th>
                      <th className="py-2.5 px-3">Como o Zuma Supera</th>
                      <th className="py-2.5 px-3 text-right">Ação Direta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {SAIPOS_PARITY_LIST.map((m, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition">
                        <td className="py-3 px-3 font-extrabold text-foreground">
                          {m.moduloSaipos}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {m.recursoSaipos}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {m.statusParidade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-foreground/90">
                          <p className="font-semibold">{m.implementacaoZuma}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{m.diferencialZuma}</p>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href={m.rotaZuma}>
                            <button className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] rounded-lg transition cursor-pointer whitespace-nowrap">
                              Abrir Módulo →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grid dos 4 Pilares Exclusivos do Zuma que a Saipos Não Tem */}
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Os 4 Pilares que a Saipos Não Consegue Oferecer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-purple-500/30 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-xs mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>IA Preditiva & 3 Cenários</span>
                  </div>
                  <h4 className="font-extrabold text-sm mb-1">Previsão Real de Faturamento</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Algoritmo calcula projeção estatística mensal com meta calibrada e ritmo diário por dia útil em Tangará da Serra.
                  </p>
                  <Link href="/mercado">
                    <span className="text-xs font-bold text-purple-600 hover:underline mt-2 inline-block cursor-pointer">Ver Forecast IA →</span>
                  </Link>
                </div>

                <div className="bg-card border border-cyan-500/30 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs mb-2">
                    <Thermometer className="w-4 h-4" />
                    <span>Telemetria IoT de Frio</span>
                  </div>
                  <h4 className="font-extrabold text-sm mb-1">Câmaras Frias & Anvisa</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Monitoramento em tempo real de -1.5°C a +1°C com alerta sonoro e conformidade com protocolos do salmão fresco.
                  </p>
                  <Link href="/telemetria">
                    <span className="text-xs font-bold text-cyan-600 hover:underline mt-2 inline-block cursor-pointer">Ver Sensores IoT →</span>
                  </Link>
                </div>

                <div className="bg-card border border-emerald-500/30 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-2">
                    <Boxes className="w-4 h-4" />
                    <span>Desossa Salmão 3 Vias</span>
                  </div>
                  <h4 className="font-extrabold text-sm mb-1">Kardex Paramétrico Oficial</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Divisão precisa em 58% filé nobre, 15% aparas/tartar e 27% caldos/descarte, blindando a margem do sushibar.
                  </p>
                  <Link href="/estoque">
                    <span className="text-xs font-bold text-emerald-600 hover:underline mt-2 inline-block cursor-pointer">Ver Kardex Pescados →</span>
                  </Link>
                </div>

                <div className="bg-card border border-blue-500/30 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>Multinegócio Oficial</span>
                  </div>
                  <h4 className="font-extrabold text-sm mb-1">Gastronomia + Loja de Roupas</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A Saipos atende apenas restaurantes simples; o Zuma Pilot unifica gastronomia oriental e varejo de moda em uma única conta.
                  </p>
                  <Link href="/mercado">
                    <span className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block cursor-pointer">Ver Unidades Oficiais →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: MATRIZ TÉCNICA */}
        {activeTab === "matriz" && (
          <div>
            {/* Filtros de Categoria */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4">
              <span className="text-xs font-bold text-muted-foreground mr-1">Filtrar:</span>
              {[
                { id: "todos", label: "Todas as Dimensões" },
                { id: "pdv", label: "💳 PDV & Pagamentos" },
                { id: "cozinha", label: "🔥 Cozinha & KDS" },
                { id: "pescados", label: "🐟 Pescados & Kardex" },
                { id: "iot", label: "🌡️ Telemetria IoT" },
                { id: "ia", label: "⚡ Inteligência & IA" },
                { id: "mesa", label: "📱 Salão & Mesa" },
                { id: "delivery", label: "🛵 Delivery & Motoboy" },
                { id: "fiscal", label: "📄 Fiscal & SEFAZ" },
                { id: "multinegocio", label: "👔 Gastronomia & Moda" },
                { id: "custos", label: "💰 Custos & TCO" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedCategory(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === f.id
                      ? "bg-orange-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid dos Cards de Comparação */}
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-orange-500/50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-border/60">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-orange-600/10 text-orange-600 border border-orange-500/20">
                          {item.categoryLabel}
                        </span>
                        <h3 className="font-extrabold text-base text-foreground">
                          {item.feature}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{item.impactoNegocio}</span>
                      </div>
                      {item.linkTeste && (
                        <Link href={item.linkTeste}>
                          <button className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition cursor-pointer">
                            Testar →
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Saipos */}
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Saipos (ERP Genérico)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-600">
                          {item.saiposStatus}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {item.saiposNote}
                      </p>
                    </div>

                    {/* Zuma Pilot & ERP */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Zuma Pilot & ERP 360° (Especializado)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600">
                          {item.zumaStatus}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                        {item.zumaNote}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: CALCULADORA DE ROI */}
        {activeTab === "calculadora" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="max-w-3xl mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Simulador de Margem & Economia Mensal: Zuma vs Saipos
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Um restaurante de sushi possui margem crítica no salmão, no frescor e no giro de mesa. 
                Veja quanto o Zuma Pilot recupera em relação ao Saipos em Tangará da Serra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Controles da Calculadora */}
              <div className="space-y-4 bg-muted/40 p-4 rounded-xl border border-border">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Faturamento Mensal do Zuma (R$):
                  </label>
                  <input
                    type="number"
                    value={faturamentoMensal}
                    onChange={(e) => setFaturamentoMensal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground">Padrão Tangará: R$ 114.850,00</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Compras Mensais de Salmão Fresco (R$):
                  </label>
                  <input
                    type="number"
                    value={comprasSalmaoMensal}
                    onChange={(e) => setComprasSalmaoMensal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-bold text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground">Média: ~196 kg / 33 peças por semana</span>
                </div>
              </div>

              {/* Resultado do ROI */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-emerald-500/30 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Ganho Financeiro Mensal Estimado
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 my-2">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(economiaTotal)}
                    <span className="text-xs font-medium text-muted-foreground"> /mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Equivalente a <strong className="text-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(economiaTotal * 12)}</strong> de lucro líquido adicional por ano.
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-emerald-500/20 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">• Controle Kardex Salmão (8.5% menos perda):</span>
                    <span className="font-bold text-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(economiaKardex)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">• Economia Mensalidade Saipos + Módulos:</span>
                    <span className="font-bold text-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(economiaSaas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">• Ocupação Mapa de Calor (+4.5% vendas):</span>
                    <span className="font-bold text-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ganhoMapaCalor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">• Automação Contábil 1-Click SPED:</span>
                    <span className="font-bold text-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(economiaContabil)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 4: ARQUITETURA TÉCNICA */}
        {activeTab === "arquitetura" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Modelo Saipos */}
              <div className="bg-card border border-red-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-black text-base text-foreground">Como Funciona a Saipos (SaaS Monolítico)</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Dependência Total de Conexão:</strong> Se a internet do salão oscilar em Tangará, a emissão ou os pedidos podem travar em filas remotas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Dados Trancados:</strong> O restaurante não tem acesso direto ao banco SQL/Kardex; relatórios dependem das telas prontas do sistema.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Suporte em Fila:</strong> Atendimento via chamado ou robô de suporte com tempos de espera de horas durante o expediente.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span><strong>Customização Nula:</strong> Impossível solicitar alterações para peculiaridades como o corte do salmão chileno ou rotas específicas de Tangará da Serra.</span>
                  </li>
                </ul>
              </div>

              {/* Modelo Zuma Pilot */}
              <div className="bg-card border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-black text-base text-foreground">Como Funciona o Zuma Pilot (Nuvem Ativa GCP + PWA)</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>Google Cloud Run (southamerica-east1):</strong> Infraestrutura conteinerizada com latência ultrabaixa (~15ms) e redundância total no Brasil.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>Zero-Downtime & Escala a Zero:</strong> Quando o restaurante fecha às 00h, as instâncias reduzem o consumo a zero, gerando custo mínimo de servidor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>Código Próprio (GitHub rodrigokytto/zuma):</strong> Total propriedade intelectual do negócio, sem dependência de terceiros nem risco de cancelamento arbitrário.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span><strong>Integração SEFAZ-MT Direta:</strong> Motor de contingência offline para emissão de NFC-e com conciliação automática no SPED Bloco K.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quadro Resumo com Ações Recomendadas */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 border border-neutral-700">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-orange-400 mb-2">
                Conclusão Estratégica para o Proprietário (Rodrigo Ribeiro Gonçalves)
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                A Saipos é adequada para operações genéricas de baixo valor agregado (hamburguerias e pizzarias). No entanto, para a culinária oriental de alta gastronomia no Zuma em Tangará da Serra, onde o custo do salmão e o timing da cozinha determinam a sobrevivência do negócio, o **Zuma Pilot & ERP 360°** garante blindagem de margem, conformidade com a Anvisa e experiência premium aos clientes do salão e delivery.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pdv">
                  <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Abrir PDV Touch</span>
                  </button>
                </Link>
                <Link href="/kds-v2">
                  <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Ver KDS 2.0 Fire</span>
                  </button>
                </Link>
                <Link href="/mercado">
                  <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>IA & Previsão Preditiva</span>
                  </button>
                </Link>
                <Link href="/fechamento-contabil">
                  <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs rounded-xl transition cursor-pointer">
                    Fechamento 1-Click SEFAZ-MT
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ComparativoSaipos;
