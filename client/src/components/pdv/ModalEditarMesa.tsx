import React, { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import { 
  X, 
  Users, 
  User, 
  UtensilsCrossed, 
  Percent, 
  FileText, 
  CheckCircle2, 
  Save, 
  Phone,
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { TableItem } from "../../../../server/dataStore";

interface ModalEditarMesaProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | any;
  onSuccess: () => void;
}

const GARCONS_DISPONIVEIS = [
  "Matheus (Salão)",
  "Bruna (Salão)",
  "Mariana (Salão)",
  "Carlos (Bar & Bebidas)",
  "Juliana (Salão Nobre)",
  "Autoatendimento QR Code"
];

export const ModalEditarMesa: React.FC<ModalEditarMesaProps> = ({
  isOpen,
  onClose,
  table,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerCount, setCustomerCount] = useState(2);
  const [waiter, setWaiter] = useState(GARCONS_DISPONIVEIS[0]);
  const [status, setStatus] = useState<"livre" | "ocupada" | "conta" | "reservada">("ocupada");
  const [notes, setNotes] = useState("");
  const [serviceFeePercent, setServiceFeePercent] = useState(10);

  useEffect(() => {
    if (table) {
      setCustomerName(table.customerName || `Mesa ${table.tableNumber}`);
      setCustomerCount(table.customerCount || 2);
      setWaiter(table.waiter || GARCONS_DISPONIVEIS[0]);
      setStatus(table.status || "ocupada");
      setNotes(table.notes || "");
      setServiceFeePercent(table.serviceFeePercent !== undefined ? table.serviceFeePercent : 10);
    }
  }, [table]);

  const updateTableMutation = trpc.zuma.updateTableDetails.useMutation({
    onSuccess: (updated) => {
      toast.success(`Mesa ${updated.tableNumber} atualizada e salva com sucesso!`, {
        description: `Cliente: ${updated.customerName || "Consumidor"} · Garçom: ${updated.waiter}`,
        icon: "✅"
      });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar mesa: ${err.message}`);
    }
  });

  if (!isOpen || !table) return null;

  const handleSave = () => {
    updateTableMutation.mutate({
      tableNumber: table.tableNumber,
      customerName: customerName.trim(),
      customerCount: Number(customerCount),
      waiter,
      status,
      notes: notes.trim(),
      serviceFeePercent: Number(serviceFeePercent),
      operator: "Frente de Caixa"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--salmon)]/10 text-[var(--salmon)] flex items-center justify-center font-bold text-lg">
              {String(table.tableNumber).padStart(2, "0")}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--ink)] flex items-center gap-2">
                Editar Mesa {String(table.tableNumber).padStart(2, "0")}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  status === "ocupada" ? "bg-indigo-100 text-indigo-700" :
                  status === "conta" ? "bg-amber-100 text-amber-800" :
                  status === "reservada" ? "bg-purple-100 text-purple-700" :
                  "bg-emerald-100 text-emerald-800"
                }`}>
                  {status}
                </span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Capacidade física: {table.capacity} lugares · Salão Zuma Tangará da Serra
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

        {/* Corpo do Formulário */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nome do Cliente / Comanda */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--salmon)]" />
              Nome do Cliente / Identificador da Comanda
            </label>
            <input 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: Rodrigo Gonçalves, Casal Mesa 03, Aniversário..."
              className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-sm font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50 transition-all"
            />
          </div>

          {/* Ocupantes e Garçom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Pessoas na Mesa
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6, 8].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCustomerCount(n)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      customerCount === n 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" 
                        : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-indigo-400"
                    }`}
                  >
                    {n}p
                  </button>
                ))}
              </div>
              <input 
                type="number"
                min="1"
                max="30"
                value={customerCount}
                onChange={(e) => setCustomerCount(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--ink)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                Garçom Responsável
              </label>
              <select
                value={waiter}
                onChange={(e) => setWaiter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50 cursor-pointer"
              >
                {GARCONS_DISPONIVEIS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status da Mesa e Taxa de Serviço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Status Operacional da Mesa
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50 cursor-pointer"
              >
                <option value="ocupada">🟢 Ocupada (Consumo Aberto)</option>
                <option value="conta">🟡 Conta (Pediu Fechamento)</option>
                <option value="reservada">🟣 Reservada</option>
                <option value="livre">⚪ Livre (Disponível)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                Taxa de Serviço Garçom (%)
              </label>
              <div className="flex items-center gap-2">
                {[0, 10, 12, 15].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setServiceFeePercent(pct)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      serviceFeePercent === pct 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                        : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-emerald-400"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Observações da Mesa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Observações Especiais / Notas de Atendimento
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cliente alérgico a camarão / Mesa prefere ar condicionado mais baixo / Trazer pratos juntos..."
              className="w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50"
            />
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-xl hover:bg-[var(--line)]/50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateTableMutation.isPending}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--salmon)] hover:bg-[#d4532e] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateTableMutation.isPending ? "Salvando..." : "Salvar Alterações da Mesa"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
