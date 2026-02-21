import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Dashboard, Sentiments, Sources, Monitor, NewsDetail, DataPlatform, Review, MarketOverview } from './pages';
import ShortTermCoreMarket from './pages/short-term/ShortTermCoreMarket';
import ShortTermLimitUpTier from './pages/short-term/ShortTermLimitUpTier';
import ShortTermLimitUpThemes from './pages/short-term/ShortTermLimitUpThemes';
import ShortTermBrokenPool from './pages/short-term/ShortTermBrokenPool';
import ShortTermLimitDownPool from './pages/short-term/ShortTermLimitDownPool';
import ShortTermLargeDrawdown from './pages/short-term/ShortTermLargeDrawdown';
import ShortTermBigNoodlesPool from './pages/short-term/ShortTermBigNoodlesPool';
import ShortTermLargeSurge from './pages/short-term/ShortTermLargeSurge';
import ShortTermBigMeatPool from './pages/short-term/ShortTermBigMeatPool';
import SentimentCoreLeaderTracking from './pages/sentiment/SentimentCoreLeaderTracking';
import SentimentLeaderCycleOverview from './pages/sentiment/SentimentLeaderCycleOverview';
import SentimentShortCycleAnalysis from './pages/sentiment/SentimentShortCycleAnalysis';
import SentimentAnomalyMonitoring from './pages/sentiment/SentimentAnomalyMonitoring';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="market-overview" element={<MarketOverview />} />
        <Route path="sentiments" element={<Sentiments />} />
        <Route path="news/:id" element={<NewsDetail />} />
        <Route path="sources" element={<Sources />} />
        <Route path="monitor" element={<Monitor />} />
        <Route path="data-platform" element={<DataPlatform />} />
        <Route path="review" element={<Review />} />
        <Route path="short-term/core-market" element={<ShortTermCoreMarket />} />
        <Route path="short-term/limit-up-tier" element={<ShortTermLimitUpTier />} />
        <Route path="short-term/limit-up-themes" element={<ShortTermLimitUpThemes />} />
        <Route path="short-term/broken-pool" element={<ShortTermBrokenPool />} />
        <Route path="short-term/limit-down-pool" element={<ShortTermLimitDownPool />} />
        <Route path="short-term/large-drawdown" element={<ShortTermLargeDrawdown />} />
        <Route path="short-term/big-noodles-pool" element={<ShortTermBigNoodlesPool />} />
        <Route path="short-term/large-surge" element={<ShortTermLargeSurge />} />
        <Route path="short-term/big-meat-pool" element={<ShortTermBigMeatPool />} />
        <Route path="sentiment/core-leader-tracking" element={<SentimentCoreLeaderTracking />} />
        <Route path="sentiment/leader-cycle-overview" element={<SentimentLeaderCycleOverview />} />
        <Route path="sentiment/short-cycle-analysis" element={<SentimentShortCycleAnalysis />} />
        <Route path="sentiment/anomaly-monitoring" element={<SentimentAnomalyMonitoring />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
