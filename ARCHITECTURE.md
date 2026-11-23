# Arquitetura do Sistema • BancoFe

## 1. Visão Geral do Sistema

O **BancoFe** foi concebido sob o paradigma de microsserviços modulares em torno de um núcleo contábil financeiro estritamente imutável. A aplicação é dividida em quatro grandes camadas:

1. **Apresentação & Cockpit (Client Layer):** Single Page Application em React 19 com Vite, estilizada com Tailwind CSS e ícones Lucide. Permite monitorar em tempo real todos os conectores e disparar ações interativas.
2. **Camada de Exposição & Transporte (Transport Layer):** Servidor HTTP Express com rotas REST e canais SSE (Server-Sent Events), além de servidor de transporte de streaming JSON-RPC 2.0 (stdio) para o protocolo MCP.
3. **Módulo Central de Integrações (Interoperability Layer):**
   - **Git Abertos:** Implementações de código aberto puras dos protocolos BACEN e FEBRABAN.
   - **MCP Protocol:** Camada bidirecional para agentes de inteligência artificial.
   - **Skills de IA:** Adaptadores especializados para cálculos financeiros, automações e compliance.
4. **Core Bancário & Contábil (Ledger & Domain Layer):** Livro Razão em partidas dobradas, gerenciador de contas COSIF e encadeamento criptográfico SHA-256.

```
+---------------------------------------------------------------+
|                       BANCOFE CLIENT                          |
|  [Cockpit] [Pix Terminal] [Boletos] [MCP Lab] [Skills] [Ledger]|
+-------------------------------+-------------------------------+
                                | (HTTP / REST / SSE)
+-------------------------------v-------------------------------+
|                      EXPRESS HTTP API                         |
|  - GET /api/integrations      - POST /api/integrations/:id/exec|
|  - GET /api/integrations/health - POST /api/mcp/rpc           |
+-------------------------------+-------------------------------+
                                |
+-------------------------------v-------------------------------+
|                  INTEGRATION REGISTRY & EVENT BUS             |
+---------------+---------------+---------------+---------------+
|  GIT ABERTOS  |      MCP      |    SKILLS     |   GATEWAYS    |
| - Pix BACEN   | - Native MCP  | - Finance Pro | - Asaas       |
| - FEBRABAN    |   Server      | - Office Docs | - Efi Bank    |
| - CNAB 240    | - External Hub| - Key User    | - Stripe      |
| - OpenFinance |   (WhatsApp,  | - Automation  | - MercadoPago |
| - Agro CPR    |    Vertex)    | - Treasury    | - StarkBank   |
| - Web3 Drex   |               |               |               |
+---------------+---------------+---------------+---------------+
                                |
+-------------------------------v-------------------------------+
|                    CORE CONTÁBIL & COSIF                      |
|  - Partidas Dobradas: Sum(Debits) === Sum(Credits)            |
|  - Audit Trail com Chadeamento SHA-256                        |
|  - Contas Ativo (1.x), Passivo (4.x), PL (6.x), Receitas (7.x)|
+---------------------------------------------------------------+
```

---

## 2. Padrões de Projeto Adotados

### 2.1. Registry Pattern (`IntegrationRegistry`)
Todos os adaptadores de integração implementam a interface `IIntegrationAdapter`:
```typescript
export interface IIntegrationAdapter {
  id: string;
  name: string;
  version: string;
  category: IntegrationCategory;
  description: string;
  tags: string[];
  capabilities: IntegrationCapability[];
  initialize(): Promise<void>;
  healthCheck(): Promise<HealthCheckResult>;
  execute(action: string, payload: any): Promise<any>;
}
```
O `IntegrationRegistry` atua como Singleton, mantendo o ciclo de vida, verificações de saúde periódicas e o mapeamento de chamadas.

### 2.2. Event-Driven Architecture (`IntegrationEventBus`)
Transações financeiras (como recebimento Pix ou liquidação de boleto) são publicadas de forma assíncrona no barramento interno:
- `pix.received` -> Gera lançamento contábil a débito na câmara Pix e a crédito na conta do cliente, disparando notificação WhatsApp.
- `boleto.settled` -> Liquida título CIP e apropria tarifa de intercâmbio.
- `cpr.issued` -> Emite Cédula de Produto Rural e gera token ERC-1155 de garantia.

### 2.3. Imutabilidade Contábil (Blockchain-style Chain of Trust)
Cada lançamento contábil no `LedgerEngine` recebe um hash computado a partir do seu conteúdo concatenado com o hash do lançamento imediatamente anterior:
$$H_n = \text{SHA-256}(ID_n \parallel Ref_n \parallel Timestamp_n \parallel Postings_n \parallel H_{n-1})$$
Qualquer adulteração em um registro passado invalida imediatamente toda a cadeia subsequente, garantindo auditabilidade à prova de fraudes.

---

## 3. Segurança e Resiliência
- **Zero Floating Point Errors:** Todas as transações monetárias são registradas em centavos inteiros (`amountCentavos: number`).
- **Sanitização EMVCo:** Remoção de acentos e caracteres não ASCII em conformidade estrita com as especificações do Pix BACEN.
- **Isolamento de Erros:** Falhas em conectores externos (ex: gateway indisponível) não travam a API do banco e são capturadas com status degradado no Health Check.
