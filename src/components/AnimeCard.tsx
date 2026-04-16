import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Star, Play, Info, ExternalLink } from "lucide-react";
import { Anime } from "../types";
import { cn } from "../lib/utils";

interface AnimeCardProps {
  anime: Anime;
  onToggleFavorite: (id: string, explicitFavorite?: boolean, animeData?: Anime) => void;
  onUpdateProgress: (id: string, episodes: number) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onToggleFavorite, onUpdateProgress }) => {
  const progressPercentage = (anime.watchedEpisodes / anime.totalEpisodes) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent/40"
    >
      {/* Image Container */}
      <div className="relative h-[180px] overflow-hidden bg-zinc-900 group/img">
        <Link to={`/anime/${anime.id}`}>
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110 opacity-70 group-hover/img:opacity-90"
            referrerPolicy="no-referrer"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
        
        {/* Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite(anime.id, undefined, anime)}
            className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-yellow-400 transition-transform hover:scale-110 active:scale-95 shadow-lg"
            title={anime.isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          >
            <Star size={16} fill={anime.isFavorite ? "currentColor" : "none"} />
          </button>
          <Link
            to={`/anime/${anime.id}`}
            className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-accent transition-transform hover:scale-110 shadow-lg"
            title="Ver Detalhes"
          >
            <ExternalLink size={16} />
          </Link>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 bg-black/80 px-2 py-1 rounded text-xs font-bold text-accent">
          {anime.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 flex-grow">
        <div className="space-y-1">
          <h3 className="font-semibold text-text-primary text-base line-clamp-1 group-hover:text-accent transition-colors" title={anime.title}>
            {anime.title}
          </h3>
          {anime.alternativeTitle && anime.alternativeTitle !== anime.title && (
            <p className="text-[10px] text-text-secondary line-clamp-1 italic -mt-1" title={anime.alternativeTitle}>
              {anime.alternativeTitle}
            </p>
          )}
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-text-secondary font-medium pt-1">
            <span>{anime.studio}</span>
            <span>{anime.releaseDay}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-text-secondary">Progresso</span>
            <span className="text-text-primary">{anime.watchedEpisodes.toString().padStart(2, '0')} / {anime.totalEpisodes.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-accent shadow-[0_0_8px_var(--color-accent-glow)]"
            />
          </div>
          <div className="text-[10px] text-success font-medium">
            {anime.status === 'airing' ? (
              <span>Lançamento: {anime.releaseDay}</span>
            ) : (
              <span>Finalizado: {anime.totalEpisodes} Eps</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onUpdateProgress(anime.id, anime.totalEpisodes > 0 ? Math.min(anime.watchedEpisodes + 1, anime.totalEpisodes) : anime.watchedEpisodes + 1)}
          className="w-full py-2.5 bg-zinc-900 border border-border rounded-xl text-xs font-bold text-text-primary hover:bg-accent hover:text-bg hover:border-accent transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Play size={12} fill="currentColor" />
          {anime.watchedEpisodes === 0 ? "Começar a Assistir" : "Próximo Episódio"}
        </button>
      </div>
    </motion.div>
  );
};

export default AnimeCard;
