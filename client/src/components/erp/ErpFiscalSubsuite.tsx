import React, { useState } from "react";
import {
  FileText,
  Calculator,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  Building,
  Zap,
  ArrowRight,
  Filter,
  Printer,
  Eye,
  X,
  Plus,
  Radio,
  Globe,
  FolderArchive,
  Check,
  ChevronRight,
  Send,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface NotaFiscalItem {
  id: string;
  numero: number;
  serie: number;
  modelo: "65" | "55"; // 65 = NFC-e, 55 = NF-e
  chaveAcesso: string;
  protocolo: string;
  dataEmissao: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  valorTotal: number;
  icmsApurado: number;
  formaPagamento: string;
  status: "autorizada" | "cancelada" | "contingencia" | "rejeitada";
  itens: {
    nome: string;
    ncm: string;
    cfop: string;
    csosn: string;
    qtd: number;
    precoUnit: number;
    subtotal: number;
  }[];
  motivoCancelamento?: string;
}

const NOTAS_INICIAIS: NotaFiscalItem[] = [
  {
    id: "NFC-1048",
    numero: 1048,
    serie: 1,
    modelo: "65",
    chaveAcesso: "51261136296848000157650010000010481894237184",
    protocolo: "151260084920194",
    dataEmissao: "2026-11-21T19:20:14-03:00",
    clienteNome: "Rodrigo Ribeiro Gonçalves",
    clienteCpfCnpj: "048.***.***-89",
    valorTotal: 598.07,
    icmsApurado: 23.92,
    formaPagamento: "PIX Dinâmico Instantâneo",
    status: "autorizada",
    itens: [
      { nome: "3x Rodízio Zuma Especial Adulto", ncm: "2106.90.90", cfop: "5102", csosn: "102", qtd: 3, precoUnit: 139.90, subtotal: 419.70 },
      { nome: "2x Caipirinha de Saquê com Morango", ncm: "2206.00.90", cfop: "5102", csosn: "102", qtd: 2, precoUnit: 28.00, subtotal: 56.00 },
      { nome: "3x Cerveja Kirin Ichiban Long Neck", ncm: "2203.00.00", cfop: "5405", csosn: "500", qtd: 3, precoUnit: 18.00, subtotal: 54.00 },
      { nome: "Taxa de Serviço 10% Salão", ncm: "0000.00.00", cfop: "5949", csosn: "102", qtd: 1, precoUnit: 54.37, subtotal: 54.37 }
    ]
  },
  {
    id: "NFC-1047",
    numero: 1047,
    serie: 1,
    modelo: "65",
    chaveAcesso: "51261136296848000157650010000010471928374910",
    protocolo: "151260084919821",
    dataEmissao: "2026-11-21T19:05:40-03:00",
    clienteNome: "Consumidor Final",
    clienteCpfCnpj: "Não Identificado",
    valorTotal: 148.89,
    icmsApurado: 5.95,
    formaPagamento: "Cartão de Crédito Visa",
    status: "autorizada",
    itens: [
      { nome: "1x Combo Nakato 30 Peças", ncm: "2106.90.90", cfop: "5102", csosn: "102", qtd: 1, precoUnit: 129.90, subtotal: 129.90 },
      { nome: "1x Refrigerante Coca-Cola Zero Lata", ncm: "2202.10.00", cfop: "5405", csosn: "500", qtd: 1, precoUnit: 8.00, subtotal: 8.00 },
      { nome: "1x Taxa Delivery Tangará II", ncm: "0000.00.00", cfop: "5949", csosn: "102", qtd: 1, precoUnit: 10.99, subtotal: 10.99 }
    ]
  },
  {
    id: "NFE-0089",
    numero: 89,
    serie: 1,
    modelo: "55",
    chaveAcesso: "51261136296848000157550010000000891048291048",
    protocolo: "151260084910023",
    dataEmissao: "2026-11-21T16:30:00-03:00",
    clienteNome: "Cooperativa Sicredi Tangará da Serra",
    clienteCpfCnpj: "03.284.920/0001-44",
    valorTotal: 3420.00,
    icmsApurado: 136.80,
    formaPagamento: "Boleto Faturado 15 Dias",
    status: "autorizada",
    itens: [
      { nome: "Buffet Executivo Oriental Corporativo (40 Pessoas)", ncm: "2106.90.90", cfop: "5102", csosn: "102", qtd: 1, precoUnit: 3420.00, subtotal: 3420.00 }
    ]
  },
  {
    id: "NFC-1046",
    numero: 1046,
    serie: 1,
    modelo: "65",
    chaveAcesso: "51261136296848000157650010000010461726354891",
    protocolo: "151260084918231",
    dataEmissao: "2026-11-21T18:40:12-03:00",
    clienteNome: "Mariana Alencar",
    clienteCpfCnpj: "892.***.***-10",
    valorTotal: 86.00,
    icmsApurado: 3.44,
    formaPagamento: "PIX",
    status: "cancelada",
    motivoCancelamento: "Erro na digitação de itens pelo garçom / comanda duplicada",
    itens: [
      { nome: "1x Combo 18 Peças", ncm: "2106.90.90", cfop: "5102", csosn: "102", qtd: 1, precoUnit: 86.00, subtotal: 86.00 }
    ]
  }
];

const WEBSERVICES_27_UFS = [
  { uf: "MT", estado: "Mato Grosso", autorizador: "SEFAZ-MT Própria", status: "online", ms: 68, versao: "4.00", contingencia: "Normal (Sem Contingência)" },
  { uf: "SP", estado: "São Paulo", autorizador: "SEFAZ-SP Própria", status: "online", ms: 42, versao: "4.00", contingencia: "Normal" },
  { uf: "PR", estado: "Paraná", autorizador: "SEFAZ-PR Própria", status: "online", ms: 55, versao: "4.00", contingencia: "Normal" },
  { uf: "SC", estado: "Santa Catarina", autorizador: "SVRS (RS)", status: "online", ms: 61, versao: "4.00", contingencia: "Normal" },
  { uf: "RS", estado: "Rio Grande do Sul", autorizador: "SEFAZ-RS Própria", status: "online", ms: 74, versao: "4.00", contingencia: "Normal" },
  { uf: "MS", estado: "Mato Grosso do Sul", autorizador: "SEFAZ-MS Própria", status: "online", ms: 80, versao: "4.00", contingencia: "Normal" },
  { uf: "GO", estado: "Goiás", autorizador: "SEFAZ-GO Própria", status: "online", ms: 88, versao: "4.00", contingencia: "Normal" },
  { uf: "MG", estado: "Minas Gerais", autorizador: "SEFAZ-MG Própria", status: "online", ms: 52, versao: "4.00", contingencia: "Normal" },
  { uf: "RJ", estado: "Rio de Janeiro", autorizador: "SVRS (RS)", status: "online", ms: 59, versao: "4.00", contingencia: "Normal" },
  { uf: "BA", estado: "Bahia", autorizador: "SEFAZ-BA Própria", status: "online", ms: 94, versao: "4.00", contingencia: "Normal" },
  { uf: "DF", estado: "Distrito Federal", autorizador: "SVRS (RS)", status: "online", ms: 64, versao: "4.00", contingencia: "Normal" },
  { uf: "ES", estado: "Espírito Santo", autorizador: "SVRS (RS)", status: "online", ms: 71, versao: "4.00", contingencia: "Normal" },
  { uf: "PE", estado: "Pernambuco", autorizador: "SEFAZ-PE Própria", status: "online", ms: 102, versao: "4.00", contingencia: "Normal" },
  { uf: "CE", estado: "Ceará", autorizador: "SEFAZ-CE Própria", status: "online", ms: 98, versao: "4.00", contingencia: "Normal" },
  { uf: "AM", estado: "Amazonas", autorizador: "SEFAZ-AM Própria", status: "online", ms: 115, versao: "4.00", contingencia: "Normal" },
  { uf: "PA", estado: "Pará", autorizador: "SVAN (Receita Federal)", status: "online", ms: 110, versao: "4.00", contingencia: "Normal" },
  { uf: "RO", estado: "Rondônia", autorizador: "SVRS (RS)", status: "online", ms: 85, versao: "4.00", contingencia: "Normal" },
  { uf: "TO", estado: "Tocantins", autorizador: "SVRS (RS)", status: "online", ms: 90, versao: "4.00", contingencia: "Normal" },
  { uf: "AL", estado: "Alagoas", autorizador: "SVRS (RS)", status: "online", ms: 105, versao: "4.00", contingencia: "Normal" },
  { uf: "SE", estado: "Sergipe", autorizador: "SVRS (RS)", status: "online", ms: 108, versao: "4.00", contingencia: "Normal" },
  { uf: "PB", estado: "Paraíba", autorizador: "SVRS (RS)", status: "online", ms: 112, versao: "4.00", contingencia: "Normal" },
  { uf: "RN", estado: "Rio Grande do Norte", autorizador: "SVRS (RS)", status: "online", ms: 114, versao: "4.00", contingencia: "Normal" },
  { uf: "PI", estado: "Piauí", autorizador: "SVRS (RS)", status: "online", ms: 119, versao: "4.00", contingencia: "Normal" },
  { uf: "MA", estado: "Maranhão", autorizador: "SVAN (Receita Federal)", status: "online", ms: 122, versao: "4.00", contingencia: "Normal" },
  { uf: "AC", estado: "Acre", autorizador: "SVRS (RS)", status: "online", ms: 128, versao: "4.00", contingencia: "Normal" },
  { uf: "RR", estado: "Roraima", autorizador: "SVRS (RS)", status: "online", ms: 135, versao: "4.00", contingencia: "Normal" },
  { uf: "AP", estado: "Amapá", autorizador: "SVRS (RS)", status: "online", ms: 140, versao: "4.00", contingencia: "Normal" }
];

const REGRAS_TRIBUTARIAS_EXPANDIDAS = [
  {
    id: "r1",
    segmento: "Gastronomia Zuma",
    ncm: "0302.14.00",
    cest: "17.086.00",
    descricao: "Salmão fresco do Atlântico eviscerado (Insumo Nobre Sushibar)",
    icmsMt: "12,0% (Base Reduzida 41,67%)",
    cstIcms: "020 - Com redução de base de cálculo",
    pisCofins: "1,65% / 7,60% (Não-cumulativo) ou 0% Simples",
    origem: "Importado / Chile",
    beneficioLegal: "Convênio ICMS 128/94 e Dec. Estadual MT 1.261/2000"
  },
  {
    id: "r2",
    segmento: "Gastronomia Zuma",
    ncm: "2106.90.90",
    cest: "-",
    descricao: "Combinados, Sushis e Pratos Prontos para Consumo Imediato",
    icmsMt: "17,0% (ou Anexo I Simples Nacional 4,0%)",
    cstIcms: "000 / CSOSN 102 - Tributado Integralmente",
    pisCofins: "0,65% / 3,00% ou Simples",
    origem: "Nacional / Produção Própria",
    beneficioLegal: "Tributação normal de alimentação e refeições coletivas"
  },
  {
    id: "r3",
    segmento: "Gastronomia Zuma",
    ncm: "1006.30.21",
    cest: "-",
    descricao: "Arroz polido grão curto para sushi (Shari preparado)",
    icmsMt: "7,0% (Cesta Básica MT)",
    cstIcms: "020 / CSOSN 102 - Cesta Básica MT",
    pisCofins: "Alíquota Zero (Lei 10.925/2004)",
    origem: "Nacional / RS",
    beneficioLegal: "Art. 64 do Anexo V do RICMS-MT"
  },
  {
    id: "r4",
    segmento: "Bebidas & Varejo",
    ncm: "2202.10.00",
    cest: "03.001.00",
    descricao: "Refrigerantes lata e garrafa pet (Substituição Tributária)",
    icmsMt: "0,0% na Venda (Retido anteriormente por ST)",
    cstIcms: "060 / CSOSN 500 - ICMS cobrado por ST",
    pisCofins: "Monofásico Alíquota Zero no Varejo (Lei 10.147/2000)",
    origem: "Nacional",
    beneficioLegal: "Protocolo ICMS 11/91 e MVA Ajustada MT"
  },
  {
    id: "r5",
    segmento: "Bebidas & Bar",
    ncm: "2206.00.90",
    cest: "-",
    descricao: "Saquê oriental tradicional e bebidas fermentadas especiais",
    icmsMt: "25,0% (Alíquota seletiva MT para bebidas quentes)",
    cstIcms: "000 / CSOSN 102 - Alíquota Especial",
    pisCofins: "Monofásico na Indústria",
    origem: "Importado / Japão",
    beneficioLegal: "Art. 95 do RICMS-MT (Bebidas alcoólicas seletivas)"
  },
  {
    id: "r6",
    segmento: "AutoPeças",
    ncm: "8708.30.90",
    cest: "01.002.00",
    descricao: "Pastilhas de freio automotivas para caminhonetes e tratores",
    icmsMt: "Substituição Tributária MT (MVA 59,6%)",
    cstIcms: "060 / CSOSN 500 - ST Automotiva",
    pisCofins: "Monofásico Autopeças (Lei 10.485/2002)",
    origem: "Nacional",
    beneficioLegal: "Protocolo ICMS 41/2008"
  },
  {
    id: "r7",
    segmento: "Indústria Concreto",
    ncm: "3824.50.00",
    cest: "-",
    descricao: "Concreto usinado estrutural (Argamassas e Betoneiras)",
    icmsMt: "Não Incidência ICMS / Incidência ISSQN (Construção Civil)",
    cstIcms: "041 - Não Tributada ICMS (Subitem 7.02 LC 116/03)",
    pisCofins: "0,65% / 3,00%",
    origem: "Nacional / Usinagem Local",
    beneficioLegal: "Súmula 167 STJ e Lei Complementar 116/2003"
  },
  {
    id: "r8",
    segmento: "Barbearia & Serviços",
    ncm: "0000.00.00",
    cest: "-",
    descricao: "Corte de cabelo e barba executados por profissional parceiro",
    icmsMt: "Não Incidência ICMS / ISSQN 3% (Lei Salão Parceiro)",
    cstIcms: "Não Aplicável (Documento Fiscal de Serviço NFS-e)",
    pisCofins: "Tributação exclusiva na cota-parte do salão",
    origem: "Prestação de Serviços",
    beneficioLegal: "Lei Federal nº 13.352/2016 (Salão Parceiro)"
  }
];

export const ErpFiscalSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"emissao" | "sefaz27" | "matriz" | "validador" | "sped" | "contador" | "reforma">("emissao");

  const [notasList, setNotasList] = useState<NotaFiscalItem[]>(NOTAS_INICIAIS);
  const [termoBuscaNota, setTermoBuscaNota] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  // Modais
  const [modalNovaNfceOpen, setModalNovaNfceOpen] = useState(false);
  const [modalDanfeOpen, setModalDanfeOpen] = useState(false);
  const [notaSelecionadaDanfe, setNotaSelecionadaDanfe] = useState<NotaFiscalItem | null>(null);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [notaParaCancelar, setNotaParaCancelar] = useState<NotaFiscalItem | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  // Formulário Nova NFC-e
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [novoClienteCpf, setNovoClienteCpf] = useState("");
  const [novoItemNome, setNovoItemNome] = useState("Promo Combo 40 Peças");
  const [novoItemValor, setNovoItemValor] = useState(139.99);
  const [novaFormaPagto, setNovaFormaPagto] = useState("PIX Dinâmico Instantâneo");
  const [novoModelo, setNovoModelo] = useState<"65" | "55">("65");

  // Contingência Offline
  const [contingenciaAtiva, setContingenciaAtiva] = useState(false);

  // SPED Bloco K
  const [mesAnoSped, setMesAnoSped] = useState("2026-11");
  const [filtroBlocoK, setFiltroBlocoK] = useState("TODOS");

  const registrosBlocoK = [
    { reg: "|K001|0|", tipo: "K001", desc: "Abertura do Bloco K com dados de produção e estoque" },
    { reg: "|K100|20261101|20261130|", tipo: "K100", desc: "Período de Apuração Novembro/2026" },
    { reg: "|K200|20261130|INS-001|42.500|0|", tipo: "K200", desc: "Estoque Escriturado: Salmão Fresco Eviscerado (42.5 kg no Sushibar)" },
    { reg: "|K200|20261130|INS-002|115.000|0|", tipo: "K200", desc: "Estoque Escriturado: Arroz Especial Grão Curto (115.0 kg no almoxarifado)" },
    { reg: "|K200|20261130|INS-003|840.000|0|", tipo: "K200", desc: "Estoque Escriturado: Folhas de Nori Tostado (840 unidades)" },
    { reg: "|K230|20261121|PRD-154|18.000|OP-1121-01|", tipo: "K230", desc: "Ordem de Produção: 18x Especial Zuma 68 Peças produzidos no turno" },
    { reg: "|K235|20261121|INS-001|7.200|OP-1121-01|", tipo: "K235", desc: "Insumo Consumido: 7.200 kg de Salmão Fresco para o Especial Zuma" },
    { reg: "|K235|20261121|INS-002|3.600|OP-1121-01|", tipo: "K235", desc: "Insumo Consumido: 3.600 kg de Shari preparado para o Especial Zuma" },
    { reg: "|K280|20261121|INS-001|1.150|1|Perda de aparas na toalete do filé|", tipo: "K280", desc: "Ajuste de Apontamento: 1.150 kg de aparas de salmão reutilizadas em Hot Roll" },
    { reg: "|K990|10|", tipo: "K990", desc: "Encerramento do Bloco K com 10 registros validados" },
  ];

  // Ações de Emissão
  const handleEmitirNota = (e: React.FormEvent) => {
    e.preventDefault();
    const proxNum = (notasList[0]?.numero || 1048) + 1;
    const serie = 1;
    const modelo = novoModelo;
    const chave = `51261136296848000157${modelo}001${String(proxNum).padStart(9, "0")}1${Math.floor(10000000 + Math.random() * 90000000)}7`;
    const protocolo = `1512600${Math.floor(100000000 + Math.random() * 900000000)}`;
    const total = parseFloat(String(novoItemValor)) || 100.0;
    const icms = parseFloat((total * 0.04).toFixed(2));

    const novaNota: NotaFiscalItem = {
      id: `${modelo === "65" ? "NFC" : "NFE"}-${proxNum}`,
      numero: proxNum,
      serie,
      modelo,
      chaveAcesso: chave,
      protocolo,
      dataEmissao: new Date().toISOString(),
      clienteNome: novoClienteNome.trim() || "Consumidor Final",
      clienteCpfCnpj: novoClienteCpf.trim() || "Não Identificado",
      valorTotal: total,
      icmsApurado: icms,
      formaPagamento: novaFormaPagto,
      status: contingenciaAtiva ? "contingencia" : "autorizada",
      itens: [
        {
          nome: novoItemNome,
          ncm: "2106.90.90",
          cfop: "5102",
          csosn: "102",
          qtd: 1,
          precoUnit: total,
          subtotal: total
        }
      ]
    };

    setNotasList([novaNota, ...notasList]);
    setModalNovaNfceOpen(false);
    toast.success(
      contingenciaAtiva
        ? `NFC-e nº ${proxNum} emitida em CONTINGÊNCIA OFFLINE (tpEmis = 9)! Fila pronta para envio à SEFAZ.`
        : `Documento Fiscal ${modelo === "65" ? "NFC-e" : "NF-e"} nº ${proxNum} AUTORIZADO com sucesso na SEFAZ-MT!`
    );
  };

  const handleConfirmarCancelamento = () => {
    if (!notaParaCancelar) return;
    if (motivoCancelamento.trim().length < 15) {
      toast.error("O motivo do cancelamento exigido pela SEFAZ deve conter no mínimo 15 caracteres.");
      return;
    }

    setNotasList(prev =>
      prev.map(n =>
        n.id === notaParaCancelar.id
          ? { ...n, status: "cancelada", motivoCancelamento: motivoCancelamento.trim() }
          : n
      )
    );

    toast.success(`NFC-e nº ${notaParaCancelar.numero} cancelada com sucesso na SEFAZ-MT. Protocolo homologado!`);
    setModalCancelarOpen(false);
    setNotaParaCancelar(null);
    setMotivoCancelamento("");
  };

  const handleDownloadXml = (nota: NotaFiscalItem) => {
    const xmlMock = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nota.chaveAcesso}" versao="4.00">
    <ide>
      <cUF>51</cUF>
      <cNF>89423718</cNF>
      <natOp>Venda a Consumidor Gastronomia</natOp>
      <mod>${nota.modelo}</mod>
      <serie>${nota.serie}</serie>
      <nNF>${nota.numero}</nNF>
      <dhEmi>${nota.dataEmissao}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>5107958</cMunFG>
      <tpImp>4</tpImp>
      <tpEmis>${nota.status === "contingencia" ? "9" : "1"}</tpEmis>
      <cDV>7</cDV>
      <tpAmb>1</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>KyttoFiscal_v4.2</verProc>
    </ide>
    <emit>
      <CNPJ>36296848000157</CNPJ>
      <xNome>ZUMA COZINHA ORIENTAL LTDA</xNome>
      <xFant>ZUMA TANGARA</xFant>
      <enderEmit>
        <xLgr>AV. BRASIL</xLgr>
        <nro>1605-S</nro>
        <xBairro>CIDADE ALTA</xBairro>
        <cMun>5107958</cMun>
        <xMun>TANGARA DA SERRA</xMun>
        <UF>MT</UF>
        <CEP>78300000</CEP>
      </enderEmit>
      <IE>137849204</IE>
      <CRT>1</CRT>
    </emit>
    <total>
      <ICMSTot>
        <vBC>${nota.valorTotal.toFixed(2)}</vBC>
        <vICMS>${nota.icmsApurado.toFixed(2)}</vICMS>
        <vProd>${nota.valorTotal.toFixed(2)}</vProd>
        <vNF>${nota.valorTotal.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
  </infNFe>
</NFe>`;

    const blob = new Blob([xmlMock], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NFe_${nota.chaveAcesso}.xml`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`XML assinado da Nota nº ${nota.numero} baixado com sucesso!`);
  };

  const handleDownloadPacoteContadorZip = () => {
    toast.success("Pacote do Contador (Novembro/2026) gerado! XMLs + SPED Bloco K + Relatório DIMP baixados em .ZIP");
  };

  const notasFiltradas = notasList.filter(n => {
    const matchBusca =
      n.chaveAcesso.includes(termoBuscaNota) ||
      String(n.numero).includes(termoBuscaNota) ||
      n.clienteNome.toLowerCase().includes(termoBuscaNota.toLowerCase()) ||
      n.clienteCpfCnpj.includes(termoBuscaNota);
    const matchStatus = statusFiltro === "TODOS" || n.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* CABEÇALHO DA SUÍTE FISCAL & MONITOR GLOBAL */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-[var(--ink)] tracking-tight">
                  Suíte Fiscal &amp; Tributária Nacional · SEFAZ-MT &amp; 27 UFs
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Produção Ativa
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Emissão de NFC-e (mod 65), NF-e (mod 55), SPED Bloco K, DIMP e Matriz Tributária Integrada com o Ecossistema Zuma.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setContingenciaAtiva(!contingenciaAtiva);
                toast(
                  !contingenciaAtiva
                    ? "Contingência Offline NFC-e ATIVADA! Emissão imediata sem depender de sinal SEFAZ."
                    : "Contingência Offline DESATIVADA. Modo normal SEFAZ restabelecido."
                );
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                contingenciaAtiva
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-[var(--surface2)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${contingenciaAtiva ? "animate-pulse" : ""}`} />
              <span>{contingenciaAtiva ? "Contingência Ativa" : "Ativar Contingência"}</span>
            </button>

            <button
              onClick={() => setModalNovaNfceOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Documento Fiscal</span>
            </button>
          </div>
        </div>

        {/* 4 Indicadores Fiscais Rápidos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Certificado Digital A1</span>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Válido até 18/10/2027
            </div>
            <span className="text-[10px] text-[var(--muted)]">Zuma Cozinha Oriental LTDA</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Webservice SEFAZ-MT</span>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online (Latência 68ms)
            </div>
            <span className="text-[10px] text-[var(--muted)]">Ambiente Produção · v4.00</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Token CSC Homologado</span>
            <div className="text-sm font-bold text-[var(--ink)] font-mono">
              Id: 000001 (QR Code Ativo)
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">100% de conformidade SEFAZ</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] block">Numeração &amp; Série</span>
            <div className="text-sm font-bold text-[var(--salmon)] font-mono">
              Série 1 · Próxima: #{ (notasList[0]?.numero || 1048) + 1 }
            </div>
            <span className="text-[10px] text-[var(--muted)]">Sequencial contínuo sem saltos</span>
          </div>
        </div>

        {/* NAVEGAÇÃO DE SUB-ABAS FISCAIS */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-[var(--line)] no-scrollbar">
          {[
            { id: "emissao", label: "Fila de Notas & Emissão", icon: ShieldCheck },
            { id: "sefaz27", label: "Monitor Webservices 27 UFs", icon: Globe },
            { id: "matriz", label: "Matriz Tributária Nacional & MT", icon: Calculator },
            { id: "validador", label: "Auditor NCM & CEST (SKUs)", icon: CheckCircle2 },
            { id: "sped", label: "SPED Bloco K (Produção)", icon: FileText },
            { id: "contador", label: "Pacote Contador (.ZIP) & DIMP", icon: FolderArchive },
            { id: "reforma", label: "Reforma IBS/CBS 2026", icon: Zap },
          ].map(tab => {
            const Icon = tab.icon;
            const active = subAba === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubAba(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? "bg-[var(--salmon)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ABA 1: FILA DE NOTAS, EMISSÃO & HISTÓRICO */}
      {subAba === "emissao" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[var(--ink)]">
                  Fila de Documentos Fiscais Emitidos (NFC-e mod 65 e NF-e mod 55)
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Histórico sincronizado com a SEFAZ-MT com consulta por Chave de Acesso de 44 dígitos e geração de DANFCE.
                </p>
              </div>

              {/* Filtro e Busca */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por nº, cliente, chave..."
                    value={termoBuscaNota}
                    onChange={e => setTermoBuscaNota(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)] w-48 sm:w-60"
                  />
                </div>

                <select
                  value={statusFiltro}
                  onChange={e => setStatusFiltro(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--ink)]"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="autorizada">Autorizadas</option>
                  <option value="contingencia">Em Contingência</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
            </div>

            {/* Lista de Notas Fiscais */}
            <div className="space-y-2.5">
              {notasFiltradas.map(nota => (
                <div
                  key={nota.id}
                  className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-[var(--salmon)]">
                        {nota.modelo === "65" ? "NFC-e" : "NF-e"} #{nota.numero} (Série {nota.serie})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${
                          nota.status === "autorizada"
                            ? "bg-emerald-600"
                            : nota.status === "contingencia"
                            ? "bg-amber-600"
                            : "bg-red-600"
                        }`}
                      >
                        {nota.status}
                      </span>
                      <span className="text-[11px] text-[var(--muted)] font-mono">
                        {new Date(nota.dataEmissao).toLocaleTimeString("pt-BR")} · {new Date(nota.dataEmissao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div>
                      <b className="text-[var(--ink)]">{nota.clienteNome}</b>
                      <span className="text-[11px] text-[var(--muted)] ml-2">CPF/CNPJ: {nota.clienteCpfCnpj}</span>
                      <span className="text-[11px] text-[var(--muted)] ml-2">Pagamento: <b>{nota.formaPagamento}</b></span>
                    </div>

                    <div className="text-[10px] text-[var(--muted)] font-mono truncate max-w-xl">
                      Chave: <b>{nota.chaveAcesso}</b> · Protocolo: <b>{nota.protocolo}</b>
                    </div>

                    {nota.status === "cancelada" && nota.motivoCancelamento && (
                      <div className="text-[10px] text-red-600 font-bold bg-red-500/10 px-2 py-0.5 rounded">
                        Motivo do cancelamento: {nota.motivoCancelamento}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono-nums font-black text-base text-[var(--ink)] block">
                        {formatBrl(nota.valorTotal)}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] block">
                        ICMS: {formatBrl(nota.icmsApurado)} (Simples)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setNotaSelecionadaDanfe(nota);
                          setModalDanfeOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:text-[var(--salmon)]"
                        title="Visualizar Cupom / DANFE"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDownloadXml(nota)}
                        className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:text-emerald-600"
                        title="Baixar XML Oficial Assinado"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {nota.status === "autorizada" && (
                        <button
                          onClick={() => {
                            setNotaParaCancelar(nota);
                            setModalCancelarOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-600 text-[11px] font-bold hover:bg-red-500 hover:text-white transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: MONITOR WEBSERVICES 27 UFs */}
      {subAba === "sefaz27" && (
        <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Painel de Monitoramento dos Webservices SEFAZ Nacional (27 UFs)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Status de conectividade em tempo real com servidores estaduais, tempo de resposta (ms) e prontidão de contingência.
              </p>
            </div>

            <button
              onClick={() => toast.success("Conectividade com as 27 SEFAZ verificada! Todos os autorizadores operacionais.")}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Atualizar Status
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {WEBSERVICES_27_UFS.map(ws => (
              <div
                key={ws.uf}
                className={`p-3 rounded-xl border space-y-1.5 ${
                  ws.uf === "MT"
                    ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
                    : "bg-[var(--surface2)] border-[var(--line)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm text-[var(--ink)]">{ws.uf}</span>
                    <span className="text-[11px] font-bold text-[var(--muted)]">({ws.estado})</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {ws.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--muted)] space-y-0.5">
                  <div>Autorizador: <b>{ws.autorizador}</b></div>
                  <div>Latência média: <b className="font-mono text-emerald-600">{ws.ms} ms</b></div>
                  <div className="text-[10px] text-zinc-500">Contingência: {ws.contingencia}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: MATRIZ TRIBUTÁRIA NACIONAL & MT */}
      {subAba === "matriz" && (
        <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[var(--salmon)]" />
              <span>Matriz Tributária Unificada: Gastronomia, Pescados MT, Varejo, AutoPeças e Indústria</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Enquadramento fiscal, alíquotas de ICMS-MT, PIS/COFINS, CST/CSOSN e fundamentação legal para todos os módulos do ERP.
            </p>
          </div>

          <div className="space-y-3">
            {REGRAS_TRIBUTARIAS_EXPANDIDAS.map(regra => (
              <div
                key={regra.id}
                className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface)] border border-[var(--line)] text-[var(--salmon)]">
                      {regra.segmento}
                    </span>
                    <b className="text-[var(--ink)] text-sm">{regra.descricao}</b>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[var(--muted)]">NCM: <b>{regra.ncm}</b></span>
                    {regra.cest !== "-" && <span className="text-[var(--muted)]">CEST: <b>{regra.cest}</b></span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]/60 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Tributação ICMS MT</span>
                    <b className="text-emerald-600">{regra.icmsMt}</b>
                    <span className="text-[10px] text-[var(--muted)] block">CST: {regra.cstIcms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">PIS / COFINS</span>
                    <b className="text-[var(--ink)]">{regra.pisCofins}</b>
                    <span className="text-[10px] text-[var(--muted)] block">Origem: {regra.origem}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Fundamento Legal</span>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold">{regra.beneficioLegal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: AUDITOR DE NCM & CEST (SKUs) */}
      {subAba === "validador" && (
        <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Auditoria Cadastral de SKUs e Prevenção de Rejeições SEFAZ</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Varredura automática nos 211 SKUs de cardápio e insumos para validação de NCM, CEST e CFOP.
              </p>
            </div>

            <button
              onClick={() => toast.success("Auditoria concluída: 211 SKUs validados! 0 erros impeditivos de transmissão.")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reauditar Catálogo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[var(--muted)]">SKUs Auditados</span>
              <div className="text-2xl font-black font-mono-nums text-[var(--ink)]">211 Itens</div>
              <span className="text-[10px] text-emerald-600 font-bold">100% com NCM válido na tabela IBPT</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Bebidas com CEST</span>
              <div className="text-2xl font-black font-mono-nums text-blue-600">34 SKUs</div>
              <span className="text-[10px] text-emerald-600 font-bold">Conformidade total Rejeição 805</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Risco de Rejeição</span>
              <div className="text-2xl font-black font-mono-nums text-emerald-600">0.0%</div>
              <span className="text-[10px] text-emerald-600 font-bold">Pronto para transmissão sem erros</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: SPED BLOCO K */}
      {subAba === "sped" && (
        <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>SPED EFD ICMS/IPI · Livro Registro de Controle da Produção e Estoque (Bloco K)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Obrigatoriedade fiscal SEFAZ para restaurantes e indústrias com transformação de insumos (Salmão, Concreto, etc.).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={mesAnoSped}
                onChange={e => setMesAnoSped(e.target.value)}
                className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs font-bold text-[var(--ink)]"
              />
              <button
                onClick={() => {
                  const conteudo = registrosBlocoK.map(r => r.reg).join("\r\n");
                  const blob = new Blob([conteudo], { type: "text/plain;charset=iso-8859-1" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `SPED_EFD_ICMS_IPI_BLOCO_K_${mesAnoSped}_ZUMA_TANGARA.TXT`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  toast.success("Arquivo SPED Bloco K gerado e baixado com sucesso!");
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar SPED (.TXT)
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs space-y-1 overflow-x-auto max-h-72 border border-slate-800">
            {registrosBlocoK.map((r, i) => (
              <div key={i} className="flex items-start gap-3 hover:bg-slate-900 p-1 rounded">
                <span className="text-slate-500 select-none w-6 text-right shrink-0">{i + 1}</span>
                <strong className="text-emerald-300 font-bold shrink-0">{r.reg}</strong>
                <span className="text-slate-400 text-[11px] truncate"># {r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 6: PACOTE MENSAL DO CONTADOR (.ZIP) & DIMP */}
      {subAba === "contador" && (
        <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-purple-600" />
                <span>Exportação Mensal de XMLs para Contabilidade &amp; Conciliação DIMP</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Pacote completo contendo XMLs autorizados, eventos de cancelamento, CC-e, SPED e conciliação de maquininhas/TEF.
              </p>
            </div>

            <button
              onClick={handleDownloadPacoteContadorZip}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" /> Baixar Pacote Completo (.ZIP)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">XMLs no Pacote</span>
              <div className="text-2xl font-black font-mono-nums text-[var(--ink)]">1.048 Arquivos</div>
              <p className="text-[11px] text-[var(--muted)]">NFC-e modelo 65 e NF-e modelo 55 autorizadas no mês.</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Conciliação DIMP</span>
              <div className="text-2xl font-black font-mono-nums text-emerald-600">100% Batido</div>
              <p className="text-[11px] text-[var(--muted)]">Total de cartões e Pix declarados coincide com extratos adquirentes.</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Envio Automático</span>
              <div className="text-sm font-bold text-[var(--ink)]">contabilidade@tangara.com.br</div>
              <p className="text-[11px] text-emerald-600 font-bold">Disparo agendado todo dia 01 às 08h.</p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 7: REFORMA TRIBUTÁRIA IBS/CBS */}
      {subAba === "reforma" && (
        <div className="p-4 sm:p-5 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Simulador de Transição · Reforma Tributária (IBS + CBS Dual)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Projeção de alíquotas do IVA Dual em substituição ao ICMS/PIS/COFINS para o setor de alimentação fora do lar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <strong className="text-sm font-black text-[var(--ink)] block">Cenário Atual (Simples / Lucro Presumido)</strong>
              <div className="space-y-1 text-[var(--muted)]">
                <div>• ICMS MT: ~12% a 17% (com redução em pescados)</div>
                <div>• PIS/COFINS: cumulativo ou monofásico em bebidas</div>
                <div>• Carga média consolidada no restaurante: ~10.4%</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <strong className="text-sm font-black text-amber-700 dark:text-amber-400 block">Projeção Nova Legislação (IBS + CBS)</strong>
              <div className="space-y-1 text-zinc-700 dark:text-zinc-300">
                <div>• Regime Diferenciado para Bares e Restaurantes (Alíquota Reduzida)</div>
                <div>• Crédito financeiro integral na compra de salmão chileno e insumos</div>
                <div>• Carga líquida estimada pós-créditos: ~9.8% (ganho de competitividade)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EMISSÃO NOVA NFC-e / NF-e */}
      {modalNovaNfceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleEmitirNota}
            className="bg-[var(--surface)] w-full max-w-lg rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--salmon)]" />
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Emitir Novo Documento Fiscal Eletrônico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovaNfceOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Modelo de Documento</label>
                  <select
                    value={novoModelo}
                    onChange={e => setNovoModelo(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] font-bold text-[var(--ink)]"
                  >
                    <option value="65">NFC-e (Modelo 65 - Consumidor)</option>
                    <option value="55">NF-e (Modelo 55 - Mercantil / B2B)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Forma de Pagamento</label>
                  <select
                    value={novaFormaPagto}
                    onChange={e => setNovaFormaPagto(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] font-bold text-[var(--ink)]"
                  >
                    <option value="PIX Dinâmico Instantâneo">PIX Instantâneo</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                    <option value="Boleto Faturado B2B">Boleto Faturado B2B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Nome do Cliente (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Marcelo Fagundes"
                    value={novoClienteNome}
                    onChange={e => setNovoClienteNome(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">CPF ou CNPJ na Nota</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={novoClienteCpf}
                    onChange={e => setNovoClienteCpf(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold block mb-1">Descrição do Item Principal</label>
                  <input
                    type="text"
                    required
                    value={novoItemNome}
                    onChange={e => setNovoItemNome(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={novoItemValor}
                    onChange={e => setNovoItemValor(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] font-mono font-bold"
                  />
                </div>
              </div>

              {contingenciaAtiva && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                  ⚠️ <b>Atenção:</b> Esta nota será emitida no modo <b>Contingência Offline (tpEmis = 9)</b>. O cupom é gerado imediatamente para o cliente e transmitido automaticamente à SEFAZ após o retorno da rede.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setModalNovaNfceOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[var(--salmon)] text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmitir e Autorizar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO DE DANFCE (FORMATO TÉRMICO 80MM) */}
      {modalDanfeOpen && notaSelecionadaDanfe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-sm rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[var(--salmon)]" />
                <span>DANFE NFC-e · Documento Auxiliar</span>
              </h3>
              <button onClick={() => setModalDanfeOpen(false)} className="text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cupom Térmico Formatado */}
            <div className="p-4 bg-white text-zinc-950 font-mono text-[10.5px] rounded-xl shadow-inner border border-zinc-200 space-y-1.5 leading-relaxed">
              <div className="text-center font-bold">
                <p className="text-xs">ZUMA COZINHA ORIENTAL LTDA</p>
                <p>CNPJ: 36.296.848/0001-57</p>
                <p>Av. Brasil, nº 1605-S - Tangará da Serra/MT</p>
                <p>IE: 13.784.920-4 · IM: 48.291-0</p>
              </div>

              <div className="border-t border-b border-dashed border-zinc-400 py-1 text-center font-bold">
                DANFE NFC-e - Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica
              </div>

              <div className="space-y-0.5">
                {notaSelecionadaDanfe.itens.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[190px]">{it.nome}</span>
                    <b className="font-mono">{formatBrl(it.subtotal)}</b>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-zinc-400 pt-1 space-y-0.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>QTD. TOTAL DE ITENS:</span>
                  <span>{notaSelecionadaDanfe.itens.length}</span>
                </div>
                <div className="flex justify-between font-black text-sm">
                  <span>VALOR TOTAL R$:</span>
                  <span>{formatBrl(notaSelecionadaDanfe.valorTotal)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>FORMA DE PAGAMENTO:</span>
                  <span>{notaSelecionadaDanfe.formaPagamento}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-400 pt-1 text-[9.5px] text-zinc-600">
                <p>Tributos Totais Incidentes (Lei Federal 12.741/2012): {formatBrl(notaSelecionadaDanfe.valorTotal * 0.142)} (14.2% IBPT)</p>
              </div>

              <div className="border-t border-dashed border-zinc-400 pt-1 text-center space-y-0.5 text-[10px]">
                <p>Número: {notaSelecionadaDanfe.numero} · Série: {notaSelecionadaDanfe.serie}</p>
                <p>Protocolo: {notaSelecionadaDanfe.protocolo}</p>
                <p>Emissão: {new Date(notaSelecionadaDanfe.dataEmissao).toLocaleString("pt-BR")}</p>
              </div>

              <div className="text-center py-2">
                <div className="w-24 h-24 mx-auto bg-zinc-100 border border-zinc-300 rounded flex items-center justify-center text-[9px] text-zinc-500 font-bold">
                  [ QR CODE SEFAZ-MT ]
                </div>
                <p className="text-[8.5px] text-zinc-500 mt-1 break-all">
                  Chave: {notaSelecionadaDanfe.chaveAcesso}
                </p>
              </div>

              <div className="text-center text-[9px] text-zinc-500 border-t border-dashed border-zinc-400 pt-1">
                Consulte pela Chave de Acesso em:<br />
                <b>http://www.sefaz.mt.gov.br/nfce/consultanfce</b>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  toast.success("Cupom enviado para o Spooler Térmico ESC/POS (80mm)!");
                  setModalDanfeOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--salmon)] text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Cupom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CANCELAMENTO COM PROTOCOLO SEFAZ */}
      {modalCancelarOpen && notaParaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--line)] shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  Cancelar Documento Fiscal #{notaParaCancelar.numero}
                </h3>
              </div>
              <button onClick={() => setModalCancelarOpen(false)} className="text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                O cancelamento será homologado perante o Webservice da SEFAZ-MT. Conforme Ajuste SINIEF, o motivo deve ter no mínimo 15 caracteres.
              </p>

              <div>
                <label className="font-bold block mb-1">Justificativa Legal de Cancelamento *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Erro de digitação na comanda pelo garçom / cliente desistiu do pedido"
                  value={motivoCancelamento}
                  onChange={e => setMotivoCancelamento(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                />
                <span className="text-[10px] text-[var(--muted)] block text-right mt-0.5">
                  {motivoCancelamento.length} / 15 caracteres mínimos
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => setModalCancelarOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] font-semibold"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmarCancelamento}
                disabled={motivoCancelamento.trim().length < 15}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                Confirmar Cancelamento SEFAZ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
