import React, { useState, useEffect, useMemo } from 'react';
import { Boss, KalecgosPlayerStat, KalecgosFightStat } from '../types';
import { getKalecgosPlayerStats, getKalecgosFightStats } from '../services/wclService';
import { DataTable } from './DataTable';

interface KalecgosAnalysisProps {
  reportId: string;
  boss: Boss;
}

export const KalecgosAnalysis: React.FC<KalecgosAnalysisProps> = ({ reportId, boss }) => {
  const [playerStats, setPlayerStats] = useState<KalecgosPlayerStat[]>([]);
  const [fightStats, setFightStats] = useState<KalecgosFightStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [playerData, fightData] = await Promise.all([
          getKalecgosPlayerStats(reportId, boss.id),
          getKalecgosFightStats(reportId, boss.id),
        ]);
        setPlayerStats(playerData);
        setFightStats(fightData);
      } catch (error) {
        console.error("Failed to fetch Kalecgos stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, boss.id]);

  const playerColumns = useMemo(() => [
    { key: 'playerName', label: '玩家名称' },
    { key: 'hits', label: '命中次数' },
    { key: 'totalDamage', label: '总伤害' },
    { key: 'avgDamage', label: '平均每次命中伤害' },
  ], []);

  const fightColumns = useMemo(() => [
    { key: 'fightId', label: '战斗 #' },
    { key: 'timestamp', label: '时间戳' },
    { key: 'hits', label: '命中次数' },
    { key: 'totalDamage', label: '总伤害' },
  ], []);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">万相拳玩家统计</h3>
        <DataTable columns={playerColumns} data={playerStats} isLoading={isLoading} keyField="playerName" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-4">万相拳战斗实例统计</h3>
        <DataTable columns={fightColumns} data={fightStats} isLoading={isLoading} keyField="fightId" />
      </div>
    </div>
  );
};