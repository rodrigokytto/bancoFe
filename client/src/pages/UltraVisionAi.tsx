import { useState } from "react";
import {
  Camera,
  Users,
  AlertTriangle,
  Smile,
  Bell,
  Cpu,
  Tv,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Coffee,
  ShoppingBag,
  Sparkles,
  Printer,
  Share2,
  Flame,
  Check,
  Zap,
  Info,
} from "lucide-react";
import {
  CAMERAS_REGISTRY,
  CameraStream,
  MOCK_STAFF_BEHAVIOR,
  MOCK_CLIENT_BEHAVIOR,
  MOCK_VISION_INSIGHTS,
  MOCK_DAILY_REPORT,
  StaffBehaviorReport,
  VisionAiInsight,
} from "@/lib/visionAiData";
import { orderEventBus } from "@/lib/orderEvents";
import { toast } from "sonner";

export function UltraVisionAi() {
  const [selectedCam, setSelectedCam] = useState<CameraStream>(CAMERAS_REGISTRY[0]);
  const [activeTab, setActiveTab] = useState<
    "cams" | "insights" | "clients" | "staff" | "alerts" | "report"
  >("insights");
  const [boundingBoxesEnabled, setBoundingBoxesEnabled] = useState(true);
  const [insights, setInsights] = useState<VisionAiInsight[]>(MOCK_VISION_INSIGHTS);

  // Alertas simulados ativos da IA
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: "alt-1",
      cam: "CAM-01 • Salão Nobre",
      type: "WARNING",
      msg: "Mesa #07: Gesto de mão levantada há 48s aguardando garçom.",
      actionLabel: "Notificar Carlos Mendes (Garçom)",
      actionPayload: "DISPATCH_WAITER_TABLE_07",
      handled: false,
    },
    {
      id: "alt-2",
      cam: "CAM-01 • Salão Nobre",
      type: "OPPORTUNITY",
      msg: "Mesas #02 e #14: Taças e garrafas vazias há mais de 6 min. Potencial de +R$ 180 em refil de drinks/saquê.",
      actionLabel: "Bipar Garçom: Oferecer Bebidas",
      actionPayload: "DISPATCH_WAITER_REFILL_DRINKS",
      handled: false,
    },
    {
      id: "alt-3",
      cam: "CAM-04 • Cozinha Expedição",
      type: "WARNING",
      msg: "Prato Quente (Guioza Suíno Vapor) na bancada há 2m 45s (SLA máx: 3m 00s).",
      actionLabel: "Bipar Garçom Salão",
      actionPayload: "BUZZ_WAITER_EXPEDITION",
      handled: false,
    },
    {
      id: "alt-4",
      cam: "CAM-03 • Sushibar",
      type: "SUCCESS",
      msg: "Conformidade Anvisa 100%: 4 sushimen com toucas e luvas ativas. Salmão refrigerado a 3.2°C.",
      actionLabel: "Registrar Check Anvisa",
      actionPayload: "CONFIRM_ANVISA_CHECK",
      handled: true,
    },
    {
      id: "alt-5",
      cam: "CAM-06 • Boutique Zuma Moda",
      type: "INFO",
      msg: "3 clientes finalizando jantar visitaram a arara de linho. Sugestão: entregar cupom de 15%.",
      actionLabel: "Disparar Cupom 15% na Comanda",
      actionPayload: "PRINT_BOUTIQUE_COUPON_15",
      handled: false,
    },
  ]);

  const handleResolveAlert = (id: string, actionLabel: string, actionPayload: string) => {
    setActiveAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, handled: true } : a))
    );
    toast.success(`Ação executada: ${actionLabel}`, {
      description: "Notificação disparada pelo Zuma Ultra Vision AI.",
    });
    orderEventBus.emit({
      orderId: `VISION-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR"),
      channel: "mesa",
      tableNumber: 7,
      customerName: "Ultra Vision AI",
      items: [
        {
          name: `Ação IA: ${actionLabel} (${actionPayload})`,
          praça: "expedicao",
          prepMinutes: 1,
          price: 0,
          salmonWeightGrams: 0,
        },
      ],
      totalValue: 0,
      status: "novo",
    });
  };

  const handleImplementInsight = (insightId: string) => {
    setInsights(prev =>
      prev.map(ins => (ins.id === insightId ? { ...ins, implemented: true } : ins))
    );
    const target = insights.find(i => i.id === insightId);
    if (target) {
      toast.success(`Insight implementado com sucesso!`, {
        description: `${target.actionLabel} • Impacto estimado: ${target.estimatedFinancialImpact}`,
      });
      orderEventBus.emit({
        orderId: `INSIGHT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        channel: "mesa",
        tableNumber: 1,
        customerName: "Zuma Ultra Vision AI",
        items: [
          {
            name: target.title,
            praça: "expedicao",
            prepMinutes: 1,
            price: 0,
            salmonWeightGrams: 0,
          },
        ],
        totalValue: 0,
        status: "novo",
      });
    }
  };

  const handleSimulateHandRaise = () => {
    toast.warning("IA Detectou: Gesto de Mão Levantada na Mesa #07!", {
      description: "Disparado push para o smartwatch do Garçom Carlos Mendes.",
    });
  };

  const handleSimulateRefill = () => {
    toast.info("IA Detectou: Copos Vazios nas Mesas #02 e #14!", {
      description: "Alerta de oportunidade de refil de bebidas (+R$ 180,00) enviado ao garçom.",
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* CABEÇALHO EXECUTIVO CONTEXTUALIZADO ZUMA ULTRA VISION AI */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-neutral-900 to-zinc-950 border border-neutral-700/60 p-6 sm:p-7 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
                <Cpu className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                ZUMA ULTRA VISION AI • CFTV 4K EM TEMPO REAL
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Tangará da Serra (MT) • Av. Brasil 1605 S
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-neutral-300 text-[11px] font-mono">
                Edge Computing GCP southamerica-east1 (18ms)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Visão Computacional, Comportamento & Insights Estratégicos
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
              6 câmeras 4K integradas mapeando minuto a minuto a jornada dos clientes (gestos, dwell time,
              copos vazios e NPS facial), a conduta dos colaboradores (Anvisa 98.4%, tempos de resposta e EPIs)
              e gerando relatórios com oportunidades financeiras imediatas para o proprietário.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSimulateHandRaise}
              className="px-3.5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simular Mão Levantada (#07)</span>
            </button>
            <button
              onClick={handleSimulateRefill}
              className="px-3.5 py-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>Simular Copos Vazios (#02)</span>
            </button>
            <a
              href="https://github.com/rodrigokytto/ultra"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5 font-mono cursor-pointer"
            >
              <span>GitHub: rodrigokytto/ultra</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 5 CARDS DE MÉTRICAS CONTEXTUALIZADAS (SUBSTITUINDO BARRAS ISOLADAS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          {/* Card 1: Câmeras Online */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono">
              <span>Câmeras 4K</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xl font-black text-cyan-400 mt-1">6 / 6 Operacionais</div>
            <p className="text-[10px] text-neutral-300 font-mono mt-1">Latência média: 34ms • H.265</p>
          </div>

          {/* Card 2: Conformidade Anvisa */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono">
              <span>Conformidade Anvisa</span>
              <span className="text-emerald-400 font-bold">100% EPIs</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">98.4% (HACCP)</div>
            <p className="text-[10px] text-neutral-300 font-mono mt-1">Sushibar: 99% • Salmão a 3.2°C</p>
          </div>

          {/* Card 3: NPS Visual Biométrico */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono">
              <span>NPS Visual Facial</span>
              <Smile className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-xl font-black text-amber-300 mt-1">93.8% Positivo</div>
            <p className="text-[10px] text-neutral-300 font-mono mt-1">204 sorrisos pós-degustação</p>
          </div>

          {/* Card 4: Agilidade Garçom */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono">
              <span>Tempo Resposta Garçom</span>
              <span className="text-cyan-400 font-bold">&lt; 90s meta</span>
            </div>
            <div className="text-xl font-black text-white mt-1">48s Médio</div>
            <p className="text-[10px] text-emerald-400 font-mono mt-1">42s mais rápido que a média</p>
          </div>

          {/* Card 5: Oportunidades Financeiras Detectadas */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-400/40 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-emerald-300 text-[11px] font-mono">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Ganho IA Mapeado
              </span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-300 mt-1">+ R$ 7.490 / noite</div>
            <p className="text-[10px] text-neutral-200 font-mono mt-1">Upsell bebidas & Boutique</p>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO DE ABAS RICAS */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 overflow-x-auto">
        {[
          { id: "insights", label: "💡 Oportunidades & Insights IA (6)", icon: Sparkles },
          { id: "clients", label: "👥 Comportamento dos Clientes & Gestos", icon: Smile },
          { id: "staff", label: "👨‍🍳 Comportamento da Equipe & Anvisa", icon: Users },
          { id: "cams", label: "📹 Grade de Câmeras 4K & Stream", icon: Camera },
          { id: "alerts", label: "⚡ Alertas em Tempo Real (5)", icon: Bell },
          { id: "report", label: "📋 Relatório Executivo & Auditoria", icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: OPORTUNIDADES & INSIGHTS ESTRATÉGICOS DA IA */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Motor Preditivo Ultra Vision AI Ativo
              </div>
              <h3 className="text-lg font-black text-[var(--ink)] mt-2">
                Oportunidades Financeiras & Melhorias Operacionais Detectadas
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-2xl mt-0.5">
                A IA cruza o fluxo visual das câmeras com o PDV e o KDS, detectando mesas aptas para
                reposição de bebidas, sobremesas, compras na Boutique e balanceamento de praças em tempo real.
              </p>
            </div>

            <div className="text-right p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shrink-0">
              <span className="text-[11px] text-emerald-700 font-mono font-bold block">
                Impacto Financeiro Adicional Mapeado Hoje
              </span>
              <span className="text-2xl font-black text-emerald-600">
                + R$ 7.490,00 / noite
              </span>
              <span className="text-[10px] text-emerald-700/80 block mt-0.5 font-mono">
                Equivalente a + R$ 187.250,00 / mês
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(ins => {
              const isOpp = ins.category === "OPPORTUNITY";
              const isBottleneck = ins.category === "BOTTLENECK";
              const isSanitary = ins.category === "SANITARY";

              return (
                <div
                  key={ins.id}
                  className={`p-5 rounded-3xl border transition space-y-4 flex flex-col justify-between ${
                    ins.implemented
                      ? "bg-[var(--surface2)] border-[var(--line)] opacity-70"
                      : isOpp
                      ? "bg-[var(--surface)] border-emerald-500/40 shadow-xs hover:border-emerald-500"
                      : isBottleneck
                      ? "bg-[var(--surface)] border-amber-500/40 shadow-xs hover:border-amber-500"
                      : "bg-[var(--surface)] border-[var(--line)] hover:border-cyan-500/40"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          isOpp
                            ? "bg-emerald-500/15 text-emerald-700"
                            : isBottleneck
                            ? "bg-amber-500/15 text-amber-700"
                            : isSanitary
                            ? "bg-cyan-500/15 text-cyan-700"
                            : "bg-blue-500/15 text-blue-700"
                        }`}
                      >
                        {ins.category === "OPPORTUNITY"
                          ? "💰 OPORTUNIDADE FINANCEIRA"
                          : ins.category === "BOTTLENECK"
                          ? "⚠️ GARGALO OPERACIONAL"
                          : ins.category === "SANITARY"
                          ? "🛡️ ANVISA / HIGIENE"
                          : "📈 MELHORIA DE FLUXO"}
                      </span>

                      {ins.estimatedFinancialImpact && (
                        <span className="text-xs font-black text-emerald-600 font-mono">
                          {ins.estimatedFinancialImpact}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-[var(--ink)] leading-snug">
                      {ins.title}
                    </h4>

                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {ins.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[var(--muted)]">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--surface2)] border border-[var(--line)]">
                        Fonte: {ins.sourceCamera}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--surface2)] border border-[var(--line)]">
                        Alvo: {ins.affectedEntity}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
                    {ins.implemented ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Ação Implementada na Operação
                      </span>
                    ) : (
                      <button
                        onClick={() => handleImplementInsight(ins.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                          isOpp
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : isBottleneck
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-cyan-600 hover:bg-cyan-700 text-white"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{ins.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: COMPORTAMENTO DETALHADO DOS CLIENTES & GESTOS */}
      {activeTab === "clients" && (
        <div className="space-y-6">
          {/* Métricas Principais da Jornada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)] font-medium">Clientes no Salão Hoje</span>
              <div className="text-2xl font-black text-[var(--ink)]">
                {MOCK_CLIENT_BEHAVIOR.totalClientsToday} pessoas
              </div>
              <p className="text-[11px] text-emerald-600 font-mono font-medium">
                Contagem contínua via CAM-01 e CAM-02
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)] font-medium">Dwell Time Médio (Salão)</span>
              <div className="text-2xl font-black text-cyan-600">
                {MOCK_CLIENT_BEHAVIOR.averageMealDurationMinutes} min
              </div>
              <p className="text-[11px] text-[var(--muted)] font-mono">
                Ciclo completo de consumo e permanência
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)] font-medium">NPS Facial (Expressões)</span>
              <div className="text-2xl font-black text-amber-500">
                {MOCK_CLIENT_BEHAVIOR.satisfactionVisualScorePercent}% Positivo
              </div>
              <p className="text-[11px] text-amber-600 font-mono font-medium">
                204 clientes com sorriso detectado
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
              <span className="text-xs text-[var(--muted)] font-medium">Conversão Boutique Moda</span>
              <div className="text-2xl font-black text-emerald-600">
                {MOCK_CLIENT_BEHAVIOR.boutiqueCrossOver.conversionRatePercent}%
              </div>
              <p className="text-[11px] text-emerald-700 font-mono font-medium">
                + R$ 4.410 em compras hoje (18 peças)
              </p>
            </div>
          </div>

          {/* Dwell Time por Área e Gestos ao Vivo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Dwell Time por Área */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-4 shadow-xs">
              <h3 className="font-extrabold text-sm text-[var(--ink)] flex items-center justify-between">
                <span>Dwell Time & Ticket Médio por Ambiente</span>
                <span className="text-xs text-[var(--muted)] font-mono">Tempo Ideal</span>
              </h3>

              <div className="space-y-3">
                {MOCK_CLIENT_BEHAVIOR.dwellByArea.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[var(--ink)]">{area.area}</div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">
                        Ticket Médio: R$ {area.ticketMedio.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-cyan-600 font-mono">
                        {area.avgMinutes} min
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {area.status === "otimo" ? "Excelente Giro" : "Faixa Ideal"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Linguagem Corporal e Gestos Detectados */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-4 shadow-xs">
              <h3 className="font-extrabold text-sm text-[var(--ink)] flex items-center justify-between">
                <span>Linguagem Corporal & Gatilhos no Salão</span>
                <span className="text-xs text-cyan-600 font-mono font-bold">● Telemetria Viva</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-amber-700 font-mono block">Mãos Levantadas</span>
                  <div className="text-xl font-black text-amber-600 mt-0.5">
                    {MOCK_CLIENT_BEHAVIOR.gesturesDetected.handsRaisedToday} hoje
                  </div>
                  <p className="text-[10px] text-amber-700/80 mt-1">Tempo resposta: 48s</p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-700 font-mono block">Copos Vazios Agora</span>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">
                    {MOCK_CLIENT_BEHAVIOR.gesturesDetected.emptyGlassesNow} mesas
                  </div>
                  <p className="text-[10px] text-emerald-700/80 mt-1">Oportunidade refil</p>
                </div>

                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-[10px] text-blue-700 font-mono block">Pratos Finalizados</span>
                  <div className="text-xl font-black text-blue-600 mt-0.5">
                    {MOCK_CLIENT_BEHAVIOR.gesturesDetected.platesFinishedNow} mesas
                  </div>
                  <p className="text-[10px] text-blue-700/80 mt-1">Gatilho de sobremesas</p>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                  <span className="text-[10px] text-purple-700 font-mono block">Hesitação no Cardápio</span>
                  <div className="text-xl font-black text-purple-600 mt-0.5">
                    {MOCK_CLIENT_BEHAVIOR.gesturesDetected.menuHesitationNow} clientes
                  </div>
                  <p className="text-[10px] text-purple-700/80 mt-1">Auxílio do garçom</p>
                </div>
              </div>

              {/* Sentimento Biométrico */}
              <div className="pt-2 border-t border-[var(--line)] space-y-2">
                <span className="text-xs font-bold text-[var(--ink)] block">
                  Distribuição Biometria Facial (NPS Visual):
                </span>
                <div className="w-full bg-[var(--surface2)] rounded-full h-3 overflow-hidden flex">
                  <div
                    style={{ width: `${MOCK_CLIENT_BEHAVIOR.visualEmotions.delightSmilePercent}%` }}
                    className="bg-emerald-500 h-full"
                    title="Sorrisos / Satisfeito"
                  />
                  <div
                    style={{ width: `${MOCK_CLIENT_BEHAVIOR.visualEmotions.neutralConversingPercent}%` }}
                    className="bg-blue-400 h-full"
                    title="Neutro / Conversando"
                  />
                  <div
                    style={{ width: `${MOCK_CLIENT_BEHAVIOR.visualEmotions.hesitationOrDiscomfortPercent}%` }}
                    className="bg-amber-400 h-full"
                    title="Dúvida / Desconforto"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                  <span className="text-emerald-600 font-bold">
                    ● Sorrisos: {MOCK_CLIENT_BEHAVIOR.visualEmotions.delightSmilePercent}%
                  </span>
                  <span className="text-blue-500">
                    ● Neutro: {MOCK_CLIENT_BEHAVIOR.visualEmotions.neutralConversingPercent}%
                  </span>
                  <span className="text-amber-500">
                    ● Atenção: {MOCK_CLIENT_BEHAVIOR.visualEmotions.hesitationOrDiscomfortPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: COMPORTAMENTO DA EQUIPE & ANVISA */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[var(--ink)]">
                  Auditoria de Agilidade, Higiene Anvisa & Proatividade dos Funcionários
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Telemetria contínua sem invasão de privacidade, focada em segurança alimentar (EPIs, troca de bancada e lavagem de mãos) e cordialidade de atendimento.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold font-mono">
                Auditoria Anvisa 100% Homologada
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {MOCK_STAFF_BEHAVIOR.map((emp: StaffBehaviorReport) => (
                <div
                  key={emp.employeeId}
                  className="p-5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--ink)]">{emp.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-500/15 px-2 py-0.5 rounded-full">
                          {emp.role}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] font-mono">
                          {emp.activeSector}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-600">
                        {emp.hygieneComplianceScore}% Higiene Anvisa
                      </div>
                      <div className="text-[10px] text-[var(--muted)] font-mono">
                        Lavagem há {emp.handWashLastMinutes} min
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">{emp.summary}</p>

                  <div className="space-y-1 bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--line)]">
                    <span className="text-[10px] font-mono font-bold text-[var(--ink)] block">
                      Destaques Auditados pela IA:
                    </span>
                    {emp.highlights.map((h, i) => (
                      <div key={i} className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--line)] text-center font-mono text-xs">
                    <div className="p-2 rounded-xl bg-[var(--surface)]">
                      <div className="text-[10px] text-[var(--muted)]">Agilidade</div>
                      <div className="font-black text-[var(--ink)]">{emp.speedScore} / 100</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--surface)]">
                      <div className="text-[10px] text-[var(--muted)]">Tempo Resposta</div>
                      <div className="font-black text-emerald-600">{emp.responsivenessScore} / 100</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--surface)]">
                      <div className="text-[10px] text-[var(--muted)]">Proatividade</div>
                      <div className="font-black text-cyan-600">{emp.proactivityScore} / 100</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: GRADE DE CÂMERAS 4K & STREAM AO VIVO */}
      {activeTab === "cams" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualizador Principal de Vídeo com Bounding Boxes */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative aspect-video rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl flex flex-col justify-between p-4">
                {/* Header da Câmera no Vídeo */}
                <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold text-red-400">REC AO VIVO</span>
                    <span className="text-neutral-400">|</span>
                    <span className="font-bold">{selectedCam.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <span>{selectedCam.resolution}</span>
                    <span>{selectedCam.fps} FPS</span>
                    <span className="text-cyan-400">{selectedCam.latencyMs}ms</span>
                  </div>
                </div>

                {/* Feed Simulado com Bounding Boxes Inteligentes de IA */}
                <div className="relative flex-1 my-3 rounded-2xl overflow-hidden bg-radial from-neutral-900 to-black flex items-center justify-center">
                  {/* Elementos Detectados por IA em Overlay */}
                  {boundingBoxesEnabled && (
                    <div className="absolute inset-0 pointer-events-none p-6">
                      {selectedCam.id === "cam-01-salao" && (
                        <>
                          {/* Box Mesa 07 com Mão Levantada */}
                          <div className="absolute top-12 left-16 border-2 border-amber-400 bg-amber-500/10 rounded-lg p-2 text-[10px] font-mono text-amber-300 animate-pulse">
                            <span className="bg-amber-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                              CLIENTE GESTO
                            </span>
                            Mesa #07 • Mão Levantada (48s)
                          </div>
                          {/* Box Mesa 02 Ocupada e Copo Vazio */}
                          <div className="absolute top-20 right-20 border-2 border-emerald-400 bg-emerald-500/10 rounded-lg p-2 text-[10px] font-mono text-emerald-300">
                            <span className="bg-emerald-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                              UPSELL BEBIDA
                            </span>
                            Mesa #02 • 3 Copos Vazios (Dwell: 38min)
                          </div>
                          {/* Box Garçom em Movimento */}
                          <div className="absolute bottom-16 left-1/3 border-2 border-cyan-400 bg-cyan-500/10 rounded-lg p-2 text-[10px] font-mono text-cyan-300">
                            <span className="bg-cyan-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                              GARÇOM
                            </span>
                            Carlos Mendes • Circulação Salão
                          </div>
                        </>
                      )}

                      {selectedCam.id === "cam-03-sushibar" && (
                        <>
                          <div className="absolute top-10 left-12 border-2 border-emerald-400 bg-emerald-500/10 rounded-lg p-2 text-[10px] font-mono text-emerald-300">
                            <span className="bg-emerald-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                              ANVISA 100%
                            </span>
                            Takeshi Sato • Touca: SIM • Luva: SIM
                          </div>
                          <div className="absolute bottom-14 right-16 border-2 border-cyan-400 bg-cyan-500/10 rounded-lg p-2 text-[10px] font-mono text-cyan-300">
                            <span className="bg-cyan-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                              ESTEIRA CORTE
                            </span>
                            Salmão Chileno • Ritmo: 18 peças/min
                          </div>
                        </>
                      )}

                      {selectedCam.id === "cam-04-cozinha" && (
                        <div className="absolute top-16 right-24 border-2 border-orange-400 bg-orange-500/15 rounded-lg p-2 text-[10px] font-mono text-orange-300 animate-pulse">
                          <span className="bg-orange-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                            EXPEDIÇÃO SLA
                          </span>
                          Guioza Vapor • Espera: 2m 45s (Max: 3m)
                        </div>
                      )}

                      {selectedCam.id === "cam-06-caixa" && (
                        <div className="absolute bottom-12 left-20 border-2 border-purple-400 bg-purple-500/15 rounded-lg p-2 text-[10px] font-mono text-purple-300">
                          <span className="bg-purple-500 text-black font-bold px-1 py-0.5 rounded text-[9px] mr-1">
                            BOUTIQUE TRÁFEGO
                          </span>
                          3 Clientes examinando arara de linho
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fundo representativo da câmera */}
                  <div className="text-center space-y-2 opacity-60">
                    <Tv className="w-12 h-12 mx-auto text-neutral-500" />
                    <p className="text-xs text-neutral-400 font-mono">
                      Stream RTSP 4K H.265/AV1 Ativo • Ingestão Google Cloud Edge
                    </p>
                  </div>
                </div>

                {/* Controles da Câmera Inferior */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs text-white bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBoundingBoxesEnabled(!boundingBoxesEnabled)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                        boundingBoxesEnabled
                          ? "bg-cyan-500 text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {boundingBoxesEnabled ? "👁️ Bounding Boxes: LIGADO" : "👁️ Bounding Boxes: DESLIGADO"}
                    </button>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Modelos: {selectedCam.modelsActive.join(" • ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-400">Pessoas: {selectedCam.metrics.peopleDetected}</span>
                    {selectedCam.metrics.tablesOccupied && (
                      <span className="text-cyan-400">Mesas: {selectedCam.metrics.tablesOccupied}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card de Detalhes da Câmera Ativa */}
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-[var(--ink)]">{selectedCam.name}</h4>
                  <p className="text-[var(--muted)]">{selectedCam.location}</p>
                </div>
                {selectedCam.lastAlert && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{selectedCam.lastAlert.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lista Seletora das 6 Câmeras */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center justify-between">
                <span>Câmeras do Restaurante (6)</span>
                <span className="text-xs text-emerald-600 font-mono font-normal">● Todas Online</span>
              </h3>

              <div className="space-y-2">
                {CAMERAS_REGISTRY.map((cam: CameraStream) => {
                  const isSelected = selectedCam.id === cam.id;
                  return (
                    <div
                      key={cam.id}
                      onClick={() => setSelectedCam(cam)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/10 shadow-md"
                          : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="text-[var(--ink)]">{cam.name}</span>
                        <span className="text-[10px] font-mono text-cyan-700 bg-cyan-500/15 px-2 py-0.5 rounded-full">
                          {cam.latencyMs}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mt-1">{cam.location}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--line)] text-[10px] font-mono text-[var(--muted)]">
                        <span>👥 {cam.metrics.peopleDetected} pessoas</span>
                        {cam.metrics.hygieneScorePercent && (
                          <span className="text-emerald-600">🛡️ {cam.metrics.hygieneScorePercent}% Anvisa</span>
                        )}
                        {cam.metrics.emptyGlassesDetected !== undefined && (
                          <span className="text-amber-600">🍺 {cam.metrics.emptyGlassesDetected} copos vazios</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: ALERTAS EM TEMPO REAL */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-[var(--ink)]">
              Centro de Alertas Preditivos & Gatilhos de Ação Imediata
            </h3>

            <div className="space-y-3">
              {activeAlerts.map(alt => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alt.handled
                      ? "bg-[var(--surface2)] border-[var(--line)] opacity-60"
                      : alt.type === "WARNING"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : alt.type === "OPPORTUNITY"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-cyan-500/10 border-cyan-500/30"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--ink)]">
                        {alt.cam}
                      </span>
                      {alt.handled && (
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Resolvido</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[var(--ink)]">{alt.msg}</p>
                  </div>

                  {!alt.handled && (
                    <button
                      onClick={() => handleResolveAlert(alt.id, alt.actionLabel, alt.actionPayload)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
                    >
                      {alt.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: RELATÓRIO EXECUTIVO & AUDITORIA ANVISA (REPORT) */}
      {activeTab === "report" && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Header do Relatório */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                  DOCUMENTO EXECUTIVO OFICIAL • ULTRA VISION AI
                </span>
                <h3 className="text-xl font-black text-[var(--ink)] mt-2">
                  Relatório Diário de Auditoria Visual & Inteligência Comportamental
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Unidade: {MOCK_DAILY_REPORT.unit} • {MOCK_DAILY_REPORT.shift}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Relatório</span>
                </button>
                <a
                  href="/docs/RELATORIO_EXECUTIVO_HOMOLOGACAO_PRD.pdf"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition no-underline cursor-pointer"
                >
                  <span>Baixar PDF Completo</span>
                </a>
              </div>
            </div>

            {/* Resumo Executivo da IA */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
              <span className="text-xs font-bold text-cyan-800 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Síntese Executiva Gerada pelo Motor Ultra Vision AI:
              </span>
              <p className="text-xs text-[var(--ink)] leading-relaxed">
                {MOCK_DAILY_REPORT.aiExecutiveSummary}
              </p>
            </div>

            {/* Checklist de Auditoria Anvisa / HACCP */}
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-[var(--ink)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Auditoria Contínua Anvisa & Boas Práticas (Checklist de 6 Pontos)</span>
              </h4>

              <div className="space-y-2">
                {MOCK_DAILY_REPORT.anvisaAuditingChecklist.map((chk, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[var(--ink)]">{chk.item}</div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">
                        Evidência CFTV: {chk.evidence}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] self-start sm:self-auto ${
                        chk.status === "CONFORME"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}
                    >
                      {chk.status === "CONFORME" ? "✓ CONFORME ANVISA" : "⚠️ ATENÇÃO OPERACIONAL"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assinatura do Proprietário */}
            <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[var(--muted)]">
              <div>
                <p>Auditoria automatizada por Edge AI no Zuma Tangará da Serra (MT).</p>
                <p>Armazenamento criptografado em conformidade com a LGPD e Anvisa.</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[var(--ink)] block">
                  Rodrigo Ribeiro Gonçalves
                </span>
                <span>Proprietário & Administrador Geral</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
