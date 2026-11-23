import React, { useState } from "react";
import { Link } from "wouter";
import {
  Store,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Truck,
  Users,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  UtensilsCrossed,
  Shirt,
  Building2,
  Wheat,
  Scissors,
  Dumbbell,
  Landmark,
  Eye,
  Plus,
  CreditCard,
  QrCode
} from "lucide-react";
import { toast } from "sonner";

export const EcommerceAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"geral" | "catalogo" | "pedidos" | "split" | "logistica">("geral");
  const [filtroLoja, setFiltroLoja] = useState<string>("todas");
  const [busca, setBusca] = useState<string>("");

  const LOJAS_HOLDING = [
    {
      id: "zuma_gastronomia",
      nome: "Zuma Cozinha Oriental",
      slug: "gastronomia",
      tipo: "Gastronomia & Delivery",
      icone: UtensilsCrossed,
      produtos: 48,
      pedidosHoje: 74,
      faturamentoMes: 284500,
      splitBancofe: "98.5% Loja / 1.5% BancoFé Pay",
      cor: "emerald",
      url: "/cardapio",
    },
    {
      id: "casanova_imoveis",
      nome: "Casa Nova Imóveis & Construtora",
      slug: "imoveis",
      tipo: "Catálogo Imobiliário & Crédito",
      icone: Building2,
      produtos: 120,
      pedidosHoje: 4,
      faturamentoMes: 14200000,
      splitBancofe: "Funding Direto BancoFé S/A",
      cor: "blue",
      url: "/plataforma/precadastro",
    },
    {
      id: "zuma_moda",
      nome: "Zuma Moda & Boutique",
      slug: "moda",
      tipo: "Varejo & Malas Condicionais",
      icone: Shirt,
      produtos: 86,
      pedidosHoje: 18,
      faturamentoMes: 142000,
      splitBancofe: "97.5% Loja / 2.5% BancoFé Pay",
      cor: "purple",
      url: "/moda",
    },
    {
      id: "agro_uisa",
      nome: "Agropecuária UISA / Agro Open",
      slug: "agro",
      tipo: "Insumos, Mudas & Máquinas",
      icone: Wheat,
      produtos: 34,
      pedidosHoje: 6,
      faturamentoMes: 8920000,
      splitBancofe: "Contratos CPR / Barter BancoFé",
      cor: "amber",
      url: "/agro",
    },
    {
      id: "barbearia_dino",
      nome: "Barbearia Dino",
      slug: "barbearia",
      tipo: "Agendamento & Cosméticos",
      icone: Scissors,
      produtos: 22,
      pedidosHoje: 24,
      faturamentoMes: 48000,
      splitBancofe: "98.0% Loja / 2.0% BancoFé Pay",
      cor: "teal",
      url: "/admin",
    },
    {
      id: "stallone_nutre",
      nome: "Stallone Nutre Sport",
      slug: "suplementos",
      tipo: "Nutrição & Suplementos",
      icone: Dumbbell,
      produtos: 64,
      pedidosHoje: 16,
      faturamentoMes: 96500,
      splitBancofe: "98.0% Loja / 2.0% BancoFé Pay",
      cor: "rose",
      url: "/admin",
    },
  ];

  const PRODUTOS_CATALOGO = [
    {
      id: "prod-1",
      lojaId: "zuma_gastronomia",
      lojaNome: "Zuma Gastronomia",
      nome: "Combo Super Especial Salmão Trufado (40 Peças)",
      sku: "ZUM-COMB-040",
      categoria: "Combinados Premium",
      preco: 189.90,
      estoque: 95,
      status: "ativo",
    },
    {
      id: "prod-2",
      lojaId: "zuma_gastronomia",
      lojaNome: "Zuma Gastronomia",
      nome: "Barca Imperador Tangará (60 Peças)",
      sku: "ZUM-BARC-060",
      categoria: "Barcas Salão/Delivery",
      preco: 269.00,
      estoque: 40,
      status: "ativo",
    },
    {
      id: "prod-3",
      lojaId: "casanova_imoveis",
      lojaNome: "Casa Nova Imóveis",
      nome: "Casa Térrea 3 Suítes - Res. Buritis Tangará",
      sku: "IMOV-BUR-03",
      categoria: "Imóveis Prontos",
      preco: 780000.00,
      estoque: 1,
      status: "ativo",
    },
    {
      id: "prod-4",
      lojaId: "casanova_imoveis",
      lojaNome: "Casa Nova Imóveis",
      nome: "Loteamento Fechado Altos da Serra (360m²)",
      sku: "LOT-ALT-360",
      categoria: "Terrenos e Lotes",
      preco: 145000.00,
      estoque: 8,
      status: "ativo",
    },
    {
      id: "prod-5",
      lojaId: "zuma_moda",
      lojaNome: "Zuma Moda & Boutique",
      nome: "Vestido Midi Alfaiataria Seda & Linho",
      sku: "MOD-VES-MID01",
      categoria: "Alfaiataria Feminina",
      preco: 389.00,
      estoque: 14,
      status: "ativo",
    },
    {
      id: "prod-6",
      lojaId: "agro_uisa",
      lojaNome: "Agro & Cana UISA",
      nome: "Mudas Pré-Brotadas de Cana (MPB) - Lote 5.000 un",
      sku: "AGR-CANA-MPB5K",
      categoria: "Mudas & Sementes",
      preco: 12500.00,
      estoque: 200,
      status: "ativo",
    },
    {
      id: "prod-7",
      lojaId: "stallone_nutre",
      lojaNome: "Stallone Nutre",
      nome: "100% Whey Isolate 900g Baunilha Gold",
      sku: "NUT-WHEY-ISO900",
      categoria: "Proteínas Isoladas",
      preco: 199.90,
      estoque: 38,
      status: "ativo",
    },
  ];

  const PEDIDOS_RECENTES = [
    {
      id: "PED-9821",
      loja: "Zuma Gastronomia",
      cliente: "Lucas Silveira Gonçalves",
      cpf: "069.***.***-61",
      canal: "App / WhatsApp Zumi",
      valor: 218.00,
      formaPagamento: "PIX BancoFé D+0",
      status: "Em Separação",
      horario: "19:42",
    },
    {
      id: "PED-9820",
      loja: "Zuma Moda",
      cliente: "Mariana Albuquerque Costa",
      cpf: "348.***.***-02",
      canal: "Mala Condicional",
      valor: 1480.00,
      formaPagamento: "Cartão BancoFé D+1",
      status: "Entregue Condicional",
      horario: "18:15",
    },
    {
      id: "PED-9819",
      loja: "Casa Nova Imóveis",
      cliente: "Engenharia Tangará Ltda",
      cpf: "18.***.***/0001-44",
      canal: "Mesa Crédito B2B",
      valor: 450000.00,
      formaPagamento: "CCB Escritural",
      status: "Formalização CCB",
      horario: "17:30",
    },
    {
      id: "PED-9818",
      loja: "Stallone Nutre",
      cliente: "Carlos Eduardo Neves",
      cpf: "512.***.***-88",
      canal: "Loja Virtual Web",
      valor: 399.80,
      formaPagamento: "PIX BancoFé D+0",
      status: "Concluído",
      horario: "16:50",
    },
  ];

  const produtosFiltrados = PRODUTOS_CATALOGO.filter((p) => {
    const matchLoja = filtroLoja === "todas" || p.lojaId === filtroLoja;
    const matchBusca = busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase());
    return matchLoja && matchBusca;
  });

  return (
    <div className="min-h-screen bg-[#071510] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABEÇALHO BANCOFÉ VERDE INSTITUCIONAL */}
      <div className="bg-[#0c241a] p-6 rounded-2xl border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50">
              <Store className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
              E-Commerce & Omnichannel Holding
            </span>
            <span className="text-xs text-emerald-400/80">• Multi-Storefronts Ativos</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-900/60 text-emerald-300">
              BancoFé Pay D+0
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1.5 flex items-center gap-2">
            Cockpit Administrativo de Vendas Digitais
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Gestão unificada de lojas virtuais, catálogo multi-empresa, pedidos em tempo real e liquidação bancária instantânea.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/crm-financeira"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 no-underline"
          >
            <Landmark className="w-4 h-4" />
            <span>Mesa de Operações & Crédito</span>
          </Link>
          <Link
            href="/plataforma/consulta-cpf"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 no-underline"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Consulta 360° CPF/CNPJ</span>
          </Link>
        </div>
      </div>

      {/* KPIS GLOBAIS DE E-COMMERCE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>GMV Consolidado (Mês)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            R$ 1.845.290,00
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            +18,4% vs mês anterior
          </div>
        </div>

        <div className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pedidos Hoje</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            142 pedidos
          </div>
          <div className="text-xs text-slate-400 mt-1">
            98 Delivery • 32 Retirada • 12 Mesa
          </div>
        </div>

        <div className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ticket Médio Geral</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            R$ 164,80
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            Conversão Média: 4,8%
          </div>
        </div>

        <div className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Split BancoFé Pay</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            100% D+0
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Liquidação instantânea PIX
          </div>
        </div>
      </div>

      {/* ABAS DO COCKPIT */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-emerald-900/60 scrollbar-none">
        {[
          { id: "geral", label: "Visão Geral & Lojas", icon: Store },
          { id: "catalogo", label: "Catálogo Multi-Loja", icon: Package },
          { id: "pedidos", label: "Pedidos em Tempo Real", icon: ShoppingBag },
          { id: "split", label: "Split BancoFé Pay", icon: CreditCard },
          { id: "logistica", label: "Zonas de Entrega & Frotas", icon: Truck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-emerald-800 text-white shadow-lg border border-emerald-500/50"
                  : "bg-[#0b1d16] text-slate-400 hover:text-white hover:bg-emerald-950/60 border border-emerald-900/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {activeTab === "geral" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Store className="w-4 h-4" /> Lojas Virtuais & Storefronts da Holding
            </h3>
            <span className="text-xs text-slate-400">6 Operações Conectadas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LOJAS_HOLDING.map((loja) => {
              const Icon = loja.icone;
              return (
                <div
                  key={loja.id}
                  className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 hover:border-emerald-500/60 transition space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{loja.nome}</h4>
                        <p className="text-[11px] text-slate-400">{loja.tipo}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      Ativa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-950">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Catálogo</span>
                      <strong className="text-white font-mono">{loja.produtos} itens</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hoje</span>
                      <strong className="text-emerald-400 font-mono">{loja.pedidosHoje} pedidos</strong>
                    </div>
                  </div>

                  <div className="text-xs pt-1">
                    <span className="text-slate-400 block text-[10px]">Volume Mensal</span>
                    <strong className="text-emerald-400 font-mono text-base">
                      R$ {loja.faturamentoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/40">
                    <span className="font-semibold text-emerald-300">Regra de Split:</span> {loja.splitBancofe}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setFiltroLoja(loja.id);
                        setActiveTab("catalogo");
                      }}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Ver Produtos →
                    </button>
                    <Link
                      href={loja.url}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 no-underline"
                    >
                      <span>Abrir Loja</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "catalogo" && (
        <div className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400">
                Catálogo Geral de Produtos & Serviços
              </h3>
              <select
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
                className="bg-[#071510] border border-emerald-800/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="todas">Todas as Lojas</option>
                {LOJAS_HOLDING.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, SKU..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="bg-[#071510] border border-emerald-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-900/70 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-3">Produto / Serviço</th>
                  <th className="py-3 px-3">Loja de Origem</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Estoque</th>
                  <th className="py-3 px-3">Preço Unitário</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {produtosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-emerald-950/30 transition">
                    <td className="py-3 px-3 font-semibold text-white">{prod.nome}</td>
                    <td className="py-3 px-3 text-emerald-300">{prod.lojaNome}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{prod.sku}</td>
                    <td className="py-3 px-3 text-slate-300">{prod.categoria}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{prod.estoque} un</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      R$ {prod.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                        Ativo
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toast.success(`Produto ${prod.nome} selecionado para edição.`)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "pedidos" && (
        <div className="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Fluxo Omnichannel de Pedidos
            </h3>
            <span className="text-xs text-slate-400">Sincronização D+0 com BancoFé Core</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-900/70 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-3">Pedido</th>
                  <th className="py-3 px-3">Loja</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Canal</th>
                  <th className="py-3 px-3">Valor</th>
                  <th className="py-3 px-3">Forma de Pagamento</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Horário</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {PEDIDOS_RECENTES.map((ped) => (
                  <tr key={ped.id} className="hover:bg-emerald-950/30 transition">
                    <td className="py-3 px-3 font-mono font-bold text-white">{ped.id}</td>
                    <td className="py-3 px-3 text-emerald-300">{ped.loja}</td>
                    <td className="py-3 px-3 text-slate-200">
                      <div>{ped.cliente}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ped.cpf}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                        {ped.canal}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      R$ {ped.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{ped.formaPagamento}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">
                        {ped.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{ped.horario}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => toast.info(`Pedido ${ped.id} aberto em detalhes.`)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "split" && (
        <div className="bg-[#0b1d16] p-6 rounded-2xl border border-emerald-900/60 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> BancoFé Pay • Motor de Split Automático
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Distribuição programada dos recebimentos por CNPJ em tempo real, sem bitributação e com liquidação bancária via PIX D+0.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 text-xs font-bold">
              ISPB 799 • Bacen
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-2">
              <span className="text-xs text-slate-400">Taxa PIX BancoFé</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">0,89%</div>
              <p className="text-[11px] text-slate-300">Liquidação instantânea em subconta digital</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-2">
              <span className="text-xs text-slate-400">Taxa Cartão Crédito (D+1)</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">1,89%</div>
              <p className="text-[11px] text-slate-300">Antecipação automática sob demanda</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-2">
              <span className="text-xs text-slate-400">Boleto Registrado CIP</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">R$ 1,90</div>
              <p className="text-[11px] text-slate-300">Cobrado apenas na liquidação efetiva</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logistica" && (
        <div className="bg-[#0b1d16] p-6 rounded-2xl border border-emerald-900/60 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" /> Logística, Entregas & Frota
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Zonas de entrega por CEP em Tangará da Serra, Nova Olímpia, Barra do Bugres e Cuiabá com despacho inteligente.
              </p>
            </div>
            <Link
              href="/tabela-entregas"
              className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition no-underline"
            >
              Ver Tabela de CEPs →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-1">
              <span className="text-xs text-slate-400">Zona Central Tangará</span>
              <div className="text-lg font-bold text-white">R$ 8,00</div>
              <p className="text-[11px] text-emerald-400">Entrega média: 25 min</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-1">
              <span className="text-xs text-slate-400">Bairros Afastados</span>
              <div className="text-lg font-bold text-white">R$ 14,00</div>
              <p className="text-[11px] text-emerald-400">Entrega média: 38 min</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-1">
              <span className="text-xs text-slate-400">Nova Olímpia / Usina</span>
              <div className="text-lg font-bold text-white">R$ 28,00</div>
              <p className="text-[11px] text-emerald-400">Rotas programadas diárias</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e271e] border border-emerald-800/40 space-y-1">
              <span className="text-xs text-slate-400">Cuiabá / Grande MT</span>
              <div className="text-lg font-bold text-white">Transportadora</div>
              <p className="text-[11px] text-emerald-400">Frete rodoviário D+1</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EcommerceAdminPage;
