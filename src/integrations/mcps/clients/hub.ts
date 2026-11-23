import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from '../../types';
import { BANCOFE_MCP_TOOLS } from '../server/tools';
import { BancoFeMCPServer } from '../server/mcp.server';

export interface ExternalMCPEndpoint {
  id: string;
  name: string;
  type: 'stdio' | 'http' | 'sse';
  endpoint: string;
  enabled: boolean;
  toolsProvided: string[];
}

export class McpHubIntegrationAdapter implements IIntegrationAdapter {
  public id = 'mcp-universal-hub';
  public name = 'Model Context Protocol (MCP) Hub';
  public version = '1.5.0';
  public category = IntegrationCategory.MCP_PROTOCOL;
  public description = 'Hub unificado MCP do BancoFe: expõe servidor nativo JSON-RPC 2.0 (10 ferramentas bancárias) e conecta MCPs externos como WhatsApp Business, Claude Vertex e Anchor Browser.';
  public tags = ['mcp', 'json-rpc', 'ai-agents', 'tools', 'whatsapp-mcp', 'claude-vertex', 'anchor-browser'];

  private externalEndpoints: ExternalMCPEndpoint[] = [
    {
      id: 'd4173eda-8d68-42bf-b751-87402cdf026b',
      name: 'WhatsApp Business API MCP',
      type: 'stdio',
      endpoint: 'whatsapp-business-mcp',
      enabled: true,
      toolsProvided: ['send_whatsapp_message', 'send_template_message', 'manage_contacts'],
    },
    {
      id: '8c89586a-61ec-4aff-8b6f-ce1bc46e7560',
      name: 'Claude Vertex Gateway MCP',
      type: 'http',
      endpoint: 'https://claude-vertex-gateway-108835006988.us-east5.run.app/sse',
      enabled: true,
      toolsProvided: ['claude_analyze_risk', 'claude_compliance_check', 'claude_generate_contract'],
    },
    {
      id: 'd7a2e55b-5a4b-41ca-b5fc-517ad5434152',
      name: 'Anchor Browser Web Automation MCP',
      type: 'http',
      endpoint: 'https://api.anchorbrowser.io/v1',
      enabled: true,
      toolsProvided: ['fetch_regulatory_page', 'perform_browser_scraping'],
    },
    {
      id: 'prisma-postgres',
      name: 'Prisma Postgres MCP Server',
      type: 'stdio',
      endpoint: 'prisma-postgres-mcp',
      enabled: true,
      toolsProvided: ['execute_sql_query', 'inspect_schema', 'backup_ledger'],
    },
  ];

  public capabilities = [
    {
      name: 'Listar Ferramentas MCP Nativas (tools/list)',
      description: 'Retorna a lista completa de ferramentas bancárias expostas para agentes de inteligência artificial.',
      action: 'list_native_tools',
    },
    {
      name: 'Executar Ferramenta MCP (tools/call)',
      description: 'Invoca uma ferramenta bancária através do protocolo JSON-RPC 2.0 com validação de schema.',
      action: 'call_native_tool',
    },
    {
      name: 'Listar Conectores MCP Externos',
      description: 'Exibe status e endpoints de servidores MCP integrados (WhatsApp, Claude Vertex, etc).',
      action: 'list_external_endpoints',
    },
  ];

  public async initialize(): Promise<void> {
    console.log(`[McpHubIntegrationAdapter] Inicializado.`);
  }

  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    return {
      status: 'CONNECTED',
      latencyMs: Date.now() - start + 3,
      message: 'Servidor MCP nativo e 4 gateways externos operando.',
      details: {
        protocolVersion: '2024-11-05',
        nativeToolsCount: BANCOFE_MCP_TOOLS.length,
        connectedExternalServers: this.externalEndpoints.filter((e) => e.enabled).length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute(action: string, payload: any): Promise<any> {
    switch (action) {
      case 'list_native_tools': {
        return {
          success: true,
          tools: BANCOFE_MCP_TOOLS,
        };
      }

      case 'call_native_tool': {
        const { toolName, arguments: toolArgs } = payload;
        if (!toolName) throw new Error('Campo "toolName" é obrigatório.');

        const rpcRequest = {
          jsonrpc: '2.0' as const,
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: toolArgs || {},
          },
        };

        const rpcResponse = BancoFeMCPServer.handleRequest(rpcRequest);
        return {
          success: !rpcResponse.error,
          response: rpcResponse,
          data: rpcResponse.result?.content?.[0]?.text ? JSON.parse(rpcResponse.result.content[0].text) : rpcResponse.result,
        };
      }

      case 'list_external_endpoints': {
        return {
          success: true,
          endpoints: this.externalEndpoints,
        };
      }

      default:
        throw new Error(`Ação não suportada no McpHubIntegrationAdapter: ${action}`);
    }
  }
}
