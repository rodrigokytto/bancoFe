/**
 * Validadores e cálculos locais do módulo Consulta CPF / Integrações (BancoFe).
 * Nada aqui faz chamada externa: são regras determinísticas e testáveis.
 */

export const limpar = (v) => String(v ?? '').replace(/\D/g, '');

export function validarCpf(valor) {
  const c = limpar(valor);
  if (c.length !== 11) return { valido: false, motivo: 'CPF deve ter 11 dígitos' };
  if (/^(\d)\1{10}$/.test(c)) return { valido: false, motivo: 'CPF com todos os dígitos iguais' };
  const dv = (base, pesoInicial) => {
    let soma = 0;
    for (let i = 0; i < base.length; i += 1) soma += Number(base[i]) * (pesoInicial - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = dv(c.slice(0, 9), 10);
  const d2 = dv(c.slice(0, 10), 11);
  if (d1 !== Number(c[9]) || d2 !== Number(c[10])) return { valido: false, motivo: 'Dígitos verificadores não conferem' };
  return { valido: true, cpf: c };
}

export function validarCnpj(valor) {
  const c = limpar(valor);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return { valido: false };
  const dv = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((s, d, i) => s + Number(d) * pesos[i], 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(c.slice(0, 12));
  const d2 = dv(c.slice(0, 12) + d1);
  return d1 === Number(c[12]) && d2 === Number(c[13]) ? { valido: true, cnpj: c } : { valido: false };
}

export const formatarCpf = (v) => {
  const c = limpar(v).padStart(11, '0').slice(0, 11);
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
};
export const formatarCnpj = (v) => {
  const c = limpar(v).padStart(14, '0').slice(0, 14);
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
};
export const mascararCnpj = (v) => {
  const c = limpar(v);
  return c.length === 14 ? `${c.slice(0, 2)}.${c.slice(2, 5)}.***/${c.slice(8, 12)}-**` : '***';
};
/** Mascara no padrão LGPD: ***.456.789-** */
export const mascararCpf = (v) => {
  const c = limpar(v);
  return c.length === 11 ? `***.${c.slice(3, 6)}.${c.slice(6, 9)}-**` : '***';
};

const REGIAO_FISCAL = {
  0: { regiao: 8, ufs: ['RS'] },
  1: { regiao: 1, ufs: ['DF', 'GO', 'MS', 'MT', 'TO'] },
  2: { regiao: 2, ufs: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR'] },
  3: { regiao: 3, ufs: ['CE', 'MA', 'PI'] },
  4: { regiao: 4, ufs: ['AL', 'PB', 'PE', 'RN'] },
  5: { regiao: 5, ufs: ['BA', 'SE'] },
  6: { regiao: 6, ufs: ['MG'] },
  7: { regiao: 7, ufs: ['ES', 'RJ'] },
  8: { regiao: 8, ufs: ['SP'] },
  9: { regiao: 9, ufs: ['PR', 'SC'] },
};
/** O 9º dígito do CPF indica a região fiscal de inscrição (informação oficial da RFB). */
export function regiaoFiscalDoCpf(valor) {
  const c = limpar(valor);
  if (c.length !== 11) return null;
  const r = REGIAO_FISCAL[Number(c[8])];
  return r ? { digito: Number(c[8]), regiaoFiscal: r.regiao, ufsPossiveis: r.ufs } : null;
}

/** Aceita dd/mm/aaaa ou aaaa-mm-dd. */
export function validarDataNascimento(valor, hoje = new Date()) {
  if (!valor) return { valido: false, informada: false };
  const s = String(valor).trim();
  let d; let m; let a;
  let t = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (t) [, d, m, a] = t;
  else {
    t = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (t) [, a, m, d] = t;
  }
  if (!t) return { valido: false, informada: true, motivo: 'Formato inválido (use dd/mm/aaaa)' };
  const dt = new Date(Date.UTC(Number(a), Number(m) - 1, Number(d)));
  if (dt.getUTCFullYear() !== Number(a) || dt.getUTCMonth() !== Number(m) - 1 || dt.getUTCDate() !== Number(d)) {
    return { valido: false, informada: true, motivo: 'Data inexistente' };
  }
  let idade = hoje.getUTCFullYear() - Number(a);
  if (hoje.getUTCMonth() + 1 < Number(m) || (hoje.getUTCMonth() + 1 === Number(m) && hoje.getUTCDate() < Number(d))) idade -= 1;
  if (idade < 0 || idade > 120) return { valido: false, informada: true, motivo: 'Data fora do intervalo plausível' };
  return { valido: true, informada: true, iso: `${a}-${m}-${d}`, br: `${d}/${m}/${a}`, idadeAnos: idade, maiorDeIdade: idade >= 18 };
}

export const normalizarNome = (n) =>
  String(n ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

/** Similaridade 0..1 por tokens (Jaccard sobre palavras com 2+ letras). */
export function similaridadeNomes(a, b) {
  const ta = new Set(normalizarNome(a).split(' ').filter((x) => x.length > 1));
  const tb = new Set(normalizarNome(b).split(' ').filter((x) => x.length > 1));
  if (!ta.size || !tb.size) return 0;
  let comuns = 0;
  ta.forEach((x) => { if (tb.has(x)) comuns += 1; });
  return comuns / (ta.size + tb.size - comuns);
}

/** Prestação (tabela Price). taxaMes em fração (0.0199 = 1,99% a.m.). */
export function prestacaoPrice(valor, taxaMes, prazo) {
  if (!(valor > 0) || !(prazo > 0)) return 0;
  if (!taxaMes) return valor / prazo;
  const f = (1 + taxaMes) ** prazo;
  return (valor * taxaMes * f) / (f - 1);
}
/** Valor máximo financiável dado o teto de prestação. */
export function valorMaximoPorPrestacao(prestacao, taxaMes, prazo) {
  if (!(prestacao > 0) || !(prazo > 0)) return 0;
  if (!taxaMes) return prestacao * prazo;
  const f = (1 + taxaMes) ** prazo;
  return (prestacao * (f - 1)) / (taxaMes * f);
}

const arred = (n) => Math.round(n * 100) / 100;

/**
 * Capacidade de pagamento. Valores em reais; os tetos são parâmetros internos
 * (padrão: prestação ≤ 30% da renda e endividamento total ≤ 50%).
 */
export function calcularCapacidade({ renda, compromissos = 0, valor, prazo, taxaMes, tetoPrestacao = 0.3, tetoEndividamento = 0.5 }) {
  const r = Number(renda);
  if (!(r > 0)) return { calculado: false, motivo: 'Informe a renda mensal comprovada para calcular a capacidade' };
  const comp = Math.max(0, Number(compromissos) || 0);
  const parametros = { tetoPrestacao, tetoEndividamento };
  const out = { calculado: true, rendaMensal: arred(r), compromissosMensais: arred(comp), parametros };
  const prazoN = Number(prazo) || 0;
  const taxa = Number(taxaMes) || 0;
  const prestacaoMax = Math.max(0, Math.min(r * tetoPrestacao, r * tetoEndividamento - comp));
  out.prestacaoMaximaPermitida = arred(prestacaoMax);
  if (prazoN > 0) out.valorMaximoFinanciavel = arred(valorMaximoPorPrestacao(prestacaoMax, taxa, prazoN));
  if (Number(valor) > 0 && prazoN > 0) {
    const p = prestacaoPrice(Number(valor), taxa, prazoN);
    const comprometimentoPrestacao = p / r;
    const endividamentoTotal = (p + comp) / r;
    out.operacao = { valor: arred(Number(valor)), prazoMeses: prazoN, taxaMes: taxa, sistema: 'PRICE', prestacao: arred(p) };
    out.comprometimentoPrestacao = Number(comprometimentoPrestacao.toFixed(4));
    out.endividamentoTotal = Number(endividamentoTotal.toFixed(4));
    out.dentroDoLimite = comprometimentoPrestacao <= tetoPrestacao && endividamentoTotal <= tetoEndividamento;
    out.alertas = [];
    if (comprometimentoPrestacao > tetoPrestacao) out.alertas.push(`Prestação compromete ${(comprometimentoPrestacao * 100).toFixed(1)}% da renda (teto interno ${(tetoPrestacao * 100).toFixed(0)}%).`);
    if (endividamentoTotal > tetoEndividamento) out.alertas.push(`Endividamento total de ${(endividamentoTotal * 100).toFixed(1)}% da renda (teto interno ${(tetoEndividamento * 100).toFixed(0)}%).`);
  }
  return out;
}
