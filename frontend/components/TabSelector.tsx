import React from 'react';
import { TabId, TabInfo } from '../types';

interface TabSelectorProps {
  tabs: TabInfo[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 border-b-2 border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none -mb-0.5
            ${activeTab === tab.id
              ? 'border-b-2 border-cyan-400 text-white'
              : 'border-b-2 border-transparent text-gray-400 hover:text-white'
            }
          `}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
