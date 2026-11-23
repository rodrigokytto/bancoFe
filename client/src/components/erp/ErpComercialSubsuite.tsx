import React, { useState } from "react";
import { Briefcase, Target, TrendingUp, DollarSign, Users, CheckCircle2, Plus, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";
import { ErpPlaybookAquisicao } from "./ErpPlaybookAquisicao";

const PROPOSTAS_B2B = [
  { id: "PROP-901", cliente: "Grupo Bom Futuro", valor: 38500.00, itens: "Buffet Japonês Completo para Confraternização 250 pessoas", status: "negociacao", probPct: 75, vendedor: "Mariana Alencar" },
  { id: "PROP-902", cliente: "Cooperativa Sicredi Tangará", valor: 14200.00, itens: "Coffee Break Corporativo + Rodízio Executivo 80 pessoas", status: "ganha", probPct: 100, vendedor: "Lucas Ribeiro" },
  { id: "PROP-903", cliente: "Hospital das Clínicas Tangará", valor: 9800.00, itens: "Contrato Mensal de Almoço de Plantão Médico", status: "proposta_enviada", probPct: 60, vendedor: "Mariana Alencar" },
  { id: "PROP-904", cliente: "Serrano Concreto & Engenharia", valor: 19400.00, itens: "Convenio Corporativo Mensal Alimentação Refeitório", status: "negociacao", probPct: 80, vendedor: "Lucas Ribeiro" },
];

export const ErpComercialSubsuite: React.FC = () => {
  const [comercialTab, setComercialTab] = useState<"playbook" | "propostas">("playbook");

  return (
    <div className="space-y-4">
      {/* Seletor Superior de Modo */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setComercialTab("playbook")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            comercialTab === "playbook"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>🎯 Playbook Aquisição 40 Clientes (Go-to-Market)</span>
        </button>

        <button
          onClick={() => setComercialTab("propostas")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            comercialTab === "propostas"
              ? "bg-[var(--ink)] text-white shadow-xs"
              : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Funil de Propostas Corporativas B2B ({PROPOSTAS_B2B.length})</span>
        </button>
      </div>

      {comercialTab === "playbook" ? (
        <ErpPlaybookAquisicao />
      ) : (
        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                Vendas Corporativas &amp; B2B • Kytto Comercial
              </span>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
                Funil de Vendas, Propostas Corporativas &amp; Metas de Vendedores
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Gestão de contratos empresariais, propostas de buffet para eventos corporativos e comissões do time de vendas.
              </p>
            </div>

            <button
              onClick={() => toast.success("Nova proposta comercial gerada em PDF!")}
              className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Proposta B2B
            </button>
          </div>

          {/* Funil de Vendas */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--ink)] block">Propostas Comerciais no Funil:</span>
            <div className="space-y-2">
              {PROPOSTAS_B2B.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="font-mono text-[var(--salmon)]">{p.id}</b>
                      <b className="text-sm text-[var(--ink)]">{p.cliente}</b>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                        p.status === "ganha" ? "bg-emerald-600" : p.status === "negociacao" ? "bg-blue-600" : "bg-amber-600"
                      }`}>
                        {p.status.replace("_", " ")} ({p.probPct}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">{p.itens}</p>
                    <span className="text-[10px] text-[var(--muted)]">Vendedor: {p.vendedor}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono-nums font-black text-base text-[var(--ink)] block">
                      {formatBrl(p.valor)}
                    </span>
                    <button
                      onClick={() => toast.success(`Proposta ${p.id} aprovada!`)}
                      className="text-[10px] font-bold text-[var(--salmon)] hover:underline cursor-pointer"
                    >
                      Gerar Contrato &gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
