import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useSentimentStore } from '../../store';

const SourcePieChart: React.FC = () => {
  const { statistics } = useSentimentStore();

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: {
        color: '#E8F1F8',
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#8BA3B9',
      },
    },
    series: [
      {
        name: '数据来源',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0D1B2A',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#E8F1F8',
          },
        },
        labelLine: {
          show: false,
        },
        data: statistics.sourceDistribution.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  };

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">来源分布</h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

export default SourcePieChart;
