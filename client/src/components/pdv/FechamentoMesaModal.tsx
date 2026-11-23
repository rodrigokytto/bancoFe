import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import { 
  Receipt, 
  X, 
  CreditCard, 
  QrCode, 
  Banknote, 
  DollarSign, 
  Plus, 
  Trash2, 
  Percent, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Tag
} from "lucide-react";
import { toast } from "sonner";

interface PaymentSplitLine {
  method: "pix" | "credito" | "debito" | "dinheiro" | "apple_pay" | "vale";
  amount: number;
  reference?: string;
}

interface FechamentoMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: any;
  onSuccess: () => void;
}

export const FechamentoMesaModal: React.FC<FechamentoMesaModalProps> = ({
  isOpen,
  onClose,
  table,
  onSuccess,
}) => {
  const [operator, setOperator] = useState("Mariana Costa (Caixa Operador)");
  const [includeServiceFee, setIncludeServiceFee] = useState(true);

  // Desconto Gerencial
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState("");
  const [discountAuthorizedBy, setDiscountAuthorizedBy] = useState("Rodrigo Ribeiro Gonçalves (Dono)");

  // Meios Mistos de Pagamento
  const [splits, setSplits] = useState<PaymentSplitLine[]>([
    { method: "pix", amount: 0 }
  ]);
  const [currentMethod, setCurrentMethod] = useState<PaymentSplitLine["method"]>("pix");
  const [currentAmountInput, setCurrentAmountInput] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);

  const closeTableMutation = trpc.zuma.closeTable.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Mesa ${data.tableNumber} encerrada com sucesso! NFC-e #${data.nfcNumber} emitida (SEFAZ-MT).`
      );
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao encerrar mesa: ${err.message}`);
    }
  });

  if (!isOpen || !table) return null;

  const subtotal = table.subtotal || 0;
  const taxaServico = includeServiceFee ? subtotal * 0.1 : 0;
  const totalBruto = subtotal + taxaServico;
  const finalDiscount = hasDiscount ? Math.min(discountAmount, totalBruto) : 0;
  const totalAPagar = Math.max(0, totalBruto - finalDiscount);

  // Soma dos pagamentos lançados
  const totalLancado = splits.reduce((sum, s) => sum + s.amount, 0);
  const restante = Math.max(0, Number((totalAPagar - totalLancado).toFixed(2)));
  const troco = splits.some(s => s.method === "dinheiro") && cashTendered > 0
    ? Math.max(0, Number((cashTendered - (splits.find(s => s.method === "dinheiro")?.amount || 0)).toFixed(2)))
    : 0;

  const handleAddSplit = () => {
    const val = currentAmountInput > 0 ? currentAmountInput : restante;
    if (val <= 0) {
      toast.error("Informe um valor maior que zero para o pagamento.");
      return;
    }
    setSplits(prev => {
      const existing = prev.find(p => p.method === currentMethod);
      if (existing) {
        return prev.map(p => p.method === currentMethod ? { ...p, amount: Number((p.amount + val).toFixed(2)) } : p);
      }
      return [...prev, { method: currentMethod, amount: Number(val.toFixed(2)) }];
    });
    setCurrentAmountInput(0);
  };

  const handleRemoveSplit = (idx: number) => {
    setSplits(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFillRestante = () => {
    if (restante <= 0) return;
    setSplits(prev => {
      const existing = prev.find(p => p.method === currentMethod);
      if (existing) {
        return prev.map(p => p.method === currentMethod ? { ...p, amount: Number((p.amount + restante).toFixed(2)) } : p);
      }
      return [...prev, { method: currentMethod, amount: restante }];
    });
  };

  const handleSubmit = () => {
    if (totalLancado < totalAPagar - 0.05) {
      toast.error(`O valor total lançado (${formatBrl(totalLancado)}) não cobre o total a pagar (${formatBrl(totalAPagar)})!`);
      return;
    }
    if (hasDiscount && discountAmount > 0 && (!discountReason || discountReason.trim().length < 3)) {
      toast.error("Informe a justificativa do desconto para auditoria gerencial.");
      return;
    }

    closeTableMutation.mutate({
      tableNumber: table.tableNumber,
      payments: splits.filter(s => s.amount > 0),
      discountAmount: hasDiscount ? discountAmount : undefined,
      discountReason: hasDiscount ? discountReason : undefined,
      discountAuthorizedBy: hasDiscount ? discountAuthorizedBy : undefined,
      operator,
    });
  };

  const methodIcons: Record<string, any> = {
    pix: QrCode,
    credito: CreditCard,
    debito: CreditCard,
    dinheiro: Banknote,
    apple_pay: Smartphone,
    vale: Tag,
  };

  const methodLabels: Record<string, string> = {
    pix: "Pix Sicredi / Sicoob (0%)",
    credito: "Cartão de Crédito",
    debito: "Cartão de Débito",
    dinheiro: "Dinheiro Físico",
    apple_pay: "Apple Pay / Carteira",
    vale: "Vale Refeição (VR/VA)",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  FECHAMENTO DE COMANDA
                </span>
                <span className="text-xs font-mono opacity-90">NFC-e SEFAZ-MT</span>
              </div>
              <h3 className="text-lg font-black mt-0.5">
                {table.name} · {table.customerCount || 2} Pessoas
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Operador do Caixa & Garçom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-1">
                Operador do Caixa
              </span>
              <input
                type="text"
                value={operator}
                onChange={e => setOperator(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-bold text-[var(--ink)]"
              />
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-1">
                Atendido por
              </span>
              <div className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-bold text-[var(--muted)]">
                {table.waiter || "Salão Zuma"}
              </div>
            </div>
          </div>

          {/* Resumo de Valores */}
          <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Subtotal ({table.orderItems?.length || 0} itens consumidos):</span>
              <span className="font-mono font-bold">{formatBrl(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeServiceFee}
                  onChange={e => setIncludeServiceFee(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span className="text-[var(--ink)] font-medium">Taxa de Serviço 10% (Lei das Gorjetas):</span>
              </label>
              <span className="font-mono font-bold text-emerald-600">
                {formatBrl(taxaServico)}
              </span>
            </div>

            {hasDiscount && (
              <div className="flex items-center justify-between text-xs text-red-600">
                <span>Desconto Gerencial Concedido:</span>
                <span className="font-mono font-bold">-{formatBrl(finalDiscount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-sm font-black text-[var(--ink)] uppercase">Total Final a Pagar:</span>
              <span className="text-xl font-black font-mono text-[var(--salmon)]">
                {formatBrl(totalAPagar)}
              </span>
            </div>
          </div>

          {/* Seção de Desconto Gerencial Controlado por Permissão */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={e => setHasDiscount(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                  Conceder Desconto / Cortesia Auditada
                </span>
              </label>
              <span className="text-[10px] text-amber-800 font-semibold">Exige Supervisor</span>
            </div>

            {hasDiscount && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-500/20">
                <div>
                  <span className="text-[10px] text-amber-900 block font-bold mb-1">Valor do Desconto (R$):</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-amber-900 block font-bold mb-1">Motivo / Justificativa:</span>
                  <input
                    type="text"
                    placeholder="Ex: Aniversário / Cortesia Dono"
                    value={discountReason}
                    onChange={e => setDiscountReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-amber-900 block font-bold mb-1">Autorizado por:</span>
                  <select
                    value={discountAuthorizedBy}
                    onChange={e => setDiscountAuthorizedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs font-semibold"
                  >
                    <option value="Rodrigo Ribeiro Gonçalves (Dono)">Rodrigo (Dono - PIN 9901)</option>
                    <option value="Mariana Costa (Gerente)">Mariana (Gerente - PIN 4421)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Divisão de Meios Mistos de Pagamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--ink)] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Composição do Pagamento (Múltiplos Meios)
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600">
                Restante: {formatBrl(restante)}
              </span>
            </div>

            {/* Inserir nova forma de pagamento */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
              <select
                value={currentMethod}
                onChange={e => setCurrentMethod(e.target.value as any)}
                className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-semibold"
              >
                <option value="pix">Pix Sicredi / Sicoob (0% taxa)</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro Físico</option>
                <option value="apple_pay">Apple Pay / Contactless</option>
                <option value="vale">Vale Refeição (VR/VA)</option>
              </select>

              <div className="flex items-center gap-1">
                <span className="font-mono text-xs font-bold text-[var(--muted)]">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  placeholder={restante.toFixed(2)}
                  value={currentAmountInput || ""}
                  onChange={e => setCurrentAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono font-bold text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleFillRestante}
                className="px-2 py-1.5 bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] rounded text-[11px] font-bold text-[var(--ink)] cursor-pointer"
                title="Preencher com o saldo restante"
              >
                Completar Restante
              </button>

              <button
                type="button"
                onClick={handleAddSplit}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ml-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            {/* Lista dos pagamentos adicionados */}
            <div className="space-y-1.5">
              {splits.map((s, idx) => {
                const Icon = methodIcons[s.method] || CreditCard;
                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-[var(--ink)]">{methodLabels[s.method]}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-[var(--ink)]">
                        {formatBrl(s.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSplit(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        title="Remover forma de pagamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dinheiro & Troco */}
            {splits.some(s => s.method === "dinheiro") && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-900 block font-bold">
                    Valor Entregue pelo Cliente em Dinheiro:
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-bold text-xs text-emerald-900">R$</span>
                    <input
                      type="number"
                      step="1"
                      value={cashTendered || ""}
                      onChange={e => setCashTendered(parseFloat(e.target.value) || 0)}
                      placeholder={splits.find(s => s.method === "dinheiro")?.amount.toString()}
                      className="w-24 px-2 py-1 bg-white border border-emerald-400 rounded font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 block font-bold">Troco a Devolver:</span>
                  <span className="font-mono font-black text-base text-emerald-700">
                    {formatBrl(troco)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Botão de Confirmação e Emissão Fiscal */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-[var(--muted)] block">Total Lançado:</span>
            <span className={`font-mono font-black text-sm ${
              totalLancado >= totalAPagar ? "text-emerald-600" : "text-amber-600"
            }`}>
              {formatBrl(totalLancado)} / {formatBrl(totalAPagar)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]/30 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={closeTableMutation.isPending || totalLancado < totalAPagar - 0.05}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{closeTableMutation.isPending ? "Emitindo NFC-e SEFAZ..." : "Encerrar Mesa & Emitir NFC-e"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
