import { Anime } from "../types";

const BASE_URL = "https://api.jikan.moe/v4";

function mapJikanToAnime(item: any): Anime {
  const dayMap: Record<string, string> = {
    "mondays": "Segunda-feira",
    "tuesdays": "Terça-feira",
    "wednesdays": "Quarta-feira",
    "thursdays": "Quinta-feira",
    "fridays": "Sexta-feira",
    "saturdays": "Sábado",
    "sundays": "Domingo"
  };

  const rawDay = (item.broadcast?.day || "N/A").toLowerCase();
  const releaseDay = dayMap[rawDay] || item.broadcast?.day || "N/A";

  return {
    id: item.mal_id.toString(),
    malId: item.mal_id,
    title: item.title,
    alternativeTitle: item.title_english || item.title_japanese || null,
    image: item.images.webp.large_image_url || item.images.jpg.large_image_url,
    releaseDay,
    latestEpisode: item.episodes || 0, // Fallback to total if we don't have airing count
    totalEpisodes: item.episodes || 0,
    watchedEpisodes: 0,
    genre: item.genres?.map((g: any) => g.name) || [],
    studio: item.studios?.[0]?.name || "Desconhecido",
    rating: item.score || 0,
    synopsis: item.synopsis || "Sem sinopse disponível.",
    isFavorite: false,
    status: item.status?.toLowerCase().includes("currently") || item.airing ? 'airing' : 
            item.status?.toLowerCase().includes("not yet") || item.status?.toLowerCase().includes("upcoming") ? 'upcoming' : 'finished',
  };
}

export async function fetchCurrentSeasonAnime(): Promise<Anime[]> {
  try {
    const response = await fetch(`${BASE_URL}/seasons/now`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) return [];
    
    // Deduplicate by mal_id
    const seen = new Set();
    const uniqueAnimes = data.data.filter((item: any) => {
      if (seen.has(item.mal_id)) return false;
      seen.add(item.mal_id);
      return true;
    }).map(mapJikanToAnime);
    
    return uniqueAnimes;
  } catch (error) {
    console.error("Error fetching from Jikan:", error);
    return [];
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const response = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) return [];
    
    // Deduplicate by mal_id
    const seen = new Set();
    const uniqueAnimes = data.data.filter((item: any) => {
      if (seen.has(item.mal_id)) return false;
      seen.add(item.mal_id);
      return true;
    }).map(mapJikanToAnime);

    return uniqueAnimes;
  } catch (error) {
    console.error("Error searching Jikan:", error);
    return [];
  }
}

export async function fetchSchedules(): Promise<Anime[]> {
  try {
    const response = await fetch(`${BASE_URL}/schedules`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) return [];

    // Deduplicate by mal_id
    const seen = new Set();
    const uniqueAnimes = data.data.filter((item: any) => {
      if (seen.has(item.mal_id)) return false;
      seen.add(item.mal_id);
      return true;
    }).map(mapJikanToAnime);

    return uniqueAnimes;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
}

export async function fetchAnimeById(id: string): Promise<Anime | null> {
  try {
    const response = await fetch(`${BASE_URL}/anime/${id}`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const { data } = await response.json();
    return data ? mapJikanToAnime(data) : null;
  } catch (error) {
    console.error("Error fetching anime by id:", error);
    return null;
  }
}

export async function fetchAnimeEpisodes(id: string): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/anime/${id}/episodes`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching anime episodes:", error);
    return [];
  }
}

export async function fetchAnimeRelations(id: string): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/anime/${id}/relations`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching anime relations:", error);
    return [];
  }
}

export async function fetchTopAnime(): Promise<Anime[]> {
  try {
    const response = await fetch(`${BASE_URL}/top/anime?limit=25`);
    if (!response.ok) throw new Error(`Jikan API error: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) return [];

    // Deduplicate by mal_id
    const seen = new Set();
    const uniqueAnimes = data.data.filter((item: any) => {
      if (seen.has(item.mal_id)) return false;
      seen.add(item.mal_id);
      return true;
    }).map(mapJikanToAnime);

    return uniqueAnimes;
  } catch (error) {
    console.error("Error fetching top anime:", error);
    return [];
  }
}
