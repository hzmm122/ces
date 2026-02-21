import React, { useState } from 'react';
import { useSentimentStore } from '../store';

const Monitor: React.FC = () => {
  const { filters, setFilters } = useSentimentStore();
  const [newKeyword, setNewKeyword] = useState('');
  const [newStock, setNewStock] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setFilters({ keyword: newKeyword.trim() });
      setNewKeyword('');
    }
  };

  const handleAddStock = () => {
    if (newStock.trim() && !filters.relatedStocks.includes(newStock.trim())) {
      setFilters({ 
        relatedStocks: [...filters.relatedStocks, newStock.trim()] 
      });
      setNewStock('');
    }
  };

  const handleRemoveStock = (stock: string) => {
    setFilters({ 
      relatedStocks: filters.relatedStocks.filter(s => s !== stock) 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">监测中心</h1>
        <p className="text-text-secondary">配置关键词和关注股票</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">关键词监测</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="输入关键词..."
              className="flex-1 h-10 px-3 bg-background-dark border border-border rounded text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary"
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <button
              onClick={handleAddKeyword}
              className="btn btn-primary"
            >
              添加
            </button>
          </div>
          {filters.keyword && (
            <div className="flex items-center gap-2 p-3 bg-background-dark rounded">
              <span className="text-text-primary">{filters.keyword}</span>
              <button
                onClick={() => setFilters({ keyword: '' })}
                className="ml-auto text-text-secondary hover:text-danger"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">关注股票</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="输入股票代码..."
              className="flex-1 h-10 px-3 bg-background-dark border border-border rounded text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary"
              onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
            />
            <button
              onClick={handleAddStock}
              className="btn btn-primary"
            >
              添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.relatedStocks.map((stock) => (
              <span
                key={stock}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary-light rounded"
              >
                {stock}
                <button
                  onClick={() => handleRemoveStock(stock)}
                  className="hover:text-danger"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {filters.relatedStocks.length === 0 && (
              <p className="text-text-secondary text-sm">暂无关注的股票</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">预警设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-background-dark rounded">
            <div>
              <p className="text-text-primary font-medium">负面舆情预警</p>
              <p className="text-sm text-text-secondary">当出现重大负面舆情时发送通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background-dark rounded">
            <div>
              <p className="text-text-primary font-medium">热度飙升预警</p>
              <p className="text-sm text-text-secondary">当话题热度快速上升时发送通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-background-dark rounded">
            <div>
              <p className="text-text-primary font-medium">关联股票异动</p>
              <p className="text-sm text-text-secondary">关注股票出现重大舆情时发送通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor;
