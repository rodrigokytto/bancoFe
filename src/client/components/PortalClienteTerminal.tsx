import React, { useState } from 'react';
import {
  User,
  CreditCard,
  FileText,
  UploadCloud,
  QrCode,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Sparkles,
  ArrowRight,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileCheck,
} from 'lucide-react';
import {
  MotorGestaoEmprestimosBancoFe,
  ContratoEmprestimo,
  ParcelaContrato,
} from '../../credito/gestao-contratos-emprestimos';
import {
  ServicoPortalClienteBancoFe,
  PainelClienteResumo,
} from '../../portal-cliente/portal-cliente.service';

const CLIENTES_DEMO = [
  { doc: '069.887.226-61', nome: 'Rodrigo Ribeiro Gonçalves', tipo: 'Servidor / Executivo' },
  { doc: '512.984.101-53', nome: 'Dr. Valdomiro Parecis de Andrade', tipo: 'Produtor Rural (Agro CPR)' },
  { doc: '36.296.848/0001-57', nome: 'Zuma Gastronomia & Alimentos', tipo: 'PME Comércio Tangará' },
  { doc: '04.596.128/0001-44', nome: 'UISA - Usinas Itamarati S/A', tipo: 'Usinas & Indústria' },
];

export const PortalClienteTerminal: React.FC = () => {
  const [cpfInput, setCpfInput] = useState(CLIENTES_DEMO[0].doc);
  const [painel, setPainel] = useState<PainelClienteResumo>(
    ServicoPortalClienteBancoFe.obterPainelCliente(CLIENTES_DEMO[0].doc)
  );
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string>(
    painel.contratos[0]?.id || ''
  );
  const [parcelaPagamento, setParcelaPagamento] = useState<ParcelaContrato | null>(null);
  const [modalComprovante, setModalComprovante] = useState<ParcelaContrato | null>(null);
  const [modalQuitacao, setModalQuitacao] = useState<any | null>(null);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [copiadoBoleto, setCopiadoBoleto] = useState(false);

  // Formulário de envio de comprovante
  const [nomeArquivo, setNomeArquivo] = useState('comprovante_pix.pdf');
  const [valorComprovante, setValorComprovante] = useState(0);
  const [chaveE2E, setChaveE2E] = useState('E7990000020261123P99887766');

  const carregarPainel = (doc: string) => {
    const dados = ServicoPortalClienteBancoFe.obterPainelCliente(doc);
    setPainel(dados);
    if (dados.contratos.length > 0) {
      setContratoSelecionadoId(dados.contratos[0].id);
    }
  };

  const contratoAtivo = painel.contratos.find((c) => c.id === contratoSelecionadoId) || painel.contratos[0];

  const handleCopiarPix = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2000);
  };

  const handleCopiarBoleto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoBoleto(true);
    setTimeout(() => setCopiadoBoleto(false), 2000);
  };

  const handleEnviarComprovante = () => {
    if (!modalComprovante || !contratoAtivo) return;

    const res = ServicoPortalClienteBancoFe.enviarComprovante({
      contratoId: contratoAtivo.id,
      numeroParcela: modalComprovante.numero,
      comprovanteNomeArquivo: nomeArquivo,
      comprovanteBase64OuUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
      valorDeclarado: valorComprovante || modalComprovante.valorParcela,
      dataTransferencia: new Date().toISOString().split('T')[0],
      chaveTransacaoOuEndToEnd: chaveE2E,
    });

    alert(`${res.mensagem}\nProtocolo de Rastreio: ${res.protocolo}`);
    setModalComprovante(null);
    carregarPainel(cpfInput);
  };

  const handleSimularQuitacao = () => {
    if (!contratoAtivo) return;
    const sim = ServicoPortalClienteBancoFe.simularQuitacao(contratoAtivo.id);
    setModalQuitacao(sim);
  };

  const handleBaixarDeclaracao = () => {
    const decl = ServicoPortalClienteBancoFe.emitirDeclaracaoQuitacaoAnual(cpfInput, 2026);
    alert(
      `Declaração Anual de Quitação Emitida!\nProtocolo: ${decl.protocolo}\nHash de Autenticidade: ${decl.hashAutenticidade}\nBase Legal: ${decl.baseLegal}`
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header do Portal do Cliente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> PORTAL DO CLIENTE • AUTOATENDIMENTO
              </span>
              <span className="text-xs text-slate-400 font-mono">Internet Banking BancoFé</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              Olá, {painel.cliente.nome.split(' ')[0]}!
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Gerencie seus contratos de empréstimo e financiamento, emita boletos e códigos Pix atualizados, envie
              comprovantes de pagamento e solicite quitação antecipada com desconto a valor presente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBaixarDeclaracao}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
            >
              <FileCheck className="w-3.5 h-3.5" /> Declaração Quitação Anual
            </button>
            <button
              onClick={() => alert('Direcionando para simulação de novo crédito pré-aprovado!')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" /> Novo Empréstimo
            </button>
          </div>
        </div>

        {/* Seletor Rápido de Tomador de Crédito */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-medium">Acessar Como (Simulação de Perfis Reais):</span>
            <div className="flex flex-wrap gap-2">
              {CLIENTES_DEMO.map((c) => (
                <button
                  key={c.doc}
                  onClick={() => {
                    setCpfInput(c.doc);
                    carregarPainel(c.doc);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                    cpfInput === c.doc
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  👤 {c.nome.split(' ')[0]} ({c.tipo})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Financeiro do Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block">Saldo Devedor Total</span>
          <div className="text-2xl font-black text-white font-mono mt-2">
            R$ {painel.metricas.saldoDevedorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            {painel.metricas.totalContratosAtivos} contrato(s) ativo(s)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block">Próxima Parcela</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            R$ {painel.metricas.proximaParcelaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block">
            Vencimento: {painel.metricas.proximaParcelaVencimento}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block">Limite Pré-Aprovado</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
            R$ {painel.metricas.limitePreAprovadoNovoEmprestimo.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-cyan-400 mt-2 block">Taxa especial a partir de 0,75%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block">Comprovantes em Análise</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            {painel.metricas.comprovantesEmAnaliseQtd}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">Em conciliação pela mesa</span>
        </div>
      </div>

      {/* Seleção de Contratos e Detalhes */}
      {painel.contratos.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Contrato em Foco</span>
              <div className="flex items-center gap-3 mt-1">
                <select
                  value={contratoSelecionadoId}
                  onChange={(e) => setContratoSelecionadoId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                >
                  {painel.contratos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} • {c.linhaCreditoNome} (R$ {c.valorContratado.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                    contratoAtivo?.status === 'ATIVO'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {contratoAtivo?.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimularQuitacao}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Simular Quitação Antecipada
              </button>
            </div>
          </div>

          {/* Dados Resumidos do Contrato */}
          {contratoAtivo && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Valor Original</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                  R$ {contratoAtivo.valorContratado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Taxa de Juros</span>
                <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                  {contratoAtivo.taxaMensalPct}% a.m. ({contratoAtivo.taxaAnualPct}% a.a.)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Prazo & Modalidade</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                  {contratoAtivo.prazoMeses} meses • Tabela {contratoAtivo.modalidade}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Garantia Registrada</span>
                <span className="text-slate-400 mt-0.5 block truncate" title={contratoAtivo.garantiaDescricao}>
                  {contratoAtivo.garantiaDescricao}
                </span>
              </div>
            </div>
          )}

          {/* Cronograma de Parcelas */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Cronograma de Parcelas & Histórico de Baixas</span>
              <span className="text-xs text-slate-400 font-mono font-normal">
                {contratoAtivo?.parcelas.filter((p) => p.status === 'PAGA').length} de{' '}
                {contratoAtivo?.parcelas.length} pagas
              </span>
            </h4>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Valor Parcela</th>
                    <th className="py-3 px-4">Amortização</th>
                    <th className="py-3 px-4">Juros</th>
                    <th className="py-3 px-4">Saldo Devedor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                  {contratoAtivo?.parcelas.map((p) => {
                    const isPaga = p.status === 'PAGA';
                    const isEnvComprovante = p.status === 'COMPROVANTE_ENVIADO';
                    return (
                      <tr key={p.numero} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-white">Parcela {p.numero}</td>
                        <td className="py-3 px-4 text-slate-300">{p.vencimento}</td>
                        <td className="py-3 px-4 font-bold text-white">
                          R$ {p.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          R$ {p.valorAmortizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          R$ {p.valorJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          R$ {p.saldoDevedorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaga
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isEnvComprovante
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isPaga ? '✓ PAGA' : isEnvComprovante ? '⏳ EM ANÁLISE' : 'A VENCER'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPaga ? (
                            <span className="text-[11px] text-emerald-400 font-sans">Liquidada em {p.dataPagamento}</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setParcelaPagamento(p)}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-lg transition"
                              >
                                Pagar Pix/Boleto
                              </button>
                              <button
                                onClick={() => {
                                  setModalComprovante(p);
                                  setValorComprovante(p.valorParcela);
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs rounded-lg border border-slate-700 transition"
                                title="Enviar Comprovante de Pagamento"
                              >
                                Enviar Comprovante
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Nenhum contrato ativo localizado para o documento {cpfInput}.
        </div>
      )}

      {/* Modal 1: Pagamento via Pix e Boleto da Parcela */}
      {parcelaPagamento && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Pagamento Parcela {parcelaPagamento.numero}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Vencimento: {parcelaPagamento.vencimento} • Valor: R${' '}
                  {parcelaPagamento.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={() => setParcelaPagamento(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Opção Pix Instantâneo */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Pix Instantâneo (Liquidação 24/7)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Chave: pix@bancofe.com.br</span>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block mb-1">Pix Copia e Cola:</span>
                <p className="text-xs text-slate-300 font-mono break-all line-clamp-2">
                  {parcelaPagamento.pixCopiaECola}
                </p>
              </div>

              <button
                onClick={() => handleCopiarPix(parcelaPagamento.pixCopiaECola)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiadoPix ? 'Código Pix Copiado com Sucesso!' : 'Copiar Código Pix'}
              </button>
            </div>

            {/* Opção Boleto Bancário */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Boleto Bancário (Compensação CIP)
              </span>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block mb-1">Linha Digitável:</span>
                <p className="text-xs text-slate-300 font-mono break-all">
                  {parcelaPagamento.linhaDigitavelBoleto}
                </p>
              </div>

              <button
                onClick={() => handleCopiarBoleto(parcelaPagamento.linhaDigitavelBoleto)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiadoBoleto ? 'Linha Digitável Copiada!' : 'Copiar Linha Digitável do Boleto'}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Após realizar o pagamento, você pode anexar o comprovante para conciliação imediata da baixa.
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Envio de Comprovante de Pagamento */}
      {modalComprovante && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Enviar Comprovante de Pagamento
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Parcela {modalComprovante.numero} • Vencimento: {modalComprovante.vencimento}
                </span>
              </div>
              <button
                onClick={() => setModalComprovante(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Arquivo do Comprovante (PDF, PNG ou JPG)</label>
                <div className="p-4 bg-slate-950 border border-dashed border-slate-700 rounded-xl text-center space-y-2 cursor-pointer hover:border-emerald-500 transition">
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-slate-300 block font-semibold">{nomeArquivo}</span>
                  <span className="text-[11px] text-slate-500 block">Clique para selecionar outro arquivo</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Valor Pago Comprovado (R$)</label>
                <input
                  type="number"
                  value={valorComprovante}
                  onChange={(e) => setValorComprovante(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Código / EndToEndId do Pix ou Autenticação Bancária</label>
                <input
                  type="text"
                  value={chaveE2E}
                  onChange={(e) => setChaveE2E(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleEnviarComprovante}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submeter Comprovante à Mesa
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Simulação de Quitação Antecipada */}
      {modalQuitacao && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" /> Quitação Antecipada com Desconto
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Art. 52, § 2º do Código de Defesa do Consumidor • Lei 8.078/1990
                </span>
              </div>
              <button
                onClick={() => setModalQuitacao(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Parcelas Restantes:</span>
                <span className="font-mono font-bold text-slate-200">
                  {modalQuitacao.parcelasRestantesQtd} parcelas
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Soma Nominal das Parcelas:</span>
                <span className="font-mono text-slate-400 line-through">
                  R$ {modalQuitacao.saldoDevedorNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-emerald-400 font-bold">
                <span>Desconto de Juros Futuros (A Valor Presente):</span>
                <span className="font-mono">
                  - R$ {modalQuitacao.descontoJurosFuturos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-2">
                <span className="text-[11px] text-slate-400 block">Valor Líquido para Quitação Imediata:</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  R$ {modalQuitacao.valorLiquidoParaQuitacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Válido até {modalQuitacao.validadeCalculo}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleCopiarPix(modalQuitacao.pixQuitacao)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiadoPix ? 'Pix de Quitação Copiado!' : 'Copiar Pix para Quitação Total'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PortalClienteTerminal;
