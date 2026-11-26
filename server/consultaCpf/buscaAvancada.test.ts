// @ts-nocheck
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { executarBuscaAvancada, buscarCnpjBrasilApi } from './buscaAvancadaMotor.js';

test('busca avançada: busca de CNPJ na BrasilAPI', async () => {
  const dados = await buscarCnpjBrasilApi('15009178000170');
  assert.ok(dados, 'deve retornar dados para UISA');
  assert.equal(dados.cnpj, '15009178000170');
  assert.ok(dados.capital_social > 0);
  assert.ok(Array.isArray(dados.qsa));
});

test('busca avançada: executa varredura com enriquecimento e perfis', async () => {
  const resultado = await executarBuscaAvancada({
    documento: '30587162813',
    nome: 'RODRIGO RIBEIRO GONÇALVES',
    cidade: 'Mirante do Paranapanema',
    uf: 'SP',
    cnpjs: ['15009178000170', '64336577000151'],
  });

  assert.equal(resultado.sucesso, true);
  assert.ok(resultado.nomeAlvo.includes('RODRIGO'));
  assert.ok(resultado.tipoDocumento === 'CPF');
  assert.ok(resultado.resumoExecutivo.length > 50);
  assert.ok(resultado.consistenciaCadastral.score >= 50);
  assert.ok(Array.isArray(resultado.perfilSocial.redes));

  // Verifica que redes essenciais estão presentes
  const nomesRedes = resultado.perfilSocial.redes.map((r) => r.rede);
  assert.ok(nomesRedes.includes('LinkedIn'), 'deve conter LinkedIn');
  assert.ok(nomesRedes.includes('Instagram'), 'deve conter Instagram');
  assert.ok(nomesRedes.includes('TikTok'), 'deve conter TikTok');

  // Verifica perfil econômico com empresas
  assert.ok(resultado.perfilEconomico.totalEmpresasVinculadas >= 2);
  assert.ok(resultado.perfilEconomico.capitalSocialConsolidado > 0);
  assert.ok(Array.isArray(resultado.perfilEconomico.empresas));

  // Verifica que não inventa informações e possui disclaimer
  assert.ok(resultado.avisoLegalLgpd.includes('LGPD'));
});
