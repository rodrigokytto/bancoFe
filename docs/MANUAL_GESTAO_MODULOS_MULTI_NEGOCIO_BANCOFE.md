# Manual Executivo — Gestão de Módulos por Negócio no BancoFe

**Plataforma:** BancoFe — Ecossistema Corporativo Multi-Negócio & ERP 360°  
**Painel de Administração:** `https://erp-bancofe-5xsi5uyoda-rj.a.run.app/admin`  
**Repositório GitHub:** `https://github.com/rodrigokytto/bancoFe`  
**Data:** 23 de Novembro de 2026  
**Status:** Homologado em Produção e Versionado  

---

## 1. Visão Geral da Arquitetura Multi-Negócio

O sistema **BancoFe** foi estruturado com uma arquitetura **multi-negócio (multi-tenant corporativo)**. Cada unidade de negócio do ecossistema possui seu próprio catálogo de módulos operacionais, identidade visual, permissões e rotas de acesso dedicadas.

### 🏢 Unidades de Negócio Pré-Configuradas:
1. **BancoFe — Open Finance & Banking Digital:** Soluções de Open Finance, Pix, Contabilidade Dupla (Double-Entry Ledger), Bureau de Crédito, Boletos Febraban (CNAB240/400) e Web3 Drex.
2. **Zuma Cozinha Oriental & Gastronomia:** Operação gastronômica 360°, Frente de Caixa Touch (PDV), KDS de Praças de Cozinha, App do Garçom, Delivery e Telemetria Térmica IoT.
3. **Zuma Moda, Roupas & Estilo:** Varejo têxtil, Provador, Grade de Tamanhos, Vitrine Online e CRM com Fidelidade.
4. **Zuma Agro & Safra MT:** Agronegócio no Mato Grosso, Pesagem em Balança Rodoviária, Controle de Sacas/Hectare, Contratos Futuros de Barter e Frotas de Colheitadeiras.
5. **Holding Kytto & Concreto:** Controladoria Consolidada do Grupo, DRE Geral, Auditoria SEFAZ e Planejamento M&A.

---

## 2. Funcionalidades do Painel `/admin`

O painel administrativo está acessível pela rota `/admin` (ou `/admin/modulos`) e disponibiliza:

### 2.1. Seletor Visual de Negócios
- Barra superior de navegação com badges temáticos de categoria (*Fintech*, *Gastronomia*, *Boutique*, *Agro MT*, *Holding*).
- Contadores de módulos em tempo real por empresa.
- Ao clicar em uma empresa, toda a interface e o menu lateral (Sidebar) mudam instantaneamente para o contexto daquela empresa.

### 2.2. Adicionar Módulo Customizado (`+ Adicionar Módulo`)
- **Live Preview em Tempo Real:** Pré-visualização idêntica de como o módulo será exibido na barra lateral e nos cabeçalhos.
- **Nome do Módulo & Slug:** Identificador único gerado automaticamente ou personalizável.
- **Descrição Detalhada:** Explicação das atividades operacionais atendidas pelo módulo.
- **Rota Padrão (`defaultPath`):** Destino de navegação ao clicar no item (ex.: `/pdv`, `/erp`, `/agro`, `/zumi`, etc.).
- **Nível de Permissão:** Controle granular de acesso (*Todos os Usuários*, *Apenas Gerentes*, *Apenas Admin*).
- **Badge Visual de Destaque:** Texto da tag (ex.: *NOVO*, *BETA*, *TEMPO REAL*, *SAFRA*) com 8 opções de paletas de cores cromáticas.
- **Catálogo de Ícones Lucide:** Mais de 20 ícones temáticos selecionáveis com barra de pesquisa instantânea.
- **Domínios & Submódulos Vinculados:** Associação com as rotas operacionais recolhíveis na sidebar.

### 2.3. Modificar Módulo Existente (`Modificar`)
- Permite alterar nome, descrição, rota padrão, nível de permissão, badge, cor e ícone de qualquer módulo.
- Validação no frontend e sincronização persistente com o servidor via tRPC.

### 2.4. Excluir Módulo (`Excluir`)
- Modal de confirmação seguro com indicação do nome do módulo e alerta do impacto operacional.
- Exclusão com confirmação expressa ou sugestão de apenas desativar pelo toggle switch.

### 2.5. Ativar / Desativar com 1 Clique (Toggle Switch)
- Switch visual liga/desliga para ocultar temporariamente um módulo da navegação sem perder seus dados ou configurações.

### 2.6. Reordenação de Módulos (▲/▼)
- Botões de subida e descida que alteram a prioridade visual e hierárquica na Sidebar.

### 2.7. Cadastrar Novo Negócio (`+ Novo Negócio`)
- Cadastro de novas empresas do grupo com Nome, Slug, CNPJ, Categoria e Descrição.

---

## 3. Persistência e Sincronização

1. **Camada de Dados do Servidor:** `server/businessModuleStore.ts` com persistência em disco em `data/businessModulesConfig.json` e fallback resiliente.
2. **API Type-Safe tRPC:** `server/routers/adminRouter.ts` expõe procedimentos completos tipados com Zod:
   - `admin.getBusinesses`
   - `admin.saveBusiness`
   - `admin.deleteBusiness`
   - `admin.getModules`
   - `admin.saveModule`
   - `admin.deleteModule`
   - `admin.toggleModule`
   - `admin.reorderModules`
   - `admin.resetToDefault`
3. **Estado Global do Frontend:** `client/src/contexts/BusinessContext.tsx` garante sincronização imediata (sem refresh de tela) entre a página de administração e o componente `Sidebar.tsx`.
4. **Cache Offline Resiliente:** Armazenamento em `localStorage` para carregamento instantâneo mesmo com conexões instáveis.

---

## 4. Testes Automatizados e Homologação

A suíte de testes unitários foi implementada em `server/adminModulos.test.ts` utilizando Vitest, cobrindo:
1. Obtenção da lista padrão de negócios cadastrados.
2. Obtenção de módulos específicos por unidade de negócio.
3. Adição de um novo módulo com persistência no store.
4. Modificação de propriedades de um módulo existente.
5. Alternância de status ativo/inativo (toggle).
6. Reordenação hierárquica de módulos.
7. Exclusão de módulo.
8. Criação de nova unidade de negócio com isolamento de catálogo.

**Resultado dos Testes:** 8 de 8 testes aprovados com 100% de sucesso.

---

## 5. Deploy no Google Cloud Platform

- **Serviço Cloud Run:** `erp-bancofe`
- **Região:** `southamerica-east1` (São Paulo)
- **Workflow CI/CD:** `.github/workflows/deploy-gcp.yml`
- **Configuração de Build:** `cloudbuild.yaml` e `deploy_gcp.sh`
