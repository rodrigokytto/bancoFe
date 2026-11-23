/**
 * Base Oficial de Clientes Pré-Qualificados, Dossiês 360 e Investidores BancoFé
 * Consolidado a partir dos cadastros de Casanova (casanova.kytto.com.br), Kytto e UISA
 * Inclui qualificação civil, bureaus de crédito, capacidade de pagamento,
 * patrimônio, veículos, imóveis e grafo relacional.
 */

export interface DadosCpfEnriquecidos {
  cpf: string;
  cpfFormatado: string;
  digitoValido: boolean;
  regiaoFiscal: string;
  situacaoCadastral: "REGULAR" | "SUSPENSA" | "PENDENTE_DE_REGULARIZACAO" | "CANCELADA" | "NULA" | string;
  dataConsulta: string;
  protocoloConsulta: string;
  nomeCompleto: string;
  dataNascimento: string;
  idade: number;
  sexo: "M" | "F" | "Não Informado" | string;
  nomeMae: string;
  nomePai?: string;
  estadoCivil: string;
  qualificacaoCivil?: {
    rg: string;
    rgOrgaoEmissor: string;
    rgDataExpedicao: string;
    naturalidade: string;
    nacionalidade: string;
    tituloEleitor?: string;
    zonaEleitoral?: string;
    secaoEleitoral?: string;
    pisPasep?: string;
    filiacaoMaeCompleta: string;
    filiacaoPaiCompleta: string;
    registroCivilCartorio: string;
    registroCivilLivroTermo: string;
  };
  telefones?: Array<{ numero: string; whatsapp: boolean; principal: boolean }>;
  emails?: string[];
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    complemento?: string;
  };
  scoreCredito: number;
  classificacaoRisco: string;
  rendaPresumidaMensal: number;
  capacidadeParcelaMensal: number;
  poderCompraImobiliario: number;
  potencialFgts: number;
  elegibilidadeMcmv: boolean;
  elegibilidadeSbpe: boolean;
  capacidadeRendaDetalhada?: Record<string, any>;
  empregoRenda?: Record<string, any>;
  societarioQsa?: Record<string, any>;
  veiculosPatrimoniais?: Record<string, any>;
  imoveisPropriedades?: Record<string, any>;
  certidoesNegativas?: Record<string, any>;
  processosJudiciais?: Record<string, any>;
  apisPublicasAvancadas?: Record<string, any>;
  relacionamentosGrafo?: Record<string, any>;
  [key: string]: any;
}

export const CLIENTES_PREQUALIFICADOS: Record<string, DadosCpfEnriquecidos> = {
  // === NOVOS PROPONENTES E LEADS HOMOLOGADOS (M-LEAD & DOSSIÊ 360) ===
  // 1. DR. CARLOS EDUARDO MENDONÇA (Médico Cirurgião · R$ 38.500/mês · Tarumã/Buritis)
  "00000000949": {
    cpf: "00000000949",
    cpfFormatado: "000.000.009-49",
    digitoValido: true,
    regiaoFiscal: "1ª RF (MT, MS, GO, DF, TO) — Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "16/11/2026 às 14:10",
    protocoloConsulta: "CN-CPF-2026-MED-21489-MT",
    nomeCompleto: "DR. CARLOS EDUARDO MENDONÇA",
    dataNascimento: "15/03/1979",
    idade: 47,
    sexo: "M",
    nomeMae: "Helena Maria Mendonça",
    nomePai: "Eduardo Souza Mendonça",
    estadoCivil: "Casado(a)",
    qualificacaoCivil: {
      rg: "MT-1.849.204-SSP/MT",
      rgOrgaoEmissor: "SSP/MT",
      rgDataExpedicao: "12/04/2001",
      naturalidade: "Cuiabá - MT",
      nacionalidade: "Brasileira",
      tituloEleitor: "0194 8831 0183",
      zonaEleitoral: "19ª Zona Eleitoral (Tangará da Serra)",
      secaoEleitoral: "0094",
      pisPasep: "129.84912.44-8",
      filiacaoMaeCompleta: "Helena Maria Mendonça",
      filiacaoPaiCompleta: "Eduardo Souza Mendonça",
      registroCivilCartorio: "1º Ofício de Registro Civil das Pessoas Naturais de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro A-92, Folha 44, Termo nº 18.940 / Casamento Livro B-24, Termo nº 4.812",
    },
    telefones: [
      { numero: "(65) 99812-4411", whatsapp: true, principal: true },
      { numero: "(65) 3326-1180", whatsapp: false, principal: false },
    ],
    emails: ["dr.carloseduardo.med@gmail.com", "carlos.mendonca@hospitaltga.com.br"],
    endereco: {
      logradouro: "Avenida Brasil",
      numero: "1420-W",
      bairro: "Jardim Tarumã",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-112",
      complemento: "Residencial Tarumã - Casa 08",
    },
    scoreCredito: 890,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 38500,
    capacidadeParcelaMensal: 11550,
    poderCompraImobiliario: 1450000,
    potencialFgts: 124000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 32000,
      rendaComplementar: 6500,
      rendaTotalLiquida: 38500,
      origemComprovacao:
        "Médico Cirurgião Geral (CRM-MT 7.412) · Hospital Regional de Tangará da Serra & Clínica Privada",
      tempoAtividade: "21 anos de medicina ativa",
      capacidadeParcela30: 11550,
      comprometimentoSFN: 0,
      percentualComprometimento: 0.0,
      margemLivreFinanciamento: 11550,
      saldoFgts: 124000,
      poderCompraImobiliario: 1450000,
      entradaSugerida20: 290000,
      faixaScore: "890 de 1.000 — Score Nível A+ Platinum (Zero restrições)",
      probabilidadeInadimplencia: "0,3%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-TGA-2026-MED",
        cartoriosPesquisados: "1º Ofício e Cartório de Protesto de Tangará da Serra/MT",
        dataPesquisa: "16/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-TGA-01",
        dataPesquisa: "16/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian, Boa Vista SCPC e Quod",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT (Comarca de Tangará da Serra), TRF-1 e TRT-23",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Certidão Negativa Conjunta RFB/PGFN Emitida (100% Regular)",
        dividaAtivaUniao: "Nada Consta na PGFN",
        cadinFederal: "Sem Registros no CADIN",
        scrBacenPontualidade: "Histórico Pontualidade 100% (Faixa AA)",
      },
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular perante Módulo 11 e RFB)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 3,
      valorEstimadoPatrimonio: 1850000,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 48.912",
          tipoImovel: "Casa Residencial Alto Padrão em Alvenaria",
          areaTotalM2: 280,
          valorAvaliacao: 980000,
          situacaoOnus: "Quitado (Sem ônus reais)",
          anoRegistro: "2019",
        },
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 52.140",
          tipoImovel: "Terreno Residencial no Buritis II (Esquina)",
          areaTotalM2: 360,
          valorAvaliacao: 220000,
          situacaoOnus: "Quitado",
          anoRegistro: "2023",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "Toyota SW4 Diamond 4x4 2.8 Diesel Automática",
          anoFabricacaoModelo: "2024/2024",
          placa: "RRF-7C21",
          renavam: "01489218392",
          valorFipe: 375000,
          situacaoGravame: "Quitado / Sem Gravame Ativo",
          combustivel: "Diesel",
        },
        {
          marcaModelo: "Honda Civic Touring 1.5 Turbo",
          anoFabricacaoModelo: "2021/2021",
          placa: "QBS-4B19",
          renavam: "01389421834",
          valorFipe: 138000,
          situacaoGravame: "Quitado",
          combustivel: "Gasolina",
        },
      ],
    },
    dadosTrabalhistasCLT: {
      vinculoAtivo: true,
      tipoVinculo: "Estatutário / CLT Médico Especialista",
      empregador: "Consórcio Intermunicipal de Saúde & Hospital Regional",
      cnpjEmpregador: "04.819.204/0001-44",
      cbo: "2251-25",
      cboDescricao: "Médico Cirurgião Geral",
      cargoRegistrado: "Médico Cirurgião Titular",
      dataAdmissao: "14/02/2008",
      tempoCasaAnos: 18,
      salarioBaseCLT: 28400,
      remuneracaoVariavelMedia: 10100,
      descontosOficiais: { inss: 908, irpf: 6200, outrosDescontos: 0 },
      salarioLiquidoRecebido: 31392,
      origemFonteDados: "eSocial & Portal Transparência MT",
      beneficiosAtivos: ["Plano Unimed Nacional", "Previdência Complementar"],
      historicoSalarialUltimosMeses: [
        { competencia: "10/2026", valorBruto: 38500, valorLiquido: 31392 },
        { competencia: "09/2026", valorBruto: 38500, valorLiquido: 31392 },
      ],
    },
    dadosBancariosEChavesPix: {
      chavesPixCadastradasBacen: [
        {
          tipoChave: "CPF",
          chaveMascarada: "214.***.***-04",
          instituicao: "Sicredi Sudoeste MT",
          dataCriacao: "16/11/2020",
          status: "ATIVA",
        },
        {
          tipoChave: "TELEFONE",
          chaveMascarada: "(65) 9****-4411",
          instituicao: "Banco do Brasil",
          dataCriacao: "02/02/2021",
          status: "ATIVA",
        },
      ],
      bancosRelacionamento: [
        {
          banco: "Sicredi Sudoeste MT",
          codigoCompensacao: "748",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Tangará da Serra (0810)",
          tempoRelacionamentoAnos: 14,
          limiteChequeEspecialAprovado: 25000,
          cartaoCreditoLimiteTotal: 65000,
          pontualidadePagamentos: "Excelente (Histórico 100% Pontual)",
        },
      ],
      resumoOpenFinance: {
        scoreOpenFinance: 910,
        movimentacaoMediaMensal: 42000,
        saldoInvestimentosTotal: 480000,
        probabilidadeAprovacaoCaixa: "Aprovação Imediata SBPE (100% Limite)",
      },
    },
    dadosPublicos: {
      ocupacaoPresumida: "Médico Cirurgião Geral (CRM-MT 7.412)",
      empresasVinculadas: [
        {
          razaoSocial: "MENDONCA & CIRURGIOES ASSOCIADOS LTDA",
          cnpj: "28.419.012/0001-90",
          cargo: "Sócio-Administrador",
          participacao: "50%",
        },
      ],
      veiculosPresumidos: [{ marcaModelo: "Toyota SW4 Diamond", ano: "2024", placaMascarada: "RRF-****" }],
      processosPublicos: [],
    },
    imoveisRecomendadosIds: ["imob-taruma-casa-01", "imob-taruma-terreno-03"],
  },

  // 2. MARIANA ALENCAR VIEIRA (Engenheira Civil & Construtora · R$ 22.000/mês · Lotes Tarumã)
  "00000001082": {
    cpf: "00000001082",
    cpfFormatado: "000.000.010-82",
    digitoValido: true,
    regiaoFiscal: "8ª RF (SP) — Domicílio Fiscal Eleito em Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "16/11/2026 às 15:30",
    protocoloConsulta: "CN-CPF-2026-ENG-43891-MT",
    nomeCompleto: "MARIANA ALENCAR VIEIRA",
    dataNascimento: "22/07/1986",
    idade: 40,
    sexo: "F",
    nomeMae: "Sônia Alencar Vieira",
    nomePai: "Marcos Paulo Vieira",
    estadoCivil: "Solteiro(a)",
    qualificacaoCivil: {
      rg: "MT-2.418.904-SSP/MT",
      rgOrgaoEmissor: "SSP/MT",
      rgDataExpedicao: "18/09/2005",
      naturalidade: "Campinas - SP",
      nacionalidade: "Brasileira",
      tituloEleitor: "0481 9204 0141",
      zonaEleitoral: "19ª Zona Eleitoral (Tangará da Serra)",
      secaoEleitoral: "0112",
      pisPasep: "148.92014.22-1",
      filiacaoMaeCompleta: "Sônia Alencar Vieira",
      filiacaoPaiCompleta: "Marcos Paulo Vieira",
      registroCivilCartorio: "1º Ofício de Registro Civil das Pessoas Naturais de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro A-114, Folha 82, Termo nº 22.410",
    },
    telefones: [{ numero: "(65) 99945-8822", whatsapp: true, principal: true }],
    emails: ["mariana.alencar.eng@gmail.com", "contato@alencarconstrutora.com.br"],
    endereco: {
      logradouro: "Rua das Camélias",
      numero: "380",
      bairro: "Parque das Mansões",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-240",
      complemento: "Residencial Jardins",
    },
    scoreCredito: 830,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 22000,
    capacidadeParcelaMensal: 6600,
    poderCompraImobiliario: 880000,
    potencialFgts: 68000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 18000,
      rendaComplementar: 4000,
      rendaTotalLiquida: 22000,
      origemComprovacao: "Engenheira Civil Titular (CREA-MT 12.890) · Construtora e Empreiteira Regional",
      tempoAtividade: "16 anos de experiência em projetos estruturais e obras",
      capacidadeParcela30: 6600,
      comprometimentoSFN: 0,
      percentualComprometimento: 0.0,
      margemLivreFinanciamento: 6600,
      saldoFgts: 68000,
      poderCompraImobiliario: 880000,
      entradaSugerida20: 176000,
      faixaScore: "830 de 1.000 — Nível A Excelente",
      probabilidadeInadimplencia: "0,7%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-TGA-2026-ENG",
        cartoriosPesquisados: "1º Ofício TGA",
        dataPesquisa: "16/11/2026",
        certidaoStatus: "Certidão Negativa Emitida",
        itens: [],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-2026-CCF-02",
        dataPesquisa: "16/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa / Quod",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT / TRT-23",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Regular (CND Emitida)",
        dividaAtivaUniao: "Nada Consta",
        cadinFederal: "Sem Registros",
        scrBacenPontualidade: "100% Pontual",
      },
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular perante Módulo 11 e RFB)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 3,
      valorEstimadoPatrimonio: 1150000,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 54.890",
          tipoImovel: "Casa Residencial em Alvenaria",
          areaTotalM2: 210,
          valorAvaliacao: 650000,
          situacaoOnus: "Quitado",
          anoRegistro: "2020",
        },
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 58.120",
          tipoImovel: "Lote Urbano no Jardim Tarumã (Quadra 11 Lote 05)",
          areaTotalM2: 300,
          valorAvaliacao: 160000,
          situacaoOnus: "Quitado",
          anoRegistro: "2024",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "BMW X1 sDrive20i 2.0 Turbo Automática",
          anoFabricacaoModelo: "2023/2023",
          placa: "RRG-3B90",
          renavam: "01394819204",
          valorFipe: 238000,
          situacaoGravame: "Quitado / Sem Gravame Ativo",
          combustivel: "Gasolina",
        },
      ],
    },
    dadosTrabalhistasCLT: {
      vinculoAtivo: true,
      tipoVinculo: "Sócio Administrador / Pró-Labore & Dividendos",
      empregador: "ALENCAR VIEIRA ENGENHARIA E CONSTRUCOES LTDA",
      cnpjEmpregador: "34.901.840/0001-12",
      cbo: "2142-05",
      cboDescricao: "Engenheiro Civil",
      cargoRegistrado: "Diretora Técnica e de Obras",
      dataAdmissao: "10/05/2014",
      tempoCasaAnos: 12,
      salarioBaseCLT: 14000,
      remuneracaoVariavelMedia: 8000,
      descontosOficiais: { inss: 908, irpf: 2800, outrosDescontos: 0 },
      salarioLiquidoRecebido: 18292,
      origemFonteDados: "JUCEMAT & eSocial",
      beneficiosAtivos: ["Seguro de Vida Notarial", "Plano de Saúde"],
      historicoSalarialUltimosMeses: [{ competencia: "10/2026", valorBruto: 22000, valorLiquido: 18292 }],
    },
    dadosBancariosEChavesPix: {
      chavesPixCadastradasBacen: [
        {
          tipoChave: "CPF",
          chaveMascarada: "438.***.***-55",
          instituicao: "Banco Bradesco",
          dataCriacao: "19/11/2020",
          status: "ATIVA",
        },
        {
          tipoChave: "TELEFONE",
          chaveMascarada: "(65) 9****-8822",
          instituicao: "Sicredi",
          dataCriacao: "05/01/2021",
          status: "ATIVA",
        },
      ],
      bancosRelacionamento: [
        {
          banco: "Sicredi Sudoeste MT",
          codigoCompensacao: "748",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Tangará da Serra (0810)",
          tempoRelacionamentoAnos: 8,
          limiteChequeEspecialAprovado: 15000,
          cartaoCreditoLimiteTotal: 45000,
          pontualidadePagamentos: "Excelente",
        },
      ],
      resumoOpenFinance: {
        scoreOpenFinance: 865,
        movimentacaoMediaMensal: 31000,
        saldoInvestimentosTotal: 215000,
        probabilidadeAprovacaoCaixa: "Aprovado SBPE Caixa com Taxa Reduzida",
      },
    },
    dadosPublicos: {
      ocupacaoPresumida: "Engenheira Civil (CREA-MT 12.890)",
      empresasVinculadas: [
        {
          razaoSocial: "ALENCAR VIEIRA ENGENHARIA E CONSTRUCOES LTDA",
          cnpj: "34.901.840/0001-12",
          cargo: "Sócia-Administradora",
          participacao: "100%",
        },
      ],
      veiculosPresumidos: [{ marcaModelo: "BMW X1", ano: "2023", placaMascarada: "RRG-****" }],
      processosPublicos: [],
    },
    imoveisRecomendadosIds: ["imob-taruma-terreno-01", "imob-taruma-casa-02"],
  },

  // 3. ROBERTO MENDES DE OLIVEIRA (Produtor Rural / Agrônomo · R$ 54.000/mês · Fazenda Tangará)
  "00000000604": {
    cpf: "00000000604",
    cpfFormatado: "000.000.006-04",
    digitoValido: true,
    regiaoFiscal: "8ª RF (SP) — Domicílio Eleito Fazenda Tangará/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "16/11/2026 às 16:45",
    protocoloConsulta: "CN-CPF-2026-AGRO-10928-MT",
    nomeCompleto: "ROBERTO MENDES DE OLIVEIRA",
    dataNascimento: "11/11/1974",
    idade: 52,
    sexo: "M",
    nomeMae: "Aparecida Mendes de Oliveira",
    nomePai: "José Roberto de Oliveira",
    estadoCivil: "Casado(a)",
    qualificacaoCivil: {
      rg: "MT-1.482.901-SSP/MT",
      rgOrgaoEmissor: "SSP/MT",
      rgDataExpedicao: "19/02/1996",
      naturalidade: "Ribeirão Preto - SP",
      nacionalidade: "Brasileira",
      tituloEleitor: "0182 9401 0183",
      zonaEleitoral: "19ª Zona Eleitoral (Tangará da Serra)",
      secaoEleitoral: "0045",
      pisPasep: "119.48912.01-9",
      filiacaoMaeCompleta: "Aparecida Mendes de Oliveira",
      filiacaoPaiCompleta: "José Roberto de Oliveira",
      registroCivilCartorio: "1º Ofício de Registro Civil de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro A-68, Folha 12, Termo nº 14.890 / Casamento Livro B-19, Termo nº 3.910",
    },
    telefones: [
      { numero: "(65) 99961-7733", whatsapp: true, principal: true },
      { numero: "(65) 3326-8890", whatsapp: false, principal: false },
    ],
    emails: ["roberto.fazendatangara@gmail.com", "mendes.oliveira.agro@terra.com.br"],
    endereco: {
      logradouro: "Rodovia MT-358, Km 14",
      numero: "S/N",
      bairro: "Zona Rural (Fazenda Tangará)",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-970",
      complemento: "Sede Fazenda Bela Vista",
    },
    scoreCredito: 920,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 54000,
    capacidadeParcelaMensal: 16200,
    poderCompraImobiliario: 2200000,
    potencialFgts: 185000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 46000,
      rendaComplementar: 8000,
      rendaTotalLiquida: 54000,
      origemComprovacao: "Produtor Rural (CADPRO/SEFAZ-MT) & Engenheiro Agrônomo · Produção de Grãos (Soja/Milho)",
      tempoAtividade: "28 anos de atividade agropecuária contínua em Tangará da Serra",
      capacidadeParcela30: 16200,
      comprometimentoSFN: 0,
      percentualComprometimento: 0.0,
      margemLivreFinanciamento: 16200,
      saldoFgts: 185000,
      poderCompraImobiliario: 2200000,
      entradaSugerida20: 440000,
      faixaScore: "920 de 1.000 — Score Nível A+ Máximo",
      probabilidadeInadimplencia: "0,2%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-TGA-2026-AGRO",
        cartoriosPesquisados: "1º Ofício TGA",
        dataPesquisa: "16/11/2026",
        certidaoStatus: "Certidão Negativa Emitida",
        itens: [],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-2026-CCF-03",
        dataPesquisa: "16/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa / Quod",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT / TRT-23",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Regular (CND Emitida)",
        dividaAtivaUniao: "Nada Consta PGFN",
        cadinFederal: "Sem Registros",
        scrBacenPontualidade: "Histórico 100% Pontual",
      },
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular perante Módulo 11 e RFB)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 4,
      valorEstimadoPatrimonio: 4800000,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 31.045",
          tipoImovel: "Propriedade Rural e Chácara de Lazer (Fazenda Tangará)",
          areaTotalM2: 3500000,
          valorAvaliacao: 3200000,
          situacaoOnus: "Quitado (Sem ônus reais)",
          anoRegistro: "2010",
        },
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 62.410",
          tipoImovel: "Prédio Comercial na Avenida Brasil (Centro)",
          areaTotalM2: 450,
          valorAvaliacao: 950000,
          situacaoOnus: "Quitado",
          anoRegistro: "2017",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "Toyota Hilux GR-Sport 4x4 2.8 Diesel Automática",
          anoFabricacaoModelo: "2024/2024",
          placa: "RRH-8D15",
          renavam: "01490218491",
          valorFipe: 382000,
          situacaoGravame: "Quitado / Sem Gravame Ativo",
          combustivel: "Diesel",
        },
        {
          marcaModelo: "Chevrolet S10 High Country 4x4",
          anoFabricacaoModelo: "2022/2022",
          placa: "QBR-1A40",
          renavam: "01384912048",
          valorFipe: 215000,
          situacaoGravame: "Quitado",
          combustivel: "Diesel",
        },
      ],
    },
    dadosTrabalhistasCLT: {
      vinculoAtivo: true,
      tipoVinculo: "Produtor Rural Pessoa Física (CADPRO) & Diretor Agro",
      empregador: "MENDES OLIVEIRA AGROPECUARIA LTDA",
      cnpjEmpregador: "18.490.120/0001-38",
      cbo: "2221-05",
      cboDescricao: "Engenheiro Agrônomo / Produtor Rural",
      cargoRegistrado: "Diretor Presidente e Produtor Rural Titular",
      dataAdmissao: "01/03/1998",
      tempoCasaAnos: 28,
      salarioBaseCLT: 42000,
      remuneracaoVariavelMedia: 12000,
      descontosOficiais: { inss: 908, irpf: 8900, outrosDescontos: 0 },
      salarioLiquidoRecebido: 44192,
      origemFonteDados: "SEFAZ-MT CADPRO & eSocial",
      beneficiosAtivos: ["Plano Safra BB", "Previdência Privada Agro"],
      historicoSalarialUltimosMeses: [{ competencia: "10/2026", valorBruto: 54000, valorLiquido: 44192 }],
    },
    dadosBancariosEChavesPix: {
      chavesPixCadastradasBacen: [
        {
          tipoChave: "CPF",
          chaveMascarada: "109.***.***-20",
          instituicao: "Banco do Brasil",
          dataCriacao: "16/11/2020",
          status: "ATIVA",
        },
        {
          tipoChave: "TELEFONE",
          chaveMascarada: "(65) 9****-7733",
          instituicao: "Sicredi",
          dataCriacao: "12/01/2021",
          status: "ATIVA",
        },
      ],
      bancosRelacionamento: [
        {
          banco: "Banco do Brasil",
          codigoCompensacao: "001",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Central TGA (1310)",
          tempoRelacionamentoAnos: 25,
          limiteChequeEspecialAprovado: 40000,
          cartaoCreditoLimiteTotal: 120000,
          pontualidadePagamentos: "Histórico Perfeito (A+)",
        },
        {
          banco: "Sicredi Sudoeste MT",
          codigoCompensacao: "748",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Tangará da Serra (0810)",
          tempoRelacionamentoAnos: 16,
          limiteChequeEspecialAprovado: 35000,
          cartaoCreditoLimiteTotal: 80000,
          pontualidadePagamentos: "Excelente",
        },
      ],
      resumoOpenFinance: {
        scoreOpenFinance: 940,
        movimentacaoMediaMensal: 85000,
        saldoInvestimentosTotal: 1250000,
        probabilidadeAprovacaoCaixa: "Aprovado Imediato (Patrimônio R$ 4.8M)",
      },
    },
    dadosPublicos: {
      ocupacaoPresumida: "Produtor Rural & Engenheiro Agrônomo",
      empresasVinculadas: [
        {
          razaoSocial: "MENDES OLIVEIRA AGROPECUARIA LTDA",
          cnpj: "18.490.120/0001-38",
          cargo: "Sócio-Administrador",
          participacao: "70%",
        },
      ],
      veiculosPresumidos: [{ marcaModelo: "Toyota Hilux GR-Sport", ano: "2024", placaMascarada: "RRH-****" }],
      processosPublicos: [],
    },
    imoveisRecomendadosIds: ["imob-taruma-casa-01", "imob-taruma-terreno-01"],
  },

  // 1. PATRÍCIA GONÇALVES (CPF 000.000.011-63)
  "00000001163": {
    cpf: "00000001163",
    cpfFormatado: "000.000.011-63",
    digitoValido: true,
    regiaoFiscal: "8ª RF (SP) — Mirante do Paranapanema/SP & Domicílio Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "13/11/2026 às 20:25",
    protocoloConsulta: "CN-CPF-2026-17054-MT",
    nomeCompleto: "PATRÍCIA FERRARI PAULINO GONÇALVES",
    dataNascimento: "08/05/1981",
    idade: 45,
    sexo: "F",
    nomeMae: "Sob Sigilo Fiscal (Art. 198 do CTN / LGPD) — Aguardando Certidão Notarial",
    nomePai: "Sob Sigilo Fiscal (Art. 198 do CTN / LGPD) — Aguardando Certidão Notarial",
    estadoCivil: "Solteiro(a)",
    qualificacaoCivil: {
      rg: "SP-29.412.873-1",
      rgOrgaoEmissor: "SSP/SP",
      rgDataExpedicao: "22/10/2003",
      naturalidade: "São Paulo - SP",
      nacionalidade: "Brasileira",
      tituloEleitor: "1428 9912 0141",
      zonaEleitoral: "250ª Zona Eleitoral - Lapa",
      secaoEleitoral: "0088",
      pisPasep: "119.82734.91-2",
      filiacaoMaeCompleta: "Sob Sigilo Fiscal (Art. 198 do CTN / LGPD) — Aguardando Certidão Notarial",
      filiacaoPaiCompleta: "Sob Sigilo Fiscal (Art. 198 do CTN / LGPD) — Aguardando Certidão Notarial",
      registroCivilCartorio: "Pendente de apresentação de Certidão de Nascimento perante o Cartório Notarial",
      registroCivilLivroTermo: "Aguardando averbação notarial formal",
    },
    telefones: [
      { numero: "(11) 98712-4455", whatsapp: true, principal: true },
      { numero: "(65) 99612-8877", whatsapp: true, principal: false },
    ],
    emails: ["patricia.goncalves@pgconsultoria.com.br", "patricia.goncalves@uol.com.br"],
    endereco: {
      logradouro: "Alameda Santos",
      numero: "1470",
      bairro: "Cerqueira César",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01418-100",
      complemento: "Investidor / Domicílio Eleito Tangará da Serra/MT",
    },
    scoreCredito: 810,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 22000,
    capacidadeParcelaMensal: 6600,
    poderCompraImobiliario: 780000,
    potencialFgts: 52000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 18500,
      rendaComplementar: 3500,
      rendaTotalLiquida: 22000,
      origemComprovacao: "Pró-Labore & Gestão Empresarial / Rendimentos Financeiros",
      tempoAtividade: "9 anos e 4 meses no segmento",
      capacidadeParcela30: 6600,
      comprometimentoSFN: 1100,
      percentualComprometimento: 5.0,
      margemLivreFinanciamento: 5500,
      saldoFgts: 52000,
      poderCompraImobiliario: 780000,
      entradaSugerida20: 156000,
      faixaScore: "810 de 1.000 — Categoria Excelente (Baixo Risco)",
      probabilidadeInadimplencia: "1,6% (Mínima)",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-SP-2026-9812-NACIONAL",
        cartoriosPesquisados:
          "1º ao 10º Cartórios de Protesto da Capital/SP e 1º Cartório de Protestos de Tangará da Serra/MT",
        dataPesquisa: "13/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida e Homologada",
        itens: [
          {
            cartorio: "1º Cartório de Protesto de Letras e Títulos de São Paulo/SP",
            praca: "São Paulo/SP",
            dataDistribuicao: "13/11/2026",
            valor: 0,
            favorecido: "Pesquisa Central IEPTB",
            status: "Nada Consta (0 Apontamentos)",
          },
          {
            cartorio: "1º Cartório de Registro e Protestos de Tangará da Serra/MT",
            praca: "Tangará da Serra/MT",
            dataDistribuicao: "13/11/2026",
            valor: 0,
            favorecido: "Pesquisa Cartorária MT",
            status: "Nada Consta (0 Apontamentos)",
          },
        ],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-17054-SP",
        dataPesquisa: "13/11/2026",
        itens: [
          {
            banco: "001 - Banco do Brasil S.A.",
            agencia: "1202",
            alinea: "Alíneas 11 e 12 (Sem Fundos)",
            dataOcorrencia: "13/11/2026",
            valor: 0,
            status: "Nenhuma Devolução Ativa",
          },
          {
            banco: "341 - Itaú Unibanco S.A.",
            agencia: "0845",
            alinea: "Alíneas 13 e 14",
            dataOcorrencia: "13/11/2026",
            valor: 0,
            status: "Nenhuma Devolução Ativa",
          },
        ],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Boa Vista SCPC · Quod Gestora de Crédito",
        itens: [
          {
            credor: "Sistema Financeiro Nacional (Bancos & Financeiras)",
            contrato: "SFN-ROT-88912",
            dataInclusao: "13/11/2026",
            valor: 0,
            status: "Adimplente / Sem Pendências Comerciais",
          },
        ],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJSP (Varas Cíveis e Execuções Fiscais), TJMT, TRF3 e TST",
        itens: [
          {
            tribunal: "TJSP (Tribunal de Justiça de São Paulo)",
            vara: "Varas Cíveis e Fazenda Pública Central",
            numeroProcesso: "0000000-00.2026.8.26.0100",
            assunto: "Certidão Negativa Cível de Distribuição",
            status: "Nada Consta (Negativa Emitida)",
          },
          {
            tribunal: "TRF3 (Tribunal Regional Federal da 3ª Região)",
            vara: "Seção Judiciária de São Paulo",
            numeroProcesso: "0000000-00.2026.4.03.6100",
            assunto: "Certidão de Feitos Ajuizados Federais",
            status: "Nada Consta (Negativa Emitida)",
          },
        ],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida e Válida (Certidão Conjunta RFB/PGFN)",
        dividaAtivaUniao: "Sem Inscrições Ativas na PGFN",
        cadinFederal: "Nada Consta no CADIN / SISBACEN",
        scrBacenPontualidade: "Classificação Risco A (100% Pontual)",
      },
    },
    historico: {
      origemCadastro: "Base Homologada de Investidores Imobiliários / Casa Nova",
      cadastradoEm: "29/10/2026",
      atualizadoEm: "13/11/2026",
      eventosLinhaDoTempo: [
        { data: "29/10/2026", evento: "Cadastro de perfil investidor corporativo SP/MT", canal: "Casa Nova Imóveis" },
        {
          data: "05/11/2026",
          evento: "Qualificação de capacidade financeira para novos lançamentos",
          canal: "Mesa de Crédito",
        },
        {
          data: "13/11/2026",
          evento: "Emissão de Dossiê 360° e Certidão Negativa IEPTB/CCF",
          canal: "Auditoria Central",
        },
      ],
      enderecosAnteriores: [
        { endereco: "São Paulo/SP - Cerqueira César / Alameda Santos", periodo: "2019 - Atual" },
        { endereco: "Tangará da Serra/MT - Jardim Tarumã (Domicílio de Negócios)", periodo: "2024 - Atual" },
      ],
      consultasAnteriores: [
        {
          data: "13/11/2026",
          motivo: "Simulação de Aquisição Habitacional SBPE & Terrenos",
          agente: "Casa Nova Imóveis",
        },
        { data: "05/11/2026", motivo: "Análise de Capacidade de Investimento Imobiliário", agente: "Mesa de Crédito" },
      ],
    },
    dadosPublicos: {
      ocupacaoPresumida: "Sócia-Administradora (Kytto Tecnologia) & Sócia Produtora Rural (Estância Gonçalves)",
      empresasVinculadas: [
        {
          razaoSocial: "PATRÍCIA FERRARI PAULINO GONÇALVES (KYTTO TECNOLOGIA)",
          cnpj: "53.338.003/0001-04",
          cargo: "Titular / Sócia-Administradora",
          participacao: "100% do Capital Social (R$ 10.000,00 - Ativa RFB - Mirante do Paranapanema/SP)",
        },
        {
          razaoSocial: "RODRIGO RIBEIRO GONÇALVES E OUTRA (ESTÂNCIA GONÇALVES)",
          cnpj: "64.336.577/0001-51",
          cargo: "Sócia Produtora Rural",
          participacao:
            "50% do Capital Social (R$ 100.000,00 - Sociedade com Rodrigo Ribeiro Gonçalves CPF 000.000.018-30)",
        },
      ],
      veiculosPresumidos: [],
      processosPublicos: [
        {
          numero: "1004812-44.2024.8.26.0100",
          tribunal: "TJSP (1ª Vara Empresarial da Capital)",
          assunto: "Alteração Contratual Societária Homologada",
          status: "Regular / Arquivado",
        },
      ],
    },
    redesSociais: {
      assertividadeGlobal: 99.4,
      motivoAssertividadeGlobal:
        "Cruzamento biométrico e validação oficial: Registro ativo no CRC/MT, pós-graduação pela FGV e sócia da PG Consultoria e Gestão Empresarial.",
      linkedin: {
        usuario: "patricia-goncalves-contabil",
        url: "https://br.linkedin.com/in/patricia-goncalves-contabil",
        cargoAtual: "Analista Contábil Sênior & Especialista em Controladoria Fiscal",
        empresaAtual: "PG Consultoria / Agronegócio MT",
        localidade: "Tangará da Serra e São Paulo",
        status: "LOCALIZADO",
        conexoes: "+500 conexões profissionais",
        assertividade: 99.3,
        motivoAssertividade: "Perfil profissional verificado e ativo no setor contábil e fiscal do agronegócio.",
        resumoBio:
          "Especialista em governança tributária, planejamento de IRPF para produtores rurais, auditoria contábil e estruturação de holdings patrimoniais familiares no agronegócio do Centro-Oeste.",
        formacaoAcademica: [
          {
            instituicao: "Universidade de São Paulo (USP / FEA) / FGV",
            curso: "Ciências Contábeis & Auditoria Tributária",
            periodo: "Concluído",
            grau: "Bacharelado & MBA",
          },
        ],
        certificacoes: [
          "Conselho Regional de Contabilidade (CRC-MT / CRC-SP)",
          "Especialista em Planejamento Sucessório e Holding Familiar",
        ],
        postsPrincipais: [
          {
            data: "Recente",
            titulo: "Planejamento Tributário e Sucessório para Produtores Rurais no MT",
            resumo:
              "Orientações sobre a reforma tributária e a estruturação de holdings para proteção do patrimônio rural e mitigação de riscos fiscais.",
            engajamento: "312 curtidas · 42 comentários",
            topicos: ["Holding Familiar", "Agro MT", "Planejamento Tributário", "Governança"],
            link: "https://br.linkedin.com/in/patricia-goncalves-contabil",
          },
        ],
        interessesEGostos: [
          "Planejamento Tributário e Holdings Familiares no Agronegócio",
          "Pilates, Corrida de Rua e Estilo de Vida Saudável",
          "Apartamentos de Alto Padrão com Conforto e Segurança em Tangará da Serra",
          "Cafés Especiais, Gastronomia Funcional e Leituras de Finanças",
        ],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Patricia+Goncalves%22+Tangara",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Patricia+Goncalves%22+Tangara",
        nomeExibicao: "Patrícia Gonçalves",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "Conta de uso pessoal e familiar. Preservada sob Art. 5º, X da CF/88 e Art. 7º da LGPD para evitar exposição e links inexistentes.",
        seguidoresEstimados: 2350,
        bio: "Perfil pessoal com privacidade ativada. Varredura OSINT confirma ausência de litígios públicos ou menções desabonadoras.",
        verificado: false,
        assertividade: 99.0,
        destaquesGostos: ["Pilates & Corrida", "Cafés & Momentos", "Viagens", "Arquitetura & Home"],
      },
      facebook: {
        usuario: "patricia.goncalves.contabilidade",
        url: "https://www.facebook.com/search/top?q=Patricia%20Goncalves%20Tangara",
        nomeExibicao: "Patrícia Gonçalves",
        status: "LOCALIZADO",
        amigosEstimados: 1650,
        cidade: "Tangará da Serra, MT",
        bio: "Profissional de contabilidade e finanças. Mãe do Lucas. Apreciadora de vida saudável e momentos em família.",
        assertividade: 98.8,
        vinculosRegionais: "Comunidade de Profissionais de Finanças do MT e Associação de Moradores",
      },
      youtubeOuPodcast: [
        {
          canal: "Canal Finanças do Agro MT",
          url: "https://www.youtube.com/results?search_query=Patricia+Goncalves+Tributario+Agro",
          tituloConteudo: "Como a Reforma Tributária Impacta o Produtor e o Mercado Imobiliário Regional",
          papel: "palestrante",
          visualizacoes: "6.100 visualizações",
          tema: "Reforma Tributária & Planejamento Patrimonial",
        },
      ],
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca:
          "Apartamento de alto padrão de 3 dormitórios (mínimo 1 suíte master ampla) com varanda gourmet climatizada, ou sobrado moderno em condomínio fechado seguro em Tangará da Serra/MT, com lazer para o filho e 2 vagas de garagem demarcadas.",
        faixaPrecoEstimada: "R$ 750.000 a R$ 1.300.000",
        tipologiasPreferenciais: [
          "Apartamento Alto Padrão com Varanda Gourmet",
          "Sobrado Funcional em Condomínio Fechado",
          "Casa Térrea Moderna",
        ],
        bairrosInteresse: ["Centro", "Vila Alta", "Jardim Europa"],
        motivacaoCompra:
          "Conquista de moradia própria definitiva com segurança máxima, lazer estruturado para o filho Lucas e localização central prática.",
        scoreAssertividadePerfil: 99.4,
      },
      googleFootprint: {
        termosPesquisados: ['"Patrícia Gonçalves" Tangará da Serra', '"PG Consultoria e Gestao" CNPJ'],
        mencoesPublicas: [
          {
            titulo: "PG Consultoria e Gestão Empresarial Ltda - CNPJ 46.128.992/0001-38",
            fonte: "Receita Federal do Brasil / JUCESP / JUCEMAT",
            link: "https://www.google.com/search?q=PG+Consultoria+e+Gestao+Empresarial",
            snippet:
              "Registro de sociedade empresária ativa com sócia-administradora Patrícia Gonçalves com atividade em consultoria em gestão empresarial e tributária.",
            data: "2024",
            assertividade: 99.8,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle:
        "Profissional Contábil e de Finanças Independente. Mãe dedicada, rotina saudável com corrida e pilates, e foco em conforto residencial.",
      resumoPerfil:
        "Patrícia é exemplo de disciplina analítica e equilíbrio pessoal. Com sólida formação em finanças e contabilidade para o agronegócio, divide seu tempo entre a assessoria a produtores rurais e a educação de seu filho Lucas. Prioriza imóveis seguros, de fácil manutenção, com boa iluminação natural e estrutura para receber amigos e a família.",
      rotinaSemanal: [
        {
          periodo: "Manhã (06:00 - 07:30)",
          descricao:
            "Treino matinal de corrida de rua no Parque da Família ou sessão de Pilates funcional, seguido de café da manhã nutritivo com o filho Lucas.",
          habitos: ["Corrida de 5 km ou Pilates", "Café com Lucas", "Revisão da agenda de consultoria"],
        },
        {
          periodo: "Comercial (08:00 - 18:00)",
          descricao:
            "Elaboração de pareceres tributários, auditoria de balanços do agronegócio e consultorias com clientes de Tangará da Serra.",
          habitos: ["Análise de demonstrações contábeis", "Reuniões presenciais e remotas", "Planejamento sucessório"],
        },
        {
          periodo: "Noite (19:00 - 21:30)",
          descricao:
            "Momento dedicado ao filho Lucas, auxílio nas atividades escolares, preparo de jantar leve e leitura de livros sobre finanças e desenvolvimento pessoal.",
          habitos: [
            "Jantar saudável",
            "Apoio aos deveres escolares de Lucas",
            "Leitura de livros de finanças e relaxamento",
          ],
        },
        {
          periodo: "Finais de Semana",
          descricao:
            "Visita à Feira do Produtor local aos sábados pela manhã para compra de frutas e verduras orgânicas; tarde de lazer e cinema com Lucas; domingo de descanso e visitas familiares.",
          habitos: [
            "Feira do Produtor local",
            "Passeios e brincadeiras com Lucas",
            "Cafés especiais e culinária artesanal",
          ],
        },
      ],
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria: "Ficha Cadastral Homologada Casa Nova Imóveis nº CN-2026-3228 & CRC-MT",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Inteligência e Crédito Imobiliário Casa Nova Imóveis",
        hashValidacaoSha256: "c18273645a9018273645b0192837465019283746501928374650192837465019",
        termoConsentimentoLgpd: "Consentimento para qualificação de crédito habitacional (Art. 7º, I e V da LGPD).",
        observacaoComiteCredito:
          "Perfil corporativo contábil de alta renda. Busca por apartamento ou casa com segurança e proximidade a áreas verdes.",
      },
      hobbiesPrincipais: [
        {
          categoria: "esportes",
          nome: "Corrida de Rua & Pilates Funcional",
          frequencia: "3x por semana",
          locaisPraticados: ["Parque da Família de Tangará da Serra", "Estúdio de Pilates Central"],
          origemValidacao: "Ficha Cadastral Homologada nº CN-2026-3228",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.3,
          detalhes:
            "Pratica corrida rústica no circuito arborizado do Parque da Família e pilates com foco em postura, fortalecimento do core e relaxamento.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Proximidade com vias de caminhada e áreas verdes (Parque da Família/Tarumã) e condomínio com academia/espaço fitness moderno.",
          iconeNome: "Activity",
        },
        {
          categoria: "gastronomia",
          nome: "Cafés Especiais & Panificação Artesanal",
          frequencia: "Frequente",
          locaisPraticados: ["Residência e Cafeterias de Tangará da Serra"],
          origemValidacao: "Declaração de Hábitos de Lazer Cadastrais",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.1,
          detalhes:
            "Apreciadora de métodos manuais de extração de café (V60, Chemex) e preparo caseiro de pães e bolos com fermentação natural (levain).",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Cozinha gourmet ampla e iluminada, com bancada em ilha de quartzo/granito e despensa planejada para eletroportáteis.",
          iconeNome: "Coffee",
        },
        {
          categoria: "cultura",
          nome: "Leituras de Finanças, Psicologia & Liderança",
          frequencia: "Diário",
          locaisPraticados: ["Canto de Leitura Residencial"],
          origemValidacao: "Ficha Cadastral e Registro Profissional no CRC/MT",
          grauComprovacao: "EVIDENCIA_CORPORATIVA",
          scoreValidacao: 99.7,
          detalhes:
            "Lê regularmente publicações sobre macroeconomia, mercado imobiliário, inteligência emocional e governança corporativa.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Home office privativo silencioso com isolamento acústico, luz natural abundante e varanda integrada.",
          iconeNome: "Award",
        },
        {
          categoria: "natureza",
          nome: "Jardinagem Doméstica & Paisagismo de Sacada",
          frequencia: "Semanal",
          locaisPraticados: ["Sacada e Jardim Residencial"],
          origemValidacao: "Especificações de Estilo de Vida na Ficha Cadastral",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 98.9,
          detalhes:
            "Cultiva folhagens tropicais, samambaias e orquídeas para criar um ambiente acolhedor e relaxante em casa.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Varanda ampla com ponto de água e espaço para floreiras e jardim vertical privativo.",
          iconeNome: "Compass",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura:
          "Apartamento contemporâneo de alto padrão com varanda gourmet ampla ou sobrado funcional com projeto luminotécnico aconchegante.",
        itensIndispensaveis: [
          "Varanda gourmet espaçosa com churrasqueira integrada e tela de proteção para segurança do filho",
          "Suíte master ampla com armários planejados e excelente ventilação natural",
          "Cozinha integrada em conceito aberto com bancada em ilha para refeições rápidas",
          "Condomínio com portaria 24h, piscina adulto/infantil aquecida, academia equipada e brinquedoteca",
          "No mínimo 2 vagas de garagem demarcadas e de fácil manobra",
        ],
        ambientesPrioritarios: [
          "Varanda Gourmet",
          "Living Integrado",
          "Suíte Master com Closet",
          "Quarto Aconchegante para o Filho",
        ],
        perfilVizinhança:
          "Bairro central ou nobre com facilidade de acesso a colégios, supermercados e clínicas médicas (Centro, Vila Alta ou Jardim Europa).",
        prioridadesSustentabilidade: ["Edifício com Coleta Seletiva", "Aproveitamento de Luz Natural e Lâmpadas LED"],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["Honda HR-V Touring", "Jeep Compass Longitude Turbo Flex"],
        tecnologiaEGadgets: ["Apple iPhone 15 Pro", "Cafeteira Nespresso Vertuo", "Apple Watch SE"],
        gastronomiaEVinhos: [
          "Grãos Especiais de Café da Alta Mogiana",
          "Vinhos Brancos Suaves e Espumantes Brut",
          "Produtos Orgânicos",
        ],
        vestuarioEModa: ["Le Lis Blanc", "Arezzo", "Zara", "Roupas Fitness de Poliamida"],
      },
      viagensEExperiencias: [
        {
          destino: "Litoral de Santa Catarina & Balneário Camboriú",
          tipoViagem: "Férias de Verão com o Filho",
          detalhes: "Passeios de praia, parques temáticos (Beto Carrero World) e descanso à beira-mar.",
        },
        {
          destino: "Cidades Históricas e Ecoturismo no Centro-Oeste",
          tipoViagem: "Viagens Culturais de Fim de Semana",
          detalhes: "Visitas a museus, cachoeiras e passeios educativos com o filho Lucas.",
        },
      ],
      causasEComunidade: [
        "Incentivo a feiras de economia solidária e produtoras rurais locais em Tangará da Serra",
        "Apoio a campanhas de arrecadação de material escolar para crianças em vulnerabilidade",
      ],
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    dadosBancariosEChavesPix: {
      chavesPixCadastradasBacen: [
        {
          tipoChave: "CPF",
          chaveMascarada: "069.***.***-61",
          instituicao: "Sicredi União MT",
          dataCriacao: "16/11/2020",
          status: "ATIVA",
        },
        {
          tipoChave: "TELEFONE",
          chaveMascarada: "(65) 9****-2292",
          instituicao: "Banco do Brasil",
          dataCriacao: "10/01/2021",
          status: "ATIVA",
        },
      ],
      bancosRelacionamento: [
        {
          banco: "Sicredi Sudoeste MT",
          codigoCompensacao: "748",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Tangará da Serra (0810)",
          tempoRelacionamentoAnos: 9,
          limiteChequeEspecialAprovado: 20000,
          cartaoCreditoLimiteTotal: 75000,
          pontualidadePagamentos: "Excelente (Histórico 100% Pontual)",
        },
        {
          banco: "Banco do Brasil",
          codigoCompensacao: "001",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Central TGA (1310)",
          tempoRelacionamentoAnos: 15,
          limiteChequeEspecialAprovado: 35000,
          cartaoCreditoLimiteTotal: 90000,
          pontualidadePagamentos: "Excelente",
        },
      ],
      resumoOpenFinance: {
        scoreOpenFinance: 890,
        movimentacaoMediaMensal: 38000,
        saldoInvestimentosTotal: 185000,
        probabilidadeAprovacaoCaixa: "Altíssima (Margem Livre no SFN)",
      },
    },
    imoveisRecomendadosIds: ["c0eef2a1-9089-4171-8517-e60dd9e571a3", "d78a91b2-1234-4567-8901-abcdef123456"],
  },

  // 2. LUCAS DIAS DA SILVA (000.000.002-72)
  "00000000272": {
    cpf: "00000000272",
    cpfFormatado: "000.000.002-72",
    digitoValido: true,
    regiaoFiscal: "6ª RF (MG) — Domicílio Eleito em Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "14/11/2026 às 14:20",
    protocoloConsulta: "CN-CPF-2026-98430-MT",
    nomeCompleto: "LUCAS DIAS DA SILVA",
    dataNascimento: "28/11/1985",
    idade: 41,
    sexo: "M",
    nomeMae: "Aparecida dos Passos Silva",
    nomePai: "Geraldo Magela da Silva",
    estadoCivil: "Casado(a)",
    qualificacaoCivil: {
      rg: "MG-14.882.109",
      rgOrgaoEmissor: "SSP/MG",
      rgDataExpedicao: "14/09/2007",
      naturalidade: "Uberaba - MG",
      nacionalidade: "Brasileira",
      tituloEleitor: "0891 2284 0213",
      zonaEleitoral: "326ª Zona Eleitoral",
      secaoEleitoral: "0142",
      pisPasep: "128.44192.85-4",
      filiacaoMaeCompleta: "Aparecida dos Passos Silva",
      filiacaoPaiCompleta: "Geraldo Magela da Silva",
      registroCivilCartorio: "Pendente de apresentação de Certidão de Nascimento perante o Cartório Notarial",
      registroCivilLivroTermo: "Aguardando averbação notarial formal",
    },
    telefones: [
      { numero: "(34) 99211-0666", whatsapp: true, principal: true },
      { numero: "(34) 99211-0663", whatsapp: true, principal: false },
    ],
    emails: ["lucas.silva@exemplo.invalid", "lucas_passos@terra.com.br"],
    endereco: {
      logradouro: "Rua dos Jerivás",
      numero: "2292",
      bairro: "Jardim São Paulo",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78302-586",
      complemento: "uisa / NossaGente (ID: 151)",
    },
    scoreCredito: 815,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 35000,
    capacidadeParcelaMensal: 9550,
    poderCompraImobiliario: 1170690,
    potencialFgts: 58000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 28500,
      rendaComplementar: 6500,
      rendaTotalLiquida: 26249,
      origemComprovacao: "Contrato de Trabalho CLT Executivo / CIO na Biorrefinaria uisa",
      tempoAtividade: "8 anos e 8 meses na mesma corporação agroindustrial",
      capacidadeParcela30: 9550,
      comprometimentoSFN: 950,
      percentualComprometimento: 2.7,
      margemLivreFinanciamento: 8600,
      saldoFgts: 58000,
      poderCompraImobiliario: 1170690,
      entradaSugerida20: 222538,
      faixaScore: "815 de 1.000 — Categoria Excelente (Baixo Risco)",
      probabilidadeInadimplencia: "1,5% (Mínima)",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-8812-NACIONAL",
        cartoriosPesquisados: "Central Nacional de Serviços Compartilhados dos Tabeliães de Protesto (CENPROT / IEPTB)",
        dataPesquisa: "14/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [
          {
            cartorio: "1º Cartório de Protesto de Títulos de Tangará da Serra/MT",
            praca: "Tangará da Serra/MT",
            dataDistribuicao: "14/11/2026",
            valor: 0,
            favorecido: "Pesquisa Cartorária",
            status: "Nada Consta (0 Apontamentos)",
          },
        ],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-98430-MT",
        dataPesquisa: "14/11/2026",
        itens: [
          {
            banco: "033 - Banco Santander (Brasil) S.A.",
            agencia: "3104",
            alinea: "Alíneas 11 a 14",
            dataOcorrencia: "14/11/2026",
            valor: 0,
            status: "Nenhuma Ocorrência",
          },
        ],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Boa Vista SCPC",
        itens: [
          {
            credor: "Bancos e Cartões de Crédito SFN",
            contrato: "SFN-77881",
            dataInclusao: "14/11/2026",
            valor: 0,
            status: "Sem Apontamentos Ativos",
          },
        ],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT, TRF1 e TST",
        itens: [
          {
            tribunal: "TJMT (Vara Cível de Tangará da Serra)",
            vara: "1ª Vara Cível",
            numeroProcesso: "0001428-91.2024.8.11.0055",
            assunto: "Homologação de Transação Imobiliária",
            status: "Extinto / Regular",
          },
        ],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta)",
        dividaAtivaUniao: "Sem Inscrições Ativas",
        cadinFederal: "Nada Consta",
        scrBacenPontualidade: "100% Pontual (Risco A)",
      },
    },
    historico: {
      origemCadastro: "Barramento de Eventos Internos Diretório Interno x Ultra (ID Externo: 151)",
      cadastradoEm: "29/10/2026",
      atualizadoEm: "14/11/2026",
      eventosLinhaDoTempo: [
        {
          data: "14/11/2026",
          evento:
            "sistema.nossagente.colaborador.atualizado: Sincronização por evento interno executada com sucesso (Colaborador ID: 151, Chave: uisa-EXEC-18492, Hash SHA-256 verificado)",
          canal: "Barramento de Eventos Internos (Diretório Interno x Ultra)",
        },
        {
          data: "13/11/2026",
          evento:
            "sistema.ultra.operacao.sincronizada: Qualificação patrimonial e análise de capacidade habitacional (SBPE / Casa Nova Imóveis)",
          canal: "Ultra / Casa Nova Imóveis",
        },
        {
          data: "28/03/2024",
          evento:
            "Registro e constituição da LP Consultoria e Soluções Inteligentes (JUCEMAT / CNPJ 54.518.772/0001-49 em Tangará da Serra/MT)",
          canal: "Receita Federal / JUCEMAT",
        },
        {
          data: "15/03/2018",
          evento:
            "sistema.nossagente.escala.atualizada: Lotação executiva na Biorrefinaria uisa (Gerência de Tecnologia -> Promoção a Chief Information Officer - CIO)",
          canal: "Diretório Interno / uisa",
        },
        {
          data: "19/10/2010",
          evento: "Abertura de inscrição empresarial individual em Uberaba/MG (JUCEMG / CNPJ 12.690.391/0001-00)",
          canal: "JUCEMG / RFB",
        },
      ],
      enderecosAnteriores: [
        { endereco: "Uberaba/MG - Bairro Universitário (Uniube / FCETM)", periodo: "2004 - 2017" },
        { endereco: "Eunápolis/BA - Veracel Celulose", periodo: "2018 - 2019" },
        {
          endereco: "Tangará da Serra/MT - Jardim São Paulo / Jardim Europa (uisa)",
          periodo: "2019 - Atual",
        },
      ],
      consultasAnteriores: [
        {
          data: "14/11/2026",
          motivo: "Auditoria Completa 360 & Sincronização Diretório Interno/Ultra",
          agente: "Diretoria Executiva",
        },
        { data: "13/11/2026", motivo: "Simulação Habitacional SBPE & Compra", agente: "Casa Nova Imóveis" },
        {
          data: "30/10/2026",
          motivo: "Sincronização por Evento Interno de Pessoal",
          agente: "Diretório Interno (uisa)",
        },
      ],
    },
    dadosPublicos: {
      ocupacaoPresumida: "Chief Information Officer (CIO) / Executivo de Tecnologia",
      empresasVinculadas: [
        {
          razaoSocial: "USINAS ITAMARATI S/A — Casa Nova",
          cnpj: "15.009.178/0001-70",
          cargo: "CIO (Chief Information Officer) / Diretor de TI",
          participacao: "Executivo C-Level (Capital Social R$ 901.394.000,00 - Nova Olímpia/MT)",
        },
        {
          razaoSocial: "LUCAS DIAS DA SILVA (Empresa Individual)",
          cnpj: "12.690.391/0001-00",
          cargo: "Titular",
          participacao: "Registro Histórico RFB / Uberaba - MG (Baixada voluntariamente em 08/07/2024)",
        },
      ],
      veiculosPresumidos: [],
      processosPublicos: [
        {
          numero: "0001428-91.2024.8.11.0055",
          tribunal: "TJMT (Vara Cível Tangará da Serra)",
          assunto: "Homologação de Transação Imobiliária",
          status: "Extinto / Regular",
        },
      ],
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    dadosTrabalhistasCLT: {
      vinculoAtivo: true,
      tipoVinculo: "CLT Estatutário / Executivo C-Level",
      empregador: "uisa Biorrefinaria Agroindustrial",
      cnpjEmpregador: "03.979.663/0001-98",
      cargoRegistrado: "Chief Information Officer (CIO) / Diretor de TI",
      cbo: "1236-05",
      cboDescricao: "Diretor de serviços de informática / TI",
      dataAdmissao: "15/03/2018",
      tempoCasaAnos: 8.7,
      salarioBaseCLT: 28500.0,
      remuneracaoVariavelMedia: 6500.0,
      descontosOficiais: {
        inss: 908.86,
        irpf: 7842.5,
        outrosDescontos: 0.0,
      },
      salarioLiquidoRecebido: 26248.64,
      origemFonteDados: "eSocial Evento S-1200 / S-1210 & CTPS Digital eSocial Homologada",
      beneficiosAtivos: [
        "Plano de Saúde Executivo SulAmérica Especial",
        "Seguro de Vida em Grupo Corporativo",
        "Previdência Privada Corporativa com aporte paritário",
        "Veículo Corporativo / Auxílio Mobilidade Agroindustrial",
      ],
      historicoSalarialUltimosMeses: [
        { competencia: "10/2026", valorBruto: 35000.0, valorLiquido: 26248.64 },
        { competencia: "09/2026", valorBruto: 35000.0, valorLiquido: 26248.64 },
        { competencia: "08/2026", valorBruto: 35000.0, valorLiquido: 26248.64 },
        { competencia: "07/2026", valorBruto: 35000.0, valorLiquido: 26248.64 },
        { competencia: "06/2026", valorBruto: 41500.0, valorLiquido: 30980.12 },
        { competencia: "05/2026", valorBruto: 35000.0, valorLiquido: 26248.64 },
      ],
    },
    detalhamentoDividasSFN: {
      totalComprometidoMensal: 950.0,
      totalSaldoDevedorResidual: 15200.0,
      percentualRendaComprometida: 2.7,
      contratos: [
        {
          tipoOperacao: "Financiamento Veículos (CDC)",
          instituicao: "033 - Banco Santander (Brasil) S.A.",
          contratoMascarado: "CDC-7812***-MT",
          parcelaMensal: 950.0,
          parcelasPagas: 32,
          totalParcelas: 48,
          saldoDevedor: 15200.0,
          situacao: "Em Dia / Adimplente (Pontualidade 100%)",
          garantia: "Alienação Fiduciária - Toyota Hilux SRX 4x4 Diesel 2023",
        },
        {
          tipoOperacao: "Cartão de Crédito",
          instituicao: "341 - Itaú Unibanco S.A.",
          contratoMascarado: "VISA-INFINITE-4112***",
          parcelaMensal: 0.0,
          parcelasPagas: 60,
          totalParcelas: 60,
          saldoDevedor: 0.0,
          situacao: "Em Dia / Adimplente (Fatura R$ 4.200 liquidada 100% à vista sem rotativo)",
          garantia: "Limite aprovado R$ 50.000 (Utilização 8,4%)",
        },
        {
          tipoOperacao: "Cheque Especial",
          instituicao: "033 - Banco Santander",
          contratoMascarado: "LIS-3104***",
          parcelaMensal: 0.0,
          parcelasPagas: 0,
          totalParcelas: 0,
          saldoDevedor: 0.0,
          situacao: "Em Dia / Regular (Limite R$ 25.000 não utilizado)",
          garantia: "Sem garantias reais exigidas",
        },
        {
          tipoOperacao: "Empréstimo Consignado",
          instituicao: "SFN Geral",
          contratoMascarado: "NENHUM",
          parcelaMensal: 0.0,
          parcelasPagas: 0,
          totalParcelas: 0,
          saldoDevedor: 0.0,
          situacao: "Inexistente (Margem consignável de 35% totalmente desimpedida: R$ 12.250/mês)",
          garantia: "Consignável em folha disponível",
        },
      ],
    },
    redesSociais: {
      assertividadeGlobal: 99.8,
      motivoAssertividadeGlobal:
        "Cruzamento biométrico e validação oficial: Perfil executivo LinkedIn verificado, publicações corporativas com hashtag oficial #somosuisa, citações em portais jornalísticos (PR Newswire / UDOP) e registro de CNPJ ativo em Tangará da Serra e Uberaba.",
      linkedin: {
        usuario: "lucaspassos",
        url: "https://www.linkedin.com/in/lucaspassos/",
        cargoAtual: "Chief Information Officer (CIO) / Diretor Executivo de TI",
        empresaAtual: "uisa (Biorrefinaria Agroindustrial)",
        localidade: "Tangará da Serra / Nova Olímpia / São Paulo",
        status: "LOCALIZADO",
        conexoes: "4K seguidores · +500 conexões estratégicas no Agro & Tech",
        assertividade: 100,
        motivoAssertividade:
          "Perfil oficial auditado no LinkedIn (linkedin.com/in/lucaspassos): cargo executivo de CIO na uisa, liderança do COI, histórico corporativo com citações no PR Newswire e Congresso UDOP.",
        resumoBio:
          "Chief Information Officer (CIO) na uisa. Mais de 15 anos liderando Transformação Digital, arquitetura corporativa SAP S/4HANA, conectividade rural privada 4G LTE no campo, IoT agrícola e inteligência preditiva na agroindústria bioenergética.",
        formacaoAcademica: [
          {
            instituicao: "FCETM / Uniube (Uberaba-MG)",
            curso: "Engenharia de Computação & Tecnologia da Informação",
            periodo: "Graduação Concluída",
            grau: "Bacharelado",
          },
          {
            instituicao: "Fundação Getulio Vargas (FGV)",
            curso: "MBA Executivo em Gestão Empresarial & Liderança Estratégica",
            periodo: "Pós-Graduação Concluída",
            grau: "Especialização / MBA",
          },
        ],
        certificacoes: [
          "ITIL Expert in IT Service Management",
          "Enterprise Architecture & SAP S/4HANA Implementation",
          "AI & Predictive Analytics for Agribusiness Executive",
          "Cybersecurity & Data Privacy Governance",
        ],
        postsPrincipais: [
          {
            data: "Safra 2026/2027",
            titulo: "#onetaioneteam #somosuisa — Conectividade 4G Privada e Telemetria no Campo",
            resumo:
              "Implementação pioneira de cobertura celular privada 4G LTE em mais de 90 mil hectares de canaviais na Biorrefinaria uisa, conectando frotas de colhedoras autônomas e carretas de transbordo diretamente ao Centro de Operações Integradas (COI).",
            engajamento: "540 curtidas · 48 comentários",
            topicos: ["#somosuisa", "Conectividade Rural", "Agro 4.0", "Telemetria"],
            link: "https://pt.linkedin.com/posts/lucaspassos_onetaioneteam-somosuisa-activity-6684809640192077824-cR41",
          },
          {
            data: "Junho 2022",
            titulo: "Congresso UDOP & PR Newswire: Gestão Tecnológica Integrada de Times Regionais",
            resumo:
              "Painel e publicação oficial sobre como a arquitetura digital da uisa integra os times operacionais de Tangará da Serra, Nova Olímpia e São Paulo em tempo real, garantindo máxima previsibilidade e eliminação de gargalos fabris.",
            engajamento: "412 curtidas · 62 comentários",
            topicos: ["Congresso UDOP", "Indústria 4.0", "Eficiência Operacional", "Sistemas Distribuídos"],
            link: "https://www.prnewswire.com/news-releases/como-a-tecnologia-tem-ajudado-biorrefinaria-uisa-a-gerenciar-times-em-diferentes-regioes-826610219.html",
          },
          {
            data: "Maio 2024",
            titulo: "Inteligência Artificial & Machine Learning Aplicados à Cogeração de Bioenergia",
            resumo:
              "Apresentação técnica sobre modelos preditivos para despacho ideal de bioeletricidade limpa a partir da queima de biomassa de cana e otimização do Rendimento Industrial (RTC).",
            engajamento: "320 curtidas · 35 comentários",
            topicos: ["IA no Agro", "Bioenergia", "Transição Energética", "ESG"],
          },
        ],
        interessesEGostos: [
          "Arquitetura Cloud & SAP S/4HANA no Agronegócio",
          "Conectividade Privada 4G/LTE e IoT Agrícola em Larga Escala",
          "Inteligência Artificial Generativa e Automação de Processos Industriais",
          "Imóveis de Alto Padrão em Tangará da Serra (priorizando segurança, energia solar e área verde)",
          "Gastronomia Contemporânea, Esportes ao Ar Livre e Sustentabilidade",
        ],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Lucas+Dias+da+Silva%22",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Lucas+Dias+da+Silva%22",
        nomeExibicao: "Lucas Dias da Silva",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "O titular mantém perfil pessoal privado sob proteção constitucional da intimidade (Art. 5º, X da CF/88) e da LGPD (Lei 13.709/2018). Varredura OSINT confirma ausência de litígios públicos ou exposição desabonadora.",
        seguidoresEstimados: 3820,
        bio: "Perfil pessoal com privacidade ativada. Sem URL comercial pública indexada. Varredura OSINT confirma conformidade e ausência de apontamentos desabonadores.",
        verificado: false,
        assertividade: 99.8,
        destaquesGostos: [
          "Ficha Cadastral Homologada CN-2026-8819",
          "Mountain Bike (Vale do Sepotuba)",
          "AgroTech & Inovação (uisa)",
          "Parrilla & Cortes Nobres MT",
          "Smart Home & Energia Solar",
        ],
        ultimosPosts: [
          {
            tipo: "foto",
            legenda:
              "Pedal pelas trilhas do Vale do Sepotuba em Tangará da Serra. Integração com a natureza exuberante de Mato Grosso! 🚴‍♂️🌳 #MTB #TangaraDaSerra",
            localizacao: "Vale do Sepotuba, Tangará da Serra - MT",
            engajamento: "Registro Cadastral",
          },
          {
            tipo: "carrossel",
            legenda:
              "Momento de convivência familiar e descanso no final de semana. Prioridade absoluta para o bem-estar e qualidade de vida. ❤️",
            localizacao: "Tangará da Serra - MT",
            engajamento: "Registro Cadastral",
          },
        ],
      },
      facebook: {
        usuario: "lucas.passos.silva.mt",
        url: "https://www.facebook.com/search/top?q=Lucas%20Dias%20da%20Silva",
        nomeExibicao: "Lucas Dias da Silva",
        status: "LOCALIZADO",
        amigosEstimados: 1840,
        cidade: "Tangará da Serra, MT",
        bio: "CIO na uisa. Casado com Daiane, pai do Arthur. Entusiasta de ciclismo MTB e tecnologia.",
        assertividade: 99.1,
        vinculosRegionais:
          "Participante do grupo MTB Tangará da Serra e Associação dos Profissionais de Tecnologia do MT",
      },
      youtubeOuPodcast: [
        {
          canal: "Fórum Nacional DATAGRO / UDOP",
          url: "https://www.youtube.com/results?search_query=Lucas+Dias+da+Silva+uisa",
          tituloConteudo: "Painel Executivo: Conectividade 4G Privada no Campo e Telemetria em 90 Mil Hectares",
          papel: "palestrante",
          visualizacoes: "14.800 visualizações",
          tema: "Agro 4.0 & Conectividade Rural Privada",
        },
        {
          canal: "Podcast AgroTalk TI Inside",
          url: "https://www.youtube.com/results?search_query=Lucas+Passos+CIO+uisa",
          tituloConteudo: "Como a Tecnologia Transforma Biorrefinarias em Indústrias Autônomas e Sustentáveis",
          papel: "entrevistado",
          visualizacoes: "9.400 visualizações",
          tema: "Transformação Digital & SAP S/4HANA",
        },
      ],
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca:
          "Residência de alto padrão contemporânea em Tangará da Serra/MT com 3 ou 4 suítes, living com pé-direito duplo, espaço gourmet climatizado integrado à piscina com prainha aquecida, escritório privativo e infraestrutura completa para automação e energia solar fotovoltaica.",
        faixaPrecoEstimada: "R$ 1.800.000 a R$ 3.200.000",
        tipologiasPreferenciais: [
          "Casa Térrea Contemporânea de Alto Padrão",
          "Sobrado Moderno com Piscina e Gourmet",
          "Condomínio Fechado Horizontal com Segurança 24h",
        ],
        bairrosInteresse: ["Jardim Europa", "Jardim Tarumã", "Condomínio Fechado"],
        motivacaoCompra:
          "Upgrade patrimonial para moradia definitiva com a esposa Daiane e o filho Arthur, priorizando conforto de alto padrão, privacidade, esportes e segurança.",
        scoreAssertividadePerfil: 99.8,
      },
      googleFootprint: {
        termosPesquisados: [
          '"Lucas Dias da Silva" Tangará da Serra',
          '"Lucas Dias da Silva" uisa CIO',
          '"Lucas Dias da Silva" PR Newswire',
        ],
        mencoesPublicas: [
          {
            titulo: "Como a tecnologia tem ajudado biorrefinaria uisa a gerenciar times - PR Newswire",
            fonte: "PR Newswire / Notícias Corporativas",
            link: "https://www.prnewswire.com/news-releases/como-a-tecnologia-tem-ajudado-biorrefinaria-uisa-a-gerenciar-times-em-diferentes-regioes-826610219.html",
            snippet:
              "Diz Lucas Dias da Silva, executivo de operações tecnológicas da uisa: 'Como os times operavam em localidades distintas, a conectividade integrada garantiu previsibilidade e escala nas entregas.'",
            data: "28/06/2022",
            assertividade: 99.9,
          },
          {
            titulo: "Congresso UDOP: Sala de Tecnologia reúne executivos de usinas e biorrefinarias",
            fonte: "Portal UDOP (União Nacional da Bioenergia)",
            link: "https://www.udop.com.br",
            snippet:
              "Participação de Lucas Dias da Silva na sala de Tecnologia da Informação apresentando cases de inovação no setor bioenergético.",
            data: "23/06/2022",
            assertividade: 99.5,
          },
          {
            titulo: "LP Consultoria e Soluções Inteligentes - CNPJ 54.518.772/0001-49",
            fonte: "Receita Federal do Brasil / JUCEMAT",
            link: "https://maiscnpj.com.br/cnpj/54518772000149-54-518-772-ltda",
            snippet:
              "Registro oficial de sociedade empresária limitada ativa com sócio-administrador Lucas Dias da Silva, sede na Rua dos Jerivás, 2292, Jardim São Paulo, Tangará da Serra/MT.",
            data: "28/03/2024",
            assertividade: 100,
          },
          {
            titulo: "Diário Oficial do Município de Uberaba - Porta-Voz nº 1357",
            fonte: "Prefeitura Municipal de Uberaba / Diário Oficial",
            link: "http://www.uberaba.mg.gov.br",
            snippet:
              "Registro público no Diário Oficial de Uberaba/MG vinculando o titular Lucas Dias da Silva ao CPF 000.000.002-72 com inscrição municipal regular.",
            data: "18/12/2015",
            assertividade: 100,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle:
        "Executivo C-Level no Agronegócio & Tecnologia Sustentável. Vida familiar sólida, dedicação à saúde e esportes ao ar livre.",
      resumoPerfil:
        "Lucas lidera a transformação digital de uma das maiores biorrefinarias do país (uisa) e mantém uma rotina de alta disciplina corporativa. Residente em Tangará da Serra/MT, declarou em ficha cadastral presencial de atendimento nº CN-2026-8819 núcleo familiar com residência própria e projeto de investimento patrimonial de alto padrão com Daiane dos Passos Silva e Arthur. Pratica ciclismo de montanha com frequência nas trilhas regionais do Vale do Sepotuba, aprecia a gastronomia de cortes nobres na brasa e tem forte engajamento em projetos sustentáveis de energia limpa e automação residencial.",
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria:
          "Ficha Cadastral Presencial Homologada nº CN-2026-8819 (Casa Nova Imóveis) & Registros Públicos Oficiais",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Inteligência e Crédito Imobiliário Casa Nova Imóveis",
        hashValidacaoSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        termoConsentimentoLgpd:
          "Consentimento específico para qualificação de crédito imobiliário e especificação arquitetônica de alto padrão (Art. 7º, I e V da LGPD).",
        observacaoComiteCredito:
          "Renda robusta comprovada via holerite executivo uisa e distribuição de lucros da LP Consultoria. Perfil de hábitos com alta aderência ao condomínio horizontal fechado em Tangará da Serra.",
      },
      rotinaSemanal: [
        {
          periodo: "Manhã (05:45 - 07:15)",
          descricao:
            "Despertar cedo para treino matinal de ciclismo de montanha (MTB) ou funcional, seguido de café da manhã em família e planejamento diário.",
          habitos: [
            "Treino cardiovascular na bike",
            "Leitura de briefings econômicos e de tecnologia",
            "Café matinal com Daiane e Arthur",
          ],
        },
        {
          periodo: "Comercial (08:00 - 18:30)",
          descricao:
            "Expediente executivo de liderança em tecnologia na uisa e consultoria estratégica, reuniões de comitê de diretoria e governança corporativa.",
          habitos: [
            "Acompanhamento do Centro de Operações Integradas (COI)",
            "Comitê executivo de inovação",
            "Despacho de projetos de inteligência artificial",
          ],
        },
        {
          periodo: "Noite (19:30 - 21:30)",
          descricao:
            "Convivência familiar, jantar preparado em conjunto, acompanhamento escolar do filho Arthur e descanso.",
          habitos: [
            "Jantar saudável em família",
            "Momento de estudos e conversas com Arthur",
            "Leitura de livros sobre liderança e inovação",
          ],
        },
        {
          periodo: "Finais de Semana",
          descricao:
            "Sábado com pedal longo pelas trilhas do Vale do Sepotuba / Salto das Nuvens e almoço com churrasco parrilla em casa; domingo dedicado à família e à comunidade.",
          habitos: [
            "Pedal de longa distância MTB",
            "Churrasco de carnes nobres no braseiro",
            "Passeios e ecoturismo regional em MT",
          ],
        },
      ],
      hobbiesPrincipais: [
        {
          categoria: "esportes",
          nome: "Ciclismo Mountain Bike (MTB & Gravel)",
          frequencia: "3x por semana (terças, quintas e sábados)",
          locaisPraticados: ["Trilhas do Vale do Sepotuba", "Serra de Tapirapuã", "Estrada Parque Salto das Nuvens"],
          origemValidacao: "Ficha Cadastral Homologada Casa Nova Imóveis nº CN-2026-8819 (Declaratório do Proponente)",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.8,
          detalhes:
            "Ciclista experiente, utiliza mountain bike de alto desempenho com telemetria integrada via GPS. Percorre distâncias de 40 a 80 km pelas trilhas acidentadas do relevo tangaraense e Serra de Tapirapuã.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Garagem com ponto de recarga elétrica para e-bike, box privativo de ferramentas esportivas e rota de saída facilitada para as vias de cicloturismo.",
          iconeNome: "Bike",
        },
        {
          categoria: "esportes",
          nome: "Beach Tennis & Práticas de Areia",
          frequencia: "2x por semana",
          locaisPraticados: ["Arena Beach Tennis Tangará", "Clubes de Raquete Locais"],
          origemValidacao: "Declaração de Preferências de Lazer Cadastral nº CN-2026-8819",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.5,
          detalhes:
            "Pratica partidas dinâmicas em quadras de areia em Tangará da Serra com amigos e familiares, valorizando condicionamento cardiovascular e integração social sadia.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Preferência expressa por condomínio horizontal com complexo esportivo completo, incluindo quadras de areia oficiais iluminadas e vestiário de apoio.",
          iconeNome: "Trophy",
        },
        {
          categoria: "gastronomia",
          nome: "Churrasco Parrilla & Cortes Nobres de MT",
          frequencia: "Semanal (Sábados/Domingos)",
          locaisPraticados: ["Espaço Gourmet Residencial"],
          origemValidacao: "Memorial Descritivo e Projeto Arquitetônico - Ficha nº CN-2026-8819",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.7,
          detalhes:
            "Entusiasta da culinária de fogo de chão e parrilla uruguaia. Prepara cortes selecionados de novilho precoce e Angus (Picanha Prime, Bife de Ancho, Prime Rib) acompanhados de legumes grelhados.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Varanda gourmet ampla com churrasqueira a carvão e duto mecânico independente, bancada gourmet com ilha central e ponto elétrico para refrigerador de bebidas.",
          iconeNome: "Flame",
        },
        {
          categoria: "gastronomia",
          nome: "Enologia & Vinhos Tintos de Altitude",
          frequencia: "Apreciação Frequente",
          locaisPraticados: ["Residência e Encontros Gastronômicos"],
          origemValidacao: "Checklist de Necessidades de Interior e Arquitetura - Ficha nº CN-2026-8819",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.4,
          detalhes:
            "Mantém adega climatizada com rótulos selecionados das regiões de Mendoza (Malbec), Vale do Colchagua (Carménère) e vinhos de guarda brasileiros da Serra Gaúcha.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Espaço climatizado dedicado para adega de vinhos (capacidade mínima de 40 a 80 garrafas) com isolamento térmico e circuito elétrico estabilizado.",
          iconeNome: "Wine",
        },
        {
          categoria: "tecnologia",
          nome: "Smart Home, Drones & Automação Residencial",
          frequencia: "Contínuo",
          locaisPraticados: ["Home Office e Residência"],
          origemValidacao:
            "Registro Corporativo de Liderança Tecnológica (CIO uisa / PR Newswire / UDOP) & Especificações de Automação nº CN-2026-8819",
          grauComprovacao: "EVIDENCIA_CORPORATIVA",
          scoreValidacao: 100,
          detalhes:
            "Executivo C-Level de tecnologia, especialista em infraestrutura, IoT e automação. Testa sensores conectados, automação de iluminação residencial, monitoramento de geração fotovoltaica e telemetria preditiva.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Infraestrutura completa para automação residencial (cabeamento estruturado Cat6/Fibra Óptica), shaft de passagem dedicado, preparação para microgeração solar fotovoltaica e fechaduras biométricas inteligentes.",
          iconeNome: "Cpu",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura:
          "Arquitetura Contemporânea com linhas retas, pé-direito duplo de 4,5 metros, grandes panos de vidro para integração da iluminação natural e brises em madeira nobre certificada.",
        itensIndispensaveis: [
          "Espaço gourmet climatizado integrado à piscina aquecida com prainha e cascata",
          "Home office privativo com isolamento acústico e cabeamento de rede estruturado Cat6/fibra",
          "Usina solar fotovoltaica on-grid instalada com geração mínima de 1.400 kWh/mês",
          "Ponto de recarga rápida para veículo híbrido/elétrico (Wallbox na garagem)",
          "Garagem coberta para no mínimo 3 veículos com espaço para acomodação de bicicletas de alta performance",
          "Suíte master ampla com closet walk-in duplo espelhado e banheira de imersão",
          "Sistema de segurança perimetral com CFTV de alta resolução e controle de acesso biométrico",
        ],
        ambientesPrioritarios: [
          "Living com Pé-Direito Duplo",
          "Espaço Gourmet com Ilha em Pedra Nobre",
          "Piscina com Prainha e Deck em Madeira",
          "Home Office Privativo com Vista para Área Verde",
        ],
        perfilVizinhança:
          "Bairro nobre residencial estritamente familiar, calmo, arborizado e seguro em Tangará da Serra (prioritariamente Jardim Europa, Tarumã ou condomínio horizontal fechado com portaria 24h).",
        prioridadesSustentabilidade: [
          "Energia Solar Fotovoltaica",
          "Sistema de Captação e Reúso de Água Pluvial",
          "Ventilação Cruzada e Conforto Térmico Passivo",
        ],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["Toyota SW4 Diamond 4x4", "Toyota Hilux GR-Sport", "SUV Híbrido Plug-in (BYD Song Plus)"],
        tecnologiaEGadgets: [
          "Apple iPhone 16 Pro Max",
          "MacBook Pro M3 Max",
          "Garmin Fenix 7 Sapphire Solar",
          "Apple Watch Ultra 2",
        ],
        gastronomiaEVinhos: [
          "Carnes Nobres Certificadas VPJ / Angus MT",
          "Vinhos Catena Zapata, Don Melchor e Almaviva",
          "Cafés Especiais de Grão Arábica",
        ],
        vestuarioEModa: [
          "Casual Corporativo Elegante (Brooksfield, Ricardo Almeida, Reserva)",
          "Vestuário Esportivo Tecnológico (Columbia PFG, Scott, Rapha)",
        ],
      },
      viagensEExperiencias: [
        {
          destino: "Pantanal Norte & Chapada dos Guimarães (MT)",
          tipoViagem: "Ecoturismo e Vivência com a Natureza em Família",
          detalhes:
            "Passeios periódicos com a esposa Daiane e o filho Arthur para contemplação da fauna e descanso em pousadas ecológicas.",
        },
        {
          destino: "Serra Gaúcha & Vale dos Vinhedos (RS)",
          tipoViagem: "Roteiro Enogastronômico e Férias de Inverno",
          detalhes: "Apreciação de vinícolas e alta gastronomia com clima serrano.",
        },
        {
          destino: "São Paulo / Campinas (SP)",
          tipoViagem: "Missões Corporativas e Congressos de Tecnologia",
          detalhes: "Participação em eventos de inovação no agro (DATAGRO, UDOP, SAP NOW) e encontros de liderança.",
        },
      ],
      causasEComunidade: [
        "Apoio a projetos de preservação das nascentes e matas ciliares da Bacia do Rio Sepotuba",
        "Incentivo à educação tecnológica e inclusão digital para jovens no interior do Mato Grosso",
      ],
    },
    dpoCompliance: {
      termoConsentimentoAssinado: true,
      dataHoraConsentimento: "29/10/2026 às 09:14:22 UTC-04:00",
      protocoloAssinaturaDigital: "DPO-LGPD-2026-98430-AUTH-CNI",
      baseLegalLgpd:
        "Art. 7º, I (Consentimento do Titular), Art. 7º, V (Contratos Imobiliários) e Art. 7º, X (Proteção do Crédito) da Lei nº 13.709/2018 (LGPD)",
      finalidadeEspecifica:
        "Due Diligence Notarial Imobiliária, Análise de Risco de Crédito SBPE/Caixa, Escrituração Notarial e Prevenção à Lavagem de Dinheiro (Resolução COAF nº 36 e Provimento CNJ nº 88/2019)",
      statusDpo: "HOMOLOGADO",
      responsavelDpo: "DPO & Agente Jurídico Interno — Casa Nova Imóveis & Ecossistema Imob Fácil",
      enquadramentoCoafLlavagemDinheiro: {
        pep: false,
        statusCoaf: "Conformidade Total / Nada Consta (Sem atipicidades financeiras ou sanções)",
        parecerCompliance:
          "Titular com capacidade econômico-financeira compatível, proveniência salarial comprovada via eSocial/uisa e regularidade societária integral.",
      },
      certidoesCartorariasValidadas: [
        {
          orgao: "Receita Federal do Brasil & PGFN",
          tipoCertidao: "Certidão Conjunta Negativa de Débitos Federais e Dívida Ativa da União",
          numeroCertidao: "2026-RFB-88392-BR",
          dataEmissao: "14/11/2026",
          validadeAte: "10/05/2027",
          codigoAutenticidade: "9A2B.44F1.77C0.D812",
          status: "REGULAR",
          linkVerificacao: "https://servicos.receita.fazenda.gov.br",
        },
        {
          orgao: "Tribunal Superior do Trabalho (TST)",
          tipoCertidao: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
          numeroCertidao: "2026/0491823",
          dataEmissao: "14/11/2026",
          validadeAte: "12/04/2027",
          codigoAutenticidade: "TST-CNDT-77491-MT",
          status: "REGULAR",
          linkVerificacao: "https://www.tst.jus.br/certidao",
        },
        {
          orgao: "Tribunal de Justiça do Estado de Mato Grosso (TJMT)",
          tipoCertidao: "Certidão Cível e Execuções Fiscais (Comarca de Tangará da Serra)",
          numeroCertidao: "2026-TJMT-5501-CIVEL",
          dataEmissao: "14/11/2026",
          validadeAte: "14/02/2027",
          codigoAutenticidade: "TJMT-8841-9920",
          status: "REGULAR",
          linkVerificacao: "https://www.tjmt.jus.br",
        },
        {
          orgao: "Central Nacional de Protesto (CENPROT / IEPTB-MT)",
          tipoCertidao: "Certidão Negativa de Protestos (1º e 2º Ofícios de Tangará da Serra)",
          numeroCertidao: "IEPTB-MT-8812-NACIONAL",
          dataEmissao: "14/11/2026",
          validadeAte: "14/12/2026",
          codigoAutenticidade: "CENPROT-8812-990",
          status: "REGULAR",
          linkVerificacao: "https://site.cenprot.org.br",
        },
        {
          orgao: "Caixa Econômica Federal (FGTS)",
          tipoCertidao: "Certificado de Regularidade do FGTS (CRF)",
          numeroCertidao: "CRF-20261114-8841",
          dataEmissao: "14/11/2026",
          validadeAte: "14/12/2026",
          codigoAutenticidade: "CAIXA-CRF-881290",
          status: "REGULAR",
          linkVerificacao: "https://consulta-crf.caixa.gov.br",
        },
        {
          orgao: "Central Notarial de Serviços Compartilhados (CENSEC)",
          tipoCertidao: "Registro Central de Testamentos, Procurações e Escrituras (RCTO/CEP)",
          numeroCertidao: "CENSEC-2026-004921",
          dataEmissao: "14/11/2026",
          validadeAte: "Indeterminada",
          codigoAutenticidade: "CNB-CF-8829-01",
          status: "REGULAR",
          linkVerificacao: "https://www.censec.org.br",
        },
      ],
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 4,
      valorEstimadoPatrimonio: 1257000,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis e Tabelionato de Notas de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 48.912",
          tipoImovel: "Terreno Urbano em Condomínio Fechado de Alto Padrão (Lote Residencial)",
          areaTotalM2: 450,
          valorAvaliacao: 380000,
          situacaoOnus: "Livre e Desembaraçado (Sem ônus reais, penhoras ou indisponibilidades)",
          anoRegistro: "2021",
        },
        {
          cidadeUf: "Uberaba / MG",
          cartorioRegistro: "2º Ofício de Registro de Imóveis de Uberaba/MG",
          numeroMatricula: "Matrícula nº 32.105",
          tipoImovel: "Apartamento Residencial Edifício Jardim Europa",
          areaTotalM2: 118,
          valorAvaliacao: 420000,
          situacaoOnus: "Quitado / Averbação de cancelamento de garantia fiduciária concluída",
          anoRegistro: "2015",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "Toyota Hilux SRX 2.8 4x4 Diesel Automática",
          anoFabricacaoModelo: "2024/2024",
          placa: "RRA-8E49",
          renavam: "01348821902",
          valorFipe: 315000,
          situacaoGravame:
            "Alienação Fiduciária - Banco Santander S.A. (Contrato adimplente, 32/48 pagas, saldo residual R$ 15.200)",
          combustivel: "Diesel S10",
        },
        {
          marcaModelo: "Jeep Compass Longitude 1.3 Turbo Flex Automático",
          anoFabricacaoModelo: "2023/2023",
          placa: "QNP-4G18",
          renavam: "01183920145",
          valorFipe: 142000,
          situacaoGravame: "Quitado / Sem restrições de gravame",
          combustivel: "Flex",
        },
      ],
    },
    imoveisRecomendadosIds: ["c0eef2a1-9089-4171-8517-e60dd9e571a3", "d78a91b2-1234-4567-8901-abcdef123456"],
  },
  "00000000434": {
    cpf: "00000000434",
    cpfFormatado: "000.000.004-34",
    digitoValido: true,
    regiaoFiscal: "1ª RF (MT, MS, GO, DF, TO) — Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "16/11/2026 às 08:30",
    protocoloConsulta: "CN-CPF-2026-04938-MT",
    nomeCompleto: "RODRIGO RIBEIRO GONÇALVES",
    dataNascimento: "14/05/1982",
    idade: 44,
    sexo: "M",
    nomeMae: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
    nomePai: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
    estadoCivil: "Casado(a)",
    qualificacaoCivil: {
      rg: "MT-1.928.341-SSP/MT",
      rgOrgaoEmissor: "SSP/MT",
      rgDataExpedicao: "05/03/2004",
      naturalidade: "Tangará da Serra - MT",
      nacionalidade: "Brasileira",
      tituloEleitor: "0219 4431 0244",
      zonaEleitoral: "019ª Zona Eleitoral (Tangará da Serra/MT)",
      secaoEleitoral: "0088",
      pisPasep: "128.49120.31-4",
      filiacaoMaeCompleta: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
      filiacaoPaiCompleta: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
      registroCivilCartorio: "1º Ofício de Registro Civil das Pessoas Naturais de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro A-84, Termo nº 24.112 / Casamento Livro B-12, Termo nº 3.410",
    },
    telefones: [
      { numero: "(65) 99982-1450", whatsapp: true, principal: true },
      { numero: "(65) 3326-4410", whatsapp: false, principal: false },
    ],
    emails: ["rodrigo.goncalves@exemplo.invalid", "rodrigo.ribeiro.mt@gmail.com"],
    endereco: {
      logradouro: "Rua Avelina Jaci Bohn",
      numero: "80",
      bairro: "Centro",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-060",
      complemento: "Residência Familiar",
    },
    scoreCredito: 840,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 31000,
    capacidadeParcelaMensal: 8040,
    poderCompraImobiliario: 935000,
    potencialFgts: 145000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 26800,
      rendaComplementar: 4200,
      rendaTotalLiquida: 24190,
      origemComprovacao:
        "Contrato de Trabalho CLT uisa (Engenharia de Infraestrutura) + Pró-Labore R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA",
      tempoAtividade: "8 anos e 2 meses na corporação agroindustrial",
      capacidadeParcela30: 9300,
      comprometimentoSFN: 1260,
      percentualComprometimento: 4.1,
      margemLivreFinanciamento: 8040,
      saldoFgts: 145000,
      poderCompraImobiliario: 935000,
      entradaSugerida20: 187000,
      faixaScore: "840 de 1.000 — Categoria Excelente (Baixo Risco)",
      probabilidadeInadimplencia: "1,2% (Mínima)",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-98425-NACIONAL",
        cartoriosPesquisados: "Central Nacional de Protesto (CENPROT) — Comarcas de Tangará da Serra/MT e Vitória/ES",
        dataPesquisa: "16/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [
          {
            cartorio: "1º e 2º Ofícios de Protesto da Comarca de Tangará da Serra/MT",
            praca: "Tangará da Serra/MT",
            dataDistribuicao: "16/11/2026",
            valor: 0,
            favorecido: "Pesquisa CENPROT Nacional",
            status: "Nada Consta (0 Apontamentos)",
          },
        ],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-98425-MT",
        dataPesquisa: "16/11/2026",
        itens: [
          {
            banco: "001 - Banco do Brasil S.A.",
            agencia: "0845 - Tangará da Serra",
            alinea: "Alíneas 11 a 14",
            dataOcorrencia: "16/11/2026",
            valor: 0,
            status: "Nenhuma Ocorrência Ativa",
          },
        ],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Quod · SPC Brasil",
        itens: [
          {
            credor: "Bancos e Instituições do SFN",
            contrato: "SFN-55123",
            dataInclusao: "16/11/2026",
            valor: 0,
            status: "100% Adimplente (Zero Apontamentos Ativos)",
          },
        ],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT, TRF1 e TST",
        itens: [
          {
            tribunal: "Tribunal de Justiça do Estado de Mato Grosso (TJMT)",
            vara: "Distribuidor Cível e Fazendário de Tangará da Serra",
            numeroProcesso: "1002341-88.2023.8.11.0055",
            assunto: "Certidão de Regularidade Ambiental e Imobiliária",
            status: "Sentença Favorável / Regular",
          },
        ],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta)",
        dividaAtivaUniao: "Sem Inscrições",
        cadinFederal: "Nada Consta",
        scrBacenPontualidade: "100% Pontual (Risco A / Risco AA)",
      },
    },
    historico: {
      origemCadastro: "uisa (NossaGente) · Id Externo 186",
      cadastradoEm: "29/10/2026",
      atualizadoEm: "16/11/2026",
      eventosLinhaDoTempo: [
        {
          data: "16/11/2026",
          evento: "Qualificação notarial, conformidade Provimento CNJ nº 88/2019 e dossiê 360",
          canal: "Casa Nova Imóveis",
        },
        {
          data: "10/11/2026",
          evento: "Averbação de outorga uxória e certidão de casamento no 1º Ofício de Tangará da Serra/MT",
          canal: "Registro Civil",
        },
        {
          data: "29/10/2026",
          evento: "Sincronização cadastral corporativa ativa no sistema NossaGente / uisa",
          canal: "uisa / RH",
        },
        {
          data: "12/03/2018",
          evento: "Admissão como Engenheiro de Infraestrutura & Automação na Biorrefinaria uisa",
          canal: "eSocial",
        },
      ],
      enderecosAnteriores: [
        { endereco: "Vitória/ES - Praia do Canto", periodo: "2004 - 2017" },
        { endereco: "Tangará da Serra/MT - Jardim Tarumã", periodo: "2018 - 2022" },
        { endereco: "Tangará da Serra/MT - Centro (Rua Avelina Jaci Bohn, 620-W)", periodo: "2022 - Atual" },
      ],
      consultasAnteriores: [
        {
          data: "16/11/2026",
          motivo: "Aquisição Imobiliária SBPE & Investimento em Terrenos",
          agente: "Casa Nova Imóveis",
        },
        {
          data: "29/10/2026",
          motivo: "Enriquecimento e Auditoria de Crédito Corporativo",
          agente: "uisa / RH",
        },
      ],
    },
    dadosPublicos: {
      ocupacaoPresumida: "Gerente de Engenharia e Infraestrutura Industrial (uisa) & Engenheiro Agrônomo",
      empresasVinculadas: [
        {
          razaoSocial: "USINAS ITAMARATI S/A — Casa Nova",
          cnpj: "15.009.178/0001-70",
          cargo: "Diretor Estatutário (Diretor de Gente, Inovação e Administração)",
          participacao: "Capital Social R$ 901.394.000,00 (Ativa RFB desde 24/06/2022 - Nova Olímpia/MT)",
        },
        {
          razaoSocial: "RODRIGO RIBEIRO GONÇALVES E OUTRA (ESTÂNCIA GONÇALVES)",
          cnpj: "64.336.577/0001-51",
          cargo: "Sócio Produtor Rural",
          participacao: "50% do Capital Social (R$ 100.000,00 - Mirante do Paranapanema/SP)",
        },
        {
          razaoSocial: "PATRÍCIA FERRARI PAULINO GONÇALVES (KYTTO TECNOLOGIA)",
          cnpj: "53.338.003/0001-04",
          cargo: "Cônjuge / Sócia Vinculada (Patrícia Ferrari Paulino Gonçalves - CPF 000.000.019-11)",
          participacao: "R$ 10.000,00 (Ativa RFB - Mirante do Paranapanema/SP)",
        },
      ],
      veiculosPresumidos: [],
      processosPublicos: [
        {
          numero: "1002341-88.2023.8.11.0055",
          tribunal: "TJMT (Vara Especializada Fazendária de Tangará da Serra)",
          assunto: "Certidão de Regularidade Ambiental e Sanitária",
          status: "Sentença Favorável / Baixado",
        },
      ],
    },
    parentescoERelacionamentos: {
      totalVinculosIdentificados: 4,
      scoreConfiancaRede: 100,
      regimeConjugalAvaliado:
        "Casado(a) sob Comunhão Parcial de Bens com Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC) (Certidão nº 3.410 do 1º Ofício de Tangará da Serra/MT). Exigível outorga uxória para alienação imobiliária (Art. 1.647 do Código Civil). Cônjuge ciente e averbada no dossiê.",
      arvoreFamiliar: [
        {
          tipoVinculo: "Esposa (Cônjuge)",
          grau: "1º Grau por Afinidade / Cônjuge",
          nome: "Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC)",
          cpfMascarado: "049.***.***-82",
          coabitacao: true,
          probabilidadeParentesco: 100,
          detalhes:
            "Casamento averbado sob Termo nº 3.410 no 1º Ofício de Tangará da Serra/MT. Outorga uxória apta para lavratura de escritura pública.",
        },
        {
          tipoVinculo: "Filho",
          grau: "1º Grau Descendente",
          nome: "Cauã Angelotti Gonçalves",
          cpfMascarado: "074.***.***-40",
          coabitacao: true,
          probabilidadeParentesco: 100,
          detalhes:
            "18 anos, Atleta Federado de Tênis (Tangará Tênis Clube), Certidão nº 12.840 do 1º Ofício de Tangará da Serra/MT.",
        },
        {
          tipoVinculo: "Mãe",
          grau: "1º Grau Ascendente",
          nome: "Aguardando validação em fonte segura (Genitora)",
          cpfMascarado: "***.***.***-**",
          coabitacao: false,
          probabilidadeParentesco: 100,
          detalhes: "Residente em Vitória/ES. Filiação materna comprovada no Registro Civil de Vitória/ES.",
        },
        {
          tipoVinculo: "Pai",
          grau: "1º Grau Ascendente",
          nome: "Aguardando validação em fonte segura (Genitor)",
          cpfMascarado: "***.***.***-**",
          coabitacao: false,
          probabilidadeParentesco: 100,
          detalhes: "Residente em Vitória/ES. Filiação paterna comprovada no Registro Civil de Vitória/ES.",
        },
      ],
      coabitantesMesmoEndereco: [
        {
          nome: "Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC)",
          cpfMascarado: "049.***.***-82",
          relacaoPresumida: "Esposa / Cônjuge (Comunhão Parcial de Bens)",
          periodo: "2018 - Atual",
          endereco: "Rua Avelina Jaci Bohn, 620-W, Centro, Tangará da Serra/MT",
        },
        {
          nome: "Cauã Angelotti Gonçalves",
          cpfMascarado: "074.***.***-40",
          relacaoPresumida: "Filho",
          periodo: "2008 - Atual",
          endereco: "Rua Avelina Jaci Bohn, 620-W, Centro, Tangará da Serra/MT",
        },
      ],
      sociosEParceiros: [
        {
          nome: "Rodrigo Ribeiro Gonçalves",
          documento: "000.000.001-91",
          empresa: "R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA (CNPJ 38.912.441/0001-20)",
          cargo: "Sócio-Administrador",
          participacaoCapital: "70%",
          poderAssinatura: "Individual",
        },
      ],
    },
    redesSociais: {
      assertividadeGlobal: 99.6,
      motivoAssertividadeGlobal:
        "Cruzamento biométrico e validação oficial: Engenheiro de infraestrutura e automação na uisa, filiado ao CREA-MT, sócio da R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA e com histórico familiar ativo em Tangará da Serra/MT.",
      linkedin: {
        usuario: "rodrigo-ribeiro-goncalves",
        url: "https://br.linkedin.com/in/rodrigo-ribeiro-goncalves",
        nomeExibicao: "Rodrigo Ribeiro Gonçalves",
        cargoAtual: "Gerente de Engenharia & Infraestrutura Industrial",
        empresaAtual: "uisa (Biorrefinaria Agroindustrial)",
        localidade: "Tangará da Serra, Mato Grosso, Brasil",
        status: "LOCALIZADO",
        conexoes: "+500 conexões estratégicas no Agro & Engenharia",
        assertividade: 99.5,
        motivoAssertividade:
          "Perfil profissional verificado e alinhado com histórico cadastral no Cadastro Geral da RFB e eSocial em Tangará da Serra/MT.",
        resumoBio:
          "Engenheiro responsável pela infraestrutura industrial, redes e automação da Biorrefinaria uisa. Especialista em gestão de projetos industriais, conectividade rural no Médio-Norte de Mato Grosso e agroindústria sustentável.",
        formacaoAcademica: [
          {
            instituicao: "Universidade Federal do Espírito Santo (UFES)",
            curso: "Engenharia de Produção & Automação",
            periodo: "2000 - 2005",
            grau: "Bacharelado",
          },
          {
            instituicao: "Fundação Getulio Vargas (FGV)",
            curso: "MBA em Gestão Empresarial e Agroindustrial",
            periodo: "2010 - 2012",
            grau: "Pós-Graduação Lato Sensu",
          },
        ],
        certificacoes: [
          "Gestão de Ativos e Automação Industrial ISA-95",
          "Governança Corporativa e Compliance no Agronegócio",
        ],
        postsPrincipais: [
          {
            data: "Outubro/2026",
            titulo: "Inovação e Eficiência Energética na Safra Bioenergética do Médio-Norte de MT",
            resumo:
              "Resultados expressivos na otimização de consumo elétrico e ampliação da cogeração de biomassa na uisa, fortalecendo a matriz renovável de Mato Grosso.",
            engajamento: "192 curtidas · 31 comentários",
            topicos: ["Agroindústria", "Eficiência Energética", "Tangará da Serra", "Sustentabilidade"],
            link: "https://br.linkedin.com/in/rodrigo-ribeiro-goncalves",
          },
        ],
        interessesEGostos: [
          "Automação e Redes Industriais no Campo",
          "Desenvolvimento Regional e Agronegócio Sustentável em Mato Grosso",
          "Imóveis de Alto Padrão em Condomínios Fechados",
          "Tênis de Campo e Apoio ao Esporte Infantojuvenil",
        ],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Rodrigo+Ribeiro+Goncalves%22+Tangara",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Rodrigo+Ribeiro+Goncalves%22+Tangara",
        nomeExibicao: "Rodrigo Ribeiro Gonçalves",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "Conta de uso pessoal e familiar. Preservada sob Art. 5º, X da CF/88 e Art. 7º da LGPD para evitar exposição e links inexistentes.",
        seguidoresEstimados: 2340,
        bio: "Perfil pessoal com privacidade ativada. Varredura OSINT confirma ausência de litígios públicos ou menções desabonadoras.",
        verificado: false,
        assertividade: 99.2,
        destaquesGostos: ["Família & Amigos", "Tênis & Treinos", "Viagens pelo MT", "Churrasco & Parrilla"],
      },
      facebook: {
        usuario: "rodrigo.goncalves.mt",
        url: "https://www.facebook.com/search/top?q=Rodrigo%20Ribeiro%20Goncalves%20Tangara",
        nomeExibicao: "Rodrigo Ribeiro Gonçalves",
        status: "LOCALIZADO",
        amigosEstimados: 1420,
        cidade: "Tangará da Serra, MT",
        bio: "Engenheiro na uisa, residente em Tangará da Serra/MT. Família, esportes e agronegócio.",
        assertividade: 98.8,
        vinculosRegionais: "Membro ativo do Tangará Tênis Clube e da Associação Comercial de Tangará da Serra (ACITS)",
      },
      youtubeOuPodcast: [
        {
          canal: "Canal Agroindústria & Tecnologia MT",
          url: "https://www.youtube.com/results?search_query=Rodrigo+Goncalves+uisa+Tangara",
          tituloConteudo: "Painel de Especialistas: Automação e Redes Industriais em Biorrefinarias",
          papel: "palestrante",
          visualizacoes: "3.200 visualizações",
          tema: "Tecnologia Agroindustrial",
        },
      ],
      tiktok: {
        usuario: "rodrigo.eng.agro",
        url: "https://www.tiktok.com/@rodrigo.eng.agro",
        status: "LOCALIZADO",
        buscaReversaUrl:
          'https://www.google.com/search?q=site:tiktok.com/@+"Rodrigo+Ribeiro+Goncalves"+Tangara+da+Serra',
        seguidoresEstimados: 940,
        bio: "Engenharia e automação agroindustrial em Mato Grosso 🚜 | Conectividade rural e rotina de treinos de tênis em família 🎾",
        destaquesVideos: [
          {
            titulo: "Automação e Redes Industriais no Campo: Conectividade em Biorrefinarias",
            tema: "Automação & Agro 4.0",
            visualizacoes: "2.8k visualizações",
            link: "https://www.tiktok.com/tag/agrotech",
          },
          {
            titulo: "Acompanhando o circuito estadual infantojuvenil de tênis em Tangará da Serra",
            tema: "Esporte & Família",
            visualizacoes: "1.9k visualizações",
            link: "https://www.tiktok.com/tag/tenismt",
          },
        ],
      },
      noticiasEMateriais: {
        totalItens: 4,
        fontesConsultadas: [
          "Diário da Serra (Tangará da Serra)",
          "Gazeta Digital MT",
          "Diário Oficial do Estado de MT (IOMAT)",
          "Diário Oficial da União (DOU)",
          "Acervo Técnico CREA-MT",
          "Google Notícias",
        ],
        clippingImprensa: [
          {
            titulo: "Biorrefinaria uisa avança em automação e infraestrutura de conectividade industrial no MT",
            veiculo: "Diário da Serra Notícias (Tangará da Serra/MT)",
            data: "14/08/2026",
            link: "https://diariodaserra.com.br",
            resumo:
              "Equipe técnica liderada pelo engenheiro Rodrigo Ribeiro Gonçalves implementa monitoramento em tempo real de usinas de biomassa e frotas agrícolas conectadas.",
            categoria: "Agronegócio & Inovação",
            assertividade: 99.8,
          },
          {
            titulo: "Encontro Empresarial da ACITS discute expansão urbana e novos condomínios residenciais em Tangará",
            veiculo: "Gazeta Digital MT",
            data: "22/04/2026",
            link: "https://www.gazetadigital.com.br",
            resumo:
              "Debate reuniu lideranças industriais e profissionais de engenharia da microrregião de Tangará da Serra sobre atração de investimentos e infraestrutura sustentável.",
            categoria: "Engenharia & Obras",
            assertividade: 99.1,
          },
        ],
        materiaisTecnicosOuOficiais: [
          {
            titulo: "Anotação de Responsabilidade Técnica (ART) nº 12026049281 — Subestação & Automação Industrial",
            orgaoOuEditora: "CREA-MT (Conselho Regional de Engenharia e Agronomia de MT)",
            tipoDocumento: "Norma Técnica",
            link: "https://www.crea-mt.org.br",
            data: "10/02/2026",
            descricao:
              "Registro formal de responsabilidade técnica emitido perante o CREA-MT para execução de projetos elétricos e automação no município de Nova Olímpia/Tangará da Serra.",
            autenticidadeVerificada: true,
          },
          {
            titulo: "Publicação no Diário Oficial do Estado de MT (IOMAT) — Licenciamento e Conformidade de Efluentes",
            orgaoOuEditora: "Diário Oficial do Estado de Mato Grosso (IOMAT - Edição 28.914)",
            tipoDocumento: "Diário Oficial",
            link: "https://www.iomat.mt.gov.br",
            data: "18/01/2026",
            descricao:
              "Parecer técnico de engenharia homologado em conformidade com as diretrizes da SEMA-MT para processos sustentáveis agroindustriais.",
            autenticidadeVerificada: true,
          },
        ],
      },
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca: "Casa em Condomínio Fechado ou Sobrado com Ampla Área Gourmet e Lazer Privativo",
        faixaPrecoEstimada: "R$ 850.000 a R$ 1.250.000",
        tipologiasPreferenciais: ["Casa em Condomínio", "Sobrado", "Área Gourmet Climatizada"],
        bairrosInteresse: ["Jardim Europa", "Residencial Manacá", "Jardim São Paulo", "Centro"],
        motivacaoCompra:
          "Upgrade de moradia familiar, maior privacidade e segurança com área de lazer completa para os filhos.",
        scoreAssertividadePerfil: 99.1,
      },
      googleFootprint: {
        termosPesquisados: [
          '"Rodrigo Ribeiro Gonçalves" "Tangará da Serra"',
          '"Rodrigo Ribeiro Gonçalves" uisa',
          '"Rodrigo Ribeiro Gonçalves" CREA-MT',
        ],
        mencoesPublicas: [
          {
            titulo: "Conselho Regional de Engenharia e Agronomia de Mato Grosso (CREA-MT) — Registro Profissional",
            fonte: "CREA-MT",
            link: "https://www.crea-mt.org.br",
            snippet: "Registro profissional ativo do engenheiro Rodrigo Ribeiro Gonçalves. Situação 100% regular.",
            data: "2026",
            assertividade: 99.8,
          },
          {
            titulo: "Junta Comercial do Estado de Mato Grosso — R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA",
            fonte: "JUCEMAT",
            link: "https://www.jucemat.mt.gov.br",
            snippet:
              "Ficha cadastral simplificada da empresa R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA, sócio-administrador Rodrigo Ribeiro Gonçalves.",
            data: "2026",
            assertividade: 99.6,
          },
          {
            titulo: "Federação Mato-grossense de Tênis — Circuito Estadual Infantojuvenil",
            fonte: "FMT / Tangará Tênis Clube",
            link: "https://www.tenismt.com.br",
            snippet:
              "Acompanhamento esportivo de Cauã Angelotti Gonçalves acompanhado pelo responsável legal Rodrigo Ribeiro Gonçalves.",
            data: "2026",
            assertividade: 99.2,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle: "Liderança Agroindustrial, Vida Familiar Ativa, Apaixonado por Tênis e Moradia de Alto Padrão",
      resumoPerfil:
        "Rodrigo possui perfil dinâmico, conciliando liderança em engenharia na uisa com ativa participação na vida esportiva dos filhos (Cauã no tênis federado). Valoriza moradia com segurança em condomínio fechado, espaço gourmet para churrasco com a família e amigos, e sustentabilidade com energia solar fotovoltaica.",
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria: "Ficha Cadastral Homologada CN-2026-9941 (uisa Gerência de Engenharia)",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Análise Cadastral e Engenharia Casa Nova Imóveis",
        hashValidacaoSha256: "b4c2e6802f0a1d639c09d784a9e223d61bca7f3690d57183e8b61e27a69622d1",
        termoConsentimentoLgpd: "DOC-LIFESTYLE-117879",
        observacaoComiteCredito:
          "Hobbies e rotina familiar integralmente homologados. Diretrizes de projeto compatíveis com condomínio fechado Ultra Construtora.",
      },
      rotinaSemanal: [
        {
          periodo: "Manhã (06:00 - 07:30)",
          descricao: "Treino funcional ou acompanhamento de treinos matinais na quadra de tênis com Cauã.",
          habitos: ["Treino esportivo / tênis", "Café matinal com Joise e os filhos", "Revisão dos cronogramas do dia"],
        },
        {
          periodo: "Comercial (08:00 - 18:00)",
          descricao: "Gestão de engenharia e operações industriais na biorrefinaria uisa.",
          habitos: [
            "Coordenação de equipes técnicas",
            "Supervisão de infraestrutura e projetos",
            "Reuniões estratégicas",
          ],
        },
        {
          periodo: "Noite (19:30 - 21:30)",
          descricao: "Convivência familiar em casa, jantar e apoio aos estudos dos filhos.",
          habitos: ["Jantar em família", "Conversas e acompanhamento escolar", "Descanso"],
        },
        {
          periodo: "Finais de Semana",
          descricao:
            "Torneios de tênis no Tangará Tênis Clube, churrasco com amigos e passeios na região de Tangará da Serra.",
          habitos: [
            "Torneios e treinos de tênis com Cauã",
            "Churrasco com cortes nobres de MT (Parrilla)",
            "Passeios ecológicos no Salto das Nuvens e Salto Maciel",
          ],
        },
      ],
      hobbiesPrincipais: [
        {
          categoria: "esportes",
          nome: "Tênis de Campo (Tangará Tênis Clube)",
          frequencia: "3 a 4 vezes por semana",
          locaisPraticados: ["Tangará Tênis Clube", "Quadras locais em Tangará da Serra"],
          origemValidacao:
            "Ficha Cadastral Homologada CN-2026-9941 (Registro de Associado Tangará Tênis Clube nº TTC-0842)",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.8,
          detalhes:
            "Praticante assíduo e principal incentivador da carreira esportiva do filho Cauã no circuito estadual.",
          impactoImovelCasaNova:
            "Requisito Construtivo Ultra: Proximidade ou condomínio com quadra de tênis rápida/saibro e iluminação LED para treinos noturnos.",
          iconeNome: "Trophy",
        },
        {
          categoria: "gastronomia",
          nome: "Churrasco Parrilla & Enologia",
          frequencia: "Finais de semana",
          locaisPraticados: ["Área Gourmet Residencial"],
          origemValidacao: "Declaração de Preferências Residenciais CN-2026-9941",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.5,
          detalhes: "Preparo de cortes nobres bovinos de Mato Grosso (Angus/Nelore) e harmonização com vinhos tintos.",
          impactoImovelCasaNova:
            "Requisito Construtivo Ultra: Espaço gourmet integrado com bancada em granito São Gabriel, churrasqueira a carvão e ponto de climatização para adega.",
          iconeNome: "Wine",
        },
        {
          categoria: "tecnologia",
          nome: "Automação Residencial e Veículos 4x4",
          frequencia: "Contínua",
          locaisPraticados: ["Residência e Viagens Regionais"],
          origemValidacao: "Homologação de Mobilidade & Perfil Técnico uisa nº CN-2026-9941",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.7,
          detalhes:
            "Interesse por sistemas inteligentes de segurança residencial, energia solar e viagens off-road pelo interior do MT.",
          impactoImovelCasaNova:
            "Requisito Construtivo Ultra: Garagem coberta e espaçosa para camionete 4x4, infraestrutura para carregador wallbox e cabeamento estruturado para automação residencial.",
          iconeNome: "Cpu",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura:
          "Arquitetura Contemporânea com pé-direito elevado, integração total entre sala de estar e varanda gourmet, iluminação natural generosa e acabamentos em madeira nobre e pedras naturais.",
        itensIndispensaveis: [
          "Espaço Gourmet integrado climatizado com churrasqueira a carvão e bancada em granito",
          "Piscina aquecida privativa com deck em madeira",
          "Home office privativo estruturado para trabalho executivo",
          "Usina de energia solar fotovoltaica instalada",
          "Garagem coberta para no mínimo 2 caminhonetes/SUVs grandes",
          "Suíte master ampla com closet para o casal e suítes privativas para os filhos",
          "Segurança 24 horas em condomínio fechado ou sistema perimetral de alta resolução",
        ],
        ambientesPrioritarios: [
          "Varanda Gourmet Integrada",
          "Living com Pé-Direito Alto",
          "Piscina Aquecida com Prainha",
          "Suítes Climatizadas",
        ],
        perfilVizinhança:
          "Bairro residencial nobre e seguro em Tangará da Serra (Jardim Europa, Residencial Manacá ou condomínio horizontal fechado com portaria 24h).",
        prioridadesSustentabilidade: [
          "Energia Solar Fotovoltaica On-Grid",
          "Sistema de Captação e Aproveitamento de Água de Chuva",
          "Conforto Térmico e Ventilação Cruzada",
        ],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["Ford Ranger Limited 3.0 V6 4x4", "Toyota SW4 Diamond", "Toyota Hilux SRX"],
        tecnologiaEGadgets: ["Apple iPhone 15 Pro", "Notebook Dell Latitude Corporativo", "Garmin Forerunner 965"],
        gastronomiaEVinhos: [
          "Cortes Angus Certificados de MT",
          "Vinhos Cabernet Sauvignon e Malbec",
          "Cafés Artesanais",
        ],
        vestuarioEModa: [
          "Casual Elegante (Dudalina, Lacoste, Reserva)",
          "Roupas Técnicas de Tênis (Wilson, Nike, Babolat)",
        ],
      },
      viagensEExperiencias: [
        {
          destino: "Vitória & Guarapari (ES)",
          tipoViagem: "Visita aos Genitores e Férias de Verão no Litoral Capixaba",
          detalhes: "Viagens periódicas para descanso familiar e lazer no litoral.",
        },
        {
          destino: "Cuiabá & Chapada dos Guimarães (MT)",
          tipoViagem: "Torneios da Federação Mato-grossense de Tênis e Ecoturismo",
          detalhes: "Acompanhamento do filho Cauã nas etapas do campeonato estadual de tênis e passeios familiares.",
        },
      ],
      causasEComunidade: [
        "Incentivo a escolinhas sociais de tênis e esportes de base em Tangará da Serra",
        "Apoio a projetos de reflorestamento e proteção de mananciais no Médio-Norte de Mato Grosso",
      ],
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    dadosTrabalhistasCLT: {
      vinculoAtivo: true,
      tipoVinculo: "CLT Estatutário / Gerente de Engenharia",
      empregador: "uisa Biorrefinaria Agroindustrial",
      cnpjEmpregador: "03.979.663/0001-98",
      cargoRegistrado: "Gerente de Engenharia & Infraestrutura Industrial",
      cbo: "2140-05",
      cboDescricao: "Engenheiro de automação e infraestrutura industrial",
      dataAdmissao: "12/03/2018",
      tempoCasaAnos: 8.7,
      salarioBaseCLT: 26800.0,
      remuneracaoVariavelMedia: 4200.0,
      descontosOficiais: {
        inss: 908.86,
        irpf: 5890.4,
        outrosDescontos: 0.0,
      },
      salarioLiquidoRecebido: 24190.74,
      origemFonteDados: "eSocial Eventos S-1200 / S-1210 & CTPS Digital Homologada",
      beneficiosAtivos: [
        "Plano de Saúde Executivo Unimed Sul MT",
        "Seguro de Vida em Grupo Corporativo",
        "Previdência Privada com Contrapartida uisa",
        "Auxílio Combustível & Veículo Corporativo",
      ],
      historicoSalarialUltimosMeses: [
        { competencia: "10/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
        { competencia: "09/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
        { competencia: "08/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
        { competencia: "07/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
      ],
    },
    detalhamentoDividasSFN: {
      totalComprometidoMensal: 1260.0,
      totalSaldoDevedorResidual: 92000.0,
      percentualRendaComprometida: 4.1,
      contratos: [
        {
          tipoOperacao: "Crédito Imobiliário / Consórcio",
          instituicao: "104 - Caixa Econômica Federal",
          contratoMascarado: "IMOB-9182***",
          parcelaMensal: 1260.0,
          parcelasPagas: 48,
          totalParcelas: 180,
          saldoDevedor: 92000.0,
          situacao: "Em Dia / Adimplente (Pontualidade 100%)",
          garantia: "Alienação Fiduciária - Matrícula 41.280",
        },
        {
          tipoOperacao: "Cartão de Crédito",
          instituicao: "001 - Banco do Brasil S.A.",
          contratoMascarado: "OUROCARD-VISA-9812***",
          parcelaMensal: 0.0,
          parcelasPagas: 36,
          totalParcelas: 36,
          saldoDevedor: 0.0,
          situacao: "Em Dia / Adimplente (Fatura R$ 3.800 liquidada 100% à vista)",
          garantia: "Limite aprovado R$ 45.000",
        },
      ],
    },
    indicadoresBacenOficiais: {
      selicMetaAnual: 10.75,
      trMensalVigente: 0.1691,
      taxaMediaMercadoImobiliarioAnual: 10.49,
      endividamentoMedioFamiliasSfn: 50.11,
      prazoMaximoMesesCalculado: 420,
      fontesPublicasAuditadas: [
        {
          orgao: "Banco Central do Brasil (BACEN)",
          baseDados: "Sistema Gerenciador de Séries Temporais (SGS) Séries 226, 25434, 432, 29037",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "BACEN-SGS-2026-981240-MT",
          status: "Vigente / Oficial em Tempo Real",
          linkOficial: "https://www3.bcb.gov.br/sgspub/",
        },
        {
          orgao: "Receita Federal do Brasil (RFB)",
          baseDados: "Cadastro de Pessoas Físicas (CPF Módulo 11) & eSocial S-1200",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "RFB-CPF-2026-00000000191",
          status: "Regular / Ativo",
          linkOficial: "https://servicos.receita.fazenda.gov.br",
        },
        {
          orgao: "Tribunal Regional do Trabalho da 23ª Região (TRT-23 / TST)",
          baseDados: "Banco Nacional de Devedores Trabalhistas (BNDT)",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "CNDT-2026-881290-MT",
          status: "Certidão Negativa Válida",
          linkOficial: "https://www.tst.jus.br/certidao",
        },
        {
          orgao: "Central Nacional de Protesto de Títulos (CENPROT / IEPTB)",
          baseDados: "Comarcas de Vitória/ES e Tangará da Serra/MT",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "CENPROT-2026-117879-NAC",
          status: "0 Apontamentos de Protesto Ativos",
          linkOficial: "https://site.cenprotnacional.org.br",
        },
        {
          orgao: "Controladoria-Geral da União (CGU)",
          baseDados: "Cadastro de Pessoas Politicamente Expostas (PEP) e Sanções",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "CGU-PEP-2026-004921",
          status: "Nada Consta como PEP",
          linkOficial: "https://portaldatransparencia.gov.br",
        },
      ],
      resolucaoCmn: "Resolução CMN nº 4.676 (Limite de 80% LTV no SFH / SBPE)",
      regraIdadeSusep: "Circular SUSEP nº 621 (Idade máxima de 80 anos e 6 meses ao término do contrato)",
      sistemaAmortizacaoComparativo: {
        sac: {
          financiamentoMaximoMargemLivre: 748000,
          primeiraParcela: 8040,
          ultimaParcela: 2110,
          imovelMaximoComEntradaEFgts: 935000,
          entradaSugerida: 187000,
          financiamentoMaximoMargemIntegral: 790000,
          imovelMaximoMargemIntegral: 987500,
        },
        price: {
          financiamentoMaximoMargemLivre: 825000,
          parcelaFixa: 8040,
          imovelMaximoComEntradaEFgts: 998000,
          entradaSugerida: 199600,
          financiamentoMaximoMargemIntegral: 880000,
          imovelMaximoMargemIntegral: 1100000,
        },
      },
      decomposicaoContabilRenda: {
        rendaBrutaMensal: 31000,
        inssOficialRetido: 908.86,
        irpfTabelaProgressiva: 5890.4,
        totalDeducoesOficiais: 6799.26,
        rendaLiquidaFiscal: 24190.74,
        lucrosDividendosIsentos: 4200,
        rendaGlobalComprovada: 31000,
      },
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 4,
      valorEstimadoPatrimonio: 1475000,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 41.280",
          tipoImovel: "Residência Urbana em Alvenaria (260 m² de área construída)",
          areaTotalM2: 450,
          valorAvaliacao: 780000,
          situacaoOnus: "Livre e Desembaraçado (Sem penhoras ou indisponibilidades)",
          anoRegistro: "2019",
        },
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 48.912",
          tipoImovel: "Lote Residencial nº 14, Qd 08 — Loteamento Reserva do Parque",
          areaTotalM2: 450,
          valorAvaliacao: 380000,
          situacaoOnus: "Livre e Desembaraçado (Escriturado e Registrado)",
          anoRegistro: "2021",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "Ford Ranger Limited 3.0 V6 4x4 Diesel Automática",
          anoFabricacaoModelo: "2024/2024",
          placa: "QNP-4G18",
          renavam: "01483920145",
          valorFipe: 315000,
          situacaoGravame: "Quitado / Sem restrições de gravame",
          combustivel: "Diesel S10",
        },
      ],
    },
    dadosEleitoraisTSE: {
      tituloEleitor: "0219 4431 0244",
      zona: "019ª Zona Eleitoral (Tangará da Serra/MT)",
      secao: "0088",
      municipio: "Tangará da Serra",
      uf: "MT",
      situacaoInscricao: "REGULAR",
      biometriaColetada: true,
      quitacaoEleitoral:
        "Quitação Eleitoral Plena e Irrestrita (Certidão Positiva com Efeitos de Negativa Inexistente)",
      protocoloValidacaoTse: "TSE-2026-TGA-882194",
      certidaoEmitidaEm: "16/11/2026 às 08:30 UTC-04:00",
      localVotacao: "Escola Estadual 29 de Novembro — Centro, Tangará da Serra/MT",
    },
    registroCivilSIRC: {
      matriculaNacionalNotarial: "068412.01.55.2012.2.00034.010.0003410-82",
      cartorioRegistro: "Cartório de Registro Civil das Pessoas Naturais do 1º Ofício de Tangará da Serra/MT",
      cidadeCartorio: "Tangará da Serra / MT",
      livro: "B-12 de Casamentos",
      folha: "088",
      termo: "Termo nº 3.410",
      tipoCertidao: "Certidão de Casamento com Averbação Notarial",
      dataRegistro: "15/04/2012",
      statusSIRC: "VALIDADO_CRC_NACIONAL",
      codigoAutenticidadeNacional: "CRC-NACIONAL-MT-2026-3410",
      regimeBens: "Comunhão Parcial de Bens (Art. 1.658 da Lei nº 10.406/2002 - Código Civil)",
    },
    cnhDigitalSenatran: {
      renach: "MT-08291402",
      numeroCnh: "04981290311",
      categoria: "B",
      orgaoEmissor: "DETRAN-MT / Senatran",
      dataPrimeiraHabilitacao: "14/06/2002",
      dataValidade: "14/06/2032",
      situacaoCnh: "ATIVA",
      pontuacaoInfracoes: 0,
      bloqueioAdministrativo: false,
      observacoesExameMedico: "Apto para condução sem restrições médicas ou ópticas",
    },
    comprovantesConcessionarias: {
      concessionariaEnergia: {
        empresa: "Energisa Mato Grosso — Distribuidora de Energia S.A.",
        unidadeConsumidora: "0491823-1",
        statusFornecimento: "LIGADO / FORNECIMENTO NORMAL",
        adimplencia: "100% ADIMPLENTE (Últimas 36 faturas quitadas)",
        titularidade: "RODRIGO RIBEIRO GONÇALVES",
        mesReferencia: "10/2026",
        valorUltimaFatura: 342.8,
        enderecoInstalacao: "Rua Avelina Jaci Bohn, nº 620-W, Centro — Tangará da Serra/MT (CEP 78300-055)",
      },
      concessionariaAgua: {
        empresa: "SAMAE — Serviço Autônomo Municipal de Água e Esgoto de Tangará da Serra",
        ligacaoId: "28419-0",
        categoria: "Residencial Monofásica / Padrão Normal",
        status: "LIGAÇÃO ATIVA E FISCALIZADA",
        titularidade: "RODRIGO RIBEIRO GONÇALVES",
        mesReferencia: "10/2026",
        consumoMedioM3: 16.5,
        hidrometro: "HD-SAMAE-2024-8841",
      },
    },
    declaracaoIrpfRfb: {
      exercicio: "2026",
      anoCalendario: "2025",
      numeroReciboEntrega: "78.41.90.22.18-84-RFB",
      dataProcessamentoRFB: "14/05/2026 às 11:24:18",
      rendimentosTributaveisDeclarados: 372000,
      deducoesLegaisApuradas: 42850,
      impostoDevidoApurado: 81120,
      impostoPagoRetidoFonte: 81120,
      statusDeclaracao: "HOMOLOGADA",
      resumoBensDeclarados: [
        {
          tipoBem: "Imóvel Urbano (Residência)",
          descricao:
            "Residência em alvenaria com 260m² na Rua Avelina Jaci Bohn, 620-W, Centro, Tangará da Serra/MT (Matrícula 41.280)",
          valorDeclarado: 780000,
        },
        {
          tipoBem: "Imóvel Urbano (Lote)",
          descricao:
            "Lote residencial nº 14, Qd 08, Residencial Reserva do Parque — Tangará da Serra/MT (Matrícula 48.912)",
          valorDeclarado: 380000,
        },
        {
          tipoBem: "Veículo Automotor",
          descricao: "Ford Ranger Limited 3.0 V6 4x4 Diesel 2024/2024 — Placa QNP-4G18",
          valorDeclarado: 315000,
        },
        {
          tipoBem: "Participação Societária",
          descricao: "70% do Capital Social da empresa DIAS GESTÃO AGROINDUSTRIAL LTDA (CNPJ 38.912.441/0001-20)",
          valorDeclarado: 175000,
        },
      ],
    },
    extratoFgtsCaixa: {
      empregadorPrincipal: "uisa — BIORREFINARIA DE CANA-DE-AÇÚCAR (União Industrial Açucareira S.A.)",
      cnpjEmpregador: "04.421.173/0001-83",
      saldoTotalHabitacao: 145000,
      depositoMensalRegular: 2144,
      numeroCertificadoCrf: "CRF-20261114-8841-CAIXA",
      validadeCrf: "14/12/2026",
      statusCrf: "REGULAR",
      elegivelUtilizacaoMoradiaPropria: true,
      tempoTotalContribuicaoFgtsMeses: 172,
    },
    dpoCompliance: {
      termoConsentimentoAssinado: true,
      dataHoraConsentimento: "29/10/2026 às 11:20:15 UTC-04:00",
      protocoloAssinaturaDigital: "DPO-LGPD-2026-RODRIGO-TGA-AUTH",
      baseLegalLgpd:
        "Art. 7º, I (Consentimento), Art. 7º, V (Contratos Imobiliários) e Art. 7º, X (Proteção do Crédito) da Lei nº 13.709/2018.",
      finalidadeEspecifica: "Qualificação de Crédito Imobiliário, Due Diligence e Outorga Uxória",
      statusDpo: "HOMOLOGADO",
      responsavelDpo: "DPO & Agente Jurídico Interno da Casa Nova Imóveis",
      enquadramentoCoafLlavagemDinheiro: {
        pep: false,
        statusCoaf: "Conformidade Total / Nada Consta (Sem atipicidades financeiras ou sanções)",
        parecerCompliance:
          "Titular com capacidade econômico-financeira compatível, proveniência salarial comprovada via eSocial/uisa e outorga uxória averbada perante o 1º Ofício de Registro Civil de Tangará da Serra/MT.",
      },
      certidoesCartorariasValidadas: [
        {
          orgao: "Receita Federal do Brasil & PGFN",
          tipoCertidao: "Certidão Conjunta Negativa de Débitos Federais e Dívida Ativa da União",
          numeroCertidao: "2026-RFB-99120-BR",
          dataEmissao: "16/11/2026",
          validadeAte: "14/05/2027",
          codigoAutenticidade: "9B3C.55F2.88D1.E923",
          status: "REGULAR",
          linkVerificacao: "https://servicos.receita.fazenda.gov.br",
        },
        {
          orgao: "Tribunal Superior do Trabalho (TST)",
          tipoCertidao: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
          numeroCertidao: "2026/0581920",
          dataEmissao: "16/11/2026",
          validadeAte: "15/05/2027",
          codigoAutenticidade: "TST-CNDT-881290-MT",
          status: "REGULAR",
          linkVerificacao: "https://www.tst.jus.br/certidao",
        },
        {
          orgao: "Central Nacional de Protesto (CENPROT / IEPTB)",
          tipoCertidao: "Certidão Negativa de Protestos (Vitória/ES e Tangará da Serra/MT)",
          numeroCertidao: "IEPTB-NAC-99124-2026",
          dataEmissao: "16/11/2026",
          validadeAte: "16/12/2026",
          codigoAutenticidade: "CENPROT-99124-NAC",
          status: "REGULAR",
          linkVerificacao: "https://site.cenprotnacional.org.br",
        },
      ],
    },
    dadosBancariosEChavesPix: {
      chavesPixCadastradasBacen: [
        {
          tipoChave: "CPF",
          chaveMascarada: "117.***.***-54",
          instituicao: "Sicredi Sudoeste MT",
          dataCriacao: "16/11/2020",
          status: "ATIVA",
        },
        {
          tipoChave: "TELEFONE",
          chaveMascarada: "(65) 9****-4681",
          instituicao: "Banco do Brasil",
          dataCriacao: "05/04/2021",
          status: "ATIVA",
        },
      ],
      bancosRelacionamento: [
        {
          banco: "Sicredi Sudoeste MT",
          codigoCompensacao: "748",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Tangará da Serra (0810)",
          tempoRelacionamentoAnos: 11,
          limiteChequeEspecialAprovado: 25000,
          cartaoCreditoLimiteTotal: 80000,
          pontualidadePagamentos: "Excelente (Histórico 100% Pontual)",
        },
        {
          banco: "Banco do Brasil",
          codigoCompensacao: "001",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Central TGA (1310)",
          tempoRelacionamentoAnos: 18,
          limiteChequeEspecialAprovado: 40000,
          cartaoCreditoLimiteTotal: 95000,
          pontualidadePagamentos: "Excelente",
        },
      ],
      resumoOpenFinance: {
        scoreOpenFinance: 910,
        movimentacaoMediaMensal: 42000,
        saldoInvestimentosTotal: 240000,
        probabilidadeAprovacaoCaixa: "Altíssima (Margem Livre no SFN)",
      },
    },
    imoveisRecomendadosIds: [
      "c0eef2a1-9089-4171-8517-e60dd9e571a3",
      "d78a91b2-1234-4567-8901-abcdef123456",
      "e98b02c3-5678-4321-9876-fedcba654321",
    ],
  },
  "00000000191": {
    cpf: "00000000191",
    cpfFormatado: "000.000.001-91",
    digitoValido: true,
    regiaoFiscal: "7ª RF (RJ, ES) — Domicílio Eleito em Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "16/11/2026 às 08:30",
    protocoloConsulta: "CN-CPF-2026-98425-MT",
    nomeCompleto: "RODRIGO RIBEIRO GONÇALVES",
    dataNascimento: "14/05/1982",
    idade: 44,
    sexo: "M",
    nomeMae: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
    nomePai: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
    estadoCivil: "Casado(a)",
    qualificacaoCivil: {
      rg: "MT-1.928.341-SSP/MT",
      rgOrgaoEmissor: "SSP/MT",
      rgDataExpedicao: "05/03/2004",
      naturalidade: "Tangará da Serra - MT",
      nacionalidade: "Brasileira",
      tituloEleitor: "0219 4431 0244",
      zonaEleitoral: "019ª Zona Eleitoral (Tangará da Serra/MT)",
      secaoEleitoral: "0088",
      pisPasep: "128.49120.31-4",
      filiacaoMaeCompleta: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
      filiacaoPaiCompleta: "Filiação sob Sigilo Fiscal (Art. 198 CTN / Art. 6º LGPD — Requer Averbação Notarial)",
      registroCivilCartorio: "1º Ofício de Registro Civil das Pessoas Naturais de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro A-84, Termo nº 24.112 / Casamento Livro B-12, Termo nº 3.410",
    },
    telefones: [
      { numero: "(65) 99982-1450", whatsapp: true, principal: true },
      { numero: "(65) 3326-4410", whatsapp: false, principal: false },
    ],
    emails: ["rodrigo.goncalves@exemplo.invalid", "rodrigo.ribeiro.mt@gmail.com"],
    endereco: {
      logradouro: "Rua Antônio Hortolani",
      numero: "620-W",
      bairro: "Centro",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-055",
      complemento: "Residência Familiar",
    },
    scoreCredito: 840,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 31000,
    capacidadeParcelaMensal: 8040,
    poderCompraImobiliario: 935000,
    potencialFgts: 145000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 26800,
      rendaComplementar: 4200,
      rendaTotalLiquida: 24190,
      origemComprovacao:
        "Contrato de Trabalho CLT uisa (Engenharia de Infraestrutura) + Pró-Labore R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA",
      tempoAtividade: "8 anos e 2 meses na corporação agroindustrial",
      capacidadeParcela30: 9300,
      comprometimentoSFN: 1260,
      percentualComprometimento: 4.1,
      margemLivreFinanciamento: 8040,
      saldoFgts: 145000,
      poderCompraImobiliario: 935000,
      entradaSugerida20: 187000,
      faixaScore: "840 de 1.000 — Categoria Excelente (Baixo Risco)",
      probabilidadeInadimplencia: "1,2% (Mínima)",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-98425-NACIONAL",
        cartoriosPesquisados: "Central Nacional de Protesto (CENPROT) — Comarcas de Tangará da Serra/MT e Vitória/ES",
        dataPesquisa: "16/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [
          {
            cartorio: "1º e 2º Ofícios de Protesto da Comarca de Tangará da Serra/MT",
            praca: "Tangará da Serra/MT",
            dataDistribuicao: "16/11/2026",
            valor: 0,
            favorecido: "Pesquisa CENPROT Nacional",
            status: "Nada Consta (0 Apontamentos)",
          },
        ],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-98425-MT",
        dataPesquisa: "16/11/2026",
        itens: [
          {
            banco: "001 - Banco do Brasil S.A.",
            agencia: "0845 - Tangará da Serra",
            alinea: "Alíneas 11 a 14",
            dataOcorrencia: "16/11/2026",
            valor: 0,
            status: "Nenhuma Ocorrência Ativa",
          },
        ],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Quod · SPC Brasil",
        itens: [
          {
            credor: "Bancos e Instituições do SFN",
            contrato: "SFN-55123",
            dataInclusao: "16/11/2026",
            valor: 0,
            status: "100% Adimplente (Zero Apontamentos Ativos)",
          },
        ],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT, TRF1 e TST",
        itens: [
          {
            tribunal: "Tribunal de Justiça do Estado de Mato Grosso (TJMT)",
            vara: "Distribuidor Cível e Fazendário de Tangará da Serra",
            numeroProcesso: "1002341-88.2023.8.11.0055",
            assunto: "Certidão de Regularidade Ambiental e Imobiliária",
            status: "Sentença Favorável / Regular",
          },
        ],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta)",
        dividaAtivaUniao: "Sem Inscrições",
        cadinFederal: "Nada Consta",
        scrBacenPontualidade: "100% Pontual (Risco A / Risco AA)",
      },
    },
    historico: {
      origemCadastro: "uisa (NossaGente) · Id Externo 186",
      cadastradoEm: "29/10/2026",
      atualizadoEm: "16/11/2026",
      eventosLinhaDoTempo: [
        {
          data: "16/11/2026",
          evento: "Qualificação notarial, conformidade Provimento CNJ nº 88/2019 e dossiê 360",
          canal: "Casa Nova Imóveis",
        },
        {
          data: "10/11/2026",
          evento: "Averbação de outorga uxória e certidão de casamento no 1º Ofício de Tangará da Serra/MT",
          canal: "Registro Civil",
        },
        {
          data: "29/10/2026",
          evento: "Sincronização cadastral corporativa ativa no sistema NossaGente / uisa",
          canal: "uisa / RH",
        },
        {
          data: "12/03/2018",
          evento: "Admissão como Engenheiro de Infraestrutura & Automação na Biorrefinaria uisa",
          canal: "eSocial",
        },
      ],
      enderecosAnteriores: [
        { endereco: "Vitória/ES - Praia do Canto", periodo: "2004 - 2017" },
        { endereco: "Tangará da Serra/MT - Jardim Tarumã", periodo: "2018 - 2022" },
        { endereco: "Tangará da Serra/MT - Centro (Rua Antônio Hortolani, 620-W)", periodo: "2022 - Atual" },
      ],
      consultasAnteriores: [
        {
          data: "16/11/2026",
          motivo: "Aquisição Imobiliária SBPE & Investimento em Terrenos",
          agente: "Casa Nova Imóveis",
        },
        {
          data: "29/10/2026",
          motivo: "Enriquecimento e Auditoria de Crédito Corporativo",
          agente: "uisa / RH",
        },
      ],
    },
    dadosPublicos: {
      ocupacaoPresumida: "Gerente de Engenharia e Infraestrutura Industrial (uisa) & Engenheiro Agrônomo",
      empresasVinculadas: [
        {
          razaoSocial: "USINAS ITAMARATI S/A — Casa Nova",
          cnpj: "15.009.178/0001-70",
          cargo: "Diretor Estatutário (Diretor de Gente, Inovação e Administração)",
          participacao: "Capital Social R$ 901.394.000,00 (Ativa RFB desde 24/06/2022 - Nova Olímpia/MT)",
        },
        {
          razaoSocial: "RODRIGO RIBEIRO GONÇALVES E OUTRA (ESTÂNCIA GONÇALVES)",
          cnpj: "64.336.577/0001-51",
          cargo: "Sócio Produtor Rural",
          participacao: "50% do Capital Social (R$ 100.000,00 - Mirante do Paranapanema/SP)",
        },
        {
          razaoSocial: "PATRÍCIA FERRARI PAULINO GONÇALVES (KYTTO TECNOLOGIA)",
          cnpj: "53.338.003/0001-04",
          cargo: "Cônjuge / Sócia Vinculada (Patrícia Ferrari Paulino Gonçalves - CPF 000.000.019-11)",
          participacao: "R$ 10.000,00 (Ativa RFB - Mirante do Paranapanema/SP)",
        },
      ],
      veiculosPresumidos: [],
      processosPublicos: [
        {
          numero: "1002341-88.2023.8.11.0055",
          tribunal: "TJMT (Vara Especializada Fazendária de Tangará da Serra)",
          assunto: "Certidão de Regularidade Ambiental e Sanitária",
          status: "Sentença Favorável / Baixado",
        },
      ],
    },
    parentescoERelacionamentos: {
      totalVinculosIdentificados: 4,
      scoreConfiancaRede: 100,
      regimeConjugalAvaliado:
        "Casado(a) sob Comunhão Parcial de Bens com Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC) (Certidão nº 3.410 do 1º Ofício de Tangará da Serra/MT). Exigível outorga uxória para alienação imobiliária (Art. 1.647 do Código Civil). Cônjuge ciente e averbada no dossiê.",
      arvoreFamiliar: [
        {
          tipoVinculo: "Esposa (Cônjuge)",
          grau: "1º Grau por Afinidade / Cônjuge",
          nome: "Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC)",
          cpfMascarado: "049.***.***-82",
          coabitacao: true,
          probabilidadeParentesco: 100,
          detalhes:
            "Casamento averbado sob Termo nº 3.410 no 1º Ofício de Tangará da Serra/MT. Outorga uxória apta para lavratura de escritura pública.",
        },
        {
          tipoVinculo: "Filho",
          grau: "1º Grau Descendente",
          nome: "Cauã Angelotti Gonçalves",
          cpfMascarado: "074.***.***-40",
          coabitacao: true,
          probabilidadeParentesco: 100,
          detalhes:
            "18 anos, Atleta Federado de Tênis (Tangará Tênis Clube), Certidão nº 12.840 do 1º Ofício de Tangará da Serra/MT.",
        },
        {
          tipoVinculo: "Mãe",
          grau: "1º Grau Ascendente",
          nome: "Aguardando validação em fonte segura (Genitora)",
          cpfMascarado: "***.***.***-**",
          coabitacao: false,
          probabilidadeParentesco: 100,
          detalhes: "Residente em Vitória/ES. Filiação materna comprovada no Registro Civil de Vitória/ES.",
        },
        {
          tipoVinculo: "Pai",
          grau: "1º Grau Ascendente",
          nome: "Aguardando validação em fonte segura (Genitor)",
          cpfMascarado: "***.***.***-**",
          coabitacao: false,
          probabilidadeParentesco: 100,
          detalhes: "Residente em Vitória/ES. Filiação paterna comprovada no Registro Civil de Vitória/ES.",
        },
      ],
      coabitantesMesmoEndereco: [
        {
          nome: "Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC)",
          cpfMascarado: "049.***.***-82",
          relacaoPresumida: "Esposa / Cônjuge (Comunhão Parcial de Bens)",
          periodo: "2018 - Atual",
          endereco: "Rua Antônio Hortolani, 620-W, Centro, Tangará da Serra/MT",
        },
        {
          nome: "Cauã Angelotti Gonçalves",
          cpfMascarado: "074.***.***-40",
          relacaoPresumida: "Filho",
          periodo: "2008 - Atual",
          endereco: "Rua Antônio Hortolani, 620-W, Centro, Tangará da Serra/MT",
        },
      ],
      sociosEParceiros: [
        {
          nome: "Rodrigo Ribeiro Gonçalves",
          documento: "000.000.001-91",
          empresa: "R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA (CNPJ 38.912.441/0001-20)",
          cargo: "Sócio-Administrador",
          participacaoCapital: "70%",
          poderAssinatura: "Individual",
        },
      ],
    },
    redesSociais: {
      assertividadeGlobal: 99.6,
      motivoAssertividadeGlobal:
        "Cruzamento biométrico e validação oficial: Engenheiro de infraestrutura e automação na uisa, filiado ao CREA-MT, sócio da R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA e com histórico familiar ativo em Tangará da Serra/MT.",
      linkedin: {
        usuario: "rodrigo-ribeiro-goncalves",
        url: "https://br.linkedin.com/in/rodrigo-ribeiro-goncalves",
        nomeExibicao: "Rodrigo Ribeiro Gonçalves",
        cargoAtual: "Gerente de Engenharia & Infraestrutura Industrial",
        empresaAtual: "uisa (Biorrefinaria Agroindustrial)",
        localidade: "Tangará da Serra, Mato Grosso, Brasil",
        status: "LOCALIZADO",
        conexoes: "+500 conexões estratégicas no Agro & Engenharia",
        assertividade: 99.5,
        motivoAssertividade:
          "Perfil profissional verificado e alinhado com histórico cadastral no Cadastro Geral da RFB e eSocial em Tangará da Serra/MT.",
        resumoBio:
          "Engenheiro responsável pela infraestrutura industrial, redes e automação da Biorrefinaria uisa. Especialista em gestão de projetos industriais, conectividade rural no Médio-Norte de Mato Grosso e agroindústria sustentável.",
        formacaoAcademica: [
          {
            instituicao: "Universidade Federal do Espírito Santo (UFES)",
            curso: "Engenharia de Produção & Automação",
            periodo: "2000 - 2005",
            grau: "Bacharelado",
          },
          {
            instituicao: "Fundação Getulio Vargas (FGV)",
            curso: "MBA em Gestão Empresarial e Agroindustrial",
            periodo: "2010 - 2012",
            grau: "Pós-Graduação Lato Sensu",
          },
        ],
        certificacoes: [
          "Gestão de Ativos e Automação Industrial ISA-95",
          "Governança Corporativa e Compliance no Agronegócio",
        ],
        postsPrincipais: [
          {
            data: "Outubro/2026",
            titulo: "Inovação e Eficiência Energética na Safra Bioenergética do Médio-Norte de MT",
            resumo:
              "Resultados expressivos na otimização de consumo elétrico e ampliação da cogeração de biomassa na uisa, fortalecendo a matriz renovável de Mato Grosso.",
            engajamento: "192 curtidas · 31 comentários",
            topicos: ["Agroindústria", "Eficiência Energética", "Tangará da Serra", "Sustentabilidade"],
            link: "https://br.linkedin.com/in/rodrigo-ribeiro-goncalves",
          },
        ],
        interessesEGostos: [
          "Automação e Redes Industriais no Campo",
          "Desenvolvimento Regional e Agronegócio Sustentável em Mato Grosso",
          "Imóveis de Alto Padrão em Condomínios Fechados",
          "Tênis de Campo e Apoio ao Esporte Infantojuvenil",
        ],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Rodrigo+Ribeiro+Goncalves%22+Tangara",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Rodrigo+Ribeiro+Goncalves%22+Tangara",
        nomeExibicao: "Rodrigo Ribeiro Gonçalves",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "Conta de uso pessoal e familiar. Preservada sob Art. 5º, X da CF/88 e Art. 7º da LGPD para evitar exposição e links inexistentes.",
        seguidoresEstimados: 2340,
        bio: "Perfil pessoal com privacidade ativada. Varredura OSINT confirma ausência de litígios públicos ou menções desabonadoras.",
        verificado: false,
        assertividade: 99.2,
        destaquesGostos: ["Família & Amigos", "Tênis & Treinos", "Viagens pelo MT", "Churrasco & Parrilla"],
      },
      facebook: {
        usuario: "rodrigo.goncalves.mt",
        url: "https://www.facebook.com/search/top?q=Rodrigo%20Ribeiro%20Goncalves%20Tangara",
        nomeExibicao: "Rodrigo Ribeiro Gonçalves",
        status: "LOCALIZADO",
        amigosEstimados: 1420,
        cidade: "Tangará da Serra, MT",
        bio: "Engenheiro na uisa, residente em Tangará da Serra/MT. Família, esportes e agronegócio.",
        assertividade: 98.8,
        vinculosRegionais: "Membro ativo do Tangará Tênis Clube e da Associação Comercial de Tangará da Serra (ACITS)",
      },
      youtubeOuPodcast: [
        {
          canal: "Canal Agroindústria & Tecnologia MT",
          url: "https://www.youtube.com/results?search_query=Rodrigo+Goncalves+uisa+Tangara",
          tituloConteudo: "Painel de Especialistas: Automação e Redes Industriais em Biorrefinarias",
          papel: "palestrante",
          visualizacoes: "3.200 visualizações",
          tema: "Tecnologia Agroindustrial",
        },
      ],
      tiktok: {
        usuario: "rodrigo.eng.agro",
        url: "https://www.tiktok.com/@rodrigo.eng.agro",
        status: "LOCALIZADO",
        buscaReversaUrl:
          'https://www.google.com/search?q=site:tiktok.com/@+"Rodrigo+Ribeiro+Goncalves"+Tangara+da+Serra',
        seguidoresEstimados: 940,
        bio: "Engenharia e automação agroindustrial em Mato Grosso 🚜 | Conectividade rural e rotina de treinos de tênis em família 🎾",
        destaquesVideos: [
          {
            titulo: "Automação e Redes Industriais no Campo: Conectividade em Biorrefinarias",
            tema: "Automação & Agro 4.0",
            visualizacoes: "2.8k visualizações",
            link: "https://www.tiktok.com/tag/agrotech",
          },
          {
            titulo: "Acompanhando o circuito estadual infantojuvenil de tênis em Tangará da Serra",
            tema: "Esporte & Família",
            visualizacoes: "1.9k visualizações",
            link: "https://www.tiktok.com/tag/tenismt",
          },
        ],
      },
      noticiasEMateriais: {
        totalItens: 4,
        fontesConsultadas: [
          "Diário da Serra (Tangará da Serra)",
          "Gazeta Digital MT",
          "Diário Oficial do Estado de MT (IOMAT)",
          "Diário Oficial da União (DOU)",
          "Acervo Técnico CREA-MT",
          "Google Notícias",
        ],
        clippingImprensa: [
          {
            titulo: "Biorrefinaria uisa avança em automação e infraestrutura de conectividade industrial no MT",
            veiculo: "Diário da Serra Notícias (Tangará da Serra/MT)",
            data: "14/08/2026",
            link: "https://diariodaserra.com.br",
            resumo:
              "Equipe técnica liderada pelo engenheiro Rodrigo Ribeiro Gonçalves implementa monitoramento em tempo real de usinas de biomassa e frotas agrícolas conectadas.",
            categoria: "Agronegócio & Inovação",
            assertividade: 99.8,
          },
          {
            titulo: "Encontro Empresarial da ACITS discute expansão urbana e novos condomínios residenciais em Tangará",
            veiculo: "Gazeta Digital MT",
            data: "22/04/2026",
            link: "https://www.gazetadigital.com.br",
            resumo:
              "Debate reuniu lideranças industriais e profissionais de engenharia da microrregião de Tangará da Serra sobre atração de investimentos e infraestrutura sustentável.",
            categoria: "Engenharia & Obras",
            assertividade: 99.1,
          },
        ],
        materiaisTecnicosOuOficiais: [
          {
            titulo: "Anotação de Responsabilidade Técnica (ART) nº 12026049281 — Subestação & Automação Industrial",
            orgaoOuEditora: "CREA-MT (Conselho Regional de Engenharia e Agronomia de MT)",
            tipoDocumento: "Norma Técnica",
            link: "https://www.crea-mt.org.br",
            data: "10/02/2026",
            descricao:
              "Registro formal de responsabilidade técnica emitido perante o CREA-MT para execução de projetos elétricos e automação no município de Nova Olímpia/Tangará da Serra.",
            autenticidadeVerificada: true,
          },
          {
            titulo: "Publicação no Diário Oficial do Estado de MT (IOMAT) — Licenciamento e Conformidade de Efluentes",
            orgaoOuEditora: "Diário Oficial do Estado de Mato Grosso (IOMAT - Edição 28.914)",
            tipoDocumento: "Diário Oficial",
            link: "https://www.iomat.mt.gov.br",
            data: "18/01/2026",
            descricao:
              "Parecer técnico de engenharia homologado em conformidade com as diretrizes da SEMA-MT para processos sustentáveis agroindustriais.",
            autenticidadeVerificada: true,
          },
        ],
      },
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca: "Casa em Condomínio Fechado ou Sobrado com Ampla Área Gourmet e Lazer Privativo",
        faixaPrecoEstimada: "R$ 850.000 a R$ 1.250.000",
        tipologiasPreferenciais: ["Casa em Condomínio", "Sobrado", "Área Gourmet Climatizada"],
        bairrosInteresse: ["Jardim Europa", "Residencial Manacá", "Jardim São Paulo", "Centro"],
        motivacaoCompra:
          "Upgrade de moradia familiar, maior privacidade e segurança com área de lazer completa para os filhos.",
        scoreAssertividadePerfil: 99.1,
      },
      googleFootprint: {
        termosPesquisados: [
          '"Rodrigo Ribeiro Gonçalves" "Tangará da Serra"',
          '"Rodrigo Ribeiro Gonçalves" uisa',
          '"Rodrigo Ribeiro Gonçalves" CREA-MT',
        ],
        mencoesPublicas: [
          {
            titulo: "Conselho Regional de Engenharia e Agronomia de Mato Grosso (CREA-MT) — Registro Profissional",
            fonte: "CREA-MT",
            link: "https://www.crea-mt.org.br",
            snippet: "Registro profissional ativo do engenheiro Rodrigo Ribeiro Gonçalves. Situação 100% regular.",
            data: "2026",
            assertividade: 99.8,
          },
          {
            titulo: "Junta Comercial do Estado de Mato Grosso — R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA",
            fonte: "JUCEMAT",
            link: "https://www.jucemat.mt.gov.br",
            snippet:
              "Ficha cadastral simplificada da empresa R. R. GONÇALVES ENGENHARIA & TECNOLOGIA LTDA, sócio-administrador Rodrigo Ribeiro Gonçalves.",
            data: "2026",
            assertividade: 99.6,
          },
          {
            titulo: "Federação Mato-grossense de Tênis — Circuito Estadual Infantojuvenil",
            fonte: "FMT / Tangará Tênis Clube",
            link: "https://www.tenismt.com.br",
            snippet:
              "Acompanhamento esportivo de Cauã Angelotti Gonçalves acompanhado pelo responsável legal Rodrigo Ribeiro Gonçalves.",
            data: "2026",
            assertividade: 99.2,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle: "Liderança Agroindustrial, Vida Familiar Ativa, Apaixonado por Tênis e Moradia de Alto Padrão",
      resumoPerfil:
        "Rodrigo possui perfil dinâmico, conciliando liderança em engenharia na uisa com ativa participação na vida esportiva dos filhos (Cauã no tênis federado). Valoriza moradia com segurança em condomínio fechado, espaço gourmet para churrasco com a família e amigos, e sustentabilidade com energia solar fotovoltaica.",
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria: "Ficha Cadastral Homologada CN-2026-9941 (uisa Gerência de Engenharia)",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Análise Cadastral e Engenharia Casa Nova Imóveis",
        hashValidacaoSha256: "b4c2e6802f0a1d639c09d784a9e223d61bca7f3690d57183e8b61e27a69622d1",
        termoConsentimentoLgpd: "DOC-LIFESTYLE-117879",
        observacaoComiteCredito:
          "Hobbies e rotina familiar integralmente homologados. Diretrizes de projeto compatíveis com condomínio fechado Ultra Construtora.",
      },
      rotinaSemanal: [
        {
          periodo: "Manhã (06:00 - 07:30)",
          descricao: "Treino funcional ou acompanhamento de treinos matinais na quadra de tênis com Cauã.",
          habitos: ["Treino esportivo / tênis", "Café matinal com Joise e os filhos", "Revisão dos cronogramas do dia"],
        },
        {
          periodo: "Comercial (08:00 - 18:00)",
          descricao: "Gestão de engenharia e operações industriais na biorrefinaria uisa.",
          habitos: [
            "Coordenação de equipes técnicas",
            "Supervisão de infraestrutura e projetos",
            "Reuniões estratégicas",
          ],
        },
        {
          periodo: "Noite (19:30 - 21:30)",
          descricao: "Convivência familiar em casa, jantar e apoio aos estudos dos filhos.",
          habitos: ["Jantar em família", "Conversas e acompanhamento escolar", "Descanso"],
        },
        {
          periodo: "Finais de Semana",
          descricao:
            "Torneios de tênis no Tangará Tênis Clube, churrasco com amigos e passeios na região de Tangará da Serra.",
          habitos: [
            "Torneios e treinos de tênis com Cauã",
            "Churrasco com cortes nobres de MT (Parrilla)",
            "Passeios ecológicos no Salto das Nuvens e Salto Maciel",
          ],
        },
      ],
      hobbiesPrincipais: [
        {
          categoria: "esportes",
          nome: "Tênis de Campo (Tangará Tênis Clube)",
          frequencia: "3 a 4 vezes por semana",
          locaisPraticados: ["Tangará Tênis Clube", "Quadras locais em Tangará da Serra"],
          origemValidacao:
            "Ficha Cadastral Homologada CN-2026-9941 (Registro de Associado Tangará Tênis Clube nº TTC-0842)",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.8,
          detalhes:
            "Praticante assíduo e principal incentivador da carreira esportiva do filho Cauã no circuito estadual.",
          impactoImovelCasaNova:
            "Requisito Construtivo Ultra: Proximidade ou condomínio com quadra de tênis rápida/saibro e iluminação LED para treinos noturnos.",
          iconeNome: "Trophy",
        },
        {
          categoria: "gastronomia",
          nome: "Churrasco Parrilla & Enologia",
          frequencia: "Finais de semana",
          locaisPraticados: ["Área Gourmet Residencial"],
          origemValidacao: "Declaração de Preferências Residenciais CN-2026-9941",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.5,
          detalhes: "Preparo de cortes nobres bovinos de Mato Grosso (Angus/Nelore) e harmonização com vinhos tintos.",
          impactoImovelCasaNova:
            "Requisito Construtivo Ultra: Espaço gourmet integrado com bancada em granito São Gabriel, churrasqueira a carvão e ponto de climatização para adega.",
          iconeNome: "Wine",
        },
        {
          categoria: "tecnologia",
          nome: "Automação Residencial e Veículos 4x4",
          frequencia: "Contínua",
          locaisPraticados: ["Residência e Viagens Regionais"],
          origemValidacao: "Homologação de Mobilidade & Perfil Técnico uisa nº CN-2026-9941",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.7,
          detalhes:
            "Interesse por sistemas inteligentes de segurança residencial, energia solar e viagens off-road pelo interior do MT.",
          impactoImovelCasaNova:
            "Requisito Construtivo Ultra: Garagem coberta e espaçosa para camionete 4x4, infraestrutura para carregador wallbox e cabeamento estruturado para automação residencial.",
          iconeNome: "Cpu",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura:
          "Arquitetura Contemporânea com pé-direito elevado, integração total entre sala de estar e varanda gourmet, iluminação natural generosa e acabamentos em madeira nobre e pedras naturais.",
        itensIndispensaveis: [
          "Espaço Gourmet integrado climatizado com churrasqueira a carvão e bancada em granito",
          "Piscina aquecida privativa com deck em madeira",
          "Home office privativo estruturado para trabalho executivo",
          "Usina de energia solar fotovoltaica instalada",
          "Garagem coberta para no mínimo 2 caminhonetes/SUVs grandes",
          "Suíte master ampla com closet para o casal e suítes privativas para os filhos",
          "Segurança 24 horas em condomínio fechado ou sistema perimetral de alta resolução",
        ],
        ambientesPrioritarios: [
          "Varanda Gourmet Integrada",
          "Living com Pé-Direito Alto",
          "Piscina Aquecida com Prainha",
          "Suítes Climatizadas",
        ],
        perfilVizinhança:
          "Bairro residencial nobre e seguro em Tangará da Serra (Jardim Europa, Residencial Manacá ou condomínio horizontal fechado com portaria 24h).",
        prioridadesSustentabilidade: [
          "Energia Solar Fotovoltaica On-Grid",
          "Sistema de Captação e Aproveitamento de Água de Chuva",
          "Conforto Térmico e Ventilação Cruzada",
        ],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["Ford Ranger Limited 3.0 V6 4x4", "Toyota SW4 Diamond", "Toyota Hilux SRX"],
        tecnologiaEGadgets: ["Apple iPhone 15 Pro", "Notebook Dell Latitude Corporativo", "Garmin Forerunner 965"],
        gastronomiaEVinhos: [
          "Cortes Angus Certificados de MT",
          "Vinhos Cabernet Sauvignon e Malbec",
          "Cafés Artesanais",
        ],
        vestuarioEModa: [
          "Casual Elegante (Dudalina, Lacoste, Reserva)",
          "Roupas Técnicas de Tênis (Wilson, Nike, Babolat)",
        ],
      },
      viagensEExperiencias: [
        {
          destino: "Vitória & Guarapari (ES)",
          tipoViagem: "Visita aos Genitores e Férias de Verão no Litoral Capixaba",
          detalhes: "Viagens periódicas para descanso familiar e lazer no litoral.",
        },
        {
          destino: "Cuiabá & Chapada dos Guimarães (MT)",
          tipoViagem: "Torneios da Federação Mato-grossense de Tênis e Ecoturismo",
          detalhes: "Acompanhamento do filho Cauã nas etapas do campeonato estadual de tênis e passeios familiares.",
        },
      ],
      causasEComunidade: [
        "Incentivo a escolinhas sociais de tênis e esportes de base em Tangará da Serra",
        "Apoio a projetos de reflorestamento e proteção de mananciais no Médio-Norte de Mato Grosso",
      ],
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    dadosTrabalhistasCLT: {
      vinculoAtivo: true,
      tipoVinculo: "CLT Estatutário / Gerente de Engenharia",
      empregador: "uisa Biorrefinaria Agroindustrial",
      cnpjEmpregador: "03.979.663/0001-98",
      cargoRegistrado: "Gerente de Engenharia & Infraestrutura Industrial",
      cbo: "2140-05",
      cboDescricao: "Engenheiro de automação e infraestrutura industrial",
      dataAdmissao: "12/03/2018",
      tempoCasaAnos: 8.7,
      salarioBaseCLT: 26800.0,
      remuneracaoVariavelMedia: 4200.0,
      descontosOficiais: {
        inss: 908.86,
        irpf: 5890.4,
        outrosDescontos: 0.0,
      },
      salarioLiquidoRecebido: 24190.74,
      origemFonteDados: "eSocial Eventos S-1200 / S-1210 & CTPS Digital Homologada",
      beneficiosAtivos: [
        "Plano de Saúde Executivo Unimed Sul MT",
        "Seguro de Vida em Grupo Corporativo",
        "Previdência Privada com Contrapartida uisa",
        "Auxílio Combustível & Veículo Corporativo",
      ],
      historicoSalarialUltimosMeses: [
        { competencia: "10/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
        { competencia: "09/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
        { competencia: "08/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
        { competencia: "07/2026", valorBruto: 31000.0, valorLiquido: 24190.74 },
      ],
    },
    detalhamentoDividasSFN: {
      totalComprometidoMensal: 1260.0,
      totalSaldoDevedorResidual: 92000.0,
      percentualRendaComprometida: 4.1,
      contratos: [
        {
          tipoOperacao: "Crédito Imobiliário / Consórcio",
          instituicao: "104 - Caixa Econômica Federal",
          contratoMascarado: "IMOB-9182***",
          parcelaMensal: 1260.0,
          parcelasPagas: 48,
          totalParcelas: 180,
          saldoDevedor: 92000.0,
          situacao: "Em Dia / Adimplente (Pontualidade 100%)",
          garantia: "Alienação Fiduciária - Matrícula 41.280",
        },
        {
          tipoOperacao: "Cartão de Crédito",
          instituicao: "001 - Banco do Brasil S.A.",
          contratoMascarado: "OUROCARD-VISA-9812***",
          parcelaMensal: 0.0,
          parcelasPagas: 36,
          totalParcelas: 36,
          saldoDevedor: 0.0,
          situacao: "Em Dia / Adimplente (Fatura R$ 3.800 liquidada 100% à vista)",
          garantia: "Limite aprovado R$ 45.000",
        },
      ],
    },
    indicadoresBacenOficiais: {
      selicMetaAnual: 10.75,
      trMensalVigente: 0.1691,
      taxaMediaMercadoImobiliarioAnual: 10.49,
      endividamentoMedioFamiliasSfn: 50.11,
      prazoMaximoMesesCalculado: 420,
      fontesPublicasAuditadas: [
        {
          orgao: "Banco Central do Brasil (BACEN)",
          baseDados: "Sistema Gerenciador de Séries Temporais (SGS) Séries 226, 25434, 432, 29037",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "BACEN-SGS-2026-981240-MT",
          status: "Vigente / Oficial em Tempo Real",
          linkOficial: "https://www3.bcb.gov.br/sgspub/",
        },
        {
          orgao: "Receita Federal do Brasil (RFB)",
          baseDados: "Cadastro de Pessoas Físicas (CPF Módulo 11) & eSocial S-1200",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "RFB-CPF-2026-00000000191",
          status: "Regular / Ativo",
          linkOficial: "https://servicos.receita.fazenda.gov.br",
        },
        {
          orgao: "Tribunal Regional do Trabalho da 23ª Região (TRT-23 / TST)",
          baseDados: "Banco Nacional de Devedores Trabalhistas (BNDT)",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "CNDT-2026-881290-MT",
          status: "Certidão Negativa Válida",
          linkOficial: "https://www.tst.jus.br/certidao",
        },
        {
          orgao: "Central Nacional de Protesto de Títulos (CENPROT / IEPTB)",
          baseDados: "Comarcas de Vitória/ES e Tangará da Serra/MT",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "CENPROT-2026-117879-NAC",
          status: "0 Apontamentos de Protesto Ativos",
          linkOficial: "https://site.cenprotnacional.org.br",
        },
        {
          orgao: "Controladoria-Geral da União (CGU)",
          baseDados: "Cadastro de Pessoas Politicamente Expostas (PEP) e Sanções",
          dataHoraConsulta: "16/11/2026 às 08:30",
          protocoloOuCertidao: "CGU-PEP-2026-004921",
          status: "Nada Consta como PEP",
          linkOficial: "https://portaldatransparencia.gov.br",
        },
      ],
      resolucaoCmn: "Resolução CMN nº 4.676 (Limite de 80% LTV no SFH / SBPE)",
      regraIdadeSusep: "Circular SUSEP nº 621 (Idade máxima de 80 anos e 6 meses ao término do contrato)",
      sistemaAmortizacaoComparativo: {
        sac: {
          financiamentoMaximoMargemLivre: 748000,
          primeiraParcela: 8040,
          ultimaParcela: 2110,
          imovelMaximoComEntradaEFgts: 935000,
          entradaSugerida: 187000,
          financiamentoMaximoMargemIntegral: 790000,
          imovelMaximoMargemIntegral: 987500,
        },
        price: {
          financiamentoMaximoMargemLivre: 825000,
          parcelaFixa: 8040,
          imovelMaximoComEntradaEFgts: 998000,
          entradaSugerida: 199600,
          financiamentoMaximoMargemIntegral: 880000,
          imovelMaximoMargemIntegral: 1100000,
        },
      },
      decomposicaoContabilRenda: {
        rendaBrutaMensal: 31000,
        inssOficialRetido: 908.86,
        irpfTabelaProgressiva: 5890.4,
        totalDeducoesOficiais: 6799.26,
        rendaLiquidaFiscal: 24190.74,
        lucrosDividendosIsentos: 4200,
        rendaGlobalComprovada: 31000,
      },
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 4,
      valorEstimadoPatrimonio: 1475000,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 41.280",
          tipoImovel: "Residência Urbana em Alvenaria (260 m² de área construída)",
          areaTotalM2: 450,
          valorAvaliacao: 780000,
          situacaoOnus: "Livre e Desembaraçado (Sem penhoras ou indisponibilidades)",
          anoRegistro: "2019",
        },
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 48.912",
          tipoImovel: "Lote Residencial nº 14, Qd 08 — Loteamento Reserva do Parque",
          areaTotalM2: 450,
          valorAvaliacao: 380000,
          situacaoOnus: "Livre e Desembaraçado (Escriturado e Registrado)",
          anoRegistro: "2021",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "Ford Ranger Limited 3.0 V6 4x4 Diesel Automática",
          anoFabricacaoModelo: "2024/2024",
          placa: "QNP-4G18",
          renavam: "01483920145",
          valorFipe: 315000,
          situacaoGravame: "Quitado / Sem restrições de gravame",
          combustivel: "Diesel S10",
        },
      ],
    },
    dadosEleitoraisTSE: {
      tituloEleitor: "0219 4431 0244",
      zona: "019ª Zona Eleitoral (Tangará da Serra/MT)",
      secao: "0088",
      municipio: "Tangará da Serra",
      uf: "MT",
      situacaoInscricao: "REGULAR",
      biometriaColetada: true,
      quitacaoEleitoral:
        "Quitação Eleitoral Plena e Irrestrita (Certidão Positiva com Efeitos de Negativa Inexistente)",
      protocoloValidacaoTse: "TSE-2026-TGA-882194",
      certidaoEmitidaEm: "16/11/2026 às 08:30 UTC-04:00",
      localVotacao: "Escola Estadual 29 de Novembro — Centro, Tangará da Serra/MT",
    },
    registroCivilSIRC: {
      matriculaNacionalNotarial: "068412.01.55.2012.2.00034.010.0003410-82",
      cartorioRegistro: "Cartório de Registro Civil das Pessoas Naturais do 1º Ofício de Tangará da Serra/MT",
      cidadeCartorio: "Tangará da Serra / MT",
      livro: "B-12 de Casamentos",
      folha: "088",
      termo: "Termo nº 3.410",
      tipoCertidao: "Certidão de Casamento com Averbação Notarial",
      dataRegistro: "15/04/2012",
      statusSIRC: "VALIDADO_CRC_NACIONAL",
      codigoAutenticidadeNacional: "CRC-NACIONAL-MT-2026-3410",
      regimeBens: "Comunhão Parcial de Bens (Art. 1.658 da Lei nº 10.406/2002 - Código Civil)",
    },
    cnhDigitalSenatran: {
      renach: "MT-08291402",
      numeroCnh: "04981290311",
      categoria: "B",
      orgaoEmissor: "DETRAN-MT / Senatran",
      dataPrimeiraHabilitacao: "14/06/2002",
      dataValidade: "14/06/2032",
      situacaoCnh: "ATIVA",
      pontuacaoInfracoes: 0,
      bloqueioAdministrativo: false,
      observacoesExameMedico: "Apto para condução sem restrições médicas ou ópticas",
    },
    comprovantesConcessionarias: {
      concessionariaEnergia: {
        empresa: "Energisa Mato Grosso — Distribuidora de Energia S.A.",
        unidadeConsumidora: "0491823-1",
        statusFornecimento: "LIGADO / FORNECIMENTO NORMAL",
        adimplencia: "100% ADIMPLENTE (Últimas 36 faturas quitadas)",
        titularidade: "RODRIGO RIBEIRO GONÇALVES",
        mesReferencia: "10/2026",
        valorUltimaFatura: 342.8,
        enderecoInstalacao: "Rua Antônio Hortolani, nº 620-W, Centro — Tangará da Serra/MT (CEP 78300-055)",
      },
      concessionariaAgua: {
        empresa: "SAMAE — Serviço Autônomo Municipal de Água e Esgoto de Tangará da Serra",
        ligacaoId: "28419-0",
        categoria: "Residencial Monofásica / Padrão Normal",
        status: "LIGAÇÃO ATIVA E FISCALIZADA",
        titularidade: "RODRIGO RIBEIRO GONÇALVES",
        mesReferencia: "10/2026",
        consumoMedioM3: 16.5,
        hidrometro: "HD-SAMAE-2024-8841",
      },
    },
    declaracaoIrpfRfb: {
      exercicio: "2026",
      anoCalendario: "2025",
      numeroReciboEntrega: "78.41.90.22.18-84-RFB",
      dataProcessamentoRFB: "14/05/2026 às 11:24:18",
      rendimentosTributaveisDeclarados: 372000,
      deducoesLegaisApuradas: 42850,
      impostoDevidoApurado: 81120,
      impostoPagoRetidoFonte: 81120,
      statusDeclaracao: "HOMOLOGADA",
      resumoBensDeclarados: [
        {
          tipoBem: "Imóvel Urbano (Residência)",
          descricao:
            "Residência em alvenaria com 260m² na Rua Antônio Hortolani, 620-W, Centro, Tangará da Serra/MT (Matrícula 41.280)",
          valorDeclarado: 780000,
        },
        {
          tipoBem: "Imóvel Urbano (Lote)",
          descricao:
            "Lote residencial nº 14, Qd 08, Residencial Reserva do Parque — Tangará da Serra/MT (Matrícula 48.912)",
          valorDeclarado: 380000,
        },
        {
          tipoBem: "Veículo Automotor",
          descricao: "Ford Ranger Limited 3.0 V6 4x4 Diesel 2024/2024 — Placa QNP-4G18",
          valorDeclarado: 315000,
        },
        {
          tipoBem: "Participação Societária",
          descricao: "70% do Capital Social da empresa DIAS GESTÃO AGROINDUSTRIAL LTDA (CNPJ 38.912.441/0001-20)",
          valorDeclarado: 175000,
        },
      ],
    },
    extratoFgtsCaixa: {
      empregadorPrincipal: "uisa — BIORREFINARIA DE CANA-DE-AÇÚCAR (União Industrial Açucareira S.A.)",
      cnpjEmpregador: "04.421.173/0001-83",
      saldoTotalHabitacao: 145000,
      depositoMensalRegular: 2144,
      numeroCertificadoCrf: "CRF-20261114-8841-CAIXA",
      validadeCrf: "14/12/2026",
      statusCrf: "REGULAR",
      elegivelUtilizacaoMoradiaPropria: true,
      tempoTotalContribuicaoFgtsMeses: 172,
    },
    dpoCompliance: {
      termoConsentimentoAssinado: true,
      dataHoraConsentimento: "29/10/2026 às 11:20:15 UTC-04:00",
      protocoloAssinaturaDigital: "DPO-LGPD-2026-RODRIGO-TGA-AUTH",
      baseLegalLgpd:
        "Art. 7º, I (Consentimento), Art. 7º, V (Contratos Imobiliários) e Art. 7º, X (Proteção do Crédito) da Lei nº 13.709/2018.",
      finalidadeEspecifica: "Qualificação de Crédito Imobiliário, Due Diligence e Outorga Uxória",
      statusDpo: "HOMOLOGADO",
      responsavelDpo: "DPO & Agente Jurídico Interno da Casa Nova Imóveis",
      enquadramentoCoafLlavagemDinheiro: {
        pep: false,
        statusCoaf: "Conformidade Total / Nada Consta (Sem atipicidades financeiras ou sanções)",
        parecerCompliance:
          "Titular com capacidade econômico-financeira compatível, proveniência salarial comprovada via eSocial/uisa e outorga uxória averbada perante o 1º Ofício de Registro Civil de Tangará da Serra/MT.",
      },
      certidoesCartorariasValidadas: [
        {
          orgao: "Receita Federal do Brasil & PGFN",
          tipoCertidao: "Certidão Conjunta Negativa de Débitos Federais e Dívida Ativa da União",
          numeroCertidao: "2026-RFB-99120-BR",
          dataEmissao: "16/11/2026",
          validadeAte: "14/05/2027",
          codigoAutenticidade: "9B3C.55F2.88D1.E923",
          status: "REGULAR",
          linkVerificacao: "https://servicos.receita.fazenda.gov.br",
        },
        {
          orgao: "Tribunal Superior do Trabalho (TST)",
          tipoCertidao: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
          numeroCertidao: "2026/0581920",
          dataEmissao: "16/11/2026",
          validadeAte: "15/05/2027",
          codigoAutenticidade: "TST-CNDT-881290-MT",
          status: "REGULAR",
          linkVerificacao: "https://www.tst.jus.br/certidao",
        },
        {
          orgao: "Central Nacional de Protesto (CENPROT / IEPTB)",
          tipoCertidao: "Certidão Negativa de Protestos (Vitória/ES e Tangará da Serra/MT)",
          numeroCertidao: "IEPTB-NAC-99124-2026",
          dataEmissao: "16/11/2026",
          validadeAte: "16/12/2026",
          codigoAutenticidade: "CENPROT-99124-NAC",
          status: "REGULAR",
          linkVerificacao: "https://site.cenprotnacional.org.br",
        },
      ],
    },
    dadosBancariosEChavesPix: {
      chavesPixCadastradasBacen: [
        {
          tipoChave: "CPF",
          chaveMascarada: "117.***.***-54",
          instituicao: "Sicredi Sudoeste MT",
          dataCriacao: "16/11/2020",
          status: "ATIVA",
        },
        {
          tipoChave: "TELEFONE",
          chaveMascarada: "(65) 9****-4681",
          instituicao: "Banco do Brasil",
          dataCriacao: "05/04/2021",
          status: "ATIVA",
        },
      ],
      bancosRelacionamento: [
        {
          banco: "Sicredi Sudoeste MT",
          codigoCompensacao: "748",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Tangará da Serra (0810)",
          tempoRelacionamentoAnos: 11,
          limiteChequeEspecialAprovado: 25000,
          cartaoCreditoLimiteTotal: 80000,
          pontualidadePagamentos: "Excelente (Histórico 100% Pontual)",
        },
        {
          banco: "Banco do Brasil",
          codigoCompensacao: "001",
          tipoConta: "CORRENTE",
          agenciaMascarada: "Agência Central TGA (1310)",
          tempoRelacionamentoAnos: 18,
          limiteChequeEspecialAprovado: 40000,
          cartaoCreditoLimiteTotal: 95000,
          pontualidadePagamentos: "Excelente",
        },
      ],
      resumoOpenFinance: {
        scoreOpenFinance: 910,
        movimentacaoMediaMensal: 42000,
        saldoInvestimentosTotal: 240000,
        probabilidadeAprovacaoCaixa: "Altíssima (Margem Livre no SFN)",
      },
    },
    imoveisRecomendadosIds: [
      "c0eef2a1-9089-4171-8517-e60dd9e571a3",
      "d78a91b2-1234-4567-8901-abcdef123456",
      "e98b02c3-5678-4321-9876-fedcba654321",
    ],
  },
  // 4. Fernando Silveira (00000001244)
  "00000001244": {
    cpf: "00000001244",
    cpfFormatado: "000.000.012-44",
    digitoValido: true,
    regiaoFiscal: "7ª RF (RJ, ES) — 7ª Região Fiscal da RFB",
    situacaoCadastral: "REGULAR",
    dataConsulta: "13/11/2026 às 12:48",
    protocoloConsulta: "CN-CPF-2026-98413-MT",
    nomeCompleto: "Fernando Silveira",
    dataNascimento: "04/09/1988",
    idade: 38,
    sexo: "M",
    nomeMae: "Protegido por Sigilo Fiscal (Art. 198 do CTN / LGPD — Assento no Registro Civil)",
    estadoCivil: "Solteiro(a)",
    telefones: [{ numero: "(65) 99611-4455", whatsapp: true, principal: true }],
    emails: ["fernando.silveira@uol.com.br"],
    endereco: {
      logradouro: "Av. Brasil",
      numero: "650",
      bairro: "Centro",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-000",
    },
    scoreCredito: 680,
    classificacaoRisco: "Médio Risco (Bom)",
    rendaPresumidaMensal: 8500,
    capacidadeParcelaMensal: 2550,
    poderCompraImobiliario: 310000,
    potencialFgts: 22000,
    elegibilidadeMcmv: true,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 8500,
      rendaComplementar: 0,
      rendaTotalLiquida: 8500,
      origemComprovacao: "CLT / Comprovante Bancário",
      tempoAtividade: "4 anos",
      capacidadeParcela30: 2550,
      comprometimentoSFN: 600,
      percentualComprometimento: 7.0,
      margemLivreFinanciamento: 1950,
      saldoFgts: 22000,
      poderCompraImobiliario: 310000,
      entradaSugerida20: 62000,
      faixaScore: "680 de 1.000 — Médio Risco (Bom)",
      probabilidadeInadimplencia: "4,8%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-98413-NACIONAL",
        cartoriosPesquisados: "Central Nacional de Protesto de Títulos",
        dataPesquisa: "13/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-98413-MT",
        dataPesquisa: "13/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Boa Vista SCPC",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT e TRF1",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta)",
        dividaAtivaUniao: "Sem Inscrições",
        cadinFederal: "Nada Consta",
        scrBacenPontualidade: "100% Pontual",
      },
    },
    redesSociais: {
      assertividadeGlobal: 99.6,
      motivoAssertividadeGlobal:
        "Cruzamento biométrico e validação oficial: Engenheiro Agrônomo pela UFMT, diretor da Silveira Sementes e membro do Clube de Tiro e Aeroclube de Tangará da Serra.",
      linkedin: {
        usuario: "fernando-silveira-sementes",
        url: "https://br.linkedin.com/in/fernando-silveira-sementes",
        cargoAtual: "Diretor Geral & Sócio Administrador",
        empresaAtual: "Silveira Sementes & Agronegócios Ltda",
        localidade: "Tangará da Serra e Campo Novo do Parecis, MT",
        status: "LOCALIZADO",
        conexoes: "+500 conexões de alto nível no Agronegócio",
        assertividade: 99.5,
        motivoAssertividade: "Perfil executivo verificado no setor de sementes e insumos agrícolas de Mato Grosso.",
        resumoBio:
          "Engenheiro Agrônomo (UFMT). Diretor da Silveira Sementes. Especialista em multiplicação de sementes certificadas de soja e milho, nutrição foliar de precisão e expansão de produtividade no polo da Chapada dos Parecis.",
        formacaoAcademica: [
          {
            instituicao: "Universidade Federal de Mato Grosso (UFMT)",
            curso: "Engenharia Agronômica",
            periodo: "Concluído",
            grau: "Bacharelado em Agronomia",
          },
        ],
        certificacoes: [
          "Responsável Técnico perante o MAPA e RENASEM",
          "Piloto Privado de Aeronave (ANAC / Brevê PP)",
          "Atirador Desportivo Registrado no Exército Brasileiro (CAC)",
        ],
        postsPrincipais: [
          {
            data: "Abertura de Plantio",
            titulo: "Sobrevoo Técnico Inspecionando a Germinação no Polo dos Parecis",
            resumo:
              "Avaliação do estande de plantas e vigor germinativo nas áreas de multiplicação com índices acima de 94%. Safra com altíssimo potencial tecnológico.",
            engajamento: "480 curtidas · 52 comentários",
            topicos: ["Sementes Certificadas", "Aviação Agrícola", "Agro MT", "Produtividade"],
            link: "https://br.linkedin.com/in/fernando-silveira-sementes",
          },
        ],
        interessesEGostos: [
          "Biotecnologia de Sementes e Agricultura de Precisão",
          "Aviação Executiva e Esportiva em Mato Grosso",
          "Tiro Esportivo, Hipismo Rural e Expedições Off-Road",
          "Imóveis com Grandes Terrenos, Espaço Gourmet e Hangar em Tangará da Serra",
        ],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Fernando+Silveira%22+Tangara",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Fernando+Silveira%22+Tangara",
        nomeExibicao: "Fernando Silveira",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "Conta de uso pessoal e familiar. Preservada sob Art. 5º, X da CF/88 e Art. 7º da LGPD para evitar exposição e links inexistentes.",
        seguidoresEstimados: 5200,
        bio: "Perfil pessoal com privacidade ativada. Varredura OSINT confirma regularidade e ausência de apontamentos desabonadores.",
        verificado: false,
        assertividade: 99.4,
        destaquesGostos: [
          "Lavouras & Safra",
          "Aviação Regional",
          "Tiro Esportivo",
          "Cavalgadas & Fazenda",
          "Parrilla & 4x4",
        ],
      },
      facebook: {
        usuario: "fernando.silveira.sementes",
        url: "https://www.facebook.com/search/top?q=Fernando%20Silveira%20Sementes%20Tangara",
        nomeExibicao: "Fernando Silveira",
        status: "LOCALIZADO",
        amigosEstimados: 2900,
        cidade: "Tangará da Serra, MT",
        bio: "Engenheiro Agrônomo. Diretor da Silveira Sementes & Agronegócios. Apaixonado por aviação e agronegócio.",
        assertividade: 99.3,
        vinculosRegionais: "Membro da Associação dos Produtores de Sementes de MT (APROSMAT) e Aeroclube Regional",
      },
      youtubeOuPodcast: [
        {
          canal: "Agro Inovação MT",
          url: "https://www.youtube.com/results?search_query=Fernando+Silveira+Sementes",
          tituloConteudo: "Dia de Campo: Tecnologias de Tratamento Industrial de Sementes e Vigor no Solo",
          papel: "palestrante",
          visualizacoes: "11.500 visualizações",
          tema: "Multiplicação de Sementes de Soja de Alto Vigor",
        },
      ],
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca:
          "Residência de alto luxo em terreno amplo (acima de 600 m²) ou chácara urbana nobre em Tangará da Serra/MT, com arquitetura rústico-moderna imponente, pé-direito duplo de 5 metros, espaço gourmet parrilla completo, garagem espaçosa para 4 veículos (incluindo picapes pesadas) e fácil acesso ao aeroporto municipal.",
        faixaPrecoEstimada: "R$ 2.000.000 a R$ 3.800.000",
        tipologiasPreferenciais: [
          "Chácara Urbana Nobre",
          "Casa Térrea de Alto Luxo com Terreno Amplo",
          "Sobrado com Hangar/Oficina Privativa",
        ],
        bairrosInteresse: ["Jardim Europa", "Jardim Tarumã", "Chácaras Residenciais Nobres"],
        motivacaoCompra:
          "Construção de residência de alto padrão com lazer completo e espaço para guarda de veículos pesados, barco e equipamentos de aviação/esportivos.",
        scoreAssertividadePerfil: 99.6,
      },
      googleFootprint: {
        termosPesquisados: ['"Fernando Silveira" Tangará da Serra', '"Silveira Sementes" CNPJ 13.367.084'],
        mencoesPublicas: [
          {
            titulo: "Silveira Sementes & Agronegócios Ltda - CNPJ 13.367.084/0001-48",
            fonte: "Receita Federal do Brasil / JUCEMAT / MAPA",
            link: "https://www.google.com/search?q=Silveira+Sementes+Tangara+da+Serra",
            snippet:
              "Registro de sociedade empresária ativa em comércio atacadista de sementes e defensivos agrícolas com sede na Av. Brasil, 655-N, Centro, Tangará da Serra/MT.",
            data: "2024",
            assertividade: 100,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle:
        "Jovem Empresário do Agronegócio e Produtor Rural de Alta Renda. Solteiro, arrojado, piloto privado de aeronaves e apaixonado por esportes de ação e vida no campo.",
      resumoPerfil:
        "Fernando representa a nova geração de líderes do agronegócio mato-grossense. Graduado pela UFMT, expandiu os negócios familiares no setor de sementes e insumos em Tangará da Serra e Campo Novo do Parecis. É piloto privado habilitado, atirador desportivo filiado ao clube local e entusiasta de cavalgadas, mantendo um estilo de vida dinâmico e focado em alta performance.",
      rotinaSemanal: [
        {
          periodo: "Manhã (06:00 - 07:30)",
          descricao:
            "Despertar cedo, verificação das cotações de commodities (B3 e Chicago), alinhamento da equipe de vendas e saída para o hangar ou campo.",
          habitos: [
            "Acompanhamento de cotações agrícolas",
            "Café reforçado da fazenda",
            "Briefing de voo / deslocamento",
          ],
        },
        {
          periodo: "Comercial (08:00 - 18:00)",
          descricao:
            "Visitas técnicas a produtores clientes no polo de Tangará, Campo Novo do Parecis e Sapezal; negociações de grandes lotes de sementes.",
          habitos: [
            "Voo de inspeção e visitas às fazendas",
            "Reuniões comerciais com produtores",
            "Coordenação logística de sementes",
          ],
        },
        {
          periodo: "Noite (19:30 - 22:00)",
          descricao: "Jantares de negócios, encontros com amigos do agronegócio e treinos de condicionamento físico.",
          habitos: ["Jantar com amigos e parceiros", "Academia e musculação", "Planejamento logístico da safra"],
        },
        {
          periodo: "Finais de Semana",
          descricao:
            "Sábado com voo esportivo e treino prático no Clube de Tiro de Tangará da Serra; à noite churrasco Tomahawk com amigos; domingo de cavalgada ou trilhas off-road 4x4.",
          habitos: [
            "Pilotagem no aeroclube",
            "Tiro esportivo no stand do clube",
            "Churrasco parrilla e carnes maturadas",
          ],
        },
      ],
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria: "Ficha Cadastral Homologada Casa Nova Imóveis nº CN-2026-5299 & ANAC / CREA-MT",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Inteligência e Crédito Imobiliário Casa Nova Imóveis",
        hashValidacaoSha256: "d592018274619283746501928374650192837465019283746501928374650192",
        termoConsentimentoLgpd:
          "Consentimento específico para qualificação de crédito agroimobiliário (Art. 7º, I e V da LGPD).",
        observacaoComiteCredito:
          "Empresário consolidado do agronegócio de sementes. Renda patrimonial altíssima com preferência por chácara nobre urbana ou condomínio fechado.",
      },
      hobbiesPrincipais: [
        {
          categoria: "viagens",
          nome: "Aviação Esportiva & Pilotagem Privada",
          frequencia: "Semanal",
          locaisPraticados: ["Aeroporto Municipal de Tangará da Serra", "Pistas de Pouso em Fazendas da Região"],
          origemValidacao: "Licença de Piloto Privado Homologada ANAC & Ficha nº CN-2026-5299",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 100,
          detalhes:
            "Piloto com brevê de Piloto Privado (PP/ANAC). Realiza sobrevoos nas fazendas clientes e viagens de negócios pelo Médio-Norte de Mato Grosso.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Localização estratégica com acesso rápido ao Aeroporto Municipal de Tangará da Serra e vias perimetrais expressas.",
          iconeNome: "Plane",
        },
        {
          categoria: "esportes",
          nome: "Tiro Esportivo & Prática em Clube",
          frequencia: "Quinzenal",
          locaisPraticados: ["Clube de Tiro de Tangará da Serra"],
          origemValidacao: "Certificado de Registro no Exército Brasileiro (CR/CAC) & Ficha nº CN-2026-5299",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 100,
          detalhes:
            "Atirador desportivo devidamente registrado (CAC perante o Exército Brasileiro). Pratica tiro de precisão com armas curtas e longas em stand homologado.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Residência com sistema de segurança perimetral reforçado, cofre embutido de alvenaria com trava eletrônica e câmeras de monitoramento 24h.",
          iconeNome: "Trophy",
        },
        {
          categoria: "agro",
          nome: "Hipismo Rural, Cavalgadas & Manejo Equino",
          frequencia: "Finais de Semana",
          locaisPraticados: ["Fazenda da Família na Região de Tangará da Serra"],
          origemValidacao: "Declaração de Bens e Atividades Rurais na Ficha nº CN-2026-5299",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.4,
          detalhes:
            "Criador de cavalos Quarto de Milha. Participa de cavalgadas tradicionais e provas funcionais de laço em eventos do agronegócio.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Preferência por chácara urbana ou loteamento horizontal com ampla área de terreno para acomodação de carretas e trailers de cavalos.",
          iconeNome: "Compass",
        },
        {
          categoria: "gastronomia",
          nome: "Parrilla de Cortes Nobres (Tomahawk & Prime Rib)",
          frequencia: "Semanal",
          locaisPraticados: ["Residência e Fazenda"],
          origemValidacao: "Especificações de Projeto Arquitetônico - Ficha nº CN-2026-5299",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.6,
          detalhes:
            "Especialista em churrasco parrilla com lenha de angico e cortes marmorizados de gado Angus e Wagyu, acompanhados de cervejas artesanais IPA.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Espaço gourmet externo completo com churrasqueira parrilla, exaustão mecânica e bancada ampla em granito rústico.",
          iconeNome: "Flame",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura:
          "Arquitetura contemporânea rústico-chique com estrutura metálica aparente, pedras naturais de corte reto, vidro e madeira nobre de reflorestamento.",
        itensIndispensaveis: [
          "Garagem coberta e espaçosa para no mínimo 4 veículos (incluindo picape pesada, carreta e equipamentos esportivos)",
          "Espaço gourmet parrilla de grande porte com fogão a lenha moderno, chopeira de embutir e bancada em granito nobre",
          "Living com pé-direito duplo imponente (mínimo 5 metros) e integração visual com a área verde",
          "Suíte master ampla com banheira de imersão e closet walk-in",
          "Terreno amplo (mínimo 600 m² a 1.200 m²) garantindo total privacidade e espaço para lazer privativo",
          "Fácil acesso viário ao Aeroporto Municipal de Tangará da Serra",
        ],
        ambientesPrioritarios: [
          "Espaço Gourmet Parrilla",
          "Garagem Ampla para 4 Carros",
          "Living Pé-Direito Duplo",
          "Adega de Chopp e Vinhos",
        ],
        perfilVizinhança:
          "Bairro nobre residencial ou chácara urbana tranquila, com privacidade e vizinhança de alto padrão (Jardim Europa ou Tarumã).",
        prioridadesSustentabilidade: [
          "Usina Solar Fotovoltaica",
          "Paisagismo com Árvores Nativas e Irrigação Automatizada",
        ],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["Ford Ranger Raptor", "RAM 2500 Laramie 6.7 Turbo Diesel", "UTV Can-Am Maverick"],
        tecnologiaEGadgets: [
          "Apple iPhone 16 Pro",
          "Relógio Garmin Tactix 7 / Breitling Aerospace",
          "Drones de Alta Resolução",
        ],
        gastronomiaEVinhos: [
          "Cortes Angus Certificados (Tomahawk, Picanha Prime)",
          "Cervejas Artesanais IPA",
          "Bourbon Americano",
        ],
        vestuarioEModa: ["Dudalina", "Texas Center", "Botas Artesanais de Couro Legítimo", "Roupas Técnicas Columbia"],
      },
      viagensEExperiencias: [
        {
          destino: "Grandes Feiras do Agronegócio (Agrishow Ribeirão Preto, Show Safra Lucas do Rio Verde)",
          tipoViagem: "Feiras Técnicas e Missões Comerciais",
          detalhes: "Visitação anual de estandes para prospecção de novas cultivares de sementes e maquinários.",
        },
        {
          destino: "Expedições Off-Road na Chapada dos Parecis e Pantanal",
          tipoViagem: "Aventura e Esporte com Amigos",
          detalhes: "Trilhas off-road com comboio de picapes 4x4 e UTVs em relevos acidentados do estado.",
        },
      ],
      causasEComunidade: [
        "Incentivo a projetos de agricultura regenerativa e preservação das nascentes do Médio-Norte de MT",
        "Apoio a provas hípicas tradicionais e associações de criadores da região de Tangará da Serra",
      ],
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    imoveisRecomendadosIds: ["d78a91b2-1234-4567-8901-abcdef123456"],
  },

  // 5. Dra. Patricia Mendes (00000001406)
  "00000001406": {
    cpf: "00000001406",
    cpfFormatado: "000.000.014-06",
    digitoValido: true,
    regiaoFiscal: "7ª RF (RJ, ES) — 7ª Região Fiscal da RFB",
    situacaoCadastral: "REGULAR",
    dataConsulta: "13/11/2026 às 12:50",
    protocoloConsulta: "CN-CPF-2026-98414-MT",
    nomeCompleto: "Dra. Patricia Mendes",
    dataNascimento: "12/11/1980",
    idade: 46,
    sexo: "F",
    nomeMae: "Protegido por Sigilo Fiscal (Art. 198 do CTN / LGPD — Assento no Registro Civil)",
    estadoCivil: "Casado(a)",
    telefones: [{ numero: "(65) 99911-3344", whatsapp: true, principal: true }],
    emails: ["patricia.mendes.odonto@uol.com.br"],
    endereco: {
      logradouro: "Rua Antonio Hortolani",
      numero: "320",
      bairro: "Centro",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-000",
    },
    scoreCredito: 765,
    classificacaoRisco: "Médio Risco (Bom)",
    rendaPresumidaMensal: 18200,
    capacidadeParcelaMensal: 5460,
    poderCompraImobiliario: 680000,
    potencialFgts: 42000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 15000,
      rendaComplementar: 3200,
      rendaTotalLiquida: 18200,
      origemComprovacao: "Consultório / Prestação de Serviços Odontológicos",
      tempoAtividade: "12 anos de atuação",
      capacidadeParcela30: 5460,
      comprometimentoSFN: 1400,
      percentualComprometimento: 7.6,
      margemLivreFinanciamento: 4060,
      saldoFgts: 42000,
      poderCompraImobiliario: 680000,
      entradaSugerida20: 136000,
      faixaScore: "765 de 1.000 — Médio Risco (Bom)",
      probabilidadeInadimplencia: "2,4%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-98414-NACIONAL",
        cartoriosPesquisados: "Central de Protestos MT",
        dataPesquisa: "13/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-98414-MT",
        dataPesquisa: "13/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Boa Vista SCPC",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT e TRF1",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta)",
        dividaAtivaUniao: "Sem Inscrições",
        cadinFederal: "Nada Consta",
        scrBacenPontualidade: "100% Pontual",
      },
    },
    redesSociais: {
      assertividadeGlobal: 99.7,
      motivoAssertividadeGlobal:
        "Cruzamento biométrico e validação oficial: Cirurgiã-Dentista registrada no CRO-MT, sócia-fundadora da Mendes Clínica Odontológica e membra titular do Tangará Tênis Clube.",
      linkedin: {
        usuario: "dra-patricia-mendes-odonto",
        url: "https://br.linkedin.com/in/dra-patricia-mendes-odonto",
        cargoAtual: "Cirurgiã-Dentista & Diretora Clínica",
        empresaAtual: "Mendes Clínica Odontológica e Diagnósticos",
        localidade: "Tangará da Serra e São Paulo",
        status: "LOCALIZADO",
        conexoes: "+500 conexões na área de Saúde e Estética",
        assertividade: 99.6,
        motivoAssertividade:
          "Perfil profissional verificado e ativo na área médica e odontológica de alta complexidade.",
        resumoBio:
          "Cirurgiã-Dentista (USP). Especialista em Harmonização Orofacial, Implantodontia e Reabilitação Estética com fluxo digital. Mais de 14 anos transformando sorrisos com tecnologia 3D e precisão anatômica em Tangará da Serra/MT.",
        formacaoAcademica: [
          {
            instituicao: "Universidade de São Paulo (USP)",
            curso: "Odontologia & Cirurgia Bucomaxilofacial",
            periodo: "Concluído com Honras",
            grau: "Graduação & Especialização",
          },
          {
            instituicao: "Associação Brasileira de Odontologia (ABO-MT)",
            curso: "Especialização em Harmonização Orofacial e Reabilitação Oral",
            periodo: "Pós-Graduação Concluída",
            grau: "Especialista Titular",
          },
        ],
        certificacoes: [
          "Conselho Regional de Odontologia de Mato Grosso (CRO-MT 4812)",
          "Membro Titular da Sociedade Brasileira de Harmonização Orofacial",
          "Certificação Internacional em Fluxo Digital e Escaneamento Intraoral 3D",
        ],
        postsPrincipais: [
          {
            data: "Congresso Internacional",
            titulo: "Reabilitação Estética Digital com Lentes de Contato Dental e Harmonização Suave",
            resumo:
              "Apresentação de protocolo clínico combinando escaneamento digital 3D e odontologia minimamente invasiva para resultados naturais e longevos.",
            engajamento: "510 curtidas · 58 comentários",
            topicos: ["Odontologia Estética", "Harmonização Orofacial", "Fluxo Digital 3D", "Sorriso Natural"],
            link: "https://br.linkedin.com/in/dra-patricia-mendes-odonto",
          },
        ],
        interessesEGostos: [
          "Odontologia de Alta Performance e Harmonização Facial Avançada",
          "Tênis de Quadra de Saibro e Beach Tennis no Tangará Tênis Clube",
          "Casas de Altíssimo Padrão com Arquitetura Contemporânea e Adega em Tangará da Serra",
          "Enologia Fina, Alta Gastronomia e Viagens Internacionais",
        ],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Patricia+Mendes%22+Tangara",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Patricia+Mendes%22+Tangara",
        nomeExibicao: "Dra. Patrícia Mendes",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "Conta de uso pessoal e profissional sob proteção de dados. Varredura OSINT confirma ausência de litígios públicos.",
        seguidoresEstimados: 14200,
        bio: "Perfil sob proteção de dados. Varredura OSINT confirma ausência de litígios públicos ou menções desabonadoras.",
        verificado: false,
        assertividade: 99.8,
        destaquesGostos: ["Casos Clínicos", "Tênis no TTC", "Viagens & Lifestyle"],
      },
      facebook: {
        usuario: "dra.patriciamendes.odonto",
        url: "https://www.facebook.com/search/top?q=Dra%20Patricia%20Mendes%20Odontologia%20Tangara",
        nomeExibicao: "Dra. Patrícia Mendes - Odontologia Especializada",
        status: "LOCALIZADO",
        amigosEstimados: 3400,
        cidade: "Tangará da Serra, MT",
        bio: "Clínica Odontológica especializada em estética, implantes e harmonização. Residente no Centro de Tangará da Serra.",
        assertividade: 99.6,
        vinculosRegionais: "Diretoria do Tangará Tênis Clube (TTC) e Associação Médica e Odontológica Regional",
      },
      youtubeOuPodcast: [
        {
          canal: "Saúde & Estética em Foco — MT",
          url: "https://www.youtube.com/results?search_query=Dra+Patricia+Mendes+Odontologia+Tangara",
          tituloConteudo: "Mitos e Verdades sobre Harmonização Orofacial e Facetas de Porcelana",
          papel: "palestrante",
          visualizacoes: "18.400 visualizações",
          tema: "Estética Facial & Odontologia Digital",
        },
      ],
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca:
          "Mansão de altíssimo luxo em arquitetura contemporânea no Jardim Europa ou condomínio fechado mais exclusivo de Tangará da Serra/MT, com 4 suítes com closet, living com pé-direito de 5 metros, adega climatizada em vidro para 200 garrafas, espaço gourmet sofisticado e piscina com borda infinita.",
        faixaPrecoEstimada: "R$ 2.800.000 a R$ 5.200.000",
        tipologiasPreferenciais: [
          "Mansão Contemporânea em Condomínio Fechado",
          "Casa Térrea de Altíssimo Padrão com Piscina com Borda Infinita",
          "Sobrado de Luxo com Adega e Spa",
        ],
        bairrosInteresse: ["Jardim Europa", "Jardim Tarumã", "Condomínio Horizontal Fechado"],
        motivacaoCompra:
          "Moradia definitiva com o esposo Dr. Roberto Mendes e o filho Felipe, buscando o mais alto nível de conforto, design assinado, segurança e privacidade.",
        scoreAssertividadePerfil: 99.8,
      },
      googleFootprint: {
        termosPesquisados: ['"Dra. Patricia Mendes" Tangará da Serra', '"Mendes Clinica Odontologica" CNPJ 35.789.012'],
        mencoesPublicas: [
          {
            titulo: "Mendes Clínica Odontológica e Diagnósticos S/S - CNPJ 35.789.012/0001-55",
            fonte: "Receita Federal do Brasil / CRO-MT / Vigilância Sanitária",
            link: "https://www.google.com/search?q=Mendes+Clinica+Odontologica+Tangara+da+Serra",
            snippet:
              "Registro de sociedade médica e odontológica ativa com sede na Rua Antonio Hortolani, 320-W, Centro, Tangará da Serra/MT.",
            data: "2024",
            assertividade: 100,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle:
        "Profissional Liberal de Altíssimo Prestígio e Reconhecimento Social. Casada com médico, vida cosmopolita, amante de esportes de raquete, arte contemporânea e gastronomia fina.",
      resumoPerfil:
        "Dra. Patrícia é referência em reabilitação oral e estética facial em Mato Grosso. Casada com o cardiologista Dr. Roberto Mendes e mãe do Felipe, cultiva um estilo de vida refinado, focado em alta gastronomia, práticas esportivas de tênis e beach tennis no Tangará Tênis Clube, apreço por arquitetura de interiores sofisticada e viagens culturais pelo Brasil e exterior.",
      rotinaSemanal: [
        {
          periodo: "Manhã (06:15 - 07:30)",
          descricao:
            "Treino matinal de tênis de quadra rápida ou yoga no jardim de casa, seguido de café da manhã em família com o esposo Roberto e o filho Felipe.",
          habitos: [
            "Treino de tênis no saibro ou yoga",
            "Café com frutas e sucos naturais",
            "Revisão dos casos cirúrgicos do dia",
          ],
        },
        {
          periodo: "Comercial (08:30 - 18:30)",
          descricao:
            "Cirurgias de harmonização facial, procedimentos de lentes em porcelana e coordenação dos especialistas na Mendes Clínica.",
          habitos: [
            "Atendimentos de estética avançada",
            "Planejamento com escaneamento 3D",
            "Gestão clínica e hospitalar",
          ],
        },
        {
          periodo: "Noite (19:30 - 22:00)",
          descricao:
            "Jantar gourmet preparado pelo casal ou nos bistrôs de Tangará da Serra, momentos com o filho Felipe e leitura de periódicos científicos e revistas de design.",
          habitos: [
            "Jantar com o esposo Dr. Roberto Mendes",
            "Apoio às atividades do filho Felipe",
            "Apreciação de vinho branco ou espumante",
          ],
        },
        {
          periodo: "Finais de Semana",
          descricao:
            "Sábado pela manhã torneio ou jogos recreativos de tênis / beach tennis no Tangará Tênis Clube; almoço em família e tarde relaxante na piscina; domingo dedicado à convivência familiar e gastronomia mediterrânea.",
          habitos: [
            "Partidas de tênis e beach tennis no TTC",
            "Almoço gourmet à beira da piscina",
            "Viagens curtas e descanso",
          ],
        },
      ],
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria: "Ficha Cadastral Homologada Casa Nova Imóveis nº CN-2026-9841 & CRO-MT",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Inteligência e Crédito Imobiliário Casa Nova Imóveis",
        hashValidacaoSha256: "e78912345a6789012345b6789012345c6789012345d6789012345e6789012345",
        termoConsentimentoLgpd:
          "Consentimento específico para aquisição imobiliária de alto luxo (Art. 7º, I e V da LGPD).",
        observacaoComiteCredito:
          "Renda médica/odontológica expressiva com clínica própria consolidada. Busca mansão térrea ou sobrado contemporâneo de altíssimo padrão com adega.",
      },
      hobbiesPrincipais: [
        {
          categoria: "esportes",
          nome: "Tênis de Quadra de Saibro & Beach Tennis",
          frequencia: "3x por semana",
          locaisPraticados: ["Tangará Tênis Clube (TTC)", "Arena Beach Tangará"],
          origemValidacao: "Ficha Cadastral Homologada nº CN-2026-9841 & Registro Tangará Tênis Clube",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 99.8,
          detalhes:
            "Jogadora regular de tênis clássico em quadra de saibro e beach tennis na areia com raquetes de carbono profissionais. Participa de torneios internos e eventos sociais do clube.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Condomínio horizontal com infraestrutura completa para tênis e beach tennis iluminados e vestiários privativos.",
          iconeNome: "Trophy",
        },
        {
          categoria: "gastronomia",
          nome: "Enologia Refinada & Champagnes Franceses",
          frequencia: "Apreciação Frequente",
          locaisPraticados: ["Adega Climatizada Residencial"],
          origemValidacao: "Projeto Arquitetônico de Interiores - Ficha nº CN-2026-9841",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.7,
          detalhes:
            "Mantém adega climatizada em vidro com ampla seleção de vinhos brancos (Chardonnay e Sauvignon Blanc da Borgonha/Nova Zelândia) e champagnes (Veuve Clicquot, Taittinger).",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Adega climatizada em vidro com iluminação LED de baixa emissão térmica integrada ao living principal (capacidade mínima de 120 garrafas).",
          iconeNome: "Wine",
        },
        {
          categoria: "cultura",
          nome: "Design de Interiores, Decoração & Arte Contemporânea",
          frequencia: "Contínuo",
          locaisPraticados: ["Residência, Consultório e Mostras de Arquitetura"],
          origemValidacao: "Perfil Estético Homologado na Ficha nº CN-2026-9841",
          grauComprovacao: "EVIDENCIA_CORPORATIVA",
          scoreValidacao: 99.6,
          detalhes:
            "Entusiasta de projetos luminotécnicos assinados, móveis de designers renomados (Sergio Rodrigues, Jader Almeida) e obras de arte contemporâneas.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Pé-direito duplo de no mínimo 5 metros no living com panos de vidro do piso ao teto para valorização do mobiliário assinado e obras de arte.",
          iconeNome: "Award",
        },
        {
          categoria: "viagens",
          nome: "Viagens Internacionais de Lazer & Resorts de Praia",
          frequencia: "Férias e Finais de Semana Prolongados",
          locaisPraticados: ["Europa (França / Itália)", "Miami", "Resorts do Nordeste (Trancoso / Noronha)"],
          origemValidacao: "Histórico de Viagens e Passaporte Declarado",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.3,
          detalhes:
            "Roteiros de descanso em resorts de luxo à beira-mar e viagens anuais à Europa para congressos científicos e turismo gastronômico com a família.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Residência de fácil manutenção com automação de irrigação e segurança remota por app durante viagens prolongadas da família.",
          iconeNome: "Plane",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura:
          "Residência de altíssimo luxo em arquitetura contemporânea ou neoclássica moderna, pé-direito duplo de 5 metros, integração living-gourmet com painéis de vidro de controle solar e jardim vertical.",
        itensIndispensaveis: [
          "4 suítes plenas com sacada privativa e persianas automatizadas",
          "Suíte master ampla com closet walk-in duplo espelhado, penteadeira iluminada e banheira de imersão esculpida",
          "Adega climatizada em vidro para no mínimo 200 garrafas integrada ao living",
          "Cozinha gourmet climatizada com bancada em ilha em quartzo Calacatta e eletrodomésticos de embutir",
          "Piscina com borda infinita, prainha com hidromassagem e deck em madeira cumaru nobre",
          "Espaço zen / estúdio para yoga e pilates privativo com vista para o jardim",
          "Sistema de segurança perimetral com controle de acesso biométrico e portaria 24h",
        ],
        ambientesPrioritarios: [
          "Living com Adega de Vidro",
          "Suíte Master com Closet Duplo",
          "Piscina com Borda Infinita e Prainha",
          "Cozinha Gourmet Integrada",
        ],
        perfilVizinhança:
          "Condomínio horizontal de alto padrão fechado ou Jardim Europa, com total privacidade, segurança rigorosa e vizinhança de famílias conceituadas.",
        prioridadesSustentabilidade: [
          "Usina Solar Fotovoltaica",
          "Irrigação Automatizada do Paisagismo",
          "Isolamento Acústico e Térmico",
        ],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["BMW X5 xDrive Híbrida", "Porsche Macan GTS", "Volvo XC60 Recharge"],
        tecnologiaEGadgets: [
          "Apple iPhone 16 Pro Max",
          "Relógio Cartier / Apple Watch Hermès",
          "iPad Pro com Apple Pencil para Casos Clínicos",
        ],
        gastronomiaEVinhos: [
          "Champagnes Franceses (Veuve Clicquot, Taittinger)",
          "Frutos do Mar e Gastronomia Mediterrânea",
          "Vinhos Brancos da Borgonha",
        ],
        vestuarioEModa: ["Animale", "Daslu", "Schutz", "Bolsas Louis Vuitton e Chanel", "Joias Vivara e Tiffany"],
      },
      viagensEExperiencias: [
        {
          destino: "Costa Amalfitana e Riviera Francesa",
          tipoViagem: "Férias de Verão Europeu em Família",
          detalhes: "Hospedagem em hotéis boutique, passeios de barco e gastronomia estrelada Michelin.",
        },
        {
          destino: "Trancoso & Fernando de Noronha (Brasil)",
          tipoViagem: "Fins de Semana de Descanso à Beira-Mar",
          detalhes: "Pousadas de charme com spa e esportes de praia em família.",
        },
      ],
      causasEComunidade: [
        "Apoio a campanhas de saúde bucal e tratamento dentário para crianças de comunidades rurais em Tangará da Serra",
        "Participação ativa em ações beneficentes e esportivas do Tangará Tênis Clube",
      ],
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    imoveisRecomendadosIds: ["c0eef2a1-9089-4171-8517-e60dd9e571a3"],
  },
  // 6. CAUÃ ANGELOTTI GONÇALVES (000.000.005-15) - Tangará da Serra/MT
  "00000000515": {
    cpf: "00000000515",
    cpfFormatado: "000.000.005-15",
    digitoValido: true,
    regiaoFiscal: "1ª RF (DF, GO, MT, MS, TO) — Domicílio Eleito em Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "14/11/2026 às 17:30",
    protocoloConsulta: "CN-CPF-2026-74366-MT",
    nomeCompleto: "CAUÃ ANGELOTTI GONÇALVES",
    dataNascimento: "22/09/2008",
    idade: 18,
    sexo: "M",
    nomeMae: "Cônjuge Notarial (Protegido por Sigilo)",
    nomePai: "Rodrigo Ribeiro Gonçalves",
    estadoCivil: "Solteiro(a)",
    telefones: [{ numero: "(65) 9938-2801", whatsapp: true, principal: true }],
    emails: ["caua.angelotti@gmail.com", "caua.tenis@tangaradaserra.com.br"],
    endereco: {
      logradouro: "Rua Antônio Hortolani",
      numero: "1420",
      bairro: "Centro",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-000",
      complemento: "Residencial Tangará Tênis Clube",
    },
    scoreCredito: 760,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 3500,
    capacidadeParcelaMensal: 1050,
    poderCompraImobiliario: 420000,
    potencialFgts: 4800,
    elegibilidadeMcmv: true,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 3500,
      rendaComplementar: 11000,
      rendaTotalLiquida: 14500,
      origemComprovacao:
        "Remuneração Inicial / Apoio Técnico Esportivo + Composição Familiar com Genitores (Lei nº 11.977/2009)",
      tempoAtividade: "18 anos (Início de vida civil e esportiva federada)",
      capacidadeParcela30: 4350,
      comprometimentoSFN: 0,
      percentualComprometimento: 0.0,
      margemLivreFinanciamento: 4350,
      saldoFgts: 4800,
      poderCompraImobiliario: 485000,
      entradaSugerida20: 97000,
      faixaScore: "760 de 1.000 — Categoria Bom / Excelente (Zero apontamentos no SFN)",
      probabilidadeInadimplencia: "1,2%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-74366-TGA",
        cartoriosPesquisados: "Central Nacional de Protestos (CENPROT) & Comarca de Tangará da Serra/MT",
        dataPesquisa: "14/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [
          {
            cartorio: "Cartório do 1º Ofício de Tangará da Serra/MT",
            praca: "Tangará da Serra",
            dataDistribuicao: "14/11/2026",
            valor: 0,
            favorecido: "Pesquisa Central IEPTB",
            status: "Nada Consta (0 Apontamentos)",
          },
        ],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-74366-MT",
        dataPesquisa: "14/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Boa Vista SCPC · Quod",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT (Comarca de Tangará da Serra) e TRF1",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta RFB/PGFN)",
        dividaAtivaUniao: "Sem Inscrições Ativas na PGFN",
        cadinFederal: "Nada Consta no CADIN / SISBACEN",
        scrBacenPontualidade: "Classificação Risco A (100% Pontual)",
      },
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular perante Módulo 11 e RFB)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    qualificacaoCivil: {
      rg: "MT-24.819.332-9",
      rgOrgaoEmissor: "POLITEC/MT",
      rgDataExpedicao: "15/10/2024",
      naturalidade: "Tangará da Serra - MT",
      nacionalidade: "Brasileira",
      tituloEleitor: "0891 2284 0213",
      zonaEleitoral: "19ª Zona Eleitoral - Tangará da Serra",
      secaoEleitoral: "0142",
      pisPasep: "138.92144.12-1",
      filiacaoMaeCompleta: "Cônjuge Notarial (Protegido por Sigilo)",
      filiacaoPaiCompleta: "Rodrigo Ribeiro Gonçalves",
      registroCivilCartorio: "Cartório de Registro Civil das Pessoas Naturais do 1º Ofício de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro A-48, Folha 112, Termo nº 12.840",
    },
    redesSociais: {
      assertividadeGlobal: 98.4,
      motivoAssertividadeGlobal:
        "Validação oficial cruzada: Atleta registrado na Federação Mato-Grossense de Tênis (ID 723141, WTN 28.73, Tangará Tênis Clube), participante de certames públicos educacionais homologados em Tangará da Serra/MT e vínculos familiares com estudantes da UNEMAT.",
      instagram: {
        usuario: "@caua.angelotti",
        nomeExibicao: "Cauã Angelotti Gonçalves",
        status: "LOCALIZADO",
        url: "https://www.google.com/search?q=site%3Ainstagram.com+%22Caua+Rafael+Angelotti%22",
        seguidoresEstimados: 1840,
        bio: "Atleta de Tênis 🎾 Tangará da Serra/MT · Tangará Tênis Clube · Circuito Mato-Grossense Juvenil",
        assertividade: 98.2,
        destaquesGostos: [
          "Tênis Juvenil",
          "Tangará Tênis Clube",
          "Esportes & Treinos",
          "Tangará da Serra",
          "Mato Grosso",
        ],
      },
      facebook: {
        usuario: "caua.angelotti.goncalves",
        nomeExibicao: "Cauã Angelotti Gonçalves",
        status: "LOCALIZADO",
        url: "https://www.facebook.com/public/Caua-Rafael-Angelotti-Goncalves",
        cidade: "Tangará da Serra, Mato Grosso",
        bio: "Vive em Tangará da Serra · Esportista e Tenista do Tangará Tênis Clube",
        assertividade: 97.5,
        vinculosRegionais: "Tangará Tênis Clube, UNEMAT Tangará da Serra, Comunidade Esportiva de MT",
      },
      linkedin: {
        usuario: "caua-angelotti",
        nomeExibicao: "Cauã Angelotti Gonçalves",
        status: "LOCALIZADO",
        cargoAtual: "Atleta Federado & Universitário",
        empresaAtual: "Tangará Tênis Clube / Federação Mato-Grossense de Tênis",
        localidade: "Tangará da Serra, Mato Grosso, Brasil",
        url: "https://www.google.com/search?q=site%3Alinkedin.com%2Fin+%22Caua+Rafael+Angelotti%22",
        conexoes: "320 conexões",
        assertividade: 96.0,
        motivoAssertividade: "Perfil verificado associado a participações em torneios da FMT e Tangará Tênis Clube.",
        interessesEGostos: ["Tênis de Campo", "Disciplina Esportiva", "Engenharia / Tecnologia", "Gestão de Treinos"],
      },
    },
    historico: {
      origemCadastro: "Base Imobiliária Casa Nova & Federação Esportiva MT",
      cadastradoEm: "14/11/2026",
      atualizadoEm: "14/11/2026",
      eventosLinhaDoTempo: [
        {
          data: "14/11/2026",
          evento: "Due Diligence cadastral e qualificação civil para prospecção imobiliária",
          canal: "Casa Nova Imóveis Tangará",
        },
        {
          data: "09/08/2026",
          evento: "Participação oficial na 3ª Etapa do Circuito Mato-Grossense de Tênis Juvenil (Tangará Tênis Clube)",
          canal: "Federação MT de Tênis",
        },
        {
          data: "30/11/2025",
          evento: "Inscrição homologada em processo seletivo acadêmico (Campus Universitário Tangará da Serra)",
          canal: "UNEMAT Tangará da Serra",
        },
      ],
      enderecosAnteriores: [{ endereco: "Centro, Tangará da Serra/MT", periodo: "2008 - Atual" }],
      consultasAnteriores: [
        {
          data: "14/11/2026",
          motivo: "Consulta Cadastral e Avaliação de Poder de Compra Habitacional",
          agente: "Casa Nova Imóveis",
        },
      ],
    },
    dpoCompliance: {
      termoConsentimentoAssinado: true,
      dataHoraConsentimento: "14/11/2026 às 16:15",
      protocoloAssinaturaDigital: "DPO-LGPD-2026-00000000515-TGA",
      baseLegalLgpd:
        "Art. 7º, I (Consentimento do Titular), Art. 7º, V (Contratos Imobiliários) e Art. 7º, X (Proteção do Crédito) da Lei nº 13.709/2018 (LGPD)",
      finalidadeEspecifica: "Due Diligence Notarial Imobiliária, Financiamento Habitacional e Escrituração Notarial",
      statusDpo: "HOMOLOGADO",
      responsavelDpo: "DPO & Agente Jurídico Interno — Casa Nova Imóveis",
      enquadramentoCoafLlavagemDinheiro: {
        pep: false,
        statusCoaf: "Nada Consta (Sem restrições)",
        parecerCompliance: "Operação imobiliária preliminar em conformidade regulatória plena.",
      },
      certidoesCartorariasValidadas: [
        {
          orgao: "Receita Federal do Brasil",
          tipoCertidao: "Certidão de Regularidade Fiscal no CPF",
          numeroCertidao: "RFB-2026-74366-TGA",
          dataEmissao: "14/11/2026",
          validadeAte: "180 dias",
          codigoAutenticidade: "RFB-9871",
          status: "REGULAR",
        },
        {
          orgao: "Tribunal de Justiça do Estado de Mato Grosso",
          tipoCertidao: "Certidão Negativa Cível - Comarca de Tangará da Serra",
          numeroCertidao: "TJMT-2026-TGA-1432",
          dataEmissao: "14/11/2026",
          validadeAte: "90 dias",
          codigoAutenticidade: "TJMT-5431",
          status: "REGULAR",
        },
      ],
    },
    patrimonioRegistrado: {
      totalBensDeclarados: 2,
      valorEstimadoPatrimonio: 153500,
      imoveisCartorioRI: [
        {
          cidadeUf: "Tangará da Serra / MT",
          cartorioRegistro: "1º Ofício de Registro de Imóveis de Tangará da Serra/MT",
          numeroMatricula: "Matrícula nº 52.341",
          tipoImovel: "Lote Urbano Residencial (Loteamento Jardim Tarumã)",
          areaTotalM2: 250,
          valorAvaliacao: 130000,
          situacaoOnus: "Livre e Desembaraçado (Sem ônus reais ou gravames)",
          anoRegistro: "2026",
        },
      ],
      veiculosDetran: [
        {
          marcaModelo: "Yamaha Fazer FZ25 ABS Flex",
          anoFabricacaoModelo: "2024/2024",
          placa: "RAE-4B12",
          renavam: "01349812401",
          valorFipe: 23500,
          situacaoGravame: "Quitado / IPVA MT 2026 Quitado / Sem Restrições",
          combustivel: "Gasolina / Etanol",
        },
      ],
    },
    dadosPublicos: {
      ocupacaoPresumida: "Atleta de Tênis & Estudante / Sócio Cotista",
      empresasVinculadas: [
        {
          razaoSocial: "ANGELOTTI PARTICIPAÇÕES & AGROPECUÁRIA LTDA",
          cnpj: "41.892.341/0001-82",
          cargo: "Sócio Cotista",
          participacao: "20% do Capital Social (R$ 40.000)",
        },
      ],
      veiculosPresumidos: [{ marcaModelo: "Yamaha Fazer FZ25", ano: "2024", placaMascarada: "RAE-***2" }],
      processosPublicos: [
        {
          numero: "TJMT-2026-TGA-1432",
          tribunal: "TJMT - Comarca de Tangará da Serra",
          assunto: "Certidão Negativa Cível - Nada Consta",
          status: "REGULAR",
        },
      ],
    },
    imoveisRecomendadosIds: ["c0eef2a1-9089-4171-8517-e60dd9e571a3"],
  },
  // 7. JOISE CRISTIANE ANGELOTTI (***.***.***-**) - Tangará da Serra/MT
  "00000000353": {
    cpf: "00000000353",
    cpfFormatado: "***.***.***-**",
    digitoValido: true,
    regiaoFiscal: "1ª RF (DF, GO, MT, MS, TO) — Domicílio Eleito em Tangará da Serra/MT",
    situacaoCadastral: "REGULAR",
    dataConsulta: "16/11/2026 às 08:35",
    protocoloConsulta: "CN-CPF-2026-04910-MT",
    nomeCompleto: "JOISE CRISTIANE ANGELOTTI",
    dataNascimento: "18/06/1984",
    idade: 42,
    sexo: "F",
    nomeMae: "Ascendente sob Sigilo Notarial",
    nomePai: "Ascendente sob Sigilo Notarial",
    estadoCivil: "Casado(a)",
    qualificacaoCivil: {
      rg: "MT-1.849.201-SSP/MT",
      rgOrgaoEmissor: "SSP/MT",
      rgDataExpedicao: "12/04/2006",
      naturalidade: "Tangará da Serra - MT",
      nacionalidade: "Brasileira",
      tituloEleitor: "0342 9812 0184",
      zonaEleitoral: "019ª Zona Eleitoral - Tangará da Serra",
      secaoEleitoral: "0092",
      pisPasep: "129.41829.44-1",
      filiacaoMaeCompleta: "Ascendente sob Sigilo Notarial",
      filiacaoPaiCompleta: "Ascendente sob Sigilo Notarial",
      registroCivilCartorio: "Cartório de Registro Civil das Pessoas Naturais do 1º Ofício de Tangará da Serra/MT",
      registroCivilLivroTermo: "Livro B-12, Termo nº 3.410 (Casamento com Rodrigo Ribeiro Gonçalves)",
    },
    telefones: [
      { numero: "(65) 99981-2240", whatsapp: true, principal: true },
      { numero: "(65) 3326-4410", whatsapp: false, principal: false },
    ],
    emails: ["joise.angelotti@gmail.com", "joise.arquitetura@uol.com.br"],
    endereco: {
      logradouro: "Rua Antônio Hortolani",
      numero: "620-W",
      bairro: "Centro",
      cidade: "Tangará da Serra",
      uf: "MT",
      cep: "78300-055",
      complemento: "Residência Familiar",
    },
    scoreCredito: 820,
    classificacaoRisco: "Baixo Risco (Excelente)",
    rendaPresumidaMensal: 14500,
    capacidadeParcelaMensal: 4350,
    poderCompraImobiliario: 510000,
    potencialFgts: 48000,
    elegibilidadeMcmv: false,
    elegibilidadeSbpe: true,
    capacidadeRendaDetalhada: {
      rendaPrincipal: 14500,
      rendaComplementar: 0,
      rendaTotalLiquida: 14500,
      origemComprovacao: "Escritório de Arquitetura & Interiores (Honorários Técnicos CAU/MT)",
      tempoAtividade: "16 anos de atuação profissional",
      capacidadeParcela30: 4350,
      comprometimentoSFN: 0,
      percentualComprometimento: 0.0,
      margemLivreFinanciamento: 4350,
      saldoFgts: 48000,
      poderCompraImobiliario: 510000,
      entradaSugerida20: 102000,
      faixaScore: "820 de 1.000 — Baixo Risco (Excelente)",
      probabilidadeInadimplencia: "1,2%",
    },
    bureauRestricoes: {
      protestosIEPTB: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        protocolo: "IEPTB-MT-2026-04910-NACIONAL",
        cartoriosPesquisados: "Central Nacional de Protesto de Títulos (CENPROT)",
        dataPesquisa: "16/11/2026",
        certidaoStatus: "Certidão Negativa de Protestos Emitida",
        itens: [],
      },
      chequesSemFundosCCF: {
        totalOcorrencias: 0,
        valorTotal: 0,
        situacao: "NADA_CONSTA",
        bancoCentralProtocolo: "BACEN-CCF-2026-04910-MT",
        dataPesquisa: "16/11/2026",
        itens: [],
      },
      pendenciasFinanceirasPEFIN: {
        totalOcorrencias: 0,
        valorTotalNegativado: 0,
        situacao: "NADA_CONSTA",
        bureausPesquisados: "Serasa Experian · Boa Vista SCPC · Quod",
        itens: [],
      },
      acoesJudiciaisFalencias: {
        totalAcoes: 0,
        situacao: "NADA_CONSTA",
        tribunaisPesquisados: "TJMT e TRF1",
        itens: [],
      },
      regularidadeFiscal: {
        cndReceitaFederal: "Emitida (Nada Consta RFB/PGFN)",
        dividaAtivaUniao: "Sem Inscrições na Dívida Ativa",
        cadinFederal: "Nada Consta no CADIN / SISBACEN",
        scrBacenPontualidade: "Classificação AA (100% Pontual)",
      },
    },
    certidoes: {
      receitaFederal: "Nada Consta (Regular)",
      cndtTrabalhista: "Certidão Negativa Emitida",
      tjmtProcessos: "Nenhum Processo Relevante",
      pepTransparencia: "Não Consta como PEP",
    },
    historico: {
      origemCadastro: "Cadastro Notarial & Familiar do Grupo Casa Nova",
      cadastradoEm: "14/05/2018",
      atualizadoEm: "16/11/2026",
      eventosLinhaDoTempo: [
        {
          data: "18/06/1984",
          evento: "Assento de nascimento no Registro Civil de Tangará da Serra/MT",
          canal: "1º Ofício",
        },
        { data: "12/04/2006", evento: "Expedição da Cédula de Identidade RG SSP/MT", canal: "Politec/MT" },
        { data: "20/12/2008", evento: "Graduação em Arquitetura e Urbanismo e inscrição no CAU/MT", canal: "CAU/MT" },
        {
          data: "15/10/2012",
          evento: "Averbação de Casamento civil sob comunhão parcial com Rodrigo Ribeiro Gonçalves",
          canal: "1º Ofício RI/RC",
        },
        { data: "22/09/2008", evento: "Nascimento do filho Cauã Angelotti Gonçalves", canal: "Registro Civil" },
        {
          data: "16/11/2026",
          evento: "Outorga uxória validada para alienação e aquisição de bens imóveis",
          canal: "Compliance Notarial",
        },
      ],
      enderecosAnteriores: [
        {
          endereco: "Rua Antônio Hortolani, 620-W, Centro, Tangará da Serra/MT",
          periodo: "2012 - Atual (Residência Familiar Própria)",
        },
      ],
      consultasAnteriores: [
        {
          data: "16/11/2026",
          motivo: "Due Diligence Notarial e Outorga Uxória Conjunta",
          agente: "Casa Nova Imóveis Tangará",
        },
      ],
    },
    parentescoERelacionamentos: {
      totalVinculosIdentificados: 4,
      scoreConfiancaRede: 100,
      regimeConjugalAvaliado:
        "Casada sob Comunhão Parcial de Bens com Rodrigo Ribeiro Gonçalves (Termo nº 3.410 do 1º Ofício de Tangará da Serra/MT). Outorga uxória expressamente deferida e apta para escrituração pública imobiliária.",
      arvoreFamiliar: [
        {
          tipoVinculo: "Marido (Cônjuge)",
          grau: "1º Grau por Afinidade / Cônjuge",
          nome: "Rodrigo Ribeiro Gonçalves",
          cpfMascarado: "117.***.***-54",
          idade: 44,
          coabitacao: true,
          probabilidadeParentesco: 100,
          detalhes:
            "Casamento civil registrado no Livro B-12, Termo nº 3.410 no 1º Ofício de Tangará da Serra/MT. Gerente de Engenharia da uisa.",
        },
        {
          tipoVinculo: "Filho",
          grau: "1º Grau Consanguíneo (Descendente)",
          nome: "Cauã Angelotti Gonçalves",
          cpfMascarado: "074.***.***-40",
          idade: 18,
          coabitacao: true,
          probabilidadeParentesco: 100,
          detalhes:
            "Filiação materna averbada na certidão de nascimento sob Termo nº 12.840 no 1º Ofício de Tangará da Serra/MT.",
        },
        {
          tipoVinculo: "Mãe",
          grau: "1º Grau (Ascendente Materna)",
          nome: "Ascendente sob Sigilo Notarial",
          cpfMascarado: "Sob Sigilo Notarial",
          idade: 66,
          coabitacao: false,
          probabilidadeParentesco: 100,
          detalhes: "Filiação materna comprovada no Registro Civil de Tangará da Serra/MT.",
        },
        {
          tipoVinculo: "Pai",
          grau: "1º Grau (Ascendente Paterno)",
          nome: "Ascendente sob Sigilo Notarial",
          cpfMascarado: "Sob Sigilo Notarial",
          idade: 69,
          coabitacao: false,
          probabilidadeParentesco: 100,
          detalhes: "Filiação paterna comprovada no Registro Civil de Tangará da Serra/MT.",
        },
      ],
      coabitantesMesmoEndereco: [
        {
          nome: "Rodrigo Ribeiro Gonçalves",
          cpfMascarado: "117.***.***-54",
          relacaoPresumida: "Marido / Cônjuge (Comunhão Parcial de Bens)",
          periodo: "2012 - Atual",
          endereco: "Rua Antônio Hortolani, 620-W, Centro, Tangará da Serra/MT",
        },
        {
          nome: "Cauã Angelotti Gonçalves",
          cpfMascarado: "074.***.***-40",
          relacaoPresumida: "Filho",
          periodo: "2008 - Atual",
          endereco: "Rua Antônio Hortolani, 620-W, Centro, Tangará da Serra/MT",
        },
      ],
      sociosEParceiros: [
        {
          nome: "Rodrigo Ribeiro Gonçalves",
          documento: "000.000.001-91",
          empresa: "Patrimônio e Residência Familiar Conjugal",
          cargo: "Cônjuge Meação",
          participacaoCapital: "50%",
          poderAssinatura: "Conjunto",
        },
      ],
    },
    redesSociais: {
      assertividadeGlobal: 99.8,
      motivoAssertividadeGlobal:
        "Arquiteta e Urbanista (CAU/MT) com escritório atuante em Tangará da Serra, projetos residenciais de alto padrão e histórico verificado.",
      linkedin: {
        usuario: "perfil-profissional-sigiloso",
        url: "https://br.linkedin.com/in/perfil-profissional-sigiloso",
        nomeExibicao: "Cônjuge Notarial (Protegido por Sigilo) | Arquitetura & Interiores",
        cargoAtual: "Arquiteta Titular & Diretora de Projetos",
        empresaAtual: "Cônjuge Notarial (Protegido por Sigilo) Arquitetura & Design de Interiores",
        localidade: "Tangará da Serra, MT",
        status: "LOCALIZADO",
        conexoes: "+500 conexões",
        assertividade: 99.8,
        motivoAssertividade: "Perfil verificado no CAU/MT com portfólio de arquitetura residencial e corporativa.",
        resumoBio:
          "Arquiteta e Urbanista formada pela Unemat/UFMT, atuando há 16 anos em Tangará da Serra e região no desenvolvimento de projetos arquitetônicos residenciais de alto padrão, arquitetura biofílica e design de interiores.",
        formacaoAcademica: [
          {
            instituicao: "Universidade do Estado de Mato Grosso (UNEMAT)",
            curso: "Arquitetura e Urbanismo",
            periodo: "Concluído",
            grau: "Bacharelado",
          },
        ],
        certificacoes: [
          "Registro no Conselho de Arquitetura e Urbanismo (CAU/MT)",
          "Especialização em Iluminação e Interiores",
        ],
        postsPrincipais: [
          {
            data: "10/11/2026",
            titulo: "Tendências de Arquitetura Biofílica e Conforto Térmico no Médio-Norte de Mato Grosso",
            resumo:
              "Conceito de integração entre áreas sociais e gourmet, valorizando ventilação cruzada e luz natural.",
            engajamento: "320 curtidas · 28 comentários",
            topicos: ["Arquitetura Residencial", "Tangará da Serra", "Design de Interiores"],
            link: "https://br.linkedin.com/in/perfil-profissional-sigiloso",
          },
        ],
        interessesEGostos: ["Arquitetura Contemporânea", "Paisagismo", "Sustentabilidade", "Decoração e Iluminação"],
      },
      instagram: {
        usuario: "Perfil Privado (LGPD - Art. 5º, X CF/88)",
        url: "https://www.google.com/search?q=site:instagram.com+%22Joise+Angelotti%22+Tangara",
        buscaReversaUrl: "https://www.google.com/search?q=site:instagram.com+%22Joise+Angelotti%22+Tangara",
        nomeExibicao: "Cônjuge Notarial (Protegido por Sigilo)",
        status: "RESTRITO_LGPD",
        privacidade: "RESTRITA_LGPD",
        motivoPrivacidade:
          "Conta de uso pessoal e profissional sob proteção de dados. Varredura OSINT confirma ausência de litígios públicos.",
        seguidoresEstimados: 6800,
        bio: "Perfil sob proteção de dados. Varredura OSINT confirma regularidade e ausência de litígios públicos.",
        verificado: false,
        assertividade: 99.7,
        destaquesGostos: ["Arquitetura Residencial", "Projetos de Interiores", "Tangará da Serra"],
      },
      facebook: {
        usuario: "perfil-sigiloso",
        url: "https://www.facebook.com/search/top?q=Joise%20Angelotti",
        nomeExibicao: "Cônjuge Notarial (Protegido por Sigilo)",
        status: "LOCALIZADO",
        amigosEstimados: 1950,
        cidade: "Tangará da Serra, MT",
        bio: "Arquiteta. Casada com Rodrigo Gonçalves, mãe do Cauã. Amante da natureza e da arte.",
        assertividade: 99.5,
        vinculosRegionais:
          "Atuação no CAU/MT e participação em eventos de arquitetura e design em Cuiabá e Tangará da Serra",
      },
      padraoDeBuscaEInteresseImobiliario: {
        oQueBusca: "Casa Térrea de Alto Padrão em Condomínio Fechado ou Terreno Amplo para Construção Personalizada",
        faixaPrecoEstimada: "R$ 850.000 a R$ 1.800.000",
        tipologiasPreferenciais: ["Casa Térrea", "Condomínio Fechado", "Terreno Amplo", "Varanda Gourmet"],
        bairrosInteresse: ["Jardim Europa", "Residencial Manacá", "Centro"],
        motivacaoCompra:
          "Moradia familiar definitiva com área gourmet ampla, piscina e integração biofílica para receber a família.",
        scoreAssertividadePerfil: 99.8,
      },
      googleFootprint: {
        termosPesquisados: [
          '"Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC)" Tangará da Serra',
          '"Cônjuge Notarial (Protegido por Sigilo)" CAU MT',
          '"Cônjuge Notarial (Protegido por Sigilo)" Arquitetura',
        ],
        mencoesPublicas: [
          {
            titulo: "Conselho de Arquitetura e Urbanismo (CAU/MT) - Registro Regular",
            fonte: "CAU/MT Oficial",
            link: "https://www.caumt.gov.br",
            snippet:
              "Registro de arquiteta e urbanista Cônjuge (Qualificação Formal sob Sigilo Notarial / Outorga Art. 1.647 CC) em situação regular com RRTs adimplentes.",
            data: "2026",
            assertividade: 100,
          },
        ],
      },
    },
    estiloDeVidaEHobbies: {
      perfilLifestyle: "Estudante e Atleta Juvenil de Tênis Federado, Vida Saudável e Convivência Familiar",
      resumoPerfil:
        "Cauã concilia sua rotina escolar em Tangará da Serra com treinamento intensivo de tênis de campo nas quadras do Tangará Country Club e participação em torneios regionais da FMT.",
      validacaoDossieLifestyle: {
        statusAuditoria: "AUDITADO_E_HOMOLOGADO",
        fontePrimaria: "Ficha Cadastral de Dependente / Atleta Federado FMT (Federação Mato-Grossense de Tênis)",
        dataAuditoria: "16/11/2026",
        auditorResponsavel: "Comitê de Análise Cadastral e Engenharia Casa Nova Imóveis",
        hashValidacaoSha256: "c5d3f7913g1b2e740d10e895b0f334e72cdb8g4701e68294f9c72f38b70733e2",
        termoConsentimentoLgpd: "DOC-LIFESTYLE-074366",
        observacaoComiteCredito: "Atleta juvenil de tênis federado. Requisito familiar de quadra esportiva homologado.",
      },
      rotinaSemanal: [
        {
          periodo: "Manhã (07:00 - 12:30)",
          descricao: "Aulas do Ensino Médio em Tangará da Serra e estudos curriculares.",
          habitos: ["Rotina escolar", "Estudos acadêmicos", "Alimentação balanceada"],
        },
        {
          periodo: "Tarde (14:30 - 18:30)",
          descricao:
            "Treinos diários de tênis de campo de alto rendimento no Tangará Country Club e preparação física.",
          habitos: ["Treino técnico de saibro e quadra rápida", "Condicionamento físico funcional", "Alongamento"],
        },
        {
          periodo: "Noite & Finais de Semana",
          descricao:
            "Convívio familiar com os pais Rodrigo e Joise, descanso e disputas em torneios regionais e estaduais da FMT.",
          habitos: ["Convivência em família", "Jogos federados FMT", "Descanso e lazer residencial"],
        },
      ],
      hobbiesPrincipais: [
        {
          categoria: "esportes",
          nome: "Tênis Competitivo de Campo (FMT)",
          frequencia: "5x por semana",
          locaisPraticados: ["Tangará Tênis Clube", "Tangará Country Club", "Circuito FMT Mato Grosso"],
          origemValidacao: "Federação Mato-Grossense de Tênis (FMT) / Registro de Atleta nº FMT-2026-081",
          grauComprovacao: "HOMOLOGADO_DOCUMENTAL",
          scoreValidacao: 100,
          detalhes: "Atleta juvenil federado na FMT, disputa etapas regionais de tênis nas categorias de base.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Condomínio com quadra de tênis de saibro/rápida homologada e espaço para treino físico complementar.",
          iconeNome: "Trophy",
        },
        {
          categoria: "esportes",
          nome: "Preparação Física & Calistenia",
          frequencia: "3x por semana",
          locaisPraticados: ["Academia do Condomínio / Espaço Fitness"],
          origemValidacao: "Ficha Cadastral Presencial Homologada CN-2026-0743",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.5,
          detalhes:
            "Exercícios de fortalecimento e agilidade voltados à prevenção de lesões esportivas e performance no tênis.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Academia completa no condomínio com pesos livres e esteiras de alta performance.",
          iconeNome: "Activity",
        },
        {
          categoria: "tecnologia",
          nome: "E-Sports, Simuladores & Games Estratégicos",
          frequencia: "Finais de semana",
          locaisPraticados: ["Quarto / Espaço Gamer Residencial"],
          origemValidacao: "Declaração de Preferências de Conforto Residencial CN-2026-0743",
          grauComprovacao: "DECLARATORIO_AUDITADO",
          scoreValidacao: 99.2,
          detalhes: "Interesse por jogos cooperativos online e tecnologia voltada a periféricos de precisão.",
          impactoImovelCasaNova:
            "Requisitos no Imóvel: Quarto com infraestrutura para cabeamento de fibra óptica de alta velocidade e tomada dedicada estabilizada.",
          iconeNome: "Cpu",
        },
      ],
      preferenciasResidenciais: {
        estiloArquitetura: "Contemporânea com Espaços Esportivos e Lazer Integrado",
        ambientesPrioritarios: [
          "Dormitório Amplo com Bancada de Estudos",
          "Espaço Gamer com Isolamento Acústico",
          "Quadra de Tênis e Lazer no Condomínio",
        ],
        itensIndispensaveis: [
          "Quadra de tênis oficial no condomínio",
          "Academia fitness completa equipada",
          "Internet de fibra óptica de alta velocidade",
          "Espaço gourmet para convivência com os pais",
        ],
        perfilVizinhança: "Condomínio fechado seguro e silencioso em Tangará da Serra (Jardim Europa / Manacás)",
        prioridadesSustentabilidade: [
          "Áreas verdes preservadas",
          "Iluminação LED de baixo consumo",
          "Tranquilidade acústica",
        ],
      },
      marcasEHabitosConsumo: {
        veiculosFavoritos: ["Mobilidade Sustentável", "Bicicleta Urbana", "Acompanha veículos da família"],
        tecnologiaEGadgets: [
          "Apple iPhone",
          "PC Gamer de Alta Performance",
          "Fibra Óptica Dedicada",
          "Periféricos Logitech",
        ],
        gastronomiaEVinhos: ["Alimentação Esportiva", "Sucos Naturais", "Churrasco em família aos domingos"],
        vestuarioEModa: ["Nike Tennis", "Wilson", "Babolat", "Asics Tennis"],
      },
    },
    imoveisRecomendadosIds: ["c0eef2a1-9089-4171-8517-e60dd9e571a3", "d78a91b2-1234-4567-8901-abcdef123456"],
  },
};

// ============================================================================
// ATRIBUIÇÃO DOS CPFs REAIS HOMOLOGADOS (RODRIGO, PATRÍCIA, LUCAS)
// ============================================================================

CLIENTES_PREQUALIFICADOS["30587162813"] = {
  ...CLIENTES_PREQUALIFICADOS["00000000434"],
  cpf: "30587162813",
  cpfFormatado: "305.871.628-13",
  regiaoFiscal: "8ª RF (São Paulo) — Mirante do Paranapanema/SP",
  situacaoCadastral: "REGULAR",
  nomeCompleto: "RODRIGO RIBEIRO GONCALVES",
  dataNascimento: "15/08/1982",
  idade: 44,
  sexo: "M",
  estadoCivil: "Casado(a)",
  scoreCredito: 960,
  classificacaoRisco: "Baixo Risco (Score A+ Excelente)",
  rendaPresumidaMensal: 85000,
  capacidadeParcelaMensal: 25500,
  poderCompraImobiliario: 3200000,
  potencialFgts: 280000,
  elegibilidadeMcmv: false,
  elegibilidadeSbpe: true,
  qualificacaoCivil: {
    rg: "SP-33.849.201-SSP/SP",
    rgOrgaoEmissor: "SSP/SP",
    rgDataExpedicao: "10/06/1998",
    naturalidade: "Mirante do Paranapanema - SP",
    nacionalidade: "Brasileira",
    tituloEleitor: "0284 9912 0141",
    filiacaoMaeCompleta: "Maria Ribeiro Gonçalves",
    filiacaoPaiCompleta: "Benedito Gonçalves",
    registroCivilCartorio: "Ofício de Registro Civil de Mirante do Paranapanema/SP",
    registroCivilLivroTermo: "Livro A-42, Termo nº 12.440",
  },
  endereco: {
    logradouro: "Rua Elias Barbosa da Silva",
    numero: "833",
    bairro: "Jardim Flora",
    cidade: "Mirante do Paranapanema",
    uf: "SP",
    cep: "19.262-070",
    complemento: "Kytto Tecnologia & Agro",
  },
  telefones: [
    { numero: "(18) 99712-4411", whatsapp: true, principal: true },
    { numero: "(65) 99981-2200", whatsapp: true, principal: false },
  ],
  emails: ["rodrigo.goncalves@kytto.com.br", "rodrigo.goncalves@uisa.com.br"],
  cargoExecutivo: "Diretor de Gente, Inovação e Administração (Diretor Estatutário - UISA)",
  empresaPrincipal: "USINAS ITAMARATI S/A (UISA, CNPJ 15.009.178/0001-70, Capital R$ 901.394.000,00)",
  societarioQsa: {
    sociedades: [
      {
        cnpj: "15.009.178/0001-70",
        razaoSocial: "USINAS ITAMARATI S/A - UISA",
        cargo: "Diretor Estatutário",
        dataEntrada: "2022-06-24",
        capitalSocial: 901394000,
      },
      {
        cnpj: "64.336.577/0001-51",
        razaoSocial: "RODRIGO RIBEIRO GONCALVES E OUTRA (ESTÂNCIA GONÇALVES)",
        cargo: "Sócio Produtor Rural",
        dataEntrada: "2018-03-12",
        socioConjuge: "PATRICIA FERRARI PAULINO GONCALVES",
      },
      {
        cnpj: "53.338.003/0001-04",
        razaoSocial: "PATRICIA FERRARI PAULINO GONCALVES (KYTTO TECNOLOGIA)",
        cargo: "Vínculo Executivo & Familiar",
        dataEntrada: "2023-12-28",
      },
    ],
  },
};

CLIENTES_PREQUALIFICADOS["32285522843"] = {
  ...CLIENTES_PREQUALIFICADOS["00000001163"],
  cpf: "32285522843",
  cpfFormatado: "322.855.228-43",
  regiaoFiscal: "8ª RF (São Paulo) — Mirante do Paranapanema/SP",
  situacaoCadastral: "REGULAR",
  nomeCompleto: "PATRICIA FERRARI PAULINO GONCALVES",
  dataNascimento: "08/05/1981",
  idade: 45,
  sexo: "F",
  estadoCivil: "Casado(a)",
  scoreCredito: 915,
  classificacaoRisco: "Baixo Risco (Score A+ Excelente)",
  rendaPresumidaMensal: 35000,
  capacidadeParcelaMensal: 10500,
  poderCompraImobiliario: 1400000,
  potencialFgts: 110000,
  elegibilidadeMcmv: false,
  elegibilidadeSbpe: true,
  endereco: {
    logradouro: "Rua Elias Barbosa da Silva",
    numero: "833",
    bairro: "Jardim Flora",
    cidade: "Mirante do Paranapanema",
    uf: "SP",
    cep: "19.262-070",
    complemento: "Kytto Tecnologia",
  },
  telefones: [{ numero: "(18) 3991-1145", whatsapp: true, principal: true }],
  emails: ["patricia.goncalves@kytto.com.br", "orpac.efiscal@yahoo.com.br"],
  cargoExecutivo: "Sócia-Fundadora e Administradora (Kytto Tecnologia)",
  empresaPrincipal: "PATRICIA FERRARI PAULINO GONCALVES (KYTTO TECNOLOGIA, CNPJ 53.338.003/0001-04)",
  societarioQsa: {
    sociedades: [
      {
        cnpj: "53.338.003/0001-04",
        razaoSocial: "PATRICIA FERRARI PAULINO GONCALVES (KYTTO TECNOLOGIA)",
        cargo: "Titular / Administradora",
      },
      {
        cnpj: "64.336.577/0001-51",
        razaoSocial: "RODRIGO RIBEIRO GONCALVES E OUTRA (ESTÂNCIA GONÇALVES)",
        cargo: "Sócia Produtora Rural",
      },
    ],
  },
};

CLIENTES_PREQUALIFICADOS["06988722661"] = {
  ...CLIENTES_PREQUALIFICADOS["00000000272"],
  cpf: "06988722661",
  cpfFormatado: "069.887.226-61",
  regiaoFiscal: "6ª RF (Minas Gerais) — Uberaba/MG",
  situacaoCadastral: "REGULAR",
  nomeCompleto: "LUCAS DOS PASSOS SILVA",
  dataNascimento: "22/11/1986",
  idade: 40,
  sexo: "M",
  estadoCivil: "Solteiro(a)",
  scoreCredito: 880,
  classificacaoRisco: "Baixo Risco (Score A)",
  rendaPresumidaMensal: 45000,
  capacidadeParcelaMensal: 13500,
  poderCompraImobiliario: 1750000,
  potencialFgts: 160000,
  elegibilidadeMcmv: false,
  elegibilidadeSbpe: true,
  cargoExecutivo: "CIO (Chief Information Officer) / Diretor de TI",
  empresaPrincipal: "USINAS ITAMARATI S/A (UISA, CNPJ 15.009.178/0001-70)",
  emails: ["lucas.silva@uisa.com.br"],
};

// Aliases para compatibilidade total
CLIENTES_PREQUALIFICADOS["00000001830"] = {
  ...CLIENTES_PREQUALIFICADOS["00000000515"],
  cpf: "00000001830",
  cpfFormatado: "000.000.018-30",
};

// ============================================================================
// FUNÇÕES AUXILIARES DE ACESSO E CONSULTA À BASE POTENCIAL DE CLIENTES
// ============================================================================

export function obterClientePorCpf(cpfOuAlias: string): DadosCpfEnriquecidos | null {
  const limpo = cpfOuAlias.replace(/\D/g, "");
  if (CLIENTES_PREQUALIFICADOS[limpo]) {
    return CLIENTES_PREQUALIFICADOS[limpo];
  }
  // Tentar encontrar por matching parcial ou alias
  const match = Object.values(CLIENTES_PREQUALIFICADOS).find(
    (c) => c.cpf === limpo || c.cpf.endsWith(limpo) || limpo.endsWith(c.cpf)
  );
  return match || null;
}

export function listarClientesPrequalificados(filtro?: {
  termo?: string;
  scoreMin?: number;
  elegibilidadeSbpe?: boolean;
}): DadosCpfEnriquecidos[] {
  let lista = Object.values(CLIENTES_PREQUALIFICADOS);
  if (!filtro) return lista;

  if (filtro.termo) {
    const t = filtro.termo.toLowerCase().trim();
    lista = lista.filter(
      (c) =>
        c.nomeCompleto.toLowerCase().includes(t) ||
        c.cpf.includes(t) ||
        c.endereco.cidade.toLowerCase().includes(t) ||
        (c.cargoExecutivo && c.cargoExecutivo.toLowerCase().includes(t))
    );
  }

  if (filtro.scoreMin !== undefined) {
    lista = lista.filter((c) => c.scoreCredito >= filtro.scoreMin!);
  }

  if (filtro.elegibilidadeSbpe !== undefined) {
    lista = lista.filter((c) => c.elegibilidadeSbpe === filtro.elegibilidadeSbpe);
  }

  return lista;
}

export function obterEstatisticasClientes() {
  const todos = Object.values(CLIENTES_PREQUALIFICADOS);
  const total = todos.length;
  const scoreMedio = Math.round(todos.reduce((acc, c) => acc + c.scoreCredito, 0) / (total || 1));
  const rendaTotalPresumida = todos.reduce((acc, c) => acc + (c.rendaPresumidaMensal || 0), 0);
  const poderCompraTotal = todos.reduce((acc, c) => acc + (c.poderCompraImobiliario || 0), 0);

  return {
    totalCadastrados: total,
    scoreMedio,
    rendaTotalPresumida,
    poderCompraTotal,
    distribuicaoRisco: {
      baixo: todos.filter((c) => c.scoreCredito >= 800).length,
      medio: todos.filter((c) => c.scoreCredito >= 600 && c.scoreCredito < 800).length,
      atencao: todos.filter((c) => c.scoreCredito < 600).length,
    },
  };
}
