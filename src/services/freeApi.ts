import { SentimentItem, SourceType, SentimentType, Statistics, NewsCategory } from '../types';

const positiveKeywords = [
  '涨', '上涨', '增长', '盈利', '突破', '创新', '利好', '增持', '推荐', '买入',
  '分红', '业绩', '利润', '增长', '上升', '反弹', '走强', '看涨', '看多',
];

const negativeKeywords = [
  '跌', '下跌', '亏损', '利空', '减持', '卖出', '风险', '警示', '调查',
  '违规', '处罚', '退市', '暴跌', '跳水', '走弱', '看跌', '看空',
];

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  if (!text) return 'neutral';
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) positiveScore++;
  }
  
  for (const keyword of negativeKeywords) {
    if (text.includes(keyword)) negativeScore++;
  }
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

function getSentimentScore(text: string): number {
  const sentiment = analyzeSentiment(text);
  if (sentiment === 'positive') return 0.6 + Math.random() * 0.3;
  if (sentiment === 'negative') return Math.random() * 0.4;
  return 0.4 + Math.random() * 0.2;
}

const newsUrls = [
  'https://finance.sina.com.cn/stock/',
  'https://www.eastmoney.com/',
  'https://www.stcn.com/',
  'https://www.cs.com.cn/',
  'https://www.ft.com/',
  'https://www.bloomberg.com/',
];

function generateRandomNews(): SentimentItem[] {
  const titles = [
    'A股三大指数全线上涨，创业板指涨超2%',
    '央行逆回购操作，释放流动性支持市场',
    '科技股持续走强，人工智能板块领涨',
    '新能源汽车销量突破新高，产业链业绩大增',
    '房地产政策暖风频吹，市场信心逐步恢复',
    '银行业监管新规落地，合规要求提升',
    '半导体行业景气回升，芯片需求强劲',
    '医药集采结果公布，部分药品价格降幅明显',
    'CPI数据发布，通胀水平保持稳定',
    '美股涨跌互现，市场等待美联储决议',
    '北向资金净流入，A股获外资青睐',
    '上市公司业绩预告亮眼，利润增长显著',
    '光伏行业产能扩张，竞争格局优化',
    '保险资金入市提速，权益投资比例提升',
    '消费复苏态势明显，零售数据回暖',
    '基建投资加速，稳增长政策见效',
    '新能源板块回调，估值回归合理区间',
    '科创板新股密集发行，融资活跃',
    '跨境电商增速放缓，行业面临调整',
    '钢铁行业限产持续，供给收缩明显',
  ];
  
  const sources = [
    { name: '证券时报', type: 'cninfo' as SourceType },
    { name: '中国证券报', type: 'cninfo' as SourceType },
    { name: '上海证券报', type: 'cninfo' as SourceType },
    { name: '金融时报', type: 'exchange' as SourceType },
    { name: '第一财经', type: 'cninfo' as SourceType },
    { name: '东方财富', type: 'exchange' as SourceType },
    { name: '新浪财经', type: 'cninfo' as SourceType },
  ];
  
  const categories: NewsCategory[] = ['宏观经济', '行业动态', '政策法规', '公司新闻', '市场评论', '监管动态'];
  
  return titles.map((title, index) => {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const urlIndex = Math.floor(Math.random() * newsUrls.length);
    
    return {
      id: `news_${index}_${Date.now()}`,
      title: title,
      content: title + '。最新市场动态显示，相关板块受到投资者广泛关注。详细内容请访问原文链接。',
      summary: title.substring(0, 50),
      source: source.type,
      sourceName: source.name,
      url: newsUrls[urlIndex],
      publishTime: new Date(Date.now() - hoursAgo * 3600000 - minutesAgo * 60000).toISOString(),
      sentiment: analyzeSentiment(title) as SentimentType,
      sentimentScore: getSentimentScore(title),
      relatedStocks: [],
      heatIndex: Math.floor(Math.random() * 500) + 500,
      category: categories[Math.floor(Math.random() * categories.length)] as NewsCategory,
      tags: [source.name, categories[Math.floor(Math.random() * categories.length)]],
    };
  }).sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
}

export function getMarketSentiment(): SentimentItem[] {
  return generateRandomNews();
}

export function getStatistics(): Statistics {
  const baseTotal = 12800;
  const baseToday = 150;
  const total = baseTotal + Math.floor(Math.random() * 200);
  const today = baseToday + Math.floor(Math.random() * 50);
  
  const positiveRatio = 0.30 + Math.random() * 0.15;
  const negativeRatio = 0.20 + Math.random() * 0.10;
  const neutralRatio = 1 - positiveRatio - negativeRatio;
  
  return {
    totalCount: total,
    todayCount: today,
    yesterdayCount: today - Math.floor(Math.random() * 20) - 5,
    positiveRatio,
    negativeRatio,
    neutralRatio,
    hotTopics: [
      { name: '资本市场改革', count: 1200 + Math.floor(Math.random() * 100), trend: Math.random() > 0.5 ? 'up' as const : 'stable' as const },
      { name: '科创板动态', count: 950 + Math.floor(Math.random() * 80), trend: 'up' as const },
      { name: '新能源行业', count: 820 + Math.floor(Math.random() * 60), trend: Math.random() > 0.5 ? 'up' as const : 'down' as const },
      { name: '房地产政策', count: 700 + Math.floor(Math.random() * 50), trend: 'up' as const },
      { name: '银行监管', count: 600 + Math.floor(Math.random() * 40), trend: 'stable' as const },
      { name: '半导体产业', count: 550 + Math.floor(Math.random() * 35), trend: 'up' as const },
    ],
    sourceDistribution: [
      { name: '证券时报', value: 4000 + Math.floor(Math.random() * 200), color: '#FF6B35' },
      { name: '中国证券报', value: 3500 + Math.floor(Math.random() * 150), color: '#28A745' },
      { name: '东方财富', value: 2500 + Math.floor(Math.random() * 100), color: '#1E3A5F' },
      { name: '新浪财经', value: 2800 + Math.floor(Math.random() * 120), color: '#2E5984' },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        positive: Math.floor(Math.random() * 30) + 15 + i,
        neutral: Math.floor(Math.random() * 25) + 25 + i,
        negative: Math.floor(Math.random() * 20) + 8 + i,
        total: Math.floor(Math.random() * 60) + 60 + i * 2,
      };
    }),
  };
}

export async function fetchStockData(symbol: string = 'AAPL') {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
    );
    return await response.json();
  } catch (error) {
    console.error('获取股票数据失败:', error);
    return null;
  }
}
