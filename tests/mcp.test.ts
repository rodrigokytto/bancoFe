import { describe, it, expect } from 'vitest';
import { BANCOFE_MCP_TOOLS } from '../src/integrations/mcps/server/tools';
import { BancoFeMCPServer } from '../src/integrations/mcps/server/mcp.server';
import { McpHubIntegrationAdapter } from '../src/integrations/mcps/clients/hub';

describe('Integração Protocolo MCP (Model Context Protocol)', () => {
  it('deve disponibilizar 18 ferramentas bancárias nativas com schemas estritos', () => {
    expect(BANCOFE_MCP_TOOLS.length).toBe(18);

    const toolNames = BANCOFE_MCP_TOOLS.map((t) => t.name);
    expect(toolNames).toContain('bancofe_create_pix');
    expect(toolNames).toContain('bancofe_simulate_loan');
    expect(toolNames).toContain('bancofe_issue_boleto');
    expect(toolNames).toContain('bancofe_audit_ledger');
    expect(toolNames).toContain('bancofe_open_finance_consent');
  });

  it('deve processar requisições JSON-RPC 2.0 no servidor MCP', async () => {
    // Teste tools/list
    const listRes = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });

    expect(listRes.result).toBeDefined();
    expect(listRes.result.tools).toHaveLength(18);

    // Teste chamada de ferramenta bancária: bancofe_simulate_loan
    const callRes = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'bancofe_simulate_loan',
        arguments: {
          principalBrl: 100000,
          annualRatePercent: 12,
          months: 12,
          system: 'SAC',
        },
      },
    });

    expect(callRes.result).toBeDefined();
    const parsedData = JSON.parse(callRes.result.content[0].text);
    expect(parsedData.system).toContain('SAC');
    expect(parsedData.months).toBe(12);
    expect(parsedData.totalPaidBrl).toBeGreaterThan(100000);
  });

  it('deve conectar ao McpHubIntegrationAdapter e listar ferramentas e conectores', async () => {
    const hub = new McpHubIntegrationAdapter();
    const res = await hub.execute('list_external_endpoints', {});

    expect(res.success).toBe(true);
    expect(res.endpoints.length).toBe(4);
    const names = res.endpoints.map((e: any) => e.name);
    expect(names).toContain('WhatsApp Business API MCP');
    expect(names).toContain('Claude Vertex Gateway MCP');
  });
});
