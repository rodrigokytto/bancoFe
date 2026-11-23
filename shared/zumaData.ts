export interface MenuItem {
  cat: string;
  nome: string;
  preco: number;
}

export const MENU: Record<string, Array<[string, number]>> = {
  "Combinados": [
    ["Combo 12 peças", 39.9],
    ["Combo 14 peças", 52.9],
    ["Combo 18 peças", 69.9],
    ["Combo 26 Peças", 69.9],
    ["Oriental 21 Peças", 76.9],
    ["Oriental 20 Peças", 88],
    ["Especial da Casa 40 Peças", 98.9],
    ["Combo Mix", 99.9],
    ["Fit 22 Peças", 101.9],
    ["Especial 30 Peças", 115.9],
    ["Combo 56 Peças", 189.9],
    ["Especial Zuma 68 Peças", 230.9],
    ["Combo Gestante (100% grelhados e fritos)", 230],
    ["Combo Nakato", 275],
    ["Especial do Cheff 106 Peças", 325.9],
    ["Promo Combo Grelhado", 82]
  ],
  "Entradas": [
    ["Sunomono", 14.5],
    ["Gohan Branco", 11.9],
    ["Rolinho Primavera de Legumes (2 un)", 25.9],
    ["Guioza Suína 6un", 35],
    ["Carpaccio De Salmão", 36],
    ["Nuggets De Salmão (5 un)", 36.9],
    ["Furai De Frango (300g)", 37.9],
    ["Ceviche Peruano (300g)", 40.9],
    ["Lula Crocante (300g)", 40.9],
    ["Rolinho De Salmão Empanado (8 un)", 47.9],
    ["Trouxinha De Camarão (6 un)", 52.9],
    ["Furai De Salmão (300g)", 57.9],
    ["Camarão Alho e Azeite", 85.9],
    ["Usuzukuri De Salmão", 85.9],
    ["Camarão Zuma (serve 2)", 180]
  ],
  "Uramakis": [
    ["Uramaki Kapa Maki (8un)", 16.9],
    ["Uramaki Kani (8un)", 22.9],
    ["Uramaki Vegetariano (8un)", 26.9],
    ["Uramaki Salmão Grelhado (8un)", 29.9],
    ["Uramaki Salmão (8un)", 31.9],
    ["Uramaki Cheddar (8un)", 31.9],
    ["Uramaki Filadélfia (8un)", 33.9],
    ["Uramaki Lemon (8un)", 36.9],
    ["Uramaki Skin (8un)", 36.9],
    ["Uramaki Salmão Avocado (8un)", 37.9],
    ["Uramaki Salmão Spicy (8un)", 40.9],
    ["Uramaki Camarão Cozido (8un)", 41.9],
    ["Uramaki Zuma Especial (8un)", 43.9],
    ["Uramaki Spicy Tuna (8un)", 47.9],
    ["Uramaki Salmão Especial (8un)", 48.9],
    ["Uramaki Ebi Tem (8un)", 49.9]
  ],
  "Hossomakis": [
    ["Hossomaki Skin 8 Un", 22.9],
    ["Hossomaki Vegetariano 8 Un", 24.9],
    ["Hossomaki Salmão 8 Un", 28.9],
    ["Hossomaki Filadélfia 8 Un", 29.9],
    ["Hossomaki Salmão Cheddar 8 Un", 34.9],
    ["Hossomaki Camarão Furai 8 Un", 35.9]
  ],
  "Sushi no tubo": [
    ["Tubo Hot Filadélfia", 39.9],
    ["Tubo Uramaki Filadélfia", 39.9],
    ["Tubo Hossomaki Salmão", 39.9]
  ],
  "Sashimis": [
    ["Salmão Fresco 6 Fatias", 35.9],
    ["Salmão Fresco 12 Fatias", 54.9],
    ["Salmão Tataki", 52.9],
    ["Sashimi Sweet (8 fatias)", 59.99],
    ["Salmão Fresco 24 Fatias", 100.9]
  ],
  "Niguiris e gunkans": [
    ["Niguiri Salmão (2un)", 14],
    ["Niguiri Salmão Flambado (2un)", 17.9],
    ["Gunkan Salmão (2un)", 16.9],
    ["Gunkan Zuma (2un)", 22.9],
    ["Gunkan Especial Ebi (2un)", 29.9],
    ["Gunkan Especial do Cheff (6un)", 69.9]
  ],
  "Poke": [
    ["Poke de Salmão", 41.9],
    ["Poke Havaiano", 42.9],
    ["Poke Clássico de Salmão", 43.9],
    ["Poke Vegetariano", 50],
    ["Poke sem arroz", 72],
    ["Poke de Camarão", 75]
  ],
  "Temakis": [
    ["Temaki Salmão grelhado", 27.9],
    ["Temaki skin", 28.9],
    ["Temaki Salmão", 31.9],
    ["Temaki hot", 32.9],
    ["Temaki Salmão Filadélfia", 33.9],
    ["Temaki Salmão nuggets", 35.9],
    ["Temaki ceviche", 41.9],
    ["Temaki Avocado", 42],
    ["Temaki Ebi", 42.9],
    ["Temaki sem Arroz", 43.9]
  ],
  "Hotdog sushi": [
    ["Hotdog Salmão Grelhado", 42],
    ["Hotdog Salmão", 45],
    ["Hotdog Mexicano", 48],
    ["Hotdog Filadélfia", 49],
    ["Hotdog Camarão Furai", 60]
  ],
  "Hot rolls": [
    ["Hot Sakura (8 un)", 29.9],
    ["Hot Filadélfia (12un)", 31.9],
    ["Hot do Cheff (12 un)", 32.9],
    ["Hot Cheddar (8 un)", 32.9],
    ["Hot Camarão (8un)", 44.9],
    ["Hot Zuma (8un)", 52.9],
    ["Hot Nachos (8 un)", 59]
  ],
  "Pratos quentes": [
    ["Sobá de Mignon", 25.9],
    ["Frango Xadrez", 28.9],
    ["Yakissoba Vegetariano", 32.9],
    ["Yakissoba de Frango", 33.9],
    ["Yakissoba Misto", 36.9],
    ["Teppan de Frango", 37.9],
    ["Teppan de Mignon", 39.9],
    ["Teppan de Salmão", 41.9],
    ["Risoto de Mignon", 52.9],
    ["Risoto de salmão com brócolis", 54.9],
    ["Risoto de Camarão", 56.9],
    ["Yakissoba de Camarão", 61.9],
    ["Teppan de Camarão", 62.9]
  ],
  "Porções": [
    ["Batata Frita (400g)", 14.9],
    ["Batata Frita (800g)", 24.9],
    ["Bolinho de Carne", 34.9],
    ["Kid's Frango (100gr)", 37],
    ["Croquete de Salmão (8un)", 49],
    ["Filé Acebolado com batata frita", 69]
  ],
  "Sobremesas": [
    ["Hot Romeu e Julieta (8 un)", 25.9],
    ["Hot Banana com Morango (8 un)", 26.9],
    ["Hot Nutella (8 un)", 29.9],
    ["Hot Sonho de Valsa (8 un)", 31.9],
    ["Rolinho Primavera de Queijo com Goiabada", 33]
  ],
  "Bebidas": [
    ["Coca-Cola Lata 350ml", 7.9],
    ["Coca-Cola Zero 350ml", 7.9],
    ["Guaraná Antarctica 350ml", 7.5],
    ["Guaraná Antarctica Zero 350ml", 7.5],
    ["Fanta Laranja 350ml", 7.5],
    ["Sprite Lemon Fresh 350ml", 7.5],
    ["Schweppes Citrus 350ml", 8.0],
    ["Schweppes Tônica 350ml", 8.0],
    ["Água Mineral Sem Gás 500ml", 5.0],
    ["Água Mineral Com Gás 500ml", 5.5],
    ["Cerveja Heineken Long Neck 330ml", 12.0],
    ["Cerveja Heineken Zero 330ml", 12.0],
    ["Cerveja Corona Extra 330ml", 13.0],
    ["Cerveja Stella Artois 330ml", 11.0],
    ["Cerveja Kirin Ichiban 355ml", 22.0],
    ["Cerveja Eisenbahn Pilsen 355ml", 10.0],
    ["Suco Natural de Laranja 400ml", 12.0],
    ["Limonada Suíça Natural 400ml", 12.0],
    ["Suco de Polpa Maracujá 400ml", 10.0],
    ["Suco de Polpa Morango 400ml", 11.0],
    ["Suco de Abacaxi com Hortelã 400ml", 11.0],
    ["Soda Italiana Maçã Verde", 18.0],
    ["Soda Italiana Frutas Vermelhas", 18.0],
    ["Energético Red Bull 250ml", 15.0],
    ["Energético Red Bull Sugar Free 250ml", 15.0],
    ["Energético Monster Energy 473ml", 16.0],
    ["Saquê Dourado Junmai Dose", 22.0],
    ["Saquê Dourado Junmai Garrafa 720ml", 110.0],
    ["Caipisaquê de Morango", 28.0],
    ["Caipisaquê de Kiwi", 28.0],
    ["Drink Gin Zuma Yuzu Tonic", 36.0],
    ["Drink Moscow Mule Oriental", 34.0]
  ]
};

export const ALL_ITEMS: MenuItem[] = Object.entries(MENU).flatMap(([cat, items]) =>
  items.map(([nome, preco]) => ({ cat, nome, preco }))
);

export const INITIAL_STOCK = [
  { k: "salmao", n: "Salmão fresco", u: "kg", q: 38, min: 25, c: 79.9 },
  { k: "arroz", n: "Arroz japonês", u: "kg", q: 60, min: 30, c: 9.5 },
  { k: "nori", n: "Alga nori", u: "folhas", q: 420, min: 300, c: 0.55 },
  { k: "cream", n: "Cream cheese", u: "kg", q: 9, min: 8, c: 32 },
  { k: "camarao", n: "Camarão", u: "kg", q: 6, min: 5, c: 89 },
  { k: "oleo", n: "Óleo de fritura", u: "L", q: 22, min: 15, c: 9 },
  { k: "frango", n: "Frango", u: "kg", q: 14, min: 8, c: 18 },
  { k: "macarrao", n: "Macarrão yakissoba", u: "kg", q: 7, min: 6, c: 16 },
  { k: "legumes", n: "Legumes", u: "kg", q: 12, min: 8, c: 8 },
  { k: "emb", n: "Embalagens", u: "un", q: 180, min: 250, c: 1.8 },
  { k: "refri", n: "Refrigerante lata", u: "un", q: 96, min: 60, c: 2.9 },
  { k: "shoyu", n: "Sachê de shoyu", u: "un", q: 900, min: 500, c: 0.12 }
];

export const RECIPES: Record<string, Record<string, number>> = {
  "Combinados": { salmao: 0.22, arroz: 0.35, nori: 3, cream: 0.05, emb: 1, shoyu: 3 },
  "Entradas": { salmao: 0.08, oleo: 0.05, emb: 1 },
  "Uramakis": { salmao: 0.07, arroz: 0.12, nori: 1, cream: 0.03, emb: 1, shoyu: 1 },
  "Hossomakis": { salmao: 0.05, arroz: 0.1, nori: 1, emb: 1, shoyu: 1 },
  "Sushi no tubo": { salmao: 0.08, arroz: 0.15, nori: 1, cream: 0.04, emb: 1 },
  "Sashimis": { salmao: 0.18, emb: 1, shoyu: 2 },
  "Niguiris e gunkans": { salmao: 0.04, arroz: 0.05, nori: 1, emb: 1 },
  "Poke": { salmao: 0.12, arroz: 0.15, legumes: 0.08, emb: 1 },
  "Temakis": { salmao: 0.08, arroz: 0.1, nori: 1, cream: 0.03, emb: 1 },
  "Hotdog sushi": { salmao: 0.1, arroz: 0.15, nori: 1, cream: 0.04, oleo: 0.04, emb: 1 },
  "Hot rolls": { salmao: 0.08, arroz: 0.12, nori: 1, cream: 0.04, oleo: 0.05, emb: 1 },
  "Pratos quentes": { frango: 0.12, macarrao: 0.15, legumes: 0.1, oleo: 0.02, emb: 1 },
  "Porções": { oleo: 0.06, emb: 1 },
  "Sobremesas": { oleo: 0.04, emb: 1 },
  "Bebidas": { refri: 1 }
};

export function getItemUsage(item: { nome: string; cat: string }): Record<string, number> {
  const r: Record<string, number> = { ...(RECIPES[item.cat] || {}) };
  if (/camar|ebi/i.test(item.nome)) {
    r.camarao = r.salmao || 0.1;
    delete r.salmao;
  }
  if (/frango|mignon|fil[eé]/i.test(item.nome) && !r.frango && item.cat !== "Bebidas") {
    r.frango = 0.1;
    delete r.salmao;
  }
  if (item.cat === "Bebidas" && !/refrigerante/i.test(item.nome)) {
    delete r.refri;
  }
  return r;
}

export function getItemCost(item: { nome: string; cat: string }): number {
  const costs: Record<string, number> = Object.fromEntries(INITIAL_STOCK.map(s => [s.k, s.c]));
  const usage = getItemUsage(item);
  return Object.entries(usage).reduce((acc, [k, q]) => acc + q * (costs[k] || 0), 0);
}

export const PAIRS: Record<string, string[]> = {
  "Combinados": ["Refrigerante Lata", "Hot Nutella (8 un)"],
  "Hot rolls": ["Refrigerante Lata", "Hot Romeu e Julieta (8 un)"],
  "Poke": ["Sucos Naturais", "Gunkan Salmão (2un)"],
  "Temakis": ["Hot Filadélfia (12un)", "Refrigerante Lata"],
  "Pratos quentes": ["Rolinho Primavera de Legumes (2 un)", "Refrigerante Lata"],
  "Uramakis": ["Hot Filadélfia (12un)", "Refrigerante Lata"]
};

export const BEST_SELLERS = new Set([
  "Combo 26 Peças",
  "Hot Filadélfia (12un)",
  "Uramaki Filadélfia (8un)",
  "Temaki Salmão",
  "Poke de Salmão",
  "Especial da Casa 40 Peças"
]);

export const BAIRROS_TANGARA = [
  "Jardim Cidade Alta",
  "Centro",
  "Vila Alta",
  "Jardim Europa",
  "Jardim Paraíso",
  "Vila Esmeralda",
  "Jardim Shangri-lá",
  "Parque Universitário",
  "Jardim Tarumã",
  "Alto da Boa Vista"
];

export const THEMES_BY_DAY = [
  { dia: "Segunda", nome: "Segunda Express", desc: "Abre 18h–22h só delivery, 20 itens campeões, até 45 min", badge: "novo turno" },
  { dia: "Terça", nome: "Terça do Hot Roll", desc: "Hot Roll em dobro até 20h + WhatsApp às 16h", badge: "pronto" },
  { dia: "Quarta", nome: "Quarta Fit", desc: "Poke ou sashimi + suco natural com preço fechado", badge: "pronto" },
  { dia: "Quinta", nome: "Quinta da Rodada", desc: "Raspadinha do Zumi em todo pedido", badge: "pronto" },
  { dia: "Sexta e sábado", nome: "Pico", desc: "Sem desconto. Upsell, combos para grupo, entrega rápida", badge: "proteger margem" },
  { dia: "Domingo", nome: "Domingo Família", desc: "Combo 56 Peças + sobremesa para dividir", badge: "pronto" },
  { dia: "Qui a dom, 11h–14h", nome: "Zuma Executivo", desc: "Prato do dia até R$ 39,90 para empresas e quem mora perto", badge: "novo turno" }
];

export const CALENDAR_EVENTS = [
  { data: "2026-11-27", nome: "Black Friday", desc: "Combo Zumi Friday: 56 peças + 2 refris, só no app, 24h", status: "agora" },
  { data: "2026-12-24", nome: "Véspera de Natal", desc: "Encomendas com agendamento até 22/12 (ligar o agendamento na loja)", status: "preparar" },
  { data: "2026-12-31", nome: "Réveillon", desc: "Barcas para festa sob encomenda, retirada 16h–19h", status: "preparar" },
  { data: "2027-01-12", nome: "Férias de janeiro", desc: "Clube Zumi com 1º mês pela metade", status: "planejar" },
  { data: "2027-02-09", nome: "Carnaval", desc: "Kit esquenta: hot rolls + energético", status: "planejar" },
  { data: "2027-05-09", nome: "Dia das Mães", desc: "Combo para a família + sobremesa com cartão do Zumi", status: "planejar" },
  { data: "2027-06-12", nome: "Dia dos Namorados", desc: "Jantar a dois: combo + vinho de parceiro + vela", status: "planejar" },
  { data: "2027-06-18", nome: "Dia do Sushi", desc: "Rodada do Zumi com prêmio grande e live no Instagram", status: "planejar" }
];

export const formatBrl = (val: number): string => {
  return "R$ " + (Number(val) || 0).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export interface MarketGap {
  id: string;
  title: string;
  problem: string;
  impact: string;
  solutionZuma: string;
  financialGain: string;
  category: "delivery" | "atendimento" | "pagamento" | "regional" | "demanda" | "fiscal";
  urgency: "alta" | "media" | "critica";
}

export interface TangaraZone {
  zoneName: string;
  neighborhoods: string[];
  avgDeliveryTime: string;
  baseFee: number;
  orderVolumePercent: number;
  avgTicket: number;
  status: "alta_densidade" | "expansao" | "rota_rapida" | "regional";
}

export const TANGARA_MARKET_GAPS: MarketGap[] = [
  {
    id: "gap_ifood_taxas",
    title: "Dreno de Margem com Intermediação do iFood (12% a 27%)",
    problem: "Restaurantes de culinária japonesa em Tangará da Serra repassam taxas abusivas do iFood para os preços ou operam com margem líquida espremida (abaixo de 8%).",
    impact: "Perda estimada de R$ 12.000 a R$ 18.000 mensais em comissões que poderiam ser reinvestidas em produto e fidelização.",
    solutionZuma: "Canal Direto via WhatsApp (servidor WAHA + Meta) com atendimento em 0.8s pela IA Zumi e benefícios do Clube Zumi (cashback e frete grátis nos bairros centrais).",
    financialGain: "+R$ 14.800/mês de margem preservada",
    category: "delivery",
    urgency: "critica"
  },
  {
    id: "gap_demora_whatsapp",
    title: "Gargalo no Atendimento Humano em Noites de Pico (15 a 45 min de espera)",
    problem: "Concorrentes locais demoram mais de 20 minutos para responder clientes no WhatsApp entre 19h30 e 21h30 em sextas e sábados, gerando abandono e migração para outros estabelecimentos.",
    impact: "Até 30% dos leads de WhatsApp desistem da compra antes de receber o cardápio.",
    solutionZuma: "IA Zumi responde em menos de 1 segundo pelo servidor WAHA/Meta, monta carrinhos interativos e transborda com alerta sonoro/visual para atendente apenas quando necessário.",
    financialGain: "+R$ 9.200/mês em vendas resgatadas",
    category: "atendimento",
    urgency: "alta"
  },
  {
    id: "gap_agro_semana",
    title: "Ociosidade Terça a Quinta vs Potencial de Alta Renda do Agronegócio",
    problem: "Terça a quinta-feira sofrem com movimento fraco no salão, enquanto o agronegócio de Tangará (produtores rurais, agrônomos, traders e escritórios corporativos do Centro) demanda almoço executivo rápido e jantares corporativos discretos.",
    impact: "Capacidade instalada ociosa de 60% no salão nos dias úteis.",
    solutionZuma: "Zuma Executivo Almoço (11h–14h) e Combos Corporativos Agro faturados quinzenalmente para empresas via Keeto ERP + WhatsApp com IA.",
    financialGain: "+R$ 18.500/mês em faturamento corporativo",
    category: "demanda",
    urgency: "alta"
  },
  {
    id: "gap_pagamentos_sicredi",
    title: "Hegemonia de Cooperativas de Crédito (Sicredi & Sicoob) no Mato Grosso",
    problem: "Gateways tradicionais do Sudeste cobram taxas de 1.5% a 2.5% em Pix e demoram para liquidar, gerando atrito com a população local que é amplamente cooperada.",
    impact: "Custo anual desnecessário de tarifas de adquirência e risco de conciliação manual.",
    solutionZuma: "Integração direta via Webhook Pix Sicredi/Sicoob Open Finance com taxa zero ou centavos, confirmação imediata e disparo de aviso no KDS.",
    financialGain: "+R$ 4.300/mês economizados em taxas financeiras",
    category: "pagamento",
    urgency: "alta"
  },
  {
    id: "gap_regional_vizinhos",
    title: "Cidades Vizinhas Sem Sushibar Premium (Nova Olímpia e Barra do Bugres)",
    problem: "Nova Olímpia (45km) e Barra do Bugres (70km) somam mais de 55 mil habitantes com carência absoluta de gastronomia oriental premium.",
    impact: "Mercado inexplorado com clientes que compram apenas quando visitam Tangará.",
    solutionZuma: "Rota Regional Programada: 'Sexta do Sushi Zuma em Nova Olímpia' com pré-venda pelo WhatsApp WAHA e entrega única climatizada em caixas térmicas com gelo gel.",
    financialGain: "+R$ 11.200/mês em pedidos programados de lote",
    category: "regional",
    urgency: "media"
  },
  {
    id: "gap_restricoes_celiacos",
    title: "Insegurança em Restrições Alimentares (Celíacos, Grávidas e Intolerantes)",
    problem: "Nenhum restaurante da região possui filtragem confiável em tempo real para gestantes (100% frito/cozido) ou celíacos (shoyu sem glúten e manipulação separada).",
    impact: "Grupos e famílias desistem de pedir sushi por causa de 1 membro com restrição alimentar.",
    solutionZuma: "IA Zumi identifica restrições na hora ('Combo Gestante 100% grelhados' e 'Opções Sem Glúten'), personaliza a sugestão e envia observação em destaque para a esteira do KDS.",
    financialGain: "+R$ 6.400/mês em pedidos de grupos",
    category: "atendimento",
    urgency: "alta"
  }
];

export const TANGARA_ZONAS_LOGISTICA: TangaraZone[] = [
  {
    zoneName: "Zona 1 · Centro & Núcleo Nobre",
    neighborhoods: ["Centro", "Jardim Europa", "Jardim Tarumã", "Parque Universitário"],
    avgDeliveryTime: "12 a 18 min",
    baseFee: 6.00,
    orderVolumePercent: 52,
    avgTicket: 114.50,
    status: "alta_densidade"
  },
  {
    zoneName: "Zona 2 · Expansão Urbana & Bairros Residenciais",
    neighborhoods: ["Vila Alta", "Jardim Shangri-lá", "Jardim Paraíso", "Monte Líbano"],
    avgDeliveryTime: "18 a 26 min",
    baseFee: 8.00,
    orderVolumePercent: 28,
    avgTicket: 98.20,
    status: "rota_rapida"
  },
  {
    zoneName: "Zona 3 · Perímetros & Bairros Altos",
    neighborhoods: ["Jardim Cidade Alta", "Vila Esmeralda", "Alto da Boa Vista", "Tangará II"],
    avgDeliveryTime: "24 a 32 min",
    baseFee: 11.00,
    orderVolumePercent: 15,
    avgTicket: 89.90,
    status: "expansao"
  },
  {
    zoneName: "Zona 4 · Rota Regional (Lote Semanal)",
    neighborhoods: ["Nova Olímpia (45km)", "Barra do Bugres (70km)"],
    avgDeliveryTime: "Agendado (Sex/Sáb)",
    baseFee: 18.00,
    orderVolumePercent: 5,
    avgTicket: 185.00,
    status: "regional"
  }
];
