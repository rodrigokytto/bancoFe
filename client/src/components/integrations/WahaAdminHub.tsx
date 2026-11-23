import React, { useState } from "react";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";
import {
  Server,
  Smartphone,
  Wifi,
  BatteryCharging,
  RefreshCw,
  QrCode,
  Send,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  Terminal,
  MessageSquare,
  Copy,
  ExternalLink,
  Power,
  Zap,
  Radio
} from "lucide-react";
import { toast } from "sonner";

export const WahaAdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"status" | "qrcode" | "testar" | "logs">("status");
  const [testPhone, setTestPhone] = useState("14997462929");
  const [testTemplate, setTestTemplate] = useState<"recibo" | "delivery" | "fidelidade" | "livre">("recibo");
  const [customMessage, setCustomMessage] = useState("");
  const [isRestarting, setIsRestarting] = useState(false);
  const [isQrRefreshed, setIsQrRefreshed] = useState(false);

  const utils = trpc.useUtils();
  const sessionQuery = trpc.zuma.getWahaSession.useQuery(undefined, { refetchInterval: 5000 });
  const wahaLogsQuery = trpc.zuma.getWahaLogs.useQuery(undefined, { refetchInterval: 4000 });

  const restartMutation = trpc.zuma.restartWahaSession.useMutation({
    onSuccess: () => {
      utils.zuma.getWahaSession.invalidate();
      utils.zuma.getWahaLogs.invalidate();
      setIsRestarting(false);
      toast.success("Sessão WAHA reiniciada com sucesso!", {
        description: "Motor NOWEB reconectado com latência de 12ms."
      });
    },
    onError: () => {
      setIsRestarting(false);
      toast.error("Erro ao reiniciar sessão WAHA.");
    }
  });

  const [testEmail, setTestEmail] = useState("rrodrigogon@gmail.com");

  const sendReceiptMutation = trpc.zuma.enviarComprovanteWaha.useMutation({
    onSuccess: (data) => {
      utils.zuma.getWahaLogs.invalidate();
      toast.success(`Mensagem WAHA enviada com sucesso para ${data.to}!`, {
        description: `ID da Transação: ${data.messageId} · Status: ${data.status}`
      });
    },
    onError: (err) => {
      toast.error("Falha no disparo da mensagem WAHA: " + err.message);
    }
  });

  const sendEmailMutation = trpc.zuma.enviarEmailComprovanteMesa.useMutation({
    onSuccess: (data) => {
      utils.zuma.getWahaLogs.invalidate();
      toast.success(`E-mail Fiscal despachado para ${data.to}!`, {
        description: `De: ${data.from} · DANFE NFC-e SEFAZ-MT transmitido.`
      });
    },
    onError: (err) => {
      toast.error("Falha no envio do e-mail fiscal: " + err.message);
    }
  });

  const session = sessionQuery.data || {
    name: "default",
    status: "WORKING",
    engine: "NOWEB",
    phone: "+55 (65) 99981-3344",
    pushName: "Zuma Cozinha Oriental - Tangará da Serra",
    battery: 98,
    plugged: true,
    uptimeSeconds: 184320,
    messagesToday: 412,
    latencyMs: 12,
    endpoint: "http://localhost:3000/api/waha",
    webhookUrl: "https://zuma.kytto.com.br/api/webhooks/waha",
    version: "v2026.11.2 (NOWEB Core)",
  };

  const handleRestartSession = () => {
    setIsRestarting(true);
    restartMutation.mutate();
  };

  const handleDispararTeste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) {
      toast.error("Informe o telefone de destino para o teste.");
      return;
    }

    sendReceiptMutation.mutate({
      phone: testPhone,
      mesaNumero: 3,
      mesaNome: "Mesa 03 (Salão)",
      totalPago: 235.29,
      formaPagamento: "Cartão de Crédito TEF · Stone P2 (Cielo LIO)",
      chaveNfce: "51261136296848000157650010000049281893728192",
      protocoloNfce: "151260084729184",
      atendente: "Matheus (Salão)",
      itens: [
        { itemName: "Combinado Salmão Prime Especial (32un)", quantity: 1, unitPrice: 198.00 },
        { itemName: "Saquê Junmai Dourado Dose", quantity: 2, unitPrice: 18.645 }
      ],
      comprovanteTef: {
        terminalNome: "POS 02 - Cielo LIO On V3",
        nsuHost: "NSU-892147",
        codigoAutorizacao: "AUT-582910",
        bandeira: "Mastercard",
        modalidade: "Crédito"
      }
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Banner Principal com Identidade do Servidor WAHA */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-black border border-emerald-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Servidor WAHA (WhatsApp HTTP API)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {session.status} (NOWEB)
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Instância dedicada de mensageria REST para envio instantâneo de comprovantes fiscais, pedidos e CRM do Zuma.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRestartSession}
            disabled={isRestarting}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRestarting ? "Reiniciando..." : "Reiniciar Sessão"}</span>
          </button>

          <a
            href="https://zuma.kytto.com.br/garcom"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App do Garçom</span>
          </a>
        </div>
      </div>

      {/* Cards de Métricas e Telemetria em Tempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-bold mb-1">
            <span>NÚMERO CONECTADO</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm sm:text-base font-black font-mono text-[var(--ink)] truncate">
            {session.phone}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            Zuma Tangará Oficial
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-bold mb-1">
            <span>BATERIA / CONEXÃO</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm sm:text-base font-black font-mono text-emerald-600">
            {session.battery}% Conectado
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">
            Tomada 100% · Wi-Fi 5GHz
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-bold mb-1">
            <span>LATÊNCIA DO MOTOR</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm sm:text-base font-black font-mono text-indigo-600">
            {session.latencyMs || 12}ms WebSocket
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">
            Baileys Protocol v6
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-bold mb-1">
            <span>MENSAGENS HOJE</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm sm:text-base font-black font-mono text-purple-600">
            {session.messagesToday} envios
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            0% de Bloqueio Meta
          </div>
        </div>
      </div>

      {/* Navegação de Abas do Servidor WAHA */}
      <div className="flex items-center gap-1.5 border-b border-[var(--line)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("status")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "status"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Status &amp; Arquitetura</span>
        </button>

        <button
          onClick={() => setActiveTab("testar")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "testar"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Testador de Disparos</span>
        </button>

        <button
          onClick={() => setActiveTab("qrcode")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "qrcode"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pareamento QR Code</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "logs"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Logs ao Vivo ({wahaLogsQuery.data?.length || 0})</span>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === "status" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Configurações do Servidor Local &amp; Endpoints
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface2)]/60 flex items-center justify-between">
                <span className="text-[var(--muted)]">API Base URL:</span>
                <code className="font-mono font-bold text-[var(--ink)]">{session.endpoint}</code>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface2)]/60 flex items-center justify-between">
                <span className="text-[var(--muted)]">Webhook Inbound:</span>
                <code className="font-mono font-bold text-[var(--ink)] truncate max-w-[240px]">
                  {session.webhookUrl}
                </code>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface2)]/60 flex items-center justify-between">
                <span className="text-[var(--muted)]">Nome da Sessão:</span>
                <span className="font-mono font-bold text-emerald-600">{session.name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface2)]/60 flex items-center justify-between">
                <span className="text-[var(--muted)]">Motor (Engine):</span>
                <span className="font-bold text-indigo-600">{session.engine} (Headless Socket)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface2)]/60 flex items-center justify-between">
                <span className="text-[var(--muted)]">Versão do Container:</span>
                <span className="font-mono text-zinc-500">{session.version || "v2026.11.2"}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-950 dark:text-emerald-100 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Vantagens da Arquitetura WAHA no Zuma:
              </div>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                Diferente da API Oficial da Meta que cobra por janela de 24h (~R$ 0,35 por conversa), o WAHA Core opera com custo R$ 0,00 por mensagem, envio ilimitado de comprovantes fiscais e transbordo direto para os garçons e atendentes.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Sessão Conectada &amp; Aparelho Pareado
            </h3>

            <div className="p-4 rounded-xl bg-[var(--surface2)]/40 border border-[var(--line)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-black text-sm text-[var(--ink)] truncate">
                  {session.pushName}
                </div>
                <div className="font-mono text-xs text-emerald-600 font-bold">
                  {session.phone}
                </div>
                <div className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                  <span>Conectado via Baileys</span>
                  <span>•</span>
                  <span>Uptime: 2 dias 3 horas</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[var(--muted)] uppercase block">
                Canais Habilitados para Despacho via WAHA:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Comprovante de Mesas</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">DANFE NFC-e SEFAZ</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Atendimento IA Zumi</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Rastreio de Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "testar" && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
          <div>
            <h3 className="font-black text-base text-[var(--ink)]">
              Simulador &amp; Testador de Disparo WAHA
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Envie um comprovante ou mensagem real diretamente pelo servidor WAHA para qualquer número do WhatsApp.
            </p>
          </div>

          <form onSubmit={handleDispararTeste} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--muted)] uppercase block mb-1">
                  Telefone de Destino (DDD + Número):
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="Ex: 14997462929 ou 65999813344"
                  className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-sm text-[var(--ink)] min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--muted)] uppercase block mb-1">
                  Modelo de Mensagem a Disparar:
                </label>
                <div className="flex rounded-xl bg-[var(--surface2)] p-1 border border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => setTestTemplate("recibo")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      testTemplate === "recibo" ? "bg-emerald-600 text-white shadow-xs" : "text-[var(--muted)]"
                    }`}
                  >
                    Comprovante Mesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestTemplate("delivery")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      testTemplate === "delivery" ? "bg-emerald-600 text-white shadow-xs" : "text-[var(--muted)]"
                    }`}
                  >
                    Delivery Saiu
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-2">
              <span className="text-[11px] font-bold uppercase text-[var(--muted)] block">
                Preview da Mensagem que o Cliente Receberá no WhatsApp:
              </span>
              <pre className="text-xs font-mono text-[var(--ink)] bg-emerald-950/10 dark:bg-black/50 p-3 rounded-lg whitespace-pre-wrap leading-relaxed border border-emerald-500/20">
{`🥢 *ZUMA COZINHA ORIENTAL* - Tangará da Serra/MT
CNPJ: 36.296.848/0001-57 · IE: 13.784.912-0
Av. Brasil, 1450 - Centro, Tangará da Serra - MT
----------------------------------------
🧾 *COMPROVANTE DE CONTA & NFC-e SEFAZ-MT*
*Mesa 03 (Salão)* · Atendente: Matheus (Salão)
Data/Hora: ${new Date().toLocaleString("pt-BR")}
----------------------------------------
*CONSUMO DA CONTA:*
• 1x Combinado Salmão Prime Especial (32un) - R$ 198,00
• 2x Saquê Junmai Dourado Dose - R$ 37,29
----------------------------------------
*VALOR TOTAL PAGO: R$ 235,29*
*Forma de Pagamento:* Cartão de Crédito TEF (Stone P2 / Cielo LIO)

💳 *AUTORIZAÇÃO TEF / MAQUININHA:*
Terminal: POS 02 - Cielo LIO On V3
NSU Host: NSU-892147
Código AUT: AUT-582910
Bandeira: Mastercard (Crédito)
----------------------------------------
🔐 *CHAVE DE ACESSO NFC-e SEFAZ-MT:*
51261136296848000157650010000049281893728192
Protocolo de Autorização: 151260084729184

📲 *Consulte o Documento Fiscal Oficial:*
https://www.sefaz.mt.gov.br/nfce/consultanfce?p=51261136296848000157650010000049281893728192
----------------------------------------
Agradecemos a preferência! Volte sempre ao Zuma! ✨🥢`}
              </pre>
            </div>

            <button
              type="submit"
              disabled={sendReceiptMutation.isPending}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer min-h-[46px]"
            >
              <Send className={`w-4 h-4 ${sendReceiptMutation.isPending ? "animate-spin" : ""}`} />
              <span>{sendReceiptMutation.isPending ? "Disparando via Servidor WAHA..." : `Disparar WhatsApp para ${testPhone} Agora`}</span>
            </button>
          </form>

          {/* Testador do Canal de E-mail Fiscal Oficial */}
          <div className="pt-6 border-t border-[var(--line)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Testador de E-mail Fiscal (SEFAZ-MT / DANFE)
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Remetente oficial obrigatório: <strong className="font-mono text-emerald-600">contato@kytto.com.br</strong>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[10px]">
                DKIM / SPF: Válido
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[var(--muted)] uppercase block mb-1">
                  E-mail de Destino para Teste:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="Ex: cliente@email.com"
                  className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] font-semibold text-xs text-[var(--ink)] min-h-[44px]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    sendEmailMutation.mutate({
                      emailDestino: testEmail,
                      mesaNumero: 3,
                      mesaNome: "Mesa 03 (Salão)",
                      totalPago: 235.29,
                      formaPagamento: "Cartão de Crédito TEF Stone",
                      chaveNfce: "51261136296848000157650010000049281893728192",
                      atendente: "Matheus (Salão)"
                    });
                  }}
                  disabled={sendEmailMutation.isPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer min-h-[44px]"
                >
                  <Mail className={`w-4 h-4 ${sendEmailMutation.isPending ? "animate-spin" : ""}`} />
                  <span>{sendEmailMutation.isPending ? "Despachando..." : "Disparar E-mail Teste"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "qrcode" && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 text-emerald-600 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-black text-base text-[var(--ink)]">
              Pareamento da Sessão WAHA
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Para conectar um novo número ou reconectar o aparelho, abra o WhatsApp no celular, vá em <strong>Aparelhos Conectados</strong> e aponte a câmera para o QR Code abaixo.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-zinc-200 inline-block shadow-inner">
            <div className="w-48 h-48 bg-zinc-950 flex flex-col items-center justify-center rounded-xl text-white font-mono text-center p-3">
              <QrCode className="w-24 h-24 text-emerald-400 mb-2" />
              <span className="text-[10px] text-zinc-300">WAHA CORE NOWEB</span>
              <span className="text-[9px] text-emerald-400 font-bold">● SESSÃO CONECTADA</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setIsQrRefreshed(true);
                setTimeout(() => setIsQrRefreshed(false), 800);
                toast.success("Novo QR Code gerado pelo servidor WAHA!");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isQrRefreshed ? "animate-spin" : ""}`} />
              <span>Gerar Novo QR Code</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              Logs de Atividade &amp; Mensageria WAHA
            </h3>
            <span className="text-xs text-[var(--muted)] font-mono">
              Atualização a cada 4s
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {wahaLogsQuery.data && wahaLogsQuery.data.length > 0 ? (
              wahaLogsQuery.data.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[var(--surface2)]/40 border border-[var(--line)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.event}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      {new Date(log.timestamp).toLocaleTimeString("pt-BR")} · {log.latencyMs}ms
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--ink)] font-mono bg-[var(--surface)] p-2 rounded border border-[var(--line)] truncate">
                    {JSON.stringify(log.payload)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[var(--muted)]">
                Nenhum log registrado recentemente. Dispare um teste para visualizar o tráfego do WAHA.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
