// Custom hooks for Cucumber Reporter state management

import { useState, useEffect, useCallback } from 'react';
import { getCucumberReportData } from '../data/reportData';
import { buildFolderStructure, calculateStats } from '../utils/cucumberUtils';
import type { 
  CucumberReport, 
  FolderStructure, 
  ReportStats,
  CucumberDataHook,
  ExpandableItemsHook,
  FiltersHook,
  ConsoleHook,
  CucumberFeature,
  FilterStatus
} from '../types/cucumber';

const processData = (data: CucumberReport | null) => {
  if (!data || data.length === 0) {
    return {
      features: [] as CucumberReport,
      folderStructure: {} as FolderStructure,
      stats: { 
        totalFeatures: 0, 
        totalScenarios: 0, 
        totalSteps: 0,
        passedFeatures: 0, 
        failedFeatures: 0, 
        skippedFeatures: 0,
        passedScenarios: 0, 
        failedScenarios: 0, 
        skippedScenarios: 0,
        passedSteps: 0, 
        failedSteps: 0, 
        skippedSteps: 0,
        totalDuration: 0,
        passRate: 0
      } as ReportStats
    };
  }
  
  const features = Array.isArray(data) && data.length === 1 && Array.isArray(data[0])
    ? data[0] as CucumberReport
    : data as CucumberReport;

  const folderStructure = buildFolderStructure(features);
  const stats = calculateStats(features);

  return { features, folderStructure, stats };
};

// Pre-process initial data to avoid flash of empty content
const {
  features: initialFeatures,
  folderStructure: initialFolderStructure,
  stats: initialStats
} = processData(getCucumberReportData());

export const useCucumberData = (): CucumberDataHook => {
  const [reportData, setReportData] = useState<CucumberReport>(initialFeatures);
  const [folderStructure, setFolderStructure] = useState<FolderStructure>(initialFolderStructure);
  const [stats, setStats] = useState<ReportStats>(initialStats);

  useEffect(() => {
    // Re-check data on mount in case it was loaded after initial module evaluation
    // but before this component mounted.
    const { features, folderStructure, stats } = processData(getCucumberReportData());
    setReportData(features);
    setFolderStructure(folderStructure);
    setStats(stats);

    // Listener for dynamic updates from external scripts
    const handleDataUpdate = (event: CustomEvent<CucumberReport>) => {
      const { features, folderStructure, stats } = processData(event.detail);
      setReportData(features);
      setFolderStructure(folderStructure);
      setStats(stats);
    };

    window.addEventListener('cucumberDataUpdated', handleDataUpdate as any);

    return () => {
      window.removeEventListener('cucumberDataUpdated', handleDataUpdate as any);
    };
  }, []); // Run only once on mount

  return {
    reportData,
    folderStructure,
    stats,
  };
};

export const useExpandableItems = (): ExpandableItemsHook => {
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFeature = useCallback((featureId: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  }, [expandedFeatures]);

  const toggleScenario = useCallback((scenarioId: string) => {
    const newExpanded = new Set(expandedScenarios);
    if (newExpanded.has(scenarioId)) {
      newExpanded.delete(scenarioId);
    } else {
      newExpanded.add(scenarioId);
    }
    setExpandedScenarios(newExpanded);
  }, [expandedScenarios]);

  const toggleFolder = useCallback((folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  }, [expandedFolders]);

  const resetExpanded = useCallback(() => {
    setExpandedFeatures(new Set());
    setExpandedScenarios(new Set());
    setExpandedFolders(new Set());
  }, []);

  const autoExpandMainFolders = useCallback((folderStructure: FolderStructure) => {
    // Only auto-expand if no folders are currently expanded
    if (expandedFolders.size === 0) {
      const autoExpandFolders = new Set<string>();
      // Only expand the first main folder for initial visibility
      const firstFolder = Object.keys(folderStructure)[0];
      if (firstFolder && Object.keys(folderStructure).length === 1) {
        autoExpandFolders.add(firstFolder);
      }
      setExpandedFolders(autoExpandFolders);
    }
  }, [expandedFolders.size]);

  return {
    expandedFeatures,
    expandedScenarios,
    expandedFolders,
    toggleFeature,
    toggleScenario,
    toggleFolder,
    resetExpanded,
    autoExpandMainFolders
  };
};

export const useSelection = () => {
  const [selectedItem, setSelectedItem] = useState<(CucumberFeature & { type: string }) | null>(null);

  // Monitor selectedItem changes
  useEffect(() => {
    console.log('=== SELECTED ITEM CHANGED ===');
    console.log('New selectedItem:', selectedItem);
    console.log('selectedItem type:', selectedItem?.type);
    console.log('=== END SELECTED ITEM CHANGE ===');
  }, [selectedItem]);

  const handleFeatureClick = useCallback((feature: CucumberFeature) => {
    console.log('=== FEATURE CLICKED ===');
    console.log('Feature object:', feature);
    console.log('Feature ID:', feature?.id);
    console.log('Feature name:', feature?.name);
    console.log('Feature URI:', feature?.uri);
    console.log('Feature elements:', feature?.elements?.length);
    
    // Validate feature has required properties
    if (!feature || !feature.id) {
      console.error('Invalid feature object:', feature);
      return;
    }
    
    console.log('Setting selectedItem with type feature');
    
    const newSelectedItem = { ...feature, type: 'feature' };
    console.log('New selectedItem:', newSelectedItem);
    setSelectedItem(newSelectedItem);
    console.log('selectedItem state should be updated');
    console.log('=== END FEATURE CLICK ===');
  }, []);

  return {
    selectedItem,
    setSelectedItem,
    handleFeatureClick
  };
};

export const useFilters = (): FiltersHook => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus
  };
};

export const useConsole = (): ConsoleHook => {
  const [showConsole, setShowConsole] = useState<boolean>(true);

  return {
    showConsole,
    setShowConsole
  };
};
