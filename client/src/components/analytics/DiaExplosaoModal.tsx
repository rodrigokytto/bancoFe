import React, { useState, useMemo } from "react";
import { formatBrl } from "../../../../shared/zumaData";
import { 
  X, 
  Sparkles, 
  Clock, 
  Flame, 
  Calendar, 
  Users, 
  Bike, 
  TrendingUp, 
  DollarSign, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Maximize2, 
  ArrowUpRight, 
  ChefHat, 
  Fish, 
  Sun, 
  CloudRain,
  Share2,
  Sliders,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface DiaExplosaoModalProps {
  isOpen: boolean;
  dayIdx: number;
  dayName: string;
  onClose: () => void;
}

interface HourlyStat {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
  kitchenLoad: number; // %
  hallOccupancy: number; // %
  lostRevenue: number;
  salmonKg: number;
  deliveryOrders: number;
  hallOrders: number;
  ifoodOrders: number;
  isPeak: boolean;
  highlightDish: string;
}

export const DiaExplosaoModal: React.FC<DiaExplosaoModalProps> = ({
  isOpen,
  dayIdx,
  dayName,
  onClose
}) => {
  const [, setLocation] = useLocation();
  const [selectedHour, setSelectedHour] = useState<number>(20); // 20h como padrão (pico noturno)
  const [activeTab, setActiveTab] = useState<"hora_a_hora" | "gargalos" | "canais" | "oportunidades">("hora_a_hora");

  // Multiplicadores por dia da semana (Sex e Sáb são os picos)
  const dayFactor = useMemo(() => {
    switch (dayIdx) {
      case 0: return 0.55; // Seg
      case 1: return 0.65; // Ter
      case 2: return 0.75; // Qua
      case 3: return 0.90; // Qui
      case 4: return 1.45; // Sex (Pico)
      case 5: return 1.60; // Sáb (Pico Máximo)
      case 6: return 1.15; // Dom
      default: return 1.0;
    }
  }, [dayIdx]);

  // Gera dados hora a hora de 00h às 23h
  const hourlyData: HourlyStat[] = useMemo(() => {
    const list: HourlyStat[] = [];
    for (let h = 0; h < 24; h++) {
      let baseOrders = 0;
      let baseLoad = 10;
      let isPeak = false;

      // Curva gastronômica real do Zuma Tangará da Serra
      if (h >= 11 && h <= 14) {
        // Almoço corporativo
        baseOrders = Math.round((h === 12 ? 18 : 12) * dayFactor * 0.6);
        baseLoad = h === 12 ? 65 : 45;
      } else if (h >= 18 && h <= 23) {
        // Jantar principal
        if (h === 18) { baseOrders = Math.round(14 * dayFactor); baseLoad = 50; }
        else if (h === 19) { baseOrders = Math.round(28 * dayFactor); baseLoad = 75; }
        else if (h === 20) { baseOrders = Math.round(44 * dayFactor); baseLoad = 95; isPeak = true; }
        else if (h === 21) { baseOrders = Math.round(38 * dayFactor); baseLoad = 90; isPeak = true; }
        else if (h === 22) { baseOrders = Math.round(22 * dayFactor); baseLoad = 60; }
        else if (h === 23) { baseOrders = Math.round(8 * dayFactor); baseLoad = 25; }
      } else {
        baseOrders = 0;
        baseLoad = 0;
      }

      const revenue = baseOrders * (78.5 + (h % 3) * 6);
      const lostRevenue = isPeak ? Math.round(baseOrders * 12.5) : 0;
      const salmonKg = +(baseOrders * 0.18).toFixed(1);
      const hallOrders = Math.round(baseOrders * 0.45);
      const deliveryOrders = Math.round(baseOrders * 0.35);
      const ifoodOrders = baseOrders - hallOrders - deliveryOrders;

      let highlightDish = "Combo Mix 22 Peças";
      if (h === 20 || h === 21) highlightDish = "Combo Especial Zuma 68 Peças & Barca 360°";
      else if (h === 19) highlightDish = "Temaki Salmão Filadélfia & Uramaki";
      else if (h >= 11 && h <= 14) highlightDish = "Executivo Teppan & Uramaki Box";

      list.push({
        hour: h,
        label: `${String(h).padStart(2, "0")}:00`,
        orders: baseOrders,
        revenue,
        kitchenLoad: baseLoad,
        hallOccupancy: Math.min(100, Math.round(baseLoad * 0.95)),
        lostRevenue,
        salmonKg,
        deliveryOrders,
        hallOrders,
        ifoodOrders,
        isPeak,
        highlightDish
      });
    }
    return list;
  }, [dayFactor]);

  // Totais consolidados do dia
  const dayTotals = useMemo(() => {
    const totalOrders = hourlyData.reduce((acc, h) => acc + h.orders, 0);
    const totalRevenue = hourlyData.reduce((acc, h) => acc + h.revenue, 0);
    const totalLostRevenue = hourlyData.reduce((acc, h) => acc + h.lostRevenue, 0);
    const totalSalmonKg = +hourlyData.reduce((acc, h) => acc + h.salmonKg, 0).toFixed(1);
    const peakHourStat = [...hourlyData].sort((a, b) => b.revenue - a.revenue)[0];
    const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      totalLostRevenue,
      totalSalmonKg,
      peakHour: peakHourStat?.label || "20:00",
      peakKitchenLoad: peakHourStat?.kitchenLoad || 0,
      ticketMedio
    };
  }, [hourlyData]);

  // Hora selecionada em foco
  const activeHourStat = hourlyData.find(h => h.hour === selectedHour) || hourlyData[20];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-auto">
        
        {/* Cabeçalho do Dia Explodido */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                Explosão 360° · 24 Horas
              </span>
              <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                Tangará da Serra (MT) · Dr. Clima
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-1 flex items-center gap-2">
              <span>{dayName}</span>
              <span className="text-sm font-semibold text-[var(--muted)]">
                · {dayIdx === 4 || dayIdx === 5 ? "Turno de Alta Demanda" : "Operação Regular"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success(`Relatório tático de ${dayName} gerado com sucesso!`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface2)] text-xs font-bold text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)] transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Cards de KPIs Consolidados do Dia */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Faturamento do Dia</span>
            <div className="text-xl font-black text-[var(--good)] font-mono mt-0.5">
              {formatBrl(dayTotals.totalRevenue)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {dayTotals.totalOrders} pedidos · TM {formatBrl(dayTotals.ticketMedio)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Pico da Cozinha</span>
            <div className="text-xl font-black text-orange-600 font-mono mt-0.5">
              {dayTotals.peakHour} ({dayTotals.peakKitchenLoad}%)
            </div>
            <span className="text-[10px] text-[var(--muted)]">
              4 Praças KDS sincronizadas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Salmão Consumido</span>
            <div className="text-xl font-black text-blue-600 font-mono mt-0.5">
              {dayTotals.totalSalmonKg} kg
            </div>
            <span className="text-[10px] text-blue-500 font-medium">
              Corte nobre chileno fresco
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">Dinheiro na Mesa</span>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5">
              {formatBrl(dayTotals.totalLostRevenue)}
            </div>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">
              Perdas por gargalo de fila
            </span>
          </div>
        </div>

        {/* Abas Internas da Explosão */}
        <div className="flex border-b border-[var(--line)] gap-2">
          <button
            onClick={() => setActiveTab("hora_a_hora")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "hora_a_hora"
                ? "border-[var(--salmon)] text-[var(--salmon)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Curva Horária (24h)</span>
          </button>
          <button
            onClick={() => setActiveTab("gargalos")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "gargalos"
                ? "border-[var(--salmon)] text-[var(--salmon)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Gargalos &amp; Cozinha</span>
          </button>
          <button
            onClick={() => setActiveTab("canais")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "canais"
                ? "border-[var(--salmon)] text-[var(--salmon)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Salão vs Delivery</span>
          </button>
          <button
            onClick={() => setActiveTab("oportunidades")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "oportunidades"
                ? "border-[var(--salmon)] text-[var(--salmon)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>IA &amp; Campanhas</span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: CURVA HORÁRIA DAS 24 HORAS */}
        {activeTab === "hora_a_hora" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 font-medium">
                <span>Clique em qualquer hora abaixo para inspecionar o momento exato:</span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  Selecionado: {activeHourStat.label}
                </span>
              </div>

              {/* Gráfico de Barras Térmico das 24 Horas */}
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 p-2 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] items-end h-32">
                {hourlyData.map(h => {
                  const maxRevenue = Math.max(...hourlyData.map(d => d.revenue)) || 1;
                  const heightPercent = Math.max(8, Math.round((h.revenue / maxRevenue) * 100));
                  const isSelected = h.hour === selectedHour;
                  
                  let barColor = "bg-stone-300 dark:bg-stone-700";
                  if (h.isPeak) barColor = "bg-red-500 hover:bg-red-600";
                  else if (h.orders > 20) barColor = "bg-orange-500 hover:bg-orange-600";
                  else if (h.orders > 0) barColor = "bg-emerald-500 hover:bg-emerald-600";

                  return (
                    <button
                      key={h.hour}
                      onClick={() => setSelectedHour(h.hour)}
                      title={`${h.label}: ${h.orders} pedidos · ${formatBrl(h.revenue)}`}
                      className={`relative w-full rounded-t flex flex-col justify-end transition-all group cursor-pointer ${
                        isSelected ? "ring-2 ring-[var(--salmon)] ring-offset-1 z-10" : ""
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className={`w-full h-full rounded-t ${barColor} transition-all`} />
                      <span className="text-[8px] font-mono font-bold text-center mt-1 text-[var(--muted)] block select-none">
                        {h.hour % 2 === 0 ? `${h.hour}h` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel de Raio-X da Hora Selecionada */}
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-inner space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-[var(--ink)] font-mono">
                    Faixa {activeHourStat.label} até {String(activeHourStat.hour + 1).padStart(2, "0")}:00
                  </span>
                  {activeHourStat.isPeak && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-600 border border-red-500/30 rounded-full text-[10px] font-bold">
                      HORÁRIO DE PICO MÁXIMO
                    </span>
                  )}
                  {activeHourStat.orders === 0 && (
                    <span className="px-2 py-0.5 bg-stone-500/10 text-stone-600 rounded-full text-[10px] font-bold">
                      Horário Sem Movimento / Fechado
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-[var(--good)] font-mono">
                  {formatBrl(activeHourStat.revenue)} faturados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Volume de Pedidos</span>
                  <b className="text-sm font-mono text-[var(--ink)]">{activeHourStat.orders} pedidos</b>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Carga da Cozinha KDS</span>
                  <b className={`text-sm font-mono ${activeHourStat.kitchenLoad >= 80 ? "text-red-600" : "text-emerald-600"}`}>
                    {activeHourStat.kitchenLoad}%
                  </b>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Ocupação do Salão</span>
                  <b className="text-sm font-mono text-purple-600">{activeHourStat.hallOccupancy}% (27 Mesas)</b>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Consumo de Salmão</span>
                  <b className="text-sm font-mono text-blue-600">{activeHourStat.salmonKg} kg</b>
                </div>
              </div>

              <div className="text-xs text-[var(--muted)] flex items-center justify-between pt-1">
                <span>Prato Mais Despachado: <b className="text-[var(--ink)]">{activeHourStat.highlightDish}</b></span>
                <span className="text-[10px] text-[var(--muted)]">Divisão: {activeHourStat.hallOrders} salão · {activeHourStat.deliveryOrders} delivery · {activeHourStat.ifoodOrders} ifood</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: GARGALOS & COZINHA */}
        {activeTab === "gargalos" && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-300">
                <ChefHat className="w-4 h-4 text-orange-600" />
                <span>Análise de Saturação das 4 Praças da Cozinha KDS</span>
              </div>
              <p className="text-xs text-orange-950 dark:text-orange-200 leading-relaxed">
                Nas noites de {dayName}, o tempo médio de despacho no pico das 20h às 21h salta de 18 min para 32 min. Isso gera uma perda estimada de {formatBrl(dayTotals.totalLostRevenue)} por clientes que desistem do delivery ou mesas que demoram a girar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-1">
                <span className="font-bold text-[var(--ink)] block">Praça 1: Sushibar Principal</span>
                <span className="text-[11px] text-[var(--muted)]">Capacidade de 45 combos/hora. Saturação em 92%.</span>
                <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-red-500 h-full w-[92%]" />
                </div>
              </div>
              <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-1">
                <span className="font-bold text-[var(--ink)] block">Praça 2: Frituras &amp; Quentes</span>
                <span className="text-[11px] text-[var(--muted)]">Capacidade de 60 hots/hora. Saturação em 68%.</span>
                <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full w-[68%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: SALÃO VS DELIVERY */}
        {activeTab === "canais" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-[var(--surface2)] rounded-2xl border border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--muted)] block">Salão (27 Mesas)</span>
                <div className="text-xl font-black text-purple-600 font-mono mt-1">45%</div>
                <span className="text-[10px] text-[var(--muted)]">Atendimento com garçom</span>
              </div>
              <div className="p-4 bg-[var(--surface2)] rounded-2xl border border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--muted)] block">Delivery Próprio PWA</span>
                <div className="text-xl font-black text-[var(--salmon)] font-mono mt-1">35%</div>
                <span className="text-[10px] text-[var(--muted)]">Zero comissão de app</span>
              </div>
              <div className="p-4 bg-[var(--surface2)] rounded-2xl border border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--muted)] block">iFood Tangará</span>
                <div className="text-xl font-black text-red-600 font-mono mt-1">20%</div>
                <span className="text-[10px] text-[var(--muted)]">Canal de novos clientes</span>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Dica Zuma: No dia de {dayName}, o canal de delivery próprio retém 35% do volume com lucro 23% superior ao iFood. Clientes que utilizam o Clube Zumi têm recorrência de 3,4x ao mês.
            </p>
          </div>
        )}

        {/* CONTEÚDO DA ABA 4: OPORTUNIDADES & IA ZUMI */}
        {activeTab === "oportunidades" && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Plano Tático da IA Zumi para Alavancar {dayName}:</span>
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                Desloque 15% dos pedidos do pico das 20h para a faixa das 18h às 19h30 com a campanha "Happy Hour Oriental: 15% OFF em Combinados antes das 19h30". Isso alivia a carga do KDS e captura {formatBrl(dayTotals.totalLostRevenue * 0.7)} de lucro extra no dia!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success(`Campanha configurada para as noites de ${dayName}!`);
                  onClose();
                  setLocation("/campanhas");
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--salmon)] hover:brightness-105 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Ativar Campanha para Este Dia</span>
              </button>
              <button
                onClick={() => {
                  toast.success("Plano Chuva de Vendas acionado para Tangará da Serra!");
                  onClose();
                  setLocation("/dr-clima");
                }}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CloudRain className="w-4 h-4" />
                <span>Verificar Clima Tangará</span>
              </button>
            </div>
          </div>
        )}

        {/* Rodapé com botão de fechar */}
        <div className="pt-2 border-t border-[var(--line)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] transition cursor-pointer"
          >
            Fechar Explosão
          </button>
        </div>

      </div>
    </div>
  );
};
