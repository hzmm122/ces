/**
 * 股票数据服务
 * 用于从后端API获取个股数据
 */

const API_BASE_URL = 'http://localhost:3001/api';

export interface StockInfo {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  volume: number;
  amount: number;
  amplitude: number;
  high: number;
  low: number;
  open: number;
  close: number;
  turnover: number;
  pe: number;
  marketCap: number;
  updateTime: string;
}

export interface CrawlResult {
  success: boolean;
  data: StockInfo[];
  timestamp: string;
  dataCount: number;
  error?: string;
}

/**
 * 获取当前股票数据
 */
export async function fetchCurrentStocks(): Promise<StockInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/current`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    }
    
    console.error('[StockAPI] Failed to fetch stocks:', result.error);
    return [];
  } catch (error) {
    console.error('[StockAPI] Network error:', error);
    return [];
  }
}

/**
 * 手动触发爬取
 */
export async function triggerCrawl(): Promise<CrawlResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/stock-crawl`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('[StockAPI] Crawl error:', error);
    return {
      success: false,
      data: [],
      timestamp: new Date().toISOString(),
      dataCount: 0,
      error: error.message
    };
  }
}

/**
 * 获取历史数据（指定日期）
 */
export async function fetchHistoryStocks(date: string): Promise<StockInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/history?date=${date}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('[StockAPI] Failed to fetch history:', error);
    return [];
  }
}

/**
 * 获取历史日期列表
 */
export async function fetchHistoryDates(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/history`);
    const result = await response.json();
    
    if (result.success) {
      return result.dates || [];
    }
    
    return [];
  } catch (error) {
    console.error('[StockAPI] Failed to fetch dates:', error);
    return [];
  }
}

/**
 * 获取日期范围的历史数据
 */
export async function fetchHistoryRange(startDate: string, endDate: string): Promise<Record<string, StockInfo[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/history?startDate=${startDate}&endDate=${endDate}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || {};
    }
    
    return {};
  } catch (error) {
    console.error('[StockAPI] Failed to fetch range:', error);
    return {};
  }
}
