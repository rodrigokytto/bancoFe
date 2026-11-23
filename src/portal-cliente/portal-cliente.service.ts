/**
 * ============================================================================
 * BANCOFÉ S.A. - SERVIÇO DO PORTAL DO CLIENTE (INTERNET BANKING AUTOATENDIMENTO)
 * ISPB: 799 • Lei Federal 12.007/2009 • Resolução CMN 4.949/2021
 * ============================================================================
 */

import {
  MotorGestaoEmprestimosBancoFe,
  ContratoEmprestimo,
  ParcelaContrato,
  ComprovanteEnvioInput,
  SimulacaoQuitacaoAntecipada,
} from '../credito/gestao-contratos-emprestimos.js';

export interface SessaoCliente {
  cpfCnpj: string;
  nome: string;
  email: string;
  telefone: string;
  tokenSessao: string;
  dataLogin: string;
}

export interface PainelClienteResumo {
  cliente: {
    cpfCnpj: string;
    nome: string;
    email: string;
    telefone: string;
  };
  metricas: {
    totalContratosAtivos: number;
    saldoDevedorTotal: number;
    proximaParcelaValor: number;
    proximaParcelaVencimento: string;
    limitePreAprovadoNovoEmprestimo: number;
    comprovantesEmAnaliseQtd: number;
  };
  contratos: ContratoEmprestimo[];
}

export interface DeclaracaoQuitacaoAnual {
  protocolo: string;
  anoExercicio: number;
  clienteNome: string;
  clienteCpfCnpj: string;
  contratosQuitados: Array<{
    contratoId: string;
    linhaCredito: string;
    valorOriginal: number;
    dataLiquidacao: string;
  }>;
  dataEmissao: string;
  hashAutenticidade: string;
  baseLegal: string;
}

export class PortalClienteService {
  private static sessoesAtivas: Map<string, SessaoCliente> = new Map();

  /**
   * Autenticar cliente no Portal do Cliente com CPF/CNPJ e senha/código
   */
  public static autenticarCliente(cpfCnpj: string, _codigoAcesso: string): SessaoCliente {
    const limpo = cpfCnpj.replace(/\D/g, '');
    const contratos = MotorGestaoEmprestimosBancoFe.listarPorDocumento(limpo);

    const nome = contratos.length > 0 ? contratos[0].clienteNome : 'Cliente BancoFé';
    const email = contratos.length > 0 ? contratos[0].clienteEmail : 'cliente@bancofe.com.br';
    const telefone = contratos.length > 0 ? contratos[0].clienteTelefone : '(65) 99999-0000';

    const tokenSessao = `BCF-TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const sessao: SessaoCliente = {
      cpfCnpj: limpo,
      nome,
      email,
      telefone,
      tokenSessao,
      dataLogin: new Date().toISOString(),
    };

    this.sessoesAtivas.set(tokenSessao, sessao);
    return sessao;
  }

  /**
   * Obter visão geral e painel 360 do cliente
   */
  public static obterPainelCliente(cpfCnpj: string): PainelClienteResumo {
    const limpo = cpfCnpj.replace(/\D/g, '');
    const contratos = MotorGestaoEmprestimosBancoFe.listarPorDocumento(limpo);

    const saldoDevedorTotal = contratos.reduce(
      (acc: number, c: ContratoEmprestimo) => acc + c.saldoDevedorAtual,
      0
    );

    // Encontrar próxima parcela a vencer
    const todasParcelasAbertas: ParcelaContrato[] = contratos
      .flatMap((c: ContratoEmprestimo) => c.parcelas)
      .filter((p: ParcelaContrato) => p.status === 'A_VENCER' || p.status === 'EM_ATRASO')
      .sort(
        (a: ParcelaContrato, b: ParcelaContrato) =>
          new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()
      );

    const proxima = todasParcelasAbertas[0];
    const comprovantesEmAnalise = contratos
      .flatMap((c: ContratoEmprestimo) => c.parcelas)
      .filter((p: ParcelaContrato) => p.comprovanteStatus === 'EM_ANALISE').length;

    const nome = contratos.length > 0 ? contratos[0].clienteNome : 'Cliente BancoFé';
    const email = contratos.length > 0 ? contratos[0].clienteEmail : 'cliente@bancofe.com.br';
    const telefone = contratos.length > 0 ? contratos[0].clienteTelefone : '(65) 99999-0000';

    return {
      cliente: {
        cpfCnpj: limpo,
        nome,
        email,
        telefone,
      },
      metricas: {
        totalContratosAtivos: contratos.filter((c: ContratoEmprestimo) => c.status === 'ATIVO').length,
        saldoDevedorTotal: Number(saldoDevedorTotal.toFixed(2)),
        proximaParcelaValor: proxima ? proxima.valorParcela : 0,
        proximaParcelaVencimento: proxima ? proxima.vencimento : 'Sem parcelas a vencer',
        limitePreAprovadoNovoEmprestimo: Math.max(50000, Math.round(saldoDevedorTotal * 0.4)),
        comprovantesEmAnaliseQtd: comprovantesEmAnalise,
      },
      contratos,
    };
  }

  /**
   * Emissão de dados de pagamento (Pix & Boleto) da parcela
   */
  public static obterDadosPagamentoParcela(
    contratoId: string,
    numeroParcela: number
  ): {
    contratoId: string;
    numeroParcela: number;
    vencimento: string;
    valor: number;
    linhaDigitavel: string;
    pixCopiaECola: string;
    chavePixBeneficiario: string;
    beneficiario: string;
    instrucoes: string;
  } | null {
    const contrato = MotorGestaoEmprestimosBancoFe.obterPorId(contratoId);
    if (!contrato) return null;

    const parcela = contrato.parcelas.find((p: ParcelaContrato) => p.numero === numeroParcela);
    if (!parcela) return null;

    return {
      contratoId,
      numeroParcela,
      vencimento: parcela.vencimento,
      valor: parcela.valorParcela,
      linhaDigitavel: parcela.linhaDigitavelBoleto,
      pixCopiaECola: parcela.pixCopiaECola,
      chavePixBeneficiario: 'pix@bancofe.com.br',
      beneficiario: 'BancoFe S.A. • ISPB 799 (Agência 0001 / Conta 1001-5)',
      instrucoes:
        'Pagável em qualquer banco, cooperativa (Sicredi, Sicoob), lotéricas ou via Pix instantâneo no SPI.',
    };
  }

  /**
   * Envio de comprovante de pagamento pelo cliente
   */
  public static enviarComprovante(input: ComprovanteEnvioInput) {
    return MotorGestaoEmprestimosBancoFe.receberComprovante(input);
  }

  /**
   * Helper para envio de comprovante com parâmetros avulsos
   */
  public static enviarComprovantePagamento(
    contratoId: string,
    numeroParcela: number,
    comprovanteUrl: string,
    observacao?: string
  ) {
    return MotorGestaoEmprestimosBancoFe.receberComprovante({
      contratoId,
      numeroParcela,
      comprovanteNomeArquivo: 'comprovante_pix.pdf',
      comprovanteBase64OuUrl: comprovanteUrl,
      valorDeclarado: 0,
      dataTransferencia: new Date().toISOString().split('T')[0],
    });
  }

  /**
   * Solicitação de Quitação Antecipada pelo cliente
   */
  public static simularQuitacao(contratoId: string): SimulacaoQuitacaoAntecipada | null {
    return MotorGestaoEmprestimosBancoFe.simularQuitacaoAntecipada(contratoId);
  }

  public static simularQuitacaoAntecipada(contratoId: string): SimulacaoQuitacaoAntecipada | null {
    return MotorGestaoEmprestimosBancoFe.simularQuitacaoAntecipada(contratoId);
  }

  public static solicitarQuitacaoAntecipada(contratoId: string, canalConfirmacao?: string) {
    const simulacao = MotorGestaoEmprestimosBancoFe.simularQuitacaoAntecipada(contratoId);
    if (!simulacao) {
      throw new Error(`Contrato ${contratoId} não localizado ou já liquidado.`);
    }

    return {
      sucesso: true,
      protocolo: `SOL-QUIT-${Date.now().toString().slice(-6)}`,
      contratoId,
      valorComDesconto: simulacao.valorLiquidoParaQuitacao,
      descontoConcedido: simulacao.descontoJurosFuturos,
      validadeProposta: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      canalConfirmacao: canalConfirmacao || 'PORTAL_CLIENTE',
      instrucoes:
        'Transfira o valor total com desconto via Pix para a chave institucional pix@bancofe.com.br informando o protocolo no campo de observação.',
    };
  }

  /**
   * Emissão da Declaração Anual de Quitação de Débitos (Lei Federal 12.007/2009)
   */
  public static emitirDeclaracaoQuitacaoAnual(cpfCnpj: string, anoExercicio: number): DeclaracaoQuitacaoAnual {
    const limpo = cpfCnpj.replace(/\D/g, '');
    const contratos = MotorGestaoEmprestimosBancoFe.listarPorDocumento(limpo);

    const quitados = contratos.filter((c: ContratoEmprestimo) => c.status === 'QUITADO');
    const nome = contratos.length > 0 ? contratos[0].clienteNome : 'Cliente BancoFé';

    const hash = Buffer.from(`${limpo}-${anoExercicio}-${Date.now()}`).toString('hex').slice(0, 32).toUpperCase();

    return {
      protocolo: `DECL-LEI12007-${anoExercicio}-${Date.now().toString().slice(-6)}`,
      anoExercicio,
      clienteNome: nome,
      clienteCpfCnpj: limpo,
      contratosQuitados: quitados.map((c: ContratoEmprestimo) => ({
        contratoId: c.id,
        linhaCredito: c.linhaCreditoNome,
        valorOriginal: c.valorContratado,
        dataLiquidacao: c.parcelas[c.parcelas.length - 1]?.dataPagamento || '2026-05-10',
      })),
      dataEmissao: new Date().toISOString(),
      hashAutenticidade: hash,
      baseLegal: 'Lei Federal nº 12.007, de 29 de julho de 2009 e Resoluções Bacen correlatas.',
    };
  }

  /**
   * Gera declaração a partir de um contrato específico ou CPF
   */
  public static gerarDeclaracaoQuitacaoAnual(contratoIdOuCpf: string): DeclaracaoQuitacaoAnual {
    const contrato = MotorGestaoEmprestimosBancoFe.obterPorId(contratoIdOuCpf);
    const cpf = contrato ? contrato.clienteCpfCnpj : contratoIdOuCpf;
    return this.emitirDeclaracaoQuitacaoAnual(cpf, new Date().getFullYear());
  }
}

export { PortalClienteService as ServicoPortalClienteBancoFe };
export default PortalClienteService;
