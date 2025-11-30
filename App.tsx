import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { geminiService } from './services/geminiService';
import { SentimentData, ViewState, TrendingTopic } from './types';
import { Search, Loader2, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [topic, setTopic] = useState('');
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load trending topics on mount
    const fetchTrends = async () => {
      try {
        const trends = await geminiService.getTrendingTopics();
        setTrendingTopics(trends);
      } catch (e) {
        console.error("Failed to load trends", e);
      }
    };
    fetchTrends();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setViewState(ViewState.LOADING);
    setError(null);
    setSentimentData(null);

    try {
      const data = await geminiService.analyzeSentiment(topic);
      setSentimentData(data);
      setViewState(ViewState.ANALYZED);
    } catch (err) {
      setError("Failed to analyze sentiment. Please try again later.");
      setViewState(ViewState.ERROR);
    }
  };

  const handleTrendClick = (trendName: string) => {
    setTopic(trendName);
    // Needed to trigger the search with the new state
    // Using a timeout to allow state to update or just calling the service directly
    // Cleaner to just update state and call service.
    
    // Direct call strategy to avoid effect dependency hell
    setViewState(ViewState.LOADING);
    setError(null);
    setSentimentData(null);
    
    // We update input for visual feedback
    setTopic(trendName);

    geminiService.analyzeSentiment(trendName)
      .then(data => {
        setSentimentData(data);
        setViewState(ViewState.ANALYZED);
      })
      .catch(() => {
        setError("Failed to analyze sentiment.");
        setViewState(ViewState.ERROR);
      });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mb-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            Decode the Internet's Emotion
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time NLP analysis powered by Gemini 2.5. Enter a topic or choose a trending subject to uncover global sentiment instantly.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl p-1">
            <Search className="w-6 h-6 text-gray-400 ml-4" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., 'Bitcoin', 'New Marvel Movie', 'Remote Work')"
              className="w-full bg-transparent border-none text-white px-4 py-4 focus:ring-0 focus:outline-none placeholder-gray-500 text-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={viewState === ViewState.LOADING || !topic.trim()}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed m-1 flex items-center gap-2"
            >
              {viewState === ViewState.LOADING ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Analyze</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {viewState === ViewState.LOADING && (
           <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
             <div className="relative">
               <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-8 bg-primary/20 rounded-full blur-md"></div>
               </div>
             </div>
             <p className="text-gray-400 animate-pulse">Reading the internet...</p>
           </div>
        )}

        {/* Error State */}
        {viewState === ViewState.ERROR && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-200 mb-8 flex flex-col items-center">
            <AlertTriangle className="w-10 h-10 mb-2 opacity-80" />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {viewState === ViewState.ANALYZED && sentimentData && (
          <Dashboard data={sentimentData} />
        )}

        {/* Trending Topics (Only show if not analyzing/analyzed to keep UI clean, or show at bottom? Let's show when idle) */}
        {viewState === ViewState.IDLE && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-xl font-semibold text-white">Trending Now</h3>
            </div>
            
            {trendingTopics.length === 0 ? (
              <div className="text-gray-500 italic">Loading trends...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {trendingTopics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTrendClick(t.name)}
                    className="group relative overflow-hidden bg-surface border border-white/5 p-4 rounded-xl text-left hover:border-primary/50 hover:bg-white/5 transition-all duration-300"
                  >
                    <span className="text-xs font-mono text-primary mb-1 block opacity-70 group-hover:opacity-100">
                      {t.category}
                    </span>
                    <span className="text-gray-200 font-medium group-hover:text-white truncate block">
                      {t.name}
                    </span>
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
