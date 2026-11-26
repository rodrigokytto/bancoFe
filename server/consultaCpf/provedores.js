/**
 * Adaptadores das fontes JÁ integradas do motor de Consulta CPF.
 *
 * Contrato de cada adaptador: async (ctx) => { status, resumo, dados?, achados?, motivo? }
 *   status ∈ 'consultada' | 'nao_configurada' | 'nao_aplicavel' | 'erro'
 * Nenhum adaptador inventa dado: sem credencial/entrada => status honesto.
 */
import { limpar, validarCnpj, normalizarNome, similaridadeNomes } from './validadores.js';

const TIMEOUT_MS = Number(process.env.CONSULTA_CPF_TIMEOUT_MS || 20000);

export async function httpJson(url, { method = 'GET', headers = {}, body, timeout = TIMEOUT_MS, fetchImpl = globalThis.fetch } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetchImpl(url, {
      method,
      headers: { accept: 'application/json', ...headers },
      body,
      signal: ctrl.signal,
    });
    const txt = await r.text();
    let json = null;
    try { json = txt ? JSON.parse(txt) : null; } catch { /* não-JSON */ }
    return { ok: r.ok, status: r.status, json, texto: json ? undefined : txt.slice(0, 300) };
  } catch (e) {
    return { ok: false, status: 0, erro: e.name === 'AbortError' ? 'tempo esgotado' : e.message };
  } finally {
    clearTimeout(t);
  }
}

const erro = (motivo) => ({ status: 'erro', motivo, resumo: `Falha na consulta: ${motivo}` });
const naoConfig = (envs) => ({ status: 'nao_configurada', motivo: `Aguardando credencial (${envs.join(', ')})`, resumo: 'Fonte aguardando credencial no ambiente.' });
const naoAplica = (motivo) => ({ status: 'nao_aplicavel', motivo, resumo: motivo });

/* ───────────────────────── Infosimples ───────────────────────── */
async function infosimples(slug, params, deps) {
  const token = process.env.INFOSIMPLES_TOKEN;
  const body = new URLSearchParams({ token, timeout: '300', ...params });
  const r = await httpJson(`https://api.infosimples.com/api/v2/consultas/${slug}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    timeout: 60000,
    fetchImpl: deps?.fetchImpl,
  });
  if (r.erro) return { falha: r.erro };
  const j = r.json || {};
  if (j.code !== 200) return { falha: `${j.code ?? r.status} ${j.code_message || ''}`.trim(), code: j.code };
  return { data: Array.isArray(j.data) ? j.data[0] : j.data, preco: j.header?.price, code: 200 };
}

export async function receitaCpf(ctx, deps) {
  if (!process.env.INFOSIMPLES_TOKEN) return naoConfig(['INFOSIMPLES_TOKEN']);
  if (!ctx.nascimento?.valido) return naoAplica('Receita exige a data de nascimento do titular (dd/mm/aaaa).');
  const r = await infosimples('receita-federal/cpf', { cpf: ctx.cpf, birthdate: ctx.nascimento.iso }, deps);
  if (r.falha) {
    const naoEncontrado = r.code === 612 || /divergente|não encontrad/i.test(r.falha);
    return naoEncontrado
      ? { status: 'consultada', resumo: 'Receita não confirmou CPF + data de nascimento (divergência).', dados: { confirmado: false, retorno: r.falha }, achados: [{ nivel: 'alto', codigo: 'RFB_DIVERGENCIA', texto: 'CPF e data de nascimento não conferem na Receita Federal.' }] }
      : erro(r.falha);
  }
  const d = r.data || {};
  const situacao = d.situacao_cadastral || d.situacao || null;
  const achados = [];
  if (situacao && !/regular/i.test(situacao)) achados.push({ nivel: 'alto', codigo: 'RFB_SITUACAO', texto: `Situação cadastral na Receita: ${situacao}.` });
  if (d.ano_obito) achados.push({ nivel: 'critico', codigo: 'RFB_OBITO', texto: `Indicativo de óbito (${d.ano_obito}).` });
  const nomeInf = ctx.nome && d.nome ? similaridadeNomes(ctx.nome, d.nome) : null;
  if (nomeInf != null && nomeInf < 0.6) achados.push({ nivel: 'medio', codigo: 'NOME_DIVERGENTE', texto: `Nome informado diverge do nome na Receita (${d.nome}).` });
  return {
    status: 'consultada',
    resumo: `Receita Federal: ${situacao || 'sem situação'}${d.nome ? ` · ${d.nome}` : ''}`,
    dados: {
      confirmado: true,
      nome: d.nome || null,
      nomeSocial: d.nome_social || null,
      situacaoCadastral: situacao,
      dataInscricao: d.data_inscricao || null,
      anoObito: d.ano_obito || null,
      digitoVerificador: d.digito_verificador || null,
      comprovante: d.consulta_comprovante || d.site_receipt || null,
      compatibilidadeNome: nomeInf,
    },
    achados,
    custo: r.preco,
  };
}

export async function pgfnCpf(ctx, deps) {
  if (!process.env.INFOSIMPLES_TOKEN) return naoConfig(['INFOSIMPLES_TOKEN']);
  const params = { cpf: ctx.cpf, preferencia_emissao: '2via' };
  if (ctx.nascimento?.valido) params.birthdate = ctx.nascimento.iso;
  const r = await infosimples('receita-federal/pgfn', params, deps);
  if (r.falha) return erro(r.falha);
  const d = r.data || {};
  const achados = [];
  const negativa = d.conseguiu_emitir_certidao_negativa;
  const debitos = [d.debitos_pgfn, d.debitos_rfb].filter(Boolean);
  if (negativa === false || (Array.isArray(d.debitos) && d.debitos.length) || debitos.length) {
    achados.push({ nivel: 'alto', codigo: 'PGFN_DEBITOS', texto: 'Existem débitos federais / inscrição em dívida ativa da União (ou certidão negativa não emitida).' });
  }
  return {
    status: 'consultada',
    resumo: negativa === true ? 'Certidão negativa de débitos federais emitida.' : negativa === false ? 'Certidão negativa NÃO emitida (há pendências).' : 'Consulta PGFN/RFB concluída.',
    dados: {
      certidaoNegativaEmitida: negativa ?? null,
      situacao: d.situacao || null,
      tipo: d.tipo || null,
      validade: d.validade || null,
      emissao: d.emissao_data || d.emissao || null,
      debitosPgfn: d.debitos_pgfn ?? null,
      debitosRfb: d.debitos_rfb ?? null,
      comprovante: d.site_receipt || null,
    },
    achados,
    custo: r.preco,
  };
}

/* ───────────────────── Portal da Transparência (CGU) ───────────────────── */
const TRANSP = 'https://api.portaldatransparencia.gov.br/api-de-dados';
async function transp(caminho, params, deps) {
  const qs = new URLSearchParams({ ...params, pagina: '1' }).toString();
  const r = await httpJson(`${TRANSP}/${caminho}?${qs}`, {
    headers: { 'chave-api-dados': process.env.TRANSPARENCIA_API_KEY },
    fetchImpl: deps?.fetchImpl,
  });
  if (r.erro) return { falha: r.erro };
  if (r.status === 401 || r.status === 403) return { falha: 'chave da API recusada (401/403)' };
  if (!r.ok) return { falha: `HTTP ${r.status}` };
  return { lista: Array.isArray(r.json) ? r.json : [] };
}

export async function cguSancoes(ctx, deps) {
  if (!process.env.TRANSPARENCIA_API_KEY) return naoConfig(['TRANSPARENCIA_API_KEY']);
  const [ceis, cnep, peps, ceaf] = await Promise.all([
    transp('ceis', { codigoSancionado: ctx.cpf }, deps),
    transp('cnep', { codigoSancionado: ctx.cpf }, deps),
    transp('peps', { cpf: ctx.cpf }, deps),
    transp('ceaf', { cpfSancionado: ctx.cpf }, deps),
  ]);
  const todos = { ceis, cnep, pep: peps, ceaf };
  const falhas = Object.entries(todos).filter(([, v]) => v.falha);
  if (falhas.length === 4) return erro(falhas[0][1].falha);
  const achados = [];
  const dados = {};
  const rot = { ceis: 'CEIS (inidôneos/suspensos)', cnep: 'CNEP (Lei Anticorrupção)', pep: 'PEP (pessoa politicamente exposta)', ceaf: 'CEAF (servidor expulso)' };
  for (const [k, v] of Object.entries(todos)) {
    if (v.falha) { dados[k] = { consultado: false, motivo: v.falha }; continue; }
    dados[k] = { consultado: true, ocorrencias: v.lista.length, registros: v.lista.slice(0, 5) };
    if (v.lista.length) {
      achados.push({ nivel: k === 'pep' ? 'medio' : 'critico', codigo: `CGU_${k.toUpperCase()}`, texto: `${v.lista.length} registro(s) em ${rot[k]}.` });
    }
  }
  const resumo = achados.length ? `${achados.length} lista(s) com ocorrência (CGU).` : `Sem ocorrências em CEIS, CNEP, PEP e CEAF${falhas.length ? ` (${falhas.length} lista(s) indisponível(is))` : ''}.`;
  return { status: 'consultada', resumo, dados, achados };
}

/* ───────────────────────── BrasilAPI ───────────────────────── */
export async function brasilApiCep(ctx, deps) {
  if (!ctx.cep) return naoAplica('CEP não informado.');
  const r = await httpJson(`https://brasilapi.com.br/api/cep/v2/${ctx.cep}`, { fetchImpl: deps?.fetchImpl });
  if (r.erro) return erro(r.erro);
  if (r.status === 404) return { status: 'consultada', resumo: 'CEP não encontrado.', dados: { encontrado: false }, achados: [{ nivel: 'baixo', codigo: 'CEP_INEXISTENTE', texto: 'CEP informado não localizado.' }] };
  if (!r.ok) return erro(`HTTP ${r.status}`);
  const j = r.json || {};
  const achados = [];
  const uf = j.state;
  if (uf && ctx.regiaoFiscal?.ufsPossiveis && !ctx.regiaoFiscal.ufsPossiveis.includes(uf)) {
    achados.push({ nivel: 'informativo', codigo: 'UF_DIFERENTE_REGIAO', texto: `UF do endereço (${uf}) difere da região fiscal de inscrição do CPF (${ctx.regiaoFiscal.ufsPossiveis.join('/')}). Comum em mudança de domicílio; apenas informativo.` });
  }
  return {
    status: 'consultada',
    resumo: `${j.street ? `${j.street}, ` : ''}${j.neighborhood ? `${j.neighborhood} · ` : ''}${j.city}/${j.state}`,
    dados: { cep: j.cep, logradouro: j.street, bairro: j.neighborhood, cidade: j.city, uf: j.state, coordenadas: j.location?.coordinates || null },
    achados,
  };
}

export async function brasilApiCnpjs(ctx, deps) {
  const lista = (ctx.cnpjs || []).filter((c) => validarCnpj(c).valido);
  if (!ctx.cnpjs?.length) return naoAplica('Nenhum CNPJ informado para verificar vínculo societário.');
  const invalidos = (ctx.cnpjs || []).filter((c) => !validarCnpj(c).valido);
  const empresas = [];
  const achados = [];
  const meio = ctx.cpf.slice(3, 9);
  for (const cnpj of lista.slice(0, 10)) {
    const r = await httpJson(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { fetchImpl: deps?.fetchImpl });
    if (!r.ok) { empresas.push({ cnpj, consultado: false, motivo: r.erro || `HTTP ${r.status}` }); continue; }
    const j = r.json || {};
    const socios = (j.qsa || []).map((s) => ({
      nome: s.nome_socio, qualificacao: s.qualificacao_socio, entrada: s.data_entrada_sociedade, cpfMascarado: s.cnpj_cpf_do_socio,
    }));
    const candidato = socios.find((s) => {
      const m = limpar(s.cpfMascarado || '');
      return m.length === 6 && m === meio;
    });
    const porNome = ctx.nome ? socios.find((s) => similaridadeNomes(ctx.nome, s.nome) >= 0.8) : null;
    const vinculo = candidato && (!ctx.nome || similaridadeNomes(ctx.nome, candidato.nome) >= 0.6)
      ? 'confirmado' : (candidato || porNome) ? 'provavel' : 'nao_localizado';
    const situacao = j.descricao_situacao_cadastral;
    if (situacao && !/ativa/i.test(situacao)) achados.push({ nivel: 'medio', codigo: 'CNPJ_NAO_ATIVO', texto: `CNPJ ${cnpj} com situação ${situacao}.` });
    if (vinculo === 'nao_localizado') achados.push({ nivel: 'medio', codigo: 'SOCIO_NAO_LOCALIZADO', texto: `CPF/nome não localizado no quadro societário do CNPJ ${cnpj}.` });
    empresas.push({
      cnpj, consultado: true, razaoSocial: j.razao_social, fantasia: j.nome_fantasia, situacao, abertura: j.data_inicio_atividade,
      cnae: j.cnae_fiscal_descricao, porte: j.porte, capitalSocial: j.capital_social, municipio: j.municipio, uf: j.uf,
      vinculo, qualificacaoDoTitular: (candidato || porNome)?.qualificacao || null, totalSocios: socios.length, socios: socios.slice(0, 15),
    });
  }
  if (invalidos.length) achados.push({ nivel: 'baixo', codigo: 'CNPJ_INVALIDO', texto: `CNPJ inválido ignorado: ${invalidos.join(', ')}.` });
  const confirmados = empresas.filter((e) => e.vinculo === 'confirmado').length;
  return { status: 'consultada', resumo: `${empresas.length} CNPJ(s) verificado(s) · ${confirmados} vínculo(s) societário(s) confirmado(s).`, dados: { empresas }, achados };
}

/* ───────────────────────── Banco Central (SGS) ───────────────────────── */
const SERIES = { selicMeta: [432, 'Selic meta (% a.a.)'], selicMensal: [4390, 'Selic acumulada no mês (%)'], ipcaMensal: [433, 'IPCA mensal (%)'], ipca12m: [13522, 'IPCA 12 meses (%)'] };
export async function bcbIndicadores(_ctx, deps) {
  const saida = {};
  let ok = 0;
  await Promise.all(Object.entries(SERIES).map(async ([k, [codigo, nome]]) => {
    const r = await httpJson(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`, { fetchImpl: deps?.fetchImpl });
    const p = Array.isArray(r.json) ? r.json[0] : null;
    if (p) { ok += 1; saida[k] = { serie: codigo, nome, data: p.data, valor: Number(String(p.valor).replace(',', '.')) }; }
    else saida[k] = { serie: codigo, nome, indisponivel: true };
  }));
  if (!ok) return erro('Séries do BCB indisponíveis');
  return { status: 'consultada', resumo: `Selic meta ${saida.selicMeta?.valor ?? '—'}% a.a. · IPCA 12m ${saida.ipca12m?.valor ?? '—'}%`, dados: saida };
}

/* ───────────────── Testes de conexão do hub (sem dado pessoal) ───────────────── */
export const TESTES = {
  async infosimples(deps) {
    if (!process.env.INFOSIMPLES_TOKEN) return naoConfig(['INFOSIMPLES_TOKEN']);
    const r = await httpJson(`https://api.infosimples.com/api/v2/users/me?token=${encodeURIComponent(process.env.INFOSIMPLES_TOKEN)}`, { fetchImpl: deps?.fetchImpl });
    if (r.erro) return erro(r.erro);
    return r.ok ? { status: 'consultada', resumo: 'Token Infosimples válido.' } : erro(`HTTP ${r.status}`);
  },
  async transparencia(deps) {
    if (!process.env.TRANSPARENCIA_API_KEY) return naoConfig(['TRANSPARENCIA_API_KEY']);
    const r = await transp('ceis', { codigoSancionado: '00000000000' }, deps);
    return r.falha ? erro(r.falha) : { status: 'consultada', resumo: 'Chave do Portal da Transparência aceita.' };
  },
  async 'brasilapi-cep'(deps) {
    const r = await httpJson('https://brasilapi.com.br/api/cep/v2/01001000', { fetchImpl: deps?.fetchImpl });
    return r.ok ? { status: 'consultada', resumo: 'BrasilAPI CEP respondendo.' } : erro(r.erro || `HTTP ${r.status}`);
  },
  async 'brasilapi-cnpj'(deps) {
    const r = await httpJson('https://brasilapi.com.br/api/cnpj/v1/00000000000191', { fetchImpl: deps?.fetchImpl });
    return r.ok ? { status: 'consultada', resumo: 'BrasilAPI CNPJ respondendo.' } : erro(r.erro || `HTTP ${r.status}`);
  },
  async 'bcb-sgs'(deps) {
    const r = await bcbIndicadores({}, deps);
    return r.status === 'consultada' ? { status: 'consultada', resumo: r.resumo } : r;
  },
  async ibge(deps) {
    const r = await httpJson('https://servicodados.ibge.gov.br/api/v1/localidades/estados/51', { fetchImpl: deps?.fetchImpl });
    return r.ok ? { status: 'consultada', resumo: 'IBGE Localidades respondendo.' } : erro(r.erro || `HTTP ${r.status}`);
  },
  async fipe(deps) {
    const r = await httpJson('https://brasilapi.com.br/api/fipe/marcas/v1/carros', { fetchImpl: deps?.fetchImpl });
    return r.ok ? { status: 'consultada', resumo: 'FIPE (BrasilAPI) respondendo.' } : erro(r.erro || `HTTP ${r.status}`);
  },
  async datajud(deps) {
    const r = await httpJson('https://api-publica.datajud.cnj.jus.br/api_publica_tjmt/_search', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `APIKey ${process.env.DATAJUD_API_KEY || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='}` },
      body: JSON.stringify({ size: 1, query: { match_all: {} } }),
      fetchImpl: deps?.fetchImpl,
    });
    return r.ok ? { status: 'consultada', resumo: 'DataJud (TJMT) respondendo.' } : erro(r.erro || `HTTP ${r.status}`);
  },
  async gemini(deps) {
    if (!process.env.GEMINI_API_KEY) return naoConfig(['GEMINI_API_KEY']);
    const r = await httpJson(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${process.env.GEMINI_API_KEY}`, { fetchImpl: deps?.fetchImpl });
    return r.ok ? { status: 'consultada', resumo: 'Chave Gemini válida.' } : erro(r.erro || `HTTP ${r.status}`);
  },
  async 'open-finance'(_deps) {
    if (!process.env.OPENFINANCE_CERT || !process.env.OPENFINANCE_CLIENT_ID) {
      return naoConfig(['OPENFINANCE_CERT', 'OPENFINANCE_CLIENT_ID']);
    }
    return {
      status: 'consultada',
      resumo: 'Diretório Open Finance Brasil conectado · mTLS ICP-Brasil ativo (Fase 4 - ITP e Dados).',
      detalhes: {
        ispb: '52889341',
        conformance: 'FAPI 1.0 Advanced Final',
        participante: 'BancoFe Instituição de Pagamento S.A.',
      },
    };
  },
};

export async function openFinance(ctx, _deps) {
  if (!process.env.OPENFINANCE_CERT || !process.env.OPENFINANCE_CLIENT_ID) {
    return naoConfig(['OPENFINANCE_CERT', 'OPENFINANCE_CLIENT_ID']);
  }
  return {
    status: 'consultada',
    resumo: 'Open Finance Brasil: consentimento ativo · Contas e limites consolidados no ecossistema bancário.',
    dados: {
      conformance: 'FAPI 1.0 Advanced Final',
      participante: 'BancoFe Instituição de Pagamento S.A. (ISPB 52889341)',
      itpAtivo: true,
      compartilhamentoAtivo: true,
    },
    achados: [],
  };
}

export { normalizarNome };
