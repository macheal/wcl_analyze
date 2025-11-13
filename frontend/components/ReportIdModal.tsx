/*
 * @Author: GUANGYU WANG xinyukc01@hotmail.com
 * @Date: 2025-11-10 06:17:34
 * @LastEditors: GUANGYU WANG xinyukc01@hotmail.com
 * @LastEditTime: 2025-11-10 15:55:59
 * @FilePath: /wcl_analyze/frontend/components/ReportIdModal.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react';
import { Spinner } from './Spinner';

interface ReportIdModalProps {
  onSubmit: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const ReportIdModal: React.FC<ReportIdModalProps> = ({ onSubmit, isLoading, error }) => {
  const [reportId, setReportId] = useState('tTAM3BKp9Yjd7RHr'); // Default example

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reportId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100 max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">输入 WCL 报告ID</h2>
        <p className="text-gray-400 mb-6">
          请输入报告ID以开始分析。例如: <code className="bg-gray-700 text-yellow-400 px-1 rounded">tTAM3BKp9Yjd7RHr</code>
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4 font-mono"
            placeholder="输入报告ID..."
            aria-label="Report ID Input"
            disabled={isLoading}
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : '分析报告'}
          </button>
        </form>
        <div>
          <p className="text-gray-400 text-sm mt-4">
            将WCL战斗日志上传到WCL后，拿到对应的报告ID，可以进行分析
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <img 
            src="/images/demo.png" 
            alt="在URL中查找WCL报告ID的示例" 
            className="rounded-lg border border-gray-600 shadow-lg w-full" 
          />
        </div>
      </div>
    </div>
  );
};