# Consulta CPF completa e Módulo Único de Integrações (BancoFe)

Rotas SPA: `/admin/consulta-cpf` (também `/consulta-cpf`) e `/admin/hub-integracoes`.
Menu: seção "BancoFé Core Bancário & Liquidação" (itens "Consulta CPF Completa" e "Integrações (Módulo Único)").

API (exige sessão): `/api/admin/consulta-cpf/{finalidades,consultar,historico,:id}` e
`/api/admin/hub-integracoes/{catalogo,:id/testar,:id/unidade,unidade/habilitar-recomendadas}`.

Catálogo: 77 integrações em 12 categorias (ERP, Consulta360, Imob Fácil, BancoFe git/MCP/skills). Cada fonte informa o
status real: `consultada`, `aguardando credencial`, `planejada`. Nada é simulado.

Credenciais (somente variáveis de ambiente / Secret Manager no Cloud Run):
`INFOSIMPLES_TOKEN` (Receita/PGFN), `TRANSPARENCIA_API_KEY` (CGU: CEIS/CNEP/PEP/CEAF), `DATAJUD_API_KEY`, `GEMINI_API_KEY`,
`CONSULTA_CPF_RETENCAO_DIAS` (padrão 90), `CONSULTA_CPF_TIMEOUT_MS`, `CONSULTA_CPF_CACHE_MS`.

Uso específico: unidades `bancofe`, `bancofe_credito` e `operacoes_financeiras_crm` (Operações Financeiras & CRM 360°).
Persistência: `data/consulta-cpf-hub.json` (histórico com CPF mascarado, retenção de 90 dias — LGPD).
Código: `server/consultaCpf/*`, `server/consultaCpfHub.ts`, `client/src/pages/hub/*`, `client/src/lib/hubApi.ts`.
Testes: `npx vitest run server/consultaCpf`.
