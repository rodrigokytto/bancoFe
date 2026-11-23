import React, { useState } from "react";
import { Users, Calendar, Award, CheckCircle2, Clock, CreditCard, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

const MEMBROS_CLUBE = [
  { id: "m1", nome: "Dr. Alexandre Pires", plano: "Sócio VIP Familiar", mensalidade: 380.00, status: "ativo", dependentes: 3, quadrasReservadas: "Quadra Beach Tennis 01 (18h-19h)" },
  { id: "m2", nome: "Beatriz Nogueira Mendes", plano: "Sócio Individual Gold", mensalidade: 220.00, status: "ativo", dependentes: 0, quadrasReservadas: "Quadra Saibro Tênis 02 (19h-20h)" },
  { id: "m3", nome: "Gabriel Ferraz", plano: "Sócio Atleta Torneio", mensalidade: 180.00, status: "ativo", dependentes: 0, quadrasReservadas: "Arena Poliesportiva" },
];

export const ErpClubeSubsuite: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-500/10 px-2.5 py-0.5 rounded-md">
              Gestão de Sócios, Arenas &amp; Eventos • Kytto Clube
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Mensalidades Recorrentes, Agendamento de Quadras &amp; Torneios
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Cobrança automatizada no cartão de crédito via Stripe/Mercado Pago, reservas com catraca eletrônica e rankings esportivos.
            </p>
          </div>

          <button
            onClick={() => toast.success("Novo sócio cadastrado no clube!")}
            className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Matricular Sócio
          </button>
        </div>

        {/* Lista de Sócios */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--ink)] block">Sócios Ativos &amp; Reservas de Quadra:</span>
          <div className="space-y-2">
            {MEMBROS_CLUBE.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <b className="text-sm text-[var(--ink)]">{m.nome}</b>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                      {m.plano}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                    Reserva: <b>{m.quadrasReservadas}</b> • {m.dependentes} dependentes vinculados
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono-nums font-black text-sm text-[var(--ink)] block">
                    {formatBrl(m.mensalidade)}/mês
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Mensalidade em dia</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
