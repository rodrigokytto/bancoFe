import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Sparkles,
  Percent,
  Calendar,
  Building,
  User,
  Shield,
  FileCheck,
  CreditCard,
  QrCode,
  Download,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

interface ProdutoModalidade {
  id: string;
  nome: string;
  taxaMensal: number;
  taxaAnual: number;
  prazoMinMeses: number;
  prazoMaxMeses: number;
  valorMin: number;
  valorMax: number;
  garantia: string;
  descricao: string;
  badge: string;
}

const PRODUTOS_BANCOFE: ProdutoModalidade[] = [
  {
    id: 'mcmv',
    nome: 'Minha Casa Minha Vida (MCMV)',
    taxaMensal: 0.58,
    taxaAnual: 7.18,
    prazoMinMeses: 120,
    prazoMaxMeses: 420,
    valorMin: 45000,
    valorMax: 350000,
    garantia: 'Alienação Fiduciária do Imóvel Residencial',
    descricao: 'Subsídio federal e taxas subsidiadas para aquisição do primeiro imóvel no polo Tangará.',
    badge: 'Subsídio Federal',
  },
  {
    id: 'consignado',
    nome: 'Crédito Consignado (INSS & Servidores)',
    taxaMensal: 0.79,
    taxaAnual: 9.90,
    prazoMinMeses: 12,
    prazoMaxMeses: 96,
    valorMin: 1000,
    valorMax: 120000,
    garantia: 'Desconto em Folha / Margem Consignável',
    descricao: 'Liberação instantânea com margem consignável pré-aprovada pelo Dataprev ou RH municipal.',
    badge: 'Desconto em Folha',
  },
  {
    id: 'agro_cpr',
    nome: 'Crédito Rural CPR (Física e Financeira)',
    taxaMensal: 0.75,
    taxaAnual: 9.38,
    prazoMinMeses: 6,
    prazoMaxMeses: 60,
    valorMin: 100000,
    valorMax: 15000000,
    garantia: 'Penhor de Safra (Soja/Milho) ou Gleba Rural CAR',
    descricao: 'Custeio e investimento agropecuário com liquidação vinculada à colheita e cotação de commodities.',
    badge: 'Agronegócio MT',
  },
  {
    id: 'habitacional',
    nome: 'Financiamento Habitacional SBPE',
    taxaMensal: 0.85,
    taxaAnual: 10.69,
    prazoMinMeses: 60,
    prazoMaxMeses: 360,
    valorMin: 80000,
    valorMax: 2500000,
    garantia: 'Alienação Fiduciária Imobiliária',
    descricao: 'Aquisição de imóveis residenciais ou comerciais novos e usados com composição de renda familiar.',
    badge: 'Imóveis Livres',
  },
  {
    id: 'home_equity',
    nome: 'Home Equity (Capital com Garantia Imóvel)',
    taxaMensal: 0.85,
    taxaAnual: 10.69,
    prazoMinMeses: 24,
    prazoMaxMeses: 240,
    valorMin: 50000,
    valorMax: 5000000,
    garantia: 'Hipoteca / Alienação Fiduciária de Imóvel Quitado (LTV até 60%)',
    descricao: 'Use seu imóvel como garantia para obter o menor custo de capital do mercado para qualquer finalidade.',
    badge: 'LTV até 60%',
  },
  {
    id: 'veiculos',
    nome: 'Financiamento Veicular & Frotas',
    taxaMensal: 1.10,
    taxaAnual: 14.03,
    prazoMinMeses: 12,
    prazoMaxMeses: 60,
    valorMin: 15000,
    valorMax: 350000,
    garantia: 'Alienação Fiduciária Renavam',
    descricao: 'Financiamento de carros de passeio, picapes de lavoura e caminhões pesados.',
    badge: 'Gravame Renavam',
  },
  {
    id: 'giro_pj',
    nome: 'Capital de Giro PJ / FGI Peac',
    taxaMensal: 1.15,
    taxaAnual: 14.71,
    prazoMinMeses: 12,
    prazoMaxMeses: 48,
    valorMin: 20000,
    valorMax: 2000000,
    garantia: 'Aval dos Sócios / Recebíveis / FGI',
    descricao: 'Fluxo de caixa imediato para reposição de estoques, folhas de pagamento e expansão de filiais.',
    badge: 'Empresarial',
  },
  {
    id: 'graos',
    nome: 'Garantia de Safra / Grãos Armazenados',
    taxaMensal: 0.80,
    taxaAnual: 10.03,
    prazoMinMeses: 6,
    prazoMaxMeses: 24,
    valorMin: 150000,
    valorMax: 10000000,
    garantia: 'CDA / WA em Armazéns Credenciados Conab',
    descricao: 'Crédito com penhor de soja, milho ou algodão retido em armazém geral auditado.',
    badge: 'Armazém Geral',
  },
  {
    id: 'solar',
    nome: 'Financiamento de Energia Solar',
    taxaMensal: 0.89,
    taxaAnual: 11.22,
    prazoMinMeses: 12,
    prazoMaxMeses: 84,
    valorMin: 10000,
    valorMax: 500000,
    garantia: 'Próprio Equipamento Fotovoltaico',
    descricao: 'Instalação de placas solares com parcela inferior à economia gerada na fatura de energia.',
    badge: 'Sustentabilidade ESG',
  },
  {
    id: 'microcredito',
    nome: 'Microcrédito Produtivo Orientado',
    taxaMensal: 0.99,
    taxaAnual: 12.54,
    prazoMinMeses: 6,
    prazoMaxMeses: 24,
    valorMin: 1000,
    valorMax: 21000,
    garantia: 'Aval Solidário ou Faturamento MEI',
    descricao: 'Capacitação e fomento a microempreendedores locais de Tangará da Serra e região.',
    badge: 'MEI & Autônomo',
  },
];

export const PreCadastroProdutosTerminal: React.FC = () => {
  const [selectedProduto, setSelectedProduto] = useState<ProdutoModalidade>(PRODUTOS_BANCOFE[0]);
  const [valorDesejado, setValorDesejado] = useState<number>(180000);
  const [prazoMeses, setPrazoMeses] = useState<number>(180);
  const [proponenteNome, setProponenteNome] = useState('Rodrigo Ribeiro Gonçalves');
  const [proponenteDoc, setProponenteDoc] = useState('069.887.226-61');
  const [proponenteRenda, setProponenteRenda] = useState(18500);
  const [simulacaoConcluida, setSimulacaoConcluida] = useState(false);

  // Cálculo da Prestação (Tabela Price)
  const taxaDecimalMensal = selectedProduto.taxaMensal / 100;
  const parcelaPrice =
    (valorDesejado * (taxaDecimalMensal * Math.pow(1 + taxaDecimalMensal, prazoMeses))) /
    (Math.pow(1 + taxaDecimalMensal, prazoMeses) - 1);
  const totalPago = parcelaPrice * prazoMeses;
  const totalJuros = totalPago - valorDesejado;
  const comprometimentoRenda = (parcelaPrice / proponenteRenda) * 100;
  const margemAprovada = comprometimentoRenda <= 35;

  const handleSelectProduto = (prod: ProdutoModalidade) => {
    setSelectedProduto(prod);
    if (valorDesejado < prod.valorMin) setValorDesejado(prod.valorMin);
    if (valorDesejado > prod.valorMax) setValorDesejado(prod.valorMax);
    if (prazoMeses < prod.prazoMinMeses) setPrazoMeses(prod.prazoMinMeses);
    if (prazoMeses > prod.prazoMaxMeses) setPrazoMeses(prod.prazoMaxMeses);
  };

  const emitirCertificado = () => {
    setSimulacaoConcluida(true);
    alert(
      `Certificado de Pré-Aprovação Emitido com Sucesso!\nProtocolo: BCF-${Date.now().toString().slice(-6)}\nProduto: ${
        selectedProduto.nome
      }\nValor: R$ ${valorDesejado.toLocaleString('pt-BR')}\nParcela: R$ ${parcelaPrice.toLocaleString('pt-BR', {
        maximumFractionDigits: 2,
      })}`
    );
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
                <Calculator className="w-3.5 h-3.5" /> ESTEIRA DE CRÉDITO MULTIPRODUTO
              </span>
              <span className="text-xs text-slate-400 font-mono">10 Modalidades Homologadas</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Pré-Cadastro & Simulador de Crédito BancoFé
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulação em tempo real com taxas institucionais pré-fixadas, enquadramento de garantias e emissão de
              Certificado Digital de Pré-Aprovação com parecer algorítmico da mesa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/api/v1/precadastro/produtos', '_blank')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
            >
              Taxas & APIs
            </button>
            <button
              onClick={emitirCertificado}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <FileCheck className="w-4 h-4" /> Emitir Certificado
            </button>
          </div>
        </div>

        {/* Grade de Seleção dos 10 Produtos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-6 pt-6 border-t border-slate-800/80">
          {PRODUTOS_BANCOFE.map((p) => {
            const isSelected = selectedProduto.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProduto(p)}
                className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {p.badge}
                  </span>
                  <h4 className="text-xs font-bold mt-2 line-clamp-1 text-slate-100">{p.nome}</h4>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Taxa:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{p.taxaMensal}% a.m.</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Área de Simulação e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Controles e Sliders */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              {selectedProduto.badge}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedProduto.nome}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedProduto.descricao}</p>
          </div>

          {/* Slider de Valor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Valor Desejado do Financiamento</label>
              <span className="text-lg font-mono font-black text-emerald-400">
                R$ {valorDesejado.toLocaleString('pt-BR')}
              </span>
            </div>
            <input
              type="range"
              min={selectedProduto.valorMin}
              max={selectedProduto.valorMax}
              step={selectedProduto.valorMax > 1000000 ? 50000 : 5000}
              value={valorDesejado}
              onChange={(e) => setValorDesejado(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Mín: R$ {selectedProduto.valorMin.toLocaleString('pt-BR')}</span>
              <span>Máx: R$ {selectedProduto.valorMax.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {/* Slider de Prazo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Prazo de Pagamento (Meses)</label>
              <span className="text-lg font-mono font-black text-cyan-400">
                {prazoMeses} meses ({(prazoMeses / 12).toFixed(1)} anos)
              </span>
            </div>
            <input
              type="range"
              min={selectedProduto.prazoMinMeses}
              max={selectedProduto.prazoMaxMeses}
              step={6}
              value={prazoMeses}
              onChange={(e) => setPrazoMeses(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Mín: {selectedProduto.prazoMinMeses} meses</span>
              <span>Máx: {selectedProduto.prazoMaxMeses} meses</span>
            </div>
          </div>

          {/* Dados do Proponente */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Dados do Proponente para Análise de Margem
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={proponenteNome}
                  onChange={(e) => setProponenteNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">CPF ou CNPJ</label>
                <input
                  type="text"
                  value={proponenteDoc}
                  onChange={(e) => setProponenteDoc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Renda Mensal Comprovada</label>
                <input
                  type="number"
                  value={proponenteRenda}
                  onChange={(e) => setProponenteRenda(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Exigência de Garantia */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Garantia Exigida:</span>
              <span className="text-slate-400 mt-0.5 block">{selectedProduto.garantia}</span>
            </div>
          </div>
        </div>

        {/* Resumo da Parcela e Parecer da Mesa */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Resultado da Simulação</span>
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30">
              <span className="text-xs text-slate-400 block">Parcela Estimada (Tabela Price)</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                R$ {parcelaPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Taxa de {selectedProduto.taxaMensal}% a.m. ({selectedProduto.taxaAnual}% a.a.)
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total a Pagar:</span>
                <span className="font-mono font-bold text-slate-200">
                  R$ {totalPago.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total de Juros:</span>
                <span className="font-mono text-slate-400">
                  R$ {totalJuros.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Comprometimento de Renda:</span>
                <span
                  className={`font-mono font-bold ${
                    margemAprovada ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {comprometimentoRenda.toFixed(1)}% (Máx 35%)
                </span>
              </div>
            </div>

            {/* Parecer Instantâneo da Mesa */}
            <div className="mt-5 p-3.5 rounded-xl border bg-slate-950">
              <div className="flex items-center gap-2">
                {margemAprovada ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Pré-Aprovado na Esteira</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">Excede Margem Prudencial</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {margemAprovada
                  ? 'Renda compatível com os limites regulatórios do Banco Central e políticas de crédito do BancoFé.'
                  : 'Sugerimos aumentar o prazo do financiamento ou incluir co-proponente para reduzir a parcela.'}
              </p>
            </div>
          </div>

          <button
            onClick={emitirCertificado}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
          >
            <FileCheck className="w-4 h-4" /> Formalizar Pré-Cadastro
          </button>
        </div>
      </div>
    </div>
  );
};
export default PreCadastroProdutosTerminal;
