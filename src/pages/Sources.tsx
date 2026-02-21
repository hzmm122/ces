import React from 'react';
import { useSentimentStore } from '../store';
import { SourceType } from '../types';
import { sourceLabels } from '../data/mockData';

const Sources: React.FC = () => {
  const { sentiments, filters, setFilters } = useSentimentStore();

  const sourceData: SourceType[] = ['exchange', 'cninfo', 'stats', 'association'];

  const getSourceStats = (source: SourceType) => {
    const items = sentiments.filter(s => s.source === source);
    const positive = items.filter(s => s.sentiment === 'positive').length;
    const negative = items.filter(s => s.sentiment === 'negative').length;
    const neutral = items.filter(s => s.sentiment === 'neutral').length;
    return {
      total: items.length,
      positive,
      negative,
      neutral,
    };
  };

  const getSourceIcon = (source: SourceType) => {
    const icons: Record<SourceType, React.ReactNode> = {
      exchange: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      cninfo: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      stats: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      association: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    };
    return icons[source];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">数据源管理</h1>
        <p className="text-text-secondary">查看各数据源的舆情统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceData.map((source) => {
          const stats = getSourceStats(source);
          const isActive = filters.sources.length === 0 || filters.sources.includes(source);
          
          return (
            <div 
              key={source} 
              className={`card p-4 cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                if (isActive && filters.sources.length > 0) {
                  setFilters({ sources: filters.sources.filter(s => s !== source) });
                } else if (!isActive) {
                  setFilters({ sources: [source] });
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    {getSourceIcon(source)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{sourceLabels[source]}</h3>
                    <p className="text-sm text-text-secondary">数据接口正常</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{stats.total}</p>
                  <p className="text-xs text-text-secondary">条记录</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-success">{stats.positive}</p>
                  <p className="text-xs text-text-secondary">正面</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-warning">{stats.neutral}</p>
                  <p className="text-xs text-text-secondary">中性</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-danger">{stats.negative}</p>
                  <p className="text-xs text-text-secondary">负面</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sources;
