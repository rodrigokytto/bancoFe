import React, { useState, useMemo } from "react";
import {
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Users,
  RefreshCw,
  Clock,
  Printer,
  Lock,
  Unlock,
  Plus,
  Minus,
  Search,
  Filter,
  Download,
  ShieldCheck,
  FileText,
  Building2,
  Store,
  ChevronDown,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { ErpFechamentoTurno } from "@/components/erp/ErpFechamentoTurno";

type AbaAtiva = "cobranca" | "extrato" | "fechamento" | "terminais";

type FormaPagamento =
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "dinheiro"
  | "apple_pay"
  | "split"
  | "convenio_agro";

export const AppPagamentos: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("cobranca");

  // ==================== QUERIES & MUTATIONS ====================
  const paymentsQuery = trpc.zuma.getPaymentsOverview.useQuery(undefined, {
    refetchInterval: 5000
  });

  const closingQuery = trpc.zuma.getDailyClosingData.useQuery(undefined, {
    refetchInterval: 5000
  });

  const tablesQuery = trpc.zuma.listTables.useQuery();

  const processPaymentMutation = trpc.zuma.processPayment.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem, { icon: "✅" });
      paymentsQuery.refetch();
      closingQuery.refetch();
      tablesQuery.refetch();
      setModalRecibo(data.comprovanteDigital);
      // Resetar form de cobrança
      setValorInput(0);
      setMesaSelecionada(null);
      setClienteNome("Cliente Zuma");
      setClienteCpf("");
    },
    onError: (err) => {
      toast.error(`Falha no processamento: ${err.message}`, { icon: "❌" });
    }
  });

  const refundMutation = trpc.zuma.refundPayment.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem, { icon: "↩️" });
      paymentsQuery.refetch();
      closingQuery.refetch();
      setModalEstorno(null);
    },
    onError: (err) => {
      toast.error(`Erro ao estornar: ${err.message}`);
    }
  });

  const closeCashMutation = trpc.zuma.closeCashRegister.useMutation({
    onSuccess: () => {
      toast.success("Turno fechado e auditado com sucesso! Relatório Z emitido.", { icon: "🔒" });
      closingQuery.refetch();
      paymentsQuery.refetch();
      setModalFecharCaixa(false);
    },
    onError: (err) => {
      toast.error(`Erro ao fechar caixa: ${err.message}`);
    }
  });

  const reopenCashMutation = trpc.zuma.reopenCashRegister.useMutation({
    onSuccess: () => {
      toast.success("Caixa reaberto para correções.", { icon: "🔓" });
      closingQuery.refetch();
      paymentsQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao reabrir caixa: ${err.message}`);
    }
  });

  const addMovementMutation = trpc.zuma.addCashMovement.useMutation({
    onSuccess: () => {
      toast.success("Movimentação de caixa registrada!", { icon: "💵" });
      closingQuery.refetch();
      setModalMovimento(null);
    },
    onError: (err) => {
      toast.error(`Erro na movimentação: ${err.message}`);
    }
  });

  // ==================== ESTADOS DA COBRANÇA ====================
  const [valorInput, setValorInput] = useState<number>(148.0);
  const [formaAtiva, setFormaAtiva] = useState<FormaPagamento>("pix");
  const [canalOrigem, setCanalOrigem] = useState<string>("Salão");
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [clienteNome, setClienteNome] = useState<string>("Cliente Zuma");
  const [clienteCpf, setClienteCpf] = useState<string>("");
  const [bandeiraCartao, setBandeiraCartao] = useState<string>("Mastercard");
  const [parcelasCartao, setParcelasCartao] = useState<number>(1);
  const [trocoPara, setTrocoPara] = useState<number>(150);
  const [pessoasSplit, setPessoasSplit] = useState<number>(2);
  const [splitFormas, setSplitFormas] = useState<{ forma: string; valor: number }[]>([
    { forma: "Pix Instantâneo", valor: 74.0 },
    { forma: "Cartão Débito", valor: 74.0 }
  ]);
  const [emitirNfce, setEmitirNfce] = useState<boolean>(true);

  // ==================== MODAIS ====================
  const [modalRecibo, setModalRecibo] = useState<any | null>(null);
  const [modalEstorno, setModalEstorno] = useState<any | null>(null);
  const [motivoEstorno, setMotivoEstorno] = useState<string>("");
  const [modalFecharCaixa, setModalFecharCaixa] = useState<boolean>(false);
  const [dinheiroContadoInput, setDinheiroContadoInput] = useState<number>(0);
  const [observacoesFechamento, setObservacoesFechamento] = useState<string>("");
  const [mostrarCalculadoraCedulas, setMostrarCalculadoraCedulas] = useState<boolean>(false);
  const [cedulas, setCedulas] = useState<{ [key: string]: number }>({
    "200": 0,
    "100": 0,
    "50": 0,
    "20": 0,
    "10": 0,
    "5": 0,
    "2": 0,
    "1": 0
  });

  const [modalMovimento, setModalMovimento] = useState<"sangria" | "suprimento" | null>(null);
  const [valorMovimento, setValorMovimento] = useState<number>(100);
  const [motivoMovimento, setMotivoMovimento] = useState<string>("");

  const [modalRelatorioZ, setModalRelatorioZ] = useState<boolean>(false);

  // ==================== FILTROS DO EXTRATO ====================
  const [buscaExtrato, setBuscaExtrato] = useState<string>("");
  const [filtroForma, setFiltroForma] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // ==================== DADOS COMPUTADOS ====================
  const closingData = closingQuery.data;
  const caixa = closingData?.caixa;
  const caixaAberto = caixa?.status === "aberto";

  const transacoes = paymentsQuery.data?.transacoes || [];
  const resumo = paymentsQuery.data?.resumo || {
    totalGeral: 0,
    totalLiquido: 0,
    totalTaxas: 0,
    totalPix: 0,
    totalCredito: 0,
    totalDebito: 0,
    totalDinheiro: 0,
    totalApplePay: 0,
    totalConvenio: 0,
    totalTransacoes: 0,
    ticketMedio: 0,
    taxaAprovacao: "100%",
    saldoDinheiroGaveta: 0
  };

  // Mesas ocupadas para vincular na cobrança
  const mesasOcupadas = useMemo(() => {
    return (tablesQuery.data || []).filter((t: any) => t.status === "ocupada" || t.status === "conta" || (t.total && t.total > 0));
  }, [tablesQuery.data]);

  // Se selecionar mesa ocupada, atualiza valor
  const handleSelecionarMesa = (mesaNum: number) => {
    setMesaSelecionada(mesaNum);
    const m = (tablesQuery.data || []).find((t: any) => t.tableNumber === mesaNum);
    if (m && m.total > 0) {
      setValorInput(m.total);
      setCanalOrigem(`Salão (Mesa ${String(mesaNum).padStart(2, "0")})`);
      if (m.customerName) setClienteNome(m.customerName);
    }
  };

  // Cálculo de cédulas na contagem cega
  const totalCalculadora = useMemo(() => {
    return (
      (cedulas["200"] || 0) * 200 +
      (cedulas["100"] || 0) * 100 +
      (cedulas["50"] || 0) * 50 +
      (cedulas["20"] || 0) * 20 +
      (cedulas["10"] || 0) * 10 +
      (cedulas["5"] || 0) * 5 +
      (cedulas["2"] || 0) * 2 +
      (cedulas["1"] || 0) * 1
    );
  }, [cedulas]);

  const aplicarCalculadora = () => {
    setDinheiroContadoInput(totalCalculadora);
    setMostrarCalculadoraCedulas(false);
  };

  // Submissão do Pagamento
  const handleConfirmarPagamento = () => {
    if (valorInput <= 0) {
      toast.error("Informe um valor maior que R$ 0,00");
      return;
    }

    processPaymentMutation.mutate({
      valor: valorInput,
      forma: formaAtiva,
      canal: canalOrigem,
      clienteNome,
      clienteCpf: clienteCpf ? clienteCpf.trim() : undefined,
      tableNumber: mesaSelecionada || undefined,
      bandeira: formaAtiva.includes("cartao") ? bandeiraCartao : undefined,
      parcelas: formaAtiva === "cartao_credito" ? parcelasCartao : 1,
      trocoPara: formaAtiva === "dinheiro" ? trocoPara : undefined,
      splitDetails: formaAtiva === "split" ? splitFormas : undefined,
      operador: caixa?.operator || "Mariana (Frente de Caixa)",
      emitirNfce
    });
  };

  // Payload Pix Dinâmico gerado em tempo real
  const vStr = valorInput.toFixed(2);
  const pixChaveCopiaCola = useMemo(() => {
    const chave = "36296848000157";
    const lenStr = vStr.length < 10 ? "0" + vStr.length : String(vStr.length);
    return `00020126580014br.gov.bcb.pix0136${chave}52040000530398654${lenStr}${vStr}5802BR5920ZUMA COZINHA ORIENTAL6016TANGARA DA SERRA62070503***6304E8A2`;
  }, [vStr]);

  const qrcodePixUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixChaveCopiaCola)}`;

  const copiarPix = () => {
    navigator.clipboard.writeText(pixChaveCopiaCola);
    toast.success("Código Pix Copia e Cola copiado!", { icon: "📋" });
  };

  // Exportar extrato CSV
  const exportarCsv = () => {
    const headers = "Data/Hora;ID;Canal;Cliente;CPF;Forma;Valor Bruto;Taxa;Valor Liquido;Status;NSU;Autorizacao\n";
    const rows = transacoes.map(t =>
      `"${new Date(t.dataHora).toLocaleString('pt-BR')}";"${t.id}";"${t.canal}";"${t.cliente}";"${t.clienteCpf || ''}";"${t.formaLabel}";"${t.valorBruto.toFixed(2)}";"${t.valorTaxa.toFixed(2)}";"${t.valorLiquido.toFixed(2)}";"${t.status}";"${t.nsu}";"${t.autorizacao}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extrato-pagamentos-zuma-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Extrato exportado em CSV com sucesso!");
  };

  // Filtragem de transações
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      if (filtroForma !== "todas" && t.forma !== filtroForma) return false;
      if (filtroStatus !== "todos" && t.status !== filtroStatus) return false;
      if (buscaExtrato) {
        const q = buscaExtrato.toLowerCase().trim();
        return (
          t.cliente.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.nsu.toLowerCase().includes(q) ||
          t.canal.toLowerCase().includes(q) ||
          (t.detalhes && t.detalhes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [transacoes, filtroForma, filtroStatus, buscaExtrato]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-16 transition-colors">
      {/* ================= HEADER TOP FIXO ================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Título & Identificação */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              💳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Pagamentos &amp; Fechamento Diário
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Zuma Cozinha Oriental
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                CNPJ 36.296.848/0001-57 · Tangará da Serra - MT · Sicredi &amp; TEF Stone
              </p>
            </div>
          </div>

          {/* Badges de Status do Caixa & Ações Rápidas */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
              caixaAberto
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
            }`}>
              <span className={`w-2 h-2 rounded-full ${caixaAberto ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
              <span>{caixaAberto ? `Caixa Aberto (${caixa?.operator?.split(" ")[0] || "Caixa"})` : "Caixa Fechado"}</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 font-mono text-zinc-700 dark:text-zinc-300">
              Gaveta: <strong className="text-zinc-900 dark:text-white">R$ {resumo.saldoDinheiroGaveta.toFixed(2)}</strong>
            </div>

            <button
              onClick={() => {
                paymentsQuery.refetch();
                closingQuery.refetch();
                toast.success("Dados sincronizados em tempo real!");
              }}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Sincronizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS (MINIMALISTA LINEAR STYLE) */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 overflow-x-auto">
          {[
            { id: "cobranca", label: "Terminal de Recebimento", icon: CreditCard },
            { id: "extrato", label: `Extrato & Transações (${resumo.totalTransacoes})`, icon: Receipt },
            { id: "fechamento", label: "Fechamento Diário de Caixa", icon: Lock },
            { id: "terminais", label: "Terminais & Adquirentes", icon: Building2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isAtiva = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id as AbaAtiva)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isAtiva
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ==================================================================== */}
        {/* ABA 1: TERMINAL DE RECEBIMENTO & COBRANÇA RÁPIDA                     */}
        {/* ==================================================================== */}
        {abaAtiva === "cobranca" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Coluna Esquerda: Configuração e Valor (Col 7) */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Terminal de Cobrança Touch
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Selecione a origem, informe o valor e conclua o pagamento em tempo real
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  PDV Balcão 01
                </span>
              </div>

              {/* Seletor de Origem / Mesa Ocupada */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Canal de Origem / Mesa:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCanalOrigem("Salão");
                      setMesaSelecionada(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      canalOrigem === "Salão" && mesaSelecionada === null
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    Salão (Avulso)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCanalOrigem("Balcão / Takeaway");
                      setMesaSelecionada(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      canalOrigem === "Balcão / Takeaway"
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    Balcão / Retirada
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCanalOrigem("Delivery Próprio (WhatsApp)");
                      setMesaSelecionada(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      canalOrigem.includes("Delivery")
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    Delivery WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCanalOrigem("Corporativo Agro B2B");
                      setMesaSelecionada(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      canalOrigem === "Corporativo Agro B2B"
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    Corporativo Agro
                  </button>
                </div>

                {/* Dropdown de Mesas Ocupadas */}
                {mesasOcupadas.length > 0 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Ou vincular a uma Mesa Ocupada do Salão:
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {mesasOcupadas.map((m: any) => (
                        <button
                          key={m.tableNumber}
                          type="button"
                          onClick={() => handleSelecionarMesa(m.tableNumber)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                            mesaSelecionada === m.tableNumber
                              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900"
                              : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          Mesa {m.tableNumber} (R$ {m.total?.toFixed(2) || "0.00"})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Valor a Cobrar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Valor a Cobrar (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-bold text-zinc-400 font-mono">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={valorInput || ""}
                    onChange={(e) => setValorInput(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 text-2xl font-black font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                  />
                </div>

                {/* Atalhos Rápidos de Valor */}
                <div className="flex gap-2 text-xs pt-1">
                  {[20, 50, 100, 150, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValorInput((prev) => Number((prev + v).toFixed(2)))}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono font-semibold transition-colors"
                    >
                      +{v}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setValorInput(Math.ceil(valorInput))}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-semibold"
                  >
                    Arredondar
                  </button>
                  <button
                    type="button"
                    onClick={() => setValorInput(0)}
                    className="px-2.5 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] font-semibold ml-auto"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Dados do Cliente & Fiscal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nome do Cliente / Comanda:
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    CPF na Nota (Opcional):
                  </label>
                  <input
                    type="text"
                    value={clienteCpf}
                    onChange={(e) => setClienteCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Seletor de Formas de Pagamento */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Forma de Pagamento:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "pix", label: "Pix Sicredi", icon: QrCode, badge: "0% taxa" },
                    { id: "cartao_credito", label: "Cartão Crédito", icon: CreditCard, badge: "Stone TEF" },
                    { id: "cartao_debito", label: "Cartão Débito", icon: CreditCard, badge: "1.19% taxa" },
                    { id: "dinheiro", label: "Dinheiro / Gaveta", icon: Banknote, badge: "Troco" },
                    { id: "apple_pay", label: "Apple Pay (NFC)", icon: Smartphone, badge: "Aproximação" },
                    { id: "split", label: "Dividir Conta", icon: Users, badge: "Multimeios" },
                    { id: "convenio_agro", label: "Convênio Agro", icon: Building2, badge: "30 Dias" }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isAtivo = formaAtiva === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormaAtiva(item.id as FormaPagamento)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                          isAtivo
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="w-4 h-4" />
                          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                            isAtivo
                              ? "bg-white/20 dark:bg-black/20 text-white dark:text-zinc-900"
                              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-xs font-bold mt-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subpainel Específico da Forma Selecionada */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                {/* 1. Painel Pix */}
                {formaAtiva === "pix" && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
                    <div className="bg-white p-2 rounded-xl shadow-xs shrink-0 border border-zinc-200">
                      <img src={qrcodePixUrl} alt="QR Code Pix" className="w-32 h-32" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-zinc-900 dark:text-zinc-100">Pix Dinâmico Banco Sicredi</strong>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Chave: 36.296.848/0001-57
                        </span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                        Apresente o QR Code na tela ou copie a chave Copia e Cola para enviar pelo WhatsApp:
                      </p>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={pixChaveCopiaCola}
                          className="w-full font-mono text-[10px] bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                        />
                        <button
                          type="button"
                          onClick={copiarPix}
                          className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-lg shrink-0 hover:opacity-90"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Painel Cartão Crédito */}
                {formaAtiva === "cartao_credito" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Bandeira do Cartão:
                      </label>
                      <select
                        value={bandeiraCartao}
                        onChange={(e) => setBandeiraCartao(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Mastercard">Mastercard</option>
                        <option value="Visa">Visa</option>
                        <option value="Elo">Elo</option>
                        <option value="Amex">American Express</option>
                        <option value="Hipercard">Hipercard</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Parcelamento:
                      </label>
                      <select
                        value={parcelasCartao}
                        onChange={(e) => setParcelasCartao(parseInt(e.target.value, 10))}
                        className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="1">1x à Vista (Taxa 2.49%)</option>
                        <option value="2">2x Sem Juros (Taxa 3.29%)</option>
                        <option value="3">3x Sem Juros (Taxa 3.29%)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. Painel Cartão Débito */}
                {formaAtiva === "cartao_debito" && (
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-zinc-900 dark:text-zinc-100">Transação TEF Stone Smart POS</strong>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">Taxa acordada: 1,19% · Liquidação D+1 útil</p>
                    </div>
                    <div className="font-mono text-zinc-600 dark:text-zinc-400">
                      Líquido: <strong>R$ {(valorInput * (1 - 0.0119)).toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                {/* 4. Painel Dinheiro & Troco */}
                {formaAtiva === "dinheiro" && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Recebido do Cliente (R$):
                      </label>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Gaveta atual: R$ {resumo.saldoDinheiroGaveta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[valorInput, 50, 100, 150, 200].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTrocoPara(val)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                            trocoPara === val
                              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900"
                              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          R$ {val.toFixed(2)}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Troco a devolver:</span>
                      <strong className="font-mono text-base text-emerald-600 dark:text-emerald-400">
                        R$ {Math.max(0, trocoPara - valorInput).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}

                {/* 5. Painel Apple Pay Contactless */}
                {formaAtiva === "apple_pay" && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl"></span>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100">Apple Pay / Contactless (Aproximação NFC)</strong>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                          Aproxime o iPhone ou Apple Watch do terminal Stone Smart 01
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">Taxa 2.19%</span>
                  </div>
                )}

                {/* 6. Painel Split (Divisão) */}
                {formaAtiva === "split" && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Dividir igualmente entre pagadores:
                      </span>
                      <div className="flex gap-1.5">
                        {[2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPessoasSplit(n)}
                            className={`w-7 h-7 rounded-lg border text-xs font-bold ${
                              pessoasSplit === n
                                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center font-mono">
                      <span>Valor por pessoa ({pessoasSplit}x):</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 text-sm">
                        R$ {(valorInput / (pessoasSplit || 1)).toFixed(2)} cada
                      </strong>
                    </div>
                  </div>
                )}

                {/* 7. Painel Convênio Agro */}
                {formaAtiva === "convenio_agro" && (
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-zinc-900 dark:text-zinc-100">Convênio Corporativo Agro Tangará</strong>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">Faturamento quinzenal/mensal com emissão de NF-e Modelo 55</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">Prazo 30D</span>
                  </div>
                )}
              </div>

              {/* Checkbox Fiscal & Botão de Confirmação */}
              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                  <input
                    type="checkbox"
                    checked={emitirNfce}
                    onChange={(e) => setEmitirNfce(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0"
                  />
                  <span>Emitir Cupom Fiscal NFC-e (SEFAZ-MT Série 1) automaticamente</span>
                </label>

                <button
                  type="button"
                  onClick={handleConfirmarPagamento}
                  disabled={processPaymentMutation.isPending || valorInput <= 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processPaymentMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    Confirmar Recebimento de R$ {valorInput.toFixed(2)}
                  </span>
                </button>
              </div>

            </div>

            {/* Coluna Direita: Resumo Financeiro & Feed em Tempo Real (Col 5) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Card de Faturamento Hoje */}
              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Faturamento do Turno
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    100% Conciliado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Total Bruto Hoje</span>
                    <strong className="text-xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      R$ {resumo.totalGeral.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Total Líquido</span>
                    <strong className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      R$ {resumo.totalLiquido.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="text-[10px] text-zinc-500 block">Pix Sicredi</span>
                    <strong className="font-mono font-bold">R$ {resumo.totalPix.toFixed(2)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="text-[10px] text-zinc-500 block">Cartões TEF</span>
                    <strong className="font-mono font-bold">R$ {(resumo.totalCredito + resumo.totalDebito + resumo.totalApplePay).toFixed(2)}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="text-[10px] text-zinc-500 block">Espécie</span>
                    <strong className="font-mono font-bold">R$ {resumo.totalDinheiro.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Feed Recente de Transações */}
              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    Últimos Recebimentos
                  </h3>
                  <button
                    onClick={() => setAbaAtiva("extrato")}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold"
                  >
                    Ver Todos ({transacoes.length}) →
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {transacoes.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setModalRecibo(t)}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 cursor-pointer transition-all space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-zinc-900 dark:text-zinc-100">{t.cliente}</strong>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          R$ {t.valorBruto.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>{t.formaLabel} · {t.canal}</span>
                        <span className="font-mono">{new Date(t.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* ABA 2: EXTRATO & TRANSAÇÕES AUDITADAS                                 */}
        {/* ==================================================================== */}
        {abaAtiva === "extrato" && (
          <div className="space-y-5">
            
            {/* KPI Cards Minimalistas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Total Faturado</span>
                <div className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">R$ {resumo.totalGeral.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% conciliado</div>
              </div>

              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Valor Líquido</span>
                <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">R$ {resumo.totalLiquido.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-400 font-mono">- R$ {resumo.totalTaxas.toFixed(2)} taxas</div>
              </div>

              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Pix Sicredi</span>
                <div className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">R$ {resumo.totalPix.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-400">0% taxa D+0</div>
              </div>

              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Cartões TEF</span>
                <div className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">R$ {(resumo.totalCredito + resumo.totalDebito).toFixed(2)}</div>
                <div className="text-[10px] text-zinc-400">Stone &amp; Cielo</div>
              </div>

              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Espécie na Gaveta</span>
                <div className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">R$ {resumo.saldoDinheiroGaveta.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-400">Físico conferido</div>
              </div>

              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Ticket Médio</span>
                <div className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">R$ {resumo.ticketMedio.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-400">{resumo.totalTransacoes} transações</div>
              </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    value={buscaExtrato}
                    onChange={(e) => setBuscaExtrato(e.target.value)}
                    placeholder="Buscar por cliente, NSU, ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <select
                  value={filtroForma}
                  onChange={(e) => setFiltroForma(e.target.value)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="todas">Todas as Formas</option>
                  <option value="pix">Pix Sicredi</option>
                  <option value="cartao_credito">Cartão Crédito</option>
                  <option value="cartao_debito">Cartão Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="convenio_agro">Convênio Agro</option>
                </select>

                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="estornado">Estornado</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={exportarCsv}
                  className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Tabela de Transações */}
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Hora</th>
                      <th className="py-3 px-4">Código / NSU</th>
                      <th className="py-3 px-4">Canal / Origem</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Forma</th>
                      <th className="py-3 px-4 text-right">Valor Bruto</th>
                      <th className="py-3 px-4 text-right">Líquido</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {transacoesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-zinc-400">
                          Nenhuma transação encontrada com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      transacoesFiltradas.map((t) => (
                        <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-500 whitespace-nowrap">
                            {new Date(t.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold whitespace-nowrap">
                            <span className="text-zinc-900 dark:text-zinc-100">{t.id}</span>
                            <span className="text-zinc-400 block text-[10px]">NSU: {t.nsu}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                            {t.canal}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                            {t.cliente}
                            {t.clienteCpf && <span className="text-zinc-400 block text-[10px] font-mono">{t.clienteCpf}</span>}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t.formaLabel}</span>
                            {t.bandeira && <span className="text-zinc-400 block text-[10px]">{t.bandeira}</span>}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">
                            R$ {t.valorBruto.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-right whitespace-nowrap">
                            R$ {t.valorLiquido.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              t.status === "aprovado"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                            }`}>
                              {t.status === "aprovado" ? "Aprovado" : "Estornado"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => setModalRecibo(t)}
                              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
                            >
                              Recibo
                            </button>
                            {t.status === "aprovado" && (
                              <button
                                onClick={() => {
                                  setModalEstorno(t);
                                  setMotivoEstorno("");
                                }}
                                className="px-2 py-1 rounded bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-[11px] font-semibold text-red-700 dark:text-red-400"
                              >
                                Estornar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* ABA 3: FECHAMENTO DIÁRIO DE CAIXA CORPORATIVO (PADRÃO DINO BARBEARIA) */}
        {/* ==================================================================== */}
        {abaAtiva === "fechamento" && (
          <ErpFechamentoTurno />
        )}

        {/* ==================================================================== */}
                {/* ABA 4: CONFIGURAÇÕES, TERMINAIS & ADQUIRENTES                        */}
        {/* ==================================================================== */}
        {abaAtiva === "terminais" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Configuração Pix Oficial */}
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Pix Sicredi — Conciliação Direta
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Online D+0
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-zinc-400 block text-[10px]">Chave Pix CNPJ:</span>
                  <strong className="text-sm font-bold text-zinc-900 dark:text-zinc-100">36.296.848/0001-57</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-zinc-400 block text-[10px]">Titular da Conta:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100">Zuma Cozinha Oriental LTDA</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-zinc-400 block text-[10px]">Instituição Financeira:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100">748 — Banco Cooperativo Sicredi S.A.</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-zinc-400 block text-[10px]">Agência / Conta:</span>
                  <strong className="text-zinc-900 dark:text-zinc-100">Ag: 0812 · CC: 44.912-0 (Tangará da Serra)</strong>
                </div>
              </div>
            </div>

            {/* Configuração TEF & Maquininhas */}
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Terminais TEF &amp; Taxas Acordadas
                  </h3>
                </div>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded">
                  Stone &amp; Cielo
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100 block">Terminal 01 — Stone Smart POS</strong>
                    <span className="text-[11px] text-zinc-500 font-mono">Serial: STN-9941 · Balcão Caixa</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Conectado</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100 block">Terminal 02 — Cielo LIO Smart</strong>
                    <span className="text-[11px] text-zinc-500 font-mono">Serial: CLO-3312 · Salão / Garçons</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Conectado</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-100 block">Apple Pay / Tap to Pay</strong>
                    <span className="text-[11px] text-zinc-500 font-mono">NFC Contactless Ativo</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ativo</span>
                </div>

                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 font-mono text-[11px] space-y-1 text-zinc-500">
                  <div className="flex justify-between">
                    <span>Taxa Débito:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">1.19% (D+1 útil)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Crédito à Vista:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">2.49% (D+30 ou D+1 antecipado)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Crédito 2x-3x:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">3.29%</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: COMPROVANTE FISCAL DIGITAL / RECIBO                         */}
      {/* ==================================================================== */}
      {modalRecibo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Comprovante de Pagamento</h3>
              <p className="text-xs text-zinc-500">Zuma Cozinha Oriental LTDA · Tangará da Serra - MT</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-2 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-500">Transação ID:</span>
                <strong>{modalRecibo.id || modalRecibo.transacaoId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Data/Hora:</span>
                <span>{new Date(modalRecibo.dataHora).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cliente:</span>
                <strong>{modalRecibo.cliente}</strong>
              </div>
              {modalRecibo.clienteCpf && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">CPF:</span>
                  <span>{modalRecibo.clienteCpf}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Origem / Canal:</span>
                <span>{modalRecibo.canal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Forma de Pagamento:</span>
                <strong className="text-zinc-900 dark:text-zinc-100">{modalRecibo.formaLabel || modalRecibo.forma}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">NSU Autorização:</span>
                <span>{modalRecibo.nsu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Código Autorização:</span>
                <span>{modalRecibo.autorizacao}</span>
              </div>
              {modalRecibo.nfceNumero && (
                <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span>NFC-e Emitida:</span>
                  <span>#{modalRecibo.nfceNumero} (SEFAZ-MT)</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm font-bold">
                <span>VALOR TOTAL:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  R$ {(modalRecibo.valorBruto || modalRecibo.valor || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalRecibo(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  toast.success("Imprimindo comprovante...");
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ESTORNO DE PAGAMENTO COM AUDITORIA                         */}
      {/* ==================================================================== */}
      {modalEstorno && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Estornar Transação {modalEstorno.id}?</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Esta ação estornará o valor de <strong>R$ {modalEstorno.valorBruto?.toFixed(2)}</strong> ({modalEstorno.formaLabel}) e registrará a ocorrência na auditoria de caixa.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Motivo do Estorno (Obrigatório):
              </label>
              <input
                type="text"
                value={motivoEstorno}
                onChange={(e) => setMotivoEstorno(e.target.value)}
                placeholder="Ex: Pagamento duplicado, erro de valor..."
                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalEstorno(null)}
                className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!motivoEstorno.trim() || refundMutation.isPending}
                onClick={() => refundMutation.mutate({ paymentId: modalEstorno.id, motivo: motivoEstorno })}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: FECHAMENTO DE CAIXA / CONFERÊNCIA CEGA                     */}
      {/* ==================================================================== */}
      {modalFecharCaixa && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Fechamento &amp; Conferência Cega de Caixa
                </h3>
              </div>
              <button onClick={() => setModalFecharCaixa(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center font-mono">
                <span className="text-zinc-500">Saldo Teórico em Gaveta:</span>
                <strong className="text-sm">R$ {(closingData?.resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}</strong>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Dinheiro Contado pelo Caixa (R$):
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarCalculadoraCedulas(!mostrarCalculadoraCedulas)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline font-semibold"
                  >
                    {mostrarCalculadoraCedulas ? "Fechar Calculadora" : "Contar por Notas e Moedas"}
                  </button>
                </div>

                <input
                  type="number"
                  step="0.01"
                  value={dinheiroContadoInput}
                  onChange={(e) => setDinheiroContadoInput(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono font-bold text-base bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Calculadora de Cédulas */}
              {mostrarCalculadoraCedulas && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                    Quantidade de Cédulas e Moedas:
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    {["200", "100", "50", "20", "10", "5", "2", "1"].map((val) => (
                      <div key={val} className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block">R$ {val}</span>
                        <input
                          type="number"
                          min="0"
                          value={cedulas[val] || ""}
                          onChange={(e) => setCedulas({ ...cedulas, [val]: parseInt(e.target.value, 10) || 0 })}
                          placeholder="0"
                          className="w-full text-center font-bold text-xs bg-transparent focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <span>Soma das notas: <strong>R$ {totalCalculadora.toFixed(2)}</strong></span>
                    <button
                      type="button"
                      onClick={aplicarCalculadora}
                      className="px-2.5 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-[11px]"
                    >
                      Aplicar Valor
                    </button>
                  </div>
                </div>
              )}

              {/* Quebra Estimada */}
              {(() => {
                const dif = Number((dinheiroContadoInput - (closingData?.resumoGaveta?.saldoEsperadoGaveta || 0)).toFixed(2));
                return (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    dif === 0
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : dif > 0
                      ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300"
                      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300"
                  }`}>
                    <span>{dif === 0 ? "✓ Caixa 100% Batido" : dif > 0 ? "Sobra de Caixa:" : "Quebra de Caixa (Falta):"}</span>
                    <strong className="font-mono">{dif > 0 ? `+ R$ ${dif.toFixed(2)}` : dif < 0 ? `- R$ ${Math.abs(dif).toFixed(2)}` : "R$ 0,00"}</strong>
                  </div>
                );
              })()}

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Observações / Justificativa de Auditoria:
                </label>
                <textarea
                  rows={2}
                  value={observacoesFechamento}
                  onChange={(e) => setObservacoesFechamento(e.target.value)}
                  placeholder="Observações do fechamento de turno..."
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalFecharCaixa(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={closeCashMutation.isPending}
                onClick={() => closeCashMutation.mutate({ countedCash: dinheiroContadoInput, notes: observacoesFechamento })}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: NOVA SANGRIA OU SUPRIMENTO                                  */}
      {/* ==================================================================== */}
      {modalMovimento && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              {modalMovimento === "sangria" ? (
                <Minus className="w-5 h-5 text-red-500" />
              ) : (
                <Plus className="w-5 h-5 text-emerald-500" />
              )}
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {modalMovimento === "sangria" ? "Lançar Sangria de Caixa" : "Lançar Suprimento de Troco"}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Valor da Movimentação (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorMovimento}
                  onChange={(e) => setValorMovimento(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-sm bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Motivo / Justificativa:
                </label>
                <input
                  type="text"
                  value={motivoMovimento}
                  onChange={(e) => setMotivoMovimento(e.target.value)}
                  placeholder={modalMovimento === "sangria" ? "Ex: Depósito de segurança no cofre" : "Ex: Reforço de troco em moedas"}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalMovimento(null)}
                className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={valorMovimento <= 0 || !motivoMovimento.trim() || addMovementMutation.isPending}
                onClick={() => addMovementMutation.mutate({ type: modalMovimento, amount: valorMovimento, reason: motivoMovimento })}
                className="flex-1 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: RELATÓRIO Z TÉRMICO DE FECHAMENTO DIÁRIO (80MM ESC/POS)     */}
      {/* ==================================================================== */}
      {modalRelatorioZ && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Relatório Z Térmico (Fechamento Fiscal)
                </h3>
              </div>
              <button onClick={() => setModalRelatorioZ(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cupom Térmico Estilizado (Visual 80mm Mono) */}
            <div className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-300 dark:border-zinc-800 font-mono text-[11px] space-y-2 overflow-y-auto leading-tight text-zinc-800 dark:text-zinc-200 shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-zinc-400 dark:border-zinc-700">
                <div className="font-bold text-xs uppercase">Zuma Cozinha Oriental LTDA</div>
                <div>CNPJ: 36.296.848/0001-57 · IE: 13.782.910-4</div>
                <div>Rua Celso Rosa Lima, nº 142-W, Centro</div>
                <div>Tangará da Serra - MT · CEP: 78300-000</div>
                <div className="font-bold mt-1 text-xs">*** RELATÓRIO Z DE FECHAMENTO DE CAIXA ***</div>
              </div>

              <div className="pb-2 border-b border-dashed border-zinc-400 dark:border-zinc-700 space-y-0.5">
                <div>DATA/HORA EMISSÃO: {new Date().toLocaleString("pt-BR")}</div>
                <div>CAIXA: {closingData?.turnoId || "CX-01"} · TURNO: JANTAR</div>
                <div>OPERADOR: {closingData?.operador || "Mariana (Frente de Caixa)"}</div>
                <div>SUPERVISOR: {closingData?.supervisor || "Rodrigo R. Gonçalves"}</div>
                <div>STATUS: {caixaAberto ? "TURNO ABERTO" : "TURNO ENCERRADO & AUDITADO"}</div>
              </div>

              <div className="pb-2 border-b border-dashed border-zinc-400 dark:border-zinc-700 space-y-0.5">
                <div className="font-bold uppercase">APURAÇÃO POR FORMA DE PAGAMENTO:</div>
                <div className="flex justify-between">
                  <span>DINHEIRO ESPÉCIE:</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.dinheiro?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PIX INSTANTÂNEO (SICREDI):</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.pix?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CARTÃO CRÉDITO TEF:</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.cartaoCredito?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CARTÃO DÉBITO TEF:</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.cartaoDebito?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>APPLE PAY (NFC):</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.applePay?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CONVÊNIO AGRO B2B:</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.convenioAgro?.valor || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-dashed border-zinc-400 dark:border-zinc-700">
                  <span>TOTAL BRUTO FATURADO:</span>
                  <span>R$ {(closingData?.faturamentoPorMeio?.totalFaturado || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pb-2 border-b border-dashed border-zinc-400 dark:border-zinc-700 space-y-0.5">
                <div className="font-bold uppercase">CONCILIAÇÃO FÍSICA DE GAVETA:</div>
                <div className="flex justify-between">
                  <span>FUNDO TROCO INICIAL:</span>
                  <span>R$ {(closingData?.resumoGaveta?.fundoTrocoInicial || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) ENTRADAS DINHEIRO:</span>
                  <span>R$ {(closingData?.resumoGaveta?.vendasDinheiro || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) SUPRIMENTOS EXTRAS:</span>
                  <span>R$ {(closingData?.resumoGaveta?.suprimentosExtras || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) SANGRIAS DE SEGURANÇA:</span>
                  <span>R$ {(closingData?.resumoGaveta?.sangrias || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>(=) SALDO TEÓRICO ESPERADO:</span>
                  <span>R$ {(closingData?.resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>DINHEIRO FÍSICO CONTADO:</span>
                  <span>R$ {(closingData?.resumoGaveta?.dinheiroContado || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-0.5 border-t border-dashed border-zinc-400 dark:border-zinc-700">
                  <span>DIVERGÊNCIA / QUEBRA:</span>
                  <span>R$ {(closingData?.resumoGaveta?.divergenciaQuebra || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 pb-2 space-y-6 text-center text-[10px]">
                <div>
                  <div className="border-t border-zinc-400 dark:border-zinc-700 w-3/4 mx-auto mb-1" />
                  <div>{closingData?.operador || "Mariana (Frente de Caixa)"}</div>
                  <div className="text-zinc-500">Operador Responsável pelo Caixa</div>
                </div>
                <div>
                  <div className="border-t border-zinc-400 dark:border-zinc-700 w-3/4 mx-auto mb-1" />
                  <div>{closingData?.supervisor || "Rodrigo R. Gonçalves"}</div>
                  <div className="text-zinc-500">Supervisor Geral / Gerente Operacional</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalRelatorioZ(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  toast.success("Enviando comando para impressora térmica 80mm...");
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Relatório Z</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppPagamentos;
