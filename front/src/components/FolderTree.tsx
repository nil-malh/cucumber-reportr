// Folder tree component for organizing features

import React from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react';
import StatusIcon from './StatusIcon';
import { filterScenarios, getScenarioStatus } from '../utils/cucumberUtils';
import type { 
  FolderStructure, 
  CucumberFeature, 
  CucumberScenario, 
  FilterStatus 
} from '../types/cucumber';

interface FolderTreeProps {
  folderStructure: FolderStructure;
  expandedFolders: Set<string>;
  expandedFeatures: Set<string>;
  expandedScenarios: Set<string>;
  activeTabId: string | null;
  searchTerm: string;
  filterStatus: FilterStatus;
  onToggleFolder: (folderPath: string) => void;
  onToggleFeature: (featureId: string) => void;
  onToggleScenario: (scenarioId: string) => void;
  onTabOpen: (item: CucumberFeature | CucumberScenario | any) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folderStructure,
  expandedFolders,
  expandedFeatures,
  expandedScenarios,
  activeTabId,
  searchTerm,
  filterStatus,
  onToggleFolder,
  onToggleFeature,
  onToggleScenario,
  onTabOpen
}) => {
  const renderFolderTree = (structure: FolderStructure): React.ReactElement[] => {
    const items: React.ReactElement[] = [];
    
    // Render main folders
    Object.entries(structure).forEach(([folderName, folderData]) => {
      const folderPath = folderName; // No nested paths, just main folder names
      const isExpanded = expandedFolders.has(folderPath);
      
      // Check if this folder contains matching features
      const hasMatchingFeatures = folderData.features?.some((feature: CucumberFeature) => {
        const scenarios = filterScenarios(feature, searchTerm, filterStatus);
        return scenarios.length > 0 || (searchTerm === '' && filterStatus === 'all');
      });
      
      if (!hasMatchingFeatures && (searchTerm || filterStatus !== 'all')) {
        return; // Skip this folder if no matches
      }
      
      items.push(
        <div key={folderPath}>
          <div
            className="flex items-center px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer"
            onClick={() => onToggleFolder(folderPath)}
          >
            <div className="mr-1">
              {isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
              }
            </div>
            {isExpanded ? 
              <FolderOpen className="w-4 h-4 mr-1 text-[#dcb67a]" /> : 
              <Folder className="w-4 h-4 mr-1 text-[#dcb67a]" />
            }
            <span className="text-xs font-semibold">{folderName}</span>
          </div>
          
          {isExpanded && (
            <div className="ml-4">
              {folderData.features?.filter((feature: CucumberFeature) => {
                const scenarios = filterScenarios(feature, searchTerm, filterStatus);
                return scenarios.length > 0 || (searchTerm === '' && filterStatus === 'all');
              }).map((feature: CucumberFeature) => {
                const scenarios = filterScenarios(feature, searchTerm, filterStatus);
                const isFeatureExpanded = expandedFeatures.has(feature.id);
                
                return (
                  <div key={feature.id}>
                    <div
                      className={`flex items-center px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer ${
                        activeTabId === `feature-${feature.id}` ? 'bg-[#094771]' : ''
                      }`}
                      onClick={() => onTabOpen({...feature, type: 'feature'})}
                      title={feature.uri}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFeature(feature.id);
                        }}
                        className="mr-1 p-1 hover:bg-[#3e3e42] rounded"
                      >
                        {isFeatureExpanded ? 
                          <ChevronDown className="w-3 h-3" /> : 
                          <ChevronRight className="w-3 h-3" />
                        }
                      </div>
                      <FileText className="w-4 h-4 mr-1 text-[#519aba]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">{(feature as any).fileName || feature.name}</div>
                        {(feature as any).fullPath && (
                          <div className="text-xs text-[#858585] truncate">
                            {(feature as any).fullPath}
                          </div>
                        )}
                      </div>
                    </div>

                    {isFeatureExpanded && scenarios.map((scenario: CucumberScenario) => {
                      const status = getScenarioStatus(scenario);
                      const isScenarioExpanded = expandedScenarios.has(scenario.id);

                      return (
                        <div key={scenario.id}>
                          <div
                            className={`flex items-center px-6 py-1 hover:bg-[#2a2d2e] cursor-pointer ${
                              activeTabId === `scenario-${scenario.id}` ? 'bg-[#094771]' : ''
                            }`}
                            onClick={() => onTabOpen({...scenario, type: 'scenario'})}
                          >
                            <div
                              className="mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleScenario(scenario.id);
                              }}
                            >
                              {isScenarioExpanded ?
                                <ChevronDown className="w-3 h-3" /> :
                                <ChevronRight className="w-3 h-3" />
                              }
                            </div>
                            <StatusIcon status={status} size="sm" />
                            <span className="text-xs ml-1">{scenario.name}</span>
                          </div>

                          {isScenarioExpanded && (
                            <div className="ml-10">
                              {scenario.steps?.map((step, stepIdx) => (
                                <div
                                  key={stepIdx}
                                  className="flex items-center px-2 py-0.5 hover:bg-[#2a2d2e] cursor-pointer"
                                  onClick={() => onTabOpen(step)}
                                >
                                  <StatusIcon status={step?.result?.status || 'undefined'} size="sm" />
                                  <span className="text-xs ml-1 text-[#969696]">
                                    {step.keyword}{step.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });

    return items;
  };

  return (
    <div>
      {Object.keys(folderStructure).length > 0 ? (
        <div>
          {renderFolderTree(folderStructure)}
        </div>
      ) : (
        <div className="p-4 text-center text-[#858585] text-xs">
          No test data loaded
        </div>
      )}
    </div>
  );
};

export default FolderTree;
