import re

file_path = '/home/ubuntu/zuma/client/src/pages/PdvCaixa.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# =========================================================================
# RESOLVE CONFLICT 1: Lines ~568 to ~646
# =========================================================================
conflict1_regex = r'<<<<<<< HEAD\n.*?=======\n.*?>>>>>>> backup-pdv-vip-frete'

replacement1 = """  const selectedBairro = allDeliveryBairros.find(b => b.id === selectedDeliveryBairroId || b.id === selectedNeighborhoodId) || allDeliveryBairros[0] || currentNeighborhood;

  const isVipCustomer = Boolean(
    selectedCustomer?.isVip || 
    selectedCustomer?.segment === "vip" || 
    (selectedCustomer?.code && selectedCustomer.code.startsWith("VIP")) ||
    (selectedCustomer?.tags && selectedCustomer.tags.includes("VIP"))
  );

  const isFreeShipping = isVipCustomer || (subtotal > 0 && subtotal >= (selectedBairro.freeShippingMin || currentNeighborhood.freeShippingMin || 100.0));
  const isFreeDeliveryByThreshold = !isVipCustomer && (subtotal > 0 && subtotal >= (selectedBairro.freeShippingMin || 100.0));
  
  const isDeliveryMode = saleMode === "delivery" || orderType === "delivery";
  const deliveryFee = isDeliveryMode 
    ? (isVipCustomer ? 0 : (isFreeShipping ? 0 : (selectedBairro.fee + (rainModeActive ? (selectedBairro.rainSurcharge || 3.0) : 0))))
    : 0;
  const calculatedDeliveryFee = deliveryFee;
  const finalTotal = Math.max(0, subtotal + deliveryFee - (appliedCoupon?.discount || 0));
  const totalWithDelivery = finalTotal;
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashGiven - finalTotal) : 0;

  const handleSelectNeighborhood = (id: string) => {
    setSelectedNeighborhoodId(id);
    setSelectedDeliveryBairroId(id);
    const found = allDeliveryBairros.find(n => n.id === id) || deliveryNeighborhoods.find(n => n.id === id);
    if (found && found.cep) {
      setDeliveryCep(found.cep);
    }
  };

  const handleCepInput = (cepTyped: string) => {
    setDeliveryCep(cepTyped);
    const clean = cepTyped.replace(/\D/g, "");
    if (clean.length >= 4) {
      const match = (allDeliveryBairros.length ? allDeliveryBairros : deliveryNeighborhoods).find(b => {
        const bClean = (b.cep || "").replace(/\D/g, "");
        if (bClean.startsWith(clean)) return true;
        const ini = b.cepInicial ? b.cepInicial.replace(/\D/g, "") : "";
        const fim = b.cepFinal ? b.cepFinal.replace(/\D/g, "") : "";
        if (ini && fim && clean >= ini.substring(0, clean.length) && clean <= fim.substring(0, clean.length)) return true;
        return false;
      });
      if (match) {
        setSelectedNeighborhoodId(match.id);
        setSelectedDeliveryBairroId(match.id);
      }
    }
  };

  const FREQUENT_CUSTOMERS_TANGARA = [
    { nome: "Thiago Silveira", tel: "(65) 99981-3320", bairroId: "tga-01", rua: "Rua Júlio Martinez Benevides", num: "820", comp: "Apto 302 - Ed. Buritis", ref: "Próximo à Praça dos Pioneiros" },
    { nome: "Dra. Vanessa Lima", tel: "(65) 99812-4410", bairroId: "tga-03", rua: "Av. Lions Internacional", num: "2150", comp: "Casa 4", ref: "Condomínio Fechado" },
    { nome: "Eng. Carlos Mendes", tel: "(65) 99650-8820", bairroId: "tga-06", rua: "Rua 24", num: "612", comp: "Casa", ref: "Em frente ao Mercado Esperança" },
    { nome: "Mariana Sampaio", tel: "(65) 99234-5566", bairroId: "tga-07", rua: "Rua 19", num: "340", comp: "Sobrado", ref: "Portão Cinza" },
  ];

  const handleFillFrequentCustomer = (c: typeof FREQUENT_CUSTOMERS_TANGARA[0]) => {
    setCustomerName(c.nome);
    setDeliveryPhone(c.tel);
    setSelectedNeighborhoodId(c.bairroId);
    setSelectedDeliveryBairroId(c.bairroId);
    setDeliveryStreet(c.rua);
    setDeliveryNumber(c.num);
    setDeliveryComplement(c.comp);
    setDeliveryReference(c.ref);
    const neigh = allDeliveryBairros.find(n => n.id === c.bairroId) || deliveryNeighborhoods.find(n => n.id === c.bairroId);
    if (neigh && neigh.cep) setDeliveryCep(neigh.cep);
    toast.success(`Dados de ${c.nome} preenchidos!`);
  };"""

# Check if conflict 1 matches
matches = list(re.finditer(conflict1_regex, content, re.DOTALL))
print(f"Total conflict blocks found with regex: {len(matches)}")
assert len(matches) == 3, f"Expected 3 conflicts, found {len(matches)}"

# Replace conflict 1
content = content[:matches[0].start()] + replacement1 + content[matches[0].end():]

# Re-match for conflict 2 and 3 after first replacement
matches = list(re.finditer(conflict1_regex, content, re.DOTALL))
assert len(matches) == 2, f"Expected 2 remaining conflicts, found {len(matches)}"

# =========================================================================
# RESOLVE CONFLICT 2: Seletor de Modalidade e Header da Comanda
# =========================================================================
replacement2 = """              {/* Header da Comanda com Toggle Balcão / Delivery MT */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[var(--salmon)]" />
                  <h2 className="text-base font-bold text-[var(--ink)]">
                    {orderType === "delivery" || saleMode === "delivery" ? "Comanda Delivery MT" : "Comanda Balcão"}
                  </h2>
                </div>

                {/* Seletor Balcão vs Delivery MT */}
                <div className="flex bg-[var(--surface2)] p-0.5 rounded-lg border border-[var(--line)] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setSaleMode("balcao");
                      setOrderType("balcao");
                    }}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                      (saleMode === "balcao" && orderType === "balcao") || orderType === "balcao"
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-2xs" 
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Balcão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSaleMode("delivery");
                      setOrderType("delivery");
                    }}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                      saleMode === "delivery" || orderType === "delivery"
                        ? "bg-blue-600 text-white shadow-2xs" 
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>🛵 Delivery MT</span>
                  </button>
                </div>
              </div>"""

content = content[:matches[0].start()] + replacement2 + content[matches[0].end():]

# Re-match for conflict 3
matches = list(re.finditer(conflict1_regex, content, re.DOTALL))
assert len(matches) == 1, f"Expected 1 remaining conflict, found {len(matches)}"

# =========================================================================
# RESOLVE CONFLICT 3: Totais com Desconto de Frete Grátis VIP Automático
# =========================================================================
replacement3 = """                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>Subtotal dos Itens:</span>
                    <span className="font-mono font-bold text-[var(--ink)]">{formatBrl(subtotal)}</span>
                  </div>

                  {(orderType === "delivery" || saleMode === "delivery") && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        Taxa de Entrega ({selectedBairro.name || currentNeighborhood.name}):
                      </span>
                      {isVipCustomer ? (
                        <span className="font-black text-emerald-600 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          GRÁTIS (VIP 👑)
                        </span>
                      ) : isFreeShipping || isFreeDeliveryByThreshold ? (
                        <span className="font-black text-emerald-600">
                          GRÁTIS (Acima de {formatBrl(selectedBairro.freeShippingMin || 100)})
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-[var(--ink)]">
                          {formatBrl(deliveryFee)}
                        </span>
                      )}
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs text-emerald-600">
                      <span>Cupom ({appliedCoupon.code}):</span>
                      <span className="font-mono font-bold">- {formatBrl(appliedCoupon.discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
                    <span className="text-xs font-bold text-[var(--ink)]">Total Geral a Pagar:</span>
                    <span className="text-xl font-black font-mono text-[var(--salmon)]">
                      {formatBrl(finalTotal)}
                    </span>
                  </div>
                </div>"""

content = content[:matches[0].start()] + replacement3 + content[matches[0].end():]

with open(file_path, 'w') as f:
    f.write(content)

print("All 3 conflicts in PdvCaixa.tsx resolved successfully!")
