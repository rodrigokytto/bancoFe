# Zuma Pilot · Suíte Completa de Integrações de Delivery & Salão (Homologação Prd)

**Ambiente:** Produção (Google Cloud Run - `southamerica-east1`)  
**URL de Produção:** [https://zuma-731517331463.southamerica-east1.run.app/integracoes](https://zuma-731517331463.southamerica-east1.run.app/integracoes)  
**Revisão Ativa:** `zuma-00055-bxl` (100% de tráfego ativo)  
**Auditoria de Console:** Zero (0) erros JavaScript detectados em todas as telas  
**Repositório GitHub:** `rodrigokytto/zuma` (branch `main` sincronizada)  

---

## 1. iFood Merchant API v2 Oficial

- **Ciclo de Vida Operacional Completo:**
  - `PLACED`: Pedido recebido via webhook/polling em tempo real.
  - `CONFIRMED`: Aceite automático ou manual em < 3 segundos.
  - `READY_TO_PICKUP`: Notificação de prato pronto na bancada de expedição.
  - `DISPATCHED`: Pedido despachado com motoboy alocado na rota do bairro em Tangará da Serra.
  - `CONCLUDED`: Confirmação de entrega com conciliação financeira.
  - `CANCELLED`: Cancelamento com estorno e devolução ao estoque.
- **Watchdog de Auto-Pausa por Ruptura de Estoque:**
  - Monitoramento contínuo dos insumos críticos do ERP (Salmão Fresco, Shari, Embalagens de Combo).
  - Em caso de ruptura ou estoque mínimo atingido, o Zuma Pilot pausa automaticamente os 211 SKUs dependentes no iFood em < 1 segundo, evitando cancelamentos, estornos e penalizações no algoritmo do iFood.
  - Botão de simulação e reativação em lote com um único clique.
- **Gestão dos 211 SKUs do Cardápio:**
  - Sincronização completa de categorias (Sashimis, Uramakis, Hots, Temakis, Pratos Quentes, Bebidas).
  - Toggles individuais de pausa e disponibilidade com busca instantânea.
- **Controle de Loja ao Vivo:**
  - Status em tempo real: `ABERTO`, `PAUSAR 15m`, `PAUSAR 30m`, `PAUSAR 60m`, `FECHADO`.

---

## 2. Keeto POS & Comandas Eletrônicas de Salão

- **Mapa Visual das 16 Mesas:**
  - Visualização em tempo real do salão com status: Livre, Ocupada, Pedindo Conta.
  - Consumo acumulado, garçom responsável e tempo de permanência da mesa.
- **Comandas Mobile & KDS por Praça:**
  - Lançamento de pedidos direto pelos smartphones dos garçons (Matheus, Jessica, Vitor).
  - Encaminhamento automático para as telas de cozinha: Sushibar, Cozinha Quente e Copa/Bar.
- **Fechamento de Conta & Emissão Fiscal NFC-e SEFAZ-MT:**
  - Divisão de conta flexível por número de pessoas (1 a 6 pagantes).
  - Emissão síncrona de NFC-e Modelo 65 para SEFAZ Mato Grosso (CNPJ 36.296.848/0001-57).
  - Impressão térmica em spooler ESC/POS (80mm e 58mm).

---

## 3. Open Delivery Hub Abrasel v1.0 (Aiqfome & 99Food)

- **Webhook Universal Padronizado:**
  - Endpoint: `/api/webhooks/open-delivery` compatível com o padrão Abrasel/ABNT.
  - Permite conectar novos aplicativos e marketplaces sem alterar a esteira da cozinha.
- **Comparativo de Margens Omnichannel:**
  - Canal Direto WhatsApp (WAHA): 0% de taxa retida (R$ 0,00 por conversa).
  - Keeto Salão: 0% de taxa retida.
  - Open Delivery (Aiqfome): 18% de comissão retida.
  - iFood Merchant: 23% a 27% de taxa retida.
- **Logística Urbana de Tangará da Serra:**
  - Mapeamento das 6 zonas logísticas: Centro, Jardim Europa/Tarumã, Vila Alta, Tangará II, Alto da Boa Vista e Distrito Industrial.
  - Frota própria de motoboys com monitoramento de status (Disponível, Em Rota, Pausa).

---

## 4. Auditoria de Produção

Todas as páginas foram validadas em ambiente real com sessão autenticada do administrador Rodrigo Ribeiro Gonçalves (`rrodrigogon@gmail.com`), comprovando estabilidade operacional absoluta, layout moderno com menu lateral clean e navegação responsiva.
