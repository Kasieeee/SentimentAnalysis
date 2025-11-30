import React from 'react';
import { SentimentData } from '../types';
import { SentimentGauge } from './SentimentGauge';
import { ExternalLink, Quote, TrendingUp, AlertCircle, Info } from 'lucide-react';

interface DashboardProps {
  data: SentimentData | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{data.topic}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analysis generated at {data.analyzedAt}
            </p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
            data.classification === 'Positive' ? 'bg-success/10 border-success/20 text-success' :
            data.classification === 'Negative' ? 'bg-accent/10 border-accent/20 text-accent' :
            'bg-primary/10 border-primary/20 text-primary'
          }`}>
            {data.classification} Sentiment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge & Score */}
        <div className="lg:col-span-1 bg-surface rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
          <h3 className="text-lg font-semibold text-gray-300 mb-4 z-10 w-full text-center">Sentiment Score</h3>
          <SentimentGauge score={data.score} classification={data.classification} />
          <p className="text-xs text-center text-gray-500 mt-2 max-w-[200px]">
            Scale from -100 (Very Negative) to +100 (Very Positive) based on collected data.
          </p>
        </div>

        {/* Summary & Key Points */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-lg">
             <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-200">Executive Summary</h3>
             </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              {data.summary}
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <Quote className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-200">Key Insights</h3>
            </div>
            <div className="grid gap-3">
              {data.keyPoints.map((point, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-background/50 border border-white/5 hover:border-primary/30 transition-colors">
                  <div className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold font-mono">
                    {i + 1}
                  </div>
                  <p className="text-gray-300 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      {data.sources.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-gray-400" />
            Sources & Grounding
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-4 rounded-xl bg-background border border-white/5 hover:border-primary/50 transition-all duration-200 flex flex-col justify-between h-full"
              >
                <span className="text-sm font-medium text-gray-300 line-clamp-2 group-hover:text-primary transition-colors">
                  {source.title}
                </span>
                <span className="text-xs text-gray-500 mt-3 truncate font-mono">
                  {new URL(source.uri).hostname}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
