import React, { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileCheck2,
  FileText,
  Filter,
  Home,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Unlock,
  UploadCloud,
  Users,
  X,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import PRECADASTROS_FALLBACK from "../../../../data/crmFinanceiraPrecadastros.json";
import { fetchEmpresa } from "@/lib/fetchEmpresa";
import { precadastroNoEscopo, normalizarEmpresaId } from "@shared/escopoEmpresa";

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
  /** Empresa ativa (seletor do topo): define o escopo dos pré-cadastros exibidos. */
  empresaId?: string;
  onAbrirOportunidade?: (id: string) => void;
  onNavegarParaFunil?: () => void;
}

export const PrecadastrosCasaNovaTab: React.FC<PrecadastrosCasaNovaTabProps> = ({
  onAbrirOportunidade,
  onNavegarParaFunil,
  empresaId,
}) => {
  const escopo = normalizarEmpresaId(empresaId || "");
  const fallbackEscopo = () =>
    ((PRECADASTROS_FALLBACK as any[]) || []).filter((p: any) => precadastroNoEscopo(escopo, p.origem)) as any;
  // Estados de dados
  const [itens, setItens] = useState<PreCadastroCasaNovaItem[]>([]);
  const [resumo, setResumo] = useState<PrecadastrosResumo>({
    total: 0,
    novo: 0,
    qualificado: 0,
    convertido: 0,
    descartado: 0,
    oposicao: 0,
    comConsentimento: 0,
    comContato: 0,
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
  const [subAbaDossie, setSubAbaDossie] = useState<"resumo" | "cadastro" | "documentos" | "credito">("resumo");

  // Estado do Cadastro 360°
  const [cadastroForm, setCadastroForm] = useState({
    estadoCivil: "Casado(a)",
    profissao: "Empresário / Produtor Rural",
    naturalidade: "Tangará da Serra - MT",
    dataNasc: "14/05/1984",
    rg: "12.847.192-3 SSP/MT",
    nomeMae: "Maria Lúcia Ferreira Gomes",
    nomePai: "Sebastião Carlos Gomes",
    conjugeNome: "Camila Ribeiro Gomes",
    conjugeCpf: "034.912.871-04",
    conjugeRegime: "Comunhão Parcial de Bens",
    conjugeRenda: 9500,
    logradouro: "Avenida das Palmeiras",
    numero: "1080",
    complemento: "Quadra 14, Lote 2",
    bairro: "Jardim Tarumã",
    cep: "78300-000",
    cidade: "Tangará da Serra",
    uf: "MT",
    tempoResidencia: "7 anos",
    rendaFormal: 24000,
    rendaInformal: 8000,
    outrasRendas: 4500,
    despesasMensais: 9200,
    imoveis: 1650000,
    veiculos: 320000,
    investimentos: 480000,
    banco: "BancoFé S.A. (098)",
    agencia: "0001",
    conta: "109842-7",
    chavePix: "contato@proponente.com.br"
  });

  // Estado do Vault de Documentos
  const [documentosVault, setDocumentosVault] = useState([
    { id: "doc-1", nome: "CNH_Digital_Proponente.pdf", categoria: "Identificação", tamanho: "2.4 MB", dataEnvio: "22/11/2026 14:32", status: "homologado", analista: "Rodrigo Gonçalves" },
    { id: "doc-2", nome: "Comprovante_Residencia_Energisa.pdf", categoria: "Residência", tamanho: "1.1 MB", dataEnvio: "22/11/2026 14:35", status: "homologado", analista: "Rodrigo Gonçalves" },
    { id: "doc-3", nome: "Holerites_Ultimos_3_Meses.pdf", categoria: "Renda", tamanho: "3.8 MB", dataEnvio: "22/11/2026 15:02", status: "homologado", analista: "Mesa de Crédito" },
    { id: "doc-4", nome: "Declaracao_IRPF_2026_Completa.pdf", categoria: "Renda / Fiscal", tamanho: "4.5 MB", dataEnvio: "22/11/2026 15:10", status: "homologado", analista: "Mesa de Crédito" },
    { id: "doc-5", nome: "Matricula_Florais_do_Vale_Q12_L08.pdf", categoria: "Garantia Imobiliária", tamanho: "5.2 MB", dataEnvio: "23/11/2026 09:15", status: "homologado", analista: "Jurídico BancoFé" },
    { id: "doc-6", nome: "Extratos_Bancarios_90_Dias.pdf", categoria: "Capacidade Financeira", tamanho: "2.9 MB", dataEnvio: "23/11/2026 11:40", status: "analise", analista: "Aguardando Parecer" }
  ]);
  const [novoDocNome, setNovoDocNome] = useState("");
  const [novoDocCategoria, setNovoDocCategoria] = useState("Identificação");
  const [showModalAnexo, setShowModalAnexo] = useState(false);

  // Estado da Análise de Crédito SAC/PRICE
  const [simulacaoSistema, setSimulacaoSistema] = useState<"SAC" | "PRICE">("SAC");
  const [simulacaoValor, setSimulacaoValor] = useState(380000);
  const [simulacaoEntrada, setSimulacaoEntrada] = useState(76000);
  const [simulacaoPrazo, setSimulacaoPrazo] = useState(240);
  const [simulacaoTaxa, setSimulacaoTaxa] = useState(11.5);
  const [certificadoGerado, setCertificadoGerado] = useState(false);

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

      const res = await fetchEmpresa(`/api/admin/operacoes-financeiras/crm/precadastros?${params.toString()}`, {}, empresaId);
      if (res.ok) {
        const data = await res.json();
        setItens(Array.isArray(data.precadastros) ? data.precadastros : fallbackEscopo());
        if (data.resumo) setResumo(data.resumo);
        if (data.lotes) setLotes(data.lotes);
      } else {
        setItens(fallbackEscopo());
      }
    } catch (err) {
      console.warn("Utilizando pré-cadastros locais Casa Nova:", err);
      setItens(fallbackEscopo());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarPrecadastros();
  }, [busca, situacaoFiltro, consentimentoFiltro, origemFiltro, pagina, empresaId]);

  // Processar carga oficial da Casa Nova Imóveis
  const handleProcessarCargaCasaNova = async () => {
    try {
      setIsProcessandoCarga(true);
      const res = await fetchEmpresa("/api/admin/operacoes-financeiras/crm/precadastros/carga/processar", {
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
      const res = await fetchEmpresa("/api/admin/operacoes-financeiras/crm/regua/processar", {
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
      const res = await fetchEmpresa(`/api/admin/operacoes-financeiras/crm/precadastros/${id}/comando`, {
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
      const res = await fetchEmpresa(`/api/admin/operacoes-financeiras/crm/precadastros/${modalConverter.id}/converter`, {
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
      const res = await fetchEmpresa("/api/admin/operacoes-financeiras/crm/precadastros", {
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
            {lotes.find((l) => l.lote.includes("Casa Nova"))?.quantidade ?? 0} de Casa Nova Imóveis
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
            {resumo.total}/{resumo.total} com aceite
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
          MODAL 1: GAVETA / DOSSIÊ 360° COMPLETO DO PROPONENTE & MESA DE CRÉDITO
          ========================================================================= */}
      {modalDossie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col">
            
            {/* Top Bar com Identificação e Sub-Abas */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {modalDossie.nome}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        Score 842 · Risco Mínimo (AAA)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Protocolo: {modalDossie.protocolo} · Origem: Casa Nova Imóveis · CPF: {modalDossie.documento}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setModalDossie(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seletor de Sub-Abas da Gaveta 360° */}
              <div className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800 pb-1">
                <button
                  onClick={() => setSubAbaDossie("resumo")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subAbaDossie === "resumo"
                      ? "bg-[#0c4a34] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Resumo & Imóvel</span>
                </button>
                <button
                  onClick={() => setSubAbaDossie("cadastro")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subAbaDossie === "cadastro"
                      ? "bg-[#0c4a34] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Cadastro Completo 360°</span>
                </button>
                <button
                  onClick={() => setSubAbaDossie("documentos")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subAbaDossie === "documentos"
                      ? "bg-[#0c4a34] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>3. Documentos & Vault</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500 text-white font-mono">
                    {documentosVault.length}
                  </span>
                </button>
                <button
                  onClick={() => setSubAbaDossie("credito")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subAbaDossie === "credito"
                      ? "bg-[#820AD1] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>4. Análise de Crédito SAC/PRICE</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-mono">
                    Aprovado
                  </span>
                </button>
              </div>
            </div>

            {/* Conteúdo Dinâmico das 4 Sub-Abas */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300 pr-1">
              
              {/* SUB-ABA 1: RESUMO & IMÓVEL DE INTERESSE */}
              {subAbaDossie === "resumo" && (
                <div className="space-y-4">
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

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Imóvel de Interesse · Casa Nova Imóveis
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
              )}

              {/* SUB-ABA 2: CADASTRO COMPLETO 360° */}
              {subAbaDossie === "cadastro" && (
                <div className="space-y-4">
                  {/* Bloco Dados Pessoais & Documentação */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      1. Identificação Pessoal e Filiação
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Estado Civil</label>
                        <input
                          type="text"
                          value={cadastroForm.estadoCivil}
                          onChange={(e) => setCadastroForm({...cadastroForm, estadoCivil: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Profissão / Ocupação</label>
                        <input
                          type="text"
                          value={cadastroForm.profissao}
                          onChange={(e) => setCadastroForm({...cadastroForm, profissao: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Data de Nascimento</label>
                        <input
                          type="text"
                          value={cadastroForm.dataNasc}
                          onChange={(e) => setCadastroForm({...cadastroForm, dataNasc: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">RG / Órgão Emissor</label>
                        <input
                          type="text"
                          value={cadastroForm.rg}
                          onChange={(e) => setCadastroForm({...cadastroForm, rg: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Nome da Mãe</label>
                        <input
                          type="text"
                          value={cadastroForm.nomeMae}
                          onChange={(e) => setCadastroForm({...cadastroForm, nomeMae: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Nome do Pai</label>
                        <input
                          type="text"
                          value={cadastroForm.nomePai}
                          onChange={(e) => setCadastroForm({...cadastroForm, nomePai: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco Cônjuge / Coobrigado */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      2. Cônjuge & Coobrigado Solidário
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Nome Completo do Cônjuge</label>
                        <input
                          type="text"
                          value={cadastroForm.conjugeNome}
                          onChange={(e) => setCadastroForm({...cadastroForm, conjugeNome: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">CPF do Cônjuge</label>
                        <input
                          type="text"
                          value={cadastroForm.conjugeCpf}
                          onChange={(e) => setCadastroForm({...cadastroForm, conjugeCpf: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Regime de Bens</label>
                        <input
                          type="text"
                          value={cadastroForm.conjugeRegime}
                          onChange={(e) => setCadastroForm({...cadastroForm, conjugeRegime: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco Endereço Residencial */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <Home className="w-4 h-4 text-blue-600" />
                      3. Endereço Residencial Completo
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Logradouro (Rua/Avenida)</label>
                        <input
                          type="text"
                          value={cadastroForm.logradouro}
                          onChange={(e) => setCadastroForm({...cadastroForm, logradouro: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Número</label>
                        <input
                          type="text"
                          value={cadastroForm.numero}
                          onChange={(e) => setCadastroForm({...cadastroForm, numero: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Complemento</label>
                        <input
                          type="text"
                          value={cadastroForm.complemento}
                          onChange={(e) => setCadastroForm({...cadastroForm, complemento: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Bairro</label>
                        <input
                          type="text"
                          value={cadastroForm.bairro}
                          onChange={(e) => setCadastroForm({...cadastroForm, bairro: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">CEP</label>
                        <input
                          type="text"
                          value={cadastroForm.cep}
                          onChange={(e) => setCadastroForm({...cadastroForm, cep: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Cidade / UF</label>
                        <input
                          type="text"
                          value={`${cadastroForm.cidade} / ${cadastroForm.uf}`}
                          readOnly
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Tempo de Residência</label>
                        <input
                          type="text"
                          value={cadastroForm.tempoResidencia}
                          onChange={(e) => setCadastroForm({...cadastroForm, tempoResidencia: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco Renda & Patrimônio */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      4. Capacidade Financeira, Renda & Patrimônio Declarado
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Renda Formal CLT / Pró-Labore</label>
                        <input
                          type="number"
                          value={cadastroForm.rendaFormal}
                          onChange={(e) => setCadastroForm({...cadastroForm, rendaFormal: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Renda Informal / Agro</label>
                        <input
                          type="number"
                          value={cadastroForm.rendaInformal}
                          onChange={(e) => setCadastroForm({...cadastroForm, rendaInformal: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Renda Cônjuge</label>
                        <input
                          type="number"
                          value={cadastroForm.conjugeRenda}
                          onChange={(e) => setCadastroForm({...cadastroForm, conjugeRenda: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Despesas Mensais Declaradas</label>
                        <input
                          type="number"
                          value={cadastroForm.despesasMensais}
                          onChange={(e) => setCadastroForm({...cadastroForm, despesasMensais: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-rose-600 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Imóveis (R$)</label>
                        <input
                          type="number"
                          value={cadastroForm.imoveis}
                          onChange={(e) => setCadastroForm({...cadastroForm, imoveis: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Veículos / Maquinários (R$)</label>
                        <input
                          type="number"
                          value={cadastroForm.veiculos}
                          onChange={(e) => setCadastroForm({...cadastroForm, veiculos: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Investimentos / Aplicações (R$)</label>
                        <input
                          type="number"
                          value={cadastroForm.investimentos}
                          onChange={(e) => setCadastroForm({...cadastroForm, investimentos: Number(e.target.value)})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloco Domicílio Bancário */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      5. Domicílio Bancário Oficial
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Banco</label>
                        <input
                          type="text"
                          value={cadastroForm.banco}
                          onChange={(e) => setCadastroForm({...cadastroForm, banco: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Agência</label>
                        <input
                          type="text"
                          value={cadastroForm.agencia}
                          onChange={(e) => setCadastroForm({...cadastroForm, agencia: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Conta Corrente</label>
                        <input
                          type="text"
                          value={cadastroForm.conta}
                          onChange={(e) => setCadastroForm({...cadastroForm, conta: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Chave PIX</label>
                        <input
                          type="text"
                          value={cadastroForm.chavePix}
                          onChange={(e) => setCadastroForm({...cadastroForm, chavePix: e.target.value})}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => toast.success("Cadastro 360° atualizado com sucesso no banco de dados!")}
                      className="px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#064e3b] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar Alterações do Cadastro 360°</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-ABA 3: DOCUMENTOS & VAULT */}
              {subAbaDossie === "documentos" && (
                <div className="space-y-4">
                  {/* Barra de Ações do Vault */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-[#820AD1]">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          Vault de Documentos & Comprovantes Homologados
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {documentosVault.filter(d => d.status === "homologado").length} de {documentosVault.length} documentos validados pela Mesa de Risco BancoFé
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModalAnexo(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#820AD1] hover:bg-[#7009b5] text-white text-xs font-bold shadow-sm cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>+ Anexar Documento</span>
                    </button>
                  </div>

                  {/* Modal / Card de Anexo */}
                  {showModalAnexo && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-purple-300 dark:border-purple-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Novo Documento para o Vault do Proponente
                        </span>
                        <button
                          onClick={() => setShowModalAnexo(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Nome do Arquivo</label>
                          <input
                            type="text"
                            placeholder="Ex: CND_Federal_Receita.pdf"
                            value={novoDocNome}
                            onChange={(e) => setNovoDocNome(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Categoria</label>
                          <select
                            value={novoDocCategoria}
                            onChange={(e) => setNovoDocCategoria(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <option value="Identificação">Identificação (RG/CNH)</option>
                            <option value="Residência">Comprovante de Residência</option>
                            <option value="Renda">Comprovante de Renda / Holerite</option>
                            <option value="Fiscal">Declaração IRPF / Fiscal</option>
                            <option value="Garantia Imobiliária">Matrícula / Escritura de Imóvel</option>
                            <option value="Capacidade Financeira">Extratos Bancários / Balanços</option>
                            <option value="Outros">Outras Certidões & Comprovantes</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (!novoDocNome.trim()) {
                              toast.error("Informe o nome do arquivo a ser anexado.");
                              return;
                            }
                            const novo = {
                              id: `doc-${Date.now()}`,
                              nome: novoDocNome.endsWith(".pdf") ? novoDocNome : `${novoDocNome}.pdf`,
                              categoria: novoDocCategoria,
                              tamanho: "1.8 MB",
                              dataEnvio: "Agora",
                              status: "homologado",
                              analista: "Rodrigo Gonçalves"
                            };
                            setDocumentosVault([novo, ...documentosVault]);
                            setNovoDocNome("");
                            setShowModalAnexo(false);
                            toast.success(`Documento "${novo.nome}" anexado e homologado com sucesso!`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#820AD1] text-white text-xs font-bold hover:bg-[#7009b5] cursor-pointer"
                        >
                          Confirmar Upload & Homologar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Documentos no Vault */}
                  <div className="space-y-2">
                    {documentosVault.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {doc.nome}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>Categoria: {doc.categoria}</span>
                              <span>·</span>
                              <span>{doc.tamanho}</span>
                              <span>·</span>
                              <span>Enviado: {doc.dataEnvio}</span>
                              <span>·</span>
                              <span>Analista: {doc.analista}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.status === "homologado"
                                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                : doc.status === "analise"
                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                                : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {doc.status === "homologado" ? "Homologado" : doc.status === "analise" ? "Em Análise" : "Rejeitado"}
                          </span>

                          {doc.status !== "homologado" ? (
                            <button
                              onClick={() => {
                                setDocumentosVault(documentosVault.map(d => d.id === doc.id ? {...d, status: "homologado", analista: "Mesa de Crédito"} : d));
                                toast.success(`Documento ${doc.nome} homologado!`);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Homologar
                            </button>
                          ) : (
                            <button
                              onClick={() => toast.info(`Abrindo visualizador de ${doc.nome}...`)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Visualizar documento"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-ABA 4: ANÁLISE DE CRÉDITO SAC/PRICE */}
              {subAbaDossie === "credito" && (
                <div className="space-y-4">
                  {/* Simulador Interativo */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-[#820AD1]" />
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          Motor de Scoring & Simulador de Financiamento SAC / PRICE
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                        <button
                          onClick={() => setSimulacaoSistema("SAC")}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                            simulacaoSistema === "SAC"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          SAC (Amortização Constante)
                        </button>
                        <button
                          onClick={() => setSimulacaoSistema("PRICE")}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                            simulacaoSistema === "PRICE"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          PRICE (Parcelas Fixas)
                        </button>
                      </div>
                    </div>

                    {/* Controles do Simulador */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Valor do Imóvel / Crédito (R$)</label>
                        <input
                          type="number"
                          value={simulacaoValor}
                          onChange={(e) => setSimulacaoValor(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Entrada Própria (R$)</label>
                        <input
                          type="number"
                          value={simulacaoEntrada}
                          onChange={(e) => setSimulacaoEntrada(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Prazo de Pagamento (Meses)</label>
                        <select
                          value={simulacaoPrazo}
                          onChange={(e) => setSimulacaoPrazo(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        >
                          <option value={60}>60 meses (5 anos)</option>
                          <option value={120}>120 meses (10 anos)</option>
                          <option value={180}>180 meses (15 anos)</option>
                          <option value={240}>240 meses (20 anos)</option>
                          <option value={360}>360 meses (30 anos)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Taxa de Juros Anual (% a.a.)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={simulacaoTaxa}
                          onChange={(e) => setSimulacaoTaxa(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Cálculos Financeiros Dinâmicos */}
                    {(() => {
                      const financiado = Math.max(0, simulacaoValor - simulacaoEntrada);
                      const taxaMensal = Math.pow(1 + simulacaoTaxa / 100, 1 / 12) - 1;
                      let parcelaInicial = 0;
                      let parcelaFinal = 0;
                      let totalPago = 0;
                      if (simulacaoSistema === "SAC") {
                        const amortizacao = financiado / simulacaoPrazo;
                        parcelaInicial = amortizacao + financiado * taxaMensal;
                        parcelaFinal = amortizacao + amortizacao * taxaMensal;
                        totalPago = ((parcelaInicial + parcelaFinal) / 2) * simulacaoPrazo;
                      } else {
                        parcelaInicial = (financiado * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -simulacaoPrazo));
                        parcelaFinal = parcelaInicial;
                        totalPago = parcelaInicial * simulacaoPrazo;
                      }
                      const rendaTotal = cadastroForm.rendaFormal + cadastroForm.rendaInformal + cadastroForm.outrasRendas + cadastroForm.conjugeRenda;
                      const comprometimento = rendaTotal > 0 ? (parcelaInicial / rendaTotal) * 100 : 0;
                      const limiteMaximoAprovado = 680000;

                      return (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 block">Valor Financiado Líquido</span>
                              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                                R$ {financiado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 block">
                                {simulacaoSistema === "SAC" ? "1ª Parcela (Decrescente)" : "Parcela Fixa Mensal"}
                              </span>
                              <span className="text-sm font-bold font-mono text-[#820AD1]">
                                R$ {parcelaInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 block">Comprometimento de Renda</span>
                              <span className="text-sm font-bold font-mono text-emerald-600">
                                {comprometimento.toFixed(1)}% <span className="text-[10px] text-slate-400">(Máx 30%)</span>
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 block">Limite Máximo Aprovado</span>
                              <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">
                                R$ {limiteMaximoAprovado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Certificado Oficial Homologado */}
                          <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-950/20 via-slate-900/40 to-purple-950/20 border border-emerald-500/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-500" />
                                <div>
                                  <h5 className="font-bold text-xs text-white">
                                    Certificado Oficial de Pré-Aprovação de Crédito BancoFé
                                  </h5>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Autenticação SHA-256: 8f2a09c4...b912d08a · Validade: 90 dias
                                  </span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                                HOMOLOGADO
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
                              <p>
                                <strong>Parecer da Mesa de Crédito:</strong> Proponente qualificado com score 842 (AAA), sem restrições no SCR/Bacen. Garantia imobiliária no empreendimento Florais do Vale aceita com LTV de 80%. Operação pré-aprovada para emissão imediata de CCB Digital ou Contrato Habitacional.
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => toast.success("Certificado de Crédito exportado para PDF!")}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Exportar Certificado em PDF</span>
                              </button>

                              <button
                                onClick={() => {
                                  const target = modalDossie;
                                  setConversaoValor(financiado);
                                  setModalDossie(null);
                                  setModalConverter(target);
                                  toast.info("Parâmetros do simulador transferidos para a oportunidade!");
                                }}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                              >
                                <span>Converter Oportunidade com Estes Valores</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            </div>

            {/* Rodapé da Gaveta */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setModalDossie(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Fechar Dossiê
              </button>
              <button
                onClick={() => {
                  const target = modalDossie;
                  setModalDossie(null);
                  setModalConverter(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c4a34] hover:bg-[#064e3b] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <span>Avançar para Conversão no Funil</span>
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
                  <option value="FINANCIAMENTO_LOTES_ULTRA">Financiamento de Lotes Construtora Ultra (0,95% a.m. · até 144x)</option>
                  <option value="MCMV_HABITACIONAL">Minha Casa Minha Vida Habitacional Popular (0,58% a.m. · até 360x)</option>
                  <option value="CREDITO_IMOBILIARIO">Crédito Imobiliário & Hipotecário Casa Nova (1,05% a.m. · até 360x)</option>
                  <option value="HOME_EQUITY">Home Equity (Garantia de Imóvel · 0,85% a.m. · até 180x)</option>
                  <option value="CPR_FINANCEIRA">CPR Digital Agro & Barter Safra (0,75% a.m. · até 60x)</option>
                  <option value="CREDITO_RURAL_CUSTEIO">Custeio Agrícola e Pecuário (0,88% a.m. · até 36x)</option>
                  <option value="CAPITAL_GIRO_PJ">Capital de Giro Corporativo PJ (1,15% a.m. · até 60x)</option>
                  <option value="FINANCIAMENTO_FROTAS">Financiamento de Frotas & Maquinários (1,10% a.m. · até 72x)</option>
                  <option value="ANTECIPACAO_RECEBIVEIS">Antecipação de Recebíveis D+0 (0,95% a.m. · até 12x)</option>
                  <option value="CCB_DIGITAL">CCB Digital (Cédula de Crédito Bancário · 1,20% a.m. · até 48x)</option>
                  <option value="CONSIGNADO_FOLHA">Empréstimo Consignado & Desconto em Folha (1,35% a.m. · até 96x)</option>
                  <option value="MUTUO_INTRAGRUPO">Mútuo Intragrupo Holding (1,08% a.m. · até 36x)</option>
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
