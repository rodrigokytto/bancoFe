import React, { useState } from "react";
import { 
  Scissors, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Percent, 
  Plus, 
  Sparkles,
  Phone,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

const PROFISSIONAIS = [
  { id: "1", nome: "Lucas 'Navalha' Silva", especialidade: "Fade & Barba Terapia", comissaoPct: 50, atendimentosHoje: 8, faturamentoHoje: 520 },
  { id: "2", nome: "Matheus Santos", especialidade: "Corte Clássico & Penteados", comissaoPct: 45, atendimentosHoje: 6, faturamentoHoje: 390 },
  { id: "3", nome: "Rafael Costa", especialidade: "Platinado & Desenho Navalhado", comissaoPct: 50, atendimentosHoje: 5, faturamentoHoje: 350 },
];

const SERVICOS_CATALOGO = [
  { id: "s1", nome: "Corte Degradê / Fade Navalhado", tipo: "servico", duracaoMin: 40, preco: 50.00 },
  { id: "s2", nome: "Barba Terapia com Toalha Quente & Ozônio", tipo: "servico", duracaoMin: 35, preco: 45.00 },
  { id: "s3", nome: "Combo Cabelo + Barba Completo", tipo: "servico", duracaoMin: 60, preco: 85.00 },
  { id: "s4", nome: "Pigmentação de Barba", tipo: "servico", duracaoMin: 25, preco: 35.00 },
  { id: "p1", nome: "Pomada Modeladora Efeito Matte 120g", tipo: "produto", preco: 42.00 },
  { id: "p2", nome: "Óleo para Barba Hidratante 30ml", tipo: "produto", preco: 38.00 },
];

const AGENDAMENTOS_HOJE = [
  { id: "a1", hora: "14:00", cliente: "Dr. Roberto Guimarães", tel: "(65) 99823-1122", servico: "Combo Cabelo + Barba", profissional: "Lucas 'Navalha' Silva", status: "concluido", valor: 85.00 },
  { id: "a2", hora: "15:00", cliente: "Eduardo Antunes", tel: "(65) 99611-4455", servico: "Corte Degradê", profissional: "Lucas 'Navalha' Silva", status: "em_andamento", valor: 50.00 },
  { id: "a3", hora: "16:00", cliente: "Vinicius Prado", tel: "(65) 99902-8877", servico: "Barba Terapia", profissional: "Matheus Santos", status: "confirmado", valor: 45.00 },
  { id: "a4", hora: "17:00", cliente: "Carlos Alberto Meira", tel: "(65) 99744-3321", servico: "Combo Cabelo + Barba", profissional: "Rafael Costa", status: "confirmado", valor: 85.00 },
];

export const ErpBarbeariaSubsuite: React.FC = () => {
  const [selectedProfissional, setSelectedProfissional] = useState(PROFISSIONAIS[0].id);
  const [agendamentos, setAgendamentos] = useState(AGENDAMENTOS_HOJE);

  const profissionalAtual = PROFISSIONAIS.find(p => p.id === selectedProfissional) || PROFISSIONAIS[0];

  const handleConcluirAtendimento = (id: string) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: "concluido" } : a));
    toast.success("Atendimento concluído! Comissão e baixa de insumos lançadas automaticamente.");
  };

  const totalFaturado = agendamentos.reduce((acc, a) => acc + (a.status === "concluido" ? a.valor : 0), 0);
  const comissaoTotal = totalFaturado * (profissionalAtual.comissaoPct / 100);

  return (
    <div className="space-y-4">
      {/* Header do Módulo */}
      <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
              Módulo de Serviços &amp; Estética • Kytto Barbearia
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Agenda do Profissional, Comissões Automáticas &amp; Venda Rápida
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Controle de agendamentos online, comanda eletrônica de serviços e rateio de comissões por barbeiro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success("Novo agendamento criado!")}
              className="px-3 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Agendamento
            </button>
          </div>
        </div>

        {/* 3 KPIs da Barbearia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Faturamento Serviços Hoje</span>
            <div className="text-xl font-black font-mono-nums text-[var(--ink)]">
              {formatBrl(totalFaturado)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">{agendamentos.filter(a => a.status === 'concluido').length} atendimentos concluídos</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Comissão Estimada ({profissionalAtual.comissaoPct}%)</span>
            <div className="text-xl font-black font-mono-nums text-emerald-600">
              {formatBrl(comissaoTotal)}
            </div>
            <span className="text-[10px] text-[var(--muted)]">Rateio líquido para o profissional</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Clube VIP Assinatura</span>
            <div className="text-xl font-black font-mono-nums text-purple-600">
              34 Membros Ativos
            </div>
            <span className="text-[10px] text-purple-600 font-bold">R$ 149,90/mês corte livre</span>
          </div>
        </div>

        {/* Grade de Profissionais */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[var(--ink)] block">Selecione o Profissional:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PROFISSIONAIS.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setSelectedProfissional(prof.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedProfissional === prof.id
                    ? "bg-[var(--salmon)] text-white border-[var(--salmon)] shadow-sm"
                    : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <b className="text-xs">{prof.nome}</b>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${selectedProfissional === prof.id ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                    {prof.comissaoPct}% comissão
                  </span>
                </div>
                <span className={`text-[10px] block mt-0.5 ${selectedProfissional === prof.id ? "text-white/80" : "text-[var(--muted)]"}`}>
                  {prof.especialidade}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Agendamentos do Dia */}
        <div className="space-y-2 pt-2 border-t border-[var(--line)]">
          <span className="text-xs font-bold text-[var(--ink)] block">
            Agenda do Dia • {profissionalAtual.nome}:
          </span>

          <div className="space-y-1.5">
            {agendamentos.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center font-mono-nums font-black text-sm text-[var(--salmon)] shrink-0">
                    {item.hora}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <b className="text-[var(--ink)]">{item.cliente}</b>
                      <span className="text-[10px] text-[var(--muted)] flex items-center gap-0.5">
                        <Phone className="w-2.5 h-2.5" /> {item.tel}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] block">
                      {item.servico} • Profissional: {item.profissional}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-mono-nums font-black text-[var(--ink)] text-sm">
                    {formatBrl(item.valor)}
                  </span>

                  {item.status === "concluido" ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Concluído
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConcluirAtendimento(item.id)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--salmon)] text-white text-[10px] font-bold hover:brightness-105 active:scale-95 transition-all shadow-xs"
                    >
                      Concluir &amp; Pagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
