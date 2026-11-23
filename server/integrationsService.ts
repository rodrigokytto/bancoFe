import express from "express";
import { dataStore, WebhookLogItem } from "./dataStore";
import { formatBrl } from "../shared/zumaData";
import { ecosystemService } from "./ecosystemService";

export interface SimulateIfoodParams {
  customerName?: string;
  neighborhood?: string;
  dishName?: string;
  quantity?: number;
  total?: number;
}

export interface SimulateKeetoParams {
  tableNumber?: number;
  waiter?: string;
  dishName?: string;
  quantity?: number;
  total?: number;
}

export interface SimulateWahaParams {
  customerName?: string;
  phone?: string;
  message?: string;
  hasVoice?: boolean;
  durationSeconds?: number;
}

export interface SimulateSicrediPixParams {
  amount: number;
  customerName?: string;
  txId?: string;
  neighborhood?: string;
}

export function registerIntegrationRoutes(app: express.Express): void {
  // ==========================================
  // 1. WEBHOOK IFOOD MERCHANT API v2
  // ==========================================
  app.post("/api/webhooks/ifood", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};
    const events = Array.isArray(payload) ? payload : [payload];

    for (const ev of events) {
      const code = ev.code || "PLACED";
      const orderData = ev.data || {};
      const orderNum = orderData.displayId || Math.floor(1000 + Math.random() * 9000);
      const custName = orderData.customer?.name || "Cliente iFood";
      const neighborhood = orderData.delivery?.deliveryAddress?.neighborhood || "Centro";
      const items = orderData.items || [
        { itemName: "Combo 26 Peças", quantity: 1, unitPrice: 69.9 }
      ];
      const totalAmount = orderData.total?.orderAmount || 69.9;

      if (code === "PLACED" || code === "CONFIRMED") {
        dataStore.createOrder({
          channel: "iFood",
          reference: `iFood #${orderNum}`,
          customerName: custName,
          customerPhone: orderData.customer?.phone || "(65) 99999-0000",
          neighborhood,
          status: "preparo",
          paymentMethod: "iFood Pay (Online)",
          subtotal: String(totalAmount),
          total: String(totalAmount),
          items: items.map((i: any) => ({
            itemName: i.name || i.itemName || "Item Zuma",
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 69.9,
          })),
        });
      }
    }

    const latency = Date.now() - startTime;
    dataStore.logWebhook(
      "iFood",
      events[0]?.code ? `ORDER_${events[0].code}` : "ORDERS_RECEIVED",
      200,
      Math.max(18, latency),
      payload
    );

    res.status(200).json({ status: "ok", acknowledged: true, count: events.length });
  });

  // ==========================================
  // 2. WEBHOOK & API KEETO POS / ERP
  // ==========================================
  app.post("/api/webhooks/keeto", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};
    const eventType = payload.event || "POS_TABLE_ORDER";
    const table = payload.tableNumber || 5;
    const waiter = payload.waiter || "Matheus";
    const items = payload.items || [
      { name: "Especial da Casa 40 Peças", quantity: 1, unitPrice: 98.9 }
    ];
    const total = payload.total || 98.9;
    const orderNum = Math.floor(4000 + Math.random() * 999);

    dataStore.createOrder({
      channel: `Keeto POS (Mesa ${table})`,
      reference: `Mesa ${table} - Garçom ${waiter}`,
      customerName: `Mesa ${table} (${waiter})`,
      customerPhone: "(65) 3326-0000",
      neighborhood: "Salão Zuma",
      status: "preparo",
      paymentMethod: payload.paymentMethod || "Keeto Pay / Comanda",
      subtotal: String(total),
      total: String(total),
      nfcNumber: orderNum,
      nfcStatus: "autorizada",
      items: items.map((i: any) => ({
        itemName: i.name || "Item Keeto",
        quantity: i.quantity || 1,
        unitPrice: i.unitPrice || total,
      })),
    });

    // Baixa automática de insumos de salmão no estoque
    dataStore.updateStock("SALM-01", -0.35);

    const latency = Date.now() - startTime;
    dataStore.logWebhook(
      "Keeto",
      eventType,
      200,
      Math.max(22, latency),
      payload
    );

    res.status(200).json({ status: "ok", orderNumber: orderNum, nfcStatus: "autorizada" });
  });

  // ==========================================
  // 3. META WHATSAPP BUSINESS CLOUD API
  // ==========================================
  app.get("/api/webhooks/meta-whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Token padrão de verificação Meta Graph API do Zuma
    const VERIFY_TOKEN = "zuma_meta_webhook_token_2026";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[Meta Webhook] Handshake verificado com sucesso!");
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: "Verification token mismatch" });
    }
  });

  app.post("/api/webhooks/meta-whatsapp", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};

    dataStore.logWebhook(
      "Meta WhatsApp",
      "MESSAGES_INBOUND",
      200,
      Math.max(35, Date.now() - startTime),
      payload
    );

    res.status(200).json({ status: "received" });
  });

  // ==========================================
  // 4. APPLE PAY MERCHANT VALIDATION SESSION
  // ==========================================
  app.post("/api/applepay/session", (req, res) => {
    const { validationURL, displayName } = req.body || {};
    const startTime = Date.now();

    const sessionPayload = {
      epochTimestamp: Date.now(),
      expiresAt: Date.now() + 3600000,
      merchantSessionIdentifier: "SSH_" + Math.random().toString(36).substring(2, 15).toUpperCase(),
      nonce: Math.random().toString(36).substring(2, 10),
      merchantIdentifier: "merchant.br.com.kytto.zuma",
      domainName: "zuma.kytto.com.br",
      displayName: displayName || "Zuma Cozinha Oriental",
      signature: "SIG_" + Buffer.from("ApplePaySignatureVerified").toString("base64"),
    };

    dataStore.logWebhook(
      "Apple Pay",
      "MERCHANT_SESSION_CREATED",
      200,
      Math.max(16, Date.now() - startTime),
      { domainName: "zuma.kytto.com.br", merchantIdentifier: "merchant.br.com.kytto.zuma" }
    );

    res.status(200).json(sessionPayload);
  });

  // ==========================================
  // 5. SERVIDOR WAHA (WHATSAPP HTTP API - CORE ENGINE)
  // ==========================================
  app.post("/api/webhooks/waha", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};
    const event = payload.event || "message";
    const data = payload.payload || {};
    const fromNumber = data.from || "5565996458910@c.us";
    const textBody = data.body || "";
    const hasMedia = Boolean(data.hasMedia);
    const isVoice = data.type === "ptt" || data.type === "voice";

    // Se houver mensagem de texto ou voz, registrar no log e na esteira
    dataStore.logWebhook(
      "WAHA Server",
      isVoice ? "WAHA_VOICE_INBOUND (Áudio PTT)" : `WAHA_${event.toUpperCase()}`,
      200,
      Math.max(14, Date.now() - startTime),
      {
        session: payload.session || "default",
        from: fromNumber,
        body: textBody,
        isVoice,
        mediaType: data.type || "text",
        timestamp: data.timestamp || Date.now(),
      }
    );

    res.status(200).json({ status: "acknowledged", session: payload.session || "default" });
  });

  app.get("/api/waha/sessions", (_req, res) => {
    res.status(200).json({
      name: "default",
      status: "WORKING",
      engine: "NOWEB",
      me: {
        id: "5565999813344@c.us",
        pushName: "Zuma Cozinha Oriental - Tangará da Serra",
      },
      phone: "+55 (65) 99981-3344",
      battery: 98,
      plugged: true,
      messagesToday: 412,
      uptimeSeconds: 184320,
      latencyMs: 12,
      endpoint: "http://localhost:3000/api/waha",
      webhookUrl: "https://zuma.kytto.com.br/api/webhooks/waha",
      version: "v2026.11.2 (NOWEB Core)",
    });
  });

  // Envio de Texto Padrão WAHA HTTP API
  app.post("/api/waha/sendText", (req, res) => {
    const { chatId, phone, text, session } = req.body || {};
    const rawDigits = ((phone || chatId || "").toString()).replace(/\D/g, "");
    const target = rawDigits.startsWith("55") ? `${rawDigits}@c.us` : `55${rawDigits}@c.us`;
    const msgId = "waha_msg_" + Math.random().toString(36).substring(2, 10);
    const content = text || "Comprovante fiscal emitido por Zuma Cozinha Oriental.";

    dataStore.logWebhook(
      "WAHA Server",
      "WAHA_OUTBOUND_TEXT",
      200,
      14,
      {
        id: msgId,
        session: session || "default",
        to: target,
        text: content,
        engine: "NOWEB",
        status: "DELIVERED",
        timestamp: Date.now()
      }
    );

    res.status(200).json({
      id: msgId,
      timestamp: Date.now(),
      from: "5565999813344@c.us",
      to: target,
      status: "DELIVERED",
      session: session || "default"
    });
  });

  // Envio de Comprovante Térmico & NFC-e via WAHA
  app.post("/api/waha/sendReceipt", (req, res) => {
    const { phone, mesaNumero, mesaNome, totalPago, formaPagamento, chaveNfce, protocoloNfce, itens, comprovanteTef, atendente } = req.body || {};
    const rawDigits = (phone || "65999813344").toString().replace(/\D/g, "");
    const target = rawDigits.startsWith("55") ? `${rawDigits}@c.us` : `55${rawDigits}@c.us`;
    const msgId = "waha_msg_recibo_" + Math.random().toString(36).substring(2, 10);

    const text = montarTextoComprovanteWhatsApp({
      mesaNome: mesaNome || `Mesa ${mesaNumero || "03"}`,
      atendente: atendente || "Salão",
      totalPago: Number(totalPago) || 0,
      formaPagamento: formaPagamento || "Cartão TEF",
      chaveNfce: chaveNfce || "51261136296848000157650010000049281893728192",
      protocoloNfce: protocoloNfce || "151260084729184",
      itens: itens || [],
      comprovanteTef
    });

    dataStore.logWebhook(
      "WAHA Server",
      "WAHA_RECEIPT_DISPATCHED",
      200,
      18,
      {
        id: msgId,
        session: "default",
        to: target,
        mesaNome: mesaNome || `Mesa ${mesaNumero || "03"}`,
        totalPago,
        formaPagamento,
        chaveNfce,
        status: "DELIVERED",
        timestamp: Date.now()
      }
    );

    res.status(200).json({
      success: true,
      id: msgId,
      to: target,
      status: "DELIVERED",
      message: text,
      timestamp: Date.now()
    });
  });

  app.post("/api/waha/session/restart", (_req, res) => {
    dataStore.logWebhook(
      "WAHA Server",
      "SESSION_RESTARTED",
      200,
      28,
      { session: "default", status: "WORKING", reconnectedAt: new Date().toISOString(), engine: "NOWEB" }
    );
    res.status(200).json({ status: "restarted", session: "default", state: "WORKING", battery: 98, latencyMs: 12 });
  });

  app.post("/api/waha/sessions/start", (_req, res) => {
    res.status(200).json({ name: "default", status: "WORKING", engine: "NOWEB" });
  });

  app.post("/api/waha/sessions/stop", (_req, res) => {
    res.status(200).json({ name: "default", status: "STOPPED" });
  });

  app.get("/api/waha/qr", (_req, res) => {
    res.status(200).json({
      session: "default",
      status: "SCAN_QR_CODE",
      qrString: "2@zumaWahaKyttoAuthToken2026NOWEBEngine=="
    });
  });

  app.get("/api/waha/logs", (_req, res) => {
    const logs = dataStore.getWebhookLogs(50).filter(l => l.source.includes("WAHA"));
    res.status(200).json({ count: logs.length, logs });
  });

  // ==========================================
  // 5.1 SERVIÇO DE E-MAIL FISCAL (SEFAZ-MT / DANFE)
  // Remetente Obrigatório: contato@kytto.com.br
  // ==========================================
  app.post("/api/email/sendNfce", (req, res) => {
    const { emailDestino, mesaNumero, mesaNome, totalPago, formaPagamento, chaveNfce, protocoloNfce, itens, comprovanteTef, atendente } = req.body || {};
    const to = emailDestino || "rrodrigogon@gmail.com";
    const from = "Zuma Cozinha Oriental <contato@kytto.com.br>";
    const emailId = "email_msg_" + Math.random().toString(36).substring(2, 10);

    const emailHtml = montarTemplateHtmlEmailFiscal({
      from: "contato@kytto.com.br",
      to,
      mesaNome: mesaNome || `Mesa ${mesaNumero || "03"}`,
      atendente: atendente || "Salão",
      totalPago: Number(totalPago) || 0,
      formaPagamento: formaPagamento || "Cartão TEF",
      chaveNfce: chaveNfce || "51261136296848000157650010000049281893728192",
      protocoloNfce: protocoloNfce || "151260084729184",
      itens: itens || [],
      comprovanteTef
    });

    dataStore.logWebhook(
      "Email Server",
      "EMAIL_NFC_SENT",
      200,
      24,
      {
        id: emailId,
        from: "contato@kytto.com.br",
        to,
        subject: `🧾 Zuma Tangará: DANFE NFC-e SEFAZ-MT e Comprovante (${mesaNome || `Mesa ${mesaNumero || "03"}`})`,
        status: "ENVIADO",
        chaveNfce,
        totalPago,
        timestamp: new Date().toISOString()
      }
    );

    res.status(200).json({
      success: true,
      id: emailId,
      from: "contato@kytto.com.br",
      to,
      subject: `🧾 Zuma Tangará: DANFE NFC-e SEFAZ-MT e Comprovante (${mesaNome || `Mesa ${mesaNumero || "03"}`})`,
      status: "ENVIADO",
      previewHtml: emailHtml,
      timestamp: new Date().toISOString()
    });
  });

  // Alias para integração WAHA / Email Fiscal Oficial
  app.post("/api/waha/sendEmailReceipt", (req, res) => {
    const { emailDestino, mesaNumero, mesaNome, totalPago, formaPagamento, chaveNfce, protocoloNfce, itens, comprovanteTef, atendente } = req.body || {};
    const to = emailDestino || "rrodrigogon@gmail.com";
    const emailId = "email_msg_" + Math.random().toString(36).substring(2, 10);

    const emailHtml = montarTemplateHtmlEmailFiscal({
      from: "contato@kytto.com.br",
      to,
      mesaNome: mesaNome || `Mesa ${mesaNumero || "03"}`,
      atendente: atendente || "Salão",
      totalPago: Number(totalPago) || 0,
      formaPagamento: formaPagamento || "Cartão TEF",
      chaveNfce: chaveNfce || "51261136296848000157650010000049281893728192",
      protocoloNfce: protocoloNfce || "151260084729184",
      itens: itens || [],
      comprovanteTef
    });

    dataStore.logWebhook(
      "Email Server",
      "EMAIL_NFC_SENT",
      200,
      24,
      {
        id: emailId,
        from: "contato@kytto.com.br",
        to,
        subject: `🧾 Zuma Tangará: DANFE NFC-e SEFAZ-MT e Comprovante (${mesaNome || `Mesa ${mesaNumero || "03"}`})`,
        status: "ENVIADO",
        chaveNfce,
        totalPago,
        timestamp: new Date().toISOString()
      }
    );

    res.status(200).json({
      success: true,
      id: emailId,
      from: "contato@kytto.com.br",
      to,
      subject: `🧾 Zuma Tangará: DANFE NFC-e SEFAZ-MT e Comprovante (${mesaNome || `Mesa ${mesaNumero || "03"}`})`,
      status: "ENVIADO",
      previewHtml: emailHtml,
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // 6. SICREDI & SICOOB PIX OPEN FINANCE (MT)
  // ==========================================
  app.post("/api/webhooks/sicredi-pix", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};
    const pixList = payload.pix || [payload];

    for (const p of pixList) {
      const valor = parseFloat(p.valor || "69.90");
      const pagador = p.pagador?.nome || "Cliente Sicredi MT";
      const txId = p.txid || "TX_SICREDI_" + Math.random().toString(36).substring(2, 9).toUpperCase();

      dataStore.logWebhook(
        "Sicredi Pix MT",
        `PIX_RECEIVED (${formatBrl(valor)})`,
        200,
        Math.max(12, Date.now() - startTime),
        {
          txId,
          valor,
          pagador,
          cooperativa: "Sicredi União MT/PA · Agência Tangará da Serra",
          tarifa: "R$ 0,00 (Isento)",
          horario: p.horario || new Date().toISOString(),
        }
      );
    }

    res.status(200).json({ status: "processed", count: pixList.length });
  });

  app.post("/api/webhooks/sicoob-pix", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};
    const valor = parseFloat(payload.valor || "98.90");
    const txId = payload.txid || "TX_SICOOB_" + Math.random().toString(36).substring(2, 9).toUpperCase();

    dataStore.logWebhook(
      "Sicoob Pix MT",
      `PIX_CONFIRMED (${formatBrl(valor)})`,
      200,
      Math.max(15, Date.now() - startTime),
      {
        txId,
        valor,
        cooperativa: "Sicoob Credisul · Tangará da Serra",
        tarifa: "R$ 0,00",
      }
    );

    res.status(200).json({ status: "processed" });
  });

  // ==========================================
  // 7. SEFAZ-MT FISCAL HUB (NFC-e MODELO 65)
  // ==========================================
  app.post("/api/webhooks/sefaz-mt", (req, res) => {
    const startTime = Date.now();
    const payload = req.body || {};
    const nfcNum = payload.nfcNumber || Math.floor(5100 + Math.random() * 900);

    dataStore.logWebhook(
      "SEFAZ-MT",
      `NFCE_AUTORIZADA (#${nfcNum})`,
      200,
      Math.max(25, Date.now() - startTime),
      {
        nfcNumber: nfcNum,
        chaveAcesso: "512611092817340001096500100000" + nfcNum + "1009281739",
        statusSefaz: "100 - Autorizado o uso da NFC-e",
        ambiente: "Produção SEFAZ-MT",
      }
    );

    res.status(200).json({ status: "autorizada", nfcNumber: nfcNum });
  });

  // ==========================================
  // 8. STATUS GERAL DE INTEGRAÇÕES & HEALTH
  // ==========================================
  app.get("/api/v1/integrations/health", (_req, res) => {
    res.status(200).json({
      status: "operational",
      version: "2.4.0",
      channels: [
        { name: "WAHA Server (WhatsApp HTTP API)", status: "ONLINE", latency: "14ms", active: true, engine: "NOWEB" },
        { name: "iFood Merchant API", status: "ONLINE", latency: "38ms", active: true },
        { name: "Keeto POS & ERP", status: "ONLINE", latency: "24ms", active: true },
        { name: "Sicredi & Sicoob Pix MT", status: "ONLINE", latency: "12ms", active: true },
        { name: "Meta WhatsApp Cloud API", status: "ONLINE", latency: "45ms", active: true },
        { name: "Apple Pay Merchant Gateway", status: "ONLINE", latency: "16ms", active: true },
        { name: "SEFAZ-MT NFC-e Fiscal", status: "ONLINE", latency: "25ms", active: true },
        { name: "Google Reserve & Maps", status: "ONLINE", latency: "60ms", active: true },
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // 9. IFOOD MERCHANT API v2 ROTAS OPERACIONAIS
  // ==========================================
  app.get("/api/v1/ifood/overview", (_req, res) => {
    res.status(200).json(dataStore.getIfoodOverview());
  });

  app.post("/api/v1/ifood/merchant/status", (req, res) => {
    const { status } = req.body || {};
    const valid = ["ABERTO", "PAUSA_15", "PAUSA_30", "PAUSA_60", "FECHADO"];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: "Status inválido. Escolha: " + valid.join(", ") });
    }
    const result = dataStore.setIfoodStoreStatus(status);
    res.status(200).json(result);
  });

  app.post("/api/v1/ifood/orders/:id/confirm", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const prepTime = parseInt(req.body?.prepTimeMinutes || "25", 10);
    try {
      const result = dataStore.ifoodConfirmOrder(id, prepTime);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post("/api/v1/ifood/orders/:id/ready", (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const result = dataStore.ifoodReadyOrder(id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post("/api/v1/ifood/orders/:id/dispatch", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const motoboyId = req.body?.motoboyId;
    try {
      const result = dataStore.ifoodDispatchOrder(id, motoboyId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post("/api/v1/ifood/orders/:id/conclude", (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const result = dataStore.ifoodConcludeOrder(id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post("/api/v1/ifood/orders/:id/cancel", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const reason = req.body?.reason || "Cancelamento operacional";
    try {
      const result = dataStore.ifoodCancelOrder(id, reason);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post("/api/v1/ifood/catalog/sync", (_req, res) => {
    const result = dataStore.syncIfoodCatalog();
    res.status(200).json(result);
  });

  app.post("/api/v1/ifood/catalog/toggle", (req, res) => {
    const { dishName, available } = req.body || {};
    if (!dishName) {
      return res.status(400).json({ error: "dishName obrigatório" });
    }
    const result = dataStore.toggleIfoodItemAvailability(dishName, Boolean(available));
    res.status(200).json(result);
  });

  // ==========================================
  // 10. KEETO POS & MESAS ROTAS OPERACIONAIS
  // ==========================================
  app.get("/api/v1/keeto/tables", (_req, res) => {
    res.status(200).json(dataStore.getKeetoTablesOverview());
  });

  app.post("/api/v1/keeto/tables/order", (req, res) => {
    const { tableNumber, waiter, items, notes } = req.body || {};
    if (!tableNumber || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "tableNumber e items são obrigatórios" });
    }
    try {
      const result = dataStore.sendKeetoTableOrder({ tableNumber, waiter, items, notes });
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/v1/keeto/tables/:num/close", (req, res) => {
    const tableNum = parseInt(req.params.num, 10);
    const { paymentMethod = "Pix", splitCount } = req.body || {};
    try {
      const result = dataStore.closeTable(tableNum, paymentMethod, splitCount);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 11. OPEN DELIVERY (ABRASEL / AIQFOME / 99FOOD)
  // ==========================================
  app.post("/api/webhooks/open-delivery", (req, res) => {
    const payload = req.body || {};
    try {
      const order = dataStore.processOpenDeliveryOrder(payload);
      res.status(200).json({ status: "acknowledged", orderNumber: order.orderNumber });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 12. SAIPOS SYNC & BRIDGE MIGRATION ROTAS HTTP
  // ==========================================
  app.get("/api/v1/integrations/saipos/status", (_req, res) => {
    res.status(200).json(dataStore.getSaiposSyncData());
  });

  app.post("/api/v1/integrations/saipos/sync", (req, res) => {
    const { type, operator } = req.body || {};
    const result = dataStore.executeSaiposSync({ type, operator });
    res.status(200).json(result);
  });

  app.get("/api/v1/integrations/saipos/export", (_req, res) => {
    const items = dataStore.exportSaiposMenuJson();
    res.setHeader("Content-Disposition", "attachment; filename=zuma_saipos_menu_export.json");
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(items, null, 2));
  });

  app.post("/api/v1/integrations/saipos/import", (req, res) => {
    const { items, operator } = req.body || {};
    const result = dataStore.importSaiposData(items || [], operator);
    res.status(200).json(result);
  });

  app.get("/api/v1/integrations/credentials", (_req, res) => {
    res.status(200).json(dataStore.getIntegrationsCredentials());
  });

  app.get("/api/v1/delivery/omnichannel", (_req, res) => {
    res.status(200).json(dataStore.getOmnichannelDeliveryMetrics());
  });

  // ==========================================
  // 13. ZUMA MODEL CONTEXT PROTOCOL (MCP) SERVER
  // ==========================================
  app.get("/api/mcp/manifest", (_req, res) => {
    res.status(200).json(ecosystemService.getZumaMcpManifest());
  });

  app.post("/api/mcp/tools/call", (req, res) => {
    const { name, arguments: toolArgs, caller } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "Campo 'name' da ferramenta MCP obrigatório" });
    }
    try {
      const result = ecosystemService.executeZumaMcpTool(name, toolArgs || {}, caller || "External AI Agent");
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message, isError: true });
    }
  });

  // ==========================================
  // 14. GOOGLE WORKSPACE & CLOUD ROTAS
  // ==========================================
  app.get("/api/google/sheets/export/dre", (_req, res) => {
    const result = ecosystemService.triggerGoogleExport("sheets_dre");
    res.status(200).json(result);
  });

  app.post("/api/google/drive/backup", (_req, res) => {
    const result = ecosystemService.triggerGoogleExport("drive_xml_backup");
    res.status(200).json(result);
  });

  // ==========================================
  // 15. BANCOS & TEF IP ROTAS
  // ==========================================
  app.post("/api/bancos/conciliacao", (_req, res) => {
    const result = ecosystemService.triggerConciliacaoBancaria();
    res.status(200).json(result);
  });

  app.post("/api/tef/authorize", (req, res) => {
    const { amount, acquirer = "Stone Hub", method = "debito" } = req.body || {};
    const result = ecosystemService.simulateTefTransaction(parseFloat(amount || "98.90"), acquirer, method);
    res.status(200).json(result);
  });

  // ==========================================
  // 16. GIT & BACKUP SNAPSHOTS
  // ==========================================
  app.post("/api/git/snapshots", (req, res) => {
    const { operator } = req.body || {};
    const result = ecosystemService.triggerGitSnapshot(operator);
    res.status(200).json(result);
  });
}

// Helpers programáticos para disparo e teste via tRPC
export function executeSimulateIfoodOrder(params: SimulateIfoodParams) {
  const orderNum = Math.floor(8000 + Math.random() * 1999);
  const custName = params.customerName || "Lucas Vasconcelos (iFood)";
  const neighborhood = params.neighborhood || "Jardim Europa";
  const dishName = params.dishName || "Combo 26 Peças";
  const qty = params.quantity || 1;
  const total = params.total || 69.9;

  const order = dataStore.createOrder({
    channel: "iFood",
    reference: `iFood #${orderNum}`,
    customerName: custName,
    customerPhone: "(65) 99812-4410",
    neighborhood,
    status: "preparo",
    paymentMethod: "iFood Pay (Online)",
    subtotal: total.toFixed(2),
    total: total.toFixed(2),
    items: [
      {
        itemName: dishName,
        quantity: qty,
        unitPrice: total / qty,
      }
    ],
  });

  dataStore.logWebhook(
    "iFood",
    `ORDER_PLACED (#${orderNum})`,
    200,
    36,
    {
      displayId: String(orderNum),
      customer: { name: custName, neighborhood },
      items: [{ name: dishName, quantity: qty }],
      total,
    }
  );

  return order;
}

export function executeSimulateKeetoPos(params: SimulateKeetoParams) {
  const table = params.tableNumber || Math.floor(1 + Math.random() * 12);
  const waiter = params.waiter || "Matheus (Salão)";
  const dish = params.dishName || "Barca Especial 56 Peças";
  const qty = params.quantity || 1;
  const total = params.total || 189.9;
  const nfcNumber = Math.floor(5000 + Math.random() * 1000);

  const order = dataStore.createOrder({
    channel: `Keeto POS (Mesa ${table})`,
    reference: `Mesa ${table} · Garçom ${waiter}`,
    customerName: `Mesa ${table} (${waiter})`,
    customerPhone: "(65) 3326-0000",
    neighborhood: "Salão Zuma",
    status: "preparo",
    paymentMethod: "Keeto Pay / NFC-e",
    subtotal: total.toFixed(2),
    total: total.toFixed(2),
    nfcNumber,
    nfcStatus: "autorizada",
    items: [
      {
        itemName: dish,
        quantity: qty,
        unitPrice: total / qty,
      }
    ],
  });

  dataStore.updateStock("SALM-01", -0.45);

  dataStore.logWebhook(
    "Keeto",
    `POS_TABLE_ORDER (Mesa ${table})`,
    200,
    22,
    {
      tableNumber: table,
      waiter,
      items: [{ name: dish, quantity: qty }],
      total,
      nfcNumber,
    }
  );

  return order;
}

export function executeSimulateMetaWhatsApp(customerName: string, text: string) {
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "108835006988",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "5565996458910", phone_number_id: "28491028471" },
              contacts: [{ profile: { name: customerName }, wa_id: "556599900000" }],
              messages: [
                {
                  from: "556599900000",
                  id: "wamid.HBgL" + Math.random().toString(36).substring(2),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: text },
                  type: "text",
                }
              ],
            },
            field: "messages",
          }
        ],
      }
    ],
  };

  dataStore.logWebhook(
    "Meta WhatsApp",
    "MESSAGES_RECEIVED (Webhook)",
    200,
    42,
    payload
  );

  return { success: true, payload };
}

export function executeSimulateWahaInbound(params: SimulateWahaParams) {
  const name = params.customerName || "Rodrigo Mendonça";
  const phone = params.phone || "5565999812401";
  const text = params.message || (params.hasVoice 
    ? "Boa noite Zumi! Quero pedir aquele Combo Especial 56 Peças para entregar aqui no Tarumã!" 
    : "Oi Zumi! Gostaria de saber os combos disponíveis hoje com frete grátis.");
  const isVoice = Boolean(params.hasVoice);

  const payload = {
    event: isVoice ? "message.voice" : "message",
    session: "default",
    payload: {
      id: "waha_msg_" + Math.random().toString(36).substring(2, 10),
      timestamp: Math.floor(Date.now() / 1000),
      from: `${phone}@c.us`,
      fromMe: false,
      body: text,
      hasMedia: isVoice,
      type: isVoice ? "ptt" : "text",
      media: isVoice ? {
        mimetype: "audio/ogg; codecs=opus",
        duration: params.durationSeconds || 14,
        transcription: text,
      } : null,
      _data: {
        notifyName: name,
      }
    }
  };

  dataStore.logWebhook(
    "WAHA Server",
    isVoice ? "WAHA_VOICE_INBOUND (Nota de Voz PTT)" : "WAHA_MESSAGE_RECEIVED",
    200,
    18,
    payload
  );

  return { success: true, payload };
}

export function executeSimulateSicrediPix(params: SimulateSicrediPixParams) {
  const name = params.customerName || "Lucas Vasconcelos";
  const amount = params.amount || 69.90;
  const txId = params.txId || "SICREDI_" + Math.floor(100000 + Math.random() * 900000);

  const payload = {
    endToEndId: "E01181521" + Date.now() + "SICREDI01",
    txid: txId,
    valor: amount.toFixed(2),
    horario: new Date().toISOString(),
    pagador: {
      nome: name,
      cpf: "***.892.101-**",
      instituicao: "Cooperativa Sicredi União MT/PA - Tangará da Serra",
    },
    infoAdicional: "Pedido Zuma Sushi Delivery Tangará"
  };

  dataStore.logWebhook(
    "Sicredi Pix MT",
    `PIX_CONFIRMADO (${formatBrl(amount)})`,
    200,
    12,
    payload
  );

  return { success: true, payload };
}

export function executeSimulateOpenDelivery(params: { channel?: string; customerName?: string; dishName?: string; total?: number }) {
  const channel = params.channel || "Aiqfome Tangará";
  const customerName = params.customerName || "Camila Brandão";
  const dishName = params.dishName || "Uramaki Especial Salmão Trufado (16un)";
  const total = params.total || 58.90;

  return dataStore.processOpenDeliveryOrder({
    id: "OD_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    channel,
    customer: { name: customerName, phone: "(65) 99877-3322" },
    deliveryAddress: { neighborhood: "Jardim Tarumã", street: "Rua das Camélias, 412" },
    items: [{ name: dishName, quantity: 1, unitPrice: total }],
    total: { orderAmount: total },
    payments: [{ name: "Cartão Online via " + channel }]
  });
}

export function executeSimulateStockRupture(params: { materialName?: string; deltaKg?: number }) {
  const name = params.materialName || "Salmão Fresco Especial";
  const delta = params.deltaKg || -5.0;
  
  // Baixa o estoque do salmão para nível crítico
  dataStore.updateRawMaterialStock("SALM-01", delta);
  return {
    success: true,
    triggeredAutoPause: true,
    material: name,
    message: `Ruptura simulada: ${name} consumido (${delta}kg). Auto-pausa acionada no iFood para os combinados dependentes.`
  };
}

// ==========================================
// GERADORES DE MENSAGENS E TEMPLATES FISCAIS
// ==========================================
export function montarTextoComprovanteWhatsApp(dados: {
  mesaNome: string;
  atendente: string;
  totalPago: number;
  formaPagamento: string;
  chaveNfce: string;
  protocoloNfce?: string;
  itens?: Array<{ itemName?: string; name?: string; quantity?: number; unitPrice?: number; price?: number }>;
  comprovanteTef?: any;
}): string {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Cuiaba" });
  let itensStr = "";
  if (dados.itens && dados.itens.length > 0) {
    itensStr = dados.itens.map(i => {
      const nome = i.itemName || i.name || "Item";
      const qtd = i.quantity || 1;
      const preco = (i.unitPrice || i.price || 0) * qtd;
      return `• ${qtd}x ${nome} - ${formatBrl(preco)}`;
    }).join("\n");
  } else {
    itensStr = `• Consumo da ${dados.mesaNome} - ${formatBrl(dados.totalPago)}`;
  }

  let tefInfo = "";
  if (dados.comprovanteTef) {
    tefInfo = `\n💳 *AUTORIZAÇÃO TEF / MAQUININHA:*\nTerminal: ${dados.comprovanteTef.terminalNome || "POS Zuma"}\nNSU Host: ${dados.comprovanteTef.nsuHost || "NSU-892147"}\nCódigo AUT: ${dados.comprovanteTef.codigoAutorizacao || "AUT-582910"}\nBandeira: ${dados.comprovanteTef.bandeira || "Mastercard"} (${dados.comprovanteTef.modalidade || "Crédito"})\n`;
  }

  return `🥢 *ZUMA COZINHA ORIENTAL* - Tangará da Serra/MT\nCNPJ: 36.296.848/0001-57 · IE: 13.784.912-0\nAv. Brasil, 1450 - Centro, Tangará da Serra - MT\n----------------------------------------\n🧾 *COMPROVANTE DE CONTA & NFC-e SEFAZ-MT*\n*${dados.mesaNome}* · Atendente: ${dados.atendente}\nData/Hora: ${agora}\n----------------------------------------\n*CONSUMO DA CONTA:*\n${itensStr}\n----------------------------------------\n*VALOR TOTAL PAGO: ${formatBrl(dados.totalPago)}*\n*Forma de Pagamento:* ${dados.formaPagamento}${tefInfo}\n----------------------------------------\n🔐 *CHAVE DE ACESSO NFC-e SEFAZ-MT:*\n${dados.chaveNfce}\nProtocolo de Autorização: ${dados.protocoloNfce || "151260084729184"}\n\n📲 *Consulte o Documento Fiscal Oficial:*\nhttps://www.sefaz.mt.gov.br/nfce/consultanfce?p=${dados.chaveNfce}\n----------------------------------------\nAgradecemos a preferência! Volte sempre ao Zuma! ✨🥢`;
}

export function montarTemplateHtmlEmailFiscal(dados: {
  from: string;
  to: string;
  mesaNome: string;
  atendente: string;
  totalPago: number;
  formaPagamento: string;
  chaveNfce: string;
  protocoloNfce?: string;
  itens?: Array<{ itemName?: string; name?: string; quantity?: number; unitPrice?: number; price?: number }>;
  comprovanteTef?: any;
}): string {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Cuiaba" });
  let itensRows = "";
  if (dados.itens && dados.itens.length > 0) {
    itensRows = dados.itens.map(i => {
      const nome = i.itemName || i.name || "Item";
      const qtd = i.quantity || 1;
      const preco = (i.unitPrice || i.price || 0) * qtd;
      return `<tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 13px;">${qtd}x ${nome}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #27272a; color: #10b981; font-weight: bold; text-align: right; font-size: 13px;">${formatBrl(preco)}</td>
      </tr>`;
    }).join("");
  } else {
    itensRows = `<tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 13px;">Consumo da ${dados.mesaNome}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #27272a; color: #10b981; font-weight: bold; text-align: right; font-size: 13px;">${formatBrl(dados.totalPago)}</td>
    </tr>`;
  }

  let tefHtml = "";
  if (dados.comprovanteTef) {
    tefHtml = `
    <div style="margin-top: 16px; padding: 14px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px;">
      <div style="font-weight: bold; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Comprovante de Autorização TEF</div>
      <div style="font-size: 13px; color: #e4e4e7; line-height: 1.5;">
        <strong>Terminal:</strong> ${dados.comprovanteTef.terminalNome || "POS Zuma"}<br/>
        <strong>NSU Host:</strong> ${dados.comprovanteTef.nsuHost || "NSU-892147"} &nbsp;|&nbsp; <strong>Código AUT:</strong> ${dados.comprovanteTef.codigoAutorizacao || "AUT-582910"}<br/>
        <strong>Bandeira:</strong> ${dados.comprovanteTef.bandeira || "Mastercard"} (${dados.comprovanteTef.modalidade || "Crédito"})
      </div>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Zuma Tangará - Comprovante Fiscal NFC-e</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #121215; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    
    <!-- Top Header -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 24px 32px; border-bottom: 1px solid #047857; text-align: center;">
      <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.1em; color: #34d399;">🥢 ZUMA COZINHA ORIENTAL</div>
      <div style="font-size: 12px; color: #a7f3d0; margin-top: 4px; letter-spacing: 0.05em;">TANGARÁ DA SERRA · MATO GROSSO</div>
      <div style="display: inline-block; margin-top: 12px; padding: 4px 14px; background-color: #10b981; color: #022c22; font-weight: 800; font-size: 11px; border-radius: 9999px; text-transform: uppercase;">
        DANFE NFC-e SEFAZ-MT Emitido com Sucesso
      </div>
    </div>

    <!-- Info Box -->
    <div style="padding: 24px 32px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 14px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 11px; color: #71717a; text-transform: uppercase;">Identificação</div>
          <div style="font-size: 16px; font-weight: bold; color: #ffffff;">${dados.mesaNome}</div>
          <div style="font-size: 12px; color: #a1a1aa;">Atendente: ${dados.atendente}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #71717a; text-transform: uppercase;">Data e Horário</div>
          <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${agora}</div>
          <div style="font-size: 11px; color: #10b981;">NFC-e Autorizada SEFAZ-MT</div>
        </div>
      </div>

      <!-- Itens Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #18181b;">
            <th style="padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #a1a1aa; border-radius: 6px 0 0 6px;">Descrição do Item</th>
            <th style="padding: 10px 14px; text-align: right; font-size: 11px; text-transform: uppercase; color: #a1a1aa; border-radius: 0 6px 6px 0;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${itensRows}
        </tbody>
      </table>

      <!-- Total Box -->
      <div style="background-color: #18181b; padding: 16px 20px; border-radius: 12px; border: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 12px; color: #a1a1aa;">Forma de Pagamento: <strong>${dados.formaPagamento}</strong></div>
          <div style="font-size: 11px; color: #71717a; margin-top: 2px;">Transação Liquidada e Conciliada</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #a1a1aa; text-transform: uppercase;">Total Pago</div>
          <div style="font-size: 24px; font-weight: 900; color: #10b981;">${formatBrl(dados.totalPago)}</div>
        </div>
      </div>

      ${tefHtml}

      <!-- Dados Fiscais SEFAZ -->
      <div style="margin-top: 20px; padding: 16px; background-color: #0c0a09; border: 1px solid #292524; border-radius: 12px;">
        <div style="font-weight: bold; font-size: 11px; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Selo Fiscal SEFAZ-MT (NFC-e)
        </div>
        <div style="font-size: 11px; font-family: monospace; color: #e4e4e7; word-break: break-all; line-height: 1.4; background-color: #1c1917; padding: 8px 10px; border-radius: 6px;">
          <strong>Chave de Acesso:</strong><br/>${dados.chaveNfce}
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: #a1a1aa;">
          <strong>Protocolo de Autorização:</strong> ${dados.protocoloNfce || "151260084729184"}<br/>
          <strong>Ambiente:</strong> Produção SEFAZ-MT · <strong>Série:</strong> 1
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #09090b; border-top: 1px solid #27272a; padding: 20px 32px; font-size: 11px; color: #71717a; text-align: center; line-height: 1.6;">
      <div><strong>ZUMA GASTRONOMIA ORIENTAL LTDA</strong> · CNPJ: 36.296.848/0001-57</div>
      <div>Av. Brasil, 1450 - Centro, Tangará da Serra - MT, CEP: 78300-000</div>
      <div style="margin-top: 6px; color: #a1a1aa;">
        E-mail de envio oficial: <strong style="color: #10b981;">contato@kytto.com.br</strong> · Desenvolvido por Kytto IA Pilot
      </div>
    </div>

  </div>
</body>
</html>`;
}
