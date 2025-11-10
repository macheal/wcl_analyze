/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-10 06:17:34
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-10 15:34:33
 * @FilePath: /wcl_analyze/frontend/components/KalecgosAnalysis.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Boss, KalecgosPlayerStat, KalecgosFightStat, ExtendedKalecgosFightStat } from '../types';
import { getKalecgosPlayerStats, getKalecgosFightStats } from '../services/wclService';
import { DataTable } from './DataTable';

// 扩展玩家统计类型，包含失误轮次分布
interface ExtendedKalecgosPlayerStat extends KalecgosPlayerStat {
  mistakeDistribution?: string;
}

interface KalecgosAnalysisProps {
  reportId: string;
  boss: Boss;
}

export const KalecgosAnalysis: React.FC<KalecgosAnalysisProps> = ({ reportId, boss }) => {
  const [playerStats, setPlayerStats] = useState<ExtendedKalecgosPlayerStat[]>([]);
  const [fightStats, setFightStats] = useState<ExtendedKalecgosFightStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [playerData, fightData] = await Promise.all([
        getKalecgosPlayerStats(reportId, boss.id),
        getKalecgosFightStats(reportId, boss.id),
      ]);
      setPlayerStats(playerData);
      setFightStats(fightData);
    } catch (error) {
      console.error("Failed to fetch Kalecgos stats", error);
      setError('获取万相拳统计数据失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, boss.id]);

  const playerColumns = useMemo(() => [
    { key: 'playerName', label: '玩家名称' },
    { key: 'hits', label: '失误次数' },
    { key: 'mistakeDistribution', label: '失误轮次分布' },
  ], []);

  const fightColumns = useMemo(() => [
    { key: 'fightId', label: '战斗ID' },
    { key: 'timestamp', label: 'Boss血量阶段' },
    { key: 'hits', label: '战斗用时(秒)' },
    { key: 'detail', label: '明细' },
  ], []);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">万相拳失误统计</h3>
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
      
      <DataTable columns={playerColumns} data={playerStats} isLoading={isLoading} keyField="playerName" />
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">万相拳分阶段统计</h3>
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
      
      <DataTable columns={fightColumns} data={fightStats} isLoading={isLoading} keyField="fightId" />
    </div>
  );
};