export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SentimentData {
  topic: string;
  classification: 'Positive' | 'Negative' | 'Neutral';
  score: number; // -100 to 100
  summary: string;
  keyPoints: string[];
  sources: GroundingSource[];
  analyzedAt: string;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
}

export enum ViewState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ANALYZED = 'ANALYZED',
  ERROR = 'ERROR'
}