/**
 * Rotas do Módulo Único de Integrações (hub) e da Consulta CPF completa — ERP Bancofe.
 *
 *   /api/admin/hub-integracoes/*   catálogo, status, teste de conexão, habilitação por unidade
 *   /api/admin/consulta-cpf/*      consulta, histórico e detalhe do dossiê
 *
 * Segredos jamais passam por aqui: o hub só informa se a variável de ambiente existe.
 * Os middlewares auth/requireStaff e a trilha de auditoria de mutações são aplicados em server.js.
 */
import { Router } from 'express';
import { CATEGORIAS, CATALOGO_POR_ID } from './catalogo.js';
import {
  FINALIDADES, consultar, resumirDossie, listarCatalogo, testarIntegracao,
} from './motor.js';
import { mascararCpf } from './validadores.js';

const RETENCAO_DIAS = Number(process.env.CONSULTA_CPF_RETENCAO_DIAS || 90);
const MAX_HISTORICO = 1000;
const SETORES_FINANCEIROS = new Set(['financeira']);

export function createIntegracoesHubRouter({ db, save, audit, obterEmpresaId, perfilDoUsuario, isPlatformAdmin = () => false }) {
  const hub = Router();
  const cpf = Router();

  const empresaDe = (req) => obterEmpresaId(req) || 'global';
  const ehAdmin = (req) => isPlatformAdmin(req) || perfilDoUsuario(req.user) === 'admin';

  const cfgHub = () => {
    const d = db();
    d.integracoesHub = d.integracoesHub || {};
    return d.integracoesHub;
  };

  /* ─────────────────────────── HUB ─────────────────────────── */
  hub.get('/catalogo', (req, res) => {
    const empresaId = empresaDe(req);
    const cfg = cfgHub();
    const itens = listarCatalogo(cfg).map((i) => ({ ...i, habilitadaNestaUnidade: (cfg[i.id]?.unidades || []).includes(empresaId) }));
    const porStatus = itens.reduce((a, i) => { a[i.status] = (a[i.status] || 0) + 1; return a; }, {});
    res.json({
      empresaId,
      categorias: CATEGORIAS,
      integracoes: itens,
      resumo: {
        total: itens.length,
        porStatus,
        recomendadasParaFinanceira: itens.filter((i) => i.recomendadaPara.includes('financeira')).length,
        habilitadasNestaUnidade: itens.filter((i) => i.habilitadaNestaUnidade).length,
      },
      aviso: 'Credenciais são configuradas como variáveis de ambiente (Secret Manager do Cloud Run). Este módulo nunca armazena nem exibe segredos.',
    });
  });

  hub.post('/:id/testar', async (req, res) => {
    const item = CATALOGO_POR_ID.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'integração não encontrada' });
    const r = await testarIntegracao(item.id);
    const cfg = cfgHub();
    cfg[item.id] = { ...(cfg[item.id] || {}), unidades: cfg[item.id]?.unidades || [], ultimoTeste: { status: r.status, resumo: r.resumo || r.motivo || null, em: new Date().toISOString(), por: req.user?.nome || null } };
    save();
    res.json({ id: item.id, ...r });
  });

  hub.put('/:id/unidade', (req, res) => {
    if (!ehAdmin(req)) return res.status(403).json({ error: 'somente administradores habilitam integrações' });
    const item = CATALOGO_POR_ID.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'integração não encontrada' });
    const empresaId = String(req.body?.empresaId || empresaDe(req));
    const habilitar = req.body?.habilitada !== false;
    const cfg = cfgHub();
    const atual = new Set(cfg[item.id]?.unidades || []);
    if (habilitar) atual.add(empresaId); else atual.delete(empresaId);
    cfg[item.id] = { ...(cfg[item.id] || {}), unidades: [...atual] };
    save();
    audit?.(req, 'hub-integracoes', `${habilitar ? 'habilitou' : 'desabilitou'} ${item.id} em ${empresaId}`);
    res.json({ id: item.id, empresaId, habilitada: habilitar, unidades: cfg[item.id].unidades });
  });

  hub.post('/unidade/habilitar-recomendadas', (req, res) => {
    if (!ehAdmin(req)) return res.status(403).json({ error: 'somente administradores habilitam integrações' });
    const empresaId = String(req.body?.empresaId || empresaDe(req));
    const cfg = cfgHub();
    let n = 0;
    for (const [id, item] of CATALOGO_POR_ID) {
      if (!item.recomendadaPara.includes('financeira')) continue;
      const set = new Set(cfg[id]?.unidades || []);
      if (!set.has(empresaId)) { set.add(empresaId); n += 1; }
      cfg[id] = { ...(cfg[id] || {}), unidades: [...set] };
    }
    save();
    audit?.(req, 'hub-integracoes', `habilitou ${n} integrações recomendadas (financeira) em ${empresaId}`);
    res.json({ empresaId, habilitadas: n });
  });

  /* ─────────────────────── CONSULTA CPF ─────────────────────── */
  cpf.use((req, res, next) => {
    if (perfilDoUsuario(req.user) === 'profissional') return res.status(403).json({ error: 'perfil sem acesso à consulta de CPF', code: 'PROFILE_RESTRICTED' });
    next();
  });

  cpf.get('/finalidades', (_req, res) => res.json({ finalidades: FINALIDADES, retencaoDias: RETENCAO_DIAS }));

  cpf.post('/consultar', async (req, res) => {
    const empresaId = empresaDe(req);
    const dossie = await consultar(req.body || {}, { empresaId, semCache: req.body?.atualizar === true });
    if (dossie.erro) return res.status(400).json({ error: dossie.erros.join(' '), erros: dossie.erros });

    const d = db();
    d.consultasCpf = d.consultasCpf || [];
    const corte = Date.now() - RETENCAO_DIAS * 86400000;
    d.consultasCpf = d.consultasCpf.filter((c) => new Date(c.criadoEm).getTime() > corte);

    // Minimização (LGPD): o histórico guarda o CPF mascarado e não guarda filiação/renda crua.
    const registro = {
      ...dossie,
      empresaId,
      usuario: req.user?.nome || null,
      cpf: undefined,
      entrada: { ...dossie.entrada, cpf: mascararCpf(dossie.cpf), nomeMae: dossie.entrada.nomeMae ? '[informada]' : null },
    };
    delete registro.cache;
    if (!d.consultasCpf.some((c) => c.id === registro.id)) {
      d.consultasCpf.push(registro);
      if (d.consultasCpf.length > MAX_HISTORICO) d.consultasCpf = d.consultasCpf.slice(-MAX_HISTORICO);
      save();
    }
    audit?.(req, 'consulta-cpf', `CPF ${dossie.cpfMascarado} · finalidade ${dossie.finalidade} · empresa ${empresaId} · cobertura ${dossie.cobertura.percentual}%`);
    // Resposta ao operador: CPF completo apenas na resposta imediata
    res.json(dossie);
  });

  cpf.get('/historico', (req, res) => {
    const empresaId = empresaDe(req);
    const lista = (db().consultasCpf || [])
      .filter((c) => ehAdmin(req) && req.query.todas === '1' ? true : c.empresaId === empresaId)
      .slice(-100).reverse().map(resumirDossie);
    res.json({ consultas: lista, retencaoDias: RETENCAO_DIAS });
  });

  cpf.get('/:id', (req, res) => {
    const empresaId = empresaDe(req);
    const c = (db().consultasCpf || []).find((x) => x.id === req.params.id);
    if (!c || (c.empresaId !== empresaId && !ehAdmin(req))) return res.status(404).json({ error: 'consulta não encontrada' });
    audit?.(req, 'consulta-cpf', `reabriu dossiê ${c.cpfMascarado}`);
    res.json(c);
  });

  return { hub, consultaCpf: cpf };
}

export { SETORES_FINANCEIROS };
