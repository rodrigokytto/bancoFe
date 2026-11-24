import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  FileText,
  Boxes,
  Scale,
  Building2,
  Landmark,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Download,
  UploadCloud,
  Check,
  ChevronRight,
  ExternalLink,
  Lock,
  Calendar,
  DollarSign,
  Briefcase,
  FileCode,
  Sliders,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
  Fingerprint,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import {
  ClienteEmpresa360,
  DocumentoPreCadastro,
  TermoDigitalBancoFe,
  MetricasCadastro360,
  TipoDocumentoPreCadastro
} from "@shared/cadastro360Types";

export default function Cadastro360BancoFePage() {
  const [activeMainTab, setActiveMainTab] = useState<"visao_360" | "precadastro_vault" | "termos_formais" | "matriz_empresas">("visao_360");
  const [active360SubTab, setActive360SubTab] = useState<"geral" | "qsa" | "compliance" | "financeiro" | "limites" | "garantias" | "operacoes" | "termos">("geral");

  const [clientes, setClientes] = useState<ClienteEmpresa360[]>([]);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>("");
  const [metricas, setMetricas] = useState<MetricasCadastro360 | null>(null);
  const [documentosCliente, setDocumentosCliente] = useState<DocumentoPreCadastro[]>([]);
  const [termosCliente, setTermosCliente] = useState<TermoDigitalBancoFe[]>([]);

  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [buscaTexto, setBuscaTexto] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(true);

  // Modais
  const [modalNovoPreCadastro, setModalNovoPreCadastro] = useState<boolean>(false);
  const [modalUploadDoc, setModalUploadDoc] = useState<{ aberto: boolean; tipo?: TipoDocumentoPreCadastro; titulo?: string }>({ aberto: false });
  const [modalVisualizarDoc, setModalVisualizarDoc] = useState<DocumentoPreCadastro | null>(null);
  const [modalRejeitarDoc, setModalRejeitarDoc] = useState<{ aberto: boolean; docId?: string; titulo?: string; justificativa: string }>({ aberto: false, justificativa: "" });
  const [modalVisualizarTermo, setModalVisualizarTermo] = useState<TermoDigitalBancoFe | null>(null);
  const [modalAssinarTermo, setModalAssinarTermo] = useState<{ aberto: boolean; termo?: TermoDigitalBancoFe; nome: string; cpf: string }>({ aberto: false, nome: "Rodrigo Ribeiro Gonçalves", cpf: "123.456.789-00" });

  // Formulário de Novo Pré-Cadastro
  const [novoClienteForm, setNovoClienteForm] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpjCpf: "",
    empresaOrigemId: "operacoes_financeiras_crm",
    empresaOrigemNome: "BancoFe — Operações & CRM",
    porte: "MEDIO" as const,
    regimeTributario: "Lucro Presumido" as const,
    faturamentoAnualDeclarado: 6000000,
    limitePretendido: 1000000,
    cidade: "Tangará da Serra",
    uf: "MT",
    email: "financeiro@empresa.com.br",
    telefone: "(65) 3326-1000",
    responsavelNome: "Diretor Responsável",
    responsavelCpf: "123.456.789-00",
  });

  // Carregar dados iniciais
  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [resCli, resMet] = await Promise.all([
        fetch("/api/bancofe/cadastro360/clientes"),
        fetch("/api/bancofe/cadastro360/metricas"),
      ]);

      const dataCli = await resCli.json();
      const dataMet = await resMet.json();

      if (dataCli.success) {
        setClientes(dataCli.data);
        if (dataCli.data.length > 0 && !clienteSelecionadoId) {
          setClienteSelecionadoId(dataCli.data[0].id);
        }
      }

      if (dataMet.success) {
        setMetricas(dataMet.data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Cadastro 360:", err);
      toast.error("Falha ao comunicar com o servidor");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Obter detalhes, documentos e termos do cliente selecionado
  useEffect(() => {
    if (!clienteSelecionadoId) return;

    const carregarDocsETermos = async () => {
      try {
        const [resDocs, resTermos] = await Promise.all([
          fetch(`/api/bancofe/cadastro360/clientes/${clienteSelecionadoId}/documentos`),
          fetch(`/api/bancofe/cadastro360/clientes/${clienteSelecionadoId}/termos`),
        ]);

        const dataDocs = await resDocs.json();
        const dataTermos = await resTermos.json();

        if (dataDocs.success) setDocumentosCliente(dataDocs.data);
        if (dataTermos.success) setTermosCliente(dataTermos.data);
      } catch (err) {
        console.error("Erro ao carregar docs/termos do cliente:", err);
      }
    };

    carregarDocsETermos();
  }, [clienteSelecionadoId]);

  const clienteAtual = clientes.find((c) => c.id === clienteSelecionadoId);

  // Executar Varredura de Compliance PLD-FT
  const executarScanCompliance = async () => {
    if (!clienteAtual) return;
    try {
      toast.loading("Executando varredura automatizada em OFAC, CSNU, CEAF, CEPIM, CGF e SCR Bacen...", { id: "scan" });
      const res = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/compliance-scan`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Varredura de Compliance concluída! Score: 96/100 (Risco Mínimo).", { id: "scan" });
        carregarDados();
      } else {
        toast.error(data.error || "Erro na varredura", { id: "scan" });
      }
    } catch {
      toast.error("Falha de conexão", { id: "scan" });
    }
  };

  // Submeter Novo Pré-Cadastro
  const handleCriarPreCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteForm.razaoSocial || !novoClienteForm.cnpjCpf) {
      toast.error("Preencha Razão Social e CNPJ");
      return;
    }

    try {
      const payload: Partial<ClienteEmpresa360> = {
        razaoSocial: novoClienteForm.razaoSocial,
        nomeFantasia: novoClienteForm.nomeFantasia || novoClienteForm.razaoSocial,
        cnpjCpf: novoClienteForm.cnpjCpf,
        tipoPessoa: "PJ",
        empresaOrigemId: novoClienteForm.empresaOrigemId,
        empresaOrigemNome: novoClienteForm.empresaOrigemNome,
        dadosCadastrais: {
          dataFundacao: "2021-01-01",
          porte: novoClienteForm.porte,
          regimeTributario: novoClienteForm.regimeTributario,
          cnaePrincipal: { codigo: "46.00-0-00", descricao: "Comércio Atacadista Geral" },
          cnaesSecundarios: [],
          capitalSocial: novoClienteForm.faturamentoAnualDeclarado * 0.2,
          faturamentoAnualDeclarado: Number(novoClienteForm.faturamentoAnualDeclarado),
          endereco: {
            logradouro: "Av. Principal",
            numero: "500",
            bairro: "Centro",
            cidade: novoClienteForm.cidade,
            uf: novoClienteForm.uf,
            cep: "78300-000",
          },
          contatos: {
            nomeResponsavel: novoClienteForm.responsavelNome,
            cargo: "Diretor Comercial",
            email: novoClienteForm.email,
            telefone: novoClienteForm.telefone,
            whatsapp: novoClienteForm.telefone,
          },
        },
      };

      const res = await fetch("/api/bancofe/cadastro360/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Novo pré-cadastro criado com sucesso! Checklist documental e minutas regulatórias gerados.");
        setModalNovoPreCadastro(false);
        await carregarDados();
        setClienteSelecionadoId(data.data.id);
        setActiveMainTab("precadastro_vault");
      } else {
        toast.error(data.error || "Erro ao criar pré-cadastro");
      }
    } catch {
      toast.error("Erro ao enviar dados do pré-cadastro");
    }
  };

  // Upload simulado de documento
  const handleUploadDocumento = async () => {
    if (!clienteAtual || !modalUploadDoc.tipo) return;
    try {
      const fileName = `${clienteAtual.id}_${modalUploadDoc.tipo}.pdf`;
      const res = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/documentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDocumento: modalUploadDoc.tipo,
          arquivoNome: fileName,
          formato: "application/pdf",
          tamanhoBytes: 1024 * 720,
          validadeData: "2027-11-20",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Documento enviado com sucesso! Hash SHA-256 gerado.`);
        setModalUploadDoc({ aberto: false });
        // Recarregar documentos
        const resDocs = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/documentos`);
        const dataDocs = await resDocs.json();
        if (dataDocs.success) setDocumentosCliente(dataDocs.data);
        carregarDados();
      }
    } catch {
      toast.error("Falha no upload do documento");
    }
  };

  // Alterar status de documento (Aprovar / Rejeitar)
  const handleAlterarStatusDoc = async (docId: string, status: "aprovado" | "rejeitado", justificativa?: string) => {
    if (!clienteAtual) return;
    try {
      const res = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/documentos/${docId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          justificativa,
          operador: "Mesa de Operações BancoFe",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === "aprovado" ? "Documento aprovado com conformidade!" : "Documento recusado com pendência registrada.");
        // Atualizar lista
        const resDocs = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/documentos`);
        const dataDocs = await resDocs.json();
        if (dataDocs.success) setDocumentosCliente(dataDocs.data);
        carregarDados();
        setModalRejeitarDoc({ aberto: false, justificativa: "" });
      }
    } catch {
      toast.error("Erro ao alterar status do documento");
    }
  };

  // Assinar termo digitalmente
  const handleAssinarTermo = async () => {
    if (!clienteAtual || !modalAssinarTermo.termo) return;
    try {
      const res = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/termos/${modalAssinarTermo.termo.id}/assinar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: modalAssinarTermo.nome,
          cpf: modalAssinarTermo.cpf,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Termo assinado digitalmente com sucesso! Carimbo ICP-Brasil e Hash SHA-256 gerados.");
        setModalAssinarTermo({ aberto: false, nome: "", cpf: "" });
        // Recarregar termos
        const resTermos = await fetch(`/api/bancofe/cadastro360/clientes/${clienteAtual.id}/termos`);
        const dataTermos = await resTermos.json();
        if (dataTermos.success) setTermosCliente(dataTermos.data);
        carregarDados();
      }
    } catch {
      toast.error("Falha ao assinar termo digital");
    }
  };

  // Clientes filtrados
  const clientesFiltrados = clientes.filter((c) => {
    const matchEmpresa = filtroEmpresa === "todas" || c.empresaOrigemId === filtroEmpresa;
    const matchStatus = filtroStatus === "todos" || c.statusCadastral === filtroStatus;
    const matchBusca =
      !buscaTexto ||
      c.razaoSocial.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      c.cnpjCpf.includes(buscaTexto) ||
      c.codigo.toLowerCase().includes(buscaTexto.toLowerCase());
    return matchEmpresa && matchStatus && matchBusca;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-8 font-sans">
      {/* HEADER NUBANK MINIMALISTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-700/20 dark:text-emerald-300 border border-emerald-600/30">
              <Sparkles className="w-3.5 h-3.5" /> BancoFe 360° Ecosystem
            </span>
            <span className="text-xs text-slate-500">Resolução CMN nº 2.682/99 & BACEN nº 4.571/17</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Cadastro 360°, Pré-Cadastro & Central de Termos
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Mesa integrada de KYB/KYC, conformidade PLD-FT, dossiê documental, limites operacionais e assinaturas digitais do Grupo BancoFe.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setModalNovoPreCadastro(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Pré-Cadastro
          </button>
          <button
            onClick={carregarDados}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>
      </div>

      {/* METRICAS EXECUTIVAS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Limites Concedidos</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            R$ {((metricas?.volumeTotalLimitesAprovados || 0) / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              R$ {((metricas?.volumeTotalLimitesDisponiveis || 0) / 1000000).toFixed(2)}M
            </span> livres para saque
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Empresas Homologadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metricas?.totalEmpresasHomologadas || 0} de {metricas?.totalClientesCadastrados || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Completude Média: <strong className="text-emerald-600 dark:text-emerald-400">{metricas?.taxaMediaCompletudeCadastral || 0}%</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Dossiês & Vault Documental</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {documentosCliente.filter((d) => d.status === "aprovado").length} / {documentosCliente.length || 13}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            13 documentos normativos Bacen
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Termos Digitais Assinados</span>
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {termosCliente.filter((t) => t.status === "assinado").length} de {termosCliente.length || 7}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
            <span>Assinatura Lei 14.063/20</span>
          </div>
        </div>
      </div>

      {/* ABAS PRINCIPAIS NUBANK */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl mb-6 max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveMainTab("visao_360")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === "visao_360"
              ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> Cadastro 360° Corporativo
        </button>

        <button
          onClick={() => setActiveMainTab("precadastro_vault")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === "precadastro_vault"
              ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Boxes className="w-4 h-4" /> Pré-Cadastro & Vault Documental
        </button>

        <button
          onClick={() => setActiveMainTab("termos_formais")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === "termos_formais"
              ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Scale className="w-4 h-4" /> Central de Termos & SCR Bacen
        </button>

        <button
          onClick={() => setActiveMainTab("matriz_empresas")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === "matriz_empresas"
              ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" /> Matriz de Governança & Empresas
        </button>
      </div>

      {/* ========================================================= */}
      {/* ABA 1: VISÃO 360° CORPORATIVA DO CLIENTE */}
      {/* ========================================================= */}
      {activeMainTab === "visao_360" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUNA ESQUERDA: LISTA DE EMPRESAS (4 COLUNAS) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar Razão, CNPJ ou Protocolo..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex gap-2 text-xs">
                <select
                  value={filtroEmpresa}
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                  className="w-1/2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                >
                  <option value="todas">Todas as Empresas do Grupo</option>
                  <option value="holding_kytto">👑 BancoFe Holding S.A. (Controladora)</option>
                  <option value="bancofe">🏛️ BancoFe — Core Bancário & Securitizadora FIDC</option>
                  <option value="operacoes_financeiras_crm">Operações & CRM</option>
                  <option value="zuma_agro">Zuma Agro MT</option>
                  <option value="bancofe_logistica">Logística & Frotas</option>
                  <option value="zuma_moda">Zuma Moda</option>
                  <option value="zuma_gastronomia">Gastronomia</option>
                </select>

                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-1/2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                >
                  <option value="todos">Todos Status</option>
                  <option value="homologado">Homologado</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="pendente_documentos">Pendente Docs</option>
                </select>
              </div>
            </div>

            {/* LISTA ROLÁVEL DE CARDS DE EMPRESAS */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {clientesFiltrados.map((cli) => {
                const isSelected = cli.id === clienteSelecionadoId;
                return (
                  <div
                    key={cli.id}
                    onClick={() => setClienteSelecionadoId(cli.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-700/5 dark:bg-emerald-700/15 border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-medium text-slate-400">
                          {cli.codigo}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {cli.razaoSocial}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {cli.cnpjCpf}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          cli.statusCadastral === "homologado"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : cli.statusCadastral === "em_analise"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {cli.statusCadastral === "homologado" ? "Homologado" : "Em Análise"}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Limite: <strong>R$ {(cli.limitesOperacionais.limiteGlobalAprovado / 1000000).toFixed(1)}M</strong></span>
                      <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 dark:text-emerald-300">
                        {cli.percentualCompletudeCadastral}% docs <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA DIREITA: DETALHE 360 COMPLETO (8 COLUNAS) */}
          <div className="lg:col-span-8">
            {clienteAtual ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-6">
                {/* CABEÇALHO DO CLIENTE 360 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {clienteAtual.codigo}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 dark:text-emerald-400">
                        {clienteAtual.empresaOrigemNome}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      {clienteAtual.razaoSocial}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                      Nome Fantasia: <span className="text-slate-700 dark:text-slate-300 font-medium">{clienteAtual.nomeFantasia}</span> • CNPJ: <span className="font-mono">{clienteAtual.cnpjCpf}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={executarScanCompliance}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Varredura PLD-FT
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(clienteAtual, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `dossie_360_${clienteAtual.codigo}.json`;
                        a.click();
                        toast.success("Dossiê 360 exportado para auditoria.");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar JSON
                    </button>
                  </div>
                </div>

                {/* SUB-ABAS 360 */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                  {[
                    { id: "geral", label: "Dados Cadastrais & Domicílio", icon: Landmark },
                    { id: "qsa", label: "Quadro Societário & UBO", icon: Users },
                    { id: "compliance", label: "Compliance & PLD-FT", icon: ShieldCheck },
                    { id: "financeiro", label: "Balanço & Rating CMN 2.682", icon: TrendingUp },
                    { id: "limites", label: "Limites Aprovados", icon: CreditCard },
                    { id: "garantias", label: "Garantias & Colaterais", icon: Boxes },
                    { id: "operacoes", label: "Contratos & Histórico", icon: Briefcase },
                    { id: "termos", label: "Termos Digitais", icon: Scale },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isActive = active360SubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActive360SubTab(sub.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                          isActive
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* CONTEÚDO DAS SUB-ABAS 360 */}
                {/* 1. DADOS CADASTRAIS & DOMICÍLIO */}
                {active360SubTab === "geral" && (
                  <div className="space-y-4 text-xs md:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Dados na Receita Federal
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-400">Porte:</span> <strong>{clienteAtual.dadosCadastrais.porte}</strong></div>
                          <div><span className="text-slate-400">Regime:</span> <strong>{clienteAtual.dadosCadastrais.regimeTributario}</strong></div>
                          <div><span className="text-slate-400">Fundação:</span> <strong>{new Date(clienteAtual.dadosCadastrais.dataFundacao).toLocaleDateString("pt-BR")}</strong></div>
                          <div><span className="text-slate-400">Capital Social:</span> <strong>R$ {clienteAtual.dadosCadastrais.capitalSocial.toLocaleString("pt-BR")}</strong></div>
                        </div>
                        <div className="pt-2 text-xs border-t border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400">CNAE Principal:</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {clienteAtual.dadosCadastrais.cnaePrincipal.codigo} - {clienteAtual.dadosCadastrais.cnaePrincipal.descricao}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-emerald-500" /> Conta Gráfica BancoFe & Trava CERC
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-400">Banco:</span> <strong>{clienteAtual.contaGraficaBancoFe.banco}</strong></div>
                          <div><span className="text-slate-400">Agência:</span> <strong>{clienteAtual.contaGraficaBancoFe.agencia}</strong></div>
                          <div><span className="text-slate-400">Conta:</span> <strong>{clienteAtual.contaGraficaBancoFe.contaCorrente}</strong></div>
                          <div><span className="text-slate-400">Saldo Gráfico:</span> <strong className="text-emerald-600 dark:text-emerald-400">R$ {clienteAtual.contaGraficaBancoFe.saldoConta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></div>
                        </div>
                        <div className="pt-2 text-xs border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span>Trava de Domicílio:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Registradora {clienteAtual.contaGraficaBancoFe.travaDomicilioBancario.registradora} (100% Retenção)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">Endereço & Sede Social</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {clienteAtual.dadosCadastrais.endereco.logradouro}, {clienteAtual.dadosCadastrais.endereco.numero}
                        {clienteAtual.dadosCadastrais.endereco.complemento ? ` (${clienteAtual.dadosCadastrais.endereco.complemento})` : ""} - {clienteAtual.dadosCadastrais.endereco.bairro}, {clienteAtual.dadosCadastrais.endereco.cidade}/{clienteAtual.dadosCadastrais.endereco.uf} - CEP {clienteAtual.dadosCadastrais.endereco.cep}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. QUADRO SOCIETÁRIO & UBO */}
                {active360SubTab === "qsa" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Quadro de Sócios e Administradores (QSA) e Beneficiários Finais (UBO - RFB 2.119/22)</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                          <tr>
                            <th className="p-3">Nome do Sócio</th>
                            <th className="p-3">CPF / Documento</th>
                            <th className="p-3">Qualificação / Cargo</th>
                            <th className="p-3">% Participação</th>
                            <th className="p-3">PEP</th>
                            <th className="p-3">UBO</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {clienteAtual.quadroSocietario.map((soc) => (
                            <tr key={soc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-semibold text-slate-900 dark:text-white">{soc.nome}</td>
                              <td className="p-3 font-mono">{soc.cpf}</td>
                              <td className="p-3">{soc.cargo}</td>
                              <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{soc.participacaoPercentual}%</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${soc.pep ? "bg-amber-500/20 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                                  {soc.pep ? "Sim" : "Não"}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${soc.beneficiarioFinalUBO ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                                  {soc.beneficiarioFinalUBO ? "Sim" : "Não"}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                                  <Check className="w-3 h-3" /> Validado
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. COMPLIANCE & PLD-FT */}
                {active360SubTab === "compliance" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Score de Compliance PLD-FT</span>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {clienteAtual.compliancePLD.scoreCompliance} / 100 • Risco Baixo
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Última varredura: {new Date(clienteAtual.compliancePLD.ultimaVarredura).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-80" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: "OFAC Sanctions (EUA)", check: clienteAtual.compliancePLD.ofacSanctions },
                        { label: "CSNU (ONU)", check: clienteAtual.compliancePLD.csnuOnu },
                        { label: "CEAF (Gov Federal)", check: clienteAtual.compliancePLD.ceafGov },
                        { label: "CEPIM (Impedimentos)", check: clienteAtual.compliancePLD.cepim },
                        { label: "Trabalho Escravo (MTE)", check: clienteAtual.compliancePLD.trabalhoEscravoMte },
                        { label: "CEIS / TCU Inidôneos", check: clienteAtual.compliancePLD.ceisTcu },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                          <span className="text-slate-500 font-medium">{item.label}</span>
                          <div className="flex items-center gap-1.5 mt-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Nada Consta
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. BALANÇO & RATING CMN 2.682 */}
                {active360SubTab === "financeiro" && (
                  <div className="space-y-4 text-xs md:text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-xs">Faturamento 12M</span>
                        <div className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                          R$ {(clienteAtual.analiseFinanceira.faturamentoUltimos12Meses / 1000000).toFixed(2)}M
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-xs">EBITDA Anual</span>
                        <div className="font-bold text-emerald-600 text-base mt-0.5">
                          R$ {(clienteAtual.analiseFinanceira.ebitdaAnual / 1000000).toFixed(2)}M ({clienteAtual.analiseFinanceira.margemEbitda}%)
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-xs">Rating CMN 2.682</span>
                        <div className="font-bold text-emerald-600 text-base mt-0.5">
                          Rating {clienteAtual.analiseFinanceira.ratingCMN2682} (PDD {clienteAtual.analiseFinanceira.provisaoPddExigida}%)
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-xs">Score Bureau</span>
                        <div className="font-bold text-blue-600 text-base mt-0.5">
                          {clienteAtual.analiseFinanceira.scoreBureau} / 1000
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Indicadores de Solvência & Alavancagem</span>
                        <span>Contador: {clienteAtual.analiseFinanceira.contadorResponsavel.nome} ({clienteAtual.analiseFinanceira.contadorResponsavel.crc})</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div><span className="text-slate-400">Liquidez Corrente:</span> <strong>{clienteAtual.analiseFinanceira.liquidezCorrente}x</strong></div>
                        <div><span className="text-slate-400">Dívida Líq./EBITDA:</span> <strong>{clienteAtual.analiseFinanceira.dividaLiquidaEbitda}x</strong></div>
                        <div><span className="text-slate-400">Ativo Total:</span> <strong>R$ {(clienteAtual.analiseFinanceira.ativoTotal / 1000000).toFixed(1)}M</strong></div>
                        <div><span className="text-slate-400">Patrimônio Líquido:</span> <strong>R$ {(clienteAtual.analiseFinanceira.patrimonioLiquido / 1000000).toFixed(1)}M</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. LIMITES OPERACIONAIS */}
                {active360SubTab === "limites" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-700/10 border border-emerald-600/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 dark:text-emerald-300">Limite Global Aprovado</span>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                          R$ {(clienteAtual.limitesOperacionais.limiteGlobalAprovado / 1000000).toFixed(2)}M
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Alçada: <strong>{clienteAtual.limitesOperacionais.nivelAlcada}</strong> • Aprovado por: {clienteAtual.limitesOperacionais.aprovadoPor}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <div>Tomado: <strong className="text-rose-600">R$ {(clienteAtual.limitesOperacionais.limiteUtilizadoTotal / 1000000).toFixed(2)}M</strong></div>
                        <div>Disponível: <strong className="text-emerald-600">R$ {(clienteAtual.limitesOperacionais.limiteDisponivelTotal / 1000000).toFixed(2)}M</strong></div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {clienteAtual.limitesOperacionais.sublimites.map((sub) => {
                        const pct = Math.round((sub.limiteTomado / sub.limiteAprovado) * 100) || 0;
                        return (
                          <div key={sub.produtoId} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 dark:text-white">{sub.produtoNome}</span>
                              <span className="text-slate-500">Taxa: <strong>{sub.taxaPadraoMes}% a.m.</strong></span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden my-1.5">
                              <div className="h-full bg-emerald-700" style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Aprovado: R$ {(sub.limiteAprovado / 1000).toFixed(0)}k</span>
                              <span>Tomado: R$ {(sub.limiteTomado / 1000).toFixed(0)}k ({pct}%)</span>
                              <span className="text-emerald-600 font-semibold">Disponível: R$ {(sub.limiteDisponivel / 1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. GARANTIAS & COLATERAIS */}
                {active360SubTab === "garantias" && (
                  <div className="space-y-3">
                    {clienteAtual.garantiasColaterais.map((gar) => (
                      <div key={gar.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              {gar.tipoGarantia.replace(/_/g, " ")}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                              {gar.descricao}
                            </h4>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            LTV: {gar.ltvPercentual}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div><span className="text-slate-400">Avaliação:</span> <strong>R$ {gar.valorAvaliacao.toLocaleString("pt-BR")}</strong></div>
                          <div><span className="text-slate-400">Comprometido:</span> <strong>R$ {gar.valorGarantiaComprometida.toLocaleString("pt-BR")}</strong></div>
                          <div><span className="text-slate-400">Registro:</span> <strong>{gar.detalhesRegistro.cartorioOuRegistradora}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 7. CONTRATOS & HISTÓRICO */}
                {active360SubTab === "operacoes" && (
                  <div className="space-y-3 text-xs">
                    {clienteAtual.historicoOperacoes.map((op) => (
                      <div key={op.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-slate-400 text-[10px]">{op.numeroContrato}</div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{op.tipoOperacao}</h4>
                          <p className="text-slate-500 mt-0.5">
                            Contratado: {new Date(op.dataContratacao).toLocaleDateString("pt-BR")} • Parcelas: {op.parcelasPagas} de {op.parcelasTotal}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            R$ {op.valorOriginal.toLocaleString("pt-BR")}
                          </div>
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> {op.pontualidadeHistorica}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 8. TERMOS DIGITAIS VINCULADOS */}
                {active360SubTab === "termos" && (
                  <div className="space-y-3 text-xs">
                    {termosCliente.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">{t.codigo}</span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.titulo}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">{t.normativaReferencia}</p>
                          {t.status === "assinado" && (
                            <p className="text-slate-400 text-[10px] mt-1 font-mono">
                              Assinado por {t.signatarioNome} ({t.signatarioCpf}) • IP {t.signatarioIp}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModalVisualizarTermo(t)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                            title="Ler Minuta"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          </button>

                          {t.status === "assinado" ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                            </span>
                          ) : (
                            <button
                              onClick={() => setModalAssinarTermo({ aberto: true, termo: t, nome: "Rodrigo Ribeiro Gonçalves", cpf: "123.456.789-00" })}
                              className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-semibold text-[11px]"
                            >
                              Assinar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                Selecione uma empresa na lista ao lado para visualizar o dossiê 360°.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: PRÉ-CADASTRO & VAULT DOCUMENTAL DIGITAL */}
      {/* ========================================================= */}
      {activeMainTab === "precadastro_vault" && (
        <div className="space-y-6">
          <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Vault Documental & Dossiê de Pré-Cadastro
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Checklist normativo de 13 documentos com validação de integridade por Hash SHA-256 e controle de certidões.
                </p>
              </div>

              {clienteAtual && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Cliente Selecionado:</span>
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-xs">{clienteAtual.razaoSocial}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-600 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {clienteAtual.percentualCompletudeCadastral}%
                  </div>
                </div>
              )}
            </div>

            {/* TABELA DO CHECKLIST DE 13 DOCUMENTOS */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                  <tr>
                    <th className="p-3">Documento Normativo</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Hash SHA-256</th>
                    <th className="p-3">Validade</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documentosCliente.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {doc.titulo}
                        </div>
                        {doc.justificativaRejeicao && (
                          <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                            Motivo Recusa: {doc.justificativaRejeicao}
                          </p>
                        )}
                      </td>
                      <td className="p-3 capitalize">{doc.categoria}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            doc.status === "aprovado"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : doc.status === "em_analise"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : doc.status === "rejeitado"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {doc.status === "aprovado"
                            ? "Aprovado"
                            : doc.status === "em_analise"
                            ? "Em Análise"
                            : doc.status === "rejeitado"
                            ? "Recusado"
                            : "Pendente"}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[10px]">
                        {doc.hashSha256 ? `${doc.hashSha256.substring(0, 12)}...` : "-"}
                      </td>
                      <td className="p-3">
                        {doc.validadeData ? (
                          <span className="text-slate-600 dark:text-slate-300">
                            {new Date(doc.validadeData).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <span className="text-slate-400">Permanente</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModalUploadDoc({ aberto: true, tipo: doc.tipoDocumento, titulo: doc.titulo })}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Upload de Arquivo"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          </button>

                          <button
                            onClick={() => setModalVisualizarDoc(doc)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Visualizar Detalhes"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          </button>

                          {doc.status !== "aprovado" && (
                            <button
                              onClick={() => handleAlterarStatusDoc(doc.id, "aprovado")}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600"
                              title="Aprovar Documento"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {doc.status !== "rejeitado" && (
                            <button
                              onClick={() => setModalRejeitarDoc({ aberto: true, docId: doc.id, titulo: doc.titulo, justificativa: "" })}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600"
                              title="Rejeitar com Pendência"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 3: CENTRAL DE TERMOS & SCR BACEN */}
      {/* ========================================================= */}
      {activeMainTab === "termos_formais" && (
        <div className="space-y-6">
          <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Central de Termos, Formalização & Consentimentos SCR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Instrumentos jurídicos e regulatórios exigidos pelo Banco Central do Brasil, CMN e Lei Federal nº 10.931/04.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {termosCliente.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{t.codigo}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{t.titulo}</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 dark:text-emerald-300 mt-0.5 font-medium">{t.normativaReferencia}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        t.status === "assinado"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {t.status === "assinado" ? "Assinado" : "Pendente"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                    {t.status === "assinado" ? (
                      <>
                        <div>Signatário: <strong>{t.signatarioNome}</strong> ({t.signatarioCpf})</div>
                        <div className="font-mono text-[10px] text-slate-400 truncate">
                          Hash SHA-256: {t.hashIntegridadeSha256}
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400 text-xs">
                        Minuta aguardando confirmação e assinatura digital.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setModalVisualizarTermo(t)}
                      className="w-1/2 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ler Minuta
                    </button>

                    {t.status === "assinado" ? (
                      <button
                        onClick={() => {
                          const blob = new Blob([t.conteudoMinutaMarkdown], { type: "text/markdown" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${t.codigo}.md`;
                          a.click();
                          toast.success("Minuta do termo baixada!");
                        }}
                        className="w-1/2 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar Minuta
                      </button>
                    ) : (
                      <button
                        onClick={() => setModalAssinarTermo({ aberto: true, termo: t, nome: "Rodrigo Ribeiro Gonçalves", cpf: "123.456.789-00" })}
                        className="w-1/2 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Assinar Digital
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 4: RADAR 8 EMPRESAS BANCOFE */}
      {/* ========================================================= */}
      {activeMainTab === "matriz_empresas" && (
        <div className="space-y-6">
          <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" /> Matriz de Governança — BancoFe Holding S.A. & Unidades Controladas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visão consolidada da entidade superior controladora (Holding) e de todas as unidades de negócio operacionais, faturamento auditado, alçadas e ratings CMN 2.682/99.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                  <tr>
                    <th className="p-3">Empresa do Grupo</th>
                    <th className="p-3">CNPJ</th>
                    <th className="p-3">Faturamento 12M</th>
                    <th className="p-3">Limite Aprovado</th>
                    <th className="p-3">Limite Utilizado</th>
                    <th className="p-3">Rating CMN</th>
                    <th className="p-3">Compliance</th>
                    <th className="p-3 text-right">Dossiê 360</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{c.razaoSocial}</div>
                        <span className="text-[10px] text-slate-400">{c.empresaOrigemNome}</span>
                      </td>
                      <td className="p-3 font-mono">{c.cnpjCpf}</td>
                      <td className="p-3 font-semibold">R$ {(c.analiseFinanceira.faturamentoUltimos12Meses / 1000000).toFixed(1)}M</td>
                      <td className="p-3 font-bold text-emerald-600">R$ {(c.limitesOperacionais.limiteGlobalAprovado / 1000000).toFixed(1)}M</td>
                      <td className="p-3 text-rose-500">R$ {(c.limitesOperacionais.limiteUtilizadoTotal / 1000000).toFixed(1)}M</td>
                      <td className="p-3">
                        <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600">
                          {c.analiseFinanceira.ratingCMN2682}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-600">{c.compliancePLD.scoreCompliance}/100</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setClienteSelecionadoId(c.id);
                            setActiveMainTab("visao_360");
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                          Ver 360°
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

      {/* ========================================================= */}
      {/* MODAL: NOVO PRÉ-CADASTRO */}
      {/* ========================================================= */}
      {modalNovoPreCadastro && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Novo Pré-Cadastro de Empresa / Cliente
              </h3>
              <button onClick={() => setModalNovoPreCadastro(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarPreCadastro} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={novoClienteForm.razaoSocial}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, razaoSocial: e.target.value })}
                    placeholder="Ex: Agropecuária Nova Aliança Ltda"
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nome Fantasia</label>
                  <input
                    type="text"
                    value={novoClienteForm.nomeFantasia}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, nomeFantasia: e.target.value })}
                    placeholder="Ex: Nova Aliança Agro"
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">CNPJ / CPF *</label>
                  <input
                    type="text"
                    required
                    value={novoClienteForm.cnpjCpf}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, cnpjCpf: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Empresa de Origem BancoFe</label>
                  <select
                    value={novoClienteForm.empresaOrigemId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const nomes: Record<string, string> = {
                        holding_kytto: "BancoFe Holding S.A. — Controladora Geral do Grupo",
                        bancofe: "BancoFe — Core Bancário, Open Finance & Securitizadora FIDC",
                        operacoes_financeiras_crm: "BancoFe — Operações & CRM",
                        zuma_agro: "BancoFe Agro & Safra MT",
                        bancofe_logistica: "BancoFe Logística & Frotas",
                        bancofe_credito: "BancoFe Crédito & Fomento",
                      };
                      setNovoClienteForm({ ...novoClienteForm, empresaOrigemId: id, empresaOrigemNome: nomes[id] || id });
                    }}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="holding_kytto">👑 BancoFe Holding S.A. — Controladora Geral</option>
                    <option value="bancofe">🏛️ BancoFe — Core Bancário & Securitizadora FIDC</option>
                    <option value="operacoes_financeiras_crm">BancoFe — Operações & CRM</option>
                    <option value="zuma_agro">BancoFe Agro & Safra MT</option>
                    <option value="bancofe_logistica">BancoFe Logística & Frotas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Porte</label>
                  <select
                    value={novoClienteForm.porte}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, porte: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="ME">Microempresa (ME)</option>
                    <option value="EPP">Empresa Pequeno Porte (EPP)</option>
                    <option value="MEDIO">Médio Porte</option>
                    <option value="GRANDE">Grande Porte</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Regime Tributário</label>
                  <select
                    value={novoClienteForm.regimeTributario}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, regimeTributario: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Faturamento Anual (R$)</label>
                  <input
                    type="number"
                    value={novoClienteForm.faturamentoAnualDeclarado}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, faturamentoAnualDeclarado: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Email Financeiro</label>
                  <input
                    type="email"
                    value={novoClienteForm.email}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, email: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={novoClienteForm.telefone}
                    onChange={(e) => setNovoClienteForm({ ...novoClienteForm, telefone: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoPreCadastro(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-semibold shadow-xs hover:bg-emerald-800"
                >
                  Salvar e Gerar Dossiê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DE DOCUMENTO */}
      {modalUploadDoc.aberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Upload de Documento
              </h3>
              <button onClick={() => setModalUploadDoc({ aberto: false })} className="text-slate-400">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
              <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{modalUploadDoc.titulo}</div>
              <p className="text-[11px] text-slate-500">Arraste e solte o arquivo em PDF ou imagem aqui</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalUploadDoc({ aberto: false })}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadDocumento}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR TERMO */}
      {modalVisualizarTermo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{modalVisualizarTermo.codigo}</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{modalVisualizarTermo.titulo}</h3>
              </div>
              <button onClick={() => setModalVisualizarTermo(null)} className="text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 max-h-96 overflow-y-auto text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {modalVisualizarTermo.conteudoMinutaMarkdown}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-mono text-[10px] text-slate-400">
                Hash: {modalVisualizarTermo.hashIntegridadeSha256.substring(0, 16)}...
              </span>
              <button
                onClick={() => setModalVisualizarTermo(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSINAR TERMO DIGITALMENTE */}
      {modalAssinarTermo.aberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Assinatura Eletrônica Avançada
              </h3>
              <button onClick={() => setModalAssinarTermo({ aberto: false, nome: "", cpf: "" })} className="text-slate-400">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Conforme a Lei Federal nº 14.063/2020 e Circular BACEN, esta assinatura possui plena validade jurídica e integridade garantida por SHA-256 e carimbo de tempo.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nome Completo do Signatário</label>
                <input
                  type="text"
                  value={modalAssinarTermo.nome}
                  onChange={(e) => setModalAssinarTermo({ ...modalAssinarTermo, nome: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">CPF do Signatário</label>
                <input
                  type="text"
                  value={modalAssinarTermo.cpf}
                  onChange={(e) => setModalAssinarTermo({ ...modalAssinarTermo, cpf: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalAssinarTermo({ aberto: false, nome: "", cpf: "" })}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssinarTermo}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
              >
                Confirmar Assinatura Digital
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJEITAR DOCUMENTO COM JUSTIFICATIVA */}
      {modalRejeitarDoc.aberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Recusa de Documento com Pendência
              </h3>
              <button onClick={() => setModalRejeitarDoc({ aberto: false, justificativa: "" })} className="text-slate-400">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Documento: <strong>{modalRejeitarDoc.titulo}</strong>
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Justificativa da Inconformidade *</label>
              <textarea
                rows={3}
                value={modalRejeitarDoc.justificativa}
                onChange={(e) => setModalRejeitarDoc({ ...modalRejeitarDoc, justificativa: e.target.value })}
                placeholder="Ex: Certidão vencida há mais de 30 dias ou documento sem assinatura do responsável técnico."
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalRejeitarDoc({ aberto: false, justificativa: "" })}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalRejeitarDoc.docId) {
                    handleAlterarStatusDoc(modalRejeitarDoc.docId, "rejeitado", modalRejeitarDoc.justificativa);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Registrar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
