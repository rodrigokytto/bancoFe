import React, { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import { 
  X, 
  Trash2, 
  Save, 
  Edit3, 
  Plus, 
  Minus, 
  AlertTriangle, 
  ShieldAlert, 
  Tag, 
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { TableOrderItem } from "../../../../server/dataStore";

interface ModalEditarItemMesaProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  item: TableOrderItem | any;
  onSuccess: () => void;
}

const MOTIVOS_CANCELAMENTO = [
  "Cliente desistiu do prato",
  "Erro de digitação / duplicidade do garçom",
  "Demora excessiva na cozinha (>30 min)",
  "Item em falta / ruptura de insumo no Sushibar",
  "Cliente trocou de prato",
  "Problema na qualidade / prato devolvido",
  "Cortesia autorizada pela gerência"
];

export const ModalEditarItemMesa: React.FC<ModalEditarItemMesaProps> = ({
  isOpen,
  onClose,
  tableNumber,
  item,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [observacoes, setObservacoes] = useState("");
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState(MOTIVOS_CANCELAMENTO[0]);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity || 1);
      setUnitPrice(item.unitPrice || 0);
      setObservacoes(item.observacoes || "");
      setReason("");
      setIsCancelling(false);
    }
  }, [item]);

  const updateItemMutation = trpc.zuma.updateTableItem.useMutation({
    onSuccess: () => {
      toast.success("Item modificado e atualizado na comanda!", {
        description: `Quantidade: ${quantity}x · Unitário: ${formatBrl(unitPrice)}`,
        icon: "✏️"
      });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar item: ${err.message}`);
    }
  });

  const cancelItemMutation = trpc.zuma.cancelTableItem.useMutation({
    onSuccess: () => {
      toast.success("Item cancelado da comanda!", {
        description: `Motivo: ${cancelReason} · Registrado na Trilha de Auditoria.`,
        icon: "🗑️"
      });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao cancelar item: ${err.message}`);
    }
  });

  if (!isOpen || !item) return null;

  const handleSaveModifications = () => {
    updateItemMutation.mutate({
      tableNumber,
      itemId: item.id || item.itemName,
      quantity,
      unitPrice,
      observacoes: observacoes.trim(),
      reason: reason.trim() || "Ajuste operacional de comanda",
      operator: "Frente de Caixa"
    });
  };

  const handleConfirmCancel = () => {
    cancelItemMutation.mutate({
      tableNumber,
      itemId: item.id || item.itemName,
      reason: cancelReason,
      cancelledBy: "Frente de Caixa / Gerente"
    });
  };

  const totalItem = quantity * unitPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--ink)]">
                Modificar / Corrigir Item
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Mesa {String(tableNumber).padStart(2, "0")} · Praça {item.station || "Sushibar"}
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

        {/* Corpo */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Dados do Prato */}
          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Prato Selecionado</span>
              <h4 className="font-extrabold text-sm sm:text-base text-[var(--ink)]">{item.itemName}</h4>
              {item.adicionais && item.adicionais.length > 0 && (
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Extras: {item.adicionais.map((a: any) => a.nome).join(", ")}
                </div>
              )}
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-200 text-neutral-800">
              {item.station}
            </span>
          </div>

          {!isCancelling ? (
            <div className="space-y-4">
              {/* Ajuste de Quantidade e Preço Unitário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">Quantidade</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-center text-xs font-bold hover:bg-[var(--line)] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-16 text-center font-bold text-sm font-mono py-1 bg-[var(--surface2)] border border-[var(--line)] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-[var(--salmon)] text-white flex items-center justify-center text-xs font-bold hover:bg-[#d4532e] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Preço Unitário (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.10"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-sm font-bold font-mono text-[var(--ink)]"
                  />
                </div>
              </div>

              {/* Observações do Prato */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">Observações de Preparo</label>
                <input 
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Sem cebolinha, molho à parte..."
                  className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50"
                />
              </div>

              {/* Justificativa da Alteração (opcional para auditoria) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--muted)]">Motivo / Justificativa da Alteração</label>
                <input 
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Correção de quantidade solicitada pelo cliente, desconto concedido..."
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)]"
                />
              </div>

              {/* Resumo do Total */}
              <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ink)]">Novo Total do Item:</span>
                <span className="text-base font-extrabold font-mono text-[var(--salmon)]">
                  {formatBrl(totalItem)}
                </span>
              </div>
            </div>
          ) : (
            /* Modo de Cancelamento com Justificativa Obrigatória */
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Confirmar Cancelamento do Item da Comanda</span>
              </div>
              <p className="text-xs text-red-700">
                O cancelamento será registrado na trilha de auditoria e comunicado à praça no KDS.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-red-950">Motivo do Cancelamento</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs font-semibold text-red-900 cursor-pointer"
                >
                  {MOTIVOS_CANCELAMENTO.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelItemMutation.isPending}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{cancelItemMutation.isPending ? "Cancelando..." : "Confirmar Exclusão"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between">
          {!isCancelling ? (
            <>
              <button
                type="button"
                onClick={() => setIsCancelling(true)}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir / Cancelar Item</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-xl transition-all cursor-pointer"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSaveModifications}
                  disabled={updateItemMutation.isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateItemMutation.isPending ? "Salvando..." : "Salvar Modificação"}</span>
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-[var(--muted)]">Cancelamento com registro em auditoria</span>
          )}
        </div>
      </div>
    </div>
  );
};
