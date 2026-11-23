import React from 'react';
import { GitBranch, Cpu, Sparkles, CheckCircle2, ArrowUpRight, Zap, Shield, Layers } from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  tags: string[];
  capabilities: Array<{ name: string; description: string; action: string }>;
  health?: {
    status: string;
    latencyMs: number;
    message: string;
    details?: any;
  };
}

interface IntegrationsHubProps {
  integrations: IntegrationItem[];
  onSelectAction: (adapterId: string, action: string) => void;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  integrations,
  onSelectAction,
}) => {
  const gitAbertos = integrations.filter((i) => i.category === 'GIT_OPEN_SOURCE');
  const mcps = integrations.filter((i) => i.category === 'MCP_PROTOCOL');
  const skills = integrations.filter((i) => i.category === 'SKILL_AGENT');

  return (
    <div className="space-y-8">
      {/* Banner de Apresentação */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Módulo de Integrações Unificado BancoFe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ecossistema Aberto: Git Abertos, MCPs e Skills de IA
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Plataforma bancária de alta disponibilidade com motores abertos do <strong>BACEN (Pix & Open Finance)</strong>, 
            mensageria <strong>FEBRABAN (Boletos & CNAB)</strong>, protocolo <strong>MCP (Model Context Protocol)</strong> para agentes autônomos 
            e o catálogo completo de <strong>Skills do Manus</strong>.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <GitBranch className="w-4 h-4" />
                <span>Git Abertos</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">{gitAbertos.length}</div>
              <p className="text-[11px] text-slate-400">Pix, Open Finance, Drex, Gateways</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
                <Cpu className="w-4 h-4" />
                <span>Protocolo MCP</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">10 Tools</div>
              <p className="text-[11px] text-slate-400">JSON-RPC 2.0 / WhatsApp / IA</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Skills de IA</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">{skills.length} Engines</div>
              <p className="text-[11px] text-slate-400">Finance Pro, SAC, Automação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pilar 1: Git Abertos & Padrões Financeiros */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">1. Módulos & Padrões Git Abertos</h2>
              <p className="text-xs text-slate-400">Protocolos oficiais do Sistema Financeiro Nacional e open-source fintech SDKs</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {gitAbertos.length} conectores
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gitAbertos.map((item) => (
            <IntegrationCard key={item.id} item={item} onSelectAction={onSelectAction} badgeColor="emerald" />
          ))}
        </div>
      </section>

      {/* Pilar 2: Protocolo MCP (Model Context Protocol) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. Conectores e Servidor MCP (Model Context Protocol)</h2>
              <p className="text-xs text-slate-400">Ferramentas de IA para agentes autônomos, WhatsApp Business e Claude Vertex</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            JSON-RPC 2.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mcps.map((item) => (
            <IntegrationCard key={item.id} item={item} onSelectAction={onSelectAction} badgeColor="cyan" />
          ))}
        </div>
      </section>

      {/* Pilar 3: Skills & Agentes do Manus */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3. Módulo de Skills & Agentes Especialistas</h2>
              <p className="text-xs text-slate-400">Orquestração de finanças corporativas, SAC/PRICE, auditoria e treinamento</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Agentic Core
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((item) => (
            <IntegrationCard key={item.id} item={item} onSelectAction={onSelectAction} badgeColor="amber" />
          ))}
        </div>
      </section>
    </div>
  );
};

const IntegrationCard: React.FC<{
  item: IntegrationItem;
  onSelectAction: (adapterId: string, action: string) => void;
  badgeColor: 'emerald' | 'cyan' | 'amber';
}> = ({ item, onSelectAction, badgeColor }) => {
  const isHealthy = item.health?.status === 'CONNECTED' || item.health?.status === 'READY';

  const badgeClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  }[badgeColor];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                v{item.version}
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className="font-mono text-[11px]">{item.health?.latencyMs || 5}ms</span>
              </div>
            </div>
            <h3 className="text-base font-bold text-white pt-1">{item.name}</h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Ações / Capacidades */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Capacidades Integradas ({item.capabilities.length})</span>
        </div>
        <div className="space-y-1.5">
          {item.capabilities.slice(0, 3).map((cap) => (
            <button
              key={cap.action}
              onClick={() => onSelectAction(item.id, cap.action)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-left text-xs text-slate-300 hover:text-white transition group border border-transparent hover:border-slate-700"
            >
              <span className="truncate pr-2 font-medium">{cap.name}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
