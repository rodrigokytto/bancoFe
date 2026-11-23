import { describe, it, expect } from 'vitest';
import { GitDevOpsService } from './git/git-devops.service';
import { BancoFeMCPServer } from './integrations/mcps/server/mcp.server';
import { BANCOFE_MCP_TOOLS } from './integrations/mcps/server/tools';

describe('Git & DevOps Bancário Soberano (Resolução Bacen 85 / ISO 27001)', () => {
  it('deve obter o status do repositório Git com branch, commits e telemetria de produção', () => {
    const status = GitDevOpsService.obterStatusRepositorio();
    expect(status.repositorio).toBe('rodrigokytto/bancoFe');
    expect(status.branchAtual).toBe('main');
    expect(status.ultimoCommit).toBeDefined();
    expect(status.ultimoCommit.shortHash).toBeDefined();
    expect(status.commitsRecentes.length).toBeGreaterThan(0);
    expect(status.deployPrd.status).toBe('ONLINE');
    expect(status.conformidadeSeguranca.resolucaoBacen85).toBe(true);
  });

  it('deve registrar e listar eventos de webhook do GitHub', () => {
    const log = GitDevOpsService.registrarWebhook('push', {
      repository: { full_name: 'rodrigokytto/bancoFe' },
      pusher: { name: 'rodrigokytto' },
      head_commit: { message: 'feat(core): teste automatizado de webhook' },
    });

    expect(log.id).toContain('WH-EVT-');
    expect(log.evento).toBe('push');
    expect(log.statusProcessamento).toBe('PROCESSADO');

    const todos = GitDevOpsService.listarWebhooks();
    expect(todos.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Servidor MCP BancoFé (Model Context Protocol 2024-11-05)', () => {
  it('deve listar 18 ferramentas bancárias nativas via JSON-RPC tools/list', () => {
    const res = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });

    expect(res.error).toBeUndefined();
    expect(res.result.tools.length).toBe(18);
    const names = res.result.tools.map((t: any) => t.name);
    expect(names).toContain('bancofe_sicar_esg_query');
    expect(names).toContain('bancofe_scr_bacen_query');
    expect(names).toContain('bancofe_cartorios_protestos');
    expect(names).toContain('bancofe_mesa_credito_score');
    expect(names).toContain('bancofe_quitacao_cdc_simulate');
    expect(names).toContain('bancofe_declaracao_lei12007');
    expect(names).toContain('bancofe_git_telemetry');
    expect(names).toContain('bancofe_conciliar_comprovante');
  });

  it('deve executar a tool bancofe_sicar_esg_query com sucesso', () => {
    const res = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'bancofe_sicar_esg_query',
        arguments: { document: '06988722661' },
      },
    });

    expect(res.error).toBeUndefined();
    expect(res.result.content[0].text).toContain('status');
  });

  it('deve executar a tool bancofe_scr_bacen_query com sucesso', () => {
    const res = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'bancofe_scr_bacen_query',
        arguments: { document: '06988722661' },
      },
    });

    expect(res.error).toBeUndefined();
    expect(res.result.content[0].text).toContain('rating');
  });

  it('deve executar a tool bancofe_git_telemetry com sucesso', () => {
    const res = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'bancofe_git_telemetry',
        arguments: {},
      },
    });

    expect(res.error).toBeUndefined();
    expect(res.result.content[0].text).toContain('rodrigokytto/bancoFe');
  });

  it('deve ler recursos MCP bancofe://git/status e bancofe://contracts/summary', () => {
    const resGit = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 5,
      method: 'resources/read',
      params: { uri: 'bancofe://git/status' },
    });

    expect(resGit.error).toBeUndefined();
    expect(resGit.result.contents[0].text).toContain('rodrigokytto/bancoFe');

    const resContracts = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 6,
      method: 'resources/read',
      params: { uri: 'bancofe://contracts/summary' },
    });

    expect(resContracts.error).toBeUndefined();
    expect(resContracts.result.contents[0].text).toContain('totalContratos');
  });

  it('deve listar os prompts cadastrados para agentes de IA', () => {
    const res = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: 7,
      method: 'prompts/list',
    });

    expect(res.error).toBeUndefined();
    const promptNames = res.result.prompts.map((p: any) => p.name);
    expect(promptNames).toContain('parecer_credito_360');
    expect(promptNames).toContain('auditoria_git_seguranca_bacen85');
  });
});
