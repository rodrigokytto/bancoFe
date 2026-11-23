import fs from "fs";

let content = fs.readFileSync("/home/ubuntu/zuma/client/src/components/erp/ErpFechamentoTurno.tsx", "utf-8");

const oldHandlerBlock = `  // Exportar Excel Oficial do Turno
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
  };`;

const newHandlerBlock = `  const dre = data?.dreOperacional;
  const indicadores = data?.indicadoresOperacionais;

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
          ticketMedio: indicadores?.ticketMedio || 148.5,
          totalGorjetas: indicadores?.totalGorjetas || 0,
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
          taxasCartao: dre.deducoes?.taxasCartaoEstimadas || 0,
          cmvNobre: dre.cmvReal,
          margemContribuicao: dre.margemContribuicaoBrl,
          percentualMargem: dre.margemContribuicaoPercentual,
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
    const cartoesTotal = (faturamento?.cartaoCredito?.valor || 0) + (faturamento?.cartaoDebito?.valor || 0);
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
\`• Cartões Crédito/Débito: R$ \${cartoesTotal.toFixed(2)}\\n\` +
\`• Pix Sicredi MT: R$ \${(faturamento?.pix?.valor || 0).toFixed(2)}\\n\` +
\`• Dinheiro Físico: R$ \${(faturamento?.dinheiro?.valor || 0).toFixed(2)}\\n\` +
\`• Convênios Corporativos: R$ \${(faturamento?.convenioAgro?.valor || 0).toFixed(2)}\\n\` +
\`------------------------------------\\n\` +
\`📊 *DRE & MARGEM:*\\n\` +
\`• CMV Nobre (Salmão/BOM): R$ \${(dre?.cmvReal || 0).toFixed(2)} (\${(dre?.cmvPercentual || 30.7).toFixed(1)}%)\\n\` +
\`• Margem de Contribuição: R$ \${(dre?.margemContribuicaoBrl || 0).toFixed(2)} (\${(dre?.margemContribuicaoPercentual || 69.3).toFixed(1)}%)\\n\` +
\`• Mesas Atendidas: \${indicadores?.totalMesasAtendidas || 19} · Ticket Médio: R$ \${(indicadores?.ticketMedio || 148.5).toFixed(2)}\\n\\n\` +
\`*Status Auditoria:* CONCILIADO E TRAVADO EM PRD\\n\` +
\`*Sistema Zuma Pilot ERP* · Tangará da Serra - MT\`;

    const url = \`https://api.whatsapp.com/send?phone=5565999813344&text=\${encodeURIComponent(msg)}\`;
    window.open(url, "_blank");
    toast.success("Resumo executivo do turno aberto para envio no WhatsApp!");
  };`;

// Removemos a declaração duplicada de dre se houver logo após
content = content.replace(oldHandlerBlock, newHandlerBlock);
content = content.replace(`const dre = data?.dreOperacional;\n`, ``);

fs.writeFileSync("/home/ubuntu/zuma/client/src/components/erp/ErpFechamentoTurno.tsx", content, "utf-8");
console.log("ErpFechamentoTurno.tsx corrigido com tipos reais!");
