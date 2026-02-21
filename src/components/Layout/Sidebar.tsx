import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSentimentStore } from '../../store';
import { SourceType } from '../../types';
import { sourceLabels } from '../../data/mockData';

const navItems = [
  { path: '/', label: '首页', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/market-overview', label: '全景看板', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/data-platform', label: '数据中台', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { path: '/review', label: '量化复盘', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

const navExpandableItems = [
  { 
    key: 'shortTerm', 
    label: '短线复盘', 
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    items: shortTermReviewItems 
  },
  { 
    key: 'sentiment', 
    label: '情绪分析', 
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    items: sentimentAnalysisItems 
  },
];

const quickAccessItems = [
  { path: '/sentiments', label: '舆情列表', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', color: 'from-blue-500 to-cyan-400' },
  { path: '/sources', label: '数据源', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', color: 'from-purple-500 to-pink-400' },
  { path: '/monitor', label: '监测中心', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'from-orange-500 to-red-400' },
];

const shortTermReviewItems = [
  { path: '/short-term/core-market', label: '核心大盘' },
  { path: '/short-term/limit-up-tier', label: '涨停梯队' },
  { path: '/short-term/limit-up-themes', label: '涨停题材' },
  { path: '/short-term/broken-pool', label: '炸板池' },
  { path: '/short-term/limit-down-pool', label: '跌停池' },
  { path: '/short-term/large-drawdown', label: '大幅回撤' },
  { path: '/short-term/big-noodles-pool', label: '大面池' },
  { path: '/short-term/large-surge', label: '大幅拉升' },
  { path: '/short-term/big-meat-pool', label: '大肉池' },
];

const sentimentAnalysisItems = [
  { path: '/sentiment/core-leader-tracking', label: '核心龙头追踪' },
  { path: '/sentiment/leader-cycle-overview', label: '龙头周期全景图' },
  { path: '/sentiment/short-cycle-analysis', label: '短线周期分析' },
  { path: '/sentiment/anomaly-monitoring', label: '异动数据预测/监控' },
];

const timeRanges = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年' },
] as const;

const sources: SourceType[] = ['exchange', 'cninfo', 'stats', 'association'];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, filters, setFilters, statistics } = useSentimentStore();
  const [shortTermExpanded, setShortTermExpanded] = useState(false);
  const [sentimentExpanded, setSentimentExpanded] = useState(false);

  const handleSourceToggle = (source: SourceType) => {
    const currentSources = filters.sources;
    const newSources = currentSources.includes(source)
      ? currentSources.filter((s) => s !== source)
      : [...currentSources, source];
    setFilters({ sources: newSources });
  };

  const handleTimeRangeChange = (timeRange: typeof timeRanges[number]['value']) => {
    setFilters({ timeRange });
  };

  return (
    <aside className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-background-card border-r border-border transition-all duration-300 z-40 overflow-y-auto ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
      <button onClick={toggleSidebar} className="absolute -right-3 top-4 w-6 h-6 bg-background-card border border-border rounded-full flex items-center justify-center hover:bg-primary transition-colors z-50">
        <svg className={`w-4 h-4 text-text-secondary transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {!sidebarCollapsed && (
        <div className="p-4">
          <nav className="space-y-1 mb-4">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-dark hover:text-text-primary'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
            
            {navExpandableItems.map((expandableItem) => {
              const isExpanded = expandableItem.key === 'shortTerm' ? shortTermExpanded : sentimentExpanded;
              const setExpanded = expandableItem.key === 'shortTerm' ? setShortTermExpanded : setSentimentExpanded;
              
              return (
                <div key={expandableItem.key} className="relative">
                  <button 
                    onClick={() => setExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-text-secondary hover:bg-background-dark hover:text-text-primary"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandableItem.icon} />
                      </svg>
                      <span className="text-sm">{expandableItem.label}</span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {expandableItem.items.map((item) => (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background-dark hover:text-text-primary'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase mb-3 px-3">快捷入口</h3>
            <div className="space-y-2">
              {quickAccessItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-secondary hover:bg-background-dark hover:text-text-primary border border-transparent'}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase mb-3">时间范围</h3>
              <div className="grid grid-cols-3 gap-2">
                {timeRanges.map((range) => (
                  <button key={range.value} onClick={() => handleTimeRangeChange(range.value)} className={`px-2 py-1 text-xs rounded transition-colors ${filters.timeRange === range.value ? 'bg-primary text-white' : 'bg-background-dark text-text-secondary hover:text-text-primary'}`}>
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase mb-3">热门话题</h3>
              <div className="space-y-2">
                {statistics.hotTopics.slice(0, 6).map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-background-dark cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center text-xs rounded ${index < 3 ? 'bg-accent text-white' : 'bg-background-dark text-text-secondary'}`}>
                        {index + 1}
                      </span>
                      <span className="text-sm text-text-primary truncate max-w-[120px]">{topic.name}</span>
                    </div>
                    {topic.trend === 'up' && (
                      <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase mb-3 px-3">数据源</h3>
              <div className="space-y-2 px-3">
                {sources.map((source) => (
                  <label key={source} className="flex items-center gap-2 cursor-pointer hover:bg-background-dark p-2 rounded transition-colors">
                    <input type="checkbox" checked={filters.sources.includes(source)} onChange={() => handleSourceToggle(source)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-text-primary">{sourceLabels[source]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
