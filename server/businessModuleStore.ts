import fs from "fs";
import path from "path";
import {
  BusinessUnit,
  BusinessModuleConfig,
  DEFAULT_BUSINESSES,
  INITIAL_MODULES_BY_BUSINESS,
  BusinessMetrics
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
      }

      // Enriquecer com métricas e telemetria padrão caso ausentes
      this.enrichDefaults();
      this.saveToFile();
    } catch (err) {
      console.error("[BusinessModuleStore] Erro ao carregar arquivo de config, usando defaults:", err);
      this.businesses = JSON.parse(JSON.stringify(DEFAULT_BUSINESSES));
      this.modulesByBusiness = JSON.parse(JSON.stringify(INITIAL_MODULES_BY_BUSINESS));
      this.enrichDefaults();
    }

    this.initialized = true;
  }

  private enrichDefaults() {
    const defaultBizMap = new Map(DEFAULT_BUSINESSES.map((b) => [b.id, b]));
    this.businesses = this.businesses.map((b) => {
      const def = defaultBizMap.get(b.id);
      if (!b.metrics && def?.metrics) {
        return { ...b, metrics: def.metrics };
      }
      return b;
    });

    for (const [bizId, mods] of Object.entries(this.modulesByBusiness)) {
      const defMods = INITIAL_MODULES_BY_BUSINESS[bizId] || [];
      const defModMap = new Map(defMods.map((m) => [m.id, m]));
      this.modulesByBusiness[bizId] = mods.map((m) => {
        if (!m.telemetry) {
          const defMod = defModMap.get(m.id);
          if (defMod?.telemetry) {
            return { ...m, telemetry: defMod.telemetry };
          } else {
            return {
              ...m,
              telemetry: {
                monthlyRequests: 12500,
                uptimePercent: 99.98,
                avgLatencyMs: 14,
                status: "healthy",
                costReduction: 2500,
                usersCount: 8,
                lastSync: "Agora",
              },
            };
          }
        }
        return m;
      });
    }
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
    return this.businesses.map((biz) => {
      const liveMetrics = this.getCalculatedMetrics(biz.id);
      return {
        ...biz,
        metrics: liveMetrics || biz.metrics,
      };
    });
  }

  public getBusinessById(id: string): BusinessUnit | undefined {
    const biz = this.businesses.find((b) => b.id === id);
    if (!biz) return undefined;
    const liveMetrics = this.getCalculatedMetrics(biz.id);
    return {
      ...biz,
      metrics: liveMetrics || biz.metrics,
    };
  }

  public getCalculatedMetrics(businessId: string): BusinessMetrics | undefined {
    const biz = this.businesses.find((b) => b.id === businessId);
    if (!biz) return undefined;

    const mods = this.getModulesByBusiness(businessId);
    const activeMods = mods.filter((m) => m.active);

    const baseMetrics = biz.metrics || {
      monthlyVolume: 100000,
      monthlyTransactions: 1000,
      uptimeSla: 99.99,
      avgLatencyMs: 15,
      monthlySavings: 5000,
      activeUsersCount: 10,
      hoursSavedMonthly: 50,
      complianceScore: 100,
    };

    if (activeMods.length === 0) {
      return {
        ...baseMetrics,
        uptimeSla: 0,
        monthlySavings: 0,
        hoursSavedMonthly: 0,
      };
    }

    // Calcular agregação dinâmica real com base nos módulos ativos
    let totalRequests = 0;
    let totalSavings = 0;
    let sumLatency = 0;
    let sumUptime = 0;

    activeMods.forEach((m) => {
      const t = m.telemetry;
      if (t) {
        totalRequests += t.monthlyRequests || 0;
        totalSavings += t.costReduction || 0;
        sumLatency += t.avgLatencyMs || 15;
        sumUptime += t.uptimePercent || 99.98;
      }
    });

    const avgLatency = Math.round(sumLatency / activeMods.length);
    const avgUptime = Number((sumUptime / activeMods.length).toFixed(2));
    const hoursSaved = Math.round((totalSavings / 65)); // base ~R$ 65/h homem

    return {
      monthlyVolume: baseMetrics.monthlyVolume,
      monthlyTransactions: totalRequests > 0 ? totalRequests : baseMetrics.monthlyTransactions,
      uptimeSla: avgUptime,
      avgLatencyMs: avgLatency,
      monthlySavings: totalSavings > 0 ? totalSavings : baseMetrics.monthlySavings,
      activeUsersCount: baseMetrics.activeUsersCount,
      hoursSavedMonthly: hoursSaved > 0 ? hoursSaved : baseMetrics.hoursSavedMonthly,
      complianceScore: baseMetrics.complianceScore,
    };
  }

  public saveBusiness(unit: Partial<BusinessUnit> & { name: string }): BusinessUnit {
    const now = new Date().toISOString();
    let id = unit.id;

    if (!id) {
      id = (unit.slug || unit.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")).replace(/^_+|_+$/g, "");
      let counter = 1;
      let finalId = id;
      while (this.businesses.some((b) => b.id === finalId)) {
        finalId = `${id}_${counter++}`;
      }
      id = finalId;
    }

    const existingIdx = this.businesses.findIndex((b) => b.id === id);
    let saved: BusinessUnit;

    if (existingIdx >= 0) {
      saved = {
        ...this.businesses[existingIdx],
        ...unit,
        id,
        updatedAt: now,
      };
      this.businesses[existingIdx] = saved;
    } else {
      saved = {
        id,
        name: unit.name,
        slug: unit.slug || id,
        description: unit.description || "",
        iconName: unit.iconName || "Building2",
        badge: unit.badge || "Negócio",
        colorScheme: unit.colorScheme || "blue",
        cnpj: unit.cnpj || "",
        cidade: unit.cidade || "Tangará da Serra - MT",
        unidade: unit.unidade || "Matriz Operacional",
        status: unit.status || "active",
        metrics: {
          monthlyVolume: 250000,
          monthlyTransactions: 5000,
          uptimeSla: 99.98,
          avgLatencyMs: 16,
          monthlySavings: 8500,
          activeUsersCount: 15,
          hoursSavedMonthly: 80,
          complianceScore: 100,
        },
        createdAt: now,
        updatedAt: now,
      };
      this.businesses.push(saved);
      if (!this.modulesByBusiness[id]) {
        this.modulesByBusiness[id] = [];
      }
    }

    this.saveToFile();
    return saved;
  }

  public deleteBusiness(id: string): boolean {
    const idx = this.businesses.findIndex((b) => b.id === id);
    if (idx === -1) return false;

    this.businesses.splice(idx, 1);
    delete this.modulesByBusiness[id];
    this.saveToFile();
    return true;
  }

  // --- Módulos (Modules) ---

  public getModulesByBusiness(businessId: string): BusinessModuleConfig[] {
    if (!this.modulesByBusiness[businessId]) {
      if (INITIAL_MODULES_BY_BUSINESS[businessId]) {
        this.modulesByBusiness[businessId] = JSON.parse(
          JSON.stringify(INITIAL_MODULES_BY_BUSINESS[businessId])
        );
        this.saveToFile();
      } else {
        this.modulesByBusiness[businessId] = [];
      }
    }
    return [...this.modulesByBusiness[businessId]].sort((a, b) => a.order - b.order);
  }

  public saveModule(
    businessId: string,
    mod: Partial<BusinessModuleConfig> & { label: string; defaultPath: string }
  ): BusinessModuleConfig {
    const now = new Date().toISOString();
    const modules = this.getModulesByBusiness(businessId);
    let id = mod.id;

    if (!id) {
      id = mod.label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

      let counter = 1;
      let finalId = id;
      while (modules.some((m) => m.id === finalId)) {
        finalId = `${id}_${counter++}`;
      }
      id = finalId;
    }

    const existingIdx = modules.findIndex((m) => m.id === id);
    let saved: BusinessModuleConfig;

    if (existingIdx >= 0) {
      saved = {
        ...modules[existingIdx],
        ...mod,
        id,
        businessId,
        updatedAt: now,
      };
      modules[existingIdx] = saved;
    } else {
      const maxOrder = modules.reduce((max, m) => Math.max(max, m.order), 0);
      saved = {
        id,
        businessId,
        label: mod.label,
        description: mod.description || "",
        iconName: mod.iconName || "Boxes",
        badge: mod.badge || "",
        badgeColor: mod.badgeColor || "",
        defaultPath: mod.defaultPath,
        order: mod.order !== undefined ? mod.order : maxOrder + 1,
        active: mod.active !== undefined ? mod.active : true,
        permission: mod.permission || "all",
        domains: mod.domains || ["frente_loja"],
        isCustom: true,
        telemetry: {
          monthlyRequests: 8500,
          uptimePercent: 99.98,
          avgLatencyMs: 14,
          status: "healthy",
          costReduction: 1800,
          usersCount: 6,
          lastSync: "Recém criado",
        },
        createdAt: now,
        updatedAt: now,
      };
      modules.push(saved);
    }

    this.modulesByBusiness[businessId] = modules;
    this.saveToFile();
    return saved;
  }

  public deleteModule(businessId: string, moduleId: string): boolean {
    const modules = this.getModulesByBusiness(businessId);
    const idx = modules.findIndex((m) => m.id === moduleId);
    if (idx === -1) return false;

    modules.splice(idx, 1);
    this.modulesByBusiness[businessId] = modules;
    this.saveToFile();
    return true;
  }

  public toggleModuleActive(businessId: string, moduleId: string, active?: boolean): BusinessModuleConfig | undefined {
    const modules = this.getModulesByBusiness(businessId);
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return undefined;

    mod.active = active !== undefined ? active : !mod.active;
    mod.updatedAt = new Date().toISOString();
    this.modulesByBusiness[businessId] = modules;
    this.saveToFile();
    return mod;
  }

  public toggleModule(businessId: string, moduleId: string, active?: boolean): BusinessModuleConfig | undefined {
    return this.toggleModuleActive(businessId, moduleId, active);
  }

  public reorderModules(businessId: string, orderedModuleIds: string[]): BusinessModuleConfig[] {
    const modules = this.getModulesByBusiness(businessId);
    const modMap = new Map(modules.map((m) => [m.id, m]));

    const newOrder: BusinessModuleConfig[] = [];
    orderedModuleIds.forEach((id, index) => {
      const m = modMap.get(id);
      if (m) {
        m.order = index + 1;
        m.updatedAt = new Date().toISOString();
        newOrder.push(m);
        modMap.delete(id);
      }
    });

    modMap.forEach((m) => {
      m.order = newOrder.length + 1;
      newOrder.push(m);
    });

    this.modulesByBusiness[businessId] = newOrder;
    this.saveToFile();
    return newOrder;
  }

  public resetToDefault(businessId?: string) {
    if (businessId) {
      if (INITIAL_MODULES_BY_BUSINESS[businessId]) {
        this.modulesByBusiness[businessId] = JSON.parse(
          JSON.stringify(INITIAL_MODULES_BY_BUSINESS[businessId])
        );
      }
    } else {
      this.businesses = JSON.parse(JSON.stringify(DEFAULT_BUSINESSES));
      this.modulesByBusiness = JSON.parse(JSON.stringify(INITIAL_MODULES_BY_BUSINESS));
    }
    this.saveToFile();
    return businessId ? this.getModulesByBusiness(businessId) : [];
  }

  public exportConfig() {
    return {
      businesses: this.businesses,
      modulesByBusiness: this.modulesByBusiness,
      exportedAt: new Date().toISOString(),
    };
  }

  public exportFullConfig() {
    return this.exportConfig();
  }

  public importFullConfig(data: { businesses: BusinessUnit[]; modulesByBusiness: Record<string, BusinessModuleConfig[]> }) {
    this.importConfig(data);
    return { success: true };
  }

  public importConfig(data: { businesses: BusinessUnit[]; modulesByBusiness: Record<string, BusinessModuleConfig[]> }) {
    if (data.businesses && Array.isArray(data.businesses)) {
      this.businesses = data.businesses;
    }
    if (data.modulesByBusiness && typeof data.modulesByBusiness === "object") {
      this.modulesByBusiness = data.modulesByBusiness;
    }
    this.saveToFile();
  }
}

export const businessModuleStore = new BusinessModuleStore();
