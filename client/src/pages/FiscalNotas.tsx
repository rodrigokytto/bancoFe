import React, { useState } from "react";
import { formatBrl } from "../../../shared/zumaData";
import { FileText, Download, ShieldCheck, Calendar, Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NfceDoc {
  numero: string;
  data: string;
  cliente: string;
  cpf: string;
  total: number;
  chave: string;
  status: "autorizada" | "cancelada";
}

export const FiscalNotas: React.FC = () => {
  // Slider de Faturamento RBT12 (Últimos 12 meses em milhares de R$)
  const [rbt12, setRbt12] = useState(720000); // 720k anual
  const [faturamentoMes, setFaturamentoMes] = useState(68000);

  // Faixas do Simples Nacional (Comércio / Restaurante - Anexo I)
  // Faixa 1: até 180k (4%)
  // Faixa 2: 180k a 360k (7.3% - deduz 5.940)
  // Faixa 3: 360k a 720k (9.5% - deduz 13.860)
  // Faixa 4: 720k a 1.800k (10.7% - deduz 22.500)
  let aliqNominal = 0.04;
  let deducao = 0;
  if (rbt12 <= 180000) {
    aliqNominal = 0.04;
    deducao = 0;
  } else if (rbt12 <= 360000) {
    aliqNominal = 0.073;
    deducao = 5940;
  } else if (rbt12 <= 720000) {
    aliqNominal = 0.095;
    deducao = 13860;
  } else {
    aliqNominal = 0.107;
    deducao = 22500;
  }

  const aliqEfetiva = ((rbt12 * aliqNominal - deducao) / rbt12);
  const aliqPercent = (aliqEfetiva * 100).toFixed(2);
  const valorDas = faturamentoMes * aliqEfetiva;

  // Lista de Notas Fiscais
  const [notas, setNotas] = useState<NfceDoc[]>([
    { numero: "000.001.088", data: "Hoje 21:14", cliente: "Consumidor Final", cpf: "842.***.***-00", total: 142.80, chave: "512611142830001099880001088", status: "autorizada" },
    { numero: "000.001.087", data: "Hoje 20:58", cliente: "Consumidor Final", cpf: "Nenhum", total: 98.90, chave: "512611142830001099880001087", status: "autorizada" },
    { numero: "000.001.086", data: "Hoje 20:41", cliente: "Mariana Costa", cpf: "019.***.***-45", total: 284.50, chave: "512611142830001099880001086", status: "autorizada" },
    { numero: "000.001.085", data: "Hoje 20:15", cliente: "Consumidor Final", cpf: "Nenhum", total: 64.90, chave: "512611142830001099880001085", status: "autorizada" },
    { numero: "000.001.084", data: "Hoje 19:50", cliente: "Carlos Eduardo", cpf: "712.***.***-21", total: 112.00, chave: "512611142830001099880001084", status: "autorizada" }
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          ERP · Fiscal &amp; Simples Nacional
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
          Notas, impostos e obrigações no mesmo lugar
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
          Emissão automática de NFC-e integrada à SEFAZ-MT, segregação de ICMS-ST para refrigerantes/cervejas e envio mensal do pacote XML direto para o contador.
        </p>
      </div>

      {/* 4 KPIs Fiscais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Faturamento Declarado Mês</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{formatBrl(faturamentoMes)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Base de cálculo da DAS</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Alíquota Efetiva</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{aliqPercent}%</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Anexo I com deduções</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Guia DAS Prevista</span>
          <div className="text-2xl font-display font-extrabold text-[var(--bad)] font-mono-nums mt-1">{formatBrl(valorDas)}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Vencimento dia 20 do mês</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Status SEFAZ-MT</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1 flex items-center gap-1.5">
            100% <ShieldCheck className="w-5 h-5 text-[var(--good)] inline" />
          </div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">Servidores operando normalmente</div>
        </div>
      </div>

      {/* Grid: Simulador Simples Nacional + Calendário */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Simulador de Alíquota */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--salmon)]" />
            Simulador de Enquadramento no Simples Nacional
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Ajuste a receita bruta dos últimos 12 meses (RBT12) para projetar a alíquota e economias tributárias.
          </p>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Receita Bruta Acumulada em 12 Meses (RBT12):</span>
                <b className="font-mono-nums text-[var(--ink)]">{formatBrl(rbt12)}</b>
              </div>
              <input
                type="range"
                min="120000"
                max="1800000"
                step="20000"
                value={rbt12}
                onChange={(e) => setRbt12(Number(e.target.value))}
                className="w-full accent-[var(--salmon)] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Faixa Atual:</span>
                <b className="text-[var(--ink)]">
                  {rbt12 <= 180000 ? "Faixa 1 (até R$ 180k)" : rbt12 <= 360000 ? "Faixa 2 (180k a 360k)" : rbt12 <= 720000 ? "Faixa 3 (360k a 720k)" : "Faixa 4 (720k a 1,8M)"}
                </b>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Alíquota Nominal da Tabela:</span>
                <span className="font-mono-nums font-bold text-[var(--ink)]">{(aliqNominal * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Parcela a Deduzir:</span>
                <span className="font-mono-nums text-[var(--good)]">{formatBrl(deducao)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--line)] font-bold text-[var(--salmon)]">
                <span>Alíquota Efetiva a Pagar:</span>
                <span className="font-mono-nums text-sm">{aliqPercent}%</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--nori-soft)] border border-[var(--nori)]/20 text-xs text-[var(--nori)] space-y-1">
              <b>Dica Tributária de Ouro do Zuma:</b>
              Bebidas frias (refrigerantes, cervejas, energéticos) possuem ICMS com Substituição Tributária (ST). O Zuma segrega automaticamente essas vendas na nota para você não pagar ICMS duas vezes no Simples! Economia de até R$ 820/mês.
            </div>
          </div>
        </div>

        {/* Calendário de Obrigações Fiscais */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--nori)]" />
            Calendário de Obrigações
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { dia: "Dia 05", nome: "Envio do Pacote XML para Contabilidade", desc: "Zuma gera o arquivo ZIP compactado com 100% dos XMLs", status: "Em dia" },
              { dia: "Dia 20", nome: "Vencimento da Guia DAS Simples Nacional", desc: "Pagamento do imposto unificado da receita do mês anterior", status: "A vencer" },
              { dia: "Dia 28", nome: "DeSTDA (Declaração ICMS / MT)", desc: "Transmissão eletrônica mensal pelo contador de Tangará", status: "A vencer" },
              { dia: "Anual", nome: "Renovação Alvará Sanitário e Prefeitura", desc: "Vistoria e taxas de funcionamento em Tangará da Serra", status: "Regular" }
            ].map((ob, i) => (
              <div key={i} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-1">
                <div className="flex items-center justify-between">
                  <b className="text-[var(--ink)]">{ob.nome}</b>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--muted)] font-mono-nums">
                    {ob.dia}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">{ob.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => toast.success("Pacote ZIP com todos os XMLs e relatórios do mês baixado com sucesso!")}
            className="w-full py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar XMLs do Mês para Contador (ZIP)
          </button>
        </div>
      </div>

      {/* Tabela de NFC-e Emitidas */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--salmon)]" />
          NFC-e Emitidas Recentemente
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <th className="py-2.5 pr-4 font-bold">Número NFC-e</th>
                <th className="py-2.5 px-3 font-bold">Data/Hora</th>
                <th className="py-2.5 px-3 font-bold">Cliente</th>
                <th className="py-2.5 px-3 font-bold">CPF</th>
                <th className="py-2.5 px-3 font-bold text-right font-mono-nums">Valor Total</th>
                <th className="py-2.5 px-3 font-bold">Chave de Acesso</th>
                <th className="py-2.5 pl-4 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {notas.map((n, i) => (
                <tr key={i} className="hover:bg-[var(--surface2)]/50">
                  <td className="py-3 pr-4 font-mono-nums font-bold text-[var(--ink)]">{n.numero}</td>
                  <td className="py-3 px-3 text-[var(--muted)]">{n.data}</td>
                  <td className="py-3 px-3 text-[var(--ink)]">{n.cliente}</td>
                  <td className="py-3 px-3 font-mono-nums text-[var(--muted)]">{n.cpf}</td>
                  <td className="py-3 px-3 text-right font-mono-nums font-bold text-[var(--salmon)]">{formatBrl(n.total)}</td>
                  <td className="py-3 px-3 font-mono-nums text-[10.5px] text-[var(--muted)] truncate max-w-[120px]">{n.chave}...</td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      onClick={() => toast.info(`Visualizando DANFE da nota ${n.numero}`)}
                      className="px-2 py-1 rounded-md border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--salmon)] hover:text-[var(--salmon)] text-[11px] font-semibold text-[var(--ink)]"
                    >
                      DANFE PDF
                    </button>
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
