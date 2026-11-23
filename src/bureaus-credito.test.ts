import { describe, expect, it } from "vitest";
import { ConectorBureausCredito } from "./bureaus-credito.ts";

describe("Conector Pericial de Bureaus de Crédito (Serasa, SPC, Boa Vista, Quod)", () => {
  const conector = new ConectorBureausCredito();

  it("deve consultar bureaus de crédito para CNPJ oficial Kytto com idoneidade total", async () => {
    const res = await conector.consultarBureaus("53338003000104", "PJ", "PATRICIA FERRARI PAULINO GONCALVES");

    expect(res.documentoConsultado).toBe("53338003000104");
    expect(res.tipoPessoa).toBe("PJ");

    // Serasa Experian
    expect(res.serasaExperian.scoreSerasa).toBeGreaterThanOrEqual(900);
    expect(res.serasaExperian.pefin.totalOcorrencias).toBe(0);
    expect(res.serasaExperian.refin.totalOcorrencias).toBe(0);
    expect(res.serasaExperian.cadastroPositivoSerasa.status).toBe("ATIVO");
    expect(res.serasaExperian.cadastroPositivoSerasa.indicePontualidadePercentual).toBeGreaterThanOrEqual(98);

    // SPC Brasil
    expect(res.spcBrasil.scoreSpc).toBeGreaterThanOrEqual(900);
    expect(res.spcBrasil.totalInadimplenciasComercio).toBe(0);

    // Boa Vista SCPC
    expect(res.boaVistaScpc.scoreBoaVista).toBeGreaterThanOrEqual(900);
    expect(res.boaVistaScpc.registrosDebito).toBe(0);

    // Quod (Bancos Bacen)
    expect(res.quod.scoreQuod).toBeGreaterThanOrEqual(900);
    expect(res.quod.bancosParticipantes).toContain("Banco do Brasil");
    expect(res.quod.bancosParticipantes).toContain("Caixa Econômica Federal");

    // Integração Gratuita 1: Protestos Cartorários nos 27 Estados (IEPTB / CENPROT)
    expect(res.protestosNacionaisIeptb.fonteOficial).toBe("IEPTB_CENPROT_NACIONAL");
    expect(res.protestosNacionaisIeptb.gratuito).toBe(true);
    expect(res.protestosNacionaisIeptb.situacaoNacional).toBe("NADA_CONSTA_ADIMPLENTE");

    // Integração Gratuita 2: CNDT Trabalhista do TST
    expect(res.cndtTrabalhistaTst.orgaoExpedidor).toBe("TRIBUNAL_SUPERIOR_DO_TRABALHO_TST");
    expect(res.cndtTrabalhistaTst.gratuito).toBe(true);
    expect(res.cndtTrabalhistaTst.situacao).toBe("CERTIDAO_NEGATIVA");

    // Gateway com Carga de Créditos (InfoSimples / Serasa)
    expect(res.gatewayCreditos.provedor).toBe("INFOSIMPLES_SERASA");
    expect(res.gatewayCreditos.saldoReais).toBeGreaterThanOrEqual(0);
    expect(res.gatewayCreditos.chavePixDestino).toContain("53.338.003/0001-04");

    // Resumo Consolidado
    expect(res.resumoConsolidado.scoreMedioMercado).toBeGreaterThanOrEqual(900);
    expect(res.resumoConsolidado.classificacaoRiscoGeral).toBe("ADIMPLENTE_TOTAL");
    expect(res.resumoConsolidado.totalDividasNegativadasCentavos).toBe(0);
  });

  it("deve consultar bureaus para CPF de Pessoa Física com conectores de protestos e CNDT", async () => {
    const res = await conector.consultarBureaus("00000000191", "PF", "CANDIDATO TESTE IMOBILIARIO");

    expect(res.tipoPessoa).toBe("PF");
    expect(res.serasaExperian.scoreSerasa).toBeGreaterThan(800);
    expect(res.spcBrasil.scoreSpc).toBeGreaterThan(800);
    expect(res.boaVistaScpc.scoreBoaVista).toBeGreaterThan(800);
    expect(res.quod.scoreQuod).toBeGreaterThan(800);
    expect(res.protestosNacionaisIeptb.gratuito).toBe(true);
    expect(res.cndtTrabalhistaTst.gratuito).toBe(true);
    expect(res.resumoConsolidado.classificacaoRiscoGeral).toBe("ADIMPLENTE_TOTAL");
  });
});
