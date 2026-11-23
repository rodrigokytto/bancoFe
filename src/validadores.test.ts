import { describe, expect, it } from "vitest";
import {
  analisarDocumentoEntrada,
  compararNomesFiliacao,
  formatarCnpj,
  formatarCpf,
  mascararCnpjLgpd,
  mascararCpfLgpd,
  obterRegiaoFiscalRfb,
  validarCnpjModulo11,
  validarCpfModulo11,
  validarDataNascimento,
  validarNomeFiliacao,
} from "./validadores.ts";

describe("Validadores e Algoritmos Módulo 11 da Receita Federal", () => {
  it("deve validar CPF válido com dígitos verificadores corretos", () => {
    // CPFs com dígitos matematicamente válidos
    const res = validarCpfModulo11("000.000.001-91");
    // 000000001 -> d1=9, d2=1
    expect(res.valido).toBe(true);
    expect(res.d1).toBe(9);
    expect(res.d2).toBe(1);
  });

  it("deve rejeitar CPF com dígitos verificadores incorretos", () => {
    const res = validarCpfModulo11("123.456.789-00");
    expect(res.valido).toBe(false);
  });

  it("deve rejeitar CPFs com todos os dígitos iguais", () => {
    expect(validarCpfModulo11("11111111111").valido).toBe(false);
    expect(validarCpfModulo11("00000000000").valido).toBe(false);
    expect(validarCpfModulo11("99999999999").valido).toBe(false);
  });

  it("deve validar CNPJ com algoritmo oficial Módulo 11", () => {
    // Ultra Engenharia: 30.680.829/0001-43
    const res = validarCnpjModulo11("30.680.829/0001-43");
    expect(res.valido).toBe(true);
    expect(res.d1).toBe(4);
    expect(res.d2).toBe(3);
  });

  it("deve rejeitar CNPJ com dígitos incorretos", () => {
    const res = validarCnpjModulo11("30.680.829/0001-99");
    expect(res.valido).toBe(false);
  });

  it("deve mapear corretamente as Regiões Fiscais da Receita Federal pelo 9º dígito", () => {
    // 9º dígito 1 = 1ª Região Fiscal (DF, GO, MS, MT, TO)
    const regiao1 = obterRegiaoFiscalRfb("12345678100");
    expect(regiao1.regiao).toBe("1ª Região Fiscal");
    expect(regiao1.estados).toContain("MT");
    expect(regiao1.sedeFiscal).toContain("Cuiabá");

    // 9º dígito 8 = 8ª Região Fiscal (SP)
    const regiao8 = obterRegiaoFiscalRfb("12345678800");
    expect(regiao8.regiao).toBe("8ª Região Fiscal");
    expect(regiao8.estados).toContain("SP");

    // 9º dígito 0 = 10ª Região Fiscal (RS)
    const regiao0 = obterRegiaoFiscalRfb("12345678000");
    expect(regiao0.regiao).toBe("10ª Região Fiscal");
    expect(regiao0.estados).toContain("RS");
  });

  it("deve formatar CPF e CNPJ adequadamente", () => {
    expect(formatarCpf("00000000191")).toBe("000.000.001-91");
    expect(formatarCnpj("30680829000143")).toBe("30.680.829/0001-43");
  });

  it("deve mascarar documentos em estrita conformidade com a LGPD", () => {
    expect(mascararCpfLgpd("00000000191")).toBe("000.***.***-91");
    expect(mascararCnpjLgpd("30680829000143")).toBe("30.680.***0001-43");
  });

  it("deve analisar documento de entrada reconhecendo tipo e validade", () => {
    const analiseCpf = analisarDocumentoEntrada("000.000.001-91");
    expect(analiseCpf.valido).toBe(true);
    expect(analiseCpf.tipo).toBe("CPF");

    const analiseCnpj = analisarDocumentoEntrada("30.680.829/0001-43");
    expect(analiseCnpj.valido).toBe(true);
    expect(analiseCnpj.tipo).toBe("CNPJ");
  });

  it("deve validar e normalizar datas de nascimento no formato DD/MM/AAAA e AAAA-MM-DD", () => {
    const d1 = validarDataNascimento("12/04/1988");
    expect(d1.valido).toBe(true);
    expect(d1.dataIso).toBe("1988-04-12");
    expect(d1.dataFormatada).toBe("12/04/1988");
    expect(d1.maiorDeIdade).toBe(true);
    expect(d1.idadeAnos).toBeGreaterThanOrEqual(35);

    const d2 = validarDataNascimento("1995-09-20");
    expect(d2.valido).toBe(true);
    expect(d2.dataIso).toBe("1995-09-20");
    expect(d2.dataFormatada).toBe("20/09/1995");

    const dInvalida = validarDataNascimento("32/13/2020");
    expect(dInvalida.valido).toBe(false);

    const dFutura = validarDataNascimento("01/01/2099");
    expect(dFutura.valido).toBe(false);
  });

  it("deve validar e normalizar nomes de filiação (Mãe e Pai)", () => {
    const mae = validarNomeFiliacao("Maria Aparecida da Silva", "MAE");
    expect(mae.valido).toBe(true);
    expect(mae.declarada).toBe(true);
    expect(mae.nomeNormalizado).toBe("MARIA APARECIDA DA SILVA");

    const paiNaoDeclarado = validarNomeFiliacao("NÃO DECLARADO", "PAI");
    expect(paiNaoDeclarado.valido).toBe(true);
    expect(paiNaoDeclarado.declarada).toBe(false);

    const nomeInvalido = validarNomeFiliacao("José", "PAI");
    expect(nomeInvalido.valido).toBe(false);
    expect(nomeInvalido.motivo).toContain("nome e sobrenome");
  });

  it("deve calcular compatibilidade e similaridade entre nomes de filiação", () => {
    const comp = compararNomesFiliacao("PATRICIA FERRARI PAULINO", "PATRICIA FERRARI PAULINO GONCALVES");
    expect(comp.compativel).toBe(true);
    expect(comp.similaridadePercentual).toBeGreaterThanOrEqual(70);

    const incompativel = compararNomesFiliacao("MARIA DE FATIMA SILVA", "JOANA PEREIRA SANTOS");
    expect(incompativel.compativel).toBe(false);
  });
});
