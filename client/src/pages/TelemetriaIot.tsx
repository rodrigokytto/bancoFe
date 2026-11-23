import React, { useState } from "react";
import { 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  Fish, 
  Plane, 
  Truck, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  Activity, 
  Clock, 
  BellRing, 
  FileText,
  Anchor,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export function TelemetriaIot() {
  const [portaAbertaSimulada, setPortaAbertaSimulada] = useState(false);

  const sensores = [
    {
      id: "sensor-camara-fria",
      nome: "Câmara Fria Principal (Salmão Fresco)",
      setor: "Câmara Frigorífica #01",
      tempAtual: portaAbertaSimulada ? 4.2 : -0.8,
      tempMin: -1.5,
      tempMax: 1.0,
      umidade: 88,
      status: portaAbertaSimulada ? "critico" : "ideal",
      historico: [-0.6, -0.7, -0.8, -0.9, -0.8, -0.7, portaAbertaSimulada ? 4.2 : -0.8]
    },
    {
      id: "sensor-ultracongelador",
      nome: "Ultracongelador de Choque Térmico (-40°C)",
      setor: "Controle de Anisakis & Congelamento Rápido",
      tempAtual: -38.6,
      tempMin: -42.0,
      tempMax: -35.0,
      umidade: 65,
      status: "ideal",
      historico: [-38.2, -38.4, -38.5, -38.6, -38.6, -38.5, -38.6]
    },
    {
      id: "sensor-vitrine-sushibar",
      nome: "Balcão Vitrine Sushibar Inox",
      setor: "Salão Nobre / Visão do Cliente",
      tempAtual: 2.8,
      tempMin: 1.0,
      tempMax: 4.0,
      umidade: 82,
      status: "ideal",
      historico: [2.5, 2.7, 2.8, 2.9, 2.8, 2.7, 2.8]
    }
  ];

  const loteRastreabilidade = {
    codigo: "LT-SAL-20261119-01",
    especie: "Salmão do Atlântico (Salmo salar)",
    calibre: "4 a 5 kg (Eviscerado c/ Cabeça)",
    fornecedor: "Cermaq Chile / Distribuidora Pantanal Pescados",
    dataDespesca: "15/11/2026 06:30 (Puerto Montt - Chile)",
    transporteAereo: "Voo LA-8012 Santiago (SCL) -> Guarulhos (GRU)",
    transporteTerrestre: "Caminhão Frigorífico Baú -2°C (GRU -> Cuiabá -> Tangará da Serra)",
    chegadaTangara: "19/11/2026 14:15",
    laudoSanitarioSIF: "SIF/DIPOA nº 1042/2026 - Aprovado Padrão Ouro",
    temperaturaRecebimento: "-0.5°C na espinha central"
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6">
      {/* TopBar Telemetria */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Thermometer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">TELEMETRIA IoT & RASTREABILIDADE 360°</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold uppercase">
                3 Sensores Ativos
              </span>
            </div>
            <p className="text-xs text-slate-400">Câmara fria, ultracongelador e rastreamento "Do Barco à Mesa" • Padrão Anvisa e SIF</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPortaAbertaSimulada(!portaAbertaSimulada)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              portaAbertaSimulada 
                ? "bg-red-500 text-white border-red-600 animate-bounce" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            {portaAbertaSimulada ? "⚠️ Simular Porta Fechada" : "🚨 Testar Alarme Porta Aberta"}
          </button>
          <Link href="/erp">
            <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
              Voltar ao ERP
            </button>
          </Link>
        </div>
      </header>

      {/* Alerta de Desvio Térmico em Caso de Porta Aberta */}
      {portaAbertaSimulada && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-300 shrink-0 animate-bounce" />
            <div>
              <h3 className="font-black text-sm">ALERTA SANITÁRIO CRÍTICO: PORTA DA CÂMARA FRIA ABERTA</h3>
              <p className="text-xs text-rose-100">A temperatura subiu para +4.2°C (limite: +1.0°C). Notificação sonora e WhatsApp de emergência disparados.</p>
            </div>
          </div>
          <button 
            onClick={() => setPortaAbertaSimulada(false)}
            className="px-3 py-1.5 rounded-xl bg-white text-red-600 font-bold text-xs shadow hover:bg-slate-100 shrink-0"
          >
            Reconhecer Alarme
          </button>
        </div>
      )}

      {/* Grid de Sensores de Temperatura IoT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sensores.map(sensor => {
          const isCritico = sensor.status === "critico";
          return (
            <div 
              key={sensor.id}
              className={`p-4 rounded-2xl bg-slate-950 border transition shadow-lg ${
                isCritico ? "border-red-500/80 ring-2 ring-red-500/30" : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{sensor.setor}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  isCritico ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}>
                  {isCritico ? "Alerta Térmico" : "Seguro (HACCP)"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-1 leading-tight">{sensor.nome}</h3>

              <div className="my-4 flex items-baseline justify-between">
                <div>
                  <span className={`text-3xl font-black font-mono ${
                    isCritico ? "text-red-400" : "text-cyan-400"
                  }`}>
                    {sensor.tempAtual > 0 ? `+${sensor.tempAtual.toFixed(1)}` : sensor.tempAtual.toFixed(1)}°C
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Faixa permitida: {sensor.tempMin}°C a {sensor.tempMax}°C</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300">{sensor.umidade}%</span>
                  <p className="text-[10px] text-slate-500">Umidade Relativa</p>
                </div>
              </div>

              {/* Sparkline de Histórico 24h */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Estabilidade (Últimas 6 leituras)</span>
                  <span className="text-emerald-400 font-semibold">100% calibrado</span>
                </div>
                <div className="flex items-end gap-1.5 h-8">
                  {sensor.historico.map((val, idx) => (
                    <div 
                      key={idx}
                      style={{ height: `${Math.min(100, Math.max(20, (val + 40) * 2))}%` }}
                      className={`flex-1 rounded-sm ${
                        isCritico && idx === sensor.historico.length - 1 ? "bg-red-500 animate-pulse" : "bg-cyan-600/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rastreabilidade "Do Barco à Mesa" */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Fish className="w-5 h-5 text-orange-400" />
              <h2 className="text-base font-bold text-white">Rastreabilidade "Do Barco à Mesa" • Lote Atual</h2>
            </div>
            <p className="text-xs text-slate-400">Transparência radical: dados do lote servido hoje aos clientes do Zuma em Tangará da Serra</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-800 text-orange-400 px-3 py-1 rounded-lg border border-slate-700">
              {loteRastreabilidade.codigo}
            </span>
          </div>
        </div>

        {/* Linha do Tempo da Logística do Salmão Chileno */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
              <Anchor className="w-4 h-4" /> 1. Despesca no Chile
            </div>
            <p className="text-xs font-semibold text-white">{loteRastreabilidade.dataDespesca}</p>
            <p className="text-[10px] text-slate-400">Fiordes gelados de Puerto Montt, águas subantárticas.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Plane className="w-4 h-4" /> 2. Voo de Carga Internacional
            </div>
            <p className="text-xs font-semibold text-white">{loteRastreabilidade.transporteAereo}</p>
            <p className="text-[10px] text-slate-400">Gelo gel especial, monitoramento térmico contínuo.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Truck className="w-4 h-4" /> 3. Rodoviário Refrigerado MT
            </div>
            <p className="text-xs font-semibold text-white">{loteRastreabilidade.transporteTerrestre}</p>
            <p className="text-[10px] text-slate-400">Baú a -2°C, 240km de Cuiabá até Tangará da Serra.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> 4. Entrada na Câmara Zuma
            </div>
            <p className="text-xs font-semibold text-white">{loteRastreabilidade.chegadaTangara}</p>
            <p className="text-[10px] text-emerald-400 font-medium">{loteRastreabilidade.temperaturaRecebimento}</p>
          </div>
        </div>

        {/* Certificado e QR Code de Storytelling para o Consumidor */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://zuma.kytto.com.br/rastreabilidade/LT-SAL-20261119-01" 
                alt="QR Code Lote"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                Certificado Digital de Origem e Frescor
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{loteRastreabilidade.laudoSanitarioSIF}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Disponível no verso da comanda ou na tampa da embalagem do delivery. O cliente escaneia e comprova o frescor no próprio smartphone.
              </p>
            </div>
          </div>

          <button 
            onClick={() => alert(`Laudo Técnico do Lote ${loteRastreabilidade.codigo} exportado em PDF com assinatura digital do Responsável Técnico!`)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shrink-0"
          >
            Baixar Laudo Sanitário SIF
          </button>
        </div>
      </div>
    </div>
  );
}
export default TelemetriaIot;
