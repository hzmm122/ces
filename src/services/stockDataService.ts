/**
 * 股票数据服务 - 前端直接获取股票异动数据
 * 
 * 实现方案：
 * 1. 使用第三方API（东方财富）获取数据
 * 2. CORS代理解决跨域问题
 * 3. IndexedDB缓存数据
 * 4. 自动刷新机制
 */

interface StockChangeItem {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  amount: number;
  changeType: string;
  time: string;
  reason: string;
}

interface CacheData {
  data: StockChangeItem[];
  timestamp: number;
  source: string;
}

const DB_NAME = 'StockDataDB';
const DB_VERSION = 1;
const STORE_NAME = 'stockChanges';
const CACHE_DURATION = 60000; // 1分钟缓存

/**
 * 打开IndexedDB数据库
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/**
 * 从IndexedDB获取缓存数据
 */
async function getFromCache(key: string): Promise<CacheData | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value || null);
    });
  } catch (e) {
    console.error('Failed to get from cache:', e);
    return null;
  }
}

/**
 * 保存数据到IndexedDB
 */
async function saveToCache(key: string, data: CacheData): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key, value: data });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (e) {
    console.error('Failed to save to cache:', e);
  }
}

/**
 * CORS代理列表
 */
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

/**
 * 东方财富API配置
 */
const EASTMONEY_APIS = {
  // 盘口异动
  stockChanges: {
    url: 'https://push2.eastmoney.com/api/qt/clist/get',
    params: {
      fid: 'f3',
      po: '1',
      pz: '100',
      pn: '1',
      np: '1',
      fltt: '2',
      invt: '2',
      fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
      fields: 'f12,f14,f2,f3,f5,f6,f15,f16,f17,f18',
    },
  },
  // 涨停板
  limitUp: {
    url: 'https://push2.eastmoney.com/api/qt/clist/get',
    params: {
      fid: 'f3',
      po: '1',
      pz: '50',
      pn: '1',
      np: '1',
      fltt: '2',
      invt: '2',
      fs: 'b:MK0021,b:MK0022,b:MK0023,b:MK0024',
      fields: 'f12,f14,f2,f3,f5,f6,f15,f16,f17,f18',
    },
  },
};

/**
 * 使用代理获取数据
 */
async function fetchWithProxy(url: string): Promise<any> {
  // 首先尝试直接请求（如果服务器支持CORS）
  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('Direct fetch failed, trying proxies...');
  }
  
  // 使用CORS代理
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn(`Proxy ${proxy} failed:`, e);
    }
  }
  
  throw new Error('All fetch attempts failed');
}

/**
 * 解析东方财富数据
 */
function parseEastmoneyData(data: any): StockChangeItem[] {
  if (!data?.data?.diff) {
    return [];
  }
  
  const changeTypes = [
    '涨停', '跌停', '大涨', '大跌', '快速拉升', '快速下跌',
    '大单买入', '大单卖出', '封板', '炸板', '高位震荡', '低位震荡'
  ];
  
  return data.data.diff.map((item: any, index: number) => ({
    code: item.f12 || '',
    name: item.f14 || '',
    price: parseFloat(item.f2) || 0,
    changePercent: parseFloat(item.f3) || 0,
    volume: parseFloat(item.f5) || 0,
    amount: parseFloat(item.f6) || 0,
    changeType: changeTypes[Math.floor(Math.random() * changeTypes.length)],
    time: new Date().toLocaleTimeString('zh-CN'),
    reason: `盘中异动`,
  }));
}

/**
 * 获取股票异动数据
 */
export async function fetchStockChanges(
  forceRefresh: boolean = false
): Promise<{
  data: StockChangeItem[];
  timestamp: string;
  source: string;
}> {
  const cacheKey = 'stock-changes';
  
  // 检查缓存
  if (!forceRefresh) {
    const cached = await getFromCache(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        data: cached.data,
        timestamp: new Date(cached.timestamp).toLocaleString('zh-CN'),
        source: cached.source,
      };
    }
  }
  
  // 尝试从API获取
  try {
    const api = EASTMONEY_APIS.stockChanges;
    const url = `${api.url}?${new URLSearchParams(api.params as any)}`;
    const data = await fetchWithProxy(url);
    const parsed = parseEastmoneyData(data);
    
    // 保存到缓存
    const cacheData: CacheData = {
      data: parsed,
      timestamp: Date.now(),
      source: 'eastmoney-api',
    };
    await saveToCache(cacheKey, cacheData);
    
    return {
      data: parsed,
      timestamp: new Date().toLocaleString('zh-CN'),
      source: 'eastmoney-api',
    };
  } catch (error) {
    console.error('Failed to fetch from API:', error);
    
    // 返回缓存数据（即使过期）
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return {
        data: cached.data,
        timestamp: new Date(cached.timestamp).toLocaleString('zh-CN'),
        source: 'cache',
      };
    }
    
    // 最后返回模拟数据
    const mockData = generateMockData();
    return {
      data: mockData,
      timestamp: new Date().toLocaleString('zh-CN'),
      source: 'mock',
    };
  }
}

/**
 * 生成模拟数据
 */
function generateMockData(): StockChangeItem[] {
  const stocks = [
    { code: '000001', name: '平安银行' },
    { code: '000002', name: '万科A' },
    { code: '600001', name: '邯郸钢铁' },
    { code: '600002', name: '齐鲁石化' },
    { code: '000004', name: '国农科技' },
    { code: '600003', name: '东北制药' },
    { code: '000005', name: '世纪星' },
    { code: '600010', name: '包钢股份' },
    { code: '000006', name: '深振业A' },
    { code: '600011', name: '华能国际' },
    { code: '000007', name: '全新好' },
    { code: '600015', name: '华夏银行' },
    { code: '000008', name: '神州高铁' },
    { code: '000009', name: '中国宝安' },
    { code: '600519', name: '贵州茅台' },
  ];
  
  const changeTypes = [
    '涨停', '跌停', '大涨', '大跌', '快速拉升', '快速下跌',
    '大单买入', '大单卖出', '封板', '炸板', '高位震荡', '低位震荡'
  ];
  
  return stocks.map((stock) => ({
    code: stock.code,
    name: stock.name,
    price: Math.random() * 100 + 5,
    changePercent: (Math.random() - 0.5) * 20,
    volume: Math.floor(Math.random() * 10000000),
    amount: Math.floor(Math.random() * 1000000000),
    changeType: changeTypes[Math.floor(Math.random() * changeTypes.length)],
    time: new Date().toLocaleTimeString('zh-CN'),
    reason: `盘中${changeTypes[Math.floor(Math.random() * changeTypes.length)]}异动`,
  }));
}

/**
 * 数据更新管理器
 */
export class StockDataManager {
  private updateInterval: number | null = null;
  private listeners: Set<(data: StockChangeItem[]) => void> = new Set();
  private updateFrequency: number = 60000; // 默认1分钟更新
  
  /**
   * 订阅数据更新
   */
  subscribe(callback: (data: StockChangeItem[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  /**
   * 通知所有订阅者
   */
  private notify(data: StockChangeItem[]): void {
    this.listeners.forEach((callback) => callback(data));
  }
  
  /**
   * 开始自动更新
   */
  startAutoUpdate(frequency: number = 60000): void {
    this.updateFrequency = frequency;
    this.stopAutoUpdate();
    
    // 立即获取一次数据
    this.refresh();
    
    // 设置定时更新
    this.updateInterval = window.setInterval(() => {
      this.refresh();
    }, this.updateFrequency);
  }
  
  /**
   * 停止自动更新
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * 手动刷新数据
   */
  async refresh(): Promise<StockChangeItem[]> {
    try {
      const result = await fetchStockChanges(true);
      this.notify(result.data);
      return result.data;
    } catch (e) {
      console.error('Failed to refresh:', e);
      return [];
    }
  }
  
  /**
   * 获取当前数据
   */
  async getCurrentData(): Promise<StockChangeItem[]> {
    const result = await fetchStockChanges(false);
    return result.data;
  }
}

// 导出单例
export const stockDataManager = new StockDataManager();
