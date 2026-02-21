import React, { useState } from 'react';

interface DayData {
  date: string;
  dayOfWeek: string;
  changePercent: number;
  amount: string;
  limitUpCount: number;
  themes: { name: string; count: number }[];
  leaders: string[];
}

const cycleData: DayData[] = [
  {
    date: '2026-02-13',
    dayOfWeek: '周五',
    changePercent: 0.09,
    amount: '19843亿',
    limitUpCount: 39,
    themes: [],
    leaders: [],
  },
  {
    date: '2026-02-12',
    dayOfWeek: '周四',
    changePercent: 0.13,
    amount: '21055亿',
    limitUpCount: 20,
    themes: [
      { name: '影视', count: 14 },
      { name: '传媒', count: 10 },
      { name: '人工智能大模型', count: 6 },
    ],
    leaders: ['百川股份'],
  },
  {
    date: '2026-02-11',
    dayOfWeek: '周三',
    changePercent: 0,
    amount: '',
    limitUpCount: 0,
    themes: [],
    leaders: [],
  },
  {
    date: '2026-02-10',
    dayOfWeek: '周二',
    changePercent: 0.13,
    amount: '21055亿',
    limitUpCount: 37,
    themes: [
      { name: '光伏', count: 14 },
      { name: '人工智能大模型', count: 13 },
      { name: '航天', count: 9 },
    ],
    leaders: ['金富科技', '协鑫集成', '凯龙高科', '韩建河山'],
  },
  {
    date: '2026-02-09',
    dayOfWeek: '周一',
    changePercent: 1.41,
    amount: '22495亿',
    limitUpCount: 69,
    themes: [
      { name: '光伏', count: 14 },
      { name: '人工智能大模型', count: 13 },
      { name: '航天', count: 9 },
    ],
    leaders: ['金富科技', '协鑫集成', '凯龙高科', '韩建河山'],
  },
  {
    date: '2026-02-06',
    dayOfWeek: '周五',
    changePercent: -0.25,
    amount: '21457亿',
    limitUpCount: 74,
    themes: [
      { name: '机器人', count: 10 },
      { name: '固态电池', count: 6 },
      { name: '石油化工', count: 6 },
    ],
    leaders: ['杭州解百', '协鑫集成', '凯龙高科', '韩建河山'],
  },
  {
    date: '2026-02-05',
    dayOfWeek: '周四',
    changePercent: -0.64,
    amount: '21762亿',
    limitUpCount: 47,
    themes: [
      { name: '大消费', count: 15 },
      { name: '其他', count: 8 },
      { name: '资产重组', count: 4 },
    ],
    leaders: ['京投发展', '韩建河山', '民爆光电'],
  },
  {
    date: '2026-02-04',
    dayOfWeek: '周三',
    changePercent: 0.85,
    amount: '24810亿',
    limitUpCount: 59,
    themes: [
      { name: '煤炭', count: 14 },
      { name: '光伏', count: 13 },
      { name: '房地产', count: 7 },
    ],
    leaders: ['顺钠股份', '民爆光电', '名雕股份', '杭电股份'],
  },
  {
    date: '2026-02-03',
    dayOfWeek: '周二',
    changePercent: 1.29,
    amount: '25442亿',
    limitUpCount: 95,
    themes: [
      { name: '航天', count: 15 },
      { name: '光伏', count: 11 },
      { name: '机器人', count: 6 },
    ],
    leaders: ['名雕股份', '杭电股份', '万丰股份', '横店影视', '皇台酒业'],
  },
  {
    date: '2026-02-02',
    dayOfWeek: '周一',
    changePercent: -2.48,
    amount: '25848亿',
    limitUpCount: 44,
    themes: [
      { name: '智能电网', count: 12 },
      { name: '大消费', count: 7 },
      { name: '其他', count: 5 },
    ],
    leaders: ['横店影视', '万丰股份', '皇台酒业'],
  },
  {
    date: '2026-01-30',
    dayOfWeek: '周五',
    changePercent: -0.96,
    amount: '28355亿',
    limitUpCount: 67,
    themes: [
      { name: '业绩增长', count: 8 },
      { name: '其他', count: 7 },
      { name: '光通信', count: 7 },
    ],
    leaders: ['百川股份', '湖南黄金'],
  },
];

const getChangeColor = (value: number) => {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
};

const getThemeColor = (themeName: string) => {
  const colors: Record<string, string> = {
    '人工智能大模型': 'bg-purple-500/20 text-purple-400',
    '光伏': 'bg-yellow-500/20 text-yellow-400',
    '机器人': 'bg-blue-500/20 text-blue-400',
    '航天': 'bg-red-500/20 text-red-400',
    '影视': 'bg-pink-500/20 text-pink-400',
    '传媒': 'bg-rose-500/20 text-rose-400',
    '半导体': 'bg-cyan-500/20 text-cyan-400',
    '固态电池': 'bg-emerald-500/20 text-emerald-400',
    '石油化工': 'bg-orange-500/20 text-orange-400',
    '大消费': 'bg-green-500/20 text-green-400',
    '房地产': 'bg-amber-500/20 text-amber-400',
    '煤炭': 'bg-stone-500/20 text-stone-400',
    '智能电网': 'bg-indigo-500/20 text-indigo-400',
    '业绩增长': 'bg-teal-500/20 text-teal-400',
    '光通信': 'bg-sky-500/20 text-sky-400',
  };
  return colors[themeName] || 'bg-gray-500/20 text-gray-400';
};

const SentimentShortCycleAnalysis: React.FC = () => {
  const [expandedDay, setExpandedDay] = useState<string | null>('2026-02-13');

  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const activeDays = cycleData.filter(d => d.themes.length > 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">短线周期分析</h1>
        <p className="text-sm text-text-secondary">追踪市场短线周期变化</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {cycleData.map((day) => {
              const isActive = day.themes.length > 0;
              const isExpanded = expandedDay === day.date;
              
              return (
                <div key={day.date} className="border-b border-border last:border-b-0">
                  <div 
                    className={`flex items-center p-3 cursor-pointer transition-colors ${
                      isActive ? 'hover:bg-background-dark/50' : 'opacity-50'
                    }`}
                    onClick={() => isActive && toggleDay(day.date)}
                  >
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-text-primary">{day.date}</span>
                      <span className="ml-1 text-xs text-text-secondary">({day.dayOfWeek})</span>
                    </div>
                    
                    <div className="w-20 flex-shrink-0 text-center">
                      <span className={`text-sm font-bold ${getChangeColor(day.changePercent)}`}>
                        {day.changePercent > 0 ? '+' : ''}{day.changePercent}%
                      </span>
                    </div>
                    
                    <div className="w-24 flex-shrink-0 text-center">
                      <span className="text-sm text-text-primary">{day.amount}</span>
                    </div>
                    
                    <div className="w-20 flex-shrink-0 text-center">
                      {isActive ? (
                        <span className="text-sm font-medium text-green-500">{day.limitUpCount}</span>
                      ) : (
                        <span className="text-sm text-text-secondary">-</span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex items-center gap-2 overflow-hidden">
                      {isActive ? (
                        <>
                          <div className="flex gap-1.5 overflow-hidden">
                            {day.themes.slice(0, 3).map((theme, idx) => (
                              <span 
                                key={idx}
                                className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${getThemeColor(theme.name)}`}
                              >
                                {theme.name} {theme.count}
                              </span>
                            ))}
                          </div>
                          {day.leaders.length > 0 && (
                            <div className="flex items-center gap-1 ml-2">
                              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="text-xs text-primary truncate">{day.leaders.join('、')}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-text-secondary">暂无数据</span>
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="w-6 flex-shrink-0 flex justify-center">
                        <svg 
                          className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {isExpanded && isActive && (
                    <div className="bg-background-dark/30 px-3 py-4 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-text-secondary uppercase mb-2">热门题材</h4>
                          <div className="flex flex-wrap gap-2">
                            {day.themes.map((theme, idx) => (
                              <span 
                                key={idx}
                                className={`px-3 py-1.5 rounded-lg text-sm ${getThemeColor(theme.name)}`}
                              >
                                {theme.name}
                                <span className="ml-1 opacity-75">{theme.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-text-secondary uppercase mb-2">领涨标的</h4>
                          <div className="flex flex-wrap gap-2">
                            {day.leaders.map((leader, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                              >
                                {leader}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-text-secondary mb-3">周期统计</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">活跃天数</span>
              <span className="text-lg font-bold text-text-primary">{activeDays.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">平均涨停数</span>
              <span className="text-lg font-bold text-green-500">
                {Math.round(activeDays.reduce((sum, d) => sum + d.limitUpCount, 0) / activeDays.length)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">总成交额</span>
              <span className="text-lg font-bold text-text-primary">24.65万亿</span>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-text-secondary mb-3">热门题材排行</h3>
          <div className="space-y-2">
            {[
              { name: '光伏', count: 28 },
              { name: '人工智能大模型', count: 19 },
              { name: '航天', count: 18 },
              { name: '机器人', count: 16 },
              { name: '大消费', count: 15 },
            ].map((theme, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                    idx === 0 ? 'bg-primary/20 text-primary' :
                    idx === 1 ? 'bg-green-500/20 text-green-500' :
                    idx === 2 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm text-text-primary">{theme.name}</span>
                </div>
                <span className="text-sm text-text-secondary">{theme.count}天</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-text-secondary mb-3">领涨标的排行</h3>
          <div className="space-y-2">
            {['百川股份', '横店影视', '万丰股份', '皇台酒业', '韩建河山'].map((stock, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                    idx === 0 ? 'bg-primary/20 text-primary' :
                    idx === 1 ? 'bg-green-500/20 text-green-500' :
                    idx === 2 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm text-text-primary">{stock}</span>
                </div>
                <span className="text-xs text-green-500">{5 - idx}次</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentShortCycleAnalysis;
