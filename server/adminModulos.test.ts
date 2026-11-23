import { describe, it, expect } from "vitest";
import { businessModuleStore } from "./businessModuleStore";

describe("Admin de Módulos por Negócio (BancoFe)", () => {
  it("deve carregar a lista de negócios padrão do ecossistema", () => {
    const businesses = businessModuleStore.getBusinesses();
    expect(businesses.length).toBeGreaterThanOrEqual(5);

    const bancoFe = businesses.find((b) => b.id === "bancofe");
    expect(bancoFe).toBeDefined();
    expect(bancoFe?.name).toContain("BancoFe");

    const zumaGastro = businesses.find((b) => b.id === "zuma_gastronomia");
    expect(zumaGastro).toBeDefined();

    const zumaModa = businesses.find((b) => b.id === "zuma_moda");
    expect(zumaModa).toBeDefined();

    const zumaAgro = businesses.find((b) => b.id === "zuma_agro");
    expect(zumaAgro).toBeDefined();

    const holding = businesses.find((b) => b.id === "holding_kytto");
    expect(holding).toBeDefined();
  });

  it("deve retornar os módulos padrão configurados para o BancoFe", () => {
    const modules = businessModuleStore.getModulesByBusiness("bancofe");
    expect(modules.length).toBeGreaterThanOrEqual(5);

    const openFinance = modules.find((m) => m.id === "banco_open_finance");
    expect(openFinance).toBeDefined();
    expect(openFinance?.label).toContain("Open Finance");
    expect(openFinance?.defaultPath).toBe("/conexoes");
    expect(openFinance?.active).toBe(true);

    const pix = modules.find((m) => m.id === "banco_pix_pagamentos");
    expect(pix).toBeDefined();
    expect(pix?.defaultPath).toBe("/pagamentos");
  });

  it("deve permitir adicionar um novo módulo dinamicamente para o negócio", () => {
    const newModule = businessModuleStore.saveModule("bancofe", {
      label: "Módulo Câmbio & Cripto Bacen",
      description: "Operações de câmbio PTAX e custódia regulada",
      iconName: "TrendingUp",
      badge: "CÂMBIO",
      defaultPath: "/mercado",
      permission: "admin",
      domains: ["war_room", "modelagem_preditiva"],
      active: true,
    });

    expect(newModule).toBeDefined();
    expect(newModule.id).toBeDefined();
    expect(newModule.label).toBe("Módulo Câmbio & Cripto Bacen");
    expect(newModule.businessId).toBe("bancofe");

    const updatedList = businessModuleStore.getModulesByBusiness("bancofe");
    const found = updatedList.find((m) => m.id === newModule.id);
    expect(found).toBeDefined();
    expect(found?.badge).toBe("CÂMBIO");
  });

  it("deve permitir modificar um módulo existente", () => {
    const updated = businessModuleStore.saveModule("bancofe", {
      id: "banco_open_finance",
      label: "Open Finance Bacen & APIs V3",
      description: "Conexões seguras Bacen 3.0 atualizadas",
      iconName: "Radio",
      badge: "V3 Bacen",
      defaultPath: "/conexoes",
      permission: "all",
      domains: ["conectividade_apis", "open_apis"],
      active: true,
    });

    expect(updated.label).toBe("Open Finance Bacen & APIs V3");
    expect(updated.badge).toBe("V3 Bacen");

    const modules = businessModuleStore.getModulesByBusiness("bancofe");
    const found = modules.find((m) => m.id === "banco_open_finance");
    expect(found?.label).toBe("Open Finance Bacen & APIs V3");
  });

  it("deve permitir alternar o status ativo/inativo de um módulo", () => {
    const toggled = businessModuleStore.toggleModule("bancofe", "banco_open_finance", false);
    expect(toggled.active).toBe(false);

    let modules = businessModuleStore.getModulesByBusiness("bancofe");
    let found = modules.find((m) => m.id === "banco_open_finance");
    expect(found?.active).toBe(false);

    // Reativar
    const reativado = businessModuleStore.toggleModule("bancofe", "banco_open_finance", true);
    expect(reativado.active).toBe(true);
  });

  it("deve permitir excluir um módulo do negócio", () => {
    // Criar um módulo temporário para exclusão
    const tempMod = businessModuleStore.saveModule("bancofe", {
      label: "Módulo Temporário para Teste",
      description: "Será excluído",
      iconName: "Boxes",
      defaultPath: "/erp",
      active: false,
    });

    const deleted = businessModuleStore.deleteModule("bancofe", tempMod.id);
    expect(deleted).toBe(true);

    const modules = businessModuleStore.getModulesByBusiness("bancofe");
    const exists = modules.some((m) => m.id === tempMod.id);
    expect(exists).toBe(false);
  });

  it("deve permitir cadastrar e gerenciar uma nova unidade de negócio", () => {
    const newBiz = businessModuleStore.saveBusiness({
      name: "BancoFe Imobiliária & Crédito Imobiliário",
      badge: "Imob",
      colorScheme: "indigo",
      cnpj: "45.678.901/0001-23",
      cidade: "Cuiabá - MT",
      unidade: "Filial Imobiliária",
      status: "active",
    });

    expect(newBiz).toBeDefined();
    expect(newBiz.id).toBeDefined();
    expect(newBiz.name).toContain("Imobiliária");

    // Adicionar módulo ao novo negócio
    const imobMod = businessModuleStore.saveModule(newBiz.id, {
      label: "Contratos de Financiamento Habitacional",
      description: "Esteira de crédito e financiamento SBPE",
      iconName: "Building2",
      badge: "Crédito",
      defaultPath: "/erp?tab=billing",
      active: true,
    });

    expect(imobMod.businessId).toBe(newBiz.id);
    const bizModules = businessModuleStore.getModulesByBusiness(newBiz.id);
    expect(bizModules.length).toBe(1);

    // Limpar o negócio de teste
    businessModuleStore.deleteBusiness(newBiz.id);
    const afterDelete = businessModuleStore.getBusinessById(newBiz.id);
    expect(afterDelete).toBeUndefined();
  });

  it("deve permitir restaurar os módulos padrão de um negócio", () => {
    const restored = businessModuleStore.resetToDefault("bancofe");
    expect(restored.length).toBeGreaterThanOrEqual(5);

    const openFinance = restored.find((m) => m.id === "banco_open_finance");
    expect(openFinance).toBeDefined();
    expect(openFinance?.label).toBe("Open Finance & APIs Bacen");
  });
});
