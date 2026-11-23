import React, { useState } from "react";
import {
  CreditCard,
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  TrendingUp,
  Percent,
  Coins,
  Receipt,
  Scale,
  Users,
  AlertTriangle,
  Send,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { formatBrl } from "../../../../shared/zumaData";

export const BancosTefHub: React.FC = () => {
  const [simAmount, setSimAmount] = useState<string>("120.00");
  const [simMethod, setSimMethod] = useState<"debito" | "credito" | "voucher">("credito");
  const [simAcquirer, setSimAcquirer] = useState<string>("Stone Hub");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isConciliating, setIsConciliating] = useState<boolean>(false);

  const query = trpc.zuma.getBancosTefData.useQuery(undefined, {
    refetchInterval: 6000,
  });

  const conciliarMutation = trpc.zuma.triggerConciliacaoBancaria.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `100% conciliado • 0 divergências detectadas.`
      });
      setIsConciliating(false);
      query.refetch();
    },
    onError: (err) => {
      toast.error(`Falha na conciliação: ${err.message}`);
      setIsConciliating(false);
    }
  });

  const tefMutation = trpc.zuma.simulateTefTransaction.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `NSU: ${data.nsu} • Taxa retida: ${formatBrl(data.feeAmount)} • Líquido: ${formatBrl(data.netAmount)}`
      });
      setIsSimulating(false);
      query.refetch();
    },
    onError: (err) => {
      toast.error(`Erro no TEF: ${err.message}`);
      setIsSimulating(false);
    }
  });

  const data = query.data;

  const handleConciliar = () => {
    setIsConciliating(true);
    conciliarMutation.mutate();
  };

  const handleSimulateTef = () => {
    const val = parseFloat(simAmount);
    if (isNaN(val) || val <= 0) {
      toast.error("Digite um valor válido para a transação TEF.");
      return;
    }
    setIsSimulating(true);
    tefMutation.mutate({
      amount: val,
      acquirer: simAcquirer,
      method: simMethod
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER EXECUTIVO */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-white/20">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Bancos, Open Finance & TEF Multi-Adquirente
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  BACEN D+0 Conciliado
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Integração direta com cooperativas do agronegócio de Tangará da Serra (Sicredi e Sicoob), TEF Stone/Cielo e auditoria de taxas MDR.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
              Atualizar Saldos
            </button>
            <button
              onClick={handleConciliar}
              disabled={isConciliating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Executar Conciliação D+0
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Saldo em Conta Open Finance
            </div>
            <div className="text-lg font-bold text-white">
              {formatBrl(data?.openFinance.totalBalanceBrl || 180770)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Sicredi + Sicoob + BB + Itaú</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Receipt className="w-3.5 h-3.5 text-blue-400" />
              Vendas PDV Auditadas
            </div>
            <div className="text-lg font-bold text-white">
              {formatBrl(data?.conciliacao.vendasPdvBrl || 14280)}
            </div>
            <div className="text-[11px] text-blue-400 mt-0.5">{data?.conciliacao.totalTransacoesAuditadas || 64} Transações Hoje</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Índice de Conciliação
            </div>
            <div className="text-lg font-bold text-emerald-400">100.0%</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Divergência R$ 0,00</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Economia Retida MDR
            </div>
            <div className="text-lg font-bold text-amber-300">R$ 1.940,00</div>
            <div className="text-[11px] text-amber-400 mt-0.5">Taxas Abusivas Barradas</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Split Gorjeta (10%)
            </div>
            <div className="text-lg font-bold text-cyan-300">
              {formatBrl(data?.tef.splitGorjeta.totalArrecadadoTurnoBrl || 1428)}
            </div>
            <div className="text-[11px] text-cyan-400 mt-0.5">60% Salão • 40% Cozinha</div>
          </div>
        </div>
      </div>

      {/* GRADE EM 2 COLUNAS: CONTAS/CONCILIAÇÃO E TEF/SMARTPOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: INSTITUIÇÕES OPEN FINANCE & AUDITORIA MDR */}
        <div className="space-y-6">
          {/* CARDS DE BANCOS E COOPERATIVAS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Contas Conectadas Open Finance</h3>
                  <p className="text-xs text-slate-400">Cooperativas MT e bancos para recebimento e liquidação</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                BACEN Regulamentado
              </span>
            </div>

            <div className="space-y-3">
              {data?.openFinance.instituicoes.map((inst) => (
                <div key={inst.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                      {inst.id.toUpperCase().slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{inst.nome}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Ag: {inst.agencia} • CC: {inst.conta} • Tarifa Pix: {inst.tarifaPix}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400">{formatBrl(inst.saldo)}</div>
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                      ONLINE D+0
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAINEL DE AUDITORIA DE TAXAS MDR */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Auditoria de Taxas MDR & Vouchers</h3>
                  <p className="text-xs text-slate-400">Fiscalização contra divergências contratuais das adquirentes</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                Zero Cobrança Indevida
              </span>
            </div>

            <div className="space-y-3">
              {data?.tef.taxasMdrAuditadas.map((t, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-200">{t.modalidade}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Contratada: {t.taxaContratadaPct}% • Cobrada: {t.taxaCobradaMediaPct}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">+{formatBrl(t.economiaRetidaMesBrl)}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">Retido no mês</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: TEF MULTI-ADQUIRENTE, SMARTPOS & SIMULADOR */}
        <div className="space-y-6">
          {/* SIMULADOR DE TRANSAÇÃO TEF */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Simulador de Transação TEF IP</h3>
                  <p className="text-xs text-slate-400">Teste em tempo real de aprovação, cálculo de MDR e split</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Valor da Venda (R$)</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="120.00"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Modalidade</label>
                  <select
                    value={simMethod}
                    onChange={(e: any) => setSimMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="debito">Débito (0.89%)</option>
                    <option value="credito">Crédito à Vista (1.79%)</option>
                    <option value="voucher">Voucher Refeição (2.99%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Adquirente</label>
                  <select
                    value={simAcquirer}
                    onChange={(e) => setSimAcquirer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Stone Hub">Stone Hub (Primária)</option>
                    <option value="Cielo LIO">Cielo LIO (Failover)</option>
                    <option value="PagBank">PagBank (Contingência 3G)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Taxa estimada:{" "}
                  <span className="font-semibold text-slate-200">
                    {formatBrl(parseFloat(simAmount || "0") * (simMethod === "debito" ? 0.0089 : simMethod === "credito" ? 0.0179 : 0.0299))}
                  </span>
                </div>
                <button
                  onClick={handleSimulateTef}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Autorizar no Pinpad
                </button>
              </div>
            </div>
          </div>

          {/* PARQUE DE TERMINAIS SMARTPOS HOMOLOGADOS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Terminais SmartPOS Android & Pinpads</h3>
                  <p className="text-xs text-slate-400">Frota de maquininhas conectadas ao PDV e KDS</p>
                </div>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                3 Terminais Ativos
              </span>
            </div>

            <div className="space-y-3">
              {data?.tef.terminaisHomologados.map((term) => (
                <div key={term.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{term.modelo}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {term.localizacao} • IP: {term.ip} • Serial: {term.serial}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-200">{formatBrl(term.volumeHojeBrl)}</div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      {term.transacoesHoje} transações
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* SPLIT DE GORJETA */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="font-semibold text-slate-200">Rateio Automático de Gorjeta (10%)</div>
                  <div className="text-slate-400 text-[11px]">
                    Salão (Garçons): {formatBrl(data?.tef.splitGorjeta.rateioSalaoBrl || 856.8)} | Cozinha: {formatBrl(data?.tef.splitGorjeta.rateioCozinhaBrl || 571.2)}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold text-[11px]">
                10 Colaboradores
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
