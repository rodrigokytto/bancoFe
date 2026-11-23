import React, { useState } from "react";
import { 
  Split, 
  Users, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Percent, 
  Receipt, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "../../../../shared/zumaData";
import { MesaOperacional } from "../../pages/MapaMesasSalao";

interface SplitBillModalProps {
  mesa: MesaOperacional;
  isOpen: boolean;
  onClose: () => void;
  onFinalizarConta: (totalPago: number) => void;
}

interface Pagante {
  id: string;
  nome: string;
  itensAtribuidos: number[]; // índices dos itens da comanda
  valorManual?: number;
  metodoPagamento: "PIX" | "CARTAO" | "DINHEIRO";
  valorPago: number;
  pago: boolean;
  dinheiroEntregue?: number;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  mesa,
  isOpen,
  onClose,
  onFinalizarConta
}) => {
  const [modoDivisao, setModoDivisao] = useState<"IGUALITARIA" | "POR_ITEM" | "LIVRE">("POR_ITEM");
  const [incluirTaxaServico, setIncluirTaxaServico] = useState(true);
  const [taxaPct, setTaxaPct] = useState(10);
  
  // Lista inicial de pagantes baseada no número de clientes da mesa
  const initialQtd = Math.max(2, mesa.clientesQtd || 2);
  const [pagantes, setPagantes] = useState<Pagante[]>(() => {
    return Array.from({ length: initialQtd }, (_, i) => ({
      id: `p-${i + 1}`,
      nome: i === 0 && mesa.clienteNome ? mesa.clienteNome : `Pessoa ${i + 1}`,
      itensAtribuidos: [],
      metodoPagamento: i === 0 ? "PIX" : "CARTAO",
      valorPago: 0,
      pago: false,
      dinheiroEntregue: 0
    }));
  });

  const [pixModalPagante, setPixModalPagante] = useState<Pagante | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const totalConsumo = mesa.consumoTotal;
  const taxaServicoValor = incluirTaxaServico ? (totalConsumo * (taxaPct / 100)) : 0;
  const totalGeralComTaxa = totalConsumo + taxaServicoValor;

  // Cálculo por Pagante
  const getSubtotalPagante = (pagante: Pagante): number => {
    if (modoDivisao === "IGUALITARIA") {
      return totalGeralComTaxa / pagantes.length;
    }
    if (modoDivisao === "LIVRE") {
      return pagante.valorManual || 0;
    }
    // MODO POR_ITEM
    const itensValor = pagante.itensAtribuidos.reduce((sum, idx) => {
      const it = mesa.itens[idx];
      return sum + (it ? it.qtd * it.valorUnit : 0);
    }, 0);

    // Itens que não foram atribuídos a ninguém são compartilhados igualmente
    const itensAtribuidosTodos = new Set(pagantes.flatMap(p => p.itensAtribuidos));
    const itensCompartilhadosValor = mesa.itens.reduce((sum, it, idx) => {
      if (!itensAtribuidosTodos.has(idx)) {
        return sum + it.qtd * it.valorUnit;
      }
      return sum;
    }, 0);

    const parcelaCompartilhada = pagantes.length > 0 ? itensCompartilhadosValor / pagantes.length : 0;
    const baseValor = itensValor + parcelaCompartilhada;
    const taxaProporcional = incluirTaxaServico ? baseValor * (taxaPct / 100) : 0;

    return baseValor + taxaProporcional;
  };

  const totalCalculadoPagantes = pagantes.reduce((sum, p) => sum + getSubtotalPagante(p), 0);
  const totalJaLiquidado = pagantes.filter(p => p.pago).reduce((sum, p) => sum + getSubtotalPagante(p), 0);
  const saldoRestante = Math.max(0, totalGeralComTaxa - totalJaLiquidado);
  const todosPagaram = pagantes.length > 0 && pagantes.every(p => p.pago);

  const handleAddPagante = () => {
    const nextIdx = pagantes.length + 1;
    setPagantes(prev => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        nome: `Pessoa ${nextIdx}`,
        itensAtribuidos: [],
        metodoPagamento: "CARTAO",
        valorPago: 0,
        pago: false
      }
    ]);
  };

  const handleRemovePagante = (id: string) => {
    if (pagantes.length <= 1) return;
    setPagantes(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleItemPagante = (paganteId: string, itemIdx: number) => {
    setPagantes(prev => prev.map(p => {
      if (p.id === paganteId) {
        const has = p.itensAtribuidos.includes(itemIdx);
        return {
          ...p,
          itensAtribuidos: has 
            ? p.itensAtribuidos.filter(i => i !== itemIdx)
            : [...p.itensAtribuidos, itemIdx]
        };
      } else {
        return {
          ...p,
          itensAtribuidos: p.itensAtribuidos.filter(i => i !== itemIdx)
        };
      }
    }));
  };

  const handlePagarPagante = (pagante: Pagante) => {
    const subtotal = getSubtotalPagante(pagante);
    if (pagante.metodoPagamento === "PIX") {
      setPixModalPagante(pagante);
      return;
    }

    setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, pago: true, valorPago: subtotal } : p));
    toast.success(`Pagamento de ${pagante.nome} (${formatBrl(subtotal)}) registrado via ${pagante.metodoPagamento}!`);
  };

  const handleConfirmarPix = (pagante: Pagante) => {
    const subtotal = getSubtotalPagante(pagante);
    setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, pago: true, valorPago: subtotal } : p));
    setPixModalPagante(null);
    toast.success(`PIX de ${pagante.nome} confirmado via Sicredi MT com sucesso!`, {
      description: `Autenticação bancária txID: MT-SIC-${Date.now().toString().slice(-8)}`
    });
  };

  const handleConcluirFechamento = () => {
    toast.success(`Conta da ${mesa.nome} 100% quitada e finalizada!`, {
      description: `Total de ${formatBrl(totalGeralComTaxa)} distribuído e liquidado entre ${pagantes.length} pagantes.`
    });
    onFinalizarConta(totalGeralComTaxa);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--surface)] w-full max-w-4xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[var(--ink)]">
                  Divisão Avançada de Conta &amp; Rateio · {mesa.nome}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-mono text-[10px] font-bold">
                  {mesa.ambiance.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Divisão flexível por item consumido, rateio igualitário ou múltiplos meios de pagamento simultâneos (PIX, Cartão e Dinheiro).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso de Quitação */}
        <div className="bg-[var(--surface2)]/70 px-5 py-3 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--ink)]">Total da Comanda:</span>
            <span className="font-mono font-extrabold text-sm text-[var(--salmon)]">
              {formatBrl(totalGeralComTaxa)}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              (Consumo: {formatBrl(totalConsumo)} {incluirTaxaServico && `+ ${taxaPct}% serviço: ${formatBrl(taxaServicoValor)}`})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--muted)]">
              Liquidado: <b className="font-mono text-emerald-600">{formatBrl(totalJaLiquidado)}</b> / Pendente: <b className="font-mono text-amber-600">{formatBrl(saldoRestante)}</b>
            </span>
            <div className="w-24 bg-[var(--line)] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalJaLiquidado / totalGeralComTaxa) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Seletor de Modo e Configuração de Taxa */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface2)]/40 p-3 rounded-2xl border border-[var(--line)]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mr-1">Modo:</span>
              <button
                onClick={() => setModoDivisao("POR_ITEM")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  modoDivisao === "POR_ITEM"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                🍱 Por Item Consumido
              </button>
              <button
                onClick={() => setModoDivisao("IGUALITARIA")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  modoDivisao === "IGUALITARIA"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                ⚖️ Divisão Igualitária
              </button>
              <button
                onClick={() => setModoDivisao("LIVRE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  modoDivisao === "LIVRE"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                ✏️ Valores Livres
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={incluirTaxaServico}
                  onChange={(e) => setIncluirTaxaServico(e.target.checked)}
                  className="rounded accent-indigo-600 cursor-pointer"
                />
                <span>Taxa de Serviço ({taxaPct}%)</span>
              </label>

              <button
                onClick={handleAddPagante}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Pagante</span>
              </button>
            </div>
          </div>

          {/* Cards dos Pagantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagantes.map((pagante, pIdx) => {
              const subtotal = getSubtotalPagante(pagante);
              const itensAtribuidos = pagante.itensAtribuidos;

              return (
                <div
                  key={pagante.id}
                  className={`p-4 rounded-2xl border transition shadow-xs space-y-3 relative ${
                    pagante.pago
                      ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20"
                      : "bg-[var(--surface)] border-[var(--line)] hover:border-indigo-500/40"
                  }`}
                >
                  {/* Topo do Card de Pagante */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        pagante.pago ? "bg-emerald-600 text-white" : "bg-indigo-500/10 text-indigo-600"
                      }`}>
                        {pIdx + 1}
                      </div>
                      <input
                        type="text"
                        value={pagante.nome}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, nome: val } : p));
                        }}
                        disabled={pagante.pago}
                        className="font-bold text-xs text-[var(--ink)] bg-transparent border-b border-transparent hover:border-[var(--line)] focus:border-indigo-600 focus:outline-hidden px-1 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {pagante.pago ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> PAGO
                        </span>
                      ) : (
                        pagantes.length > 1 && (
                          <button
                            onClick={() => handleRemovePagante(pagante.id)}
                            className="p-1 rounded text-[var(--muted)] hover:text-red-600 cursor-pointer transition"
                            title="Remover pagante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Detalhes de Itens (se modo POR_ITEM) */}
                  {modoDivisao === "POR_ITEM" && (
                    <div className="space-y-1.5 pt-1 border-t border-[var(--line)]">
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                        Clique nos itens consumidos por esta pessoa:
                      </span>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                        {mesa.itens.map((it, idx) => {
                          const isSelected = itensAtribuidos.includes(idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => !pagante.pago && handleToggleItemPagante(pagante.id, idx)}
                              disabled={pagante.pago}
                              className={`w-full text-left p-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white font-bold"
                                  : "bg-[var(--surface2)]/60 text-[var(--ink)] hover:bg-[var(--surface2)]"
                              }`}
                            >
                              <span className="truncate pr-2">{it.qtd}x {it.nome}</span>
                              <span className="font-mono text-[11px] whitespace-nowrap">
                                {formatBrl(it.qtd * it.valorUnit)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Valor Livre (se modo LIVRE) */}
                  {modoDivisao === "LIVRE" && (
                    <div className="space-y-1 pt-1 border-t border-[var(--line)]">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Valor a Pagar (R$):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pagante.valorManual || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, valorManual: val } : p));
                        }}
                        disabled={pagante.pago}
                        placeholder="0,00"
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface2)] font-mono font-bold text-xs text-[var(--ink)]"
                      />
                    </div>
                  )}

                  {/* Forma de Pagamento e Subtotal */}
                  <div className="pt-2 border-t border-[var(--line)] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)] font-bold">Subtotal:</span>
                      <span className="font-mono font-extrabold text-sm text-[var(--ink)]">
                        {formatBrl(subtotal)}
                      </span>
                    </div>

                    {!pagante.pago ? (
                      <div className="flex items-center gap-2">
                        {/* Seletor de Método */}
                        <div className="flex rounded-lg border border-[var(--line)] overflow-hidden bg-[var(--surface2)] p-0.5">
                          <button
                            onClick={() => setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, metodoPagamento: "PIX" } : p))}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              pagante.metodoPagamento === "PIX" ? "bg-emerald-600 text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
                            }`}
                          >
                            PIX
                          </button>
                          <button
                            onClick={() => setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, metodoPagamento: "CARTAO" } : p))}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              pagante.metodoPagamento === "CARTAO" ? "bg-indigo-600 text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
                            }`}
                          >
                            Cartão
                          </button>
                          <button
                            onClick={() => setPagantes(prev => prev.map(p => p.id === pagante.id ? { ...p, metodoPagamento: "DINHEIRO" } : p))}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              pagante.metodoPagamento === "DINHEIRO" ? "bg-amber-600 text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
                            }`}
                          >
                            Dinheiro
                          </button>
                        </div>

                        {/* Botão de Pagar */}
                        <button
                          onClick={() => handlePagarPagante(pagante)}
                          disabled={subtotal <= 0}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-1 disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Receber {formatBrl(subtotal)}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center justify-between">
                        <span>Pago via {pagante.metodoPagamento}</span>
                        <span className="font-mono">{formatBrl(pagante.valorPago)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-[var(--muted)]">
              Auditoria ativa · Emissão individual de cupom NFC-e por pagante disponível.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleConcluirFechamento}
              disabled={!todosPagaram}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir e Liberar Mesa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini-Modal de PIX Dinâmico com QR Code Sicredi */}
      {pixModalPagante && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2 text-left">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-black text-[var(--ink)]">PIX Dinâmico Sicredi MT</h4>
                  <p className="text-[10px] text-[var(--muted)]">{pixModalPagante.nome} · {mesa.nome}</p>
                </div>
              </div>
              <button onClick={() => setPixModalPagante(null)} className="p-1 text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-300 w-44 h-44 mx-auto flex items-center justify-center">
              <div className="space-y-2 text-neutral-800">
                <QrCode className="w-32 h-32 mx-auto text-neutral-900" />
                <span className="text-[9px] font-mono block text-neutral-500">zuma-pix-sicredi-mt</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[var(--muted)]">Valor do Pagamento:</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-600">
                {formatBrl(getSubtotalPagante(pixModalPagante))}
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono block">
                Chave: CNPJ 36.296.848/0001-57 (Zuma Culinária Oriental)
              </span>
            </div>

            <button
              onClick={() => handleConfirmarPix(pixModalPagante)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Recebimento do PIX</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
