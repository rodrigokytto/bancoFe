import fs from "fs";

// ==========================================
// 1. ATUALIZAR ErpMaster.tsx
// ==========================================
const erpPath = "/home/ubuntu/zumapilot/client/src/pages/ErpMaster.tsx";
let erpContent = fs.readFileSync(erpPath, "utf-8");

// Imports lucide-react
if (!erpContent.includes("Wheat,")) {
  erpContent = erpContent.replace('  Barcode\n} from "lucide-react";', '  Barcode,\n  Wheat,\n  Truck\n} from "lucide-react";');
}

// Imports subsuites
const subImportTarget = 'import { ErpComercialSubsuite } from "@/components/erp/ErpComercialSubsuite";';
const subImportReplacement = `import { ErpComercialSubsuite } from "@/components/erp/ErpComercialSubsuite";
import { ErpAgroSubsuite } from "@/components/erp/ErpAgroSubsuite";
import { ErpOrdemServicoSubsuite } from "@/components/erp/ErpOrdemServicoSubsuite";
import { ErpExpedicaoSubsuite } from "@/components/erp/ErpExpedicaoSubsuite";`;

if (!erpContent.includes("ErpAgroSubsuite")) {
  erpContent = erpContent.replace(subImportTarget, subImportReplacement);
}

// Tipagem ErpTab
erpContent = erpContent.replace(
  '| "customer360" | "comercial";',
  '| "customer360" | "comercial" | "agro" | "os" | "expedicao";'
);

// getInitialTab
const initialTabTarget = "  const getInitialTab = (): ErpTab => {";
const initialTabReplacement = `  const getInitialTab = (): ErpTab => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get("tab") as ErpTab;
      if (tabParam) return tabParam;
    }
    if (location.includes("agro") || location.includes("balanca") || location.includes("silos")) return "agro";
    if (location.includes("ordem-servico") || location.includes("manutencao") || location.includes("/os")) return "os";
    if (location.includes("expedicao") || location.includes("logistica") || location.includes("romaneio")) return "expedicao";`;

if (!erpContent.includes('sp.get("tab")')) {
  erpContent = erpContent.replace(initialTabTarget, initialTabReplacement);
}

// Select Mobile
const selectMobileTarget = '<option value="comercial">💼 25. Comercial B2B & Propostas</option>';
const selectMobileReplacement = `<option value="comercial">💼 25. Comercial B2B & Propostas</option>
              <option value="agro">🌾 26. Módulo Agro & Safra MT (Balança 80t / Silos)</option>
              <option value="os">🛠️ 27. Ordens de Serviço & Manutenção 360°</option>
              <option value="expedicao">🚚 28. Expedição & Romaneios de Entrega</option>`;

if (erpContent.includes(selectMobileTarget) && !erpContent.includes('value="agro"')) {
  erpContent = erpContent.replace(selectMobileTarget, selectMobileReplacement);
}

// Abas Desktop
const desktopTabTarget = '{ id: "comercial", label: "Comercial B2B", icon: Briefcase },';
const desktopTabReplacement = `{ id: "comercial", label: "Comercial B2B", icon: Briefcase },
            { id: "agro", label: "🌾 Agro & Silos MT", icon: Wheat },
            { id: "os", label: "🛠️ OS & Manutenção", icon: Wrench },
            { id: "expedicao", label: "🚚 Expedição & Rotas", icon: Truck },`;

if (erpContent.includes(desktopTabTarget) && !erpContent.includes('id: "agro"')) {
  erpContent = erpContent.replace(desktopTabTarget, desktopTabReplacement);
}

// Renderização das abas
const renderTarget = `{activeTab === "comercial" && (
        <ErpComercialSubsuite />
      )}`;

const renderReplacement = `{activeTab === "comercial" && (
        <ErpComercialSubsuite />
      )}

      {activeTab === "agro" && (
        <ErpAgroSubsuite />
      )}

      {activeTab === "os" && (
        <ErpOrdemServicoSubsuite />
      )}

      {activeTab === "expedicao" && (
        <ErpExpedicaoSubsuite />
      )}`;

if (erpContent.includes(renderTarget) && !erpContent.includes('activeTab === "agro"')) {
  erpContent = erpContent.replace(renderTarget, renderReplacement);
}

fs.writeFileSync(erpPath, erpContent, "utf-8");
console.log("✓ ErpMaster.tsx 100% atualizado com Agro, OS e Expedição!");

// ==========================================
// 2. ATUALIZAR Sidebar.tsx
// ==========================================
const sidebarPath = "/home/ubuntu/zumapilot/client/src/components/shell/Sidebar.tsx";
let sidebarContent = fs.readFileSync(sidebarPath, "utf-8");

if (!sidebarContent.includes("Wheat,")) {
  sidebarContent = sidebarContent.replace("  FileArchive,", "  FileArchive,\n  Wheat,\n  Wrench,\n  Truck,");
}

const sidebarTarget = '{ path: "/reservas", label: "Reservas & Tatames VIP", icon: CalendarCheck2 },';
const sidebarReplacement = `{ path: "/reservas", label: "Reservas & Tatames VIP", icon: CalendarCheck2 },
      { path: "/erp?tab=agro", label: "Módulo Agro & Safra MT", icon: Wheat, badge: "Safra", badgeColor: "bg-emerald-600 text-white" },
      { path: "/erp?tab=varejo", label: "Varejo & Toledo Prix", icon: Store, badge: "EAN-13", badgeColor: "bg-blue-600 text-white" },
      { path: "/erp?tab=comercial", label: "Comercial B2B & Buffets", icon: Building2, badge: "B2B", badgeColor: "bg-amber-600 text-white" },
      { path: "/erp?tab=customer360", label: "Customer 360° & Score", icon: Users, badge: "0-1000", badgeColor: "bg-violet-600 text-white" },
      { path: "/erp?tab=os", label: "Ordens de Serviço 360", icon: Wrench, badge: "OS", badgeColor: "bg-orange-600 text-white" },
      { path: "/erp?tab=expedicao", label: "Expedição & Rotas", icon: Truck, badge: "GPS", badgeColor: "bg-teal-600 text-white" },
      { path: "/erp?tab=concreto", label: "Concreto Serrano", icon: Building2, badge: "Holding", badgeColor: "bg-stone-600 text-white" },`;

if (sidebarContent.includes(sidebarTarget) && !sidebarContent.includes('path: "/erp?tab=agro"')) {
  sidebarContent = sidebarContent.replace(sidebarTarget, sidebarReplacement);
}

fs.writeFileSync(sidebarPath, sidebarContent, "utf-8");
console.log("✓ Sidebar.tsx 100% atualizado com as novas rotas de ERP!");
