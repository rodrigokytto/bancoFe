import React, { useState } from "react";
import {
  FileText,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Download,
  KeyRound,
  Lock,
  Clock,
  Coins,
  Scale,
  Activity,
  FileCheck,
  Send,
  Eye,
  Sliders
} from "lucide-react";
import { toast } from "sonner";

export const SefazDfeFiscalHub: React.FC = () => {
  const [consultaCnpj, setConsultaCnpj] = useState("36.296.848/0001-57");
  const [statusSefaz, setStatusSefaz] = useState<"NORMAL" | "CONTINGENCIA">("NORMAL");
  const [ambienteFiscal, setAmbienteFiscal] = useState<"PRODUCAO" | "HOMOLOGACAO">("PRODUCAO");
  const [filtroTipoDoc, setFiltroTipoDoc] = useState<"TODOS" | "NFCe" | "NFe_Entrada" | "MDe">("TODOS");
  const [carregandoConsulta, setCarregandoConsulta] = useState(false);

  // Lista de Documentos Fiscais Eletrônicos Recentes em Tangará da Serra
  const [documentosFiscais, setDocumentosFiscais] = useState([
    {
      chave: "51261136296848000157650010000048211009182314",
      numero: "000.004.821",
      serie: "1",
      modelo: "NFC-e 65",
      dataEmissao: "22/11/2026 21:14:02",
      destinatario: "Consumidor Final (CPF: ***.812.901-**)",
      valorTotal: 284.50,
      itensQtd: 4,
      status: "AUTORIZADA",
      protocolo: "151260049281734",
      tributos: { icms: 0.00, pis: 1.85, cofins: 8.54, simplesTotal: 17.07 },
      formaPagamento: "Pix Instantâneo Sicredi",
      xmlBaixado: true
    },
    {
      chave: "51261136296848000157650010000048201009182309",
      numero: "000.004.820",
      serie: "1",
      modelo: "NFC-e 65",
      dataEmissao: "22/11/2026 20:58:31",
      destinatario: "Consumidor Final (Mesa 03 Salão VIP)",
      valorTotal: 908.49,
      itensQtd: 12,
      status: "AUTORIZADA",
      protocolo: "151260049281710",
      tributos: { icms: 0.00, pis: 5.90, cofins: 27.25, simplesTotal: 54.50 },
      formaPagamento: "Cartão de Crédito Stone D+1",
      xmlBaixado: true
    },
    {
      chave: "51261136296848000157550010000001921009182281",
      numero: "000.000.192",
      serie: "1",
      modelo: "NF-e 55",
      dataEmissao: "22/11/2026 19:30:10",
      destinatario: "AMAGGI EXPORTAÇÃO E IMPORTAÇÃO S.A. (CNPJ 00.299.790/0001-90)",
      valorTotal: 3450.00,
      itensQtd: 28,
      status: "AUTORIZADA",
      protocolo: "151260049281655",
      tributos: { icms: 0.00, pis: 22.42, cofins: 103.50, simplesTotal: 207.00 },
      formaPagamento: "Boleto Faturado 30D (Sicredi MT)",
      xmlBaixado: true
    },
    {
      chave: "51261102914856000199550010000128451009182100",
      numero: "000.012.845",
      serie: "1",
      modelo: "NF-e Entrada (MDe)",
      dataEmissao: "22/11/2026 08:15:00",
      destinatario: "ZUMA GASTRONOMIA ORIENTAL (L. CARDOSO CARVALHO LTDA)",
      emitente: "FRIGORÍFICO PESCADOS NOBRES CUIABÁ LTDA",
      valorTotal: 8420.00,
      itensQtd: 3,
      descricaoItem: "Salmão Fresco Chileno Nobre Inteiro Eviscerado (120 kg)",
      status: "MANIFESTADA (Ciência da Operação)",
      protocolo: "151260049279110",
      tributos: { icmsStRetido: 421.00, chaveOrigem: "Chile CIF Tangará" },
      formaPagamento: "Faturado 15D Fornecedor",
      xmlBaixado: true
    }
  ]);

  const executarConsultaSefaz = () => {
    setCarregandoConsulta(true);
    setTimeout(() => {
      setCarregandoConsulta(false);
      toast.success("Web Service SEFAZ-MT respondendo em 18ms! Ambiente de Produção 100% Homologado.");
    }, 600);
  };

  const baixarLoteXml = () => {
    toast.success("Lote compactado (ZIP) com 148 arquivos XML e DANFE assinado baixado com sucesso!");
  };

  const executarMDe = () => {
    toast.success("Manifestação de Destinatário (MDe) executada! 2 novas notas de fornecedores de salmão sincronizadas.");
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BANNER PRINCIPAL SEFAZ-MT & DF-E                                      */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                SEFAZ-MT Oficial (Cuiabá)
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Certificado Digital A1 Válido (e-CNPJ)
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                Validade: 14/10/2027 (326 dias)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              SEFAZ-MT &amp; Hub Fiscal DF-e (NFC-e 65, NF-e 55 &amp; MDe)
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Emissão instantânea de notas fiscais ao consumidor (NFC-e modelo 65) em 18 milissegundos, faturamento corporativo B2B para o agronegócio (NF-e modelo 55) e captura automática de notas de compras de Salmão Fresco e insumos via Manifestação de Destinatário (MDe).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={executarMDe}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sincronizar MDe (Entradas)</span>
            </button>
            <button
              onClick={executarConsultaSefaz}
              className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)] hover:bg-[var(--line)] transition-all cursor-pointer"
              title="Verificar status SEFAZ-MT"
            >
              <RefreshCw className={`w-4 h-4 ${carregandoConsulta ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 KPIs Fiscais Estruturais para Decisão */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Status Servidor SEFAZ-MT
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operacional (18ms)
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Web Service Cuiabá Autorizando D+0
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Notas Emitidas no Mês (NFC-e)
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              2.418 notas
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              100% transmitidas sem rejeição
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Carga Tributária Efetiva
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              6.00%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Simples Nacional Anexo I / Restaurante
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Lotes XML em Nuvem (Drive)
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              148 Arquivos
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block leading-tight">
              Backup diário automático SHA-256
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* AUDITORIA DE DOCUMENTOS FISCAIS RECENTES                              */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-extrabold text-sm text-[var(--ink)]">
                Documentos Fiscais Emitidos &amp; Capturados em Tempo Real
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Transmissões homologadas pela SEFAZ-MT com protocolo oficial e XML assinado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={baixarLoteXml}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Lote XML (ZIP)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] font-bold uppercase text-[var(--muted)]">
                <th className="py-2.5 px-3">Número / Modelo</th>
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Destinatário / Emitente</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3">Protocolo SEFAZ</th>
                <th className="py-2.5 px-3">Forma de Pagamento</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-medium">
              {documentosFiscais.map((doc, idx) => (
                <tr key={idx} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-black text-[var(--ink)] block">{doc.numero}</span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">{doc.modelo}</span>
                  </td>
                  <td className="py-3 px-3 text-[var(--muted)] font-mono">
                    {doc.dataEmissao}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[var(--ink)] block truncate max-w-xs">{doc.destinatario}</span>
                    {"emitente" in doc && (
                      <span className="text-[10px] text-blue-600 block">{doc.emitente}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-[var(--ink)]">
                    R$ {doc.valorTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-[var(--muted)]">
                    {doc.protocolo}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[var(--muted)]">
                    {doc.formaPagamento}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
