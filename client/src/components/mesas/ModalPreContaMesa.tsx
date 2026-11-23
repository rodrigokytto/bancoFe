import React, { useState } from "react";
import { 
  Printer, 
  X, 
  Send, 
  QrCode, 
  Users, 
  Receipt, 
  Copy, 
  Check, 
  Percent, 
  Clock, 
  UtensilsCrossed 
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "../../../../shared/zumaData";

export interface ItemPreConta {
  nome: string;
  qtd: number;
  valorUnit: number;
  obs?: string;
}

export interface ModalPreContaMesaProps {
  isOpen: boolean;
  onClose: () => void;
  mesaNumero: number;
  mesaNome?: string;
  garcomNome: string;
  clienteNome?: string;
  itens: ItemPreConta[];
  consumoBase: number;
  incluirGorjeta: boolean;
  onToggleGorjeta: (ativo: boolean) => void;
  splitPessoas: number;
  onChangeSplitPessoas: (num: number) => void;
}

export const ModalPreContaMesa: React.FC<ModalPreContaMesaProps> = ({
  isOpen,
  onClose,
  mesaNumero,
  mesaNome,
  garcomNome,
  clienteNome,
  itens,
  consumoBase,
  incluirGorjeta,
  onToggleGorjeta,
  splitPessoas,
  onChangeSplitPessoas,
}) => {
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);

  if (!isOpen) return null;

  const taxaServico = incluirGorjeta ? consumoBase * 0.1 : 0;
  const totalGeral = consumoBase + taxaServico;
  const pessoas = Math.max(1, splitPessoas);
  const cotaPorPessoa = totalGeral / pessoas;

  const txIdPix = `PRE${Date.now().toString().slice(-8)}SICREDI`;
  const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX013636296848000157520400005303986540${totalGeral.toFixed(2).replace(".", "")}5802BR5925ZUMA COZINHA ORIENTAL6014TANGARA DA SER62240520${txIdPix}6304E8A2`;

  const handleCopiarPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopiadoPix(true);
    toast.success("Código Pix Copia e Cola copiado com sucesso!");
    setTimeout(() => setCopiadoPix(false), 2500);
  };

  const handleImprimirPreConta = () => {
    setImprimindo(true);
    toast.success(`Pré-conta da Mesa ${String(mesaNumero).padStart(2, "0")} despachada para a impressora térmica 80mm!`);
    setTimeout(() => {
      setImprimindo(false);
      window.print();
    }, 400);
  };

  const handleCompartilharWhatsApp = () => {
    const itensTexto = itens
      .map(it => `• ${it.qtd}x ${it.nome} — ${formatBrl(it.qtd * it.valorUnit)}`)
      .join("\n");

    const textoWhats = `🍣 *ZUMA COZINHA ORIENTAL — PRÉ-CONTA*\n` +
      `Mesa ${String(mesaNumero).padStart(2, "0")} · Atendente: ${garcomNome}\n` +
      (clienteNome ? `Cliente: ${clienteNome}\n` : "") +
      `--------------------------------\n` +
      `*Itens Consumidos:*\n${itensTexto}\n` +
      `--------------------------------\n` +
      `Subtotal: ${formatBrl(consumoBase)}\n` +
      (incluirGorjeta ? `Serviço Opcional (10%): ${formatBrl(taxaServico)}\n` : "") +
      `*TOTAL A PAGAR: ${formatBrl(totalGeral)}*\n` +
      (pessoas > 1 ? `Dividido em ${pessoas} pessoas: *${formatBrl(cotaPorPessoa)} cada*\n` : "") +
      `--------------------------------\n` +
      `*Pague via Pix Sicredi MT:*\nChave CNPJ: 36.296.848/0001-57\n\n` +
      `Agradecemos a preferência! 🥢`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoWhats)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-md w-full shadow-2xl p-5 space-y-4 my-auto max-h-[95vh] flex flex-col">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">
                Pré-Conta · Mesa {String(mesaNumero).padStart(2, "0")}
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Conferência para o cliente antes do fechamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* CONTROLES DE DIVISÃO E 10% */}
        <div className="grid grid-cols-2 gap-2 bg-[var(--surface2)] p-3 rounded-2xl shrink-0 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
              Divisão por Pessoas:
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onChangeSplitPessoas(Math.max(1, pessoas - 1))}
                className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-bold text-[var(--ink)]"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm w-6 text-center text-[var(--ink)]">
                {pessoas}
              </span>
              <button
                onClick={() => onChangeSplitPessoas(pessoas + 1)}
                className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--line)] font-bold text-[var(--ink)]"
              >
                +
              </button>
              <span className="text-[11px] text-[var(--muted)] ml-1">
                {pessoas === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-end">
            <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
              Taxa de Serviço 10%:
            </label>
            <button
              onClick={() => onToggleGorjeta(!incluirGorjeta)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition ${
                incluirGorjeta
                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border-transparent"
              }`}
            >
              {incluirGorjeta ? "✓ 10% Ativo" : "✕ Opcional Desativado"}
            </button>
          </div>
        </div>

        {/* BOBINA TÉRMICA ESC/POS 80mm (PREVIEW FIEL) */}
        <div className="flex-1 overflow-y-auto bg-amber-50/70 dark:bg-zinc-950 p-4 rounded-2xl border border-amber-200/50 dark:border-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 space-y-2.5 shadow-inner">
          <div className="text-center space-y-0.5 border-b border-dashed border-zinc-400 dark:border-zinc-700 pb-2">
            <div className="font-black text-xs text-orange-600 dark:text-orange-400">
              *** ZUMA COZINHA ORIENTAL ***
            </div>
            <div>CNPJ: 36.296.848/0001-57</div>
            <div>Av. Tancredo Neves, 1200 — Tangará da Serra MT</div>
            <div className="text-[10px] text-zinc-500">
              DOCUMENTO NÃO FISCAL — CONFERÊNCIA DE MESA
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 border-b border-dashed border-zinc-400 dark:border-zinc-700 pb-1.5">
            <span>MESA: {String(mesaNumero).padStart(2, "0")} ({mesaNome || "Salão"})</span>
            <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          <div className="text-[10px] text-zinc-500">
            ATENDENTE: {garcomNome} {clienteNome ? `· CLIENTE: ${clienteNome}` : ""}
          </div>

          {/* LISTAGEM DE ITENS */}
          <div className="space-y-1 border-b border-dashed border-zinc-400 dark:border-zinc-700 pb-2">
            <div className="flex justify-between font-bold text-[10px] text-zinc-500 pb-0.5">
              <span>QTD ITEM</span>
              <span>TOTAL (R$)</span>
            </div>
            {itens.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <span className="truncate max-w-[200px]">
                  {it.qtd}x {it.nome}
                </span>
                <span className="font-bold shrink-0">
                  {formatBrl(it.qtd * it.valorUnit)}
                </span>
              </div>
            ))}
          </div>

          {/* TOTALIZADORES */}
          <div className="space-y-1 text-right pt-1">
            <div className="flex justify-between">
              <span>SUBTOTAL CONSUMO:</span>
              <span>{formatBrl(consumoBase)}</span>
            </div>
            {incluirGorjeta && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>SERVIÇO (10% OPCIONAL):</span>
                <span>{formatBrl(taxaServico)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black border-t border-b border-zinc-700 py-1 text-orange-600 dark:text-orange-400">
              <span>TOTAL CONTA:</span>
              <span>{formatBrl(totalGeral)}</span>
            </div>
            {pessoas > 1 && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400 font-bold pt-0.5">
                <span>POR PESSOA ({pessoas}x):</span>
                <span>{formatBrl(cotaPorPessoa)}</span>
              </div>
            )}
          </div>

          {/* QR CODE PIX SICREDI DINÂMICO */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-center space-y-1.5 mt-2">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <QrCode className="w-3.5 h-3.5" />
              Pague na Mesa via Pix Sicredi MT
            </div>
            <div className="text-[9px] text-zinc-500">
              Chave CNPJ: 36.296.848/0001-57 · Zuma Cozinha Oriental
            </div>
            <button
              onClick={handleCopiarPix}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              {copiadoPix ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copiadoPix ? "Copiado!" : "Copiar Código Pix"}
            </button>
          </div>

          <div className="text-center text-[9px] text-zinc-400 pt-1">
            Obrigado pela preferência! Volte sempre!
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="grid grid-cols-2 gap-2 pt-1 shrink-0">
          <button
            onClick={handleImprimirPreConta}
            disabled={imprimindo}
            className="py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            {imprimindo ? "Imprimindo..." : "Imprimir 80mm"}
          </button>

          <button
            onClick={handleCompartilharWhatsApp}
            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Send className="w-4 h-4" />
            Enviar WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};
