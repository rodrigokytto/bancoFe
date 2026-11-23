import React, { useState } from "react";
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  ChevronRight, 
  Flame, 
  Layers,
  PackageCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl, ALL_ITEMS } from "../../../../shared/zumaData";

export const IfoodHubV2: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMotoboy, setSelectedMotoboy] = useState<Record<number, string>>({});
  const [cancelModalOrderId, setCancelModalOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("Falta de insumo na cozinha");

  // Queries tRPC
  const ifoodOverviewQuery = trpc.zuma.getIfoodOverview.useQuery(undefined, { refetchInterval: 4000 });
  const motoboysQuery = trpc.zuma.listMotoboys.useQuery();
  const rawMaterialsQuery = trpc.zuma.listRawMaterials.useQuery();

  // Mutations tRPC
  const setStatusMutation = trpc.zuma.ifoodSetStoreStatus.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Status da loja iFood alterado para: ${data.status}`);
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao alterar status: ${err.message}`)
  });

  const confirmMutation = trpc.zuma.ifoodConfirmOrder.useMutation({
    onSuccess: () => {
      toast.success("Pedido confirmado com sucesso no iFood!");
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao confirmar: ${err.message}`)
  });

  const readyMutation = trpc.zuma.ifoodReadyOrder.useMutation({
    onSuccess: () => {
      toast.success("Pedido marcado como PRONTO no iFood (Pronto para Retirada)!");
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao atualizar: ${err.message}`)
  });

  const dispatchMutation = trpc.zuma.ifoodDispatchOrder.useMutation({
    onSuccess: () => {
      toast.success("Pedido despachado! Motoboy a caminho do cliente.");
      ifoodOverviewQuery.refetch();
      motoboysQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao despachar: ${err.message}`)
  });

  const concludeMutation = trpc.zuma.ifoodConcludeOrder.useMutation({
    onSuccess: () => {
      toast.success("Pedido concluído e entregue com sucesso!");
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao concluir: ${err.message}`)
  });

  const cancelMutation = trpc.zuma.ifoodCancelOrder.useMutation({
    onSuccess: () => {
      toast.warning("Pedido cancelado no iFood com justificativa registrada.");
      setCancelModalOrderId(null);
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao cancelar: ${err.message}`)
  });

  const syncCatalogMutation = trpc.zuma.ifoodSyncCatalog.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Catálogo sincronizado com sucesso! ${data.totalSkus} SKUs atualizados no iFood.`);
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro na sincronização: ${err.message}`)
  });

  const toggleItemMutation = trpc.zuma.ifoodToggleItem.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Item "${data.dishName}" ${data.available ? "reativado" : "pausado"} no iFood!`);
      ifoodOverviewQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao alterar item: ${err.message}`)
  });

  const toggleAutoPauseMutation = trpc.zuma.toggleAutoStockPauseIfood.useMutation({
    onSuccess: () => {
      toast.success("Configuração de Auto-Pausa por Ruptura atualizada!");
      ifoodOverviewQuery.refetch();
    }
  });

  const simulateRuptureMutation = trpc.zuma.simulateStockRupture.useMutation({
    onSuccess: (data: any) => {
      toast.error(data.message);
      ifoodOverviewQuery.refetch();
      rawMaterialsQuery.refetch();
    }
  });

  const overview = ifoodOverviewQuery.data || {
    storeStatus: "ABERTO",
    merchantId: "merch_zuma_tangara_01",
    activeCount: 0,
    activeOrders: [],
    completedCount: 0,
    cancelledCount: 0,
    revenueToday: 0,
    avgPrepMinutes: 28,
    cancellationRatePercent: 0.4,
    pausedDishes: ["Sashimi Salmão 24 Fatias", "Especial do Cheff 106 Peças"],
    autoStockPauseEnabled: true,
    totalCatalogSkus: 211,
  };

  const motoboys = motoboysQuery.data || [];
  const pausedDishesList = overview.pausedDishes || [];

  const categories = Array.from(new Set(ALL_ITEMS.map(i => i.cat)));
  const filteredCatalog = ALL_ITEMS.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.cat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.cat === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==============================================================================
          CABECALHO DO IFOOD HUB: STATUS DA LOJA & METRICAS AO VIVO
      ============================================================================== */}
      <div className="bg-[var(--surface)] border-2 border-[#EA1D2C]/40 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#EA1D2C] text-white text-xs font-black rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <ShoppingBag className="w-3.5 h-3.5" /> iFood Merchant API v2 Oficial · Tangará da Serra
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EA1D2C] text-white flex items-center justify-center font-black text-3xl shadow-md border-2 border-white/20 shrink-0">
              iF
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-display font-extrabold text-[var(--ink)]">
                  Zuma Cozinha Oriental
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#EA1D2C]/10 text-[#EA1D2C] border border-[#EA1D2C]/30">
                  Merchant ID: {overview.merchantId}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Conexão bidirecional OAuth 2.0 com sincronização em tempo real de pedidos, catálogo e auto-pausa de ruptura.
              </p>
            </div>
          </div>

          {/* CONTROLE DE STATUS DA LOJA */}
          <div className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Status da Loja no iFood</span>
              <div className="flex items-center gap-2 mt-0.5">
                {overview.storeStatus === "ABERTO" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ABERTA (Recebendo Pedidos)
                  </span>
                )}
                {overview.storeStatus?.startsWith("PAUSA") && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    PAUSADA ({overview.storeStatus.replace("_", " ")})
                  </span>
                )}
                {overview.storeStatus === "FECHADO" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/15 text-red-600 border border-red-500/30">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    FECHADA MANUALMENTE
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusMutation.mutate({ status: "ABERTO" })}
                disabled={setStatusMutation.isPending || overview.storeStatus === "ABERTO"}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  overview.storeStatus === "ABERTO"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-[var(--line)]"
                }`}
              >
                Abrir
              </button>
              <button
                onClick={() => setStatusMutation.mutate({ status: "PAUSA_15" })}
                disabled={setStatusMutation.isPending || overview.storeStatus === "PAUSA_15"}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  overview.storeStatus === "PAUSA_15"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-[var(--line)]"
                }`}
              >
                Pausar 15m
              </button>
              <button
                onClick={() => setStatusMutation.mutate({ status: "PAUSA_30" })}
                disabled={setStatusMutation.isPending || overview.storeStatus === "PAUSA_30"}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  overview.storeStatus === "PAUSA_30"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-[var(--line)]"
                }`}
              >
                Pausar 30m
              </button>
              <button
                onClick={() => setStatusMutation.mutate({ status: "FECHADO" })}
                disabled={setStatusMutation.isPending || overview.storeStatus === "FECHADO"}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  overview.storeStatus === "FECHADO"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-red-50 dark:hover:bg-red-950/30 border border-[var(--line)]"
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>

        {/* METRICAS DO IFOOD HOJE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--line)]">
          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Pedidos Ativos no iFood</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5 flex items-center gap-1.5">
              <span>{overview.activeCount}</span>
              {overview.activeCount > 0 && <span className="w-2 h-2 rounded-full bg-[#EA1D2C] animate-ping" />}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Em preparo / rota</span>
          </div>

          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Faturamento iFood Hoje</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5">
              {formatBrl(overview.revenueToday)}
            </div>
            <span className="text-[10px] text-[var(--muted)] block mt-1">Taxa média retida: ~23%</span>
          </div>

          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Tempo Médio de Preparo</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5 flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{overview.avgPrepMinutes} min</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Meta Zuma: &lt; 30 min</span>
          </div>

          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Taxa de Cancelamento</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {overview.cancellationRatePercent}%
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Nível Excelente (&lt; 1,0%)</span>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          AUTO-PAUSA INTELIGENTE POR RUPTURA DE ESTOQUE (EXCLUSIVO ZUMA)
      ============================================================================== */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  Watchdog de Ruptura de Estoque (Auto-Pausa Automática no iFood)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">
                  Exclusivo Zuma
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Se o estoque de Salmão Fresco, Shari ou Embalagens Delivery zerar no ERP, o Zuma pausa os itens no iFood em &lt; 1 segundo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={overview.autoStockPauseEnabled}
                onChange={e => toggleAutoPauseMutation.mutate({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <button
              onClick={() => simulateRuptureMutation.mutate({ materialName: "Salmão Fresco Especial", deltaKg: -6.0 })}
              disabled={simulateRuptureMutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Flame className="w-3.5 h-3.5" />
              Simular Ruptura de Salmão
            </button>
          </div>
        </div>

        {pausedDishesList.length > 0 && (
          <div className="p-3 bg-[var(--surface)] border border-red-500/20 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Itens Atualmente Pausados no iFood por Estoque Crítico ({pausedDishesList.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pausedDishesList.map(dish => (
                  <span key={dish} className="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-300 text-[11px] font-semibold border border-red-500/20">
                    {dish}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                pausedDishesList.forEach(dish => toggleItemMutation.mutate({ dishName: dish, available: true }));
              }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reativar Todos no iFood
            </button>
          </div>
        )}
      </div>

      {/* ==============================================================================
          FILA DE PEDIDOS ATIVOS DO IFOOD COM BOTOES DE ACAO DO CICLO DE VIDA
      ============================================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#EA1D2C]" />
              Fila Operacional de Pedidos iFood ao Vivo
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EA1D2C]/10 text-[#EA1D2C]">
              {overview.activeOrders.length} pedidos
            </span>
          </div>

          <button
            onClick={() => ifoodOverviewQuery.refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--ink)] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ifoodOverviewQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {overview.activeOrders.length === 0 ? (
          <div className="p-8 text-center bg-[var(--surface2)] rounded-xl border border-dashed border-[var(--line)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-[var(--ink)]">Nenhum pedido pendente no iFood no momento!</p>
            <p className="text-xs text-[var(--muted)]">
              Use a aba "Laboratório Sandbox" para simular a chegada de um pedido do iFood ou aguarde novos pedidos do delivery.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {overview.activeOrders.map((order: any) => {
              const itemsList = order.items || [];
              const isPreparo = order.status === "preparo" || order.status === "recebido" || order.status === "novo";
              const isPronto = order.status === "pronto";
              const isRota = order.status === "rota";

              return (
                <div 
                  key={order.id || order.orderNumber}
                  className="p-4 bg-[var(--surface2)] border border-[var(--line)] rounded-xl space-y-3 hover:border-[#EA1D2C]/40 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EA1D2C] text-white text-xs font-black">
                        #{order.orderNumber || order.id}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-[var(--ink)]">{order.customerName}</span>
                        <span className="text-xs text-[var(--muted)] ml-2">· {order.neighborhood || "Tangará da Serra"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isPreparo ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" :
                        isPronto ? "bg-blue-500/15 text-blue-600 border border-blue-500/30" :
                        isRota ? "bg-purple-500/15 text-purple-600 border border-purple-500/30" :
                        "bg-gray-500/15 text-gray-600"
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-extrabold text-[var(--ink)]">
                        {formatBrl(parseFloat(order.total || "0"))}
                      </span>
                    </div>
                  </div>

                  {/* ITENS DO PEDIDO */}
                  <div className="text-xs text-[var(--ink)] bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--line)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">Itens:</span>
                    <ul className="space-y-1">
                      {itemsList.map((it: any, idx: number) => (
                        <li key={idx} className="flex justify-between text-xs">
                          <span>{it.quantity}x {it.itemName || it.name}</span>
                          <span className="font-mono text-[var(--muted)]">{formatBrl((it.unitPrice || 0) * (it.quantity || 1))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* BOTOES DE ACAO DO CICLO DE VIDA IFOOD */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Agora"}</span>
                      {order.motoboyName && (
                        <span className="text-purple-600 font-bold ml-2">
                          🛵 {order.motoboyName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* BOTAO CONFIRMAR PEDIDO */}
                      {order.status === "novo" && (
                        <button
                          onClick={() => confirmMutation.mutate({ orderId: order.orderNumber || order.id, prepTimeMinutes: 25 })}
                          disabled={confirmMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirmar Pedido (25m)
                        </button>
                      )}

                      {/* BOTAO MARCAR PRONTO */}
                      {isPreparo && (
                        <button
                          onClick={() => readyMutation.mutate({ orderId: order.orderNumber || order.id })}
                          disabled={readyMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Marcar Pronto (KDS)
                        </button>
                      )}

                      {/* DESPACHAR MOTOBOY */}
                      {(isPreparo || isPronto) && (
                        <div className="flex items-center gap-1">
                          <select
                            value={selectedMotoboy[order.orderNumber || order.id] || ""}
                            onChange={e => setSelectedMotoboy(prev => ({ ...prev, [order.orderNumber || order.id]: e.target.value }))}
                            className="text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2 py-1.5 text-[var(--ink)]"
                          >
                            <option value="">Frota Parceira iFood</option>
                            {motoboys.map((mb: any) => (
                              <option key={mb.id} value={mb.id}>
                                🛵 {mb.name} ({mb.plate})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => dispatchMutation.mutate({ 
                              orderId: order.orderNumber || order.id, 
                              motoboyId: selectedMotoboy[order.orderNumber || order.id] 
                            })}
                            disabled={dispatchMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Despachar
                          </button>
                        </div>
                      )}

                      {/* CONCLUIR PEDIDO */}
                      {isRota && (
                        <button
                          onClick={() => concludeMutation.mutate({ orderId: order.orderNumber || order.id })}
                          disabled={concludeMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Concluir Entrega
                        </button>
                      )}

                      {/* CANCELAR PEDIDO */}
                      <button
                        onClick={() => setCancelModalOrderId(order.orderNumber || order.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CANCELAMENTO */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Cancelar Pedido #{cancelModalOrderId} no iFood
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Ao cancelar, uma notificação com o código SEFAZ e justificativa oficial será transmitida para a API do iFood e o cliente será reembolsado.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink)]">Motivo do Cancelamento:</label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)]"
              >
                <option value="Falta de insumo na cozinha">Falta de insumo na cozinha (Ruptura)</option>
                <option value="Solicitação direta do cliente">Solicitação direta do cliente via WhatsApp</option>
                <option value="Endereço fora da área de entrega de Tangará">Endereço fora da área de entrega de Tangará</option>
                <option value="Sobrecarga extrema na cozinha">Sobrecarga extrema na cozinha (Pico)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface2)] cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => cancelMutation.mutate({ orderId: cancelModalOrderId, reason: cancelReason })}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          CATALOGO OFICIAL IFOOD: SINCRONIZACAO DOS 211 SKUS & TOGGLE POR ITEM
      ============================================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EA1D2C]" />
                Catálogo Oficial do iFood (Sincronização dos 211 SKUs)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#EA1D2C]/10 text-[#EA1D2C]">
                211 SKUs
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              Controle individual de disponibilidade de cada prato no iFood e sincronização em lote de fotos, preços e categorias.
            </p>
          </div>

          <button
            onClick={() => syncCatalogMutation.mutate()}
            disabled={syncCatalogMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA1D2C] hover:brightness-105 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncCatalogMutation.isPending ? "animate-spin" : ""}`} />
            Sincronizar Catálogo Completo (211 SKUs)
          </button>
        </div>

        {/* FILTROS E BUSCA DO CATALOGO */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar prato por nome ou categoria (ex: Combo 26, Uramaki, Hot)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#EA1D2C]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Todos ({ALL_ITEMS.length})
            </button>
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#EA1D2C] text-white"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LISTAGEM DOS ITENS COM TOGGLE */}
        <div className="border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto divide-y divide-[var(--line)]">
            {filteredCatalog.slice(0, 50).map(item => {
              const isPaused = pausedDishesList.includes(item.nome);

              return (
                <div 
                  key={item.nome}
                  className="p-3 bg-[var(--surface)] hover:bg-[var(--surface2)] flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      🍱
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--ink)] block">{item.nome}</span>
                      <span className="text-[11px] text-[var(--muted)]">{item.cat} · {formatBrl(item.preco)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isPaused 
                        ? "bg-red-500/15 text-red-600 border border-red-500/30" 
                        : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    }`}>
                      {isPaused ? "Pausado no iFood" : "Ativo no iFood"}
                    </span>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!isPaused}
                        onChange={e => toggleItemMutation.mutate({ dishName: item.nome, available: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[var(--surface2)] text-center text-xs text-[var(--muted)] border-t border-[var(--line)]">
            Mostrando 50 de {filteredCatalog.length} itens do catálogo ({ALL_ITEMS.length} total). Para filtrar mais itens, use a barra de busca acima.
          </div>
        </div>
      </div>
    </div>
  );
};
