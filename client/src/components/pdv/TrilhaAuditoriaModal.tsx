import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import { 
  ShieldCheck, 
  X, 
  Clock, 
  User, 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from "lucide-react";

interface TrilhaAuditoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: number;
}

export const TrilhaAuditoriaModal: React.FC<TrilhaAuditoriaModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
}) => {
  const [filterAction, setFilterAction] = useState<string>("todos");
  const [selectedTableFilter, setSelectedTableFilter] = useState<number | undefined>(tableNumber);

  const { data: auditEvents = [], isLoading, refetch } = trpc.zuma.getAuditTrail.useQuery(
    { tableNumber: selectedTableFilter },
    { enabled: isOpen, refetchInterval: 4000 }
  );

  if (!isOpen) return null;

  const actionLabels: Record<string, { label: string; color: string }> = {
    fechamento_comanda: { label: "Mesa Baixada / Encerrada", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-500/30" },
    MESA_ENCERRADA: { label: "Mesa Encerrada", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-500/30" },
    abertura_comanda: { label: "Mesa Aberta", color: "bg-blue-500/10 text-blue-600" },
    MESA_ABERTA: { label: "Mesa Aberta", color: "bg-blue-500/10 text-blue-600" },
    item_adicionado: { label: "Item Adicionado", color: "bg-indigo-500/10 text-indigo-600" },
    ITEM_ADICIONADO: { label: "Item Adicionado", color: "bg-indigo-500/10 text-indigo-600" },
    item_alterado: { label: "Item Alterado", color: "bg-amber-500/10 text-amber-600" },
    ITEM_ALTERADO: { label: "Item Alterado", color: "bg-amber-500/10 text-amber-600" },
    item_cancelado: { label: "Item Cancelado", color: "bg-red-500/10 text-red-600" },
    ITEM_CANCELADO: { label: "Item Cancelado", color: "bg-red-500/10 text-red-600" },
    pedido_enviado_kds: { label: "Despachado KDS", color: "bg-purple-500/10 text-purple-600" },
    ITEM_DESPACHADO_KDS: { label: "Despachado KDS", color: "bg-purple-500/10 text-purple-600" },
    conferencia_expedicao: { label: "Expedição Conferida", color: "bg-emerald-500/10 text-emerald-600" },
    EXPEDICAO_CONFERIDA: { label: "Expedição Conferida", color: "bg-emerald-500/10 text-emerald-600" },
    desconto_aplicado: { label: "Desconto Autorizado", color: "bg-amber-500/10 text-amber-700" },
    DESCONTO_APLICADO: { label: "Desconto Autorizado", color: "bg-amber-500/10 text-amber-700" },
    estorno_parcial: { label: "Estorno Realizado", color: "bg-rose-500/10 text-rose-700" },
    ESTORNO_REALIZADO: { label: "Estorno Realizado", color: "bg-rose-500/10 text-rose-700" },
    transferencia_comanda: { label: "Mesa Transferida", color: "bg-cyan-500/10 text-cyan-700" },
    MESA_TRANSFERIDA: { label: "Mesa Transferida", color: "bg-cyan-500/10 text-cyan-700" },
    CAIXA_ABERTO: { label: "Caixa Aberto", color: "bg-blue-500/10 text-blue-700" },
    CAIXA_FECHADO_CEGO: { label: "Fechamento Cego", color: "bg-zinc-700/10 text-zinc-800" },
    SANGRIA_CAIXA: { label: "Sangria", color: "bg-red-500/10 text-red-700" },
    SUPRIMENTO_CAIXA: { label: "Suprimento", color: "bg-emerald-500/10 text-emerald-700" },
  };

  const filteredEvents = auditEvents.filter(ev => {
    if (filterAction !== "todos" && ev.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  AUDITORIA OPERACIONAL & FISCAL
                </span>
                <span className="text-xs font-mono opacity-80">Rastreabilidade Ponta a Ponta</span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                Trilha de Auditoria do Turno (Garçom → Cozinha → Caixa)
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

        {/* Filtros */}
        <div className="p-3 sm:p-4 border-b border-[var(--line)] bg-[var(--surface2)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-[var(--muted)] font-bold">Ação:</span>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="px-2.5 py-1 bg-[var(--surface)] border border-[var(--line)] rounded text-xs font-semibold"
            >
              <option value="todos">Todas as Ações ({auditEvents.length})</option>
              <option value="MESA_ABERTA">Abertura de Mesa</option>
              <option value="ITEM_ADICIONADO">Lançamento de Itens</option>
              <option value="ITEM_ALTERADO">Alterações Pós-Envio</option>
              <option value="ITEM_CANCELADO">Cancelamentos</option>
              <option value="EXPEDICAO_CONFERIDA">Conferência de Expedição</option>
              <option value="DESCONTO_APLICADO">Descontos Autorizados</option>
              <option value="ESTORNO_REALIZADO">Estornos</option>
              <option value="MESA_ENCERRADA">Fechamentos de Comanda</option>
              <option value="CAIXA_FECHADO_CEGO">Fechamento Cego de Caixa</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] font-bold">Filtro Mesa:</span>
            <button
              onClick={() => setSelectedTableFilter(undefined)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedTableFilter === undefined
                  ? "bg-zinc-800 text-white"
                  : "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
              }`}
            >
              Todas as Mesas
            </button>
            {[1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                onClick={() => setSelectedTableFilter(num)}
                className={`w-7 h-7 rounded text-xs font-bold transition ${
                  selectedTableFilter === num
                    ? "bg-indigo-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
                }`}
              >
                M{num}
              </button>
            ))}
          </div>
        </div>

        {/* Lista dos Eventos da Trilha */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {isLoading && (
            <div className="text-center py-12 text-xs text-[var(--muted)]">
              Carregando trilha de auditoria...
            </div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-12 text-xs text-[var(--muted)] italic">
              Nenhum evento registrado com os filtros selecionados.
            </div>
          )}

          {filteredEvents.map(ev => {
            const act = actionLabels[ev.action] || { label: ev.action, color: "bg-zinc-100 text-zinc-700" };
            const dateStr = new Date(ev.timestamp).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            });

            return (
              <div
                key={ev.id}
                className="p-3 bg-[var(--surface2)] border border-[var(--line)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[var(--ink)]/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[11px] text-[var(--muted)]">{dateStr}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${act.color}`}>
                        {act.label}
                      </span>
                      {ev.tableNumber && (
                        <span className="font-bold text-[var(--ink)]">Mesa {ev.tableNumber}</span>
                      )}
                      {ev.orderId && (
                        <span className="font-mono text-[11px] text-[var(--muted)]">Pedido #{ev.orderId}</span>
                      )}
                    </div>

                    {(ev.action === "fechamento_comanda" || (ev.action as string) === "MESA_ENCERRADA") && ev.details ? (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-emerald-900 dark:text-emerald-200">
                            Total Baixado: <strong className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{formatBrl(ev.details.finalTotal || 0)}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                            💳 {ev.details.paymentMethod || "Não informada"}
                          </span>
                          {ev.details.nfcNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300">
                              📑 NFC-e #{ev.details.nfcNumber} (Autorizada SEFAZ-MT)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
                          <span>Canal: <strong className="text-[var(--ink)]">{ev.details.canal || (ev.role === "garcom" ? "App do Garçom Móvel" : "PDV Caixa")}</strong></span>
                          <span>•</span>
                          <span>Fechado por: <strong className="text-[var(--ink)]">{ev.actor} ({ev.role === "garcom" ? "Garçom" : "Caixa"})</strong></span>
                          {ev.details.horaFechamento && (
                            <>
                              <span>•</span>
                              <span>Hora: <strong>{ev.details.horaFechamento}</strong></span>
                            </>
                          )}
                          {ev.details.splitCount && ev.details.splitCount > 1 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-bold">Dividido em {ev.details.splitCount} pessoas</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[var(--ink)] font-medium">
                        {typeof ev.details === "string" ? ev.details : JSON.stringify(ev.details) || "Ação registrada no sistema"}
                      </p>
                    )}

                    {ev.reason && (
                      <p className="text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                        <b>Justificativa:</b> {ev.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--line)] shrink-0">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold flex items-center gap-1">
                    <User className="w-3 h-3" /> Responsável
                  </span>
                  <span className="font-bold text-[var(--ink)] text-right">
                    {ev.actor}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Total de {filteredEvents.length} eventos auditados em conformidade com as regras fiscais de MT.</span>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] rounded text-xs font-bold text-[var(--ink)] cursor-pointer"
          >
            Atualizar Agora
          </button>
        </div>
      </div>
    </div>
  );
};
