import fs from "fs";

let content = fs.readFileSync("/home/ubuntu/zuma/client/src/components/erp/ErpFechamentoTurno.tsx", "utf-8");

// 1. Adicionar useMemo no import do react caso não esteja
if (!content.includes("useMemo")) {
  content = content.replace(
    `import React, { useState } from "react";`,
    `import React, { useState, useMemo } from "react";`
  );
}

// 2. Adicionar Search e Filter nos imports de lucide-react
if (!content.includes("Filter,")) {
  content = content.replace(
    `import {`,
    `import {\n  Search,\n  Filter,`
  );
}

// 3. Adicionar estados de busca e filtro de pagamentos
if (!content.includes("buscaLancamento")) {
  content = content.replace(
    `const [mostrarCalculadora, setMostrarCalculadora] = useState(false);`,
    `const [mostrarCalculadora, setMostrarCalculadora] = useState(true); // Default aberta para agilidade operacional\n  const [buscaLancamento, setBuscaLancamento] = useState("");\n  const [filtroMeioLancamento, setFiltroMeioLancamento] = useState("todos");`
  );
}

// 4. Inserir useMemo de pagamentosFiltrados
const pagamentosFiltradosBlock = `
  // Filtro inteligente de pagamentos na Aba 3
  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter((p: any) => {
      if (filtroMeioLancamento !== "todos") {
        const forma = (p.forma || "").toLowerCase();
        if (filtroMeioLancamento === "cartao_credito" && !forma.includes("credito")) return false;
        if (filtroMeioLancamento === "cartao_debito" && !forma.includes("debito")) return false;
        if (filtroMeioLancamento === "pix" && !forma.includes("pix")) return false;
        if (filtroMeioLancamento === "dinheiro" && !forma.includes("dinheiro")) return false;
        if (filtroMeioLancamento === "convenio_agro" && !forma.includes("convenio")) return false;
      }
      if (buscaLancamento.trim()) {
        const q = buscaLancamento.toLowerCase();
        const nsu = (p.nsu || p.id || "").toLowerCase();
        const cliente = (p.cliente || "").toLowerCase();
        const canal = (p.canal || "").toLowerCase();
        return nsu.includes(q) || cliente.includes(q) || canal.includes(q);
      }
      return true;
    });
  }, [pagamentos, filtroMeioLancamento, buscaLancamento]);
`;

if (!content.includes("pagamentosFiltrados")) {
  content = content.replace(
    `const pagamentos = data?.pagamentos || [];`,
    `const pagamentos = data?.pagamentos || [];\n${pagamentosFiltradosBlock}`
  );
}

// 5. Atualizar a Aba 3 para usar busca, filtros e pagamentosFiltrados
const oldAba3Header = `<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[var(--ink)]">
                  Conferência &amp; Edição de Lançamentos de Pagamento
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Permite corrigir a forma de pagamento (ex: de Pix para Débito/Crédito) ou retificar valores incorretos com recálculo automático no caixa e no ERP
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface2)] border border-[var(--line)] font-bold text-[var(--muted)]">
                {pagamentos.length} transações registradas
              </span>
            </div>`;

const newAba3Header = `<div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Conferência &amp; Edição de Lançamentos de Pagamento
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Permite corrigir a forma de pagamento (ex: de Pix para Débito/Crédito) com recálculo automático de gaveta, taxas Stone/Cielo e Contas a Receber
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface2)] border border-[var(--line)] font-bold text-[var(--ink)]">
                    {pagamentosFiltrados.length} de {pagamentos.length} transações
                  </span>
                </div>
              </div>

              {/* BARRA DE FILTROS E BUSCA RÁPIDA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por mesa, cliente ou NSU..."
                    value={buscaLancamento}
                    onChange={(e) => setBuscaLancamento(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-hidden"
                  />
                  {buscaLancamento && (
                    <button
                      onClick={() => setBuscaLancamento("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* CHIPS DE FORMA DE PAGAMENTO */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-bold">
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "cartao_credito", label: "Crédito Stone" },
                    { id: "cartao_debito", label: "Débito Stone" },
                    { id: "pix", label: "Pix Sicredi" },
                    { id: "dinheiro", label: "Dinheiro" },
                    { id: "convenio_agro", label: "Convênio Agro" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setFiltroMeioLancamento(chip.id)}
                      className={\`px-3 py-1.5 rounded-xl border whitespace-nowrap transition cursor-pointer \${
                        filtroMeioLancamento === chip.id
                          ? "bg-orange-600 text-white border-orange-500 shadow-xs"
                          : "bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }\`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>`;

if (content.includes(oldAba3Header)) {
  content = content.replace(oldAba3Header, newAba3Header);
} else {
  console.log("Não encontrou oldAba3Header");
}

// Substituir map de pagamentos por pagamentosFiltrados na tabela da Aba 3
content = content.replace(
  `{pagamentos.length === 0 ? (`,
  `{pagamentosFiltrados.length === 0 ? (`
);
content = content.replace(
  `pagamentos.map((p: any) => (`,
  `pagamentosFiltrados.map((p: any) => (`
);

// 6. Enriquecer a Calculadora de Cédulas no Modal Fechar
const oldCalcBlock = `{mostrarCalculadora && (
                <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">
                    Contagem por Cédulas &amp; Moedas
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[
                      { key: "c200", label: "R$ 200" },
                      { key: "c100", label: "R$ 100" },
                      { key: "c50", label: "R$ 50" },
                      { key: "c20", label: "R$ 20" },
                      { key: "c10", label: "R$ 10" },
                      { key: "c5", label: "R$ 5" },
                      { key: "c2", label: "R$ 2" },
                    ].map((item) => (
                      <div key={item.key}>
                        <label className="text-[10px] text-[var(--muted)] block">{item.label}</label>
                        <input
                          type="number"
                          min="0"
                          value={cedulas[item.key]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const novo = { ...cedulas, [item.key]: val };
                            setCedulas(novo);
                            recalcularCedulas(novo);
                          }}
                          className="w-full p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-mono font-bold text-center"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] text-[var(--muted)] block">Moedas (R$)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={cedulas.moedas}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const novo = { ...cedulas, moedas: val };
                          setCedulas(novo);
                          recalcularCedulas(novo);
                        }}
                        className="w-full p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-mono font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              )}`;

const newCalcBlock = `{mostrarCalculadora && (
                <div className="p-3.5 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                      Calculadora Rápida de Cédulas &amp; Moedas
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const zerado = { c200: 0, c100: 0, c50: 0, c20: 0, c10: 0, c5: 0, c2: 0, moedas: 0 };
                        setCedulas(zerado);
                        recalcularCedulas(zerado);
                      }}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      Zerar Contagem
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: "c200", label: "Cédula R$ 200", valor: 200 },
                      { key: "c100", label: "Cédula R$ 100", valor: 100 },
                      { key: "c50", label: "Cédula R$ 50", valor: 50 },
                      { key: "c20", label: "Cédula R$ 20", valor: 20 },
                      { key: "c10", label: "Cédula R$ 10", valor: 10 },
                      { key: "c5", label: "Cédula R$ 5", valor: 5 },
                      { key: "c2", label: "Cédula R$ 2", valor: 2 },
                    ].map((item) => {
                      const count = cedulas[item.key] || 0;
                      const subtotal = count * item.valor;
                      return (
                        <div key={item.key} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-[var(--ink)]">{item.label}</span>
                            <span className="font-mono text-emerald-600 font-bold">R$ {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const novo = { ...cedulas, [item.key]: Math.max(0, count - 1) };
                                setCedulas(novo);
                                recalcularCedulas(novo);
                              }}
                              className="w-6 h-6 rounded-md bg-[var(--surface2)] border border-[var(--line)] font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const novo = { ...cedulas, [item.key]: val };
                                setCedulas(novo);
                                recalcularCedulas(novo);
                              }}
                              className="flex-1 p-1 rounded-md bg-[var(--surface)] border border-[var(--line)] font-mono font-bold text-center text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const novo = { ...cedulas, [item.key]: count + 1 };
                                setCedulas(novo);
                                recalcularCedulas(novo);
                              }}
                              className="w-6 h-6 rounded-md bg-[var(--surface2)] border border-[var(--line)] font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* MOEDAS EM GERAL */}
                    <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[var(--ink)]">Moedas / Troco</span>
                        <span className="font-mono text-emerald-600 font-bold">R$ {(cedulas.moedas || 0).toFixed(2)}</span>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        placeholder="R$ 0.00"
                        value={cedulas.moedas || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const novo = { ...cedulas, moedas: val };
                          setCedulas(novo);
                          recalcularCedulas(novo);
                        }}
                        className="w-full p-1 rounded-md bg-[var(--surface)] border border-[var(--line)] font-mono font-bold text-center text-xs"
                      />
                    </div>
                  </div>

                  {/* DIAGNÓSTICO IMEDIATO DO STATUS NA CALCULADORA */}
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Esperado do Sistema:</span>
                      <strong className="text-[var(--ink)]">R$ {(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Contado Agora:</span>
                      <strong className="text-orange-600 font-black">
                        R$ {(typeof dinheiroContadoInput === "number" ? dinheiroContadoInput : 0).toFixed(2)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--muted)] uppercase block">Status da Gaveta:</span>
                      {(() => {
                        const contado = typeof dinheiroContadoInput === "number" ? dinheiroContadoInput : 0;
                        const diff = contado - (resumoGaveta?.saldoEsperadoGaveta || 0);
                        if (Math.abs(diff) === 0) {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">✓ 100% Batido</span>;
                        } else if (Math.abs(diff) <= 2.0) {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">✓ Tolerância (R$ {diff.toFixed(2)})</span>;
                        } else {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600">⚠ Quebra: {diff > 0 ? "+" : ""}R$ {diff.toFixed(2)}</span>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}`;

if (content.includes(oldCalcBlock)) {
  content = content.replace(oldCalcBlock, newCalcBlock);
} else {
  console.log("Não encontrou oldCalcBlock");
}

fs.writeFileSync("/home/ubuntu/zuma/client/src/components/erp/ErpFechamentoTurno.tsx", content, "utf-8");
console.log("ErpFechamentoTurno.tsx UX enriquecida com sucesso!");
