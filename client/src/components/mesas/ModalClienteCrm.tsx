import React, { useState } from "react";
import { 
  Users, 
  X, 
  Sparkles, 
  Gift, 
  Clock, 
  Receipt, 
  Heart, 
  ShieldAlert, 
  Phone, 
  Mail, 
  CreditCard, 
  CheckCircle2, 
  Search, 
  Plus, 
  FileText, 
  DollarSign,
  Award,
  ChevronRight,
  Fish,
  UtensilsCrossed,
  Check
} from "lucide-react";
import { formatBrl } from "../../../../shared/zumaData";
import { toast } from "sonner";

export interface ClienteCrmDetalhado {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  aniversario: string;
  segmento: "vip" | "fiel" | "regular" | "novo";
  restricoesAlimentares: string[];
  peixesFavoritos: string[];
  nivelWasabi: "nenhum" | "suave" | "moderado" | "picante";
  bebidaFavorita: string;
  cashbackDisponivel: number;
  totalVisitas: number;
  totalGastoHistorico: number;
  ticketMedioHistorico: number;
  historicoPedidos: {
    id: string;
    data: string;
    comandaNum: number;
    itensResumo: string;
    valorTotal: number;
    formaPagamento: string;
    garcom: string;
  }[];
}

export const BASE_CLIENTES_DEMO: ClienteCrmDetalhado[] = [
  {
    id: "cli_1",
    nome: "Rodrigo Ribeiro Gonçalves",
    cpf: "042.889.311-04",
    telefone: "(65) 99812-4011",
    email: "rodrigo@kytto.com.br",
    aniversario: "14/08",
    segmento: "vip",
    restricoesAlimentares: [],
    peixesFavoritos: ["Salmão Fresco", "Atum Nobre", "Sashimi Trufado"],
    nivelWasabi: "picante",
    bebidaFavorita: "Kirin Ichiban 600ml & Saquê Dourado Junmai",
    cashbackDisponivel: 142.50,
    totalVisitas: 18,
    totalGastoHistorico: 4890.00,
    ticketMedioHistorico: 271.66,
    historicoPedidos: [
      {
        id: "ped_1",
        data: "20/11/2026",
        comandaNum: 88,
        itensResumo: "Barca Especial 50 pçs + Hot Filadélfia (12 pçs) + Saquê Junmai",
        valorTotal: 274.00,
        formaPagamento: "Sicredi Pix Direto",
        garcom: "Matheus Lima"
      },
      {
        id: "ped_2",
        data: "14/11/2026",
        comandaNum: 62,
        itensResumo: "Combinado Salmão Lovers + Sashimi Trufado + Kirin Ichiban",
        valorTotal: 169.90,
        formaPagamento: "Cartão de Crédito Sicredi",
        garcom: "Sofia Rezende"
      },
      {
        id: "ped_3",
        data: "06/11/2026",
        comandaNum: 41,
        itensResumo: "Degustação Omakase 10 Passos do Chef + Garrafa Saquê",
        valorTotal: 380.00,
        formaPagamento: "Sicredi Pix Direto",
        garcom: "Hiroshi Tanaka"
      }
    ]
  },
  {
    id: "cli_2",
    nome: "Família Barbosa",
    cpf: "582.114.908-22",
    telefone: "(65) 99654-7721",
    email: "barbosa.agro@gmail.com",
    aniversario: "28/11", // Aniversariante da semana!
    segmento: "fiel",
    restricoesAlimentares: ["Crianças na mesa: sem pimenta e sem wasabi", "Preferência por empanados e cozidos"],
    peixesFavoritos: ["Salmão Grelhado", "Hot Filadélfia Crocante", "Uramaki Filadélfia"],
    nivelWasabi: "nenhum",
    bebidaFavorita: "Sucos Naturais de Laranja & Kirin Ichiban",
    cashbackDisponivel: 48.00,
    totalVisitas: 7,
    totalGastoHistorico: 1980.00,
    ticketMedioHistorico: 282.85,
    historicoPedidos: [
      {
        id: "ped_4",
        data: "15/11/2026",
        comandaNum: 74,
        itensResumo: "Combinado Salmão Lovers + 2x Hot Filadélfia + 2x Água San Pellegrino",
        valorTotal: 286.00,
        formaPagamento: "Sicredi Pix Direto",
        garcom: "Matheus Lima"
      },
      {
        id: "ped_5",
        data: "02/11/2026",
        comandaNum: 29,
        itensResumo: "Barca Especial 50 pçs + Teppan de Frango Kids + 3x Sucos",
        valorTotal: 320.00,
        formaPagamento: "Cartão Débito",
        garcom: "Matheus Lima"
      }
    ]
  },
  {
    id: "cli_3",
    nome: "Dr. Marcelo & Amigos",
    cpf: "318.992.401-85",
    telefone: "(65) 99981-3344",
    email: "marcelo.med@unimedmt.com.br",
    aniversario: "03/04",
    segmento: "vip",
    restricoesAlimentares: ["1 pessoa com alergia severa a camarão/crustáceos"],
    peixesFavoritos: ["Sashimi Salmão Fresco", "Atum Maçaricado", "Niguiri Salmão"],
    nivelWasabi: "moderado",
    bebidaFavorita: "Cerveja Kirin Ichiban & Gin Tônica",
    cashbackDisponivel: 94.00,
    totalVisitas: 11,
    totalGastoHistorico: 3420.00,
    ticketMedioHistorico: 310.90,
    historicoPedidos: [
      {
        id: "ped_6",
        data: "18/11/2026",
        comandaNum: 91,
        itensResumo: "Especial Zuma 68 pçs + 4x Kirin Ichiban + Sunomono",
        valorTotal: 342.00,
        formaPagamento: "Sicredi Pix Direto",
        garcom: "Sofia Rezende"
      }
    ]
  },
  {
    id: "cli_4",
    nome: "Letícia & Pedro",
    cpf: "812.304.551-12",
    telefone: "(65) 99871-0022",
    email: "leticia.pedro@gmail.com",
    aniversario: "19/09",
    segmento: "regular",
    restricoesAlimentares: ["Dieta Low-Carb (Sem Arroz Doce / Sem Açúcar)"],
    peixesFavoritos: ["Sashimi Salmão", "Sunomono Especial", "Sashimi Tataki"],
    nivelWasabi: "suave",
    bebidaFavorita: "Chá Gelado com Limão Siciliano & Água com Gás",
    cashbackDisponivel: 32.50,
    totalVisitas: 4,
    totalGastoHistorico: 820.00,
    ticketMedioHistorico: 205.00,
    historicoPedidos: [
      {
        id: "ped_7",
        data: "12/11/2026",
        comandaNum: 55,
        itensResumo: "Fit 22 Peças + Ceviche Peruano + 2x Chá Gelado",
        valorTotal: 185.00,
        formaPagamento: "Cartão de Crédito",
        garcom: "Sofia Rezende"
      }
    ]
  }
];

interface ModalClienteCrmProps {
  isOpen: boolean;
  onClose: () => void;
  mesaNumero: number;
  clienteAtualNome?: string;
  onVincularCliente: (cliente: ClienteCrmDetalhado) => void;
  onAplicarCashback: (valorCashback: number) => void;
}

export const ModalClienteCrm: React.FC<ModalClienteCrmProps> = ({
  isOpen,
  onClose,
  mesaNumero,
  clienteAtualNome,
  onVincularCliente,
  onAplicarCashback
}) => {
  // Inicializa com o cliente correspondente ou o primeiro da lista
  const [clienteAtivo, setClienteAtivo] = useState<ClienteCrmDetalhado>(() => {
    if (clienteAtualNome) {
      const achado = BASE_CLIENTES_DEMO.find(c => 
        clienteAtualNome.toLowerCase().includes(c.nome.toLowerCase()) || 
        c.nome.toLowerCase().includes(clienteAtualNome.toLowerCase())
      );
      if (achado) return achado;
    }
    return BASE_CLIENTES_DEMO[0];
  });

  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<"perfil" | "historico" | "novo_cliente">("perfil");

  // Form de Novo Cliente
  const [novoNome, setNovoNome] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novasRestricoes, setNovasRestricoes] = useState("");
  const [novoPeixe, setNovoPeixe] = useState("Salmão Fresco");

  if (!isOpen) return null;

  const clientesFiltrados = BASE_CLIENTES_DEMO.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf.includes(busca) ||
    c.telefone.includes(busca)
  );

  const handleSalvarNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      toast.error("Informe pelo menos o nome do cliente.");
      return;
    }

    const recemCriado: ClienteCrmDetalhado = {
      id: `cli_${Date.now()}`,
      nome: novoNome.trim(),
      cpf: novoCpf.trim() || "000.000.000-00",
      telefone: novoTelefone.trim() || "(65) 99999-0000",
      email: novoEmail.trim() || "cliente@zuma.com.br",
      aniversario: "Não informado",
      segmento: "novo",
      restricoesAlimentares: novasRestricoes ? [novasRestricoes] : [],
      peixesFavoritos: [novoPeixe],
      nivelWasabi: "suave",
      bebidaFavorita: "Água / Cerveja",
      cashbackDisponivel: 15.00, // Bônus de boas-vindas do Clube Zumi
      totalVisitas: 1,
      totalGastoHistorico: 0,
      ticketMedioHistorico: 0,
      historicoPedidos: []
    };

    setClienteAtivo(recemCriado);
    onVincularCliente(recemCriado);
    toast.success(`Cliente ${recemCriado.nome} cadastrado e vinculado à Mesa #${mesaNumero}!`, {
      description: "Bônus de R$ 15,00 de cashback de boas-vindas creditado no Clube Zumi."
    });
    setAbaAtiva("perfil");
  };

  const handleAplicarCashbackConta = () => {
    if (clienteAtivo.cashbackDisponivel <= 0) {
      toast.error("Cliente não possui saldo de cashback disponível no Clube Zumi.");
      return;
    }
    onAplicarCashback(clienteAtivo.cashbackDisponivel);
    toast.success(`Cashback de R$ ${clienteAtivo.cashbackDisponivel.toFixed(2)} aplicado na conta!`, {
      description: `Abatimento efetuado para ${clienteAtivo.nome}.`
    });
  };

  const isAniversarianteMes = clienteAtivo.aniversario.includes("/11"); // Novembro

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] text-[var(--ink)] w-full max-w-4xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  CRM &amp; Perfil Completo do Cliente
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
                  Mesa #{mesaNumero}
                </span>
                {isAniversarianteMes && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <Gift className="w-3 h-3" /> Aniversariante do Mês!
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">
                Preferências gastronômicas, restrições alimentares, histórico de visitas e Clube Zumi Fidelidade.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas e Busca Rápida de Clientes */}
        <div className="p-4 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)]">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === "perfil"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Perfil &amp; Preferências</span>
            </button>
            <button
              onClick={() => setAbaAtiva("historico")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === "historico"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Histórico de Pedidos ({clienteAtivo.historicoPedidos.length})</span>
            </button>
            <button
              onClick={() => setAbaAtiva("novo_cliente")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === "novo_cliente"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo</span>
            </button>
          </div>

          {/* Trocar Cliente Rápido */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar cliente na base..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-semibold w-52"
              />
            </div>
            {busca && (
              <div className="absolute top-28 right-8 z-50 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xl p-2 w-72 max-h-60 overflow-y-auto">
                {clientesFiltrados.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setClienteAtivo(c);
                      onVincularCliente(c);
                      setBusca("");
                      toast.success(`Cliente ${c.nome} vinculado à Mesa #${mesaNumero}!`);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-[var(--surface2)] text-xs font-semibold block"
                  >
                    <p className="font-bold text-[var(--ink)]">{c.nome}</p>
                    <span className="text-[10px] text-[var(--muted)]">{c.telefone} · {c.segmento.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {abaAtiva === "perfil" && (
            <div className="space-y-5">
              {/* Card Resumo do Cliente com Métricas */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-orange-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                    {clienteAtivo.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-[var(--ink)]">{clienteAtivo.nome}</h2>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black uppercase ${
                        clienteAtivo.segmento === "vip" ? "bg-amber-500 text-black font-extrabold" :
                        clienteAtivo.segmento === "fiel" ? "bg-emerald-500/20 text-emerald-600" :
                        "bg-blue-500/20 text-blue-600"
                      }`}>
                        {clienteAtivo.segmento}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      CPF: <span className="font-mono">{clienteAtivo.cpf}</span> · Tel/Whats: <span className="font-mono">{clienteAtivo.telefone}</span>
                    </p>
                  </div>
                </div>

                {/* Saldo de Cashback e Botão de Resgate */}
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-indigo-500/30 flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shadow-2xs">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] font-bold block uppercase tracking-wider">
                      Clube Zumi Cashback
                    </span>
                    <strong className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                      R$ {clienteAtivo.cashbackDisponivel.toFixed(2)}
                    </strong>
                  </div>
                  <button
                    onClick={handleAplicarCashbackConta}
                    disabled={clienteAtivo.cashbackDisponivel <= 0}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Abater na Mesa</span>
                  </button>
                </div>
              </div>

              {/* Grid de 4 Métricas RFM */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold block uppercase">Total de Visitas</span>
                  <div className="text-lg font-black font-mono mt-0.5">{clienteAtivo.totalVisitas} visitas</div>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold block uppercase">LTV (Gasto Histórico)</span>
                  <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatBrl(clienteAtivo.totalGastoHistorico)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold block uppercase">Ticket Médio</span>
                  <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                    {formatBrl(clienteAtivo.ticketMedioHistorico)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] font-bold block uppercase">Aniversário</span>
                  <div className="text-lg font-black font-mono mt-0.5">{clienteAtivo.aniversario}</div>
                </div>
              </div>

              {/* Preferências Gastronômicas & Alergias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alergias & Restrições */}
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Restrições Alimentares &amp; Alergias</span>
                  </div>
                  {clienteAtivo.restricoesAlimentares.length === 0 ? (
                    <p className="text-xs text-[var(--muted)] italic">Nenhuma alergia ou restrição declarada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {clienteAtivo.restricoesAlimentares.map((rest, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 font-bold text-[11px]">
                          ⚠ {rest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Peixes & Cortes Favoritos */}
                <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                    <Fish className="w-4 h-4" />
                    <span>Peixes &amp; Cortes Preferidos</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {clienteAtivo.peixesFavoritos.map((peixe, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                        ★ {peixe}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nível de Wasabi */}
                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--muted)] block uppercase">
                    Nível de Wasabi / Picância
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs capitalize text-emerald-600 dark:text-emerald-400">
                      {clienteAtivo.nivelWasabi}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">· Preparar com dosagem compatível no sushibar</span>
                  </div>
                </div>

                {/* Bebida Habitual */}
                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--muted)] block uppercase">
                    Bebida Habitual do Cliente
                  </span>
                  <div className="font-bold text-xs text-[var(--ink)]">
                    {clienteAtivo.bebidaFavorita}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba de Histórico de Pedidos Anteriores */}
          {abaAtiva === "historico" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs text-[var(--muted)]">
                <span>Histórico de pedidos presenciais e delivery de {clienteAtivo.nome}</span>
                <span>Total de {clienteAtivo.historicoPedidos.length} pedidos registrados</span>
              </div>

              {clienteAtivo.historicoPedidos.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--muted)]">
                  Nenhum pedido anterior registrado para este cliente.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {clienteAtivo.historicoPedidos.map(ped => (
                    <div key={ped.id} className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface2)]/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">#{ped.comandaNum}</span>
                          <span className="text-[10px] text-[var(--muted)] font-mono">{ped.data}</span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                            Garçom: {ped.garcom}
                          </span>
                        </div>
                        <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {formatBrl(ped.valorTotal)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--ink)]">
                        {ped.itensResumo}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted)] pt-1 border-t border-[var(--line)]/50">
                        <span>Pagamento: {ped.formaPagamento}</span>
                        <span className="text-emerald-600 font-bold">NFC-e Autorizada SEFAZ-MT</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aba de Cadastro de Novo Cliente */}
          {abaAtiva === "novo_cliente" && (
            <form onSubmit={handleSalvarNovoCliente} className="space-y-4 max-w-xl mx-auto">
              <div>
                <h4 className="text-sm font-black text-[var(--ink)]">Novo Cadastro de Cliente</h4>
                <p className="text-xs text-[var(--muted)]">Cadastro ágil no salão para emissão de NFC-e com CPF e adesão ao Clube Zumi.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Camila Guimarães"
                    value={novoNome}
                    onChange={e => setNovoNome(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">CPF na Nota (SEFAZ-MT)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={novoCpf}
                    onChange={e => setNovoCpf(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    placeholder="(65) 99999-0000"
                    value={novoTelefone}
                    onChange={e => setNovoTelefone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={novoEmail}
                    onChange={e => setNovoEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]"
                  />
                </div>
              </div>

              <div className="text-xs space-y-2">
                <label className="font-bold block">Alergias ou Restrições Alimentares</label>
                <input
                  type="text"
                  placeholder="Ex: Alergia a camarão, sem lactose, celíaco (sem glúten)..."
                  value={novasRestricoes}
                  onChange={e => setNovasRestricoes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)]"
                />
              </div>

              <div className="text-xs space-y-2">
                <label className="font-bold block">Peixe / Corte Favorito</label>
                <select
                  value={novoPeixe}
                  onChange={e => setNovoPeixe(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-semibold"
                >
                  <option value="Salmão Fresco">Salmão Fresco</option>
                  <option value="Salmão Maçaricado Trufado">Salmão Maçaricado Trufado</option>
                  <option value="Atum Nobre">Atum Nobre</option>
                  <option value="Hot Filadélfia">Hot Filadélfia</option>
                  <option value="Peixe Branco da Região">Peixe Branco da Região</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setAbaAtiva("perfil")}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Cadastrar &amp; Vincular à Mesa #{mesaNumero}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Cliente ativo: <strong>{clienteAtivo.nome}</strong> · Sincronizado com CRM &amp; SEFAZ-MT</span>
          </div>

          <button
            onClick={() => {
              onVincularCliente(clienteAtivo);
              onClose();
              toast.success(`Cliente ${clienteAtivo.nome} confirmado para a Mesa #${mesaNumero}!`);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
          >
            <span>Confirmar Cliente na Mesa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModalClienteCrm;
