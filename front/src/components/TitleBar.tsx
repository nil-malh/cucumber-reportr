// Title bar component for the Cucumber Reporter

import React from 'react';
import { Bug } from 'lucide-react';

// Extend window interface for the title bar content
declare global {
  interface Window {
    TITLEBAR_CONTENT?: string;
  }
}

const TITLEBAR_CONTENT = window.TITLEBAR_CONTENT || 'Cucumber Tests Results';

const TitleBar: React.FC = () => {
  return (
    <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Bug className="w-4 h-4 text-[#16825d]" />
        <span className="text-xs">{TITLEBAR_CONTENT}</span>
      </div>
    </div>
  );
};

export default TitleBar;
