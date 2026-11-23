import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Building2,
  TreePine,
  Landmark,
  FileText,
  Car,
  Briefcase,
  Scale,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Sparkles,
  Info,
  RefreshCw,
  Award,
} from 'lucide-react';

interface PerfilDemo {
  tipo: 'PF' | 'PJ';
  documento: string;
  nome: string;
  categoria: string;
  score: number;
  rating: string;
  sicar: {
    car: string;
    reservaLegalPct: number;
    appPreservada: boolean;
    embargoIbama: boolean;
    moratoriaSoja: boolean;
    listaSujaTrabalhoEscravo: boolean;
    statusEsg: 'CONFORME' | 'REGULAR_COM_RESSALVAS' | 'BLOQUEADO';
  };
  scr: {
    ratingCMN: string;
    exposicaoSFN: number;
    aVencer: number;
    vencidoAte90d: number;
    prejuizo: number;
    chavesPixDict: number;
  };
  onr: {
    matriculasQtd: number;
    valorVenalTotal: number;
    protestosQtd: number;
    valorProtestado: number;
    ltvDisponivelPct: number;
  };
  mesa: {
    limiteRecomendado: number;
    probabilidadeDefault: number;
    decisao: 'APROVADO' | 'APROVADO_COM_RESSALVA' | 'REPROVADO';
    justificativa: string;
  };
}

const PERFIS_DEMO: PerfilDemo[] = [
  {
    tipo: 'PJ',
    documento: '04.596.128/0001-44',
    nome: 'UISA - Usinas Itamarati S/A (Nova Olímpia & Tangará da Serra)',
    categoria: 'Sucroalcooleiro & Bioenergia',
    score: 920,
    rating: 'AAA',
    sicar: {
      car: 'MT-5107925-8B90.7F12.91C4',
      reservaLegalPct: 37.4,
      appPreservada: true,
      embargoIbama: false,
      moratoriaSoja: true,
      listaSujaTrabalhoEscravo: false,
      statusEsg: 'CONFORME',
    },
    scr: {
      ratingCMN: 'AA',
      exposicaoSFN: 185000000,
      aVencer: 185000000,
      vencidoAte90d: 0,
      prejuizo: 0,
      chavesPixDict: 12,
    },
    onr: {
      matriculasQtd: 18,
      valorVenalTotal: 420000000,
      protestosQtd: 0,
      valorProtestado: 0,
      ltvDisponivelPct: 55.0,
    },
    mesa: {
      limiteRecomendado: 85000000,
      probabilidadeDefault: 0.85,
      decisao: 'APROVADO',
      justificativa: 'Excelente rating creditício, patrimônio imobiliário de altíssima liquidez e plena conformidade ambiental SICAR/Cerrado.',
    },
  },
  {
    tipo: 'PF',
    documento: '512.984.101-53',
    nome: 'Dr. Valdomiro Parecis de Andrade',
    categoria: 'Produtor Rural de Soja & Milho (Tangará da Serra)',
    score: 865,
    rating: 'AA',
    sicar: {
      car: 'MT-5107909-1A45.4C88.22E1',
      reservaLegalPct: 35.8,
      appPreservada: true,
      embargoIbama: false,
      moratoriaSoja: true,
      listaSujaTrabalhoEscravo: false,
      statusEsg: 'CONFORME',
    },
    scr: {
      ratingCMN: 'A',
      exposicaoSFN: 14200000,
      aVencer: 14200000,
      vencidoAte90d: 0,
      prejuizo: 0,
      chavesPixDict: 4,
    },
    onr: {
      matriculasQtd: 4,
      valorVenalTotal: 38500000,
      protestosQtd: 0,
      valorProtestado: 0,
      ltvDisponivelPct: 60.0,
    },
    mesa: {
      limiteRecomendado: 12000000,
      probabilidadeDefault: 1.42,
      decisao: 'APROVADO',
      justificativa: 'Elegível a CPR Financeira e Agro Custeio com penhor de safra garantido e CAR aprovado na SEMA-MT.',
    },
  },
  {
    tipo: 'PJ',
    documento: '14.892.341/0001-09',
    nome: 'Agropecuária & Madeiras Rio Verde Ltda',
    categoria: 'Pecuária de Corte & Silvicultura',
    score: 410,
    rating: 'C',
    sicar: {
      car: 'MT-5107909-99E8.33B1.77A9',
      reservaLegalPct: 22.4, // Abaixo do mínimo de 35% no Cerrado
      appPreservada: false,
      embargoIbama: true,
      moratoriaSoja: false,
      listaSujaTrabalhoEscravo: false,
      statusEsg: 'BLOQUEADO',
    },
    scr: {
      ratingCMN: 'E',
      exposicaoSFN: 4800000,
      aVencer: 3100000,
      vencidoAte90d: 1700000,
      prejuizo: 450000,
      chavesPixDict: 2,
    },
    onr: {
      matriculasQtd: 2,
      valorVenalTotal: 7200000,
      protestosQtd: 5,
      valorProtestado: 384000,
      ltvDisponivelPct: 0,
    },
    mesa: {
      limiteRecomendado: 0,
      probabilidadeDefault: 19.8,
      decisao: 'REPROVADO',
      justificativa: 'Veto pericial: Embargo ativo no IBAMA, déficit de Reserva Legal no Cerrado e apontamentos restritivos no SCR Bacen.',
    },
  },
];

export const Consulta360Terminal: React.FC = () => {
  const [docInput, setDocInput] = useState(PERFIS_DEMO[0].documento);
  const [activeTabSub, setActiveTabSub] = useState<'geral' | 'sicar' | 'scr' | 'onr' | 'mesa'>('geral');
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilDemo>(PERFIS_DEMO[0]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const match = PERFIS_DEMO.find((p) => p.documento.replace(/\D/g, '') === docInput.replace(/\D/g, ''));
      if (match) {
        setPerfilSelecionado(match);
      } else {
        // Criar perfil dinâmico a partir do documento informado
        const isCnpj = docInput.replace(/\D/g, '').length > 11;
        setPerfilSelecionado({
          tipo: isCnpj ? 'PJ' : 'PF',
          documento: docInput,
          nome: isCnpj ? 'Empresa Consulta Dinâmica S.A.' : 'Cidadão Consulta Dinâmica',
          categoria: isCnpj ? 'Agronegócio & Comércio Regional' : 'Profissional Autônomo',
          score: 780,
          rating: 'A',
          sicar: {
            car: 'MT-5107909-DINAMICO.CAR',
            reservaLegalPct: 35.2,
            appPreservada: true,
            embargoIbama: false,
            moratoriaSoja: true,
            listaSujaTrabalhoEscravo: false,
            statusEsg: 'CONFORME',
          },
          scr: {
            ratingCMN: 'B',
            exposicaoSFN: 1250000,
            aVencer: 1250000,
            vencidoAte90d: 0,
            prejuizo: 0,
            chavesPixDict: 3,
          },
          onr: {
            matriculasQtd: 2,
            valorVenalTotal: 3400000,
            protestosQtd: 0,
            valorProtestado: 0,
            ltvDisponivelPct: 58.0,
          },
          mesa: {
            limiteRecomendado: 1800000,
            probabilidadeDefault: 2.8,
            decisao: 'APROVADO',
            justificativa: 'Dossiê cadastral íntegro, garantias imobiliárias livres e situação regularizada no SICAR e Bacen.',
          },
        });
      }
      setLoading(false);
    }, 400);
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 600) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 450) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header do Módulo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> DOSSIÊ 360 INVESTIGATIVO
              </span>
              <span className="text-xs text-slate-400 font-mono">Casanova × BancoFé Core</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Consulta Pericial 360° CPF & CNPJ
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Auditoria patrimonial completa: Compliance Ambiental SICAR/ESG (Reserva Legal 35% no Cerrado),
              SCR Bacen Registrato, Protestos CENPROT, Matrículas ONR e Mesa Algorítmica de Risco.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/api/v1/compliance/sicar/resumo', '_blank')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> API JSON
            </button>
            <button
              onClick={() => alert(`Certidão pericial do dossiê ${perfilSelecionado.documento} baixada com sucesso!`)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Exportar Laudo PDF
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa e Seletores Rápidos */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docInput}
                onChange={(e) => setDocInput(e.target.value)}
                placeholder="Informe o CPF ou CNPJ para consulta pericial..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Consultar 360°
            </button>
          </div>

          {/* Demos pré-configurados */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-slate-400 font-medium">Perfis de Teste Homologados:</span>
            {PERFIS_DEMO.map((p) => (
              <button
                key={p.documento}
                onClick={() => {
                  setDocInput(p.documento);
                  setPerfilSelecionado(p);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
                  perfilSelecionado.documento === p.documento
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {p.tipo === 'PJ' ? '🏢' : '👤'} {p.nome.split('-')[0].trim()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartão do Perfil e Score Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Card do Score BancoFé */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Score Pericial</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-white font-mono tracking-tight">
                {perfilSelecionado.score}
              </span>
              <span className="text-xs text-slate-400">/ 1000</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  perfilSelecionado.score >= 800
                    ? 'bg-emerald-400'
                    : perfilSelecionado.score >= 600
                    ? 'bg-cyan-400'
                    : perfilSelecionado.score >= 450
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${(perfilSelecionado.score / 1000) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Rating Geral:</span>
            <span className={`px-2 py-0.5 rounded font-mono font-bold border ${getScoreColor(perfilSelecionado.score)}`}>
              {perfilSelecionado.rating}
            </span>
          </div>
        </div>

        {/* Card de Identificação */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-bold">
                {perfilSelecionado.tipo}
              </span>
              <span className="text-xs text-slate-400 font-mono">{perfilSelecionado.documento}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1.5 line-clamp-1">{perfilSelecionado.nome}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{perfilSelecionado.categoria}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Status ESG</span>
              <span
                className={`font-semibold ${
                  perfilSelecionado.sicar.statusEsg === 'CONFORME'
                    ? 'text-emerald-400'
                    : perfilSelecionado.sicar.statusEsg === 'BLOQUEADO'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {perfilSelecionado.sicar.statusEsg}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Exposição SCR</span>
              <span className="font-semibold text-slate-200 font-mono">
                R$ {(perfilSelecionado.scr.exposicaoSFN / 1000000).toFixed(1)}M
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Decisão Mesa</span>
              <span
                className={`font-bold ${
                  perfilSelecionado.mesa.decisao === 'APROVADO' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {perfilSelecionado.mesa.decisao}
              </span>
            </div>
          </div>
        </div>

        {/* Card Decisão de Crédito Instantânea */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Limite Sugerido</span>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              {perfilSelecionado.mesa.limiteRecomendado > 0
                ? `R$ ${(perfilSelecionado.mesa.limiteRecomendado / 1000000).toFixed(2)}M`
                : 'R$ 0,00'}
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{perfilSelecionado.mesa.justificativa}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Prob. Inadimplência:</span>
            <span className="font-mono font-bold text-slate-200">
              {perfilSelecionado.mesa.probabilidadeDefault}%
            </span>
          </div>
        </div>
      </div>

      {/* Navegação Secundária das Abas Analíticas */}
      <div className="flex space-x-1 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTabSub('geral')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabSub === 'geral'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Visão Geral & Cadastro
        </button>
        <button
          onClick={() => setActiveTabSub('sicar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabSub === 'sicar'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TreePine className="w-4 h-4" /> Compliance Ambiental & SICAR ESG
        </button>
        <button
          onClick={() => setActiveTabSub('scr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabSub === 'scr'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" /> SCR Bacen Registrato
        </button>
        <button
          onClick={() => setActiveTabSub('onr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabSub === 'onr'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Cartórios CENPROT & Matrículas ONR
        </button>
        <button
          onClick={() => setActiveTabSub('mesa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTabSub === 'mesa'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Mesa de Crédito Algorítmica
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTabSub === 'sicar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-400" /> Auditoria Ambiental SICAR & Moratórias
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Conformidade com Código Florestal Brasileiro (Lei 12.651/2012) - Exigência de 35% de Reserva Legal no Cerrado Mato-Grossense.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                perfilSelecionado.sicar.statusEsg === 'CONFORME'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {perfilSelecionado.sicar.statusEsg}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Número do CAR</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1 block truncate">
                {perfilSelecionado.sicar.car}
              </span>
              <span className="text-[11px] text-emerald-400 mt-2 block">✓ Base SEMA-MT Ativa</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Reserva Legal no Cerrado</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-white font-mono">
                  {perfilSelecionado.sicar.reservaLegalPct}%
                </span>
                <span className="text-xs text-slate-500">(Mínimo 35%)</span>
              </div>
              <span
                className={`text-[11px] mt-2 block font-semibold ${
                  perfilSelecionado.sicar.reservaLegalPct >= 35 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {perfilSelecionado.sicar.reservaLegalPct >= 35 ? '✓ Conforme Código Florestal' : '✗ Déficit de Cobertura'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Embargo IBAMA / SEMA</span>
              <div className="flex items-center gap-2 mt-2">
                {perfilSelecionado.sicar.embargoIbama ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-bold text-rose-400">Embargo Ativo</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Sem Embargos</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">Base Integrada IBAMA 2026</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Moratória da Soja & Carne</span>
              <div className="flex items-center gap-2 mt-2">
                {perfilSelecionado.sicar.moratoriaSoja ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Certificado Habilitado</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">Rastreabilidade Pendente</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">ABIOVE / Rastreio Grãos</span>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'scr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" /> SCR Bacen / Registrato Analítico
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Classificação de risco conforme Resolução CMN 2.682/1999 e faixas de maturidade de dívidas no SFN.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rating CMN:</span>
              <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm">
                {perfilSelecionado.scr.ratingCMN}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Exposição Total no SFN</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                R$ {(perfilSelecionado.scr.exposicaoSFN).toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">Contratos ativos em bancos</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Operações a Vencer (Normal)</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                R$ {(perfilSelecionado.scr.aVencer).toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-emerald-400 mt-2 block">100% Adimplente</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Atrasos & Prejuízo</span>
              <span
                className={`text-2xl font-black font-mono mt-1 block ${
                  perfilSelecionado.scr.prejuizo > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                R$ {(perfilSelecionado.scr.prejuizo).toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">
                {perfilSelecionado.scr.prejuizo > 0 ? 'Operação em perda no SFN' : 'Zero apontamentos de perda'}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'onr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> Cartórios CENPROT & Matrículas ONR
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Central de Protestos de Títulos e Registro Imobiliário Eletrônico para enquadramento em Home Equity e CPR.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              LTV Disponível: {perfilSelecionado.onr.ltvDisponivelPct}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Matrículas Registradas</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {perfilSelecionado.onr.matriculasQtd} Imóveis
              </span>
              <span className="text-[11px] text-emerald-400 mt-2 block">Ônus Averiguados</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Valor Venal Total</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                R$ {(perfilSelecionado.onr.valorVenalTotal / 1000000).toFixed(1)}M
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">Avaliação Georreferenciada</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Protestos CENPROT</span>
              <span
                className={`text-2xl font-black font-mono mt-1 block ${
                  perfilSelecionado.onr.protestosQtd > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {perfilSelecionado.onr.protestosQtd} Apontamentos
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">
                {perfilSelecionado.onr.protestosQtd > 0
                  ? `R$ ${perfilSelecionado.onr.valorProtestado.toLocaleString('pt-BR')}`
                  : 'Certidão Negativa 100%'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Elegibilidade Home Equity</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {perfilSelecionado.onr.ltvDisponivelPct > 0 ? 'Elegível' : 'Bloqueado'}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">Margem até 60% do valor</span>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === 'mesa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Parecer Pericial da Mesa de Crédito Algorítmica
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Motor decisório que pondera histórico comportamental, garantias reais e risco de crédito institucional.
              </p>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono border ${
                perfilSelecionado.mesa.decisao === 'APROVADO'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {perfilSelecionado.mesa.decisao}
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h5 className="text-sm font-bold text-white">Justificativa Técnica do Algoritmo</h5>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pl-8">
              {perfilSelecionado.mesa.justificativa}
            </p>
          </div>
        </div>
      )}

      {activeTabSub === 'geral' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" /> Cadastro & Receita Federal
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Situação cadastral ativa, CNAE principal e quadro societário (QSA).
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              ✓ ATIVA E REGULAR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Razão Social / Nome</span>
              <span className="text-sm font-bold text-white mt-1 block truncate">
                {perfilSelecionado.nome}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block font-mono">
                Doc: {perfilSelecionado.documento}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Segmentação Regional</span>
              <span className="text-sm font-bold text-cyan-400 mt-1 block truncate">
                {perfilSelecionado.categoria}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">Polo Tangará da Serra & MT</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Chaves PIX DICT Ativas</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {perfilSelecionado.scr.chavesPixDict} Chaves
              </span>
              <span className="text-[11px] text-emerald-400 mt-2 block">Validadas no Banco Central</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Consulta360Terminal;
