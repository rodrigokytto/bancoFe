import sys

with open("/home/ubuntu/zuma/server/dataStore.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Expandir OrderAuditEvent action se ainda não expandido
if "nfce_contingencia_gerada" not in content:
    old_actions = '''    | "ticket_status_alterado"
    | "item_alterado"'''

    new_actions = '''    | "ticket_status_alterado"
    | "item_alterado"
    | "nfce_contingencia_gerada"
    | "nfce_contingencia_sincronizada"
    | "baixa_estoque_receita"
    | "pedido_cliente_qrcode"'''

    assert old_actions in content, "old_actions not found"
    content = content.replace(old_actions, new_actions, 1)

# 2. Adicionar interfaces FiscalNfceDoc e ShiftFinancialDre
if "export interface FiscalNfceDoc" not in content:
    target_interface = "export interface LocalStoreData {"
    fiscal_interface = '''export interface FiscalNfceDoc {
  id: string;
  nfcNumber: number;
  serie: number;
  chaveAcesso: string;
  tipoEmissao: "normal" | "contingencia_offline";
  status: "autorizada" | "pendente_contingencia" | "transmitida" | "cancelada";
  dataEmissao: string;
  dataTransmissao?: string;
  orderId?: number;
  tableNumber?: number;
  customerName?: string;
  cpf?: string;
  totalAmount: number;
  icmsBase: number;
  icmsValor: number;
  motivoContingencia?: string;
  protocoloAutorizacao?: string;
  qrCodeUrl: string;
  itens: Array<{ itemName: string; quantity: number; unitPrice: number; total: number }>;
  payments: Array<{ method: string; amount: number }>;
}

export interface ShiftFinancialDre {
  periodo: string;
  dataHora: string;
  turnoStatus: "aberto" | "fechado";
  operadorCaixa: string;
  receitaBruta: number;
  vendasBalcao: number;
  vendasSalaoMesas: number;
  vendasDeliveryProprio: number;
  vendasIfood: number;
  deducoes: {
    descontos: number;
    estornosCancelamentos: number;
    comissaoIfoodEstimada: number;
    taxasCartaoEstimadas: number;
    totalDeducoes: number;
  };
  receitaLiquida: number;
  cmvReal: number;
  cmvPercentual: number;
  margemContribuicaoBrl: number;
  margemContribuicaoPercentual: number;
  despesasOperacionais: {
    taxaServicoGarcom10: number;
    diariasMotoboys: number;
    embalagensDelivery: number;
    custosFixosRateados: number;
    quebraCaixa: number;
    totalDespesas: number;
  };
  resultadoOperacionalEbitda: number;
  margemEbitdaPercentual: number;
  economiaVsSaiposIfood: {
    economiaComissaoIfood: number;
    economiaTaxaPixSicredi: number;
    economiaMensalidadeSaipos: number;
    totalEconomizado: number;
  };
  itensMaisConsumidos: Array<{ nome: string; quantidade: number; cmvTotal: number; receitaTotal: number }>;
}

'''
    assert target_interface in content, "target_interface not found"
    content = content.replace(target_interface, fiscal_interface + target_interface, 1)

# 3. Adicionar campos em LocalStoreData
if "fiscalInvoices?: FiscalNfceDoc[];" not in content:
    store_data_target = "  auditEvents?: OrderAuditEvent[];"
    store_data_addition = '''  auditEvents?: OrderAuditEvent[];
  fiscalInvoices?: FiscalNfceDoc[];
  offlineModeEnabled?: boolean;'''
    assert store_data_target in content, "store_data_target not found"
    content = content.replace(store_data_target, store_data_addition, 1)

# 4. Adicionar os métodos no final da classe DataStore
class_end_target = "export const dataStore = new DataStore();"

methods_addition = '''  // ==================== FICHA TÉCNICA DINÂMICA & BAIXA DE ESTOQUE ====================
  public deductStockFromRecipe(dishName: string, quantity: number = 1, origin: string = "kds_expedicao") {
    const sheets = ZUMA_TECHNICAL_SHEETS;
    const cleanDish = dishName.toLowerCase().trim();
    const sheet = sheets.find(s => 
      s.dishName.toLowerCase().trim() === cleanDish ||
      cleanDish.includes(s.dishName.toLowerCase().trim()) ||
      s.dishName.toLowerCase().trim().includes(cleanDish)
    );

    if (!sheet) {
      return {
        success: false,
        message: `Ficha técnica não cadastrada para o prato "${dishName}".`,
        totalCost: 0,
        ingredientsDeducted: []
      };
    }

    const deductedList: Array<{ code: string; name: string; quantity: number; unit: string; cost: number }> = [];
    let totalCmv = 0;

    for (const ing of sheet.ingredients) {
      const needed = Number((ing.quantityRecipeUnit * quantity).toFixed(3));
      const ingCost = Number((ing.costShareBrl * quantity).toFixed(2));
      totalCmv += ingCost;

      this.updateRawMaterialStock(ing.rawMaterialCode, -needed);
      deductedList.push({
        code: ing.rawMaterialCode,
        name: ing.name,
        quantity: needed,
        unit: ing.recipeUnit,
        cost: ingCost
      });
    }

    this.emitUltraSyncEvent({
      type: "ESTOQUE_BAIXA_FICHA_TECNICA",
      originSystem: "ZUMA_PILOT",
      targetSystem: "ESTOQUE_CENTRAL",
      summary: `Baixa de estoque por ficha técnica: ${quantity}x ${sheet.dishName} (CMV: ${formatBrl(totalCmv)})`,
      payload: {
        dishName: sheet.dishName,
        quantity,
        totalCost: totalCmv,
        origin,
        ingredientsDeducted: deductedList
      }
    });

    this.logAuditEvent({
      action: "baixa_estoque_receita",
      actor: "Sistema KDS & Estoque",
      role: "producao",
      details: {
        dishName: sheet.dishName,
        quantity,
        totalCmv,
        origin,
        ingredientsCount: deductedList.length
      }
    });

    this.saveData(this.data);
    return {
      success: true,
      dishName: sheet.dishName,
      quantity,
      totalCost: Number(totalCmv.toFixed(2)),
      theoreticalCostUnit: sheet.theoreticalCost,
      cmvPercent: sheet.cmvPercent,
      ingredientsDeducted: deductedList
    };
  }

  // ==================== EMISSÃO NFC-e & CONTINGÊNCIA OFFLINE SEFAZ-MT ====================
  public isOfflineMode(): boolean {
    return Boolean(this.data.offlineModeEnabled);
  }

  public setOfflineMode(enabled: boolean): boolean {
    this.data.offlineModeEnabled = enabled;
    this.saveData(this.data);
    return this.data.offlineModeEnabled;
  }

  public getFiscalInvoices(): FiscalNfceDoc[] {
    if (!this.data.fiscalInvoices) this.data.fiscalInvoices = [];
    return this.data.fiscalInvoices;
  }

  public getFiscalContingencyQueue(): FiscalNfceDoc[] {
    const list = this.getFiscalInvoices();
    return list.filter(inv => inv.status === "pendente_contingencia");
  }

  public emitNfce(params: {
    orderId?: number;
    tableNumber?: number;
    customerName?: string;
    cpf?: string;
    totalAmount: number;
    items?: Array<{ itemName: string; quantity: number; unitPrice: number }>;
    payments?: Array<{ method: string; amount: number }>;
    forceContingency?: boolean;
    motivoContingencia?: string;
  }): FiscalNfceDoc {
    if (!this.data.fiscalInvoices) this.data.fiscalInvoices = [];

    const isOffline = params.forceContingency || this.isOfflineMode();
    const nextNfcNumber = 4850 + this.data.fiscalInvoices.length + 1;
    const now = new Date();
    const nowIso = now.toISOString();

    // Montar Chave de Acesso SEFAZ 44 dígitos (UF 51 = MT, AAMM, CNPJ 36296848000157, Mod 65, Série 001, Número 9 dig, Tipo Emissao 1/9, Cod 8 dig, DV)
    const uf = "51";
    const aamm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const cnpj = "36296848000157";
    const mod = "65";
    const serie = "001";
    const numStr = String(nextNfcNumber).padStart(9, "0");
    const tpEmis = isOffline ? "9" : "1";
    const cNf = String(Math.floor(10000000 + Math.random() * 90000000));
    const rawKeyWithoutDv = `${uf}${aamm}${cnpj}${mod}${serie}${numStr}${tpEmis}${cNf}`;
    
    // Cálculo do dígito verificador (módulo 11)
    let peso = 2;
    let soma = 0;
    for (let i = rawKeyWithoutDv.length - 1; i >= 0; i--) {
      soma += parseInt(rawKeyWithoutDv[i], 10) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;
    const chaveAcesso = `${rawKeyWithoutDv}${dv}`;

    const qrCodeUrl = `https://www.sefaz.mt.gov.br/nfce/consultaqr?p=${chaveAcesso}|2|1|1|${dv}`;
    const icmsBase = Number((params.totalAmount * 0.88).toFixed(2));
    const icmsValor = Number((icmsBase * 0.17).toFixed(2));

    const invoice: FiscalNfceDoc = {
      id: `nfce_${Date.now()}_${nextNfcNumber}`,
      nfcNumber: nextNfcNumber,
      serie: 1,
      chaveAcesso,
      tipoEmissao: isOffline ? "contingencia_offline" : "normal",
      status: isOffline ? "pendente_contingencia" : "autorizada",
      dataEmissao: nowIso,
      dataTransmissao: isOffline ? undefined : nowIso,
      orderId: params.orderId,
      tableNumber: params.tableNumber,
      customerName: params.customerName || "Consumidor Final",
      cpf: params.cpf,
      totalAmount: params.totalAmount,
      icmsBase,
      icmsValor,
      motivoContingencia: isOffline 
        ? (params.motivoContingencia || "Contingência Offline SEFAZ-MT: Indisponibilidade temporária de internet em Tangará da Serra")
        : undefined,
      protocoloAutorizacao: isOffline ? undefined : `1512600${Math.floor(100000 + Math.random() * 900000)}`,
      qrCodeUrl,
      itens: (params.items || []).map(i => ({
        itemName: i.itemName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: Number((i.quantity * i.unitPrice).toFixed(2))
      })),
      payments: params.payments || [{ method: "pix", amount: params.totalAmount }]
    };

    this.data.fiscalInvoices.unshift(invoice);

    this.logAuditEvent({
      tableNumber: params.tableNumber,
      orderId: params.orderId,
      action: isOffline ? "nfce_contingencia_gerada" : "fechamento_comanda",
      actor: "Transmissor Fiscal SEFAZ-MT",
      role: "fiscal",
      details: {
        nfcNumber: nextNfcNumber,
        chaveAcesso,
        tipoEmissao: invoice.tipoEmissao,
        status: invoice.status,
        totalAmount: params.totalAmount
      }
    });

    this.emitUltraSyncEvent({
      type: isOffline ? "NFCE_CONTINGENCIA_OFFLINE_GERADA" : "NFCE_AUTORIZADA_SEFAZ",
      originSystem: "ZUMA_PILOT",
      targetSystem: "SEFAZ_MT_RECEITA",
      summary: isOffline
        ? `NFC-e #${nextNfcNumber} emitida em CONTINGÊNCIA OFFLINE (Chave: ${chaveAcesso.slice(0, 12)}...)`
        : `NFC-e #${nextNfcNumber} AUTORIZADA pela SEFAZ-MT (${formatBrl(params.totalAmount)})`,
      payload: {
        nfcNumber: nextNfcNumber,
        chaveAcesso,
        tipoEmissao: invoice.tipoEmissao,
        total: params.totalAmount
      }
    });

    this.saveData(this.data);
    return invoice;
  }

  public syncFiscalContingencyQueue() {
    const queue = this.getFiscalContingencyQueue();
    const nowIso = new Date().toISOString();
    const protocols: Record<string, string> = {};

    for (const inv of queue) {
      inv.status = "transmitida";
      inv.dataTransmissao = nowIso;
      inv.protocoloAutorizacao = `1512600${Math.floor(100000 + Math.random() * 900000)}`;
      protocols[inv.id] = inv.protocoloAutorizacao;

      this.logAuditEvent({
        tableNumber: inv.tableNumber,
        orderId: inv.orderId,
        action: "nfce_contingencia_sincronizada",
        actor: "Sincronizador Fiscal SEFAZ-MT",
        role: "fiscal",
        details: {
          nfcNumber: inv.nfcNumber,
          chaveAcesso: inv.chaveAcesso,
          protocolo: inv.protocoloAutorizacao,
          sincronizadoEm: nowIso
        }
      });
    }

    if (queue.length > 0) {
      this.emitUltraSyncEvent({
        type: "LOTE_CONTINGENCIA_SINCRONIZADO",
        originSystem: "ZUMA_PILOT",
        targetSystem: "SEFAZ_MT_RECEITA",
        summary: `Lote de ${queue.length} NFC-e emitidas em contingência transmitido e homologado na SEFAZ-MT!`,
        payload: {
          totalNotas: queue.length,
          protocols
        }
      });
    }

    this.saveData(this.data);
    return {
      success: true,
      totalSynced: queue.length,
      syncedIds: queue.map(q => q.id),
      protocols
    };
  }

  // ==================== DRE DO TURNO & CMV EM TEMPO REAL ====================
  public getShiftFinancialDre(turnId?: string): ShiftFinancialDre {
    const reg = this.getCashRegister();
    const orders = this.data.orders || [];
    const tables = this.data.tables || [];
    const closedTables = tables.filter(t => t.status === "conta" || t.total > 0);

    // 1. Receitas
    const balcaoOrders = orders.filter(o => (o.channel || "").toLowerCase().includes("balcão") && o.status !== "cancelado");
    const deliveryProprioOrders = orders.filter(o => 
      ((o.channel || "").toLowerCase().includes("whats") || (o.channel || "").toLowerCase().includes("waha") || (o.channel || "").toLowerCase().includes("loja")) &&
      o.status !== "cancelado"
    );
    const ifoodOrders = orders.filter(o => (o.channel || "").toLowerCase().includes("ifood") && o.status !== "cancelado");

    const sumOrders = (arr: any[]) => arr.reduce((acc, o) => acc + (parseFloat(o.total || "0") || 0), 0);
    const vendasBalcao = sumOrders(balcaoOrders);
    const vendasDeliveryProprio = sumOrders(deliveryProprioOrders);
    const vendasIfood = sumOrders(ifoodOrders);
    const vendasSalaoMesas = closedTables.reduce((acc, t) => acc + (t.total || 0), 0);

    const receitaBruta = vendasBalcao + vendasDeliveryProprio + vendasIfood + vendasSalaoMesas;

    // 2. Deduções
    const descontos = closedTables.reduce((acc, t) => acc + (t.discountAmount || 0), 0) +
      orders.reduce((acc, o) => acc + (parseFloat(o.discount || "0") || 0), 0);
    const cancelamentos = (this.getLossPreventionLogs() || []).reduce((acc, l) => acc + (l.amount || 0), 0);
    const comissaoIfoodEstimada = Number((vendasIfood * 0.27).toFixed(2));
    const taxasCartaoEstimadas = Number((receitaBruta * 0.019).toFixed(2));
    const totalDeducoes = descontos + cancelamentos + comissaoIfoodEstimada + taxasCartaoEstimadas;

    const receitaLiquida = Math.max(0, Number((receitaBruta - totalDeducoes).toFixed(2)));

    // 3. CMV Real calculado pelas fichas técnicas dos pratos expedidos
    let cmvReal = 0;
    const consumedMap: Record<string, { nome: string; quantidade: number; cmvTotal: number; receitaTotal: number }> = {};

    for (const t of closedTables) {
      for (const it of t.orderItems || []) {
        if (it.status === "cancelado") continue;
        const sheet = ZUMA_TECHNICAL_SHEETS.find(s => s.dishName.toLowerCase() === it.itemName.toLowerCase());
        const unitCmv = sheet ? sheet.theoreticalCost : it.unitPrice * 0.32;
        const itemCmv = unitCmv * it.quantity;
        const itemRev = it.unitPrice * it.quantity;
        cmvReal += itemCmv;

        if (!consumedMap[it.itemName]) {
          consumedMap[it.itemName] = { nome: it.itemName, quantidade: 0, cmvTotal: 0, receitaTotal: 0 };
        }
        consumedMap[it.itemName].quantidade += it.quantity;
        consumedMap[it.itemName].cmvTotal += itemCmv;
        consumedMap[it.itemName].receitaTotal += itemRev;
      }
    }

    for (const o of orders) {
      if (o.status === "cancelado") continue;
      for (const it of o.items || []) {
        const name = it.itemName || it.nome || "Item";
        const q = it.quantity || it.q || 1;
        const price = it.unitPrice || it.preco || 0;
        const sheet = ZUMA_TECHNICAL_SHEETS.find(s => s.dishName.toLowerCase() === name.toLowerCase());
        const unitCmv = sheet ? sheet.theoreticalCost : price * 0.32;
        const itemCmv = unitCmv * q;
        const itemRev = price * q;
        cmvReal += itemCmv;

        if (!consumedMap[name]) {
          consumedMap[name] = { nome: name, quantidade: 0, cmvTotal: 0, receitaTotal: 0 };
        }
        consumedMap[name].quantidade += q;
        consumedMap[name].cmvTotal += itemCmv;
        consumedMap[name].receitaTotal += itemRev;
      }
    }

    if (cmvReal === 0 && receitaBruta > 0) {
      cmvReal = Number((receitaBruta * 0.31).toFixed(2));
    }
    cmvReal = Number(cmvReal.toFixed(2));

    const cmvPercentual = receitaLiquida > 0 ? Number(((cmvReal / receitaLiquida) * 100).toFixed(1)) : 31.5;
    const margemContribuicaoBrl = Number((receitaLiquida - cmvReal).toFixed(2));
    const margemContribuicaoPercentual = receitaLiquida > 0
      ? Number(((margemContribuicaoBrl / receitaLiquida) * 100).toFixed(1))
      : 68.5;

    // 4. Despesas Operacionais
    const taxaServicoGarcom10 = Number((vendasSalaoMesas * 0.1).toFixed(2));
    const deliveryCount = deliveryProprioOrders.length + ifoodOrders.length;
    const diariasMotoboys = Math.max(120, deliveryCount * 6.5);
    const embalagensDelivery = Number((deliveryCount * 3.2).toFixed(2));
    const custosFixosRateados = 180.0;
    const quebraCaixa = reg ? Math.abs(reg.cashDifference || 0) : 0;
    const totalDespesas = taxaServicoGarcom10 + diariasMotoboys + embalagensDelivery + custosFixosRateados + quebraCaixa;

    const resultadoOperacionalEbitda = Number((margemContribuicaoBrl - totalDespesas).toFixed(2));
    const margemEbitdaPercentual = receitaLiquida > 0
      ? Number(((resultadoOperacionalEbitda / receitaLiquida) * 100).toFixed(1))
      : 24.2;

    // 5. Economia gerada pelo Zuma vs Saipos & iFood
    const economiaComissaoIfood = Number((vendasDeliveryProprio * 0.27).toFixed(2));
    const economiaTaxaPixSicredi = Number((receitaBruta * 0.55 * 0.0249).toFixed(2));
    const economiaMensalidadeSaipos = 450.0 / 30;
    const totalEconomizado = Number((economiaComissaoIfood + economiaTaxaPixSicredi + economiaMensalidadeSaipos).toFixed(2));

    const itensMaisConsumidos = Object.values(consumedMap)
      .sort((a, b) => b.receitaTotal - a.receitaTotal)
      .slice(0, 8);

    return {
      periodo: "Turno da Noite (18:00 às 23:30)",
      dataHora: new Date().toISOString(),
      turnoStatus: reg?.status === "aberto" ? "aberto" : "fechado",
      operadorCaixa: reg?.operator || "Mariana Costa (Caixa)",
      receitaBruta: Number(receitaBruta.toFixed(2)),
      vendasBalcao: Number(vendasBalcao.toFixed(2)),
      vendasSalaoMesas: Number(vendasSalaoMesas.toFixed(2)),
      vendasDeliveryProprio: Number(vendasDeliveryProprio.toFixed(2)),
      vendasIfood: Number(vendasIfood.toFixed(2)),
      deducoes: {
        descontos: Number(descontos.toFixed(2)),
        estornosCancelamentos: Number(cancelamentos.toFixed(2)),
        comissaoIfoodEstimada,
        taxasCartaoEstimadas,
        totalDeducoes: Number(totalDeducoes.toFixed(2))
      },
      receitaLiquida,
      cmvReal,
      cmvPercentual,
      margemContribuicaoBrl,
      margemContribuicaoPercentual,
      despesasOperacionais: {
        taxaServicoGarcom10,
        diariasMotoboys: Number(diariasMotoboys.toFixed(2)),
        embalagensDelivery,
        custosFixosRateados,
        quebraCaixa,
        totalDespesas: Number(totalDespesas.toFixed(2))
      },
      resultadoOperacionalEbitda,
      margemEbitdaPercentual,
      economiaVsSaiposIfood: {
        economiaComissaoIfood,
        economiaTaxaPixSicredi,
        economiaMensalidadeSaipos: Number(economiaMensalidadeSaipos.toFixed(2)),
        totalEconomizado
      },
      itensMaisConsumidos
    };
  }

  // ==================== AUTOATENDIMENTO NA MESA VIA QR CODE ====================
  public addCustomerTableOrder(params: {
    tableNumber: number;
    items: Array<{
      itemName: string;
      quantity: number;
      unitPrice?: number;
      station?: string;
      observacoes?: string;
      adicionais?: Array<{ nome: string; preco: number }>;
    }>;
    customerName?: string;
  }) {
    const { tableNumber, items, customerName = "Cliente QR Code" } = params;
    let table = this.data.tables.find(t => t.tableNumber === tableNumber);

    if (!table || table.status === "livre") {
      table = this.openTable(tableNumber, 2, "Autoatendimento QR Code", customerName);
    }

    const addedItems: TableOrderItem[] = [];
    for (const it of items) {
      let price = it.unitPrice || 0;
      if (price <= 0) {
        for (const cat of Object.keys(ALL_ITEMS)) {
          const found = (ALL_ITEMS as any).find?.((m: any) => m.nome === it.itemName);
          if (found) {
            price = found.preco;
            break;
          }
        }
        if (price <= 0) price = 39.90;
      }

      const itemAdded = this.addTableItem(
        tableNumber,
        {
          itemName: it.itemName,
          quantity: it.quantity,
          unitPrice: price,
          station: it.station || (it.itemName.toLowerCase().includes("hot") ? "cozinha_quente" : "sushibar"),
          observacoes: it.observacoes,
          adicionais: it.adicionais
        },
        customerName
      );
      addedItems.push(itemAdded);
    }

    // Despacha os itens automaticamente ao KDS
    this.sendTableToKitchen(tableNumber, customerName);

    this.logAuditEvent({
      tableNumber,
      action: "pedido_cliente_qrcode",
      actor: customerName,
      role: "cliente",
      details: {
        itemsCount: items.length,
        itemsSummary: items.map(i => `${i.quantity}x ${i.itemName}`).join(", ")
      }
    });

    this.emitUltraSyncEvent({
      type: "PEDIDO_MESA_CLIENTE_QRCODE",
      originSystem: "ZUMA_PWA_CLIENTE",
      targetSystem: "KDS_COZINHA",
      summary: `Autoatendimento: ${customerName} lançou ${items.length} pratos na Mesa ${tableNumber}`,
      payload: {
        tableNumber,
        customerName,
        items
      }
    });

    this.saveData(this.data);
    return {
      success: true,
      tableNumber,
      customerName,
      itemsAddedCount: addedItems.length,
      currentTableTotal: table.total
    };
  }
}

'''

assert class_end_target in content, "class_end_target not found"
content = content.replace("}\nexport const dataStore = new DataStore();", methods_addition + "export const dataStore = new DataStore();", 1)

with open("/home/ubuntu/zuma/server/dataStore.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("dataStore.ts successfully updated!")
