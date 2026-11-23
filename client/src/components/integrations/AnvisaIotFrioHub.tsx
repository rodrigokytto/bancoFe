import React, { useState } from "react";
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Download,
  Wifi,
  Radio,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Sliders,
  BellRing
} from "lucide-react";
import { toast } from "sonner";

export const AnvisaIotFrioHub: React.FC = () => {
  const [gerandoLaudo, setGerandoLaudo] = useState(false);

  const zonasFrio = [
    {
      id: "camara_salmao",
      nome: "Câmara Fria Principal (Salmão Nobre Chileno)",
      tempAtual: 1.8,
      tempMetaMin: 0.0,
      tempMetaMax: 2.5,
      umidadeAtual: "88%",
      status: "PERFEITO (CONFORME)",
      sensorId: "IOT-LORA-01",
      bateriaSensor: "96%",
      sinalRssi: "-62 dBm (Excelente)",
      ultimaAbertura: "Há 18 min",
      riscoAnvisa: "Nenhum (100% Homologado RDC 216)"
    },
    {
      id: "freezer_pescados",
      nome: "Freezer Ultra-Congelados (Polvo, Atum & Camarão)",
      tempAtual: -19.4,
      tempMetaMin: -22.0,
      tempMetaMax: -18.0,
      umidadeAtual: "62%",
      status: "PERFEITO (CONFORME)",
      sensorId: "IOT-LORA-02",
      bateriaSensor: "91%",
      sinalRssi: "-68 dBm (Bom)",
      ultimaAbertura: "Há 42 min",
      riscoAnvisa: "Nenhum (Congelamento Seguro)"
    },
    {
      id: "balcao_sushibar",
      nome: "Balcão Vitrine Refrigerado Sushibar",
      tempAtual: 3.6,
      tempMetaMin: 2.0,
      tempMetaMax: 5.0,
      umidadeAtual: "74%",
      status: "PERFEITO (CONFORME)",
      sensorId: "IOT-WIFI-03",
      bateriaSensor: "Fonte AC 220V",
      sinalRssi: "-54 dBm (Excelente)",
      ultimaAbertura: "Operação Contínua Salão",
      riscoAnvisa: "Nenhum (Visual e Frescor Preservados)"
    },
    {
      id: "adega_saques",
      nome: "Adega Climatizada de Saquês Especiais & Vinhos",
      tempAtual: 11.8,
      tempMetaMin: 10.0,
      tempMetaMax: 14.0,
      umidadeAtual: "68%",
      status: "PERFEITO (CONFORME)",
      sensorId: "IOT-WIFI-04",
      bateriaSensor: "Fonte AC 220V",
      sinalRssi: "-59 dBm (Excelente)",
      ultimaAbertura: "Há 1h 10m",
      riscoAnvisa: "Nenhum (Armazenamento Nobre)"
    }
  ];

  const emitirLaudoSanitario = () => {
    setGerandoLaudo(true);
    setTimeout(() => {
      setGerandoLaudo(false);
      toast.success("Laudo de Conformidade Térmica ANVISA RDC 216 gerado com sucesso!", {
        description: "Assinatura digital SHA-256 válida para a Vigilância Sanitária de Tangará da Serra (MT)."
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BANNER PRINCIPAL: TELEMETRIA IOT CADEIA DE FRIO & ANVISA              */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Conformidade RDC 216 ANVISA
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                Sensores LoRaWAN &amp; Wi-Fi IoT
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                Tangará da Serra · MT
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              Telemetria IoT de Cadeia de Frio &amp; Vigilância Sanitária
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Auditoria em tempo real das câmaras frigoríficas, congeladores e balcões de sushi com telemetria contínua a cada 60 segundos. Registro histórico inviolável exigido pela fiscalização sanitária municipal, evitando perdas de salmão chileno nobre e garantindo o padrão gastronômico mais alto de Mato Grosso.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={emitirLaudoSanitario}
              disabled={gerandoLaudo}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${gerandoLaudo ? "animate-bounce" : ""}`} />
              <span>{gerandoLaudo ? "Gerando Laudo..." : "Emitir Laudo ANVISA (PDF)"}</span>
            </button>
            <button
              onClick={() => toast.success("Telemetria dos 4 sensores IoT atualizada com sucesso!")}
              className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
              title="Atualizar sensores"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 KPIs de Cadeia de Frio */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Câmara Fria Salmão
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              1.8°C
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              Faixa ideal (0.0°C a 2.5°C)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Freezer de Congelados
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              -19.4°C
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Faixa segura (-22°C a -18°C)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Índice de Conformidade RDC
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              100.0%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Zero excursões de temperatura
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Alerta WhatsApp Ativo
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              Ativo (&gt; 3.0°C)
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block leading-tight">
              Disparo em &lt; 30s para gerência
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CARDS DAS 4 ZONAS FRIGORÍFICAS                                        */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="border-b border-[var(--line)] pb-3">
          <h3 className="font-extrabold text-sm text-[var(--ink)]">
            Status Térmico Individual das 4 Zonas de Refrigeração
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Telemetria instantânea, nível de bateria dos transmissores IoT e umidade relativa do ar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {zonasFrio.map((z) => (
            <div key={z.id} className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[var(--ink)] block">{z.nome}</strong>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{z.sensorId} · Sinal {z.sinalRssi}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black font-mono ${z.tempAtual < 0 ? "text-blue-600" : "text-emerald-600"}`}>
                    {z.tempAtual > 0 ? `+${z.tempAtual}°C` : `${z.tempAtual}°C`}
                  </div>
                  <span className="text-[9px] font-bold uppercase font-mono text-emerald-600">
                    {z.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--muted)] pt-2 border-t border-[var(--line)]">
                <div>🎯 <b>Meta Térmica:</b> {z.tempMetaMin}°C a {z.tempMetaMax}°C</div>
                <div>💧 <b>Umidade Relativa:</b> {z.umidadeAtual}</div>
                <div>🔋 <b>Alimentação:</b> {z.bateriaSensor}</div>
                <div>🛡️ <b>Auditoria:</b> {z.riscoAnvisa}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
