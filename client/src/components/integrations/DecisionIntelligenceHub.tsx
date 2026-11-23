import React, { useState } from "react";
import {
  BrainCircuit,
  CloudRain,
  Coins,
  Scale,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Zap,
  ShieldAlert,
  Target,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";

export const DecisionIntelligenceHub: React.FC = () => {
  const [executingId, setExecutingId] = useState<string | null>(null);

  const query = trpc.zuma.getDecisionHubData.useQuery(undefined, {
    refetchInterval: 6000,
  });

  const actionMutation = trpc.zuma.executeDecisionAction.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setExecutingId(null);
      query.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao executar ação: ${err.message}`);
      setExecutingId(null);
    }
  });

  const insights = query.data || [];

  const handleExecute = (actionId: string) => {
    setExecutingId(actionId);
    actionMutation.mutate({ actionId, operator: "Rodrigo (Dono)" });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "CLIMA_LOGISTICA":
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case "AGRO_DEMANDA":
        return <Coins className="w-5 h-5 text-amber-400" />;
      case "TEF_FINANCAS":
        return <Scale className="w-5 h-5 text-emerald-400" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-red-400" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    if (p === "CRITICA") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          PRIORIDADE CRÍTICA
        </span>
      );
    }
    if (p === "ALTA") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          PRIORIDADE ALTA
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        OPERAÇÃO CONTÍNUA
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER EXECUTIVO */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-red-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-white/20">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Central de Tomada de Decisão & Inteligência Analítica 360°
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cruzamento Multissetorial Ativo
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Motor de correlação que cruza Clima (INMET), Liquidez Bancária do Agronegócio MT (Sicredi/Sicoob), TEF, Estoque de Salmão e Demanda de KDS para recomendar decisões imediatas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
              Recalcular Insights
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Fontes Cruzadas em Tempo Real</div>
            <div className="text-lg font-bold text-white">4 Ecossistemas</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Google + Bancos + Git/MCP + PDV</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Ações Recomendadas</div>
            <div className="text-lg font-bold text-amber-300">{insights.length} Oportunidades</div>
            <div className="text-[11px] text-amber-400 mt-0.5">Priorizadas por Impacto</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Impacto Financeiro Estimado</div>
            <div className="text-lg font-bold text-emerald-400">+R$ 4.390,00</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Faturamento & Economia no Turno</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Proteção contra Ruptura</div>
            <div className="text-lg font-bold text-cyan-300">100% Blindado</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Salmão & Atum em Estoque</div>
          </div>
        </div>
      </div>

      {/* LISTA DE AÇÕES ESTRATÉGICAS PRIORIZADAS */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          Ações Recomendadas para Execução Imediata
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg transition ${
                item.executada
                  ? "border-emerald-500/40 bg-emerald-950/10"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {getCategoryIcon(item.categoria)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{item.titulo}</h4>
                      {getPriorityBadge(item.prioridade)}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-slate-400">Fontes Cruzadas:</span>
                      {item.cruzamentoFontes.map((f, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-emerald-400">{item.impactoEsperado}</div>
                    <div className="text-[10px] text-slate-500">Impacto Estimado</div>
                  </div>

                  {item.executada ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Ação Aplicada com Sucesso
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecute(item.id)}
                      disabled={executingId === item.id}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/25 flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Executar Ação Estratégica
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-2">
                {item.descricao}
              </p>

              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Recomendação Operacional: {item.acaoRecomendada}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIAGRAMA DO FLUXO DECISÓRIO DE DADOS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-200 text-sm mb-2 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-amber-400" />
          Como o Zuma Processa e Cruza Dados para Tomada de Decisão:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-blue-400 block mb-1">1. Ingestão Contínua</span>
            Captura de telemetria externa: radar de chuva INMET, trânsito Google Maps, cotação Dólar PTAX BACEN e liquidação agro Sicredi.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-purple-400 block mb-1">2. Auditoria Interna</span>
            Confronto D+0 entre faturamento do PDV, taxas de TEF/adquirentes, estoque de salmão na câmara fria e ocupação das 27 mesas físicas.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">3. Raciocínio Zumi IA</span>
            Identificação de gargalos, riscos de ruptura de pescados ou oportunidades de vendas em horários de chuva/ociosidade.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">4. Execução 1-Click</span>
            Disparo de comandos operacionais: transbordo de motoboys, compra de insumos, auto-pausa no iFood e bloqueio de taxas abusivas.
          </div>
        </div>
      </div>
    </div>
  );
};
