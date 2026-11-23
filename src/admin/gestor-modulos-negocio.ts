/**
 * Gestor de Módulos por Negócio no Admin do BancoFé
 * Suporte completo a todas as verticais do ecossistema:
 * 1. BancoFé Digital & Banking Core
 * 2. BancoFe — Operações Financeiras & CRM 360°
 * 3. BancoFe — Cadastro 360°, Vault & Compliance
 * 4. Casa Nova Imóveis & Crédito Habitacional
 * 5. Agro & Crédito Rural (UISA / Biorrefinaria)
 * 6. Construtora Ultra & Engenharia
 * 7. Dino Barbearia & Varejo
 * 8. Zuma Cozinha Oriental & Gastronomia
 * 9. Zuma Moda, Roupas & Boutique
 */
import { z } from "zod";
import fs from "fs";
import path from "path";

export interface ModuloNegocio {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: "credito" | "consulta" | "operacao" | "integracao" | "compliance" | "financeiro";
  ativo: boolean;
  rotaUrl: string;
  icone: string;
  requerAutenticacao: boolean;
  permissoesMinimas: "USUARIO" | "GERENTE" | "ADMINISTRADOR_MASTER";
  configuracoes?: Record<string, any>;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface NegocioCorporativo {
  id: string;
  slug: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
  segmento: "banking" | "credito" | "compliance" | "imobiliario" | "agro" | "construcao" | "varejo" | "gastronomia" | "moda";
  corPrimaria: string;
  corSecundaria: string;
  icone: string;
  urlBase: string;
  descricao: string;
  badge?: string;
  modulos: ModuloNegocio[];
}

export const NovoModuloSchema = z.object({
  codigo: z.string().min(2),
  nome: z.string().min(3),
  descricao: z.string().min(5),
  categoria: z.enum(["credito", "consulta", "operacao", "integracao", "compliance", "financeiro"]),
  ativo: z.boolean().default(true),
  rotaUrl: z.string().min(1),
  icone: z.string().default("fa-cube"),
  requerAutenticacao: z.boolean().default(true),
  permissoesMinimas: z.enum(["USUARIO", "GERENTE", "ADMINISTRADOR_MASTER"]).default("GERENTE"),
});

export const NovoNegocioSchema = z.object({
  slug: z.string().min(2),
  nome: z.string().min(3),
  razaoSocial: z.string().min(3),
  cnpj: z.string().min(14),
  segmento: z.string().default("banking"),
  corPrimaria: z.string().default("#0c4a34"),
  corSecundaria: z.string().default("#820ad1"),
  icone: z.string().default("fa-building"),
  urlBase: z.string().default("https://erp-bancofe-5xsi5uyoda-rj.a.run.app"),
  descricao: z.string().min(5),
  badge: z.string().default("Corporativo"),
});

const DATA_FILE_PATH = path.resolve(process.cwd(), "data", "adminNegociosModulos.json");

export class GestorModulosNegocioBancoFe {
  private negocios: Map<string, NegocioCorporativo> = new Map();

  constructor() {
    this.carregarOuInicializar();
  }

  private carregarOuInicializar() {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const conteudo = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const parsed: NegocioCorporativo[] = JSON.parse(conteudo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.negocios.clear();
          for (const neg of parsed) {
            this.negocios.set(neg.id, neg);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("[GestorModulos] Falha ao ler data/adminNegociosModulos.json, usando padrão:", e);
    }

    this.inicializarNegociosPadrao();
    this.salvarEmDisco();
  }

  private salvarEmDisco() {
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(Array.from(this.negocios.values()), null, 2), "utf-8");
    } catch (e) {
      console.error("[GestorModulos] Erro ao persistir em disco:", e);
    }
  }

  private inicializarNegociosPadrao() {
    const padroes: NegocioCorporativo[] = [
      {
        id: "neg-bancofe",
        slug: "bancofe",
        nome: "BancoFé Digital & Banking Core",
        razaoSocial: "BANCOFE MEIOS DE PAGAMENTO E CORRESPONDENTE BANCARIO LTDA",
        cnpj: "53.338.003/0001-04",
        segmento: "banking",
        corPrimaria: "#0c4a34", // Verde esmeralda bancário
        corSecundaria: "#d4af37", // Dourado
        icone: "fa-building-columns",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app",
        descricao: "Plataforma central de banking, crédito inteligente, contas digitais e meios de pagamento.",
        badge: "Fintech Core",
        modulos: [
          {
            id: "mod-bfe-01",
            codigo: "CONSULTA_360_CPF",
            nome: "Consulta 360 CPF & CNPJ",
            descricao: "Diligência pericial, KYC/AML e cruzamento em 48+ fontes governamentais ao vivo",
            categoria: "consulta",
            ativo: true,
            rotaUrl: "/plataforma/consulta-cpf",
            icone: "fa-magnifying-glass-chart",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-20T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-bfe-02",
            codigo: "PRE_CADASTRO_360",
            nome: "Esteira de Pré-Cadastro 360",
            descricao: "Fila operacional de novos proponentes, simulação SAC/Price e pré-aprovação autônoma",
            categoria: "credito",
            ativo: true,
            rotaUrl: "/plataforma/precadastro",
            icone: "fa-user-check",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-20T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-bfe-03",
            codigo: "RADAR_CLIENTES_POTENCIAIS",
            nome: "Radar Preditivo de Clientes & Segmentos",
            descricao: "Base potencial regional de agro, médicos, empresários e investidores pré-qualificados",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/plataforma/clientes-potenciais",
            icone: "fa-crosshairs",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-20T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-bfe-04",
            codigo: "CARTEIRA_DIGITAL_PIX",
            nome: "Carteira Digital & Chaves PIX Bacen",
            descricao: "Gestão de saldos, QR Code dinâmico DICT, cartões tokenizados e conciliação",
            categoria: "financeiro",
            ativo: true,
            rotaUrl: "/plataforma/carteira",
            icone: "fa-wallet",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-20T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-bfe-05",
            codigo: "OPEN_FINANCE_BACEN",
            nome: "Open Finance 24/7 Bacen",
            descricao: "Compartilhamento consentido de dados bancários, score e portabilidade de crédito",
            categoria: "integracao",
            ativo: true,
            rotaUrl: "/admin/cadastro-360?aba=termos",
            icone: "fa-network-wired",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-operacoes-crm",
        slug: "operacoes-crm",
        nome: "BancoFe — Operações Financeiras & CRM 360°",
        razaoSocial: "BANCOFE OPERACOES FINANCEIRAS E CORRESPONDENTE BANCARIO LTDA",
        cnpj: "50.073.355/0001-80",
        segmento: "credito",
        corPrimaria: "#820ad1", // Roxo Nubank
        corSecundaria: "#0c4a34",
        icone: "fa-briefcase",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin/crm-financeira",
        descricao: "Esteira unificada de originação de crédito, mesa algorítmica, formalização de CCB Lei 10.931/04 e trava CERC.",
        badge: "Crédito & CRM",
        modulos: [
          {
            id: "mod-crm-01",
            codigo: "ESTEIRA_KANBAN_CREDITO",
            nome: "Esteira de Crédito & Funil Kanban",
            descricao: "Gestão visual de oportunidades em 6 fases de esteira com limites, taxas e SLA da mesa",
            categoria: "credito",
            ativo: true,
            rotaUrl: "/admin/crm-financeira",
            icone: "fa-chart-kanban",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-crm-02",
            codigo: "MESA_CREDITO_ALGORITMICA",
            nome: "Mesa de Crédito & Rating CMN 2.682/99",
            descricao: "Motor de risco algorítmico com classificação AA a H, SCR Bacen e matriz de alçadas executivas",
            categoria: "credito",
            ativo: true,
            rotaUrl: "/admin/crm-financeira?aba=mesa",
            icone: "fa-scale-balanced",
            requerAutenticacao: true,
            permissoesMinimas: "ADMINISTRADOR_MASTER",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-crm-03",
            codigo: "SIMULADOR_SAC_PRICE",
            nome: "Simulador SAC vs. PRICE em Tempo Real",
            descricao: "Comparador de sistemas de amortização com tabela detalhada mês a mês, CET e seguros DFI/MIP",
            categoria: "financeiro",
            ativo: true,
            rotaUrl: "/admin/crm-financeira?aba=simulador",
            icone: "fa-calculator",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-crm-04",
            codigo: "FORMALIZACAO_CCB_DIGITAL",
            nome: "Emissão de CCB Digital ICP-Brasil",
            descricao: "Cédula de Crédito Bancário eletrônica (Lei 10.931/04) com assinatura e carimbo de tempo",
            categoria: "compliance",
            ativo: true,
            rotaUrl: "/admin/crm-financeira?aba=formalizacao",
            icone: "fa-signature",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-crm-05",
            codigo: "TRAVA_RECEBIVEIS_CERC",
            nome: "Trava de Domicílio & Registro CERC",
            descricao: "Cessão fiduciária de recebíveis com trava bancária 100% CERC e domicílio BancoFe",
            categoria: "financeiro",
            ativo: true,
            rotaUrl: "/admin/cadastro-360?aba=garantias",
            icone: "fa-lock",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-cadastro360-vault",
        slug: "cadastro360-vault",
        nome: "BancoFe — Cadastro 360°, Vault & Compliance",
        razaoSocial: "BANCOFE MEIOS DE PAGAMENTO E CORRESPONDENTE BANCARIO LTDA",
        cnpj: "53.338.003/0001-04",
        segmento: "compliance",
        corPrimaria: "#6b21a8",
        corSecundaria: "#820ad1",
        icone: "fa-id-card-clip",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin/cadastro-360",
        descricao: "Governança corporativa, diligência pericial KYB/KYC, vault de 13 documentos com hash SHA-256 e termos SCR.",
        badge: "Governança",
        modulos: [
          {
            id: "mod-cad-01",
            codigo: "CADASTRO_360_CORP",
            nome: "Cadastro 360° Corporativo (8 Abas)",
            descricao: "Dossiê completo com dados RFB, Quadro Societário UBO, limites aprovados e garantias",
            categoria: "consulta",
            ativo: true,
            rotaUrl: "/admin/cadastro-360",
            icone: "fa-address-card",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-cad-02",
            codigo: "VAULT_DOCUMENTAL_13DOCS",
            nome: "Vault Documental & Checklist (13 Docs)",
            descricao: "Recepção, validação criptográfica com hash SHA-256 e controle de validade de certidões",
            categoria: "compliance",
            ativo: true,
            rotaUrl: "/admin/pre-cadastro",
            icone: "fa-vault",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-cad-03",
            codigo: "CENTRAL_TERMOS_SCR",
            nome: "Central de Termos & Consentimento SCR Bacen",
            descricao: "Minutas padronizadas, autorização CMN 4.571/17, PLD-FT e assinatura digital com log de IP",
            categoria: "compliance",
            ativo: true,
            rotaUrl: "/admin/termos",
            icone: "fa-file-shield",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-cad-04",
            codigo: "PLD_FT_LISTAS_RESTRITIVAS",
            nome: "Varredura PLD-FT & Listas Restritivas",
            descricao: "Checagem ao vivo contra OFAC, CSNU, CEAF, CEPIM, CGF (Trabalho Escravo) e CEIS/TCU",
            categoria: "compliance",
            ativo: true,
            rotaUrl: "/admin/cadastro-360?aba=compliance",
            icone: "fa-shield-halved",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-22T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-casanova",
        slug: "casanova",
        nome: "Casa Nova Imóveis & Crédito Habitacional",
        razaoSocial: "CASANOVA IMOVEIS & EMPREENDIMENTOS LTDA",
        cnpj: "08.941.233/0001-90",
        segmento: "imobiliario",
        corPrimaria: "#126245",
        corSecundaria: "#22c55e",
        icone: "fa-house-chimney",
        urlBase: "https://casanova.kytto.com.br",
        descricao: "Portal imobiliário e esteira de correspondente bancário (Corban) para crédito habitacional.",
        badge: "Imobiliário",
        modulos: [
          {
            id: "mod-cnv-01",
            codigo: "CORBAN_ESTEIRA_MULTIBANCOS",
            nome: "Esteira de Crédito Imobiliário Corban",
            descricao: "Conectores diretos com Caixa Econômica (SIOCI/SIOPI), BB, Itaú, Santander e Bradesco",
            categoria: "credito",
            ativo: true,
            rotaUrl: "/plataforma/credito",
            icone: "fa-file-signature",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-18T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-cnv-02",
            codigo: "ROLETA_DISTRIBUICAO_LEADS",
            nome: "Roleta de Distribuição de Leads",
            descricao: "Distribuição inteligente round-robin de interessados e SLA de primeiro contato de 15 min",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/plataforma/roleta-leads",
            icone: "fa-arrows-spin",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-18T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-cnv-03",
            codigo: "AVALIACAO_ONR_CARTORIOS",
            nome: "Certidão Digital & Ônus Reais ONR",
            descricao: "Pesquisa de matrículas, alienações fiduciárias e averbações de penhora em cartórios de imóveis",
            categoria: "compliance",
            ativo: true,
            rotaUrl: "/admin/cadastro-360?aba=garantias",
            icone: "fa-stamp",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-21T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-agro",
        slug: "agro",
        nome: "Agro & Crédito Rural (UISA / Biorrefinaria)",
        razaoSocial: "USINAS ITAMARATI S/A & ESTÂNCIA GONÇALVES",
        cnpj: "15.009.178/0001-70",
        segmento: "agro",
        corPrimaria: "#15803d",
        corSecundaria: "#ca8a04",
        icone: "fa-wheat-awn",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/agro",
        descricao: "Soluções de crédito rural, antecipação de safra (CPR Digital), barter e gestão pecuária.",
        badge: "Agro & Safra",
        modulos: [
          {
            id: "mod-agr-01",
            codigo: "CPR_DIGITAL_BARTER",
            nome: "Emissão e Registro de CPR Digital",
            descricao: "Cédula de Produto Rural digital com registro cartorário e garantia de safra/grãos",
            categoria: "credito",
            ativo: true,
            rotaUrl: "/plataforma/cpr-digital",
            icone: "fa-certificate",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-19T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-agr-02",
            codigo: "CONFORMIDADE_SICAR_SEMA",
            nome: "Auditoria Ambiental & CAR (SICAR / Sema-MT)",
            descricao: "Conferência automática de reserva legal, embargos IBAMA e georreferenciamento SIGEF",
            categoria: "compliance",
            ativo: true,
            rotaUrl: "/plataforma/sicar-compliance",
            icone: "fa-tree",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-19T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-agr-03",
            codigo: "GEORREFERENCIAMENTO_SIGEF",
            nome: "Georreferenciamento de Glebas & Grãos",
            descricao: "Poligonais de plantio, histórico de produtividade de soja e monitoramento por satélite",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/agro",
            icone: "fa-earth-americas",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-21T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-ultra",
        slug: "ultra",
        nome: "Construtora Ultra & Engenharia",
        razaoSocial: "CONSTRUTORA ULTRA ENGENHARIA LTDA",
        cnpj: "18.491.204/0001-55",
        segmento: "construcao",
        corPrimaria: "#1e3a8a",
        corSecundaria: "#3b82f6",
        icone: "fa-helmet-safety",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/ultra",
        descricao: "Financiamento de obras com medição SINAPI, controle físico-financeiro e venda de lotes.",
        badge: "Engenharia",
        modulos: [
          {
            id: "mod-ult-01",
            codigo: "MEDICOES_SINAPI_OBRAS",
            nome: "Cronograma Físico-Financeiro & INCC",
            descricao: "Acompanhamento de medições acumuladas SINAPI-MT e aplicação de reajuste INCC",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/plataforma/obras-sinapi",
            icone: "fa-chart-line",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-17T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-ult-02",
            codigo: "GESTAO_OBRAS_MATERIAIS",
            nome: "Suprimentos & Concreto Usinado Serrano",
            descricao: "Requisições de compra de aço, cimento e concreto usinado com faturamento centralizado",
            categoria: "financeiro",
            ativo: true,
            rotaUrl: "/compras",
            icone: "fa-truck-ramp-box",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-21T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-dino",
        slug: "dino",
        nome: "Dino Barbearia & Varejo Multi-Negócio",
        razaoSocial: "DINO BARBEARIA & ESTÉTICA MASCULINA LTDA",
        cnpj: "24.891.044/0001-12",
        segmento: "varejo",
        corPrimaria: "#78350f",
        corSecundaria: "#f59e0b",
        icone: "fa-scissors",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/dino",
        descricao: "Soluções de captura de pagamentos, maquininha Smart POS e microcrédito para varejo.",
        badge: "Varejo & Serviços",
        modulos: [
          {
            id: "mod-din-01",
            codigo: "MAQUININHA_SMART_POS",
            nome: "Terminal POS & PIX no Balcão",
            descricao: "Captura de pagamentos em débito, crédito e PIX instantâneo com liquidação BancoFé",
            categoria: "financeiro",
            ativo: true,
            rotaUrl: "/plataforma/pos-varejo",
            icone: "fa-credit-card",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-18T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-din-02",
            codigo: "FIDELIDADE_CASHBACK_LOCAL",
            nome: "Clube de Fidelidade & Cashback Local",
            descricao: "Pontuação por corte e consumo de produtos com saldo reutilizável na carteira digital",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/plataforma/carteira",
            icone: "fa-award",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-21T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-zuma-gastronomia",
        slug: "gastronomia",
        nome: "Zuma Cozinha Oriental & Gastronomia",
        razaoSocial: "ZUMA GASTRONOMIA E RESTAURANTE LTDA",
        cnpj: "52.123.456/0001-78",
        segmento: "gastronomia",
        corPrimaria: "#047857",
        corSecundaria: "#10b981",
        icone: "fa-utensils",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/mesas",
        descricao: "Operação gastronômica 360°, Frente de Caixa Touch (PDV), KDS de praças, App do Garçom e Delivery.",
        badge: "Gastronomia",
        modulos: [
          {
            id: "mod-zum-01",
            codigo: "PDV_TOUCH_FRENTE_CAIXA",
            nome: "PDV Frente de Caixa Touch & NFC-e",
            descricao: "Lançamento ultra-rápido, fechamento de comandas, TEF e emissão fiscal SEFAZ-MT",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/pdv",
            icone: "fa-cash-register",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-10T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-zum-02",
            codigo: "KDS_COZINHA_PRACAS",
            nome: "KDS Cozinha v2 Fire-on-Demand",
            descricao: "Painel inteligente de produção com roteamento por praças e cronômetro de tempo",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/kds-v2",
            icone: "fa-fire-burner",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-10T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-zum-03",
            codigo: "APP_GARCOM_MESAS",
            nome: "App Garçom & Comanda Mobile",
            descricao: "Atendimento móvel das 27 mesas com pedidos instantâneos e impressão setorizada",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/garcom",
            icone: "fa-mobile-screen-button",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-10T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-zum-04",
            codigo: "APP_ENTREGADOR_GPS",
            nome: "App Piloto Entregador com Rastreamento GPS",
            descricao: "Roteirização para Tangará da Serra com comprovação digital e alerta de chuva",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/entregador",
            icone: "fa-motorcycle",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-10T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-zuma-moda",
        slug: "moda",
        nome: "Zuma Moda, Roupas & Boutique",
        razaoSocial: "ZUMA MODA E BOUTIQUE DE ROUPAS LTDA",
        cnpj: "52.123.456/0002-59",
        segmento: "moda",
        corPrimaria: "#831843",
        corSecundaria: "#db2777",
        icone: "fa-shirt",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/moda",
        descricao: "Varejo de moda, grade de peças, leitor EAN-13, provador virtual e malas condicionais.",
        badge: "Boutique",
        modulos: [
          {
            id: "mod-mod-01",
            codigo: "GRADE_ESTOQUE_EAN13",
            nome: "Grade de Estoque por Tamanho & EAN-13",
            descricao: "Controle de peças, cores, tamanhos e etiquetas com código de barras térmico",
            categoria: "operacao",
            ativo: true,
            rotaUrl: "/moda",
            icone: "fa-barcode",
            requerAutenticacao: true,
            permissoesMinimas: "USUARIO",
            dataCriacao: "2026-11-15T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
          {
            id: "mod-mod-02",
            codigo: "MALAS_CONDICIONAIS",
            nome: "Malas Condicionais & Ficha de Devolução",
            descricao: "Envio de malas de roupas para experimentação em domicílio e cobrança automática",
            categoria: "venda" as any,
            ativo: true,
            rotaUrl: "/zuma-moda",
            icone: "fa-suitcase-rolling",
            requerAutenticacao: true,
            permissoesMinimas: "GERENTE",
            dataCriacao: "2026-11-15T00:00:00.000Z",
            dataAtualizacao: "2026-11-23T00:00:00.000Z",
          },
        ],
      },
    ];

    this.negocios.clear();
    for (const neg of padroes) {
      this.negocios.set(neg.id, neg);
    }
  }

  public listarNegocios(): NegocioCorporativo[] {
    return Array.from(this.negocios.values());
  }

  public obterNegocio(idOuSlug: string): NegocioCorporativo | null {
    if (this.negocios.has(idOuSlug)) return this.negocios.get(idOuSlug)!;
    return Array.from(this.negocios.values()).find((n) => n.slug === idOuSlug) || null;
  }

  public adicionarNegocio(dados: z.infer<typeof NovoNegocioSchema>): NegocioCorporativo {
    const id = `neg-${dados.slug.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const novo: NegocioCorporativo = {
      id,
      slug: dados.slug.toLowerCase(),
      nome: dados.nome,
      razaoSocial: dados.razaoSocial,
      cnpj: dados.cnpj,
      segmento: (dados.segmento as any) || "banking",
      corPrimaria: dados.corPrimaria || "#0c4a34",
      corSecundaria: dados.corSecundaria || "#820ad1",
      icone: dados.icone || "fa-building",
      urlBase: dados.urlBase || "https://erp-bancofe-5xsi5uyoda-rj.a.run.app",
      descricao: dados.descricao,
      badge: dados.badge || "Corporativo",
      modulos: [],
    };

    this.negocios.set(id, novo);
    this.salvarEmDisco();
    return novo;
  }

  public adicionarModulo(negocioId: string, dados: z.infer<typeof NovoModuloSchema>): ModuloNegocio | null {
    const neg = this.obterNegocio(negocioId);
    if (!neg) return null;

    const id = `mod-${neg.slug}-${Date.now().toString(36)}`;
    const novoModulo: ModuloNegocio = {
      id,
      codigo: dados.codigo.toUpperCase().replace(/\s+/g, "_"),
      nome: dados.nome,
      descricao: dados.descricao,
      categoria: dados.categoria,
      ativo: dados.ativo,
      rotaUrl: dados.rotaUrl,
      icone: dados.icone || "fa-cube",
      requerAutenticacao: dados.requerAutenticacao,
      permissoesMinimas: dados.permissoesMinimas,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    neg.modulos.push(novoModulo);
    this.salvarEmDisco();
    return novoModulo;
  }

  public atualizarModulo(
    negocioId: string,
    moduloId: string,
    atualizacao: Partial<Omit<ModuloNegocio, "id" | "dataCriacao">>
  ): ModuloNegocio | null {
    const neg = this.obterNegocio(negocioId);
    if (!neg) return null;

    const mod = neg.modulos.find((m) => m.id === moduloId || m.codigo === moduloId);
    if (!mod) return null;

    Object.assign(mod, atualizacao);
    mod.dataAtualizacao = new Date().toISOString();
    this.salvarEmDisco();
    return mod;
  }

  public excluirModulo(negocioId: string, moduloId: string): boolean {
    const neg = this.obterNegocio(negocioId);
    if (!neg) return false;

    const idx = neg.modulos.findIndex((m) => m.id === moduloId || m.codigo === moduloId);
    if (idx === -1) return false;

    neg.modulos.splice(idx, 1);
    this.salvarEmDisco();
    return true;
  }

  public alternarStatusModulo(negocioId: string, moduloId: string): ModuloNegocio | null {
    const neg = this.obterNegocio(negocioId);
    if (!neg) return null;

    const mod = neg.modulos.find((m) => m.id === moduloId || m.codigo === moduloId);
    if (!mod) return null;

    mod.ativo = !mod.ativo;
    mod.dataAtualizacao = new Date().toISOString();
    this.salvarEmDisco();
    return mod;
  }

  public obterMetricasAdmin() {
    const todosNegocios = Array.from(this.negocios.values());
    const totalNegocios = todosNegocios.length;
    let totalModulos = 0;
    let modulosAtivos = 0;

    for (const neg of todosNegocios) {
      totalModulos += neg.modulos.length;
      modulosAtivos += neg.modulos.filter((m) => m.ativo).length;
    }

    return {
      totalNegocios,
      totalModulos,
      modulosAtivos,
      modulosInativos: totalModulos - modulosAtivos,
      negocios: todosNegocios.map((n) => ({
        id: n.id,
        nome: n.nome,
        totalModulos: n.modulos.length,
        modulosAtivos: n.modulos.filter((m) => m.ativo).length,
      })),
    };
  }
}
