import { describe, expect, it } from "vitest";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { ConectorCguTransparencia } from "./integracao-cgu-ceis.ts";
import { ConectorInssDataprev } from "./integracao-inss-dataprev.ts";
import { ConectorPgfnRegularize } from "./integracao-pgfn-regularize.ts";
import { ConectorTseEleitoral } from "./integracao-tse-eleitoral.ts";

describe("Novas Integrações Completas (CGU, TSE, INSS, PGFN)", () => {
  const conectorCgu = new ConectorCguTransparencia();
  const conectorTse = new ConectorTseEleitoral();
  const conectorInss = new ConectorInssDataprev();
  const conectorPgfn = new ConectorPgfnRegularize();

  // 1. CGU / Portal da Transparência (CEIS, CNEP, CEPIM)
  it("deve consultar CGU e atestar idoneidade total para o CNPJ oficial da Kytto", async () => {
    const res = await conectorCgu.consultarSancoesCgu(CONFIG_OFICIAL_KYTTO.empresa.cnpj);

    expect(res.fonteOficial).toBe("PORTAL_TRANSPARENCIA_CGU");
    expect(res.situacaoGeral).toBe("NADA_CONSTA_REGULAR");
    expect(res.ceisTotalSancoes).toBe(0);
    expect(res.cnepTotalSancoes).toBe(0);
    expect(res.cepimTotalSancoes).toBe(0);
    expect(res.idoneidadeContratacaoPublica).toBe(true);
    expect(res.parecerCompliance).toContain("PATRICIA FERRARI PAULINO GONCALVES");
  });

  // 2. TSE - Quitação e Regularidade Eleitoral
  it("deve consultar TSE e emitir certidão de quitação eleitoral válida para escrituras", async () => {
    const res = await conectorTse.consultarQuitacaoEleitoral("52998224725", "CARLOS EDUARDO FERREIRA");

    expect(res.fonteOficial).toBe("TRIBUNAL_SUPERIOR_ELEITORAL_TSE");
    expect(res.situacaoEleitoral).toBe("REGULAR");
    expect(res.quitacaoEleitoralValida).toBe(true);
    expect(res.aptoLavraturaEscrituraImobiliaria).toBe(true);
    expect(res.numeroTituloEleitor.length).toBe(12);
    expect(res.domicilioEleitoral.zonaEleitoral).toBeDefined();
    expect(res.numeroCertidaoQuitacao).toMatch(/^TSE-/);
  });

  // 3. INSS / Dataprev - Benefícios e Margem Consignável 35%
  it("deve consultar base do INSS e calcular margem consignável legal de 35%", async () => {
    const res = await conectorInss.consultarBeneficiosInss("00000000191");

    expect(res.fonteOficial).toBe("INSS_DATAPREV_PREVIDENCIA");
    expect(res.possuiBeneficioAtivo).toBe(true);
    expect(res.beneficios.length).toBe(1);
    expect(res.estabilidadeRendaVitalicia).toBe("ESTAVEL_VITALICIA");
    expect(res.enquadramentoLocacaoImobiliaria).toBe("RENDA_PREFERENCIAL_PERENE");
    expect(res.margemConsignavelTotalCentavos).toBeGreaterThan(0);
  });

  // 4. PGFN Regularize - Dívida Ativa da União (DAU)
  it("deve consultar PGFN Regularize e atestar ausência de débitos na Dívida Ativa da União", async () => {
    const res = await conectorPgfn.consultarDividaAtivaUniao(CONFIG_OFICIAL_KYTTO.empresa.cnpj);

    expect(res.fonteOficial).toBe("PGFN_REGULARIZE_DAU");
    expect(res.situacaoFiscalFederal).toBe("REGULAR_SEM_DEBITOS");
    expect(res.totalInscricoesDau).toBe(0);
    expect(res.emissaoCndFederalPossivel).toBe(true);
    expect(res.parecerFiscal).toContain("PATRICIA FERRARI PAULINO GONCALVES");
  });
});
