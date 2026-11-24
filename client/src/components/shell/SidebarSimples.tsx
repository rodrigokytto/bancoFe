import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import * as Icons from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  Crown,
  Landmark,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Pin,
  PinOff,
  Search,
  Sun,
  X,
  Building2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBusiness } from "../../contexts/BusinessContext";
import { DynamicIcon } from "../DynamicIcon";
import { MENU_DOMAINS, SECTIONS, type NavItem } from "../../navigation.config";

/**
 * Menu lateral simplificado (estrutura societária):
 *
 *   Holding BancoFe ............ consolida todas as empresas
 *     └ BancoFe Operações Financeiras
 *   Empresas do grupo .......... cada uma selecionável e analisada de forma independente
 *   ERP da empresa selecionada . módulos e telas próprios da empresa ativa
 */

const HOLDING_ID = "holding_kytto";
const BANCOFE_ID = "bancofe";
const STORAGE_KEY_EMPRESAS_ABERTAS = "bancofe_sidebar_empresas_abertas";

interface SidebarSimplesProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

interface ModuloMenu {
  id: string;
  label: string;
  badge?: string;
  iconName: string;
  defaultPath: string;
  telas: NavItem[];
}

const nomeCurto = (nome: string) => nome.split("—")[0].split(" S.A.")[0].trim();

/** Telas compartilhadas que já filtram os dados pela empresa ativa: ao trocar de empresa, permanece nelas. */
const ROTAS_COM_ESCOPO = ["/admin/mesa-operacoes", "/admin/crm-financeira", "/admin/mesa-credito", "/admin/cadastro-360"];

const caminhoBase = (p: string) => (p || "").split("?")[0].replace(/\/+$/, "") || "/";

export const SidebarSimples: React.FC<SidebarSimplesProps> = ({ isPinned = true, onTogglePin }) => {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { activeBusiness, businesses, setActiveBusinessId, activeModules } = useBusiness();

  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [empresasAbertas, setEmpresasAbertas] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_EMPRESAS_ABERTAS) !== "0";
    } catch {
      return true;
    }
  });
  const [moduloAberto, setModuloAberto] = useState<Record<string, boolean>>({});

  const isExpanded = isPinned || isHovered || mobileOpen;
  const ativoId = activeBusiness?.id || HOLDING_ID;
  const holding = businesses.find((b) => b.id === HOLDING_ID);
  const bancofe = businesses.find((b) => b.id === BANCOFE_ID);
  const empresas = useMemo(
    () =>
      businesses
        .filter((b) => b.id !== HOLDING_ID && b.id !== BANCOFE_ID && b.status !== "inactive")
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [businesses],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMPRESAS_ABERTAS, empresasAbertas ? "1" : "0");
    } catch {}
  }, [empresasAbertas]);

  // ERP da empresa ativa: cada módulo traz suas telas (domínios -> seções -> itens)
  const modulos: ModuloMenu[] = useMemo(() => {
    const userRole = user?.role || "admin";
    return (activeModules || [])
      .filter((m) => m.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((m) => {
        const vistos = new Set<string>();
        const telas: NavItem[] = [];
        (m.domains || []).forEach((domId) => {
          const dom = MENU_DOMAINS.find((d) => d.id === domId);
          if (!dom) return;
          dom.sections.forEach((secId) => {
            const sec = SECTIONS[secId];
            if (!sec) return;
            sec.items.forEach((it) => {
              if (it.permission && it.permission !== "all" && it.permission !== userRole) return;
              if (vistos.has(it.path)) return;
              vistos.add(it.path);
              telas.push(it);
            });
          });
        });
        return {
          id: m.id,
          label: m.label,
          badge: m.badge,
          iconName: m.iconName,
          defaultPath: m.defaultPath,
          telas,
        };
      });
  }, [activeModules, user?.role]);

  const q = busca.trim().toLowerCase();
  const modulosFiltrados = useMemo(() => {
    if (!q) return modulos;
    return modulos
      .map((m) => ({
        ...m,
        telas: m.telas.filter((t) => t.label.toLowerCase().includes(q) || t.path.toLowerCase().includes(q)),
      }))
      .filter((m) => m.telas.length > 0 || m.label.toLowerCase().includes(q));
  }, [modulos, q]);

  const rotaAtual = caminhoBase(location);
  const telaAtiva = (path: string) => {
    const base = caminhoBase(path);
    return rotaAtual === base || (base !== "/" && rotaAtual.startsWith(base + "/"));
  };

  // Abre automaticamente o módulo que contém a tela atual
  useEffect(() => {
    const atual = modulos.find((m) => m.telas.some((t) => telaAtiva(t.path)) || telaAtiva(m.defaultPath));
    if (atual) setModuloAberto((prev) => (prev[atual.id] === undefined ? { ...prev, [atual.id]: true } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulos, rotaAtual]);

  const selecionarEmpresa = (id: string) => {
    if (id === ativoId) {
      setMobileOpen(false);
      return;
    }
    const alvo = businesses.find((b) => b.id === id);
    if (!alvo) return;
    setActiveBusinessId(alvo.id);
    setModuloAberto({});
    setEmpresasAbertas(alvo.id === HOLDING_ID);
    setBusca("");
    setMobileOpen(false);
    toast.success(
      alvo.id === HOLDING_ID
        ? "Holding BancoFe: visão consolidada de todas as empresas."
        : `${nomeCurto(alvo.name)}: ERP e dados exibidos de forma independente.`,
    );
  };

  // Ao trocar de empresa, se a tela atual não pertencer ao ERP da nova empresa, abre o primeiro módulo dela
  const [empresaAnterior, setEmpresaAnterior] = useState(ativoId);
  useEffect(() => {
    if (empresaAnterior === ativoId) return;
    setEmpresaAnterior(ativoId);
    if (!modulos.length) return;
    if (ROTAS_COM_ESCOPO.some((r) => caminhoBase(location).startsWith(r))) return;
    const pertence = modulos.some((m) => telaAtiva(m.defaultPath) || m.telas.some((t) => telaAtiva(t.path)));
    if (!pertence && modulos[0]?.defaultPath) setLocation(modulos[0].defaultPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativoId, modulos]);

  const IconeModulo: React.FC<{ nome: string; className?: string }> = ({ nome, className }) => {
    const C = (Icons as Record<string, any>)[nome] || Icons.Boxes;
    return <C className={className} />;
  };

  /* ------------------------------ blocos de UI ------------------------------ */

  const ItemEmpresa: React.FC<{
    id: string;
    nome: string;
    detalhe: string;
    icone: React.ReactNode;
    nivel?: 0 | 1;
    destaque?: "holding" | "banco";
  }> = ({ id, nome, detalhe, icone, nivel = 0, destaque }) => {
    const ativo = id === ativoId;
    return (
      <button
        type="button"
        data-testid={`empresa-${id}`}
        onClick={() => selecionarEmpresa(id)}
        title={nome}
        className={`w-full flex items-center gap-2.5 rounded-xl text-left transition-colors cursor-pointer ${
          nivel === 1 ? "px-2 py-1.5" : "px-2 py-2"
        } ${
          ativo
            ? "bg-[#0c4a34] text-white shadow-xs"
            : "text-[var(--ink)] hover:bg-[var(--surface2)]"
        }`}
      >
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            ativo
              ? "bg-white/15"
              : destaque === "holding"
              ? "bg-amber-500/15 text-amber-600"
              : destaque === "banco"
              ? "bg-emerald-600/15 text-[#0c4a34] dark:text-emerald-400"
              : "bg-[var(--surface2)] text-[var(--muted)]"
          }`}
        >
          {icone}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[12.5px] leading-tight truncate ${ativo || destaque ? "font-bold" : "font-medium"}`}>{nome}</span>
          <span className={`block text-[10px] leading-tight truncate ${ativo ? "text-white/75" : "text-[var(--muted)]"}`}>{detalhe}</span>
        </span>
        {ativo && <Check className="w-4 h-4 shrink-0" />}
      </button>
    );
  };

  const Trilho = () => (
    <div className="flex flex-col items-center gap-1.5 py-3 overflow-y-auto no-scrollbar flex-1">
      <button
        type="button"
        onClick={() => selecionarEmpresa(HOLDING_ID)}
        title="Holding BancoFe — Consolidado"
        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer ${ativoId === HOLDING_ID ? "bg-[#0c4a34] text-white" : "text-amber-600 hover:bg-amber-500/10"}`}
      >
        <Crown className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => selecionarEmpresa(BANCOFE_ID)}
        title="BancoFe Operações Financeiras"
        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer ${ativoId === BANCOFE_ID ? "bg-[#0c4a34] text-white" : "text-[#0c4a34] dark:text-emerald-400 hover:bg-emerald-600/10"}`}
      >
        <Landmark className="w-5 h-5" />
      </button>
      {ativoId !== HOLDING_ID && ativoId !== BANCOFE_ID && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0c4a34] text-white" title={activeBusiness?.name}>
          <DynamicIcon name={activeBusiness?.iconName || "Building2"} className="w-5 h-5" />
        </div>
      )}
      <div className="w-8 border-t border-[var(--line)] my-1.5" />
      {modulos.map((m) => (
        <Link
          key={m.id}
          href={m.defaultPath}
          title={m.label}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            telaAtiva(m.defaultPath) || m.telas.some((t) => telaAtiva(t.path))
              ? "bg-emerald-600/15 text-[#0c4a34] dark:text-emerald-400"
              : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
          }`}
        >
          <IconeModulo nome={m.iconName} className="w-5 h-5" />
        </Link>
      ))}
    </div>
  );

  const totalTelas = modulos.reduce((s, m) => s + m.telas.length, 0);
  const nomeAtivo =
    ativoId === HOLDING_ID ? "Holding BancoFe" : ativoId === BANCOFE_ID ? "BancoFe Operações Financeiras" : nomeCurto(activeBusiness?.name || "");

  return (
    <>
      {/* Barra superior mobile */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 px-4 flex items-center justify-between bg-[var(--surface)] border-b border-[var(--line)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0c4a34] text-white flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-sm font-black leading-none">BancoFe</span>
            <span className="block text-[10px] text-[var(--muted)] truncate">{nomeAtivo}</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] cursor-pointer"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        data-testid="sidebar-simples"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 z-50 h-screen bg-[var(--surface)] text-[var(--ink)] border-r border-[var(--line)] flex flex-col select-none transition-all duration-300 ${
          mobileOpen
            ? "translate-x-0 w-[280px] shadow-2xl"
            : isExpanded
            ? "translate-x-0 w-[280px] shadow-2xl lg:shadow-none"
            : "-translate-x-full lg:translate-x-0 lg:w-[68px]"
        }`}
      >
        {/* Cabeçalho */}
        <div className={`flex items-center border-b border-[var(--line)] h-16 shrink-0 ${isExpanded ? "px-4 justify-between" : "justify-center"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0c4a34] text-white flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <span className="block text-[15px] font-black leading-none">
                  banco<span className="text-emerald-600">Fe</span>
                </span>
                <span className="block text-[10px] text-[var(--muted)] font-semibold mt-0.5">Grupo BancoFe · Kytto</span>
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface2)] cursor-pointer"
                title="Alternar tema"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {onTogglePin && (
                <button
                  type="button"
                  onClick={onTogglePin}
                  className="hidden lg:block p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface2)] cursor-pointer"
                  title={isPinned ? "Recolher menu" : "Fixar menu aberto"}
                >
                  {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}
        </div>

        {!isExpanded ? (
          <Trilho />
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {/* 1. GRUPO: Holding + BancoFe */}
            <section>
              <p className="px-2 mb-1.5 text-[10px] font-black tracking-wider text-[var(--muted)] uppercase">Grupo</p>
              <div className="space-y-0.5">
                <ItemEmpresa
                  id={HOLDING_ID}
                  nome="Holding BancoFe"
                  detalhe="Consolida todas as empresas"
                  destaque="holding"
                  icone={<Crown className="w-4 h-4" />}
                />
                <div className="ml-4 pl-2 border-l-2 border-emerald-600/25">
                <ItemEmpresa
                  id={BANCOFE_ID}
                  nome="BancoFe Operações Financeiras"
                  detalhe={bancofe?.badge ? `Banco & crédito · ${bancofe.badge}` : "Banco, crédito e mesa de operações"}
                  destaque="banco"
                  nivel={1}
                  icone={<Landmark className="w-4 h-4" />}
                />
                </div>
              </div>
            </section>

            {/* 2. EMPRESAS DO GRUPO */}
            <section>
              <button
                type="button"
                onClick={() => setEmpresasAbertas((v) => !v)}
                className="w-full flex items-center justify-between px-2 mb-1.5 cursor-pointer"
              >
                <span className="text-[10px] font-black tracking-wider text-[var(--muted)] uppercase">
                  Empresas do grupo ({empresas.length})
                </span>
                {empresasAbertas ? <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" /> : <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />}
              </button>
              {empresasAbertas ? (
                <div className="space-y-0.5 ml-4 pl-2 border-l-2 border-[var(--line)]">
                  {empresas.map((b) => (
                    <ItemEmpresa
                      key={b.id}
                      id={b.id}
                      nome={nomeCurto(b.name)}
                      detalhe={[b.badge, b.cidade].filter(Boolean).join(" · ") || "Empresa independente"}
                      nivel={1}
                      icone={<DynamicIcon name={b.iconName || "Building2"} className="w-4 h-4" />}
                    />
                  ))}
                </div>
              ) : (
                ativoId !== HOLDING_ID &&
                ativoId !== BANCOFE_ID && (
                  <div className="ml-4 pl-2 border-l-2 border-[var(--line)]">
                  <ItemEmpresa
                    id={ativoId}
                    nome={nomeCurto(activeBusiness?.name || "")}
                    detalhe={activeBusiness?.badge || "Empresa independente"}
                    nivel={1}
                    icone={<DynamicIcon name={activeBusiness?.iconName || "Building2"} className="w-4 h-4" />}
                  />
                  <button type="button" onClick={() => setEmpresasAbertas(true)} className="mt-1 px-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                    Trocar empresa ({empresas.length})
                  </button>
                  </div>
                )
              )}
            </section>

            {/* 3. ERP DA EMPRESA SELECIONADA */}
            <section className="pt-3 border-t border-[var(--line)]">
              <div className="px-2 mb-2">
                <p className="text-[10px] font-black tracking-wider text-[var(--muted)] uppercase">ERP da empresa</p>
                <p className="text-[13px] font-bold leading-tight truncate flex items-center gap-1.5 mt-0.5" title={activeBusiness?.name}>
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {nomeAtivo}
                </p>
                <p className="text-[10px] text-[var(--muted)]">
                  {modulos.length} módulos · {totalTelas} telas{ativoId === HOLDING_ID ? " · visão consolidada" : " · dados independentes"}
                </p>
              </div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar tela neste ERP…"
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg bg-[var(--surface2)] border border-[var(--line)] focus:outline-hidden focus:border-emerald-600"
                />
              </div>
              <div className="space-y-0.5">
                {modulosFiltrados.length === 0 && (
                  <p className="px-2 py-3 text-xs text-[var(--muted)]">Nenhum módulo ativo para esta empresa.</p>
                )}
                {modulosFiltrados.map((m) => {
                  const aberto = q ? true : !!moduloAberto[m.id];
                  const ativoMod = telaAtiva(m.defaultPath) || m.telas.some((t) => telaAtiva(t.path));
                  return (
                    <div key={m.id}>
                      <div
                        className={`flex items-center rounded-lg ${ativoMod ? "bg-emerald-600/10" : "hover:bg-[var(--surface2)]"}`}
                      >
                        <Link
                          href={m.defaultPath}
                          onClick={() => {
                            setModuloAberto((p) => ({ ...p, [m.id]: true }));
                            setMobileOpen(false);
                          }}
                          className="flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5"
                          title={m.label}
                        >
                          <IconeModulo
                            nome={m.iconName}
                            className={`w-4 h-4 shrink-0 ${ativoMod ? "text-[#0c4a34] dark:text-emerald-400" : "text-[var(--muted)]"}`}
                          />
                          <span className={`text-[12.5px] truncate ${ativoMod ? "font-bold text-[#0c4a34] dark:text-emerald-400" : "font-semibold"}`}>
                            {m.label}
                          </span>
                        </Link>
                        {m.telas.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setModuloAberto((p) => ({ ...p, [m.id]: !aberto }))}
                            className="px-2 py-1.5 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer flex items-center gap-1"
                            title={aberto ? "Recolher" : "Ver telas"}
                          >
                            <span className="text-[10px] font-mono">{m.telas.length}</span>
                            {aberto ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                      {aberto && m.telas.length > 0 && (
                        <div className="ml-4 pl-2 border-l border-[var(--line)] my-0.5 space-y-px">
                          {m.telas.map((t) => {
                            const at = telaAtiva(t.path);
                            return (
                              <Link
                                key={t.id + t.path}
                                href={t.path}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md text-[12px] ${
                                  at
                                    ? "bg-[#0c4a34] text-white font-semibold"
                                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                                }`}
                              >
                                <span className="truncate">{t.label}</span>
                                {t.badge && (
                                  <span className={`text-[9px] px-1.5 rounded ${at ? "bg-white/20" : "bg-[var(--surface2)] border border-[var(--line)]"}`}>
                                    {t.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Rodapé: usuário */}
        <div className={`shrink-0 border-t border-[var(--line)] p-3 flex items-center ${isExpanded ? "justify-between gap-2" : "justify-center"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              {(user?.name || "Rodrigo Gonçalves")
                .split(" ")
                .filter(Boolean)
                .map((p: string, i: number, a: string[]) => (i === 0 || i === a.length - 1 ? p[0] : ""))
                .join("")
                .toUpperCase()}
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">{user?.name || "Rodrigo Ribeiro Gonçalves"}</p>
                <p className="text-[10px] text-[var(--muted)] truncate leading-tight">{(user as any)?.cargo || "CEO & Diretoria Executiva"}</p>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Deseja desconectar do BancoFe?")) await logout();
              }}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SidebarSimples;
