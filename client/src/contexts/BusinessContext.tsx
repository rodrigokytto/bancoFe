import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { trpc } from "../lib/trpc";
import {
  BusinessUnit,
  BusinessModuleConfig,
  DEFAULT_BUSINESSES,
  INITIAL_MODULES_BY_BUSINESS,
} from "@shared/businessModules";
import { toast } from "sonner";

interface BusinessContextType {
  businesses: BusinessUnit[];
  activeBusiness: BusinessUnit;
  activeBusinessId: string;
  setActiveBusinessId: (id: string) => void;
  modules: BusinessModuleConfig[];
  activeModules: BusinessModuleConfig[];
  isLoading: boolean;
  refresh: () => void;
  saveBusiness: (data: Partial<BusinessUnit> & { name: string }) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  saveModule: (data: Partial<BusinessModuleConfig> & { label: string }) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  toggleModule: (moduleId: string, active: boolean) => Promise<void>;
  reorderModules: (moduleIds: string[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const STORAGE_KEY_BIZ = "bancofe_active_business";

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBusinessId, setActiveBusinessIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BIZ);
    if (saved === "operacoes_financeiras_crm" || saved === "bancofe_credito") return "bancofe";
    return saved || "bancofe";
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: businessesData, isLoading: loadingBiz, refetch: refetchBiz } = trpc.admin.getBusinesses.useQuery(
    undefined,
    {
      initialData: DEFAULT_BUSINESSES.map((b) => ({
        ...b,
        modulesCount: INITIAL_MODULES_BY_BUSINESS[b.id]?.length || 0,
        activeModulesCount: INITIAL_MODULES_BY_BUSINESS[b.id]?.filter((m) => m.active).length || 0,
      })),
      staleTime: 1000 * 30,
    }
  );

  const { data: modulesData, isLoading: loadingModules, refetch: refetchModules } = trpc.admin.getModules.useQuery(
    { businessId: activeBusinessId },
    {
      initialData: INITIAL_MODULES_BY_BUSINESS[activeBusinessId] || [],
      enabled: !!activeBusinessId,
      staleTime: 1000 * 15,
    }
  );

  // Mutations
  const saveBusinessMutation = trpc.admin.saveBusiness.useMutation({
    onSuccess: () => {
      utils.admin.getBusinesses.invalidate();
    },
  });

  const deleteBusinessMutation = trpc.admin.deleteBusiness.useMutation({
    onSuccess: () => {
      utils.admin.getBusinesses.invalidate();
    },
  });

  const saveModuleMutation = trpc.admin.saveModule.useMutation({
    onSuccess: () => {
      utils.admin.getModules.invalidate({ businessId: activeBusinessId });
      utils.admin.getBusinesses.invalidate();
    },
  });

  const deleteModuleMutation = trpc.admin.deleteModule.useMutation({
    onSuccess: () => {
      utils.admin.getModules.invalidate({ businessId: activeBusinessId });
      utils.admin.getBusinesses.invalidate();
    },
  });

  const toggleModuleMutation = trpc.admin.toggleModule.useMutation({
    onSuccess: () => {
      utils.admin.getModules.invalidate({ businessId: activeBusinessId });
      utils.admin.getBusinesses.invalidate();
    },
  });

  const reorderModulesMutation = trpc.admin.reorderModules.useMutation({
    onSuccess: () => {
      utils.admin.getModules.invalidate({ businessId: activeBusinessId });
    },
  });

  const resetToDefaultMutation = trpc.admin.resetToDefault.useMutation({
    onSuccess: () => {
      utils.admin.getModules.invalidate({ businessId: activeBusinessId });
      utils.admin.getBusinesses.invalidate();
    },
  });

  const businesses = useMemo(() => {
    return businessesData && businessesData.length > 0 ? (businessesData as BusinessUnit[]) : DEFAULT_BUSINESSES;
  }, [businessesData]);

  const activeBusiness = useMemo(() => {
    return businesses.find((b) => b.id === activeBusinessId) || businesses[0] || DEFAULT_BUSINESSES[0];
  }, [businesses, activeBusinessId]);

  const modules = useMemo(() => {
    if (modulesData && modulesData.length > 0) {
      return [...modulesData].sort((a, b) => a.order - b.order);
    }
    return INITIAL_MODULES_BY_BUSINESS[activeBusinessId] || [];
  }, [modulesData, activeBusinessId]);

  const activeModules = useMemo(() => {
    return modules.filter((m) => m.active);
  }, [modules]);

  const setActiveBusinessId = (id: string) => {
    const resolvedId = id === "operacoes_financeiras_crm" || id === "bancofe_credito" ? "bancofe" : id;
    setActiveBusinessIdState(resolvedId);
    localStorage.setItem(STORAGE_KEY_BIZ, resolvedId);
  };

  const refresh = () => {
    refetchBiz();
    refetchModules();
  };

  const handleSaveBusiness = async (data: Partial<BusinessUnit> & { name: string }) => {
    try {
      await saveBusinessMutation.mutateAsync(data as any);
      toast.success(`Negócio '${data.name}' salvo com sucesso!`);
      refetchBiz();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar negócio");
      throw err;
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    try {
      await deleteBusinessMutation.mutateAsync({ id });
      toast.success("Negócio excluído com sucesso!");
      if (activeBusinessId === id) {
        setActiveBusinessId("bancofe");
      }
      refetchBiz();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir negócio");
      throw err;
    }
  };

  const handleSaveModule = async (data: Partial<BusinessModuleConfig> & { label: string }) => {
    try {
      await saveModuleMutation.mutateAsync({
        businessId: activeBusinessId,
        id: data.id,
        label: data.label,
        description: data.description || "",
        iconName: data.iconName || "Boxes",
        badge: data.badge || "",
        badgeColor: data.badgeColor || "",
        defaultPath: data.defaultPath || "/erp",
        order: data.order,
        active: data.active !== undefined ? data.active : true,
        permission: data.permission || "all",
        domains: data.domains || [],
      });
      toast.success(`Módulo '${data.label}' salvo para ${activeBusiness.name}!`);
      refetchModules();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar módulo");
      throw err;
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModuleMutation.mutateAsync({
        businessId: activeBusinessId,
        moduleId,
      });
      toast.success("Módulo excluído com sucesso!");
      refetchModules();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir módulo");
      throw err;
    }
  };

  const handleToggleModule = async (moduleId: string, active: boolean) => {
    try {
      await toggleModuleMutation.mutateAsync({
        businessId: activeBusinessId,
        moduleId,
        active,
      });
      toast.success(`Módulo ${active ? "ativado" : "desativado"} com sucesso!`);
      refetchModules();
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar status do módulo");
      throw err;
    }
  };

  const handleReorderModules = async (moduleIds: string[]) => {
    try {
      await reorderModulesMutation.mutateAsync({
        businessId: activeBusinessId,
        moduleIds,
      });
      refetchModules();
    } catch (err: any) {
      toast.error("Erro ao reordenar módulos");
    }
  };

  const handleResetToDefault = async () => {
    try {
      await resetToDefaultMutation.mutateAsync({ businessId: activeBusinessId });
      toast.success(`Módulos padrão de '${activeBusiness.name}' restaurados!`);
      refetchModules();
    } catch (err: any) {
      toast.error("Erro ao restaurar módulos padrão");
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        activeBusinessId,
        setActiveBusinessId,
        modules,
        activeModules,
        isLoading: loadingBiz || loadingModules,
        refresh,
        saveBusiness: handleSaveBusiness,
        deleteBusiness: handleDeleteBusiness,
        saveModule: handleSaveModule,
        deleteModule: handleDeleteModule,
        toggleModule: handleToggleModule,
        reorderModules: handleReorderModules,
        resetToDefault: handleResetToDefault,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};
