import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Star, Clock, Play, BookOpen, Layers } from "lucide-react";
import { Anime } from "../types";
import { fetchAnimeById, fetchAnimeEpisodes, fetchAnimeRelations } from "../services/jikanService";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const AnimeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      if (!id) return;
      setLoading(true);
      
      const savedData = localStorage.getItem("anime_tracker_data");
      const localState = savedData ? JSON.parse(savedData) : {};
      setIsFavorite(localState[id]?.isFavorite || false);

      const [details, eps, rels] = await Promise.all([
        fetchAnimeById(id),
        fetchAnimeEpisodes(id),
        fetchAnimeRelations(id)
      ]);
      setAnime(details);
      setEpisodes(eps);
      setRelations(rels);
      setLoading(false);
    }
    loadDetails();
  }, [id]);

  const toggleFavorite = () => {
    if (!anime || !id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    const savedData = localStorage.getItem("anime_tracker_data");
    const localState = savedData ? JSON.parse(savedData) : {};
    
    localState[id] = {
      ...(localState[id] || anime),
      isFavorite: newStatus,
      id: id
    };
    
    localStorage.setItem("anime_tracker_data", JSON.stringify(localState));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text-primary">
        <Loader2 className="text-accent animate-spin mb-4" size={48} />
        <p className="text-text-secondary animate-pulse">Carregando detalhes...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text-primary">
        <p className="text-text-secondary mb-4">Anime não encontrado.</p>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-accent hover:underline"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-20">
      {/* Hero Section */}
      <div className="relative h-[45vh] md:h-[40vh] w-full overflow-hidden">
        <img 
          src={anime.image} 
          alt={anime.title} 
          className="w-full h-full object-cover blur-xl opacity-30 scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end p-5 md:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end w-full text-center md:text-left">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-32 h-48 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-2xl border border-border shrink-0 bg-zinc-900"
            >
              <img 
                src={anime.image} 
                alt={anime.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="flex-1 space-y-3 md:space-y-4">
              <button 
                onClick={() => navigate(-1)}
                className="hidden md:flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm mb-2"
              >
                <ArrowLeft size={16} /> Voltar para a lista
              </button>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="font-serif text-2xl md:text-5xl lg:text-6xl leading-tight"
              >
                {anime.title}
              </motion.h1>
              
              <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start items-center">
                <button 
                  onClick={toggleFavorite}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-widest",
                    isFavorite 
                      ? "bg-yellow-400/20 border-yellow-400/50 text-yellow-400" 
                      : "bg-white/5 border-white/10 text-text-secondary hover:border-white/30"
                  )}
                >
                  <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
                  {isFavorite ? "Na sua Coleção" : "Adicionar aos Favoritos"}
                </button>

                <div className="flex flex-wrap gap-2">
                  {anime.genre.map(g => (
                    <span key={g} className="px-2 py-0.5 md:px-3 md:py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-accent">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden p-5 flex items-center justify-between border-b border-border bg-card/30">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{anime.studio}</span>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column: Info & Episodes */}
        <div className="lg:col-span-2 space-y-12">
          {/* Synopsis */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <BookOpen size={20} />
              <h2 className="font-serif text-2xl">Sinopse</h2>
            </div>
            <p className="text-text-secondary leading-relaxed text-lg">
              {anime.synopsis}
            </p>
          </section>

          {/* Episodes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent">
                <Play size={20} />
                <h2 className="font-serif text-2xl">Episódios</h2>
              </div>
              <span className="text-xs bg-zinc-900 px-3 py-1 rounded-full border border-border text-text-secondary">
                Total: {anime.totalEpisodes || episodes.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {episodes.length > 0 ? (
                episodes.map((ep) => (
                  <div key={ep.mal_id} className="p-4 bg-card border border-border rounded-xl hover:border-accent/30 transition-all group">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">EP {ep.mal_id.toString().padStart(2, '0')}</span>
                        <h4 className="font-medium text-sm group-hover:text-accent transition-colors">{ep.title}</h4>
                      </div>
                      <div className="text-[10px] text-text-secondary font-mono italic">
                        {ep.aired ? new Date(ep.aired).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </div>
                    {ep.filler && <span className="mt-2 inline-block px-2 py-0.5 bg-yellow-400/10 text-yellow-400 text-[9px] font-bold uppercase rounded">Filler</span>}
                  </div>
                ))
              ) : (
                <p className="text-text-secondary text-sm italic">Nenhuma informação de episódio disponível no momento.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Metadata & Relations */}
        <div className="space-y-10">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h3 className="font-serif text-xl border-b border-border pb-3">Informações</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary flex items-center gap-2"><Star size={14} /> Score</span>
                <span className="font-bold text-accent">{anime.rating.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary flex items-center gap-2"><Clock size={14} /> Lançamento</span>
                <span className="font-medium">{anime.releaseDay}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary flex items-center gap-2"><Layers size={14} /> Estúdio</span>
                <span className="font-medium">{anime.studio}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary uppercase text-[10px] font-bold tracking-widest">Status</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  anime.status === 'airing' ? "bg-success/10 text-success" : "bg-zinc-800 text-text-secondary"
                )}>
                  {anime.status === 'airing' ? 'Em exibição' : 'Finalizado'}
                </span>
              </div>
            </div>
          </div>

          {/* Relations / Season Manager */}
          {relations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl flex items-center gap-2"><Layers size={18} className="text-accent"/> Relacionados</h3>
              <div className="space-y-3">
                {relations.map((rel, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{rel.relation}</span>
                    <div className="flex flex-col gap-1">
                      {rel.entry.map((entry: any) => (
                        <div 
                          key={entry.mal_id}
                          onClick={() => entry.type === 'anime' && navigate(`/anime/${entry.mal_id}`)}
                          className={cn(
                            "text-xs p-2 rounded-lg border border-border bg-card/50",
                            entry.type === 'anime' ? "cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all" : "opacity-60"
                          )}
                        >
                          {entry.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
