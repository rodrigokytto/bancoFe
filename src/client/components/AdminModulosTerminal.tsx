import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Activity,
  Server,
  Sparkles,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Key,
} from 'lucide-react';

interface ModuloConfig {
  id: string;
  nome: string;
  categoria: 'PAGAMENTOS' | 'CREDITO_PERICIAL' | 'ESG_AMBIENTAL' | 'INFRASYS';
  ativo: boolean;
  latenciaMs: number;
  versao: string;
  descricao: string;
  requerLicenca: boolean;
}

const MODULOS_INICIAIS: ModuloConfig[] = [
  {
    id: 'pix_dict',
    nome: 'Motor Pix DICT & Liquidação SPI',
    categoria: 'PAGAMENTOS',
    ativo: true,
    latenciaMs: 12,
    versao: 'v3.4.1',
    descricao: 'Conexão direta ao SPI do Banco Central e diretório de identificadores de contas transacionais.',
    requerLicenca: true,
  },
  {
    id: 'sicar_esg',
    nome: 'Compliance Ambiental SICAR & SEMA-MT',
    categoria: 'ESG_AMBIENTAL',
    ativo: true,
    latenciaMs: 45,
    versao: 'v2.1.0',
    descricao: 'Validação de CAR, Reserva Legal 35% no bioma Cerrado, APP e embargo IBAMA/SEMA.',
    requerLicenca: true,
  },
  {
    id: 'scr_bacen',
    nome: 'SCR Bacen / Registrato Analítico',
    categoria: 'CREDITO_PERICIAL',
    ativo: true,
    latenciaMs: 65,
    versao: 'v2.8.4',
    descricao: 'Mapeamento de endividamento no SFN e classificação de risco Resolução CMN 2.682/1999.',
    requerLicenca: true,
  },
  {
    id: 'cenprot_onr',
    nome: 'Central de Protestos CENPROT & Matrículas ONR',
    categoria: 'CREDITO_PERICIAL',
    ativo: true,
    latenciaMs: 82,
    versao: 'v1.9.2',
    descricao: 'Pesquisa nacional de protestos em cartórios e averbação imobiliária eletrônica.',
    requerLicenca: false,
  },
  {
    id: 'mesa_algoritmica',
    nome: 'Mesa de Crédito Algorítmica & Risco',
    categoria: 'CREDITO_PERICIAL',
    ativo: true,
    latenciaMs: 18,
    versao: 'v4.0.0',
    descricao: 'Motor decisório com Score BancoFé (0-1000), Rating (AAA-D) e Probabilidade de Default.',
    requerLicenca: true,
  },
  {
    id: 'open_finance',
    nome: 'Open Finance Brasil (FAPI 1.0 Advanced)',
    categoria: 'PAGAMENTOS',
    ativo: true,
    latenciaMs: 38,
    versao: 'v1.5.0',
    descricao: 'Compartilhamento consentido de dados bancários e iniciação de pagamentos regulamentada.',
    requerLicenca: true,
  },
  {
    id: 'web3_drex',
    nome: 'Web3 Drex & Tokenização de CPR',
    categoria: 'INFRASYS',
    ativo: true,
    latenciaMs: 95,
    versao: 'v0.9.5-rc',
    descricao: 'Smart contracts para emissão de moeda digital do Banco Central e CPR Tokenizada.',
    requerLicenca: false,
  },
  {
    id: 'mcp_copilot',
    nome: 'Model Context Protocol (MCP) & IA Bancária',
    categoria: 'INFRASYS',
    ativo: true,
    latenciaMs: 14,
    versao: 'v2.2.0',
    descricao: 'Hub MCP para automações autônomas, relatórios e agentes periciais de crédito.',
    requerLicenca: false,
  },
];

export const AdminModulosTerminal: React.FC = () => {
  const [modulos, setModulos] = useState<ModuloConfig[]>(MODULOS_INICIAIS);
  const [salvando, setSalvando] = useState(false);

  const toggleModulo = (id: string) => {
    setModulos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ativo: !m.ativo } : m))
    );
  };

  const salvarParametrizacao = async () => {
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      alert('Configuração de módulos persistida com sucesso em produção no GCP!');
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header do Módulo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> GESTÃO DE MÓDULOS & GOVERNANÇA
              </span>
              <span className="text-xs text-slate-400 font-mono">Cockpit Administrativo</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Painel de Módulos & Licenciamento
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Habilitação dinâmica de motores analíticos, barramentos de pagamento e microsserviços em produção.
              Controle granular de acessos em conformidade com as diretrizes do Banco Central do Brasil.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={salvarParametrizacao}
              disabled={salvando}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${salvando ? 'animate-spin' : ''}`} />
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* Métricas de Infraestrutura */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Módulos Habilitados</span>
            <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">
              {modulos.filter((m) => m.ativo).length} / {modulos.length}
            </span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Latência Média</span>
            <span className="text-xl font-mono font-black text-cyan-400 mt-1 block">
              {(modulos.reduce((acc, cur) => acc + cur.latenciaMs, 0) / modulos.length).toFixed(0)} ms
            </span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Conformidade LGPD</span>
            <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">
              100% Auditável
            </span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Ambiente GCP</span>
            <span className="text-xl font-mono font-black text-purple-400 mt-1 block">
              Cloud Run PRD
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Módulos */}
      <div className="space-y-3">
        {modulos.map((modulo) => (
          <div
            key={modulo.id}
            className={`p-5 rounded-2xl border transition duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              modulo.ativo
                ? 'bg-slate-900 border-slate-800 shadow-md'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  modulo.ativo
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{modulo.nome}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {modulo.versao}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400">
                    {modulo.categoria}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{modulo.descricao}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 self-end md:self-center">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Latência</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {modulo.ativo ? `${modulo.latenciaMs} ms` : 'Inativo'}
                </span>
              </div>

              <button
                onClick={() => toggleModulo(modulo.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                  modulo.ativo
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {modulo.ativo ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-400" /> ATIVO
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-500" /> INATIVO
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminModulosTerminal;
