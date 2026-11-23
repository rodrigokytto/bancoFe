import { IIntegrationAdapter, IntegrationCategory, HealthCheckResult } from './types';
import { PixIntegrationAdapter } from './git-abertos/pix/pix.adapter';
import { BoletoCnabIntegrationAdapter } from './git-abertos/boletos-cnab/boleto.adapter';
import { OpenFinanceAdapter } from './git-abertos/open-finance/open-finance.adapter';
import { MultiGatewayIntegrationAdapter } from './git-abertos/gateways/gateways.adapter';
import { BureauCreditoIntegrationAdapter } from './git-abertos/bureau-credito/bureau.adapter';
import { AgroFinanceIntegrationAdapter } from './git-abertos/agro-finance/agro.adapter';
import { DrexWeb3IntegrationAdapter } from './git-abertos/web3-drex/drex.adapter';
import { McpHubIntegrationAdapter } from './mcps/clients/hub';
import { SkillsEngineIntegrationAdapter } from './skills/engine';

export class IntegrationRegistry {
  private static instance: IntegrationRegistry;
  private adapters: Map<string, IIntegrationAdapter> = new Map();

  private constructor() {
    this.registerDefaultAdapters();
  }

  public static getInstance(): IntegrationRegistry {
    if (!IntegrationRegistry.instance) {
      IntegrationRegistry.instance = new IntegrationRegistry();
    }
    return IntegrationRegistry.instance;
  }

  private registerDefaultAdapters() {
    // 1. Pilares Git Abertos
    this.register(new PixIntegrationAdapter());
    this.register(new BoletoCnabIntegrationAdapter());
    this.register(new OpenFinanceAdapter());
    this.register(new MultiGatewayIntegrationAdapter());
    this.register(new BureauCreditoIntegrationAdapter());
    this.register(new AgroFinanceIntegrationAdapter());
    this.register(new DrexWeb3IntegrationAdapter());

    // 2. Pilar MCP (Model Context Protocol)
    this.register(new McpHubIntegrationAdapter());

    // 3. Pilar Skills (Manus AI Agent Skills)
    this.register(new SkillsEngineIntegrationAdapter());
  }

  public register(adapter: IIntegrationAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public getAdapter(id: string): IIntegrationAdapter | undefined {
    return this.adapters.get(id);
  }

  public listAdapters(): IIntegrationAdapter[] {
    return Array.from(this.adapters.values());
  }

  public listByCategory(category: IntegrationCategory): IIntegrationAdapter[] {
    return this.listAdapters().filter((a) => a.category === category);
  }

  public async runHealthChecks(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};
    for (const [id, adapter] of this.adapters.entries()) {
      try {
        results[id] = await adapter.healthCheck();
      } catch (err: any) {
        results[id] = {
          status: 'DEGRADED',
          latencyMs: 999,
          message: `Falha no healthcheck: ${err?.message || err}`,
          timestamp: new Date().toISOString(),
        };
      }
    }
    return results;
  }

  public async executeIntegrationAction(adapterId: string, action: string, payload: any): Promise<any> {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adaptador de integração não encontrado: ${adapterId}`);
    }
    return adapter.execute(action, payload);
  }

  public getSummary() {
    const all = this.listAdapters();
    const gitOpen = all.filter((a) => a.category === IntegrationCategory.GIT_OPEN_SOURCE);
    const mcps = all.filter((a) => a.category === IntegrationCategory.MCP_PROTOCOL);
    const skills = all.filter((a) => a.category === IntegrationCategory.SKILL_AGENT);

    return {
      totalAdapters: all.length,
      gitOpenCount: gitOpen.length,
      mcpCount: mcps.length,
      skillsCount: skills.length,
      categories: {
        gitOpen: gitOpen.map((a) => ({ id: a.id, name: a.name, version: a.version, tags: a.tags })),
        mcps: mcps.map((a) => ({ id: a.id, name: a.name, version: a.version, tags: a.tags })),
        skills: skills.map((a) => ({ id: a.id, name: a.name, version: a.version, tags: a.tags })),
      },
    };
  }
}
