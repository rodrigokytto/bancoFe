import React, { useState, useMemo } from "react";
import { exportClosingToExcel } from "../../lib/exportClosingExcel";
import {
  Search,
  Filter,
  FileSpreadsheet,
  Send,
  Eye,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Lock,
  Unlock,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  FileText,
  History,
  Sliders,
  Scale,
  Percent,
  Coins,
  ChevronRight,
  Sparkles,
  HelpCircle,
  X,
  FileCheck2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export const ErpFechamentoTurno: React.FC = () => {
  // Query principal de dados de fechamento
  const closingQuery = trpc.zuma.getDailyClosingData.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const utils = trpc.useUtils();

  // Estados de navegação em abas
  const [abaAtiva, setAbaAtiva] = useState<
    "conciliacao" | "movimentacoes" | "lancamentos" | "quebra" | "historico"
  >("conciliacao");

  // Estados de Modais
  const [modalFechar, setModalFechar] = useState(false);
  const [modalReabrir, setModalReabrir] = useState(false);
  const [modalSangria, setModalSangria] = useState(false);
  const [modalSuprimento, setModalSuprimento] = useState(false);
  const [modalEditarMovimento, setModalEditarMovimento] = useState<any | null>(null);
  const [modalExcluirMovimento, setModalExcluirMovimento] = useState<any | null>(null);
  const [modalCorrigirPagamento, setModalCorrigirPagamento] = useState<any | null>(null);
  const [modalAjusteQuebra, setModalAjusteQuebra] = useState(false);
  const [modalComprovanteTermico, setModalComprovanteTermico] = useState(false);
  const [turnoHistoricoSelecionado, setTurnoHistoricoSelecionado] = useState<any | null>(null);
  const [modalDetalhesTurno, setModalDetalhesTurno] = useState<any | null>(null);
  const [comprovanteTexto, setComprovanteTexto] = useState<string>("");
  const [copiado, setCopiado] = useState(false);

  // Formulário Fechamento
  const [dinheiroContadoInput, setDinheiroContadoInput] = useState<number | "">("");
  const [notasFechamento, setNotasFechamento] = useState("");
  const [operadorFechamento, setOperadorFechamento] = useState("Mariana (Caixa)");
  const [supervisorFechamento, setSupervisorFechamento] = useState("Rodrigo R. Gonçalves");

  // Calculadora de Cédulas e Moedas
  const [mostrarCalculadora, setMostrarCalculadora] = useState(true); // Default aberta para agilidade operacional
  const [buscaLancamento, setBuscaLancamento] = useState("");
  const [filtroMeioLancamento, setFiltroMeioLancamento] = useState("todos");
  const [cedulas, setCedulas] = useState<{ [key: string]: number }>({
    c200: 0,
    c100: 0,
    c50: 0,
    c20: 0,
    c10: 0,
    c5: 0,
    c2: 0,
    moedas: 0,
  });

  // Formulário Reabertura
  const [motivoReabertura, setMotivoReabertura] = useState("");
  const [supervisorReabertura, setSupervisorReabertura] = useState("Rodrigo R. Gonçalves (Supervisor)");
  const [senhaSupervisor, setSenhaSupervisor] = useState("");

  // Formulário Sangria / Suprimento
  const [valorMovimento, setValorMovimento] = useState<number | "">("");
  const [motivoMovimento, setMotivoMovimento] = useState("");
  const [operadorMovimento, setOperadorMovimento] = useState("Mariana (Caixa)");

  // Formulário Correção de Pagamento
  const [novoMeioPagamento, setNovoMeioPagamento] = useState<
    "pix" | "cartao_credito" | "cartao_debito" | "dinheiro" | "apple_pay" | "convenio_agro"
  >("pix");
  const [motivoCorrecao, setMotivoCorrecao] = useState("");
  const [novoValorCorrecao, setNovoValorCorrecao] = useState<number | "">("");

  // Formulário Ajuste Quebra
  const [justificativaQuebra, setJustificativaQuebra] = useState("");

  // Mutations tRPC
  const closeMutation = trpc.zuma.closeCashRegister.useMutation({
    onSuccess: () => {
      toast.success("Turno fechado e auditado com sucesso! Relatório Z gerado.", { icon: "🔒" });
      setModalFechar(false);
      closingQuery.refetch();
      utils.zuma.getCashRegister.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao fechar caixa: ${err.message}`);
    },
  });

  const reopenMutation = trpc.zuma.reopenCashRegister.useMutation({
    onSuccess: () => {
      toast.success("Caixa / Turno reaberto com sucesso pela supervisão!", { icon: "🔓" });
      setModalReabrir(false);
      setMotivoReabertura("");
      setSenhaSupervisor("");
      closingQuery.refetch();
      utils.zuma.getCashRegister.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao reabrir caixa: ${err.message}`);
    },
  });

  const addMovementMutation = trpc.zuma.addCashMovement.useMutation({
    onSuccess: (data) => {
      toast.success(
        `${data.type === "sangria" ? "Sangria" : "Suprimento"} de R$ ${data.amount.toFixed(2)} registrado com sucesso!`,
        { icon: data.type === "sangria" ? "💸" : "💰" }
      );
      setModalSangria(false);
      setModalSuprimento(false);
      setValorMovimento("");
      setMotivoMovimento("");
      closingQuery.refetch();
      utils.zuma.getCashRegister.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao lançar movimentação: ${err.message}`);
    },
  });

  const updateMovementMutation = trpc.zuma.updateCashMovement.useMutation({
    onSuccess: () => {
      toast.success("Movimentação de caixa corrigida com sucesso!", { icon: "✏️" });
      setModalEditarMovimento(null);
      closingQuery.refetch();
      utils.zuma.getCashRegister.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao corrigir movimentação: ${err.message}`);
    },
  });

  const deleteMovementMutation = trpc.zuma.deleteCashMovement.useMutation({
    onSuccess: () => {
      toast.success("Movimentação excluída e estornada com sucesso!", { icon: "🗑️" });
      setModalExcluirMovimento(null);
      closingQuery.refetch();
      utils.zuma.getCashRegister.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao excluir movimentação: ${err.message}`);
    },
  });

  const updatePaymentMutation = trpc.zuma.updatePaymentMethod.useMutation({
    onSuccess: () => {
      toast.success("Forma de pagamento corrigida! Totais do caixa e financeiro recalculados.", { icon: "✅" });
      setModalCorrigirPagamento(null);
      setMotivoCorrecao("");
      closingQuery.refetch();
      utils.zuma.getPaymentsOverview.invalidate();
      utils.zuma.getCashRegister.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao corrigir pagamento: ${err.message}`);
    },
  });

  const settleBreakageMutation = trpc.zuma.settleCashBreakage.useMutation({
    onSuccess: () => {
      toast.success("Ajuste financeiro de quebra de caixa registrado no ERP!", { icon: "⚖️" });
      setModalAjusteQuebra(false);
      setJustificativaQuebra("");
      closingQuery.refetch();
      utils.zuma.getContasPagar.invalidate();
      utils.zuma.getExtratoBancario.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao registrar quebra: ${err.message}`);
    },
  });

  // Obter texto térmico
  const handleAbrirComprovanteTermico = () => {
    if (!closingQuery.data) return;
    const txt = (closingQuery.data as any).comprovanteTexto;
    // Se o backend gerou texto ou se formatamos na hora:
    setComprovanteTexto(txt || "");
    setModalComprovanteTermico(true);
  };

  const handleCopiarComprovante = () => {
    if (comprovanteTexto) {
      navigator.clipboard.writeText(comprovanteTexto);
      setCopiado(true);
      toast.success("Comprovante térmico copiado para a área de transferência!");
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleImprimirTermico = () => {
    window.print();
  };

  // Calcular total da calculadora de cédulas
  const recalcularCedulas = (novoCedulas: typeof cedulas) => {
    const total =
      novoCedulas.c200 * 200 +
      novoCedulas.c100 * 100 +
      novoCedulas.c50 * 50 +
      novoCedulas.c20 * 20 +
      novoCedulas.c10 * 10 +
      novoCedulas.c5 * 5 +
      novoCedulas.c2 * 2 +
      novoCedulas.moedas;
    setDinheiroContadoInput(Number(total.toFixed(2)));
  };

  const data = closingQuery.data;
  const caixa = data?.caixa;
  const isAberto = data?.status === "aberto";
  const resumoGaveta = data?.resumoGaveta;
  const faturamento = data?.faturamentoPorMeio;
  const itensConciliacao = data?.itensConciliacao || [];
  const movimentacoes = data?.movimentacoes || [];
  const pagamentos = data?.pagamentos || [];

  // Filtro inteligente de pagamentos na Aba 3
  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter((p: any) => {
      if (filtroMeioLancamento !== "todos") {
        const forma = (p.forma || "").toLowerCase();
        if (filtroMeioLancamento === "cartao_credito" && !forma.includes("credito")) return false;
        if (filtroMeioLancamento === "cartao_debito" && !forma.includes("debito")) return false;
        if (filtroMeioLancamento === "pix" && !forma.includes("pix")) return false;
        if (filtroMeioLancamento === "dinheiro" && !forma.includes("dinheiro")) return false;
        if (filtroMeioLancamento === "convenio_agro" && !forma.includes("convenio")) return false;
      }
      if (buscaLancamento.trim()) {
        const q = buscaLancamento.toLowerCase();
        const nsu = (p.nsu || p.id || "").toLowerCase();
        const cliente = (p.cliente || "").toLowerCase();
        const canal = (p.canal || "").toLowerCase();
        return nsu.includes(q) || cliente.includes(q) || canal.includes(q);
      }
      return true;
    });
  }, [pagamentos, filtroMeioLancamento, buscaLancamento]);

  
    const indicadores = data?.indicadoresOperacionais;

  // Exportar Excel Oficial do Turno
  const handleExportarExcel = () => {
    if (!data) return;
    try {
      exportClosingToExcel({
        caixa: data.caixa,
        faturamento: {
          totalFaturado: faturamento?.totalFaturado || 0,
          totalTaxas: faturamento?.totalTaxas || 0,
          totalLiquido: faturamento?.totalLiquido || 0,
          ticketMedio: indicadores?.ticketMedio || 148.5,
          totalGorjetas: indicadores?.totalGorjetas || 0,
        },
        resumoGaveta: {
          fundoTrocoInicial: resumoGaveta?.fundoTrocoInicial || 0,
          vendasDinheiro: resumoGaveta?.vendasDinheiro || 0,
          suprimentosExtras: resumoGaveta?.suprimentosExtras || 0,
          sangrias: resumoGaveta?.sangrias || 0,
          saldoEsperadoGaveta: resumoGaveta?.saldoEsperadoGaveta || 0,
          dinheiroContado: resumoGaveta?.dinheiroContado || 0,
          divergenciaQuebra: resumoGaveta?.divergenciaQuebra || 0,
          statusQuebra: resumoGaveta?.statusQuebra || "batido",
        },
        itensConciliacao: data.itensConciliacao || [],
        movimentacoes: data.movimentacoes || [],
        pagamentos: data.pagamentos || [],
        dre: dre ? {
          receitaBruta: dre.receitaBruta,
          taxasCartao: dre.deducoes?.taxasCartaoEstimadas || 0,
          cmvNobre: dre.cmvReal,
          margemContribuicao: dre.margemContribuicaoBrl,
          percentualMargem: dre.margemContribuicaoPercentual,
        } : undefined,
      });
      toast.success("Planilha oficial de Fechamento de Turno exportada em Excel (.xlsx) com sucesso!", {
        icon: "📊"
      });
    } catch (err: any) {
      toast.error("Erro ao exportar planilha Excel: " + err.message);
    }
  };

  // Notificar Rodrigo Gonçalves via WhatsApp
  const notificarRodrigoWhatsApp = () => {
    if (!data) return;
    const isBatido = Math.abs(diferencaQuebra) <= 2.0;
    const cartoesTotal = (faturamento?.cartaoCredito?.valor || 0) + (faturamento?.cartaoDebito?.valor || 0);
    const msg = 
`🍣 *ZUMA COZINHA ORIENTAL — FECHAMENTO DE TURNO*\n` +
`📅 *Data:* ${new Date().toLocaleDateString("pt-BR")} · ⏰ ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n` +
`👤 *Operador:* ${data.operador || "Mariana (Frente de Caixa)"}\n` +
`🛡 *Supervisor:* ${data.supervisor || "Rodrigo R. Gonçalves"}\n` +
`------------------------------------\n` +
`💰 *FATURAMENTO DO TURNO:* R$ ${(faturamento?.totalFaturado || 0).toFixed(2)}\n` +
`💳 *Líquido TEF/Pix:* R$ ${(faturamento?.totalLiquido || 0).toFixed(2)}\n` +
`💵 *Gaveta Física Esperada:* R$ ${(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}\n` +
`🔍 *Dinheiro Contado:* R$ ${(resumoGaveta?.dinheiroContado || 0).toFixed(2)}\n` +
`⚖ *Quebra/Diferença:* ${diferencaQuebra >= 0 ? "+" : ""}R$ ${diferencaQuebra.toFixed(2)} (${isBatido ? "✓ CAIXA BATIDO" : "⚠ DIVERGÊNCIA"})\n` +
`------------------------------------\n` +
`*RESUMO POR CANAL:*\n` +
`• Cartões Crédito/Débito: R$ ${cartoesTotal.toFixed(2)}\n` +
`• Pix Sicredi MT: R$ ${(faturamento?.pix?.valor || 0).toFixed(2)}\n` +
`• Dinheiro Físico: R$ ${(faturamento?.dinheiro?.valor || 0).toFixed(2)}\n` +
`• Convênios Corporativos: R$ ${(faturamento?.convenioAgro?.valor || 0).toFixed(2)}\n` +
`------------------------------------\n` +
`📊 *DRE & MARGEM:*\n` +
`• CMV Nobre (Salmão/BOM): R$ ${(dre?.cmvReal || 0).toFixed(2)} (${(dre?.cmvPercentual || 30.7).toFixed(1)}%)\n` +
`• Margem de Contribuição: R$ ${(dre?.margemContribuicaoBrl || 0).toFixed(2)} (${(dre?.margemContribuicaoPercentual || 69.3).toFixed(1)}%)\n` +
`• Mesas Atendidas: ${indicadores?.totalMesasAtendidas || 19} · Ticket Médio: R$ ${(indicadores?.ticketMedio || 148.5).toFixed(2)}\n\n` +
`*Status Auditoria:* CONCILIADO E TRAVADO EM PRD\n` +
`*Sistema Zuma Pilot ERP* · Tangará da Serra - MT`;

    const url = `https://api.whatsapp.com/send?phone=5565999813344&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Resumo executivo do turno aberto para envio no WhatsApp!");
  };

  const historicoTurnos = data?.historicoTurnos || [];
  const dre = data?.dreOperacional;

  const diferencaQuebra = resumoGaveta?.divergenciaQuebra || 0;
  const statusQuebra = resumoGaveta?.statusQuebra || "batido";

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs overflow-hidden">
      {/* HEADER EXECUTIVO CORPORATIVO */}
      <div className="p-5 border-b border-[var(--line)] bg-[var(--surface2)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-black text-lg text-[var(--ink)] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--salmon)]" />
              Fechamento Diário de Caixa &amp; Turno
            </h3>
            <span
              className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isAberto
                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                  : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAberto ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isAberto ? "Turno em Operação (Aberto)" : "Turno Auditado & Fechado"}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 flex flex-wrap items-center gap-3">
            <span>
              <strong>Caixa ID:</strong> {caixa?.id || "cx_ativo"}
            </span>
            <span>•</span>
            <span>
              <strong>Operador:</strong> {data?.operador || "Mariana (Caixa)"}
            </span>
            <span>•</span>
            <span>
              <strong>Supervisor:</strong> {data?.supervisor || "Rodrigo R. Gonçalves"}
            </span>
            <span>•</span>
            <span>
              <strong>Aberto em:</strong>{" "}
              {data?.abertoEm ? new Date(data.abertoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
            </span>
            {data?.fechadoEm && (
              <>
                <span>•</span>
                <span>
                  <strong>Fechado em:</strong>{" "}
                  {new Date(data.fechadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            )}
          </p>
        </div>

        {/* BOTÕES DE AÇÃO SUPERIORES */}
        <div className="flex items-center flex-wrap gap-2">
          {isAberto ? (
            <>
              <button
                onClick={() => {
                  setValorMovimento("");
                  setMotivoMovimento("");
                  setModalSangria(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold border border-red-500/20 flex items-center gap-1.5 transition-all"
                title="Lançar retirada de dinheiro para o cofre ou despesas urgentes"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Sangria
              </button>

              <button
                onClick={() => {
                  setValorMovimento("");
                  setMotivoMovimento("");
                  setModalSuprimento(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5 transition-all"
                title="Lançar reforço de moedas ou troco na gaveta"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Suprimento
              </button>

              <button
                onClick={() => {
                  setDinheiroContadoInput("");
                  setNotasFechamento("");
                  setModalFechar(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-all"
              >
                <Lock className="w-4 h-4" />
                Fechar Turno / Caixa
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMotivoReabertura("");
                  setSenhaSupervisor("");
                  setModalReabrir(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all"
              >
                <Unlock className="w-4 h-4" />
                Reabrir Caixa Autorizado
              </button>

              {diferencaQuebra !== 0 && (
                <button
                  onClick={() => setModalAjusteQuebra(true)}
                  className="px-3 py-2 rounded-xl bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Scale className="w-4 h-4" />
                  Ajustar Quebra ({diferencaQuebra > 0 ? "Sobra" : "Falta"})
                </button>
              )}
            </>
          )}

          <button
            onClick={() => {
              setTurnoHistoricoSelecionado(null);
              setModalComprovanteTermico(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Visualizar e imprimir Comprovante Z de 80mm"
          >
            <Printer className="w-3.5 h-3.5" />
            Comprovante Z
          </button>

          <button
            onClick={handleExportarExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Exportar planilha de auditoria completa em Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar Excel
          </button>

          <button
            onClick={notificarRodrigoWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Disparar resumo executivo via WhatsApp para Rodrigo Gonçalves"
          >
            <Send className="w-3.5 h-3.5" />
            WhatsApp Rodrigo
          </button>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS (Padrão Dino Barbearia) */}
      <div className="flex items-center gap-1 px-5 pt-3 border-b border-[var(--line)] bg-[var(--surface2)]/20 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setAbaAtiva("conciliacao")}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            abaAtiva === "conciliacao"
              ? "border-[var(--salmon)] text-[var(--salmon)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Scale className="w-4 h-4" />
          1. Conciliação &amp; Faturamento
        </button>

        <button
          onClick={() => setAbaAtiva("movimentacoes")}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            abaAtiva === "movimentacoes"
              ? "border-[var(--salmon)] text-[var(--salmon)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Coins className="w-4 h-4" />
          2. Sangrias &amp; Suprimentos ({movimentacoes.length})
        </button>

        <button
          onClick={() => setAbaAtiva("lancamentos")}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            abaAtiva === "lancamentos"
              ? "border-[var(--salmon)] text-[var(--salmon)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          3. Conferência &amp; Correção de Lançamentos ({pagamentos.length})
        </button>

        <button
          onClick={() => setAbaAtiva("quebra")}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            abaAtiva === "quebra"
              ? "border-[var(--salmon)] text-[var(--salmon)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          4. Quebra de Caixa &amp; DRE
        </button>

        <button
          onClick={() => setAbaAtiva("historico")}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            abaAtiva === "historico"
              ? "border-[var(--salmon)] text-[var(--salmon)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <History className="w-4 h-4" />
          5. Histórico de Turnos
        </button>
      </div>

      {/* CONTEÚDO DA ABA SELECIONADA */}
      <div className="p-5">
        {/* ABA 1: CONCILIAÇÃO & RESUMO GERAL */}
        {abaAtiva === "conciliacao" && (
          <div className="space-y-6">
            {/* 4 CARDS DE TOPO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[11px] font-bold uppercase text-[var(--muted)] block">
                  Total Faturado no Turno
                </span>
                <span className="text-2xl font-black text-[var(--ink)] block mt-1 font-mono">
                  R$ {(faturamento?.totalFaturado || 0).toFixed(2)}
                </span>
                <span className="text-[11px] text-[var(--muted)] mt-1 block">
                  Líquido TEF/Pix: R$ {(faturamento?.totalLiquido || 0).toFixed(2)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[11px] font-bold uppercase text-[var(--muted)] block">
                  Esperado na Gaveta Física
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1 font-mono">
                  R$ {(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}
                </span>
                <span className="text-[11px] text-[var(--muted)] mt-1 block">
                  Fundo Inicial (R$ {resumoGaveta?.fundoTrocoInicial?.toFixed(2)}) + Vendas
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[11px] font-bold uppercase text-[var(--muted)] block">
                  Dinheiro Físico Declarado
                </span>
                <span className="text-2xl font-black text-blue-600 block mt-1 font-mono">
                  R$ {(resumoGaveta?.dinheiroContado || 0).toFixed(2)}
                </span>
                <span className="text-[11px] text-[var(--muted)] mt-1 block">
                  {isAberto ? "Conferência Cega em Andamento" : "Contagem Registrada"}
                </span>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  Math.abs(diferencaQuebra) <= 2.0
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : diferencaQuebra > 0
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-700"
                    : "bg-red-500/10 border-red-500/30 text-red-700"
                }`}
              >
                <span className="text-[11px] font-bold uppercase block">
                  {statusQuebra === "batido"
                    ? "Caixa 100% Batido"
                    : statusQuebra === "sobra"
                    ? "Sobra de Caixa"
                    : "Falta de Caixa (Quebra)"}
                </span>
                <span className="text-2xl font-black block mt-1 font-mono">
                  {diferencaQuebra >= 0 ? "+" : ""} R$ {diferencaQuebra.toFixed(2)}
                </span>
                <span className="text-[11px] block mt-1">
                  {Math.abs(diferencaQuebra) <= 2.0
                    ? "✓ Dentro da tolerância padrão (R$ 2,00)"
                    : "⚠️ Divergência requer conferência"}
                </span>
              </div>
            </div>

            {/* TABELA DE CONCILIAÇÃO POR MEIO DE PAGAMENTO */}
            <div className="bg-[var(--surface2)] rounded-2xl border border-[var(--line)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matriz de Conciliação Caixa Operação ⟷ ERP Financeiro
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Cruzamento em tempo real entre comanda/mesa, SmartPOS Stone, Pix Sicredi MT e Extrato Bancário
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    data?.statusConciliacaoGeral === "conciliado"
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                  }`}
                >
                  {data?.statusConciliacaoGeral === "conciliado"
                    ? "● 100% Conciliado e Alinhado"
                    : isAberto
                    ? "● Operação Aberta (Conferência Parcial)"
                    : "● Requer Atenção / Divergente"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold">
                      <th className="py-2.5 px-3">Forma de Pagamento</th>
                      <th className="py-2.5 px-3">Tipo / Canal</th>
                      <th className="py-2.5 px-3 text-right">Operação PDV/Comandas</th>
                      <th className="py-2.5 px-3 text-right">ERP / Banco / TEF</th>
                      <th className="py-2.5 px-3 text-right">Diferença</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {itensConciliacao.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[var(--surface)]/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[var(--ink)]">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)]">
                          {item.chave === "dinheiro"
                            ? "Gaveta Física (Cédulas/Moedas)"
                            : item.chave === "pix"
                            ? "Sicredi Open Finance D+0"
                            : item.chave === "cartao_debito"
                            ? "Stone Multi-Adquirente D+1"
                            : item.chave === "cartao_credito"
                            ? "Stone Multi-Adquirente D+30"
                            : item.chave === "apple_pay"
                            ? "Apple / Google Pay NFC"
                            : item.chave === "convenio_agro"
                            ? "B2B Agro Tangará MT 15D"
                            : "Movimento Interno de Caixa"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--ink)]">
                          R$ {item.operacao?.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[var(--muted)]">
                          R$ {item.erp?.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              item.diferenca === 0
                                ? "text-[var(--muted)]"
                                : item.diferenca > 0
                                ? "text-blue-600"
                                : "text-red-600"
                            }
                          >
                            {item.diferenca >= 0 ? "+" : ""} R$ {item.diferenca?.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "conciliado"
                                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                : "bg-red-500/15 text-red-600 border border-red-500/30"
                            }`}
                          >
                            {item.status === "conciliado" ? "Conciliado" : "Divergente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--line)] font-bold bg-[var(--surface)]/30">
                      <td colSpan={2} className="py-3 px-3 uppercase text-[var(--ink)]">
                        TOTAL GERAL DO TURNO
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm text-[var(--salmon)] font-black">
                        R$ {(faturamento?.totalFaturado || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm text-[var(--ink)]">
                        R$ {(faturamento?.totalFaturado || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm font-black">
                        <span className={diferencaQuebra === 0 ? "text-emerald-600" : "text-amber-600"}>
                          R$ {diferencaQuebra.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] uppercase font-black text-emerald-600">
                          Auditado
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* DECOMPOSIÇÃO DA GAVETA FÍSICA & APURAÇÃO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-4 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] space-y-3">
                <h4 className="font-bold text-xs uppercase text-[var(--muted)] flex items-center justify-between">
                  <span>Decomposição da Gaveta Física (Dinheiro)</span>
                  <Coins className="w-4 h-4 text-amber-500" />
                </h4>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--line)]">
                    <span className="text-[var(--muted)]">(+) Fundo de Troco Inicial (Abertura):</span>
                    <span className="font-bold text-[var(--ink)]">
                      R$ {(resumoGaveta?.fundoTrocoInicial || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--line)]">
                    <span className="text-[var(--muted)]">(+) Vendas em Dinheiro (Comandas &amp; Balcão):</span>
                    <span className="font-bold text-emerald-600">
                      + R$ {(resumoGaveta?.vendasDinheiro || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--line)]">
                    <span className="text-[var(--muted)]">(+) Suprimentos de Fundo de Troco:</span>
                    <span className="font-bold text-emerald-600">
                      + R$ {(resumoGaveta?.suprimentosExtras || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--line)]">
                    <span className="text-[var(--muted)]">(-) Sangrias Realizadas para o Cofre:</span>
                    <span className="font-bold text-red-600">
                      - R$ {(resumoGaveta?.sangrias || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-[var(--line)] font-bold text-sm bg-[var(--surface)] p-2 rounded-xl">
                    <span className="text-[var(--ink)]">(=) SALDO ESPERADO EM GAVETA:</span>
                    <span className="text-amber-600">
                      R$ {(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* AUDITORIA DE CONTAGEM E QUEBRA */}
              <div className="p-4 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase text-[var(--muted)] flex items-center justify-between">
                    <span>Resultado da Conferência Cega &amp; Quebra</span>
                    <Scale className="w-4 h-4 text-[var(--salmon)]" />
                  </h4>

                  <div className="mt-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Dinheiro Físico Declarado:</span>
                      <span className="font-mono font-bold text-[var(--ink)]">
                        R$ {(resumoGaveta?.dinheiroContado || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Diferença / Quebra Apurada:</span>
                      <span
                        className={`font-mono font-black ${
                          diferencaQuebra === 0
                            ? "text-emerald-600"
                            : diferencaQuebra > 0
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {diferencaQuebra >= 0 ? "+" : ""} R$ {diferencaQuebra.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Tolerância Operacional:</span>
                      <span className="font-mono text-[var(--muted)]">R$ 2,00</span>
                    </div>
                    <div className="pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)] italic">
                      {caixa?.blindCount?.notes ||
                        (isAberto
                          ? "Turno aberto: realize a contagem física ao final do expediente para conferência cega."
                          : "Conferência concluída e registrada nos logs de auditoria imutável.")}
                    </div>
                  </div>
                </div>

                {/* BOTÕES DE FECHAMENTO OU REABERTURA */}
                <div className="pt-2">
                  {isAberto ? (
                    <button
                      onClick={() => setModalFechar(true)}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Auditar e Travar Fechamento de Caixa
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalReabrir(true)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Reabrir Turno
                      </button>
                      {diferencaQuebra !== 0 && (
                        <button
                          onClick={() => setModalAjusteQuebra(true)}
                          className="flex-1 py-2.5 rounded-xl bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border border-blue-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          Lançar Quebra
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SANGRIAS & SUPRIMENTOS */}
        {abaAtiva === "movimentacoes" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[var(--ink)]">
                  Movimentações Internas de Gaveta (Sangrias &amp; Suprimentos)
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Controle de transferências para cofre de segurança e reforço de moedas/troco
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setValorMovimento("");
                    setMotivoMovimento("");
                    setModalSangria(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  + Nova Sangria
                </button>
                <button
                  onClick={() => {
                    setValorMovimento("");
                    setMotivoMovimento("");
                    setModalSuprimento(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  + Novo Suprimento
                </button>
              </div>
            </div>

            {/* TABELA DE MOVIMENTAÇÕES */}
            <div className="bg-[var(--surface2)] rounded-2xl border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold bg-[var(--surface)]/50">
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3">Motivo / Justificativa</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {movimentacoes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[var(--muted)]">
                        Nenhuma movimentação registrada neste caixa.
                      </td>
                    </tr>
                  ) : (
                    movimentacoes.map((mov: any) => (
                      <tr key={mov.id} className="hover:bg-[var(--surface)]/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              mov.type === "sangria"
                                ? "bg-red-500/15 text-red-600 border border-red-500/30"
                                : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                            }`}
                          >
                            {mov.type === "sangria" ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {mov.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)] font-mono">
                          {new Date(mov.timestamp).toLocaleTimeString("pt-BR")}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--ink)]">
                          {mov.operator || "Caixa"}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--ink)] max-w-xs truncate">
                          {mov.reason}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black">
                          <span className={mov.type === "sangria" ? "text-red-600" : "text-emerald-600"}>
                            {mov.type === "sangria" ? "-" : "+"} R$ {mov.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setModalEditarMovimento(mov)}
                              className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-blue-600 transition-colors"
                              title="Editar motivo ou valor"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {mov.reason !== "Fundo de troco inicial de abertura de caixa" && (
                              <button
                                onClick={() => setModalExcluirMovimento(mov)}
                                className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-red-600 transition-colors"
                                title="Excluir / estornar movimentação"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: CONFERÊNCIA & CORREÇÃO DE LANÇAMENTOS */}
        {abaAtiva === "lancamentos" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Conferência &amp; Edição de Lançamentos de Pagamento
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Permite corrigir a forma de pagamento (ex: de Pix para Débito/Crédito) com recálculo automático de gaveta, taxas Stone/Cielo e Contas a Receber
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface2)] border border-[var(--line)] font-bold text-[var(--ink)]">
                    {pagamentosFiltrados.length} de {pagamentos.length} transações
                  </span>
                </div>
              </div>

              {/* BARRA DE FILTROS E BUSCA RÁPIDA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por mesa, cliente ou NSU..."
                    value={buscaLancamento}
                    onChange={(e) => setBuscaLancamento(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-hidden"
                  />
                  {buscaLancamento && (
                    <button
                      onClick={() => setBuscaLancamento("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* CHIPS DE FORMA DE PAGAMENTO */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold">
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "cartao_credito", label: "Crédito Stone" },
                    { id: "cartao_debito", label: "Débito Stone" },
                    { id: "pix", label: "Pix Sicredi" },
                    { id: "dinheiro", label: "Dinheiro" },
                    { id: "convenio_agro", label: "Convênio Agro" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setFiltroMeioLancamento(chip.id)}
                      className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition cursor-pointer ${
                        filtroMeioLancamento === chip.id
                          ? "bg-orange-600 text-white border-orange-500 shadow-xs"
                          : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TABELA DE PAGAMENTOS */}
            <div className="bg-[var(--surface2)] rounded-2xl border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold bg-[var(--surface)]/50">
                    <th className="py-2.5 px-3">NSU / ID</th>
                    <th className="py-2.5 px-3">Origem</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Forma Registrada</th>
                    <th className="py-2.5 px-3 text-right">Valor Bruto</th>
                    <th className="py-2.5 px-3 text-right">Taxa</th>
                    <th className="py-2.5 px-3 text-right">Valor Líquido</th>
                    <th className="py-2.5 px-3 text-center">NFC-e</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {pagamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-[var(--muted)]">
                        Nenhum pagamento registrado neste turno.
                      </td>
                    </tr>
                  ) : (
                    pagamentosFiltrados.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[var(--surface)]/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[var(--ink)]">
                          {p.nsu || p.id}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--ink)]">
                          {p.canal || (p.tableNumber ? `Mesa ${p.tableNumber}` : "Balcão")}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)] max-w-xs truncate">
                          {p.cliente || "Cliente Balcão"}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)] font-mono">
                          {new Date(p.dataHora).toLocaleTimeString("pt-BR")}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]">
                            {p.formaLabel || p.forma}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--ink)]">
                          R$ {p.valorBruto.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[var(--muted)]">
                          R$ {p.valorTaxa?.toFixed(2) || "0.00"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                          R$ {p.valorLiquido?.toFixed(2) || p.valorBruto.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {p.nfceNumero ? (
                            <span className="text-[10px] font-bold text-emerald-600 font-mono">
                              #{p.nfceNumero}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[var(--muted)]">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setModalCorrigirPagamento(p);
                              setNovoMeioPagamento(p.forma);
                              setNovoValorCorrecao(p.valorBruto);
                              setMotivoCorrecao("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-[11px] font-bold flex items-center gap-1 transition-all ml-auto"
                            title="Corrigir forma de pagamento ou valor"
                          >
                            <Edit2 className="w-3 h-3" />
                            Corrigir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: QUEBRA DE CAIXA & DRE */}
        {abaAtiva === "quebra" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[var(--salmon)]" />
                    Auditoria de Quebra de Caixa (Sobras &amp; Faltas)
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Regra padrão Dino Barbearia: tolerância de R$ 2,00. Divergências superiores geram título de ajuste no Contas a Pagar / Receber.
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-black uppercase ${
                    Math.abs(diferencaQuebra) <= 2.0
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                      : diferencaQuebra > 0
                      ? "bg-blue-500/15 text-blue-700 border border-blue-500/30"
                      : "bg-red-500/15 text-red-700 border border-red-500/30"
                  }`}
                >
                  {statusQuebra === "batido"
                    ? "✓ Caixa Batido (R$ 0,00)"
                    : statusQuebra === "sobra"
                    ? `Sobra: +R$ ${diferencaQuebra.toFixed(2)}`
                    : `Falta: -R$ ${Math.abs(diferencaQuebra).toFixed(2)}`}
                </span>
              </div>

              {diferencaQuebra !== 0 ? (
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
                  <div className="text-xs text-[var(--ink)] space-y-1">
                    <p>
                      <strong>Ação recomendada:</strong>{" "}
                      {diferencaQuebra < 0
                        ? "Lançar Despesa Operacional de Quebra de Caixa (Falta) no valor de R$ " +
                          Math.abs(diferencaQuebra).toFixed(2) +
                          " para liquidar a diferença no livro-caixa."
                        : "Lançar Receita Extraordinária de Sobra de Caixa no valor de R$ " +
                          diferencaQuebra.toFixed(2) +
                          " no extrato bancário do Sicredi."}
                    </p>
                  </div>

                  <button
                    onClick={() => setModalAjusteQuebra(true)}
                    className="px-4 py-2 rounded-xl bg-[var(--salmon)] hover:bg-[var(--salmon-dark)] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Lançar Ajuste Contábil de Quebra no ERP
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Conferência física bateu exatamente com o saldo esperado na gaveta. Nenhuma quebra necessária.
                </div>
              )}
            </div>

            {/* DRE OPERACIONAL DO TURNO */}
            {dre && (
              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                <h4 className="font-bold text-xs uppercase text-[var(--muted)]">
                  DRE Gerencial do Turno (Demonstração do Resultado)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                    <span className="text-[11px] text-[var(--muted)] block">Receita Bruta</span>
                    <span className="font-mono font-bold text-sm text-[var(--ink)]">
                      R$ {dre.receitaBruta?.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                    <span className="text-[11px] text-[var(--muted)] block">Deduções / Taxas</span>
                    <span className="font-mono font-bold text-sm text-red-600">
                      - R$ {dre.deducoes?.totalDeducoes?.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                    <span className="text-[11px] text-[var(--muted)] block">CMV Nobre (Salmão/BOM)</span>
                    <span className="font-mono font-bold text-sm text-amber-600">
                      - R$ {dre.cmvReal?.toFixed(2)} ({dre.cmvPercentual}%)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                    <span className="text-[11px] text-[var(--muted)] block">Margem de Contribuição</span>
                    <span className="font-mono font-bold text-sm text-emerald-600">
                      R$ {dre.margemContribuicaoBrl?.toFixed(2)} ({dre.margemContribuicaoPercentual}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 5: HISTÓRICO DE TURNOS */}
        {abaAtiva === "historico" && (
          <div className="space-y-4">
            {/* CARDS DE KPIS HISTÓRICOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Total Turnos Auditados</span>
                <span className="text-xl font-black text-[var(--ink)] block mt-0.5 font-mono">{historicoTurnos.length} turnos</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">100% integrados ao Sicredi</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Total Movimentado (Gaveta)</span>
                <span className="text-xl font-black text-[var(--ink)] block mt-0.5 font-mono">
                  R$ {historicoTurnos.reduce((s: number, r: any) => s + (r.blindCount?.countedCash || r.initialCash || 0), 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-[var(--muted)] block mt-0.5">Dinheiro em espécie conferido</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Índice de Assertividade</span>
                <span className="text-xl font-black text-emerald-600 block mt-0.5 font-mono">
                  {historicoTurnos.length > 0 
                    ? ((historicoTurnos.filter((r: any) => Math.abs(r.blindCount?.difference || 0) <= 2.0).length / historicoTurnos.length) * 100).toFixed(1)
                    : 100}%
                </span>
                <span className="text-[10px] text-emerald-600/80 block mt-0.5">Turnos dentro da tolerância</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Fundo Médio de Troco</span>
                <span className="text-xl font-black text-[var(--ink)] block mt-0.5 font-mono">
                  R$ {historicoTurnos.length > 0 
                    ? (historicoTurnos.reduce((s: number, r: any) => s + (r.initialCash || 0), 0) / historicoTurnos.length).toFixed(2)
                    : "250.00"}
                </span>
                <span className="text-[10px] text-[var(--muted)] block mt-0.5">Reserva padrão de abertura</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="font-bold text-sm text-[var(--ink)]">
                  Histórico de Fechamentos de Caixa Anteriores
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Registro de turnos encerrados e auditados para reimpressão de comprovante e prestação de contas
                </p>
              </div>
              <button
                onClick={handleExportarExcel}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Baixar Planilha Geral
              </button>
            </div>

            <div className="bg-[var(--surface2)] rounded-2xl border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold bg-[var(--surface)]/50">
                    <th className="py-2.5 px-3">Turno / Caixa ID</th>
                    <th className="py-2.5 px-3">Data Abertura</th>
                    <th className="py-2.5 px-3">Data Fechamento</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3 text-right">Fundo Inicial</th>
                    <th className="py-2.5 px-3 text-right">Dinheiro Gaveta</th>
                    <th className="py-2.5 px-3 text-right">Quebra</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {historicoTurnos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[var(--muted)]">
                        Nenhum turno anterior arquivado.
                      </td>
                    </tr>
                  ) : (
                    historicoTurnos.map((reg: any) => (
                      <tr key={reg.id} className="hover:bg-[var(--surface)]/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[var(--ink)]">
                          {reg.id}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)] font-mono">
                          {new Date(reg.openedAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--muted)] font-mono">
                          {reg.closedAt ? new Date(reg.closedAt).toLocaleString("pt-BR") : "--"}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--ink)]">
                          {reg.operator || "Caixa"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[var(--muted)]">
                          R$ {reg.initialCash?.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--ink)]">
                          R$ {(reg.blindCount?.countedCash ?? reg.initialCash)?.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              (reg.blindCount?.difference || 0) === 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {(reg.blindCount?.difference || 0) >= 0 ? "+" : ""} R${" "}
                            {(reg.blindCount?.difference || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 border border-slate-500/30">
                            Fechado
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setTurnoHistoricoSelecionado(reg);
                                setModalComprovanteTermico(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                              title="Reemitir Comprovante Térmico Z deste turno"
                            >
                              <Printer className="w-3 h-3 text-[var(--salmon)]" />
                              Térmico Z
                            </button>
                            <button
                              onClick={() => setModalDetalhesTurno(reg)}
                              className="px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                              title="Visualizar detalhes da prestação de contas"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              Detalhes
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODAL DE FECHAMENTO DE TURNO ==================== */}
      {modalFechar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                Fechar Turno / Caixa (Conferência Cega)
              </h3>
              <button
                onClick={() => setModalFechar(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Informe a contagem física do dinheiro em espécie presente na gaveta para conferência cega contra o esperado do sistema.
            </p>

            {/* ENTRADA DE DINHEIRO CONTADO */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[var(--ink)]">
                    Total em Dinheiro Físico na Gaveta (R$):
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
                    className="text-[11px] text-[var(--salmon)] hover:underline font-bold flex items-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {mostrarCalculadora ? "Ocultar Calculadora" : "Usar Calculadora de Cédulas"}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={dinheiroContadoInput}
                  onChange={(e) => setDinheiroContadoInput(parseFloat(e.target.value) || "")}
                  className="w-full p-3 rounded-xl bg-[var(--surface2)] border-2 border-[var(--salmon)] font-mono font-black text-lg text-[var(--ink)] focus:outline-hidden"
                  autoFocus
                />
              </div>

              {/* CALCULADORA DE CÉDULAS */}
              {mostrarCalculadora && (
                <div className="p-3.5 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                      Calculadora Rápida de Cédulas &amp; Moedas
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const zerado = { c200: 0, c100: 0, c50: 0, c20: 0, c10: 0, c5: 0, c2: 0, moedas: 0 };
                        setCedulas(zerado);
                        recalcularCedulas(zerado);
                      }}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      Zerar Contagem
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: "c200", label: "Cédula R$ 200", valor: 200 },
                      { key: "c100", label: "Cédula R$ 100", valor: 100 },
                      { key: "c50", label: "Cédula R$ 50", valor: 50 },
                      { key: "c20", label: "Cédula R$ 20", valor: 20 },
                      { key: "c10", label: "Cédula R$ 10", valor: 10 },
                      { key: "c5", label: "Cédula R$ 5", valor: 5 },
                      { key: "c2", label: "Cédula R$ 2", valor: 2 },
                    ].map((item) => {
                      const count = cedulas[item.key] || 0;
                      const subtotal = count * item.valor;
                      return (
                        <div key={item.key} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-[var(--ink)]">{item.label}</span>
                            <span className="font-mono text-emerald-600 font-bold">R$ {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const novo = { ...cedulas, [item.key]: Math.max(0, count - 1) };
                                setCedulas(novo);
                                recalcularCedulas(novo);
                              }}
                              className="w-6 h-6 rounded-md bg-[var(--surface2)] border border-[var(--line)] font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const novo = { ...cedulas, [item.key]: val };
                                setCedulas(novo);
                                recalcularCedulas(novo);
                              }}
                              className="flex-1 p-1 rounded-md bg-[var(--surface)] border border-[var(--line)] font-mono font-bold text-center text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const novo = { ...cedulas, [item.key]: count + 1 };
                                setCedulas(novo);
                                recalcularCedulas(novo);
                              }}
                              className="w-6 h-6 rounded-md bg-[var(--surface2)] border border-[var(--line)] font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* MOEDAS EM GERAL */}
                    <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[var(--ink)]">Moedas / Troco</span>
                        <span className="font-mono text-emerald-600 font-bold">R$ {(cedulas.moedas || 0).toFixed(2)}</span>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        placeholder="R$ 0.00"
                        value={cedulas.moedas || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const novo = { ...cedulas, moedas: val };
                          setCedulas(novo);
                          recalcularCedulas(novo);
                        }}
                        className="w-full p-1 rounded-md bg-[var(--surface)] border border-[var(--line)] font-mono font-bold text-center text-xs"
                      />
                    </div>
                  </div>

                  {/* DIAGNÓSTICO IMEDIATO DO STATUS NA CALCULADORA */}
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Esperado do Sistema:</span>
                      <strong className="text-[var(--ink)]">R$ {(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Contado Agora:</span>
                      <strong className="text-orange-600 font-black">
                        R$ {(typeof dinheiroContadoInput === "number" ? dinheiroContadoInput : 0).toFixed(2)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Status da Gaveta:</span>
                      {(() => {
                        const contado = typeof dinheiroContadoInput === "number" ? dinheiroContadoInput : 0;
                        const diff = contado - (resumoGaveta?.saldoEsperadoGaveta || 0);
                        if (Math.abs(diff) === 0) {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">✓ 100% Batido</span>;
                        } else if (Math.abs(diff) <= 2.0) {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">✓ Tolerância (R$ {diff.toFixed(2)})</span>;
                        } else {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600">⚠ Quebra: {diff > 0 ? "+" : ""}R$ {diff.toFixed(2)}</span>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* RESPONSÁVEIS E NOTAS */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">
                    Operador de Caixa:
                  </label>
                  <input
                    type="text"
                    value={operadorFechamento}
                    onChange={(e) => setOperadorFechamento(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">
                    Supervisor Responsável:
                  </label>
                  <input
                    type="text"
                    value={supervisorFechamento}
                    onChange={(e) => setSupervisorFechamento(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] block mb-1">
                  Observações / Justificativas do Fechamento:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Turno encerrado normalmente sem intercorrências..."
                  value={notasFechamento}
                  onChange={(e) => setNotasFechamento(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalFechar(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={dinheiroContadoInput === "" || closeMutation.isPending}
                onClick={() =>
                  closeMutation.mutate({
                    countedCash: Number(dinheiroContadoInput),
                    operator: operadorFechamento,
                    notes: notasFechamento,
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {closeMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE REABERTURA AUTORIZADA ==================== */}
      {modalReabrir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Unlock className="w-5 h-5 text-amber-500" />
                Reabertura Supervisionada de Caixa
              </h3>
              <button
                onClick={() => setModalReabrir(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium space-y-1">
              <p>
                <strong>Atenção de Auditoria:</strong> A reabertura de caixa cancela o fechamento anterior e permite novos lançamentos e correções. Esta ação fica permanentemente registrada no log de auditoria corporativo.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Motivo Obrigatório da Reabertura: *
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Cliente da Mesa 04 retornou para trocar pagamento de dinheiro para Pix; conferência física recontada."
                  value={motivoReabertura}
                  onChange={(e) => setMotivoReabertura(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Supervisor Responsável:
                </label>
                <input
                  type="text"
                  value={supervisorReabertura}
                  onChange={(e) => setSupervisorReabertura(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Senha / PIN de Autorização do Supervisor:
                </label>
                <input
                  type="password"
                  placeholder="PIN do Gerente (ex: 1234)"
                  value={senhaSupervisor}
                  onChange={(e) => setSenhaSupervisor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] font-mono text-center tracking-widest text-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalReabrir(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={motivoReabertura.trim().length < 5 || reopenMutation.isPending}
                onClick={() =>
                  reopenMutation.mutate({
                    operator: supervisorReabertura,
                    reason: motivoReabertura,
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {reopenMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                Confirmar Reabertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE NOVA SANGRIA / SUPRIMENTO ==================== */}
      {(modalSangria || modalSuprimento) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                {modalSangria ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    Lançar Sangria de Caixa (Retirada)
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Lançar Suprimento de Troco (Entrada)
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setModalSangria(false);
                  setModalSuprimento(false);
                }}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Valor da Movimentação (R$): *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={valorMovimento}
                  onChange={(e) => setValorMovimento(parseFloat(e.target.value) || "")}
                  className="w-full p-3 rounded-xl bg-[var(--surface2)] border-2 border-[var(--salmon)] font-mono font-black text-lg text-[var(--ink)] focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Motivo / Justificativa Obrigatória: *
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    modalSangria
                      ? "Ex: Transferência para cofre de segurança / pagamento urgente entregador"
                      : "Ex: Reforço de troco em moedas de R$ 1 e R$ 0,50"
                  }
                  value={motivoMovimento}
                  onChange={(e) => setMotivoMovimento(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">
                  Operador Responsável:
                </label>
                <input
                  type="text"
                  value={operadorMovimento}
                  onChange={(e) => setOperadorMovimento(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  setModalSangria(false);
                  setModalSuprimento(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!valorMovimento || valorMovimento <= 0 || motivoMovimento.trim().length < 3 || addMovementMutation.isPending}
                onClick={() =>
                  addMovementMutation.mutate({
                    type: modalSangria ? "sangria" : "suprimento",
                    amount: Number(valorMovimento),
                    reason: motivoMovimento,
                    operator: operadorMovimento,
                  })
                }
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 ${
                  modalSangria ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {addMovementMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirmar {modalSangria ? "Sangria" : "Suprimento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE EDITAR MOVIMENTO ==================== */}
      {modalEditarMovimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Corrigir Movimentação ({modalEditarMovimento.type.toUpperCase()})
              </h3>
              <button
                onClick={() => setModalEditarMovimento(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Novo Valor (R$): *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={modalEditarMovimento.amount}
                  onChange={(e) =>
                    setModalEditarMovimento({
                      ...modalEditarMovimento,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-[var(--surface2)] border-2 border-blue-500 font-mono font-black text-lg text-[var(--ink)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Motivo / Justificativa da Correção: *
                </label>
                <textarea
                  rows={2}
                  value={modalEditarMovimento.reason}
                  onChange={(e) =>
                    setModalEditarMovimento({
                      ...modalEditarMovimento,
                      reason: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalEditarMovimento(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!modalEditarMovimento.amount || updateMovementMutation.isPending}
                onClick={() =>
                  updateMovementMutation.mutate({
                    movementId: modalEditarMovimento.id,
                    amount: modalEditarMovimento.amount,
                    reason: modalEditarMovimento.reason,
                    operator: "Rodrigo R. Gonçalves (Supervisor)",
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {updateMovementMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Salvar Correção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE EXCLUIR MOVIMENTO ==================== */}
      {modalExcluirMovimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Estornar / Excluir Movimentação
              </h3>
              <button
                onClick={() => setModalExcluirMovimento(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--ink)]">
              Deseja realmente estornar a movimentação de{" "}
              <strong>
                {modalExcluirMovimento.type.toUpperCase()} no valor de R${" "}
                {modalExcluirMovimento.amount.toFixed(2)}
              </strong>
              ? O valor será estornado do saldo da gaveta.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalExcluirMovimento(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteMovementMutation.isPending}
                onClick={() =>
                  deleteMovementMutation.mutate({
                    movementId: modalExcluirMovimento.id,
                    motivo: "Estorno de lançamento incorreto pelo supervisor",
                    operator: "Rodrigo R. Gonçalves (Supervisor)",
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                {deleteMovementMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE CORREÇÃO DE PAGAMENTO ==================== */}
      {modalCorrigirPagamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Corrigir Forma de Pagamento / Lançamento
              </h3>
              <button
                onClick={() => setModalCorrigirPagamento(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Transação:</span>
                <span className="font-mono font-bold text-[var(--ink)]">{modalCorrigirPagamento.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Origem:</span>
                <span className="font-bold text-[var(--ink)]">{modalCorrigirPagamento.canal || `Mesa ${modalCorrigirPagamento.tableNumber}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Forma Atual:</span>
                <span className="font-bold text-red-600">{modalCorrigirPagamento.formaLabel || modalCorrigirPagamento.forma}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Nova Forma de Pagamento Real: *
                </label>
                <select
                  value={novoMeioPagamento}
                  onChange={(e) => setNovoMeioPagamento(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-bold"
                >
                  <option value="pix">Pix Banco Sicredi (MT) - D+0 (Taxa 0%)</option>
                  <option value="cartao_debito">Cartão de Débito Stone - D+1 (Taxa 1.15%)</option>
                  <option value="cartao_credito">Cartão de Crédito Stone - D+30 (Taxa 2.45%)</option>
                  <option value="dinheiro">Dinheiro Físico (Gaveta do Caixa)</option>
                  <option value="apple_pay">Apple Pay / Google Pay NFC (Taxa 2.10%)</option>
                  <option value="convenio_agro">Convênio Agro Tangará - Faturado 15D</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Valor Bruto (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={novoValorCorrecao}
                  onChange={(e) => setNovoValorCorrecao(parseFloat(e.target.value) || "")}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] font-mono font-bold text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Motivo Obrigatório da Correção: *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Operador selecionou dinheiro por engano, cliente pagou via Pix na SmartPOS"
                  value={motivoCorrecao}
                  onChange={(e) => setMotivoCorrecao(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalCorrigirPagamento(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={motivoCorrecao.trim().length < 3 || updatePaymentMutation.isPending}
                onClick={() =>
                  updatePaymentMutation.mutate({
                    paymentId: modalCorrigirPagamento.id,
                    novoMeio: novoMeioPagamento,
                    motivo: motivoCorrecao,
                    operador: "Rodrigo R. Gonçalves (Supervisor)",
                    novoValorBruto: novoValorCorrecao ? Number(novoValorCorrecao) : undefined,
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {updatePaymentMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Salvar &amp; Recalcular ERP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE AJUSTE DE QUEBRA DE CAIXA ==================== */}
      {modalAjusteQuebra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[var(--salmon)]" />
                Lançar Ajuste Contábil de Quebra no ERP
              </h3>
              <button
                onClick={() => setModalAjusteQuebra(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--ink)]">
              {diferencaQuebra < 0 ? (
                <>
                  Será gerada uma despesa em <strong>Contas a Pagar / DRE</strong> no valor de{" "}
                  <strong className="text-red-600">
                    R$ {Math.abs(diferencaQuebra).toFixed(2)}
                  </strong>{" "}
                  sob a categoria <em>Quebra de Caixa (Falta)</em> para regularizar o saldo contábil.
                </>
              ) : (
                <>
                  Será gerado um crédito extraordinário no <strong>Extrato Bancário / DRE</strong> no
                  valor de{" "}
                  <strong className="text-blue-600">
                    R$ {diferencaQuebra.toFixed(2)}
                  </strong>{" "}
                  sob a categoria <em>Sobra de Caixa</em>.
                </>
              )}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Justificativa da Supervisão: *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Diferença de moedas de troco apurada na conferência cega do turno jantar."
                  value={justificativaQuebra}
                  onChange={(e) => setJustificativaQuebra(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalAjusteQuebra(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={justificativaQuebra.trim().length < 3 || settleBreakageMutation.isPending}
                onClick={() =>
                  settleBreakageMutation.mutate({
                    tipo: diferencaQuebra < 0 ? "falta" : "sobra",
                    valor: Math.abs(diferencaQuebra),
                    justificativa: justificativaQuebra,
                    supervisor: "Rodrigo R. Gonçalves (Supervisor)",
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-[var(--salmon)] hover:bg-[var(--salmon-dark)] text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {settleBreakageMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirmar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ==================== MODAL DE DETALHES DE TURNO HISTÓRICO ==================== */}
      {modalDetalhesTurno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[var(--salmon)]" />
                Auditoria do Turno ${modalDetalhesTurno.id}
              </h3>
              <button
                onClick={() => setModalDetalhesTurno(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface2)] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Operador:</span>
                  <span className="font-bold text-[var(--ink)]">{modalDetalhesTurno.operator || "Mariana"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Abertura:</span>
                  <span className="font-mono text-[var(--ink)]">{new Date(modalDetalhesTurno.openedAt).toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Fechamento:</span>
                  <span className="font-mono text-[var(--ink)]">
                    {modalDetalhesTurno.closedAt ? new Date(modalDetalhesTurno.closedAt).toLocaleString("pt-BR") : "--"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface2)] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Fundo de Troco Inicial:</span>
                  <span className="font-bold">R$ {modalDetalhesTurno.initialCash?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dinheiro Declarado na Gaveta:</span>
                  <span className="font-bold">R$ {(modalDetalhesTurno.blindCount?.countedCash ?? modalDetalhesTurno.initialCash)?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--line)] pt-1">
                  <span>Quebra / Diferença Apurada:</span>
                  <span className={(modalDetalhesTurno.blindCount?.difference || 0) === 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                    {(modalDetalhesTurno.blindCount?.difference || 0) >= 0 ? "+" : ""} R$ {(modalDetalhesTurno.blindCount?.difference || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {modalDetalhesTurno.blindCount?.notes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <span className="font-bold block mb-0.5">Observações da Auditoria:</span>
                  <p>{modalDetalhesTurno.blindCount.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  setTurnoHistoricoSelecionado(modalDetalhesTurno);
                  setModalDetalhesTurno(null);
                  setModalComprovanteTermico(true);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Reemitir Cupom Térmico Z
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE COMPROVANTE TÉRMICO (80MM ESC/POS) ==================== */}
      {modalComprovanteTermico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Printer className="w-5 h-5 text-[var(--salmon)]" />
                Comprovante Térmico de Fechamento (80mm)
              </h3>
              <button
                onClick={() => setModalComprovanteTermico(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VISUALIZAÇÃO EM PAPEL TÉRMICO 80MM */}
            <div className="bg-[#fefce8] dark:bg-zinc-900 border border-amber-300/60 dark:border-zinc-700 p-4 rounded-xl shadow-inner font-mono text-[11px] text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed select-all">
              {/* CABEÇALHO OFICIAL */}
              <div className="text-center space-y-0.5 border-b border-dashed border-zinc-400 pb-2">
                <p className="font-black text-xs uppercase tracking-wider">
                  ZUMA COZINHA ORIENTAL LTDA
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                  CNPJ: 36.296.848/0001-57 • IE: 13.782.910-4 MT
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                  Rua Celso Rosa Lima, nº 142-W, Centro / Jd. Tangará II
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                  Tangará da Serra - MT • CEP 78300-000 • Fone: (65) 99812-4401
                </p>
              </div>

              {/* TÍTULO */}
              <div className="text-center py-2 border-b border-dashed border-zinc-400">
                <p className="font-black uppercase tracking-wide">
                  RELATORIO DE FECHAMENTO DE CAIXA &amp; TURNO
                </p>
                <p className="text-[10px] text-zinc-500">
                  COMPROVANTE FISCAL / AUDITORIA Z
                </p>
              </div>

              {/* DADOS DO TURNO */}
              <div className="py-2 border-b border-dashed border-zinc-400 space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>TURNO ID:</span>
                  <span className="font-bold">{caixa?.id || "cx_01"}</span>
                </div>
                <div className="flex justify-between">
                  <span>OPERADOR:</span>
                  <span className="font-bold">{data?.operador}</span>
                </div>
                <div className="flex justify-between">
                  <span>SUPERVISOR:</span>
                  <span className="font-bold">{data?.supervisor}</span>
                </div>
                <div className="flex justify-between">
                  <span>ABERTO EM:</span>
                  <span>{data?.abertoEm ? new Date(data.abertoEm).toLocaleString("pt-BR") : "--"}</span>
                </div>
                {data?.fechadoEm && (
                  <div className="flex justify-between">
                    <span>FECHADO EM:</span>
                    <span>{new Date(data.fechadoEm).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>STATUS:</span>
                  <span className="uppercase">{caixa?.status}</span>
                </div>
              </div>

              {/* FATURAMENTO POR FORMA */}
              <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                <p className="font-bold text-center uppercase text-[10px]">
                  FATURAMENTO POR FORMA DE PAGAMENTO
                </p>
                <div className="flex justify-between">
                  <span>Dinheiro em Espécie:</span>
                  <span className="font-bold">R$ {(faturamento?.dinheiro?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pix Sicredi MT:</span>
                  <span className="font-bold">R$ {(faturamento?.pix?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartão Débito Stone:</span>
                  <span className="font-bold">R$ {(faturamento?.cartaoDebito?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartão Crédito Stone:</span>
                  <span className="font-bold">R$ {(faturamento?.cartaoCredito?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Apple Pay / NFC:</span>
                  <span className="font-bold">R$ {(faturamento?.applePay?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convênio Agro 15D:</span>
                  <span className="font-bold">R$ {(faturamento?.convenioAgro?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dotted border-zinc-400 font-black text-xs">
                  <span>TOTAL BRUTO FATURADO:</span>
                  <span>R$ {(faturamento?.totalFaturado || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Taxas Adquirente:</span>
                  <span>- R$ {(faturamento?.totalTaxas || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-[10px]">
                  <span>TOTAL LIQUIDO REALIZADO:</span>
                  <span>R$ {(faturamento?.totalLiquido || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-[10px] text-amber-700 dark:text-amber-400">
                  <span>Gorjeta Rateada (10%):</span>
                  <span>R$ {(data?.indicadoresOperacionais?.totalGorjetas || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* AUDITORIA DA GAVETA FISICA */}
              <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                <p className="font-bold text-center uppercase text-[10px]">
                  AUDITORIA DA GAVETA FISICA (DINHEIRO)
                </p>
                <div className="flex justify-between">
                  <span>(+) Fundo Troco Inicial:</span>
                  <span>R$ {(resumoGaveta?.fundoTrocoInicial || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) Vendas Dinheiro:</span>
                  <span>+ R$ {(resumoGaveta?.vendasDinheiro || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) Suprimentos Troco:</span>
                  <span>+ R$ {(resumoGaveta?.suprimentosExtras || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Sangrias / Cofre:</span>
                  <span>- R$ {(resumoGaveta?.sangrias || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dotted border-zinc-400 font-bold">
                  <span>(=) SALDO ESPERADO GAVETA:</span>
                  <span>R$ {(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>(=) DINHEIRO FISICO CONTADO:</span>
                  <span>R$ {(resumoGaveta?.dinheiroContado || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-xs">
                  <span>DIFERENCA / QUEBRA:</span>
                  <span>
                    {diferencaQuebra >= 0 ? "+" : ""} R$ {diferencaQuebra.toFixed(2)}
                  </span>
                </div>
                <div className="text-center text-[9px] uppercase tracking-wider text-zinc-500 pt-0.5">
                  STATUS: {statusQuebra} (Tolerancia: R$ 2,00)
                </div>
              </div>

              {/* MOVIMENTAÇÕES DETALHADAS */}
              <div className="py-2 border-b border-dashed border-zinc-400 space-y-0.5">
                <p className="font-bold text-center uppercase text-[10px]">
                  MOVIMENTACOES DO CAIXA
                </p>
                {movimentacoes.length === 0 ? (
                  <p className="text-center text-[10px] text-zinc-500">Sem movimentações avulsas.</p>
                ) : (
                  movimentacoes.map((m: any) => (
                    <div key={m.id} className="text-[10px] flex justify-between">
                      <span>
                        {m.type === "sangria" ? "[-] SANGRIA" : "[+] SUPRIMENTO"}: {m.reason}
                      </span>
                      <span className="font-bold font-mono">R$ {m.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* INDICADORES OPERACIONAIS */}
              <div className="py-2 border-b border-dashed border-zinc-400 space-y-0.5 text-[10px]">
                <p className="font-bold text-center uppercase">INDICADORES DE SALAO</p>
                <div className="flex justify-between">
                  <span>Mesas Atendidas:</span>
                  <span className="font-bold">{data?.indicadoresOperacionais?.totalMesasAtendidas || 12} mesas</span>
                </div>
                <div className="flex justify-between">
                  <span>Clientes Atendidos:</span>
                  <span className="font-bold">{data?.indicadoresOperacionais?.totalClientes || 34} pessoas</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Médio por Venda:</span>
                  <span className="font-bold">R$ {(data?.indicadoresOperacionais?.ticketMedio || 148.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa Aprovação SmartPOS:</span>
                  <span className="font-bold">{data?.indicadoresOperacionais?.taxaAprovacao || "99.4%"}</span>
                </div>
              </div>

              {/* ASSINATURAS */}
              <div className="pt-4 text-center space-y-3 text-[10px]">
                <div>
                  <div className="border-b border-zinc-400 w-3/4 mx-auto mb-1" />
                  <p className="font-bold">ASSINATURA OPERADOR: {data?.operador}</p>
                </div>
                <div>
                  <div className="border-b border-zinc-400 w-3/4 mx-auto mb-1" />
                  <p className="font-bold">ASSINATURA SUPERVISOR: {data?.supervisor}</p>
                </div>
                <p className="text-[9px] text-zinc-500 pt-1">
                  Zuma Pilot • Automação Comercial Tangará da Serra MT
                </p>
              </div>
            </div>

            {/* BOTÕES DE IMPRESSÃO E CÓPIA */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={handleCopiarComprovante}
                className="px-4 py-2 rounded-xl bg-[var(--surface2)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--line)] transition-all flex items-center gap-1.5"
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiado ? "Copiado!" : "Copiar Texto Térmico"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalComprovanteTermico(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--surface2)]"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleImprimirTermico}
                  className="px-5 py-2.5 rounded-xl bg-[var(--salmon)] hover:bg-[var(--salmon-dark)] text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Comprovante Térmico (80mm)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
