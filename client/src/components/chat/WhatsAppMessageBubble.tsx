import React, { useState } from "react";
import { formatBrl } from "../../../../shared/zumaData";
import {
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  FileText,
  Volume2,
  Clock,
  ShieldCheck,
  User,
  Bot
} from "lucide-react";

export interface ChatMessageData {
  id: number;
  conversationId: string;
  authorType: "cli" | "ia" | "hum" | "sys";
  authorName?: string;
  content: string;
  createdAt: string;
  messageType?: "text" | "audio" | "image" | "receipt";
  audioDurationSeconds?: number;
  audioTranscription?: string;
  mediaUrl?: string;
  receiptDetails?: {
    amount: number;
    bank: string;
    txId: string;
    status: "validado" | "pendente";
    verifiedAt?: string;
  };
}

interface Props {
  message: ChatMessageData;
  customerName: string;
}

export const WhatsAppMessageBubble: React.FC<Props> = ({ message, customerName }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<"1x" | "1.5x" | "2x">("1x");

  const isCli = message.authorType === "cli";
  const isSys = message.authorType === "sys";
  const isHum = message.authorType === "hum";

  if (isSys) {
    return (
      <div className="flex justify-center my-1.5">
        <span className="text-[11px] text-[var(--muted)] bg-[var(--surface)]/95 border border-[var(--line)] px-3 py-1 rounded-full shadow-xs text-center max-w-[90%] font-medium">
          {message.content}
        </span>
      </div>
    );
  }

  // Waveform bars simuladas para notas de voz
  const waveHeights = [8, 16, 22, 14, 28, 20, 12, 24, 30, 18, 14, 22, 26, 16, 12, 20, 8];

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      // Simulação de parada automática após duração
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, (message.audioDurationSeconds || 12) * 500);
    }
  };

  const nextSpeed = () => {
    if (playbackSpeed === "1x") setPlaybackSpeed("1.5x");
    else if (playbackSpeed === "1.5x") setPlaybackSpeed("2x");
    else setPlaybackSpeed("1x");
  };

  return (
    <div className={`flex flex-col ${isCli ? "items-start" : "items-end"} my-1`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
          isCli
            ? "bg-white dark:bg-zinc-800 text-[var(--ink)] rounded-tl-xs border border-[var(--line)]/50"
            : isHum
            ? "bg-[var(--salmon-soft)] text-[var(--ink)] border border-[var(--salmon)]/30 rounded-tr-xs"
            : "bg-[var(--bubble-out)] text-[var(--ink)] border border-[var(--nori)]/20 rounded-tr-xs"
        }`}
      >
        {/* Cabeçalho da Mensagem */}
        <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
          <span
            className={
              isCli
                ? "text-[var(--muted)] flex items-center gap-1"
                : isHum
                ? "text-[var(--salmon)] font-extrabold flex items-center gap-1"
                : "text-[var(--nori)] flex items-center gap-1 font-bold"
            }
          >
            {isCli ? (
              <>
                <User className="w-2.5 h-2.5" />
                {customerName}
              </>
            ) : isHum ? (
              <>
                <User className="w-2.5 h-2.5" />
                {message.authorName || "Equipe Zuma"}
              </>
            ) : (
              <>
                <Bot className="w-2.5 h-2.5" />
                Zumi · IA Zuma
              </>
            )}
          </span>
          <span className="text-[9px] text-[var(--muted)] font-mono-nums">
            {new Date(message.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* 1. MENSAGEM DO TIPO ÁUDIO / NOTA DE VOZ */}
        {message.messageType === "audio" ? (
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center gap-2.5 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
              <button
                type="button"
                onClick={toggleAudio}
                className="w-8 h-8 rounded-full bg-[var(--salmon)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs shrink-0"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              {/* Waveform simulada */}
              <div className="flex-1 flex items-center gap-0.5 h-7">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingAudio && i % 3 === 0
                        ? "bg-[var(--salmon)] animate-pulse"
                        : "bg-[var(--ink)]/30 dark:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Duração & Velocidade */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-[10px] font-mono-nums font-bold text-[var(--muted)]">
                  0:{String(message.audioDurationSeconds || 14).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={nextSpeed}
                  className="px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[9px] font-bold text-[var(--ink)] hover:bg-black/15 transition-all"
                >
                  {playbackSpeed}
                </button>
              </div>
            </div>

            {/* Transcrição de IA embutida */}
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--salmon)]">
                <Sparkles className="w-3 h-3 text-[var(--salmon)]" />
                Transcrição Automática por IA:
              </div>
              <p className="italic text-[11px] text-[var(--ink)] leading-relaxed">
                "{message.audioTranscription || message.content}"
              </p>
            </div>
          </div>
        ) : message.messageType === "receipt" ? (
          /* 2. MENSAGEM DO TIPO COMPROVANTE PIX */
          <div className="space-y-2 pt-0.5">
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>

            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    Comprovante Pix · {message.receiptDetails?.bank || "Sicredi"}
                  </span>
                </div>
                <span className="font-mono-nums font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                  {formatBrl(message.receiptDetails?.amount || 79.9)}
                </span>
              </div>

              <div className="text-[10.5px] text-emerald-800/80 dark:text-emerald-200/80 font-mono space-y-0.5">
                <div>ID: {message.receiptDetails?.txId || "E847192038192847"}</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Autenticado pelo Zuma Pay às {message.receiptDetails?.verifiedAt || "18:40"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. MENSAGEM DE TEXTO PADRÃO */
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
};
