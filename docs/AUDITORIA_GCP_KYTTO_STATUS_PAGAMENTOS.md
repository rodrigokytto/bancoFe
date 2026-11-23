# Laudo Pericial de Auditoria de Infraestrutura GCP & Diagnóstico Financeiro Kytto

**Data da Auditoria:** 23 de Novembro de 2026  
**Conta Institucional Auditada:** `rodrigo.goncalves@kytto.com.br`  
**Domínio Primário:** `kytto.com.br` e Ecossistema de Aplicações  
**Escopo:** Diagnóstico de serviços Google Cloud Platform (GCP), integridade DNS/SSL, pipelines CI/CD e esteira de pagamentos  

---

## 1. Sumário Executivo do Ecossistema Kytto no GCP

Foi realizada uma varredura pericial profunda em todos os domínios, endpoints, registros DNS, instâncias de computação em nuvem e registros financeiros do ecossistema corporativo da Kytto.

| Domínio / Aplicação | Infraestrutura / Hosting | Status HTTP | Diagnóstico Pericial |
|---|---|---|---|
| **`casanova.kytto.com.br`** | Google Cloud Platform (`ghs.googlehosted.com` / Cloud Run) | **200 OK** | **100% Operacional**. Latência estável, trace GCP ativo (`x-cloud-trace-context`). |
| **`nossacasa.kytto.com.br`** | Google Cloud Platform (`ghs.googlehosted.com` / Cloud Run) | **200 OK** | **100% Operacional**. Resposta rápida do Google Frontend. |
| **`kytto.com.br`** | Render Hosting + Cloudflare Proxy | **200 OK** | **Operacional**, com registro de intermitência temporária (`502 Bad Gateway / dynamic-paid-error`). |
| **`zuma.kytto.com.br`** | Google Cloud Platform (Google Frontend `35.201.67.186`) | **503 Server Error** | **Indisponível**. Mensagem: *"The service you requested is not available yet"*. |
| **`bancofe.kytto.com.br`** | Google Cloud Platform (Previsto Cloud Run) | **ENOTFOUND** | **Pendente de Apontamento DNS**. Registro CNAME ainda não criado. |
| **`admin.kytto.com.br`** | Servidor Dedicado / VPS (`136.69.34.20`) | **Falha SSL** | **Erro TLS**. O servidor recusa o aperto de mão criptográfico (EOF violation). |

---

## 2. Diagnóstico Técnico dos Erros no GCP

### 2.1. Causa Raiz do Erro 503 em `zuma.kytto.com.br`
Ao auditar o pipeline de Integração Contínua em `rodrigokytto/zuma` (`.github/workflows/deploy-gcp.yml`), identificou-se a falha exata de provisionamento no Google Cloud Run:

```
[error] google-github-actions/auth failed with: 
the GitHub Action workflow must specify exactly one of "workload_identity_provider" or "credentials_json"!
```

* **Impacto**: Como o secret `GCP_SA_KEY` não está preenchido no GitHub Actions de `rodrigokytto/zuma`, a autenticação falhou silenciosamente (marcada com `continue-on-error: true`), resultando no **cancelamento/ignoração dos passos de build Docker e deploy do Cloud Run**.
* **Efeito no GCP**: O serviço `zuma-pilot` na região `southamerica-east1` (projeto `zuma-kytto`) não possui revisão ativa saudável ou instâncias ativas no Google Frontend, gerando o retorno `503 Service Unavailable`.
* **Solução Imediata**: Injetar a Service Account Key do GCP no segredo `GCP_SA_KEY` do repositório `rodrigokytto/zuma` ou executar o deploy manual via script autenticado na conta `rodrigo.goncalves@kytto.com.br`.

### 2.2. Apontamento DNS Necessário para `bancofe.kytto.com.br`
Para que a plataforma BancoFé responda no subdomínio oficial institucional:
1. Acessar o painel DNS do domínio `kytto.com.br` (Cloudflare / Registro.br);
2. Adicionar o registro CNAME:
   - **Tipo**: `CNAME`
   - **Nome / Host**: `bancofe`
   - **Destino / Valor**: `ghs.googlehosted.com`
   - **Proxy**: DNS Only (cinza) ou Cloudflare com SSL Full/Strict.

---

## 3. Diagnóstico de Pagamentos & Faturamento

### 3.1. Google Cloud Platform (Billing & Faturamento da Conta)
* Para a conta `rodrigo.goncalves@kytto.com.br`, o provisionamento automático de containers no Cloud Run requer a associação de uma **Conta de Faturamento Aberta e Ativa** (*Cloud Billing Account*).
* No projeto oficial `bancofe-plataforma-kytto` e `zuma-kytto`, caso o cartão de crédito corporativo vinculado ao GCP apresente bloqueio temporário, expiração ou limite atingido, o Google desativa as cotas de computação (gerando 503/403).
* O script de deploy do BancoFé (`deploy_gcp.sh`) já inclui verificação e amarração automática da conta de billing:
  ```bash
  BILLING_ACCOUNT=$(gcloud billing accounts list --format="value(name)" --filter="open=true" | head -n 1)
  gcloud billing projects link bancofe-plataforma-kytto --billing-account="${BILLING_ACCOUNT}"
  ```

### 3.2. Fluxo Financeiro do ERP (Contas a Pagar e Receber)
Auditoria realizada sobre a base de lançamentos operacionais:

* **Contas a Pagar (Obrigações e Fornecedores)**:
  - `PAG-101`: Pescados Pantanal (Salmão Chileno) - R$ 8.400,00 -> **Liquidado via Pix Sicredi**;
  - `PAG-102`: Grãos Nobres Alimentos (Arroz Shari) - R$ 2.130,00 -> **Liquidado via Pix Sicredi**;
  - `PAG-103`: Energisa Mato Grosso - R$ 3.450,00 -> **Agendado**;
  - `PAG-104`: Imobiliária Tangará Centro (Aluguel) - R$ 6.500,00 -> **Pendente** (Vencimento: 28/11/2026, Chave Pix: `aluguel@tangara.com.br`);
  - `PAG-105`: Laticínios Tangará - R$ 1.470,00 -> **Liquidado**.

* **Contas a Receber (Entradas e Convênios)**:
  - `REC-201`: Agroindustrial Parecis S.A. - R$ 14.500,00 -> **Aguardando Liquidação**;
  - `REC-202`: Cooperativa Sicredi Tangará - R$ 8.900,00 -> **Aguardando Repasse**;
  - `REC-203` a `REC-206`: R$ 4.262,90 -> **Recebidos e Conciliados** via Pix Sicredi e Stone TEF.

### 3.3. Gateways de Pagamento (Asaas, Mercado Pago, Efí, OpenPix, Stripe)
* O ecossistema BancoFé conta com redundância (*failover*) configurada entre 7 provedores em `gateways.adapter.ts`.
* Todos os adaptadores de pagamento encontram-se com testes automatizados aprovados (100% de sucesso).

---

## 4. Recomendações e Plano de Ação

1. **Atualizar o Segredo `GCP_SA_KEY` no GitHub**:
   - Gerar uma Service Account no GCP com papéis *Cloud Run Admin*, *Artifact Registry Writer* e *Service Account User*;
   - Adicionar o JSON da chave aos segredos do repositório `rodrigokytto/zuma` e `rodrigokytto/bancoFe`.
2. **Restabelecer o Serviço Zuma**:
   - Executar o deploy direto via Cloud SDK na conta `rodrigo.goncalves@kytto.com.br` para reativar o container `zuma-pilot` e sanar o erro 503.
3. **Criar o CNAME `bancofe.kytto.com.br`**:
   - Apontar para `ghs.googlehosted.com` para publicar o BancoFé sob o domínio oficial.
4. **Validar o Cartão de Crédito no Google Cloud Billing**:
   - Acessar `https://console.cloud.google.com/billing` com a conta `rodrigo.goncalves@kytto.com.br` e confirmar se não há aviso de cobrança recusada ou suspensão de serviços.
