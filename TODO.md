# Zuma Pilot & ERP 360° - Rastreamento de Entregas & Produção

## Itens Entregues e Validados em Produção (PRD)

- [x] **Módulo Analítico de Mapa de Calor 7x11 (`/mapa-de-calor`)**:
  - **Evolução 2.0 do Modo Explodido & Oportunidades Estratégicas (`Cockpit.tsx`, `MapaCalor.tsx`, `heatmapData.ts`)**:
    * Eliminação de duplicidades: modelagem realista hora a hora com curvas verossímeis de salão, delivery e cozinha para os 7 dias e 11 horários.
    * Painel "Top 3 Oportunidades Estratégicas do Dia": 3 cards em destaque com janela horária, potencial financeiro em R$, público-alvo de Tangará da Serra e disparo Zumi IA.
    * Cartões de faixas horárias com caixa de oportunidade embutida, badge de status operacional (🟢 Equilibrado, 🟡 Ocioso/Dinheiro na Mesa, 🔴 Gargalo Cozinha >85%) e botões de ação rápida.
    * Super Modal / Bottom Sheet Interativo com 3 abas:
      1. 🎯 Oportunidade Zumi IA com diagnóstico e recomendação tática;
      2. 📈 Simulador ao Vivo (+3, +6, +10, +15 pedidos) com recálculo instantâneo de receita, nova carga de cozinha (%) e aviso de sobrecarga;
      3. 💬 WhatsApp Zumi IA com script formatado, cópia em 1-clique e aprovação de disparo inteligente.
    * Biblioteca unificada `heatmapData.ts` compartilhada entre Cockpit e Tela Dedicada sem duplicação de código.
  - Matriz bidimensional 7 dias da semana (Segunda a Domingo) x 11 faixas horárias (11:00 às 22:00).
  - 5 métricas de análise cruzada com escala cromática inteligente (Volume de Pedidos, Faturamento R$, Carga de Cozinha %, Taxa de Ocupação Salão %, Dinheiro Perdido na Mesa R$).
  - Filtro por canais de venda (Todos, Salão, Delivery Próprio, iFood).
  - Explosão tátil por dia da semana com comparativo hora a hora e novo modo focado com modal fullscreen adaptativo.
  - Bottom sheet móvel e drawer desktop para detalhamento de cada célula com recomendações táticas (ex: ativar Zumi IA, disparo promocional).

- [x] **Renovação da Navegação e TopBar Global (`AppLayout.tsx`, `Sidebar.tsx`)**:
  - Sidebar categorizada com busca/filtro instantâneo de módulos e badge de status em tempo real.
  - TopBar com indicador de status de Tangará da Serra (Online, Salão aberto, Cozinha operacional).
  - Command Palette universal (Ctrl+K) com pesquisa rápida por qualquer tela, função ou módulo.
  - Otimização Mobile com Barra de Navegação Inferior Fixa (Cockpit, Calor 7x11, ERP 360, PDV Caixa, Buscar) com haptic touch visual, safe-areas do iPhone e atalho rápido para a Central de Apps.

- [x] **Central ERP Master 360° (`/erp` e `/adm`) com todos os 17 submódulos consolidados**:
  - 1. KPIs Executivos e Saúde Operacional com gráficos de metas e alertas.
  - 2. Frente de Caixa PDV com fechamento cego auditado, quebra de caixa e conciliação de maquininhas.
  - 3. Gestão e CRUD de Cardápio com 211 SKUs cadastrados, cards táteis mobile e tabela desktop.
  - 4. Gestão de 27 Mesas físicas com setorização (Salão Nobre, Deck Externo, Varanda Jardim) e status de consumo.
  - 5. KDS de Cozinha Inteligente com 4 praças de produção (Sushibar, Cozinha Quente, Fritura/Wok, Expedição/Embalagem) e alerta de SLA de preparo.
  - 6. Estoque de Insumos com controle de rendimento e perda técnica do Salmão Chileno Premium (58% Filé Nobre, 15% Aparas/Tartar, 27% Descarte).
  - 7. DRE Financeiro Gerencial com CMV real (31.4%), margem de contribuição, EBITDA e conciliação bancária OFX (Sicredi/Sicoob/BB).
  - 8. Gestão de Delivery Tangará da Serra com tabela de frete dinâmico por bairros (Centro, Jd. Tangará, Vila Alta, etc.) e tracking de raio de entrega.
  - 9. CRM & Fidelidade Clube Zumi com pontuação e tiers de clientes VIP.
  - 10. Matriz BCG de Engenharia de Cardápio (Estrelas, Cavalos de Batalha, Quebra-cabeças e Cães).
  - 11. Gestão de Fila e Reservas com Hostess digital e tempo de espera estimado.
  - 12. Cotação de Pescados & Insumos com comparativo regional Cuiabá x Tangará da Serra e 3-Way Matching.
  - 13. Módulo Fiscal NFC-e SEFAZ-MT, Matriz Tributária ICMS-MT Pescados, Simulador NCM e SPED Bloco K (.TXT).
  - 14. Spooler de Impressão Térmica ESC/POS (80mm/58mm) com simulação de cupom para cozinha e salão.
  - 15. Akira & Zumi IA com simulação ao vivo de parsing de pedidos do WhatsApp.
  - 16. Configuração Corporativa e Parâmetros de Empresa Exclusiva de Tangará da Serra.
  - 17. Controle Patrimonial & Ativos Imobilizados com tombamento, cálculo de depreciação mensal e manutenção preventiva.
  - 19. **Onda Fiscal & Tributária Nacional Completa (`ErpFiscalSubsuite.tsx`)**:
    * Emissão e Autorização NFC-e (mod 65) e NF-e (mod 55) com Chave de 44 dígitos e DV módulo 11.
    * Visualizador e Impressor de DANFCE no padrão térmico 80mm com QR Code oficial SEFAZ-MT e discriminativo.
    * Monitor em Tempo Real dos Webservices SEFAZ das 27 UFs brasileiras com medição de latência em milissegundos.
    * Matriz Tributária Nacional: Gastronomia, Pescados MT (Convênio 128/94), Carnes, Varejo, AutoPeças e Indústria.
    * Auditor de Cadastro & Prevenção de Rejeições (NCM, CEST obrigatório para bebidas ST e CFOP 5102/5405).
    * Gerador Oficial do SPED Fiscal EFD ICMS/IPI Bloco K (K001, K100, K200, K230, K235, K280, K990).
    * Pacote Mensal do Contador (.ZIP) com XMLs autorizados, cancelamentos, CC-e e conciliação DIMP.
    * Simulador de Transição da Reforma Tributária 2026 (IBS + CBS Dual).
  - 18. **Subsuítes Setoriais & Transversais Integradas de Agro-Open**:
    * Varejo & Supermercado: Balança Toledo/Filizola FLV, leitor EAN-13, Totem Self-Checkout e Kiosk de Busca Preço.
    * Barbearia & Serviços: Agenda de profissionais, rateio de comissões automáticas e venda de serviços.
    * Pizzaria: Fracionamento meio-a-meio e terços, bordas recheadas e KDS forno a lenha.
    * Bar & Choperia: Comandas eletrônicas touch, divisão de conta multi-pagador e controle de chopeira.
    * AutoPeças & Oficina: Catálogo técnico de aplicação veicular e controle de Ordens de Serviço (O.S.).
    * Indústria de Concreto: Telemetria GPS de betoneiras, ensaios NBR 5739 e balança rodoviária 80t.
    * Clube & Arenas: Gestão de mensalidades de sócios, agendamento de quadras esportivas e catracas.
    * Customer 360° & Scoring: Dossiê 360°, scoring de crédito (0-1000) e régua de cobrança automática WhatsApp.
    * Comercial B2B: Funil de vendas para eventos corporativos, propostas e metas de vendedores.

- [x] **PWAs Nativos de Operação Móvel (`/garcom`, `/entregador`, `/pagamentos`, `/apps`)**:
  - PWA do Garçom com mapa das 27 mesas físicas, comanda touch e notificações de chamado.
  - PWA do Entregador com geolocalização e rotas para Tangará da Serra.
  - PWA de Pagamentos com integração e conciliação TEF Multibandeira, Pix instantâneo e Apple Pay.
  - Central de Apps com instalador PWA nativo, Service Worker offline (`sw.js`) e Web App Manifest.

- [x] **Novas Funcionalidades Operacionais Integradas (Commit `f6a5846`)**:
  - Barramento interno de sincronização em tempo real `orderEvents.ts`.
  - Simulador de Pedido ao vivo (`SimuladorPedidoModal.tsx`) integrado diretamente ao KDS 2.0.
  - Análise Comparativa detalhada Zuma Pilot vs Saipos com calculadora interativa de ROI e TCO.
  - 5 Módulos Zuma 360°: Auto-atendimento via QR Code nas mesas, KDS 2.0 Fire-on-Demand, Telemetria IoT de câmaras frias, Motor preditivo de compras de salmão e Fechamento contábil mensal 1-click SPED (.ZIP).

- [x] **Hub de Conexões e Open APIs (`/conexoes`)**:
  - Monitor ao vivo das 7 conexões (iFood, WhatsApp Cloud API, SEFAZ-MT, Mercado Pago / Stone, Google Maps, OpenWeather, BrasilAPI).
  - Consulta ao vivo de CNPJ diretamente na Receita Federal via BrasilAPI.

- [x] **Pipeline de Produção e Deploy no GCP (Google Cloud Run)**:
  - Projeto GCP: `kytto-514916` (Conta `rodrigo.goncalves@kytto.com.br`).
  - Serviço Cloud Run: `zuma` na região `southamerica-east1` (São Paulo).
  - Revisão ativa em produção: **`zuma-00014-rxj`** (100% tráfego alocado, HTTP 200 OK).
  - Cloud Build automático via GitHub CI/CD: Build ID `d39730c9-04b5-45aa-9724-e8f3a278d32a` (`SUCCESS`).
  - URLs ativas em produção:
    * `https://zuma-x2gtmiiwkq-rj.a.run.app` (Cloud Run direto)
    * `https://zuma.kytto.com.br` (Domínio corporativo oficial)
  - Endpoints de verificação de liveness:
    * `/api/status` e `/api/health` respondendo `HTTP 200 OK`

- [x] **Infraestrutura Google Cloud Load Balancer & SSL Gerenciado**:
  - Serverless NEG `zuma-neg` conectado ao Cloud Run `zuma` em `southamerica-east1`.
  - Backend Service Global `zuma-backend` com timeout de 30s e CDN configurado.
  - IP Estático Global reservado: **`35.201.67.186`**.
  - Regra de redirecionamento automático HTTP 80 -> HTTPS 443 via `zuma-http-redirect`.
  - Certificado SSL gerenciado pelo Google `zuma-ssl-cert` para `zuma.kytto.com.br`.

- [x] **Configuração de Domínio no Registro.br**:
  - Acesso ao painel do Registro.br com conta `RORGO248` (`rrodrigogon@gmail.com`).
  - Administração do domínio `kytto.com.br` em modo de zona avançada.
  - Entrada do Tipo A criada para `zuma.kytto.com.br` apontando para o IP `35.201.67.186`.
  - Alterações salvas e confirmadas com sucesso no sistema autoritativo do Registro.br.

- [x] **Sincronização com o Repositório GitHub**:
  - Remoto `github`: `https://github.com/rodrigokytto/zuma.git` (branch `main`).
  - Remoto `origin`: atualizado em paridade completa.
  - Commit HEAD: `f6a5846` integrado e sincronizado.
