/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-10 06:17:34
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-10 14:44:47
 * @FilePath: /wcl_analyze/frontend/components/BossSelector.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import { Boss } from '../types';

interface BossSelectorProps {
  bosses: Boss[];
  selectedBoss: Boss | null;
  onSelect: (boss: Boss) => void;
  isLoading: boolean;
}

export const BossSelector: React.FC<BossSelectorProps> = ({ bosses, selectedBoss, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-8 w-full bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bossId = parseInt(e.target.value, 10);
    const boss = bosses.find(b => b.id === bossId);
    if (boss) {
      onSelect(boss);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="boss-select" className="text-lg font-semibold text-gray-300 whitespace-nowrap">
        选择首领:
      </label>
      <select
        id="boss-select"
        value={selectedBoss?.id || ''}
        onChange={handleSelect}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-label="选择首领"
      >
        {bosses.map((boss) => (
          <option key={boss.id} value={boss.id}>
            {boss.name} 
          </option>
        ))}
      </select>
    </div>
  );
};