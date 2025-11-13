import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface PhaseDetailStat {
  id: number;
  boss_percentage: string | number;
  boos_lastPhaseForPercentageDisplay: string;
  cost: number;
  stack_1: string[];
  stack_2: string[];
  stack_3: string[];
}

interface KalecgosStackChartsProps {
  phaseStats: PhaseDetailStat[];
  isLoading: boolean;
}

export const KalecgosStackCharts: React.FC<KalecgosStackChartsProps> = ({ phaseStats, isLoading }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [allPlayers, setAllPlayers] = useState<string[]>([]);

  // 获取所有玩家名称 - 使用useMemo优化性能
  const playersSet = useMemo(() => {
    const players = new Set<string>();
    phaseStats.forEach(stat => {
      stat.stack_1.forEach(player => players.add(player));
      stat.stack_2.forEach(player => players.add(player));
      stat.stack_3.forEach(player => players.add(player));
    });
    return Array.from(players).sort();
  }, [phaseStats]);

  useEffect(() => {
    setAllPlayers(playersSet);
  }, [playersSet]);

  // 过滤数据 - 添加错误处理
  const filteredPhaseStats = useMemo(() => {
    if (!selectedPlayer) return phaseStats;
    
    try {
      return phaseStats.filter(stat => {
        // 确保每个stack字段都是数组
        const stack1 = Array.isArray(stat.stack_1) ? stat.stack_1 : [];
        const stack2 = Array.isArray(stat.stack_2) ? stat.stack_2 : [];
        const stack3 = Array.isArray(stat.stack_3) ? stat.stack_3 : [];
        
        return stack1.includes(selectedPlayer) ||
               stack2.includes(selectedPlayer) ||
               stack3.includes(selectedPlayer);
      });
    } catch (error) {
      console.error('过滤数据时出错:', error);
      return phaseStats;
    }
  }, [phaseStats, selectedPlayer]);

  // 堆叠柱形图配置 - 优化tooltip和性能
  const stackedBarOption: EChartsOption = useMemo(() => {
    const xAxisData = filteredPhaseStats.map(stat => `场次${stat.id}`);
    const stack1Data = filteredPhaseStats.map(stat => Array.isArray(stat.stack_1) ? stat.stack_1.length : 0);
    const stack2Data = filteredPhaseStats.map(stat => Array.isArray(stat.stack_2) ? stat.stack_2.length : 0);
    const stack3Data = filteredPhaseStats.map(stat => Array.isArray(stat.stack_3) ? stat.stack_3.length : 0);
    // 获取boss血量百分比数据
    const bossPercentageData = filteredPhaseStats.map(stat => {
      const value = typeof stat.boss_percentage === 'number' ? stat.boss_percentage : parseFloat(stat.boss_percentage);
      return isNaN(value) ? 0 : value;
    });

    return {
      title: {
        text: '万相拳各阶段失误人数统计',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      textStyle: {
        color: '#fff'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function(params: any) {
          if (!params || !params.length || !filteredPhaseStats[params[0].dataIndex]) {
            return '数据加载中...';
          }
          
          const stat = filteredPhaseStats[params[0].dataIndex];
          const percentage = typeof stat.boss_percentage === 'number' ? (stat.boss_percentage * 100).toFixed(1) : stat.boss_percentage;
          let result = `<div style="font-weight: bold; margin-bottom: 5px;">场次 ${stat.id} - ${stat.boos_lastPhaseForPercentageDisplay}</div>`;
          result += `<div>阶段: ${stat.boos_lastPhaseForPercentageDisplay}</div>`;
          result += `<div>Boss血量: ${percentage}%</div>`;
          result += `<div>用时: ${stat.cost}秒</div>`;
          result += `<div style="margin-top: 8px;">`;
          params.forEach((param: any) => {
            result += `<div style="display: flex; align-items: center; margin: 2px 0;">`;
            result += `<span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px;"></span>`;
            if (param.seriesName === 'boss血量') {
              result += `<span>${param.seriesName}: ${(param.value * 100).toFixed(1)}%</span>`;
            } else {
              result += `<span>${param.seriesName}: ${param.value}人</span>`;
            }
            result += `</div>`;
          });
          result += `</div>`;
          return result;
        }
      },
      legend: {
        data: ['第一次失误', '第二次失误', '第三次失误', 'boss血量'],
        top: 40,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: 45,
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '失误人数',
          position: 'left',
          nameTextStyle: {
            fontSize: 12,
            color: '#fff'
          },
          axisLabel: {
            color: '#fff'
          },
          axisLine: {
            lineStyle: {
              color: '#fff'
            }
          }
        },
        {
          type: 'value',
          name: 'boss血量(%)',
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#fff'
          },
          axisLabel: {
            color: '#fff',
            formatter: function(value: number) {
              return (value * 100).toFixed(0) + '%';
            }
          },
          axisLine: {
            lineStyle: {
              color: '#fff'
            }
          },
          max: 1
        }
      ],
      series: [
        {
          name: '第一次失误',
          type: 'bar',
          stack: 'total',
          data: stack1Data,
          itemStyle: {
            color: '#5470c6'
          }
        },
        {
          name: '第二次失误',
          type: 'bar',
          stack: 'total',
          data: stack2Data,
          itemStyle: {
            color: '#91cc75'
          }
        },
        {
          name: '第三次失误',
          type: 'bar',
          stack: 'total',
          data: stack3Data,
          itemStyle: {
            color: '#fac858'
          }
        },
        {
          name: 'boss血量',
          type: 'line',
          yAxisIndex: 1,
          data: bossPercentageData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#ee6666'
          },
          lineStyle: {
            width: 3
          }
        }
      ]
    };
  }, [filteredPhaseStats]);

  // 折线图配置 - 优化tooltip和性能
  const lineChartOption: EChartsOption = useMemo(() => {
    const xAxisData = filteredPhaseStats.map(stat => `场次${stat.id}`);
    const stack1Data = filteredPhaseStats.map(stat => Array.isArray(stat.stack_1) ? stat.stack_1.length : 0);
    const stack2Data = filteredPhaseStats.map(stat => Array.isArray(stat.stack_2) ? stat.stack_2.length : 0);
    const stack3Data = filteredPhaseStats.map(stat => Array.isArray(stat.stack_3) ? stat.stack_3.length : 0);

    return {
      title: {
        text: '万相拳各阶段失误趋势图',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      textStyle: {
        color: '#fff'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          if (!params || !params.length || !filteredPhaseStats[params[0].dataIndex]) {
            return '数据加载中...';
          }
          
          const data = filteredPhaseStats[params[0].dataIndex];
          let result = `<div style="font-weight: bold; margin-bottom: 5px;">场次 ${data.id}</div>`;
          result += `<div>Boss血量: ${data.boss_percentage}</div>`;
          result += `<div>用时: ${data.cost}秒</div>`;
          result += `<div style="margin-top: 8px;">`;
          params.forEach((param: any) => {
            result += `<div style="display: flex; align-items: center; margin: 2px 0;">`;
            result += `<span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px;"></span>`;
            result += `<span>${param.seriesName}: ${param.value}人</span>`;
            result += `</div>`;
          });
          result += `</div>`;
          return result;
        }
      },
      legend: {
        data: ['第一次失误', '第二次失误', '第三次失误'],
        top: 40,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: 45,
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '失误人数',
        nameTextStyle: {
          fontSize: 12,
          color: '#fff'
        },
        axisLabel: {
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      },
      series: [
        {
          name: '第一次失误',
          type: 'line',
          data: stack1Data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#5470c6'
          }
        },
        {
          name: '第二次失误',
          type: 'line',
          data: stack2Data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#91cc75'
          }
        },
        {
          name: '第三次失误',
          type: 'line',
          data: stack3Data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#fac858'
          }
        }
      ]
    };
  }, [filteredPhaseStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="h-96 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="h-96 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 玩家过滤器 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-white font-medium">玩家过滤:</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">全部玩家</option>
            {allPlayers.map(player => (
              <option key={player} value={player}>{player}</option>
            ))}
          </select>
          {selectedPlayer && (
            <button
              onClick={() => setSelectedPlayer('')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
            >
              清除过滤
            </button>
          )}
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 堆叠柱形图 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <ReactECharts
            option={stackedBarOption}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        {/* 折线图 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <ReactECharts
            option={lineChartOption}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  );
};