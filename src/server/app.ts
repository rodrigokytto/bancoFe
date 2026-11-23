import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { IntegrationRegistry } from '../integrations/registry';
import { BancoFeMCPServer } from '../integrations/mcps/server/mcp.server';
import { AccountManager } from '../core/ledger/accounts';
import { LedgerEngine } from '../core/ledger/ledger.engine';
import { IntegrationEventBus } from '../integrations/event-bus';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const registry = IntegrationRegistry.getInstance();
const accountManager = new AccountManager();
const ledgerEngine = new LedgerEngine(accountManager);
const eventBus = IntegrationEventBus.getInstance();

// 1. Healthcheck e Resumo Geral
app.get('/api/health', async (_req: Request, res: Response) => {
  const healthChecks = await registry.runHealthChecks();
  const summary = registry.getSummary();
  const audit = ledgerEngine.auditLedger();

  res.json({
    status: 'ONLINE',
    name: 'BancoFe Banking Engine & Integration Hub',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    summary,
    healthChecks,
    ledgerAudit: {
      isValid: audit.isValid,
      accountingEquationBalanced: audit.accountingEquationBalanced,
      totalAssetsBrl: (audit.totalAssets / 100).toFixed(2),
      totalLiabilitiesBrl: (audit.totalLiabilities / 100).toFixed(2),
    },
  });
});

// 2. Catálogo e Status do Módulo de Integrações
app.get('/api/integrations', async (_req: Request, res: Response) => {
  const adapters = registry.listAdapters();
  const healthChecks = await registry.runHealthChecks();

  const formatted = adapters.map((a) => ({
    id: a.id,
    name: a.name,
    version: a.version,
    category: a.category,
    description: a.description,
    tags: a.tags,
    capabilities: a.capabilities,
    health: healthChecks[a.id] || { status: 'UNKNOWN' },
  }));

  res.json({
    total: adapters.length,
    integrations: formatted,
    recentEvents: eventBus.getRecentEvents(10),
  });
});

// 3. Execução Universal de Ações de Integração
app.post('/api/integrations/execute', async (req: Request, res: Response) => {
  const { adapterId, action, payload } = req.body;
  if (!adapterId || !action) {
    return res.status(400).json({ error: 'Campos "adapterId" e "action" são obrigatórios.' });
  }

  try {
    const result = await registry.executeIntegrationAction(adapterId, action, payload || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Erro ao executar integração',
    });
  }
});

// 4. Endpoint Oficial do Protocolo MCP (JSON-RPC 2.0)
app.post('/api/mcp/rpc', (req: Request, res: Response) => {
  const rpcRequest = req.body;
  const rpcResponse = BancoFeMCPServer.handleRequest(rpcRequest);
  res.json(rpcResponse);
});

// 5. Endpoint SSE (Server-Sent Events) para MCP Clients
app.get('/api/mcp/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`event: endpoint\ndata: /api/mcp/rpc\n\n`);

  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// 6. Auditoria do Livro Razão Contábil
app.get('/api/ledger/audit', (_req: Request, res: Response) => {
  const audit = ledgerEngine.auditLedger();
  const accounts = accountManager.listAccounts();
  const journal = ledgerEngine.getJournal();

  res.json({
    audit,
    accountsCount: accounts.length,
    journalEntriesCount: journal.length,
    accounts: accounts.map((a) => ({
      ...a,
      balanceFormatted: (a.balance / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    })),
    recentJournal: journal.slice(-10),
  });
});

// Servir frontend compilado em produção / preview
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Inicialização se executado diretamente
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[BancoFe] Servidor HTTP operando na porta ${port}`);
    console.log(`[BancoFe] Módulo de Integrações carregado com ${registry.listAdapters().length} adaptadores.`);
  });
}

export default app;
