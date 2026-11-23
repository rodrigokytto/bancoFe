# Manual Executivo — Gestão de Módulos por Negócio no BancoFe

**Plataforma:** BancoFe — Ecossistema Corporativo Multi-Negócio & ERP 360°  
**Padrão de UX & Design:** Minimalismo Corporativo Estilo Fintech / Nubank  
**Painel de Administração:** `https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin`  
**Repositório GitHub:** `https://github.com/rodrigokytto/bancoFe`  
**Data:** 23 de Novembro de 2026  
**Status:** Homologado em Produção e Versionado  

---

## 1. Visão Geral da Arquitetura Multi-Negócio

O sistema **BancoFe** foi estruturado com uma arquitetura **multi-negócio (multi-tenant corporativo)** de alta fidelidade visual, unindo a sobriedade e minimalismo das melhores fintechs globais (como o **Nubank**) à robustez operacional e completude de dados de um ERP 360°. Cada unidade de negócio do ecossistema possui seu próprio catálogo de módulos, cálculos operacionais, KPIs de telemetria, permissões e rotas de acesso dedicadas.

### 🏢 Unidades de Negócio Pré-Configuradas:
1. **BancoFe — Open Finance & Banking Digital:** Soluções de Open Finance, Pix, Contabilidade Dupla (Double-Entry Ledger), Bureau de Crédito, Boletos Febraban (CNAB240/400) e Web3 Drex.
2. **Zuma Cozinha Oriental & Gastronomia:** Operação gastronômica 360°, Frente de Caixa Touch (PDV), KDS de Praças de Cozinha, App do Garçom, Delivery e Telemetria Térmica IoT.
3. **Zuma Moda, Roupas & Estilo:** Varejo têxtil, Provador, Grade de Tamanhos, Vitrine Online e CRM com Fidelidade.
4. **Zuma Agro & Safra MT:** Agronegócio no Mato Grosso, Pesagem em Balança Rodoviária, Controle de Sacas/Hectare, Contratos Futuros de Barter e Frotas de Colheitadeiras.
5. **Holding Kytto & Concreto:** Controladoria Consolidada do Grupo, DRE Geral, Auditoria SEFAZ e Planejamento M&A.

---

## 2. Princípios de UX & Minimalismo Estilo Nubank

A interface foi redesenhada priorizando clareza, objetividade e elegância:

- **Paleta Temática Nubank (`#820AD1` / Roxo Sofisticado):** Destaque nos botões de ação primária, pílulas de navegação ativa e switches de toggle.
- **Botão de Privacidade / Olho (`👁️ Ocultar/Exibir Valores`):** Permite alternar a visualização de valores monetários sensíveis para reuniões executivas e apresentações.
- **Navegação em Pílulas Horizontais (Pill Tabs):** Seletor de empresas estilo abas do Nubank, fluido e com contadores dinâmicos de módulos.
- **Cartão Executivo com Grandes Números Monospaçados:**
  - **Volume Mensal Operado:** Valor total movimentado pela unidade de negócio com formatação `pt-BR`.
  - **Transações & Requisições:** Volume consolidado de chamadas com latência média em milissegundos.
  - **Disponibilidade (SLA 24/7):** Uptime agregado do cluster e serviços (ex.: 99.98% / 99.99%).
  - **Economia & ROI Mensal:** Ganho financeiro direto proporcionado pela automação dos módulos ativos, correlacionado com horas de trabalho economizadas pela equipe.
- **Barra de Ativação Minimalista:** Indicador de progresso com porcentagem de operação ativa da empresa.

---

## 3. Dados Completos e Memória de Cálculo

Ao clicar em **"Ver Cálculos e Indicadores Completos"**, o painel expande a auditoria detalhada:

1. **Cálculo de Eficiência da Equipe:**
   $$\text{Horas Economizadas} = \frac{\text{Economia Mensal Total}}{\text{Custo Médio Homem-Hora (R\$ 65,00)}}$$
   Exemplo: R$ 82.600 economizados no BancoFe representam **1.271 horas de equipe liberadas/mês** para foco em expansão comercial.
2. **Conformidade Regulatória & Fiscal:**
   - Auditoria contínua de padrões Bacen Open Finance, SPED SEFAZ-MT e Anvisa (100% compliant).
3. **Métricas Inline em Cada Cartão de Módulo:**
   - **SLA de Uptime:** Indicador de disponibilidade com status colorido pulsante (`● 99.99% SLA`).
   - **Latência de Resposta:** Tempo de resposta da API (ex.: `⏱ 12ms`).
   - **Volume de Requisições:** Total de chamadas mensais computadas (ex.: `📊 423.900 req/mês`).
   - **Impacto Financeiro:** Economia mensal ou volume operado gerado pelo módulo (ex.: `💰 R$ 28.900 economizados`).
   - **Rota Clicável Direta:** Link de acesso rápido para navegação imediata (`/pagamentos ↗`).
   - **Switch Minimalista de Ativação:** Alternância imediata sem recarregar a tela.

---

## 4. Funcionalidades do Painel `/admin`

1. **Adicionar Módulo Customizado (`+ Adicionar Módulo`):**
   - Live Preview visual em tempo real.
   - Nome, Slug, Descrição e Rota padrão.
   - Permissão (*Todos*, *Gerentes*, *Admin*).
   - Badge com 8 paletas de cores (incluindo *Roxo Nubank*, *Verde Esmeralda*, *Azul Financeiro*, etc.).
   - Catálogo de ícones Lucide integrado com busca instantânea.
2. **Modificar Módulo Existente (`Modificar`):**
   - Edição de qualquer atributo técnico ou visual com reflexo em tempo real.
3. **Excluir Módulo (`Excluir`):**
   - Confirmação segura com modal de auditoria.
4. **Reordenação Hierárquica (▲ / ▼):**
   - Reposicionamento da prioridade do módulo na barra lateral com um clique.
5. **Cadastrar Nova Unidade de Negócio (`+ Novo Negócio`):**
   - Inclusão de novas empresas ou holdings do grupo.
6. **Restauração de Padrões (`Restaurar Padrão`):**
   - Reset seguro para as configurações originais de fábrica.

---

## 5. Testes Automatizados e Homologação

- **Suíte de Testes:** Vitest em `server/adminModulos.test.ts`.
- **Status:** 8 de 8 testes aprovados com 100% de sucesso.
- **Build de Produção:** Compilado e gerado em `dist/`.
- **Repositório GitHub:** Sincronizado e enviado na branch `main` de `rodrigokytto/bancoFe`.
- **Serviço GCP Cloud Run:** `erp-bancofe` em `https://erp-bancofe-5xsi5uyoda-rj.a.run.app`.
