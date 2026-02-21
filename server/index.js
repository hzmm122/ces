import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchExchangeAnnouncements } from './scrapers/exchange.js';
import { fetchCninfoAnnouncements } from './scrapers/cninfo.js';
import { fetchStatsData } from './scrapers/stats.js';
import { fetchAssociationReports } from './scrapers/association.js';
import { analyzeSentiment, getSentimentScore } from './services/analyzer.js';
import { stockCrawler } from './scrapers/stockCrawler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/sentiments', async (req, res) => {
  try {
    const { source, days = 7 } = req.query;
    let data = [];

    if (!source || source === 'exchange') {
      const exchangeData = await fetchExchangeAnnouncements(parseInt(days));
      data = [...data, ...exchangeData];
    }

    if (!source || source === 'cninfo') {
      const cninfoData = await fetchCninfoAnnouncements(parseInt(days));
      data = [...data, ...cninfoData];
    }

    if (!source || source === 'stats') {
      const statsData = await fetchStatsData();
      data = [...data, ...statsData];
    }

    if (!source || source === 'association') {
      const assocData = await fetchAssociationReports(parseInt(days));
      data = [...data, ...assocData];
    }

    const analyzedData = data.map(item => ({
      ...item,
      sentiment: analyzeSentiment(item.title + ' ' + item.content),
      sentimentScore: getSentimentScore(item.title + ' ' + item.content),
    }));

    analyzedData.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));

    res.json({
      success: true,
      data: analyzedData,
      total: analyzedData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sentiments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/statistics', async (req, res) => {
  try {
    let data = [];
    
    const exchangeData = await fetchExchangeAnnouncements(30);
    const cninfoData = await fetchCninfoAnnouncements(30);
    const statsData = await fetchStatsData();
    const assocData = await fetchAssociationReports(30);
    
    data = [...exchangeData, ...cninfoData, ...statsData, ...assocData];
    
    const analyzedData = data.map(item => ({
      ...item,
      sentiment: analyzeSentiment(item.title + ' ' + item.content),
      sentimentScore: getSentimentScore(item.title + ' ' + item.content),
    }));

    const positive = analyzedData.filter(s => s.sentiment === 'positive').length;
    const negative = analyzedData.filter(s => s.sentiment === 'negative').length;
    const neutral = analyzedData.filter(s => s.sentiment === 'neutral').length;
    const total = analyzedData.length;
    
    const today = new Date().toDateString();
    const todayCount = analyzedData.filter(s => new Date(s.publishTime).toDateString() === today).length;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const yesterdayCount = analyzedData.filter(s => new Date(s.publishTime).toDateString() === yesterday).length;

    res.json({
      success: true,
      data: {
        totalCount: total,
        todayCount: todayCount,
        yesterdayCount: yesterdayCount,
        positiveRatio: total > 0 ? positive / total : 0.35,
        negativeRatio: total > 0 ? negative / total : 0.25,
        neutralRatio: total > 0 ? neutral / total : 0.40,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stock-changes', (req, res) => {
  const pythonScript = path.join(__dirname, 'akshare_service.py');
  const pythonProcess = spawn('python', [pythonScript, 'changes']);
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python script error:', errorOutput);
      res.status(500).json({
        success: false,
        error: errorOutput || 'Failed to fetch stock changes',
      });
      return;
    }
    
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (e) {
      console.error('JSON parse error:', e);
      res.status(500).json({
        success: false,
        error: 'Failed to parse stock changes data',
      });
    }
  });
});

app.get('/api/stock-suspend', (req, res) => {
  const pythonScript = path.join(__dirname, 'akshare_service.py');
  const pythonProcess = spawn('python', [pythonScript, 'suspend']);
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python script error:', errorOutput);
      res.status(500).json({
        success: false,
        error: errorOutput || 'Failed to fetch stock suspend data',
      });
      return;
    }
    
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (e) {
      console.error('JSON parse error:', e);
      res.status(500).json({
        success: false,
        error: 'Failed to parse stock suspend data',
      });
    }
  });
});

// 个股爬虫API
app.get('/api/stock-crawl', async (req, res) => {
  try {
    const result = await stockCrawler.manualCrawl();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stocks/current', (req, res) => {
  try {
    const data = stockCrawler.getCurrentData();
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stocks/history', (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    if (date) {
      const data = stockCrawler.getHistoryData(String(date));
      res.json({ success: true, data, date, count: data.length });
    } else if (startDate && endDate) {
      const data = stockCrawler.getHistoryRange(String(startDate), String(endDate));
      const result = {};
      data.forEach((value, key) => {
        result[key] = value;
      });
      res.json({ success: true, data: result, count: Array.from(data.values())[0]?.length || 0 });
    } else {
      const dates = stockCrawler.getHistoryDates();
      res.json({ success: true, dates });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动定时任务
stockCrawler.startScheduler();
console.log('个股爬虫定时任务已启动 (11:30 和 15:00)');

app.listen(PORT, () => {
  console.log(`舆情数据服务运行在 http://localhost:${PORT}`);
});
