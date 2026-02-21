import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useSentimentStore } from '../../store';

const TrendChart: React.FC = () => {
  const { statistics } = useSentimentStore();

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: {
        color: '#E8F1F8',
      },
    },
    legend: {
      data: ['正面', '中性', '负面', '总计'],
      textStyle: {
        color: '#8BA3B9',
      },
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: statistics.trendData.map((item) => item.date.slice(5)),
      axisLine: {
        lineStyle: {
          color: '#2C3E50',
        },
      },
      axisLabel: {
        color: '#8BA3B9',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#2C3E50',
        },
      },
      axisLabel: {
        color: '#8BA3B9',
      },
      splitLine: {
        lineStyle: {
          color: '#2C3E50',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '正面',
        type: 'line',
        smooth: true,
        data: statistics.trendData.map((item) => item.positive),
        itemStyle: {
          color: '#28A745',
        },
        areaStyle: {
          color: 'rgba(40, 167, 69, 0.1)',
        },
      },
      {
        name: '中性',
        type: 'line',
        smooth: true,
        data: statistics.trendData.map((item) => item.neutral),
        itemStyle: {
          color: '#FFC107',
        },
        areaStyle: {
          color: 'rgba(255, 193, 7, 0.1)',
        },
      },
      {
        name: '负面',
        type: 'line',
        smooth: true,
        data: statistics.trendData.map((item) => item.negative),
        itemStyle: {
          color: '#DC3545',
        },
        areaStyle: {
          color: 'rgba(220, 53, 69, 0.1)',
        },
      },
      {
        name: '总计',
        type: 'line',
        smooth: true,
        data: statistics.trendData.map((item) => item.total),
        itemStyle: {
          color: '#1E3A5F',
        },
        lineStyle: {
          width: 2,
        },
      },
    ],
  };

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">舆情趋势</h3>
      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
};

export default TrendChart;
