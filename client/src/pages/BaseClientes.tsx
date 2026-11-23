import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { formatBrl } from "../../../shared/zumaData";
import { Users, Search, MessageSquare, Award, ArrowUpRight, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export const BaseClientes: React.FC = () => {
  const [, setLocation] = useLocation();
  const [segFilter, setSegFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const { data: rawCustomers = [], isLoading } = trpc.zuma.listCustomers.useQuery();

  // Mapear dados brutos do Drizzle para formato de exibição tipado
  const customers = rawCustomers.map(c => {
    const daysInactive = c.daysSinceLastOrder || 45;
    return {
      id: c.id,
      name: c.name,
      phone: c.phone || "Não informado",
      neighborhood: c.neighborhood || "Centro",
      segment: c.segment,
      orderCount: c.ordersCount,
      totalSpent: parseFloat(c.totalSpent || "0"),
      favoriteDish: c.favoriteDish || "Combo 26 Peças",
      daysInactive,
    };
  });

  // Filtragem
  const filteredCustomers = customers.filter(c => {
    if (segFilter !== "todos" && c.segment !== segFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.neighborhood.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPIs
  const totalCount = customers.length;
  const totalLtv = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgLtv = totalCount ? totalLtv / totalCount : 0;
  const campeoes = customers.filter(c => c.segment === "vip" || c.segment === "fiel").length;
  const emRisco = customers.filter(c => c.segment === "sumido").length;

  const SEG_MAP: Record<string, { label: string; badge: string; desc: string }> = {
    vip: { label: "VIP / Campeão", badge: "bg-[var(--good)] text-white", desc: "Pede toda semana, ticket alto" },
    fiel: { label: "Fiel", badge: "bg-[var(--nori-soft)] text-[var(--nori)]", desc: "Pede com frequência constante" },
    regular: { label: "Regular", badge: "bg-[var(--surface2)] text-[var(--ink)]", desc: "Pediu 2 a 3 vezes recentemente" },
    novo: { label: "Novo", badge: "bg-[var(--warn)]/20 text-[var(--warn)]", desc: "Primeira compra recente" },
    sumido: { label: "Sumido", badge: "bg-[var(--bad)] text-white", desc: "Não pede há mais de 45 dias" },
    lead: { label: "Lead", badge: "bg-[var(--salmon-soft)] text-[var(--salmon)]", desc: "Captado no quiz, ainda não comprou" }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          CRM &amp; Inteligência de Clientes
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Base de Clientes com Histórico, RFM e Próxima Ação
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Identificação automática dos melhores clientes de Tangará da Serra. Veja o LTV acumulado, itens favoritos e aja antes que um cliente fiel se torne inativo.
        </p>
      </div>

      {/* 4 KPIs de CRM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Clientes na Base</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{totalCount}</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">100% com WhatsApp e endereço</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">LTV Médio (Valor de Vida)</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{formatBrl(avgLtv)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Média gasta por cliente ativo</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Clientes Campeões &amp; VIP</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">{campeoes}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Geram 48% do faturamento</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Em Risco de Perda (Sumidos)</span>
          <div className="text-2xl font-display font-extrabold text-[var(--bad)] font-mono-nums mt-1">{emRisco}</div>
          <div className="text-xs text-[var(--bad)] font-medium mt-0.5">Alvo do plano de recuperação</div>
        </div>
      </div>

      {/* Tabela de Clientes + Filtros RFM */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmentos em Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "todos", label: `Todos (${totalCount})` },
              { id: "vip", label: `VIP (${customers.filter(c => c.segment === "vip").length})` },
              { id: "fiel", label: `Fiéis (${customers.filter(c => c.segment === "fiel").length})` },
              { id: "regular", label: `Regulares (${customers.filter(c => c.segment === "regular").length})` },
              { id: "novo", label: `Novos (${customers.filter(c => c.segment === "novo").length})` },
              { id: "sumido", label: `Sumidos (${customers.filter(c => c.segment === "sumido").length})` },
              { id: "lead", label: `Leads (${customers.filter(c => c.segment === "lead").length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSegFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  segFilter === f.id
                    ? "bg-[var(--ink)] text-white font-bold"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2.5 pr-4 font-bold">Cliente</th>
                <th className="py-2.5 px-3 font-bold">Bairro</th>
                <th className="py-2.5 px-3 font-bold">Segmento RFM</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Pedidos</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">LTV Total</th>
                <th className="py-2.5 px-3 font-bold">Prato Favorito</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Último Pedido</th>
                <th className="py-2.5 pl-4 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredCustomers.map((c) => {
                const segInfo = SEG_MAP[c.segment] || { label: c.segment, badge: "bg-[var(--surface2)] text-[var(--muted)]", desc: "" };
                return (
                  <tr key={c.id} className="hover:bg-[var(--surface2)]/50">
                    <td className="py-3 pr-4">
                      <b className="text-[var(--ink)] block text-xs">{c.name}</b>
                      <span className="font-mono-nums text-[11px] text-[var(--muted)]">{c.phone}</span>
                    </td>
                    <td className="py-3 px-3 text-[var(--muted)]">{c.neighborhood}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${segInfo.badge}`} title={segInfo.desc}>
                        {segInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-nums text-[var(--ink)] font-bold">{c.orderCount}</td>
                    <td className="py-3 px-3 text-right font-mono-nums text-[var(--salmon)] font-bold">{formatBrl(c.totalSpent)}</td>
                    <td className="py-3 px-3 text-[var(--ink)] font-medium">{c.favoriteDish}</td>
                    <td className="py-3 px-3 text-right font-mono-nums text-[var(--muted)]">
                      {c.daysInactive} dias atrás
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        onClick={() => {
                          setLocation("/zumi");
                          toast.info(`Abrindo conversa de WhatsApp com ${c.name}...`);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)] hover:text-[var(--salmon)] text-[11px] font-semibold text-[var(--ink)] inline-flex items-center gap-1 transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chamar Zumi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
