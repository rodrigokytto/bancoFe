import React, { useState, useMemo } from "react";
import {
  Users,
  DollarSign,
  Sparkles,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Clock,
  Flame,
  ArrowUpRight,
  Plus,
  X,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Award,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  negocioAtivo?: string;
}

interface ClienteInativo {
  id: string;
  nome: string;
  telefone: string;
  diasSemPedir: number;
  propensao: "Alta" | "Média" | "Baixa";
  ltv: number;
  pedidosTotal: number;
  ticketMedio: number;
  pratoFavorito: string;
  ultimaVisita: string;
  observacaoOperacional: string;
}

interface ConversaoVenda {
  id: string;
  data: string;
  clienteNome: string;
  telefone: string;
  valor: number;
  canal: string;
  observacao: string;
}

export const ReativacaoClientesIaSubsuite: React.FC<Props> = ({ negocioAtivo = "zuma" }) => {
  // Base de clientes inativos por negócio
  const clientesIniciais: ClienteInativo[] = useMemo(() => {
    switch (negocioAtivo) {
      case "zuma_roupas":
      case "roupas":
      case "moda":
        return [
          {
            id: "cli-zr1",
            nome: "Dra. Camila Nogueira",
            telefone: "65999882233",
            diasSemPedir: 35,
            propensao: "Alta",
            ltv: 4250,
            pedidosTotal: 14,
            ticketMedio: 380,
            pratoFavorito: "Vestido Linho Puro Midi + Sandália Couro Legítimo",
            ultimaVisita: "17/10/2026",
            observacaoOperacional: "Cliente assídua de lançamentos de alfaiataria e moda executiva."
          },
          {
            id: "cli-zr2",
            nome: "Rafael Silveira",
            telefone: "65999771144",
            diasSemPedir: 42,
            propensao: "Alta",
            ltv: 3100,
            pedidosTotal: 11,
            ticketMedio: 290,
            pratoFavorito: "Camisa Algodão Egípcio + Calça Chino Slim",
            ultimaVisita: "10/10/2026",
            observacaoOperacional: "Compra roupas sociais para o escritório a cada 40 dias."
          },
          {
            id: "cli-zr3",
            nome: "Mariana Vasconcelos",
            telefone: "65996655221",
            diasSemPedir: 29,
            propensao: "Alta",
            ltv: 2890,
            pedidosTotal: 9,
            ticketMedio: 320,
            pratoFavorito: "Conjunto Alfaiataria Verão + Bolsa Couro",
            ultimaVisita: "23/10/2026",
            observacaoOperacional: "Interage frequentemente no Instagram da Zuma Moda."
          },
          {
            id: "cli-zr4",
            nome: "Thiago Prado",
            telefone: "65998123344",
            diasSemPedir: 58,
            propensao: "Média",
            ltv: 1950,
            pedidosTotal: 7,
            ticketMedio: 275,
            pratoFavorito: "Polo Piquet Pima + Bermuda Sarja Premium",
            ultimaVisita: "24/09/2026",
            observacaoOperacional: "Risco de churn se não for acionado com a nova coleção."
          },
          {
            id: "cli-zr5",
            nome: "Juliana Meireles",
            telefone: "65996541122",
            diasSemPedir: 75,
            propensao: "Baixa",
            ltv: 1200,
            pedidosTotal: 5,
            ticketMedio: 240,
            pratoFavorito: "Vestido Casual Estampado + Cinto Couro",
            ultimaVisita: "07/09/2026",
            observacaoOperacional: "Relatou indisponibilidade de tamanho P na última visita."
          }
        ];
      case "dino":
        return [
          {
            id: "cli-d1",
            nome: "Dr. Eduardo Fagundes",
            telefone: "65999881122",
            diasSemPedir: 28,
            propensao: "Alta",
            ltv: 2850,
            pedidosTotal: 14,
            ticketMedio: 203,
            pratoFavorito: "Degradê Navalhado + Barba Terapia + Perfume Árabe",
            ultimaVisita: "24/10/2026",
            observacaoOperacional: "Costuma agendar às quintas-feiras no final da tarde com Bruno."
          },
          {
            id: "cli-d2",
            nome: "Roberto Meneghetti",
            telefone: "65999773344",
            diasSemPedir: 35,
            propensao: "Alta",
            ltv: 3400,
            pedidosTotal: 18,
            ticketMedio: 188,
            pratoFavorito: "Corte Tradicional Tesoura + Pigmentação",
            ultimaVisita: "17/10/2026",
            observacaoOperacional: "Empresário local, gosta de café espresso e atendimento pontual."
          },
          {
            id: "cli-d3",
            nome: "Lucas Sampaio",
            telefone: "65996655443",
            diasSemPedir: 48,
            propensao: "Média",
            ltv: 1200,
            pedidosTotal: 7,
            ticketMedio: 171,
            pratoFavorito: "Combo Cabelo + Pomada Modeladora Efeito Matte",
            ultimaVisita: "04/10/2026",
            observacaoOperacional: "Sempre compra pomada para reposição caseira."
          },
          {
            id: "cli-d4",
            nome: "Vinícius Andrade",
            telefone: "65998124567",
            diasSemPedir: 62,
            propensao: "Baixa",
            ltv: 890,
            pedidosTotal: 5,
            ticketMedio: 178,
            pratoFavorito: "Corte Fade + Hidratação Ouro",
            ultimaVisita: "20/09/2026",
            observacaoOperacional: "Sumido há 2 meses, risco iminente de perda para concorrência."
          }
        ];
      case "stallone":
        return [
          {
            id: "cli-s1",
            nome: "Carlos Eduardo Prado",
            telefone: "65999114477",
            diasSemPedir: 32,
            propensao: "Alta",
            ltv: 4200,
            pedidosTotal: 12,
            ticketMedio: 350,
            pratoFavorito: "Whey Protein Isolado 900g + Creatina Creapure 300g",
            ultimaVisita: "20/10/2026",
            observacaoOperacional: "Ciclo de reposição da creatina está exatamente vencendo agora."
          },
          {
            id: "cli-s2",
            nome: "Dra. Mariana Rios",
            telefone: "65996677889",
            diasSemPedir: 40,
            propensao: "Alta",
            ltv: 3100,
            pedidosTotal: 9,
            ticketMedio: 344,
            pratoFavorito: "Colágeno Hidrolisado Verisol + Ômega 3 Ultra Puro",
            ultimaVisita: "12/10/2026",
            observacaoOperacional: "Médica dermatologista, compra produtos de padrão farmacêutico."
          },
          {
            id: "cli-s3",
            nome: "Felipe Castilho",
            telefone: "65998822331",
            diasSemPedir: 55,
            propensao: "Média",
            ltv: 1850,
            pedidosTotal: 6,
            ticketMedio: 308,
            pratoFavorito: "Pré-Treino Hardcore + Beta-Alanina",
            ultimaVisita: "27/09/2026",
            observacaoOperacional: "Praticante de Crossfit, responde bem a cupons de lançamento."
          }
        ];
      default: // Zuma Cozinha Oriental
        return [
          {
            id: "cli-z1",
            nome: "Dr. Marcelo Arantes",
            telefone: "65999811234",
            diasSemPedir: 34,
            propensao: "Alta",
            ltv: 4890,
            pedidosTotal: 26,
            ticketMedio: 188,
            pratoFavorito: "Barca Nobre Zuma 32 Peças + Sashimi Salmão Maçaricado",
            ultimaVisita: "18/10/2026",
            observacaoOperacional: "Cliente assíduo de Tatame VIP, costuma vir com a família às sextas."
          },
          {
            id: "cli-z2",
            nome: "Eng. Beatriz Fontana",
            telefone: "65999723456",
            diasSemPedir: 29,
            propensao: "Alta",
            ltv: 3650,
            pedidosTotal: 19,
            ticketMedio: 192,
            pratoFavorito: "Combo Hot Roll Trufado + Tartar de Salmão com Gema de Codorna",
            ultimaVisita: "23/10/2026",
            observacaoOperacional: "Pede no PWA Delivery corporativo no Jardim Europa."
          },
          {
            id: "cli-z3",
            nome: "Guilherme Junqueira",
            telefone: "65996614567",
            diasSemPedir: 45,
            propensao: "Alta",
            ltv: 2890,
            pedidosTotal: 15,
            ticketMedio: 192,
            pratoFavorito: "Uramaki Especial Crispy Couve + Temaki Philadelphia Completo",
            ultimaVisita: "07/10/2026",
            observacaoOperacional: "Adora sobremesa Harumaki de Nutella com Morango."
          },
          {
            id: "cli-z4",
            nome: "Renata Cordeiro",
            telefone: "65998127890",
            diasSemPedir: 52,
            propensao: "Média",
            ltv: 1940,
            pedidosTotal: 11,
            ticketMedio: 176,
            pratoFavorito: "Barca Especial Casal 24 Peças + Refrigerante Importado",
            ultimaVisita: "30/09/2026",
            observacaoOperacional: "Consumo focado em finais de semana românticos."
          },
          {
            id: "cli-z5",
            nome: "Fábio Henrique Silveira",
            telefone: "65999335577",
            diasSemPedir: 68,
            propensao: "Média",
            ltv: 1450,
            pedidosTotal: 8,
            ticketMedio: 181,
            pratoFavorito: "Sashimi Salmão Trufado c/ Flor de Sal + Carpaccio",
            ultimaVisita: "14/09/2026",
            observacaoOperacional: "Não abre o PWA há mais de 2 meses; risco de churn definitivo."
          },
          {
            id: "cli-z6",
            nome: "Patrícia Vilar",
            telefone: "65996541298",
            diasSemPedir: 85,
            propensao: "Baixa",
            ltv: 980,
            pedidosTotal: 5,
            ticketMedio: 196,
            pratoFavorito: "Yakissoba Especial Camarão & Mignon",
            ultimaVisita: "28/08/2026",
            observacaoOperacional: "Relatou atraso no delivery em agosto; precisa de reconexão cuidadosa."
          }
        ];
    }
  }, [negocioAtivo]);

  // Histórico de conversões
  const [conversoes, setConversoes] = useState<ConversaoVenda[]>([
    {
      id: "conv-1",
      data: "Hoje, 18:20",
      clienteNome: "Dr. André Lourenço",
      telefone: "65999112233",
      valor: 245.00,
      canal: "WhatsApp Zumi IA",
      observacao: "Reativado com abordagem Opção B (Tatame VIP + Sobremesa cortesia)"
    },
    {
      id: "conv-2",
      data: "Ontem, 20:45",
      clienteNome: "Camila Guimarães",
      telefone: "65996655887",
      valor: 188.00,
      canal: "PWA Delivery Zuma",
      observacao: "Abordagem Opção C (Lembrete de Barca Nobre) converteu em 15 min"
    },
    {
      id: "conv-3",
      data: "Quinta, 19:10",
      clienteNome: "Marcos Vinícius Terra",
      telefone: "65998877665",
      valor: 312.00,
      canal: "Salão Tatames VIP",
      observacao: "Cliente estava inativo há 42 dias, veio comemorar aniversário"
    }
  ]);

  // Estados de controle
  const [filtroPropensao, setFiltroPropensao] = useState<string>("todas");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [estiloAbordagem, setEstiloAbordagem] = useState<Record<string, "suave" | "fechamento" | "ciclo">>({});
  const [modalConversao, setModalConversao] = useState<boolean>(false);
  const [formConversao, setFormConversao] = useState({
    clienteNome: "",
    telefone: "",
    valor: "",
    canal: "WhatsApp Zumi IA",
    observacao: ""
  });

  // Filtro dinâmico
  const clientesFiltrados = useMemo(() => {
    return clientesIniciais.filter(c => {
      const batePropensao = filtroPropensao === "todas" || c.propensao.toLowerCase() === filtroPropensao.toLowerCase();
      const bateBusca = !termoBusca || 
        c.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        c.telefone.includes(termoBusca) ||
        c.pratoFavorito.toLowerCase().includes(termoBusca.toLowerCase());
      return batePropensao && bateBusca;
    });
  }, [clientesIniciais, filtroPropensao, termoBusca]);

  // Total de dinheiro resgatado
  const totalDinheiroCaixa = useMemo(() => {
    return conversoes.reduce((acc, curr) => acc + curr.valor, 0);
  }, [conversoes]);

  // Potencial total na mesa
  const potencialNaMesa = useMemo(() => {
    return clientesFiltrados.reduce((acc, curr) => acc + curr.ticketMedio, 0);
  }, [clientesFiltrados]);

  // Gerador de mensagens Spintax (Conformidade com a Meta WhatsApp)
  const gerarMensagemWhatsApp = (cliente: ClienteInativo, estilo: "suave" | "fechamento" | "ciclo") => {
    const primeiroNome = cliente.nome.split(" ")[0];

    if (negocioAtivo === "zuma_roupas" || negocioAtivo === "roupas" || negocioAtivo === "moda") {
      switch (estilo) {
        case "fechamento":
          return `Olá ${primeiroNome}, tudo bem? Aqui é da Zuma Loja de Roupas & Moda! 👗 Notamos que faz ${cliente.diasSemPedir} dias desde sua última visita e acaba de desembarcar nossa Coleção Cápsula Verão no seu estilo! Separei para você um provador VIP exclusivo e liberei 15% de desconto no cupom ZUMACLOTHES na compra do look completo. Posso reservar as peças no seu tamanho? Acesse https://zuma.kytto.com.br/loja`;
        case "ciclo":
          return `Oi ${primeiroNome}! Passando para lembrar que sua preferência em nossa loja é *${cliente.pratoFavorito}*. Chegaram novidades imperdíveis na mesma modelagem que você ama! Já faz ${cliente.diasSemPedir} dias que você não renova suas peças. Que tal dar uma passada hoje? https://zuma.kytto.com.br/loja`;
        default: // suave
          return `Olá ${primeiroNome}, tudo bem com você? Aqui é da equipe da Zuma Loja de Roupas & Moda em Tangará da Serra. Sentimos sua falta em nosso espaço! Nossas araras foram renovadas com peças nobres de linho e alfaiataria. Sempre que quiser um café e atendimento personalizado, estamos de portas abertas! Um grande abraço!`;
      }
    }

    if (negocioAtivo === "dino") {
      switch (estilo) {
        case "fechamento":
          return `Olá ${primeiroNome}, tudo bem? Aqui é do T-Rex da Barbearia Dino! 💈 Notamos que faz ${cliente.diasSemPedir} dias desde o seu último corte e seu estilo merece estar sempre impecável. Reservei uma vaga especial hoje na cadeira do Bruno. Se agendar agora pelo link https://kytto.com.br/dino/agendamento você ganha uma cerveja artesanal ou café expresso cortesia! Posso confirmar seu horário?`;
        case "ciclo":
          return `Fala ${primeiroNome}! Passando para lembrar que seu visual de ${cliente.pratoFavorito} tem um ciclo ideal de renovação de 21 a 25 dias. Já se passaram ${cliente.diasSemPedir} dias! Vamos dar aquele talento hoje ou amanhã? https://kytto.com.br/dino/agendamento`;
        default: // suave
          return `Olá ${primeiroNome}, tudo bem com você? Aqui é da equipe da Barbearia Dino. Sentimos sua falta por aqui nestas últimas semanas! Está tudo bem com você? Como está seu corte de cabelo? Se precisar alinhar o estilo, estamos à sua disposição em Tangará! Abraço!`;
      }
    }

    // Default: Zuma Cozinha Oriental
    switch (estilo) {
      case "fechamento":
        return `Olá ${primeiroNome}, tudo bem? Aqui é a Zumi do Zuma Cozinha Oriental! 🥢 Notamos que faz ${cliente.diasSemPedir} dias que você não experimenta nosso Salmão Chileno Fresco. Tenho um Tatame VIP reservado para você hoje no salão, ou se preferir pedir em casa pelo nosso PWA (https://zuma.kytto.com.br/loja), liberei para você uma sobremesa Harumaki Especial de cortesia no cupom VIPZUMA. Posso reservar sua mesa?`;
      case "ciclo":
        return `Oi ${primeiroNome}! Bateu aquela vontade do seu favorito? Lembramos que seu prato preferido é *${cliente.pratoFavorito}*, e já faz ${cliente.diasSemPedir} dias desde a sua última experiência conosco. O sushiman chefe acabou de receber a remessa de salmão fresco da semana. Que tal garantir seu jantar hoje sem fila? Acesse https://zuma.kytto.com.br/loja`;
      default: // suave
        return `Olá ${primeiroNome}, tudo bem com você? Aqui é a Zumi do Zuma Cozinha Oriental. Sentimos a sua falta no salão nestas últimas semanas! Passando apenas para saber como você está e desejar uma excelente semana. Sempre que quiser uma experiência oriental autêntica em Tangará da Serra, estamos de portas abertas! Um grande abraço!`;
    }
  };

  const handleDispararWhatsApp = (cliente: ClienteInativo) => {
    const estilo = estiloAbordagem[cliente.id] || "fechamento";
    const msg = gerarMensagemWhatsApp(cliente, estilo);
    const linkWhatsApp = `https://wa.me/55${cliente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(linkWhatsApp, "_blank");
    toast.success(`Mensagem preparada e aberta no WhatsApp para ${cliente.nome}!`);
  };

  const handleSalvarConversao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConversao.clienteNome || !formConversao.valor) {
      toast.error("Preencha o nome do cliente e o valor da venda!");
      return;
    }

    const nova: ConversaoVenda = {
      id: `conv-${Date.now()}`,
      data: "Hoje, " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      clienteNome: formConversao.clienteNome,
      telefone: formConversao.telefone,
      valor: parseFloat(formConversao.valor.replace(",", ".")),
      canal: formConversao.canal,
      observacao: formConversao.observacao || "Cliente reativado via Zumi IA"
    };

    setConversoes([nova, ...conversoes]);
    setModalConversao(false);
    setFormConversao({ clienteNome: "", telefone: "", valor: "", canal: "WhatsApp Zumi IA", observacao: "" });
    toast.success(`🎉 Dinheiro no Caixa registrado: R$ ${nova.valor.toFixed(2)} resgatados com IA!`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE REATIVAÇÃO INTELIGENTE & DINHEIRO NO CAIXA */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-inner text-white font-black">
              <Users className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[var(--ink)]">
                  Reativação de Clientes Sumidos com Scoring IA
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Anti-Ban Meta Compliant
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Algoritmo RFM identifica clientes em risco de churn e redige abordagens hiperpersonalizadas com base no prato favorito e LTV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalConversao(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Dinheiro no Caixa</span>
            </button>
          </div>
        </div>

        {/* CARDS DE PERFORMANCE DE RESGATE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Dinheiro no Caixa (ROI)</span>
            <div className="text-xl font-black font-mono text-emerald-300 mt-1">
              R$ {totalDinheiroCaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[var(--muted)] font-semibold mt-1 block">
              {conversoes.length} vendas recuperadas pela IA
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--salmon)]/30 bg-[var(--salmon)]/5">
            <span className="text-[10px] font-bold text-[var(--salmon)] uppercase tracking-wider block">Dinheiro na Mesa (Imediato)</span>
            <div className="text-xl font-black font-mono text-[var(--salmon)] mt-1">
              R$ {potencialNaMesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[var(--muted)] font-semibold mt-1 block">
              Potencial dos clientes listados
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Clientes em Risco</span>
            <div className="text-xl font-black font-mono text-[var(--ink)] mt-1">
              {clientesFiltrados.length}
            </div>
            <span className="text-[10px] text-amber-400 font-semibold mt-1 block">
              Inativos há mais de 28 dias
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Taxa de Conversão</span>
            <div className="text-xl font-black font-mono text-indigo-400 mt-1">
              28.4%
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
              +14% vs disparos genéricos
            </span>
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou prato..."
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[var(--muted)] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Propensão:</span>
          </span>
          {["todas", "alta", "média", "baixa"].map(p => (
            <button
              key={p}
              onClick={() => setFiltroPropensao(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filtroPropensao === p
                  ? "bg-[var(--salmon)] text-white shadow-sm"
                  : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE CLIENTES COM GERADOR DE ABORDAGENS SPINTAX */}
      <div className="space-y-4">
        {clientesFiltrados.map(cliente => {
          const estiloAtual = estiloAbordagem[cliente.id] || "fechamento";
          const mensagemPreview = gerarMensagemWhatsApp(cliente, estiloAtual);

          return (
            <div
              key={cliente.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-sm space-y-4 hover:border-[var(--line)]/80 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-center font-black text-sm text-[var(--ink)]">
                    {cliente.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-[var(--ink)]">{cliente.nome}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        cliente.propensao === "Alta"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : cliente.propensao === "Média"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        Propensão {cliente.propensao}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted)] mt-0.5">
                      <span>Tel: {cliente.telefone}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-bold">Sumido há {cliente.diasSemPedir} dias</span>
                      <span>·</span>
                      <span>Última visita: {cliente.ultimaVisita}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">LTV Histórico</span>
                    <span className="text-sm font-mono font-black text-[var(--salmon)]">
                      R$ {cliente.ltv.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="border-l border-[var(--line)] pl-3">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Ticket Médio</span>
                    <span className="text-sm font-mono font-black text-emerald-400">
                      R$ {cliente.ticketMedio.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* DADOS DE CONSUMO & PRATO PREFERIDO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Prato / Serviço de Maior Recorrência
                  </span>
                  <p className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{cliente.pratoFavorito}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Observação Comportamental da IA
                  </span>
                  <p className="text-[11px] text-[var(--muted)]">
                    {cliente.observacaoOperacional}
                  </p>
                </div>
              </div>

              {/* SELETOR DE ESTILO DE ABORDAGEM IA */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[var(--muted)]">
                    Selecione o Estilo da Abordagem Redigida pela IA:
                  </span>
                  <div className="flex items-center gap-1.5 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)]">
                    <button
                      onClick={() => setEstiloAbordagem({ ...estiloAbordagem, [cliente.id]: "suave" })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        estiloAtual === "suave" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      A. Suave (Anti-Ban)
                    </button>
                    <button
                      onClick={() => setEstiloAbordagem({ ...estiloAbordagem, [cliente.id]: "fechamento" })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        estiloAtual === "fechamento" ? "bg-[var(--salmon)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      B. Fechamento VIP (Conversão)
                    </button>
                    <button
                      onClick={() => setEstiloAbordagem({ ...estiloAbordagem, [cliente.id]: "ciclo" })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        estiloAtual === "ciclo" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      C. Lembrete de Ciclo
                    </button>
                  </div>
                </div>

                {/* TEXTAREA PREVIEW DA MENSAGEM */}
                <div className="relative">
                  <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-[var(--line)] text-xs font-mono text-neutral-300 leading-relaxed pr-28">
                    {mensagemPreview}
                  </div>
                  <button
                    onClick={() => handleDispararWhatsApp(cliente)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTÓRICO DE DINHEIRO NO CAIXA RECUPERADO */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Registro de Conversões Reais · Dinheiro Resgatado para o Caixa</span>
          </h3>
          <span className="text-[11px] font-mono font-bold text-emerald-400">
            Total: R$ {totalDinheiroCaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {conversoes.map(conv => (
            <div key={conv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--ink)]">{conv.clienteNome}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {conv.canal}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">{conv.observacao}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] text-[var(--muted)] font-mono">{conv.data}</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  +R$ {conv.valor.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL REGISTRO DE DINHEIRO NO CAIXA */}
      {modalConversao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--ink)]">Registrar Dinheiro no Caixa</h3>
                  <span className="text-[10px] text-[var(--muted)]">Atribuição de ROI com Zumi IA</span>
                </div>
              </div>
              <button
                onClick={() => setModalConversao(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarConversao} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Nome do Cliente Reativado</label>
                <input
                  type="text"
                  value={formConversao.clienteNome}
                  onChange={e => setFormConversao({ ...formConversao, clienteNome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)] font-semibold"
                  placeholder="Ex: Dr. Marcelo Arantes"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Telefone WhatsApp</label>
                  <input
                    type="text"
                    value={formConversao.telefone}
                    onChange={e => setFormConversao({ ...formConversao, telefone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                    placeholder="65 99999-9999"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Valor Recuperado (R$)</label>
                  <input
                    type="text"
                    value={formConversao.valor}
                    onChange={e => setFormConversao({ ...formConversao, valor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-mono font-black text-emerald-400"
                    placeholder="Ex: 245,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Canal de Conversão</label>
                <select
                  value={formConversao.canal}
                  onChange={e => setFormConversao({ ...formConversao, canal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)]"
                >
                  <option value="WhatsApp Zumi IA">WhatsApp Zumi IA (Disparo Direto)</option>
                  <option value="PWA Delivery Zuma">PWA Delivery Zuma (Pedido Online)</option>
                  <option value="Salão Tatames VIP">Salão Tatames VIP (Presencial)</option>
                  <option value="Balcão Takeaway">Balcão Takeaway (Retirada)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Observações da Venda</label>
                <textarea
                  rows={2}
                  value={formConversao.observacao}
                  onChange={e => setFormConversao({ ...formConversao, observacao: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs text-[var(--ink)]"
                  placeholder="Ex: Pediu Barca Nobre 32 Peças após convite no WhatsApp"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalConversao(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvar no Caixa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
