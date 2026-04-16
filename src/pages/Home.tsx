import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Menu, X as CloseIcon, Star } from "lucide-react";
import { Anime } from "../types";
import { fetchCurrentSeasonAnime, searchAnime, fetchSchedules, fetchTopAnime } from "../services/jikanService";
import AnimeCard from "../components/AnimeCard";
import AIChat from "../components/AIChat";
import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "motion/react";

const Home: React.FC = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'calendar' | 'library'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadTabData() {
      setLoading(true);
      let data: Anime[] = [];
      
      const savedData = localStorage.getItem("anime_tracker_data");
      const localState = savedData ? JSON.parse(savedData) : {};

      if (activeTab === 'calendar') {
        data = await fetchSchedules();
      } else if (activeTab === 'library') {
        data = await fetchTopAnime();
      } else {
        data = await fetchCurrentSeasonAnime();
      }
      
      const initializedAnimes = (data || []).map((a: Anime) => ({
        ...a,
        watchedEpisodes: localState[a.id]?.watchedEpisodes || 0,
        isFavorite: localState[a.id]?.isFavorite || false,
      }));

      setAnimes(initializedAnimes);
      setLoading(false);
    }

    if (searchQuery.trim().length === 0) {
      loadTabData();
    }
  }, [activeTab]);

  // Handle Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        const results = await searchAnime(searchQuery);
        
        const savedData = localStorage.getItem("anime_tracker_data");
        const localState = savedData ? JSON.parse(savedData) : {};

        const initializedResults = (results || []).map((a: Anime) => ({
          ...a,
          watchedEpisodes: localState[a.id]?.watchedEpisodes || 0,
          isFavorite: localState[a.id]?.isFavorite || false,
        }));

        setAnimes(initializedResults);
        setIsSearching(false);
      } else if (searchQuery.trim().length === 0 && !loading) {
        // Reload appropriate data based on tab if search is cleared
        setLoading(true);
        
        const savedData = localStorage.getItem("anime_tracker_data");
        const localState = savedData ? JSON.parse(savedData) : {};

        let data: Anime[] = [];
        if (activeTab === 'calendar') {
          data = await fetchSchedules();
        } else if (activeTab === 'library') {
          data = await fetchTopAnime();
        } else {
          data = await fetchCurrentSeasonAnime();
        }
        
        setAnimes((data || []).map((a: Anime) => ({
          ...a,
          watchedEpisodes: localState[a.id]?.watchedEpisodes || 0,
          isFavorite: localState[a.id]?.isFavorite || false,
        })));
        setLoading(false);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  // Save helper to ensure atomic updates
  const saveAnimeState = (id: string, updates: Partial<Anime>, fullAnime?: Anime) => {
    const savedData = localStorage.getItem("anime_tracker_data");
    const localState = savedData ? JSON.parse(savedData) : {};
    
    const existing = localState[id] || (fullAnime ? { ...fullAnime } : {});
    
    localState[id] = {
      ...existing,
      ...updates,
      id: id // ensure ID is preserved
    };
    
    localStorage.setItem("anime_tracker_data", JSON.stringify(localState));
  };

  const handleToggleFavorite = (id: string, explicitFavorite?: boolean, animeData?: Anime) => {
    const idStr = id.toString();
    const animeToUpdate = animeData || animes.find(a => a.id.toString() === idStr);
    const currentFavoriteStatus = animeToUpdate ? animeToUpdate.isFavorite : false;
    const newFavoriteStatus = explicitFavorite !== undefined ? explicitFavorite : !currentFavoriteStatus;

    setAnimes(prev => prev.map(a => 
      a.id.toString() === idStr ? { ...a, isFavorite: newFavoriteStatus } : a
    ));

    saveAnimeState(idStr, { isFavorite: newFavoriteStatus }, animeToUpdate);
  };

  const handleUpdateProgress = (id: string, episodes: number) => {
    const animeToUpdate = animes.find(a => a.id === id);
    
    setAnimes(prev => prev.map(a => 
      a.id === id ? { ...a, watchedEpisodes: episodes } : a
    ));

    if (animeToUpdate) {
      saveAnimeState(id, { watchedEpisodes: episodes }, animeToUpdate);
    }
  };

  const filteredAnimes = useMemo(() => {
    let result = animes;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        (a.title && a.title.toLowerCase().includes(query)) ||
        (a.alternativeTitle && a.alternativeTitle.toLowerCase().includes(query)) ||
        (a.genre && a.genre.some(g => g.toLowerCase().includes(query)))
      );
    }

    return [...result].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.rating - a.rating;
    });
  }, [animes, activeTab, searchQuery]);

  return (
    <div className="flex min-h-screen bg-bg text-text-primary font-sans relative overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[240px] bg-[#080808] border-r border-border p-8 flex-col gap-10 sticky top-0 h-screen">
        <div className="font-serif italic text-2xl tracking-tight text-accent border-b border-border pb-4">
          AnimeTracker
        </div>
        
        <nav>
          <ul className="space-y-5">
            <li 
              onClick={() => setActiveTab('all')}
              className={cn(
                "flex items-center gap-3 text-sm font-medium cursor-pointer transition-colors",
                activeTab === 'all' ? "text-accent" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span className="text-[10px]">{activeTab === 'all' ? '●' : '○'}</span>
              Primavera 2026
            </li>
            <li 
              onClick={() => setActiveTab('calendar')}
              className={cn(
                "flex items-center gap-3 text-sm font-medium cursor-pointer transition-colors",
                activeTab === 'calendar' ? "text-accent" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span className="text-[10px]">{activeTab === 'calendar' ? '●' : '○'}</span>
              Calendário
            </li>
            <li 
              onClick={() => setActiveTab('library')}
              className={cn(
                "flex items-center gap-3 text-sm font-medium cursor-pointer transition-colors",
                activeTab === 'library' ? "text-accent" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span className="text-[10px]">{activeTab === 'library' ? '●' : '○'}</span>
              Biblioteca Global
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-text-secondary cursor-not-allowed opacity-50">
              <span className="text-[10px]">○</span> Histórico
            </li>
          </ul>
        </nav>

        <div className="mt-auto p-4 bg-accent/5 border border-accent-glow rounded-xl text-[11px] leading-relaxed">
          <strong className="text-accent block mb-1">Gemini AI Active</strong>
          <span className="text-text-secondary">Sincronizando dados em tempo real...</span>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0c0c0c] z-[70] p-8 flex flex-col gap-10 md:hidden border-r border-border"
            >
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div className="font-serif italic text-2xl tracking-tight text-accent">
                  AnimeTracker
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary">
                  <CloseIcon size={20} />
                </button>
              </div>

              <nav>
                <ul className="space-y-6">
                  {[
                    { id: 'all', label: 'Primavera 2026' },
                    { id: 'calendar', label: 'Calendário' },
                    { id: 'library', label: 'Biblioteca Global' }
                  ].map((tab) => (
                    <li 
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-4 text-base font-medium transition-colors",
                        activeTab === tab.id ? "text-accent" : "text-text-secondary"
                      )}
                    >
                      <span className="text-xs">{activeTab === tab.id ? '●' : '○'}</span>
                      {tab.label}
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="space-y-1">
              <h1 className="font-serif text-2xl md:text-3xl font-normal">
                {activeTab === 'all' ? 'Em Exibição Agora' : 
                 activeTab === 'calendar' ? 'Calendário Semanal' : 'Biblioteca Global'}
              </h1>
              <p className="text-text-secondary text-[11px] md:text-sm uppercase tracking-widest">
                {activeTab === 'library' ? 'Clássicos e Populares' :
                 'Temporada de Primavera • 2026'}
              </p>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 bg-card border border-border rounded-lg text-accent"
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input
                type="text"
                placeholder="Pesquisar animes..."
                className="bg-card border border-border rounded-xl md:rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-accent transition-all w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {loading || isSearching ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="text-accent animate-spin" size={48} />
            <p className="text-text-secondary font-medium animate-pulse">
              Carregando dados...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAnimes.map((anime: Anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredAnimes.length === 0 && (
          <div className="text-center py-32">
            <p className="text-text-secondary text-lg">Nenhum anime encontrado.</p>
          </div>
        )}
      </main>

      <AIChat 
        currentAnimes={animes} 
        onUpdateProgress={handleUpdateProgress}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
};

export default Home;
