// Console/Terminal area component

import React from 'react';
import { Terminal } from 'lucide-react';
import type { ReportStats, CucumberReport } from '../types/cucumber';

interface ConsoleAreaProps {
  showConsole: boolean;
  onToggleConsole: (show: boolean) => void;
  stats: ReportStats;
  reportData: CucumberReport;
}

const ConsoleArea: React.FC<ConsoleAreaProps> = ({ 
  showConsole, 
  onToggleConsole, 
  stats
}) => {
  if (!showConsole) return null;

  return (
    <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42]">
      <div className="bg-[#252526] px-3 py-1 flex items-center justify-between border-b border-[#3e3e42]">
        <div className="flex items-center space-x-3">
          <Terminal className="w-3 h-3" />
          <span className="text-xs">Output</span>
        </div>
        <button
          onClick={() => onToggleConsole(false)}
          className="text-[#858585] hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="p-3 font-mono text-xs overflow-y-auto h-36">
        <div className="text-[#4ec9b0]">Cucumber Test Results Loaded</div>
        <div className="text-[#858585]">Total Features: {stats.totalFeatures}</div>
        <div className="text-[#858585]">Total Scenarios: {stats.totalScenarios}</div>
        <div className="text-green-500">✓ Passed: {stats.passedScenarios}</div>
        <div className="text-red-500">✗ Failed: {stats.failedScenarios}</div>
        <div className="text-gray-500">⊗ Skipped: {stats.skippedScenarios}</div>
        <div className="text-[#858585] mt-2">
          Pass Rate: {stats.passRate.toFixed(1)}%
        </div>
        <div className="text-[#858585]">
          Total Duration: {(stats.totalDuration / 1000000000).toFixed(2)}s
        </div>
      </div>
    </div>
  );
};

export default ConsoleArea;
