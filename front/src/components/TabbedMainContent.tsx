// Tabbed main content area with VS Code-style tabs

import React from 'react';
import { FileText } from 'lucide-react';
import TabBar from './TabBar';
import MainContent from './MainContent';
import GlobalAnalytics from './GlobalAnalytics';
import type { TabData, CucumberReport } from '../types/cucumber';

interface TabbedMainContentProps {
  tabs: TabData[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  reportData: CucumberReport;
}

const TabbedMainContent: React.FC<TabbedMainContentProps> = ({ 
  tabs, 
  activeTabId, 
  onTabClick, 
  onTabClose, 
  reportData 
}) => {
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
      />

      {/* Content Area */}
      <div className="flex-1 bg-[#1e1e1e] overflow-y-auto min-h-0 p-4">
        {activeTab ? (
          activeTab.type === 'analytics' ? (
            <GlobalAnalytics reportData={reportData} />
          ) : (
            <MainContent activeTab={activeTab} reportData={reportData} />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-[#858585]">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Click on a test to open it in a new tab</p>
              <p className="text-xs mt-1 opacity-70">Multiple tabs can be open simultaneously</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedMainContent;
