/**
 * Motor da Consulta CPF completa.
 * Orquestra validações locais + fontes reais + capacidade de pagamento e devolve um dossiê
 * em que CADA fonte informa seu status. Não existe score inventado: o "nível de alerta"
 * é derivado de regras sobre achados de fontes realmente consultadas.
 */
import { randomUUID } from 'node:crypto';
import {
  limpar, validarCpf, formatarCpf, mascararCpf, regiaoFiscalDoCpf,
  validarCnpj, formatarCnpj, mascararCnpj,
  validarDataNascimento, calcularCapacidade,
} from './validadores.js';
import { CATALOGO, CATALOGO_POR_ID } from './catalogo.js';
import {
  receitaCpf, pgfnCpf, cguSancoes, brasilApiCep, brasilApiCnpjs, bcbIndicadores,
  jucematRedesim, cagedMte, inssDataprev, tseQuitacao, openFinance, TESTES,
} from './provedores.js';

export const FINALIDADES = [
  { id: 'analise_credito', nome: 'Análise de crédito (execução de contrato / procedimentos preliminares)', baseLegal: 'LGPD art. 7º, V e X' },
  { id: 'prevencao_fraude', nome: 'Prevenção à fraude e segurança do titular', baseLegal: 'LGPD art. 7º, IX e art. 11, II, g' },
  { id: 'pld_kyc', nome: 'PLD/FT e KYC (obrigação legal/regulatória)', baseLegal: 'LGPD art. 7º, II — Circular BCB 3.978' },
  { id: 'cobranca', nome: 'Cobrança / recuperação de crédito', baseLegal: 'LGPD art. 7º, V e IX' },
  { id: 'consentimento', nome: 'Consentimento específico do titular', baseLegal: 'LGPD art. 7º, I' },
];

const NIVEIS = ['nenhum', 'informativo', 'baixo', 'medio', 'alto', 'critico'];
const nivelMax = (achados) => achados.reduce((m, a) => (NIVEIS.indexOf(a.nivel) > NIVEIS.indexOf(m) ? a.nivel : m), 'nenhum');

/** Fontes ainda não integradas que a tela exibe como "planejada" no dossiê. */
const FONTES_PLANEJADAS = ['serasa', 'boavista-scpc', 'quod', 'scr-bacen', 'cenprot', 'senatran-renajud', 'cartorio-ri', 'tjmt-pje', 'cndt-tst', 'bigdatacorp', 'cgu-cepim', 'tcu-contas', 'ofac-onu', 'ibama-embargos'];

export function normalizarEntrada(raw = {}) {
  const cpf = limpar(raw.cpf);
  const cnpjs = String(raw.cnpjs ?? '').split(/[\s,;]+/).map(limpar).filter(Boolean);
  if (cpf.length === 14 && !cnpjs.includes(cpf)) {
    cnpjs.unshift(cpf);
  }
  const num = (v) => (v === '' || v == null ? undefined : Number(String(v).replace(/\./g, '').replace(',', '.')));
  return {
    cpf,
    nome: String(raw.nome || '').trim() || null,
    nascimento: validarDataNascimento(raw.nascimento),
    nomeMae: String(raw.nomeMae || '').trim() || null,
    cep: limpar(raw.cep) || null,
    cnpjs,
    renda: num(raw.renda),
    compromissos: num(raw.compromissos),
    valor: num(raw.valor),
    prazo: num(raw.prazo),
    taxaMes: num(raw.taxaMes),
    finalidade: raw.finalidade || null,
    consentimento: raw.consentimento === true || raw.consentimento === 'true',
    observacao: String(raw.observacao || '').slice(0, 500) || null,
  };
}

export function validarEntrada(e) {
  const erros = [];
  const ehCnpj = e.cpf.length === 14;
  if (ehCnpj) {
    if (!validarCnpj(e.cpf).valido) erros.push('CNPJ inválido (dígitos verificadores não conferem).');
  } else {
    if (!validarCpf(e.cpf).valido) erros.push('CPF inválido (dígitos verificadores não conferem).');
  }
  if (!FINALIDADES.some((f) => f.id === e.finalidade)) erros.push('Informe a finalidade da consulta (LGPD).');
  if (!e.consentimento) erros.push('Confirme a base legal/consentimento para consultar dados pessoais.');
  if (e.nascimento.informada && !e.nascimento.valido) erros.push(`Data de nascimento: ${e.nascimento.motivo}.`);
  if (e.cep && e.cep.length !== 8) erros.push('CEP deve ter 8 dígitos.');
  return erros;
}

async function medir(id, fn) {
  const ini = Date.now();
  let r;
  try { r = await fn(); } catch (e) { r = { status: 'erro', motivo: e.message, resumo: `Falha: ${e.message}` }; }
  const meta = CATALOGO_POR_ID.get(id);
  return {
    id,
    nome: meta?.nome || id,
    provedor: meta?.provedor || null,
    categoria: meta?.categoria || null,
    consultadoEm: new Date().toISOString(),
    latenciaMs: Date.now() - ini,
    ...r,
  };
}

function statusPlanejada(id) {
  const meta = CATALOGO_POR_ID.get(id);
  if (!meta) return null;
  const tem = meta.envVars.length > 0 && meta.envVars.every((v) => process.env[v]);
  return {
    id, nome: meta.nome, provedor: meta.provedor, categoria: meta.categoria,
    status: 'planejada',
    motivo: meta.tipo === 'publica'
      ? 'Fonte pública catalogada; adaptador de consulta ainda não implementado.'
      : tem ? 'Credencial presente; adaptador de consulta ainda não implementado.' : `Aguardando contrato/credencial${meta.envVars.length ? ` (${meta.envVars.join(', ')})` : ''} e adaptador.`,
    resumo: 'Fonte catalogada, ainda não consultada nesta versão.',
    envVars: meta.envVars,
  };
}

function checagensLocais(e) {
  if (e.cpf.length === 14) {
    return {
      id: 'validacao-cpf-cnpj', nome: 'Validação local de CNPJ', provedor: 'Algoritmo oficial (módulo 11 RFB)', categoria: 'empresas',
      status: 'consultada', consultadoEm: new Date().toISOString(), latenciaMs: 0,
      resumo: `CNPJ ${formatarCnpj(e.cpf)} válido`,
      dados: {
        cpfFormatado: formatarCnpj(e.cpf), digitosValidos: true, tipo: 'CNPJ',
        observacao: 'Pessoa jurídica consultada em bases cadastrais da RFB e QSA.',
      },
      achados: [],
    };
  }
  const regiao = regiaoFiscalDoCpf(e.cpf);
  const achados = [];
  if (e.nascimento.valido && !e.nascimento.maiorDeIdade) achados.push({ nivel: 'alto', codigo: 'MENOR_DE_IDADE', texto: `Titular com ${e.nascimento.idadeAnos} anos — menor de idade (exige representação).` });
  if (/^(\d)\1{10}$/.test(e.cpf)) achados.push({ nivel: 'critico', codigo: 'CPF_SEQUENCIAL', texto: 'CPF com todos os dígitos iguais.' });
  return {
    id: 'validacao-cpf-cnpj', nome: 'Validação local de CPF', provedor: 'Algoritmo oficial (módulo 11)', categoria: 'pessoas',
    status: 'consultada', consultadoEm: new Date().toISOString(), latenciaMs: 0,
    resumo: `CPF ${formatarCpf(e.cpf)} válido${regiao ? ` · inscrito na ${regiao.regiaoFiscal}ª região fiscal (${regiao.ufsPossiveis.join('/')})` : ''}`,
    dados: {
      cpfFormatado: formatarCpf(e.cpf), digitosValidos: true,
      regiaoFiscal: regiao?.regiaoFiscal ?? null, ufsPossiveis: regiao?.ufsPossiveis ?? [],
      nascimento: e.nascimento.valido ? { data: e.nascimento.br, idadeAnos: e.nascimento.idadeAnos, maiorDeIdade: e.nascimento.maiorDeIdade } : null,
      filiacaoInformada: e.nomeMae, observacao: 'Filiação informada pelo operador; só é confirmada por fonte oficial (Receita/bureau).',
    },
    achados,
  };
}

const cache = new Map();
const TTL_MS = Number(process.env.CONSULTA_CPF_CACHE_MS || 10 * 60 * 1000);
export const limparCache = () => cache.clear();

/**
 * @returns dossiê completo (sem persistir). A persistência/auditoria é feita pela rota.
 */
export async function consultar(raw, deps = {}) {
  const e = normalizarEntrada(raw);
  const erros = validarEntrada(e);
  if (erros.length) return { erro: true, erros };

  const chave = JSON.stringify([e.cpf, e.nome, e.nascimento.iso, e.cep, e.cnpjs, e.renda, e.compromissos, e.valor, e.prazo, e.taxaMes, deps.empresaId]);
  const hit = cache.get(chave);
  if (!deps.semCache && hit && Date.now() - hit.t < TTL_MS) return { ...hit.v, cache: true };

  const regiao = regiaoFiscalDoCpf(e.cpf);
  const ctx = { ...e, regiaoFiscal: regiao };
  const local = checagensLocais(e);

  const fontes = await Promise.all([
    medir('receita-cpf', () => receitaCpf(ctx, deps)),
    medir('pgfn-cnd', () => pgfnCpf(ctx, deps)),
    medir('cgu-ceis', () => cguSancoes(ctx, deps)),
    medir('brasilapi-cep', () => brasilApiCep(ctx, deps)),
    medir('brasilapi-cnpj', () => brasilApiCnpjs(ctx, deps)),
    medir('bcb-sgs', () => bcbIndicadores(ctx, deps)),
    medir('jucemat-redesim', () => jucematRedesim(ctx, deps)),
    medir('caged-mte', () => cagedMte(ctx, deps)),
    medir('inss-dataprev', () => inssDataprev(ctx, deps)),
    medir('tse-quitacao', () => tseQuitacao(ctx, deps)),
    medir('open-finance', () => openFinance(ctx, deps)),
  ]);
  // CGU cobre 4 listas numa chamada: rotula o cartão como o conjunto
  const cgu = fontes.find((f) => f.id === 'cgu-ceis');
  if (cgu) cgu.nome = 'CGU · CEIS, CNEP, PEP e CEAF (Portal da Transparência)';

  const indicadores = fontes.find((f) => f.id === 'bcb-sgs')?.dados;
  let taxaMes = e.taxaMes;
  let taxaOrigem = 'informada';
  if (!(taxaMes > 0) && indicadores?.selicMeta?.valor) {
    taxaMes = (Math.pow(1 + indicadores.selicMeta.valor / 100, 1 / 12) - 1) * 100; // referência: Selic meta convertida a mês
    taxaOrigem = 'Selic meta convertida a mês (referência; não é a taxa da operação)';
  }
  const capacidade = calcularCapacidade({
    renda: e.renda, compromissos: e.compromissos, valor: e.valor, prazo: e.prazo,
    taxaMes: taxaMes > 0 ? taxaMes / 100 : 0,
  });
  if (capacidade.calculado) capacidade.taxaOrigem = taxaOrigem;
  const capFonte = {
    id: 'capacidade-pagamento', nome: 'Capacidade de pagamento (cálculo local)', provedor: 'Motor Bancofe (Tabela Price)', categoria: 'credito',
    status: capacidade.calculado ? 'consultada' : 'nao_aplicavel', consultadoEm: new Date().toISOString(), latenciaMs: 0,
    resumo: capacidade.calculado ? `Prestação máxima R$ ${capacidade.prestacaoMaximaPermitida.toLocaleString('pt-BR')}` : capacidade.motivo,
    dados: capacidade,
    achados: (capacidade.alertas || []).map((t) => ({ nivel: 'medio', codigo: 'CAPACIDADE', texto: t })),
  };

  const planejadas = FONTES_PLANEJADAS.map(statusPlanejada).filter(Boolean);
  const todas = [local, ...fontes, capFonte, ...planejadas];

  const achados = todas.flatMap((f) => (f.achados || []).map((a) => ({ ...a, fonte: f.id })));
  const aplicaveis = todas.filter((f) => f.status !== 'nao_aplicavel');
  const consultadas = aplicaveis.filter((f) => f.status === 'consultada');
  const aguardando = aplicaveis.filter((f) => f.status === 'nao_configurada' || f.status === 'planejada');
  const comErro = aplicaveis.filter((f) => f.status === 'erro');
  const nivel = nivelMax(achados);
  const cobertura = {
    consultadas: consultadas.length,
    aplicaveis: aplicaveis.length,
    percentual: Math.round((consultadas.length / aplicaveis.length) * 100),
    aguardandoCredencialOuIntegracao: aguardando.length,
    comErro: comErro.length,
  };
  const recomendacao = comErro.length || cobertura.percentual < 60
    ? 'Cobertura parcial: complete as fontes aguardando credencial antes de decidir; o resultado abaixo NÃO é um parecer de crédito.'
    : (nivel === 'critico' || nivel === 'alto') ? 'Há alertas relevantes: encaminhe para análise manual da mesa de crédito/compliance.' : 'Sem alertas relevantes nas fontes consultadas.';

  const dossie = {
    id: randomUUID(),
    criadoEm: new Date().toISOString(),
    cpf: e.cpf,
    cpfMascarado: e.cpf.length === 14 ? mascararCnpj(e.cpf) : mascararCpf(e.cpf),
    tipoDocumento: e.cpf.length === 14 ? 'CNPJ' : 'CPF',
    nome: ctx.nome || fontes.find((f) => f.id === 'receita-cpf')?.dados?.nome || fontes.find((f) => f.id === 'brasilapi-cnpj')?.dados?.empresas?.[0]?.razaoSocial || null,
    finalidade: e.finalidade,
    finalidadeNome: FINALIDADES.find((f) => f.id === e.finalidade)?.nome,
    nivelAlerta: nivel,
    cobertura,
    recomendacao,
    achados,
    fontes: todas,
    entrada: { ...e, nascimento: e.nascimento.valido ? e.nascimento.br : null },
    aviso: 'Dossiê de apoio à decisão. Dados pessoais protegidos pela LGPD; uso restrito à finalidade declarada. Não constitui parecer de crédito.',
  };
  cache.set(chave, { t: Date.now(), v: dossie });
  return dossie;
}

/** Visão resumida para listagem (CPF mascarado, sem payload das fontes). */
export function resumirDossie(d) {
  return {
    id: d.id, criadoEm: d.criadoEm, cpfMascarado: d.cpfMascarado, nome: d.nome, finalidade: d.finalidade,
    nivelAlerta: d.nivelAlerta, cobertura: d.cobertura, usuario: d.usuario || null, empresaId: d.empresaId || null,
  };
}

/* ───────────────────────── Hub: status do catálogo ───────────────────────── */
export function statusDaIntegracao(item, config = {}) {
  const envOk = item.envVars.length === 0 || item.envVars.every((v) => process.env[v]);
  const faltando = item.envVars.filter((v) => !process.env[v]);
  let status;
  if (item.tipo === 'interna') status = item.integrado ? 'ativa' : 'planejada';
  else if (!item.integrado) status = 'planejada';
  else if (item.tipo === 'publica') status = 'ativa';
  else status = envOk ? 'ativa' : 'aguardando_credencial';
  return {
    status,
    credencialConfigurada: item.envVars.length ? envOk : null,
    variaveisFaltando: faltando,
    habilitadaNasUnidades: config.unidades || [],
    ultimoTeste: config.ultimoTeste || null,
  };
}

export function listarCatalogo(configs = {}) {
  return CATALOGO.map((i) => ({ ...i, ...statusDaIntegracao(i, configs[i.id]), testavel: Boolean(i.teste && TESTES[i.teste]) }));
}

export async function testarIntegracao(id, deps = {}) {
  const item = CATALOGO_POR_ID.get(id);
  if (!item) return { status: 'erro', motivo: 'Integração inexistente' };
  if (!item.teste || !TESTES[item.teste]) {
    return { status: 'nao_aplicavel', motivo: item.integrado ? 'Integração interna, sem teste externo.' : 'Integração planejada: ainda não há adaptador para testar.', resumo: 'Sem teste disponível.' };
  }
  const ini = Date.now();
  const r = await TESTES[item.teste](deps);
  return { ...r, latenciaMs: Date.now() - ini, testadoEm: new Date().toISOString() };
}
