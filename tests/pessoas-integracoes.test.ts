import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CATALOGO_POR_ID } from '../server/consultaCpf/catalogo.js';
import { statusDaIntegracao, testarIntegracao, consultar, limparCache } from '../server/consultaCpf/motor.js';
import fs from 'node:fs';
import path from 'node:path';

describe('Integrações do Anexo Hub de Integrações (JUCEMAT, CAGED, INSS/Dataprev e TSE)', () => {
  const origEnv = { ...process.env };

  beforeAll(() => {
    process.env.JUCEMAT_TOKEN = 'JUCEMAT_REDESIM_PROD_API_KEY_51';
    process.env.CAGED_TOKEN = 'MTE_CAGED_EMPREGOS_API_V2';
    process.env.DATAPREV_TOKEN = 'DATAPREV_INSS_CONSIGNADO_AUTH_V3';
  });

  afterAll(() => {
    process.env = origEnv;
  });

  describe('1. JUCEMAT e REDESIM (Registro Empresarial e Viabilidade)', () => {
    it('deve estar catalogada como integrada e ativa com token configurado', () => {
      const item = CATALOGO_POR_ID.get('jucemat-redesim');
      expect(item).toBeDefined();
      expect(item.integrado).toBe(true);
      expect(item.teste).toBe('jucemat-redesim');
      expect(item.envVars).toContain('JUCEMAT_TOKEN');

      const status = statusDaIntegracao(item, { unidades: ['bancofe', 'bancofe_credito'] });
      expect(status.status).toBe('ativa');
      expect(status.credencialConfigurada).toBe(true);
      expect(status.variaveisFaltando).toEqual([]);
      expect(status.habilitadaNasUnidades).toContain('bancofe');
    });

    it('deve mudar status honestamente para aguardando_credencial se JUCEMAT_TOKEN for removido', () => {
      const item = CATALOGO_POR_ID.get('jucemat-redesim');
      delete process.env.JUCEMAT_TOKEN;
      const status = statusDaIntegracao(item, {});
      expect(status.status).toBe('aguardando_credencial');
      expect(status.variaveisFaltando).toContain('JUCEMAT_TOKEN');
      process.env.JUCEMAT_TOKEN = 'JUCEMAT_REDESIM_PROD_API_KEY_51';
    });

    it('deve testar a conexão com sucesso via testarIntegracao', async () => {
      const res = await testarIntegracao('jucemat-redesim');
      expect(res.status).toBe('consultada');
      expect(res.resumo).toContain('JUCEMAT / REDESIM MT conectado');
      expect(res.detalhes?.sistemaIntegrador).toBe('REDESIM Integrador Estadual MT');
    });
  });

  describe('2. CAGED · Vínculo Empregatício (MTE / eSocial)', () => {
    it('deve estar catalogada como integrada e ativa com token configurado', () => {
      const item = CATALOGO_POR_ID.get('caged-mte');
      expect(item).toBeDefined();
      expect(item.integrado).toBe(true);
      expect(item.teste).toBe('caged-mte');
      expect(item.envVars).toContain('CAGED_TOKEN');

      const status = statusDaIntegracao(item, { unidades: ['bancofe'] });
      expect(status.status).toBe('ativa');
      expect(status.credencialConfigurada).toBe(true);
    });

    it('deve mudar status para aguardando_credencial se CAGED_TOKEN for removido', () => {
      const item = CATALOGO_POR_ID.get('caged-mte');
      delete process.env.CAGED_TOKEN;
      const status = statusDaIntegracao(item, {});
      expect(status.status).toBe('aguardando_credencial');
      expect(status.variaveisFaltando).toContain('CAGED_TOKEN');
      process.env.CAGED_TOKEN = 'MTE_CAGED_EMPREGOS_API_V2';
    });

    it('deve testar a conexão com sucesso via testarIntegracao', async () => {
      const res = await testarIntegracao('caged-mte');
      expect(res.status).toBe('consultada');
      expect(res.resumo).toContain('API CAGED / Ministério do Trabalho e Emprego autenticada');
      expect(res.detalhes?.base).toContain('Novo CAGED');
    });
  });

  describe('3. INSS / Dataprev (Benefícios e Margem Consignável de 35%)', () => {
    it('deve estar catalogada como integrada e ativa com token configurado', () => {
      const item = CATALOGO_POR_ID.get('inss-dataprev');
      expect(item).toBeDefined();
      expect(item.integrado).toBe(true);
      expect(item.teste).toBe('inss-dataprev');
      expect(item.envVars).toContain('DATAPREV_TOKEN');

      const status = statusDaIntegracao(item, { unidades: ['bancofe'] });
      expect(status.status).toBe('ativa');
      expect(status.credencialConfigurada).toBe(true);
    });

    it('deve mudar status para aguardando_credencial se DATAPREV_TOKEN for removido', () => {
      const item = CATALOGO_POR_ID.get('inss-dataprev');
      delete process.env.DATAPREV_TOKEN;
      const status = statusDaIntegracao(item, {});
      expect(status.status).toBe('aguardando_credencial');
      expect(status.variaveisFaltando).toContain('DATAPREV_TOKEN');
      process.env.DATAPREV_TOKEN = 'DATAPREV_INSS_CONSIGNADO_AUTH_V3';
    });

    it('deve testar a conexão com sucesso via testarIntegracao', async () => {
      const res = await testarIntegracao('inss-dataprev');
      expect(res.status).toBe('consultada');
      expect(res.resumo).toContain('Dataprev Conecta / INSS autenticado');
      expect(res.detalhes?.margemConsignavelRegulamentar).toContain('35% Empréstimo');
    });
  });

  describe('4. TSE · Quitação Eleitoral', () => {
    it('deve estar catalogada como integrada, pública e gratuita', () => {
      const item = CATALOGO_POR_ID.get('tse-quitacao');
      expect(item).toBeDefined();
      expect(item.integrado).toBe(true);
      expect(item.tipo).toBe('publica');
      expect(item.custo).toBe('gratuito');
      expect(item.teste).toBe('tse-quitacao');

      const status = statusDaIntegracao(item, { unidades: ['bancofe'] });
      expect(status.status).toBe('ativa');
    });

    it('deve testar a conexão com sucesso via testarIntegracao', async () => {
      const res = await testarIntegracao('tse-quitacao');
      expect(res.status).toBe('consultada');
      expect(res.resumo).toContain('Serviço de Quitação Eleitoral do TSE online');
      expect(res.detalhes?.validadePadraoDias).toBe(90);
    });
  });

  describe('5. Execução no Motor de Consulta CPF / CNPJ', () => {
    it('deve executar todas as 4 fontes em consulta CPF de titular', async () => {
      limparCache();
      const res = await consultar({
        cpf: '305.871.628-13',
        nome: 'Rodrigo Ribeiro Gonçalves',
        nascimento: '10/05/1985',
        cep: '78300-000',
        cnpjs: '30.680.829/0001-43',
        renda: 18500,
        finalidade: 'analise_credito',
        consentimento: true,
      }, { semCache: true });

      expect(res.erro).toBeUndefined();
      const fontes = Object.fromEntries(res.fontes.map((f: any) => [f.id, f]));

      // 1. JUCEMAT
      const jucemat = fontes['jucemat-redesim'];
      expect(jucemat).toBeDefined();
      expect(jucemat.status).toBe('consultada');
      expect(jucemat.dados.empresas.length).toBeGreaterThan(0);
      expect(jucemat.dados.empresas[0].nire).toMatch(/^51-2-/);
      expect(jucemat.dados.empresas[0].protocoloRedesim).toContain('REDESIM-MT-2026');
      expect(jucemat.dados.empresas[0].viabilidadeCadastral).toBe('APROVADA');

      // 2. CAGED / MTE
      const caged = fontes['caged-mte'];
      expect(caged).toBeDefined();
      expect(caged.status).toBe('consultada');
      expect(caged.dados.possuiVinculoAtivo).toBe(true);
      expect(caged.dados.vinculos[0].cargo).toContain('Diretor');
      expect(caged.dados.vinculos[0].cbo).toContain('1210-10');
      expect(caged.dados.remuneracaoTotalComprovada).toBe(18500);

      // 3. INSS / Dataprev
      const inss = fontes['inss-dataprev'];
      expect(inss).toBeDefined();
      expect(inss.status).toBe('consultada');
      expect(inss.dados.fonteOficial).toBe('INSS_DATAPREV_PREVIDENCIA');

      // 4. TSE Quitação Eleitoral
      const tse = fontes['tse-quitacao'];
      expect(tse).toBeDefined();
      expect(tse.status).toBe('consultada');
      expect(tse.dados.situacaoEleitoral).toBe('REGULAR');
      expect(tse.dados.quitacaoEleitoralValida).toBe(true);
      expect(tse.dados.numeroTituloEleitor.length).toBe(12);
      expect(tse.dados.numeroCertidaoQuitacao).toContain('TSE-');
      expect(tse.dados.aptoLavraturaEscrituraImobiliaria).toBe(true);
    });

    it('deve calcular margem consignável legal de 35% no INSS para beneficiário', async () => {
      limparCache();
      const res = await consultar({
        cpf: '52998224725', // CPF válido com final 25
        nome: 'Segurado Aposentado Previdência',
        nascimento: '15/03/1955',
        finalidade: 'analise_credito',
        consentimento: true,
      }, { semCache: true });

      const inss = res.fontes.find((f: any) => f.id === 'inss-dataprev');
      expect(inss.status).toBe('consultada');
      expect(inss.dados.possuiBeneficioAtivo).toBe(true);
      expect(inss.dados.margemConsignavelTotal35).toBe(1792.00); // 35% de 5120
      expect(inss.dados.margemCartaoTotal5).toBe(256.00); // 5% de 5120
      expect(inss.dados.estabilidadeRendaVitalicia).toBe('ESTAVEL_VITALICIA');
    });

    it('deve aplicar regras para CNPJ de forma transparente', async () => {
      limparCache();
      const res = await consultar({
        cpf: '30680829000143', // CNPJ
        finalidade: 'pld_kyc',
        consentimento: true,
      }, { semCache: true });

      expect(res.tipoDocumento).toBe('CNPJ');
      const fontes = Object.fromEntries(res.fontes.map((f: any) => [f.id, f]));

      expect(fontes['tse-quitacao'].status).toBe('nao_aplicavel');
      expect(fontes['inss-dataprev'].status).toBe('nao_aplicavel');
      expect(fontes['caged-mte'].status).toBe('consultada');
      expect(fontes['caged-mte'].dados.tipo).toBe('EMPREGADOR_PJ');
      expect(fontes['jucemat-redesim'].status).toBe('consultada');
      expect(fontes['jucemat-redesim'].dados.empresas.length).toBeGreaterThan(0);
    });
  });

  describe('6. Persistência no data/consulta-cpf-hub.json', () => {
    it('deve conter as 4 integrações configuradas com unidades e último teste válido', () => {
      const raw = fs.readFileSync(path.resolve(__dirname, '../data/consulta-cpf-hub.json'), 'utf-8');
      const hub = JSON.parse(raw);

      const chaves = ['jucemat-redesim', 'caged-mte', 'inss-dataprev', 'tse-quitacao'];
      for (const k of chaves) {
        expect(hub.integracoesHub[k]).toBeDefined();
        expect(hub.integracoesHub[k].unidades).toContain('bancofe');
        expect(hub.integracoesHub[k].ultimoTeste?.status).toBe('consultada');
        expect(hub.integracoesHub[k].ultimoTeste?.resumo).toBeTruthy();
      }
    });
  });
});
