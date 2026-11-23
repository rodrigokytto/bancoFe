/**
 * Módulo de Voz Humana e Natural do Copiloto Motoboy Zuma (Tangará da Serra - MT)
 * 
 * Remove qualquer tom robotizado, adiciona chime de áudio Web Audio API (estilo interfone),
 * seleciona vozes neurais brasileiras e utiliza linguagem calorosa, motivadora e parceira.
 */

export interface SpeechOptions {
  volume?: number;
  rate?: number;
  pitch?: number;
}

// Chime suave de notificação via Web Audio API (sem dependência de arquivos externos de áudio)
export function tocarChimeInterfone(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const t0 = ctx.currentTime;
    
    // Oscilador 1: Tom Principal harmônico ascendente (Dó5 523Hz -> Mi5 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, t0);
    osc1.frequency.exponentialRampToValueAtTime(659.25, t0 + 0.10);
    
    gain1.gain.setValueAtTime(0.12, t0);
    gain1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.26);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Oscilador 2: Harmônico de brilho sutil (Sol5 783.99Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, t0 + 0.08);

    gain2.gain.setValueAtTime(0.001, t0);
    gain2.gain.setValueAtTime(0.08, t0 + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(t0);
    osc1.stop(t0 + 0.28);
    osc2.start(t0 + 0.08);
    osc2.stop(t0 + 0.34);
  } catch (e) {
    // Web Audio silencioso se bloqueado pelo browser
  }
}

// Identifica a voz brasileira mais natural e humana disponível no sistema
export function obterMelhorVozPtBr(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const vozes = window.speechSynthesis.getVoices();
  if (!vozes || vozes.length === 0) return null;

  // Lista de prioridade com vozes neurais e de alta fidelidade
  const prioridadeNomes = [
    "Google português do Brasil",
    "Luciana",
    "Francisca",
    "Felipe",
    "pt-BR-Wavenet",
    "Microsoft Daniel - Portuguese (Brazil)",
    "Microsoft Maria - Portuguese (Brazil)",
    "Yara",
    "Heloisa",
    "Brazilian Portuguese",
  ];

  // 1. Tentar encontrar voz neural recomendada
  for (const nome of prioridadeNomes) {
    const v = vozes.find(
      item => item.lang.toLowerCase().replace("_", "-").includes("pt-br") && item.name.includes(nome)
    );
    if (v) return v;
  }

  // 2. Qualquer voz pt-BR
  const vozPtBr = vozes.find(item => item.lang.toLowerCase().replace("_", "-").includes("pt-br"));
  if (vozPtBr) return vozPtBr;

  // 3. Qualquer voz em português
  const vozPt = vozes.find(item => item.lang.toLowerCase().startsWith("pt"));
  return vozPt || null;
}

// Fala humanizada com Chime prévio, seleção de voz e entonação natural
export function falarVozHumana(
  texto: string,
  opcoes?: SpeechOptions,
  comChime: boolean = true
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    if (comChime) {
      tocarChimeInterfone();
    }

    // Pequeno atraso de 180ms para dar tempo do chime soar antes da voz começar
    setTimeout(() => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = "pt-BR";
      utterance.rate = opcoes?.rate ?? 1.02; // Velocidade natural e dinâmica
      utterance.pitch = opcoes?.pitch ?? 1.0; // Entonação calorosa e natural
      utterance.volume = opcoes?.volume ?? 1.0;

      const voz = obterMelhorVozPtBr();
      if (voz) {
        utterance.voice = voz;
      }

      window.speechSynthesis.speak(utterance);
    }, comChime ? 180 : 0);
  } catch (e) {
    // Fail-safe silencioso
  }
}

// Diálogos humanizados de motoboy parceiro (Linguagem acolhedora, calorosa e motivadora)
export const DIALOGOS_COPILOT_ZUMA = {
  boasVindas: () =>
    "E aí, parceiro! GPS conectado em Tangará da Serra. Tudo pronto pra rodar, boas entregas e vamo que vamo!",

  iniciarCircuito: (totalParadas: number, primeiroCliente: string, bairro: string) =>
    `Circuito de ${totalParadas} entregas iniciado, parceiro! Primeira parada: ${primeiroCliente} no bairro ${bairro}. Segue o traçado viário e boa rota!`,

  avancarParaProxima: (paradaAtual: number, totalParadas: number, proximoCliente: string, bairro: string, taxaGanha: number) =>
    `Show de bola! Parada ${paradaAtual} de ${totalParadas} finalizada com sucesso e mais R$ ${taxaGanha.toFixed(2)} garantidos na carteira. Agora partiu Parada ${paradaAtual + 1}: ${proximoCliente} no ${bairro}. Rota traçada no mapa, bora acelerar!`,

  circuitoCompletoFinalizado: (totalParadas: number, totalGanhos: number) =>
    `Sensacional, parceiro! Todas as ${totalParadas} entregas foram concluídas com 100% de sucesso! Você faturou R$ ${totalGanhos.toFixed(2)} em taxas na rodada. Agora é voltar pra base Zuma Oriental comemorar e recarregar a bag pro próximo turno!`,

  otimizacaoTsp10: (economiaKm: number, economiaMin: number, totalTaxas: number) =>
    `Show de bola, meu amigo! Rota dos 10 pedidos agrupada no capricho pela IA. Economizamos ${economiaKm} quilômetros de asfalto e quase ${economiaMin} minutos. O mapa já tá mostrando o circuito completo de Tangará da Serra com todas as 10 paradas e ${totalTaxas > 0 ? `cento e quarenta e dois reais` : "taxas garantidas"}. Bora pra primeira entrega no Centro!`,

  seguraChuva: () =>
    "Atenção, parceiro! Desvio seguro de chuva ativado. Tirei você da baixada alagada do Córrego Figueira e te joguei no asfalto alto da Tancredo Neves. Pista segura, vai na manha!",

  menorTrajeto: () =>
    "Beleza, ativei o menor trajeto! Cortando pelos atalhos asfaltados de Tangará pra você economizar combustível e pneu.",

  maisRapida: () =>
    "Fechado! Rota rápida pelas avenidas principais de Tangará. Pista limpa e trânsito livre!",

  chegadaDestino: (clienteNome: string) =>
    `Chegamos no destino do ${clienteNome}, parceiro! Confirma o código PIN de 4 dígitos com o cliente e bora pra próxima parada!`,

  entregaConcluida: (taxa: number) =>
    `Top demais! Entrega finalizada com sucesso e mais R$ ${taxa.toFixed(2)} garantidos na sua carteira. Próxima parada já tá na agulha!`,

  alertaRadar: (velocidade: number) =>
    `Se liga aí, parceiro! Radar de ${velocidade} por hora logo à frente. Segura um pouco a mão no acelerador!`,

  alertaAlagamento: () =>
    "Cuidado aí na frente: trecho com histórico de enxurrada e poça d'água na pista. Reduz a velocidade com cautela!",

  trocoCalculado: (troco: number) =>
    `Troco calculado certinho: devolve R$ ${troco.toFixed(2)} pro cliente e colhe a assinatura touch na tela!`,

  pixSicrediGerado: (valor: number) =>
    `Cobrança Pix Sicredi de R$ ${valor.toFixed(2)} gerada na tela. Assim que o cliente pagar, já libera a barca de sushi!`,

  testeCopilot: () =>
    "Fala parceiro motoboy! Aqui é o copiloto de voz do Zuma. Tô contigo nas pistas de Tangará da Serra pra acelerar tuas entregas com segurança, economia e agilidade!",
};
