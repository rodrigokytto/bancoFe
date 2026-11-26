import { describe, it, expect, beforeAll } from 'vitest';
import { CATALOGO_POR_ID } from '../server/consultaCpf/catalogo.js';
import { statusDaIntegracao, testarIntegracao } from '../server/consultaCpf/motor.js';
import {
  openFinanceStore,
  obterStatusOpenFinance,
  testarConexaoDiretorioOpenFinance,
} from '../server/openFinanceService';

describe('Integração Completa Open Finance Brasil (Banco Central / FAPI 1.0)', () => {
  beforeAll(() => {
    // Garante variáveis de ambiente ativas para o teste
    process.env.OPENFINANCE_CLIENT_ID = 'bancofe-fapi-client-52889341';
    process.env.OPENFINANCE_CERT = 'ICP_BRASIL_BANCOFE_PROD_MTLS_V4';
  });

  it('1. Catálogo do Hub de Integrações: deve registrar open-finance como ATIVA e INTEGRADA', () => {
    const item = CATALOGO_POR_ID.get('open-finance');
    expect(item).toBeDefined();
    expect(item.id).toBe('open-finance');
    expect(item.integrado).toBe(true);
    expect(item.tipo).toBe('protocolo');
    expect(item.teste).toBe('open-finance');
    expect(item.envVars).toContain('OPENFINANCE_CERT');
    expect(item.envVars).toContain('OPENFINANCE_CLIENT_ID');

    const status = statusDaIntegracao(item, {
      unidades: ['bancofe', 'bancofe_credito'],
    });

    expect(status.status).toBe('ativa');
    expect(status.credencialConfigurada).toBe(true);
    expect(status.variaveisFaltando).toEqual([]);
    expect(status.habilitadaNasUnidades).toContain('bancofe');
  });

  it('2. Teste de Conexão: deve testar o Diretório Open Finance Brasil via motor do Hub', async () => {
    const res = await testarIntegracao('open-finance');
    expect(res.status).toBe('consultada');
    expect(res.resumo).toContain('Diretório Open Finance Brasil conectado');
    expect(res.latenciaMs).toBeGreaterThanOrEqual(0);
  });

  it('3. Diagnóstico mTLS e Diretório: deve validar conformidade FAPI 1.0 Advanced', async () => {
    const status = obterStatusOpenFinance();
    expect(status.online).toBe(true);
    expect(status.participante.ispb).toBe('52889341');
    expect(status.participante.statusDiretorio).toBe('ACTIVE');
    expect(status.segurancaMtls.ativo).toBe(true);
    expect(status.segurancaMtls.variaveisConfiguradas.OPENFINANCE_CERT).toBe(true);
    expect(status.segurancaMtls.variaveisConfiguradas.OPENFINANCE_CLIENT_ID).toBe(true);
    expect(status.diretorioParticipantes.totalInstituicoesConectadas).toBeGreaterThanOrEqual(8);

    const testeDir = await testarConexaoDiretorioOpenFinance();
    expect(testeDir.status).toBe('consultada');
    expect(testeDir.detalhes.conformance).toBe('FAPI 1.0 Advanced Final');
  });

  it('4. Ciclo de Vida do Consentimento FAPI: criar, autorizar e revogar', () => {
    const novo = openFinanceStore.criarConsentimento({
      documentoTitular: '305.871.628-13',
      nomeTitular: 'Rodrigo Ribeiro Gonçalves',
      instituicaoIspb: '00000000', // BB
      validadeMeses: 12,
    });

    expect(novo.consentId).toContain('urn:bancofe:consent:');
    expect(novo.status).toBe('AWAITING_AUTHORISATION');
    expect(novo.documentoTitular).toBe('30587162813');
    expect(novo.urlRedirecionamentoAuth).toContain('auth.openfinance.bancofe.com.br');

    // Autorização
    const autorizado = openFinanceStore.autorizarConsentimento(novo.consentId);
    expect(autorizado.status).toBe('AUTHORISED');
    expect(autorizado.autorizadoEm).toBeDefined();

    // Revogação
    const revogado = openFinanceStore.revogarConsentimento(novo.consentId, 'Teste de revogação LGPD');
    expect(revogado.status).toBe('REVOKED');
    expect(revogado.revogadoEm).toBeDefined();
    expect(revogado.motivoRevogacao).toBe('Teste de revogação LGPD');
  });

  it('5. Compartilhamento de Dados: deve agregar contas, saldos e limites multiconta', () => {
    const contas = openFinanceStore.listarContas('30587162813');
    expect(contas.length).toBeGreaterThan(0);

    const contaBB = contas.find((c) => c.codigoBanco === '001');
    expect(contaBB).toBeDefined();
    expect(contaBB?.saldoDisponivelBrl).toBeGreaterThan(0);
    expect(contaBB?.limiteChequeEspecialBrl).toBeGreaterThan(0);

    const cartoes = openFinanceStore.listarCartoes('30587162813');
    expect(cartoes.length).toBeGreaterThan(0);

    const operacoes = openFinanceStore.listarOperacoesCredito();
    expect(operacoes.length).toBeGreaterThan(0);
  });

  it('6. Iniciação de Pagamentos Pix (ITP): deve executar transferência com EndToEnd BACEN', () => {
    const pgto = openFinanceStore.iniciarPagamentoItp({
      documentoPagador: '30587162813',
      nomePagador: 'Rodrigo Ribeiro Gonçalves',
      instituicaoOrigem: 'Banco do Brasil S.A. (001)',
      chavePixDestino: 'pix@bancofe.com.br',
      nomeRecebedor: 'BancoFe Holding & Operações Financeiras',
      documentoRecebedor: '52889341000192',
      valorBrl: 500.0,
    });

    expect(pgto.paymentId).toContain('ITP_PIX_');
    expect(pgto.endToEndId).toMatch(/^E52889341/);
    expect(pgto.status).toBe('ACCP');
    expect(pgto.statusDescricao).toContain('Liquidada com Sucesso');
    expect(pgto.jwsSignature).toBeDefined();

    const historico = openFinanceStore.listarPagamentosItp();
    expect(historico.some((p) => p.paymentId === pgto.paymentId)).toBe(true);
  });
});
