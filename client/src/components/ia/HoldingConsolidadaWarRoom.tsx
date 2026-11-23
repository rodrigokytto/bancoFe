import React, { useState } from "react";
import {
  Building2,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  ShoppingBag,
  Zap,
  Instagram,
  Facebook,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Play,
  PieChart,
  Globe,
  Award,
  Trophy,
  Percent,
  ChevronRight,
  Eye,
  Flame,
  ArrowUpRight,
  MessageSquare,
  Smartphone,
  Check,
  X,
  Sliders,
  Radio,
  Clock,
  Filter,
  BarChart3,
  Search,
  Lock,
  Send,
  Video,
  UtensilsCrossed,
  CreditCard,
  Truck,
  Store,
  ShieldCheck,
  Coins,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { IfoodHubV2 } from "../integrations/IfoodHubV2";
import { KeetoPosHub } from "../integrations/KeetoPosHub";
import { BancosTefHub } from "../integrations/BancosTefHub";

interface BusinessGapOpportunity {
  id: string;
  negocioNome: string;
  negocioTipo: "gastronomia" | "roupas" | "agro";
  negocioIcone: string;
  faturamentoAtual: number;
  faturamentoFormatado: string;
  potencialCaptura: number;
  potencialCapturaFormatado: string;
  shareAtual: number;
  shareAlvo: number;
  gaps: Array<{
    titulo: string;
    impacto: "Crítico" | "Alto" | "Médio";
    descricaoPerda: string;
    causaRaiz: string;
  }>;
  oportunidades: Array<{
    titulo: string;
    ganhoEstimadoFormatado: string;
    estrategia: string;
    tempoImplementacao: string;
  }>;
}

const DADOS_NEGOCIOS: BusinessGapOpportunity[] = [
  {
    id: "zuma_gastronomia",
    negocioNome: "Zuma Gastronomia Oriental",
    negocioTipo: "gastronomia",
    negocioIcone: "🥢",
    faturamentoAtual: 345000,
    faturamentoFormatado: "R$ 345.000/mês",
    potencialCaptura: 103000,
    potencialCapturaFormatado: "+R$ 103.000/mês",
    shareAtual: 18.9,
    shareAlvo: 24.5,
    gaps: [
      {
        titulo: "Ociosidade Crítica em Dias Úteis (Terça e Quarta)",
        impacto: "Crítico",
        descricaoPerda: "Perda estimada de R$ 38.000/mês em capacidade ociosa de salão (ocupação média de apenas 42%).",
        causaRaiz: "Foco excessivo da clientela no fim de semana (sexta a domingo) sem atrativo corporativo ou executivo semanal."
      },
      {
        titulo: "Gargalo Logístico em Dias de Chuva Forte em Tangará",
        impacto: "Alto",
        descricaoPerda: "Atraso médio sobe de 32 para 54 minutos no raio > 4km, gerando reclamações e cancelamentos de pedidos.",
        causaRaiz: "Déficit de motoboys próprios com baú vedado durante tempestades e falta de roteirização preventiva."
      },
      {
        titulo: "Margem Pressionada pela Cotação Cambial do Salmão Chileno",
        impacto: "Médio",
        descricaoPerda: "Aumento de 6% no CMV em meses de alta do Dólar PTAX (Salmo salar fresco importado CIF Tangará).",
        causaRaiz: "Dependência de compras spot semanais sem contrato de hedge ou volume garantido com frigoríficos de Santiago."
      }
    ],
    oportunidades: [
      {
        titulo: "Lançamento de Menu Executivo Almoço & Bento Box Corporativo",
        ganhoEstimadoFormatado: "+R$ 48.000/mês",
        estrategia: "Atender executivos, advogados, bancos e médicos do Centro e Cidade Alta das 11h30 às 14h com serviço ágil de 15 min.",
        tempoImplementacao: "Rápida (1-3 dias)"
      },
      {
        titulo: "Rodízio Corporativo de Terça & Quarta com Cashback para Empresas",
        ganhoEstimadoFormatado: "+R$ 35.000/mês",
        estrategia: "Criar a 'Noite do Agro & Negócios' com reserva antecipada e 10% de cashback para equipes de cooperativas e tradings.",
        tempoImplementacao: "Média (1-2 sem)"
      },
      {
        titulo: "Otimização de Rota com Baú Térmico Estanque na Chuva",
        ganhoEstimadoFormatado: "+R$ 20.000/mês",
        estrategia: "Garantir entrega em até 35 min mesmo com chuva, capturando pedidos de concorrentes que fecham o delivery.",
        tempoImplementacao: "Rápida (1-3 dias)"
      }
    ]
  },
  {
    id: "zuma_roupas",
    negocioNome: "Zuma Loja de Roupas & Boutique",
    negocioTipo: "roupas",
    negocioIcone: "👗",
    faturamentoAtual: 168000,
    faturamentoFormatado: "R$ 168.000/mês",
    potencialCaptura: 85000,
    potencialCapturaFormatado: "+R$ 85.000/mês",
    shareAtual: 17.9,
    shareAlvo: 26.0,
    gaps: [
      {
        titulo: "Dependência de Venda Física Presencial no Balcão",
        impacto: "Crítico",
        descricaoPerda: "82% do faturamento concentrado na porta da loja; perda de clientes que compram à noite ou pelo celular.",
        causaRaiz: "Ausência de catálogo digital integrado com checkout instantâneo no Instagram e WhatsApp."
      },
      {
        titulo: "Cross-Selling Inexplorado com Clientes da Gastronomia",
        impacto: "Alto",
        descricaoPerda: "Desperdício de 14.800 clientes VIP do restaurante que não sabem ou não recebem ofertas da boutique.",
        causaRaiz: "Bases de CRM operando em silos separados, sem pontuação unificada ou cashback conjunto."
      },
      {
        titulo: "Falta de Mala Condicional VIP Estruturada",
        impacto: "Médio",
        descricaoPerda: "Perda de ~R$ 18.000/mês em vendas para clientes de alta renda que preferem provar peças em casa.",
        causaRaiz: "Processo manual de envio de mala sem cadastro de garantia, termo digital de devolução e prazo de 24h."
      }
    ],
    oportunidades: [
      {
        titulo: "Catálogo Social Commerce com Checkout no Instagram & TikTok Shop",
        ganhoEstimadoFormatado: "+R$ 38.000/mês",
        estrategia: "Publicar looks completos com link direto de compra via Pix com entrega expressa em Tangará da Serra em 2 horas.",
        tempoImplementacao: "Rápida (2-4 dias)"
      },
      {
        titulo: "Sinergia de Cashback Cruzado (Jantar no Zuma = Ganhar Look)",
        ganhoEstimadoFormatado: "+R$ 29.000/mês",
        estrategia: "Cada R$ 250 consumidos no restaurante geram R$ 35 de crédito na boutique, incentivando visitas de fim de semana.",
        tempoImplementacao: "Imediata (1 dia)"
      },
      {
        titulo: "Serviço de 'Mala em Casa VIP' para Moradores de Condomínio",
        ganhoEstimadoFormatado: "+R$ 18.000/mês",
        estrategia: "Envio de curadoria de 6 looks selecionados pelo perfil de compras da cliente com motoboy exclusivo do Zuma.",
        tempoImplementacao: "Média (1 sem)"
      }
    ]
  },
  {
    id: "kytto_agro",
    negocioNome: "Kytto Agro & Corporativo B2B",
    negocioTipo: "agro",
    negocioIcone: "🌾",
    faturamentoAtual: 215000,
    faturamentoFormatado: "R$ 215.000/mês",
    potencialCaptura: 132000,
    potencialCapturaFormatado: "+R$ 132.000/mês",
    shareAtual: 17.2,
    shareAlvo: 28.0,
    gaps: [
      {
        titulo: "Sazonalidade do Calendário de Safra no Mato Grosso",
        impacto: "Crítico",
        descricaoPerda: "Queda de 35% na receita corporativa nos meses de entressafra (maio a julho) sem contratos fixos.",
        causaRaiz: "Foco exclusivo em eventos pontuais de safra sem retenção em contratos de fornecimento contínuo."
      },
      {
        titulo: "Perda de Eventos Corporativos para Churrascarias Tradicionais",
        impacto: "Alto",
        descricaoPerda: "Tradings e usinas locais contratam buffets convencionais por falta de proposta formal de catering executivo oriental.",
        causaRaiz: "Inexistência de um deck comercial corporativo com nota fiscal faturada a 30 dias via Sicredi."
      },
      {
        titulo: "Falta de Portal do Cliente B2B com Pedidos Faturados",
        impacto: "Médio",
        descricaoPerda: "Demora de até 48 horas para envio de orçamentos e formalização de pedidos de diretoria.",
        causaRaiz: "Fluxo de orçamentos manual via WhatsApp sem autoatendimento corporativo com limite de crédito pré-aprovado."
      }
    ],
    oportunidades: [
      {
        titulo: "Contratos Anuais de Fornecimento para Tradings e Usinas (Amaggi/Coprodia)",
        ganhoEstimadoFormatado: "+R$ 65.000/mês",
        estrategia: "Firmar convênios de alimentação executiva e confraternizações mensais com faturamento quinzenal automático.",
        tempoImplementacao: "Média (2-3 sem)"
      },
      {
        titulo: "Catering Exclusivo 'Zuma Móvel Chef na Fazenda' para Acionistas",
        ganhoEstimadoFormatado: "+R$ 42.000/mês",
        estrategia: "Montagem de estrutura sushibar com chef in-loco na sede das fazendas em dias de visita de investidores e diretores.",
        tempoImplementacao: "Rápida (3-5 dias)"
      },
      {
        titulo: "Camarote Privativo Agro Zuma para Reuniões de Fechamento de Grãos",
        ganhoEstimadoFormatado: "+R$ 25.000/mês",
        estrategia: "Reserva de espaço reservado com isolamento acústico, telão de projeção, Starlink e menu degustação exclusivo.",
        tempoImplementacao: "Imediata (1 dia)"
      }
    ]
  }
];

interface HoldingConsolidadaWarRoomProps {
  onSelectBusiness?: (id: string) => void;
}

export const HoldingConsolidadaWarRoom: React.FC<HoldingConsolidadaWarRoomProps> = ({ onSelectBusiness }) => {
  const [subAbaConsolidada, setSubAbaConsolidada] = useState<"gaps" | "simulador" | "redes" | "sinergias">("gaps");
  const [alavancaAlmoco, setAlavancaAlmoco] = useState<number>(75);
  const [alavancaCashback, setAlavancaCashback] = useState<number>(80);
  const [alavancaHedgeSalmao, setAlavancaHedgeSalmao] = useState<number>(65);
  const [alavancaCateringAgro, setAlavancaCateringAgro] = useState<number>(70);
  const [estrategiaAprovada, setEstrategiaAprovada] = useState<boolean>(false);
  const [negocioFoco, setNegocioFoco] = useState<string>("todos");
  const [canalAtivo, setCanalAtivo] = useState<
    "ifood" | "keeto" | "instagram" | "facebook" | "tiktok" | "google" | "whatsapp" | "bancos"
  >("ifood");

  const [expandirIfoodHub, setExpandirIfoodHub] = useState(false);
  const [expandirKeetoHub, setExpandirKeetoHub] = useState(false);
  const [expandirBancosHub, setExpandirBancosHub] = useState(false);

  const [modalSimuladorAberto, setModalSimuladorAberto] = useState(false);
  const [campanhaExecutando, setCampanhaExecutando] = useState(false);

  // Executar simulação de campanha integrada
  const executarSimulacaoCampanha = () => {
    setCampanhaExecutando(true);
    setTimeout(() => {
      setCampanhaExecutando(false);
      setModalSimuladorAberto(false);
      toast.success("Campanha Integrada Disparada! Anúncios no Meta Ads, TikTok Spark Ads e WhatsApp VIP ativos com ROAS estimado de 5.4x.");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* PAINEL EXECUTIVO SERENO: HOLDING CONSOLIDADA & VISÃO MULTINEGÓCIOS    */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--ink)] border border-[var(--line)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Holding Consolidada
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                3 Negócios Ativos em Produção
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                Tangará da Serra · MT
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--ink)]">
              Visão Consolidada de Negócios &amp; Inteligência Multissetorial
            </h2>

            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Zuma Cozinha Oriental opera como o negócio âncora do grupo em sinergia com a Zuma Loja de Roupas &amp; Boutique e o braço Corporativo/Agro. Este painel monitora <b>gaps, oportunidades de expansão, integrações operacionais (iFood, Keeto POS) e tráfego multicanal unificado</b> em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setModalSimuladorAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Campanha Multicanal &amp; Tráfego</span>
            </button>
            <button
              onClick={() => toast.success("Dados da Holding e integrações sincronizados em tempo real!")}
              className="p-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition-all cursor-pointer"
              title="Sincronizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Indicadores Estruturais Complementares da Holding (Sem Redundância com os KPIs do Topo) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              EBITDA Médio Consolidado
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              29.4%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Margem operacional com compras unificadas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Base de Clientes CRM Unificada
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              18.450
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block leading-tight">
              42% da base consome em 2+ empresas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              ROAS Médio de Mídia Paga
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              5.4x
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Meta Ads + TikTok + Google Ads
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Custo por Lead (CPL) WhatsApp
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              R$ 1,78
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              WhatsApp Business Cloud API
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ABAS DA VISÃO CONSOLIDADA: GAPS, INTEGRAÇÕES E CANAIS, SINERGIAS      */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubAbaConsolidada("gaps")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "gaps"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Matriz de Gaps &amp; Oportunidades por Negócio</span>
          </button>

          <button
            onClick={() => setSubAbaConsolidada("simulador")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "simulador"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Simulador Estratégico da Holding (War Room 1-Click)</span>
          </button>
          <button
            onClick={() => setSubAbaConsolidada("redes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "redes"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Integrações &amp; Canais: iFood, Keeto POS, Redes &amp; Bancos</span>
          </button>

          <button
            onClick={() => setSubAbaConsolidada("sinergias")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "sinergias"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Sinergias Cruzadas &amp; LTV do Grupo</span>
          </button>
        </div>

        {/* Filtro Rápido de Negócio na visualização de Gaps */}
        {subAbaConsolidada === "gaps" && (
          <div className="flex items-center gap-1 text-xs px-1">
            <span className="text-[10px] text-[var(--muted)] font-bold uppercase mr-1">Filtrar:</span>
            {["todos", "zuma_gastronomia", "zuma_roupas", "kytto_agro"].map((key) => {
              const label =
                key === "todos"
                  ? "Todas as Empresas"
                  : key === "zuma_gastronomia"
                  ? "🥢 Gastronomia"
                  : key === "zuma_roupas"
                  ? "👗 Roupas"
                  : "🌾 Agro B2B";
              return (
                <button
                  key={key}
                  onClick={() => setNegocioFoco(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    negocioFoco === key
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-2xs ring-1 ring-[var(--line)] font-black"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SUB-ABA 1: MATRIZ DE GAPS & OPORTUNIDADES POR NEGÓCIO                 */}
      {/* ===================================================================== */}
      {subAbaConsolidada === "gaps" && (
        <div className="space-y-6">
          {DADOS_NEGOCIOS.filter((n) => negocioFoco === "todos" || n.id === negocioFoco).map((negocio) => (
            <div
              key={negocio.id}
              className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5"
            >
              {/* Header do Negócio */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {negocio.negocioIcone}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                        {negocio.negocioNome}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        negocio.negocioTipo === "gastronomia"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : negocio.negocioTipo === "roupas"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {negocio.negocioTipo === "gastronomia" ? "Negócio Âncora / Principal" : "Negócio Independente"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {negocio.negocioTipo === "gastronomia" && "Negócio Principal · Culinária Japonesa & Alta Gastronomia · Mercado: R$ 1.82M (Tangará da Serra)"}
                      {negocio.negocioTipo === "roupas" && "Moda Feminina & Masculina Premium · Tendências · Mercado: R$ 940k (Moda Tangará da Serra)"}
                      {negocio.negocioTipo === "agro" && "Grandes Contas Corporativas & Tradings · Catering Safra VIP · Mercado: R$ 1.25M B2B Regional"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-right">
                    <span className="text-[10px] text-[var(--muted)] font-bold block uppercase">Faturamento</span>
                    <strong className="text-sm font-black font-mono text-[var(--ink)]">{negocio.faturamentoFormatado}</strong>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
                    <span className="text-[10px] text-purple-400 font-bold block uppercase">Oportunidade Nova</span>
                    <strong className="text-sm font-black font-mono text-purple-400">{negocio.potencialCapturaFormatado}</strong>
                  </div>
                  {onSelectBusiness && (
                    <button
                      onClick={() => onSelectBusiness(negocio.id === "zuma_gastronomia" ? "zuma" : negocio.id)}
                      className="px-3 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver War Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid: Gaps vs Oportunidades */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Coluna 1: GAPS IDENTIFICADOS */}
                <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400">
                        Gaps &amp; Gargalos Identificados ({negocio.gaps.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold">
                      Impacto Negativo
                    </span>
                  </div>

                  <div className="space-y-3">
                    {negocio.gaps.map((gap, gIdx) => (
                      <div
                        key={gIdx}
                        className="p-3.5 rounded-xl bg-[var(--surface)] border border-red-500/20 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-xs font-bold text-[var(--ink)] leading-snug">
                            {gap.titulo}
                          </strong>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono shrink-0 ${
                            gap.impacto === "Crítico"
                              ? "bg-red-500 text-white"
                              : gap.impacto === "Alto"
                              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                              : "bg-zinc-500/20 text-zinc-400"
                          }`}>
                            {gap.impacto}
                          </span>
                        </div>
                        <p className="text-[11px] text-red-600 dark:text-red-300 font-medium leading-relaxed">
                          ⚠️ {gap.descricaoPerda}
                        </p>
                        <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                          <b>Causa Raiz:</b> {gap.causaRaiz}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coluna 2: OPORTUNIDADES E CONTRA-ATAQUES */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Oportunidades &amp; Contra-Ataques ({negocio.oportunidades.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Receita Nova Mapeada
                    </span>
                  </div>

                  <div className="space-y-3">
                    {negocio.oportunidades.map((op, oIdx) => (
                      <div
                        key={oIdx}
                        className="p-3.5 rounded-xl bg-[var(--surface)] border border-emerald-500/20 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-xs font-bold text-[var(--ink)] leading-snug">
                            {op.titulo}
                          </strong>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black font-mono bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                            {op.ganhoEstimadoFormatado}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                          {op.estrategia}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-[var(--line)] text-[10px]">
                          <span className="text-[var(--muted)]">Tempo: <b>{op.tempoImplementacao}</b></span>
                          <button
                            onClick={() => toast.success(`Oportunidade ativada no Zuma Pilot: ${op.titulo}`)}
                            className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Ativar Oportunidade</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-ABA: SIMULADOR ESTRATÉGICO DA HOLDING CONSOLIDADA (1-CLICK)       */}
      {/* ===================================================================== */}
      {subAbaConsolidada === "simulador" && (() => {
        const ganhoAlmoco = Math.round(48000 * (alavancaAlmoco / 100));
        const ganhoCashback = Math.round((24200 + 18000) * (alavancaCashback / 100));
        const economiaSalmao = Math.round(9420 * (alavancaHedgeSalmao / 100));
        const ganhoCatering = Math.round(42000 * (alavancaCateringAgro / 100));

        const faturamentoIncremental = ganhoAlmoco + ganhoCashback + ganhoCatering;
        const faturamentoProjetado = 673000 + faturamentoIncremental;
        const ebitdaIncremental = (ganhoAlmoco * 0.45) + (ganhoCashback * 0.40) + economiaSalmao + (ganhoCatering * 0.50);
        const ebitdaProjetadoReais = 197862 + ebitdaIncremental;
        const ebitdaProjetadoPercentual = ((ebitdaProjetadoReais / faturamentoProjetado) * 100).toFixed(1);
        const caixaLivreProjetado = Math.round(ebitdaProjetadoReais * 0.76);

        return (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      War Room de Decisão Executiva
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Projeção Preditiva Zumi IA
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                      Tangará da Serra · MT
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                    Simulador de Decisão Estratégica &amp; Alavancagem da Holding
                  </h2>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Ajuste as 4 alavancas táticas abaixo para projetar em tempo real o impacto consolidado no faturamento, margem EBITDA e fluxo de caixa livre do grupo Rodrigo Ribeiro Gonçalves.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEstrategiaAprovada(true);
                      toast.success("Estratégia Aprovada com Sucesso!", {
                        description: `Faturamento projetado de R$ ${faturamentoProjetado.toLocaleString("pt-BR")}/mês com EBITDA de ${ebitdaProjetadoPercentual}%.`
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{estrategiaAprovada ? "Estratégia Aprovada (Ativa)" : "Aprovar & Despachar Ordens IA Zumi"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Faturamento Projetado
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
                    R$ {faturamentoProjetado.toLocaleString("pt-BR")}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
                    +R$ {faturamentoIncremental.toLocaleString("pt-BR")}/mês incremental
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    EBITDA Projetado
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {ebitdaProjetadoPercentual}%
                  </div>
                  <span className="text-[10px] text-[var(--muted)] block leading-tight">
                    R$ {ebitdaProjetadoReais.toLocaleString("pt-BR")} margem operacional
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Caixa Livre Mensal
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                    R$ {caixaLivreProjetado.toLocaleString("pt-BR")}
                  </div>
                  <span className="text-[10px] text-[var(--muted)] block leading-tight">
                    Disponível pós-impostos e custos
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Hedge CMV Salmão PTAX
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                    R$ {economiaSalmao.toLocaleString("pt-BR")}
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block leading-tight">
                    Economia retida no insumo nobre
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-[var(--ink)]">Cenários Executivos Prontos:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setAlavancaAlmoco(40);
                    setAlavancaCashback(40);
                    setAlavancaHedgeSalmao(40);
                    setAlavancaCateringAgro(40);
                    toast.info("Cenário Conservador Equilibrado aplicado!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--ink)] border border-[var(--line)] transition-all cursor-pointer"
                >
                  🎯 Conservador Equilibrado (40%)
                </button>
                <button
                  onClick={() => {
                    setAlavancaAlmoco(90);
                    setAlavancaCashback(60);
                    setAlavancaHedgeSalmao(70);
                    setAlavancaCateringAgro(90);
                    toast.info("Cenário Foco Almoço & B2B Agro aplicado!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                >
                  🌾 Foco Almoço &amp; Agro B2B
                </button>
                <button
                  onClick={() => {
                    setAlavancaAlmoco(60);
                    setAlavancaCashback(95);
                    setAlavancaHedgeSalmao(80);
                    setAlavancaCateringAgro(50);
                    toast.info("Cenário Sinergia Gastronomia & Moda aplicado!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-700 dark:text-purple-400 border border-purple-500/20 transition-all cursor-pointer"
                >
                  👗 Sinergia Gastronomia &amp; Moda
                </button>
                <button
                  onClick={() => {
                    setAlavancaAlmoco(100);
                    setAlavancaCashback(100);
                    setAlavancaHedgeSalmao(100);
                    setAlavancaCateringAgro(100);
                    toast.success("Cenário Escala Máxima da Holding aplicado!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                >
                  🚀 Escala Máxima Tangará (100%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                      🍱 Almoço Executivo &amp; Bento Box Corporativo B2B
                    </h4>
                    <span className="text-[11px] text-[var(--muted)]">Atende bancos, advogados e produtoras rurais no centro</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      +R$ {ganhoAlmoco.toLocaleString("pt-BR")}/mês
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">{alavancaAlmoco}% meta</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alavancaAlmoco}
                  onChange={(e) => setAlavancaAlmoco(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                  <span>Capacidade: 65 pedidos/dia</span>
                  <a href="/integracoes?tab=keeto" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Ver Mesas &amp; Salão →
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                      👗 Cashback Unificado (Gastronomia ⇄ Loja de Roupas)
                    </h4>
                    <span className="text-[11px] text-[var(--muted)]">8% de crédito cruzado entre o tatame e a boutique</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 block">
                      +R$ {ganhoCashback.toLocaleString("pt-BR")}/mês
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">{alavancaCashback}% adesão</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alavancaCashback}
                  onChange={(e) => setAlavancaCashback(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                  <span>Reativação de 1.480 clientes</span>
                  <a href="/integracoes?tab=crm_fidelidade" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                    Ver CRM RFV →
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                      🐟 Hedge Cambial do Salmão Chileno Nobre (PTAX BACEN)
                    </h4>
                    <span className="text-[11px] text-[var(--muted)]">Compra programada CIF Puerto Montt a R$ 5,68 fixo</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                      R$ {economiaSalmao.toLocaleString("pt-BR")}/mês retidos
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">{alavancaHedgeSalmao}% protegido</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alavancaHedgeSalmao}
                  onChange={(e) => setAlavancaHedgeSalmao(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                  <span>Proteção de margem bruta a 68%</span>
                  <a href="/integracoes?tab=supply_agro" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Ver Cotação Commodities →
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
                      🌾 Noites Corporativas &amp; Eventos Agro Tangará MT
                    </h4>
                    <span className="text-[11px] text-[var(--muted)]">Jantares corporativos de safra com NF-e 55 e boleto 28d</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 block">
                      +R$ {ganhoCatering.toLocaleString("pt-BR")}/mês
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">{alavancaCateringAgro}% ocupação</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alavancaCateringAgro}
                  onChange={(e) => setAlavancaCateringAgro(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                  <span>Ocupa terças e quartas do salão</span>
                  <a href="/integracoes?tab=sefaz_dfe" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                    Ver Faturamento Fiscal →
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================================================================== */}
      {/* SUB-ABA 2: INTEGRAÇÕES & CANAIS: IFOOD, KEETO POS, REDES, BANCOS     */}
      {/* ===================================================================== */}
      {subAbaConsolidada === "redes" && (
        <div className="space-y-6">
          {/* Seletor Horizontal de Canais & Integrações */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: "ifood", label: "iFood Merchant v2", icon: ShoppingBag, cor: "bg-red-600 text-white", badge: "Loja Aberta · 42 Ped/dia" },
              { id: "keeto", label: "Keeto POS & Mesas", icon: UtensilsCrossed, cor: "bg-orange-600 text-white", badge: "27 Mesas · KDS Ativo" },
              { id: "bancos", label: "Sicredi Pix & TEF Stone", icon: CreditCard, cor: "bg-emerald-600 text-white", badge: "Taxa 0% Pix · D+0" },
              { id: "instagram", label: "Instagram (@zuma)", icon: Instagram, cor: "bg-pink-600 text-white", badge: "31.4k Seguidores" },
              { id: "facebook", label: "Facebook & Meta Ads", icon: Facebook, cor: "bg-blue-600 text-white", badge: "ROAS 5.4x Ativo" },
              { id: "tiktok", label: "TikTok (@zumatangara)", icon: Video, cor: "bg-black text-white dark:bg-zinc-800", badge: "412k Views/mês" },
              { id: "google", label: "Google (Ads & Maps)", icon: Globe, cor: "bg-teal-600 text-white", badge: "Nota 4.9 ★ (920)" },
              { id: "whatsapp", label: "WhatsApp Business API", icon: MessageSquare, cor: "bg-green-600 text-white", badge: "14.8k Contatos" },
            ].map((rede) => {
              const Icon = rede.icon;
              const isAtiva = canalAtivo === rede.id;
              return (
                <button
                  key={rede.id}
                  onClick={() => setCanalAtivo(rede.id as any)}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isAtiva
                      ? `${rede.cor} shadow-md scale-102`
                      : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{rede.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 uppercase font-mono">
                    {rede.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* 1. PAINEL IFOOD MERCHANT V2 & MARKETPLACE WAR ROOM               */}
          {/* ================================================================= */}
          {canalAtivo === "ifood" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[var(--ink)]">iFood Merchant API v2 &amp; Marketplace War Room</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Loja Aberta · Tangará da Serra
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                        Pooling Ativo (4s)
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Sincronização de cardápio instantânea, auto-stock pause de salmão, despacho direto para o KDS e comparativo de taxas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandirIfoodHub(!expandirIfoodHub)}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{expandirIfoodHub ? "Ocultar Hub Detalhado" : "Abrir Hub Completo iFood"}</span>
                    {expandirIfoodHub ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toast.success("Cardápio iFood sincronizado com o estoque de salmão!")}
                    className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
                    title="Sincronizar iFood"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Métricas de Mercado iFood vs Canal Próprio */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Faturamento iFood (30D)</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">R$ 41.200</div>
                  <div className="text-[10px] text-red-500 font-bold">Taxa paga: R$ 10.300 (25%)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Faturamento PWA Zuma Próprio</span>
                  <div className="text-lg font-black font-mono text-emerald-500">R$ 88.500</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">Taxa paga: R$ 0,00 (Pix Sicredi)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block">Economia Anual com Canal Próprio</span>
                  <div className="text-lg font-black font-mono text-purple-500">+R$ 123.600</div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">Retido no caixa do Zuma</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Tempo Médio de Despacho</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">28 min</div>
                  <div className="text-[10px] text-emerald-500 font-bold">Zuma 28 min vs iFood Concorrentes 52 min</div>
                </div>
              </div>

              {/* Análise de Inteligência Competitiva no iFood */}
              <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <strong className="text-red-700 dark:text-red-300 font-black">
                    Diagnóstico de Mercado: Por que os Concorrentes no iFood estão Sangrando Margem
                  </strong>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Concorrentes como <b>Saikô Sushi (70% dependente do iFood)</b> e <b>Kero Sushi (100% dependente do iFood)</b> repassam 23% a 27% de cada pedido para o marketplace e sofrem cancelamentos massivos quando chove em Tangará. O <b>Zuma Pilot</b> utiliza o iFood estritamente como canal de topo de funil para aquisição de clientes novos, enviando no primeiro pedido um cupom de 15% para o próximo pedido no aplicativo próprio PWA com Pix Sicredi.
                </p>
              </div>

              {/* HUB DETALHADO EXPANSÍVEL DO IFOOD */}
              {expandirIfoodHub && (
                <div className="pt-4 border-t border-[var(--line)]">
                  <IfoodHubV2 />
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. PAINEL KEETO POS & MESAS DE SALÃO 360°                        */}
          {/* ================================================================= */}
          {canalAtivo === "keeto" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[var(--ink)]">Keeto POS &amp; Gestão de Mesas do Salão (27 Mesas)</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Online · Sincronizado
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        SEFAZ-MT NFC-e em 1.8s
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Comanda digital de garçom mobile, divisão de conta (Split Bill), KDS por praça e integração com fechamento diário.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandirKeetoHub(!expandirKeetoHub)}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{expandirKeetoHub ? "Ocultar Hub Detalhado" : "Abrir Hub Completo Keeto POS"}</span>
                    {expandirKeetoHub ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toast.success("Mesas e comandas Keeto sincronizadas com a cozinha KDS!")}
                    className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
                    title="Sincronizar Keeto"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Métricas de Desempenho do Salão Keeto */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Mesas Monitoradas</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">27 Mesas</div>
                  <div className="text-[10px] text-emerald-500 font-bold">19 mesas ativas no turno</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Tempo Médio de Mesa</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">42 minutos</div>
                  <div className="text-[10px] text-emerald-500 font-bold">23 min mais rápido que Saipos</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Ticket Médio Salão</span>
                  <div className="text-lg font-black font-mono text-emerald-500">R$ 185,00</div>
                  <div className="text-[10px] text-zinc-400">Cardápio digital com foto aumenta +22%</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Erros de Comanda</span>
                  <div className="text-lg font-black font-mono text-purple-400">0,0%</div>
                  <div className="text-[10px] text-emerald-500 font-bold">Eliminação de anotação de papel</div>
                </div>
              </div>

              {/* HUB DETALHADO EXPANSÍVEL DO KEETO */}
              {expandirKeetoHub && (
                <div className="pt-4 border-t border-[var(--line)]">
                  <KeetoPosHub />
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. PAINEL BANCOS MT, SICREDI PIX & TEF STONE                     */}
          {/* ================================================================= */}
          {canalAtivo === "bancos" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[var(--ink)]">Open Finance MT: Sicredi Pix Taxa 0% &amp; TEF Stone</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Liquidação Instantânea D+0
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Boleto faturado para Tradings a 30 dias, conciliação automática com o Fechamento Diário e TEF multiadquirente.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandirBancosHub(!expandirBancosHub)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{expandirBancosHub ? "Ocultar Hub Detalhado" : "Abrir Hub Bancos & TEF"}</span>
                    {expandirBancosHub ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toast.success("Saldos e extratos Sicredi conciliados com sucesso!")}
                    className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
                    title="Conciliar Bancos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Métricas de Financeiro */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Volume Pix Sicredi (30D)</span>
                  <div className="text-lg font-black font-mono text-emerald-500">R$ 218.400</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">Taxa paga: R$ 0,00 (0,00%)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">TEF Stone Crédito/Débito</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">R$ 384.200</div>
                  <div className="text-[10px] text-zinc-400">Taxa negociada: 1,09% déb / 2,19% créd</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Boletos Faturados Agro (30D)</span>
                  <div className="text-lg font-black font-mono text-blue-500">R$ 125.400</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-300 font-bold">100% adimplência (Sicredi D+30)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Tempo de Fechamento Diário</span>
                  <div className="text-lg font-black font-mono text-purple-400">12 segundos</div>
                  <div className="text-[10px] text-emerald-500 font-bold">Conciliação Z automática</div>
                </div>
              </div>

              {/* HUB DETALHADO EXPANSÍVEL DE BANCOS */}
              {expandirBancosHub && (
                <div className="pt-4 border-t border-[var(--line)]">
                  <BancosTefHub />
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* 4. PAINEL INSTAGRAM                                               */}
          {/* ================================================================= */}
          {canalAtivo === "instagram" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[var(--ink)]">Instagram Graph API v21.0</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Conectado Online
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Perfis integrados: <b>@zuma.culinariaoriental</b> (24.2k) e <b>@zuma.boutique</b> (7.2k)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success("Feed e Stories do Instagram sincronizados com sucesso!")}
                    className="px-3.5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sincronizar Insights</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Seguidores Totais</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">31.400</div>
                  <div className="text-[10px] text-emerald-500 font-bold">+1.240 este mês</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Alcance (30 Dias)</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">184.200 contas</div>
                  <div className="text-[10px] text-emerald-500 font-bold">78% de Tangará da Serra</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Taxa de Engajamento</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">4.92%</div>
                  <div className="text-[10px] text-purple-400 font-bold">2.1x acima da média regional</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Cliques no Link Bio / PWA</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">4.820 cliques</div>
                  <div className="text-[10px] text-indigo-400 font-bold">Conversão para Pedido: 18%</div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 5. PAINEL FACEBOOK & META ADS                                     */}
          {/* ================================================================= */}
          {canalAtivo === "facebook" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[var(--ink)]">Facebook Ads &amp; Meta Business Manager</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ROAS 5.4x Ativo
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Campanhas hiperlocais ativas · Raio de 5km de Tangará da Serra · Público A/B
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success("Campanhas Meta Ads sincronizadas!")}
                    className="px-3.5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Atualizar Métricas</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Investimento Mensal</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">R$ 4.250</div>
                  <div className="text-[10px] text-zinc-400">Meta + Instagram Ads</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Retorno Direto (Pixel)</span>
                  <div className="text-lg font-black font-mono text-emerald-400">R$ 22.950</div>
                  <div className="text-[10px] text-emerald-500 font-bold">ROAS Real de 5.4x</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Custo por Clique (CPC)</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">R$ 0,42</div>
                  <div className="text-[10px] text-emerald-500 font-bold">Baixo custo de leilão local</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Leads WhatsApp</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">840 conversas</div>
                  <div className="text-[10px] text-indigo-400 font-bold">CPL de R$ 1,78</div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 6. PAINEL TIKTOK                                                  */}
          {/* ================================================================= */}
          {canalAtivo === "tiktok" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0 shadow-xs border border-white/10">
                    <Video className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[var(--ink)]">TikTok For Business &amp; Spark Ads</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        Viralidade Tangará
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Conta Oficial: <b>@zumatangara</b> · 412k visualizações mensais de vídeos curtos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success("Trends de gastronomia e moda no TikTok analisadas!")}
                    className="px-3.5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span>Escanear Trends Tangará</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Views Totais (30D)</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">412.000</div>
                  <div className="text-[10px] text-pink-500 font-bold">+28% visualizações virais</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Seguidores TikTok</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">18.900</div>
                  <div className="text-[10px] text-zinc-400">Público 18-35 anos</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Compartilhamentos</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">6.240</div>
                  <div className="text-[10px] text-emerald-500 font-bold">Alta viralidade orgânica</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Spark Ads ROAS</span>
                  <div className="text-lg font-black font-mono text-emerald-400">4.8x</div>
                  <div className="text-[10px] text-zinc-400">Custo por clique R$ 0,38</div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 7. PAINEL GOOGLE ADS & MAPS                                       */}
          {/* ================================================================= */}
          {canalAtivo === "google" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[var(--ink)]">Google Business Profile &amp; Google Ads</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Presença Local Otimizada
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Ficha Oficial Verificada · Tangará da Serra - MT · 920 Avaliações 4.9 ★★★★★
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success("Avaliações do Google respondidas automaticamente pela IA Zumi!")}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Responder Reviews (IA)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Pesquisas no Maps</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">24.600</div>
                  <div className="text-[10px] text-emerald-500 font-bold">1º lugar para 'sushi tangará'</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Rotas Solicitadas</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">8.920</div>
                  <div className="text-[10px] text-zinc-400">Navegação para o restaurante</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Ligações Telefônicas</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">1.480</div>
                  <div className="text-[10px] text-zinc-400">Direcionadas para WhatsApp</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Avaliação Média</span>
                  <div className="text-lg font-black font-mono text-amber-400">4.9 / 5.0</div>
                  <div className="text-[10px] text-emerald-500 font-bold">920 avaliações verificadas</div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 8. PAINEL WHATSAPP BUSINESS API                                   */}
          {/* ================================================================= */}
          {canalAtivo === "whatsapp" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[var(--ink)]">WhatsApp Business Cloud API &amp; Zumi Copilot</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Atendimento Instantâneo 4.2s
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Central Omnichannel da Holding · Atendimento do Sushi, Loja de Roupas e Reservas B2B
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toast.success("Disparo de Aniversariantes do Mês agendado para 48 clientes VIP!");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Aniversariantes</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Contatos Ativos</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">14.800</div>
                  <div className="text-[10px] text-green-500 font-bold">100% opt-in verificado</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Taxa de Abertura</span>
                  <div className="text-lg font-black font-mono text-emerald-400">96.4%</div>
                  <div className="text-[10px] text-zinc-400">Leitura em menos de 10 min</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Tempo Médio Resposta</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">4.2 segundos</div>
                  <div className="text-[10px] text-indigo-400 font-bold">Atendimento IA Zumi</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">Vendas WhatsApp (30D)</span>
                  <div className="text-lg font-black font-mono text-[var(--ink)]">R$ 142.500</div>
                  <div className="text-[10px] text-emerald-400 font-bold">Delivery + Roupas Condicional</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-ABA 3: SINERGIAS CRUZADAS & LTV DO GRUPO                         */}
      {/* ===================================================================== */}
      {subAbaConsolidada === "sinergias" && (
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">
                Ecossistema Sinérgico: Como os 3 Negócios se Alimentam Mutuamente
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                O valor da Holding reside no cliente que consome sushi na sexta-feira, veste a roupa da boutique no sábado e fecha contrato agro na segunda-feira.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-black">
              LTV +42% quando compra em 2+ lojas
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-2xl">🥢 ➡️ 👗</span>
              <strong className="text-xs font-bold text-[var(--ink)] block">Gastronomia para Moda</strong>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Cada cliente que gasta mais de R$ 200 no restaurante ganha R$ 30 em bônus para compras na loja de roupas, aumentando a taxa de visitação da loja física em 28%.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-2xl">👗 ➡️ 🥢</span>
              <strong className="text-xs font-bold text-[var(--ink)] block">Moda para Gastronomia</strong>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Compras de looks de festa na loja de roupas acompanham taça de espumante cortesia ou sobremesa no Zuma Restaurante para o jantar de comemoração.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-2xl">🌾 ➡️ 🥢👗</span>
              <strong className="text-xs font-bold text-[var(--ink)] block">Agro B2B para o Ecossistema</strong>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Contratos corporativos de grandes tradings e fazendas utilizam o salão VIP para reuniões e adquirem camisas executivas e brindes na loja de roupas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE SIMULAÇÃO DE CAMPANHA CRUZADA                                */}
      {/* ===================================================================== */}
      {modalSimuladorAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-[var(--ink)]">
                  Disparar Campanha Cruzada da Holding
                </h3>
              </div>
              <button
                onClick={() => setModalSimuladorAberto(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <strong className="text-purple-300 font-bold block text-xs">
                  Estratégia: Combo Sexta Vip (Sushi + Look)
                </strong>
                <p className="text-[11px] text-purple-200">
                  Público-alvo: 4.820 clientes VIP com gasto recorrente &gt; R$ 300 nos últimos 60 dias em Tangará da Serra.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-[var(--ink)] block text-xs">
                  Canais de Disparo Sincronizados:
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instagram Stories (@zuma)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Meta Ads (Feed &amp; Reels)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>WhatsApp VIP Broadcast</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>TikTok Spark Ads</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface2)] font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Orçamento Estimado:</span>
                  <strong className="text-[var(--ink)]">R$ 450,00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Retorno Previsto (ROAS 5.4x):</span>
                  <strong className="text-emerald-400">R$ 2.430,00</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalSimuladorAberto(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={campanhaExecutando}
                onClick={executarSimulacaoCampanha}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {campanhaExecutando ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sincronizando Mídia...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Confirmar &amp; Disparar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
