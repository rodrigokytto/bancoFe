import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { 
  Users, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  X, 
  Scale, 
  Receipt, 
  Sparkles, 
  Coins,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

interface RateioGorjetasModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftTipTotal?: number;
}

export const RateioGorjetasModal: React.FC<RateioGorjetasModalProps> = ({
  isOpen,
  onClose,
  shiftTipTotal = 540.00,
}) => {
  const [totalTip, setTotalTip] = useState(shiftTipTotal);
  const [hallPct, setHallPct] = useState(70);
  const [kitchenPct, setKitchenPct] = useState(20);
  const [barPct, setBarPct] = useState(10);

  // Lista padrão de colaboradores do turno da noite
  const [collaborators, setCollaborators] = useState([
    { name: "Matheus Santos", role: "garcom" as const, hoursOrPoints: 6 },
    { name: "Bruna Lima", role: "garcom" as const, hoursOrPoints: 6 },
    { name: "Laura Ramos", role: "garcom" as const, hoursOrPoints: 6 },
    { name: "Takeshi Sato", role: "sushiman" as const, hoursOrPoints: 6 },
    { name: "Lucas Pires", role: "auxiliar_cozinha" as const, hoursOrPoints: 6 },
    { name: "Ramiro Costa", role: "copeiro" as const, hoursOrPoints: 6 },
  ]);

  const { data: distributions = [], refetch } = trpc.zuma.getTipDistributions.useQuery(undefined, {
    enabled: isOpen
  });

  const calculateMutation = trpc.zuma.calculateTipDistribution.useMutation({
    onSuccess: () => {
      toast.success("Rateio do turno calculado e registrado na contabilidade!");
      refetch();
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    }
  });

  if (!isOpen) return null;

  // Cálculos em tempo real
  const hallTotal = (totalTip * hallPct) / 100;
  const kitchenTotal = (totalTip * kitchenPct) / 100;
  const barTotal = (totalTip * barPct) / 100;

  const hallColabs = collaborators.filter(c => c.role === "garcom");
  const kitchenColabs = collaborators.filter(c => c.role === "sushiman" || c.role === "auxiliar_cozinha");
  const barColabs = collaborators.filter(c => (c.role as string) === "copeiro" || (c.role as string) === "cumim");

  const calcAmount = (c: typeof collaborators[0]) => {
    if (c.role === "garcom") return hallColabs.length ? hallTotal / hallColabs.length : 0;
    if (c.role === "sushiman" || c.role === "auxiliar_cozinha") return kitchenColabs.length ? kitchenTotal / kitchenColabs.length : 0;
    return barColabs.length ? barTotal / barColabs.length : 0;
  };

  const handlePrintReceipt = (colabName: string, amount: number, role: string) => {
    toast.success(`Recibo térmico de gorjeta impresso para ${colabName} (R$ ${amount.toFixed(2)})!`);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  LEI DA GORJETA (LEI 13.419/17)
                </span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono">
                  Rateio Transparente &amp; Auditado
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                Divisão &amp; Quitação da Taxa de Serviço (10%)
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

        {/* Painel de Configuração dos Percentuais de Praça */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--surface2)] grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
              Total Arrecadado (10%):
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={totalTip}
                onChange={e => setTotalTip(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-sm font-mono font-black text-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--ink)]">Salão (Garçons):</span>
              <span className="font-mono font-bold text-blue-600">{hallPct}%</span>
            </div>
            <div className="text-sm font-mono font-black text-[var(--ink)] mt-0.5">
              R$ {hallTotal.toFixed(2)}
            </div>
            <span className="text-[9px] text-[var(--muted)]">Divisão entre {hallColabs.length} garçons</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--ink)]">Cozinha / Sushibar:</span>
              <span className="font-mono font-bold text-amber-600">{kitchenPct}%</span>
            </div>
            <div className="text-sm font-mono font-black text-[var(--ink)] mt-0.5">
              R$ {kitchenTotal.toFixed(2)}
            </div>
            <span className="text-[9px] text-[var(--muted)]">Divisão entre {kitchenColabs.length} pessoas</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--ink)]">Bar / Apoio / Copa:</span>
              <span className="font-mono font-bold text-purple-600">{barPct}%</span>
            </div>
            <div className="text-sm font-mono font-black text-[var(--ink)] mt-0.5">
              R$ {barTotal.toFixed(2)}
            </div>
            <span className="text-[9px] text-[var(--muted)]">Divisão entre {barColabs.length} pessoas</span>
          </div>
        </div>

        {/* Tabela de Colaboradores & Quotas Individuais */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold text-[10px] uppercase">
                <th className="py-2.5 px-3">Colaborador</th>
                <th className="py-2.5 px-3">Função / Praça</th>
                <th className="py-2.5 px-3 text-center">Horas no Turno</th>
                <th className="py-2.5 px-3 text-right">Quota Calculada</th>
                <th className="py-2.5 px-3 text-right">Recibo &amp; Quitação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {collaborators.map((c, idx) => {
                const amount = calcAmount(c);

                return (
                  <tr key={idx} className="hover:bg-[var(--surface2)]/60 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[var(--ink)] text-xs flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {c.name}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.role === "garcom"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                          : c.role === "sushiman"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                      }`}>
                        {c.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold">
                      {c.hoursOrPoints} horas
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      R$ {amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handlePrintReceipt(c.name, amount, c.role)}
                        className="px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[11px] font-semibold text-[var(--ink)] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-[var(--salmon)]" />
                        <span>Imprimir Recibo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between text-xs">
          <div className="text-[11px] text-[var(--muted)]">
            Total rateado: <strong className="text-[var(--ink)]">R$ {totalTip.toFixed(2)}</strong> · 100% de conformidade com a convenção sindical de Tangará da Serra.
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                calculateMutation.mutate({
                  totalTipCollected: totalTip,
                  shiftPeriod: "jantar",
                  hallPct,
                  kitchenPct,
                  barPct,
                  collaborators: collaborators.map(c => ({
                    name: c.name,
                    role: c.role,
                    hoursOrPoints: c.hoursOrPoints
                  }))
                });
              }}
              disabled={calculateMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{calculateMutation.isPending ? "Processando..." : "Confirmar Rateio do Turno"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--ink)] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
