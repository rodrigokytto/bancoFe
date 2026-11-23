import React, { useState } from "react";
import { 
  Globe, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Zap, 
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl, TANGARA_ZONAS_LOGISTICA } from "../../../../shared/zumaData";

export const OpenDeliveryHub: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState("Aiqfome Tangará");
  const [simDish, setSimDish] = useState("Uramaki Especial Salmão Trufado (16un)");
  const [simCustomer, setSimCustomer] = useState("Camila Brandão");
  const [simTotal] = useState(58.9);

  // Queries tRPC
  const metricsQuery = trpc.zuma.getOmnichannelDeliveryMetrics.useQuery(undefined, { refetchInterval: 4000 });
  const motoboysQuery = trpc.zuma.listMotoboys.useQuery();

  // Mutation tRPC
  const simulateOpenDeliveryMutation = trpc.zuma.simulateOpenDeliveryOrder.useMutation({
    onSuccess: () => {
      toast.success(`Pedido Open Delivery (${selectedChannel}) injetado com sucesso no KDS!`);
      metricsQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao injetar pedido: ${err.message}`)
  });

  const metrics = metricsQuery.data || {
    channels: [
      { name: "iFood Merchant API v2", ordersCount: 14, revenue: 1420.0, feePercent: 23, status: "ONLINE", latency: "38ms" },
      { name: "WhatsApp Direto (WAHA + Zumi)", ordersCount: 22, revenue: 2380.0, feePercent: 0, status: "ONLINE", latency: "14ms" },
      { name: "Keeto POS & Mesas Salão", ordersCount: 18, revenue: 2190.0, feePercent: 0, status: "ONLINE", latency: "22ms" },
      { name: "Open Delivery (Aiqfome/99Food)", ordersCount: 8, revenue: 760.0, feePercent: 18, status: "ONLINE", latency: "27ms" },
    ],
    totalOrders: 62,
    totalRevenue: 6750.0,
    estimatedIfoodFeeSaved: 547.40,
    directSalesSharePercent: 67.7,
    motoboysFleet: [] as any[],
  };

  const motoboys = motoboysQuery.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==============================================================================
          CABECALHO OPEN DELIVERY HUB & PADRAO ABRASEL
      ============================================================================== */}
      <div className="bg-[var(--surface)] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <Globe className="w-3.5 h-3.5" /> Padrão Open Delivery v1.0 (Abrasel / ABNT)
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-3xl shadow-md border-2 border-white/20 shrink-0">
              OD
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-display font-extrabold text-[var(--ink)]">
                  Hub Omnichannel &amp; Open Delivery Brasil
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Compatível Aiqfome · 99Food · Delivery Direto
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Arquitetura unificada para receber pedidos de qualquer marketplace via contrato padrão Abrasel, roteando automaticamente para a cozinha Zuma e frota de Tangará.
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl p-3 text-center sm:text-right">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Economia em Taxas de Marketplace</span>
            <span className="text-lg font-black text-emerald-600 block mt-0.5">
              +{formatBrl(metrics.estimatedIfoodFeeSaved)} / mês
            </span>
            <span className="text-[10px] text-[var(--muted)] block">
              {metrics.directSalesSharePercent}% das vendas em canais 0% comissão
            </span>
          </div>
        </div>

        {/* COMPARATIVO DE PERFORMANCE POR CANAL DE DELIVERY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--line)]">
          {metrics.channels.map((channel: any) => (
            <div key={channel.name} className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ink)] truncate max-w-[150px]">{channel.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                  channel.feePercent === 0 
                    ? "bg-emerald-500/15 text-emerald-600" 
                    : "bg-red-500/15 text-red-600"
                }`}>
                  {channel.feePercent === 0 ? "0% Taxa" : `-${channel.feePercent}%`}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-base font-extrabold text-[var(--ink)]">
                  {formatBrl(channel.revenue)}
                </span>
                <span className="text-xs text-[var(--muted)]">{channel.ordersCount} pedidos</span>
              </div>

              <div className="flex justify-between text-[10px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                <span>Status: <strong className="text-emerald-600">{channel.status}</strong></span>
                <span>Latência: {channel.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==============================================================================
          SIMULADOR OPEN DELIVERY (INJETAR PEDIDO AIQFOME / 99FOOD)
      ============================================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Injetor &amp; Homologador Open Delivery (Sandbox)
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Simule a chegada de um pedido vindo de plataformas Open Delivery para testar a impressão, esteira KDS e despacho.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
            Endpoint: /api/webhooks/open-delivery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--ink)]">Canal de Origem:</label>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
            >
              <option value="Aiqfome Tangará">Aiqfome Tangará da Serra</option>
              <option value="99Food">99Food Mato Grosso</option>
              <option value="Delivery Direto">Delivery Direto (Web)</option>
              <option value="Anota AI">Anota AI Cardápio Digital</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--ink)]">Cliente:</label>
            <input
              type="text"
              value={simCustomer}
              onChange={e => setSimCustomer(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--ink)]">Prato / Item:</label>
            <input
              type="text"
              value={simDish}
              onChange={e => setSimDish(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={() => simulateOpenDeliveryMutation.mutate({
                channel: selectedChannel,
                customerName: simCustomer,
                dishName: simDish,
                total: simTotal
              })}
              disabled={simulateOpenDeliveryMutation.isPending}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              Injetar Pedido ({formatBrl(simTotal)})
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          MATRIZ DE ZONAS LOGISTICAS DE TANGARA DA SERRA & FROTA DE MOTOBOYS
      ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ZONAS DE TANGARA */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Tabela de Taxas Logísticas por Bairro (Tangará da Serra)
            </h4>
            <span className="text-xs text-[var(--muted)]">{TANGARA_ZONAS_LOGISTICA.length} Zonas Mapeadas</span>
          </div>

          <div className="space-y-2">
            {TANGARA_ZONAS_LOGISTICA.map((zona: any, idx: number) => (
              <div 
                key={idx}
                className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[var(--ink)] block">{zona.zoneName}</span>
                  <span className="text-[11px] text-[var(--muted)]">
                    Bairros: {zona.neighborhoods?.join(", ")} · Tempo estimado: ~{zona.avgDeliveryTime}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold font-mono text-emerald-600 block">
                    {formatBrl(zona.baseFee)}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">Taxa Zuma</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FROTA DE MOTOBOYS */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600" />
              Frota de Motoboys Tangará da Serra ({motoboys.length})
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600">
              Própria + Lalamove
            </span>
          </div>

          <div className="space-y-2">
            {motoboys.map((mb: any) => {
              const isDisponivel = mb.status === "disponivel";
              const isEmRota = mb.status === "em_rota";

              return (
                <div 
                  key={mb.id}
                  className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-black">
                      🛵
                    </div>
                    <div>
                      <span className="font-bold text-[var(--ink)] block">{mb.name}</span>
                      <span className="text-[11px] text-[var(--muted)]">
                        Placa: {mb.plate} · Tel: {mb.phone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isDisponivel 
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" 
                        : isEmRota
                        ? "bg-purple-500/15 text-purple-600 border border-purple-500/30 animate-pulse"
                        : "bg-gray-500/15 text-gray-600"
                    }`}>
                      {mb.status?.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] block mt-0.5">
                      {mb.completedToday || 0} entregas hoje
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
