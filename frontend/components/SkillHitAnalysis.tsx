/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-13 12:33:08
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-18 16:48:50
 * @FilePath: /wcl_analyze/frontend/components/SkillHitAnalysis.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Boss, Ability, SkillHitSummary } from '../types';
import { getAbilities, getSkillHitSummary, getSkillHitDetail, SkillHitDetail } from '../services/wclService';
import { Spinner } from './Spinner';
import { DataTable } from './DataTable';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface SkillHitAnalysisProps {
  reportId: string;
  boss: Boss;
}

// FIX: Export the component to make it available for import in other modules.
export const SkillHitAnalysis: React.FC<SkillHitAnalysisProps> = ({ reportId, boss }) => {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [hitSummaryData, setHitSummaryData] = useState<SkillHitSummary[]>([]);
  const [isLoadingAbilities, setIsLoadingAbilities] = useState<boolean>(true);
  const [isLoadingHitSummary, setIsLoadingHitSummary] = useState<boolean>(false);
  // 下钻相关状态
  const [drillDownState, setDrillDownState] = useState<{ 
    isDrillDown: boolean; 
    userId: string; 
    userName: string; 
    drillDownData: SkillHitDetail[] 
  }>({ isDrillDown: false, userId: '', userName: '', drillDownData: [] });
  const [isLoadingDrillDown, setIsLoadingDrillDown] = useState<boolean>(false);

  // 刷新功能已移除

  useEffect(() => {
    const fetchAbilities = async () => {
      setIsLoadingAbilities(true);
      setAbilities([]);
      setSelectedAbility(null);
      try {
        const fetchedAbilities = await getAbilities(reportId, boss.id);
        setAbilities(fetchedAbilities);
        // 不再自动选择第一个技能，让用户手动选择
        setSelectedAbility(null);
      } catch (error) {
        console.error("Failed to fetch abilities", error);
      } finally {
        setIsLoadingAbilities(false);
      }
    };

    fetchAbilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, boss.id]);

  // 获取技能命中汇总数据
  useEffect(() => {
    if (!selectedAbility) {
      setHitSummaryData([]);
      return;
    }

    const fetchHitSummaryData = async () => {
      setIsLoadingHitSummary(true);
      try {
        const data = await getSkillHitSummary(reportId, boss.id, selectedAbility.id);
        setHitSummaryData(data);
      } catch (error) {
        console.error("Failed to fetch hit summary data", error);
        setHitSummaryData([]);
      } finally {
        setIsLoadingHitSummary(false);
      }
    };

    fetchHitSummaryData();
  }, [reportId, boss.id, selectedAbility]);

  // 定义表格列
  const columns = useMemo(() => [
    { key: 'name', label: '姓名', align: 'left' },
    { key: 'amount', label: '最终伤害', format: 'number', align: 'right' },
    { key: 'count', label: '命中次数', format: 'number',align: 'right' },
    { key: 'unmitigatedAmount', label: '原始伤害', format: 'number', align: 'right' },
    { key: 'mitigated', label: '减伤', format: 'number', align: 'right' },
    { key: 'absorbed', label: '吸收盾', format: 'number', align: 'right' },
  ], []);

  // 处理饼图点击事件
  const handlePieChartClick = async (params: any) => {
    if (drillDownState.isDrillDown || !selectedAbility) return;
    
    const clickedItem = hitSummaryData.find(item => item.name === params.name);
    if (!clickedItem) return;
    
    setIsLoadingDrillDown(true);
    try {
      const detailData = await getSkillHitDetail(reportId, boss.id, selectedAbility.id, clickedItem.id);
      setDrillDownState({
        isDrillDown: true,
        userId: clickedItem.id,
        userName: clickedItem.name,
        drillDownData: detailData
      });
    } catch (error) {
      console.error('Failed to fetch drill down data:', error);
    } finally {
      setIsLoadingDrillDown(false);
    }
  };

  // 返回上级 - 修复界面混乱问题
  const handleBackToMain = () => {
    // 重置下钻状态，使用函数式更新确保状态正确重置
    setDrillDownState(prevState => ({
      ...prevState,
      isDrillDown: false,
      drillDownData: []
    }));
  };

  // 图表配置（根据是否下钻显示饼图或柱状图）
  const chartOption = useMemo(() => {
    if (!selectedAbility || (hitSummaryData.length === 0 && !drillDownState.isDrillDown)) {
      return {}
    }

    // 下钻状态：显示柱状图（双Y轴）
    if (drillDownState.isDrillDown) {
      const drillDownFightData = drillDownState.drillDownData
        .filter(item => item.fight > 0) // 只显示有数据的战斗
        .sort((a, b) => a.fight - b.fight); // 按战斗场次排序

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          show: true,
          data: ['最终伤害', '命中次数'],
          textStyle: {
            color: '#fff'
          },
          top: 'bottom'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: drillDownFightData.map(item => `战斗 ${item.fight}`),
            axisPointer: {
              type: 'shadow'
            },
            axisLabel: {
              color: '#fff'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '最终伤害',
            min: 0,
            max: drillDownFightData.length > 0 ? Math.max(...drillDownFightData.map(item => item.amount)) * 1.2 : 100,
            axisLabel: {
              formatter: '{value}',
              color: '#fff'
            },
            nameTextStyle: {
              color: '#fff'
            }
          },
          {
            type: 'value',
            name: '命中次数',
            min: 0,
            max: drillDownFightData.length > 0 ? Math.max(...drillDownFightData.map(item => item.count)) * 1.2 : 10,
            axisLabel: {
              formatter: '{value}',
              color: '#fff'
            },
            nameTextStyle: {
              color: '#fff'
            }
          }
        ],
        series: [
          {
            name: '最终伤害',
            type: 'bar',
            data: drillDownFightData.map(item => item.amount),
            itemStyle: {
              color: '#36cfc9'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
          {
            name: '命中次数',
            type: 'line',
            yAxisIndex: 1,
            data: drillDownFightData.map(item => item.count),
            itemStyle: {
              color: '#f9c851'
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return Math.random() * 200;
        }
      };
    }
    
    // 主状态：显示饼图
    const pieData = hitSummaryData.map(item => ({
      name: item.name,
      value: item.amount,
      itemStyle: {
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        show: false
      },
      series: [
        {
          name: '最终伤害',
          type: 'pie',
          radius: '50%',
          center: ['50%', '60%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)',
            textStyle: {
              color: '#ffffff',
              textBorderColor: 'transparent',
              textBorderWidth: 0
            }
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx: number) {
            return Math.random() * 200;
          }
        }
      ]
    };
  }, [selectedAbility, hitSummaryData, drillDownState]);

  // 堆叠面积图配置
  const stackAreaChartOption = useMemo(() => {
    if (!selectedAbility || hitSummaryData.length === 0) {
      return {}
    }

    return {
      title: {
        text: '伤害构成分析',
        left: 'center',
        textStyle: {
          color: '#fff'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['最终伤害', '减伤', '吸收盾'],
        textStyle: {
          color: '#fff'
        },
        top: 'bottom'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: hitSummaryData.map(item => item.name),
        axisLabel: {
          color: '#fff',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#fff'
        }
      },
      series: [
        {
          name: '最终伤害',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: hitSummaryData.map(item => item.amount)
        },
        {
          name: '减伤',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: hitSummaryData.map(item => item.mitigated)
        },
        {
          name: '吸收盾',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: hitSummaryData.map(item => item.absorbed)
        }
      ]
    };
  }, [selectedAbility, hitSummaryData]);

  const handleAbilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const abilityId = parseInt(e.target.value, 10);
    const ability = abilities.find(a => a.id === abilityId);
    if (ability) {
      setSelectedAbility(ability);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="ability-select" className="text-lg font-semibold text-gray-300 whitespace-nowrap">
          选择技能:
        </label>
        {isLoadingAbilities ? (
          <div className="h-10 w-64 bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <select
            id="ability-select"
            value={selectedAbility?.id || ''}
            onChange={handleAbilityChange}
            className="w-full max-w-sm bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="选择技能"
            disabled={abilities.length === 0}
          >
            <option value="">请选择技能</option>
            {abilities.length > 0 ? (
              abilities.map((ability) => (
                <option key={ability.id} value={ability.id}>
                  {ability.name}
                </option>
              ))
            ) : (
              <option disabled>该首领未找到技能</option>
            )}          
          </select>
        )}
      </div>

      <div className="text-xl font-bold text-white mb-4">
        {selectedAbility ? `${selectedAbility.name} - 命中汇总` : '选择一个技能以查看详情'}
      </div>
      
      {selectedAbility && (
        <>
          {/* 图表区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {drillDownState.isDrillDown 
                    ? `${drillDownState.userName} - 战斗伤害与命中统计` 
                    : '最终伤害分布'
                  }
                </h3>
                {drillDownState.isDrillDown && (
                  <button
                    onClick={handleBackToMain}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    ← 返回上级
                  </button>
                )}
              </div>
              <ReactECharts 
                key={drillDownState.isDrillDown ? 'drilldown' : 'main'} // 添加key属性强制重新渲染
                option={chartOption} 
                style={{ height: '400px', width: '100%' }}
                opts={{ renderer: 'canvas' }}
                onEvents={{
                  click: drillDownState.isDrillDown ? undefined : handlePieChartClick
                }}
              />
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <ReactECharts 
                option={stackAreaChartOption} 
                style={{ height: '400px', width: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          </div>
          
          {/* 表格 */}
          <DataTable 
            columns={columns} 
            data={drillDownState.isDrillDown ? [] : hitSummaryData} 
            isLoading={isLoadingHitSummary || isLoadingDrillDown} 
            keyField="id" 
          />
          
          {/* 下钻后的详细表格 */}
          {drillDownState.isDrillDown && drillDownState.drillDownData.length > 0 && (
            <div className="mt-6 bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">{drillDownState.userName} - 每场战斗详情</h3>
              <DataTable 
                columns={[
                  { key: 'fight', label: '战斗场次' },
                  { key: 'amount', label: '最终伤害' },
                  { key: 'count', label: '命中次数' },
                  { key: 'unmitigatedAmount', label: '原始伤害' },
                  { key: 'mitigated', label: '减伤' },
                  { key: 'absorbed', label: '吸收盾' },
                ]} 
                data={drillDownState.drillDownData.filter(item => item.fight > 0)} 
                isLoading={isLoadingDrillDown} 
                keyField="fight" 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};