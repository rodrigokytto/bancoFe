import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { ZumiMascot } from "../components/shell/ZumiMascot";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Server,
  UtensilsCrossed,
  Flame
} from "lucide-react";
import { toast } from "sonner";

export const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("rrodrigogon@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Se já estiver logado, redireciona para o cockpit
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/cockpit");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Por favor, digite seu e-mail.");
      return;
    }

    if (!password) {
      setErrorMessage("Por favor, informe a senha.");
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      toast.success("Acesso autorizado! Bem-vindo de volta, Rodrigo.", {
        description: "Carregando o Cockpit Geral do Zuma Pilot...",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
      setLocation("/cockpit");
    } catch (err: any) {
      setErrorMessage(err.message || "E-mail ou senha incorretos.");
      toast.error("Falha na autenticação", {
        description: "Verifique suas credenciais de acesso.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = async () => {
    const userEmail = "rrodrigogon@gmail.com";
    const userPass = "#080581";
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await login(userEmail, userPass, true);
      toast.success("Acesso autorizado! Bem-vindo de volta, Rodrigo.", {
        description: "Carregando o Zuma Pilot...",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectTarget = searchParams?.get("redirect") || "/garcom";
      setLocation(redirectTarget);
    } catch (err: any) {
      setErrorMessage(err.message || "E-mail ou senha incorretos.");
      toast.error("Falha na autenticação rápida.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ff6b4a] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-400 font-mono tracking-wider">Verificando sessão segura...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#090d13] text-white px-4 py-8 relative overflow-hidden">
      {/* Luzes de fundo sutis (Glow decorativo) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ff6b4a]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header simplificado */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between text-xs text-neutral-400 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-300">Servidores Cloud Run Ativos</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          <Server className="w-3 h-3 text-[#ff6b4a]" />
          <span>southamerica-east1</span>
        </div>
      </header>

      {/* Card Central de Login */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="bg-[#1c2128]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Logo e Mascote Zumi */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <div className="p-3 bg-gradient-to-b from-[#2d333b] to-[#1c2128] rounded-2xl border border-white/10 shadow-lg">
                <ZumiMascot size={56} />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#ff6b4a] text-white text-[9px] font-black tracking-wider uppercase shadow-md">
                Master
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white font-display">
              ZUMA PILOT
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Tangará da Serra (MT) · Ecossistema ERP 360° &amp; IA
            </p>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo E-mail */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rrodrigogon@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b4a] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-300">
                  Senha Master
                </label>
                <span className="text-[11px] text-[#ff6b4a] font-medium">
                  Zuma Key
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0d1117] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b4a] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Opção Lembrar Sessão */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0d1117] border-white/20 text-[#ff6b4a] focus:ring-[#ff6b4a] focus:ring-offset-0"
                />
                <span>Lembrar neste iPhone / Dispositivo</span>
              </label>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ff8566] text-white font-extrabold text-sm shadow-lg shadow-[#ff6b4a]/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Zuma Pilot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

            {/* Atalho Rápido para Rodrigo (1-Tap Fill) */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleQuickFill}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-semibold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-[#ff6b4a] group-hover:rotate-12 transition-transform" />
                  <span>Preencher Acesso Rodrigo (Dono)</span>
                </div>
                <span className="text-[10px] text-neutral-400 bg-white/10 px-2 py-0.5 rounded-full font-mono">
                  1 Toque
                </span>
              </button>
            </div>

            {/* Acesso Direto Operacional para Garçons e Cozinha */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocation("/garcom")}
                className="py-2.5 px-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>App do Garçom</span>
              </button>
              <button
                type="button"
                onClick={() => setLocation("/kds-v2")}
                className="py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>KDS Cozinha</span>
              </button>
            </div>
          </div>

        {/* Rodapé com Selos de Segurança */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Criptografia SHA-256</span>
          </div>
          <span className="text-neutral-600">•</span>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>Otimizado para iOS Safari / PWA</span>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-md mx-auto text-center text-xs text-neutral-500 z-10 pt-4">
        <p className="font-medium text-neutral-400">Zuma Cozinha Oriental &amp; Kytto IA</p>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Tangará da Serra - MT · CNPJ 36.296.848/0001-57
        </p>
      </footer>
    </div>
  );
};
