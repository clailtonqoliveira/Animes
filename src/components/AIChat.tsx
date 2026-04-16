import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Bot, Loader2, Sparkles } from "lucide-react";
import { processAICall } from "../services/aiService";
import { Anime } from "../types";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AIChatProps {
  currentAnimes: Anime[];
  onUpdateProgress: (id: string, episodes: number) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
}

const AIChat: React.FC<AIChatProps> = ({ currentAnimes, onUpdateProgress, onToggleFavorite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Olá! Como posso te ajudar com seus animes hoje?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      // Convert history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await processAICall(userMsg, currentAnimes, history);
      
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === "updateProgress") {
            const { animeId, episodes } = call.args as { animeId: string, episodes: number };
            onUpdateProgress(animeId, episodes);
          } else if (call.name === "toggleFavorite") {
            const { animeId, favorite } = call.args as { animeId: string, favorite: boolean };
            onToggleFavorite(animeId, favorite);
          }
        }
      }

      setMessages(prev => [...prev, { role: "model", text: response.text || "Entendido! Ação concluída." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", text: "Ops, tive um erro ao processar seu pedido. Tente novamente!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] h-[450px] bg-[#0c0c0c] border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-accent/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot size={18} className="text-bg" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary">Gemini Assistant</h3>
                  <p className="text-[10px] text-success font-medium">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    m.role === "user" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed",
                    m.role === "user" 
                      ? "bg-accent text-bg font-medium" 
                      : "bg-zinc-900 border border-border text-text-primary"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-text-secondary text-[10px] animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  Gemini está processando...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-[#080808]">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Diga 'Assisti o ep 5 de...'"
                  className="w-full bg-card border border-border rounded-xl py-2 pl-3 pr-10 text-xs focus:outline-none focus:border-accent transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-accent hover:scale-110 transition-transform"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          isOpen ? "bg-zinc-900 text-text-primary" : "bg-accent text-bg"
        )}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </motion.button>
    </div>
  );
};

export default AIChat;
