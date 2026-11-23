/**
 * Motor de Descoberta, Qualificação e Radar Preditivo de Clientes BancoFé
 * Integrado ao ecossistema Casa Nova Imóveis, UISA e Kytto Tecnologia
 * Mapeia e qualifica potenciais tomadores de crédito, investidores e correntistas
 * por segmentos socioeconômicos (Agro, Médicos, Empresários, Servidores, MCMV, Investidores).
 */
import { createHash, randomUUID } from "node:crypto";

export type SegmentoEconomicoCliente =
  | "todos"
  | "agronegocio"
  | "empresarios"
  | "medicos_saude"
  | "servidores_publicos"
  | "primeiro_imovel_mcmv"
  | "investidores_patrimoniais";

export interface ClientePotencialBancoFe {
  id: string;
  nome: string;
  cpfMascarado: string;
  segmento: SegmentoEconomicoCliente;
  profissaoCargo: string;
  empresaOuInstituicao: string;
  municipio: string;
  uf: string;
  bairroReferencia: string;
  rendaEstimadaMensal: number;
  capacidadeCompraEstimada: number;
  scoreSerasaEstimado: number;
  bancoEleitoSugerido: string;
  sistemaFinanciamento: "SAC" | "PRICE" | "RECURSOS_PROPRIOS";
  produtosBancariosSugeridos: string[];
  limiteCreditoPreAprovadoEstimado: number;
  taxaJurosMensalSugerida: number;
  origemSinalizacao: string;
  statusProspeccao: "novo_descoberto" | "em_contato_casito" | "qualificado" | "em_precadastro" | "mesa_credito";
  sugestaoAcaoImediata: string;
  cnpjEmpresa?: string;
  razaoSocial?: string;
  cnaeDescricao?: string;
  vinculosParentescos?: Array<{ nome: string; grau: string; profissao: string }>;
  veiculosPatrimonio?: Array<{ modelo: string; ano: number; valorFipe: number }>;
  imoveisRuraisCar?: Array<{ codigoCar: string; denominacao: string; municipio: string }>;
}

export interface FiltrosRadarProspeccao {
  termo?: string;
  segmento?: SegmentoEconomicoCliente;
  municipio?: string;
  rendaMinima?: number;
  scoreMinimo?: number;
}

export class MotorRadarProspeccaoBancoFe {
  /**
   * Base de Inteligência Socioeconômica Regional BancoFé
   * (Tangará da Serra, Nova Olímpia, Mirante do Paranapanema e Chapadão dos Parecis)
   */
  private static readonly BASE_CLIENTES_RADAR: ClientePotencialBancoFe[] = [
    {
      id: "pot-001",
      nome: "Valdir Antônio Crestani",
      cpfMascarado: "348.***.***-15",
      segmento: "agronegocio",
      profissaoCargo: "Produtor Rural (Soja e Milho)",
      empresaOuInstituicao: "Fazenda Santa Maria / Sindicato Rural TGA",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Europa",
      rendaEstimadaMensal: 68000,
      capacidadeCompraEstimada: 2800000,
      scoreSerasaEstimado: 940,
      bancoEleitoSugerido: "BancoFé Agro / Sicredi",
      sistemaFinanciamento: "RECURSOS_PROPRIOS",
      produtosBancariosSugeridos: ["Crédito Rural Custeio Safra", "CPR Digital", "Conta PJ Agro", "Câmbio & Barter"],
      limiteCreditoPreAprovadoEstimado: 1200000,
      taxaJurosMensalSugerida: 0.95,
      origemSinalizacao: "Cruzamento Safra SEFAZ-MT & Sindicato Rural",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Oferecer CPR Digital BancoFé e linha de capital de giro pré-safra com garantias em grãos.",
    },
    {
      id: "pot-002",
      nome: "Dra. Luciana Meireles Guimarães",
      cpfMascarado: "582.***.***-72",
      segmento: "medicos_saude",
      profissaoCargo: "Médica Cardiologista",
      empresaOuInstituicao: "Hospital Santa Ângela / Clínica Coração TGA",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Centro",
      rendaEstimadaMensal: 42000,
      capacidadeCompraEstimada: 1750000,
      scoreSerasaEstimado: 890,
      bancoEleitoSugerido: "BancoFé Prime / Itaú",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Imobiliário SBPE", "Conta Corrente Prime", "Cartão Black", "Investimentos CDB"],
      limiteCreditoPreAprovadoEstimado: 650000,
      taxaJurosMensalSugerida: 0.88,
      origemSinalizacao: "CRM-MT & Corpo Clínico Hospitalar",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar portfólio de financiamento SBPE com taxas especiais para profissionais de medicina.",
    },
    {
      id: "pot-003",
      nome: "Evandro Carlos Masson",
      cpfMascarado: "219.***.***-04",
      segmento: "empresarios",
      profissaoCargo: "Sócio-Diretor Logística & Transportes",
      empresaOuInstituicao: "Transmasson Logística Rodoviária Ltda",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Vila Alta",
      rendaEstimadaMensal: 35000,
      capacidadeCompraEstimada: 1400000,
      scoreSerasaEstimado: 860,
      bancoEleitoSugerido: "BancoFé Empresas / Bradesco",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Capital de Giro PJ", "Financiamento de Frota", "Antecipação de Recebíveis", "Folha de Pagamento"],
      limiteCreditoPreAprovadoEstimado: 500000,
      taxaJurosMensalSugerida: 1.15,
      origemSinalizacao: "JUCEMAT & Base Empresarial Ativa TGA",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Estruturar linha de antecipação de fretes e financiamento de caminhões e implementos.",
    },
    {
      id: "pot-004",
      nome: "Prof. Dr. Alexandre Bezerra Couto",
      cpfMascarado: "415.***.***-88",
      segmento: "servidores_publicos",
      profissaoCargo: "Professor Doutor / Pesquisador UNEMAT",
      empresaOuInstituicao: "Universidade do Estado de Mato Grosso (UNEMAT)",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Tangará",
      rendaEstimadaMensal: 21500,
      capacidadeCompraEstimada: 920000,
      scoreSerasaEstimado: 910,
      bancoEleitoSugerido: "BancoFé Servidor / Banco do Brasil",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Crédito Consignado 35%", "Financiamento Habitacional Servidor", "Portabilidade Salário"],
      limiteCreditoPreAprovadoEstimado: 320000,
      taxaJurosMensalSugerida: 0.79,
      origemSinalizacao: "Portal Transparência MT & Folha Estadual",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar simulação de portabilidade de crédito consignado com taxa reduzida de 0,79% a.m.",
    },
    {
      id: "pot-005",
      nome: "Guilherme Santos Figueiredo",
      cpfMascarado: "693.***.***-30",
      segmento: "agronegocio",
      profissaoCargo: "Engenheiro Agrônomo / Consultor Técnico",
      empresaOuInstituicao: "AgroParecis Consultoria & Insumos",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Parque do Bosque",
      rendaEstimadaMensal: 19000,
      capacidadeCompraEstimada: 820000,
      scoreSerasaEstimado: 840,
      bancoEleitoSugerido: "BancoFé Agro / Sicredi",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Imobiliário", "Crédito Pessoal", "Seguro Agrícola", "Conta PJ"],
      limiteCreditoPreAprovadoEstimado: 280000,
      taxaJurosMensalSugerida: 0.99,
      origemSinalizacao: "CREA-MT & Empresas Insumos Agrícolas",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar proposta de aquisição de terreno e construção residencial com financiamento BancoFé.",
    },
    {
      id: "pot-006",
      nome: "Juliana Camargo Diniz",
      cpfMascarado: "740.***.***-61",
      segmento: "primeiro_imovel_mcmv",
      profissaoCargo: "Analista de Recursos Humanos",
      empresaOuInstituicao: "Frigorífico JBS / Planta Tangará da Serra",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Morada do Sol",
      rendaEstimadaMensal: 7400,
      capacidadeCompraEstimada: 340000,
      scoreSerasaEstimado: 780,
      bancoEleitoSugerido: "Caixa Econômica Federal / BancoFé Habitacional",
      sistemaFinanciamento: "PRICE",
      produtosBancariosSugeridos: ["MCMV Faixa 3", "Uso do FGTS", "Conta Digital Salário", "Cartão Consignado"],
      limiteCreditoPreAprovadoEstimado: 180000,
      taxaJurosMensalSugerida: 0.65,
      origemSinalizacao: "Cadastro Habitacional MCMV & FGTS Ativo",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Enquadrar no Minha Casa Minha Vida com subsídio governamental e taxa de juros subsidiada.",
    },
    {
      id: "pot-007",
      nome: "Dr. Roberto Hiroshi Takahashi",
      cpfMascarado: "167.***.***-90",
      segmento: "investidores_patrimoniais",
      profissaoCargo: "Cirurgião-Dentista / Investidor",
      empresaOuInstituicao: "Instituto Odontológico Takahashi",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Centro",
      rendaEstimadaMensal: 48000,
      capacidadeCompraEstimada: 2200000,
      scoreSerasaEstimado: 920,
      bancoEleitoSugerido: "BancoFé Private / Santander",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["LCI/LCA Isentas de IR", "Crédito com Garantia de Imóvel (Home Equity)", "Fundos Imobiliários"],
      limiteCreditoPreAprovadoEstimado: 850000,
      taxaJurosMensalSugerida: 0.82,
      origemSinalizacao: "CRO-MT & Investidores Locais de Terrenos",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar títulos de renda fixa agropecuária e estruturação de Home Equity para novas aquisições.",
    },
    {
      id: "pot-008",
      nome: "Marcos Vinicius de Albuquerque",
      cpfMascarado: "458.***.***-44",
      segmento: "empresarios",
      profissaoCargo: "Diretor Comercial Máquinas Agrícolas",
      empresaOuInstituicao: "Casanova Tratores & Implementos",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Europa",
      rendaEstimadaMensal: 38000,
      capacidadeCompraEstimada: 1650000,
      scoreSerasaEstimado: 875,
      bancoEleitoSugerido: "BancoFé Empresas / Sicredi",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Maquininha BancoFé Taxa Zero", "Financiamento PJ Maquinário", "Conta Jurídica"],
      limiteCreditoPreAprovadoEstimado: 600000,
      taxaJurosMensalSugerida: 1.05,
      origemSinalizacao: "Concessionárias Agrícolas Parecis",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Integrar cobrança via PIX dinâmico BancoFé e linha de financiamento de máquinas aos produtores.",
    },
    {
      id: "pot-009",
      nome: "Fabiana Prado Zanatta",
      cpfMascarado: "512.***.***-18",
      segmento: "servidores_publicos",
      profissaoCargo: "Analista Judiciária TJMT",
      empresaOuInstituicao: "Fórum da Comarca de Tangará da Serra",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Tarumã",
      rendaEstimadaMensal: 18500,
      capacidadeCompraEstimada: 790000,
      scoreSerasaEstimado: 895,
      bancoEleitoSugerido: "BancoFé Servidor / Caixa",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Imobiliário SBPE", "Crédito Consignado TJMT", "Previdência Privada"],
      limiteCreditoPreAprovadoEstimado: 290000,
      taxaJurosMensalSugerida: 0.78,
      origemSinalizacao: "TJMT Folha de Pagamento & Cartórios",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Conceder limites pré-aprovados para reforma e aquisição residencial no Residencial Tarumã.",
    },
    {
      id: "pot-010",
      nome: "Carlos Eduardo Nogueira",
      cpfMascarado: "831.***.***-52",
      segmento: "primeiro_imovel_mcmv",
      profissaoCargo: "Técnico Mecânico Industrial",
      empresaOuInstituicao: "Usina Itamarati / UISA",
      municipio: "Nova Olímpia",
      uf: "MT",
      bairroReferencia: "Centro",
      rendaEstimadaMensal: 6200,
      capacidadeCompraEstimada: 280000,
      scoreSerasaEstimado: 760,
      bancoEleitoSugerido: "BancoFé UISA / Caixa",
      sistemaFinanciamento: "PRICE",
      produtosBancariosSugeridos: ["Crédito Consignado UISA", "Financiamento Imobiliário MCMV", "Cartão Salário BancoFé"],
      limiteCreditoPreAprovadoEstimado: 140000,
      taxaJurosMensalSugerida: 0.69,
      origemSinalizacao: "Acordo de Cooperação UISA / BancoFé",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Ativar crédito consignado automático em folha UISA com carência de 60 dias para primeira parcela.",
    },
    {
      id: "pot-011",
      nome: "Rodrigo Mendonça Paes",
      cpfMascarado: "389.***.***-64",
      segmento: "investidores_patrimoniais",
      profissaoCargo: "Empresário Varejista & Incorporador",
      empresaOuInstituicao: "Grupo Paes Eletromóveis MT",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Centro",
      rendaEstimadaMensal: 55000,
      capacidadeCompraEstimada: 2500000,
      scoreSerasaEstimado: 935,
      bancoEleitoSugerido: "BancoFé Private / BTG Pactual",
      sistemaFinanciamento: "RECURSOS_PROPRIOS",
      produtosBancariosSugeridos: ["Estruturação de CRI/CRA", "Antecipação de Recebíveis de Cartão", "Gestão de Caixa PJ"],
      limiteCreditoPreAprovadoEstimado: 1500000,
      taxaJurosMensalSugerida: 0.89,
      origemSinalizacao: "Rede de Lojas do Comércio TGA",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar estruturação financeira para loteamento urbano com emissão de recebíveis BancoFé.",
    },
    {
      id: "pot-012",
      nome: "Dra. Renata Junqueira Alencar",
      cpfMascarado: "472.***.***-81",
      segmento: "medicos_saude",
      profissaoCargo: "Médica Pediatra & Gestora de Clínica",
      empresaOuInstituicao: "Clínica Pediátrica Crescer & Unimed",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Europa",
      rendaEstimadaMensal: 36000,
      capacidadeCompraEstimada: 1550000,
      scoreSerasaEstimado: 905,
      bancoEleitoSugerido: "BancoFé Prime / Sicredi",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Imobiliário", "Crédito para Equipamentos Médicos", "Seguro de Responsabilidade"],
      limiteCreditoPreAprovadoEstimado: 550000,
      taxaJurosMensalSugerida: 0.85,
      origemSinalizacao: "Unimed Vale do Sepotuba / CRM",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Propor financiamento para modernização do consultório médico e aquisição de imóvel comercial.",
    },
    {
      id: "pot-013",
      nome: "Henrique Silveira Bataglin",
      cpfMascarado: "518.***.***-23",
      segmento: "agronegocio",
      profissaoCargo: "Sócio Administrador Fazenda Primavera",
      empresaOuInstituicao: "Agropecuária Bataglin Irmãos",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Zona Rural / Rodovia MT-358",
      rendaEstimadaMensal: 82000,
      capacidadeCompraEstimada: 3600000,
      scoreSerasaEstimado: 960,
      bancoEleitoSugerido: "BancoFé Agro / Banco do Brasil",
      sistemaFinanciamento: "RECURSOS_PROPRIOS",
      produtosBancariosSugeridos: ["Financiamento de Armazéns e Silos", "Custeio Pecuária de Corte", "Seguro de Penhor Rural"],
      limiteCreditoPreAprovadoEstimado: 2000000,
      taxaJurosMensalSugerida: 0.92,
      origemSinalizacao: "SICAR / Sema-MT & Cadastro IMEA",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Oferecer estruturação de financiamento para instalação de usina fotovoltaica rural no canteiro da fazenda.",
    },
    {
      id: "pot-014",
      nome: "Tatiane Souza Nogueira",
      cpfMascarado: "631.***.***-95",
      segmento: "servidores_publicos",
      profissaoCargo: "Auditora Fiscal Tributária Municipal",
      empresaOuInstituicao: "Prefeitura Municipal de Tangará da Serra",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Centro",
      rendaEstimadaMensal: 16800,
      capacidadeCompraEstimada: 720000,
      scoreSerasaEstimado: 885,
      bancoEleitoSugerido: "BancoFé Servidor / Caixa",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Consignado Municipal", "Financiamento Imobiliário", "Investimentos em Renda Fixa"],
      limiteCreditoPreAprovadoEstimado: 260000,
      taxaJurosMensalSugerida: 0.81,
      origemSinalizacao: "Sindicato dos Fiscais e Auditores TGA",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Liberar margem consignável municipal imediata com pré-aprovação de crédito no aplicativo BancoFé.",
    },
    {
      id: "pot-015",
      nome: "Fernando Augusto Dantas",
      cpfMascarado: "294.***.***-38",
      segmento: "empresarios",
      profissaoCargo: "Proprietário Rede de Farmácias",
      empresaOuInstituicao: "Dantas Drogaria & Manipulação",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Vila Alta",
      rendaEstimadaMensal: 29000,
      capacidadeCompraEstimada: 1250000,
      scoreSerasaEstimado: 855,
      bancoEleitoSugerido: "BancoFé Empresas / Bradesco",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Capital de Giro Rápido", "Maquininha com PIX Instantâneo", "Antecipação de Cartões"],
      limiteCreditoPreAprovadoEstimado: 400000,
      taxaJurosMensalSugerida: 1.12,
      origemSinalizacao: "Conselho Regional de Farmácia & CDL",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Substituir POS da farmácia pela Maquininha BancoFé com taxa zero no PIX e recebimento em 1 segundo.",
    },
    {
      id: "pot-016",
      nome: "Cleiton José Ribeiro",
      cpfMascarado: "702.***.***-19",
      segmento: "agronegocio",
      profissaoCargo: "Operador de Maquinário Pesado & Produtor",
      empresaOuInstituicao: "UISA & Produtor Familiar de Hortifrúti",
      municipio: "Nova Olímpia",
      uf: "MT",
      bairroReferencia: "Zona Rural",
      rendaEstimadaMensal: 8900,
      capacidadeCompraEstimada: 390000,
      scoreSerasaEstimado: 810,
      bancoEleitoSugerido: "BancoFé Pronaf / Banco do Brasil",
      sistemaFinanciamento: "PRICE",
      produtosBancariosSugeridos: ["Pronaf Mulher / Jovem", "Crédito Rural Familiar", "Microcrédito Produtivo Orientado"],
      limiteCreditoPreAprovadoEstimado: 170000,
      taxaJurosMensalSugerida: 0.58,
      origemSinalizacao: "Programa Agro Familiar Nova Olímpia / UISA",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Enquadrar no Pronaf Custeio com juros bonificados de 0,58% a.m. para aquisição de trator leve.",
    },

    // NOVOS PERFIS REGIONAIS AMPLIADOS (17 A 26)
    {
      id: "pot-017",
      nome: "Dr. Alessandro Faria Marcondes",
      cpfMascarado: "318.***.***-45",
      segmento: "medicos_saude",
      profissaoCargo: "Médico Ortopedista & Cirurgião Traumatologista",
      empresaOuInstituicao: "Hospital Santa Ângela / Instituto Ortopédico TGA",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Europa",
      rendaEstimadaMensal: 52000,
      capacidadeCompraEstimada: 2300000,
      scoreSerasaEstimado: 930,
      bancoEleitoSugerido: "BancoFé Prime / Sicredi",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Imobiliário Residencial SBPE", "Financiamento de Equipamentos Cirúrgicos", "Cartão Black VIP"],
      limiteCreditoPreAprovadoEstimado: 950000,
      taxaJurosMensalSugerida: 0.84,
      origemSinalizacao: "CRM-MT & Corpo Clínico Especializado",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar propostas de lote e construção de alto padrão no Condomínio Manacás com financiamento Casa Nova.",
    },
    {
      id: "pot-018",
      nome: "Maria Clara Prado Vasconcelos",
      cpfMascarado: "419.***.***-82",
      segmento: "agronegocio",
      profissaoCargo: "Produtora Rural (Soja, Milho e Algodão)",
      empresaOuInstituicao: "Fazenda Campo Belo / Grupo Agro Parecis",
      municipio: "Campo Novo do Parecis",
      uf: "MT",
      bairroReferencia: "Zona Rural / Parecis",
      rendaEstimadaMensal: 110000,
      capacidadeCompraEstimada: 5200000,
      scoreSerasaEstimado: 970,
      bancoEleitoSugerido: "BancoFé Agro / Banco do Brasil",
      sistemaFinanciamento: "RECURSOS_PROPRIOS",
      produtosBancariosSugeridos: ["CPR Financeira Verde", "Financiamento de Armazenagem", "Câmbio e Hedge Agrícola", "Conta PJ Agro"],
      limiteCreditoPreAprovadoEstimado: 3500000,
      taxaJurosMensalSugerida: 0.88,
      origemSinalizacao: "SICAR / CAR Ativo 3.200 Hectares & Aprosoja MT",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Emitir CPR Financeira BancoFé estruturada com indexação em sacas de soja e garantia de safra futura.",
    },
    {
      id: "pot-019",
      nome: "Dr. Fábio Junqueira de Lacerda",
      cpfMascarado: "291.***.***-60",
      segmento: "investidores_patrimoniais",
      profissaoCargo: "Tabelião & Registrador de Imóveis Titular",
      empresaOuInstituicao: "Cartório Notarial e Registral de Tangará da Serra",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Centro",
      rendaEstimadaMensal: 75000,
      capacidadeCompraEstimada: 3800000,
      scoreSerasaEstimado: 980,
      bancoEleitoSugerido: "BancoFé Private / BTG",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Home Equity LTV 60%", "CDB Liquidez Diária BancoFé 115% CDI", "Gestão de Ativos Imobiliários"],
      limiteCreditoPreAprovadoEstimado: 2200000,
      taxaJurosMensalSugerida: 0.79,
      origemSinalizacao: "Anoreg-MT & Registro de Imóveis",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar estruturação de fundos imobiliários e conta de custódia corporativa BancoFé.",
    },
    {
      id: "pot-020",
      nome: "Dr. Marcio Vinicius Fagundes",
      cpfMascarado: "530.***.***-31",
      segmento: "servidores_publicos",
      profissaoCargo: "Delegado de Polícia Civil",
      empresaOuInstituicao: "Polícia Judiciária Civil de Mato Grosso (PJC-MT)",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Tarumã",
      rendaEstimadaMensal: 31000,
      capacidadeCompraEstimada: 1350000,
      scoreSerasaEstimado: 925,
      bancoEleitoSugerido: "BancoFé Servidor / Banco do Brasil",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Crédito Consignado PJC-MT", "Financiamento Imobiliário Servidor", "Seguro de Vida Especial"],
      limiteCreditoPreAprovadoEstimado: 480000,
      taxaJurosMensalSugerida: 0.78,
      origemSinalizacao: "Folha de Pagamento Seplag-MT / Segurança Pública",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Oferecer financiamento SBPE com carência de 180 dias e margem consignável pré-aprovada.",
    },
    {
      id: "pot-021",
      nome: "Camila Cristina Ferreira",
      cpfMascarado: "719.***.***-08",
      segmento: "empresarios",
      profissaoCargo: "Diretora Operacional Rede Compre Bem Supermercados",
      empresaOuInstituicao: "Compre Bem Alimentos Ltda",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Tanaka",
      rendaEstimadaMensal: 45000,
      capacidadeCompraEstimada: 1900000,
      scoreSerasaEstimado: 890,
      bancoEleitoSugerido: "BancoFé Empresas / Bradesco",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Maquininhas Smart POS nos Checkouts", "Antecipação de Recebíveis D+0", "Capital de Giro Estoque"],
      limiteCreditoPreAprovadoEstimado: 750000,
      taxaJurosMensalSugerida: 1.08,
      origemSinalizacao: "CDL Tangará da Serra & JUCEMAT",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Instalar 12 terminais BancoFé Smart POS com TEF integrado e taxa PIX balcão 0%.",
    },
    {
      id: "pot-022",
      nome: "Lucas Pires Guimarães",
      cpfMascarado: "614.***.***-90",
      segmento: "agronegocio",
      profissaoCargo: "Engenheiro Agrônomo / Consultor Técnico de Sementes e Solo",
      empresaOuInstituicao: "AgroFértil Soluções Agronômicas",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Parque das Mansões",
      rendaEstimadaMensal: 24000,
      capacidadeCompraEstimada: 1050000,
      scoreSerasaEstimado: 870,
      bancoEleitoSugerido: "BancoFé Agro / Sicredi",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Imobiliário Construtora Ultra", "Crédito Pessoal", "Seguro Agro"],
      limiteCreditoPreAprovadoEstimado: 380000,
      taxaJurosMensalSugerida: 0.92,
      origemSinalizacao: "CREA-MT & Consultores de Safra",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar plano de aquisição de terreno e construção de casa térrea com financiamento integrado.",
    },
    {
      id: "pot-023",
      nome: "Profa. Dra. Vanessa Toledo Brandão",
      cpfMascarado: "482.***.***-20",
      segmento: "servidores_publicos",
      profissaoCargo: "Professora Titular IFMT / Pesquisadora em Biotecnologia",
      empresaOuInstituicao: "Instituto Federal de Mato Grosso (IFMT Campus Tangará)",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Jardim Tangará",
      rendaEstimadaMensal: 22800,
      capacidadeCompraEstimada: 980000,
      scoreSerasaEstimado: 915,
      bancoEleitoSugerido: "BancoFé Servidor / Caixa",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Crédito Consignado Federal Siape", "Financiamento Habitacional SBPE", "Previdência Privada"],
      limiteCreditoPreAprovadoEstimado: 350000,
      taxaJurosMensalSugerida: 0.77,
      origemSinalizacao: "Portal Siape Federal & Transparência",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Apresentar condições de portabilidade de crédito imobiliário com redução de juros contratuais.",
    },
    {
      id: "pot-024",
      nome: "Thiago Rossi Dal Molin",
      cpfMascarado: "390.***.***-74",
      segmento: "empresarios",
      profissaoCargo: "Sócio Diretor Concessionária de Tratores",
      empresaOuInstituicao: "AgroTratores Case IH & Implementos",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Distrito Industrial",
      rendaEstimadaMensal: 62000,
      capacidadeCompraEstimada: 2900000,
      scoreSerasaEstimado: 945,
      bancoEleitoSugerido: "BancoFé Empresas / Banco do Brasil",
      sistemaFinanciamento: "SAC",
      produtosBancariosSugeridos: ["Financiamento Safra Moderfrota", "Giro de Estoque PJ", "Conta Escrow Barter"],
      limiteCreditoPreAprovadoEstimado: 1400000,
      taxaJurosMensalSugerida: 1.02,
      origemSinalizacao: "Revendas de Máquinas Parecis",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Estruturar linha de repasse de financiamento BancoFé diretamente no balcão da concessionária.",
    },
    {
      id: "pot-025",
      nome: "Leonardo Zanin de Oliveira",
      cpfMascarado: "518.***.***-63",
      segmento: "agronegocio",
      profissaoCargo: "Pecuarista de Confinamento Nelore de Elite",
      empresaOuInstituicao: "Fazenda Confinamento Vale do Sepotuba",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Zona Rural / Sepotuba",
      rendaEstimadaMensal: 95000,
      capacidadeCompraEstimada: 4500000,
      scoreSerasaEstimado: 965,
      bancoEleitoSugerido: "BancoFé Agro / Sicredi",
      sistemaFinanciamento: "RECURSOS_PROPRIOS",
      produtosBancariosSugeridos: ["Custeio Pecuária CPR Boi Gordo", "Financiamento de Nutrição Animal", "Crédito Rural Silagem"],
      limiteCreditoPreAprovadoEstimado: 2500000,
      taxaJurosMensalSugerida: 0.90,
      origemSinalizacao: "Indea-MT & Guias de Trânsito Animal (GTA)",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Oferecer CPR Boi Gordo BancoFé com liquidação financeira na cotação B3 Arroba do Boi.",
    },
    {
      id: "pot-026",
      nome: "Marcos Vinicius e Franciele Alencar",
      cpfMascarado: "812.***.***-05",
      segmento: "primeiro_imovel_mcmv",
      profissaoCargo: "Casal Jovem / Auxiliar Administrativo e Vendedora",
      empresaOuInstituicao: "Comércio Local de Tangará da Serra",
      municipio: "Tangará da Serra",
      uf: "MT",
      bairroReferencia: "Residencial Dona Júlia",
      rendaEstimadaMensal: 5800,
      capacidadeCompraEstimada: 250000,
      scoreSerasaEstimado: 750,
      bancoEleitoSugerido: "Caixa Econômica / BancoFé MCMV",
      sistemaFinanciamento: "PRICE",
      produtosBancariosSugeridos: ["Minha Casa Minha Vida Faixa 2", "Subsídio Federal de até R$ 55.000", "FGTS Integral"],
      limiteCreditoPreAprovadoEstimado: 150000,
      taxaJurosMensalSugerida: 0.58,
      origemSinalizacao: "Plantão Casa Nova Imóveis & MCMV",
      statusProspeccao: "novo_descoberto",
      sugestaoAcaoImediata: "Enquadrar na faixa 2 do MCMV com subsídio governamental e entrada parcelada em até 36x pela construtora.",
    },
  ];

  /**
   * Consulta e filtra clientes potenciais no Radar Preditivo BancoFé
   */
  public static filtrar(filtros?: FiltrosRadarProspeccao): ClientePotencialBancoFe[] {
    let lista = [...this.BASE_CLIENTES_RADAR];
    if (!filtros) return lista;

    if (filtros.termo) {
      const t = filtros.termo.toLowerCase().trim();
      lista = lista.filter(
        (c) =>
          c.nome.toLowerCase().includes(t) ||
          c.cpfMascarado.includes(t) ||
          c.profissaoCargo.toLowerCase().includes(t) ||
          c.empresaOuInstituicao.toLowerCase().includes(t) ||
          c.municipio.toLowerCase().includes(t) ||
          c.bairroReferencia.toLowerCase().includes(t)
      );
    }

    if (filtros.segmento && filtros.segmento !== "todos") {
      lista = lista.filter((c) => c.segmento === filtros.segmento);
    }

    if (filtros.municipio) {
      const m = filtros.municipio.toLowerCase().trim();
      lista = lista.filter((c) => c.municipio.toLowerCase().includes(m));
    }

    if (filtros.rendaMinima) {
      lista = lista.filter((c) => c.rendaEstimadaMensal >= filtros.rendaMinima!);
    }

    if (filtros.scoreMinimo) {
      lista = lista.filter((c) => c.scoreSerasaEstimado >= filtros.scoreMinimo!);
    }

    return lista;
  }

  /**
   * Obtém um cliente por ID
   */
  public static obterPorId(id: string): ClientePotencialBancoFe | null {
    return this.BASE_CLIENTES_RADAR.find((c) => c.id === id) || null;
  }

  /**
   * Estatísticas consolidadas do Radar Preditivo
   */
  public static obterEstatisticas() {
    const total = this.BASE_CLIENTES_RADAR.length;
    const volumePreAprovadoTotal = this.BASE_CLIENTES_RADAR.reduce(
      (acc, c) => acc + c.limiteCreditoPreAprovadoEstimado,
      0
    );
    const poderCompraTotal = this.BASE_CLIENTES_RADAR.reduce(
      (acc, c) => acc + c.capacidadeCompraEstimada,
      0
    );
    const rendaMedia = Math.round(
      this.BASE_CLIENTES_RADAR.reduce((acc, c) => acc + c.rendaEstimadaMensal, 0) / (total || 1)
    );
    const scoreMedio = Math.round(
      this.BASE_CLIENTES_RADAR.reduce((acc, c) => acc + c.scoreSerasaEstimado, 0) / (total || 1)
    );

    const porSegmento: Record<string, number> = {};
    for (const c of this.BASE_CLIENTES_RADAR) {
      porSegmento[c.segmento] = (porSegmento[c.segmento] || 0) + 1;
    }

    return {
      totalClientesRadar: total,
      volumePreAprovadoTotal,
      poderCompraTotal,
      rendaMedia,
      scoreMedio,
      porSegmento,
    };
  }
}

export const motorRadarProspeccao = MotorRadarProspeccaoBancoFe;
