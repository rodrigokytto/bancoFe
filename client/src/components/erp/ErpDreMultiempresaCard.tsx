import React, { useState } from "react";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Download
} from "lucide-react";
import { formatBrl } from "@shared/zumaData";
import { toast } from "sonner";

export const ErpDreMultiempresaCard: React.FC = () => {
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("consolidado");

  const unidades = [
    {
      id: "zuma_gastro",
      nome: "Zuma Gastronomia Oriental",
      cnpj: "36.296.848/0001-57",
      cidade: "Tangará da Serra - MT",
      receitaBruta: 184500.0,
      deducoes: 13099.5,
      cmv: 52420.0,
      custosFixos: 74405.5,
      ebitda: 44575.0,
      margemEbitda: 24.2,
      cor: "bg-[var(--salmon)]",
      badgeCor: "bg-[var(--salmon)]/10 text-[var(--salmon)] border-[var(--salmon)]/20"
    },
    {
      id: "zuma_moda",
      nome: "Zuma Concept Store & Moda",
      cnpj: "36.296.848/0002-38",
      cidade: "Tangará da Serra - MT",
      receitaBruta: 78900.0,
      deducoes: 4734.0,
      cmv: 28404.0,
      custosFixos: 26800.0,
      ebitda: 18962.0,
      margemEbitda: 24.0,
      cor: "bg-purple-600",
      badgeCor: "bg-purple-500/10 text-purple-600 border-purple-500/20"
    },
    {
      id: "concreto_serrano",
      nome: "Concreto Serrano & Obras",
      cnpj: "29.400.122/0001-18",
      cidade: "Tangará da Serra - MT",
      receitaBruta: 312000.0,
      deducoes: 28080.0,
      cmv: 140400.0,
      custosFixos: 84200.0,
      ebitda: 59320.0,
      margemEbitda: 19.0,
      cor: "bg-stone-600",
      badgeCor: "bg-stone-500/10 text-stone-600 border-stone-500/20"
    },
    {
      id: "kytto_agro",
      nome: "Kytto Agro, Silos & Grãos MT",
      cnpj: "38.102.441/0001-90",
      cidade: "Tangará da Serra - MT",
      receitaBruta: 445000.0,
      deducoes: 22250.0,
      cmv: 244750.0,
      custosFixos: 71200.0,
      ebitda: 106800.0,
      margemEbitda: 24.0,
      cor: "bg-emerald-600",
      badgeCor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    }
  ];

  // Cálculos consolidados
  const totalReceitaBruta = unidades.reduce((acc, u) => acc + u.receitaBruta, 0);
  const totalDeducoes = unidades.reduce((acc, u) => acc + u.deducoes, 0);
  const totalCmv = unidades.reduce((acc, u) => acc + u.cmv, 0);
  const totalCustosFixos = unidades.reduce((acc, u) => acc + u.custosFixos, 0);
  const totalEbitda = unidades.reduce((acc, u) => acc + u.ebitda, 0);
  const margemEbitdaConsolidada = (totalEbitda / totalReceitaBruta) * 100;

  const dadosExibidos =
    empresaFiltro === "consolidado"
      ? {
          nome: "Holding Kytto Participações (Consolidado Multiempresa)",
          receitaBruta: totalReceitaBruta,
          deducoes: totalDeducoes,
          cmv: totalCmv,
          custosFixos: totalCustosFixos,
          ebitda: totalEbitda,
          margemEbitda: margemEbitdaConsolidada
        }
      : unidades.find((u) => u.id === empresaFiltro)!;

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
      {/* Topo do Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
              <span>DRE Gerencial Consolidado &amp; Centros de Custos Holding</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                Multi-Tenant
              </span>
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Visão corporativa integrada de Gastronomia, Moda, Concreto e Agro Tangará
            </p>
          </div>
        </div>

        {/* Seletor de Empresa / Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setEmpresaFiltro("consolidado")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              empresaFiltro === "consolidado"
                ? "bg-purple-600 text-white shadow-xs"
                : "border border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            🌐 Consolidado Holding
          </button>
          {unidades.map((u) => (
            <button
              key={u.id}
              onClick={() => setEmpresaFiltro(u.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                empresaFiltro === u.id
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "border border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {u.nome.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards da Visão Selecionada */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
          <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Receita Bruta</span>
          <div className="text-lg font-black font-mono-nums text-[var(--ink)] mt-0.5">
            {formatBrl(dadosExibidos.receitaBruta)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +16.8% MoM
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
          <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">CMV / Custos Diretos</span>
          <div className="text-lg font-black font-mono-nums text-red-600 mt-0.5">
            {formatBrl(dadosExibidos.cmv)}
          </div>
          <span className="text-[10px] text-[var(--muted)] font-mono mt-0.5 block">
            {((dadosExibidos.cmv / dadosExibidos.receitaBruta) * 100).toFixed(1)}% da receita
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]">
          <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Custos Fixos &amp; Folha</span>
          <div className="text-lg font-black font-mono-nums text-[var(--ink)] mt-0.5">
            {formatBrl(dadosExibidos.custosFixos)}
          </div>
          <span className="text-[10px] text-[var(--muted)] font-mono mt-0.5 block">
            {((dadosExibidos.custosFixos / dadosExibidos.receitaBruta) * 100).toFixed(1)}% da receita
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
            EBITDA Operacional
          </span>
          <div className="text-lg font-black font-mono-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
            {formatBrl(dadosExibidos.ebitda)}
          </div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 font-mono mt-0.5 block">
            Margem EBITDA: {dadosExibidos.margemEbitda.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Breakdown Comparativo das Unidades de Negócio */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
          <span>Participação no Faturamento Consolidado da Holding ({formatBrl(totalReceitaBruta)}):</span>
          <span className="text-[10px] text-[var(--muted)] font-mono">100% Auditado</span>
        </div>

        {/* Barra de Progresso Segmentada */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200">
          {unidades.map((u) => {
            const pct = (u.receitaBruta / totalReceitaBruta) * 100;
            return (
              <div
                key={u.id}
                style={{ width: `${pct}%` }}
                className={`${u.cor} transition-all`}
                title={`${u.nome}: ${formatBrl(u.receitaBruta)} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legenda das Unidades */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs">
          {unidades.map((u) => {
            const pct = (u.receitaBruta / totalReceitaBruta) * 100;
            return (
              <div key={u.id} className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[var(--ink)] truncate max-w-[120px]">
                    {u.nome}
                  </span>
                  <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--line)]">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs font-black font-mono-nums text-[var(--ink)]">
                  {formatBrl(u.receitaBruta)}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium">
                  EBITDA: {formatBrl(u.ebitda)} ({u.margemEbitda}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
