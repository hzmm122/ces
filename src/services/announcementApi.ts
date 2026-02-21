export interface AnnouncementData {
  id: string;
  stockCode: string;
  stockName: string;
  title: string;
  content: string;
  summary: string;
  type: string;
  publishTime: string;
  source: string;
  url: string;
  impactDirection: '利好' | '利空' | '中性';
}

export interface PolicyNewsData {
  id: string;
  title: string;
  content: string;
  source: string;
  publishTime: string;
  url: string;
  tags: string[];
  impactLevel: 'high' | 'medium' | 'low';
}

const JUCHAO_URL = 'http://www.cninfo.com.cn';

export async function fetchAnnouncements(_stockCode?: string): Promise<AnnouncementData[]> {
  const demoAnnouncements: AnnouncementData[] = [
    {
      id: 'ann_001',
      stockCode: '600519',
      stockName: '贵州茅台',
      title: '2025年度业绩预告公告',
      content: '经初步核算，公司预计2025年度实现营业收入同比增长约12%，归属于上市公司股东的净利润同比增长约15%。',
      summary: '贵州茅台2025年度业绩预增',
      type: '业绩预告',
      publishTime: new Date().toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=szse&orgId=gssh0605519&announcementId=1221`,
      impactDirection: '利好',
    },
    {
      id: 'ann_002',
      stockCode: '300750',
      stockName: '宁德时代',
      title: '关于签订重大合同的公告',
      content: '公司近日与某知名汽车制造商签订战略合作协议，约定在未来三年内提供动力电池产品。',
      summary: '宁德时代签订重大合同',
      type: '重大合同',
      publishTime: new Date(Date.now() - 3600000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=szse&orgId=9900029230&announcementId=1220`,
      impactDirection: '利好',
    },
    {
      id: 'ann_003',
      stockCode: '601318',
      stockName: '中国平安',
      title: '关于股东增持股份的公告',
      content: '公司控股股东通过上海证券交易所交易系统增持公司股份共计1000万股。',
      summary: '中国平安股东增持',
      type: '增减持',
      publishTime: new Date(Date.now() - 7200000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=shse&orgId=9sse_main_0000001&announcementId=1219`,
      impactDirection: '利好',
    },
    {
      id: 'ann_004',
      stockCode: '002594',
      stockName: '比亚迪',
      title: '2025年销量快报',
      content: '公司2025年新能源汽车销量突破500万辆，同比增长超过35%。',
      summary: '比亚迪2025年销量突破500万辆',
      type: '业绩预告',
      publishTime: new Date(Date.now() - 14400000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=szse&orgId=9900032457&announcementId=1218`,
      impactDirection: '利好',
    },
    {
      id: 'ann_005',
      stockCode: '600036',
      stockName: '招商银行',
      title: '2025年度业绩快报',
      content: '公司2025年度实现营业收入同比增长6%，归属于股东净利润同比增长7%。',
      summary: '招商银行2025年业绩快报',
      type: '业绩预告',
      publishTime: new Date(Date.now() - 21600000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=shse&orgId=9sse_main_600036&announcementId=1217`,
      impactDirection: '中性',
    },
    {
      id: 'ann_006',
      stockCode: '000858',
      stockName: '五粮液',
      title: '关于收到政府补贴的公告',
      content: '公司近日收到政府拨付的产业发展扶持资金共计8000万元。',
      summary: '五粮液收到政府补贴8000万',
      type: '其他',
      publishTime: new Date(Date.now() - 28800000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=szse&orgId=gssh0600858&announcementId=1216`,
      impactDirection: '利好',
    },
    {
      id: 'ann_007',
      stockCode: '601012',
      stockName: '隆基绿能',
      title: '关于计提资产减值准备的公告',
      content: '公司按照会计准则计提存货跌价准备，预计减少2025年度净利润约3亿元。',
      summary: '隆基绿能计提减值准备',
      type: '业绩预告',
      publishTime: new Date(Date.now() - 36000000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=shse&orgId=9sse_main_601012&announcementId=1215`,
      impactDirection: '利空',
    },
    {
      id: 'ann_008',
      stockCode: '600276',
      stockName: '恒瑞医药',
      title: '关于获得药品注册批件的公告',
      content: '公司近日收到国家药品监督管理局核准签发的《药品注册批件》。',
      summary: '恒瑞医药获得药品注册批件',
      type: '其他',
      publishTime: new Date(Date.now() - 43200000).toISOString(),
      source: '巨潮资讯网',
      url: `${JUCHAO_URL}/disclosure/detail?plate=shse&orgId=9sse_main_600276&announcementId=1214`,
      impactDirection: '利好',
    },
  ];

  return demoAnnouncements;
}

export async function fetchPolicyNews(): Promise<PolicyNewsData[]> {
  const policies: PolicyNewsData[] = [
    {
      id: 'policy_001',
      title: '关于推动数字金融高质量发展的指导意见',
      content: '央行发布指导意见，提出加快数字金融基础设施建设，推动金融科技发展。',
      source: '中国人民银行',
      publishTime: new Date().toISOString(),
      url: 'http://www.pbc.gov.cn',
      tags: ['数字金融', 'AI安全应用'],
      impactLevel: 'high',
    },
    {
      id: 'policy_002',
      title: '新能源产业发展规划发布',
      content: '工信部发布新能源产业发展规划，提出到2027年新能源汽车销量占比达到30%。',
      source: '工业和信息化部',
      publishTime: new Date(Date.now() - 86400000).toISOString(),
      url: 'http://www.miit.gov.cn',
      tags: ['新能源'],
      impactLevel: 'high',
    },
    {
      id: 'policy_003',
      title: '半导体产业扶持政策加码',
      content: '财政部、工信部联合发布半导体产业扶持政策，加大研发投入支持力度。',
      source: '财政部',
      publishTime: new Date(Date.now() - 172800000).toISOString(),
      url: 'http://www.mof.gov.cn',
      tags: ['半导体'],
      impactLevel: 'medium',
    },
    {
      id: 'policy_004',
      title: '生物医药创新支持政策',
      content: '国家药监局发布生物医药创新支持政策，简化创新药审批流程。',
      source: '国家药品监督管理局',
      publishTime: new Date(Date.now() - 259200000).toISOString(),
      url: 'http://www.nmpa.gov.cn',
      tags: ['生物医药'],
      impactLevel: 'medium',
    },
    {
      id: 'policy_005',
      title: '供应链金融创新发展指导意见',
      content: '银保监会发布供应链金融创新发展指导意见，支持中小企业融资。',
      source: '中国银行保险监督管理委员会',
      publishTime: new Date(Date.now() - 345600000).toISOString(),
      url: 'http://www.cbirc.gov.cn',
      tags: ['供应链金融'],
      impactLevel: 'medium',
    },
  ];

  return policies;
}

export async function fetchMarketSentiment(): Promise<{
  cycle: string;
  sentimentIndex: number;
  upCount: number;
  downCount: number;
  limitUpCount: number;
  limitDownCount: number;
  northboundFlow: number;
}> {
  const cycles = ['冰点', '修复', '高潮', '退潮'];
  const randomCycle = cycles[Math.floor(Math.random() * cycles.length)];

  return {
    cycle: randomCycle,
    sentimentIndex: Math.floor(Math.random() * 40) + 50,
    upCount: Math.floor(Math.random() * 1500) + 1500,
    downCount: Math.floor(Math.random() * 1500) + 1500,
    limitUpCount: Math.floor(Math.random() * 30) + 20,
    limitDownCount: Math.floor(Math.random() * 10) + 1,
    northboundFlow: Math.floor(Math.random() * 10000) - 3000,
  };
}
