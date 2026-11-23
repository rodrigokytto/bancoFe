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
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export interface SystemNotification {
  id: string;
  category: "ULTRA_AI" | "NOSSA_GENTE" | "ESTOQUE" | "FINANCEIRO";
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
    category: "ULTRA_AI",
    title: "Gesto de Mão Detectado (Mesa #07)",
    description: "CAM-01 identificou cliente solicitando garçom há 42s no Salão Nobre.",
    timeAgo: "há 1 min",
    read: false,
    actionUrl: "/ultra",
    actionLabel: "Ver Câmera",
    severity: "warning"
  },
  {
    id: "notif-02",
    category: "NOSSA_GENTE",
    title: "Entrada Facial Confirmada",
    description: "Hiroshi Tanaka (Sushichef) registrado via CAM-03 com 100% conformidade Anvisa.",
    timeAgo: "há 4 min",
    read: false,
    actionUrl: "/nossa-gente",
    actionLabel: "Espelho Ponto",
    severity: "success"
  },
  {
    id: "notif-03",
    category: "FINANCEIRO",
    title: "Pix Sicredi Recebido R$ 342,00",
    description: "Mesa #14 fechada com taxa de serviço 10% rateada para a equipe.",
    timeAgo: "há 8 min",
    read: false,
    actionUrl: "/financeiro",
    actionLabel: "Ver DRE",
    severity: "success"
  },
  {
    id: "notif-04",
    category: "ESTOQUE",
    title: "Estoque Crítico: Salmão Chileno",
    description: "Saldo atual de 6.4 kg. Sugestão automática de compra de 20 kg emitida.",
    timeAgo: "há 15 min",
    read: true,
    actionUrl: "/previsao-compras",
    actionLabel: "Gerar Cotação",
    severity: "warning"
  }
];

export const HeaderNotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"ALL" | "ULTRA_AI" | "NOSSA_GENTE">("ALL");
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
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-xs text-[var(--ink)]">Alertas & Telemetria em Tempo Real</span>
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
              onClick={() => setFilter("ULTRA_AI")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === "ULTRA_AI" 
                  ? "bg-purple-600 text-white" 
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Camera className="w-3 h-3" />
              Ultra AI
            </button>
            <button
              onClick={() => setFilter("NOSSA_GENTE")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === "NOSSA_GENTE" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Users className="w-3 h-3" />
              Nossa Gente
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
                      {notif.category === "ULTRA_AI" && (
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.category === "NOSSA_GENTE" && (
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.category === "FINANCEIRO" && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.category === "ESTOQUE" && (
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <AlertTriangle className="w-3.5 h-3.5" />
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
              href="/integracoes?tab=nossa_gente_ultra"
              onClick={() => setOpen(false)}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
            >
              <Activity className="w-3 h-3" />
              Event Bus em Tempo Real
            </Link>
            <span className="text-[10px] text-[var(--muted)]">Zuma Pilot v3.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
