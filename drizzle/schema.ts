import { boolean, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários para autenticação
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de clientes (CRM)
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  neighborhood: varchar("neighborhood", { length: 255 }).default("Centro"),
  segment: mysqlEnum("segment", ["fiel", "novo", "sumido", "vip", "regular", "lead"]).default("novo").notNull(),
  ordersCount: int("ordersCount").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  daysSinceLastOrder: int("daysSinceLastOrder").default(0).notNull(),
  favoriteDish: varchar("favoriteDish", { length: 255 }).default("Combo 26 Peças"),
  optIn: boolean("optIn").default(true).notNull(),
  tags: json("tags").$type<string[]>(),
  recoveryWave: int("recoveryWave").default(0),
  recoveryStatus: varchar("recoveryStatus", { length: 32 }), // 'voltou', 'nao_respondeu', 'aguardando'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Tabela de pedidos (Vendas, PDV, Loja, WhatsApp, KDS)
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: int("orderNumber").notNull().unique(),
  channel: varchar("channel", { length: 64 }).default("PDV").notNull(), // 'PDV', 'WhatsApp', 'Loja', 'Mesa', 'Balcão', 'Delivery', 'Retirada', 'iFood'
  reference: varchar("reference", { length: 255 }), // 'Mesa 7', 'Cliente Rodrigo'
  customerName: varchar("customerName", { length: 255 }).default("Cliente Balcão"),
  customerPhone: varchar("customerPhone", { length: 32 }),
  neighborhood: varchar("neighborhood", { length: 255 }).default("Centro"),
  status: mysqlEnum("status", ["novo", "preparo", "pronto", "rota", "entregue", "cancelado"]).default("novo").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).default("Pix").notNull(), // 'Pix', 'Crédito', 'Débito', 'Dinheiro', 'Vale'
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  cmv: decimal("cmv", { precision: 10, scale: 2 }).default("0.00").notNull(),
  nfcNumber: int("nfcNumber"),
  nfcStatus: varchar("nfcStatus", { length: 32 }).default("autorizada"),
  hasCpf: boolean("hasCpf").default(false).notNull(),
  cpf: varchar("cpf", { length: 20 }),
  riderName: varchar("riderName", { length: 128 }),
  estimatedMinutes: int("estimatedMinutes").default(45),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Itens dos pedidos
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Insumos do Estoque
 */
export const stockItems = mysqlTable("stock_items", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(), // 'kg', 'folhas', 'L', 'un'
  currentStock: decimal("currentStock", { precision: 10, scale: 2 }).notNull(),
  minStock: decimal("minStock", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }).default("Pescados MT"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockItem = typeof stockItems.$inferSelect;
export type InsertStockItem = typeof stockItems.$inferInsert;

/**
 * Conversas do WhatsApp (Central com IA Zumi)
 */
export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 128 }).primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 255 }).default("Centro"),
  segment: varchar("segment", { length: 64 }).default("Lead"),
  status: mysqlEnum("status", ["ia", "fila", "humano", "resolvida"]).default("ia").notNull(),
  assignedAgent: varchar("assignedAgent", { length: 128 }),
  handoffReason: varchar("handoffReason", { length: 255 }),
  reasons: json("reasons").$type<string[]>(),
  handoffsCount: int("handoffsCount").default(0).notNull(),
  returnsCount: int("returnsCount").default(0).notNull(),
  cart: json("cart").$type<Array<{ nome: string; preco: number; cat: string; q: number }>>(),
  queuedAt: timestamp("queuedAt"),
  resolvedBy: varchar("resolvedBy", { length: 64 }),
  intent: varchar("intent", { length: 128 }).default("Dúvida sobre o cardápio"),
  tags: json("tags").$type<string[]>(),
  saleAmount: decimal("saleAmount", { precision: 10, scale: 2 }).default("0.00"),
  firstResponseSeconds: int("firstResponseSeconds").default(3),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Mensagens das conversas de WhatsApp
 */
export const conversationMessages = mysqlTable("conversation_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("conversationId", { length: 128 }).notNull(),
  authorType: mysqlEnum("authorType", ["cli", "ia", "hum", "sys"]).notNull(),
  authorName: varchar("authorName", { length: 128 }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = typeof conversationMessages.$inferInsert;

/**
 * Base de Conhecimento (Aprendizado contínuo do Zumi)
 */
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: varchar("id", { length: 128 }).primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "descartado"]).default("pendente").notNull(),
  origin: varchar("origin", { length: 128 }).default("Cadastro manual"), // 'Cadastro manual', 'Resposta da equipe', 'IA não soube'
  conversationId: varchar("conversationId", { length: 128 }),
  usesCount: int("usesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

/**
 * Reservas de Mesa e Fila de Espera
 */
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  timeText: varchar("timeText", { length: 16 }).notNull(), // '19:30'
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }),
  partySize: int("partySize").notNull(),
  origin: varchar("origin", { length: 64 }).default("WhatsApp"), // 'WhatsApp', 'Instagram', 'Google', 'Fila'
  tags: json("tags").$type<string[]>(),
  status: mysqlEnum("status", ["confirmada", "aguardando", "cancelada", "atendida"]).default("aguardando").notNull(),
  isWaitlist: boolean("isWaitlist").default(false).notNull(),
  waitMinutes: int("waitMinutes").default(0),
  reservationDate: varchar("reservationDate", { length: 32 }).default("hoje"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

/**
 * Avaliações (Google e iFood)
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 32 }).notNull(), // 'Google', 'iFood'
  rating: int("rating").notNull(), // 1 a 5
  comment: text("comment").notNull(),
  authorName: varchar("authorName", { length: 128 }).default("Cliente"),
  dateText: varchar("dateText", { length: 64 }).notNull(), // 'há 2 dias'
  aiReply: text("aiReply"),
  isReplied: boolean("isReplied").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Campanhas de WhatsApp
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  segment: varchar("segment", { length: 64 }).notNull(),
  goal: varchar("goal", { length: 255 }).notNull(),
  dish: varchar("dish", { length: 255 }).notNull(),
  offer: varchar("offer", { length: 255 }).notNull(),
  message: text("message").notNull(),
  recipientsCount: int("recipientsCount").default(0).notNull(),
  expectedOrders: int("expectedOrders").default(0).notNull(),
  expectedRevenue: decimal("expectedRevenue", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["rascunho", "agendada", "enviada"]).default("agendada").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Leads do Quiz e Raspadinha
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  profile: varchar("profile", { length: 128 }).notNull(), // 'Ninja do Hot', 'Mestre do Salmão', etc.
  origin: varchar("origin", { length: 128 }).default("Quiz"),
  prize: varchar("prize", { length: 128 }).notNull(),
  optIn: boolean("optIn").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
