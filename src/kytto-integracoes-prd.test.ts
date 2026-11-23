import { describe, expect, it } from "vitest";
import { CONFIG_OFICIAL_KYTTO, gerarCarimboDpoKytto, getHeadersIntegracaoKytto } from "./config-kytto.ts";
import { AdaptadorFontesPublicas } from "./fontes-publicas.ts";
import { MotorIaGcpConsulta360 } from "./gcp-ai-engine.ts";
import { ServicoConsulta360 } from "./servico.ts";

describe("Integrações Corporativas Kytto PRD & Espelho casanova.kytto.com.br", () => {
  it("deve validar a configuração institucional oficial da empresa Kytto", () => {
    expect(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial).toBe("PATRICIA FERRARI PAULINO GONCALVES");
    expect(CONFIG_OFICIAL_KYTTO.empresa.cnpj).toBe("53.338.003/0001-04");
    expect(CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo).toBe("53338003000104");
    expect(CONFIG_OFICIAL_KYTTO.empresa.inscricaoMunicipal).toBe("11738");
    expect(CONFIG_OFICIAL_KYTTO.empresa.cnaePrincipal.codigo).toBe("6201-5/01");
    expect(CONFIG_OFICIAL_KYTTO.empresa.endereco.municipio).toBe("Mirante do Paranapanema");
    expect(CONFIG_OFICIAL_KYTTO.empresa.endereco.uf).toBe("SP");
    expect(CONFIG_OFICIAL_KYTTO.empresa.endereco.codigoIbgeMunicipio).toBe("3530201");
    expect(CONFIG_OFICIAL_KYTTO.empresa.contatos.telefonePrincipal).toBe("(18) 3991-1145");
  });

  it("deve gerar headers padronizados com carimbo de auditoria institucional da Kytto", () => {
    const headers = getHeadersIntegracaoKytto("bureau-credito");
    expect(headers["X-Kytto-Requester-CNPJ"]).toBe("53.338.003/0001-04");
    expect(headers["X-Kytto-Organization"]).toBe("PATRICIA FERRARI PAULINO GONCALVES");
    expect(headers["X-Kytto-Municipal-Reg"]).toBe("11738");
    expect(headers["X-Kytto-IBGE-Origin"]).toBe("3530201");
    expect(headers["X-Kytto-Audit-Integrity"]?.length).toBe(64);
  });

  it("deve gerar carimbo DPO assinado digitalmente com SHA-256 e conformidade LGPD", () => {
    const carimbo = gerarCarimboDpoKytto("KYTTO-PRD-001", "53338003000104");
    expect(carimbo.protocoloAuditoria).toBe("KYTTO-PRD-001");
    expect(carimbo.hashIntegridadeSha256.length).toBe(64);
    expect(carimbo.entidadeEmissora.razaoSocial).toBe("PATRICIA FERRARI PAULINO GONCALVES");
    expect(carimbo.amparoLegal).toContain("Art. 7º");
  });

  it("deve consultar cotações de moedas oficiais (Dólar PTAX, Euro PTAX) e taxas do Bacen", async () => {
    const adaptador = new AdaptadorFontesPublicas();
    const moedas = await adaptador.consultarCotacoesMoedasBacen();
    expect(moedas).toBeDefined();
    expect(moedas.dolarPtaxVenda).toBeGreaterThan(0);
    expect(moedas.euroPtaxVenda).toBeGreaterThan(0);
    expect(moedas.selic).toBeGreaterThan(0);
    expect(moedas.cdi).toBeGreaterThan(0);
    expect(moedas.ipca).toBeGreaterThan(0);
  });

  it("deve consultar lista de bancos oficiais do Bacen e filtrar por código COMPE", async () => {
    const adaptador = new AdaptadorFontesPublicas();
    const bancos = await adaptador.consultarBancosOficiaisBacen("104"); // Caixa
    expect(bancos.length).toBeGreaterThanOrEqual(1);
    expect(bancos[0]?.code).toBe(104);
  });

  it("deve consultar marcas veiculares da Tabela FIPE oficial", async () => {
    const adaptador = new AdaptadorFontesPublicas();
    const marcas = await adaptador.consultarTabelaFipeMarcas("carros");
    expect(marcas.length).toBeGreaterThan(5);
    const toyota = marcas.find((m) => m.nome.toLowerCase() === "toyota");
    expect(toyota).toBeDefined();
  });

  it("deve fornecer status operacional de telemetria dos nós do Cluster M-LED", () => {
    const adaptador = new AdaptadorFontesPublicas();
    const mled = adaptador.obterTelemetriaClusterMled();
    expect(mled.nosAtivos.length).toBe(4);
    expect(mled.serproGatewayStatus).toBe("ONLINE");
    expect(mled.disponibilidadeGeral).toBeGreaterThanOrEqual(99.9);
  });

  it("deve executar o motor de IA para desambiguação pericial de homônimos", async () => {
    const ia = new MotorIaGcpConsulta360();
    const resultado = await ia.desambiguarHomonimosIa("RODRIGO GONCALVES DOS SANTOS", [
      {
        nomeCompleto: "RODRIGO GONCALVES DOS SANTOS",
        cpfParcial: "***.000.001-**",
        nomeMae: "MARIA APARECIDA GONCALVES",
        dataNascimento: "1988-06-14",
        municipioUf: "Tangará da Serra/MT",
      },
      {
        nomeCompleto: "RODRIGO GONCALVES DA SILVA",
        cpfParcial: "***.882.193-**",
        nomeMae: "ANA PAULA DA SILVA",
        dataNascimento: "1994-11-20",
        municipioUf: "Cuiabá/MT",
      },
    ]);

    expect(resultado.totalCandidatosIdentificados).toBe(2);
    expect(resultado.candidatos[0]?.grauSimilaridadePercentual).toBe(100);
    expect(resultado.candidatos[0]?.selecionado).toBe(true);
    expect(resultado.parecerIaDesambiguacao).toContain("RODRIGO GONCALVES DOS SANTOS");
  });

  it("deve executar o motor de IA para parecer habitacional MCMV e SBPE", async () => {
    const ia = new MotorIaGcpConsulta360();
    const parecer = await ia.analisarFinanciamentoHabitacionalIa({
      rendaLiquidaMensalCentavos: 2000000,
      capacidadeParcela30Centavos: 600000,
      saldoFgtsCentavos: 7850000,
      scoreKytto: 845,
      valorImovelDesejadoCentavos: 65000000,
    });

    expect(parecer.enquadramento).toBe("SISTEMA_BRASILEIRO_POUPANCA_EMPRESTIMO_SBPE");
    expect(parecer.aprovacaoProvavel).toBe(true);
    expect(parecer.parecerMesaCredito).toContain("alta viabilidade");
  });

  it("deve executar o motor de IA para parecer de compliance KYC/AML e COAF", async () => {
    const ia = new MotorIaGcpConsulta360();
    const parecer = await ia.analisarComplianceKycAmlIa({
      nome: "RODRIGO GONCALVES DOS SANTOS",
      documento: "000.000.001-91",
      pepIdentificado: false,
      processosTotal: 1,
      protestosTotal: 0,
      esgSancoesTotal: 0,
      dividaAtivaInscricoes: 0,
    });

    expect(parecer.nivelRiscoCompliance).toBe("BAIXO_RISCO");
    expect(parecer.enquadramentoCoaf).toBe("REGULAR_SEM_ALERTA_COAF");
    expect(parecer.parecerAntifraude).toContain("limpas");
  });

  it("deve gerar o Dossiê 360 completo espelhando todos os blocos de casanova.kytto.com.br/plataforma/consulta-cpf", async () => {
    const servico = new ServicoConsulta360();
    const dossie = await servico.consultar({
      documentoOuNome: "00000000191",
      tipoEntrada: "CPF",
      uf: "MT",
      cidade: "Tangará da Serra",
      profundidadeGrafo: 2,
    });

    // Entidade emissora oficial Kytto
    expect(dossie.entidadeEmissoraKytto).toBeDefined();
    expect(dossie.entidadeEmissoraKytto?.cnpj).toBe("53.338.003/0001-04");
    expect(dossie.entidadeEmissoraKytto?.razaoSocial).toBe("PATRICIA FERRARI PAULINO GONCALVES");

    // Blocos espelho da tela oficial
    expect(dossie.qualificacaoCivil).toBeDefined();
    expect(dossie.qualificacaoCivil?.rg).toBeDefined();
    expect(dossie.dadosEleitoraisTSE).toBeDefined();
    expect(dossie.dadosEleitoraisTSE?.biometriaColetada).toBe(true);
    expect(dossie.registroCivilSIRC).toBeDefined();
    expect(dossie.cnhDigitalSenatran).toBeDefined();
    expect(dossie.comprovantesConcessionarias).toBeDefined();
    expect(dossie.declaracaoIrpfRfb).toBeDefined();
    expect(dossie.extratoFgtsCaixa).toBeDefined();
    expect(dossie.fontesConfiaveisAvancadas).toBeDefined();
    expect(dossie.telemetriaClusterMled).toBeDefined();
    expect(dossie.cotacoesMoedasBacen).toBeDefined();
    expect(dossie.pixValidadorAuditado).toBeDefined();
    expect(dossie.desambiguacaoHomonimosIa).toBeDefined();
  }, 30000);
});
