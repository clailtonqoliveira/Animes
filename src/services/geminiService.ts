import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function fetchCurrentSeasonAnime() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "List the top 5 most popular animes airing in April 2026 (Spring 2026 season). For each, provide: title, release day, latest episode number, total episodes, genres, studio, rating (0-10), and a brief synopsis. Format as JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              image: { type: Type.STRING, description: "A high quality anime poster URL" },
              releaseDay: { type: Type.STRING },
              latestEpisode: { type: Type.NUMBER },
              totalEpisodes: { type: Type.NUMBER },
              genre: { type: Type.ARRAY, items: { type: Type.STRING } },
              studio: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              synopsis: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["airing", "finished", "upcoming"] },
            },
            required: ["id", "title", "image", "releaseDay", "latestEpisode", "totalEpisodes", "genre", "studio", "rating", "synopsis", "status"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching anime data:", error);
    return [];
  }
}
