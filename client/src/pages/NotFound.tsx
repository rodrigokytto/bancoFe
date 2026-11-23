import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Store, FileText, Search, Home, Building2, Briefcase } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#071510] p-4 text-slate-100">
      <Card className="w-full max-w-xl shadow-2xl border border-emerald-800/60 bg-[#0c241a]/90 backdrop-blur-md rounded-2xl">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl shadow-lg border border-emerald-400/40">
              <Landmark className="w-8 h-8" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs font-bold uppercase tracking-wider mb-2">
              BancoFé • Holding Multi-Negócio
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Módulo ou Rota Não Encontrada
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
              O endereço acessado não corresponde a uma rota ativa. Selecione um dos módulos corporativos oficiais abaixo:
            </p>
          </div>

          {/* Grid de Atalhos Oficiais com Tema Verde BancoFé */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <button
              onClick={() => setLocation("/admin/ecommerce")}
              className="p-3.5 rounded-xl bg-[#0b1d16] hover:bg-emerald-950/80 border border-emerald-800/40 hover:border-emerald-500/60 transition group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition block">
                  Admin E-Commerce
                </span>
                <span className="text-[10px] text-slate-400">
                  Lojas virtuais, catálogo & split D+0
                </span>
              </div>
            </button>

            <button
              onClick={() => setLocation("/admin/operacoes-financeiras")}
              className="p-3.5 rounded-xl bg-[#0b1d16] hover:bg-emerald-950/80 border border-emerald-800/40 hover:border-emerald-500/60 transition group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition block">
                  Operações & Termos
                </span>
                <span className="text-[10px] text-slate-400">
                  Crédito, CCB, SCR e simulador SAC
                </span>
              </div>
            </button>

            <button
              onClick={() => setLocation("/consulta-360")}
              className="p-3.5 rounded-xl bg-[#0b1d16] hover:bg-emerald-950/80 border border-emerald-800/40 hover:border-emerald-500/60 transition group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition block">
                  Consulta 360° CPF/CNPJ
                </span>
                <span className="text-[10px] text-slate-400">
                  11 abas, grafo, QSA e dossiê pericial
                </span>
              </div>
            </button>

            <button
              onClick={() => setLocation("/admin")}
              className="p-3.5 rounded-xl bg-[#0b1d16] hover:bg-emerald-950/80 border border-emerald-800/40 hover:border-emerald-500/60 transition group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition block">
                  Gestão de Módulos
                </span>
                <span className="text-[10px] text-slate-400">
                  Cockpit administrativo da holding
                </span>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setLocation("/")}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Retornar ao Cockpit Geral
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
