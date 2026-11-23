import React, { useState, useEffect } from "react";
import {
  Download,
  Monitor,
  Apple,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  WifiOff,
  Cloud,
  RefreshCw,
  X,
  ExternalLink,
  Laptop,
  Check,
  ShieldCheck,
  Zap,
  Terminal,
  HelpCircle
} from "lucide-react";
import { useOfflineSync } from "../../lib/offlineSyncEngine";
import { toast } from "sonner";

interface ModalInstalarPdvProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalInstalarPdv: React.FC<ModalInstalarPdvProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"windows" | "apple_mac" | "apple_ios" | "offline">("windows");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [detectedOs, setDetectedOs] = useState<string>("windows");

  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    deviceId
  } = useOfflineSync();

  // Detecta o sistema operacional do usuário automaticamente
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) {
      setDetectedOs("apple_ios");
      setActiveTab("apple_ios");
    } else if (/Macintosh|Mac OS X/.test(ua)) {
      setDetectedOs("apple_mac");
      setActiveTab("apple_mac");
    } else if (/Windows/.test(ua)) {
      setDetectedOs("windows");
      setActiveTab("windows");
    } else {
      setDetectedOs("windows");
    }

    // Captura evento beforeinstallprompt se disponível
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Verifica se já está em modo standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!isOpen) return null;

  // Dispara instalação nativa se disponível
  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        toast.success("Zuma Pilot instalado com sucesso!", {
          description: "O aplicativo agora está disponível na sua Área de Trabalho / Menu Iniciar.",
        });
      }
      setDeferredPrompt(null);
    } else {
      toast.info("Instalação via Navegador", {
        description: "Utilize o botão de instalação na barra de navegação do seu navegador (ícone de computador/download ao lado da URL).",
      });
    }
  };

  // Gera download de atalho para Área de Trabalho do Windows (.url)
  const handleDownloadWindowsShortcut = () => {
    const urlContent = `[InternetShortcut]\nURL=https://zuma.kytto.com.br/pdv\nIconIndex=0\nIconFile=https://zuma.kytto.com.br/icons/icon-512.png\n`;
    const blob = new Blob([urlContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Zuma_Pilot_PDV.url";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Atalho do Windows baixado!", {
      description: "Mova o arquivo 'Zuma_Pilot_PDV.url' para a sua Área de Trabalho.",
    });
  };

  // Gera download de script .bat para inicialização rápida no Windows
  const handleDownloadWindowsBatch = () => {
    const batContent = `@echo off\ntitle Zuma Pilot PDV - Caixa e Salao\necho Iniciando Zuma Pilot PDV em modo aplicativo...\nstart msedge --app=https://zuma.kytto.com.br/pdv --window-size=1600,1000 || start chrome --app=https://zuma.kytto.com.br/pdv --window-size=1600,1000\nexit\n`;
    const blob = new Blob([batContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Iniciar_Zuma_PDV_Windows.bat";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Script do Windows baixado!", {
      description: "Arquivo 'Iniciar_Zuma_PDV_Windows.bat' baixado. Dê 2 cliques para abrir o PDV como aplicativo nativo.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--surface)] border border-[var(--line)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--salmon)] flex items-center justify-center shadow-lg">
              <Download className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">Instalar Zuma Pilot PDV</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PWA Standalone & Offline
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Execute localmente em computadores Windows, Mac, iPads e celulares com sincronização em nuvem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Plataforma */}
        <div className="flex border-b border-[var(--line)] bg-[var(--surface2)] px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("windows")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === "windows"
                ? "bg-[var(--surface)] border-[var(--line)] text-indigo-700 border-b-transparent shadow-xs"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-600" />
            <span>Windows (PC & Caixa)</span>
            {detectedOs === "windows" && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Dispositivo atual" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("apple_mac")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === "apple_mac"
                ? "bg-[var(--surface)] border-[var(--line)] text-indigo-700 border-b-transparent shadow-xs"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Laptop className="w-4 h-4 text-neutral-700" />
            <span>Apple Mac (macOS)</span>
            {detectedOs === "apple_mac" && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Dispositivo atual" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("apple_ios")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === "apple_ios"
                ? "bg-[var(--surface)] border-[var(--line)] text-indigo-700 border-b-transparent shadow-xs"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>Apple iPad & iPhone</span>
            {detectedOs === "apple_ios" && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Dispositivo atual" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("offline")}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl font-bold text-xs transition-all cursor-pointer border-t border-x ml-auto ${
              activeTab === "offline"
                ? "bg-[var(--surface)] border-[var(--line)] text-emerald-700 border-b-transparent shadow-xs"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>Motor Offline & Nuvem</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ABA WINDOWS */}
          {activeTab === "windows" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-3">
                <Monitor className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm">Instalação Nativa no Windows 10 & 11</h3>
                  <p className="text-xs text-blue-800">
                    O Zuma Pilot funciona como um aplicativo de desktop completo no Windows, sem bordas de navegador,
                    com suporte a atalhos de teclado, leitor laser de código de barras e impressoras térmicas de 80mm.
                  </p>
                </div>
              </div>

              {/* Botão de Instalação 1-Clique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[var(--ink)]">Método 1: Instalação Automática PWA</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Recomendado</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Instala o Zuma Pilot diretamente pelo Microsoft Edge ou Google Chrome com 1 clique.
                  </p>
                  <button
                    onClick={handleTriggerNativeInstall}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicativo no Windows</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[var(--ink)]">Método 2: Atalho Direto na Área de Trabalho</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-bold text-[10px]">Desktop .url</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Baixe o arquivo de atalho oficial e coloque-o na Área de Trabalho do computador do caixa.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadWindowsShortcut}
                      className="flex-1 py-2.5 bg-[var(--surface)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Baixar Atalho .url</span>
                    </button>
                    <button
                      onClick={handleDownloadWindowsBatch}
                      className="py-2.5 px-3 bg-[var(--surface)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Script .bat para inicialização automática em tela cheia"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Script .bat</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Passo a Passo no Navegador */}
              <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
                <h4 className="font-extrabold text-xs text-[var(--ink)] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Como instalar manualmente via Microsoft Edge ou Google Chrome:</span>
                </h4>
                <ol className="text-xs text-[var(--muted)] space-y-1.5 list-decimal pl-5">
                  <li>No topo do navegador, olhe para a barra de endereços (onde fica a URL <strong>https://zuma.kytto.com.br/pdv</strong>).</li>
                  <li>Clique no ícone de <strong>Instalar Aplicativo</strong> (ou clique nos <strong>3 pontinhos</strong> do navegador &gt; <em>Aplicativos</em> &gt; <em>Instalar este site como aplicativo</em>).</li>
                  <li>Marque as opções: <strong>"Criar atalho na Área de Trabalho"</strong> e <strong>"Fixar na barra de tarefas"</strong>.</li>
                  <li>Pronto! O Zuma Pilot abrirá em uma janela própria ultrarrápida e limpa, idêntica a um software Windows instalado.</li>
                </ol>
              </div>
            </div>
          )}

          {/* ABA APPLE MAC */}
          {activeTab === "apple_mac" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-900 flex items-start gap-3">
                <Laptop className="w-6 h-6 text-neutral-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm">Instalação no Apple Mac (macOS Sonoma / Ventura)</h3>
                  <p className="text-xs text-neutral-700">
                    Transforme o Zuma Pilot em um aplicativo nativo para macOS no Dock com suporte ao Touch Bar, Trackpad e tela Retina.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] space-y-3">
                <h4 className="font-extrabold text-xs text-[var(--ink)] flex items-center gap-1.5">
                  <Apple className="w-4 h-4" />
                  <span>Passo a Passo no Safari (macOS Sonoma ou superior):</span>
                </h4>
                <ol className="text-xs text-[var(--muted)] space-y-2 list-decimal pl-5">
                  <li>Abra o link <strong>https://zuma.kytto.com.br/pdv</strong> no navegador <strong>Safari</strong> do seu Mac.</li>
                  <li>Na barra de menus superior do Mac, clique em <strong>Arquivo</strong>.</li>
                  <li>Selecione a opção <strong>"Adicionar ao Dock..."</strong>.</li>
                  <li>Confirme o nome <em>"Zuma Pilot PDV"</em> e clique em <strong>Adicionar</strong>.</li>
                  <li>O ícone oficial do Zuma será fixado no seu <strong>Dock</strong> e no <strong>Launchpad</strong>, operando como app de desktop independente.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)] space-y-3">
                <h4 className="font-extrabold text-xs text-[var(--ink)]">Instalação no Google Chrome para Mac:</h4>
                <p className="text-xs text-[var(--muted)]">
                  Clique no botão de <strong>Download / Instalar</strong> ao lado da barra de URL ou vá no menu <em>Mais Ferramentas &gt; Salvar e Compartilhar &gt; Instalar página como aplicativo</em>.
                </p>
              </div>
            </div>
          )}

          {/* ABA APPLE IOS / IPAD */}
          {activeTab === "apple_ios" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-3">
                <Smartphone className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm">Instalação no Apple iPad (Caixa) & iPhone (Garçom)</h3>
                  <p className="text-xs text-purple-800">
                    No iOS e iPadOS, o Zuma Pilot roda em tela cheia (Full Screen) sem barra de navegação,
                    com suporte a toque capacitivo, áudio de pedidos prontos e rotação horizontal para suportes de balcão.
                  </p>
                </div>
              </div>

              {/* Guia Ilustrado em 3 Passos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto font-black text-sm">
                    1
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center mx-auto text-neutral-800">
                    <Share2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <h5 className="font-bold text-xs text-[var(--ink)]">Toque em Compartilhar</h5>
                  <p className="text-[11px] text-[var(--muted)]">
                    No Safari do iPhone ou iPad, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto font-black text-sm">
                    2
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center mx-auto text-neutral-800">
                    <PlusSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h5 className="font-bold text-xs text-[var(--ink)]">Tela de Início</h5>
                  <p className="text-[11px] text-[var(--muted)]">
                    Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black text-sm">
                    3
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h5 className="font-bold text-xs text-[var(--ink)]">Pronto para Operar</h5>
                  <p className="text-[11px] text-[var(--muted)]">
                    Toque em <strong>Adicionar</strong>. O app abrirá em tela cheia como um aplicativo nativo da App Store.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Dica para o Caixa em iPad:</strong> Ative a <em>"Trava de Rotação"</em> na horizontal para usar o iPad fixo em suportes giratórios de frente de caixa.
                </span>
              </div>
            </div>
          )}

          {/* ABA MOTOR OFFLINE & NUVEM */}
          {activeTab === "offline" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                <Cloud className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm">Motor Híbrido: Operação Local & Sincronização em Nuvem</h3>
                  <p className="text-xs text-emerald-800">
                    O Zuma Pilot foi construído com arquitetura <strong>Offline-First</strong>. Se o provedor de internet cair em Tangará da Serra,
                    o restaurante continua vendendo, lançando pratos nas mesas e recebendo pagamentos sem interrupções.
                  </p>
                </div>
              </div>

              {/* Status do Dispositivo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Conexão Atual:</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                    <span className="font-extrabold text-xs text-[var(--ink)]">
                      {isOnline ? "Conectado à Nuvem" : "Modo Offline Ativo"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] font-mono block pt-1">
                    Terminal ID: {deviceId}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Fila de Alterações:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-[var(--ink)]">
                      {pendingCount}
                    </span>
                    <span className="text-xs text-[var(--muted)]">operações locais</span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] block pt-1">
                    {pendingCount === 0 ? "Todas sincronizadas na nuvem" : "Aguardando envio ao Cloud Run"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Última Sincronização:</span>
                  <div className="text-xs font-bold text-[var(--ink)]">
                    {lastSyncTime ? `${lastSyncTime}` : "Automática em tempo real"}
                  </div>
                  <span className="text-[10px] text-emerald-700 block pt-1">
                    Região: southamerica-east1 (SP)
                  </span>
                </div>
              </div>

              {/* Ações de Teste e Sincronização */}
              <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-3">
                <h4 className="font-extrabold text-xs text-[var(--ink)]">Controles do Motor de Sincronização:</h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => syncNow()}
                    disabled={isSyncing}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Sincronizando com Nuvem..." : "Forçar Sincronização Nuvem"}</span>
                  </button>

                  <button
                    onClick={toggleSimulatedOffline}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                      isSimulatedOffline
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-[var(--surface2)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]"
                    }`}
                  >
                    <WifiOff className="w-4 h-4 text-amber-500" />
                    <span>
                      {isSimulatedOffline ? "Desativar Teste de Queda de Internet" : "Simular Queda de Internet (Teste)"}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  O sistema salva automaticamente todos os dados no navegador e sincroniza em segundo plano assim que a internet voltar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com link oficial */}
        <div className="p-4 bg-[var(--surface2)] border-t border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>URL Oficial Homologada:</span>
            <a
              href="https://zuma.kytto.com.br/pdv"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-indigo-600 hover:underline font-bold"
            >
              https://zuma.kytto.com.br/pdv
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--surface)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
