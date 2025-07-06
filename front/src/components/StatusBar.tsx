// Status bar component at the bottom of the application

import React from 'react';
import type { ReportStats } from '../types/cucumber';

interface StatusBarProps {
  stats: ReportStats;
  showConsole: boolean;
  onToggleConsole: (show: boolean) => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ stats, showConsole, onToggleConsole }) => {
  return (
    <div className="bg-[#007acc] px-3 py-1 flex items-center justify-between text-xs text-white">
      <div className="flex items-center space-x-4">
        <span>Cucumber Reporter</span>
        <span>Tests: {stats.totalScenarios}</span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggleConsole(!showConsole)}
          className="hover:bg-[#1177bb] px-2 py-0.5 rounded"
        >
          Terminal
        </button>
        <span>UTF-8</span>
      </div>
    </div>
  );
};

export default StatusBar;
