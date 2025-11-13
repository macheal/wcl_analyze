import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { ExtendedKalecgosPlayerStat } from './KalecgosAnalysis';

interface PieChartData {
  name: string;
  value: number;
  itemStyle?: any;
}

interface KalecgosPieChartsProps {
  playerStats: ExtendedKalecgosPlayerStat[];
}

export const KalecgosPieCharts: React.FC<KalecgosPieChartsProps> = ({ playerStats }) => {
  const [chart1Data, setChart1Data] = useState<PieChartData[]>([]);
  const [chart2Data, setChart2Data] = useState<PieChartData[]>([]);
  const [chart1DrillDown, setChart1DrillDown] = useState<{ player: string; data: PieChartData[] } | null>(null);
  const [chart2DrillDown, setChart2DrillDown] = useState<{ stack: string; data: PieChartData[] } | null>(null);

  // 生成玩家维度数据
  useEffect(() => {
    const data = playerStats.map(player => ({
      name: player.playerName,
      value: player.hits || 0,
      itemStyle: {
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }
    }));
    setChart1Data(data);
  }, [playerStats]);

  // 生成失误次数维度数据
  useEffect(() => {
    const stack1Total = playerStats.reduce((sum, player) => sum + (player.stack_1 || 0), 0);
    const stack2Total = playerStats.reduce((sum, player) => sum + (player.stack_2 || 0), 0);
    const stack3Total = playerStats.reduce((sum, player) => sum + (player.stack_3 || 0), 0);

    const data = [
      { name: '第一次', value: stack1Total, itemStyle: { color: '#FF6B6B' } },
      { name: '第二次', value: stack2Total, itemStyle: { color: '#4ECDC4' } },
      { name: '第三次', value: stack3Total, itemStyle: { color: '#45B7D1' } }
    ];
    setChart2Data(data);
  }, [playerStats]);

  // 图表1点击事件 - 玩家下钻
  const onChart1Click = (params: any) => {
    if (chart1DrillDown) return; // 已经在下钻状态
    
    const clickedPlayer = params.name;
    const playerData = playerStats.find(p => p.playerName === clickedPlayer);
    
    if (playerData) {
      const drillDownData = [
        { name: '第一次', value: playerData.stack_1 || 0, itemStyle: { color: '#FF6B6B' } },
        { name: '第二次', value: playerData.stack_2 || 0, itemStyle: { color: '#4ECDC4' } },
        { name: '第三次', value: playerData.stack_3 || 0, itemStyle: { color: '#45B7D1' } }
      ];
      setChart1DrillDown({ player: clickedPlayer, data: drillDownData });
    }
  };

  // 图表2点击事件 - 失误次数下钻
  const onChart2Click = (params: any) => {
    if (chart2DrillDown) return; // 已经在下钻状态
    
    const clickedStack = params.name;
    let stackKey: keyof ExtendedKalecgosPlayerStat;
    
    switch (clickedStack) {
      case '第一次':
        stackKey = 'stack_1';
        break;
      case '第二次':
        stackKey = 'stack_2';
        break;
      case '第三次':
        stackKey = 'stack_3';
        break;
      default:
        return;
    }

    const drillDownData = playerStats
      .filter(player => player[stackKey] && player[stackKey]! > 0)
      .map(player => ({
        name: player.playerName,
        value: player[stackKey]!,
        itemStyle: {
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        }
      }));
    
    setChart2DrillDown({ stack: clickedStack, data: drillDownData });
  };

  // 返回上级
  const backToChart1Main = () => {
    setChart1DrillDown(null);
  };

  const backToChart2Main = () => {
    setChart2DrillDown(null);
  };

  // 获取图表配置
  const getChartOption = (data: PieChartData[], title: string) => ({
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: false
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return Math.random() * 200;
        }
      }
    ]
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* 图表1：玩家维度失误统计 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {chart1DrillDown ? `${chart1DrillDown.player} - 失误分布` : '玩家维度失误统计'}
          </h3>
          {chart1DrillDown && (
            <button
              onClick={backToChart1Main}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              ← 返回上级
            </button>
          )}
        </div>
        <ReactECharts
          option={getChartOption(
            chart1DrillDown ? chart1DrillDown.data : chart1Data,
            chart1DrillDown ? '失误分布' : '玩家失误统计'
          )}
          style={{ height: '400px', width: '100%' }}
          onEvents={{
            click: chart1DrillDown ? undefined : onChart1Click
          }}
        />
      </div>

      {/* 图表2：失误次数维度统计 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {chart2DrillDown ? `${chart2DrillDown.stack} - 玩家分布` : '失误次数维度统计'}
          </h3>
          {chart2DrillDown && (
            <button
              onClick={backToChart2Main}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              ← 返回上级
            </button>
          )}
        </div>
        <ReactECharts
          option={getChartOption(
            chart2DrillDown ? chart2DrillDown.data : chart2Data,
            chart2DrillDown ? '玩家分布' : '失误次数统计'
          )}
          style={{ height: '400px', width: '100%' }}
          onEvents={{
            click: chart2DrillDown ? undefined : onChart2Click
          }}
        />
      </div>
    </div>
  );
};