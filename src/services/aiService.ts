import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Anime } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Function declarations for Gemini
export const animeTools: FunctionDeclaration[] = [
  {
    name: "updateProgress",
    parameters: {
      type: Type.OBJECT,
      description: "Atualiza o número de episódios assistidos de um anime.",
      properties: {
        animeId: {
          type: Type.STRING,
          description: "O ID único do anime (geralmente malId em string).",
        },
        episodes: {
          type: Type.NUMBER,
          description: "O NOVO número total de episódios assistidos.",
        },
      },
      required: ["animeId", "episodes"],
    },
  },
  {
    name: "toggleFavorite",
    parameters: {
      type: Type.OBJECT,
      description: "Marca ou desmarca um anime como favorito.",
      properties: {
        animeId: {
          type: Type.STRING,
          description: "O ID único do anime.",
        },
        favorite: {
          type: Type.BOOLEAN,
          description: "True para favoritar, False para remover dos favoritos.",
        },
      },
      required: ["animeId", "favorite"],
    },
  },
];

export async function processAICall(
  prompt: string, 
  currentAnimes: Anime[], 
  history: any[] = []
) {
  const model = "gemini-3-flash-preview";
  
  // Create a context summary of current animes
  const animeContext = currentAnimes.map(a => 
    `ID: ${a.id}, Título: ${a.title}${a.alternativeTitle ? ` (Alt: ${a.alternativeTitle})` : ""}, Progresso: ${a.watchedEpisodes}/${a.totalEpisodes}, Favorito: ${a.isFavorite}`
  ).join("\n");

  const systemInstruction = `
    Você é o Assistente do AnimeTracker. Seu objetivo é ajudar o usuário a gerenciar sua lista de animes.
    Ao receber comandos como "assisti 2 eps de X" ou "favorita Y", você deve usar as ferramentas fornecidas.
    
    Contexto atual dos animes na tela:
    ${animeContext}

    Regras:
    1. Se o usuário mencionar um anime pelo título, encontre o ID correspondente no contexto.
    2. Seja amigável e responda em Português (Brasil).
    3. Se houver dúvida sobre qual anime se trata, peça esclarecimento.
    4. Confirme sempre a ação realizada.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: animeTools }],
      },
    });

    return response;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
