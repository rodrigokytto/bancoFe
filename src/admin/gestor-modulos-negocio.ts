/**
 * Gestor de Módulos por Negócio no Admin do BancoFé
 * Permite adicionar, modificar, excluir e ativar módulos para cada vertical de negócio:
 * 1. BancoFé Digital & Banking
 * 2. Casa Nova Imóveis & Crédito Habitacional
 * 3. Agro & Crédito Rural (UISA / Biorrefinaria)
 * 4. Construtora Ultra & Engenharia
 * 5. Dino Barbearia & Varejo
 */
import { z } from "zod";

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
  segmento: "banking" | "imobiliario" | "agro" | "construcao" | "varejo";
  corPrimaria: string;
  corSecundaria: string;
  icone: string;
  urlBase: string;
  descricao: string;
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

export class GestorModulosNegocioBancoFe {
  private negocios: Map<string, NegocioCorporativo> = new Map();

  constructor() {
    this.inicializarNegociosPadrao();
  }

  private inicializarNegociosPadrao() {
    const padroes: NegocioCorporativo[] = [
      {
        id: "neg-bancofe",
        slug: "bancofe",
        nome: "BancoFé Digital",
        razaoSocial: "BANCOFE MEIOS DE PAGAMENTO E CORRESPONDENTE BANCARIO LTDA",
        cnpj: "53.338.003/0001-04",
        segmento: "banking",
        corPrimaria: "#0c4a34", // Verde esmeralda bancário
        corSecundaria: "#d4af37", // Dourado
        icone: "fa-building-columns",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app",
        descricao: "Plataforma central de banking, crédito inteligente, contas digitais e meios de pagamento.",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-casanova",
        slug: "casanova",
        nome: "Casa Nova Imóveis",
        razaoSocial: "CASANOVA IMOVEIS & EMPREENDIMENTOS LTDA",
        cnpj: "08.941.233/0001-90",
        segmento: "imobiliario",
        corPrimaria: "#126245",
        corSecundaria: "#22c55e",
        icone: "fa-house-chimney",
        urlBase: "https://casanova.kytto.com.br",
        descricao: "Portal imobiliário e esteira de correspondente bancário (Corban) para crédito habitacional.",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-agro",
        slug: "agro",
        nome: "Agro & Crédito Rural (UISA)",
        razaoSocial: "USINAS ITAMARATI S/A & ESTÂNCIA GONÇALVES",
        cnpj: "15.009.178/0001-70",
        segmento: "agro",
        corPrimaria: "#15803d",
        corSecundaria: "#ca8a04",
        icone: "fa-wheat-awn",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/agro",
        descricao: "Soluções de crédito rural, antecipação de safra (CPR Digital), barter e gestão pecuária.",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-ultra",
        slug: "ultra",
        nome: "Construtora Ultra",
        razaoSocial: "CONSTRUTORA ULTRA ENGENHARIA LTDA",
        cnpj: "18.491.204/0001-55",
        segmento: "construcao",
        corPrimaria: "#1e3a8a",
        corSecundaria: "#3b82f6",
        icone: "fa-helmet-safety",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/ultra",
        descricao: "Financiamento de obras com medição SINAPI, controle físico-financeiro e venda de lotes.",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
          },
        ],
      },
      {
        id: "neg-dino",
        slug: "dino",
        nome: "Dino Barbearia & Varejo",
        razaoSocial: "DINO BARBEARIA & ESTÉTICA MASCULINA LTDA",
        cnpj: "24.891.044/0001-12",
        segmento: "varejo",
        corPrimaria: "#78350f",
        corSecundaria: "#f59e0b",
        icone: "fa-scissors",
        urlBase: "https://erp-bancofe-5xsi5uyoda-rj.a.run.app/dino",
        descricao: "Soluções de captura de pagamentos, maquininha Smart POS e microcrédito para varejo.",
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
            dataAtualizacao: "2026-11-22T00:00:00.000Z",
          },
        ],
      },
    ];

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
    return mod;
  }

  public excluirModulo(negocioId: string, moduloId: string): boolean {
    const neg = this.obterNegocio(negocioId);
    if (!neg) return false;

    const idx = neg.modulos.findIndex((m) => m.id === moduloId || m.codigo === moduloId);
    if (idx === -1) return false;

    neg.modulos.splice(idx, 1);
    return true;
  }

  public alternarStatusModulo(negocioId: string, moduloId: string): ModuloNegocio | null {
    const neg = this.obterNegocio(negocioId);
    if (!neg) return null;

    const mod = neg.modulos.find((m) => m.id === moduloId || m.codigo === moduloId);
    if (!mod) return null;

    mod.ativo = !mod.ativo;
    mod.dataAtualizacao = new Date().toISOString();
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

export const gestorModulosNegocio = new GestorModulosNegocioBancoFe();
