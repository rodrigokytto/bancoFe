import fs from "fs";
import path from "path";

const filePath = "/home/ubuntu/zuma/client/src/pages/Integracoes.tsx";
let content = fs.readFileSync(filePath, "utf-8");

// 1. Inserir imports dos novos componentes
const importMarker = `import { SaiposSyncTab } from "../components/integracoes/SaiposSyncTab";`;
const newImports = `import { SaiposSyncTab } from "../components/integracoes/SaiposSyncTab";
import { GoogleEcosystemHub } from "../components/integrations/GoogleEcosystemHub";
import { BancosTefHub } from "../components/integrations/BancosTefHub";
import { GitMcpServerHub } from "../components/integrations/GitMcpServerHub";
import { DecisionIntelligenceHub } from "../components/integrations/DecisionIntelligenceHub";
import { BrainCircuit } from "lucide-react";`;

content = content.replace(importMarker, newImports);

// 2. Atualizar ConexaoItem
content = content.replace(
  `pilar: "delivery" | "pagamentos" | "fiscal" | "crm" | "hardware" | "logistica";`,
  `pilar: "delivery" | "pagamentos" | "fiscal" | "crm" | "hardware" | "logistica" | "google" | "devops" | "decisao";`
);
content = content.replace(
  `linkAba?: "ifood" | "keeto" | "opendelivery" | "nossa_gente_ultra" | "saipos_sync";`,
  `linkAba?: "ifood" | "keeto" | "opendelivery" | "nossa_gente_ultra" | "saipos_sync" | "google" | "bancos_tef" | "git_mcps" | "decisao";`
);

// 3. Adicionar novas conexões no CATALOGO_CONEXOES
const catalogMarker = `export const CATALOGO_CONEXOES: ConexaoItem[] = [`;
const newCatalogItems = `export const CATALOGO_CONEXOES: ConexaoItem[] = [
  // ==================== PILAR GOOGLE WORKSPACE & CLOUD INTELLIGENCE ====================
  {
    id: "google_sheets_bi",
    pilar: "google",
    pilarLabel: "Google Cloud & Workspace",
    nome: "Google Sheets & BigQuery BI Streaming",
    subtitulo: "DRE diária, fluxo de caixa, kardex de salmão e streaming em tempo real",
    tipoConexao: "Google Sheets API v4 • BigQuery Streaming",
    icone: Database,
    corIcone: "text-white",
    bgIcone: "bg-blue-600",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 38,
    metricas: {
      label1: "Planilhas Ativas",
      valor1: "4 Planilhas Conectadas",
      label2: "Pipeline BI",
      valor2: "Looker Studio Tangará",
      label3: "Sincronização",
      valor3: "Bi-direcional D+0"
    },
    descricao: "Exportação e leitura automatizada de DRE, fluxo de caixa e curva ABC diretamente no ecossistema Google Workspace do restaurante.",
    canalPing: "google_sheets",
    destaque: true,
    linkAba: "google"
  },
  {
    id: "google_drive_cloud",
    pilar: "google",
    pilarLabel: "Google Cloud & Workspace",
    nome: "Google Drive Cloud Backup Fiscal & Snapshots",
    subtitulo: "Armazenamento em nuvem de lotes XML de NFC-e e backups de banco",
    tipoConexao: "Google Drive v3 • Criptografia SHA-256",
    icone: Database,
    corIcone: "text-white",
    bgIcone: "bg-indigo-600",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 42,
    metricas: {
      label1: "Espaço Utilizado",
      valor1: "342.8 MB em Nuvem",
      label2: "Lotes Salvos",
      valor2: "148 Arquivos XML",
      label3: "Frequência",
      valor3: "Automático no Fechamento"
    },
    descricao: "Guarda segura e inviolável de todos os documentos fiscais emitidos contra a SEFAZ-MT e snapshots compactados do restaurante.",
    canalPing: "google_drive",
    destaque: true,
    linkAba: "google"
  },

  // ==================== PILAR BANCOS, OPEN FINANCE & TEF MULTIMARCAS ====================
  {
    id: "bancos_open_finance",
    pilar: "pagamentos",
    pilarLabel: "Pagamentos & FinTech",
    nome: "Open Finance Bancos & Cooperativas MT (Sicredi/Sicoob)",
    subtitulo: "Conciliação bancária D+0, Pix instantâneo e split de contas",
    tipoConexao: "BACEN Open Finance • Mutual TLS",
    icone: CreditCard,
    corIcone: "text-white",
    bgIcone: "bg-emerald-700",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 12,
    metricas: {
      label1: "Saldo Consolidado",
      valor1: "R$ 180.770,00",
      label2: "Conciliação D+0",
      valor2: "100.0% das Vendas",
      label3: "Contas Conectadas",
      valor3: "Sicredi, Sicoob, BB, Itaú"
    },
    descricao: "Conexão direta com as contas bancárias corporativas de Tangará da Serra para auditoria de recebíveis e liquidação de pedidos.",
    canalPing: "sicredi",
    destaque: true,
    linkAba: "bancos_tef"
  },
  {
    id: "tef_multimarcas_hub",
    pilar: "pagamentos",
    pilarLabel: "Pagamentos & FinTech",
    nome: "Hub TEF Multi-Adquirente & Auditoria MDR",
    subtitulo: "Stone Hub, Cielo LIO, PagBank com bloqueio de taxas indevidas",
    tipoConexao: "TEF IP • SmartPOS Android",
    icone: CreditCard,
    corIcone: "text-white",
    bgIcone: "bg-teal-600",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 16,
    metricas: {
      label1: "Terminais Ativos",
      valor1: "3 SmartPOS Homologadas",
      label2: "Economia MDR",
      valor2: "R$ 1.940,00 Retidos no Mês",
      label3: "Gorjeta 10%",
      valor3: "Split Salão / Sushibar"
    },
    descricao: "Gateway de pagamentos físicos com roteamento inteligente entre Stone e Cielo e trava contra cobranças divergentes de operadoras.",
    canalPing: "tef",
    destaque: true,
    linkAba: "bancos_tef"
  },

  // ==================== PILAR GIT DEVOPS & SERVIDOR MCP ====================
  {
    id: "zuma_mcp_server",
    pilar: "devops",
    pilarLabel: "Git, DevOps & MCP Server",
    nome: "Zuma Model Context Protocol (MCP) Server Oficial",
    subtitulo: "Interface padronizada para agentes de IA (Manus, Claude, ChatGPT, Cursor)",
    tipoConexao: "MCP Protocol v2024-11-05 • SSE / REST",
    icone: Bot,
    corIcone: "text-white",
    bgIcone: "bg-purple-700",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 11,
    metricas: {
      label1: "Ferramentas Ativas",
      valor1: "6 Tools Padronizadas",
      label2: "Protocolo",
      valor2: "Anthropic / Claude Compatible",
      label3: "Endpoint Oficial",
      valor3: "/api/mcp/tools/call"
    },
    descricao: "Permite que agentes autônomos consultem KPIs em tempo real, status das 27 mesas físicas, estoque de salmão e KDS via chamadas padronizadas.",
    canalPing: "mcp",
    destaque: true,
    linkAba: "git_mcps"
  },
  {
    id: "git_cardapio_code",
    pilar: "devops",
    pilarLabel: "Git, DevOps & MCP Server",
    nome: "Git DevOps & Cardápio-as-Code",
    subtitulo: "Repositório rodrigokytto/zuma com CI/CD e versionamento de 211 SKUs",
    tipoConexao: "GitHub Webhooks • Cloud Run CI/CD",
    icone: GitBranch,
    corIcone: "text-white",
    bgIcone: "bg-slate-800",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 14,
    metricas: {
      label1: "Repositório GitHub",
      valor1: "rodrigokytto/zuma (main/prd)",
      label2: "Versão Cardápio",
      valor2: "v2.8.4 Versionada",
      label3: "Snapshots Banco",
      valor3: "Assinatura SHA-256"
    },
    descricao: "Controle de versão de software e dados do restaurante, com histórico completo de alterações e rollback instantâneo.",
    canalPing: "git",
    destaque: true,
    linkAba: "git_mcps"
  },

  // ==================== PILAR TOMADA DE DECISÃO 360° ====================
  {
    id: "decision_hub_360",
    pilar: "decisao",
    pilarLabel: "Central de Tomada de Decisão",
    nome: "Central de Tomada de Decisão & Inteligência Analítica",
    subtitulo: "Cruzamento multissetorial de Clima, Safra Agro MT, TEF e KDS",
    tipoConexao: "Zumi AI Reasoning Engine",
    icone: BrainCircuit,
    corIcone: "text-white",
    bgIcone: "bg-amber-600",
    statusPadrao: "OPERACIONAL",
    latenciaReferenciaMs: 18,
    metricas: {
      label1: "Fontes Cruzadas",
      valor1: "4 Ecossistemas de Dados",
      label2: "Impacto Estimado",
      valor2: "+R$ 4.390,00 no Turno",
      label3: "Modo Operacional",
      valor3: "Execução 1-Click"
    },
    descricao: "Motor de inteligência analítica que cruza previsão meteorológica, pagamento do agronegócio e telemetria de cozinha para sugerir ações imediatas.",
    canalPing: "decisao",
    destaque: true,
    linkAba: "decisao"
  },`;

content = content.replace(catalogMarker, newCatalogItems);

// 4. Atualizar o activeTab useState
const activeTabMarker = `const [activeTab, setActiveTab] = useState<"canais" | "ifood" | "keeto" | "opendelivery" | "nossa_gente_ultra" | "saipos_killer" | "saipos_sync" | "sandbox" | "gaps_tangara" | "webhooks_audit" | "credenciais" | "matriz_tecnica">(() => {`;
const newActiveTabType = `const [activeTab, setActiveTab] = useState<"canais" | "ifood" | "keeto" | "opendelivery" | "nossa_gente_ultra" | "google" | "bancos_tef" | "git_mcps" | "decisao" | "saipos_killer" | "saipos_sync" | "sandbox" | "gaps_tangara" | "webhooks_audit" | "credenciais" | "matriz_tecnica">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p === "google" || p === "sheets" || p === "drive" || p === "bigquery") return "google";
      if (p === "bancos" || p === "tef" || p === "bancos_tef" || p === "open_finance") return "bancos_tef";
      if (p === "git" || p === "mcp" || p === "git_mcps" || p === "mcps") return "git_mcps";
      if (p === "decisao" || p === "decision" || p === "inteligencia") return "decisao";`;

content = content.replace(activeTabMarker, newActiveTabType);

// 5. Adicionar botões na barra de navegação de abas
const navMarker = `{ id: "canais", label: "🔌 Catálogo de Conexões (26)", icon: Layers, badge: "26 APIs", badgeColor: "bg-emerald-600 text-white" },`;
const newNavItems = `{ id: "canais", label: "🔌 Catálogo de Conexões (33)", icon: Layers, badge: "33 APIs", badgeColor: "bg-emerald-600 text-white" },
          { id: "google", label: "📊 Google Cloud & Workspace", icon: Database, badge: "Sheets/BigQuery", badgeColor: "bg-blue-600 text-white" },
          { id: "bancos_tef", label: "💳 Bancos, Open Finance & TEF", icon: CreditCard, badge: "Sicredi/Stone", badgeColor: "bg-emerald-600 text-white" },
          { id: "git_mcps", label: "🤖 Git DevOps & Servidor MCP", icon: Bot, badge: "IA Protocol", badgeColor: "bg-purple-600 text-white" },
          { id: "decisao", label: "🧠 Tomada de Decisão 360°", icon: BrainCircuit, badge: "Zumi IA", badgeColor: "bg-amber-600 text-white" },`;

content = content.replace(navMarker, newNavItems);

// 6. Adicionar renderização dos novos componentes nas abas
const renderMarker = `{/* 5. ABA SINCRONIZADOR SAIPOS */}
      {activeTab === "saipos_sync" && <SaiposSyncTab />}`;
const newRenders = `{/* 5. ABA SINCRONIZADOR SAIPOS */}
      {activeTab === "saipos_sync" && <SaiposSyncTab />}

      {/* 6. ABA GOOGLE CLOUD & WORKSPACE ECOSYSTEM */}
      {activeTab === "google" && <GoogleEcosystemHub />}

      {/* 7. ABA BANCOS, OPEN FINANCE & TEF MULTIMARCAS */}
      {activeTab === "bancos_tef" && <BancosTefHub />}

      {/* 8. ABA GIT DEVOPS & ZUMA MCP SERVER */}
      {activeTab === "git_mcps" && <GitMcpServerHub />}

      {/* 9. ABA CENTRAL DE TOMADA DE DECISÃO 360° */}
      {activeTab === "decisao" && <DecisionIntelligenceHub />}`;

content = content.replace(renderMarker, newRenders);

fs.writeFileSync(filePath, content, "utf-8");
console.log("Integracoes.tsx atualizado com sucesso!");
