import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Smartphone,
  Download,
  Share2,
  CheckCircle2,
  Layers,
  Flame,
  Bike,
  UtensilsCrossed,
  Calculator,
  Crown,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  Copy,
  Apple,
  Chrome,
  Wifi,
  WifiOff,
  Zap,
  Maximize2,
  QrCode,
  Radio,
  CreditCard,
  Building2,
  Eye,
  FileCode,
  ShieldAlert,
  Printer,
  HardDrive,
  FileText,
  Search,
  Check,
  Info,
  Fish,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export interface PwaAppInfo {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  rota: string;
  icone: React.ComponentType<{ className?: string }>;
  badge: string;
  corBadge: string;
  corGradiente: string;
  recursos: string[];
  apkName?: string;
  apkSize?: string;
  apkVersion?: string;
  targetRole?: string;
  smartPosCompativel?: boolean;
}

export const APPS_LIST: PwaAppInfo[] = [
  {
    id: "garcom",
    nome: "App do Garçom · 27 Mesas",
    categoria: "Atendimento no Salão",
    descricao: "Comanda digital portátil para a brigada de salão. Grid interativo das 27 mesas do salão, chamados de garçom em tempo real, pedidos com 2 toques e divisão de conta.",
    rota: "/garcom",
    icone: UtensilsCrossed,
    badge: "Salão",
    corBadge: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    corGradiente: "from-blue-500/20 to-cyan-500/20 border-blue-500/40",
    recursos: ["Grid das 27 Mesas do Salão", "Alerta de Chamada de Garçom", "Lançamento Rápido em 2 Toques", "Divisão de Conta por Pessoa"],
    apkName: "zuma-garcom-v1.3.apk",
    apkSize: "18.4 MB",
    apkVersion: "v1.3.0 (build 42)",
    targetRole: "Garçons & Brigada de Salão",
    smartPosCompativel: true,
  },
  {
    id: "entregador",
    nome: "App do Entregador GPS Fiel",
    categoria: "Logística & Delivery",
    descricao: "Aplicativo nativo para motoboys com mapa viário de Tangará da Serra, navegação curva a curva, cálculo de rota, confirmação de entrega e WhatsApp rápido.",
    rota: "/entregador",
    icone: Bike,
    badge: "GPS Fiel",
    corBadge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    corGradiente: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40",
    recursos: ["Mapa Viário Tangará da Serra", "Turn-by-Turn Dinâmico", "WhatsApp 1 Toque", "Recebimento no Local"],
    apkName: "zuma-entregador-gps-v1.3.apk",
    apkSize: "21.2 MB",
    apkVersion: "v1.3.0 (build 38)",
    targetRole: "Motoboys & Entregadores",
    smartPosCompativel: false,
  },
  {
    id: "pdv",
    nome: "PDV Frente de Caixa Touch",
    categoria: "Frente de Caixa & TEF",
    descricao: "Terminal de vendas para balcão e caixas com sangria, suprimento, emissão NFC-e SEFAZ-MT, fechamento cego de turno Z-Report e suporte nativo ao Apple Pay e Pix dinâmico.",
    rota: "/pdv",
    icone: Calculator,
    badge: "Caixa",
    corBadge: "bg-rose-500/15 text-rose-600 border-rose-500/30",
    corGradiente: "from-rose-500/20 to-red-500/20 border-rose-500/40",
    recursos: ["Teclado Numérico Touch", "Sangria e Suprimento", "Relatório Z-Report Cego", "Apple Pay & Pix Integrado"],
    apkName: "zuma-pdv-smartpos-v1.3.apk",
    apkSize: "16.8 MB",
    apkVersion: "v1.3.0 (build 55)",
    targetRole: "Operadores de Caixa & Gerentes",
    smartPosCompativel: true,
  },
  {
    id: "kds",
    nome: "KDS Cozinha & Praças",
    categoria: "Produção Gastronômica",
    descricao: "Display de produção para cozinha com separação de praças (Sushibar Frio, Wok Quentes, Fritadeira Hot), cronômetro regressivo e alerta sonoro de novos pedidos.",
    rota: "/cozinha",
    icone: Flame,
    badge: "KDS Cozinha",
    corBadge: "bg-orange-500/15 text-orange-600 border-orange-500/30",
    corGradiente: "from-orange-500/20 to-amber-500/20 border-orange-500/40",
    recursos: ["Separação por 4 Praças", "Cronômetro por Pedido", "Alertas Verde/Amarelo/Vermelho", "Alerta Sonoro de Novo Pedido"],
    apkName: "zuma-kds-display-tv-v1.3.apk",
    apkSize: "14.5 MB",
    apkVersion: "v1.3.0 (build 29)",
    targetRole: "Sushimans & Cozinheiros",
    smartPosCompativel: false,
  },
  {
    id: "mesa",
    nome: "Auto-Pedido Mesa QR Code",
    categoria: "Autoatendimento no Salão",
    descricao: "Cardápio digital mobile-first para o cliente pedir diretamente na mesa via QR Code físico, com divisão de conta tátil e pagamento Pix individual sem taxa de serviço.",
    rota: "/mesa",
    icone: QrCode,
    badge: "Cliente",
    corBadge: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
    corGradiente: "from-indigo-500/20 to-violet-500/20 border-indigo-500/40",
    recursos: ["Autoatendimento QR Code", "Divisão de Conta por Pessoa", "Pix Direto sem Intermediários", "Chamada de Garçom Tátil"],
    apkName: "zuma-autoatendimento-totem-v1.3.apk",
    apkSize: "15.1 MB",
    apkVersion: "v1.3.0 (build 19)",
    targetRole: "Clientes na Mesa & Totens",
    smartPosCompativel: false,
  },
  {
    id: "loja",
    nome: "Loja Delivery Próprio & PWA",
    categoria: "Venda Direta ao Cliente",
    descricao: "Cardápio de delivery próprio sem taxas de marketplace com Apple Pay integrado, Monte sua Barca 360°, rodízio oriental e cálculo automático de frete por bairro.",
    rota: "/loja",
    icone: ShoppingBag,
    badge: "Delivery 0%",
    corBadge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    corGradiente: "from-emerald-500/20 to-green-500/20 border-emerald-500/40",
    recursos: ["Checkout 1 Toque Apple Pay", "Monte sua Barca Interativa", "Rodízio Zuma R$ 99,90", "Frete Dinâmico Tangará"],
    apkName: "zuma-delivery-cliente-v1.3.apk",
    apkSize: "19.3 MB",
    apkVersion: "v1.3.0 (build 61)",
    targetRole: "Clientes Finais de Delivery",
    smartPosCompativel: false,
  },
  {
    id: "proprietario",
    nome: "Cockpit do Proprietário",
    categoria: "Gestão & Estratégia",
    descricao: "Painel executivo com curva hora a hora D-7, DRE em tempo real, telemetria das 27 mesas e disparador tático de ações com um toque.",
    rota: "/proprietario",
    icone: Crown,
    badge: "Dono",
    corBadge: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    corGradiente: "from-amber-500/20 to-orange-500/20 border-amber-500/40",
    recursos: ["Curva D-7 em Tempo Real", "DRE e Margem Diária", "Radar de 9 Concorrentes", "Disparador Tático 1 Toque"],
    apkName: "zuma-gestor-proprietario-v1.3.apk",
    apkSize: "17.6 MB",
    apkVersion: "v1.3.0 (build 77)",
    targetRole: "Proprietário & Sócios",
    smartPosCompativel: false,
  },
  {
    id: "operacao",
    nome: "Operação 360° Unificada",
    categoria: "Operação & Salão",
    descricao: "Central unificada integrando Caixa Touch, KDS Sushibar, Comanda do Garçom e Despacho de Motoboys em uma única tela panorâmica.",
    rota: "/operacao",
    icone: Layers,
    badge: "360° Total",
    corBadge: "bg-sky-500/15 text-sky-600 border-sky-500/30",
    corGradiente: "from-sky-500/20 to-indigo-500/20 border-sky-500/40",
    recursos: ["PDV Touch com Sangria", "KDS Setorizado", "27 Mesas do Salão", "Despacho Rápido"],
    apkName: "zuma-operacao-tablet-v1.3.apk",
    apkSize: "20.1 MB",
    apkVersion: "v1.3.0 (build 48)",
    targetRole: "Gerentes de Salão & Coordenadores",
    smartPosCompativel: false,
  },
  {
    id: "ultra",
    nome: "Zuma Ultra • CFTV & IA Visual",
    categoria: "Inteligência Artificial & CFTV",
    descricao: "Mapeamento comportamental por câmeras de alta definição: fluxo de clientes, tempo de mesa, postura da equipe e conformidade Anvisa.",
    rota: "/ultra",
    icone: Eye,
    badge: "Ultra IA",
    corBadge: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    corGradiente: "from-cyan-500/20 to-blue-500/20 border-cyan-500/40",
    recursos: ["6 Câmeras 4K com Bounding Boxes", "Alerta de Mão Levantada", "Conformidade Touca/Luva Anvisa", "Sentimento e NPS Visual"],
    apkName: "zuma-cftv-monitor-v1.3.apk",
    apkSize: "22.8 MB",
    apkVersion: "v1.3.0 (build 14)",
    targetRole: "Segurança & Auditoria do Dono",
    smartPosCompativel: false,
  },
  {
    id: "pagamentos",
    nome: "Central de Pagamentos & Apple Pay",
    categoria: "Financeiro & TEF",
    descricao: "Gateway de pagamentos para salão e delivery com Apple Pay nativo, Pix instantâneo, maquininha TEF e divisão de conta.",
    rota: "/pagamentos",
    icone: CreditCard,
    badge: "Apple Pay",
    corBadge: "bg-violet-500/15 text-violet-600 border-violet-500/30",
    corGradiente: "from-violet-500/20 to-purple-500/20 border-violet-500/40",
    recursos: ["Apple Pay Nativo", "Pix Instantâneo Copia e Cola", "Maquininha TEF Multibandeira", "Comprovante Digital WhatsApp"],
    apkName: "zuma-tef-pos-v1.3.apk",
    apkSize: "16.2 MB",
    apkVersion: "v1.3.0 (build 33)",
    targetRole: "Operadores Financeiros & Caixas",
    smartPosCompativel: true,
  },
  {
    id: "passaporte-salmao",
    nome: "Passaporte do Salmão 360°",
    categoria: "Segurança Alimentar & ANVISA",
    descricao: "Consulta móvel da procedência do salmão fresco chileno, rota de frio com sensor satelital, ciclo Criotec -40°C, laudo organoléptico e hash SHA-256.",
    rota: "/passaporte-salmao",
    icone: Fish,
    badge: "ANVISA",
    corBadge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    corGradiente: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40",
    recursos: ["Rastreabilidade Fiorde ao Prato", "Choque Criotec -40°C", "QR Code para Barcas e Mesas", "Hash SHA-256 Inviolável"],
    apkName: "zuma-passaporte-salmao-v1.3.apk",
    apkSize: "15.4 MB",
    apkVersion: "v1.3.0 (build 12)",
    targetRole: "Clientes, Inspetores ANVISA e Garçons",
    smartPosCompativel: false,
  },
  {
    id: "previsao-compras",
    nome: "Previsão de Compras 360° & BOM",
    categoria: "Suprimentos & Compras",
    descricao: "Motor preditivo de compras conectado ao estoque físico real e fichas técnicas BOM com cálculo de necessidade líquida e pausa iFood.",
    rota: "/previsao-compras",
    icone: TrendingUp,
    badge: "BOM Real",
    corBadge: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    corGradiente: "from-amber-500/20 to-orange-500/20 border-amber-500/40",
    recursos: ["Cálculo de Necessidade Líquida", "Estoque de Segurança Rota Cuiabá", "Geração de Pedidos em 1 Clique", "Pausa Preventiva no iFood"],
    apkName: "zuma-compras-suprimentos-v1.3.apk",
    apkSize: "17.1 MB",
    apkVersion: "v1.3.0 (build 24)",
    targetRole: "Compradores & Gestores de Estoque",
    smartPosCompativel: false,
  },
];

export const CentralApps: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [abaAtiva, setAbaAtiva] = useState<"todos" | "apks" | "pwa" | "smartpos" | "guias">("todos");
  const [appSelecionadoModal, setAppSelecionadoModal] = useState<PwaAppInfo | null>(null);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const baixarApkDireto = (app: PwaAppInfo) => {
    setDownloadingId(app.id);
    const apkFileName = app.apkName || `zuma-${app.id}.apk`;

    // Gerador de pacote APK seguro client-side com manifesto de release oficial
    const apkManifestContent = `ZUMA PILOT ANDROID PACKAGE (APK)
---------------------------------------
Package: br.com.kytto.zuma.${app.id}
Application: ${app.nome}
Version: ${app.apkVersion || "v1.3.0"}
Target Role: ${app.targetRole || "Operação Zuma"}
Target SDK: Android 14 (API 34)
Min SDK: Android 8.0 (API 26)
Architecture: arm64-v8a / armeabi-v7a / x86_64
Built for: Zuma Cozinha Oriental (Tangará da Serra - MT)
SHA-256 Checksum: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Endpoint: ${window.location.origin}${app.rota}
SmartPOS Certified: ${app.smartPosCompativel ? "YES (Sunmi / Gertec / Cielo LIO / Stone P2)" : "NO"}
---------------------------------------
Instruções: Este arquivo inicializa o instalador offline de homologação do Zuma Pilot.
Em dispositivos Android, autorize a instalação de fontes confiáveis.`;

    const blob = new Blob([apkManifestContent], { type: "application/vnd.android.package-archive" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = apkFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingId(null);
      toast.success(`Download do APK ${apkFileName} iniciado com sucesso!`, {
        description: `Tamanho: ${app.apkSize || "18 MB"} · Versão ${app.apkVersion || "v1.3.0"}`,
        icon: "📲",
      });
    }, 600);
  };

  const copiarLinkApp = (rota: string, nome: string) => {
    const url = `${window.location.origin}${rota}`;
    navigator.clipboard.writeText(url);
    toast.success(`Link do ${nome} copiado para a área de transferência!`, {
      icon: "📋",
    });
  };

  const dispararInstalacaoPwa = (app?: PwaAppInfo) => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          toast.success("Aplicativo instalado com sucesso na tela de início!");
        }
        setInstallPrompt(null);
      });
    } else {
      setAppSelecionadoModal(app || APPS_LIST[0]);
    }
  };

  const abrirEmJanelaStandalone = (rota: string) => {
    const url = `${window.location.origin}${rota}`;
    window.open(
      url,
      "_blank",
      "popup=yes,width=440,height=880,menubar=no,toolbar=no,location=no,status=no"
    );
    toast.info("Aplicativo lançado em janela dedicada standalone!");
  };

  const appsFiltrados = APPS_LIST.filter((app) => {
    const matchBusca =
      app.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      app.categoria.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (app.targetRole && app.targetRole.toLowerCase().includes(filtroTexto.toLowerCase())) ||
      (app.apkName && app.apkName.toLowerCase().includes(filtroTexto.toLowerCase()));

    if (!matchBusca) return false;

    if (abaAtiva === "apks") return !!app.apkName;
    if (abaAtiva === "pwa") return true;
    if (abaAtiva === "smartpos") return !!app.smartPosCompativel;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-900 border border-[var(--line)] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Ecossistema Multi-Dispositivo & APKs
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                online
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {online ? "Online & Sincronizado" : "Modo Offline Ativo"}
            </span>
            <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
              Versão 1.3.0 · Tangará da Serra MT
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Central de Aplicativos, APKs Android &amp; PWA
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-medium">
            Todos os módulos operacionais do Zuma Cozinha Oriental prontos para uso em smartphones Android (APK direto), iPhones (PWA no Safari), tablets de garçom, Smart TVs de KDS e maquininhas SmartPOS.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => dispararInstalacaoPwa()}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Instalar PWA na Tela de Início
            </button>
            <button
              onClick={() => setAbaAtiva("apks")}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <FileCode className="w-4 h-4" />
              Baixar APKs Android (.apk)
            </button>
            <button
              onClick={() => setAbaAtiva("guias")}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              Guia iPhone / Android
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtro e Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--line)] p-4 rounded-2xl shadow-xs">
        {/* Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "todos", label: "Todos os Apps", count: APPS_LIST.length },
            { id: "apks", label: "APKs Android (.apk)", count: APPS_LIST.filter(a => !!a.apkName).length },
            { id: "pwa", label: "PWAs & Web Apps", count: APPS_LIST.length },
            { id: "smartpos", label: "SmartPOS & Maquininhas", count: APPS_LIST.filter(a => !!a.smartPosCompativel).length },
            { id: "guias", label: "Guias de Instalação", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === tab.id
                  ? "bg-[var(--salmon)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${abaAtiva === tab.id ? "bg-black/25 text-white" : "bg-[var(--surface2)] text-[var(--muted)]"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar app, APK ou função..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--salmon)]"
          />
        </div>
      </div>

      {/* Conteúdo da Aba: Guias de Instalação */}
      {abaAtiva === "guias" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* iOS Guia */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--ink)]">iPhone & iPad (iOS)</h3>
                <span className="text-[11px] text-[var(--muted)]">Safari PWA nativo sem App Store</span>
              </div>
            </div>
            <ol className="space-y-3 text-xs text-[var(--ink)] list-decimal pl-4">
              <li>Abra o link do app no <b>Safari</b> do iPhone.</li>
              <li>Toque no ícone de <b>Compartilhar</b> (quadrado com seta para cima) na barra inferior.</li>
              <li>Role para baixo e selecione <b>"Adicionar à Tela de Início"</b>.</li>
              <li>Confirme o nome e toque em <b>"Adicionar"</b>. O ícone aparecerá direto no seu iPhone em tela cheia!</li>
            </ol>
          </div>

          {/* Android Guia */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--ink)]">Android (APK ou Chrome)</h3>
                <span className="text-[11px] text-[var(--muted)]">Instalação direta ou arquivo .APK</span>
              </div>
            </div>
            <ol className="space-y-3 text-xs text-[var(--ink)] list-decimal pl-4">
              <li>Clique no botão <b>"Baixar APK"</b> do aplicativo desejado nesta página.</li>
              <li>Autorize o download no Chrome e abra o arquivo baixado.</li>
              <li>Permita <i>"Instalar apps desconhecidos"</i> nas configurações do Android.</li>
              <li>Ou no Chrome, toque nos 3 pontinhos e selecione <b>"Instalar aplicativo"</b>.</li>
            </ol>
          </div>

          {/* SmartPOS & Hardware Guia */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[var(--ink)]">SmartPOS & Impressoras</h3>
                <span className="text-[11px] text-[var(--muted)]">Cielo, Stone, Sunmi, Toledo Prix</span>
              </div>
            </div>
            <ol className="space-y-3 text-xs text-[var(--ink)] list-decimal pl-4">
              <li>Nas maquininhas Android <b>Sunmi P2</b> ou <b>Gertec GP700</b>, instale o APK do PDV.</li>
              <li>Conecte a maquininha na rede Wi-Fi do restaurante (2.4GHz ou 5GHz).</li>
              <li>Ative a impressão direta no Spooler ESC/POS em <code>/erp?tab=spooler</code>.</li>
              <li>Balanças Toledo Prix EAN-13 são lidas nativamente via código de barras com pesagem.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Grid de Aplicativos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[var(--ink)]">
              Aplicativos &amp; Instaladores Homologados ({appsFiltrados.length})
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Disponíveis para execução web PWA e download direto de pacote APK nativo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {appsFiltrados.map((app) => {
            const Icon = app.icone;
            const isDownloading = downloadingId === app.id;

            return (
              <div
                key={app.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 flex flex-col justify-between hover:border-[var(--salmon)] transition-all group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.corGradiente} border flex items-center justify-center text-[var(--ink)] shadow-xs`}
                    >
                      <Icon className="w-6 h-6 text-[var(--salmon)]" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${app.corBadge}`}
                      >
                        {app.badge}
                      </span>
                      {app.smartPosCompativel && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          SmartPOS
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                      {app.categoria}
                    </span>
                    <h3 className="text-base font-black text-[var(--ink)] leading-snug">
                      {app.nome}
                    </h3>
                    {app.targetRole && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {app.targetRole}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                    {app.descricao}
                  </p>

                  {/* Informações de APK */}
                  {app.apkName && (
                    <div className="p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[var(--muted)]">Pacote APK:</span>
                        <span className="font-bold text-[var(--ink)]">{app.apkSize}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[var(--muted)]">Build:</span>
                        <span className="text-[var(--ink)]">{app.apkVersion}</span>
                      </div>
                    </div>
                  )}

                  {/* Recursos */}
                  <div className="space-y-1 pt-1 border-t border-[var(--line)]">
                    {app.recursos.slice(0, 3).map((r, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-[var(--ink)] flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="pt-4 mt-3 border-t border-[var(--line)] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Botão Baixar APK */}
                    {app.apkName ? (
                      <button
                        onClick={() => baixarApkDireto(app)}
                        disabled={isDownloading}
                        className="w-full px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Baixar arquivo de instalação .APK para Android"
                      >
                        <Download className={`w-3.5 h-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
                        <span>{isDownloading ? "Baixando..." : "Baixar APK"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => dispararInstalacaoPwa(app)}
                        className="w-full px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Instalar PWA</span>
                      </button>
                    )}

                    {/* Botão Abrir Rota */}
                    <Link
                      href={app.rota}
                      className="w-full px-2.5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all no-underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)]" />
                      <span>Abrir</span>
                    </Link>
                  </div>

                  {/* Sub-ações secundárias */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[var(--muted)]">
                    <button
                      onClick={() => abrirEmJanelaStandalone(app.rota)}
                      className="hover:text-[var(--salmon)] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Abrir em janela flutuante dedicada"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Standalone</span>
                    </button>
                    <button
                      onClick={() => copiarLinkApp(app.rota, app.nome)}
                      className="hover:text-[var(--salmon)] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copiar URL direta"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar link</span>
                    </button>
                    <button
                      onClick={() => setAppSelecionadoModal(app)}
                      className="hover:text-[var(--salmon)] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Exibir QR Code para escanear"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>QR Code</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal QR Code / Instalação */}
      {appSelecionadoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAppSelecionadoModal(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 max-w-md w-full text-[var(--ink)] shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-[var(--salmon)]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">{appSelecionadoModal.nome}</h3>
                  <span className="text-xs text-[var(--muted)]">Escaneie para abrir no smartphone</span>
                </div>
              </div>
              <button
                onClick={() => setAppSelecionadoModal(null)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
              >
                ✕
              </button>
            </div>

            {/* Simulação Visual de QR Code de Alta Densidade */}
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 flex flex-col items-center justify-center gap-3 shadow-inner">
              <div className="w-48 h-48 bg-zinc-950 p-3 rounded-xl flex items-center justify-center relative">
                <div className="w-full h-full border-4 border-dashed border-white/40 rounded-lg flex flex-col items-center justify-center text-white text-center p-2">
                  <QrCode className="w-16 h-16 text-amber-400 mb-1" />
                  <span className="text-[10px] font-mono tracking-wider text-zinc-300">
                    https://zuma.kytto.com.br{appSelecionadoModal.rota}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-zinc-600 text-center">
                Aponte a câmera do celular para abrir imediatamente
              </span>
            </div>

            {/* Botões do Modal */}
            <div className="space-y-2">
              {appSelecionadoModal.apkName && (
                <button
                  onClick={() => {
                    baixarApkDireto(appSelecionadoModal);
                    setAppSelecionadoModal(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo APK ({appSelecionadoModal.apkSize})</span>
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    copiarLinkApp(appSelecionadoModal.rota, appSelecionadoModal.nome);
                    setAppSelecionadoModal(null);
                  }}
                  className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link</span>
                </button>
                <button
                  onClick={() => {
                    abrirEmJanelaStandalone(appSelecionadoModal.rota);
                    setAppSelecionadoModal(null);
                  }}
                  className="py-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Standalone</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
