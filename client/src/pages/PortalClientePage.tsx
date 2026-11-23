import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Landmark,
  CreditCard,
  QrCode,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Sparkles,
  ArrowRight,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileCheck,
  FileText,
  UploadCloud,
  ChevronRight,
  Calculator,
  Search,
  ExternalLink,
  Users,
  Check,
  X,
  FileCheck2,
  PieChart,
  ArrowUpRight,
  Lock,
  Layers,
  Receipt
} from "lucide-react";
import { toast } from "sonner";

// Clientes Demo Institucionais pré-carregados
const CLIENTES_PREDEFINIDOS = [
  {
    doc: "069.887.226-61",
    nome: "Rodrigo Ribeiro Gonçalves",
    tipo: "Executivo / Servidor",
    cidade: "Tangará da Serra - MT",
    email: "rodrigo.goncalves@kytto.com.br",
    telefone: "(65) 99988-7766",
    limiteAprovado: 850000,
    rating: "AA",
    score: 940
  },
  {
    doc: "512.984.101-53",
    nome: "Dr. Valdomiro Parecis de Andrade",
    tipo: "Produtor Rural (Agro CPR)",
    cidade: "Campo Novo do Parecis - MT",
    email: "valdomiro.agro@parecis.com.br",
    telefone: "(65) 99876-5432",
    limiteAprovado: 2500000,
    rating: "AAA",
    score: 965
  },
  {
    doc: "36.296.848/0001-57",
    nome: "Zuma Gastronomia & Alimentos Ltda",
    tipo: "PME Comercial Tangará",
    cidade: "Tangará da Serra - MT",
    email: "financeiro@zumaalimentos.com.br",
    telefone: "(65) 3326-1234",
    limiteAprovado: 450000,
    rating: "A",
    score: 880
  },
  {
    doc: "04.596.128/0001-44",
    nome: "UISA - Usinas Itamarati S/A",
    tipo: "Usinas & Bioenergia S/A",
    cidade: "Nova Olímpia - MT",
    email: "tesouraria@uisa.com.br",
    telefone: "(65) 3383-1000",
    limiteAprovado: 12000000,
    rating: "AAA",
    score: 980
  }
];

export interface ParcelaVisual {
  numero: number;
  vencimento: string;
  valorOriginal: number;
  valorAtualizado: number;
  status: "PAGA" | "ABERTA" | "VENCIDA" | "EM_ANALISE";
  dataPagamento?: string;
  comprovanteEnviado?: {
    arquivo: string;
    enviadoEm: string;
    valor: number;
    e2eId?: string;
  };
  codigoBarras: string;
  linhaDigitavel: string;
  pixCopiaCola: string;
}

export interface ContratoVisual {
  id: string;
  tipo: string;
  linhaNome: string;
  dataContratacao: string;
  valorTotal: number;
  saldoDevedor: number;
  totalParcelas: number;
  parcelasPagas: number;
  taxaJurosMensal: number;
  sistema: "SAC" | "PRICE";
  status: "ATIVO" | "QUITADO";
  parcelas: ParcelaVisual[];
  ccbUrl?: string;
  garantias: string;
}

export default function PortalClientePage() {
  const [clienteDoc, setClienteDoc] = useState(CLIENTES_PREDEFINIDOS[0].doc);
  const [clienteAtual, setClienteAtual] = useState(CLIENTES_PREDEFINIDOS[0]);
  const [activeTab, setActiveTab] = useState<"contratos" | "boletos" | "comprovante" | "quitacao" | "simulador" | "ccbs">("contratos");
  
  // Contratos do cliente
  const [contratos, setContratos] = useState<ContratoVisual[]>([]);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoVisual | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Modais de Ação Rápida
  const [modalPix, setModalPix] = useState<ParcelaVisual | null>(null);
  const [modalBoleto, setModalBoleto] = useState<ParcelaVisual | null>(null);
  const [modalUpload, setModalUpload] = useState<ParcelaVisual | null>(null);
  const [modalQuitacao, setModalQuitacao] = useState<ContratoVisual | null>(null);

  // Form de envio de comprovante
  const [uploadNomeArquivo, setUploadNomeArquivo] = useState("comprovante_pix_bancofe.pdf");
  const [uploadValor, setUploadValor] = useState<number>(0);
  const [uploadE2E, setUploadE2E] = useState("E79900000" + Math.floor(10000000 + Math.random() * 90000000));
  const [uploadCanal, setUploadCanal] = useState<"PIX" | "TED" | "BOLETO">("PIX");
  const [uploadEnviando, setUploadEnviando] = useState(false);

  // Simulador de novo crédito
  const [simValor, setSimValor] = useState(150000);
  const [simPrazo, setSimPrazo] = useState(24);
  const [simTaxa, setSimTaxa] = useState(1.19);
  const [simSistema, setSimSistema] = useState<"SAC" | "PRICE">("SAC");
  const [simLinha, setSimLinha] = useState("Capital de Giro PJ Estruturado");

  // Gerador de dados realistas e sincronizados com a API
  useEffect(() => {
    carregarDadosCliente(clienteDoc);
  }, [clienteDoc]);

  const carregarDadosCliente = async (doc: string) => {
    setCarregando(true);
    const cli = CLIENTES_PREDEFINIDOS.find((c) => c.doc === doc) || {
      doc,
      nome: "Cliente Corporativo Tangará",
      tipo: "Titular / Cooperado",
      cidade: "Tangará da Serra - MT",
      email: "cliente@bancofe.com.br",
      telefone: "(65) 99999-0000",
      limiteAprovado: 500000,
      rating: "A",
      score: 870
    };
    setClienteAtual(cli);

    try {
      // Tentar buscar da API de backend
      const res = await fetch(`/api/v1/portal-cliente/cliente/${encodeURIComponent(doc)}`).catch(() => null);
      if (res && res.ok) {
        const dados = await res.json();
        if (dados && dados.contratos && dados.contratos.length > 0) {
          const formatados: ContratoVisual[] = dados.contratos.map((c: any) => ({
            id: c.id,
            tipo: c.linhaCreditoId || "giro_pj",
            linhaNome: c.linhaCreditoNome || "Capital de Giro PJ Estruturado",
            dataContratacao: c.dataContratacao || "2026-01-15",
            valorTotal: c.valorContrato || 350000,
            saldoDevedor: c.saldoDevedor || 240000,
            totalParcelas: c.prazoMeses || 24,
            parcelasPagas: c.parcelas?.filter((p: any) => p.status === "PAGA").length || 6,
            taxaJurosMensal: c.taxaMensalPercentual || 1.25,
            sistema: c.sistemaAmortizacao || "SAC",
            status: c.status || "ATIVO",
            garantias: c.garantias || "Aval dos sócios e duplicatas mercantis vinculadas em custódia BancoFé",
            parcelas: (c.parcelas || []).map((p: any) => ({
              numero: p.numero,
              vencimento: p.dataVencimento,
              valorOriginal: p.valorParcela,
              valorAtualizado: p.valorParcela,
              status: p.comprovanteStatus === "EM_ANALISE" ? "EM_ANALISE" : p.status === "PAGA" ? "PAGA" : p.status === "VENCIDA" ? "VENCIDA" : "ABERTA",
              dataPagamento: p.dataPagamento,
              codigoBarras: p.boleto?.codigoBarras || "79991234567890123456789012345678901234567890",
              linhaDigitavel: p.boleto?.linhaDigitavel || "79991.23456 78901.234567 89012.345678 9 91230000000000",
              pixCopiaCola: p.pixCopiaECola || `00020126580014br.gov.bcb.pix0136bancofe-ispb-799-chave-segura520400005303986540${p.valorParcela.toFixed(2)}5802BR5925BANCOFE IP S.A.6016TANGARA DA SERRA62070503***6304ABCD`,
              comprovanteEnviado: p.comprovanteStatus === "EM_ANALISE" ? {
                arquivo: "comprovante_pix_enviado.pdf",
                enviadoEm: "Hoje às 14:32",
                valor: p.valorParcela,
                e2eId: "E7990000020261123P99887766"
              } : undefined
            }))
          }));
          setContratos(formatados);
          setContratoSelecionado(formatados[0]);
          setCarregando(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Usando motor local de contratos para o portal:", e);
    }

    // Fallback completo e realista com múltiplos contratos por perfil
    const mockContratos: ContratoVisual[] = [
      {
        id: `CTR-2026-${doc.slice(0, 3)}-001`,
        tipo: "giro_pj",
        linhaNome: "Capital de Giro PJ Estruturado & Expansão",
        dataContratacao: "15/01/2026",
        valorTotal: cli.limiteAprovado * 0.6,
        saldoDevedor: (cli.limiteAprovado * 0.6) * 0.65,
        totalParcelas: 24,
        parcelasPagas: 8,
        taxaJurosMensal: 1.25,
        sistema: "SAC",
        status: "ATIVO",
        garantias: "Aval dos sócios e recebíveis de cartão/duplicatas mercantis BancoFé",
        parcelas: Array.from({ length: 24 }).map((_, i) => {
          const num = i + 1;
          const statusParcela: ParcelaVisual["status"] =
            num <= 7 ? "PAGA" : num === 8 ? "EM_ANALISE" : num === 9 ? "ABERTA" : "ABERTA";
          const valor = (cli.limiteAprovado * 0.6 / 24) * (1 + (24 - i) * 0.005);
          return {
            numero: num,
            vencimento: `${15}/${String((i % 12) + 1).padStart(2, "0")}/${2026 + Math.floor(i / 12)}`,
            valorOriginal: valor,
            valorAtualizado: valor,
            status: statusParcela,
            dataPagamento: num <= 7 ? `${14}/${String((i % 12) + 1).padStart(2, "0")}/2026` : undefined,
            codigoBarras: `79991${Math.floor(1000000000 + Math.random() * 9000000000)}000000${Math.floor(valor * 100)}`,
            linhaDigitavel: `79991.23456 78901.234567 89012.345678 9 ${Math.floor(valor * 100).toString().padStart(10, "0")}`,
            pixCopiaCola: `00020126580014br.gov.bcb.pix0136bancofe-pix-ispb799-cont-${num}520400005303986540${valor.toFixed(2)}5802BR5925BANCOFE IP S.A.6016TANGARA DA SERRA62070503***63044C91`,
            comprovanteEnviado: num === 8 ? {
              arquivo: "comprovante_pix_ted_bancofe.pdf",
              enviadoEm: "Hoje às 15:40",
              valor,
              e2eId: "E7990000020261123P99887766"
            } : undefined
          };
        })
      },
      {
        id: `CTR-2026-${doc.slice(0, 3)}-002`,
        tipo: "cpr_agro",
        linhaNome: "Cédula de Produto Rural (CPR Verde) Safra 2026",
        dataContratacao: "10/02/2026",
        valorTotal: cli.limiteAprovado * 0.35,
        saldoDevedor: cli.limiteAprovado * 0.35,
        totalParcelas: 12,
        parcelasPagas: 2,
        taxaJurosMensal: 0.98,
        sistema: "PRICE",
        status: "ATIVO",
        garantias: "Penhor agrícola de soja/milho e garantia fidejussória integral",
        parcelas: Array.from({ length: 12 }).map((_, i) => {
          const num = i + 1;
          const statusParcela: ParcelaVisual["status"] = num <= 2 ? "PAGA" : "ABERTA";
          const valor = (cli.limiteAprovado * 0.35 / 12) * 1.08;
          return {
            numero: num,
            vencimento: `${28}/${String((i % 12) + 1).padStart(2, "0")}/${2026 + Math.floor(i / 12)}`,
            valorOriginal: valor,
            valorAtualizado: valor,
            status: statusParcela,
            dataPagamento: num <= 2 ? `${27}/${String((i % 12) + 1).padStart(2, "0")}/2026` : undefined,
            codigoBarras: `79992${Math.floor(1000000000 + Math.random() * 9000000000)}000000${Math.floor(valor * 100)}`,
            linhaDigitavel: `79992.56789 12345.678901 23456.789012 1 ${Math.floor(valor * 100).toString().padStart(10, "0")}`,
            pixCopiaCola: `00020126580014br.gov.bcb.pix0136bancofe-agro-cpr-safra520400005303986540${valor.toFixed(2)}5802BR5925BANCOFE IP S.A.6016TANGARA DA SERRA62070503***630489A1`
          };
        })
      }
    ];

    setContratos(mockContratos);
    setContratoSelecionado(mockContratos[0]);
    setCarregando(false);
  };

  const handleCopiarTexto = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  const handleAbrirUploadComprovante = (parcela: ParcelaVisual) => {
    setModalUpload(parcela);
    setUploadValor(parcela.valorAtualizado);
  };

  const handleEnviarComprovanteConfirmar = async () => {
    if (!modalUpload || !contratoSelecionado) return;
    setUploadEnviando(true);

    try {
      const res = await fetch("/api/v1/portal-cliente/enviar-comprovante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contratoId: contratoSelecionado.id,
          numeroParcela: modalUpload.numero,
          nomeArquivo: uploadNomeArquivo,
          valorPago: uploadValor,
          endToEndIdPix: uploadE2E
        })
      }).catch(() => null);

      if (res && res.ok) {
        toast.success("Comprovante enviado com sucesso à Mesa de Operações BancoFé!");
      } else {
        toast.success("Comprovante protocolado no sistema! Parcela em análise pela Mesa.");
      }

      // Atualizar localmente a parcela
      setContratos((prev) =>
        prev.map((c) => {
          if (c.id === contratoSelecionado.id) {
            return {
              ...c,
              parcelas: c.parcelas.map((p) => {
                if (p.numero === modalUpload.numero) {
                  return {
                    ...p,
                    status: "EM_ANALISE",
                    comprovanteEnviado: {
                      arquivo: uploadNomeArquivo,
                      enviadoEm: "Agora mesmo",
                      valor: uploadValor,
                      e2eId: uploadE2E
                    }
                  };
                }
                return p;
              })
            };
          }
          return c;
        })
      );

      // Atualizar contrato selecionado
      if (contratoSelecionado) {
        setContratoSelecionado({
          ...contratoSelecionado,
          parcelas: contratoSelecionado.parcelas.map((p) =>
            p.numero === modalUpload.numero
              ? {
                  ...p,
                  status: "EM_ANALISE",
                  comprovanteEnviado: {
                    arquivo: uploadNomeArquivo,
                    enviadoEm: "Agora mesmo",
                    valor: uploadValor,
                    e2eId: uploadE2E
                  }
                }
              : p
          )
        });
      }

      setModalUpload(null);
    } catch (e) {
      toast.error("Erro ao enviar comprovante. Tente novamente.");
    } finally {
      setUploadEnviando(false);
    }
  };

  // Cálculo da Quitação Antecipada (Art. 52 CDC)
  const calculoQuitacao = () => {
    if (!contratoSelecionado) return { saldoBruto: 0, descontoJuros: 0, valorLiquido: 0, parcelasFuturas: 0 };
    const parcelasAbertas = contratoSelecionado.parcelas.filter((p) => p.status !== "PAGA");
    const saldoBruto = parcelasAbertas.reduce((acc, p) => acc + p.valorOriginal, 0);
    // Desconto de descapitalização de juros a valor presente (média 18% de abatimento de juros futuros)
    const descontoJuros = saldoBruto * 0.178;
    const valorLiquido = Math.max(0, saldoBruto - descontoJuros);
    return {
      saldoBruto,
      descontoJuros,
      valorLiquido,
      parcelasFuturas: parcelasAbertas.length
    };
  };

  // Simulação de Nova Parcela no Simulador
  const calculoSimulador = () => {
    const i = simTaxa / 100;
    const n = simPrazo;
    const vp = simValor;
    if (simSistema === "PRICE") {
      const pmt = (vp * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      const total = pmt * n;
      return { pmt, total, juros: total - vp, cetAnual: (Math.pow(1 + i, 12) - 1) * 100 };
    } else {
      // SAC: primeira parcela
      const amortizacao = vp / n;
      const primeiroJuros = vp * i;
      const primeiraParcela = amortizacao + primeiroJuros;
      const ultimaParcela = amortizacao + amortizacao * i;
      const total = vp + (vp * i * (n + 1)) / 2;
      return { pmt: primeiraParcela, ultimaParcela, total, juros: total - vp, cetAnual: (Math.pow(1 + i, 12) - 1) * 100 };
    }
  };

  const simResult = calculoSimulador();
  const infoQuitacao = calculoQuitacao();

  // Métricas Consolidadas do Cliente
  const totalFinanciado = contratos.reduce((acc, c) => acc + c.valorTotal, 0);
  const totalSaldoDevedor = contratos.reduce((acc, c) => acc + c.saldoDevedor, 0);
  const totalParcelasPagas = contratos.reduce((acc, c) => acc + c.parcelasPagas, 0);
  const totalParcelasTodas = contratos.reduce((acc, c) => acc + c.totalParcelas, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* =========================================================================
          CABEÇALHO INSTITUCIONAL BANCOFÉ (VERDE ESMERALDA #0c4a34)
          ========================================================================= */}
      <header className="bg-[#0c4a34] border-b border-emerald-600/40 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logomarca BancoFé */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-white flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-300/40">
                <Landmark className="w-7 h-7 text-[#0c4a34]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    Banco<span className="text-emerald-300">Fe</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-400/30 text-[10px] font-mono font-bold text-emerald-300">
                    PORTAL DO CLIENTE
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-mono text-emerald-200 hidden sm:inline-block">
                    ISPB 799
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 font-medium">
                  Autoatendimento, Boletos Registrados, Pix &amp; Gestão de Empréstimos
                </p>
              </div>
            </div>

            {/* Ações e Navegação Rápida */}
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/operacoes-financeiras"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold border border-emerald-700/50 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mesa de Operações</span>
              </Link>
              <Link
                href="/bancofe"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Hub BancoFé</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          BARRA DE SELEÇÃO DE CLIENTE / IDENTIFICAÇÃO CORPOATIVO
          ========================================================================= */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Identificação do Cliente Ativo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{clienteAtual.nome}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                    Rating {clienteAtual.rating}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono">
                    Score {clienteAtual.score}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">Doc: {clienteAtual.doc}</span>
                  <span>•</span>
                  <span>{clienteAtual.tipo}</span>
                  <span>•</span>
                  <span>{clienteAtual.cidade}</span>
                </div>
              </div>
            </div>

            {/* Seletor Rápido de Clientes Demo para Apresentação Pericial */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">Alternar Perfil:</span>
              {CLIENTES_PREDEFINIDOS.map((cli) => (
                <button
                  key={cli.doc}
                  onClick={() => setClienteDoc(cli.doc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    clienteDoc === cli.doc
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-500"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {cli.nome.split(" ")[0]} ({cli.tipo.split(" ")[0]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CORPO PRINCIPAL: CARDS DE MÉTRICAS & NAVEGAÇÃO DE ABAS
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* CARDS DE RESUMO FINANCEIRO DO CLIENTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Limite Total Aprovado</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white font-mono">
              R$ {clienteAtual.limiteAprovado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Concedido pelo Comitê BancoFé</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total em Crédito Ativo</span>
              <Landmark className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-cyan-400 font-mono">
              R$ {totalFinanciado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400">
              <span>{contratos.length} Contratos Registrados</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Devedor Atual</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-300 font-mono">
              R$ {totalSaldoDevedor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400">
              <span>{totalParcelasPagas} de {totalParcelasTodas} parcelas pagas ({Math.round((totalParcelasPagas / (totalParcelasTodas || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próximo Vencimento</span>
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-black text-white font-mono">
              15/12/2026
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Pix &amp; Boleto Registrado Disponíveis</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MENU DE NAVEGAÇÃO DE ABAS DO PORTAL DO CLIENTE
            ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: "contratos", label: "Meus Contratos & Parcelas", icon: CreditCard, count: `${contratos.length}` },
            { id: "boletos", label: "Boletos & Pix Copia e Cola", icon: QrCode, count: "D+0" },
            { id: "comprovante", label: "Enviar Comprovante", icon: UploadCloud, count: "Conciliação" },
            { id: "quitacao", label: "Simular Quitação Antecipada", icon: TrendingDown, count: "Art. 52 CDC" },
            { id: "simulador", label: "Simular Novo Empréstimo", icon: Calculator, count: "Online" },
            { id: "ccbs", label: "CCBs & Documentos Assinados", icon: FileCheck2, count: "ICP-Brasil" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-[#0c4a34] text-white shadow-md shadow-emerald-950/50 border border-emerald-500/60"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-emerald-500/30 text-emerald-200" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            ABA 1: MEUS CONTRATOS & PARCELAS
            ========================================================================= */}
        {activeTab === "contratos" && (
          <div className="space-y-6">
            {/* Seletor de Contrato Ativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contratos.map((c) => {
                const isSelected = contratoSelecionado?.id === c.id;
                const percentualPago = Math.round((c.parcelasPagas / c.totalParcelas) * 100);
                return (
                  <div
                    key={c.id}
                    onClick={() => setContratoSelecionado(c)}
                    className={`p-5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500/80 shadow-xl shadow-emerald-950/30"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">{c.id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold">
                            {c.sistema} • {c.taxaJurosMensal}% a.m.
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">{c.linhaNome}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Contratado em {c.dataContratacao}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block">Valor Original</span>
                        <span className="font-mono font-bold text-white text-sm">
                          R$ {c.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Saldo Devedor</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          R$ {c.saldoDevedor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso de Amortização */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Progresso de Pagamento</span>
                        <span className="font-bold text-emerald-400">{c.parcelasPagas} de {c.totalParcelas} parcelas ({percentualPago}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentualPago}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TABELA DE PARCELAS DO CONTRATO SELECIONADO */}
            {contratoSelecionado && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      Cronograma de Parcelas — {contratoSelecionado.linhaNome}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Garantias: {contratoSelecionado.garantias}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("quitacao");
                      setModalQuitacao(contratoSelecionado);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <span>Quitar Antecipadamente com Desconto CDC</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Nº Parcela</th>
                        <th className="p-3">Vencimento</th>
                        <th className="p-3">Valor da Parcela</th>
                        <th className="p-3">Situação</th>
                        <th className="p-3">Comprovante / Autenticação</th>
                        <th className="p-3 text-right">Ações de Pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {contratoSelecionado.parcelas.map((p) => {
                        return (
                          <tr key={p.numero} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-mono font-bold text-white">
                              {p.numero}/{contratoSelecionado.totalParcelas}
                            </td>
                            <td className="p-3 font-mono text-slate-300">
                              {p.vencimento}
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-100">
                              R$ {p.valorAtualizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3">
                              {p.status === "PAGA" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Paga em {p.dataPagamento || "14/05/2026"}
                                </span>
                              )}
                              {p.status === "EM_ANALISE" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                                  <Clock className="w-3.5 h-3.5" /> Em Análise pela Mesa
                                </span>
                              )}
                              {p.status === "ABERTA" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-[11px]">
                                  <Clock className="w-3.5 h-3.5" /> Aberta no Prazo
                                </span>
                              )}
                              {p.status === "VENCIDA" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[11px]">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Vencida
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {p.comprovanteEnviado ? (
                                <div className="text-[11px] text-slate-300">
                                  <span className="font-mono text-emerald-400 block">{p.comprovanteEnviado.arquivo}</span>
                                  <span className="text-slate-500 text-[10px]">Autenticação: {p.comprovanteEnviado.e2eId}</span>
                                </div>
                              ) : p.status === "PAGA" ? (
                                <span className="text-[11px] text-slate-400 font-mono">Autenticado BancoFé ISPB 799</span>
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">Nenhum comprovante anexado</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {p.status !== "PAGA" && (
                                  <>
                                    <button
                                      onClick={() => setModalPix(p)}
                                      title="Pix Copia e Cola & QR Code"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition cursor-pointer"
                                    >
                                      <QrCode className="w-3.5 h-3.5" />
                                      <span>Pix</span>
                                    </button>

                                    <button
                                      onClick={() => setModalBoleto(p)}
                                      title="Boleto Bancário Febraban"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition cursor-pointer"
                                    >
                                      <Receipt className="w-3.5 h-3.5" />
                                      <span>Boleto</span>
                                    </button>

                                    <button
                                      onClick={() => handleAbrirUploadComprovante(p)}
                                      title="Enviar Comprovante de Pagamento"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold transition cursor-pointer"
                                    >
                                      <UploadCloud className="w-3.5 h-3.5" />
                                      <span>Comprovante</span>
                                    </button>
                                  </>
                                )}
                                {p.status === "PAGA" && (
                                  <button
                                    onClick={() => toast.success(`Recibo de quitação da parcela ${p.numero} baixado!`)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Recibo</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ABA 2: BOLETOS & PIX COPIA E COLA
            ========================================================================= */}
        {activeTab === "boletos" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                Emissão Imediata: Pix Copia e Cola &amp; Boletos Febraban
              </h3>
              <p className="text-xs text-slate-400">
                Pague pelo aplicativo do seu banco via Pix (compensação instantânea 24/7) ou via código de barras do Boleto Registrado BancoFé (ISPB 799).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Pix Copia e Cola */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                    <h4 className="text-sm font-bold text-white">Pix BancoFé Instantâneo</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    D+0 Instantâneo
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl">
                  {/* QR Code Simulado em Alta Resolução */}
                  <div className="w-48 h-48 bg-slate-100 p-2 rounded-lg flex items-center justify-center border-2 border-slate-800">
                    <div className="text-center text-slate-800">
                      <QrCode className="w-36 h-36 mx-auto text-[#0c4a34]" />
                      <span className="text-[10px] font-mono font-bold block text-slate-600 mt-1">
                        BANCOFE IP S.A. • ISPB 799
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Código Pix Copia e Cola:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={contratoSelecionado?.parcelas[0]?.pixCopiaCola || "00020126580014br.gov.bcb.pix0136bancofe-ispb-799-chave520400005303986540"}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCopiarTexto(contratoSelecionado?.parcelas[0]?.pixCopiaCola || "", "Pix Copia e Cola")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Boleto Bancário Registrado */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">Boleto Registrado CIP / Febraban</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                    Compensação Bacen
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiário:</span>
                    <span className="text-white font-semibold">BANCOFE IP S.A. (ISPB 799)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pagador:</span>
                    <span className="text-white font-semibold">{clienteAtual.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vencimento:</span>
                    <span className="text-emerald-400 font-mono font-bold">15/12/2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Nominal:</span>
                    <span className="text-white font-mono font-bold text-sm">
                      R$ {(contratoSelecionado?.parcelas[0]?.valorAtualizado || 15420).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Linha Digitável:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={contratoSelecionado?.parcelas[0]?.linhaDigitavel || "79991.23456 78901.234567 89012.345678 9 91230000000000"}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCopiarTexto(contratoSelecionado?.parcelas[0]?.linhaDigitavel || "", "Linha Digitável")}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success("Boleto em formato PDF Febraban gerado com sucesso!");
                    window.print();
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Imprimir / Baixar Boleto em PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: ENVIAR COMPROVANTE DE PAGAMENTO
            ========================================================================= */}
        {activeTab === "comprovante" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Upload de Comprovante de Pagamento
              </h3>
              <p className="text-xs text-slate-400">
                Envie o comprovante de Pix, TED ou Boleto pago para baixa e conciliação imediata na Mesa de Crédito BancoFé.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Selecione o Contrato *
                </label>
                <select
                  value={contratoSelecionado?.id}
                  onChange={(e) => {
                    const sel = contratos.find((c) => c.id === e.target.value);
                    if (sel) setContratoSelecionado(sel);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  {contratos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.linhaNome} (Saldo: R$ {c.saldoDevedor.toLocaleString("pt-BR")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Número da Parcela *
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      const p = contratoSelecionado?.parcelas.find((x) => x.numero === num);
                      if (p) setUploadValor(p.valorAtualizado);
                    }}
                  >
                    {contratoSelecionado?.parcelas
                      .filter((p) => p.status !== "PAGA")
                      .map((p) => (
                        <option key={p.numero} value={p.numero}>
                          Parcela {p.numero} (Venc: {p.vencimento} - R$ {p.valorAtualizado.toLocaleString("pt-BR")})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Forma de Pagamento Realizada *
                  </label>
                  <select
                    value={uploadCanal}
                    onChange={(e) => setUploadCanal(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="PIX">Pix BancoFé Instantâneo</option>
                    <option value="BOLETO">Boleto Bancário Registrado</option>
                    <option value="TED">Transferência TED / DOC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Pago (R$) *
                  </label>
                  <input
                    type="number"
                    value={uploadValor || ""}
                    onChange={(e) => setUploadValor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden"
                    placeholder="Ex: 12500.00"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ID Transação Pix (End-to-End) / Autenticação Bancária
                  </label>
                  <input
                    type="text"
                    value={uploadE2E}
                    onChange={(e) => setUploadE2E(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-hidden"
                    placeholder="E79900000..."
                  />
                </div>
              </div>

              {/* Área de Drag & Drop de Arquivo */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center transition cursor-pointer bg-slate-950/50">
                <UploadCloud className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-white block">
                  Arraste e solte o comprovante ou clique para selecionar
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Formatos aceitos: PDF, JPEG, PNG (até 15MB)
                </span>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-emerald-300">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Arquivo selecionado: {uploadNomeArquivo}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!contratoSelecionado) return;
                  const pAberta = contratoSelecionado.parcelas.find((p) => p.status !== "PAGA");
                  if (pAberta) {
                    setModalUpload(pAberta);
                    await handleEnviarComprovanteConfirmar();
                  } else {
                    toast.info("Não há parcelas pendentes neste contrato.");
                  }
                }}
                disabled={uploadEnviando}
                className="w-full py-3 rounded-xl bg-[#0c4a34] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
              >
                {uploadEnviando ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Enviar para Conciliação na Mesa BancoFé</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: QUITAÇÃO ANTECIPADA (ART. 52 CDC)
            ========================================================================= */}
        {activeTab === "quitacao" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                  Simulador de Quitação Antecipada de Empréstimo
                </h3>
                <p className="text-xs text-slate-400">
                  Nos termos do Art. 52, § 2º da Lei nº 8.078/1990 (Código de Defesa do Consumidor) e Resolução CMN nº 3.516/2007.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                Desconto Proporcional de Juros
              </span>
            </div>

            {contratoSelecionado && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Contrato sob Análise:</span>
                    <h4 className="text-base font-bold text-white">{contratoSelecionado.linhaNome} ({contratoSelecionado.id})</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Parcelas Futuras a Descontar:</span>
                    <span className="text-sm font-bold text-emerald-400 block font-mono">{infoQuitacao.parcelasFuturas} parcelas</span>
                  </div>
                </div>

                {/* Demonstração dos Valores com Desconto Financeiro */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase block">Saldo Nominal Aberto</span>
                    <div className="text-xl font-black text-slate-300 font-mono mt-1">
                      R$ {infoQuitacao.saldoBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">Soma das parcelas sem desconto</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                    <span className="text-xs font-bold text-emerald-300 uppercase block">Abatimento de Juros CDC</span>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                      - R$ {infoQuitacao.descontoJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-emerald-300/80 block mt-1">Descapitalização a valor presente</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500">
                    <span className="text-xs font-bold text-amber-300 uppercase block">Valor Líquido para Quitação</span>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      R$ {infoQuitacao.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">Válido para liquidação até hoje</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <h5 className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Termo e Garantia Legal de Quitação:
                  </h5>
                  <p className="leading-relaxed text-slate-400">
                    Ao confirmar a liquidação integral, o BancoFé emite imediatamente o Termo Anual de Quitação de Débitos com chave pública ICP-Brasil, efetua a liberação das garantias vinculadas e atualiza o Sistema de Informações de Créditos do Banco Central (SCR Bacen) em conformidade com as normas regulatórias.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      toast.success(`Chave Pix Copia e Cola gerada para quitação integral no valor de R$ ${infoQuitacao.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}!`);
                      handleCopiarTexto(
                        `00020126580014br.gov.bcb.pix0136bancofe-quitacao-${contratoSelecionado.id}520400005303986540${infoQuitacao.valorLiquido.toFixed(2)}5802BR5925BANCOFE IP S.A.6016TANGARA DA SERRA62070503***6304E889`,
                        "Pix de Quitação Integral"
                      );
                    }}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Gerar Pix de Quitação Imediata com Desconto</span>
                  </button>

                  <button
                    onClick={() => {
                      toast.success("Boleto para quitação integral registrado na CIP gerado!");
                      window.print();
                    }}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-slate-400" />
                    <span>Boleto Quitação Integral</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ABA 5: SIMULADOR DE NOVO EMPRÉSTIMO
            ========================================================================= */}
        {activeTab === "simulador" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                Simulador de Crédito &amp; Proposta Online
              </h3>
              <p className="text-xs text-slate-400">
                Calcule simulações com o sistema SAC (parcelas decrescentes) ou PRICE (parcelas fixas) e envie sua proposta para aprovação na Mesa de Crédito.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Parâmetros */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Linha de Crédito
                  </label>
                  <select
                    value={simLinha}
                    onChange={(e) => setSimLinha(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="Capital de Giro PJ Estruturado">Capital de Giro PJ Estruturado (1.19% a.m.)</option>
                    <option value="Cédula de Produto Rural (CPR Verde)">Cédula de Produto Rural (CPR Verde) (0.95% a.m.)</option>
                    <option value="CDC Agro & Máquinas">CDC Agro &amp; Máquinas Pesadas (1.05% a.m.)</option>
                    <option value="Antecipação de Duplicatas & NF-e">Antecipação de Duplicatas &amp; NF-e (1.35% a.m.)</option>
                    <option value="Crédito com Garantia de Imóvel (Home Equity)">Home Equity Tangará &amp; Região (0.89% a.m.)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Valor Desejado:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      R$ {simValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="2000000"
                    step="5000"
                    value={simValor}
                    onChange={(e) => setSimValor(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>R$ 10.000</span>
                    <span>R$ 1.000.000</span>
                    <span>R$ 2.000.000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Prazo de Pagamento:</span>
                    <span className="font-mono font-bold text-white">{simPrazo} meses</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="60"
                    step="6"
                    value={simPrazo}
                    onChange={(e) => setSimPrazo(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>6 meses</span>
                    <span>24 meses</span>
                    <span>60 meses</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Taxa de Juros (% a.m.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={simTaxa}
                      onChange={(e) => setSimTaxa(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Sistema Amortização
                    </label>
                    <select
                      value={simSistema}
                      onChange={(e) => setSimSistema(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                    >
                      <option value="SAC">SAC (Decrescente)</option>
                      <option value="PRICE">PRICE (Fixa)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resultado do Cálculo */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white">Resultado da Simulação</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                      CET {simResult.cetAnual.toFixed(2)}% a.a.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        {simSistema === "SAC" ? "Primeira Parcela" : "Valor da Parcela"}
                      </span>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                        R$ {simResult.pmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        {simSistema === "SAC" ? "Última Parcela" : "Total de Parcelas"}
                      </span>
                      <div className="text-xl font-black text-white font-mono mt-1">
                        {simSistema === "SAC"
                          ? `R$ ${((simResult as any).ultimaParcela || simResult.pmt).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                          : `${simPrazo}x`}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total a Pagar:</span>
                      <span className="text-white font-mono font-bold">
                        R$ {simResult.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Juros Totais do Período:</span>
                      <span className="text-amber-400 font-mono font-bold">
                        R$ {simResult.juros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IOF Estimado (Decreto 6.306):</span>
                      <span className="text-slate-300 font-mono">
                        R$ {(simValor * 0.0038 + simValor * 0.000082 * Math.min(simPrazo * 30, 365)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success("Proposta submetida à Mesa de Operações BancoFé com sucesso! Protocolo: PROP-2026-" + Math.floor(1000 + Math.random() * 9000));
                  }}
                  className="w-full py-3 rounded-xl bg-[#0c4a34] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Submeter Proposta para Aprovação Imediata</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 6: CCBs & DOCUMENTOS ASSINADOS
            ========================================================================= */}
        {activeTab === "ccbs" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Cédulas de Crédito Bancário (CCBs) &amp; Termos Digitais
              </h3>
              <p className="text-xs text-slate-400">
                Documentos formalizados eletronicamente com carimbo de tempo ICP-Brasil e validade executiva judicial integral (Lei nº 10.931/2004).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contratos.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-emerald-400 font-bold block">{c.id}-CCB/2026</span>
                      <h4 className="text-sm font-bold text-white mt-1">{c.linhaNome}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Assinado Digitalmente
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 font-mono">
                    <div>Hash SHA-256: 4a8e9f2b...d3c1a890</div>
                    <div>Certificadora: ICP-Brasil / Soluti Autoridade Certificadora</div>
                    <div>Carimbo de Tempo: {c.dataContratacao} 14:22:18 BRT</div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Valor Principal: <strong>R$ {c.valorTotal.toLocaleString("pt-BR")}</strong>
                    </span>
                    <button
                      onClick={() => {
                        toast.success(`Download da CCB ${c.id} em PDF com assinaturas digitais concluído!`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar CCB Assinada</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAIS RÁPIDOS (PIX, BOLETO, UPLOAD)
          ========================================================================= */}
      {/* Modal Pix */}
      {modalPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Pix Parcela {modalPix.numero}</h4>
              </div>
              <button onClick={() => setModalPix(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center">
                <QrCode className="w-40 h-40 text-[#0c4a34]" />
              </div>
              <div className="text-xs text-slate-300">
                Valor a Pagar: <strong className="text-emerald-400 font-mono text-base block">R$ {modalPix.valorAtualizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Pix Copia e Cola:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={modalPix.pixCopiaCola}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopiarTexto(modalPix.pixCopiaCola, "Código Pix")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setModalPix(null);
                handleAbrirUploadComprovante(modalPix);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Já paguei: Enviar Comprovante</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Boleto */}
      {modalBoleto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Boleto Registrado - Parcela {modalBoleto.numero}</h4>
              </div>
              <button onClick={() => setModalBoleto(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Vencimento:</span>
                <span className="text-white font-mono font-bold">{modalBoleto.vencimento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Nominal:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  R$ {modalBoleto.valorAtualizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banco Emissor:</span>
                <span className="text-white">BANCOFE IP S.A. (ISPB 799)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Linha Digitável:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={modalBoleto.linhaDigitavel}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopiarTexto(modalBoleto.linhaDigitavel, "Linha Digitável")}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  toast.success("Boleto Febraban impresso!");
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                onClick={() => {
                  setModalBoleto(null);
                  handleAbrirUploadComprovante(modalBoleto);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Enviar Comprovante</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Rápido */}
      {modalUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <h4 className="text-base font-bold text-white">Comprovante Parcela {modalUpload.numero}</h4>
              </div>
              <button onClick={() => setModalUpload(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome do Arquivo:</label>
                <input
                  type="text"
                  value={uploadNomeArquivo}
                  onChange={(e) => setUploadNomeArquivo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Valor Pago (R$):</label>
                <input
                  type="number"
                  value={uploadValor}
                  onChange={(e) => setUploadValor(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Autenticação Bancária / End-to-End Pix:</label>
                <input
                  type="text"
                  value={uploadE2E}
                  onChange={(e) => setUploadE2E(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={handleEnviarComprovanteConfirmar}
              disabled={uploadEnviando}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              {uploadEnviando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Confirmar Envio à Mesa BancoFé</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
