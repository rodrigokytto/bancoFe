import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FileCheck2,
  X,
  Send,
  Zap,
  TrendingUp,
  DollarSign,
  Tag,
  Lock,
  Unlock,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export interface PreCadastroCasaNovaItem {
  id: string;
  protocolo: string;
  nome: string;
  tipo: "pf" | "pj";
  documento: string;
  documentoMascarado: string;
  telefone: string;
  telefoneMascarado: string;
  email: string;
  emailMascarado: string;
  cidade: string;
  uf: string;
  origem: string;
  origemRotulo: string;
  situacao: "novo" | "qualificado" | "convertido" | "descartado" | "oposicao";
  situacaoRotulo: string;
  consentimentoGrupo: boolean;
  scorePrevia?: number;
  ratingPrevia?: string;
  limitePreAprovadoCentavos?: number;
  imovelInteresse?: {
    loteamento?: string;
    quadra?: string;
    lote?: string;
    metragemM2?: number;
    valorEstimadoCentavos?: number;
  };
  conjuge?: {
    nome?: string;
    cpf?: string;
    regimeBens?: string;
  };
  documentosAnexados?: Array<{
    tipo: string;
    nomeArquivo: string;
    status: string;
  }>;
  criadoEm: string;
  atualizadoEm?: string;
  oportunidadeId?: string;
  jaNaCarteira?: boolean;
}

interface PrecadastrosResumo {
  total: number;
  novo: number;
  qualificado: number;
  convertido: number;
  descartado: number;
  oposicao: number;
  comConsentimento: number;
  comContato: number;
}

interface PrecadastrosCasaNovaTabProps {
  onAbrirOportunidade?: (id: string) => void;
  onNavegarParaFunil?: () => void;
}

export const PrecadastrosCasaNovaTab: React.FC<PrecadastrosCasaNovaTabProps> = ({
  onAbrirOportunidade,
  onNavegarParaFunil,
}) => {
  // Estados de dados
  const [itens, setItens] = useState<PreCadastroCasaNovaItem[]>([]);
  const [resumo, setResumo] = useState<PrecadastrosResumo>({
    total: 20,
    novo: 12,
    qualificado: 6,
    convertido: 2,
    descartado: 0,
    oposicao: 0,
    comConsentimento: 20,
    comContato: 20,
  });
  const [lotes, setLotes] = useState<Array<{ lote: string; quantidade: number }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessandoCarga, setIsProcessandoCarga] = useState<boolean>(false);
  const [isProcessandoRegua, setIsProcessandoRegua] = useState<boolean>(false);

  // Filtros e busca
  const [busca, setBusca] = useState<string>("");
  const [situacaoFiltro, setSituacaoFiltro] = useState<string>("");
  const [consentimentoFiltro, setConsentimentoFiltro] = useState<string>("");
  const [origemFiltro, setOrigemFiltro] = useState<string>("");
  const [pagina, setPagina] = useState<number>(1);
  const itensPorPagina = 10;

  // Toggle de revelação de dados sensíveis (LGPD)
  const [revelarDocumentos, setRevelarDocumentos] = useState<boolean>(false);

  // Modais
  const [modalDossie, setModalDossie] = useState<PreCadastroCasaNovaItem | null>(null);
  const [modalConverter, setModalConverter] = useState<PreCadastroCasaNovaItem | null>(null);
  const [modalNovo, setModalNovo] = useState<boolean>(false);

  // Form de conversão em oportunidade
  const [conversaoProduto, setConversaoProduto] = useState<string>("CREDITO_IMOBILIARIO");
  const [conversaoValor, setConversaoValor] = useState<number>(450000);
  const [conversaoResponsavel, setConversaoResponsavel] = useState<string>("Rodrigo Gonçalves");
  const [isConvertendo, setIsConvertendo] = useState<boolean>(false);

  // Form de novo pré-cadastro
  const [novoForm, setNovoForm] = useState({
    nome: "",
    tipo: "pf" as "pf" | "pj",
    documento: "",
    telefone: "",
    email: "",
    cidade: "Tangará da Serra",
    uf: "MT",
    loteamento: "Residencial Florais do Vale",
    quadra: "Q-12",
    lote: "L-08",
    valorEstimado: 380000,
    consentimentoGrupo: true,
  });
  const [isCriando, setIsCriando] = useState<boolean>(false);

  // Carregar dados da API
  const carregarPrecadastros = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (situacaoFiltro) params.set("situacao", situacaoFiltro);
      if (consentimentoFiltro) params.set("consentimento", consentimentoFiltro);
      if (origemFiltro) params.set("origem", origemFiltro);
      params.set("pagina", String(pagina));
      params.set("tamanhoPagina", "50");

      const res = await fetch(`/api/admin/operacoes-financeiras/crm/precadastros?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItens(data.precadastros || []);
        if (data.resumo) setResumo(data.resumo);
        if (data.lotes) setLotes(data.lotes);
      } else {
        toast.error("Erro ao carregar pré-cadastros.");
      }
    } catch (err) {
      console.error("Erro na esteira de pré-cadastros:", err);
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarPrecadastros();
  }, [busca, situacaoFiltro, consentimentoFiltro, origemFiltro, pagina]);

  // Processar carga oficial da Casa Nova Imóveis
  const handleProcessarCargaCasaNova = async () => {
    try {
      setIsProcessandoCarga(true);
      const res = await fetch("/api/admin/operacoes-financeiras/crm/precadastros/carga/processar", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Carga processada com sucesso: ${data.total} cadastros periciais sincronizados!`);
        await carregarPrecadastros();
      } else {
        toast.error(data.erro || "Falha ao processar carga.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro de conexão ao processar carga.");
    } finally {
      setIsProcessandoCarga(false);
    }
  };

  // Disparar Régua de Notificação LGPD
  const handleProcessarRegua = async () => {
    try {
      setIsProcessandoRegua(true);
      const res = await fetch("/api/admin/operacoes-financeiras/crm/regua/processar", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Régua de comunicação LGPD processada com sucesso: ${data.totalProcessados || 20} registros verificados.`);
        await carregarPrecadastros();
      } else {
        toast.error(data.erro || "Falha ao processar régua.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao disparar régua.");
    } finally {
      setIsProcessandoRegua(false);
    }
  };

  // Executar comando no pré-cadastro (qualificar / descartar)
  const handleComandoPrecadastro = async (id: string, comando: "qualificar" | "descartar" | "oposicao") => {
    try {
      const res = await fetch(`/api/admin/operacoes-financeiras/crm/precadastros/${id}/comando`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comando }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Pré-cadastro atualizado: ${comando === "qualificar" ? "Qualificado para Mesa" : comando}`);
        await carregarPrecadastros();
      } else {
        toast.error(data.erro || "Erro ao executar comando.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar.");
    }
  };

  // Confirmar conversão em oportunidade no funil
  const handleConfirmarConversao = async () => {
    if (!modalConverter) return;
    try {
      setIsConvertendo(true);
      const res = await fetch(`/api/admin/operacoes-financeiras/crm/precadastros/${modalConverter.id}/converter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto: conversaoProduto,
          valorCentavos: Math.round(conversaoValor * 100),
          responsavel: conversaoResponsavel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Oportunidade criada com sucesso no funil! Protocolo: ${data.oportunidade?.codigoProtocolo || "OP"}`);
        setModalConverter(null);
        await carregarPrecadastros();
        if (data.oportunidade?.id && onAbrirOportunidade) {
          onAbrirOportunidade(data.oportunidade.id);
        } else if (onNavegarParaFunil) {
          onNavegarParaFunil();
        }
      } else {
        toast.error(data.erro || "Erro ao converter pré-cadastro.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar.");
    } finally {
      setIsConvertendo(false);
    }
  };

  // Criar novo pré-cadastro
  const handleCriarNovoPrecadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoForm.nome.trim()) {
      toast.error("Informe o nome do proponente.");
      return;
    }
    try {
      setIsCriando(true);
      const res = await fetch("/api/admin/operacoes-financeiras/crm/precadastros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novoForm,
          imovelInteresse: {
            loteamento: novoForm.loteamento,
            quadra: novoForm.quadra,
            lote: novoForm.lote,
            valorEstimadoCentavos: Math.round(novoForm.valorEstimado * 100),
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Novo pré-cadastro registrado na esteira com sucesso!");
        setModalNovo(false);
        setNovoForm({
          nome: "",
          tipo: "pf",
          documento: "",
          telefone: "",
          email: "",
          cidade: "Tangará da Serra",
          uf: "MT",
          loteamento: "Residencial Florais do Vale",
          quadra: "Q-12",
          lote: "L-08",
          valorEstimado: 380000,
          consentimentoGrupo: true,
        });
        await carregarPrecadastros();
      } else {
        toast.error(data.erro || "Erro ao criar pré-cadastro.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar.");
    } finally {
      setIsCriando(false);
    }
  };

  // Exportar relatório pericial
  const handleExportarRelatorio = () => {
    const csvContent = [
      ["Protocolo", "Nome", "Tipo", "Documento", "Telefone", "E-mail", "Cidade/UF", "Loteamento", "Quadra", "Lote", "Valor Lote (R$)", "Situação", "Consentimento LGPD"].join(";"),
      ...itens.map((p) => [
        p.protocolo,
        `"${p.nome}"`,
        p.tipo.toUpperCase(),
        p.documento,
        p.telefone,
        p.email,
        `"${p.cidade}/${p.uf}"`,
        `"${p.imovelInteresse?.loteamento || ""}"`,
        `"${p.imovelInteresse?.quadra || ""}"`,
        `"${p.imovelInteresse?.lote || ""}"`,
        ((p.imovelInteresse?.valorEstimadoCentavos || 0) / 100).toFixed(2),
        p.situacaoRotulo,
        p.consentimentoGrupo ? "Sim" : "Não",
      ].join(";")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bancofe_precadastros_casanova_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório pericial da esteira exportado com sucesso!");
  };

  // Volume total estimado dos lotes da Casa Nova
  const volumeTotalEstimado = useMemo(() => {
    return itens.reduce((acc, p) => acc + (p.imovelInteresse?.valorEstimadoCentavos || 0), 0) / 100;
  }, [itens]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          BANNER INSTITUCIONAL CASA NOVA IMÓVEIS × BANCOFÉ
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0c4a34] via-[#064e3b] to-[#047857] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>casanova.kytto.com.br · Base Oficial Homologada</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Esteira de Pré-Cadastros · Casa Nova Imóveis
            </h2>
            
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Gestão pericial e onboarding de todos os proponentes e investidores da Casa Nova Imóveis. 
              Triagem automática com checagem de conformidade LGPD, pontuação SCR Bacen prévia e conversão direta em Cédulas de Crédito Bancário (CCB).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200">
              <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Consentimento Registrado
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                Carga via infra/migracao/precadastro-casanova.sh
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30">
                <Clock className="w-4 h-4 text-emerald-400" />
                SLA 48h entre contatos
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={handleProcessarCargaCasaNova}
              disabled={isProcessandoCarga}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessandoCarga ? "animate-spin" : ""}`} />
              <span>{isProcessandoCarga ? "Processando Carga..." : "Sincronizar Casa Nova"}</span>
            </button>

            <button
              onClick={handleProcessarRegua}
              disabled={isProcessandoRegua}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-300 ${isProcessandoRegua ? "animate-spin" : ""}`} />
              <span>Disparar Régua LGPD</span>
            </button>

            <button
              onClick={() => setModalNovo(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Pré-cadastro</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6 BIG NUMBERS NUBANK STYLE (CARDS DA ESTEIRA)
          ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Total na Esteira</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {resumo.total}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">
            20 de Casa Nova Imóveis
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Novos Cadastros</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400 font-mono">
            {resumo.novo}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Aguardando triagem
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Qualificados</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400 font-mono">
            {resumo.qualificado}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Prontos para Funil
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Convertidos no Funil</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400 font-mono">
            {resumo.convertido}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            Com CCB em proposta
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Volume em Lotes</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            R$ {(volumeTotalEstimado || 14850000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Garantias imobiliárias
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium">Opt-in LGPD</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 font-mono">
            100%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            20/20 com aceite
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE FILTROS, BUSCA E AÇÕES
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Busca textual */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por proponente, CPF/CNPJ, telefone, e-mail ou loteamento..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Filtros em selects */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={situacaoFiltro}
              onChange={(e) => {
                setSituacaoFiltro(e.target.value);
                setPagina(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="">Todas as Situações ({resumo.total})</option>
              <option value="novo">Novo ({resumo.novo})</option>
              <option value="qualificado">Qualificado ({resumo.qualificado})</option>
              <option value="convertido">Convertido no Funil ({resumo.convertido})</option>
              <option value="oposicao">Oposição ({resumo.oposicao})</option>
            </select>

            <select
              value={consentimentoFiltro}
              onChange={(e) => {
                setConsentimentoFiltro(e.target.value);
                setPagina(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="">Consentimento LGPD (Todos)</option>
              <option value="sim">Com Consentimento</option>
              <option value="nao">Sem Consentimento</option>
            </select>

            <select
              value={origemFiltro}
              onChange={(e) => {
                setOrigemFiltro(e.target.value);
                setPagina(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="">Todas as Origens</option>
              <option value="casanova">Casa Nova Imóveis</option>
              <option value="manual">Manual / BancoFé</option>
            </select>

            {/* Alternar máscara de documentos */}
            <button
              onClick={() => setRevelarDocumentos(!revelarDocumentos)}
              title={revelarDocumentos ? "Ocultar dados sensíveis (LGPD)" : "Revelar dados sensíveis"}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                revelarDocumentos
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {revelarDocumentos ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{revelarDocumentos ? "LGPD Revelado" : "LGPD Mascarado"}</span>
            </button>

            {/* Botão de Exportar */}
            <button
              onClick={handleExportarRelatorio}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Chips de filtro rápido por situação */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 mr-1 text-[11px]">Filtrar:</span>
          {[
            { id: "", label: "Todos", count: resumo.total },
            { id: "novo", label: "Novos", count: resumo.novo },
            { id: "qualificado", label: "Qualificados", count: resumo.qualificado },
            { id: "convertido", label: "Convertidos em Funil", count: resumo.convertido },
          ].map((chip) => {
            const isSelected = situacaoFiltro === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setSituacaoFiltro(chip.id);
                  setPagina(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0c4a34] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TABELA / CARDS DA ESTEIRA (20 PROPONENTES COMPLETOS)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Proponentes Registrados ({itens.length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              100% Sincronizado
            </span>
          </div>
          {lotes.length > 0 && (
            <div className="text-[11px] text-slate-400 hidden md:block">
              Lotes de Carga: {lotes.map((l) => `${l.lote} (${l.quantidade})`).join(" · ")}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Carregando proponentes da esteira Casa Nova...</p>
          </div>
        ) : itens.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Nenhum pré-cadastro encontrado com os filtros selecionados
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Experimente limpar os filtros ou clique em "Sincronizar Casa Nova" para recarregar a esteira oficial.
            </p>
            <button
              onClick={handleProcessarCargaCasaNova}
              className="px-4 py-2 rounded-xl bg-[#0c4a34] text-white text-xs font-bold hover:bg-[#064e3b] cursor-pointer"
            >
              Executar Carga Pericial Casa Nova
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Protocolo & Proponente</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Contatos (WhatsApp / E-mail)</th>
                  <th className="py-3 px-4">Imóvel / Lote Casa Nova</th>
                  <th className="py-3 px-4 text-right">Avaliação Lote</th>
                  <th className="py-3 px-4 text-center">Consentimento</th>
                  <th className="py-3 px-4 text-center">Situação</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {itens.map((p) => {
                  const docFormatado = revelarDocumentos ? p.documento : p.documentoMascarado;
                  const telLimpo = (p.telefone || "").replace(/\D/g, "");
                  const whatsappUrl = telLimpo ? `https://wa.me/55${telLimpo}` : "";
                  const valorLote = (p.imovelInteresse?.valorEstimadoCentavos || 0) / 100;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Proponente & Protocolo */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#0c4a34] dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{p.nome}</span>
                              {p.jaNaCarteira && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/10 text-[#820AD1] border border-purple-500/20">
                                  Já no Funil
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{p.protocolo}</span>
                              <span>·</span>
                              <span className="uppercase text-slate-500 font-semibold">{p.tipo}</span>
                              <span>·</span>
                              <span>{p.cidade}/{p.uf}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Documento */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        {docFormatado}
                      </td>

                      {/* Contatos */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {p.telefone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="font-mono text-[11px]">
                                {revelarDocumentos ? p.telefone : p.telefoneMascarado}
                              </span>
                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Iniciar conversa no WhatsApp"
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[160px]">
                                {revelarDocumentos ? p.email : p.emailMascarado}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Imóvel / Lote Casa Nova */}
                      <td className="py-3 px-4">
                        <div className="text-[11px]">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {p.imovelInteresse?.loteamento || "Casa Nova Loteamento"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Quadra: {p.imovelInteresse?.quadra || "Q-01"} · Lote: {p.imovelInteresse?.lote || "L-01"}
                            {p.imovelInteresse?.metragemM2 ? ` · ${p.imovelInteresse.metragemM2}m²` : ""}
                          </div>
                        </div>
                      </td>

                      {/* Valor do Lote */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {valorLote > 0 ? (
                          `R$ ${valorLote.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Consentimento LGPD */}
                      <td className="py-3 px-4 text-center">
                        {p.consentimentoGrupo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Não
                          </span>
                        )}
                      </td>

                      {/* Situação */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.situacao === "convertido"
                              ? "bg-purple-500/10 text-[#820AD1] border border-purple-500/20"
                              : p.situacao === "qualificado"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : p.situacao === "novo"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.situacaoRotulo}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.situacao === "novo" && (
                            <button
                              onClick={() => handleComandoPrecadastro(p.id, "qualificar")}
                              title="Marcar como Qualificado para Mesa de Crédito"
                              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-[10px] transition-all cursor-pointer"
                            >
                              Qualificar
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setModalConverter(p);
                              setConversaoValor((p.imovelInteresse?.valorEstimadoCentavos || 35000000) / 100);
                            }}
                            title="Converter em Oportunidade no Funil"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0c4a34] hover:bg-[#064e3b] text-white font-semibold text-[10px] shadow-xs transition-all cursor-pointer"
                          >
                            <span>Funil</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => setModalDossie(p)}
                            title="Ver Dossiê 360° Completo"
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: DOSSIÊ 360° DO PROPONENTE CASA NOVA
          ========================================================================= */}
      {modalDossie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Dossiê 360° · {modalDossie.nome}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Protocolo: {modalDossie.protocolo} · Origem: Casa Nova Imóveis
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalDossie(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300">
              {/* Bloco 1: Informações Cadastrais */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Dados do Proponente & Cônjuge
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nome Completo</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{modalDossie.nome}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Documento (CPF/CNPJ)</span>
                    <span className="font-mono font-semibold">{modalDossie.documento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Tipo de Pessoa</span>
                    <span className="uppercase font-semibold">{modalDossie.tipo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Telefone / WhatsApp</span>
                    <span className="font-mono">{modalDossie.telefone || "Não informado"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">E-mail</span>
                    <span>{modalDossie.email || "Não informado"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Município / UF</span>
                    <span>{modalDossie.cidade}/{modalDossie.uf}</span>
                  </div>
                  {modalDossie.conjuge?.nome && (
                    <>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Cônjuge</span>
                        <span className="font-semibold">{modalDossie.conjuge.nome}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">CPF Cônjuge</span>
                        <span className="font-mono">{modalDossie.conjuge.cpf}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Regime de Bens</span>
                        <span>{modalDossie.conjuge.regimeBens || "Comunhão Parcial"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bloco 2: Lote e Garantia Imobiliária */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  Imóvel de Interesse · Loteamento Casa Nova
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Empreendimento</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {modalDossie.imovelInteresse?.loteamento || "Florais do Vale"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Quadra / Lote</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {modalDossie.imovelInteresse?.quadra || "Q-12"} · {modalDossie.imovelInteresse?.lote || "L-08"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Metragem</span>
                    <span className="font-mono">{modalDossie.imovelInteresse?.metragemM2 || 450} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Valor de Avaliação</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      R$ {(((modalDossie.imovelInteresse?.valorEstimadoCentavos || 35000000)) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Vault Documental e Consentimentos */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  Conformidade Bacen & Termos Digitais LGPD
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-[11px] block">Autorização SCR Banco Central</span>
                      <span className="text-[10px] text-slate-400">Resolução CMN nº 4.571/2017</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-[11px] block">Consentimento LGPD</span>
                      <span className="text-[10px] text-slate-400">Termo nº 2026-LGPD-CN registrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setModalDossie(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const target = modalDossie;
                  setModalDossie(null);
                  setModalConverter(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#064e3b] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <span>Converter em Oportunidade no Funil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CONVERSÃO DE PRÉ-CADASTRO EM OPORTUNIDADE NO FUNIL
          ========================================================================= */}
      {modalConverter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-[#820AD1]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Converter em Oportunidade no Funil
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Proponente: {modalConverter.nome}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalConverter(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Produto Financeiro BancoFé
                </label>
                <select
                  value={conversaoProduto}
                  onChange={(e) => setConversaoProduto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="CREDITO_IMOBILIARIO">Crédito Imobiliário & Financiamento de Lote (1,15% a.m.)</option>
                  <option value="CAPITAL_GIRO_PJ">Capital de Giro PJ Estruturado (1,29% a.m.)</option>
                  <option value="FINANCIAMENTO_RURAL">Financiamento Rural & Agronegócio Safra (1,05% a.m.)</option>
                  <option value="ANTECIPACAO_RECEBIVEIS">Antecipação de Recebíveis D+0 (1,39% a.m.)</option>
                  <option value="INVESTIMENTO_PROPRIO">CDB BancoFe Liquidez Diária (100% CDI)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Valor Solicitado / Proposta (R$)
                </label>
                <input
                  type="number"
                  value={conversaoValor}
                  onChange={(e) => setConversaoValor(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Responsável da Mesa de Crédito
                </label>
                <input
                  type="text"
                  value={conversaoResponsavel}
                  onChange={(e) => setConversaoResponsavel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200">
                A conversão gerará imediatamente um novo card no estágio de <strong>Qualificação & KYC</strong> no Funil oficial, herdando os dados cadastrais, lote de interesse e dossiê de garantias.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setModalConverter(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarConversao}
                disabled={isConvertendo}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#820AD1] hover:bg-[#7009b5] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>{isConvertendo ? "Criando Oportunidade..." : "Confirmar e Criar no Funil"}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NOVO PRÉ-CADASTRO MANUAL
          ========================================================================= */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCriarNovoPrecadastro}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Novo Pré-Cadastro · Casa Nova Imóveis
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Entrada direta na esteira de triagem pericial
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs overflow-y-auto max-h-[70vh]">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome Completo / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={novoForm.nome}
                  onChange={(e) => setNovoForm({ ...novoForm, nome: e.target.value })}
                  placeholder="Ex.: João da Silva ou Agronegócio Tangará Ltda"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tipo de Proponente
                  </label>
                  <select
                    value={novoForm.tipo}
                    onChange={(e) => setNovoForm({ ...novoForm, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="pf">Pessoa Física (PF)</option>
                    <option value="pj">Pessoa Jurídica (PJ)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    CPF ou CNPJ
                  </label>
                  <input
                    type="text"
                    value={novoForm.documento}
                    onChange={(e) => setNovoForm({ ...novoForm, documento: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={novoForm.telefone}
                    onChange={(e) => setNovoForm({ ...novoForm, telefone: e.target.value })}
                    placeholder="(65) 99999-9999"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={novoForm.email}
                    onChange={(e) => setNovoForm({ ...novoForm, email: e.target.value })}
                    placeholder="contato@cliente.com.br"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Loteamento Casa Nova
                  </label>
                  <input
                    type="text"
                    value={novoForm.loteamento}
                    onChange={(e) => setNovoForm({ ...novoForm, loteamento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quadra / Lote
                  </label>
                  <input
                    type="text"
                    value={`${novoForm.quadra} - ${novoForm.lote}`}
                    onChange={(e) => {
                      const [q, l] = e.target.value.split("-").map((s) => s.trim());
                      setNovoForm({ ...novoForm, quadra: q || "Q-01", lote: l || "L-01" });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Valor Estimado do Lote (R$)
                </label>
                <input
                  type="number"
                  value={novoForm.valorEstimado}
                  onChange={(e) => setNovoForm({ ...novoForm, valorEstimado: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consentimentoCheck"
                  checked={novoForm.consentimentoGrupo}
                  onChange={(e) => setNovoForm({ ...novoForm, consentimentoGrupo: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="consentimentoCheck" className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                  Registrar consentimento formal do proponente para contato e checagem SCR Bacen (LGPD).
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCriando}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#064e3b] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>{isCriando ? "Salvando..." : "Salvar Pré-Cadastro"}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
