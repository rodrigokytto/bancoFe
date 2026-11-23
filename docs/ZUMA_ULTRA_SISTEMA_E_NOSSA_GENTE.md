# Zuma Ultra 360° & Sincronização Nossa Gente
**Zuma Cozinha Oriental · Tangará da Serra (MT) · CNPJ: 36.296.848/0001-57**  
*Módulo Operacional de Alta Performance, Sincronização por Evento Interno e Armazenamento Seguro ANVISA*

---

## 1. Visão Geral do Sistema Ultra (`/ultra`)

O módulo **Zuma Ultra** (`https://zuma.kytto.com.br/ultra` e `https://zuma-731517331463.southamerica-east1.run.app/ultra`) foi desenvolvido como o coração operacional e sanitário da cozinha do Zuma Pilot, interligando em tempo real:
- As praças físicas de preparo (Sushibar Nobre, Cozinha Quente, Bar & Mixologia, Salão Nobre e Expedição/Delivery).
- O sistema de RH e equipe **Nossa Gente** via barramento de sincronização por eventos internos.
- A cadeia de frio com telemetria contínua, destacando o **Ultracongelador de Choque -40°C Criotec**.
- O cofre de **Armazenamento Seguro de Imagens e Dados de Auditoria ANVISA** (RDC 216 e CVS 5) com hashes SHA-256 invioláveis.

---

## 2. Arquitetura de Sincronização por Evento Interno (Nossa Gente x Ultra)

Em conformidade direta com a diretriz arquitetural priorizada, a comunicação entre o sistema **Nossa Gente** e o **Ultra** adota **sincronização por evento interno**, descartando dependências de polling externo de rede:

1. **Barramento em Memória (`ultraEventBus`)**:
   - Emissão de `CustomEvent` de alta velocidade (latência < 2ms) para reação imediata das interfaces locais.
   - Escuta e propagação cross-tab via `StorageEvent`, permitindo que o gestor com múltiplas abas abertas receba eventos instantaneamente.
2. **Audit Trail Persistente no Backend (tRPC & DataStore)**:
   - Registro permanente de cada evento interno com hash criptográfico SHA-256 (`internalChecksum`), carimbo de tempo em microssegundos, colaborador associado e payload.
3. **Tipos de Eventos Internos Suportados**:
   - `INSPECTION_ANVISA_REGISTERED`: Registro de aferição térmica e foto segura de bancada/peixe.
   - `FACIAL_BIOMETRIC_PUNCH`: Registro biométrico facial de ponto eletrônico (Portaria 671 MTE), liberando o operador na praça de trabalho.
   - `ORDER_DELIVERED_COMMISSION_ACCREDITED`: Credenciamento automático de comissão de produção ao sushiman e garçom por prato entregue no SLA.
   - `SUSHIBAR_SLA_ALERT`: Alerta de sobrecarga de praça no KDS 2.0, solicitando reforço da brigada.
   - `STOCK_OUTAGE_TRIGGER_SYNC`: Sincronização preventiva de nível crítico de salmão com a brigada de compras.
   - `DISPATCH_DELIVERY_MOTOBOY`: Despacho de entregas agrupadas com crédito de taxas ao piloto.

---

## 3. Armazenamento Seguro de Fotos e Laudos Sanitários ANVISA

Autorizado e auditado para garantia de conformidade e integridade regulatória:
- **Cofre Seguro de Imagens**: Armazenamento de fotos de recebimento de salmão fresco chileno, cortes de lombo, termômetro digital aferido, tábuas de corte esterilizadas e visores de temperatura.
- **Hash Criptográfico SHA-256**: Cada foto e laudo possui assinatura digital única gerada no momento da captura (`sec_anvisa_[hash]`), impedindo adulterações retroativas.
- **Conformidade ANVISA RDC 216 & Portaria CVS 5**:
  - Pescados crus: manutenção contínua entre 0.0°C e +2.0°C.
  - Congelamento profilático anti-parasitário (Anisakis): ciclo de -39.4°C a -42°C no ultracongelador de choque Criotec Professional.
  - Modal interativo de visualização de laudo técnico com dados do inspetor responsável, padrão regulamentar e notas da coleta.

---

## 4. As 7 Abas Operacionais do Módulo Ultra

| Aba | Descrição e Funcionalidades |
|---|---|
| **1. Cockpit Praças & KDS** | Visão em tempo real das 5 praças operacionais com líderes, colaboradores escalados, fila de pedidos, tempo médio de ciclo, carga de trabalho e temperatura alvo. Botões operacionais para sinalizar alerta e acionar checklist POP sanitário. |
| **2. Sincronização por Evento Interno** | Monitoramento do barramento interno ativo, lista da equipe ativa de Nossa Gente com biometria facial e horas registradas, histórico auditável de eventos e formulário interativo de disparo de eventos. |
| **3. Auditoria & Fotos Seguras ANVISA** | Galeria de fotos seguras de inspeções com selo de status (CONFORME/ALERTA), medições térmicas, padrões e modal completo de exibição de laudo técnico fotográfico com SHA-256. |
| **4. Telemetria de Frio & Ultracongelamento** | Telemetria contínua dos 5 equipamentos vitais da cadeia de frio (Ultracongelador -40°C, Câmara de Resfriados 1.1°C, Câmara de Congelados -19.6°C, Balança Prix 6 e Sous-Vide 63.5°C). |
| **5. Alavancas Ultra IA & Auditoria Tangará** | 4 motores analíticos: Balanceamento Dinâmico de Postos, Auditoria Contínua HACCP, Sincronização Preventiva de Escalas e Otimização de Rendimento de Pescados (&gt; 99.2% de aproveitamento). |
| **6. Passaporte do Salmão 360°** | Rastreabilidade completa lote a lote do Fiorde de Reloncaví (Chile) até a mesa de Tangará da Serra (MT). Dados de despesca, voo internacional, controle de temperatura constante a +0.8°C, ciclo profilático de choque a -40.3°C Criotec (POP-ZUMA-004), laudo organoléptico e QR Code público (/passaporte-salmao). |
| **7. Gatilhos Inteligentes (Smart Rules)** | Orquestrador de automações em tempo real com 6 regras ativas: Sentinela de Frio Extremo, Pausa Anti-Ruptura iFood, Operação Tempestade Dr. Clima, Proteção contra Sobrecarga no KDS, Acerto Automático de Motoboys com PIX Sicredi e Checkpoint Sanitário ANVISA. |

---

## 5. Tela Pública do Cliente e QR Code de Origem (`/passaporte-salmao`)

A rota pública `/passaporte-salmao` e `/passaporte-salmao/:lote` permite que clientes na mesa (via QR Code no sousplat) ou no delivery (via QR Code na tampa da barca) acessem a ficha de rastreabilidade completa do salmão que estão consumindo:
- Certificações ASC, BAP 4-Star e Global G.A.P.
- Linha do tempo animada com as 4 etapas da cadeia fria.
- Laudo laboratorial com resultado "Ausência de Patógenos / Anisakis".
- Hash criptográfico SHA-256 para auditoria de autenticidade.
- Assinatura do Chef Executivo Kenji Sato e da Nutricionista Responsável Técnica Dra. Camila Bittencourt (CRN-MT 14208).

---

## 6. Validação, Testes e Qualidade

- **Testes Unitários Automatizados**: 20 testes em 4 suítes Vitest rodando e aprovados 100% (`server/ultraSystem.test.ts`, `server/forecastingAndIntegrations.test.ts`, `server/platform.test.ts`, `server/auth.logout.test.ts`).
- **Validação Visual E2E (Puppeteer & Chromium)**: Telas, modais e nova interface pública do Passaporte do Salmão capturados e validados em alta resolução.
- **Compilação**: `pnpm run build` executado sem erros (Vite client + esbuild server).
- **Repositório Git**: Código sincronizado com o branch `main` do repositório `rodrigokytto/zuma`.
