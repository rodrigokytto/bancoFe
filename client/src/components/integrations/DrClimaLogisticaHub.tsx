import React, { useState } from "react";
import {
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Radio,
  Flame
} from "lucide-react";
import { toast } from "sonner";

export const DrClimaLogisticaHub: React.FC = () => {
  const [planoChuvaAtivo, setPlanoChuvaAtivo] = useState(true);
  const [probabilidadeChuva, setProbabilidadeChuva] = useState(16);
  const [temperaturaAtual, setTemperaturaAtual] = useState(30.5);

  const motoboys = [
    { id: "moto_01", nome: "Lucas Silveira", placa: "QBZ-8142", modelo: "Honda CG 160 Cargo", bau: "Baú Estanque Isotérmico Vedado", status: "Em Rota (Jd. Europa)", tempoMedioMin: 26, entregasHoje: 14, pontualidade: "98.5%" },
    { id: "moto_02", nome: "Gabriel Mendes", placa: "RAX-3019", modelo: "Yamaha Factor 150", bau: "Baú Estanque Isotérmico Vedado", status: "Aguardando no Balcão", tempoMedioMin: 28, entregasHoje: 12, pontualidade: "100.0%" },
    { id: "moto_03", nome: "Rafael Costa", placa: "JZX-4421", modelo: "Honda Biz 125", bau: "Baú Isotérmico Vedado", status: "Em Rota (Centro)", tempoMedioMin: 22, entregasHoje: 16, pontualidade: "99.0%" },
    { id: "moto_04", nome: "Matheus Oliveira", placa: "QBE-9011", modelo: "Honda CG 160 Fan", bau: "Baú Estanque Isotérmico Vedado", status: "Em Rota (Cidade Alta)", tempoMedioMin: 31, entregasHoje: 11, pontualidade: "97.2%" },
    { id: "moto_05", nome: "Diego Ferreira", placa: "NIZ-7720", modelo: "Yamaha Fazer 250", bau: "Baú Estanque Isotérmico Vedado", status: "Aguardando no Balcão", tempoMedioMin: 25, entregasHoje: 9, pontualidade: "100.0%" },
    { id: "moto_06", nome: "Vitor Hugo", placa: "RTY-1922", modelo: "Honda CG 160 Cargo", bau: "Reserva Chuva Forte", status: "Disponível (Base)", tempoMedioMin: 29, entregasHoje: 8, pontualidade: "98.0%" }
  ];

  const alternarPlanoChuva = () => {
    setPlanoChuvaAtivo(!planoChuvaAtivo);
    if (!planoChuvaAtivo) {
      toast.success("Plano Chuva Ativado! Roteirização Segura Chuva acionada e tempo no KDS reduzido para 20 min.");
    } else {
      toast.info("Plano Chuva Desativado. Operação retornou aos parâmetros de tempo seco.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BANNER PRINCIPAL DE METEOROLOGIA & LOGÍSTICA                         */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                Radar Meteorológico Tangará da Serra
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Frota Própria (6 Motoboys Ativos)
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                {temperaturaAtual}°C · {probabilidadeChuva}% Prob. Chuva
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              Dr. Clima, Frota Própria GPS &amp; Despacho de Chuva Inteligente
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Integração com estações meteorológicas em tempo real de Tangará da Serra e geolocalização da frota própria com baús estanques. Quando a chuva se aproxima, o sistema ativa automaticamente o <b>Plano Chuva (+82% de demanda prevista no delivery)</b>, com desvio de vias de terra e garantia de entrega em menos de 35 minutos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={alternarPlanoChuva}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                planoChuvaAtivo
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                  : "bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{planoChuvaAtivo ? "Plano Chuva Ativo (Desvio ON)" : "Ativar Plano Chuva"}</span>
            </button>
            <button
              onClick={() => toast.success("Estação meteorológica e GPS dos motoboys sincronizados!")}
              className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
              title="Atualizar telemetria"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 KPIs de Logística & Meteorologia */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Tempo Médio de Entrega
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              28 min
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              Meta garantida &lt; 35 min
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Demanda Estimada na Chuva
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              +82%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Previsão de 92 pedidos no delivery
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Pontualidade da Frota
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              98.8%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              70 entregas concluídas hoje
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Baús Estanques Vedados
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              6 / 6
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              100% à prova d&#39;água e calor térmico
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* GESTÃO EM TEMPO REAL DA FROTA PRÓPRIA                                 */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="border-b border-[var(--line)] pb-3">
          <h3 className="font-extrabold text-sm text-[var(--ink)]">
            Status da Frota Dedicada de Entregadores em Tangará da Serra
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Acompanhamento por telemetria GPS, modelo de veículo, tipo de baú e índice de pontualidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {motoboys.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[var(--ink)] block">{m.nome}</strong>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{m.modelo} · {m.placa}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono ${
                  m.status.includes("Rota") ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                }`}>
                  {m.status}
                </span>
              </div>
              <div className="text-[10px] text-[var(--muted)] space-y-0.5 pt-1 border-t border-[var(--line)]">
                <div>📦 <b>Baú:</b> {m.bau}</div>
                <div>⏱️ <b>Tempo Médio:</b> {m.tempoMedioMin} min · <b>Pontualidade:</b> {m.pontualidade}</div>
                <div>🚴 <b>Entregas Hoje:</b> {m.entregasHoje} entregas concluídas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
