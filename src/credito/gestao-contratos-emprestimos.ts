/**
 * ============================================================================
 * BANCOFÉ S.A. - MOTOR DE GESTÃO DE CONTRATOS, EMPRÉSTIMOS E AMORTIZAÇÃO
 * ISPB: 799 • Sistema Financeiro Nacional (SFN) • Resolução CMN / Bacen
 * ============================================================================
 * Responsável pelo ciclo de vida integral de empréstimos e financiamentos:
 * 1. Emissão de contratos nas modalidades Price e SAC
 * 2. Controle de parcelas (vencimento, principal, juros, amortização, saldo devedor)
 * 3. Geração de boletos e Pix Copia e Cola (BR Code) para cada parcela
 * 4. Recepção e conciliação de comprovantes de pagamento enviados pelos clientes
 * 5. Quitação antecipada com desconto a valor presente (Art. 52, § 2º do CDC)
 * 6. Controle de pagamentos e recebimentos com fluxo de caixa consolidado
 * ============================================================================
 */

export type ModalidadeAmortizacao = 'PRICE' | 'SAC';
export type StatusContrato = 'ATIVO' | 'QUITADO' | 'INADIMPLENTE' | 'EM_ANALISE' | 'CANCELADO';
export type StatusParcela = 'A_VENCER' | 'PAGA' | 'EM_ATRASO' | 'COMPROVANTE_ENVIADO' | 'NEGOCIADA';

export interface ParcelaContrato {
  numero: number;
  vencimento: string; // YYYY-MM-DD
  valorParcela: number;
  valorAmortizacao: number;
  valorJuros: number;
  saldoDevedorRestante: number;
  status: StatusParcela;
  dataPagamento?: string;
  valorPago?: number;
  linhaDigitavelBoleto: string;
  pixCopiaECola: string;
  comprovanteUrl?: string;
  comprovanteDataEnvio?: string;
  comprovanteStatus?: 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';
  comprovanteObservacao?: string;
}

export interface ContratoEmprestimo {
  id: string; // Ex: BCF-EMP-2026-001
  clienteCpfCnpj: string;
  clienteNome: string;
  clienteTipo: 'PF' | 'PJ';
  clienteEmail: string;
  clienteTelefone: string;
  linhaCreditoId: string;
  linhaCreditoNome: string;
  valorContratado: number;
  taxaMensalPct: number;
  taxaAnualPct: number;
  prazoMeses: number;
  modalidade: ModalidadeAmortizacao;
  dataContratacao: string;
  primeiroVencimento: string;
  saldoDevedorAtual: number;
  totalPago: number;
  status: StatusContrato;
  garantiaDescricao: string;
  parcelas: ParcelaContrato[];
}

export interface ComprovanteEnvioInput {
  contratoId: string;
  numeroParcela: number;
  comprovanteNomeArquivo: string;
  comprovanteBase64OuUrl: string;
  valorDeclarado: number;
  dataTransferencia: string;
  chaveTransacaoOuEndToEnd?: string;
}

export interface SimulacaoQuitacaoAntecipada {
  contratoId: string;
  parcelasRestantesQtd: number;
  saldoDevedorNominal: number;
  descontoJurosFuturos: number;
  valorLiquidoParaQuitacao: number;
  validadeCalculo: string;
  pixQuitacao: string;
}

export class MotorGestaoEmprestimosBancoFe {
  private static contratos: Map<string, ContratoEmprestimo> = new Map();

  static {
    this.inicializarContratosDemo();
  }

  /**
   * Inicializa contratos reais/demonstrativos para Tangará da Serra e MT
   */
  private static inicializarContratosDemo() {
    // Contrato 1: Produtor Rural de Tangará da Serra (Agro CPR)
    this.criarContrato({
      id: 'BCF-EMP-2026-001',
      clienteCpfCnpj: '512.984.101-53',
      clienteNome: 'Dr. Valdomiro Parecis de Andrade',
      clienteTipo: 'PF',
      clienteEmail: 'valdomiro.agro@fazendaparecis.com.br',
      clienteTelefone: '(65) 99988-1201',
      linhaCreditoId: 'agro_cpr',
      linhaCreditoNome: 'Crédito Rural CPR Física e Financeira',
      valorContratado: 2500000,
      taxaMensalPct: 0.75,
      taxaAnualPct: 9.38,
      prazoMeses: 36,
      modalidade: 'PRICE',
      dataContratacao: '2026-01-15',
      primeiroVencimento: '2026-02-15',
      garantiaDescricao: 'Penhor de Safra de Soja (40.000 sacas) e Gleba Rural CAR MT-5107909',
    });

    // Baixa simulada das primeiras parcelas
    this.marcarParcelaPaga('BCF-EMP-2026-001', 1, '2026-02-14', 79384.22);
    this.marcarParcelaPaga('BCF-EMP-2026-001', 2, '2026-03-15', 79384.22);
    this.marcarParcelaPaga('BCF-EMP-2026-001', 3, '2026-04-14', 79384.22);

    // Contrato 2: PME Comércio Tangará (Capital de Giro PJ)
    this.criarContrato({
      id: 'BCF-EMP-2026-002',
      clienteCpfCnpj: '36.296.848/0001-57',
      clienteNome: 'Zuma Gastronomia & Alimentos Ltda',
      clienteTipo: 'PJ',
      clienteEmail: 'financeiro@zuma.kytto.com.br',
      clienteTelefone: '(65) 99811-0805',
      linhaCreditoId: 'giro_pj',
      linhaCreditoNome: 'Capital de Giro PJ / FGI Peac',
      valorContratado: 350000,
      taxaMensalPct: 1.15,
      taxaAnualPct: 14.71,
      prazoMeses: 24,
      modalidade: 'PRICE',
      dataContratacao: '2026-03-10',
      primeiroVencimento: '2026-04-10',
      garantiaDescricao: 'Aval dos Sócios e Recebíveis de Cartão de Crédito Stone/Cielo',
    });

    this.marcarParcelaPaga('BCF-EMP-2026-002', 1, '2026-04-09', 16782.40);
    this.marcarParcelaPaga('BCF-EMP-2026-002', 2, '2026-05-10', 16782.40);

    // Contrato 3: Servidor Público Municipal (Consignado)
    this.criarContrato({
      id: 'BCF-EMP-2026-003',
      clienteCpfCnpj: '069.887.226-61',
      clienteNome: 'Rodrigo Ribeiro Gonçalves',
      clienteTipo: 'PF',
      clienteEmail: 'rodrigo.goncalves@kytto.com.br',
      clienteTelefone: '(65) 99654-3210',
      linhaCreditoId: 'consignado',
      linhaCreditoNome: 'Crédito Consignado (INSS & Servidores)',
      valorContratado: 85000,
      taxaMensalPct: 0.79,
      taxaAnualPct: 9.90,
      prazoMeses: 48,
      modalidade: 'PRICE',
      dataContratacao: '2026-02-01',
      primeiroVencimento: '2026-03-05',
      garantiaDescricao: 'Averbação de Margem Consignável em Folha de Pagamento',
    });

    this.marcarParcelaPaga('BCF-EMP-2026-003', 1, '2026-03-05', 2135.80);
    this.marcarParcelaPaga('BCF-EMP-2026-003', 2, '2026-04-05', 2135.80);
    this.marcarParcelaPaga('BCF-EMP-2026-003', 3, '2026-05-05', 2135.80);

    // Contrato 4: Usina Sucroalcooleira (Home Equity / Imobiliário)
    this.criarContrato({
      id: 'BCF-EMP-2026-004',
      clienteCpfCnpj: '04.596.128/0001-44',
      clienteNome: 'UISA - Usinas Itamarati S/A',
      clienteTipo: 'PJ',
      clienteEmail: 'controladoria@uisa.com.br',
      clienteTelefone: '(65) 3383-1000',
      linhaCreditoId: 'home_equity',
      linhaCreditoNome: 'Home Equity Giro com Garantia Imobiliária',
      valorContratado: 12000000,
      taxaMensalPct: 0.85,
      taxaAnualPct: 10.69,
      prazoMeses: 120,
      modalidade: 'SAC',
      dataContratacao: '2026-01-10',
      primeiroVencimento: '2026-02-10',
      garantiaDescricao: 'Alienação Fiduciária de Matrículas Urbanas e Industriais (LTV 42%)',
    });

    this.marcarParcelaPaga('BCF-EMP-2026-004', 1, '2026-02-09', 202000.00);
    this.marcarParcelaPaga('BCF-EMP-2026-004', 2, '2026-03-09', 201150.00);
    this.marcarParcelaPaga('BCF-EMP-2026-004', 3, '2026-04-09', 200300.00);
    this.marcarParcelaPaga('BCF-EMP-2026-004', 4, '2026-05-09', 199450.00);
  }

  /**
   * Criação e amortização de um novo contrato de empréstimo
   */
  public static criarContrato(params: {
    id?: string;
    clienteCpfCnpj: string;
    clienteNome: string;
    clienteTipo: 'PF' | 'PJ';
    clienteEmail: string;
    clienteTelefone: string;
    linhaCreditoId: string;
    linhaCreditoNome: string;
    valorContratado: number;
    taxaMensalPct: number;
    taxaAnualPct: number;
    prazoMeses: number;
    modalidade: ModalidadeAmortizacao;
    dataContratacao: string;
    primeiroVencimento: string;
    garantiaDescricao: string;
  }): ContratoEmprestimo {
    const id = params.id || `BCF-EMP-${new Date().getFullYear()}-${String(this.contratos.size + 1).padStart(3, '0')}`;
    const i = params.taxaMensalPct / 100;
    const n = params.prazoMeses;
    const pv = params.valorContratado;

    const parcelas: ParcelaContrato[] = [];
    let saldoDevedor = pv;

    if (params.modalidade === 'PRICE') {
      // Parcela fixa Tabela Price
      const valorPrestacao = (pv * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);

      for (let p = 1; p <= n; p++) {
        const juros = saldoDevedor * i;
        const amortizacao = valorPrestacao - juros;
        saldoDevedor = Math.max(0, saldoDevedor - amortizacao);

        const dataVenc = this.adicionarMeses(params.primeiroVencimento, p - 1);
        const nossoNumero = `${id.replace(/\D/g, '')}${String(p).padStart(3, '0')}`;
        const linhaDigitavel = `79991.00015 ${nossoNumero.slice(0, 5)}.${nossoNumero.slice(5)} 00000.000004 1 9999000${Math.round(valorPrestacao)}`;
        const pixPayload = `00020126580014BR.GOV.BCB.PIX0136pix@bancofe.com.br520400005303986540${valorPrestacao.toFixed(2)}5802BR5908BANCOFE6016TANGARA DA SERRA62140510${id}-P${p}6304`;

        parcelas.push({
          numero: p,
          vencimento: dataVenc,
          valorParcela: Number(valorPrestacao.toFixed(2)),
          valorAmortizacao: Number(amortizacao.toFixed(2)),
          valorJuros: Number(juros.toFixed(2)),
          saldoDevedorRestante: Number(saldoDevedor.toFixed(2)),
          status: 'A_VENCER',
          linhaDigitavelBoleto: linhaDigitavel,
          pixCopiaECola: pixPayload,
        });
      }
    } else {
      // Sistema de Amortização Constante (SAC)
      const amortizacaoConstante = pv / n;

      for (let p = 1; p <= n; p++) {
        const juros = saldoDevedor * i;
        const valorPrestacao = amortizacaoConstante + juros;
        saldoDevedor = Math.max(0, saldoDevedor - amortizacaoConstante);

        const dataVenc = this.adicionarMeses(params.primeiroVencimento, p - 1);
        const nossoNumero = `${id.replace(/\D/g, '')}${String(p).padStart(3, '0')}`;
        const linhaDigitavel = `79991.00015 ${nossoNumero.slice(0, 5)}.${nossoNumero.slice(5)} 00000.000004 1 9999000${Math.round(valorPrestacao)}`;
        const pixPayload = `00020126580014BR.GOV.BCB.PIX0136pix@bancofe.com.br520400005303986540${valorPrestacao.toFixed(2)}5802BR5908BANCOFE6016TANGARA DA SERRA62140510${id}-P${p}6304`;

        parcelas.push({
          numero: p,
          vencimento: dataVenc,
          valorParcela: Number(valorPrestacao.toFixed(2)),
          valorAmortizacao: Number(amortizacaoConstante.toFixed(2)),
          valorJuros: Number(juros.toFixed(2)),
          saldoDevedorRestante: Number(saldoDevedor.toFixed(2)),
          status: 'A_VENCER',
          linhaDigitavelBoleto: linhaDigitavel,
          pixCopiaECola: pixPayload,
        });
      }
    }

    const novoContrato: ContratoEmprestimo = {
      id,
      clienteCpfCnpj: params.clienteCpfCnpj,
      clienteNome: params.clienteNome,
      clienteTipo: params.clienteTipo,
      clienteEmail: params.clienteEmail,
      clienteTelefone: params.clienteTelefone,
      linhaCreditoId: params.linhaCreditoId,
      linhaCreditoNome: params.linhaCreditoNome,
      valorContratado: params.valorContratado,
      taxaMensalPct: params.taxaMensalPct,
      taxaAnualPct: params.taxaAnualPct,
      prazoMeses: params.prazoMeses,
      modalidade: params.modalidade,
      dataContratacao: params.dataContratacao,
      primeiroVencimento: params.primeiroVencimento,
      saldoDevedorAtual: params.valorContratado,
      totalPago: 0,
      status: 'ATIVO',
      garantiaDescricao: params.garantiaDescricao,
      parcelas,
    };

    this.contratos.set(id, novoContrato);
    return novoContrato;
  }

  /**
   * Baixa e quitação de parcela
   */
  public static marcarParcelaPaga(
    contratoId: string,
    numeroParcela: number,
    dataPagamento: string,
    valorPago: number
  ): boolean {
    const contrato = this.contratos.get(contratoId);
    if (!contrato) return false;

    const parcela = contrato.parcelas.find((p) => p.numero === numeroParcela);
    if (!parcela) return false;

    parcela.status = 'PAGA';
    parcela.dataPagamento = dataPagamento;
    parcela.valorPago = valorPago;
    parcela.comprovanteStatus = 'APROVADO';

    // Recalcular saldo devedor e total pago do contrato
    contrato.totalPago = contrato.parcelas
      .filter((p) => p.status === 'PAGA')
      .reduce((acc, p) => acc + (p.valorPago || p.valorParcela), 0);

    const parcelasNaoPagas = contrato.parcelas.filter((p) => p.status !== 'PAGA');
    if (parcelasNaoPagas.length === 0) {
      contrato.status = 'QUITADO';
      contrato.saldoDevedorAtual = 0;
    } else {
      contrato.saldoDevedorAtual = parcelasNaoPagas[0].saldoDevedorRestante + parcelasNaoPagas[0].valorAmortizacao;
    }

    return true;
  }

  /**
   * Recepção de comprovante enviado pelo Portal do Cliente
   */
  public static receberComprovante(input: ComprovanteEnvioInput): {
    sucesso: boolean;
    mensagem: string;
    protocolo: string;
  } {
    const contrato = this.contratos.get(input.contratoId);
    if (!contrato) {
      return { sucesso: false, mensagem: 'Contrato não localizado.', protocolo: '' };
    }

    const parcela = contrato.parcelas.find((p) => p.numero === input.numeroParcela);
    if (!parcela) {
      return { sucesso: false, mensagem: 'Parcela informada não encontrada no contrato.', protocolo: '' };
    }

    const protocolo = `REC-BCF-${Date.now().toString().slice(-6)}`;
    parcela.status = 'COMPROVANTE_ENVIADO';
    parcela.comprovanteUrl = input.comprovanteBase64OuUrl;
    parcela.comprovanteDataEnvio = new Date().toISOString();
    parcela.comprovanteStatus = 'EM_ANALISE';
    parcela.comprovanteObservacao = `Comprovante enviado pelo cliente via Portal. Ref: ${input.comprovanteNomeArquivo}. Chave: ${input.chaveTransacaoOuEndToEnd || 'PIX-SPI'}`;

    return {
      sucesso: true,
      mensagem: `Comprovante registrado com sucesso para a Parcela ${input.numeroParcela}! Aguardando conciliação da mesa de operações.`,
      protocolo,
    };
  }

  /**
   * Conciliação/Aprovação de comprovante pela mesa do BancoFé
   */
  public static conciliarComprovanteMesa(
    contratoId: string,
    numeroParcela: number,
    aprovado: boolean,
    observacao?: string
  ): boolean {
    const contrato = this.contratos.get(contratoId);
    if (!contrato) return false;

    const parcela = contrato.parcelas.find((p) => p.numero === numeroParcela);
    if (!parcela) return false;

    if (aprovado) {
      this.marcarParcelaPaga(
        contratoId,
        numeroParcela,
        new Date().toISOString().split('T')[0],
        parcela.valorParcela
      );
      parcela.comprovanteObservacao = observacao || 'Conciliado e validado pela Mesa de Operações Financeiras.';
    } else {
      parcela.status = 'A_VENCER';
      parcela.comprovanteStatus = 'REJEITADO';
      parcela.comprovanteObservacao = observacao || 'Comprovante não confere com os lançamentos bancários no SPI.';
    }

    return true;
  }

  /**
   * Cálculo de quitação antecipada com desconto a valor presente
   */
  public static simularQuitacaoAntecipada(contratoId: string): SimulacaoQuitacaoAntecipada | null {
    const contrato = this.contratos.get(contratoId);
    if (!contrato || contrato.status === 'QUITADO') return null;

    const parcelasAbertas = contrato.parcelas.filter((p) => p.status !== 'PAGA');
    const saldoDevedorNominal = parcelasAbertas.reduce((acc, p) => acc + p.valorParcela, 0);

    // Desconto de juros futuros trazendo cada parcela a valor presente com base na taxa contratual
    const i = contrato.taxaMensalPct / 100;
    let valorPresenteTotal = 0;

    parcelasAbertas.forEach((p, index) => {
      const meses = index + 1;
      const vp = p.valorParcela / Math.pow(1 + i, meses);
      valorPresenteTotal += vp;
    });

    const descontoJurosFuturos = Math.max(0, saldoDevedorNominal - valorPresenteTotal);
    const valorLiquido = Number(valorPresenteTotal.toFixed(2));

    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136pix@bancofe.com.br520400005303986540${valorLiquido.toFixed(2)}5802BR5908BANCOFE6016TANGARA DA SERRA62140510${contratoId}-QUIT6304`;

    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 3); // Validade de 3 dias úteis

    return {
      contratoId,
      parcelasRestantesQtd: parcelasAbertas.length,
      saldoDevedorNominal: Number(saldoDevedorNominal.toFixed(2)),
      descontoJurosFuturos: Number(descontoJurosFuturos.toFixed(2)),
      valorLiquidoParaQuitacao: valorLiquido,
      validadeCalculo: hoje.toISOString().split('T')[0],
      pixQuitacao: pixPayload,
    };
  }

  /**
   * Consulta contratos por documento do cliente (CPF ou CNPJ)
   */
  public static listarPorDocumento(cpfOuCnpj: string): ContratoEmprestimo[] {
    const limpo = cpfOuCnpj.replace(/\D/g, '');
    return Array.from(this.contratos.values()).filter(
      (c) => c.clienteCpfCnpj.replace(/\D/g, '') === limpo
    );
  }

  /**
   * Consulta contrato por ID
   */
  public static obterPorId(id: string): ContratoEmprestimo | undefined {
    return this.contratos.get(id);
  }

  /**
   * Listar todos os contratos da carteira geral
   */
  public static listarTodos(): ContratoEmprestimo[] {
    return Array.from(this.contratos.values());
  }

  /**
   * Resumo executivo da carteira financeira de crédito
   */
  public static obterMetricasCarteira() {
    const todos = this.listarTodos();
    const totalContratado = todos.reduce((acc, c) => acc + c.valorContratado, 0);
    const totalSaldoDevedor = todos.reduce((acc, c) => acc + c.saldoDevedorAtual, 0);
    const totalRecebido = todos.reduce((acc, c) => acc + c.totalPago, 0);

    const totalParcelas = todos.flatMap((c) => c.parcelas);
    const parcelasPagas = totalParcelas.filter((p) => p.status === 'PAGA');
    const parcelasAtrasadas = totalParcelas.filter((p) => p.status === 'EM_ATRASO');
    const comprovantesPendentes = totalParcelas.filter((p) => p.comprovanteStatus === 'EM_ANALISE');

    return {
      totalContratos: todos.length,
      contratosAtivos: todos.filter((c) => c.status === 'ATIVO').length,
      contratosQuitados: todos.filter((c) => c.status === 'QUITADO').length,
      totalContratadoBrl: totalContratado,
      totalSaldoDevedorBrl: totalSaldoDevedor,
      totalRecebidoBrl: totalRecebido,
      taxaInadimplenciaPct: Number(((parcelasAtrasadas.length / (totalParcelas.length || 1)) * 100).toFixed(2)),
      comprovantesAguardandoConciliacao: comprovantesPendentes.length,
    };
  }

  private static adicionarMeses(dataBaseStr: string, meses: number): string {
    const [ano, mes, dia] = dataBaseStr.split('-').map(Number);
    const d = new Date(Date.UTC(ano, mes - 1 + meses, dia));
    return d.toISOString().split('T')[0];
  }
}
