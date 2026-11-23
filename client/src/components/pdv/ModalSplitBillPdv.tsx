import React, { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import { 
  X, 
  Users, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Percent, 
  Receipt, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  ArrowRight, 
  Copy, 
  RefreshCw,
  Wallet,
  Check,
  Tag,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { TableItem } from "../../../../server/dataStore";

interface ModalSplitBillPdvProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | any;
  onSuccess: () => void;
  onOpenFiscalModal: (dados: { total: number; payments: Array<{ method: string; amount: number }> }) => void;
}

interface Pagante {
  id: string;
  nome: string;
  valor: number;
  pago: boolean;
  metodo?: "pix" | "credito" | "debito" | "dinheiro" | "vale" | "apple_pay";
  comprovante?: any;
}

const TERMINAIS_POS = [
  "SmartPOS Stone P2 (Balcão)",
  "SmartPOS PagBank Pro (Salão 01)",
  "SmartPOS Rede Smart (Salão 02)",
  "TEF PinPad USB Caixa"
];

export const ModalSplitBillPdv: React.FC<ModalSplitBillPdvProps> = ({
  isOpen,
  onClose,
  table,
  onSuccess,
  onOpenFiscalModal
}) => {
  const [modoDivisao, setModoDivisao] = useState<"igualitaria" | "itens" | "livre">("igualitaria");
  const [numPessoas, setNumPessoas] = useState<number>(2);
  const [incluirTaxa, setIncluirTaxa] = useState(true);
  const [taxaPercent, setTaxaPercent] = useState(10);
  const [descontoAmount, setDescontoAmount] = useState<number>(0);
  const [descontoMotivo, setDescontoMotivo] = useState("");

  // Lista de pagantes
  const [pagantes, setPagantes] = useState<Pagante[]>([]);
  const [selectedPaganteId, setSelectedPaganteId] = useState<string>("");

  // Estado do Pagamento do Pagante Selecionado
  const [activePaymentMethod, setActivePaymentMethod] = useState<"pix" | "credito" | "debito" | "dinheiro" | "outros">("pix");
  
  // Pix States
  const [pixPayload, setPixPayload] = useState<any>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);

  // Cartão States
  const [selectedTerminal, setSelectedTerminal] = useState(TERMINAIS_POS[0]);
  const [cardBrand, setCardBrand] = useState("Mastercard");
  const [cardInstallments, setCardInstallments] = useState(1);
  const [posStage, setPosStage] = useState<"idle" | "sending" | "waiting_card" | "pin" | "approved">("idle");
  const [posResult, setPosResult] = useState<any>(null);

  // Dinheiro States
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Mutations
  const generatePixMutation = trpc.zuma.generatePixPayload.useMutation();
  const processPosMutation = trpc.zuma.processSmartPosTransaction.useMutation();
  const closeTableMutation = trpc.zuma.closeTable.useMutation({
    onSuccess: (data) => {
      toast.success(`Mesa ${data.tableNumber} encerrada com sucesso!`, {
        description: `Total pago: ${formatBrl(data.finalTotal)} · NFC-e autorizada.`,
        icon: "🎉"
      });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao encerrar mesa: ${err.message}`);
    }
  });

  // Cálculos de Totais
  const subtotalItens = table?.subtotal || 0;
  const taxaServico = incluirTaxa ? (subtotalItens * (taxaPercent / 100)) : 0;
  const totalBruto = subtotalItens + taxaServico;
  const totalComDesconto = Math.max(0, totalBruto - descontoAmount);

  // Inicializa lista de pagantes
  useEffect(() => {
    if (table) {
      const initialCount = Math.max(2, table.customerCount || 2);
      setNumPessoas(initialCount);
      recalcularPagantes(initialCount, totalComDesconto);
    }
  }, [table?.tableNumber, totalComDesconto]);

  const recalcularPagantes = (count: number, total: number) => {
    const valorBase = Math.floor((total / count) * 100) / 100;
    const diferencaCentavos = Number((total - (valorBase * count)).toFixed(2));

    const novos: Pagante[] = Array.from({ length: count }, (_, i) => ({
      id: `pag_${i + 1}`,
      nome: i === 0 && table?.customerName ? table.customerName : `Pessoa ${i + 1}`,
      valor: i === 0 ? Number((valorBase + diferencaCentavos).toFixed(2)) : valorBase,
      pago: false
    }));

    setPagantes(novos);
    setSelectedPaganteId(novos[0]?.id || "");
  };

  const handleUpdateNumPessoas = (count: number) => {
    const n = Math.max(1, count);
    setNumPessoas(n);
    recalcularPagantes(n, totalComDesconto);
  };

  const currentPagante = pagantes.find(p => p.id === selectedPaganteId) || pagantes[0];

  // Disparar geração de Pix quando seleciona PIX
  useEffect(() => {
    if (activePaymentMethod === "pix" && currentPagante && !currentPagante.pago) {
      setIsGeneratingPix(true);
      generatePixMutation.mutate({
        tableNumber: table.tableNumber,
        amount: currentPagante.valor,
        reference: `Mesa ${table.tableNumber} - ${currentPagante.nome}`
      }, {
        onSuccess: (data) => {
          setPixPayload(data);
          setIsGeneratingPix(false);
        },
        onError: () => setIsGeneratingPix(false)
      });
    }
  }, [activePaymentMethod, currentPagante?.id, currentPagante?.valor]);

  if (!isOpen || !table) return null;

  // Totais pagos e pendentes
  const totalPago = pagantes.filter(p => p.pago).reduce((sum, p) => sum + p.valor, 0);
  const saldoRestante = Math.max(0, Number((totalComDesconto - totalPago).toFixed(2)));
  const todosPagaram = saldoRestante <= 0.05 && pagantes.every(p => p.pago);

  // 1. Confirmar PIX Instantâneo
  const handleConfirmPix = () => {
    if (!currentPagante) return;
    toast.success(`⚡ Pix de ${formatBrl(currentPagante.valor)} confirmado via Sicredi MT!`, {
      description: `E2E: ${pixPayload?.endToEndId || "Confirmado"} · Autenticação em 14ms`,
      icon: "✅"
    });

    setPagantes(prev => prev.map(p => 
      p.id === currentPagante.id 
        ? { ...p, pago: true, metodo: "pix", comprovante: pixPayload } 
        : p
    ));

    // Seleciona próximo não pago
    const proximo = pagantes.find(p => p.id !== currentPagante.id && !p.pago);
    if (proximo) setSelectedPaganteId(proximo.id);
  };

  // 2. Disparar SmartPOS TEF
  const handleTriggerSmartPos = () => {
    if (!currentPagante) return;
    setPosStage("sending");

    setTimeout(() => {
      setPosStage("waiting_card");
      setTimeout(() => {
        setPosStage("pin");
        setTimeout(() => {
          processPosMutation.mutate({
            tableNumber: table.tableNumber,
            amount: currentPagante.valor,
            method: activePaymentMethod === "credito" ? "credito" : "debito",
            installments: cardInstallments,
            posTerminal: selectedTerminal,
            cardBrand,
            operator: "Frente de Caixa"
          }, {
            onSuccess: (res) => {
              setPosStage("approved");
              setPosResult(res);
              toast.success(`💳 Transação Cartão Aprovada na maquininha!`, {
                description: `NSU: ${res.nsu} · Aut: ${res.authCode} · ${res.cardBrand}`,
                icon: "✅"
              });

              setPagantes(prev => prev.map(p => 
                p.id === currentPagante.id 
                  ? { ...p, pago: true, metodo: activePaymentMethod as any, comprovante: res } 
                  : p
              ));

              const proximo = pagantes.find(p => p.id !== currentPagante.id && !p.pago);
              if (proximo) setSelectedPaganteId(proximo.id);
            }
          });
        }, 1200);
      }, 1400);
    }, 1000);
  };

  // 3. Confirmar Dinheiro
  const handleConfirmDinheiro = () => {
    if (!currentPagante) return;
    const troco = Math.max(0, cashTendered - currentPagante.valor);
    toast.success(`💵 Dinheiro registrado! Troco a devolver: ${formatBrl(troco)}`, {
      icon: "💵"
    });

    setPagantes(prev => prev.map(p => 
      p.id === currentPagante.id 
        ? { ...p, pago: true, metodo: "dinheiro", comprovante: { troco, recebido: cashTendered } } 
        : p
    ));

    const proximo = pagantes.find(p => p.id !== currentPagante.id && !p.pago);
    if (proximo) setSelectedPaganteId(proximo.id);
  };

  // Finalizar encerramento da mesa
  const handleFinalizarMesa = () => {
    const paymentsSummary = pagantes.map(p => ({
      method: p.metodo || "pix",
      amount: p.valor
    }));

    closeTableMutation.mutate({
      tableNumber: table.tableNumber,
      payments: paymentsSummary,
      discountAmount: descontoAmount,
      discountReason: descontoMotivo,
      splitCount: pagantes.length,
      operator: "Frente de Caixa"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl max-h-[94vh] bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--ink)] flex items-center gap-2">
                Dividir Conta & Pagamento Integrado · Mesa {String(table.tableNumber).padStart(2, "0")}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                  {pagantes.length} Pessoas
                </span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Divisão igualitária ou avulsa com liquidação automática via Pix Sicredi MT, SmartPOS TEF e Dinheiro
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra Superior de Resumo e Configuração da Divisão */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--surface)] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Seletor de Pessoas */}
          <div className="md:col-span-5 flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--ink)] whitespace-nowrap">Dividir em:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {[2, 3, 4, 5, 6, 8, 10].map(n => (
                <button
                  key={n}
                  onClick={() => handleUpdateNumPessoas(n)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    numPessoas === n 
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs" 
                      : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-amber-400"
                  }`}
                >
                  {n}x
                </button>
              ))}
            </div>
          </div>

          {/* Toggle de Taxa e Desconto */}
          <div className="md:col-span-4 flex items-center gap-3">
            <button
              onClick={() => setIncluirTaxa(!incluirTaxa)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                incluirTaxa 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                  : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)]"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Taxa 10% ({incluirTaxa ? "Ativa" : "Isenta"})</span>
            </button>
          </div>

          {/* Totais do Cabeçalho */}
          <div className="md:col-span-3 text-right">
            <span className="text-[11px] text-[var(--muted)] block">Total Geral da Mesa:</span>
            <span className="text-base font-extrabold font-mono text-[var(--salmon)]">
              {formatBrl(totalComDesconto)}
            </span>
          </div>
        </div>

        {/* Conteúdo Principal: Lista de Pagantes (Esquerda) e Terminal de Pagamento (Direita) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Lista de Pagantes (4 colunas) */}
          <div className="md:col-span-5 p-4 border-r border-[var(--line)] overflow-y-auto max-h-[58vh] space-y-2 bg-[var(--surface2)]">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)] pb-1">
              <span>Pagantes ({pagantes.length})</span>
              <span>Valor Cota</span>
            </div>

            {pagantes.map((pag, idx) => {
              const isSelected = pag.id === currentPagante?.id;
              return (
                <div
                  key={pag.id}
                  onClick={() => setSelectedPaganteId(pag.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? "bg-[var(--surface)] border-[var(--salmon)] ring-2 ring-[var(--salmon)]/30 shadow-xs" 
                      : "bg-[var(--surface)] border-[var(--line)] hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      pag.pago 
                        ? "bg-emerald-100 text-emerald-700" 
                        : isSelected ? "bg-[var(--salmon)] text-white" : "bg-neutral-200 text-neutral-800"
                    }`}>
                      {pag.pago ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                    </div>
                    <div>
                      <input 
                        type="text"
                        value={pag.nome}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPagantes(prev => prev.map(p => p.id === pag.id ? { ...p, nome: val } : p));
                        }}
                        className="font-bold text-xs text-[var(--ink)] bg-transparent hover:bg-[var(--line)]/30 rounded px-1 -ml-1 w-32 sm:w-40"
                      />
                      <span className={`text-[10px] font-bold block ${
                        pag.pago ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {pag.pago ? `PAGO (${pag.metodo?.toUpperCase()})` : "Pendente de pagamento"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-sm text-[var(--ink)] block">
                      {formatBrl(pag.valor)}
                    </span>
                    {pag.pago && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Liquidado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Barra de Progresso Geral */}
            <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700">Pago: {formatBrl(totalPago)}</span>
                <span className="text-amber-800">Restante: {formatBrl(saldoRestante)}</span>
              </div>
              <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalPago / (totalComDesconto || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Terminal Integrado de Pagamento (7 colunas) */}
          <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[58vh] bg-[var(--surface)]">
            {currentPagante ? (
              <div className="space-y-4">
                {/* Header do Pagante Atual */}
                <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Cobrando agora:</span>
                    <h4 className="font-extrabold text-base text-[var(--ink)] flex items-center gap-2">
                      {currentPagante.nome}
                      {currentPagante.pago && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          PAGO
                        </span>
                      )}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--muted)] block">Valor a Pagar:</span>
                    <span className="text-lg font-extrabold font-mono text-[var(--salmon)]">
                      {formatBrl(currentPagante.valor)}
                    </span>
                  </div>
                </div>

                {!currentPagante.pago ? (
                  <>
                    {/* Seletor de Meio de Pagamento */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "pix", label: "Pix Sicredi", icon: QrCode },
                        { id: "credito", label: "Crédito TEF", icon: CreditCard },
                        { id: "debito", label: "Débito TEF", icon: CreditCard },
                        { id: "dinheiro", label: "Dinheiro", icon: Banknote },
                      ].map(m => {
                        const Icon = m.icon;
                        const isAct = activePaymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setActivePaymentMethod(m.id as any)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isAct 
                                ? "bg-[var(--salmon)] text-white border-[var(--salmon)] shadow-sm" 
                                : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px] font-bold">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Conteúdo Específico por Meio de Pagamento */}
                    {activePaymentMethod === "pix" && (
                      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-emerald-700" />
                            Pix Dinâmico EMV Sicredi MT (0% taxa)
                          </span>
                          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded animate-pulse">
                            Aguardando Webhook
                          </span>
                        </div>

                        {/* QR Code e Linha Copia e Cola */}
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-emerald-200">
                          {/* SVG do QR Code mock */}
                          <div className="w-24 h-24 bg-neutral-900 rounded p-1 flex items-center justify-center shrink-0">
                            <QrCode className="w-20 h-20 text-white" />
                          </div>
                          <div className="flex-1 space-y-1 text-xs">
                            <span className="font-bold text-neutral-900 block truncate">Zuma Cozinha Oriental Ltda</span>
                            <span className="text-[11px] text-neutral-600 block">Chave CNPJ: 36.296.848/0001-57</span>
                            <span className="text-[11px] text-neutral-600 block">Banco: Sicredi MT (Coop 0716)</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (pixPayload?.emvPayload) {
                                  navigator.clipboard.writeText(pixPayload.emvPayload);
                                  toast.success("Código Pix Copia e Cola copiado!", { icon: "📋" });
                                }
                              }}
                              className="mt-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-[10px] font-bold text-neutral-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Copiar Código Pix Copia e Cola
                            </button>
                          </div>
                        </div>

                        {/* Botão de Confirmação Rápida */}
                        <button
                          type="button"
                          onClick={handleConfirmPix}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Confirmar Recebimento Pix Instantâneo ({formatBrl(currentPagante.valor)})</span>
                        </button>
                      </div>
                    )}

                    {(activePaymentMethod === "credito" || activePaymentMethod === "debito") && (
                      <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-indigo-700" />
                            SmartPOS TEF Integrado ({activePaymentMethod.toUpperCase()})
                          </span>
                        </div>

                        {/* Configurações da Maquininha */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-indigo-900 block mb-1">Terminal SmartPOS</label>
                            <select
                              value={selectedTerminal}
                              onChange={(e) => setSelectedTerminal(e.target.value)}
                              className="w-full p-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950 cursor-pointer"
                            >
                              {TERMINAIS_POS.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-indigo-900 block mb-1">Bandeira do Cartão</label>
                            <select
                              value={cardBrand}
                              onChange={(e) => setCardBrand(e.target.value)}
                              className="w-full p-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950 cursor-pointer"
                            >
                              <option value="Mastercard">Mastercard</option>
                              <option value="Visa">Visa</option>
                              <option value="Elo">Elo</option>
                              <option value="American Express">American Express</option>
                              <option value="Hipercard">Hipercard</option>
                            </select>
                          </div>
                        </div>

                        {activePaymentMethod === "credito" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-950">Parcelamento:</span>
                            {[1, 2, 3, 4].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setCardInstallments(p)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  cardInstallments === p 
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" 
                                    : "bg-white border-indigo-300 text-indigo-900"
                                }`}
                              >
                                {p}x {p > 1 ? `(${formatBrl(currentPagante.valor / p)})` : "à vista"}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Status Interativo da Maquininha */}
                        {posStage !== "idle" && (
                          <div className="p-3 bg-white rounded-lg border border-indigo-300 space-y-1.5 text-center animate-in fade-in">
                            <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-xs">
                              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                              {posStage === "sending" && "Enviando comando para maquininha SmartPOS..."}
                              {posStage === "waiting_card" && "Aguardando aproximação ou inserção do cartão..."}
                              {posStage === "pin" && "Lendo chip e aguardando senha do cliente..."}
                              {posStage === "approved" && "Transação TEF Aprovada com Sucesso!"}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">Terminal: {selectedTerminal}</span>
                          </div>
                        )}

                        {/* Botão de Disparo */}
                        <button
                          type="button"
                          onClick={handleTriggerSmartPos}
                          disabled={posStage !== "idle" && posStage !== "approved"}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Disparar Pagamento na Maquininha ({formatBrl(currentPagante.valor)})</span>
                        </button>
                      </div>
                    )}

                    {activePaymentMethod === "dinheiro" && (
                      <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-amber-700" />
                          Dinheiro em Espécie (Caixa Frente)
                        </span>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-amber-900">Valor Entregue pelo Cliente</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="5"
                              value={cashTendered || ""}
                              onChange={(e) => setCashTendered(Number(e.target.value))}
                              placeholder={`Ex: ${Math.ceil(currentPagante.valor / 10) * 10}`}
                              className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-base font-bold font-mono text-neutral-900"
                            />
                            {[20, 50, 100, 200].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setCashTendered(val)}
                                className="px-2.5 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-xs font-bold text-amber-900 cursor-pointer"
                              >
                                R$ {val}
                              </button>
                            ))}
                          </div>
                        </div>

                        {cashTendered > currentPagante.valor && (
                          <div className="p-2.5 bg-emerald-100 rounded-lg border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-950">
                            <span>Troco a Devolver:</span>
                            <span className="text-base font-mono font-extrabold text-emerald-800">
                              {formatBrl(cashTendered - currentPagante.valor)}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleConfirmDinheiro}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Registrar Pagamento em Dinheiro ({formatBrl(currentPagante.valor)})</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Card de Pagamento Concluído do Pagante */
                  <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h5 className="font-extrabold text-emerald-950 text-sm">Pagamento Liquidado com Sucesso!</h5>
                    <p className="text-xs text-emerald-800">
                      Cota de {formatBrl(currentPagante.valor)} quitada via {currentPagante.metodo?.toUpperCase()}.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Rodapé com Fechamento e Emissão Fiscal */}
        <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--muted)]">Status da Mesa:</span>
            <span className={`ml-2 text-xs font-bold ${todosPagaram ? "text-emerald-700" : "text-amber-800"}`}>
              {todosPagaram ? "100% da conta liquidada" : `Faltam ${formatBrl(saldoRestante)}`}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-xl transition-all cursor-pointer"
            >
              Fechar Janela
            </button>

            <button
              type="button"
              onClick={() => {
                const payments = pagantes.filter(p => p.pago).map(p => ({
                  method: p.metodo || "pix",
                  amount: p.valor
                }));
                onOpenFiscalModal({
                  total: totalComDesconto,
                  payments: payments.length > 0 ? payments : [{ method: "pix", amount: totalComDesconto }]
                });
              }}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Emitir NFC-e com CPF</span>
            </button>

            <button
              type="button"
              onClick={handleFinalizarMesa}
              disabled={closeTableMutation.isPending || !todosPagaram}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                todosPagaram 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-neutral-400 cursor-not-allowed opacity-60"
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{closeTableMutation.isPending ? "Encerrando..." : "Concluir Mesa & Liberar Salão"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Zap(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
