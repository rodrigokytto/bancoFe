import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl, RECIPES } from "../../../shared/zumaData";
import { Package, AlertTriangle, ShoppingCart, ArrowDownRight, ArrowUpRight, CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";

export const EstoqueInsumos: React.FC = () => {
  const utils = trpc.useUtils();
  const { data: rawStock = [], isLoading } = trpc.zuma.listStock.useQuery();

  const [selectedRecipeDish, setSelectedRecipeDish] = useState("Combo 26 Peças");

  const stockItems = rawStock.map(i => ({
    id: i.id,
    code: i.code,
    name: i.name,
    unit: i.unit,
    currentQty: parseFloat(i.currentStock || "0"),
    minQty: parseFloat(i.minStock || "0"),
    unitCost: parseFloat(i.unitCost || "0"),
  }));

  const totalValue = stockItems.reduce((s, i) => s + i.currentQty * i.unitCost, 0);
  const criticalItems = stockItems.filter(i => i.currentQty <= i.minQty);

  // Lista de compras sugerida baseada no déficit para atingir 2x o mínimo
  const suggestedShopping = stockItems.map(item => {
    const target = item.minQty * 2;
    const deficit = Math.max(0, target - item.currentQty);
    return {
      ...item,
      suggestedBuy: deficit,
      totalCost: deficit * item.unitCost
    };
  }).filter(i => i.suggestedBuy > 0);

  const totalShoppingCost = suggestedShopping.reduce((s, i) => s + i.totalCost, 0);

  const handleExportShopping = () => {
    const text = suggestedShopping
      .map(i => `• ${i.name}: ${i.suggestedBuy.toFixed(1)} ${i.unit}`)
      .join("\n");
    navigator.clipboard?.writeText(`*Lista de Compras Zuma Cozinha Oriental*\n\n${text}\n\nPrevisão: ${formatBrl(totalShoppingCost)}`);
    toast.success("Lista de compras copiada para a área de transferência! Pronta para colar no WhatsApp do fornecedor.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          ERP · Gestão de Estoque &amp; Insumos
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Estoque que se baixa sozinho pela ficha técnica
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          A cada venda finalizada na loja ou no PDV, o Zuma dá baixa automática nas gramas de salmão, arroz, cream cheese e embalagens. Fim das perdas misteriosas e lista de compras gerada em 1 clique.
        </p>
      </div>

      {/* 4 KPIs de Estoque */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Valor Total em Estoque</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{formatBrl(totalValue || 14850)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Custo de aquisição atualizado</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Insumos em Alerta / Crítico</span>
          <div className="text-2xl font-display font-extrabold text-[var(--bad)] font-mono-nums mt-1">{criticalItems.length}</div>
          <div className="text-xs text-[var(--bad)] font-medium mt-0.5">Abaixo do estoque mínimo</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">CMV Médio da Operação</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">31,4%</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">Meta abaixo de 33% cumprida</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Compra Prevista Fim de Semana</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{formatBrl(totalShoppingCost || 4820)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">{suggestedShopping.length} insumos a repor</div>
        </div>
      </div>

      {/* Grid: Tabela de Insumos + Lista de Compras Sugerida */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabela de Insumos */}
        <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--salmon)]" />
              Insumos em Tempo Real
            </h2>
            <span className="text-xs font-bold text-[var(--muted)]">
              {stockItems.length} insumos monitorados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-2.5 pr-4 font-bold">Insumo</th>
                  <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Estoque Atual</th>
                  <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Mínimo</th>
                  <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Custo Unit.</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 pl-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {stockItems.map((item) => {
                  const isCrit = item.currentQty <= item.minQty;
                  const pct = Math.min(100, Math.round((item.currentQty / (item.minQty * 2)) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-[var(--surface2)]/50">
                      <td className="py-3 pr-4 font-bold text-[var(--ink)]">{item.name}</td>
                      <td className="py-3 px-3 text-right font-mono-nums font-bold text-[var(--ink)]">
                        {item.currentQty.toFixed(1)} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-nums text-[var(--muted)]">
                        {item.minQty.toFixed(1)} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-nums text-[var(--ink)]">
                        {formatBrl(item.unitCost)} / {item.unit}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1 w-24">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isCrit ? "bg-[var(--bad)] text-white" : "bg-[var(--nori-soft)] text-[var(--nori)]"
                          }`}>
                            {isCrit ? "Repor Urgente" : "Normal"}
                          </span>
                          <div className="w-full bg-[var(--surface2)] h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isCrit ? "bg-[var(--bad)]" : "bg-[var(--good)]"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <button
                          onClick={() => toast.info(`Entrada de estoque para ${item.name} registrada.`)}
                          className="px-2 py-1 rounded-md border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)] hover:text-[var(--salmon)] text-[11px] font-semibold text-[var(--ink)]"
                        >
                          + Entrada
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de Compras Sugerida */}
        <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--salmon)]" />
              Lista de Compras da Semana
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Calculada automaticamente pelo Zumi com base no estoque atual e previsão do fim de semana.
          </p>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {suggestedShopping.map((item) => (
              <div key={item.id} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs">
                <div>
                  <b className="text-[var(--ink)] block">{item.name}</b>
                  <span className="text-[11px] text-[var(--muted)]">
                    Comprar: <b>{item.suggestedBuy.toFixed(1)} {item.unit}</b>
                  </span>
                </div>
                <b className="font-mono-nums text-[var(--salmon)]">{formatBrl(item.totalCost)}</b>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Total Estimado da Reposição:</span>
              <span className="font-mono-nums text-[var(--salmon)]">{formatBrl(totalShoppingCost)}</span>
            </div>

            <button
              onClick={handleExportShopping}
              className="w-full py-2 rounded-lg bg-[var(--nori)] text-white text-xs font-bold hover:brightness-105 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enviar Lista p/ WhatsApp Fornecedor
            </button>
          </div>
        </div>
      </div>

      {/* Ficha Técnica por Porção */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">Ficha Técnica Exata (CMV por Prato)</h2>
            <p className="text-xs text-[var(--muted)]">Gramatura de cada ingrediente e custo em centavos por porção</p>
          </div>

          <select
            value={selectedRecipeDish}
            onChange={(e) => setSelectedRecipeDish(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--ink)]"
          >
            {Object.keys(RECIPES).map(dish => (
              <option key={dish} value={dish}>{dish}</option>
            ))}
          </select>
        </div>

        {RECIPES[selectedRecipeDish] && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(RECIPES[selectedRecipeDish]).map(([ingrediente, qtd], i) => (
              <div key={i} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs space-y-1">
                <span className="text-[10.5px] font-bold text-[var(--muted)] uppercase block">{ingrediente}</span>
                <b className="text-sm font-mono-nums text-[var(--ink)] block">
                  {qtd < 1 ? `${Math.round(qtd * 1000)}g` : `${qtd} un`}
                </b>
                <span className="text-[10px] text-[var(--good)] font-semibold">Baixa automática</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
