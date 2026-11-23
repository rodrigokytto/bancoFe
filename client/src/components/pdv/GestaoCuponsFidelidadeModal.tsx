import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Copy, 
  Clock, 
  Percent, 
  ShoppingBag, 
  Gift, 
  Store, 
  Bike,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

interface GestaoCuponsFidelidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon?: (code: string, discountBrl: number) => void;
}

export const GestaoCuponsFidelidadeModal: React.FC<GestaoCuponsFidelidadeModalProps> = ({
  isOpen,
  onClose,
  onApplyCoupon,
}) => {
  const [testCode, setTestCode] = useState("ZUMAVIP");
  const [testValue, setTestValue] = useState(150.0);
  const [testChannel, setTestChannel] = useState<"salao" | "balcao" | "delivery" | "roupas">("delivery");

  const { data: coupons = [], refetch } = trpc.zuma.getPromoCoupons.useQuery(undefined, {
    enabled: isOpen
  });

  const validateMutation = trpc.zuma.validateCoupon.useMutation({
    onSuccess: (res) => {
      if (res.valid) {
        toast.success(res.message);
        if (onApplyCoupon && res.coupon) {
          onApplyCoupon(res.coupon.code, res.discountBrl);
        }
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Cupom "${code}" copiado para a área de transferência!`);
  };

  const handleTestCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    validateMutation.mutate({
      code: testCode,
      orderValue: testValue,
      channel: testChannel
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  CRM &amp; FIDELIDADE ZUMA
                </span>
                <span className="text-[10px] text-purple-800 dark:text-purple-300 font-mono">
                  Gastronomia + Loja de Roupas
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                Gestão de Cupons Promocionais &amp; Cashback
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulador de Validação de Cupons */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--surface2)]">
          <form onSubmit={handleTestCoupon} className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Código do Cupom:</label>
              <div className="relative">
                <input
                  type="text"
                  value={testCode}
                  onChange={e => setTestCode(e.target.value.toUpperCase())}
                  placeholder="EX: ZUMAVIP"
                  className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-mono font-bold uppercase focus:outline-hidden"
                />
                <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-600" />
              </div>
            </div>

            <div className="w-28">
              <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Valor Pedido (R$):</label>
              <input
                type="number"
                step="0.01"
                value={testValue}
                onChange={e => setTestValue(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div className="w-36">
              <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Canal de Venda:</label>
              <select
                value={testChannel}
                onChange={e => setTestChannel(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-semibold"
              >
                <option value="delivery">Delivery</option>
                <option value="salao">Salão (Mesa)</option>
                <option value="balcao">Balcão / Retirada</option>
                <option value="roupas">Loja de Roupas</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={validateMutation.isPending}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{validateMutation.isPending ? "Validando..." : "Testar / Aplicar Cupom"}</span>
              </button>
            </div>
          </form>

          {validateMutation.data && (
            <div className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
              validateMutation.data.valid
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200"
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{validateMutation.data.message}</span>
              </div>
              {validateMutation.data.valid && (
                <span className="font-mono font-bold text-sm text-emerald-600">
                  - R$ {validateMutation.data.discountBrl.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Grade de Cupons Ativos */}
        <div className="p-4 overflow-y-auto flex-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted)] mb-3">
            Cupons Vigentes no Ecossistema Zuma
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {coupons.map(c => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-purple-500/40 transition shadow-xs relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono font-extrabold text-xs">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="p-1 hover:bg-[var(--surface2)] rounded text-[var(--muted)] hover:text-purple-600 transition cursor-pointer"
                      title="Copiar código"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                    {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `R$ ${c.discountValue.toFixed(2)} OFF`}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-[var(--muted)] mb-3">
                  <div>Pedido mínimo: <strong className="text-[var(--ink)]">R$ {c.minOrderValue.toFixed(2)}</strong></div>
                  <div>Usos: <strong className="text-[var(--ink)]">{c.currentUses} / {c.maxUses}</strong></div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.allowedChannels.map(ch => (
                      <span key={ch} className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[var(--surface2)] uppercase">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTestCode(c.code);
                    toast.info(`Cupom ${c.code} selecionado no simulador!`);
                  }}
                  className="w-full py-1.5 rounded-lg bg-[var(--surface2)] hover:bg-purple-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
                >
                  Usar no Caixa / PDV
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[var(--muted)]">
            Integrado ao Clube Zumi: clientes com mais de 5 pedidos ganham cashback de 5% no saldo da carteira.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--ink)] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Fechar Cupons
          </button>
        </div>
      </div>
    </div>
  );
};
