import React, { useState } from "react";
import {
  GitBranch,
  GitCommit,
  Terminal,
  Bot,
  Copy,
  Check,
  RefreshCw,
  Play,
  HardDrive,
  ShieldCheck,
  Code2,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Save,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";

export const GitMcpServerHub: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>("zuma_get_live_kpi");
  const [toolArgsText, setToolArgsText] = useState<string>('{"horizonte": "mes"}');
  const [mcpOutput, setMcpOutput] = useState<string | null>(null);
  const [isCallingMcp, setIsCallingMcp] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);

  const gitQuery = trpc.zuma.getGitDevopsData.useQuery(undefined, {
    refetchInterval: 8000,
  });

  const mcpQuery = trpc.zuma.getZumaMcpManifest.useQuery(undefined, {
    refetchInterval: 8000,
  });

  const callToolMutation = trpc.zuma.executeZumaMcpTool.useMutation({
    onSuccess: (data) => {
      setMcpOutput(JSON.stringify(data, null, 2));
      toast.success(`Ferramenta MCP '${data.metadata?.toolName || selectedTool}' executada com sucesso!`, {
        description: `Tempo de resposta: ${data.metadata?.durationMs || 12}ms`
      });
      setIsCallingMcp(false);
      mcpQuery.refetch();
    },
    onError: (err) => {
      setMcpOutput(JSON.stringify({ error: err.message, isError: true }, null, 2));
      toast.error(`Falha ao executar ferramenta MCP: ${err.message}`);
      setIsCallingMcp(false);
    }
  });

  const snapshotMutation = trpc.zuma.triggerGitSnapshot.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsCreatingSnapshot(false);
      gitQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao criar snapshot: ${err.message}`);
      setIsCreatingSnapshot(false);
    }
  });

  const gitData = gitQuery.data;
  const mcpData = mcpQuery.data;

  const handleExecuteTool = () => {
    let parsedArgs = {};
    try {
      if (toolArgsText.trim()) {
        parsedArgs = JSON.parse(toolArgsText);
      }
    } catch (e) {
      toast.error("Argumentos JSON inválidos. Corrija o formato antes de executar.");
      return;
    }

    setIsCallingMcp(true);
    callToolMutation.mutate({
      toolName: selectedTool,
      args: parsedArgs,
      callerAgent: "Zuma Pilot Console Web"
    });
  };

  const handleCreateSnapshot = () => {
    setIsCreatingSnapshot(true);
    snapshotMutation.mutate({ operator: "Rodrigo (Dono)" });
  };

  const mcpClaudeConfigJson = JSON.stringify(
    {
      mcpServers: {
        zuma_restaurant: {
          url: "https://zuma.kytto.com.br/api/mcp",
          headers: {
            "Authorization": "Bearer zuma_mcp_live_token_2026_tga"
          }
        }
      }
    },
    null,
    2
  );

  const handleCopyClaudeConfig = () => {
    navigator.clipboard.writeText(mcpClaudeConfigJson);
    setCopiedConfig(true);
    toast.success("Configuração MCP copiada para a área de transferência!");
    setTimeout(() => setCopiedConfig(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER EXECUTIVO */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-white/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Git DevOps & Zuma Model Context Protocol (MCP) Server
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Protocolo MCP v2024-11-05 Ativo
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Servidor oficial MCP para que agentes de IA (Manus, Claude, ChatGPT, Cursor) possam consultar e interagir com o Zuma em tempo real via SSE/REST.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gitQuery.refetch();
                mcpQuery.refetch();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gitQuery.isFetching ? "animate-spin" : ""}`} />
              Recarregar
            </button>
            <button
              onClick={handleCreateSnapshot}
              disabled={isCreatingSnapshot}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
            >
              <Save className="w-3.5 h-3.5" />
              Criar Snapshot Git
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              Repositório Git
            </div>
            <div className="text-sm font-bold text-white truncate">rodrigokytto/zuma</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">main • GCP Cloud Run PRD</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              Ferramentas MCP Ativas
            </div>
            <div className="text-lg font-bold text-white">{mcpData?.toolsCount || 6} Tools</div>
            <div className="text-[11px] text-blue-400 mt-0.5">SSE & REST Endpoints</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Cardápio-as-Code
            </div>
            <div className="text-lg font-bold text-white">{gitData?.cardapioAsCode.version || "v2.8.4"}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">{gitData?.cardapioAsCode.totalSkus || 211} SKUs Versionados</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Snapshots de Banco
            </div>
            <div className="text-lg font-bold text-white">{gitData?.backups.totalSnapshots || 2} Arquivos</div>
            <div className="text-[11px] text-amber-400 mt-0.5">Checksum SHA-256</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Agentes Conectados
            </div>
            <div className="text-lg font-bold text-cyan-300">Manus, Claude & Zumi</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Latência Média 11ms</div>
          </div>
        </div>
      </div>

      {/* GRADE EM 2 COLUNAS: TERMINAL MCP E CONFIGURAÇÃO DE AGENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: CONSOLE DE TESTES DO PROTOCOLO MCP */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Terminal de Teste Interativo MCP</h3>
                  <p className="text-xs text-slate-400">Invoque as ferramentas do restaurante como um agente autônomo</p>
                </div>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                /api/mcp/tools/call
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Selecione a Ferramenta MCP (Tool):
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => {
                    const tool = e.target.value;
                    setSelectedTool(tool);
                    if (tool === "zuma_get_live_kpi") setToolArgsText('{"horizonte": "mes"}');
                    else if (tool === "zuma_list_tables") setToolArgsText('{"setor": "todos"}');
                    else if (tool === "zuma_get_salmon_stock") setToolArgsText('{}');
                    else if (tool === "zuma_query_kds") setToolArgsText('{"station": "todas"}');
                    else if (tool === "zuma_dispatch_campaign") setToolArgsText('{"campaignName": "Hot Roll Dobro", "targetAudience": "delivery_quarta", "promoText": "Cupom HOT2X ativo hoje!"}');
                    else if (tool === "zuma_sefaz_audit") setToolArgsText('{}');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                >
                  {mcpData?.tools.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {t.description.slice(0, 75)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Argumentos JSON (Payload da Tool):
                </label>
                <textarea
                  value={toolArgsText}
                  onChange={(e) => setToolArgsText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="{}"
                />
              </div>

              <button
                onClick={handleExecuteTool}
                disabled={isCallingMcp}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Invocar Ferramenta MCP (Call Tool)
              </button>

              {mcpOutput && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-purple-400">Retorno Oficial do Protocolo MCP:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mcpOutput);
                        toast.success("JSON MCP copiado!");
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-purple-900/50 rounded-xl p-4 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-72">
                    {mcpOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* HISTÓRICO DE CHAMADAS MCP RECENTES */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              Chamadas de Agentes de IA Recentes
            </h3>
            <div className="space-y-2">
              {mcpData?.recentCalls.map((c) => (
                <div key={c.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-medium text-purple-300">{c.toolName}</div>
                    <div className="text-slate-500 text-[11px]">Agente: {c.callerAgent} • {c.durationMs}ms</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: CONFIGURAÇÃO PARA AGENTES EXTERNOS & SNAPSHOTS GIT */}
        <div className="space-y-6">
          {/* CONFIGURAÇÃO CLAUDE DESKTOP / CURSOR / MANUS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Plugar em Agentes de IA Externos</h3>
                  <p className="text-xs text-slate-400">Configuração pronta para Claude Desktop, Cursor e Manus</p>
                </div>
              </div>
              <button
                onClick={handleCopyClaudeConfig}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedConfig ? "Copiado!" : "Copiar Config"}
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto">
              <pre>{mcpClaudeConfigJson}</pre>
            </div>

            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Cole no seu arquivo <code className="text-purple-300">claude_desktop_config.json</code> para que o Claude controle o Zuma remotamente.
            </p>
          </div>

          {/* HISTÓRICO DE SNAPSHOTS CRIPTOGRÁFICOS GIT */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <GitCommit className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Snapshots Git de Banco de Dados</h3>
                  <p className="text-xs text-slate-400">Backups imutáveis com assinatura SHA-256</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Imutável
              </span>
            </div>

            <div className="space-y-3">
              {gitData?.backups.snapshots.map((snap) => (
                <div key={snap.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-white">{snap.id}</span>
                    <span className="text-[11px] text-slate-500">{new Date(snap.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Operador: <span className="text-slate-300 font-medium">{snap.operator}</span> • {snap.recordCount} registros • {snap.sizeKb} KB
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono bg-slate-900 p-1.5 rounded truncate">
                    SHA-256: {snap.sha256}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
