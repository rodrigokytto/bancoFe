// Utilitário de Efeitos Sonoros com Web Audio API para o KDS 2.0 Zuma
// Funciona 100% offline, sem carregar arquivos externos, com volume e timbre balanceados

class KdsAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Novo pedido chegando na cozinha (Tríade ascendente suave C5 -> E5 -> G5)
  public playNewOrderChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.1);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.1 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.1);
      osc.stop(startTime + idx * 0.1 + 0.3);
    });
  }

  // Alerta de SLA crítico / Atraso (Bip duplo de atenção 880Hz)
  public playSlaWarningChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    [0, 0.16].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, startTime + offset); // A5

      gain.gain.setValueAtTime(0.001, startTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + offset);
      osc.stop(startTime + offset + 0.14);
    });
  }

  // Pedido ou prato pronto / Despachado (Sino agudo agradável)
  public playReadyChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  // Bipe característico de Leitura do Cartão / Inserção no POS (1200Hz curto)
  public playCardReaderBeep() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  // Transação TEF Aprovada / Pagamento Confirmado (Acorde ascendente triunfal D5 -> A5)
  public playPaymentApprovedChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    [587.33, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.12);
      osc.stop(startTime + idx * 0.12 + 0.38);
    });
  }

  // Transação Recusada ou Tentativa de Fechamento sem Pagamento (Tom grave de alerta)
  public playPaymentRejectedChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    [320, 240].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.14);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.28, startTime + idx * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.14 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.14);
      osc.stop(startTime + idx * 0.14 + 0.25);
    });
  }

  // Alerta sonoro de Cancelamento de Item na Cozinha (Sequência rápida e urgente de aviso 880Hz -> 659Hz -> 523Hz -> 392Hz)
  public playCancellationAlertChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const freqs = [880, 659.25, 523.25, 392]; // A5, E5, C5, G4
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.12);
      osc.stop(startTime + idx * 0.12 + 0.24);
    });
  }
}

export const kdsAudio = new KdsAudioSynthesizer();
