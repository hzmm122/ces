import React from 'react';
import { Link } from 'react-router-dom';
import { SentimentItem } from '../../types';

interface SentimentCardProps {
  item: SentimentItem;
}

const SentimentCard: React.FC<SentimentCardProps> = ({ item }) => {
  const formatDateTime = (time: string) => {
    const date = new Date(time);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  return (
    <div className="py-3 border-b border-gray-100 group">
      <Link 
        to={`/news/${item.id}`}
        className="flex items-start gap-3 hover:bg-gray-50 p-1 rounded transition-colors"
      >
        <div className="w-1.5 h-1.5 mt-2 bg-red-500 rounded-full flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm text-gray-500 whitespace-nowrap">{formatDateTime(item.publishTime)}</span>
            <h3 
              className="text-base font-medium text-white flex-1 group-hover:text-gray-800 transition-colors cursor-pointer relative"
              title={item.title}
            >
              {item.title}
            </h3>
          </div>
          <p className="text-sm text-gray-500">{item.sourceName}</p>
        </div>
      </Link>
    </div>
  );
};

export default SentimentCard;
