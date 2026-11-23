import { describe, expect, it } from "vitest";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { GatewayBureausCreditos } from "./gateway-bureaus-creditos.ts";

describe("GatewayBureausCreditos - Carga de Créditos e Conectores Gratuitos", () => {
  const gateway = new GatewayBureausCreditos();

  it("deve consultar o saldo de créditos da conta em tempo real", async () => {
    const saldo = await gateway.consultarSaldoCreditos();

    expect(saldo.provedor).toBe("INFOSIMPLES_SERASA");
    expect(saldo.saldoReais).toBeGreaterThanOrEqual(0);
    expect(saldo.consultasDisponiveisEstimadas).toBeGreaterThanOrEqual(0);
    expect(saldo.moeda).toBe("BRL");
    expect(saldo.chavePixDestino).toBe(CONFIG_OFICIAL_KYTTO.empresa.cnpj);
    expect(saldo.razaoSocialDestino).toBe(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);
  });

  it("deve gerar ordem de recarga de créditos via PIX para o CNPJ oficial da Kytto", async () => {
    const ordem = await gateway.gerarOrdemRecargaPix(150.0);

    expect(ordem.ordemId).toMatch(/^REC-/);
    expect(ordem.valorReais).toBe(150.0);
    expect(ordem.chavePixCopiaECola).toContain(CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo);
    expect(ordem.beneficiario).toBe(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);
    expect(ordem.cnpjBeneficiario).toBe(CONFIG_OFICIAL_KYTTO.empresa.cnpj);
    expect(ordem.expiraEmMinutos).toBe(30);
  });

  it("deve consultar Serasa/PEFIN/REFIN com desconto de créditos pré-pagos", async () => {
    const resultado = await gateway.consultarSerasaInfoSimples("53.338.003/0001-04", "CNPJ");

    expect(resultado.sucesso).toBe(true);
    expect(resultado.provedor).toContain("InfoSimples Gateway Serasa Experian");
    expect(resultado.creditosConsumidosReais).toBe(2.5);
    expect(resultado.dados.scoreSerasa).toBeGreaterThanOrEqual(800);
    expect(resultado.dados.pefinOcorrencias).toBe(0);
    expect(resultado.dados.refinOcorrencias).toBe(0);
    expect(resultado.dados.cadastroPositivoAtivo).toBe(true);
  });

  it("deve consultar protestos em cartórios nacionais gratuitamente via IEPTB / CENPROT", async () => {
    const protestos = await gateway.consultarProtestosNacionaisIeptb("53338003000104");

    expect(protestos.fonteOficial).toBe("IEPTB_CENPROT_NACIONAL");
    expect(protestos.gratuito).toBe(true);
    expect(protestos.situacaoNacional).toBe("NADA_CONSTA_ADIMPLENTE");
    expect(protestos.totalProtestosLocalizados).toBe(0);
    expect(protestos.totalCartoriosPesquisados).toBeGreaterThan(2000);
    expect(protestos.fontesConsultadas.length).toBeGreaterThan(0);
  });

  it("deve emitir CNDT Trabalhista gratuita do TST/BNDT com validade de 180 dias", async () => {
    const cndt = await gateway.consultarCndtTrabalhistaTst("53.338.003/0001-04");

    expect(cndt.orgaoExpedidor).toBe("TRIBUNAL_SUPERIOR_DO_TRABALHO_TST");
    expect(cndt.gratuito).toBe(true);
    expect(cndt.situacao).toBe("CERTIDAO_NEGATIVA");
    expect(cndt.tipoDocumento).toBe("CNPJ");
    expect(cndt.numeroCertidao).toContain("CNDT/");
    expect(cndt.autenticidadeCodigo).toMatch(/^TST-/);
  });
});
