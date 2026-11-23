import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Flame, 
  Users, 
  DollarSign, 
  Camera, 
  CloudRain, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Boxes
} from "lucide-react";
import { ZumiMascot } from "./ZumiMascot";
import { toast } from "sonner";
import { Link } from "wouter";

interface ChatMessage {
  id: string;
  sender: "zumi" | "user";
  text: string;
  time: string;
  actions?: { label: string; href?: string; onClick?: () => void }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "zumi",
    text: "Olá, Rodrigo! Sou a Zumi, sua copiloto operacional e executiva do Zuma Pilot. O restaurante está com 19 de 27 mesas ativas no turno de jantar e faturamento de R$ 10.420,00 até o momento. Como posso te apoiar agora?",
    time: "agora",
    actions: [
      { label: "📊 Resumo Executivo", onClick: () => {} },
      { label: "🍽️ Mesas & Salão", href: "/mesas" },
      { label: "👥 Ponto Nossa Gente", href: "/nossa-gente" },
      { label: "👁️ Ultra Vision AI", href: "/ultra" }
    ]
  }
];

export const ZumiCopilotAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && !minimized) {
      scrollToBottom();
    }
  }, [messages, open, minimized]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "";
      let botActions: { label: string; href?: string; onClick?: () => void }[] = [];

      const lower = text.toLowerCase();
      if (lower.includes("resumo") || lower.includes("faturamento") || lower.includes("vendas")) {
        botResponse = "📈 **Resumo Operacional do Turno Atual**:\n\n• **Faturamento Bruto**: R$ 10.420,00 (+14% vs quinta passada)\n• **Mesas Ativas**: 19 de 27 (70.3% ocupação)\n• **Ticket Médio**: R$ 242,32\n• **CMV Teórico**: 28.4% (meta < 30%)\n• **Taxa de Serviço 10%**: R$ 1.042,00 a ratear entre os 8 colaboradores.";
        botActions = [
          { label: "Ver DRE Completo", href: "/financeiro" },
          { label: "Rateio Caixinha", href: "/nossa-gente" }
        ];
      } else if (lower.includes("mesa") || lower.includes("salão") || lower.includes("salao")) {
        botResponse = "🍽️ **Status das Mesas no Salão**:\n\n• **19 mesas ocupadas**, 8 livres.\n• **Alerta**: Mesa #07 cliente fez gesto de mão detectado por IA na CAM-01 há 45s.\n• **Mesa com maior consumo**: Tatame VIP #21 (R$ 648,00 - Barca Omakase Imperial).\n• **Giro médio de mesa**: 52 minutos.";
        botActions = [
          { label: "Abrir Mapa de Mesas", href: "/mesas" },
          { label: "Ver Câmera CAM-01", href: "/ultra" }
        ];
      } else if (lower.includes("equipe") || lower.includes("gente") || lower.includes("rh") || lower.includes("ponto")) {
        botResponse = "👥 **Telemetria de Equipe (Nossa Gente x Ultra AI)**:\n\n• **8/8 colaboradores ativos** com ponto facial confirmado.\n• **Latência do Event Bus**: 2.4 ms (In-Memory / Redis).\n• **Conformidade ANVISA RDC 216**: 98.6% (todas as toucas e aventais conferidos).\n• **Destaque**: Sushichef Hiroshi Tanaka com 18 peças/min e zero falhas de assepsia.";
        botActions = [
          { label: "Abrir Nossa Gente RH", href: "/nossa-gente" },
          { label: "Event Bus & APIs", href: "/integracoes?tab=nossa_gente_ultra" }
        ];
      } else if (lower.includes("salmão") || lower.includes("salmao") || lower.includes("estoque") || lower.includes("compras")) {
        botResponse = "🐟 **Previsão de Salmão Chileno Nobre**:\n\n• **Estoque Atual**: 6.4 kg na câmara fria.\n• **Consumo Projetado Fim de Semana**: 45.0 kg.\n• **Necessidade de Compra**: 38.6 kg sugeridos no pedido 3 vias (fornecedor Cuiabá Frigorífico do Pescador).\n• **Preço Médio Cotação**: R$ 68,50/kg com entrega em Tangará da Serra amanhã às 10h.";
        botActions = [
          { label: "Motor de Compras 360", href: "/previsao-compras" },
          { label: "Estoque Frio IoT", href: "/estoque" }
        ];
      } else if (lower.includes("chuva") || lower.includes("clima") || lower.includes("delivery")) {
        botResponse = "🌧️ **Dr. Clima & Serendipidade IA Tangará da Serra**:\n\n• **Previsão**: 75% de probabilidade de pancada de chuva entre 19h45 e 21h30.\n• **Impacto Esperado**: Queda de 18% no salão presencial e aumento de +42% nos pedidos delivery de combinados quentes e lamen.\n• **Recomendação**: Ativar Plano Chuva de Vendas com foco em motoboys próprios.";
        botActions = [
          { label: "Simulador Dr. Clima", href: "/dr-clima" },
          { label: "Loja Delivery Próprio", href: "/loja" }
        ];
      } else if (lower.includes("saipos") || lower.includes("migrador") || lower.includes("migra")) {
        botResponse = "🔄 **Comparativo & Migrador Saipos 1-Clique**:\n\n• **Economia Total Estimada**: R$ 38.640,00/ano (R$ 3.220,00/mês).\n• **Zero Taxas de Cartão/Intermediação**: Economia de R$ 2.450/mês usando Pix Sicredi Direto vs Gateway Saipos.\n• **Mensalidade**: R$ 0,00 no Zuma Pilot vs R$ 770,00/mês do plano intermediário Saipos.\n• **Migração 100% Compatível**: 142 itens de cardápio, 21 fichas técnicas e histórico importados.";
        botActions = [
          { label: "Ver Comparativo Saipos", href: "/comparativo-saipos" },
          { label: "Central de Integrações", href: "/integracoes?tab=saipos_sync" }
        ];
      } else if (lower.includes("kds") || lower.includes("cozinha") || lower.includes("praça")) {
        botResponse = "🔥 **Telemetria de Cozinha KDS 2.0 Fire on Demand**:\n\n• **4 Praças Operacionais**: Sushibar, Cozinha Quente, Fritura/Hot e Bar.\n• **Tempo Médio de Preparo**: 11 min e 40 seg (meta < 14 min).\n• **Pedidos Ativos no KDS**: 12 pedidos em produção simultânea.\n• **Sincronização**: Despacho automático de itens quentes sincronizado ao término dos sushis.";
        botActions = [
          { label: "KDS 2.0 Fire on Demand", href: "/kds-2" },
          { label: "KDS Cozinha Tradicional", href: "/cozinha" }
        ];
      } else if (lower.includes("fiscal") || lower.includes("nfc") || lower.includes("sefaz") || lower.includes("imposto")) {
        botResponse = "🧾 **Status Fiscal SEFAZ-MT (NFC-e & Sped)**:\n\n• **Conexão SEFAZ-MT**: 100% Online (latência 142ms).\n• **Notas Transmitidas Hoje**: 38 NFC-e emitidas sem contingência.\n• **Chave de Acesso**: Assinatura digital A1 com certificado ICP-Brasil.\n• **Automação**: Emissão no mesmo clique do recebimento via Pix Sicredi.";
        botActions = [
          { label: "Módulo Fiscal NFC-e", href: "/fiscal" },
          { label: "Fechamento Contábil", href: "/fechamento-contabil" }
        ];
      } else {
        botResponse = `Compreendido! Processei sua solicitação sobre "${text}". O motor preditivo do Zuma Pilot correlacionou os dados de vendas, câmeras Ultra AI e estoque para apoiar a decisão com máxima lucratividade.`;
        botActions = [
          { label: "Cockpit Geral", href: "/cockpit" },
          { label: "Central de Integrações", href: "/integracoes" }
        ];
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "zumi",
        text: botResponse,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        actions: botActions
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Botão Flutuante (Trigger) */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group ring-2 ring-purple-400/40"
          title="Abrir Copiloto Executivo Zumi IA"
        >
          <div className="relative">
            <ZumiMascot size={26} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black leading-tight tracking-wide">Zumi Copilot</span>
            <span className="block text-[9.5px] text-purple-200 font-semibold leading-tight">Inteligência 360°</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin group-hover:rotate-45 transition-transform" />
        </button>
      )}

      {/* Painel Flutuante do Chatbot Copiloto */}
      {open && (
        <div className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 rounded-3xl border border-white/20 bg-[#0d131a] text-white shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          minimized 
            ? "w-80 h-14" 
            : "w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]"
        }`}>
          {/* Header do Copiloto */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-[#0e1622] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ZumiMascot size={28} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-tight text-white">Zumi Copilot IA</h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9.5px] font-mono font-bold">
                    Ao Vivo
                  </span>
                </div>
                <p className="text-[10px] text-white/50">Restaurante Zuma · Tangará da Serra MT</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/60">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1 rounded-lg hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title={minimized ? "Expandir" : "Minimizar"}
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title="Fechar Copiloto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Sugestões Rápidas de Perguntas (Chips) */}
              <div className="px-3 py-2 border-b border-white/10 bg-white/[0.02] flex items-center gap-1.5 overflow-x-auto shrink-0 text-[10.5px]">
                <button
                  onClick={() => handleSendMessage("Como está o resumo do faturamento e vendas hoje?")}
                  className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold hover:bg-purple-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  📊 Resumo Vendas
                </button>
                <button
                  onClick={() => handleSendMessage("Qual o status das 27 mesas do salão?")}
                  className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold hover:bg-blue-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  🍽️ Mesas & Salão
                </button>
                <button
                  onClick={() => handleSendMessage("Como está a equipe no Nossa Gente e as câmeras Ultra AI?")}
                  className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold hover:bg-indigo-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  👥 Equipe & Ponto
                </button>
                <button
                  onClick={() => handleSendMessage("Como está o estoque e previsão de compra de salmão?")}
                  className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  🐟 Salmão & Estoque
                </button>
                <button
                  onClick={() => handleSendMessage("Qual a previsão do Dr. Clima para delivery com chuva?")}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  🌧️ Dr. Clima & Chuva
                </button>
              </div>

              {/* Lista de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white rounded-tr-none font-medium"
                          : "bg-white/[0.06] border border-white/10 text-neutral-200 rounded-tl-none shadow-inner"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                          {msg.actions.map((act, idx) => (
                            act.href ? (
                              <Link
                                key={idx}
                                href={act.href}
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10.5px] transition-all no-underline"
                              >
                                <span>{act.label}</span>
                                <ChevronRight className="w-3 h-3 text-purple-300" />
                              </Link>
                            ) : (
                              <button
                                key={idx}
                                onClick={act.onClick}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold text-[10.5px] transition-all cursor-pointer"
                              >
                                <span>{act.label}</span>
                              </button>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9.5px] text-neutral-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-neutral-400 font-mono ml-1">Zumi analisando dados...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-3 border-t border-white/10 bg-[#090d12] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte à Zumi sobre mesas, CMV, equipe, salmão..."
                    className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
