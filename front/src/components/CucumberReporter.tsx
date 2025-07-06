// Refactored Cucumber Reporter main component
import React, { useEffect } from 'react';

// Components
import TitleBar from './TitleBar';
import SidebarHeader from './SidebarHeader';
import FolderTree from './FolderTree';
import StatsBar from './StatsBar';
import TabbedMainContent from './TabbedMainContent';
import ConsoleArea from './ConsoleArea';
import StatusBar from './StatusBar';

// Hooks
import { 
  useCucumberData, 
  useExpandableItems, 
  useFilters, 
  useConsole 
} from '../hooks/useCucumberReporter';
import { useTabs } from '../hooks/useTabs';

const CucumberReporter: React.FC = () => {
  // Custom hooks for state management
  const { reportData, folderStructure, stats } = useCucumberData();
  const {
    expandedFeatures,
    expandedScenarios,
    expandedFolders,
    toggleFeature,
    toggleScenario,
    toggleFolder,
    resetExpanded,
    autoExpandMainFolders
  } = useExpandableItems();
  const { searchTerm, setSearchTerm, filterStatus, setFilterStatus } = useFilters();
  const { showConsole, setShowConsole } = useConsole();
  const { tabs, activeTabId, openTab, closeTab, closeAllTabs, setActiveTabId, openAnalyticsTab } = useTabs();

  // Auto-expand main folders when folder structure changes
  useEffect(() => {
    if (Object.keys(folderStructure).length > 0) {
      autoExpandMainFolders(folderStructure);
    }
  }, [folderStructure, autoExpandMainFolders]);

  // Reset view when new data is loaded
  useEffect(() => {
    resetExpanded();
    closeAllTabs();
  }, [reportData, resetExpanded, closeAllTabs]); // Added missing dependencies

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] font-mono text-sm">
      {/* Title Bar */}
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          {/* Sidebar Header */}
          <SidebarHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onOpenAnalytics={openAnalyticsTab}
          />

          {/* Test Tree */}
          <div className="flex-1 overflow-y-auto">
            {reportData && reportData.length > 0 && Object.keys(folderStructure).length > 0 ? (
              <FolderTree
                folderStructure={folderStructure}
                expandedFolders={expandedFolders}
                expandedFeatures={expandedFeatures}
                expandedScenarios={expandedScenarios}
                activeTabId={activeTabId}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onToggleFolder={toggleFolder}
                onToggleFeature={toggleFeature}
                onToggleScenario={toggleScenario}
                onTabOpen={openTab}
              />
            ) : (
              <div className="p-4 text-center text-[#858585] text-xs">
                No test data loaded
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <StatsBar stats={stats} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabbed Editor Area */}
          <TabbedMainContent
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={setActiveTabId}
            onTabClose={closeTab}
            reportData={reportData}
          />

          {/* Console/Terminal Area */}
          <ConsoleArea
            showConsole={showConsole}
            onToggleConsole={setShowConsole}
            stats={stats}
            reportData={reportData}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        stats={stats}
        showConsole={showConsole}
        onToggleConsole={setShowConsole}
      />
    </div>
  );
};

export default CucumberReporter;
