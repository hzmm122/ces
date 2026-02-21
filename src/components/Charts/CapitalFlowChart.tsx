import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

interface FlowData {
  time: string;
  mainFlow: number;
  retailFlow: number;
}

interface CapitalFlowData {
  buyVolume: number;
  sellVolume: number;
  mainNetInflow: number;
  retailNetInflow: number;
  flowData: FlowData[];
}

const generateMockData = (): CapitalFlowData => {
  const times = [
    '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', 
    '11:00', '11:15', '11:30', '13:00', '13:15', '13:30', 
    '13:45', '14:00', '14:15', '14:30', '14:45', '15:00'
  ];
  
  let mainFlow = 0;
  let retailFlow = 0;
  const flowData: FlowData[] = times.map(time => {
    mainFlow += (Math.random() - 0.45) * 1000;
    retailFlow += (Math.random() - 0.5) * 500;
    return {
      time,
      mainFlow: Math.round(mainFlow),
      retailFlow: Math.round(retailFlow),
    };
  });

  const buyVolume = Math.abs(flowData[flowData.length - 1].mainFlow) + Math.abs(flowData[flowData.length - 1].retailFlow) + Math.random() * 5000;
  const sellVolume = Math.abs(flowData[flowData.length - 1].mainFlow) + Math.abs(flowData[flowData.length - 1].retailFlow) + Math.random() * 3000;
  const mainNetInflow = flowData[flowData.length - 1].mainFlow;
  const retailNetInflow = flowData[flowData.length - 1].retailFlow;

  return {
    buyVolume: Math.round(buyVolume),
    sellVolume: Math.round(sellVolume),
    mainNetInflow,
    retailNetInflow,
    flowData,
  };
};

const CapitalFlowChart: React.FC = () => {
  const [data, setData] = useState<CapitalFlowData>(generateMockData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    const absNum = Math.abs(num);
    if (absNum >= 10000) {
      return (num / 10000).toFixed(2) + '亿';
    }
    return (num / 100).toFixed(2) + '千万';
  };

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1B2838',
      borderColor: '#2C3E50',
      textStyle: {
        color: '#E8F1F8',
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    legend: {
      data: ['主力净流入', '散户净流入'],
      textStyle: {
        color: '#8BA3B9',
      },
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.flowData.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: '#2C3E50',
        },
      },
      axisLabel: {
        color: '#8BA3B9',
      },
      axisTick: {
        lineStyle: {
          color: '#2C3E50',
        },
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
        formatter: (value: number) => formatNumber(value),
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
        name: '主力净流入',
        type: 'line',
        smooth: true,
        data: data.flowData.map(item => item.mainFlow),
        itemStyle: {
          color: '#FF6B6B',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
              { offset: 1, color: 'rgba(255, 107, 107, 0.05)' },
            ],
          },
        },
        lineStyle: {
          width: 2,
        },
        markPoint: {
          data: [
            {
              type: 'max',
              name: '最大值',
              itemStyle: {
                color: '#FF6B6B',
              },
            },
            {
              type: 'min',
              name: '最小值',
              itemStyle: {
                color: '#4ECDC4',
              },
            },
          ],
        },
      },
      {
        name: '散户净流入',
        type: 'line',
        smooth: true,
        data: data.flowData.map(item => item.retailFlow),
        itemStyle: {
          color: '#4ECDC4',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(78, 205, 196, 0.3)' },
              { offset: 1, color: 'rgba(78, 205, 196, 0.05)' },
            ],
          },
        },
        lineStyle: {
          width: 2,
        },
      },
    ],
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">当日资金趋势</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">买入:</span>
            <span className="text-sm font-medium text-green-500">{formatNumber(data.buyVolume)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">卖出:</span>
            <span className="text-sm font-medium text-red-500">{formatNumber(data.sellVolume)}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-background-dark rounded-lg p-3">
          <div className="text-xs text-text-secondary mb-1">主力净流入</div>
          <div className={`text-lg font-bold ${data.mainNetInflow >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {data.mainNetInflow >= 0 ? '+' : ''}{formatNumber(data.mainNetInflow)}
          </div>
        </div>
        <div className="bg-background-dark rounded-lg p-3">
          <div className="text-xs text-text-secondary mb-1">散户净流入</div>
          <div className={`text-lg font-bold ${data.retailNetInflow >= 0 ? 'text-cyan-500' : 'text-orange-500'}`}>
            {data.retailNetInflow >= 0 ? '+' : ''}{formatNumber(data.retailNetInflow)}
          </div>
        </div>
        <div className="bg-background-dark rounded-lg p-3">
          <div className="text-xs text-text-secondary mb-1">净流入差值</div>
          <div className={`text-lg font-bold ${(data.mainNetInflow - data.retailNetInflow) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {(data.mainNetInflow - data.retailNetInflow) >= 0 ? '+' : ''}{formatNumber(data.mainNetInflow - data.retailNetInflow)}
          </div>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
};

export default CapitalFlowChart;
