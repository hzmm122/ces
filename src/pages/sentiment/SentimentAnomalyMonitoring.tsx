import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchStockChanges, 
  stockDataManager, 
  StockChangeItem as ServiceStockChangeItem 
} from '../../services/stockDataService';

interface StockChangeItem {
  序号: number;
  股票代码: string;
  股票名称: string;
  异动时间: string;
  异动类型: string;
  现价: number;
  涨跌幅: number;
  成交量: number;
  成交额: number;
  异动原因: string;
}

interface AnomalyData {
  id: number;
  stockCode: string;
  stockName: string;
  date: string;
  endDate: string;
  startDate?: string;
  deviation: string;
  reason: string;
  direction: 'up' | 'down' | 'suspend';
  price?: number;
  changePercent?: number;
  changeType?: string;
  volume?: number;
  amount?: number;
}

const SentimentAnomalyMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suspend' | 'normal'>('suspend');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterST, setFilterST] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockChanges, setStockChanges] = useState<StockChangeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(7200000); // 2小时

  /**
   * 转换数据格式
   */
  const convertData = useCallback((data: ServiceStockChangeItem[]): StockChangeItem[] => {
    return data.map((item, index) => ({
      序号: index + 1,
      股票代码: item.code,
      股票名称: item.name,
      异动时间: item.time,
      异动类型: item.changeType,
      现价: item.price,
      涨跌幅: item.changePercent,
      成交量: item.volume,
      成交额: item.amount,
      异动原因: item.reason,
    }));
  }, []);

  /**
   * 获取数据
   */
  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await fetchStockChanges(forceRefresh);
      setStockChanges(convertData(result.data));
      setLastUpdate(result.timestamp);
      setDataSource(result.source);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [convertData]);

  /**
   * 手动刷新
   */
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  /**
   * 初始化和自动刷新
   */
  useEffect(() => {
    fetchData(false);
    
    if (autoRefresh) {
      stockDataManager.startAutoUpdate(refreshInterval);
      
      const unsubscribe = stockDataManager.subscribe((data) => {
        setStockChanges(convertData(data));
        setLastUpdate(new Date().toLocaleString('zh-CN'));
        setDataSource('auto-update');
      });
      
      return () => {
        unsubscribe();
        stockDataManager.stopAutoUpdate();
      };
    } else {
      stockDataManager.stopAutoUpdate();
    }
  }, [autoRefresh, refreshInterval, fetchData, convertData]);

  const convertToAnomalyData = (item: StockChangeItem): AnomalyData => {
    const direction = item.涨跌幅 >= 0 ? 'up' : 'down';
    return {
      id: item.序号,
      stockCode: item.股票代码,
      stockName: item.股票名称,
      date: item.异动时间,
      endDate: item.异动时间,
      deviation: `${Math.abs(item.涨跌幅).toFixed(2)}%`,
      reason: item.异动原因 || item.异动类型,
      direction,
      price: item.现价,
      changePercent: item.涨跌幅,
      changeType: item.异动类型,
      volume: item.成交量,
      amount: item.成交额,
    };
  };

  const suspendData: AnomalyData[] = stockChanges
    .filter(item => 
      item.异动类型?.includes('停牌') || 
      item.异动类型?.includes('严重') ||
      item.异动原因?.includes('停牌') ||
      item.异动原因?.includes('严重')
    )
    .map(convertToAnomalyData);

  const normalAnomalyData: AnomalyData[] = stockChanges
    .filter(item => 
      !item.异动类型?.includes('停牌') && 
      !item.异动类型?.includes('严重') &&
      !item.异动原因?.includes('停牌') &&
      !item.异动原因?.includes('严重')
    )
    .map(convertToAnomalyData);

  const dates = [
    new Date().toISOString().split('T')[0],
    ...Array.from({ length: 9 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i + 1));
      return date.toISOString().split('T')[0];
    })
  ];

  const filteredData = activeTab === 'suspend' 
    ? suspendData.filter(d => {
        const matchesST = filterST || !d.stockName.includes('ST');
        const matchesSearch = !searchTerm || 
          d.stockName.includes(searchTerm) || 
          d.stockCode.includes(searchTerm);
        return matchesST && matchesSearch;
      })
    : normalAnomalyData.filter(d => {
        const matchesST = filterST || !d.stockName.includes('ST');
        const matchesSearch = !searchTerm || 
          d.stockName.includes(searchTerm) || 
          d.stockCode.includes(searchTerm);
        return matchesST && matchesSearch;
      });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">异动数据预测/监控</h1>
        <p className="text-sm text-text-secondary">实时监控市场异动数据</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">日期：</span>
            <select 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background-dark border border-border text-text-primary text-sm rounded px-3 py-1.5"
            >
              {dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">个股：</span>
            <input 
              type="text" 
              placeholder="请输入查询的个股"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background-dark border border-border text-text-primary text-sm rounded px-3 py-1.5 w-48"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterST}
              onChange={(e) => setFilterST(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            过滤ST
          </label>
        </div>

        <div className="flex gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('suspend')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'suspend' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            停牌/严重异常波动
          </button>
          <button
            onClick={() => setActiveTab('normal')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'normal' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            10日普通异常波动
          </button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm text-amber-500 font-medium">提醒：</p>
            <p className="text-xs text-text-secondary mt-1">
              异动数据为根据交易经验和规则总结，自研量化形成，具有一定前瞻性，但可能与交易所公告不一致，实际情况以交易所公告为准！
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-text-secondary">正在加载数据...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background-dark">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-12">序号</th>
                  {activeTab === 'suspend' ? (
                    <>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">股票</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">异动时间</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">异动类型</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">现价</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">涨跌幅</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">异动原因</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">方向</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">股票</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">异动时间</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">异动类型</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">现价</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">涨跌幅</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">异动原因</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'suspend' ? 6 : 7} className="px-3 py-12 text-center text-text-secondary">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-background-dark/50 transition-colors">
                      <td className="px-3 py-3">
                        <span className="text-sm text-text-secondary">{item.id}</span>
                      </td>
                      {activeTab === 'suspend' ? (
                        <>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-primary">{item.stockName}</span>
                              <span className="text-xs text-text-secondary">{item.stockCode}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-text-primary">{item.date || '-'}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-text-primary">{item.changeType || '-'}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm text-text-primary">{item.price?.toFixed(2) || '-'}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            {item.changePercent !== undefined ? (
                              <span className={`text-sm font-medium ${item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-sm text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-text-secondary">{item.reason}</span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                              item.direction === 'up' 
                                ? 'bg-red-500/20 text-red-500' 
                                : 'bg-green-500/20 text-green-500'
                            }`}>
                              {item.direction === 'up' ? (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              )}
                              {item.direction === 'up' ? '向上' : '向下'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-primary">{item.stockName}</span>
                              <span className="text-xs text-text-secondary">{item.stockCode}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-text-primary">{item.date}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-text-primary">{item.changeType || '-'}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm text-text-primary">{item.price?.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={`text-sm font-medium ${item.changePercent && item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {item.changePercent && item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-text-secondary">{item.reason}</span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-text-secondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>共 {filteredData.length} 条记录</span>
            {dataSource && dataSource !== 'eastmoney-api' && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded">
                {dataSource === 'mock' ? '模拟数据' : dataSource === 'cache' ? '缓存数据' : dataSource}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3 h-3 accent-primary"
              />
              <span className="text-xs">自动刷新</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-background-dark border border-border text-xs rounded px-2 py-1"
              disabled={!autoRefresh}
            >
              <option value={30000}>30秒</option>
              <option value={60000}>1分钟</option>
              <option value={120000}>2分钟</option>
              <option value={300000}>5分钟</option>
              <option value={3600000}>1小时</option>
              <option value={7200000}>2小时</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>数据更新于 {lastUpdate || new Date().toLocaleString('zh-CN')}</span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? '刷新中...' : '立即刷新'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnomalyMonitoring;
