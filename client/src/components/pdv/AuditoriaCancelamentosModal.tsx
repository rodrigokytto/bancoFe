import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { 
  ShieldAlert, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Receipt, 
  UserCheck, 
  TrendingDown, 
  Clock, 
  FileWarning, 
  KeyRound,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface AuditoriaCancelamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditoriaCancelamentosModal: React.FC<AuditoriaCancelamentosModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [type, setType] = useState<"cancelamento_item" | "cancelamento_pedido" | "estorno_mesa" | "desconto_excepcional">("cancelamento_item");
  const [tableOrOrder, setTableOrOrder] = useState("Mesa 04");
  const [itemName, setItemName] = useState("Hot Filadélfia Trufado (12un)");
  const [amount, setAmount] = useState(38.90);
  const [reasonCategory, setReasonCategory] = useState<"erro_digitacao" | "demora_cozinha" | "devolucao_cliente" | "quebra_desperdicio" | "desistencia" | "cortesia_autorizada">("erro_digitacao");
  const [reasonNotes, setReasonNotes] = useState("");
  const [requestedBy, setRequestedBy] = useState("Matheus (Salão)");
  const [pin, setPin] = useState("");

  const { data: logs = [], refetch } = trpc.zuma.getLossPreventionLogs.useQuery(undefined, {
    enabled: isOpen
  });

  const recordMutation = trpc.zuma.recordLossPreventionLog.useMutation({
    onSuccess: (data) => {
      toast.success("Cancelamento auditado e registrado com sucesso!");
      setShowNewForm(false);
      setPin("");
      setReasonNotes("");
      refetch();
    },
    onError: (err) => {
      toast.error(`Falha na autorização: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  const totalPerdas = logs.reduce((s, l) => s + l.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      toast.error("Informe o PIN Gerencial para autorizar o cancelamento!");
      return;
    }
    if (!reasonNotes || reasonNotes.length < 5) {
      toast.error("A justificativa detalhada é obrigatória (mínimo 5 letras)!");
      return;
    }

    recordMutation.mutate({
      type,
      tableOrOrder,
      itemName: type === "cancelamento_item" ? itemName : undefined,
      amount,
      reasonCategory,
      reasonNotes,
      requestedBy,
      authorizedBy: "Rodrigo Ribeiro Gonçalves (Dono)",
      pin
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-600 text-white">
                  PREVENÇÃO DE PERDAS
                </span>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-mono">
                  Auditoria Rígida &amp; PIN Gerencial
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                Registro de Cancelamentos, Estornos &amp; Descontos
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

        {/* 3 KPIs de Prevenção de Perdas */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--surface2)] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                Total Auditado no Turno
              </span>
              <span className="text-lg font-extrabold font-mono text-[var(--salmon)]">
                R$ {totalPerdas.toFixed(2)}
              </span>
            </div>
            <TrendingDown className="w-5 h-5 text-[var(--salmon)]" />
          </div>

          <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                Índice de Perdas / Faturamento
              </span>
              <span className="text-lg font-extrabold font-mono text-emerald-600">
                0,68%
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700">
              Meta &lt; 1,2% OK
            </span>
          </div>

          <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                Ocorrências Registradas
              </span>
              <span className="text-lg font-extrabold font-mono text-[var(--ink)]">
                {logs.length} eventos
              </span>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Registro</span>
            </button>
          </div>
        </div>

        {/* Formulário Novo Cancelamento com PIN */}
        {showNewForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-amber-500/5 border-b border-amber-500/20 space-y-3 animate-in fade-in duration-200">
            <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Autorização de Cancelamento / Estorno com PIN de Gerente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Tipo de Evento:</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-semibold"
                >
                  <option value="cancelamento_item">Cancelar Prato/Item</option>
                  <option value="cancelamento_pedido">Cancelar Pedido Todo</option>
                  <option value="estorno_mesa">Estorno de Comanda</option>
                  <option value="desconto_excepcional">Desconto Excepcional</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Mesa / Pedido:</label>
                <input
                  type="text"
                  value={tableOrOrder}
                  onChange={e => setTableOrOrder(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Valor do Prejuízo (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Motivo Padronizado:</label>
                <select
                  value={reasonCategory}
                  onChange={e => setReasonCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-semibold"
                >
                  <option value="erro_digitacao">Erro de Digitação / Garçom</option>
                  <option value="demora_cozinha">Demora Excessiva da Cozinha</option>
                  <option value="devolucao_cliente">Devolução pelo Cliente (Qualidade/Ponto)</option>
                  <option value="quebra_desperdicio">Quebra / Queda no Salão</option>
                  <option value="desistencia">Desistência do Cliente</option>
                  <option value="cortesia_autorizada">Cortesia Autorizada pelo Dono</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[var(--muted)] block mb-1">Justificativa Detalhada Obrigatória:</label>
                <input
                  type="text"
                  placeholder="Explique exatamente o que aconteceu para auditoria posterior..."
                  value={reasonNotes}
                  onChange={e => setReasonNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-red-600 block mb-1">PIN Gerencial (Rodrigo/Gerente):</label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="PIN 4 Dígitos (0805)"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-red-500/40 rounded text-xs font-mono font-bold tracking-widest text-center"
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-3 py-1.5 rounded bg-[var(--surface2)] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={recordMutation.isPending}
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{recordMutation.isPending ? "Validando..." : "Autorizar e Gravar na Auditoria"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tabela de Logs de Auditoria */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold text-[10px] uppercase">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Tipo &amp; Local</th>
                <th className="py-2.5 px-3">Item Envolvido</th>
                <th className="py-2.5 px-3 text-right">Valor Perda</th>
                <th className="py-2.5 px-3">Motivo &amp; Justificativa</th>
                <th className="py-2.5 px-3 text-right">Autorização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[var(--surface2)]/60 transition">
                  <td className="py-3 px-3 font-mono text-[11px] text-[var(--muted)]">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-[var(--ink)] block text-xs">{log.tableOrOrder}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                      {log.type.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-[var(--ink)]">
                      {log.itemName || "Pedido / Conta Inteira"}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-[var(--salmon)]">
                    R$ {log.amount.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 max-w-[240px]">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--surface2)] text-[var(--ink)] block w-fit mb-0.5">
                      {log.reasonCategory}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] leading-tight block truncate" title={log.reasonNotes}>
                      {log.reasonNotes}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-end gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      {log.authorizedBy}
                    </span>
                    <span className="text-[9px] text-[var(--muted)]">
                      Solicitante: {log.requestedBy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[var(--muted)]">
            Todos os cancelamentos são criptografados e integrados ao DRE gerencial do Rodrigo.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--ink)] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Fechar Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};
