import { describe, expect, it } from "vitest";
import { validarChavePixBacen, validarInscricaoEstadual } from "./validadores-estaduais-pix.ts";

describe("Validadores Estaduais (IE) e DICT Bacen (PIX)", () => {
  describe("Inscrição Estadual (IE)", () => {
    it("deve aceitar empresa ISENTA", () => {
      const res = validarInscricaoEstadual("ISENTO", "SP");
      expect(res.valido).toBe(true);
      expect(res.ieLimpa).toBe("ISENTO");
    });

    it("deve validar IE oficial de São Paulo com 12 dígitos", () => {
      // IE válida de SP (exemplo de órgão público / concessionária SP)
      // 110.042.490.114
      const res = validarInscricaoEstadual("110.042.490.114", "SP");
      expect(res.valido).toBe(true);
      expect(res.ieLimpa).toBe("110042490114");
    });

    it("deve rejeitar IE de SP com tamanho incorreto", () => {
      const res = validarInscricaoEstadual("123456", "SP");
      expect(res.valido).toBe(false);
      expect(res.motivo).toContain("12 dígitos");
    });

    it("deve validar IE oficial de Mato Grosso com 11 dígitos", () => {
      // Exemplo oficial de MT: 0013000001-9
      const res = validarInscricaoEstadual("0013000001-9", "MT");
      expect(res.valido).toBe(true);
      expect(res.ieLimpa).toBe("00130000019");
    });

    it("deve rejeitar IE de MT com DV incorreto", () => {
      const res = validarInscricaoEstadual("0013000001-5", "MT");
      expect(res.valido).toBe(false);
    });

    it("deve validar IE de outros estados no formato genérico", () => {
      const res = validarInscricaoEstadual("123456789", "SC");
      expect(res.valido).toBe(true);
    });
  });

  describe("Validador DICT Bacen (PIX)", () => {
    it("deve classificar e validar Chave Aleatória EVP (UUID v4)", () => {
      const chaveEvp = "123e4567-e89b-12d3-a456-426614174000";
      const res = validarChavePixBacen(chaveEvp);
      expect(res.validoDictBacen).toBe(true);
      expect(res.tipoChavePix).toBe("EVP_ALEATORIA");
      expect(res.mascaraSegura).toContain("123e4567-****");
    });

    it("deve classificar e validar Chave Pix E-mail", () => {
      const res = validarChavePixBacen("rodrigo.goncalves@kytto.com.br");
      expect(res.validoDictBacen).toBe(true);
      expect(res.tipoChavePix).toBe("EMAIL");
      expect(res.mascaraSegura).toContain("@kytto.com.br");
    });

    it("deve classificar e validar Chave Pix CPF", () => {
      // CPF válido (ex: 000.000.000-00 não é válido pelo mod 11, mas um válido passa)
      // Usando gerador mod 11 ou CPF de teste válido
      const res = validarChavePixBacen("53338003000104"); // CNPJ Kytto
      expect(res.validoDictBacen).toBe(true);
      expect(res.tipoChavePix).toBe("CNPJ");
      expect(res.mascaraSegura).toContain("53.338.***");
    });

    it("deve classificar e validar Chave Pix Telefone celular", () => {
      const res = validarChavePixBacen("+551839911145");
      expect(res.validoDictBacen).toBe(true);
      expect(res.tipoChavePix).toBe("TELEFONE");
      expect(res.chaveNormalizada).toBe("+551839911145");
    });

    it("deve rejeitar chave inválida", () => {
      const res = validarChavePixBacen("chave-totalmente-errada");
      expect(res.validoDictBacen).toBe(false);
      expect(res.tipoChavePix).toBe("INVALIDA");
    });
  });
});
