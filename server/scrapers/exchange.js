import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

const ENCODING = 'gb2312';

async function fetchWithCharset(url, charset = ENCODING) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 30000,
  });
  return iconv.decode(response.data, charset);
}

export async function fetchExchangeAnnouncements(days = 7) {
  const results = [];
  const now = new Date();
  
  try {
    const shUrl = 'http://www.sse.com.cn/disclosure/listedinfo/announcement/';
    const html = await fetchWithCharset(shUrl);
    const $ = cheerio.load(html);
    
    $('.announce-item, .list-item, table tbody tr').each((i, el) => {
      if (i > 20) return;
      
      const title = $(el).find('a, td a').first().text().trim();
      const href = $(el).find('a').first().attr('href');
      const date = $(el).find('td, .date').last().text().trim();
      
      if (title && title.length > 5) {
        const publishTime = date ? new Date(date) : new Date(now.getTime() - i * 3600000);
        
        if ((now.getTime() - publishTime.getTime()) <= days * 24 * 3600000) {
          results.push({
            id: `sh_${i}_${Date.now()}`,
            title: title,
            content: title,
            summary: title.substring(0, 50),
            source: 'exchange',
            sourceName: '上海证券交易所',
            url: href || shUrl,
            publishTime: publishTime.toISOString(),
            relatedStocks: [],
            heatIndex: Math.floor(Math.random() * 500) + 100,
            category: '公司公告',
            tags: ['上海证券交易所'],
          });
        }
      }
    });
  } catch (error) {
    console.error('上海证券交易所抓取失败:', error.message);
  }

  try {
    const szUrl = 'http://www.szse.cn/api/report/ShowReport?SHOWTYPE=xwxx';
    const response = await axios.get(szUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });
    
    if (response.data && response.data.SHOWDATA) {
      response.data.SHOWDATA.slice(0, 10).forEach((item, i) => {
        results.push({
          id: `sz_${i}_${Date.now()}`,
          title: item.xwbt || item.title || '深圳证券交易所公告',
          content: item.xwnr || item.content || '',
          summary: (item.xwbt || item.title || '').substring(0, 50),
          source: 'exchange',
          sourceName: '深圳证券交易所',
          url: `http://www.szse.cn/disclosure/published/${item.fxjId}.html`,
          publishTime: new Date(item.fbsj || Date.now()).toISOString(),
          relatedStocks: [],
          heatIndex: Math.floor(Math.random() * 500) + 100,
          category: '公司公告',
          tags: ['深圳证券交易所'],
        });
      });
    }
  } catch (error) {
    console.error('深圳证券交易所抓取失败:', error.message);
  }

  return results;
}
