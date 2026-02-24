import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PromptAnalyticsEntry {
  id: string;
  text: string;
  timesUsed: number;
  timesSucceeded: number;
  timesModerated: number;
  lastUsed: number;
  avgGenerationTime?: number;
  totalGenerationTime?: number;
  generationCount?: number;
}

interface AnalyticsState {
  entries: PromptAnalyticsEntry[];
  trackPromptUsed: (text: string) => void;
  trackPromptSuccess: (text: string, generationTime?: number) => void;
  trackPromptModerated: (text: string) => void;
  getTopPrompts: (limit?: number) => PromptAnalyticsEntry[];
  getPromptStats: (text: string) => PromptAnalyticsEntry | undefined;
  clearAnalytics: () => void;
}

const generateId = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `prompt-${Math.abs(hash)}`;
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      entries: [],

      trackPromptUsed: (text) => {
        if (!text.trim()) return;
        
        const id = generateId(text);
        set((state) => {
          const existing = state.entries.find((e) => e.id === id);
          if (existing) {
            return {
              entries: state.entries.map((e) =>
                e.id === id
                  ? { ...e, timesUsed: e.timesUsed + 1, lastUsed: Date.now() }
                  : e
              ),
            };
          }
          return {
            entries: [
              ...state.entries,
              {
                id,
                text,
                timesUsed: 1,
                timesSucceeded: 0,
                timesModerated: 0,
                lastUsed: Date.now(),
              },
            ],
          };
        });
      },

      trackPromptSuccess: (text, generationTime) => {
        if (!text.trim()) return;
        
        const id = generateId(text);
        set((state) => {
          const existing = state.entries.find((e) => e.id === id);
          if (existing) {
            const newGenerationCount = (existing.generationCount || 0) + 1;
            const newTotalTime = (existing.totalGenerationTime || 0) + (generationTime || 0);
            return {
              entries: state.entries.map((e) =>
                e.id === id
                  ? {
                      ...e,
                      timesSucceeded: e.timesSucceeded + 1,
                      generationCount: newGenerationCount,
                      totalGenerationTime: newTotalTime,
                      avgGenerationTime: newTotalTime / newGenerationCount,
                    }
                  : e
              ),
            };
          }
          return {
            entries: [
              ...state.entries,
              {
                id,
                text,
                timesUsed: 1,
                timesSucceeded: 1,
                timesModerated: 0,
                lastUsed: Date.now(),
                generationCount: 1,
                totalGenerationTime: generationTime || 0,
                avgGenerationTime: generationTime || 0,
              },
            ],
          };
        });
      },

      trackPromptModerated: (text) => {
        if (!text.trim()) return;
        
        const id = generateId(text);
        set((state) => {
          const existing = state.entries.find((e) => e.id === id);
          if (existing) {
            return {
              entries: state.entries.map((e) =>
                e.id === id
                  ? { ...e, timesModerated: e.timesModerated + 1 }
                  : e
              ),
            };
          }
          return {
            entries: [
              ...state.entries,
              {
                id,
                text,
                timesUsed: 1,
                timesSucceeded: 0,
                timesModerated: 1,
                lastUsed: Date.now(),
              },
            ],
          };
        });
      },

      getTopPrompts: (limit = 10) => {
        const { entries } = get();
        return [...entries]
          .sort((a, b) => {
            const aScore = a.timesSucceeded - a.timesModerated;
            const bScore = b.timesSucceeded - b.timesModerated;
            return bScore - aScore;
          })
          .slice(0, limit);
      },

      getPromptStats: (text) => {
        const id = generateId(text);
        return get().entries.find((e) => e.id === id);
      },

      clearAnalytics: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'imaginegodmode-analytics',
    }
  )
);
