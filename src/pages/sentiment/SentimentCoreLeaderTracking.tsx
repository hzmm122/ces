import React, { useState, useEffect } from 'react';

interface LeaderStock {
  id: string;
  code: string;
  name: string;
  theme: string;
  days: number;
  prices: number[];
  currentPrice: number;
  changePercent: number;
  turnover: number;
  turnoverRate: number;
  marketCap: number;
}

interface ThemeData {
  name: string;
  count: number;
}

const dates = [
  { value: '2026-02-13', label: '2026-02-13(周五)' },
  { value: '2026-02-12', label: '2026-02-12(周四)' },
  { value: '2026-02-11', label: '2026-02-11(周三)' },
  { value: '2026-02-10', label: '2026-02-10(周二)' },
  { value: '2026-02-09', label: '2026-02-09(周一)' },
  { value: '2026-02-06', label: '2026-02-06(周五)' },
  { value: '2026-02-05', label: '2026-02-05(周四)' },
  { value: '2026-02-04', label: '2026-02-04(周三)' },
  { value: '2026-02-03', label: '2026-02-03(周二)' },
  { value: '2026-02-02', label: '2026-02-02(周一)' },
];

const generateMockData = (): { leaders: LeaderStock[]; themes: ThemeData[]; marketChange: number; marketCap: number } => {
  const themes: ThemeData[] = [
    { name: '人工智能大模型', count: 14 },
    { name: '光伏', count: 13 },
    { name: '机器人', count: 10 },
    { name: '固态电池', count: 6 },
    { name: '石油化工', count: 6 },
    { name: '影视', count: 14 },
    { name: '传媒', count: 10 },
    { name: '玻纤', count: 8 },
    { name: '有色金属', count: 7 },
    { name: '云计算数据中心', count: 4 },
  ];

  const stocks: LeaderStock[] = [
    { id: '1', code: '000001', name: '平安银行', theme: '大消费', days: 2, prices: [10, 11, 11.05], currentPrice: 11.05, changePercent: 10.05, turnover: 1776000000, turnoverRate: 12, marketCap: 210000000000 },
    { id: '2', code: '000002', name: '万科A', theme: '房地产', days: 1, prices: [9, 9.9, 9.89], currentPrice: 9.89, changePercent: -10, turnover: 1055000000, turnoverRate: 6, marketCap: 98000000000 },
    { id: '3', code: '600001', name: '邯郸钢铁', theme: '钢铁', days: 1, prices: [6, 6.6, 6.55], currentPrice: 6.55, changePercent: -3.8, turnover: 1709000000, turnoverRate: 12, marketCap: 142000000000 },
    { id: '4', code: '600002', name: '齐鲁石化', theme: '石油化工', days: 2, prices: [8, 8.8, 8.52], currentPrice: 8.52, changePercent: 5.23, turnover: 1814000000, turnoverRate: 18, marketCap: 156000000000 },
    { id: '5', code: '600003', name: '东北制药', theme: '医药', days: 1, prices: [12, 12.5, 11.52], currentPrice: 11.52, changePercent: -3.49, turnover: 1587000000, turnoverRate: 8, marketCap: 87000000000 },
    { id: '6', code: '000003', name: 'PT水庄', theme: '其他', days: 1, prices: [3, 2.7, 2.43], currentPrice: 2.43, changePercent: -10, turnover: 1026000000, turnoverRate: -12, marketCap: 12000000000 },
    { id: '7', code: '000004', name: '国农科技', theme: '农业', days: 1, prices: [15, 14.5, 13.14], currentPrice: 13.14, changePercent: -9.48, turnover: 1000000000, turnoverRate: -12, marketCap: 18000000000 },
    { id: '8', code: '600010', name: '包钢股份', theme: '稀土', days: 3, prices: [3, 3.3, 3.63, 3.99], currentPrice: 3.99, changePercent: 9.97, turnover: 7800000000, turnoverRate: 33, marketCap: 156000000000 },
    { id: '9', code: '600011', name: '华能国际', theme: '电力', days: 4, prices: [8, 8.8, 9.68, 10.65], currentPrice: 10.65, changePercent: 10.02, turnover: 13000000000, turnoverRate: 39, marketCap: 189000000000 },
    { id: '10', code: '000005', name: '世纪星', theme: '其他', days: 2, prices: [5, 5.5, 5.51], currentPrice: 5.51, changePercent: -9.98, turnover: 7390000000, turnoverRate: 32, marketCap: 42000000000 },
  ];

  return {
    leaders: stocks,
    themes,
    marketChange: 0.13,
    marketCap: 21055000000000,
  };
};

const formatNumber = (num: number): string => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toFixed(2);
};

const SentimentCoreLeaderTracking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-02-13');
  const [marketType, setMarketType] = useState<'10cm' | '20cm'>('10cm');
  const [data, setData] = useState(generateMockData());

  useEffect(() => {
    setData(generateMockData());
  }, [selectedDate]);

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const renderMiniChart = (prices: number[]) => {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const height = 30;
    
    return (
      <div className="flex items-end gap-0.5 h-6">
        {prices.map((price, idx) => {
          const h = ((price - min) / range) * height;
          const isUp = idx > 0 ? price >= prices[idx - 1] : true;
          return (
            <div
              key={idx}
              className={`w-1.5 ${isUp ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ height: Math.max(4, h) }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">核心龙头跟踪</h1>
          <p className="text-sm text-text-secondary">追踪市场核心龙头股动态</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-background-dark rounded-lg p-0.5">
            <button
              onClick={() => setMarketType('10cm')}
              className={`px-3 py-1 text-sm rounded transition-colors ${marketType === '10cm' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              10cm
            </button>
            <button
              onClick={() => setMarketType('20cm')}
              className={`px-3 py-1 text-sm rounded transition-colors ${marketType === '20cm' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              20cm
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {dates.map((date) => (
          <button
            key={date.value}
            onClick={() => setSelectedDate(date.value)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap rounded transition-colors ${
              selectedDate === date.value
                ? 'bg-primary text-white'
                : 'bg-background-dark text-text-secondary hover:text-text-primary'
            }`}
          >
            {date.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-xs text-text-secondary mb-1">大盘涨跌</div>
          <div className={`text-xl font-bold ${getChangeColor(data.marketChange)}`}>
            {data.marketChange > 0 ? '+' : ''}{data.marketChange}%
          </div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-text-secondary mb-1">成交额</div>
          <div className="text-xl font-bold text-text-primary">{formatNumber(21055000000)}</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-text-secondary mb-1">涨停家数</div>
          <div className="text-xl font-bold text-green-500">45</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-text-secondary mb-1">跌停家数</div>
          <div className="text-xl font-bold text-red-500">12</div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-base font-semibold text-text-primary mb-3">热门题材</h3>
        <div className="flex flex-wrap gap-2">
          {data.themes.map((theme, idx) => (
            <button
              key={idx}
              className="px-3 py-1.5 bg-background-dark rounded-lg hover:bg-primary/20 transition-colors group"
            >
              <span className="text-sm text-text-primary group-hover:text-primary">{theme.name}</span>
              <span className="ml-1.5 text-xs text-text-secondary">{theme.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-dark">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">股票</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">连板</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">涨跌幅</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">近期走势</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">成交额</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">换手率</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">流通市值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.leaders.map((stock) => (
                <tr key={stock.id} className="hover:bg-background-dark/50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{stock.name}</span>
                          <span className="text-xs text-text-secondary">{stock.code}</span>
                        </div>
                        <span className="text-xs text-primary">{stock.theme}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-sm font-bold rounded ${
                      stock.days >= 3 ? 'bg-orange-500/20 text-orange-500' :
                      stock.days >= 2 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {stock.days}板
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      {renderMiniChart(stock.prices)}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-sm text-text-primary">{formatNumber(stock.turnover)}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-sm ${stock.turnoverRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.turnoverRate > 0 ? '' : ''}{stock.turnoverRate}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-sm text-text-primary">{formatNumber(stock.marketCap)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SentimentCoreLeaderTracking;
