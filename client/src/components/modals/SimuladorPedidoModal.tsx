import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Zap,
  X,
  Flame,
  TrendingUp,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { orderEventBus, SimulatedOrderEvent } from "../../lib/orderEvents";
import { toast } from "sonner";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PresetItem {
  name: string;
  praça: "sushibar" | "quente" | "bar" | "expedicao";
  prepMinutes: number;
  price: number;
  salmonWeightGrams: number;
  fireOnDemand?: boolean;
}

interface Preset {
  id: string;
  channel: "mesa" | "delivery" | "ifood";
  tableNumber?: number;
  customerName: string;
  title: string;
  subtitle: string;
  items: PresetItem[];
  total: number;
}

export const SimuladorPedidoModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [, setLocation] = useLocation();
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStep, setSyncStep] = useState<number>(0);

  if (!isOpen) return null;

  const presets: Preset[] = [
    {
      id: "mesa-frio-quente",
      channel: "mesa",
      tableNumber: 7,
      customerName: "Rodrigo Gonçalves",
      title: "Mesa #07 (Salão Nobre): Combo Frio + Quente",
      subtitle: "Demonstração perfeita do Fire-on-Demand (Sushibar aguarda cozinha quente)",
      items: [
        { name: "Shimeji na Manteiga", praça: "quente", prepMinutes: 12, price: 34.90, salmonWeightGrams: 0 },
        { name: "Guioza Suíno no Vapor (6 un)", praça: "quente", prepMinutes: 10, price: 29.90, salmonWeightGrams: 0 },
        { name: "Sashimi Salmão Fresco Especial (10 un)", praça: "sushibar", fireOnDemand: true, prepMinutes: 4, price: 49.90, salmonWeightGrams: 220 },
      ],
      total: 114.70,
    },
    {
      id: "delivery-barca",
      channel: "delivery",
      customerName: "Marina Silva (Vila Alta)",
      title: "Delivery Vila Alta: Barca Zuma Premium 42 peças",
      subtitle: "Expedição com conferência de embalagem (hashis, shoyu e wasabi)",
      items: [
        { name: "Barca Zuma Premium (42 peças)", praça: "sushibar", prepMinutes: 16, price: 139.90, salmonWeightGrams: 420 },
        { name: "Hot Roll Salmão Crocante (8 un)", praça: "quente", prepMinutes: 8, price: 32.90, salmonWeightGrams: 110 },
      ],
      total: 172.80,
    },
    {
      id: "tatame-vip",
      channel: "mesa",
      tableNumber: 12,
      customerName: "Dr. Marcelo & Convidados (Tatame VIP)",
      title: "Tatame VIP 02: Degustação Omakase Chef",
      subtitle: "Cortes nobres trufados e sequência com sincronização máxima",
      items: [
        { name: "Carpaccio Salmão Trufado c/ Flor de Sal", praça: "sushibar", prepMinutes: 6, price: 58.00, salmonWeightGrams: 180 },
        { name: "Robata de Salmão com Teriyaki Artesanal", praça: "quente", prepMinutes: 14, price: 42.00, salmonWeightGrams: 190 },
        { name: "Niguiri Salmão Selado c/ Foie Gras (6 un)", praça: "sushibar", fireOnDemand: true, prepMinutes: 5, price: 62.00, salmonWeightGrams: 150 },
      ],
      total: 162.00,
    }
  ];

  const current = presets[selectedPreset];

  const handleSimular = async () => {
    setIsProcessing(true);
    setSyncStep(1);

    const orderData: SimulatedOrderEvent = {
      orderId: `ZM-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      channel: current.channel,
      tableNumber: current.tableNumber,
      customerName: current.customerName,
      items: current.items,
      totalValue: current.total,
      status: "novo"
    };

    // Etapa 1: Emissão do evento interno
    orderEventBus.emit(orderData);
    await new Promise(r => setTimeout(r, 400));
    setSyncStep(2);

    // Etapa 2: KDS 2.0 Fire on Demand
    await new Promise(r => setTimeout(r, 450));
    setSyncStep(3);

    // Etapa 3: Kardex Salmão
    await new Promise(r => setTimeout(r, 450));
    setSyncStep(4);

    // Etapa 4: Mapa de Calor
    await new Promise(r => setTimeout(r, 400));
    setSyncStep(5);

    setIsProcessing(false);
    toast.success(`⚡ Pedido ${orderData.orderId} sincronizado por evento interno em todo o ecossistema Zuma!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                Simulador de Pedido em Tempo Real
              </h3>
              <p className="text-[11px] text-white/90">
                Sincronização por Evento Interno: KDS 2.0, Kardex, Mapa 7x11 e Salão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Escolha o Cenário de Simulação:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPreset(idx); setSyncStep(0); }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    selectedPreset === idx
                      ? "border-orange-500 bg-orange-500/10 shadow-xs"
                      : "border-border bg-muted/40 hover:border-orange-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-extrabold text-xs text-foreground">
                      {p.title}
                    </span>
                    <span className="font-black text-xs text-orange-600 dark:text-orange-400">
                      R$ {p.total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {p.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes dos Itens Selecionados */}
          <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs space-y-1.5">
            <span className="font-extrabold text-foreground block mb-1">
              Itens do Pedido & Roteamento por Praça:
            </span>
            {current.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                    it.praça === "sushibar" ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-400" : "bg-red-500/20 text-red-700 dark:text-red-400"
                  }`}>
                    {it.praça}
                  </span>
                  <span className="text-foreground font-medium">{it.name}</span>
                  {it.fireOnDemand && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 text-[9px] font-bold">
                      Fire on Demand
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground mr-2">{it.prepMinutes} min</span>
                  <span className="font-bold text-foreground">R$ {it.price.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Animação do Pipeline de Sincronização por Evento Interno */}
          {syncStep > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Pipeline de Sincronização por Evento Interno Ativo:
              </span>
              <div className="space-y-1.5 pl-1">
                <div className={`flex items-center gap-2 ${syncStep >= 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1. Evento Interno <code className="text-[10px] bg-background px-1 py-0.5 rounded">zuma_internal_order_event</code> emitido em memória e cross-tab</span>
                </div>
                <div className={`flex items-center gap-2 ${syncStep >= 2 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>2. KDS 2.0: Quente entra em preparo; Sushibar sincronizado via Fire-on-Demand</span>
                </div>
                <div className={`flex items-center gap-2 ${syncStep >= 3 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>3. Kardex Salmão: Baixa paramétrica (58% filé nobre, 15% raspas)</span>
                </div>
                <div className={`flex items-center gap-2 ${syncStep >= 4 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>4. Mapa de Calor 7x11: Injetado na matriz de demanda da hora atual</span>
                </div>
                <div className={`flex items-center gap-2 ${syncStep >= 5 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>5. Spooler Térmico: Impressão pronta nas impressoras de boqueta</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="px-5 py-3.5 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {syncStep === 5 ? (
            <div className="w-full flex items-center justify-between gap-2">
              <button
                onClick={() => { onClose(); setLocation("/kds-v2"); }}
                className="flex-1 py-2 px-3 bg-orange-600 text-white rounded-xl font-bold text-xs hover:bg-orange-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Ver no KDS 2.0</span>
              </button>
              <button
                onClick={() => { onClose(); setLocation("/mapa-de-calor"); }}
                className="flex-1 py-2 px-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Ver no Mapa 7x11</span>
              </button>
              <button
                onClick={() => { setSyncStep(0); }}
                className="py-2 px-3 bg-muted border border-border text-foreground rounded-xl font-bold text-xs hover:bg-muted/80 transition cursor-pointer"
              >
                Outro
              </button>
            </div>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">
                Dispara atualização instantânea em todas as abas abertas
              </span>
              <button
                disabled={isProcessing}
                onClick={handleSimular}
                className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>{isProcessing ? "Sincronizando..." : "Disparar Pedido no Sistema 360°"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
