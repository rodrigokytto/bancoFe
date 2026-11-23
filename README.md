# BancoFe • Core Bancário & Módulo Unificado de Integrações

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Vitest Tests](https://img.shields.io/badge/tests-22%2F22%20passed-emerald.svg)]()
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-blue.svg)]()
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)]()
[![MCP 2024-11-05](https://img.shields.io/badge/MCP-2024--11--05%20JSON--RPC-purple.svg)]()
[![BACEN & FEBRABAN](https://img.shields.io/badge/BACEN-COSIF%20%7C%20SPI%20%7C%20CIP-amber.svg)]()

> **BancoFe** é uma plataforma bancária e contábil de última geração, desenvolvida com foco em operações de pagamento instantâneo, crédito agropecuário e automação financeira corporativa. Este repositório implementa o **Módulo Central de Integrações do BancoFe**, unificando sob uma arquitetura determinística e modular o máximo de padrões abertos (**Git Abertos**), servidores e clientes do **Model Context Protocol (MCP)** e **Skills de Inteligência Artificial**.

---

## 🏛️ Visão Geral da Arquitetura

O BancoFe foi concebido sob o rigor regulatório do **Banco Central do Brasil (BACEN)** e da **FEBRABAN**, integrando um motor contábil em partidas dobradas (**COSIF**) a uma camada de interoperabilidade aberta de alta performance:

```
                                  ┌────────────────────────────────────────┐
                                  │      BANCOFE DASHBOARD & COCKPIT       │
                                  │   React 19 • Vite • Tailwind • Lucide  │
                                  └──────────────────┬─────────────────────┘
                                                     │
                                                     ▼
                                  ┌────────────────────────────────────────┐
                                  │   EXPRESS REST API & SSE CONTROLLER    │
                                  │      /api/integrations • /api/mcp      │
                                  └──────────────────┬─────────────────────┘
                                                     │
               ┌─────────────────────────────────────┼─────────────────────────────────────┐
               ▼                                     ▼                                     ▼
 ┌───────────────────────────┐         ┌───────────────────────────┐         ┌───────────────────────────┐
 │       GIT ABERTOS         │         │      PROTOCOLO MCP        │         │       SKILLS DE IA        │
 │  Padrões Oficiais & Libs  │         │  Model Context Protocol   │         │    Automação & Finanças   │
 ├───────────────────────────┤         ├───────────────────────────┤         ├───────────────────────────┤
 │ • Pix BACEN EMVCo (CRC16) │         │ • Servidor Nativo RPC 2.0 │         │ • Finance Pro (SAC/PRICE) │
 │ • DICT & MED (Res. 103)   │         │   10 Ferramentas Bancárias│         │ • Diagnóstico de Liquidez │
 │ • Boletos FEBRABAN (47 d) │         │ • WhatsApp Business MCP   │         │ • Fechamento Diário EOD   │
 │ • CNAB 240 / 400 Remessa  │         │ • Claude Vertex Gateway   │         │ • Office Docs (CSV/Extr)  │
 │ • Open Finance Brasil FAPI│         │ • Anchor Browser MCP      │         │ • Key User Treinamento    │
 │ • Gateways Hub (7 provs)  │         │ • Prisma Postgres MCP     │         │ • Rendimento Tesouraria   │
 │ • Bureau Crédito (Valida) │         └─────────────┬─────────────┘         └─────────────┬─────────────┘
 │ • Agro CPR & Barter       │                       │                                     │
 │ • Web3 Drex & ERC-1155    │                       │                                     │
 └─────────────┬─────────────┘                       │                                     │
               │                                     │                                     │
               └─────────────────────────────────────┼─────────────────────────────────────┘
                                                     │
                                                     ▼
                                  ┌────────────────────────────────────────┐
                                  │     CORE BANCÁRIO & LIVRO RAZÃO        │
                                  │   Plano COSIF • Partidas Dobradas      │
                                  │   Cadeia Imutável de Hashes SHA-256    │
                                  └────────────────────────────────────────┘
```

---

## 🚀 Os Três Pilares de Integração

### 1. Git Abertos & Padrões Financeiros Oficiais

O BancoFe adota os algoritmos oficiais e layouts padronizados do Sistema Financeiro Nacional (SFN):

- **Pix BACEN & EMVCo Puro (`src/integrations/git-abertos/pix/`):**
  - Gerador de BR Code / QR Code estático e dinâmico conforme o *Manual de Padrões para Iniciação do Pix do Banco Central do Brasil*.
  - Cálculo algorítmico de CRC16-CCITT (polinômio `0x1021`, inicial `0xFFFF`).
  - Resolução e consulta de chaves no Diretório de Identificadores de Contas Transacionais (**DICT**) com detecção de CPF, CNPJ, Email, Telefone e EVP.
  - Implementação completa do Mecanismo Especial de Devolução (**MED**) para fraudes e falhas operacionais conforme Resolução BCB nº 103/2021.

- **FEBRABAN Boletos & CNAB 240/400 (`src/integrations/git-abertos/boletos-cnab/`):**
  - Motor de cálculo de Código de Barras de 44 dígitos com Dígito Verificador Geral em Módulo 11.
  - Formatação e cálculo de Linha Digitável de 47 posições com DVs em Módulo 10.
  - Cálculo do Fator de Vencimento FEBRABAN (com suporte ao novo ciclo pós-fevereiro/2025).
  - Gerador e processador de arquivos de remessa e retorno **CNAB 240** (Header de Arquivo, Header de Lote, Segmentos A/B e Trailers).

- **Open Finance Brasil (`src/integrations/git-abertos/open-finance/`):**
  - Gerenciamento de ciclo de vida de consentimentos FAPI (OAuth2 / mTLS).
  - Compartilhamento de dados cadastrais, saldos e extratos de contas correntes.
  - Iniciação de Transação de Pagamento (**ITP**) com redirecionamento seguro.

- **Hub de Gateways de Pagamento (`src/integrations/git-abertos/gateways/`):**
  - Conector unificado e roteador dinâmico de adquirentes e gateways: **Asaas, Efí Bank (antiga Gerencianet), Mercado Pago, Stripe, OpenPix, Celcoin e Stark Bank**.

- **Bureau de Crédito & Cadastral (`src/integrations/git-abertos/bureau-credito/`):**
  - Validadores matemáticos estritos de CPF e CNPJ (com checagem de dígitos verificadores e rejeição de sequências inválidas).
  - Conector para consulta cadastral, situação na Receita Federal e score de risco (Consulta360).

- **Agro Finance & Barter (`src/integrations/git-abertos/agro-finance/`):**
  - Emissão e custódia digital de **Cédula de Produto Rural (CPR)** física e financeira.
  - Módulo de operações estruturadas de *Barter* (troca de insumos por sacas de soja/milho com garantia de safra).

- **Web3 & Drex BACEN (`src/integrations/git-abertos/web3-drex/`):**
  - Emulação dos contratos do Piloto Drex do Banco Central do Brasil para liquidação financeira atômica (DvP).
  - Tokenização de recebíveis agrícolas e CPRs sob o padrão ERC-1155.

---

### 2. Protocolo MCP (Model Context Protocol)

O BancoFe integra nativamente a especificação do **Model Context Protocol (versão 2024-11-05)** da Anthropic:

#### Servidor MCP Nativo (`src/integrations/mcps/server/`)
Expõe 10 ferramentas bancárias padronizadas via transporte **stdio** e **HTTP/SSE**, permitindo que agentes de inteligência artificial realizem operações no banco:

| Ferramenta MCP | Descrição | Parâmetros Principais |
|---|---|---|
| `bancofe_create_pix` | Gera cobrança Pix Copia e Cola EMVCo e QR Code | `pixKey`, `amount`, `merchantName`, `txid` |
| `bancofe_query_statement` | Consulta saldo e extrato bancário | `accountId`, `days` |
| `bancofe_issue_boleto` | Emite boleto FEBRABAN com linha digitável e código de barras | `amount`, `dueDate`, `payerName`, `payerDocument` |
| `bancofe_process_cnab` | Gera arquivo de Remessa CNAB 240 em lote | `companyName`, `companyDocument`, `totalAmountBrl` |
| `bancofe_consult_cpf_cnpj` | Valida CPF/CNPJ e consulta score cadastral | `document` |
| `bancofe_open_finance_consent`| Cria consentimento Open Finance | `document`, `actionType` |
| `bancofe_audit_ledger` | Audita o Livro Razão contábil e equação COSIF | `detailed` |
| `bancofe_simulate_loan` | Simula amortização SAC e PRICE de crédito rural | `principalBrl`, `annualRatePercent`, `months`, `system` |
| `bancofe_send_whatsapp_alert` | Dispara notificação bancária via MCP WhatsApp | `phoneNumber`, `message`, `notificationType` |
| `bancofe_drex_settlement` | Liquidação atômica em Real Digital Drex | `amountBrl`, `assetType` |

#### Hub MCP para Conexão de Clientes Externos (`src/integrations/mcps/clients/`)
O BancoFe atua como cliente de servidores MCP corporativos configurados no ambiente:
- **WhatsApp Business API MCP:** Disparo de mensagens transacionais, 2FA e cobrança.
- **Claude Vertex Gateway MCP:** Análise de risco regulatório, compliance e contratos via Vertex AI.
- **Anchor Browser MCP:** Automação de navegação em portais regulatórios do BACEN e Receita Federal com extração de dados e bypass anti-bot.
- **Prisma Postgres MCP:** Backup de lançamentos contábeis e introspecção de schemas.

---

### 3. Skills de IA do Manus

Motor determinístico que orquestra habilidades especializadas de inteligência artificial (`src/integrations/skills/`):

- **Finance Pro Playbooks (`finance-pro.skill.ts`):**
  - Projeção completa de tabelas de amortização **SAC** (Amortização Constante) e **PRICE** (Prestações Fixas).
  - Cálculo de Liquidez Corrente, Liquidez Seca, Alavancagem (Dívida Líquida / EBITDA) e rating de crédito bancário.

- **Automação & Agendamento (`automation.skill.ts`):**
  - Fechamento contábil diário (*End of Day - EOD*).
  - Varredura de retorno de arquivos CNAB e apropriação de rendimento CDI em carteiras de tesouraria.

- **Office Documents (`office-docs.skill.ts`):**
  - Geração de extratos bancários formatados em CSV/Excel para importação em sistemas ERP.
  - Emissão de comprovantes oficiais de transferência Pix em formato formal.

- **Key User Training & Homologação (`keyuser.skill.ts`):**
  - Geração automatizada de manuais operacionais (*Manual do Key User*), planos de testes com cenários de homologação e termos de aceite formais.

- **Análise de Tesouraria & Rentabilidade (`stock-analysis.skill.ts`):**
  - Comparação de rentabilidade líquida entre **CDB BancoFe**, **LCA Agro** (isenta de IR) e **Tesouro IPCA+**, aplicando a tabela regressiva de Imposto de Renda.

---

## 📊 Core Contábil: Livro Razão COSIF & Auditoria SHA-256

O BancoFe implementa a contabilidade financeira formal em conformidade com o Plano Contábil das Instituições do Sistema Financeiro Nacional (**COSIF**):

1. **Partidas Dobradas Estritas:** Todo evento gera pelo menos um lançamento a Débito e um lançamento a Crédito. É matematicamente impossível salvar um lançamento desbalanceado:
   $$\sum \text{Débitos} \equiv \sum \text{Créditos}$$
2. **Equação Fundamental do Balanço:**
   $$\text{Ativo} \equiv \text{Passivo} + \text{Patrimônio Líquido} + (\text{Receitas} - \text{Despesas})$$
3. **Precisão em Centavos de Real:** Eliminação total de erros de ponto flutuante (*floating point*) armazenando quantias como inteiros de centavos.
4. **Cadeia Criptográfica SHA-256 Imutável:** Cada lançamento calcula um hash criptográfico baseado no lançamento anterior, gerando uma trilha de auditoria inviolável (*audit trail*).

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 20+ (recomendado Node.js 22+)
- pnpm (recomendado) ou npm

### 1. Clonar o Repositório
```bash
git clone https://github.com/rodrigokytto/bancoFe.git
cd bancoFe
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Executar os Testes Unitários
A suíte conta com 22 testes automatizados cobrindo Pix, FEBRABAN, CNAB 240, MCP, Skills e o motor contábil:
```bash
pnpm test
```

### 4. Compilar o Projeto
```bash
pnpm build
```

### 5. Iniciar o Painel de Desenvolvimento (Frontend)
```bash
pnpm dev
```
Acesse a aplicação no navegador em `http://localhost:5173`.

### 6. Iniciar o Servidor Backend (API REST & SSE)
```bash
pnpm server
```
Disponível em `http://localhost:3000`.

### 7. Executar o Servidor MCP via Linha de Comando (stdio)
```bash
pnpm mcp
```

---

## 🧪 Estrutura de Arquivos

```
bancoFe/
├── src/
│   ├── core/                           # Core Bancário e Contabilidade
│   │   ├── ledger/                     # Livro Razão, Contas COSIF e Partidas Dobradas
│   │   └── domain/                     # Clientes PF/PJ, Contas e Transações
│   ├── integrations/                   # Módulo Central de Integrações
│   │   ├── types.ts                    # Interfaces de adaptadores e status
│   │   ├── registry.ts                 # Registro central de todas as integrações
│   │   ├── event-bus.ts                # Barramento pub/sub de eventos bancários
│   │   ├── git-abertos/                # Padrões Abertos e Bibliotecas Oficiais
│   │   │   ├── pix/                    # BR Code EMVCo, DICT e MED
│   │   │   ├── boletos-cnab/           # Boletos FEBRABAN e CNAB 240/400
│   │   │   ├── open-finance/           # FAPI, Consentimentos e ITP
│   │   │   ├── gateways/               # Hub de 7 gateways (Asaas, Efí, Stripe, etc.)
│   │   │   ├── bureau-credito/         # Validação CPF/CNPJ e Consulta360
│   │   │   ├── agro-finance/           # CPR Digital, Barter e Custeio
│   │   │   └── web3-drex/              # Piloto Drex BACEN e Tokenização ERC-1155
│   │   ├── mcps/                       # Protocolo MCP (Anthropic)
│   │   │   ├── server/                 # Servidor JSON-RPC 2.0 e 10 ferramentas
│   │   │   └── clients/                # Hub para WhatsApp, Claude Vertex, Anchor
│   │   └── skills/                     # Skills de Inteligência Artificial
│   │       ├── engine.ts               # Motor de orquestração de skills
│   │       └── adapters/               # Finance Pro, Office, KeyUser, Automação
│   ├── server/                         # Servidor Express API e SSE
│   │   └── app.ts
│   └── client/                         # Interface Web (React 19 + Tailwind)
│       ├── App.tsx
│       ├── main.tsx
│       └── components/                 # Cockpit, Pix, Boletos, MCP, Skills, Ledger
├── tests/                              # Testes automatizados com Vitest
│   ├── ledger.test.ts
│   ├── pix.test.ts
│   ├── febraban.test.ts
│   ├── mcp.test.ts
│   └── skills.test.ts
├── docs/                               # Documentação técnica aprofundada
│   ├── ARCHITECTURE.md
│   ├── INTEGRATIONS_GUIDE.md
│   ├── MCP_SPECIFICATION.md
│   └── SKILLS_PLAYBOOK.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Conformidade Regulatória e Segurança

- **Resolução BCB nº 1/2020:** Regulamento do Arranjo de Pagamentos Pix.
- **Resolução BCB nº 103/2021:** Mecanismo Especial de Devolução (MED).
- **Padrão FEBRABAN CNAB 240 v10.3:** Layout oficial de pagamentos e cobranças.
- **Open Finance Brasil:** Padrões de segurança FAPI 1.0 Advanced e DCR.
- **LGPD (Lei nº 13.709/2018):** Mascaramento de dados sensíveis em payloads e logs.

---

## 👤 Autor e Governança

- **Instituição:** BancoFe S.A. (ISPB: 00000799)
- **Mantenedor Principal:** Rodrigo Ribeiro Gonçalves
- **Repositório GitHub:** [https://github.com/rodrigokytto/bancoFe](https://github.com/rodrigokytto/bancoFe)
- **Licença:** MIT
