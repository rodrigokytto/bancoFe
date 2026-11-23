import React, { useState } from 'react';
import {
  Target,
  Building2,
  Users,
  Search,
  ArrowUpDown,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldCheck,
  Award,
  Filter,
} from 'lucide-react';

interface ProspectEmpresa {
  id: string;
  nome: string;
  segmento: 'AGRO' | 'USINAS_INDUSTRIA' | 'PME_COMERCIO' | 'SERVIDORES' | 'APOSENTADOS' | 'ALTA_RENDA';
  cidade: string;
  faturamentoOuRendaEst: number;
  scorePreditivo: number;
  produtoRecomendado: string;
  limiteSugerido: number;
  probabilidadeConversao: number;
  destaque: string;
}

const EMPRESAS_E_PROSPECTOS: ProspectEmpresa[] = [
  {
    id: '1',
    nome: 'UISA - Usinas Itamarati S/A',
    segmento: 'USINAS_INDUSTRIA',
    cidade: 'Nova Olímpia / Tangará da Serra',
    faturamentoOuRendaEst: 2400000000,
    scorePreditivo: 940,
    produtoRecomendado: 'Crédito Agro CPR & Financiamento Bioenergia',
    limiteSugerido: 120000000,
    probabilidadeConversao: 92,
    destaque: 'Maior complexo bioenergético e sucroalcooleiro do médio-norte mato-grossense.',
  },
  {
    id: '2',
    nome: 'Coprodia - Cooperativa Agrícola',
    segmento: 'AGRO',
    cidade: 'Porto Novo / Tangará da Serra',
    faturamentoOuRendaEst: 850000000,
    scorePreditivo: 915,
    produtoRecomendado: 'Custeio Agrícola & CPR Física Grãos',
    limiteSugerido: 45000000,
    probabilidadeConversao: 88,
    destaque: 'Cooperativa de referência em cana, grãos e bioeletricidade.',
  },
  {
    id: '3',
    nome: 'JBS S/A (Unidade Tangará da Serra)',
    segmento: 'USINAS_INDUSTRIA',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 1800000000,
    scorePreditivo: 930,
    produtoRecomendado: 'Crédito com Garantia de Recebíveis de Exportação',
    limiteSugerido: 80000000,
    probabilidadeConversao: 85,
    destaque: 'Planta frigorífica exportadora com mais de 1.800 colaboradores diretos.',
  },
  {
    id: '4',
    nome: 'Amaggi Exportação e Importação',
    segmento: 'AGRO',
    cidade: 'Tangará da Serra / Polo MT',
    faturamentoOuRendaEst: 3500000000,
    scorePreditivo: 960,
    produtoRecomendado: 'Barter Financeiro & CPR Grãos',
    limiteSugerido: 150000000,
    probabilidadeConversao: 89,
    destaque: 'Líder global no agronegócio, trading de grãos e logística fluvial.',
  },
  {
    id: '5',
    nome: 'Agro Baggio (Concessionária John Deere)',
    segmento: 'PME_COMERCIO',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 320000000,
    scorePreditivo: 880,
    produtoRecomendado: 'Financiamento de Máquinas & Frotas Agrícolas',
    limiteSugerido: 18000000,
    probabilidadeConversao: 84,
    destaque: 'Concessionária líder no fornecimento de maquinários e agricultura de precisão.',
  },
  {
    id: '6',
    nome: 'Bom Futuro Agrícola',
    segmento: 'AGRO',
    cidade: 'Campo Novo do Parecis / Tangará',
    faturamentoOuRendaEst: 4200000000,
    scorePreditivo: 975,
    produtoRecomendado: 'Financiamento de Armazéns & CPR Verde ESG',
    limiteSugerido: 200000000,
    probabilidadeConversao: 90,
    destaque: 'Um dos maiores produtores individuais de soja, algodão e milho do mundo.',
  },
  {
    id: '7',
    nome: 'Dr. Valdomiro Parecis de Andrade',
    segmento: 'ALTA_RENDA',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 18500000,
    scorePreditivo: 865,
    produtoRecomendado: 'Home Equity & CPR Financeira de Safra',
    limiteSugerido: 12000000,
    probabilidadeConversao: 86,
    destaque: 'Produtor rural com 4 glebas homologadas no SICAR e livre de embargos.',
  },
  {
    id: '8',
    nome: 'Associação dos Servidores Municipais de Tangará',
    segmento: 'SERVIDORES',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 4500000,
    scorePreditivo: 890,
    produtoRecomendado: 'Crédito Consignado Municipal (0,79% a.m.)',
    limiteSugerido: 15000000,
    probabilidadeConversao: 91,
    destaque: 'Convênio com margem consignável pré-aprovada para servidores efetivos.',
  },
  {
    id: '9',
    nome: 'Cooperativa Sicredi Sudoeste MT/PA',
    segmento: 'PME_COMERCIO',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 950000000,
    scorePreditivo: 950,
    produtoRecomendado: 'Interconexão PIX DICT & Liquidação SPI',
    limiteSugerido: 50000000,
    probabilidadeConversao: 95,
    destaque: 'Principal instituição cooperativa financeira parceira na região sudoeste.',
  },
  {
    id: '10',
    nome: 'BioSertão Biocombustíveis & Grãos',
    segmento: 'USINAS_INDUSTRIA',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 180000000,
    scorePreditivo: 840,
    produtoRecomendado: 'Financiamento Energia Solar & Giro PJ',
    limiteSugerido: 14000000,
    probabilidadeConversao: 80,
    destaque: 'Usinagem de etanol de milho e DDG para nutrição animal.',
  },
  {
    id: '11',
    nome: 'Sindicato dos Aposentados & Pensionistas do Médio Norte',
    segmento: 'APOSENTADOS',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 8200000,
    scorePreditivo: 870,
    produtoRecomendado: 'Consignado INSS com Margem Dataprev (0,79%)',
    limiteSugerido: 9500000,
    probabilidadeConversao: 88,
    destaque: 'Base de aposentados com desconto automático e inadimplência próxima a zero.',
  },
  {
    id: '12',
    nome: 'Laticínios Tangará Food Service Ltda',
    segmento: 'PME_COMERCIO',
    cidade: 'Tangará da Serra',
    faturamentoOuRendaEst: 64000000,
    scorePreditivo: 810,
    produtoRecomendado: 'Capital de Giro PJ & Antecipação de Recebíveis',
    limiteSugerido: 4500000,
    probabilidadeConversao: 82,
    destaque: 'Processamento de derivados de leite com distribuição regional consolidada.',
  },
];

export const RadarProspeccaoTerminal: React.FC = () => {
  const [filtroSegmento, setFiltroSegmento] = useState<string>('TODOS');
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'SCORE' | 'VALOR' | 'CONVERSAO'>('CONVERSAO');

  const listaFiltrada = EMPRESAS_E_PROSPECTOS.filter((item) => {
    const matchSegmento = filtroSegmento === 'TODOS' || item.segmento === filtroSegmento;
    const matchBusca =
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.cidade.toLowerCase().includes(busca.toLowerCase()) ||
      item.produtoRecomendado.toLowerCase().includes(busca.toLowerCase());
    return matchSegmento && matchBusca;
  }).sort((a, b) => {
    if (ordenacao === 'SCORE') return b.scorePreditivo - a.scorePreditivo;
    if (ordenacao === 'VALOR') return b.limiteSugerido - a.limiteSugerido;
    return b.probabilidadeConversao - a.probabilidadeConversao;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header do Módulo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> RADAR DE PROSPECÇÃO REGIONAL
              </span>
              <span className="text-xs text-slate-400 font-mono">Polo Tangará da Serra & MT</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Inteligência Comercial & Radar Preditivo
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Monitoramento ativo de 26 perfis qualificados e 20 grandes corporações de Tangará da Serra e Mato Grosso.
              Algoritmo de enquadramento instantâneo com probabilidade de conversão e produto ótimo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700">
              {listaFiltrada.length} Oportunidades
            </span>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por empresa, produtor, produto ou polo..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar:
            </span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="CONVERSAO">Probabilidade de Conversão (%)</option>
              <option value="VALOR">Limite Sugerido (R$)</option>
              <option value="SCORE">Score Preditivo</option>
            </select>
          </div>
        </div>

        {/* Abas de Segmentos */}
        <div className="flex gap-1.5 overflow-x-auto mt-4 pt-2 border-t border-slate-800/60 pb-1">
          {[
            { id: 'TODOS', label: 'Todos os Segmentos' },
            { id: 'AGRO', label: '🌾 Agronegócio & CPR' },
            { id: 'USINAS_INDUSTRIA', label: '🏭 Usinas & Indústrias' },
            { id: 'PME_COMERCIO', label: '🏬 PME & Comércio' },
            { id: 'SERVIDORES', label: '🏛️ Servidores Públicos' },
            { id: 'APOSENTADOS', label: '👴 Aposentados INSS' },
            { id: 'ALTA_RENDA', label: '💎 Alta Renda' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroSegmento(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filtroSegmento === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards dos Prospectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listaFiltrada.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition duration-300 shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.segmento}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {item.probabilidadeConversao}% Conversão
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3 group-hover:text-emerald-400 transition line-clamp-1">
                {item.nome}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-slate-500" /> {item.cidade}
              </p>
              <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                {item.destaque}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Produto Recomendado</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
                  {item.produtoRecomendado}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Limite Sugerido:</span>
                <span className="font-mono font-bold text-emerald-400">
                  R$ {(item.limiteSugerido / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => alert(`Iniciando esteira de abordagem comercial para ${item.nome}`)}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Abordagem WhatsApp
                </button>
                <button
                  onClick={() => alert(`Dossiê de inteligência de ${item.nome} exportado!`)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                  title="Ver Dossiê Completo"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RadarProspeccaoTerminal;
