import React, { useState } from "react";
import { 
  Bike, 
  X, 
  CheckCircle2, 
  DollarSign, 
  Receipt, 
  Printer, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Phone,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";

interface AcertoMotoboyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettled?: () => void;
}

export const AcertoMotoboyModal: React.FC<AcertoMotoboyModalProps> = ({
  isOpen,
  onClose,
  onSettled
}) => {
  const motoboysQuery = trpc.zuma.listMotoboys.useQuery(undefined, { enabled: isOpen });
  const utils = trpc.useUtils();

  const [selectedMotoboyId, setSelectedMotoboyId] = useState<string>("moto-1");
  const [diariaFixa, setDiariaFixa] = useState<number>(50.0);
  const [taxaPorEntrega, setTaxaPorEntrega] = useState<number>(8.0);
  const [dinheiroColetadoRua, setDinheiroColetadoRua] = useState<number>(180.0);
  const [adiantamentoTurno, setAdiantamentoTurno] = useState<number>(20.0);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const settleMutation = trpc.zuma.settleMotoboyShift.useMutation({
    onSuccess: (data) => {
      toast.success("Acerto de turno do entregador liquidado com sucesso!");
      utils.zuma.listMotoboys.invalidate();
      if (onSettled) onSettled();
      setIsReceiptOpen(true);
    },
    onError: (err) => {
      toast.error(`Erro ao liquidar acerto: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  const motoboys = motoboysQuery.data || [
    {
      id: "moto-1",
      name: "Marcão Entregador",
      phone: "(65) 99981-4411",
      plate: "QBL-4E21 (CG 160)",
      status: "disponivel",
      currentOrdersCount: 0,
      completedToday: 9,
      accumulatedDeliveryFees: 72,
      shiftSettled: false
    },
    {
      id: "moto-2",
      name: "Cleber Silva",
      phone: "(65) 99655-3322",
      plate: "RAZ-8910 (Factor 150)",
      status: "disponivel",
      currentOrdersCount: 0,
      completedToday: 7,
      accumulatedDeliveryFees: 56,
      shiftSettled: false
    },
    {
      id: "moto-3",
      name: "Tiago Rodrigues",
      phone: "(65) 99912-7788",
      plate: "NTX-5531 (Bros 160)",
      status: "em_rota",
      currentOrdersCount: 2,
      completedToday: 11,
      accumulatedDeliveryFees: 88,
      shiftSettled: false
    }
  ];

  const activeMotoboy = motoboys.find(m => m.id === selectedMotoboyId) || motoboys[0];

  const entregasRealizadas = activeMotoboy.completedToday || 8;
  const totalTaxas = entregasRealizadas * taxaPorEntrega;
  const totalDevidoAoMotoboy = totalTaxas + diariaFixa - adiantamentoTurno;
  // Se o motoboy recebeu dinheiro na rua, calcula o saldo final:
  // Se positivo: Motoboy DEVE repassar a diferença ao caixa.
  // Se negativo: Caixa DEVE pagar ao motoboy.
  const saldoFinalRepasse = dinheiroColetadoRua - totalDevidoAoMotoboy;

  const handleConfirmSettle = () => {
    settleMutation.mutate({ motoboyId: activeMotoboy.id });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--ink)] text-white rounded-lg">
              <Bike className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Fechamento Operacional
                </span>
                <span className="text-xs text-[var(--muted)]">Módulo Saipos Parity +</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[var(--ink)] mt-0.5">
                Acerto de Turno da Frota de Motoboys
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Lado Esquerdo: Seleção do Entregador */}
          <div className="md:col-span-5 space-y-3">
            <label className="block text-xs font-bold text-[var(--ink)]">
              Selecione o Entregador:
            </label>
            <div className="space-y-2">
              {motoboys.map(m => {
                const isSelected = m.id === activeMotoboy.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMotoboyId(m.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[var(--surface)] border-[var(--salmon)] ring-2 ring-[var(--salmon)]/30 shadow-xs"
                        : "bg-[var(--surface2)] border-[var(--line)] hover:border-[var(--ink)]"
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-[var(--ink)] block">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-[var(--muted)] block">
                        {m.plate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/10 text-amber-700">
                        {m.completedToday} entregas
                      </span>
                      <span className="text-[10px] font-bold text-[var(--muted)] block mt-0.5">
                        {m.shiftSettled ? "Liquidado" : "Pendente"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-[var(--surface2)] border border-[var(--line)] rounded-xl space-y-2 text-xs">
              <span className="font-bold text-[var(--ink)] block">Parâmetros do Acerto:</span>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Diária Fixa Noturna:</span>
                <div className="flex items-center gap-1">
                  <span>R$</span>
                  <input
                    type="number"
                    value={diariaFixa}
                    onChange={e => setDiariaFixa(parseFloat(e.target.value) || 0)}
                    className="w-16 px-1 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono font-bold text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Taxa Média p/ Entrega:</span>
                <div className="flex items-center gap-1">
                  <span>R$</span>
                  <input
                    type="number"
                    value={taxaPorEntrega}
                    onChange={e => setTaxaPorEntrega(parseFloat(e.target.value) || 0)}
                    className="w-16 px-1 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono font-bold text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Adiantamentos (Vales):</span>
                <div className="flex items-center gap-1">
                  <span>R$</span>
                  <input
                    type="number"
                    value={adiantamentoTurno}
                    onChange={e => setAdiantamentoTurno(parseFloat(e.target.value) || 0)}
                    className="w-16 px-1 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono font-bold text-right text-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Fechamento Contábil do Motoboy */}
          <div className="md:col-span-7 bg-[var(--surface2)] p-4 rounded-xl border border-[var(--line)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <div>
                <h4 className="font-black text-sm text-[var(--ink)]">
                  Extrato do Turno · {activeMotoboy.name}
                </h4>
                <p className="text-[11px] text-[var(--muted)]">{activeMotoboy.plate} · Tangará da Serra</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded">
                Turno Jantar
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-lg space-y-1.5">
                <span className="font-bold text-[var(--muted)] uppercase text-[10px] block">
                  1. Dinheiro Vivo Recolhido na Rua
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink)]">Total pago em espécie pelos clientes:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">R$</span>
                    <input
                      type="number"
                      value={dinheiroColetadoRua}
                      onChange={e => setDinheiroColetadoRua(parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-[var(--surface2)] border border-[var(--line)] rounded font-mono font-bold text-sm text-right text-amber-600"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-lg space-y-1">
                <span className="font-bold text-[var(--muted)] uppercase text-[10px] block">
                  2. Remuneração Devida ao Entregador
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--muted)]">• Diária fixa:</span>
                  <span className="font-bold font-mono text-[var(--ink)]">{formatBrl(diariaFixa)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--muted)]">• Taxas ({entregasRealizadas} entregas x {formatBrl(taxaPorEntrega)}):</span>
                  <span className="font-bold font-mono text-[var(--ink)]">{formatBrl(totalTaxas)}</span>
                </div>
                {adiantamentoTurno > 0 && (
                  <div className="flex justify-between text-xs text-red-500">
                    <span>• (-) Vales/Adiantamentos:</span>
                    <span className="font-bold font-mono">-{formatBrl(adiantamentoTurno)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-[var(--line)]">
                  <span>Total a Pagar ao Motoboy:</span>
                  <span className="font-mono text-[var(--good)]">{formatBrl(totalDevidoAoMotoboy)}</span>
                </div>
              </div>

              {/* Saldo Líquido do Acerto */}
              <div className={`p-4 rounded-xl border text-center ${
                saldoFinalRepasse >= 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {saldoFinalRepasse >= 0 ? "Motoboy deve Repassar ao Caixa:" : "Caixa deve Pagar ao Motoboy:"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono my-1">
                  {formatBrl(Math.abs(saldoFinalRepasse))}
                </div>
                <p className="text-[11px] opacity-80">
                  {saldoFinalRepasse >= 0 
                    ? "O entregador recolheu mais dinheiro vivo na rua do que sua diária/comissões."
                    : "As comissões e diária superaram o dinheiro recebido na rua."}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleConfirmSettle}
                disabled={settleMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-[var(--salmon)] hover:bg-[#d04530] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{settleMutation.isPending ? "Liquidando..." : "Finalizar Acerto & Liquidar"}</span>
              </button>

              <button
                onClick={() => {
                  toast.success("Recibo térmico de acerto impresso!");
                  window.print();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Recibo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
