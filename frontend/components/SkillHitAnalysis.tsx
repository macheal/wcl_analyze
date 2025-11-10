import React, { useState, useEffect, useMemo } from 'react';
import { Boss, Ability, SkillHit } from '../types';
import { getAbilities, getSkillHits } from '../services/wclService';
import { DataTable } from './DataTable';
import { Spinner } from './Spinner';

interface SkillHitAnalysisProps {
  reportId: string;
  boss: Boss;
}

// FIX: Export the component to make it available for import in other modules.
export const SkillHitAnalysis: React.FC<SkillHitAnalysisProps> = ({ reportId, boss }) => {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [hitData, setHitData] = useState<SkillHit[]>([]);
  const [isLoadingAbilities, setIsLoadingAbilities] = useState<boolean>(true);
  const [isLoadingHitData, setIsLoadingHitData] = useState<boolean>(false);

  useEffect(() => {
    const fetchAbilities = async () => {
      setIsLoadingAbilities(true);
      setAbilities([]);
      setSelectedAbility(null);
      setHitData([]);
      try {
        const fetchedAbilities = await getAbilities(reportId, boss.id);
        setAbilities(fetchedAbilities);
        if (fetchedAbilities.length > 0) {
          setSelectedAbility(fetchedAbilities[0]);
        }
      } catch (error) {
        console.error("Failed to fetch abilities", error);
      } finally {
        setIsLoadingAbilities(false);
      }
    };

    fetchAbilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, boss.id]);

  useEffect(() => {
    if (!selectedAbility) return;

    const fetchHitData = async () => {
      setIsLoadingHitData(true);
      setHitData([]);
      try {
        const fetchedHitData = await getSkillHits(reportId, boss.id, selectedAbility.id);
        setHitData(fetchedHitData);
      } catch (error) {
        console.error("Failed to fetch hit data", error);
      } finally {
        setIsLoadingHitData(false);
      }
    };

    fetchHitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, boss.id, selectedAbility]);

  const columns = useMemo(() => [
    { key: 'timestamp', label: '会话' },
    { key: 'playerName', label: '命中玩家' },
    { key: 'hitType', label: '状态' },
  ], []);

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
            {abilities.length > 0 ? (
              abilities.map((ability) => (
                <option key={ability.id} value={ability.id}>
                  {ability.name}
                </option>
              ))
            ) : (
              <option>该首领未找到技能</option>
            )}
          </select>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-4">
        {selectedAbility ? `${selectedAbility.name} - 命中详情` : '选择一个技能以查看详情'}
      </h3>
      
      <DataTable 
        columns={columns} 
        data={hitData} 
        isLoading={isLoadingHitData} 
        keyField="timestamp" 
      />
    </div>
  );
};