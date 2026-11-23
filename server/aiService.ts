import axios from "axios";
import { ALL_ITEMS, MENU } from "../shared/zumaData";

const GEMINI_KEY = process.env.GEMINI_API_KEY;

export async function generateAiCompletion(prompt: string, systemInstruction?: string): Promise<string> {
  if (GEMINI_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 3000,
          thinkingConfig: { thinkingBudget: 0 },
        },
      };
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }
      const response = await axios.post(url, payload, { timeout: 45000 });
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (e: any) {
      console.warn("[AIService] Gemini request failed:", e.message);
    }
  }
  return "";
}

export interface ZumiChatResponse {
  text: string;
  addedItem?: { nome: string; preco: number; cat: string; q: number };
  handoffReason?: string;
  closeOrder?: boolean;
}

export interface CustomerProfileContext {
  neighborhood?: string;
  dietaryPreferences?: string[];
  favoriteDish?: string;
  aiProfileSummary?: string;
  recommendedPromo?: string;
  recommendedDish?: string;
  priceSensitivity?: string;
}

export async function chatWithZumi(params: {
  customerName: string;
  messages: Array<{ authorType: "cli" | "ia" | "hum" | "sys"; content: string }>;
  cart: Array<{ nome: string; preco: number; cat: string; q: number }>;
  knowledgeBaseRules?: Array<{ question: string; answer: string }>;
  customerProfile?: CustomerProfileContext;
}): Promise<ZumiChatResponse> {
  const { customerName, messages, cart, knowledgeBaseRules = [], customerProfile } = params;
  const lastUserMsg = [...messages].reverse().find(m => m.authorType === "cli")?.content || "";
  const lowerMsg = lastUserMsg.toLowerCase();

  // 1. Verificação de regras de transbordo prioritárias (Alerta Vermelho para atendente)
  if (/frio|errad|atras|demor|horr|péssim|pessim|reclama|cancel|estragad|faltou|veio sem|absurd|nunca mais|não gostei|nao gostei|decepcionad/i.test(lastUserMsg)) {
    return {
      text: `Poxa, ${customerName.split(" ")[0]}, sinto muito mesmo! Já chamei um atendente da equipe humana com urgência para resolver isso agora mesmo com você 🙏`,
      handoffReason: "Reclamação de cliente"
    };
  }

  if (/atendente|humano|uma pessoa|falar com algu|gerente|\bdono\b|pessoa de verdade|falar com atendente/i.test(lastUserMsg)) {
    return {
      text: "Com certeza! Já avisei a nossa equipe e um atendente humano já vai assumir aqui pra falar com você 🙌",
      handoffReason: "Cliente pediu uma pessoa"
    };
  }

  if (/evento|festa|confraterniza|empresa|corporativ|\b([2-9]\d|\d{3,})\s*pessoas|aniversário grande/i.test(lastUserMsg)) {
    return {
      text: "Que legal! Para grupos grandes e eventos, vou chamar nossa equipe comercial para montar uma proposta exclusiva com condições especiais. Só um instante!",
      handoffReason: "Evento ou grupo grande"
    };
  }

  if (/desconto especial|parceria|patrocínio|patrocinio|reclamação formal/i.test(lastUserMsg)) {
    return {
      text: "Entendido! Esse tipo de negociação eu passo direto para a gerência cuidar de você. Já chamei a equipe!",
      handoffReason: "Negociação especial"
    };
  }

  // 2. Busca na Base de Conhecimento ensinada pela equipe
  for (const rule of knowledgeBaseRules) {
    const qWords = rule.question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matches = qWords.filter(w => lowerMsg.includes(w)).length;
    if (matches >= 2 || (qWords.length === 1 && matches === 1)) {
      return { text: rule.answer };
    }
  }

  // 3. IA Generativa com Gemini e Contexto do Perfil do Cliente
  const menuSummary = Object.entries(MENU).map(([c, its]) =>
    `${c}: ` + its.slice(0, 8).map(([n, p]) => `${n} (R$ ${p.toFixed(2)})`).join(", ")
  ).join("\n");

  const kbSummary = knowledgeBaseRules.length
    ? "\nRespostas ensinadas pela equipe (prioridade máxima):\n" +
      knowledgeBaseRules.map(k => `- Pergunta: "${k.question}" => Resposta: "${k.answer}"`).join("\n")
    : "";

  const profileSummary = customerProfile
    ? `\nPerfil e Preferências Aprendidas do Cliente (${customerName}):
- Bairro: ${customerProfile.neighborhood || "Tangará da Serra"}
- Preferências / Restrições: ${(customerProfile.dietaryPreferences || []).join(", ") || "Sem restrições"}
- Prato Favorito: ${customerProfile.favoriteDish || "Combo 26 Peças"}
- Dossiê / Comportamento: ${customerProfile.aiProfileSummary || "Cliente frequente"}
- Promoção Recomendada para Oferecer: ${customerProfile.recommendedPromo || "Frete grátis"}
INSTRUÇÃO DE APRENDIZADO: Se o cliente perguntar sugestões, ofereça com prioridade pratos alinhados ao perfil dele (ex: se não come cru, sugira hot rolls e grelhados; se tem promoção recomendada, cite a vantagem de entrega).`
    : "";

  const systemInstruction = `Você é o Zumi, mascote oficial (um salmão ninja brincalhão, acolhedor e prestativo) do restaurante Zuma Cozinha Oriental em Tangará da Serra/MT.
Horário de funcionamento: Terça a Domingo, das 18h às 22h45 (segunda fechado).
Taxa de entrega: R$ 9 a R$ 22 conforme o bairro em Tangará da Serra (Centro R$ 9, Tarumã R$ 12, Shangri-lá R$ 14, Cidade Alta R$ 10).
Formas de pagamento: Pix (chave oficial zuma@kytto.com.br), Cartões de Débito/Crédito na maquininha na entrega, e Dinheiro.
Tempo de entrega: 40 a 55 minutos.

Regras de ouro de atendimento:
- Fale português do Brasil, de forma calorosa, ágil e concisa (máximo 2 a 3 frases por resposta) com toque ninja divertido (ex: "Bora, ninja? 🥢", "Deixa comigo! 🍣").
- Recomende sempre pratos reais do cardápio com preços reais.
- Respeite rigorosamente restrições alimentares do cliente (ex: se não come peixe cru, indique Hot Filadélfia, Uramaki Salmão Grelhado, Yakissoba ou Teppan).
- Se o cliente quiser fechar o pedido, diga que registrou e informe o valor e como pagar no Pix.
- Se você não souber a resposta com certeza ou for dúvida complexa de aluguel/evento/reclamação, transfira para a equipe humana.
${profileSummary}

Amostra do Cardápio Zuma:
${menuSummary}
${kbSummary}`;

  const conversationHistory = messages.map(m =>
    `${m.authorType === "cli" ? "Cliente" : m.authorType === "hum" ? "Equipe" : "Zumi"}: ${m.content}`
  ).join("\n");

  const prompt = `Histórico da conversa:
${conversationHistory}

O cliente ${customerName} disse por último: "${lastUserMsg}"
Carrinho atual: ${cart.length ? cart.map(i => `${i.q}x ${i.nome}`).join(", ") : "vazio"}.

Responda como Zumi:`;

  const aiText = await generateAiCompletion(prompt, systemInstruction);

  if (aiText) {
    // Detectar intenção de fechar pedido
    const isClosing = /fechad|link do pix|chave pix|já mandei pra cozinha|enviei o pedido|preparando seu pedido/i.test(aiText) || lowerMsg.includes("fecha o pedido") || lowerMsg.includes("pode fechar");

    // Detectar produto citado para adicionar ao carrinho
    let addedItem: { nome: string; preco: number; cat: string; q: number } | undefined;
    for (const item of ALL_ITEMS) {
      if (aiText.toLowerCase().includes(item.nome.toLowerCase()) && !cart.some(c => c.nome === item.nome)) {
        addedItem = { nome: item.nome, preco: item.preco, cat: item.cat, q: 1 };
        break;
      }
    }

    return {
      text: aiText,
      addedItem,
      closeOrder: isClosing
    };
  }

  // 4. Fallback inteligente de regras se a API externa não responder
  if (lowerMsg.includes("fecha") || lowerMsg.includes("finaliza") || lowerMsg.includes("pode mandar")) {
    return {
      text: "Fechado! Seu pedido já foi registrado e a cozinha começou o preparo. Te mandei a chave Pix zuma@kytto.com.br para acertar. Valeu, ninja! 🍣",
      closeOrder: true
    };
  }

  if (lowerMsg.includes("sem cru") || lowerMsg.includes("frito") || lowerMsg.includes("grelhado") || lowerMsg.includes("não come cru")) {
    const item = ALL_ITEMS.find(i => i.nome === "Hot Filadélfia (12un)")!;
    return {
      text: "Sem peixe cru, deixa comigo! Separei o clássico Hot Filadélfia (12un) por R$ 31,90, quentinho e crocante na farinha panko. Quer juntar uma sobremesa Hot Nutella pra acompanhar?",
      addedItem: { nome: item.nome, preco: item.preco, cat: item.cat, q: 1 }
    };
  }

  if (lowerMsg.includes("combo") || lowerMsg.includes("mais pedido") || lowerMsg.includes("sugest")) {
    const item = ALL_ITEMS.find(i => i.nome === "Combo 26 Peças")!;
    return {
      text: "O nosso campeão absoluto em Tangará é o Combo 26 Peças (R$ 69,90)! Já deixei reservado pra você. Uma coca gelada acompanha bem?",
      addedItem: { nome: item.nome, preco: item.preco, cat: item.cat, q: 1 }
    };
  }

  if (lowerMsg.includes("hora") || lowerMsg.includes("aberto") || lowerMsg.includes("entrega") || lowerMsg.includes("taxa")) {
    const bairro = customerProfile?.neighborhood || "seu bairro";
    return {
      text: `Entregamos de terça a domingo das 18h às 22h45! Para o ${bairro} a entrega chega em cerca de 40 a 50 minutos bem quentinha 🛵🥢`
    };
  }

  return {
    text: `Oi, ${customerName.split(" ")[0]}! Eu sou o Zumi, seu parceiro ninja no Zuma Cozinha Oriental 🐟 Me conta: quantas pessoas vão comer hoje e qual a vontade de vocês?`,
  };
}

export async function generateCampaignCopy(params: {
  segment: string;
  goal: string;
  dish: string;
  offer: string;
}): Promise<string> {
  const { segment, goal, dish, offer } = params;
  const prompt = `Escreva UMA mensagem curta e persuasiva de WhatsApp (até 220 caracteres) para clientes do restaurante Zuma Cozinha Oriental em Tangará da Serra/MT.
Assinada pelo mascote Zumi (um salmão ninja bem-humorado).
Público-alvo: ${segment}
Objetivo da campanha: ${goal}
Prato em destaque: ${dish}
Oferta: ${offer}
Regras: No máximo 2 emojis, tom pessoal e dinâmico, termine com o gatilho [link]. Retorne APENAS o texto da mensagem.`;

  const aiResult = await generateAiCompletion(prompt);
  if (aiResult) return aiResult.replace(/^["']|["']$/g, "").trim();

  return `Ei, ninja! O Zumi preparou algo especial pra você: ${dish} com ${offer.toLowerCase()} hoje! Aproveita que é só hoje: [link] 🍣🥢`;
}

export async function generateReviewReply(params: {
  platform: string;
  rating: number;
  comment: string;
  authorName?: string;
}): Promise<string> {
  const { platform, rating, comment, authorName } = params;
  const prompt = `Escreva uma resposta pública profissional e calorosa do restaurante Zuma Cozinha Oriental no tom do mascote Zumi para esta avaliação de ${rating} estrelas no ${platform}:
Comentário do cliente: "${comment}"
Autor: ${authorName || "Cliente"}
Regras: Máximo 280 caracteres, tom simpático, se for nota alta agradeça com alegria; se for crítica acolha com empatia sincera e cite melhorias práticas. Retorne apenas o texto da resposta.`;

  const aiResult = await generateAiCompletion(prompt);
  if (aiResult) return aiResult.replace(/^["']|["']$/g, "").trim();

  if (rating >= 4) {
    return `Que alegria ler isso! A equipe da cozinha ficou super orgulhosa 🐟 Muito obrigado pelo carinho e te esperamos de volta em breve com um mimo do Zumi!`;
  }
  return `Poxa, sentimos muito pela experiência. Isso não reflete o padrão que buscamos no Zuma. Já estamos alinhando com a equipe para aprimorar esse ponto. Nos chame no WhatsApp para prepararmos algo especial na próxima!`;
}
