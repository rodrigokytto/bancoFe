import React, { useState } from "react";
import {
  Scale,
  Printer,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Radio,
  FileText,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export const ToledoBalancaHub: React.FC = () => {
  const [pesoAtual, setPesoAtual] = useState<number>(0.485);
  const [taraAtiva, setTaraAtiva] = useState<boolean>(true);
  const [valorKg, setValorKg] = useState<number>(149.90);
  const [balancaConectada, setBalancaConectada] = useState<boolean>(true);

  const balancas = [
    {
      id: "balanca_sushibar",
      nome: "Toledo Prix 6 Touch Sushibar",
      modelo: "Prix 6 Touch Wi-Fi / Ethernet",
      ip: "192.168.1.180",
      porta: 4001,
      local: "Bancada Central Sushiman",
      capacidade: "15 kg / Divisão 5g",
      status: "ONLINE (Conectada)",
      ultimaPesagem: "485g · Salmão Especial Sashimi",
      laudoInmetro: "Portaria 236/94 · Válido até 08/2027",
      taraPadrao: "25g (Embalagem Kraft Padrão)"
    },
    {
      id: "balanca_porcionamento",
      nome: "Toledo Prix 5 Plus Cozinha Fria",
      modelo: "Prix 5 Plus Serial RS-232",
      ip: "192.168.1.181",
      porta: 4002,
      local: "Área de Descongelamento e Limpeza",
      capacidade: "30 kg / Divisão 10g",
      status: "ONLINE (Conectada)",
      ultimaPesagem: "4.820kg · Peça Lombo Salmo Salar",
      laudoInmetro: "Portaria 236/94 · Válido até 11/2027",
      taraPadrao: "120g (Bandeja Gastronorm Inox)"
    },
    {
      id: "balanca_boutique",
      nome: "Toledo Prix Etiquetadora Boutique",
      modelo: "Prix 4 Uno Térmica Direta",
      ip: "192.168.1.182",
      porta: 4003,
      local: "Expedição & Estoque Loja de Roupas",
      capacidade: "6 kg / Divisão 2g",
      status: "ONLINE (Conectada)",
      ultimaPesagem: "Etiquetagem de Acessórios & Roupas",
      laudoInmetro: "Portaria 236/94 · Válido até 04/2027",
      taraPadrao: "0g (Pesagem Unitária de Peças)"
    }
  ];

  const itensRecentes = [
    { sku: "SKU-SALM-01", descricao: "Sashimi de Salmão Nobre Fresco (100g)", peso: "0.100 kg", valorKg: "R$ 149,90", total: "R$ 14,99", codigoBarras: "2000010014992", hora: "21:14:12" },
    { sku: "SKU-COMB-03", descricao: "Combinado Omakase Chef Rodrigo (485g)", peso: "0.485 kg", valorKg: "R$ 189,00", total: "R$ 91,66", codigoBarras: "2000030091665", hora: "21:08:44" },
    { sku: "SKU-TART-02", descricao: "Tartar de Salmão com Trufas & Ovas (180g)", peso: "0.180 kg", valorKg: "R$ 165,00", total: "R$ 29,70", codigoBarras: "2000020029708", hora: "20:54:19" },
    { sku: "SKU-CARP-01", descricao: "Carpaccio Salmão Trufado c/ Flor de Sal", peso: "0.140 kg", valorKg: "R$ 178,00", total: "R$ 24,92", codigoBarras: "2000040024921", hora: "20:39:05" }
  ];

  const totalCalculado = (pesoAtual * valorKg).toFixed(2);
  const codigoEanGerado = `200001${String(Math.round(parseFloat(totalCalculado) * 100)).padStart(6, "0")}1`;

  const simularLeituraPeso = () => {
    const novosPesos = [0.320, 0.485, 0.650, 0.210, 0.740];
    const pesoSorteado = novosPesos[Math.floor(Math.random() * novosPesos.length)];
    setPesoAtual(pesoSorteado);
    toast.success(`Nova pesagem capturada da Toledo Prix 6: ${(pesoSorteado * 1000).toFixed(0)}g (R$ ${(pesoSorteado * valorKg).toFixed(2)})`);
  };

  const emitirEtiqueta = () => {
    toast.success(`Etiqueta EAN-13 ${codigoEanGerado} enviada para a impressora térmica da Toledo Prix 6!`, {
      description: `Item: Combinado Sushibar · Peso: ${(pesoAtual * 1000).toFixed(0)}g · Total: R$ ${totalCalculado}`
    });
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* BANNER PRINCIPAL: BALANÇAS TOLEDO PRIX & ETIQUETAGEM EAN-13           */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                Toledo do Brasil Prix Oficial
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Homologado INMETRO Portaria 236/94
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--muted)] border border-[var(--line)] font-mono">
                TCP/IP 192.168.1.180:4001
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              Toledo Prix 6, Pesagem em Tempo Real &amp; Etiquetagem EAN-13
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Integração direta de hardware com balanças industriais de pesagem do Sushibar, câmara de porcionamento e etiquetagem da Boutique de Roupas. Captura contínua de peso com tara automática de embalagens, precificação instantânea por kg e código de barras padrão EAN-13 compatível com o PDV Touch e leitor óptico.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={simularLeituraPeso}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Capturar Peso Balança</span>
            </button>
            <button
              onClick={emitirEtiqueta}
              className="px-4 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Etiqueta</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs de Hardware & Pesagem */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Balanças Homologadas Ativas
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              3 / 3 Online
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              Sushibar, Cozinha e Boutique
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Peso Atual no Prato
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              {(pesoAtual * 1000).toFixed(0)} g
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Líquido (Tara 25g subtraída)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Valor Calculado
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              R$ {totalCalculado}
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Base: R$ {valorKg.toFixed(2)}/kg
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Código EAN-13 Gerado
            </span>
            <div className="text-sm sm:text-base font-black font-mono text-[var(--ink)] truncate">
              {codigoEanGerado}
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block leading-tight">
              Leitura instantânea no PDV Caixa
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* GRID DE BALANÇAS CONECTADAS NA REDE LOCAL (TANGARÁ DA SERRA)          */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="border-b border-[var(--line)] pb-3">
          <h3 className="font-extrabold text-sm text-[var(--ink)]">
            Parque de Balanças Conectadas (Rede Ethernet / Serial)
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Status de calibração INMETRO, endereço IP local e tara parametrizada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {balancas.map((b) => (
            <div key={b.id} className="p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-[var(--ink)] block">{b.nome}</strong>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{b.ip}:{b.porta}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {b.status}
                </span>
              </div>
              <div className="text-[10px] text-[var(--muted)] space-y-1 pt-1 border-t border-[var(--line)]">
                <div>📍 <b>Local:</b> {b.local}</div>
                <div>⚖️ <b>Capacidade:</b> {b.capacidade}</div>
                <div>📦 <b>Tara Padrão:</b> {b.taraPadrao}</div>
                <div>🛡️ <b>INMETRO:</b> {b.laudoInmetro}</div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">🕒 <b>Última Leitura:</b> {b.ultimaPesagem}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* HISTÓRICO DE PESAGENS & ETIQUETAS EMITIDAS NO TURNO                   */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <div className="border-b border-[var(--line)] pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[var(--ink)]">
              Auditoria de Pesagens &amp; Código de Barras EAN-13 (Turno Atual)
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Rastreabilidade de porcionamento por prato para auditoria de CMV e perdas
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            100% dos itens pesados sem divergência
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th className="pb-2.5">Horário</th>
                <th className="pb-2.5">SKU / Item</th>
                <th className="pb-2.5">Peso Líquido</th>
                <th className="pb-2.5">Preço / kg</th>
                <th className="pb-2.5">Total Calculado</th>
                <th className="pb-2.5">Código EAN-13</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {itensRecentes.map((item, i) => (
                <tr key={i} className="hover:bg-[var(--surface2)]/50 transition-colors">
                  <td className="py-2.5 font-mono text-[11px] text-[var(--muted)]">{item.hora}</td>
                  <td className="py-2.5 font-medium text-[var(--ink)]">
                    <div>{item.descricao}</div>
                    <span className="text-[9px] text-[var(--muted)] font-mono">{item.sku}</span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{item.peso}</td>
                  <td className="py-2.5 font-mono text-[var(--muted)]">{item.valorKg}</td>
                  <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{item.total}</td>
                  <td className="py-2.5 font-mono text-[11px] text-[var(--ink)] flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span>{item.codigoBarras}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-600">
                      REGISTRADO
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
