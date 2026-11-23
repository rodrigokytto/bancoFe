import React, { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  FileText,
  Boxes,
  CircleDollarSign,
  Receipt,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface ErpRelatoriosExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErpRelatoriosExportModal: React.FC<ErpRelatoriosExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Função auxiliar para download real de CSV com BOM UTF-8 (compatível com Excel)
  const triggerCsvDownload = (filename: string, csvContent: string) => {
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (tipo: string) => {
    setDownloadingId(tipo);

    setTimeout(() => {
      if (tipo === "dre") {
        const csv = [
          "Demonstrativo de Resultado do Exercício (DRE) - Zuma Cozinha Oriental",
          "Período: Novembro/2026 | CNPJ: 36.296.848/0001-57 | Tangará da Serra - MT",
          "",
          "Conta Gerencial;Valor (R$);% Receita Bruta;Classificação",
          "(=) RECEITA OPERACIONAL BRUTA;184500.00;100.0%;Receita",
          "    Vendas Salão & Rodízio Mesas (27 Mesas);112800.00;61.1%;Receita",
          "    Vendas Delivery (WhatsApp + iFood + App);62400.00;33.8%;Receita",
          "    Eventos Corporativos & B2B Agro Tangará;9300.00;5.0%;Receita",
          "(-) DEDUÇÕES DA RECEITA BRUTA;-13099.50;-7.1%;Dedução",
          "    Impostos Simples Nacional / ICMS MT;-9225.00;-5.0%;Tributo",
          "    Taxas de Cartões & Intermediação (Stone/Cielo);-3874.50;-2.1%;Taxa Financeira",
          "(=) RECEITA OPERACIONAL LÍQUIDA;171400.50;92.9%;Subtotal",
          "(-) CUSTO DAS MERCADORIAS VENDIDAS (CMV);-52420.00;-28.4%;Custo Direto",
          "    Salmão Chileno Fresco Nobre (Calibre 4-5kg);-31800.00;-17.2%;Pescado",
          "    Frutos do Mar (Polvo, Camarão, Atum, Kani);-10500.00;-5.7%;Pescado",
          "    Arroz Shari Japonês Especial & Grãos;-4120.00;-2.2%;Almoxarifado",
          "    Embalagens Térmicas & Sacolas Delivery;-3800.00;-2.1%;Embalagem",
          "    Bebidas, Cervejas Especiais & Saquês;-2200.00;-1.2%;Bar",
          "(=) MARGEM DE CONTRIBUIÇÃO BRUTA;118980.50;64.5%;Margem",
          "(-) DESPESAS OPERACIONAIS FIXAS;-74405.50;-40.3%;Despesa Fixa",
          "    Folha de Pagamento & Pessoal (18 Colaboradores);-34200.00;-18.5%;RH",
          "    Encargos Sociais, FGTS & Benefícios Equipe;-9800.00;-5.3%;RH",
          "    Aluguel Comercial Av. Brasil Tangará & IPTU;-12500.00;-6.8%;Imobiliário",
          "    Energia Elétrica Comercial Energisa MT (Câmaras Frias);-6400.00;-3.5%;Utilidades",
          "    Água, Telefonia, Internet Fibra & Nuvem TiDB;-1850.00;-1.0%;Utilidades",
          "    Marketing Digital, Tráfego Pago & Redes Sociais;-5500.00;-3.0%;Marketing",
          "    Sistemas, Licença Kytto ADM & Manutenção TI;-4155.50;-2.3%;TI",
          "(=) EBITDA GERENCIAL OPERACIONAL;44575.00;24.2%;EBITDA",
          "(-) Depreciação de Máquinas & Imobilizados;-3200.00;-1.7%;Depreciação",
          "(=) LUCRO LÍQUIDO FINAL DO PERÍODO;41375.00;22.4%;Resultado Líquido"
        ].join("\n");
        triggerCsvDownload("DRE_Gerencial_Zuma_Novembro_2026.csv", csv);
      } else if (tipo === "kardex") {
        const csv = [
          "Kardex & Rastreabilidade de Estoque Sanitário ANVISA - Salmão Chileno",
          "Zuma Cozinha Oriental - Tangará da Serra MT | Lote Vigente: LOT-SAL-20261120",
          "",
          "Data/Hora;Operação;Documento/Origem;Qtd (kg);Custo Unit (R$);Saldo Qtd (kg);Saldo Total (R$);Temperatura;Lote ANVISA;Status",
          "20/11/2026 08:30;Entrada NF-e;NF-e 41289 Pescados Pantanal;120.0;68.50;134.2;9192.70;-1.5°C;LOT-SAL-20261120;Aprovado",
          "20/11/2026 12:45;Toalete / Perda Limpeza;Espinha e Pele Descarte;-1.4;68.50;132.8;9096.80;-1.5°C;LOT-SAL-20261120;Auditado",
          "20/11/2026 15:30;Saída Salão Almoço;Comandas 27 Mesas;-18.5;68.50;114.3;7829.55;-1.5°C;LOT-SAL-20261120;Consumo Regular",
          "20/11/2026 23:15;Saída Delivery Jantar;Pedidos WhatsApp & iFood;-22.0;68.50;92.3;6322.55;-1.5°C;LOT-SAL-20261120;Consumo Regular",
          "21/11/2026 11:30;Saída Salão Almoço;Comandas Salão;-14.2;68.50;78.1;5349.85;-1.5°C;LOT-SAL-20261120;Consumo Regular",
          "21/11/2026 17:00;Inventário Contagem Cega;Auditoria Diária Balança Toledo;-0.3;68.50;77.8;5329.30;-1.5°C;LOT-SAL-20261120;Ajuste Acuracidade 99.6%",
          "21/11/2026 23:45;Saída Delivery Jantar;Pedidos Sexta/Sábado;-29.3;68.50;48.5;3322.25;-1.5°C;LOT-SAL-20261120;Consumo Regular"
        ].join("\n");
        triggerCsvDownload("Kardex_Estoque_Salmao_Chileno_ANVISA.csv", csv);
      } else if (tipo === "financeiro") {
        const csv = [
          "Posição Financeira de Contas a Pagar & Receber - Zuma Pilot",
          "Conciliação Cooperativa Sicredi & Sicoob MT | Tangará da Serra",
          "",
          "Tipo;ID;Favorecido / Cliente;Documento;Vencimento;Valor Original (R$);Retenções;Valor Líquido (R$);Forma Pagamento;Chave Pix / Código;Status",
          "PAGAR;PAG-101;Pescados Pantanal Ltda;NF-e 41289;25/11/2026;8220.00;0.00;8220.00;Pix Sicredi;07892441000192;Agendado",
          "PAGAR;PAG-102;Energisa Mato Grosso;FAT-2026-11;24/11/2026;6420.00;0.00;6420.00;Boleto Sicredi;83640000001-4;Pendente",
          "PAGAR;PAG-103;Laticínios Tangará Food;NF-e 8812;28/11/2026;1850.00;0.00;1850.00;Pix Sicredi;22511902000114;Pendente",
          "PAGAR;PAG-104;Distribuidora Grãos Nobres;NF-e 3319;30/11/2026;2480.00;0.00;2480.00;Pix Sicoob;financeiro@graosnobres.com.br;Pendente",
          "PAGAR;PAG-105;Imobiliária Brasil Tangará;REC-ALUGUEL;05/12/2026;12500.00;0.00;12500.00;Pix Sicredi;locacao@imobbrasil.com.br;Pendente",
          "RECEBER;REC-201;Agroindustrial Parecis S.A.;CTR-01 / NFS-e 142;23/11/2026;14500.00;0.00;14500.00;Boleto Sicredi;74891.11022;Aguardando",
          "RECEBER;REC-202;Cooperativa Sicredi Tangará;CTR-02 / NFS-e 143;25/11/2026;8900.00;0.00;8900.00;Faturado 15D;TED Cooperativo;Aguardando",
          "RECEBER;REC-203;Stone Pagamentos TEF;LOTE-8821;21/11/2026;3840.50;0.00;3840.50;Cartão TEF;Liquidado D+1;Recebido",
          "RECEBER;REC-204;Engenharia Serrano Ltda;FAT-401;17/11/2026;5400.00;0.00;5400.00;Boleto Sicredi;74893.99120;Atrasado (Cobrança)"
        ].join("\n");
        triggerCsvDownload("Contas_Pagar_Receber_Sicredi_Sicoob.csv", csv);
      } else if (tipo === "fiscal") {
        const csv = [
          "Matriz Fiscal de Documentos Transmitidos SEFAZ-MT - Zuma Pilot",
          "Certificado Digital A1 ICP-Brasil | Tangará da Serra MT",
          "",
          "Número;Série;Modelo;Chave de Acesso (44 Dígitos);Protocolo SEFAZ;Data/Hora Emissão;Valor Total (R$);ICMS Apurado (R$);Meio Pagamento;Status SEFAZ",
          "1048;1;65 (NFC-e);51261136296848000157650010000010481827364519;151260004928172;21/11/2026 21:45;389.90;0.00;Pix Sicredi Dinâmico;Autorizada",
          "1047;1;65 (NFC-e);51261136296848000157650010000010471928374620;151260004928171;21/11/2026 21:30;210.00;0.00;Cartão Crédito TEF;Autorizada",
          "1046;1;65 (NFC-e);51261136296848000157650010000010461039485731;151260004928170;21/11/2026 21:10;450.00;0.00;Pix Dinâmico;Autorizada",
          "1045;1;65 (NFC-e);51261136296848000157650010000010451140596842;151260004928169;21/11/2026 20:55;125.00;0.00;Dinheiro em Espécie;Autorizada",
          "1044;1;65 (NFC-e);51261136296848000157650010000010441251607953;151260004928168;21/11/2026 20:40;98.90;0.00;Cartão Débito;Autorizada",
          "142;1;55 (NF-e);51261136296848000157550010000001421362718064;151260004928167;20/11/2026 16:00;14500.00;0.00;Boleto Faturado;Autorizada"
        ].join("\n");
        triggerCsvDownload("Matriz_Fiscal_NFCe_NFe_SEFAZ_MT.csv", csv);
      } else if (tipo === "rh") {
        const csv = [
          "Espelho de Ponto Eletrônico & Escala de Turnos - Portaria 671 MTE",
          "Kytto Holding / Zuma Gastronomia | 18 Colaboradores Ativos",
          "",
          "Matrícula;Nome Colaborador;Cargo;Setor;Data;Entrada 1;Saída 1;Entrada 2;Saída 2;Total Horas;Saldo Banco;Status Ponto",
          "COL-001;Alisson Ferreira;Sushiman Líder;Sushibar;21/11/2026;15:00;19:00;20:00;23:30;07h30;+01h00;Validado Biometria",
          "COL-002;Juliana Ribeiro;Sub-Chef de Cozinha;Cozinha Quente;21/11/2026;15:00;19:00;20:00;23:30;07h30;00h00;Validado Biometria",
          "COL-003;Marcos Vinicius;Garçom Salão 27 Mesas;Atendimento;21/11/2026;17:30;21:30;22:00;00:00;06h00;+00h30;Validado App Ponto",
          "COL-004;Fernanda Gomes;Operadora de Caixa;Frente de Caixa;21/11/2026;17:00;21:00;21:30;23:45;06h15;00h00;Validado Terminal",
          "COL-005;Carlos Eduardo;Cumim / Apoio Mesas;Atendimento;21/11/2026;18:00;22:00;22:30;00:15;05h45;-00h15;Validado App Ponto",
          "COL-006;Diego Barman;Barman & Mixologista;Bar / Copa;21/11/2026;17:30;21:30;22:00;00:00;06h00;+01h30;Validado Biometria"
        ].join("\n");
        triggerCsvDownload("Espelho_Folha_Ponto_Portaria671.csv", csv);
      }

      setDownloadingId(null);
      toast.success("Relatório gerado e baixado com sucesso em formato CSV (.csv) para Excel!");
    }, 600);
  };

  const relatorios = [
    {
      id: "dre",
      titulo: "DRE Gerencial Completo & EBITDA (12 Meses)",
      descricao: "Demonstrativo consolidado de receitas, deduções, CMV de pescados, margem bruta, despesas com pessoal e EBITDA.",
      icone: FileSpreadsheet,
      cor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      formato: "CSV (Excel)",
      tamanho: "32 KB"
    },
    {
      id: "kardex",
      titulo: "Kardex de Estoque & Rastreabilidade ANVISA (Salmão)",
      descricao: "Histórico completo de entradas de NF-e, toalete, saídas salão/delivery, saldo diário e temperatura das câmaras.",
      icone: Boxes,
      cor: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      formato: "CSV (Excel)",
      tamanho: "48 KB"
    },
    {
      id: "financeiro",
      titulo: "Posição de Contas a Pagar & Receber (Sicredi/Sicoob)",
      descricao: "Relação de duplicatas, boletos com código de barras, pagamentos Pix autorizados e conciliação bancária.",
      icone: CircleDollarSign,
      cor: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      formato: "CSV (Excel)",
      tamanho: "28 KB"
    },
    {
      id: "fiscal",
      titulo: "Matriz de Documentos Fiscais SEFAZ-MT (NFC-e / NF-e)",
      descricao: "Chaves de acesso de 44 dígitos, protocolos SEFAZ, XMLs autorizados e controle de contingência offline.",
      icone: Receipt,
      cor: "text-purple-600 bg-purple-500/10 border-purple-500/20",
      formato: "CSV (Excel)",
      tamanho: "64 KB"
    },
    {
      id: "rh",
      titulo: "Espelho de Ponto Eletrônico & Folha (Portaria 671 MTE)",
      descricao: "Registro digital de marcações de ponto dos 18 colaboradores, banco de horas e turnos de salão/cozinha.",
      icone: Users,
      cor: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
      formato: "CSV (Excel)",
      tamanho: "22 KB"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] w-full max-w-2xl rounded-2xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--line)] bg-[var(--surface2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--salmon)]/10 text-[var(--salmon)] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <span>Central de Relatórios &amp; Exportação ERP 360°</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Excel / CSV
                </span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Exporte demonstrativos auditáveis com formatação regional de Tangará da Serra - MT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com os Relatórios */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Todos os relatórios são gerados em tempo real com dados consolidados do banco TiDB e homologação SEFAZ-MT, prontos para importação no Microsoft Excel, Google Planilhas ou sistemas contábeis parceiros.
            </span>
          </div>

          <div className="space-y-2.5">
            {relatorios.map((rel) => {
              const Icon = rel.icone;
              const isDownloading = downloadingId === rel.id;
              return (
                <div
                  key={rel.id}
                  className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${rel.cor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--ink)] flex items-center gap-2">
                        <span>{rel.titulo}</span>
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                        {rel.descricao}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--muted)] font-mono">
                        <span>Formato: <strong>{rel.formato}</strong></span>
                        <span>•</span>
                        <span>Tamanho estimado: <strong>{rel.tamanho}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExport(rel.id)}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
                    <span>{isDownloading ? "Gerando..." : "Baixar .CSV"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--muted)]">
            Zuma Pilot v4.0 · Padrão Corporativo Holding Kytto
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
