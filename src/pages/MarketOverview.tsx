import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { fetchIndustryDataWithCache, refreshIndustryData, IndustryData } from '../services/industryApi';
import { fetchMarketData, fetchIndustryData as fetchRealtimeIndustry, STOCK_LIST, formatNumber, formatAmount, StockQuote, IndexQuote } from '../services/realtimeStockApi';

interface IndexData {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface SectorData {
  name: string;
  changePercent: number;
  inflow: number;
}

interface StockData {
  code: string;
  name: string;
  changePercent: number;
  volume: number;
  price: number;
  turnover: number;
}

interface PopularStock {
  rank: number;
  code: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  amount: number;
}

interface HeatmapItem {
  name: string;
  value: number;
  changePercent: number;
}

interface MarketData {
  upCount: number;
  downCount: number;
  flatCount: number;
  limitUpCount: number;
  limitDownCount: number;
  totalMarketCap: number;
}

const generateMockData = () => {
  const indices: IndexData[] = [
    { name: '上证指数', price: 3427.56 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 30, changePercent: (Math.random() - 0.5) * 2 },
    { name: '深证成指', price: 11234.78 + (Math.random() - 0.5) * 50, change: (Math.random() - 0.5) * 80, changePercent: (Math.random() - 0.5) * 2 },
    { name: '创业板指', price: 2234.45 + (Math.random() - 0.5) * 30, change: (Math.random() - 0.5) * 40, changePercent: (Math.random() - 0.5) * 3 },
    { name: '科创50', price: 1023.67 + (Math.random() - 0.5) * 15, change: (Math.random() - 0.5) * 20, changePercent: (Math.random() - 0.5) * 2.5 },
  ];

  const sectors: SectorData[] = [
    { name: '人工智能', changePercent: 3.56, inflow: 456200 },
    { name: '半导体', changePercent: 2.34, inflow: 324500 },
    { name: '新能源汽车', changePercent: 1.89, inflow: 287600 },
    { name: '医药生物', changePercent: -1.23, inflow: -156300 },
    { name: '房地产', changePercent: -2.45, inflow: -234500 },
    { name: '银行', changePercent: 0.87, inflow: 123400 },
    { name: '军工', changePercent: 1.45, inflow: 198700 },
    { name: '消费电子', changePercent: -0.98, inflow: -87600 },
  ];

  const topStocks: StockData[] = [
    { code: '000001', name: '平安银行', changePercent: 10.05, volume: 8562300, price: 15.8, turnover: 12.5 },
    { code: '000002', name: '万科A', changePercent: 9.98, volume: 7654200, price: 8.5, turnover: 15.2 },
    { code: '000003', name: 'PT水庄', changePercent: -10.05, volume: 342100, price: 2.35, turnover: -8.5 },
    { code: '600001', name: '邯郸钢铁', changePercent: 9.97, volume: 5432100, price: 4.8, turnover: 18.3 },
    { code: '600002', name: '齐鲁石化', changePercent: 9.96, volume: 4321500, price: 6.2, turnover: 22.1 },
    { code: '600003', name: '东北制药', changePercent: -9.96, volume: 287600, price: 12.5, turnover: -5.8 },
    { code: '000004', name: '国农科技', changePercent: -9.95, volume: 198700, price: 18.9, turnover: -12.3 },
    { code: '000005', name: '世纪星', changePercent: -9.95, volume: 156400, price: 3.2, turnover: -15.6 },
  ];

  const popularStocks: PopularStock[] = [
    { rank: 1, code: '000001', name: '平安银行', price: 15.8, changePercent: 10.05, volume: 8562300, amount: 1352600000 },
    { rank: 2, code: '600002', name: '齐鲁石化', price: 6.2, changePercent: 9.96, volume: 4321500, amount: 267840000 },
    { rank: 3, code: '600001', name: '邯郸钢铁', price: 4.8, changePercent: 9.97, volume: 5432100, amount: 260742000 },
    { rank: 4, code: '000002', name: '万科A', price: 8.5, changePercent: 9.98, volume: 7654200, amount: 650607000 },
    { rank: 5, code: '000006', name: '深振业A', price: 5.6, changePercent: 8.75, volume: 3892100, amount: 217958000 },
    { rank: 6, code: '000007', name: '全新好', price: 4.2, changePercent: -8.45, volume: 2456800, amount: 103185600 },
    { rank: 7, code: '600010', name: '包钢股份', price: 2.8, changePercent: -9.98, volume: 18932000, amount: 53009600 },
    { rank: 8, code: '600015', name: '华夏银行', price: 7.9, changePercent: 6.85, volume: 4235600, amount: 334410400 },
    { rank: 9, code: '000008', name: '神州高铁', price: 3.5, changePercent: -7.25, volume: 5678900, amount: 198761500 },
    { rank: 10, code: '000009', name: '中国宝安', price: 12.3, changePercent: 5.65, volume: 2987600, amount: 367114800 },
    { rank: 11, code: '600011', name: '华能国际', price: 8.5, changePercent: 10.02, volume: 6789000, amount: 577065000 },
    { rank: 12, code: '000021', name: '百川股份', price: 9.2, changePercent: 8.56, volume: 3456000, amount: 317952000 },
    { rank: 13, code: '600933', name: '横店影视', price: 15.6, changePercent: 7.89, volume: 2890000, amount: 450840000 },
    { rank: 14, code: '000995', name: '皇台酒业', price: 18.9, changePercent: 6.54, volume: 2345000, amount: 443205000 },
    { rank: 15, code: '600683', name: '京投发展', price: 5.8, changePercent: 5.67, volume: 1987000, amount: 115186000 },
    { rank: 16, code: '603617', name: '韩建河山', price: 7.2, changePercent: 4.32, volume: 1567000, amount: 112824000 },
    { rank: 17, code: '000911', name: '南宁糖业', price: 6.5, changePercent: -6.25, volume: 1876000, amount: 121940000 },
    { rank: 18, code: '600726', name: '华电能源', price: 3.2, changePercent: -5.85, volume: 3245000, amount: 103840000 },
    { rank: 19, code: '000780', name: '平庄能源', price: 4.1, changePercent: -4.65, volume: 2134000, amount: 87502000 },
    { rank: 20, code: '600123', name: '兰花科创', price: 8.8, changePercent: 3.89, volume: 1654000, amount: 145552000 },
    { rank: 21, code: '600395', name: '盘江股份', price: 6.9, changePercent: 3.56, volume: 1432000, amount: 98808000 },
    { rank: 22, code: '000937', name: '中煤能源', price: 5.4, changePercent: 3.21, volume: 2876000, amount: 155304000 },
    { rank: 23, code: '600971', name: '恒源煤电', price: 7.1, changePercent: 2.98, volume: 1234000, amount: 87634000 },
    { rank: 24, code: '600188', name: '兖州煤业', price: 12.5, changePercent: 2.65, volume: 3456000, amount: 432000000 },
    { rank: 25, code: '600508', name: '上海能源', price: 9.8, changePercent: 2.34, volume: 987000, amount: 96726000 },
    { rank: 26, code: '601001', name: '大同煤业', price: 5.6, changePercent: -2.15, volume: 2134000, amount: 119504000 },
    { rank: 27, code: '600348', name: '阳泉煤业', price: 6.2, changePercent: -1.89, volume: 1987000, amount: 123194000 },
    { rank: 28, code: '600121', name: '郑州煤电', price: 3.8, changePercent: -1.56, volume: 3456000, amount: 131328000 },
    { rank: 29, code: '600810', name: '神马股份', price: 8.5, changePercent: 1.23, volume: 876000, amount: 74460000 },
    { rank: 30, code: '600426', name: '华鲁恒升', price: 28.5, changePercent: 1.05, volume: 1234000, amount: 351690000 },
    { rank: 31, code: '000830', name: '鲁西化工', price: 15.2, changePercent: 0.89, volume: 2345000, amount: 356440000 },
    { rank: 32, code: '600309', name: '万华化学', price: 95.6, changePercent: 0.76, volume: 876000, amount: 837456000 },
    { rank: 33, code: '600028', name: '中国石化', price: 5.8, changePercent: 0.52, volume: 56780000, amount: 329324000 },
    { rank: 34, code: '600036', name: '招商银行', price: 35.6, changePercent: 0.45, volume: 23456000, amount: 835033600 },
    { rank: 35, code: '601398', name: '工商银行', price: 5.2, changePercent: 0.38, volume: 87654000, amount: 455800800 },
    { rank: 36, code: '601988', name: '中国银行', price: 3.1, changePercent: 0.32, volume: 65432000, amount: 202839200 },
    { rank: 37, code: '600519', name: '贵州茅台', price: 1680.5, changePercent: -0.25, volume: 34560, amount: 58057248000 },
    { rank: 38, code: '601318', name: '中国平安', price: 48.6, changePercent: -0.45, volume: 12345000, amount: 599727000 },
    { rank: 39, code: '600276', name: '恒瑞医药', price: 52.8, changePercent: -0.68, volume: 5678000, amount: 299774400 },
    { rank: 40, code: '300750', name: '宁德时代', price: 185.6, changePercent: -0.89, volume: 8765000, amount: 1627156000 },
    { rank: 41, code: '002594', name: '比亚迪', price: 256.8, changePercent: -1.12, volume: 3456000, amount: 887908800 },
    { rank: 42, code: '600900', name: '长江电力', price: 23.5, changePercent: 0.28, volume: 9876000, amount: 232086000 },
    { rank: 43, code: '601012', name: '隆基绿能', price: 28.9, changePercent: -1.35, volume: 15678000, amount: 453094200 },
    { rank: 44, code: '002475', name: '立讯精密', price: 32.5, changePercent: -1.56, volume: 8765000, amount: 284877500 },
    { rank: 45, code: '000333', name: '美的集团', price: 58.6, changePercent: 0.68, volume: 6543000, amount: 383119800 },
    { rank: 46, code: '600104', name: '上汽集团', price: 15.2, changePercent: 0.45, volume: 8765000, amount: 133228000 },
    { rank: 47, code: '601857', name: '中国石油', price: 5.6, changePercent: 0.18, volume: 45678000, amount: 255796800 },
    { rank: 48, code: '601888', name: '中国中铁', price: 6.8, changePercent: -0.45, volume: 12345000, amount: 83946000 },
    { rank: 49, code: '601390', name: '中国中铁', price: 7.2, changePercent: 0.35, volume: 9876000, amount: 71107200 },
    { rank: 50, code: '601668', name: '中国建筑', price: 5.5, changePercent: 0.22, volume: 23456000, amount: 129008000 },
  ];

  const market: MarketData = {
    upCount: Math.floor(2000 + Math.random() * 1500),
    downCount: Math.floor(1500 + Math.random() * 1200),
    flatCount: Math.floor(300 + Math.random() * 500),
    limitUpCount: Math.floor(45 + Math.random() * 30),
    limitDownCount: Math.floor(10 + Math.random() * 15),
    totalMarketCap: 8567000000000,
  };

  const heatmapData: HeatmapItem[] = [
    { name: '平安银行', value: 10.05, changePercent: 10.05 },
    { name: '万科A', value: 9.98, changePercent: 9.98 },
    { name: '华能国际', value: 10.02, changePercent: 10.02 },
    { name: '邯郸钢铁', value: 9.97, changePercent: 9.97 },
    { name: '齐鲁石化', value: 9.96, changePercent: 9.96 },
    { name: '东北制药', value: -9.96, changePercent: -9.96 },
    { name: '国农科技', value: -9.95, changePercent: -9.95 },
    { name: '世纪星', value: -9.95, changePercent: -9.95 },
    { name: '包钢股份', value: -9.98, changePercent: -9.98 },
    { name: '深振业A', value: 8.75, changePercent: 8.75 },
    { name: '全新好', value: -8.45, changePercent: -8.45 },
    { name: '神州高铁', value: -7.25, changePercent: -7.25 },
    { name: '百川股份', value: 8.56, changePercent: 8.56 },
    { name: '横店影视', value: 7.89, changePercent: 7.89 },
    { name: '华夏银行', value: 6.85, changePercent: 6.85 },
    { name: '中国宝安', value: 5.65, changePercent: 5.65 },
    { name: '皇台酒业', value: 6.54, changePercent: 6.54 },
    { name: '京投发展', value: 5.67, changePercent: 5.67 },
    { name: '湖南黄金', value: -5.23, changePercent: -5.23 },
    { name: '韩建河山', value: 4.32, changePercent: 4.32 },
    { name: '协鑫集成', value: 5.43, changePercent: 5.43 },
    { name: '凯龙高科', value: 4.87, changePercent: 4.87 },
    { name: '金富科技', value: 3.65, changePercent: 3.65 },
    { name: '顺钠股份', value: 3.21, changePercent: 3.21 },
    { name: '民爆光电', value: 2.87, changePercent: 2.87 },
    { name: '名雕股份', value: -3.56, changePercent: -3.56 },
    { name: '杭电股份', value: -4.12, changePercent: -4.12 },
    { name: '杭州解百', value: 2.98, changePercent: 2.98 },
    { name: '上海石化', value: 4.56, changePercent: 4.56 },
    { name: '仪征化纤', value: 3.89, changePercent: 3.89 },
    { name: '安徽华源', value: -4.23, changePercent: -4.23 },
    { name: '江淮汽车', value: 5.12, changePercent: 5.12 },
    { name: '金龙汽车', value: -3.78, changePercent: -3.78 },
    { name: '东风汽车', value: 4.34, changePercent: 4.34 },
    { name: '长安汽车', value: -2.56, changePercent: -2.56 },
    { name: '中国重汽', value: 3.67, changePercent: 3.67 },
    { name: '青岛双星', value: -1.89, changePercent: -1.89 },
    { name: '赛轮股份', value: 2.45, changePercent: 2.45 },
    { name: '风神股份', value: -2.34, changePercent: -2.34 },
    { name: '三角轮胎', value: 1.98, changePercent: 1.98 },
    { name: '贵州轮胎', value: -1.67, changePercent: -1.67 },
    { name: '青岛银行', value: 2.12, changePercent: 2.12 },
    { name: '郑州银行', value: -1.45, changePercent: -1.45 },
    { name: '长沙银行', value: 1.76, changePercent: 1.76 },
    { name: '成都银行', value: -1.23, changePercent: -1.23 },
    { name: '西安银行', value: 1.54, changePercent: 1.54 },
    { name: '苏州银行', value: -0.98, changePercent: -0.98 },
    { name: '兰州银行', value: 1.23, changePercent: 1.23 },
    { name: '郑州煤电', value: -0.76, changePercent: -0.76 },
    { name: '陕西煤业', value: 0.87, changePercent: 0.87 },
    { name: '山西焦化', value: -0.54, changePercent: -0.54 },
  ];

  return { indices, sectors, topStocks, market, popularStocks, heatmapData };
};

const MarketOverview: React.FC = () => {
  const [data, setData] = useState(generateMockData());
  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [realtimeIndices, setRealtimeIndices] = useState<IndexQuote[]>([]);
  const [realtimeStocks, setRealtimeStocks] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [stockSortOrder, setStockSortOrder] = useState<'gainers' | 'losers'>('gainers');
  const [hoveredStock, setHoveredStock] = useState<any>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dataSource, setDataSource] = useState<'realtime' | 'cache' | 'mock'>('mock');

  // 手动刷新函数
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      await Promise.all([
        fetchRealtimeData(),
        fetchIndustryData()
      ]);
    } catch (error) {
      console.error('[MarketOverview] Refresh failed:', error);
      setRefreshError('刷新失败，请点击重试');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 获取实时数据
  const fetchRealtimeData = async () => {
    try {
      setIsLoading(true);
      
      // 获取指数和股票数据
      const marketData = await fetchMarketData();
      
      // 设置数据来源
      setDataSource(marketData.source);
      
      if (marketData.indices.length > 0) {
        setRealtimeIndices(marketData.indices);
        
        // 更新指数数据
        const newIndices = marketData.indices.map(idx => ({
          name: idx.name,
          price: idx.price,
          change: idx.change,
          changePercent: idx.changePercent,
        }));
        
        setData(prev => ({
          ...prev,
          indices: newIndices
        }));
      }
      
      if (marketData.stocks.length > 0) {
        setRealtimeStocks(marketData.stocks);
        
        // 更新涨跌榜数据
        const sortedStocks = [...marketData.stocks].sort((a, b) => b.changePercent - a.changePercent);
        const gainers = sortedStocks.slice(0, 8);
        const losers = [...sortedStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 8);
        
        const newTopStocks = stockSortOrder === 'gainers' ? gainers : losers;
        
        const topStocksFormatted = newTopStocks.map((stock, index) => ({
          rank: index + 1,
          code: stock.code,
          name: stock.name,
          price: stock.price,
          changePercent: stock.changePercent,
          volume: stock.volume,
          amount: stock.amount
        }));
        
        // 更新热门股票
        const popularStocksFormatted = marketData.stocks.slice(0, 20).map((stock, index) => ({
          rank: index + 1,
          code: stock.code,
          name: stock.name,
          price: stock.price,
          changePercent: stock.changePercent,
          volume: stock.volume,
          amount: stock.amount
        }));
        
        setData(prev => ({
          ...prev,
          topStocks: topStocksFormatted,
          popularStocks: popularStocksFormatted,
        }));
        
        console.log('[MarketOverview] Realtime data loaded:', marketData.stocks.length, 'stocks');
      }
      
      // 更新时间
      const time = new Date();
      setLastUpdate(`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`);
      
    } catch (error) {
      console.error('[MarketOverview] Failed to fetch realtime data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取行业数据
  const fetchIndustryData = async () => {
    try {
      const industries = await fetchIndustryDataWithCache();
      if (industries && industries.length > 0) {
        const mappedData = industries.slice(0, 50).map((item) => ({
          name: item.name,
          value: item.changePercent,
          changePercent: item.changePercent
        }));
        setIndustryData(mappedData as any);
      }
    } catch (error) {
      console.error('[MarketOverview] Failed to fetch industry data:', error);
    }
  };

  useEffect(() => {
    // 初始加载
    fetchRealtimeData();
    fetchIndustryData();

    // 定时刷新 - 每1小时
    const interval = setInterval(() => {
      fetchRealtimeData();
      fetchIndustryData();
    }, 3600000);

    return () => clearInterval(interval);
  }, [stockSortOrder]);

  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    }
    if (Math.abs(num) >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(2);
  };

  const getColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const sectorChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: { color: '#E8F1F8' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2C3E50' } },
      axisLabel: { color: '#8BA3B9', formatter: (v: number) => v + '%' },
      splitLine: { lineStyle: { color: '#2C3E50', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: data.sectors.map(s => s.name),
      axisLine: { lineStyle: { color: '#2C3E50' } },
      axisLabel: { color: '#8BA3B9' },
    },
    series: [{
      type: 'bar',
      data: data.sectors.map(s => ({
        value: s.changePercent,
        itemStyle: { color: s.changePercent >= 0 ? '#28A745' : '#DC3545' }
      })),
      barWidth: '60%',
    }],
  };

  const inflowChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: { color: '#E8F1F8' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2C3E50' } },
      axisLabel: { color: '#8BA3B9', formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: '#2C3E50', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: data.sectors.slice(0, 5).map(s => s.name),
      axisLine: { lineStyle: { color: '#2C3E50' } },
      axisLabel: { color: '#8BA3B9' },
    },
    series: [{
      type: 'bar',
      data: data.sectors.slice(0, 5).map(s => ({
        value: s.inflow,
        itemStyle: { color: s.inflow >= 0 ? '#FF6B6B' : '#4ECDC4' }
      })),
      barWidth: '60%',
    }],
  };

  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: { color: '#E8F1F8' },
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#1B2838', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: data.market.upCount, name: '上涨', itemStyle: { color: '#28A745' } },
        { value: data.market.downCount, name: '下跌', itemStyle: { color: '#DC3545' } },
        { value: data.market.flatCount, name: '平盘', itemStyle: { color: '#6C757D' } },
      ],
    }],
  };

  const getHeatmapColor = (changePercent: number): string => {
    const absChange = Math.abs(changePercent);
    if (changePercent > 0) {
      if (absChange >= 9) return 'linear-gradient(135deg, #FF0000 0%, #FF4500 100%)';
      if (absChange >= 7) return 'linear-gradient(135deg, #FF4500 0%, #FF6347 100%)';
      if (absChange >= 5) return 'linear-gradient(135deg, #FF6347 0%, #FF7F50 100%)';
      if (absChange >= 3) return 'linear-gradient(135deg, #FF7F50 0%, #FFA07A 100%)';
      return 'linear-gradient(135deg, #FFA07A 0%, #FFB6C1 100%)';
    } else if (changePercent < 0) {
      if (absChange >= 9) return 'linear-gradient(135deg, #006400 0%, #228B22 100%)';
      if (absChange >= 7) return 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)';
      if (absChange >= 5) return 'linear-gradient(135deg, #32CD32 0%, #3CB371 100%)';
      if (absChange >= 3) return 'linear-gradient(135deg, #3CB371 0%, #90EE90 100%)';
      return 'linear-gradient(135deg, #90EE90 0%, #98FB98 100%)';
    }
    return 'linear-gradient(135deg, #6C757D 0%, #ADB5BD 100%)';
  };

  const getHeatmapSize = (changePercent: number): string => {
    const absChange = Math.abs(changePercent);
    const sizeIndex = Math.floor(absChange);
    const sizes = [
      'min-w-[60px] h-10',
      'min-w-[70px] h-11',
      'min-w-[80px] h-12',
      'min-w-[90px] h-14',
      'min-w-[100px] h-16',
      'min-w-[115px] h-18',
      'min-w-[130px] h-20',
      'min-w-[145px] h-22',
      'min-w-[160px] h-24',
      'min-w-[175px] h-26',
    ];
    const index = Math.min(sizeIndex, sizes.length - 1);
    return `flex-1 ${sizes[index]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">全景看板</h1>
          <p className="text-sm text-text-secondary">市场全维度实时监控看板</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshError && (
            <span className="text-xs text-red-500">{refreshError}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              isRefreshing
                ? 'bg-background-dark text-text-secondary cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm">{isRefreshing ? '刷新中...' : '刷新'}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-text-secondary">实时更新</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.indices.map((idx, i) => (
          <div key={i} className="card p-3">
            <div className="text-xs text-text-secondary mb-1">{idx.name}</div>
            <div className="text-xl font-bold text-text-primary">{idx.price.toFixed(2)}</div>
            <div className={`text-xs ${getColor(idx.change)}`}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card p-3 flex flex-col items-center justify-center">
          <div className="text-xs text-text-secondary mb-1">上涨</div>
          <div className="text-2xl font-bold text-green-500">{data.market.upCount}</div>
        </div>
        <div className="card p-3 flex flex-col items-center justify-center">
          <div className="text-xs text-text-secondary mb-1">下跌</div>
          <div className="text-2xl font-bold text-red-500">{data.market.downCount}</div>
        </div>
        <div className="card p-3 flex flex-col items-center justify-center">
          <div className="text-xs text-text-secondary mb-1">平盘</div>
          <div className="text-2xl font-bold text-gray-500">{data.market.flatCount}</div>
        </div>
        <div className="card p-3 flex flex-col items-center justify-center">
          <div className="text-xs text-text-secondary mb-1">涨停</div>
          <div className="text-2xl font-bold text-green-400">{data.market.limitUpCount}</div>
        </div>
        <div className="card p-3 flex flex-col items-center justify-center">
          <div className="text-xs text-text-secondary mb-1">跌停</div>
          <div className="text-2xl font-bold text-red-400">-{data.market.limitDownCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3">板块涨跌幅</h3>
          <ReactECharts option={sectorChartOption} style={{ height: '280px' }} />
        </div>
        <div className="card p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3">资金流向 (Top5)</h3>
          <ReactECharts option={inflowChartOption} style={{ height: '280px' }} />
        </div>
        <div className="card p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3">涨跌分布</h3>
          <ReactECharts option={pieChartOption} style={{ height: '280px' }} />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">板块热力图</h3>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-text-secondary">更新: {lastUpdate}</span>
            )}
            <span className="text-xs text-text-secondary">
              {isLoading ? '加载中...' : `${(industryData.length || data.heatmapData.length)}个板块`}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-stretch">
          {(industryData.length > 0 ? industryData : data.heatmapData).slice(0, 50).map((item: any, index: number) => (
            <div
              key={item.code || item.name || index}
              className={`${getHeatmapSize(item.changePercent)} rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer hover:opacity-90 transition-opacity`}
              style={{ background: getHeatmapColor(item.changePercent) }}
            >
              <span className="text-white font-medium text-sm truncate w-full text-center">{item.name}</span>
              <span className="text-white/90 text-xs">
                {item.changePercent > 0 ? '+' : ''}{typeof item.changePercent === 'number' ? item.changePercent.toFixed(2) : '0.00'}%
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #006400, #228B22)' }}></div>
            <span className="text-xs text-text-secondary">跌幅较大</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #90EE90, #98FB98)' }}></div>
            <span className="text-xs text-text-secondary">震荡</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #FF4500, #FF0000)' }}></div>
            <span className="text-xs text-text-secondary">涨幅较大</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary">涨幅排行</h3>
          </div>
          <div className="space-y-2">
            {(industryData.length > 0 ? industryData : data.heatmapData)
              .filter((item: any) => item.changePercent > 0)
              .sort((a: any, b: any) => b.changePercent - a.changePercent)
              .slice(0, 10)
              .map((item: any, index: number) => (
                <div key={item.code || item.name || index} className="flex items-center justify-between p-2 rounded-lg bg-background-dark/50 hover:bg-background-dark transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                      index < 3 ? 'bg-red-500/20 text-red-500' : 'bg-background-card text-text-secondary'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-text-primary font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-red-500">
                    +{typeof item.changePercent === 'number' ? item.changePercent.toFixed(2) : '0.00'}%
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary">跌幅排行</h3>
          </div>
          <div className="space-y-2">
            {(industryData.length > 0 ? industryData : data.heatmapData)
              .filter((item: any) => item.changePercent < 0)
              .sort((a: any, b: any) => a.changePercent - b.changePercent)
              .slice(0, 10)
              .map((item: any, index: number) => (
                <div key={item.code || item.name || index} className="flex items-center justify-between p-2 rounded-lg bg-background-dark/50 hover:bg-background-dark transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                      index < 3 ? 'bg-green-500/20 text-green-500' : 'bg-background-card text-text-secondary'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-text-primary font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-500">
                    {typeof item.changePercent === 'number' ? item.changePercent.toFixed(2) : '0.00'}%
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">个股热力图</h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-background-dark rounded-lg p-1">
              <button
                onClick={() => setStockSortOrder('gainers')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  stockSortOrder === 'gainers'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                涨幅榜
              </button>
              <button
                onClick={() => setStockSortOrder('losers')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  stockSortOrder === 'losers'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                跌幅榜
              </button>
            </div>
            <span className="text-xs text-text-secondary">实时更新</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-stretch relative">
          {(() => {
            const sortedStocks = [...data.popularStocks].sort((a, b) => {
              if (stockSortOrder === 'gainers') {
                return b.changePercent - a.changePercent;
              } else {
                return a.changePercent - b.changePercent;
              }
            }).slice(0, 50);
            
            return sortedStocks.map((item: any, index: number) => (
              <div
                key={item.code || item.name || index}
                className={`${getHeatmapSize(item.changePercent)} rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer hover:opacity-90 transition-all relative group`}
                style={{ background: getHeatmapColor(item.changePercent) }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const containerRect = e.currentTarget.closest('.flex.flex-wrap')?.getBoundingClientRect();
                  const x = rect.left - (containerRect?.left || 0);
                  const y = rect.top - (containerRect?.top || 0);
                  setHoverPosition({ x, y });
                  setHoveredStock(item);
                }}
                onMouseLeave={() => setHoveredStock(null)}
              >
                <span className="text-white font-medium text-sm truncate w-full text-center">{item.name}</span>
                <span className="text-white/90 text-xs">
                  {item.changePercent > 0 ? '+' : ''}{typeof item.changePercent === 'number' ? item.changePercent.toFixed(2) : '0.00'}%
                </span>
              </div>
            ));
          })()}
          
          {hoveredStock && (
            <div 
              className="absolute z-50 pointer-events-none transition-all duration-300"
              style={{
                left: `${hoverPosition.x}px`,
                top: `${hoverPosition.y - 120}px`,
                width: '240px',
              }}
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 opacity-100 transform translate-y-0">
                <h3 className="text-base font-semibold text-gray-800 mb-3">{hoveredStock.name}</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">涨跌幅</span>
                    <span className="text-sm font-bold" style={{ color: hoveredStock.changePercent >= 0 ? '#d92121' : '#21a31a' }}>
                      {hoveredStock.changePercent > 0 ? '+' : ''}{hoveredStock.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">当前价格</span>
                    <span className="text-sm font-medium text-gray-700">{hoveredStock.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">成交量</span>
                    <span className="text-sm font-medium text-gray-700">{formatNumber(hoveredStock.volume)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 cursor-pointer hover:text-primary transition-colors">点击查看全部股票</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #006400, #228B22)' }}></div>
            <span className="text-xs text-text-secondary">跌幅较大</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #90EE90, #98FB98)' }}></div>
            <span className="text-xs text-text-secondary">震荡</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #FF4500, #FF0000)' }}></div>
            <span className="text-xs text-text-secondary">涨幅较大</span>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">人气个股</h3>
          <span className="text-xs text-text-secondary">实时更新</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.popularStocks.slice(0, 5).map((stock) => (
            <div 
              key={stock.code} 
              className="bg-background-dark rounded-lg p-3 hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                  stock.rank <= 3 ? 'bg-primary/20 text-primary' : 'bg-background-card text-text-secondary'
                }`}>
                  {stock.rank}
                </span>
                <span className={`text-sm font-medium ${getColor(stock.changePercent)}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm font-medium text-text-primary group-hover:text-primary truncate">
                {stock.name}
              </div>
              <div className="text-xs text-text-secondary">{stock.code}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-text-secondary">{stock.price.toFixed(2)}</span>
                <span className="text-xs text-text-secondary">{formatNumber(stock.amount)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-text-secondary border-b border-border">
                <th className="px-2 py-2 text-left font-medium">排名</th>
                <th className="px-2 py-2 text-left font-medium">股票</th>
                <th className="px-2 py-2 text-right font-medium">价格</th>
                <th className="px-2 py-2 text-right font-medium">涨跌幅</th>
                <th className="px-2 py-2 text-right font-medium">成交量</th>
                <th className="px-2 py-2 text-right font-medium">成交额</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.popularStocks.map((stock) => (
                <tr key={stock.code} className="hover:bg-background-dark/50 transition-colors">
                  <td className="px-2 py-2">
                    <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                      stock.rank <= 3 ? 'bg-primary/20 text-primary' : 'bg-background-dark text-text-secondary'
                    }`}>
                      {stock.rank}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{stock.name}</span>
                      <span className="text-xs text-text-secondary">{stock.code}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right text-sm text-text-primary">{stock.price.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right text-sm font-medium">
                    <span className={getColor(stock.changePercent)}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-sm text-text-secondary">{formatNumber(stock.volume)}</td>
                  <td className="px-2 py-2 text-right text-sm text-text-secondary">{formatNumber(stock.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-base font-semibold text-text-primary mb-3">涨跌幅排名</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">涨幅榜</span>
            </div>
            <div className="space-y-2">
              {data.topStocks.filter(s => s.changePercent > 0).slice(0, 4).map((stock, i) => (
                <div key={stock.code} className="flex items-center justify-between bg-background-dark p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-green-500/20 text-green-500 text-xs rounded font-bold">{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{stock.name}</div>
                      <div className="text-xs text-text-secondary">{stock.code}</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-500">+{stock.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded">跌幅榜</span>
            </div>
            <div className="space-y-2">
              {data.topStocks.filter(s => s.changePercent < 0).slice(0, 4).map((stock, i) => (
                <div key={stock.code} className="flex items-center justify-between bg-background-dark p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-red-500/20 text-red-500 text-xs rounded font-bold">{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{stock.name}</div>
                      <div className="text-xs text-text-secondary">{stock.code}</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-500">{stock.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.sectors.slice(0, 4).map((sector, i) => (
          <div key={i} className="card p-3">
            <div className="text-xs text-text-secondary mb-1">{sector.name}</div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${getColor(sector.changePercent)}`}>
                {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(2)}%
              </span>
              <span className={`text-xs ${getColor(sector.inflow)}`}>
                {sector.inflow >= 0 ? '↑' : '↓'} {formatNumber(sector.inflow)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;
