import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Landmark,
  Scale,
  Home,
  ShieldCheck,
  Building2,
  CreditCard,
  FileCheck2,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

interface ChatMessage {
  id: string;
  sender: "copilot" | "user";
  text: string;
  time: string;
  actions?: { label: string; href?: string; onClick?: () => void }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "copilot",
    text: "Olá, Rodrigo! Sou o Copilot BancoFé, seu assistente executivo de crédito, compliance e holding. A esteira conta com 31 operações em andamento (R$ 29,43M) e 20 pré-cadastros Casa Nova prontos para deliberação de risco. Como posso apoiá-lo agora?",
    time: "agora",
    actions: [
      { label: "⚖️ Mesa de Crédito", href: "/admin/mesa-credito" },
      { label: "📈 Funil de Operações", href: "/admin/crm-financeira?aba=funil" },
      { label: "🏡 Casa Nova Imóveis", href: "/admin/crm-financeira?aba=precadastros" },
      { label: "🔍 Consulta 360° Bureaus", href: "/consulta-360" },
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
      if (lower.includes("mesa") || lower.includes("credito") || lower.includes("crédito") || lower.includes("risco") || lower.includes("parecer")) {
        botResponse = "⚖️ **Mesa de Crédito & SCR Bacen**:\n\n• **Operações em Análise**: 31 operações somando R$ 29,43M.\n• **Ticket Médio**: R$ 949.354,84.\n• **Score Médio de Crédito**: 812 (Rating Nível AA).\n• **LTV Médio das Garantias**: 58.2% (margem de segurança prudencial excelente).\n• **SCR Bacen**: 100% dos proponentes sem inadimplência sistêmica ativa.";
        botActions = [
          { label: "Mesa de Crédito", href: "/admin/mesa-credito" },
          { label: "Funil de Operações", href: "/admin/crm-financeira?aba=funil" }
        ];
      } else if (lower.includes("funil") || lower.includes("operações") || lower.includes("operacoes") || lower.includes("crm") || lower.includes("vendas")) {
        botResponse = "📈 **Funil de Operações Financeiras BancoFé**:\n\n• **1. Novo Lead**: 7 ops (R$ 5,40M)\n• **2. Qualificação**: 6 ops (R$ 4,80M)\n• **3. Mesa de Crédito**: 5 ops (R$ 6,20M)\n• **4. Formalização CCB**: 5 ops (R$ 5,10M)\n• **5. Assinatura Digital**: 4 ops (R$ 3,90M)\n• **6. Liquidado / Pago**: 4 ops (R$ 4,03M)\n\n• **Total da Carteira**: 31 Operações · R$ 29,43M distribuídos.";
        botActions = [
          { label: "Ver Funil Completo", href: "/admin/crm-financeira?aba=funil" },
          { label: "Simulador SAC/PRICE", href: "/admin/crm-financeira?aba=simulador" }
        ];
      } else if (lower.includes("casa nova") || lower.includes("casanova") || lower.includes("imóveis") || lower.includes("imoveis") || lower.includes("proponentes") || lower.includes("pre-cadastro") || lower.includes("precadastro")) {
        botResponse = "🏡 **Esteira de Pré-Cadastros Casa Nova Imóveis**:\n\n• **Base Total**: 20 proponentes migrados com sucesso de `casanova.kytto.com.br`.\n• **Checklist Documental**: CND Federal, FGTS, CNDT e Certidões de Registro de Imóveis em conformidade.\n• **LTV Médio**: 61% (todas as operações com lastro imobiliário).\n• **LGPD**: 20/20 com Termos de Consentimento SCR Bacen assinados digitalmente.";
        botActions = [
          { label: "Abrir Pré-Cadastros", href: "/admin/crm-financeira?aba=precadastros" },
          { label: "Central de Termos SCR", href: "/admin/termos" }
        ];
      } else if (lower.includes("bureaus") || lower.includes("consulta") || lower.includes("360") || lower.includes("cpf") || lower.includes("cnpj")) {
        botResponse = "🔍 **Motor de Consulta 360° & Bureaus Federais**:\n\n• **Bases Auditadas**: 48+ bureaus em tempo real (Receita Federal, Bacen SCR, TJ-MT, PGFN, Serasa, CNDT).\n• **Conformidade**: 100% dos dossiês com hash SHA-256 no cofre criptográfico BancoFé.\n• **Risco de Fraude**: Zero alertas de inconsistência cadastral ou duplicidade documental.";
        botActions = [
          { label: "Consulta 360° Bureaus", href: "/consulta-360" },
          { label: "Termos & Consentimentos", href: "/admin/termos" }
        ];
      } else if (lower.includes("holding") || lower.includes("empresas") || lower.includes("coligadas") || lower.includes("grupo")) {
        botResponse = "🏢 **Governança & 12 Empresas da Holding BancoFé**:\n\n1. **BancoFé Digital & Banking Core** (BaaS / Pix)\n2. **BancoFé Operações Financeiras** (Crédito & CRM)\n3. **BancoFé Cadastro 360 & Vault** (KYC/AML)\n4. **Casa Nova Imóveis** (Loteamentos & Vendas)\n5. **Agropecuária UISA** (Biorrefinaria & Barter)\n6. **Construtora Ultra** (Engenharia Pesada)\n7. **Barbearia Dino** (Assinaturas Recorrentes)\n8. **Zuma Cozinha Oriental** (Gastronomia)\n9. **Zuma Moda & Boutique** (Varejo)\n10. **Kytto Logística & Frotas** (GPS)\n11. **Kytto Concreto & Mineração**\n12. **BancoFé Holding S/A** (CNPJ: 53.338.003/0001-04).";
        botActions = [
          { label: "Gestão da Holding /admin", href: "/admin" },
          { label: "Backoffice Corporativo", href: "/admin/backoffice" }
        ];
      } else if (lower.includes("pix") || lower.includes("carteira") || lower.includes("baas") || lower.includes("bancario") || lower.includes("bancário")) {
        botResponse = "💳 **Carteira Digital & BaaS BancoFé**:\n\n• **Liquidação Pix 24/7**: Conexão direta via DICT Bacen.\n• **Contas Digitais PJ**: Conciliação automática de recebíveis e duplicatas.\n• **Volume Mensal Liquidado**: R$ 22,84M com 99.99% de Uptime SLA.";
        botActions = [
          { label: "Abrir Carteira Digital", href: "/plataforma/carteira" },
          { label: "BancoFé Core Bancário", href: "/bancofe" }
        ];
      } else {
        botResponse = `Compreendido! Processei sua solicitação sobre "${text}". O motor de governança, mesa de crédito e compliance da Holding BancoFé está operando com integridade total em produção no Cloud Run.`;
        botActions = [
          { label: "Mesa de Crédito", href: "/admin/mesa-credito" },
          { label: "Funil de Operações", href: "/admin/crm-financeira?aba=funil" }
        ];
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "copilot",
        text: botResponse,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        actions: botActions
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <>
      {/* Botão Flutuante (Trigger BancoFé Copilot) */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group ring-2 ring-emerald-500/40"
          title="Abrir BancoFé Copilot IA"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-emerald-300">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black leading-tight tracking-wide">BancoFé Copilot</span>
            <span className="block text-[9.5px] text-emerald-200 font-semibold leading-tight">Mesa &amp; Holding IA</span>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-300 animate-spin group-hover:rotate-45 transition-transform" />
        </button>
      )}

      {/* Painel Flutuante do Chatbot Copiloto */}
      {open && (
        <div className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 rounded-3xl border border-emerald-500/30 bg-[#071510] text-white shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          minimized 
            ? "w-80 h-14" 
            : "w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh]"
        }`}>
          {/* Header do Copiloto */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#071510] border-b border-emerald-500/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-2xs">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-tight text-white">BancoFé Copilot IA</h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9.5px] font-mono font-bold">
                    Conectado PRD
                  </span>
                </div>
                <p className="text-[10px] text-white/60">Holding BancoFé S/A · CNPJ: 53.338.003/0001-04</p>
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
                  onClick={() => handleSendMessage("Como está o parecer e métricas da Mesa de Crédito?")}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  ⚖️ Mesa de Crédito
                </button>
                <button
                  onClick={() => handleSendMessage("Qual a distribuição das 31 operações no Funil de Crédito?")}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  📈 Funil 31 Ops
                </button>
                <button
                  onClick={() => handleSendMessage("Qual o status dos 20 proponentes da Casa Nova Imóveis?")}
                  className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  🏡 Casa Nova Imóveis
                </button>
                <button
                  onClick={() => handleSendMessage("Como funciona a auditoria 360° e bureaus Bacen?")}
                  className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold hover:bg-purple-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  🔍 Bureaus 360°
                </button>
                <button
                  onClick={() => handleSendMessage("Quais são as 12 empresas coligadas da Holding BancoFé?")}
                  className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold hover:bg-blue-500/25 whitespace-nowrap cursor-pointer transition-all"
                >
                  🏢 12 Empresas Holding
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
                          ? "bg-emerald-700 text-white rounded-tr-none font-medium"
                          : "bg-white/[0.06] border border-emerald-500/20 text-neutral-200 rounded-tl-none shadow-inner"
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
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-bold text-[10.5px] transition-all no-underline border border-emerald-500/30"
                              >
                                <span>{act.label}</span>
                                <ChevronRight className="w-3 h-3 text-emerald-300" />
                              </Link>
                            ) : (
                              <button
                                key={idx}
                                onClick={act.onClick}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-[10.5px] transition-all cursor-pointer border border-emerald-500/25"
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
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-emerald-500/20 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-emerald-300 font-mono ml-1">BancoFé Copilot analisando carteira...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-3 border-t border-white/10 bg-[#050e0a] shrink-0">
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
                    placeholder="Pergunte ao Copilot sobre mesa de crédito, funil, Casa Nova..."
                    className="flex-1 bg-white/[0.06] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
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
