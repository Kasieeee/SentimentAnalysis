import { GoogleGenAI } from "@google/genai";
import { SentimentData, TrendingTopic, GroundingSource } from "../types";

const apiKey = process.env.API_KEY;

// Helper to clean markdown from response if present
const cleanText = (text: string) => text.replace(/\*\*/g, '').trim();

export const geminiService = {
  /**
   * Fetches current trending topics using Google Search grounding.
   */
  async getTrendingTopics(): Promise<TrendingTopic[]> {
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "What are the top 6 trending specific topics or news headlines right now globally? Return a simple list. Format each line as: Category: Topic Name.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const lines = text.split('\n').filter(line => line.includes(':'));
      
      const topics: TrendingTopic[] = lines.slice(0, 6).map((line, index) => {
        const [category, name] = line.split(':').map(s => s.trim());
        return {
          id: `trend-${index}`,
          category: cleanText(category || "General"),
          name: cleanText(name || line)
        };
      });

      return topics;
    } catch (error) {
      console.error("Error fetching trends:", error);
      // Fallback data if API fails or search is unavailable
      return [
        { id: '1', category: 'Tech', name: 'Artificial Intelligence' },
        { id: '2', category: 'Space', name: 'SpaceX Starship' },
        { id: '3', category: 'Climate', name: 'Global Renewable Energy' },
      ];
    }
  },

  /**
   * Analyzes the sentiment of a specific topic using Google Search for context.
   * Parses a structured text response since JSON mode + Search is restricted.
   */
  async analyzeSentiment(topic: string): Promise<SentimentData> {
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Perform a sentiment analysis on the topic: "${topic}".
      Use Google Search to find the latest news, opinions, and discussions.
      
      Strictly follow this output format (do not use markdown for keys):
      CLASSIFICATION: <Positive, Negative, or Neutral>
      SCORE: <A number between -100 (very negative) and 100 (very positive)>
      SUMMARY: <A concise summary of the general sentiment, max 3 sentences>
      KEY_POINTS:
      - <Point 1>
      - <Point 2>
      - <Point 3>
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      
      // Extract grounding sources
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({ uri: chunk.web.uri, title: chunk.web.title });
          }
        });
      }

      // Manual Parsing of the structured text
      const classificationMatch = text.match(/CLASSIFICATION:\s*(.*)/i);
      const scoreMatch = text.match(/SCORE:\s*(-?\d+)/i);
      const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=KEY_POINTS:|$)/i);
      
      const keyPoints: string[] = [];
      const pointsSection = text.split(/KEY_POINTS:/i)[1];
      if (pointsSection) {
        pointsSection.split('\n').forEach(line => {
          const cleaned = line.trim().replace(/^-\s*/, '');
          if (cleaned) keyPoints.push(cleaned);
        });
      }

      const classification = (classificationMatch?.[1]?.trim() as 'Positive' | 'Negative' | 'Neutral') || 'Neutral';
      let score = parseInt(scoreMatch?.[1] || "0", 10);
      
      // Safety clamp
      if (score > 100) score = 100;
      if (score < -100) score = -100;

      return {
        topic,
        classification,
        score,
        summary: summaryMatch?.[1]?.trim() || "Analysis not available.",
        keyPoints: keyPoints.slice(0, 5),
        sources,
        analyzedAt: new Date().toLocaleTimeString(),
      };

    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      throw error;
    }
  }
};
