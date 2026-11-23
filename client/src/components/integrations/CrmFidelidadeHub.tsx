import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  Gift,
  Coins,
  TrendingUp,
  Target,
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Crown,
  Scale
} from "lucide-react";
import { toast } from "sonner";

export const CrmFidelidadeHub: React.FC = () => {
  const [disparandoReativacao, setDisparandoReativacao] = useState(false);

  const segmentosRfv = [
    {
      categoria: "VIPs Ouro (Campeões)",
      clientesQtd: 1240,
      percentualBase: "6.7%",
      ticketMedio: "R$ 285,00",
      frequenciaMes: "3.8x",
      ltvAnual: "R$ 3.820,00",
      estrategia: "Experiência de Tatame VIP, degustação antecipada de pratos autorais e cashback de 8%",
      corBadge: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    {
      categoria: "Clientes Leais (Prata)",
      clientesQtd: 3820,
      percentualBase: "20.7%",
      ticketMedio: "R$ 168,00",
      frequenciaMes: "2.1x",
      ltvAnual: "R$ 1.940,00",
      estrategia: "Cashback cruzado para a Loja de Roupas & Boutique e combo exclusivo para casais",
      corBadge: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    {
      categoria: "Em Risco de Churn (21-45 dias sem pedir)",
      clientesQtd: 1480,
      percentualBase: "8.0%",
      ticketMedio: "R$ 142,00",
      frequenciaMes: "0.2x",
      ltvAnual: "R$ 1.120,00",
      estrategia: "Disparo automático no WhatsApp com IA Zumi oferecendo sobremesa cortesia ou R$ 25 OFF",
      corBadge: "bg-orange-500/10 text-orange-600 border-orange-500/20"
    },
    {
      categoria: "Clientes Inativos (> 45 dias)",
      clientesQtd: 2150,
      percentualBase: "11.6%",
      ticketMedio: "R$ 98,00",
      frequenciaMes: "0.0x",
      ltvAnual: "R$ 480,00",
      estrategia: "Pesquisa de satisfação humanizada no WhatsApp para entender motivo do sumiço e reengajamento",
      corBadge: "bg-red-500/10 text-red-600 border-red-500/20"
    }
  ];

  const executarReativacaoLote = () => {
    setDisparandoReativacao(true);
    setTimeout(() => {
      setDisparandoReativacao(false);
      toast.success("Disparo de Reativação enviado via WhatsApp Cloud API para 1.480 clientes em risco com taxa esperada de 24% de recompra!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BANNER PRINCIPAL DE CRM, RETENÇÃO & FIDELIDADE                        */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Clube Zumi Fidelidade &amp; RFV
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                18.450 Clientes Cadastrados
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                Tangará da Serra · MT
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              CRM RFV, Clube de Fidelidade &amp; Motor de Reativação WhatsApp IA
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Segmentação preditiva por Recência, Frequência e Valor (RFV). Automação de mensagens humanizadas via WhatsApp Business API com IA Zumi, programa de cashback unificado da Holding (Gastronomia ⇄ Loja de Roupas) e controle rígido de taxa de churn (4.2% ao mês).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={executarReativacaoLote}
              disabled={disparandoReativacao}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${disparandoReativacao ? "animate-pulse" : ""}`} />
              <span>{disparandoReativacao ? "Disparando Mensagens..." : "Reativar 1.480 em Risco"}</span>
            </button>
            <button
              onClick={() => toast.success("Base de clientes e pontuações de cashback sincronizadas!")}
              className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
              title="Sincronizar base CRM"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 KPIs Estruturais de Retenção e Fidelidade */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Base Unificada de Clientes
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              18.450
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block leading-tight">
              42% compram em 2+ lojas da holding
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Taxa de Churn Mensal
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              4.2%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Benchmark excelente (&lt; 5.0% no setor)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Taxa de Sucesso de Reativação
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              24.8%
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              Retorno no cardápio em até 7 dias
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Saldo de Cashback em Circulação
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-500">
              R$ 38.410,00
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Gera R$ 480k em faturamento cruzado
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MATRIZ RFV EM TEMPO REAL                                             */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="border-b border-[var(--line)] pb-3">
          <h3 className="font-extrabold text-sm text-[var(--ink)]">
            Matriz RFV: Segmentação da Base de Clientes de Tangará da Serra
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Estratégias sob medida para retenção de clientes de alto valor e resgate de clientes em risco
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {segmentosRfv.map((s, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[var(--ink)] block">{s.categoria}</strong>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{s.clientesQtd} clientes ({s.percentualBase} da base)</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[var(--ink)]">Ticket: {s.ticketMedio}</div>
                  <span className="text-[10px] text-purple-600 font-mono block">LTV: {s.ltvAnual}</span>
                </div>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-1 border-t border-[var(--line)]">
                🎯 <b>Estratégia Recomendada:</b> {s.estrategia}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
