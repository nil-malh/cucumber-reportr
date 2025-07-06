// VS Code-style tab bar component

import React from 'react';
import { X, FileText, BarChart3 } from 'lucide-react';
import StatusIcon from './StatusIcon';
import { getScenarioStatus } from '../utils/cucumberUtils';
import type { TabData } from '../types/cucumber';

interface TabBarProps {
  tabs: TabData[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabClick, onTabClose }) => {
  const getTabIcon = (tab: TabData): React.ReactElement => {
    switch (tab.type) {
      case 'analytics':
        return <BarChart3 className="w-3 h-3 text-[#4ec9b0]" />;
      case 'feature':
        return <FileText className="w-3 h-3 text-[#519aba]" />;
      case 'scenario': {
        const status = tab.data && 'steps' in tab.data ? getScenarioStatus(tab.data) : 'passed';
        return <StatusIcon status={status} size="sm" />;
      }
      default:
        return <FileText className="w-3 h-3 text-[#519aba]" />;
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#2d2d30] border-b border-[#3e3e42] flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center px-3 py-2 min-w-0 max-w-48 border-r border-[#3e3e42] cursor-pointer group
            ${activeTabId === tab.id 
              ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#007acc]' 
              : 'bg-[#2d2d30] text-[#969696] hover:bg-[#2a2d2e]'
            }
          `}
          onClick={() => onTabClick(tab.id)}
        >
          {/* Tab Icon */}
          <div className="mr-2 flex-shrink-0">
            {getTabIcon(tab)}
          </div>
          
          {/* Tab Title */}
          <span className="text-xs truncate flex-1" title={tab.title}>
            {tab.title}
          </span>
          
          {/* Close button */}
          <button
            className={`
              ml-1 p-0.5 rounded flex-shrink-0 
              ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              hover:bg-[#3e3e42]
            `}
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
