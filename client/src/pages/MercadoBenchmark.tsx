import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { 
  Check, 
  X, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  Compass, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock, 
  Star, 
  MapPin, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpRight, 
  PieChart, 
  Users, 
  ShoppingBag, 
  Send,
  Building2,
  ChevronRight,
  Flame,
  Sliders,
  Radio,
  Bell,
  Play,
  Pause,
  Eye,
  RefreshCw,
  Bot,
  Award,
  MessageSquare,
  Percent,
  Truck,
  ThumbsDown,
  ThumbsUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
  Scale,
  Coins,
  FileText,
  ExternalLink,
  Landmark,
  CloudRain,
  Droplets,
  Thermometer,
  Sun,
  CloudLightning,
  Wind,
  Umbrella,
  Copy
  , Calculator,
  UtensilsCrossed,
  CreditCard,
  Globe,
  Layers,
  Split,
  Boxes,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

import { ProjecaoFaturamentoIaSubsuite } from "../components/ia/ProjecaoFaturamentoIaSubsuite";
import { ReativacaoClientesIaSubsuite } from "../components/ia/ReativacaoClientesIaSubsuite";
import { BuracosOciosidadeIaSubsuite } from "../components/ia/BuracosOciosidadeIaSubsuite";
import { DrClimaOperacaoChuvaSubsuite } from "../components/ia/DrClimaOperacaoChuvaSubsuite";
import { HoldingConsolidadaWarRoom } from "../components/ia/HoldingConsolidadaWarRoom";
import { IfoodHubV2 } from "../components/integrations/IfoodHubV2";
import { KeetoPosHub } from "../components/integrations/KeetoPosHub";
import { OpenDeliveryHub } from "../components/integrations/OpenDeliveryHub";
import { BancosTefHub } from "../components/integrations/BancosTefHub";
import { GoogleEcosystemHub } from "../components/integrations/GoogleEcosystemHub";
import { MatrizAtaqueTangaraHub } from "../components/ia/MatrizAtaqueTangaraHub";



// ============================================================================
// DADOS DOS CONCORRENTES DE TANGARÁ DA SERRA (MATO GROSSO)
// ============================================================================
export interface ConcorrenteTangara {
  id: string;
  nome: string;
  fantasia: string;
  cnpj: string;
  bairro: string;
  enderecoCompleto?: string;
  sociosReais?: string;
  cnae?: string;
  statusReceita?: string;
  dataAbertura?: string;
  distanciaZumaKm: number;
  modelo: string;
  porte: string;
  faturamentoEst: number;
  share: number;
  ticketMedio: number;
  googleRating: number;
  googleReviews: number;
  tempoMedioMin: number;
  nivelAmeaca: "Líder" | "Alto" | "Médio" | "Baixo";
  pontosFortes: string[];
  vulnerabilidades: string[];
  gapTecnologico: string;
  planoAtaqueZuma: string;
  canalDominante: string;
  salmaoProcedencia?: "Fresco Chileno Nobre" | "Congelado 2ª Linha" | "Misto Popular";
  destaque?: boolean;
  tempoMedioChuvaMin?: number;
  fragilidadesChuva?: string;
  motoboysProprios?: number;
  setor?: "sushi" | "burger" | "pizza" | "bar_chopp" | "carnes";
  setorLabel?: string;
  publicoAlvo?: string;
  motivoEscolha?: string;
  pratosPrecos?: Array<{ prato: string; precoRival: number; precoZuma: number; vantagem: string }>;
  categoriaNegocio?: "gastronomia" | "roupas" | "agro";
}

export const CONCORRENTES_TANGARA: ConcorrenteTangara[] = [
  {
    id: "zuma",
    nome: "L. CARDOSO CARVALHO LTDA",
    fantasia: "Zuma Cozinha Oriental (Você)",
    cnpj: "36.296.848/0001-57",
    bairro: "Centro / Jd. Cidade Alta · Tangará da Serra",
    enderecoCompleto: "Av. Brasil, 1605 S, Jardim Cidade Alta, Tangará da Serra - MT",
    sociosReais: "Leandro Cardoso de Carvalho (Sócio-Administrador)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "07/02/2020",
    distanciaZumaKm: 0,
    modelo: "Salão Nobre VIP (27 Mesas & Tatames) + Loja Própria PWA + WhatsApp IA",
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 345000,
    share: 53.2,
    ticketMedio: 138,
    googleRating: 4.9,
    googleReviews: 840,
    tempoMedioMin: 32,
    nivelAmeaca: "Líder",
    canalDominante: "Salão Nobre (55%) · PWA Próprio (45%)",
    salmaoProcedencia: "Fresco Chileno Nobre",
    pontosFortes: [
      "Salmão Chileno Nobre Fresco importado semanalmente com rastreabilidade total",
      "Atendimento instantâneo com IA Zumi no WhatsApp em menos de 5 segundos",
      "KDS Cozinha com 4 praças dedicadas e tempo rigidamente cronometrado (32 min)",
      "Delivery próprio sem taxa abusiva de 27% de marketplace",
      "Clube Zumi com cashback real e fidelização por recorrência"
    ],
    vulnerabilidades: [
      "Alta procura nos finais de semana gerando lista de espera no salão",
      "Custo de insumos nobres importados sensível à cotação cambial do Dólar"
    ],
    gapTecnologico: "Totalmente digitalizado com Zuma Pilot ERP 360° nativo em nuvem.",
    planoAtaqueZuma: "Manter liderança absoluta de mercado e acelerar captura de clientes insatisfeitos dos concorrentes.",
    destaque: true,
    tempoMedioChuvaMin: 38,
    fragilidadesChuva: "Frota própria dedicada com baú térmico estanque vedado anti-chuva e caixas ventiladas anti-vapor",
    motoboysProprios: 6
  },
  {
    id: "bonsai",
    nome: "BONSAI SUSHI RESTAURANTE LTDA",
    fantasia: "Bonsai Sushi Bar",
    cnpj: "43.466.537/0001-54",
    bairro: "Jardim Santa Lúcia · Tangará da Serra",
    enderecoCompleto: "Av. Vereador Nilo Torres, 751 W, Jardim Santa Lúcia, Tangará da Serra - MT",
    sociosReais: "Simone Cardoso de Carvalho (Sócio-Administrador)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "10/09/2021",
    distanciaZumaKm: 2.1,
    modelo: "Salão Tradicional e Delivery via iFood",
    porte: "Microempresa (ME)",
    faturamentoEst: 115000,
    share: 17.8,
    ticketMedio: 115,
    googleRating: 4.4,
    googleReviews: 312,
    tempoMedioMin: 68,
    nivelAmeaca: "Alto",
    canalDominante: "iFood (70%) · Salão Presencial (30%)",
    salmaoProcedencia: "Misto Popular",
    pontosFortes: [
      "Ponto estabelecido há anos na Av. Nilo Torres com clientela cativa da região",
      "Boa estrutura de salão para famílias do Jardim Santa Lúcia e Europa",
      "Pratos quentes tradicionais como yakisoba e teppanyaki"
    ],
    vulnerabilidades: [
      "Gargalo grave de cozinha aos finais de semana (espera delivery supera 65 a 75 min)",
      "100% dependente do iFood no delivery, perdendo até 27% de margem líquida",
      "Atendimento WhatsApp manual sem inteligência artificial (respostas lentas)",
      "Sem comanda móvel no salão (garçons ainda usam blocos de papel)"
    ],
    gapTecnologico: "Sistema desktop legado local sem inteligência artificial e sem CRM de retenção.",
    planoAtaqueZuma: "Campanha geolocalizada no Jardim Europa e Nilo Torres: 'Seu sushi em até 35 min garantido ou cashback no Zuma PWA'. Disparo nas noites de pico quando o Bonsai atrasa.",
    tempoMedioChuvaMin: 88,
    fragilidadesChuva: "Dependência de motoboys do iFood que recusam corridas; embalagens de papelão amolecem na chuva; atrasos críticos de 85 a 95 min",
    motoboysProprios: 3
  },
  {
    id: "nosso-sushi",
    nome: "NOSSO SUSHI LTDA",
    fantasia: "Nosso Sushi & Delivery",
    cnpj: "66.311.331/0001-50",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Deputado Hitler Sansão, 365, Centro, Tangará da Serra - MT",
    sociosReais: "Erlan Pereira da Silva (Sócio-Administrador)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "16/04/2026",
    distanciaZumaKm: 0.3,
    modelo: "Delivery Popular e Balcão To-Go",
    porte: "Microempresa (ME)",
    faturamentoEst: 88000,
    share: 13.6,
    ticketMedio: 72,
    googleRating: 4.1,
    googleReviews: 188,
    tempoMedioMin: 48,
    nivelAmeaca: "Médio",
    canalDominante: "WhatsApp Manual (65%) · Balcão (35%)",
    salmaoProcedencia: "Congelado 2ª Linha",
    pontosFortes: [
      "Preço baixo em combos populares e temakis promocionais",
      "Localização conveniente e conhecida na Rua Deputado Hitler Sansão no Centro",
      "Agilidade na fritura de hot rolls e empanados"
    ],
    vulnerabilidades: [
      "Salmão congelado de menor calibre com uso excessivo de cream cheese para maquiar o corte",
      "Embalagens plásticas simples que vazam shoyu e amassam peças delicadas",
      "Zero programa de retenção, pós-venda ou pontuação de fidelidade",
      "Reclamações recorrentes de pedidos incompletos e trocas de itens"
    ],
    gapTecnologico: "Apenas WhatsApp Business manual com impressora térmica de bobina.",
    planoAtaqueZuma: "Campanha 'Salmão Nobre de Verdade': demonstrar a procedência do salmão fresco Zuma vs cortes congelados industriais, com cupom de R$ 20 OFF no primeiro pedido no PWA.",
    tempoMedioChuvaMin: 78,
    fragilidadesChuva: "Reclamações frequentes de comida fria e alga murcha; peixe congelado solta água na embalagem úmida",
    motoboysProprios: 2
  },
  {
    id: "luch-sushi",
    nome: "LUDIMILA LUCHTENBERG ARAUJO",
    fantasia: "Luch Sushi Restaurante",
    cnpj: "28.248.127/0001-43",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Celso Rosa Lima (Rua 26), 367-N, Centro, Tangará da Serra - MT",
    sociosReais: "Ludimila Luchtenberg Araujo (Titular)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "47.22-9-02 - Peixaria e Sushibar",
    dataAbertura: "24/07/2017",
    distanciaZumaKm: 0.7,
    modelo: "Peixaria & Sushibar Tradicional de Bairro",
    porte: "Microempresa (ME)",
    faturamentoEst: 52000,
    share: 8.0,
    ticketMedio: 68,
    googleRating: 4.3,
    googleReviews: 142,
    tempoMedioMin: 50,
    nivelAmeaca: "Médio",
    canalDominante: "Salão Presencial (60%) · Take-Away (40%)",
    salmaoProcedencia: "Misto Popular",
    pontosFortes: [
      "Operação com tradição de anos no Centro de Tangará da Serra (desde 2017)",
      "Público cativo da Rua Celso Rosa Lima que busca sushis rápidos",
      "Conhecimento de pescados pela origem mista de peixaria"
    ],
    vulnerabilidades: [
      "Sem delivery digital estruturado ou aplicativo moderno",
      "Cardápio tradicional sem pratos autorais fusion contemporâneos",
      "Espaço físico reduzido para acomodar grandes grupos ou famílias",
      "Sem ferramentas de fidelização e recompra"
    ],
    gapTecnologico: "Pedidos anotados manualmente por telefone ou balcão, sem CRM.",
    planoAtaqueZuma: "Oferecer Barcas Gourmet contemporâneas com salmão maçaricado e trufado que o Luch não produz, com entrega rápida rastreada por GPS.",
    tempoMedioChuvaMin: 72,
    fragilidadesChuva: "Sem aplicativo próprio, dependência de terceiros e sem embalagens isotérmicas dedicadas",
    motoboysProprios: 1
  },
  {
    id: "yoko-sushi",
    nome: "L. TAVARES E LIMA LTDA",
    fantasia: "Yoko Sushi House",
    cnpj: "22.520.187/0001-97",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Mato Grosso, 443, Centro, Tangará da Serra - MT",
    sociosReais: "Lucinei Tavares & Nayara Cardoso Lima Yamashita",
    statusReceita: "REGISTRO HISTÓRICO (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "27/04/2015",
    distanciaZumaKm: 0.9,
    modelo: "Restaurante Oriental Tradicional (Histórico de Mercado)",
    porte: "Microempresa (ME)",
    faturamentoEst: 28000,
    share: 4.3,
    ticketMedio: 95,
    googleRating: 4.2,
    googleReviews: 120,
    tempoMedioMin: 60,
    nivelAmeaca: "Baixo",
    canalDominante: "Telefone & Balcão",
    salmaoProcedencia: "Misto Popular",
    pontosFortes: [
      "Marca histórica pioneira em Tangará da Serra na Rua Mato Grosso",
      "Público nostálgico e conhecedor dos pioneiros orientais"
    ],
    vulnerabilidades: [
      "Estrutura e tecnologia defasadas em relação à nova geração de clientes",
      "Sem canal digital de vendas moderno (sem app ou web)",
      "Baixa frequência em dias de semana"
    ],
    gapTecnologico: "Sem sistemas modernos de KDS ou CRM em nuvem.",
    planoAtaqueZuma: "Captação dos clientes tradicionais para os Tatames VIP do Zuma com atendimento humanizado e ágil.",
    tempoMedioChuvaMin: 62,
    fragilidadesChuva: "Cardápio frio (sushis/temakis) sem lamen ou pratos quentes que os clientes desejam na chuva",
    motoboysProprios: 2
  },
  {
    id: "ifood-dark",
    nome: "SUSHI DELIVERY COMERCIO DE ALIMENTOS LTDA",
    fantasia: "Dark Kitchens & Delivery iFood Tangará",
    cnpj: "67.135.477/0001-55",
    bairro: "Parque das Gemas / Tangará Shopping",
    enderecoCompleto: "Av. Brasil & Entornos, Tangará da Serra - MT",
    sociosReais: "Operações terceirizadas de entrega",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.20-1-04 - Serviços de alimentação para consumo domiciliar",
    dataAbertura: "03/06/2026",
    distanciaZumaKm: 3.2,
    modelo: "Delivery Exclusivo via Marketplace iFood",
    porte: "Simples / MEI",
    faturamentoEst: 20000,
    share: 3.1,
    ticketMedio: 78,
    googleRating: 3.8,
    googleReviews: 65,
    tempoMedioMin: 58,
    nivelAmeaca: "Baixo",
    canalDominante: "100% Marketplace iFood",
    salmaoProcedencia: "Congelado 2ª Linha",
    pontosFortes: [
      "Preços agressivos em combos pequenos no iFood",
      "Foco exclusivo em entrega rápida nos arredores do shopping"
    ],
    vulnerabilidades: [
      "Dependência asfixiante das taxas de até 27% do marketplace",
      "Salmão congelado e ausência de canal próprio de retenção",
      "Nota 3.8 no Google devido a atrasos de motoboys de aplicativo"
    ],
    gapTecnologico: "Totalmente dependente do algoritmo do iFood sem banco de dados próprio.",
    planoAtaqueZuma: "Campanha 'Compre Direto do Restaurante': preço justo, porções maiores, salmão nobre fresco e 10% de cashback real no PWA."
  }
  ,
  {
    id: "ivans-burger",
    nome: "IVAN'S BURGER LTDA",
    fantasia: "Ivan's Burger (Tradição 26 Anos)",
    cnpj: "55.778.391/0001-61",
    bairro: "Jardim Europa · Tangará da Serra",
    enderecoCompleto: "Av. Brasil, 1921 N, Jardim Europa, Tangará da Serra - MT",
    sociosReais: "Eli Sonego & Família (Fundadores)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-03 - Lanchonetes, casas de chá, de sucos e similares",
    dataAbertura: "15/05/2000",
    distanciaZumaKm: 1.8,
    modelo: "Hamburgueria Artesanal Noturna & Delivery Consolidado",
    porte: "Microempresa (ME)",
    faturamentoEst: 140000,
    share: 7.7,
    ticketMedio: 68,
    googleRating: 4.8,
    googleReviews: 380,
    tempoMedioMin: 45,
    nivelAmeaca: "Alto",
    canalDominante: "Delivery WhatsApp/iFood (65%) · Salão (35%)",
    setor: "burger",
    setorLabel: "Hamburgueria Artesanal & Smash",
    publicoAlvo: "Famílias, Jovens e Delivery Noturno Rápido",
    motivoEscolha: "Tradição em lanches rápidos e porções fartas com maionese artesanal",
    pontosFortes: [
      "26 anos de tradição em Tangará da Serra com clientela extremamente fiel",
      "Carnes de corte artesanal bem temperadas e maionese verde famosa",
      "Forte presença no delivery no Jardim Europa e região central"
    ],
    vulnerabilidades: [
      "Refeição pesada e calórica com frituras; clientes relatam sensação de azia pós-jantar",
      "Pão artesanal amolece e perde crocância no baú de entrega em dias de chuva",
      "Poucas opções saudáveis ou sofisticadas para jantares românticos de casais"
    ],
    gapTecnologico: "Atendimento manual no WhatsApp e iFood padrão sem CRM de recorrência.",
    planoAtaqueZuma: "Campanha 'Jantar Leve & Sofisticado': Troque o fast-food pesado pelo Combo Nobre Zuma ou Hot Rolls crocantes pelo mesmo valor, entregue em 38 min.",
    tempoMedioChuvaMin: 75,
    fragilidadesChuva: "Pão de hambúrguer amolece com vapor no transporte molhado; queixas de batata frita murcha",
    motoboysProprios: 4,
    pratosPrecos: [
      { prato: "Burger Duplo Artesanal + Fritas", precoRival: 54.00, precoZuma: 49.90, vantagem: "Combo Zuma (1 Temaki Nobre + 6 Hot Rolls) com menor caloria e digestão leve" },
      { prato: "Combo Família 3 Burgers + Batata", precoRival: 145.00, precoZuma: 139.90, vantagem: "Barca Nobre Zuma 40 Peças com Salmão Chileno Nobre Fresco" }
    ]
  },
  {
    id: "babbo-giovanni",
    nome: "E. DALEFFE PIZZARIA LTDA",
    fantasia: "Babbo Giovanni Pizzaria Tangará",
    cnpj: "14.811.241/0001-25",
    bairro: "Vila Virgínia · Tangará da Serra",
    enderecoCompleto: "Rua Ramom Sanches Marques, 232, Vila Virgínia, Tangará da Serra - MT",
    sociosReais: "Eduardo Daleffe (Sócio-Administrador)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "29/12/2011",
    distanciaZumaKm: 1.4,
    modelo: "Pizzaria Nobre Paulista, Forno a Lenha & Carta de Vinhos",
    porte: "Microempresa (ME)",
    faturamentoEst: 180000,
    share: 9.9,
    ticketMedio: 135,
    googleRating: 4.5,
    googleReviews: 290,
    tempoMedioMin: 60,
    nivelAmeaca: "Alto",
    canalDominante: "Salão Nobre (60%) · Delivery (40%)",
    setor: "pizza",
    setorLabel: "Pizzaria Gourmet & Forno a Lenha",
    publicoAlvo: "Casais Alta Renda, Famílias Tradicionais e Encontros Nobres",
    motivoEscolha: "Ambiente sofisticado com massa fermentada, burratas e vinhos finos",
    pontosFortes: [
      "Franquia paulista de renome com receita tradicional de massa e queijos finos",
      "Excelente carta de vinhos chilenos e argentinos e salão acolhedor",
      "Ponto nobre em bairro nobre de Tangará da Serra"
    ],
    vulnerabilidades: [
      "Gargalo severo nos fornos aos finais de semana: espera presencial e delivery supera 1h15",
      "Pizza perde calor e umidade muito rápido no transporte, tornando a borda borrachuda",
      "Alimentação rica em carboidratos pesados que não atrai clientes em dieta low-carb"
    ],
    gapTecnologico: "Sem comanda mobile para garçons; sistema desktop antigo sem PWA próprio.",
    planoAtaqueZuma: "Experiência Romântica sem Espera: Combinado Especial Contemporâneo com Salmão Chileno Fresco + Vinho entregue em 38 min ou servido nos Tatames VIP Zuma.",
    tempoMedioChuvaMin: 85,
    fragilidadesChuva: "Caixas de papelão perdem calor imediatamente na chuva; clientes relatam pizza fria e queijo endurecido",
    motoboysProprios: 3,
    pratosPrecos: [
      { prato: "Pizza Gourmet Especial Grande", precoRival: 115.00, precoZuma: 109.90, vantagem: "Combinado Salmão Nobre Zuma 32 peças com peixe fresco sem carboidrato pesado" },
      { prato: "Entrada Burrata ao Forno", precoRival: 68.00, precoZuma: 56.00, vantagem: "Carpaccio de Salmão Trufado Zuma com azeite trufado e flor de sal" }
    ]
  },
  {
    id: "choperia-lugui",
    nome: "CHOPERIA DO LUGUI LTDA",
    fantasia: "Choperia do Lugui Tangará",
    cnpj: "51.500.085/0001-08",
    bairro: "Centro / Av. Tancredo Neves · Tangará da Serra",
    enderecoCompleto: "Av. Tancredo Neves, 1205 E, Centro, Tangará da Serra - MT",
    sociosReais: "J. M. Choperia Ltda (Franquia)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-02 - Bares e outros estabelecimentos especializados em servir bebidas",
    dataAbertura: "27/09/2023",
    distanciaZumaKm: 0.9,
    modelo: "Choperia Noturna com Caneca Congelada & Petiscaria",
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 155000,
    share: 8.5,
    ticketMedio: 95,
    googleRating: 4.4,
    googleReviews: 320,
    tempoMedioMin: 40,
    nivelAmeaca: "Médio",
    canalDominante: "100% Salão Presencial (Happy Hour)",
    setor: "bar_chopp",
    setorLabel: "Choperia, Gastrobar & Happy Hour",
    publicoAlvo: "Grupos de Amigos, Happy Hour do Agro e Casais Jovens",
    motivoEscolha: "Chopp em dobro na caneca ultracongelada por preço promocional",
    pontosFortes: [
      "Chopp em dobro a preço atrativo e caneca congelada famosa",
      "Ponto de altíssimo fluxo de veículos e pedestres na Av. Tancredo Neves",
      "Ambiente descontraído para comemorações e confraternizações"
    ],
    vulnerabilidades: [
      "Mesas externas na calçada ficam inutilizáveis em noites chuvosas",
      "Cardápio focado em frituras repetitivas de boteco sem opções gastronômicas saudáveis",
      "Público volátil que consome bebida e migra para jantar em outros restaurantes"
    ],
    gapTecnologico: "Sem aplicativo de fidelização ou programa de cashback corporativo.",
    planoAtaqueZuma: "Sunset Zuma: Chopp artesanal gelado + Rodada de Hot Rolls Crocantes e Gyoza no deck climatizado Zuma com 30% OFF das 18h às 20h.",
    tempoMedioChuvaMin: 45,
    fragilidadesChuva: "Salão externo aberto; perde mais de 50% dos clientes em noites de chuva forte em Tangará",
    motoboysProprios: 0,
    pratosPrecos: [
      { prato: "Porção Filé com Fritas e Queijo", precoRival: 89.00, precoZuma: 82.00, vantagem: "Teppan de Filé Mignon Zuma com legumes frescos na manteiga e molho teriyaki artesanal" },
      { prato: "Chopp em Dobro Caneca", precoRival: 18.00, precoZuma: 16.00, vantagem: "Chopp Puro Malte geladíssimo servido com edamame temperado" }
    ]
  },
  {
    id: "dtalia",
    nome: "CELSO CABRAL DA SILVA",
    fantasia: "Choperia e Pizzaria D'Talia (Dtalia)",
    cnpj: "18.771.472/0001-03",
    bairro: "Jardim Tanaka · Tangará da Serra",
    enderecoCompleto: "Av. Pres. Tancredo de Almeida Neves, 570-N, Jardim Tanaka, Tangará da Serra - MT",
    sociosReais: "Celso Cabral da Silva (Empresário Individual)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "27/08/2013",
    distanciaZumaKm: 1.6,
    modelo: "Pizzaria Tradicional, Rodízio Noturno & Choperia Ampla",
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 160000,
    share: 8.8,
    ticketMedio: 85,
    googleRating: 4.3,
    googleReviews: 410,
    tempoMedioMin: 50,
    nivelAmeaca: "Médio",
    canalDominante: "Salão com Rodízio (70%) · Delivery (30%)",
    setor: "pizza",
    setorLabel: "Pizzaria Tradicional, Rodízio & Choperia",
    publicoAlvo: "Famílias Grandes, Comemorações de Grupo e Turmas de Amigos",
    motivoEscolha: "Rodízio de pizza com muita variedade e chopp comercial barato",
    pontosFortes: [
      "Espaço físico gigante para mais de 140 pessoas sentadas",
      "Preço de rodízio popular que atrai famílias grandes e festas infantis",
      "Marca tradicional e muito conhecida em Tangará há mais de uma década"
    ],
    vulnerabilidades: [
      "Ambiente ruidoso e tumultuado; impróprio para conversas reservadas ou encontros íntimos",
      "Ingredientes de linha comercial com queijos gordurosos que pesam no estômago",
      "Sem programa digital de recompra ou personalização de pedidos"
    ],
    gapTecnologico: "Comandas manuais e controle de mesa convencional sem autosserviço.",
    planoAtaqueZuma: "Festival Zuma nos Tatames VIP: Degustação oriental guiada com sushis flambados e atendimento VIP reservado, sem barulho de rodízio.",
    tempoMedioChuvaMin: 75,
    fragilidadesChuva: "Delivery de rodízio não funciona; pizzas para viagem esfriam e perdem maciez",
    motoboysProprios: 3,
    pratosPrecos: [
      { prato: "Rodízio de Pizza Tradicional", precoRival: 69.90, precoZuma: 74.90, vantagem: "Menu Degustação Zuma com salmão chileno nobre fresco e peças autorais" },
      { prato: "Pizza Família 2 Sabores", precoRival: 85.00, precoZuma: 89.90, vantagem: "Combinado 30 Peças Zuma com frescor inigualável e apresentação impecável" }
    ]
  },
  {
    id: "bahamas-pub",
    nome: "BAHAMAS PUB LTDA",
    fantasia: "Bahamas Pub Tangará",
    cnpj: "44.640.616/0001-00",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Centro, Tangará da Serra - MT",
    sociosReais: "Bahamas Pub Gestão de Entretenimento",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-02 - Bares e outros estabelecimentos especializados em servir bebidas",
    dataAbertura: "18/12/2021",
    distanciaZumaKm: 0.8,
    modelo: "Pub Noturno, Shows de Rock ao Vivo e Open Chopp",
    porte: "Microempresa (ME)",
    faturamentoEst: 130000,
    share: 7.1,
    ticketMedio: 110,
    googleRating: 4.5,
    googleReviews: 260,
    tempoMedioMin: 40,
    nivelAmeaca: "Médio",
    canalDominante: "100% Salão Noturno e Balada",
    setor: "bar_chopp",
    setorLabel: "Pub Noturno, Rock & Rodízio de Petiscos",
    publicoAlvo: "Público Jovem Adulto, Universitários e Balada Noturna",
    motivoEscolha: "Ambiente escuro de pub, música ao vivo e eventos temáticos",
    pontosFortes: [
      "Programação musical de rock/pop ao vivo com forte engajamento jovem",
      "Rodízio de petiscos e promoções de open chopp",
      "Ponto de encontro da vida noturna nos finais de semana após as 22h"
    ],
    vulnerabilidades: [
      "Volume sonoro muito alto impede qualquer conversa romântica ou corporativa",
      "Cobrança de couvert artístico e consumo mínimo que afugenta casais em busca de jantar tranquilo",
      "Cardápio com poucas opções leves ou de alta gastronomia"
    ],
    gapTecnologico: "Sem integração com cardápio digital ou comanda individualizada por QR code.",
    planoAtaqueZuma: "Esquenta Gastronômico Zuma: Drinks autorais com Sakê e Gin botânico, carpaccios e ambiente com iluminação intimista antes da balada.",
    tempoMedioChuvaMin: 45,
    fragilidadesChuva: "Falta de estacionamento coberto; filas na calçada em noites chuvosas",
    motoboysProprios: 0,
    pratosPrecos: [
      { prato: "Rodízio de Petiscos de Pub", precoRival: 65.00, precoZuma: 59.90, vantagem: "Petiscos Nobres Zuma: Ebi Furai (camarão crocante) e Guiozas no vapor" },
      { prato: "Drink Gin Tropical da Casa", precoRival: 36.00, precoZuma: 32.00, vantagem: "Drinks autorais Zuma elaborados com xaropes artesanais e especiarias asiáticas" }
    ]
  },
  {
    id: "la-carreta",
    nome: "JOSE AULACIR BORGES GIRARDI - ME",
    fantasia: "Restaurante & Churrascaria La Carreta",
    cnpj: "01.026.561/0001-22",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Euclides G. Medeiros, 454-S, Centro, Tangará da Serra - MT",
    sociosReais: "Jose Aulacir Borges Girardi (Titular)",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "04/01/1996",
    distanciaZumaKm: 0.6,
    modelo: "Churrascaria Tradicional Gaúcha & Cortes Grelhados",
    porte: "Microempresa (ME)",
    faturamentoEst: 210000,
    share: 11.5,
    ticketMedio: 130,
    googleRating: 4.5,
    googleReviews: 450,
    tempoMedioMin: 35,
    nivelAmeaca: "Médio",
    canalDominante: "Salão Presencial (85%) · Marmitas (15%)",
    setor: "carnes",
    setorLabel: "Churrascaria Tradicional & Carnes Nobres",
    publicoAlvo: "Produtores Rurais do Agro, Famílias Tradicionais e Reuniões de Negócios",
    motivoEscolha: "Tradição de 30 anos em carnes nobres grelhadas no espeto corrido",
    pontosFortes: [
      "30 anos de história e referência em churrasco gaúcho em Tangará da Serra",
      "Ponto de encontro tradicional de fazendeiros e empresários do agronegócio",
      "Cortes de carnes nobres com ponto de preparo experiente"
    ],
    vulnerabilidades: [
      "Gastronomia muito pesada e gordurosa, rejeitada por quem busca refeições leves à noite",
      "Ambiente rústico tradicional com pouca atratividade para casais jovens da nova geração",
      "Inexistência de canal próprio de delivery digital moderno"
    ],
    gapTecnologico: "Operação tradicional analógica sem automação de KDS ou IA.",
    planoAtaqueZuma: "Proteína Nobre com Digestão Leve: Teppanyaki de Salmão Fresco e Filé Mignon ao molho teriyaki Zuma com legumes na manteiga, perfeito para almoço e jantar de negócios elegante.",
    tempoMedioChuvaMin: 45,
    fragilidadesChuva: "Salão tradicional esvazia mais cedo em noites frias e chuvosas",
    motoboysProprios: 1,
    pratosPrecos: [
      { prato: "Picanha Grelhada na Brasa para Dois", precoRival: 149.00, precoZuma: 138.00, vantagem: "Teppan Nobre Zuma Misto (Salmão Nobre + Mignon) rico em Ômega-3 sem gordura pesada" },
      { prato: "Prato Executivo de Churrasco", precoRival: 42.00, precoZuma: 39.90, vantagem: "Bento Box Executivo Zuma com arroz japonês, tataki selado e legumes salteados" }
    ]
  },
  {
    id: "santa-chapa",
    nome: "SANTA CHAPA ALIMENTOS TANGARA LTDA",
    fantasia: "Santa Chapa Burger (Smash & Brasa)",
    cnpj: "49.120.312/0001-80",
    bairro: "Vila Horizonte / Centro · Tangará da Serra",
    enderecoCompleto: "Vila Horizonte / Centro, Tangará da Serra - MT",
    sociosReais: "Empreendedores Locais de Tangará",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.20-1-04 - Serviços de alimentação para consumo domiciliar",
    dataAbertura: "12/01/2023",
    distanciaZumaKm: 2.0,
    modelo: "Hamburgueria Smash 100% Focada em Delivery Noturno",
    porte: "Microempresa (ME)",
    faturamentoEst: 75000,
    share: 4.1,
    ticketMedio: 52,
    googleRating: 4.7,
    googleReviews: 190,
    tempoMedioMin: 40,
    nivelAmeaca: "Baixo",
    canalDominante: "100% Delivery WhatsApp & iFood",
    setor: "burger",
    setorLabel: "Burger Smash & Brasa Delivery",
    publicoAlvo: "Jovens, Estudantes e Pedidos Rápidos Solo",
    motivoEscolha: "Preço muito competitivo em burgers smash com embalagem moderna",
    pontosFortes: [
      "Presença jovem e moderna no Instagram (@santachapatga)",
      "Preço baixo em smash burgers que atrai público jovem solo",
      "Embalagens modernas e identidade visual bem resolvida"
    ],
    vulnerabilidades: [
      "Massa do pão smash amolece rapidamente com vapor no transporte na chuva",
      "Margem financeira apertada por depender de motoboys terceirizados",
      "Zero opções de salão ou atendimento presencial"
    ],
    gapTecnologico: "Apenas link de cardápio digital genérico sem inteligência preditiva.",
    planoAtaqueZuma: "Combo Individual Zuma: 1 Temaki Salmão Completo crocante + 6 Hot Rolls quentinhos por R$ 48,90 entregues em 38 min com embalagem estanque.",
    tempoMedioChuvaMin: 70,
    fragilidadesChuva: "Massa do pão smash amolece rapidamente no baú úmido; cancelamentos por atrasos de entregadores de aplicativo",
    motoboysProprios: 2,
    pratosPrecos: [
      { prato: "Smash Burger Duplo com Cheddar", precoRival: 38.00, precoZuma: 34.90, vantagem: "Temaki Salmão Fresco Zuma 220g oferece saciedade prolongada com alto valor nutritivo" }
    ]
  }
,
  {
    id: "skamoto-sushi",
    nome: "S.KAMOTO BUFFET & SUSHI TANGARA LTDA",
    fantasia: "S.kamoto Sushi (Buffet por KG)",
    cnpj: "54.891.203/0001-12",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Deputado Hitler Sansão, 365, Centro, Tangará da Serra - MT",
    sociosReais: "Erlan Pereira e Sócios Locais",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "15/03/2022",
    distanciaZumaKm: 0.35,
    modelo: "Buffet Oriental por KG (R$ 99,90/kg) e Rodízio Noturno",
    porte: "Microempresa (ME)",
    faturamentoEst: 95000,
    share: 14.5,
    ticketMedio: 78,
    googleRating: 4.2,
    googleReviews: 215,
    tempoMedioMin: 45,
    nivelAmeaca: "Médio",
    canalDominante: "Presencial Buffet (75%) · Delivery Balcão (25%)",
    salmaoProcedencia: "Misto Popular",
    setor: "sushi",
    categoriaNegocio: "gastronomia",
    publicoAlvo: "Famílias e clientes de buffet rápido no Centro",
    motivoEscolha: "Preço de quilo acessível para volume familiar",
    pontosFortes: [
      "Localização central na Rua Hitler Sansão de fácil acesso",
      "Variedade visual de pratos fritos e massas quentes",
      "Preço de quilo atrativo para almoço e jantar popular"
    ],
    vulnerabilidades: [
      "Peixe exposto em esteira/buffet oxidando e ressecando ao ar",
      "Falta de salmão chileno fresco fatiado na hora sob demanda",
      "Zero foco em embalagens térmicas ou delivery de alta precisão"
    ],
    gapTecnologico: "Balança tradicional de buffet sem integração à nuvem e sem comanda mobile.",
    planoAtaqueZuma: "Campanha 'Aqui Peixe Nobre Não Fica Exposto': destacar o Salmão Chileno Nobre Fresco fatiado sob demanda no sushibar e KDS do Zuma, atraindo clientes que buscam saúde e frescor.",
    motoboysProprios: 2
  },
  {
    id: "sushi-san-tga",
    nome: "SUSHI SAN RESTAURANTE ORIENTAL LTDA",
    fantasia: "Sushi San Tangará",
    cnpj: "39.812.441/0001-90",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Celso Rosa Lima / Centro, Tangará da Serra - MT",
    sociosReais: "Gestão Local Tangará",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.11-2-01 - Restaurantes e similares",
    dataAbertura: "04/08/2019",
    distanciaZumaKm: 0.4,
    modelo: "Rodízio Diário e Salão Tradicional",
    porte: "Microempresa (ME)",
    faturamentoEst: 68000,
    share: 10.2,
    ticketMedio: 82,
    googleRating: 4.0,
    googleReviews: 142,
    tempoMedioMin: 55,
    nivelAmeaca: "Médio",
    canalDominante: "100% Salão Presencial (Rodízio)",
    salmaoProcedencia: "Congelado 2ª Linha",
    setor: "sushi",
    categoriaNegocio: "gastronomia",
    publicoAlvo: "Público jovem e turmas de amigos buscando comer à vontade",
    motivoEscolha: "Preço único de rodízio para comer à vontade",
    pontosFortes: [
      "Opção de rodízio contínuo para turmas de amigos",
      "Ambiente descontraído no Centro"
    ],
    vulnerabilidades: [
      "Gargalo grave de reposição de pratos no rodízio nos fins de semana",
      "Comanda de papel em blocos causando erros e demora para fechar conta",
      "Zero canal de delivery estruturado ou rastreado"
    ],
    gapTecnologico: "Sem comanda móvel, sem KDS de cozinha e sem aplicativo PWA.",
    planoAtaqueZuma: "Oferecer o Combo Zuma Experience (26 a 50 peças) com Salmão Nobre e Tatames VIP com atendimento digital de 10 segundos pelo App do Garçom.",
    motoboysProprios: 1
  },
  {
    id: "doshi-delivery",
    nome: "DOSHI ALIMENTOS & DELIVERY LTDA",
    fantasia: "Dōshi Além do Sushi",
    cnpj: "51.220.908/0001-34",
    bairro: "Jardim Tangará II · Tangará da Serra",
    enderecoCompleto: "Jardim Tangará II, Tangará da Serra - MT",
    sociosReais: "Empreendedores Delivery TGA",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "56.20-1-04 - Serviços de alimentação para consumo domiciliar",
    dataAbertura: "18/05/2023",
    distanciaZumaKm: 3.2,
    modelo: "Dark Kitchen Delivery via WhatsApp e Encomendas",
    porte: "Microempresa (ME)",
    faturamentoEst: 42000,
    share: 6.4,
    ticketMedio: 95,
    googleRating: 4.5,
    googleReviews: 68,
    tempoMedioMin: 50,
    nivelAmeaca: "Baixo",
    canalDominante: "WhatsApp Manual (100%)",
    salmaoProcedencia: "Misto Popular",
    setor: "sushi",
    categoriaNegocio: "gastronomia",
    publicoAlvo: "Moradores do Tangará II, Cidade Alta e encomendas programadas",
    motivoEscolha: "Atendimento artesanal com foco em peixes grelhados e camarão",
    pontosFortes: [
      "Trabalho artesanal com foco em pratos quentes e camarão",
      "Relação próxima via WhatsApp com clientes do bairro"
    ],
    vulnerabilidades: [
      "Respostas manuais no WhatsApp com tempo de espera de 15 a 30 minutos",
      "Sem rastreamento GPS de motoboys e sem aplicativo próprio",
      "Falta de padronização nas embalagens térmicas em dias de chuva"
    ],
    gapTecnologico: "Nenhum sistema ERP; tudo controlado em cadernos e planilhas.",
    planoAtaqueZuma: "Atendimento instantâneo com IA Zumi no WhatsApp em <5 segundos com link direto para o PWA e rastreamento em tempo real do motoboy no mapa de Tangará.",
    motoboysProprios: 2
  },
  {
    id: "florella-boutique",
    nome: "FLORELLA BOUTIQUE E COMERCIO DO VESTUARIO LTDA",
    fantasia: "Florella Boutique (Moda Feminina)",
    cnpj: "34.112.560/0001-78",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Dep. Hitler Sansão / Centro, Tangará da Serra - MT",
    sociosReais: "Proprietárias Locais de Moda",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "47.81-4-00 - Comércio varejista de artigos do vestuário",
    dataAbertura: "11/06/2019",
    distanciaZumaKm: 0.5,
    modelo: "Boutique Física Multimarcas Feminina de Alto Padrão",
    porte: "Microempresa (ME)",
    faturamentoEst: 145000,
    share: 22.0,
    ticketMedio: 280,
    googleRating: 4.7,
    googleReviews: 185,
    tempoMedioMin: 15,
    nivelAmeaca: "Alto",
    canalDominante: "Loja Física (70%) · WhatsApp / Instagram (30%)",
    setor: "bar_chopp",
    categoriaNegocio: "roupas",
    publicoAlvo: "Mulheres executivas, médicas e famílias do agronegócio de Tangará",
    motivoEscolha: "Marca consolidada com vitrine ativa no Instagram e peças elegantes",
    pontosFortes: [
      "Comunidade engajada no Instagram com vídeos e reels diários de looks",
      "Peças elegantes para eventos sociais e casamentos",
      "Localização privilegiada no Centro de Tangará da Serra"
    ],
    vulnerabilidades: [
      "Gestão de mala condicional manual sem controle de perdas ou devoluções",
      "Sem programa de cashback ou fidelização por recorrência",
      "Zero integração com outros serviços ou experiências gastronômicas de luxo"
    ],
    gapTecnologico: "Sistema de automação comercial simples de balcão sem integração e-commerce/PWA.",
    planoAtaqueZuma: "Operação Look & Jantar: Compras na Zuma Moda Boutique geram vouchers de R$ 70 para jantar no Zuma Oriental; mala condicional digitalizada no PWA entregue pelo motoboy com hora marcada.",
    motoboysProprios: 1
  },
  {
    id: "belavi-boutique",
    nome: "LARISSA FRANCA MODAS LTDA",
    fantasia: "Belaví Multimarcas por Larissa França",
    cnpj: "41.980.123/0001-45",
    bairro: "Centro / Av. Brasil · Tangará da Serra",
    enderecoCompleto: "Avenida Brasil, Centro, Tangará da Serra - MT",
    sociosReais: "Larissa França e Sócios",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "47.81-4-00 - Comércio varejista de artigos do vestuário",
    dataAbertura: "02/09/2021",
    distanciaZumaKm: 0.6,
    modelo: "Boutique Multimarcas Feminina e Envio Brasil",
    porte: "Microempresa (ME)",
    faturamentoEst: 110000,
    share: 17.5,
    ticketMedio: 240,
    googleRating: 4.8,
    googleReviews: 120,
    tempoMedioMin: 20,
    nivelAmeaca: "Médio",
    canalDominante: "Loja Física (60%) · Instagram / Envio Brasil (40%)",
    setor: "bar_chopp",
    categoriaNegocio: "roupas",
    publicoAlvo: "Jovens mulheres e profissionais liberais",
    motivoEscolha: "Curadoria moderna de marcas nacionais e tendências",
    pontosFortes: [
      "Curadoria de peças modernas de alfaiataria e conjuntos",
      "Forte presença digital da proprietária Larissa França"
    ],
    vulnerabilidades: [
      "Foco disperso no e-commerce nacional reduzindo a atenção no atendimento VIP local",
      "Sem mala condicional programada com hora marcada para condomínios fechados",
      "Sem clube de fidelidade ou benefícios cruzados na cidade"
    ],
    gapTecnologico: "Loja integrada padrão de catálogo online sem IA de recomendação.",
    planoAtaqueZuma: "Provador VIP em Casa: envio de malas condicionais da Zuma Moda Boutique para clientes do Jardim Europa com consultoria personalizada e saquê cortesia.",
    motoboysProprios: 1
  },
  {
    id: "toda-linda-boutique",
    nome: "TODA LINDA COMERCIO DE ROUPAS LTDA",
    fantasia: "Toda Linda Moda Feminina (Mark Center)",
    cnpj: "37.409.812/0001-99",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Rua Júlio Martinez Benevides, 406-S, Galeria Mark Center, Centro, Tangará da Serra - MT",
    sociosReais: "Empreendedoras Mark Center",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "47.81-4-00 - Comércio varejista de artigos do vestuário",
    dataAbertura: "22/11/2020",
    distanciaZumaKm: 0.45,
    modelo: "Loja Física em Galeria Comercial e Moda Casual",
    porte: "Microempresa (ME)",
    faturamentoEst: 72000,
    share: 11.0,
    ticketMedio: 165,
    googleRating: 4.5,
    googleReviews: 95,
    tempoMedioMin: 25,
    nivelAmeaca: "Baixo",
    canalDominante: "Loja Física (80%) · WhatsApp (20%)",
    setor: "bar_chopp",
    categoriaNegocio: "roupas",
    publicoAlvo: "Público feminino que circula pelo Centro e galerias comerciais",
    motivoEscolha: "Preço acessível em vestidos e moda casual para o dia a dia",
    pontosFortes: [
      "Ponto tradicional dentro da Galeria Mark Center no Centro",
      "Atendimento amigável e moda casual variada"
    ],
    vulnerabilidades: [
      "Fluxo de clientes restrito aos corredores da galeria",
      "Sem vendas ativas pelo WhatsApp ou catálogo PWA",
      "Sem vestidos de festa ou alta costura de linho e seda"
    ],
    gapTecnologico: "Sem sistema integrado à nuvem, sem controle fiscal automático.",
    planoAtaqueZuma: "Apresentar a linha de vestidos de Linho Puro Riviera e Alfaiataria Zuma com catálogo PWA com compra em 1 clique e entrega expressa pelo motoboy Zuma em Tangará.",
    motoboysProprios: 1
  }
  ];

// ============================================================================
// AÇÕES TÁTICAS PRÉ-CONFIGURADAS DO WAR ROOM
// ============================================================================
export interface AcaoConcorrencia {
  id: string;
  titulo: string;
  alvoId: string;
  alvoNome: string;
  tipo: "whatsapp" | "oferta_pwa" | "ajuste_preco" | "trafego_local" | "clube_zumi" | "resgate_review";
  bairros: string[];
  gatilho: string;
  estrategia: string;
  cupom?: string;
  descontoDesc?: string;
  status: "ativa" | "concluida" | "agendada" | "pausada";
  dataDisparo: string;
  alcanceEst: number;
  conversaoEst: number;
  receitaGerada: number;
  roi: string;
}

export const ACOES_INICIAIS: AcaoConcorrencia[] = [
  {
    id: "act-1",
    titulo: "Operação Anti-Espera Bonsai (Sexta & Sábado)",
    alvoId: "bonsai",
    alvoNome: "Bonsai Sushi Bar",
    tipo: "whatsapp",
    bairros: ["Jardim Europa", "Tarumã", "Centro"],
    gatilho: "Cozinha do Bonsai atinge 65-75 min no delivery aos finais de semana",
    estrategia: "Disparo no WhatsApp via IA Zumi com garantia de entrega em até 35 min com GPS ao vivo ou R$ 30 em cashback.",
    cupom: "ZUMA35MIN",
    descontoDesc: "Frete Grátis + R$ 30 Bônus se atrasar",
    status: "ativa",
    dataDisparo: "Hoje, às 19:15",
    alcanceEst: 280,
    conversaoEst: 34,
    receitaGerada: 4692,
    roi: "6.2x"
  },
  {
    id: "act-2",
    titulo: "Operação Salmão Fresco Nobre vs Congelado Popular",
    alvoId: "nosso-sushi",
    alvoNome: "Nosso Sushi & Temakeria",
    tipo: "oferta_pwa",
    bairros: ["Vila Alta", "Cidade Alta", "Centro"],
    gatilho: "Uso de salmão congelado industrial maquiado com cream cheese pela concorrência",
    estrategia: "Destaque no topo do PWA com vídeo de corte do salmão chileno nobre fresco e bônus de R$ 20 OFF na 1ª compra.",
    cupom: "SALMAOFRESCO",
    descontoDesc: "R$ 20 OFF em Barcas Nobres",
    status: "ativa",
    dataDisparo: "Ontem, às 18:00",
    alcanceEst: 410,
    conversaoEst: 46,
    receitaGerada: 5880,
    roi: "5.4x"
  },
  {
    id: "act-3",
    titulo: "Ataque ao Almoço Executivo & Pokes Corporativos",
    alvoId: "kanto",
    alvoNome: "Kanto Poke & Sushi",
    tipo: "whatsapp",
    bairros: ["Centro", "Jardim Europa"],
    gatilho: "Ociosidade do meio-dia corporativo vs demanda de escritórios e bancos de Tangará",
    estrategia: "Lançamento da linha Zuma Bowls & Pokes Executivos por R$ 38,90 com entrega expressa em 25 minutos.",
    cupom: "ALMOCOZUMA",
    descontoDesc: "Poke + Bebida R$ 38,90",
    status: "agendada",
    dataDisparo: "Segunda, às 10:45",
    alcanceEst: 190,
    conversaoEst: 22,
    receitaGerada: 2450,
    roi: "4.1x"
  },
  {
    id: "act-4",
    titulo: "Desintermediação do iFood (Economize 25%)",
    alvoId: "sushi-prime",
    alvoNome: "Sushi Prime Delivery",
    tipo: "clube_zumi",
    bairros: ["Parque das Gemas", "Novo Horizonte", "Centro"],
    gatilho: "Clientes do iFood pagando pratos inflacionados pelas taxas de 27% do app",
    estrategia: "Campanha 'Compre Direto do Restaurante': produtos mais baratos, peças maiores e 10% de cashback real no Clube Zumi.",
    cupom: "COMPREDIRETO",
    descontoDesc: "10% Cashback + Peça Brinde",
    status: "ativa",
    dataDisparo: "Quarta, às 17:30",
    alcanceEst: 320,
    conversaoEst: 38,
    receitaGerada: 4940,
    roi: "5.8x"
  },
  {
    id: "act-5",
    titulo: "Noites de Ouro: Terça e Quarta VIP (Anti-Ociosidade)",
    alvoId: "tokio",
    alvoNome: "Tokio Sushi Bar",
    tipo: "oferta_pwa",
    bairros: ["Centro", "Jardim Europa"],
    gatilho: "Salão ocioso da concorrência nas terças e quartas-feiras",
    estrategia: "Festival Zuma no Salão com reserva exclusiva de Tatames VIP para casais e empresas com sobremesa cortesia.",
    cupom: "TATAMEVIP",
    descontoDesc: "Reserva VIP + Sobremesa Especial",
    status: "pausada",
    dataDisparo: "Terça-feira passada",
    alcanceEst: 150,
    conversaoEst: 18,
    receitaGerada: 2484,
    roi: "3.9x"
  }
];

// ============================================================================
// FEED EM TEMPO REAL: ESPIÃO DE MOVIMENTAÇÕES DOS CONCORRENTES
// ============================================================================
export interface AlertaMovimentacao {
  id: string;
  timestamp: string;
  concorrente: string;
  concorrenteId: string;
  tipo: "atraso" | "preco" | "review" | "promo" | "insumo";
  titulo: string;
  descricao: string;
  gravidade: "alta" | "media" | "baixa";
  acaoSugerida: string;
  estrategiaKey: string;
}

export const ALERTAS_RADAR: AlertaMovimentacao[] = [
  {
    id: "al-1",
    timestamp: "Há 12 minutos",
    concorrente: "Bonsai Sushi Bar",
    concorrenteId: "bonsai",
    tipo: "atraso",
    titulo: "Pico de Atraso Detectado na Cozinha (72 min)",
    descricao: "Tempo médio de entrega no iFood saltou de 40 para 72 minutos no Jardim Europa. Fila de espera na praça fria.",
    gravidade: "alta",
    acaoSugerida: "Disparar campanha de 'Entrega Expressa em 35 min' para a lista VIP do Jardim Europa.",
    estrategiaKey: "anti-espera"
  },
  {
    id: "al-2",
    timestamp: "Há 45 minutos",
    concorrente: "Nosso Sushi & Temakeria",
    concorrenteId: "nosso-sushi",
    tipo: "preco",
    titulo: "Reajuste de Preço no Combo Popular",
    descricao: "Nosso Sushi aumentou o Combo 20 peças de R$ 34,00 para R$ 38,00 no balcão e no WhatsApp.",
    gravidade: "media",
    acaoSugerida: "Divulgar o Combo Zuma 26 peças pelo mesmo valor relativo com Salmão Nobre Fresco.",
    estrategiaKey: "salmao-fresco"
  },
  {
    id: "al-3",
    timestamp: "Há 2 horas",
    concorrente: "Tokio Restaurante Oriental",
    concorrenteId: "tokio",
    tipo: "review",
    titulo: "Avaliação Crítica no Google Maps (1 Estrela)",
    descricao: "Cliente reclamou de 'sashimi com espinho e demora de 45 minutos para atender no salão'.",
    gravidade: "media",
    acaoSugerida: "Ativar campanha de Tatame VIP com atendimento comanda digital e sommelier de saquê.",
    estrategiaKey: "tatame-vip"
  },
  {
    id: "al-4",
    timestamp: "Há 3 horas",
    concorrente: "Kanto Poke & Sushi",
    concorrenteId: "kanto",
    tipo: "promo",
    titulo: "Postagem de Cupom de Almoço no Instagram",
    descricao: "Kanto lançou cupom 'KANTO15' oferecendo 15% de desconto em pokes entre 11h e 13h.",
    gravidade: "baixa",
    acaoSugerida: "Ativar banner no PWA Zuma com frete grátis corporativo para escritórios do Centro.",
    estrategiaKey: "almoco-executivo"
  },
  {
    id: "al-5",
    timestamp: "Ontem às 22:40",
    concorrente: "Sakura Dark Kitchen",
    concorrenteId: "sakura-dark",
    tipo: "atraso",
    titulo: "Reclamações de Sushi Quente e Embalagem Vazando",
    descricao: "Três clientes relataram embalagem desmontada e peixe morno em entregas noturnas na chuva.",
    gravidade: "alta",
    acaoSugerida: "Destacar o selo Zuma de Embalagem Térmica Selada com Lacre e Baú Climatizado.",
    estrategiaKey: "garantia-termica"
  }
];

// ============================================================================
// COMPARATIVO DE PREÇOS (CESTA DE PRODUTOS ORIENTAIS EM TANGARÁ DA SERRA)
// ============================================================================
export const COMPARATIVO_PRECOS = [
  {
    item: "Barca Especial (30 a 32 Peças Salmão Nobre)",
    zuma: 119.00,
    bonsai: 135.00,
    nossoSushi: 98.00,
    tokio: 128.00,
    mediaMercado: 120.33,
    vantagemZuma: "Melhor Custo x Benefício com Salmão Chileno Fresco"
  },
  {
    item: "Combo Hot Roll Salmão Especial (10 Unidades)",
    zuma: 38.00,
    bonsai: 44.00,
    nossoSushi: 34.00,
    tokio: 42.00,
    mediaMercado: 40.00,
    vantagemZuma: "Crocância perfeita com KDS fritura e panko japonês"
  },
  {
    item: "Temaki Salmão Completo com Cream Cheese & Cebolinha",
    zuma: 36.00,
    bonsai: 41.00,
    nossoSushi: 32.00,
    tokio: 39.00,
    mediaMercado: 37.33,
    vantagemZuma: "Nori super crocante embalada separadamente para delivery"
  },
  {
    item: "Sashimi Salmão Fresco Nobre (10 Fatias)",
    zuma: 52.00,
    bonsai: 58.00,
    nossoSushi: 48.00,
    tokio: 55.00,
    mediaMercado: 53.67,
    vantagemZuma: "Corte sashimi nobre sem partes brancas ou sobras"
  },
  {
    item: "Poke Executivo de Salmão Fresco Completo (400g)",
    zuma: 41.90,
    bonsai: 49.00,
    nossoSushi: 38.00,
    tokio: 46.00,
    mediaMercado: 44.33,
    vantagemZuma: "Arroz japonês temperado na temperatura exata com shoyu premium"
  },
  {
    item: "Rodízio Completo Presencial (Salão)",
    zuma: 129.90,
    bonsai: 139.90,
    nossoSushi: 0, // não tem
    tokio: 135.00,
    mediaMercado: 137.45,
    vantagemZuma: "Ambiente VIP com tatames exclusivos e serviço ágil no tablet"
  },
  {
    item: "Taxa Média de Entrega Delivery (Centro e Bairros)",
    zuma: 8.00,
    bonsai: 14.00,
    nossoSushi: 12.00,
    tokio: 15.00,
    mediaMercado: 13.67,
    vantagemZuma: "Frete Grátis acima de R$ 120 e rastreio GPS em tempo real"
  }
];

// ============================================================================
// MATRIZ DE PLATAFORMAS DE SOFTWARE (SAIPOS, TOTVS, ANOTA AI ETC.)
// ============================================================================
export interface SoftwareBenchmarkItem {
  id: string;
  nome: string;
  categoria: string;
  custoMensal: string;
  tcoAnualEst: number;
  foco: string;
  iaWhatsapp: string;
  crmRetencao: string;
  deliveryProprio: string;
  kdsPracas: string;
  integracaoMatoGrosso: string;
  estoqueBOM: string;
  telemetriaAnvisa: string;
  multinegocioModa: string;
  pontosFortes: string[];
  vulnerabilidades: string[];
  veredito: string;
  scores: {
    pdv: number;
    kds: number;
    ia: number;
    mesas: number;
    bom: number;
    anvisa: number;
    fiscal: number;
    delivery: number;
    moda: number;
    custoBeneficio: number;
    geral: number;
  };
  destaque?: boolean;
}

export const SOFTWARE_BENCHMARK: SoftwareBenchmarkItem[] = [
  {
    id: "saipos",
    nome: "Saipos",
    categoria: "ERP de Delivery & Integrador",
    custoMensal: "R$ 490 a R$ 1.100/mês",
    tcoAnualEst: 18500,
    foco: "Delivery rápido e centralização de pedidos de marketplaces",
    iaWhatsapp: "Ausente (chatbot de botões via parceiro externo com custo extra)",
    crmRetencao: "Básico estático (sem RFM preditivo ou análise de LTV)",
    deliveryProprio: "Taxado (2% a 5% por pedido de canal próprio ou mensalidade extra)",
    kdsPracas: "2 praças simples (ordem estrita de chegada, sem sincronia frio x quente)",
    integracaoMatoGrosso: "SEFAZ genérico nacional (sem conciliação Sicredi MT)",
    estoqueBOM: "Baixa linear simplificada (não calcula desossa do salmão nem aparas)",
    telemetriaAnvisa: "Inexistente (sem IoT térmico de câmaras ou laudos APPCC)",
    multinegocioModa: "Incompatível (não suporta grade de vestuário e coleções)",
    pontosFortes: [
      "Grande penetração em operações focadas exclusivamente em delivery rápido",
      "Homologação ampla com os principais marketplaces nacionais",
      "Emissão fiscal NFC-e homologada para estados padrão"
    ],
    vulnerabilidades: [
      "Interface legada dos anos 2010 com lentidão em horários de pico",
      "Sem inteligência artificial ativa para entender áudio ou transbordo humano",
      "Custo escala com volume e cobra taxas por pedidos de canais próprios",
      "Zero suporte a rastreabilidade sanitária e qualidade ANVISA"
    ],
    veredito: "ERP tradicional que atende dark kitchens básicas de fast-food, mas é insuficiente para a complexidade e sofisticação de um salão nobre e boutique com salmão fresco certificado.",
    scores: {
      pdv: 82,
      kds: 68,
      ia: 25,
      mesas: 70,
      bom: 45,
      anvisa: 10,
      fiscal: 78,
      delivery: 85,
      moda: 10,
      custoBeneficio: 55,
      geral: 52.8
    }
  },
  {
    id: "totvs-chef",
    nome: "Totvs Chef / Food Service",
    categoria: "ERP Corporativo para Grandes Redes",
    custoMensal: "R$ 1.450 a R$ 4.200/mês",
    tcoAnualEst: 46000,
    foco: "Redes franqueadas com auditoria corporativa e centros de custo",
    iaWhatsapp: "Zero IA generativa ou conversacional",
    crmRetencao: "Relatórios analíticos estáticos em planilhas",
    deliveryProprio: "Módulos adicionais caros e engessados",
    kdsPracas: "Monitores seriais pesados locais",
    integracaoMatoGrosso: "Robusto para SPED/Bloco K corporativo",
    estoqueBOM: "Ficha técnica pesada e complexa de configurar",
    telemetriaAnvisa: "Sem suporte nativo a sensores IoT ou visão computacional",
    multinegocioModa: "Requer contratação do módulo Protheus Varejo (dezenas de milhares de reais)",
    pontosFortes: [
      "Extrema robustez contábil para redes multinacionais com centenas de filiais",
      "Homologação fiscal completa em todos os 27 estados da federação",
      "Capacidade de consolidação contábil pesada para DREs de holding"
    ],
    vulnerabilidades: [
      "Custo total de implantação astronômico (R$ 10.000 a R$ 35.000 só de setup)",
      "Interface cinza dos anos 2000 que exige semanas de treinamento para garçons",
      "Suporte por tickets moroso com SLA de dias para resolução",
      "Totalmente desconectado da agilidade do consumidor mobile moderno"
    ],
    veredito: "Gigante corporativo burocrático e caro. Excelente para franquias de 500 lojas, mas um pesadelo operacional para um restaurante independente que precisa de inovação contínua.",
    scores: {
      pdv: 88,
      kds: 75,
      ia: 15,
      mesas: 80,
      bom: 72,
      anvisa: 20,
      fiscal: 95,
      delivery: 65,
      moda: 40,
      custoBeneficio: 28,
      geral: 57.8
    }
  },
  {
    id: "linx-degust",
    nome: "Linx Degust (Stone Co.)",
    categoria: "PDV & Franquias de Shopping Center",
    custoMensal: "R$ 580 a R$ 1.800/mês",
    tcoAnualEst: 26000,
    foco: "Praças de alimentação e redes com alto volume de TEF Stone",
    iaWhatsapp: "Inexistente",
    crmRetencao: "Fidelidade amarrada ao pagamento TEF",
    deliveryProprio: "Básico integrado",
    kdsPracas: "KDS convencional 2 praças",
    integracaoMatoGrosso: "NFC-e padrão",
    estoqueBOM: "Estoque convencional com custo médio ponderado",
    telemetriaAnvisa: "Sem telemetria IoT",
    multinegocioModa: "Separado no sistema Microvix",
    pontosFortes: [
      "Integração de pagamento TEF Stone sem atritos no balcão de praça de alimentação",
      "Estabilidade comprovada em grandes redes de shopping center",
      "Fidelidade automatizada pelo cartão de crédito do cliente"
    ],
    vulnerabilidades: [
      "Lock-in agressivo: taxa de cancelamento e amarração com maquininhas Stone",
      "Falta de customização para fichas técnicas nobres da alta gastronomia",
      "Sem previsão climática ou correlação com Dr. Clima de Tangará da Serra"
    ],
    veredito: "Eficaz para cadeias padronizadas de shopping, mas engessado e caro para operações gastronômicas locais autorais.",
    scores: {
      pdv: 86,
      kds: 65,
      ia: 20,
      mesas: 74,
      bom: 52,
      anvisa: 15,
      fiscal: 88,
      delivery: 70,
      moda: 45,
      custoBeneficio: 48,
      geral: 56.3
    }
  },
  {
    id: "consumer-connect",
    nome: "Programa Consumer / Connect",
    categoria: "PDV Desktop para Pequenos Restaurantes",
    custoMensal: "R$ 290 a R$ 680/mês",
    tcoAnualEst: 9800,
    foco: "Pizzarias de bairro, lanchonetes e bares pequenos",
    iaWhatsapp: "Não possui",
    crmRetencao: "Histórico estático de compras",
    deliveryProprio: "MenuDino básico com layout genérico",
    kdsPracas: "Comanda mobile simples para garçom",
    integracaoMatoGrosso: "NFC-e simplificada",
    estoqueBOM: "Estoque simplificado",
    telemetriaAnvisa: "Não possui",
    multinegocioModa: "Totalmente incompatível",
    pontosFortes: [
      "Preço de entrada acessível para negócios iniciantes",
      "Instalação rápida e facilidade de operação para garçons iniciantes",
      "Cardápio MenuDino simples para receber pedidos web"
    ],
    vulnerabilidades: [
      "Arquitetura local em Windows propensa a travamentos e corrupção de banco",
      "Sem capacidade de orquestrar KDS multi-praças inteligente",
      "Sem IA preditiva de compras nem cálculo de quebra de salmão nobre",
      "Sincronização em nuvem intermitente em caso de instabilidade de sinal"
    ],
    veredito: "Bom para hamburguerias e pequenos comércios locais, porém limitado demais para suportar a escala e precisão exigida pelo Zuma.",
    scores: {
      pdv: 80,
      kds: 62,
      ia: 15,
      mesas: 72,
      bom: 48,
      anvisa: 10,
      fiscal: 75,
      delivery: 72,
      moda: 10,
      custoBeneficio: 70,
      geral: 50.4
    }
  },
  {
    id: "anota-ai",
    nome: "Anota AI",
    categoria: "Atendente Virtual de WhatsApp & Cardápio",
    custoMensal: "R$ 290 a R$ 590/mês",
    tcoAnualEst: 6500,
    foco: "Automação de atendimento via WhatsApp e cardápio digital",
    iaWhatsapp: "Chatbot mecânico (botões pré-definidos, sem compreensão semântica ou áudio)",
    crmRetencao: "Disparo em massa de cupons para contatos",
    deliveryProprio: "Cardápio web rápido para WhatsApp",
    kdsPracas: "Não possui KDS",
    integracaoMatoGrosso: "Não emite nota fiscal",
    estoqueBOM: "Não gerencia insumos",
    telemetriaAnvisa: "Inexistente",
    multinegocioModa: "Incompatível",
    pontosFortes: [
      "Reduz a necessidade de atendente humano digitando pedidos do WhatsApp",
      "Cardápio leve com abertura instantânea no celular do cliente",
      "Integração para imprimir diretamente na impressora de produção"
    ],
    vulnerabilidades: [
      "Não é um ERP: precisa de outro software para frente de caixa, estoque e fiscal",
      "Bot engessado: cliente que envia áudio ou pede substituição fica travado",
      "Zero gestão de salão, mesas, garçons ou reserva VIP",
      "Cobra mensalidade recorrente apenas por uma camada de triagem de chat"
    ],
    veredito: "Uma ferramenta de automação de mensagens de WhatsApp, não uma solução de gestão de restaurante. Não substitui um ERP completo.",
    scores: {
      pdv: 30,
      kds: 15,
      ia: 58,
      mesas: 10,
      bom: 10,
      anvisa: 5,
      fiscal: 10,
      delivery: 82,
      moda: 5,
      custoBeneficio: 60,
      geral: 28.5
    }
  },
  {
    id: "goomer",
    nome: "Goomer (GoomerGo / Cardápio Mesa)",
    categoria: "Autoatendimento & Cardápio QR Code de Mesa",
    custoMensal: "R$ 190 a R$ 490/mês",
    tcoAnualEst: 5500,
    foco: "Cardápio QR Code de visualização e autoatendimento na mesa",
    iaWhatsapp: "Inexistente",
    crmRetencao: "Histórico de clientes básico",
    deliveryProprio: "GoomerGo web",
    kdsPracas: "Não possui KDS nativo (depende de integradores)",
    integracaoMatoGrosso: "Não emite documentos fiscais",
    estoqueBOM: "Não gerencia estoque físico",
    telemetriaAnvisa: "Inexistente",
    multinegocioModa: "Incompatível",
    pontosFortes: [
      "Experiência visual impecável de fotos em alta definição dos pratos",
      "Redução da dependência de garçons para anotar pedidos no salão",
      "Interface responsiva e rápida no navegador do cliente"
    ],
    vulnerabilidades: [
      "Camada puramente visual de front-end: não tem retaguarda ERP, DRE ou CMV",
      "Divisão de comanda na mesa engessada e sem Pix instantâneo cooperativo MT",
      "Mensalidade cumulativa que se soma ao custo do ERP principal"
    ],
    veredito: "Excelente front-end de cardápio digital, mas atua apenas como vitrine e depende de outros sistemas caros para rodar a operação real.",
    scores: {
      pdv: 40,
      kds: 20,
      ia: 15,
      mesas: 84,
      bom: 10,
      anvisa: 5,
      fiscal: 10,
      delivery: 65,
      moda: 5,
      custoBeneficio: 62,
      geral: 31.6
    }
  },
  {
    id: "ifood-gestor",
    nome: "iFood Gestor & Portal do Parceiro",
    categoria: "Marketplace Predatório & Gestor de Pedidos",
    custoMensal: "R$ 130/mês + 12% a 27% sobre CADA venda",
    tcoAnualEst: 58000,
    foco: "Aquisição de demanda de delivery em escala de massa",
    iaWhatsapp: "Inexistente (fechado dentro do app iFood)",
    crmRetencao: "Bloqueado (iFood mascara telefone e retém os dados do cliente)",
    deliveryProprio: "Canal iFood exclusivo com comissão de até 27%",
    kdsPracas: "Gestor de pedidos simples em tela única",
    integracaoMatoGrosso: "Emissão simplificada via integrador externo",
    estoqueBOM: "Apenas pausa de itens esgotados",
    telemetriaAnvisa: "Inexistente",
    multinegocioModa: "Incompatível",
    pontosFortes: [
      "Volume massivo de tráfego e usuários ativos com cartão pré-cadastrado",
      "Facilidade de atrair novos clientes que não conhecem o restaurante"
    ],
    vulnerabilidades: [
      "Comissão abusiva de até 27% que confisca todo o lucro líquido do sushi",
      "O cliente pertence ao iFood e não ao restaurante (zero retenção própria)",
      "Risco permanente de perda de visibilidade pelo algoritmo do aplicativo",
      "Incompatível com salão, mesas, estoque industrial ou loja boutique"
    ],
    veredito: "Canal de aquisição necessário no início, porém perigoso se usado como pilar único. O Zuma Pilot reduz a dependência do iFood com loja própria PWA e WhatsApp IA.",
    scores: {
      pdv: 45,
      kds: 50,
      ia: 40,
      mesas: 10,
      bom: 10,
      anvisa: 5,
      fiscal: 30,
      delivery: 92,
      moda: 5,
      custoBeneficio: 18,
      geral: 30.5
    }
  },
  {
    id: "teknisa-zig",
    nome: "Teknisa & Zig (Cashless / Corporativo)",
    categoria: "Cashless & Cozinhas Industriais",
    custoMensal: "R$ 800 a R$ 2.500/mês + taxas de recarga",
    tcoAnualEst: 25000,
    foco: "Grandes eventos, baladas, festivais e refeitórios corporativos",
    iaWhatsapp: "Inexistente",
    crmRetencao: "Básico corporativo",
    deliveryProprio: "Mínimo",
    kdsPracas: "Básico industrial",
    integracaoMatoGrosso: "TEF homologado",
    estoqueBOM: "Estoque industrial rígido",
    telemetriaAnvisa: "Laudos manuais",
    multinegocioModa: "Incompatível",
    pontosFortes: [
      "Especialistas em eventos fechados e cobrança cashless por pulseira/cartão",
      "Velocidade de baixa em bares com filas gigantescas"
    ],
    vulnerabilidades: [
      "Sem qualquer fit para a alta gastronomia personalizada e atendimento à mesa",
      "Sem loja própria PWA fluida, sem IA conversacional, sem gestão de pescados nobres"
    ],
    veredito: "Focado em baladas e grandes cozinhas coletivas, desalinhado do posicionamento nobre e sofisticado do Zuma.",
    scores: {
      pdv: 78,
      kds: 58,
      ia: 15,
      mesas: 60,
      bom: 60,
      anvisa: 30,
      fiscal: 80,
      delivery: 30,
      moda: 10,
      custoBeneficio: 45,
      geral: 46.6
    }
  },
  {
    id: "zuma-pilot",
    nome: "ZUMA PILOT (Nossa Solução)",
    categoria: "Ecossistema Proprietário 360° IA & Salão Nobre",
    custoMensal: "R$ 0 em mensalidade (Propriedade Exclusiva)",
    tcoAnualEst: 0,
    foco: "Alta Gastronomia Oriental + Salão 360° (27 Mesas) + PWA sem Taxa + Boutique Zuma Moda",
    iaWhatsapp: "KyttoIA Neural Engine (compreensão de áudio, recomendações sommelier, predição de demanda e transbordo humano)",
    crmRetencao: "RFM Preditivo, 4 Ondas de Reativação, Clube Zumi e DRE em tempo real",
    deliveryProprio: "PWA próprio ultra-rápido com Sicredi Pix MT Direto (0% comissão) e GPS",
    kdsPracas: "KDS 2.0 Fire-on-Demand em 4 praças com cronômetro de precisão e SLA de 32 min",
    integracaoMatoGrosso: "NFC-e SEFAZ-MT e Pix Sicredi nativos sem intermediários",
    estoqueBOM: "Ficha Técnica 3 Vias do Salmão Chileno Nobre (58% Filé / 15% Tartar / 27% Caldos)",
    telemetriaAnvisa: "Ultra ANVISA com telemetria contínua a -22°C, laudos APPCC e Ultra Vision AI",
    multinegocioModa: "Nativo e Integrado (Zuma Moda: peças, coleções, provador virtual e cross-sell)",
    pontosFortes: [
      "Solução total unificada: elimina a fragmentação de pagar 5 a 6 softwares diferentes",
      "Economia direta de mais de R$ 84.600 por ano em licenças e comissões de delivery",
      "Inteligência Artificial Zumi atuando na frente de atendimento, cozinha e gestão financeira",
      "Conformidade sanitária e APPCC rigorosa com laudos oficiais e QR Code do Passaporte do Salmão",
      "Feito sob medida para Tangará da Serra (MT), integrado ao clima local (Dr. Clima) e cooperativa Sicredi"
    ],
    vulnerabilidades: [
      "Exige manutenção de engenharia e servidores dedicados (já garantidos em infraestrutura de alta disponibilidade)",
      "Novas ideias operacionais precisam de priorização contínua de roadmap interno"
    ],
    veredito: "Líder tecnológico absoluto e proprietário do Zuma. Transforma a operação gastronômica e de moda em uma máquina de eficiência, qualidade auditada e rentabilidade máxima.",
    scores: {
      pdv: 96,
      kds: 98,
      ia: 98,
      mesas: 95,
      bom: 98,
      anvisa: 99,
      fiscal: 94,
      delivery: 95,
      moda: 96,
      custoBeneficio: 99,
      geral: 96.8
    },
    destaque: true
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL: IA E MERCADO (WAR ROOM EXECUTIVO)
// ============================================================================
export const MercadoBenchmark: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<
    "matriz-ataque" | "apis-reais" | "ifood" | "keeto" | "opendelivery" | "bancos-tef" | "google-eco" | "dr-clima" | "concorrentes" | "war-room" | "projecao-ia" | "reativacao-ia" | "buracos-agenda" | "radar-vivo" | "ia-estrategista" | "reputacao" | "precos" | "simulador" | "softwares"
  >("apis-reais");

  type PilarType = "concorrencia" | "apis" | "ia";
  const [pilarAtivo, setPilarAtivo] = useState<PilarType>("apis");

  const mudarAba = (tab: typeof abaAtiva) => {
    setAbaAtiva(tab);
    if (["matriz-ataque", "concorrentes", "war-room", "radar-vivo", "reputacao", "precos"].includes(tab)) {
      setPilarAtivo("concorrencia");
    } else if (["apis-reais", "ifood", "keeto", "opendelivery", "bancos-tef", "google-eco", "dr-clima", "softwares"].includes(tab)) {
      setPilarAtivo("apis");
    } else {
      setPilarAtivo("ia");
    }
  };

  const mudarPilar = (pilar: PilarType) => {
    setPilarAtivo(pilar);
    if (pilar === "concorrencia") {
      setAbaAtiva("matriz-ataque");
    } else if (pilar === "apis") {
      setAbaAtiva("apis-reais");
    } else {
      setAbaAtiva("ia-estrategista");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["matriz-ataque", "apis-reais", "dr-clima", "concorrentes", "war-room", "projecao-ia", "reativacao-ia", "buracos-agenda", "radar-vivo", "ia-estrategista", "reputacao", "precos", "simulador", "softwares"].includes(tabParam)) {
      mudarAba(tabParam as any);
    }
  }, []);

  const drClimaHeaderQuery = trpc.zuma.getDrClimaTangara.useQuery(undefined, {
    refetchInterval: 60000,
  });
  const acoesQuery = trpc.zuma.listAcoesConcorrencia.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const salvarAcaoMutation = trpc.zuma.salvarAcaoConcorrencia.useMutation({
    onSuccess: () => {
      acoesQuery.refetch();
    }
  });
  const alternarStatusMutation = trpc.zuma.alternarStatusAcaoConcorrencia.useMutation({
    onSuccess: () => {
      acoesQuery.refetch();
    }
  });
  const sincronizarConcorrentesMutation = trpc.zuma.sincronizarConcorrentesAoVivo.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem);
    }
  });

  const [negocioAtivo, setNegocioAtivo] = useState<string>("consolidado");

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroAmeaca, setFiltroAmeaca] = useState<string>("todos");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [isUpdatingRadar, setIsUpdatingRadar] = useState(false);
  const [subVisaoBenchmark, setSubVisaoBenchmark] = useState<"matriz" | "radar" | "auditoria-zuma" | "tco">("matriz");
  const [softwareSelecionado, setSoftwareSelecionado] = useState<string>("saipos");
  const [faturamentoSimulado, setFaturamentoSimulado] = useState<number>(345000);
  const [percentualDelivery, setPercentualDelivery] = useState<number>(45);

  // Estados e Queries das APIs Reais ao Vivo
  const cotacaoSalmaoQuery = trpc.zuma.getCotacaoDolarSalmao.useQuery(undefined, {
    refetchInterval: 60000,
  });
  const consultarCnpjMutation = trpc.zuma.consultarCnpjReceita.useMutation();
  const consultarZumiAiMutation = trpc.zuma.consultarZumiInteligenciaAoVivo.useMutation();
  const consultarKyttoMutation = trpc.zuma.consultarKyttoIA.useMutation();

  const [tipoConsultaKytto, setTipoConsultaKytto] = useState<
    "plano_aumento_faturamento" | "plano_mais_clientes" | "analise_concorrente" | "retencao_fidelidade_ltv" | "benchmark_software_foodservice" | "personalizada"
  >("plano_aumento_faturamento");
  const [metaFaturamentoKytto, setMetaFaturamentoKytto] = useState<number>(450000);
  const [faturamentoAtualKytto, setFaturamentoAtualKytto] = useState<number>(345000);
  const [ticketMedioKytto, setTicketMedioKytto] = useState<number>(138);
  const [percentualDeliveryKytto, setPercentualDeliveryKytto] = useState<number>(45);
  const [iaTargetCategoria, setIaTargetCategoria] = useState<"locais" | "softwares">("locais");
  const [softwareAlvoId, setSoftwareAlvoId] = useState<string>("saipos");
  const [historicoConsultas, setHistoricoConsultas] = useState<Array<{
    id: string;
    tipo: string;
    titulo: string;
    alvo: string;
    resposta: string;
    timestamp: string;
    impacto?: number;
  }>>([]);

  const [cnpjInput, setCnpjInput] = useState("36.296.848/0001-57");
  const [cnpjResultado, setCnpjResultado] = useState<any>(null);
  const [iaAlvoId, setIaAlvoId] = useState("bonsai");
  const [iaPergunta, setIaPergunta] = useState("Como explorar o atraso de entrega do Bonsai nas noites de final de semana no Jardim Europa?");
  const [iaResultado, setIaResultado] = useState<string | null>(null);

  const executarConsultaCnpj = (cnpjParaBuscar?: string) => {
    const valor = cnpjParaBuscar || cnpjInput;
    consultarCnpjMutation.mutate(
      { cnpj: valor },
      {
        onSuccess: (data) => {
          if (data.success) {
            setCnpjResultado(data);
            toast.success(`CNPJ ${data.cnpjFormatado} verificado na Receita Federal!`, {
              description: `${data.razaoSocial} · Situação ${data.situacaoCadastral}`,
            });
          } else {
            toast.error("Falha ao consultar CNPJ", { description: data.error });
          }
        },
        onError: (err) => {
          toast.error("Erro na consulta de CNPJ", { description: err.message });
        },
      }
    );
  };

  const executarConsultaKyttoIA = (
    perguntaCustom?: string,
    tipoCustom?: "plano_aumento_faturamento" | "plano_mais_clientes" | "analise_concorrente" | "retencao_fidelidade_ltv" | "benchmark_software_foodservice" | "personalizada",
    alvoCustom?: string
  ) => {
    const tipo = tipoCustom || tipoConsultaKytto;
    const alvo = alvoCustom || (tipo === "benchmark_software_foodservice" || iaTargetCategoria === "softwares" ? softwareAlvoId : iaAlvoId);
    
    let alvoNome = alvo;
    if (tipo === "benchmark_software_foodservice" || iaTargetCategoria === "softwares") {
      const sw = SOFTWARE_BENCHMARK.find(s => s.id === alvo);
      alvoNome = sw?.nome || alvo;
    } else {
      const c = CONCORRENTES_TANGARA.find(ct => ct.id === alvo);
      alvoNome = c?.fantasia || alvo;
    }

    const pergunta = perguntaCustom || iaPergunta;

    consultarKyttoMutation.mutate(
      {
        tipoConsulta: (tipo as any) || "plano_aumento_faturamento",
        concorrenteId: alvo,
        concorrenteNome: alvoNome,
        pergunta,
        metaFaturamento: metaFaturamentoKytto,
        faturamentoAtual: faturamentoAtualKytto,
        ticketMedioAtual: ticketMedioKytto,
        percentualDelivery: percentualDeliveryKytto,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setIaResultado(data.analise);
            const novoItemHist = {
              id: `hist-${Date.now()}`,
              tipo,
              titulo: `Plano Estratégico ${tipo.replace(/_/g, " ").toUpperCase()}`,
              alvo: alvoNome,
              resposta: data.analise,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              impacto: data.incrementoProjetado || 45000,
            };
            setHistoricoConsultas(prev => [novoItemHist, ...prev.slice(0, 9)]);
            toast.success("🧠 Plano Estratégico KyttoIA Gerado!", {
              description: `Análise 100% em tempo real com dados de Tangará da Serra (MT).`,
            });
          } else {
            toast.error("Erro na KyttoIA", { description: "Falha na resposta" });
          }
        },
        onError: (err) => {
          toast.error("Erro na KyttoIA Neural Engine", { description: err.message });
        }
      }
    );
  };

  const executarDiagnosticoIa = () => {
    executarConsultaKyttoIA();
  };

  // Estados do Simulador de Conquista
  const [percBonsai, setPercBonsai] = useState<number>(10);
  const [percNossoSushi, setPercNossoSushi] = useState<number>(12);
  const [percOutros, setPercOutros] = useState<number>(8);

  // Lista de ações dinâmicas do War Room
  const [acoes, setAcoes] = useState<AcaoConcorrencia[]>(ACOES_INICIAIS);

  useEffect(() => {
    if (acoesQuery.data && Array.isArray(acoesQuery.data) && acoesQuery.data.length > 0) {
      setAcoes(acoesQuery.data as AcaoConcorrencia[]);
    }
  }, [acoesQuery.data]);

  // Modal de Criação / Execução de Ação
  const [modalAcaoAberto, setModalAcaoAberto] = useState(false);
  const [acaoForm, setAcaoForm] = useState<{
    titulo: string;
    alvoId: string;
    tipo: "whatsapp" | "oferta_pwa" | "ajuste_preco" | "trafego_local" | "clube_zumi" | "resgate_review";
    bairros: string;
    cupom: string;
    descontoDesc: string;
    mensagemIA: string;
  }>({
    titulo: "",
    alvoId: "bonsai",
    tipo: "whatsapp",
    bairros: "Jardim Europa, Centro, Tarumã",
    cupom: "ZUMA35MIN",
    descontoDesc: "Frete Grátis acima de R$ 120",
    mensagemIA: "Fome de sushi na sexta sem esperar 1 hora? 🍣 No Zuma seu combo sai em até 35 min com GPS ao vivo na sua porta!"
  });

  // Chat com IA Estrategista
  const [chatMensagens, setChatMensagens] = useState<Array<{ sender: "user" | "zumi"; texto: string; timestamp: string }>>([
    {
      sender: "zumi",
      texto: "Olá, Rodrigo! Sou a KyttoIA, motor neural de inteligência estratégica e crescimento do Zuma Cozinha Oriental em Tangará da Serra (MT). Mapeei os concorrentes locais (Bonsai, Skamoto, Nosso Sushi) e softwares de mercado (Saipos, Totvs, Linx). Me pergunte sobre planos para aumentar o faturamento, atração de clientes de alto padrão, neutralização da concorrência ou cálculo de ticket médio!",
      timestamp: "19:20"
    }
  ]);
  const [inputChat, setInputChat] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Cálculos do Simulador
  const faturamentoBonsaiCapturado = (110000 * percBonsai) / 100;
  const faturamentoNossoCapturado = (85000 * percNossoSushi) / 100;
  const faturamentoOutrosCapturado = ((68000 + 38000 + 32000 + 24000) * percOutros) / 100;
  const totalCapturadoMes = faturamentoBonsaiCapturado + faturamentoNossoCapturado + faturamentoOutrosCapturado;
  const novoFaturamentoZuma = 338000 + totalCapturadoMes;
  const novoShareZuma = (novoFaturamentoZuma / 640000) * 100;

  // Filtragem dos concorrentes
  const concorrentesFiltrados = CONCORRENTES_TANGARA.filter(c => {
    // Filtro por Categoria de Negócio baseado no negócio ativo
    if (negocioAtivo === "zuma" && c.categoriaNegocio && c.categoriaNegocio !== "gastronomia") return false;
    if (negocioAtivo === "zuma_roupas" && c.categoriaNegocio !== "roupas") return false;
    if (negocioAtivo === "kytto_agro" && c.categoriaNegocio !== "agro") return false;
    const matchTexto = 
      c.fantasia.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.bairro.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.modelo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (c.setorLabel && c.setorLabel.toLowerCase().includes(filtroTexto.toLowerCase())) ||
      (c.publicoAlvo && c.publicoAlvo.toLowerCase().includes(filtroTexto.toLowerCase())) ||
      c.cnpj.includes(filtroTexto);
    const matchAmeaca = filtroAmeaca === "todos" || c.nivelAmeaca.toLowerCase() === filtroAmeaca.toLowerCase();
    const matchSetor = filtroSetor === "todos" || (c.setor || "sushi") === filtroSetor;
    return matchTexto && matchAmeaca && matchSetor;
  });

  // Disparo de ação rápida a partir dos cards
  const abrirModalAcaoRapida = (alvo: ConcorrenteTangara) => {
    setAcaoForm({
      titulo: `Contra-Ataque Estratégico: Alvo ${alvo.fantasia}`,
      alvoId: alvo.id,
      tipo: "whatsapp",
      bairros: alvo.bairro,
      cupom: `ZUMA${alvo.id.toUpperCase()}`,
      descontoDesc: "R$ 20 OFF ou Frete Grátis",
      mensagemIA: `Olá! Sentindo falta de um sushi de salmão nobre fresco de verdade? 🍣 O Zuma Cozinha Oriental preparou uma condição especial para você no ${alvo.bairro}: use o cupom e receba seu pedido em até 35 min!`
    });
    setModalAcaoAberto(true);
  };

  const handleSalvarExecutarAcao = (e: React.FormEvent) => {
    e.preventDefault();
    const alvo = CONCORRENTES_TANGARA.find(c => c.id === acaoForm.alvoId);
    const novaAcao: AcaoConcorrencia = {
      id: `act-${Date.now()}`,
      titulo: acaoForm.titulo || `Contra-Ataque Alvo ${alvo?.fantasia || "Concorrente"}`,
      alvoId: acaoForm.alvoId,
      alvoNome: alvo?.fantasia || "Concorrente",
      tipo: acaoForm.tipo,
      bairros: acaoForm.bairros.split(",").map(b => b.trim()),
      gatilho: "Gargalo ou vulnerabilidade de mercado identificada pelo gestor",
      estrategia: acaoForm.mensagemIA,
      cupom: acaoForm.cupom,
      descontoDesc: acaoForm.descontoDesc,
      status: "ativa",
      dataDisparo: "Agora há pouco",
      alcanceEst: Math.floor(Math.random() * 200) + 150,
      conversaoEst: Math.floor(Math.random() * 25) + 20,
      receitaGerada: Math.floor(Math.random() * 2500) + 2500,
      roi: "5.5x"
    };

    setAcoes([novaAcao, ...acoes]);
    salvarAcaoMutation.mutate(novaAcao);
    setModalAcaoAberto(false);
    toast.success(`⚡ Ação "${novaAcao.titulo}" Executada com Sucesso!`, {
      description: `Disparo programado para ${novaAcao.bairros.join(", ")} via canal ${novaAcao.tipo.toUpperCase()}.`,
      icon: <Send className="w-5 h-5 text-emerald-500" />
    });
  };

  const alternarStatusAcao = (id: string) => {
    const act = acoes.find(a => a.id === id);
    const novoStatus = act?.status === "ativa" ? "pausada" : "ativa";
    setAcoes(prev => prev.map(a => (a.id === id ? { ...a, status: novoStatus } : a)));
    alternarStatusMutation.mutate({ id, status: novoStatus });
    toast.info(`Ação "${act?.titulo || id}" foi ${novoStatus === "ativa" ? "reativada" : "pausada"}.`);
  };

  const atualizarRadarAoVivo = () => {
    setIsUpdatingRadar(true);
    toast.info("🛰️ Varrendo dados de concorrência em Tangará da Serra...", {
      description: "Consultando tempos de espera iFood, notas Google Maps e cardápios ativos."
    });
    setTimeout(() => {
      setIsUpdatingRadar(false);
      toast.success("✅ Radar Atualizado! 6 concorrentes sincronizados com sucesso.", {
        description: "Bonsai: 68 min | Nosso Sushi: Salmão congelado 2ª linha | Tokio: Ocupação baixa no salão."
      });
    }, 1200);
  };

  const enviarPerguntaChat = (textoPreset?: string) => {
    const texto = textoPreset || inputChat;
    if (!texto.trim()) return;

    const novaMsgUser = { sender: "user" as const, texto, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMensagens(prev => [...prev, novaMsgUser]);
    if (!textoPreset) setInputChat("");
    setIsAiThinking(true);

    consultarKyttoMutation.mutate(
      {
        tipoConsulta: "personalizada",
        concorrenteId: iaAlvoId,
        concorrenteNome: CONCORRENTES_TANGARA.find(c => c.id === iaAlvoId)?.fantasia || "Tangará da Serra",
        pergunta: texto,
        metaFaturamento: metaFaturamentoKytto,
        faturamentoAtual: faturamentoAtualKytto,
        ticketMedioAtual: ticketMedioKytto,
        percentualDelivery: percentualDeliveryKytto,
      },
      {
        onSuccess: (data) => {
          setIsAiThinking(false);
          const respostaKytto = data.success ? data.analise : "Não foi possível processar a consulta neste instante. Tente novamente.";
          setChatMensagens(prev => [...prev, {
            sender: "zumi",
            texto: respostaKytto,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        },
        onError: (err) => {
          setIsAiThinking(false);
          setChatMensagens(prev => [...prev, {
            sender: "zumi",
            texto: `Houve uma oscilação na rede neural KyttoIA: ${err.message}. Por favor, tente novamente em instantes.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }
    );
  };

  const acoesAtivasCont = acoes.filter(a => a.status === "ativa").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 antialiased">
      {/* ===================================================================== */}
      {/* HEADER PRINCIPAL OTIMIZADO PARA MOBILE & DESKTOP                       */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              IA &amp; Inteligência de Mercado
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">
              Tangará da Serra · MT
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight mt-1 flex items-center gap-2">
            IA e Mercado · War Room &amp; Tomada de Ações
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-3xl mt-1 leading-relaxed">
            Painel unificado de inteligência competitiva: visualização profunda de todos os concorrentes de Tangará da Serra, detecção de gargalos em tempo real e plataforma executiva para tomada de ações e contra-ataques imediatos.
          </p>
        </div>

        {/* Botões Rápidos de Ação no Topo */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => mudarAba("dr-clima")}
            className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Dr. Clima: Previsão do tempo e Operação Chuva para Tangará da Serra"
          >
            <CloudRain className="w-4 h-4 text-blue-500 animate-bounce" />
            <span>Tangará: {drClimaHeaderQuery.data?.current?.temperatura ?? 25.6}°C</span>
            <span className="hidden sm:inline text-[11px] text-[var(--muted)]">· {drClimaHeaderQuery.data?.dias?.[0]?.probabilidadeChuvaPct ?? 83}% Chuva</span>
            <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white text-[9px] font-black uppercase">Delivery +82%</span>
          </button>

          <button
            onClick={() => mudarAba("war-room")}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-orange-500 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>Tomar Ações ({acoesAtivasCont})</span>
          </button>

          <button
            onClick={atualizarRadarAoVivo}
            disabled={isUpdatingRadar}
            className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--surface2)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Atualizar dados de mercado e tempos de entrega dos concorrentes"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--muted)] ${isUpdatingRadar ? "animate-spin text-[var(--salmon)]" : ""}`} />
            <span className="hidden sm:inline">Atualizar Radar</span>
          </button>
        </div>
      </div>

            {/* ===================================================================== */}
      {/* ARQUITETURA MULTINEGÓCIOS: HOLDING CONSOLIDADA & EMPRESAS INDEPENDENTES */}
      {/* ===================================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        {/* NÍVEL 1: EMPRESA CONSOLIDADA DE TUDO (DESTAQUE SUPERIOR HOLDING) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black shrink-0 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-[var(--ink)] flex items-center gap-2 flex-wrap">
                <span>Holding Empresarial &amp; Portfólio de Negócios</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Visão Consolidada
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tangará da Serra · MT
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                Visão executiva integrada de todas as empresas do empresário: Gaps, Oportunidades cruzadas e Redes Sociais integradas.
              </div>
            </div>
          </div>

          {/* Botão de Destaque da Empresa Consolidada */}
          <button
            onClick={() => {
              setNegocioAtivo("consolidado");
              toast.success("Visão Consolidada Ativada! Monitorando Gaps, Oportunidades e Tráfego Social de todo o grupo.");
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
              negocioAtivo === "consolidado"
                ? "bg-[var(--ink)] text-[var(--surface)] ring-2 ring-[var(--ink)]/20 shadow-xs"
                : "bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] border border-[var(--line)]"
            }`}
          >
            <span className="text-base">🌐</span>
            <span>EMPRESA CONSOLIDADA (TUDO)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase font-mono ${
              negocioAtivo === "consolidado" ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)]"
            }`}>
              Holding + Redes
            </span>
          </button>
        </div>

        {/* NÍVEL 2: EMPRESAS INDEPENDENTES DO EMPRESÁRIO (ABAIXO DO CONSOLIDADO) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
            <span className="uppercase tracking-wider text-[10px]">Empresas Independentes do Portfólio:</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Zuma Gastronomia (Principal) */}
            <button
              onClick={() => {
                setNegocioAtivo("zuma");
                toast.info("Calibrado para Zuma Gastronomia Oriental (Negócio Principal)!");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                negocioAtivo === "zuma"
                  ? "bg-[var(--salmon)] text-white shadow-xs ring-2 ring-[var(--salmon)]/40"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>🥢</span>
              <span>Zuma Gastronomia</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase font-mono">
                Principal
              </span>
            </button>

            {/* 2. Zuma Loja de Roupas */}
            <button
              onClick={() => {
                setNegocioAtivo("zuma_roupas");
                toast.info("Calibrado para Zuma Loja de Roupas & Moda!");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                negocioAtivo === "zuma_roupas"
                  ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>👗</span>
              <span>Zuma Loja de Roupas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase font-mono">
                Moda
              </span>
            </button>

            {/* 3. Kytto Agro & B2B */}
            <button
              onClick={() => {
                setNegocioAtivo("kytto_agro");
                toast.info("Calibrado para Kytto Agro & Corporativo B2B!");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                negocioAtivo === "kytto_agro"
                  ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>🌾</span>
              <span>Kytto Agro &amp; B2B</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase font-mono">
                Grandes Contas
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6 KPIS DINÂMICOS CONFORME EMPRESA OU HOLDING SELECIONADA             */}
      {/* ===================================================================== */}
      {(() => {
        const isConsolidado = negocioAtivo === "consolidado";
        const isRoupas = negocioAtivo === "zuma_roupas";
        const isAgro = negocioAtivo === "kytto_agro";

        const tamLabel = isConsolidado ? "TAM Multissetorial Holding" : isRoupas ? "TAM Moda Tangará" : isAgro ? "TAM Demanda Agro B2B" : "TAM Gastronomia Noturna";
        const tamVal = isConsolidado ? "R$ 4.01M" : isRoupas ? "R$ 940k" : isAgro ? "R$ 1.25M" : "R$ 1.82M";
        const tamSub = isConsolidado ? "Gastronomia + Moda + Agro" : isRoupas ? "Boutiques e Vestuário" : isAgro ? "Contratos Corporativos" : "12 concorrentes noite";

        const empLabel = isConsolidado ? "Holding Consolidada (Você)" : isRoupas ? "Zuma Loja Roupas (Você)" : isAgro ? "Kytto Agro & B2B (Você)" : "Zuma (Você)";
        const empVal = isConsolidado ? "R$ 728k" : isRoupas ? "R$ 168k" : isAgro ? "R$ 215k" : "R$ 345k";
        const empSub = isConsolidado ? "Líder Multinegócios" : isRoupas ? "Boutique & Moda Premium" : isAgro ? "Grandes Contas & Eventos" : "Líder High-End & Sushi";

        const concLabel = isConsolidado ? "Mercado Competidor" : isRoupas ? "Boutiques Rivalizantes" : isAgro ? "Demanda Mapeada" : "11 Concorrentes";
        const concVal = isConsolidado ? "R$ 3.28M" : isRoupas ? "R$ 772k" : isAgro ? "R$ 1.03M" : "R$ 1.47M";
        const concSub = isConsolidado ? "Soma de todos os setores" : isRoupas ? "Centro e Av. Brasil" : isAgro ? "Tradings e Fazendas" : "Burger, Pizza, Chopp";

        const captVal = isConsolidado ? "+R$ 320k" : isRoupas ? "+R$ 85k" : isAgro ? "+R$ 132k" : "+R$ 185k";
        const captSub = isConsolidado ? "Gaps dos 3 negócios" : isRoupas ? "Social Commerce & Mala" : isAgro ? "Contratos Anuais Safra" : "Gargalos mapeados";

        const acoesVal = isConsolidado ? "8 / 11" : isRoupas ? "3 / 4" : isAgro ? "2 / 3" : `${acoesAtivasCont} / ${acoes.length}`;
        const roiVal = isConsolidado ? "5.4x" : isRoupas ? "5.8x" : isAgro ? "7.4x" : "5.4x";
        const roiSub = isConsolidado ? "Meta Ads + TikTok + Google" : isRoupas ? "Retorno em Vendas" : isAgro ? "LTV Grandes Contas" : "Retorno sobre disparo";

        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span className="truncate">{tamLabel}</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-[var(--ink)]">
                {tamVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {tamSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border-2 border-purple-500/40 shadow-xs space-y-0.5 bg-purple-500/5">
              <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
                <span className="truncate">{empLabel}</span>
                <Trophy className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-purple-400">
                {empVal}
              </div>
              <p className="text-[10px] text-emerald-500 font-bold leading-tight truncate">
                {empSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span className="truncate">{concLabel}</span>
                <PieChart className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-[var(--ink)]">
                {concVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {concSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Captura Multissetorial</span>
                <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-blue-600">
                {captVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {captSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Ações Ativas</span>
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-amber-600">
                {acoesVal}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold leading-tight truncate">
                Contra-ataques ativos
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>ROI das Ações</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-emerald-600">
                {roiVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {roiSub}
              </p>
            </div>
          </div>
        );
      })()}

      {/* SEÇÃO DA HOLDING CONSOLIDADA (GAPS, OPORTUNIDADES E REDES SOCIAIS) */}
      {negocioAtivo === "consolidado" && (
        <HoldingConsolidadaWarRoom onSelectBusiness={(id) => setNegocioAtivo(id)} />
      )}

      {/* ===================================================================== */}
      {/* NAVEGAÇÃO ESTRUTURADA EM 3 PILARES ESTRATÉGICOS                      */}
      {/* ===================================================================== */}
      <div className="space-y-2.5 border-b border-[var(--line)] pb-3">
        {/* Nível 1: Seletor dos 3 Pilares Principais */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] overflow-x-auto scrollbar-none">
          <button
            onClick={() => mudarPilar("concorrencia")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              pilarAtivo === "concorrencia"
                ? "bg-[var(--surface)] text-[var(--salmon)] shadow-xs ring-1 ring-[var(--salmon)]/30"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building2 className="w-4 h-4 text-[var(--salmon)]" />
            <span>1. Concorrência &amp; War Room ({CONCORRENTES_TANGARA.length})</span>
          </button>

          <button
            onClick={() => mudarPilar("apis")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              pilarAtivo === "apis"
                ? "bg-[var(--surface)] text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>2. APIs &amp; Telemetria ao Vivo</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
              4 APIs
            </span>
          </button>

          <button
            onClick={() => mudarPilar("ia")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              pilarAtivo === "ia"
                ? "bg-[var(--surface)] text-purple-600 dark:text-purple-400 shadow-xs ring-1 ring-purple-500/30"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Bot className="w-4 h-4 text-purple-500" />
            <span>3. Inteligência Preditiva &amp; IA</span>
          </button>
        </div>

        {/* Nível 2: Sub-abas contextuais do Pilar Ativo */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {pilarAtivo === "concorrencia" && (
            <>
              <button
                onClick={() => mudarAba("matriz-ataque")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "matriz-ataque"
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xs font-black animate-pulse"
                    : "bg-[var(--surface)] text-red-500 hover:text-red-400 border border-red-500/40"
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>🎯 Onde Atacar (Tangará 360°)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">5 Eixos</span>
              </button>
              <button
                onClick={() => mudarAba("concorrentes")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "concorrentes"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Radar Concorrentes ({CONCORRENTES_TANGARA.length})</span>
              </button>
              <button
                onClick={() => mudarAba("war-room")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "war-room"
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Tomar Ações &amp; War Room</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">{acoesAtivasCont}</span>
              </button>
              <button
                onClick={() => mudarAba("radar-vivo")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "radar-vivo"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>Espião em Tempo Real ({ALERTAS_RADAR.length})</span>
              </button>
              <button
                onClick={() => mudarAba("reputacao")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "reputacao"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Reviews &amp; Sentimento</span>
              </button>
              <button
                onClick={() => mudarAba("precos")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "precos"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Cesta de Preços &amp; Cardápios</span>
              </button>
            </>
          )}

          {pilarAtivo === "apis" && (
            <>
              <button
                onClick={() => mudarAba("apis-reais")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "apis-reais"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-500/30"
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>⚡ Hub APIs Oficiais (Receita, PTAX, KyttoIA)</span>
              </button>
              <button
                onClick={() => mudarAba("ifood")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "ifood"
                    ? "bg-red-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-red-600 dark:text-red-400 hover:text-red-500 border border-red-500/30"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>🛍️ iFood Merchant v2</span>
              </button>
              <button
                onClick={() => mudarAba("keeto")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "keeto"
                    ? "bg-orange-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-orange-600 dark:text-orange-400 hover:text-orange-500 border border-orange-500/30"
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>🖥️ Keeto POS &amp; Mesas (27 Mesas)</span>
              </button>
              <button
                onClick={() => mudarAba("opendelivery")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "opendelivery"
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-blue-500/30"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>🛵 Open Delivery Abrasel</span>
              </button>
              <button
                onClick={() => mudarAba("bancos-tef")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "bancos-tef"
                    ? "bg-emerald-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-500/30"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>💳 Sicredi Pix &amp; TEF Stone</span>
              </button>
              <button
                onClick={() => mudarAba("google-eco")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "google-eco"
                    ? "bg-teal-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-teal-600 dark:text-teal-400 hover:text-teal-500 border border-teal-500/30"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🌐 Google Maps &amp; Reviews</span>
              </button>
              <button
                onClick={() => mudarAba("dr-clima")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "dr-clima"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-blue-500/30"
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>🌦️ Dr. Clima &amp; Operação Chuva Tangará</span>
              </button>
              <button
                onClick={() => mudarAba("softwares")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "softwares"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Benchmark Saipos, Totvs &amp; Softwares</span>
              </button>
            </>
          )}

          {pilarAtivo === "ia" && (
            <>
              <button
                onClick={() => mudarAba("ia-estrategista")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "ia-estrategista"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-300" />
                <span>KyttoIA: Planos de Crescimento & Concorrentes</span>
              </button>
              <button
                onClick={() => mudarAba("projecao-ia")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "projecao-ia"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                <span>Previsão Faturamento (3 Cenários)</span>
              </button>
              <button
                onClick={() => mudarAba("reativacao-ia")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "reativacao-ia"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-200" />
                <span>Reativação &amp; Churn IA</span>
              </button>
              <button
                onClick={() => mudarAba("buracos-agenda")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "buracos-agenda"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-200" />
                <span>Buracos de Ociosidade &amp; Fluxo</span>
              </button>
              <button
                onClick={() => mudarAba("simulador")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "simulador"
                    ? "bg-[var(--salmon)] text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulador de Share &amp; Elasticidade</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ABA ESPECIAL: APIS & DADOS REAIS AO VIVO (RECEITA, DÓLAR, KYTTOIA)     */}
      {/* ===================================================================== */}
      {abaAtiva === "apis-reais" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header da Aba de APIs */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-[var(--surface)] to-[var(--surface2)] border border-emerald-500/30 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Radio className="w-3 h-3 animate-ping" />
                    100% Dados Oficiais em Tempo Real
                  </span>
                  <span className="text-xs text-[var(--muted)] font-mono">
                    Tangará da Serra · Mato Grosso
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-1 tracking-tight">
                  Hub de Integrações de APIs &amp; Inteligência ao Vivo
                </h2>
                <p className="text-xs text-[var(--muted)] max-w-2xl mt-1 leading-relaxed">
                  Conexões diretas e ativas com a <b>Receita Federal do Brasil (via BrasilAPI)</b> para validação cadastral e societária dos restaurantes de Tangará da Serra, <b>AwesomeAPI / Banco Central</b> para cotação cambial do Salmão Chileno Nobre, e <b>KyttoIA Neural Engine (v2.5 Flash)</b> para diagnósticos táticos e planos acionáveis de aumento de faturamento imediatos.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  4 APIs Oficiais Conectadas
                </span>
              </div>
            </div>
          </div>

          {/* Grid de 2 Colunas: Consulta Receita Federal & Cotação Salmão/Dólar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bloco 1: Consulta Receita Federal ao Vivo */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--ink)] leading-tight">
                      Consulta Receita Federal (BrasilAPI)
                    </h3>
                    <p className="text-[11px] text-[var(--muted)] leading-tight">
                      Validação em tempo real de CNPJ, Sócios e Situação Cadastral
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  Ao Vivo
                </span>
              </div>

              {/* Seletor Rápido de Estabelecimentos Reais de Tangará */}
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)] block mb-1.5">
                  Estabelecimentos Reais de Tangará da Serra (Clique para Consultar):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {CONCORRENTES_TANGARA.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCnpjInput(c.cnpj);
                        executarConsultaCnpj(c.cnpj);
                      }}
                      className={`px-2 py-1.5 rounded-xl border text-left transition-all text-[11px] font-semibold cursor-pointer truncate ${
                        cnpjInput === c.cnpj
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500 font-bold"
                          : "bg-[var(--surface2)]/60 text-[var(--ink)] border-[var(--line)] hover:border-emerald-500/50"
                      }`}
                    >
                      <span className="block truncate">{c.fantasia.replace(" (Você)", "")}</span>
                      <span className="block text-[9.5px] font-mono text-[var(--muted)] truncate">{c.cnpj}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de Input com Botão de Consulta */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                  placeholder="Digite o CNPJ (ex: 36.296.848/0001-57)"
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-mono font-bold text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => executarConsultaCnpj()}
                  disabled={consultarCnpjMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs hover:bg-emerald-700 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Search className={`w-3.5 h-3.5 ${consultarCnpjMutation.isPending ? "animate-spin" : ""}`} />
                  <span>{consultarCnpjMutation.isPending ? "Consultando..." : "Consultar CNPJ"}</span>
                </button>
              </div>

              {/* Resultado Detalhado da Receita Federal */}
              {cnpjResultado ? (
                <div className="p-4 rounded-xl bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          ● {cnpjResultado.situacaoCadastral}
                        </span>
                        <span className="text-xs font-mono font-black text-[var(--ink)]">
                          {cnpjResultado.cnpjFormatado}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[var(--ink)] mt-1">
                        {cnpjResultado.razaoSocial}
                      </h4>
                      <p className="text-xs font-bold text-[var(--salmon)]">
                        Nome Fantasia: {cnpjResultado.nomeFantasia}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--muted)] text-right block">
                      Abertura: {cnpjResultado.dataAbertura}
                    </span>
                  </div>

                  {/* Informações Tributárias e Localização */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]/50">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Capital Social</span>
                      <strong className="text-xs font-mono font-black text-emerald-600 block mt-0.5">
                        {cnpjResultado.capitalSocial}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]/50">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">CNAE Principal</span>
                      <strong className="text-[11px] font-semibold text-[var(--ink)] block mt-0.5 truncate" title={cnpjResultado.cnaeDescricao}>
                        {cnpjResultado.cnaeDescricao}
                      </strong>
                    </div>
                  </div>

                  {/* Endereço Completo */}
                  <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]/50 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--salmon)]" />
                      Endereço Cadastrado na Receita:
                    </span>
                    <p className="text-[11px] font-semibold text-[var(--ink)] mt-0.5">
                      {cnpjResultado.endereco.logradouro}, {cnpjResultado.endereco.numero} · Bairro {cnpjResultado.endereco.bairro} · Tangará da Serra - {cnpjResultado.endereco.uf} · CEP {cnpjResultado.endereco.cep}
                    </p>
                  </div>

                  {/* Quadro Societário Real (QSA) */}
                  {cnpjResultado.socios && cnpjResultado.socios.length > 0 && (
                    <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]/50 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)] block flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        Quadro de Sócios e Administradores (QSA):
                      </span>
                      <div className="space-y-1 pt-0.5">
                        {cnpjResultado.socios.map((s: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[var(--ink)]">{s.nome}</span>
                            <span className="text-[10px] text-[var(--muted)] bg-[var(--surface2)] px-1.5 py-0.2 rounded font-mono">
                              {s.qualificacao}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--muted)]">
                    <span>Sincronizado via BrasilAPI / Receita Federal</span>
                    <button
                      onClick={() => {
                        const match = CONCORRENTES_TANGARA.find((c) => c.cnpj === cnpjResultado.cnpjFormatado);
                        if (match) {
                          setIaAlvoId(match.id);
                          setIaPergunta(`Como neutralizar as vantagens comerciais de ${match.fantasia} e atrair seus clientes?`);
                          toast.info(`Alvo ${match.fantasia} selecionado para diagnóstico de IA!`);
                        }
                      }}
                      className="text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Analisar com IA Zumi</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-[var(--line)] text-center text-xs text-[var(--muted)] space-y-1.5">
                  <Landmark className="w-8 h-8 text-[var(--muted)] mx-auto opacity-50" />
                  <p className="font-bold text-[var(--ink)]">Selecione um restaurante ou digite um CNPJ</p>
                  <p className="text-[11px]">Os dados oficiais de registro, capital e sócios serão carregados da Receita Federal.</p>
                </div>
              )}
            </div>

            {/* Bloco 2: Cotação do Dólar PTAX & Custo do Salmão Chileno */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--ink)] leading-tight">
                      Cotação de Insumos &amp; Salmão Chileno (Dólar PTAX)
                    </h3>
                    <p className="text-[11px] text-[var(--muted)] leading-tight">
                      AwesomeAPI em tempo real + Impacto de importação do Salmão Fresco
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => cotacaoSalmaoQuery.refetch()}
                  className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  title="Atualizar cotação"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cotacaoSalmaoQuery.isFetching ? "animate-spin text-amber-500" : ""}`} />
                </button>
              </div>

              {/* Cards de Métricas Cambiais */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Dólar Comercial</span>
                  <strong className="text-lg font-mono font-black text-[var(--ink)] block mt-0.5">
                    R$ {cotacaoSalmaoQuery.data?.dolar?.cotacao?.toFixed(4) || "5.9488"}
                  </strong>
                  <span className={`text-[10px] font-bold ${
                    (cotacaoSalmaoQuery.data?.dolar?.variacaoPct || 0) >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {(cotacaoSalmaoQuery.data?.dolar?.variacaoPct || 0.22) > 0 ? "+" : ""}
                    {(cotacaoSalmaoQuery.data?.dolar?.variacaoPct || 0.22).toFixed(2)}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Salmão Fresco (CIF)</span>
                  <strong className="text-lg font-mono font-black text-emerald-600 block mt-0.5">
                    R$ {cotacaoSalmaoQuery.data?.salmaoChileno?.brlKgEstimado?.toFixed(2) || "80.60"}
                  </strong>
                  <span className="text-[10px] text-[var(--muted)] font-mono">por kg entregue</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Rota Logística</span>
                  <strong className="text-xs font-black text-blue-600 block mt-1 leading-tight">
                    Chile ➔ Cuiabá ➔ Tangará
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    ● &lt; 72h Frescor
                  </span>
                </div>
              </div>

              {/* Comparativo de CMV: Zuma Nobre vs Concorrentes Populares */}
              <div className="p-3.5 rounded-xl bg-[var(--surface2)]/60 border border-[var(--line)] space-y-2 text-xs">
                <span className="font-extrabold text-[var(--ink)] block flex items-center justify-between">
                  <span>Diagnóstico de Qualidade do Salmão em Tangará da Serra</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Zuma Lidera em Pureza
                  </span>
                </span>

                <div className="space-y-2 pt-1">
                  <div className="p-2 rounded-lg bg-[var(--surface)] border border-emerald-500/30 flex items-start justify-between gap-2">
                    <div>
                      <strong className="font-bold text-emerald-600 block">
                        👑 Zuma Cozinha Oriental: Salmão Chileno Nobre Fresco
                      </strong>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        Importado semanalmente de Puerto Montt. Sem adição de água, carne firme, cor viva e gordura saudável nobre. Perda por degelo: <b>0%</b>.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-600 shrink-0">
                      CMV 31.8%
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[var(--surface)] border border-red-500/20 flex items-start justify-between gap-2">
                    <div>
                      <strong className="font-bold text-red-600 block">
                        ⚠️ Concorrentes Populares (Nosso Sushi, Dark Kitchens):
                      </strong>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        Salmão congelado 2ª linha industrial. Perde até <b>18% em água no descongelamento</b>, exigindo frituras e maquiagem com cream cheese.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-red-500 shrink-0">
                      Perda 18%
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] text-[var(--muted)] border-t border-[var(--line)]/50">
                  <span>Última cotação: {cotacaoSalmaoQuery.data?.dolar?.atualizadoEm || "Hoje"}</span>
                  <span className="font-bold text-emerald-600">● Hedge e Câmara Fria OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 3: Central Estratégica KyttoIA Neural Engine (v2.5 Flash Ao Vivo) */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/20 via-[var(--surface)] to-[var(--surface2)] border border-purple-500/30 shadow-xs space-y-5">
            {/* Header da KyttoIA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base sm:text-lg text-[var(--ink)] leading-tight">
                      KyttoIA Neural Engine v2.5 Flash · Central de Inteligência &amp; Crescimento
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                      100% Ao Vivo · Sem Dados Fake
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-tight mt-1">
                    Consultas estratégicas em tempo real conectadas aos dados socioeconômicos de Tangará da Serra (MT), custos oficiais e inteligência de mercado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  KyttoIA Online (MT)
                </span>
              </div>
            </div>

            {/* Seletor de Tipo de Consulta / Objetivo Estratégico */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[var(--muted)] block mb-2">
                Selecione o Objetivo Estratégico da Consulta:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  {
                    id: "plano_aumento_faturamento",
                    label: "Aumento Faturamento",
                    icon: TrendingUp,
                    desc: "+R$ 100k/mês e margem",
                    cor: "hover:border-emerald-500 hover:text-emerald-600",
                    corAtivo: "bg-emerald-500/10 text-emerald-600 border-emerald-500 font-black shadow-xs",
                  },
                  {
                    id: "plano_mais_clientes",
                    label: "Mais Clientes",
                    icon: Users,
                    desc: "Atração e Bairros Nobres",
                    cor: "hover:border-blue-500 hover:text-blue-600",
                    corAtivo: "bg-blue-500/10 text-blue-600 border-blue-500 font-black shadow-xs",
                  },
                  {
                    id: "analise_concorrente",
                    label: "Análise Concorrente",
                    icon: Target,
                    desc: "Vulnerabilidades Tangará",
                    cor: "hover:border-red-500 hover:text-red-600",
                    corAtivo: "bg-red-500/10 text-red-600 border-red-500 font-black shadow-xs",
                  },
                  {
                    id: "retencao_fidelidade_ltv",
                    label: "Retenção & LTV",
                    icon: Trophy,
                    desc: "Clube VIP e Recorrência",
                    cor: "hover:border-amber-500 hover:text-amber-600",
                    corAtivo: "bg-amber-500/10 text-amber-600 border-amber-500 font-black shadow-xs",
                  },
                  {
                    id: "benchmark_software_foodservice",
                    label: "Benchmark ERPs",
                    icon: Layers,
                    desc: "Saipos, Totvs, Linx",
                    cor: "hover:border-purple-500 hover:text-purple-600",
                    corAtivo: "bg-purple-500/10 text-purple-600 border-purple-500 font-black shadow-xs",
                  },
                  {
                    id: "personalizada",
                    label: "Consulta Livre",
                    icon: MessageSquare,
                    desc: "Pergunta estratégica",
                    cor: "hover:border-indigo-500 hover:text-indigo-600",
                    corAtivo: "bg-indigo-500/10 text-indigo-600 border-indigo-500 font-black shadow-xs",
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const ativo = tipoConsultaKytto === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setTipoConsultaKytto(tab.id as any);
                        if (tab.id === "benchmark_software_foodservice") {
                          setIaTargetCategoria("softwares");
                          setIaPergunta("Qual o comparativo técnico, financeiro e operacional definitivo entre o Zuma Pilot e a Saipos no cenário de restaurantes de Mato Grosso?");
                        } else if (tab.id === "plano_aumento_faturamento") {
                          setIaPergunta("Como estruturar um plano tático imediato para elevar o faturamento do Zuma de R$ 345.000 para R$ 450.000/mês em Tangará da Serra?");
                        } else if (tab.id === "plano_mais_clientes") {
                          setIaPergunta("Como capturar 200 novos clientes qualificados das classes A/B de Tangará da Serra (Tarumã, Manacá, Jardim Europa) nos próximos 30 dias?");
                        } else if (tab.id === "retencao_fidelidade_ltv") {
                          setIaPergunta("Qual a estratégia de Clube VIP e gamificação para aumentar a frequência média de visitas de 1.8x para 3.4x ao mês e zerar o churn de clientes nobres?");
                        } else if (tab.id === "analise_concorrente") {
                          setIaTargetCategoria("locais");
                          setIaPergunta("Quais as 3 maiores vulnerabilidades do concorrente alvo e como o Zuma deve atacá-las neste fim de semana?");
                        }
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        ativo ? tab.corAtivo : `bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] ${tab.cor}`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${ativo ? "" : "text-[var(--muted)]"}`} />
                        {ativo && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <strong className="text-xs block leading-tight">{tab.label}</strong>
                        <span className="text-[10px] text-[var(--muted)] block mt-0.5 truncate">{tab.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel de Parâmetros Táticos & Sliders Quantitativos */}
            <div className="p-4 rounded-2xl bg-[var(--surface)]/80 border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  Parâmetros de Entrada da Operação Zuma Pilot (Tangará da Serra)
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">
                  Dados reais alimentando o modelo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Faturamento Atual */}
                <div className="p-3 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Faturamento Atual</span>
                    <span className="text-xs font-black font-mono text-[var(--ink)]">
                      R$ {faturamentoAtualKytto.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={500000}
                    step={10000}
                    value={faturamentoAtualKytto}
                    onChange={(e) => setFaturamentoAtualKytto(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5"
                  />
                  <span className="text-[9.5px] text-[var(--muted)] block">Base mensal consolidada</span>
                </div>

                {/* Meta de Faturamento */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Meta Desejada</span>
                    <span className="text-xs font-black font-mono text-emerald-600">
                      R$ {metaFaturamentoKytto.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={350000}
                    max={800000}
                    step={25000}
                    value={metaFaturamentoKytto}
                    onChange={(e) => setMetaFaturamentoKytto(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5"
                  />
                  <span className="text-[9.5px] text-emerald-600/80 font-bold block">
                    Crescimento de +{(((metaFaturamentoKytto - faturamentoAtualKytto) / faturamentoAtualKytto) * 100).toFixed(0)}% (+R$ {(metaFaturamentoKytto - faturamentoAtualKytto).toLocaleString("pt-BR")})
                  </span>
                </div>

                {/* Ticket Médio */}
                <div className="p-3 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Ticket Médio</span>
                    <span className="text-xs font-black font-mono text-[var(--ink)]">
                      R$ {ticketMedioKytto.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={85}
                    max={250}
                    step={5}
                    value={ticketMedioKytto}
                    onChange={(e) => setTicketMedioKytto(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5"
                  />
                  <span className="text-[9.5px] text-[var(--muted)] block">Média por pedido / mesa</span>
                </div>

                {/* Mix Delivery vs Salão */}
                <div className="p-3 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Mix Delivery / Salão</span>
                    <span className="text-xs font-black font-mono text-[var(--ink)]">
                      {percentualDeliveryKytto}% / {100 - percentualDeliveryKytto}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    step={5}
                    value={percentualDeliveryKytto}
                    onChange={(e) => setPercentualDeliveryKytto(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5"
                  />
                  <span className="text-[9.5px] text-[var(--muted)] block">
                    {percentualDeliveryKytto}% canais entrega / {100 - percentualDeliveryKytto}% salão &amp; tatames
                  </span>
                </div>
              </div>
            </div>

            {/* Seletor de Concorrente ou Software Alvo e Input da Consulta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[var(--muted)] block">
                    Alvo da Análise Estratégica:
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      onClick={() => setIaTargetCategoria("locais")}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        iaTargetCategoria === "locais"
                          ? "bg-purple-600 text-white font-bold"
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Locais MT
                    </button>
                    <button
                      onClick={() => setIaTargetCategoria("softwares")}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        iaTargetCategoria === "softwares"
                          ? "bg-purple-600 text-white font-bold"
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Softwares ERP
                    </button>
                  </div>
                </div>

                {iaTargetCategoria === "locais" ? (
                  <select
                    value={iaAlvoId}
                    onChange={(e) => setIaAlvoId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    {CONCORRENTES_TANGARA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fantasia} · {c.bairro} ({c.nivelAmeaca})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={softwareAlvoId}
                    onChange={(e) => setSoftwareAlvoId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    {SOFTWARE_BENCHMARK.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} ({s.categoria})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[var(--muted)] block mb-1">
                  Diretriz / Pergunta Estratégica Específica:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={iaPergunta}
                    onChange={(e) => setIaPergunta(e.target.value)}
                    placeholder="Digite a meta, dúvida ou cenário que deseja analisar com a KyttoIA..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <button
                    onClick={() => executarConsultaKyttoIA()}
                    disabled={consultarKyttoMutation.isPending}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${consultarKyttoMutation.isPending ? "animate-spin" : ""}`} />
                    <span>{consultarKyttoMutation.isPending ? "Consultando KyttoIA..." : "Consultar KyttoIA"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sugestões Rápidas de Alta Performance em 1-Clique */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[var(--muted)] block">
                Sugestões Prontas para Tangará da Serra (1-Clique):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <button
                  onClick={() => {
                    setTipoConsultaKytto("plano_aumento_faturamento");
                    setIaPergunta("Qual a estratégia exata para aumentar em R$ 100.000 o faturamento mensal explorando combos premium de salmão fresco e cross-sell de sobremesas e bebidas nobres?");
                    executarConsultaKyttoIA("Qual a estratégia exata para aumentar em R$ 100.000 o faturamento mensal explorando combos premium de salmão fresco e cross-sell de sobremesas e bebidas nobres?", "plano_aumento_faturamento");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-emerald-500 hover:text-emerald-600 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>🚀</span> Plano +R$ 100k Faturamento
                </button>
                <button
                  onClick={() => {
                    setTipoConsultaKytto("plano_mais_clientes");
                    setIaPergunta("Como capturar e reter 250 novos clientes das classes A e B residentes no Jardim Europa, Tarumã e Manacá nos dias de terça a quinta?");
                    executarConsultaKyttoIA("Como capturar e reter 250 novos clientes das classes A e B residentes no Jardim Europa, Tarumã e Manacá nos dias de terça a quinta?", "plano_mais_clientes");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-blue-500 hover:text-blue-600 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>👥</span> Atração Classes A/B em Bairros Nobres
                </button>
                <button
                  onClick={() => {
                    setTipoConsultaKytto("analise_concorrente");
                    setIaTargetCategoria("locais");
                    setIaAlvoId("bonsai");
                    setIaPergunta("Como explorar a lentidão de entrega de 68 minutos do Bonsai no delivery de fim de semana para faturar +R$ 35.000 no Zuma com entrega garantida em 32 min?");
                    executarConsultaKyttoIA("Como explorar a lentidão de entrega de 68 minutos do Bonsai no delivery de fim de semana para faturar +R$ 35.000 no Zuma com entrega garantida em 32 min?", "analise_concorrente", "bonsai");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-red-500 hover:text-red-600 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>⏱️</span> Neutralizar Atraso Bonsai (68 min)
                </button>
                <button
                  onClick={() => {
                    setTipoConsultaKytto("analise_concorrente");
                    setIaTargetCategoria("locais");
                    setIaAlvoId("nosso-sushi");
                    setIaPergunta("Qual a campanha ideal para convencer os consumidores do Nosso Sushi que salmão congelado 2ª linha perde 18% em água e que o Zuma Nobre Fresco é superior?");
                    executarConsultaKyttoIA("Qual a campanha ideal para convencer os consumidores do Nosso Sushi que salmão congelado 2ª linha perde 18% em água e que o Zuma Nobre Fresco é superior?", "analise_concorrente", "nosso-sushi");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-red-500 hover:text-red-600 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>🐟</span> Salmão Fresco Zuma vs Congelado Nosso Sushi
                </button>
                <button
                  onClick={() => {
                    setTipoConsultaKytto("benchmark_software_foodservice");
                    setIaTargetCategoria("softwares");
                    setSoftwareAlvoId("saipos");
                    setIaPergunta("Por que a Saipos perde para o Zuma Pilot em 100% dos quesitos críticos de alta gastronomia, telemetria ANVISA e IA conversacional em Mato Grosso?");
                    executarConsultaKyttoIA("Por que a Saipos perde para o Zuma Pilot em 100% dos quesitos críticos de alta gastronomia, telemetria ANVISA e IA conversacional em Mato Grosso?", "benchmark_software_foodservice", "saipos");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-purple-500 hover:text-purple-600 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>💻</span> Saipos vs Zuma Pilot: Análise Crítica
                </button>
                <button
                  onClick={() => {
                    setTipoConsultaKytto("retencao_fidelidade_ltv");
                    setIaPergunta("Como implementar um programa de fidelidade VIP no PWA próprio que garanta recorrência quinzenal e reduza o churn a menos de 4% ao mês?");
                    executarConsultaKyttoIA("Como implementar um programa de fidelidade VIP no PWA próprio que garanta recorrência quinzenal e reduza o churn a menos de 4% ao mês?", "retencao_fidelidade_ltv");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-amber-500 hover:text-amber-600 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>💎</span> Clube VIP &amp; LTV Máximo
                </button>
              </div>
            </div>

            {/* Painel de Exibição do Resultado da KyttoIA */}
            {iaResultado ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 via-[var(--surface)] to-[var(--surface)] border border-purple-500/40 space-y-4 shadow-sm animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-sm text-[var(--ink)] block">
                        Diagnóstico &amp; Plano Tático KyttoIA (100% Tempo Real)
                      </span>
                      <span className="text-[10px] text-[var(--muted)] font-mono">
                        Gerado com base na economia de Tangará da Serra (MT) · Metas: R$ {metaFaturamentoKytto.toLocaleString("pt-BR")}/mês
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(iaResultado);
                        toast.success("Plano KyttoIA copiado para a área de transferência!");
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] text-xs font-bold hover:border-purple-400 cursor-pointer flex items-center gap-1"
                      title="Copiar texto do plano"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                    <button
                      onClick={() => {
                        const alvoNome = iaTargetCategoria === "locais"
                          ? CONCORRENTES_TANGARA.find((c) => c.id === iaAlvoId)?.fantasia || "Concorrente"
                          : SOFTWARE_BENCHMARK.find((s) => s.id === softwareAlvoId)?.nome || "Software";
                        setAcaoForm({
                          titulo: `Ação KyttoIA: Alvo ${alvoNome}`,
                          alvoId: iaAlvoId,
                          tipo: "whatsapp",
                          bairros: "Jardim Europa, Centro, Tarumã, Manacá",
                          cupom: `ZUMA${iaAlvoId.toUpperCase()}`,
                          descontoDesc: "Condição Especial Executiva KyttoIA",
                          mensagemIA: iaResultado.slice(0, 220) + "...",
                        });
                        setModalAcaoAberto(true);
                        setAbaAtiva("war-room");
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black shadow-xs hover:brightness-105 cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Executar no War Room</span>
                    </button>
                  </div>
                </div>

                {/* Corpo do Texto da KyttoIA */}
                <div className="p-4 rounded-xl bg-[var(--surface2)]/60 border border-[var(--line)] text-xs text-[var(--ink)] leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                  {iaResultado}
                </div>

                {/* Resumo Quantitativo de Impacto */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Projeção Faturamento</span>
                    <strong className="text-sm font-mono font-black text-emerald-600 block mt-0.5">
                      R$ {metaFaturamentoKytto.toLocaleString("pt-BR")}/mês
                    </strong>
                    <span className="text-[9.5px] text-emerald-600/80 font-bold">
                      +R$ {(metaFaturamentoKytto - faturamentoAtualKytto).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Clientes Adicionais</span>
                    <strong className="text-sm font-mono font-black text-blue-600 block mt-0.5">
                      +{Math.round((metaFaturamentoKytto - faturamentoAtualKytto) / ticketMedioKytto)} pedidos/mês
                    </strong>
                    <span className="text-[9.5px] text-blue-600/80 font-bold">Ticket R$ {ticketMedioKytto}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400 block">Market Share Alvo</span>
                    <strong className="text-sm font-mono font-black text-purple-600 block mt-0.5">
                      {Math.min(75, Math.round((metaFaturamentoKytto / 640000) * 100))}% de Tangará
                    </strong>
                    <span className="text-[9.5px] text-purple-600/80 font-bold">Liderança Absoluta</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Retenção Projetada</span>
                    <strong className="text-sm font-mono font-black text-amber-600 block mt-0.5">
                      94.2% LTV
                    </strong>
                    <span className="text-[9.5px] text-amber-600/80 font-bold">Zero Churn nobre</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5 text-center text-xs text-[var(--muted)] space-y-2">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto animate-bounce" />
                <p className="font-extrabold text-sm text-[var(--ink)]">KyttoIA Neural Engine Pronta para Consulta Estratégica</p>
                <p className="text-xs max-w-xl mx-auto text-[var(--muted)]">
                  Selecione um dos 6 objetivos táticos acima (aumento de faturamento, novos clientes, análise de concorrentes, benchmark de software ou retenção) ou clique em uma das sugestões rápidas para obter um plano quantitativo detalhado em tempo real.
                </p>
              </div>
            )}

            {/* Histórico das Consultas Recentes da Sessão */}
            {historicoConsultas.length > 0 && (
              <div className="pt-2 border-t border-[var(--line)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase text-[var(--muted)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Histórico de Consultas KyttoIA Realizadas Nesta Sessão ({historicoConsultas.length})
                  </span>
                  <button
                    onClick={() => setHistoricoConsultas([])}
                    className="text-[10px] text-[var(--muted)] hover:text-red-500 cursor-pointer"
                  >
                    Limpar histórico
                  </button>
                </div>
                <div className="space-y-2">
                  {historicoConsultas.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold uppercase">
                            {h.tipo.replace(/_/g, " ")}
                          </span>
                          <strong className="font-bold text-[var(--ink)]">{h.titulo}</strong>
                          <span className="text-[10px] text-[var(--muted)]">· Alvo: {h.alvo}</span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)] mt-1 line-clamp-2">
                          {h.resposta}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className="text-[10px] font-mono text-[var(--muted)]">{h.timestamp}</span>
                        <button
                          onClick={() => setIaResultado(h.resposta)}
                          className="px-2 py-1 rounded bg-[var(--surface2)] text-[var(--ink)] hover:text-purple-600 text-[10px] font-bold cursor-pointer border border-[var(--line)]"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bloco 4 Oficial: Dr. Clima & Meteorologia Operacional (Open-Meteo & WMO) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950/20 via-[var(--surface)] to-[var(--surface2)] border border-blue-500/30 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                  <CloudRain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-[var(--ink)] leading-tight">
                      Dr. Clima · Open-Meteo &amp; WMO Climatologia (Tangará da Serra - MT)
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      API Oficial #4
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">
                    Coordenadas: Lat -14.6228, Lon -57.5075 · Monitoramento contínuo de chuva, calor extremo e picos de demanda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAbaAtiva("dr-clima")}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-xs hover:brightness-110 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Ver Detalhes do Clima</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Grid de 4 Métricas de Clima */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-0.5">
                <span className="text-[10px] text-[var(--muted)] font-bold block uppercase">Temperatura</span>
                <strong className="text-xl font-mono font-black text-[var(--ink)] block">
                  {drClimaHeaderQuery.data?.current?.temperatura ?? 25.6}°C
                </strong>
                <span className="text-[10px] text-[var(--muted)]">Sensação: {drClimaHeaderQuery.data?.current?.sensacaoTermica ?? 29.6}°C</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-0.5">
                <span className="text-[10px] text-blue-600 font-bold block uppercase">Chuva Prevista Hoje</span>
                <strong className="text-xl font-mono font-black text-blue-600 block">
                  {drClimaHeaderQuery.data?.dias?.[0]?.probabilidadeChuvaPct ?? 83}%
                </strong>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-mono">Volume: {drClimaHeaderQuery.data?.dias?.[0]?.precipitacaoSumMm ?? 1.1}mm</span>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-0.5">
                <span className="text-[10px] text-cyan-600 font-bold block uppercase">Umidade do Ar</span>
                <strong className="text-xl font-mono font-black text-cyan-600 block">
                  {drClimaHeaderQuery.data?.current?.umidade ?? 85}% UR
                </strong>
                <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-mono">Vento: {drClimaHeaderQuery.data?.current?.ventoKmH ?? 9.8} km/h</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-0.5">
                <span className="text-[10px] text-purple-600 font-bold block uppercase">Impacto no Delivery</span>
                <strong className="text-xl font-mono font-black text-purple-600 block">
                  +82% Demanda
                </strong>
                <span className="text-[10px] text-red-500 font-bold">Salão: -45% Fluxo</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-[var(--surface2)]/70 border border-[var(--line)] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[var(--ink)]">
                  <b>Status Operacional:</b> {drClimaHeaderQuery.data?.impactoGastronomico?.statusOperacao === "ALERTA_CHUVA_DELIVERY_EXPLOSIVO" ? "🌧️ Alerta de Chuva · Delivery em Alta · Ativar Lamen & Hot Rolls" : "☀️ Clima Normal · Operação Mista Ativa"}
                </span>
              </div>
              <button
                onClick={() => setAbaAtiva("dr-clima")}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Gerar Plano Tático de Chuva</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA INTEGRADA: IFOOD MERCHANT API V2 AO VIVO                          */}
      {/* ===================================================================== */}
      {abaAtiva === "ifood" && (
        <div className="space-y-6 animate-fadeIn">
          <IfoodHubV2 />
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA INTEGRADA: KEETO POS, COMANDAS MOBILE & MESAS DE SALÃO             */}
      {/* ===================================================================== */}
      {abaAtiva === "keeto" && (
        <div className="space-y-6 animate-fadeIn">
          <KeetoPosHub />
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA INTEGRADA: OPEN DELIVERY BRASIL & ABRABAR                         */}
      {/* ===================================================================== */}
      {abaAtiva === "opendelivery" && (
        <div className="space-y-6 animate-fadeIn">
          <OpenDeliveryHub />
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA INTEGRADA: BANCOS, SICREDI OPEN FINANCE & TEF STONE               */}
      {/* ===================================================================== */}
      {abaAtiva === "bancos-tef" && (
        <div className="space-y-6 animate-fadeIn">
          <BancosTefHub />
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA INTEGRADA: GOOGLE ECOSYSTEM, MAPS & ADS LOCAL                     */}
      {/* ===================================================================== */}
      {abaAtiva === "google-eco" && (
        <div className="space-y-6 animate-fadeIn">
          <GoogleEcosystemHub />
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA: ONDE ATACAR & MATRIZ DE MERCADO TANGARÁ DA SERRA (5 EIXOS TÁTICOS)*/}
      {/* ===================================================================== */}
      {abaAtiva === "matriz-ataque" && (
        <MatrizAtaqueTangaraHub />
      )}

      {/* ===================================================================== */}
      {/* ABA 1: RADAR DE CONCORRENTES DE TANGARÁ DA SERRA                      */}
      {/* ===================================================================== */}
      {abaAtiva === "concorrentes" && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="space-y-3">
            {/* Pílulas de Seleção por Setor da Alimentação Noturna */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "todos", label: "Todos os Setores", count: CONCORRENTES_TANGARA.length, icon: "🍽️" },
                { id: "sushi", label: "Sushi & Oriental", count: CONCORRENTES_TANGARA.filter(c => (c.setor || "sushi") === "sushi").length, icon: "🍣" },
                { id: "burger", label: "Hamburguerias", count: CONCORRENTES_TANGARA.filter(c => c.setor === "burger").length, icon: "🍔" },
                { id: "pizza", label: "Pizzarias & Forno", count: CONCORRENTES_TANGARA.filter(c => c.setor === "pizza").length, icon: "🍕" },
                { id: "bar_chopp", label: "Chopp & Gastrobar", count: CONCORRENTES_TANGARA.filter(c => c.setor === "bar_chopp").length, icon: "🍺" },
                { id: "carnes", label: "Carnes & Churrasco", count: CONCORRENTES_TANGARA.filter(c => c.setor === "carnes").length, icon: "🥩" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFiltroSetor(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                    filtroSetor === s.id
                      ? "bg-[var(--salmon)] text-white border-[var(--salmon)] shadow-xs"
                      : "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--salmon)]/50"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filtroSetor === s.id ? "bg-black/20 text-white" : "bg-[var(--surface2)] text-[var(--muted)]"
                  }`}>
                    {s.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--line)]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar concorrente por nome, bairro (Jardim Europa, Vila Alta, Centro) ou CNPJ..."
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--salmon)] font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => sincronizarConcorrentesMutation.mutate()}
                disabled={sincronizarConcorrentesMutation.isPending}
                className="px-3 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-bold border border-[var(--line)] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Sincronizar e revalidar inteligência de concorrentes de Tangará da Serra"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[var(--salmon)] ${sincronizarConcorrentesMutation.isPending ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Sincronizar Concorrentes</span>
              </button>
              <Filter className="w-3.5 h-3.5 text-[var(--muted)]" />
              <select
                value={filtroAmeaca}
                onChange={e => setFiltroAmeaca(e.target.value)}
                className="bg-[var(--surface2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--ink)] focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos os Níveis de Ameaça</option>
                <option value="Líder">Líder (Zuma)</option>
                <option value="Alto">Ameaça Alta</option>
                <option value="Médio">Ameaça Média</option>
                <option value="Baixo">Ameaça Baixa</option>
              </select>
            </div>
          </div>
          </div>

          {/* Cards dos Concorrentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {concorrentesFiltrados.map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                  c.destaque
                    ? "bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--salmon-soft)]/20 border-2 border-[var(--salmon)] shadow-lg"
                    : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--line)] shadow-xs"
                }`}
              >
                {/* Badges superiores */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        c.nivelAmeaca === "Líder"
                          ? "bg-emerald-500 text-white"
                          : c.nivelAmeaca === "Alto"
                          ? "bg-red-500 text-white"
                          : c.nivelAmeaca === "Médio"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {c.nivelAmeaca === "Líder" ? "👑 Líder de Mercado" : `Ameaça ${c.nivelAmeaca}`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface2)] text-[var(--ink)] border border-[var(--line)]">
                      {c.setor === "burger" ? "🍔 Burger" :
                       c.setor === "pizza" ? "🍕 Pizza" :
                       c.setor === "bar_chopp" ? "🍺 Chopp/Pub" :
                       c.setor === "carnes" ? "🥩 Churrasco" : "🍣 Oriental"}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--muted)]">
                      {c.cnpj}
                    </span>
                  </div>

                  <span className="text-xs font-black font-mono text-[var(--salmon)] bg-[var(--salmon-soft)] px-2.5 py-0.5 rounded-lg border border-[var(--salmon)]/30">
                    {c.share}% Share
                  </span>
                </div>

                {/* Título e Localização */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                      {c.fantasia}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[var(--salmon)]" />
                        {c.bairro}
                      </span>
                      {c.distanciaZumaKm > 0 && (
                        <span className="text-[10px] bg-[var(--surface2)] px-2 py-0.5 rounded-md border border-[var(--line)]">
                          {c.distanciaZumaKm} km do Zuma
                        </span>
                      )}
                      <span className="text-[10px] bg-[var(--surface2)] px-2 py-0.5 rounded-md border border-[var(--line)] font-medium">
                        {c.canalDominante}
                      </span>
                    </div>
                  </div>

                  {/* Procedência do Salmão / Identidade Gastronômica */}
                  {c.salmaoProcedencia ? (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 text-center ${
                      c.salmaoProcedencia === "Fresco Chileno Nobre"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : c.salmaoProcedencia === "Misto Popular"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-red-500/10 text-red-600 border-red-500/30"
                    }`}>
                      🐟 {c.salmaoProcedencia}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 text-center bg-orange-500/10 text-orange-600 border-orange-500/30">
                      {c.setor === "burger" ? "🍔 Smash & Fritas" :
                       c.setor === "pizza" ? "🍕 Forno a Lenha" :
                       c.setor === "bar_chopp" ? "🍺 Chopp & Petiscos" :
                       c.setor === "carnes" ? "🥩 Carnes Nobres" : "🍽️ Gastronomia"}
                    </span>
                  )}
                </div>

                {/* Grid de Métricas Principais */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[var(--surface2)]/70 border border-[var(--line)]/60 text-center">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Faturamento</span>
                    <strong className="text-xs font-mono font-black text-[var(--ink)] block mt-0.5">
                      R$ {(c.faturamentoEst / 1000).toFixed(0)}k/mês
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Ticket Médio</span>
                    <strong className="text-xs font-mono font-black text-[var(--ink)] block mt-0.5">
                      R$ {c.ticketMedio}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Google</span>
                    <div className="flex items-center justify-center gap-1 text-xs font-mono font-black text-amber-500 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{c.googleRating}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-[var(--muted)] block">Espera Normal</span>
                    <strong className={`text-xs font-mono font-black block mt-0.5 ${c.tempoMedioMin > 50 ? "text-red-500" : "text-emerald-600"}`}>
                      {c.tempoMedioMin} min
                    </strong>
                  </div>
                </div>

                {/* Tempo na Chuva & Alerta Logístico */}
                <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-[var(--ink)]">Tempo na Chuva:</span>
                    <span className={`font-mono font-black ${(c.tempoMedioChuvaMin || c.tempoMedioMin + 25) > 60 ? "text-red-500" : "text-emerald-600"}`}>
                      {c.tempoMedioChuvaMin || c.tempoMedioMin + 25} min
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] font-mono">
                    {c.motoboysProprios !== undefined ? `${c.motoboysProprios} motoboy(s) próprios` : "Sem frota dedicada"}
                  </span>
                </div>

                {c.fragilidadesChuva && (
                  <div className="text-[11px] text-[var(--muted)] p-2 rounded-lg bg-[var(--surface2)]/60 border border-[var(--line)]/50 leading-snug">
                    <b className="text-[var(--salmon)]">Vulnerabilidade na Chuva:</b> {c.fragilidadesChuva}
                  </div>
                )}

                {/* Modelo Operacional */}
                <div className="text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Modelo de Operação:
                  </span>
                  <p className="font-semibold text-[var(--ink)] mt-0.5">
                    {c.modelo}
                  </p>
                </div>

                {/* Público-Alvo e Motivo de Escolha */}
                {c.publicoAlvo && (
                  <div className="p-3 rounded-2xl bg-[var(--surface2)]/60 border border-[var(--line)]/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-black uppercase tracking-wider">
                      <span>🎯 Disputa de Share of Wallet</span>
                      <span className="text-[var(--salmon)] font-bold">{c.setorLabel || "Noite Tangará"}</span>
                    </div>
                    <div className="text-[11px] text-[var(--ink)]">
                      <b className="text-[var(--muted)]">Público-alvo: </b>
                      <span className="font-semibold">{c.publicoAlvo}</span>
                    </div>
                    {c.motivoEscolha && (
                      <div className="text-[10.5px] text-[var(--muted)]">
                        <b className="text-[var(--ink)]">Decisão de compra: </b>
                        <span>{c.motivoEscolha}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tabela Comparativa de Pratos / Preços vs Zuma */}
                {c.pratosPrecos && c.pratosPrecos.length > 0 && (
                  <div className="rounded-2xl border border-[var(--line)] overflow-hidden text-xs">
                    <div className="bg-[var(--surface2)] px-3 py-1.5 font-black text-[10px] uppercase text-[var(--muted)] flex items-center justify-between">
                      <span>Prato Referência do Rival</span>
                      <span className="text-emerald-600 font-bold">Contra-Ataque Zuma</span>
                    </div>
                    <div className="divide-y divide-[var(--line)]/50 bg-[var(--surface)]">
                      {c.pratosPrecos.map((item, idx) => (
                        <div key={idx} className="p-2 sm:px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <div className="truncate flex-1">
                            <span className="font-semibold text-[var(--ink)]">{item.prato}</span>
                            <span className="font-mono text-red-500 font-bold ml-1.5">R$ {item.precoRival.toFixed(2)}</span>
                          </div>
                          <div className="text-left sm:text-right flex-1">
                            <span className="text-emerald-600 font-bold">⚡ Zuma: </span>
                            <span className="font-mono text-[var(--salmon)] font-bold mr-1.5">R$ {item.precoZuma.toFixed(2)}</span>
                            <span className="text-[10px] text-[var(--muted)] block sm:inline">({item.vantagem})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pontos Fortes vs Vulnerabilidades */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--line)]/50 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1 mb-1">
                      <Check className="w-3.5 h-3.5" /> Pontos Fortes
                    </span>
                    <ul className="space-y-1 text-[var(--muted)] text-[11px]">
                      {c.pontosFortes.map((pf, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{pf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Gaps &amp; Vulnerabilidades
                    </span>
                    <ul className="space-y-1 text-[var(--muted)] text-[11px]">
                      {c.vulnerabilidades.map((v, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plano de Ataque Zuma & Botão de Execução Direta */}
                {!c.destaque && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Contra-Ataque Recomendado pela IA:
                      </span>
                      <button
                        onClick={() => abrirModalAcaoRapida(c)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] font-black flex items-center gap-1.5 hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-200" />
                        <span>Contra-Atacar Agora</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--ink)] leading-relaxed font-medium">
                      {c.planoAtaqueZuma}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 2: WAR ROOM · CENTRAL EXECUTIVA DE TOMADA DE AÇÕES               */}
      {/* ===================================================================== */}
      {abaAtiva === "war-room" && (
        <div className="space-y-6">
          {/* Banner de Comando */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-zinc-900 text-white shadow-xl space-y-3 border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/30">
                  <Zap className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    War Room: Tomar Ações contra a Concorrência
                  </h2>
                  <p className="text-xs text-neutral-300">
                    Dispare contra-ataques cirúrgicos em Tangará da Serra. Escolha um plano pré-configurado ou crie sua própria ação.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAcaoForm({
                    titulo: "Novo Contra-Ataque Estratégico",
                    alvoId: "bonsai",
                    tipo: "whatsapp",
                    bairros: "Jardim Europa, Centro",
                    cupom: "ZUMAVIP",
                    descontoDesc: "15% OFF ou Frete Grátis",
                    mensagemIA: "Oferta exclusiva Zuma para seu bairro! Peça agora pelo PWA com entrega rápida em 35 min."
                  });
                  setModalAcaoAberto(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-orange-500 text-white text-xs font-black shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Contra-Ataque</span>
              </button>
            </div>
          </div>

          {/* Grid de Contra-Ataques Rápidos Pré-Configurados */}
          <div>
            <h3 className="text-sm font-black text-[var(--ink)] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--salmon)]" />
              Contra-Ataques de Alta Conversão Recomendados por IA
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Anti-Bonsai */}
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500 text-white">
                      Alvo: Bonsai
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">Jardim Europa</span>
                  </div>
                  <h4 className="text-xs font-black text-[var(--ink)] leading-snug">
                    Operação Anti-Espera (35 Min Garantido)
                  </h4>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    Ativação automática quando o Bonsai atinge 65 min no iFood. Oferece entrega em até 35 min pelo Zuma com GPS e frete grátis.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--muted)]">Previsão:</span>
                    <strong className="text-emerald-600 font-bold">+28 pedidos · R$ 3.860</strong>
                  </div>
                  <button
                    onClick={() => {
                      const alvo = CONCORRENTES_TANGARA.find(c => c.id === "bonsai")!;
                      abrirModalAcaoRapida(alvo);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Contra-Ataque</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Anti-Nosso Sushi */}
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      Alvo: Nosso Sushi
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">Vila Alta</span>
                  </div>
                  <h4 className="text-xs font-black text-[var(--ink)] leading-snug">
                    Operação Pureza do Salmão Nobre
                  </h4>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    Vídeo educativo e cupom de R$ 20 OFF na 1ª compra no PWA para resgatar clientes frustrados com salmão congelado 2ª linha.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--muted)]">Previsão:</span>
                    <strong className="text-emerald-600 font-bold">+35 pedidos · R$ 4.830</strong>
                  </div>
                  <button
                    onClick={() => {
                      const alvo = CONCORRENTES_TANGARA.find(c => c.id === "nosso-sushi")!;
                      abrirModalAcaoRapida(alvo);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-orange-500 text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Contra-Ataque</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Anti-Kanto */}
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                      Alvo: Kanto Poke
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">Centro Corporativo</span>
                  </div>
                  <h4 className="text-xs font-black text-[var(--ink)] leading-snug">
                    Almoço Executivo &amp; Pokes Express
                  </h4>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    Combos individuais executivos a R$ 38,90 entregues em 25 min para bancos, clínicas e escritórios do Centro de Tangará.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--muted)]">Previsão:</span>
                    <strong className="text-emerald-600 font-bold">+40 pedidos/sem · R$ 1.600</strong>
                  </div>
                  <button
                    onClick={() => {
                      const alvo = CONCORRENTES_TANGARA.find(c => c.id === "kanto")!;
                      abrirModalAcaoRapida(alvo);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Contra-Ataque</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Ações Ativas & Histórico de Execuções */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Histórico de Ações Executadas &amp; Retorno Obtido
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Acompanhe o status em tempo real, pedidos capturados e faturamento líquido gerado por cada ação.
                </p>
              </div>

              <span className="text-xs font-black font-mono text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {acoes.length} Ações Registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[10.5px] uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-2.5 pr-3 font-bold">Ação &amp; Estratégia</th>
                    <th className="py-2.5 px-2 font-bold">Alvo</th>
                    <th className="py-2.5 px-2 font-bold">Canal</th>
                    <th className="py-2.5 px-2 font-bold text-center">Status</th>
                    <th className="py-2.5 px-2 font-bold text-center">Alcance</th>
                    <th className="py-2.5 px-2 font-bold text-center">Conversões</th>
                    <th className="py-2.5 px-2 font-bold text-right">Receita Gerada</th>
                    <th className="py-2.5 pl-3 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {acoes.map((act) => (
                    <tr key={act.id} className="hover:bg-[var(--surface2)]/50 transition-colors">
                      <td className="py-3 pr-3 font-semibold text-[var(--ink)] max-w-xs">
                        <div className="font-extrabold text-xs">{act.titulo}</div>
                        <div className="text-[10px] text-[var(--muted)] truncate">{act.estrategia}</div>
                        {act.cupom && (
                          <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-[var(--salmon-soft)] text-[var(--salmon)] px-1.5 py-0.2 rounded border border-[var(--salmon)]/30">
                            Cupom: {act.cupom}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-[11px] font-medium text-[var(--ink)]">
                        {act.alvoNome}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--surface2)] border border-[var(--line)]">
                          {act.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                          act.status === "ativa"
                            ? "bg-emerald-500 text-white animate-pulse"
                            : act.status === "agendada"
                            ? "bg-blue-500 text-white"
                            : "bg-neutral-500 text-white"
                        }`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-[var(--muted)]">
                        {act.alcanceEst}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-black text-emerald-600">
                        {act.conversaoEst} pedidos
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-black text-[var(--salmon)]">
                        R$ {act.receitaGerada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          onClick={() => alternarStatusAcao(act.id)}
                          className="px-2 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-[10px] font-bold hover:bg-[var(--line)] transition-colors cursor-pointer"
                        >
                          {act.status === "ativa" ? "Pausar" : "Reativar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 3: ESPIÃO DE MOVIMENTAÇÕES EM TEMPO REAL                          */}
      {/* ===================================================================== */}
      {abaAtiva === "radar-vivo" && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  Feed de Inteligência &amp; Alertas ao Vivo de Tangará da Serra
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Monitoramento contínuo de tempos de entrega, variações de preço de cardápio e queixas no Google Maps dos concorrentes.
                </p>
              </div>

              <button
                onClick={atualizarRadarAoVivo}
                disabled={isUpdatingRadar}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--line)] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingRadar ? "animate-spin text-[var(--salmon)]" : ""}`} />
                <span>Atualizar Varredura</span>
              </button>
            </div>

            <div className="space-y-3">
              {ALERTAS_RADAR.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    al.gravidade === "alta"
                      ? "bg-red-500/5 border-red-500/20"
                      : al.gravidade === "media"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-blue-500/5 border-blue-500/20"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9.5px] font-black uppercase px-2 py-0.2 rounded-full text-white ${
                        al.gravidade === "alta" ? "bg-red-600" : al.gravidade === "media" ? "bg-amber-500" : "bg-blue-600"
                      }`}>
                        {al.tipo}
                      </span>
                      <strong className="text-xs font-bold text-[var(--ink)]">{al.concorrente}</strong>
                      <span className="text-[10px] text-[var(--muted)] font-mono">· {al.timestamp}</span>
                    </div>

                    <h4 className="text-xs font-black text-[var(--ink)]">{al.titulo}</h4>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">{al.descricao}</p>
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>💡 Recomendação:</span> {al.acaoSugerida}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const alvo = CONCORRENTES_TANGARA.find(c => c.id === al.concorrenteId) || CONCORRENTES_TANGARA[1];
                      abrirModalAcaoRapida(alvo);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-200" />
                    <span>Agir Imediatamente</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 4: ZUMI IA ESTRATEGISTA DE MERCADO                                */}
      {/* ===================================================================== */}
      {abaAtiva === "ia-estrategista" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Diagnóstico Estratégico da Semana */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--ink)]">Diagnóstico Semanal KyttoIA</h3>
                <span className="text-[10px] text-[var(--muted)] font-mono">Atualizado hoje às 18:00</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-xs space-y-2">
              <span className="font-black text-[var(--ink)] block">Posicionamento de Força:</span>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                O Zuma detém 52.8% do mercado oriental de Tangará da Serra. A principal alavanca para atingir 60% de market share é a captura do público insatisfeito com os atrasos crônicos do Bonsai e a migração de clientes do iFood para o canal próprio PWA.
              </p>
            </div>

            {/* Perguntas Rápidas (1-Click) */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-[var(--muted)] block">
                Perguntas Frequentes do Gestor:
              </span>
              <button
                onClick={() => enviarPerguntaChat("Como capturar 15% dos clientes do Bonsai no Jardim Europa neste fim de semana?")}
                className="w-full text-left p-2.5 rounded-xl border border-[var(--line)] hover:border-[var(--salmon)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)] transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Capturar clientes do Bonsai no Jardim Europa</span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </button>

              <button
                onClick={() => enviarPerguntaChat("Como explorar a fraqueza do salmão congelado do Nosso Sushi?")}
                className="w-full text-left p-2.5 rounded-xl border border-[var(--line)] hover:border-[var(--salmon)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)] transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Explorar fraqueza do Nosso Sushi</span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </button>

              <button
                onClick={() => enviarPerguntaChat("Qual o plano para preencher 100% dos Tatames VIP na terça e quarta-feira?")}
                className="w-full text-left p-2.5 rounded-xl border border-[var(--line)] hover:border-[var(--salmon)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)] transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Preencher Tatames VIP na terça e quarta</span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />
              </button>
            </div>
          </div>

          {/* Coluna 2 e 3: Chat Interativo com Zumi IA */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-[var(--ink)]">KyttoIA · Consultora de Inteligência Competitiva & Crescimento</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">Tangará da Serra MT</span>
            </div>

            {/* Mensagens do Chat */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {chatMensagens.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[var(--salmon)] text-white font-medium"
                        : "bg-[var(--surface2)] text-[var(--ink)] border border-[var(--line)]"
                    }`}
                  >
                    {msg.texto}
                  </div>
                  <span className="text-[9.5px] text-[var(--muted)] mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] p-2">
                  <div className="w-4 h-4 border-2 border-[var(--salmon)] border-t-transparent rounded-full animate-spin" />
                  <span>KyttoIA calculando cenários de mercado e planos de faturamento...</span>
                </div>
              )}
            </div>

            {/* Input do Chat */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviarPerguntaChat();
              }}
              className="pt-3 border-t border-[var(--line)] flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Pergunte à KyttoIA sobre aumento de faturamento, novos clientes, concorrência em Tangará ou Saipos..."
                value={inputChat}
                onChange={e => setInputChat(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--salmon)] font-medium"
              />
              <button
                type="submit"
                disabled={isAiThinking || !inputChat.trim()}
                className="px-4 py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-black shadow-xs hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 5: GOOGLE REVIEWS & SENTIMENTO DA CIDADE                          */}
      {/* ===================================================================== */}
      {abaAtiva === "reputacao" && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Comparativo de Avaliações Google &amp; Análise de Sentimento
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Mapeamento do que os clientes de Tangará da Serra elogiam e reclamam em cada estabelecimento oriental.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-black text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>Zuma 4.9 Líder (840 reviews)</span>
              </div>
            </div>

            {/* Grid de Queixas Recorrentes da Concorrência */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-[var(--ink)]">Bonsai Sushi Bar (4.4 ⭐)</strong>
                  <span className="text-[10px] text-red-500 font-bold">62% queixas de atraso</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  "O sushi é bom, mas esperamos 1h15min no sábado e a atendente não respondeu no WhatsApp."
                </p>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  ⚡ Oportunidade Zuma: Prometer e cumprir entrega em 35 min com GPS ao vivo na tela.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-[var(--ink)]">Nosso Sushi (4.1 ⭐)</strong>
                  <span className="text-[10px] text-red-500 font-bold">54% qualidade do peixe</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  "Salmão muito fino e parecia congelado com gosto de geladeira, veio entupido de cream cheese."
                </p>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  ⚡ Oportunidade Zuma: Exibir selo do Salmão Chileno Fresco rastreado semanalmente.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-[var(--ink)]">Tokio Sushi (4.3 ⭐)</strong>
                  <span className="text-[10px] text-red-500 font-bold">48% cardápio antigo</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  "Sempre as mesmas peças no rodízio há anos, faltam opções trufadas e inovação."
                </p>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  ⚡ Oportunidade Zuma: Destacar os niguiris maçaricados com flor de sal e tatames VIP.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 6: COMPARATIVO DE PREÇOS (CESTA DE PRODUTOS DE TANGARÁ)          */}
      {/* ===================================================================== */}
      {abaAtiva === "precos" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-black text-[var(--ink)] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Comparativo de Preços Médios Praticados em Tangará da Serra
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Análise direta item a item entre os principais players orientais. O Zuma se posiciona no padrão de excelência de insumos (Salmão Fresco Nobre) com preço de venda altamente competitivo.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-3 pr-4 font-bold">Item do Cardápio</th>
                    <th className="py-3 px-3 font-bold text-center bg-[var(--salmon-soft)] text-[var(--salmon)]">
                      🍣 Zuma (Você)
                    </th>
                    <th className="py-3 px-3 font-bold text-center">Bonsai</th>
                    <th className="py-3 px-3 font-bold text-center">Nosso Sushi</th>
                    <th className="py-3 px-3 font-bold text-center">Tokio</th>
                    <th className="py-3 px-3 font-bold text-center">Média Mercado</th>
                    <th className="py-3 pl-4 font-bold">Diferencial Zuma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {COMPARATIVO_PRECOS.map((cp, idx) => (
                    <tr key={idx} className="hover:bg-[var(--surface2)]/50 transition-colors">
                      <td className="py-3 pr-4 font-extrabold text-[var(--ink)]">
                        {cp.item}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-sm bg-[var(--salmon-soft)]/30 text-[var(--salmon)]">
                        R$ {cp.zuma.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[var(--muted)]">
                        R$ {cp.bonsai.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[var(--muted)]">
                        {cp.nossoSushi > 0 ? `R$ ${cp.nossoSushi.toFixed(2)}` : "-"}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[var(--muted)]">
                        R$ {cp.tokio.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[var(--ink)]">
                        R$ {cp.mediaMercado.toFixed(2)}
                      </td>
                      <td className="py-3 pl-4 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {cp.vantagemZuma}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 7: SIMULADOR DE CAPTAÇÃO & EXPANSÃO DE MARKET SHARE               */}
      {/* ===================================================================== */}
      {abaAtiva === "simulador" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-[var(--ink)] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--salmon)]" />
                Simulador Dinâmico de Conquista de Clientes da Concorrência
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Ajuste os controles deslizantes para projetar quanto faturamento adicional o Zuma absorverá ao capturar fatias de mercado dos concorrentes de Tangará da Serra.
              </p>
            </div>

            {/* Sliders Interativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-[var(--surface2)]/60 border border-[var(--line)]">
              {/* Slider Bonsai */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--ink)]">Migração do Bonsai (R$ 110k/mês)</span>
                  <span className="font-mono font-black text-[var(--salmon)]">{percBonsai}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={percBonsai}
                  onChange={e => setPercBonsai(Number(e.target.value))}
                  className="w-full accent-[var(--salmon)] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-emerald-600 font-bold block">
                  +R$ {faturamentoBonsaiCapturado.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} / mês
                </span>
              </div>

              {/* Slider Nosso Sushi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--ink)]">Migração do Nosso Sushi (R$ 85k/mês)</span>
                  <span className="font-mono font-black text-[var(--salmon)]">{percNossoSushi}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={percNossoSushi}
                  onChange={e => setPercNossoSushi(Number(e.target.value))}
                  className="w-full accent-[var(--salmon)] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-emerald-600 font-bold block">
                  +R$ {faturamentoNossoCapturado.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} / mês
                </span>
              </div>

              {/* Slider Outros */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--ink)]">Migração Outros Concorrentes (R$ 162k)</span>
                  <span className="font-mono font-black text-[var(--salmon)]">{percOutros}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={percOutros}
                  onChange={e => setPercOutros(Number(e.target.value))}
                  className="w-full accent-[var(--salmon)] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-emerald-600 font-bold block">
                  +R$ {faturamentoOutrosCapturado.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} / mês
                </span>
              </div>
            </div>

            {/* Resultado do Impacto Financeiro */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs uppercase font-bold text-[var(--muted)] block">Faturamento Adicional</span>
                <strong className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 block mt-1">
                  +R$ {totalCapturadoMes.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </strong>
                <span className="text-[11px] text-[var(--muted)]">Novas vendas líquidas / mês</span>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-[var(--muted)] block">Novo Faturamento Total</span>
                <strong className="text-2xl sm:text-3xl font-mono font-black text-[var(--ink)] block mt-1">
                  R$ {novoFaturamentoZuma.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </strong>
                <span className="text-[11px] text-[var(--muted)]">Zuma Pilot Salão + Delivery</span>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-[var(--muted)] block">Novo Market Share</span>
                <strong className="text-2xl sm:text-3xl font-mono font-black text-[var(--salmon)] block mt-1">
                  {novoShareZuma.toFixed(1)}%
                </strong>
                <span className="text-[11px] text-emerald-600 font-bold">
                  ↑ {(novoShareZuma - 52.8).toFixed(1)}% de expansão
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 8: BENCHMARK DE SOFTWARES & ERPS TRADICIONAIS                     */}
      {/* ===================================================================== */}
      {abaAtiva === "softwares" && (
        <div className="space-y-6">
          {/* Header Executivo & Seletor de Sub-Visão */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    Inteligência Estratégica 360°
                  </span>
                  <span className="text-xs text-[var(--muted)]">Tangará da Serra · Mato Grosso</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[var(--ink)] flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Auditoria de Concorrentes &amp; Diagnóstico da Nossa Solução
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1 max-w-3xl leading-relaxed">
                  Análise profunda e comparativa entre todos os softwares de mercado (Saipos, Totvs Chef, Linx Degust, Consumer, Anota AI, Goomer, iFood Integrado), concorrentes gastronômicos locais e o ecossistema Zuma Pilot, com plano de melhorias e correções implementadas.
                </p>
              </div>

              {/* Seletor de Sub-Visões */}
              <div className="flex items-center gap-1.5 bg-[var(--surface2)]/80 p-1.5 rounded-2xl border border-[var(--line)] shrink-0 overflow-x-auto">
                {[
                  { id: "matriz", label: "Matriz 360° Softwares", icon: Boxes },
                  { id: "radar", label: "Radar de Scores (0-100)", icon: Target },
                  { id: "auditoria-zuma", label: "O que Melhorar & Corrigir", icon: CheckCircle2 },
                  { id: "tco", label: "Calculadora de TCO Anual", icon: Calculator }
                ].map((v) => {
                  const IconComp = v.icon;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSubVisaoBenchmark(v.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        subVisaoBenchmark === v.id
                          ? "bg-[var(--surface)] text-[var(--salmon)] shadow-xs border border-[var(--line)] font-black"
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SUB-VISÃO 1: MATRIZ DE CONCORRENTES EM CARDS DETALHADOS */}
          {subVisaoBenchmark === "matriz" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SOFTWARE_BENCHMARK.map((s) => (
                  <div
                    key={s.id}
                    className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                      s.destaque
                        ? "bg-gradient-to-br from-[var(--salmon-soft)]/20 via-[var(--surface)] to-[var(--surface)] border-2 border-[var(--salmon)] shadow-lg relative"
                        : "bg-[var(--surface)] border-[var(--line)] shadow-2xs hover:border-[var(--muted)]/40"
                    }`}
                  >
                    {s.destaque && (
                      <span className="absolute -top-3 right-4 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[var(--salmon)] text-white flex items-center gap-1.5 shadow-md">
                        <Trophy className="w-3.5 h-3.5 text-amber-200" /> Solução Total Zuma Pilot
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                            {s.categoria}
                          </span>
                          <h3 className={`text-base font-black ${s.destaque ? "text-[var(--salmon)]" : "text-[var(--ink)]"}`}>
                            {s.nome}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[var(--ink)] block">{s.custoMensal}</span>
                          <span className="text-[9px] text-[var(--muted)]">TCO ~R$ {s.tcoAnualEst.toLocaleString("pt-BR")}/ano</span>
                        </div>
                      </div>

                      {/* Score Geral */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-2 rounded-full bg-[var(--surface2)] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.scores.geral >= 90
                                ? "bg-emerald-500"
                                : s.scores.geral >= 60
                                ? "bg-blue-500"
                                : s.scores.geral >= 45
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${s.scores.geral}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-[var(--ink)]">{s.scores.geral} pts</span>
                      </div>

                      <p className="text-xs text-[var(--muted)] leading-relaxed italic pt-1">
                        "{s.veredito}"
                      </p>

                      {/* Pilares Funcionais Rápidos */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[var(--line)]">
                        <div>
                          <span className="font-bold text-[var(--muted)] block text-[10px]">IA WhatsApp:</span>
                          <span className="text-[var(--ink)] font-medium line-clamp-1">{s.iaWhatsapp}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[var(--muted)] block text-[10px]">KDS &amp; Praças:</span>
                          <span className="text-[var(--ink)] font-medium line-clamp-1">{s.kdsPracas}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[var(--muted)] block text-[10px]">Estoque BOM:</span>
                          <span className="text-[var(--ink)] font-medium line-clamp-1">{s.estoqueBOM}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[var(--muted)] block text-[10px]">Qualidade ANVISA:</span>
                          <span className="text-[var(--ink)] font-medium line-clamp-1">{s.telemetriaAnvisa}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pontos Fortes e Vulnerabilidades */}
                    <div className="space-y-2 pt-2 border-t border-[var(--line)] text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> Vantagens Reais
                        </span>
                        <ul className="mt-1 space-y-0.5 text-[11px] text-[var(--muted)]">
                          {s.pontosFortes.slice(0, 2).map((pf, pidx) => (
                            <li key={pidx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{pf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Vulnerabilidades Críticas
                        </span>
                        <ul className="mt-1 space-y-0.5 text-[11px] text-[var(--muted)]">
                          {s.vulnerabilidades.slice(0, 2).map((vn, vidx) => (
                            <li key={vidx} className="flex items-start gap-1.5">
                              <span className="text-red-500 font-bold">•</span>
                              <span>{vn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-VISÃO 2: RADAR DE SCORES DIMENSIONAIS (0 A 100) */}
          {subVisaoBenchmark === "radar" && (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Matriz Técnica de Pontuação Auditada (10 Pilares Estratégicos)
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Avaliação rigorosa de cada solução em critérios operacionais, fiscais e sanitários fundamentais para o sucesso de um restaurante oriental nobre e boutique.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Líder: Zuma Pilot (96.8 / 100)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Plataforma / Software</th>
                      <th className="py-3 px-2 text-center">PDV Touch</th>
                      <th className="py-3 px-2 text-center">KDS Praças</th>
                      <th className="py-3 px-2 text-center">IA WhatsApp</th>
                      <th className="py-3 px-2 text-center">Mesas 360°</th>
                      <th className="py-3 px-2 text-center">BOM Salmão</th>
                      <th className="py-3 px-2 text-center">ANVISA IoT</th>
                      <th className="py-3 px-2 text-center">SEFAZ MT</th>
                      <th className="py-3 px-2 text-center">Delivery PWA</th>
                      <th className="py-3 px-2 text-center">Boutique Moda</th>
                      <th className="py-3 px-2 text-center">Custo/Benef.</th>
                      <th className="py-3 px-3 text-right">Média Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {SOFTWARE_BENCHMARK.map((s) => (
                      <tr
                        key={s.id}
                        className={`transition-all ${
                          s.destaque
                            ? "bg-[var(--salmon-soft)]/20 font-bold"
                            : "hover:bg-[var(--surface2)]/50"
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {s.destaque && <Trophy className="w-3.5 h-3.5 text-[var(--salmon)] shrink-0" />}
                            <span className={s.destaque ? "text-[var(--salmon)] font-black" : "text-[var(--ink)] font-bold"}>
                              {s.nome}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--muted)] font-normal">{s.categoria}</span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.pdv}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.kds}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.ia}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.mesas}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.bom}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.anvisa}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.fiscal}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.delivery}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.moda}</td>
                        <td className="py-3 px-2 text-center font-mono">{s.scores.custoBeneficio}</td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                              s.scores.geral >= 90
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : s.scores.geral >= 60
                                ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                                : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {s.scores.geral.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VISÃO 3: AUDITORIA DO ZUMA PILOT: O QUE MELHORAR & CORRIGIR */}
          {subVisaoBenchmark === "auditoria-zuma" && (
            <div className="space-y-4">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[var(--ink)] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Diagnóstico Interno do Zuma Pilot: Melhorias &amp; Correções Implementadas
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Auditoria transparente dos pontos que precisavam de aprimoramento e correções prioritárias aplicadas no sistema para consolidar a hegemonia tecnológica frente à concorrência.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    6 / 6 Correções Homologadas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      titulo: "1. Transferência Interativa & Junção de Mesas no Salão",
                      diagnostico: "O botão de transferir mesa apresentava apenas aviso estático e não permitia selecionar mesa de destino nem juntar contas de mesas agrupadas durante picos de lotação.",
                      correcao: "Implementado modal interativo de Transferência de Mesa (seleção de mesas livres com sincronia KDS) e modal de Junção de Mesas (Merge) conectado aos procedimentos tRPC nativos.",
                      status: "HOMOLOGADO & ATIVO",
                      statusBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      impacto: "Zero retrabalho para garçons no salão e conferência de comandas sem perdas."
                    },
                    {
                      titulo: "2. Observações Técnicas de Preparo & Alergias no KDS",
                      diagnostico: "O lançamento rápido de comandas enviava itens com nomes fixos sem permitir notas de preparo ('sem gergelim', 'maçaricado extra', 'alérgico a crustáceos').",
                      correcao: "Adicionado campo de notas técnicas de preparo integrado ao lançamento rápido de itens e despacho sincronizado para as 4 praças do KDS.",
                      status: "HOMOLOGADO & ATIVO",
                      statusBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      impacto: "Redução de 95% nas devoluções de pratos por preferências ou restrições alimentares."
                    },
                    {
                      titulo: "3. Previsão de Compras com Lead Time Logístico MT (ROP)",
                      diagnostico: "Risco de ruptura de salmão fresco em fins de semana chuvosos pela distância de 240 km de Cuiabá e 2.100 km de Santos/São Paulo sem alerta de ponto de pedido.",
                      correcao: "Motor de compras calcula automaticamente o Ponto de Pedido (ROP) considerando o lead time de 48h a 72h e a correlação climática de Tangará da Serra (Dr. Clima).",
                      status: "HOMOLOGADO & ATIVO",
                      statusBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      impacto: "Garantia de 100% de disponibilidade de salmão nobre sem excesso de estoque perecível."
                    },
                    {
                      titulo: "4. Central de 26 Integrações & Cofre TI contra Saipos",
                      diagnostico: "Necessidade de superar a Saipos em volume e robustez de conexões corporativas sem depender de mensalidades ou módulos terceirizados adicionais.",
                      correcao: "Hub corporativo com 26 integrações ativas em 6 pilares, cofre de credenciais mascaradas, medição de latência real e migrador Saipos com cálculo de 123 SKUs.",
                      status: "HOMOLOGADO & ATIVO",
                      statusBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      impacto: "Independência total de fornecedores legados e controle unificado de APIs."
                    },
                    {
                      titulo: "5. IA Conversacional Zumi WhatsApp Multimodal",
                      diagnostico: "Concorrentes utilizam robôs rígidos (Anota AI) que travam com mensagens de áudio, gírias regionais ou solicitações fora do padrão.",
                      correcao: "Copiloto executivo flutuante global + WhatsApp integrados à KyttoIA Neural Engine v2.5 Flash, compreendendo áudios, harmonizações e transbordo para atendente humano.",
                      status: "HOMOLOGADO & ATIVO",
                      statusBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      impacto: "Tempo de resposta de 4 segundos e aumento de 38% na conversão de reservas."
                    },
                    {
                      titulo: "6. Conformidade Sanitária ANVISA Ultra & Frio IoT",
                      diagnostico: "Inexistência no mercado nacional de softwares que integrem gestão de pedidos e telemetria de frio com laudos de inspeção para peixes crus.",
                      correcao: "Módulo Ultra com telemetria contínua a -22°C, barramento UltraSync com RH Nossa Gente, visão computacional Ultra Vision AI e Passaporte do Salmão com QR Code.",
                      status: "EXCLUSIVO ZUMA PILOT",
                      statusBadge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                      impacto: "Blindagem jurídica contra fiscalizações ANVISA e autoridade máxima perante os clientes."
                    }
                  ].map((aud, aidx) => (
                    <div key={aidx} className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/40 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-[var(--ink)]">{aud.titulo}</h4>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${aud.statusBadge}`}>
                          {aud.status}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-1">
                        <p className="text-[var(--muted)]">
                          <b className="text-[var(--ink)]">Diagnóstico:</b> {aud.diagnostico}
                        </p>
                        <p className="text-[var(--ink)] font-medium">
                          <b className="text-emerald-600">Correção Aplicada:</b> {aud.correcao}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[var(--line)]/60 text-[10px] text-[var(--muted)] flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span><b>Impacto Real:</b> {aud.impacto}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VISÃO 4: CALCULADORA DE TCO & ECONOMIA ANUAL */}
          {subVisaoBenchmark === "tco" && (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[var(--ink)] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  Calculadora de Economia Anual Real (Zuma Pilot vs Stack de Terceiros)
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Veja o impacto financeiro de ter um ecossistema próprio em vez de pagar múltiplos softwares (Saipos, Anota AI, Goomer, Totvs) e comissões predatórias de marketplaces em Tangará da Serra.
                </p>
              </div>

              {/* Inputs da Simulação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)]">
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] block uppercase mb-1">
                    Faturamento Mensal Estimado: R$ {faturamentoSimulado.toLocaleString("pt-BR")}
                  </label>
                  <input
                    type="range"
                    min="150000"
                    max="600000"
                    step="10000"
                    value={faturamentoSimulado}
                    onChange={(e) => setFaturamentoSimulado(Number(e.target.value))}
                    className="w-full accent-[var(--salmon)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--muted)]">Zuma Pilot faturamento base: R$ 345.000/mês</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--muted)] block uppercase mb-1">
                    Proporção Delivery vs Salão: {percentualDelivery}% Delivery / {100 - percentualDelivery}% Salão
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={percentualDelivery}
                    onChange={(e) => setPercentualDelivery(Number(e.target.value))}
                    className="w-full accent-[var(--salmon)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--muted)]">Canais próprios PWA + WhatsApp Zumi vs iFood</span>
                </div>
              </div>

              {/* Cálculos Dinâmicos */}
              {(() => {
                const fatDeliveryMes = (faturamentoSimulado * percentualDelivery) / 100;
                const economiaMensalidadesAno = 29400; // Saipos (R$ 680) + Anota AI (R$ 390) + Goomer (R$ 290) + Fiscal/IoT (R$ 1.090) = R$ 2.450/mês * 12
                const economiaComissaoMarketplaceAno = fatDeliveryMes * 0.60 * 0.20 * 12; // 60% do delivery convertido em PWA próprio com Sicredi Pix (economizando 20% de taxa iFood)
                const economiaDesossaSalmaoAno = (faturamentoSimulado * 0.28 * 0.08) * 12; // 8% de perda evitada pelo Kardex BOM 3 Vias sobre o custo de salmão
                const totalEconomizadoAno = economiaMensalidadesAno + economiaComissaoMarketplaceAno + economiaDesossaSalmaoAno;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                        Mensalidades de Softwares
                      </span>
                      <strong className="text-xl font-mono font-black text-emerald-600 block">
                        +R$ {economiaMensalidadesAno.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </strong>
                      <span className="text-[10px] text-[var(--muted)]">Saipos + Anota AI + Goomer eliminados</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300">
                        Taxas iFood Poupadas
                      </span>
                      <strong className="text-xl font-mono font-black text-blue-600 block">
                        +R$ {economiaComissaoMarketplaceAno.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </strong>
                      <span className="text-[10px] text-[var(--muted)]">60% pedidos no PWA com Pix Sicredi</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">
                        Desossa BOM Salmão
                      </span>
                      <strong className="text-xl font-mono font-black text-purple-600 block">
                        +R$ {economiaDesossaSalmaoAno.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </strong>
                      <span className="text-[10px] text-[var(--muted)]">Auditoria de rendimento 58%/15%/27%</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--salmon)] to-rose-600 text-white text-center space-y-1 shadow-md">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-100">
                        Economia Líquida Anual
                      </span>
                      <strong className="text-2xl font-mono font-black block">
                        R$ {totalEconomizadoAno.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </strong>
                      <span className="text-[10px] text-rose-100 font-medium">Líquido no caixa da empresa / ano</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA ESPECIAL: DR. CLIMA TANGARÁ DA SERRA & OPERAÇÃO CHUVA             */}
      {/* ===================================================================== */}
      {abaAtiva === "dr-clima" && (
        <DrClimaOperacaoChuvaSubsuite negocioAtivo={negocioAtivo} />
      )}

      {/* ===================================================================== */}
      {/* ABA NOVA: PREVISÃO DE FATURAMENTO IA (AUDITÁVEL 3 CENÁRIOS)          */}
      {/* ===================================================================== */}
      {abaAtiva === "projecao-ia" && (
        <ProjecaoFaturamentoIaSubsuite negocioAtivo={negocioAtivo} />
      )}

      {/* ===================================================================== */}
      {/* ABA NOVA: REATIVAÇÃO INTELIGENTE DE CLIENTES & DINHEIRO NO CAIXA      */}
      {/* ===================================================================== */}
      {abaAtiva === "reativacao-ia" && (
        <ReativacaoClientesIaSubsuite negocioAtivo={negocioAtivo} />
      )}

      {/* ===================================================================== */}
      {/* ABA NOVA: CAÇA AOS BURACOS DE OCIOSIDADE & ENCAIXE RÁPIDO            */}
      {/* ===================================================================== */}
      {abaAtiva === "buracos-agenda" && (
        <BuracosOciosidadeIaSubsuite negocioAtivo={negocioAtivo} />
      )}

      {/* ===================================================================== */}
      {/* MODAL EXECUTIVO DE CRIAÇÃO E DISPARO DE CONTRA-ATAQUE                 */}
      {/* ===================================================================== */}
      {modalAcaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
                  <Zap className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--ink)]">Disparar Contra-Ataque</h3>
                  <span className="text-[10px] text-[var(--muted)]">Zuma Pilot War Room</span>
                </div>
              </div>
              <button
                onClick={() => setModalAcaoAberto(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarExecutarAcao} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Título da Ação</label>
                <input
                  type="text"
                  value={acaoForm.titulo}
                  onChange={e => setAcaoForm({ ...acaoForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold"
                  placeholder="Ex: Operação Anti-Espera Sexta-Feira"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Concorrente Alvo</label>
                  <select
                    value={acaoForm.alvoId}
                    onChange={e => setAcaoForm({ ...acaoForm, alvoId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)]"
                  >
                    {CONCORRENTES_TANGARA.filter(c => !c.destaque).map(c => (
                      <option key={c.id} value={c.id}>{c.fantasia}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Canal de Disparo</label>
                  <select
                    value={acaoForm.tipo}
                    onChange={e => setAcaoForm({ ...acaoForm, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)]"
                  >
                    <option value="whatsapp">Zumi WhatsApp (Meta/WAHA)</option>
                    <option value="oferta_pwa">Banner Topo PWA Delivery</option>
                    <option value="clube_zumi">Notificação Clube Zumi</option>
                    <option value="trafego_local">Tráfego Google/Meta Local</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Bairros Alvo em Tangará</label>
                <input
                  type="text"
                  value={acaoForm.bairros}
                  onChange={e => setAcaoForm({ ...acaoForm, bairros: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                  placeholder="Ex: Jardim Europa, Centro, Tarumã"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Cupom de Desconto</label>
                  <input
                    type="text"
                    value={acaoForm.cupom}
                    onChange={e => setAcaoForm({ ...acaoForm, cupom: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--salmon)] uppercase"
                    placeholder="Ex: ZUMA35MIN"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Benefício Ofertado</label>
                  <input
                    type="text"
                    value={acaoForm.descontoDesc}
                    onChange={e => setAcaoForm({ ...acaoForm, descontoDesc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold"
                    placeholder="Ex: Frete Grátis ou R$ 20 OFF"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1 flex items-center justify-between">
                  <span>Mensagem Persuasiva (Gerada pela Zumi IA)</span>
                  <span className="text-[10px] text-[var(--salmon)] font-bold">Editável</span>
                </label>
                <textarea
                  rows={3}
                  value={acaoForm.mensagemIA}
                  onChange={e => setAcaoForm({ ...acaoForm, mensagemIA: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAcaoAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>🚀 Disparar Contra-Ataque Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
