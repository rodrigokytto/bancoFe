import React from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  Receipt,
  Scale,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  UtensilsCrossed,
  Bike
} from "lucide-react";

export const DreTurnoView: React.FC = () => {
  const { data: dre, isLoading, refetch } = trpc.zuma.getShiftFinancialDre.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-orange-500" />
        Carregando DRE do Turno em tempo real...
      </div>
    );
  }

  if (!dre) {
    return (
      <div className="p-8 text-center text-slate-400">
        Nenhum dado financeiro apurado para o turno atual.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do DRE com Status do Turno e Operador */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
              Turno {dre.turnoStatus.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">• {dre.periodo}</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">DRE Gerencial em Tempo Real</h2>
          <p className="text-xs text-slate-400">
            Operador do Caixa: <strong className="text-slate-200">{dre.operadorCaixa}</strong> • Atualizado em {new Date(dre.dataHora).toLocaleTimeString("pt-BR")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span>Atualizar Números</span>
          </button>
        </div>
      </div>

      {/* Cards Principais: Receita Bruta, CMV Real, Margem de Contribuição e EBITDA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Bruta */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Receita Bruta</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{formatBrl(dre.receitaBruta)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Líquida:</span>
            <strong className="text-emerald-400">{formatBrl(dre.receitaLiquida)}</strong>
          </div>
        </div>

        {/* CMV Real (Ficha Técnica) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CMV Real Ficha Técnica</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-orange-400 mt-2">{formatBrl(dre.cmvReal)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Alvo: &lt; 32% • Atual:</span>
            <strong className={`font-bold ${dre.cmvPercentual <= 32 ? "text-emerald-400" : "text-amber-400"}`}>
              {dre.cmvPercentual}%
            </strong>
          </div>
        </div>

        {/* Margem de Contribuição */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Margem Contribuição</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2">{formatBrl(dre.margemContribuicaoBrl)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Margem %:</span>
            <strong className="text-blue-300">{dre.margemContribuicaoPercentual}%</strong>
          </div>
        </div>

        {/* EBITDA do Turno */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resultado Operacional (EBITDA)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-300 mt-2">{formatBrl(dre.resultadoOperacionalEbitda)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Margem EBITDA:</span>
            <strong className="text-purple-400">{dre.margemEbitdaPercentual}%</strong>
          </div>
        </div>
      </div>

      {/* Grid com Composição de Receita por Canal e Comparativo vs Saipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalhamento de Faturamento por Canal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-orange-400" />
            Receita por Canal de Venda
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-200">Salão & Mesas</span>
              </div>
              <span className="text-sm font-black text-white">{formatBrl(dre.vendasSalaoMesas)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Balcão (Takeaway)</span>
              </div>
              <span className="text-sm font-black text-white">{formatBrl(dre.vendasBalcao)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <Bike className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-sm font-medium text-slate-200">Delivery Próprio (WhatsApp/Site)</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">0% Comissão</span>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">{formatBrl(dre.vendasDeliveryProprio)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">iF</div>
                <div>
                  <span className="text-sm font-medium text-slate-200">iFood Marketplace</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">27% Comissão</span>
                </div>
              </div>
              <span className="text-sm font-black text-slate-300">{formatBrl(dre.vendasIfood)}</span>
            </div>
          </div>

          {/* Deduções e Despesas */}
          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Deduções Totais</p>
              <p className="text-sm font-bold text-amber-400 mt-1">{formatBrl(dre.deducoes.totalDeducoes)}</p>
              <p className="text-[10px] text-slate-500">Descontos + Comissões iFood</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Despesas Operacionais</p>
              <p className="text-sm font-bold text-amber-400 mt-1">{formatBrl(dre.despesasOperacionais.totalDespesas)}</p>
              <p className="text-[10px] text-slate-500">Taxa 10% + Diárias + Embalagens</p>
            </div>
          </div>
        </div>

        {/* CARD ESTRATÉGICO: ECONOMIA REAL VS SAIPOS & IFOOD */}
        <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-black text-white">Economia do Piloto Zuma vs Saipos</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
              LUCRO RETIDO
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            Ao operar com canal direto no WhatsApp e taxa zero Sicredi no Pix, o restaurante deixa de pagar intermediários por pedido:
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Comissão iFood Evitada (27%)</p>
                <p className="text-[11px] text-slate-400">Pedidos convertidos no Delivery Direto Zuma</p>
              </div>
              <p className="text-base font-black text-emerald-400">+{formatBrl(dre.economiaVsSaiposIfood.economiaComissaoIfood)}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Taxa de Maquininha Evitada (2.49%)</p>
                <p className="text-[11px] text-slate-400">Pix Direto Conta Sicredi Tangará da Serra</p>
              </div>
              <p className="text-base font-black text-emerald-400">+{formatBrl(dre.economiaVsSaiposIfood.economiaTaxaPixSicredi)}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Mensalidade Saipos Rateada</p>
                <p className="text-[11px] text-slate-400">Economia diária do plano intermediário Saipos</p>
              </div>
              <p className="text-base font-black text-emerald-400">+{formatBrl(dre.economiaVsSaiposIfood.economiaMensalidadeSaipos)}</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-500/30 flex items-center justify-between">
            <span className="text-sm font-black text-white">Lucro Extra Retido no Turno:</span>
            <span className="text-xl font-black text-emerald-300">+{formatBrl(dre.economiaVsSaiposIfood.totalEconomizado)}</span>
          </div>
        </div>
      </div>

      {/* Tabela dos Pratos Mais Consumidos com CMV Unitário e Margem */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-orange-400" />
          Ranking de Consumo do Turno com CMV Apurado
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">Prato / Item</th>
                <th className="py-2.5 px-3 text-center">Qtd Expedida</th>
                <th className="py-2.5 px-3 text-right">CMV Total</th>
                <th className="py-2.5 px-3 text-right">Receita Total</th>
                <th className="py-2.5 px-3 text-right">Margem Bruta %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dre.itensMaisConsumidos.map((it, idx) => {
                const margemPct = it.receitaTotal > 0
                  ? (((it.receitaTotal - it.cmvTotal) / it.receitaTotal) * 100).toFixed(1)
                  : "0.0";
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">{it.nome}</td>
                    <td className="py-3 px-3 text-center font-bold text-orange-400">{it.quantidade}x</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatBrl(it.cmvTotal)}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">{formatBrl(it.receitaTotal)}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400">{margemPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
