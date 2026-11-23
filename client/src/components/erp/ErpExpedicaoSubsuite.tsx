import React, { useState } from "react";
import {
  Truck,
  PackageCheck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Search,
  Plus,
  Navigation,
  Check,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

export interface RemessaExpedicao {
  id: string;
  pedidoOrigem: string;
  cliente: string;
  endereco: string;
  bairro: string;
  entregador: string;
  valorPedido: number;
  tipoPagamento: "Pago no App (Pix)" | "Pagar na Entrega (Cartão/Dinheiro)";
  status: "Conferência (Picking)" | "Em Rota (Expedido)" | "Entregue com Sucesso";
  horarioSaida: string;
}

const REMESSAS_INICIAIS: RemessaExpedicao[] = [
  {
    id: "EXP-901",
    pedidoOrigem: "#PED-4491",
    cliente: "Dr. Marcelo Takahashi",
    endereco: "Rua Antônio Hortolani, 890 - Apto 402",
    bairro: "Centro",
    entregador: "Marcos Entregador (Moto 02)",
    valorPedido: 348.80,
    tipoPagamento: "Pago no App (Pix)",
    status: "Em Rota (Expedido)",
    horarioSaida: "20:12",
  },
  {
    id: "EXP-902",
    pedidoOrigem: "#PED-4492",
    cliente: "Juliana Mendes",
    endereco: "Av. Brasil, 1420 - Ed. Tangará Tower",
    bairro: "Jardim Europa",
    entregador: "Rafael Silva (Moto 04)",
    valorPedido: 189.50,
    tipoPagamento: "Pagar na Entrega (Cartão/Dinheiro)",
    status: "Em Rota (Expedido)",
    horarioSaida: "20:18",
  },
  {
    id: "EXP-903",
    pedidoOrigem: "#PED-4493",
    cliente: "Camila Rodrigues",
    endereco: "Rua 24, nº 310",
    bairro: "Vila Alta",
    entregador: "Pendente Alocação",
    valorPedido: 420.00,
    tipoPagamento: "Pago no App (Pix)",
    status: "Conferência (Picking)",
    horarioSaida: "-",
  },
];

export const ErpExpedicaoSubsuite: React.FC = () => {
  const [remessas, setRemessas] = useState<RemessaExpedicao[]>(REMESSAS_INICIAIS);

  const despacharRemessa = (id: string) => {
    setRemessas(remessas.map(r => {
      if (r.id === id) {
        toast.success(`Remessa ${r.id} expedida em rota com sucesso! Notificação enviada via WhatsApp.`);
        return { ...r, status: "Em Rota (Expedido)", horarioSaida: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      return r;
    }));
  };

  const confirmarEntrega = (id: string) => {
    setRemessas(remessas.map(r => {
      if (r.id === id) {
        toast.success(`Entrega da remessa ${r.id} confirmada com assinatura digital!`);
        return { ...r, status: "Entregue com Sucesso" };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Expedição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-stone-900 to-emerald-950/30 border border-teal-500/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-100">Expedição, Logística & Romaneios</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Roteirização Tangará da Serra
              </span>
            </div>
            <p className="text-sm text-stone-400">
              Conferência de pedidos (picking/packing), despacho de motoboys e comprovante de entrega digital
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.success("Rotas otimizadas com IA Zumi para reduzir tempo em 18%!")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-950/40 transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          Otimizar Roteiros com IA
        </button>
      </div>

      {/* Grid de Remessas */}
      <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-100 text-base">Controle de Saídas & Rotas Ativas</h3>
          <span className="text-xs text-stone-500">{remessas.length} despachos hoje</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {remessas.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-teal-400">{r.id}</span>
                  <div className="font-bold text-stone-100 text-sm mt-0.5">{r.cliente}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  r.status === "Entregue com Sucesso"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : r.status === "Em Rota (Expedido)"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {r.status}
                </span>
              </div>

              <div className="text-xs text-stone-400 space-y-1">
                <div className="flex items-start gap-1 text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                  <span>{r.endereco} · <strong className="text-stone-200">{r.bairro}</strong></span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Entregador:</span>
                  <span className="font-semibold text-stone-200">{r.entregador}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor do Pedido:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatBrl(r.valorPedido)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-between gap-2">
                {r.status === "Conferência (Picking)" ? (
                  <button
                    onClick={() => despacharRemessa(r.id)}
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Liberar Saída da Moto
                  </button>
                ) : r.status === "Em Rota (Expedido)" ? (
                  <button
                    onClick={() => confirmarEntrega(r.id)}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Confirmar Entrega
                  </button>
                ) : (
                  <div className="w-full text-center py-1 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluído às {r.horarioSaida}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
