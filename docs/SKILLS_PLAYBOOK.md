# Playbook de Skills de IA • BancoFe

Este manual detalha o funcionamento e as diretrizes de uso do **Motor de Skills de IA do BancoFe** (`src/integrations/skills/`).

---

## 1. O que são as Skills no BancoFe?

As **Skills de IA** são módulos determinísticos que encapsulam conhecimento especializado de domínio bancário, contábil, financeiro e regulatório. Elas permitem que agentes inteligentes executem tarefas complexas com rigor matemático, sem alucinações numéricas e em total conformidade com as regras de negócio bancárias.

---

## 2. Módulos de Skills Implementados

### 2.1. Skill Finance Pro (`finance-pro.skill.ts`)
Inspirada nos padrões de análise de crédito e modelagem financeira:
- **Tabela SAC (Sistema de Amortização Constante):**
  - Amortização mensal fixa: $A = \frac{P}{n}$
  - Juros decrescentes calculados sobre o saldo devedor remanescente: $J_t = SD_{t-1} \times i$
  - Prestação mensal: $PMT_t = A + J_t$
- **Tabela PRICE (Sistema Francês de Amortização):**
  - Prestação constante: $PMT = P \times \frac{i \times (1+i)^n}{(1+i)^n - 1}$
  - Amortização crescente e juros decrescentes ao longo do período.
- **Diagnóstico de Liquidez Corporativa:**
  - $\text{Liquidez Corrente} = \frac{\text{Ativo Circulante}}{\text{Passivo Circulante}}$
  - $\text{Liquidez Seca} = \frac{\text{Ativo Circulante} - \text{Estoques}}{\text{Passivo Circulante}}$
  - $\text{Alavancagem} = \frac{\text{Dívida Líquida}}{\text{EBITDA}}$
  - Emissão automática de parecer de crédito (`EXCELLENT`, `STABLE`, `ATTENTION`, `CRITICAL`).

### 2.2. Skill Automação & Agendamento (`automation.skill.ts`)
- **Fechamento Contábil Diário (EOD):** Varre todas as contas COSIF, totaliza movimentações, consolida a câmara SPI/Pix e gera o balancete diário.
- **Conciliação Automática CNAB:** Processa retornos recebidos até as 17:00h e faz o batimento de cobranças em carteira.
- **Apropriação de Rendimentos de Tesouraria:** Aplica a taxa DI diária pro-rata die aos títulos pós-fixados.

### 2.3. Skill Office Documents (`office-docs.skill.ts`)
- **Exportação de Extrato em CSV Padronizado:** Formatação de datas, descrição, categorias e valores em conformidade com o layout de conciliação de ERPs (SAP, Totvs, ContaAzul).
- **Emissão de Comprovantes:** Geração de comprovantes de transferências Pix em Markdown/HTML com todos os campos regulatórios exigidos pelo BACEN (End-to-End ID, pagador, recebedor, data/hora e autenticação digital).

### 2.4. Skill Key User Treinamento & Homologação (`keyuser.skill.ts`)
- Gera documentação oficial para equipes de homologação e usuários-chave (*Key Users*):
  - **Manual do Key User:** Procedimentos operacionais padrão (SOP).
  - **Plano de Testes:** Casos de testes numerados com pré-condições, ações executadas e resultados esperados.
  - **Termo de Aceite:** Documento formal para assinatura de encerramento de homologação em ambiente de homologação/staging.

### 2.5. Skill Análise de Tesouraria & Rentabilidade (`stock-analysis.skill.ts`)
- **Comparação de Rendimentos Líquidos:**
  - Simula investimento em **CDB BancoFe** (indexado ao CDI).
  - Simula **LCA Agro** (isenta de Imposto de Renda para pessoa física conforme Lei nº 11.033/2004).
  - Simula **Tesouro IPCA+** (juro real prefixado + inflação).
  - Aplica automaticamente a tabela regressiva de IR (22,5% até 180 dias; 20% até 360 dias; 17,5% até 720 dias; 15% acima de 720 dias).
