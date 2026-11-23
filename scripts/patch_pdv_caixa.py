#!/usr/bin/env python3
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
    print("Icons imported")

# 2. Add new states
state_target = '  const [cashClosedSummary, setCashClosedSummary] = useState<any>(null);'
new_states = '''  const [cashClosedSummary, setCashClosedSummary] = useState<any>(null);

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
  });'''

if 'const [isToolsMenuOpen' not in content:
    assert state_target in content, "state_target not found"
    content = content.replace(state_target, new_states, 1)
    print("New states added")

# 3. Add Queries & Mutations
query_target = '  const cashRegisterQuery = trpc.zuma.getCashRegister.useQuery();'
new_queries = '''  const cashRegisterQuery = trpc.zuma.getCashRegister.useQuery();

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
  });'''

if 'searchPdvCustomers.useQuery' not in content:
    assert query_target in content, "query_target not found"
    content = content.replace(query_target, new_queries, 1)
    print("New queries & mutations added")

# 4. Update delivery calculations and troco
old_subtotal_calc = '''  const subtotal = cart.reduce((s, i) => s + i.preco * i.q, 0);
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashGiven - subtotal) : 0;'''

new_subtotal_calc = '''  const subtotal = cart.reduce((s, i) => s + i.preco * i.q, 0);

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
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashGiven - totalWithDelivery) : 0;'''

if 'const totalWithDelivery' not in content:
    assert old_subtotal_calc in content, "old_subtotal_calc not found"
    content = content.replace(old_subtotal_calc, new_subtotal_calc, 1)
    print("Calculations updated")

# 5. Replace header buttons with clean organized toolbar
old_header_start = '''      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--salmon)]/10 text-[var(--salmon)]">
              Frente de Caixa & Salão Zuma
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">PDV Express v3.0 · Superior ao Saipos</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-1">
            Frente de Caixa, Mapa de Mesas & Turno
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Venda no balcão em 2 toques, comanda eletrônica de salão com divisão de conta por pessoa, sangrias, suprimentos e emissão de NFC-e SEFAZ-MT.
          </p>
        </div>'''

# Find the end of this header block before navigation buttons
header_find = '<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">'
header_end_target = '      {/* Navegação entre os 3 Modos Operacionais */}'

start_h_idx = content.find(header_find)
assert start_h_idx != -1, "header_find not found"
end_h_idx = content.find(header_end_target, start_h_idx)
assert end_h_idx != -1, "header_end_target not found"

new_clean_header = '''      {/* Header Principal Organizado e Elegante (Sem Poluição Visual) */}
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
            Venda balcão &amp; delivery, comanda eletrônica de salão, divisão de conta, motor offline-first e NFC-e SEFAZ-MT.
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

          {/* Menu Dropdown Agrupado: "Ferramentas & Ações ▾" */}
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
      </div>\n\n'''

content = content[:start_h_idx] + new_clean_header + content[end_h_idx:]
print("Clean header applied!")

with open('/home/ubuntu/zuma/client/src/pages/PdvCaixa.tsx', 'w') as f:
    f.write(content)

print("PdvCaixa.tsx header patched successfully!")
