/**
 * Base Empresarial e Prospecção PJ BancoFé
 * Catálogo Corporativo de Estabelecimentos e Empresas com Afinidade a Produtos Bancários
 * (Capital de Giro, Maquininha Smart POS PIX, Antecipação de Recebíveis, Câmbio, CPR e Folha)
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
  // 1. UISA BIORREFINARIA
  {
    id: "emp-001",
    cnpj: "15009178000170",
    cnpjFormatado: "15.009.178/0001-70",
    razaoSocial: "USINAS ITAMARATI S/A - UISA",
    nomeFantasia: "UISA BIORREFINARIA AGROINDUSTRIAL",
    cnaePrincipal: "1931-4/00",
    descricaoCnae: "Fabricação de álcool, açúcar e bioenergia",
    porte: "GRANDE_PORTE",
    capitalSocial: 901394000,
    municipio: "Nova Olímpia",
    uf: "MT",
    bairro: "Fazenda Guanabara",
    scoreAfinidadeBancaria: 99,
    produtosRecomendados: ["Crédito Estruturado CRA/CRI", "Convênio Folha de Pagamento 3.500 Vidas", "Financiamento Agroindustrial Barter", "Hedge Cambial"],
    limiteCapitalGiroSugerido: 50000000,
    sociosAdministradores: [
      { nome: "RODRIGO RIBEIRO GONCALVES", cpfMascarado: "***.871.628-**", cargo: "Diretor Estatutário" },
      { nome: "LUCAS DOS PASSOS SILVA", cpfMascarado: "***.887.226-**", cargo: "Chief Information Officer (CIO)" },
    ],
  },

  // 2. KYTTO TECNOLOGIA
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

  // 3. ESTÂNCIA GONÇALVES
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

  // 4. CASA NOVA IMÓVEIS
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

  // 5. CONSTRUTORA ULTRA
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
      { nome: "ENG. MARCOS AURELIO PRADO", cpfMascarado: "***.518.231-**", cargo: "Responsável Técnico" },
    ],
  },

  // 6. DINO BARBEARIA & VAREJO
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

  // 7. COPRODIA (COOPERATIVA AGROINDUSTRIAL DO VALE DO RIO DO CELESTE)
  {
    id: "emp-007",
    cnpj: "03492811000184",
    cnpjFormatado: "03.492.811/0001-84",
    razaoSocial: "COOPERATIVA AGRÍCOLA DE PRODUTORES DE CANA DE CAMPO NOVO",
    nomeFantasia: "COPRODIA AGROINDUSTRIAL",
    cnaePrincipal: "1071-6/00",
    descricaoCnae: "Fabricação de açúcar em bruto e etanol",
    porte: "GRANDE_PORTE",
    capitalSocial: 280000000,
    municipio: "Campo Novo do Parecis",
    uf: "MT",
    bairro: "Distrito Industrial",
    scoreAfinidadeBancaria: 98,
    produtosRecomendados: ["Linha de Barter Cana", "Adiantamento de Câmbio ACC/ACE", "CRA Cooperativo", "Crédito Rural CPR"],
    limiteCapitalGiroSugerido: 25000000,
    sociosAdministradores: [
      { nome: "PRESIDENTE DO CONSELHO COPRODIA", cpfMascarado: "***.314.908-**", cargo: "Presidente Executivo" },
    ],
  },

  // 8. AGRO BAGGIO - CONCESSIONÁRIA JOHN DEERE
  {
    id: "emp-008",
    cnpj: "01948210000133",
    cnpjFormatado: "01.948.210/0001-33",
    razaoSocial: "BAGGIO & FILHOS MAQUINAS AGRICOLAS LTDA",
    nomeFantasia: "AGRO BAGGIO JOHN DEERE TANGARÁ",
    cnaePrincipal: "4661-3/00",
    descricaoCnae: "Comércio atacadista de máquinas, aparelhos e equipamentos para uso agropecuário",
    porte: "GRANDE_PORTE",
    capitalSocial: 65000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Distrito Industrial / Rodovia MT-358",
    scoreAfinidadeBancaria: 97,
    produtosRecomendados: ["Financiamento BNDES Moderfrota", "Financiamento de Peças e Serviços", "Giro Estoque", "Maquininha Smart POS"],
    limiteCapitalGiroSugerido: 15000000,
    sociosAdministradores: [
      { nome: "DIRETOR GERAL AGRO BAGGIO", cpfMascarado: "***.812.304-**", cargo: "Diretor Comercial" },
    ],
  },

  // 9. HOSPITAL SANTA ÂNGELA
  {
    id: "emp-009",
    cnpj: "03192844000109",
    cnpjFormatado: "03.192.844/0001-09",
    razaoSocial: "HOSPITAL E MATERNIDADE SANTA ANGELA LTDA",
    nomeFantasia: "HOSPITAL SANTA ÂNGELA",
    cnaePrincipal: "8610-1/01",
    descricaoCnae: "Atividades de atendimento hospitalar, exceto pronto-socorro e UTI para urgência",
    porte: "EPP",
    capitalSocial: 8500000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Centro",
    scoreAfinidadeBancaria: 96,
    produtosRecomendados: ["Crédito Financiamento de Equipamentos Médicos / Ressonância", "Folha de Pagamento Médicos e Enfermagem", "Antecipação de Convênios"],
    limiteCapitalGiroSugerido: 4500000,
    sociosAdministradores: [
      { nome: "DR. DIRETOR CLINICO SANTA ANGELA", cpfMascarado: "***.194.204-**", cargo: "Diretor Clínico" },
    ],
  },

  // 10. UNIMED VALE DO SEPOTUBA
  {
    id: "emp-010",
    cnpj: "37482910000147",
    cnpjFormatado: "37.482.910/0001-47",
    razaoSocial: "UNIMED VALE DO SEPOTUBA COOPERATIVA DE TRABALHO MEDICO",
    nomeFantasia: "UNIMED VALE DO SEPOTUBA",
    cnaePrincipal: "6550-2/00",
    descricaoCnae: "Planos de saúde / Cooperativa médica",
    porte: "GRANDE_PORTE",
    capitalSocial: 18000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Centro",
    scoreAfinidadeBancaria: 97,
    produtosRecomendados: ["Gestão de Tesouraria e CDBs", "Pagamento de Honorários Médicos via PIX Lote", "Giro para Expansão Hospitalar"],
    limiteCapitalGiroSugerido: 8000000,
    sociosAdministradores: [
      { nome: "PRESIDENTE CONSELHO UNIMED", cpfMascarado: "***.582.441-**", cargo: "Diretor Presidente" },
    ],
  },

  // 11. SUPERMERCADOS BIG MASTER
  {
    id: "emp-011",
    cnpj: "04918234000182",
    cnpjFormatado: "04.918.234/0001-82",
    razaoSocial: "BIG MASTER COMERCIO DE ALIMENTOS LTDA",
    nomeFantasia: "SUPERMERCADOS BIG MASTER TANGARÁ",
    cnaePrincipal: "4711-3/02",
    descricaoCnae: "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados",
    porte: "DEMAIS",
    capitalSocial: 12000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Jardim Tarumã",
    scoreAfinidadeBancaria: 98,
    produtosRecomendados: ["Maquininhas Smart POS nos Checkouts", "Antecipação de Recebíveis D+0", "Folha de Pagamento de 450 Colaboradores", "Crédito Fornecedores"],
    limiteCapitalGiroSugerido: 6000000,
    sociosAdministradores: [
      { nome: "DIRETOR SUPERMERCADO MASTER", cpfMascarado: "***.719.820-**", cargo: "Sócio Administrador" },
    ],
  },

  // 12. AGROVALE NEW HOLLAND
  {
    id: "emp-012",
    cnpj: "05819230000199",
    cnpjFormatado: "05.819.230/0001-99",
    razaoSocial: "AGROVALE MAQUINAS E PECAS LTDA",
    nomeFantasia: "AGROVALE NEW HOLLAND",
    cnaePrincipal: "4661-3/00",
    descricaoCnae: "Comércio de tratores e colheitadeiras agrícolas",
    porte: "DEMAIS",
    capitalSocial: 32000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Parque Industrial",
    scoreAfinidadeBancaria: 96,
    produtosRecomendados: ["Financiamento Safra de Maquinários", "CDC Agrícola BancoFé", "Giro de Peças e Oficina"],
    limiteCapitalGiroSugerido: 7500000,
    sociosAdministradores: [
      { nome: "GERENTE REGIONAL NEW HOLLAND", cpfMascarado: "***.481.993-**", cargo: "Administrador" },
    ],
  },

  // 13. FRIGORÍFICO SEARA / JBS TANGARÁ DA SERRA
  {
    id: "emp-013",
    cnpj: "02916265008922",
    cnpjFormatado: "02.916.265/0089-22",
    razaoSocial: "JBS S/A - UNIDADE AVES TANGARA DA SERRA",
    nomeFantasia: "SEARA / JBS TANGARA",
    cnaePrincipal: "1012-1/01",
    descricaoCnae: "Abate de aves e frigorífico de exportação",
    porte: "GRANDE_PORTE",
    capitalSocial: 1450000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Distrito Industrial Norte",
    scoreAfinidadeBancaria: 99,
    produtosRecomendados: ["Convênio de Consignado para 2.400 Integrados e Funcionários", "Financiamento de Galpões Avícolas Automatizados", "Crédito Integrados"],
    limiteCapitalGiroSugerido: 40000000,
    sociosAdministradores: [
      { nome: "DIRETOR CORPORATIVO AGROPECUARIA", cpfMascarado: "***.312.441-**", cargo: "Gerente Geral de Planta" },
    ],
  },

  // 14. TRANSMASSON LOGÍSTICA DE GRÃOS
  {
    id: "emp-014",
    cnpj: "09418294000171",
    cnpjFormatado: "09.418.294/0001-71",
    razaoSocial: "TRANSMASSON TRANSPORTES E LOGISTICA RODOVIARIA LTDA",
    nomeFantasia: "TRANSMASSON LOGÍSTICA",
    cnaePrincipal: "4930-2/02",
    descricaoCnae: "Transporte rodoviário de carga, exceto perigosa, intermunicipal e interestadual",
    porte: "EPP",
    capitalSocial: 3800000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Vila Alta",
    scoreAfinidadeBancaria: 94,
    produtosRecomendados: ["Antecipação de Frete e CIOT", "Financiamento de Carretas Graneleiras e Cavalos Mecânicos", "Seguro de Cargas"],
    limiteCapitalGiroSugerido: 2200000,
    sociosAdministradores: [
      { nome: "EVANDRO CARLOS MASSON", cpfMascarado: "***.219.004-**", cargo: "Sócio Diretor" },
    ],
  },

  // 15. AGRO AMAZÔNIA / SUMITOMO CHEMICAL
  {
    id: "emp-015",
    cnpj: "18942104000130",
    cnpjFormatado: "18.942.104/0001-30",
    razaoSocial: "AGRO AMAZONIA PRODUTOS AGROPECUARIOS S.A.",
    nomeFantasia: "AGRO AMAZÔNIA TANGARÁ DA SERRA",
    cnaePrincipal: "4683-4/00",
    descricaoCnae: "Comércio atacadista de defensivos agrícolas, adubos, fertilizantes e sementes",
    porte: "GRANDE_PORTE",
    capitalSocial: 140000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Setor Industrial",
    scoreAfinidadeBancaria: 98,
    produtosRecomendados: ["Operações de Barter e CPR Financeira de Insumos", "Financiamento de Adubação", "Conta Escrow"],
    limiteCapitalGiroSugerido: 20000000,
    sociosAdministradores: [
      { nome: "DIRETOR REGIONAL AGRO AMAZONIA", cpfMascarado: "***.618.309-**", cargo: "Diretor Comercial" },
    ],
  },

  // 16. AMAGGI EXPORTAÇÃO E LOGÍSTICA
  {
    id: "emp-016",
    cnpj: "03499210000199",
    cnpjFormatado: "03.499.210/0001-99",
    razaoSocial: "AMAGGI EXPORTACAO E IMPORTACAO LTDA",
    nomeFantasia: "TERMINAL DE GRÃOS AMAGGI PARECIS",
    cnaePrincipal: "4623-1/08",
    descricaoCnae: "Comércio atacadista de soja e grãos em geral",
    porte: "GRANDE_PORTE",
    capitalSocial: 1200000000,
    municipio: "Campo Novo do Parecis",
    uf: "MT",
    bairro: "Terminal Ferroviário",
    scoreAfinidadeBancaria: 99,
    produtosRecomendados: ["Estruturação de Pré-Pagamento de Exportação (PPE)", "Câmbio Comercial", "Custódia de Títulos do Agronegócio"],
    limiteCapitalGiroSugerido: 60000000,
    sociosAdministradores: [
      { nome: "GERENTE DE TRADING AMAGGI", cpfMascarado: "***.194.882-**", cargo: "Gerente Geral de Originação" },
    ],
  },

  // 17. SICREDI SUDOESTE MT/PA (COOPERATIVA CENTRAL)
  {
    id: "emp-017",
    cnpj: "03918294000100",
    cnpjFormatado: "03.918.294/0001-00",
    razaoSocial: "COOPERATIVA DE CREDITO SICREDI SUDOESTE MT/PA",
    nomeFantasia: "SICREDI SEDE REGIONAL TANGARÁ DA SERRA",
    cnaePrincipal: "6424-7/01",
    descricaoCnae: "Bancos cooperativos e cooperativas de crédito mútuo",
    porte: "GRANDE_PORTE",
    capitalSocial: 185000000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Jardim Europa",
    scoreAfinidadeBancaria: 95,
    produtosRecomendados: ["Correspondente Bancário de Repasse Imobiliário", "Parceria em Consórcios Imobiliários e Auto", "Co-participação em CPRs"],
    limiteCapitalGiroSugerido: 30000000,
    sociosAdministradores: [
      { nome: "PRESIDENTE REGIONAL SICREDI", cpfMascarado: "***.841.229-**", cargo: "Presidente Executivo" },
    ],
  },

  // 18. POSTOS DECIO TANGARÁ (COMBUSTÍVEIS E TRR AGRO)
  {
    id: "emp-018",
    cnpj: "21948210000144",
    cnpjFormatado: "21.948.210/0001-44",
    razaoSocial: "DECIO PETROLEO E LOGISTICA LTDA",
    nomeFantasia: "POSTO DECIO TANGARÁ & TRR DIESEL AGRO",
    cnaePrincipal: "4731-8/00",
    descricaoCnae: "Comércio varejista de combustíveis para veículos automotores e TRR agrícola",
    porte: "DEMAIS",
    capitalSocial: 8900000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Entroncamento MT-358 / MT-480",
    scoreAfinidadeBancaria: 97,
    produtosRecomendados: ["Maquininhas Smart POS na Pista", "TEF Dedicado", "PIX Dinâmico com Baixa Instantânea", "Crédito Fornecimento Diesel Safra"],
    limiteCapitalGiroSugerido: 4500000,
    sociosAdministradores: [
      { nome: "DIRETOR OPERACOES DECIO", cpfMascarado: "***.712.940-**", cargo: "Gerente Geral" },
    ],
  },

  // 19. CLÍNICA RADIOLÓGICA E DIAGNÓSTICO POR IMAGEM TANGARÁ
  {
    id: "emp-019",
    cnpj: "08192844000122",
    cnpjFormatado: "08.192.844/0001-22",
    razaoSocial: "CENTRO DE DIAGNOSTICO POR IMAGEM DO VALE LTDA",
    nomeFantasia: "CLÍNICA RADIOLÓGICA TANGARÁ (TOMOGRAFIA E RESSONÂNCIA)",
    cnaePrincipal: "8640-2/05",
    descricaoCnae: "Serviços de diagnóstico por imagem com radiação ionizante, exceto tomografia e ressonância",
    porte: "EPP",
    capitalSocial: 4500000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Centro",
    scoreAfinidadeBancaria: 96,
    produtosRecomendados: ["Leasing de Equipamentos Médicos de Alta Resolução", "Antecipação de Faturamento de Convênios", "Cartão PJ Saúde"],
    limiteCapitalGiroSugerido: 2500000,
    sociosAdministradores: [
      { nome: "DR. CARLOS EDUARDO MENDONÇA", cpfMascarado: "***.009.049-**", cargo: "Sócio Diretor Médico" },
      { nome: "DRA. BEATRIZ COUTINHO SALLES", cpfMascarado: "***.010.082-**", cargo: "Sócia Médica Radiologista" },
    ],
  },

  // 20. CARTÓRIO DO 1º OFÍCIO DE REGISTRO DE IMÓVEIS DE TANGARÁ DA SERRA
  {
    id: "emp-020",
    cnpj: "04918204000111",
    cnpjFormatado: "04.918.204/0001-11",
    razaoSocial: "CARTORIO DO PRIMEIRO OFICIO DE TANGARA DA SERRA",
    nomeFantasia: "1º OFÍCIO NOTARIAL E REGISTRAL DE IMÓVEIS",
    cnaePrincipal: "6912-5/00",
    descricaoCnae: "Cartórios notariais e de registro de títulos e documentos",
    porte: "DEMAIS",
    capitalSocial: 1200000,
    municipio: "Tangará da Serra",
    uf: "MT",
    bairro: "Centro",
    scoreAfinidadeBancaria: 95,
    produtosRecomendados: ["Integração de Emolumentos via PIX Automático", "Conta de Arrecadação Custodiada", "Certificação Digital"],
    limiteCapitalGiroSugerido: 800000,
    sociosAdministradores: [
      { nome: "TABELIÃO TITULAR 1º OFÍCIO", cpfMascarado: "***.291.840-**", cargo: "Oficial Delegatário Registrador" },
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
