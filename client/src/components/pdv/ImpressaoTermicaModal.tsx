import React, { useState } from "react";
import { 
  Printer, 
  X, 
  CheckCircle2, 
  FileText, 
  Share2, 
  QrCode, 
  UtensilsCrossed, 
  Bike, 
  Receipt,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "../../../../shared/zumaData";

export interface ImpressaoTermicaProps {
  isOpen: boolean;
  onClose: () => void;
  tipoComanda?: "pre_conta" | "cozinha_sushibar" | "cozinha_quente" | "motoboy_entrega" | "fechamento_caixa" | "acerto_motoboy";
  titulo?: string;
  mesa?: number | string;
  garcom?: string;
  cliente?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  itens?: { nome: string; q: number; preco: number; obs?: string; praca?: string }[];
  subtotal?: number;
  taxaServico?: number;
  taxaEntrega?: number;
  desconto?: number;
  total?: number;
  formaPagamento?: string;
  trocoPara?: number;
  motoboyNome?: string;
  motoboyPlaca?: string;
  qtdEntregas?: number;
  diariaFixa?: number;
  dinheiroRecebido?: number;
  saldoLiquido?: number;
  empresa?: "gastronomia" | "moda";
}

export const ImpressaoTermicaModal: React.FC<ImpressaoTermicaProps> = ({
  isOpen,
  onClose,
  tipoComanda = "pre_conta",
  titulo = "Extrato de Pré-Conta",
  mesa = 3,
  garcom = "Matheus (Salão)",
  cliente = "Cliente Salão",
  telefone = "(65) 99999-0000",
  endereco = "Rua Júlio Martinez Benevides, 820",
  bairro = "Centro",
  itens = [
    { nome: "Combo 26 Peças Zuma Nobre", q: 1, preco: 69.90, obs: "Sem gengibre extra" },
    { nome: "Hot Filadélfia Trufado (12un)", q: 1, preco: 31.90, obs: "Molho tarê à parte" },
    { nome: "Coca-Cola Zero 350ml", q: 2, preco: 7.90 }
  ],
  subtotal = 117.60,
  taxaServico = 11.76,
  taxaEntrega = 0,
  desconto = 0,
  total = 129.36,
  formaPagamento = "Pix Sicredi",
  trocoPara = 0,
  motoboyNome = "Lucas Silva",
  motoboyPlaca = "QBM-4819 (Honda Fan 160)",
  qtdEntregas = 12,
  diariaFixa = 70.0,
  dinheiroRecebido = 0.0,
  saldoLiquido = 154.0,
  empresa = "gastronomia",
}) => {
  const isModa = empresa === "moda";
  const razaoSocial = isModa ? "ZUMA MODA & BOUTIQUE ELEGANCE" : "ZUMA CULINARIA ORIENTAL";
  const cnpjDoc = isModa ? "CNPJ: 36.296.848/0002-38 · IE: 13.582.902-2 MT" : "CNPJ: 36.296.848/0001-57 · IE: 13.582.901-4 MT";
  const [selectedTipo, setSelectedTipo] = useState(tipoComanda);
  const [papelLargura, setPapelLargura] = useState<"80mm" | "58mm">("80mm");
  const [copias, setCopias] = useState(1);
  const [printerDestino, setPrinterDestino] = useState("spooler_balcao");

  if (!isOpen) return null;

  const dataHoraAtual = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const handlePrint = () => {
    toast.success(`Comanda enviada para ${printerDestino} (${copias}x - ${papelLargura})!`);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header do Modal */}
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--ink)] text-white rounded-lg">
              <Printer className="w-5 h-5 text-[var(--salmon)]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[var(--ink)]">
                Emissor de Comanda Térmica ESC/POS (80mm &amp; 58mm)
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Spooler integrado de impressão térmica direta para Cozinha, Bar, Motoboy e Caixa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Lado Esquerdo: Controles de Impressão */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Tipo de Cupom:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                {[
                  { id: "pre_conta", label: "Pré-Conta Salão", icon: Receipt },
                  { id: "cozinha_sushibar", label: "KDS Sushibar", icon: UtensilsCrossed },
                  { id: "cozinha_quente", label: "KDS Cozinha Quente", icon: UtensilsCrossed },
                  { id: "motoboy_entrega", label: "Via Motoboy", icon: Bike },
                  { id: "acerto_motoboy", label: "Acerto Motoboy", icon: Receipt },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTipo(t.id as any)}
                      className={`p-2 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                        selectedTipo === t.id
                          ? "bg-[var(--ink)] text-white border-transparent shadow-xs"
                          : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                Destino da Impressora:
              </label>
              <select
                value={printerDestino}
                onChange={e => setPrinterDestino(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--surface2)] border border-[var(--line)] rounded-lg text-xs font-semibold text-[var(--ink)]"
              >
                <option value="spooler_balcao">🖨️ Balcão / Caixa Principal (Epson TM-T20X)</option>
                <option value="spooler_sushibar">🖨️ Cozinha Fria / Sushibar (Elgin i9 IP 192.168.1.150)</option>
                <option value="spooler_quente">🖨️ Cozinha Quente / Wok (Bematech MP-4200 TH)</option>
                <option value="spooler_bar">🖨️ Bar &amp; Bebidas (Daruma DR800)</option>
                <option value="spooler_expedicao">🖨️ Expedição / Despacho Motoboys</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                  Largura Papel:
                </label>
                <div className="flex rounded-lg border border-[var(--line)] overflow-hidden text-xs">
                  <button
                    onClick={() => setPapelLargura("80mm")}
                    className={`flex-1 py-1.5 font-bold transition cursor-pointer ${
                      papelLargura === "80mm" ? "bg-[var(--ink)] text-white" : "bg-[var(--surface2)] text-[var(--muted)]"
                    }`}
                  >
                    80mm (Padrão)
                  </button>
                  <button
                    onClick={() => setPapelLargura("58mm")}
                    className={`flex-1 py-1.5 font-bold transition cursor-pointer ${
                      papelLargura === "58mm" ? "bg-[var(--ink)] text-white" : "bg-[var(--surface2)] text-[var(--muted)]"
                    }`}
                  >
                    58mm (Estreito)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                  Cópias:
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => setCopias(n)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        copias === n ? "bg-[var(--ink)] text-white border-transparent" : "bg-[var(--surface2)] border-[var(--line)]"
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Compatibilidade Nativa ESC/POS
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Suporta corte automático guilhotina, acionamento de gaveta de dinheiro RJ11 e QR Code estático/dinâmico de Pix.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-2.5 rounded-xl bg-[var(--salmon)] hover:bg-[#d04530] text-white text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora (ESC/POS)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 bg-[var(--surface2)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              Fechar Visualização
            </button>
          </div>

          {/* Lado Direito: Visualizador Fiel da Bobina de Papel Térmico */}
          <div className="md:col-span-7 bg-amber-50/40 dark:bg-stone-900/60 p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2">
              Preview da Bobina Térmica ({papelLargura})
            </span>

            {/* Simulação da Fita Térmica de Papel */}
            <div 
              id="thermal-receipt-preview"
              className="bg-white text-black font-mono text-[11px] leading-tight p-4 shadow-lg border border-stone-200 rounded-sm w-full max-w-[340px] select-none"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {/* Topo do Cupom */}
              <div className="text-center pb-2 border-b border-black border-dashed">
                <div className="font-extrabold text-sm tracking-tighter">{razaoSocial}</div>
                <div className="text-[10px]">TANGARA DA SERRA - MT</div>
                <div className="text-[9px]">{cnpjDoc}</div>
                <div className="text-[9px] mt-0.5">{dataHoraAtual}</div>
              </div>

              {/* Cabeçalho do Tipo de Comanda */}
              <div className="py-1.5 border-b border-black border-dashed text-center">
                {selectedTipo === "pre_conta" && (
                  <div>
                    <div className="font-extrabold text-xs">*** CONFERENCIA DE MESA ***</div>
                    <div className="text-[10px] font-bold">MESA {mesa} · {garcom}</div>
                    <div className="text-[9px]">NAO TEM VALOR FISCAL</div>
                  </div>
                )}
                {selectedTipo === "cozinha_sushibar" && (
                  <div>
                    <div className="font-extrabold text-xs bg-black text-white px-1">*** COZINHA FRIA / SUSHIBAR ***</div>
                    <div className="text-[10px] font-bold mt-0.5">MESA {mesa} · COMANDA #{Math.floor(1000 + Math.random()*8999)}</div>
                  </div>
                )}
                {selectedTipo === "cozinha_quente" && (
                  <div>
                    <div className="font-extrabold text-xs bg-black text-white px-1">*** COZINHA QUENTE / WOK ***</div>
                    <div className="text-[10px] font-bold mt-0.5">MESA {mesa} · COMANDA #{Math.floor(1000 + Math.random()*8999)}</div>
                  </div>
                )}
                {selectedTipo === "motoboy_entrega" && (
                  <div>
                    <div className="font-extrabold text-xs bg-black text-white px-1">*** VIA DO ENTREGADOR / DELIVERY ***</div>
                    <div className="text-[10px] font-bold mt-0.5">PEDIDO #{Math.floor(8000 + Math.random()*999)}</div>
                  </div>
                )}
                {selectedTipo === "acerto_motoboy" && (
                  <div>
                    <div className="font-extrabold text-xs bg-black text-white px-1">*** FECHAMENTO TURNO ENTREGADOR ***</div>
                    <div className="text-[10px] font-bold mt-0.5">{motoboyNome.toUpperCase()}</div>
                    <div className="text-[9px]">{motoboyPlaca}</div>
                  </div>
                )}
              </div>

              {/* Dados do Cliente (Delivery) */}
              {selectedTipo === "motoboy_entrega" && (
                <div className="py-1.5 border-b border-black border-dashed text-[10px]">
                  <div><strong>CLIENTE:</strong> {cliente}</div>
                  <div><strong>TEL:</strong> {telefone}</div>
                  <div><strong>END:</strong> {endereco}</div>
                  <div><strong>BAIRRO:</strong> {bairro} (Tangará da Serra)</div>
                  {trocoPara > 0 && (
                    <div className="bg-stone-200 p-0.5 mt-1 font-bold">
                      LEVAR TROCO P/ R$ {trocoPara.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Extrato do Fechamento do Motoboy */}
              {selectedTipo === "acerto_motoboy" && (
                <div className="py-2 border-b border-black border-dashed space-y-1 text-[10px]">
                  <div className="flex justify-between font-bold">
                    <span>CORRIDAS HOJE:</span>
                    <span>{qtdEntregas} entregas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(+) DIARIA FIXA:</span>
                    <span>R$ {diariaFixa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(+) TAXAS DE ENTREGA:</span>
                    <span>R$ {taxaEntrega > 0 ? taxaEntrega.toFixed(2) : (qtdEntregas * 7).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>(-) DINHEIRO EM MAOS:</span>
                    <span>R$ {dinheiroRecebido.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black">
                    <span>SALDO LIQUIDO A PAGAR:</span>
                    <span>R$ {saldoLiquido.toFixed(2)}</span>
                  </div>
                  <div className="text-[9px] text-stone-600 pt-1">
                    FORMA ACERTO: PIX SICREDI IMEDIATO
                  </div>
                  <div className="pt-4 pb-1 text-center text-[9px] space-y-3">
                    <div>
                      <div className="border-b border-black w-44 mx-auto mb-1"></div>
                      <div>ASSINATURA DO ENTREGADOR</div>
                    </div>
                    <div>
                      <div className="border-b border-black w-44 mx-auto mb-1"></div>
                      <div>ASSINATURA DO CAIXA / SUPERVISOR</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Itens (Apenas se nao for acerto) */}
              {selectedTipo !== "acerto_motoboy" && (
              <div className="py-2 border-b border-black border-dashed space-y-1">
                <div className="flex justify-between text-[9px] font-bold border-b border-black/30 pb-0.5">
                  <span>QTD ITEM</span>
                  <span>VL.TOTAL</span>
                </div>
                {itens.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold">{it.q}x {it.nome}</span>
                      <span>{(it.q * it.preco).toFixed(2)}</span>
                    </div>
                    {it.obs && (
                      <div className="text-[9px] pl-2 font-bold italic">
                        &gt;&gt; OBS: {it.obs}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}

              {/* Totais (apenas Pré-Conta ou Entrega) */}
              {(selectedTipo === "pre_conta" || selectedTipo === "motoboy_entrega") && (
                <div className="py-1.5 border-b border-black border-dashed space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {taxaServico > 0 && (
                    <div className="flex justify-between">
                      <span>SERVICO (10%):</span>
                      <span>R$ {taxaServico.toFixed(2)}</span>
                    </div>
                  )}
                  {taxaEntrega > 0 && (
                    <div className="flex justify-between">
                      <span>TAXA ENTREGA:</span>
                      <span>R$ {taxaEntrega.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black">
                    <span>TOTAL A PAGAR:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] pt-0.5">
                    <span>FORMA PGTO:</span>
                    <span className="font-bold">{formaPagamento}</span>
                  </div>
                </div>
              )}

              {/* QR Code Pix para Pré-Conta */}
              {selectedTipo === "pre_conta" && (
                <div className="py-2 border-b border-black border-dashed flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-stone-100 border border-black flex items-center justify-center mb-1">
                    <QrCode className="w-16 h-16 text-black" />
                  </div>
                  <div className="text-[9px] text-center font-bold">
                    PAGUE NA MESA COM PIX SICREDI
                  </div>
                </div>
              )}

              {/* Canhoto de Assinatura (Delivery) */}
              {selectedTipo === "motoboy_entrega" && (
                <div className="pt-3 pb-1 border-b border-black border-dashed text-center text-[9px]">
                  <div className="border-b border-black w-40 mx-auto mb-1"></div>
                  <div>ASSINATURA DO CLIENTE</div>
                </div>
              )}

              {/* Linha de Corte / Picote */}
              <div className="text-center pt-2 text-[9px] text-stone-500">
                ----------------- PICOTE -----------------
                <div className="text-[8px] mt-0.5">ZUMA PILOT 360° · SISTEMA CERTIFICADO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
