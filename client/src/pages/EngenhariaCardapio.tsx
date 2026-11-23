import React, { useState } from "react";
import { ALL_ITEMS, MENU, formatBrl, getItemCost } from "../../../shared/zumaData";
import { UtensilsCrossed, TrendingUp, AlertCircle, ArrowUpRight, CheckCircle2, Fish, Calculator, Sliders, X, Sparkles, FileText, ChevronRight } from "lucide-react";

interface DishMetric {
  nome: string;
  cat: string;
  preco: number;
  custo: number;
  margem: number;
  vendasMes: number;
  quadrante: "estrela" | "burro" | "enigma" | "cao";
}

export const EngenhariaCardapio: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedDishForFicha, setSelectedDishForFicha] = useState<DishMetric | null>(null);
  
  // Parâmetros do Simulador de Rendimento do Salmão (Fator de Correção)
  const [salmonGrossWeight, setSalmonGrossWeight] = useState(5.0); // kg peixe inteiro
  const [salmonPurchasePrice, setSalmonPurchasePrice] = useState(68.0); // R$/kg
  const [salmonYieldPct, setSalmonYieldPct] = useState(64); // % filé limpo
  
  // Parâmetros do Simulador de Reajuste
  const [priceAdjustmentPct, setPriceAdjustmentPct] = useState(5); // +5% reajuste

  // Calcular métricas para os pratos
  const allDishes: DishMetric[] = ALL_ITEMS.filter(i => i.cat !== "Bebidas" && i.preco > 12).map((item, idx) => {
    const custo = getItemCost(item);
    const margem = item.preco - custo;
    // Vendas simuladas consistentes baseadas no nome
    const seed = item.nome.length * 7 + idx * 13;
    const isBest = ["Combo 26 Peças", "Hot Filadélfia (12un)", "Uramaki Filadélfia (8un)", "Temaki Salmão", "Poke de Salmão"].includes(item.nome);
    const vendasMes = isBest ? 80 + (seed % 40) : 10 + (seed % 45);

    // Linha de corte: popularidade média = 35 vendas, margem média = R$ 38,00
    let quadrante: "estrela" | "burro" | "enigma" | "cao";
    if (vendasMes >= 35 && margem >= 38) quadrante = "estrela";
    else if (vendasMes >= 35 && margem < 38) quadrante = "burro";
    else if (vendasMes < 35 && margem >= 38) quadrante = "enigma";
    else quadrante = "cao";

    return {
      nome: item.nome,
      cat: item.cat,
      preco: item.preco,
      custo,
      margem,
      vendasMes,
      quadrante,
    };
  });

  const filteredDishes = selectedCat
    ? allDishes.filter(d => d.cat === selectedCat)
    : allDishes;

  const estrelas = filteredDishes.filter(d => d.quadrante === "estrela");
  const burros = filteredDishes.filter(d => d.quadrante === "burro");
  const enigmas = filteredDishes.filter(d => d.quadrante === "enigma");
  const caes = filteredDishes.filter(d => d.quadrante === "cao");

  const QD_INFO = {
    estrela: { label: "Estrela", badge: "bg-[var(--nori-soft)] text-[var(--nori)]", action: "Destaque no topo e no Zumi. Não mexer na receita!" },
    burro: { label: "Burro de Carga", badge: "bg-[var(--warn)]/20 text-[var(--warn)]", action: "Vende muito e rende pouco: subir 5% a 8% ou renegociar insumo." },
    enigma: { label: "Enigma", badge: "bg-[var(--salmon-soft)] text-[var(--salmon)]", action: "Rende bem e vende pouco: foto bonita, banner de terça e campanha." },
    cao: { label: "Cão", badge: "bg-[var(--bad)]/20 text-[var(--bad)]", action: "Vende pouco e rende pouco: tirar do cardápio ou trocar ingredientes." }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Engenharia de Cardápio (Menu Engineering)
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Quais pratos dão lucro real e quais só ocupam espaço na cozinha
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Cruzamento de popularidade (volume de vendas) com margem de contribuição líquida (preço de venda menos o custo da ficha técnica de salmão, arroz, nori e embalagens).
        </p>
      </div>

      {/* 4 KPIs de Quadrantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--good)]">Estrelas</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">{estrelas.length}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Alta venda + Alta margem</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--warn)]">Burros de Carga</span>
          <div className="text-2xl font-display font-extrabold text-[var(--warn)] font-mono-nums mt-1">{burros.length}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Alta venda + Baixa margem</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--salmon)]">Enigmas</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{enigmas.length}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Baixa venda + Alta margem</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--bad)]">Cães</span>
          <div className="text-2xl font-display font-extrabold text-[var(--bad)] font-mono-nums mt-1">{caes.length}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Baixa venda + Baixa margem</div>
        </div>
      </div>

      {/* Grid: Matriz Visual + Sugestões do Agente de Preço */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Matriz 2x2 Gráfica */}
        <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">Matriz do Cardápio (Margem × Volume)</h2>
              <p className="text-xs text-[var(--muted)]">Posicionamento dos pratos nos 4 quadrantes clássicos</p>
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] font-semibold"
            >
              <option value="">Cardápio Completo</option>
              {Object.keys(MENU).filter(c => c !== "Bebidas").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Gráfico SVG da Matriz */}
          <div className="overflow-x-auto">
            <div className="min-w-[540px] aspect-[16/9] border border-[var(--line)] rounded-xl p-4 relative bg-[var(--surface2)]/30">
              {/* Linhas Divisórias */}
              <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-[var(--line)]" />
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[var(--line)]" />

              {/* Rótulos dos Quadrantes */}
              <div className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider text-[var(--salmon)] bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded-sm">
                ENIGMAS (Margem Alta, Pouca Venda)
              </div>
              <div className="absolute top-3 right-3 text-[11px] font-bold uppercase tracking-wider text-[var(--good)] bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded-sm">
                ESTRELAS (Margem Alta, Muita Venda)
              </div>
              <div className="absolute bottom-3 left-3 text-[11px] font-bold uppercase tracking-wider text-[var(--bad)] bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded-sm">
                CÃES (Margem Baixa, Pouca Venda)
              </div>
              <div className="absolute bottom-3 right-3 text-[11px] font-bold uppercase tracking-wider text-[var(--warn)] bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded-sm">
                BURROS DE CARGA (Margem Baixa, Muita Venda)
              </div>

              {/* Pontos dos Pratos */}
              {filteredDishes.slice(0, 35).map((dish, i) => {
                const posX = Math.min(92, Math.max(8, (dish.vendasMes / 110) * 100));
                const posY = Math.min(92, Math.max(8, 100 - (dish.margem / 85) * 100));

                const colorMap = {
                  estrela: "bg-[var(--good)] ring-[var(--good)]/30",
                  burro: "bg-[var(--warn)] ring-[var(--warn)]/30",
                  enigma: "bg-[var(--salmon)] ring-[var(--salmon)]/30",
                  cao: "bg-[var(--bad)] ring-[var(--bad)]/30"
                };

                return (
                  <div
                    key={i}
                    className={`absolute w-3.5 h-3.5 rounded-full ring-4 cursor-pointer transition-transform hover:scale-150 ${colorMap[dish.quadrante]}`}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    title={`${dish.nome} (${dish.cat}): ${dish.vendasMes} vendas/mês · Margem ${formatBrl(dish.margem)}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Agente de Preço Sugere */}
        <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--salmon)]" />
            Agente de Preço Sugere
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-[var(--warn)]/40 bg-[var(--warn)]/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-[var(--ink)]">Hot Filadélfia (12un)</b>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--warn)] text-white">+6%</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Burro de carga clássico. De R$ 31,90 para R$ 33,90. Vende 88/mês: <b>+R$ 176,00 de lucro líquido direto</b> sem queda perceptível de demanda.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--salmon)]/40 bg-[var(--salmon-soft)]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-[var(--ink)]">Especial Zuma 68 Peças</b>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--salmon)] text-white">Divulgar</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Margem de R$ 138,00 por barca! Colocar em destaque no banner de sexta-feira com sobremesa de brinde, sem abaixar o preço principal.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--bad)]/40 bg-[var(--bad)]/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-[var(--ink)]">Teppan de Frango</b>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bad)] text-white">Rever</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Vende apenas 9 por mês e ocupa espaço na chapa. Reformular para o menu executivo de almoço ou retirar do cardápio noturno.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEÇÃO 1: SIMULADOR DE FATOR DE CORREÇÃO (FC) DO SALMÃO     */}
      {/* ========================================================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[var(--ink)]">
                  Fator de Correção (FC) &amp; Rendimento Operacional do Salmão
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-mono text-[10px] font-bold">
                  Padrão Culinária Japonesa
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Cálculo do rendimento real: o peso bruto de compra vs o filé nobre limpo (sem cabeça, vísceras, espinhas e pele).
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Fator de Correção (FC)</span>
            <span className="text-xl font-black font-mono text-orange-600">
              {(100 / salmonYieldPct).toFixed(2)}x
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Controles do Salmão */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/40 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--ink)]">
                <span>Peso Peixe Inteiro (Bruto):</span>
                <span className="font-mono text-orange-600">{salmonGrossWeight.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="8.0"
                step="0.5"
                value={salmonGrossWeight}
                onChange={(e) => setSalmonGrossWeight(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--ink)]">
                <span>Preço de Compra (Bruto):</span>
                <span className="font-mono text-orange-600">R$ {salmonPurchasePrice.toFixed(2)}/kg</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={salmonPurchasePrice}
                onChange={(e) => setSalmonPurchasePrice(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--ink)]">
                <span>Rendimento Filé Limpo (%):</span>
                <span className="font-mono text-emerald-600">{salmonYieldPct}%</span>
              </div>
              <input
                type="range"
                min="55"
                max="75"
                step="1"
                value={salmonYieldPct}
                onChange={(e) => setSalmonYieldPct(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Breakdown do Rendimento */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface2)]/40 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
              Composição do Peixe ({salmonGrossWeight.toFixed(1)} kg):
            </span>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">✨ Filé Limpo (Sushi/Sashimi):</span>
                <span className="font-mono font-bold text-emerald-600">
                  {((salmonGrossWeight * salmonYieldPct) / 100).toFixed(2)} kg ({salmonYieldPct}%)
                </span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>🍣 Aparas Nobres (Temaki/Hot):</span>
                <span className="font-mono">{(salmonGrossWeight * 0.08).toFixed(2)} kg (8%)</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>🔥 Pele Crocante (Skin Roll):</span>
                <span className="font-mono">{(salmonGrossWeight * 0.04).toFixed(2)} kg (4%)</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>🗑️ Cabeça &amp; Espinha dorsal:</span>
                <span className="font-mono">
                  {(salmonGrossWeight * ((100 - salmonYieldPct - 12) / 100)).toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Custo Real Efetivo */}
          <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 space-y-2 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider block">
                Custo Real do Filé Limpo:
              </span>
              <div className="text-2xl font-black font-mono text-orange-600 mt-1">
                R$ {(salmonPurchasePrice / (salmonYieldPct / 100)).toFixed(2)}
                <span className="text-xs font-normal text-[var(--muted)]"> / kg limpo</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Com o aproveitamento de aparas no Hot Roll e pele no Skin, o custo efetivo cai para:
              </p>
              <div className="text-sm font-extrabold font-mono text-emerald-600 mt-0.5">
                R$ {((salmonPurchasePrice / (salmonYieldPct / 100)) * 0.88).toFixed(2)} / kg efetivo
              </div>
            </div>

            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-800 dark:text-orange-200 text-[10px] font-bold">
              💡 Dica Zumi: Cada 1% a mais de precisão no corte do sushiman economiza R$ 420/mês em salmão!
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEÇÃO 2: SIMULADOR DE ELASTICIDADE E GANHO MENSAL        */}
      {/* ========================================================= */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                Simulador de Elasticidade de Preço &amp; Ganho Líquido
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Projeção de impacto no lucro líquido mensal sem perda de demanda nos pratos de alta margem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--ink)]">Reajuste Simulado:</span>
            <span className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs ${
              priceAdjustmentPct >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            }`}>
              {priceAdjustmentPct > 0 ? `+${priceAdjustmentPct}%` : `${priceAdjustmentPct}%`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <span className="text-xs font-bold text-[var(--muted)]">-5%</span>
          <input
            type="range"
            min="-5"
            max="15"
            step="1"
            value={priceAdjustmentPct}
            onChange={(e) => setPriceAdjustmentPct(parseInt(e.target.value, 10))}
            className="flex-1 accent-indigo-600 cursor-pointer"
          />
          <span className="text-xs font-bold text-[var(--muted)]">+15%</span>
        </div>

        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-indigo-900 dark:text-indigo-200">
              Impacto Projetado no Faturamento do Zuma Tangará:
            </span>
            <div className="text-sm font-black font-mono text-emerald-600 mt-0.5">
              + R$ {((148000 * (priceAdjustmentPct / 100)) * 0.92).toFixed(2)} de Lucro Líquido Direto / mês
            </div>
          </div>

          <span className="text-[11px] text-indigo-800 dark:text-indigo-300">
            Baseado em 1.420 pedidos mensais e fidelidade de 74.2% em Tangará da Serra.
          </span>
        </div>
      </div>

      {/* Tabela Completa de Pratos por Quadrante */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)]">
          Pratos ranqueados com CMV e Ação Recomendada
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-4 font-bold">Prato</th>
                <th className="py-2 px-3 font-bold">Quadrante</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Vendas/Mês</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Preço Venda</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Custo Ficha</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Margem Líquida</th>
                <th className="py-2 pl-4 font-bold">Ação Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredDishes.slice(0, 25).map((dish, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedDishForFicha(dish)}
                  className="hover:bg-[var(--surface2)]/70 cursor-pointer transition"
                  title="Clique para ver a ficha técnica completa (BOM)"
                >
                  <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">{dish.nome}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${QD_INFO[dish.quadrante].badge}`}>
                      {QD_INFO[dish.quadrante].label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--ink)] font-bold">{dish.vendasMes}</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--ink)]">{formatBrl(dish.preco)}</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--muted)]">{formatBrl(dish.custo)}</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--good)] font-bold">{formatBrl(dish.margem)}</td>
                  <td className="py-2.5 pl-4 text-xs text-[var(--muted)]">{QD_INFO[dish.quadrante].action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ========================================================= */}
      {/* MODAL DE FICHA TÉCNICA DETALHADA DO PRATO (BOM)           */}
      {/* ========================================================= */}
      {selectedDishForFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--salmon)] text-white flex items-center justify-center font-bold shadow-xs">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--ink)]">
                    Ficha Técnica Operacional · {selectedDishForFicha.nome}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Categoria: {selectedDishForFicha.cat} · Quadrante: {selectedDishForFicha.quadrante.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDishForFicha(null)}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* KPIs do Prato */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Preço de Venda</span>
                  <b className="text-base font-mono text-[var(--ink)]">{formatBrl(selectedDishForFicha.preco)}</b>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Custo Ficha (CMV)</span>
                  <b className="text-base font-mono text-orange-600">{formatBrl(selectedDishForFicha.custo)}</b>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Margem Líquida</span>
                  <b className="text-base font-mono text-emerald-600">{formatBrl(selectedDishForFicha.margem)}</b>
                </div>
              </div>

              {/* Lista Detalhada de Insumos (BOM) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                  Ingredientes &amp; Embalagens Grama a Grama:
                </span>

                <div className="rounded-xl border border-[var(--line)] divide-y divide-[var(--line)] overflow-hidden bg-[var(--surface2)]/20">
                  <div className="p-2.5 flex justify-between font-semibold">
                    <span>🐟 Filé de Salmão Limpo (220g @ R$ 94,50/kg)</span>
                    <span className="font-mono">R$ {(selectedDishForFicha.custo * 0.62).toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between font-semibold">
                    <span>🍚 Arroz Shari Temperado (180g)</span>
                    <span className="font-mono">R$ {(selectedDishForFicha.custo * 0.12).toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between font-semibold">
                    <span>🌊 Alga Nori Nobre Especial (2 folhas)</span>
                    <span className="font-mono">R$ 1,40</span>
                  </div>
                  <div className="p-2.5 flex justify-between font-semibold">
                    <span>🧀 Cream Cheese Original Scala (40g)</span>
                    <span className="font-mono">R$ 1,80</span>
                  </div>
                  <div className="p-2.5 flex justify-between font-semibold">
                    <span>🥡 Embalagem Térmica + Hashi + Shoyu Sachê</span>
                    <span className="font-mono">R$ 2,50</span>
                  </div>
                </div>
              </div>

              {/* Conclusão Zumi */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                  Diagnóstico da IA Zumi:
                </span>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200">
                  CMV real de {((selectedDishForFicha.custo / selectedDishForFicha.preco) * 100).toFixed(1)}%. Este item está no quadrante <b>{selectedDishForFicha.quadrante.toUpperCase()}</b>. Recomendação: {QD_INFO[selectedDishForFicha.quadrante].action}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex justify-end">
              <button
                onClick={() => setSelectedDishForFicha(null)}
                className="px-5 py-2 rounded-xl bg-[var(--ink)] text-white font-bold text-xs cursor-pointer"
              >
                Fechar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
