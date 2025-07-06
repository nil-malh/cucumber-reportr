// Stats bar component showing test result counts

import React from 'react';
import StatusIcon from './StatusIcon';
import { formatDuration } from '../utils/cucumberUtils';
import type { StatsBarProps } from '../types/cucumber';

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const passPercentage = stats.totalScenarios > 0 
    ? Math.round((stats.passedScenarios / stats.totalScenarios) * 100)
    : 0;

  return (
    <div className="p-2 border-t border-[#3e3e42] flex items-center justify-around text-xs">
      <div className="flex items-center">
        <StatusIcon status="passed" size="sm" />
        <span className="ml-1">{stats.passedScenarios}</span>
      </div>
      <div className="flex items-center">
        <StatusIcon status="failed" size="sm" />
        <span className="ml-1">{stats.failedScenarios}</span>
      </div>
      <div className="flex items-center">
        <StatusIcon status="pending" size="sm" />
        <span className="ml-1">0</span>
      </div>
      <div className="flex items-center">
        <StatusIcon status="skipped" size="sm" />
        <span className="ml-1">{stats.skippedScenarios}</span>
      </div>
      <div className="flex items-center">
        <span className="text-green-500">{passPercentage}%</span>
      </div>
      <div className="flex items-center">
        <span className="text-gray-400">{formatDuration(stats.totalDuration)}</span>
      </div>
    </div>
  );
};

export default StatsBar;
