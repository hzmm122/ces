import React, { useEffect, useState } from 'react';
import { useSentimentStore } from '../store';
import { StatCard } from '../components/UI';
import { TrendChart, SourcePieChart, SentimentPieChart } from '../components/Charts';
import { SentimentList } from '../components/Sentiment';

const Dashboard: React.FC = () => {
  const { statistics, loading, lastUpdate, fetchData } = useSentimentStore();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData();
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const todayChange = statistics.yesterdayCount > 0 
    ? ((statistics.todayCount - statistics.yesterdayCount) / statistics.yesterdayCount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">舆情概览</h1>
          <p className="text-text-secondary">实时监测资本市场舆情动态</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            自动刷新
          </label>
          {autoRefresh && (
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-background-card border border-border text-text-primary text-sm rounded px-2 py-1"
            >
              <option value={10}>10秒</option>
              <option value={30}>30秒</option>
              <option value={60}>1分钟</option>
              <option value={300}>5分钟</option>
            </select>
          )}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? '更新中...' : '刷新数据'}
          </button>
        </div>
      </div>

      {lastUpdate && (
        <div className="flex items-center gap-4">
          <p className="text-xs text-text-secondary">
            最后更新: {new Date(lastUpdate).toLocaleString('zh-CN')}
          </p>
          {autoRefresh && (
            <span className="text-xs text-success flex items-center gap-1">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              自动刷新中 ({refreshInterval}秒)
            </span>
          )}
        </div>
      )}

      {loading && statistics.totalCount === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-12 h-12 text-primary animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-text-secondary">正在加载数据...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="舆情总量"
              value={statistics.totalCount}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              }
              color="#1E3A5F"
            />
            <StatCard
              title="今日新增"
              value={statistics.todayCount}
              change={todayChange}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              color="#FF6B35"
            />
            <StatCard
              title="正面舆情"
              value={Math.round(statistics.positiveRatio * 100)}
              suffix="%"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="#28A745"
            />
            <StatCard
              title="负面舆情"
              value={Math.round(statistics.negativeRatio * 100)}
              suffix="%"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              color="#DC3545"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TrendChart />
            </div>
            <div>
              <SentimentPieChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <SourcePieChart />
            </div>
            <div className="lg:col-span-3">
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">最新舆情</h3>
                <SentimentList />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
