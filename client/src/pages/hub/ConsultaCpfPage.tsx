// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, useToast } from '../../lib/hubApi';
import './hub.css';
const API = '/api/admin/consulta-cpf';

/* ───────── utilidades ───────── */
const soDigitos = (v) => String(v || '').replace(/\D/g, '');
const mascaraCpf = (v) => {
  const d = soDigitos(v).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
const mascaraData = (v) => {
  const d = soDigitos(v).slice(0, 8);
  return d.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2');
};
const mascaraCep = (v) => soDigitos(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
const brl = (n) => (n == null ? '—' : Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
const pct = (n, c = 1) => (n == null ? '—' : `${(Number(n) * 100).toLocaleString('pt-BR', { maximumFractionDigits: c })}%`);
const dh = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

const NIVEL = {
  nenhum: { rotulo: 'Sem alertas', cor: '#1B7F3A', bg: '#E8F5EC' },
  informativo: { rotulo: 'Informativo', cor: '#245B8F', bg: '#E8F1FA' },
  baixo: { rotulo: 'Baixo', cor: '#5A6B1E', bg: '#F1F5DE' },
  medio: { rotulo: 'Médio', cor: '#9A6A00', bg: '#FFF3D6' },
  alto: { rotulo: 'Alto', cor: '#B45309', bg: '#FDE7D3' },
  critico: { rotulo: 'Crítico', cor: '#B42318', bg: '#FDECEA' },
};
const STATUS = {
  consultada: { rotulo: 'Consultada', cor: '#1B7F3A', bg: '#E8F5EC' },
  nao_configurada: { rotulo: 'Aguardando credencial', cor: '#9A6A00', bg: '#FFF3D6' },
  planejada: { rotulo: 'Planejada', cor: '#5B6470', bg: '#EEF0F3' },
  nao_aplicavel: { rotulo: 'Não aplicável', cor: '#5B6470', bg: '#EEF0F3' },
  erro: { rotulo: 'Erro', cor: '#B42318', bg: '#FDECEA' },
};

const card = { padding: 16, border: '1px solid var(--border, #E2DCCF)', borderRadius: 'var(--radius, 12px)', background: 'var(--card, #fff)' };
const muted = { color: 'var(--muted, #5B6470)', fontSize: 13 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid var(--border, #E2DCCF)', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box' };
const rotulo = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--muted, #5B6470)' };

const Selo = ({ cfg, children }) => (
  <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: cfg.cor, background: cfg.bg, whiteSpace: 'nowrap' }}>{children ?? cfg.rotulo}</span>
);
const Campo = ({ label, children, span }) => (
  <label style={{ display: 'block', gridColumn: span ? `span ${span}` : undefined }}>
    <span style={rotulo}>{label}</span>
    {children}
  </label>
);
const Kv = ({ itens }) => (
  <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 220px) 1fr', gap: '6px 14px', margin: 0, fontSize: 14 }}>
    {itens.filter(([, v]) => v !== undefined).map(([k, v]) => (
      <React.Fragment key={k}>
        <dt style={muted}>{k}</dt>
        <dd style={{ margin: 0, wordBreak: 'break-word' }}>{v === null || v === '' ? '—' : typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : v}</dd>
      </React.Fragment>
    ))}
  </dl>
);

/* ───────── cartão genérico de fonte ───────── */
function CartaoFonte({ f, children }) {
  const st = STATUS[f.status] || STATUS.erro;
  return (
    <div style={{ ...card, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong>{f.nome}</strong>
          <div style={muted}>{f.provedor || '—'}{f.latenciaMs ? ` · ${f.latenciaMs} ms` : ''}{f.consultadoEm ? ` · ${dh(f.consultadoEm)}` : ''}</div>
        </div>
        <Selo cfg={st} />
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 14 }}>{f.resumo}</p>
      {f.motivo && f.status !== 'consultada' && <p style={{ ...muted, margin: '6px 0 0' }}>{f.motivo}</p>}
      {f.achados?.length > 0 && (
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14 }}>
          {f.achados.map((a, i) => <li key={i}><Selo cfg={NIVEL[a.nivel] || NIVEL.baixo} /> {a.texto}</li>)}
        </ul>
      )}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

/* ───────── abas de conteúdo ───────── */
const porId = (d, id) => d.fontes.find((f) => f.id === id);
const listaFontes = (d, ids) => ids.map((id) => porId(d, id)).filter(Boolean);

function AbaResumo({ d }) {
  const contagem = d.fontes.reduce((a, f) => { a[f.status] = (a[f.status] || 0) + 1; return a; }, {});
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginBottom: 16 }}>
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} style={card}>
            <div style={muted}>{v.rotulo}</div>
            <strong style={{ fontSize: 24, color: v.cor }}>{contagem[k] || 0}</strong>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: 0 }}>Achados das fontes consultadas</h3>
      {d.achados.length === 0 ? (
        <p style={muted}>Nenhum alerta nas fontes efetivamente consultadas. Isso não cobre as fontes aguardando credencial.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <tbody>
            {d.achados.map((a, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border, #E2DCCF)' }}>
                <td style={{ padding: '8px 6px', width: 110 }}><Selo cfg={NIVEL[a.nivel] || NIVEL.baixo} /></td>
                <td style={{ padding: '8px 6px' }}>{a.texto}</td>
                <td style={{ padding: '8px 6px', ...muted }}>{porId(d, a.fonte)?.nome || a.fonte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ ...muted, marginTop: 16 }}>{d.aviso}</p>
    </div>
  );
}

function AbaIdentificacao({ d }) {
  const loc = porId(d, 'validacao-cpf-cnpj');
  const rf = porId(d, 'receita-cpf');
  const cep = porId(d, 'brasilapi-cep');
  return (
    <div>
      <CartaoFonte f={loc}>
        <Kv itens={[
          ['CPF', loc.dados.cpfFormatado],
          ['Região fiscal de inscrição', loc.dados.regiaoFiscal ? `${loc.dados.regiaoFiscal}ª RF · ${loc.dados.ufsPossiveis.join(', ')}` : null],
          ['Nascimento informado', loc.dados.nascimento ? `${loc.dados.nascimento.data} (${loc.dados.nascimento.idadeAnos} anos)` : 'não informado'],
          ['Filiação informada', loc.dados.filiacaoInformada || 'não informada'],
        ]} />
        <p style={{ ...muted, margin: '8px 0 0' }}>{loc.dados.observacao}</p>
      </CartaoFonte>
      <CartaoFonte f={rf}>
        {rf.status === 'consultada' && rf.dados && (
          <Kv itens={[
            ['Nome na Receita', rf.dados.nome], ['Nome social', rf.dados.nomeSocial], ['Situação cadastral', rf.dados.situacaoCadastral],
            ['Inscrição', rf.dados.dataInscricao], ['Ano de óbito', rf.dados.anoObito],
            ['Compatibilidade do nome', rf.dados.compatibilidadeNome != null ? pct(rf.dados.compatibilidadeNome, 0) : undefined],
            ['Comprovante', rf.dados.comprovante ? <a href={rf.dados.comprovante} target="_blank" rel="noreferrer">abrir comprovante</a> : null],
          ]} />
        )}
      </CartaoFonte>
      <CartaoFonte f={cep}>
        {cep.status === 'consultada' && cep.dados?.encontrado !== false && (
          <Kv itens={[['Logradouro', cep.dados.logradouro], ['Bairro', cep.dados.bairro], ['Cidade/UF', `${cep.dados.cidade}/${cep.dados.uf}`], ['CEP', cep.dados.cep]]} />
        )}
      </CartaoFonte>
    </div>
  );
}

function AbaCompliance({ d }) {
  const cgu = porId(d, 'cgu-ceis');
  const rot = { ceis: 'CEIS · empresas inidôneas e suspensas', cnep: 'CNEP · Lei Anticorrupção', pep: 'PEP · pessoa politicamente exposta', ceaf: 'CEAF · servidores expulsos' };
  return (
    <div>
      <CartaoFonte f={cgu}>
        {cgu.status === 'consultada' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {Object.entries(cgu.dados).map(([k, v]) => (
                <tr key={k} style={{ borderTop: '1px solid var(--border, #E2DCCF)' }}>
                  <td style={{ padding: '8px 6px' }}>{rot[k] || k}</td>
                  <td style={{ padding: '8px 6px' }}>
                    {!v.consultado ? <Selo cfg={STATUS.erro}>indisponível: {v.motivo}</Selo> : v.ocorrencias ? <Selo cfg={NIVEL[k === 'pep' ? 'medio' : 'critico']}>{v.ocorrencias} registro(s)</Selo> : <Selo cfg={NIVEL.nenhum}>nada consta</Selo>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CartaoFonte>
      {listaFontes(d, ['ofac-onu', 'coaf-siscoaf', 'tcu-contas', 'ibama-embargos', 'cgu-cepim']).map((f) => <CartaoFonte key={f.id} f={f} />)}
    </div>
  );
}

function AbaFiscal({ d }) {
  const p = porId(d, 'pgfn-cnd');
  return (
    <div>
      <CartaoFonte f={p}>
        {p.status === 'consultada' && (
          <Kv itens={[
            ['Certidão negativa emitida', p.dados.certidaoNegativaEmitida], ['Situação', p.dados.situacao], ['Tipo', p.dados.tipo],
            ['Emissão', p.dados.emissao], ['Validade', p.dados.validade],
            ['Débitos PGFN', p.dados.debitosPgfn != null ? JSON.stringify(p.dados.debitosPgfn) : undefined],
            ['Débitos RFB', p.dados.debitosRfb != null ? JSON.stringify(p.dados.debitosRfb) : undefined],
            ['Comprovante', p.dados.comprovante ? <a href={p.dados.comprovante} target="_blank" rel="noreferrer">abrir comprovante</a> : null],
          ]} />
        )}
      </CartaoFonte>
      {listaFontes(d, ['cndt-tst', 'tse-quitacao']).map((f) => <CartaoFonte key={f.id} f={f} />)}
    </div>
  );
}

function AbaCredito({ d }) {
  const bcb = porId(d, 'bcb-sgs');
  return (
    <div>
      <p style={{ ...muted, marginTop: 0 }}>Bureaus, SCR e protestos dependem de contrato/credencial e de autorização do titular. Enquanto não estiverem ativos, aparecem como “planejada” — nenhum score é estimado ou inventado.</p>
      {listaFontes(d, ['serasa', 'boavista-scpc', 'quod', 'scr-bacen', 'cenprot', 'inss-dataprev', 'bigdatacorp']).map((f) => <CartaoFonte key={f.id} f={f} />)}
      {bcb && (
        <CartaoFonte f={bcb}>
          {bcb.status === 'consultada' && (
            <Kv itens={Object.values(bcb.dados).map((s) => [s.nome, s.indisponivel ? 'indisponível' : `${s.valor.toLocaleString('pt-BR')} (${s.data})`])} />
          )}
        </CartaoFonte>
      )}
    </div>
  );
}

function AbaJudicial({ d }) {
  return (
    <div>
      <p style={{ ...muted, marginTop: 0 }}>A API pública do DataJud (CNJ) não permite busca por CPF; processos por pessoa exigem tribunais/certidões (TJMT, PJe) ou gateway contratado.</p>
      {listaFontes(d, ['tjmt-pje', 'cartorio-ri', 'senatran-renajud']).map((f) => <CartaoFonte key={f.id} f={f} />)}
    </div>
  );
}

function AbaSocietario({ d }) {
  const s = porId(d, 'brasilapi-cnpj');
  const cor = { confirmado: NIVEL.nenhum, provavel: NIVEL.medio, nao_localizado: NIVEL.alto };
  return (
    <CartaoFonte f={s}>
      {s.status === 'consultada' && (s.dados.empresas || []).map((e) => (
        <div key={e.cnpj} style={{ borderTop: '1px solid var(--border, #E2DCCF)', paddingTop: 10, marginTop: 10 }}>
          {!e.consultado ? <p style={muted}>{e.cnpj}: não consultado ({e.motivo})</p> : (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong>{e.razaoSocial}</strong><span style={muted}>{e.cnpj}</span>
                <Selo cfg={cor[e.vinculo]}>vínculo {e.vinculo.replace('_', ' ')}</Selo>
              </div>
              <Kv itens={[
                ['Situação', e.situacao], ['Abertura', e.abertura], ['CNAE', e.cnae], ['Porte', e.porte],
                ['Capital social', brl(e.capitalSocial)], ['Município/UF', `${e.municipio || '—'}/${e.uf || '—'}`],
                ['Qualificação do titular', e.qualificacaoDoTitular],
              ]} />
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontSize: 13 }}>Quadro societário ({e.totalSocios})</summary>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 6 }}>
                  <tbody>{e.socios.map((x, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border, #E2DCCF)' }}>
                      <td style={{ padding: 4 }}>{x.nome}</td><td style={{ padding: 4 }}>{x.qualificacao}</td>
                      <td style={{ padding: 4 }}>{x.cpfMascarado}</td><td style={{ padding: 4 }}>{x.entrada}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </details>
            </>
          )}
        </div>
      ))}
    </CartaoFonte>
  );
}

function AbaCapacidade({ d }) {
  const c = porId(d, 'capacidade-pagamento');
  const x = c.dados || {};
  return (
    <CartaoFonte f={c}>
      {x.calculado && (
        <>
          <Kv itens={[
            ['Renda mensal informada', brl(x.rendaMensal)], ['Compromissos mensais', brl(x.compromissosMensais)],
            ['Teto da prestação / endividamento', `${pct(x.parametros.tetoPrestacao, 0)} / ${pct(x.parametros.tetoEndividamento, 0)} da renda (política interna padrão)`],
            ['Prestação máxima permitida', brl(x.prestacaoMaximaPermitida)],
            ['Valor máximo financiável (prazo informado)', x.valorMaximoFinanciavel != null ? brl(x.valorMaximoFinanciavel) : undefined],
            ['Taxa utilizada', x.taxaOrigem],
          ]} />
          {x.operacao && (
            <>
              <h4 style={{ marginBottom: 6 }}>Operação simulada ({x.operacao.sistema})</h4>
              <Kv itens={[
                ['Valor', brl(x.operacao.valor)], ['Prazo', `${x.operacao.prazoMeses} meses`], ['Taxa a.m.', pct(x.operacao.taxaMes, 3)],
                ['Prestação', brl(x.operacao.prestacao)], ['Compromete da renda (prestação)', pct(x.comprometimentoPrestacao)],
                ['Endividamento total', pct(x.endividamentoTotal)], ['Dentro da política', x.dentroDoLimite],
              ]} />
            </>
          )}
        </>
      )}
    </CartaoFonte>
  );
}

function AbaFontes({ d }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead><tr style={{ textAlign: 'left' }}><th>Fonte</th><th>Provedor</th><th>Status</th><th>Latência</th><th>Consultada em</th><th>Observação</th></tr></thead>
        <tbody>
          {d.fontes.map((f) => (
            <tr key={f.id} style={{ borderTop: '1px solid var(--border, #E2DCCF)' }}>
              <td style={{ padding: '7px 6px' }}>{f.nome}</td>
              <td style={{ padding: '7px 6px', ...muted }}>{f.provedor || '—'}</td>
              <td style={{ padding: '7px 6px' }}><Selo cfg={STATUS[f.status] || STATUS.erro} /></td>
              <td style={{ padding: '7px 6px' }}>{f.latenciaMs != null ? `${f.latenciaMs} ms` : '—'}</td>
              <td style={{ padding: '7px 6px' }}>{dh(f.consultadoEm)}</td>
              <td style={{ padding: '7px 6px', ...muted }}>{f.motivo || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={muted}>Finalidade declarada: {d.finalidadeNome}. Consulta registrada na trilha de auditoria (CPF mascarado). Histórico retido por prazo limitado (LGPD).</p>
    </div>
  );
}

function AbaHistorico({ aoAbrir }) {
  const toast = useToast();
  const [lista, setLista] = useState(null);
  const [retencao, setRetencao] = useState(null);
  useEffect(() => {
    api.get(`${API}/historico`)
      .then((r) => { setLista(r.consultas || []); setRetencao(r.retencaoDias || 90); })
      .catch(() => { setLista([]); setRetencao(90); });
  }, []);
  if (!lista) return <p style={muted}>Carregando…</p>;
  if (!lista.length) return <p style={muted}>Nenhuma consulta registrada nesta unidade.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead><tr style={{ textAlign: 'left' }}><th>Quando</th><th>CPF</th><th>Nome</th><th>Alerta</th><th>Cobertura</th><th>Usuário</th><th /></tr></thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id} style={{ borderTop: '1px solid var(--border, #E2DCCF)' }}>
              <td style={{ padding: '7px 6px' }}>{dh(c.criadoEm)}</td><td style={{ padding: '7px 6px' }}>{c.cpfMascarado}</td>
              <td style={{ padding: '7px 6px' }}>{c.nome || '—'}</td>
              <td style={{ padding: '7px 6px' }}><Selo cfg={NIVEL[c.nivelAlerta] || NIVEL.nenhum} /></td>
              <td style={{ padding: '7px 6px' }}>{c.cobertura?.percentual}%</td><td style={{ padding: '7px 6px', ...muted }}>{c.usuario || '—'}</td>
              <td style={{ padding: '7px 6px' }}><button type="button" className="btn btn-ghost btn-sm" onClick={() => aoAbrir(c.id)}>Abrir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={muted}>Retenção: {retencao} dias. O histórico guarda CPF mascarado e não guarda a filiação informada.</p>
    </div>
  );
}

const ABAS = [
  ['resumo', 'Resumo e risco'], ['identificacao', 'Identificação'], ['compliance', 'Compliance'], ['fiscal', 'Receita e fiscal'],
  ['credito', 'Crédito e bureaus'], ['judicial', 'Judicial e patrimônio'], ['societario', 'Societário'],
  ['capacidade', 'Capacidade de pagamento'], ['fontes', 'Fontes e auditoria'], ['historico', 'Histórico'],
];

/* ───────── página ───────── */
const VAZIO = { cpf: '', nome: '', nascimento: '', nomeMae: '', cep: '', cnpjs: '', renda: '', compromissos: '', valor: '', prazo: '', taxaMes: '', finalidade: '', consentimento: false, observacao: '' };

export default function ConsultaCpfPage() {
  const toast = useToast();
  const [form, setForm] = useState(VAZIO);
  const [finalidades, setFinalidades] = useState([]);
  const [dossie, setDossie] = useState(null);
  const [aba, setAba] = useState('resumo');
  const [carregando, setCarregando] = useState(false);
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const mask = { cpf: mascaraCpf, nascimento: mascaraData, cep: mascaraCep }[k];
    setForm((f) => ({ ...f, [k]: mask ? mask(v) : v }));
  };

  const preencherExemploRodrigo = () => {
    setForm({
      cpf: '069.887.229-01',
      nome: 'RODRIGO RIBEIRO GONÇALVES',
      nascimento: '18/05/1984',
      nomeMae: 'MARIA HELENA RIBEIRO GONÇALVES',
      cep: '78300-000',
      cnpjs: '36.296.848/0001-57, 04.596.128/0001-44',
      renda: '45.000,00',
      compromissos: '8.200,00',
      valor: '350.000,00',
      prazo: '48',
      taxaMes: '1,25',
      finalidade: finalidades[0]?.id || 'analise_credito',
      consentimento: true,
    });
  };

  useEffect(() => {
    api.get(`${API}/finalidades`).then((r) => setFinalidades(r.finalidades || [])).catch(() => {});
  }, []);

  const consultar = useCallback(async (atualizar = false) => {
    setCarregando(true);
    try {
      const r = await api.post(`${API}/consultar`, { ...form, atualizar });
      setDossie(r);
      setAba('resumo');
      toast(`Consulta concluída · cobertura ${r.cobertura.percentual}%`);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setCarregando(false);
    }
  }, [form, toast]);

  const abrirHistorico = async (id) => {
    try { const r = await api.get(`${API}/${id}`); setDossie({ ...r, cpf: undefined }); setAba('resumo'); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { toast(e.message, 'error'); }
  };
  const exportar = () => {
    const blob = new Blob([JSON.stringify(dossie, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `consulta-cpf-${dossie.cpfMascarado.replace(/\W/g, '')}.json`;
    a.click();
  };

  const nivel = dossie ? NIVEL[dossie.nivelAlerta] || NIVEL.nenhum : null;
  const conteudo = useMemo(() => {
    if (!dossie) return null;
    const mapa = { resumo: AbaResumo, identificacao: AbaIdentificacao, compliance: AbaCompliance, fiscal: AbaFiscal, credito: AbaCredito, judicial: AbaJudicial, societario: AbaSocietario, capacidade: AbaCapacidade, fontes: AbaFontes };
    const C = mapa[aba];
    return C ? <C d={dossie} /> : null;
  }, [dossie, aba]);

  return (
    <section className="bf-tela" style={{ maxWidth: 1180, padding: '20px 24px' }}>
      <header style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🔎 Consulta CPF completa</h2>
        <p style={{ ...muted, margin: '4px 0 0' }}>Dossiê de pessoa física para análise de crédito, KYC/PLD e prevenção à fraude. Cada fonte informa seu status real: consultada, aguardando credencial, planejada ou com erro. Nada é simulado.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); consultar(false); }} style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12, alignItems: 'end' }}>
          <Campo label="CPF *"><input style={input} value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" inputMode="numeric" required /></Campo>
          <Campo label="Nome completo"><input style={input} value={form.nome} onChange={set('nome')} /></Campo>
          <Campo label="Data de nascimento (exigida pela Receita)"><input style={input} value={form.nascimento} onChange={set('nascimento')} placeholder="dd/mm/aaaa" inputMode="numeric" /></Campo>
          <Campo label="Nome da mãe (conferência manual)"><input style={input} value={form.nomeMae} onChange={set('nomeMae')} /></Campo>
          <Campo label="CEP"><input style={input} value={form.cep} onChange={set('cep')} placeholder="00000-000" inputMode="numeric" /></Campo>
          <Campo label="CNPJs vinculados (separe por vírgula)" span={2}><input style={input} value={form.cnpjs} onChange={set('cnpjs')} placeholder="00.000.000/0001-91, …" /></Campo>
          <Campo label="Renda mensal comprovada (R$)"><input style={input} value={form.renda} onChange={set('renda')} inputMode="decimal" placeholder="12.000,00" /></Campo>
          <Campo label="Compromissos mensais (R$)"><input style={input} value={form.compromissos} onChange={set('compromissos')} inputMode="decimal" /></Campo>
          <Campo label="Valor pretendido (R$)"><input style={input} value={form.valor} onChange={set('valor')} inputMode="decimal" /></Campo>
          <Campo label="Prazo (meses)"><input style={input} value={form.prazo} onChange={set('prazo')} inputMode="numeric" /></Campo>
          <Campo label="Taxa a.m. (%) — vazio usa a Selic de referência"><input style={input} value={form.taxaMes} onChange={set('taxaMes')} inputMode="decimal" placeholder="1,49" /></Campo>
          <Campo label="Finalidade (LGPD) *" span={2}>
            <select style={input} value={form.finalidade} onChange={set('finalidade')} required>
              <option value="">Selecione…</option>
              {finalidades.map((f) => <option key={f.id} value={f.id}>{f.nome} — {f.baseLegal}</option>)}
            </select>
          </Campo>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, fontSize: 13 }}>
          <input type="checkbox" checked={form.consentimento} onChange={set('consentimento')} style={{ marginTop: 3, width: 18, height: 18, flex: '0 0 18px' }} />
          <span>Declaro que há base legal (LGPD) e finalidade legítima para esta consulta, que será registrada em auditoria, e que usarei os dados apenas para a finalidade escolhida.</span>
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={carregando}>{carregando ? 'Consultando fontes…' : 'Consultar CPF'}</button>
          <button type="button" className="btn btn-secondary" onClick={preencherExemploRodrigo} style={{ background: '#e8f5ec', color: '#1B7F3A', border: '1px solid #1B7F3A' }}>Exemplo Rodrigo</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setForm(VAZIO); setDossie(null); }}>Limpar</button>
          {dossie && <button type="button" className="btn btn-ghost" disabled={carregando} onClick={() => consultar(true)}>Atualizar (ignorar cache)</button>}
        </div>
      </form>

      {dossie && (
        <div style={{ ...card, marginBottom: 14, borderLeft: `6px solid ${nivel.cor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{dossie.nome || 'Nome não informado'}</div>
              <div style={muted}>CPF {dossie.cpfMascarado} · {dh(dossie.criadoEm)}{dossie.cache ? ' · resultado em cache (≤10 min)' : ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={muted}>Nível de alerta</div>
              <Selo cfg={nivel}>{nivel.rotulo}</Selo>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Cobertura de fontes: {dossie.cobertura.consultadas}/{dossie.cobertura.aplicaveis} consultadas</span>
              <strong>{dossie.cobertura.percentual}%</strong>
            </div>
            <div style={{ height: 8, background: '#EEF0F3', borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ width: `${dossie.cobertura.percentual}%`, height: '100%', background: dossie.cobertura.percentual >= 60 ? '#1B7F3A' : '#D99A00' }} />
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 14 }}>{dossie.recomendacao}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>Imprimir / PDF</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportar}>Exportar JSON</button>
          </div>
        </div>
      )}

      <nav className="bf-abas" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }} aria-label="Seções da consulta">
        {ABAS.filter(([id]) => dossie || id === 'historico').map(([id, nome]) => (
          <button key={id} type="button" onClick={() => setAba(id)} className={`btn btn-sm ${aba === id ? 'btn-primary' : 'btn-ghost'}`}>{nome}</button>
        ))}
      </nav>
      <div style={{ ...card }}>
        {aba === 'historico' || !dossie ? <AbaHistorico aoAbrir={abrirHistorico} /> : conteudo}
      </div>
    </section>
  );
}
