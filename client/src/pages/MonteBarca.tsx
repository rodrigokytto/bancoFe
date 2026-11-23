import React, { useState } from "react";
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  UtensilsCrossed,
  Layers,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

interface OpcaoPeca {
  id: string;
  nome: string;
  categoria: "sashimi" | "niguiri" | "uramaki" | "dyo" | "hot";
  descricao: string;
  maxPorBarca: number;
}

const PECAS_DISPONIVEIS: OpcaoPeca[] = [
  { id: "sashimi_salmao", nome: "Sashimi Salmão Fresco", categoria: "sashimi", descricao: "Lâminas nobres de salmão chileno fresco", maxPorBarca: 20 },
  { id: "sashimi_macaricado", nome: "Sashimi Trufado Maçaricado", categoria: "sashimi", descricao: "Levemente maçaricado com azeite trufado e flor de sal", maxPorBarca: 15 },
  { id: "niguiri_salmao", nome: "Niguiri Salmão Especial", categoria: "niguiri", descricao: "Arroz shari temperado com fatia de salmão", maxPorBarca: 16 },
  { id: "niguiri_skin", nome: "Niguiri Skin com Raspas de Limão", categoria: "niguiri", descricao: "Pele de salmão crocante com cream cheese e limão siciliano", maxPorBarca: 12 },
  { id: "uramaki_fila", nome: "Uramaki Filadélfia Clássico", categoria: "uramaki", descricao: "Salmão, cream cheese Philadelphia e gergelim tostado", maxPorBarca: 24 },
  { id: "uramaki_ebi", nome: "Uramaki Ebi Especial", categoria: "uramaki", descricao: "Camarão empanado crocante envolto em salmão maçaricado", maxPorBarca: 16 },
  { id: "dyo_geleia", nome: "Dyo Joy Salmão com Geleia de Pimenta", categoria: "dyo", descricao: "Envolto em salmão com cream cheese e geleia artesanal", maxPorBarca: 12 },
  { id: "hot_filadelfia", nome: "Hot Roll Especial Crocante", categoria: "hot", descricao: "Empanado em farinha panko japonesa com molho tarê", maxPorBarca: 24 },
];

export const MonteBarca: React.FC = () => {
  // Tamanho da barca: 30, 50 ou 80 peças
  const [tamanho, setTamanho] = useState<30 | 50 | 80>(50);
  const [selecao, setSelecao] = useState<Record<string, number>>({
    sashimi_salmao: 15,
    niguiri_salmao: 10,
    uramaki_fila: 15,
    hot_filadelfia: 10,
  });

  const precosBarca = {
    30: 98.0,
    50: 148.0,
    80: 225.0,
  };

  const totalPecasSelecionadas = Object.values(selecao).reduce((acc, curr) => acc + curr, 0);
  const pecasRestantes = tamanho - totalPecasSelecionadas;

  const alterarPeca = (id: string, delta: number) => {
    const atual = selecao[id] || 0;
    const novo = atual + delta;

    if (novo < 0) return;
    if (delta > 0 && pecasRestantes <= 0) {
      toast.warning(`Sua barca já atingiu o limite de ${tamanho} peças!`);
      return;
    }

    setSelecao((prev) => ({
      ...prev,
      [id]: novo,
    }));
  };

  const limparSelecao = () => {
    setSelecao({});
    toast.info("Seleção de peças reiniciada.");
  };

  const adicionarAoCarrinho = () => {
    if (pecasRestantes > 0) {
      toast.error(`Ainda faltam ${pecasRestantes} peças para completar sua barca de ${tamanho} peças.`);
      return;
    }
    toast.success(`Barca Personalizada (${tamanho} Pçs) adicionada com sucesso ao seu pedido!`, {
      icon: "🍱",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-r from-orange-950 via-zinc-900 to-rose-950 border border-orange-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Sushiman Builder 360°
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Monte sua Barca Personalizada
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            Escolha cada uma das peças da sua barca oriental. Produzida na hora com salmão fresco chileno no restaurante Zuma em Tangará da Serra.
          </p>
        </div>

        {/* Seletor de Tamanho */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-800/80 rounded-2xl border border-zinc-700">
          {[
            { qtd: 30, label: "Compacta (30 pçs)", preco: 98 },
            { qtd: 50, label: "Especial (50 pçs)", preco: 148 },
            { qtd: 80, label: "Imperial (80 pçs)", preco: 225 },
          ].map((b) => (
            <button
              key={b.qtd}
              onClick={() => {
                setTamanho(b.qtd as any);
                setSelecao({});
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tamanho === b.qtd
                  ? "bg-[var(--salmon)] text-white font-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <div>{b.label}</div>
              <div className="font-mono text-[10px] opacity-90">R$ {b.preco.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Progresso de Peças da Barca */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[var(--ink)] flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4 text-[var(--salmon)]" />
            Progresso da Barca: {totalPecasSelecionadas} de {tamanho} peças
          </span>
          <span
            className={`font-mono text-xs px-2.5 py-0.5 rounded-full ${
              pecasRestantes === 0
                ? "bg-emerald-500/15 text-emerald-600 font-black"
                : "bg-amber-500/15 text-amber-600 font-bold"
            }`}
          >
            {pecasRestantes === 0
              ? "✓ Barca Completa!"
              : `Faltam ${pecasRestantes} peças`}
          </span>
        </div>

        <div className="w-full bg-[var(--surface2)] h-3.5 rounded-full overflow-hidden p-0.5 border border-[var(--line)]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pecasRestantes === 0 ? "bg-emerald-500" : "bg-[var(--salmon)]"
            }`}
            style={{ width: `${Math.min(100, (totalPecasSelecionadas / tamanho) * 100)}%` }}
          />
        </div>
      </div>

      {/* Grid de Seleção de Peças */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PECAS_DISPONIVEIS.map((peca) => {
          const qtd = selecao[peca.id] || 0;
          return (
            <div
              key={peca.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-[var(--salmon)] transition-all"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                  {peca.categoria}
                </span>
                <h4 className="text-sm font-black text-[var(--ink)]">{peca.nome}</h4>
                <p className="text-[11px] text-[var(--muted)] leading-tight">{peca.descricao}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alterarPeca(peca.id, -2)}
                    disabled={qtd <= 0}
                    className="w-7 h-7 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] disabled:opacity-40 text-[var(--ink)] flex items-center justify-center font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-black font-mono text-sm text-[var(--salmon)]">
                    {qtd}
                  </span>
                  <button
                    onClick={() => alterarPeca(peca.id, 2)}
                    disabled={pecasRestantes <= 0}
                    className="w-7 h-7 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] disabled:opacity-40 text-[var(--ink)] flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-[var(--muted)] font-mono">de 2 em 2</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Flutuante e Conclusão */}
      <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-xs text-[var(--muted)]">Barca {tamanho} Peças Personalizada:</div>
          <div className="text-2xl font-black font-mono text-[var(--salmon)]">
            R$ {precosBarca[tamanho].toFixed(2)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Inclui wasabi fresco, gengibre marinado gari e molho shoyu especial
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={limparSelecao}
            className="px-4 py-2.5 rounded-2xl bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] text-xs font-bold transition-all"
          >
            Limpar
          </button>
          <button
            onClick={adicionarAoCarrinho}
            disabled={pecasRestantes > 0}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[var(--salmon)] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Adicionar ao Pedido · R$ {precosBarca[tamanho].toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
