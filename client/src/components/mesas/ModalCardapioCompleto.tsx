import React, { useState, useMemo } from "react";
import { 
  Search, 
  X, 
  Plus, 
  Minus, 
  Flame, 
  UtensilsCrossed, 
  Check, 
  Sparkles, 
  Layers, 
  Wine, 
  Coffee,
  CheckCircle2,
  Filter
} from "lucide-react";
import { MENU, MenuItem, formatBrl } from "../../../../shared/zumaData";
import { toast } from "sonner";

export interface ItemLancamentoPayload {
  nome: string;
  valorUnit: number;
  qtd: number;
  observacao?: string;
  fireOnDemand?: boolean;
  station: "sushibar" | "quente" | "fritura" | "bar";
}

interface ModalCardapioCompletoProps {
  isOpen: boolean;
  onClose: () => void;
  mesaNumero: number;
  mesaNome: string;
  onLancarItem: (payload: ItemLancamentoPayload) => void;
}

// Determinar a praça KDS automaticamente pelo nome ou categoria
export function determinarPraca(categoria: string, nome: string): "sushibar" | "quente" | "fritura" | "bar" {
  const c = categoria.toLowerCase();
  const n = nome.toLowerCase();

  if (c.includes("bebida") || n.includes("cerveja") || n.includes("saquê") || n.includes("refrigerante") || n.includes("suco") || n.includes("água") || n.includes("gin")) {
    return "bar";
  }
  if (c.includes("hot roll") || n.includes("hot") || c.includes("porções") || n.includes("furai") || n.includes("croquete") || n.includes("tempurá") || n.includes("batata") || n.includes("lula crocante")) {
    return "fritura";
  }
  if (c.includes("pratos quentes") || n.includes("yakissoba") || n.includes("teppan") || n.includes("risoto") || n.includes("guioza") || n.includes("sobá") || n.includes("frango xadrez")) {
    return "quente";
  }
  return "sushibar";
}

export const CHIPS_OBSERVACOES = [
  "Sem cebolinha",
  "Sem gergelim",
  "Molho tarê à parte",
  "Wasabi extra",
  "Sem wasabi",
  "Grelhado ao ponto",
  "Bem maçaricado",
  "Shoyu sem glúten",
  "Para viagem / Embalar"
];

export const ModalCardapioCompleto: React.FC<ModalCardapioCompletoProps> = ({
  isOpen,
  onClose,
  mesaNumero,
  mesaNome,
  onLancarItem
}) => {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("TODAS");
  const [itemSelecionado, setItemSelecionado] = useState<{ cat: string; nome: string; preco: number } | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [fireOnDemand, setFireOnDemand] = useState(false);

  // Lista plana de itens do cardápio completo Zuma
  const todosItens = useMemo(() => {
    return Object.entries(MENU).flatMap(([cat, pratos]) =>
      pratos.map(([nome, preco]) => ({ cat, nome, preco }))
    );
  }, []);

  const categorias = useMemo(() => {
    return ["TODAS", ...Object.keys(MENU)];
  }, []);

  // Filtragem combinada por busca e categoria
  const itensFiltrados = useMemo(() => {
    return todosItens.filter(item => {
      const matchCat = categoriaAtiva === "TODAS" || item.cat === categoriaAtiva;
      const matchBusca = !busca.trim() || 
        item.nome.toLowerCase().includes(busca.toLowerCase()) || 
        item.cat.toLowerCase().includes(busca.toLowerCase());
      return matchCat && matchBusca;
    });
  }, [todosItens, categoriaAtiva, busca]);

  if (!isOpen) return null;

  const handleSelectItem = (item: { cat: string; nome: string; preco: number }) => {
    setItemSelecionado(item);
    setQuantidade(1);
    setObservacao("");
    const praca = determinarPraca(item.cat, item.nome);
    setFireOnDemand(praca === "quente" || praca === "fritura");
  };

  const handleConfirmarLancamento = () => {
    if (!itemSelecionado) return;
    const praca = determinarPraca(itemSelecionado.cat, itemSelecionado.nome);

    onLancarItem({
      nome: itemSelecionado.nome,
      valorUnit: itemSelecionado.preco,
      qtd: quantidade,
      observacao: observacao.trim() || undefined,
      fireOnDemand: fireOnDemand,
      station: praca
    });

    toast.success(`${quantidade}x ${itemSelecionado.nome} lançado na ${mesaNome}!`, {
      description: `Encaminhado para a praça ${praca.toUpperCase()} no KDS 2.0.`
    });

    // Reset para novo lançamento
    setItemSelecionado(null);
    setQuantidade(1);
    setObservacao("");
  };

  const handleAdicionarChip = (chip: string) => {
    if (observacao.includes(chip)) {
      setObservacao(observacao.replace(chip, "").replace(/,\s*,/g, ",").replace(/^,\s*/, "").replace(/,\s*$/, ""));
    } else {
      setObservacao(prev => prev ? `${prev}, ${chip}` : chip);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] text-[var(--ink)] w-full max-w-4xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header do Cardápio */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--salmon)] text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Cardápio Completo &amp; Lançamento de Itens
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-bold">
                  {mesaNome}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Mais de 100 itens oficiais Zuma com direcionamento automático às praças do KDS 2.0.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Categorias */}
        <div className="p-4 border-b border-[var(--line)] space-y-3 bg-[var(--surface)]">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Buscar por prato, peixe ou ingrediente (ex: Salmão Lovers, Hot Roll, Poke, Kirin, Teppan)..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[var(--salmon)]"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Categorias com Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {categorias.map(cat => {
              const count = cat === "TODAS" 
                ? todosItens.length 
                : (MENU[cat]?.length || 0);
              const isAtiva = categoriaAtiva === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isAtiva
                      ? "bg-[var(--salmon)] text-white shadow-2xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isAtiva ? "bg-black/25 text-white" : "bg-black/5 dark:bg-white/10"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo: Grid de Itens e Painel de Customização */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Lista de Itens do Cardápio */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted)] pb-1">
              <span>{itensFiltrados.length} itens encontrados</span>
              <span>Clique no item para personalizar e lançar</span>
            </div>

            {itensFiltrados.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                Nenhum prato encontrado com o termo "{busca}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itensFiltrados.map((it, idx) => {
                  const praca = determinarPraca(it.cat, it.nome);
                  const isSelected = itemSelecionado?.nome === it.nome;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectItem(it)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "bg-[var(--salmon)]/10 border-[var(--salmon)] ring-1 ring-[var(--salmon)] shadow-xs"
                          : "bg-[var(--surface2)]/40 hover:bg-[var(--surface2)] border-[var(--line)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] font-mono">
                            {it.cat}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--ink)] leading-snug">
                            {it.nome}
                          </h4>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          praca === "sushibar" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                          praca === "quente" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" :
                          praca === "fritura" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                          "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                        }`}>
                          {praca}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]/50">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatBrl(it.preco)}
                        </span>
                        <span className="text-[10px] text-[var(--salmon)] font-bold flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Selecionar
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Painel Lateral de Customização e Lançamento */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[var(--line)] p-4 bg-[var(--surface2)]/30 flex flex-col justify-between gap-4 overflow-y-auto">
            {itemSelecionado ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                    Item Selecionado
                  </span>
                  <h3 className="text-sm font-black text-[var(--ink)] mt-0.5">
                    {itemSelecionado.nome}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                    <span className="text-[var(--muted)]">Preço Unitário:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatBrl(itemSelecionado.preco)}
                    </strong>
                  </div>
                </div>

                {/* Seletor de Quantidade */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] block mb-1.5">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] flex items-center justify-center font-bold hover:bg-[var(--surface2)] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center font-black font-mono text-base">
                      {quantidade}x
                    </span>
                    <button
                      onClick={() => setQuantidade(prev => prev + 1)}
                      className="w-8 h-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] flex items-center justify-center font-bold hover:bg-[var(--surface2)] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1 ml-auto">
                      {[1, 2, 4, 6].map(q => (
                        <button
                          key={q}
                          onClick={() => setQuantidade(q)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                            quantidade === q ? "bg-[var(--salmon)] text-white" : "bg-[var(--surface)] border border-[var(--line)]"
                          }`}
                        >
                          {q}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chips de Observações Rápidas */}
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)] block mb-1.5">
                    Observações do Pedido (Chips Rápidos)
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {CHIPS_OBSERVACOES.map(chip => {
                      const ativo = observacao.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAdicionarChip(chip)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                            ativo 
                              ? "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400 font-bold" 
                              : "bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {ativo ? `✓ ${chip}` : `+ ${chip}`}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    placeholder="Instrução especial para a cozinha / garçom..."
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-[var(--salmon)]"
                  />
                </div>

                {/* Fire on Demand Toggle */}
                {(determinarPraca(itemSelecionado.cat, itemSelecionado.nome) === "quente" || 
                  determinarPraca(itemSelecionado.cat, itemSelecionado.nome) === "fritura") && (
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[11px] text-purple-900 dark:text-purple-200">
                      <input
                        type="checkbox"
                        checked={fireOnDemand}
                        onChange={e => setFireOnDemand(e.target.checked)}
                        className="rounded accent-purple-600 cursor-pointer"
                      />
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Fire on Demand (Sincronização Fria/Quente)
                      </span>
                    </label>
                    <p className="text-[10px] text-purple-800 dark:text-purple-300 leading-tight">
                      Trava o início do preparo no KDS para coincidir com a saída dos pratos frios do sushibar.
                    </p>
                  </div>
                )}

                {/* Subtotal do Item */}
                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs font-black">
                  <span>Subtotal deste item:</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatBrl(itemSelecionado.preco * quantidade)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--muted)] space-y-2">
                <UtensilsCrossed className="w-8 h-8 opacity-40 text-[var(--salmon)]" />
                <h4 className="font-bold text-xs text-[var(--ink)]">Nenhum item selecionado</h4>
                <p className="text-[11px] leading-relaxed">
                  Escolha qualquer prato ou bebida na lista à esquerda para configurar quantidade e observações.
                </p>
              </div>
            )}

            {/* Botão de Envio para a Cozinha */}
            <div className="pt-3 border-t border-[var(--line)] space-y-2">
              <button
                disabled={!itemSelecionado}
                onClick={handleConfirmarLancamento}
                className="w-full py-3 rounded-2xl bg-[var(--salmon)] hover:brightness-110 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lançar no KDS 2.0 • {mesaNome}</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition cursor-pointer"
              >
                Concluir Lançamentos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ModalCardapioCompleto;
