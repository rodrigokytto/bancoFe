import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { 
  ShieldCheck, 
  Fish, 
  MapPin, 
  Plane, 
  Truck, 
  Thermometer, 
  QrCode, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Flame,
  Snowflake,
  Sparkles,
  Info,
  Scale
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { SalmonPassportLot, INITIAL_SALMON_PASSPORTS } from "../../../shared/ultraData";

export const PassaporteSalmaoPublico: React.FC = () => {
  const [, params] = useRoute("/passaporte-salmao/:lote");
  const loteParam = params?.lote;
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedLotCode, setSelectedLotCode] = useState<string>(loteParam || "CL-REL-8842-ZUMA");

  // Query tRPC
  const passportsQuery = trpc.zuma.listSalmonPassports.useQuery();
  const passports = (passportsQuery.data && passportsQuery.data.length > 0) ? passportsQuery.data : INITIAL_SALMON_PASSPORTS;

  const currentPassport = passports.find(p => p.codigoLote === selectedLotCode || p.id === selectedLotCode) || passports[0];

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    toast.success("Hash SHA-256 copiado para a área de transferência!");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Link do Passaporte do Salmão copiado!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!currentPassport) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl">
          <Fish className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Lote de Salmão Não Encontrado</h1>
          <p className="text-neutral-400 text-sm mb-6">O lote consultado pode ter sido arquivado ou o código está incorreto.</p>
          <Link href="/ultra" className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm">
            Voltar ao Cockpit Ultra
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d12] text-white font-sans selection:bg-amber-500 selection:text-black pb-16">
      {/* Top Banner Informativo de Certificação */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Fish className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Zuma Pilot · Tangará da Serra (MT)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ANVISA RDC 216
                </span>
              </div>
              <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
                Passaporte do Salmão 360° <span className="text-neutral-500 font-normal">| Rastreabilidade do Fiorde ao Prato</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Compartilhar Link</span>
            </button>
            <Link
              href="/ultra"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-sm"
            >
              Cockpit Ultra
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Seletor de Lote & Resumo de Cabeçalho */}
        <div className="bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-950/90 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Lote Homologado Ativo
                </span>
                <span className="text-xs text-neutral-400 font-mono">POP-ZUMA-004 · CRN-MT 14208</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                {currentPassport.codigoLote}
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wide">
                  {currentPassport.status.replace(/_/g, " ")}
                </span>
              </h2>
              <p className="text-sm text-neutral-300 mt-1">
                {currentPassport.variedade} · <strong className="text-white">{currentPassport.fazendaOrigem}</strong>
              </p>
            </div>

            {/* Seletor de Lotes Disponíveis */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Trocar Lote Consultado:</span>
              <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                {passports.map((lot) => (
                  <button
                    key={lot.id}
                    onClick={() => setSelectedLotCode(lot.codigoLote)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      selectedLotCode === lot.codigoLote
                        ? "bg-amber-500 text-black font-bold shadow-xs"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    {lot.codigoLote}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Cards de Métricas Chave do Lote */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Temperatura Entrada</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-cyan-400 font-mono">
                +{currentPassport.temperaturaRecebimentoC.toFixed(1)}°C
              </div>
              <div className="text-[11px] text-neutral-500">Faixa segura: 0.0°C a +2.0°C</div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                <span>Choque Criotec -40°C</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-blue-400 font-mono">
                {currentPassport.cicloUltracongelamentoChoque.temperaturaMinimaAlcancada.toFixed(1)}°C
              </div>
              <div className="text-[11px] text-neutral-500">{currentPassport.cicloUltracongelamentoChoque.duracaoHoras}h profilaxia parasitária</div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Classificação Peixe</span>
              </div>
              <div className="text-xs md:text-sm font-black text-amber-400 leading-tight">
                {currentPassport.inspecaoOrganoleptica.classificacaoGeral}
              </div>
              <div className="text-[11px] text-neutral-500">pH {currentPassport.phMedido} · Frescor Ouro</div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rendimento & Saldo</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                {currentPassport.pesoDisponivelKg.toFixed(1)} <span className="text-xs font-normal">/ {currentPassport.pesoTotalRecebidoKg} kg</span>
              </div>
              <div className="text-[11px] text-neutral-500">{currentPassport.rendimentoAparasPct}% aproveitamento nobre</div>
            </div>
          </div>
        </div>

        {/* Linha do Tempo da Rastreabilidade: Do Fiorde Chileno até Tangará da Serra */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-lg">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cadeia Logística e Linha do Tempo da Rastreabilidade</h3>
              <p className="text-xs text-neutral-400">Rastreamento ininterrupto de frio da Patagônia Chilena até Tangará da Serra</p>
            </div>
          </div>

          <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-2.5 md:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-blue-500 before:to-emerald-500">
            {/* Etapa 1: Despesca no Chile */}
            <div className="relative">
              <div className="absolute -left-6 md:-left-8 top-1 w-5 h-5 rounded-full bg-amber-500 border-4 border-neutral-950 shadow-md flex items-center justify-center text-[9px] font-black text-black">
                1
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Despesca & Sangria Rápida no Chile</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-mono font-semibold">
                      {currentPassport.dataDespescaChile}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">{currentPassport.regiaoChile}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Despesca artesanal controlada na fazenda aquícola <strong>{currentPassport.fazendaOrigem}</strong> com água pura de degelo da Cordilheira dos Andes. O peixe é abatido com atordoamento indolor e sangria imediata para preservar a textura do lombo.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {currentPassport.certificacoes.map((c, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Etapa 2: Voo Internacional */}
            <div className="relative">
              <div className="absolute -left-6 md:-left-8 top-1 w-5 h-5 rounded-full bg-cyan-500 border-4 border-neutral-950 shadow-md flex items-center justify-center text-[9px] font-black text-black">
                2
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Transporte Aéreo Expresso & Desembaraço SIF</span>
                    <Plane className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs font-mono text-cyan-400">{currentPassport.vooTransporte}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Carga transportada em contêineres isotérmicos com gelo atóxico direto do Aeroporto de Santiago (SCL) para Guarulhos (GRU). Inspecionado e liberado pela Vigilância Agropecuária Internacional (VIGIAGRO) e MAPA sob o SIF 4120.
                </p>
              </div>
            </div>

            {/* Etapa 3: Rota Cuiabá -> Tangará da Serra */}
            <div className="relative">
              <div className="absolute -left-6 md:-left-8 top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-neutral-950 shadow-md flex items-center justify-center text-[9px] font-black text-black">
                3
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Caminhão Frigorífico TransFrio TermoKing</span>
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-xs text-neutral-400">Chegada Tangará: {currentPassport.chegadaTangara}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Transporte refrigerado exclusivo com controle digital de temperatura (-0.5°C a +1.0°C) telemetrado via satélite. Recebido no Zuma Tangará da Serra aferindo <strong>+{currentPassport.temperaturaRecebimentoC}°C</strong> na sonda central.
                </p>
              </div>
            </div>

            {/* Etapa 4: Ultracongelamento de Choque Criotec -40°C */}
            <div className="relative">
              <div className="absolute -left-6 md:-left-8 top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-neutral-950 shadow-md flex items-center justify-center text-[9px] font-black text-black">
                4
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Protocolo Anti-Parasitário Criotec -40°C (POP-ZUMA-004)</span>
                    <Snowflake className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Mínima: {currentPassport.cicloUltracongelamentoChoque.temperaturaMinimaAlcancada}°C ({currentPassport.cicloUltracongelamentoChoque.duracaoHoras}h)
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Conforme exigência internacional FDA e regulamento ANVISA RDC 216, todas as peças destinadas a consumo cru passam pelo ciclo ininterrupto de ultracongelamento rápido a -40°C. O congelamento instantâneo forma microcristais de gelo que não rompem a fibra do salmão, preservando a textura de sashimi fresco com 100% de segurança microbiológica.
                </p>
                <div className="mt-2.5 p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Laudo Laboratorial Microbiológico:</span>
                  <span className="text-xs font-bold text-emerald-400">{currentPassport.cicloUltracongelamentoChoque.laudoMicrobiologicoStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspeção Organoléptica Detalhada & Ficha do Chef */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Análise Sensorial */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Laudo Organoléptico de Recepção (Chef Kenji Sato)
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-400 mb-0.5">Aspecto dos Olhos</div>
                <div className="text-xs text-neutral-200">{currentPassport.inspecaoOrganoleptica.olhos}</div>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-400 mb-0.5">Coloração das Guelras (Brânquias)</div>
                <div className="text-xs text-neutral-200">{currentPassport.inspecaoOrganoleptica.guelras}</div>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-400 mb-0.5">Elasticidade e Firmeza Muscular</div>
                <div className="text-xs text-neutral-200">{currentPassport.inspecaoOrganoleptica.elasticidadeCarne}</div>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-400 mb-0.5">Odor Característico & Rigor Mortis</div>
                <div className="text-xs text-neutral-200">{currentPassport.inspecaoOrganoleptica.odor} · {currentPassport.inspecaoOrganoleptica.rigorMortis}</div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Assinatura Técnica, Selo SHA-256 e QR Code */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Certificação Técnica e Chave Criptográfica SHA-256
              </h3>

              <div className="space-y-3 mb-4">
                <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                  <div className="text-xs font-semibold text-neutral-400 mb-0.5">Chef Executivo de Cozinha</div>
                  <div className="text-sm font-bold text-white">{currentPassport.responsavelTecnico.chefExecutivo}</div>
                  <div className="text-[11px] text-neutral-500">Mestre Sushiman Zuma Tangará da Serra</div>
                </div>

                <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                  <div className="text-xs font-semibold text-neutral-400 mb-0.5">Responsável Técnica Nutricionista (RT)</div>
                  <div className="text-sm font-bold text-white">{currentPassport.responsavelTecnico.nutricionistaRT}</div>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold">{currentPassport.responsavelTecnico.crn}</div>
                </div>
              </div>
            </div>

            {/* Hash Criptográfico Imutável */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                <span className="font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Hash SHA-256 de Autenticidade Sanitária
                </span>
                <button
                  onClick={() => handleCopyHash(currentPassport.hashSha256Laudo)}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? "Copiado" : "Copiar"}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-neutral-300 break-all bg-neutral-900/90 p-2 rounded border border-neutral-800/60">
                {currentPassport.hashSha256Laudo}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Carimbo de data e hora inviolável gerado no barramento do Ultra.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional */}
        <footer className="text-center pt-6 border-t border-neutral-800/60 text-xs text-neutral-500">
          <p>
            Zuma Cozinha Oriental · CNPJ: 36.296.848/0001-57 · Tangará da Serra (MT) · Brasil
          </p>
          <p className="mt-1">
            Garantia de procedência 100% monitorada pelo Sistema Zuma Ultra Pilot e barramento de eventos internos.
          </p>
        </footer>
      </main>
    </div>
  );
};
