import React, { useState } from "react";
import { 
  UtensilsCrossed, 
  CheckCircle2, 
  Clock, 
  Users, 
  Receipt, 
  RefreshCw, 
  Plus, 
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";

export const KeetoPosHub: React.FC = () => {
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(1);
  const [orderDish, setOrderDish] = useState("Combo 26 Peças");
  const [orderQty, setOrderQty] = useState(1);
  const [waiterName, setWaiterName] = useState("Matheus");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [splitCount, setSplitCount] = useState(2);

  // Queries tRPC
  const tablesQuery = trpc.zuma.keetoGetTables.useQuery(undefined, { refetchInterval: 3000 });

  // Mutations tRPC
  const sendOrderMutation = trpc.zuma.keetoSendOrder.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Comanda enviada para o KDS! Pedido #${data.orderNum} da Mesa ${selectedTableNumber}.`);
      tablesQuery.refetch();
      setOrderNotes("");
    },
    onError: (err: any) => toast.error(`Erro ao enviar pedido: ${err.message}`)
  });

  const closeTableMutation = trpc.zuma.keetoCloseTable.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Mesa ${data.tableNumber} fechada com sucesso! NFC-e #${data.nfcNumber} autorizada na SEFAZ-MT.`);
      tablesQuery.refetch();
    },
    onError: (err: any) => toast.error(`Erro ao fechar mesa: ${err.message}`)
  });

  const syncKeetoMutation = trpc.zuma.simulateKeetoOrder.useMutation({
    onSuccess: () => {
      toast.success("Catálogo e comandas sincronizados com os terminais Keeto!");
      tablesQuery.refetch();
    }
  });

  const overview = tablesQuery.data || {
    tables: [] as any[],
    totalTables: 16,
    occupiedCount: 0,
    freeCount: 16,
    pendingBillsCount: 0,
    totalConsumption: 0,
    avgStayMinutes: 45,
    waitersActive: ["Matheus", "Jessica", "Vitor"],
    lastSyncAt: new Date().toISOString(),
  };

  const selectedTable = overview.tables.find((t: any) => t.tableNumber === selectedTableNumber) || {
    tableNumber: selectedTableNumber,
    name: `Mesa ${String(selectedTableNumber).padStart(2, "0")}`,
    capacity: 4,
    status: "livre" as const,
    orderItems: [] as any[],
    subtotal: 0,
    serviceFeePercent: 10,
    total: 0,
    customerCount: 2,
    waiter: "Matheus"
  };

  const quickDishes = [
    { name: "Combo 26 Peças", price: 69.9 },
    { name: "Especial da Casa 40 Peças", price: 98.9 },
    { name: "Hot Filadélfia (12un)", price: 31.9 },
    { name: "Sunomono Especial", price: 19.9 },
    { name: "Refrigerante Lata", price: 5.0 },
    { name: "Sake Junmai Dourado", price: 42.0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ==============================================================================
          CABECALHO KEETO POS: STATUS DA CONEXAO & METRICAS DO SALAO
      ============================================================================== */}
      <div className="bg-[var(--surface)] border-2 border-orange-500/40 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-600 text-white text-xs font-black rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <UtensilsCrossed className="w-3.5 h-3.5" /> Keeto POS &amp; Comanda Eletrônica · Salão Zuma
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-3xl shadow-md border-2 border-white/20 shrink-0">
              KP
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-display font-extrabold text-[var(--ink)]">
                  Keeto POS &amp; Frente de Caixa Integrado
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Online (22ms)
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                Sincronização bidirecional de comandas mobile dos garçons, mapa de mesas, KDS por praça e emissão de NFC-e SEFAZ-MT.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => syncKeetoMutation.mutate({ dishName: "Especial da Casa 40 Peças", quantity: 1, total: 98.9 })}
              disabled={syncKeetoMutation.isPending}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncKeetoMutation.isPending ? "animate-spin" : ""}`} />
              Sincronizar Mesas &amp; Comandas
            </button>
          </div>
        </div>

        {/* METRICAS DO SALAO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--line)]">
          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Mesas Ocupadas</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5 flex items-center gap-1.5">
              <span>{overview.occupiedCount} / {overview.totalTables}</span>
              <span className="text-xs text-[var(--muted)] font-normal">
                ({overview.totalTables > 0 ? Math.round((overview.occupiedCount / overview.totalTables) * 100) : 0}% ocupação)
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
              {overview.freeCount} mesas livres
            </span>
          </div>

          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Consumo Aberto no Salão</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5">
              {formatBrl(overview.totalConsumption)}
            </div>
            <span className="text-[10px] text-[var(--muted)] block mt-1">
              {overview.pendingBillsCount} pedindo a conta
            </span>
          </div>

          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Tempo Médio no Salão</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5 flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{overview.avgStayMinutes} min</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Giro de mesa ideal</span>
          </div>

          <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)]">
            <span className="text-[11px] text-[var(--muted)] font-medium">Garçons em Turno</span>
            <div className="text-xl font-extrabold text-[var(--ink)] mt-0.5 flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{overview.waitersActive.length} ativos</span>
            </div>
            <span className="text-[10px] text-[var(--muted)] block mt-1">
              {overview.waitersActive.join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          GRID DAS 16 MESAS DO SALAO SINCRONIZADAS COM O KEETO
      ============================================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              Mapa de Mesas do Salão (16 Mesas Keeto)
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-600">
              Tempo Real
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Livre
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Ocupada
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Conta
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {overview.tables.map((table: any) => {
            const isSelected = selectedTableNumber === table.tableNumber;
            const isLivre = table.status === "livre";
            const isOcupada = table.status === "ocupada";

            return (
              <button
                key={table.tableNumber}
                onClick={() => setSelectedTableNumber(table.tableNumber)}
                className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-orange-500 border-orange-500 bg-orange-500/10"
                    : isLivre
                    ? "bg-[var(--surface2)] border-[var(--line)] hover:border-emerald-500/50"
                    : isOcupada
                    ? "bg-blue-500/10 border-blue-500/40 hover:border-blue-500"
                    : "bg-amber-500/10 border-amber-500/40 hover:border-amber-500 animate-pulse"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--ink)]">
                    Mesa {String(table.tableNumber).padStart(2, "0")}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    isLivre ? "bg-emerald-500" : isOcupada ? "bg-blue-500" : "bg-amber-500"
                  }`} />
                </div>

                <div className="mt-2">
                  <span className="text-[11px] font-bold block text-[var(--ink)]">
                    {isLivre ? "Livre" : formatBrl(table.total || 0)}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] block truncate">
                    {isLivre ? `${table.capacity} lugares` : table.waiter || "Salão"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==============================================================================
          PAINEL DE DETALHE DA MESA SELECIONADA, LANCAMENTO DE COMANDA & FECHAMENTO
      ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DETALHE DA MESA & LANCAMENTO DE COMANDA KEETO */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-black text-sm">
                #{selectedTable.tableNumber}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">
                  Mesa {String(selectedTable.tableNumber).padStart(2, "0")} · {selectedTable.name}
                </h4>
                <span className="text-xs text-[var(--muted)]">
                  Garçom: <strong>{selectedTable.waiter || "Não atribuído"}</strong> · Capacidade: {selectedTable.capacity} pessoas
                </span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              selectedTable.status === "livre" ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" :
              selectedTable.status === "ocupada" ? "bg-blue-500/15 text-blue-600 border border-blue-500/30" :
              "bg-amber-500/15 text-amber-600 border border-amber-500/30"
            }`}>
              {selectedTable.status}
            </span>
          </div>

          {/* ITENS JA PEDIDOS NA MESA */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block">
              Itens Lançados na Comanda ({selectedTable.orderItems?.length || 0}):
            </span>

            {(!selectedTable.orderItems || selectedTable.orderItems.length === 0) ? (
              <div className="p-4 text-center bg-[var(--surface2)] rounded-xl border border-dashed border-[var(--line)] text-xs text-[var(--muted)]">
                Nenhum item lançado ainda. Selecione um prato abaixo para abrir a comanda.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-[var(--line)] border border-[var(--line)] rounded-xl">
                {selectedTable.orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-[var(--surface)]">
                    <div>
                      <span className="font-bold text-[var(--ink)]">{item.quantity}x {item.itemName}</span>
                      <span className="text-[10px] text-[var(--muted)] block">Praça: {item.station}</span>
                    </div>
                    <span className="font-mono font-bold text-[var(--ink)]">
                      {formatBrl(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORMULARIO DE LANCAMENTO RAPIDO DE COMANDA */}
          <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3">
            <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-orange-500" />
              Lançar Pedido do Garçom para a Cozinha KDS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-[var(--muted)]">Prato / Item do Cardápio:</label>
                <select
                  value={orderDish}
                  onChange={e => setOrderDish(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
                >
                  {quickDishes.map((d: any) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({formatBrl(d.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[var(--muted)]">Qtd:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={orderQty}
                  onChange={e => setOrderQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--muted)]">Garçom Responsável:</label>
                <select
                  value={waiterName}
                  onChange={e => setWaiterName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
                >
                  <option value="Matheus">Matheus (Salão)</option>
                  <option value="Jessica">Jessica (Salão)</option>
                  <option value="Vitor">Vitor (Varanda)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[var(--muted)]">Observação para a Cozinha:</label>
                <input
                  type="text"
                  placeholder="Ex: sem cebolinha, molho à parte..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const found = quickDishes.find((d: any) => d.name === orderDish) || { price: 69.9 };
                sendOrderMutation.mutate({
                  tableNumber: selectedTable.tableNumber,
                  waiter: waiterName,
                  notes: orderNotes,
                  items: [
                    {
                      itemName: orderDish,
                      quantity: orderQty,
                      unitPrice: found.price,
                      station: orderDish.includes("Sake") || orderDish.includes("Refri") ? "bar" : "sushibar"
                    }
                  ]
                });
              }}
              disabled={sendOrderMutation.isPending}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Enviar Comanda Keeto ao KDS
            </button>
          </div>
        </div>

        {/* FECHAMENTO DE CONTA, DIVISAO & EMISSAO FISCAL SEFAZ-MT */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Fechamento de Conta &amp; Emissão Fiscal (SEFAZ-MT)
              </h4>
              <p className="text-xs text-[var(--muted)]">Mesa {String(selectedTable.tableNumber).padStart(2, "0")}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
              NFC-e Modelo 65
            </span>
          </div>

          {/* RESUMO DE VALORES DA CONTA */}
          <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Subtotal do Consumo:</span>
              <span className="font-mono">{formatBrl(selectedTable.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Taxa de Serviço Opcional (10%):</span>
              <span className="font-mono">{formatBrl((selectedTable.subtotal || 0) * 0.1)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[var(--ink)] pt-2 border-t border-[var(--line)]">
              <span>Total da Conta:</span>
              <span className="text-emerald-600 font-mono">{formatBrl(selectedTable.total || 0)}</span>
            </div>
          </div>

          {/* DIVISAO DA CONTA POR PESSOAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                Divisão da Conta por Pagantes:
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setSplitCount(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                      splitCount === num
                        ? "bg-blue-600 text-white"
                        : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                Valor individual ({splitCount} {splitCount === 1 ? "pessoa" : "pessoas"}):
              </span>
              <span className="text-sm font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {formatBrl((selectedTable.total || 0) / splitCount)} por pessoa
              </span>
            </div>
          </div>

          {/* METODO DE PAGAMENTO & FECHAMENTO */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--ink)]">Método de Liquidação:</label>
              <div className="grid grid-cols-3 gap-2">
                {["Pix", "Cartão TEF (Stone)", "Dinheiro"].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      paymentMethod === method
                        ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                        : "bg-[var(--surface2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => closeTableMutation.mutate({
                tableNumber: selectedTable.tableNumber,
                paymentMethod,
                splitCount,
              })}
              disabled={closeTableMutation.isPending || selectedTable.status === "livre"}
              className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                selectedTable.status === "livre"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Fechar Mesa &amp; Emitir NFC-e SEFAZ-MT
            </button>
            <p className="text-[11px] text-center text-[var(--muted)]">
              Ao fechar, o consumo é contabilizado no DRE, os insumos recebem baixa no Kardex do ERP e o cupom fiscal é emitido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
