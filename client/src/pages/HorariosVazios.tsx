import React, { useState } from "react";
import { formatBrl, THEMES_BY_DAY, CALENDAR_EVENTS } from "../../../shared/zumaData";
import { Calendar, Clock, DollarSign, Sparkles } from "lucide-react";

export const HorariosVazios: React.FC = () => {
  // Sliders do Simulador de Novos Turnos
  const [segundaPedidos, setSegundaPedidos] = useState(25);
  const [almocoPedidos, setAlmocoPedidos] = useState(35);
  const [ticketMedio, setTicketMedio] = useState(78);
  const [custoEquipeTurno, setCustoEquipeTurno] = useState(280);

  // Cálculos do simulador (Mensal: 4 segundas e 16 almoços qui-dom)
  const totalPedidosSegundaMes = segundaPedidos * 4;
  const totalPedidosAlmocoMes = almocoPedidos * 16;
  const totalPedidosNovos = totalPedidosSegundaMes + totalPedidosAlmocoMes;

  const faturamentoNovoBruto = totalPedidosNovos * ticketMedio;
  const cmvNovo = faturamentoNovoBruto * 0.32; // 32%
  const custoEquipeTotal = custoEquipeTurno * (4 + 16); // 20 turnos extras no mês
  const lucroLiquidoTurnos = faturamentoNovoBruto - cmvNovo - custoEquipeTotal;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Preenchimento de Ociosidade &amp; Novos Turnos
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Um motivo irresistível para pedir em cada horário vazio
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Temas fixos que o cliente aprende a esperar toda semana, simulador de abertura da segunda-feira e almoço executivo, além do calendário completo de datas comemorativas.
        </p>
      </div>

      {/* Grid: Semana Temática + Simulador Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Semana Temática (Tabela de Dias) */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--salmon)]" />
                Semana Temática: Hábitos que Vendem
              </h2>
              <p className="text-xs text-[var(--muted)]">Ofertas estratégicas onde há folga na cozinha, nunca no pico</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--nori-soft)] text-[var(--nori)]">
              Ativo no Zumi
            </span>
          </div>

          <div className="space-y-2.5">
            {THEMES_BY_DAY.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[var(--surface2)] text-[var(--ink)]">
                      {item.dia}
                    </span>
                    <b className="text-xs text-[var(--ink)]">{item.nome}</b>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.badge === "pronto"
                      ? "bg-[var(--nori-soft)] text-[var(--nori)]"
                      : item.badge === "novo turno"
                      ? "bg-[var(--salmon-soft)] text-[var(--salmon)]"
                      : "bg-[var(--warn)]/20 text-[var(--warn)]"
                  }`}>
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulador de Abertura de Novos Turnos */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--good)]" />
            Simulador: Abrir Segunda &amp; Almoço
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Descubra quanto sobra no bolso ao abrir a segunda-feira (hoje fechada) e o almoço executivo (qui a dom).
          </p>

          <div className="space-y-4 text-xs pt-1">
            {/* Sliders */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Pedidos por Segunda (18h às 23h):</span>
                <b className="font-mono-nums text-[var(--ink)]">{segundaPedidos} pedidos/noite</b>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={segundaPedidos}
                onChange={(e) => setSegundaPedidos(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Pedidos no Almoço Executivo (qui-dom):</span>
                <b className="font-mono-nums text-[var(--ink)]">{almocoPedidos} pedidos/dia</b>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                value={almocoPedidos}
                onChange={(e) => setAlmocoPedidos(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Ticket Médio do Almoço/Segunda:</span>
                <b className="font-mono-nums text-[var(--ink)]">{formatBrl(ticketMedio)}</b>
              </div>
              <input
                type="range"
                min="45"
                max="120"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Custo Extra de Equipe (por turno):</span>
                <b className="font-mono-nums text-[var(--ink)]">{formatBrl(custoEquipeTurno)}</b>
              </div>
              <input
                type="range"
                min="150"
                max="500"
                value={custoEquipeTurno}
                onChange={(e) => setCustoEquipeTurno(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            {/* Resultado Financeiro */}
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Pedidos extras no mês</span>
                <b className="font-mono-nums text-[var(--ink)]">{totalPedidosNovos} pedidos</b>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Faturamento bruto novo</span>
                <b className="font-mono-nums text-[var(--salmon)] font-bold">{formatBrl(faturamentoNovoBruto)}</b>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Custo de mercadoria (CMV 32%)</span>
                <span className="font-mono-nums text-[var(--bad)]">-{formatBrl(cmvNovo)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Equipe extra (20 turnos no mês)</span>
                <span className="font-mono-nums text-[var(--bad)]">-{formatBrl(custoEquipeTotal)}</span>
              </div>

              <div className="flex justify-between text-xs pt-2 border-t border-[var(--line)] font-bold text-[var(--nori)]">
                <span>Lucro Líquido Mensal Limpo</span>
                <span className="font-mono-nums text-sm">{formatBrl(lucroLiquidoTurnos)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário de Datas que Vendem (Próximos Meses) */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--salmon)]" />
              Calendário Anual de Datas que Vendem
            </h2>
            <p className="text-xs text-[var(--muted)]">Campanhas pré-programadas pelo Zumi com 15 dias de antecedência</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CALENDAR_EVENTS.map((ev, i) => (
            <div key={i} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--salmon-soft)] text-[var(--salmon)]">
                  {ev.data}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  ev.status === "agora"
                    ? "bg-[var(--bad)] text-white"
                    : ev.status === "preparar"
                    ? "bg-[var(--warn)]/20 text-[var(--warn)]"
                    : "bg-[var(--surface2)] text-[var(--muted)]"
                }`}>
                  {ev.status}
                </span>
              </div>

              <b className="text-xs font-bold text-[var(--ink)] block">{ev.nome}</b>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{ev.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
