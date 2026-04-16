export interface Anime {
  id: string;
  malId: number;
  title: string;
  alternativeTitle: string | null;
  image: string;
  releaseDay: string;
  latestEpisode: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  genre: string[];
  studio: string;
  rating: number;
  synopsis: string;
  isFavorite: boolean;
  status: 'airing' | 'finished' | 'upcoming';
}

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface SeasonInfo {
  season: Season;
  year: number;
}
