// Zuma Pilot — Inteligência Operacional & Mapa de Calor Gastronômico
// Modelagem de dados hora-a-hora e oportunidades estratégicas em Tangará da Serra

export const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

export const DAY_NAMES: Record<number, string> = {
  0: "Segunda-feira",
  1: "Terça-feira",
  2: "Quarta-feira",
  3: "Quinta-feira",
  4: "Sexta-feira",
  5: "Sábado",
  6: "Domingo"
};

export interface TimeSlot {
  id: string;
  label: string;
  shortLabel: string;
  period: string;
  iconType: "lunch" | "afternoon" | "sunset" | "dinner" | "night";
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "11-12", label: "11h - 12h", shortLabel: "11h", period: "Almoço Início", iconType: "lunch" },
  { id: "12-13", label: "12h - 13h", shortLabel: "12h", period: "Almoço Pico", iconType: "lunch" },
  { id: "13-14", label: "13h - 14h", shortLabel: "13h", period: "Almoço Tardio", iconType: "lunch" },
  { id: "14-17", label: "14h - 17h", shortLabel: "14h", period: "Transição & Encomendas", iconType: "afternoon" },
  { id: "17-18", label: "17h - 18h", shortLabel: "17h", period: "Pré-Jantar & Happy Hour", iconType: "sunset" },
  { id: "18-19", label: "18h - 19h", shortLabel: "18h", period: "Jantar Abertura", iconType: "dinner" },
  { id: "19-20", label: "19h - 20h", shortLabel: "19h", period: "Jantar Aceleração", iconType: "dinner" },
  { id: "20-21", label: "20h - 21h", shortLabel: "20h", period: "Pico Máximo Jantar", iconType: "dinner" },
  { id: "21-22", label: "21h - 22h", shortLabel: "21h", period: "Pico Sustentado", iconType: "dinner" },
  { id: "22-23", label: "22h - 23h", shortLabel: "22h", period: "Fechamento Salão", iconType: "night" },
  { id: "23-00", label: "23h - 00h", shortLabel: "23h", period: "Madrugada Delivery", iconType: "night" },
];

export interface SlotOpportunity {
  tag: string;
  title: string;
  diagnostic: string;
  action: string;
  potentialBrl: number;
  whatsappDraft: string;
  targetAudience: string;
  actionType: "whatsapp" | "salao" | "delivery" | "cozinha";
  suggestedActionLabel: string;
}

export interface CellData {
  dayIdx: number;
  slotIdx: number;
  isOpen: boolean;
  orders: number;
  revenue: number;
  avgTicket: number;
  kitchenLoad: number; // % 0-100
  hallOccupancy: number; // % 0-100
  lostRevenue: number; // R$ deixado na mesa
  channels: {
    salao: number;
    delivery: number;
    ifood: number;
  };
  bottleneck: "nenhum" | "cozinha_lotada" | "salao_vazio" | "espera_motoboy";
  topDishes: string[];
  aiTip: string;
  opportunity: SlotOpportunity;
}

export interface DayOpportunity {
  id: string;
  title: string;
  timeWindow: string;
  slotIdx: number;
  potentialBrl: number;
  badge: string;
  badgeColor: string;
  diagnostic: string;
  action: string;
  whatsappDraft: string;
  targetAudience: string;
  dishAnchor: string;
  simulatedExtraOrders: number;
}

export const DAY_OPPORTUNITIES: Record<number, DayOpportunity[]> = {
  // 0: Segunda-feira
  0: [
    {
      id: "seg-1",
      title: "Delivery Express Noturno — Menos Concorrência",
      timeWindow: "18h00 às 22h00",
      slotIdx: 5,
      potentialBrl: 1950,
      badge: "+24 pedidos",
      badgeColor: "bg-emerald-500",
      diagnostic: "78% das sushiterias de Tangará fecham na segunda-feira. Há 380 clientes buscando sushi sem opções premium abertas.",
      action: "Abrir turno enxuto com cardápio simplificado (15 combinados mais rápidos) e 2 motoboys dedicados.",
      whatsappDraft: "Segunda também é dia de Zuma! Abrimos nosso delivery express hoje das 18h às 22h com entrega em até 35 min. Garanta o seu jantar japonês sem sair de casa: [link]",
      targetAudience: "Clientes ativos dos últimos 45 dias no Centro e Jardim Tangará",
      dishAnchor: "Combo Express 24 Peças",
      simulatedExtraOrders: 20
    },
    {
      id: "seg-2",
      title: "Plantão Noturno & Saúde Corporativa",
      timeWindow: "19h00 às 21h30",
      slotIdx: 6,
      potentialBrl: 680,
      badge: "+8 pedidos",
      badgeColor: "bg-blue-500",
      diagnostic: "Hospitais, clínicas e farmácias de Tangará com equipes noturnas buscando refeições de alta qualidade.",
      action: "Criar combo corporativo individual com sobremesa cortesia para pedidos de profissionais de saúde.",
      whatsappDraft: "Plantão no hospital ou clínica hoje? O Zuma entrega seu jantar quentinho no seu local de trabalho sem taxa de entrega: [link]",
      targetAudience: "Profissionais de saúde e farmácias cadastradas",
      dishAnchor: "Yakissoba de Frango + Suco Natural",
      simulatedExtraOrders: 8
    },
    {
      id: "seg-3",
      title: "Mise-en-place & Kardex do Salmão",
      timeWindow: "14h00 às 17h00",
      slotIdx: 3,
      potentialBrl: 420,
      badge: "Economia CMV",
      badgeColor: "bg-amber-500",
      diagnostic: "Porcionamento prévio dos filés reduz perda técnica de 27% para 22% no corte inicial.",
      action: "Capacitar sushiman para corte padronizado do Salmão Chileno com aproveitamento das aparas em tartars.",
      whatsappDraft: "Treinamento interno: ficha técnica do salmão e pesagem rigorosa dos blocos nobres.",
      targetAudience: "Equipe interna de cozinha",
      dishAnchor: "Sashimi Salmão Premium",
      simulatedExtraOrders: 4
    }
  ],
  // 1: Terça-feira
  1: [
    {
      id: "ter-1",
      title: "Terça do Hot Roll em Dobro no Salão e Delivery",
      timeWindow: "18h30 às 20h30",
      slotIdx: 5,
      potentialBrl: 1450,
      badge: "+18 pedidos",
      badgeColor: "bg-emerald-500",
      diagnostic: "Início da semana com salão operando a 32% de ocupação. Hot roll tem baixíssimo custo de produção e apelo irresistível.",
      action: "Campanha 'Pediu Hot Roll Filadélfia (12un), leve 24un' até as 20h30 tanto no salão quanto no delivery.",
      whatsappDraft: "Terça do Hot Roll no Zuma! Peça qualquer Hot Roll hoje até as 20h30 e receba o dobro na sua mesa ou em casa. Imperdível: [link]",
      targetAudience: "Clientes cadastrados no Clube Zumi que amam Hot Roll",
      dishAnchor: "Hot Filadélfia (12un)",
      simulatedExtraOrders: 16
    },
    {
      id: "ter-2",
      title: "Almoço Executivo Teppan & Poke Av. Brasil",
      timeWindow: "11h30 às 13h30",
      slotIdx: 1,
      potentialBrl: 820,
      badge: "+12 pedidos",
      badgeColor: "bg-blue-500",
      diagnostic: "Escritórios de advocacia e contabilidade da Av. Brasil sem cardápio rápido com preço fechado.",
      action: "Prato executivo do dia a R$ 42,90 com salada sunomono e chá gelado cortesia.",
      whatsappDraft: "Seu almoço de terça com sabor Zuma: Executivo Teppanyaki de Salmão com sunomono e bebida inclusos. Entrega rápida ou salão: [link]",
      targetAudience: "Empresas e escritórios da região central de Tangará",
      dishAnchor: "Teppanyaki de Salmão Executivo",
      simulatedExtraOrders: 12
    },
    {
      id: "ter-3",
      title: "Reativação de Clientes Inativos (45d)",
      timeWindow: "17h00 às 18h30",
      slotIdx: 4,
      potentialBrl: 960,
      badge: "+10 pedidos",
      badgeColor: "bg-purple-500",
      diagnostic: "86 clientes que costumavam pedir quinzenalmente não compram há mais de 45 dias.",
      action: "Disparo automático Zumi IA com cupom exclusivo de R$ 20 para uso nesta terça ou quarta.",
      whatsappDraft: "Oi! O Zumi sentiu sua falta. Preparamos um presente especial: R$ 20 OFF no seu pedido de hoje para matar a saudade do nosso sushi: [link]",
      targetAudience: "Base de clientes inativos há 45-60 dias",
      dishAnchor: "Combo Clássico 32 Peças",
      simulatedExtraOrders: 10
    }
  ],
  // 2: Quarta-feira
  2: [
    {
      id: "qua-1",
      title: "Quarta do Rodízio Casal & Tatame VIP",
      timeWindow: "19h00 às 21h30",
      slotIdx: 6,
      potentialBrl: 2100,
      badge: "+16 mesas",
      badgeColor: "bg-pink-500",
      diagnostic: "Meio de semana com demanda crescente por saídas de casal. As 4 salas de Tatame têm 50% de ociosidade.",
      action: "Pacote Rodízio Casal com Sobremesa Hot Nutella e reserva prioritária nas salas de Tatame.",
      whatsappDraft: "Quarta Romântica no Zuma: Rodízio completo para o casal com sobremesa e mesa exclusiva no Tatame. Reserve sua mesa agora: [link]",
      targetAudience: "Casais e clientes que frequentam às quartas",
      dishAnchor: "Rodízio Zuma Especial",
      simulatedExtraOrders: 15
    },
    {
      id: "qua-2",
      title: "Quarta Leve: Pokes & Sashimis Fit",
      timeWindow: "11h00 às 14h00",
      slotIdx: 1,
      potentialBrl: 740,
      badge: "+11 pedidos",
      badgeColor: "bg-emerald-500",
      diagnostic: "Público fitness e esportivo de Tangará com alta demanda por refeições proteicas e saudáveis.",
      action: "Combo Poke Salmão Tropical + Suco Natural Detox por R$ 49,90.",
      whatsappDraft: "Quarta Leve no Zuma: Poke de Salmão Fresco rico em proteína com suco natural geladinho. Foco na dieta com muito sabor: [link]",
      targetAudience: "Praticantes de atividade física e academias parceiras",
      dishAnchor: "Poke Salmão Tropical",
      simulatedExtraOrders: 11
    },
    {
      id: "qua-3",
      title: "Campanha Antecipada iFood Pré-Jantar",
      timeWindow: "17h30 às 18h45",
      slotIdx: 4,
      potentialBrl: 580,
      badge: "-25% fila pico",
      badgeColor: "bg-amber-500",
      diagnostic: "Adiantar pedidos das 20h para as 18h alivia a sobrecarga dos sushimen no horário nobre.",
      action: "Cupom relâmpago de 10% OFF no iFood para pedidos finalizados até as 18h45.",
      whatsappDraft: "Jante mais cedo e economize: 10% de desconto no iFood para pedidos feitos até as 18h45! Aproveite o sushi fresquinho: [link]",
      targetAudience: "Usuários de delivery iFood em Tangará",
      dishAnchor: "Combinado Uramaki Especial",
      simulatedExtraOrders: 8
    }
  ],
  // 3: Quinta-feira (Dia em foco no screenshot do usuário)
  3: [
    {
      id: "qui-1",
      title: "Almoço Executivo Corporativo Av. Brasil",
      timeWindow: "11h30 às 13h30",
      slotIdx: 1,
      potentialBrl: 840,
      badge: "+15 pedidos",
      badgeColor: "bg-emerald-500",
      diagnostic: "Salão com 28% de ocupação às 11h-12h. Três polos empresariais na Av. Brasil precisam de almoço ágil com garantia de entrega em 25 min.",
      action: "Cardápio executivo de 4 opções (Yakissoba, Teppan de Frango, Poke Salmão e Combinado 16pçs) por preço único de R$ 39,90.",
      whatsappDraft: "Almoço executivo no Zuma: 4 opções deliciosas entregues no seu escritório em até 25 minutos ou saboreadas no nosso salão climatizado. Peça já: [link]",
      targetAudience: "186 empresas e escritórios do Centro e Jardim Tangará",
      dishAnchor: "Yakissoba Especial + Suco Natural",
      simulatedExtraOrders: 15
    },
    {
      id: "qui-2",
      title: "Happy Hour Antecipado no Sushibar & Chopp",
      timeWindow: "17h30 às 19h30",
      slotIdx: 4,
      potentialBrl: 1250,
      badge: "-30% fila pico",
      badgeColor: "bg-amber-500",
      diagnostic: "O pico das 20h atinge 94% de carga de cozinha. Atrair casais e amigos às 18h esvazia o gargalo e fatura R$ 1.250 a mais.",
      action: "Chopp em dobro + porção de Guioza ou Shimeji na chapa com 25% OFF até as 19h30 no Deck Externo.",
      whatsappDraft: "Quinta do Happy Hour Zuma: Chopp em dobro e Guioza quentinha no nosso deck até 19h30! Convide a turma e comece a noite mais cedo: [link]",
      targetAudience: "Público 25-45 anos, clientes habituais de salão",
      dishAnchor: "Shimeji na Chapa + Chopp Artesanal",
      simulatedExtraOrders: 16
    },
    {
      id: "qui-3",
      title: "Delivery Residencial Noturno Jardim Tangará e Tarumã",
      timeWindow: "21h00 às 22h30",
      slotIdx: 8,
      potentialBrl: 650,
      badge: "+8 pedidos VIP",
      badgeColor: "bg-blue-500",
      diagnostic: "Clientes residenciais de alto padrão que chegam tarde em casa e optam por combos familiares completos.",
      action: "Frete cortesia acima de R$ 120 e brinde de mini-rolinhos de Nutella para pedidos nos bairros Jardim Tangará e Tarumã.",
      whatsappDraft: "Noite de sushi em família: peça sua barca favorita acima de R$ 120 e o frete é cortesia, com rolinhos de Nutella de presente! Peça no link: [link]",
      targetAudience: "Bairros Jardim Tangará, Vila Alta, Tarumã e arredores",
      dishAnchor: "Barca Família Zuma 56 Peças",
      simulatedExtraOrders: 8
    }
  ],
  // 4: Sexta-feira
  4: [
    {
      id: "sex-1",
      title: "Hostess Digital & Giro Ágil de Mesas no Salão",
      timeWindow: "19h30 às 22h00",
      slotIdx: 7,
      potentialBrl: 2400,
      badge: "+24% giro mesas",
      badgeColor: "bg-rose-500",
      diagnostic: "Salão com 100% de lotação e fila de espera na porta. Reduzir o tempo de fechamento de conta em 12 minutos viabiliza 1 rodízio extra por mesa.",
      action: "Ativar auto-atendimento com pagamento na mesa via QR Code e aviso automático via WhatsApp quando a mesa estiver pronta.",
      whatsappDraft: "Sua mesa no Zuma já está pronta! Por favor, dirija-se à recepção com a hostess. Estamos te esperando com o melhor sushi de Tangará!",
      targetAudience: "Clientes em fila de espera e reservas confirmadas",
      dishAnchor: "Rodízio Premium Zuma",
      simulatedExtraOrders: 20
    },
    {
      id: "sex-2",
      title: "Campanha Antecipada Delivery Pré-Pico (18h-19h)",
      timeWindow: "18h00 às 19h00",
      slotIdx: 5,
      potentialBrl: 1600,
      badge: "+18 pedidos",
      badgeColor: "bg-emerald-500",
      diagnostic: "Antecipar os pedidos de delivery residenciais antes que a cozinha atinja saturação com os pedidos de mesa.",
      action: "Disparo no WhatsApp: 'Sextou mais cedo no Zuma! Pedindo até 19h o frete é Grátis e você recebe o sushi no horário exato que chegar em casa'.",
      whatsappDraft: "Sextou mais cedo! Garanta seu jantar antes do pico e receba com frete grátis e entrega pontual: [link]",
      targetAudience: "Clientes fiéis de delivery residencial",
      dishAnchor: "Combo Especial Sexta 48 Peças",
      simulatedExtraOrders: 18
    },
    {
      id: "sex-3",
      title: "Pausa Temporária do iFood no Pico (20h15 - 21h00)",
      timeWindow: "20h15 às 21h00",
      slotIdx: 7,
      potentialBrl: 1100,
      badge: "Blindagem SLA",
      badgeColor: "bg-red-500",
      diagnostic: "A cozinha opera a 98% de capacidade. Pausar novos pedidos no iFood por 45 minutos evita atrasos de 30+ minutos no salão e cancelamentos.",
      action: "Acionar modo 'Foco Salão' com sincronização automática do KDS 2.0 Fire-on-Demand.",
      whatsappDraft: "Alerta Operacional: Modo Foco Salão ativado com sucesso para blindar a experiência presencial das 27 mesas físicas.",
      targetAudience: "Comando da Cozinha e Sushibar",
      dishAnchor: "Combinados de Salão Exclusivos",
      simulatedExtraOrders: 10
    }
  ],
  // 5: Sábado
  5: [
    {
      id: "sab-1",
      title: "Almoço de Sábado em Família & Espaço Kids",
      timeWindow: "12h00 às 15h00",
      slotIdx: 1,
      potentialBrl: 2800,
      badge: "+22 mesas",
      badgeColor: "bg-emerald-500",
      diagnostic: "Famílias de Tangará que buscam uma experiência gastronômica relaxada de fim de semana com crianças.",
      action: "Menu Família Especial com pratos kids cortesia (Hot Roll Doguinho / Yakissobinha) para reservas antecipadas.",
      whatsappDraft: "Sábado é dia de reunir quem a gente ama no Zuma! Venha almoçar com a gente e as crianças ganham sobremesa especial. Reserve sua mesa: [link]",
      targetAudience: "Famílias de Tangará da Serra",
      dishAnchor: "Barca Especial Zuma 68 Peças",
      simulatedExtraOrders: 22
    },
    {
      id: "sab-2",
      title: "Experiência Tatame VIP & Reservas Omakase",
      timeWindow: "19h00 às 23h00",
      slotIdx: 7,
      potentialBrl: 1900,
      badge: "Ticket R$ 190/p",
      badgeColor: "bg-purple-500",
      diagnostic: "As 4 salas de Tatame têm altíssima procura no sábado à noite. Venda de menu degustação Omakase.",
      action: "Reserva antecipada do Tatame com sinal de 30% e degustação exclusiva preparada na frente dos clientes.",
      whatsappDraft: "Uma experiência inesquecível de sábado: salas reservadas de Tatame VIP com menu Omakase exclusivo. Vagas limitadíssimas: [link]",
      targetAudience: "Clientes VIP e comemorações de aniversário",
      dishAnchor: "Menu Omakase 10 Passos",
      simulatedExtraOrders: 10
    },
    {
      id: "sab-3",
      title: "Delivery Noturno Pós-Eventos Madrugada",
      timeWindow: "22h00 às 00h00",
      slotIdx: 10,
      potentialBrl: 890,
      badge: "+12 pedidos",
      badgeColor: "bg-blue-500",
      diagnostic: "Público jovem que sai de confraternizações e eventos em Tangará buscando comida japonesa fresca.",
      action: "Combo Madrugada Zuma com sushis crocantes e refrigerante lata de brinde.",
      whatsappDraft: "Bateu aquela fome na madrugada? O delivery do Zuma tá a todo vapor com combos especiais até meia-noite! Peça no app: [link]",
      targetAudience: "Público jovem e noturno",
      dishAnchor: "Combo Night Hot & Uramaki (30un)",
      simulatedExtraOrders: 12
    }
  ],
  // 6: Domingo
  6: [
    {
      id: "dom-1",
      title: "Domingo em Família Especial Zuma Delivery",
      timeWindow: "18h00 às 21h30",
      slotIdx: 6,
      potentialBrl: 1750,
      badge: "+16 pedidos",
      badgeColor: "bg-emerald-500",
      diagnostic: "O domingo é o dia de fechar a semana com chave de ouro em casa com a família reunida.",
      action: "Combo Família com Sobremesa Hot Banana com Doce de Leite e raspadinha digital com prêmios.",
      whatsappDraft: "Domingo de sushi em família: Combo Especial Zuma com sobremesa de presente para fechar o fim de semana com o melhor sabor! Peça já: [link]",
      targetAudience: "Famílias e casais de Tangará",
      dishAnchor: "Combo Família 56 Peças",
      simulatedExtraOrders: 15
    },
    {
      id: "dom-2",
      title: "Almoço Prolongado de Domingo",
      timeWindow: "12h00 às 15h00",
      slotIdx: 1,
      potentialBrl: 2200,
      badge: "+18 mesas",
      badgeColor: "bg-amber-500",
      diagnostic: "Almoço descontraído pós-igreja e clubes. Oportunidade de esticar o atendimento até as 15h.",
      action: "Rodízio estendido com estação ao vivo de temakis preparados pelo sushiman.",
      whatsappDraft: "Seu domingo merece um almoço especial: rodízio completo no salão climatizado do Zuma até 15h! Traga sua família: [link]",
      targetAudience: "Público local de Tangará",
      dishAnchor: "Rodízio Almoço Domingo",
      simulatedExtraOrders: 18
    },
    {
      id: "dom-3",
      title: "Fechamento Cego & Inventário Semanal",
      timeWindow: "21h30 às 22h30",
      slotIdx: 9,
      potentialBrl: 540,
      badge: "Zero Quebra",
      badgeColor: "bg-emerald-600",
      diagnostic: "Auditoria final do estoque de pescados e fechamento de caixa cego com conciliação das maquininhas.",
      action: "Gerar Relatório Z automatizado de 80mm e conferir saldo do Salmão Chileno no Kardex.",
      whatsappDraft: "Relatório de Fechamento semanal gerado com sucesso: EBITDA real, quebra de caixa zerada e estoque conferido.",
      targetAudience: "Gestores e proprietário",
      dishAnchor: "Auditoria Kardex 360°",
      simulatedExtraOrders: 5
    }
  ]
};

// Gerador Realista da Matriz 7x11 com Curvas Horárias Verossímeis
export const generateMatrixData = (): CellData[][] => {
  return DAYS.map((_, dayIdx) => {
    return TIME_SLOTS.map((slot, slotIdx) => {
      const isMonday = dayIdx === 0;
      const isFriday = dayIdx === 4;
      const isSaturday = dayIdx === 5;
      const isSunday = dayIdx === 6;
      const isWeekend = isFriday || isSaturday;

      let isOpen = true;
      let orders = 0;
      let avgTicket = 88.5;
      let topDishes = ["Combo Especial 56 Peças", "Hot Filadélfia", "Uramaki Especial"];
      let opportunityTag = "Equilíbrio";
      let opportunityTitle = "Operação Estável";
      let opportunityDiagnostic = "Fluxo equilibrado dentro da capacidade instalada.";
      let opportunityAction = "Manter padrão de atendimento e monitoramento de SLA.";
      let potentialBrl = 0;
      let whatsappDraft = "";
      let targetAudience = "Geral";
      let actionType: "whatsapp" | "salao" | "delivery" | "cozinha" = "whatsapp";
      let suggestedActionLabel = "Ver Detalhes";

      // 11 Horários com Curvas Realistas e Específicas
      if (slotIdx === 0) {
        // 11h - 12h: Início Almoço
        if (isMonday) {
          isOpen = false;
        } else {
          orders = isWeekend ? (isSunday ? 12 : 9) : (dayIdx === 3 ? 9 : 8);
          avgTicket = 52.0;
          topDishes = ["Yakissoba de Frango", "Poke de Salmão", "Executivo Teppan"];
          opportunityTag = "Almoço Corporativo";
          opportunityTitle = "Almoço Corporativo Express Pré-Pico";
          opportunityDiagnostic = "Salão ocioso com 22% de ocupação. Empresas da Av. Brasil precisam de refeição ágil.";
          opportunityAction = "Oferecer almoço executivo express com garantia de entrega em 25 minutos.";
          potentialBrl = 380;
          whatsappDraft = "Almoço executivo sem fila no Zuma! Yakissoba ou Poke quentinho entregue em até 25 min no seu escritório: [link]";
          targetAudience = "Escritórios e empresas da Av. Brasil";
          actionType = "whatsapp";
          suggestedActionLabel = "Disparar Almoço Express";
        }
      } else if (slotIdx === 1) {
        // 12h - 13h: Pico do Almoço
        if (isMonday) {
          isOpen = false;
        } else {
          orders = isWeekend ? (isSunday ? 26 : 22) : (dayIdx === 3 ? 24 : 19);
          avgTicket = 68.5;
          topDishes = ["Rodízio Executivo", "Teppanyaki de Salmão", "Poke Salmão Tropical"];
          opportunityTag = "Pico Almoço";
          opportunityTitle = "Giro de Mesa Corporativa & Pagamento na Mesa";
          opportunityDiagnostic = "Salão a 72% de ocupação. Mesas corporativas querem fechar a conta rápido para voltar ao trabalho.";
          opportunityAction = "Disponibilizar pagamento via Pix QR Code na mesa para liberar o salão 15 min mais rápido.";
          potentialBrl = 520;
          whatsappDraft = "Acelere seu almoço no Zuma: peça e pague direto na mesa pelo celular com Pix instantâneo.";
          targetAudience = "Clientes presenciais de almoço";
          actionType = "salao";
          suggestedActionLabel = "Ativar Pix na Mesa";
        }
      } else if (slotIdx === 2) {
        // 13h - 14h: Almoço Tardio
        if (isMonday) {
          isOpen = false;
        } else {
          orders = isWeekend ? 16 : 14;
          avgTicket = 58.0;
          topDishes = ["Yakissoba Misto", "Hot Filadélfia", "Poke Especial"];
          opportunityTag = "Sobremesa Cortesia";
          opportunityTitle = "Sobremesa Cortesia no Almoço Tardio";
          opportunityDiagnostic = "Clientes que chegam após as 13h têm maior propensão a sobremesas e cafés.";
          opportunityAction = "Oferecer mini-rolinho de doce de leite de cortesia para mesas que consumirem rodízio ou executivo.";
          potentialBrl = 290;
          whatsappDraft = "Almoço tardio com presente: peça seu almoço no Zuma e ganhe um mini rolinho doce especial!";
          targetAudience = "Clientes de almoço tardio";
          actionType = "salao";
          suggestedActionLabel = "Ativar Cortesia Doce";
        }
      } else if (slotIdx === 3) {
        // 14h - 17h: Transição / Mise-en-place
        isOpen = true; // Aberto para encomendas programadas!
        orders = isWeekend ? 5 : 3;
        avgTicket = 126.0;
        topDishes = ["Barca 56 Peças Encomenda", "Combo Casal VIP", "Sashimi Salmão"];
        opportunityTag = "Encomendas Antecipadas";
        opportunityTitle = "Agendamento de Barcas Noturnas com 10% OFF";
        opportunityDiagnostic = "A cozinha está em mise-en-place. Encomendas programadas nivelam a produção e evitam correria no pico.";
        opportunityAction = "Conceder 10% de desconto para quem encomendar barcas com pelo menos 3 horas de antecedência.";
        potentialBrl = 450;
        whatsappDraft = "Planeje sua noite com antecedência! Encomende sua barca Zuma até as 17h e ganhe 10% de desconto especial: [link]";
        targetAudience = "Clientes frequentes de barcas e combinados nobres";
        actionType = "whatsapp";
        suggestedActionLabel = "Disparar Campanha Encomenda";
      } else if (slotIdx === 4) {
        // 17h - 18h: Pré-Jantar & Happy Hour Abertura
        orders = isWeekend ? 11 : 9;
        avgTicket = 74.0;
        topDishes = ["Shimeji na Chapa", "Guioza de Carne", "Chopp Artesanal"];
        opportunityTag = "Happy Hour Deck";
        opportunityTitle = "Happy Hour Antecipado no Sushibar";
        opportunityDiagnostic = "Cozinha com 26% de carga. Atrair casais e amigos às 17h30 esvazia o gargalo do pico das 20h.";
        opportunityAction = "Chopp dobrado e porção de Guioza com 25% de desconto no Deck Externo até as 19h.";
        potentialBrl = 680;
        whatsappDraft = "Quinta do Chopp no Zuma! Chopp em dobro e Guioza quentinha no nosso deck até 19h. Comece a noite mais cedo: [link]";
        targetAudience = "Casais e grupos de amigos de Tangará";
        actionType = "salao";
        suggestedActionLabel = "Ativar Happy Hour";
      } else if (slotIdx === 5) {
        // 18h - 19h: Jantar Aceleração
        orders = isWeekend ? 24 : 18;
        avgTicket = 88.0;
        topDishes = ["Combo 32 Peças", "Hot Filadélfia", "Temaki Salmão Completo"];
        opportunityTag = "Delivery Pré-Pico";
        opportunityTitle = "Campanha Antecipada Delivery Pré-Pico";
        opportunityDiagnostic = "Janela ideal para captar pedidos residenciais que desejam receber o jantar antes das 20h sem espera.";
        opportunityAction = "Disparar mensagem no WhatsApp com frete grátis para pedidos enviados até as 18h45.";
        potentialBrl = 740;
        whatsappDraft = "Jante mais cedo sem fila! Pedindo seu sushi até as 18h45 o frete é cortesia e o motoboy chega voando: [link]";
        targetAudience = "Clientes residenciais de delivery";
        actionType = "delivery";
        suggestedActionLabel = "Disparar Frete Cortesia";
      } else if (slotIdx === 6) {
        // 19h - 20h: Jantar Pleno
        orders = isWeekend ? 34 : (dayIdx === 3 ? 29 : 25);
        avgTicket = 102.0;
        topDishes = ["Combinado Salmão Premium", "Uramaki Especial", "Rodízio Zuma"];
        opportunityTag = "Direcionamento Sushibar";
        opportunityTitle = "Direcionar Pedidos para Combinados Frios";
        opportunityDiagnostic = "Cozinha quente começando a acumular pedidos. O sushibar opera com maior capacidade de evasão rápida.";
        opportunityAction = "Destacar combinados frios na página inicial do cardápio digital e no atendimento dos garçons.";
        potentialBrl = 890;
        whatsappDraft = "Recomendação do Chef: Combinado Salmão Premium fresquinho pronto em tempo recorde no salão e delivery!";
        targetAudience = "Mesas de salão e pedidos online";
        actionType = "cozinha";
        suggestedActionLabel = "Destacar Pratos Frios";
      } else if (slotIdx === 7) {
        // 20h - 21h: PICO MÁXIMO (Gargalo da Cozinha)
        orders = isWeekend ? 44 : (dayIdx === 3 ? 38 : 31);
        avgTicket = 116.0;
        topDishes = ["Barca Zuma 56 Peças", "Rodízio Completo", "Hot Filadélfia"];
        opportunityTag = "Gargalo Crítico";
        opportunityTitle = "Pausar iFood & Blindar Experiência do Salão";
        opportunityDiagnostic = "A cozinha atinge 94%-98% da capacidade limite. Risco de espera > 25 minutos nas 27 mesas físicas.";
        opportunityAction = "Pausar temporariamente o iFood por 40 min e sincronizar o KDS 2.0 Fire-on-Demand para evitar pratos frios.";
        potentialBrl = 1250;
        whatsappDraft = "Alerta Cozinha: Pausa temporária do iFood ativada para garantir atendimento de excelência no salão presencial.";
        targetAudience = "Equipe de Cozinha e PDV Caixa";
        actionType = "cozinha";
        suggestedActionLabel = "Pausar iFood 40 min";
      } else if (slotIdx === 8) {
        // 21h - 22h: Pico Sustentado
        orders = isWeekend ? 32 : (dayIdx === 3 ? 25 : 21);
        avgTicket = 94.0;
        topDishes = ["Hot Roll Nutella", "Uramaki Especial", "Combo Saideira"];
        opportunityTag = "Ticket Sobremesa";
        opportunityTitle = "Alavancagem de Ticket Médio com Sobremesas";
        opportunityDiagnostic = "Mesas finalizando pratos principais. Momento propício para oferta ativa de sobremesas e cafés orientais.";
        opportunityAction = "Garçons oferecem Hot Roll Nutella ou Harumaki Doce na mesa com 20% OFF no fechamento.";
        potentialBrl = 580;
        whatsappDraft = "Feche sua noite com chave de ouro: Hot Roll de Nutella com morangos frescos com desconto na mesa!";
        targetAudience = "Mesas ativas de salão";
        actionType = "salao";
        suggestedActionLabel = "Oferecer Sobremesa 20% OFF";
      } else if (slotIdx === 9) {
        // 22h - 23h: Fechamento Salão
        orders = isWeekend ? 18 : 12;
        avgTicket = 82.0;
        topDishes = ["Combo Night", "Hot Filadélfia", "Temaki Duplo"];
        opportunityTag = "Saideira Delivery";
        opportunityTitle = "Última Chamada Delivery Noturno";
        opportunityDiagnostic = "Salão encerrando, mas motoboys disponíveis para entregas rápidas nos bairros próximos.";
        opportunityAction = "Disparo de 'Última Chamada' com entrega garantida até 23h30.";
        potentialBrl = 420;
        whatsappDraft = "Última chamada da noite no Zuma! O sushibar fecha às 23h, garanta seu sushi da saideira agora: [link]";
        targetAudience = "Clientes de delivery noturno";
        actionType = "delivery";
        suggestedActionLabel = "Disparar Saideira Express";
      } else if (slotIdx === 10) {
        // 23h - 00h: Madrugada Fechamento
        if (isWeekend) {
          orders = 7;
          avgTicket = 72.0;
          topDishes = ["Combo Express", "Hot Roll"];
          opportunityTag = "Madrugada";
          opportunityTitle = "Delivery Madrugada Fim de Semana";
          opportunityDiagnostic = "Demanda remanescente de jovens saindo de confraternizações em Tangará.";
          opportunityAction = "Disponibilizar 3 combos rápidos de montagem imediata.";
          potentialBrl = 350;
          whatsappDraft = "Fome na madrugada? Peça no app do Zuma e receba em até 30 min!";
          targetAudience = "Público noturno de fim de semana";
          actionType = "delivery";
          suggestedActionLabel = "Ativar Modo Madrugada";
        } else {
          orders = 2;
          avgTicket = 65.0;
          topDishes = ["Hot Filadélfia"];
          opportunityTag = "Fechamento Cego";
          opportunityTitle = "Fechamento de Caixa Cego & Relatório Z";
          opportunityDiagnostic = "Operação do dia finalizada com sucesso. Momento de conciliação e auditoria do salmão.";
          opportunityAction = "Imprimir Relatório Z na impressora 80mm e conferir quebra de caixa zerada.";
          potentialBrl = 180;
          whatsappDraft = "Caixa auditado: todas as maquininhas e Pix conciliados com zero quebra.";
          targetAudience = "Operador de Caixa";
          actionType = "cozinha";
          suggestedActionLabel = "Imprimir Relatório Z";
        }
      }

      if (isMonday && isOpen) {
        orders = Math.max(1, Math.floor(orders * 0.5));
      }

      const revenue = orders * avgTicket;
      const kitchenCapacity = 35; // pedidos por hora
      const kitchenLoad = Math.min(100, Math.round((orders / kitchenCapacity) * 100));
      const hallOccupancy = isOpen ? Math.min(100, Math.round((orders * 1.8 / 64) * 100)) : 0;
      const optimalOrders = Math.round(kitchenCapacity * 0.75);
      const lostOrders = isOpen ? Math.max(0, optimalOrders - orders) : 0;
      const lostRevenue = lostOrders * avgTicket;

      let bottleneck: CellData["bottleneck"] = "nenhum";
      if (kitchenLoad >= 85) bottleneck = "cozinha_lotada";
      else if (isOpen && hallOccupancy <= 30 && slotIdx >= 4) bottleneck = "salao_vazio";

      const salao = Math.round(orders * (slotIdx >= 4 && slotIdx <= 8 ? 0.60 : 0.45));
      const delivery = Math.round(orders * 0.35);
      const ifood = Math.max(0, orders - salao - delivery);

      let aiTip = `Fluxo operacional de ${orders} pedidos/hora com carga de ${kitchenLoad}%.`;
      if (!isOpen) {
        aiTip = "Janela fechada. Oportunidade para pré-preparo e planejamento das encomendas de jantar.";
      } else if (bottleneck === "cozinha_lotada") {
        aiTip = `⚠️ Risco de atraso > 20 min (carga ${kitchenLoad}%). Recomenda-se pausar iFood e priorizar as 27 mesas físicas.`;
      } else if (bottleneck === "salao_vazio") {
        aiTip = `Salão com mesas ociosas (${hallOccupancy}% ocupação). Ativar disparo WhatsApp da Zumi IA para casais de Tangará.`;
      }

      return {
        dayIdx,
        slotIdx,
        isOpen,
        orders,
        revenue,
        avgTicket,
        kitchenLoad,
        hallOccupancy,
        lostRevenue,
        channels: { salao, delivery, ifood },
        bottleneck,
        topDishes,
        aiTip,
        opportunity: {
          tag: opportunityTag,
          title: opportunityTitle,
          diagnostic: opportunityDiagnostic,
          action: opportunityAction,
          potentialBrl,
          whatsappDraft,
          targetAudience,
          actionType,
          suggestedActionLabel
        }
      };
    });
  });
};

// Função de Simulação de Incremento de Pedidos em Tempo Real
export function simulateOrdersIncrease(cell: CellData, extraOrders: number) {
  const newOrders = cell.orders + extraOrders;
  const extraRevenue = extraOrders * cell.avgTicket;
  const newRevenue = cell.revenue + extraRevenue;
  const newKitchenLoad = Math.min(100, Math.round((newOrders / 35) * 100));
  const newHallOccupancy = Math.min(100, Math.round((newOrders * 1.8 / 64) * 100));
  return {
    extraOrders,
    extraRevenue,
    newOrders,
    newRevenue,
    newKitchenLoad,
    newHallOccupancy,
    isOverload: newKitchenLoad >= 90
  };
}
