// Title bar component for the Cucumber Reporter

import React from 'react';
import { Bug, Clock } from 'lucide-react';

// Extend window interface for the title bar content
declare global {
  interface Window {
    TITLEBAR_CONTENT?: string;
    REPORT_GENERATED_AT?: string;
  }
}

const TITLEBAR_CONTENT = window.TITLEBAR_CONTENT || 'Cucumber Tests Results';

/**
 * Format the report generation timestamp for display.
 * Returns null when no timestamp is available.
 */
const formatTimestamp = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TitleBar: React.FC = () => {
  const formattedTimestamp = formatTimestamp(window.REPORT_GENERATED_AT);

  return (
    <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Bug className="w-4 h-4 text-[#16825d]" />
        <span className="text-xs">{TITLEBAR_CONTENT}</span>
      </div>
      {formattedTimestamp && (
        <div className="flex items-center space-x-1 text-xs text-[#858585]">
          <Clock className="w-3 h-3" />
          <span>{formattedTimestamp}</span>
        </div>
      )}
    </div>
  );
};

export default TitleBar;
