import sys

with open('/home/ubuntu/zuma/client/src/pages/PdvCaixa.tsx', 'r') as f:
    content = f.read()

# 1. Imports check & update
if 'Crown,' not in content:
    content = content.replace(
        '  WifiOff,\n  Wifi\n} from "lucide-react";',
        '  WifiOff,\n  Wifi,\n  Crown,\n  ChevronDown,\n  UserCheck,\n  UserPlus,\n  Truck,\n  Building2\n} from "lucide-react";',
        1
    )
    print("1. Icons imported")

# 2. Add new states
state_target = '  const [cashClosedSummary, setCashClosedSummary] = useState<any>(null);'
new_states = """  const [cashClosedSummary, setCashClosedSummary] = useState<any>(null);

  // Estados para Organização do Menu Superior e Clientes VIP / Entrega MT
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [orderType, setOrderType] = useState<"balcao" | "delivery">("balcao");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id?: number;
    code?: string;
    name: string;
    phone?: string;
    neighborhood?: string;
    address?: string;
    cep?: string;
    cidade?: string;
    segment?: string;
    isVip?: boolean;
    tags?: string[];
  } | null>({
    name: "Rodrigo Ribeiro Gonçalves",
    code: "VIP-01",
    phone: "(65) 99812-4401",
    neighborhood: "Centro",
    address: "Av. Brasil, 450",
    cep: "78300-000",
    cidade: "Tangará da Serra",
    segment: "vip",
    isVip: true
  });
  const [selectedDeliveryBairroId, setSelectedDeliveryBairroId] = useState<string>("tga-01");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phone: "",
    neighborhood: "Centro",
    address: "",
    cep: "78300-000",
    cidade: "Tangará da Serra",
    isVip: true,
    notes: ""
  });"""

if 'const [isToolsMenuOpen' not in content:
    assert state_target in content, "state_target not found"
    content = content.replace(state_target, new_states, 1)
    print("2. New states added")

# 3. Add Queries & Mutations
query_target = '  const cashRegisterQuery = trpc.zuma.getCashRegister.useQuery(undefined, { refetchInterval: 3000 });'
new_queries = """  const cashRegisterQuery = trpc.zuma.getCashRegister.useQuery(undefined, { refetchInterval: 3000 });

  // Busca Inteligente de Clientes e Tabela de Frete dos 62 Bairros/Cidades MT
  const { data: customerSearchResults = [] } = trpc.zuma.searchPdvCustomers.useQuery(
    { query: customerSearchQuery },
    { enabled: customerSearchQuery.length >= 1 }
  );

  const { data: allDeliveryBairros = [] } = trpc.zuma.getDeliveryNeighborhoods.useQuery();

  const createCustomerMutation = trpc.zuma.createOrUpdateCustomerPdv.useMutation({
    onSuccess: (newCust) => {
      toast.success(`Cliente ${newCust.name} (${newCust.code || "VIP"}) cadastrado com sucesso!`);
      setSelectedCustomer(newCust);
      setCustomerName(newCust.name);
      if (newCust.phone) setCpf(newCust.phone);
      setIsNewCustomerModalOpen(false);
    },
    onError: (err) => {
      toast.error(`Erro ao cadastrar cliente: ${err.message}`);
    }
  });"""

if 'searchPdvCustomers.useQuery' not in content:
    assert query_target in content, "query_target not found"
    content = content.replace(query_target, new_queries, 1)
    print("3. New queries & mutations added")

# 4. Update delivery calculations and troco
old_subtotal_calc = """  const subtotal = cart.reduce((s, i) => s + i.preco * i.q, 0);
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashGiven - subtotal) : 0;"""

new_subtotal_calc = """  const subtotal = cart.reduce((s, i) => s + i.preco * i.q, 0);

  const selectedBairro = allDeliveryBairros.find(b => b.id === selectedDeliveryBairroId) || allDeliveryBairros[0] || {
    id: "tga-01",
    name: "Centro",
    fee: 6.0,
    freeShippingMin: 100.0,
    distanceKm: 1.0,
    cidade: "Tangará da Serra"
  };

  const isVipCustomer = Boolean(
    selectedCustomer?.isVip || 
    selectedCustomer?.segment === "vip" || 
    (selectedCustomer?.code && selectedCustomer.code.startsWith("VIP")) ||
    (selectedCustomer?.tags && selectedCustomer.tags.includes("VIP"))
  );

  const isFreeDeliveryByThreshold = subtotal > 0 && subtotal >= (selectedBairro.freeShippingMin || 120);
  const calculatedDeliveryFee = orderType === "delivery" 
    ? (isVipCustomer ? 0 : (isFreeDeliveryByThreshold ? 0 : selectedBairro.fee))
    : 0;

  const totalWithDelivery = subtotal + calculatedDeliveryFee;
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashGiven - totalWithDelivery) : 0;"""

if 'const totalWithDelivery' not in content:
    assert old_subtotal_calc in content, "old_subtotal_calc not found"
    content = content.replace(old_subtotal_calc, new_subtotal_calc, 1)
    print("4. Calculations updated")

# 5. Replace header buttons with clean organized toolbar
header_find = '<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">'
header_end_target = '      {/* Navegação entre os 3 Modos Operacionais */}'

start_h_idx = content.find(header_find)
assert start_h_idx != -1, "header_find not found"
end_h_idx = content.find(header_end_target, start_h_idx)
assert end_h_idx != -1, "header_end_target not found"

new_clean_header = """      {/* Header Principal Organizado e Elegante (Sem Poluição Visual) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--salmon)]/10 text-[var(--salmon)]">
              Frente de Caixa &amp; Salão Zuma
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">PDV Express v3.0 · Tangará da Serra &amp; MT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-1">
            Frente de Caixa, Mapa de Mesas &amp; Turno
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Venda balcão &amp; delivery, comanda de salão, divisão de conta, motor offline-first e NFC-e SEFAZ-MT.
          </p>
        </div>

        {/* Barra de Ações Operacionais Agrupadas e Status Consolidado */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Card de Status Unificado do Caixa & Nuvem */}
          <div className="flex items-center bg-[var(--surface2)] border border-[var(--line)] rounded-xl p-1 text-xs shadow-2xs">
            {/* Status do Caixa */}
            <button
              onClick={() => setActiveTab("gestao_caixa")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--ink)] font-semibold transition cursor-pointer"
              title="Clique para gerenciar sangrias, suprimentos e fechamento de turno"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Caixa Aberto</span>
              <span className="text-[var(--muted)] font-mono text-[11px] hidden sm:inline">· {cashRegister?.operator || "Mariana"}</span>
            </button>

            <span className="w-px h-4 bg-[var(--line)] mx-1" />

            {/* Status da Nuvem & Modo Offline */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                isOnline && pendingCount === 0
                  ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                  : isSyncing
                  ? "text-blue-600 animate-pulse hover:bg-blue-500/10"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
              title="Status da conexão com Google Cloud Run e fila de contingência"
            >
              {isOnline && pendingCount === 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Nuvem Ativa</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline ({pendingCount})</span>
                </>
              )}
            </button>
          </div>

          {/* Botão Primário 1: Bairros & Frete MT */}
          <button
            onClick={() => setIsBairrosFreteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Gestão de CEPs de Tangará da Serra e Cidades do Estado de MT"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Bairros &amp; Frete MT</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-800 text-white text-[10px] font-mono">
              {allDeliveryBairros.length || 62}
            </span>
          </button>

          {/* Botão Primário 2: Central Fiscal NFC-e */}
          <button
            onClick={() => setIsContingenciaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Central de Emissão Fiscal NFC-e SEFAZ-MT"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Fiscal NFC-e</span>
            {(contingencyQueueQuery.data?.length || 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                {contingencyQueueQuery.data?.length}
              </span>
            )}
          </button>

          {/* Botão Primário 3: Instalar PDV (Win / Mac / iPad) */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Instalar App no Windows 10/11, macOS ou iPad"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar PDV</span>
          </button>

          {/* Menu Dropdown Agrupado: "Ferramentas ▾" */}
          <div className="relative">
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Ferramentas</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
            </button>

            {isToolsMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1"
                onMouseLeave={() => setIsToolsMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Frente de Loja &amp; Salão
                </div>
                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    const isBalcao = activeTab === "pdv_balcao";
                    setImpressaoPayload({
                      tipoComanda: "pre_conta",
                      mesa: isBalcao ? "Balcão PDV Híbrido" : selectedTableNumber,
                      cliente: isBalcao ? (selectedCustomer?.name || customerName) : "Cliente Salão",
                      itens: isBalcao 
                        ? cart.map(i => ({ nome: i.nome, q: i.q, preco: i.preco }))
                        : selectedTable?.orderItems?.map(i => ({ nome: i.itemName, q: i.quantity, preco: i.unitPrice })) || [
                            { nome: "Combo 26 Peças", q: 1, preco: 69.90 },
                            { nome: "Hot Filadélfia Trufado", q: 1, preco: 31.90 }
                          ],
                      subtotal: isBalcao ? subtotal : (selectedTable?.subtotal || 101.80),
                      taxaServico: isBalcao ? 0 : (selectedTable?.subtotal || 101.80) * 0.1,
                      total: isBalcao ? totalWithDelivery - (appliedCoupon?.discount || 0) : (selectedTable?.subtotal || 101.80) * 1.1,
                      formaPagamento: paymentMethod === "pix" ? "Pix Sicredi" : paymentMethod === "apple_pay" ? "Apple Pay" : paymentMethod === "credito" ? "Cartão de Crédito" : paymentMethod === "debito" ? "Cartão de Débito" : "Dinheiro"
                    });
                    setIsImpressaoModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold">Bobina Térmica 80mm</div>
                    <div className="text-[10px] text-[var(--muted)]">Impressão de pré-conta e DANFE</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsCuponsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold">Cupons Zumi &amp; Fidelidade</div>
                    <div className="text-[10px] text-[var(--muted)]">Campanhas e códigos de desconto</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsIfoodCardapioModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-bold">Pausar Cardápio iFood</div>
                    <div className="text-[10px] text-[var(--muted)]">Pausar itens ou delivery por horário</div>
                  </div>
                </button>

                <div className="border-t border-[var(--line)] my-1" />

                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Auditoria &amp; Prevenção de Perdas
                </div>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsAuditoriaModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold">Auditoria &amp; PIN Gerencial</div>
                    <div className="text-[10px] text-[var(--muted)]">Cancelamentos e estornos com PIN</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsTrilhaAuditoriaModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Trilha de Auditoria</div>
                    <div className="text-[10px] text-[var(--muted)]">Logs de garçons, cozinha e caixa</div>
                  </div>
                </button>

                <div className="border-t border-[var(--line)] my-1" />

                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Nuvem &amp; Dispositivos
                </div>

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsInstallModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--ink)] text-left font-semibold cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-bold">Motor Offline &amp; Nuvem</div>
                    <div className="text-[10px] text-[var(--muted)]">Fila local e sincronização Cloud Run</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>\n\n"""

content = content[:start_h_idx] + new_clean_header + content[end_h_idx:]
print("5. Clean header applied")

# 6. Replace Right Panel (Comanda Balcão e Checkout)
old_right_start = '<div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">'
right_end_target = '{/* ========================================================= */}\n      {/* MODO 2: MAPA DE MESAS & COMANDAS DE SALÃO (KEETO POS)     */}'

start_r_idx = content.find(old_right_start)
assert start_r_idx != -1, "old_right_start not found"
end_r_idx = content.find(right_end_target, start_r_idx)
assert end_r_idx != -1, "right_end_target not found"

new_right_panel = """<div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
              {/* Header da Comanda com Toggle Balcão / Delivery */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[var(--salmon)]" />
                  <h2 className="text-base font-bold text-[var(--ink)]">
                    {orderType === "delivery" ? "Comanda Delivery MT" : "Comanda Balcão"}
                  </h2>
                </div>

                {/* Seletor Balcão vs Delivery */}
                <div className="flex bg-[var(--surface2)] p-0.5 rounded-lg border border-[var(--line)] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setOrderType("balcao")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                      orderType === "balcao" 
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-2xs" 
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <span>🏢 Balcão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                      orderType === "delivery" 
                        ? "bg-blue-600 text-white shadow-2xs" 
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Truck className="w-3 h-3" />
                    <span>🛵 Delivery MT</span>
                  </button>
                </div>
              </div>

              {/* IDENTIFICAÇÃO INTELIGENTE DO CLIENTE (CRM ZUMA) & REGRA VIP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[var(--muted)] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Cliente &amp; Fidelidade Zuma
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Novo Cliente</span>
                  </button>
                </div>

                {/* Card do Cliente Selecionado */}
                {selectedCustomer ? (
                  <div className={`p-3 rounded-xl border transition-all ${
                    isVipCustomer 
                      ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30" 
                      : "bg-[var(--surface2)] border-[var(--line)]"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isVipCustomer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9.5px] uppercase shadow-xs">
                              <Crown className="w-3 h-3 fill-slate-950" />
                              Cliente VIP
                            </span>
                          )}
                          <span className="font-extrabold text-xs text-[var(--ink)] truncate">
                            {selectedCustomer.name}
                          </span>
                          {selectedCustomer.code && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] font-bold">
                              {selectedCustomer.code}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-2 flex-wrap">
                          {selectedCustomer.phone && (
                            <span>📱 {selectedCustomer.phone}</span>
                          )}
                          {selectedCustomer.neighborhood && (
                            <span>📍 {selectedCustomer.neighborhood}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearchQuery("");
                          setIsCustomerDropdownOpen(true);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
                      >
                        Trocar
                      </button>
                    </div>

                    {/* Aviso de Entrega Grátis VIP */}
                    {isVipCustomer && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center gap-1.5 text-amber-800 dark:text-amber-200 font-extrabold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>ISENÇÃO TOTAL: Entrega 100% Grátis Cortesia VIP Zuma</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Campo de Busca Rápida de Cliente por Código, Nome ou WhatsApp */
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={e => {
                          setCustomerSearchQuery(e.target.value);
                          setIsCustomerDropdownOpen(true);
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        placeholder="Buscar cliente por Código (ex: VIP-01), Nome ou WhatsApp..."
                        className="w-full pl-8 pr-3 py-2 bg-[var(--surface2)] border border-[var(--line)] rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>

                    {/* Dropdown de Sugestões em Tempo Real */}
                    {isCustomerDropdownOpen && customerSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl max-h-56 overflow-y-auto z-40 divide-y divide-[var(--line)] text-xs">
                        {customerSearchResults.map((cust: any) => {
                          const isVip = Boolean(cust.isVip || cust.segment === "vip" || (cust.code && cust.code.startsWith("VIP")));
                          return (
                            <button
                              key={cust.id}
                              type="button"
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setCustomerName(cust.name);
                                if (cust.phone) setCpf(cust.phone);
                                setIsCustomerDropdownOpen(false);
                              }}
                              className="w-full p-2.5 text-left hover:bg-[var(--surface2)] transition flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {isVip ? (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] flex items-center gap-0.5">
                                      <Crown className="w-2.5 h-2.5" /> VIP
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-bold text-[9px]">
                                      {cust.code || "CLI"}
                                    </span>
                                  )}
                                  <span className="font-bold text-[var(--ink)] truncate">{cust.name}</span>
                                </div>
                                <div className="text-[10px] text-[var(--muted)] font-mono">
                                  {cust.phone} · {cust.neighborhood || "Tangará da Serra"}
                                </div>
                              </div>

                              {isVip && (
                                <span className="text-[10px] text-emerald-600 font-extrabold shrink-0">
                                  Frete Grátis 👑
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SELEÇÃO DE BAIRRO / CEP DE MATO GROSSO (SE FOR DELIVERY) */}
              {orderType === "delivery" && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Bairro / CEP de Destino MT:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsBairrosFreteModalOpen(true)}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Gerenciar Fretes ({allDeliveryBairros.length})
                    </button>
                  </div>

                  <select
                    value={selectedDeliveryBairroId}
                    onChange={e => setSelectedDeliveryBairroId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg font-semibold text-xs text-[var(--ink)] focus:outline-hidden"
                  >
                    {allDeliveryBairros.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.cidade || "Tangará"}) · CEP {b.cep} · {b.distanceKm}km (Ref: R$ {b.fee.toFixed(2)})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[var(--muted)]">
                      {selectedBairro.distanceKm} km · Prazo médio ~{selectedBairro.avgTimeMin} min
                    </span>

                    {isVipCustomer ? (
                      <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        Frete Grátis Cortesia VIP
                      </span>
                    ) : isFreeDeliveryByThreshold ? (
                      <span className="font-extrabold text-emerald-600">
                        Frete Grátis (Meta Atingida)
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-[var(--ink)]">
                        Taxa: R$ {calculatedDeliveryFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Lista de Itens do Carrinho */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-[var(--muted)] text-xs italic">
                    Nenhum item adicionado ao carrinho.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.nome} className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[var(--ink)] truncate">{item.nome}</span>
                          {item.departamento === "moda" ? (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 font-bold text-[9px] shrink-0">
                              👗 Moda
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 font-bold text-[9px] shrink-0">
                              🍣 Sushi
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] font-mono">
                          <span>{formatBrl(item.preco)} cada</span>
                          {item.ean13 && <span>· EAN: {item.ean13}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.nome, -1)}
                          className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--ink)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-xs">{item.q}</span>
                        <button
                          onClick={() => updateQuantity(item.nome, 1)}
                          className="w-6 h-6 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--ink)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs text-[var(--ink)] min-w-[65px] text-right">
                        {formatBrl(item.preco * item.q)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Formas de Pagamento Rápidas */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">Forma de Pagamento</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "pix", label: "Pix Sicredi", icon: QrCode, badge: "0% Taxa" },
                    { id: "credito", label: "Crédito", icon: CreditCard },
                    { id: "debito", label: "Débito", icon: CreditCard },
                    { id: "apple_pay", label: "Apple Pay", icon: Smartphone },
                    { id: "dinheiro", label: "Dinheiro", icon: Banknote },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? "bg-[var(--ink)] text-white border-transparent shadow-xs"
                            : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Campo de Dinheiro e Troco */}
                {paymentMethod === "dinheiro" && (
                  <div className="p-3 bg-[var(--surface2)] rounded-lg border border-[var(--line)] flex items-center justify-between text-xs mt-2">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Valor Entregue pelo Cliente:</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-bold">R$</span>
                        <input
                          type="number"
                          value={cashGiven}
                          onChange={e => setCashGiven(parseFloat(e.target.value) || 0)}
                          className="w-20 px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono font-bold text-xs"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--muted)] block">Troco a Devolver:</span>
                      <span className="font-mono font-bold text-sm text-[var(--good)]">
                        {formatBrl(troco)}
                      </span>
                    </div>
                  </div>
                )}

                {/* CPF na Nota */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="CPF na NFC-e (Programa Nota MT)"
                    className="flex-1 px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded text-xs font-mono text-[var(--ink)]"
                  />
                </div>
              </div>

              {/* Totais e Botão de Finalização */}
              <div className="pt-3 border-t border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Subtotal Itens:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">{formatBrl(subtotal)}</span>
                </div>

                {orderType === "delivery" && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      Frete Entrega ({selectedBairro.name}):
                    </span>
                    {isVipCustomer ? (
                      <span className="font-black text-emerald-600 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-500" />
                        GRÁTIS (VIP 👑)
                      </span>
                    ) : isFreeDeliveryByThreshold ? (
                      <span className="font-black text-emerald-600">
                        GRÁTIS (Acima R$ {selectedBairro.freeShippingMin})
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-[var(--ink)]">
                        {formatBrl(calculatedDeliveryFee)}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
                  <span className="text-xs text-[var(--muted)] font-medium">Total do Pedido:</span>
                  <span className="text-xl font-bold font-mono text-[var(--salmon)]">
                    {formatBrl(totalWithDelivery)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending || cart.length === 0}
                  className="w-full py-2.5 rounded-lg bg-[var(--salmon)] hover:bg-[#d04530] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{createOrderMutation.isPending ? "Emitindo NFC-e..." : "Finalizar Venda & Emitir NFC-e"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}\n\n      """

content = content[:start_r_idx] + new_right_panel + content[end_r_idx:]
print("6. Right Panel with VIP and MT delivery updated")

# 7. Add Modal for "+ Novo Cliente" before closing div
end_div_target = """      <ModalInstalarPdv
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />"""
assert end_div_target in content, "end_div_target not found"

new_customer_modal = """      <ModalInstalarPdv
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* MODAL DE CADASTRO RÁPIDO DE CLIENTE (COM FLAG VIP & FRETE GRÁTIS) */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h4 className="text-base font-black text-[var(--ink)]">
                  Cadastrar Cliente no Zuma CRM
                </h4>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCustomerMutation.mutate({
                  name: newCustForm.name,
                  phone: newCustForm.phone,
                  neighborhood: newCustForm.neighborhood,
                  address: newCustForm.address,
                  cep: newCustForm.cep,
                  cidade: newCustForm.cidade,
                  isVip: newCustForm.isVip,
                  notes: newCustForm.notes
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newCustForm.name}
                  onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })}
                  placeholder="Ex: Dra. Juliana Albuquerque"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Telefone WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustForm.phone}
                    onChange={e => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    placeholder="(65) 99812-0000"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Bairro / Região MT
                  </label>
                  <input
                    type="text"
                    value={newCustForm.neighborhood}
                    onChange={e => setNewCustForm({ ...newCustForm, neighborhood: e.target.value })}
                    placeholder="Centro, Jd Europa..."
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={newCustForm.cep}
                    onChange={e => setNewCustForm({ ...newCustForm, cep: e.target.value })}
                    placeholder="78300-000"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={newCustForm.cidade}
                    onChange={e => setNewCustForm({ ...newCustForm, cidade: e.target.value })}
                    placeholder="Tangará da Serra"
                    className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                  Endereço Completo (Rua / Número / Apto)
                </label>
                <input
                  type="text"
                  value={newCustForm.address}
                  onChange={e => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  placeholder="Av. Brasil, 120 - Apto 402"
                  className="w-full px-3 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg font-semibold"
                />
              </div>

              {/* CHECKBOX CLIENTE VIP (FRETE GRÁTIS VITALÍCIO) */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-black text-amber-900 dark:text-amber-200 text-xs block">
                      Cliente VIP Zuma
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      Garante Entrega 100% Grátis em todos os pedidos
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={newCustForm.isVip}
                  onChange={e => setNewCustForm({ ...newCustForm, isVip: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createCustomerMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {createCustomerMutation.isPending ? "Cadastrando..." : "Salvar & Vincular ao Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}"""

content = content.replace(end_div_target, new_customer_modal, 1)
print("7. New Customer Modal added")

with open('/home/ubuntu/zuma/client/src/pages/PdvCaixa.tsx', 'w') as f:
    f.write(content)

print("PdvCaixa.tsx updated successfully!")
