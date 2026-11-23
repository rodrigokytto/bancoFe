import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck,
  Clock,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import {
  MotorGestaoEmprestimosBancoFe,
  ContratoEmprestimo,
} from '../../credito/gestao-contratos-emprestimos';

export const GestaoEmprestimosAdminTerminal: React.FC = () => {
  const [metricas, setMetricas] = useState(MotorGestaoEmprestimosBancoFe.obterMetricasCarteira());
  const [contratos, setContratos] = useState<ContratoEmprestimo[]>(
    MotorGestaoEmprestimosBancoFe.listarTodos()
  );
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVO' | 'QUITADO'>('TODOS');
  const [contratoDetalhe, setContratoDetalhe] = useState<ContratoEmprestimo | null>(null);

  const recarregar = () => {
    setMetricas(MotorGestaoEmprestimosBancoFe.obterMetricasCarteira());
    setContratos(MotorGestaoEmprestimosBancoFe.listarTodos());
  };

  const handleConciliarComprovante = (contratoId: string, numeroParcela: number, aprovar: boolean) => {
    const ok = MotorGestaoEmprestimosBancoFe.conciliarComprovanteMesa(
      contratoId,
      numeroParcela,
      aprovar,
      aprovar ? 'Aprovado via Cockpit Operacional.' : 'Rejeitado por divergência de valores.'
    );

    if (ok) {
      alert(`Parcela ${numeroParcela} do contrato ${contratoId} ${aprovar ? 'BAIXADA COM SUCESSO!' : 'REJEITADA.'}`);
      recarregar();
      if (contratoDetalhe && contratoDetalhe.id === contratoId) {
        setContratoDetalhe(MotorGestaoEmprestimosBancoFe.obterPorId(contratoId) || null);
      }
    }
  };

  const contratosFiltrados = contratos.filter((c) => {
    const matchStatus = filtroStatus === 'TODOS' || c.status === filtroStatus;
    const matchBusca =
      c.id.toLowerCase().includes(busca.toLowerCase()) ||
      c.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      c.clienteCpfCnpj.includes(busca) ||
      c.linhaCreditoNome.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  // Lista de comprovantes aguardando conciliação na mesa
  const comprovantesPendentes = contratos.flatMap((c) =>
    c.parcelas
      .filter((p) => p.comprovanteStatus === 'EM_ANALISE')
      .map((p) => ({ contrato: c, parcela: p }))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header do Módulo Administrativo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" /> MESA DE OPERAÇÕES FINANCEIRAS
              </span>
              <span className="text-xs text-slate-400 font-mono">Controle de Carteira de Crédito & Cobrança</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Gestão de Empréstimos & Recebimentos
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Acompanhamento centralizado de contratos de crédito, amortizações, recebimentos, conciliação de
              comprovantes enviados pelo Portal do Cliente e conformidade COSIF / Bacen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={recarregar}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Recarregar Indicadores"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Indicadores Consolidados da Carteira */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Carteira Total Contratada</span>
            <span className="text-xl font-mono font-black text-white mt-1 block">
              R$ {(metricas.totalContratadoBrl / 1000000).toFixed(2)}M
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">{metricas.totalContratos} contratos emitidos</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Saldo Devedor Ativo</span>
            <span className="text-xl font-mono font-black text-cyan-400 mt-1 block">
              R$ {(metricas.totalSaldoDevedorBrl / 1000000).toFixed(2)}M
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">{metricas.contratosAtivos} contratos ativos</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Total Recebido / Liquidado</span>
            <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">
              R$ {(metricas.totalRecebidoBrl / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 block">Amortizações & Juros Pagos</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Fila de Comprovantes</span>
            <span className="text-xl font-mono font-black text-amber-400 mt-1 block">
              {metricas.comprovantesAguardandoConciliacao} Pendente(s)
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Aguardando validação da mesa</span>
          </div>
        </div>
      </div>

      {/* Seção 1: Fila de Comprovantes para Conciliação Imediata */}
      {comprovantesPendentes.length > 0 && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Comprovantes Enviados por Clientes para Conciliação
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {comprovantesPendentes.length} Requerem Ação
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comprovantesPendentes.map(({ contrato, parcela }) => (
              <div
                key={`${contrato.id}-${parcela.numero}`}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      {contrato.id} • Parcela {parcela.numero}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      R$ {parcela.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-xs text-slate-300 font-semibold block mt-1">
                    {contrato.clienteNome} ({contrato.clienteCpfCnpj})
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {parcela.comprovanteObservacao || 'Comprovante submetido via portal.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleConciliarComprovante(contrato.id, parcela.numero, true)}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar & Baixar Parcela
                  </button>
                  <button
                    onClick={() => handleConciliarComprovante(contrato.id, parcela.numero, false)}
                    className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-lg border border-rose-500/30 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 2: Lista Completa de Contratos da Carteira */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Contratos da Carteira de Crédito</h3>
            <span className="text-xs text-slate-400">
              Controle de tomadores, linhas de crédito e cronograma de liquidação
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar contrato, cliente, CPF..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            >
              <option value="TODOS">Todos Status</option>
              <option value="ATIVO">Ativos</option>
              <option value="QUITADO">Quitados</option>
            </select>
          </div>
        </div>

        {/* Tabela de Contratos */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Contrato</th>
                <th className="py-3 px-4">Tomador / Documento</th>
                <th className="py-3 px-4">Linha de Crédito</th>
                <th className="py-3 px-4">Valor Original</th>
                <th className="py-3 px-4">Saldo Devedor</th>
                <th className="py-3 px-4">Prazo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
              {contratosFiltrados.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{c.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-sans font-bold text-slate-200 block truncate max-w-[200px]">
                      {c.clienteNome}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{c.clienteCpfCnpj}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{c.linhaCreditoNome}</td>
                  <td className="py-3 px-4 font-bold text-white">
                    R$ {c.valorContratado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">
                    R$ {c.saldoDevedorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{c.prazoMeses}x ({c.modalidade})</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ATIVO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setContratoDetalhe(c)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans rounded-lg border border-slate-700 transition"
                    >
                      Inspecionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhes do Contrato Inspecionado */}
      {contratoDetalhe && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Dossiê Operacional • {contratoDetalhe.id}
                </h3>
                <span className="text-xs text-slate-400">
                  {contratoDetalhe.clienteNome} • {contratoDetalhe.linhaCreditoNome}
                </span>
              </div>
              <button
                onClick={() => setContratoDetalhe(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Total Contratado:</span>
                <span className="text-white font-bold mt-0.5 block">
                  R$ {contratoDetalhe.valorContratado.toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Saldo Devedor:</span>
                <span className="text-cyan-400 font-bold mt-0.5 block">
                  R$ {contratoDetalhe.saldoDevedorAtual.toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Liquidado:</span>
                <span className="text-emerald-400 font-bold mt-0.5 block">
                  R$ {contratoDetalhe.totalPago.toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Taxa Contratada:</span>
                <span className="text-white font-bold mt-0.5 block">
                  {contratoDetalhe.taxaMensalPct}% a.m.
                </span>
              </div>
            </div>

            {/* Lista de Parcelas */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase font-mono mb-2">
                Parcelas do Contrato
              </h4>
              <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Parcela</th>
                      <th className="py-2 px-3">Vencimento</th>
                      <th className="py-2 px-3">Valor</th>
                      <th className="py-2 px-3">Amortização</th>
                      <th className="py-2 px-3">Saldo</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {contratoDetalhe.parcelas.map((p) => (
                      <tr key={p.numero}>
                        <td className="py-2 px-3 font-bold text-white">#{p.numero}</td>
                        <td className="py-2 px-3">{p.vencimento}</td>
                        <td className="py-2 px-3 text-white">R$ {p.valorParcela.toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-400">R$ {p.valorAmortizacao.toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-400">R$ {p.saldoDevedorRestante.toFixed(2)}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              p.status === 'PAGA'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-slate-400'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GestaoEmprestimosAdminTerminal;
