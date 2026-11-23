import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, AlertCircle, MessageSquare, Shield, Globe, Database } from 'lucide-react';
import { BANCOFE_MCP_TOOLS } from '../../integrations/mcps/server/tools';
import { BancoFeMCPServer } from '../../integrations/mcps/server/mcp.server';

export const McpCockpit: React.FC = () => {
  const [selectedToolName, setSelectedToolName] = useState(BANCOFE_MCP_TOOLS[0].name);
  const [argumentsJson, setArgumentsJson] = useState('{\n  "pixKey": "contato@bancofe.com.br",\n  "amount": 250.00\n}');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedTool = BANCOFE_MCP_TOOLS.find((t) => t.name === selectedToolName) || BANCOFE_MCP_TOOLS[0];

  const handleSelectTool = (tool: typeof selectedTool) => {
    setSelectedToolName(tool.name);
    // Preenche com parâmetros de exemplo padrão
    if (tool.name === 'bancofe_create_pix') {
      setArgumentsJson('{\n  "pixKey": "contato@bancofe.com.br",\n  "amount": 250.00\n}');
    } else if (tool.name === 'bancofe_issue_boleto') {
      setArgumentsJson('{\n  "amount": 450.00,\n  "payerName": "CLIENTE AGRO TESTE",\n  "payerDocument": "11.222.333/0001-44"\n}');
    } else if (tool.name === 'bancofe_consult_cpf_cnpj') {
      setArgumentsJson('{\n  "document": "06988722661"\n}');
    } else if (tool.name === 'bancofe_simulate_loan') {
      setArgumentsJson('{\n  "principalBrl": 200000,\n  "months": 24,\n  "annualRatePercent": 11.5,\n  "system": "PRICE"\n}');
    } else if (tool.name === 'bancofe_send_whatsapp_alert') {
      setArgumentsJson('{\n  "phoneNumber": "5565999887766",\n  "message": "Seu Pix de R$ 250,00 foi recebido com sucesso no BancoFe.",\n  "notificationType": "PIX_RECEIVED"\n}');
    } else {
      setArgumentsJson('{}');
    }
    setResponseOutput(null);
  };

  const handleRunTool = () => {
    setLoading(true);
    try {
      const parsedArgs = JSON.parse(argumentsJson);
      const rpcRequest = {
        jsonrpc: '2.0' as const,
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: selectedToolName,
          arguments: parsedArgs,
        },
      };

      const res = BancoFeMCPServer.handleRequest(rpcRequest);
      setResponseOutput(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Cockpit do Protocolo MCP (Model Context Protocol)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Execução e inspeção de ferramentas bancárias nativas em formato JSON-RPC 2.0 e status dos servidores MCP externos.
        </p>
      </div>

      {/* Grid de Servidores MCP Externos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-slate-200">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Business MCP</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ATIVO</span>
          </div>
          <p className="text-[11px] text-slate-400">Disparo de 2FA, comprovantes e bot bancário oficial.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-slate-200">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Claude Vertex MCP</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">ATIVO</span>
          </div>
          <p className="text-[11px] text-slate-400">Análise de risco de crédito, PLD/FT e minutas de CPR.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-slate-200">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Anchor Browser MCP</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">ATIVO</span>
          </div>
          <p className="text-[11px] text-slate-400">Automação de consultas regulatórias no BACEN e B3.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-slate-200">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Prisma Postgres MCP</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">ATIVO</span>
          </div>
          <p className="text-[11px] text-slate-400">Persistência segura e auditoria do Livro Razão.</p>
        </div>
      </div>

      {/* Testador Interativo de Ferramentas MCP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Ferramentas Nativas */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Ferramentas Nativas ({BANCOFE_MCP_TOOLS.length})
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {BANCOFE_MCP_TOOLS.map((tool) => {
              const isSelected = tool.name === selectedToolName;
              return (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-mono text-[11px]">{tool.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{tool.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor de Requisição e Resposta JSON-RPC */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400">Ferramenta Selecionada:</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400">{selectedTool.name}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedTool.description}</p>
              </div>

              <button
                onClick={handleRunTool}
                disabled={loading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-cyan-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executando...' : 'Invocar Tool'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Argumentos da Chamada (JSON):
              </label>
              <textarea
                rows={5}
                value={argumentsJson}
                onChange={(e) => setArgumentsJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {responseOutput && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-emerald-400">Resposta JSON-RPC 2.0 (result.content):</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-64">
                  {responseOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
