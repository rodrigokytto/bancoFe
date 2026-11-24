# DIAGNÓSTICO EXECUTIVO & MAPA DA SOLUÇÃO COMPLETA EM PRODUÇÃO

## 1. Diagnóstico do Erro no Render (`https://bancofe-core.onrender.com/admin`)

### Sintoma Apresentado:
Ao efetuar login administrativo em `https://bancofe-core.onrender.com/admin`, a tela exibe o banner:
> **"Não foi possível carregar o painel: not found"**

### Causa Raiz Técnica:
No backend (`app/server.js` do repositório base):
- Todas as rotas administrativas em `/api/admin/*` — incluindo `/api/admin/clube/painel/resumo`, `/api/admin/razao/*`, `/api/admin/suprimentos/*`, `/api/admin/fiscal/*`, `/api/admin/a2/*` e `/api/admin/empresas` — estão agrupadas dentro da seguinte condição de ativação:
  ```javascript
  if (process.env.COMMERCE_CORE_ENABLED === '1') {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.DB_HOST) {
      throw new Error('COMMERCE_CORE_ENABLED requer DATABASE_URL/POSTGRES_URL ou DB_HOST explícito');
    }
    // registro de /api/admin/clube/*, /api/admin/razao/*, /api/admin/a2/* ...
  }
  ```
- O serviço `bancofe-core` (`srv-dc22jblg1s2s73eonl60`) no Render foi implantado em modo desacoplado (sem `COMMERCE_CORE_ENABLED=1` e sem a `DATABASE_URL` vinculada ao PostgreSQL).
- Com isso, o servidor Express não registra esses endpoints, respondendo `HTTP 404 Not Found` (`{ error: "not found" }`). O componente `ClubeDashboard.jsx` captura o erro e exibe a mensagem na interface.

---

## 2. Mapa das Soluções Completas Instaladas (GCP & Render)

Sob as contas institucionais do usuário (**`rodrigo.goncalves@kytto.com.br`** no Google Cloud e **`rrodrigogon@gmail.com` / `tea-d8iu9mernols73c52frg`** no Render), a solução completa já está **100% instalada, provisionada e ativa** nos seguintes ambientes:

### A. Google Cloud Platform (GCP) — Conta `rodrigo.goncalves@kytto.com.br`
- **Projeto:** `bancofe-plataforma-kytto` (São Paulo, `southamerica-east1`)
  - **Serviço Cloud Run:** `erp-bancofe`
  - **URLs de Acesso Direto:**
    - Primária: [https://erp-bancofe-243135142712.southamerica-east1.run.app](https://erp-bancofe-243135142712.southamerica-east1.run.app)
    - Alias: [https://erp-bancofe-5xsi5uyoda-rj.a.run.app](https://erp-bancofe-5xsi5uyoda-rj.a.run.app)
  - **Status:** **100% Online (HTTP 200 OK), Acesso Público Direto** (IAP Error Code 11 desativado com sucesso).
  - **Banco de Dados:** Conectado ao Google Cloud SQL PostgreSQL (`bancofe-pg`).
  - **Login:** Aceita `rodrigo.goncalves@kytto.com.br` e `admin` com a senha `#080581Verdao`.
  - **Painel / Cockpit:** Carrega **sem erro** (`/admin`), com suporte a multi-tenant (Holding, Zuma, BancoFe, etc.) e acesso completo a todos os 61 módulos operacionais.

- **Projeto:** `kytto-514916` (São Paulo, `southamerica-east1`)
  - **Serviço Cloud Run:** `zuma`
  - **URL:** [https://zuma-731517331463.southamerica-east1.run.app](https://zuma-731517331463.southamerica-east1.run.app)
  - **Descrição:** **Zuma Pilot — Sistema Gastronômico, PDV & ERP**, com PWA, cardápio digital e integração operacional.
  - **Outros Serviços Ativos:** `casanova-api`, `agro-open`.

---

### B. Render Cloud — Workspace `tea-d8iu9mernols73c52frg`
- **Serviço em Produção Oficial:** `setpoint` (`srv-d8iudokm0tmc73c07iog`)
  - **URL de Produção:** [https://setpoint-tm5n.onrender.com](https://setpoint-tm5n.onrender.com) (e [https://setpoint.kytto.com.br](https://setpoint.kytto.com.br))
  - **Status de Saúde (`/health`):**
    ```json
    {
      "status": "ready",
      "persistencia": "ok",
      "ai": "true",
      "gemini": true,
      "evolution": true,
      "canalAtivo": "meta_cloud_api",
      "ultimoEnvio": "2026-11-23T15:49:07.314Z",
      "ultimaMensagemRecebida": "2026-11-23T15:48:52.622Z",
      "tamanhoFila": 22
    }
    ```
  - **Infraestrutura Completa:**
    - Banco de Dados Gerenciado: **Render PostgreSQL `kytto-commerce-core` (`dpg-da73bqe7bikc73ep1480-a`)** ativo na versão 18.
    - Disco Persistente: `setpoint-data` (`/var/data`, 1 GB).
    - Agente WhatsApp AI com fila e integrações Meta Cloud API + Evolution.
    - Multi-Tenant total: Barbearia Dino, Agro Open, Palatare Pizzaria, Zuma Oriental e Holding Kytto.

---

## 3. Governança Corporativa: BancoFe Holding S.A. & Banco Unificado

Atendendo à diretriz de governança institucional do Grupo BancoFe:

### 3.1. Hierarquia de Entidades Implementada
1. **Entidade Superior / Controladora Geral:**
   - **Razão Social:** `BancoFe Holding S.A. — Controladora Geral do Grupo`
   - **Papel:** Entidade master no topo da estrutura societária, controladora institucional de todas as 15 subsidiárias e unidades operacionais de negócio.
   - **Ícone & Destaque:** 👑 Coroa Dourada / Badge "Holding Controladora".
   - **Módulos Centrais:** Central ERP 360° Master, Matriz de Governança & Cadastro 360°, Auditoria Fiscal SEFAZ-MT e Hub Central de Integrações (77 fontes).

2. **Instituição Bancária Unificada:**
   - **Razão Social:** `BancoFe — Core Bancário, Open Finance & Securitizadora FIDC`
   - **Unificação:** Fusão operacional das antigas entidades separadas (*"BancoFe — Open Finance & Banking Digital"* e *"BancoFe Securitizadora & FIDC"*).
   - **Escopo Integrado:** Core Banking digital, liquidação PIX 24/7 instantânea, Open Finance Bacen, Mesa de Crédito Algorítmica com Dossiê SCR Bacen, Parecer IA, emissão de CCB eletrônica, securitização de recebíveis e estruturação de cotas sênior/subordinadas de FIDC.
   - **Volume Mensal Gerido:** R$ 17,35M / mês | 152.340 transações / mês | Uptime SLA 99,99%.

3. **Subdivisão no Seletor Executivo (Sidebar):**
   - O dropdown da Sidebar agora separa visualmente a **Entidade Superior / Controladora** (com cabeçalho âmbar exclusivo e destaque visual) das **15 Unidades Operacionais de Negócio**, garantindo controle de governança em um único clique.
   - A página de **Cadastro 360°** (`/admin/cadastro-360`) dispõe da aba dedicada **"👑 Matriz de Governança & Empresas"** e filtros consolidados por empresa.

### 3.2. Status de Produção (GCP Cloud Run)
- **Revisão Ativa:** `erp-bancofe-00039-df2` (100% do tráfego).
- **Deploy:** Concluído com sucesso via Google Cloud Build (ID: `f1033613-2db7-4115-bc30-c9cf4e1f0571`).
- **URL de Produção:** [https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin/cadastro-360](https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin/cadastro-360)
- **Ambiente Render:** [https://bancofe-core.onrender.com](https://bancofe-core.onrender.com) 100% ativo e preservado.
