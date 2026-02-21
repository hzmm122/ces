import axios from 'axios';

const SINA_INDUSTRY_URL = 'http://hq.sinajs.cn/list=sh000001,sh000688';

export interface IndustryData {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  amount: number;
}

interface CacheData {
  data: IndustryData[];
  timestamp: number;
}

const CACHE_DURATION = 60000;

let cachedData: CacheData | null = null;
let lastFetchTime = 0;
let isFetching = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3, backoff = 1000): Promise<string> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Referer': 'http://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[IndustryAPI] Fetch attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await delay(backoff * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}

function parseSinaIndustryData(rawData: string): IndustryData[] {
  const industries: IndustryData[] = [];
  
  try {
    const lines = rawData.split('\n');
    
    for (const line of lines) {
      if (!line.includes('=')) continue;
      
      const match = line.match(/sh(\d{6})="([^"]*)"/);
      if (match) {
        const code = match[1];
        const parts = match[2].split(',');
        
        if (parts.length >= 4) {
          const name = parts[0];
          const price = parseFloat(parts[1]) || 0;
          const changePercent = parseFloat(parts[2]) || 0;
          const volume = parseFloat(parts[3]) || 0;
          
          industries.push({
            code: `sh${code}`,
            name: name.replace(/"/g, '').trim(),
            price,
            changePercent,
            volume,
            amount: volume * price
          });
        }
      }
    }
  } catch (error) {
    console.error('[IndustryAPI] Parse error:', error);
    throw error;
  }
  
  return industries;
}

function generateMockIndustryData(): IndustryData[] {
  const mockIndustries = [
    { name: '人工智能', code: 'BK0043' },
    { name: '半导体', code: 'BK0051' },
    { name: '新能源汽车', code: 'BK0901' },
    { name: '医药生物', code: 'BK0451' },
    { name: '房地产', code: 'BK0457' },
    { name: '银行', code: 'BK0473' },
    { name: '军工', code: 'BK0056' },
    { name: '消费电子', code: 'BK0562' },
    { name: '光伏', code: 'BK0588' },
    { name: '煤炭', code: 'BK0029' },
    { name: '石油化工', code: 'BK0031' },
    { name: '钢铁', code: 'BK0041' },
    { name: '券商', code: 'BK0461' },
    { name: '保险', code: 'BK0449' },
    { name: '基建', code: 'BK0495' },
    { name: '电力', code: 'BK0037' },
    { name: '铁路公路', code: 'BK0034' },
    { name: '航运港口', code: 'BK0058' },
    { name: '物流', code: 'BK0883' },
    { name: '旅游', code: 'BK0091' },
    { name: '酒店餐饮', code: 'BK0092' },
    { name: '食品饮料', code: 'BK0022' },
    { name: '纺织服装', code: 'BK0024' },
    { name: '家电', code: 'BK0032' },
    { name: '传媒', code: 'BK0036' },
    { name: '环保', code: 'BK0045' },
    { name: '建筑材料', code: 'BK0027' },
    { name: '汽车整车', code: 'BK0040' },
    { name: '工程机械', code: 'BK0061' },
    { name: '农药兽药', code: 'BK0055' },
  ];

  const baseChange = (Math.random() - 0.5) * 4;

  return mockIndustries.map(industry => {
    const changePercent = baseChange + (Math.random() - 0.5) * 6;
    const price = 100 + Math.random() * 500;
    const volume = Math.random() * 1000000000;

    return {
      code: industry.code,
      name: industry.name,
      price: parseFloat(price.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.round(volume),
      amount: parseFloat((volume * price).toFixed(2))
    };
  });
}

export async function fetchIndustryData(forceRefresh = false): Promise<IndustryData[]> {
  const now = Date.now();

  if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    console.log('[IndustryAPI] Returning cached data');
    return cachedData.data;
  }

  if (isFetching) {
    if (cachedData) {
      console.log('[IndustryAPI] Already fetching, returning cached data');
      return cachedData.data;
    }
    await delay(1000);
    return generateMockIndustryData();
  }

  isFetching = true;
  lastFetchTime = now;

  try {
    console.log('[IndustryAPI] Fetching fresh data...');
    
    const rawData = await fetchWithRetry(SINA_INDUSTRY_URL, 3, 1500);
    const industries = parseSinaIndustryData(rawData);

    if (industries.length > 0) {
      cachedData = {
        data: industries,
        timestamp: now
      };
      console.log(`[IndustryAPI] Successfully fetched ${industries.length} industries`);
      return industries;
    }

    throw new Error('No valid industry data found');
  } catch (error) {
    console.error('[IndustryAPI] Fetch failed, using mock data:', error);
    
    const mockData = generateMockIndustryData();
    cachedData = {
      data: mockData,
      timestamp: now
    };
    
    return mockData;
  } finally {
    isFetching = false;
  }
}

export async function fetchIndustryDataWithCache(): Promise<IndustryData[]> {
  return fetchIndustryData(false);
}

export async function refreshIndustryData(): Promise<IndustryData[]> {
  return fetchIndustryData(true);
}

export function getCachedIndustryData(): IndustryData[] | null {
  return cachedData?.data || null;
}

export function getLastFetchTime(): number {
  return lastFetchTime;
}
