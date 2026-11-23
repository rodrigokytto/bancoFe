export enum IntegrationCategory {
  GIT_OPEN_SOURCE = 'GIT_OPEN_SOURCE',
  MCP_PROTOCOL = 'MCP_PROTOCOL',
  SKILL_AGENT = 'SKILL_AGENT',
}

export type IntegrationStatus = 'CONNECTED' | 'READY' | 'DEGRADED' | 'DISABLED';

export interface HealthCheckResult {
  status: IntegrationStatus;
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface IntegrationCapability {
  name: string;
  description: string;
  action: string;
  parametersSchema?: Record<string, unknown>;
}

export interface IIntegrationAdapter {
  id: string;
  name: string;
  version: string;
  category: IntegrationCategory;
  description: string;
  tags: string[];
  capabilities: IntegrationCapability[];
  
  initialize(): Promise<void>;
  healthCheck(): Promise<HealthCheckResult>;
  execute(action: string, payload: any): Promise<any>;
}
