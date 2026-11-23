/**
 * Base Empresarial e Prospecção PJ BancoFé
 * Estabelecimentos e Empresas com Afinidade a Produtos Bancários Corporativos
 * (Capital de Giro, Maquininha PIX, Antecipação de Recebíveis, Câmbio e CPR)
 */

export interface EmpresaPotencialBancoFe {
  id: string;
  cnpj: string;
  cnpjFormatado: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnaePrincipal: string;
  descricaoCnae: string;
  porte: "MEI" | "ME" | "EPP" | "DEMAIS" | "GRANDE_PORTE";
  capitalSocial: number;
  municipio: string;
  uf: string;
  bairro: string;
  scoreAfinidadeBancaria: number; // 0 a 100
  produtosRecomendados: string[];
  limiteCapitalGiroSugerido: number;
  sociosAdministradores: Array<{
    nome: string;
    cpfMascarado: string;
    cargo: string;
  }>;
}

export const BASE_EMPRESAS_BANCOFE: EmpresaPotencialBancoFe[] = [
  {
    id: "emp-001",
    cnpj: "15009178000170",
    cnpjFormatado: "15.009.178/0001-70",
    razaoSocial: "USINAS ITAMARATI S/A - UISA",
    nomeFantasia: "UISA BIORREFINARIA",
    cnaePrincipal: "1931-4/00",
    descricaoCnae: "Fabricação de álcool / Biorrefinaria Agroindustrial",
    porte: "GRANDE_PORTE",
    capitalSocial: 901394000,
    municipio: "Nova Olímpia",
    uf: "MT",
    bairro: "Fazenda Guanabara",
    scoreAfinidadeBancaria: 99,
    produtosRecomendados: ["Crédito Estruturado CRA/CRI", "Convênio Folha de Pagamento", "Financiamento Agroindustrial Barter", "Hedge Cambial"],
    limiteCapitalGiroSugerido: 50000000,
    sociosAdministradores: [
      { nome: "RODRIGO RIBEIRO GONCALVES", cpfMascarado: "***.871.628-**", cargo: "Diretor de Gente, Inovação e Administração" },
      { nome: "LUCAS DOS PASSOS SILVA", cpfMascarado: "***.887.226-**", cargo: "CIO (Chief Information Officer)" },
    ],
  },
  {
    id: "emp-002",
    cnpj: "53338003000104",
    cnpjFormatado: "53.338.003/0001-04",
    razaoSocial: "PATRICIA FERRARI PAULINO GONCALVES",
    nomeFantasia: "KYTTO TECNOLOGIA E SOLUCOES DIGITAIS",
    cnaePrincipal: "6201-5/01",
    descricaoCnae: "Desenvolvimento de programas de computador sob encomenda",
    porte: "ME",
    capitalSocial: 100000,
    municipio: "Mirante do Paranapanema",
    uf: "SP",
    bairro: "Jardim Flora",
    scoreAfinidadeBancaria: 98,
    produtosRecomendados: ["Conta Digital PJ BancoFé", "Gateway PIX API", "Antecipação de Recebíveis SaaS", "Cartão PJ Internacional"],
    limiteCapitalGiroSugerido: 250000,
    sociosAdministradores: [
      { nome: "PATRICIA FERRARI PAULINO GONCALVES", cpfMascarado: "***.855.228-**", cargo: "Titular e Administradora" },
    ],
  },
  {
    id: "emp-003",
    cnpj: "64336577000151",
    cnpjFormatado: "64.336.577/0001-51",
    razaoSocial: "RODRIGO RIBEIRO GONCALVES E OUTRA",
    nomeFantasia: "ESTÂNCIA GONÇALVES",
    cnaePrincipal: "0151-2/01",
    descricaoCnae: "Criação de bovinos para corte / Pecuária Sustentável",
    porte: "DEMAIS",
    capitalSocial: 1500000,
    municipio: "Mirante do Paranapanema",
    uf: "SP",
    bairro: "Zona Rural",
    scoreAfinidadeBancaria: 96,
    produtosRecomendados: ["Custeio Pecuária BancoFé", "CPR Boi Gordo", "Financiamento de Pastagens & Genética", "Seguro Rural"],
    limiteCapitalGiroSugerido: 1200000,
    sociosAdministradores: [
      { nome: "RODRIGO RIBEIRO GONCALVES", cpfMascarado: "***.871.628-**", cargo: "Sócio Produtor Rural" },
      { nome: "PATRICIA FERRARI PAULINO GONCALVES", cpfMascarado: "***.855.228-**", cargo: "Sócia Produtora Rural" },
    ],
  },
  {
    id: "emp-004",
    cnpj: "08941233000190",
    cnpjFormatado: "08.941.233/0001-90",
    razaoSocial: "CASANOVA IMOVEIS & EMPREENDIMENTOS LTDA",
    nomeFantasia: "CASA NOVA IMOVEIS TANGARA",
    cnaePrincipal: "6821-8/01",
    descricaoCnae: "Corretagem na compra e venda e avaliação de imóveis",
    porte: "EPP",
    capitalSocial: 800000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Centro",
    scoreAfinidadeBancaria: 97,
    produtosRecomendados: ["Esteira de Crédito Imobiliário Corban", "Conta Escrow de Locação", "Repasse de Aluguel via PIX", "Giro Imobiliário"],
    limiteCapitalGiroSugerido: 600000,
    sociosAdministradores: [
      { nome: "SÓCIO ADMINISTRADOR CASANOVA", cpfMascarado: "***.434.901-**", cargo: "Sócio-Diretor" },
    ],
  },
  {
    id: "emp-005",
    cnpj: "18491204000155",
    cnpjFormatado: "18.491.204/0001-55",
    razaoSocial: "CONSTRUTORA ULTRA ENGENHARIA LTDA",
    nomeFantasia: "ULTRA CONSTRUTORA & INCORPORADORA",
    cnaePrincipal: "4120-4/00",
    descricaoCnae: "Construção de edifícios e obras de infraestrutura urbana",
    porte: "EPP",
    capitalSocial: 2500000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Jardim Europa",
    scoreAfinidadeBancaria: 95,
    produtosRecomendados: ["Crédito Produção Habitacional", "Financiamento de Loteamentos", "Garantia de Obra Seguro Fiança"],
    limiteCapitalGiroSugerido: 3000000,
    sociosAdministradores: [
      { nome: "DIRETOR ENGENHARIA ULTRA", cpfMascarado: "***.518.231-**", cargo: "Responsável Técnico" },
    ],
  },
  {
    id: "emp-006",
    cnpj: "24891044000112",
    cnpjFormatado: "24.891.044/0001-12",
    razaoSocial: "DINO BARBEARIA & ESTÉTICA MASCULINA LTDA",
    nomeFantasia: "DINO BARBEARIA & PERFUMARIA",
    cnaePrincipal: "9602-5/01",
    descricaoCnae: "Cabeleireiros, manicure e pedicure / Comércio de cosméticos",
    porte: "ME",
    capitalSocial: 150000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Centro",
    scoreAfinidadeBancaria: 92,
    produtosRecomendados: ["Maquininha BancoFé Smart POS", "PIX Dinâmico QR Code no Balcão", "Microcrédito Capital de Giro", "Conta Digital"],
    limiteCapitalGiroSugerido: 80000,
    sociosAdministradores: [
      { nome: "GUILHERME DINO", cpfMascarado: "***.693.301-**", cargo: "Sócio Gerente" },
      { nome: "JHENIFER DINO", cpfMascarado: "***.740.612-**", cargo: "Sócia Administradora" },
    ],
  },
];

export function listarEmpresasPotenciais(filtro?: { termo?: string; municipio?: string }): EmpresaPotencialBancoFe[] {
  let lista = [...BASE_EMPRESAS_BANCOFE];
  if (!filtro) return lista;

  if (filtro.termo) {
    const t = filtro.termo.toLowerCase().trim();
    lista = lista.filter(
      (e) =>
        e.razaoSocial.toLowerCase().includes(t) ||
        e.nomeFantasia.toLowerCase().includes(t) ||
        e.cnpj.includes(t) ||
        e.descricaoCnae.toLowerCase().includes(t)
    );
  }

  if (filtro.municipio) {
    const m = filtro.municipio.toLowerCase().trim();
    lista = lista.filter((e) => e.municipio.toLowerCase().includes(m));
  }

  return lista;
}
