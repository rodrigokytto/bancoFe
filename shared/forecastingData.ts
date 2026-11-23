// ==============================================================================
// MOTOR PREDITIVO DE COMPRAS, FICHAS TÉCNICAS (BOM) E GESTÃO DE FORNECEDORES
// ZUMA PILOT - Tangará da Serra (MT) · CNPJ: 36.296.848/0001-57
// ==============================================================================

export interface SupplierItem {
  id: string;
  name: string;
  cnpj: string;
  category: string;
  city: string;
  phone: string;
  whatsapp: string;
  contactName: string;
  leadTimeHours: number;
  deliveryDays: string[];
  minOrderValue: number;
  paymentTerms: string;
  pixKey: string;
  rating: number;
  reliabilityPct: number;
  notes: string;
}

export interface RawMaterialItem {
  code: string;
  name: string;
  category: "Pescados Nobres" | "Carnes Nobres" | "Secos & Grãos" | "Laticínios" | "Hortifrúti" | "Embalagens" | "Bebidas" | "Molhos & Condimentos";
  purchaseUnit: string; // Ex: kg, caixa 10kg, fardo 1000un, galão 5L, balde 3.6kg
  recipeUnit: string;   // Ex: kg, g, ml, folhas, un, pares
  conversionFactor: number; // Quantas recipeUnits cabem em 1 purchaseUnit (ex: 1 kg = 1 kg; 1 fardo = 1000 folhas)
  yieldPercent: number; // Rendimento líquido após limpeza e manipulação (Ex: Salmão inteiro = 58% filé limpo; Arroz = 220% cozido)
  lossPercent: number;  // Fator de perda/aparas (Ex: salmão 42% perdas/aparas, 12% aproveitadas em hot roll/tartar)
  currentStock: number; // Saldo em estoque na unidade de compra (ou receita)
  minStock: number;     // Estoque de segurança mínimo (ponto de pedido)
  unitCost: number;     // Custo unitário em R$ por purchaseUnit
  idealLot: number;     // Lote econômico de compra sugerido
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  storageType: "Câmara Fria (-18°C a -22°C)" | "Câmara de Resfriados (0°C a 2°C)" | "Estoque Seco Climatizado" | "Balcão Bar" | "Depósito de Embalagens";
  shelfLifeDays: number; // Validade após aberto/chegada
}

export interface RecipeIngredient {
  rawMaterialCode: string;
  name: string;
  quantityRecipeUnit: number; // Quantidade usada na receita (em recipeUnit)
  recipeUnit: string;
  prepYieldPercent: number;   // Rendimento do insumo neste prato
  costShareBrl: number;       // Custo proporcional deste ingrediente
}

export interface TechnicalSheetItem {
  id: string;
  dishName: string;
  category: string;
  station: "Sushibar (Frio)" | "Cozinha Quente" | "Bar / Copa";
  salePrice: number;
  ingredients: RecipeIngredient[];
  theoreticalCost: number;    // Custo total teórico dos insumos (BOM)
  cmvPercent: number;         // CMV Teórico %
  grossMarginBrl: number;     // Margem de Contribuição em R$
  grossMarginPercent: number; // Margem %
  prepTimeMinutes: number;
  servings: number;           // Rendimento em porções
  chefNotes: string;
}

export interface PurchaseOrderItem {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  createdAt: string;
  expectedDeliveryDate: string;
  deliveredAt?: string;
  status: "cotacao" | "enviado" | "em_transito" | "recebido" | "cancelado";
  items: Array<{
    rawMaterialCode: string;
    rawMaterialName: string;
    quantity: number;
    purchaseUnit: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
  subtotal: number;
  discount: number;
  freightCost: number;
  totalAmount: number;
  paymentMethod: "Boleto 14 dias" | "Boleto 21 dias" | "Pix Faturado" | "Boleto 28 dias" | "Transferência";
  dueDate: string;
  integratedFinancial: boolean;
  receivedStockUpdated: boolean;
  notes: string;
}

// ==============================================================================
// FORNECEDORES HOMOLOGADOS DO ZUMA (CUIABÁ E TANGARÁ DA SERRA)
// ==============================================================================
export const ZUMA_SUPPLIERS: SupplierItem[] = [
  {
    id: "sup_pantanal",
    name: "Pantanal Pescados Nobres Cuiabá",
    cnpj: "08.412.781/0001-32",
    category: "Pescados & Frutos do Mar",
    city: "Cuiabá (MT) - Logística Refrigerada",
    phone: "(65) 3624-9910",
    whatsapp: "(65) 99841-3320",
    contactName: "Rogério Mendes (Gerente Comercial)",
    leadTimeHours: 36,
    deliveryDays: ["Terça-feira (Manhã)", "Sexta-feira (Manhã)"],
    minOrderValue: 2500.0,
    paymentTerms: "Boleto 14/28 dias ou Pix Antecipado 3% desc",
    pixKey: "08412781000132",
    rating: 4.9,
    reliabilityPct: 98.5,
    notes: "Caminhão refrigerado monitorado via GPS (0°C a 2°C). Pescado chileno classe Premium Salar com SIF federal."
  },
  {
    id: "sup_oriental_br",
    name: "Distribuidora Oriental Brasil & Cia",
    cnpj: "14.882.109/0002-88",
    category: "Secos, Grãos, Molhos & Algas",
    city: "Cuiabá (MT) / Distribuição Central",
    phone: "(65) 3321-4450",
    whatsapp: "(65) 99612-8899",
    contactName: "Kenji Takahashi",
    leadTimeHours: 48,
    deliveryDays: ["Segunda-feira", "Quinta-feira"],
    minOrderValue: 1200.0,
    paymentTerms: "Boleto 21 dias",
    pixKey: "financeiro@orientalbrasil.com.br",
    rating: 4.8,
    reliabilityPct: 97.2,
    notes: "Importador direto de arroz japonês Uruchimai, Noris Gold 50 folhas e shoyus de fermentação natural de alta pureza."
  },
  {
    id: "sup_atacadao_tga",
    name: "Atacadão Alimentos Tangará",
    cnpj: "75.315.333/0084-12",
    category: "Laticínios, Óleos & Mercearia",
    city: "Tangará da Serra (MT) - Local",
    phone: "(65) 3311-8200",
    whatsapp: "(65) 99933-7711",
    contactName: "Cláudio Vendas Corporativas",
    leadTimeHours: 12,
    deliveryDays: ["Segunda a Sábado (Entrega no mesmo dia)"],
    minOrderValue: 500.0,
    paymentTerms: "Faturado 15 dias ou Cartão Corporativo",
    pixKey: "financeiro@atacadaotga.com.br",
    rating: 4.6,
    reliabilityPct: 95.0,
    notes: "Fornecedor de apoio rápido em Tangará para Cream Cheese, Óleo vegetal de alta resistência e itens de alta rotatividade."
  },
  {
    id: "sup_embalagens_co",
    name: "Embalagens Centro-Oeste Tangará",
    cnpj: "23.901.442/0001-90",
    category: "Embalagens Térmicas & Descartáveis",
    city: "Tangará da Serra (MT) - Local",
    phone: "(65) 3326-1180",
    whatsapp: "(65) 99877-4400",
    contactName: "Silvana Embalagens",
    leadTimeHours: 24,
    deliveryDays: ["Segunda a Sexta"],
    minOrderValue: 400.0,
    paymentTerms: "Boleto 30 dias",
    pixKey: "23901442000190",
    rating: 4.9,
    reliabilityPct: 99.0,
    notes: "Embalagens personalizadas Zuma com laminação interna anti-vazamento, berços para temaki e sacolas kraft reforçadas."
  },
  {
    id: "sup_horta_mun",
    name: "Cooperativa Hortifrúti Tangará Verde",
    cnpj: "18.332.901/0001-44",
    category: "Hortifrúti Fresco",
    city: "Tangará da Serra (MT) - Produtores Locais",
    phone: "(65) 3326-9050",
    whatsapp: "(65) 99912-3004",
    contactName: "Seu Donizete (Coop Agro)",
    leadTimeHours: 18,
    deliveryDays: ["Terça-feira", "Quinta-feira", "Sábado"],
    minOrderValue: 200.0,
    paymentTerms: "Semanal via Pix",
    pixKey: "hortitangara@pix.coop.br",
    rating: 4.9,
    reliabilityPct: 98.0,
    notes: "Pepino japonês hidropônico extra crocante, abacate avocado selecionado para sushi e maços frescos de cebolinha."
  }
];

// ==============================================================================
// CATÁLOGO DE INSUMOS CRÍTICOS & PERECÍVEIS (BOM - RAW MATERIALS)
// ==============================================================================
export const ZUMA_RAW_MATERIALS: RawMaterialItem[] = [
  {
    code: "SALM-01",
    name: "Salmão Salar Fresco Chileno Nobre (Peça Inteira Eviscerada)",
    category: "Pescados Nobres",
    purchaseUnit: "kg (peças de ~6kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 58.0,
    lossPercent: 42.0,
    currentStock: 38.5,
    minStock: 45.0,
    unitCost: 68.50,
    idealLot: 180.0,
    supplierId: "sup_pantanal",
    supplierName: "Pantanal Pescados Nobres Cuiabá",
    leadTimeDays: 2,
    storageType: "Câmara de Resfriados (0°C a 2°C)",
    shelfLifeDays: 5
  },
  {
    code: "ATUM-01",
    name: "Atum Vermelho Fresco (Lombo Nobre Maguro)",
    category: "Pescados Nobres",
    purchaseUnit: "kg (lombos de 2kg a 4kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 88.0,
    lossPercent: 12.0,
    currentStock: 8.2,
    minStock: 10.0,
    unitCost: 79.00,
    idealLot: 25.0,
    supplierId: "sup_pantanal",
    supplierName: "Pantanal Pescados Nobres Cuiabá",
    leadTimeDays: 2,
    storageType: "Câmara Fria (-18°C a -22°C)",
    shelfLifeDays: 30
  },
  {
    code: "CAM-01",
    name: "Camarão Cinza Limpo e Eviscerado 40/50 Congelado",
    category: "Pescados Nobres",
    purchaseUnit: "kg (pacotes de 2kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 92.0,
    lossPercent: 8.0,
    currentStock: 9.5,
    minStock: 12.0,
    unitCost: 86.00,
    idealLot: 30.0,
    supplierId: "sup_pantanal",
    supplierName: "Pantanal Pescados Nobres Cuiabá",
    leadTimeDays: 2,
    storageType: "Câmara Fria (-18°C a -22°C)",
    shelfLifeDays: 60
  },
  {
    code: "POLV-01",
    name: "Tentáculos de Polvo Cozido Especial",
    category: "Pescados Nobres",
    purchaseUnit: "kg (peças congeladas)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 95.0,
    lossPercent: 5.0,
    currentStock: 4.0,
    minStock: 5.0,
    unitCost: 110.00,
    idealLot: 10.0,
    supplierId: "sup_pantanal",
    supplierName: "Pantanal Pescados Nobres Cuiabá",
    leadTimeDays: 2,
    storageType: "Câmara Fria (-18°C a -22°C)",
    shelfLifeDays: 60
  },
  {
    code: "ARR-01",
    name: "Arroz Japonês Especial Grão Curto Uruchimai (Saco 25kg)",
    category: "Secos & Grãos",
    purchaseUnit: "sacos de 25kg",
    recipeUnit: "kg",
    conversionFactor: 25.0,
    yieldPercent: 220.0,
    lossPercent: 0.0,
    currentStock: 65.0,
    minStock: 60.0,
    unitCost: 9.80,
    idealLot: 125.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 180
  },
  {
    code: "NORI-01",
    name: "Alga Nori Premium Gold para Sushi (Fardo 500 Folhas)",
    category: "Secos & Grãos",
    purchaseUnit: "fardos com 500 folhas",
    recipeUnit: "folhas",
    conversionFactor: 500.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 450.0,
    minStock: 500.0,
    unitCost: 0.55,
    idealLot: 2500.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 365
  },
  {
    code: "CRM-01",
    name: "Cream Cheese Philadelphia Profissional (Balde 3.6kg)",
    category: "Laticínios",
    purchaseUnit: "baldes de 3.6kg",
    recipeUnit: "kg",
    conversionFactor: 3.6,
    yieldPercent: 98.0,
    lossPercent: 2.0,
    currentStock: 12.0,
    minStock: 15.0,
    unitCost: 33.50,
    idealLot: 36.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Câmara de Resfriados (0°C a 2°C)",
    shelfLifeDays: 45
  },
  {
    code: "SHOY-01",
    name: "Shoyu Fermentação Natural Tradicional (Bombona 20L)",
    category: "Molhos & Condimentos",
    purchaseUnit: "bombonas de 20L",
    recipeUnit: "L",
    conversionFactor: 20.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 35.0,
    minStock: 40.0,
    unitCost: 12.00,
    idealLot: 60.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 365
  },
  {
    code: "OLEO-01",
    name: "Óleo de Fritura Alta Resistência Térmica (Caixa com 4x5L)",
    category: "Secos & Grãos",
    purchaseUnit: "caixas de 20L (4x5L)",
    recipeUnit: "L",
    conversionFactor: 20.0,
    yieldPercent: 95.0,
    lossPercent: 5.0,
    currentStock: 25.0,
    minStock: 30.0,
    unitCost: 8.90,
    idealLot: 40.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 180
  },
  {
    code: "PANK-01",
    name: "Farinha Panko Japonesa Flocada Extra Crocante (Saco 10kg)",
    category: "Secos & Grãos",
    purchaseUnit: "sacos de 10kg",
    recipeUnit: "kg",
    conversionFactor: 10.0,
    yieldPercent: 95.0,
    lossPercent: 5.0,
    currentStock: 14.0,
    minStock: 15.0,
    unitCost: 19.50,
    idealLot: 30.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 180
  },
  {
    code: "GERG-01",
    name: "Gergelim Tostado Misto Branco e Preto (Pacote 1kg)",
    category: "Secos & Grãos",
    purchaseUnit: "pacotes de 1kg",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 6.0,
    minStock: 6.0,
    unitCost: 28.00,
    idealLot: 10.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 180
  },
  {
    code: "HORT-PEP",
    name: "Pepino Japonês Hidropônico Fresco para Sunomono",
    category: "Hortifrúti",
    purchaseUnit: "kg (caixas de 10kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 85.0,
    lossPercent: 15.0,
    currentStock: 12.0,
    minStock: 15.0,
    unitCost: 7.50,
    idealLot: 25.0,
    supplierId: "sup_horta_mun",
    supplierName: "Cooperativa Hortifrúti Tangará Verde",
    leadTimeDays: 1,
    storageType: "Câmara de Resfriados (0°C a 2°C)",
    shelfLifeDays: 6
  },
  {
    code: "HORT-AVO",
    name: "Avocado Hass Selecionado para Sushi",
    category: "Hortifrúti",
    purchaseUnit: "kg (caixas de 8kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 72.0,
    lossPercent: 28.0,
    currentStock: 8.0,
    minStock: 10.0,
    unitCost: 14.00,
    idealLot: 20.0,
    supplierId: "sup_horta_mun",
    supplierName: "Cooperativa Hortifrúti Tangará Verde",
    leadTimeDays: 1,
    storageType: "Câmara de Resfriados (0°C a 2°C)",
    shelfLifeDays: 5
  },
  {
    code: "SHIM-01",
    name: "Cogumelo Shimeji Preto Fresco (Bandeja 200g / Caixa 2kg)",
    category: "Hortifrúti",
    purchaseUnit: "kg (caixas com 10 bandejas de 200g)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 95.0,
    lossPercent: 5.0,
    currentStock: 4.5,
    minStock: 6.0,
    unitCost: 32.00,
    idealLot: 10.0,
    supplierId: "sup_horta_mun",
    supplierName: "Cooperativa Hortifrúti Tangará Verde",
    leadTimeDays: 1,
    storageType: "Câmara de Resfriados (0°C a 2°C)",
    shelfLifeDays: 7
  },
  {
    code: "MIGN-01",
    name: "Filé Mignon Bovino Nobre Limpo (Peça ~2kg)",
    category: "Carnes Nobres",
    purchaseUnit: "kg (peças a vácuo)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 90.0,
    lossPercent: 10.0,
    currentStock: 14.0,
    minStock: 16.0,
    unitCost: 58.00,
    idealLot: 25.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Câmara Fria (-18°C a -22°C)",
    shelfLifeDays: 45
  },
  {
    code: "FRAN-01",
    name: "Peito de Frango em Cubos Limpo e Congelado (Pacote 2kg)",
    category: "Carnes Nobres",
    purchaseUnit: "kg (pacotes de 2kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 98.0,
    lossPercent: 2.0,
    currentStock: 18.0,
    minStock: 20.0,
    unitCost: 18.50,
    idealLot: 30.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Câmara Fria (-18°C a -22°C)",
    shelfLifeDays: 60
  },
  {
    code: "MASS-01",
    name: "Macarrão Tradicional para Yakissoba (Fardo 10x500g)",
    category: "Secos & Grãos",
    purchaseUnit: "kg (fardos de 5kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 180.0,
    lossPercent: 0.0,
    currentStock: 15.0,
    minStock: 18.0,
    unitCost: 12.50,
    idealLot: 30.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 180
  },
  {
    code: "LAM-01",
    name: "Massa Fresca Especial para Lamen Tradicional",
    category: "Secos & Grãos",
    purchaseUnit: "kg (pacotes com porções de 200g)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 150.0,
    lossPercent: 0.0,
    currentStock: 8.0,
    minStock: 10.0,
    unitCost: 16.00,
    idealLot: 20.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Câmara de Resfriados (0°C a 2°C)",
    shelfLifeDays: 30
  },
  {
    code: "VIN-01",
    name: "Vinagre de Arroz Suave para Sushimeshi (Galão 5L)",
    category: "Molhos & Condimentos",
    purchaseUnit: "galões de 5L",
    recipeUnit: "L",
    conversionFactor: 5.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 18.0,
    minStock: 15.0,
    unitCost: 14.50,
    idealLot: 25.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 365
  },
  {
    code: "WAS-01",
    name: "Wasabi em Pasta Japonês Autêntico (Bisnaga 1kg)",
    category: "Molhos & Condimentos",
    purchaseUnit: "kg (bisnagas de 1kg)",
    recipeUnit: "kg",
    conversionFactor: 1.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 3.5,
    minStock: 4.0,
    unitCost: 45.00,
    idealLot: 8.0,
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    leadTimeDays: 3,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 365
  },
  {
    code: "EMB-COMB",
    name: "Caixa Combinado Luxo Térmica Zuma com Visor (Fardo 100un)",
    category: "Embalagens",
    purchaseUnit: "fardos com 100un",
    recipeUnit: "un",
    conversionFactor: 100.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 320.0,
    minStock: 450.0,
    unitCost: 1.95,
    idealLot: 800.0,
    supplierId: "sup_embalagens_co",
    supplierName: "Embalagens Centro-Oeste Tangará",
    leadTimeDays: 1,
    storageType: "Depósito de Embalagens",
    shelfLifeDays: 365
  },
  {
    code: "EMB-TEM",
    name: "Embalagem Térmica Triangular Berço para Temaki (Fardo 250un)",
    category: "Embalagens",
    purchaseUnit: "fardos com 250un",
    recipeUnit: "un",
    conversionFactor: 250.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 180.0,
    minStock: 250.0,
    unitCost: 0.85,
    idealLot: 500.0,
    supplierId: "sup_embalagens_co",
    supplierName: "Embalagens Centro-Oeste Tangará",
    leadTimeDays: 1,
    storageType: "Depósito de Embalagens",
    shelfLifeDays: 365
  },
  {
    code: "EMB-HOT",
    name: "Caixa Térmica Selada para Hot Rolls e Porções Quentes (Fardo 200un)",
    category: "Embalagens",
    purchaseUnit: "fardos com 200un",
    recipeUnit: "un",
    conversionFactor: 200.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 140.0,
    minStock: 200.0,
    unitCost: 1.10,
    idealLot: 400.0,
    supplierId: "sup_embalagens_co",
    supplierName: "Embalagens Centro-Oeste Tangará",
    leadTimeDays: 1,
    storageType: "Depósito de Embalagens",
    shelfLifeDays: 365
  },
  {
    code: "EMB-SAC",
    name: "Sacola Kraft Reforçada com Alça Torcida Zuma Delivery (Fardo 500un)",
    category: "Embalagens",
    purchaseUnit: "fardos com 500un",
    recipeUnit: "un",
    conversionFactor: 500.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 260.0,
    minStock: 400.0,
    unitCost: 1.40,
    idealLot: 1000.0,
    supplierId: "sup_embalagens_co",
    supplierName: "Embalagens Centro-Oeste Tangará",
    leadTimeDays: 1,
    storageType: "Depósito de Embalagens",
    shelfLifeDays: 365
  },
  {
    code: "EMB-HASHI",
    name: "Pares de Hashi de Bambu Encapados Zuma (Caixa 1000 pares)",
    category: "Embalagens",
    purchaseUnit: "caixas com 1000 pares",
    recipeUnit: "pares",
    conversionFactor: 1000.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 850.0,
    minStock: 1000.0,
    unitCost: 0.25,
    idealLot: 3000.0,
    supplierId: "sup_embalagens_co",
    supplierName: "Embalagens Centro-Oeste Tangará",
    leadTimeDays: 1,
    storageType: "Estoque Seco Climatizado",
    shelfLifeDays: 365
  },
  {
    code: "BEB-REFRI",
    name: "Refrigerante Coca-Cola / Guaraná Lata 350ml (Pack 12un)",
    category: "Bebidas",
    purchaseUnit: "packs com 12un",
    recipeUnit: "un",
    conversionFactor: 12.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 110.0,
    minStock: 90.0,
    unitCost: 2.90,
    idealLot: 240.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Balcão Bar",
    shelfLifeDays: 180
  },
  {
    code: "CERV-01",
    name: "Cerveja Long Neck Stella Artois / Heineken 330ml (Pack 24un)",
    category: "Bebidas",
    purchaseUnit: "packs com 24un",
    recipeUnit: "un",
    conversionFactor: 24.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 68.0,
    minStock: 48.0,
    unitCost: 5.60,
    idealLot: 144.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Balcão Bar",
    shelfLifeDays: 180
  },
  {
    code: "SAQ-01",
    name: "Saquê Dourado Tradicional Azuma Kirin Garrafa 740ml",
    category: "Bebidas",
    purchaseUnit: "caixas com 6 garrafas",
    recipeUnit: "garrafas",
    conversionFactor: 6.0,
    yieldPercent: 100.0,
    lossPercent: 0.0,
    currentStock: 9.0,
    minStock: 6.0,
    unitCost: 38.00,
    idealLot: 18.0,
    supplierId: "sup_atacadao_tga",
    supplierName: "Atacadão Alimentos Tangará",
    leadTimeDays: 1,
    storageType: "Balcão Bar",
    shelfLifeDays: 365
  }
];

// ==============================================================================
// FICHAS TÉCNICAS REAIS DO CARDÁPIO (BOM - BILL OF MATERIALS)
// ==============================================================================
export const ZUMA_TECHNICAL_SHEETS: TechnicalSheetItem[] = [
  // ==================== 1. COMBINADOS & BARCAS ====================
  {
    id: "bom_combo_26",
    dishName: "Combo 26 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 69.90,
    servings: 1,
    prepTimeMinutes: 14,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco (filé limpo)", quantityRecipeUnit: 0.22, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 15.07 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês temperado (Gohan)", quantityRecipeUnit: 0.35, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 3.43 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 3.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 1.65 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia", quantityRecipeUnit: 0.05, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.68 },
      { rawMaterialCode: "GERG-01", name: "Gergelim tostado", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.14 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem combinado 26p", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.95 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 2.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.50 },
      { rawMaterialCode: "SHOY-01", name: "Sachê de Shoyu (30ml)", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 }
    ],
    theoreticalCost: 24.78,
    cmvPercent: 35.45,
    grossMarginBrl: 45.12,
    grossMarginPercent: 64.55,
    chefNotes: "Campeão de vendas no delivery de Tangará. Montagem: 8 uramakis, 8 hossomakis, 6 niguiris e 4 sashimis."
  },
  {
    id: "bom_especial_68",
    dishName: "Especial Zuma 68 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 230.90,
    servings: 4,
    prepTimeMinutes: 28,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco nobre", quantityRecipeUnit: 0.58, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 39.73 },
      { rawMaterialCode: "ATUM-01", name: "Atum fresco Maguro", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 9.48 },
      { rawMaterialCode: "CAM-01", name: "Camarão furai crocante", quantityRecipeUnit: 0.14, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 12.04 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês cozido", quantityRecipeUnit: 0.72, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 7.06 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 7.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 3.85 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.11, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 3.69 },
      { rawMaterialCode: "PANK-01", name: "Farinha Panko", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.78 },
      { rawMaterialCode: "EMB-COMB", name: "Barca Térmica Master", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 3.80 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 4.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 1.00 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu sachê/garrafinha", quantityRecipeUnit: 0.08, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.96 }
    ],
    theoreticalCost: 82.39,
    cmvPercent: 35.68,
    grossMarginBrl: 148.51,
    grossMarginPercent: 64.32,
    chefNotes: "Prato de altíssimo tíquete médio. Barca perfeita para famílias e reuniões de agronegócio em Tangará."
  },
  {
    id: "bom_barco_40",
    dishName: "Barco Zuma Nobre 40 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 149.90,
    servings: 2,
    prepTimeMinutes: 20,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco nobre", quantityRecipeUnit: 0.38, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 26.03 },
      { rawMaterialCode: "ATUM-01", name: "Atum fresco Maguro", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 6.32 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês cozido", quantityRecipeUnit: 0.48, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 4.70 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 4.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 2.48 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia", quantityRecipeUnit: 0.07, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 2.35 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem Barco Luxo", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 2.50 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 2.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.50 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu tradicional", quantityRecipeUnit: 0.05, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.60 }
    ],
    theoreticalCost: 45.48,
    cmvPercent: 30.34,
    grossMarginBrl: 104.42,
    grossMarginPercent: 69.66,
    chefNotes: "Campeão do salão Zuma e jantares românticos. 12 sashimis, 10 niguiris especiais e 18 uramakis/hossomakis."
  },
  {
    id: "bom_combo_individual_16",
    dishName: "Combo Individual 16 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 49.90,
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco filé", quantityRecipeUnit: 0.15, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 10.28 },
      { rawMaterialCode: "ARR-01", name: "Arroz temperado Gohan", quantityRecipeUnit: 0.22, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 2.16 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 2.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 1.10 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem executiva", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.60 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 1.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.25 }
    ],
    theoreticalCost: 16.40,
    cmvPercent: 32.87,
    grossMarginBrl: 33.50,
    grossMarginPercent: 67.13,
    chefNotes: "Opção rápida para jantar individual no delivery. Montagem expressa em 10 minutos."
  },

  // ==================== 2. TEMAKIS ====================
  {
    id: "bom_temaki_salmao",
    dishName: "Temaki Salmão Completo",
    category: "Temakis",
    station: "Sushibar (Frio)",
    salePrice: 29.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco picado em cubos", quantityRecipeUnit: 0.11, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 7.54 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.78 },
      { rawMaterialCode: "NORI-01", name: "Alga nori inteira crocante", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.02, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.67 },
      { rawMaterialCode: "EMB-TEM", name: "Berço protetor térmico de temaki", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.85 },
      { rawMaterialCode: "SHOY-01", name: "Sachê de shoyu", quantityRecipeUnit: 0.02, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.24 }
    ],
    theoreticalCost: 10.63,
    cmvPercent: 35.55,
    grossMarginBrl: 19.27,
    grossMarginPercent: 64.45,
    chefNotes: "Nori ultra crocante embalado no plástico protetor para entrega perfeita sem amolecer."
  },
  {
    id: "bom_temaki_filadelfia",
    dishName: "Temaki Salmão Filadélfia",
    category: "Temakis",
    station: "Sushibar (Frio)",
    salePrice: 31.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco em cubos", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 8.22 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia dobrado", quantityRecipeUnit: 0.035, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.17 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.59 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "EMB-TEM", name: "Berço protetor térmico", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.85 }
    ],
    theoreticalCost: 11.38,
    cmvPercent: 35.67,
    grossMarginBrl: 20.52,
    grossMarginPercent: 64.33,
    chefNotes: "Cebolinha picada fininha e cream cheese original Philadelphia bem aerado."
  },
  {
    id: "bom_temaki_hot",
    dishName: "Temaki Hot Filadélfia Empanado",
    category: "Temakis",
    station: "Sushibar (Frio)",
    salePrice: 34.90,
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco", quantityRecipeUnit: 0.11, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 7.54 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "ARR-01", name: "Arroz temperado", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.78 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Farinha Panko para empanar", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.78 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para fritura", quantityRecipeUnit: 0.06, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.53 },
      { rawMaterialCode: "EMB-TEM", name: "Embalagem protetora", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.85 }
    ],
    theoreticalCost: 12.04,
    cmvPercent: 34.50,
    grossMarginBrl: 22.86,
    grossMarginPercent: 65.50,
    chefNotes: "Fritura rápida em óleo limpo a 180°C. Casquinha dourada crocante com recheio cremoso."
  },

  // ==================== 3. HOT ROLLS ====================
  {
    id: "bom_hot_filadelfia",
    dishName: "Hot Filadélfia (12un)",
    category: "Hot rolls",
    station: "Cozinha Quente",
    salePrice: 31.90,
    servings: 1,
    prepTimeMinutes: 12,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco picado", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 5.48 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.34 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.18 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Farinha panko flocada", quantityRecipeUnit: 0.035, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.68 },
      { rawMaterialCode: "OLEO-01", name: "Óleo vegetal térmico", quantityRecipeUnit: 0.08, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.71 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem térmica hot roll", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.10 }
    ],
    theoreticalCost: 11.04,
    cmvPercent: 34.61,
    grossMarginBrl: 20.86,
    grossMarginPercent: 65.39,
    chefNotes: "Prato com altíssima margem e giro imediato. Embalagem ventilada para reter crocância."
  },
  {
    id: "bom_hot_zuma",
    dishName: "Hot Zuma Especial (8un)",
    category: "Hot rolls",
    station: "Cozinha Quente",
    salePrice: 52.90,
    servings: 1,
    prepTimeMinutes: 15,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão nobre lombo", quantityRecipeUnit: 0.14, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 9.59 },
      { rawMaterialCode: "CAM-01", name: "Camarão topo maçaricado", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 5.16 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.34 },
      { rawMaterialCode: "ARR-01", name: "Arroz especial", quantityRecipeUnit: 0.10, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.98 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Farinha Panko", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.59 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem térmica hot roll", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.10 }
    ],
    theoreticalCost: 19.31,
    cmvPercent: 36.50,
    grossMarginBrl: 33.59,
    grossMarginPercent: 63.50,
    chefNotes: "Hot roll premium coberto com camarão fresco grelhado no maçarico com azeite trufado."
  },
  {
    id: "bom_hot_camarao",
    dishName: "Hot Camarão Crocante (8un)",
    category: "Hot rolls",
    station: "Cozinha Quente",
    salePrice: 44.90,
    servings: 1,
    prepTimeMinutes: 12,
    ingredients: [
      { rawMaterialCode: "CAM-01", name: "Camarão cinza limpo", quantityRecipeUnit: 0.10, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 8.60 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.10, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.98 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Panko crocante", quantityRecipeUnit: 0.035, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.68 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para fritura", quantityRecipeUnit: 0.08, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.71 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem térmica", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.10 }
    ],
    theoreticalCost: 13.63,
    cmvPercent: 30.36,
    grossMarginBrl: 31.27,
    grossMarginPercent: 69.64,
    chefNotes: "Camarões empanados um a um na farinha panko japonesa."
  },

  // ==================== 4. SASHIMIS & NIGUIRIS ====================
  {
    id: "bom_sashimi_12",
    dishName: "Sashimi Salmão Nobre (12 fatias)",
    category: "Sashimis",
    station: "Sushibar (Frio)",
    salePrice: 48.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Lombo nobre de salmão fresco", quantityRecipeUnit: 0.20, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 13.70 },
      { rawMaterialCode: "HORT-PEP", name: "Pepino fatiado decoração", quantityRecipeUnit: 0.02, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.15 },
      { rawMaterialCode: "WAS-01", name: "Wasabi japonês", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.23 },
      { rawMaterialCode: "EMB-COMB", name: "Berço selado sashimi", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.95 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 1.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.25 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu tradicional", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 }
    ],
    theoreticalCost: 16.64,
    cmvPercent: 34.03,
    grossMarginBrl: 32.26,
    grossMarginPercent: 65.97,
    chefNotes: "Corte do lombo central (otoro/chutoro). Textura sedosa e coloração laranja vibrante."
  },
  {
    id: "bom_sashimi_atum_12",
    dishName: "Sashimi Atum Maguro (12 fatias)",
    category: "Sashimis",
    station: "Sushibar (Frio)",
    salePrice: 52.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "ATUM-01", name: "Lombo nobre de atum vermelho", quantityRecipeUnit: 0.20, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 15.80 },
      { rawMaterialCode: "WAS-01", name: "Wasabi japonês", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.23 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem selada", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.95 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 1.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.25 }
    ],
    theoreticalCost: 18.23,
    cmvPercent: 34.46,
    grossMarginBrl: 34.67,
    grossMarginPercent: 65.54,
    chefNotes: "Atum fresco classe exportação, lâminas de 15g perfeitamente anguladas."
  },
  {
    id: "bom_niguiri_salmao_trufado",
    dishName: "Niguiri Salmão Trufado (4un)",
    category: "Niguiris e gunkans",
    station: "Sushibar (Frio)",
    salePrice: 24.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão lâmina nobre", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 4.11 },
      { rawMaterialCode: "ARR-01", name: "Shari temperado", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.78 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem porção", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.20 }
    ],
    theoreticalCost: 6.09,
    cmvPercent: 24.46,
    grossMarginBrl: 18.81,
    grossMarginPercent: 75.54,
    chefNotes: "Maçaricado levemente na hora, finalizado com azeite de trufas brancas e flor de sal."
  },
  {
    id: "bom_gunkan_joy",
    dishName: "Gunkan Joy Geleia de Pimenta (4un)",
    category: "Niguiris e gunkans",
    station: "Sushibar (Frio)",
    salePrice: 26.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Tiras e picado de salmão", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 5.48 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia", quantityRecipeUnit: 0.025, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.84 },
      { rawMaterialCode: "ARR-01", name: "Shari arroz", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.59 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.20 }
    ],
    theoreticalCost: 8.11,
    cmvPercent: 30.15,
    grossMarginBrl: 18.79,
    grossMarginPercent: 69.85,
    chefNotes: "Salmão envolvendo o bolinho de arroz com topo cremoso e geleia artesanal."
  },

  // ==================== 5. URAMAKIS & HOSSOMAKIS ====================
  {
    id: "bom_uramaki_filadelfia",
    dishName: "Uramaki Filadélfia (8un)",
    category: "Uramakis",
    station: "Sushibar (Frio)",
    salePrice: 28.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco", quantityRecipeUnit: 0.07, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 4.80 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "ARR-01", name: "Arroz shari", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.18 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "GERG-01", name: "Gergelim tostado", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.14 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 8.81,
    cmvPercent: 30.48,
    grossMarginBrl: 20.09,
    grossMarginPercent: 69.52,
    chefNotes: "Rolado perfeito e homogêneo com arroz invertido e gergelim bicolor."
  },
  {
    id: "bom_uramaki_skin",
    dishName: "Uramaki Salmão Grelhado Skin (8un)",
    category: "Uramakis",
    station: "Sushibar (Frio)",
    salePrice: 24.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Aparas nobres e pele crocante", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 4.11 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.025, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.84 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.18 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 7.81,
    cmvPercent: 31.37,
    grossMarginBrl: 17.09,
    grossMarginPercent: 68.63,
    chefNotes: "Aproveitamento inteligente de aparas e pele de salmão frita e sequinha com molho tarê."
  },
  {
    id: "bom_hossomaki_shake",
    dishName: "Shakemaki Salmão (8un)",
    category: "Hossomakis",
    station: "Sushibar (Frio)",
    salePrice: 21.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão filé", quantityRecipeUnit: 0.05, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 3.43 },
      { rawMaterialCode: "ARR-01", name: "Arroz shari", quantityRecipeUnit: 0.09, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.88 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.20 }
    ],
    theoreticalCost: 5.79,
    cmvPercent: 26.44,
    grossMarginBrl: 16.11,
    grossMarginPercent: 73.56,
    chefNotes: "Hossomaki clássico e tradicional. Alga por fora bem esticada e arroz firme."
  },

  // ==================== 6. PRATOS QUENTES (OPERAÇÃO CHUVA) ====================
  {
    id: "bom_lamen_tradicional",
    dishName: "Lamen Tradicional Zuma",
    category: "Pratos quentes",
    station: "Cozinha Quente",
    salePrice: 38.90,
    servings: 1,
    prepTimeMinutes: 16,
    ingredients: [
      { rawMaterialCode: "LAM-01", name: "Massa fresca de Lamen", quantityRecipeUnit: 0.18, recipeUnit: "kg", prepYieldPercent: 150.0, costShareBrl: 2.88 },
      { rawMaterialCode: "MIGN-01", name: "Fatias de mignon bovino marinado", quantityRecipeUnit: 0.09, recipeUnit: "kg", prepYieldPercent: 90.0, costShareBrl: 5.22 },
      { rawMaterialCode: "SHOY-01", name: "Base shoyu e caldo dashi", quantityRecipeUnit: 0.05, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.60 },
      { rawMaterialCode: "HORT-PEP", name: "Cebolinha e broto de feijão", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.30 },
      { rawMaterialCode: "EMB-HOT", name: "Bowl térmico anti-vazamento", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 2.20 }
    ],
    theoreticalCost: 11.20,
    cmvPercent: 28.79,
    grossMarginBrl: 27.70,
    grossMarginPercent: 71.21,
    chefNotes: "O astro dos dias de chuva em Tangará. Caldo quente fumegante e embalagem térmica estanque."
  },
  {
    id: "bom_yakissoba_misto",
    dishName: "Yakissoba Misto Tradicional",
    category: "Pratos quentes",
    station: "Cozinha Quente",
    salePrice: 36.90,
    servings: 1,
    prepTimeMinutes: 14,
    ingredients: [
      { rawMaterialCode: "MASS-01", name: "Massa de yakissoba", quantityRecipeUnit: 0.16, recipeUnit: "kg", prepYieldPercent: 180.0, costShareBrl: 2.00 },
      { rawMaterialCode: "MIGN-01", name: "Filé mignon em tiras", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 90.0, costShareBrl: 3.48 },
      { rawMaterialCode: "FRAN-01", name: "Peito de frango em cubos", quantityRecipeUnit: 0.07, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.30 },
      { rawMaterialCode: "SHOY-01", name: "Molho especial de yakissoba", quantityRecipeUnit: 0.06, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.72 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para saltear", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.27 },
      { rawMaterialCode: "EMB-HOT", name: "Box térmico selado", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 9.17,
    cmvPercent: 24.85,
    grossMarginBrl: 27.73,
    grossMarginPercent: 75.15,
    chefNotes: "Legumes frescos e crocantes (acelga, cenoura, brócolis) salteados no fogo alto do wok."
  },
  {
    id: "bom_teppan_salmao",
    dishName: "Teppan de Salmão com Legumes",
    category: "Pratos quentes",
    station: "Cozinha Quente",
    salePrice: 41.90,
    servings: 1,
    prepTimeMinutes: 15,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Posta nobre de salmão", quantityRecipeUnit: 0.18, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 12.33 },
      { rawMaterialCode: "ARR-01", name: "Gohan arroz de acompanhamento", quantityRecipeUnit: 0.15, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.47 },
      { rawMaterialCode: "SHOY-01", name: "Molho tarê/manteiga", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem dupla térmica", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.80 }
    ],
    theoreticalCost: 15.96,
    cmvPercent: 38.09,
    grossMarginBrl: 25.94,
    grossMarginPercent: 61.91,
    chefNotes: "Salmão grelhado na chapa de ferro com casquinha crocante e interior suculento."
  },

  // ==================== 7. ENTRADAS ====================
  {
    id: "bom_shimeji",
    dishName: "Shimeji na Manteiga com Cebolinha",
    category: "Entradas",
    station: "Cozinha Quente",
    salePrice: 36.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SHIM-01", name: "Cogumelo Shimeji preto fresco", quantityRecipeUnit: 0.20, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 6.40 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu e sake mirin", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem alumínio selada", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.30 }
    ],
    theoreticalCost: 8.06,
    cmvPercent: 21.84,
    grossMarginBrl: 28.84,
    grossMarginPercent: 78.16,
    chefNotes: "Entrada quente mais pedida no salão. Margem espetacular de 78%."
  },
  {
    id: "bom_sunomono",
    dishName: "Sunomono Especial com Salmão",
    category: "Entradas",
    station: "Sushibar (Frio)",
    salePrice: 22.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "HORT-PEP", name: "Pepino japonês finamente laminado", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.90 },
      { rawMaterialCode: "SALM-01", name: "Fatias nobres de salmão", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 2.74 },
      { rawMaterialCode: "VIN-01", name: "Molho agridoce de vinagre de arroz", quantityRecipeUnit: 0.04, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.58 },
      { rawMaterialCode: "GERG-01", name: "Gergelim tostado", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.14 },
      { rawMaterialCode: "EMB-COMB", name: "Pote selado antivazamento", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.90 }
    ],
    theoreticalCost: 5.26,
    cmvPercent: 22.97,
    grossMarginBrl: 17.64,
    grossMarginPercent: 77.03,
    chefNotes: "Frescor absoluto e acidez balanceada para abrir o apetite."
  },
  {
    id: "bom_ceviche_misto",
    dishName: "Ceviche Nobre Misto Zuma",
    category: "Entradas",
    station: "Sushibar (Frio)",
    salePrice: 42.90,
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco em cubos", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 5.48 },
      { rawMaterialCode: "ATUM-01", name: "Atum vermelho em cubos", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 3.16 },
      { rawMaterialCode: "CAM-01", name: "Camarão marinado", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 3.44 },
      { rawMaterialCode: "HORT-AVO", name: "Avocado fresco fatiado", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 72.0, costShareBrl: 0.42 },
      { rawMaterialCode: "EMB-COMB", name: "Pote cristal luxo", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 13.90,
    cmvPercent: 32.40,
    grossMarginBrl: 29.00,
    grossMarginPercent: 67.60,
    chefNotes: "Marinado no limão taiti com cebola roxa fininha e toque de azeite e pimenta dedo-de-moça."
  },

  // ==================== 8. POKES ====================
  {
    id: "bom_poke_salmao",
    dishName: "Poke Salmão Tropical Especial",
    category: "Poke",
    station: "Sushibar (Frio)",
    salePrice: 41.90,
    servings: 1,
    prepTimeMinutes: 12,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco em cubos", quantityRecipeUnit: 0.13, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 8.91 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês base", quantityRecipeUnit: 0.16, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.57 },
      { rawMaterialCode: "HORT-AVO", name: "Avocado fatiado", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 72.0, costShareBrl: 0.56 },
      { rawMaterialCode: "HORT-PEP", name: "Pepino sunomono", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.23 },
      { rawMaterialCode: "NORI-01", name: "Tiras de nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.025, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.84 },
      { rawMaterialCode: "EMB-COMB", name: "Bowl kraft ecológico com tampa", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.85 }
    ],
    theoreticalCost: 14.24,
    cmvPercent: 33.99,
    grossMarginBrl: 27.66,
    grossMarginPercent: 66.01,
    chefNotes: "Prato altamente consumido no almoço executivo e público fitness de Tangará."
  },

  // ==================== 9. SOBREMESAS ====================
  {
    id: "bom_harumaki_romeu",
    dishName: "Rolinho Primavera Romeu & Julieta (4un)",
    category: "Sobremesas",
    station: "Cozinha Quente",
    salePrice: 22.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "CRM-01", name: "Cream cheese recheio", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 2.01 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para fritura", quantityRecipeUnit: 0.04, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.36 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem sobremesa", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.90 }
    ],
    theoreticalCost: 4.87,
    cmvPercent: 21.27,
    grossMarginBrl: 18.03,
    grossMarginPercent: 78.73,
    chefNotes: "Goiabada cascão cremosa com queijo derretido em massa ultra fina e crocante."
  }
];

// ==============================================================================
// MOTOR DE PROJEÇÃO PREDITIVA DE COMPRAS
// ==============================================================================
export interface ForecastScenario {
  horizonDays: 3 | 7 | 14 | 30;
  scenarioMultiplier: number; // 1.0 = Normal, 1.2 = Pico/FDS, 1.35 = Evento/Chuva
  label: string;
}

export interface MaterialRequirementForecast {
  material: RawMaterialItem;
  grossRequirementRecipeUnit: number; // Consumo bruto previsto
  grossRequirementPurchaseUnit: number; // Convertido para unidade de compra
  currentStock: number;
  safetyStock: number;
  openOrdersQuantity: number;
  netDeficitPurchaseUnit: number; // Necessidade real de compra
  suggestedPurchaseOrderQty: number; // Arredondado para lote mínimo
  estimatedCostBrl: number;
  status: "CRITICO" | "ATENCAO" | "ADEQUADO" | "EXCESSO";
  daysOfCoverageRemaining: number;
  recommendedSupplier: SupplierItem;
}

export function calculatePurchaseForecast(
  rawMaterials: RawMaterialItem[],
  horizonDays: number = 7,
  multiplier: number = 1.0,
  averageWeeklyOrders: number = 680
): {
  projectedOrders: number;
  requirements: MaterialRequirementForecast[];
  totalEstimatedBudget: number;
  criticalCount: number;
  attentionCount: number;
  ordersBySupplier: Record<string, {
    supplier: SupplierItem;
    items: Array<{ material: RawMaterialItem; quantity: number; cost: number }>;
    totalAmount: number;
  }>;
} {
  // Pedidos previstos no período
  const baseDailyOrders = averageWeeklyOrders / 7;
  const projectedOrders = Math.round(baseDailyOrders * horizonDays * multiplier);

  // Proporção de demanda por tipo de insumo baseada na matriz de consumo do Zuma
  const requirements: MaterialRequirementForecast[] = rawMaterials.map(mat => {
    let baseConsumptionPerOrder = 0;

    switch (mat.code) {
      case "SALM-01":
        // 0.29kg de peixe bruto por pedido médio (considerando rendimento 58% filé)
        baseConsumptionPerOrder = 0.36; // kg bruto
        break;
      case "ATUM-01":
        baseConsumptionPerOrder = 0.035;
        break;
      case "CAM-01":
        baseConsumptionPerOrder = 0.045;
        break;
      case "POLV-01":
        baseConsumptionPerOrder = 0.015;
        break;
      case "PEIX-PREG":
        baseConsumptionPerOrder = 0.020;
        break;
      case "VIEI-CAN":
        baseConsumptionPerOrder = 0.012;
        break;
      case "CARN-WAG":
        baseConsumptionPerOrder = 0.015;
        break;
      case "CARN-PICA":
        baseConsumptionPerOrder = 0.025;
        break;
      case "TRUF-AZ":
        baseConsumptionPerOrder = 0.005;
        break;
      case "FOIE-GRA":
        baseConsumptionPerOrder = 0.004;
        break;
      case "MISO-ORG":
        baseConsumptionPerOrder = 0.015;
        break;
      case "MASS-UDON":
        baseConsumptionPerOrder = 0.035;
        break;
      case "ARR-01":
        baseConsumptionPerOrder = 0.16; // kg cru (rende 350g cozido)
        break;
      case "NORI-01":
        baseConsumptionPerOrder = 2.4; // folhas por pedido
        break;
      case "CRM-01":
        baseConsumptionPerOrder = 0.055; // kg
        break;
      case "SHOY-01":
        baseConsumptionPerOrder = 0.07; // L
        break;
      case "OLEO-01":
        baseConsumptionPerOrder = 0.05; // L
        break;
      case "PANK-01":
        baseConsumptionPerOrder = 0.025; // kg
        break;
      case "GERG-01":
        baseConsumptionPerOrder = 0.01; // kg
        break;
      case "HORT-PEP":
        baseConsumptionPerOrder = 0.035; // kg
        break;
      case "HORT-AVO":
        baseConsumptionPerOrder = 0.025; // kg
        break;
      case "EMB-COMB":
        baseConsumptionPerOrder = 1.15; // caixas por pedido
        break;
      case "EMB-HASHI":
        baseConsumptionPerOrder = 2.1; // pares por pedido
        break;
      case "BEB-REFRI":
        baseConsumptionPerOrder = 0.85; // latas por pedido
        break;
      case "CERV-STE":
        baseConsumptionPerOrder = 0.45;
        break;
      case "SAQ-JUN":
        baseConsumptionPerOrder = 0.06;
        break;
      case "GIN-TANQ":
        baseConsumptionPerOrder = 0.04;
        break;
      case "EMB-SACO":
        baseConsumptionPerOrder = 1.05;
        break;
      case "EMB-HOT":
        baseConsumptionPerOrder = 0.80;
        break;
      default:
        baseConsumptionPerOrder = 0.05;
    }

    const grossConsumption = projectedOrders * baseConsumptionPerOrder;
    const dailyBurnRate = grossConsumption / horizonDays;
    const daysRemaining = dailyBurnRate > 0 ? (mat.currentStock / dailyBurnRate) : 99;

    // Estoque de segurança baseado no Lead Time do fornecedor + 2 dias de folga
    const safetyStockNeeded = dailyBurnRate * (mat.leadTimeDays + 2);
    const openOrders = 0; // Pedidos já emitidos em trânsito

    // Déficit Líquido = (Consumo Projetado + Estoque de Segurança) - Estoque Atual - Pedidos Abertos
    const netDeficit = Math.max(0, (grossConsumption + safetyStockNeeded) - mat.currentStock - openOrders);

    // Arredondamento para Lote Econômico do Fornecedor
    let suggestedQty = 0;
    if (netDeficit > 0) {
      if (mat.code === "SALM-01") {
        // Peças de salmão de ~6kg cada
        const pecas = Math.ceil(netDeficit / 6.0);
        suggestedQty = pecas * 6.0;
      } else if (mat.conversionFactor > 1) {
        // Ex: sacos ou caixas fechadas
        suggestedQty = Math.ceil(netDeficit / mat.conversionFactor) * mat.conversionFactor;
      } else {
        suggestedQty = Math.ceil(netDeficit);
      }
    }

    const estimatedCost = suggestedQty * mat.unitCost;

    let status: "CRITICO" | "ATENCAO" | "ADEQUADO" | "EXCESSO" = "ADEQUADO";
    if (daysRemaining < (mat.leadTimeDays + 1)) {
      status = "CRITICO";
    } else if (daysRemaining < (mat.leadTimeDays + 3)) {
      status = "ATENCAO";
    } else if (daysRemaining > (horizonDays * 2.5)) {
      status = "EXCESSO";
    }

    const supplier = ZUMA_SUPPLIERS.find(s => s.id === mat.supplierId) || ZUMA_SUPPLIERS[0];

    return {
      material: mat,
      grossRequirementRecipeUnit: grossConsumption,
      grossRequirementPurchaseUnit: grossConsumption,
      currentStock: mat.currentStock,
      safetyStock: safetyStockNeeded,
      openOrdersQuantity: openOrders,
      netDeficitPurchaseUnit: netDeficit,
      suggestedPurchaseOrderQty: suggestedQty,
      estimatedCostBrl: estimatedCost,
      status,
      daysOfCoverageRemaining: Math.round(daysRemaining * 10) / 10,
      recommendedSupplier: supplier
    };
  });

  const totalEstimatedBudget = requirements.reduce((acc, curr) => acc + curr.estimatedCostBrl, 0);
  const criticalCount = requirements.filter(r => r.status === "CRITICO").length;
  const attentionCount = requirements.filter(r => r.status === "ATENCAO").length;

  // Agrupar ordens por fornecedor
  const ordersBySupplier: Record<string, {
    supplier: SupplierItem;
    items: Array<{ material: RawMaterialItem; quantity: number; cost: number }>;
    totalAmount: number;
  }> = {};

  for (const req of requirements) {
    if (req.suggestedPurchaseOrderQty > 0) {
      const supId = req.material.supplierId;
      if (!ordersBySupplier[supId]) {
        ordersBySupplier[supId] = {
          supplier: req.recommendedSupplier,
          items: [],
          totalAmount: 0
        };
      }
      ordersBySupplier[supId].items.push({
        material: req.material,
        quantity: req.suggestedPurchaseOrderQty,
        cost: req.estimatedCostBrl
      });
      ordersBySupplier[supId].totalAmount += req.estimatedCostBrl;
    }
  }

  return {
    projectedOrders,
    requirements,
    totalEstimatedBudget,
    criticalCount,
    attentionCount,
    ordersBySupplier
  };
}

// ==============================================================================
// ORDENS DE COMPRA REAIS / HISTÓRICO ZUMA
// ==============================================================================
export const INITIAL_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    id: "oc_2026_11_01",
    orderNumber: "OC-8901",
    supplierId: "sup_pantanal",
    supplierName: "Pantanal Pescados Nobres Cuiabá",
    supplierPhone: "(65) 99841-3320",
    createdAt: "2026-11-19T14:30:00Z",
    expectedDeliveryDate: "2026-11-21T10:00:00Z",
    deliveredAt: "2026-11-21T09:45:00Z",
    status: "recebido",
    items: [
      { rawMaterialCode: "SALM-01", rawMaterialName: "Salmão Salar Fresco Chileno (Peça Inteira)", quantity: 120.0, purchaseUnit: "kg (20 peças)", unitPrice: 68.50, totalPrice: 8220.00 },
      { rawMaterialCode: "ATUM-01", rawMaterialName: "Atum Vermelho Maguro", quantity: 15.0, purchaseUnit: "kg", unitPrice: 79.00, totalPrice: 1185.00 },
      { rawMaterialCode: "CAM-01", rawMaterialName: "Camarão 40/50 Limpo", quantity: 20.0, purchaseUnit: "kg", unitPrice: 86.00, totalPrice: 1720.00 }
    ],
    subtotal: 11125.00,
    discount: 333.75, // 3% desconto negociado
    freightCost: 0.0, // Frete grátis acima de R$ 2.500
    totalAmount: 10791.25,
    paymentMethod: "Boleto 14 dias",
    dueDate: "2026-12-05",
    integratedFinancial: true,
    receivedStockUpdated: true,
    notes: "Entregue com temperatura aferida em 1,4°C. Pescado com excelente rigidez cadavérica e frescor atestado."
  },
  {
    id: "oc_2026_11_02",
    orderNumber: "OC-8902",
    supplierId: "sup_oriental_br",
    supplierName: "Distribuidora Oriental Brasil & Cia",
    supplierPhone: "(65) 99612-8899",
    createdAt: "2026-11-20T16:00:00Z",
    expectedDeliveryDate: "2026-11-23T14:00:00Z",
    status: "em_transito",
    items: [
      { rawMaterialCode: "ARR-01", rawMaterialName: "Arroz Japonês Uruchimai Saco 25kg", quantity: 150.0, purchaseUnit: "kg (6 sacos)", unitPrice: 9.80, totalPrice: 1470.00 },
      { rawMaterialCode: "NORI-01", rawMaterialName: "Alga Nori Premium Gold Fardo 500fls", quantity: 1000.0, purchaseUnit: "folhas (2 fardos)", unitPrice: 0.55, totalPrice: 550.00 },
      { rawMaterialCode: "SHOY-01", rawMaterialName: "Shoyu Fermentação Natural Bombona 20L", quantity: 40.0, purchaseUnit: "L (2 bombonas)", unitPrice: 12.00, totalPrice: 480.00 }
    ],
    subtotal: 2500.00,
    discount: 50.00,
    freightCost: 0.0,
    totalAmount: 2450.00,
    paymentMethod: "Boleto 21 dias",
    dueDate: "2026-12-11",
    integratedFinancial: true,
    receivedStockUpdated: false,
    notes: "Caminhão em rota pela BR-364 vindo de Cuiabá para Tangará."
  }
];
