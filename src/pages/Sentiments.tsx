import React from 'react';
import { SentimentList } from '../components/Sentiment';

const Sentiments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">舆情列表</h1>
        <p className="text-text-secondary">查看所有舆情信息</p>
      </div>

      <div className="card p-4">
        <SentimentList />
      </div>
    </div>
  );
};

export default Sentiments;
