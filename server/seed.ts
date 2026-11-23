import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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
} from "../drizzle/schema";
import {
  ALL_ITEMS,
  BAIRROS_TANGARA,
  INITIAL_STOCK,
  getItemCost,
  MENU,
} from "../shared/zumaData";

async function seed() {
  console.log("[Seed] Starting database population...");
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  // 1. Insumos do Estoque
  console.log("[Seed] Seeding stock items...");
  await db.delete(stockItems);
  for (const s of INITIAL_STOCK) {
    await db.insert(stockItems).values({
      code: s.k,
      name: s.n,
      unit: s.u,
      currentStock: String(s.q),
      minStock: String(s.min),
      unitCost: String(s.c),
      supplier: "Pescados MT & Distribuidora Tangará",
    });
  }

  // 2. Base de Conhecimento (Aprendizado Zumi)
  console.log("[Seed] Seeding knowledge base...");
  await db.delete(knowledgeBase);
  const kbData = [
    {
      id: "kb-alelo",
      question: "Vocês aceitam vale refeição Alelo?",
      answer: "Aceitamos sim! Alelo Alimentação e Refeição na entrega, além de Pix e cartões.",
      status: "aprovado" as const,
      origin: "Cadastro manual",
      usesCount: 7,
    },
    {
      id: "kb-lactose",
      question: "Tem opção sem lactose ou sem cream cheese?",
      answer: "Dá para pedir sem cream cheese nos uramakis, temakis e hot rolls! É só me avisar no pedido que a cozinha prepara sem lactose.",
      status: "aprovado" as const,
      origin: "Cadastro manual",
      usesCount: 4,
    },
    {
      id: "kb-bairro",
      question: "Vocês entregam no meu bairro? Qual a taxa?",
      answer: "Entregamos em toda Tangará da Serra! A taxa varia entre R$ 9,00 e R$ 22,00 dependendo da localização.",
      status: "aprovado" as const,
      origin: "Cadastro manual",
      usesCount: 11,
    },
    {
      id: "kb-gluten",
      question: "Vocês têm opção sem glúten?",
      answer: "Temos sim! Sashimi puro, sunomono e poke sem molhos especiais. E temos shoyu sem glúten se você pedir na observação.",
      status: "aprovado" as const,
      origin: "Resposta da equipe",
      usesCount: 1,
    },
    {
      id: "kb-bolo",
      question: "Posso levar bolo de aniversário no salão?",
      answer: "Pode trazer o bolo sim, sem taxa de corte! A gente guarda na geladeira e canta parabéns junto com a equipe 🎉",
      status: "pendente" as const,
      origin: "Resposta da equipe",
      usesCount: 0,
    },
    {
      id: "kb-evento",
      question: "Vocês fazem rodízio para evento de empresa com 40 pessoas?",
      answer: "Para 40 pessoas temos pacotes especiais a partir de R$ 89,90 por pessoa com reserva antecipada de 10 dias.",
      status: "pendente" as const,
      origin: "IA não soube",
      usesCount: 0,
    },
  ];
  for (const kb of kbData) {
    await db.insert(knowledgeBase).values(kb);
  }

  // 3. Clientes (CRM)
  console.log("[Seed] Seeding sample customers...");
  await db.delete(customers);
  const sampleCustomers = [
    { name: "Marina Silva", phone: "(65) 99812-4410", neighborhood: "Jardim Europa", segment: "fiel" as const, ordersCount: 9, totalSpent: "812.00", daysSinceLastOrder: 1, favoriteDish: "Combo 26 Peças", tags: ["gosta de hot", "pede pelo whats"] },
    { name: "Paulo Roberto", phone: "(65) 99655-0912", neighborhood: "Vila Alta", segment: "regular" as const, ordersCount: 3, totalSpent: "214.00", daysSinceLastOrder: 4, favoriteDish: "Yakissoba de Frango", tags: ["almoço"] },
    { name: "Lívia Morales", phone: "(65) 99901-3378", neighborhood: "Centro", segment: "fiel" as const, ordersCount: 6, totalSpent: "498.00", daysSinceLastOrder: 0, favoriteDish: "Hot Filadélfia (12un)", tags: ["pediu hoje"] },
    { name: "Caio Toledo", phone: "(65) 99234-7781", neighborhood: "Jardim Shangri-lá", segment: "vip" as const, ordersCount: 14, totalSpent: "1630.00", daysSinceLastOrder: 3, favoriteDish: "Especial Zuma 68 Peças", tags: ["aniversário sábado", "VIP"] },
    { name: "Bia Ferreira", phone: "(65) 99477-1205", neighborhood: "Jardim Tarumã", segment: "novo" as const, ordersCount: 1, totalSpent: "64.00", daysSinceLastOrder: 5, favoriteDish: "Hot Filadélfia (12un)", tags: ["não come cru"] },
    { name: "Duda Lima", phone: "(65) 99118-6642", neighborhood: "Vila Horizonte", segment: "regular" as const, ordersCount: 4, totalSpent: "302.00", daysSinceLastOrder: 12, favoriteDish: "Poke de Salmão", tags: ["sem glúten"] },
    { name: "Jorge Alencar", phone: "(65) 99560-2290", neighborhood: "Jardim Europa", segment: "lead" as const, ordersCount: 0, totalSpent: "0.00", daysSinceLastOrder: 0, favoriteDish: "Combo Mix", tags: ["empresa", "evento"] },
    { name: "Fernanda Kramer", phone: "(65) 99733-8015", neighborhood: "Jardim do Sol", segment: "sumido" as const, ordersCount: 5, totalSpent: "371.00", daysSinceLastOrder: 72, favoriteDish: "Combo 26 Peças", tags: ["voltou pela campanha"], recoveryWave: 1, recoveryStatus: "voltou" },
    { name: "Bruno Martins", phone: "(65) 99341-9922", neighborhood: "Centro", segment: "vip" as const, ordersCount: 16, totalSpent: "2150.00", daysSinceLastOrder: 2, favoriteDish: "Combo Nakato", tags: ["cliente antigo", "VIP"] },
    { name: "Carla Santos", phone: "(65) 99182-3341", neighborhood: "Vila Esmeralda", segment: "sumido" as const, ordersCount: 4, totalSpent: "280.00", daysSinceLastOrder: 88, favoriteDish: "Temaki Salmão", tags: ["sumido"], recoveryWave: 2, recoveryStatus: "aguardando" },
    { name: "Diego Ramos", phone: "(65) 99611-7729", neighborhood: "Jardim Cidade Alta", segment: "novo" as const, ordersCount: 1, totalSpent: "58.00", daysSinceLastOrder: 6, favoriteDish: "Hot Filadélfia (12un)", tags: ["1 pedido"] },
    { name: "Elisa Toledo", phone: "(65) 99877-2201", neighborhood: "Parque Universitário", segment: "sumido" as const, ordersCount: 3, totalSpent: "192.00", daysSinceLastOrder: 65, favoriteDish: "Poke de Salmão", tags: ["estudante"], recoveryWave: 2, recoveryStatus: "aguardando" },
    { name: "Fábio Lopes", phone: "(65) 99214-5582", neighborhood: "Centro", segment: "fiel" as const, ordersCount: 8, totalSpent: "680.00", daysSinceLastOrder: 3, favoriteDish: "Uramaki Filadélfia (8un)", tags: ["salão e delivery"] },
    { name: "Gabi Nogueira", phone: "(65) 99422-8819", neighborhood: "Alto da Boa Vista", segment: "novo" as const, ordersCount: 1, totalSpent: "45.00", daysSinceLastOrder: 8, favoriteDish: "Yakissoba de Frango", tags: ["executivo"] }
  ];
  for (const c of sampleCustomers) {
    await db.insert(customers).values(c);
  }

  // 4. Conversas do WhatsApp
  console.log("[Seed] Seeding WhatsApp conversations...");
  await db.delete(conversationMessages);
  await db.delete(conversations);

  const convSeeds = [
    {
      id: "demo-livia",
      customerName: "Lívia Morales",
      customerPhone: "(65) 99901-3378",
      neighborhood: "Centro",
      segment: "Fiel",
      status: "fila" as const,
      handoffReason: "Reclamação",
      reasons: ["Reclamação"],
      handoffsCount: 1,
      returnsCount: 0,
      cart: [{ nome: "Hot Filadélfia (12un)", preco: 31.9, cat: "Hot rolls", q: 1 }],
      queuedAt: new Date(Date.now() - 6 * 60000),
      intent: "Reclamação",
      tags: ["pediu hoje", "urgente"],
      messages: [
        { authorType: "cli" as const, content: "Boa noite, meu pedido veio frio e faltou o shoyu." },
        { authorType: "ia" as const, content: "Poxa, Lívia, sinto muito! Já chamei alguém da equipe para resolver com você agora mesmo 🙏" },
        { authorType: "sys" as const, content: "Zumi passou para a equipe · Reclamação" }
      ]
    },
    {
      id: "demo-caio",
      customerName: "Caio Toledo",
      customerPhone: "(65) 99234-7781",
      neighborhood: "Jardim Shangri-lá",
      segment: "VIP",
      status: "humano" as const,
      assignedAgent: "Ana (equipe)",
      handoffReason: "Cliente pediu uma pessoa",
      reasons: ["Cliente pediu uma pessoa"],
      handoffsCount: 1,
      returnsCount: 0,
      cart: [{ nome: "Especial Zuma 68 Peças", preco: 230.9, cat: "Combinados", q: 1 }],
      intent: "Reserva",
      tags: ["aniversário sábado", "VIP"],
      messages: [
        { authorType: "cli" as const, content: "Tem mesa para 8 no sábado às 20h?" },
        { authorType: "ia" as const, content: "Tenho sim! Reservei a mesa para 8 no sábado às 20h em nome de Caio. Quer anotar alguma observação?" },
        { authorType: "cli" as const, content: "Vou levar um bolo de aniversário, pode? Queria falar com alguém de verdade." },
        { authorType: "ia" as const, content: "Claro! Vou chamar alguém da equipe para combinar o bolo com você 🎂" },
        { authorType: "sys" as const, content: "Zumi passou para a equipe · Cliente pediu uma pessoa" },
        { authorType: "sys" as const, content: "Ana (equipe) assumiu a conversa" },
        { authorType: "hum" as const, authorName: "Ana (equipe)", content: "Oi Caio, aqui é a Ana! Pode trazer o bolo sim, sem nenhuma taxa. A gente guarda na geladeira e canta parabéns junto 🎉" },
        { authorType: "cli" as const, content: "Perfeito, obrigado Ana!" }
      ]
    },
    {
      id: "demo-marina",
      customerName: "Marina Silva",
      customerPhone: "(65) 99812-4410",
      neighborhood: "Jardim Europa",
      segment: "Fiel",
      status: "resolvida" as const,
      resolvedBy: "IA",
      handoffsCount: 0,
      returnsCount: 0,
      cart: [
        { nome: "Combo 26 Peças", preco: 69.9, cat: "Combinados", q: 1 },
        { nome: "Refrigerante Lata", preco: 5, cat: "Bebidas", q: 2 }
      ],
      saleAmount: "79.90",
      intent: "Pedido",
      tags: ["gosta de hot"],
      messages: [
        { authorType: "cli" as const, content: "Oi! Quero um combo pra hoje e 2 cocas geladas." },
        { authorType: "ia" as const, content: "Oi, Marina! Separei o Combo 26 Peças e 2 refrigerantes lata. Te mando o link do Pix para confirmar?" },
        { authorType: "cli" as const, content: "Pode mandar!" },
        { authorType: "ia" as const, content: "Prontinho! Link do Pix enviado e a cozinha já começou o preparo. Chega em cerca de 45 a 50 min 🍣" },
        { authorType: "sys" as const, content: "Pedido enviado à cozinha · R$ 79,90" },
        { authorType: "sys" as const, content: "Conversa resolvida pelo Zumi (IA)" }
      ]
    },
    {
      id: "demo-bia",
      customerName: "Bia Ferreira",
      customerPhone: "(65) 99477-1205",
      neighborhood: "Jardim Tarumã",
      segment: "Nova",
      status: "ia" as const,
      handoffsCount: 0,
      returnsCount: 0,
      cart: [
        { nome: "Hot Filadélfia (12un)", preco: 31.9, cat: "Hot rolls", q: 1 },
        { nome: "Hot Nutella (8 un)", preco: 29.9, cat: "Sobremesas", q: 1 }
      ],
      intent: "Pedido",
      tags: ["não come cru"],
      messages: [
        { authorType: "cli" as const, content: "Quero algo gostoso mas sem peixe cru pra duas pessoas." },
        { authorType: "ia" as const, content: "Sem cru, deixa comigo! O Hot Filadélfia (12un) é quentinho e crocante. Quer juntar uma sobremesa ou um prato quente?" },
        { authorType: "cli" as const, content: "Só o hot e uma sobremesa boa de chocolate." },
        { authorType: "ia" as const, content: "Feito! Coloquei o Hot Filadélfia + Hot Nutella no carrinho (R$ 61,80). Quer que eu já feche o pedido?" }
      ]
    },
    {
      id: "demo-jorge",
      customerName: "Jorge Alencar",
      customerPhone: "(65) 99560-2290",
      neighborhood: "Jardim Europa",
      segment: "Lead",
      status: "fila" as const,
      handoffReason: "Evento ou grupo grande",
      reasons: ["Evento ou grupo grande"],
      handoffsCount: 1,
      returnsCount: 0,
      cart: [],
      queuedAt: new Date(Date.now() - 2 * 60000),
      intent: "Evento",
      tags: ["empresa"],
      messages: [
        { authorType: "cli" as const, content: "Vocês fazem rodízio para confraternização de empresa? Umas 40 pessoas." },
        { authorType: "ia" as const, content: "Que legal! Para evento eu chamo alguém da equipe para montar uma proposta certinha. Já já te respondem 🙌" },
        { authorType: "sys" as const, content: "Zumi passou para a equipe · Evento ou grupo grande" }
      ]
    }
  ];

  for (const c of convSeeds) {
    const { messages: msgs, ...convData } = c;
    await db.insert(conversations).values(convData);
    for (const m of msgs) {
      await db.insert(conversationMessages).values({
        conversationId: c.id,
        authorType: m.authorType,
        authorName: (m as any).authorName || null,
        content: m.content,
      });
    }
  }

  // 5. Pedidos de Hoje (PDV, KDS, Fiscal)
  console.log("[Seed] Seeding sample orders...");
  await db.delete(orderItems);
  await db.delete(orders);

  let nfcCounter = 4820;
  const sampleOrders = [
    {
      orderNumber: 310,
      channel: "WhatsApp",
      customerName: "Marina Silva",
      customerPhone: "(65) 99812-4410",
      neighborhood: "Jardim Europa",
      status: "rota" as const,
      paymentMethod: "Pix",
      subtotal: "79.90",
      deliveryFee: "0.00",
      discount: "0.00",
      total: "79.90",
      cmv: "25.56",
      nfcNumber: ++nfcCounter,
      hasCpf: true,
      cpf: "847.129.301-44",
      riderName: "Marcos (em rota)",
      items: [
        { itemName: "Combo 26 Peças", category: "Combinados", quantity: 1, unitPrice: "69.90", unitCost: "22.36", totalPrice: "69.90" },
        { itemName: "Refrigerante Lata", category: "Bebidas", quantity: 2, unitPrice: "5.00", unitCost: "2.90", totalPrice: "10.00" }
      ]
    },
    {
      orderNumber: 311,
      channel: "Mesa",
      reference: "Mesa 4",
      customerName: "Bruno Martins",
      customerPhone: "(65) 99341-9922",
      neighborhood: "Centro",
      status: "pronto" as const,
      paymentMethod: "Crédito",
      subtotal: "148.80",
      deliveryFee: "0.00",
      discount: "0.00",
      total: "148.80",
      cmv: "47.60",
      nfcNumber: ++nfcCounter,
      hasCpf: false,
      items: [
        { itemName: "Especial da Casa 40 Peças", category: "Combinados", quantity: 1, unitPrice: "98.90", unitCost: "31.60", totalPrice: "98.90" },
        { itemName: "Hot Nutella (8 un)", category: "Sobremesas", quantity: 1, unitPrice: "29.90", unitCost: "8.00", totalPrice: "29.90" },
        { itemName: "Sucos Naturais", category: "Bebidas", quantity: 2, unitPrice: "14.00", unitCost: "4.00", totalPrice: "28.00" }
      ]
    },
    {
      orderNumber: 312,
      channel: "Loja",
      customerName: "Lara Mendes",
      neighborhood: "Jardim Paraíso",
      status: "preparo" as const,
      paymentMethod: "Pix",
      subtotal: "85.80",
      deliveryFee: "0.00",
      discount: "0.00",
      total: "85.80",
      cmv: "27.45",
      nfcNumber: ++nfcCounter,
      hasCpf: true,
      items: [
        { itemName: "Poke de Salmão", category: "Poke", quantity: 1, unitPrice: "41.90", unitCost: "13.40", totalPrice: "41.90" },
        { itemName: "Hot Filadélfia (12un)", category: "Hot rolls", quantity: 1, unitPrice: "31.90", unitCost: "10.20", totalPrice: "31.90" },
        { itemName: "Sucos de Polpa", category: "Bebidas", quantity: 1, unitPrice: "14.00", unitCost: "3.80", totalPrice: "14.00" }
      ]
    },
    {
      orderNumber: 313,
      channel: "PDV",
      reference: "Balcão",
      customerName: "Rodrigo Gonçalves",
      neighborhood: "Centro",
      status: "novo" as const,
      paymentMethod: "Débito",
      subtotal: "63.80",
      deliveryFee: "0.00",
      discount: "0.00",
      total: "63.80",
      cmv: "20.40",
      nfcNumber: ++nfcCounter,
      hasCpf: true,
      cpf: "019.284.771-00",
      items: [
        { itemName: "Hot Filadélfia (12un)", category: "Hot rolls", quantity: 2, unitPrice: "31.90", unitCost: "10.20", totalPrice: "63.80" }
      ]
    }
  ];

  for (const o of sampleOrders) {
    const { items, ...orderData } = o;
    const [inserted] = await db.insert(orders).values(orderData).$returningId();
    for (const it of items) {
      await db.insert(orderItems).values({
        orderId: inserted.id,
        ...it,
      });
    }
  }

  // 6. Reservas
  console.log("[Seed] Seeding reservations...");
  await db.delete(reservations);
  const sampleReservations = [
    { timeText: "19:00", customerName: "Caio Toledo", customerPhone: "(65) 99234-7781", partySize: 8, origin: "WhatsApp", tags: ["aniversário", "VIP"], status: "confirmada" as const },
    { timeText: "19:30", customerName: "Ana Paula", customerPhone: "(65) 99811-2299", partySize: 2, origin: "Instagram", tags: ["ama salmão"], status: "confirmada" as const },
    { timeText: "19:30", customerName: "Família Souza", customerPhone: "(65) 99655-1100", partySize: 5, origin: "Google", tags: ["com crianças"], status: "aguardando" as const },
    { timeText: "20:00", customerName: "Bruno Martins", customerPhone: "(65) 99341-9922", partySize: 4, origin: "WhatsApp", tags: ["VIP", "alto gasto"], status: "confirmada" as const },
    { timeText: "20:00", customerName: "Iris Carvalho", customerPhone: "(65) 99182-7711", partySize: 2, origin: "WhatsApp", tags: ["voltou na onda 1"], status: "confirmada" as const },
    { timeText: "20:30", customerName: "Empresa Agro MT", customerPhone: "(65) 99990-1234", partySize: 12, origin: "WhatsApp", tags: ["grupo", "nota fiscal CNPJ"], status: "confirmada" as const },
    { timeText: "21:00", customerName: "Lucas Ribeiro", customerPhone: "(65) 99401-8899", partySize: 3, origin: "Instagram", tags: [], status: "aguardando" as const },
    { timeText: "21:00", customerName: "Malu Queiroz", customerPhone: "(65) 99200-3344", partySize: 2, origin: "Google", tags: ["sem glúten"], status: "confirmada" as const },
    // Fila de espera
    { timeText: "19:40", customerName: "Diego Ramos", customerPhone: "(65) 99611-7729", partySize: 2, origin: "Fila", tags: ["fila"], status: "aguardando" as const, isWaitlist: true, waitMinutes: 12 },
    { timeText: "19:45", customerName: "Sara Vieira", customerPhone: "(65) 99788-5544", partySize: 4, origin: "Fila", tags: ["fila"], status: "aguardando" as const, isWaitlist: true, waitMinutes: 7 },
    { timeText: "19:50", customerName: "Tiago Nogueira", customerPhone: "(65) 99122-4433", partySize: 3, origin: "Fila", tags: ["fila"], status: "aguardando" as const, isWaitlist: true, waitMinutes: 2 }
  ];
  for (const r of sampleReservations) {
    await db.insert(reservations).values(r);
  }

  // 7. Avaliações (Google e iFood)
  console.log("[Seed] Seeding reviews...");
  await db.delete(reviews);
  const sampleReviews = [
    { platform: "Google", rating: 5, comment: "Melhor hot roll de Tangará! Chegou quentinho, crocante e muito bem embalado. Atendimento pelo Whats foi rápido demais.", authorName: "Camila V.", dateText: "há 2 dias", aiReply: "Que alegria ler isso, Camila! O Zumi já avisou a cozinha que o hot roll fez sucesso 🐟 Te esperamos de novo!", isReplied: true },
    { platform: "iFood", rating: 2, comment: "Demorou quase 1h30 pra chegar, o sushi estava bom mas a espera foi muito grande numa terça-feira.", authorName: "Marcos T.", dateText: "há 3 dias", aiReply: null, isReplied: false },
    { platform: "Google", rating: 4, comment: "Combo 26 peças vale muito a pena, peixe super fresco. Só achei o shoyu pouco para a quantidade.", authorName: "Renan S.", dateText: "há 5 dias", aiReply: "Valeu pelo feedback Renan! Na próxima avisa o Zumi que mandamos sachês extras caprichados! 🥢", isReplied: true },
    { platform: "iFood", rating: 1, comment: "Pedi pra tirar o cream cheese e me disseram que não fazem alterações no cardápio. Falta de flexibilidade.", authorName: "Juliana M.", dateText: "há 6 dias", aiReply: null, isReplied: false },
    { platform: "Google", rating: 5, comment: "Ambiente do salão é lindo e o Especial do Cheff é uma verdadeira obra de arte. Voltaremos com certeza!", authorName: "Dr. Marcelo A.", dateText: "há 1 semana", aiReply: "Muito obrigado Dr. Marcelo! Será uma honra receber vocês novamente na casa do Zuma 🍣", isReplied: true },
    { platform: "iFood", rating: 3, comment: "Comida excelente, mas a taxa de entrega para o Jardim Tarumã ficou um pouco salgada.", authorName: "Priscila D.", dateText: "há 1 semana", aiReply: null, isReplied: false }
  ];
  for (const rv of sampleReviews) {
    await db.insert(reviews).values(rv);
  }

  // 8. Leads (Quiz)
  console.log("[Seed] Seeding leads...");
  await db.delete(leads);
  const sampleLeads = [
    { name: "Marina", phone: "(65) 99812-4410", profile: "Ninja do Hot", origin: "Instagram", prize: "Refri grátis", optIn: true },
    { name: "Paulo", phone: "(65) 99655-0912", profile: "Mestre do Salmão", origin: "QR na embalagem", prize: "Frete grátis", optIn: true },
    { name: "Lívia", phone: "(65) 99901-3378", profile: "Leve e Fit", origin: "Academia parceira", prize: "R$ 15 de desconto", optIn: true }
  ];
  for (const l of sampleLeads) {
    await db.insert(leads).values(l);
  }

  console.log("[Seed] Database population finished successfully!");
  await connection.end();
}

seed().catch(err => {
  console.error("[Seed] Error seeding database:", err);
  process.exit(1);
});
