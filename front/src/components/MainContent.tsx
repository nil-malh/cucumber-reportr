// Main content area component that displays selected item details

import React from 'react';
import { FileText } from 'lucide-react';
import FeatureView from './FeatureView';
import ScenarioView from './ScenarioView';
import type { TabData, CucumberReport } from '../types/cucumber';

interface MainContentProps {
  activeTab: TabData;
  reportData: CucumberReport;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, reportData }) => {
  if (!activeTab || !activeTab.data) {
    return (
      <div className="flex items-center justify-center h-full text-[#858585]">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Select a test to view details</p>
        </div>
      </div>
    );
  }

  // Wrap content in a container that ensures proper height constraints
  const renderContent = (): React.ReactElement => {
    if (activeTab.type === 'feature' && activeTab.data) {
      return <FeatureView feature={activeTab.data} />;
    }

    if (activeTab.type === 'scenario' && activeTab.data) {
      return <ScenarioView scenario={activeTab.data} reportData={reportData} />;
    }

    // For steps or other types
    return (
      <div className="flex items-center justify-center h-full text-[#858585]">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Content type not supported</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default MainContent;
