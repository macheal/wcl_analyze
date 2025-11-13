/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-10 06:17:34
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-13 11:16:01
 * @FilePath: /wcl_analyze/frontend/components/KalecgosAnalysis.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Boss, KalecgosPlayerStat } from '../types';
import { getKalecgosPlayerStats, getKalecgosPhaseStats } from '../services/wclService';
import { DataTable, SortDirection } from './DataTable';
import { KalecgosPieCharts } from './KalecgosPieCharts';
import { KalecgosStackCharts } from './KalecgosStackCharts';

// 扩展玩家统计类型，包含失误轮次分布和阶段统计
export interface ExtendedKalecgosPlayerStat extends KalecgosPlayerStat {
  mistakeDistribution?: string;
  stack_1?: number;
  stack_2?: number;
  stack_3?: number;
}

// 万相拳分阶段详细统计类型
interface KalecgosPhaseDetailStat {
  id: number;
  boss_percentage: string;
  cost: number;
  stack_1: string[];
  stack_2: string[];
  stack_3: string[];
  url?: string; // 场次详情链接
}

interface KalecgosAnalysisProps {
  reportId: string;
  boss: Boss;
}

export const KalecgosAnalysis: React.FC<KalecgosAnalysisProps> = ({ reportId, boss }) => {
  const [playerStats, setPlayerStats] = useState<ExtendedKalecgosPlayerStat[]>([]);
  const [phaseStats, setPhaseStats] = useState<KalecgosPhaseDetailStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  // 排序状态
  const [playerSortColumn, setPlayerSortColumn] = useState<string>('hits');
  const [playerSortDirection, setPlayerSortDirection] = useState<SortDirection>('desc');
  const [phaseSortColumn, setPhaseSortColumn] = useState<string>('id');
  const [phaseSortDirection, setPhaseSortDirection] = useState<SortDirection>('asc');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const playerData = await getKalecgosPlayerStats(reportId, boss.id);
      setPlayerStats(playerData);
      
      // 获取分阶段统计数据
      const phaseData = await getKalecgosPhaseStats(reportId);
      setPhaseStats(phaseData);
    } catch (error) {
      console.error("Failed to fetch Kalecgos stats", error);
      setError('获取万相拳统计数据失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 排序处理函数
  const handlePlayerSort = (columnKey: string, direction: SortDirection) => {
    setPlayerSortColumn(columnKey);
    setPlayerSortDirection(direction);
  };
  
  // 阶段统计排序处理函数
  const handlePhaseSort = (columnKey: string, direction: SortDirection) => {
    setPhaseSortColumn(columnKey);
    setPhaseSortDirection(direction);
  };
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, boss.id]);
  
  // 排序数据
  const sortedPlayerStats = useMemo(() => {
    if (!playerSortColumn || !playerSortDirection || playerStats.length === 0) {
      return playerStats;
    }
    
    return [...playerStats].sort((a, b) => {
      const aValue = a[playerSortColumn as keyof ExtendedKalecgosPlayerStat];
      const bValue = b[playerSortColumn as keyof ExtendedKalecgosPlayerStat];
      
      // 数字类型比较
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return playerSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // 字符串类型比较
      const aStr = String(aValue);
      const bStr = String(bValue);
      return playerSortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [playerStats, playerSortColumn, playerSortDirection]);
  
  // 排序阶段数据
  const sortedPhaseStats = useMemo(() => {
    if (!phaseSortColumn || !phaseSortDirection || phaseStats.length === 0) {
      return phaseStats;
    }
    
    return [...phaseStats].sort((a, b) => {
      const aValue = a[phaseSortColumn as keyof KalecgosPhaseDetailStat];
      const bValue = b[phaseSortColumn as keyof KalecgosPhaseDetailStat];
      
      // 数字类型比较
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return phaseSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // 字符串类型比较
      const aStr = String(aValue);
      const bStr = String(bValue);
      return phaseSortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [phaseStats, phaseSortColumn, phaseSortDirection]);

  // 格式化阶段统计数据，将数组转换为换行符分隔的字符串
  const formattedPhaseStats = useMemo(() => {
    return sortedPhaseStats.map(stat => ({
      ...stat,
      // 将数组转换为换行符分隔的字符串，用于表格显示
      stack_1: Array.isArray(stat.stack_1) ? stat.stack_1.join('\n') : '',
      stack_2: Array.isArray(stat.stack_2) ? stat.stack_2.join('\n') : '',
      stack_3: Array.isArray(stat.stack_3) ? stat.stack_3.join('\n') : ''
    }));
  }, [sortedPhaseStats]);
  


  const playerColumns = useMemo(() => [
    { key: 'playerName', label: '玩家' },
    { key: 'hits', label: '失误次数' },
    { key: 'stack_1', label: '第一次' },
    { key: 'stack_2', label: '第二次' },
    { key: 'stack_3', label: '第三次' },
  ], []);
  
  // 阶段统计表格列配置
  const phaseColumns = useMemo(() => [
    { 
      key: 'id', 
      label: '场次ID',
      render: (value: any, row: KalecgosPhaseDetailStat) => {
        if (row.url) {
          return (
            <a 
              href={row.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          );
        }
        return value;
      }
    },
    { key: 'boss_percentage', label: 'boss血量' },
    { key: 'cost', label: '用时（秒）' },
    { key: 'stack_1', label: '第一次' },
    { key: 'stack_2', label: '第二次' },
    { key: 'stack_3', label: '第三次' },
  ], []);



  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">万相拳统计分析</h2>
          <p className="text-gray-400 text-sm">点击刷新按钮更新所有统计数据</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              刷新中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新
            </>
          )}
        </button>
      </div>
      
      {/* 饼图统计区域 */}
      <KalecgosPieCharts playerStats={sortedPlayerStats} />
      
     
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">万相拳失误统计</h3>
          <DataTable 
            columns={playerColumns} 
            data={sortedPlayerStats} 
            isLoading={isLoading} 
            keyField="playerName" 
            onSort={handlePlayerSort}
            
          />
        </div>
        {/* 堆叠图表区域 */}
        <KalecgosStackCharts phaseStats={sortedPhaseStats} isLoading={isLoading} />
      
        
        <div>
          <h3 className="text-xl font-bold text-white mb-4">万相拳分阶段统计</h3>
          <DataTable 
            columns={phaseColumns} 
            data={formattedPhaseStats} 
            isLoading={isLoading} 
            keyField="id" 
            onSort={handlePhaseSort}
          />
        </div>
      </div>
    </div>
  );
};