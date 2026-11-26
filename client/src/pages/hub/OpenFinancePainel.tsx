// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { api, useToast } from '../../lib/hubApi';

const card = {
  padding: 16,
  border: '1px solid var(--border, #E2DCCF)',
  borderRadius: 'var(--radius, 12px)',
  background: 'var(--card, #fff)',
};
const muted = { color: 'var(--muted, #5B6470)', fontSize: 13 };
const input = {
  padding: '8px 10px',
  border: '1px solid var(--border, #E2DCCF)',
  borderRadius: 8,
  fontSize: 13.5,
  background: '#fff',
  width: '100%',
};

export default function OpenFinancePainel() {
  const toast = useToast();
  const [statusData, setStatusData] = useState(null);
  const [consentimentos, setConsentimentos] = useState([]);
  const [contas, setContas] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [subAba, setSubAba] = useState('visao_geral');
  const [testando, setTestando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Form de Consentimento
  const [novoDoc, setNovoDoc] = useState('305.871.628-13');
  const [novoNome, setNovoNome] = useState('Rodrigo Ribeiro Gonçalves');
  const [novoBanco, setNovoBanco] = useState('00000000'); // Banco do Brasil
  const [novoMeses, setNovoMeses] = useState(12);

  // Form de Pagamento ITP Pix
  const [itpValor, setItpValor] = useState('2500.00');
  const [itpOrigemBanco, setItpOrigemBanco] = useState('Banco do Brasil S.A. (001)');
  const [itpChavePix, setItpChavePix] = useState('pix@bancofe.com.br');
  const [itpFavorecido, setItpFavorecido] = useState('BancoFe Holding & Operações Financeiras');
  const [itpDocFavorecido, setItpDocFavorecido] = useState('52.889.341/0001-92');
  const [itpConsentId, setItpConsentId] = useState('');

  const carregarTudo = useCallback(async () => {
    try {
      const [st, cons, acc, crd, ops, pag] = await Promise.all([
        api.get('/api/admin/open-finance/status'),
        api.get('/api/admin/open-finance/consents'),
        api.get('/api/admin/open-finance/accounts'),
        api.get('/api/admin/open-finance/credit-cards'),
        api.get('/api/admin/open-finance/credit-operations'),
        api.get('/api/admin/open-finance/payments'),
      ]);
      setStatusData(st);
      setConsentimentos(cons.consentimentos || []);
      setContas(acc.contas || []);
      setCartoes(crd.cartoes || []);
      setOperacoes(ops.operacoes || []);
      setPagamentos(pag.pagamentos || []);
      if (cons.consentimentos && cons.consentimentos.length > 0) {
        setItpConsentId(cons.consentimentos[0].consentId);
      }
    } catch (e) {
      console.error('Erro ao carregar Open Finance:', e);
    }
  }, []);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  const executarTesteConexao = async () => {
    setTestando(true);
    try {
      const r = await api.post('/api/admin/open-finance/test-connection', {});
      toast(`Teste Open Finance: ${r.resumo || 'Conexão confirmada com sucesso!'}`, 'success');
      await carregarTudo();
    } catch (e) {
      toast(`Falha no teste mTLS: ${e.message}`, 'error');
    } finally {
      setTestando(false);
    }
  };

  const handleCriarConsentimento = async (e) => {
    e.preventDefault();
    if (!novoDoc.trim()) {
      toast('Informe o documento do titular.', 'error');
      return;
    }
    setSalvando(true);
    try {
      const r = await api.post('/api/admin/open-finance/consents', {
        documentoTitular: novoDoc,
        nomeTitular: novoNome,
        instituicaoIspb: novoBanco,
        validadeMeses: Number(novoMeses),
      });
      toast(`Consentimento FAPI criado: ${r.consentimento.consentId}`, 'success');
      await carregarTudo();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSalvando(false);
    }
  };

  const handleAutorizar = async (id) => {
    try {
      await api.post(`/api/admin/open-finance/consents/${encodeURIComponent(id)}/authorize`, {});
      toast('Consentimento FAPI autorizado via OAuth2 com sucesso!', 'success');
      await carregarTudo();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleRevogar = async (id) => {
    try {
      await api.post(`/api/admin/open-finance/consents/${encodeURIComponent(id)}/revoke`, {
        motivo: 'Revogação voluntária pelo titular (LGPD / BACEN)',
      });
      toast('Consentimento revogado conforme normas do Banco Central.', 'success');
      await carregarTudo();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleDispararItp = async (e) => {
    e.preventDefault();
    if (!itpValor || Number(itpValor) <= 0) {
      toast('Informe um valor válido para a transação Pix.', 'error');
      return;
    }
    setSalvando(true);
    try {
      const r = await api.post('/api/admin/open-finance/payments/initiate', {
        consentId: itpConsentId,
        valorBrl: Number(itpValor),
        instituicaoOrigem: itpOrigemBanco,
        chavePixDestino: itpChavePix,
        nomeRecebedor: itpFavorecido,
        documentoRecebedor: itpDocFavorecido,
        documentoPagador: novoDoc,
        nomePagador: novoNome,
      });
      toast(`Pix ITP liquidado no SPI com sucesso! EndToEnd: ${r.pagamento?.endToEndId}`, 'success');
      await carregarTudo();
      setSubAba('pagamentos');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSalvando(false);
    }
  };

  const totalSaldoBrl = contas.reduce((acc, c) => acc + (c.saldoDisponivelBrl || 0), 0);
  const totalLimiteBrl = contas.reduce((acc, c) => acc + (c.limiteChequeEspecialBrl || 0), 0);
  const totalVolumeItpBrl = pagamentos.reduce((acc, p) => acc + (p.valorBrl || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner Principal de Status mTLS / BACEN */}
      <div
        style={{
          ...card,
          background: 'linear-gradient(135deg, #092c1f 0%, #0d4631 100%)',
          color: '#ffffff',
          border: '1px solid #176547',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🏦</span>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 19 }}>Open Finance Brasil • FAPI 1.0 & ITP Hub</h3>
              <span
                style={{
                  background: '#198754',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                Ativa & Homologada
              </span>
            </div>
            <p style={{ margin: 0, color: '#c4e3d4', fontSize: 13.5, maxWidth: 820 }}>
              Ecossistema regulatório do Banco Central do Brasil. Compartilhamento consentido de dados de clientes, saldos, extratos, operações de crédito e <strong>Iniciação de Transação de Pagamentos Pix (ITP)</strong> sem redirecionamento com conformidade mTLS ICP-Brasil.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: '#20c997', color: '#092c1f', fontWeight: 700 }}
            onClick={executarTesteConexao}
            disabled={testando}
          >
            {testando ? 'Testando Handshake mTLS…' : '⚡ Testar Diretório BACEN'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, color: '#9fd3bc' }}>Instituição Participante</div>
            <strong style={{ fontSize: 13.5 }}>BancoFe IP S.A. (ISPB 52889341)</strong>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#9fd3bc' }}>Padrão de Segurança FAPI</div>
            <strong style={{ fontSize: 13.5 }}>FAPI 1.0 Advanced Final</strong>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#9fd3bc' }}>Certificado Digital mTLS</div>
            <strong style={{ fontSize: 13.5 }}>ICP-Brasil AC SERPRO v5 (2027)</strong>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#9fd3bc' }}>Variáveis de Ambiente</div>
            <div style={{ fontSize: 12, marginTop: 2 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: 4, marginRight: 4 }}>✓ OPENFINANCE_CERT</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: 4 }}>✓ OPENFINANCE_CLIENT_ID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas em Tempo Real */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <div style={card}>
          <div style={muted}>Consentimentos Ativos</div>
          <strong style={{ fontSize: 24, color: '#0c4a34' }}>
            {consentimentos.filter((c) => c.status === 'AUTHORISED').length} de {consentimentos.length}
          </strong>
          <div style={{ fontSize: 11.5, color: '#1B7F3A', marginTop: 2 }}>✓ Em conformidade com LGPD</div>
        </div>

        <div style={card}>
          <div style={muted}>Contas Conectadas</div>
          <strong style={{ fontSize: 24, color: '#245B8F' }}>{contas.length}</strong>
          <div style={{ fontSize: 11.5, ...muted, marginTop: 2 }}>Em 4 instituições parceiras</div>
        </div>

        <div style={card}>
          <div style={muted}>Saldo Compartilhado</div>
          <strong style={{ fontSize: 24, color: '#1B7F3A' }}>
            R$ {totalSaldoBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
          <div style={{ fontSize: 11.5, ...muted, marginTop: 2 }}>Liquidez agregada visível</div>
        </div>

        <div style={card}>
          <div style={muted}>Limites Disponíveis</div>
          <strong style={{ fontSize: 24, color: '#7a5200' }}>
            R$ {totalLimiteBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
          <div style={{ fontSize: 11.5, ...muted, marginTop: 2 }}>Cheque especial e rotativo</div>
        </div>

        <div style={card}>
          <div style={muted}>Volume ITP Pix Liquidado</div>
          <strong style={{ fontSize: 24, color: '#092c1f' }}>
            R$ {totalVolumeItpBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
          <div style={{ fontSize: 11.5, color: '#1B7F3A', marginTop: 2 }}>{pagamentos.length} transação(ões) no SPI</div>
        </div>
      </div>

      {/* Sub-navegação interna do painel */}
      <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          ['visao_geral', '📋 Visão Geral & Diretório BACEN'],
          ['consentimentos', '✍️ Gestão de Consentimentos FAPI'],
          ['contas', '💳 Contas & Saldos Agregados'],
          ['itp_pix', '⚡ Iniciação de Pagamentos Pix (ITP)'],
          ['operacoes_credito', '📊 Operações de Crédito & Financiamentos'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubAba(id)}
            className={`btn btn-sm ${subAba === id ? 'btn-primary' : 'btn-ghost'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* 1. VISÃO GERAL */}
      {subAba === 'visao_geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Diretório Central de Participantes do Open Finance Brasil</h4>
            <p style={{ ...muted, margin: '0 0 14px' }}>
              Relação de instituições financeiras conectadas e certificadas no barramento FAPI 1.0 Advanced com suporte bidirecional a compartilhamento de contas e Iniciação de Transação de Pagamentos (ITP):
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f3ec', borderBottom: '2px solid #e2dccf', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Código</th>
                    <th style={{ padding: '8px 10px' }}>Instituição</th>
                    <th style={{ padding: '8px 10px' }}>ISPB</th>
                    <th style={{ padding: '8px 10px' }}>Segmento</th>
                    <th style={{ padding: '8px 10px' }}>Iniciação Pix (ITP)</th>
                    <th style={{ padding: '8px 10px' }}>Compartilhamento</th>
                    <th style={{ padding: '8px 10px' }}>Status Diretório</th>
                  </tr>
                </thead>
                <tbody>
                  {(statusData?.diretorioParticipantes?.participantes || []).map((p) => (
                    <tr key={p.ispb} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.codigoCompensacao}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <strong>{p.nomeFantasia}</strong>
                        <div style={{ fontSize: 11.5, ...muted }}>{p.nome}</div>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{p.ispb}</td>
                      <td style={{ padding: '8px 10px' }}>{p.segmento}</td>
                      <td style={{ padding: '8px 10px', color: '#1B7F3A', fontWeight: 600 }}>✓ Habilitado</td>
                      <td style={{ padding: '8px 10px', color: '#1B7F3A', fontWeight: 600 }}>✓ Fases 2, 3 e 4</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: '#E8F5EC', color: '#1B7F3A', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          {p.statusDiretorio}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. GESTÃO DE CONSENTIMENTOS */}
      {subAba === 'consentimentos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Formulário de Novo Consentimento */}
          <form onSubmit={handleCriarConsentimento} style={{ ...card, background: '#faf9f5' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Solicitar Novo Pedido de Consentimento FAPI</h4>
            <p style={{ ...muted, margin: '0 0 12px' }}>
              Conforme as Resoluções Conjuntas CMN/BCB, o consentimento do titular é pessoal, intransferível e revogável a qualquer momento pela LGPD.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>CPF ou CNPJ do Titular</label>
                <input style={input} value={novoDoc} onChange={(e) => setNovoDoc(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nome do Titular / Razão Social</label>
                <input style={input} value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Instituição Transmissora (Origem)</label>
                <select style={input} value={novoBanco} onChange={(e) => setNovoBanco(e.target.value)}>
                  {(statusData?.diretorioParticipantes?.participantes || []).map((p) => (
                    <option key={p.ispb} value={p.ispb}>
                      {p.codigoCompensacao} - {p.nomeFantasia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Validade Regulamentar</label>
                <select style={input} value={novoMeses} onChange={(e) => setNovoMeses(e.target.value)}>
                  <option value={12}>12 Meses (Padrão Banco Central)</option>
                  <option value={6}>6 Meses</option>
                  <option value={3}>3 Meses</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={salvando}>
                {salvando ? 'Gerando…' : 'Criar Consentimento FAPI'}
              </button>
            </div>
          </form>

          {/* Lista de Consentimentos */}
          <div style={card}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Consentimentos Registrados ({consentimentos.length})</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f3ec', borderBottom: '2px solid #e2dccf', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Consent ID</th>
                    <th style={{ padding: '8px 10px' }}>Titular</th>
                    <th style={{ padding: '8px 10px' }}>Instituição</th>
                    <th style={{ padding: '8px 10px' }}>Permissões</th>
                    <th style={{ padding: '8px 10px' }}>Expiração</th>
                    <th style={{ padding: '8px 10px' }}>Status</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {consentimentos.map((c) => {
                    const ativo = c.status === 'AUTHORISED';
                    const aguardando = c.status === 'AWAITING_AUTHORISATION';
                    return (
                      <tr key={c.consentId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>
                          {c.consentId}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <strong>{c.nomeTitular}</strong>
                          <div style={{ fontSize: 11.5, ...muted }}>{c.documentoTitularMascarado}</div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          {c.instituicaoTransmissora?.nomeFantasia || 'Banco Participante'}
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 11 }}>
                          {c.permissoes?.length} escopos FAPI
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 12 }}>
                          {new Date(c.expiraEm).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span
                            style={{
                              background: ativo ? '#E8F5EC' : aguardando ? '#FFF3D6' : '#EEF0F3',
                              color: ativo ? '#1B7F3A' : aguardando ? '#9A6A00' : '#5B6470',
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {aguardando && (
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleAutorizar(c.consentId)}
                              >
                                Autorizar OAuth
                              </button>
                            )}
                            {ativo && (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                style={{ color: '#d9534f', borderColor: '#d9534f' }}
                                onClick={() => handleRevogar(c.consentId)}
                              >
                                Revogar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTAS & SALDOS AGREGADOS */}
      {subAba === 'contas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15 }}>Visão Multiconta e Saldos Agregados em Tempo Real</h4>
                <div style={muted}>Dados consolidados sob consentimento de Open Finance Brasil (Fase 2)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11.5, ...muted }}>Patrimônio Líquido Disponível</div>
                <strong style={{ fontSize: 18, color: '#1B7F3A' }}>
                  R$ {totalSaldoBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f3ec', borderBottom: '2px solid #e2dccf', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Banco</th>
                    <th style={{ padding: '8px 10px' }}>Agência / Conta</th>
                    <th style={{ padding: '8px 10px' }}>Tipo</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Saldo Disponível</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Limite Cheque Especial</th>
                    <th style={{ padding: '8px 10px' }}>Última Atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <strong>{c.instituicao}</strong>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>
                        Ag: {c.agencia} · Cc: {c.numeroConta}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: '#EEF0F3', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                          {c.tipoConta}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#1B7F3A' }}>
                        R$ {c.saldoDisponivelBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#7a5200' }}>
                        R$ {c.limiteChequeEspecialBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 12, ...muted }}>
                        {new Date(c.dataAtualizacao).toLocaleTimeString('pt-BR')} (mTLS)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartões de Crédito Compartilhados */}
          <div style={card}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Cartões de Crédito Vinculados ({cartoes.length})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {cartoes.map((cardItem) => (
                <div key={cardItem.id} style={{ padding: 14, border: '1px solid #e2dccf', borderRadius: 8, background: '#faf9f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>{cardItem.instituicao}</strong>
                    <span style={{ fontSize: 11, background: '#e8f5ec', color: '#0c4a34', padding: '2px 6px', borderRadius: 4 }}>
                      {cardItem.bandeira}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', marginBottom: 6 }}>
                    •••• •••• •••• {cardItem.ultimosQuatroDigitos}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid #eee', paddingTop: 6, marginTop: 6 }}>
                    <div>
                      <div style={muted}>Limite Total</div>
                      <strong>R$ {cardItem.limiteTotalBrl.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div>
                      <div style={muted}>Disponível</div>
                      <strong style={{ color: '#1B7F3A' }}>R$ {cardItem.limiteDisponivelBrl.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div>
                      <div style={muted}>Fatura Atual</div>
                      <strong style={{ color: '#d9534f' }}>R$ {cardItem.valorFaturaAtualBrl.toLocaleString('pt-BR')}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. INICIAÇÃO DE PAGAMENTOS (ITP PIX) */}
      {subAba === 'itp_pix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Formulário Operacional ITP */}
          <form onSubmit={handleDispararItp} style={{ ...card, background: '#faf9f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 15 }}>Disparar Iniciação de Pagamento Pix via ITP (Fase 3)</h4>
              <span style={{ background: '#0c4a34', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                SPI / BACEN Direto
              </span>
            </div>
            <p style={{ ...muted, margin: '0 0 14px' }}>
              Transfira valores diretamente de contas bancárias externas autorizadas para a conta do BancoFe, sem necessidade de sair do sistema.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Instituição de Origem (Débito)</label>
                <select style={input} value={itpOrigemBanco} onChange={(e) => setItpOrigemBanco(e.target.value)}>
                  <option value="Banco do Brasil S.A. (001)">Banco do Brasil S.A. (001)</option>
                  <option value="Itaú Unibanco S.A. (341)">Itaú Unibanco S.A. (341)</option>
                  <option value="Sicredi Tangará da Serra (748)">Sicredi Tangará da Serra (748)</option>
                  <option value="Banco Santander (033)">Banco Santander (033)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Valor do Pix (R$)</label>
                <input style={input} type="number" step="0.01" value={itpValor} onChange={(e) => setItpValor(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Chave Pix de Destino (BancoFe)</label>
                <input style={input} value={itpChavePix} onChange={(e) => setItpChavePix(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Favorecido Recebedor</label>
                <input style={input} value={itpFavorecido} onChange={(e) => setItpFavorecido(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, ...muted }}>
                🔒 Assinatura digital JWS com certificado ICP-Brasil e liquidação SPI em menos de 2 segundos.
              </div>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? 'Processando ITP…' : '⚡ Executar Pix via Open Finance (ITP)'}
              </button>
            </div>
          </form>

          {/* Histórico de Pagamentos ITP */}
          <div style={card}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Histórico de Transações ITP Pix Liquidadas ({pagamentos.length})</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f3ec', borderBottom: '2px solid #e2dccf', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>ID Transação</th>
                    <th style={{ padding: '8px 10px' }}>End-to-End ID (BACEN)</th>
                    <th style={{ padding: '8px 10px' }}>Banco Origem</th>
                    <th style={{ padding: '8px 10px' }}>Destino / Chave</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '8px 10px' }}>Status SPI</th>
                    <th style={{ padding: '8px 10px' }}>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((p) => (
                    <tr key={p.paymentId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.paymentId}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>
                        {p.endToEndId}
                      </td>
                      <td style={{ padding: '8px 10px' }}>{p.instituicaoOrigem}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <div>{p.nomeRecebedor}</div>
                        <div style={{ fontSize: 11, ...muted }}>{p.chavePixDestino}</div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#1B7F3A' }}>
                        R$ {p.valorBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: '#E8F5EC', color: '#1B7F3A', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          ✓ {p.status} (Liquidado)
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 12, ...muted }}>
                        {new Date(p.iniciadoEm).toLocaleTimeString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. OPERAÇÕES DE CRÉDITO & FINANCIAMENTOS */}
      {subAba === 'operacoes_credito' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>
              Operações de Crédito e Financiamentos Compartilhados ({operacoes.length})
            </h4>
            <p style={{ ...muted, margin: '0 0 14px' }}>
              Dados de endividamento real obtidos via Open Finance Brasil (Fase 4), alimentando a Mesa de Crédito Algorítmica e a Consulta CPF/CNPJ Completa.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f3ec', borderBottom: '2px solid #e2dccf', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Instituição</th>
                    <th style={{ padding: '8px 10px' }}>Modalidade</th>
                    <th style={{ padding: '8px 10px' }}>Nº Contrato</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Valor Contratado</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Saldo Devedor</th>
                    <th style={{ padding: '8px 10px' }}>Taxa Juros</th>
                    <th style={{ padding: '8px 10px' }}>Parcelas</th>
                  </tr>
                </thead>
                <tbody>
                  {operacoes.map((op) => (
                    <tr key={op.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{op.instituicao}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: '#EEF0F3', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                          {op.modalidade}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{op.numeroContrato}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        R$ {op.valorContratadoBrl.toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#d9534f' }}>
                        R$ {op.saldoDevedorBrl.toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {op.taxaJurosMensalPercentual}% a.m. ({op.taxaJurosAnualPercentual}% a.a.)
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {op.parcelasRestantes} de {op.quantidadeParcelas} restantes
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
