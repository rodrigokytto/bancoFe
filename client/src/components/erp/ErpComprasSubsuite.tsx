import React, { useState } from "react";
import {
  ShoppingCart,
  FileCheck,
  FileText,
  Truck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Search,
  Plus,
  Send,
  Download,
  Calendar,
  Check,
  Percent,
  Clock,
  ArrowRight,
  Filter,
  Printer,
  Scale,
  ShieldCheck,
  X,
  FileSignature
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  categoria: string;
  slaPontualidade: number;
  status: "Homologado" | "Em Auditoria" | "Bloqueado";
  contato: string;
  chavePix: string;
}

const FORNECEDORES_INICIAIS: Fornecedor[] = [
  { id: "FORN-01", nome: "Pescados Pantanal Ltda", cnpj: "07.892.441/0001-92", cidade: "Cuiabá - MT", categoria: "Pescados Nobres (Salmão, Atum, Polvo)", slaPontualidade: 98.5, status: "Homologado", contato: "Paulo Santos (65) 99912-3344", chavePix: "07892441000192 (CNPJ)" },
  { id: "FORN-02", nome: "Distribuidora Grãos Nobres MT", cnpj: "19.340.112/0001-50", cidade: "Tangará da Serra - MT", categoria: "Arroz Shari, Farinhas & Grãos", slaPontualidade: 99.0, status: "Homologado", contato: "Márcio Grãos (65) 99877-5511", chavePix: "financeiro@graosnobres.com.br" },
  { id: "FORN-03", nome: "Laticínios Tangará Food Service", cnpj: "22.511.902/0001-14", cidade: "Tangará da Serra - MT", categoria: "Cream Cheese Balde, Manteigas & Queijos", slaPontualidade: 96.0, status: "Homologado", contato: "Juliana Vendas (65) 99654-2200", chavePix: "22511902000114 (CNPJ)" },
  { id: "FORN-04", nome: "Mar & Rio Pescados Distribuidora", cnpj: "03.412.871/0002-33", cidade: "Várzea Grande - MT", categoria: "Pescados & Frutos do Mar Congelados", slaPontualidade: 94.2, status: "Homologado", contato: "Carlos Eduardo (65) 99211-9988", chavePix: "carlos@marerio.com.br" },
  { id: "FORN-05", nome: "Embalagens & Descartáveis Tangará", cnpj: "31.988.220/0001-87", cidade: "Tangará da Serra - MT", categoria: "Embalagens Delivery, Hashis & Sacolas", slaPontualidade: 97.8, status: "Homologado", contato: "Regina Costa (65) 99933-4411", chavePix: "pix@embalagenstangara.com.br" },
];

export const ErpComprasSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"cotacoes" | "xml" | "ordens" | "conferencia" | "fornecedores">("cotacoes");
  const [chaveNfe, setChaveNfe] = useState("51261107892441000192550010000412891982736451");
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(FORNECEDORES_INICIAIS);
  const [filtroFornecedor, setFiltroFornecedor] = useState("");
  
  // Estado para Modal de Ordem de Compra Timbrada
  const [ocVisualizando, setOcVisualizando] = useState<{
    id: string;
    fornecedor: string;
    cnpjFornecedor: string;
    emissao: string;
    entregaPrevista: string;
    valorTotal: number;
    itens: Array<{ desc: string; ncm: string; qtd: string; vlrUnit: number; total: number }>;
    status: string;
    condicao: string;
    frete: string;
  } | null>(null);

  // Estado da Conferência Cega da Balança Toledo
  const [pesoBalança, setPesoBalança] = useState<number | null>(null);
  const [balançaConectada, setBalançaConectada] = useState(false);
  const [conferenciaConcluida, setConferenciaConcluida] = useState(false);

  // Cotações 3 Vias
  const cotacoesAtivas = [
    {
      id: "COT-2026-88",
      item: "Salmão Fresco Chileno Premium (Calibre 4-5kg)",
      qtd: "120 kg (Turnos Fim de Semana)",
      dataLimite: "23/11/2026",
      opcoes: [
        { fornecedor: "Pescados Pantanal Ltda", precoUnit: 68.50, prazoEntrega: "1 dia útil", frete: "CIF (Incluso)", score: 98, selecionado: true },
        { fornecedor: "Mar & Rio Pescados", precoUnit: 71.00, prazoEntrega: "2 dias úteis", frete: "FOB (+R$ 150)", score: 84, selecionado: false },
        { fornecedor: "Costa Sul Pescados", precoUnit: 69.90, prazoEntrega: "3 dias úteis", frete: "CIF (Incluso)", score: 88, selecionado: false },
      ]
    },
    {
      id: "COT-2026-89",
      item: "Cream Cheese Balde 3.6kg Tradicional",
      qtd: "15 Baldes (54 kg)",
      dataLimite: "24/11/2026",
      opcoes: [
        { fornecedor: "Laticínios Tangará Food Service", precoUnit: 98.00, prazoEntrega: "Imediato (Local)", frete: "Grátis", score: 99, selecionado: true },
        { fornecedor: "Atacadão Tangará", precoUnit: 104.90, prazoEntrega: "Retirada Balcão", frete: "Retirada Própria", score: 79, selecionado: false },
        { fornecedor: "Danone Food Service MT", precoUnit: 102.50, prazoEntrega: "3 dias úteis", frete: "CIF", score: 86, selecionado: false },
      ]
    }
  ];

  // Ordens de Compra (OCs)
  const ordensCompra = [
    {
      id: "OC-1049",
      fornecedor: "Pescados Pantanal Ltda",
      cnpjFornecedor: "07.892.441/0001-92",
      emissao: "21/11/2026",
      entregaPrevista: "22/11/2026 08:30",
      valorTotal: 8220.00,
      itens: [
        { desc: "Salmão Fresco Chileno Inteiro Eviscerado Calibre 4-5kg", ncm: "0302.14.00", qtd: "120 kg", vlrUnit: 68.50, total: 8220.00 }
      ],
      status: "Aprovada pelo Gerente",
      condicao: "Boleto 21 dias",
      frete: "CIF (Entregue na câmara fria - Tangará da Serra)"
    },
    {
      id: "OC-1048",
      fornecedor: "Distribuidora Grãos Nobres MT",
      cnpjFornecedor: "19.340.112/0001-50",
      emissao: "20/11/2026",
      entregaPrevista: "21/11/2026 14:00",
      valorTotal: 2130.00,
      itens: [
        { desc: "Arroz Grão Curto Japonês Shari Especial Tipo 1", ncm: "1006.30.21", qtd: "150 kg", vlrUnit: 14.20, total: 2130.00 }
      ],
      status: "Entregue & Conferida",
      condicao: "Pix 14 dias",
      frete: "FOB (Retirado pelo veículo de apoio)"
    },
    {
      id: "OC-1047",
      fornecedor: "Embalagens & Descartáveis",
      cnpjFornecedor: "31.988.220/0001-87",
      emissao: "19/11/2026",
      entregaPrevista: "20/11/2026 10:00",
      valorTotal: 1450.00,
      itens: [
        { desc: "Sacolas Kraft Personalizadas Zuma Eco (G)", ncm: "4819.40.00", qtd: "500 un", vlrUnit: 1.80, total: 900.00 },
        { desc: "Pares de Hashis de Bambu Selados Higiênicos", ncm: "4421.91.00", qtd: "1000 un", vlrUnit: 0.55, total: 550.00 }
      ],
      status: "Entregue & Conferida",
      condicao: "Boleto 30 dias",
      frete: "CIF (Incluso)"
    },
  ];

  const importarXmlNfe = (e: React.FormEvent) => {
    e.preventDefault();
    if (chaveNfe.length !== 44) {
      toast.error("A chave de acesso da NF-e deve possuir exatamente 44 dígitos numéricos.");
      return;
    }
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Consultando SEFAZ-MT e decodificando XML da NF-e modelo 55...",
        success: "NF-e nº 41289 importada! Itens convertidos e lançados no Estoque e no Contas a Pagar.",
        error: "Falha na comunicação com a SEFAZ.",
      }
    );
  };

  const enviarOcFornecedor = (id: string, fornecedor: string) => {
    toast.success(`Ordem de Compra ${id} gerada em PDF e enviada via WhatsApp para ${fornecedor}!`);
  };

  const conectarBalançaToledo = () => {
    setBalançaConectada(true);
    toast.loading("Conectando porta serial COM3 / RS-232 com Balança Toledo Prix 3 Fit...", { duration: 1200 });
    setTimeout(() => {
      setPesoBalança(119.85); // 119.85 kg de 120kg (99.88% de acurácia)
      toast.success("Balança Toledo Prix 3 Fit sincronizada! Leitura estável capturada: 119.85 kg.");
    }, 1300);
  };

  const aprovarConferenciaCega = () => {
    setConferenciaConcluida(true);
    toast.success("3-Way Matching Homologado! NF-e 41289 x OC-1049 x Toledo Prix 3 Fit validados com divergência residual de 0.12% (aceita pela ANVISA).");
  };

  return (
    <div className="space-y-5">
      {/* Top Banner do Módulo de Compras & Procurement */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <span>Compras, Suprimentos &amp; Procurement 360°</span>
              <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                SEFAZ NF-e 55 + Cotação 3 Vias + 3-Way Matching
              </span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Cotações Algorítmicas · Ordens de Compra Timbradas · Balança Toledo Prix 3 Fit · Homologação de Fornecedores
            </p>
          </div>
        </div>

        {/* Seletor de Sub-Abas de Compras */}
        <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs">
          {[
            { id: "cotacoes", label: "Cotações 3 Vias", icon: FileText },
            { id: "xml", label: "Importar XML NF-e", icon: Upload },
            { id: "ordens", label: "Ordens de Compra (OC)", icon: FileCheck },
            { id: "conferencia", label: "3-Way Matching (Toledo)", icon: Scale },
            { id: "fornecedores", label: "Fornecedores & SLA", icon: Building },
          ].map((item) => {
            const Icon = item.icon;
            const active = subAba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubAba(item.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-[var(--surface)] text-[var(--salmon)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. MAPA COMPARATIVO DE COTAÇÕES EM 3 VIAS COM SCORE ALGORÍTMICO */}
      {subAba === "cotacoes" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-[var(--ink)]">Processos de Cotação de Preços Ativos</h4>
              <p className="text-xs text-[var(--muted)]">Comparação algorítmica ponderada (Preço 60% + Prazo 25% + Frete 15%) com indicação de melhor TCO</p>
            </div>
            <button
              onClick={() => toast.info("Abrir nova rodada de cotação para fornecedores de Tangará da Serra")}
              className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Plus className="w-4 h-4" />
              Nova Cotação de Insumos
            </button>
          </div>

          <div className="space-y-4">
            {cotacoesAtivas.map((cot) => (
              <div key={cot.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[var(--muted)]">{cot.id}</span>
                    <h5 className="font-bold text-sm text-[var(--ink)]">{cot.item}</h5>
                    <span className="text-xs text-[var(--salmon)] font-medium">Quantidade Solicitada: {cot.qtd}</span>
                  </div>
                  <span className="text-xs text-[var(--muted)] flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" /> Prazo Limite: {cot.dataLimite}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {cot.opcoes.map((op, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        op.selecionado
                          ? "bg-emerald-500/5 border-emerald-500/50 shadow-xs"
                          : "bg-[var(--surface2)] border-[var(--line)]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[var(--ink)] truncate max-w-[180px]">{op.fornecedor}</span>
                          {op.selecionado && (
                            <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Score {op.score} (Melhor TCO)
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-black font-mono text-[var(--ink)] my-1">
                          {formatBrl(op.precoUnit)} <span className="text-[10px] font-normal text-[var(--muted)]">/un/kg</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-[var(--muted)]">
                          <div className="flex items-center justify-between">
                            <span>Prazo:</span>
                            <span className="font-medium text-[var(--ink)]">{op.prazoEntrega}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Condição de Frete:</span>
                            <span className="font-medium text-[var(--ink)]">{op.frete}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Algoritmo Score:</span>
                            <span className={`font-mono font-bold ${op.score >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                              {op.score}/100 pts
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--line)] mt-3">
                        {op.selecionado ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Vencedor Homologado</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => toast.success(`Fornecedor ${op.fornecedor} selecionado manualmente como opção de compra!`)}
                            className="text-[11px] text-[var(--muted)] hover:text-[var(--salmon)] font-bold transition-colors"
                          >
                            Selecionar Manualmente
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. IMPORTADOR DIRETO DE XML NF-e MODELO 55 */}
      {subAba === "xml" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              <span>Importador Direto de XML de NF-e de Compra (Modelo 55)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Leitura automática de itens, conversão de unidades (fardos/caixas para kg/unidade) e integração simultânea com Estoque e Contas a Pagar
            </p>
          </div>

          <form onSubmit={importarXmlNfe} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Chave de Acesso da NF-e (44 dígitos da SEFAZ):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={44}
                  value={chaveNfe}
                  onChange={(e) => setChaveNfe(e.target.value.replace(/\D/g, ""))}
                  placeholder="5126..."
                  className="flex-1 p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] font-mono text-xs text-[var(--ink)] tracking-wider"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Buscar &amp; Importar XML
                </button>
              </div>
              <span className="text-[10px] text-[var(--muted)] mt-1 block">
                Total de dígitos informados: {chaveNfe.length}/44
              </span>
            </div>
          </form>

          {/* Card com prévia da última NF-e importada */}
          <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[var(--muted)]">NF-e 000.041.289 Série 1 · SEFAZ-MT</span>
                <h5 className="font-bold text-sm text-[var(--ink)]">Pescados Pantanal Ltda · CNPJ 07.892.441/0001-92</h5>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Manifestada &amp; Conferida
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                    <th className="py-1.5 px-2">Cód / Item na NF</th>
                    <th className="py-1.5 px-2">NCM</th>
                    <th className="py-1.5 px-2">CFOP</th>
                    <th className="py-1.5 px-2">Qtd NF</th>
                    <th className="py-1.5 px-2">Conversão ERP</th>
                    <th className="py-1.5 px-2 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] font-mono">
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-[var(--ink)]">Salmão Fresco Inteiro Eviscerado</td>
                    <td className="py-2 px-2 text-[var(--muted)]">0302.14.00</td>
                    <td className="py-2 px-2 text-[var(--muted)]">1.102</td>
                    <td className="py-2 px-2">120 kg</td>
                    <td className="py-2 px-2 text-emerald-600 font-bold">120 kg (Câmara Fria 1)</td>
                    <td className="py-2 px-2 text-right font-bold text-[var(--ink)]">{formatBrl(8220.00)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-[var(--ink)]">Polvo Limpo Congelado Especial</td>
                    <td className="py-2 px-2 text-[var(--muted)]">0307.59.10</td>
                    <td className="py-2 px-2 text-[var(--muted)]">1.102</td>
                    <td className="py-2 px-2">15 kg</td>
                    <td className="py-2 px-2 text-emerald-600 font-bold">15 kg (Freezer Pescados)</td>
                    <td className="py-2 px-2 text-right font-bold text-[var(--ink)]">{formatBrl(1875.00)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--line)]">
              <span className="text-[var(--muted)]">Protocolo de Autorização SEFAZ: 351260098124812</span>
              <span className="font-mono font-black text-sm text-[var(--ink)]">Total NF: {formatBrl(10095.00)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDENS DE COMPRA (OC) OFICIAIS TIMBRADAS */}
      {subAba === "ordens" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Ordens de Compra Oficiais (OC)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Documento formal timbrado com condições de entrega, termos sanitários ANVISA e liquidação financeira</p>
            </div>
            <button
              onClick={() => toast.info("Criar nova Ordem de Compra manual a partir de cotação aprovada")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Emitir Nova OC
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2 px-3">Número OC</th>
                  <th className="py-2 px-3">Fornecedor</th>
                  <th className="py-2 px-3">Itens / Descrição</th>
                  <th className="py-2 px-3">Previsão Entrega</th>
                  <th className="py-2 px-3">Condição</th>
                  <th className="py-2 px-3">Valor Total</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {ordensCompra.map((oc) => (
                  <tr key={oc.id} className="hover:bg-[var(--surface2)]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[var(--salmon)]">{oc.id}</td>
                    <td className="py-3 px-3 font-bold text-[var(--ink)]">{oc.fornecedor}</td>
                    <td className="py-3 px-3 text-[var(--muted)]">{oc.itens[0]?.desc}</td>
                    <td className="py-3 px-3 font-mono text-[var(--ink)]">{oc.entregaPrevista}</td>
                    <td className="py-3 px-3 text-[var(--muted)]">{oc.condicao}</td>
                    <td className="py-3 px-3 font-mono font-black text-[var(--ink)]">{formatBrl(oc.valorTotal)}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        {oc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setOcVisualizando(oc)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--surface2)] border border-[var(--line)] text-[var(--ink)] hover:text-[var(--salmon)] font-bold transition-all inline-flex items-center gap-1"
                          title="Visualizar Ordem de Compra Timbrada"
                        >
                          <Printer className="w-3 h-3" />
                          Timbrado
                        </button>
                        <button
                          onClick={() => enviarOcFornecedor(oc.id, oc.fornecedor)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--salmon)]/10 text-[var(--salmon)] hover:bg-[var(--salmon)] hover:text-white font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CONFERÊNCIA CEGA 3-WAY MATCHING COM BALANÇA TOLEDO PRIX 3 FIT */}
      {subAba === "conferencia" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-600" />
                <span>Conferência Cega 3-Way Matching (Balança Toledo Prix 3 Fit)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">
                Cruzamento automático: Ordem de Compra (OC) × Danfe NF-e SEFAZ × Pesagem Física com balança de precisão
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                balançaConectada ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
              }`}>
                <span className={`w-2 h-2 rounded-full ${balançaConectada ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {balançaConectada ? "Toledo Prix 3 Fit: Conectada COM3" : "Toledo: Aguardando Sincronização"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pilar 1: Ordem de Compra */}
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[var(--muted)]">1. Pedido Aprovado</span>
                <span className="text-[10px] bg-blue-500/15 text-blue-700 px-2 py-0.5 rounded font-bold">OC-1049</span>
              </div>
              <h5 className="font-bold text-sm text-[var(--ink)]">Salmão Fresco Chileno</h5>
              <div className="text-xs text-[var(--muted)] space-y-1">
                <div>Qtd Solicitada: <span className="font-bold text-[var(--ink)]">120.00 kg</span></div>
                <div>Preço Acordado: <span className="font-mono text-[var(--ink)]">R$ 68,50 /kg</span></div>
                <div>Fornecedor: <span className="font-bold text-[var(--ink)]">Pescados Pantanal</span></div>
              </div>
            </div>

            {/* Pilar 2: NF-e SEFAZ */}
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[var(--muted)]">2. Documento Fiscal</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded font-bold">NF-e 41289</span>
              </div>
              <h5 className="font-bold text-sm text-[var(--ink)]">Danfe SEFAZ-MT Mod. 55</h5>
              <div className="text-xs text-[var(--muted)] space-y-1">
                <div>Qtd Faturada: <span className="font-bold text-[var(--ink)]">120.00 kg</span></div>
                <div>Preço Unitário: <span className="font-mono text-[var(--ink)]">R$ 68,50 /kg</span></div>
                <div>Total da Nota: <span className="font-mono font-bold text-[var(--ink)]">R$ 8.220,00</span></div>
              </div>
            </div>

            {/* Pilar 3: Pesagem Física Toledo */}
            <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[var(--muted)]">3. Balança Toledo Prix 3 Fit</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  pesoBalança ? "bg-emerald-500/15 text-emerald-700" : "bg-neutral-500/15 text-neutral-600"
                }`}>
                  {pesoBalança ? "Pesado" : "Não Lido"}
                </span>
              </div>
              <h5 className="font-bold text-sm text-[var(--ink)]">Câmara Fria Recepção</h5>
              <div className="text-xs text-[var(--muted)] space-y-1">
                <div>Peso Líquido Lido: <span className="font-bold text-cyan-600">{pesoBalança ? `${pesoBalança} kg` : "--"}</span></div>
                <div>Divergência: <span className="font-mono font-bold text-emerald-600">{pesoBalança ? "-0.15 kg (-0.12%)" : "--"}</span></div>
                <div>Margem Tolerada ANVISA: <span className="font-bold text-[var(--ink)]">± 2.0%</span></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-600" />
              <div>
                <h6 className="font-bold text-xs text-[var(--ink)]">Status da Homologação 3-Way Matching</h6>
                <p className="text-[11px] text-[var(--muted)]">
                  {conferenciaConcluida
                    ? "Lote 100% conferido e aprovado! Entrada liberada para a Câmara Fria 1 com etiqueta de rastreabilidade ANVISA."
                    : "Conecte a Balança Toledo Prix 3 Fit via RS-232/USB para aferir o lote de salmão chileno."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!balançaConectada && (
                <button
                  onClick={conectarBalançaToledo}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Scale className="w-4 h-4" />
                  Capturar Balança Toledo
                </button>
              )}
              {balançaConectada && !conferenciaConcluida && (
                <button
                  onClick={aprovarConferenciaCega}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprovar Recebimento &amp; Dar Entrada
                </button>
              )}
              {conferenciaConcluida && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Recebimento Concluído
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FORNECEDORES & HOMOLOGAÇÃO */}
      {subAba === "fornecedores" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <span>Cadastro &amp; Homologação de Fornecedores</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Índice de pontualidade SLA, certidões fiscais e dados bancários para liquidação financeira</p>
            </div>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar fornecedor por nome..."
                value={filtroFornecedor}
                onChange={(e) => setFiltroFornecedor(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--surface2)] text-[var(--ink)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fornecedores
              .filter((f) => f.nome.toLowerCase().includes(filtroFornecedor.toLowerCase()))
              .map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--muted)]">{f.id} · {f.cidade}</span>
                      <h5 className="font-bold text-sm text-[var(--ink)]">{f.nome}</h5>
                      <span className="text-xs text-[var(--salmon)] font-medium">{f.categoria}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      {f.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--line)]">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">CNPJ:</span>
                      <span className="font-mono text-[var(--ink)]">{f.cnpj}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">SLA Pontualidade:</span>
                      <span className="font-mono font-bold text-emerald-600">{f.slaPontualidade}% de entregas no prazo</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Contato Comercial:</span>
                      <span className="text-[var(--ink)]">{f.contato}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block">Chave Pix:</span>
                      <span className="font-mono text-[var(--ink)] truncate block">{f.chavePix}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL DE ORDEM DE COMPRA (OC) EM PAPEL TIMBRADO OFICIAL */}
      {ocVisualizando && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Topo do Modal com Fechar */}
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[var(--salmon)]" />
                <span className="font-mono text-xs font-bold text-[var(--muted)]">DOCUMENTO CORPORATIVO HOMOLOGADO</span>
              </div>
              <button
                onClick={() => setOcVisualizando(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout do Papel Timbrado Zuma / Kytto Holding */}
            <div className="border border-[var(--line)] rounded-2xl p-6 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 space-y-5">
              {/* Cabeçalho da Empresa */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <div className="text-xl font-black tracking-tight text-[var(--salmon)]">ZUMA GASTRONOMIA</div>
                  <div className="text-[11px] text-neutral-500 font-medium">KYTTO HOLDING &amp; PARTICIPAÇÕES S.A.</div>
                  <div className="text-[10px] font-mono text-neutral-400">CNPJ: 36.296.848/0001-57 · I.E: 13.982.110-4</div>
                  <div className="text-[10px] text-neutral-400">Av. Brasil, Centro · Tangará da Serra - MT · CEP 78300-000</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-neutral-500">ORDEM DE COMPRA (OC)</div>
                  <div className="text-xl font-black font-mono text-neutral-900 dark:text-neutral-100">{ocVisualizando.id}</div>
                  <div className="text-[10px] font-mono text-neutral-500">Emissão: {ocVisualizando.emissao}</div>
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    {ocVisualizando.status}
                  </div>
                </div>
              </div>

              {/* Dados do Fornecedor Destinatário */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Fornecedor Contratado:</div>
                <div className="font-bold text-sm">{ocVisualizando.fornecedor}</div>
                <div className="text-neutral-500 font-mono text-[11px]">CNPJ: {ocVisualizando.cnpjFornecedor}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div><span className="text-neutral-500">Previsão de Entrega:</span> <strong className="font-mono">{ocVisualizando.entregaPrevista}</strong></div>
                  <div><span className="text-neutral-500">Condição de Liquidação:</span> <strong className="font-mono">{ocVisualizando.condicao}</strong></div>
                  <div><span className="text-neutral-500">Frete &amp; Logística:</span> <strong>{ocVisualizando.frete}</strong></div>
                  <div><span className="text-neutral-500">Local de Entrega:</span> <strong>Câmara Fria Zuma (Recepção)</strong></div>
                </div>
              </div>

              {/* Tabela de Itens Comprados */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Itens do Pedido:</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[10px] font-mono">
                      <th className="py-1 text-left">Item / Especificação</th>
                      <th className="py-1 text-left">NCM</th>
                      <th className="py-1 text-right">Qtd</th>
                      <th className="py-1 text-right">Preço Unit.</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:border-neutral-800">
                    {ocVisualizando.itens.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-left font-medium">{it.desc}</td>
                        <td className="py-2 text-left font-mono text-neutral-500">{it.ncm}</td>
                        <td className="py-2 text-right font-mono">{it.qtd}</td>
                        <td className="py-2 text-right font-mono">{formatBrl(it.vlrUnit)}</td>
                        <td className="py-2 text-right font-mono font-bold">{formatBrl(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totalizador */}
              <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="text-right">
                  <span className="text-xs text-neutral-500 block">Valor Total Líquido da OC:</span>
                  <span className="text-xl font-black font-mono text-[var(--salmon)]">{formatBrl(ocVisualizando.valorTotal)}</span>
                </div>
              </div>

              {/* Cláusulas Sanitárias ANVISA e Assinaturas */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-[10px] text-neutral-500 leading-relaxed border border-neutral-200 dark:border-neutral-800">
                <strong className="text-neutral-700 dark:text-neutral-300">Normas Sanitárias &amp; Conformidade RDC 216 ANVISA:</strong> O fornecedor obriga-se a entregar os pescados frescos na faixa térmica entre -2°C e +2°C com gelo escama potável, acompanhado de laudo de inspeção sanitária federal (SIF/SIM) e conferência cega via balança de precisão no ato do descarregamento.
              </div>

              {/* Campo de Assinaturas */}
              <div className="grid grid-cols-2 gap-6 pt-4 text-center">
                <div className="border-t border-neutral-300 dark:border-neutral-700 pt-2 text-[10px] text-neutral-500">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200">Gerência de Suprimentos Zuma</div>
                  <div>Homologado via Hash SHA-256 #8129a</div>
                </div>
                <div className="border-t border-neutral-300 dark:border-neutral-700 pt-2 text-[10px] text-neutral-500">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200">{ocVisualizando.fornecedor}</div>
                  <div>Aceite Comercial Vinculado</div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:text-[var(--salmon)] flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir Documento
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success(`Ordem de Compra ${ocVisualizando.id} exportada em PDF oficial de alta resolução.`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[var(--salmon)] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF da OC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
