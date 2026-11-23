import React, { useState } from "react";
import { 
  ShoppingBag, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  PauseCircle, 
  PlayCircle, 
  Search, 
  Sparkles,
  Zap,
  Flame,
  UtensilsCrossed
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";

interface DishIfoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "disponivel" | "pausado";
  pausedReason?: string;
  stockEstimatedUnits: number;
}

interface GestaoCardapioIfoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestaoCardapioIfoodModal: React.FC<GestaoCardapioIfoodModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const [dishes, setDishes] = useState<DishIfoodItem[]>([
    {
      id: "D1",
      name: "Barca Especial Zuma 50 Peças",
      category: "Barcas & Combinados",
      price: 148.0,
      status: "disponivel",
      stockEstimatedUnits: 14
    },
    {
      id: "D2",
      name: "Combinado Salmão Lovers 24 Peças",
      category: "Barcas & Combinados",
      price: 89.9,
      status: "disponivel",
      stockEstimatedUnits: 22
    },
    {
      id: "D3",
      name: "Sashimi Salmão Nobre (10 Fatias)",
      category: "Sashimis & Pescados",
      price: 48.0,
      status: "disponivel",
      stockEstimatedUnits: 30
    },
    {
      id: "D4",
      name: "Hot Roll Especial Trufado (8 Peças)",
      category: "Hots & Frituras",
      price: 38.0,
      status: "disponivel",
      stockEstimatedUnits: 45
    },
    {
      id: "D5",
      name: "Temaki Filadélfia Completo",
      category: "Temakis & Cones",
      price: 34.0,
      status: "disponivel",
      stockEstimatedUnits: 38
    },
    {
      id: "D6",
      name: "Yakissoba Especial de Mignon",
      category: "Pratos Quentes Wok",
      price: 58.0,
      status: "pausado",
      pausedReason: "Falta de Filé Mignon Fresco (Aguardando Entrega)",
      stockEstimatedUnits: 0
    },
    {
      id: "D7",
      name: "Harumaki de Salmão com Cream Cheese (4un)",
      category: "Hots & Frituras",
      price: 28.0,
      status: "disponivel",
      stockEstimatedUnits: 19
    },
    {
      id: "D8",
      name: "Cerveja Japonesa Kirin Ichiban 355ml",
      category: "Bebidas & Importados",
      price: 22.0,
      status: "disponivel",
      stockEstimatedUnits: 12
    }
  ]);

  if (!isOpen) return null;

  const handleToggleStatus = (id: string) => {
    setDishes(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === "disponivel" ? "pausado" : "disponivel";
        if (nextStatus === "pausado") {
          toast.warning(`Prato "${d.name}" pausado no iFood!`);
        } else {
          toast.success(`Prato "${d.name}" reativado no iFood!`);
        }
        return {
          ...d,
          status: nextStatus,
          pausedReason: nextStatus === "pausado" ? "Pausa manual pelo operador de caixa" : undefined
        };
      }
      return d;
    }));
  };

  const handleSyncAll = () => {
    toast.success("Catálogo sincronizado com a API iFood Merchant v2!");
  };

  const filteredDishes = dishes.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "todos" || d.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = ["todos", "Barcas & Combinados", "Sashimis & Pescados", "Hots & Frituras", "Temakis & Cones", "Pratos Quentes Wok", "Bebidas & Importados"];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--ink)] text-white rounded-lg">
              <ShoppingBag className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-600 border border-red-500/30">
                  iFood Merchant API v2
                </span>
                <span className="text-xs text-[var(--muted)]">Gestão de Ruptura em Tempo Real</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[var(--ink)] mt-0.5">
                Pausador Rápido de Cardápio iFood
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

        <div className="p-5 space-y-4">
          {/* Barra de Busca e Sincronização */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filtrar prato para pausar ou liberar no iFood..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
              />
            </div>

            <button
              onClick={handleSyncAll}
              className="px-3.5 py-2 rounded-lg bg-[var(--ink)] hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sincronizar com iFood</span>
            </button>
          </div>

          {/* Filtro de Categorias */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === c
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                {c === "todos" ? "Todos os Pratos" : c}
              </button>
            ))}
          </div>

          {/* Tabela de Pratos com Toggles */}
          <div className="border border-[var(--line)] rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface2)] text-[var(--muted)] font-bold border-b border-[var(--line)]">
                <tr>
                  <th className="py-2.5 px-3">Prato no Cardápio</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Preço iFood</th>
                  <th className="py-2.5 px-3">Estoque Est.</th>
                  <th className="py-2.5 px-3">Status iFood</th>
                  <th className="py-2.5 px-3 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/60">
                {filteredDishes.map(d => {
                  const isPausado = d.status === "pausado";
                  return (
                    <tr key={d.id} className="hover:bg-[var(--surface2)]/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-[var(--ink)] block">{d.name}</span>
                        {d.pausedReason && (
                          <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
                            ⚠️ Motivo: {d.pausedReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[var(--muted)]">
                        {d.category}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[var(--ink)]">
                        {formatBrl(d.price)}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.stockEstimatedUnits === 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {d.stockEstimatedUnits} un
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                          isPausado 
                            ? "bg-red-500/15 text-red-600 border border-red-500/30" 
                            : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        }`}>
                          {isPausado ? (
                            <>
                              <PauseCircle className="w-3 h-3" />
                              Pausado / Esgotado
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Ativo no Delivery
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(d.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ml-auto ${
                            isPausado
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              : "bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30"
                          }`}
                        >
                          {isPausado ? (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              Reativar no iFood
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3.5 h-3.5" />
                              Pausar Prato
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rodapé com Fechamento e Status */}
          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--muted)]">
              Sincronizado automaticamente com o iFood Merchant Portal em Tangará da Serra (MT).
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--ink)] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Concluir e Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
