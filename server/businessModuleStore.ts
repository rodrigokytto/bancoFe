import fs from "fs";
import path from "path";
import {
  BusinessUnit,
  BusinessModuleConfig,
  DEFAULT_BUSINESSES,
  INITIAL_MODULES_BY_BUSINESS
} from "@shared/businessModules";

const CONFIG_FILE = path.resolve(process.cwd(), "data", "businessModulesConfig.json");

export class BusinessModuleStore {
  private businesses: BusinessUnit[] = [];
  private modulesByBusiness: Record<string, BusinessModuleConfig[]> = {};
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    try {
      const dataDir = path.dirname(CONFIG_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.businesses && Array.isArray(parsed.businesses)) {
          this.businesses = parsed.businesses;
        } else {
          this.businesses = JSON.parse(JSON.stringify(DEFAULT_BUSINESSES));
        }

        if (parsed.modulesByBusiness && typeof parsed.modulesByBusiness === "object") {
          this.modulesByBusiness = parsed.modulesByBusiness;
        } else {
          this.modulesByBusiness = JSON.parse(JSON.stringify(INITIAL_MODULES_BY_BUSINESS));
        }
      } else {
        this.businesses = JSON.parse(JSON.stringify(DEFAULT_BUSINESSES));
        this.modulesByBusiness = JSON.parse(JSON.stringify(INITIAL_MODULES_BY_BUSINESS));
        this.saveToFile();
      }
    } catch (err) {
      console.error("[BusinessModuleStore] Erro ao carregar arquivo de config, usando defaults:", err);
      this.businesses = JSON.parse(JSON.stringify(DEFAULT_BUSINESSES));
      this.modulesByBusiness = JSON.parse(JSON.stringify(INITIAL_MODULES_BY_BUSINESS));
    }

    this.initialized = true;
  }

  private saveToFile() {
    try {
      const dataDir = path.dirname(CONFIG_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify(
          {
            businesses: this.businesses,
            modulesByBusiness: this.modulesByBusiness,
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (err) {
      console.error("[BusinessModuleStore] Erro ao salvar arquivo de config:", err);
    }
  }

  // --- Negócios (Businesses) ---

  public getBusinesses(): BusinessUnit[] {
    return [...this.businesses];
  }

  public getBusinessById(id: string): BusinessUnit | undefined {
    return this.businesses.find((b) => b.id === id);
  }

  public saveBusiness(unit: Partial<BusinessUnit> & { name: string }): BusinessUnit {
    const now = new Date().toISOString();
    let id = unit.id;

    if (!id) {
      id = (unit.slug || unit.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")).replace(/^_+|_+$/g, "");
      // Garantir id único
      let counter = 1;
      let finalId = id;
      while (this.businesses.some((b) => b.id === finalId)) {
        finalId = `${id}_${counter++}`;
      }
      id = finalId;
    }

    const existingIndex = this.businesses.findIndex((b) => b.id === id);
    if (existingIndex >= 0) {
      const updated: BusinessUnit = {
        ...this.businesses[existingIndex],
        ...unit,
        id,
        updatedAt: now,
      };
      this.businesses[existingIndex] = updated;
      this.saveToFile();
      return updated;
    } else {
      const created: BusinessUnit = {
        id,
        name: unit.name,
        slug: unit.slug || id,
        description: unit.description || `Módulo operacional para ${unit.name}`,
        iconName: unit.iconName || "Building2",
        badge: unit.badge || "Negócio",
        colorScheme: unit.colorScheme || "blue",
        cnpj: unit.cnpj || "",
        cidade: unit.cidade || "",
        unidade: unit.unidade || "",
        status: unit.status || "active",
        createdAt: now,
        updatedAt: now,
      };
      this.businesses.push(created);

      if (!this.modulesByBusiness[id]) {
        this.modulesByBusiness[id] = [];
      }

      this.saveToFile();
      return created;
    }
  }

  public deleteBusiness(id: string): boolean {
    const b = this.businesses.find((item) => item.id === id);
    if (b && b.isDefault) {
      throw new Error("Não é permitido excluir o negócio padrão do sistema BancoFe.");
    }
    const prevLen = this.businesses.length;
    this.businesses = this.businesses.filter((item) => item.id !== id);
    delete this.modulesByBusiness[id];
    this.saveToFile();
    return this.businesses.length < prevLen;
  }

  // --- Módulos por Negócio ---

  public getModulesByBusiness(businessId: string): BusinessModuleConfig[] {
    const list = this.modulesByBusiness[businessId];
    if (!list) {
      return [];
    }
    return [...list].sort((a, b) => a.order - b.order);
  }

  public saveModule(
    businessId: string,
    mod: Partial<BusinessModuleConfig> & { label: string }
  ): BusinessModuleConfig {
    const now = new Date().toISOString();
    let currentList = this.modulesByBusiness[businessId] || [];

    let id = mod.id;
    if (!id) {
      id = mod.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      let counter = 1;
      let finalId = id;
      while (currentList.some((m) => m.id === finalId)) {
        finalId = `${id}_${counter++}`;
      }
      id = finalId;
    }

    const existingIndex = currentList.findIndex((m) => m.id === id);
    if (existingIndex >= 0) {
      const updated: BusinessModuleConfig = {
        ...currentList[existingIndex],
        ...mod,
        id,
        businessId,
        updatedAt: now,
      };
      currentList[existingIndex] = updated;
      this.modulesByBusiness[businessId] = currentList;
      this.saveToFile();
      return updated;
    } else {
      const nextOrder = currentList.length > 0 ? Math.max(...currentList.map((m) => m.order || 0)) + 1 : 1;
      const created: BusinessModuleConfig = {
        id,
        businessId,
        label: mod.label,
        description: mod.description || "",
        iconName: mod.iconName || "Boxes",
        badge: mod.badge || "Módulo",
        badgeColor: mod.badgeColor || "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        defaultPath: mod.defaultPath || "/erp",
        order: typeof mod.order === "number" ? mod.order : nextOrder,
        active: mod.active !== undefined ? mod.active : true,
        permission: mod.permission || "all",
        domains: Array.isArray(mod.domains) ? mod.domains : ["frente_loja"],
        isCustom: true,
        createdAt: now,
        updatedAt: now,
      };
      currentList.push(created);
      this.modulesByBusiness[businessId] = currentList;
      this.saveToFile();
      return created;
    }
  }

  public deleteModule(businessId: string, moduleId: string): boolean {
    const currentList = this.modulesByBusiness[businessId] || [];
    const prevLen = currentList.length;
    this.modulesByBusiness[businessId] = currentList.filter((m) => m.id !== moduleId);
    this.saveToFile();
    return this.modulesByBusiness[businessId].length < prevLen;
  }

  public toggleModule(businessId: string, moduleId: string, active: boolean): BusinessModuleConfig {
    const currentList = this.modulesByBusiness[businessId] || [];
    const mod = currentList.find((m) => m.id === moduleId);
    if (!mod) {
      throw new Error(`Módulo '${moduleId}' não encontrado no negócio '${businessId}'`);
    }
    mod.active = active;
    mod.updatedAt = new Date().toISOString();
    this.saveToFile();
    return mod;
  }

  public reorderModules(businessId: string, orderedIds: string[]): BusinessModuleConfig[] {
    const currentList = this.modulesByBusiness[businessId] || [];
    const map = new Map(currentList.map((m) => [m.id, m]));
    const result: BusinessModuleConfig[] = [];

    orderedIds.forEach((id, idx) => {
      const mod = map.get(id);
      if (mod) {
        mod.order = idx + 1;
        result.push(mod);
        map.delete(id);
      }
    });

    // Anexar os que não estavam no array
    map.forEach((mod) => {
      mod.order = result.length + 1;
      result.push(mod);
    });

    this.modulesByBusiness[businessId] = result;
    this.saveToFile();
    return result;
  }

  public resetToDefault(businessId: string): BusinessModuleConfig[] {
    const defaults = INITIAL_MODULES_BY_BUSINESS[businessId];
    if (defaults) {
      this.modulesByBusiness[businessId] = JSON.parse(JSON.stringify(defaults));
    } else {
      this.modulesByBusiness[businessId] = [];
    }
    this.saveToFile();
    return this.modulesByBusiness[businessId];
  }

  public exportFullConfig() {
    return {
      businesses: this.businesses,
      modulesByBusiness: this.modulesByBusiness,
      exportedAt: new Date().toISOString(),
    };
  }

  public importFullConfig(data: { businesses: BusinessUnit[]; modulesByBusiness: Record<string, BusinessModuleConfig[]> }) {
    if (data.businesses && Array.isArray(data.businesses)) {
      this.businesses = data.businesses;
    }
    if (data.modulesByBusiness && typeof data.modulesByBusiness === "object") {
      this.modulesByBusiness = data.modulesByBusiness;
    }
    this.saveToFile();
    return {
      success: true,
      businessesCount: this.businesses.length,
    };
  }
}

export const businessModuleStore = new BusinessModuleStore();
