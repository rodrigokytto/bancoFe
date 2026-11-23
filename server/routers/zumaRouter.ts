import axios from "axios";
import {
  calculatePurchaseForecast,
  ZUMA_TECHNICAL_SHEETS,
  ZUMA_SUPPLIERS,
  ZUMA_RAW_MATERIALS
} from "../../shared/forecastingData";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  campaigns,
  conversationMessages,
  conversations,
  customers,
  knowledgeBase,
  leads,
  orderItems,
  orders,
  reservations,
  reviews,
  stockItems,
} from "../../drizzle/schema";
import {
  ALL_ITEMS,
  formatBrl,
  getItemCost,
  getItemUsage,
  MENU,
  TANGARA_MARKET_GAPS,
  TANGARA_ZONAS_LOGISTICA,
} from "../../shared/zumaData";

import {
  chatWithZumi,
  generateCampaignCopy,
  generateReviewReply,
  generateAiCompletion,
} from "../aiService";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { dataStore } from "../dataStore";
import {
  executeSimulateIfoodOrder,
  executeSimulateKeetoPos,
  executeSimulateMetaWhatsApp,
  executeSimulateWahaInbound,
  executeSimulateSicrediPix,
  executeSimulateOpenDelivery,
  executeSimulateStockRupture,
  montarTextoComprovanteWhatsApp,
  montarTemplateHtmlEmailFiscal,
} from "../integrationsService";
import { ecosystemService } from "../ecosystemService";
import {
  LAT_ZUMA,
  LNG_ZUMA,
  TANGARA_PONTOS_CRITICOS,
  calcularRotaTangara,
  otimizarLoteEntregas
} from "../../shared/tangaraRoutingEngine";

export const zumaRouter = router({
  // ==================== VENDAS & PEDIDOS ====================
  listOrders: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      try {
        const allOrders = await db.select().from(orders).orderBy(desc(orders.id)).limit(100);
        const allItems = await db.select().from(orderItems);
        return allOrders.map(o => ({
          ...o,
          items: allItems.filter(i => i.orderId === o.id)
        }));
      } catch (e) {
        console.warn("[Router] DB listOrders error, fallback to dataStore:", e);
      }
    }
    return dataStore.getOrders();
  }),

  createOrder: publicProcedure
    .input(
      z.object({
        channel: z.string().default("PDV"),
        reference: z.string().optional(),
        customerName: z.string().default("Cliente Balcão"),
        customerPhone: z.string().optional(),
        neighborhood: z.string().default("Centro"),
        paymentMethod: z.string().default("Pix"),
        hasCpf: z.boolean().default(false),
        cpf: z.string().optional(),
        deliveryFee: z.number().default(0),
        deliveryAddress: z.string().optional(),
        deliveryCep: z.string().optional(),
        deliveryNotes: z.string().optional(),
        motoboyName: z.string().optional(),
        trocoPara: z.number().optional(),
        empresa: z.enum(["gastronomia", "moda"]).optional(),
        items: z.array(
          z.object({
            itemName: z.string(),
            category: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const subtotal = input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const db = await getDb();
      if (db) {
        try {
          const cmv = input.items.reduce((s, i) => s + i.quantity * getItemCost({ nome: i.itemName, cat: i.category }), 0);
          const [maxOrder] = await db.select({ maxNum: sql<number>`MAX(orderNumber)` }).from(orders);
          const nextOrderNumber = (maxOrder?.maxNum || 300) + 1;
          const [maxNfc] = await db.select({ maxNfc: sql<number>`MAX(nfcNumber)` }).from(orders);
          const nextNfcNumber = (maxNfc?.maxNfc || 4820) + 1;

          const [insertedOrder] = await db.insert(orders).values({
            orderNumber: nextOrderNumber,
            channel: input.channel,
            reference: input.reference || null,
            customerName: input.customerName,
            customerPhone: input.customerPhone || null,
            neighborhood: input.neighborhood,
          status: "novo",
          paymentMethod: input.paymentMethod,
          subtotal: subtotal.toFixed(2),
          deliveryFee: (input.deliveryFee || 0).toFixed(2),
          discount: "0.00",
          total: (subtotal + (input.deliveryFee || 0)).toFixed(2),
          cmv: cmv.toFixed(2),
          nfcNumber: nextNfcNumber,
            nfcStatus: "autorizada",
            hasCpf: input.hasCpf,
            cpf: input.cpf || null,
            estimatedMinutes: 45,
          }).$returningId();

          for (const item of input.items) {
            const itemTotal = item.quantity * item.unitPrice;
            const itemUnitCost = getItemCost({ nome: item.itemName, cat: item.category });
            await db.insert(orderItems).values({
              orderId: insertedOrder.id,
              itemName: item.itemName,
              category: item.category,
              quantity: item.quantity,
              unitPrice: item.unitPrice.toFixed(2),
              unitCost: itemUnitCost.toFixed(2),
              totalPrice: itemTotal.toFixed(2),
            });

            const usage = getItemUsage({ nome: item.itemName, cat: item.category });
            for (const [stockKey, qtyUsed] of Object.entries(usage)) {
              const totalUsage = qtyUsed * item.quantity;
              await db
                .update(stockItems)
                .set({
                  currentStock: sql`GREATEST(0, currentStock - ${totalUsage})`,
                })
                .where(eq(stockItems.code, stockKey));
            }
          }

          return {
            success: true,
            orderId: insertedOrder.id,
            orderNumber: nextOrderNumber,
            nfcNumber: nextNfcNumber,
            total: subtotal,
          };
        } catch (e) {
          console.warn("[Router] DB createOrder error, falling back to dataStore:", e);
        }
      }

      // Fallback dataStore
      const created = dataStore.createOrder({
        channel: input.channel,
        reference: input.reference,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        neighborhood: input.neighborhood,
        deliveryFee: input.deliveryFee || 0,
        deliveryAddress: input.deliveryAddress,
        deliveryCep: input.deliveryCep,
        deliveryNotes: input.deliveryNotes,
        motoboyName: input.motoboyName,
        trocoPara: input.trocoPara,
        status: "novo",
        paymentMethod: input.paymentMethod,
        subtotal: subtotal.toFixed(2),
        total: (subtotal + (input.deliveryFee || 0)).toFixed(2),
        nfcStatus: "autorizada",
        items: input.items,
      });

      return {
        success: true,
        orderId: created.id,
        orderNumber: created.orderNumber,
        nfcNumber: 4820 + created.orderNumber,
        total: subtotal + (input.deliveryFee || 0),
      };
    }),

  advanceOrderStatus: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        try {
          const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
          if (order) {
            const sequence: Record<string, "preparo" | "pronto" | "rota" | "entregue"> = {
              novo: "preparo",
              preparo: "pronto",
              pronto: "rota",
              rota: "entregue",
            };
           const nextStatus = sequence[order.status];
           if (nextStatus) {
             await db.update(orders).set({ status: nextStatus }).where(eq(orders.id, input.orderId));
           }
          }
        } catch (e) {
          console.warn("[Router] DB advanceOrderStatus error:", e);
        }
      }
      const dsRes = dataStore.advanceOrderStatus(input.orderId);
      return { success: true, nextStatus: dsRes.nextStatus, order: dsRes.order };
    }),

  updateOrderDetails: publicProcedure
    .input(z.object({
      orderId: z.number(),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      neighborhood: z.string().optional(),
      status: z.enum(["novo", "recebido", "preparo", "pronto", "rota", "entrega", "entregue"]).optional(),
      items: z.array(z.object({
        itemName: z.string(),
        quantity: z.coerce.number(),
        unitPrice: z.coerce.number().optional(),
        station: z.string().optional(),
        notes: z.string().optional(),
        observacoes: z.string().optional(),
        adicionais: z.array(z.object({ nome: z.string(), preco: z.coerce.number() })).optional(),
      })).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        try {
          if (input.customerName) {
            await db.update(orders).set({
              customerName: input.customerName,
              customerPhone: input.customerPhone,
              neighborhood: input.neighborhood,
              status: input.status as any,
            }).where(eq(orders.id, input.orderId));
          }
        } catch (e) {
          console.warn("[Router] DB updateOrderDetails error:", e);
        }
      }
      const dsRes = dataStore.updateOrderDetails(input.orderId, input as any);
      return { success: true, order: dsRes.order };
    }),

  setOrderStatus: publicProcedure
    .input(z.object({
      orderId: z.number(),
      status: z.enum(["novo", "recebido", "preparo", "pronto", "rota", "entrega", "entregue"])
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        try {
          const dbStatus = input.status === "recebido" ? "novo" : input.status === "entrega" ? "rota" : input.status;
          await db.update(orders).set({ status: dbStatus as any }).where(eq(orders.id, input.orderId));
        } catch (e) {
          console.warn("[Router] DB setOrderStatus error:", e);
        }
      }
      const dsRes = dataStore.setOrderStatus(input.orderId, input.status);
      return { success: true, status: dsRes.status, order: dsRes.order };
    }),

  // ==================== WHATSAPP & IA ====================
  listConversations: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      try {
        const convs = await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
        if (convs.length > 0) {
          const allMsgs = await db.select().from(conversationMessages).orderBy(conversationMessages.createdAt);
          return convs.map(c => ({
            ...c,
            messages: allMsgs.filter(m => m.conversationId === c.id),
          }));
        }
      } catch (e) {
        console.warn("[Router] DB listConversations error, using dataStore:", e);
      }
    }
    return dataStore.getConversations();
  }),

  getConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input }) => {
      const conv = dataStore.getConversation(input.conversationId);
      if (!conv) throw new Error("Conversa não encontrada");
      const customer = dataStore.getCustomerByName(conv.customerName);
      return {
        conversation: conv,
        customerProfile: customer,
      };
    }),

  sendWhatsAppMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        authorType: z.enum(["cli", "ia", "hum", "sys"]),
        authorName: z.string().optional(),
        content: z.string(),
        messageType: z.enum(["text", "audio", "image", "receipt"]).optional(),
        audioDurationSeconds: z.number().optional(),
        audioTranscription: z.string().optional(),
        mediaUrl: z.string().optional(),
        receiptDetails: z.object({
          amount: z.number(),
          bank: z.string(),
          txId: z.string(),
          status: z.enum(["validado", "pendente"]),
          verifiedAt: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // 1. Gravar no dataStore
      const msg = dataStore.addMessage(input.conversationId, {
        authorType: input.authorType,
        authorName: input.authorName,
        content: input.content,
        messageType: input.messageType,
        audioDurationSeconds: input.audioDurationSeconds,
        audioTranscription: input.audioTranscription,
        mediaUrl: input.mediaUrl,
        receiptDetails: input.receiptDetails,
        createdAt: new Date().toISOString(),
      });

      const conv = dataStore.getConversation(input.conversationId);
      if (!conv) throw new Error("Conversa não encontrada");

      // Se for comprovante PIX válido, registrar validação imediata da IA
      if (input.messageType === "receipt" && input.receiptDetails?.status === "validado") {
        dataStore.addMessage(input.conversationId, {
          authorType: "ia",
          authorName: "Zumi (IA)",
          content: `Comprovante Pix de ${formatBrl(input.receiptDetails.amount)} autenticado com sucesso! 🧾✅ Seu pagamento foi confirmado pelo sistema do Zuma e o pedido já entrou na esteira da cozinha. Você pode acompanhar o status por aqui!`,
          createdAt: new Date().toISOString(),
        });
        return { success: true, message: msg };
      }

      // 2. Se a mensagem foi escrita pelo cliente e a conversa está em 'ia', acionar IA Zumi
      if (input.authorType === "cli" && conv.status === "ia") {
        const kbList = dataStore.getKnowledgeBase().filter(k => k.status === "aprovado");
        const customerProfile = dataStore.getCustomerByName(conv.customerName);

        const aiResponse = await chatWithZumi({
          customerName: conv.customerName,
          messages: conv.messages.map(m => ({
            authorType: m.authorType,
            content: m.messageType === "audio" && m.audioTranscription ? m.audioTranscription : m.content,
          })),
          cart: conv.cart || [],
          knowledgeBaseRules: kbList.map(k => ({ question: k.question, answer: k.answer })),
          customerProfile: customerProfile ? {
            neighborhood: customerProfile.neighborhood,
            dietaryPreferences: customerProfile.dietaryPreferences,
            favoriteDish: customerProfile.favoriteDish,
            aiProfileSummary: customerProfile.aiProfileSummary,
            recommendedPromo: customerProfile.recommendedPromo,
          } : undefined,
        });

        // Gravar resposta do Zumi
        dataStore.addMessage(input.conversationId, {
          authorType: "ia",
          authorName: "Zumi (IA)",
          content: aiResponse.text,
          createdAt: new Date().toISOString(),
        });

        const updates: Partial<typeof conv> = {};

        // Se houve adição ao carrinho
        if (aiResponse.addedItem) {
          const currentCart = [...(conv.cart || [])];
          const itemExists = currentCart.find(i => i.nome === aiResponse.addedItem!.nome);
          if (itemExists) {
            itemExists.q += aiResponse.addedItem.q;
          } else {
            currentCart.push(aiResponse.addedItem);
          }
          updates.cart = currentCart;
        }

        // Se a IA solicitou transbordo (BOX FICA PULSANDO EM VERMELHO!)
        if (aiResponse.handoffReason) {
          updates.status = "fila";
          updates.handoffReason = aiResponse.handoffReason;
          updates.reasons = [...(conv.reasons || []), aiResponse.handoffReason];
          updates.queuedAt = new Date().toISOString();
          updates.handoffsCount = (conv.handoffsCount || 0) + 1;

          dataStore.addMessage(input.conversationId, {
            authorType: "sys",
            content: `🚨 Zumi solicitou transbordo para a equipe · Motivo: ${aiResponse.handoffReason}`,
            createdAt: new Date().toISOString(),
          });
        }

        // Se a IA fechou o pedido
        if (aiResponse.closeOrder && (conv.cart || []).length > 0) {
          const cartTotal = (conv.cart || []).reduce((s, i) => s + i.q * i.preco, 0);
          updates.saleAmount = cartTotal.toFixed(2);
          dataStore.addMessage(input.conversationId, {
            authorType: "sys",
            content: `Pedido enviado à cozinha · ${formatBrl(cartTotal)}`,
            createdAt: new Date().toISOString(),
          });
        }

        dataStore.updateConversation(input.conversationId, updates);
      }

      // 3. Se a mensagem foi enviada por atendente humano, registrar aprendizado em potencial
      if (input.authorType === "hum" && input.content.length > 25) {
        const lastUserMsg = [...conv.messages]
          .reverse()
          .find(m => m.authorType === "cli");

        if (lastUserMsg) {
          dataStore.createKnowledge(
            lastUserMsg.content,
            input.content,
            `Resposta da equipe (${input.authorName || "Ana"})`,
            input.conversationId
          );
        }
      }

      return { success: true, message: msg };
    }),

  updateConversationStatus: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        action: z.enum(["assume", "backToAi", "resolve", "reopen"]),
        agentName: z.string().default("Ana (equipe)"),
      })
    )
    .mutation(async ({ input }) => {
      const conv = dataStore.getConversation(input.conversationId);
      if (!conv) throw new Error("Conversa não encontrada");

      if (input.action === "assume") {
        dataStore.updateConversation(input.conversationId, {
          status: "humano",
          assignedAgent: input.agentName,
        });

        dataStore.addMessage(input.conversationId, {
          authorType: "sys",
          content: `${input.agentName} assumiu o atendimento`,
          createdAt: new Date().toISOString(),
        });
      } else if (input.action === "backToAi") {
        dataStore.updateConversation(input.conversationId, {
          status: "ia",
          assignedAgent: null,
          returnsCount: (conv.returnsCount || 0) + 1,
        });

        dataStore.addMessage(input.conversationId, {
          authorType: "sys",
          content: `${conv.assignedAgent || input.agentName} devolveu o atendimento para a IA Zumi`,
          createdAt: new Date().toISOString(),
        });

        dataStore.addMessage(input.conversationId, {
          authorType: "ia",
          authorName: "Zumi (IA)",
          content: `Oi de novo, ${conv.customerName.split(" ")[0]}! Aqui é o Zumi 🐟 Assumi o controle de volta para te acompanhar até a entrega do seu sushi. Se precisar de algo, só me chamar por aqui! 🥢`,
          createdAt: new Date().toISOString(),
        });
      } else if (input.action === "resolve") {
        const resolvedBy = conv.handoffsCount > 0 ? "Equipe + IA" : "IA";
        dataStore.updateConversation(input.conversationId, {
          status: "resolvida",
          resolvedBy,
        });

        dataStore.addMessage(input.conversationId, {
          authorType: "sys",
          content: `Conversa finalizada e resolvida com sucesso · ${resolvedBy}`,
          createdAt: new Date().toISOString(),
        });
      } else if (input.action === "reopen") {
        dataStore.updateConversation(input.conversationId, {
          status: "ia",
          resolvedBy: null,
        });

        dataStore.addMessage(input.conversationId, {
          authorType: "sys",
          content: "Conversa reaberta com a IA Zumi",
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true };
    }),

  // Fechamento de Venda Rápida pela Equipe + Devolução para IA + Aprendizado
  closeSaleAndHandover: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        customerName: z.string(),
        items: z.array(
          z.object({
            nome: z.string(),
            preco: z.number(),
            cat: z.string().default("Combinados"),
            q: z.number().min(1),
          })
        ),
        discount: z.number().default(0),
        deliveryFee: z.number().default(0),
        paymentMethod: z.string().default("Pix"),
        attendantNotes: z.string().optional(),
        returnToAi: z.boolean().default(true),
        resolveConversation: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const conv = dataStore.getConversation(input.conversationId);
      if (!conv) throw new Error("Conversa não encontrada");

      const subtotal = input.items.reduce((s, i) => s + i.q * i.preco, 0);
      const finalTotal = Math.max(0, subtotal - input.discount + input.deliveryFee);

      // 1. Criar o pedido oficial
      const order = dataStore.createOrder({
        channel: "WhatsApp",
        reference: `Whats ${conv.customerName}`,
        customerName: conv.customerName,
        customerPhone: conv.customerPhone,
        neighborhood: conv.neighborhood,
        status: "preparo",
        paymentMethod: input.paymentMethod,
        subtotal: subtotal.toFixed(2),
        deliveryFee: input.deliveryFee.toFixed(2),
        discount: input.discount.toFixed(2),
        total: finalTotal.toFixed(2),
        items: input.items.map(i => ({
          itemName: i.nome,
          category: i.cat,
          quantity: i.q,
          unitPrice: i.preco,
        })),
      });

      // 2. Atualizar carrinho e valor da venda na conversa
      conv.cart = input.items;
      conv.saleAmount = finalTotal.toFixed(2);

      // 3. Inserir mensagem de fechamento de venda no chat
      const itemsListText = input.items.map(i => `${i.q}x ${i.nome}`).join(", ");
      const discountText = input.discount > 0 ? ` (Desconto aplicado: -${formatBrl(input.discount)})` : "";
      const deliveryText = input.deliveryFee === 0 ? " (Frete Grátis)" : ` (Taxa de entrega: ${formatBrl(input.deliveryFee)})`;

      dataStore.addMessage(input.conversationId, {
        authorType: "hum",
        authorName: conv.assignedAgent || "Ana (equipe)",
        content: `🎉 Pedido Fechado com Sucesso! Pedido #${order.orderNumber}.\nItens: ${itemsListText}${discountText}${deliveryText}.\nTotal: ${formatBrl(finalTotal)} via ${input.paymentMethod}.\nA cozinha já começou o preparo do seu sushi com todo capricho!`,
        createdAt: new Date().toISOString(),
      });

      dataStore.addMessage(input.conversationId, {
        authorType: "sys",
        content: `💰 VENDA FECHADA PELA EQUIPE · Pedido #${order.orderNumber} · Total: ${formatBrl(finalTotal)}`,
        createdAt: new Date().toISOString(),
      });

      // 4. A IA aprende com o fechamento e atualiza o perfil do cliente
      const updatedCustomer = dataStore.learnFromAttendantClosure({
        customerName: conv.customerName,
        saleAmount: finalTotal,
        orderedItems: input.items,
        attendantNotes: input.attendantNotes,
      });

      // 5. Devolver para a IA ou Encerrar
      if (input.returnToAi) {
        conv.status = "ia";
        conv.assignedAgent = null;
        conv.returnsCount = (conv.returnsCount || 0) + 1;

        dataStore.addMessage(input.conversationId, {
          authorType: "sys",
          content: `Atendimento devolvido com sucesso para a IA Zumi`,
          createdAt: new Date().toISOString(),
        });

        dataStore.addMessage(input.conversationId, {
          authorType: "ia",
          authorName: "Zumi (IA)",
          content: `Oi, ${conv.customerName.split(" ")[0]}! Aqui é o Zumi de volta 🐟 Assumi o controle para acompanhar seu pedido #${order.orderNumber} até a chegada do motoboy. Tempo estimado: 40 a 50 min. Qualquer dúvida, é só me chamar! 🥢🍣`,
          createdAt: new Date().toISOString(),
        });
      } else if (input.resolveConversation) {
        conv.status = "resolvida";
        conv.resolvedBy = "Equipe + IA";

        dataStore.addMessage(input.conversationId, {
          authorType: "sys",
          content: `Atendimento finalizado com venda concluída`,
          createdAt: new Date().toISOString(),
        });
      }

      dataStore.updateConversation(input.conversationId, conv);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: finalTotal,
        customerProfile: updatedCustomer,
      };
    }),

  createCustomerConversation: publicProcedure
    .input(
      z.object({
        name: z.string(),
        neighborhood: z.string(),
        customMessage: z.string().optional(),
        dietary: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = "conv-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const phone = "(65) 99" + Math.floor(100 + Math.random() * 899) + "-" + Math.floor(1000 + Math.random() * 8999);

      // Cadastra ou atualiza o cliente no CRM
      dataStore.saveCustomer({
        name: input.name,
        phone,
        neighborhood: input.neighborhood,
        segment: "novo",
        dietaryPreferences: input.dietary ? [input.dietary] : ["Sem restrições"],
        aiProfileSummary: `Cliente novo simulado do bairro ${input.neighborhood}. ${input.dietary ? `Restrição: ${input.dietary}.` : ""}`,
        recommendedPromo: `Frete promocional no ${input.neighborhood}`,
        recommendedDish: "Combo 26 Peças",
      });

      const newConv = dataStore.createConversation({
        id,
        customerName: input.name,
        customerPhone: phone,
        neighborhood: input.neighborhood,
        segment: "Lead WhatsApp",
        status: "ia",
        intent: "Dúvida sobre o cardápio",
        tags: ["novo contato", input.neighborhood],
        messages: [
          {
            id: 1,
            conversationId: id,
            authorType: "ia",
            authorName: "Zumi (IA)",
            content: `Oi, ${input.name}! Eu sou o Zumi, seu parceiro ninja no Zuma Cozinha Oriental 🐟 Me conta: quantas pessoas vão comer e qual a vontade de hoje?`,
            createdAt: new Date().toISOString(),
          }
        ]
      });

      if (input.customMessage) {
        // Se houver mensagem inicial do cliente, insere e aciona o Zumi
        dataStore.addMessage(id, {
          authorType: "cli",
          content: input.customMessage,
          createdAt: new Date().toISOString(),
        });

        // Aciona o Zumi para responder a mensagem inicial
        const aiResponse = await chatWithZumi({
          customerName: input.name,
          messages: [
            { authorType: "ia", content: "Oi!" },
            { authorType: "cli", content: input.customMessage }
          ],
          cart: [],
          customerProfile: {
            neighborhood: input.neighborhood,
            dietaryPreferences: input.dietary ? [input.dietary] : [],
          }
        });

        dataStore.addMessage(id, {
          authorType: "ia",
          authorName: "Zumi (IA)",
          content: aiResponse.text,
          createdAt: new Date().toISOString(),
        });

        if (aiResponse.handoffReason) {
          dataStore.updateConversation(id, {
            status: "fila",
            handoffReason: aiResponse.handoffReason,
            reasons: [aiResponse.handoffReason],
            queuedAt: new Date().toISOString(),
          });
        }
      }

      return { success: true, conversationId: id };
    }),

  // ==================== BASE DE CONHECIMENTO ====================
  listKnowledgeBase: publicProcedure.query(async () => {
    return dataStore.getKnowledgeBase();
  }),

  approveKnowledge: publicProcedure
    .input(z.object({ id: z.string(), answer: z.string().min(1) }))
    .mutation(async ({ input }) => {
      dataStore.approveKnowledge(input.id, input.answer);
      return { success: true };
    }),

  discardKnowledge: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      dataStore.discardKnowledge(input.id);
      return { success: true };
    }),

  createKnowledge: publicProcedure
    .input(z.object({ question: z.string().min(3), answer: z.string().min(3) }))
    .mutation(async ({ input }) => {
      const created = dataStore.createKnowledge(input.question, input.answer, "Cadastro manual");
      return { success: true, id: created.id };
    }),

  // ==================== CRM & PERFIL DE CLIENTES ====================
  getAiMetrics: publicProcedure.query(async () => {
    return dataStore.getAiPerformanceMetrics();
  }),

  listCustomers: publicProcedure.query(async () => {
    return dataStore.getCustomers();
  }),

  getCustomerProfile: publicProcedure
    .input(z.object({ customerName: z.string() }))
    .query(async ({ input }) => {
      const profile = dataStore.getCustomerByName(input.customerName);
      return profile || null;
    }),

  updateCustomerProfile: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        dietaryPreferences: z.array(z.string()).optional(),
        priceSensitivity: z.string().optional(),
        aiProfileSummary: z.string().optional(),
        recommendedDish: z.string().optional(),
        recommendedPromo: z.string().optional(),
        aiSalesTrigger: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updated = dataStore.saveCustomer({
        name: input.customerName,
        dietaryPreferences: input.dietaryPreferences,
        priceSensitivity: input.priceSensitivity,
        aiProfileSummary: input.aiProfileSummary,
        recommendedDish: input.recommendedDish,
        recommendedPromo: input.recommendedPromo,
        aiSalesTrigger: input.aiSalesTrigger,
      });
      return { success: true, profile: updated };
    }),

  triggerRecoveryWave: publicProcedure
    .input(z.object({ waveNumber: z.number() }))
    .mutation(async ({ input }) => {
      const customersList = dataStore.getCustomers();
      const inactive = customersList.filter(c => c.segment === "sumido");
      for (const cust of inactive) {
        cust.recoveryWave = input.waveNumber;
        cust.recoveryStatus = Math.random() < 0.25 ? "voltou" : "nao_respondeu";
      }
      return { success: true };
    }),

  // ==================== ESTOQUE ====================
  listStock: publicProcedure.query(async () => {
    return dataStore.getStock();
  }),

  addStockEntry: publicProcedure
    .input(z.object({ code: z.string(), quantity: z.number().positive() }))
    .mutation(async ({ input }) => {
      dataStore.updateStock(input.code, input.quantity);
      return { success: true };
    }),

  // ==================== RESERVAS ====================
  listReservations: publicProcedure.query(async () => {
    return dataStore.getReservations();
  }),

  callWaitlistCustomer: publicProcedure
    .input(z.object({ reservationId: z.number() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  // ==================== REPUTAÇÃO ====================
  listReviews: publicProcedure.query(async () => {
    return dataStore.getReviews();
  }),

  generateAiReviewReply: publicProcedure
    .input(
      z.object({
        reviewId: z.number(),
        platform: z.string(),
        rating: z.number(),
        comment: z.string(),
        authorName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const reply = await generateReviewReply({
        platform: input.platform,
        rating: input.rating,
        comment: input.comment,
        authorName: input.authorName,
      });
      return { success: true, reply };
    }),

  // ==================== CAMPANHAS ====================
  generateCampaignCopy: publicProcedure
    .input(
      z.object({
        segment: z.string(),
        goal: z.string(),
        dish: z.string(),
        offer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const copy = await generateCampaignCopy(input);
      return { success: true, copy };
    }),

  listCampaigns: publicProcedure.query(async () => {
    return dataStore.getCampaigns();
  }),

  launchCampaign: publicProcedure
    .input(
      z.object({
        segment: z.string(),
        goal: z.string(),
        dish: z.string(),
        offer: z.string(),
        message: z.string(),
        recipientsCount: z.number().default(0),
        expectedOrders: z.number().default(0),
        expectedRevenue: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  // ==================== LEADS ====================
  listLeads: publicProcedure.query(async () => {
    return dataStore.getLeads();
  }),

  createLead: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        profile: z.string(),
        origin: z.string().default("Quiz"),
        prize: z.string(),
        optIn: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      dataStore.saveCustomer({
        name: input.name,
        phone: input.phone,
        segment: "lead",
        favoriteDish: "Combo 26 Peças",
        optIn: input.optIn,
        tags: ["lead do quiz", input.profile, input.prize],
      });
      return { success: true };
    }),

  // ==================== INTEGRAÇÕES & WEBHOOKS ====================
  listWebhookLogs: publicProcedure.query(async () => {
    return dataStore.getWebhookLogs(100);
  }),

  clearWebhookLogs: publicProcedure.mutation(async () => {
    dataStore.clearWebhookLogs();
    return { success: true };
  }),

  simulateIfoodOrder: publicProcedure
    .input(
      z.object({
        customerName: z.string().optional(),
        neighborhood: z.string().optional(),
        dishName: z.string().optional(),
        quantity: z.number().optional(),
        total: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const order = executeSimulateIfoodOrder(input);
      return { success: true, order };
    }),

  simulateKeetoOrder: publicProcedure
    .input(
      z.object({
        tableNumber: z.number().optional(),
        waiter: z.string().optional(),
        dishName: z.string().optional(),
        quantity: z.number().optional(),
        total: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const order = executeSimulateKeetoPos(input);
      return { success: true, order };
    }),

  simulateMetaWhatsAppMessage: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = executeSimulateMetaWhatsApp(input.customerName, input.text);
      return { success: true, result };
    }),

  getIntegrationsHealth: publicProcedure.query(async () => {
    return {
      status: "operational",
      version: "2.4.0",
      channels: [
        { id: "waha", name: "WAHA Server (WhatsApp HTTP API)", status: "ONLINE", latency: "14ms", category: "messaging", active: true, engine: "NOWEB" },
        { id: "ifood", name: "iFood Merchant API", status: "ONLINE", latency: "38ms", category: "delivery", active: true },
        { id: "keeto", name: "Keeto POS & ERP", status: "ONLINE", latency: "22ms", category: "pos", active: true },
        { id: "sicredi", name: "Sicredi & Sicoob Pix MT", status: "ONLINE", latency: "12ms", category: "payments", active: true },
        { id: "meta", name: "Meta WhatsApp Cloud API", status: "ONLINE", latency: "42ms", category: "messaging", active: true },
        { id: "applepay", name: "Apple Pay Web Gateway", status: "ONLINE", latency: "18ms", category: "payments", active: true },
        { id: "sefaz", name: "SEFAZ-MT NFC-e Fiscal", status: "ONLINE", latency: "25ms", category: "pos", active: true },
        { id: "google", name: "Google Reserve & Maps", status: "ONLINE", latency: "60ms", category: "maps", active: true },
      ],
      timestamp: new Date().toISOString(),
    };
  }),

  // ==================== WAHA & COOPERATIVAS ====================
  getWahaSession: publicProcedure.query(async () => {
    return {
      name: "default",
      status: "WORKING",
      engine: "NOWEB",
      phone: "+55 (65) 99981-3344",
      pushName: "Zuma Cozinha Oriental - Tangará da Serra",
      battery: 98,
      plugged: true,
      uptimeSeconds: 184320,
      messagesToday: 412,
      latencyMs: 12,
      endpoint: "http://localhost:3000/api/waha",
      webhookUrl: "https://zuma.kytto.com.br/api/webhooks/waha",
      version: "v2026.11.2 (NOWEB Core)",
    };
  }),

  restartWahaSession: publicProcedure.mutation(async () => {
    dataStore.logWebhook(
      "WAHA Server",
      "SESSION_RESTARTED",
      200,
      28,
      { session: "default", status: "WORKING", reconnectedAt: new Date().toISOString(), engine: "NOWEB" }
    );
    return { success: true, status: "WORKING", latencyMs: 12 };
  }),

  getWahaLogs: publicProcedure.query(async () => {
    return dataStore.getWebhookLogs(50).filter(l => l.source.includes("WAHA"));
  }),

  enviarComprovanteWaha: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        mesaNumero: z.number().optional(),
        mesaNome: z.string().optional(),
        totalPago: z.number(),
        formaPagamento: z.string(),
        chaveNfce: z.string().optional(),
        protocoloNfce: z.string().optional(),
        itens: z.array(z.any()).optional(),
        comprovanteTef: z.any().optional(),
        atendente: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const rawDigits = (input.phone || "65999813344").replace(/\D/g, "");
      const target = rawDigits.startsWith("55") ? `${rawDigits}@c.us` : `55${rawDigits}@c.us`;
      const msgId = "waha_msg_recibo_" + Math.random().toString(36).substring(2, 10);

      const text = montarTextoComprovanteWhatsApp({
        mesaNome: input.mesaNome || `Mesa ${input.mesaNumero || "03"}`,
        atendente: input.atendente || "Salão",
        totalPago: input.totalPago,
        formaPagamento: input.formaPagamento,
        chaveNfce: input.chaveNfce || "51261136296848000157650010000049281893728192",
        protocoloNfce: input.protocoloNfce || "151260084729184",
        itens: input.itens || [],
        comprovanteTef: input.comprovanteTef
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
          mesaNome: input.mesaNome || `Mesa ${input.mesaNumero || "03"}`,
          totalPago: input.totalPago,
          formaPagamento: input.formaPagamento,
          chaveNfce: input.chaveNfce,
          status: "DELIVERED",
          timestamp: Date.now()
        }
      );

      return {
        success: true,
        messageId: msgId,
        to: target,
        status: "DELIVERED",
        text,
        timestamp: Date.now()
      };
    }),

  enviarEmailComprovanteMesa: publicProcedure
    .input(
      z.object({
        emailDestino: z.string(),
        mesaNumero: z.number().optional(),
        mesaNome: z.string().optional(),
        totalPago: z.number(),
        formaPagamento: z.string(),
        chaveNfce: z.string().optional(),
        protocoloNfce: z.string().optional(),
        itens: z.array(z.any()).optional(),
        comprovanteTef: z.any().optional(),
        atendente: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const emailId = "email_msg_" + Math.random().toString(36).substring(2, 10);
      const to = input.emailDestino || "rrodrigogon@gmail.com";

      const emailHtml = montarTemplateHtmlEmailFiscal({
        from: "contato@kytto.com.br",
        to,
        mesaNome: input.mesaNome || `Mesa ${input.mesaNumero || "03"}`,
        atendente: input.atendente || "Salão",
        totalPago: input.totalPago,
        formaPagamento: input.formaPagamento,
        chaveNfce: input.chaveNfce || "51261136296848000157650010000049281893728192",
        protocoloNfce: input.protocoloNfce || "151260084729184",
        itens: input.itens || [],
        comprovanteTef: input.comprovanteTef
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
          subject: `🧾 Zuma Tangará: DANFE NFC-e SEFAZ-MT e Comprovante (${input.mesaNome || `Mesa ${input.mesaNumero || "03"}`})`,
          status: "ENVIADO",
          chaveNfce: input.chaveNfce,
          totalPago: input.totalPago,
          timestamp: new Date().toISOString()
        }
      );

      return {
        success: true,
        messageId: emailId,
        from: "contato@kytto.com.br",
        to,
        status: "ENVIADO",
        previewHtml: emailHtml,
        timestamp: new Date().toISOString()
      };
    }),

  getEmailLogs: publicProcedure.query(async () => {
    return dataStore.getWebhookLogs(50).filter(l => l.source.includes("Email"));
  }),

  simulateWahaInbound: publicProcedure
    .input(
      z.object({
        customerName: z.string().optional(),
        message: z.string().optional(),
        hasVoice: z.boolean().optional(),
        durationSeconds: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = executeSimulateWahaInbound(input);
      return { success: true, result };
    }),

  simulateSicrediPix: publicProcedure
    .input(
      z.object({
        customerName: z.string().optional(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = executeSimulateSicrediPix(input);
      return { success: true, result };
    }),

  // ==================== IFOOD MERCHANT API v2 FULL LIFECYCLE ====================
  getIfoodOverview: publicProcedure.query(async () => {
    return dataStore.getIfoodOverview();
  }),

  ifoodSetStoreStatus: publicProcedure
    .input(
      z.object({
        status: z.enum(["ABERTO", "PAUSA_15", "PAUSA_30", "PAUSA_60", "FECHADO"]),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.setIfoodStoreStatus(input.status);
    }),

  ifoodConfirmOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        prepTimeMinutes: z.number().default(25),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.ifoodConfirmOrder(input.orderId, input.prepTimeMinutes);
    }),

  ifoodReadyOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.ifoodReadyOrder(input.orderId);
    }),

  ifoodDispatchOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        motoboyId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.ifoodDispatchOrder(input.orderId, input.motoboyId);
    }),

  ifoodConcludeOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.ifoodConcludeOrder(input.orderId);
    }),

  ifoodCancelOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.ifoodCancelOrder(input.orderId, input.reason);
    }),

  ifoodSyncCatalog: publicProcedure.mutation(async () => {
    return dataStore.syncIfoodCatalog();
  }),

  ifoodToggleItem: publicProcedure
    .input(
      z.object({
        dishName: z.string(),
        available: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.toggleIfoodItemAvailability(input.dishName, input.available);
    }),

  // ==================== KEETO POS & DELIVERY INTEGRATION ====================
  keetoGetTables: publicProcedure.query(async () => {
    return dataStore.getKeetoTablesOverview();
  }),

  keetoSendOrder: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        waiter: z.string().optional(),
        items: z.array(
          z.object({
            itemName: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            station: z.string().optional(),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.sendKeetoTableOrder(input);
    }),

  keetoCloseTable: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        paymentMethod: z.string().default("Pix"),
        splitCount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.closeTable(input.tableNumber, input.paymentMethod, input.splitCount);
    }),

  // ==================== OPEN DELIVERY & OMNICHANNEL METRICS ====================
  getOmnichannelDeliveryMetrics: publicProcedure.query(async () => {
    return dataStore.getOmnichannelDeliveryMetrics();
  }),

  simulateOpenDeliveryOrder: publicProcedure
    .input(
      z.object({
        channel: z.string().optional(),
        customerName: z.string().optional(),
        dishName: z.string().optional(),
        total: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = executeSimulateOpenDelivery(input);
      return { success: true, result };
    }),

  simulateStockRupture: publicProcedure
    .input(
      z.object({
        materialName: z.string().optional(),
        deltaKg: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = executeSimulateStockRupture(input);
      return { success: true, result };
    }),

  // ==================== MERCADO TANGARÁ DA SERRA & REGIÃO ====================
  getTangaraMarketInsights: publicProcedure.query(async () => {
    return {
      gaps: TANGARA_MARKET_GAPS,
      zones: TANGARA_ZONAS_LOGISTICA,
      stats: {
        city: "Tangará da Serra · Mato Grosso",
        population: 115000,
        agroDna: "Polo Agrícola & Pecuário de Alta Renda (Soja, Milho, Cana)",
        monthlyIfoodDrain: 14800,
        directChannelRevenueTarget: 78000,
        wahaCostEconomyVsMeta: "R$ 0,00 por conversa (Economia de ~R$ 1.200/mês)",
        regionalExpansionTowns: ["Nova Olímpia (45km)", "Barra do Bugres (70km)", "Campo Novo do Parecis (140km)"],
      }
    };
  }),

  // ==================== APIS REAIS AO VIVO: RECEITA FEDERAL (BRASILAPI), DÓLAR & IA ====================
  consultarCnpjReceita: publicProcedure
    .input(
      z.object({
        cnpj: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const cleanCnpj = input.cnpj.replace(/\D/g, "");
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
          headers: {
            "User-Agent": "ZumaPilot/1.0 (Tangara da Serra - MT)",
            "Accept": "application/json",
          },
          signal: AbortSignal.timeout(9000),
        });

        if (!res.ok) {
          return {
            success: false,
            error: `Receita Federal / BrasilAPI retornou status HTTP ${res.status}: ${res.statusText}`,
          };
        }

        const data = await res.json();
        const situacaoMap: Record<number, { label: string; cor: string }> = {
          1: { label: "NULA", cor: "red" },
          2: { label: "ATIVA", cor: "emerald" },
          3: { label: "SUSPENSA", cor: "amber" },
          4: { label: "INAPTA", cor: "red" },
          8: { label: "BAIXADA", cor: "zinc" },
        };

        const situacao = situacaoMap[data.situacao_cadastral] || {
          label: `CÓDIGO ${data.situacao_cadastral}`,
          cor: "blue",
        };

        return {
          success: true,
          cnpjFormatado: `${cleanCnpj.slice(0, 2)}.${cleanCnpj.slice(2, 5)}.${cleanCnpj.slice(5, 8)}/${cleanCnpj.slice(8, 12)}-${cleanCnpj.slice(12, 14)}`,
          razaoSocial: data.razao_social || "Não informada",
          nomeFantasia: data.nome_fantasia || data.razao_social || "Não informado",
          situacaoCadastral: situacao.label,
          situacaoCor: situacao.cor,
          dataAbertura: data.data_inicio_atividade || "Não informada",
          capitalSocial: data.capital_social
            ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.capital_social)
            : "R$ 0,00",
          cnaeCodigo: data.cnae_fiscal,
          cnaeDescricao: data.cnae_fiscal_descricao || "Restaurantes e similares",
          endereco: {
            logradouro: data.logradouro || "",
            numero: data.numero || "S/N",
            bairro: data.bairro || "Centro",
            cep: data.cep || "78300-000",
            municipio: data.municipio || "TANGARA DA SERRA",
            uf: data.uf || "MT",
          },
          socios: (data.qsa || []).map((s: any) => ({
            nome: s.nome_socio,
            qualificacao: s.qualificacao_socio || "Sócio-Administrador",
            faixaEtaria: s.faixa_etaria || "Não informada",
            dataEntrada: s.data_entrada_sociedade || "",
          })),
          telefone: data.ddd_telefone_1 || "(65) 3326-0000",
          consultadoEm: new Date().toISOString(),
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Falha ao conectar com a API da Receita Federal / BrasilAPI",
        };
      }
    }),

  getCotacaoDolarSalmao: publicProcedure.query(async () => {
    try {
      const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL", {
        headers: {
          "User-Agent": "Mozilla/5.0 (ZumaPilot/1.0)",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) {
        throw new Error(`Erro AwesomeAPI HTTP ${res.status}`);
      }
      const json = await res.json();
      const usd = json.USDBRL;
      const bid = parseFloat(usd.bid);
      const salmaoUsdKg = 11.80;
      const salmaoBrlKg = bid * salmaoUsdKg * 1.15;

      return {
        success: true,
        dolar: {
          cotacao: bid,
          variacaoPct: parseFloat(usd.pctChange),
          maximo: parseFloat(usd.high),
          minimo: parseFloat(usd.low),
          atualizadoEm: usd.create_date,
        },
        salmaoChileno: {
          usdKg: salmaoUsdKg,
          brlKgEstimado: Number(salmaoBrlKg.toFixed(2)),
          origem: "Puerto Montt (Chile) -> Rota Aérea Cuiabá -> Tangará da Serra",
          frescorGarantidoHoras: 72,
          alertaCambial: bid > 6.0 ? "Alta do dólar pressiona margem - acionar hedge ou revisão de preços" : "Câmbio favorável para abastecimento da câmara fria",
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        fallbackDolar: 5.95,
      };
    }
  }),

  consultarZumiInteligenciaAoVivo: publicProcedure
    .input(
      z.object({
        concorrenteId: z.string(),
        concorrenteNome: z.string(),
        pergunta: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Analise a situação de mercado de Tangará da Serra (Mato Grosso) com relação ao concorrente "${input.concorrenteNome}".
Pergunta/Foco estratégico: ${input.pergunta || "Como o Zuma Cozinha Oriental pode explorar as fraquezas desse concorrente e capturar faturamento hoje?"}
Leve em consideração o perfil de alta renda do agronegócio em Tangará da Serra (Centro, Jardim Europa, Tarumã, Cidade Alta) e as vantagens do Zuma Pilot (Salmão Nobre Fresco, PWA próprio 0% taxa, KDS 32 min). Gere 3 ações táticas com cupom e impacto estimado em R$.`;
      const systemInstruction = `Você é a KyttoIA, motor de inteligência artificial neural estratégica do Zuma Cozinha Oriental em Tangará da Serra - MT.`;
      const analise = await generateAiCompletion(prompt, systemInstruction);
      return {
        success: true,
        analise: analise || "Não foi possível gerar a resposta no momento. Tente novamente.",
        modelo: "KyttoIA Neural Engine v2.5 Flash",
        timestamp: new Date().toISOString(),
      };
    }),

  consultarKyttoIA: publicProcedure
    .input(
      z.object({
        tipoConsulta: z.enum([
          "analise_concorrente",
          "plano_aumento_faturamento",
          "plano_mais_clientes",
          "retencao_fidelidade_ltv",
          "benchmark_software_foodservice",
          "personalizada"
        ]).default("plano_aumento_faturamento"),
        concorrenteId: z.string().optional(),
        concorrenteNome: z.string().optional(),
        pergunta: z.string().optional(),
        faturamentoAtual: z.number().optional().default(345000),
        metaFaturamento: z.number().optional().default(450000),
        ticketMedioAtual: z.number().optional().default(138),
        percentualDelivery: z.number().optional().default(45),
      })
    )
    .mutation(async ({ input }) => {
      const faturamentoAtualFormatado = `R$ ${input.faturamentoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      const metaFaturamentoFormatado = `R$ ${input.metaFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      const incrementoNecessario = Math.max(0, input.metaFaturamento - input.faturamentoAtual);
      const incrementoFormatado = `R$ ${incrementoNecessario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

      let promptContext = "";
      if (input.tipoConsulta === "plano_aumento_faturamento") {
        promptContext = `FOCO: PLANO TÁTICO & ESTRATÉGICO PARA AUMENTAR O FATURAMENTO DO RESTAURANTE ZUMA (TANGARÁ DA SERRA - MT).
Parâmetros Financeiros Reais:
- Faturamento Atual: ${faturamentoAtualFormatado}/mês
- Meta de Faturamento Desejada: ${metaFaturamentoFormatado}/mês (Incremento de +${incrementoFormatado}/mês)
- Ticket Médio Atual: R$ ${input.ticketMedioAtual.toFixed(2)} por comanda
- Mix de Operação: ${100 - input.percentualDelivery}% Salão Nobre (27 mesas e tatames VIP) / ${input.percentualDelivery}% Delivery Próprio PWA
- Demografia Local: Tangará da Serra (MT), ~110.000 habitantes, polo agrícola do Médio-Norte, forte presença de produtores de soja/milho/algodão, cooperativas agrícolas e profissionais liberais nos bairros Centro, Jardim Europa, Jardim Aeroporto, Jardim Tarumã e Cidade Alta.

Diretriz do Gestor: ${input.pergunta || "Apresentar o plano definitivo para expandir o faturamento, atuando em ticket médio, vendas corporativas agro e dias de menor movimento."}

Apresente a resposta estruturada com:
1. 📊 DECOMPOSIÇÃO DO GAP DE FATURAMENTO (+${incrementoFormatado}): Número de pedidos adicionais por dia e expansão de ticket médio necessária.
2. 🍣 4 PILARES ACIONÁVEIS DE CRESCIMENTO:
   - Pilar 1: Expansão do Ticket Médio de Salão (Harmonização de Saquês Nobres Dourado Junmai R$ 78, Barcas Especiais 50 pçs R$ 148, Hot Nutella e carpaccios trufados).
   - Pilar 2: Almoço Corporativo & Jantares Executivos Agro B2B (Convênios faturados em 30 dias para cooperativas e revendas agrícolas com emissão de NF-e Modelo 55).
   - Pilar 3: Otimização de Terças e Quartas (Noite do Rodízio Casal Premium e Festivais Temáticos de Omakase do Sushichef).
   - Pilar 4: Desintermediação e Migração de Clientes do iFood (Recuperando 12% a 27% de comissão para o canal PWA próprio com cashback).
3. 📅 CRONOGRAMA DE IMPLANTAÇÃO EM 30/60/90 DIAS com projeções financeiras semanais.
4. 📲 3 AÇÕES DE DISPARO IMEDIATO (com texto pronto para WhatsApp, cupom promocional e retorno financeiro estimado em R$).`;
      } else if (input.tipoConsulta === "plano_mais_clientes") {
        promptContext = `FOCO: ESTRATÉGIA DE AQUISIÇÃO E ATRAÇÃO DE NOVOS CLIENTES PARA O ZUMA (TANGARÁ DA SERRA - MT).
Parâmetros da Operação:
- Restaurante: Zuma Cozinha Oriental, Av. Brasil 1605 S, Jardim Cidade Alta, Tangará da Serra - MT
- Capacidade: Salão com 27 mesas/tatames VIP + Delivery Próprio com frota dedicada
- Diretriz do Gestor: ${input.pergunta || "Como atrair novos clientes de alto padrão para o salão e delivery próprio, superando os concorrentes locais?"}

Apresente a resposta estruturada com:
1. 🎯 MAPA DE PÚBLICO E GEOLOCALIZAÇÃO: Bairros nobres de Tangará da Serra (Jardim Europa, Centro, Jardim Aeroporto, Jardim Tarumã, Cidade Alta) e produtores rurais.
2. 🚀 4 ESTRATÉGIAS DE AQUISIÇÃO DE CLIENTES:
   - Estratégia 1: Tráfego Pago Hiperlocal (Google Ads para termos orientais + Meta Ads com fotos reais do salmão fresco chileno em raio de 4km).
   - Estratégia 2: Campanha "Primeira Experiência Zuma" (Sobremesa cortesia ou R$ 25 de cashback na primeira compra pelo PWA).
   - Estratégia 3: Parcerias Institucionais no Agro (Cooperativas Coopa/Aprosoja, concessionárias agrícolas John Deere/Case, sindicato rural e eventos).
   - Estratégia 4: Programa "Indique um Amigo VIP" no Clube Zumi (Cashback em dobro para quem trouxer novos clientes).
3. 📈 METAS QUANTITATIVAS DE AQUISIÇÃO (CAC projetado, taxa de conversão e novos clientes por semana).
4. 📲 MODELO DE CAMPANHA PRONTA (Copy pronta para redes sociais e WhatsApp com gatilhos de exclusividade).`;
      } else if (input.tipoConsulta === "analise_concorrente") {
        promptContext = `FOCO: ANÁLISE COMPETITIVA E NEUTRALIZAÇÃO DO CONCORRENTE "${input.concorrenteNome || input.concorrenteId || "Concorrente de Mercado"}".
Contexto: Gastronomia e Food Service em Tangará da Serra - MT.
Diretriz do Gestor: ${input.pergunta || "Como neutralizar esse concorrente explorando seus pontos fracos de cardápio, tempo de espera, qualidade ou dependência de terceiros?"}

Apresente a resposta estruturada com:
1. ⚔️ DOSSIÊ DE VULNERABILIDADES DO CONCORRENTE: Falhas de produção, atrasos de entrega, queixas de clientes e limitações de tecnologia.
2. 🛡️ DIFERENCIAIS DE AUTORIDADE DO ZUMA: Salmão chileno nobre fresco semanal com rastreabilidade ANVISA vs congelado popular, KDS cronometrado em 32 min vs atrasos de 65+ min, canal próprio PWA sem taxas.
3. ⚡ PLANO DE CONTRA-ATAQUE EM 3 ETAPAS: Campanhas de ativação direta e guerrilha digital nos bairros de maior concentração do concorrente.
4. 💰 ESTIMATIVA DE SHARE E RECEITA INCREMENTAL CAPTURADA EM R$.`;
      } else if (input.tipoConsulta === "retencao_fidelidade_ltv") {
        promptContext = `FOCO: MAXIMIZAÇÃO DE RETENÇÃO DE CLIENTES, CLUBE ZUMI E LIFETIME VALUE (LTV).
Contexto: Zuma Cozinha Oriental, Tangará da Serra - MT.
Diretriz do Gestor: ${input.pergunta || "Como transformar clientes ocasionais em clientes semanais fiéis usando cashback inteligente e automação de reativação no WhatsApp?"}

Apresente a resposta estruturada com:
1. 💎 PROGRAMA CLUBE ZUMI: Níveis Silver, Gold e Black com cashback progressivo de 5% a 10% creditado na carteira virtual.
2. 🤖 RÉGUA DE AUTOMAÇÃO DE RESGATE (WhatsApp Cloud API aos 14, 21 e 35 dias de inatividade com cupons dinâmicos).
3. 👑 EXPERIÊNCIAS VIP EXCLUSIVAS (Noites de Omakase reservadas, harmonizações com sommelier de saquê e mesa VIP garantida).
4. 📊 PROJEÇÃO DE IMPACTO NO LTV E RECEITA ANUAL RECORRENTE.`;
      } else if (input.tipoConsulta === "benchmark_software_foodservice") {
        promptContext = `FOCO: BENCHMARK TÉCNICO E DE TCO: ZUMA PILOT VS SOFTWARES DE MERCADO (Saipos, Totvs, Linx, Consumer, Anota AI, Goomer, iFood, Teknisa).
Diretriz do Gestor: ${input.pergunta || "Demonstrar por que o Zuma Pilot supera as ferramentas legadas em KDS, estoque BOM de salmão, Split Bill e economia de TCO anual de mais de R$ 160.000."}

Apresente a resposta com tabela de custos comparados, arquitetura técnica e análise de retorno sobre investimento.`;
      } else {
        promptContext = `FOCO DA CONSULTA ESTRATÉGICA PERSONALIZADA KYTTOIA:
Pergunta do Gestor: "${input.pergunta}"
Contexto: Restaurante Zuma Cozinha Oriental em Tangará da Serra (MT), faturamento atual de ${faturamentoAtualFormatado}, meta de ${metaFaturamentoFormatado}, salão com 27 mesas/tatames VIP e delivery próprio.

Responda com profundidade técnica, métricas quantitativas em reais, cronograma prático e plano de ação acionável.`;
      }

      const systemInstruction = `Você é a KyttoIA, o motor avançado de inteligência artificial neural estratégica do Grupo Kytto para o restaurante Zuma Cozinha Oriental em Tangará da Serra - MT.
Diretrizes obrigatórias:
1. DADOS 100% REAIS E DETALHADOS: Baseie-se estritamente na realidade socioeconômica de Tangará da Serra (MT), nos concorrentes locais e nos custos oficiais das ferramentas do mercado. Jamais invente dados falsos.
2. FOCO EM CRESCIMENTO FINANCEIRO: Toda resposta deve apresentar métricas quantitativas em Reais (R$), metas de vendas, ticket médio e estimativa de retorno incremental.
3. PRONTIDÃO PARA EXECUÇÃO: Entregue planos acionáveis com etapas numeradas, canais práticos de disparo e modelos de mensagens prontas para WhatsApp e marketing digital.`;

      const analise = await generateAiCompletion(promptContext, systemInstruction);
      return {
        success: true,
        tipoConsulta: input.tipoConsulta,
        analise: analise || "Não foi possível gerar a resposta no momento. Tente novamente.",
        modelo: "KyttoIA Neural Engine v2.5 Flash",
        concorrenteAlvo: input.concorrenteNome || input.concorrenteId || "Geral",
        faturamentoAtual: input.faturamentoAtual,
        metaFaturamento: input.metaFaturamento,
        incrementoProjetado: incrementoNecessario > 0 ? incrementoNecessario : 45000,
        timestamp: new Date().toISOString(),
      };
    }),

  // ==================== DR. CLIMA TANGARÁ DA SERRA (MT) & OPERAÇÃO CHUVA IA ====================
  getDrClimaTangara: publicProcedure.query(async () => {
    // Tangará da Serra - MT: Latitude -14.6228, Longitude -57.5075
    // Integrado com Open-Meteo & WMO (Inspirado no Dr. Clima do atrix-ia)
    try {
      const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: -14.6228,
          longitude: -57.5075,
          current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m",
          hourly: "temperature_2m,precipitation_probability,precipitation,weather_code",
          daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
          timezone: "America/Cuiaba",
          forecast_days: 7,
        },
        timeout: 12000,
        headers: { "User-Agent": "ZumaPilot-DrClima/1.0" },
      });

      const current = res.data.current;
      const daily = res.data.daily;
      const hourly = res.data.hourly;

      const getWeatherMeta = (code: number) => {
        if (code === 0) return { label: "Céu Limpo", icon: "sun", severidade: "normal" };
        if (code <= 3) return { label: "Parcialmente Nublado", icon: "cloud", severidade: "normal" };
        if (code <= 48) return { label: "Nevoeiro / Névoa", icon: "cloud-fog", severidade: "atencao" };
        if (code <= 55) return { label: "Garoa / Chuvisco", icon: "cloud-drizzle", severidade: "atencao" };
        if (code <= 65) return { label: "Chuva Contínua", icon: "cloud-rain", severidade: "alerta" };
        if (code <= 82) return { label: "Pancadas de Chuva Fortes", icon: "cloud-heavy-rain", severidade: "critico" };
        if (code >= 95) return { label: "Tempestade com Raios", icon: "cloud-lightning", severidade: "critico" };
        return { label: "Instável", icon: "cloud", severidade: "atencao" };
      };

      const metaAtual = getWeatherMeta(current.weather_code);
      const isChovendo = current.precipitation > 0 || current.weather_code >= 51;
      const isCalorExtremo = current.temperature_2m >= 34;

      // Alertas de eventos meteorológicos extremos (inspirado no Dr. Clima do atrix-ia)
      const alertasExtremos: Array<{ tipo: string; severidade: "critico" | "aviso" | "info"; descricao: string; data: string }> = [];
      const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

      daily.time.forEach((diaStr: string, idx: number) => {
        const precSum = daily.precipitation_sum[idx] || 0;
        const probChuva = daily.precipitation_probability_max[idx] || 0;
        const tMax = daily.temperature_2m_max[idx] || 0;
        const code = daily.weather_code[idx] || 0;
        const dObj = new Date(diaStr + "T12:00:00Z");
        const diaNome = diasSemana[dObj.getUTCDay()];
        const dataFmt = `${diaNome} (${diaStr.split("-").slice(1).reverse().join("/")})`;

        if (code >= 95) {
          const recomendacoes = [
            "Pico de pedidos delivery previsto às 19h30. Acionar +3 motoboys extras com baú térmico estanque.",
            "Tempestade tropical com vento. Ativar sobretaxa de contingência nos bairros distantes e priorizar Lamens no KDS.",
            "Risco de lentidão no tráfego da Av. Brasil e Nilo Torres. Orientar entregadores para rotas pelo Jardim Europa.",
            "Pancadas fortes de chuva. Lançar cupom de frete grátis no PWA próprio para capturar clientes que fugiram do iFood."
          ];
          const rec = recomendacoes[idx % recomendacoes.length];
          alertasExtremos.push({
            tipo: precSum >= 5 ? "Tempestade Severa com Raios" : "Pancadas de Chuva & Raios",
            severidade: "critico",
            descricao: `${rec} Volume previsto: ${precSum > 0 ? precSum.toFixed(1) + "mm" : "pancadas"} (${probChuva}% prob.).`,
            data: dataFmt,
          });
        } else if (precSum >= 12 || probChuva >= 85) {
          alertasExtremos.push({
            tipo: "Chuva Torrencial Prevista",
            severidade: "critico",
            descricao: `Precipitação estimada em ${precSum.toFixed(1)}mm (${probChuva}% prob.). Impacto severo no tráfego da Av. Brasil e explosão de delivery.`,
            data: dataFmt,
          });
        } else if (tMax >= 35) {
          alertasExtremos.push({
            tipo: "Calor Extremo",
            severidade: "aviso",
            descricao: `Pico de calor de ${tMax.toFixed(1)}°C em Tangará. Reforçar cadeia de frio do Salmão Nobre e climatização 22°C no salão.`,
            data: dataFmt,
          });
        }
      });

      // Janela nobre de jantar das 18h às 23h
      const janelasJantar: Array<{ hora: string; temp: number; probChuva: number; precip: number; condicao: string }> = [];
      const hojeDataStr = new Date().toISOString().split("T")[0];
      if (hourly && hourly.time) {
        hourly.time.forEach((t: string, idx: number) => {
          if (t.startsWith(hojeDataStr)) {
            const h = parseInt(t.split("T")[1]?.split(":")[0] || "0", 10);
            if (h >= 18 && h <= 23) {
              const hCode = hourly.weather_code[idx] || 0;
              janelasJantar.push({
                hora: h + ":00",
                temp: hourly.temperature_2m[idx],
                probChuva: hourly.precipitation_probability[idx] || 0,
                precip: hourly.precipitation[idx] || 0,
                condicao: getWeatherMeta(hCode).label,
              });
            }
          }
        });
      }

      if (janelasJantar.length === 0 && hourly && hourly.time) {
        for (let i = 0; i < Math.min(6, hourly.time.length); i++) {
          const t = hourly.time[i];
          const hStr = t.split("T")[1]?.slice(0, 5) || (18 + i) + ":00";
          janelasJantar.push({
            hora: hStr,
            temp: hourly.temperature_2m[i],
            probChuva: hourly.precipitation_probability[i] || 0,
            precip: hourly.precipitation[i] || 0,
            condicao: getWeatherMeta(hourly.weather_code[i] || 0).label,
          });
        }
      }

      let projecaoDelivery = "+15%";
      let projecaoSalao = "Estável (+0%)";
      let statusOperacao = "OPERACAO_NORMAL";

      if (isChovendo || (daily.precipitation_probability_max[0] || 0) >= 70) {
        projecaoDelivery = "+75% a +90%";
        projecaoSalao = "-40% a -55%";
        statusOperacao = "ALERTA_CHUVA_DELIVERY_EXPLOSIVO";
      } else if (isCalorExtremo) {
        projecaoDelivery = "+35% (Pratos Refrescantes)";
        projecaoSalao = "+20% (Refúgio Climatizado)";
        statusOperacao = "CALOR_EXTREMO_CADEIA_FRIO";
      }

      return {
        success: true,
        cidade: "Tangará da Serra",
        uf: "MT",
        coordenadas: { latitude: -14.6228, longitude: -57.5075 },
        fonte: "Open-Meteo & WMO (Dados Oficiais Tangará)",
        atualizadoEm: new Date().toISOString(),
        current: {
          temperatura: current.temperature_2m,
          sensacaoTermica: current.apparent_temperature,
          umidade: current.relative_humidity_2m,
          ventoKmH: current.wind_speed_10m,
          precipitacaoMmH: current.precipitation,
          codigoTempo: current.weather_code,
          condicao: metaAtual.label,
          icone: metaAtual.icon,
          severidade: metaAtual.severidade,
          isChovendo,
          isCalorExtremo,
        },
        impactoGastronomico: {
          statusOperacao,
          projecaoDelivery,
          projecaoSalao,
          indiceAfinidadePratos: isChovendo || (daily.precipitation_probability_max[0] || 0) >= 60 ? [
            { prato: "Lamen Nobre Zuma (Caldo Quente)", afinidade: "+120%", categoria: "Quente" },
            { prato: "Hot Roll Especial Filadélfia", afinidade: "+85%", categoria: "Quente" },
            { prato: "Yakisoba Filé & Camarão", afinidade: "+75%", categoria: "Quente" },
            { prato: "Gyoza Frito & Harumaki", afinidade: "+60%", categoria: "Entrada" },
            { prato: "Vinho Tinto Chileno / Chá Verde", afinidade: "+45%", categoria: "Bebida" },
          ] : [
            { prato: "Sashimi Salmão Fresco Nobre", afinidade: "+70%", categoria: "Frio" },
            { prato: "Carpaccio de Salmão Trufado", afinidade: "+65%", categoria: "Frio" },
            { prato: "Ceviche Peruano Clássico", afinidade: "+80%", categoria: "Frio" },
            { prato: "Poké Tropical Salmão Nobre", afinidade: "+90%", categoria: "Frio" },
            { prato: "Chopp Artesanal / Drinks Cítricos", afinidade: "+85%", categoria: "Bebida" },
          ],
          gargaloLogisticoConcorrentes: {
            bonsaiTempoChuva: "85-95 min (Atraso crítico iFood)",
            nossoSushiTempoChuva: "75-80 min (Comida fria na entrega)",
            zumaGarantia: "35-40 min (Frota própria dedicada com baú térmico vedado)",
          },
        },
        alertasExtremos: alertasExtremos.slice(0, 4),
        janelasJantar,
        dias: daily.time.map((diaStr: string, idx: number) => ({
          data: diaStr,
          diaSemana: new Date(diaStr + "T12:00:00Z").toLocaleDateString("pt-BR", { weekday: "short" }),
          tempMax: daily.temperature_2m_max[idx],
          tempMin: daily.temperature_2m_min[idx],
          precipitacaoSumMm: daily.precipitation_sum[idx],
          probabilidadeChuvaPct: daily.precipitation_probability_max[idx],
          codigoTempo: daily.weather_code[idx],
          condicao: getWeatherMeta(daily.weather_code[idx]).label,
          icone: getWeatherMeta(daily.weather_code[idx]).icon,
          riscoOperacional: (daily.precipitation_probability_max[idx] >= 75 || daily.precipitation_sum[idx] >= 10) ? "ALTO" : (daily.precipitation_probability_max[idx] >= 40 ? "MÉDIO" : "BAIXO"),
        })),
      };
    } catch (err: any) {
      console.error("[DrClima] Erro Open-Meteo, usando cache:", err.message);
      return {
        success: true,
        cidade: "Tangará da Serra",
        uf: "MT",
        coordenadas: { latitude: -14.6228, longitude: -57.5075 },
        fonte: "Open-Meteo (Cache de Contingência)",
        atualizadoEm: new Date().toISOString(),
        current: {
          temperatura: 26.5,
          sensacaoTermica: 29.8,
          umidade: 84,
          ventoKmH: 11.2,
          precipitacaoMmH: 2.4,
          codigoTempo: 61,
          condicao: "Chuva Tropical Moderada",
          icone: "cloud-rain",
          severidade: "alerta",
          isChovendo: true,
          isCalorExtremo: false,
        },
        impactoGastronomico: {
          statusOperacao: "ALERTA_CHUVA_DELIVERY_EXPLOSIVO",
          projecaoDelivery: "+78% na Demanda",
          projecaoSalao: "-45% Fluxo Presencial",
          indiceAfinidadePratos: [
            { prato: "Lamen Nobre Zuma (Caldo Quente)", afinidade: "+120%", categoria: "Quente" },
            { prato: "Hot Roll Especial Filadélfia", afinidade: "+85%", categoria: "Quente" },
            { prato: "Yakisoba Filé & Camarão", afinidade: "+75%", categoria: "Quente" },
            { prato: "Gyoza Frito & Harumaki", afinidade: "+60%", categoria: "Entrada" },
            { prato: "Vinho Tinto Chileno / Chá Verde", afinidade: "+45%", categoria: "Bebida" },
          ],
          gargaloLogisticoConcorrentes: {
            bonsaiTempoChuva: "85-95 min (Atraso crítico iFood)",
            nossoSushiTempoChuva: "75-80 min (Comida fria na entrega)",
            zumaGarantia: "35-40 min (Frota própria dedicada com baú térmico vedado)",
          },
        },
        alertasExtremos: [
          {
            tipo: "Chuva Tropical Intensa",
            severidade: "critico",
            descricao: "Chuva intensa sobre Tangará da Serra. Pistas escorregadias na Av. Brasil e alta demanda imediata no delivery.",
            data: new Date().toISOString().split("T")[0],
          }
        ],
        janelasJantar: [
          { hora: "18:00", temp: 26.2, probChuva: 80, precip: 3.2, condicao: "Chuva Moderada" },
          { hora: "19:00", temp: 25.8, probChuva: 85, precip: 4.1, condicao: "Chuva Moderada" },
          { hora: "20:00", temp: 25.1, probChuva: 75, precip: 2.0, condicao: "Pancadas Tropicais" },
          { hora: "21:00", temp: 24.8, probChuva: 65, precip: 1.1, condicao: "Chuva Fraca" },
          { hora: "22:00", temp: 24.4, probChuva: 50, precip: 0.5, condicao: "Nublado" },
          { hora: "23:00", temp: 24.0, probChuva: 35, precip: 0.0, condicao: "Encoberto" },
        ],
        dias: [
          { data: "2026-11-21", diaSemana: "Sáb", tempMax: 32.2, tempMin: 24.6, precipitacaoSumMm: 6.8, probabilidadeChuvaPct: 83, codigoTempo: 61, condicao: "Chuva Tropical", icone: "cloud-rain", riscoOperacional: "ALTO" },
          { data: "2026-11-22", diaSemana: "Dom", tempMax: 32.6, tempMin: 24.0, precipitacaoSumMm: 3.5, probabilidadeChuvaPct: 71, codigoTempo: 80, condicao: "Pancadas de Chuva", icone: "cloud-heavy-rain", riscoOperacional: "MÉDIO" },
          { data: "2026-11-23", diaSemana: "Seg", tempMax: 32.5, tempMin: 24.4, precipitacaoSumMm: 8.2, probabilidadeChuvaPct: 97, codigoTempo: 95, condicao: "Tempestade com Raios", icone: "cloud-lightning", riscoOperacional: "ALTO" },
          { data: "2026-11-24", diaSemana: "Ter", tempMax: 31.7, tempMin: 23.8, precipitacaoSumMm: 11.4, probabilidadeChuvaPct: 89, codigoTempo: 95, condicao: "Tempestade", icone: "cloud-lightning", riscoOperacional: "ALTO" },
          { data: "2026-11-25", diaSemana: "Qua", tempMax: 30.1, tempMin: 23.7, precipitacaoSumMm: 18.5, probabilidadeChuvaPct: 84, codigoTempo: 65, condicao: "Chuva Forte", icone: "cloud-heavy-rain", riscoOperacional: "ALTO" },
          { data: "2026-11-26", diaSemana: "Qui", tempMax: 30.0, tempMin: 23.6, precipitacaoSumMm: 24.3, probabilidadeChuvaPct: 78, codigoTempo: 65, condicao: "Chuva Contínua", icone: "cloud-rain", riscoOperacional: "ALTO" },
          { data: "2026-11-27", diaSemana: "Sex", tempMax: 30.6, tempMin: 23.9, precipitacaoSumMm: 4.1, probabilidadeChuvaPct: 76, codigoTempo: 80, condicao: "Pancadas", icone: "cloud-rain", riscoOperacional: "MÉDIO" },
        ],
      };
    }
  }),

  ativarPlanoChuvaContingencia: publicProcedure
    .input(
      z.object({
        motoboysExtras: z.number().default(4),
        taxaAdicionalBrl: z.number().default(3.0),
        probabilidadeChuva: z.number().default(85),
      })
    )
    .mutation(async ({ input }) => {
      const bairros = dataStore.getDeliveryNeighborhoods();
      for (const b of bairros) {
        dataStore.updateDeliveryNeighborhood(b.id, { rainSurcharge: input.taxaAdicionalBrl });
      }

      dataStore.logWebhook(
        "Dr. Clima & Logística Tangará",
        `OPERACAO_CHUVA_ATIVADA (+${input.motoboysExtras} Motoboys Extras Convocados)`,
        200,
        18,
        {
          probabilidadeChuva: input.probabilidadeChuva,
          motoboysExtras: input.motoboysExtras,
          taxaSobretaxaChuva: input.taxaAdicionalBrl,
          bairrosAfetados: bairros.length,
          status: "ATIVO_CONTINGENCIA",
          ativadoEm: new Date().toISOString()
        }
      );

      dataStore.emitUltraSyncEvent({
        type: "CONTINGENCIA_CHUVA_ATIVADA",
        originSystem: "ULTRA_SISTEMA",
        targetSystem: "NOSSA_GENTE",
        summary: `Plano Chuva de Vendas acionado: +${input.motoboysExtras} motoboys convocados e alerta térmico no KDS da cozinha.`,
        payload: {
          motoboys: input.motoboysExtras,
          surcharge: input.taxaAdicionalBrl,
          probabilidade: input.probabilidadeChuva
        }
      });

      return {
        success: true,
        mensagem: `Plano Chuva ativado com sucesso! +${input.motoboysExtras} motoboys convocados no App Entregador, alerta térmico no KDS e sobretaxa de R$ ${input.taxaAdicionalBrl.toFixed(2)} aplicada aos 15 bairros de Tangará da Serra.`,
        dataAtivacao: new Date().toISOString(),
      };
    }),

  gerarPlanoAcaoChuvaIa: publicProcedure
    .input(
      z.object({
        temperatura: z.number().default(26),
        condicao: z.string().default("Chuva Moderada"),
        probabilidadeChuva: z.number().default(85),
        precipitacaoMm: z.number().default(4.2),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Gere um PLANO TÁTICO ACIONÁVEL DE OPERAÇÃO CHUVA para o Zuma Cozinha Oriental em Tangará da Serra (Mato Grosso).
Condições meteorológicas atuais em Tangará da Serra:
- Temperatura: ${input.temperatura}°C
- Condição: ${input.condicao}
- Probabilidade de Chuva: ${input.probabilidadeChuva}%
- Precipitação: ${input.precipitacaoMm} mm/h

Concorrentes em Tangará da Serra (Bonsai e Nosso Sushi):
- Entregas deles no iFood sofrem atrasos críticos de 85 a 95 minutos na chuva.
- As embalagens de papelão comum amolecem e o sushi chega bagunçado.

Vantagens exclusivas do Zuma Pilot:
- Frota própria de motoboys dedicados com baús estanques impermeáveis térmicos.
- Garantia de entrega rápida em até 38 minutos no Centro, Jardim Europa e Vila Alta.
- Cardápio premium com Lamen fumegante, Yakisoba artesanal e Hot Rolls crocantes.

Formule o plano estruturado com:
1. MENSAGEM DE DISPARO WHATSAPP ZUMI (copy irresistível para os clientes de Tangará, com o cupom CHUVANAZUMA dando taxa de entrega grátis em pedidos acima de R$ 90 ou 10% OFF nos pratos quentes).
2. REMANEJAMENTO NA COZINHA KDS (ajustes entre sushiman e praça de fritura/fogão wok para atender o pico de hot rolls e lamen).
3. PROTOCOLO DE LOGÍSTICA E SEGURANÇA DOS MOTOBOYS (rotas, capas impermeáveis duplas e bônus de entrega segura em pista molhada).
4. CONTRA-ATAQUE AOS CONCORRENTES (estratégia para capturar pedidos de clientes descontentes do Bonsai e Nosso Sushi).
5. PROJEÇÃO FINANCEIRA ESTIMADA (pedidos incrementais esperados e receita adicional em R$).`;

      const system = "Você é Zumi, estrategista operacional do Zuma Cozinha Oriental em Tangará da Serra - MT. Seja extremamente prático, focado em alta lucratividade, velocidade logística e satisfação máxima do cliente.";

      const planoGerado = await generateAiCompletion(prompt, system);

      return {
        success: true,
        plano: planoGerado || "Plano tático gerado com sucesso para Tangará da Serra.",
        cupomSugerido: "CHUVANAZUMA",
        projecao: {
          pedidosAdicionaisEstimados: 46,
          ticketMedioBrl: 138.5,
          faturamentoIncrementalBrl: 6371.0,
          aumentoDeliveryPct: 82,
        },
        geradoEm: new Date().toISOString(),
      };
    }),

  dispararCampanhaChuvaWhatsapp: publicProcedure
    .input(
      z.object({
        nomeCampanha: z.string().default("Operação Chuva Tangará Express"),
        cupom: z.string().default("CHUVANAZUMA"),
        mensagem: z.string(),
        segmento: z.string().default("Clientes Frequentes de Delivery (Bairros Centro, Jardim Europa, Vila Alta)"),
      })
    )
    .mutation(async ({ input }) => {
      dataStore.logWebhook(
        "WhatsApp Zumi (Disparo Operação Chuva)",
        "CAMPAIGN_BATCH_SENT",
        200,
        18,
        {
          campanha: input.nomeCampanha,
          cupom: input.cupom,
          destinatariosContagem: 342,
          bairrosFoco: ["Centro", "Jardim Europa", "Vila Alta", "Parque das Gemas"],
          status: "DELIVERED_98PCT",
          disparadoEm: new Date().toISOString(),
        }
      );

      return {
        success: true,
        mensagem: "Campanha \"" + input.nomeCampanha + "\" disparada com sucesso para 342 clientes segmentados de Tangará da Serra! Cupom " + input.cupom + " ativado no PWA Zuma.",
        destinatarios: 342,
        tempoMedioRespostaEstimado: "4 a 8 minutos",
        taxaEntregaGarantida: "38 minutos com baú vedado",
      };
    }),

  getConcorrentesDetalhadosTangara: publicProcedure.query(async () => {
    return {
      atualizadoEm: new Date().toISOString(),
      cidade: "Tangará da Serra",
      uf: "MT",
      concorrentes: [
        {
          id: "bonsai",
          nome: "Bonsai Sushi Lounge",
          setor: "sushi",
          setorLabel: "Cozinha Oriental & Lounge Noturno",
          publicoAlvo: "Casais e Famílias Classe A/B",
          razaoSocial: "BONSAI RESTAURANTE E PETISCARIA LTDA",
          cnpj: "31.428.910/0001-44",
          endereco: "Av. Brasil, 890 - W, Centro, Tangará da Serra - MT",
          tipo: "Restaurante e Lounge Noturno",
          ticketMedio: 125,
          tempoEntregaNormal: "55 - 75 min",
          tempoEntregaChuva: "85 - 95 min (Atrasos crônicos no iFood)",
          raioEntregaKm: 6.5,
          taxaMediaEntrega: "R$ 12,00",
          capacidadeMesas: 85,
          motoboysProprios: 3,
          motoboysTerceirizados: "iFood terceirizado",
          avaliacaoGoogle: 4.4,
          totalAvaliacoesGoogle: 280,
          pontosFortes: "Ponto tradicional no Centro com música ambiente e drinks.",
          fragilidadesChuva: "Dependência de motoboys aleatórios do iFood que recusam corridas na chuva. Embalagens de papelão dobram com umidade e pratos quentes chegam mornos.",
          contraAtaqueZuma: "Oferecer entrega própria garantida em 38 min com embalagem estanque térmica selada a vácuo e taxa grátis acima de R$ 90.",
          pratosPrecos: [
            { prato: "Combo 40 Peças Clássico", precoRival: 139.90, precoZuma: 134.90, vantagem: "Zuma mais barato e com Salmão Nobre Chileno Fresco" },
            { prato: "Hot Roll Filadélfia (10 un)", precoRival: 42.00, precoZuma: 38.90, vantagem: "Zuma chega 100% crocante com caixa ventilada anti-vapor" },
            { prato: "Lamen Tradicional", precoRival: 49.00, precoZuma: 46.00, vantagem: "Caldo artesanal autêntico Zuma 18h de cozimento" },
            { prato: "Barca Especial 60 Peças", precoRival: 219.00, precoZuma: 199.00, vantagem: "Barca Zuma inclui sashimis de salmão nobre e tataki selado" }
          ]
        },
        {
          id: "nosso-sushi",
          nome: "Nosso Sushi Bar & Delivery",
          setor: "sushi",
          setorLabel: "Cozinha Oriental & Temakeria Popular",
          publicoAlvo: "Público Jovem e Delivery Econômico",
          razaoSocial: "NOSSO SUSHI RESTAURANTE LTDA",
          cnpj: "38.192.405/0001-12",
          endereco: "Rua Júlio Martinez Benevides, 450, Centro, Tangará da Serra - MT",
          tipo: "Restaurante & Rodízio Popular",
          ticketMedio: 98,
          tempoEntregaNormal: "45 - 65 min",
          tempoEntregaChuva: "75 - 85 min",
          raioEntregaKm: 5.0,
          taxaMediaEntrega: "R$ 10,00",
          capacidadeMesas: 60,
          motoboysProprios: 2,
          motoboysTerceirizados: "App terceirizado",
          avaliacaoGoogle: 4.2,
          totalAvaliacoesGoogle: 195,
          pontosFortes: "Preços agressivos com foco em rodízio barato e combos volumosos.",
          fragilidadesChuva: "Peixe congelado de menor padrão que perde textura. Reclamações de atraso e motoboy molhado na entrega.",
          contraAtaqueZuma: "Posicionamento High-End do Zuma: qualidade inquestionável de Salmão Chileno Fresco e atendimento VIP via IA Zumi.",
          pratosPrecos: [
            { prato: "Combo 40 Peças Popular", precoRival: 119.00, precoZuma: 134.90, vantagem: "Zuma entrega qualidade nobre sem peixe congelado esbranquiçado" },
            { prato: "Hot Roll Tradicional (10 un)", precoRival: 35.00, precoZuma: 38.90, vantagem: "Zuma usa cream cheese Philadelphia genuíno e salmão fresco" },
            { prato: "Temaki Salmão Completo", precoRival: 34.00, precoZuma: 32.90, vantagem: "Zuma alga crocante embalada separadamente (sistema bipack)" }
          ]
        },
        {
          id: "ivans-burger",
          nome: "Ivan's Burger (Tradição 26 Anos)",
          setor: "burger",
          setorLabel: "Hamburgueria Artesanal & Smash",
          publicoAlvo: "Famílias, Jovens e Delivery Noturno Rápido",
          razaoSocial: "IVAN'S BURGER LTDA",
          cnpj: "55.778.391/0001-61",
          endereco: "Avenida Brasil, 1921 N, Jardim Europa, Tangará da Serra - MT",
          tipo: "Hamburgueria Artesanal Noturna & Delivery Consolidado",
          ticketMedio: 68,
          tempoEntregaNormal: "40 - 55 min",
          tempoEntregaChuva: "70 - 85 min (Pão amolece no baú com umidade)",
          raioEntregaKm: 6.0,
          taxaMediaEntrega: "R$ 11,00",
          capacidadeMesas: 70,
          motoboysProprios: 4,
          motoboysTerceirizados: "iFood + WhatsApp",
          avaliacaoGoogle: 4.8,
          totalAvaliacoesGoogle: 380,
          pontosFortes: "Tradição pioneira de 26 anos em Tangará, forte reconhecimento de marca e carnes bem temperadas.",
          fragilidadesChuva: "Hambúrgueres com frituras e maioneses perdem calor e crocância no transporte com chuva. Sensação de refeição pesada e calórica.",
          contraAtaqueZuma: "Campanha 'Jantar Leve & Sofisticado': Troque o fast-food pesado pelo Combo Nobre Zuma ou Hot Rolls crocantes com cream cheese pelo mesmo ticket médio, entregue em 38 min estanque.",
          pratosPrecos: [
            { prato: "Burger Duplo Artesanal + Fritas", precoRival: 54.00, precoZuma: 49.90, vantagem: "Combo Zuma (1 Temaki Salmão Nobre + 6 Hot Rolls) com menor caloria e digestão leve" },
            { prato: "Combo Família 3 Burgers + Batata", precoRival: 145.00, precoZuma: 139.90, vantagem: "Barca Nobre Zuma 40 Peças oferece sofisticação gastronômica superior" }
          ]
        },
        {
          id: "babbo-giovanni",
          nome: "Babbo Giovanni Pizzaria Tangará",
          setor: "pizza",
          setorLabel: "Pizzaria Gourmet & Forno a Lenha",
          publicoAlvo: "Casais Alta Renda, Famílias Tradicionais e Encontros Nobres",
          razaoSocial: "E. DALEFFE PIZZARIA LTDA",
          cnpj: "14.811.241/0001-25",
          endereco: "Rua Ramom Sanches Marques, 232, Vila Virgínia, Tangará da Serra - MT",
          tipo: "Pizzaria Nobre Paulista, Massas & Carta de Vinhos",
          ticketMedio: 135,
          tempoEntregaNormal: "55 - 75 min",
          tempoEntregaChuva: "85 - 105 min (Caixa de papelão esfria e amolece a massa)",
          raioEntregaKm: 6.5,
          taxaMediaEntrega: "R$ 13,00",
          capacidadeMesas: 95,
          motoboysProprios: 3,
          motoboysTerceirizados: "Terceirizados iFood",
          avaliacaoGoogle: 4.5,
          totalAvaliacoesGoogle: 290,
          pontosFortes: "Grife paulista de pizzas nobres com burratas, massa fermentada e carta de vinhos finos.",
          fragilidadesChuva: "Gargalo severo de forno em noites frias/chuvosas (fila supera 1h20). Pizza esfria rapidamente e a massa fica borrachuda no transporte úmido.",
          contraAtaqueZuma: "Experiência Romântica sem Espera: Combinado Especial Contemporâneo com Salmão Chileno Fresco + Vinho Chileno entregue em 38 min ou servido nos Tatames VIP Zuma.",
          pratosPrecos: [
            { prato: "Pizza Gourmet Especial Grande", precoRival: 115.00, precoZuma: 109.90, vantagem: "Combinado Salmão Nobre Zuma 32 peças com peixe fresco chileno sem carboidrato pesado" },
            { prato: "Entrada Burrata ao Forno", precoRival: 68.00, precoZuma: 56.00, vantagem: "Carpaccio de Salmão Trufado com raspas de limão siciliano e azeite trufado" }
          ]
        },
        {
          id: "choperia-lugui",
          nome: "Choperia do Lugui Tangará da Serra",
          setor: "bar_chopp",
          setorLabel: "Choperia, Gastrobar & Happy Hour",
          publicoAlvo: "Grupos de Amigos, Happy Hour do Agro e Casais Jovens",
          razaoSocial: "CHOPERIA DO LUGUI LTDA",
          cnpj: "51.500.085/0001-08",
          endereco: "Av. Tancredo Neves, 1205 E, Centro, Tangará da Serra - MT",
          tipo: "Choperia com Caneca Congelada & Petiscos de Boteco",
          ticketMedio: 95,
          tempoEntregaNormal: "Apenas Salão Presencial",
          tempoEntregaChuva: "Salão perde até 50% do fluxo em noites chuvosas",
          raioEntregaKm: 0,
          taxaMediaEntrega: "N/A",
          capacidadeMesas: 120,
          motoboysProprios: 0,
          motoboysTerceirizados: "Nenhum",
          avaliacaoGoogle: 4.4,
          totalAvaliacoesGoogle: 320,
          pontosFortes: "Chopp em dobro tradicional com caneca ultracongelada e localização privilegiada na Tancredo Neves.",
          fragilidadesChuva: "Mesas na calçada/varanda descobertas ficam inutilizadas na chuva; comida de boteco frita e repetitiva.",
          contraAtaqueZuma: "Sunset Zuma: Chopp artesanal gelado + Rodada de Hot Rolls Crocantes e Gyoza no deck coberto e climatizado com trilha sonora refinada.",
          pratosPrecos: [
            { prato: "Porção Filé com Fritas e Queijo", precoRival: 89.00, precoZuma: 82.00, vantagem: "Teppan de Filé Mignon Zuma com legumes frescos na manteiga e molho teriyaki artesanal" },
            { prato: "Chopp em Dobro Caneca", precoRival: 18.00, precoZuma: 16.00, vantagem: "Chopp Puro Malte geladíssimo servido com edamame temperado" }
          ]
        },
        {
          id: "dtalia",
          nome: "Choperia e Pizzaria D'Talia (Dtalia)",
          setor: "pizza",
          setorLabel: "Pizzaria Tradicional, Rodízio & Choperia",
          publicoAlvo: "Famílias Grandes, Comemorações de Grupo e Turmas de Amigos",
          razaoSocial: "CELSO CABRAL DA SILVA",
          cnpj: "18.771.472/0001-03",
          endereco: "Av. Pres. Tancredo de Almeida Neves, 570-N, Jardim Tanaka, Tangará da Serra - MT",
          tipo: "Pizzaria Tradicional, Rodízio Noturno & Choperia Ampla",
          ticketMedio: 85,
          tempoEntregaNormal: "50 - 70 min",
          tempoEntregaChuva: "75 - 90 min",
          raioEntregaKm: 5.5,
          taxaMediaEntrega: "R$ 10,00",
          capacidadeMesas: 140,
          motoboysProprios: 3,
          motoboysTerceirizados: "iFood e App Local",
          avaliacaoGoogle: 4.3,
          totalAvaliacoesGoogle: 410,
          pontosFortes: "Salão gigantesco com tradição em rodízio de pizza acessível e chopp popular.",
          fragilidadesChuva: "Ambiente muito ruidoso e movimentado; ingredientes de linha comercial popular; queijo gorduroso que esfria rápido.",
          contraAtaqueZuma: "Festival Zuma nos Tatames VIP: Degustação oriental guiada com sushis flambados e atendimento VIP reservado, sem barulho de rodízio.",
          pratosPrecos: [
            { prato: "Rodízio de Pizza Tradicional", precoRival: 69.90, precoZuma: 74.90, vantagem: "Menu Degustação Zuma com salmão chileno nobre fresco e peças autorais" },
            { prato: "Pizza Família 2 Sabores", precoRival: 85.00, precoZuma: 89.90, vantagem: "Combinado 30 Peças Zuma com frescor inigualável e apresentação impecável" }
          ]
        },
        {
          id: "bahamas-pub",
          nome: "Bahamas Pub Tangará",
          setor: "bar_chopp",
          setorLabel: "Pub Noturno, Rock & Rodízio de Petiscos",
          publicoAlvo: "Público Jovem Adulto, Universitários e Balada Noturna",
          razaoSocial: "BAHAMAS PUB LTDA",
          cnpj: "44.640.616/0001-00",
          endereco: "Centro, Tangará da Serra - MT",
          tipo: "Pub Noturno, Shows de Rock ao Vivo e Open Chopp",
          ticketMedio: 110,
          tempoEntregaNormal: "Apenas Salão Noturno",
          tempoEntregaChuva: "Dificuldade de estacionamento na chuva e fila molhada na entrada",
          raioEntregaKm: 0,
          taxaMediaEntrega: "N/A",
          capacidadeMesas: 100,
          motoboysProprios: 0,
          motoboysTerceirizados: "Nenhum",
          avaliacaoGoogle: 4.5,
          totalAvaliacoesGoogle: 260,
          pontosFortes: "Agito noturno com rock ao vivo, ambiente escuro temático de pub e eventos de open chopp.",
          fragilidadesChuva: "Som excessivamente alto impede conversas; cobrança de couvert artístico elevado; poucas opções gastronômicas saudáveis.",
          contraAtaqueZuma: "Esquenta Gastronômico Zuma: Drinks autorais com Sakê e Gin botânico, carpaccios e ambiente com iluminação intimista antes da balada.",
          pratosPrecos: [
            { prato: "Rodízio de Petiscos de Pub", precoRival: 65.00, precoZuma: 59.90, vantagem: "Petiscos Nobres Zuma: Ebi Furai (camarão empanado crocante) e Guiozas no vapor" },
            { prato: "Drink Gin Tropical da Casa", precoRival: 36.00, precoZuma: 32.00, vantagem: "Drinks autorais Zuma elaborados com xaropes artesanais e especiarias asiáticas" }
          ]
        },
        {
          id: "la-carreta",
          nome: "Restaurante & Churrascaria La Carreta",
          setor: "carnes",
          setorLabel: "Churrascaria Tradicional & Carnes Nobres",
          publicoAlvo: "Produtores Rurais do Agro, Famílias Tradicionais e Reuniões de Negócios",
          razaoSocial: "JOSE AULACIR BORGES GIRARDI - ME",
          cnpj: "01.026.561/0001-22",
          endereco: "Rua Euclides G. Medeiros, 454-S, Centro, Tangará da Serra - MT",
          tipo: "Churrascaria Tradicional Gaúcha & Cortes Grelhados",
          ticketMedio: 130,
          tempoEntregaNormal: "Salão Presencial (Marmitas no almoço)",
          tempoEntregaChuva: "Salão tradicional esvazia mais cedo na chuva",
          raioEntregaKm: 5.0,
          taxaMediaEntrega: "R$ 10,00",
          capacidadeMesas: 110,
          motoboysProprios: 1,
          motoboysTerceirizados: "Nenhum",
          avaliacaoGoogle: 4.5,
          totalAvaliacoesGoogle: 450,
          pontosFortes: "30 anos de história em Tangará, tradição absoluta em carnes na brasa e clientela fiel do agronegócio.",
          fragilidadesChuva: "Culinária pesada com alto teor de gordura; público feminino e jovens casais preferem opções mais leves à noite.",
          contraAtaqueZuma: "Proteína Nobre com Digestão Leve: Teppanyaki de Salmão Fresco e Filé Mignon ao molho teriyaki Zuma com legumes na manteiga clarificada, perfeito para almoço e jantar de negócios.",
          pratosPrecos: [
            { prato: "Picanha Grelhada na Brasa para Dois", precoRival: 149.00, precoZuma: 138.00, vantagem: "Teppan Nobre Zuma Misto (Salmão Nobre + Mignon) rico em Ômega-3 sem gordura pesada" },
            { prato: "Prato Executivo de Churrasco", precoRival: 42.00, precoZuma: 39.90, vantagem: "Bento Box Executivo Zuma com arroz japonês, tataki selado e legumes salteados" }
          ]
        },
        {
          id: "santa-chapa",
          nome: "Santa Chapa Burger (Smash & Brasa)",
          setor: "burger",
          setorLabel: "Burger Smash & Brasa Delivery",
          publicoAlvo: "Jovens, Estudantes e Pedidos Rápidos Solo",
          razaoSocial: "SANTA CHAPA ALIMENTOS TANGARA LTDA",
          cnpj: "49.120.312/0001-80",
          endereco: "Vila Horizonte / Centro, Tangará da Serra - MT",
          tipo: "Hamburgueria Smash 100% Focada em Delivery Noturno",
          ticketMedio: 52,
          tempoEntregaNormal: "35 - 50 min",
          tempoEntregaChuva: "65 - 80 min (Atrasos frequentes nos motoboys)",
          raioEntregaKm: 5.0,
          taxaMediaEntrega: "R$ 9,00",
          capacidadeMesas: 0,
          motoboysProprios: 2,
          motoboysTerceirizados: "iFood e WhatsApp",
          avaliacaoGoogle: 4.7,
          totalAvaliacoesGoogle: 190,
          pontosFortes: "Preço muito competitivo em burgers smash com embalagem moderna e visual apelativo no Instagram.",
          fragilidadesChuva: "Massa do pão smash amolece rapidamente com vapor no transporte na chuva; ausência de salão.",
          contraAtaqueZuma: "Combo Individual Zuma: 1 Temaki Salmão Completo crocante + 6 Hot Rolls quentinhos por R$ 48,90 entregues em 38 min com embalagem estanque.",
          pratosPrecos: [
            { prato: "Smash Burger Duplo com Cheddar", precoRival: 38.00, precoZuma: 34.90, vantagem: "Temaki Salmão Fresco Zuma 220g oferece saciedade prolongada com alto valor nutritivo" }
          ]
        },
        {
          id: "luch",
          nome: "Luch Sushi & Asian Food",
          setor: "sushi",
          setorLabel: "Cozinha Oriental & Wok Centro",
          publicoAlvo: "Famílias e Público Tradicional Centro",
          razaoSocial: "LUCH GASTRONOMIA ORIENTAL LTDA",
          cnpj: "42.871.209/0001-88",
          endereco: "Av. Tancredo Neves, 1200, Vila Alta, Tangará da Serra - MT",
          tipo: "Cozinha Asiática Mista (Sushi, Wok, Lamen)",
          ticketMedio: 115,
          tempoEntregaNormal: "50 - 70 min",
          tempoEntregaChuva: "70 - 80 min",
          raioEntregaKm: 5.5,
          taxaMediaEntrega: "R$ 11,00",
          capacidadeMesas: 45,
          motoboysProprios: 1,
          motoboysTerceirizados: "iFood",
          avaliacaoGoogle: 4.3,
          totalAvaliacoesGoogle: 140,
          pontosFortes: "Boa variedade de pratos quentes e lamen no almoço.",
          fragilidadesChuva: "Sem aplicativo próprio, margens consumidas pela comissão do iFood (27%), o que impede promoções agressivas na chuva.",
          contraAtaqueZuma: "Zuma possui Loja PWA própria com taxa de entrega zero e cashback direto no Clube Zumi.",
          pratosPrecos: [
            { prato: "Lamen Tradicional Shoyu", precoRival: 48.00, precoZuma: 46.00, vantagem: "Zuma embalagem japonesa anti-vazamento com caldo separado" },
            { prato: "Yakisoba Nobre", precoRival: 45.00, precoZuma: 44.00, vantagem: "Zuma camarão rosa e filé mignon grelhados no wok quente" }
          ]
        },
        {
          id: "yoko",
          nome: "Yoko Temakeria & Sushi",
          setor: "sushi",
          setorLabel: "Temakeria Tradicional Centro",
          publicoAlvo: "Público Tradicional e Lanches Rápidos",
          razaoSocial: "YOKO ALIMENTOS E BEBIDAS LTDA",
          cnpj: "29.301.884/0001-63",
          endereco: "Rua Antonio Hortolani, 310, Centro, Tangará da Serra - MT",
          tipo: "Temakeria & Fast Japanese Food",
          ticketMedio: 75,
          tempoEntregaNormal: "35 - 50 min",
          tempoEntregaChuva: "60 - 70 min",
          raioEntregaKm: 4.0,
          taxaMediaEntrega: "R$ 9,00",
          capacidadeMesas: 28,
          motoboysProprios: 2,
          motoboysTerceirizados: "Nenhum",
          avaliacaoGoogle: 4.5,
          totalAvaliacoesGoogle: 110,
          pontosFortes: "Agilidade no preparo de temakis individuais para público jovem.",
          fragilidadesChuva: "Cardápio frio sem pratos quentes estruturados. Perde até 60% dos pedidos em noites chuvosas.",
          contraAtaqueZuma: "Zuma captura esse cliente promovendo combos que unem Temaki crocante + Lamen ou Hot Roll quentinho.",
          pratosPrecos: [
            { prato: "Temaki Especial Empanado", precoRival: 38.00, precoZuma: 34.90, vantagem: "Zuma maior gramatura (220g vs 160g do Yoko)" }
          ]
        },
        {
          id: "dark-kitchens",
          nome: "Dark Kitchens iFood (2 Operações Fantasmas)",
          setor: "sushi",
          setorLabel: "Delivery Informal de Baixo Custo",
          publicoAlvo: "Consumidores Atraídos Exclusivamente por Preço Baixo",
          razaoSocial: "MICROEMPREENDEDORES INDIVIDUAIS SEM PONTO COMERCIAL",
          cnpj: "48.210.551/0001-90",
          endereco: "Residencial San Diego (sem alvará de atendimento presencial)",
          tipo: "Delivery 100% Informal",
          ticketMedio: 55,
          tempoEntregaNormal: "60 - 90 min",
          tempoEntregaChuva: "110+ min (ou cancelamento)",
          raioEntregaKm: 7.0,
          taxaMediaEntrega: "R$ 14,00",
          capacidadeMesas: 0,
          motoboysProprios: 0,
          motoboysTerceirizados: "iFood apenas",
          avaliacaoGoogle: 3.8,
          totalAvaliacoesGoogle: 45,
          pontosFortes: "Preços muito baixos para capturar clientes desavisados.",
          fragilidadesChuva: "Cancelamento em massa na chuva quando falta entregador no iFood. Reclamações de segurança alimentar e falta de nota fiscal.",
          contraAtaqueZuma: "Campanha de conscientização sobre procedência, frescor do salmão nobre e nota fiscal emitida automaticamente.",
          pratosPrecos: [
            { prato: "Combo 30 Peças \"Barato\"", precoRival: 79.90, precoZuma: 99.00, vantagem: "Zuma garantia de salmão nobre refrigerado inspecionado vs risco sanitário" }
          ]
        }
      ]
    };
  }),

    simulateInternalEvent: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        eventType: z.string().optional(),
        collaboratorName: z.string().optional(),
        colaboradorNome: z.string().optional(),
        camera: z.string().optional(),
        detalhes: z.string().optional(),
        notes: z.string().optional(),
      }).passthrough().optional()
    )
    .mutation(async ({ input }) => {
      const eventName = input?.eventType || "PONTO_FACIAL_VALIDADO";
      const colab = input?.colaboradorNome || input?.collaboratorName || "Lívia Morales";
      dataStore.logWebhook(
        "Nossa Gente RH PubSub",
        eventName,
        200,
        2,
        {
          collaborator: colab,
          category: input?.category || "Ponto Eletrônico",
          notes: input?.notes || input?.detalhes || "Validação biométrica facial confirmada com sucesso via Ultra Vision AI",
          timestamp: new Date().toISOString()
        }
      );
      const ultraEvent = dataStore.emitUltraSyncEvent({
        type: eventName,
        originSystem: "NOSSA_GENTE",
        targetSystem: "ULTRA_SISTEMA",
        summary: input?.detalhes || input?.notes || `Evento interno sincronizado: ${eventName}`,
        collaboratorName: colab,
        payload: {
          camera: input?.camera || "CAM-01 (Entrada Salão)",
          timestamp: new Date().toISOString()
        }
      });
      return {
        success: true,
        item: {
          event: eventName,
          collaborator: colab,
          colaboradorNome: colab,
          status: "PROCESSADO",
          latency: "2.4ms"
        },
        event: ultraEvent
      };
    }),

  sincronizarConcorrentesAoVivo: publicProcedure.mutation(async () => {
    return {
      success: true,
      mensagem: "Inteligência competitiva multissetorial de Tangará da Serra sincronizada com sucesso! 12 estabelecimentos noturnos mapeados em 5 setores (Sushi, Burgers, Pizzas, Choperias/Pubs e Carnes Nobres).",
      timestamp: new Date().toISOString(),
    };
  }),

  listAcoesConcorrencia: publicProcedure.query(async () => {
    return dataStore.getMarketActions();
  }),

  salvarAcaoConcorrencia: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        titulo: z.string(),
        alvoId: z.string(),
        alvoNome: z.string(),
        tipo: z.enum(["whatsapp", "oferta_pwa", "ajuste_preco", "trafego_local", "clube_zumi", "resgate_review"]),
        bairros: z.array(z.string()),
        gatilho: z.string(),
        estrategia: z.string(),
        cupom: z.string().optional(),
        descontoDesc: z.string().optional(),
        status: z.enum(["ativa", "concluida", "agendada", "pausada"]).optional(),
        alcanceEst: z.number().optional(),
        conversaoEst: z.number().optional(),
        receitaGerada: z.number().optional(),
        roi: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.saveMarketAction(input);
    }),

  alternarStatusAcaoConcorrencia: publicProcedure
    .input(z.object({ id: z.string(), status: z.string().optional() }))
    .mutation(async ({ input }) => {
      return dataStore.toggleMarketActionStatus(input.id, input.status);
    }),

  dispararAtaqueMercado: publicProcedure
    .input(
      z.object({
        eixoId: z.string(),
        titulo: z.string(),
        alvoNome: z.string(),
        alvoId: z.string(),
        bairros: z.array(z.string()),
        canais: z.array(z.string()),
        estrategia: z.string(),
        cupom: z.string().optional(),
        orcamentoDiario: z.number().optional().default(50),
      })
    )
    .mutation(async ({ input }) => {
      const marketAction = dataStore.saveMarketAction({
        titulo: input.titulo,
        alvoId: input.alvoId,
        alvoNome: input.alvoNome,
        tipo: input.canais.includes("whatsapp_zumi") ? "whatsapp" : "trafego_local",
        bairros: input.bairros,
        gatilho: `Disparo tático manual autorizado pelo gestor para contra-atacar ${input.alvoNome}`,
        estrategia: input.estrategia,
        cupom: input.cupom,
        descontoDesc: input.cupom ? `Cupom ${input.cupom} com cashback no Clube Zumi` : "Frete VIP Grátis",
        status: "ativa",
        alcanceEst: Math.floor(Math.random() * 1500) + 2500,
        conversaoEst: Math.floor(Math.random() * 60) + 120,
        receitaGerada: Math.floor(Math.random() * 8000) + 12000,
        roi: `${(Math.random() * 3 + 4.5).toFixed(1)}x`,
      });

      input.canais.forEach((canal) => {
        dataStore.logWebhook(
          canal === "meta_ads" ? "Meta Ads (Instagram / Facebook Graph API)" :
          canal === "whatsapp_zumi" ? "WhatsApp Cloud API (Zumi Copilot)" :
          canal === "google_maps" ? "Google Maps Routes (GCP kytto-514916)" :
          canal === "sefaz_agro" ? "SEFAZ-MT NF-e / NFC-e" : "Zuma Pilot EventBus",
          `ataque_mercado.${input.eixoId}.${canal}`,
          200,
          Math.floor(Math.random() * 25) + 12,
          {
            eixo: input.eixoId,
            titulo: input.titulo,
            alvo: input.alvoNome,
            bairros: input.bairros,
            cupom: input.cupom,
            orcamentoDiario: input.orcamentoDiario,
            timestamp: new Date().toISOString()
          }
        );
      });

      return {
        success: true,
        actionId: marketAction.id,
        mensagem: `Eixo de ataque '${input.titulo}' ativado com sucesso em ${input.bairros.join(", ")}!`,
        canaisAtivados: input.canais,
        projecao: {
          alcancePessoas: marketAction.alcanceEst,
          conversoesEsperadas: marketAction.conversaoEst,
          receitaAdicionalMes: marketAction.receitaGerada,
          roiEsperado: marketAction.roi
        }
      };
    }),

  getMercadoTangaraAnalytics: publicProcedure.query(async () => {
    return {
      demografia: {
        municipio: "Tangará da Serra - MT",
        populacaoEstimada: 106840,
        pibAnual: "R$ 5,6 bilhões",
        pibPerCapita: "R$ 52.410,00",
        poloEconomico: "Médio-Norte de Mato Grosso (Agronegócio, Soja, Milho, Cana Coprodia e Pecuária)",
        bairrosMapeados: [
          { nome: "Jardim Europa", quadrante: "Norte Nobre", rendaMedia: 18500, domicilios: 1450, perfil: "Produtores rurais, médicos, juristas", penetracaoZuma: "64%" },
          { nome: "Jardim dos Ipês", quadrante: "Norte Nobre", rendaMedia: 16800, domicilios: 1200, perfil: "Empresários e famílias de alto padrão", penetracaoZuma: "58%" },
          { nome: "Centro (Av. Brasil / Celso Rosa Lima)", quadrante: "Comercial Central", rendaMedia: 14200, domicilios: 3200, perfil: "Bancos, cooperativas Sicredi/Sicoob, tradings", penetracaoZuma: "72%" },
          { nome: "Vila Alta / Jardim Tarumã", quadrante: "Sul Residencial", rendaMedia: 8900, domicilios: 4100, perfil: "Famílias e profissionais do agronegócio", penetracaoZuma: "42%" },
          { nome: "Cidade Alta / Tangará II", quadrante: "Sul Expansão", rendaMedia: 6700, domicilios: 5500, perfil: "Comércio local, estudantes e transporte", penetracaoZuma: "35%" },
        ],
        mercadoFoodServiceMes: 4850000,
        mercadoModaBoutiqueMes: 6200000,
        participacaoZumaGastronomia: 53.2,
        participacaoZumaModa: 18.5,
      },
      eixosAtaque: [
        {
          id: "anti_atraso_pico",
          titulo: "Operação Cavalo de Troia no Pico de Fim de Semana",
          concorrenteAlvo: "Bonsai Sushi Bar & Nosso Sushi",
          horarioCritico: "Sextas e Sábados das 19h30 às 21h45",
          diagnostico: "Concorrentes entram em colapso operacional com tempo de entrega de 65 a 85 min no iFood e WhatsApp.",
          estrategia: "Campanha geolocalizada no Jardim Europa e Centro: 'Seu sushi na mesa em até 30 min ou 50% de cashback no Clube Zumi'.",
          canais: ["meta_ads", "whatsapp_zumi", "google_maps"],
          bairros: ["Jardim Europa", "Centro", "Jardim dos Ipês"],
          cupom: "ZUMAEXPRESS30",
          impactoEstimadoMes: "R$ 38.500,00"
        },
        {
          id: "corporativo_agro",
          titulo: "Operação Almoço & Jantar Agro VIP (Sicredi, Coprodia, Tradings)",
          concorrenteAlvo: "Restaurantes Tradicionais sem Privacidade e sem NF-e Rápida",
          horarioCritico: "Segunda a Sexta (Almoço 11h30-14h e Jantar de Fechamento)",
          diagnostico: "Grandes empresas agrícolas não têm ambiente acústico privativo e sofrem para conseguir nota fiscal e faturamento mensal.",
          estrategia: "Reserva de Tatames VIP com comanda móvel, menu Omakase executivo e faturamento PJ mensal com NF-e automática e PIX Sicredi Direto.",
          canais: ["whatsapp_zumi", "sefaz_agro"],
          bairros: ["Centro", "Jardim Europa"],
          cupom: "AGROVIPZUMA",
          impactoEstimadoMes: "R$ 44.000,00"
        },
        {
          id: "segura_chuva",
          titulo: "Operação Segura Chuva Tangará (Dr. Clima)",
          concorrenteAlvo: "Deliveries dependentes de motoboys de aplicativo (iFood/Aiqfome)",
          horarioCritico: "Dias e noites com chuva torrencial em Tangará",
          diagnostico: "Motoboys de app recusam chamados na chuva; entregas de concorrentes atrasam mais de 90 min e chegam molhadas/frias.",
          estrategia: "Ativação automática da frota própria com baús térmicos estanques, desvio de áreas de alagamento pela Av. Tancredo Neves e cortesia quente.",
          canais: ["dr_clima", "whatsapp_zumi"],
          bairros: ["Todos os 62 Bairros de Tangará"],
          cupom: "CHUVAVIP",
          impactoEstimadoMes: "R$ 26.800,00"
        },
        {
          id: "salmao_vs_buffet",
          titulo: "Operação Salmão Fresco Chileno vs Buffet Exposto",
          concorrenteAlvo: "Nosso Sushi & S.kamoto (Buffet por KG)",
          horarioCritico: "Todos os dias a partir das 18h",
          diagnostico: "Buffet por quilo expõe o peixe ao ar por horas, ressecando e oxidando o salmão.",
          estrategia: "Marketing de alta qualidade: 'Aqui você não come peixe requentado de esteira. Salmão Fresco Chileno Nobre fatiado na hora no KDS'.",
          canais: ["meta_ads", "whatsapp_zumi"],
          bairros: ["Centro", "Tarumã", "Vila Alta"],
          cupom: "FRESCOCHILENO",
          impactoEstimadoMes: "R$ 31.200,00"
        },
        {
          id: "look_jantar_boutique",
          titulo: "Operação Look & Jantar (Sinergia Gastronomia × Zuma Moda)",
          concorrenteAlvo: "Boutiques convencionais (Florella, Belaví) e Restaurantes isolados",
          horarioCritico: "Quintas a Sábados e Datas Comemorativas",
          diagnostico: "Nenhuma loja em Tangará conecta alta moda e gastronomia sofisticada para o público feminino e casais VIP.",
          estrategia: "Compras acima de R$ 350 na Zuma Moda Boutique ganham voucher de R$ 70 no jantar oriental; mala condicional levada pelo motoboy em casa com hora marcada.",
          canais: ["meta_ads", "whatsapp_zumi"],
          bairros: ["Jardim Europa", "Centro", "Jardim dos Ipês"],
          cupom: "LOOKEJANTAR",
          impactoEstimadoMes: "R$ 29.500,00"
        }
      ]
    };
  }),


    // ==================== SAIPOS KILLER: CAIXA, MESAS, MOTOBOYS & AUTO-ACCEPT ====================
  
  // ==================== MÓDULO DE PAGAMENTOS REAL & CONCILIAÇÃO KYTTOPAY ====================
  getPaymentsOverview: publicProcedure
    .input(
      z.object({
        busca: z.string().optional(),
        forma: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return dataStore.getPayments(input);
    }),

  processPayment: publicProcedure
    .input(
      z.object({
        valor: z.number().positive(),
        forma: z.enum([
          "pix",
          "cartao_credito",
          "cartao_debito",
          "dinheiro",
          "apple_pay",
          "split",
          "convenio_agro",
        ]),
        canal: z.string().default("Balcão / Salão"),
        clienteNome: z.string().default("Cliente Zuma"),
        clienteCpf: z.string().optional(),
        tableNumber: z.number().optional(),
        bandeira: z.string().optional(),
        parcelas: z.number().default(1),
        trocoPara: z.number().optional(),
        splitDetails: z
          .array(z.object({ forma: z.string(), valor: z.number() }))
          .optional(),
        terminal: z.string().optional(),
        operador: z.string().optional(),
        detalhes: z.string().optional(),
        emitirNfce: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.processPayment(input);
    }),

  refundPayment: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
        motivo: z.string(),
        operador: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.refundPayment(input.paymentId, input.motivo, input.operador);
    }),

  generatePixDynamic: publicProcedure
    .input(
      z.object({
        valor: z.number().positive(),
        clienteNome: z.string().optional(),
        canal: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.generatePixDynamic(input.valor, input.clienteNome, input.canal);
    }),

  reopenCashRegister: publicProcedure
    .input(
      z.object({
        operator: z.string().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.reopenCashRegister(input.operator, input.reason);
    }),

  getDailyClosingData: publicProcedure.query(async () => {
    return dataStore.getDailyClosingData();
  }),

  getCashRegister: publicProcedure.query(async () => {
    return dataStore.getCashRegister();
  }),

  openCashRegister: publicProcedure
    .input(
      z.object({
        initialCash: z.number().default(200),
        operator: z.string().default("Mariana (Caixa)"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.openCashRegister(input.initialCash, input.operator);
    }),

  closeCashRegister: publicProcedure
    .input(
      z.object({
        countedCash: z.number(),
        operator: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.closeCashRegister(input.countedCash, input.operator, input.notes);
    }),

  addCashMovement: publicProcedure
    .input(
      z.object({
        type: z.enum(["sangria", "suprimento"]),
        amount: z.number().positive(),
        reason: z.string().min(3),
        operator: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const movement = dataStore.addCashMovement(input.type, input.amount, input.reason, input.operator);
      return { success: true, movement, ...movement };
    }),

    updatePaymentMethod: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
        novoMeio: z.enum([
          "dinheiro",
          "pix",
          "cartao_credito",
          "cartao_debito",
          "apple_pay",
          "convenio_agro",
        ]),
        motivo: z.string().min(3),
        operador: z.string().optional(),
        novoValorBruto: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updatePaymentMethod(
        input.paymentId,
        input.novoMeio,
        input.motivo,
        input.operador,
        input.novoValorBruto
      );
    }),

  updateCashMovement: publicProcedure
    .input(
      z.object({
        movementId: z.string(),
        amount: z.number().positive(),
        reason: z.string().min(3),
        operator: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateCashMovement(
        input.movementId,
        input.amount,
        input.reason,
        input.operator
      );
    }),

  deleteCashMovement: publicProcedure
    .input(
      z.object({
        movementId: z.string(),
        motivo: z.string().min(3),
        operator: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.deleteCashMovement(
        input.movementId,
        input.motivo,
        input.operator
      );
    }),

  settleCashBreakage: publicProcedure
    .input(
      z.object({
        registerId: z.string().optional(),
        tipo: z.enum(["falta", "sobra"]),
        valor: z.number().positive(),
        justificativa: z.string().min(3),
        supervisor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.settleCashBreakage(
        input.registerId,
        input.tipo,
        input.valor,
        input.justificativa,
        input.supervisor
      );
    }),

  getThermalReceipt: publicProcedure
    .input(
      z
        .object({
          registerId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return {
        receiptText: dataStore.getThermalClosingReceiptText(input?.registerId),
        closingData: dataStore.getDailyClosingData(),
      };
    }),

  getThermalClosingReceiptText: publicProcedure
    .input(
      z
        .object({
          registerId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return {
        receiptText: dataStore.getThermalClosingReceiptText(input?.registerId),
        closingData: dataStore.getDailyClosingData(),
      };
    }),

  listTables: publicProcedure.query(async () => {
    return dataStore.getTables();
  }),

  openTable: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        customerCount: z.number().default(2),
        waiter: z.string().default("Matheus (Salão)"),
        customerName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.openTable(input.tableNumber, input.customerCount, input.waiter, input.customerName);
    }),

  addTableItem: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        itemName: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().positive(),
        station: z.string().optional(),
        adicionais: z.array(z.object({ nome: z.string(), preco: z.number() })).optional(),
        observacoes: z.string().optional(),
        operator: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.addTableItem(input.tableNumber, input, input.operator);
    }),

  updateTableDetails: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        customerName: z.string().optional(),
        customerCount: z.number().optional(),
        waiter: z.string().optional(),
        status: z.enum(["livre", "ocupada", "conta", "reservada"]).optional(),
        notes: z.string().optional(),
        serviceFeePercent: z.number().optional(),
        operator: z.string().default("Operador PDV"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateTableDetails(
        input.tableNumber,
        {
          customerName: input.customerName,
          customerCount: input.customerCount,
          waiter: input.waiter,
          status: input.status,
          notes: input.notes,
          serviceFeePercent: input.serviceFeePercent,
        },
        input.operator
      );
    }),

  saveTable: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        operator: z.string().default("Operador PDV"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.saveTable(input.tableNumber, input.operator);
    }),

  processSmartPosTransaction: publicProcedure
    .input(
      z.object({
        tableNumber: z.number().optional(),
        amount: z.number(),
        method: z.enum(["credito", "debito"]),
        installments: z.number().default(1),
        posTerminal: z.string().optional(),
        cardBrand: z.string().optional(),
        operator: z.string().default("Frente de Caixa"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.processSmartPosTransaction(input);
    }),

  generatePixPayload: publicProcedure
    .input(
      z.object({
        tableNumber: z.number().optional(),
        amount: z.number(),
        reference: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.generatePixPayload(input);
    }),

  updateTableItem: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        itemId: z.string(),
        quantity: z.number().optional(),
        observacoes: z.string().optional(),
        unitPrice: z.number().optional(),
        itemName: z.string().optional(),
        station: z.any().optional(),
        adicionais: z.array(z.object({ nome: z.string(), preco: z.number() })).optional(),
        operator: z.string().default("Garçom"),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateTableItem(
        input.tableNumber,
        input.itemId,
        {
          quantity: input.quantity,
          observacoes: input.observacoes,
          unitPrice: input.unitPrice,
          itemName: input.itemName,
          station: input.station,
          adicionais: input.adicionais,
        },
        input.operator,
        input.reason
      );
    }),

  cancelTableItem: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        itemId: z.string(),
        reason: z.string(),
        cancelledBy: z.string().default("Garçom"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.cancelTableItem(input.tableNumber, input.itemId, input.reason, input.cancelledBy);
    }),

  syncOfflineBatch: publicProcedure
    .input(
      z.object({
        deviceId: z.string(),
        operator: z.string().default("PDV / Garçom"),
        operations: z.array(
          z.object({
            id: z.string(),
            type: z.enum([
              "abrir_mesa",
              "adicionar_item",
              "modificar_item",
              "remover_item",
              "editar_mesa",
              "salvar_mesa",
              "pagar_split",
              "fechar_mesa",
              "nfce_contingencia"
            ]),
            tableNumber: z.number(),
            payload: z.any().optional(),
            timestamp: z.string().optional()
          })
        )
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.processOfflineSyncBatch({
        deviceId: input.deviceId,
        operator: input.operator,
        operations: input.operations
      });
    }),

  getCloudSyncStatus: publicProcedure.query(async () => {
    return {
      status: "online",
      serverTime: new Date().toISOString(),
      tablesCount: dataStore.getTables().length,
      activeOrders: dataStore.getTables().filter(t => t.status === "ocupada" || t.status === "conta").length,
      cloudRegion: "southamerica-east1 (São Paulo)",
      provider: "Google Cloud Run Serverless"
    };
  }),

  sendTableToKitchen: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        operator: z.string().default("Garçom"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.sendTableToKitchen(input.tableNumber, input.operator);
    }),

  checkExpedition: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        checkedBy: z.string().default("Expedição Cozinha"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.checkExpedition(input.tableNumber, input.checkedBy);
    }),

  applyTableDiscount: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        discountAmount: z.number().min(0),
        reason: z.string(),
        authorizedBy: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.applyTableDiscount(input.tableNumber, input.discountAmount, input.reason, input.authorizedBy);
    }),

  refundTableItemOrAmount: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        refundAmount: z.number().min(0),
        reason: z.string(),
        authorizedBy: z.string(),
        itemId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.refundTableItemOrAmount(
        input.tableNumber,
        input.refundAmount,
        input.reason,
        input.authorizedBy,
        input.itemId
      );
    }),

  closeTable: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        paymentMethod: z.string().optional(),
        payments: z.array(
          z.object({
            method: z.enum(["pix", "credito", "debito", "dinheiro", "apple_pay", "vale"]),
            amount: z.number(),
            reference: z.string().optional(),
          })
        ).optional(),
        discountAmount: z.number().optional(),
        discountReason: z.string().optional(),
        discountAuthorizedBy: z.string().optional(),
        operator: z.string().optional(),
        splitCount: z.number().optional(),
        role: z.string().optional(),
        canal: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.closeTable(input.tableNumber, input);
    }),

  getAuditTrail: publicProcedure
    .input(
      z.object({
        orderId: z.number().optional(),
        tableNumber: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return dataStore.getAuditTrail(input);
    }),

  getKitchenTickets: publicProcedure
    .input(
      z.object({
        station: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return dataStore.getKitchenTickets(input?.station);
    }),

  updateKitchenTicketStatus: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["novo", "em_preparo", "pronto", "cancelado"]),
        operator: z.string().default("Cozinha"),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateKitchenTicketStatus(input.ticketId, input.status, input.operator);
    }),

  joinTables: publicProcedure
    .input(
      z.object({
        sourceTableNumber: z.number(),
        targetTableNumber: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.joinTables(input.sourceTableNumber, input.targetTableNumber);
    }),

  transferTable: publicProcedure
    .input(
      z.object({
        fromTableNumber: z.number(),
        toTableNumber: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.transferTable(input.fromTableNumber, input.toTableNumber);
    }),

  transferTableItem: publicProcedure
    .input(
      z.object({
        fromTableNumber: z.number(),
        toTableNumber: z.number(),
        itemIndex: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.transferTableItem(input.fromTableNumber, input.toTableNumber, input.itemIndex);
    }),

  updateTableServiceFee: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        serviceFeePercent: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateTableServiceFee(input.tableNumber, input.serviceFeePercent);
    }),

  listMotoboys: publicProcedure.query(async () => {
    return dataStore.getMotoboys();
  }),

  assignOrderToMotoboy: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
        motoboyId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.assignOrderToMotoboy(input.orderId, input.motoboyId);
    }),

  settleMotoboyShift: publicProcedure
    .input(
      z.object({
        motoboyId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.settleMotoboyShift(input.motoboyId);
    }),

  createMotoboy: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        plate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.createMotoboy(input);
    }),

  updateMotoboy: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        phone: z.string().optional(),
        plate: z.string().optional(),
        status: z.enum(["disponivel", "em_rota", "pausa"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return dataStore.updateMotoboy(id, updates);
    }),

  deleteMotoboy: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.deleteMotoboy(input.id);
    }),

  getAutoAcceptConfig: publicProcedure.query(async () => {
    return dataStore.getAutoAcceptConfig();
  }),

  updateAutoAcceptConfig: publicProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        maxActiveOrdersBeforePause: z.number().optional(),
        autoAcceptDelaySeconds: z.number().optional(),
        soundAlertEnabled: z.boolean().optional(),
        autoPrintKitchenTicket: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateAutoAcceptConfig(input);
    }),

  // ==================== PREVISÃO DE COMPRAS & BOM ====================
  getPurchaseForecast: publicProcedure
    .input(
      z.object({
        horizonDays: z.number().default(7),
        scenarioMultiplier: z.number().default(1.0),
      })
    )
    .query(async ({ input }) => {
      const materials = dataStore.getRawMaterials();
      return calculatePurchaseForecast(
        materials,
        input.horizonDays,
        input.scenarioMultiplier,
        680
      );
    }),

  listPurchaseOrders: publicProcedure.query(async () => {
    return dataStore.getPurchaseOrders();
  }),

  createPurchaseOrder: publicProcedure
    .input(
      z.object({
        supplierId: z.string(),
        supplierName: z.string(),
        supplierPhone: z.string(),
        expectedDeliveryDate: z.string(),
        paymentMethod: z.string().optional(),
        items: z.array(
          z.object({
            rawMaterialCode: z.string(),
            rawMaterialName: z.string(),
            quantity: z.number(),
            purchaseUnit: z.string(),
            unitPrice: z.number(),
            totalPrice: z.number(),
            notes: z.string().optional(),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const order = dataStore.createPurchaseOrder(input);
      // Registrar log de emissão de OC
      dataStore.logWebhook(
        "Zuma ERP Suprimentos",
        `PURCHASE_ORDER_ISSUED (${order.orderNumber} - ${order.supplierName})`,
        200,
        14,
        {
          orderNumber: order.orderNumber,
          supplier: order.supplierName,
          totalAmount: order.totalAmount,
          itemCount: order.items.length,
          expectedDelivery: order.expectedDeliveryDate,
        }
      );
      return { success: true, order };
    }),

  receivePurchaseOrder: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      const res = dataStore.receivePurchaseOrder(input.orderId);
      if (res.success && res.order) {
        dataStore.logWebhook(
          "Zuma ERP Suprimentos",
          `PURCHASE_ORDER_RECEIVED (${res.order.orderNumber} - Entrada em Estoque)`,
          200,
          16,
          {
            orderNumber: res.order.orderNumber,
            supplier: res.order.supplierName,
            deliveredAt: res.order.deliveredAt,
            stockUpdated: true,
          }
        );
      }
      return res;
    }),

  updatePurchaseOrderStatus: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["cotacao", "enviado", "em_transito", "recebido", "cancelado"]),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updatePurchaseOrderStatus(input.orderId, input.status);
    }),

  listTechnicalSheets: publicProcedure.query(async () => {
    return ZUMA_TECHNICAL_SHEETS;
  }),

  listSuppliers: publicProcedure.query(async () => {
    return ZUMA_SUPPLIERS;
  }),

  listRawMaterials: publicProcedure.query(async () => {
    return dataStore.getRawMaterials();
  }),

  updateRawMaterialStock: publicProcedure
    .input(z.object({ code: z.string(), delta: z.number() }))
    .mutation(async ({ input }) => {
      dataStore.updateRawMaterialStock(input.code, input.delta);
      return { success: true };
    }),

  // ==================== INTEGRAÇÕES EM TI & SAIPOS SUPERIORITY ====================
  getAutoStockPauseIfood: publicProcedure.query(async () => {
    return dataStore.getAutoStockPauseIfood();
  }),

  toggleAutoStockPauseIfood: publicProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      return dataStore.toggleAutoStockPauseIfood(input.enabled);
    }),

  simulateStockOutagePause: publicProcedure
    .input(z.object({ rawMaterialCode: z.string().default("SALM-01") }))
    .mutation(async ({ input }) => {
      const materials = dataStore.getRawMaterials();
      const item = materials.find(m => m.code === input.rawMaterialCode) || materials[0];
      dataStore.triggerAutoStockPauseIfood(item.name, 4.2);
      return {
        success: true,
        pausedMaterial: item.name,
        triggeredAction: "PAUSE_ITEM_ONLINE_IFOOD",
        pausedDishes: [
          "Especial do Cheff 106 Peças",
          "Sashimi Salmão 24 Fatias",
          "Combo Nakato"
        ],
        message: `Proteção Inteligente Ativada: ${item.name} atingiu 4.2kg (ruptura iminente). Pratos pausados no cardápio do iFood para evitar cancelamentos!`
      };
    }),

  getIntegrationsConfig: publicProcedure.query(async () => {
    return dataStore.getIntegrationsConfig();
  }),

  updateIntegrationsConfig: publicProcedure
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ input }) => {
      return dataStore.updateIntegrationsConfig(input);
    }),

  testIntegrationPing: publicProcedure
    .input(z.object({ channel: z.string() }))
    .mutation(async ({ input }) => {
      const latencies: Record<string, number> = {
        ifood: 32,
        waha: 14,
        sicredi: 11,
        sicoob: 13,
        tef: 18,
        stone: 18,
        cielo: 22,
        mercadopago: 28,
        applepay: 16,
        sefaz: 24,
        sefaz_nfe: 26,
        receita: 35,
        sped: 19,
        lalamove: 45,
        printers: 8,
        spooler: 7,
        toledo: 9,
        iot: 12,
        ultra: 15,
        rappi: 54,
        aiqfome: 48,
        opendelivery: 42,
        anotaai: 38,
        frota_gps: 21,
        maps_routes: 40,
        dr_clima: 29,
        inmet: 33,
        bacen_ptax: 25,
        meta_cloud: 31,
        google_reviews: 44,
        keeto: 17,
        zumi_copilot: 25,
      };
      const lat = latencies[input.channel.toLowerCase()] || Math.floor(15 + Math.random() * 25);
      dataStore.logWebhook(
        `Health Check (${input.channel})`,
        "API_PING_PONG_OK",
        200,
        lat,
        { ping: "pong", channel: input.channel, status: "HEALTHY", checkedAt: new Date().toISOString() }
      );
      return {
        channel: input.channel,
        status: "HEALTHY",
        latencyMs: lat,
        timestamp: new Date().toISOString(),
      };
    }),


  syncIntegrationPlatform: publicProcedure
    .input(z.object({ channel: z.string() }))
    .mutation(async ({ input }) => {
      return dataStore.syncIntegrationPlatform(input.channel);
    }),

  syncAllIntegrations: publicProcedure.mutation(async () => {
    return dataStore.syncAllIntegrations();
  }),

  getIntegrationsCredentials: publicProcedure.query(async () => {
    return dataStore.getIntegrationsCredentials();
  }),

  saveIntegrationCredentials: publicProcedure
    .input(z.object({ channel: z.string(), credentials: z.record(z.string(), z.string()) }))
    .mutation(async ({ input }) => {
      return dataStore.saveIntegrationCredentials(input.channel, input.credentials);
    }),

  testIntegrationConnection: publicProcedure
    .input(z.object({ channel: z.string() }))
    .mutation(async ({ input }) => {
      return dataStore.testIntegrationConnection(input.channel);
    }),

  getSaiposSyncData: publicProcedure.query(async () => {
    return dataStore.getSaiposSyncData();
  }),

  executeSaiposSync: publicProcedure
    .input(z.object({ type: z.string().optional(), operator: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      return dataStore.executeSaiposSync(input || {});
    }),

  exportSaiposMenuJson: publicProcedure.query(async () => {
    return dataStore.exportSaiposMenuJson();
  }),

  importSaiposData: publicProcedure
    .input(z.object({ items: z.array(z.any()), operator: z.string().optional() }))
    .mutation(async ({ input }) => {
      return dataStore.importSaiposData(input.items, input.operator);
    }),

  gerarParecerComprasIa: publicProcedure
    .input(
      z.object({
        horizonDays: z.number().default(7),
        scenarioMultiplier: z.number().default(1.0),
        criticalItemsCount: z.number().default(2),
        totalEstimatedBudget: z.number().default(23840),
        climaChuvaAtivo: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Gere um PARECER EXECUTIVO DE SUPRIMENTOS & PREVISÃO DE COMPRAS (BOM 360°) para a diretoria do Zuma Cozinha Oriental em Tangará da Serra (MT).
Parâmetros Atuais:
- Horizonte de Previsão: ${input.horizonDays} dias
- Cenário de Demanda: ${input.scenarioMultiplier}x ${input.climaChuvaAtivo ? "(Alerta de Chuva/Dr. Clima ATIVO em Tangará: +35% de demanda em delivery/pratos quentes)" : ""}
- Orçamento Sugerido de Compras: R$ ${input.totalEstimatedBudget.toFixed(2)}
- Insumos em Alerta Crítico/Ruptura: ${input.criticalItemsCount} itens (destaque para Salmão Chileno Premium e Embalagens Térmicas)

Fornecedores Principais Homologados:
1. Pantanal Pescados Nobres (Cuiabá ➔ Tangará da Serra, 240km com caminhão refrigerado 0°C a 2°C, pedidos segunda e quarta).
2. Distribuidora Oriental Brasil (Cuiabá, arroz Uruchimai, Noris Gold 500fls, shoyu fermentado).
3. Atacadão Alimentos Tangará (Cream Cheese Philadelphia, óleo de fritura, entrega local no mesmo dia).

Estruture o parecer com:
1. DIAGNÓSTICO ESTRATÉGICO DE ESTOQUE (nível de cobertura em dias, ponto de reposição e risco de ruptura no pico de fim de semana).
2. DIRETRIZES DE PEDIDO PARA O GERENTE DE COMPRAS (fracionamento de remessas: 1ª remessa de 18 peças de salmão terça de manhã e 2ª remessa de 24 peças sexta para pico).
3. ESTRATÉGIA DE NEGOCIAÇÃO E ECONOMIA (descontos por fardo/lote econômico e prazos de boleto faturado 14/21 dias).
4. RECOMENDAÇÃO OPERACIONAL DE SUSHIBAR (aproveitamento estrito do rendimento de 58% do salmão, direcionamento de aparas para hot roll e tartar para blindagem de CMV em 34%).
5. SÍNTESE ACIONÁVEL EM 3 PASSOS IMEDIATOS.`;

      const system = "Você é Akira, especialista sênior em Suprimentos e Supply Chain Gastronômico do Zuma Cozinha Oriental. Responda de forma executiva, objetiva, altamente técnica e rentável.";
      const analise = await generateAiCompletion(prompt, system);

      let resultadoAnalise = analise;
      if (!resultadoAnalise || resultadoAnalise.trim().length === 0) {
        resultadoAnalise = `PARECER EXECUTIVO DE SUPRIMENTOS & SUPPLY CHAIN 360° · ZUMA COZINHA ORIENTAL
Unidade: Tangará da Serra (MT) | Horizonte: ${input.horizonDays} Dias | Cenário: ${input.scenarioMultiplier}x ${input.climaChuvaAtivo ? "(Alerta Dr. Clima: Chuva Ativa em Tangará da Serra)" : "(Demanda Padrão)"}
Orçamento Recomendado: R$ ${input.totalEstimatedBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Alertas Críticos: ${input.criticalItemsCount} itens

1. DIAGNÓSTICO ESTRATÉGICO DE ESTOQUE & COBERTURA:
• O estoque de pescados frescos (Salmão Salar Nobre) encontra-se em nível de atenção com apenas 14.5 kg úteis no estoque físico da Câmara A (0°C a 2°C), correspondendo a 3.1 dias de operação regular.
• Caso ocorra o pico habitual de sexta-feira a domingo e a telemetria climática do Dr. Clima confirme a probabilidade de chuvas (hoje em 83%), o consumo de pratos quentes e temakis delivery aumentará em até +35%, antecipando o esgotamento para sexta-feira às 21h.
• O Ponto de Reposição (ROP) das embalagens térmicas tipo Box e Sacolas Kraft reforçadas também foi atingido (saldo de 320 un vs estoque de segurança de 450 un).

2. DIRETRIZES DE PEDIDO PARA O GERENTE DE COMPRAS:
• Fracionamento Logístico Cuiabá ➔ Tangará da Serra (240 km): Recomenda-se dividir a compra de 42 peças de salmão (~252 kg brutos) em dois despachos pela Pantanal Pescados Nobres para garantir frescor impecável e mitigar perdas por oxidação:
  - 1ª Remessa (Chegada Terça 09h): 18 peças de salmão (108 kg) + 3 fardos de arroz japonês Uruchimai (75 kg) + 4 caixas de Cream Cheese Philadelphia.
  - 2ª Remessa (Chegada Sexta 08h): 24 peças de salmão (144 kg) + insumos de suporte para o final de semana.
• Embalagens Locais: Emitir Ordem de Compra expressa para Embalagens Centro-Oeste Tangará (R$ 840,00) com entrega no mesmo dia para resguardar o delivery.

3. ESTRATÉGIA DE NEGOCIAÇÃO & ECONOMIA:
• Condição Homologada Pantanal Pescados: Solicitar faturamento consolidado quinzenal (14/28 dias) ou desconto financeiro de 3% à vista via Pix para pedidos superiores a R$ 8.000,00, gerando uma economia imediata de R$ 370,50 nesta operação.
• Compras combinadas de seco na Distribuidora Oriental Brasil atingem frete CIF gratuito para Tangará da Serra acima de R$ 2.000,00.

4. RECOMENDAÇÃO OPERACIONAL DE SUSHIBAR (BLINDAGEM DO CMV):
• O rendimento técnico padrão de evisceração e toalete do Salmão Salar deve ser rigidamente mantido em 58% útil.
• Destinação das Porções: 65% do filé nobre para Sashimis e Niguiris Especiais (margem 72%); 20% para Urankis e Temakis; e 15% de aparas/raspas nobres 100% aproveitadas no Hot Roll Zuma Especial e Tartar com Cream Cheese e Cebolinha, garantindo o CMV médio do sushibar em 33.8%.

5. SÍNTESE ACIONÁVEL EM 3 PASSOS IMEDIATOS:
[Passo 1] Transmitir a Ordem de Compra oficial de pescados diretamente ao fornecedor Rogério Mendes (Pantanal Pescados) via WhatsApp integrado.
[Passo 2] Acionar a Ordem de Compra local de embalagens térmicas com a Embalagens Centro-Oeste Tangará.
[Passo 3] Manter a alavanca Zumi IA 'Push VIP Salmão Fresco' pronta para disparo na quinta-feira às 17h para converter a 2ª remessa em receita recorde.`;
      }

      return {
        success: true,
        parecer: resultadoAnalise,
        geradoEm: new Date().toISOString()
      };
    }),

  dispararAlavancaCompras: publicProcedure
    .input(
      z.object({
        nomeAlavanca: z.string(),
        tipo: z.enum(["promocao_excedente", "blindagem_cozinha", "contingencia_chuva"]),
        estimativaReceitaBrl: z.number().default(2450),
      })
    )
    .mutation(async ({ input }) => {
      dataStore.logWebhook(
        "Zumi IA Suprimentos",
        `ALAVANCA_ACIONADA (${input.nomeAlavanca})`,
        200,
        15,
        {
          alavanca: input.nomeAlavanca,
          tipo: input.tipo,
          estimativaReceita: input.estimativaReceitaBrl,
          dataHora: new Date().toISOString(),
          canal: "WhatsApp Zumi VIP & KDS Cozinha"
        }
      );
      return { 
        success: true, 
        estimativaReceita: input.estimativaReceitaBrl,
        mensagem: `Alavanca "${input.nomeAlavanca}" ativada com sucesso! Gatilhos enviados para o KDS e WhatsApp.`
      };
    }),


  // ==================== MÓDULO ULTRA x NOSSA GENTE ====================
  getUltraOverview: publicProcedure.query(async () => {
    return dataStore.getUltraOverview();
  }),
  listUltraSyncEvents: publicProcedure.query(async () => {
    return dataStore.getUltraSyncEvents();
  }),
  emitUltraSyncEvent: publicProcedure
    .input(
      z.object({
        type: z.string(),
        originSystem: z.enum(["NOSSA_GENTE", "ULTRA_SISTEMA"]),
        targetSystem: z.enum(["NOSSA_GENTE", "ULTRA_SISTEMA"]),
        summary: z.string(),
        payload: z.record(z.string(), z.any()).default({}),
        collaboratorId: z.string().optional(),
        collaboratorName: z.string().optional(),
        colaboradorNome: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.emitUltraSyncEvent(input);
    }),

  listUltraInspections: publicProcedure.query(async () => {
    return dataStore.getUltraInspections();
  }),
  createUltraInspection: publicProcedure
    .input(
      z.object({
        category: z.enum(["TEMPERATURA", "HIGIENE_EPI", "RECEBIMENTO_PEIXE", "ETIQUETAGEM_VALIDADE", "FECHAMENTO_NOTURNO"]),
        itemEvaluated: z.string(),
        stationId: z.string().optional(),
        inspectorName: z.string(),
        status: z.enum(["CONFORME", "ALERTA", "NAO_CONFORME"]),
        valueMeasured: z.string().optional(),
        targetStandard: z.string().optional(),
        notes: z.string().optional(),
        photoUrl: z.string().optional(),
        photoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.createUltraInspection(input);
    }),
  updateUltraStation: publicProcedure
    .input(
      z.object({
        stationId: z.string(),
        status: z.enum(["OPERANDO", "PAUSADO", "HIGIENIZACAO", "SETUP"]).optional(),
        assignedCollaborator: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { stationId, ...rest } = input;
      return dataStore.updateUltraStation(stationId, rest);
    }),
  getUltraEquipments: publicProcedure.query(async () => {
    return dataStore.getUltraEquipments();
  }),

  // ==================== PASSAPORTE DO SALMÃO 360° ====================
  listSalmonPassports: publicProcedure.query(async () => {
    return dataStore.getSalmonPassports();
  }),

  getSalmonPassport: publicProcedure
    .input(z.object({ idOuLote: z.string() }))
    .query(async ({ input }) => {
      return dataStore.getSalmonPassport(input.idOuLote);
    }),

  createSalmonPassport: publicProcedure
    .input(z.any())
    .mutation(async ({ input }) => {
      return dataStore.createSalmonPassport(input);
    }),

  // ==================== GATILHOS INTELIGENTES (SMART TRIGGERS) ====================
  listSmartTriggers: publicProcedure.query(async () => {
    return dataStore.getSmartTriggers();
  }),

  toggleSmartTrigger: publicProcedure
    .input(z.object({ ruleId: z.string(), active: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      return dataStore.toggleSmartTrigger(input.ruleId, input.active);
    }),

  simulateSmartTrigger: publicProcedure
    .input(z.object({ ruleId: z.string() }))
    .mutation(async ({ input }) => {
      return dataStore.simulateSmartTrigger(input.ruleId);
    }),

  // ==========================================
  // NOVOS PROCEDIMENTOS ENTERPRISE SAIPOS & VAREJO
  // ==========================================

  // --- BAIRROS & FRETE TANGARÁ DA SERRA (CRUD COMPLETO & TABELA DE PREÇOS) ---
  getDeliveryNeighborhoods: publicProcedure.query(async () => {
    return dataStore.getDeliveryNeighborhoods();
  }),

  createDeliveryNeighborhood: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        cidade: z.string().optional(),
        zone: z.string().default("Centro"),
        cep: z.string().default("78300-000"),
        cepInicial: z.string().optional(),
        cepFinal: z.string().optional(),
        logradourosPrincipais: z.string().optional(),
        distanceKm: z.coerce.number().default(2.0),
        fee: z.coerce.number().default(8.0),
        avgTimeMin: z.coerce.number().default(25),
        freeShippingMin: z.coerce.number().default(120.0),
        minOrderValue: z.coerce.number().default(30.0),
        rainSurcharge: z.coerce.number().default(3.0),
        active: z.boolean().default(true),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.createDeliveryNeighborhood(input);
    }),

  updateDeliveryNeighborhood: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        cidade: z.string().optional(),
        zone: z.string().optional(),
        cep: z.string().optional(),
        cepInicial: z.string().optional(),
        cepFinal: z.string().optional(),
        logradourosPrincipais: z.string().optional(),
        distanceKm: z.coerce.number().optional(),
        fee: z.coerce.number().optional(),
        avgTimeMin: z.coerce.number().optional(),
        freeShippingMin: z.coerce.number().optional(),
        minOrderValue: z.coerce.number().optional(),
        rainSurcharge: z.coerce.number().optional(),
        active: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return dataStore.updateDeliveryNeighborhood(id, updates);
    }),

  deleteDeliveryNeighborhood: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return dataStore.deleteDeliveryNeighborhood(input.id);
    }),

  resetDeliveryNeighborhoodsToDefault: publicProcedure
    .mutation(async () => {
      return dataStore.resetDeliveryNeighborhoodsToDefault();
    }),

  lookupCepTangara: publicProcedure
    .input(
      z.object({
        cep: z.string(),
        orderTotal: z.coerce.number().optional().default(0),
        customerCodeOrPhone: z.string().optional(),
        isVip: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return dataStore.lookupCepTangara(input.cep, input.orderTotal, {
        code: input.customerCodeOrPhone,
        phone: input.customerCodeOrPhone,
        isVip: input.isVip,
      });
    }),

  searchPdvCustomers: publicProcedure
    .input(z.object({ query: z.string().optional().default("") }))
    .query(async ({ input }) => {
      return dataStore.searchCustomers(input.query);
    }),

  createOrUpdateCustomerPdv: publicProcedure
    .input(
      z.object({
        code: z.string().optional(),
        name: z.string().min(2),
        phone: z.string().min(8),
        neighborhood: z.string().optional(),
        address: z.string().optional(),
        cep: z.string().optional(),
        cidade: z.string().optional(),
        isVip: z.boolean().default(false),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.createOrUpdateCustomerPdv(input);
    }),

  // --- PREVENÇÃO DE PERDAS & CANCELAMENTOS ---
  getLossPreventionLogs: publicProcedure.query(async () => {
    return dataStore.getLossPreventionLogs();
  }),

  recordLossPreventionLog: publicProcedure
    .input(
      z.object({
        type: z.enum(["cancelamento_item", "cancelamento_pedido", "estorno_mesa", "desconto_excepcional"]),
        tableOrOrder: z.string(),
        itemName: z.string().optional(),
        amount: z.number(),
        reasonCategory: z.enum(["erro_digitacao", "demora_cozinha", "devolucao_cliente", "quebra_desperdicio", "desistencia", "cortesia_autorizada"]),
        reasonNotes: z.string(),
        requestedBy: z.string(),
        authorizedBy: z.string(),
        pin: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.recordLossPreventionLog(input);
    }),

  // --- RATEIO TAXA DE SERVIÇO 10% (LEI DA GORJETA) ---
  getTipDistributions: publicProcedure.query(async () => {
    return dataStore.getTipDistributions();
  }),

  calculateTipDistribution: publicProcedure
    .input(
      z.object({
        totalTipCollected: z.number(),
        shiftPeriod: z.enum(["almoço", "jantar"]),
        hallPct: z.number().optional(),
        kitchenPct: z.number().optional(),
        barPct: z.number().optional(),
        collaborators: z.array(
          z.object({
            name: z.string(),
            role: z.enum(["garcom", "sushiman", "auxiliar_cozinha", "copeiro", "cumim"]),
            hoursOrPoints: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.calculateTipDistribution(input);
    }),

  // --- CUPONS PROMOCIONAIS & FIDELIDADE ---
  getPromoCoupons: publicProcedure.query(async () => {
    return dataStore.getPromoCoupons();
  }),

  validateCoupon: publicProcedure
    .input(
      z.object({
        code: z.string(),
        orderValue: z.number(),
        channel: z.enum(["salao", "balcao", "delivery", "roupas"]),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.validateCoupon(input.code, input.orderValue, input.channel);
    }),

  // --- ZUMA LOJA DE ROUPAS & MODA ---
  getClothingProducts: publicProcedure.query(async () => {
    return dataStore.getClothingProducts();
  }),

  updateClothingStock: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        size: z.string(),
        color: z.string(),
        newStock: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.updateClothingStock(input.productId, input.size, input.color, input.newStock);
    }),

  getClothingConditionalBags: publicProcedure.query(async () => {
    return dataStore.getClothingConditionalBags();
  }),

  createConditionalBag: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        customerCpf: z.string(),
        items: z.array(
          z.object({
            productId: z.string(),
            productName: z.string(),
            ref: z.string(),
            size: z.string(),
            color: z.string(),
            price: z.number(),
            status: z.enum(["com_cliente", "comprado", "devolvido"]),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.createConditionalBag(input);
    }),

  settleConditionalBag: publicProcedure
    .input(
      z.object({
        bagId: z.string(),
        itemStatuses: z.array(
          z.object({
            productId: z.string(),
            size: z.string(),
            color: z.string(),
            status: z.enum(["comprado", "devolvido"]),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.settleConditionalBag(input.bagId, input.itemStatuses);
    }),

  // ==================== FICHA TÉCNICA E BAIXA DE ESTOQUE ====================
  getTechnicalSheets: publicProcedure.query(async () => {
    return ZUMA_TECHNICAL_SHEETS;
  }),

  deductStockFromRecipe: publicProcedure
    .input(
      z.object({
        dishName: z.string(),
        quantity: z.number().default(1),
        origin: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.deductStockFromRecipe(input.dishName, input.quantity, input.origin);
    }),

  // ==================== CONTINGÊNCIA OFFLINE E NFC-e SEFAZ-MT ====================
  isOfflineMode: publicProcedure.query(async () => {
    return dataStore.isOfflineMode();
  }),

  setOfflineMode: publicProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      return dataStore.setOfflineMode(input.enabled);
    }),

  getFiscalInvoices: publicProcedure.query(async () => {
    return dataStore.getFiscalInvoices();
  }),

  getFiscalContingencyQueue: publicProcedure.query(async () => {
    return dataStore.getFiscalContingencyQueue();
  }),

  emitNfce: publicProcedure
    .input(
      z.object({
        orderId: z.number().optional(),
        tableNumber: z.number().optional(),
        customerName: z.string().optional(),
        cpf: z.string().optional(),
        totalAmount: z.number(),
        items: z.array(
          z.object({
            itemName: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
          })
        ).optional(),
        payments: z.array(
          z.object({
            method: z.string(),
            amount: z.number(),
          })
        ).optional(),
        forceContingency: z.boolean().optional(),
        motivoContingencia: z.string().optional(),
        empresa: z.enum(["gastronomia", "moda"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.emitNfce(input);
    }),

  syncFiscalContingencyQueue: publicProcedure.mutation(async () => {
    return dataStore.syncFiscalContingencyQueue();
  }),

  // ==================== FINANCEIRO E DRE DO TURNO ====================
  getShiftFinancialDre: publicProcedure.query(async () => {
    return dataStore.getShiftFinancialDre();
  }),

  getFinancialAccounts: publicProcedure.query(async () => {
    return dataStore.getFinancialAccounts();
  }),

  getContasPagar: publicProcedure.query(async () => {
    return dataStore.getContasPagar();
  }),

  getContasReceber: publicProcedure.query(async () => {
    return dataStore.getContasReceber();
  }),

  getExtratoBancario: publicProcedure.query(async () => {
    return dataStore.getExtratoBancario();
  }),

  settleContaPagar: publicProcedure
    .input(z.object({ id: z.string(), operator: z.string().optional() }))
    .mutation(async ({ input }) => {
      return dataStore.settleContaPagar(input.id, input.operator);
    }),

  settleContaReceber: publicProcedure
    .input(z.object({ id: z.string(), operator: z.string().optional() }))
    .mutation(async ({ input }) => {
      return dataStore.settleContaReceber(input.id, input.operator);
    }),

  addContaPagar: publicProcedure
    .input(z.object({
      fornecedor: z.string(),
      categoria: z.string(),
      documento: z.string(),
      vencimento: z.string(),
      valorOriginal: z.number(),
      chavePix: z.string().optional(),
      origem: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return dataStore.addContaPagar(input);
    }),

  // ==================== AUTOATENDIMENTO QR CODE NA MESA ====================
  addCustomerTableOrder: publicProcedure
    .input(
      z.object({
        tableNumber: z.number(),
        customerName: z.string().optional(),
        items: z.array(
          z.object({
            itemName: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number().optional(),
            station: z.string().optional(),
            observacoes: z.string().optional(),
            adicionais: z.array(z.object({ nome: z.string(), preco: z.number() })).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.addCustomerTableOrder(input);
    }),

    getClothingVipProfiles: publicProcedure.query(async () => {
    return dataStore.getClothingVipProfiles();
  }),

  createClothingVipProfile: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        tier: z.enum(["Diamante", "Platina", "Ouro"]),
        manequim: z.string(),
        measurements: z.object({
          busto: z.number().optional(),
          torax: z.number().optional(),
          cintura: z.number(),
          quadril: z.number().optional(),
          altura: z.number(),
          sapato: z.number(),
        }),
        styleProfile: z.object({
          predominantStyle: z.string(),
          favoriteColors: z.array(z.string()),
          favoritePieces: z.array(z.string()),
          notes: z.string(),
        }),
        totalSpent: z.number(),
        bagsCount: z.number(),
        lastPurchaseDate: z.string(),
        birthday: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return dataStore.createClothingVipProfile(input);
    }),

  updateClothingVipProfile: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          tier: z.enum(["Diamante", "Platina", "Ouro"]).optional(),
          manequim: z.string().optional(),
          measurements: z.object({
            busto: z.number().optional(),
            torax: z.number().optional(),
            cintura: z.number().optional(),
            quadril: z.number().optional(),
            altura: z.number().optional(),
            sapato: z.number().optional(),
          }).optional(),
          styleProfile: z.object({
            predominantStyle: z.string().optional(),
            favoriteColors: z.array(z.string()).optional(),
            favoritePieces: z.array(z.string()).optional(),
            notes: z.string().optional(),
          }).optional(),
          totalSpent: z.number().optional(),
          bagsCount: z.number().optional(),
          lastPurchaseDate: z.string().optional(),
        birthday: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ input }) => {
    return dataStore.updateClothingVipProfile(input.id, input.data as any);
  }),

  // ==================== MAPA DE CALOR ANALÍTICO MULTIDIMENSIONAL ====================
  getHeatmapAnalytics: publicProcedure
    .input(
      z.object({
        periodo: z.enum(["semana", "mes", "trimestre", "semestre", "anual", "custom"]).default("mes"),
        mes: z.string().optional(), // ex: "2026-11"
        trimestre: z.enum(["Q1", "Q2", "Q3", "Q4"]).optional(),
        semestre: z.enum(["SEM1", "SEM2"]).optional(),
        ano: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        canal: z.enum(["all", "salao", "delivery", "ifood", "balcao"]).default("all"),
        setor: z.enum(["all", "SALAO_NOBRE", "DECK_JARDIM", "TATAMES_VIP", "BALCAO_OMAKASE"]).default("all"),
        metrica: z.enum(["revenue", "orders", "kitchenLoad", "hallOccupancy", "lostRevenue", "salmonKg", "avgTicket"]).default("revenue"),
      })
    )
    .query(async ({ input }) => {
      const periodo = input.periodo || "mes";
      const canal = input.canal || "all";
      const setor = input.setor || "all";
      const metrica = input.metrica || "revenue";

      // Multiplicadores e dias por horizonte temporal
      let multiplier = 4.33; // mês padrão (30 dias)
      let totalDias = 30;
      let labelPeriodo = "Mês Vigente — Novembro de 2026 (30 Dias)";

      if (periodo === "semana") {
        multiplier = 1.0;
        totalDias = 7;
        labelPeriodo = "Semana Atual (16 a 22 de Novembro 2026)";
      } else if (periodo === "mes") {
        multiplier = 4.33;
        totalDias = 30;
        const m = input.mes || "2026-11";
        const nomesMeses: Record<string, string> = {
          "2026-11": "Novembro de 2026 (Mês Atual)",
          "2026-10": "Outubro de 2026",
          "2026-09": "Setembro de 2026",
          "2026-08": "Agosto de 2026",
          "2026-07": "Julho de 2026",
        };
        labelPeriodo = `Mês: ${nomesMeses[m] || m} (30 Dias)`;
      } else if (periodo === "trimestre") {
        multiplier = 13.0;
        totalDias = 90;
        const tri = input.trimestre || "Q4";
        const nomesTri: Record<string, string> = {
          Q4: "4º Trimestre 2026 (Outubro · Novembro · Dezembro)",
          Q3: "3º Trimestre 2026 (Julho · Agosto · Setembro)",
          Q2: "2º Trimestre 2026 (Abril · Maio · Junho)",
          Q1: "1º Trimestre 2026 (Janeiro · Fevereiro · Março)",
        };
        labelPeriodo = `${nomesTri[tri]} (90 Dias)`;
      } else if (periodo === "semestre") {
        multiplier = 26.0;
        totalDias = 180;
        const sem = input.semestre || "SEM2";
        labelPeriodo = sem === "SEM2" 
          ? "2º Semestre 2026 — Safra & Fim de Ano (Julho a Dezembro · 180 Dias)"
          : "1º Semestre 2026 — Início de Operação (Janeiro a Junho · 180 Dias)";
      } else if (periodo === "anual") {
        multiplier = 52.0;
        totalDias = 365;
        labelPeriodo = `Ano Completo ${input.ano || "2026"} Consolidado (365 Dias)`;
      } else if (periodo === "custom") {
        multiplier = 3.5;
        totalDias = 24;
        labelPeriodo = `Período Personalizado (${input.dataInicio || "2026-10-01"} a ${input.dataFim || "2026-11-22"})`;
      }

      // Fator de canal e setor
      let channelFactor = 1.0;
      if (canal === "salao") channelFactor = 0.48;
      else if (canal === "delivery") channelFactor = 0.32;
      else if (canal === "ifood") channelFactor = 0.14;
      else if (canal === "balcao") channelFactor = 0.06;

      let sectorFactor = 1.0;
      if (setor === "SALAO_NOBRE") sectorFactor = 0.45;
      else if (setor === "DECK_JARDIM") sectorFactor = 0.22;
      else if (setor === "TATAMES_VIP") sectorFactor = 0.20;
      else if (setor === "BALCAO_OMAKASE") sectorFactor = 0.13;

      const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      const dayNames = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
      const timeSlots = [
        { id: "11-12", label: "11h - 12h", shortLabel: "11h", period: "Almoço Início" },
        { id: "12-13", label: "12h - 13h", shortLabel: "12h", period: "Almoço Pico" },
        { id: "13-14", label: "13h - 14h", shortLabel: "13h", period: "Almoço Tardio" },
        { id: "14-17", label: "14h - 17h", shortLabel: "14h", period: "Transição Tarde" },
        { id: "17-18", label: "17h - 18h", shortLabel: "17h", period: "Pré-Jantar" },
        { id: "18-19", label: "18h - 19h", shortLabel: "18h", period: "Jantar Abertura" },
        { id: "19-20", label: "19h - 20h", shortLabel: "19h", period: "Jantar Aceleração" },
        { id: "20-21", label: "20h - 21h", shortLabel: "20h", period: "Pico Máximo" },
        { id: "21-22", label: "21h - 22h", shortLabel: "21h", period: "Pico Sustentado" },
        { id: "22-23", label: "22h - 23h", shortLabel: "22h", period: "Fechamento" },
        { id: "23-00", label: "23h - 00h", shortLabel: "23h", period: "Madrugada Delivery" },
      ];

      // Geração da matriz 7x11 calibrada com o período
      const matrix = days.map((dayCode, dayIdx) => {
        const isWeekend = dayIdx === 4 || dayIdx === 5;
        const isSunday = dayIdx === 6;
        const isMonday = dayIdx === 0;

        return timeSlots.map((slot, slotIdx) => {
          let isOpen = true;
          let baseOrders = 0;

          if (slotIdx === 3) {
            isOpen = false; // Preparação / Mise-en-place
          } else if (isMonday && slotIdx < 5) {
            isOpen = false; // Segunda almoço fechado
          } else if (slotIdx < 3) {
            baseOrders = isWeekend ? (isSunday ? 22 : 16) : 9;
          } else if (slotIdx === 4) {
            baseOrders = isWeekend ? 8 : 4;
          } else if (slotIdx === 5) {
            baseOrders = isWeekend ? 18 : 9;
          } else if (slotIdx === 6) {
            baseOrders = isWeekend ? 28 : 16;
          } else if (slotIdx === 7) {
            baseOrders = isWeekend ? 36 : 22;
          } else if (slotIdx === 8) {
            baseOrders = isWeekend ? 30 : 18;
          } else if (slotIdx === 9) {
            baseOrders = isWeekend ? 18 : 7;
          } else if (slotIdx === 10) {
            baseOrders = isWeekend ? 10 : 3;
          }

          if (isMonday && isOpen) {
            baseOrders = Math.max(1, Math.floor(baseOrders * 0.5));
          }

          const orders = isOpen ? Math.round(baseOrders * multiplier * channelFactor * sectorFactor) : 0;
          const avgTicket = slotIdx < 3 ? 58.0 : 96.5;
          const revenue = Math.round(orders * avgTicket);
          const kitchenCapacity = Math.round(36 * multiplier);
          const kitchenLoad = isOpen ? Math.min(100, Math.round((orders / (kitchenCapacity || 1)) * 100)) : 0;
          const hallOccupancy = isOpen ? Math.min(100, Math.round(((orders * 1.85) / (68 * multiplier || 1)) * 100)) : 0;

          const optimalOrders = Math.round(kitchenCapacity * 0.8);
          const lostOrders = isOpen ? Math.max(0, optimalOrders - orders) : 0;
          const lostRevenue = Math.round(lostOrders * avgTicket);
          const salmonKg = Math.round(orders * 0.38 * 10) / 10;

          let bottleneck: "nenhum" | "cozinha_lotada" | "salao_vazio" | "espera_motoboy" = "nenhum";
          if (kitchenLoad >= 85) bottleneck = "cozinha_lotada";
          else if (isOpen && hallOccupancy <= 28 && slotIdx >= 5) bottleneck = "salao_vazio";

          const salao = Math.round(orders * 0.48);
          const delivery = Math.round(orders * 0.32);
          const ifood = Math.round(orders * 0.14);
          const balcao = Math.max(0, orders - salao - delivery - ifood);

          const topDishes = slotIdx < 3
            ? ["Yakissoba Especial", "Poke de Salmão Fresco", "Executivo Teppan"]
            : ["Barca Zuma Especial 40p", "Hot Filadélfia Panko", "Uramaki Salmão Trufado", "Sashimi Salmão Nobre"];

          let aiTip = "Fluxo equilibrado dentro da capacidade instalada.";
          if (!isOpen && (isMonday || slotIdx < 3)) {
            aiTip = "Janela fechada com demanda latente na Av. Brasil. Abrir delivery ou executivo pode render faturamento adicional.";
          } else if (bottleneck === "cozinha_lotada") {
            aiTip = "Saturação de KDS no pico. Recomendação Zumi: antecipar pedidos com cashback das 18h30 às 19h30.";
          } else if (bottleneck === "salao_vazio") {
            aiTip = "Salão ocioso com capacidade ociosa. Disparar cupom 'Hot Roll em Dobro' para fidelizados do Centro e Jardim Europa.";
          }

          return {
            dayIdx,
            dayName: dayNames[dayIdx],
            dayCode,
            slotIdx,
            slotId: slot.id,
            slotLabel: slot.label,
            slotPeriod: slot.period,
            isOpen,
            orders,
            revenue,
            avgTicket,
            kitchenLoad,
            hallOccupancy,
            lostRevenue,
            salmonKg,
            channels: { salao, delivery, ifood, balcao },
            bottleneck,
            topDishes,
            aiTip,
          };
        });
      });

      // Agregação dos Totais Executivos
      const allCells = matrix.flat();
      const totalRevenue = allCells.reduce((acc, c) => acc + c.revenue, 0);
      const totalOrders = allCells.reduce((acc, c) => acc + c.orders, 0);
      const totalLostRevenue = allCells.reduce((acc, c) => acc + c.lostRevenue, 0);
      const totalSalmonKg = Math.round(allCells.reduce((acc, c) => acc + c.salmonKg, 0));
      const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const activeCells = allCells.filter(c => c.isOpen);
      const avgOccupancy = activeCells.length > 0 
        ? Math.round(activeCells.reduce((acc, c) => acc + c.hallOccupancy, 0) / activeCells.length) 
        : 0;
      
      // CMV Real apurado pelas Fichas Técnicas (em torno de 30.8% a 31.4%)
      const cmvRealPerc = 31.2;
      const cmvRealBrl = Math.round(totalRevenue * (cmvRealPerc / 100));

      // Economia calculada vs Saipos & iFood (27% taxa iFood em delivery direto + 2.49% Pix Sicredi + mensalidade)
      const economiaDeliveryDireto = Math.round(totalRevenue * 0.32 * 0.27);
      const economiaPixSicredi = Math.round(totalRevenue * 0.55 * 0.0249);
      const economiaMensalidade = Math.round(multiplier * 180);
      const economiaSaiposIfood = economiaDeliveryDireto + economiaPixSicredi + economiaMensalidade;

      // Calendário Mosaico Contínuo (para 30, 90, 180 ou 365 dias)
      const calendarDays: Array<{
        date: string;
        dayNum: number;
        dayName: string;
        revenue: number;
        orders: number;
        heatLevel: 0 | 1 | 2 | 3 | 4;
        specialEvent?: string;
      }> = [];

      const hoje = new Date(2026, 10, 22); // 22 de Novembro de 2026
      for (let i = totalDias - 1; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        const dayOfWeek = d.getDay(); // 0 domingo, 6 sabado
        const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6;
        const isSundayDay = dayOfWeek === 0;

        let baseDayRev = isWeekendDay ? 14800 : isSundayDay ? 10200 : (dayOfWeek === 1 ? 4200 : 7800);
        const noise = ((d.getDate() * 11) % 19) - 9;
        const dayRev = Math.round(baseDayRev * (1 + noise / 100) * channelFactor * sectorFactor);
        const dayOrders = Math.round(dayRev / 94);

        let heatLevel: 0 | 1 | 2 | 3 | 4 = 1;
        if (dayRev >= 13500) heatLevel = 4;
        else if (dayRev >= 9500) heatLevel = 3;
        else if (dayRev >= 6000) heatLevel = 2;
        else if (dayRev <= 4000) heatLevel = 0;

        let specialEvent: string | undefined;
        if (d.getDate() === 5 || d.getDate() === 20) specialEvent = "Pagamento MT (Injeção de Salários na Região)";
        else if (dayOfWeek === 5) specialEvent = "Sexta Omakase & Chegada de Salmão Fresco";
        else if (dayOfWeek === 6) specialEvent = "Sábado Familiar & Reservas Tatame";

        calendarDays.push({
          date: d.toISOString().split("T")[0],
          dayNum: d.getDate(),
          dayName: days[(dayOfWeek + 6) % 7],
          revenue: dayRev,
          orders: dayOrders,
          heatLevel,
          specialEvent,
        });
      }

      // Mapeamento Térmico Espacial das 27 Mesas Físicas da Zuma
      const mesasData = [
        // SALÃO NOBRE (1 a 12)
        { id: 1, nome: "Mesa 01", ambiance: "SALAO_NOBRE", lugares: 4, occ: 78, revBase: 18500, giros: 2.3, perm: 62 },
        { id: 2, nome: "Mesa 02", ambiance: "SALAO_NOBRE", lugares: 4, occ: 82, revBase: 19800, giros: 2.5, perm: 58 },
        { id: 3, nome: "Mesa 03", ambiance: "SALAO_NOBRE", lugares: 2, occ: 68, revBase: 14200, giros: 2.8, perm: 48 },
        { id: 4, nome: "Mesa 04", ambiance: "SALAO_NOBRE", lugares: 2, occ: 72, revBase: 15100, giros: 2.7, perm: 50 },
        { id: 5, nome: "Mesa 05", ambiance: "SALAO_NOBRE", lugares: 6, occ: 86, revBase: 24500, giros: 2.1, perm: 75 },
        { id: 6, nome: "Mesa 06", ambiance: "SALAO_NOBRE", lugares: 4, occ: 74, revBase: 17900, giros: 2.2, perm: 64 },
        { id: 7, nome: "Mesa 07", ambiance: "SALAO_NOBRE", lugares: 4, occ: 88, revBase: 22100, giros: 2.6, perm: 60 },
        { id: 8, nome: "Mesa 08", ambiance: "SALAO_NOBRE", lugares: 6, occ: 80, revBase: 23400, giros: 2.0, perm: 78 },
        { id: 9, nome: "Mesa 09", ambiance: "SALAO_NOBRE", lugares: 4, occ: 65, revBase: 16200, giros: 2.0, perm: 66 },
        { id: 10, nome: "Mesa 10", ambiance: "SALAO_NOBRE", lugares: 2, occ: 60, revBase: 13000, giros: 2.4, perm: 52 },
        { id: 11, nome: "Mesa 11", ambiance: "SALAO_NOBRE", lugares: 4, occ: 76, revBase: 18800, giros: 2.3, perm: 62 },
        { id: 12, nome: "Mesa 12", ambiance: "SALAO_NOBRE", lugares: 8, occ: 84, revBase: 28900, giros: 1.8, perm: 92 },
        // DECK JARDIM & LOUNGE (13 a 18)
        { id: 13, nome: "Mesa 13 (Deck)", ambiance: "DECK_JARDIM", lugares: 4, occ: 70, revBase: 16800, giros: 2.4, perm: 70 },
        { id: 14, nome: "Mesa 14 (Deck)", ambiance: "DECK_JARDIM", lugares: 4, occ: 75, revBase: 17900, giros: 2.5, perm: 68 },
        { id: 15, nome: "Mesa 15 (Deck)", ambiance: "DECK_JARDIM", lugares: 6, occ: 82, revBase: 21500, giros: 2.2, perm: 85 },
        { id: 16, nome: "Mesa 16 (Deck)", ambiance: "DECK_JARDIM", lugares: 6, occ: 85, revBase: 22800, giros: 2.3, perm: 82 },
        { id: 17, nome: "Mesa 17 (Lounge)", ambiance: "DECK_JARDIM", lugares: 4, occ: 62, revBase: 14900, giros: 2.1, perm: 75 },
        { id: 18, nome: "Mesa 18 (Lounge)", ambiance: "DECK_JARDIM", lugares: 4, occ: 64, revBase: 15300, giros: 2.1, perm: 76 },
        // TATAMES VIP PRIVATIVOS (19 a 22)
        { id: 19, nome: "Tatame VIP Tóquio", ambiance: "TATAMES_VIP", lugares: 8, occ: 94, revBase: 36200, giros: 1.9, perm: 105 },
        { id: 20, nome: "Tatame VIP Kyoto", ambiance: "TATAMES_VIP", lugares: 6, occ: 92, revBase: 31800, giros: 2.0, perm: 98 },
        { id: 21, nome: "Tatame VIP Osaka", ambiance: "TATAMES_VIP", lugares: 6, occ: 90, revBase: 30500, giros: 1.9, perm: 100 },
        { id: 22, nome: "Tatame VIP Nara", ambiance: "TATAMES_VIP", lugares: 8, occ: 95, revBase: 38400, giros: 1.9, perm: 110 },
        // BALCÃO OMAKASE VIP (23 a 27)
        { id: 23, nome: "Balcão Omakase 01", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 96, revBase: 19500, giros: 3.2, perm: 65 },
        { id: 24, nome: "Balcão Omakase 02", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 95, revBase: 19200, giros: 3.1, perm: 66 },
        { id: 25, nome: "Balcão Omakase 03", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 98, revBase: 20100, giros: 3.3, perm: 64 },
        { id: 26, nome: "Balcão Omakase 04", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 94, revBase: 18900, giros: 3.0, perm: 68 },
        { id: 27, nome: "Balcão Omakase 05", ambiance: "BALCAO_OMAKASE", lugares: 1, occ: 92, revBase: 18400, giros: 2.9, perm: 70 },
      ];

      const mesasHeatmap = mesasData
        .filter(m => setor === "all" || m.ambiance === setor)
        .map(m => {
          const faturamentoAcumulado = Math.round((m.revBase * multiplier) / 4.33);
          let statusCalor: "fervendo" | "aquecido" | "morno" | "frio" = "morno";
          if (m.occ >= 90) statusCalor = "fervendo";
          else if (m.occ >= 75) statusCalor = "aquecido";
          else if (m.occ <= 65) statusCalor = "frio";

          const ticketMedioMesa = Math.round(faturamentoAcumulado / ((m.giros * totalDias) || 1));

          return {
            id: m.id,
            nome: m.nome,
            ambiance: m.ambiance,
            lugares: m.lugares,
            taxaOcupacao: m.occ,
            faturamentoAcumulado,
            girosMediosDia: m.giros,
            tempoPermanenciaMedio: m.perm,
            ticketMedioMesa,
            statusCalor,
          };
        });

      // Oportunidades Preditivas Zumi IA
      const topOpportunities = [
        {
          id: "opp-1",
          tag: "Anti-Ociosidade Terça/Quarta",
          titulo: "Festival de Hot Roll & Temaki em Dobro (18h às 19h30)",
          diagnostico: `Salão com 26% de ocupação neste horário no período ${labelPeriodo}. Cozinha fria ociosa com capacidade para +28 pedidos/hora.`,
          acao: "Disparar gatilho automático Zumi IA no WhatsApp para a base de clientes do Centro e Tangará com cupom de Hot Roll duplo.",
          potencialBrl: Math.round(1850 * multiplier),
          whatsappMinuta: "Terça e Quarta do Hot Roll no Zuma! Peça 1 Hot Roll Filadélfia e leve o dobro para a sua mesa ou em casa até as 19h30: [link]",
          prazoImpacto: "Imediato",
          tipoAcao: "whatsapp",
        },
        {
          id: "opp-2",
          tag: "Almoço Corporativo Av. Brasil",
          titulo: "Almoço Executivo Express com Garantia de 25 Minutos",
          diagnostico: "Demanda latente de escritórios de advocacia, agronegócio e contabilidade na Av. Brasil sem opção de almoço japonês rápido com preço fechado.",
          acao: "Implantar cardápio executivo de R$ 44,90 (Yakissoba, Poke ou Teppan com sunomono incluso) com pedido e pagamento via QR Code.",
          potencialBrl: Math.round(2400 * multiplier),
          whatsappMinuta: "Almoço executivo no Zuma: 3 opções nobres com sunomono servidos em até 25 minutos no salão ou no seu escritório: [link]",
          prazoImpacto: "3 dias",
          tipoAcao: "salao",
        },
        {
          id: "opp-3",
          tag: "Blindagem de SLA no Pico",
          titulo: "Deslocamento de Carga do Pico das 20h para as 18h45",
          diagnostico: "O pico de sexta e sábado atinge 98% de saturação no KDS entre 20h15 e 21h30, gerando risco de espera superior a 35 minutos.",
          acao: "Conceder 10% de cashback para clientes presenciais e de delivery próprio que finalizarem seus pedidos até as 19h15.",
          potencialBrl: Math.round(1650 * multiplier),
          whatsappMinuta: "Jante mais cedo no Zuma e ganhe 10% de cashback no seu pedido presencial ou WhatsApp até as 19h15: [link]",
          prazoImpacto: "Fim de semana",
          tipoAcao: "delivery",
        },
      ];

      return {
        success: true,
        periodoInfo: {
          tipo: periodo,
          label: labelPeriodo,
          multiplier,
          totalDias,
          canal,
          setor,
          metrica,
        },
        summary: {
          totalRevenue,
          totalOrders,
          avgTicket,
          cmvRealPerc,
          cmvRealBrl,
          avgOccupancy,
          totalLostRevenue,
          totalSalmonKg,
          topChannel: "Salão Presencial (48%)",
          peakHour: "20h - 21h (Sexta e Sábado)",
          economiaSaiposIfood,
        },
        matrix,
        calendarDays,
        mesasHeatmap,
        topOpportunities,
      };
    }),

  // ==================== GOOGLE WORKSPACE & CLOUD HUB ====================
  getGoogleHubData: publicProcedure.query(async () => {
    return ecosystemService.getGoogleWorkspaceData();
  }),

  triggerGoogleExport: publicProcedure
    .input(z.object({
      type: z.enum(["sheets_dre", "sheets_kardex", "drive_xml_backup", "bigquery_stream"])
    }))
    .mutation(async ({ input }) => {
      return ecosystemService.triggerGoogleExport(input.type);
    }),

  respondGoogleReview: publicProcedure
    .input(z.object({
      reviewId: z.string(),
      replyText: z.string().min(1)
    }))
    .mutation(async ({ input }) => {
      return ecosystemService.respondGoogleReview(input.reviewId, input.replyText);
    }),

  // ==================== BANCOS, OPEN FINANCE & TEF MULTIMARCAS ====================
  getBancosTefData: publicProcedure.query(async () => {
    return ecosystemService.getBancosTefData();
  }),

  triggerConciliacaoBancaria: publicProcedure.mutation(async () => {
    return ecosystemService.triggerConciliacaoBancaria();
  }),

  simulateTefTransaction: publicProcedure
    .input(z.object({
      amount: z.number().positive(),
      acquirer: z.string().default("Stone Hub"),
      method: z.enum(["debito", "credito", "voucher"]).default("debito")
    }))
    .mutation(async ({ input }) => {
      return ecosystemService.simulateTefTransaction(input.amount, input.acquirer, input.method);
    }),

  // ==================== GIT, DEVOPS & MCP SERVER ====================
  getGitDevopsData: publicProcedure.query(async () => {
    return ecosystemService.getGitDevopsData();
  }),

  triggerGitSnapshot: publicProcedure
    .input(z.object({ operator: z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      return ecosystemService.triggerGitSnapshot(input?.operator);
    }),

  getZumaMcpManifest: publicProcedure.query(async () => {
    return ecosystemService.getZumaMcpManifest();
  }),

  executeZumaMcpTool: publicProcedure
    .input(z.object({
      toolName: z.string(),
      args: z.record(z.string(), z.any()).optional(),
      callerAgent: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return ecosystemService.executeZumaMcpTool(input.toolName, input.args || {}, input.callerAgent || "Frontend Client");
    }),

  // ==================== DECISION INTELLIGENCE HUB ====================
  getDecisionHubData: publicProcedure.query(async () => {
    return ecosystemService.getDecisionIntelligenceInsights();
  }),

  executeDecisionAction: publicProcedure
    .input(z.object({
      actionId: z.string(),
      operator: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return ecosystemService.executeDecisionAction(input.actionId, input.operator);
    }),

  // ==================== TANGARÁ DA SERRA ROUTING & LOGISTICS ====================
  getTangaraPontosCriticos: publicProcedure.query(async () => {
    return TANGARA_PONTOS_CRITICOS;
  }),

  calcularRotaTangara: publicProcedure
    .input(z.object({
      origemLat: z.number().default(LAT_ZUMA),
      origemLng: z.number().default(LNG_ZUMA),
      destinoLat: z.number(),
      destinoLng: z.number(),
      perfil: z.enum(["mais_rapida", "menor_distancia", "segura_chuva"]).default("mais_rapida")
    }))
    .mutation(async ({ input }) => {
      return await calcularRotaTangara(
        { lat: input.origemLat, lng: input.origemLng },
        { lat: input.destinoLat, lng: input.destinoLng },
        input.perfil
      );
    }),

  otimizarEntregasLote: publicProcedure
    .input(z.object({
      latAtual: z.number().default(LAT_ZUMA),
      lngAtual: z.number().default(LNG_ZUMA),
      pedidos: z.array(z.object({
        id: z.string(),
        pedidoId: z.string(),
        clienteNome: z.string(),
        endereco: z.string(),
        bairro: z.string(),
        lat: z.number(),
        lng: z.number(),
        taxaEntrega: z.number(),
        tempoPreparoMin: z.number().optional()
      }))
    }))
    .mutation(async ({ input }) => {
      return otimizarLoteEntregas(
        { lat: input.latAtual, lng: input.lngAtual },
        input.pedidos
      );
    }),
});
