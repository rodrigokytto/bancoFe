import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { IntegrationsHub } from './components/IntegrationsHub';
import { PixTerminal } from './components/PixTerminal';
import { BoletoTerminal } from './components/BoletoTerminal';
import { OpenFinanceTerminal } from './components/OpenFinanceTerminal';
import { GatewaysTerminal } from './components/GatewaysTerminal';
import { AgroFinanceTerminal } from './components/AgroFinanceTerminal';
import { Web3DrexTerminal } from './components/Web3DrexTerminal';
import { BureauTerminal } from './components/BureauTerminal';
import { McpCockpit } from './components/McpCockpit';
import { SkillRunner } from './components/SkillRunner';
import { LedgerExplorer } from './components/LedgerExplorer';
import { Consulta360Terminal } from './components/Consulta360Terminal';
import { PreCadastroProdutosTerminal } from './components/PreCadastroProdutosTerminal';
import { RadarProspeccaoTerminal } from './components/RadarProspeccaoTerminal';
import { AdminModulosTerminal } from './components/AdminModulosTerminal';
import { PortalClienteTerminal } from './components/PortalClienteTerminal';
import { GestaoEmprestimosAdminTerminal } from './components/GestaoEmprestimosAdminTerminal';
import { GitDevOpsTerminal } from './components/GitDevOpsTerminal';
import { IntegrationRegistry } from '../integrations/registry';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [loading, setLoading] = useState(false);
  const [integrationsList, setIntegrationsList] = useState<any[]>([]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setIntegrationsList(data.integrations || []);
      } else {
        const registry = IntegrationRegistry.getInstance();
        const adapters = registry.listAdapters();
        const checks = await registry.runHealthChecks();
        const formatted = adapters.map((a) => ({
          id: a.id,
          name: a.name,
          version: a.version,
          category: a.category,
          description: a.description,
          tags: a.tags,
          capabilities: a.capabilities,
          health: checks[a.id] || { status: 'CONNECTED', latencyMs: 4, message: 'Operacional' },
        }));
        setIntegrationsList(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleSelectAction = (adapterId: string, _action: string) => {
    if (adapterId.includes('pix')) {
      setActiveTab('pix');
    } else if (adapterId.includes('boleto')) {
      setActiveTab('boletos');
    } else if (adapterId.includes('open-finance')) {
      setActiveTab('open-finance');
    } else if (adapterId.includes('gateway')) {
      setActiveTab('gateways');
    } else if (adapterId.includes('agro')) {
      setActiveTab('agro');
    } else if (adapterId.includes('drex')) {
      setActiveTab('drex');
    } else if (adapterId.includes('bureau')) {
      setActiveTab('bureau');
    } else if (adapterId.includes('mcp')) {
      setActiveTab('mcp');
    } else if (adapterId.includes('skill')) {
      setActiveTab('skills');
    } else {
      setActiveTab('cockpit');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={loadIntegrations}
        loading={loading}
        totalAdapters={integrationsList.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cockpit' && (
          <IntegrationsHub
            integrations={integrationsList}
            onSelectAction={handleSelectAction}
          />
        )}

        {activeTab === 'portal-cliente' && <PortalClienteTerminal />}

        {activeTab === 'gestao-emprestimos' && <GestaoEmprestimosAdminTerminal />}

        {activeTab === 'consulta360' && <Consulta360Terminal />}

        {activeTab === 'precadastro' && <PreCadastroProdutosTerminal />}

        {activeTab === 'radar' && <RadarProspeccaoTerminal />}

        {activeTab === 'pix' && <PixTerminal />}

        {activeTab === 'boletos' && <BoletoTerminal />}

        {activeTab === 'open-finance' && <OpenFinanceTerminal />}

        {activeTab === 'gateways' && <GatewaysTerminal />}

        {activeTab === 'agro' && <AgroFinanceTerminal />}

        {activeTab === 'drex' && <Web3DrexTerminal />}

        {activeTab === 'bureau' && <BureauTerminal />}

        {activeTab === 'admin-modulos' && <AdminModulosTerminal />}

        {activeTab === 'git-devops' && <GitDevOpsTerminal />}

        {activeTab === 'mcp' && <McpCockpit />}

        {activeTab === 'skills' && <SkillRunner />}

        {activeTab === 'ledger' && <LedgerExplorer />}
      </main>

      {/* Rodapé com conformidade BACEN e Git info */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">BancoFe S.A.</span>
            <span>•</span>
            <span>Instituição de Pagamento & Financiamento Rural</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">ISPB 799</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
              Ambiente PRD
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <a
              href="https://github.com/rodrigokytto/bancoFe"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              github.com/rodrigokytto/bancoFe
            </a>
            <span>•</span>
            <span className="text-slate-400">SPI / CIP / FAPI / MCP / Drex</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
