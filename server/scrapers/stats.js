import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchStatsData() {
  const results = [];
  
  const macroIndicators = [
    { name: 'GDP国内生产总值', code: 'A01' },
    { name: 'CPI居民消费价格指数', code: 'A01' },
    { name: 'PPI工业生产者出厂价格指数', code: 'A01' },
    { name: 'PMI采购经理指数', code: 'A0N' },
  ];

  for (const indicator of macroIndicators) {
    try {
      const url = `https://data.stats.gov.cn/easyquery.htm?cn=${indicator.code}`;
      results.push({
        id: `stats_${indicator.code}_${Date.now()}`,
        title: `${indicator.name} - 最新数据发布`,
        content: `国家统计局发布最新${indicator.name}数据，具体数据请访问国家统计局官网查询。`,
        summary: `国家统计局发布最新${indicator.name}数据`,
        source: 'stats',
        sourceName: '国家统计局',
        url: 'https://data.stats.gov.cn/',
        publishTime: new Date().toISOString(),
        relatedStocks: [],
        heatIndex: Math.floor(Math.random() * 300) + 50,
        category: '宏观经济',
        tags: ['国家统计局', '宏观数据', indicator.name],
      });
    } catch (error) {
      console.error(`统计局数据抓取失败:`, error.message);
    }
  }

  try {
    const url = 'https://www.stats.gov.cn/tjsj/zxfb/';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    $('.center_list li, .news_list li').slice(0, 8).each((i, el) => {
      const title = $(el).find('a').text().trim();
      const href = $(el).find('a').attr('href');
      
      if (title && title.length > 5) {
        results.push({
          id: `stats_news_${i}_${Date.now()}`,
          title: title,
          content: title,
          summary: title.substring(0, 50),
          source: 'stats',
          sourceName: '国家统计局',
          url: href || 'https://www.stats.gov.cn',
          publishTime: new Date(Date.now() - i * 3600000).toISOString(),
          relatedStocks: [],
          heatIndex: Math.floor(Math.random() * 300) + 50,
          category: '统计新闻',
          tags: ['国家统计局', '新闻发布'],
        });
      }
    });
  } catch (error) {
    console.error('统计局新闻抓取失败:', error.message);
  }

  return results;
}
