import { Router, type Request, type Response } from 'express';
import {
  openFinanceStore,
  obterStatusOpenFinance,
  testarConexaoDiretorioOpenFinance,
} from './openFinanceService';

export function registerOpenFinanceRoutes(app: any) {
  const router = Router();

  // 1. Status e Diagnóstico mTLS
  router.get('/status', (_req: Request, res: Response) => {
    res.json(obterStatusOpenFinance());
  });

  router.post('/test-connection', async (_req: Request, res: Response) => {
    try {
      const resultado = await testarConexaoDiretorioOpenFinance();
      res.json(resultado);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. Consentimentos FAPI
  router.get('/consents', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      consentimentos: openFinanceStore.listarConsentimentos(),
    });
  });

  router.post('/consents', (req: Request, res: Response) => {
    try {
      const { documentoTitular, nomeTitular, instituicaoIspb, permissoes, validadeMeses } = req.body || {};
      if (!documentoTitular) {
        return res.status(400).json({ error: 'Documento do titular (CPF ou CNPJ) é obrigatório.' });
      }
      const consentimento = openFinanceStore.criarConsentimento({
        documentoTitular,
        nomeTitular,
        instituicaoIspb: instituicaoIspb || '00000000',
        permissoes,
        validadeMeses,
      });
      res.status(201).json({ ok: true, consentimento });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/consents/:id/authorize', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const consentimento = openFinanceStore.autorizarConsentimento(id);
      res.json({ ok: true, consentimento });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/consents/:id/revoke', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body || {};
      const consentimento = openFinanceStore.revogarConsentimento(id, motivo);
      res.json({ ok: true, consentimento });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // 3. Compartilhamento de Dados: Contas, Cartões e Operações de Crédito
  router.get('/accounts', (req: Request, res: Response) => {
    const doc = (req.query.documento as string) || undefined;
    const contas = openFinanceStore.listarContas(doc);
    const saldoTotal = contas.reduce((sum, c) => sum + c.saldoDisponivelBrl, 0);
    const limiteTotal = contas.reduce((sum, c) => sum + c.limiteChequeEspecialBrl, 0);
    res.json({
      ok: true,
      totalContas: contas.length,
      saldoConsolidadoBrl: saldoTotal,
      limiteConsolidadoBrl: limiteTotal,
      contas,
    });
  });

  router.get('/credit-cards', (req: Request, res: Response) => {
    const doc = (req.query.documento as string) || undefined;
    const cartoes = openFinanceStore.listarCartoes(doc);
    res.json({
      ok: true,
      totalCartoes: cartoes.length,
      cartoes,
    });
  });

  router.get('/credit-operations', (req: Request, res: Response) => {
    const doc = (req.query.documento as string) || undefined;
    const operacoes = openFinanceStore.listarOperacoesCredito(doc);
    res.json({
      ok: true,
      totalOperacoes: operacoes.length,
      operacoes,
    });
  });

  // 4. Iniciação de Pagamentos Pix (ITP)
  router.get('/payments', (_req: Request, res: Response) => {
    const pagamentos = openFinanceStore.listarPagamentosItp();
    res.json({
      ok: true,
      total: pagamentos.length,
      pagamentos,
    });
  });

  router.post('/payments/initiate', (req: Request, res: Response) => {
    try {
      const {
        consentId,
        documentoPagador,
        nomePagador,
        instituicaoOrigem,
        chavePixDestino,
        nomeRecebedor,
        documentoRecebedor,
        valorBrl,
      } = req.body || {};

      if (!chavePixDestino || !valorBrl) {
        return res.status(400).json({ error: 'Chave Pix de destino e valor são obrigatórios.' });
      }

      const pagamento = openFinanceStore.iniciarPagamentoItp({
        consentId,
        documentoPagador: documentoPagador || '30587162813',
        nomePagador,
        instituicaoOrigem,
        chavePixDestino,
        nomeRecebedor: nomeRecebedor || 'BancoFe Instituição de Pagamento',
        documentoRecebedor: documentoRecebedor || '52889341000192',
        valorBrl: Number(valorBrl),
      });

      res.status(201).json({
        ok: true,
        mensagem: 'Pagamento Pix iniciado via Open Finance ITP com liquidação garantida.',
        pagamento,
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Registra as rotas sob prefixo administrativo
  app.use('/api/admin/open-finance', router);
  app.use('/api/open-finance', router);
}
