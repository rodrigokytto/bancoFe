import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  Send,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Download,
  Building,
  UserCheck,
  ShieldCheck,
  Percent,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface Contrato {
  id: string;
  cliente: string;
  tipo: "Convênio Corporativo Almoço/Jantar" | "Barbearia Club Assinatura" | "Buffet Executivo Mensal" | "Clube Esportivo Mensalidade";
  valorMensal: number;
  diaVencimento: number;
  inicio: string;
  status: "Ativo" | "Inadimplente" | "Suspenso";
  contato: string;
}

const CONTRATOS_INICIAIS: Contrato[] = [
  { id: "CTR-2026-01", cliente: "Agroindustrial Parecis S.A.", tipo: "Buffet Executivo Mensal", valorMensal: 14500.0, diaVencimento: 10, inicio: "01/03/2026", status: "Ativo", contato: "Diretoria Agro (65) 99988-1122" },
  { id: "CTR-2026-02", cliente: "Cooperativa Sicredi Tangará", tipo: "Convênio Corporativo Almoço/Jantar", valorMensal: 8900.0, diaVencimento: 15, inicio: "15/01/2026", status: "Ativo", contato: "RH Sicredi (65) 99877-3344" },
  { id: "CTR-2026-03", cliente: "Dr. Marcelo Castilho (VIP)", tipo: "Barbearia Club Assinatura", valorMensal: 350.0, diaVencimento: 5, inicio: "10/05/2026", status: "Ativo", contato: "(65) 99655-4400" },
  { id: "CTR-2026-04", cliente: "Engenharia & Obras Serrano", tipo: "Convênio Corporativo Almoço/Jantar", valorMensal: 5400.0, diaVencimento: 20, inicio: "01/06/2026", status: "Inadimplente", contato: "Financeiro Serrano (65) 99911-2288" },
  { id: "CTR-2026-05", cliente: "Clube Esportivo Raquetes MT", tipo: "Clube Esportivo Mensalidade", valorMensal: 4200.0, diaVencimento: 5, inicio: "10/02/2026", status: "Ativo", contato: "Coordenação (65) 99233-1199" },
];

export const ErpBillingSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"contratos" | "faturamento" | "regua" | "inadimplencia">("contratos");
  const [contratos, setContratos] = useState<Contrato[]>(CONTRATOS_INICIAIS);
  const [filtro, setFiltro] = useState("");

  const faturarCicloLote = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 900)),
      {
        loading: "Processando faturamento recorrente do ciclo Novembro/2026...",
        success: "5 faturas geradas com sucesso! Boletos registrados e links Pix enviados por WhatsApp.",
        error: "Erro ao gerar faturamento.",
      }
    );
  };

  const dispararReguaWhatsApp = (cliente: string, etapa: string) => {
    toast.success(`Notificação da régua de cobrança (${etapa}) disparada para ${cliente} via WhatsApp!`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Billing & Contratos */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <span>Billing, Contratos &amp; Faturamento Recorrente 360°</span>
              <span className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                Pix Recorrente + Régua Automática
              </span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Gestão de Contratos B2B · Ciclos de Faturamento · Régua de Cobrança D-3/D-0/D+3/D+7 · Recuperação de Inadimplência
            </p>
          </div>
        </div>

        {/* Seletor de Sub-Abas do Billing */}
        <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs">
          {[
            { id: "contratos", label: "Contratos B2B", icon: FileText },
            { id: "faturamento", label: "Faturamento em Lote", icon: DollarSign },
            { id: "regua", label: "Régua de Cobrança", icon: Clock },
            { id: "inadimplencia", label: "Inadimplência", icon: AlertTriangle },
          ].map((item) => {
            const Icon = item.icon;
            const active = subAba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubAba(item.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-[var(--surface)] text-[var(--salmon)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. GESTÃO DE CONTRATOS B2B */}
      {subAba === "contratos" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar contrato por cliente..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)]"
              />
            </div>
            <button
              onClick={() => toast.info("Modal para firmar novo contrato de fornecimento ou assinatura")}
              className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Plus className="w-4 h-4" />
              Novo Contrato B2B
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contratos
              .filter((c) => c.cliente.toLowerCase().includes(filtro.toLowerCase()))
              .map((c) => (
                <div key={c.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[var(--muted)]">{c.id}</span>
                        <h5 className="font-bold text-sm text-[var(--ink)]">{c.cliente}</h5>
                        <span className="text-xs text-[var(--salmon)] font-medium">{c.tipo}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        c.status === "Ativo"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-500/15 text-red-700 dark:text-red-300"
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--muted)] pt-3 border-t border-[var(--line)] my-2">
                      <div className="flex justify-between">
                        <span>Valor Mensal:</span>
                        <strong className="text-[var(--ink)] font-mono text-sm">{formatBrl(c.valorMensal)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Vencimento:</span>
                        <strong className="text-[var(--ink)]">Todo dia {c.diaVencimento}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Contato:</span>
                        <span className="text-[var(--ink)] truncate max-w-[150px]">{c.contato}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--line)] flex justify-between gap-2 text-xs">
                    <button
                      onClick={() => toast.info(`Dossiê do contrato ${c.id} visualizado.`)}
                      className="flex-1 py-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--line)] font-bold text-[var(--ink)]"
                    >
                      Ver Termos
                    </button>
                    <button
                      onClick={() => toast.success(`Fatura avulsa gerada para ${c.cliente}!`)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                    >
                      Faturar Agora
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. FATURAMENTO EM LOTE */}
      {subAba === "faturamento" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Ciclo de Faturamento Recorrente (Novembro/2026)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Processamento de cobrança unificada para empresas parceiras, buffets corporativos e assinaturas</p>
            </div>

            <button
              onClick={faturarCicloLote}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Check className="w-4 h-4" />
              Executar Faturamento em Lote
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Total Recorrente Previsto</span>
              <strong className="text-xl font-mono font-black text-emerald-600">R$ 33.350,00</strong>
              <span className="text-xs text-[var(--muted)] block mt-1">5 contratos corporativos ativos</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Faturado &amp; Liquidado</span>
              <strong className="text-xl font-mono font-black text-[var(--ink)]">R$ 27.950,00</strong>
              <span className="text-xs text-emerald-600 font-bold block mt-1">83.8% liquidado no prazo</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Inadimplência / Atraso</span>
              <strong className="text-xl font-mono font-black text-red-500">R$ 5.400,00</strong>
              <span className="text-xs text-red-500 font-bold block mt-1">1 contrato em cobrança D+3</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RÉGUA DE COBRANÇA AUTOMATIZADA */}
      {subAba === "regua" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Régua de Cobrança Multicanal Automatizada</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">Cadência inteligente de lembretes e cobrança amigável via WhatsApp oficial e e-mail com Pix dinâmico</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-mono">D-3 Dias</span>
                <span className="text-[10px] text-[var(--muted)]">Preventivo</span>
              </div>
              <h5 className="font-bold text-xs text-[var(--ink)]">Aviso de Vencimento Próximo</h5>
              <p className="text-[11px] text-[var(--muted)]">Envia link Pix com desconto de pontualidade para pagamento antecipado.</p>
              <button
                onClick={() => toast.success("Etapa D-3 disparada para 4 clientes!")}
                className="w-full mt-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--line)]"
              >
                Disparar Teste
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">D-0 (Hoje)</span>
                <span className="text-[10px] text-[var(--muted)]">Vencimento</span>
              </div>
              <h5 className="font-bold text-xs text-[var(--ink)]">Lembrete de Vencimento Hoje</h5>
              <p className="text-[11px] text-[var(--muted)]">Mensagem cordial com código de barras digitável e Pix Copia e Cola imediato.</p>
              <button
                onClick={() => toast.success("Etapa D-0 disparada!")}
                className="w-full mt-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--line)]"
              >
                Disparar Teste
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">D+3 Dias</span>
                <span className="text-[10px] text-[var(--muted)]">Cobrança Amigável</span>
              </div>
              <h5 className="font-bold text-xs text-[var(--ink)]">Aviso de Não Compensação</h5>
              <p className="text-[11px] text-[var(--muted)]">Verifica se houve problema de processamento bancário e oferece atualização de Pix sem juros.</p>
              <button
                onClick={() => toast.success("Etapa D+3 disparada para inadimplentes!")}
                className="w-full mt-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-500/20"
              >
                Disparar D+3
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 font-mono">D+7 Dias</span>
                <span className="text-[10px] text-[var(--muted)]">Notificação Formal</span>
              </div>
              <h5 className="font-bold text-xs text-[var(--ink)]">Suspensão Temporária</h5>
              <p className="text-[11px] text-[var(--muted)]">Notificação sobre pausa preventiva nos pedidos faturados até a regularização do débito.</p>
              <button
                onClick={() => toast.success("Etapa D+7 executada com sucesso!")}
                className="w-full mt-2 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 text-[11px] font-bold hover:bg-red-500/20"
              >
                Disparar D+7
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INADIMPLÊNCIA & RECUPERAÇÃO */}
      {subAba === "inadimplencia" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Painel de Inadimplência &amp; Recuperação de Crédito</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">Acompanhamento de débitos vencidos com cálculo de mora diária (0,033%) e multa contratual (2%)</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface2)] border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-red-500 font-bold uppercase">Atraso de 4 dias (Vencimento 17/11)</span>
              <h5 className="font-bold text-sm text-[var(--ink)]">Engenharia &amp; Obras Serrano Ltda</h5>
              <p className="text-xs text-[var(--muted)]">Fatura Ref: Convênio Almoço Corporativo Brigada de Obras · Valor Original: R$ 5.400,00</p>
              <span className="text-xs font-mono font-bold text-red-600 mt-1 block">
                Valor Atualizado (Multa 2% + Mora): R$ 5.515,10
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => dispararReguaWhatsApp("Engenharia Serrano", "WhatsApp com Pix Atualizado")}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
              >
                <Send className="w-3.5 h-3.5" />
                Cobrar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
