#!/usr/bin/env python3
import re

with open('/home/ubuntu/zuma/server/dataStore.ts', 'r') as f:
    content = f.read()

# 1. Update CustomerProfile interface
old_cp = '''export interface CustomerProfile {
  id: number;
  name: string;
  phone: string;
  neighborhood: string;'''

new_cp = '''export interface CustomerProfile {
  id: number;
  code?: string;
  name: string;
  phone: string;
  neighborhood: string;
  address?: string;
  cep?: string;
  cidade?: string;
  isVip?: boolean;'''

assert old_cp in content, "old_cp not found"
content = content.replace(old_cp, new_cp, 1)

# 2. Update DeliveryNeighborhood interface
old_dn = '''export interface DeliveryNeighborhood {
  id: string;
  name: string;
  zone: string;'''

new_dn = '''export interface DeliveryNeighborhood {
  id: string;
  name: string;
  cidade?: string;
  zone: string;'''

assert old_dn in content, "old_dn not found"
content = content.replace(old_dn, new_dn, 1)

# 3. Add searchCustomers and createOrUpdateCustomerPdv
customer_methods = '''
  public searchCustomers(query: string): CustomerProfile[] {
    const list = this.getCustomers();
    if (!query || !query.trim()) {
      return list.slice(0, 15);
    }
    const qLower = query.toLowerCase().trim();
    const qDigits = query.replace(/\\D/g, "");

    return list.filter(c => {
      const matchName = c.name.toLowerCase().includes(qLower);
      const matchCode = c.code ? c.code.toLowerCase().includes(qLower) : false;
      const matchPhone = qDigits.length >= 3 && c.phone.replace(/\\D/g, "").includes(qDigits);
      const matchNeighborhood = c.neighborhood ? c.neighborhood.toLowerCase().includes(qLower) : false;
      return matchName || matchCode || matchPhone || matchNeighborhood;
    });
  }

  public createOrUpdateCustomerPdv(input: {
    code?: string;
    name: string;
    phone: string;
    neighborhood?: string;
    address?: string;
    cep?: string;
    cidade?: string;
    isVip?: boolean;
    notes?: string;
  }): CustomerProfile {
    const list = this.getCustomers();
    const cleanPhoneDigits = input.phone.replace(/\\D/g, "");

    let existing = list.find(c => 
      (input.code && c.code && c.code.toLowerCase() === input.code.toLowerCase()) ||
      (cleanPhoneDigits.length >= 8 && c.phone.replace(/\\D/g, "").endsWith(cleanPhoneDigits.slice(-8))) ||
      c.name.toLowerCase() === input.name.toLowerCase()
    );

    const isVip = input.isVip ?? (existing?.segment === "vip" || existing?.tags?.includes("VIP") || existing?.isVip || false);
    const segment = isVip ? "vip" : (existing?.segment || "novo");
    const tags = Array.from(new Set([
      ...(existing?.tags || []),
      ...(isVip ? ["VIP", "Frete Grátis"] : ["PDV Balcão"])
    ]));

    if (existing) {
      existing.name = input.name;
      existing.phone = input.phone;
      if (input.code) existing.code = input.code;
      if (input.neighborhood) existing.neighborhood = input.neighborhood;
      if (input.address) existing.address = input.address;
      if (input.cep) existing.cep = input.cep;
      if (input.cidade) existing.cidade = input.cidade;
      existing.segment = segment;
      existing.isVip = isVip;
      existing.tags = tags;
      if (input.notes) {
        existing.learnedNotes = existing.learnedNotes || [];
        existing.learnedNotes.push(input.notes);
      }
      this.saveData(this.data);
      return existing;
    } else {
      const nextId = (list.length ? Math.max(...list.map(c => c.id)) : 0) + 1;
      const code = input.code || (isVip ? `VIP-${String(nextId).padStart(2, "0")}` : `CLI-${String(nextId).padStart(3, "0")}`);
      const newCust: CustomerProfile = {
        id: nextId,
        code,
        name: input.name,
        phone: input.phone,
        neighborhood: input.neighborhood || "Centro",
        address: input.address || "",
        cep: input.cep || "78300-000",
        cidade: input.cidade || "Tangará da Serra",
        segment,
        isVip,
        ordersCount: 1,
        totalSpent: "0.00",
        daysSinceLastOrder: 0,
        favoriteDish: "Combo 26 Peças",
        optIn: true,
        tags,
        dietaryPreferences: [],
        priceSensitivity: isVip ? "Baixa - Preza por exclusividade e frete grátis" : "Padrão",
        aiProfileSummary: isVip ? "Cliente VIP com entrega grátis cadastrado pelo PDV." : "Cliente cadastrado pelo PDV Caixa.",
        recommendedDish: "Combo 26 Peças Zuma",
        recommendedPromo: isVip ? "Frete Grátis Cortesia VIP Vitalício" : "Desconto no primeiro pedido",
        aiSalesTrigger: isVip ? "Atendimento VIP exclusivo com prioridade máxima." : "Boas-vindas ao Zuma.",
        learnedNotes: input.notes ? [input.notes] : ["Cadastrado pelo PDV Express Zuma"]
      };
      list.push(newCust);
      this.saveData(this.data);
      return newCust;
    }
  }
'''

target_cust = 'public getCustomerByName(name: string): CustomerProfile | undefined {'
assert target_cust in content, "target_cust not found"
content = content.replace(target_cust, customer_methods + '\n  ' + target_cust, 1)

# 4. Update lookupCepTangara to support customerParam and entire MT state
old_lookup = '''  public lookupCepTangara(cepOrSearch: string, orderTotal: number = 0): {
    found: boolean;
    neighborhood?: DeliveryNeighborhood;
    fee: number;
    isFreeShipping: boolean;
    estimatedMinutes: number;
    message: string;
  } {
    const list = this.getDeliveryNeighborhoods();
    const cleanDigits = (cepOrSearch || "").replace(/\\D/g, "");
    const searchLower = (cepOrSearch || "").toLowerCase().trim();

    // 1. Busca por CEP exato ou faixa
    let found = list.find(b => {
      const bCep = (b.cep || "").replace(/\\D/g, "");
      if (cleanDigits.length >= 5 && bCep.startsWith(cleanDigits.slice(0, 5))) return true;
      if (cleanDigits.length === 8 && b.cepInicial && b.cepFinal) {
        const ini = b.cepInicial.replace(/\\D/g, "");
        const fim = b.cepFinal.replace(/\\D/g, "");
        if (cleanDigits >= ini && cleanDigits <= fim) return true;
      }
      return false;
    });

    // 2. Busca por nome do bairro se não encontrou por CEP
    if (!found && searchLower) {
      found = list.find(b => 
        b.name.toLowerCase().includes(searchLower) || 
        searchLower.includes(b.name.toLowerCase()) ||
        (b.logradourosPrincipais && b.logradourosPrincipais.toLowerCase().includes(searchLower))
      );
    }

    // Fallback para Centro se estiver em Tangará mas sem bairro específico
    if (!found && (cleanDigits.startsWith("78300") || cleanDigits.startsWith("7830"))) {
      found = list.find(b => b.zone === "Centro") || list[0];
    }

    if (!found) {
      return {
        found: false,
        fee: 10.0,
        isFreeShipping: false,
        estimatedMinutes: 35,
        message: "CEP ou Bairro fora do perímetro homologado de Tangará da Serra (MT). Taxa padrão aplicada."
      };
    }

    const isFree = orderTotal > 0 && orderTotal >= (found.freeShippingMin || 120.0);
    const finalFee = isFree ? 0 : found.fee;

    return {
      found: true,
      neighborhood: found,
      fee: finalFee,
      isFreeShipping: isFree,
      estimatedMinutes: found.avgTimeMin,
      message: isFree 
        ? "Frete Grátis ativado para " + found.name + " (Pedido acima de R$ " + found.freeShippingMin.toFixed(2) + ")!"
        : "Taxa de entrega para " + found.name + ": R$ " + found.fee.toFixed(2) + " (Prazo médio " + found.avgTimeMin + " min)"
    };
  }'''

new_lookup = '''  public lookupCepTangara(
    cepOrSearch: string, 
    orderTotal: number = 0,
    customerParam?: { code?: string; phone?: string; isVip?: boolean }
  ): {
    found: boolean;
    neighborhood?: DeliveryNeighborhood;
    fee: number;
    isFreeShipping: boolean;
    isVipFreeShipping?: boolean;
    estimatedMinutes: number;
    message: string;
  } {
    const list = this.getDeliveryNeighborhoods();
    const cleanDigits = (cepOrSearch || "").replace(/\\D/g, "");
    const searchLower = (cepOrSearch || "").toLowerCase().trim();

    // Checagem se o cliente é VIP
    let isVip = customerParam?.isVip === true;
    if (!isVip && (customerParam?.code || customerParam?.phone)) {
      const matchCust = this.data.customers.find(c => 
        (customerParam.code && c.code && c.code.toLowerCase() === customerParam.code.toLowerCase()) ||
        (customerParam.phone && c.phone && c.phone.replace(/\\D/g, "").endsWith(customerParam.phone.replace(/\\D/g, "").slice(-8)))
      );
      if (matchCust && (matchCust.segment === "vip" || matchCust.tags?.includes("VIP") || matchCust.isVip)) {
        isVip = true;
      }
    }

    // 1. Busca por CEP exato ou faixa
    let found = list.find(b => {
      const bCep = (b.cep || "").replace(/\\D/g, "");
      if (cleanDigits.length >= 5 && bCep.startsWith(cleanDigits.slice(0, 5))) return true;
      if (cleanDigits.length === 8 && b.cepInicial && b.cepFinal) {
        const ini = b.cepInicial.replace(/\\D/g, "");
        const fim = b.cepFinal.replace(/\\D/g, "");
        if (cleanDigits >= ini && cleanDigits <= fim) return true;
      }
      return false;
    });

    // 2. Busca por nome do bairro ou cidade se não encontrou por CEP
    if (!found && searchLower) {
      found = list.find(b => 
        b.name.toLowerCase().includes(searchLower) || 
        searchLower.includes(b.name.toLowerCase()) ||
        (b.cidade && (b.cidade.toLowerCase().includes(searchLower) || searchLower.includes(b.cidade.toLowerCase()))) ||
        (b.logradourosPrincipais && b.logradourosPrincipais.toLowerCase().includes(searchLower))
      );
    }

    // 3. Fallback inteligente para cidades e CEPs de Mato Grosso (prefixo 78xxx)
    if (!found && cleanDigits.startsWith("78")) {
      if (cleanDigits.startsWith("78300") || cleanDigits.startsWith("7830")) {
        found = list.find(b => b.zone === "Centro") || list[0];
      } else if (cleanDigits.startsWith("780") || cleanDigits.startsWith("781")) {
        found = list.find(b => b.cidade === "Cuiabá" || b.cidade === "Várzea Grande") || list.find(b => b.id === "mt-01");
      } else if (cleanDigits.startsWith("787")) {
        found = list.find(b => b.cidade === "Rondonópolis") || list.find(b => b.id === "mt-07");
      } else if (cleanDigits.startsWith("7855")) {
        found = list.find(b => b.cidade === "Sinop") || list.find(b => b.id === "mt-08");
      } else if (cleanDigits.startsWith("7889")) {
        found = list.find(b => b.cidade === "Sorriso") || list.find(b => b.id === "mt-09");
      } else if (cleanDigits.startsWith("78370")) {
        found = list.find(b => b.cidade === "Nova Olímpia") || list.find(b => b.id === "viz-01");
      } else if (cleanDigits.startsWith("78380")) {
        found = list.find(b => b.cidade === "Barra do Bugres") || list.find(b => b.id === "viz-02");
      } else if (cleanDigits.startsWith("78360")) {
        found = list.find(b => b.cidade === "Campo Novo do Parecis") || list.find(b => b.id === "viz-04");
      } else {
        found = list.find(b => b.zone === "Cuiabá & Polos MT") || list.find(b => b.id === "mt-01");
      }
    }

    if (!found) {
      if (isVip) {
        return {
          found: false,
          fee: 0.0,
          isFreeShipping: true,
          isVipFreeShipping: true,
          estimatedMinutes: 30,
          message: "👑 Cliente VIP: Entrega Grátis Garantida em qualquer CEP do MT (Cortesia Fidelidade Zuma)!"
        };
      }
      return {
        found: false,
        fee: 12.0,
        isFreeShipping: false,
        isVipFreeShipping: false,
        estimatedMinutes: 35,
        message: "CEP ou Bairro fora do perímetro de Tangará da Serra (MT). Taxa padrão regional aplicada."
      };
    }

    if (isVip) {
      return {
        found: true,
        neighborhood: found,
        fee: 0.0,
        isFreeShipping: true,
        isVipFreeShipping: true,
        estimatedMinutes: found.avgTimeMin,
        message: "👑 Cliente VIP: Frete Grátis Cortesia Zuma para " + found.name + " (" + (found.cidade || "Tangará da Serra") + ")!"
      };
    }

    const isFree = orderTotal > 0 && orderTotal >= (found.freeShippingMin || 120.0);
    const finalFee = isFree ? 0 : found.fee;

    return {
      found: true,
      neighborhood: found,
      fee: finalFee,
      isFreeShipping: isFree,
      isVipFreeShipping: false,
      estimatedMinutes: found.avgTimeMin,
      message: isFree 
        ? "Frete Grátis ativado para " + found.name + " (Pedido acima de R$ " + found.freeShippingMin.toFixed(2) + ")!"
        : "Taxa de entrega para " + found.name + " (" + (found.cidade || "Tangará da Serra") + "): R$ " + found.fee.toFixed(2) + " (Prazo médio " + found.avgTimeMin + " min)"
    };
  }'''

assert old_lookup in content, "old_lookup not found"
content = content.replace(old_lookup, new_lookup, 1)

with open('/home/ubuntu/zuma/server/dataStore.ts', 'w') as f:
    f.write(content)

print("dataStore.ts successfully patched!")
