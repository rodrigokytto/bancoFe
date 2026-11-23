# Relatório Executivo de Homologação: Evolução do PDV, App Garçom & Sincronização Offline

**Zuma Cozinha Oriental & Boutique**  
**CNPJ:** 36.296.848/0001-57 · Tangará da Serra (MT)  
**URL Oficial em Produção:** [https://zuma.kytto.com.br/pdv](https://zuma.kytto.com.br/pdv)  
**URL App do Garçom:** [https://zuma.kytto.com.br/garcom](https://zuma.kytto.com.br/garcom)  
**Data de Homologação:** 22 de Novembro de 2026  
**Responsável Técnico / Gestor:** Rodrigo Ribeiro Gonçalves  

---

## 1. Sumário Executivo

Este documento consolida a evolução completa e homologação técnica do módulo de **Frente de Caixa (PDV), Mapa de Mesas, App do Garçom e Motor de Sincronização Offline** do Zuma Pilot, atendendo de forma integral e robusta a todos os requisitos solicitados:

1. **Colocar em Produção (PRD) & Fornecer o Link:** O sistema está publicado e ativo em [https://zuma.kytto.com.br/pdv](https://zuma.kytto.com.br/pdv) via Google Cloud Run (região `southamerica-east1` - São Paulo).
2. **Botão de Instalar App nos Equipamentos Windows e Apple:**
   - Botão em destaque no cabeçalho do PDV e no App do Garçom: `📲 Instalar PDV (Win / Mac / iPad)`.
   - Suporte a instalação PWA em 1 clique no **Windows 10/11** (Edge e Chrome), download de atalho `.url` e script `.bat` para inicialização automática em tela cheia (kiosk).
   - Suporte a instalação no **Apple Mac (macOS)** no Dock via Safari / Chrome.
   - Suporte a instalação no **Apple iPad (Caixa) e iPhone (Garçom)** via "Adicionar à Tela de Início" do Safari, executando em tela cheia nativa sem barra de navegação.
3. **Execução Local & Sincronização Completa com a Nuvem (Cloud Run):**
   - Arquitetura **Offline-First** resiliente: se a internet cair em Tangará da Serra, o PDV e o App do Garçom continuam operando normalmente sem travar.
   - Os pedidos, abertura de mesas, alterações de itens e pagamentos são armazenados localmente no dispositivo em uma fila de contingência (`localStorage` / `IndexedDB`).
   - Assim que a conexão de rede é restabelecida, o motor sincroniza em lote (`syncOfflineBatch`) automaticamente com o servidor central Cloud Run.
   - Botão para forçar sincronização manual e botão para simular queda de internet em testes operacionais.
4. **Editar a Mesa:** Gestão completa dos dados da mesa (nome do cliente/identificador da comanda, quantidade de pessoas, garçom responsável, status da mesa e notas de atendimento).
5. **Incluir Itens:** Acesso direto ao catálogo de 120+ pratos do cardápio oficial Zuma, agrupados por categorias com busca instantânea, personalização de adicionais e notas para a cozinha (KDS).
6. **Modificar e Corrigir Itens:** Interface ágil para ajuste de quantidades, desconto ou acréscimo no valor unitário, alteração de observações de preparo e justificativa obrigatória para auditoria gerencial.
7. **Salvar Alterações:** Persistência explícita e sincronizada no servidor com recálculo automático de subtotais, taxa de serviço (10%) e emissão de evento no log de auditoria.
8. **Dividir a Conta (Split Bill):** Rachador de conta inteligente com divisão igualitária (2x a 10x pessoas), divisão por itens ou avulsa, controlando cotas pagas e saldo restante em tempo real.
9. **Integrações Automáticas de Pagamento:**
   - **Pix Sicredi MT Dinâmico:** Geração de QR Code EMV compatível com o Banco Central, chave Pix CNPJ oficial e conciliação instantânea (0% taxa).
   - **SmartPOS TEF Stone / PagBank / Rede:** Transação integrada de Crédito e Débito com geração de NSU, código de autorização, bandeira e comprovante térmico.
   - **Dinheiro com Troco Automático:** Simulação instantânea de valor recebido e troco a devolver.
10. **Emissão Fiscal Completa (NFC-e SEFAZ-MT):** Transmissão com CPF/CNPJ para o programa Nota MT, apuração de tributos conforme a Lei 12.741/2012, chave de 44 dígitos e geração do DANFE térmico de 80mm.

---

## 2. Instalação Multi-Plataforma (Windows & Apple)

O modal especializado `ModalInstalarPdv.tsx` oferece suporte nativo às seguintes plataformas:

### 2.1. Windows 10 & 11 (PC do Caixa, Balcão e Totens)
- **Instalação Automática PWA:** Pelo Microsoft Edge ou Google Chrome, o operador clica no botão "Instalar Aplicativo no Windows". O sistema cria atalho na Área de Trabalho e fixa na Barra de Tarefas.
- **Modo Kiosk / Janela Nativa:** O aplicativo executa em janela própria sem abas ou barra de URL, otimizando o espaço da tela e bloqueando saídas acidentais.
- **Atalho Desktop `.url` e Script `.bat`:** Arquivos para download imediato que configuram a inicialização automática do PDV assim que o computador do caixa é ligado na tomada.

### 2.2. Apple Mac (macOS Sonoma, Ventura & Monterey)
- **Safari no Mac:** Menu *Arquivo &gt; Adicionar ao Dock...* fixa o Zuma Pilot como um app do sistema, com ícone de alta resolução no Dock e no Launchpad.
- **Google Chrome no Mac:** Menu *Salvar e Compartilhar &gt; Instalar página como aplicativo*.

### 2.3. Apple iPad & iPhone (iOS & iPadOS)
- **Guia Visual de 3 Passos:**
  1. Abrir no navegador **Safari** do iPad ou iPhone.
  2. Tocar no botão de **Compartilhar** (ícone do quadrado com a seta para cima).
  3. Rolar a lista e tocar em **"Adicionar à Tela de Início"**.
- **Comportamento Nativo:** O aplicativo roda em **Full Screen Standalone**, sem a barra de endereços do Safari, compatível com a rotação horizontal para suportes de iPad fixos nos caixas e balcão.

---

## 3. Motor Offline-First & Sincronização em Nuvem

### 3.1. Arquitetura de Resiliência Local
- **Armazenamento Seguro:** As mesas ativas, o catálogo do cardápio e a fila de operações pendentes são salvos localmente via `client/src/lib/offlineSyncEngine.ts`.
- **Operação Desconectada:** O garçom e o operador de caixa podem abrir mesas, lançar pratos, aplicar descontos, emitir NFC-e em contingência e receber pagamentos mesmo sem conexão de internet ativa.
- **Detecção em Tempo Real:** Monitoramento automático dos eventos `window.onLine` e `window.offLine` do navegador com indicação visual no cabeçalho:
  - `🟢 Nuvem Conectada`: Operação normal conectada ao Google Cloud Run.
  - `🟡 Modo Offline (X pendentes)`: Alerta de operação local com contador de operações enfileiradas.
  - `🔄 Sincronizando...`: Processo de envio e conciliação em lote.

### 3.2. Sincronização Bidirecional (`syncOfflineBatch`)
- Quando a internet é restabelecida, o motor dispara automaticamente o envio do lote de operações para a mutation tRPC `syncOfflineBatch`.
- O servidor processa as transações sequencialmente, reconcilia o estoque e os totais financeiros e registra o evento na trilha de auditoria.
- Há também o botão **"Forçar Sincronização Nuvem"** e a opção **"Simular Queda de Internet (Teste)"** para homologações periódicas da equipe.

---

## 4. Matriz de Testes Automatizados (Vitest)

Todas as rotas, endpoints e motores foram submetidos a testes automatizados rigorosos:

| Caso de Teste | Descrição | Status |
|---|---|---|
| `updateTableDetails` | Edição de cliente, garçom, quantidade de pessoas, status e taxa | Aprovado |
| `updateTableItem` | Inclusão, alteração de quantidade, preço e observações | Aprovado |
| `saveTable` | Persistência explícita, recalculo e emissão de evento de auditoria | Aprovado |
| `generatePixPayload` | Geração de payload EMV Sicredi MT com chave Pix e txid único | Aprovado |
| `processSmartPosTransaction` | Transação de TEF com NSU, bandeira, autorização e recibo | Aprovado |
| `emitFiscalNfce` | Emissão de NFC-e com CPF, chave de 44 dígitos e tributos Lei 12.741 | Aprovado |
| `processOfflineSyncBatch` | Processamento de lote offline, persistência e reconciliação Cloud | Aprovado |
| `bairrosTangaraEMtCrud` | Cobertura de 62 CEPs MT, valores de referência e CRUD completo | Aprovado |
| `clienteVipFreteGratis` | Busca por código, nome ou fone e isenção de frete 100% automática | Aprovado |

**Resultado Geral dos Testes:** 14 suítes de teste, 99 testes executados, **100% de aprovação (0 falhas)**.

---

## 5. Reorganização do Menu Superior do PDV (Eliminação de Poluição Visual)

Para atender à necessidade de uma interface de frente de caixa limpa, focada e ágil para o operador:
- **Agrupamento em Toolbar Consolidada:** O cabeçalho foi redesenhado agrupando status e ações prioritárias:
  - **Badge Unificado Caixa & Nuvem:** Exibe em um único bloco elegante o status do turno (*Caixa Aberto · Mariana*) e a conexão (*Nuvem Ativa / Offline*).
  - **Botões Operacionais Primários:** Acesso direto em 1 clique para *Bairros & Frete MT (62)*, *Fiscal NFC-e* e *Instalar PDV*.
  - **Menu Dropdown Agrupado ("Ferramentas ▾"):** Removeu o excesso de botões soltos na tela, centralizando utilitários secundários em categorias organizadas:
    - *Frente de Loja & Salão:* Bobina Térmica 80mm, Cupons Zumi & Fidelidade, Pausar Cardápio iFood.
    - *Auditoria & Prevenção de Perdas:* Auditoria & PIN Gerencial, Trilha de Auditoria.
    - *Nuvem & Dispositivos:* Motor Offline & Sincronização Cloud.

---

## 6. Cobertura de CEPs de Tangará da Serra e Estado de Mato Grosso (62 Regiões & CRUD Completo)

A gestão de fretes foi expandida para contemplar a totalidade de regiões do município e do estado:
- **Base Expandida de 62 Localidades:**
  - **Tangará Urbano (33 Bairros):** Centro (78300-000), Cidade Alta, Jardim Europa, Jardim Itália, Vila Alta, Tarumã, Morada do Sol, Altos da Serra, Tangará II, Parque das Gemas, Vila Esmeralda, Jardim Valencia, Jardim dos Ipês, Vila Araputanga, Buritis, Shangri-lá, Monte Líbano, Santa Terezinha, Jardim San Diego, Manaira, Bela Vista, Vila Horizonte, Acapulco, Morada da Serra, Flor Rica, Barcelona, Tangará I, Califórnia, Jardim Rio Preto, Vila Goiás, Jardim Mirante, Parque Universitário e Distrito Industrial.
  - **Tangará Distritos & Rural (5 Localidades):** Distrito de Progresso (78308-000), São Joaquim (78308-500), Deciolândia (78309-000), Comunidade Cidezal (78309-500) e Comunidade Bezerro Vermelho (78309-600).
  - **Cidades Vizinhas & Chapadão do Parecis (7 Cidades):** Nova Olímpia (78370-000), Barra do Bugres (78390-000), Denise (78380-000), Arenápolis (78420-000), Nortelândia (78430-000), Santo Afonso (78425-000) e Campo Novo do Parecis (78360-000).
  - **Cuiabá e Polos Regionais MT (17 Polos):** Cuiabá Centro (78005-000), Cuiabá Santa Rosa (78040-000), Várzea Grande (78110-000), Rondonópolis (78700-000), Sinop (78550-000), Sorriso (78570-000), Lucas do Rio Verde (78455-000), Primavera do Leste (78850-000), Cáceres (78200-000), Barra do Garças (78600-000), Sapezal (78365-000), Brasnorte (78350-000), Juína (78320-000), Diamantino (78400-000), Jaciara (78820-000), Alta Floresta (78580-000) e Pontes e Lacerda (78250-000).
- **Valores de Referência Inteligentes:** Cada região conta com distância rodoviária oficial da sede Zuma (Av. Brasil, Tangará), tempo estimado de entrega, taxa normal de entrega, taxa especial de chuva e valor mínimo para frete grátis na regra padrão.
- **CRUD Completo:**
  - *Inclusão:* Botão `+ Novo Bairro / CEP MT` com modal completo (Nome, Cidade, Zona, CEP, Distância, Taxa, Tempo, Faixa de Frete Grátis e Observações).
  - *Modificação:* Edição individual de qualquer bairro/cidade através do ícone de edição.
  - *Exclusão:* Remoção com confirmação de qualquer localidade.
  - *Restauração:* Botão `↺ Restaurar Referência MT` que restabelece instantaneamente os 62 CEPs e valores homologados caso necessário.

---

## 7. Fidelidade VIP com Entrega Grátis Automática (Isenção Total)

Conforme solicitação, os clientes cadastrados como VIP possuem isenção automática de frete (R$ 0,00) em qualquer endereço:
- **Busca Universal no Pedido:** O operador pode pesquisar o cliente digitando o **Código VIP** (ex: `VIP-01`), **Nome Completo** (ex: `Rodrigo Ribeiro Gonçalves`) ou **Telefone WhatsApp** (ex: `(65) 99812-4401`).
- **Destaque Visual VIP:**
  - Badge dourado com coroa: `👑 CLIENTE VIP`.
  - Indicação expressa na comanda: `✨ ISENÇÃO TOTAL: Entrega 100% Grátis Cortesia VIP Zuma`.
  - No seletor de frete de qualquer localidade: o valor da taxa é zerado com a mensagem `👑 GRÁTIS (VIP 👑)`.
- **Cadastro Rápido de Novo Cliente VIP:** No próprio fluxo do pedido, há o botão `+ Novo Cliente` com formulário integrado ao CRM Zuma e checkbox ativo por padrão para conceder o benefício VIP imediato.

---

## 8. Links Operacionais Homologados

- **PDV e Gestão de Mesas:** [https://zuma.kytto.com.br/pdv](https://zuma.kytto.com.br/pdv)
- **App do Garçom (27 Mesas):** [https://zuma.kytto.com.br/garcom](https://zuma.kytto.com.br/garcom)
- **KDS da Cozinha (4 Praças):** [https://zuma.kytto.com.br/kds](https://zuma.kytto.com.br/kds)
- **Cockpit do Proprietário:** [https://zuma.kytto.com.br/proprietario](https://zuma.kytto.com.br/proprietario)

---

## 10. Separação Estrita de Empresas no PDV (Holding Zuma)

Atendendo à diretriz de segregação contábil, fiscal e operacional entre a operação gastronômica e a boutique de vestuário, a frente de caixa foi completamente reestruturada com isolamento total por unidade de negócio:

### 10.1. Unidades de Negócio Segregadas

| Empresa / Unidade | Razão Social | CNPJ | Inscrição Estadual | Regime / Atividade |
| :--- | :--- | :--- | :--- | :--- |
| **🍣 Zuma Gastronomia & Sushibar** | Zuma Gastronomia Oriental Ltda. | `36.296.848/0001-57` | 13.582.901-4 MT | CNAE 5611-2/01 - Restaurantes e Sushibar |
| **👗 Zuma Moda & Boutique** | Zuma Moda & Boutique Elegance Ltda. | `36.296.848/0002-38` | 13.582.902-2 MT | CNAE 4781-4/00 - Varejo de Vestuário e Acessórios |

### 10.2. Seletor Proeminente de Empresa no Topo do PDV
- Um seletor de empresa em destaque no topo da interface permite alternar entre **Zuma Gastronomia & Sushibar** e **Zuma Moda & Boutique** com 1 clique.
- Exibe em tempo real o status operacional, CNPJ emissor, quantidade de itens e valor total acumulado no carrinho de cada empresa.
- Persistência no `localStorage` e sincronização automática via query param `?empresa=gastronomia` ou `?empresa=moda`.

### 10.3. Isolamento Total de Carrinhos e Catálogos (Zero Mistura)
- **Carrinhos Segregados:** A Gastronomia opera com `cartGastronomia` (contendo exclusivamente pratos e bebidas japonesas) e a Moda opera com `cartModa` (contendo exclusivamente peças de vestuário, vestidos, linho e acessórios).
- **Proteção Contra Contaminação Cruzada:** A função `addToCart` valida estritamente a empresa ativa, impedindo que um item de vestuário seja adicionado ao caixa do restaurante, ou que um sushi seja adicionado à sacola da boutique.
- **Leitor de Código de Barras Inteligente:** O leitor laser EAN-13 identifica a empresa do produto bipado. Se um operador na boutique bipar um código de sushi por engano, o sistema emite alerta orientando a alternar a empresa.

### 10.4. Catálogo Especializado de Moda com Grade P/M/G e Cores
- No PDV da Zuma Moda, os produtos de vestuário (Linho Puro Riviera, Vestidos Midi Seda Tropical, Alfaiataria Nobre) são exibidos com **seletores rápidos de tamanho na grade (P, M, G, GG)** e mostrador de estoque por tamanho em tempo real.
- Permite selecionar a cor da peça antes de adicionar à sacola.
- Filtro dinâmico por coleções: *Alto Verão 2026*, *Alfaiataria Nobre*, *Básicos Essenciais*, *Camisas & Polos*, *Vestidos & Macacões*.

### 10.5. Modalidades da Boutique & Gestão de Malas Condicionais (3 Dias)
- O PDV da Zuma Moda disponibiliza 3 modalidades exclusivas:
  1. **🛍️ Balcão Loja (Venda Direta):** Venda imediata com emissão de NFC-e varejo SEFAZ-MT e garantia de troca de 30 dias.
  2. **👗 Mala Condicional (Provador em Casa · 3 Dias / 72h):** As peças saem em consignação para a cliente VIP provar em casa sem débito prévio no cartão. O sistema gera automaticamente o Termo de Responsabilidade com CPF.
  3. **📦 Envio MT:** Encomendas despachadas para cidades de Mato Grosso (Cuiabá, Rondonópolis, Sinop, etc.).
- **Aba "Malas Condicionais":** Painel dedicado com KPIs de malas ativas, peças consignadas, valor total em trânsito e botões para *Efetivar Venda* ou *Registrar Devolução ao Estoque*.

### 10.6. Resolução de Cache do Navegador (Cache-Busting)
- Adição de meta tags HTTP no cabeçalho do `client/index.html`:
  - `Cache-Control: no-cache, no-store, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`
- Configuração no servidor Express (`server/_core/vite.ts`) com headers `max-age=0` para arquivos HTML de entrada, garantindo que atualizações de layout e regras fiscais sejam refletidas instantaneamente sem retenção de cache antigo.

---

## 11. Evidências Visuais da Segregação de Empresas

### Figura 19: Frente de Caixa - Zuma Gastronomia & Sushibar (CNPJ: 36.296.848/0001-57)
*Cardápio exclusivo de comida japonesa, bipes rápidos de sushi, 27 mesas de salão, delivery MT com motoboy e comanda 100% gastronômica.*

### Figura 20: Frente de Caixa - Zuma Moda & Boutique (CNPJ: 36.296.848/0002-38)
*Catálogo de roupas e linho puro, bipes de vestuário, consultora VIP Camila Prado, embalagem de presente e sacola exclusiva de boutique.*

### Figura 21: Central de Malas Condicionais da Zuma Moda (Provador em Casa · 3 Dias)
*Controle de 7 peças consignadas com clientes VIP, prazo de devolução de 72h e conversão direta em venda com emissão de NFC-e.*

### Figura 22: Detalhe dos Cards de Vestuário com Seleção de Grade P/M/G e Estoque
*Interface de seleção de tamanhos P, M, G, GG e cores, com carrinho contendo exclusivamente camisa de linho e total da sacola.*


---

## 12. Otimização Ergonômica de UX: Menu Lateral Auto-Recolhível & Submenu Executivo

Com o objetivo de despoluir visualmente o topo do sistema e ampliar ao máximo o espaço útil de tela para o operador de caixa e garçons no PDV Touch, foram implementadas duas grandes inovações de interface:

### 12.1. Menu Lateral com Auto-Fechamento e Expansão por Hover (Cursor)
- **Comportamento Padrão Auto-Recolhido (Mini-Rail 68px):** No ambiente desktop, a barra lateral recolhe-se automaticamente para uma coluna fina de 68px, exibindo apenas os ícones de ação imediata (PDV, Mesas, Cozinha, Cockpit, IA, ERP, Gente, Integrações, Alternador de Tema e Avatar do Usuário).
- **Expansão Suave ao Passar o Mouse (Hover-Expand 280px):** Ao posicionar o cursor sobre o mini-rail, a barra expande-se imediatamente de forma fluida para 280px com elevação visual (`z-50 shadow-2xl`), sem causar qualquer salto ou deslocamento nos elementos centrais da página do PDV.
- **Auto-Fechamento:** Ao afastar o cursor para trabalhar na tela de vendas, o menu fecha-se automaticamente.
- **Fixação Opcional (Pin/Unpin):** Um botão de alfinete permite fixar a barra aberta permanentemente caso o operador deseje, com preferência gravada no `localStorage`.

### 12.2. Submenu Executivo de Módulos & Operações (Header Despoluído)
- A sequência horizontal anterior de 8 botões coloridos (`IA & Mercado`, `Câmeras Ultra`, `Mapa de Calor`, `ERP 360°`, `Integrações`, `Nossa Gente`, `Mesas`, `PDV Caixa`) foi consolidada em um único botão executivo de dropdown no topo: **`Módulos & Operações [8] ▼`**.
- Ao clicar, abre-se um painel organizado em 3 colunas temáticas de fácil visualização:
  1. **Frente & Salão:** PDV Caixa Touch, Mesas & Salão (27 Mesas), KDS Cozinha (4 Praças).
  2. **Inteligência & IA:** IA & Mercado War Room, Câmeras Ultra Vision AI (6), Mapa de Calor Analítico.
  3. **Gestão & Retaguarda:** Central ERP 360°, Módulo de Integrações (8), Nossa Gente (RH & Ponto Facial).
- **Rodapé do Submenu:** Acesso direto ao Cockpit do Dono, Central de Apps PWA e acionamento do Simulador de Serendipidade.
- **Header Limpo:** O topo do PDV agora exibe com clareza o Status do Turno, a Unidade/CNPJ, a Busca Global (`⌘K`), o novo Submenu de Módulos, o botão de Simulação, Notificações e o perfil do usuário, garantindo foco total na operação de caixa.

---

## 13. Evidências Visuais do Header Limpo e Menu Auto-Recolhível

### Figura 26: PDV com Topbar Limpo e Sidebar Auto-Recolhida (Mini-Rail 68px)
*Visão panorâmica do PDV com ganho de mais de 200px de largura útil, menu lateral em modo compacto e header perfeitamente despoluído.*

### Figura 27: Sidebar Expandida Automaticamente por Hover (280px)
*Visualização do menu completo flutuando sobre a lateral esquerda ao passar o cursor, sem deslocamento da área de venda.*

### Figura 28: Submenu Executivo de Módulos & Operações Aberto
*Painel estruturado em 3 colunas com todos os 8 módulos operacionais e de inteligência da Holding Zuma.*


---

## 14. Restauração e Expansão Completa da Barra Lateral (Sidebar 100% Real)

Para garantir que o operador e o administrador tenham acesso imediato a todas as 39 telas reais da Holding Zuma sem itens faltando:

### 14.1. Correção dos Títulos de Domínios e Seções
- Corrigida a renderização de títulos que anteriormente utilizava `title` em vez de `label`, restaurando todos os nomes dos domínios operacionais (ex: *Frente de Loja & Salão*, *Cozinha & Praças de Preparo*, *Delivery & Logística*, *Finanças, DRE & Contratos*, *Painéis Executivos & Tempo Real*).

### 14.2. Barra de Abas Rápidas dos 5 Módulos no Topo da Sidebar
- Implementada uma barra de navegação com 6 botões de filtro no topo do menu lateral:
  1. **🌐 Todos (39):** Lista completa de todas as 39 rotas do ecossistema Zuma Pilot.
  2. **🍽️ Salão:** Operação de atendimento, 27 mesas, KDS e delivery.
  3. **👑 Comando:** Cockpits executivos, War Room, mapas de calor e Dr. Clima.
  4. **💼 ERP:** Central ERP 360°, compras, estoque salmão, fiscal e financeiro.
  5. **💬 CRM:** WhatsApp com IA Zumi, base de clientes e clube fidelidade.
  6. **🔌 TI:** Central de integrações, APIs de pedidos e aplicativo PWA.

### 14.3. Modo Padrão Aberto & Fixado (280px)
- O menu lateral agora inicia aberto e fixado por padrão em todas as telas (`sidebarPinned = true`), garantindo visibilidade total dos módulos e botões reais.
- O operador pode recolher manualmente via botão de fixação (Pin) a qualquer momento para obter foco de tela cheia.

---

## 15. Evidências Visuais da Sidebar Completa e Real

### Figura 31: Cockpit Executivo com Sidebar Completa e Real
*Visualização do Cockpit com a barra lateral totalmente expandida (280px), abas rápidas dos módulos, busca no menu, Serendipidade IA e domínios com nomes reais.*

### Figura 32: Visualização de Todos os Módulos da Holding Zuma (39 Telas)
*Aba 'Todos (39)' ativa exibindo todos os departamentos operacionais, de inteligência e retaguarda.*

### Figura 33: Frente de Caixa Touch (PDV) com Sidebar Completa e Topbar Despoluído
*Equilíbrio ergonômico ideal: cabeçalho limpo com submenu executivo e menu lateral completo com todas as ferramentas de atendimento.*
