import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { businessModuleStore } from "../businessModuleStore";
import { AVAILABLE_ICONS, BADGE_COLOR_PRESETS } from "@shared/businessModules";
import { MENU_DOMAINS } from "../../client/src/navigation.config";

export const adminRouter = router({
  // Lista todos os negócios disponíveis com estatísticas de módulos
  getBusinesses: publicProcedure.query(async () => {
    const list = businessModuleStore.getBusinesses();
    return list.map((b) => {
      const modules = businessModuleStore.getModulesByBusiness(b.id);
      return {
        ...b,
        modulesCount: modules.length,
        activeModulesCount: modules.filter((m) => m.active).length,
      };
    });
  }),

  // Retorna detalhes de um negócio
  getBusiness: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const business = businessModuleStore.getBusinessById(input.id);
      if (!business) {
        throw new Error(`Negócio ${input.id} não encontrado.`);
      }
      return business;
    }),

  // Cria ou atualiza um negócio
  saveBusiness: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(2, "Nome é obrigatório"),
        slug: z.string().optional(),
        description: z.string().optional(),
        iconName: z.string().default("Building2"),
        badge: z.string().default("Negócio"),
        colorScheme: z.enum(["blue", "emerald", "purple", "amber", "cyan", "slate", "indigo", "rose"]).default("blue"),
        cnpj: z.string().optional(),
        cidade: z.string().optional(),
        unidade: z.string().optional(),
        status: z.enum(["active", "inactive"]).default("active"),
      })
    )
    .mutation(async ({ input }) => {
      const saved = businessModuleStore.saveBusiness(input as any);
      return { success: true, business: saved };
    }),

  // Exclui um negócio
  deleteBusiness: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const deleted = businessModuleStore.deleteBusiness(input.id);
      return { success: deleted };
    }),

  // Retorna todos os módulos de um negócio selecionado
  getModules: publicProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ input }) => {
      return businessModuleStore.getModulesByBusiness(input.businessId);
    }),

  // Adicionar ou Modificar Módulo
  saveModule: publicProcedure
    .input(
      z.object({
        businessId: z.string(),
        id: z.string().optional(),
        label: z.string().min(2, "Nome do módulo é obrigatório"),
        description: z.string().default(""),
        iconName: z.string().default("Boxes"),
        badge: z.string().optional(),
        badgeColor: z.string().optional(),
        defaultPath: z.string().default("/erp"),
        order: z.number().optional(),
        active: z.boolean().default(true),
        permission: z.enum(["admin", "user", "all"]).default("all"),
        domains: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const { businessId, ...moduleData } = input;
      const saved = businessModuleStore.saveModule(businessId, moduleData);
      return { success: true, module: saved };
    }),

  // Excluir Módulo
  deleteModule: publicProcedure
    .input(
      z.object({
        businessId: z.string(),
        moduleId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const deleted = businessModuleStore.deleteModule(input.businessId, input.moduleId);
      return { success: deleted };
    }),

  // Alternar ativação do módulo (Toggle Ativo/Inativo)
  toggleModule: publicProcedure
    .input(
      z.object({
        businessId: z.string(),
        moduleId: z.string(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const updated = businessModuleStore.toggleModule(input.businessId, input.moduleId, input.active);
      return { success: true, module: updated };
    }),

  // Reordenar módulos
  reorderModules: publicProcedure
    .input(
      z.object({
        businessId: z.string(),
        moduleIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const updatedList = businessModuleStore.reorderModules(input.businessId, input.moduleIds);
      return { success: true, modules: updatedList };
    }),

  // Restaurar módulos padrão do negócio
  resetToDefault: publicProcedure
    .input(z.object({ businessId: z.string() }))
    .mutation(async ({ input }) => {
      const resetList = businessModuleStore.resetToDefault(input.businessId);
      return { success: true, modules: resetList };
    }),

  // Exportar configuração completa em JSON
  exportConfig: publicProcedure.query(async () => {
    return businessModuleStore.exportFullConfig();
  }),

  // Importar configuração JSON
  importConfig: publicProcedure
    .input(
      z.object({
        businesses: z.array(z.any()),
        modulesByBusiness: z.record(z.array(z.any())),
      })
    )
    .mutation(async ({ input }) => {
      const result = businessModuleStore.importFullConfig(input);
      return result;
    }),

  // Metadados auxiliares para formulários
  getFormMetadata: publicProcedure.query(async () => {
    const domains = MENU_DOMAINS.map((d) => ({
      id: d.id,
      label: d.label,
      sectionsCount: d.sections.length,
    }));

    return {
      availableIcons: AVAILABLE_ICONS,
      badgeColorPresets: BADGE_COLOR_PRESETS,
      availableDomains: domains,
    };
  }),
});
