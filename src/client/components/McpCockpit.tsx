import React, { useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Shield,
  Globe,
  Database,
  Terminal,
  BookOpen,
  Sparkles,
  Layers,
  Copy,
  Check,
  Search,
  Code2,
} from 'lucide-react';
import { BANCOFE_MCP_TOOLS, MCPToolDefinition } from '../../integrations/mcps/server/tools';
import { BancoFeMCPServer } from '../../integrations/mcps/server/mcp.server';

export const McpCockpit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'resources' | 'prompts' | 'servers'>('tools');
  const [selectedToolName, setSelectedToolName] = useState(BANCOFE_MCP_TOOLS[0].name);
  const [argumentsJson, setArgumentsJson] = useState('{\n  "pixKey": "contato@bancofe.com.br",\n  "amount": 250.00\n}');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [buscaTool, setBuscaTool] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');

  // Recursos MCP
  const [selectedResourceUri, setSelectedResourceUri] = useState('bancofe://git/status');
  const [resourceContent, setResourceContent] = useState<string | null>(null);

  // Prompts MCP
  const [selectedPromptName, setSelectedPromptName] = useState('parecer_credito_360');
  const [promptOutput, setPromptOutput] = useState<string | null>(null);

  const selectedTool = BANCOFE_MCP_TOOLS.find((t) => t.name === selectedToolName) || BANCOFE_MCP_TOOLS[0];

  const handleSelectTool = (tool: MCPToolDefinition) => {
    setSelectedToolName(tool.name);
    // Preenche com parâmetros padrão inteligentes
    if (tool.name === 'bancofe_create_pix') {
      setArgumentsJson('{\n  "pixKey": "contato@bancofe.com.br",\n  "amount": 250.00\n}');
    } else if (tool.name === 'bancofe_issue_boleto') {
      setArgumentsJson('{\n  "amount": 450.00,\n  "payerName": "CLIENTE AGRO TESTE",\n  "payerDocument": "11.222.333/0001-44"\n}');
    } else if (tool.name === 'bancofe_consult_cpf_cnpj') {
      setArgumentsJson('{\n  "document": "06988722661"\n}');
    } else if (tool.name === 'bancofe_sicar_esg_query') {
      setArgumentsJson('{\n  "document": "06988722661",\n  "carNumero": "MT-5107909-0001"\n}');
    } else if (tool.name === 'bancofe_scr_bacen_query') {
      setArgumentsJson('{\n  "document": "06988722661"\n}');
    } else if (tool.name === 'bancofe_cartorios_protestos') {
      setArgumentsJson('{\n  "document": "06988722661",\n  "valorImovelAvaliado": 3500000\n}');
    } else if (tool.name === 'bancofe_mesa_credito_score') {
      setArgumentsJson('{\n  "document": "06988722661",\n  "rendaMensalDeclarada": 45000\n}');
    } else if (tool.name === 'bancofe_quitacao_cdc_simulate') {
      setArgumentsJson('{\n  "contratoId": "BCF-EMP-2026-001"\n}');
    } else if (tool.name === 'bancofe_declaracao_lei12007') {
      setArgumentsJson('{\n  "document": "51298410153",\n  "anoExercicio": 2026\n}');
    } else if (tool.name === 'bancofe_git_telemetry') {
      setArgumentsJson('{}');
    } else if (tool.name === 'bancofe_conciliar_comprovante') {
      setArgumentsJson('{\n  "contratoId": "BCF-EMP-2026-001",\n  "numeroParcela": 4,\n  "aprovar": true,\n  "observacaoMesa": "Aprovado via MCP Cockpit"\n}');
    } else if (tool.name === 'bancofe_simulate_loan') {
      setArgumentsJson('{\n  "principalBrl": 200000,\n  "months": 24,\n  "annualRatePercent": 11.5,\n  "system": "PRICE"\n}');
    } else if (tool.name === 'bancofe_send_whatsapp_alert') {
      setArgumentsJson('{\n  "phoneNumber": "5565999887766",\n  "message": "Seu Pix de R$ 250,00 foi recebido com sucesso no BancoFe.",\n  "notificationType": "PIX_RECEIVED"\n}');
    } else if (tool.name === 'bancofe_drex_settlement') {
      setArgumentsJson('{\n  "amountBrl": 50000,\n  "assetType": "TPFt_LTN"\n}');
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

  const handleReadResource = (uri: string) => {
    setSelectedResourceUri(uri);
    const res = BancoFeMCPServer.handleRequest({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'resources/read',
      params: { uri },
    });
    setResourceContent(JSON.stringify(res, null, 2));
  };

  const handleGeneratePrompt = (name: string) => {
    setSelectedPromptName(name);
    let promptText = '';
    if (name === 'parecer_credito_360') {
      promptText = `[PARECER DE CRÉDITO 360° BANCOFÉ - AGRO & CORPORATIVO]\nVocê é um perito sênior de crédito do BancoFe S.A. (ISPB 799).\nAnalise o tomador sob a ótica da Resolução CMN 2.682/1999, verifique o endividamento consolidado no SCR Bacen, cheque a regularidade ambiental do imóvel rural no SICAR (Reserva Legal 35% Cerrado MT e ausência de embargos IBAMA) e pesquise apontamentos no CENPROT.\nEmita recomendação formal com rating (AAA-D), limite sugerido e garantias recomendadas (Penhor de safra / Alienação fiduciária).`;
    } else if (name === 'auditoria_git_seguranca_bacen85') {
      promptText = `[AUDITORIA DE SEGURANÇA CIBERNÉTICA & GIT - RESOLUÇÃO BACEN 85]\nAudite o repositório rodrigokytto/bancoFe quanto ao controle de versão seguro, integridade de commits assinados via GPG, pipeline de integração contínua (CI/CD) e esteira de deploy no Google Cloud Platform Cloud Run.\nVerifique logs de webhook, branches protegidas e segregação de funções.`;
    } else {
      promptText = `[PROMPT BANCÁRIO PADRÃO]\nExecute a auditoria matemática do Livro Razão em partidas dobradas e verifique o equilíbrio patrimonial do BancoFe S.A.`;
    }
    setPromptOutput(promptText);
  };

  const copiarTexto = (txt: string) => {
    navigator.clipboard?.writeText(txt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const toolsFiltradas = BANCOFE_MCP_TOOLS.filter((t) => {
    const matchBusca = t.name.toLowerCase().includes(buscaTool.toLowerCase()) || t.description.toLowerCase().includes(buscaTool.toLowerCase());
    return matchBusca;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header do Cockpit MCP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> MODEL CONTEXT PROTOCOL (MCP)
              </span>
              <span className="text-xs text-slate-400 font-mono">JSON-RPC 2.0 • SSE • Stdio</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Cockpit Oficial MCP BancoFé
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Plataforma de orquestração de ferramentas e contexto para agentes de IA (Claude, Manus, Cursor e LLMs locais).
              Conexão nativa com Core Bancário, Consulta 360, Git DevOps, SICAR e Pix.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(
              [
                { id: 'tools', label: 'Ferramentas (18)', icon: Terminal },
                { id: 'resources', label: 'Recursos (URI)', icon: BookOpen },
                { id: 'prompts', label: 'Prompts IA', icon: Sparkles },
                { id: 'servers', label: 'Servidores Externos', icon: Layers },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ABA 1: TOOLS (FERRAMENTAS) */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna da Esquerda: Catálogo de Ferramentas */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Catálogo de Ferramentas ({toolsFiltradas.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                JSON-RPC 2.0
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaTool}
                onChange={(e) => setBuscaTool(e.target.value)}
                placeholder="Filtrar tools (pix, boleto, sicar, git...)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {toolsFiltradas.map((tool) => {
                const isSelected = tool.name === selectedToolName;
                return (
                  <button
                    key={tool.name}
                    onClick={() => handleSelectTool(tool)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition border ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-mono text-xs text-white flex items-center justify-between">
                      <span>{tool.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coluna da Direita: Playground de Execução e Resposta */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono block">Ferramenta Selecionada</span>
                  <h3 className="text-base font-bold font-mono text-cyan-400 mt-0.5">{selectedTool.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedTool.description}</p>
                </div>

                <button
                  onClick={handleRunTool}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{loading ? 'Executando...' : 'Executar Tool'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  Argumentos da Chamada (JSON Schema Validado):
                </label>
                <textarea
                  rows={6}
                  value={argumentsJson}
                  onChange={(e) => setArgumentsJson(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              {responseOutput && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Resposta JSON-RPC 2.0 (Success)
                    </span>
                    <button
                      onClick={() => copiarTexto(responseOutput)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiado ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-72">
                    {responseOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: RESOURCES (RECURSOS URI) */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="text-xs font-bold text-slate-200 uppercase font-mono">
              Recursos Disponíveis (URI)
            </span>
            {[
              { uri: 'bancofe://git/status', nome: 'Telemetria do Git & Deploy PRD' },
              { uri: 'bancofe://contracts/summary', nome: 'Resumo da Carteira de Crédito' },
              { uri: 'bancofe://system/rates', nome: 'Taxas de Juros & Indexadores' },
              { uri: 'bancofe://ledger/summary', nome: 'Balancete do Livro Razão' },
            ].map((res) => (
              <button
                key={res.uri}
                onClick={() => handleReadResource(res.uri)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                  selectedResourceUri === res.uri
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-mono text-xs text-white">{res.nome}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{res.uri}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-mono">Recurso Inspecionado:</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400">{selectedResourceUri}</h3>
              </div>
              <button
                onClick={() => handleReadResource(selectedResourceUri)}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                Ler Recurso
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-96">
              {resourceContent || 'Clique em "Ler Recurso" para carregar o payload...'}
            </pre>
          </div>
        </div>
      )}

      {/* ABA 3: PROMPTS (PROMPTS DE IA) */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="text-xs font-bold text-slate-200 uppercase font-mono">
              Prompts Estruturados
            </span>
            {[
              { id: 'parecer_credito_360', nome: 'Parecer Pericial de Crédito 360°' },
              { id: 'auditoria_git_seguranca_bacen85', nome: 'Auditoria Git & Resolução Bacen 85' },
              { id: 'financial_health_audit', nome: 'Auditoria de Saúde Financeira' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleGeneratePrompt(p.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                  selectedPromptName === p.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-mono text-xs text-white">{p.nome}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.id}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-mono">Template de Prompt:</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400">{selectedPromptName}</h3>
              </div>
              <button
                onClick={() => handleGeneratePrompt(selectedPromptName)}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                Gerar Template
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans text-xs text-slate-200 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              {promptOutput || 'Selecione um prompt para visualizar a estrutura...'}
            </pre>
          </div>
        </div>
      )}

      {/* ABA 4: SERVIDORES EXTERNOS */}
      {activeTab === 'servers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Business MCP</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CONECTADO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Notificações bancárias oficiais, alertas Pix 24/7, comprovantes em PDF e 2FA institucional.
            </p>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-950 p-2 rounded-lg">
              Latência: 18ms • Taxa de entrega: 99.98%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Claude Vertex MCP</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                CONECTADO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Análise pericial de risco de crédito, redação jurídica de CCB digital e compliance PLD/FT.
            </p>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-950 p-2 rounded-lg">
              Modelo: Claude 3.5 Sonnet • Latência: 450ms
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Anchor Browser MCP</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                CONECTADO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Navegação e extração autônoma para consultas em órgãos públicos, Bacen, B3 e cartórios.
            </p>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-950 p-2 rounded-lg">
              Stealth Proxy: Ativo • Anti-bot bypass: 100%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Prisma Postgres MCP</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                CONECTADO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Persistência corporativa de contratos, balancetes contábeis e auditoria do Livro Razão.
            </p>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-950 p-2 rounded-lg">
              Pooling ativo • Backups contínuos PITR
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Render MCP Server</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CONECTADO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gestão da infraestrutura na nuvem Render com espelhamento permanente e failover.
            </p>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-950 p-2 rounded-lg">
              Workspace sincronizado • Deploy automático
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default McpCockpit;
