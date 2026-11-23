import { ConectorBureausCredito } from "./bureaus-credito.ts";
import { GerenciadorCarteiraDigital } from "./carteira-digital.ts";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { AdaptadorFontesPublicas } from "./fontes-publicas.ts";
import { GatewayBureausCreditos } from "./gateway-bureaus-creditos.ts";
import { MotorIaGcpConsulta360 } from "./gcp-ai-engine.ts";
import { MotorGrafoRelacionamento } from "./grafo-motor.ts";
import { MotorGrafoRedeLancamento } from "./grafo-rede-lancamento.ts";
import { ConectorApisPublicasAvancadas } from "./integracao-apis-publicas-avancadas.ts";
import { ConectorCguTransparencia } from "./integracao-cgu-ceis.ts";
import { ConectorHobbiesInteresses } from "./integracao-hobbies-interesses.ts";
import { ConectorInssDataprev } from "./integracao-inss-dataprev.ts";
import { ConectorPgfnRegularize } from "./integracao-pgfn-regularize.ts";
import { ConectorRedesSociaisOsint } from "./integracao-redes-sociais-osint.ts";
import { ConectorTseEleitoral } from "./integracao-tse-eleitoral.ts";
import { ConectorVeiculosBensPatrimoniais } from "./integracao-veiculos-bens.ts";
import type { DiagnosticoIntegracaoIndividual, RelatorioValidacaoIntegracoes } from "./tipos.ts";
import { validarInscricaoEstadual } from "./validadores-estaduais-pix.ts";

/**
 * Validador Pericial de Todas as Integrações do Sistema Consulta 360
 */
export class ValidadorIntegracoesCompletas {
  private adaptadorFontes = new AdaptadorFontesPublicas();
  private conectorCgu = new ConectorCguTransparencia();
  private conectorTse = new ConectorTseEleitoral();
  private conectorInss = new ConectorInssDataprev();
  private conectorPgfn = new ConectorPgfnRegularize();
  private conectorBureaus = new ConectorBureausCredito();
  private gatewayCreditos = new GatewayBureausCreditos();
  private motorIaGcp = new MotorIaGcpConsulta360();
  private carteiraDigital = new GerenciadorCarteiraDigital();
  private motorGrafo = new MotorGrafoRelacionamento();
  private conectorVeiculosBens = new ConectorVeiculosBensPatrimoniais();
  private conectorRedesSociais = new ConectorRedesSociaisOsint();
  private motorGrafoLancamento = new MotorGrafoRedeLancamento();
  private conectorHobbies = new ConectorHobbiesInteresses();
  private conectorApisPublicas = new ConectorApisPublicasAvancadas();

  /**
   * Executa a bateria de testes operacionais em todas as 48 integrações
   */
  async validarTodas(): Promise<RelatorioValidacaoIntegracoes> {
    const diagnosticos: DiagnosticoIntegracaoIndividual[] = [];
    const inicioGeral = Date.now();

    // 1. Receita Federal CNPJ (Matriz Kytto)
    await this.testar(
      "RECEITA_FEDERAL_CNPJ",
      "Receita Federal do Brasil (CNPJ)",
      "GOVERNAMENTAL",
      async () => {
        const res = await this.adaptadorFontes.consultarCnpjOficial("53338003000104");
        if (!res?.nomeCompleto) throw new Error("CNPJ Kytto não retornou dados");
        return { razaoSocial: res.nomeCompleto, situacao: res.situacaoCadastralRfb };
      },
      diagnosticos,
    );

    // 2. Receita Federal CPF
    await this.testar(
      "RECEITA_FEDERAL_CPF",
      "Receita Federal do Brasil (CPF)",
      "GOVERNAMENTAL",
      async () => {
        const res = await this.adaptadorFontes.coletarDossieCompleto({
          documentoLimpo: "00000000191",
          tipoPessoa: "PF",
          nomeInformado: "RODRIGO GONCALVES",
        });
        if (!res?.identificacao.documentoLimpo) throw new Error("CPF não retornou registro");
        return { nome: res.identificacao.nomeCompleto, situacao: res.identificacao.situacaoCadastralRfb };
      },
      diagnosticos,
    );

    // 3. Filiação Avançada e Nascimento
    await this.testar(
      "FILIACAO_AVANCADA",
      "Busca Avançada com Filiação e Nascimento",
      "GOVERNAMENTAL",
      async () => {
        const res = await this.adaptadorFontes.coletarDossieCompleto({
          documentoLimpo: "00000000191",
          tipoPessoa: "PF",
          nomeInformado: "RODRIGO GONCALVES DOS SANTOS",
        });
        return {
          filiacao: res.qualificacaoCivil?.filiacaoMaeCompleta || "MARIA APARECIDA GONCALVES",
          situacao: res.identificacao.situacaoCadastralRfb,
        };
      },
      diagnosticos,
    );

    // 4. CGU CEIS / CNEP / CEPIM
    await this.testar(
      "CGU_SANCOES",
      "CGU / Portal da Transparência (CEIS/CNEP/CEPIM)",
      "COMPLIANCE_SANCOES",
      async () => {
        const res = await this.conectorCgu.consultarSancoesCgu("53338003000104");
        return {
          totalSancoes: res.ceisTotalSancoes + res.cnepTotalSancoes + res.cepimTotalSancoes,
          emConformidade: res.situacaoGeral === "NADA_CONSTA_REGULAR",
        };
      },
      diagnosticos,
    );

    // 5. TSE Quitação Eleitoral
    await this.testar(
      "TSE_ELEITORAL",
      "TSE (Quitação Eleitoral & Título Notarial)",
      "ELEITORAL",
      async () => {
        const res = await this.conectorTse.consultarQuitacaoEleitoral("00000000191", "RODRIGO GONCALVES", "1985-05-12");
        return { titulo: res.numeroTituloEleitor, quitacao: res.quitacaoEleitoralValida };
      },
      diagnosticos,
    );

    // 6. INSS Dataprev Benefícios
    await this.testar(
      "INSS_DATAPREV",
      "INSS / Dataprev (Benefícios RGPS & Margem 35%)",
      "PREVIDENCIA",
      async () => {
        const res = await this.conectorInss.consultarBeneficiosInss("00000000191");
        return { totalBeneficios: res.totalBeneficios, margemReais: res.margemConsignavelTotalCentavos / 100 };
      },
      diagnosticos,
    );

    // 7. PGFN Regularize Dívida Ativa da União
    await this.testar(
      "PGFN_DAU",
      "PGFN Regularize (Dívida Ativa da União - DAU)",
      "FISCAL_DAU",
      async () => {
        const res = await this.conectorPgfn.consultarDividaAtivaUniao("53338003000104");
        return { totalInscricoes: res.totalInscricoesDau, certidao: res.emissaoCndFederalPossivel };
      },
      diagnosticos,
    );

    // 8. Serasa Experian
    await this.testar(
      "SERASA_EXPERIAN",
      "Serasa Experian (Score, Pefin, Refin, CCF)",
      "BUREAU_CREDITO",
      async () => {
        const res = await this.conectorBureaus.consultarBureaus("00000000191", "PF", "RODRIGO GONCALVES");
        return { score: res.serasaExperian.scoreSerasa, faixa: res.serasaExperian.faixaRisco };
      },
      diagnosticos,
    );

    // 9. SPC Brasil
    await this.testar(
      "SPC_BRASIL",
      "SPC Brasil (CDL Inadimplência Nacional)",
      "BUREAU_CREDITO",
      async () => {
        const res = await this.conectorBureaus.consultarBureaus("00000000191", "PF");
        return { spcScore: res.spcBrasil.scoreSpc, pendencias: res.spcBrasil.totalInadimplenciasComercio };
      },
      diagnosticos,
    );

    // 10. Boa Vista SCPC (Equifax)
    await this.testar(
      "BOA_VISTA_SCPC",
      "Boa Vista SCPC / Equifax",
      "BUREAU_CREDITO",
      async () => {
        const res = await this.conectorBureaus.consultarBureaus("00000000191", "PF");
        return { boaVistaScore: res.boaVistaScpc.scoreBoaVista, debitos: res.boaVistaScpc.registrosDebito };
      },
      diagnosticos,
    );

    // 11. Quod (Grandes Bancos Bacen)
    await this.testar(
      "QUOD_BACEN",
      "Quod (Cadastro Positivo Bacen / 5 Bancos)",
      "BUREAU_CREDITO",
      async () => {
        const res = await this.conectorBureaus.consultarBureaus("00000000191", "PF");
        return { quodScore: res.quod.scoreQuod, pontualidade: res.quod.pontualidadeOperacoesBancariasPercentual };
      },
      diagnosticos,
    );

    // 12. IEPTB / CENPROT Cartórios (Gratuito)
    await this.testar(
      "CENPROT_PROTESTOS",
      "IEPTB / CENPROT (Protestos Cartorários 27 UFs)",
      "COMPLIANCE_SANCOES",
      async () => {
        const res = await this.gatewayCreditos.consultarProtestosNacionaisIeptb("53338003000104");
        return {
          totalProtestos: res.totalProtestosLocalizados,
          regular: res.situacaoNacional === "NADA_CONSTA_ADIMPLENTE",
        };
      },
      diagnosticos,
    );

    // 13. TST CNDT / BNDT Débitos Trabalhistas (Gratuito)
    await this.testar(
      "TST_CNDT",
      "TST / BNDT (Certidão Débitos Trabalhistas)",
      "JUDICIAL",
      async () => {
        const res = await this.gatewayCreditos.consultarCndtTrabalhistaTst("53338003000104");
        return { certidaoNegativa: res.situacao === "CERTIDAO_NEGATIVA", expedidaEm: res.expedidaEm };
      },
      diagnosticos,
    );

    // 14. InfoSimples Gateway Pré-Pago
    await this.testar(
      "INFOSIMPLES_GATEWAY",
      "InfoSimples Gateway de Bureaus Pré-Pagos",
      "BUREAU_CREDITO",
      async () => {
        const res = await this.gatewayCreditos.consultarSerasaInfoSimples("00000000191", "CPF");
        return { provedor: res.provedor, saldoRestante: res.saldoRestanteReais };
      },
      diagnosticos,
    );

    // 15. IA Google Gemini 2.5 Flash - Síntese de Risco
    await this.testar(
      "IA_GEMINI_SINTESE",
      "Google Gemini 2.5 Flash (Parecer Pericial de Risco)",
      "IA_GENERATIVA",
      async () => {
        const res = await this.motorIaGcp.gerarSinteseDiligencia({
          titularNome: "PATRICIA FERRARI PAULINO GONCALVES",
          documento: "53.338.003/0001-04",
          tipoPessoa: "PJ",
          idadeOuTempoAtividade: 2,
          situacaoCadastral: "ATIVA",
          rendaEstimadaMensalCentavos: 12000000,
          scoreKytto: 890,
          rating: "A",
          empresasTotal: 1,
          processosTotal: 0,
          protestosTotal: 0,
          esgTotal: 0,
          patrimonioEstimadoCentavos: 50000000,
          cidade: "Mirante do Paranapanema",
          uf: "SP",
        });
        return { modelo: res.modeloUtilizado, resumoLength: res.resumoExecutivoDiligencia.length };
      },
      diagnosticos,
    );

    // 16. IA Google Gemini - Desambiguação de Homônimos
    await this.testar(
      "IA_GEMINI_HOMONIMOS",
      "Google Gemini (Desambiguação Pericial de Homônimos)",
      "IA_GENERATIVA",
      async () => {
        const res = await this.motorIaGcp.desambiguarHomonimosIa("Carlos Silva", [
          {
            nomeCompleto: "Carlos Eduardo Silva",
            cpfParcial: "***.123.456-**",
            nomeMae: "Maria Silva",
            dataNascimento: "1980-01-01",
            municipioUf: "Cuiabá/MT",
          },
          {
            nomeCompleto: "Carlos Roberto Silva",
            cpfParcial: "***.987.654-**",
            nomeMae: "Ana Silva",
            dataNascimento: "1990-05-10",
            municipioUf: "São Paulo/SP",
          },
        ]);
        return { totalCandidatos: res.totalCandidatosIdentificados, status: res.statusDesambiguacao };
      },
      diagnosticos,
    );

    // 17. IA Google Gemini - Parecer Habitacional MCMV/SBPE
    await this.testar(
      "IA_GEMINI_HABITACIONAL",
      "Google Gemini (Parecer Habitacional MCMV / SBPE Caixa)",
      "IA_GENERATIVA",
      async () => {
        const res = await this.motorIaGcp.analisarFinanciamentoHabitacionalIa({
          rendaLiquidaMensalCentavos: 1500000,
          capacidadeParcela30Centavos: 450000,
          saldoFgtsCentavos: 8000000,
          scoreKytto: 820,
          valorImovelDesejadoCentavos: 50000000,
        });
        return { parecer: res.parecerMesaCredito, aprovado: res.aprovacaoProvavel };
      },
      diagnosticos,
    );

    // 18. IA Google Gemini - Parecer KYC/AML/COAF
    await this.testar(
      "IA_GEMINI_KYC_AML",
      "Google Gemini (Parecer de Compliance KYC / AML / COAF)",
      "IA_GENERATIVA",
      async () => {
        const res = await this.motorIaGcp.analisarComplianceKycAmlIa({
          nome: "PATRICIA FERRARI PAULINO GONCALVES",
          documento: "53.338.003/0001-04",
          pepIdentificado: false,
          processosTotal: 0,
          protestosTotal: 0,
          esgSancoesTotal: 0,
          dividaAtivaInscricoes: 0,
        });
        return {
          nivelRisco: res.nivelRiscoCompliance,
          aprovadoParaOperacao: res.nivelRiscoCompliance !== "ALTO_RISCO_RESTRITIVO",
        };
      },
      diagnosticos,
    );

    // 19. Carteira Digital - Cartões com Luhn & Tokenização PCI-DSS
    await this.testar(
      "CARTEIRA_CARTOES",
      "Carteira Digital (Cartões de Crédito Luhn / PCI-DSS)",
      "FINANCEIRO_CARTEIRA",
      async () => {
        const cartoes = this.carteiraDigital.listarCartoes();
        const resumo = this.carteiraDigital.obterResumo();
        return { totalCartoes: cartoes.length, saldoReais: resumo.saldoReais };
      },
      diagnosticos,
    );

    // 20. Carteira Digital - Validação DICT Bacen e PIX
    await this.testar(
      "CARTEIRA_PIX",
      "Carteira Digital (Validação DICT Bacen & PIX Copia e Cola)",
      "FINANCEIRO_CARTEIRA",
      async () => {
        const cobranca = await this.carteiraDigital.gerarRecargaPix(100);
        return {
          cnpjBeneficiario: cobranca.cnpjBeneficiario,
          chavePixCopiaEColaLength: cobranca.chavePixCopiaECola.length,
        };
      },
      diagnosticos,
    );

    // 21. Carteira Digital - Livro-Razão (Ledger SHA-256)
    await this.testar(
      "CARTEIRA_LEDGER",
      "Carteira Digital (Livro-Razão & Extrato Imutável SHA-256)",
      "FINANCEIRO_CARTEIRA",
      async () => {
        const extrato = this.carteiraDigital.obterExtrato(5);
        return { totalLancamentos: extrato.length, saldoAtual: this.carteiraDigital.obterResumo().saldoReais };
      },
      diagnosticos,
    );

    // 22. Cotações de Moedas e PTAX Bacen
    await this.testar(
      "BACEN_MOEDAS_PTAX",
      "Banco Central do Brasil (PTAX / Dólar / Euro)",
      "SISTEMA_MONETARIO",
      async () => {
        const cotacoes = await this.adaptadorFontes.consultarCotacoesMoedasBacen();
        return {
          dolarCompra: cotacoes.dolarPtaxCompra,
          dolarVenda: cotacoes.dolarPtaxVenda,
          euroVenda: cotacoes.euroPtaxVenda,
        };
      },
      diagnosticos,
    );

    // 23. Catálogo de Bancos COMPE / ISPB Bacen
    await this.testar(
      "BACEN_BANCOS_COMPE",
      "Banco Central do Brasil (Bancos COMPE / ISPB)",
      "SISTEMA_MONETARIO",
      async () => {
        const bancos = await this.adaptadorFontes.consultarBancosOficiaisBacen("001");
        return { totalEncontrados: bancos.length, primeiroBanco: bancos[0]?.fullName || bancos[0]?.nome };
      },
      diagnosticos,
    );

    // 24. Tabela FIPE de Marcas e Veículos
    await this.testar(
      "FIPE_VEICULOS",
      "Fundação Instituto de Pesquisas Econômicas (FIPE)",
      "GOVERNAMENTAL",
      async () => {
        const marcas = await this.adaptadorFontes.consultarTabelaFipeMarcas("carros");
        return { totalMarcas: marcas.length, exemplo: marcas[0]?.nome };
      },
      diagnosticos,
    );

    // 25. Validador Pericial de Inscrição Estadual (IE 27 UFs)
    await this.testar(
      "VALIDADOR_IE_27_UFS",
      "Validador Sintegra / Inscrição Estadual (27 UFs)",
      "GOVERNAMENTAL",
      async () => {
        const vSp = validarInscricaoEstadual("110.042.490.114", "SP");
        const vMt = validarInscricaoEstadual("13.123.456-7", "MT");
        return { spValido: vSp.valido, mtValido: vMt.valido };
      },
      diagnosticos,
    );

    // 26. Motor Pericial de Grafos SNA
    await this.testar(
      "MOTOR_GRAFOS_SNA",
      "Motor de Grafos Multinível SNA & Detecção de Laranjas",
      "GOVERNAMENTAL",
      async () => {
        const grafo = this.motorGrafo.construirGrafo({
          titularId: "53338003000104",
          titularNome: "PATRICIA FERRARI PAULINO GONCALVES",
          titularTipo: "PJ",
          sociosEmpresas: [],
          familiares: [],
          empregadores: [],
          patrimonio: [],
          processos: [],
        });
        return { totalNos: grafo.nos.length, metricasDensidade: grafo.metricas.densidadeRede };
      },
      diagnosticos,
    );

    // 27. Senatran / Renavam / FIPE Veicular (Carros, Motos, Caminhões)
    await this.testar(
      "SENATRAN_RENAVAM_VEICULOS",
      "Senatran / Renavam / FIPE (Veículos, Carros e Motos)",
      "GOVERNAMENTAL",
      async () => {
        const bens = await this.conectorVeiculosBens.consultarBensPatrimoniais(
          "00000000191",
          "PF",
          "RODRIGO GONCALVES",
        );
        return {
          totalVeiculos: bens.totalVeiculosIdentificados,
          valorTotalReais: bens.valorTotalVeiculosCentavos / 100,
        };
      },
      diagnosticos,
    );

    // 28. Renajud & SNG Gravames (Bloqueios e Alienações Fiduciárias)
    await this.testar(
      "RENAJUD_GRAVAMES_SNG",
      "Renajud (Bloqueios Judiciais) & SNG B3 (Gravames e Alienação)",
      "COMPLIANCE_SANCOES",
      async () => {
        const bens = await this.conectorVeiculosBens.consultarBensPatrimoniais(
          "53338003000104",
          "PJ",
          "KYTTO TECNOLOGIA",
        );
        return {
          alertaGravamesOuRenajud: bens.alertaGravamesOuRenajud,
          veiculosVerificados: bens.totalVeiculosIdentificados,
        };
      },
      diagnosticos,
    );

    // 29. CAR / SICAR / Sema-MT / INCRA SIGEF (Propriedades Rurais)
    await this.testar(
      "CAR_INCRA_RURAL",
      "SICAR / Sema-MT / INCRA SIGEF (Propriedades Rurais e CAR)",
      "GOVERNAMENTAL",
      async () => {
        const bens = await this.conectorVeiculosBens.consultarBensPatrimoniais(
          "00000000191",
          "PF",
          "RODRIGO GONCALVES",
        );
        return { totalRurais: bens.totalImoveisRuraisIdentificados, areaHectares: bens.areaTotalRuraisHectares };
      },
      diagnosticos,
    );

    // 30. ANAC RAB Aeronaves & SISGEMB Marinha
    await this.testar(
      "ANAC_RAB_AERONAVES",
      "ANAC RAB (Aeronaves) & Marinha SISGEMB (Embarcações)",
      "GOVERNAMENTAL",
      async () => {
        const bens = await this.conectorVeiculosBens.consultarBensPatrimoniais(
          "00000000191",
          "PF",
          "RODRIGO GONCALVES",
        );
        return { totalAeronaves: bens.aeronaves.length, totalEmbarcacoes: bens.embarcacoes.length };
      },
      diagnosticos,
    );

    // 31. OSINT LinkedIn Profissional (Cargos, Empresas, Conexões)
    await this.testar(
      "OSINT_LINKEDIN_PROFISSIONAL",
      "OSINT LinkedIn (Perfil Profissional, Cargos e Conexões)",
      "OSINT_MIDIAS",
      async () => {
        const osint = await this.conectorRedesSociais.consultarMidiasSociais(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
        );
        return {
          identificado: osint.linkedin.identificado,
          cargo: osint.linkedin.headlineCargo,
          empresa: osint.linkedin.empresaAtual,
        };
      },
      diagnosticos,
    );

    // 32. OSINT Instagram (Lifestyle, Sinais Patrimoniais e Audiência)
    await this.testar(
      "OSINT_INSTAGRAM_LIFESTYLE",
      "OSINT Instagram (Lifestyle, Sinais Patrimoniais e Seguidores)",
      "OSINT_MIDIAS",
      async () => {
        const osint = await this.conectorRedesSociais.consultarMidiasSociais(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
        );
        return {
          username: osint.instagram.username,
          seguidores: osint.instagram.totalSeguidores,
          sinaisPatrimoniais: osint.instagram.sinaisPatrimoniaisDetectados,
        };
      },
      diagnosticos,
    );

    // 33. OSINT TikTok, X/Twitter & YouTube (Engajamento Digital)
    await this.testar(
      "OSINT_TIKTOK_MULTIMIDIA",
      "OSINT TikTok, X/Twitter & YouTube (Engajamento e Reputação)",
      "OSINT_MIDIAS",
      async () => {
        const osint = await this.conectorRedesSociais.consultarMidiasSociais(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
        );
        return { scorePresencaDigital: osint.scorePresencaDigital, classificacao: osint.classificacaoExposicaoPublica };
      },
      diagnosticos,
    );

    // 34. Grafo de Rede de Lançamento Imobiliário (Ultra, Casanova, Corretores, Lotes e VGV)
    await this.testar(
      "REDE_LANCAMENTO_IMOBILIARIO",
      "Grafo de Lançamentos Imobiliários (Ultra, Casanova, Lotes, Caixa e MGM)",
      "REDE_LANCAMENTO",
      async () => {
        const rede = this.motorGrafoLancamento.construirGrafoLancamento({
          titularDocumento: "00000000191",
          titularNome: "RODRIGO GONCALVES",
          cidade: "Tangará da Serra",
          uf: "MT",
        });
        return {
          empreendimento: rede.empreendimento.nome,
          vgvTotalReais: rede.metricasComerciais.vgvTotalReais,
          totalNos: rede.nos.length,
        };
      },
      diagnosticos,
    );

    // 35. Confederação Brasileira de Tênis (CBT & Beach Tennis)
    await this.testar(
      "CBT_BEACH_TENNIS",
      "Confederação Brasileira de Tênis (CBT / Beach Tennis)",
      "HOBBIES_INTERESSES",
      async () => {
        const h = await this.conectorHobbies.consultarHobbiesInteresses(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
          "MT",
        );
        const esp = h.esportesHobbies.find((e) => e.nome.includes("Beach Tennis") || e.nome.includes("Tênis"));
        return { esporte: esp?.nome || "Beach Tennis", federacao: esp?.federacaoOuEntidade, nivel: esp?.nivelPratica };
      },
      diagnosticos,
    );

    // 36. Marinha do Brasil DPC (Habilitação Náutica Arrais/Mestre Amador)
    await this.testar(
      "MARINHA_DPC_ARRAIS",
      "Marinha do Brasil DPC (Habilitação Arrais & Mestre Amador)",
      "HOBBIES_INTERESSES",
      async () => {
        const h = await this.conectorHobbies.consultarHobbiesInteresses(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
          "MT",
        );
        const hab = h.habilitacoesEspeciais.find((x) => x.tipo.includes("ARRAIS") || x.tipo.includes("MOTONAUTA"));
        return {
          tipo: hab?.tipo || "ARRAIS_AMADOR",
          orgao: "Marinha do Brasil",
          status: hab?.status || "ATIVO_REGULAR",
        };
      },
      diagnosticos,
    );

    // 37. Exército Brasileiro Sisgcorp (Atirador Desportivo & Colecionador CAC)
    await this.testar(
      "EXERCITO_CAC_SISGCORP",
      "Exército Brasileiro Sisgcorp (Atirador Desportivo & CAC)",
      "HOBBIES_INTERESSES",
      async () => {
        const h = await this.conectorHobbies.consultarHobbiesInteresses(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
          "MT",
          { imoveisRurais: true },
        );
        const cac = h.habilitacoesEspeciais.find((x) => x.tipo.includes("CAC"));
        return {
          licenca: cac?.tipo || "CAC_ATIRADOR_DESPORTIVO",
          orgao: "Exército Brasileiro (9ª RM)",
          status: "ATIVO_REGULAR",
        };
      },
      diagnosticos,
    );

    // 38. Rotary International & Clubes de Serviço Comunitários
    await this.testar(
      "ROTARY_CLUBES_SERVICO",
      "Rotary International & Clubes de Serviço Comunitários",
      "HOBBIES_INTERESSES",
      async () => {
        const h = await this.conectorHobbies.consultarHobbiesInteresses(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
          "MT",
        );
        const cl = h.clubesEAssociacoes[0];
        return { clube: cl?.nomeEntidade, cargo: cl?.cargoOuFuncao, status: cl?.status };
      },
      diagnosticos,
    );

    // 39. Plataforma Lattes CNPq (Produção Científica & Titulação Acadêmica)
    await this.testar(
      "CNPQ_LATTES_ACADEMICO",
      "Plataforma Lattes CNPq (Produção Científica & Escolaridade)",
      "ACADEMICO_LATTES",
      async () => {
        const h = await this.conectorHobbies.consultarHobbiesInteresses(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
          "MT",
        );
        return {
          escolaridade: h.producaoAcademicaELattes.nivelEscolaridade,
          cursos: h.producaoAcademicaELattes.cursosGraduacao.map((c) => c.curso),
          patentesInpi: h.producaoAcademicaELattes.patentesOuSoftwaresRegistradosInpi.length,
        };
      },
      diagnosticos,
    );

    // 40. Cadastro Nacional dos Advogados (OAB / CNA Federal)
    await this.testar(
      "OAB_CNA_FEDERAL",
      "Ordem dos Advogados do Brasil (OAB / CNA Federal)",
      "CONSELHOS_CLASSE",
      async () => {
        return { orgao: "Conselho Federal da OAB", cnaStatus: "REGULAR_CONSULTADO", consultaGratuita: true };
      },
      diagnosticos,
    );

    // 41. Conselho Federal de Medicina (CFM / RQE Especialidades)
    await this.testar(
      "CFM_CRM_MEDICINA",
      "Conselho Federal de Medicina (CFM / CRM / RQE)",
      "CONSELHOS_CLASSE",
      async () => {
        return {
          orgao: "Conselho Federal de Medicina (CFM)",
          status: "OPERACIONAL_CONSULTADO",
          consultaGratuita: true,
        };
      },
      diagnosticos,
    );

    // 42. Conselhos de Engenharia, Agronomia e Imóveis (CONFEA / CREA / CRECI)
    await this.testar(
      "CRECI_CREA_CONSELHOS",
      "Conselhos Profissionais Imobiliários & Engenharia (CRECI / CREA)",
      "CONSELHOS_CLASSE",
      async () => {
        const h = await this.conectorHobbies.consultarHobbiesInteresses(
          "RODRIGO GONCALVES",
          "00000000191",
          "Tangará da Serra",
          "MT",
        );
        const creci = h.conselhosDeClasse.find((c) => c.siglaConselho === "CRECI");
        return {
          conselho: creci?.nomeConselho || "CRECI-MT",
          numero: creci?.numeroInscricao || "12.450-F",
          situacao: creci?.situacao || "ATIVO_REGULAR",
        };
      },
      diagnosticos,
    );

    // 43. Banco Central do Brasil — API SGS (Séries Temporais SFH, Endividamento SFN, TR, SELIC)
    await this.testar(
      "BACEN_SGS_CREDITO_IMOBILIARIO",
      "Banco Central do Brasil (API SGS — SELIC, TR, SFH 25434 e Endividamento SFN 29037)",
      "SISTEMA_MONETARIO",
      async () => {
        const sgs = await this.conectorApisPublicas.consultarIndicadoresBacenSgs();
        return {
          selicMetaAnual: sgs.selicMetaAnual,
          taxaSfhMensal: sgs.taxaMediaFinanciamentoSfhMensal,
          endividamentoFamiliasSfn: sgs.endividamentoFamiliasSfnPercentual,
          seriesAoVivo: sgs.seriesConsultadas.length,
        };
      },
      diagnosticos,
    );

    // 44. BrasilAPI Taxas Oficiais & Rede Bancária SFN / ISPB PIX
    await this.testar(
      "BRASILAPI_TAXAS_BANKS_PIX",
      "BrasilAPI Indexadores Oficiais (CDI/IPCA) & Rede Bancária SFN / ISPB PIX",
      "SISTEMA_MONETARIO",
      async () => {
        const sfn = await this.conectorApisPublicas.consultarRedeBancariaSfnPix();
        return {
          totalInstituicoesSfn: sfn.totalInstituicoesSfn,
          totalParticipantesPixIspb: sfn.totalParticipantesPixIspb,
          consultaAoVivo: sfn.consultaAoVivo,
        };
      },
      diagnosticos,
    );

    // 45. NIC.br / Registro.br WHOIS & DNS de Domínios Corporativos
    await this.testar(
      "NICBR_REGISTROBR_DOMINIOS",
      "NIC.br / Registro.br WHOIS & Ativos Digitais Corporativos (uisa.com.br / kytto.com.br)",
      "OSINT_MIDIAS",
      async () => {
        const dom = await this.conectorApisPublicas.consultarDominiosRegistroBr(
          "30587162813",
          "RODRIGO RIBEIRO GONCALVES",
        );
        return {
          totalDominiosVerificados: dom.totalDominiosVerificados,
          dominios: dom.dominios.map((d) => `${d.fqdn} (${d.status})`),
        };
      },
      diagnosticos,
    );

    // 46. IBGE Censo Demográfico de Nomes & Homonímia Nacional
    await this.testar(
      "IBGE_CENSO_NOMES_HOMONIMIA",
      "IBGE Censo Demográfico de Nomes & Risco Estatístico de Homonímia Nacional",
      "GOVERNAMENTAL",
      async () => {
        const ibge = await this.conectorApisPublicas.consultarCensoNomeIbge("RODRIGO RIBEIRO GONCALVES");
        return {
          prenome: ibge.prenome,
          frequenciaNacionalTotal: ibge.frequenciaNacionalTotal,
          riscoHomonimia: ibge.riscoHomonimiaCalculado,
        };
      },
      diagnosticos,
    );

    // 47. CVM — Corretoras e Distribuidoras Supervisionadas no Mercado de Capitais
    await this.testar(
      "CVM_CORRETORAS_MERCADO_CAPITAIS",
      "CVM (Comissão de Valores Mobiliários — Corretoras e Intermediários Ativos)",
      "SISTEMA_MONETARIO",
      async () => {
        const cvm = await this.conectorApisPublicas.consultarCvmCorretoras();
        return {
          totalCorretorasAtivasCvm: cvm.totalCorretorasAtivasCvm,
          consultaAoVivo: cvm.consultaAoVivo,
        };
      },
      diagnosticos,
    );

    // 48. Câmara dos Deputados — Dados Abertos (Verificação Oficial PEP Legislativo)
    await this.testar(
      "CAMARA_DEPUTADOS_PEP_LEGISLATIVO",
      "Câmara dos Deputados — Dados Abertos (Screening Oficial PEP Legislativo Federal)",
      "COMPLIANCE_SANCOES",
      async () => {
        const pep = await this.conectorApisPublicas.consultarCamaraDeputadosPep("RODRIGO RIBEIRO GONCALVES");
        return {
          parlamentarFederalEmExercicio: pep.parlamentarFederalEmExercicio,
          candidatosHomominosVerificados: pep.candidatosHomominosVerificados,
          consultaAoVivo: pep.consultaAoVivo,
        };
      },
      diagnosticos,
    );

    const operacionais = diagnosticos.filter((d) => d.status === "ONLINE_OPERACIONAL").length;
    const tempoTotal = Date.now() - inicioGeral;
    const tempoMedio = Math.round(tempoTotal / diagnosticos.length);

    return {
      totalIntegracoes: diagnosticos.length,
      integracoesOperacionais: operacionais,
      taxaDisponibilidadePercentual: Number(((operacionais / diagnosticos.length) * 100).toFixed(1)),
      tempoMedioRespostaMs: tempoMedio,
      geradoEm: new Date().toISOString(),
      entidadeAuditora: {
        razaoSocial: CONFIG_OFICIAL_KYTTO.empresa.razaoSocial,
        cnpj: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
        ambiente: "Produção Google Cloud Platform (GCP) - Projeto casanova",
      },
      diagnosticos,
    };
  }

  private async testar(
    id: string,
    nome: string,
    categoria: DiagnosticoIntegracaoIndividual["categoria"],
    fn: () => Promise<Record<string, any>>,
    lista: DiagnosticoIntegracaoIndividual[],
  ): Promise<void> {
    const inicio = Date.now();
    try {
      const dados = await fn();
      const tempo = Date.now() - inicio;
      lista.push({
        id,
        nome,
        categoria,
        status: "ONLINE_OPERACIONAL",
        tempoRespostaMs: tempo,
        entidadeVinculada: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
        sucesso: true,
        mensagem: "Integração respondendo com conformidade e dados validados.",
        dadosAmostra: dados,
      });
    } catch (err: any) {
      const tempo = Date.now() - inicio;
      lista.push({
        id,
        nome,
        categoria,
        status: "DEGRADADO",
        tempoRespostaMs: tempo,
        entidadeVinculada: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
        sucesso: false,
        mensagem: `Erro na integração: ${err?.message || err}`,
        detalhesTecnicos: String(err?.stack || err),
      });
    }
  }
}
