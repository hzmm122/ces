import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

async function fetchWithCharset(url, charset = 'gb2312') {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });
    return iconv.decode(response.data, charset);
  } catch (error) {
    console.error(`抓取失败 ${url}:`, error.message);
    return '';
  }
}

export async function fetchCninfoAnnouncements(days = 7) {
  const results = [];
  const now = new Date();
  
  try {
    const url = 'http://www.cninfo.com.cn/new/fulltextSearch?notautosubmit=&keyWord=%E5%85%AC%E5%8F%B8';
    const html = await fetchWithCharset(url);
    const $ = cheerio.load(html);
    
    $('.search_result_item, .news_list_item, .item').each((i, el) => {
      if (i > 15) return;
      
      const title = $(el).find('.title a, a.title, a').first().text().trim();
      const href = $(el).find('.title a, a.title, a').first().attr('href');
      const date = $(el).find('.date, .time').first().text().trim();
      
      if (title && title.length > 5) {
        const publishTime = date ? new Date(date) : new Date(now.getTime() - i * 3600000);
        
        results.push({
          id: `cninfo_${i}_${Date.now()}`,
          title: title,
          content: title,
          summary: title.substring(0, 50),
          source: 'cninfo',
          sourceName: '巨潮资讯网',
          url: href || 'http://www.cninfo.com.cn',
          publishTime: publishTime.toISOString(),
          relatedStocks: [],
          heatIndex: Math.floor(Math.random() * 500) + 100,
          category: '上市公司公告',
          tags: ['巨潮资讯', '上市公司'],
        });
      }
    });
  } catch (error) {
    console.error('巨潮资讯抓取失败:', error.message);
  }

  try {
    const apiUrl = 'http://www.cninfo.com.cn/new/hisAnnouncement/query';
    const response = await axios.post(apiUrl, {
      pageNum: 1,
      pageSize: 20,
      tabName: 'fulltext',
      column: 'szse',
      searchKey: '',
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    });
    
    if (response.data && response.data.announcements) {
      response.data.announcements.slice(0, 10).forEach((item, i) => {
        results.push({
          id: `cninfo_api_${i}_${Date.now()}`,
          title: item.announcementTitle,
          content: item.announcementTitle,
          summary: item.announcementTitle?.substring(0, 50) || '',
          source: 'cninfo',
          sourceName: '巨潮资讯网',
          url: `http://www.cninfo.com.cn/new/disclosure/detail?plate=szse&orgId=${item.orgId}&stockCode=${item.stockCode}&announcementId=${item.announcementId}`,
          publishTime: new Date(item.announcementTime).toISOString(),
          relatedStocks: item.stockCode ? [item.stockCode] : [],
          heatIndex: Math.floor(Math.random() * 500) + 100,
          category: '上市公司公告',
          tags: ['巨潮资讯', '上市公司', item.stockCode],
        });
      });
    }
  } catch (error) {
    console.error('巨潮资讯API抓取失败:', error.message);
  }

  return results;
}
