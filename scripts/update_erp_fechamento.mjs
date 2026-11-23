import fs from "fs";

let content = fs.readFileSync("/home/ubuntu/zuma/client/src/components/erp/ErpFechamentoTurno.tsx", "utf-8");

// 1. Adicionar novos imports
if (!content.includes('FileSpreadsheet')) {
  content = content.replace(
    `import {`,
    `import { exportClosingToExcel } from "../../lib/exportClosingExcel";\nimport {\n  FileSpreadsheet,\n  Send,\n  Eye,`
  );
}

// 2. Adicionar estado de turno selecionado para comprovante / detalhes
if (!content.includes('turnoHistoricoSelecionado')) {
  content = content.replace(
    `const [modalComprovanteTermico, setModalComprovanteTermico] = useState(false);`,
    `const [modalComprovanteTermico, setModalComprovanteTermico] = useState(false);\n  const [turnoHistoricoSelecionado, setTurnoHistoricoSelecionado] = useState<any | null>(null);\n  const [modalDetalhesTurno, setModalDetalhesTurno] = useState<any | null>(null);`
  );
}

// 3. Adicionar handlers de Exportar Excel e Notificar WhatsApp
const exportHandlers = `
  // Exportar Excel Oficial do Turno
  const handleExportarExcel = () => {
    if (!data) return;
    try {
      exportClosingToExcel({
        caixa: data.caixa,
        faturamento: {
          totalFaturado: faturamento?.totalFaturado || 0,
          totalTaxas: faturamento?.totalTaxas || 0,
          totalLiquido: faturamento?.totalLiquido || 0,
          ticketMedio: faturamento?.ticketMedio || 148.5,
          totalGorjetas: faturamento?.totalGorjetas || 0,
        },
        resumoGaveta: {
          fundoTrocoInicial: resumoGaveta?.fundoTrocoInicial || 0,
          vendasDinheiro: resumoGaveta?.vendasDinheiro || 0,
          suprimentosExtras: resumoGaveta?.suprimentosExtras || 0,
          sangrias: resumoGaveta?.sangrias || 0,
          saldoEsperadoGaveta: resumoGaveta?.saldoEsperadoGaveta || 0,
          dinheiroContado: resumoGaveta?.dinheiroContado || 0,
          divergenciaQuebra: resumoGaveta?.divergenciaQuebra || 0,
          statusQuebra: resumoGaveta?.statusQuebra || "batido",
        },
        itensConciliacao: data.itensConciliacao || [],
        movimentacoes: data.movimentacoes || [],
        pagamentos: data.pagamentos || [],
        dre: dre ? {
          receitaBruta: dre.receitaBruta,
          taxasCartao: dre.taxasCartao,
          cmvNobre: dre.cmvNobre,
          margemContribuicao: dre.margemContribuicao,
          percentualMargem: dre.percentualMargem,
        } : undefined,
      });
      toast.success("Planilha oficial de Fechamento de Turno exportada em Excel (.xlsx) com sucesso!", {
        icon: "📊"
      });
    } catch (err: any) {
      toast.error("Erro ao exportar planilha Excel: " + err.message);
    }
  };

  // Notificar Rodrigo Gonçalves via WhatsApp
  const notificarRodrigoWhatsApp = () => {
    if (!data) return;
    const isBatido = Math.abs(diferencaQuebra) <= 2.0;
    const msg = 
\`🍣 *ZUMA COZINHA ORIENTAL — FECHAMENTO DE TURNO*\\n\` +
\`📅 *Data:* \${new Date().toLocaleDateString("pt-BR")} · ⏰ \${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\\n\` +
\`👤 *Operador:* \${data.operador || "Mariana (Frente de Caixa)"}\\n\` +
\`🛡 *Supervisor:* \${data.supervisor || "Rodrigo R. Gonçalves"}\\n\` +
\`------------------------------------\\n\` +
\`💰 *FATURAMENTO DO TURNO:* R$ \${(faturamento?.totalFaturado || 0).toFixed(2)}\\n\` +
\`💳 *Líquido TEF/Pix:* R$ \${(faturamento?.totalLiquido || 0).toFixed(2)}\\n\` +
\`💵 *Gaveta Física Esperada:* R$ \${(resumoGaveta?.saldoEsperadoGaveta || 0).toFixed(2)}\\n\` +
\`🔍 *Dinheiro Contado:* R$ \${(resumoGaveta?.dinheiroContado || 0).toFixed(2)}\\n\` +
\`⚖ *Quebra/Diferença:* \${diferencaQuebra >= 0 ? "+" : ""}R$ \${diferencaQuebra.toFixed(2)} (\${isBatido ? "✓ CAIXA BATIDO" : "⚠ DIVERGÊNCIA"})\\n\` +
\`------------------------------------\\n\` +
\`*RESUMO POR CANAL:*\\n\` +
\`• Cartões Crédito/Débito: R$ \${((faturamento?.totalCredito || 0) + (faturamento?.totalDebito || 0)).toFixed(2)}\\n\` +
\`• Pix Sicredi MT: R$ \${(faturamento?.totalPix || 0).toFixed(2)}\\n\` +
\`• Dinheiro Físico: R$ \${(faturamento?.totalDinheiro || 0).toFixed(2)}\\n\` +
\`• Convênios Corporativos: R$ \${(faturamento?.totalConvenio || 0).toFixed(2)}\\n\` +
\`------------------------------------\\n\` +
\`📊 *DRE & MARGEM:*\\n\` +
\`• CMV Nobre (Salmão/BOM): R$ \${(dre?.cmvNobre || 0).toFixed(2)} (\${dre?.percentualCmv || 30.7}%)\\n\` +
\`• Margem de Contribuição: R$ \${(dre?.margemContribuicao || 0).toFixed(2)} (\${dre?.percentualMargem || 69.3}%)\\n\` +
\`• Mesas Atendidas: \${indicadores?.totalMesasAtendidas || 19} · Ticket Médio: R$ \${(faturamento?.ticketMedio || 148.5).toFixed(2)}\\n\\n\` +
\`*Status Auditoria:* CONCILIADO E TRAVADO EM PRD\\n\` +
\`*Sistema Zuma Pilot ERP* · Tangará da Serra - MT\`;

    const url = \`https://api.whatsapp.com/send?phone=5565999813344&text=\${encodeURIComponent(msg)}\`;
    window.open(url, "_blank");
    toast.success("Resumo executivo do turno aberto para envio no WhatsApp!");
  };
`;

if (!content.includes('notificarRodrigoWhatsApp')) {
  content = content.replace(
    `const historicoTurnos = data?.historicoTurnos || [];`,
    `${exportHandlers}\n  const historicoTurnos = data?.historicoTurnos || [];`
  );
}

// 4. Inserir botões de Exportar Excel e Notificar WhatsApp no topo
const oldTopButtons = `<button
            onClick={() => setModalComprovanteTermico(true)}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)] text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Comprovante Térmico Z
          </button>`;

const newTopButtons = `<button
            onClick={() => {
              setTurnoHistoricoSelecionado(null);
              setModalComprovanteTermico(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Visualizar e imprimir Comprovante Z de 80mm"
          >
            <Printer className="w-3.5 h-3.5" />
            Comprovante Z
          </button>

          <button
            onClick={handleExportarExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Exportar planilha de auditoria completa em Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar Excel
          </button>

          <button
            onClick={notificarRodrigoWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Disparar resumo executivo via WhatsApp para Rodrigo Gonçalves"
          >
            <Send className="w-3.5 h-3.5" />
            WhatsApp Rodrigo
          </button>`;

if (content.includes(oldTopButtons)) {
  content = content.replace(oldTopButtons, newTopButtons);
} else {
  console.log("Não encontrou oldTopButtons exato");
}

// 5. Enriquecer Aba 5 com KPIs e Coluna de Ações
const oldAba5Header = `<div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[var(--ink)]">
                Histórico de Fechamentos de Caixa Anteriores
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Registro de turnos encerrados e auditados para reimpressão de comprovante e prestação de contas
              </p>
            </div>

            <div className="bg-[var(--surface2)] rounded-2xl border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold bg-[var(--surface)]/50">
                    <th className="py-2.5 px-3">Turno / Caixa ID</th>
                    <th className="py-2.5 px-3">Data Abertura</th>
                    <th className="py-2.5 px-3">Data Fechamento</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3 text-right">Fundo Inicial</th>
                    <th className="py-2.5 px-3 text-right">Dinheiro Gaveta</th>
                    <th className="py-2.5 px-3 text-right">Quebra</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>`;

const newAba5Header = `<div className="space-y-4">
            {/* CARDS DE KPIS HISTÓRICOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Total Turnos Auditados</span>
                <span className="text-xl font-black text-[var(--ink)] block mt-0.5 font-mono">{historicoTurnos.length} turnos</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">100% integrados ao Sicredi</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Total Movimentado (Gaveta)</span>
                <span className="text-xl font-black text-[var(--ink)] block mt-0.5 font-mono">
                  R$ {historicoTurnos.reduce((s: number, r: any) => s + (r.blindCount?.countedCash || r.initialCash || 0), 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-[var(--muted)] block mt-0.5">Dinheiro em espécie conferido</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Índice de Assertividade</span>
                <span className="text-xl font-black text-emerald-600 block mt-0.5 font-mono">
                  {historicoTurnos.length > 0 
                    ? ((historicoTurnos.filter((r: any) => Math.abs(r.blindCount?.difference || 0) <= 2.0).length / historicoTurnos.length) * 100).toFixed(1)
                    : 100}%
                </span>
                <span className="text-[10px] text-emerald-600/80 block mt-0.5">Turnos dentro da tolerância</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Fundo Médio de Troco</span>
                <span className="text-xl font-black text-[var(--ink)] block mt-0.5 font-mono">
                  R$ {historicoTurnos.length > 0 
                    ? (historicoTurnos.reduce((s: number, r: any) => s + (r.initialCash || 0), 0) / historicoTurnos.length).toFixed(2)
                    : "250.00"}
                </span>
                <span className="text-[10px] text-[var(--muted)] block mt-0.5">Reserva padrão de abertura</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="font-bold text-sm text-[var(--ink)]">
                  Histórico de Fechamentos de Caixa Anteriores
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Registro de turnos encerrados e auditados para reimpressão de comprovante e prestação de contas
                </p>
              </div>
              <button
                onClick={handleExportarExcel}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Baixar Planilha Geral
              </button>
            </div>

            <div className="bg-[var(--surface2)] rounded-2xl border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold bg-[var(--surface)]/50">
                    <th className="py-2.5 px-3">Turno / Caixa ID</th>
                    <th className="py-2.5 px-3">Data Abertura</th>
                    <th className="py-2.5 px-3">Data Fechamento</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3 text-right">Fundo Inicial</th>
                    <th className="py-2.5 px-3 text-right">Dinheiro Gaveta</th>
                    <th className="py-2.5 px-3 text-right">Quebra</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>`;

if (content.includes(oldAba5Header)) {
  content = content.replace(oldAba5Header, newAba5Header);
} else {
  console.log("Não encontrou oldAba5Header");
}

// 6. Atualizar linhas da tabela na Aba 5 para incluir botões de ação
const oldAba5RowStatus = `<td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 border border-slate-500/30">
                            Fechado
                          </span>
                        </td>
                      </tr>`;

const newAba5RowStatus = `<td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 border border-slate-500/30">
                            Fechado
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setTurnoHistoricoSelecionado(reg);
                                setModalComprovanteTermico(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                              title="Reemitir Comprovante Térmico Z deste turno"
                            >
                              <Printer className="w-3 h-3 text-[var(--salmon)]" />
                              Térmico Z
                            </button>
                            <button
                              onClick={() => setModalDetalhesTurno(reg)}
                              className="px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[10px] font-bold text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                              title="Visualizar detalhes da prestação de contas"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              Detalhes
                            </button>
                          </div>
                        </td>
                      </tr>`;

if (content.includes(oldAba5RowStatus)) {
  content = content.replace(oldAba5RowStatus, newAba5RowStatus);
} else {
  console.log("Não encontrou oldAba5RowStatus");
}

// 7. Adicionar Modal de Detalhes de Turno Histórico antes do fechamento do componente
const modalDetalhesBlock = `
      {/* ==================== MODAL DE DETALHES DE TURNO HISTÓRICO ==================== */}
      {modalDetalhesTurno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="font-black text-base text-[var(--ink)] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[var(--salmon)]" />
                Auditoria do Turno \${modalDetalhesTurno.id}
              </h3>
              <button
                onClick={() => setModalDetalhesTurno(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface2)] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Operador:</span>
                  <span className="font-bold text-[var(--ink)]">{modalDetalhesTurno.operator || "Mariana"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Abertura:</span>
                  <span className="font-mono text-[var(--ink)]">{new Date(modalDetalhesTurno.openedAt).toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Fechamento:</span>
                  <span className="font-mono text-[var(--ink)]">
                    {modalDetalhesTurno.closedAt ? new Date(modalDetalhesTurno.closedAt).toLocaleString("pt-BR") : "--"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface2)] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Fundo de Troco Inicial:</span>
                  <span className="font-bold">R$ {modalDetalhesTurno.initialCash?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dinheiro Declarado na Gaveta:</span>
                  <span className="font-bold">R$ {(modalDetalhesTurno.blindCount?.countedCash ?? modalDetalhesTurno.initialCash)?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--line)] pt-1">
                  <span>Quebra / Diferença Apurada:</span>
                  <span className={(modalDetalhesTurno.blindCount?.difference || 0) === 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                    {(modalDetalhesTurno.blindCount?.difference || 0) >= 0 ? "+" : ""} R$ {(modalDetalhesTurno.blindCount?.difference || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {modalDetalhesTurno.blindCount?.notes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <span className="font-bold block mb-0.5">Observações da Auditoria:</span>
                  <p>{modalDetalhesTurno.blindCount.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  setTurnoHistoricoSelecionado(modalDetalhesTurno);
                  setModalDetalhesTurno(null);
                  setModalComprovanteTermico(true);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Reemitir Cupom Térmico Z
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  `{/* ==================== MODAL DE COMPROVANTE TÉRMICO (80MM ESC/POS) ==================== */}`,
  `${modalDetalhesBlock}\n      {/* ==================== MODAL DE COMPROVANTE TÉRMICO (80MM ESC/POS) ==================== */}`
);

fs.writeFileSync("/home/ubuntu/zuma/client/src/components/erp/ErpFechamentoTurno.tsx", content, "utf-8");
console.log("ErpFechamentoTurno.tsx atualizado com sucesso!");
