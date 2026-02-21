const positiveKeywords = [
  '增长', '上涨', '盈利', '突破', '创新', '成功', '优质', '领先', '上升', '发展',
  '提升', '扩大', '收益', '利润', '业绩', '利好', '增持', '买入', '推荐', '提高',
  '改善', '优化', '升级', '合作', '中标', '签约', '扩张', '强劲', '稳健', '分红',
];

const negativeKeywords = [
  '下跌', '亏损', '风险', '违规', '处罚', '调查', '诉讼', '警示', '降级', '减持',
  '卖出', '利空', '亏损', '下滑', '暴跌', '违约', '退市', '破产', '造假', '欺诈',
  '虚假', '隐瞒', '泄露', '黑客', '病毒', '事故', '灾害', '损失', '危机', '恐慌',
];

export function analyzeSentiment(text) {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  for (const keyword of positiveKeywords) {
    if (lowerText.includes(keyword)) {
      positiveScore++;
    }
  }
  
  for (const keyword of negativeKeywords) {
    if (lowerText.includes(keyword)) {
      negativeScore++;
    }
  }
  
  if (positiveScore > negativeScore + 1) {
    return 'positive';
  } else if (negativeScore > positiveScore + 1) {
    return 'negative';
  } else if (positiveScore > 0) {
    return 'positive';
  } else if (negativeScore > 0) {
    return 'negative';
  }
  
  return 'neutral';
}

export function getSentimentScore(text) {
  if (!text) return 0.5;
  
  const sentiment = analyzeSentiment(text);
  if (sentiment === 'positive') {
    return 0.6 + Math.random() * 0.3;
  } else if (sentiment === 'negative') {
    return Math.random() * 0.4;
  }
  return 0.4 + Math.random() * 0.2;
}
