import React, { useState } from "react";
import {
  Users,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck,
  Plus,
  Send,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  Percent,
  Printer,
  X,
  FileSignature,
  Award,
  Sparkles,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  tipoContrato: "CLT" | "Salão Parceiro (Lei 13.352)" | "PJ / MEI" | "Estágio";
  salarioBase: number;
  admissao: string;
  status: "Ativo" | "Férias" | "Afastado";
  telefone: string;
  bancoPix: string;
}

interface ItemHolerite {
  id: string;
  colaborador: string;
  cargo: string;
  cbo: string;
  pis: string;
  admissao: string;
  base: number;
  insalubridade: number;
  horasExtras: number;
  dSR: number;
  comissao: number;
  rateioGorjeta: number;
  inss: number;
  irrf: number;
  liquido: number;
  statusHolerite: string;
}

const COLABORADORES_INICIAIS: Colaborador[] = [
  { id: "COL-01", nome: "Kenji Sato", cargo: "Chefe Executivo Sushiman (Omakase)", departamento: "Sushibar / Balcão", tipoContrato: "CLT", salarioBase: 4850.0, admissao: "15/01/2022", status: "Ativo", telefone: "(65) 99812-3344", bancoPix: "Sicredi (Chave CPF)" },
  { id: "COL-02", nome: "Mateus Silva Pereira", cargo: "Segundo Sushiman (Cortes & Toalete)", departamento: "Sushibar / Balcão", tipoContrato: "CLT", salarioBase: 3100.0, admissao: "10/05/2023", status: "Ativo", telefone: "(65) 99722-1100", bancoPix: "Sicoob (Chave E-mail)" },
  { id: "COL-03", nome: "Aline Cristina Dantas", cargo: "Gerente Geral de Operações & Salão", departamento: "Administrativo / Backoffice", tipoContrato: "CLT", salarioBase: 3800.0, admissao: "01/02/2022", status: "Ativo", telefone: "(65) 99933-4455", bancoPix: "Banco do Brasil (CPF)" },
  { id: "COL-04", nome: "Lucas Evangelista", cargo: "Chefe de Bar & Mixologista Autoral", departamento: "Salão & Bar", tipoContrato: "CLT", salarioBase: 2450.0, admissao: "18/08/2023", status: "Ativo", telefone: "(65) 99655-7788", bancoPix: "Nubank (Chave Aleatória)" },
  { id: "COL-05", nome: "Bruno Barber Master", cargo: "Mestre Barbeiro Sênior", departamento: "Barbearia / Estética", tipoContrato: "Salão Parceiro (Lei 13.352)", salarioBase: 0.0, admissao: "10/03/2024", status: "Ativo", telefone: "(65) 99233-1122", bancoPix: "Sicredi (CNPJ MEI)" },
  { id: "COL-06", nome: "Jéssica Vasconcelos", cargo: "Garçonete Líder / Sommelière Sake", departamento: "Salão & Bar", tipoContrato: "CLT", salarioBase: 2200.0, admissao: "05/11/2023", status: "Ativo", telefone: "(65) 99844-3322", bancoPix: "Sicredi (CPF)" },
  { id: "COL-07", nome: "Carlos Eduardo Motta", cargo: "Entregador Piloto Líder (Delivery Próprio)", departamento: "Delivery & Frota", tipoContrato: "PJ / MEI", salarioBase: 2600.0, admissao: "10/06/2024", status: "Ativo", telefone: "(65) 99901-2233", bancoPix: "Sicredi (Chave Telefone)" },
  { id: "COL-08", nome: "Maria Aparecida Souza", cargo: "Chefe de Praça Quente (Yakissoba/Robatas)", departamento: "Cozinha Quente", tipoContrato: "CLT", salarioBase: 2900.0, admissao: "01/02/2024", status: "Ativo", telefone: "(65) 99611-8899", bancoPix: "Bradesco (CPF)" },
];

export const ErpRhSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"colaboradores" | "folha" | "rateio" | "comissoes" | "ponto" | "aso">("colaboradores");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(COLABORADORES_INICIAIS);
  const [busca, setBusca] = useState("");
  const [deptoFiltro, setDeptoFiltro] = useState<string>("TODOS");

  // Estado do Modal de Holerite Digital
  const [holeriteVisualizando, setHoleriteVisualizando] = useState<ItemHolerite | null>(null);

  // Folha de Pagamento Mockada Detalhada
  const folhaNovembro: ItemHolerite[] = [
    {
      id: "F-01",
      colaborador: "Kenji Sato",
      cargo: "Chefe Sushiman",
      cbo: "5134-25",
      pis: "128.49102.88-1",
      admissao: "15/01/2022",
      base: 4850.0,
      insalubridade: 282.4,
      horasExtras: 450.0,
      dSR: 90.0,
      inss: 521.3,
      irrf: 265.4,
      comissao: 850.0,
      rateioGorjeta: 990.0,
      liquido: 6475.7,
      statusHolerite: "Gerado & Assinado"
    },
    {
      id: "F-02",
      colaborador: "Mateus Silva Pereira",
      cargo: "Segundo Sushiman",
      cbo: "5134-25",
      pis: "131.55412.90-4",
      admissao: "10/05/2023",
      base: 3100.0,
      insalubridade: 282.4,
      horasExtras: 320.0,
      dSR: 64.0,
      inss: 298.5,
      irrf: 85.0,
      comissao: 420.0,
      rateioGorjeta: 660.0,
      liquido: 4462.9,
      statusHolerite: "Gerado & Assinado"
    },
    {
      id: "F-03",
      colaborador: "Aline Cristina Dantas",
      cargo: "Gerente Geral",
      cbo: "1414-10",
      pis: "142.98120.33-7",
      admissao: "01/02/2022",
      base: 3800.0,
      insalubridade: 0,
      horasExtras: 0,
      dSR: 0,
      inss: 382.1,
      irrf: 145.2,
      comissao: 1250.0,
      rateioGorjeta: 1320.0,
      liquido: 5842.7,
      statusHolerite: "Gerado & Enviado"
    },
    {
      id: "F-04",
      colaborador: "Lucas Evangelista",
      cargo: "Barman & Mixologista",
      cbo: "5134-20",
      pis: "155.10928.44-0",
      admissao: "18/08/2023",
      base: 2450.0,
      insalubridade: 0,
      horasExtras: 210.0,
      dSR: 42.0,
      inss: 215.3,
      irrf: 18.0,
      comissao: 380.0,
      rateioGorjeta: 990.0,
      liquido: 3838.7,
      statusHolerite: "Pendente Assinatura"
    },
    {
      id: "F-05",
      colaborador: "Maria Aparecida Souza",
      cargo: "Chefe Cozinha Quente",
      cbo: "5132-05",
      pis: "119.82103.77-9",
      admissao: "01/02/2024",
      base: 2900.0,
      insalubridade: 282.4,
      horasExtras: 180.0,
      dSR: 36.0,
      inss: 268.0,
      irrf: 55.0,
      comissao: 310.0,
      rateioGorjeta: 660.0,
      liquido: 4045.4,
      statusHolerite: "Gerado & Assinado"
    },
  ];

  // Simulador de Rateio de Gorjeta 10% (Lei nº 13.419)
  const rateioGorjetaEquipe = [
    { cargo: "Garçom Líder / Atendimento Salão", colaborador: "Jéssica Vasconcelos", pontos: 2.0, horasMes: 176, valorLiquido: 1320.00 },
    { cargo: "Chefe Sushiman", colaborador: "Kenji Sato", pontos: 1.5, horasMes: 176, valorLiquido: 990.00 },
    { cargo: "Mixologista / Bar", colaborador: "Lucas Evangelista", pontos: 1.5, horasMes: 176, valorLiquido: 990.00 },
    { cargo: "Segundo Sushiman", colaborador: "Mateus Silva", pontos: 1.0, horasMes: 176, valorLiquido: 660.00 },
    { cargo: "Cozinha Quente", colaborador: "Maria Aparecida", pontos: 1.0, horasMes: 176, valorLiquido: 660.00 },
    { cargo: "Gerente Geral", colaborador: "Aline Cristina", pontos: 2.0, horasMes: 176, valorLiquido: 1320.00 },
    { cargo: "Cumin / Apoio de Salão", colaborador: "Gabriel Prado", pontos: 0.8, horasMes: 176, valorLiquido: 528.00 },
    { cargo: "Higienização & Steward", colaborador: "Tereza Santos", pontos: 0.8, horasMes: 176, valorLiquido: 528.00 },
  ];

  // Comissões do Mês
  const comissoesBrigada = [
    { profissional: "Bruno Barber Master", modulo: "Barbearia", tipo: "Cortes & Barba (50% Rateio)", faturadoBruto: 9400.0, pctRateio: 50.0, valorComissao: 4700.0, metaAtingida: true, bonusMeta: 350.0 },
    { profissional: "Kenji Sato", modulo: "Sushibar Zuma", tipo: "Pratos Especiais & Omakase", faturadoBruto: 42500.0, pctRateio: 2.0, valorComissao: 850.0, metaAtingida: true, bonusMeta: 200.0 },
    { profissional: "Aline Cristina Dantas", modulo: "Salão", tipo: "Taxa de Atendimento & Vendas B2B", faturadoBruto: 62500.0, pctRateio: 2.0, valorComissao: 1250.0, metaAtingida: true, bonusMeta: 300.0 },
    { profissional: "Lucas Evangelista", modulo: "Bar", tipo: "Drinks Autorais & Doses Nobres", faturadoBruto: 12600.0, pctRateio: 3.0, valorComissao: 378.0, metaAtingida: true, bonusMeta: 100.0 },
  ];

  // Espelho de Ponto Portaria 671 MTE
  const registrosPonto = [
    { data: "21/11/2026", colaborador: "Kenji Sato", entrada: "15:02", intervaloIda: "18:30", intervaloVolta: "19:15", saida: "23:48", saldoDia: "+00:46h", ocorrencia: "Normal" },
    { data: "21/11/2026", colaborador: "Mateus Silva Pereira", entrada: "15:05", intervaloIda: "18:30", intervaloVolta: "19:15", saida: "23:45", saldoDia: "+00:40h", ocorrencia: "Normal" },
    { data: "21/11/2026", colaborador: "Aline Cristina Dantas", entrada: "16:00", intervaloIda: "19:00", intervaloVolta: "19:45", saida: "00:15", saldoDia: "+00:30h", ocorrencia: "Hora Extra Fechamento" },
    { data: "21/11/2026", colaborador: "Lucas Evangelista", entrada: "17:00", intervaloIda: "20:30", intervaloVolta: "21:00", saida: "01:05", saldoDia: "+00:35h", ocorrencia: "Adicional Noturno" },
    { data: "21/11/2026", colaborador: "Maria Aparecida Souza", entrada: "15:10", intervaloIda: "18:45", intervaloVolta: "19:30", saida: "23:40", saldoDia: "+00:30h", ocorrencia: "Normal" },
  ];

  const colaboradoresFiltrados = colaboradores.filter((c) => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchDepto = deptoFiltro === "TODOS" || c.departamento === deptoFiltro;
    return matchBusca && matchDepto;
  });

  const enviarHoleriteWhats = (colaborador: string) => {
    toast.success(`Holerite digital e demonstrativo de INSS/FGTS enviados para o WhatsApp de ${colaborador}!`);
  };

  const baterPonto = () => {
    toast.success("Ponto eletrônico registrado com sucesso às " + new Date().toLocaleTimeString("pt-BR") + " (Geolocalização Tangará da Serra MT validada)");
  };

  return (
    <div className="space-y-5">
      {/* Top Banner do Módulo de Recursos Humanos */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <span>Recursos Humanos &amp; Departamento Pessoal 360°</span>
              <span className="text-[10px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                Portaria 671 MTE + eSocial + Lei da Gorjeta 13.419
              </span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Quadro de Equipe · Folha &amp; Holerites · Rateio de Gorjeta 10% · Comissões Salão Parceiro · Ponto Eletrônico
            </p>
          </div>
        </div>

        {/* Seletor de Sub-Abas do RH */}
        <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs flex-wrap">
          {[
            { id: "colaboradores", label: "Quadro de Equipe", icon: Users },
            { id: "folha", label: "Folha & Holerites", icon: DollarSign },
            { id: "rateio", label: "Rateio Gorjeta 10%", icon: Calculator },
            { id: "comissoes", label: "Comissões & Metas", icon: Percent },
            { id: "ponto", label: "Ponto Eletrônico", icon: Clock },
            { id: "aso", label: "Saúde & Treinamentos", icon: ShieldCheck },
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

      {/* 1. QUADRO DE COLABORADORES */}
      {subAba === "colaboradores" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nome ou função..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)]"
                />
              </div>
              <select
                value={deptoFiltro}
                onChange={(e) => setDeptoFiltro(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] font-bold"
              >
                <option value="TODOS">Todos os Deptos</option>
                <option value="Sushibar / Balcão">Sushibar / Balcão</option>
                <option value="Cozinha Quente">Cozinha Quente</option>
                <option value="Salão & Bar">Salão &amp; Bar</option>
                <option value="Delivery & Frota">Delivery &amp; Frota</option>
                <option value="Administrativo / Backoffice">Administrativo</option>
                <option value="Barbearia / Estética">Barbearia / Estética</option>
              </select>
            </div>
            <button
              onClick={() => toast.info("Modal de Admissão de Novo Colaborador (eSocial evento S-2200)")}
              className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Plus className="w-4 h-4" />
              Nova Admissão / Contratação
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {colaboradoresFiltrados.map((c) => (
              <div
                key={c.id}
                className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[var(--salmon)] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[var(--muted)]">{c.id}</span>
                      <h4 className="font-bold text-sm text-[var(--ink)] leading-tight">{c.nome}</h4>
                      <p className="text-xs text-[var(--salmon)] font-medium">{c.cargo}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--muted)] my-3 pt-2 border-t border-[var(--line)]">
                    <div className="flex justify-between">
                      <span>Depto:</span>
                      <strong className="text-[var(--ink)]">{c.departamento}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Regime:</span>
                      <strong className="text-[var(--ink)]">{c.tipoContrato}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Salário Base:</span>
                      <strong className="text-[var(--ink)] font-mono">
                        {c.salarioBase > 0 ? formatBrl(c.salarioBase) : "Comissão Salão Parceiro"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Chave Pix:</span>
                      <span className="text-[var(--ink)] truncate max-w-[140px]">{c.bancoPix}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-1 text-[11px]">
                  <button
                    onClick={() => toast.info(`Dossiê do colaborador ${c.nome} carregado (Contrato de Trabalho, CNH e ASO).`)}
                    className="px-2 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--line)] font-bold text-[var(--ink)] flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-[var(--salmon)]" />
                    Dossiê
                  </button>
                  <button
                    onClick={() => toast.success(`Adiantamento quinzenal de 40% gerado para ${c.nome}.`)}
                    className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                  >
                    Adiantamento
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FOLHA DE PAGAMENTO & HOLERITE DIGITAL */}
      {subAba === "folha" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Folha de Pagamento &amp; Holerites Digitais (Novembro/2026)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Cálculo de Proventos, Insalubridade Grau Médio 20%, Adicional Noturno, DSR, Rateio Gorjeta e Descontos Legais (INSS / IRRF)
              </p>
            </div>
            <button
              onClick={() => toast.success("Remessa bancária CNAB 240 de pagamento de salários gerada para o Sicredi!")}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Gerar Remessa CNAB 240 (Sicredi)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Colaborador / Cargo</th>
                  <th className="py-2.5 px-3">Salário Base</th>
                  <th className="py-2.5 px-3">Adicionais (Insalub./HE/DSR)</th>
                  <th className="py-2.5 px-3 text-red-500">Descontos (INSS/IRRF)</th>
                  <th className="py-2.5 px-3 text-emerald-600">Gorjeta + Comissões</th>
                  <th className="py-2.5 px-3 font-bold text-[var(--ink)]">Salário Líquido</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {folhaNovembro.map((f) => (
                  <tr key={f.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="py-3 px-3">
                      <strong className="block text-[var(--ink)]">{f.colaborador}</strong>
                      <span className="text-[11px] text-[var(--muted)]">{f.cargo}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{formatBrl(f.base)}</td>
                    <td className="py-3 px-3 font-mono text-[var(--muted)]">
                      +{formatBrl(f.insalubridade + f.horasExtras + f.dSR)}
                    </td>
                    <td className="py-3 px-3 font-mono text-red-500">
                      -{formatBrl(f.inss + f.irrf)}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 font-bold">
                      +{formatBrl(f.rateioGorjeta + f.comissao)}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-sm text-[var(--ink)]">
                      {formatBrl(f.liquido)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                        {f.statusHolerite}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setHoleriteVisualizando(f)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] hover:text-[var(--salmon)] font-bold transition-all inline-flex items-center gap-1"
                          title="Visualizar Contracheque Oficial"
                        >
                          <Printer className="w-3 h-3" />
                          Contracheque
                        </button>
                        <button
                          onClick={() => enviarHoleriteWhats(f.colaborador)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--salmon)]/10 text-[var(--salmon)] hover:bg-[var(--salmon)] hover:text-white font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SIMULADOR DE RATEIO DE GORJETA 10% (LEI Nº 13.419) */}
      {subAba === "rateio" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <span>Simulador de Rateio de Gorjeta 10% da Brigada (Lei da Gorjeta nº 13.419)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Distribuição ponderada por sistema de pontos entre a equipe de atendimento (salão, sushibar e copa)
              </p>
            </div>
            <button
              onClick={() => toast.success("Relatório de apuração de gorjeta aprovado pela comissão de colaboradores!")}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              Homologar Rateio do Turno
            </button>
          </div>

          {/* Cards de Resumo da Gorjeta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Arrecadação Bruta Gorjeta</span>
              <span className="text-base font-black font-mono text-[var(--ink)]">{formatBrl(14850.00)}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">10% serviço mesas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-[10px] text-red-700 dark:text-red-300 uppercase font-mono block">(-) Retenção Encargos (20%)</span>
              <span className="text-base font-black font-mono text-red-600">-{formatBrl(2970.00)}</span>
              <span className="text-[10px] text-red-600 font-bold block mt-0.5">Previdência &amp; FGTS legal</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-mono block">(=) Montante Líquido Rateado</span>
              <span className="text-base font-black font-mono text-emerald-600">{formatBrl(11880.00)}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">80% distribuído</span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 uppercase font-mono block">Valor por Ponto da Brigada</span>
              <span className="text-base font-black font-mono text-indigo-600">{formatBrl(660.00)}</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Total de 18.0 pontos</span>
            </div>
          </div>

          {/* Tabela de Rateio por Colaborador */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2 px-3">Colaborador</th>
                  <th className="py-2 px-3">Função / Categoria</th>
                  <th className="py-2 px-3 text-center">Pontuação</th>
                  <th className="py-2 px-3 font-mono text-center">Horas Turno</th>
                  <th className="py-2 px-3 text-right font-black text-emerald-600">Valor Líquido Rateado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {rateioGorjetaEquipe.map((rg, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface2)]/50">
                    <td className="py-2.5 px-3 font-bold text-[var(--ink)]">{rg.colaborador}</td>
                    <td className="py-2.5 px-3 text-[var(--muted)]">{rg.cargo}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 font-mono font-bold">
                        {rg.pontos.toFixed(1)} pts
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[var(--muted)]">{rg.horasMes}h</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-emerald-600">
                      {formatBrl(rg.valorLiquido)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COMISSÕES & METAS DA BRIGADA */}
      {subAba === "comissoes" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Percent className="w-5 h-5 text-[var(--salmon)]" />
                <span>Apuração de Comissões &amp; Bonificação Progressiva</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Rateio Salão Parceiro (Lei 13.352/2016) e Comissionamento por Metas de Pratos Especiais &amp; Salão
              </p>
            </div>
            <button
              onClick={() => toast.success("Relatório de comissões exportado para fechamento contábil e extrato de prestador!")}
              className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Download className="w-4 h-4" />
              Exportar Extrato de Comissões
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comissoesBrigada.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-[var(--ink)]">{c.profissional}</h5>
                    <span className="text-[11px] text-[var(--muted)]">{c.modulo} · {c.tipo}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Meta Atingida
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[var(--line)] font-mono">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Faturado Bruto</span>
                    <strong className="text-[var(--ink)]">{formatBrl(c.faturadoBruto)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Taxa Rateio</span>
                    <strong className="text-[var(--salmon)]">{c.pctRateio}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase block">Comissão Líquida</span>
                    <strong className="text-emerald-600 font-black">{formatBrl(c.valorComissao + c.bonusMeta)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ESPELHO DE PONTO PORTARIA 671 MTE */}
      {subAba === "ponto" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Ponto Eletrônico Digital (REP-P · Portaria 671/2021 MTE)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Registro com geolocalização antifraude e reconhecimento facial</p>
            </div>
            <button
              onClick={baterPonto}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              Bater Ponto Agora (Biometria)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Colaborador</th>
                  <th className="py-2 px-3">Entrada</th>
                  <th className="py-2 px-3">Almoço (Ida / Volta)</th>
                  <th className="py-2 px-3">Saída</th>
                  <th className="py-2 px-3 text-emerald-600">Saldo Dia</th>
                  <th className="py-2 px-3">Ocorrência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                {registrosPonto.map((r, i) => (
                  <tr key={i} className="hover:bg-[var(--surface2)]">
                    <td className="py-2.5 px-3 font-bold text-[var(--ink)]">{r.data}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-[var(--ink)]">{r.colaborador}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">{r.entrada}</td>
                    <td className="py-2.5 px-3 text-[var(--muted)]">{r.intervaloIda} - {r.intervaloVolta}</td>
                    <td className="py-2.5 px-3 font-bold text-[var(--ink)]">{r.saida}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-black">{r.saldoDia}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface2)] border border-[var(--line)] font-bold text-[var(--ink)]">
                        {r.ocorrencia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SAÚDE OCUPACIONAL & TREINAMENTOS */}
      {subAba === "aso" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Saúde Ocupacional (PCMSO / PGR) &amp; Boas Práticas ANVISA</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Controle de Atestados de Saúde Ocupacional (ASO), Carteira de Vacinação, EPIs e Certificados RDC 216 ANVISA
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--ink)]">ASO Periódico da Brigada</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">100% em Dia</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Exames clínicos e coprocultura de todos os manipuladores de alimentos válidos até Outubro/2027.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--ink)]">Curso Boas Práticas ANVISA (RDC 216)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">Certificado Ativo</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Treinamento de higienização de pescados crus e segurança do Shari ministrado para toda a equipe.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--ink)]">Ficha de Entrega de EPIs</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">Assinada Digitalmente</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Aventais térmicos para câmara fria (-20°C), luvas de malha de aço para corte e botas antiderrapantes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE HOLERITE DIGITAL INDIVIDUAL ANALÍTICO */}
      {holeriteVisualizando && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-indigo-600" />
                <span className="font-mono text-xs font-bold text-[var(--muted)]">DEMONSTRATIVO DE PAGAMENTO DE SALÁRIO</span>
              </div>
              <button
                onClick={() => setHoleriteVisualizando(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout do Contracheque Oficial */}
            <div className="border border-[var(--line)] rounded-2xl p-6 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 space-y-4">
              {/* Header da Empresa */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div>
                  <div className="text-base font-black tracking-tight text-[var(--salmon)]">ZUMA GASTRONOMIA LTDA</div>
                  <div className="text-[10px] font-mono text-neutral-500">CNPJ: 36.296.848/0001-57 · Tangará da Serra - MT</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-neutral-500">RECIBO DE PAGAMENTO</div>
                  <div className="text-sm font-black font-mono">COMPETÊNCIA: 11/2026</div>
                </div>
              </div>

              {/* Dados do Colaborador */}
              <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Colaborador</span>
                  <strong className="block truncate">{holeriteVisualizando.colaborador}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Cargo / CBO</span>
                  <strong className="block truncate">{holeriteVisualizando.cargo}</strong>
                  <span className="text-[9px] font-mono text-neutral-400">{holeriteVisualizando.cbo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">PIS / PASEP</span>
                  <strong className="font-mono block text-[11px]">{holeriteVisualizando.pis}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Admissão</span>
                  <strong className="font-mono block">{holeriteVisualizando.admissao}</strong>
                </div>
              </div>

              {/* Tabela de Rubricas (Vencimentos e Descontos) */}
              <div className="space-y-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-500">
                      <th className="py-1 text-left">Cód / Rubrica</th>
                      <th className="py-1 text-left">Referência</th>
                      <th className="py-1 text-right text-emerald-600">Vencimentos</th>
                      <th className="py-1 text-right text-red-500">Descontos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:border-neutral-800 font-mono">
                    <tr>
                      <td className="py-1.5 text-left font-sans font-medium">001 - Salário Base Mensal</td>
                      <td className="py-1.5 text-left">30 dias</td>
                      <td className="py-1.5 text-right font-bold">{formatBrl(holeriteVisualizando.base)}</td>
                      <td className="py-1.5 text-right">--</td>
                    </tr>
                    {holeriteVisualizando.insalubridade > 0 && (
                      <tr>
                        <td className="py-1.5 text-left font-sans font-medium">014 - Insalubridade Grau Médio</td>
                        <td className="py-1.5 text-left">20% Sal. Mínimo</td>
                        <td className="py-1.5 text-right font-bold">{formatBrl(holeriteVisualizando.insalubridade)}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                    )}
                    {holeriteVisualizando.horasExtras > 0 && (
                      <tr>
                        <td className="py-1.5 text-left font-sans font-medium">025 - Horas Extras Noturnas</td>
                        <td className="py-1.5 text-left">50% s/ Hora</td>
                        <td className="py-1.5 text-right font-bold">{formatBrl(holeriteVisualizando.horasExtras)}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                    )}
                    {holeriteVisualizando.dSR > 0 && (
                      <tr>
                        <td className="py-1.5 text-left font-sans font-medium">030 - DSR s/ Horas Extras</td>
                        <td className="py-1.5 text-left">Repouso Remun.</td>
                        <td className="py-1.5 text-right font-bold">{formatBrl(holeriteVisualizando.dSR)}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                    )}
                    {holeriteVisualizando.rateioGorjeta > 0 && (
                      <tr>
                        <td className="py-1.5 text-left font-sans font-medium">080 - Rateio de Gorjeta (Lei 13.419)</td>
                        <td className="py-1.5 text-left">Pontos Salão</td>
                        <td className="py-1.5 text-right font-bold text-emerald-600">{formatBrl(holeriteVisualizando.rateioGorjeta)}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                    )}
                    {holeriteVisualizando.comissao > 0 && (
                      <tr>
                        <td className="py-1.5 text-left font-sans font-medium">085 - Comissões de Metas</td>
                        <td className="py-1.5 text-left">Produção</td>
                        <td className="py-1.5 text-right font-bold text-emerald-600">{formatBrl(holeriteVisualizando.comissao)}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1.5 text-left font-sans font-medium">501 - Previdência Social (INSS)</td>
                      <td className="py-1.5 text-left">Tabela Progressiva</td>
                      <td className="py-1.5 text-right">--</td>
                      <td className="py-1.5 text-right text-red-500 font-bold">{formatBrl(holeriteVisualizando.inss)}</td>
                    </tr>
                    {holeriteVisualizando.irrf > 0 && (
                      <tr>
                        <td className="py-1.5 text-left font-sans font-medium">505 - Imposto de Renda Retido (IRRF)</td>
                        <td className="py-1.5 text-left">Alíq. Efetiva</td>
                        <td className="py-1.5 text-right">--</td>
                        <td className="py-1.5 text-right text-red-500 font-bold">{formatBrl(holeriteVisualizando.irrf)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totalizador Líquido */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono">Valor Líquido Creditado via Pix</span>
                  <span className="text-xl font-black font-mono text-emerald-600">{formatBrl(holeriteVisualizando.liquido)}</span>
                </div>
                <div className="text-right text-[10px] font-mono text-neutral-500 space-y-0.5">
                  <div>Base INSS: {formatBrl(holeriteVisualizando.base + holeriteVisualizando.insalubridade)}</div>
                  <div>Base FGTS: {formatBrl(holeriteVisualizando.base + holeriteVisualizando.insalubridade)} · FGTS do Mês (8%): {formatBrl((holeriteVisualizando.base + holeriteVisualizando.insalubridade) * 0.08)}</div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:text-[var(--salmon)] flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Contracheque
              </button>

              <button
                onClick={() => {
                  toast.success(`Holerite de ${holeriteVisualizando.colaborador} enviado via WhatsApp e e-mail.`);
                }}
                className="px-4 py-2.5 rounded-xl bg-[var(--salmon)] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                Enviar para o Colaborador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
