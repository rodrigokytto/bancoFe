import { describe, it, expect } from "vitest";
import {
  validarCredenciaisUniversal,
  emitirTokenSessao,
  normalizarIdentificador,
  SENHA_PRD_OFICIAL,
} from "../src/server/auth-unificada";

describe("Autenticação Unificada BancoFe PRD", () => {
  it("deve autenticar Rodrigo Gonçalves com rrodrigogon@gmail.com e senha oficial", () => {
    const res = validarCredenciaisUniversal("rrodrigogon@gmail.com", SENHA_PRD_OFICIAL);
    expect(res.valido).toBe(true);
    expect(res.usuario).toBeDefined();
    expect(res.usuario?.email).toBe("rrodrigogon@gmail.com");
    expect(res.usuario?.role).toBe("admin");
    expect(res.usuario?.platformAdmin).toBe(true);
  });

  it("deve autenticar com case variations da senha (#080581verdao e #080581)", () => {
    const res1 = validarCredenciaisUniversal("rrodrigogon@gmail.com", "#080581verdao");
    expect(res1.valido).toBe(true);

    const res2 = validarCredenciaisUniversal("rrodrigogon@gmail.com", "#080581");
    expect(res2.valido).toBe(true);
  });

  it("deve autenticar Rodrigo com email corporativo Kytto", () => {
    const res = validarCredenciaisUniversal("rodrigo.goncalves@kytto.com.br", SENHA_PRD_OFICIAL);
    expect(res.valido).toBe(true);
    expect(res.usuario?.email).toBe("rodrigo.goncalves@kytto.com.br");
  });

  it("deve autenticar com usuário 'Admin' e 'admin'", () => {
    const resAdmin = validarCredenciaisUniversal("Admin", SENHA_PRD_OFICIAL);
    expect(resAdmin.valido).toBe(true);

    const resAdminLower = validarCredenciaisUniversal("admin", SENHA_PRD_OFICIAL);
    expect(resAdminLower.valido).toBe(true);
  });

  it("deve autenticar pelo CPF do Rodrigo (formatado ou apenas dígitos)", () => {
    const resFormatado = validarCredenciaisUniversal("305.871.628-13", SENHA_PRD_OFICIAL);
    expect(resFormatado.valido).toBe(true);

    const resDigitos = validarCredenciaisUniversal("30587162813", SENHA_PRD_OFICIAL);
    expect(resDigitos.valido).toBe(true);
  });

  it("deve rejeitar senha incorreta", () => {
    const res = validarCredenciaisUniversal("rrodrigogon@gmail.com", "senha-errada-123");
    expect(res.valido).toBe(false);
    expect(res.erro).toContain("inválidos");
  });

  it("deve rejeitar usuário inexistente", () => {
    const res = validarCredenciaisUniversal("usuario_fantasma@empresa.com", SENHA_PRD_OFICIAL);
    expect(res.valido).toBe(false);
    expect(res.erro).toContain("não cadastrado");
  });

  it("deve emitir token persistente e manter formato bcf_", () => {
    const res = validarCredenciaisUniversal("rrodrigogon@gmail.com", SENHA_PRD_OFICIAL);
    expect(res.valido).toBe(true);
    const token = emitirTokenSessao(res.usuario!);
    expect(token).toMatch(/^bcf_[a-f0-9]{32}$/);
  });
});
