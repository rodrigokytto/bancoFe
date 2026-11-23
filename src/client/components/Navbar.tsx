import React from 'react';
import {
  Landmark,
  ShieldCheck,
  Activity,
  Cpu,
  Sparkles,
  RefreshCw,
  Share2,
  CreditCard,
  Sprout,
  Coins,
  UserCheck,
  Search,
  Calculator,
  Target,
  Settings,
  Users,
  Banknote,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  loading: boolean;
  totalAdapters: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  loading,
  totalAdapters,
}) => {
  const tabs = [
    { id: 'cockpit', label: 'Hub Geral', icon: Activity },
    { id: 'portal-cliente', label: 'Portal do Cliente', icon: Users, highlight: true },
    { id: 'gestao-emprestimos', label: 'Gestão Empréstimos', icon: Banknote, highlight: true },
    { id: 'consulta360', label: 'Consulta 360° CPF/CNPJ', icon: Search, highlight: true },
    { id: 'precadastro', label: 'Pré-Cadastro 10x', icon: Calculator, highlight: true },
    { id: 'radar', label: 'Radar MT & Empresas', icon: Target, highlight: true },
    { id: 'pix', label: 'Pix & DICT', icon: Sparkles },
    { id: 'boletos', label: 'Boletos/CNAB', icon: Landmark },
    { id: 'open-finance', label: 'Open Finance', icon: Share2 },
    { id: 'gateways', label: 'Gateways Hub', icon: CreditCard },
    { id: 'agro', label: 'Agro CPR', icon: Sprout },
    { id: 'drex', label: 'Web3 Drex', icon: Coins },
    { id: 'bureau', label: 'Bureau Crédito', icon: UserCheck },
    { id: 'admin-modulos', label: 'Gestão de Módulos', icon: Settings },
    { id: 'mcp', label: 'MCP Protocol', icon: Cpu },
    { id: 'skills', label: 'Skills de IA', icon: ShieldCheck },
    { id: 'ledger', label: 'Livro Razão', icon: Landmark },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Identidade */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('cockpit')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Landmark className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Banco<span className="text-emerald-400">Fe</span></span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  ISPB 799
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  PRD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Core Bancário & Módulo Unificado de Integrações</p>
            </div>
          </div>

          {/* Status e Ações */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-mono">
                {totalAdapters > 0 ? `${totalAdapters} Módulos Ativos` : 'Conectando...'}
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Recarregar status dos adaptadores"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Barra de Navegação Horizontal */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : (tab as any).highlight
                    ? 'bg-slate-800/80 text-emerald-300 border border-emerald-500/30 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
