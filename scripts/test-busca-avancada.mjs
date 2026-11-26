import 'dotenv/config';

async function testar() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const prompt = `Você é um perito analista de inteligência de fontes abertas (OSINT) e compliance bancário do BancoFé.
Seu dever é realizar uma BUSCA AVANÇADA DETALHADA E MINUCIOSA na internet para:
- Nome/Razão Social: RODRIGO RIBEIRO GONÇALVES
- CPF/CNPJ: 305.871.628-13 (CPF)
- Vínculos societários conhecidos: USINAS ITAMARATI S/A (UISA), RODRIGO RIBEIRO GONCALVES E OUTRA (ESTANCIA GONCALVES), KYTTO TECNOLOGIA
- Municípios/UF: Mirante do Paranapanema/SP, Nova Olímpia/MT

DIRETRIZ INEGOCIÁVEL: NUNCA invente informações. Se uma rede social não for encontrada ou for incerta/homônimo, declare 'nao_localizado' ou 'candidato_homonimo' com justificativa honesta.

Responda OBRIGATORIAMENTE E EXCLUSIVAMENTE em formato JSON cercado por \`\`\`json e \`\`\`.
A estrutura deve ser exatamente:
{
  "resumoExecutivo": "texto...",
  "consistenciaCadastral": { "score": 90, "nivel": "ALTA", "justificativa": "texto..." },
  "perfilSocial": {
    "redes": [
      {
        "rede": "LinkedIn",
        "status": "confirmado",
        "url": "https://pt.linkedin.com/in/rodrigorgonçalves",
        "identificador": "@rodrigorgonçalves",
        "titulo": "Diretor de Gente, Inovação e Administração na UISA",
        "detalhes": "texto...",
        "confianca": "ALTA"
      },
      {
        "rede": "Instagram",
        "status": "confirmado",
        "url": "https://www.instagram.com/rodrigoribgoncalves",
        "identificador": "@rodrigoribgoncalves",
        "titulo": "Perfil verificado",
        "detalhes": "texto...",
        "confianca": "ALTA"
      },
      {
        "rede": "TikTok",
        "status": "nao_localizado",
        "url": null,
        "identificador": null,
        "titulo": "Sem conta pública identificada",
        "detalhes": "Não foram localizadas contas ativas no TikTok.",
        "confianca": "ALTA"
      },
      {
        "rede": "Facebook",
        "status": "candidato_homonimo",
        "url": null,
        "identificador": null,
        "titulo": "Perfis homônimos não correlacionados",
        "detalhes": "texto...",
        "confianca": "MEDIA"
      },
      {
        "rede": "Twitter/X",
        "status": "nao_localizado",
        "url": null,
        "identificador": null,
        "titulo": "Sem conta verificada",
        "detalhes": "texto...",
        "confianca": "ALTA"
      },
      {
        "rede": "YouTube",
        "status": "confirmado",
        "url": "https://www.youtube.com",
        "identificador": "Entrevistas e palestras UISA",
        "titulo": "Participação em vídeos institucionais e webinars de tecnologia",
        "detalhes": "texto...",
        "confianca": "ALTA"
      }
    ],
    "analisePresencaDigital": "texto..."
  },
  "perfilProfissional": {
    "cargoAtual": "Diretor de Gente, Inovação e Administração",
    "empresaAtual": "USINAS ITAMARATI S/A (UISA)",
    "tempoExperiencia": "+19 anos em tecnologia, gestão e agronegócio",
    "trajetoria": [
      { "cargo": "...", "empresa": "...", "periodo": "...", "descricao": "..." }
    ],
    "formacaoAcademica": [
      { "curso": "...", "instituicao": "...", "grau": "..." }
    ],
    "premiosEReconhecimentos": [
      { "titulo": "Finalista do Prêmio Executivo de TI do Ano", "ano": "2022 e 2026", "entidade": "IT Forum" }
    ]
  },
  "perfilEconomico": {
    "portePredominante": "Grande Porte / Agronegócio e Pecuária",
    "patrimonioEstimadoFaixa": "Alta envergadura corporativa e patrimonial",
    "capacidadeEconomicaResumo": "texto..."
  },
  "presencaPublicaNoticias": [
    { "tipo": "Notícia", "titulo": "...", "fonte": "...", "url": "...", "data": "...", "trecho": "..." }
  ],
  "alertasDiligenciais": [],
  "conclusaoIdoneidade": "texto..."
}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    })
  });
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
  
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  if (match) {
    const rawJson = match[1] || match[0];
    try {
      const parsed = JSON.parse(rawJson);
      console.log('SUCCESS! Parsed JSON:');
      console.log('Resumo executivo:', parsed.resumoExecutivo?.slice(0, 100));
      console.log('Redes encontradas:', parsed.perfilSocial?.redes?.map(r => `${r.rede}: ${r.status} (${r.url || 'sem url'})`));
      console.log('Trajetória count:', parsed.perfilProfissional?.trajetoria?.length);
      console.log('Notícias count:', parsed.presencaPublicaNoticias?.length);
      return;
    } catch (e) {
      console.error('JSON Parse error:', e.message);
    }
  }
  console.log('Raw output:', text.slice(0, 500));
}

testar();
