// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, useToast, empresaAtiva, listaUnidades, ehFinanceira } from '../../lib/hubApi';
import { useBusiness } from '../../contexts/BusinessContext';
import OpenFinancePainel from './OpenFinancePainel';
import './hub.css';
const API = '/api/admin/hub-integracoes';

const STATUS = {
  ativa: { rotulo: 'Ativa', cor: '#1B7F3A', bg: '#E8F5EC' },
  aguardando_credencial: { rotulo: 'Aguardando credencial', cor: '#9A6A00', bg: '#FFF3D6' },
  planejada: { rotulo: 'Planejada', cor: '#5B6470', bg: '#EEF0F3' },
};
const TIPO = { interna: 'Interna do ERP', publica: 'API pública', credencial: 'Exige contrato/chave', protocolo: 'Exige certificado/homologação' };
const ORIGEM = { 'agro-open': 'ERP Kytto', consulta360: 'Consulta360', imob_facil: 'Imob Fácil', bancofe: 'BancoFe (git/MCP/skills)' };

const card = { padding: 14, border: '1px solid var(--border, #E2DCCF)', borderRadius: 'var(--radius, 12px)', background: 'var(--card, #fff)' };
const muted = { color: 'var(--muted, #5B6470)', fontSize: 13 };
const input = { padding: '8px 10px', border: '1px solid var(--border, #E2DCCF)', borderRadius: 8, fontSize: 14, background: '#fff', width: 'auto' };

const Selo = ({ cfg, children }) => (
  <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: cfg.cor, background: cfg.bg, whiteSpace: 'nowrap' }}>{children ?? cfg.rotulo}</span>
);


function CartaoIntegracao({ i, onTestar, onAlternar, testando, podeEditar, onAbrirOpenFinance }) {
  const teste = i.ultimoTeste;
  return (
    <article style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <div>
          <strong>{i.nome}</strong>
          <div style={muted}>{i.provedor}</div>
        </div>
        <Selo cfg={STATUS[i.status] || STATUS.planejada} />
      </div>
      <p style={{ margin: 0, fontSize: 13.5 }}>{i.descricao}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ ...muted, fontSize: 12 }}>{TIPO[i.tipo]}</span>·<span style={{ ...muted, fontSize: 12 }}>origem: {ORIGEM[i.origem] || i.origem}</span>·<span style={{ ...muted, fontSize: 12 }}>{i.custo}</span>
      </div>
      {i.envVars.length > 0 && (
        <div style={{ fontSize: 12 }}>
          <span style={muted}>Variáveis de ambiente: </span>
          {i.envVars.map((v) => (
            <code key={v} style={{ marginRight: 6, padding: '1px 5px', borderRadius: 4, background: i.variaveisFaltando.includes(v) ? '#FFF3D6' : '#E8F5EC' }}>
              {i.variaveisFaltando.includes(v) ? '✗' : '✓'} {v}
            </code>
          ))}
        </div>
      )}
      {i.usadoEm.length > 0 && <div style={{ fontSize: 12, ...muted }}>Usada em: {i.usadoEm.join(', ')}</div>}
      {teste && <div style={{ fontSize: 12, ...muted }}>Último teste: {teste.status === 'consultada' ? '✓' : '⚠'} {teste.resumo} · {new Date(teste.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div>}
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto', flexWrap: 'wrap', paddingTop: 4 }}>
        {i.id === 'open-finance' && (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ background: '#0C4A34', color: '#fff' }}
            onClick={onAbrirOpenFinance}
          >
            🏦 Abrir Painel Open Finance
          </button>
        )}
        {i.testavel && <button type="button" className="btn btn-ghost btn-sm" disabled={testando === i.id} onClick={() => onTestar(i)}>{testando === i.id ? 'Testando…' : 'Testar conexão'}</button>}
        {podeEditar && (
          <button type="button" className={`btn btn-sm ${i.habilitadaNestaUnidade ? 'btn-secondary' : 'btn-primary'}`} onClick={() => onAlternar(i)}>
            {i.habilitadaNestaUnidade ? 'Desabilitar nesta unidade' : 'Habilitar nesta unidade'}
          </button>
        )}
        {i.doc && <a className="btn btn-ghost btn-sm" href={i.doc} target="_blank" rel="noreferrer">Documentação</a>}
      </div>
    </article>
  );
}

export default function IntegracoesHubPage({ defaultAba = 'catalogo' } = {}) {
  const toast = useToast();
  const [dados, setDados] = useState(null);
  const [aba, setAba] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('aba')) return p.get('aba');
      if (window.location.pathname.includes('open-finance') || window.location.pathname.includes('openfinance')) return 'openfinance';
    }
    return defaultAba;
  });
  const [filtro, setFiltro] = useState({ q: '', categoria: '', status: '', origem: '', recomendadas: false, habilitadas: false });
  const [testando, setTestando] = useState(null);
  const { activeBusiness } = useBusiness();
  const empresa = useMemo(() => empresaAtiva(), [activeBusiness?.id]);
  const financeira = ehFinanceira(empresa);

  const carregar = useCallback(async () => {
    try { setDados(await api.get(`${API}/catalogo`)); } catch (e) { toast(e.message, 'error'); }
  }, [toast]);
  useEffect(() => { carregar(); }, [activeBusiness?.id]);

  const testar = async (i) => {
    setTestando(i.id);
    try {
      const r = await api.post(`${API}/${i.id}/testar`, {});
      toast(`${i.nome}: ${r.resumo || r.motivo || r.status}`, r.status === 'consultada' ? undefined : 'error');
      await carregar();
    } catch (e) { toast(e.message, 'error'); } finally { setTestando(null); }
  };
  const alternar = async (i) => {
    try {
      await api.put(`${API}/${i.id}/unidade`, { empresaId: dados.empresaId, habilitada: !i.habilitadaNestaUnidade });
      await carregar();
    } catch (e) { toast(e.message, 'error'); }
  };
  const habilitarRecomendadas = async () => {
    try {
      const r = await api.post(`${API}/unidade/habilitar-recomendadas`, { empresaId: dados.empresaId });
      toast(`${r.habilitadas} integração(ões) recomendada(s) habilitada(s) nesta unidade`);
      await carregar();
    } catch (e) { toast(e.message, 'error'); }
  };

  const lista = useMemo(() => {
    if (!dados) return [];
    const q = filtro.q.trim().toLowerCase();
    return dados.integracoes.filter((i) => (
      (!q || `${i.nome} ${i.provedor} ${i.descricao} ${i.envVars.join(' ')}`.toLowerCase().includes(q))
      && (!filtro.categoria || i.categoria === filtro.categoria)
      && (!filtro.status || i.status === filtro.status)
      && (!filtro.origem || i.origem === filtro.origem)
      && (!filtro.recomendadas || i.recomendadaPara.includes('financeira'))
      && (!filtro.habilitadas || i.habilitadaNestaUnidade)
    ));
  }, [dados, filtro]);

  if (!dados) return <section className="bf-tela" style={{ padding: '20px 24px' }}><p style={muted}>Carregando integrações…</p></section>;
  const { resumo } = dados;
  const set = (k) => (e) => setFiltro((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const unidades = listaUnidades();
  const contaPorUnidade = (id) => dados.integracoes.filter((i) => (i.habilitadaNasUnidades || []).includes(id)).length;

  return (
    <section className="bf-tela" style={{ maxWidth: 1240, padding: '20px 24px' }}>
      <header style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>🔌 Integrações — módulo único do grupo Bancofe</h2>
        <p style={{ ...muted, margin: '4px 0 0' }}>
          Um só catálogo para todas as unidades (fontes do ERP, Consulta360, Imob Fácil e BancoFe). A habilitação é por unidade; o uso específico está em <strong>Bancofe Operações Financeiras</strong>.
          Unidade atual: <strong>{empresa.nome || dados.empresaId}</strong>.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          ['Integrações catalogadas', resumo.total, '#1F2937'],
          ['Ativas (já em uso)', resumo.porStatus.ativa || 0, STATUS.ativa.cor],
          ['Aguardando credencial', resumo.porStatus.aguardando_credencial || 0, STATUS.aguardando_credencial.cor],
          ['Planejadas', resumo.porStatus.planejada || 0, STATUS.planejada.cor],
          ['Habilitadas nesta unidade', resumo.habilitadasNestaUnidade, '#245B8F'],
        ].map(([t, n, c]) => (
          <div key={t} style={card}><div style={muted}>{t}</div><strong style={{ fontSize: 26, color: c }}>{n}</strong></div>
        ))}
      </div>

      {financeira && (
        <div style={{ ...card, background: '#F4F8F1', marginBottom: 14, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <strong>Uso específico — Operações Financeiras</strong>
            <div style={muted}>{resumo.recomendadasParaFinanceira} integrações recomendadas (KYC/PLD, bureaus, fiscal, judicial, Pix/Open Finance, Mesa de Crédito). Alimentam a Consulta CPF completa.</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={habilitarRecomendadas}>Habilitar recomendadas nesta unidade</button>
        </div>
      )}

      <nav style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[
          ['catalogo', 'Catálogo Geral (77 Fontes)'],
          ['openfinance', '🏦 Open Finance Brasil (mTLS & ITP)'],
          ['unidades', 'Unidades do grupo'],
          ['seguranca', 'Segurança e credenciais'],
        ].map(([id, n]) => (
          <button key={id} type="button" onClick={() => setAba(id)} className={`btn btn-sm ${aba === id ? 'btn-primary' : 'btn-ghost'}`}>{n}</button>
        ))}
      </nav>

      {aba === 'catalogo' && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            <input style={{ ...input, width: 300 }} placeholder="Buscar por nome, provedor ou variável…" value={filtro.q} onChange={set('q')} />
            <select style={input} value={filtro.categoria} onChange={set('categoria')}>
              <option value="">Todas as categorias</option>
              {dados.categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select style={input} value={filtro.status} onChange={set('status')}>
              <option value="">Todos os status</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
            </select>
            <select style={input} value={filtro.origem} onChange={set('origem')}>
              <option value="">Todas as origens</option>
              {Object.entries(ORIGEM).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" style={{ width: 16, height: 16 }} checked={filtro.recomendadas} onChange={set('recomendadas')} /> Recomendadas p/ financeira</label>
            <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" style={{ width: 16, height: 16 }} checked={filtro.habilitadas} onChange={set('habilitadas')} /> Habilitadas aqui</label>
          </div>
          <p style={muted}>{lista.length} de {resumo.total} integrações</p>
          {dados.categorias.map((cat) => {
            const itens = lista.filter((i) => i.categoria === cat.id);
            if (!itens.length) return null;
            return (
              <div key={cat.id} style={{ marginBottom: 22 }}>
                <h3 style={{ margin: '0 0 8px' }}>{cat.icone} {cat.nome} <span style={{ ...muted }}>({itens.length})</span></h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                  {itens.map((i) => (
                    <CartaoIntegracao
                      key={i.id}
                      i={i}
                      onTestar={testar}
                      onAlternar={alternar}
                      testando={testando}
                      podeEditar
                      onAbrirOpenFinance={() => setAba('openfinance')}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {aba === 'openfinance' && <OpenFinancePainel />}

      {aba === 'unidades' && (
        <div style={card}>
          <p style={{ ...muted, marginTop: 0 }}>Integrações habilitadas por unidade. Troque de empresa no seletor do ERP para gerenciar a habilitação da outra unidade.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left' }}><th>Unidade</th><th>Setor</th><th>Habilitadas</th><th>Perfil de uso</th></tr></thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border, #E2DCCF)' }}>
                  <td style={{ padding: '8px 6px' }}>{u.icone || ''} {u.nome}{u.id === dados.empresaId ? ' (atual)' : ''}</td>
                  <td style={{ padding: '8px 6px', ...muted }}>{u.setorRotulo || u.setor || '—'}</td>
                  <td style={{ padding: '8px 6px' }}>{contaPorUnidade(u.id)} / {resumo.total}</td>
                  <td style={{ padding: '8px 6px' }}>{ehFinanceira(u) ? <Selo cfg={STATUS.ativa}>Uso específico (financeira)</Selo> : <span style={muted}>Disponível</span>}</td>
                </tr>
              ))}
              {!unidades.length && <tr><td colSpan="4" style={{ padding: 10, ...muted }}>Lista de unidades indisponível neste perfil.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {aba === 'seguranca' && (
        <div style={{ ...card, fontSize: 14, lineHeight: 1.55 }}>
          <h3 style={{ marginTop: 0 }}>Como as credenciais são tratadas</h3>
          <p>Chaves e tokens <strong>nunca</strong> são digitados, gravados ou exibidos nesta tela. Cada integração declara as variáveis de ambiente de que precisa; o módulo apenas informa se estão presentes (✓) ou ausentes (✗).</p>
          <p>Em produção (Cloud Run, projeto <code>bancofe-plataforma-kytto</code>), cadastre os valores no Secret Manager e associe ao serviço <code>erp-bancofe</code>, por exemplo:</p>
          <pre style={{ background: '#F4F5F7', padding: 10, borderRadius: 8, overflow: 'auto', fontSize: 12.5 }}>{`gcloud run services update erp-bancofe --region southamerica-east1 \\
  --update-secrets INFOSIMPLES_TOKEN=infosimples-token:latest,TRANSPARENCIA_API_KEY=transparencia-api-key:latest`}</pre>
          <p>Estados: <strong>Ativa</strong> = adaptador implementado e credencial presente (ou fonte pública). <strong>Aguardando credencial</strong> = adaptador pronto, falta a variável. <strong>Planejada</strong> = catalogada; ainda não há adaptador no ERP.</p>
          <p>Dados pessoais obtidos pela Consulta CPF seguem a LGPD: finalidade e base legal obrigatórias, CPF mascarado no histórico e retenção limitada.</p>
        </div>
      )}
    </section>
  );
}
