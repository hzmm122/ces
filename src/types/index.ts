export type SourceType = 'exchange' | 'cninfo' | 'stats' | 'association';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type AnnouncementType = 
  | '业绩预告'
  | '增减持'
  | '并购重组'
  | '监管处罚'
  | '股权质押'
  | '分红送转'
  | '配股发行'
  | '人事变动'
  | '重大合同'
  | '其他';

export type NewsCategory = 
  | '宏观经济'
  | '行业动态'
  | '政策法规'
  | '公司新闻'
  | '市场评论'
  | '监管动态';

export type PolicyTag = 
  | '数字金融'
  | '供应链金融'
  | 'AI安全应用'
  | '新能源'
  | '半导体'
  | '生物医药'
  | '新材料';

export interface SentimentItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: SourceType;
  sourceName: string;
  url: string;
  publishTime: string;
  sentiment: SentimentType;
  sentimentScore: number;
  relatedStocks: string[];
  heatIndex: number;
  category: NewsCategory;
  tags: string[];
}

export interface Announcement {
  id: string;
  stockCode: string;
  stockName: string;
  title: string;
  content: string;
  summary: string;
  type: AnnouncementType;
  publishTime: string;
  source: string;
  url: string;
  sentiment: SentimentType;
  sentimentScore: number;
  impactDirection: '利好' | '利空' | '中性';
  relatedStocks: string[];
  keyPoints: string[];
}

export interface PolicyNews {
  id: string;
  title: string;
  content: string;
  source: string;
  publishTime: string;
  url: string;
  tags: PolicyTag[];
  affectedIndustries: string[];
  affectedStocks: string[];
  impactLevel: 'high' | 'medium' | 'low';
}

export interface MarketSentiment {
  date: string;
  upCount: number;
  downCount: number;
  limitUpCount: number;
  limitDownCount: number;
  northboundFlow: number;
  marginFlow: number;
  sentimentIndex: number;
  cycle: '冰点' | '修复' | '高潮' | '退潮';
}

export interface DragonStock {
  id: string;
  name: string;
  code: string;
  days: number;
  concept: string;
  startDate: string;
  currentPrice: number;
  changePercent: number;
}

export interface TradeRecord {
  id: string;
  stockCode: string;
  stockName: string;
  action: '买入' | '卖出';
  price: number;
  quantity: number;
  time: string;
  reason: string;
  pnl?: number;
}

export interface StrategyAttribution {
  id: string;
  recordId: string;
  factors: {
    announcement: number;
    policy: number;
    liquidity: number;
    sentiment: number;
    technical: number;
  };
  analysis: string;
  suggestions: string[];
}

export interface HotConcept {
  name: string;
  heat: number;
  trend: 'up' | 'down' | 'stable';
  relatedStocks: string[];
  duration: number;
}

export interface FundFlow {
  date: string;
  northbound: number;
  southbound: number;
  margin: number;
  mainForce: number;
}

export interface Statistics {
  totalCount: number;
  todayCount: number;
  yesterdayCount: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  hotTopics: Array<{ name: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  sourceDistribution: Array<{ name: string; value: number; color: string }>;
  trendData: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  }>;
}

export interface FilterState {
  sources: SourceType[];
  sentiment: SentimentType | 'all';
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year';
  keyword: string;
  relatedStocks: string[];
  announcementTypes?: AnnouncementType[];
  policyTags?: PolicyTag[];
}
