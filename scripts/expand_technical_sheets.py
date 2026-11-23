import os

TECHNICAL_SHEETS_CODE = '''export const ZUMA_TECHNICAL_SHEETS: TechnicalSheetItem[] = [
  // ==================== 1. COMBINADOS & BARCAS ====================
  {
    id: "bom_combo_26",
    dishName: "Combo 26 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 69.90,
    servings: 1,
    prepTimeMinutes: 14,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco (filé limpo)", quantityRecipeUnit: 0.22, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 15.07 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês temperado (Gohan)", quantityRecipeUnit: 0.35, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 3.43 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 3.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 1.65 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia", quantityRecipeUnit: 0.05, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.68 },
      { rawMaterialCode: "GERG-01", name: "Gergelim tostado", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.14 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem combinado 26p", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.95 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 2.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.50 },
      { rawMaterialCode: "SHOY-01", name: "Sachê de Shoyu (30ml)", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 }
    ],
    theoreticalCost: 24.78,
    cmvPercent: 35.45,
    grossMarginBrl: 45.12,
    grossMarginPercent: 64.55,
    chefNotes: "Campeão de vendas no delivery de Tangará. Montagem: 8 uramakis, 8 hossomakis, 6 niguiris e 4 sashimis."
  },
  {
    id: "bom_especial_68",
    dishName: "Especial Zuma 68 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 230.90,
    servings: 4,
    prepTimeMinutes: 28,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco nobre", quantityRecipeUnit: 0.58, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 39.73 },
      { rawMaterialCode: "ATUM-01", name: "Atum fresco Maguro", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 9.48 },
      { rawMaterialCode: "CAM-01", name: "Camarão furai crocante", quantityRecipeUnit: 0.14, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 12.04 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês cozido", quantityRecipeUnit: 0.72, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 7.06 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 7.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 3.85 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.11, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 3.69 },
      { rawMaterialCode: "PANK-01", name: "Farinha Panko", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.78 },
      { rawMaterialCode: "EMB-COMB", name: "Barca Térmica Master", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 3.80 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 4.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 1.00 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu sachê/garrafinha", quantityRecipeUnit: 0.08, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.96 }
    ],
    theoreticalCost: 82.39,
    cmvPercent: 35.68,
    grossMarginBrl: 148.51,
    grossMarginPercent: 64.32,
    chefNotes: "Prato de altíssimo tíquete médio. Barca perfeita para famílias e reuniões de agronegócio em Tangará."
  },
  {
    id: "bom_barco_40",
    dishName: "Barco Zuma Nobre 40 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 149.90,
    servings: 2,
    prepTimeMinutes: 20,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco nobre", quantityRecipeUnit: 0.38, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 26.03 },
      { rawMaterialCode: "ATUM-01", name: "Atum fresco Maguro", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 6.32 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês cozido", quantityRecipeUnit: 0.48, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 4.70 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 4.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 2.48 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia", quantityRecipeUnit: 0.07, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 2.35 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem Barco Luxo", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 2.50 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 2.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.50 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu tradicional", quantityRecipeUnit: 0.05, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.60 }
    ],
    theoreticalCost: 45.48,
    cmvPercent: 30.34,
    grossMarginBrl: 104.42,
    grossMarginPercent: 69.66,
    chefNotes: "Campeão do salão Zuma e jantares românticos. 12 sashimis, 10 niguiris especiais e 18 uramakis/hossomakis."
  },
  {
    id: "bom_combo_individual_16",
    dishName: "Combo Individual 16 Peças",
    category: "Combinados",
    station: "Sushibar (Frio)",
    salePrice: 49.90,
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco filé", quantityRecipeUnit: 0.15, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 10.28 },
      { rawMaterialCode: "ARR-01", name: "Arroz temperado Gohan", quantityRecipeUnit: 0.22, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 2.16 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 2.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 1.10 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem executiva", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.60 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 1.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.25 }
    ],
    theoreticalCost: 16.40,
    cmvPercent: 32.87,
    grossMarginBrl: 33.50,
    grossMarginPercent: 67.13,
    chefNotes: "Opção rápida para jantar individual no delivery. Montagem expressa em 10 minutos."
  },

  // ==================== 2. TEMAKIS ====================
  {
    id: "bom_temaki_salmao",
    dishName: "Temaki Salmão Completo",
    category: "Temakis",
    station: "Sushibar (Frio)",
    salePrice: 29.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco picado em cubos", quantityRecipeUnit: 0.11, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 7.54 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.78 },
      { rawMaterialCode: "NORI-01", name: "Alga nori inteira crocante", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.02, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.67 },
      { rawMaterialCode: "EMB-TEM", name: "Berço protetor térmico de temaki", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.85 },
      { rawMaterialCode: "SHOY-01", name: "Sachê de shoyu", quantityRecipeUnit: 0.02, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.24 }
    ],
    theoreticalCost: 10.63,
    cmvPercent: 35.55,
    grossMarginBrl: 19.27,
    grossMarginPercent: 64.45,
    chefNotes: "Nori ultra crocante embalado no plástico protetor para entrega perfeita sem amolecer."
  },
  {
    id: "bom_temaki_filadelfia",
    dishName: "Temaki Salmão Filadélfia",
    category: "Temakis",
    station: "Sushibar (Frio)",
    salePrice: 31.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco em cubos", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 8.22 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia dobrado", quantityRecipeUnit: 0.035, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.17 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.59 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "EMB-TEM", name: "Berço protetor térmico", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.85 }
    ],
    theoreticalCost: 11.38,
    cmvPercent: 35.67,
    grossMarginBrl: 20.52,
    grossMarginPercent: 64.33,
    chefNotes: "Cebolinha picada fininha e cream cheese original Philadelphia bem aerado."
  },
  {
    id: "bom_temaki_hot",
    dishName: "Temaki Hot Filadélfia Empanado",
    category: "Temakis",
    station: "Sushibar (Frio)",
    salePrice: 34.90,
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco", quantityRecipeUnit: 0.11, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 7.54 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "ARR-01", name: "Arroz temperado", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.78 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Farinha Panko para empanar", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.78 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para fritura", quantityRecipeUnit: 0.06, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.53 },
      { rawMaterialCode: "EMB-TEM", name: "Embalagem protetora", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.85 }
    ],
    theoreticalCost: 12.04,
    cmvPercent: 34.50,
    grossMarginBrl: 22.86,
    grossMarginPercent: 65.50,
    chefNotes: "Fritura rápida em óleo limpo a 180°C. Casquinha dourada crocante com recheio cremoso."
  },

  // ==================== 3. HOT ROLLS ====================
  {
    id: "bom_hot_filadelfia",
    dishName: "Hot Filadélfia (12un)",
    category: "Hot rolls",
    station: "Cozinha Quente",
    salePrice: 31.90,
    servings: 1,
    prepTimeMinutes: 12,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco picado", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 5.48 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.34 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.18 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Farinha panko flocada", quantityRecipeUnit: 0.035, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.68 },
      { rawMaterialCode: "OLEO-01", name: "Óleo vegetal térmico", quantityRecipeUnit: 0.08, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.71 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem térmica hot roll", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.10 }
    ],
    theoreticalCost: 11.04,
    cmvPercent: 34.61,
    grossMarginBrl: 20.86,
    grossMarginPercent: 65.39,
    chefNotes: "Prato com altíssima margem e giro imediato. Embalagem ventilada para reter crocância."
  },
  {
    id: "bom_hot_zuma",
    dishName: "Hot Zuma Especial (8un)",
    category: "Hot rolls",
    station: "Cozinha Quente",
    salePrice: 52.90,
    servings: 1,
    prepTimeMinutes: 15,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão nobre lombo", quantityRecipeUnit: 0.14, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 9.59 },
      { rawMaterialCode: "CAM-01", name: "Camarão topo maçaricado", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 5.16 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.34 },
      { rawMaterialCode: "ARR-01", name: "Arroz especial", quantityRecipeUnit: 0.10, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.98 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Farinha Panko", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.59 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem térmica hot roll", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.10 }
    ],
    theoreticalCost: 19.31,
    cmvPercent: 36.50,
    grossMarginBrl: 33.59,
    grossMarginPercent: 63.50,
    chefNotes: "Hot roll premium coberto com camarão fresco grelhado no maçarico com azeite trufado."
  },
  {
    id: "bom_hot_camarao",
    dishName: "Hot Camarão Crocante (8un)",
    category: "Hot rolls",
    station: "Cozinha Quente",
    salePrice: 44.90,
    servings: 1,
    prepTimeMinutes: 12,
    ingredients: [
      { rawMaterialCode: "CAM-01", name: "Camarão cinza limpo", quantityRecipeUnit: 0.10, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 8.60 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.10, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.98 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 1.0, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.55 },
      { rawMaterialCode: "PANK-01", name: "Panko crocante", quantityRecipeUnit: 0.035, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 0.68 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para fritura", quantityRecipeUnit: 0.08, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.71 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem térmica", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.10 }
    ],
    theoreticalCost: 13.63,
    cmvPercent: 30.36,
    grossMarginBrl: 31.27,
    grossMarginPercent: 69.64,
    chefNotes: "Camarões empanados um a um na farinha panko japonesa."
  },

  // ==================== 4. SASHIMIS & NIGUIRIS ====================
  {
    id: "bom_sashimi_12",
    dishName: "Sashimi Salmão Nobre (12 fatias)",
    category: "Sashimis",
    station: "Sushibar (Frio)",
    salePrice: 48.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Lombo nobre de salmão fresco", quantityRecipeUnit: 0.20, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 13.70 },
      { rawMaterialCode: "HORT-PEP", name: "Pepino fatiado decoração", quantityRecipeUnit: 0.02, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.15 },
      { rawMaterialCode: "WAS-01", name: "Wasabi japonês", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.23 },
      { rawMaterialCode: "EMB-COMB", name: "Berço selado sashimi", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.95 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 1.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.25 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu tradicional", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 }
    ],
    theoreticalCost: 16.64,
    cmvPercent: 34.03,
    grossMarginBrl: 32.26,
    grossMarginPercent: 65.97,
    chefNotes: "Corte do lombo central (otoro/chutoro). Textura sedosa e coloração laranja vibrante."
  },
  {
    id: "bom_sashimi_atum_12",
    dishName: "Sashimi Atum Maguro (12 fatias)",
    category: "Sashimis",
    station: "Sushibar (Frio)",
    salePrice: 52.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "ATUM-01", name: "Lombo nobre de atum vermelho", quantityRecipeUnit: 0.20, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 15.80 },
      { rawMaterialCode: "WAS-01", name: "Wasabi japonês", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.23 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem selada", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.95 },
      { rawMaterialCode: "EMB-HASHI", name: "Hashi embalado", quantityRecipeUnit: 1.0, recipeUnit: "pares", prepYieldPercent: 100.0, costShareBrl: 0.25 }
    ],
    theoreticalCost: 18.23,
    cmvPercent: 34.46,
    grossMarginBrl: 34.67,
    grossMarginPercent: 65.54,
    chefNotes: "Atum fresco classe exportação, lâminas de 15g perfeitamente anguladas."
  },
  {
    id: "bom_niguiri_salmao_trufado",
    dishName: "Niguiri Salmão Trufado (4un)",
    category: "Niguiris e gunkans",
    station: "Sushibar (Frio)",
    salePrice: 24.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão lâmina nobre", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 4.11 },
      { rawMaterialCode: "ARR-01", name: "Shari temperado", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.78 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem porção", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.20 }
    ],
    theoreticalCost: 6.09,
    cmvPercent: 24.46,
    grossMarginBrl: 18.81,
    grossMarginPercent: 75.54,
    chefNotes: "Maçaricado levemente na hora, finalizado com azeite de trufas brancas e flor de sal."
  },
  {
    id: "bom_gunkan_joy",
    dishName: "Gunkan Joy Geleia de Pimenta (4un)",
    category: "Niguiris e gunkans",
    station: "Sushibar (Frio)",
    salePrice: 26.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Tiras e picado de salmão", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 5.48 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese Philadelphia", quantityRecipeUnit: 0.025, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.84 },
      { rawMaterialCode: "ARR-01", name: "Shari arroz", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.59 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.20 }
    ],
    theoreticalCost: 8.11,
    cmvPercent: 30.15,
    grossMarginBrl: 18.79,
    grossMarginPercent: 69.85,
    chefNotes: "Salmão envolvendo o bolinho de arroz com topo cremoso e geleia artesanal."
  },

  // ==================== 5. URAMAKIS & HOSSOMAKIS ====================
  {
    id: "bom_uramaki_filadelfia",
    dishName: "Uramaki Filadélfia (8un)",
    category: "Uramakis",
    station: "Sushibar (Frio)",
    salePrice: 28.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco", quantityRecipeUnit: 0.07, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 4.80 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.01 },
      { rawMaterialCode: "ARR-01", name: "Arroz shari", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.18 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "GERG-01", name: "Gergelim tostado", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.14 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 8.81,
    cmvPercent: 30.48,
    grossMarginBrl: 20.09,
    grossMarginPercent: 69.52,
    chefNotes: "Rolado perfeito e homogêneo com arroz invertido e gergelim bicolor."
  },
  {
    id: "bom_uramaki_skin",
    dishName: "Uramaki Salmão Grelhado Skin (8un)",
    category: "Uramakis",
    station: "Sushibar (Frio)",
    salePrice: 24.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Aparas nobres e pele crocante", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 4.11 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.025, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.84 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.18 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 7.81,
    cmvPercent: 31.37,
    grossMarginBrl: 17.09,
    grossMarginPercent: 68.63,
    chefNotes: "Aproveitamento inteligente de aparas e pele de salmão frita e sequinha com molho tarê."
  },
  {
    id: "bom_hossomaki_shake",
    dishName: "Shakemaki Salmão (8un)",
    category: "Hossomakis",
    station: "Sushibar (Frio)",
    salePrice: 21.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão filé", quantityRecipeUnit: 0.05, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 3.43 },
      { rawMaterialCode: "ARR-01", name: "Arroz shari", quantityRecipeUnit: 0.09, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 0.88 },
      { rawMaterialCode: "NORI-01", name: "Alga nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "EMB-COMB", name: "Embalagem", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.20 }
    ],
    theoreticalCost: 5.79,
    cmvPercent: 26.44,
    grossMarginBrl: 16.11,
    grossMarginPercent: 73.56,
    chefNotes: "Hossomaki clássico e tradicional. Alga por fora bem esticada e arroz firme."
  },

  // ==================== 6. PRATOS QUENTES (OPERAÇÃO CHUVA) ====================
  {
    id: "bom_lamen_tradicional",
    dishName: "Lamen Tradicional Zuma",
    category: "Pratos quentes",
    station: "Cozinha Quente",
    salePrice: 38.90,
    servings: 1,
    prepTimeMinutes: 16,
    ingredients: [
      { rawMaterialCode: "LAM-01", name: "Massa fresca de Lamen", quantityRecipeUnit: 0.18, recipeUnit: "kg", prepYieldPercent: 150.0, costShareBrl: 2.88 },
      { rawMaterialCode: "MIGN-01", name: "Fatias de mignon bovino marinado", quantityRecipeUnit: 0.09, recipeUnit: "kg", prepYieldPercent: 90.0, costShareBrl: 5.22 },
      { rawMaterialCode: "SHOY-01", name: "Base shoyu e caldo dashi", quantityRecipeUnit: 0.05, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.60 },
      { rawMaterialCode: "HORT-PEP", name: "Cebolinha e broto de feijão", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.30 },
      { rawMaterialCode: "EMB-HOT", name: "Bowl térmico anti-vazamento", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 2.20 }
    ],
    theoreticalCost: 11.20,
    cmvPercent: 28.79,
    grossMarginBrl: 27.70,
    grossMarginPercent: 71.21,
    chefNotes: "O astro dos dias de chuva em Tangará. Caldo quente fumegante e embalagem térmica estanque."
  },
  {
    id: "bom_yakissoba_misto",
    dishName: "Yakissoba Misto Tradicional",
    category: "Pratos quentes",
    station: "Cozinha Quente",
    salePrice: 36.90,
    servings: 1,
    prepTimeMinutes: 14,
    ingredients: [
      { rawMaterialCode: "MASS-01", name: "Massa de yakissoba", quantityRecipeUnit: 0.16, recipeUnit: "kg", prepYieldPercent: 180.0, costShareBrl: 2.00 },
      { rawMaterialCode: "MIGN-01", name: "Filé mignon em tiras", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 90.0, costShareBrl: 3.48 },
      { rawMaterialCode: "FRAN-01", name: "Peito de frango em cubos", quantityRecipeUnit: 0.07, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 1.30 },
      { rawMaterialCode: "SHOY-01", name: "Molho especial de yakissoba", quantityRecipeUnit: 0.06, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.72 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para saltear", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.27 },
      { rawMaterialCode: "EMB-HOT", name: "Box térmico selado", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 9.17,
    cmvPercent: 24.85,
    grossMarginBrl: 27.73,
    grossMarginPercent: 75.15,
    chefNotes: "Legumes frescos e crocantes (acelga, cenoura, brócolis) salteados no fogo alto do wok."
  },
  {
    id: "bom_teppan_salmao",
    dishName: "Teppan de Salmão com Legumes",
    category: "Pratos quentes",
    station: "Cozinha Quente",
    salePrice: 41.90,
    servings: 1,
    prepTimeMinutes: 15,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Posta nobre de salmão", quantityRecipeUnit: 0.18, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 12.33 },
      { rawMaterialCode: "ARR-01", name: "Gohan arroz de acompanhamento", quantityRecipeUnit: 0.15, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.47 },
      { rawMaterialCode: "SHOY-01", name: "Molho tarê/manteiga", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem dupla térmica", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.80 }
    ],
    theoreticalCost: 15.96,
    cmvPercent: 38.09,
    grossMarginBrl: 25.94,
    grossMarginPercent: 61.91,
    chefNotes: "Salmão grelhado na chapa de ferro com casquinha crocante e interior suculento."
  },

  // ==================== 7. ENTRADAS ====================
  {
    id: "bom_shimeji",
    dishName: "Shimeji na Manteiga com Cebolinha",
    category: "Entradas",
    station: "Cozinha Quente",
    salePrice: 36.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "SHIM-01", name: "Cogumelo Shimeji preto fresco", quantityRecipeUnit: 0.20, recipeUnit: "kg", prepYieldPercent: 95.0, costShareBrl: 6.40 },
      { rawMaterialCode: "SHOY-01", name: "Shoyu e sake mirin", quantityRecipeUnit: 0.03, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.36 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem alumínio selada", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.30 }
    ],
    theoreticalCost: 8.06,
    cmvPercent: 21.84,
    grossMarginBrl: 28.84,
    grossMarginPercent: 78.16,
    chefNotes: "Entrada quente mais pedida no salão. Margem espetacular de 78%."
  },
  {
    id: "bom_sunomono",
    dishName: "Sunomono Especial com Salmão",
    category: "Entradas",
    station: "Sushibar (Frio)",
    salePrice: 22.90,
    servings: 1,
    prepTimeMinutes: 6,
    ingredients: [
      { rawMaterialCode: "HORT-PEP", name: "Pepino japonês finamente laminado", quantityRecipeUnit: 0.12, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.90 },
      { rawMaterialCode: "SALM-01", name: "Fatias nobres de salmão", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 2.74 },
      { rawMaterialCode: "VIN-01", name: "Molho agridoce de vinagre de arroz", quantityRecipeUnit: 0.04, recipeUnit: "L", prepYieldPercent: 100.0, costShareBrl: 0.58 },
      { rawMaterialCode: "GERG-01", name: "Gergelim tostado", quantityRecipeUnit: 0.005, recipeUnit: "kg", prepYieldPercent: 100.0, costShareBrl: 0.14 },
      { rawMaterialCode: "EMB-COMB", name: "Pote selado antivazamento", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.90 }
    ],
    theoreticalCost: 5.26,
    cmvPercent: 22.97,
    grossMarginBrl: 17.64,
    grossMarginPercent: 77.03,
    chefNotes: "Frescor absoluto e acidez balanceada para abrir o apetite."
  },
  {
    id: "bom_ceviche_misto",
    dishName: "Ceviche Nobre Misto Zuma",
    category: "Entradas",
    station: "Sushibar (Frio)",
    salePrice: 42.90,
    servings: 1,
    prepTimeMinutes: 10,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco em cubos", quantityRecipeUnit: 0.08, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 5.48 },
      { rawMaterialCode: "ATUM-01", name: "Atum vermelho em cubos", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 88.0, costShareBrl: 3.16 },
      { rawMaterialCode: "CAM-01", name: "Camarão marinado", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 92.0, costShareBrl: 3.44 },
      { rawMaterialCode: "HORT-AVO", name: "Avocado fresco fatiado", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 72.0, costShareBrl: 0.42 },
      { rawMaterialCode: "EMB-COMB", name: "Pote cristal luxo", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.40 }
    ],
    theoreticalCost: 13.90,
    cmvPercent: 32.40,
    grossMarginBrl: 29.00,
    grossMarginPercent: 67.60,
    chefNotes: "Marinado no limão taiti com cebola roxa fininha e toque de azeite e pimenta dedo-de-moça."
  },

  // ==================== 8. POKES ====================
  {
    id: "bom_poke_salmao",
    dishName: "Poke Salmão Tropical Especial",
    category: "Poke",
    station: "Sushibar (Frio)",
    salePrice: 41.90,
    servings: 1,
    prepTimeMinutes: 12,
    ingredients: [
      { rawMaterialCode: "SALM-01", name: "Salmão fresco em cubos", quantityRecipeUnit: 0.13, recipeUnit: "kg", prepYieldPercent: 58.0, costShareBrl: 8.91 },
      { rawMaterialCode: "ARR-01", name: "Arroz japonês base", quantityRecipeUnit: 0.16, recipeUnit: "kg", prepYieldPercent: 220.0, costShareBrl: 1.57 },
      { rawMaterialCode: "HORT-AVO", name: "Avocado fatiado", quantityRecipeUnit: 0.04, recipeUnit: "kg", prepYieldPercent: 72.0, costShareBrl: 0.56 },
      { rawMaterialCode: "HORT-PEP", name: "Pepino sunomono", quantityRecipeUnit: 0.03, recipeUnit: "kg", prepYieldPercent: 85.0, costShareBrl: 0.23 },
      { rawMaterialCode: "NORI-01", name: "Tiras de nori", quantityRecipeUnit: 0.5, recipeUnit: "folhas", prepYieldPercent: 100.0, costShareBrl: 0.28 },
      { rawMaterialCode: "CRM-01", name: "Cream cheese", quantityRecipeUnit: 0.025, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 0.84 },
      { rawMaterialCode: "EMB-COMB", name: "Bowl kraft ecológico com tampa", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 1.85 }
    ],
    theoreticalCost: 14.24,
    cmvPercent: 33.99,
    grossMarginBrl: 27.66,
    grossMarginPercent: 66.01,
    chefNotes: "Prato altamente consumido no almoço executivo e público fitness de Tangará."
  },

  // ==================== 9. SOBREMESAS ====================
  {
    id: "bom_harumaki_romeu",
    dishName: "Rolinho Primavera Romeu & Julieta (4un)",
    category: "Sobremesas",
    station: "Cozinha Quente",
    salePrice: 22.90,
    servings: 1,
    prepTimeMinutes: 8,
    ingredients: [
      { rawMaterialCode: "CRM-01", name: "Cream cheese recheio", quantityRecipeUnit: 0.06, recipeUnit: "kg", prepYieldPercent: 98.0, costShareBrl: 2.01 },
      { rawMaterialCode: "OLEO-01", name: "Óleo para fritura", quantityRecipeUnit: 0.04, recipeUnit: "L", prepYieldPercent: 95.0, costShareBrl: 0.36 },
      { rawMaterialCode: "EMB-HOT", name: "Embalagem sobremesa", quantityRecipeUnit: 1.0, recipeUnit: "un", prepYieldPercent: 100.0, costShareBrl: 0.90 }
    ],
    theoreticalCost: 4.87,
    cmvPercent: 21.27,
    grossMarginBrl: 18.03,
    grossMarginPercent: 78.73,
    chefNotes: "Goiabada cascão cremosa com queijo derretido em massa ultra fina e crocante."
  }
];'''

with open("/home/ubuntu/zuma/shared/forecastingData.ts", "r", encoding="utf-8") as f:
    code = f.read()

start_sheets = code.find("export const ZUMA_TECHNICAL_SHEETS: TechnicalSheetItem[] = [")
end_sheets = code.find("];\n\n// ==============================================================================\n// MOTOR DE PROJEÇÃO PREDITIVA DE COMPRAS")

if start_sheets != -1 and end_sheets != -1:
    code = code[:start_sheets] + TECHNICAL_SHEETS_CODE + code[end_sheets + 2:]
    print("SUCCESS: ZUMA_TECHNICAL_SHEETS replaced with 21 complete dishes!")
else:
    print("ERROR: ZUMA_TECHNICAL_SHEETS markers not found:", start_sheets, end_sheets)

with open("/home/ubuntu/zuma/shared/forecastingData.ts", "w", encoding="utf-8") as f:
    f.write(code)
print("Updated forecastingData.ts!")
