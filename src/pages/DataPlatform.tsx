import React, { useState, useEffect } from 'react';
import { fetchAnnouncements, fetchPolicyNews, fetchMarketSentiment, AnnouncementData, PolicyNewsData } from '../services/announcementApi';
import { fetchMarketData, fetchIndustryData, IndexQuote, StockQuote } from '../services/realtimeStockApi';
import { AnnouncementType, PolicyTag } from '../types';
import CapitalFlowChart from '../components/Charts/CapitalFlowChart';

const announcementTypes: AnnouncementType[] = [
  '业绩预告', '增减持', '并购重组', '监管处罚', '股权质押',
  '分红送转', '配股发行', '人事变动', '重大合同', '其他'
];

const policyTags: PolicyTag[] = [
  '数字金融', '供应链金融', 'AI安全应用', '新能源', '半导体', '生物医药', '新材料'
];

interface MarketSentimentData {
  cycle: string;
  sentimentIndex: number;
  upCount: number;
  downCount: number;
  limitUpCount: number;
  limitDownCount: number;
  northboundFlow: number;
}

interface DragonStockItem {
  id: string;
  name: string;
  code: string;
  days: number;
  concept: string;
  changePercent: number;
}

const DataPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'news' | 'policy'>('announcements');
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [policyNews, setPolicyNews] = useState<PolicyNewsData[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [topStocks, setTopStocks] = useState<DragonStockItem[]>([]);
  const [selectedType, setSelectedType] = useState<AnnouncementType | 'all'>('all');
  const [selectedPolicyTag, setSelectedPolicyTag] = useState<PolicyTag | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [announcementsData, policyData, sentimentData, marketResult] = await Promise.all([
        fetchAnnouncements(),
        fetchPolicyNews(),
        fetchMarketSentiment(),
        fetchMarketData(),
      ]);

      setAnnouncements(announcementsData);
      setPolicyNews(policyData);
      setMarketSentiment(sentimentData);
      setIndices(marketResult.indices);

      const dragons: DragonStockItem[] = marketResult.stocks.slice(0, 5).map((s, i) => ({
        id: `dragon_${i}`,
        name: s.name,
        code: s.code,
        days: Math.floor(Math.random() * 5) + 2,
        concept: '热门题材',
        changePercent: s.changePercent,
      }));
      setTopStocks(dragons);
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

  const filteredAnnouncements = selectedType === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === selectedType);

  const filteredPolicyNews = selectedPolicyTag === 'all'
    ? policyNews
    : policyNews.filter(p => p.tags.some(t => policyTags.includes(t as PolicyTag)));

  const getImpactColor = (direction: '利好' | '利空' | '中性') => {
    switch (direction) {
      case '利好': return 'text-green-500';
      case '利空': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getImpactBg = (direction: '利好' | '利空' | '中性') => {
    switch (direction) {
      case '利好': return 'bg-green-500/20';
      case '利空': return 'bg-red-500/20';
      default: return 'bg-yellow-500/20';
    }
  };

  const getCycleColor = (cycle: string) => {
    switch (cycle) {
      case '冰点': return 'text-blue-500';
      case '修复': return 'text-green-500';
      case '高潮': return 'text-red-500';
      case '退潮': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">数据中台</h1>
          <p className="text-text-secondary">全维度数据整合，公告、舆情、政策一站式查询</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新数据
        </button>
      </div>

      {/* 市场指数概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {indices.map((idx) => (
          <div key={idx.code} className="card p-4">
            <div className="text-sm text-text-secondary mb-1">{idx.name}</div>
            <div className="text-2xl font-bold text-text-primary">{idx.price.toFixed(2)}</div>
            <div className={`text-xs ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>

      {/* 当日资金趋势 */}
      <CapitalFlowChart />

      {/* 市场情绪 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-text-secondary mb-1">市场情绪</div>
          <div className="text-2xl font-bold text-text-primary">
            {marketSentiment?.cycle || '-'}
          </div>
          <div className={`text-xs ${getCycleColor(marketSentiment?.cycle || '')}`}>
            {marketSentiment?.sentimentIndex || 0} 指数
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-text-secondary mb-1">涨跌家数</div>
          <div className="text-2xl font-bold text-green-500">
            {marketSentiment?.upCount || 0} / {marketSentiment?.downCount || 0}
          </div>
          <div className="text-xs text-text-secondary">上涨 / 下跌</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-text-secondary mb-1">涨停/跌停</div>
          <div className="text-2xl font-bold text-green-500">
            {marketSentiment?.limitUpCount || 0}
          </div>
          <div className="text-xs text-red-500">
            -{marketSentiment?.limitDownCount || 0}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-text-secondary mb-1">北向资金</div>
          <div className={`text-2xl font-bold ${(marketSentiment?.northboundFlow || 0) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {((marketSentiment?.northboundFlow || 0) / 100).toFixed(1)}亿
          </div>
          <div className="text-xs text-text-secondary">今日净流入</div>
        </div>
      </div>

      {/* 涨跌幅排名 */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">涨跌幅排名</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topStocks.map((stock, idx) => (
            <div key={stock.id} className="bg-background-dark p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-text-primary">{stock.name}</span>
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">TOP{idx + 1}</span>
              </div>
              <div className="text-xs text-text-secondary mb-1">{stock.code}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary">{stock.concept}</span>
                <span className={`text-xs ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'announcements' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          上市公司公告
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'news' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          舆情汇总
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'policy' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          政策追踪
        </button>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-2">
        {activeTab === 'announcements' && (
          <>
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedType === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-background-dark text-text-secondary hover:text-text-primary'
              }`}
            >
              全部
            </button>
            {announcementTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedType === type 
                    ? 'bg-primary text-white' 
                    : 'bg-background-dark text-text-secondary hover:text-text-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </>
        )}
        {activeTab === 'policy' && (
          <>
            <button
              onClick={() => setSelectedPolicyTag('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedPolicyTag === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-background-dark text-text-secondary hover:text-text-primary'
              }`}
            >
              全部
            </button>
            {policyTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedPolicyTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedPolicyTag === tag 
                    ? 'bg-primary text-white' 
                    : 'bg-background-dark text-text-secondary hover:text-text-primary'
                }`}
              >
                {tag}
              </button>
            ))}
          </>
        )}
      </div>

      {/* 内容列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">加载中...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'announcements' && filteredAnnouncements.map(ann => (
            <div key={ann.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                    {ann.type}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {ann.stockName}
                  </span>
                  <span className="text-xs text-text-secondary">{ann.stockCode}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getImpactBg(ann.impactDirection)} ${getImpactColor(ann.impactDirection)}`}>
                  {ann.impactDirection}
                </span>
              </div>
              <h4 className="text-base font-medium text-text-primary mb-2">{ann.title}</h4>
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">{ann.content}</p>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{ann.source} • {new Date(ann.publishTime).toLocaleString('zh-CN')}</span>
                <a 
                  href={ann.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  查看原文
                </a>
              </div>
            </div>
          ))}

          {activeTab === 'news' && filteredAnnouncements.slice(0, 10).map(news => (
            <div key={news.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">{news.source}</span>
                  <span className="text-xs text-text-secondary">•</span>
                  <span className="text-xs text-text-secondary">{news.type}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getImpactBg(news.impactDirection)} ${getImpactColor(news.impactDirection)}`}>
                  {news.impactDirection}
                </span>
              </div>
              <h4 className="text-base font-medium text-text-primary mb-2">{news.title}</h4>
              <p className="text-sm text-text-secondary mb-3 line-clamp-2">{news.summary}</p>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>
                  {new Date(news.publishTime).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          ))}

          {activeTab === 'policy' && filteredPolicyNews.map(policy => (
            <div key={policy.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    policy.impactLevel === 'high' ? 'bg-red-500/20 text-red-500' :
                    policy.impactLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {policy.impactLevel === 'high' ? '高影响' : policy.impactLevel === 'medium' ? '中影响' : '低影响'}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  {new Date(policy.publishTime).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <h4 className="text-base font-medium text-text-primary mb-2">{policy.title}</h4>
              <p className="text-sm text-text-secondary mb-3">{policy.content}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {policy.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-text-secondary">
                来源: {policy.source}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataPlatform;
