import React, { useState } from "react";
import { formatBrl } from "../../../shared/zumaData";
import { Users, ChefHat, AlertTriangle, TrendingUp, Sliders, DollarSign } from "lucide-react";

interface HourSlot {
  hora: string;
  salaoOcup: number; // %
  cozinhaUso: number; // %
  acao: string;
}

export const CapacidadeLotacao: React.FC = () => {
  // Sliders
  const [lugaresSalao, setLugaresSalao] = useState(64);
  const [cozinhaCapacidade, setCozinhaCapacidade] = useState(35);
  const [metaOcupacao, setMetaOcupacao] = useState(75);
  const [ticketPessoa, setTicketPessoa] = useState(85);

  const HORAS: HourSlot[] = [
    { hora: "18h–19h", salaoOcup: 22, cozinhaUso: 28, acao: "Happy hour de sushi + Hot roll em dobro para puxar saída antecipada" },
    { hora: "19h–20h", salaoOcup: 48, cozinhaUso: 52, acao: "Cupom relâmpago de frete grátis disparado às 18h30 pelo Zumi" },
    { hora: "20h–21h", salaoOcup: 88, cozinhaUso: 94, acao: "Pico: proteger tempo de entrega, sem desconto, focar em combos prontos" },
    { hora: "21h–22h", salaoOcup: 72, cozinhaUso: 78, acao: "Rotatividade de mesas: sugerir sobremesa rápida ou drinque" },
    { hora: "22h–23h", salaoOcup: 34, cozinhaUso: 38, acao: "Delivery da madrugada: combos fechados para quem pede tarde" }
  ];

  // Cálculo de dinheiro deixado na mesa por dia e mês
  const analiseHoras = HORAS.map(slot => {
    const gapSalao = Math.max(0, metaOcupacao - slot.salaoOcup);
    const pessoasFaltando = Math.round((gapSalao / 100) * lugaresSalao);
    const valorDia = pessoasFaltando * ticketPessoa;
    const valorMes = valorDia * 26; // 26 dias operando
    return {
      ...slot,
      gapSalao,
      pessoasFaltando,
      valorDia,
      valorMes,
    };
  });

  const totalPerdidoMes = analiseHoras.reduce((s, h) => s + h.valorMes, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Capacidade Operacional &amp; Lotação
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Onde sobra lugar no salão e cozinha parada
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Compara o que o salão e a cozinha aguentam com o que acontece em cada hora. Veja exatamente quanto dinheiro fica na mesa por mês e quais táticas usar para preencher as lacunas.
        </p>
      </div>

      {/* Sliders de Simulação */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--salmon)]" />
          Ajuste os Parâmetros da Operação
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Lugares no Salão:</span>
              <b className="font-mono-nums text-[var(--ink)]">{lugaresSalao} lugares</b>
            </div>
            <input
              type="range"
              min="30"
              max="120"
              value={lugaresSalao}
              onChange={(e) => setLugaresSalao(Number(e.target.value))}
              className="w-full accent-[var(--salmon)] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Capacidade da Cozinha:</span>
              <b className="font-mono-nums text-[var(--ink)]">{cozinhaCapacidade} ped/hora</b>
            </div>
            <input
              type="range"
              min="15"
              max="70"
              value={cozinhaCapacidade}
              onChange={(e) => setCozinhaCapacidade(Number(e.target.value))}
              className="w-full accent-[var(--salmon)] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Meta de Ocupação:</span>
              <b className="font-mono-nums text-[var(--ink)]">{metaOcupacao}%</b>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={metaOcupacao}
              onChange={(e) => setMetaOcupacao(Number(e.target.value))}
              className="w-full accent-[var(--salmon)] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Ticket Médio por Pessoa:</span>
              <b className="font-mono-nums text-[var(--ink)]">{formatBrl(ticketPessoa)}</b>
            </div>
            <input
              type="range"
              min="50"
              max="160"
              value={ticketPessoa}
              onChange={(e) => setTicketPessoa(Number(e.target.value))}
              className="w-full accent-[var(--salmon)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Destaque: Dinheiro Deixado na Mesa */}
      <div className="p-5 rounded-xl border border-[var(--salmon)]/40 bg-[var(--salmon-soft)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--salmon)] block">
            Dinheiro que Fica na Mesa (Oportunidade)
          </span>
          <div className="text-3xl font-display font-black text-[var(--salmon)] font-mono-nums mt-0.5">
            {formatBrl(totalPerdidoMes)} <span className="text-sm font-semibold text-[var(--muted)]">/ mês</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-xl">
            Este é o faturamento que o Zuma deixa de realizar mensalmente apenas por ter horários com salão abaixo de {metaOcupacao}% de ocupação. O plano de ação abaixo ataca diretamente esse vale.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs">
            <DollarSign className="w-4 h-4" />
            +R$ 1.090 / noite recuperáveis
          </span>
        </div>
      </div>

      {/* Gráficos Comparativos: Salão x Cozinha por Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salão */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--salmon)]" />
            Salão: Ocupação por Hora (% dos {lugaresSalao} lugares)
          </h2>

          <div className="space-y-3">
            {HORAS.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--ink)]">{h.hora}</span>
                  <span className="font-mono-nums font-bold text-[var(--ink)]">
                    {h.salaoOcup}% ({Math.round((h.salaoOcup / 100) * lugaresSalao)} pessoas)
                  </span>
                </div>
                <div className="w-full bg-[var(--surface2)] h-3 rounded-full overflow-hidden relative">
                  {/* Linha da meta */}
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-dashed border-red-500 z-10"
                    style={{ left: `${metaOcupacao}%` }}
                    title={`Meta: ${metaOcupacao}%`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      h.salaoOcup >= metaOcupacao
                        ? "bg-[var(--good)]"
                        : h.salaoOcup >= 45
                        ? "bg-[var(--warn)]"
                        : "bg-[var(--salmon)]"
                    }`}
                    style={{ width: `${h.salaoOcup}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cozinha */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[var(--nori)]" />
            Cozinha: Uso por Hora (% dos {cozinhaCapacidade} ped/hora)
          </h2>

          <div className="space-y-3">
            {HORAS.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--ink)]">{h.hora}</span>
                  <span className="font-mono-nums font-bold text-[var(--ink)]">
                    {h.cozinhaUso}% ({Math.round((h.cozinhaUso / 100) * cozinhaCapacidade)} ped/h)
                  </span>
                </div>
                <div className="w-full bg-[var(--surface2)] h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      h.cozinhaUso >= 90
                        ? "bg-[var(--bad)]"
                        : h.cozinhaUso >= 60
                        ? "bg-[var(--good)]"
                        : "bg-[var(--nori)]"
                    }`}
                    style={{ width: `${h.cozinhaUso}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Horários para Atacar */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--salmon)]" />
          Horários para Atacar (Ordenados pelo Dinheiro Faltante)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-4 font-bold">Horário</th>
                <th className="py-2 px-3 font-bold">Salão Atual</th>
                <th className="py-2 px-3 font-bold">Cozinha Atual</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Falta / Noite</th>
                <th className="py-2 px-3 font-bold text-right font-mono-nums">Dinheiro Parado / Mês</th>
                <th className="py-2 pl-4 font-bold">Ação Recomendada da IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {analiseHoras.sort((a, b) => b.valorMes - a.valorMes).map((h, i) => (
                <tr key={i} className="hover:bg-[var(--surface2)]/50">
                  <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">{h.hora}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      h.salaoOcup >= metaOcupacao ? "bg-[var(--nori-soft)] text-[var(--nori)]" : "bg-[var(--salmon-soft)] text-[var(--salmon)]"
                    }`}>
                      {h.salaoOcup}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono-nums text-[var(--ink)]">{h.cozinhaUso}%</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--ink)] font-bold">{formatBrl(h.valorDia)}</td>
                  <td className="py-2.5 px-3 text-right font-mono-nums text-[var(--salmon)] font-bold">{formatBrl(h.valorMes)}</td>
                  <td className="py-2.5 pl-4 text-xs text-[var(--muted)]">{h.acao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
