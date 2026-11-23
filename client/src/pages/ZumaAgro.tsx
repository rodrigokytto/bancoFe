import React, { useState } from "react";
import {
  Sparkles,
  Building2,
  Tractor,
  DollarSign,
  CheckCircle2,
  Users,
  ShieldCheck,
  Calendar,
  Send,
  MessageCircle,
  TrendingUp,
  Receipt,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface EmpresaParceira {
  nome: string;
  setor: string;
  desconto: string;
  faturamento: string;
}

const EMPRESAS_EXEMPLO: EmpresaParceira[] = [
  { nome: "Amaggi Tangará da Serra", setor: "Trading & Grãos", desconto: "12% Cashback", faturamento: "Quinzenal no Boleto" },
  { nome: "SLC Agrícola Fazenda Paiaguás", setor: "Produção de Soja & Algodão", desconto: "15% Cashback", faturamento: "Mensal CNPJ" },
  { nome: "Unimed Vale do Sepotuba", setor: "Saúde & Cooperativa", desconto: "10% Desconto Colaborador", faturamento: "Convênio Direto" },
  { nome: "Revenda Agro Tangará (John Deere)", setor: "Máquinas Agrícolas", desconto: "12% Cashback", faturamento: "Faturado Eventos" },
  { nome: "Coprodia Bioenergia", setor: "Agroindústria & Etanol", desconto: "15% Cashback", faturamento: "Conta Corporativa" },
];

export const ZumaAgro: React.FC = () => {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contato, setContato] = useState("");
  const [numColaboradores, setNumColaboradores] = useState(25);
  const [gastoEstimado, setGastoEstimado] = useState(3500);

  const submeterConvenio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEmpresa || !cnpj || !contato) {
      toast.error("Por favor, preencha todos os campos cadastrais.");
      return;
    }
    toast.success(`Proposta corporativa Zuma Agro enviada para ${nomeEmpresa}! Entraremos em contato via WhatsApp.`, {
      icon: "🌾",
    });
    setNomeEmpresa("");
    setCnpj("");
    setContato("");
  };

  // Cálculo de cashback simulado
  const cashbackMensal = (gastoEstimado * 0.12).toFixed(2);
  const economiaAnual = (parseFloat(cashbackMensal) * 12).toFixed(2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Hero Zuma Agro */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-lime-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <Tractor className="w-3.5 h-3.5 text-emerald-400" />
              Agronegócio & B2B · Tangará da Serra (MT)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Zuma Agro & Convênios Corporativos
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-medium">
            Solução gastronômica corporativa para produtores rurais, tradings, cooperativas e revendas agrícolas de Tangará da Serra. Jantares de negócios, eventos de safra e faturamento mensal faturado no CNPJ.
          </p>
        </div>
      </div>

      {/* Grid de Benefícios Corporativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-[var(--ink)]">Faturamento Mensal CNPJ</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Elimine reembolsos manuais. Sua equipe consome no almoço ou jantar e o fechamento é emitido quinzenalmente ou mensalmente em boleto bancário consolidado com nota fiscal eletrônica.
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-[var(--ink)]">Cashback Corporativo até 15%</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Toda despesa de confraternização, jantares de diretores ou reuniões de safra acumula cashback regressivo creditado direto na conta corporativa para eventos futuros.
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-[var(--ink)]">Espaço VIP & Reservas Prioritárias</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Mesas exclusivas no Deck Jardim e Bistrô Casais reservadas para sua diretoria sem fila de espera em dias de pico (sextas e sábados).
          </p>
        </div>
      </div>

      {/* Simulador de Economia e Formulário de Adesão */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulador (Col 6) */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Simulador de Economia Corporativa
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Estime o retorno e cashback para os eventos da sua empresa em Tangará
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1 text-[var(--ink)]">
                <span>Número de Colaboradores / Diretoria:</span>
                <span className="font-mono text-emerald-600 text-sm">{numColaboradores} pessoas</span>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                value={numColaboradores}
                onChange={(e) => setNumColaboradores(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1 text-[var(--ink)]">
                <span>Consumo Mensal Estimado:</span>
                <span className="font-mono text-emerald-600 text-sm">R$ {gastoEstimado.toLocaleString("pt-BR")}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={30000}
                step={500}
                value={gastoEstimado}
                onChange={(e) => setGastoEstimado(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Resultado da Simulação */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted)]">Cashback Médio Mensal (12%):</span>
                <strong className="text-emerald-700 font-mono text-sm">R$ {cashbackMensal}</strong>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-500/20">
                <span className="font-bold text-[var(--ink)]">Economia Anual Projetada:</span>
                <strong className="text-emerald-700 font-mono text-lg font-black">
                  R$ {economiaAnual}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Adesão Direta (Col 6) */}
        <div className="lg:col-span-6 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h3 className="text-base font-black text-[var(--ink)] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Solicitar Convênio Corporativo
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Aprovação em até 2 horas úteis pelo setor comercial do Zuma
            </p>
          </div>

          <form onSubmit={submeterConvenio} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[var(--ink)] block mb-1">
                Nome da Empresa / Fazenda / Grupo Agro:
              </label>
              <input
                type="text"
                placeholder="Ex: Revenda Agrícola Tangará LTDA"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">CNPJ:</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">WhatsApp / Telefone:</label>
                <input
                  type="text"
                  placeholder="(65) 99999-0000"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Send className="w-4 h-4" />
              Cadastrar Convênio & Receber Tabela B2B
            </button>
          </form>
        </div>
      </div>

      {/* Empresas Parceiras de Tangará da Serra */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-black text-[var(--ink)]">
          Empresas e Cooperativas Credenciadas em Tangará da Serra
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMPRESAS_EXEMPLO.map((emp, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] space-y-1 text-xs"
            >
              <strong className="text-sm font-bold text-[var(--ink)] block">{emp.nome}</strong>
              <div className="text-[11px] text-[var(--muted)]">{emp.setor}</div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                <span className="font-bold text-emerald-600">{emp.desconto}</span>
                <span className="text-[10px] text-[var(--muted)] font-mono">{emp.faturamento}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
