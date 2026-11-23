import React, { useState, useMemo } from "react";
import { 
  Scale, 
  ShoppingCart, 
  Barcode, 
  Package, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  Truck, 
  Store, 
  Search, 
  Plus, 
  Trash2, 
  AlertCircle,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "@shared/zumaData";

const PRODUTOS_PESAVEIS = [
  { plu: "1001", nome: "Picanha Bovina Resfriada Fatiada", depto: "Açougue", precoKg: 79.90, taraPadrao: 0.015 },
  { plu: "1002", nome: "Salmão Fresco Chileno Inteiro", depto: "Peixaria", precoKg: 89.90, taraPadrao: 0.020 },
  { plu: "2001", nome: "Banana Prata Nacional", depto: "Hortifrúti (FLV)", precoKg: 6.99, taraPadrao: 0.005 },
  { plu: "2002", nome: "Maçã Gala Selecionada", depto: "Hortifrúti (FLV)", precoKg: 9.49, taraPadrao: 0.005 },
  { plu: "2003", nome: "Tomate Italiano Especial", depto: "Hortifrúti (FLV)", precoKg: 7.90, taraPadrao: 0.005 },
  { plu: "3001", nome: "Pão Francês Tradicional", depto: "Padaria", precoKg: 18.50, taraPadrao: 0.010 },
  { plu: "4001", nome: "Queijo Mussarela Fatiado", depto: "Frios / Laticínios", precoKg: 46.90, taraPadrao: 0.012 },
  { plu: "5001", nome: "Gengibre em Conserva (Gari)", depto: "Mercearia Oriental", precoKg: 34.00, taraPadrao: 0.010 }
];

export const ErpVarejoSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"balanca" | "selfcheckout" | "wms" | "kiosk">("balanca");

  // Estado da Balança FLV
  const [pluSelecionado, setPluSelecionado] = useState("1002");
  const [pesoBruto, setPesoBruto] = useState(1.485);
  const [tara, setTara] = useState(0.020);
  const [copiado, setCopiado] = useState(false);

  const produtoAtual = useMemo(() => {
    return PRODUTOS_PESAVEIS.find(p => p.plu === pluSelecionado) || PRODUTOS_PESAVEIS[0];
  }, [pluSelecionado]);

  const pesoLiquido = Math.max(0, Number((pesoBruto - tara).toFixed(3)));
  const valorTotalItem = Number((pesoLiquido * produtoAtual.precoKg).toFixed(2));

  // Código EAN-13 gerado (Prefixo 2 + PLU + Peso em gramas + DV)
  const barcodeEan13 = useMemo(() => {
    const prefixo = "2";
    const pluFormatado = String(produtoAtual.plu).padStart(4, "0");
    const gramasFormatadas = String(Math.round(pesoLiquido * 1000)).padStart(6, "0");
    const corpo11 = `${prefixo}${pluFormatado}${gramasFormatadas}`;
    
    // Cálculo do dígito verificador EAN-13
    let soma = 0;
    for (let i = 0; i < 11; i++) {
      const dig = parseInt(corpo11[i], 10);
      soma += (i % 2 === 0) ? dig : dig * 3;
    }
    const resto = soma % 10;
    const dv = resto === 0 ? 0 : 10 - resto;
    return `${corpo11}${dv}`;
  }, [produtoAtual.plu, pesoLiquido]);

  // Self-Checkout
  const [carrinhoTotem, setCarrinhoTotem] = useState([
    { id: "1", codigo: barcodeEan13, nome: `${produtoAtual.nome} (${pesoLiquido.toFixed(3)}kg)`, preco: valorTotalItem, qtd: 1 },
    { id: "2", codigo: "7891000100103", nome: "Arroz Grão Nobre Japonês 1kg", preco: 24.90, qtd: 2 },
    { id: "3", codigo: "7891000200204", nome: "Vinagre de Arroz Tozan 750ml", preco: 18.50, qtd: 1 },
  ]);

  const totalTotem = carrinhoTotem.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(barcodeEan13);
    setCopiado(true);
    toast.success(`Código EAN-13 ${barcodeEan13} copiado!`);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleEnviarAoPdv = () => {
    toast.success(`Item ${produtoAtual.nome} (${pesoLiquido.toFixed(3)} kg = ${formatBrl(valorTotalItem)}) transmitido para o PDV Caixa via protocolo Toledo P03!`);
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Sub-abas Varejo */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface2)] border border-[var(--line)] overflow-x-auto">
        <button
          onClick={() => setSubAba("balanca")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subAba === "balanca" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-amber-500" />
          <span>Balança &amp; Pesagem FLV (Toledo/Filizola)</span>
        </button>
        <button
          onClick={() => setSubAba("selfcheckout")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subAba === "selfcheckout" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
          <span>Self-Checkout &amp; Totem Varejo</span>
        </button>
        <button
          onClick={() => setSubAba("wms")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subAba === "wms" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Package className="w-3.5 h-3.5 text-blue-500" />
          <span>WMS Endereçamento &amp; Docas</span>
        </button>
        <button
          onClick={() => setSubAba("kiosk")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subAba === "kiosk" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Barcode className="w-3.5 h-3.5 text-purple-500" />
          <span>Kiosk Consulta Preço</span>
        </button>
      </div>

      {/* ABA 1: BALANÇA E PESAGEM FLV */}
      {subAba === "balanca" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  Integração Hardware • Toledo Prix 3 / Filizola Platina
                </span>
                <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
                  Simulador de Balança de Checkout e Etiquetagem FLV
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Geração automática de código de barras EAN-13 com peso embutido e comunicação serial RS-232 / TCP-IP.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Porta COM3 (9600 bps) Ativa
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Seleção do Item Pesável */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--ink)] block">
                  Selecione o Produto Pesável (PLU):
                </label>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {PRODUTOS_PESAVEIS.map((p) => (
                    <button
                      key={p.plu}
                      onClick={() => {
                        setPluSelecionado(p.plu);
                        setTara(p.taraPadrao);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                        pluSelecionado === p.plu
                          ? "bg-[var(--salmon)] text-white border-[var(--salmon)] font-bold shadow-xs"
                          : "bg-[var(--surface2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--salmon)]"
                      }`}
                    >
                      <div>
                        <span className="font-mono text-[10px] opacity-80 block">PLU: {p.plu} • {p.depto}</span>
                        <span className="font-bold">{p.nome}</span>
                      </div>
                      <span className="font-mono-nums font-black shrink-0">
                        {formatBrl(p.precoKg)}/kg
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visor Digital da Balança */}
              <div className="p-4 rounded-2xl bg-black text-emerald-400 font-mono flex flex-col justify-between shadow-inner border border-emerald-950">
                <div className="flex items-center justify-between text-xs opacity-75 border-b border-emerald-900 pb-2">
                  <span>TOLEDO PRIX 3 FIT</span>
                  <span className="text-[10px] text-emerald-500 font-bold">ESTÁVEL [S]</span>
                </div>

                <div className="my-4 text-center space-y-2">
                  <span className="text-[10px] text-emerald-600 uppercase tracking-widest block">PESO LÍQUIDO (KG)</span>
                  <div className="text-4xl sm:text-5xl font-black tracking-wider text-emerald-300">
                    {pesoLiquido.toFixed(3)} <span className="text-xl">kg</span>
                  </div>
                  <div className="text-xs text-emerald-500/80">
                    Tara: {tara.toFixed(3)} kg • Bruto: {pesoBruto.toFixed(3)} kg
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-900 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-emerald-600 block">PREÇO / KG:</span>
                    <span className="text-sm font-bold text-emerald-400">{formatBrl(produtoAtual.precoKg)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-emerald-600 block">TOTAL A PAGAR:</span>
                    <span className="text-lg font-black text-emerald-200">{formatBrl(valorTotalItem)}</span>
                  </div>
                </div>
              </div>

              {/* Controles de Peso e Código EAN-13 */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[var(--ink)] mb-1">
                      <span>Simular Peso do Prato / Bandeja:</span>
                      <span className="font-mono-nums text-[var(--salmon)]">{pesoBruto.toFixed(3)} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.100"
                      max="5.000"
                      step="0.050"
                      value={pesoBruto}
                      onChange={(e) => setPesoBruto(parseFloat(e.target.value))}
                      className="w-full accent-[var(--salmon)] cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)] font-bold">Código EAN-13 Gerado:</span>
                      <button
                        onClick={handleCopiarCodigo}
                        className="text-[10px] text-[var(--salmon)] font-bold flex items-center gap-1 hover:underline"
                      >
                        <Copy className="w-3 h-3" /> {copiado ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <div className="font-mono text-sm sm:text-base font-black text-[var(--ink)] tracking-wider">
                      {barcodeEan13}
                    </div>
                    <span className="text-[9px] text-[var(--muted)] block">
                      Formato GS1 Brasil: Prefixo 2 + PLU {produtoAtual.plu} + {Math.round(pesoLiquido * 1000)}g
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleEnviarAoPdv}
                    className="py-2.5 px-4 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 shadow-sm transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" /> Enviar Direto ao PDV Caixa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: SELF-CHECKOUT TOTEM */}
      {subAba === "selfcheckout" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Totem de Autoatendimento Varejo
                </span>
                <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
                  Terminal de Self-Checkout com Leitor Laser e Balança de Conferência
                </h3>
              </div>
              <span className="text-xs font-mono-nums font-bold text-[var(--muted)]">
                Terminal #01 • Tangará da Serra
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <span className="text-xs font-bold text-[var(--ink)] block">Itens Bipados no Carrinho:</span>
                <div className="space-y-2">
                  {carrinhoTotem.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[var(--ink)] block">{item.nome}</span>
                        <span className="font-mono text-[10px] text-[var(--muted)] block">EAN: {item.codigo}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono-nums font-black text-[var(--ink)] text-sm block">
                          {formatBrl(item.preco * item.qtd)}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] font-mono-nums">
                          {item.qtd}x de {formatBrl(item.preco)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Painel de Pagamento Self-Checkout */}
              <div className="p-4 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Subtotal:</span>
                  <div className="text-3xl font-black font-mono-nums text-[var(--ink)]">
                    {formatBrl(totalTotem)}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Balança de conferência: Peso verificado com precisão de ±5g.
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => toast.success("Pagamento com Pix instantâneo gerado no totem!")}
                    className="w-full py-2.5 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 active:scale-98 transition-all cursor-pointer"
                  >
                    Pagar com Pix Instantâneo
                  </button>
                  <button
                    onClick={() => toast.success("Aproxime o cartão na maquininha integrada!")}
                    className="w-full py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] hover:border-[var(--salmon)] transition-all cursor-pointer"
                  >
                    Cartão de Débito / Crédito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: WMS & DOCAS */}
      {subAba === "wms" && (
        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md">
                WMS Logística Interna
              </span>
              <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
                Endereçamento de Depósito &amp; Docas de Recebimento
              </h3>
            </div>
            <button
              onClick={() => toast.success("Inventário rotativo cíclico iniciado com leitor RFID!")}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface2)] border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:border-[var(--salmon)] transition-all"
            >
              Auditoria de Posições
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[var(--muted)] font-bold text-[10px] uppercase">Doca #01 (Refrigerados)</span>
              <span className="font-extrabold text-[var(--ink)] block text-sm">Câmara de Pescados &amp; Salmão</span>
              <p className="text-[11px] text-[var(--muted)]">Capacidade 85% ocupada • Temperatura -2.4°C</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[var(--muted)] font-bold text-[10px] uppercase">Doca #02 (Secos &amp; Mercearia)</span>
              <span className="font-extrabold text-[var(--ink)] block text-sm">Rua A - Gôndolas A1 a A8</span>
              <p className="text-[11px] text-[var(--muted)]">Arroz, shoyu, algas nori, farinha panko</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-1">
              <span className="text-[var(--muted)] font-bold text-[10px] uppercase">Doca #03 (Bebidas &amp; Bar)</span>
              <span className="font-extrabold text-[var(--ink)] block text-sm">Câmara de Barris &amp; Chopp</span>
              <p className="text-[11px] text-[var(--muted)]">12 barris de Chopp Artesanal 50L conectados</p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: KIOSK BUSCA PREÇO */}
      {subAba === "kiosk" && (
        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs animate-in fade-in">
          <div className="border-b border-[var(--line)] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md">
              Terminal de Consulta Pública
            </span>
            <h3 className="text-base sm:text-lg font-black text-[var(--ink)] mt-1">
              Kiosk Busca-Preço Microterminal (Conforme Código de Defesa do Consumidor)
            </h3>
          </div>

          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[var(--surface2)] border border-[var(--line)] text-center space-y-4">
            <Barcode className="w-16 h-16 text-[var(--salmon)] mx-auto animate-pulse" />
            <div className="space-y-1">
              <span className="text-sm font-black text-[var(--ink)] block">Aponte o Código de Barras</span>
              <p className="text-xs text-[var(--muted)]">Posicione o código de barras ou EAN-13 em frente ao leitor infravermelho.</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-left space-y-1">
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold">Último Item Lido:</span>
              <div className="flex items-center justify-between">
                <b className="text-[var(--ink)]">Salmão Fresco Chileno (Fatia Nobre)</b>
                <span className="font-mono-nums font-black text-emerald-600 text-sm">R$ 89,90/kg</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
