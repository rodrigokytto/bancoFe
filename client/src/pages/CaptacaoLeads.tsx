import React, { useState, useRef, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { ZumiMascot } from "../components/shell/ZumiMascot";
import { Sparkles, Gift, CheckCircle2, QrCode, Share2, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BAIRROS_TANGARA } from "../../../shared/zumaData";

export const CaptacaoLeads: React.FC = () => {
  // Quiz State
  const [step, setStep] = useState<"quiz" | "scratch" | "form" | "done">("quiz");
  const [answers, setAnswers] = useState({
    preferencia: "Salmão cru fresco",
    ocasiao: "Casal ou amigos",
    bebida: "Coca gelada ou Suco"
  });

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("Centro");
  const [wonPrize, setWonPrize] = useState("Hot Filadélfia grátis");

  // Canvas Raspadinha
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchedPercent, setScratchedPercent] = useState(0);

  const utils = trpc.useUtils();
  const { data: leads = [] } = trpc.zuma.listLeads.useQuery();

  const createLeadMutation = trpc.zuma.createLead.useMutation({
    onSuccess: () => {
      utils.zuma.listLeads.invalidate();
      setStep("done");
      toast.success("Parabéns! Cupom enviado no seu WhatsApp e salvo na base de clientes!");
    },
    onError: (err) => {
      toast.error(`Erro ao salvar lead: ${err.message}`);
    }
  });

  // Inicializar Canvas de Raspadinha quando chegar no step
  useEffect(() => {
    if (step === "scratch" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 300;
      canvas.height = 140;

      // Desenhar camada de raspadinha prateada
      ctx.fillStyle = "#A0AEC0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Texto de instrução
      ctx.fillStyle = "#4A5568";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("RASPE AQUI COM O MOUSE OU DEDO", canvas.width / 2, canvas.height / 2 + 5);

      let isDrawing = false;

      const scratch = (x: number, y: number) => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        // Calcular porcentagem raspada a cada toque
        setScratchedPercent(prev => Math.min(100, prev + 6));
      };

      const handleMouseDown = (e: MouseEvent) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
      };

      const handleMouseUp = () => {
        isDrawing = false;
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [step]);

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return toast.error("Por favor, preencha nome e WhatsApp.");
    createLeadMutation.mutate({
      name,
      phone,
      origin: "Quiz do Sushi / Raspadinha",
      profile: `${answers.preferencia} · ${answers.ocasiao}`,
      prize: wonPrize,
      optIn: true,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Geração de Novos Clientes &amp; Leads
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Todo canal vira contato qualificado no WhatsApp com permissão
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Um quiz interativo de 20 segundos com raspadinha premiada. O cliente descobre o sushi que combina com ele, ganha um brinde e deixa o WhatsApp com opt-in legal para receber promoções.
        </p>
      </div>

      {/* 4 KPIs de Captação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Leads no Mês</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{leads.length + 184}</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">+32% que mês anterior</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Custo por Lead</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">R$ 0,84</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Lacre + Instagram local</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--salmon)] font-mono-nums mt-1">78%</span>
          <div className="text-xs text-[var(--muted)] mt-0.5">Terminam o quiz e raspam</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nori)] font-mono-nums mt-1">34%</span>
          <div className="text-xs text-[var(--muted)] mt-0.5">Pedem em até 7 dias</div>
        </div>
      </div>

      {/* Grid: Simulador Interativo do Quiz + Estatísticas de Origem */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Simulador Interativo do Quiz (Aparece como celular na tela) */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <ZumiMascot size={28} />
              <div>
                <b className="text-xs text-[var(--ink)] block">Experiência do Cliente</b>
                <span className="text-[11px] text-[var(--muted)]">Quiz interativo com raspadinha do Zumi</span>
              </div>
            </div>
            <button
              onClick={() => { setStep("quiz"); setScratchedPercent(0); }}
              className="text-[11px] font-bold text-[var(--salmon)] hover:underline"
            >
              Reiniciar teste
            </button>
          </div>

          {/* Etapa 1: Perguntas do Quiz */}
          {step === "quiz" && (
            <div className="space-y-4 pt-1">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--salmon-soft)] text-[var(--salmon)]">
                  Pergunta 1 de 3
                </span>
                <h3 className="text-sm font-extrabold text-[var(--ink)]">Como você prefere o seu sushi?</h3>
              </div>

              <div className="space-y-2">
                {[
                  "Salmão cru fresquinho e sashimis",
                  "Hot Rolls crocantes e fritos",
                  "Combinado variado com maçaricado",
                  "Sem peixe cru (vegano ou grelhado)"
                ].map((op, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAnswers({ ...answers, preferencia: op });
                      setStep("scratch");
                    }}
                    className="w-full text-left p-3 rounded-xl border border-[var(--line)] hover:border-[var(--salmon)] hover:bg-[var(--salmon-soft)]/20 text-xs font-semibold text-[var(--ink)] transition-all flex items-center justify-between"
                  >
                    <span>{op}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 2: Raspadinha Premiada em Canvas */}
          {step === "scratch" && (
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--nori-soft)] text-[var(--nori)]">
                  Seu Perfil: {answers.preferencia}
                </span>
                <h3 className="text-sm font-extrabold text-[var(--ink)]">
                  Raspe abaixo para desbloquear seu prêmio secreto!
                </h3>
              </div>

              <div className="relative mx-auto w-[300px] h-[140px] rounded-xl overflow-hidden border-2 border-dashed border-[var(--salmon)] shadow-sm bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-3">
                {/* Prêmio Oculto por Baixo */}
                <div className="text-center space-y-1">
                  <Gift className="w-7 h-7 text-[var(--salmon)] mx-auto animate-bounce" />
                  <b className="text-sm font-extrabold text-[var(--ink)] block">{wonPrize}</b>
                  <span className="text-[10px] text-[var(--muted)]">Válido no seu próximo pedido com o Zumi</span>
                </div>

                {/* Canvas de Raspadinha por Cima */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-crosshair"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="w-full bg-[var(--surface2)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--salmon)] h-full transition-all duration-200"
                    style={{ width: `${scratchedPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {scratchedPercent >= 40 ? "Prêmio revelado!" : "Passe o mouse ou dedo para raspar a tinta cinza!"}
                </p>

                <button
                  onClick={() => setStep("form")}
                  disabled={scratchedPercent < 30}
                  className="w-full py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Resgatar meu brinde agora
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3: Formulário de Captura */}
          {step === "form" && (
            <form onSubmit={handleSubmitLead} className="space-y-3">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-extrabold text-[var(--ink)]">Onde enviamos seu cupom?</h3>
                <p className="text-xs text-[var(--muted)]">
                  O Zumi enviará seu código de resgate direto no WhatsApp.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Seu WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="(65) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Seu Bairro em Tangará</label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--salmon)]"
                  >
                    {BAIRROS_TANGARA.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-start gap-2 pt-1 text-[11px] text-[var(--muted)] cursor-pointer">
                  <input type="checkbox" defaultChecked required className="rounded text-[var(--salmon)] mt-0.5" />
                  <span>Aceito receber ofertas exclusivas e novidades do Zuma via WhatsApp (pode sair a qualquer momento).</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-[var(--nori)] text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs"
              >
                {createLeadMutation.isPending ? "Cadastrando..." : "Enviar Cupom para Meu WhatsApp"}
              </button>
            </form>
          )}

          {/* Etapa 4: Sucesso */}
          {step === "done" && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--nori-soft)] text-[var(--nori)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--ink)]">Cupom Enviado com Sucesso!</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                Verifique seu WhatsApp! O Zumi já mandou seu código de desconto e o link do cardápio completo.
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas e Portas de Entrada */}
        <div className="lg:col-span-6 space-y-6">
          {/* De onde vêm os leads */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[var(--salmon)]" />
              Origem dos Leads Capturados
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                { canal: "QR Code no Lacre da Embalagem", pct: 42, count: "128 leads" },
                { canal: "Instagram (Link da Bio & Stories)", pct: 28, count: "86 leads" },
                { canal: "Mesa do Salão (Display QR)", pct: 16, count: "49 leads" },
                { canal: "Indicação de Amigo (Ganhe R$ 15)", pct: 10, count: "31 leads" },
                { canal: "Google Meu Negócio", pct: 4, count: "12 leads" }
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-[var(--ink)]">{c.canal}</span>
                    <span className="font-mono-nums text-[var(--muted)]">{c.count} ({c.pct}%)</span>
                  </div>
                  <div className="w-full bg-[var(--surface2)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--salmon)] h-full rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outras portas de entrada */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[var(--nori)]" />
              Estratégias Ativas de Captação
            </h3>
            <div className="space-y-2 text-xs text-[var(--muted)]">
              <div className="p-2.5 rounded-lg bg-[var(--surface2)]">
                <b className="text-[var(--ink)] block">QR Code no lacre da sacola:</b>
                "Raspe e ganhe no próximo pedido". Converte cliente de aplicativo em cliente direto sem taxa de 27%.
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface2)]">
                <b className="text-[var(--ink)] block">Indique e ganhe:</b>
                O amigo indicado ganha R$ 15 no primeiro pedido e quem indicou ganha 50 pontos no Clube Zumi.
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface2)]">
                <b className="text-[var(--ink)] block">Parcerias locais em Tangará:</b>
                Academias da cidade (Quarta Fit &amp; Poke) e empresas com convênio de almoço executivo.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Leads Recentes */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--salmon)]" />
          Leads Capturados Recentemente
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2 pr-4 font-bold">Nome</th>
                <th className="py-2 px-3 font-bold">WhatsApp</th>
                <th className="py-2 px-3 font-bold">Perfil do Sushi</th>
                <th className="py-2 px-3 font-bold">Origem</th>
                <th className="py-2 px-3 font-bold">Prêmio</th>
                <th className="py-2 pl-4 font-bold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-[var(--surface2)]/50">
                  <td className="py-2.5 pr-4 font-bold text-[var(--ink)]">{l.name}</td>
                  <td className="py-2.5 px-3 font-mono-nums text-[var(--ink)]">{l.phone}</td>
                  <td className="py-2.5 px-3 text-[var(--ink)]">{l.profile || "Geral"}</td>
                  <td className="py-2.5 px-3 text-[var(--muted)]">{l.origin}</td>
                  <td className="py-2.5 px-3 font-bold text-[var(--good)]">{l.prize}</td>
                  <td className="py-2.5 pl-4 text-xs font-mono-nums text-[var(--muted)]">
                    {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
