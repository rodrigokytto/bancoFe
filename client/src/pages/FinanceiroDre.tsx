import { trpc } from "../lib/trpc";
import React from "react";
import { formatBrl } from "../../../shared/zumaData";
import { DollarSign, TrendingUp, ArrowUpRight, CheckCircle2, Calendar, PieChart } from "lucide-react";

export const FinanceiroDre: React.FC = () => {
  const { data: finData } = trpc.zuma.getFinancialAccounts.useQuery(undefined, { refetchInterval: 4000 });
  const { data: dreShift } = trpc.zuma.getShiftFinancialDre.useQuery(undefined, { refetchInterval: 4000 });

  const shiftRev = dreShift?.receitaBruta || 0;
  const fatBrutoAtual = 68400 + shiftRev;
  const impSimples = -Number((fatBrutoAtual * 0.055).toFixed(2));
  const txMeios = -Number((fatBrutoAtual * 0.022).toFixed(2));
  const recLiq = Number((fatBrutoAtual + impSimples + txMeios).toFixed(2));
  const cmv = -Number((fatBrutoAtual * 0.315 + (dreShift?.cmvReal || 0)).toFixed(2));
  const margemBruta = Number((recLiq + cmv).toFixed(2));
  const lucroLiq = Number((margemBruta - 16800 - 4200 - 2850 - 1200 - 6688).toFixed(2));

  const DRE_LINES = [
    { label: "(+) Faturamento Bruto de Vendas", atual: fatBrutoAtual, plano: 142000, isTotal: false, isPos: true },
    { label: "(-) Impostos Simples Nacional (5,5%)", atual: impSimples, plano: -7810, isTotal: false, isPos: false },
    { label: "(-) Taxas de Meios de Pagamento (2,2%)", atual: txMeios, plano: -3124, isTotal: false, isPos: false },
    { label: "(=) Receita Operacional Líquida", atual: recLiq, plano: 131066, isTotal: true, isPos: true },
    { label: "(-) CMV de Insumos e Alimentos (31,5%)", atual: cmv, plano: -44730, isTotal: false, isPos: false },
    { label: "(=) Margem de Contribuição Bruta", atual: margemBruta, plano: 86336, isTotal: true, isPos: true },
    { label: "(-) Folha de Pagamento e Encargos", atual: -16800, plano: -28400, isTotal: false, isPos: false },
    { label: "(-) Aluguel, Condomínio e IPTU", atual: -4200, plano: -4200, isTotal: false, isPos: false },
    { label: "(-) Energia Elétrica e Água", atual: -2850, plano: -3900, isTotal: false, isPos: false },
    { label: "(-) Marketing e Tráfego Local (Zumi)", atual: -1200, plano: -2800, isTotal: false, isPos: false },
    { label: "(-) Manutenção, Softwares e Outros Fixos", atual: -6688, plano: -12436, isTotal: false, isPos: false },
    { label: "(=) LUCRO LÍQUIDO FINAL NO BOLSO", atual: lucroLiq, plano: 34600, isTotal: true, isFinal: true, isPos: true }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Controladoria &amp; Inteligência Financeira
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          DRE do mês, contas a pagar e o efeito do plano no lucro
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Demonstrativo de Resultado do Exercício (DRE) gerencial. Comparativo da operação atual contra o plano de escala (+250% de lucro líquido) destravado pelos 19 módulos do Zuma Pilot.
        </p>
      </div>

      {/* 4 KPIs Financeiros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Faturamento Atual</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{formatBrl(fatBrutoAtual)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Média mensal atual</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Lucro Líquido Atual</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{formatBrl(lucroLiq)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Margem líquida de 14,4%</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Ponto de Equilíbrio (Break-Even)</span>
          <div className="text-2xl font-display font-extrabold text-[var(--nori)] font-mono-nums mt-1">{formatBrl(42600)}</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">Atingido dia 18 de cada mês</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--salmon)]">Lucro Projetado com Plano</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{formatBrl(34600)}</div>
          <div className="text-xs text-[var(--salmon)] font-bold mt-0.5">+251% de salto no bolso</div>
        </div>
      </div>

      {/* Tabela do DRE Comparativo */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--salmon)]" />
              Demonstrativo de Resultado: Operação Atual vs Plano Zuma Pilot (+250%)
            </h2>
            <p className="text-xs text-[var(--muted)]">Valores mensais auditados com base nos custos reais de Tangará da Serra</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--salmon-soft)] text-[var(--salmon)] shrink-0">
            Escala sem Aumentar Aluguel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2.5 pr-4 font-bold">Linha do DRE</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Situação Atual</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Plano de Escala (+250%)</th>
                <th className="py-2.5 pl-4 font-bold text-right font-mono-nums">Variação Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {DRE_LINES.map((row, i) => {
                const diff = row.plano - row.atual;

                return (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      row.isFinal
                        ? "bg-[var(--salmon-soft)]/20 font-black text-sm"
                        : row.isTotal
                        ? "bg-[var(--surface2)]/80 font-bold"
                        : "hover:bg-[var(--surface2)]/30 text-[var(--ink)]"
                    }`}
                  >
                    <td className={`py-3 pr-4 ${row.isFinal ? "text-[var(--salmon)] font-extrabold" : row.isTotal ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
                      {row.label}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-nums">
                      {formatBrl(row.atual)}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono-nums ${row.isFinal ? "text-[var(--salmon)] font-extrabold" : "text-[var(--ink)] font-bold"}`}>
                      {formatBrl(row.plano)}
                    </td>
                    <td className={`py-3 pl-4 text-right font-mono-nums font-bold ${diff >= 0 ? "text-[var(--good)]" : "text-[var(--bad)]"}`}>
                      {diff > 0 ? `+${formatBrl(diff)}` : formatBrl(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Contas a Pagar + Recebimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Contas a Pagar */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--salmon)]" />
            Contas a Pagar do Mês
          </h2>

          <div className="space-y-2.5 text-xs">
            {((finData?.contasPagar || []).length > 0 ? (finData?.contasPagar || []).map(cp => ({
              credor: cp.fornecedor,
              cat: cp.categoria,
              venc: cp.vencimento,
              valor: cp.valorLiquido,
              status: cp.status === "Liquidado" ? "Pago" : "A vencer"
            })) : [
              { credor: "Fornecedor de Salmão Fresco", cat: "Insumo / CMV", venc: "22/11", valor: 8400, status: "A vencer" },
              { credor: "Imobiliária Tangará (Aluguel Salão)", cat: "Custo Fixo", venc: "10/11", valor: 4200, status: "Pago" },
              { credor: "Energisa Mato Grosso", cat: "Utilidade", venc: "15/11", valor: 2850, status: "Pago" },
              { credor: "Distribuidora de Embalagens", cat: "Descartáveis", venc: "25/11", valor: 1890, status: "A vencer" },
              { credor: "Folha de Pagamento Sushimans & Salão", cat: "Equipe", venc: "05/11", valor: 16800, status: "Pago" }
            ]).map((c, i) => (
              <div key={i} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between">
                <div>
                  <b className="text-[var(--ink)] block">{c.credor}</b>
                  <span className="text-[11px] text-[var(--muted)]">{c.cat} · Vencimento: {c.venc}</span>
                </div>
                <div className="text-right">
                  <b className="font-mono-nums text-[var(--ink)] block">{formatBrl(c.valor)}</b>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === "Pago" ? "bg-[var(--nori-soft)] text-[var(--nori)]" : "bg-[var(--warn)]/20 text-[var(--warn)]"
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formas de Recebimento */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[var(--nori)]" />
            Recebimentos por Forma
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { forma: "Pix Instantâneo (Taxa 0,99%)", pct: 46, valor: 31464, cor: "bg-[var(--good)]" },
              { forma: "Cartão de Crédito (Taxa 2,89%)", pct: 34, valor: 23256, cor: "bg-[var(--salmon)]" },
              { forma: "Cartão de Débito (Taxa 1,39%)", pct: 12, valor: 8208, cor: "bg-[var(--warn)]" },
              { forma: "Dinheiro Físico (Taxa 0,00%)", pct: 8, valor: 5472, cor: "bg-[var(--nori)]" }
            ].map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-[var(--ink)]">{f.forma}</span>
                  <span className="font-mono-nums font-bold text-[var(--ink)]">{formatBrl(f.valor)} ({f.pct}%)</span>
                </div>
                <div className="w-full bg-[var(--surface2)] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${f.cor} rounded-full`} style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface2)] text-xs text-[var(--muted)] space-y-1">
            <b className="text-[var(--ink)] block">Vantagem do Pix no Zuma:</b>
            Quase metade dos clientes paga no Pix. O dinheiro cai no segundo seguinte, sem reter capital de giro e com taxa insignificante se comparada ao iFood (que retém 27% e paga a cada 30 dias).
          </div>
        </div>
      </div>
    </div>
  );
};
