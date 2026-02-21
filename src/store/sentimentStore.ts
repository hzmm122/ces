import { create } from 'zustand';
import type { SentimentItem, Statistics, FilterState } from '../types';

interface SentimentStore {
  sentiments: SentimentItem[];
  statistics: Statistics;
  filters: FilterState;
  sidebarCollapsed: boolean;
  loading: boolean;
  lastUpdate: string | null;
  
  fetchData: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  getFilteredSentiments: () => SentimentItem[];
}

const defaultFilters: FilterState = {
  sources: [],
  sentiment: 'all',
  timeRange: 'week',
  keyword: '',
  relatedStocks: [],
};

const defaultStatistics: Statistics = {
  totalCount: 0,
  todayCount: 0,
  yesterdayCount: 0,
  positiveRatio: 0,
  negativeRatio: 0,
  neutralRatio: 0,
  hotTopics: [],
  sourceDistribution: [],
  trendData: [],
};

export const useSentimentStore = create<SentimentStore>((set, get) => ({
  sentiments: [],
  statistics: defaultStatistics,
  filters: defaultFilters,
  sidebarCollapsed: false,
  loading: false,
  lastUpdate: null,

  fetchData: () => {
    set({ loading: true });
    
    import('../services/freeApi').then(({ getMarketSentiment, getStatistics }) => {
      const sentiments = getMarketSentiment();
      const statistics = getStatistics();
      
      set({
        sentiments,
        statistics,
        lastUpdate: new Date().toISOString(),
        loading: false,
      });
    }).catch(() => {
      set({ loading: false });
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  getFilteredSentiments: () => {
    const { sentiments, filters } = get();
    
    return sentiments.filter((item) => {
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) {
        return false;
      }
      
      if (filters.sentiment !== 'all' && item.sentiment !== filters.sentiment) {
        return false;
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (!item.title.toLowerCase().includes(keyword) && 
            !item.content.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      
      if (filters.relatedStocks.length > 0) {
        const hasStock = filters.relatedStocks.some(stock => 
          item.relatedStocks.includes(stock)
        );
        if (!hasStock) return false;
      }
      
      const itemDate = new Date(item.publishTime);
      const now = new Date();
      const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (filters.timeRange) {
        case 'today':
          return daysDiff <= 1;
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        case 'quarter':
          return daysDiff <= 90;
        case 'year':
          return daysDiff <= 365;
        default:
          return true;
      }
    });
  },
}));
