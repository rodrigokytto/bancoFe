import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { dataStore } from "./dataStore";

describe("Validação Corporativa PRD: Fechamento de Caixa, Conciliação e Correções Padrão Dino Barbearia", () => {
  const caller = appRouter.createCaller({} as any);

  beforeEach(() => {
    // Garante que o caixa esteja aberto para as operações
    dataStore.openCashRegister(250.0, "Mariana (Frente de Caixa Balcão)");
  });

  it("1. getDailyClosingData deve retornar matriz de conciliação por meio de pagamento, tolerância e auditoria de salão", async () => {
    const closing = await caller.zuma.getDailyClosingData();

    // Estrutura básica
    expect(closing).toBeDefined();
    expect(closing.turnoId).toBeDefined();
    expect(closing.operador).toBeDefined();
    expect(closing.resumoGaveta).toBeDefined();
    expect(closing.faturamentoPorMeio).toBeDefined();

    // Matriz detalhada de conciliação no padrão Dino Barbearia
    expect(Array.isArray(closing.itensConciliacao)).toBe(true);
    expect(closing.itensConciliacao.length).toBeGreaterThanOrEqual(5);

    // Validação dos meios de pagamento na matriz
    const meios = closing.itensConciliacao.map((item: any) => item.forma || item.chave);
    expect(meios).toContain("dinheiro");
    expect(meios).toContain("pix");
    expect(meios).toContain("cartao_credito");
    expect(meios).toContain("cartao_debito");

    // Validação de tolerância e status geral de conciliação
    expect(closing.toleranciaDivergencia).toBe(2.0); // Tolerância padrão R$ 2,00
    expect(["conciliado", "divergente", "em_aberto"]).toContain(closing.statusConciliacaoGeral);
    expect(closing.mensagemConciliacao).toBeDefined();

    // Indicadores reais de salão
    expect(closing.indicadoresOperacionais).toBeDefined();
    expect(typeof closing.indicadoresOperacionais.totalMesasAtendidas).toBe("number");
    expect(typeof (closing.indicadoresOperacionais.totalClientesAtendidos || closing.indicadoresOperacionais.totalClientes)).toBe("number");
    expect(typeof closing.indicadoresOperacionais.ticketMedio).toBe("number");
    expect(typeof (closing.indicadoresOperacionais.gorjetasArrecadadas || closing.indicadoresOperacionais.totalGorjetas)).toBe("number");

    // Histórico de turnos
    expect(Array.isArray(closing.historicoTurnos)).toBe(true);
    expect(closing.historicoTurnos.length).toBeGreaterThanOrEqual(0);
  });

  it("2. updatePaymentMethod deve permitir corrigir a forma de pagamento de uma transação recalculando gaveta, taxas e financeiro", async () => {
    // 1. Lança um pagamento inicial em dinheiro
    const pagamentoOriginal = await caller.zuma.processPayment({
      valor: 150.0,
      forma: "dinheiro",
      canal: "Salão",
      clienteNome: "Sr. Geraldo Tangará",
      trocoPara: 150.0,
      operador: "Mariana (Frente de Caixa)",
      emitirNfce: true,
    });
    expect(pagamentoOriginal.ok || pagamentoOriginal.success).toBe(true);
    const paymentId = pagamentoOriginal.transacaoId || pagamentoOriginal.transacao?.id;
    expect(paymentId).toBeDefined();

    const closingAntes = await caller.zuma.getDailyClosingData();
    const saldoGavetaAntes = closingAntes.resumoGaveta.saldoEsperadoGaveta;

    // 2. Operador errou no momento do lançamento: cliente na verdade pagou no Cartão de Crédito Stone!
    // Executa a correção com auditoria e recálculo
    const correcao = await caller.zuma.updatePaymentMethod({
      paymentId,
      novoMeio: "cartao_credito",
      motivo: "Cliente passou cartão Stone de última hora após operador selecionar dinheiro por engano",
      operador: "Rodrigo R. Gonçalves (Supervisor)",
    });

    expect(correcao.success).toBe(true);
    expect(correcao.pagamento.forma).toBe("cartao_credito");
    expect(correcao.pagamento.valorTaxa).toBeGreaterThan(0); // Taxa Stone aplicada (2.49%)
    expect(correcao.pagamento.valorLiquido).toBeLessThan(150.0);

    // 3. Verifica que o saldo teórico em dinheiro na gaveta foi decrementado dos R$ 150,00
    const closingDepois = await caller.zuma.getDailyClosingData();
    const saldoGavetaDepois = closingDepois.resumoGaveta.saldoEsperadoGaveta;
    expect(saldoGavetaDepois).toBeCloseTo(saldoGavetaAntes - 150.0, 2);

    // 4. Verifica que foi registrada auditoria de correção de pagamento
    const auditorias = dataStore.getOrderAuditEvents();
    const auditoriaCorrecao = auditorias.find(
      (a: any) => a.action === "correcao_pagamento" && a.details.paymentId === paymentId
    );
    expect(auditoriaCorrecao).toBeDefined();
    expect(auditoriaCorrecao?.details.formaAnterior).toBe("dinheiro");
    expect(auditoriaCorrecao?.details.novaForma).toBe("cartao_credito");
    expect(auditoriaCorrecao?.operator).toBe("Rodrigo R. Gonçalves (Supervisor)");
  });

  it("3. updateCashMovement e deleteCashMovement devem permitir editar e estornar movimentações de caixa com recálculo nos totais", async () => {
    // 1. Registra sangria inicial de R$ 200,00
    const sangria = await caller.zuma.addCashMovement({
      type: "sangria",
      amount: 200.0,
      reason: "Sangria para cofre de segurança",
    });
    expect(sangria.success || sangria.id).toBeDefined();
    const movementId = sangria.movement?.id || sangria.id;
    expect(movementId).toBeDefined();

    const closing1 = await caller.zuma.getDailyClosingData();
    expect(closing1.resumoGaveta.sangrias).toBeGreaterThanOrEqual(200.0);

    // 2. Operador editou valor de sangria de R$ 200 para R$ 180 (ex: conferência física no cofre)
    const edicao = await caller.zuma.updateCashMovement({
      movementId,
      amount: 180.0,
      reason: "Correção de valor: R$ 20 foram mantidos na gaveta para troco",
      operator: "Mariana (Frente de Caixa)",
    });
    expect(edicao.success).toBe(true);
    expect(edicao.movement.amount).toBe(180.0);

    const closing2 = await caller.zuma.getDailyClosingData();
    expect(closing2.resumoGaveta.saldoEsperadoGaveta).toBe(closing1.resumoGaveta.saldoEsperadoGaveta + 20.0);

    // Verifica auditoria da edição
    const auditorias = dataStore.getOrderAuditEvents();
    const audEdicao = auditorias.find((a: any) => a.action === "edicao_movimento_caixa" && a.details.movementId === movementId);
    expect(audEdicao).toBeDefined();
    expect(audEdicao?.details.valorAnterior).toBe(200.0);
    expect(audEdicao?.details.novoValor).toBe(180.0);

    // 3. Estorno/Exclusão da sangria indevida
    const exclusao = await caller.zuma.deleteCashMovement({
      movementId,
      motivo: "Sangria duplicada cancelada pela gerência",
      operator: "Rodrigo R. Gonçalves (Supervisor)",
    });
    expect(exclusao.success).toBe(true);

    const closing3 = await caller.zuma.getDailyClosingData();
    expect(closing3.movimentacoes.find((m: any) => m.id === movementId)).toBeUndefined();
    expect(closing3.resumoGaveta.saldoEsperadoGaveta).toBe(closing2.resumoGaveta.saldoEsperadoGaveta + 180.0);

    // Verifica auditoria da exclusão
    const audExclusao = dataStore.getOrderAuditEvents().find(
      (a: any) => a.action === "exclusao_movimento_caixa" && a.details.movementId === movementId
    );
    expect(audExclusao).toBeDefined();
    expect(audExclusao?.details.valorEstornado).toBe(180.0);
  });

  it("4. settleCashBreakage deve regularizar quebra de caixa no ERP (Contas a Pagar se falta, Extrato se sobra)", async () => {
    // 1. Regularização de FALTA de caixa (Quebra negativa -> Título a pagar ou retenção)
    const settleFalta = await caller.zuma.settleCashBreakage({
      registerId: "shift_current",
      tipo: "falta",
      valor: 15.5,
      justificativa: "Diferença não localizada no troco de encerramento do almoço",
      supervisor: "Rodrigo R. Gonçalves (Supervisor)",
    });
    expect(settleFalta.success).toBe(true);
    expect(settleFalta.registroFinanceiroId).toBeDefined();

    // Valida que foi gerado título no Contas a Pagar
    const payableBills = dataStore.getPayableBills();
    const tituloQuebra = payableBills.find((b: any) => b.id === settleFalta.registroFinanceiroId);
    expect(tituloQuebra).toBeDefined();
    expect(tituloQuebra?.valorOriginal || (tituloQuebra as any)?.amount).toBe(15.5);
    expect(tituloQuebra?.categoria).toBe("Quebra de Caixa");

    // 2. Regularização de SOBRA de caixa (Quebra positiva -> Crédito extraordinário no Extrato)
    const settleSobra = await caller.zuma.settleCashBreakage({
      registerId: "shift_current",
      tipo: "sobra",
      valor: 8.0,
      justificativa: "Sobra de moedas não reclamada por clientes no turno",
      supervisor: "Rodrigo R. Gonçalves (Supervisor)",
    });
    expect(settleSobra.success).toBe(true);
    expect(settleSobra.registroFinanceiroId).toBeDefined();

    const bankTransactions = dataStore.getExtratoBancario();
    const sobraExtrato = bankTransactions.find((t: any) => t.id === settleSobra.registroFinanceiroId);
    expect(sobraExtrato).toBeDefined();
    expect(sobraExtrato?.valor).toBe(8.0);
    expect(sobraExtrato?.tipo).toBe("credito");

    // Valida auditoria
    const audQuebra = dataStore.getOrderAuditEvents().find(
      (a: any) => a.action === "ajuste_quebra_caixa" && a.details.tipo === "falta"
    );
    expect(audQuebra).toBeDefined();
  });

  it("5. reopenCashRegister deve reabrir caixa encerrado para correções com registro de auditoria corporativa", async () => {
    // 1. Fecha o caixa
    await caller.zuma.closeCashRegister({
      countedCash: 450.0,
      operator: "Mariana (Frente de Caixa)",
      notes: "Encerramento para teste de reabertura",
    });

    const caixaFechado = dataStore.getCashRegister();
    expect(caixaFechado.status).toBe("fechado");

    // 2. Reabre o caixa com justificativa de supervisor
    const reabertura = await caller.zuma.reopenCashRegister({
      operator: "Rodrigo R. Gonçalves (Supervisor Geral)",
      reason: "Necessidade de retificação em comanda do salão pós-fechamento",
    });

    expect(reabertura.success).toBe(true);
    const caixaReaberto = dataStore.getCashRegister();
    expect(caixaReaberto.status).toBe("aberto");

    // 3. Auditoria do evento
    const audReabertura = dataStore.getOrderAuditEvents().find(
      (a: any) => a.action === "reabertura_caixa"
    );
    expect(audReabertura).toBeDefined();
    expect(audReabertura?.operator).toBe("Rodrigo R. Gonçalves (Supervisor Geral)");
    expect(audReabertura?.details.reason).toContain("Necessidade de retificação");
  });

  it("6. getThermalClosingReceiptText deve gerar cupom formatado ESC/POS 80mm com todos os blocos fiscais e de conciliação", async () => {
    const cupom = await caller.zuma.getThermalClosingReceiptText({});

    expect(cupom).toBeDefined();
    expect(typeof cupom.receiptText).toBe("string");
    const texto = cupom.receiptText;

    // Cabeçalho institucional e fiscal
    expect(texto).toContain("ZUMA COZINHA ORIENTAL");
    expect(texto).toContain("36.296.848/0001-57");
    expect(texto).toContain("Tangará da Serra - MT");
    expect(texto).toContain("RELATORIO FECHAMENTO DE CAIXA E TURNO");

    // Blocos operacionais
    expect(texto).toContain("RESUMO DO FATURAMENTO POR FORMA DE PAGTO");
    expect(texto).toContain("AUDITORIA DA GAVETA FISICA (DINHEIRO)");
    expect(texto).toContain("Fundo de Troco Inicial");
    expect(texto).toContain("Vendas Dinheiro Gaveta");
    expect(texto).toContain("SALDO ESPERADO GAVETA");
    expect(texto).toContain("DINHEIRO FISICO CONTADO");
    expect(texto).toContain("DIFERENCA / QUEBRA CAIXA");

    // Indicadores e Assinaturas
    expect(texto).toContain("INDICADORES OPERACIONAIS");
    expect(texto).toContain("OPERADOR");
    expect(texto).toContain("SUPERVISOR");
  });
});
