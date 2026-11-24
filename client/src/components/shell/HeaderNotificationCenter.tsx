import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Activity,
  CheckCircle2, 
  AlertTriangle,
  Camera, 
  Users, 
  DollarSign, 
  Flame, 
  X, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Scale,
  Home,
  Landmark,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export interface SystemNotification {
  id: string;
  category: "CREDITO" | "SCR_BACEN" | "CASA_NOVA" | "BAAS_PIX";
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  severity: "info" | "warning" | "success";
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-01",
    category: "CASA_NOVA",
    title: "Nova Proposta Casa Nova (R$ 680.000)",
    description: "Proponente Marcos Aurelio Silva: LTV de 58%, DTI 24% e certidões 100% conformes.",
    timeAgo: "há 2 min",
    read: false,
    actionUrl: "/admin/crm-financeira?aba=funil",
    actionLabel: "Analisar no Funil",
    severity: "success"
  },
  {
    id: "notif-02",
    category: "SCR_BACEN",
    title: "Consulta 360° Concluída sem Restrições",
    description: "Varredura Bacen SCR + Receita Federal + TJ-MT aprovada com Score 840 (Nível AA).",
    timeAgo: "há 5 min",
    read: false,
    actionUrl: "/consulta-360",
    actionLabel: "Ver Consulta 360°",
    severity: "success"
  },
  {
    id: "notif-03",
    category: "CREDITO",
    title: "Parecer da Mesa de Crédito Emitido",
    description: "Operação OP-2026-089 (R$ 1.250.000,00) pré-aprovada pelo comitê executivo de risco.",
    timeAgo: "há 9 min",
    read: false,
    actionUrl: "/admin/mesa-credito",
    actionLabel: "Ver Parecer da Mesa",
    severity: "info"
  },
  {
    id: "notif-04",
    category: "BAAS_PIX",
    title: "Liquidação Pix DICT R$ 348.500,00",
    description: "Repasse de funding da carteira estruturada liquidado no SPB Bacen com sucesso.",
    timeAgo: "há 18 min",
    read: true,
    actionUrl: "/plataforma/carteira",
    actionLabel: "Ver Carteira Digital",
    severity: "info"
  }
];

export const HeaderNotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"ALL" | "CREDITO" | "CASA_NOVA">("ALL");
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas as notificações foram marcadas como lidas.");
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === "ALL") return true;
    return n.category === filter;
  });

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--salmon)] transition-all cursor-pointer shadow-2xs"
        title="Central de Alertas Operacionais"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-[var(--surface)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Cabeçalho do Dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-[var(--surface2)]/60">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-xs text-[var(--ink)]">Alertas da Mesa de Crédito &amp; Bacen</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[var(--salmon)] hover:underline cursor-pointer"
              >
                Marcar lidas
              </button>
            )}
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--line)] bg-[var(--surface)] text-[11px]">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "ALL" 
                  ? "bg-[var(--salmon)] text-white" 
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Todos ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("CREDITO")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === "CREDITO" 
                  ? "bg-emerald-700 text-white" 
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Scale className="w-3 h-3" />
              Mesa Crédito
            </button>
            <button
              onClick={() => setFilter("CASA_NOVA")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === "CASA_NOVA" 
                  ? "bg-amber-600 text-white" 
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Home className="w-3 h-3" />
              Casa Nova
            </button>
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted)]">
                Nenhum alerta nesta categoria.
              </div>
            ) : (
              filtered.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 hover:bg-[var(--surface2)]/60 transition-colors cursor-pointer ${
                    !notif.read ? "bg-purple-500/5 dark:bg-purple-500/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {notif.category === "CREDITO" && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.category === "SCR_BACEN" && (
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.category === "CASA_NOVA" && (
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <Home className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.category === "BAAS_PIX" && (
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Landmark className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[var(--ink)] truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] shrink-0">
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-1.5">
                        {notif.description}
                      </p>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[var(--salmon)] hover:underline"
                        >
                          <span>{notif.actionLabel || "Acessar"}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé do Dropdown */}
          <div className="p-2.5 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-between text-[11px]">
            <Link
              href="/admin/mesa-credito"
              onClick={() => setOpen(false)}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <Activity className="w-3 h-3" />
              Mesa &amp; SCR Bacen Ao Vivo
            </Link>
            <span className="text-[10px] text-[var(--muted)]">BancoFé Holding v4.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
