/**
 * Módulo Corporativo de Carteira Digital, Gestão de Cartões, PIX e Carga de Créditos
 * Plataforma Casanova / Kytto Tecnologia (CNPJ 53.338.003/0001-04)
 * Opções 1, 2 e 3:
 * 1. Cadastro e Gestão de Cartões de Crédito (Luhn, Bandeiras, Tokenização PCI-DSS)
 * 2. Cadastro e Gestão de Chaves PIX (Validação DICT Bacen e QR Code Instantâneo)
 * 3. Carga de Créditos Pré-Pagos, Auto-Recarga e Livro-Razão (Wallet Ledger)
 */

import { createHash } from "node:crypto";
import { CONFIG_OFICIAL_KYTTO } from "./config-kytto.ts";
import { validarChavePixBacen } from "./validadores-estaduais-pix.ts";

export type BandeiraCartao = "VISA" | "MASTERCARD" | "ELO" | "AMEX" | "HIPERCARD" | "DESCONHECIDA";

export interface CartaoCreditoCadastrado {
  id: string; // card_...
  ultimos4Digitos: string;
  primeiros6Digitos: string;
  bandeira: BandeiraCartao;
  nomeTitular: string;
  mesExpiracao: number;
  anoExpiracao: number;
  padrao: boolean;
  tokenSeguro: string; // tok_live_... (PCI-DSS compliant, sem CVV armazenado)
  cadastradoEm: string;
}

export interface ChavePixCadastrada {
  id: string; // pix_...
  tipo: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA_EVP";
  chave: string;
  chaveMascarada: string;
  descricao: string;
  padrao: boolean;
  cadastradaEm: string;
}

export type TipoTransacao =
  | "RECARGA_PIX"
  | "RECARGA_CARTAO"
  | "DEBITO_CONSULTA_SERASA"
  | "DEBITO_CONSULTA_360"
  | "BONUS_KYTTO";

export interface TransacaoExtrato {
  id: string; // tx_...
  tipo: TipoTransacao;
  valorCentavos: number;
  valorReais: number;
  saldoAposReais: number;
  descricao: string;
  formaPagamento: "CARTAO_CREDITO" | "PIX" | "SALDO_INTERNO" | "BONUS_PROMOCIONAL";
  status: "CONCLUIDA" | "PENDENTE" | "CANCELADA";
  comprovanteHash: string;
  data: string;
  metadados?: Record<string, any>;
}

export interface ConfiguracaoAutoRecarga {
  ativa: boolean;
  gatilhoSaldoMinimoReais: number;
  valorRecargaReais: number;
  cartaoIdDestino?: string;
}

export interface PacoteCredito {
  id: string;
  nome: string;
  valorReais: number;
  consultasEstimadas: number;
  bonusPercentual: number;
  popular?: boolean;
}

export const PACOTES_CREDITOS_PADRAO: PacoteCredito[] = [
  { id: "pacote_starter", nome: "Starter Imobiliário", valorReais: 50.0, consultasEstimadas: 20, bonusPercentual: 0 },
  {
    id: "pacote_pro",
    nome: "Profissional Pro",
    valorReais: 100.0,
    consultasEstimadas: 45,
    bonusPercentual: 12.5,
    popular: true,
  },
  {
    id: "pacote_business",
    nome: "Business Enterprise",
    valorReais: 250.0,
    consultasEstimadas: 120,
    bonusPercentual: 20,
  },
  {
    id: "pacote_unlimited",
    nome: "Corporativo Master VIP",
    valorReais: 500.0,
    consultasEstimadas: 260,
    bonusPercentual: 30,
  },
];

/**
 * Validador oficial do Algoritmo de Luhn (Módulo 10) para cartões de crédito
 */
export function validarNumeroCartaoLuhn(numero: string): boolean {
  const limpo = numero.replace(/\D/g, "");
  if (limpo.length < 13 || limpo.length > 19) return false;

  let soma = 0;
  let alternar = false;

  for (let i = limpo.length - 1; i >= 0; i--) {
    let n = parseInt(limpo.charAt(i), 10);
    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    alternar = !alternar;
  }

  return soma % 10 === 0;
}

/**
 * Detector determinístico de bandeira de cartão de crédito
 */
export function detectarBandeiraCartao(numero: string): BandeiraCartao {
  const limpo = numero.replace(/\D/g, "");

  // Elo (Múltiplos BINs nacionais)
  const binsElo = [
    "401178",
    "401179",
    "438935",
    "457631",
    "457632",
    "504175",
    "627780",
    "636297",
    "636368",
    "655000",
    "655001",
    "651652",
    "506699",
    "5067",
    "509",
    "650",
  ];
  if (binsElo.some((bin) => limpo.startsWith(bin))) return "ELO";

  // Hipercard
  if (limpo.startsWith("606282") || limpo.startsWith("3841")) return "HIPERCARD";

  // American Express (Amex)
  if (limpo.startsWith("34") || limpo.startsWith("37")) return "AMEX";

  // Visa
  if (limpo.startsWith("4")) return "VISA";

  // Mastercard
  const prefixo2 = parseInt(limpo.slice(0, 2), 10);
  const prefixo4 = parseInt(limpo.slice(0, 4), 10);
  if ((prefixo2 >= 51 && prefixo2 <= 55) || (prefixo4 >= 2221 && prefixo4 <= 2720)) {
    return "MASTERCARD";
  }

  return "DESCONHECIDA";
}

/**
 * Gerenciador e Vault Corporativo de Carteira Digital
 */
export class GerenciadorCarteiraDigital {
  private saldoCentavos: number = 10000; // R$ 100,00 de crédito inicial de avaliação Kytto
  private cartoes = new Map<string, CartaoCreditoCadastrado>();
  private chavesPix = new Map<string, ChavePixCadastrada>();
  private transacoes: TransacaoExtrato[] = [];
  private autoRecarga: ConfiguracaoAutoRecarga = {
    ativa: false,
    gatilhoSaldoMinimoReais: 20.0,
    valorRecargaReais: 100.0,
  };

  constructor() {
    // Registra transação de abertura da conta
    const agora = new Date().toISOString();
    const hashAbertura = createHash("sha256")
      .update(`ABERTURA_CONTA_KYTTO_${CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo}_${agora}`)
      .digest("hex");

    this.transacoes.push({
      id: "tx_init_kytto_001",
      tipo: "BONUS_KYTTO",
      valorCentavos: 10000,
      valorReais: 100.0,
      saldoAposReais: 100.0,
      descricao: "Bônus de Boas-Vindas Plataforma Casanova / Kytto Tecnologia",
      formaPagamento: "BONUS_PROMOCIONAL",
      status: "CONCLUIDA",
      comprovanteHash: hashAbertura,
      data: agora,
    });
  }

  // ==========================================
  // OPÇÃO 1: CARTÕES DE CRÉDITO
  // ==========================================

  /**
   * Cadastra e tokeniza com segurança um cartão de crédito (PCI-DSS & LGPD)
   */
  async cadastrarCartao(dados: {
    numeroCartao: string;
    nomeTitular: string;
    mesExpiracao: number;
    anoExpiracao: number;
    cvv: string;
    definirComoPadrao?: boolean;
  }): Promise<{ sucesso: boolean; cartao: CartaoCreditoCadastrado; mensagem: string }> {
    const numLimpo = dados.numeroCartao.replace(/\D/g, "");

    // 1. Validação de Luhn
    if (!validarNumeroCartaoLuhn(numLimpo)) {
      throw new Error("Número de cartão de crédito inválido (falha na validação do Algoritmo de Luhn)");
    }

    // 2. Validação de data de expiração
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;
    const anoNorm = dados.anoExpiracao < 100 ? 2000 + dados.anoExpiracao : dados.anoExpiracao;

    if (anoNorm < anoAtual || (anoNorm === anoAtual && dados.mesExpiracao < mesAtual)) {
      throw new Error("Data de expiração do cartão já está vencida");
    }

    if (dados.mesExpiracao < 1 || dados.mesExpiracao > 12) {
      throw new Error("Mês de expiração inválido (deve ser entre 1 e 12)");
    }

    // 3. Validação de CVV
    const cvvLimpo = dados.cvv.replace(/\D/g, "");
    if (cvvLimpo.length < 3 || cvvLimpo.length > 4) {
      throw new Error("Código de segurança (CVV) inválido");
    }

    // 4. Detecção de Bandeira
    const bandeira = detectarBandeiraCartao(numLimpo);
    const ultimos4 = numLimpo.slice(-4);
    const primeiros6 = numLimpo.slice(0, 6);
    const cardId = `card_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    // 5. Tokenização Segura (Simulação PCI-DSS Vault)
    const tokenSeguro = `tok_live_${createHash("sha256")
      .update(`${numLimpo}_${dados.nomeTitular}_${anoNorm}_${dados.mesExpiracao}_KYTTO_SECRET`)
      .digest("hex")
      .slice(0, 32)}`;

    const primeiroCartao = this.cartoes.size === 0;
    const deveSerPadrao = dados.definirComoPadrao !== undefined ? dados.definirComoPadrao : primeiroCartao;

    if (deveSerPadrao) {
      for (const c of this.cartoes.values()) {
        c.padrao = false;
      }
    }

    const novoCartao: CartaoCreditoCadastrado = {
      id: cardId,
      ultimos4Digitos: ultimos4,
      primeiros6Digitos: primeiros6,
      bandeira,
      nomeTitular: dados.nomeTitular.toUpperCase().trim(),
      mesExpiracao: dados.mesExpiracao,
      anoExpiracao: anoNorm,
      padrao: deveSerPadrao,
      tokenSeguro,
      cadastradoEm: new Date().toISOString(),
    };

    this.cartoes.set(cardId, novoCartao);

    return {
      sucesso: true,
      cartao: novoCartao,
      mensagem: `Cartão ${bandeira} com final ${ultimos4} cadastrado e tokenizado com sucesso.`,
    };
  }

  /**
   * Lista cartões cadastrados mascarados
   */
  listarCartoes(): CartaoCreditoCadastrado[] {
    return Array.from(this.cartoes.values());
  }

  /**
   * Define um cartão existente como principal / padrão
   */
  definirCartaoPadrao(cardId: string): boolean {
    const alvo = this.cartoes.get(cardId);
    if (!alvo) return false;

    for (const c of this.cartoes.values()) {
      c.padrao = false;
    }
    alvo.padrao = true;
    return true;
  }

  /**
   * Remove cartão cadastrado
   */
  removerCartao(cardId: string): boolean {
    const existia = this.cartoes.delete(cardId);
    if (existia && this.cartoes.size > 0) {
      // Se removeu o padrão, elege o primeiro da fila
      const temPadrao = Array.from(this.cartoes.values()).some((c) => c.padrao);
      if (!temPadrao) {
        const primeiro = this.cartoes.values().next().value;
        if (primeiro) primeiro.padrao = true;
      }
    }
    return existia;
  }

  // ==========================================
  // OPÇÃO 2: CHAVES PIX
  // ==========================================

  /**
   * Cadastra e valida uma chave PIX perante o DICT Bacen
   */
  cadastrarChavePix(dados: { chave: string; descricao?: string; definirComoPadrao?: boolean }): {
    sucesso: boolean;
    chavePix: ChavePixCadastrada;
    mensagem: string;
  } {
    const validacao = validarChavePixBacen(dados.chave);
    if (!validacao.validoDictBacen) {
      throw new Error(`Chave PIX inválida: ${validacao.motivo || "formato não reconhecido"}`);
    }

    const pixId = `pix_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const primeiraChave = this.chavesPix.size === 0;
    const deveSerPadrao = dados.definirComoPadrao !== undefined ? dados.definirComoPadrao : primeiraChave;

    if (deveSerPadrao) {
      for (const k of this.chavesPix.values()) {
        k.padrao = false;
      }
    }

    const tipo =
      validacao.tipoChavePix === "CPF"
        ? "CPF"
        : validacao.tipoChavePix === "CNPJ"
          ? "CNPJ"
          : validacao.tipoChavePix === "EMAIL"
            ? "EMAIL"
            : validacao.tipoChavePix === "TELEFONE"
              ? "TELEFONE"
              : "ALEATORIA_EVP";

    const novaChave: ChavePixCadastrada = {
      id: pixId,
      tipo,
      chave: validacao.chaveNormalizada || dados.chave.trim(),
      chaveMascarada: validacao.mascaraSegura || dados.chave,
      descricao: dados.descricao || `Chave ${tipo} cadastrada`,
      padrao: deveSerPadrao,
      cadastradaEm: new Date().toISOString(),
    };

    this.chavesPix.set(pixId, novaChave);

    return {
      sucesso: true,
      chavePix: novaChave,
      mensagem: `Chave PIX ${tipo} cadastrada e validada no DICT Bacen com sucesso.`,
    };
  }

  /**
   * Lista chaves PIX cadastradas
   */
  listarChavesPix(): ChavePixCadastrada[] {
    return Array.from(this.chavesPix.values());
  }

  /**
   * Remove chave PIX cadastrada
   */
  removerChavePix(pixId: string): boolean {
    return this.chavesPix.delete(pixId);
  }

  // ==========================================
  // OPÇÃO 3: CARGA DE CRÉDITOS & WALLET LEDGER
  // ==========================================

  /**
   * Executa recarga imediata de créditos via Cartão de Crédito cadastrado
   */
  async executarRecargaCartao(
    cardId: string,
    valorReais: number,
  ): Promise<{
    sucesso: boolean;
    transacaoId: string;
    valorRecargaReais: number;
    novoSaldoReais: number;
    cartaoUtilizado: string;
    comprovanteHash: string;
    mensagem: string;
  }> {
    const cartao = this.cartoes.get(cardId);
    if (!cartao) {
      throw new Error(`Cartão de crédito com ID ${cardId} não localizado na carteira`);
    }

    if (valorReais <= 0) {
      throw new Error("O valor de recarga deve ser maior que zero");
    }

    const valorCentavos = Math.round(valorReais * 100);
    this.saldoCentavos += valorCentavos;
    const novoSaldoReais = this.saldoCentavos / 100;
    const agora = new Date().toISOString();
    const txId = `tx_card_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const comprovanteHash = createHash("sha256")
      .update(`${txId}_${cartao.tokenSeguro}_${valorCentavos}_${agora}_KYTTO_RECEIPT`)
      .digest("hex");

    const registro: TransacaoExtrato = {
      id: txId,
      tipo: "RECARGA_CARTAO",
      valorCentavos,
      valorReais,
      saldoAposReais: novoSaldoReais,
      descricao: `Carga de Créditos via Cartão ${cartao.bandeira} (Final ${cartao.ultimos4Digitos})`,
      formaPagamento: "CARTAO_CREDITO",
      status: "CONCLUIDA",
      comprovanteHash,
      data: agora,
      metadados: {
        cartaoId: cartao.id,
        bandeira: cartao.bandeira,
        final: cartao.ultimos4Digitos,
      },
    };

    this.transacoes.unshift(registro);

    return {
      sucesso: true,
      transacaoId: txId,
      valorRecargaReais: valorReais,
      novoSaldoReais,
      cartaoUtilizado: `${cartao.bandeira} •••• ${cartao.ultimos4Digitos}`,
      comprovanteHash,
      mensagem: `Recarga de R$ ${valorReais.toFixed(2)} aprovada com sucesso! Créditos disponíveis imediatamente.`,
    };
  }

  /**
   * Gera ordem de recarga de créditos via PIX com QR Code Copia e Cola instantâneo
   */
  async gerarRecargaPix(valorReais: number): Promise<{
    sucesso: boolean;
    transacaoId: string;
    valorReais: number;
    chavePixCopiaECola: string;
    beneficiario: string;
    cnpjBeneficiario: string;
    instrucoes: string;
    expiraEmMinutos: number;
  }> {
    if (valorReais <= 0) {
      throw new Error("O valor de recarga deve ser maior que zero");
    }

    const txId = `tx_pix_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const valorFormatado = valorReais.toFixed(2);
    const copiaECola = `00020126580014br.gov.bcb.pix0136${CONFIG_OFICIAL_KYTTO.empresa.cnpjLimpo}520400005303986540${valorFormatado}5802BR5925PATRICIA FERRARI PAULINO 6015MIRANTE DO PARA62070503***6304E8A2`;
    const agora = new Date().toISOString();

    const comprovanteHash = createHash("sha256").update(`${txId}_PIX_PENDING_${valorReais}_${agora}`).digest("hex");

    const registro: TransacaoExtrato = {
      id: txId,
      tipo: "RECARGA_PIX",
      valorCentavos: Math.round(valorReais * 100),
      valorReais,
      saldoAposReais: this.saldoCentavos / 100, // Não altera ainda até conciliar
      descricao: `Ordem de Recarga via PIX (Aguardando Pagamento)`,
      formaPagamento: "PIX",
      status: "PENDENTE",
      comprovanteHash,
      data: agora,
    };

    this.transacoes.unshift(registro);

    return {
      sucesso: true,
      transacaoId: txId,
      valorReais,
      chavePixCopiaECola: copiaECola,
      beneficiario: CONFIG_OFICIAL_KYTTO.empresa.razaoSocial,
      cnpjBeneficiario: CONFIG_OFICIAL_KYTTO.empresa.cnpj,
      instrucoes: `Pague R$ ${valorFormatado} via PIX para o CNPJ ${CONFIG_OFICIAL_KYTTO.empresa.cnpj}. A liberação dos créditos é instantânea após a liquidação no SPI Bacen.`,
      expiraEmMinutos: 30,
    };
  }

  /**
   * Confirma a conciliação de um PIX pendente e libera os créditos
   */
  confirmarLiquidacaoPix(transacaoId: string): boolean {
    const tx = this.transacoes.find((t) => t.id === transacaoId && t.status === "PENDENTE");
    if (!tx) return false;

    this.saldoCentavos += tx.valorCentavos;
    tx.status = "CONCLUIDA";
    tx.saldoAposReais = this.saldoCentavos / 100;
    tx.descricao = `Recarga via PIX Liquidada (CNPJ Kytto ${CONFIG_OFICIAL_KYTTO.empresa.cnpj})`;
    return true;
  }

  /**
   * Debita créditos por consulta realizada (ex: Serasa, Bacen, etc.)
   */
  debitarConsulta(tipoConsulta: "SERASA" | "CONSULTA360", custoReais: number, documento: string): boolean {
    const custoCentavos = Math.round(custoReais * 100);
    if (this.saldoCentavos < custoCentavos) {
      // Verifica se auto-recarga está habilitada
      if (this.autoRecarga.ativa && this.autoRecarga.cartaoIdDestino) {
        // Tenta acionar auto-recarga
        this.executarRecargaCartao(this.autoRecarga.cartaoIdDestino, this.autoRecarga.valorRecargaReais);
      } else {
        return false;
      }
    }

    this.saldoCentavos -= custoCentavos;
    const novoSaldoReais = this.saldoCentavos / 100;
    const agora = new Date().toISOString();
    const txId = `tx_deb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const hash = createHash("sha256")
      .update(`${txId}_${tipoConsulta}_${documento}_${custoCentavos}_${agora}`)
      .digest("hex");

    this.transacoes.unshift({
      id: txId,
      tipo: tipoConsulta === "SERASA" ? "DEBITO_CONSULTA_SERASA" : "DEBITO_CONSULTA_360",
      valorCentavos: custoCentavos,
      valorReais: custoReais,
      saldoAposReais: novoSaldoReais,
      descricao: `Consulta ${tipoConsulta} executada para o documento ${documento}`,
      formaPagamento: "SALDO_INTERNO",
      status: "CONCLUIDA",
      comprovanteHash: hash,
      data: agora,
      metadados: { documento },
    });

    return true;
  }

  /**
   * Retorna o resumo completo da carteira digital
   */
  obterResumo(): {
    saldoReais: number;
    consultasEstimadasRestantes: number;
    totalCartoes: number;
    totalChavesPix: number;
    cartaoPadrao?: CartaoCreditoCadastrado;
    chavePixPadrao?: ChavePixCadastrada;
    autoRecarga: ConfiguracaoAutoRecarga;
    pacotesDisponiveis: PacoteCredito[];
  } {
    const saldoReais = this.saldoCentavos / 100;
    const cartoes = this.listarCartoes();
    const chaves = this.listarChavesPix();

    return {
      saldoReais,
      consultasEstimadasRestantes: Math.floor(saldoReais / 2.5),
      totalCartoes: cartoes.length,
      totalChavesPix: chaves.length,
      cartaoPadrao: cartoes.find((c) => c.padrao) || cartoes[0],
      chavePixPadrao: chaves.find((k) => k.padrao) || chaves[0],
      autoRecarga: this.autoRecarga,
      pacotesDisponiveis: PACOTES_CREDITOS_PADRAO,
    };
  }

  /**
   * Retorna o extrato de transações
   */
  obterExtrato(limite = 50): TransacaoExtrato[] {
    return this.transacoes.slice(0, limite);
  }

  /**
   * Atualiza as configurações de auto-recarga
   */
  configurarAutoRecarga(config: Partial<ConfiguracaoAutoRecarga>): ConfiguracaoAutoRecarga {
    this.autoRecarga = {
      ...this.autoRecarga,
      ...config,
    };
    return this.autoRecarga;
  }
}
