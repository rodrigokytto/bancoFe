import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface Cliente360 {
  id: string;
  nome: string;
  documento: string;
  tipo: "PF" | "PJ";
  scoreCredito: number; // 0 - 1000
  classificacaoRisco: "Baixo Risco (A)" | "Médio Risco (B)" | "Alto Risco (C)";
  limiteCredito: number;
  saldoUtilizado: number;
  totalGastoHistorico: number;
  ticketMedio: number;
  ultimaVisita: string;
  inadimplente: boolean;
  diasAtraso: number;
  fatosIA: string[];
}

const CLIENTES_360_MOCK: Cliente360[] = [
  {
    id: "c1",
    nome: "Dr. Roberto Guimarães",
    documento: "452.889.121-04",
    tipo: "PF",
    scoreCredito: 940,
    classificacaoRisco: "Baixo Risco (A)",
    limiteCredito: 15000.00,
    saldoUtilizado: 1240.00,
    totalGastoHistorico: 34500.00,
    ticketMedio: 285.00,
    ultimaVisita: "Ontem às 20h30",
    inadimplente: false,
    diasAtraso: 0,
    fatosIA: [
      "Cliente VIP Tatame. Prefere Sashimi de Salmão Trufado e Saquê Dourado.",
      "Costuma comemorar aniversários da família no restaurante em dezembro.",
      "Pontualidade de 100% no pagamento de contas e faturas de eventos."
    ]
  },
  {
    id: "c2",
    nome: "Agropecuária Tangará Ltda",
    documento: "08.432.199/0001-44",
    tipo: "PJ",
    scoreCredito: 880,
    classificacaoRisco: "Baixo Risco (A)",
    limiteCredito: 50000.00,
    saldoUtilizado: 6800.00,
    totalGastoHistorico: 98000.00,
    ticketMedio: 1450.00,
    ultimaVisita: "Há 3 dias",
    inadimplente: false,
    diasAtraso: 0,
    fatosIA: [
      "Almoço corporativo semanal com equipe de diretoria e consultores.",
      "Faturamento mensal consolidado via boleto bancário a 30 dias.",
      "Exige envio automático do XML da NF-e para contabilidade."
    ]
  },
  {
    id: "c3",
    nome: "Mariana Siqueira Rocha",
    documento: "781.992.431-55",
    tipo: "PF",
    scoreCredito: 520,
    classificacaoRisco: "Médio Risco (B)",
    limiteCredito: 2000.00,
    saldoUtilizado: 1850.00,
    totalGastoHistorico: 8900.00,
    ticketMedio: 120.00,
    ultimaVisita: "Há 12 dias",
    inadimplente: true,
    diasAtraso: 8,
    fatosIA: [
      "Fatura de comanda de confraternização em aberto há 8 dias (R$ 380,00).",
      "Consome predominantemente via delivery de sexta e sábado à noite.",
      "Preferência por combos promocionais e Hot Rolls."
    ]
  }
];

export const ErpCustomer360Subsuite: React.FC = () => {
  const [clientes] = useState<Cliente360[]>(CLIENTES_360_MOCK);
  const [clienteAtivoId, setClienteAtivoId] = useState<string>(CLIENTES_360_MOCK[0].id);

  const cliente = clientes.find(c => c.id === clienteAtivoId) || clientes[0];

  const handleDispararCobranca = () => {
    toast.success(`Mensagem amigável de cobrança via WhatsApp enviada para ${cliente.nome}!`);
  };

  const handleAjustarLimite = () => {
    toast.success(`Limite de crédito de ${cliente.nome} atualizado com sucesso!`);
  };

  return (
    <div className="space-y-4">
      {/* Header Customer 360 */}
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-md">
              CRM Avançado &amp; Gestão de Crédito • Customer 360° Kytto
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Dossiê 360°, Scoring de Crédito Automático &amp; Limites Faturados
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Análise comportamental, histórico financeiro unificado, saldo devedor e régua automatizada de cobrança.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              Motor de Scoring Ativo (Serasa/Boa Vista Integrado)
            </span>
          </div>
        </div>

        {/* Layout Master-Detail: Lista de Clientes à esquerda e Dossiê à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Lista de Clientes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--ink)] block">Carteira de Clientes Cadastrados:</span>
            <div className="space-y-1.5">
              {clientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClienteAtivoId(c.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    clienteAtivoId === c.id
                      ? "bg-[var(--salmon)] text-white border-[var(--salmon)] shadow-sm"
                      : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <b className="text-xs">{c.nome}</b>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      c.scoreCredito >= 800 ? "bg-emerald-500 text-white" : c.scoreCredito >= 600 ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
                    }`}>
                      Score {c.scoreCredito}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-1 opacity-80">
                    <span>{c.tipo} • {c.documento}</span>
                    <span className="font-mono-nums font-bold">Lmt: {formatBrl(c.limiteCredito)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coluna 2 e 3: Dossiê 360° do Cliente */}
          <div className="lg:col-span-2 space-y-3">
            {/* Cartão de Identidade e Risco */}
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                <div>
                  <h4 className="text-base font-black text-[var(--ink)]">{cliente.nome}</h4>
                  <span className="text-xs text-[var(--muted)]">Doc: {cliente.documento} • Classificação: <b>{cliente.classificacaoRisco}</b></span>
                </div>

                <div className="flex items-center gap-2">
                  {cliente.inadimplente ? (
                    <span className="px-2.5 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Inadimplente ({cliente.diasAtraso} dias de atraso)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Adimplente • Cadastro Aprovado
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Indicadores de Crédito */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Score de Crédito:</span>
                  <span className="text-lg font-black font-mono-nums text-emerald-600">{cliente.scoreCredito} / 1000</span>
                </div>
                <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Limite Total Aprovado:</span>
                  <span className="text-sm font-black font-mono-nums text-[var(--ink)]">{formatBrl(cliente.limiteCredito)}</span>
                </div>
                <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">Saldo em Aberto:</span>
                  <span className={`text-sm font-black font-mono-nums ${cliente.saldoUtilizado > 0 ? "text-amber-600" : "text-[var(--ink)]"}`}>
                    {formatBrl(cliente.saldoUtilizado)}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">LTV Total Gasto:</span>
                  <span className="text-sm font-black font-mono-nums text-[var(--salmon)]">{formatBrl(cliente.totalGastoHistorico)}</span>
                </div>
              </div>

              {/* Fatos IA Memorizados */}
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5">
                <span className="text-xs font-bold text-[var(--salmon)] block flex items-center gap-1">
                  🧠 Fatos e Preferências Memorizadas pela IA Zumi:
                </span>
                <ul className="space-y-1 text-xs text-[var(--ink)] list-disc pl-4">
                  {cliente.fatosIA.map((fato, i) => (
                    <li key={i}>{fato}</li>
                  ))}
                </ul>
              </div>

              {/* Ações de Crédito e Cobrança */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--line)]">
                {cliente.inadimplente && (
                  <button
                    onClick={handleDispararCobranca}
                    className="py-2 px-3.5 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Disparar Régua de Cobrança WhatsApp
                  </button>
                )}
                <button
                  onClick={handleAjustarLimite}
                  className="py-2 px-3.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all shadow-xs"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Ajustar Limite de Crédito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
