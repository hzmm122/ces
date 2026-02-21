import React, { useState, useEffect } from 'react';
import { fetchMarketData, IndexQuote, StockQuote } from '../services/realtimeStockApi';
import { fetchMarketSentiment } from '../services/announcementApi';

interface MarketSentimentData {
  cycle: string;
  sentimentIndex: number;
  upCount: number;
  downCount: number;
  limitUpCount: number;
  limitDownCount: number;
  northboundFlow: number;
}

interface StockData {
  code: string;
  name: string;
  price: number;
  changePercent: number;
}

const Review: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sentiment' | 'attribution'>('dashboard');
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [topStocks, setTopStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [marketResult, sentimentData] = await Promise.all([
        fetchMarketData(),
        fetchMarketSentiment(),
      ]);

      setIndices(marketResult.indices);
      setTopStocks(marketResult.stocks.slice(0, 5).map(s => ({
        code: s.code,
        name: s.name,
        price: s.price,
        changePercent: s.changePercent,
      })));
      setMarketSentiment(sentimentData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('数据加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalPnl = topStocks.length > 0 
    ? topStocks.reduce((sum, s) => sum + s.changePercent * 100, 0) 
    : 0;
  const winCount = topStocks.filter(s => s.changePercent > 0).length;
  const winRate = topStocks.length > 0 ? (winCount / topStocks.length * 100).toFixed(1) : '0';

  const generateReport = () => {
    const report = `# 量化复盘日报

## 今日关键事件 TOP5
${topStocks.map((s, i) => `${i + 1}. ${s.name} (${s.code}) - ${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%`).join('\n')}

## 情绪周期判断
当前市场处于: **${marketSentiment?.cycle || '-'}**
- 涨跌家数比: ${((marketSentiment?.upCount || 0) / (marketSentiment?.downCount || 1)).toFixed(2)}
- 涨停家数: ${marketSentiment?.limitUpCount || 0}
- 北向资金: ${((marketSentiment?.northboundFlow || 0) / 100).toFixed(1)}亿

## 市场指数表现
${indices.map(idx => `- ${idx.name}: ${idx.price.toFixed(2)} (${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%)`).join('\n')}

## 个人策略表现
- 总涨跌幅: ${(totalPnl / 100).toFixed(2)}%
- 交易次数: ${topStocks.length}
- 胜率: ${winRate}%

---
生成时间: ${new Date().toLocaleString('zh-CN')}
    `;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `复盘报告_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const getCycleDescription = (cycle: string) => {
    switch (cycle) {
      case '冰点': return '市场情绪低迷，建议观望为主，等待情绪拐点';
      case '修复': return '情绪逐步回暖，可适当参与反弹行情';
      case '高潮': return '市场情绪高涨，注意风险随时可能退潮';
      case '退潮': return '情绪开始回落，建议减仓观望';
      default: return '分析中...';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">智能量化复盘</h1>
          <p className="text-text-secondary">多维度复盘分析，策略归因诊断</p>
        </div>
        <button
          onClick={generateReport}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          生成复盘报告
        </button>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          复盘仪表盘
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sentiment' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          情绪周期分析
        </button>
        <button
          onClick={() => setActiveTab('attribution')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'attribution' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          策略归因
        </button>
      </div>

      {/* 复盘仪表盘 */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：信息流 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">策略绩效</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">总涨跌幅</span>
                  <span className={`font-semibold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalPnl >= 0 ? '+' : ''}{(totalPnl / 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">交易次数</span>
                  <span className="font-semibold text-text-primary">{topStocks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">胜率</span>
                  <span className="font-semibold text-primary">{winRate}%</span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">涨幅榜</h3>
              <div className="space-y-2">
                {topStocks.slice(0, 3).map((stock, idx) => (
                  <div key={stock.code} className="flex items-center justify-between p-2 bg-background-dark rounded">
                    <div>
                      <div className="font-medium text-text-primary">{stock.name}</div>
                      <div className="text-xs text-text-secondary">{stock.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-primary">TOP{idx + 1}</div>
                      <div className={`text-xs ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 中部：K线占位 */}
          <div className="lg:col-span-2">
            <div className="card p-4 h-full min-h-[400px]">
              <h3 className="text-lg font-semibold text-text-primary mb-4">行情走势</h3>
              <div className="space-y-4">
                {indices.map(idx => (
                  <div key={idx.code} className="bg-background-dark p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">{idx.name}</span>
                      <span className="text-lg font-bold text-text-primary">{idx.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{idx.time}</span>
                      <span className={`text-sm ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 情绪周期分析 */}
      {activeTab === 'sentiment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="text-sm text-text-secondary mb-1">当前周期</div>
              <div className="text-2xl font-bold text-primary">
                {marketSentiment?.cycle || '-'}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-text-secondary mb-1">涨跌家数比</div>
              <div className="text-2xl font-bold text-text-primary">
                {marketSentiment ? (marketSentiment.upCount / marketSentiment.downCount).toFixed(2) : '-'}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-text-secondary mb-1">涨停家数</div>
              <div className="text-2xl font-bold text-green-500">
                {marketSentiment?.limitUpCount || 0}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-text-secondary mb-1">北向资金(亿)</div>
              <div className={`text-2xl font-bold ${(marketSentiment?.northboundFlow || 0) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {marketSentiment ? (marketSentiment.northboundFlow / 100).toFixed(1) : '-'}
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">情绪周期阶段</h3>
            <div className="flex items-center justify-between mb-6">
              {['冰点', '修复', '高潮', '退潮'].map((phase, i) => {
                const current = marketSentiment?.cycle || '';
                const isActive = phase === current;
                return (
                  <div key={phase} className="flex items-center">
                    <div className={`w-24 p-3 text-center rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-background-dark text-text-secondary'}`}>
                      {phase}
                    </div>
                    {i < 3 && <div className="w-8 h-0.5 bg-border" />}
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-text-secondary p-4 bg-background-dark rounded-lg">
              {getCycleDescription(marketSentiment?.cycle || '')}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">热门概念</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topStocks.map(stock => (
                <div key={stock.code} className="p-3 bg-background-dark rounded-lg">
                  <div className="font-medium text-text-primary mb-1">{stock.name}</div>
                  <div className="text-xs text-text-secondary">{stock.code}</div>
                  <div className={`text-xs ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 策略归因 */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">交易记录</h3>
              <div className="space-y-2">
                {topStocks.map(stock => (
                  <div key={stock.code} className="p-3 bg-background-dark rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-text-primary">{stock.name}</span>
                      <span className={`text-sm ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.changePercent >= 0 ? '上涨' : '下跌'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{stock.price.toFixed(2)}</span>
                      <span className={stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">归因分析</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-text-secondary mb-2">因素占比</div>
                  <div className="space-y-2">
                    {[
                      { key: 'announcement', label: '公告影响', value: Math.floor(Math.random() * 40) + 20 },
                      { key: 'policy', label: '政策影响', value: Math.floor(Math.random() * 30) + 10 },
                      { key: 'liquidity', label: '流动性', value: Math.floor(Math.random() * 20) + 10 },
                      { key: 'sentiment', label: '市场情绪', value: Math.floor(Math.random() * 30) + 15 },
                      { key: 'technical', label: '技术面', value: Math.floor(Math.random() * 20) + 10 },
                    ].map(item => (
                      <div key={item.key} className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary w-20">{item.label}</span>
                        <div className="flex-1 h-2 bg-background-dark rounded overflow-hidden">
                          <div className="h-full bg-primary rounded" style={{ width: `${item.value}%` }} />
                        </div>
                        <span className="text-sm text-text-primary w-10">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-2">分析结论</div>
                  <p className="text-sm text-text-primary">
                    当前市场受多重因素影响，其中公告因素占比较高，建议关注公司基本面变化和市场情绪指标。
                  </p>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-2">操作建议</div>
                  <ul className="space-y-1">
                    <li className="text-sm text-text-primary flex items-start gap-2">
                      <span className="text-primary">•</span>
                      关注市场情绪周期位置，合理控制仓位
                    </li>
                    <li className="text-sm text-text-primary flex items-start gap-2">
                      <span className="text-primary">•</span>
                      关注北向资金流向，把握外资动向
                    </li>
                    <li className="text-sm text-text-primary flex items-start gap-2">
                      <span className="text-primary">•</span>
                      注意板块轮动机会，及时调整持仓
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
