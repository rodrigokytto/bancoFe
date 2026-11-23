import React, { useState } from "react";
import { Truck, Scale, ShieldCheck, Activity, MapPin, CheckCircle2, Clock, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

const BETONEIRAS_FROTA = [
  { id: "BTN-01", motorista: "Sebastião Nogueira", traço: "FCK 30 MPa (Brita 1)", capacidadeM3: 8.0, volumeCarregado: 8.0, destino: "Condomínio Manauara • Bloco C", status: "em_transito", tempoRestanteMin: 18, gps: "Av. Inácio de Castro, Tangará" },
  { id: "BTN-02", motorista: "Valdemir Lima", traço: "FCK 25 MPa Piso Polido", capacidadeM3: 8.0, volumeCarregado: 7.5, destino: "Armazém Grãos Sul", status: "descarregando", tempoRestanteMin: 40, gps: "Distrito Industrial" },
  { id: "BTN-03", motorista: "Cleber Marcondes", traço: "FCK 35 MPa Estrutural", capacidadeM3: 10.0, volumeCarregado: 0.0, destino: "Usina Central Serrano", status: "carregando", tempoRestanteMin: 8, gps: "Pátio Silo Central" },
];

export const ErpConcretoSubsuite: React.FC = () => {
  const [frotas] = useState(BETONEIRAS_FROTA);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-500/10 px-2.5 py-0.5 rounded-md">
              Indústria de Base &amp; Concreto • Serrano Concreto / Kytto Holding
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Rastreamento de Betoneiras GPS, Traço de Concreto &amp; Balança Rodoviária
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Controle de frotas pesadas, ensaios de rompimento NBR 5739, pesagem automatizada de agregados e despacho de concreto usinado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" /> Balança Rodoviária 80t Calibrada (INMETRO)
            </span>
          </div>
        </div>

        {/* 3 KPIs da Usina */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Concreto Expedido Hoje</span>
            <div className="text-2xl font-black font-mono-nums text-[var(--ink)]">
              184.5 m³
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">24 viagens de betoneira</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Resistência Média Ensaios</span>
            <div className="text-2xl font-black font-mono-nums text-blue-600">
              34.8 MPa
            </div>
            <span className="text-[10px] text-[var(--muted)]">100% de conformidade NBR 5739</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Cimento CP-II em Silo</span>
            <div className="text-2xl font-black font-mono-nums text-amber-600">
              68.2 Toneladas
            </div>
            <span className="text-[10px] text-amber-600 font-bold">Autonomia para 3 dias de usinagem</span>
          </div>
        </div>

        {/* Lista de Frotas de Betoneiras ao Vivo */}
        <div className="space-y-2 pt-2 border-t border-[var(--line)]">
          <span className="text-xs font-bold text-[var(--ink)] block">
            Monitoramento de Frotas de Betoneiras em Tempo Real (GPS):
          </span>

          <div className="space-y-2">
            {frotas.map((btn) => (
              <div
                key={btn.id}
                className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <b className="text-sm text-[var(--salmon)] font-mono">{btn.id}</b>
                    <span className="font-bold text-[var(--ink)]">{btn.motorista}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                      btn.status === "em_transito" ? "bg-blue-600" : btn.status === "descarregando" ? "bg-emerald-600" : "bg-amber-600"
                    }`}>
                      {btn.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] block">
                    Traço: <b>{btn.traço}</b> • Volume: <b>{btn.volumeCarregado} m³</b>
                  </span>
                  <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--salmon)]" /> {btn.gps} &gt; {btn.destino}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono-nums font-bold text-[var(--ink)] block">
                    Chegada em ~{btn.tempoRestanteMin} min
                  </span>
                  <button
                    onClick={() => toast.success(`Telemetria da betoneira ${btn.id} sincronizada!`)}
                    className="text-[10px] font-bold text-[var(--salmon)] hover:underline mt-1"
                  >
                    Ver Telemetria Completa &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
