import React, { useState, useMemo } from 'react';
import { useSentimentStore } from '../../store';
import SentimentCard from './SentimentCard';

const SentimentList: React.FC = () => {
  const { getFilteredSentiments } = useSentimentStore();
  const [displayCount, setDisplayCount] = useState(20);

  const filteredSentiments = useMemo(() => {
    const items = getFilteredSentiments();
    return items.sort((a, b) => {
      return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
    });
  }, [getFilteredSentiments]);

  const displayedSentiments = filteredSentiments.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 20);
  };

  return (
    <div>
      <div className="space-y-0">
        {displayedSentiments.map((item) => (
          <SentimentCard key={item.id} item={item} />
        ))}
      </div>

      {displayCount < filteredSentiments.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
};

export default SentimentList;
