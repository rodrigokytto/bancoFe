# 🏛️ ZUMA PILOT — SUÍTE ERP & BACKOFFICE EMPRESARIAL COMPLETO

**Data de Homologação:** 21 de Novembro de 2026  
**Ambiente:** Google Cloud Run (Produção / Região `southamerica-east1` São Paulo)  
**URL de Acesso:** [https://zuma-731517331463.southamerica-east1.run.app/erp](https://zuma-731517331463.southamerica-east1.run.app/erp)  
**Repositório Oficial:** `rodrigokytto/zuma` (Branch `main` sincronizada)  
**Origem das Matrizes:** Repositório Corporativo `rrodrigogon-byte/agro-open`  
**Credenciais Oficiais:** `rrodrigogon@gmail.com` | `#080581`

---

## 1. Visão Arquitetural do ERP & Backoffice Unificado

O **Zuma Pilot** consolida tanto a operação gastronômica de alta performance do Zuma Cozinha Oriental em Tangará da Serra quanto a infraestrutura corporativa de **Backoffice Completo** e **Módulos Setoriais Especializados**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ZUMA PILOT ERP 360°                                  │
│            https://zuma-731517331463.southamerica-east1.run.app/erp              │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
    ┌────────────────────────────────────┼────────────────────────────────────┐
    ▼                                    ▼                                    ▼
┌────────────────────────────┐ ┌────────────────────────────┐ ┌────────────────────────────┐
│   BACKOFFICE CORPORATIVO   │ │    MÓDULOS SETORIAIS       │ │   OPERAÇÃO DO SALÃO/PDV    │
├────────────────────────────┤ ├────────────────────────────┤ ├────────────────────────────┤
│ 👥 RH, DP, Folha & Ponto   │ │ 🌾 Agro & Safra MT         │ │ 🥢 Frente de Caixa & PDV   │
│ 💳 Contas a Pagar/Receber  │ │ 🛒 Varejo & Toledo Prix 6  │ │ 🧾 Fechamento Cego Turno   │
│ 🛒 Compras & Cotação 3 Vias│ │ 💼 Comercial B2B & Buffets │ │ 👨‍🍳 KDS Cozinha 4 Praças   │
│ 📦 WMS, Kardex & Lotes     │ │ 🛠️ OS & Manutenção 360°    │ │ 🍽️ Gestão das 27 Mesas     │
│ 📑 Billing & Contratos B2B │ │ 🚚 Expedição & Rotas MT    │ │ 🛵 Delivery Próprio GPS    │
│ 🏛️ Fiscal NFC-e/NF-e 27 UF │ │ 🏗️ Usina Concreto Serrano │ │ 🖨️ Spooler Térmico ESC/POS │
│ 📈 DRE Gerencial & EBITDA  │ │ 💈 Barbearia & Salão Parcer│ │ 🤖 Zumi & Akira IA Atend.  │
│ 🛡️ Governança & Auditoria  │ │ 🍕 Pizzaria Meio-a-Meio    │ │ 🍣 CRUD 211 SKUs Cardápio  │
│ 🏦 Conciliação OFX/TEF     │ │ 🍺 Bar & Comandas RFID     │ │ ⭐ Matriz BCG de Pratos    │
│ 🏛️ Patrimônio & Ativos     │ │ 🚗 AutoPeças & Mecânica    │ │ 📅 Reservas & Tatames VIP  │
│ 👤 Customer 360° & Scoring │ │ 🎾 Clube Esportivo & Arena │ │ 👑 Clube Zumi Fidelidade   │
└────────────────────────────┘ └────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Detalhamento dos Módulos de Backoffice Corporativo

### 👥 1. Recursos Humanos & Departamento Pessoal (`/erp?tab=rh`)
* **Quadro de Colaboradores e Prestadores**: Gestão de contratos CLT, PJ/MEI, Estágio e Regime Especial de Salão Parceiro (Lei Federal 13.352/2016).
* **Folha de Pagamento & Holerite Digital**: Proventos, insalubridade grau médio (20%), adicional noturno, DSR, comissões e descontos oficiais de INSS, FGTS e IRRF. Disparo instantâneo de holerites assinados digitalmente via WhatsApp.
* **Apuração de Comissões Escalonadas**: Rateio por serviços, faturamento de produtos e bonificação progressiva por meta batida pela brigada.
* **Ponto Eletrônico (Portaria 671 MTE / REP-P)**: Registro de jornadas com biometria facial e cerca digital em Tangará da Serra, cálculo automático de horas extras e banco de horas.
* **Saúde Ocupacional (PCMSO/PGR) & Boas Práticas ANVISA**: Atestados de Saúde Ocupacional (ASO) em dia, controle de vacinas e fichas de entrega de EPIs térmicos (-20°C).

### 🛒 2. Compras, Suprimentos & Procurement (`/erp?tab=compras`)
* **Mapa Comparativo de Cotações em 3 Vias**: Comparação lado a lado de preço unitário, prazo de entrega e condições de frete (FOB vs CIF).
* **Importador Direto de XML NF-e (Modelo 55)**: Decodificação da chave de 44 dígitos da SEFAZ, manifesto do destinatário e conversão automática de unidades (ex: fardo para kg ou unidade).
* **Ordens de Compra (OCs)**: Alçadas formais de aprovação, prazos de entrega e disparo direto do espelho de compra ao fornecedor em PDF via WhatsApp.
* **Homologação e SLA de Fornecedores**: Rastreamento de pontualidade de entrega (SLA %), certidões tributárias negativas e chaves Pix para liquidação.

### 📦 3. WMS, Kardex & Controle de Lotes Sanitários (`/erp?tab=estoque`)
* **Ficha Kardex Contábil**: Movimentação por PEPS (FIFO) e Custo Médio Ponderado para Salmão Chileno, Arroz Shari e insumos nobres.
* **Controle de Lotes & Rastreabilidade ANVISA**: Monitoramento de datas de validade, contagem regressiva de dias para expiração e controle térmico de armazenamento (-20°C a +4°C).
* **Inventário Cíclico & Contagem Cega**: Confronto entre estoque teórico do sistema e contagem física na balança com apuração de divergência em R$ e kg.
* **Fichas Técnicas & Engenharia de Cardápio (BOM)**: Decomposição de receitas com custo de insumos por porção, apuração de CMV Teórico vs CMV Real e margem de contribuição.
* **Multidepósitos**: Distribuição de saldos entre Câmara Fria Pescados 1, Freezer Congelados 2 e Almoxarifado Seco Central.

### 💳 4. Financeiro, Contas a Pagar & Receber (`/erp?tab=financeiro`)
* **Contas a Pagar**: Gestão de vencimentos com fornecedores, agendamento bancário e liquidação direta por chave Pix ou código de barras.
* **Contas a Receber**: Acompanhamento de convênios corporativos B2B, faturamentos quinzenais de empresas e repasses TEF/Stone.
* **DRE Gerencial Completa com EBITDA**: Receita bruta, deduções fiscais, taxas de adquirente, CMV, folha, custos fixos, marketing, EBITDA real e lucro líquido.
* **Conciliação Bancária OFX**: Importação de arquivos bancários do Sicredi, Sicoob e Banco do Brasil de Tangará da Serra.
* **Tesouraria & Cofre**: Sangrias de segurança, numerário em espécie e remessa de malotes lacrados para carro-forte Brinks.

### 📑 5. Billing, Contratos B2B & Régua de Cobrança (`/erp?tab=billing`)
* **Gestão de Contratos de Fornecimento Recorrente**: Convênios corporativos de almoço/jantar, buffets executivos e assinaturas do Clube Zumi.
* **Faturamento em Lote**: Processamento de faturas do ciclo corrente com geração de boletos Sicredi e chaves Pix Dinâmicas.
* **Régua Automatizada de Cobrança**: Disparos escalonados no WhatsApp e e-mail (D-3 preventivo, D-0 vencimento, D+3 cobrança amigável e D+7 notificação formal).
* **Painel de Inadimplência**: Cálculo automático de juros e mora diária (0,033%) com botão de renegociação em 1 clique.

### 🛡️ 6. Governança Multiempresa, Auditoria & RBAC (`/erp?tab=governanca`)
* **Isolamento Multi-Tenant**: Alternância segura de contexto operacional entre empresas da holding:
  * Zuma Gastronomia & Sushibar (CNPJ 44.912.880/0001-44)
  * Dino Barbearia Ltda (CNPJ 50.073.355/0002-60)
  * Kytto Agro & Grãos MT (CNPJ 38.102.441/0001-90)
  * Serrano Concreto & Obras (CNPJ 29.400.122/0001-18)
* **Trilha de Auditoria Imutável (Audit Trail)**: Registro com operador, timestamp, IP de origem, ação, módulo e hash criptográfico SHA-256 (conformidade LGPD e fiscal).
* **Matriz de Permissões RBAC**: Alçadas granulares para Super Admin, Gerente Geral, Caixa, Sushiman, Garçom e Contador Externo.
* **Snapshots em Nuvem**: Rotina diária de backup automatizada com armazenamento criptografado no Google Cloud Storage (São Paulo).

---

## 3. Navegação Rápida e Acesso Direto aos Módulos de Backoffice
- `/erp?tab=rh` -> Recursos Humanos, DP, Folha & Ponto Eletrônico
- `/erp?tab=compras` -> Compras, Cotações 3 Vias & Importador XML NF-e 44 Dígitos
- `/erp?tab=estoque` -> WMS, Ficha Kardex PEPS & Lotes Sanitários ANVISA
- `/erp?tab=financeiro` -> Contas a Pagar, Contas a Receber, DRE EBITDA & OFX
- `/erp?tab=billing` -> Billing, Contratos Corporativos & Régua de Cobrança Pix
- `/erp?tab=governanca` -> Governança Multiempresa, Auditoria SHA-256 & RBAC
- `/erp?tab=fiscal` -> Fiscal SEFAZ-MT, NFS-e Nacional & SPED Bloco K
- `/erp?tab=patrimonio` -> Gestão de Patrimônio & Ativos Imobilizados
- `/erp?tab=agro` -> Agro, Balança Rodoviária 80t & Silos MT
- `/erp?tab=varejo` -> Varejo, Balança Toledo Prix 6 & Self-Checkout
- `/erp?tab=comercial` -> Comercial B2B & Propostas de Eventos
- `/erp?tab=customer360` -> Customer 360° & Scoring Kytto (0-1000)
- `/erp?tab=os` -> Ordens de Serviço & Manutenção 360°
- `/erp?tab=expedicao` -> Expedição, Romaneios & Rotas Tangará MT
