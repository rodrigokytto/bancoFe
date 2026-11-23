import React, { useState, useMemo } from "react";
import { trpc } from "../../lib/trpc";
import { MENU, formatBrl } from "../../../../shared/zumaData";
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  UtensilsCrossed, 
  Coffee, 
  Wine, 
  Flame, 
  Send,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ModalIncluirItemMesaProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  tableName: string;
  onSuccess: () => void;
}

const ADICIONAIS_PADRAO = [
  { nome: "Cream Cheese Extra", preco: 4.50 },
  { nome: "Molho Tarê Artesanal Extra", preco: 3.00 },
  { nome: "Gergelim Tostado Bicolor", preco: 2.00 },
  { nome: "Wasabi Fresco Especial", preco: 4.00 },
  { nome: "Gengibre em Conserva (Gari)", preco: 3.50 },
  { nome: "Azeite Trufado", preco: 8.00 },
  { nome: "Crispy de Couve", preco: 4.00 },
  { nome: "Raspas de Limão Siciliano", preco: 2.50 }
];

const OBSERVACOES_RAPIDAS = [
  "Sem cebolinha",
  "Sem gergelim",
  "Molho à parte",
  "Sem cream cheese",
  "Alérgico a frutos do mar",
  "Bem passado / frito bem crocante",
  "Pouco arroz / low carb",
  "Urgente - criança na mesa"
];

// Mapeamento de praça por categoria
const MAPA_PRACAS: Record<string, "sushibar" | "cozinha_quente" | "bar" | "sobremesa"> = {
  "Combinados": "sushibar",
  "Entradas": "cozinha_quente",
  "Uramakis": "sushibar",
  "Hossomakis": "sushibar",
  "Sushi no tubo": "sushibar",
  "Sashimis": "sushibar",
  "Niguiris": "sushibar",
  "Temakis": "sushibar",
  "Bebidas": "bar",
  "Sobremesas": "sobremesa"
};

export const ModalIncluirItemMesa: React.FC<ModalIncluirItemMesaProps> = ({
  isOpen,
  onClose,
  tableNumber,
  tableName,
  onSuccess,
}) => {
  const categories = Object.keys(MENU);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "Combinados");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Prato selecionado para customização
  const [selectedDish, setSelectedDish] = useState<{
    nome: string;
    preco: number;
    categoria: string;
    praca: "sushibar" | "cozinha_quente" | "bar" | "sobremesa";
  } | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedAdicionais, setSelectedAdicionais] = useState<Array<{ nome: string; preco: number }>>([]);
  const [observacoes, setObservacoes] = useState("");

  const addTableItemMutation = trpc.zuma.addTableItem.useMutation({
    onSuccess: (data) => {
      toast.success(`Prato lançado na ${tableName}!`, {
        description: `Enviado automaticamente à praça de produção no KDS.`,
        icon: "🍱"
      });
      // Limpa customização e recarrega
      setSelectedDish(null);
      setQuantity(1);
      setSelectedAdicionais([]);
      setObservacoes("");
      onSuccess();
    },
    onError: (err) => {
      toast.error(`Erro ao lançar item: ${err.message}`);
    }
  });

  // Lista de itens filtrados
  const filteredDishes = useMemo(() => {
    const list: Array<{ nome: string; preco: number; categoria: string; praca: any }> = [];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      for (const [cat, dishes] of Object.entries(MENU)) {
        for (const [nome, preco] of dishes) {
          if (nome.toLowerCase().includes(term) || cat.toLowerCase().includes(term)) {
            list.push({
              nome,
              preco,
              categoria: cat,
              praca: MAPA_PRACAS[cat] || "sushibar"
            });
          }
        }
      }
    } else {
      const dishes = MENU[activeCategory] || [];
      for (const [nome, preco] of dishes) {
        list.push({
          nome,
          preco,
          categoria: activeCategory,
          praca: MAPA_PRACAS[activeCategory] || "sushibar"
        });
      }
    }
    return list;
  }, [activeCategory, searchTerm]);

  if (!isOpen) return null;

  const handleSelectDish = (dish: { nome: string; preco: number; categoria: string; praca: any }) => {
    setSelectedDish(dish);
    setQuantity(1);
    setSelectedAdicionais([]);
    setObservacoes("");
  };

  const toggleAdicional = (adicional: { nome: string; preco: number }) => {
    setSelectedAdicionais(prev => {
      const exists = prev.some(a => a.nome === adicional.nome);
      if (exists) {
        return prev.filter(a => a.nome !== adicional.nome);
      }
      return [...prev, adicional];
    });
  };

  const addObservacaoChip = (chip: string) => {
    setObservacoes(prev => {
      if (!prev) return chip;
      if (prev.includes(chip)) return prev;
      return `${prev}, ${chip}`;
    });
  };

  const handleConfirmAddItem = () => {
    if (!selectedDish) return;
    addTableItemMutation.mutate({
      tableNumber,
      itemName: selectedDish.nome,
      quantity,
      unitPrice: selectedDish.preco,
      station: selectedDish.praca,
      adicionais: selectedAdicionais,
      observacoes: observacoes.trim(),
      operator: "Frente de Caixa"
    });
  };

  // Cálculo do total do item customizado
  const unitExtrasTotal = selectedAdicionais.reduce((sum, a) => sum + a.preco, 0);
  const finalUnitPrice = (selectedDish?.preco || 0) + unitExtrasTotal;
  const finalItemTotal = finalUnitPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--salmon)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--ink)] flex items-center gap-2">
                Incluir Pratos na {tableName}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Cardápio Oficial Zuma Gastronomia Oriental · Lançamento com envio direto ao KDS
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

        {/* Barra de Busca e Categorias */}
        <div className="p-4 border-b border-[var(--line)] space-y-3 bg-[var(--surface)]">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do prato, combinado, uramaki, bebida... (Ex: Hot Filadélfia, Combo 26...)"
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs sm:text-sm font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Limpar
              </button>
            )}
          </div>

          {!searchTerm && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat 
                      ? "bg-[var(--salmon)] text-white shadow-xs" 
                      : "bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)]/50 border border-[var(--line)]"
                  }`}
                >
                  {cat} ({MENU[cat]?.length || 0})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conteúdo Principal: Catálogo (Esquerda) e Customizador (Direita se selecionado) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Coluna do Catálogo */}
          <div className={`${selectedDish ? "hidden md:block md:col-span-7" : "col-span-12"} p-4 overflow-y-auto max-h-[55vh] md:max-h-[60vh] border-r border-[var(--line)]`}>
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-3">
              <span>{filteredDishes.length} itens encontrados</span>
              <span>Clique no prato para customizar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredDishes.map((dish, idx) => {
                const isSelected = selectedDish?.nome === dish.nome;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectDish(dish)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected 
                        ? "bg-[var(--salmon)]/5 border-[var(--salmon)] ring-2 ring-[var(--salmon)]/30" 
                        : "bg-[var(--surface2)] border-[var(--line)] hover:border-[var(--salmon)] hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[var(--ink)] group-hover:text-[var(--salmon)] transition-colors">
                        {dish.nome}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-neutral-200 text-neutral-800 shrink-0">
                        {dish.praca}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--line)]/60">
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[var(--salmon)]">
                        {formatBrl(dish.preco)}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Customizar
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna do Customizador do Prato Selecionado */}
          <div className={`${selectedDish ? "col-span-12 md:col-span-5" : "hidden md:flex md:col-span-5"} p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[60vh] bg-[var(--surface)]`}>
            {selectedDish ? (
              <div className="space-y-4">
                {/* Cabeçalho do Prato Selecionado */}
                <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[var(--muted)]">{selectedDish.categoria} · {selectedDish.praca}</span>
                      <h4 className="font-extrabold text-sm sm:text-base text-[var(--ink)]">{selectedDish.nome}</h4>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-[var(--salmon)]">{formatBrl(selectedDish.preco)}</span>
                  </div>

                  {/* Quantidade */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--ink)]">Quantidade</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-xs font-bold hover:bg-[var(--line)] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm font-mono">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-[var(--salmon)] text-white flex items-center justify-center text-xs font-bold hover:bg-[#d4532e] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Adicionais & Complementos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Adicionais & Extras (Opcional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ADICIONAIS_PADRAO.map(adicional => {
                      const isChecked = selectedAdicionais.some(a => a.nome === adicional.nome);
                      return (
                        <button
                          key={adicional.nome}
                          type="button"
                          onClick={() => toggleAdicional(adicional)}
                          className={`p-2 rounded-lg border text-left text-[11px] transition-all flex items-center justify-between cursor-pointer ${
                            isChecked 
                              ? "bg-amber-50 border-amber-400 text-amber-950 font-bold" 
                              : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-amber-300"
                          }`}
                        >
                          <span className="truncate pr-1">{adicional.nome}</span>
                          <span className="font-mono text-[10px] shrink-0 text-amber-800">+{formatBrl(adicional.preco)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Observações do Pedido */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--ink)]">
                    Observações de Cozinha / Preparo
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {OBSERVACOES_RAPIDAS.map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => addObservacaoChip(chip)}
                        className="px-2 py-0.5 rounded-md bg-[var(--surface2)] hover:bg-[var(--line)] text-[10px] font-medium text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] transition-all cursor-pointer"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Sem wasabi, cortar em 12 fatias finas..."
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--salmon)]/50"
                  />
                </div>

                {/* Totalizador e Botão de Lançamento */}
                <div className="pt-3 border-t border-[var(--line)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[var(--muted)] block">Valor do Prato ({quantity}x):</span>
                      <span className="font-mono font-bold text-xs text-[var(--ink)]">{formatBrl(finalUnitPrice)} cada</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--muted)] block">Total Lançamento:</span>
                      <span className="font-mono font-extrabold text-base text-[var(--salmon)]">{formatBrl(finalItemTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAddItem}
                    disabled={addTableItemMutation.isPending}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[var(--salmon)] hover:bg-[#d4532e] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{addTableItemMutation.isPending ? "Lançando..." : "Lançar na Mesa & Enviar ao KDS"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--muted)] space-y-2">
                <UtensilsCrossed className="w-10 h-10 stroke-1 text-[var(--muted)]/50" />
                <p className="text-xs font-medium">
                  Selecione um prato no catálogo ao lado para configurar quantidade, adicionais e observações.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-3 sm:p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs">
          <span className="text-[var(--muted)]">
            Mesa Destino: <strong className="text-[var(--ink)]">{tableName}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-xl hover:bg-[var(--line)] transition-all cursor-pointer"
          >
            Fechar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
};
