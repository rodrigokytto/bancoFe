import { describe, expect, it } from "vitest";
import { ValidadorIntegracoesCompletas } from "./validador-integracoes.ts";

describe("Validador de Todas as 48 Integrações do Sistema Consulta 360", () => {
  it("deve executar bateria de validação e certificar alta taxa de disponibilidade operacional", async () => {
    const validador = new ValidadorIntegracoesCompletas();
    const relatorio = await validador.validarTodas();

    const falhas = relatorio.diagnosticos.filter((d) => d.status !== "ONLINE_OPERACIONAL");
    if (falhas.length > 0) {
      console.log("INTEGRACOES_COM_FALHA:", JSON.stringify(falhas, null, 2));
    }

    expect(relatorio.totalIntegracoes).toBe(48);
    expect(relatorio.integracoesOperacionais).toBe(48);
    expect(relatorio.taxaDisponibilidadePercentual).toBe(100);
    expect(relatorio.tempoMedioRespostaMs).toBeGreaterThanOrEqual(0);
    expect(relatorio.entidadeAuditora.cnpj).toBe("53.338.003/0001-04");
    expect(relatorio.diagnosticos.length).toBe(48);

    // Validação específica de algumas integrações críticas
    const cgu = relatorio.diagnosticos.find((d) => d.id === "CGU_SANCOES");
    expect(cgu).toBeDefined();
    expect(cgu?.status).toBe("ONLINE_OPERACIONAL");

    const tse = relatorio.diagnosticos.find((d) => d.id === "TSE_ELEITORAL");
    expect(tse).toBeDefined();
    expect(tse?.status).toBe("ONLINE_OPERACIONAL");

    const inss = relatorio.diagnosticos.find((d) => d.id === "INSS_DATAPREV");
    expect(inss).toBeDefined();
    expect(inss?.status).toBe("ONLINE_OPERACIONAL");

    const pgfn = relatorio.diagnosticos.find((d) => d.id === "PGFN_DAU");
    expect(pgfn).toBeDefined();
    expect(pgfn?.status).toBe("ONLINE_OPERACIONAL");

    const carteira = relatorio.diagnosticos.find((d) => d.id === "CARTEIRA_CARTOES");
    expect(carteira).toBeDefined();
    expect(carteira?.status).toBe("ONLINE_OPERACIONAL");

    const pix = relatorio.diagnosticos.find((d) => d.id === "CARTEIRA_PIX");
    expect(pix).toBeDefined();
    expect(pix?.status).toBe("ONLINE_OPERACIONAL");

    const veiculos = relatorio.diagnosticos.find((d) => d.id === "SENATRAN_RENAVAM_VEICULOS");
    expect(veiculos).toBeDefined();
    expect(veiculos?.status).toBe("ONLINE_OPERACIONAL");

    const car = relatorio.diagnosticos.find((d) => d.id === "CAR_INCRA_RURAL");
    expect(car).toBeDefined();
    expect(car?.status).toBe("ONLINE_OPERACIONAL");

    const linkedin = relatorio.diagnosticos.find((d) => d.id === "OSINT_LINKEDIN_PROFISSIONAL");
    expect(linkedin).toBeDefined();
    expect(linkedin?.status).toBe("ONLINE_OPERACIONAL");

    const lancamento = relatorio.diagnosticos.find((d) => d.id === "REDE_LANCAMENTO_IMOBILIARIO");
    expect(lancamento).toBeDefined();
    expect(lancamento?.status).toBe("ONLINE_OPERACIONAL");

    const cbt = relatorio.diagnosticos.find((d) => d.id === "CBT_BEACH_TENNIS");
    expect(cbt).toBeDefined();
    expect(cbt?.status).toBe("ONLINE_OPERACIONAL");

    const lattes = relatorio.diagnosticos.find((d) => d.id === "CNPQ_LATTES_ACADEMICO");
    expect(lattes).toBeDefined();
    expect(lattes?.status).toBe("ONLINE_OPERACIONAL");

    const oab = relatorio.diagnosticos.find((d) => d.id === "OAB_CNA_FEDERAL");
    expect(oab).toBeDefined();
    expect(oab?.status).toBe("ONLINE_OPERACIONAL");

    const bacenSgs = relatorio.diagnosticos.find((d) => d.id === "BACEN_SGS_CREDITO_IMOBILIARIO");
    expect(bacenSgs).toBeDefined();
    expect(bacenSgs?.status).toBe("ONLINE_OPERACIONAL");

    const registroBr = relatorio.diagnosticos.find((d) => d.id === "NICBR_REGISTROBR_DOMINIOS");
    expect(registroBr).toBeDefined();
    expect(registroBr?.status).toBe("ONLINE_OPERACIONAL");

    const ibgeNomes = relatorio.diagnosticos.find((d) => d.id === "IBGE_CENSO_NOMES_HOMONIMIA");
    expect(ibgeNomes).toBeDefined();
    expect(ibgeNomes?.status).toBe("ONLINE_OPERACIONAL");

    const cvm = relatorio.diagnosticos.find((d) => d.id === "CVM_CORRETORAS_MERCADO_CAPITAIS");
    expect(cvm).toBeDefined();
    expect(cvm?.status).toBe("ONLINE_OPERACIONAL");

    const camaraPep = relatorio.diagnosticos.find((d) => d.id === "CAMARA_DEPUTADOS_PEP_LEGISLATIVO");
    expect(camaraPep).toBeDefined();
    expect(camaraPep?.status).toBe("ONLINE_OPERACIONAL");
  }, 90000);
});
