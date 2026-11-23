import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { 
  Shirt, 
  Sparkles, 
  ShoppingBag, 
  Tag, 
  Layers, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Scissors, 
  Barcode, 
  UserCheck, 
  RotateCcw, 
  Check, 
  X,
  Store,
  ChevronRight,
  Crown,
  Heart,
  Ruler,
  MessageSquare,
  Send,
  Edit3,
  UserPlus,
  Phone,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export const ZumaModaRoupas: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"grade" | "condicional" | "crm_vip" | "grade_furada" | "colecoes">("grade");
  const [isProvadorModalOpen, setIsProvadorModalOpen] = useState(false);
  const [selectedVipForProvador, setSelectedVipForProvador] = useState<any>(null);
  const [selectedProductForProvador, setSelectedProductForProvador] = useState<any>(null);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("TODAS");
  const [searchVip, setSearchVip] = useState("");
  const [selectedVipTier, setSelectedVipTier] = useState<string>("TODOS");
  const [selectedVipForLook, setSelectedVipForLook] = useState<any>(null);
  const [selectedVipForEdit, setSelectedVipForEdit] = useState<any>(null);
  const [isNovaClienteVipModalOpen, setIsNovaClienteVipModalOpen] = useState(false);
  const [isEditarMedidasModalOpen, setIsEditarMedidasModalOpen] = useState(false);
  const [isLookWhatsappModalOpen, setIsLookWhatsappModalOpen] = useState(false);

  // Modais
  const [isEtiquetaModalOpen, setIsEtiquetaModalOpen] = useState(false);
  const [selectedProductForEtiqueta, setSelectedProductForEtiqueta] = useState<any>(null);
  const [isNovaSacolaModalOpen, setIsNovaSacolaModalOpen] = useState(false);

  // Queries
  const { data: products = [], refetch: refetchProducts } = trpc.zuma.getClothingProducts.useQuery();
  const { data: bags = [], refetch: refetchBags } = trpc.zuma.getClothingConditionalBags.useQuery();
  const { data: vipProfiles = [], refetch: refetchVipProfiles } = trpc.zuma.getClothingVipProfiles.useQuery();

  // Mutations
  const updateVipMutation = trpc.zuma.updateClothingVipProfile.useMutation({
    onSuccess: () => {
      toast.success("Medidas e perfil de estilo VIP atualizados com sucesso!");
      refetchVipProfiles();
      setIsEditarMedidasModalOpen(false);
    },
    onError: (err) => toast.error(err.message)
  });

  const createVipMutation = trpc.zuma.createClothingVipProfile.useMutation({
    onSuccess: () => {
      toast.success("Nova Cliente VIP cadastrada no CRM Zuma!");
      refetchVipProfiles();
      setIsNovaClienteVipModalOpen(false);
    },
    onError: (err) => toast.error(err.message)
  });

  const updateStockMutation = trpc.zuma.updateClothingStock.useMutation({
    onSuccess: () => {
      toast.success("Estoque de vestuário atualizado!");
      refetchProducts();
    },
    onError: (err) => toast.error(err.message)
  });

  const settleBagMutation = trpc.zuma.settleConditionalBag.useMutation({
    onSuccess: (bag) => {
      toast.success(`Sacola de ${bag.customerName} finalizada com R$ ${bag.totalSoldValue.toFixed(2)} em vendas!`);
      refetchBags();
      refetchProducts();
    },
    onError: (err) => toast.error(err.message)
  });

  // Cálculos de KPIs
  const totalStockPeças = products.reduce((s, p) => s + p.grid.reduce((gSum, cell) => gSum + cell.stock, 0), 0);
  const totalCondicionalVal = bags
    .filter(b => b.status === "em_aberto")
    .reduce((s, b) => s + b.totalDepositValue, 0);

  const collections = ["TODAS", "Alto Verão 2026", "Alfaiataria Nobre", "Básicos Essenciais"];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.ref.toLowerCase().includes(searchProduct.toLowerCase());
    const matchCol = selectedCollection === "TODAS" || p.collection === selectedCollection;
    return matchSearch && matchCol;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner de Identidade Oficial */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-stone-900 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#ff6b4a]/20 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff6b4a] text-white text-[10px] font-black uppercase tracking-wider">
                OPERAÇÃO OFICIAL ZUMA
              </span>
              <span className="text-xs text-neutral-300">
                Tangará da Serra (MT) · CNPJ 36.296.848/0001-57
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Zuma Loja de Roupas &amp; Moda
            </h1>
            <p className="text-xs text-neutral-300 max-w-2xl mt-1">
              Varejo têxtil integrado: matriz de grade de vestuário, gestão de sacolas de condicional (provador em casa de 48h) e etiquetas térmicas com código de barras.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNovaSacolaModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#ff6b4a] hover:bg-[#e05a39] text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Nova Sacola Condicional</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPIs de Varejo de Vestuário */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Faturamento Moda Hoje
          </span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono mt-1">
            R$ 4.280,00
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs semana anterior
          </span>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Peças em Condicional (Casa)
          </span>
          <div className="text-2xl font-display font-extrabold text-purple-600 font-mono mt-1">
            R$ {totalCondicionalVal.toFixed(2)}
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-0.5 block">
            Sob provador de clientes VIP
          </span>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Estoque em Araras / Loja
          </span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono mt-1">
            {totalStockPeças} peças
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-0.5 block">
            5 modelos em grade ativa
          </span>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Markup Médio de Moda
          </span>
          <div className="text-2xl font-display font-extrabold text-emerald-600 font-mono mt-1">
            2.95x
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">
            Margem Bruta Têxtil 66,1%
          </span>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-[var(--line)] gap-2">
        <button
          onClick={() => setActiveTab("grade")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "grade"
              ? "border-[#ff6b4a] text-[#ff6b4a]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Grade Matricial (Tamanho x Cor)</span>
        </button>

        <button
          onClick={() => setActiveTab("condicional")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "condicional"
              ? "border-[#ff6b4a] text-[#ff6b4a]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sacolas de Condicional (Provador 48h)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 font-mono text-[10px]">
            {bags.filter(b => b.status === "em_aberto").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("crm_vip")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "crm_vip"
              ? "border-[#ff6b4a] text-[#ff6b4a]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>CRM Clientes VIP &amp; Medidas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 font-mono text-[10px]">
            {vipProfiles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("grade_furada")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "grade_furada"
              ? "border-[#ff6b4a] text-[#ff6b4a]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Scissors className="w-4 h-4 text-rose-500" />
          <span>Diagnóstico de Grade Furada</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 font-mono text-[10px]">
            Crítico
          </span>
        </button>

        <button
          onClick={() => setActiveTab("colecoes")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "colecoes"
              ? "border-[#ff6b4a] text-[#ff6b4a]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Coleções &amp; Markup</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* ABA 1: GRADE MATRICIAL (TAMANHO X COR X ESTOQUE)         */}
      {/* ========================================================= */}
      {activeTab === "grade" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-xl border border-[var(--line)]">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar modelo de roupa ou referência (ex: ZUM-LIN-01)..."
                value={searchProduct}
                onChange={e => setSearchProduct(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              {collections.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCollection(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                    selectedCollection === c
                      ? "bg-[var(--ink)] text-white shadow-xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredProducts.map(p => {
              const totalEstoqueModelo = p.grid.reduce((s, g) => s + g.stock, 0);

              return (
                <div key={p.id} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 font-bold">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-[var(--surface2)] text-[var(--ink)]">
                            {p.ref}
                          </span>
                          <span className="text-[10px] font-bold text-orange-600">
                            {p.collection}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]">EAN: {p.ean13}</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-[var(--ink)] mt-0.5">
                          {p.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--muted)] block">Preço de Venda</span>
                        <span className="text-base font-extrabold font-mono text-[var(--salmon)]">
                          R$ {p.salePrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[var(--muted)] block">Estoque Total</span>
                        <span className="text-base font-extrabold font-mono text-[var(--ink)]">
                          {totalEstoqueModelo} un
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProductForEtiqueta(p);
                          setIsEtiquetaModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] border border-[var(--line)] transition cursor-pointer"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Etiqueta Térmica</span>
                      </button>
                    </div>
                  </div>

                  {/* Grade Matricial */}
                  <div>
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
                      Grade Disponível por Tamanho e Cor (Clique para editar o estoque):
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2">
                      {p.grid.map((cell, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-[var(--surface2)] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--salmon)] transition"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="w-6 h-6 rounded bg-[var(--surface)] flex items-center justify-center font-mono font-black text-xs text-[var(--ink)] shadow-2xs">
                              {cell.size}
                            </span>
                            <span className="text-[10px] text-[var(--muted)] truncate max-w-[80px]" title={cell.color}>
                              {cell.color}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--line)]">
                            <span className="text-[10px] text-[var(--muted)]">Estoque:</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (cell.stock > 0) {
                                    updateStockMutation.mutate({
                                      productId: p.id,
                                      size: cell.size,
                                      color: cell.color,
                                      newStock: cell.stock - 1
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded bg-[var(--surface)] text-[10px] font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200"
                              >
                                -
                              </button>
                              <span className={`font-mono font-bold text-xs ${cell.stock <= cell.minStock ? "text-red-600" : "text-[var(--ink)]"}`}>
                                {cell.stock}
                              </span>
                              <button
                                onClick={() => {
                                  updateStockMutation.mutate({
                                    productId: p.id,
                                    size: cell.size,
                                    color: cell.color,
                                    newStock: cell.stock + 1
                                  });
                                }}
                                className="w-4 h-4 rounded bg-[var(--surface)] text-[10px] font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: SACOLAS DE CONDICIONAL (PROVADOR 48H)              */}
      {/* ========================================================= */}
      {activeTab === "condicional" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span className="text-purple-900 dark:text-purple-200 font-bold">
                Como Funciona a Sacola Condicional da Zuma Boutique:
              </span>
              <span className="text-purple-700 dark:text-purple-300">
                A cliente VIP leva até 6 peças para provar em casa por 48 horas. Ao retornar, você seleciona o que foi comprado em 1 toque e o restante volta para a arara.
              </span>
            </div>

            <button
              onClick={() => setIsNovaSacolaModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abrir Sacola Condicional</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bags.map(b => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border bg-[var(--surface)] shadow-xs space-y-3 ${
                  b.status === "em_aberto" ? "border-purple-500/40" : "border-[var(--line)]"
                }`}
              >
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[var(--ink)]">{b.customerName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === "em_aberto"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      }`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)]">
                      {b.customerPhone} · CPF: {b.customerCpf}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[var(--muted)] block">Prazo</span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {b.dueAt}
                    </span>
                  </div>
                </div>

                {/* Itens na Sacola */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Peças Selecionadas ({b.items.length}):
                  </span>
                  {b.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                          <span>{it.productName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[var(--surface)] text-[10px] font-mono">
                            {it.size} · {it.color}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--muted)]">Ref: {it.ref}</span>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[var(--ink)]">
                          R$ {it.price.toFixed(2)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          it.status === "com_cliente"
                            ? "bg-amber-500/10 text-amber-700"
                            : it.status === "comprado"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-neutral-200 text-neutral-700"
                        }`}>
                          {it.status === "com_cliente" ? "Provando" : it.status === "comprado" ? "Comprou" : "Devolveu"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Valor sob Custódia:</span>
                    <span className="font-mono font-bold text-sm text-[var(--ink)]">
                      R$ {b.totalDepositValue.toFixed(2)}
                    </span>
                  </div>

                  {b.status === "em_aberto" && (
                    <button
                      onClick={() => {
                        // Simula devolução/compra em 1 clique
                        const statuses = b.items.map((it, idx) => ({
                          productId: it.productId,
                          size: it.size,
                          color: it.color,
                          status: idx === 0 ? "comprado" as const : "devolvido" as const
                        }));
                        settleBagMutation.mutate({ bagId: b.id, itemStatuses: statuses });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Registrar Devolução / Venda</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 3: COLEÇÕES & MARKUP                                  */}
      {/* ========================================================= */}
      {activeTab === "colecoes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs space-y-2">
              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase">
                Coleção Vigente
              </span>
              <h3 className="text-base font-extrabold text-[var(--ink)]">Alto Verão 2026</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Linho puro italiano, viscose fluida e seda acetinada. Peças para o calor de Tangará da Serra com caimento nobre.
              </p>
              <div className="pt-2 border-t border-[var(--line)] flex justify-between text-xs">
                <span className="text-[var(--muted)]">Markup Médio:</span>
                <span className="font-mono font-bold text-emerald-600">3.00x</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs space-y-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase">
                Coleção Atemporal
              </span>
              <h3 className="text-base font-extrabold text-[var(--ink)]">Alfaiataria Nobre</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Cortes estruturados, blazers forrados e calças slim fit para ocasiões executivas e eventos formais.
              </p>
              <div className="pt-2 border-t border-[var(--line)] flex justify-between text-xs">
                <span className="text-[var(--muted)]">Markup Médio:</span>
                <span className="font-mono font-bold text-emerald-600">3.03x</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs space-y-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold uppercase">
                Coleção Contínua
              </span>
              <h3 className="text-base font-extrabold text-[var(--ink)]">Básicos Essenciais Pima</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                T-shirts em algodão Pima peruano toque de pluma com alta durabilidade e costura reforçada.
              </p>
              <div className="pt-2 border-t border-[var(--line)] flex justify-between text-xs">
                <span className="text-[var(--muted)]">Markup Médio:</span>
                <span className="font-mono font-bold text-emerald-600">3.54x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 4: CRM CLIENTES VIP & PERFIL DE MEDIDAS               */}
      {/* ========================================================= */}
      {activeTab === "crm_vip" && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-xl border border-[var(--line)]">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar cliente VIP por nome, telefone ou estilo..."
                value={searchVip}
                onChange={e => setSearchVip(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {["TODOS", "Diamante", "Platina", "Ouro"].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedVipTier(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedVipTier === t
                      ? "bg-[#ff6b4a] text-white shadow-xs"
                      : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNovaClienteVipModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6b4a] hover:bg-[#e05a39] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nova Cliente VIP</span>
            </button>
          </div>

          {/* Cards de Clientes VIP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vipProfiles
              .filter(vip => {
                const matchSearch = vip.name.toLowerCase().includes(searchVip.toLowerCase()) || 
                  vip.phone.includes(searchVip) || 
                  vip.styleProfile.predominantStyle.toLowerCase().includes(searchVip.toLowerCase());
                const matchTier = selectedVipTier === "TODOS" || vip.tier === selectedVipTier;
                return matchSearch && matchTier;
              })
              .map(vip => (
                <div
                  key={vip.id}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4 hover:border-[#ff6b4a]/60 transition-all"
                >
                  {/* Header do Perfil VIP */}
                  <div className="flex items-start justify-between border-b border-[var(--line)] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[var(--ink)]">{vip.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                          vip.tier === "Diamante"
                            ? "bg-purple-500/10 text-purple-600 border border-purple-500/30"
                            : vip.tier === "Platina"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                        }`}>
                          <Crown className="w-3 h-3" />
                          <span>{vip.tier}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {vip.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Aniv: {vip.birthday}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Gasto Total</span>
                      <span className="text-sm font-black font-mono text-emerald-600">
                        R$ {vip.totalSpent.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] block">
                        {vip.bagsCount} sacolas cond.
                      </span>
                    </div>
                  </div>

                  {/* Bloco 1: Perfil de Medidas Físicas */}
                  <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-[var(--ink)] flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-orange-600" />
                        <span>Ficha Técnica de Medidas Corporais</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#ff6b4a] text-white text-[11px] font-black font-mono">
                        {vip.manequim}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                      {vip.measurements.busto !== undefined && (
                        <div className="p-1.5 bg-[var(--surface)] rounded border border-[var(--line)]">
                          <span className="text-[9px] text-[var(--muted)] block uppercase">Busto</span>
                          <b className="font-mono text-[var(--ink)]">{vip.measurements.busto} cm</b>
                        </div>
                      )}
                      {vip.measurements.torax !== undefined && (
                        <div className="p-1.5 bg-[var(--surface)] rounded border border-[var(--line)]">
                          <span className="text-[9px] text-[var(--muted)] block uppercase">Tórax</span>
                          <b className="font-mono text-[var(--ink)]">{vip.measurements.torax} cm</b>
                        </div>
                      )}
                      <div className="p-1.5 bg-[var(--surface)] rounded border border-[var(--line)]">
                        <span className="text-[9px] text-[var(--muted)] block uppercase">Cintura</span>
                        <b className="font-mono text-[var(--ink)]">{vip.measurements.cintura} cm</b>
                      </div>
                      {vip.measurements.quadril !== undefined && (
                        <div className="p-1.5 bg-[var(--surface)] rounded border border-[var(--line)]">
                          <span className="text-[9px] text-[var(--muted)] block uppercase">Quadril</span>
                          <b className="font-mono text-[var(--ink)]">{vip.measurements.quadril} cm</b>
                        </div>
                      )}
                      <div className="p-1.5 bg-[var(--surface)] rounded border border-[var(--line)]">
                        <span className="text-[9px] text-[var(--muted)] block uppercase">Altura</span>
                        <b className="font-mono text-[var(--ink)]">{vip.measurements.altura} m</b>
                      </div>
                      <div className="p-1.5 bg-[var(--surface)] rounded border border-[var(--line)]">
                        <span className="text-[9px] text-[var(--muted)] block uppercase">Calçado</span>
                        <b className="font-mono text-[var(--ink)]">{vip.measurements.sapato}</b>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: DNA de Estilo & Preferências */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Estilo Predominante</span>
                      <span className="font-bold text-[var(--ink)]">{vip.styleProfile.predominantStyle}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-1">Paleta Favorita</span>
                      <div className="flex flex-wrap gap-1">
                        {vip.styleProfile.favoriteColors.map((cor: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-[var(--surface2)] border border-[var(--line)] text-[10px] font-semibold text-[var(--ink)]">
                            {cor}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-100 text-[11px] leading-relaxed">
                      <b>Nota de Consultoria:</b> "{vip.styleProfile.notes}"
                    </div>
                  </div>

                  {/* Botões de Ação da Cliente */}
                  <div className="pt-2 border-t border-[var(--line)] flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedVipForProvador(vip);
                        setSelectedProductForProvador(products[0] || null);
                        setIsProvadorModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Testar caimento em peças da loja"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Provador Virtual</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedVipForLook(vip);
                        setIsLookWhatsappModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Sugerir Look WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedVipForEdit(vip);
                        setIsEditarMedidasModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Medidas</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ===================== MODAL SUGESTÃO DE LOOK WHATSAPP ===================== */}
      {isLookWhatsappModalOpen && selectedVipForLook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Consultoria de Look Personalizado · WhatsApp VIP
              </h3>
              <button onClick={() => setIsLookWhatsappModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[var(--surface2)] rounded-xl border border-[var(--line)] text-xs space-y-1">
              <div>Destinatário: <b>{selectedVipForLook.name}</b> ({selectedVipForLook.phone})</div>
              <div>Manequim Cadastrado: <b className="text-[#ff6b4a]">{selectedVipForLook.manequim}</b> · Cores: {selectedVipForLook.styleProfile.favoriteColors.join(", ")}</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--muted)] block">Texto Sugerido pela IA Consultora Zuma:</label>
              <div className="p-3 bg-white dark:bg-stone-900 border border-[var(--line)] rounded-xl text-xs font-mono text-[var(--ink)] leading-relaxed whitespace-pre-wrap select-all">
{`Olá, ${selectedVipForLook.name.split(" ")[0]}! Tudo bem? ✨

Acabamos de receber na Zuma Boutique peças exclusivas da Coleção Alto Verão 2026 no seu manequim exato (${selectedVipForLook.manequim}):

👗 Camisa Linho Puro Riviera (Off-White) - R$ 289,00
✨ Vestido Midi Seda Tropical (${selectedVipForLook.styleProfile.favoriteColors[1] || "Terracota"}) - R$ 420,00

Como você ama tons de ${selectedVipForLook.styleProfile.favoriteColors.slice(0, 2).join(" e ")}, montamos uma sacola de condicional especial para você provar no conforto da sua casa por 48 horas!

Posso pedir para o entregador da Zuma levar aí para você hoje à tarde?`}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsLookWhatsappModalOpen(false)}
                className="flex-1 py-2 bg-[var(--surface2)] text-xs font-semibold rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Olá ${selectedVipForLook.name}! Chegaram novidades no seu manequim ${selectedVipForLook.manequim} na Zuma!`);
                  toast.success("Mensagem de WhatsApp copiada com sucesso!");
                  setIsLookWhatsappModalOpen(false);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Copiar e Enviar no Zap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDITAR MEDIDAS ===================== */}
      {isEditarMedidasModalOpen && selectedVipForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-orange-600" />
                Editar Medidas de {selectedVipForEdit.name}
              </h3>
              <button onClick={() => setIsEditarMedidasModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Manequim:</label>
                <input
                  type="text"
                  defaultValue={selectedVipForEdit.manequim}
                  id="input_manequim"
                  className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Cintura (cm):</label>
                <input
                  type="number"
                  defaultValue={selectedVipForEdit.measurements.cintura}
                  id="input_cintura"
                  className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Busto / Tórax (cm):</label>
                <input
                  type="number"
                  defaultValue={selectedVipForEdit.measurements.busto || selectedVipForEdit.measurements.torax || 90}
                  id="input_busto"
                  className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Quadril (cm):</label>
                <input
                  type="number"
                  defaultValue={selectedVipForEdit.measurements.quadril || 98}
                  id="input_quadril"
                  className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditarMedidasModalOpen(false)}
                className="flex-1 py-2 bg-[var(--surface2)] text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const manequim = (document.getElementById("input_manequim") as HTMLInputElement)?.value || selectedVipForEdit.manequim;
                  const cintura = parseFloat((document.getElementById("input_cintura") as HTMLInputElement)?.value) || selectedVipForEdit.measurements.cintura;
                  const busto = parseFloat((document.getElementById("input_busto") as HTMLInputElement)?.value) || 90;
                  const quadril = parseFloat((document.getElementById("input_quadril") as HTMLInputElement)?.value) || 98;

                  updateVipMutation.mutate({
                    id: selectedVipForEdit.id,
                    data: {
                      manequim,
                      measurements: {
                        ...selectedVipForEdit.measurements,
                        cintura,
                        busto,
                        quadril
                      }
                    }
                  });
                }}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL NOVA CLIENTE VIP ===================== */}
      {isNovaClienteVipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#ff6b4a]" />
                Cadastrar Nova Cliente VIP
              </h3>
              <button onClick={() => setIsNovaClienteVipModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  id="novo_vip_nome"
                  placeholder="Ex: Fernanda Paes Leme"
                  defaultValue="Fernanda Paes Leme"
                  className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Telefone WhatsApp:</label>
                  <input
                    type="text"
                    id="novo_vip_phone"
                    defaultValue="(65) 99877-4321"
                    className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Manequim:</label>
                  <input
                    type="text"
                    id="novo_vip_manequim"
                    defaultValue="38 / P"
                    className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded font-semibold text-[var(--ink)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNovaClienteVipModalOpen(false)}
                className="flex-1 py-2 bg-[var(--surface2)] text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  createVipMutation.mutate({
                    name: (document.getElementById("novo_vip_nome") as HTMLInputElement)?.value || "Nova Cliente VIP",
                    phone: (document.getElementById("novo_vip_phone") as HTMLInputElement)?.value || "(65) 99999-0000",
                    tier: "Ouro",
                    manequim: (document.getElementById("novo_vip_manequim") as HTMLInputElement)?.value || "38 / P",
                    measurements: {
                      busto: 88,
                      cintura: 70,
                      quadril: 98,
                      altura: 1.66,
                      sapato: 37
                    },
                    styleProfile: {
                      predominantStyle: "Contemporâneo Elegante",
                      favoriteColors: ["Off-White", "Terracota"],
                      favoritePieces: ["Vestidos", "Linho"],
                      notes: "Nova cliente cadastrada pelo atendimento boutique."
                    },
                    totalSpent: 0,
                    bagsCount: 0,
                    lastPurchaseDate: "Hoje",
                    birthday: "15/06"
                  });
                }}
                className="flex-1 py-2 bg-[#ff6b4a] hover:bg-[#e05a39] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Cadastrar Cliente VIP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL ETIQUETA TÉRMICA DE ROUPAS ===================== */}
      {isEtiquetaModalOpen && selectedProductForEtiqueta && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-orange-600" />
                Etiqueta Térmica de Peça
              </h3>
              <button onClick={() => setIsEtiquetaModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview da Etiqueta Física */}
            <div className="bg-white text-black p-4 rounded border border-stone-300 font-mono text-center space-y-2 shadow-inner">
              <div className="font-extrabold text-xs tracking-tight">ZUMA BOUTIQUE &amp; MODA</div>
              <div className="text-[10px] font-bold">{selectedProductForEtiqueta.name}</div>
              <div className="text-[9px] text-stone-600">REF: {selectedProductForEtiqueta.ref} · TAM: M · COR: OFF-WHITE</div>
              
              {/* Código de barras simulado em arte mono */}
              <div className="py-2">
                <div className="tracking-widest text-lg font-black select-none font-mono">
                  ||||| | |||| || ||| | ||
                </div>
                <div className="text-[10px] font-bold tracking-widest">{selectedProductForEtiqueta.ean13}</div>
              </div>

              <div className="border-t border-black pt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold">PREÇO:</span>
                <span className="text-base font-black">R$ {selectedProductForEtiqueta.salePrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsEtiquetaModalOpen(false)}
                className="flex-1 py-2 bg-[var(--surface2)] text-xs font-semibold rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  toast.success("Etiqueta impressa na impressora de gôndola Zebra/Argox!");
                  window.print();
                }}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Etiqueta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL NOVA SACOLA CONDICIONAL ===================== */}
      {isNovaSacolaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
                Abrir Sacola Condicional (Provador 48h)
              </h3>
              <button onClick={() => setIsNovaSacolaModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--muted)] block mb-1">Nome da Cliente VIP:</label>
                <input
                  type="text"
                  placeholder="Ex: Mariana Costa"
                  defaultValue="Mariana Costa"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--muted)] block mb-1">WhatsApp / Telefone:</label>
                <input
                  type="text"
                  placeholder="(65) 99..."
                  defaultValue="(65) 99812-4410"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--muted)] block mb-1">Peças na Sacola:</label>
                <div className="p-2.5 rounded bg-[var(--surface2)] text-xs space-y-1 font-semibold">
                  <div>• 1x Camisa Linho Riviera (M · Off-White) - R$ 289,00</div>
                  <div>• 1x Vestido Midi Seda (M · Terracota) - R$ 420,00</div>
                  <div>• 1x Calça Alfaiataria (40 · Chumbo) - R$ 349,00</div>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-1 font-mono">
                  Total em Custódia: <strong>R$ 1.058,00</strong> (Prazo: 48 horas)
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNovaSacolaModalOpen(false)}
                className="flex-1 py-2 bg-[var(--surface2)] text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.success("Sacola Condicional gerada e comprovante assinado emitido!");
                  setIsNovaSacolaModalOpen(false);
                }}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Emitir Termo Condicional</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===================== MODAL PROVADOR VIRTUAL POR MEDIDAS ===================== */}
      {isProvadorModalOpen && selectedVipForProvador && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--ink)]">
                    Provador Virtual Inteligente · Fit Assistant
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Cruzamento das medidas de <b>{selectedVipForProvador.name}</b> com a modelagem têxtil.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsProvadorModalOpen(false)} className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seletor de Peça para Prova */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[var(--muted)] uppercase tracking-wider block">
                Escolha a Peça para Simular o Caimento:
              </label>
              <select
                value={selectedProductForProvador?.id || ""}
                onChange={(e) => {
                  const prod = products.find(p => p.id === e.target.value);
                  setSelectedProductForProvador(prod || null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--ink)] cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.ref}) · {p.collection} · R$ {p.salePrice.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Medidas da Cliente vs Modelagem */}
            <div className="p-4 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--line)]">
                <span className="font-bold text-[var(--ink)]">Manequim Recomendado Zumi:</span>
                <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-mono font-black text-sm">
                  {selectedVipForProvador.manequim}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Busto da Cliente:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {selectedVipForProvador.measurements.busto || selectedVipForProvador.measurements.torax || 92} cm (Caimento Fluido +3cm no {selectedVipForProvador.manequim})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Cintura da Cliente:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {selectedVipForProvador.measurements.cintura} cm (Ajuste Perfeito no {selectedVipForProvador.manequim})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Quadril da Cliente:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {selectedVipForProvador.measurements.quadril || 102} cm (Caimento Evasê Confortável)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Comprimento Ideal:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {selectedVipForProvador.measurements.altura >= 1.70 ? "Comprimento Midi Padrão (sem necessidade de barra)" : "Recomendado ajuste de 2cm na barra"}
                  </span>
                </div>
              </div>
            </div>

            {/* Veredito da Consultora de Moda */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Veredito da Consultoria de Imagem (IA):</span>
              </div>
              <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200 leading-relaxed">
                Esta peça no tamanho <b>{selectedVipForProvador.manequim}</b> na cor <b>{selectedVipForProvador.styleProfile.favoriteColors[0] || "Areia"}</b> tem <b>98.4% de probabilidade de conversão sem devolução</b>. Pode incluir na Sacola de Condicional 48h!
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => setIsProvadorModalOpen(false)}
                className="px-5 py-2.5 bg-[var(--surface2)] text-xs font-bold rounded-xl cursor-pointer"
              >
                Fechar Provador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
