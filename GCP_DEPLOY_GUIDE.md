# Guia de Operações e Infraestrutura em Produção — Zuma Pilot

Este documento consolida a arquitetura completa, configurações em produção e o status do deploy no **Google Cloud Platform (GCP)** e no **Registro.br** para o domínio oficial `zuma.kytto.com.br`.

---

## 1. Arquitetura em Produção

```
                             [ Usuário / Navegador / App ]
                                           │
                                           ▼
                   [ Registro.br DNS: zuma.kytto.com.br (Tipo A) ]
                                           │
                                           ▼
                      [ Google Cloud Global Static IP ]
                                35.201.67.186
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
          Porta 80 (HTTP)                               Porta 443 (HTTPS)
      zuma-http-forwarding-rule                     zuma-https-forwarding-rule
            │                                             │
      zuma-http-proxy                               zuma-https-proxy
            │                                             │
      zuma-http-redirect                            zuma-ssl-cert (Google Managed)
     (301 Moved Permanently)                              │
            │                                       zuma-url-map
            └────────────────────► HTTPS                  │
                                                    zuma-backend
                                                          │
                                                    Serverless NEG
                                                      (zuma-neg)
                                                          │
                                                          ▼
                                            [ Google Cloud Run: zuma ]
                                            southamerica-east1 (São Paulo)
                                          zuma-x2gtmiiwkq-rj.a.run.app
                                                          │
                                                          ▼
                                             [ TiDB Cloud Serverless ]
```

---

## 2. Dados do Ambiente em Produção

| Recurso | Detalhe |
|---|---|
| **Conta GCP** | `rodrigo.goncalves@kytto.com.br` |
| **Projeto GCP** | `kytto-514916` (Nome: `kytto`) |
| **Serviço Cloud Run** | `zuma` |
| **URL Cloud Run Direta** | `https://zuma-x2gtmiiwkq-rj.a.run.app` |
| **Região** | `southamerica-east1` (São Paulo, Brasil) |
| **Status Cloud Run** | Ativo (100% tráfego na revisão `zuma-00008-zrr`) |
| **IP Estático Global (Load Balancer)** | **`35.201.67.186`** |
| **Certificado SSL** | `zuma-ssl-cert` (Gerenciado pelo Google para `zuma.kytto.com.br`) |
| **Redirecionamento HTTP -> HTTPS** | Ativo na porta 80 via `zuma-http-redirect` |
| **Domínio Oficial** | `https://zuma.kytto.com.br` |
| **Registro DNS (Registro.br)** | `Tipo: A` \| `Nome: zuma` \| `Dados: 35.201.67.186` (Publicado) |
| **Repositório GitHub** | `rodrigokytto/zuma` (branch `main`) |

---

## 3. Componentes Criados no GCP

### 3.1. Serverless Network Endpoint Group (NEG)
```bash
gcloud compute network-endpoint-groups describe zuma-neg \
  --region=southamerica-east1 \
  --project=kytto-514916
```

### 3.2. Backend Service Global
```bash
gcloud compute backend-services describe zuma-backend \
  --global \
  --project=kytto-514916
```

### 3.3. Certificado SSL Gerenciado pelo Google
```bash
gcloud compute ssl-certificates describe zuma-ssl-cert \
  --global \
  --project=kytto-514916
```

### 3.4. Regras de Encaminhamento (Forwarding Rules)
- **HTTPS (443):** `zuma-https-forwarding-rule` -> IP `35.201.67.186`
- **HTTP (80):** `zuma-http-forwarding-rule` -> IP `35.201.67.186` (Redirect automático para HTTPS)

---

## 4. Configuração no Registro.br

- **Conta Registro.br:** `rrodrigogon@gmail.com` (Código de usuário: `RORGO248`)
- **Domínio Administrado:** `kytto.com.br`
- **Zona DNS:** Modo Avançado
- **Entrada Adicionada:**
  - **Tipo:** `A`
  - **Nome:** `zuma.kytto.com.br`
  - **Dados (IPv4):** `35.201.67.186`
- **Status:** Gravado com sucesso nos servidores autoritativos (`e.sec.dns.br` e `f.sec.dns.br`).

---

## 5. Endpoints de Diagnóstico e Saúde

- Healthz: `https://zuma-x2gtmiiwkq-rj.a.run.app/healthz`
- API Health: `https://zuma-x2gtmiiwkq-rj.a.run.app/api/health`
- API Status: `https://zuma-x2gtmiiwkq-rj.a.run.app/api/status`
- Domínio Oficial: `https://zuma.kytto.com.br` (via IP `35.201.67.186`)
