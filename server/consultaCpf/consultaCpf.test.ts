// @ts-nocheck
import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  validarCpf, validarCnpj, mascararCpf, regiaoFiscalDoCpf, validarDataNascimento, similaridadeNomes, calcularCapacidade,
} from './validadores.js';
import { CATALOGO, CATALOGO_POR_ID, CATEGORIAS } from './catalogo.js';
import { consultar, limparCache, listarCatalogo, testarIntegracao } from './motor.js';

const CPF_OK = '52998224725'; // CPF válido de teste (algoritmo)

test('validadores: CPF/CNPJ e máscara', () => {
  assert.equal(validarCpf(CPF_OK).valido, true);
  assert.equal(validarCpf('11111111111').valido, false);
  assert.equal(validarCpf('52998224726').valido, false);
  assert.equal(validarCnpj('00000000000191').valido, true);
  assert.equal(validarCnpj('00000000000192').valido, false);
  assert.equal(mascararCpf(CPF_OK).includes('998'), false);
  assert.equal(regiaoFiscalDoCpf(CPF_OK).regiaoFiscal, 7);
});

test('validadores: nascimento, nomes e capacidade', () => {
  const n = validarDataNascimento('15/03/1985', new Date('2026-11-23T00:00:00Z'));
  assert.equal(n.valido, true);
  assert.equal(n.idadeAnos, 41);
  assert.equal(validarDataNascimento('31/02/2000').valido, false);
  assert.ok(similaridadeNomes('Maria da Silva', 'MARIA SILVA') > 0.6);
  const c = calcularCapacidade({ renda: 10000, compromissos: 1000, valor: 100000, prazo: 120, taxaMes: 0.01 });
  assert.equal(c.calculado, true);
  assert.ok(c.prestacaoMaximaPermitida <= 3000);
  assert.equal(c.dentroDoLimite, c.comprometimentoPrestacao <= 0.3);
});

test('catálogo: ids únicos, categorias válidas, integrações reais com origem', () => {
  assert.equal(new Set(CATALOGO.map((i) => i.id)).size, CATALOGO.length);
  const cats = new Set(CATEGORIAS.map((c) => c.id));
  for (const i of CATALOGO) assert.ok(cats.has(i.categoria), `${i.id}: categoria inválida`);
  assert.ok(CATALOGO.length >= 55, `catálogo com ${CATALOGO.length} itens`);
  for (const i of CATALOGO.filter((x) => x.integrado && x.tipo === 'credencial')) assert.ok(i.envVars.length, `${i.id} sem envVars`);
});

test('hub: status honesto por credencial', () => {
  delete process.env.INFOSIMPLES_TOKEN;
  let r = listarCatalogo().find((i) => i.id === 'receita-cpf');
  assert.equal(r.status, 'aguardando_credencial');
  assert.deepEqual(r.variaveisFaltando, ['INFOSIMPLES_TOKEN']);
  process.env.INFOSIMPLES_TOKEN = 'x';
  r = listarCatalogo().find((i) => i.id === 'receita-cpf');
  assert.equal(r.status, 'ativa');
  delete process.env.INFOSIMPLES_TOKEN;
  assert.equal(listarCatalogo().find((i) => i.id === 'serasa').status, 'planejada');
});

test('consulta: exige CPF válido, finalidade e consentimento', async () => {
  const r = await consultar({ cpf: '123' });
  assert.equal(r.erro, true);
  assert.ok(r.erros.length >= 3);
});

function fetchFalso(rotas) {
  return async (url, opts = {}) => {
    for (const [padrao, resp] of rotas) {
      if (url.includes(padrao)) {
        const corpo = typeof resp === 'function' ? resp(url, opts) : resp;
        return { ok: corpo.status ? corpo.status < 400 : true, status: corpo.status || 200, text: async () => JSON.stringify(corpo.json ?? corpo) };
      }
    }
    return { ok: false, status: 404, text: async () => '{}' };
  };
}

test('consulta: sem credenciais as fontes ficam "aguardando", sem dado inventado', async () => {
  limparCache();
  delete process.env.INFOSIMPLES_TOKEN; delete process.env.TRANSPARENCIA_API_KEY;
  const fetchImpl = fetchFalso([
    ['bcdata.sgs.432', { json: [{ data: '01/11/2026', valor: '14.50' }] }],
    ['bcdata.sgs.', { json: [{ data: '01/11/2026', valor: '0.40' }] }],
  ]);
  const d = await consultar({ cpf: CPF_OK, nome: 'Fulano', finalidade: 'analise_credito', consentimento: true, renda: 10000, valor: 200000, prazo: 120 }, { fetchImpl, semCache: true });
  assert.equal(d.erro, undefined);
  const por = Object.fromEntries(d.fontes.map((f) => [f.id, f]));
  assert.equal(por['receita-cpf'].status, 'nao_configurada');
  assert.equal(por['cgu-ceis'].status, 'nao_configurada');
  assert.equal(por['validacao-cpf-cnpj'].status, 'consultada');
  assert.equal(por['bcb-sgs'].status, 'consultada');
  assert.equal(por.serasa.status, 'planejada');
  assert.equal(por['capacidade-pagamento'].status, 'consultada');
  assert.equal(por['capacidade-pagamento'].dados.operacao.prazoMeses, 120);
  assert.ok(d.cobertura.percentual < 60);
  assert.match(d.recomendacao, /Cobertura parcial/);
  assert.equal(d.cpfMascarado, mascararCpf(CPF_OK));
});

test('consulta: Receita + CGU + sócio por CPF mascarado', async () => {
  limparCache();
  process.env.INFOSIMPLES_TOKEN = 't'; process.env.TRANSPARENCIA_API_KEY = 'k';
  const meio = CPF_OK.slice(3, 9);
  const fetchImpl = fetchFalso([
    ['receita-federal/cpf', { json: { code: 200, data: [{ nome: 'FULANO DE TAL', situacao_cadastral: 'REGULAR', data_inscricao: '01/01/2000' }] } }],
    ['receita-federal/pgfn', { json: { code: 200, data: [{ conseguiu_emitir_certidao_negativa: false, situacao: 'positiva' }] } }],
    ['/ceis', { json: [{ id: 1 }] }],
    ['/cnep', { json: [] }], ['/peps', { json: [] }], ['/ceaf', { json: [] }],
    ['cnpj/v1/00000000000191', { json: { razao_social: 'ACME', descricao_situacao_cadastral: 'ATIVA', qsa: [{ nome_socio: 'FULANO DE TAL', cnpj_cpf_do_socio: `***${meio}**`, qualificacao_socio: 'Sócio-Administrador' }] } }],
    ['cep/v2/78000000', { json: { cep: '78000000', city: 'Cuiabá', state: 'MT', street: 'Rua A', neighborhood: 'Centro' } }],
    ['bcdata.sgs.', { json: [{ data: '01/11/2026', valor: '1.00' }] }],
  ]);
  const d = await consultar({ cpf: CPF_OK, nome: 'Fulano de Tal', nascimento: '10/05/1980', cep: '78000-000', cnpjs: '00.000.000/0001-91', finalidade: 'pld_kyc', consentimento: true }, { fetchImpl, semCache: true });
  const por = Object.fromEntries(d.fontes.map((f) => [f.id, f]));
  assert.equal(por['receita-cpf'].dados.situacaoCadastral, 'REGULAR');
  assert.equal(por['brasilapi-cnpj'].dados.empresas[0].vinculo, 'confirmado');
  assert.equal(por['cgu-ceis'].dados.ceis.ocorrencias, 1);
  assert.equal(d.nivelAlerta, 'critico');
  assert.ok(d.achados.some((a) => a.codigo === 'PGFN_DEBITOS'));
  delete process.env.INFOSIMPLES_TOKEN; delete process.env.TRANSPARENCIA_API_KEY;
});

test('hub: teste de conexão de integração planejada não finge sucesso', async () => {
  const r = await testarIntegracao('serasa');
  assert.equal(r.status, 'nao_aplicavel');
  assert.ok(CATALOGO_POR_ID.has('serasa'));
});
