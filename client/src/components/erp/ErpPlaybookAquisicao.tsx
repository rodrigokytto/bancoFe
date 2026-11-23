import React, { useState } from "react";
import {
  Target,
  Users,
  Briefcase,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronRight,
  Database,
  Building2,
  PhoneCall,
  Flame,
  Award,
  Sparkles,
  Calculator,
  RefreshCw,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

export const ErpPlaybookAquisicao: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"etapas" | "calculadora" | "databridge" | "contadores" | "onboarding">("etapas");
  
  // Estado da Calculadora Dino (Teste da Receita Ociosa)
  const [faturamentoMensal, setFaturamentoMensal] = useState<number>(85000);
  const [tmrMinutos, setTmrMinutos] = useState<number>(14);
  const [leadsDia, setLeadsDia] = useState<number>(45);

  // Cálculos da Receita Ociosa
  const perdaEstimadaMes = Math.round((leadsDia * 0.28 * 68.50 * 30) * (tmrMinutos / 15));
  const ganhoKyttoIaMes = Math.round(perdaEstimadaMes * 0.75);
  const roiMultiplo = (ganhoKyttoIaMes / 1500).toFixed(1);

  // Estado do Simulador Kytto Data Bridge
  const [bridgeStatus, setBridgeStatus] = useState<"idle" | "running" | "done">("idle");
  const [bridgeProgress, setBridgeProgress] = useState<number>(0);
  const [selectedErpLegado, setSelectedErpLegado] = useState<string>("TGA Sistemas (PostgreSQL Legado)");

  const iniciarMigracaoDataBridge = () => {
    setBridgeStatus("running");
    setBridgeProgress(10);
    const interval = setInterval(() => {
      setBridgeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBridgeStatus("done");
          toast.success("Migração Kytto Data Bridge concluída em 3h42m! 0 erros.");
          return 100;
        }
        return prev + 18;
      });
    }, 400);
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho Oficial do Playbook */}
      <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-[var(--surface)] to-[var(--surface)] border border-emerald-500/30 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/15 px-2.5 py-1 rounded-md">
                🎯 Máquina de Vendas &amp; Go-to-Market • Tangará da Serra MT
              </span>
              <span className="text-[10px] font-bold text-[var(--muted)] font-mono">
                Slide 11/55 • Zuma &amp; Kytto IA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-2 flex items-center gap-2">
              Playbook de Aquisição: Como Iremos Buscar &amp; Fechar os 40 Clientes
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-3xl mt-1 leading-relaxed">
              Estratégia comercial validada para o comércio e gastronomia de Tangará da Serra. 
              Substituição cirúrgica de sistemas legados com risco zero e retorno líquido comprovado de 5x a 10x.
            </p>
          </div>

          {/* Placar de Metas e MRR */}
          <div className="flex items-center gap-3 bg-[var(--surface2)] border border-[var(--line)] p-3 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Meta Fechamento</span>
              <b className="text-base font-black text-emerald-600 font-mono-nums">28 / 40 Clientes</b>
              <span className="text-[10px] text-emerald-500 font-bold block">70% da Meta Atingida</span>
            </div>
            <div className="h-8 w-px bg-[var(--line)]" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">MRR Projetado</span>
              <b className="text-base font-black text-[var(--ink)] font-mono-nums">R$ 60.000 /mês</b>
              <span className="text-[10px] text-[var(--muted)] block">Ticket: R$ 1.500/mês</span>
            </div>
          </div>
        </div>

        {/* Abas de Navegação Interna */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--line)] overflow-x-auto no-scrollbar">
          {[
            { id: "etapas", label: "4 Etapas do Playbook", icon: Target },
            { id: "calculadora", label: "Calculadora Dino (Receita Ociosa)", icon: Calculator },
            { id: "databridge", label: "Kytto Data Bridge (<4h)", icon: Database },
            { id: "contadores", label: "Aliança Contadores (15 Escritórios)", icon: Building2 },
            { id: "onboarding", label: "Onboarding Ágil 72h & SLA 2h", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ABA 1: AS 4 ETAPAS DO PLAYBOOK */}
      {activeTab === "etapas" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ETAPA 1 */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    ETAPA 1 • PROSPECÇÃO
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--muted)]">01</span>
                </div>
                <h4 className="text-sm font-black text-[var(--ink)]">4 Motores de Geração de Leads</h4>
                <ul className="space-y-2 text-xs text-[var(--ink)]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>10 Sócios-Clientes:</b> Apresentação de sócio para dono (50 leads quentes).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>Canal Contábil:</b> 15 escritórios de contabilidade indicando (comissão 10-15%).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>SDR Local:</b> Visitas ativas no comércio de Tangará da Serra.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>Tráfego Hiperlocal:</b> Anúncios georreferenciados no WhatsApp.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Meta Mensal:</span>
                <b className="text-xs font-black text-emerald-600">50 a 60 reuniões agendadas/mês</b>
              </div>
            </div>

            {/* ETAPA 2 */}
            <div className="bg-[var(--surface)] border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                    ETAPA 2 • DIAGNÓSTICO
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--muted)]">02</span>
                </div>
                <h4 className="text-sm font-black text-[var(--ink)]">O Teste da Receita Ociosa</h4>
                <ul className="space-y-2 text-xs text-[var(--ink)]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><b>Medição do TMR:</b> Cronometramos a demora da recepção do cliente no WhatsApp.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><b>Demonstração ao Vivo:</b> Motor KyttoIA respondendo em 1,8s por voz no celular do dono.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><b>Calculadora Dino:</b> Provamos na hora quanto ele perde (R$ 10k a R$ 40k/mês).</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Taxa de Conversão:</span>
                <b className="text-xs font-black text-amber-600">65% do diagnóstico para proposta</b>
              </div>
            </div>

            {/* ETAPA 3 */}
            <div className="bg-[var(--surface)] border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                    ETAPA 3 • OBJEÇÕES
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--muted)]">03</span>
                </div>
                <h4 className="text-sm font-black text-[var(--ink)]">Destruição de Barreiras</h4>
                <ul className="space-y-2 text-xs text-[var(--ink)]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><b>"Já uso TGA/STOR":</b> Instalamos a KyttoIA no WhatsApp em paralelo sem mexer no ERP.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><b>"Medo de migrar dados":</b> Kytto Data Bridge converte bancos legados em menos de 4h.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><b>"Preço da mensalidade":</b> Provamos retorno líquido de 5x a 10x o valor pago.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Garantia Comercial:</span>
                <b className="text-xs font-black text-blue-600">Custo zero e risco zero de transição</b>
              </div>
            </div>

            {/* ETAPA 4 */}
            <div className="bg-[var(--surface)] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    ETAPA 4 • FECHAMENTO
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--muted)]">04</span>
                </div>
                <h4 className="text-sm font-black text-[var(--ink)]">Onboarding Ágil em 72h</h4>
                <ul className="space-y-2 text-xs text-[var(--ink)]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>Contrato Simplificado:</b> Cláusula de SLA com troca presencial em menos de 2h.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>Setup Presencial:</b> Técnicos locais entregam Smart POS e treinam equipe em 45m.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><b>Acompanhamento 30d:</b> Primeiro relatório de receita resgatada apresentado ao dono.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Impacto Financeiro:</span>
                <b className="text-xs font-black text-emerald-600">Ticket R$ 1.500/mês (+R$ 60k MRR)</b>
              </div>
            </div>
          </div>

          {/* 3 Pilares Estratégicos de Rodapé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <b className="text-[var(--ink)] block">Efeito Aliança dos Sócios</b>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  O empresário de Tangará não compra de estranhos; compra de quem é sócio e recomenda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <b className="text-[var(--ink)] block">Aliança com os Contadores</b>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Portal gratuito em 1 clique transforma o maior bloqueador no maior vendedor da Kytto.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <b className="text-[var(--ink)] block">Kytto Data Bridge</b>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Elimina o medo de migração com robôs que importam estoques e clientes em menos de 4 horas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CALCULADORA DINO (RECEITA OCIOSA) */}
      {activeTab === "calculadora" && (
        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
                Etapa 2 • O Teste da Receita Ociosa
              </span>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
                Calculadora Dino de Perda de Faturamento no WhatsApp
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Utilize esta ferramenta durante a reunião presencial com o dono do estabelecimento para provar o retorno do Zuma Pilot.
              </p>
            </div>
            <button
              onClick={() => toast.success("Relatório de Diagnóstico Dino gerado em PDF para apresentação ao cliente!")}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" /> Exportar Diagnóstico PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Controles de Simulação */}
            <div className="space-y-4 md:col-span-1 p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Faturamento Atual do Estabelecimento:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30000"
                    max="350000"
                    step="5000"
                    value={faturamentoMensal}
                    onChange={(e) => setFaturamentoMensal(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <span className="font-mono font-bold text-amber-600 whitespace-nowrap">
                    {formatBrl(faturamentoMensal)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Tempo Médio de Resposta Atual no WhatsApp (TMR):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="45"
                    step="1"
                    value={tmrMinutos}
                    onChange={(e) => setTmrMinutos(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <span className="font-mono font-bold text-amber-600 whitespace-nowrap">
                    {tmrMinutos} minutos
                  </span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">
                  {tmrMinutos > 10 ? "⚠️ Risco crítico de abandono de cliente para o concorrente." : "Normal com atendente humano."}
                </span>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">
                  Mensagens/Leads recebidos por dia:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="5"
                    value={leadsDia}
                    onChange={(e) => setLeadsDia(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <span className="font-mono font-bold text-amber-600 whitespace-nowrap">
                    {leadsDia} msgs/dia
                  </span>
                </div>
              </div>
            </div>

            {/* Painel de Resultados do Diagnóstico */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                  📉 Ociosidade &amp; Perda Financeira Detectada
                </span>
                <b className="text-2xl font-black text-red-600 font-mono-nums block">
                  - {formatBrl(perdaEstimadaMes)} /mês
                </b>
                <p className="text-xs text-[var(--ink)]">
                  Clientes que desistem da compra e vão para a concorrência devido à demora na resposta humana no WhatsApp.
                </p>
                <span className="text-[11px] font-mono text-red-500 block">
                  Perda acumulada em 1 ano: - {formatBrl(perdaEstimadaMes * 12)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                  📈 Receita Resgatada com Zuma Pilot (KyttoIA)
                </span>
                <b className="text-2xl font-black text-emerald-600 font-mono-nums block">
                  + {formatBrl(ganhoKyttoIaMes)} /mês
                </b>
                <p className="text-xs text-[var(--ink)]">
                  Atendimento em 1,8 segundos por voz e texto, fechamento com Pix dinâmico e recomendação inteligente de pratos.
                </p>
                <span className="text-[11px] font-bold text-emerald-600 block">
                  Retorno Comprovado: {roiMultiplo}x sobre a mensalidade de R$ 1.500
                </span>
              </div>

              <div className="sm:col-span-2 p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span><b>Argumento de Fechamento:</b> "Você não paga o Zuma Pilot. O Zuma se paga sozinho nos primeiros 4 dias de operação."</span>
                </div>
                <button
                  onClick={() => toast.success("Simulação enviada para o WhatsApp do cliente!")}
                  className="px-3 py-1.5 rounded-lg bg-[var(--ink)] text-white font-bold text-[11px] shrink-0"
                >
                  Enviar ao Dono
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: KYTTO DATA BRIDGE */}
      {activeTab === "databridge" && (
        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
              Etapa 3 • Destruição de Barreiras
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Kytto Data Bridge: Migração Segura de Sistemas Legados em &lt;4 Horas
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Robôs especializados que extraem cadastros, produtos, saldos de estoque e clientes de sistemas legados de Tangará da Serra (TGA, STOR, Totvs, Saipos) sem perda de dados.
            </p>
          </div>

          <div className="p-4 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Selecione o Sistema Legado:</label>
                <select
                  value={selectedErpLegado}
                  onChange={(e) => setSelectedErpLegado(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs"
                >
                  <option value="TGA Sistemas (PostgreSQL Legado)">TGA Sistemas (PostgreSQL Legado)</option>
                  <option value="STOR Informática (Firebird DB)">STOR Informática (Firebird DB)</option>
                  <option value="Saipos Delivery (API / CSV)">Saipos Delivery (API / CSV)</option>
                  <option value="Totvs Food (Bancos SQL Server)">Totvs Food (Bancos SQL Server)</option>
                  <option value="Planilhas Excel & Contabilidade">Planilhas Excel &amp; Contabilidade</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Empresa Alvo no Zuma:</label>
                <input
                  type="text"
                  readOnly
                  value="Zuma Gastronomia & Holding MT"
                  className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-mono text-[var(--muted)]"
                />
              </div>

              <div className="flex items-end">
                <button
                  disabled={bridgeStatus === "running"}
                  onClick={iniciarMigracaoDataBridge}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bridgeStatus === "running" ? "animate-spin" : ""}`} />
                  {bridgeStatus === "running" ? "Migrando..." : "Executar Kytto Data Bridge"}
                </button>
              </div>
            </div>

            {/* Barra de Progresso */}
            {bridgeStatus !== "idle" && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Status da Carga: {selectedErpLegado} ➔ Zuma Cloud Run</span>
                  <span className="font-mono text-blue-600">{bridgeProgress}% ({bridgeStatus === "done" ? "Concluído" : "Processando tabelas"})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${bridgeProgress}%` }}
                  />
                </div>
                {bridgeStatus === "done" && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2.418 clientes, 314 produtos e saldo contábil migrados com integridade SHA-256 em 3h42m.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: ALIANÇA CONTADORES */}
      {activeTab === "contadores" && (
        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                Canal Estratégico • Aliança dos Contadores
              </span>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
                15 Escritórios de Contabilidade Parceiros de Tangará da Serra
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Portal gratuito em 1 clique que entrega SPED Fiscal, Livro Caixa e Folha de Pagamento redondos, com comissão de 10-15% para o contador.
              </p>
            </div>
            <button
              onClick={() => toast.success("Link de acesso ao Portal do Contador gerado e copiado!")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Convidar Escritório Contábil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              { nome: "Escritório Modelo Tangará", contatos: "Roberto Contabilidade", clientes: 6, comissao: "R$ 900,00/mês", status: "ativo" },
              { nome: "Assessoria Contábil Parecis", contatos: "Dra. Juliana Mendes", clientes: 4, comissao: "R$ 600,00/mês", status: "ativo" },
              { nome: "Exata Contabilidade & Agro", contatos: "Carlos Magno", clientes: 5, comissao: "R$ 750,00/mês", status: "ativo" },
              { nome: "Líder Contábil & Tributária", contatos: "Fernando Vasconcelos", clientes: 3, comissao: "R$ 450,00/mês", status: "ativo" },
              { nome: "Nova Era Contabilidade MT", contatos: "Amanda Costa", clientes: 2, comissao: "R$ 300,00/mês", status: "onboarding" },
              { nome: "Prime Contadores Associados", contatos: "Marcelo Dantas", clientes: 4, comissao: "R$ 600,00/mês", status: "ativo" },
            ].map((esc, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <b className="text-xs font-bold text-[var(--ink)]">{esc.nome}</b>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    esc.status === "ativo" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {esc.status}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--muted)] space-y-0.5">
                  <p>Responsável: {esc.contatos}</p>
                  <p>Clientes Indicados: <b>{esc.clientes} empresas ativas</b></p>
                  <p>Repasse Mensal: <b className="text-emerald-600 font-mono-nums">{esc.comissao}</b></p>
                </div>
                <button
                  onClick={() => toast.success(`Pacote SPED de fechamento mensal enviado para ${esc.nome}!`)}
                  className="w-full py-1 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[10.5px] font-bold text-[var(--ink)] hover:bg-[var(--surface2)]"
                >
                  Enviar SPED Mensal (1 Toque)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 5: ONBOARDING ÁGIL 72H */}
      {activeTab === "onboarding" && (
        <div className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
              Etapa 4 • Fechamento &amp; Implantação
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Roteiro de Onboarding Presencial em 72 Horas com SLA Local &lt;2h
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Equipe técnica local em Tangará da Serra garantindo a troca de máquina e suporte físico imediato em caso de chamado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="font-mono text-xs font-black text-emerald-600">D+0 (0h a 24h)</span>
              <h4 className="font-bold text-[var(--ink)]">Contrato &amp; Kytto Data Bridge</h4>
              <p className="text-[11px] text-[var(--muted)]">
                Assinatura digital do contrato simplificado e execução do extrator de dados do sistema legado em até 4h na nuvem.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cláusula de SLA &lt;2h inclusa
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="font-mono text-xs font-black text-emerald-600">D+1 (24h a 48h)</span>
              <h4 className="font-bold text-[var(--ink)]">Entrega Smart POS &amp; Treinamento 45m</h4>
              <p className="text-[11px] text-[var(--muted)]">
                Técnico presencial entrega as maquininhas Smart POS, configura o KDS na cozinha e treina garçons e caixa em apenas 45 minutos.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Treinamento presencial gravado
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="font-mono text-xs font-black text-emerald-600">D+2 a D+30</span>
              <h4 className="font-bold text-[var(--ink)]">Primeiro Relatório de Receita Resgatada</h4>
              <p className="text-[11px] text-[var(--muted)]">
                No 30º dia, apresentação executiva ao dono demonstrando quanto o restaurante ganhou a mais pelo WhatsApp e economia de CMV.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Retenção comprovada 98%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
