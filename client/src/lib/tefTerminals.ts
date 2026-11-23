export interface MaquininhaTef {
  id: string;
  codigo: string;
  nome: string;
  adquirente: "Stone" | "Cielo" | "PagBank" | "Sicredi MT" | "Rede" | "SafraPay" | "Getnet" | "Mercado Pago" | "Granito";
  modelo: string;
  tipo: "SMARTPOS_MOVEL" | "PINPAD_BALCAO" | "TEF_DEDICADO";
  localizacao: string;
  conexao: "Wi-Fi 5GHz + 4G" | "Cabo 1Gbps / USB" | "Wi-Fi 2.4GHz" | "4G Multi-Operadora";
  ip: string;
  portaTef: number;
  bateriaPct: number;
  impressoraEmbutida: boolean;
  larguraBobinaMm: 58 | 80;
  protocoloTef: "Stone Micro-PDV SDK" | "Cielo LIO API" | "PlugPag Smart" | "Sicredi PayGo MT" | "SiTef Modular" | "Rede Scope" | "Safra TEF" | "Getnet SuperGet" | "Mercado Pago Point";
  taxasMdr: {
    debito: number;
    creditoVista: number;
    creditoParceladoBase: number;
    creditoParcelaAdicional: number;
    voucher: number;
  };
  status: "ONLINE" | "OCUPADO" | "STANDBY";
  latenciaMs: number;
}

export const TEF_TERMINALS_CATALOG: MaquininhaTef[] = [
  // 1. STONE
  {
    id: "pos_stone_01",
    codigo: "POS 01",
    nome: "Stone P2 Smart (Móvel Salão 01)",
    adquirente: "Stone",
    modelo: "Sunmi P2 PRO Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Móvel Garçom · Salão 01-10",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.101",
    portaTef: 4096,
    bateriaPct: 98,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Stone Micro-PDV SDK",
    taxasMdr: {
      debito: 0.85,
      creditoVista: 1.45,
      creditoParceladoBase: 1.99,
      creditoParcelaAdicional: 0.15,
      voucher: 2.10,
    },
    status: "ONLINE",
    latenciaMs: 14,
  },
  {
    id: "pos_stone_02",
    codigo: "POS 02",
    nome: "Stone P2 Smart (Móvel Salão 02)",
    adquirente: "Stone",
    modelo: "Sunmi P2 PRO Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Móvel Garçom · Salão 11-20",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.102",
    portaTef: 4096,
    bateriaPct: 94,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Stone Micro-PDV SDK",
    taxasMdr: {
      debito: 0.85,
      creditoVista: 1.45,
      creditoParceladoBase: 1.99,
      creditoParcelaAdicional: 0.15,
      voucher: 2.10,
    },
    status: "ONLINE",
    latenciaMs: 16,
  },
  {
    id: "pos_stone_03",
    codigo: "POS 03",
    nome: "PinPad Stone D210 (Balcão Caixa 01)",
    adquirente: "Stone",
    modelo: "Pax D210 TEF PinPad",
    tipo: "PINPAD_BALCAO",
    localizacao: "Balcão Caixa Principal",
    conexao: "Cabo 1Gbps / USB",
    ip: "192.168.1.103",
    portaTef: 4096,
    bateriaPct: 100,
    impressoraEmbutida: false,
    larguraBobinaMm: 80,
    protocoloTef: "SiTef Modular",
    taxasMdr: {
      debito: 0.79,
      creditoVista: 1.39,
      creditoParceladoBase: 1.89,
      creditoParcelaAdicional: 0.12,
      voucher: 2.05,
    },
    status: "ONLINE",
    latenciaMs: 8,
  },

  // 2. CIELO
  {
    id: "pos_cielo_01",
    codigo: "POS 04",
    nome: "Cielo LIO On V3 (Móvel Salão 03)",
    adquirente: "Cielo",
    modelo: "Cielo LIO V3 Smart Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Móvel Garçom · Tatames VIP",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.104",
    portaTef: 4096,
    bateriaPct: 92,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Cielo LIO API",
    taxasMdr: {
      debito: 0.89,
      creditoVista: 1.49,
      creditoParceladoBase: 1.99,
      creditoParcelaAdicional: 0.15,
      voucher: 2.20,
    },
    status: "ONLINE",
    latenciaMs: 18,
  },
  {
    id: "pos_cielo_02",
    codigo: "POS 05",
    nome: "Cielo Flash 1590 (PinPad Balcão Caixa 02)",
    adquirente: "Cielo",
    modelo: "Cielo Flash 1590 PinPad",
    tipo: "PINPAD_BALCAO",
    localizacao: "Balcão Caixa Secundário",
    conexao: "Cabo 1Gbps / USB",
    ip: "192.168.1.105",
    portaTef: 4096,
    bateriaPct: 100,
    impressoraEmbutida: false,
    larguraBobinaMm: 80,
    protocoloTef: "SiTef Modular",
    taxasMdr: {
      debito: 0.82,
      creditoVista: 1.42,
      creditoParceladoBase: 1.90,
      creditoParcelaAdicional: 0.14,
      voucher: 2.15,
    },
    status: "ONLINE",
    latenciaMs: 9,
  },
  {
    id: "pos_cielo_03",
    codigo: "POS 06",
    nome: "Cielo Zip Móvel (Deck & Área Externa)",
    adquirente: "Cielo",
    modelo: "Pax D195 Wireless",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Deck Externo & Fila de Espera",
    conexao: "4G Multi-Operadora",
    ip: "192.168.1.106",
    portaTef: 4096,
    bateriaPct: 88,
    impressoraEmbutida: false,
    larguraBobinaMm: 58,
    protocoloTef: "Cielo LIO API",
    taxasMdr: {
      debito: 0.95,
      creditoVista: 1.55,
      creditoParceladoBase: 2.05,
      creditoParcelaAdicional: 0.18,
      voucher: 2.30,
    },
    status: "ONLINE",
    latenciaMs: 25,
  },

  // 3. SICREDI MT (COOPERATIVA TANGARÁ DA SERRA)
  {
    id: "pos_sicredi_01",
    codigo: "POS 07",
    nome: "Sicredi Smart Cooperativa (Móvel Salão 04)",
    adquirente: "Sicredi MT",
    modelo: "Clover Flex MT Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Móvel Garçom · Salão 21-30",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.107",
    portaTef: 4096,
    bateriaPct: 96,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Sicredi PayGo MT",
    taxasMdr: {
      debito: 0.75,
      creditoVista: 1.35,
      creditoParceladoBase: 1.79,
      creditoParcelaAdicional: 0.10,
      voucher: 1.99,
    },
    status: "ONLINE",
    latenciaMs: 12,
  },
  {
    id: "pos_sicredi_02",
    codigo: "POS 08",
    nome: "Sicredi TEF Dedicado PayGo (Balcão Principal)",
    adquirente: "Sicredi MT",
    modelo: "Gertec PPC930 USB PinPad",
    tipo: "TEF_DEDICADO",
    localizacao: "Balcão Caixa Central",
    conexao: "Cabo 1Gbps / USB",
    ip: "192.168.1.108",
    portaTef: 4096,
    bateriaPct: 100,
    impressoraEmbutida: false,
    larguraBobinaMm: 80,
    protocoloTef: "Sicredi PayGo MT",
    taxasMdr: {
      debito: 0.70,
      creditoVista: 1.30,
      creditoParceladoBase: 1.75,
      creditoParcelaAdicional: 0.10,
      voucher: 1.95,
    },
    status: "ONLINE",
    latenciaMs: 7,
  },

  // 4. PAGBANK (PAGSEGURO)
  {
    id: "pos_pagbank_01",
    codigo: "POS 09",
    nome: "PagBank Moderninha Smart 2 (Móvel Bar)",
    adquirente: "PagBank",
    modelo: "Pax A80 Smart Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Bar & Balcão de Coquetéis",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.109",
    portaTef: 4096,
    bateriaPct: 91,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "PlugPag Smart",
    taxasMdr: {
      debito: 0.89,
      creditoVista: 1.49,
      creditoParceladoBase: 1.99,
      creditoParcelaAdicional: 0.15,
      voucher: 2.39,
    },
    status: "ONLINE",
    latenciaMs: 20,
  },
  {
    id: "pos_pagbank_02",
    codigo: "POS 10",
    nome: "PagBank Moderninha Pro 2 (Móvel Delivery)",
    adquirente: "PagBank",
    modelo: "Pax D200 4G",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Despacho Delivery & Motoboy",
    conexao: "4G Multi-Operadora",
    ip: "192.168.1.110",
    portaTef: 4096,
    bateriaPct: 85,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "PlugPag Smart",
    taxasMdr: {
      debito: 0.99,
      creditoVista: 1.59,
      creditoParceladoBase: 2.09,
      creditoParcelaAdicional: 0.18,
      voucher: 2.49,
    },
    status: "ONLINE",
    latenciaMs: 28,
  },

  // 5. REDE (ITAÚ)
  {
    id: "pos_rede_01",
    codigo: "POS 11",
    nome: "Rede Smart (Móvel Tatames VIP)",
    adquirente: "Rede",
    modelo: "Sunmi V2 PRO Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Tatames Tradicionais VIP",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.111",
    portaTef: 4096,
    bateriaPct: 89,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Rede Scope",
    taxasMdr: {
      debito: 0.89,
      creditoVista: 1.49,
      creditoParceladoBase: 1.99,
      creditoParcelaAdicional: 0.15,
      voucher: 2.25,
    },
    status: "ONLINE",
    latenciaMs: 17,
  },
  {
    id: "pos_rede_02",
    codigo: "POS 12",
    nome: "Rede PinPad PPC930 (Balcão Caixa 03)",
    adquirente: "Rede",
    modelo: "Gertec PPC930 USB PinPad",
    tipo: "PINPAD_BALCAO",
    localizacao: "Balcão Caixa Rápido",
    conexao: "Cabo 1Gbps / USB",
    ip: "192.168.1.112",
    portaTef: 4096,
    bateriaPct: 100,
    impressoraEmbutida: false,
    larguraBobinaMm: 80,
    protocoloTef: "SiTef Modular",
    taxasMdr: {
      debito: 0.80,
      creditoVista: 1.40,
      creditoParceladoBase: 1.88,
      creditoParcelaAdicional: 0.12,
      voucher: 2.10,
    },
    status: "ONLINE",
    latenciaMs: 9,
  },

  // 6. SAFRAPAY
  {
    id: "pos_safra_01",
    codigo: "POS 13",
    nome: "SafraPay Smart Android (Salão Deck Externo)",
    adquirente: "SafraPay",
    modelo: "Gertec GPOS700 Smart Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Deck Externo & Jardim Japonês",
    conexao: "4G Multi-Operadora",
    ip: "192.168.1.113",
    portaTef: 4096,
    bateriaPct: 86,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Safra TEF",
    taxasMdr: {
      debito: 0.82,
      creditoVista: 1.39,
      creditoParceladoBase: 1.85,
      creditoParcelaAdicional: 0.14,
      voucher: 2.15,
    },
    status: "ONLINE",
    latenciaMs: 22,
  },

  // 7. GETNET (SANTANDER)
  {
    id: "pos_getnet_01",
    codigo: "POS 14",
    nome: "Getnet POS Digital Android (Reserva Operacional)",
    adquirente: "Getnet",
    modelo: "Ingenico APOS A8 Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Reserva de Contingência",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.114",
    portaTef: 4096,
    bateriaPct: 91,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Getnet SuperGet",
    taxasMdr: {
      debito: 0.89,
      creditoVista: 1.45,
      creditoParceladoBase: 1.95,
      creditoParcelaAdicional: 0.15,
      voucher: 2.20,
    },
    status: "ONLINE",
    latenciaMs: 19,
  },

  // 8. MERCADO PAGO
  {
    id: "pos_mp_01",
    codigo: "POS 15",
    nome: "Mercado Pago Smart Point Pro (Takeout / Balcão)",
    adquirente: "Mercado Pago",
    modelo: "Pax A910 Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Balcão Retirada Takeout",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.115",
    portaTef: 4096,
    bateriaPct: 100,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "Mercado Pago Point",
    taxasMdr: {
      debito: 0.95,
      creditoVista: 1.50,
      creditoParceladoBase: 2.00,
      creditoParcelaAdicional: 0.16,
      voucher: 2.45,
    },
    status: "ONLINE",
    latenciaMs: 21,
  },

  // 9. GRANITO
  {
    id: "pos_granito_01",
    codigo: "POS 16",
    nome: "Granito SmartPOS TEF (Eventos e Buffet)",
    adquirente: "Granito",
    modelo: "Sunmi P2 Android",
    tipo: "SMARTPOS_MOVEL",
    localizacao: "Salão de Eventos & Buffet",
    conexao: "Wi-Fi 5GHz + 4G",
    ip: "192.168.1.116",
    portaTef: 4096,
    bateriaPct: 93,
    impressoraEmbutida: true,
    larguraBobinaMm: 58,
    protocoloTef: "SiTef Modular",
    taxasMdr: {
      debito: 0.85,
      creditoVista: 1.42,
      creditoParceladoBase: 1.90,
      creditoParcelaAdicional: 0.15,
      voucher: 2.15,
    },
    status: "ONLINE",
    latenciaMs: 15,
  },
];

export interface ComprovanteTefData {
  tipoVia: "CLIENTE" | "ESTABELECIMENTO";
  terminalId: string;
  terminalNome: string;
  adquirente: string;
  nsuHost: string;
  nsuLocalTef: string;
  codigoAutorizacao: string;
  loteTransacao: string;
  bandeira: string;
  modalidade: string;
  parcelas: number;
  valorTotal: number;
  cartaoMascarado: string;
  modoEntrada: "NFC Contactless" | "Chip EMV" | "Tarja Magnética";
  dataHora: string;
  estabelecimento: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    cidade: string;
    uf: string;
  };
  comprovanteTexto: string;
}

export function gerarComprovanteTef(params: {
  terminal: MaquininhaTef;
  valorTotal: number;
  modalidade: "debito" | "credito" | "voucher";
  bandeira: string;
  parcelas?: number;
  mesaNumero?: number;
  tipoVia?: "CLIENTE" | "ESTABELECIMENTO";
}): ComprovanteTefData {
  const nsuHost = String(Math.floor(100000000 + Math.random() * 900000000));
  const nsuLocalTef = String(Math.floor(100000 + Math.random() * 900000));
  const codigoAutorizacao = String(Math.floor(100000 + Math.random() * 900000));
  const loteTransacao = "000" + Math.floor(10 + Math.random() * 89);
  const ultimos4 = String(Math.floor(1000 + Math.random() * 9000));
  const cartaoMascarado = `•••• •••• •••• ${ultimos4}`;
  const now = new Date();
  const dataFormatada = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");
  const parcelasVal = params.parcelas || 1;
  const tipoViaVal = params.tipoVia || "CLIENTE";

  const modalidadeStr = params.modalidade === "debito"
    ? "DÉBITO À VISTA"
    : params.modalidade === "voucher"
    ? `VOUCHER BENEFÍCIO (${params.bandeira})`
    : parcelasVal > 1
    ? `CRÉDITO PARCELADO (${parcelasVal}X)`
    : "CRÉDITO À VISTA";

  const comprovanteTexto = [
    "================================",
    "    ZUMA COZINHA ORIENTAL LTDA   ",
    "  CNPJ: 36.296.848/0001-57       ",
    "  AV. BRASIL, 450 - CENTRO       ",
    "  TANGARÁ DA SERRA - MT          ",
    "================================",
    `COMPROVANTE TEF - VIA DO ${tipoViaVal}`,
    "--------------------------------",
    `TERMINAL : ${params.terminal.codigo} - ${params.terminal.modelo}`,
    `OPERADORA: ${params.terminal.adquirente.toUpperCase()}`,
    `PROTOCOLO: ${params.terminal.protocoloTef}`,
    `NSU HOST : ${nsuHost}`,
    `NSU TEF  : ${nsuLocalTef}`,
    `AUTORIZ. : ${codigoAutorizacao}`,
    `LOTE     : ${loteTransacao}`,
    `CARTÃO   : ${cartaoMascarado}`,
    `BANDEIRA : ${params.bandeira.toUpperCase()}`,
    "MODO LER : APROXIMAÇÃO (NFC CHIP)",
    `OPERACAO : ${modalidadeStr}`,
    `VALOR TOT: R$ ${params.valorTotal.toFixed(2)}`,
    parcelasVal > 1 ? `PARCELAS : ${parcelasVal}x de R$ ${(params.valorTotal / parcelasVal).toFixed(2)}` : "",
    `DATA/HORA: ${dataFormatada}`,
    params.mesaNumero ? `LOCAL    : MESA ${String(params.mesaNumero).padStart(2, "0")} (SALÃO)` : "LOCAL    : FRENTE DE CAIXA",
    "--------------------------------",
    "TRANSACAO AUTORIZADA PELA REDE  ",
    "CONCILIACAO BANCARIA CONFIRMADA ",
    "SEFAZ-MT: NFC-e SINCRONIZADA OK ",
    "================================",
    "   OBRIGADO PELA PREFERENCIA!   ",
    "     ARIGATOU GOZAIMASU!        ",
    "================================",
  ].filter(Boolean).join("\n");

  return {
    tipoVia: tipoViaVal,
    terminalId: params.terminal.id,
    terminalNome: params.terminal.nome,
    adquirente: params.terminal.adquirente,
    nsuHost,
    nsuLocalTef,
    codigoAutorizacao,
    loteTransacao,
    bandeira: params.bandeira,
    modalidade: modalidadeStr,
    parcelas: parcelasVal,
    valorTotal: params.valorTotal,
    cartaoMascarado,
    modoEntrada: "NFC Contactless",
    dataHora: dataFormatada,
    estabelecimento: {
      razaoSocial: "Zuma Cozinha Oriental Ltda",
      nomeFantasia: "Zuma Gastronomia",
      cnpj: "36.296.848/0001-57",
      cidade: "Tangará da Serra",
      uf: "MT",
    },
    comprovanteTexto,
  };
}
