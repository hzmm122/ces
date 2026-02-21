import { 
  Announcement, 
  PolicyNews, 
  MarketSentiment, 
  DragonStock, 
  TradeRecord, 
  StrategyAttribution,
  HotConcept,
  FundFlow,
  AnnouncementType,
  PolicyTag,
  SentimentType
} from '../types';

const announcementTypes: AnnouncementType[] = [
  '业绩预告', '增减持', '并购重组', '监管处罚', '股权质押',
  '分红送转', '配股发行', '人事变动', '重大合同', '其他'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyzeAnnouncementSentiment(title: string, content: string): { sentiment: SentimentType; direction: '利好' | '利空' | '中性'; score: number } {
  const positiveKeywords = ['增长', '盈利', '利好', '增持', '分红', '突破', '创新', '中标', '签约'];
  const negativeKeywords = ['亏损', '利空', '减持', '处罚', '调查', '违规', '风险', '退市', '造假'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  const text = title + content;
  
  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) positiveScore++;
  }
  for (const keyword of negativeKeywords) {
    if (text.includes(keyword)) negativeScore++;
  }
  
  if (positiveScore > negativeScore) {
    return { sentiment: 'positive', direction: '利好', score: 0.6 + Math.random() * 0.3 };
  } else if (negativeScore > positiveScore) {
    return { sentiment: 'negative', direction: '利空', score: Math.random() * 0.4 };
  }
  return { sentiment: 'neutral', direction: '中性', score: 0.4 + Math.random() * 0.2 };
}

export function generateAnnouncements(): Announcement[] {
  const stockNames = ['贵州茅台', '宁德时代', '比亚迪', '招商银行', '中国平安', '五粮液', '隆基绿能', '恒瑞医药'];
  const stockCodes = ['600519', '300750', '002594', '600036', '601318', '000858', '601012', '600276'];
  
  const titles = [
    '关于2024年度业绩预告的公告',
    '控股股东增持股份计划',
    '重大资产重组进展公告',
    '收到监管机构行政处罚决定书',
    '股权质押解除公告',
    '2023年度分红送转方案',
    '配股发行预案',
    '高管人事变动公告',
    '重大合同签订公告',
  ];

  return Array.from({ length: 30 }, (_, i) => {
    const type = getRandomElement(announcementTypes);
    const stockIndex = Math.floor(Math.random() * stockNames.length);
    const title = titles[announcementTypes.indexOf(type)] || '关于公司重大事项的公告';
    const { sentiment, direction, score } = analyzeAnnouncementSentiment(title, title);
    
    return {
      id: `ann_${i}_${Date.now()}`,
      stockCode: stockCodes[stockIndex],
      stockName: stockNames[stockIndex],
      title,
      content: `${title}。公司经初步核算，预计2024年度实现营业收入同比增长，实现归属于上市公司股东的净利润同比增长。具体财务数据将在正式年度报告中披露。`,
      summary: title.substring(0, 50),
      type,
      publishTime: new Date(Date.now() - i * 3600000 * 2).toISOString(),
      source: '巨潮资讯',
      url: 'http://www.cninfo.com.cn',
      sentiment,
      sentimentScore: score,
      impactDirection: direction,
      relatedStocks: [stockCodes[stockIndex]],
      keyPoints: ['营收增长', '利润预增', '行业前景良好'],
    };
  });
}

export function generatePolicyNews(): PolicyNews[] {
  const policies = [
    { title: '推动数字金融高质量发展行动方案', tags: ['数字金融', 'AI安全应用'] as PolicyTag[], industries: ['金融科技', '人工智能'], level: 'high' as const },
    { title: '新能源产业扶持政策加码', tags: ['新能源'] as PolicyTag[], industries: ['光伏', '风电', '储能'], level: 'high' as const },
    { title: '半导体产业发展规划发布', tags: ['半导体'] as PolicyTag[], industries: ['芯片', '集成电路'], level: 'medium' as const },
    { title: '生物医药创新支持政策', tags: ['生物医药'] as PolicyTag[], industries: ['生物制药', '医疗器械'], level: 'medium' as const },
  ];

  return policies.map((p, i) => ({
    id: `policy_${i}`,
    title: p.title,
    content: `${p.title}。为贯彻落实国家战略，推动相关产业高质量发展，特制定本行动方案。`,
    source: '中国政府网',
    publishTime: new Date(Date.now() - i * 86400000).toISOString(),
    url: 'https://www.gov.cn',
    tags: p.tags,
    affectedIndustries: p.industries,
    affectedStocks: ['600519', '300750'],
    impactLevel: p.level,
  }));
}

export function generateMarketSentiment(): MarketSentiment[] {
  const cycles: Array<'冰点' | '修复' | '高潮' | '退潮'> = ['冰点', '修复', '高潮', '退潮'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    const cycleIndex = Math.floor(i / 7);
    const baseUp = 1500 + Math.floor(Math.random() * 1000);
    const baseDown = 1500 + Math.floor(Math.random() * 1000);
    
    return {
      date: date.toISOString().split('T')[0],
      upCount: baseUp,
      downCount: baseDown,
      limitUpCount: Math.floor(Math.random() * 50) + 20,
      limitDownCount: Math.floor(Math.random() * 20) + 5,
      northboundFlow: Math.floor(Math.random() * 10000) - 3000,
      marginFlow: Math.floor(Math.random() * 20000) - 5000,
      sentimentIndex: 50 + Math.floor(Math.random() * 40),
      cycle: cycles[cycleIndex],
    };
  });
}

export function generateDragonStocks(): DragonStock[] {
  const dragons = [
    { name: '中际旭创', code: '300308', concept: 'CPO' },
    { name: '万丰奥威', code: '002085', concept: '飞行汽车' },
    { name: '正丹股份', code: '300641', concept: 'PEEK' },
    { name: '万润科技', code: '300028', concept: 'AI算力' },
    { name: '宗申动力', code: '001696', concept: '飞行汽车' },
  ];

  return dragons.map((d, i) => ({
    id: `dragon_${i}`,
    name: d.name,
    code: d.code,
    days: 5 + Math.floor(Math.random() * 10),
    concept: d.concept,
    startDate: new Date(Date.now() - (5 + i) * 86400000).toISOString().split('T')[0],
    currentPrice: 20 + Math.random() * 80,
    changePercent: 5 + Math.random() * 30,
  }));
}

export function generateHotConcepts(): HotConcept[] {
  const concepts = [
    { name: 'AI算力', stocks: ['300308', '300028', '000988'] },
    { name: '飞行汽车', stocks: ['002085', '001696', '600738'] },
    { name: 'PEEK材料', stocks: ['300641', '300284', '002919'] },
    { name: '光模块', stocks: ['300308', '002281', '300502'] },
    { name: '液冷服务器', stocks: ['000977', '300454', '002212'] },
  ];

  return concepts.map((c) => ({
    name: c.name,
    heat: 8000 + Math.floor(Math.random() * 2000),
    trend: getRandomElement(['up', 'down', 'stable'] as const),
    relatedStocks: c.stocks,
    duration: 3 + Math.floor(Math.random() * 10),
  }));
}

export function generateFundFlow(): FundFlow[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      northbound: Math.floor(Math.random() * 20000) - 5000,
      southbound: Math.floor(Math.random() * 5000) - 2000,
      margin: Math.floor(Math.random() * 30000) - 10000,
      mainForce: Math.floor(Math.random() * 40000) - 15000,
    };
  });
}

export function generateTradeRecords(): TradeRecord[] {
  const stocks = [
    { code: '600519', name: '贵州茅台' },
    { code: '300750', name: '宁德时代' },
    { code: '002594', name: '比亚迪' },
  ];

  return stocks.flatMap((stock, si) => 
    Array.from({ length: 5 }, (_, i) => {
      const action = Math.random() > 0.5 ? '买入' : '卖出';
      const price = 100 + Math.random() * 200;
      const quantity = Math.floor(Math.random() * 1000);
      const pnl = action === '卖出' ? (Math.random() - 0.3) * price * quantity : undefined;
      
      return {
        id: `trade_${si}_${i}`,
        stockCode: stock.code,
        stockName: stock.name,
        action,
        price: Math.round(price * 100) / 100,
        quantity,
        time: new Date(Date.now() - i * 86400000).toISOString(),
        reason: getRandomElement(['业绩预增', '政策利好', '技术突破', '资金流入', '板块轮动']),
        pnl,
      };
    })
  );
}

export function analyzeStrategyAttribution(recordId: string): StrategyAttribution {
  const announcement = Math.random() * 40;
  const policy = Math.random() * 30;
  const liquidity = Math.random() * 20;
  const sentiment = Math.random() * 30;
  const technical = 100 - announcement - policy - liquidity - sentiment;

  const suggestions: string[] = [];
  if (announcement > 25) suggestions.push('关注公告带来的短期影响，评估业绩持续性');
  if (policy > 20) suggestions.push('政策影响较大，建议分散投资');
  if (liquidity > 15) suggestions.push('注意流动性风险，控制仓位');
  if (sentiment > 20) suggestions.push('市场情绪波动大，需关注市场情绪指标');

  return {
    id: `attr_${recordId}`,
    recordId,
    factors: {
      announcement: Math.round(announcement),
      policy: Math.round(policy),
      liquidity: Math.round(liquidity),
      sentiment: Math.round(sentiment),
      technical: Math.round(technical),
    },
    analysis: '本次交易受多重因素影响，其中公告因素占比较高，建议关注公司基本面变化。',
    suggestions,
  };
}
