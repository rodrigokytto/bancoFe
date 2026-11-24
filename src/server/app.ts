import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import crypto from 'crypto';
import { IntegrationRegistry } from '../integrations/registry';
import { BancoFeMCPServer } from '../integrations/mcps/server/mcp.server';
import { BANCOFE_MCP_TOOLS } from '../integrations/mcps/server/tools';
import { AccountManager } from '../core/ledger/accounts';
import { LedgerEngine } from '../core/ledger/ledger.engine';
import { IntegrationEventBus } from '../integrations/event-bus';
import { registerPlataformaWebAndApis } from './plataforma-routes';
import { registerCrmFinanceiraRoutes } from '../../server/crmFinanceiraRoutes';
import { registerCadastro360Routes } from '../../server/cadastro360Routes';
import { registerConsultaCpfHub } from '../../server/consultaCpfHub';

const app = express();
const port = process.env.PORT || 3000;
const startTime = Date.now();
let totalRequestsHandled = 0;

// Middleware de Segurança e Otimização para PRD
app.use(
  helmet({
    contentSecurityPolicy: false, // Permite assets Vite e scripts SPA
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Rate Limiter Institucional (1.200 reqs/min por IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de requisições excedido. Tente novamente em breve.' },
});
app.use('/api/', apiLimiter);

// Injeção de Request ID e Logging Estruturado
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || `req_${crypto.randomBytes(6).toString('hex')}`;
  res.setHeader('X-Request-Id', reqId);
  totalRequestsHandled++;

  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    if (process.env.NODE_ENV !== 'test' && !req.path.startsWith('/metrics')) {
      console.log(
        JSON.stringify({
          level: 'INFO',
          timestamp: new Date().toISOString(),
          requestId: reqId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs,
          ip: req.ip,
        })
      );
    }
  });

  next();
});

const registry = IntegrationRegistry.getInstance();
const accountManager = new AccountManager();
const ledgerEngine = new LedgerEngine(accountManager);
const eventBus = IntegrationEventBus.getInstance();

export function registerBancoFeRoutes(targetApp: any) {
  // 1. Healthcheck e Resumo Geral
  targetApp.get('/api/health', async (_req: Request, res: Response) => {
    const healthChecks = await registry.runHealthChecks();
    const summary = registry.getSummary();
    const audit = ledgerEngine.auditLedger();

    res.json({
      status: 'ONLINE',
      environment: process.env.NODE_ENV || 'production',
      name: 'BancoFe Banking Engine & Integration Hub',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
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

  targetApp.get('/api/bancofe/health', async (_req: Request, res: Response) => {
    const healthChecks = await registry.runHealthChecks();
    const summary = registry.getSummary();
    const audit = ledgerEngine.auditLedger();

    res.json({
      status: 'ONLINE',
      environment: process.env.NODE_ENV || 'production',
      name: 'BancoFe Banking Engine & Integration Hub',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
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

  // 2. Métricas no formato Prometheus
  targetApp.get('/metrics', async (_req: Request, res: Response) => {
    const audit = ledgerEngine.auditLedger();
    const mem = process.memoryUsage();
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    const metrics = `
# HELP bancofe_uptime_seconds Tempo de atividade da aplicacao em segundos
# TYPE bancofe_uptime_seconds gauge
bancofe_uptime_seconds ${uptime}

# HELP bancofe_http_requests_total Total de requisicoes HTTP processadas
# TYPE bancofe_http_requests_total counter
bancofe_http_requests_total ${totalRequestsHandled}

# HELP bancofe_memory_heap_used_bytes Memoria Heap Node.js utilizada
# TYPE bancofe_memory_heap_used_bytes gauge
bancofe_memory_heap_used_bytes ${mem.heapUsed}

# HELP bancofe_ledger_assets_cents Ativo Total COSIF em centavos
# TYPE bancofe_ledger_assets_cents gauge
bancofe_ledger_assets_cents ${audit.totalAssets}

# HELP bancofe_ledger_liabilities_cents Passivo Total COSIF em centavos
# TYPE bancofe_ledger_liabilities_cents gauge
bancofe_ledger_liabilities_cents ${audit.totalLiabilities}

# HELP bancofe_active_integrations Total de modulos de integracao ativos
# TYPE bancofe_active_integrations gauge
bancofe_active_integrations ${registry.listAdapters().length}
`.trim();

    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics);
  });

  // 3. Catálogo e Status do Módulo de Integrações
  targetApp.get('/api/integrations', async (_req: Request, res: Response) => {
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

  // 4. Execução Universal de Ações de Integração
  targetApp.post('/api/integrations/execute', async (req: Request, res: Response) => {
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

  // 5. Endpoint Oficial do Protocolo MCP (JSON-RPC 2.0)
  targetApp.post('/api/mcp/rpc', (req: Request, res: Response) => {
    const rpcRequest = req.body;
    const rpcResponse = BancoFeMCPServer.handleRequest(rpcRequest);
    res.json(rpcResponse);
  });

  // 6. Endpoint SSE (Server-Sent Events) para MCP Clients
  targetApp.get('/api/mcp/sse', (req: Request, res: Response) => {
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

  // 7. Auditoria do Livro Razão Contábil
  targetApp.get('/api/ledger/audit', (_req: Request, res: Response) => {
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

  // 8. Especificação OpenAPI 3.0
  targetApp.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'BancoFe API & Integration Engine',
        version: '1.0.0',
        description: 'API Bancária institucional com suporte a Pix BACEN, Boletos FEBRABAN, Open Finance, Model Context Protocol (MCP) e Skills de IA.',
        contact: {
          name: 'BancoFe Suporte Técnico',
          email: 'dev@bancofe.com.br',
        },
      },
      servers: [
        { url: '/', description: 'Servidor Atual (Produção)' },
      ],
      paths: {
        '/api/health': {
          get: {
            summary: 'Status de saúde e integridade contábil',
            responses: { '200': { description: 'Status operacional retornado com sucesso' } },
          },
        },
        '/api/integrations': {
          get: {
            summary: 'Catálogo de todos os adaptadores de integração',
            responses: { '200': { description: 'Lista de adaptadores e status' } },
          },
        },
        '/api/integrations/execute': {
          post: {
            summary: 'Executa uma ação em um adaptador de integração',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { type: 'object' } } },
            },
            responses: { '200': { description: 'Resultado da execução' } },
          },
        },
        '/api/mcp/rpc': {
          post: {
            summary: 'Endpoint JSON-RPC 2.0 do Protocolo MCP',
            responses: { '200': { description: 'Resposta JSON-RPC 2.0' } },
          },
        },
        '/metrics': {
          get: {
            summary: 'Métricas para Prometheus / Grafana',
            responses: { '200': { description: 'Métricas em texto puro' } },
          },
        },
      },
    });
  });

  // 9. Documentação Swagger / OpenAPI Interativa
  targetApp.get('/api/docs', (_req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>BancoFe API • Documentação Oficial</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body style="margin: 0; background: #0b0f19;">
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>
    `);
  });

  // 9.1 Módulo único de Integrações (hub) + Consulta CPF completa
  registerConsultaCpfHub(targetApp);
  // 10. Módulos Oficiais Consulta 360, Pré-Cadastro, Radar e Admin
  registerPlataformaWebAndApis(targetApp);
  registerCrmFinanceiraRoutes(targetApp);
  registerCadastro360Routes(targetApp);
}

// Registra as rotas na aplicação local do BancoFe
registerBancoFeRoutes(app);

// Servir frontend compilado em produção / preview
const distPath = fs.existsSync(path.resolve(process.cwd(), "dist/public"))
  ? path.resolve(process.cwd(), "dist/public")
  : path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));

app.get("*", (req: Request, res: Response, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/metrics")) return next();
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).send("<!doctype html><html><head><title>BancoFe</title></head><body>BancoFe SPA</body></html>");
});

// Inicialização e Graceful Shutdown
let serverInstance: any = null;
const isDirectExecution = process.argv[1]?.includes('src/server/app') || process.env.STANDALONE_BANCOFE === 'true';
if (process.env.NODE_ENV !== 'test' && isDirectExecution) {
  serverInstance = app.listen(port, () => {
    console.log(`[BancoFe PRD] Servidor HTTP operando na porta ${port}`);
    console.log(`[BancoFe PRD] Módulo de Integrações carregado com ${registry.listAdapters().length} adaptadores.`);
    console.log(`[BancoFe PRD] Documentação OpenAPI em /api/docs | Métricas em /metrics`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`[BancoFe PRD] Recebido ${signal}. Encerrando servidor de forma graciosa...`);
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('[BancoFe PRD] Conexões encerradas com sucesso.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export default app;
