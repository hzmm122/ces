/**
 * 实时股票数据服务
 * 使用新浪财经API获取实时股票数据
 * 支持降级：如果API失败，使用缓存或模拟数据
 */

// 股票列表（可以配置）
export const STOCK_LIST = {
  indices: [
    { code: '1.000001', name: '上证指数', market: 'sh' },
    { code: '0.399001', name: '深证成指', market: 'sz' },
    { code: '0.399006', name: '创业板指', market: 'sz' },
    { code: '1.000300', name: '沪深300', market: 'sh' },
    { code: '1.000016', name: '上证50', market: 'sh' },
  ],
  popular: [
    { code: '0.600519', name: '贵州茅台', market: 'sh' },
    { code: '0.000858', name: '招商银行', market: 'sz' },
    { code: '0.601318', name: '中国平安', market: 'sh' },
    { code: '0.600036', name: '招商银行', market: 'sh' },
    { code: '0.000001', name: '平安银行', market: 'sz' },
    { code: '0.600000', name: '浦发银行', market: 'sh' },
    { code: '0.600016', name: '民生银行', market: 'sh' },
    { code: '0.601398', name: '工商银行', market: 'sh' },
  ],
};

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: string;
}

export interface IndexQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

// 本地缓存键
const CACHE_KEY = 'realtime_stock_data';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1小时

// 缓存数据结构
interface CacheData {
  indices: IndexQuote[];
  stocks: StockQuote[];
  timestamp: number;
}

/**
 * 获取本地缓存数据
 */
function getLocalCache(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as CacheData;
    const now = Date.now();
    
    // 检查缓存是否过期
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (e) {
    console.warn('[RealtimeAPI] Local cache read error:', e);
    return null;
  }
}

/**
 * 保存数据到本地缓存
 */
function saveLocalCache(indices: IndexQuote[], stocks: StockQuote[]): void {
  try {
    const data: CacheData = {
      indices,
      stocks,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[RealtimeAPI] Local cache save error:', e);
  }
}

// 新浪财经API基础URL
const SINA_BASE_URL = 'https://hq.sinajs.cn/list=';

/**
 * 获取股票列表的行情数据
 */
async function fetchStockQuotesFromSina(codes: string[]): Promise<StockQuote[]> {
  if (codes.length === 0) return [];
  
  const results: StockQuote[] = [];
  
  const chunkSize = 150;
  const chunks = [];
  
  for (let i = 0; i < codes.length; i += chunkSize) {
    chunks.push(codes.slice(i, i + chunkSize));
  }
  
  for (const chunk of chunks) {
    const param = chunk.map(c => {
      const market = c.startsWith('0') || c.startsWith('3') ? 'sz' : 'sh';
      return `${market}${c}`;
    }).join(',');
    
    try {
      const url = `https://hq.sinajs.cn/list=${param}`;
      const response = await fetch(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (!response.ok) continue;
      
      const text = await response.text();
      const lines = text.split('\n');
      
      for (const line of lines) {
        const match = line.match(/var hqstr_(\w+)="([^"]*)"/);
        if (!match) continue;
        
        const code = match[1].replace(/^(sh|sz)/, '');
        const data = match[2].split(',');
        
        if (data.length < 10) continue;
        
        results.push({
          code,
          name: data[0],
          open: parseFloat(data[1]) || 0,
          close: parseFloat(data[2]) || 0,
          price: parseFloat(data[3]) || 0,
          high: parseFloat(data[4]) || 0,
          low: parseFloat(data[5]) || 0,
          volume: parseInt(data[8]) || 0,
          amount: parseFloat(data[9]) || 0,
          change: parseFloat(data[2]) - parseFloat(data[1]) || 0,
          changePercent: ((parseFloat(data[2]) - parseFloat(data[1])) / parseFloat(data[1]) * 100) || 0,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  }
  
  return results;
}

/**
 * 获取指数数据
 */
async function fetchIndexQuotesFromSina(codes: string[]): Promise<IndexQuote[]> {
  if (codes.length === 0) return [];
  
  const results: IndexQuote[] = [];
  
  const indexCodes = codes.map(c => {
    if (c === '1.000001') return 's_sh000001';
    if (c === '0.399001') return 's_sz399001';
    if (c === '0.399006') return 's_sz399006';
    if (c === '1.000300') return 's_sh000300';
    if (c === '1.000016') return 's_sh000016';
    return `s_${c}`;
  });
  
  const param = indexCodes.join(',');
  
  try {
    const url = `https://hq.sinajs.cn/list=${param}`;
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) return results;
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/var hqstr_(\w+)="([^"]*)"/);
      if (!match) continue;
      
      const data = match[2].split(',');
      if (data.length < 10) continue;
      
      let originalCode = match[1];
      if (originalCode.startsWith('s_sh')) originalCode = '1.' + originalCode.replace('s_sh', '');
      if (originalCode.startsWith('s_sz')) originalCode = '0.' + originalCode.replace('s_sz', '');
      
      const nameMap: Record<string, string> = {
        's_sh000001': '上证指数',
        's_sz399001': '深证成指',
        's_sz399006': '创业板指',
        's_sh000300': '沪深300',
        's_sh000016': '上证50',
      };
      
      const prevClose = parseFloat(data[1]) || 0;
      const price = parseFloat(data[2]) || 0;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose * 100) : 0;
      
      results.push({
        code: originalCode,
        name: nameMap[match[1]] || data[0],
        price,
        change,
        changePercent,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error('Fetch index error:', e);
  }
  
  return results;
}

/**
 * 从东方财富获取数据（备用方案）
 */
async function fetchFromEastMoney(): Promise<{ indices: IndexQuote[], stocks: StockQuote[] }> {
  const indices: IndexQuote[] = [];
  const stocks: StockQuote[] = [];
  
  try {
    // 获取大盘指数
    const indexUrl = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
    const indexParams = new URLSearchParams({
      fltt: '2',
      invt: '2',
      fields: 'f1,f2,f3,f4,f12,f13,f14',
      secids: '1.000001,0.399001,0.399006,1.000300,1.000016',
    });
    
    const indexRes = await fetch(`${indexUrl}?${indexParams}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (indexRes.ok) {
      const indexData = await indexRes.json();
      if (indexData.data?.diff) {
        for (const item of indexData.data.diff) {
          indices.push({
            code: String(item.f12),
            name: item.f14,
            price: item.f2,
            change: item.f4,
            changePercent: item.f3,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
    
    // 获取涨跌幅榜股票
    const stockUrl = 'https://push2.eastmoney.com/api/qt/clist/get';
    const stockParams = new URLSearchParams({
      pn: '1',
      pz: '20',
      po: '1',
      np: '1',
      fltt: '2',
      invt: '2',
      fid: 'f3',
      fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
      fields: 'f2,f3,f4,f5,f6,f12,f14',
    });
    
    const stockRes = await fetch(`${stockUrl}?${stockParams}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (stockRes.ok) {
      const stockData = await stockRes.json();
      if (stockData.data?.diff) {
        for (const item of stockData.data.diff) {
          stocks.push({
            code: String(item.f12),
            name: item.f14,
            price: item.f2,
            changePercent: item.f3,
            change: item.f4,
            volume: item.f5,
            amount: item.f6,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (e) {
    console.error('[RealtimeAPI] EastMoney fetch error:', e);
  }
  
  return { indices, stocks };
}

/**
 * 获取所有市场数据（带降级逻辑）
 */
export async function fetchMarketData(): Promise<{ 
  indices: IndexQuote[]; 
  stocks: StockQuote[];
  source: 'realtime' | 'cache' | 'mock';
}> {
  // 1. 尝试从新浪API获取
  try {
    const [indices, stocks] = await Promise.all([
      fetchIndexQuotesFromSina(STOCK_LIST.indices.map(i => i.code)),
      fetchStockQuotesFromSina(STOCK_LIST.popular.map(s => s.code)),
    ]);
    
    if (indices.length > 0 || stocks.length > 0) {
      // 保存到本地缓存
      if (stocks.length > 0) {
        saveLocalCache(indices, stocks);
      }
      
      console.log('[RealtimeAPI] Data loaded from Sina API');
      return { indices, stocks, source: 'realtime' };
    }
  } catch (e) {
    console.warn('[RealtimeAPI] Sina API failed:', e);
  }
  
  // 2. 尝试从东方财富API获取
  try {
    const data = await fetchFromEastMoney();
    if (data.indices.length > 0 || data.stocks.length > 0) {
      console.log('[RealtimeAPI] Data loaded from EastMoney API');
      return { ...data, source: 'realtime' };
    }
  } catch (e) {
    console.warn('[RealtimeAPI] EastMoney API failed:', e);
  }
  
  // 3. 尝试从本地缓存获取
  const cached = getLocalCache();
  if (cached) {
    console.log('[RealtimeAPI] Data loaded from local cache');
    return { 
      indices: cached.indices, 
      stocks: cached.stocks, 
      source: 'cache' 
    };
  }
  
  // 4. 返回模拟数据
  console.log('[RealtimeAPI] Using mock data');
  return {
    indices: generateMockIndices(),
    stocks: generateMockStocks(),
    source: 'mock' as const
  };
}

/**
 * 'mock'
  获取板块涨跌榜
 */
export async function fetchIndustryData(): Promise<any[]> {
  try {
    const url = 'https://push2.eastmoney.com/api/qt/clist/get';
    const params = new URLSearchParams({
      pn: '1',
      pz: '50',
      po: '1',
      np: '1',
      fltt: '2',
      invt: '2',
      fid: 'f3',
      fs: 'm:90+t:2',
      fields: 'f1,f2,f3,f4,f5,f6,f12,f13,f14,f15,f16,f17,f18',
    });
    
    const response = await fetch(`${url}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (!data.data?.diff) return [];
    
    return data.data.diff.map((item: any) => ({
      code: item.f12,
      name: item.f14,
      price: item.f2,
      changePercent: item.f3,
      volume: item.f5,
      amount: item.f6,
    }));
  } catch (e) {
    console.error('[RealtimeAPI] Fetch industry error:', e);
    return [];
  }
}

// 生成模拟指数数据
function generateMockIndices(): IndexQuote[] {
  const indices = [
    { code: '1.000001', name: '上证指数' },
    { code: '0.399001', name: '深证成指' },
    { code: '0.399006', name: '创业板指' },
    { code: '1.000300', name: '沪深300' },
    { code: '1.000016', name: '上证50' },
  ];
  
  return indices.map(idx => ({
    ...idx,
    price: 3000 + Math.random() * 500,
    change: (Math.random() - 0.5) * 50,
    changePercent: (Math.random() - 0.5) * 3,
    timestamp: new Date().toISOString(),
  }));
}

// 生成模拟股票数据
function generateMockStocks(): StockQuote[] {
  const stocks = [
    { code: '600519', name: '贵州茅台' },
    { code: '000858', name: '招商银行' },
    { code: '601318', name: '中国平安' },
    { code: '600036', name: '招商银行' },
    { code: '000001', name: '平安银行' },
    { code: '600000', name: '浦发银行' },
    { code: '600016', name: '民生银行' },
    { code: '601398', name: '工商银行' },
  ];
  
  return stocks.map(stock => {
    const price = Math.random() * 100 + 10;
    const prevPrice = price * (1 + (Math.random() - 0.5) * 0.1);
    return {
      ...stock,
      price,
      open: prevPrice,
      close: prevPrice,
      high: price * 1.02,
      low: price * 0.98,
      volume: Math.floor(Math.random() * 100000000),
      amount: Math.floor(Math.random() * 10000000000),
      change: price - prevPrice,
      changePercent: ((price - prevPrice) / prevPrice * 100),
      timestamp: new Date().toISOString(),
    };
  });
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (isNaN(num) || num === null) return '--';
  return num.toFixed(decimals);
}

export function formatAmount(num: number): string {
  if (isNaN(num) || num === null) return '--';
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toFixed(2);
}
