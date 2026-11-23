# BANCOFE — MANUAL OPERACIONAL DE GESTÃO MODULAR & CRM FINANCEIRO 360°
**Plataforma Integrada de Operações Bancárias, FIDC, Crédito PJ e CRM Multi-Negócio**  
*Ecossistema Corporativo BancoFe & Holding Kytto — Versão de Produção 1.0.0 (Novembro/2026)*

---

## 1. RESUMO EXECUTIVO & ARQUITETURA

O ecossistema **BancoFe** foi estruturado com base nos princípios de modularidade, alta disponibilidade e experiência do usuário (UX) minimalista e efetiva, inspirada no padrão de excelência do **Nubank** (destaque roxo `#820AD1`, tipografia limpa, números expressivos e operações em 1 clique).

A plataforma unifica a governança de **8 unidades de negócio autônomas** e uma esteira integrada de **Operações Financeiras & CRM 360°**, cobrindo desde a prospecção inicial de clientes e análise cadastral (KYC/SCR Bacen) até a formalização de Cédulas de Crédito Bancário (CCB) e liquidação instantânea via Pix BACEN.

### Unidades de Negócio Integradas no Catálogo Oficial
1. **BancoFe — Core Banking & Instituição de Pagamento**: Liquidação Pix SPI/DICT, emissão de Boletos FEBRABAN, contas correntes e COSIF.
2. **Holding Casanova Kytto**: Governança corporativa, gestão de participações societárias e empreendimentos imobiliários.
3. **Zuma Restaurante & Gastronomia**: PDV Touch, KDS de Cozinha por praças, mapa de mesas e delivery.
4. **Zuma Moda & Boutique**: Gestão de vestuário, coleções sazonais, grade de tamanhos e catálogo omnicanal.
5. **Agro MT Fazendas, Grãos & Sementes**: Gestão de safras, CPR Barter, armazenagem e compliance ambiental SICAR/SEMA.
6. **Kytto Logística & Frotas Tangará**: Rastreamento de entregadores via GPS, roteirização inteligente e tabela de fretes.
7. **BancoFe Crédito PJ & Antecipação**: Limites de capital de giro, score de crédito e convênios corporativos.
8. **BancoFe — Operações Financeiras & CRM 360°**: Esteira completa de crédito estruturado, mesa algorítmica de risco, simulador de amortização SAC/PRICE, emissão de CCB eletrônica e antecipação de NF-e SEFAZ.

---

## 2. GESTÃO MODULAR MULTI-NEGÓCIO NO `/admin`

No painel administrativo (`/admin` e `/admin/modulos`), os gestores possuem autonomia total para parametrizar o ecossistema sem necessidade de alterações no código-fonte:

- **Adicionar Módulo**: Permite criar novos módulos para qualquer empresa do catálogo, definindo nome, rota de destino (`defaultPath`), ícone dinâmico do Lucide, permissões de acesso (`admin`, `user` ou `all`), domínios de navegação e metas de SLA.
- **Modificar Módulo**: Edição em tempo real de nomenclaturas, badges informativos, cores de destaque e configurações de telemetria.
- **Excluir Módulo**: Exclusão segura com modal de confirmação em duas etapas para prevenção de acidentes operacionais.
- **Alternar Ativação (Toggle Switch)**: Ativação e desativação instantânea com reflexo imediato na sidebar de navegação.
- **Reordenação Inteligente**: Ajuste da ordem dos módulos via botões intuitivos de subida e descida.
- **Telemetria & Cálculos Completos**: Monitoramento do SLA de uptime (99.98%+), latência média em milissegundos, volume transacionado mensal e economia de custos gerada aos clientes.

---

## 3. BANCOFE — OPERAÇÕES FINANCEIRAS & CRM 360°

A nova esteira operacional foi projetada para conectar o comercial e a mesa de crédito da holding, permitindo alta liquidez e segurança jurídica em operações financeiras de grande porte.

### 3.1 Funil Pipeline Kanban (6 Estágios)
1. **1. Prospecção & Originação (`prospeccao`)**: Entrada de novas oportunidades geradas pelos canais comerciais ou empresas parceiras.
2. **2. Qualificação & KYC (`qualificacao`)**: Checagem de documentos constitutivos, certidões negativas (CND Federal, FGTS, SEFAZ-MT) e poderes de representação.
3. **3. Mesa de Crédito & SCR (`mesa_credito`)**: Análise automatizada de score Serasa (0 a 1000) e consulta direta ao Sistema de Informações de Crédito (SCR) do Banco Central do Brasil.
4. **4. Comitê de Alçada (`comite_aprovacao`)**:
   - **Alçada Nível 1 (Até R$ 500k)**: Aprovação algorítmica instantânea em 1 clique (Score > 820 e garantia de duplicatas).
   - **Alçada Nível 2 (R$ 500k a R$ 2M)**: Parecer técnico do Gerente de Crédito com análise de liquidez corrente e DRE.
   - **Alçada Nível 3 (Acima de R$ 2M)**: Decisão unânime do Comitê Executivo e Diretoria da Holding Kytto com garantia real hipotecária ou alienação fiduciária.
5. **5. Formalização CCB Digital (`formalizacao_ccb`)**: Geração automática da Cédula de Crédito Bancário conforme a Lei nº 10.931/2004, com hash criptográfico SHA-256 e envio para assinatura digital via ICP-Brasil ou Gov.br.
6. **6. Liquidado & Desembolsado (`liquidado`)**: Desembolso em conta corrente do cliente em D+0 via Pix Direto BACEN / SPI.

### 3.2 Simulador SAC & PRICE Interativo
O simulador financeiro disponibiliza cálculos matemáticos precisos em tempo real:
- **Amortização Constante (SAC)**: Amortização linear fixa mês a mês, com parcelas decrescentes à medida que o saldo devedor é amortizado.
- **Sistema Francês (PRICE)**: Parcelas fixas e uniformes ao longo de todo o prazo contratado.
- **Cálculo Regulamentar de IOF**: Alíquota fixa de 0,38% somada ao IOF diário proporcional ao prazo de vencimento (conforme legislação da Receita Federal).
- **Custo Efetivo Total (CET)**: Taxa percentual anualizada consolidada, incluindo TAC (Tarifa de Abertura de Crédito) e encargos.
- **Cronograma Mês a Mês**: Tabela transparente exibindo saldo inicial, parcela, amortização, juros e saldo final devedor.

### 3.3 Gestão de Carteira & Provisão PDD (Resolução CMN 2.682/99)
- Apuração regulatória do provisionamento para perdas potenciais em 9 níveis de risco:
  - **Rating AA**: 0,00% de provisão (Excelente)
  - **Rating A**: 0,50% de provisão
  - **Rating B**: 1,00% de provisão
  - **Rating C**: 3,00% de provisão
  - **Rating D**: 10,00% de provisão
  - **Rating E a H**: 30% a 100% de provisão
- Status atual da carteira BancoFe: **Zero Inadimplência (>15 dias e >90 dias = 0,00%)** com R$ 23,77 milhões em esteira ativa.

### 3.4 Antecipação de Recebíveis & NF-e 4.0 SEFAZ
- Módulo de validação automática de chaves de acesso de 44 dígitos da Nota Fiscal Eletrônica (NF-e).
- Checagem de lastro mercantil, verificação de manifesto do destinatário e geração de borderô de desconto com liquidação Pix D+0.

---

## 4. APIS REST & ESPECIFICAÇÃO DE INTEGRAÇÃO

A esteira de Operações Financeiras disponibiliza endpoints seguros e documentados:

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/operacoes-financeiras/crm/gestao` | Métricas agregadas da mesa, volume de pipeline, ticket médio e distribuição |
| `GET` | `/api/admin/operacoes-financeiras/crm/oportunidades` | Listagem completa de oportunidades com filtros por estágio, empresa e termo |
| `POST` | `/api/admin/operacoes-financeiras/crm/oportunidades` | Criação de nova oportunidade no funil comercial |
| `PATCH` | `/api/admin/operacoes-financeiras/crm/oportunidades/:id` | Avanço de estágio, alteração de valor, rating e registro de histórico |
| `DELETE` | `/api/admin/operacoes-financeiras/crm/oportunidades/:id` | Exclusão de oportunidade cancelada ou reprovada |
| `POST` | `/api/admin/operacoes-financeiras/crm/simular` | Motor de cálculo financeiro SAC / PRICE / IOF / CET em tempo real |
| `GET` | `/api/admin/notificacoes` | Central de notificações e alertas operacionais em tempo real |
| `GET` | `/api/v1/admin/modulos/operacoes_financeiras_crm` | Catálogo de módulos customizados da empresa de Operações Financeiras |
| `GET` | `/api/health` | Healthcheck institucional da aplicação e integridade contábil COSIF |

---

## 5. HOMOLOGAÇÃO & DEPLOY EM PRODUÇÃO NO GOOGLE CLOUD RUN

- **Ambiente de Produção**: Google Cloud Run (Managed Serverless)
- **Região**: `southamerica-east1` (São Paulo, Brasil)
- **Projeto GCP**: `bancofe-plataforma-kytto`
- **Serviço**: `erp-bancofe`
- **Revisão Ativa**: `erp-bancofe-00024-v6g` (servindo 100% do tráfego)
- **URL Oficial**: `https://erp-bancofe-243135142712.southamerica-east1.run.app`
- **URL Personalizada**: `https://erp-bancofe-5xsi5uyoda-rj.a.run.app`
- **Políticas de Acesso IAM**: Invocação autorizada para o domínio `domain:kytto.com.br`, administradores e service accounts.
- **Resultados da Validação Automatizada (PRD)**:
  - **74 de 74 rotas testadas**: 100% com status HTTP 200/304 OK.
  - **Latência média**: 120ms a 140ms (São Paulo / PRD).
  - **Zero erros 4xx/5xx**: Nenhuma falha detectada em rotas públicas ou privadas.
  - **Suíte de Testes Automatizados**: 33 testes aprovados em 7 suítes no Vitest.
  - **Verificação de Tipagem TypeScript**: 0 erros em `tsc --noEmit`.

---
*Documento homologado pela Diretoria de Tecnologia e Governança BancoFe.*
