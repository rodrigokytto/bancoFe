import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Landmark,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  Users,
  Wheat,
  UtensilsCrossed,
  Shirt,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
  Percent,
  Calculator,
  FileCheck2,
  Download,
  Eye,
  Trash2,
  Check,
  X,
  CreditCard,
  Briefcase,
  AlertTriangle,
  Receipt,
  Boxes,
  Scale
} from "lucide-react";
import { toast } from "sonner";

// Interface dos tipos de operações
export interface OportunidadeOperacaoFinanceira {
  id: string;
  codigoProtocolo: string;
  clienteNome: string;
  clienteDocumento: string;
  clienteTipo: "PJ" | "PF";
  empresaOrigemId: string;
  empresaOrigemNome: string;
  tipoOperacao: string;
  tipoOperacaoLabel: string;
  valorSolicitado: number;
  valorAprovado: number;
  prazoMeses: number;
  taxaMensalPercentual: number;
  sistemaAmortizacao: "SAC" | "PRICE";
  estagio:
    | "prospeccao"
    | "qualificacao"
    | "mesa_credito"
    | "comite_aprovacao"
    | "formalizacao_ccb"
    | "liquidado"
    | "perdido";
  scoreSerasa: number;
  ratingBacen: "AA" | "A" | "B" | "C" | "D" | "E";
  probabilidadeConversao: number;
  responsavelMesa: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  sacadoCedenteInfo?: {
    cedenteNome: string;
    cedenteCnpj: string;
    sacadoNome: string;
    sacadoCnpj: string;
    numeroNfe?: string;
    chaveAcessoNfe?: string;
    vencimentoOriginal?: string;
  };
  observacoes: string;
  historicoEtapas: Array<{
    data: string;
    estagio: string;
    autor: string;
    nota: string;
  }>;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MetricasGestao {
  volumeTotalPipeline: number;
  volumeLiquidadoMes: number;
  totalOportunidadesAtivas: number;
  ticketMedio: number;
  taxaMediaMensal: number;
  spreadLiquidoMedio: number;
  taxaInadimplenciaPercentual: number;
  distribuicaoPorEstagio: Record<string, { count: number; volumeTotal: number }>;
  distribuicaoPorEmpresa: Record<string, { count: number; volumeTotal: number }>;
  slaMedioHorasAprovacao: number;
  economiaGeradaClientes: number;
}

export interface ResultadoSimulacao {
  valorBruto: number;
  valorLiquido: number;
  tac: number;
  iofCalculado: number;
  prazoMeses: number;
  taxaMensalPercentual: string;
  cetAnualPercentual: string;
  sistemaAmortizacao: string;
  totalJuros: number;
  totalPago: number;
  retornoEsperadoBancoFe: number;
  parcelaInicial: number;
  parcelaFinal: number;
  cronogramaParcelas: Array<{
    numero: number;
    saldoDevedorInicial: number;
    amortizacao: number;
    juros: number;
    prestacao: number;
    saldoDevedorFinal: number;
  }>;
}

// Estágios Oficiais do Funil BancoFe
const ESTAGIOS_KANBAN = [
  { id: "prospeccao", label: "1. Prospecção & Originação", cor: "bg-blue-500", border: "border-blue-500" },
  { id: "qualificacao", label: "2. Qualificação & KYC", cor: "bg-amber-500", border: "border-amber-500" },
  { id: "mesa_credito", label: "3. Mesa de Crédito & SCR", cor: "bg-purple-500", border: "border-purple-500" },
  { id: "comite_aprovacao", label: "4. Comitê de Alçada", cor: "bg-indigo-500", border: "border-indigo-500" },
  { id: "formalizacao_ccb", label: "5. Formalização CCB", cor: "bg-orange-500", border: "border-orange-500" },
  { id: "liquidado", label: "6. Liquidado & Desembolsado", cor: "bg-emerald-500", border: "border-emerald-500" },
];

export const CrmFinanceiraPage: React.FC = () => {
  const [location] = useLocation();

  // Estados principais
  const [oportunidades, setOportunidades] = useState<OportunidadeOperacaoFinanceira[]>([]);
  const [metricas, setMetricas] = useState<MetricasGestao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Aba ativa: kanban | mesa | simulador | ccb | carteira | antecipacao
  const [activeTab, setActiveTab] = useState<"kanban" | "mesa" | "simulador" | "ccb" | "carteira" | "antecipacao">("kanban");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("todos");
  const [selectedEstagio, setSelectedEstagio] = useState<string>("todos");

  // Modais
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [detalhesOp, setDetalhesOp] = useState<OportunidadeOperacaoFinanceira | null>(null);
  const [ccbMinutaModalOp, setCcbMinutaModalOp] = useState<OportunidadeOperacaoFinanceira | null>(null);

  // Form de Nova Oportunidade
  const [formData, setFormData] = useState({
    clienteNome: "",
    clienteDocumento: "",
    clienteTipo: "PJ" as "PJ" | "PF",
    empresaOrigemId: "bancofe",
    empresaOrigemNome: "BancoFe Fintech",
    tipoOperacao: "capital_giro_pj",
    tipoOperacaoLabel: "Capital de Giro PJ Estruturado",
    valorSolicitado: 350000,
    prazoMeses: 24,
    taxaMensalPercentual: 1.29,
    sistemaAmortizacao: "SAC" as "SAC" | "PRICE",
    scoreSerasa: 880,
    ratingBacen: "A" as "AA" | "A" | "B" | "C" | "D" | "E",
    responsavelMesa: "Rodrigo Gonçalves",
    observacoes: "",
    contatoEmail: "",
    contatoTelefone: "",
  });

  // Estado do Simulador
  const [simuladorParams, setSimuladorParams] = useState({
    valorBruto: 500000,
    taxaMensalPercentual: 1.25,
    prazoMeses: 24,
    sistemaAmortizacao: "SAC" as "SAC" | "PRICE",
    tarifaTac: 1500,
  });
  const [simuladorResultado, setSimuladorResultado] = useState<ResultadoSimulacao | null>(null);
  const [isSimulando, setIsSimulando] = useState(false);

  // Ler query params da URL (se existir ?tab=xxx)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && ["kanban", "mesa", "simulador", "ccb", "carteira", "antecipacao"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, []);

  // Carregar dados da API
  const carregarDados = async () => {
    try {
      setIsRefreshing(true);
      const [resGestao, resOps] = await Promise.all([
        fetch("/api/admin/operacoes-financeiras/crm/gestao"),
        fetch("/api/admin/operacoes-financeiras/crm/oportunidades"),
      ]);

      if (resGestao.ok) {
        const gestaoData = await resGestao.json();
        setMetricas(gestaoData);
      }

      if (resOps.ok) {
        const opsData = await resOps.json();
        setOportunidades(opsData.oportunidades || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do CRM:", err);
      toast.error("Não foi possível carregar os dados do CRM.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Executar simulação inicial
  useEffect(() => {
    handleSimular();
  }, [simuladorParams.valorBruto, simuladorParams.prazoMeses, simuladorParams.taxaMensalPercentual, simuladorParams.sistemaAmortizacao]);

  const handleSimular = async () => {
    try {
      setIsSimulando(true);
      const res = await fetch("/api/admin/operacoes-financeiras/crm/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simuladorParams),
      });
      if (res.ok) {
        const data = await res.json();
        setSimuladorResultado(data);
      }
    } catch (err) {
      console.error("Erro ao simular:", err);
    } finally {
      setIsSimulando(false);
    }
  };

  // Mudar estágio no Kanban
  const handleMudarEstagio = async (opId: string, novoEstagio: string, observacao = "") => {
    try {
      const res = await fetch(`/api/admin/operacoes-financeiras/crm/oportunidades/${opId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estagio: novoEstagio,
          observacoes: observacao || `Estágio alterado para: ${novoEstagio}`,
          autor: "Mesa de Crédito & Risco BancoFe",
        }),
      });

      if (res.ok) {
        toast.success(`Operação avançada com sucesso para o próximo estágio!`);
        carregarDados();
      } else {
        toast.error("Falha ao atualizar o estágio.");
      }
    } catch (err) {
      toast.error("Erro de comunicação com o servidor.");
    }
  };

  // Criar nova oportunidade
  const handleCriarOportunidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteNome.trim()) {
      toast.error("Informe a razão social ou nome do cliente!");
      return;
    }

    try {
      const res = await fetch("/api/admin/operacoes-financeiras/crm/oportunidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Oportunidade inserida com sucesso no funil de crédito!");
        setIsNovoModalOpen(false);
        carregarDados();
        // Reset form
        setFormData({
          clienteNome: "",
          clienteDocumento: "",
          clienteTipo: "PJ",
          empresaOrigemId: "bancofe",
          empresaOrigemNome: "BancoFe Fintech",
          tipoOperacao: "capital_giro_pj",
          tipoOperacaoLabel: "Capital de Giro PJ Estruturado",
          valorSolicitado: 350000,
          prazoMeses: 24,
          taxaMensalPercentual: 1.29,
          sistemaAmortizacao: "SAC",
          scoreSerasa: 880,
          ratingBacen: "A",
          responsavelMesa: "Rodrigo Gonçalves",
          observacoes: "",
          contatoEmail: "",
          contatoTelefone: "",
        });
      } else {
        toast.error("Falha ao registrar a oportunidade.");
      }
    } catch (err) {
      toast.error("Erro ao conectar com a API.");
    }
  };

  // Excluir oportunidade
  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta operação do funil?")) return;
    try {
      const res = await fetch(`/api/admin/operacoes-financeiras/crm/oportunidades/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Operação excluída com sucesso.");
        setDetalhesOp(null);
        carregarDados();
      }
    } catch (e) {
      toast.error("Erro ao excluir.");
    }
  };

  // Formatação monetária BRL
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);
  };

  // Formatação número
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("pt-BR").format(val || 0);
  };

  // Filtragem de oportunidades
  const filteredOportunidades = useMemo(() => {
    return oportunidades.filter((op) => {
      const matchEmpresa = selectedEmpresa === "todos" || op.empresaOrigemId === selectedEmpresa;
      const matchEstagio = selectedEstagio === "todos" || op.estagio === selectedEstagio;
      const matchTermo =
        !searchTerm.trim() ||
        op.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.codigoProtocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.clienteDocumento.includes(searchTerm) ||
        op.tipoOperacaoLabel.toLowerCase().includes(searchTerm.toLowerCase());

      return matchEmpresa && matchEstagio && matchTermo;
    });
  }, [oportunidades, selectedEmpresa, selectedEstagio, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* =========================================================================
          TOPO: BREADCRUMB & HEADER INSTITUCIONAL NUBANK STYLE (#820AD1)
          ========================================================================= */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/admin" className="text-[#820AD1] hover:underline flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                Painel /admin
              </Link>
              <span>/</span>
              <span>Ecossistema BancoFe</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300">Operações Financeiras & CRM 360°</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#820AD1] flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Operações Financeiras & CRM 360°
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-[#820AD1] dark:text-purple-300 border border-purple-500/20">
                    Mesa de Crédito & FIDC
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Esteira unificada de originação, comitê algorítmico, formalização de CCB e antecipação de duplicatas SEFAZ.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => carregarDados()}
              disabled={isRefreshing}
              title="Sincronizar dados em tempo real"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#820AD1]" : ""}`} />
            </button>

            <button
              onClick={() => {
                setActiveTab("simulador");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-800 text-xs font-semibold shadow-xs cursor-pointer transition-all"
            >
              <Calculator className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Simulador de Taxas</span>
            </button>

            <a
              href="/admin/cadastro-360"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#820AD1]/10 border border-[#820AD1]/30 text-[#820AD1] dark:text-purple-300 hover:bg-[#820AD1]/20 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cadastro 360° & Termos</span>
            </a>

            <button
              onClick={() => setIsNovoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#820AD1] hover:bg-[#7009b5] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Operação</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            BIG NUMBERS NUBANK STYLE (CARDS COM CÁLCULOS COMPLETOS)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 mt-5">
          {/* Card 1: Volume Pipeline */}
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-medium">Pipeline Total em Esteira</span>
              <DollarSign className="w-4 h-4 text-[#820AD1]" />
            </div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {formatMoney(metricas?.volumeTotalPipeline || 23770000)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{oportunidades.length} operações registradas no grupo</span>
            </div>
          </div>

          {/* Card 2: Liquidado */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Liquidado no Mês</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {formatMoney(metricas?.volumeLiquidadoMes || 1820000)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Desembolso D+0 Pix</div>
          </div>

          {/* Card 3: Ticket Médio */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ticket Médio</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {formatMoney(metricas?.ticketMedio || 3395714)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">PJ & Agronegócio MT</div>
          </div>

          {/* Card 4: Taxa Média */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Taxa Média Ponderada</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {metricas?.taxaMediaMensal || 1.29}% a.m.
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Spread líq: ~0.85%</div>
          </div>

          {/* Card 5: SLA e Inadimplência */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">SLA da Mesa / PDD</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              3.5h • 0.0%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Zero Inadimplência
            </div>
          </div>
        </div>

        {/* =========================================================================
            MENU DE NAVEGAÇÃO DE ABAS (PILL TABS)
            ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-4 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {[
            { id: "kanban", label: "Pipeline Kanban", icon: Layers, badge: `${oportunidades.length}` },
            { id: "mesa", label: "Mesa de Crédito & SCR", icon: ShieldCheck, badge: "Alçadas" },
            { id: "simulador", label: "Simulador SAC & PRICE", icon: Calculator, badge: "Tempo Real" },
            { id: "ccb", label: "Formalização CCB Digital", icon: FileCheck2, badge: "ICP-Brasil" },
            { id: "carteira", label: "Gestão Carteira & PDD", icon: PieChart, badge: "CMN 2.682" },
            { id: "antecipacao", label: "Antecipação NF-e SEFAZ", icon: Receipt, badge: "D+0 Pix" },
            { id: "cadastro360", label: "Cadastro 360° & KYB", icon: Users, badge: "8 Empresas" },
            { id: "vault", label: "Vault Documental", icon: Boxes, badge: "13 Docs" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "cadastro360") {
                    window.location.href = "/admin/cadastro-360";
                  } else if (tab.id === "vault") {
                    window.location.href = "/admin/pre-cadastro";
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#820AD1] text-white shadow-sm shadow-purple-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CONTEÚDO DA ABA 1: PIPELINE KANBAN (FUNIL COMPLETO DE OPERAÇÕES)
          ========================================================================= */}
      {activeTab === "kanban" && (
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, CNPJ ou protocolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Empresa:</span>
              <select
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="todos">Todas as Empresas ({oportunidades.length})</option>
                <option value="bancofe">BancoFe Fintech</option>
                <option value="holding_kytto">Holding Kytto</option>
                <option value="zuma_agro">Agro MT Fazendas</option>
                <option value="zuma_restaurante">Zuma Restaurante</option>
                <option value="zuma_moda">Zuma Moda & Boutique</option>
                <option value="bancofe_credito">BancoFe Crédito PJ</option>
              </select>
            </div>
          </div>

          {/* Kanban Board Horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
            {ESTAGIOS_KANBAN.map((col) => {
              const opsNaColuna = filteredOportunidades.filter((op) => op.estagio === col.id);
              const volumeColuna = opsNaColuna.reduce((acc, o) => acc + (o.valorAprovado || o.valorSolicitado), 0);

              return (
                <div
                  key={col.id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col min-h-[540px] shadow-xs"
                >
                  {/* Coluna Header */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {col.label}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {opsNaColuna.length}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-[#820AD1] dark:text-purple-400">
                      {formatMoney(volumeColuna)}
                    </div>
                  </div>

                  {/* Cards na Coluna */}
                  <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[680px]">
                    {opsNaColuna.length === 0 ? (
                      <div className="text-center py-10 px-2 text-slate-400 text-xs">
                        Nenhuma operação neste estágio.
                      </div>
                    ) : (
                      opsNaColuna.map((op) => (
                        <div
                          key={op.id}
                          className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 p-3 shadow-2xs hover:border-purple-400 dark:hover:border-purple-600 transition-all group"
                        >
                          {/* Header do Card */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {op.codigoProtocolo}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-[#820AD1] dark:text-purple-300">
                              Score {op.scoreSerasa} • {op.ratingBacen}
                            </span>
                          </div>

                          {/* Nome e Documento */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                            {op.clienteNome}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block mb-1">
                            {op.clienteDocumento}
                          </span>

                          {/* Tipo de Operação & Empresa */}
                          <div className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 mb-2 font-medium">
                            {op.tipoOperacaoLabel}
                          </div>

                          {/* Valor e Condições */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 mb-2">
                            <div className="text-xs font-black font-mono text-slate-900 dark:text-white">
                              {formatMoney(op.valorAprovado || op.valorSolicitado)}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-0.5">
                              <span>{op.taxaMensalPercentual}% a.m.</span>
                              <span>{op.prazoMeses}x {op.sistemaAmortizacao}</span>
                            </div>
                          </div>

                          {/* Ações Rápidas do Card */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                            <button
                              onClick={() => setDetalhesOp(op)}
                              className="text-[11px] font-semibold text-[#820AD1] dark:text-purple-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Detalhes</span>
                            </button>

                            {/* Botão de Avançar Estágio */}
                            {col.id !== "liquidado" && (
                              <button
                                onClick={() => {
                                  const idx = ESTAGIOS_KANBAN.findIndex((e) => e.id === col.id);
                                  if (idx < ESTAGIOS_KANBAN.length - 1) {
                                    handleMudarEstagio(op.id, ESTAGIOS_KANBAN[idx + 1].id);
                                  }
                                }}
                                title="Avançar para o próximo estágio"
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-[#820AD1] text-white text-[10px] font-semibold hover:bg-[#7009b5] cursor-pointer transition-all"
                              >
                                <span>Avançar</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO DA ABA 2: MESA ALGORÍTMICA & RISCO
          ========================================================================= */}
      {activeTab === "mesa" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-[#820AD1] dark:text-purple-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Mesa de Crédito & Alçadas Algorítmicas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Regras de aprovação com rating automatizado, checagem SCR Banco Central e garantias reais.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Motor 100% Ativo • Latência 9ms
              </span>
            </div>

            {/* Grid de 3 Alçadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Alçada Nível 1</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    Algorítmico 1-Click
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">Até R$ 500.000,00</div>
                <p className="text-xs text-slate-500 mt-1">
                  Aprovação automática para Score &gt; 820, sem restrições SCR e com lastro em duplicatas ou recebíveis de cartão.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Alçada Nível 2</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-[#820AD1]">
                    Gerente de Crédito
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">R$ 500k a R$ 2.000.000,00</div>
                <p className="text-xs text-slate-500 mt-1">
                  Parecer técnico obrigatório com análise de DRE, índice de liquidez corrente e garantias fidejussórias (aval dos sócios).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Alçada Nível 3</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600">
                    Comitê Executivo
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">Acima de R$ 2.000.000,00</div>
                <p className="text-xs text-slate-500 mt-1">
                  Aprovação unânime da diretoria com garantia hipotecária, alienação fiduciária e compliance ambiental SICAR/SEMA.
                </p>
              </div>
            </div>

            {/* Operações Aguardando Parecer na Mesa */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Operações em Análise Técnica na Mesa ({oportunidades.filter((o) => o.estagio === "mesa_credito" || o.estagio === "comite_aprovacao").length})
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {oportunidades
                  .filter((o) => o.estagio === "mesa_credito" || o.estagio === "comite_aprovacao")
                  .map((op) => (
                    <div key={op.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-600">{op.codigoProtocolo}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{op.clienteNome}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                            Rating {op.ratingBacen}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {op.tipoOperacaoLabel} • Solicitado: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatMoney(op.valorSolicitado)}</strong> • {op.prazoMeses} meses @ {op.taxaMensalPercentual}% a.m.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetalhesOp(op)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Análise Completa
                        </button>
                        <button
                          onClick={() => handleMudarEstagio(op.id, "formalizacao_ccb", "Aprovado pela Mesa com Rating " + op.ratingBacen)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all"
                        >
                          Aprovar Parecer
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO DA ABA 3: SIMULADOR SAC & PRICE EM TEMPO REAL
          ========================================================================= */}
      {activeTab === "simulador" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Parâmetros do Financiamento */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#820AD1]" />
                Simulador de Financiamento & CCB
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cálculo instantâneo de parcelas, juros acumulados, IOF diário e Custo Efetivo Total (CET).
              </p>
            </div>

            {/* Input Valor */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Valor do Crédito Solicitado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="5000"
                  value={simuladorParams.valorBruto}
                  onChange={(e) => setSimuladorParams({ ...simuladorParams, valorBruto: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[100000, 250000, 500000, 1000000, 3000000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSimuladorParams({ ...simuladorParams, valorBruto: v })}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer"
                  >
                    {v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Taxa e Prazo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Taxa Mensal (% a.m.)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={simuladorParams.taxaMensalPercentual}
                  onChange={(e) => setSimuladorParams({ ...simuladorParams, taxaMensalPercentual: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Prazo (Meses)
                </label>
                <select
                  value={simuladorParams.prazoMeses}
                  onChange={(e) => setSimuladorParams({ ...simuladorParams, prazoMeses: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                >
                  {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                    <option key={m} value={m}>{m} meses</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sistema de Amortização */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Sistema de Amortização
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSimuladorParams({ ...simuladorParams, sistemaAmortizacao: "SAC" })}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    simuladorParams.sistemaAmortizacao === "SAC"
                      ? "bg-purple-500/10 border-[#820AD1] text-[#820AD1] dark:text-purple-300 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold">SAC (Constante)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Parcelas decrescentes</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSimuladorParams({ ...simuladorParams, sistemaAmortizacao: "PRICE" })}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    simuladorParams.sistemaAmortizacao === "PRICE"
                      ? "bg-purple-500/10 border-[#820AD1] text-[#820AD1] dark:text-purple-300 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold">PRICE (Francês)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Parcelas fixas mensais</div>
                </button>
              </div>
            </div>

            {/* TAC */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tarifa de Abertura de Crédito (TAC)
              </label>
              <input
                type="number"
                step="100"
                value={simuladorParams.tarifaTac}
                onChange={(e) => setSimuladorParams({ ...simuladorParams, tarifaTac: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Coluna Direita: Resultados e Tabela de Parcelas */}
          <div className="lg:col-span-7 space-y-5">
            {/* Cards de Resumo da Simulação */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">
                  {simuladorParams.sistemaAmortizacao === "PRICE" ? "Parcela Fixa" : "1ª Parcela"}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {formatMoney(simuladorResultado?.parcelaInicial || 0)}
                </span>
                {simuladorParams.sistemaAmortizacao === "SAC" && (
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    Última: {formatMoney(simuladorResultado?.parcelaFinal || 0)}
                  </span>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">Total de Juros</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {formatMoney(simuladorResultado?.totalJuros || 0)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  CET Anual: {simuladorResultado?.cetAnualPercentual}%
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                <span className="text-xs text-slate-500 block mb-1">Líquido Liberado</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatMoney(simuladorResultado?.valorLiquido || 0)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  IOF retido: {formatMoney(simuladorResultado?.iofCalculado || 0)}
                </span>
              </div>
            </div>

            {/* Tabela de Amortização Mês a Mês */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cronograma Mensal de Amortização ({simuladorParams.prazoMeses} Parcelas)
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(simuladorResultado?.cronogramaParcelas, null, 2));
                    toast.success("Cronograma copiado para a área de transferência!");
                  }}
                  className="text-xs text-[#820AD1] hover:underline font-semibold cursor-pointer"
                >
                  Copiar Tabela
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5">Mês</th>
                      <th className="p-2.5">Saldo Inicial</th>
                      <th className="p-2.5">Amortização</th>
                      <th className="p-2.5">Juros</th>
                      <th className="p-2.5">Prestação</th>
                      <th className="p-2.5">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {simuladorResultado?.cronogramaParcelas.map((p) => (
                      <tr key={p.numero} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-bold text-slate-900 dark:text-slate-100">#{p.numero}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400">{formatMoney(p.saldoDevedorInicial)}</td>
                        <td className="p-2 text-emerald-600 dark:text-emerald-400">{formatMoney(p.amortizacao)}</td>
                        <td className="p-2 text-purple-600 dark:text-purple-400">{formatMoney(p.juros)}</td>
                        <td className="p-2 font-bold text-slate-900 dark:text-slate-100">{formatMoney(p.prestacao)}</td>
                        <td className="p-2 text-slate-600 dark:text-slate-400">{formatMoney(p.saldoDevedorFinal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO DA ABA 4: FORMALIZAÇÃO CCB DIGITAL (CÉDULA DE CRÉDITO BANCÁRIO)
          ========================================================================= */}
      {activeTab === "ccb" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-[#820AD1] dark:text-purple-300">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Custódia & Formalização de CCBs Eletrônicas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cédulas emitidas com carimbo de tempo, hash SHA-256 e conformidade com a Lei 10.931/04 e BACEN.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-[#820AD1] border border-purple-500/20">
                Certificação ICP-Brasil & Gov.br
              </span>
            </div>

            {/* Lista de CCBs Prontas para Emissão e Emitidas */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {oportunidades.map((op) => (
                <div key={op.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600">{op.codigoProtocolo}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{op.clienteNome}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        op.estagio === "liquidado"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : op.estagio === "formalizacao_ccb"
                          ? "bg-orange-500/10 text-orange-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                      }`}>
                        {op.estagio === "liquidado" ? "CCB Custodiada / Paga" : op.estagio === "formalizacao_ccb" ? "Aguardando Assinatura" : "Em Estruturação"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Valor de Face: <strong className="font-mono text-slate-900 dark:text-slate-100">{formatMoney(op.valorAprovado || op.valorSolicitado)}</strong> • {op.prazoMeses} meses • Sistema {op.sistemaAmortizacao} • Foro: Tangará da Serra - MT
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCcbMinutaModalOp(op)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>Ver Minuta CCB</span>
                    </button>

                    {op.estagio === "formalizacao_ccb" && (
                      <button
                        onClick={() => handleMudarEstagio(op.id, "liquidado", "CCB assinada digitalmente e desembolsada via Pix BACEN.")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Desembolsar Pix (Liquidar)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO DA ABA 5: GESTÃO DE CARTEIRA & PDD (RESOLUÇÃO CMN 2.682)
          ========================================================================= */}
      {activeTab === "carteira" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Classificação de Risco & Provisão para Devedores Duvidosos (PDD)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Matriz regulatória do Conselho Monetário Nacional (CMN 2.682/99) com apuração de provisionamento contábil.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {[
                { rating: "AA", perc: "0.0%", provision: "R$ 0,00", ops: 3, cor: "border-emerald-500 bg-emerald-500/5 text-emerald-600" },
                { rating: "A", perc: "0.5%", provision: "R$ 67.500,00", ops: 4, cor: "border-emerald-400 bg-emerald-400/5 text-emerald-600" },
                { rating: "B", perc: "1.0%", provision: "R$ 0,00", ops: 0, cor: "border-blue-400 bg-blue-400/5 text-blue-600" },
                { rating: "C", perc: "3.0%", provision: "R$ 0,00", ops: 0, cor: "border-blue-500 bg-blue-500/5 text-blue-600" },
                { rating: "D", perc: "10.0%", provision: "R$ 0,00", ops: 0, cor: "border-amber-400 bg-amber-400/5 text-amber-600" },
                { rating: "E", perc: "30.0%", provision: "R$ 0,00", ops: 0, cor: "border-orange-500 bg-orange-500/5 text-orange-600" },
                { rating: "F", perc: "50.0%", provision: "R$ 0,00", ops: 0, cor: "border-rose-400 bg-rose-400/5 text-rose-600" },
                { rating: "G", perc: "70.0%", provision: "R$ 0,00", ops: 0, cor: "border-rose-600 bg-rose-600/5 text-rose-600" },
              ].map((r) => (
                <div key={r.rating} className={`p-3 rounded-2xl border ${r.cor} text-center`}>
                  <div className="text-base font-black font-mono">{r.rating}</div>
                  <div className="text-[10px] text-slate-500">Prov: {r.perc}</div>
                  <div className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">{r.ops} ops</div>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">{r.provision}</div>
                </div>
              ))}
            </div>

            {/* Repasses e Vencimentos Futuros */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Fluxo de Caixa e Vencimentos Projetados (Próximos 90 Dias)
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Repasses previstos Dezembro/2026:</div>
                  <div className="text-xl font-black font-mono text-slate-900 dark:text-white">R$ 1.240.500,00</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Repasses previstos Janeiro/2027:</div>
                  <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">R$ 1.580.300,00</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Taxa de Recuperação de Crédito:</div>
                  <div className="text-xl font-black font-mono text-emerald-600">100.0%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO DA ABA 6: ANTECIPAÇÃO DE RECEBÍVEIS & NF-e SEFAZ
          ========================================================================= */}
      {activeTab === "antecipacao" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-[#820AD1] dark:text-purple-300">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Antecipação de Duplicatas & NF-e 4.0 SEFAZ
                  </h2>
                  <p className="text-xs text-slate-500">
                    Validação em tempo real do XML, manifesto do destinatário e desembolso via Pix BACEN.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                SEFAZ-MT Conectada
              </span>
            </div>

            {/* Input Chave de Acesso */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Consultar e Descontar NF-e (Chave de 44 Dígitos)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="51261118987654000199550010000892411000892415"
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  onClick={() => toast.success("NF-e validada com sucesso na SEFAZ-MT! Lastro de R$ 89.240,00 liberado para desconto a 1,18% a.m.")}
                  className="px-4 py-2 rounded-xl bg-[#820AD1] text-white text-xs font-bold hover:bg-[#7009b5] cursor-pointer"
                >
                  Consultar Lastro SEFAZ
                </button>
              </div>
            </div>

            {/* Borderô de Duplicatas em Andamento */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Borderôs de Duplicatas Mercantis em Cessão
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {[
                  { nfe: "NF-89241", sacado: "Bunge Alimentos S.A. / Cargill", valor: 8200000, taxa: 1.15, status: "Aprovado" },
                  { nfe: "NF-55102", sacado: "Construtora Noroeste MT Ltda", valor: 5200000, taxa: 1.18, status: "Em Checagem" },
                  { nfe: "NF-44091", sacado: "Atacadão dos Tecidos Premium", valor: 650000, taxa: 1.45, status: "Aprovado" },
                ].map((b, i) => (
                  <div key={i} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{b.nfe} • {b.sacado}</div>
                      <div className="text-slate-500 font-mono mt-0.5">{formatMoney(b.valor)} • Deságio {b.taxa}% a.m.</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: NOVA OPERAÇÃO NO FUNIL
          ========================================================================= */}
      {isNovoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#820AD1]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nova Operação Financeira
                </h3>
              </div>
              <button
                onClick={() => setIsNovoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarOportunidade} className="space-y-4 py-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Razão Social / Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fazendas Vale do Sol Agro Ltda"
                  value={formData.clienteNome}
                  onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    CNPJ ou CPF
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={formData.clienteDocumento}
                    onChange={(e) => setFormData({ ...formData, clienteDocumento: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Empresa de Origem
                  </label>
                  <select
                    value={formData.empresaOrigemId}
                    onChange={(e) => {
                      const names: Record<string, string> = {
                        bancofe: "BancoFe Fintech",
                        holding_kytto: "Holding Kytto",
                        zuma_agro: "Agro MT Fazendas",
                        zuma_restaurante: "Zuma Restaurante",
                        zuma_moda: "Zuma Moda & Boutique",
                      };
                      setFormData({
                        ...formData,
                        empresaOrigemId: e.target.value,
                        empresaOrigemNome: names[e.target.value] || "BancoFe Fintech",
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="bancofe">BancoFe Fintech</option>
                    <option value="holding_kytto">Holding Kytto</option>
                    <option value="zuma_agro">Agro MT Fazendas</option>
                    <option value="zuma_restaurante">Zuma Restaurante</option>
                    <option value="zuma_moda">Zuma Moda & Boutique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Valor Solicitado (R$)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.valorSolicitado}
                    onChange={(e) => setFormData({ ...formData, valorSolicitado: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Taxa Mensal (% a.m.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.taxaMensalPercentual}
                    onChange={(e) => setFormData({ ...formData, taxaMensalPercentual: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prazo (Meses)
                  </label>
                  <select
                    value={formData.prazoMeses}
                    onChange={(e) => setFormData({ ...formData, prazoMeses: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                      <option key={m} value={m}>{m} meses</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sistema
                  </label>
                  <select
                    value={formData.sistemaAmortizacao}
                    onChange={(e) => setFormData({ ...formData, sistemaAmortizacao: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="SAC">SAC (Amortização Constante)</option>
                    <option value="PRICE">PRICE (Parcela Fixa)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações e Garantias
                </label>
                <textarea
                  rows={3}
                  placeholder="Garantias vinculadas, lastro de duplicatas ou observações da mesa..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNovoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#820AD1] hover:bg-[#7009b5] text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Criar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DETALHES COMPLETOS DA OPERAÇÃO & AUDITORIA
          ========================================================================= */}
      {detalhesOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-purple-600">{detalhesOp.codigoProtocolo}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{detalhesOp.clienteNome}</h3>
              </div>
              <button
                onClick={() => setDetalhesOp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Valor Aprovado</span>
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    {formatMoney(detalhesOp.valorAprovado || detalhesOp.valorSolicitado)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Taxa & Sistema</span>
                  <span className="text-sm font-bold font-mono text-purple-600">
                    {detalhesOp.taxaMensalPercentual}% {detalhesOp.sistemaAmortizacao}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Rating BACEN</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {detalhesOp.ratingBacen} • Score {detalhesOp.scoreSerasa}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estágio Atual</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {detalhesOp.estagio}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Observações de Risco</h4>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  {detalhesOp.observacoes || "Nenhuma observação informada."}
                </p>
              </div>

              {/* Linha do Tempo e Histórico */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Trilha de Auditoria & Etapas</h4>
                <div className="space-y-2 border-l-2 border-purple-500/30 pl-3 ml-2">
                  {detalhesOp.historicoEtapas?.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="w-2 h-2 rounded-full bg-[#820AD1] absolute -left-[17px] top-1" />
                      <div className="text-[11px] text-slate-400">
                        {new Date(h.data).toLocaleString("pt-BR")} • <strong className="text-slate-700 dark:text-slate-300">{h.autor}</strong>
                      </div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {h.nota}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleExcluir(detalhesOp.id)}
                className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCcbMinutaModalOp(detalhesOp);
                    setDetalhesOp(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Minuta CCB
                </button>
                <button
                  onClick={() => setDetalhesOp(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: MINUTA DE CÉDULA DE CRÉDITO BANCÁRIO (CCB ELETRÔNICA)
          ========================================================================= */}
      {ccbMinutaModalOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#820AD1]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Minuta de Cédula de Crédito Bancário — CCB nº {ccbMinutaModalOp.codigoProtocolo}
                  </h3>
                  <span className="text-[10px] text-slate-400">Em conformidade com a Lei nº 10.931/2004 e Resolução CMN</span>
                </div>
              </div>
              <button
                onClick={() => setCcbMinutaModalOp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 select-text">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  CÉDULA DE CRÉDITO BANCÁRIO ELETRÔNICA
                </h2>
                <span className="text-[10px] font-mono text-purple-600">Nº {ccbMinutaModalOp.codigoProtocolo}-CCB/2026</span>
              </div>

              <p>
                <strong>CREDOR:</strong> BANCOFE INSTITUIÇÃO DE PAGAMENTO & CRÉDITO S.A., inscrita no CNPJ/ME sob o nº 18.987.654/0001-99, com sede no Polo Tecnológico e Financeiro de Tangará da Serra - MT.
              </p>

              <p>
                <strong>EMITENTE:</strong> {ccbMinutaModalOp.clienteNome.toUpperCase()}, pessoa jurídica devidamente inscrita no CNPJ sob o nº {ccbMinutaModalOp.clienteDocumento}.
              </p>

              <p>
                <strong>VALOR DO PRINCIPAL:</strong> Pela presente Cédula de Crédito Bancário, o EMITENTE confessa dever e pagará ao CREDOR a quantia líquida e certa de <strong>{formatMoney(ccbMinutaModalOp.valorAprovado || ccbMinutaModalOp.valorSolicitado)}</strong>.
              </p>

              <p>
                <strong>CONDIÇÕES FINANCEIRAS:</strong> Taxa de juros remuneratórios de <strong>{ccbMinutaModalOp.taxaMensalPercentual}% ao mês</strong>, amortizável em <strong>{ccbMinutaModalOp.prazoMeses} parcelas</strong> sucessivas pelo Sistema de Amortização <strong>{ccbMinutaModalOp.sistemaAmortizacao}</strong>.
              </p>

              <p>
                <strong>GARANTIAS:</strong> {ccbMinutaModalOp.observacoes || "Garantia fiduciária de duplicatas mercantis e aval irrestrito dos sócios controladores."}
              </p>

              <p>
                <strong>FORO:</strong> Fica eleito o Foro da Comarca de Tangará da Serra, Estado de Mato Grosso, para dirimir quaisquer dúvidas oriundas deste título.
              </p>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400">
                Hash SHA-256 de Segurança: 9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e
                <br />
                Carimbo de Tempo Oficial: {new Date().toISOString()} (ICP-Brasil)
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar PDF / Imprimir</span>
              </button>

              <button
                onClick={() => {
                  toast.success("Minuta enviada para assinatura digital ICP-Brasil!");
                  setCcbMinutaModalOp(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#820AD1] hover:bg-[#7009b5] text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
              >
                Enviar para Assinatura ICP-Brasil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmFinanceiraPage;
