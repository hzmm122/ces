import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

interface CycleStock {
  id: string;
  code: string;
  name: string;
  theme: string;
  currentPrice: number;
  changePercent: number;
  days: number;
  totalDays: number;
  marketCap: number;
}

interface CycleData {
  date: string;
  leaders: CycleStock[];
}

const dates = [
  { value: '2026-02-13', label: '2026-02-13' },
  { value: '2026-02-12', label: '2026-02-12' },
  { value: '2026-02-11', label: '2026-02-11' },
  { value: '2026-02-10', label: '2026-02-10' },
  { value: '2026-02-09', label: '2026-02-09' },
  { value: '2026-02-06', label: '2026-02-06' },
];

const themes = [
  { name: '人工智能大模型', count: 15, change: 3.25 },
  { name: '光伏', count: 12, change: -1.45 },
  { name: '机器人', count: 10, change: 2.86 },
  { name: '影视', count: 14, change: 5.67 },
  { name: '半导体', count: 8, change: 1.23 },
  { name: '固态电池', count: 6, change: -2.34 },
];

const generateMockData = (): CycleData => {
  const leaders: CycleStock[] = [
    { id: '1', code: '000001', name: '平安银行', theme: '大消费', currentPrice: 15.8, changePercent: 10.05, days: 2, totalDays: 5, marketCap: 210000000000 },
    { id: '2', code: '600001', name: '邯郸钢铁', theme: '石油化工', currentPrice: 6.2, changePercent: 9.96, days: 1, totalDays: 3, marketCap: 156000000000 },
    { id: '3', code: '600010', name: '包钢股份', theme: '稀土', currentPrice: 3.99, changePercent: 9.97, days: 3, totalDays: 4, marketCap: 142000000000 },
    { id: '4', code: '600011', name: '华能国际', theme: '电力', currentPrice: 10.65, changePercent: 10.02, days: 4, totalDays: 6, marketCap: 189000000000 },
    { id: '5', code: '000002', name: '万科A', theme: '房地产', currentPrice: 8.5, changePercent: -9.98, days: 1, totalDays: 2, marketCap: 98000000000 },
    { id: '6', code: '000003', name: 'PT水庄', theme: '其他', currentPrice: 2.43, changePercent: -10, days: 1, totalDays: 1, marketCap: 12000000000 },
  ];

  return {
    date: '2026-02-13',
    leaders,
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

const SentimentLeaderCycleOverview: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-02-13');
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [data, setData] = useState<CycleData>(generateMockData());

  useEffect(() => {
    setData(generateMockData());
  }, [selectedDate]);

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const trendChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: { color: '#E8F1F8' },
    },
    legend: {
      data: ['平安银行', '包钢股份', '华能国际'],
      textStyle: { color: '#8BA3B9' },
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: zoomEnabled ? '15%' : '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['01-28', '01-29', '01-30', '01-31', '02-03', '02-04', '02-05', '02-06', '02-09', '02-10', '02-11', '02-12', '02-13'],
      axisLine: { lineStyle: { color: '#2C3E50' } },
      axisLabel: { color: '#8BA3B9' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2C3E50' } },
      axisLabel: { color: '#8BA3B9' },
      splitLine: { lineStyle: { color: '#2C3E50', type: 'dashed' } },
    },
    dataZoom: zoomEnabled ? [{
      type: 'inside',
      start: 0,
      end: 100,
    }] : undefined,
    series: [
      {
        name: '平安银行',
        type: 'line',
        smooth: true,
        data: [10.0, 10.5, 10.8, 11.0, 11.2, 11.5, 11.8, 12.0, 12.5, 13.0, 14.0, 15.0, 15.8],
        itemStyle: { color: '#FF6B6B' },
        lineStyle: { width: 2 },
      },
      {
        name: '包钢股份',
        type: 'line',
        smooth: true,
        data: [2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.5, 3.7, 3.8, 3.99],
        itemStyle: { color: '#4ECDC4' },
        lineStyle: { width: 2 },
      },
      {
        name: '华能国际',
        type: 'line',
        smooth: true,
        data: [6.0, 6.2, 6.5, 6.8, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.3, 10.65],
        itemStyle: { color: '#FFD93D' },
        lineStyle: { width: 2 },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">龙头周期全景图</h1>
          <p className="text-sm text-text-secondary">展示龙头股完整周期</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={zoomEnabled}
              onChange={(e) => setZoomEnabled(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            缩放开关
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm text-text-secondary whitespace-nowrap">日期至</span>
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

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">热门题材</h3>
          <span className="text-xs text-text-secondary">实时更新</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {themes.map((theme, idx) => (
            <div
              key={idx}
              className="bg-background-dark rounded-lg p-3 hover:ring-1 hover:ring-primary/30 transition-all cursor-pointer"
            >
              <div className="text-sm font-medium text-text-primary mb-1 truncate">{theme.name}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{theme.count}只</span>
                <span className={`text-xs font-medium ${getChangeColor(theme.change)}`}>
                  {theme.change > 0 ? '+' : ''}{theme.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-base font-semibold text-text-primary mb-4">龙头个股趋势</h3>
        <ReactECharts option={trendChartOption} style={{ height: '350px' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3">连板龙头</h3>
          <div className="space-y-2">
            {data.leaders.filter(l => l.days >= 2).map((stock) => (
              <div key={stock.id} className="flex items-center justify-between bg-background-dark p-3 rounded-lg hover:ring-1 hover:ring-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                    stock.days >= 4 ? 'bg-orange-500/20 text-orange-500' :
                    stock.days >= 3 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {stock.days}板
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{stock.name}</span>
                      <span className="text-xs text-text-secondary">{stock.code}</span>
                    </div>
                    <span className="text-xs text-primary">{stock.theme}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-text-primary">{stock.currentPrice.toFixed(2)}</div>
                  <div className={`text-xs ${getChangeColor(stock.changePercent)}`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3">龙头板块</h3>
          <div className="space-y-2">
            {themes.slice(0, 4).map((theme, idx) => (
              <div key={idx} className="flex items-center justify-between bg-background-dark p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                    idx === 0 ? 'bg-primary/20 text-primary' :
                    idx === 1 ? 'bg-green-500/20 text-green-500' :
                    idx === 2 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium text-text-primary">{theme.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">{theme.count}只</span>
                  <span className={`text-sm font-medium ${getChangeColor(theme.change)}`}>
                    {theme.change > 0 ? '+' : ''}{theme.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">龙头个股</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-dark">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">股票</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">当前周期</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">最高周期</th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">涨跌幅</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">现价</th>
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
                      stock.days >= 4 ? 'bg-orange-500/20 text-orange-500' :
                      stock.days >= 3 ? 'bg-yellow-500/20 text-yellow-500' :
                      stock.days >= 2 ? 'bg-primary/20 text-primary' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {stock.days}板
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm text-text-primary">{stock.totalDays}板</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-sm text-text-primary">{stock.currentPrice.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-sm text-text-secondary">{formatNumber(stock.marketCap)}</span>
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

export default SentimentLeaderCycleOverview;
