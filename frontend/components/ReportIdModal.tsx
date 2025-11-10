import React, { useState } from 'react';
import { Spinner } from './Spinner';

interface ReportIdModalProps {
  onSubmit: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const ReportIdModal: React.FC<ReportIdModalProps> = ({ onSubmit, isLoading, error }) => {
  const [reportId, setReportId] = useState('GY4zAW739HNCjtrk'); // Default example

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reportId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100 max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">输入 WCL 报告ID</h2>
        <p className="text-gray-400 mb-6">
          请输入报告ID以开始分析。例如: <code className="bg-gray-700 text-yellow-400 px-1 rounded">GY4zAW739HNCjtrk</code>
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
        <div className="mt-6 pt-6 border-t border-gray-700">
          <img 
            src="https://storage.googleapis.com/prompt-gallery/prod/images/2ea2436f-e14b-4b2a-89a3-5c3a3754e427/0.webp" 
            alt="在URL中查找WCL报告ID的示例" 
            className="rounded-lg border border-gray-600 shadow-lg w-full" 
          />
        </div>
      </div>
    </div>
  );
};