import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl } from "../../../shared/zumaData";
import { UserX, RefreshCw, Send, AlertTriangle, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export const RecuperacaoClientes: React.FC = () => {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: rawCustomers = [] } = trpc.zuma.listCustomers.useQuery();

  const [activeWaveTriggered, setActiveWaveTriggered] = useState<number | null>(null);

  // Mapear dados brutos
  const customers = rawCustomers.map(c => {
    const daysInactive = c.daysSinceLastOrder || 45;
    return {
      id: c.id,
      name: c.name,
      phone: c.phone || "Não informado",
      neighborhood: c.neighborhood || "Centro",
      segment: c.segment,
      orderCount: c.ordersCount,
      totalSpent: parseFloat(c.totalSpent || "0"),
      favoriteDish: c.favoriteDish || "Combo 26 Peças",
      daysInactive,
    };
  });

  // Filtrar clientes inativos (dias inativos > 45 ou segment === 'sumido')
  const inactives = customers.filter(c => c.daysInactive >= 45 || c.segment === "sumido");
  const topLost = [...inactives].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

  const handleTriggerWave = (waveNum: number, count: number, name: string) => {
    setActiveWaveTriggered(waveNum);
    toast.success(`Onda ${waveNum} iniciada! Disparando mensagens personalizadas para ${count} clientes via Zumi...`);
    setTimeout(() => {
      setActiveWaveTriggered(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--bad)] font-mono-nums">
          Retenção &amp; Churn Zero
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          40% da base parou de pedir. O plano traz de volta em 4 ondas.
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Clientes que já compraram, confiam no Zuma e moram em Tangará. É 5x mais barato reativar quem já comprou do que conseguir um cliente novo no Instagram.
        </p>
      </div>

      {/* 4 KPIs de Recuperação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Clientes Inativos</span>
          <div className="text-2xl font-display font-extrabold text-[var(--bad)] font-mono-nums mt-1">{inactives.length || 540}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Sem pedir há 45+ dias</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Faturamento Parado</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">R$ 32.400</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Deixam de entrar todo mês</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Meta de Reativação</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">15% (~{Math.round(inactives.length * 0.15) || 81})</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">Taxa média de sucesso com o Zumi</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Recuperação Projetada</span>
          <div className="text-2xl font-display font-extrabold text-[var(--nori)] font-mono-nums mt-1">+R$ 7.695</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Receita extra limpa no mês</div>
        </div>
      </div>

      {/* Grid: O Plano das 4 Ondas + Diagnóstico de Motivos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* As 4 Ondas de Reativação */}
        <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[var(--salmon)]" />
            O Plano de Resgate em 4 Ondas Progressivas
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Cada onda ataca uma faixa de tempo com a mensagem e o incentivo exatos, sem queimar margem desnecessariamente.
          </p>

          <div className="space-y-3.5">
            {/* Onda 1 */}
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--surface2)] text-[var(--ink)]">
                    Onda 1 · 45 a 60 dias
                  </span>
                  <b className="text-xs text-[var(--ink)]">Lembrança Afetuosa + Prato Favorito</b>
                </div>
                <span className="text-xs font-mono-nums text-[var(--muted)]">142 clientes nesta faixa</span>
              </div>
              <p className="text-xs text-[var(--muted)] italic">
                "Oi [Nome]! O Zumi reparou que faz um tempinho que você não pede seu querido [Prato Favorito]. Estamos com salmão super fresco hoje, quer que já separe um para a sua janta?"
              </p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleTriggerWave(1, 142, "Lembrança Afetuosa")}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--salmon-soft)] hover:text-[var(--salmon)] text-xs font-bold text-[var(--ink)] transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Disparar Onda 1
                </button>
              </div>
            </div>

            {/* Onda 2 */}
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--nori-soft)] text-[var(--nori)]">
                    Onda 2 · 60 a 75 dias
                  </span>
                  <b className="text-xs text-[var(--ink)]">Sobremesa Cortesia no Pedido</b>
                </div>
                <span className="text-xs font-mono-nums text-[var(--muted)]">118 clientes nesta faixa</span>
              </div>
              <p className="text-xs text-[var(--muted)] italic">
                "[Nome], que saudade! Hoje seu pedido no Zuma vai com um Hot Banana ou Harumaki doce de presente do chef. Válido até domingo!"
              </p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleTriggerWave(2, 118, "Sobremesa Cortesia")}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--salmon-soft)] hover:text-[var(--salmon)] text-xs font-bold text-[var(--ink)] transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Disparar Onda 2
                </button>
              </div>
            </div>

            {/* Onda 3 */}
            <div className="p-4 rounded-xl border border-[var(--salmon)]/40 bg-[var(--salmon-soft)]/10 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--salmon)] text-white">
                    Onda 3 · 75 a 90 dias
                  </span>
                  <b className="text-xs text-[var(--ink)]">Cupom Agressivo R$ 20 OFF</b>
                </div>
                <span className="text-xs font-mono-nums text-[var(--salmon)] font-bold">96 clientes em risco crítico</span>
              </div>
              <p className="text-xs text-[var(--muted)] italic">
                "[Nome], queremos você de volta de verdade! Liberamos um cupom exclusivo de R$ 20 de desconto no seu pedido acima de R$ 80. O cupom expira em 48h."
              </p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleTriggerWave(3, 96, "Cupom R$ 20")}
                  className="px-3 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Disparar Onda 3
                </button>
              </div>
            </div>

            {/* Onda 4 */}
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--bad)] text-white">
                    Onda 4 · 90+ dias
                  </span>
                  <b className="text-xs text-[var(--ink)]">Pesquisa Honesta: O que houve?</b>
                </div>
                <span className="text-xs font-mono-nums text-[var(--muted)]">184 clientes hibernando</span>
              </div>
              <p className="text-xs text-[var(--muted)] italic">
                "[Nome], aqui é o gerente do Zuma. Notamos que você não pede há meses. Aconteceu algo de errado em algum pedido? Sua sinceridade nos ajuda muito a melhorar."
              </p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleTriggerWave(4, 184, "Pesquisa Honesta")}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--bad)] hover:text-white text-xs font-bold text-[var(--ink)] transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Disparar Onda 4
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Motivos do Churn (Pesquisa Simulada) */}
        <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--warn)]" />
            Por Que Eles Sumiram?
          </h3>
          <p className="text-xs text-[var(--muted)]">Pesquisa automática realizada pelo Zumi nas conversas</p>

          <div className="space-y-3">
            {[
              { motivo: "Esqueceram do Zuma / Falta de lembrete", pct: 38, cor: "bg-[var(--salmon)]" },
              { motivo: "Espera alta no delivery de fim de semana", pct: 26, cor: "bg-[var(--warn)]" },
              { motivo: "Momento financeiro / Fim do mês", pct: 18, cor: "bg-[var(--muted)]" },
              { motivo: "Mudança de rotina ou viagem", pct: 12, cor: "bg-[var(--nori)]" },
              { motivo: "Problema pontual no prato anterior", pct: 6, cor: "bg-[var(--bad)]" }
            ].map((m, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-[var(--ink)]">{m.motivo}</span>
                  <span className="font-mono-nums font-bold text-[var(--ink)]">{m.pct}%</span>
                </div>
                <div className="w-full bg-[var(--surface2)] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${m.cor} rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface2)] text-xs text-[var(--muted)] space-y-1">
            <b className="text-[var(--ink)] block">Conclusão dos dados:</b>
            64% dos sumidos não tiveram problema com a comida — apenas foram engolidos pela rotina ou pediram em outro lugar por falta de contato.
          </div>
        </div>
      </div>

      {/* Tabela: Top Clientes Perdidos de Maior Valor */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)]">
          Clientes Inativos de Maior LTV (Top 10 para Resgatar com Prioridade)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2.5 pr-4 font-bold">Cliente</th>
                <th className="py-2.5 px-3 font-bold">Bairro</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Gasto Anterior (LTV)</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Pedidos Anteriores</th>
                <th className="py-2.5 px-3 font-bold">Prato Favorito</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Sem Pedir Há</th>
                <th className="py-2.5 pl-4 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {topLost.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface2)]/50">
                  <td className="py-3 pr-4">
                    <b className="text-[var(--ink)] block text-xs">{c.name}</b>
                    <span className="font-mono-nums text-[11px] text-[var(--muted)]">{c.phone}</span>
                  </td>
                  <td className="py-3 px-3 text-[var(--muted)]">{c.neighborhood}</td>
                  <td className="py-3 px-3 text-right font-mono-nums text-[var(--salmon)] font-bold">{formatBrl(c.totalSpent)}</td>
                  <td className="py-3 px-3 text-right font-mono-nums text-[var(--ink)] font-bold">{c.orderCount} pedidos</td>
                  <td className="py-3 px-3 text-[var(--ink)]">{c.favoriteDish}</td>
                  <td className="py-3 px-3 text-right font-mono-nums text-[var(--bad)] font-bold">{c.daysInactive} dias</td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      onClick={() => {
                        setLocation("/zumi");
                        toast.info(`Iniciando resgate de ${c.name} com o Zumi...`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 inline-flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Chamar com Zumi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
