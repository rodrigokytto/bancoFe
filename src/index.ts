// Core Bancário & Livro Razão
export * from './core/ledger/types';
export * from './core/ledger/accounts';
export * from './core/ledger/ledger.engine';
export * from './core/domain/types';

// Módulo Central de Integrações
export * from './integrations/types';
export * from './integrations/registry';
export * from './integrations/event-bus';

// Git Abertos & Padrões
export * from './integrations/git-abertos/pix/brcode.generator';
export * from './integrations/git-abertos/pix/dict.adapter';
export * from './integrations/git-abertos/pix/pix.adapter';
export * from './integrations/git-abertos/boletos-cnab/febraban.engine';
export * from './integrations/git-abertos/boletos-cnab/cnab240.parser';
export * from './integrations/git-abertos/boletos-cnab/boleto.adapter';
export * from './integrations/git-abertos/open-finance/open-finance.adapter';
export * from './integrations/git-abertos/gateways/gateways.adapter';
export * from './integrations/git-abertos/bureau-credito/bureau.adapter';
export * from './integrations/git-abertos/agro-finance/agro.adapter';
export * from './integrations/git-abertos/web3-drex/drex.adapter';

// Protocolo MCP
export * from './integrations/mcps/server/tools';
export * from './integrations/mcps/server/mcp.server';
export * from './integrations/mcps/clients/hub';

// Skills de IA
export * from './integrations/skills/engine';
export * from './integrations/skills/adapters/finance-pro.skill';
export * from './integrations/skills/adapters/automation.skill';
export * from './integrations/skills/adapters/office-docs.skill';
export * from './integrations/skills/adapters/keyuser.skill';
export * from './integrations/skills/adapters/stock-analysis.skill';

// Consulta 360, Bureaus & Casanova Kytto
export * from './config';
export * from './servico';
export * from './modulo';
export * from './tipos';
export * from './validador-integracoes';
export * from './servidor';

// Compliance Ambiental & SICAR ESG
export * from './compliance/sicar-compliance-ambiental';

// Motores de Crédito, SCR Bacen & Cartórios
export * from './credito/scr-registrato-analitico';
export * from './credito/cartorios-protestos-onr';
export * from './credito/mesa-credito-algoritmica';

// Pré-Cadastro 360 & Onboarding Bancário
export * from './precadastro/tipos-precadastro';
export * from './precadastro/servico-precadastro';

// Radar Preditivo & Base Potencial de Clientes
export * from './clientes/clientes-prequalificados';
export * from './clientes/radar-prospeccao';
export * from './clientes/base-empresas-tga';

// Gestão Administrativa de Módulos por Negócio (/admin)
export * from './admin/gestor-modulos-negocio';
