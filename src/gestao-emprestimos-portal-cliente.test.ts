import { describe, it, expect } from 'vitest';
import {
  MotorGestaoEmprestimosBancoFe,
} from './credito/gestao-contratos-emprestimos';
import {
  PortalClienteService,
} from './portal-cliente/portal-cliente.service';

describe('Motor de Gestão de Contratos de Empréstimo e Financiamento BancoFé (ISPB 799)', () => {
  it('deve inicializar com contratos pré-configurados para MT e Tangará da Serra', () => {
    const contratos = MotorGestaoEmprestimosBancoFe.listarTodos();
    expect(contratos.length).toBeGreaterThanOrEqual(4);

    const agro = MotorGestaoEmprestimosBancoFe.obterPorId('BCF-EMP-2026-001');
    expect(agro).toBeDefined();
    expect(agro?.clienteNome).toContain('Valdomiro');
    expect(agro?.valorContratado).toBe(2500000);
    expect(agro?.modalidade).toBe('PRICE');
    expect(agro?.parcelas.length).toBe(36);
  });

  it('deve gerar corretamente boletos com linha digitável e Pix Copia e Cola para cada parcela', () => {
    const contrato = MotorGestaoEmprestimosBancoFe.obterPorId('BCF-EMP-2026-001');
    expect(contrato).toBeDefined();

    const p4 = contrato?.parcelas.find((p) => p.numero === 4);
    expect(p4).toBeDefined();
    expect(p4?.linhaDigitavelBoleto).toContain('79991.');
    expect(p4?.pixCopiaECola.toLowerCase()).toContain('00020126580014br.gov.bcb.pix');
    expect(p4?.status).toBe('A_VENCER');
  });

  it('deve permitir ao cliente submeter comprovante de pagamento e a mesa conciliar', () => {
    // 1. Cliente envia comprovante da parcela 4
    const resEnvio = MotorGestaoEmprestimosBancoFe.receberComprovante({
      contratoId: 'BCF-EMP-2026-001',
      numeroParcela: 4,
      comprovanteNomeArquivo: 'comprovante_pix_p4.pdf',
      comprovanteBase64OuUrl: 'https://bancofe.kytto.com.br/comprovantes/pix_p4.pdf',
      valorDeclarado: 79384.22,
      dataTransferencia: '2026-05-14',
      chaveTransacaoOuEndToEnd: 'E799123456202605141000',
    });

    expect(resEnvio.sucesso).toBe(true);

    const contratoAtualizado = MotorGestaoEmprestimosBancoFe.obterPorId('BCF-EMP-2026-001');
    const p4 = contratoAtualizado?.parcelas.find((p) => p.numero === 4);
    expect(p4?.status).toBe('COMPROVANTE_ENVIADO');
    expect(p4?.comprovanteStatus).toBe('EM_ANALISE');

    // 2. Mesa de operações financeiras aprova e concilia
    const conciliado = MotorGestaoEmprestimosBancoFe.conciliarComprovanteMesa(
      'BCF-EMP-2026-001',
      4,
      true,
      'Comprovante validado e conciliado via SPI Bacen.'
    );

    expect(conciliado).toBe(true);
    const p4AposMesa = MotorGestaoEmprestimosBancoFe.obterPorId('BCF-EMP-2026-001')?.parcelas.find((p) => p.numero === 4);
    expect(p4AposMesa?.status).toBe('PAGA');
    expect(p4AposMesa?.comprovanteStatus).toBe('APROVADO');
  });

  it('deve simular quitação antecipada com desconto a valor presente conforme Art. 52 do CDC', () => {
    const simulacao = MotorGestaoEmprestimosBancoFe.simularQuitacaoAntecipada('BCF-EMP-2026-001');
    expect(simulacao).toBeDefined();
    expect(simulacao?.descontoJurosFuturos).toBeGreaterThan(0);
    expect(simulacao?.valorLiquidoParaQuitacao).toBeLessThan(simulacao?.saldoDevedorNominal || 0);
    expect(simulacao?.pixQuitacao).toContain('pix@bancofe.com.br');
  });

  it('deve calcular métricas consolidadas da carteira de crédito', () => {
    const metricas = MotorGestaoEmprestimosBancoFe.obterMetricasCarteira();
    expect(metricas.totalContratos).toBeGreaterThanOrEqual(4);
    expect(metricas.totalContratadoBrl).toBeGreaterThan(3000000);
    expect(metricas.totalSaldoDevedorBrl).toBeGreaterThan(0);
  });
});

describe('Portal do Cliente BancoFé (Autoatendimento & Lei 12.007/2009)', () => {
  it('deve autenticar cliente e retornar painel 360 de débitos e limites', () => {
    const sessao = PortalClienteService.autenticarCliente('51298410153', '123456');
    expect(sessao.tokenSessao).toBeDefined();
    expect(sessao.nome).toContain('Valdomiro');

    const painel = PortalClienteService.obterPainelCliente('51298410153');
    expect(painel.cliente.nome).toContain('Valdomiro');
    expect(painel.contratos.length).toBeGreaterThan(0);
    expect(painel.metricas.totalContratosAtivos).toBeGreaterThan(0);
  });

  it('deve emitir dados de boleto e Pix da parcela para autoatendimento', () => {
    const dados = PortalClienteService.obterDadosPagamentoParcela('BCF-EMP-2026-001', 5);
    expect(dados).toBeDefined();
    expect(dados?.linhaDigitavel).toContain('79991.');
    expect(dados?.beneficiario).toContain('BancoFe S.A.');
  });

  it('deve emitir a Declaração Anual de Quitação de Débitos nos termos da Lei 12.007/2009', () => {
    const decl = PortalClienteService.emitirDeclaracaoQuitacaoAnual('51298410153', 2026);
    expect(decl.protocolo).toContain('DECL-LEI12007-2026');
    expect(decl.clienteNome).toContain('Valdomiro');
    expect(decl.hashAutenticidade).toBeDefined();
    expect(decl.baseLegal).toContain('Lei Federal nº 12.007');
  });
});
