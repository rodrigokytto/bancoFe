import React, { useState } from "react";
import { 
  ArrowRightLeft, 
  Layers, 
  Users, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Flame,
  UtensilsCrossed
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "../../../../shared/zumaData";
import { MesaOperacional } from "../../pages/MapaMesasSalao";

interface JuntarMesasModalProps {
  origemMesa: MesaOperacional;
  todasMesas: MesaOperacional[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmarJuntar: (origemId: number, destinoId: number) => void;
  onConfirmarTransferir: (origemId: number, destinoId: number) => void;
}

export const JuntarMesasModal: React.FC<JuntarMesasModalProps> = ({
  origemMesa,
  todasMesas,
  isOpen,
  onClose,
  onConfirmarJuntar,
  onConfirmarTransferir
}) => {
  const [acaoTipo, setAcaoTipo] = useState<"JUNTAR" | "TRANSFERIR">("JUNTAR");
  const [destinoMesaId, setDestinoMesaId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Mesas elegíveis para destino: não pode ser a própria mesa
  const mesasElegiveis = todasMesas.filter(m => m.id !== origemMesa.id);
  const destinoMesa = todasMesas.find(m => m.id === destinoMesaId);

  const handleExecutar = () => {
    if (!destinoMesaId || !destinoMesa) {
      toast.error("Selecione uma mesa de destino!");
      return;
    }

    if (acaoTipo === "JUNTAR") {
      onConfirmarJuntar(origemMesa.id, destinoMesaId);
      toast.success(`Mesas unificadas com sucesso!`, {
        description: `${origemMesa.nome} foi agrupada à ${destinoMesa.nome}. Comandas e clientes consolidados.`
      });
    } else {
      onConfirmarTransferir(origemMesa.id, destinoMesaId);
      toast.success(`Mesa transferida com sucesso!`, {
        description: `Comanda de ${origemMesa.nome} movida para ${destinoMesa.nome}.`
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] w-full max-w-lg rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">
                Operação de Mesa · {origemMesa.nome}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Agrupar mesas (Merge) para grandes grupos ou transferir comanda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4 text-xs">
          {/* Seletor de Ação */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <button
              onClick={() => setAcaoTipo("JUNTAR")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                acaoTipo === "JUNTAR"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Juntar Mesas (Merge)</span>
            </button>

            <button
              onClick={() => setAcaoTipo("TRANSFERIR")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                acaoTipo === "TRANSFERIR"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transferir Comanda</span>
            </button>
          </div>

          {/* Resumo da Origem */}
          <div className="p-3 bg-[var(--surface2)]/60 rounded-xl border border-[var(--line)] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Mesa de Origem</span>
              <b className="text-sm text-[var(--ink)]">{origemMesa.nome}</b>
              <span className="text-[11px] text-[var(--muted)] block">{origemMesa.clienteNome || "Cliente sem cadastro"} · {origemMesa.clientesQtd} pessoas</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Consumo Atual</span>
              <b className="text-sm font-mono text-[var(--salmon)]">{formatBrl(origemMesa.consumoTotal)}</b>
              <span className="text-[10px] text-[var(--muted)] block">{origemMesa.itens.length} itens lançados</span>
            </div>
          </div>

          {/* Seleção do Destino */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
              Selecione a Mesa de Destino:
            </label>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {mesasElegiveis.map(m => {
                const isSelected = destinoMesaId === m.id;
                const isOcupada = m.status !== "LIVRE";

                return (
                  <button
                    key={m.id}
                    onClick={() => setDestinoMesaId(m.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-600 text-white font-bold border-amber-600 shadow-xs"
                        : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? "bg-white text-amber-700" : "bg-[var(--surface2)] text-[var(--ink)]"
                      }`}>
                        {m.id}
                      </div>
                      <div>
                        <div className="font-bold">{m.nome}</div>
                        <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                          {m.ambiance.replace("_", " ")} · {m.lugares} lugares
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSelected 
                          ? "bg-white/20 text-white" 
                          : isOcupada ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {isOcupada ? `Ocupada (${formatBrl(m.consumoTotal)})` : "Livre"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prévia do Resultado */}
          {destinoMesa && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">
                {acaoTipo === "JUNTAR" ? "Resultado do Agrupamento:" : "Resultado da Transferência:"}
              </span>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-200">
                {acaoTipo === "JUNTAR" ? (
                  <>
                    A nova comanda da <b>{destinoMesa.nome}</b> somará <b>{formatBrl(origemMesa.consumoTotal + destinoMesa.consumoTotal)}</b> e atenderá <b>{(origemMesa.clientesQtd || 0) + (destinoMesa.clientesQtd || 0)} clientes</b>. A <b>{origemMesa.nome}</b> ficará marcada como vinculada.
                  </>
                ) : (
                  <>
                    A conta de <b>{formatBrl(origemMesa.consumoTotal)}</b> será transferida para a <b>{destinoMesa.nome}</b>. A <b>{origemMesa.nome}</b> será liberada para novos clientes.
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleExecutar}
            disabled={!destinoMesaId}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-md cursor-pointer disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar {acaoTipo === "JUNTAR" ? "Agrupamento" : "Transferência"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
