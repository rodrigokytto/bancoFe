import React, { useState } from "react";
import { formatBrl } from "../../../shared/zumaData";
import { ZumiMascot } from "../components/shell/ZumiMascot";
import { Crown, Sparkles, TrendingUp, Check, ShieldCheck, HeartHandshake, DollarSign } from "lucide-react";

export const ClubeZumi: React.FC = () => {
  // Sliders de Assinatura
  const [mensalidade, setMensalidade] = useState(59.90);
  const [assinantes, setAssinantes] = useState(120);
  const [pedidosExtras, setPedidosExtras] = useState(2);
  const [ticketMedio, setTicketMedio] = useState(85);

  // Cálculos Financeiros
  const mrr = assinantes * mensalidade; // Receita recorrente garantida
  const faturamentoExtras = assinantes * pedidosExtras * ticketMedio;
  const faturamentoTotal = mrr + faturamentoExtras;

  // Custos de benefícios entregues
  const custoTemaki = assinantes * 11.50; // 1 temaki por assinante
  const custoFrete = assinantes * pedidosExtras * 2.50; // frete marginal dias fracos
  const custoCashback = faturamentoExtras * 0.10; // 10% cashback
  const cmvComidaExtras = faturamentoExtras * 0.32; // CMV 32%
  const custosTotais = custoTemaki + custoFrete + custoCashback + cmvComidaExtras;

  const lucroLiquidoMes = faturamentoTotal - custosTotais;
  const lucroLiquidoAno = lucroLiquidoMes * 12;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--salmon)] font-mono-nums">
            Estratégia Inovadora · Exclusivo Zuma
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
            Clube Zumi: O Primeiro Clube de Assinatura de Sushi de Tangará
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
            O cliente paga uma mensalidade fixa e ganha frete grátis nos dias mais fracos, 1 temaki cortesia por mês e cashback. Quem assina passa a pedir com o dobro de frequência para aproveitar.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--salmon-soft)] text-[var(--salmon)] text-xs font-bold shrink-0">
          <Crown className="w-4 h-4" />
          MRR &amp; Fidelidade Pura
        </span>
      </div>

      {/* 4 KPIs de Impacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">MRR Garantido</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{formatBrl(mrr)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Entra no dia 1 de cada mês</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Vendas Adicionais</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{formatBrl(faturamentoExtras)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">{assinantes * pedidosExtras} pedidos a mais</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Lucro Líquido / Mês</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">{formatBrl(lucroLiquidoMes)}</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">Já descontados temakis e fretes</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Lucro Anual no Bolso</span>
          <div className="text-2xl font-display font-extrabold text-[var(--nori)] font-mono-nums mt-1">{formatBrl(lucroLiquidoAno)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Previsibilidade total de caixa</div>
        </div>
      </div>

      {/* Grid: Simulador Financeiro + Planos do Clube */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Simulador de Parâmetros */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--salmon)]" />
            Simulador Financeiro do Clube
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Mensalidade da Assinatura:</span>
                <b className="font-mono-nums text-[var(--ink)]">{formatBrl(mensalidade)} / mês</b>
              </div>
              <input
                type="range"
                min="29.90"
                max="99.90"
                step="5"
                value={mensalidade}
                onChange={(e) => setMensalidade(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Assinantes Ativos:</span>
                <b className="font-mono-nums text-[var(--ink)]">{assinantes} assinantes</b>
              </div>
              <input
                type="range"
                min="20"
                max="350"
                step="10"
                value={assinantes}
                onChange={(e) => setAssinantes(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Pedidos Extras por Mês (por assinante):</span>
                <b className="font-mono-nums text-[var(--ink)]">+{pedidosExtras} pedidos</b>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={pedidosExtras}
                onChange={(e) => setPedidosExtras(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Ticket Médio do Pedido Extra:</span>
                <b className="font-mono-nums text-[var(--ink)]">{formatBrl(ticketMedio)}</b>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                step="5"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            {/* Resumo da Matemática */}
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">MRR (Mensalidades no dia 01)</span>
                <b className="font-mono-nums text-[var(--salmon)]">{formatBrl(mrr)}</b>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Vendas de pedidos a mais</span>
                <b className="font-mono-nums text-[var(--ink)]">{formatBrl(faturamentoExtras)}</b>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Custo de 1 Temaki por membro</span>
                <span className="font-mono-nums text-[var(--bad)]">-{formatBrl(custoTemaki)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">CMV + Cashback dos pedidos extras</span>
                <span className="font-mono-nums text-[var(--bad)]">-{formatBrl(custoCashback + cmvComidaExtras + custoFrete)}</span>
              </div>

              <div className="flex justify-between text-xs pt-2 border-t border-[var(--line)] font-bold text-[var(--nori)]">
                <span>Lucro Líquido no Bolso</span>
                <span className="font-mono-nums text-sm">{formatBrl(lucroLiquidoMes)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Níveis do Clube Zumi (Planos) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)]">Tiers do Clube Zumi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Silver */}
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Básico</span>
                <h3 className="text-base font-extrabold text-[var(--ink)]">Zumi Silver</h3>
                <div className="text-xl font-display font-extrabold text-[var(--ink)] font-mono-nums">
                  R$ 39,90 <span className="text-xs font-normal text-[var(--muted)]">/mês</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--muted)] pt-2 border-t border-[var(--line)]">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> Frete grátis seg a qua
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> 5% de cashback
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> Raspadinha em dobro
                  </li>
                </ul>
              </div>
              <button className="w-full py-1.5 rounded-lg border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface2)]">
                Ver Assinantes
              </button>
            </div>

            {/* Gold (Destaque) */}
            <div className="p-4 rounded-xl border-2 border-[var(--salmon)] bg-[var(--salmon-soft)]/10 space-y-3 flex flex-col justify-between shadow-xs relative">
              <span className="absolute -top-2.5 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--salmon)] text-white">
                Mais Vendido
              </span>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--salmon)]">Intermediário</span>
                <h3 className="text-base font-extrabold text-[var(--ink)]">Zumi Gold</h3>
                <div className="text-xl font-display font-extrabold text-[var(--salmon)] font-mono-nums">
                  R$ 59,90 <span className="text-xs font-normal text-[var(--muted)]">/mês</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--ink)] font-medium pt-2 border-t border-[var(--line)]">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> <b>1 Temaki grátis por mês</b>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> Frete grátis seg a qua
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> 10% de cashback
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> Sobremesa no aniversário
                  </li>
                </ul>
              </div>
              <button className="w-full py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105">
                Ver Assinantes
              </button>
            </div>

            {/* Black VIP */}
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--nori)]">Premium</span>
                <h3 className="text-base font-extrabold text-[var(--ink)]">Zumi Black VIP</h3>
                <div className="text-xl font-display font-extrabold text-[var(--nori)] font-mono-nums">
                  R$ 99,90 <span className="text-xs font-normal text-[var(--muted)]">/mês</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--muted)] pt-2 border-t border-[var(--line)]">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> 1 Barca 26 pçs / semestre
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> 1 Temaki por mês
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> Frete grátis TODOS os dias
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--good)]" /> Mesa VIP sem fila no salão
                  </li>
                </ul>
              </div>
              <button className="w-full py-1.5 rounded-lg border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface2)]">
                Ver Assinantes
              </button>
            </div>
          </div>

          {/* O que o restaurante ganha de verdade */}
          <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--muted)] space-y-2">
            <b className="text-[var(--ink)] block">Por que esse modelo funciona com perfeição para o Zuma:</b>
            <p>
              1. <b>Incentiva o consumo de segunda a quarta:</b> O frete grátis só nos dias fracos canaliza a demanda para horários que teriam garçom e sushiman ociosos.
            </p>
            <p>
              2. <b>Custo de entrega marginal:</b> O motoboy já está contratado na escala; o custo de mais uma entrega na mesma rota de Tangará é praticamente zero.
            </p>
            <p>
              3. <b>Fidelidade inquebrável:</b> Quando o cliente quer sushi, ele não abre o iFood para ver a concorrência — ele pede no Zuma porque já tem frete grátis e cashback acumulado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
