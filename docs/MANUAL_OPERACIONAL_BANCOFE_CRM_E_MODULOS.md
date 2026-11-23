# BANCOFE — MANUAL OPERACIONAL DE GESTÃO MODULAR, CRM FINANCEIRO 360° & CENTRAL DE TERMOS
**Plataforma Integrada de Operações Bancárias, FIDC, Crédito PJ, Onboarding KYB e Governança Multi-Negócio**  
*Ecossistema Corporativo BancoFe & Holding Kytto — Versão de Produção 2.0.0 (Novembro/2026)*

---

## 1. RESUMO EXECUTIVO & ARQUITETURA DE PRODUÇÃO

O ecossistema **BancoFe** foi estruturado com base nos princípios de modularidade, resiliência bancária e experiência do usuário (UX) minimalista, inspirada no padrão de excelência do **Nubank** (destaque roxo `#820AD1`, tipografia limpa, números expressivos, ausência de fricção e operações em 1 clique).

A plataforma unifica a governança de **8 unidades de negócio autônomas** e uma esteira integrada de **Operações Financeiras & CRM 360°**, integrando o onboarding cadastral (KYB/KYC), verificação de conformidade em listas restritivas (OFAC, CSNU, CEAF, CEPIM, CGF - Trabalho Escravo e CEIS/TCU), consulta ao Sistema de Informações de Crédito (SCR) do Banco Central do Brasil, formalização de termos regulatórios digitais, emissão de Cédulas de Crédito Bancário (CCB Eletrônica - Lei 10.931/04) e liquidação instantânea via Pix BACEN.

### Unidades de Negócio Integradas no Catálogo Oficial
1. **BancoFe — Core Banking & Instituição de Pagamento**: Liquidação Pix SPI/DICT, emissão de Boletos FEBRABAN, contas gráficas digitais, Open Finance Bacen e conciliação em partida dobrada.
2. **BancoFe — Operações Financeiras & CRM 360°**: Esteira completa de crédito estruturado, mesa algorítmica de risco, simulador SAC/PRICE, emissão de CCB eletrônica, antecipação de NF-e SEFAZ, Cadastro 360° Corporativo e Vault Documental.
3. **BancoFe Agro & Safra MT**: Gestão de safras, CPR Barter (Física e Financeira), pesagem em balança rodoviária, armazenagem e compliance ambiental SICAR/SEMA.
4. **BancoFe Logística & Frotas Tangará**: Rastreamento de frotas e motoboys via GPS, roteirização multiobjetivo inteligente e controle de combustíveis.
5. **BancoFe Crédito PJ & Antecipação**: Limites de capital de giro rotativo, score proprietário de bureau e convênios corporativos.
6. **Holding Kytto Controladoria & Indústria**: Governança corporativa, usinas de concreto e britagem, ativos patrimoniais, auditoria fiscal SEFAZ-MT e DRE consolidado.
7. **BancoFe Gastronomia — Restaurante Zuma Cozinha Oriental**: PDV Touch Frente de Caixa, KDS de Cozinha por praças (sushibar, wok, fritadeira, bar), mapa de 27 mesas e delivery.
8. **BancoFe Varejo — Zuma Moda & Boutique**: Grade de peças P/M/G/GG, código de barras EAN-13, provador, malas condicionais e crediário próprio.

---

## 2. GESTÃO MODULAR MULTI-NEGÓCIO NO `/admin`

No painel administrativo (`/admin` e `/admin/modulos`), os gestores corporativos possuem autonomia total para parametrizar o ecossistema sem intervenção no código-fonte:

- **Adicionar Módulo**: Permite criar novos módulos para qualquer empresa do catálogo, definindo nome, rota de destino (`defaultPath`), ícone dinâmico do Lucide, permissões de acesso (`admin`, `user` ou `all`), domínios de navegação e metas de SLA.
- **Modificar Módulo**: Edição em tempo real de nomenclaturas, badges informativos, cores de destaque e configurações de telemetria.
- **Excluir Módulo**: Exclusão segura com modal de confirmação em duas etapas para prevenção de acidentes operacionais.
- **Alternar Ativação (Toggle Switch)**: Ativação e desativação instantânea com reflexo imediato na barra de navegação lateral.
- **Reordenação Inteligente**: Ajuste da ordem dos módulos via botões intuitivos de subida e descida.
- **Telemetria & Cálculos Completos**: Monitoramento do SLA de uptime (99.99%), latência média em milissegundos, volume transacionado mensal e economia de custos gerada aos clientes.

---

## 3. BANCOFE — OPERAÇÕES FINANCEIRAS & CRM 360°

A esteira operacional conecta o comercial à mesa de crédito da holding, permitindo alta liquidez e segurança jurídica em operações de fomento:

### 3.1 Funil Pipeline Kanban (6 Estágios)
1. **1. Prospecção & Originação (`prospeccao`)**: Entrada de novas oportunidades geradas pelos canais comerciais ou empresas parceiras.
2. **2. Qualificação & KYC (`qualificacao`)**: Checagem de documentos constitutivos, certidões negativas (CND Federal, FGTS, SEFAZ-MT) e poderes de representação.
3. **3. Mesa de Crédito & SCR (`mesa_credito`)**: Análise automatizada de score Serasa (0 a 1000) e consulta direta ao Sistema de Informações de Crédito (SCR) do Banco Central do Brasil.
4. **4. Comitê de Alçada (`comite_aprovacao`)**:
   - **Alçada Nível 1 (Até R$ 500k)**: Parecer do Analista Pleno em 1 clique.
   - **Alçada Nível 2 (R$ 500k a R$ 2M)**: Parecer técnico do Gerente de Risco com análise de liquidez corrente e DRE.
   - **Alçada Nível 3 (Acima de R$ 2M)**: Decisão unânime do Comitê Executivo e Diretoria da Holding Kytto com garantia real hipotecária ou alienação fiduciária.
5. **5. Formalização CCB Digital (`formalizacao_ccb`)**: Geração automática da Cédula de Crédito Bancário conforme a Lei nº 10.931/2004, com hash criptográfico SHA-256 e envio para assinatura digital via ICP-Brasil ou Gov.br.
6. **6. Liquidado & Desembolsado (`liquidado`)**: Desembolso em conta gráfica do cliente em D+0 via Pix Direto BACEN / SPI.

### 3.2 Simulador SAC & PRICE Interativo
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
- Status da carteira BancoFe: **Zero Inadimplência (>15 dias e >90 dias = 0,00%)** com R$ 23,77 milhões em esteira ativa.

---

## 4. CADASTRO 360° CORPORATIVO & MESA KYB/KYC

Acesso direto via rotas `/admin/cadastro-360` e `/cadastro-360`.

O Cadastro 360° consolida uma visão holística de cada empresa e produtor parceiro do grupo através de 8 abas especializadas:

1. **Dados Cadastrais & Domicílio Bancário**:
   - Dados completos da Receita Federal (CNPJ, Razão Social, Nome Fantasia, Fundação, Porte, Regime Tributário, CNAE Primário e Secundários, Capital Social).
   - Endereço da sede e contatos oficiais dos diretores e departamento financeiro.
   - Conta Gráfica no BancoFe (Agência 0001, Conta Corrente Digital, Chave Pix, Trava de Domicílio Bancário com 100% de retenção registrada na CERC/CIP).
2. **Quadro Societário (QSA) & Beneficiários Finais (UBO)**:
   - Identificação de todos os sócios com percentual de participação, cargo administrativo, CPF e checagem de PEP (Pessoa Politicamente Exposta).
   - Beneficiário Final conforme Instrução Normativa RFB nº 2.119/2022.
3. **Compliance, PLD-FT & Listas Restritivas**:
   - Varredura automatizada em tempo real contra 6 bases sancionatórias:
     - **OFAC Sanctions (EUA)**
     - **CSNU (Conselho de Segurança da ONU)**
     - **CEAF (Cadastro de Expulsões da Administração Federal)**
     - **CEPIM (Entidades Privadas Sem Fins Lucrativos Impedidas)**
     - **CGF / Lista Suja do Trabalho Escravo (Ministério do Trabalho e Emprego - MTE)**
     - **CEIS / TCU (Cadastro de Inidôneos e Suspensos)**
   - Score de conformidade (95 a 100/100) com classificação de risco baixa e carimbo de data/hora.
4. **Balanço Sintético, DRE & Rating CMN 2.682/99**:
   - Faturamento dos últimos 12 meses, EBITDA anual, Margem EBITDA %, Lucro Líquido, Ativo Total e Patrimônio Líquido.
   - Indicadores de solvência: Índice de Liquidez Corrente, Múltiplo de Alavancagem (Dívida Líquida / EBITDA) e Grau de Endividamento.
   - Score de Bureau (0 a 1000) e Rating de Risco Bancário (AA a H) com provisão de PDD calculada.
5. **Limites de Crédito Operacionais Aprovados por Produto**:
   - Limite Global Aprovado, Limite Tomado e Limite Disponível em tempo real.
   - Sublimites operacionais: Capital de Giro (CCB), Desconto de Duplicatas & Recebíveis, Financiamento Agro / CPR Barter, Financiamento de Frotas/Carretas e Fiança Bancária.
6. **Garantias & Colaterais Cadastrados**:
   - Alienação Fiduciária de Imóveis com número de matrícula, cartório de registro e LTV (Loan-to-Value %).
   - Penhor Agrícola de grãos (sacas de soja/milho em armazém credenciado).
   - Cessão fiduciária de recebíveis com trava de domicílio registrada na CERC.
   - Fiança e aval solidário dos sócios.
7. **Histórico de Operações & Contratos Vigentes**:
   - Relação de todos os contratos ativos no ecossistema, parcelas pagas, parcelas vincendas, taxa mensal e índice de pontualidade histórica 100%.
8. **Termos Digitais Vinculados**:
   - Lista dos 7 termos regulatórios vinculados ao cliente, com código identificador, status ("Assinado"), signatário, IP, data e hash SHA-256.

---

## 5. PRÉ-CADASTRO & VAULT DOCUMENTAL DIGITAL

Acesso direto via rotas `/admin/pre-cadastro`, `/pre-cadastro`, `/admin/documentos` e `/documentos`.

O Vault Documental gerencia o checklist normativo de **13 documentos regulatórios** exigidos pelo Banco Central e políticas de crédito:

| Código | Documento Normativo | Categoria | Obrigatoriedade | Validade Típica |
| :--- | :--- | :--- | :--- | :--- |
| `DOC-01` | **Cartão CNPJ / Comprovante de Inscrição RFB** | Cadastral | Obrigatório | 90 dias |
| `DOC-02` | **Contrato Social Consolidado ou Estatuto + Ata** | Cadastral | Obrigatório | Vigente |
| `DOC-03` | **Documento Oficial dos Sócios com Foto (RG/CNH)** | Cadastral | Obrigatório | Vigente |
| `DOC-04` | **Comprovante de Endereço / Sede Social** | Cadastral | Obrigatório | 90 dias |
| `DOC-05` | **Balanço Patrimonial dos 2 Últimos Exercícios (com CRC)** | Financeiro | Obrigatório | Anual |
| `DOC-06` | **Demonstração do Resultado do Exercício (DRE)** | Financeiro | Obrigatório | Anual |
| `DOC-07` | **Relação de Faturamento 12 Meses (PGDAS/SPED)** | Financeiro | Obrigatório | 30 dias |
| `DOC-08` | **Certidão Conjunta Federal (PGFN), FGTS e CNDT** | Certidões | Obrigatório | 180 dias |
| `DOC-09` | **Declaração de IRPF e Recibo dos Sócios** | Financeiro | Obrigatório | Anual |
| `DOC-10` | **Matrícula do Imóvel com Ônus ou CCIR/CAR Agrícola** | Garantias | Condicional | 30 dias |
| `DOC-11` | **Comprovante de Conta BancoFe & Trava CERC** | Garantias | Obrigatório | Vigente |
| `DOC-12` | **Declaração de Propósito & Origem de Recursos (PLD)** | Compliance | Obrigatório | Anual |
| `DOC-13` | **Certidões Estaduais (SEFAZ-MT) e Municipais** | Certidões | Obrigatório | 90 dias |

### Recursos do Vault Digital:
- **Upload com Hash Criptográfico**: Cálculo instantâneo de Hash SHA-256 para garantia de imutabilidade e não-repúdio.
- **Workflow de Análise em 3 Estágios**: `Pendente de Envio`, `Em Análise Técnica`, `Aprovado pelo Compliance` ou `Recusado com Justificativa`.
- **Controle de Expiração de Certidões**: Alertas automáticos para certidões com prazo residual inferior a 30 dias.
- **Cálculo da Taxa de Completude Cadastral**: Atualização em tempo real da barra percentual do dossiê.

---

## 6. CENTRAL DE TERMOS CONTRATUAIS & ASSINATURA ELETRÔNICA

Acesso direto via rotas `/admin/termos` e `/termos`.

A central reúne as minutas contratuais e regulatórias padronizadas do BancoFe:

1. **Termo de Consentimento para Consulta ao SCR / Banco Central**:
   - Normativa: *Resolução CMN nº 4.571/2017 e Resolução BCB nº 105/2021*.
   - Autorização irrevogável para verificação de endividamento e coobrigações no Registrato.
2. **Termo de Abertura de Conta Gráfica & Domicílio Bancário**:
   - Normativa: *Resolução BCB nº 96/2021 e Circular BACEN nº 3.952/2019*.
   - Vinculação de conta gráfica ao BancoFe (Código 799) com cláusula de liquidação centralizada.
3. **Termo de Adesão à Política de Prevenção à Lavagem de Dinheiro (PLD-FT)**:
   - Normativa: *Lei Federal nº 9.613/1998 e Circular BACEN nº 3.978/2020*.
   - Declaração de origem lícita de recursos e conformidade com sanções internacionais.
4. **Termo de Compartilhamento de Dados Open Finance Brasil**:
   - Normativa: *Resolução Conjunta nº 1/2020 BACEN/CMN*.
   - Intercâmbio seguro de históricos creditícios para abatimento de taxas de juros.
5. **Termo de Cessão Fiduciária de Recebíveis & Trava de Domicílio**:
   - Normativa: *Lei nº 9.514/1997 e Lei nº 10.931/2004*.
   - Cessão fiduciária de duplicatas e recebíveis de cartões registrada na CERC/CIP.
6. **Termo de Constituição de Garantias Reais & Fiança Solidária**:
   - Normativa: *Código Civil Brasileiro (Arts. 818 e seguintes)*.
   - Aval solidário dos sócios com renúncia ao benefício de ordem.
7. **Cédula de Crédito Bancário Eletrônica (CCB)**:
   - Normativa: *Lei Federal nº 10.931/2004 e MP nº 899/2019*.
   - Título executivo extrajudicial com assinatura eletrônica avançada (Lei 14.063/2020).

---

## 7. HOMOLOGAÇÃO & VALIDAÇÃO INTEGRAL EM PRODUÇÃO (PRD)

A homologação em produção foi executada de forma automatizada através do script `scripts/validate-all-links.ts` apontando para o serviço ativo no **Google Cloud Run** (`erp-bancofe` em `southamerica-east1`):

```
================================================================
VALIDAÇÃO INTEGRAL DE LINKS & ROTAS BANCOFE EM PRODUÇÃO (PRD)
Base URL: https://erp-bancofe-243135142712.southamerica-east1.run.app
Total de rotas testadas: 84
================================================================

[200] 135ms | /admin                                   | Gestão Multi-Negócio de Módulos (Novo)
[200] 129ms | /admin/modulos                           | Alias direto para Gestão de Módulos
[200] 137ms | /admin/crm-financeira                    | Painel BancoFe — Operações Financeiras & CRM 360°
[200] 132ms | /admin/operacoes-financeiras             | Alias direto Operações Financeiras
[200] 134ms | /admin/cadastro-360                      | Painel BancoFe — Cadastro 360° Corporativo
[200] 135ms | /admin/pre-cadastro                      | Painel BancoFe — Pré-Cadastro & Vault Documental
[200] 136ms | /admin/documentos                        | Painel BancoFe — Dossiê Documental
[200] 137ms | /admin/termos                            | Painel BancoFe — Central de Termos & SCR
[200] 134ms | /cadastro-360                            | Rota amigável Cadastro 360°
[200] 135ms | /pre-cadastro                            | Rota amigável Pré-Cadastro
[200] 136ms | /documentos                              | Rota amigável Documentos
[200] 137ms | /termos                                  | Rota amigável Termos
[200] 134ms | /api/bancofe/cadastro360/metricas        | API Métricas Executivas do Cadastro 360
[200] 192ms | /api/bancofe/cadastro360/clientes        | API Listagem de Clientes 360 com Filtros
... (84 rotas validadas)
================================================================
RESUMO DA VALIDAÇÃO EM PRD:
Total testado : 84 rotas
Sucessos (200): 84 rotas
Falhas        : 0 rotas
Taxa de Êxito : 100.0%
================================================================
```

---

## 8. MATRIZ DE ROTEAMENTO & ENDPOINTS DA PLATAFORMA

| Rota Web / SPA | Tipo | Unidade / Módulo | Descrição Operacional |
| :--- | :--- | :--- | :--- |
| `/admin` | Frontend | Governança | Gestão Multi-Negócio de Módulos BancoFe |
| `/admin/cadastro-360` | Frontend | Cadastro 360 | Painel Corporativo 360° com 8 abas |
| `/admin/pre-cadastro` | Frontend | Onboarding | Vault Documental com 13 documentos |
| `/admin/termos` | Frontend | Compliance | Central de Termos & Consentimentos SCR |
| `/admin/crm-financeira` | Frontend | Operações & CRM | Funil Kanban, Mesa de Crédito e Simulador |
| `/api/bancofe/cadastro360/metricas` | REST API | Backend 360 | Métricas de limites e completude |
| `/api/bancofe/cadastro360/clientes` | REST API | Backend 360 | CRUD e filtros de empresas parceiras |
| `/api/admin/operacoes-financeiras/crm/gestao` | REST API | Mesa Crédito | Métricas e alçadas da mesa |
| `/api/health` | REST API | Core Banking | Healthcheck e integridade de ledger |

---
---

## 9. RESOLUÇÃO DE INCIDENTE: BLINDAGEM DO FRONTEND (PROCESS IS NOT DEFINED)

Durante a homologação em produção no Google Cloud Run, identificou-se uma ocorrência de tela branca decorrente da avaliação indevida de variáveis Node.js (`process.argv` e `process.env`) no runtime do browser.

### Causa Raiz Identificada
1. A biblioteca de integração MCP (`src/integrations/mcps/server/mcp.server.ts`) continha uma cláusula de execução CLI no nível superior do arquivo: `if (import.meta.url === \`file://\${process.argv[1]}\`)`. Ao ser importada pela interface de cockpit, o bundler Vite compilou essa chamada para o browser sem o objeto `process` definido.
2. O formulário de login padrão redirecionava para uma rota estática legada em vez de respeitar o parâmetro dinâmico `returnTo`.

### Solução Aplicada e Homologada
1. **Shims Globais de Proteção**: Injeção de shim `window.process = { env: { NODE_ENV: 'production' }, argv: [], ... }` e `window.global = window` no cabeçalho do `client/index.html`.
2. **Definições no Bundler Vite**: Adição do bloco `define: { "process.env": {}, global: "globalThis" }` em `vite.config.ts`.
3. **Guarda Segura em MCP Server**: Condicional `typeof process !== 'undefined' && Array.isArray(process?.argv) && process.argv[1] && ...` garantindo total neutralidade em navegadores.
4. **Redirecionamento Inteligente de Autenticação**: O endpoint `/api/admin/login` e o formulário `/login` agora respeitam rigorosamente `returnTo`, direcionando o usuário diretamente para `/admin/cadastro-360` ou `/admin` após a autenticação bem-sucedida.
5. **Validação E2E com Navegador Headless (Puppeteer)**: Executados testes de montagem de tela, preenchimento de login e transição de páginas em PRD (`erp-bancofe-00026-r6h`), atingindo **0 erros** no console e 100% das 84 rotas com HTTP 200.

---

*Manual homologado para operação contínua pelo BancoFe S.A. e Holding Kytto.*
