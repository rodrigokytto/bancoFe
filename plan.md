# Plano de Implementação: Zuma Pilot — Sistema Completo de Gestão, Vendas e Atendimento com IA

## 1. Visão Geral do Produto
O **Zuma Pilot** é a plataforma operacional, analítica e de atendimento inteligente do restaurante **Zuma Cozinha Oriental** (Tangará da Serra - MT). O sistema integra em uma única solução web moderna:
- **Cockpit Executivo**: Dashboard com mapa de calor de pedidos por dia/hora, gerador de planos de ação por IA, funil de conversão, pratos campeões, alertas inteligentes e importador de CSV real.
- **Loja Digital (Delivery Próprio)**: Vitrine online de vendas diretas com 140+ pratos reais do cardápio do Zuma, cálculo de frete grátis progressivo com barra de meta (R$ 80), motor de upsell contextual no carrinho ("combina com..."), botão "Pedir de novo" em 1 toque, banners de ofertas temáticas diárias e checkout simulado com raspadinha premiada.
- **Central de Atendimento WhatsApp (Zumi com IA)**: Simulador e interface real de atendimento multicanal; o robô ninja Zumi atende primeiro com conhecimento profundo do cardápio e cálculo de taxas locais; transbordo inteligente para a equipe humana em reclamações, pedidos humanos, eventos grandes ou insegurança; base de conhecimento (KB) viva onde dúvidas e respostas da equipe viram aprendizado após aprovação; painel de cliente com LTV, segmento, histórico, carrinho integrado e linha do tempo de eventos.
- **Engenharia de Cardápio**: Matriz visual interativa de popularidade × margem de contribuição (Estrelas, Burros de Carga, Enigmas e Cães), cálculo do CMV por ficha técnica real, tabelas categorizadas e recomendações de precificação dinâmica.
- **Reputação & Google Meu Negócio**: Monitoramento de avaliações do Google e iFood com gerador de respostas públicas com IA na voz do Zumi, análise de sentimentos e checklist de SEO local.
- **Campanhas Segmentadas de WhatsApp**: Criação de campanhas baseadas em objetivos de horários vazios, copywriter de IA no tom do Zumi, previsão de alcance, pedidos e faturamento em 48h, pré-visualização em smartphone e agendamento.
- **Captação de Leads (Quiz + Raspadinha)**: Quiz interativo de 20 segundos ("Descubra seu sushi") com raspadinha digital em canvas interativo que revela prêmios instantâneos e formulário com opt-in de WhatsApp para alimentar o CRM.
- **Horários Vazios & Gestão de Turnos**: Calendário de semanas temáticas, simulador financeiro de novos turnos (abertura na segunda-feira e almoço executivo qui-dom) e calendário anual de datas comemorativas.
- **Capacidade × Lotação**: Modelagem da ociosidade da cozinha e salão com sliders interativos, cálculo de receita potencial perdida por horário e plano de ataque tático.
- **Clube Zumi (Assinatura Recorrente)**: Simulador de receita recorrente (MRR) e custos de benefícios de assinatura para delivery de sushi em Tangará da Serra.
- **CRM & Base de Clientes**: Segmentação RFM avançada (VIP, Fiel, Novo, Regular, Sumido, Lead) com ações recomendadas personalizadas.
- **Recuperação de Inativos**: Estratégia em 4 ondas para resgate dos 40% da base inativa (60+ dias), simulação interativa de disparos e projeção de receita recuperada no mês.
- **Reservas & Fila de Espera**: Agendamento de mesas com status de confirmação automática 2h antes e fila de espera em tempo real com disparo de chamada no WhatsApp.
- **ERP Integrado (PDV, KDS, Estoque, Fiscal e Financeiro)**:
  - *Frente de Caixa (PDV)*: Lançamento rápido de pedidos de balcão, mesa, delivery e retirada, múltiplos pagamentos, CPF na nota (Nota MT) e emissão de NFC-e.
  - *KDS (Cozinha & Entregas)*: Painel de comandas em 4 etapas (Novo, Preparo, Pronto, Rota) com cronômetro em tempo real, alerta vermelho para atrasos (>20 min) e gestão de motoboys.
  - *Estoque & Ficha Técnica*: Baixa automática de insumos (salmão, arroz, nori, cream cheese, etc.) a cada venda no PDV, Loja ou WhatsApp; lista de compras sugerida e entradas de notas.
  - *Fiscal*: Histórico de NFC-e emitidas, cálculo da alíquota efetiva do Simples Nacional e agenda de obrigações tributárias.
  - *Financeiro & DRE*: DRE gerencial do mês com comparativo Atual vs Meta do Plano (+250%), contas a pagar com alerta de vencimento e divisão por forma de pagamento.
- **Benchmark de Mercado**: Comparativo competitivo com Saipos, SevenRooms, Toast, Malou, Chowly e Bloom Intelligence.

---

## 2. Decisões de Design (Identidade Zuma Cozinha Oriental)

A identidade visual é baseada no protótipo original `zuma-pilot.html`, aprimorada para uma interface moderna de alta densidade e sofisticação gastronômica:

- **Design Movement**: Warm Japanese Modernism com precisão funcional de ERP operacional e toques lúdicos no atendimento.
- **Core Principles**:
  1. *Clareza Operacional*: Indicadores numéricos legíveis e contrastantes, permitindo operação ágil na correria da cozinha e do salão.
  2. *Aconchego & Apetite*: Uso de tons terrosos quentes e o salmão característico da culinária oriental.
  3. *Linguagem Ninja Amigável*: O mascote Zumi conecta a tecnologia complexa com o cliente final e com a equipe do restaurante de maneira acolhedora e bem-humorada.
- **Color Philosophy**:
  - `Salmon` (`#E8613A` / `#FBE3D9`): Energia, frescor do salmão de alta qualidade, ação primária e entusiasmo.
  - `Nori` (`#2E5A4C` / `#DCEAE3`): Equilíbrio orgânico, segurança, sucesso e confiabilidade operacional.
  - `Surface & Inks` (`#F5F5F2` / `#FFFFFF` / `#17181C`): Fundo suave papel de arroz que evita cansaço visual em longos turnos de trabalho, com tema escuro elegante (`#121316` / `#1B1D21`).
- **Layout Paradigm**: App Shell dividido com Sidebar à esquerda com 19 seções agrupadas semanticamente em Vendas, Clientes, ERP e Estratégia; cabeçalhos objetivos com *eyebrow* contextual; cartões modulares e responsivos com suporte a celulares e tablets.
- **Signature Elements**:
  - Mascote Zumi desenhado em SVG vetorial escalável com headband ninja e par de hashis.
  - Heatmaps com escala de calor de 5 níveis e destaque para horários ociosos.
  - Raspadinha digital interativa em HTML5 Canvas.
  - Chat do WhatsApp realista com balões com selos de autoria (Zumi IA, Equipe Humana, Sistema).
- **Typography System**:
  - *Display*: Archivo / Inter Bold para títulos fortes e de personalidade.
  - *Body*: Inter para interfaces legíveis em todos os tamanhos.
  - *Numbers / Currency*: JetBrains Mono para tabelas financeiras e valores com alinhamento numérico tabular preciso.
- **Brand Essence**: "Zuma Cozinha Oriental: Vendas no piloto automático, sushi de alta qualidade e atendimento impecável 24/7."
- **Brand Voice**: Direto, acolhedor, transparente e brincalhão com ganchos ninja ("Bora, ninja? 🥢").

---

## 3. Arquitetura Técnica & Estrutura de Pastas

A aplicação é organizada como um monorepo full-stack integrado:

```
/home/ubuntu/zumapilot/
├── client/
│   ├── public/
│   │   └── manus-routes.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── shell/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── ZumiMascot.tsx
│   │   │   │   └── TopHeader.tsx
│   │   │   └── ui/ (shadcn/radix/lucide)
│   │   ├── data/
│   │   │   └── menuData.ts (cardápio completo oficial com 140+ itens reais do Zuma)
│   │   ├── pages/
│   │   │   ├── Cockpit.tsx
│   │   │   ├── LojaNova.tsx
│   │   │   ├── WhatsAppZumi.tsx
│   │   │   ├── EngenhariaCardapio.tsx
│   │   │   ├── Reputacao.tsx
│   │   │   ├── Campanhas.tsx
│   │   │   ├── CaptacaoLeads.tsx
│   │   │   ├── HorariosVazios.tsx
│   │   │   ├── CapacidadeLotacao.tsx
│   │   │   ├── ClubeZumi.tsx
│   │   │   ├── BaseClientes.tsx
│   │   │   ├── RecuperacaoClientes.tsx
│   │   │   ├── ReservasFila.tsx
│   │   │   ├── PdvCaixa.tsx
│   │   │   ├── CozinhaKds.tsx
│   │   │   ├── EstoqueInsumos.tsx
│   │   │   ├── FiscalNotas.tsx
│   │   │   ├── FinanceiroDre.tsx
│   │   │   └── MercadoBenchmark.tsx
│   │   ├── App.tsx
│   │   └── index.css
├── server/
│   ├── _core/
│   │   ├── index.ts
│   │   └── trpc.ts
│   ├── routers/
│   │   ├── aiRouter.ts (Gemini & OpenAI: chat Zumi, copy campanhas, respostas Google, piloto)
│   │   ├── salesRouter.ts (pedidos, PDV, histórico de vendas, caixa)
│   │   ├── whatsappRouter.ts (conversas, mensagens, base de conhecimento)
│   │   ├── erpRouter.ts (estoque, ficha técnica, kds, fiscal, financeiro)
│   │   └── crmRouter.ts (clientes, leads, reservas, recuperação)
│   ├── services/
│   │   └── aiService.ts (integração direta com Gemini/OpenAI e regras do restaurante)
│   ├── db.ts
│   └── routers.ts
├── drizzle/
│   └── schema.ts (tabelas MySQL para pedidos, clientes, estoque, conversas, KB, etc.)
└── package.json
```

---

## 4. Integração em Tempo Real dos Módulos
O grande diferencial da versão completa é o **efeito cascata real**:
1. Ao fechar uma venda (seja na Loja Nova, no WhatsApp ou no PDV):
   - Grava o pedido com status e itens no banco de dados.
   - Entra automaticamente no KDS da Cozinha com cronômetro ativo.
   - Dá baixa imediata nas frações de insumos no Estoque (ex: -0.22kg de salmão, -3 folhas de nori).
   - Registra a NFC-e no Fiscal com numeração sequencial.
   - Alimenta o caixa do dia e a DRE Financeira em tempo real!
2. Na Central de Atendimento WhatsApp:
   - A IA responde usando Google Gemini / OpenAI de verdade, consultando os pratos e regras reais.
   - Adiciona produtos ao carrinho da conversa via tool calls.
   - Transborda para atendente humano caso haja reclamação ou pedido de atendente.
   - Quando o atendente responde ou o Zumi tem uma dúvida resolvida, uma nova entrada é gerada no **Aprendizado do Zumi** para aprovação do Rodrigo.
