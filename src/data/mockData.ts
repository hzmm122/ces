import { SentimentItem, Statistics, SourceType, NewsCategory } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const sources: { type: SourceType; name: string }[] = [
  { type: 'exchange', name: '上海证券交易所' },
  { type: 'exchange', name: '深圳证券交易所' },
  { type: 'exchange', name: '北京证券交易所' },
  { type: 'cninfo', name: '巨潮资讯网' },
  { type: 'stats', name: '国家统计局' },
  { type: 'association', name: '中国证券业协会' },
];

const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];

const titles = [
  '关于上市公司重大资产重组的监管要求',
  '2024年国民经济和社会发展统计公报',
  '科创板上市公司信息披露监管办法',
  '银行业保险业支持实体经济指导意见',
  '新能源汽车产业发展规划发布',
  '房地产调控政策持续优化',
  '上市公司年报披露工作顺利完成',
  '资本市场双向开放稳步推进',
  '注册制改革成效显著',
  '投资者保护机制不断完善',
];

const categories: NewsCategory[] = ['宏观经济', '行业动态', '政策法规', '公司新闻', '市场评论', '监管动态'];

const stockCodes = ['600519', '000858', '601318', '600036', '000001', '600900', '300750', '002594'];

export const mockSentiments: SentimentItem[] = Array.from({ length: 50 }, () => {
  const source = sources[Math.floor(Math.random() * sources.length)];
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: generateId(),
    title: titles[Math.floor(Math.random() * titles.length)],
    content: '这是舆情的详细内容，包含了对市场的影响分析、政策解读以及对相关行业和公司的潜在影响。',
    summary: '该信息涉及资本市场重要动态，对投资者决策具有参考价值。',
    source: source.type,
    sourceName: source.name,
    url: '#',
    publishTime: date.toISOString(),
    sentiment,
    sentimentScore: sentiment === 'positive' ? 0.7 + Math.random() * 0.3 : 
                     sentiment === 'negative' ? Math.random() * 0.3 : 
                     0.4 + Math.random() * 0.2,
    relatedStocks: stockCodes.slice(0, Math.floor(Math.random() * 4) + 1),
    heatIndex: Math.floor(Math.random() * 1000) + 100,
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: ['重要', '投资参考', '政策解读'].slice(0, Math.floor(Math.random() * 3) + 1),
  };
}).sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

export const mockStatistics: Statistics = {
  totalCount: 12847,
  todayCount: 156,
  yesterdayCount: 142,
  positiveRatio: 0.35,
  negativeRatio: 0.25,
  neutralRatio: 0.40,
  hotTopics: [
    { name: '资本市场改革', count: 1247, trend: 'up' },
    { name: '科创板动态', count: 982, trend: 'up' },
    { name: '新能源行业', count: 856, trend: 'stable' },
    { name: '房地产政策', count: 743, trend: 'down' },
    { name: '银行监管', count: 621, trend: 'up' },
    { name: '半导体产业', count: 598, trend: 'stable' },
    { name: '医药健康', count: 534, trend: 'down' },
    { name: '消费升级', count: 487, trend: 'up' },
  ],
  sourceDistribution: [
    { name: '交易所公告', value: 4235, color: '#FF6B35' },
    { name: '巨潮资讯', value: 3856, color: '#28A745' },
    { name: '国家统计局', value: 2156, color: '#1E3A5F' },
    { name: '行业协会', value: 2600, color: '#2E5984' },
  ],
  trendData: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      positive: Math.floor(Math.random() * 50) + 20,
      neutral: Math.floor(Math.random() * 40) + 30,
      negative: Math.floor(Math.random() * 30) + 10,
      total: Math.floor(Math.random() * 100) + 80,
    };
  }),
};

export const sourceLabels: Record<SourceType, string> = {
  exchange: '交易所公告',
  cninfo: '巨潮资讯',
  stats: '国家统计局',
  association: '行业协会',
};

export const sentimentLabels: Record<string, string> = {
  positive: '正面',
  neutral: '中性',
  negative: '负面',
};

export const sentimentColors: Record<string, string> = {
  positive: '#28A745',
  neutral: '#FFC107',
  negative: '#DC3545',
};
