import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReportIdModal } from './components/ReportIdModal';
import { BossSelector } from './components/BossSelector';
import { TabSelector } from './components/TabSelector';
import { SkillHitAnalysis } from './components/SkillHitAnalysis';
import { KalecgosAnalysis } from './components/KalecgosAnalysis';
import { Spinner } from './components/Spinner';
import { getBosses } from './services/wclService';
import { Boss, TabId, TabInfo } from './types';
import { WowIcon, GithubIcon } from './components/icons/Icons';

// URL参数处理的辅助函数
const getReportIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  return urlParams.get('reportId');
};

const clearReportIdFromUrl = (): void => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  urlParams.delete('reportId');
  window.location.hash = urlParams.toString();
};

export default function App() {
  const [reportId, setReportId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('skillHit');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReportIdSubmit = useCallback(async (id: string) => {
    if (!id.trim()) {
      setError('报告ID不能为空。');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBosses = await getBosses(id);
      setBosses(fetchedBosses);
      if (fetchedBosses.length > 0) {
        setSelectedBoss(fetchedBosses[0]);
      }
      setReportId(id);
      setShowModal(false);
    } catch (e) {
      setError('获取报告ID数据失败。请检查ID后重试。');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 从URL查询参数中获取reportId并自动应用
  useEffect(() => {
    const urlReportId = getReportIdFromUrl();
    
    if (urlReportId && !reportId) {
      handleReportIdSubmit(urlReportId);
    }
  }, [reportId, handleReportIdSubmit]);

  // 监听URL变化，支持在页面已加载后更新查询参数
  useEffect(() => {
    const handleHashChange = () => {
      const urlReportId = getReportIdFromUrl();
      
      if (urlReportId && urlReportId !== reportId) {
        handleReportIdSubmit(urlReportId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [reportId, handleReportIdSubmit]);

  useEffect(() => {
    // 只有当URL中没有reportId参数时才自动打开modal
    const urlReportId = getReportIdFromUrl();
    
    if (!urlReportId) {
      setShowModal(true);
    }
  }, []);

  const resetApp = () => {
    setReportId(null);
    setShowModal(true);
    setBosses([]);
    setSelectedBoss(null);
    setActiveTab('skillHit');
    setError(null);
    // 重置URL中的reportId参数
    clearReportIdFromUrl();
  };

  const availableTabs = useMemo((): TabInfo[] => {
    const tabs: TabInfo[] = [{ id: 'skillHit', label: '技能命中查询' }];
    if (selectedBoss?.id === 3134) {
      tabs.push({ id: 'kalecgos', label: '卡雷什M7万相拳' });
    }
    return tabs;
  }, [selectedBoss]);

  useEffect(() => {
    if (!availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab('skillHit');
    }
  }, [availableTabs, activeTab]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <WowIcon className="h-12 w-12 text-yellow-400"/>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">WCL 战斗日志分析系统</h1>
            {reportId && <p className="text-sm text-gray-400">报告ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{reportId}</span> <button onClick={resetApp} className="ml-2 text-cyan-400 hover:text-cyan-500 text-xs">(更改)</button></p>}
          </div>
        </div>
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
          <GithubIcon className="h-8 w-8"/>
        </a>
      </header>

      {showModal && <ReportIdModal onSubmit={handleReportIdSubmit} isLoading={isLoading} error={error} />}

      {reportId && !showModal && (
        <main>
          <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
            <BossSelector
              bosses={bosses}
              selectedBoss={selectedBoss}
              onSelect={setSelectedBoss}
              isLoading={isLoading}
            />
          </div>

          {selectedBoss ? (
            <>
              <div className="mb-6">
                <TabSelector activeTab={activeTab} onTabChange={setActiveTab} tabs={availableTabs} />
              </div>
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 min-h-[500px]">
                {activeTab === 'skillHit' && <SkillHitAnalysis reportId={reportId} boss={selectedBoss} />}
                {activeTab === 'kalecgos' && <KalecgosAnalysis reportId={reportId} boss={selectedBoss} />}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-400">
              {isLoading ? <Spinner /> : <p>此报告未找到任何首领。</p>}
            </div>
          )}
        </main>
      )}
       {!reportId && !showModal && isLoading && <div className="flex justify-center items-center h-64"><Spinner/></div>}
    </div>
  );
}