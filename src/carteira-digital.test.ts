import { describe, expect, it } from "vitest";
import { detectarBandeiraCartao, GerenciadorCarteiraDigital, validarNumeroCartaoLuhn } from "./carteira-digital.ts";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";

describe("GerenciadorCarteiraDigital - Opções 1, 2 e 3 (Cartões, PIX e Carga de Créditos)", () => {
  const wallet = new GerenciadorCarteiraDigital();

  // Testes de Algoritmo de Luhn e Detecção de Bandeiras
  describe("Validação Luhn e Detecção de Bandeiras", () => {
    it("deve validar números de cartão válidos pelo algoritmo de Luhn", () => {
      // Cartão Visa de teste válido (Luhn)
      expect(validarNumeroCartaoLuhn("4532015112830366")).toBe(true);
      // Cartão Mastercard de teste válido (Luhn)
      expect(validarNumeroCartaoLuhn("5425233430109903")).toBe(true);
      // Cartão Amex de teste válido
      expect(validarNumeroCartaoLuhn("378282246310005")).toBe(true);
      // Inválido
      expect(validarNumeroCartaoLuhn("4532015112830367")).toBe(false);
      expect(validarNumeroCartaoLuhn("123")).toBe(false);
    });

    it("deve identificar corretamente as bandeiras de cartões nacionais e internacionais", () => {
      expect(detectarBandeiraCartao("4532015112830366")).toBe("VISA");
      expect(detectarBandeiraCartao("5425233430109903")).toBe("MASTERCARD");
      expect(detectarBandeiraCartao("378282246310005")).toBe("AMEX");
      expect(detectarBandeiraCartao("6062821234567890")).toBe("HIPERCARD");
      expect(detectarBandeiraCartao("6504851234567890")).toBe("ELO");
    });
  });

  // OPÇÃO 1: Cadastro e Gestão de Cartões de Crédito
  describe("Opção 1: Gestão de Cartões de Crédito", () => {
    it("deve cadastrar um cartão de crédito com validação estrita e tokenização segura", async () => {
      const res = await wallet.cadastrarCartao({
        numeroCartao: "4532 0151 1283 0366",
        nomeTitular: "PATRICIA FERRARI PAULINO GONCALVES",
        mesExpiracao: 12,
        anoExpiracao: 2030,
        cvv: "123",
        definirComoPadrao: true,
      });

      expect(res.sucesso).toBe(true);
      expect(res.cartao.id).toMatch(/^card_/);
      expect(res.cartao.bandeira).toBe("VISA");
      expect(res.cartao.ultimos4Digitos).toBe("0366");
      expect(res.cartao.primeiros6Digitos).toBe("453201");
      expect(res.cartao.tokenSeguro).toMatch(/^tok_live_/);
      expect(res.cartao.padrao).toBe(true);
      expect(res.cartao.nomeTitular).toBe("PATRICIA FERRARI PAULINO GONCALVES");
    });

    it("deve rejeitar cartão com data de validade expirada", async () => {
      await expect(
        wallet.cadastrarCartao({
          numeroCartao: "4532015112830366",
          nomeTitular: "TITULAR VENCIDO",
          mesExpiracao: 1,
          anoExpiracao: 2020,
          cvv: "123",
        }),
      ).rejects.toThrow("Data de expiração do cartão já está vencida");
    });

    it("deve permitir alternar o cartão padrão e listar cartões", async () => {
      const res2 = await wallet.cadastrarCartao({
        numeroCartao: "5425233430109903",
        nomeTitular: "RODRIGO RIBEIRO GONCALVES",
        mesExpiracao: 11,
        anoExpiracao: 2029,
        cvv: "456",
        definirComoPadrao: false,
      });

      const lista = wallet.listarCartoes();
      expect(lista.length).toBe(2);

      // Alterna padrão para o segundo cartão
      const alterou = wallet.definirCartaoPadrao(res2.cartao.id);
      expect(alterou).toBe(true);

      const listaAtualizada = wallet.listarCartoes();
      const novoPadrao = listaAtualizada.find((c) => c.id === res2.cartao.id);
      expect(novoPadrao?.padrao).toBe(true);
    });
  });

  // OPÇÃO 2: Cadastro e Gestão de Chaves PIX
  describe("Opção 2: Gestão de Chaves PIX", () => {
    it("deve cadastrar e validar chave PIX CNPJ oficial da Kytto perante o DICT Bacen", () => {
      const res = wallet.cadastrarChavePix({
        chave: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
        descricao: "Chave CNPJ Matriz Kytto Tecnologia",
        definirComoPadrao: true,
      });

      expect(res.sucesso).toBe(true);
      expect(res.chavePix.id).toMatch(/^pix_/);
      expect(res.chavePix.tipo).toBe("CNPJ");
      expect(res.chavePix.padrao).toBe(true);
      expect(res.chavePix.chave).toBe(CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo);
    });

    it("deve cadastrar e validar chave PIX tipo E-mail oficial", () => {
      const res = wallet.cadastrarChavePix({
        chave: "rodrigo.goncalves@kytto.com.br",
        descricao: "E-mail Financeiro Oficial",
      });

      expect(res.sucesso).toBe(true);
      expect(res.chavePix.tipo).toBe("EMAIL");
    });

    it("deve rejeitar chave PIX com formato inválido", () => {
      expect(() =>
        wallet.cadastrarChavePix({
          chave: "chave-completamente-invalida-sem-formato",
        }),
      ).toThrow("Chave PIX inválida");
    });
  });

  // OPÇÃO 3: Carga de Créditos, Auto-Recarga e Wallet Ledger
  describe("Opção 3: Carga de Créditos e Livro-Razão (Wallet Ledger)", () => {
    it("deve executar recarga instantânea via Cartão de Crédito cadastrado", async () => {
      const cartoes = wallet.listarCartoes();
      const cartaoId = cartoes[0]!.id;
      const resumoAntes = wallet.obterResumo();

      const recarga = await wallet.executarRecargaCartao(cartaoId, 150.0);

      expect(recarga.sucesso).toBe(true);
      expect(recarga.valorRecargaReais).toBe(150.0);
      expect(recarga.novoSaldoReais).toBe(resumoAntes.saldoReais + 150.0);
      expect(recarga.comprovanteHash.length).toBe(64);

      const extrato = wallet.obterExtrato();
      const ultimaTx = extrato[0];
      expect(ultimaTx?.tipo).toBe("RECARGA_CARTAO");
      expect(ultimaTx?.status).toBe("CONCLUIDA");
      expect(ultimaTx?.valorReais).toBe(150.0);
    });

    it("deve gerar ordem de recarga via PIX com Copia e Cola e conciliar liquidação", async () => {
      const ordem = await wallet.gerarRecargaPix(100.0);

      expect(ordem.sucesso).toBe(true);
      expect(ordem.transacaoId).toMatch(/^tx_pix_/);
      expect(ordem.chavePixCopiaECola).toContain(CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo);
      expect(ordem.beneficiario).toBe(CONFIG_OFICIAL_KYTTO.empresa.razaoSocial);

      // Simula confirmação da conciliação bancária via webhook Bacen
      const saldoAntes = wallet.obterResumo().saldoReais;
      const liquidou = wallet.confirmarLiquidacaoPix(ordem.transacaoId);

      expect(liquidou).toBe(true);
      expect(wallet.obterResumo().saldoReais).toBe(saldoAntes + 100.0);
    });

    it("deve debitar créditos por consulta realizada e registrar no livro-razão", () => {
      const saldoAntes = wallet.obterResumo().saldoReais;
      const debitou = wallet.debitarConsulta("SERASA", 2.5, "53.338.003/0001-04");

      expect(debitou).toBe(true);
      expect(wallet.obterResumo().saldoReais).toBe(saldoAntes - 2.5);

      const extrato = wallet.obterExtrato();
      const txDebito = extrato[0];
      expect(txDebito?.tipo).toBe("DEBITO_CONSULTA_SERASA");
      expect(txDebito?.valorReais).toBe(2.5);
    });

    it("deve configurar auto-recarga e retornar pacotes comerciais de créditos", () => {
      const config = wallet.configurarAutoRecarga({
        ativa: true,
        gatilhoSaldoMinimoReais: 30.0,
        valorRecargaReais: 200.0,
      });

      expect(config.ativa).toBe(true);
      expect(config.gatilhoSaldoMinimoReais).toBe(30.0);
      expect(config.valorRecargaReais).toBe(200.0);

      const resumo = wallet.obterResumo();
      expect(resumo.pacotesDisponiveis.length).toBeGreaterThanOrEqual(4);
      expect(resumo.consultasEstimadasRestantes).toBeGreaterThan(0);
    });
  });
});
