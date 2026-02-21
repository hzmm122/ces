import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useSentimentStore } from '../../store';

const SentimentPieChart: React.FC = () => {
  const { statistics } = useSentimentStore();

  const data = [
    { value: statistics.positiveRatio * 100, name: '正面', color: '#28A745' },
    { value: statistics.neutralRatio * 100, name: '中性', color: '#FFC107' },
    { value: statistics.negativeRatio * 100, name: '负面', color: '#DC3545' },
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: {
        color: '#E8F1F8',
      },
      formatter: '{b}: {c}%',
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      textStyle: {
        color: '#8BA3B9',
      },
    },
    series: [
      {
        name: '情感分布',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        data: data.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        })),
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0D1B2A',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%',
          color: '#E8F1F8',
          fontSize: 12,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">情感分布</h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

export default SentimentPieChart;
