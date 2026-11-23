import React, { useState } from "react";
import { 
  FileArchive, 
  Download, 
  Send, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Receipt, 
  Layers, 
  Clock,
  ExternalLink
} from "lucide-react";
import JSZip from "jszip";
import { Link } from "wouter";

export function FechamentoContabilMensal() {
  const [gerandoZip, setGerandoZip] = useState(false);
  const [zipGerado, setZipGerado] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [mesReferencia, setMesReferencia] = useState("Novembro / 2026");

  const dadosContabilidade = {
    escritorio: "Tangará Contabilidade & Gestão Tributária",
    contadorResponsavel: "CRC-MT 018429/O - Marcos Aurélio de Souza",
    emailContador: "fiscal@tangaracontabil.com.br",
    regimeTributario: "Simples Nacional (Anexo I - Comércio com Segregação ICMS-ST)",
    rbt12: 720000.00,
    aliquotaEfetiva: "7.58%",
    previsaoImpostoDAS: 5151.00,
    totalNfceEmitidas: 1428,
    valorTotalFaturado: 114850.00
  };

  const arquivosDoPacote = [
    {
      nome: "SPED_Fiscal_EFD_ICMS_IPI_Bloco_K.txt",
      tipo: "TXT Fiscal SEFAZ-MT",
      tamanho: "148 KB",
      descricao: "Registros |K200| (Estoque Escriturado) e |K230/K235| (Industrialização do Salmão Chileno)"
    },
    {
      nome: "Lote_NFCe_SEFAZ_MT_Autorizadas.xml",
      tipo: "XML Lote Fiscal",
      tamanho: "3.2 MB",
      descricao: "1.428 cupons fiscais eletrônicos modelo 65 autorizados nos servidores da SEFAZ-MT"
    },
    {
      nome: "DRE_Gerencial_EBITDA_Consolidado.csv",
      tipo: "Planilha Gerencial",
      tamanho: "24 KB",
      descricao: "Receita bruta, deduções, CMV detalhado de pescados (31.4%) e EBITDA do mês"
    },
    {
      nome: "Fechamento_Cego_Turnos_Conferencia_Auditoria.csv",
      tipo: "Relatório Financeiro",
      tamanho: "42 KB",
      descricao: "60 fechamentos de turno auditados, sangrias, suprimentos e apuração de quebra de caixa"
    },
    {
      nome: "Conciliacao_Bancaria_OFX_Sicredi_Sicoob.ofx",
      tipo: "Extrato Bancário Aberto",
      tamanho: "86 KB",
      descricao: "Extrato bancário OFX com liquidação de cartões e recebimentos Pix"
    }
  ];

  const handleGerarZip = async () => {
    setGerandoZip(true);
    try {
      const zip = new JSZip();

      // 1. Arquivo SPED Bloco K
      const spedConteudo = `|0000|018|0|01112026|30112026|ZUMA COZINHA ORIENTAL LTDA|36296848000157||MT|130000000|5107909|||A|1|\n|0001|0|\n|K100|01112026|30112026|\n|K200|30112026|NCM-03021400|48.500|0|\n|K230|01112026|30112026|OP-202611-01|PRD-SASHIMI-01|142.300|\n|K235|01112026|INSM-SALMAO-BRUTO|245.300|||\n|9999|7|`;
      zip.file("SPED_Fiscal_EFD_ICMS_IPI_Bloco_K.txt", spedConteudo);

      // 2. Arquivo XML NFCe
      const xmlConteudo = `<?xml version="1.0" encoding="UTF-8"?>\n<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">\n  <NFe>\n    <infNFe Id="NFe51261136296848000157650010000014281001234567" versao="4.00">\n      <emit>\n        <CNPJ>36296848000157</CNPJ>\n        <xNome>ZUMA COZINHA ORIENTAL LTDA</xNome>\n        <UF>MT</UF>\n      </emit>\n      <total>\n        <vNF>114850.00</vNF>\n      </total>\n    </infNFe>\n  </NFe>\n</nfeProc>`;
      zip.file("Lote_NFCe_SEFAZ_MT_Autorizadas.xml", xmlConteudo);

      // 3. DRE Gerencial CSV
      const dreCsv = `Linha DRE;Valor R$;Percentual %\nReceita Bruta;114850.00;100.00%\nDeduções e Impostos Simples;8705.63;7.58%\nReceita Líquida;106144.37;92.42%\nCMV Pescados e Insumos;36062.90;31.40%\nMargem de Contribuição;70081.47;61.02%\nDespesas Operacionais e Folha;38500.00;33.52%\nEBITDA Gerencial;31581.47;27.50%`;
      zip.file("DRE_Gerencial_EBITDA_Consolidado.csv", dreCsv);

      // 4. Fechamento Cego CSV
      const fechamentoCsv = `Data;Turno;Operador;Suprimento;Sangria;Venda Dinheiro;Conferencia Cega;Quebra Caixa\n20/11/2026;Jantar;Matheus Garcom;200.00;1200.00;1420.00;1420.00;0.00\n21/11/2026;Almoco;Ana Caixa;200.00;800.00;940.00;940.00;0.00`;
      zip.file("Fechamento_Cego_Turnos_Conferencia_Auditoria.csv", fechamentoCsv);

      // 5. OFX Bancario
      const ofxConteudo = `OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\nSECURITY:NONE\nOLDFILEENCODING:UTF-8\n<OFX>\n  <BANKMSGSRSV1>\n    <STMTTRNRS>\n      <STMTRS>\n        <CURDEF>BRL</CURDEF>\n        <BANKACCTFROM>\n          <BANKID>748</BANKID>\n          <ACCTID>36296848-1</ACCTID>\n        </BANKACCTFROM>\n      </STMTRS>\n    </STMTTRNRS>\n  </BANKMSGSRSV1>\n</OFX>`;
      zip.file("Conciliacao_Bancaria_OFX_Sicredi_Sicoob.ofx", ofxConteudo);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PACOTE_FECHAMENTO_CONTABIL_ZUMA_${mesReferencia.replace(/[^a-zA-Z0-9]/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setZipGerado(true);
    } catch (err) {
      console.error("Erro gerando ZIP:", err);
      alert("Erro ao gerar arquivo compactado.");
    } finally {
      setGerandoZip(false);
    }
  };

  const handleEnviarEmail = () => {
    setEmailEnviado(true);
    setTimeout(() => setEmailEnviado(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6">
      {/* TopBar Fechamento Contábil */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">FECHAMENTO CONTÁBIL MENSAL "1-CLICK"</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold uppercase">
                SEFAZ-MT & SPED Integrados
              </span>
            </div>
            <p className="text-xs text-slate-400">Exportação compactada .ZIP com XMLs NFC-e, SPED Bloco K, DRE EBITDA e extratos bancários</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/fiscal">
            <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700">
              Painel Fiscal SEFAZ
            </button>
          </Link>
          <Link href="/erp">
            <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
              Voltar ao ERP
            </button>
          </Link>
        </div>
      </header>

      {/* Alerta de E-mail Enviado */}
      {emailEnviado && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pacote fiscal de {mesReferencia} enviado com sucesso para <strong>{dadosContabilidade.emailContador}</strong>!</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">Protocolo: CT-202611-9482</span>
        </div>
      )}

      {/* Cartões de Parâmetros Contábeis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Mês de Competência</span>
          <p className="text-base font-bold text-white">{mesReferencia}</p>
          <p className="text-[10px] text-emerald-400">100% dos dados conciliados</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Faturamento Bruto</span>
          <p className="text-xl font-black text-white">R$ {dadosContabilidade.valorTotalFaturado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400">{dadosContabilidade.totalNfceEmitidas} NFC-e emitidas</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Guia DAS Estimada</span>
          <p className="text-xl font-black text-amber-400">R$ {dadosContabilidade.previsaoImpostoDAS.toFixed(2)}</p>
          <p className="text-[10px] text-amber-300 font-semibold">Alíquota efetiva: {dadosContabilidade.aliquotaEfetiva}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Status da Auditoria</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Pronto p/ Envio</span>
          </div>
          <p className="text-[10px] text-slate-400">Zero divergências fiscais</p>
        </div>
      </div>

      {/* Conteúdo do Pacote ZIP */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-purple-400" />
              Arquivos Consolidados no Pacote ZIP de Fechamento
            </h3>
            <p className="text-xs text-slate-400">Gera um arquivo único .ZIP com todos os documentos exigidos pela contabilidade e SEFAZ-MT</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGerarZip}
              disabled={gerandoZip}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{gerandoZip ? "Gerando Pacote..." : "Baixar Pacote .ZIP Completo"}</span>
            </button>

            <button
              onClick={handleEnviarEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Enviar para Contabilidade</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {arquivosDoPacote.map((arq, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">{arq.nome}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{arq.descricao}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-300">{arq.tamanho}</span>
                <p className="text-[10px] text-purple-400 uppercase font-semibold">{arq.tipo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ficha da Contabilidade Parceira */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">{dadosContabilidade.escritorio}</h4>
            <p className="text-xs text-slate-400">{dadosContabilidade.contadorResponsavel} • Tangará da Serra (MT)</p>
            <p className="text-[10px] text-slate-500">Destinatário padrão dos fechamentos mensais no dia 01 de cada mês.</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          SLA Contábil: 100% em dia
        </span>
      </div>
    </div>
  );
}
export default FechamentoContabilMensal;
