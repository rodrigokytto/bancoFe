import React from "react";
import { WahaAdminHub } from "../components/integrations/WahaAdminHub";
import { Link } from "wouter";
import { ArrowLeft, MessageSquare, Smartphone } from "lucide-react";

export const AdminWaha: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb e Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/zumi"
            className="w-9 h-9 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] flex items-center justify-center transition cursor-pointer"
            title="Voltar para WhatsApp Zumi"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Administração &amp; Infraestrutura WhatsApp
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
              Servidor WAHA (WhatsApp HTTP API)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/zumi"
            className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface2)] transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chat Zumi</span>
          </Link>

          <Link
            href="/garcom"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>App do Garçom</span>
          </Link>
        </div>
      </div>

      {/* Componente Central de Administração do WAHA */}
      <WahaAdminHub />
    </div>
  );
};
