import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSentimentStore } from '../store';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sentiments } = useSentimentStore();
  
  const news = sentiments.find(s => s.id === id);

  if (!news) {
    return (
      <div className="min-h-screen bg-background-main py-8">
        <div className="container mx-auto px-4">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-4">新闻未找到</h2>
            <button 
              onClick={() => navigate('/sentiments')}
              className="btn btn-primary"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sentimentLabels = {
    positive: '正面',
    negative: '负面',
    neutral: '中性'
  };

  const sentimentColors = {
    positive: '#28A745',
    negative: '#DC3545',
    neutral: '#FFC107'
  };

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>

        <article className="card p-8">
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${sentimentColors[news.sentiment]}20`,
                  color: sentimentColors[news.sentiment]
                }}
              >
                {sentimentLabels[news.sentiment]}
              </span>
              <span className="text-text-secondary text-sm">{news.category}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
              {news.title}
            </h1>

            <div className="flex items-center gap-4 text-text-secondary text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {news.sourceName}
              </span>
              <span>•</span>
              <span>{formatDate(news.publishTime)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {news.heatIndex} 阅读
              </span>
            </div>
          </header>

          <div className="prose max-w-none mb-8">
            <p className="text-lg text-text-primary leading-relaxed">
              {news.content || news.summary}
            </p>
          </div>

          {news.relatedStocks && news.relatedStocks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">相关股票</h3>
              <div className="flex flex-wrap gap-2">
                {news.relatedStocks.map(stock => (
                  <span 
                    key={stock}
                    className="px-3 py-1 bg-primary-light/30 text-primary-light rounded-full text-sm"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>
          )}

          {news.tags && news.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">标签</h3>
              <div className="flex flex-wrap gap-2">
                {news.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-background-dark text-text-secondary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <footer className="border-t border-border pt-6">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              查看原文
            </a>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;
