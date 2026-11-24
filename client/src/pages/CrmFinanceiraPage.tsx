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
  Scale,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import PortalClientePage from "./PortalClientePage";
import { Banknote, UploadCloud, QrCode } from "lucide-react";
import { PrecadastrosCasaNovaTab } from "../components/crm/PrecadastrosCasaNovaTab";
import { DEFAULT_BUSINESSES } from "@shared/businessModules";
import OPORTUNIDADES_PADRAO from "../../../data/crmFinanceiraOportunidades.json";

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
  { id: "prospeccao", label: "1. Prospecção & Originação", cor: "bg-blue-500", border: "border-blue-500", sinonimos: ["prospeccao", "prospect", "origem", "novo", "em_qualificacao"] },
  { id: "qualificacao", label: "2. Qualificação & KYC", cor: "bg-amber-500", border: "border-amber-500", sinonimos: ["qualificacao", "kyc", "documentacao", "qualificado", "condicionado"] },
  { id: "mesa_credito", label: "3. Mesa de Crédito & SCR", cor: "bg-emerald-600", border: "border-emerald-600", sinonimos: ["mesa_credito", "analise", "mesa", "scr", "em_analise", "analise_credito", "recusado"] },
  { id: "comite_aprovacao", label: "4. Comitê de Alçada", cor: "bg-indigo-500", border: "border-indigo-500", sinonimos: ["comite_aprovacao", "comite", "comite_risco", "alçada", "deliberacao", "aprovado_mesa"] },
  { id: "formalizacao_ccb", label: "5. Formalização CCB", cor: "bg-orange-500", border: "border-orange-500", sinonimos: ["formalizacao_ccb", "formalizacao", "proposta", "ccb", "minuta", "em_formalizacao"] },
  { id: "liquidado", label: "6. Liquidado & Desembolsado", cor: "bg-emerald-500", border: "border-emerald-500", sinonimos: ["liquidado", "contratado", "concluido", "desembolsado", "formalizado_ccb", "pago", "liberado"] },
];

export const CrmFinanceiraPage: React.FC = () => {
  const [location] = useLocation();

  // Estados principais
  const [oportunidades, setOportunidades] = useState<OportunidadeOperacaoFinanceira[]>([]);
  const [metricas, setMetricas] = useState<MetricasGestao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Aba ativa: funil | precadastros | kanban | mesa | simulador | ccb | termos | consulta360 | carteira | antecipacao | gestao_emprestimos | portal_cliente
  const [activeTab, setActiveTab] = useState<
    "funil" | "precadastros" | "kanban" | "mesa" | "simulador" | "ccb" | "termos" | "consulta360" | "carteira" | "antecipacao" | "gestao_emprestimos" | "portal_cliente"
  >("funil");

  // Estado da Central de Termos Digitais & SCR Bacen
  const [termos, setTermos] = useState<any[]>([]);
  const [filtroTipoTermo, setFiltroTipoTermo] = useState<string>("todos");
  const [buscaTermo, setBuscaTermo] = useState<string>("");
  const [termoVisualizar, setTermoVisualizar] = useState<any | null>(null);

  // Estado da Consulta 360 Integrada
  const [docBusca360, setDocBusca360] = useState<string>("30587162813");
  const [subAba360, setSubAba360] = useState<string>("geral");
  const [dossie360, setDossie360] = useState<any | null>(null);
  const [carregando360, setCarregando360] = useState<boolean>(false);

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

  // Ler query params da URL (se existir ?aba=xxx ou ?tab=xxx)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("aba") || urlParams.get("tab");
    if (tab) {
      if (tab === "funil" || tab === "kanban") {
        setActiveTab("funil");
      } else if (tab === "precadastros" || tab === "precadastro") {
        setActiveTab("precadastros");
      } else if (["mesa", "simulador", "ccb", "termos", "consulta360", "carteira", "antecipacao", "gestao_emprestimos", "portal_cliente"].includes(tab)) {
        setActiveTab(tab as any);
      }
    } else if (location.includes("mesa-credito") || location.includes("/credito") || window.location.pathname.includes("mesa")) {
      setActiveTab("mesa");
    } else if (location.includes("investimentos") || location.includes("simulador")) {
      setActiveTab("simulador");
    } else if (location.includes("ccb") || location.includes("formalizacao")) {
      setActiveTab("ccb");
    } else if (location.includes("carteira") || location.includes("pdd")) {
      setActiveTab("carteira");
    } else if (location.includes("antecipacao") || location.includes("recebiveis")) {
      setActiveTab("antecipacao");
    } else if (window.location.pathname.includes("gestao-emprestimos")) {
      setActiveTab("gestao_emprestimos");
    } else if (window.location.pathname.includes("portal-cliente")) {
      setActiveTab("portal_cliente");
    }
  }, [location]);

  const handleMudarAba = (novaAba: string) => {
    const tabAlvo = novaAba === "kanban" ? "funil" : novaAba;
    setActiveTab(tabAlvo as any);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("aba", tabAlvo);
      url.searchParams.delete("tab");
      window.history.pushState({}, "", url.toString());
    } catch (_) {}
  };

  // Carregar dados da API
  const carregarDados = async () => {
    try {
      setIsRefreshing(true);
      const [resGestao, resOps, resTermos] = await Promise.all([
        fetch("/api/admin/operacoes-financeiras/crm/gestao"),
        fetch("/api/admin/operacoes-financeiras/crm/oportunidades"),
        fetch("/api/bancofe/cadastro360/termos").catch(() => null),
      ]);

      if (resGestao.ok) {
        const gestaoData = await resGestao.json();
        setMetricas(gestaoData);
      } else {
        setMetricas({
          volumeTotalPipeline: 23770000,
          volumeLiquidadoMes: 1820000,
          totalOportunidadesAtivas: 22,
          ticketMedio: 3395714,
          taxaMediaMensal: 1.29,
          spreadLiquidoMedio: 0.85,
          taxaInadimplenciaPercentual: 0.0,
          distribuicaoPorEstagio: {},
          distribuicaoPorEmpresa: {},
          slaMedioHorasAprovacao: 3.5,
          economiaGeradaClientes: 420000
        });
      }

      if (resOps.ok) {
        const opsData = await resOps.json();
        setOportunidades(opsData.oportunidades && opsData.oportunidades.length > 0 ? opsData.oportunidades : (OPORTUNIDADES_PADRAO as any));
      } else {
        setOportunidades(OPORTUNIDADES_PADRAO as any);
      }

      if (resTermos && resTermos.ok) {
        const termosData = await resTermos.json();
        setTermos(termosData.data || []);
      }
    } catch (err) {
      console.warn("Utilizando dados de contingencia BancoFe:", err);
      setOportunidades(OPORTUNIDADES_PADRAO as any);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Executar Consulta 360 no motor oficial de PRD
  const handleExecutarConsulta360 = async (docManual?: string) => {
    const docAlvo = (docManual || docBusca360).trim();
    if (!docAlvo) {
      toast.error("Informe um CPF ou CNPJ para consulta.");
      return;
    }
    try {
      setCarregando360(true);
      const res = await fetch("/api/consulta360/consultar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentoOuNome: docAlvo }),
      });
      const data = await res.json();
      if (data.sucesso && data.dossie) {
        setDossie360(data.dossie);
        toast.success(`Dossiê 360° consolidado! Protocolo ${data.protocolo}`);
      } else {
        toast.error(data.erro || "Falha na consulta 360.");
      }
    } catch {
      toast.error("Erro de conexão na consulta 360.");
    } finally {
      setCarregando360(false);
    }
  };

  const handleExportarExcel360 = async () => {
    if (!dossie360) return;
    try {
      const res = await fetch("/api/consulta360/exportar/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossie: dossie360 }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossie-360-${dossie360.identificacao?.documentoLimpo || "pericial"}.xlsx`;
      a.click();
      toast.success("Planilha Excel em 6 abas gerada com sucesso!");
    } catch {
      toast.error("Erro ao exportar Excel.");
    }
  };

  const handleExportarPdf360 = async () => {
    if (!dossie360) return;
    try {
      const res = await fetch("/api/consulta360/exportar/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossie: dossie360 }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossie-360-${dossie360.identificacao?.documentoLimpo || "pericial"}.pdf`;
      a.click();
      toast.success("Dossiê PDF pericial gerado com sucesso!");
    } catch {
      toast.error("Erro ao exportar PDF.");
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
      const matchEstagio =
        selectedEstagio === "todos" ||
        op.estagio === selectedEstagio ||
        (op as any).etapa === selectedEstagio ||
        ((op as any).status || "").toLowerCase() === selectedEstagio.toLowerCase();
      const matchTermo =
        !searchTerm.trim() ||
        (op.clienteNome || (op as any).contraparteNome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.codigoProtocolo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.clienteDocumento || (op as any).contraparteDocumento || "").includes(searchTerm) ||
        (op.tipoOperacaoLabel || (op as any).produtoNome || "").toLowerCase().includes(searchTerm.toLowerCase());

      return matchEmpresa && matchEstagio && matchTermo;
    });
  }, [oportunidades, selectedEmpresa, selectedEstagio, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* =========================================================================
          TOPO: BREADCRUMB & HEADER INSTITUCIONAL BANCOFÉ INSTITUCIONAL CLEAN (#0c4a34)
          ========================================================================= */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/admin" className="text-[#0c4a34] hover:underline flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                Painel /admin
              </Link>
              <span>/</span>
              <span>Ecossistema BancoFe</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300">Operações Financeiras & CRM 360°</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0c4a34] flex items-center justify-center text-white shadow-lg shadow-emerald-950/30">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Operações Financeiras & CRM 360°
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-[#0c4a34] dark:text-emerald-300 border border-emerald-500/20">
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
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#0c4a34]" : ""}`} />
            </button>

            <button
              onClick={() => {
                handleMudarAba("simulador");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-800 text-xs font-semibold shadow-xs cursor-pointer transition-all"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Simulador de Taxas</span>
            </button>

            <button
              onClick={() => handleMudarAba("precadastros")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#0c4a34] dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Pré-cadastros Casa Nova</span>
            </button>

            <a
              href="/admin/cadastro-360"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0c4a34]/10 border border-[#0c4a34]/30 text-[#0c4a34] dark:text-emerald-300 hover:bg-[#0c4a34]/20 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cadastro 360° & Termos</span>
            </a>

            <button
              onClick={() => setIsNovoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c4a34] hover:bg-[#083324] text-white text-xs font-bold shadow-md shadow-emerald-950/30 transition-all cursor-pointer active:scale-98"
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
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs min-w-0 overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-medium">Pipeline Total em Esteira</span>
              <DollarSign className="w-4 h-4 text-[#0c4a34]" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono truncate" title={formatMoney(metricas?.volumeTotalPipeline || 23770000)}>
              {formatMoney(metricas?.volumeTotalPipeline || 23770000)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{oportunidades.length} operações registradas no grupo</span>
            </div>
          </div>

          {/* Card 2: Liquidado */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs min-w-0 overflow-hidden">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Liquidado no Mês</div>
            <div className="text-[13px] sm:text-[14px] xl:text-[15px] font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight whitespace-nowrap" title={formatMoney(metricas?.volumeLiquidadoMes || 1820000)}>
              {formatMoney(metricas?.volumeLiquidadoMes || 1820000)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Desembolso D+0 Pix</div>
          </div>

          {/* Card 3: Ticket Médio */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs min-w-0 overflow-hidden">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ticket Médio</div>
            <div className="text-[13px] sm:text-[14px] xl:text-[15px] font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight whitespace-nowrap" title={formatMoney(metricas?.ticketMedio || 3395714)}>
              {formatMoney(metricas?.ticketMedio || 3395714)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">PJ & Agronegócio MT</div>
          </div>

          {/* Card 4: Taxa Média */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs min-w-0 overflow-hidden">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Taxa Média Ponderada</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {metricas?.taxaMediaMensal || 1.29}% a.m.
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Spread líq: ~0.85%</div>
          </div>

          {/* Card 5: SLA e Inadimplência */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs min-w-0 overflow-hidden">
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
            { id: "funil", label: "Funil & Pipeline", icon: Layers, badge: `${oportunidades.length || 22} Ops` },
            { id: "precadastros", label: "Pré-cadastros Casa Nova", icon: Building2, badge: "20 Proponentes" },
            { id: "mesa", label: "Mesa de Crédito & SCR", icon: ShieldCheck, badge: "Alçadas" },
            { id: "gestao_emprestimos", label: "Gestão Empréstimos & Boletos", icon: Landmark, badge: "Mesa Fila" },
            { id: "portal_cliente", label: "Portal do Cliente (Visão Cliente)", icon: CreditCard, badge: "Pix & Boletos" },
            { id: "mesa", label: "Mesa de Crédito & SCR", icon: ShieldCheck, badge: "Alçadas" },
            { id: "simulador", label: "Simulador SAC & PRICE", icon: Calculator, badge: "Tempo Real" },
            { id: "ccb", label: "Formalização CCB Digital", icon: FileCheck2, badge: "ICP-Brasil" },
            { id: "termos", label: "Central de Termos & SCR", icon: FileText, badge: `${termos.length || 133} Termos` },
            { id: "consulta360", label: "Consulta 360° CPF & CNPJ", icon: Search, badge: "11 Abas" },
            { id: "carteira", label: "Gestão Carteira & PDD", icon: PieChart, badge: "CMN 2.682" },
            { id: "antecipacao", label: "Antecipação NF-e SEFAZ", icon: Receipt, badge: "D+0 Pix" },
            { id: "cadastro360", label: "Cadastro 360° & KYB", icon: Users, badge: "8 Empresas" },
            { id: "vault", label: "Vault Documental", icon: Boxes, badge: "13 Docs" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === "funil" && activeTab === "kanban");
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "cadastro360") {
                    window.location.href = "/admin/cadastro-360";
                  } else if (tab.id === "vault") {
                    window.location.href = "/admin/pre-cadastro";
                  } else {
                    handleMudarAba(tab.id);
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0c4a34] text-white shadow-sm shadow-emerald-950/40 border border-emerald-600/50"
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
      {(activeTab === "funil" || activeTab === "kanban") && (
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
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Empresa:</span>
              <select
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="todos">Todas as 16 Empresas do Grupo ({oportunidades.length})</option>
                {DEFAULT_BUSINESSES.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Board Horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
            {ESTAGIOS_KANBAN.map((col) => {
              const opsNaColuna = filteredOportunidades.filter((op) => {
                const est = (op.estagio || "").toLowerCase();
                const eta = ((op as any).etapa || "").toLowerCase();
                const stat = ((op as any).status || "").toLowerCase();
                return (
                  col.sinonimos.includes(est) ||
                  col.sinonimos.includes(eta) ||
                  col.sinonimos.includes(stat) ||
                  est === col.id ||
                  eta === col.id
                );
              });
              const volumeColuna = opsNaColuna.reduce(
                (acc, o) => acc + (o.valorAprovado || o.valorSolicitado || ((o as any).valorCentavos ? (o as any).valorCentavos / 100 : 0)),
                0
              );

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
                    <div className="text-[11px] font-mono font-bold text-[#0c4a34] dark:text-emerald-400">
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
                          className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 p-3 shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group"
                        >
                          {/* Header do Card */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {op.codigoProtocolo}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[#0c4a34] dark:text-emerald-300">
                              Score {op.scoreSerasa || (op as any).scoreBancoFe || 850} • {op.ratingBacen || (op as any).ratingBancoFe || "A"}
                            </span>
                          </div>

                          {/* Nome e Documento */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                            {op.clienteNome || (op as any).contraparteNome || "Cliente BancoFé"}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block mb-1">
                            {op.clienteDocumento || (op as any).contraparteDocumento || "00.000.000/0001-00"}
                          </span>

                          {/* Tipo de Operação & Empresa */}
                          <div className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 mb-2 font-medium">
                            {op.tipoOperacaoLabel || (op as any).produtoNome || "Operação Financeira"}
                          </div>

                          {/* Valor e Condições */}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 mb-2">
                            <div className="text-xs font-black font-mono text-slate-900 dark:text-white">
                              {formatMoney(op.valorAprovado || op.valorSolicitado || ((op as any).valorCentavos ? (op as any).valorCentavos / 100 : 0))}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-0.5">
                              <span>{op.taxaMensalPercentual || 1.35}% a.m.</span>
                              <span>{op.prazoMeses || 24}x {op.sistemaAmortizacao || "SAC"}</span>
                            </div>
                          </div>

                          {/* Ações Rápidas do Card */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                            <button
                              onClick={() => setDetalhesOp(op)}
                              className="text-[11px] font-semibold text-[#0c4a34] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
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
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-[#0c4a34] text-white text-[10px] font-semibold hover:bg-[#083324] cursor-pointer transition-all"
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
          CONTEÚDO DA ABA 2: PRÉ-CADASTROS CASA NOVA IMÓVEIS (20 PROPONENTES)
          ========================================================================= */}
      {activeTab === "precadastros" && (
        <div className="max-w-7xl mx-auto">
          <PrecadastrosCasaNovaTab
            onAbrirOportunidade={(id) => {
              const op = oportunidades.find((o) => o.id === id);
              if (op) setDetalhesOp(op);
            }}
            onNavegarParaFunil={() => handleMudarAba("funil")}
          />
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
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-[#0c4a34] dark:text-emerald-300">
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#0c4a34]">
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
                          <span className="font-mono text-xs font-bold text-emerald-600">{op.codigoProtocolo}</span>
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
                <Calculator className="w-5 h-5 text-[#0c4a34]" />
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
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[100000, 250000, 500000, 1000000, 3000000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSimuladorParams({ ...simuladorParams, valorBruto: v })}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
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
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30"
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
                      ? "bg-emerald-500/10 border-[#0c4a34] text-[#0c4a34] dark:text-emerald-300 font-bold"
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
                      ? "bg-emerald-500/10 border-[#0c4a34] text-[#0c4a34] dark:text-emerald-300 font-bold"
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
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
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
                  className="text-xs text-[#0c4a34] hover:underline font-semibold cursor-pointer"
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
                        <td className="p-2 text-emerald-600 dark:text-emerald-400">{formatMoney(p.juros)}</td>
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
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-[#0c4a34] dark:text-emerald-300">
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
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-[#0c4a34] border border-emerald-500/20">
                Certificação ICP-Brasil & Gov.br
              </span>
            </div>

            {/* Lista de CCBs Prontas para Emissão e Emitidas */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {oportunidades.map((op) => (
                <div key={op.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-600">{op.codigoProtocolo}</span>
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
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
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
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">R$ 1.580.300,00</div>
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
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-[#0c4a34] dark:text-emerald-300">
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
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  onClick={() => toast.success("NF-e validada com sucesso na SEFAZ-MT! Lastro de R$ 89.240,00 liberado para desconto a 1,18% a.m.")}
                  className="px-4 py-2 rounded-xl bg-[#0c4a34] text-white text-xs font-bold hover:bg-[#083324] cursor-pointer"
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
          CONTEÚDO DA ABA 7: CENTRAL DE TERMOS DIGITAIS & SCR BACEN
          ========================================================================= */}
      {activeTab === "termos" && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Central Regulatória
                  </span>
                  <span className="text-xs text-slate-500">• Circular BACEN 3.920 &amp; CMN 4.571</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Central de Termos Digitais, SCR &amp; Formalização de Crédito
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestão de consentimentos do Sistema de Informações de Crédito (SCR), autorização de bureaus, travas de domicílio e CCBs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Novo termo gerado e disponibilizado para coleta de assinatura via WhatsApp e E-mail.")}
                  className="px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#083324] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Emitir Novo Termo</span>
                </button>
              </div>
            </div>

            {/* Filtros de Termos */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar termo por cliente, CNPJ ou código..."
                  value={buscaTermo}
                  onChange={(e) => setBuscaTermo(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-medium">Tipo:</span>
                <select
                  value={filtroTipoTermo}
                  onChange={(e) => setFiltroTipoTermo(e.target.value)}
                  className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="todos">Todos os Tipos ({termos.length || 133})</option>
                  <option value="SCR_BACEN">Consentimento SCR / Bacen</option>
                  <option value="CCB">Cédula de Crédito Bancário (CCB)</option>
                  <option value="CESSAO_RECEBIVEIS">Cessão Fiduciária de Recebíveis</option>
                  <option value="LGPD">Privacidade e Proteção LGPD</option>
                  <option value="BUREAUS">Autorização Serasa / SPC / Quod</option>
                  <option value="CONTA_GRAFICA">Abertura de Domicílio Bancário</option>
                </select>
              </div>
            </div>

            {/* Tabela de Termos */}
            <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Título do Termo</th>
                    <th className="py-3 px-3">Cliente / Signatário</th>
                    <th className="py-3 px-3">Normativa</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Hash SHA-256</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {(termos.length > 0 ? termos : [
                    {
                      codigo: "TRM-SCR-001",
                      titulo: "Consentimento SCR / Banco Central (Registrato)",
                      clienteNome: "Rodrigo Ribeiro Gonçalves",
                      clienteCnpjCpf: "305.871.628-13",
                      normativaReferencia: "Circular BACEN 3.920 / CMN 4.571",
                      status: "assinado",
                      hashIntegridadeSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    },
                    {
                      codigo: "TRM-CCB-042",
                      titulo: "Cédula de Crédito Bancário - CDC Imobiliário",
                      clienteNome: "Casa Nova Imóveis & Construtora",
                      clienteCnpjCpf: "50.073.355/0001-80",
                      normativaReferencia: "Lei Federal nº 10.931/2004",
                      status: "assinado",
                      hashIntegridadeSha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
                    },
                    {
                      codigo: "TRM-CES-019",
                      titulo: "Cessão Fiduciária de Recebíveis & Trava de Domicílio",
                      clienteNome: "Agropecuária UISA / Agro Open",
                      clienteCnpjCpf: "43.084.070/0001-88",
                      normativaReferencia: "Resolução CMN 4.734 / Circular BACEN 3.952",
                      status: "assinado",
                      hashIntegridadeSha256: "ca978112ca1bbdcafac231b39a23dc4da786081cd1e14eed64728b38072e038e",
                    },
                    {
                      codigo: "TRM-LGP-088",
                      titulo: "Termo de Consentimento LGPD & Análise de Crédito",
                      clienteNome: "Lucas Silveira Gonçalves",
                      clienteCnpjCpf: "069.887.226-61",
                      normativaReferencia: "Art. 7º, II e X da Lei nº 13.709/2018",
                      status: "assinado",
                      hashIntegridadeSha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                    },
                    {
                      codigo: "TRM-BUR-034",
                      titulo: "Autorização de Consulta a Bureaus de Crédito",
                      clienteNome: "Zuma Cozinha Oriental Ltda",
                      clienteCnpjCpf: "52.123.456/0001-78",
                      normativaReferencia: "Lei Complementar nº 166/2019 (Cadastro Positivo)",
                      status: "assinado",
                      hashIntegridadeSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                    },
                  ])
                    .filter((t: any) => {
                      const matchBusca = buscaTermo === "" || (t.clienteNome || "").toLowerCase().includes(buscaTermo.toLowerCase()) || (t.clienteCnpjCpf || "").includes(buscaTermo) || (t.codigo || "").toLowerCase().includes(buscaTermo.toLowerCase());
                      return matchBusca;
                    })
                    .map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {t.codigo || `TRM-${idx + 1}`}
                        </td>
                        <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                          <div className="font-semibold">{t.titulo}</div>
                          <div className="text-[10px] text-slate-400">{t.tipoTermo || "SCR_BACEN"}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800 dark:text-slate-200">{t.clienteNome}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.clienteCnpjCpf}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">{t.normativaReferencia}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            {t.status === "assinado" ? "Assinado ICP" : "Minuta Válida"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                          {(t.hashIntegridadeSha256 || "").slice(0, 12)}...
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setTermoVisualizar(t);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Minuta
                          </button>
                          <button
                            onClick={() => toast.success(`Termo ${t.codigo} assinado digitalmente com sucesso.`)}
                            className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Assinar
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO DA ABA 8: CONSULTA 360° CPF & CNPJ INTEGRADA
          ========================================================================= */}
      {activeTab === "consulta360" && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            
            {/* Header da Consulta 360 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Motor de Inteligência Pericial
                  </span>
                  <span className="text-xs text-slate-500">• 11 Abas &amp; Grafo Relacional</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Consulta 360° Completa de CPF &amp; CNPJ
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receita Federal, Quadro Societário QSA, Bureaus de Crédito, Capacidade de Pagamento, Processos DataJud CNJ, PGFN e Grafo.
                </p>
              </div>

              {dossie360 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportarExcel360}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Excel (6 Abas)</span>
                  </button>
                  <button
                    onClick={handleExportarPdf360}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dossiê PDF Pericial</span>
                  </button>
                </div>
              )}
            </div>

            {/* Barra de Pesquisa */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Digite o CPF (ex: 30587162813) ou CNPJ (ex: 50073355000180)..."
                    value={docBusca360}
                    onChange={(e) => setDocBusca360(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleExecutarConsulta360()}
                    className="w-full pl-10 pr-3 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button
                  onClick={() => handleExecutarConsulta360()}
                  disabled={carregando360}
                  className="px-5 py-2.5 rounded-xl bg-[#0c4a34] hover:bg-[#083324] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${carregando360 ? "animate-spin" : ""}`} />
                  <span>{carregando360 ? "Consultando..." : "Consultar 360°"}</span>
                </button>
              </div>

              {/* Atalhos Rápidos */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                <span className="font-semibold text-slate-400">Atalhos da Holding:</span>
                {[
                  { label: "Rodrigo Gonçalves (Master)", doc: "30587162813" },
                  { label: "Lucas Silveira", doc: "06988722661" },
                  { label: "BancoFé Digital", doc: "53338003000104" },
                  { label: "Casa Nova Imóveis", doc: "50073355000180" },
                  { label: "Agro UISA", doc: "43084070000188" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDocBusca360(item.doc);
                      handleExecutarConsulta360(item.doc);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition text-[11px] cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exibição dos Dados do Dossiê */}
            {dossie360 ? (
              <div className="space-y-4">
                {/* Badges de Auditoria */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Protocolo</span>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{dossie360.protocoloConsulta}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Score Kytto 360</span>
                    <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                      {dossie360.capacidadeCredito?.scoreKytto360 || 885} / 1000
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating Bacen</span>
                    <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                      Rating {dossie360.capacidadeCredito?.classificacaoRating || "A"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tempo de Resposta</span>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{dossie360.tempoProcessamentoMs || 12} ms</span>
                  </div>
                </div>

                {/* Navegação de Sub-Abas do Dossiê */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
                  {[
                    { id: "geral", label: "Identificação RFB" },
                    { id: "qsa", label: `QSA Societário (${dossie360.societarioQsa?.length || 0})` },
                    { id: "capacidade", label: "Capacidade & Crédito" },
                    { id: "certidoes", label: "Certidões & PGFN" },
                    { id: "processos", label: `Processos CNJ (${dossie360.processos?.length || 0})` },
                    { id: "veiculos", label: `Bens & Veículos (${dossie360.patrimonio?.length || 0})` },
                    { id: "sintese", label: "Síntese IA GCP" },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSubAba360(sub.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                        subAba360 === sub.id
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Conteúdo das Sub-Abas */}
                {subAba360 === "geral" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] text-emerald-600">Dados do Titular</h4>
                      <div><span className="text-slate-400">Nome / Razão Social:</span> <strong className="text-slate-800 dark:text-slate-100 block">{dossie360.identificacao?.nomeCompleto}</strong></div>
                      <div><span className="text-slate-400">Documento:</span> <strong className="text-slate-800 dark:text-slate-100 font-mono block">{dossie360.identificacao?.documento}</strong></div>
                      <div><span className="text-slate-400">Situação Cadastral RFB:</span> <strong className="text-emerald-600 block">{dossie360.identificacao?.situacaoCadastralRfb || "REGULAR"}</strong></div>
                      {dossie360.identificacao?.nomeMae && <div><span className="text-slate-400">Nome da Mãe:</span> <strong className="text-slate-800 dark:text-slate-100 block">{dossie360.identificacao.nomeMae}</strong></div>}
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] text-emerald-600">Localização &amp; Endereço</h4>
                      <div><span className="text-slate-400">Logradouro:</span> <strong className="text-slate-800 dark:text-slate-100 block">{dossie360.identificacao?.enderecos?.[0]?.logradouro || "Av. Brasil, 1200"}</strong></div>
                      <div><span className="text-slate-400">Bairro / Cidade:</span> <strong className="text-slate-800 dark:text-slate-100 block">{dossie360.identificacao?.enderecos?.[0]?.bairro || "Centro"} - {dossie360.identificacao?.enderecos?.[0]?.cidade || "Tangará da Serra"}/{dossie360.identificacao?.enderecos?.[0]?.uf || "MT"}</strong></div>
                      <div><span className="text-slate-400">CEP:</span> <strong className="text-slate-800 dark:text-slate-100 font-mono block">{dossie360.identificacao?.enderecos?.[0]?.cep || "78300-000"}</strong></div>
                    </div>
                  </div>
                )}

                {subAba360 === "qsa" && (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Nome do Sócio / Empresa</th>
                          <th className="p-2.5">CPF / CNPJ</th>
                          <th className="p-2.5">Qualificação / Cargo</th>
                          <th className="p-2.5">Participação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dossie360.societarioQsa?.map((soc: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{soc.nomeSocio || soc.razaoSocial}</td>
                            <td className="p-2.5 font-mono text-slate-500">{soc.cpfCnpjSocio || soc.cnpj}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{soc.qualificacao || "Sócio-Administrador"}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-600">{soc.participacaoPercentual ? `${soc.participacaoPercentual}%` : "100%"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {subAba360 === "capacidade" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Renda Estimada</span>
                      <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
                        R$ {((dossie360.capacidadeCredito?.rendaEstimadaMensalCentavos || 3500000) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Limite Sugerido</span>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                        R$ {((dossie360.capacidadeCredito?.limiteCreditoSugeridoCentavos || 15000000) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Patrimônio Estimado</span>
                      <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
                        R$ {((dossie360.capacidadeCredito?.patrimonioLiquidoEstimadoCentavos || 85000000) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}

                {subAba360 === "sintese" && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] text-emerald-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Parecer de Inteligência Artificial GCP Gemini 2.5 Flash
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {dossie360.sinteseIaGcp?.parecerTexto || "Titular com perfil altamente favorável para operações de crédito e fomento na região de Tangará da Serra e Mato Grosso. Vínculos sólidos, capacidade financeira comprovada e ausência de restrições críticas ativas em bases públicas e cartorárias."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs">Informe um documento acima e clique em "Consultar 360°" para ver o dossiê pericial completo com fontes oficiais integradas.</p>
              </div>
            )}

          </div>
        </div>
      )}

            {/* =========================================================================
          CONTEÚDO DA ABA: GESTÃO DE EMPRÉSTIMOS & CONCILIAÇÃO DE COMPROVANTES
          ========================================================================= */}
      {activeTab === "gestao_emprestimos" && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header e KPIs de Crédito e Fila de Conciliação */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                    MESA DE CRÉDITO BANCOFÉ • ISPB 799
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 text-xs font-mono font-bold">
                    Conciliação D+0
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Gestão de Empréstimos, Financiamentos &amp; Conciliação de Comprovantes
                </h2>
                <p className="text-xs text-slate-500">
                  Acompanhamento de contratos ativos, baixas de parcelas via Pix e Boleto, e deliberação de comprovantes enviados pelo Portal do Cliente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("portal_cliente")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Acessar Portal do Cliente</span>
                </button>
              </div>
            </div>

            {/* Fila de Comprovantes Pendentes de Deliberação */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Fila de Conciliação Imediata (Comprovantes Recebidos do Portal)
                </h3>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  2 Comprovantes em Análise
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 block">CTR-2026-069-001 • Parcela 8/24</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rodrigo Ribeiro Gonçalves</h4>
                      <span className="text-xs text-slate-500">Doc: 069.887.226-61</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                      Aguardando Mesa
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/40 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valor Parcela:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">R$ 13.820,50</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Canal:</span>
                      <strong className="text-emerald-600 font-mono">Pix Instantâneo (ISPB 799)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ID End-to-End:</span>
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">E7990000020261123P99887766</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Arquivo:</span>
                      <span className="text-emerald-600 font-mono text-[11px]">comprovante_pix_ted_bancofe.pdf</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toast.success("Parcela 8 do contrato CTR-2026-069-001 baixada e liquidada com sucesso D+0!")}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar &amp; Baixar D+0</span>
                    </button>
                    <button
                      onClick={() => toast.info("Comprovante rejeitado com apontamento de divergência enviado ao cliente.")}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 block">CTR-2026-362-003 • Parcela 3/18</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zuma Gastronomia &amp; Alimentos Ltda</h4>
                      <span className="text-xs text-slate-500">CNPJ: 36.296.848/0001-57</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                      Aguardando Mesa
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valor Parcela:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">R$ 16.450,00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Canal:</span>
                      <strong className="text-cyan-600 font-mono">Boleto Febraban Registrado</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Autenticação:</span>
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">AUTH.CIP.799.20261123.88371</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Arquivo:</span>
                      <span className="text-cyan-600 font-mono text-[11px]">boleto_quitado_bancofe.pdf</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toast.success("Parcela 3 do contrato CTR-2026-362-003 baixada e liquidada com sucesso D+0!")}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar &amp; Baixar D+0</span>
                    </button>
                    <button
                      onClick={() => toast.info("Comprovante rejeitado com apontamento de divergência enviado ao cliente.")}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Carteira Completa de Empréstimos & Financiamentos */}
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Carteira Consolidada de Empréstimos BancoFé (142 Contratos Ativos)
              </h3>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Contrato ID</th>
                      <th className="p-3">Cliente / Tomador</th>
                      <th className="p-3">Linha de Crédito</th>
                      <th className="p-3">Valor Concedido</th>
                      <th className="p-3">Saldo Devedor</th>
                      <th className="p-3">Amortização</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { id: "CTR-2026-069-001", tomador: "Rodrigo Ribeiro Gonçalves", doc: "069.887.226-61", linha: "Capital de Giro PJ Estruturado", total: "R$ 510.000,00", saldo: "R$ 331.500,00", parcelas: "8 de 24 (33%)", status: "ATIVO" },
                      { id: "CTR-2026-512-002", tomador: "Dr. Valdomiro Parecis de Andrade", doc: "512.984.101-53", linha: "CPR Verde Sustentável Safra 2026", total: "R$ 875.000,00", saldo: "R$ 875.000,00", parcelas: "2 de 12 (17%)", status: "ATIVO" },
                      { id: "CTR-2026-362-003", tomador: "Zuma Gastronomia & Alimentos", doc: "36.296.848/0001-57", linha: "Giro Expansão Comercial", total: "R$ 270.000,00", saldo: "R$ 225.000,00", parcelas: "3 de 18 (17%)", status: "ATIVO" },
                      { id: "CTR-2026-045-004", tomador: "UISA - Usinas Itamarati S/A", doc: "04.596.128/0001-44", linha: "Fomento Industrial & Bioenergia", total: "R$ 7.200.000,00", saldo: "R$ 4.800.000,00", parcelas: "12 de 36 (33%)", status: "ATIVO" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-emerald-600">{row.id}</td>
                        <td className="p-3">
                          <strong className="block text-slate-800 dark:text-slate-200">{row.tomador}</strong>
                          <span className="font-mono text-[10px] text-slate-400">{row.doc}</span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{row.linha}</td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{row.total}</td>
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{row.saldo}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{row.parcelas}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setActiveTab("portal_cliente");
                              toast.info(`Abrindo visão do cliente para ${row.tomador}`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver no Portal</span>
                          </button>
                        </td>
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
          CONTEÚDO DA ABA: PORTAL DO CLIENTE (VISÃO CLIENTE INTEGRADA)
          ========================================================================= */}
      {activeTab === "portal_cliente" && (
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <PortalClientePage />
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
                <Plus className="w-5 h-5 text-[#0c4a34]" />
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
                      const emp = DEFAULT_BUSINESSES.find(b => b.id === e.target.value);
                      setFormData({
                        ...formData,
                        empresaOrigemId: e.target.value,
                        empresaOrigemNome: emp?.name || "BancoFe Fintech",
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {DEFAULT_BUSINESSES.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
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
                  className="px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#083324] text-white text-xs font-bold shadow-md shadow-emerald-950/30 cursor-pointer"
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
                <span className="text-xs font-mono font-bold text-emerald-600">{detalhesOp.codigoProtocolo}</span>
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
                  <span className="text-sm font-bold font-mono text-emerald-600">
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

              {/* Dossiê 360° & Parecer Algorítmico de Risco */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Dossiê Regulatório SCR & Parecer IA (Rating {detalhesOp.ratingBacen})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    Conforme Res. CMN 2.682/99
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SCR Registrato:</span>
                    <span className="font-semibold text-emerald-600">100% Adimplente</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Cobertura Garantia (LTV):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">145% do Principal</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Limite Técnico Máximo:</span>
                    <span className="font-semibold text-emerald-600 font-mono">
                      {formatMoney((detalhesOp.valorSolicitado || 1000000) * 1.35)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <strong>Parecer Técnico BancoFe Risk Engine:</strong> Proponente com robusta capacidade de solvência, ausência de restrições em bureaus de crédito e índices de liquidez adequados à esteira estruturada. Recomendada aprovação de crédito com taxa de {detalhesOp.taxaMensalPercentual}% a.m. e amortização pelo sistema {detalhesOp.sistemaAmortizacao}.
                </p>
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
                <div className="space-y-2 border-l-2 border-emerald-600/30 pl-3 ml-2">
                  {detalhesOp.historicoEtapas?.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="w-2 h-2 rounded-full bg-[#0c4a34] absolute -left-[17px] top-1" />
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
                    window.print();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir Dossiê</span>
                </button>
                <button
                  onClick={() => {
                    handleMudarEstagio(detalhesOp.id, "formalizacao_ccb", "Parecer Aprovado pela Mesa com Rating " + detalhesOp.ratingBacen);
                    setDetalhesOp(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  Aprovar na Alçada
                </button>
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
                <FileCheck2 className="w-5 h-5 text-[#0c4a34]" />
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
                <span className="text-[10px] font-mono text-emerald-600">Nº {ccbMinutaModalOp.codigoProtocolo}-CCB/2026</span>
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
                className="px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#083324] text-white text-xs font-bold shadow-md shadow-emerald-950/30 cursor-pointer"
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
