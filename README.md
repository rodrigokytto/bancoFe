# BancoFe — Ecossistema Corporativo Multi-Negócio & ERP 360°

Plataforma unificada de alta performance para operação bancária, financeira, fiscal e operacional multi-tenant do ecossistema **BancoFe**, abrangendo unidades de negócio de Open Finance & Banking Digital, Gastronomia Oriental (Zuma Restaurante), Varejo & Moda (Zuma Moda), Agronegócio & Grãos (Zuma Agro & Safra MT) e Controladoria Geral (Holding Kytto).

---

## 🚀 Ambientes em Produção (PRD)

- **Produção Direta Ativa (Manus Sandbox/Cloud):** [https://3000-i0pp7ucmynez9klfyccs3-31683a88.us5.manus.computer/bancofe](https://3000-i0pp7ucmynez9klfyccs3-31683a88.us5.manus.computer/bancofe)
- **Google Cloud Run (Produção GCP):** [https://erp-bancofe-5xsi5uyoda-rj.a.run.app](https://erp-bancofe-5xsi5uyoda-rj.a.run.app)
- **Google Cloud Run (URL Direta da Revisão):** [https://erp-bancofe-243135142712.southamerica-east1.run.app](https://erp-bancofe-243135142712.southamerica-east1.run.app)
- **Painel Administrativo de Módulos por Negócio:** [https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin](https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin)
- **Credenciais de Acesso Administrativo:** fornecidas por canal seguro (Secret Manager do GCP). Nunca versionar senhas neste repositório.
- **Status de Segurança & Acesso:**
  - Google Cloud IAP desativado com acesso público irrestrito e direto (resolvido Error Code 11).
  - Banco de Dados PostgreSQL Cloud SQL (`bancofe-pg`) ativo e sincronizado.
- **GCP Project:** `bancofe-plataforma-kytto` | **Região:** `southamerica-east1` (São Paulo) | **Serviço Cloud Run:** `erp-bancofe`
- **Ambiente Alternativo / Pilot:** [https://zuma-x2gtmiiwkq-rj.a.run.app](https://zuma-x2gtmiiwkq-rj.a.run.app)
- **Domínio Corporativo:** [https://bancofe.kytto.com.br](https://bancofe.kytto.com.br) / [https://zuma.kytto.com.br](https://zuma.kytto.com.br)

---

## 🏛️ Gestão Dinâmica de Módulos por Negócio (`/admin`)

O painel `/admin` (ou `/admin/modulos`) permite que a administração configure o catálogo operacional de cada empresa do grupo de forma independente e multi-tenant:

### Funcionalidades do Painel `/admin`:
1. **Alternância Instantânea de Negócios:**
   - Selecione qualquer unidade cadastrada (**BancoFe Open Finance**, **Zuma Gastronomia**, **Zuma Moda**, **Zuma Agro MT**, **Holding Kytto**) com um clique.
   - O cabeçalho, os cartões de estatísticas e a sidebar atualizam instantaneamente.

2. **Adicionar Módulos Customizados (`+ Adicionar Módulo`):**
   - Modal com **Live Preview em tempo real** do item como ele aparecerá no menu e sidebar.
   - Definição de **Nome do Módulo**, **Identificador Slug** único e **Descrição operacional**.
   - Definição da **Rota Padrão ao Clicar** (ex.: `/pdv`, `/erp`, `/agro`, `/zumi`, etc.).
   - Seletor visual de ícones da biblioteca **Lucide Icons** (com busca em tempo real).
   - Configuração de **Badges de Destaque** (ex.: *NOVO*, *BETA*, *TEMPO REAL*, *SAFRA*) com paletas de cores temáticas (Azul Financeiro, Esmeralda Ativo, Âmbar Executivo, Roxo Zumi IA, Laranja Safra, etc.).
   - Controle de **Nível de Permissão** (*Todos os Usuários*, *Apenas Gerentes*, *Apenas Admin*).
   - Vinculação de **Domínios & Submódulos** na sidebar (ex.: Frente de Loja, KDS, Estoque, CRM, etc.).

3. **Modificar Módulos Existentes (`Modificar`):**
   - Edição de qualquer campo do módulo com pré-visualização instantânea.
   - Atualização imediata no frontend e sincronização persistente com o backend via tRPC.

4. **Excluir Módulos (`Excluir`):**
   - Modal de confirmação segura com aviso do impacto operacional.
   - Remoção com segurança ou opção alternativa de apenas desativar o módulo.

5. **Ligar/Desligar Módulo com 1 Clique (Toggle Switch):**
   - Oculta ou exibe o módulo imediatamente na navegação da sidebar sem necessidade de excluí-lo.

6. **Reordenação de Módulos (▲/▼):**
   - Altere a ordem de exibição dos módulos no menu com um clique, salvando a hierarquia.

7. **Cadastrar Novos Negócios (`+ Novo Negócio`):**
   - Crie novas unidades de negócio ou empresas do grupo informando Nome, Slug, CNPJ, Categoria e Descrição.

8. **Persistência Confiável & Backup:**
   - Persistência no servidor em `data/businessModulesConfig.json` com cache inteligente no cliente (`localStorage`) e rotinas de reset para padrões de fábrica (`Restaurar Padrão`).

---

## 🏢 Unidades de Negócio Nativas Pré-Configuradas

| Unidade de Negócio | Categoria | Módulos Padrão Nativos |
| :--- | :--- | :--- |
| **BancoFe — Open Finance & Banking** | Fintech | Open Finance & Pix, Ledger & Contabilidade Dupla, Bureau de Crédito & Score, Febraban Boletos & CNAB, Web3 Drex & Custódia, IA Copilot Financeiro |
| **Zuma Cozinha Oriental & Gastronomia** | Gastronomia | Operação & Salão (PDV/KDS/Mesas), Vendas & Atendimento (CRM Zumi), Comando & Estratégia, ERP Kytto & Backoffice, Tecnologia & Plataforma |
| **Zuma Moda, Roupas & Estilo** | Boutique | Vitrine & Catálogo Online, Ponto de Venda & Provador, Estoque de Coleções & Grade, Fidelidade & Cashback Clientes |
| **Zuma Agro & Safra MT** | Agro MT | Safras & Produtividade MT, Contratos Futuros & Barter, Maquinários, Tratores & Frotas |
| **Holding Kytto & Concreto** | Holding | Controladoria & DRE Consolidado, Auditoria & Compliance Fiscal, Expansão, M&A & Investimentos |

---

## 🍱 Arquitetura & Stack Tecnológica

- **Frontend:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, Wouter v3, Lucide React, Sonner (Toasts), Radix UI.
- **Backend:** Node.js 22, Express, tRPC v11, Drizzle ORM, Store de Negócios Persistente (`server/businessModuleStore.ts`).
- **Comunicação:** tRPC Type-Safe com procedimentos `admin.*` (`getBusinesses`, `saveBusiness`, `deleteBusiness`, `getModules`, `saveModule`, `deleteModule`, `toggleModule`, `reorderModules`, `resetToDefault`).
- **Cloud & DevOps:** Google Cloud Run, Google Artifact Registry, Google Cloud Build (CI/CD contínuo em push na `main`), Docker multi-stage.

---

## 🐳 Deploy no Google Cloud Platform (Cloud Run)

O projeto está configurado para deploy automático no Cloud Run sob o serviço `erp-bancofe`:

```bash
# 1. Definir projeto e serviço no GCP
gcloud config set project zuma-kytto

# 2. Executar script de deploy automatizado
chmod +x deploy_gcp.sh
./deploy_gcp.sh
```

Ou via Google Cloud Build:
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

---

## 🛠️ Comandos de Desenvolvimento Local

```bash
# 1. Instalar dependências
pnpm install

# 2. Executar testes unitários do Admin
pnpm exec vitest run server/adminModulos.test.ts

# 3. Compilar para produção
pnpm build

# 4. Iniciar servidor em desenvolvimento
pnpm dev
```
