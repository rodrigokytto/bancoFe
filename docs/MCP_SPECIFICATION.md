# Especificação do Servidor e Clientes MCP • BancoFe

## 1. Introdução

O **Model Context Protocol (MCP)** é uma especificação aberta desenvolvida pela Anthropic que padroniza como agentes de inteligência artificial (LLMs) interagem com ferramentas, recursos contextuais e prompts estruturados em sistemas externos.

O **BancoFe** implementa o protocolo MCP completo conforme a especificação oficial de **05 de novembro de 2024**, operando em dois modos simultâneos:
1. **MCP Server:** Expõe recursos e ferramentas do banco para que agentes autônomos realizem transações e consultas bancárias com validação rigorosa de schemas JSON.
2. **MCP Client Hub:** Conecta o BancoFe a servidores MCP externos (WhatsApp Business, Claude Vertex Gateway, Anchor Browser, Prisma Postgres).

---

## 2. Servidor MCP Nativo (JSON-RPC 2.0)

### 2.1. Métodos Suportados
O servidor responde aos seguintes métodos do protocolo:

| Método MCP | Descrição |
|---|---|
| `initialize` | Negociação de capacidades e versão do protocolo (`2024-11-05`). |
| `tools/list` | Retorna a lista das 10 ferramentas bancárias nativas com schemas JSON de entrada. |
| `tools/call` | Executa uma ferramenta com os argumentos validados e retorna a resposta formatada. |
| `resources/list` | Lista os recursos informativos disponíveis para leitura de contexto (`bancofe://system/rates`, `bancofe://ledger/summary`). |
| `resources/read` | Retorna o conteúdo textual ou JSON do recurso solicitado. |
| `prompts/list` | Lista prompts predefinidos para tarefas comuns de análise de crédito e governança. |

### 2.2. Execução via Linha de Comando (Transporte stdio)
Para integrar o servidor MCP do BancoFe ao Claude Desktop, Cursor ou qualquer cliente MCP:
```json
{
  "mcpServers": {
    "bancofe": {
      "command": "node",
      "args": ["/caminho/para/bancoFe/node_modules/.bin/tsx", "/caminho/para/bancoFe/src/integrations/mcps/server/mcp.server.ts"]
    }
  }
}
```

### 2.3. Execução via HTTP / Server-Sent Events (SSE)
O servidor Express expõe o endpoint POST `/api/mcp/rpc` e a rota SSE `/api/mcp/sse` para clientes remotos.

---

## 3. Catálogo de Ferramentas Nativas (`tools`)

### 1. `bancofe_create_pix`
Gera cobrança Pix com código Copia e Cola padrão EMVCo, chave Pix e QR Code.
- **Entrada:** `pixKey` (string), `amount` (number), `merchantName` (string), `merchantCity` (string), `txid` (string), `infoAdicional` (string).
- **Retorno:** Objeto com `payload`, `qrCodeData`, `txid`.

### 2. `bancofe_query_statement`
Consulta saldo e extrato da conta.
- **Entrada:** `accountId` (string, opcional), `days` (number, padrão 30).
- **Retorno:** Saldo disponível, limite, bloqueios e lista de transações recentes.

### 3. `bancofe_issue_boleto`
Emite boleto bancário FEBRABAN.
- **Entrada:** `amount` (number), `dueDate` (string AAAA-MM-DD), `payerName` (string), `payerDocument` (string).
- **Retorno:** Código de barras de 44 posições, linha digitável de 47 posições e fator de vencimento.

### 4. `bancofe_process_cnab`
Gera remessa CNAB 240 FEBRABAN para pagamentos em lote.
- **Entrada:** `companyName` (string), `companyDocument` (string), `paymentsCount` (number), `totalAmountBrl` (number).

### 5. `bancofe_consult_cpf_cnpj`
Validação cadastral de CPF e CNPJ e score de crédito.
- **Entrada:** `document` (string).
- **Retorno:** Situação na Receita Federal, pontuação de score (0 a 1000), rating de risco e limite pré-aprovado.

### 6. `bancofe_open_finance_consent`
Gerencia consentimentos Open Finance Brasil.
- **Entrada:** `document` (string), `actionType` ('CREATE' | 'CHECK' | 'LIST_ACCOUNTS').

### 7. `bancofe_audit_ledger`
Audita a integridade matemática do Livro Razão em partidas dobradas.
- **Entrada:** `detailed` (boolean).
- **Retorno:** Total de débitos, créditos, ativos, passivos, validação da equação contábil e status da cadeia de hashes.

### 8. `bancofe_simulate_loan`
Simulação de amortização de crédito pelos sistemas SAC e PRICE.
- **Entrada:** `principalBrl` (number), `annualRatePercent` (number), `months` (number), `system` ('SAC' | 'PRICE').

### 9. `bancofe_send_whatsapp_alert`
Disparo de notificações bancárias via WhatsApp Business MCP.
- **Entrada:** `phoneNumber` (string), `message` (string), `notificationType` (enum).

### 10. `bancofe_drex_settlement`
Liquidação financeira atômica em Real Digital Drex.
- **Entrada:** `amountBrl` (number), `assetType` (string).

---

## 4. Integração com Servidores Externos

O `McpHubIntegrationAdapter` mantém comunicação com 4 servidores MCP do ecossistema:
1. **WhatsApp Business API MCP:** Gerenciamento de templates aprovados pela Meta e envio de mensagens interativas.
2. **Claude Vertex Gateway MCP:** Conexão com modelos Claude 3.5 Sonnet / Haiku provisionados no Google Cloud Vertex AI para análise de compliance.
3. **Anchor Browser MCP:** Automação de browser com modo anti-stealth para consulta automatizada de certidões e balancetes regulatórios.
4. **Prisma Postgres MCP:** Execução de queries analíticas seguras e auditoria de banco de dados.
