// Utility functions for Cucumber data processing and formatting

import type { 
  CucumberScenario, 
  CucumberFeature, 
  CucumberReport, 
  FolderStructure, 
  ReportStats,
  FilterStatus 
} from '../types/cucumber';

export const getScenarioStatus = (scenario: CucumberScenario): 'passed' | 'failed' | 'skipped' | 'pending' => {
  const steps = scenario?.steps || [];
  if (steps.length === 0) return 'passed'; // Empty scenario defaults to passed
  if (steps.some(step => step?.result?.status === 'failed')) return 'failed';
  if (steps.some(step => step?.result?.status === 'pending')) return 'pending';
  if (steps.some(step => step?.result?.status === 'skipped')) return 'skipped';
  return 'passed';
};

export const formatDuration = (duration?: number): string => {
  if (!duration || duration === 0) return '0ms';
  const ms = duration / 1000000;
  return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
};

interface FeatureWithPath extends CucumberFeature {
  fileName: string;
  fullPath: string;
  displayPath: string;
}

interface FolderData {
  folders: Record<string, FolderData>;
  files: FeatureWithPath[];
}

export const buildFolderStructure = (features: CucumberReport): FolderStructure => {
  const structure: Record<string, FolderData> = {};

  features.forEach(feature => {
    const uri = feature.uri;

    // Handle missing or empty URI
    if (!uri) {
      // Use a default structure for features without URI
      const mainFolder = 'Unknown';
      const fileName = feature.name || 'Unnamed Feature';

      if (!structure[mainFolder]) {
        structure[mainFolder] = { folders: {}, files: [] };
      }

      structure[mainFolder].files.push({
        ...feature,
        fileName,
        fullPath: '',
        displayPath: fileName
      });
      return;
    }

    // Extract path from URI - remove "file:///" prefix and get the path part
    let path = uri.replace(/^file:\/\/\//, '');

    // Remove "features/" prefix if it exists and normalize path
    path = path.replace(/^features\/\.?\//, '');

    // Split path into segments
    const segments = path.split('/');
    const fileName = segments.pop() || 'unknown.feature'; // Remove and get the filename

    // Get only the main folder (first segment) for grouping
    const mainFolder = segments.length > 0 ? segments[0] : 'Root';

    // Create or get the main folder structure
    if (!structure[mainFolder]) {
      structure[mainFolder] = { folders: {}, files: [] };
    }

    // Add the full path as a property for display purposes
    const fullPath = segments.length > 1 ? segments.slice(1).join('/') : '';

    // Add file to the main folder with full path info
    structure[mainFolder].files.push({
      ...feature,
      fileName,
      fullPath,
      displayPath: fullPath ? `${fullPath}/${fileName}` : fileName
    });
  });

  // Convert to FolderStructure format
  const folderStructure: FolderStructure = {};
  Object.entries(structure).forEach(([key, value]) => {
    folderStructure[key] = {
      features: value.files,
      subfolders: {}
    };
  });

  return folderStructure;
};

export const filterScenarios = (
  feature: CucumberFeature, 
  searchTerm: string, 
  filterStatus: FilterStatus
): CucumberScenario[] => {
  return feature.elements?.filter(scenario => {
    // Skip background elements
    if (scenario.type === 'background') return false;
    
    const matchesSearch = searchTerm === '' || 
      scenario.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.steps?.some(step => step.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || getScenarioStatus(scenario) === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) || [];
};

export const calculateStats = (reportData: CucumberReport): ReportStats => {
  if (!reportData || reportData.length === 0) {
    return {
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
    };
  }
  
  let totalScenarios = 0;
  let passedScenarios = 0;
  let failedScenarios = 0;
  let skippedScenarios = 0;
  let totalSteps = 0;
  let passedSteps = 0;
  let failedSteps = 0;
  let skippedSteps = 0;
  let totalDuration = 0;
  
  const featureStatuses = reportData.map(feature => {
    if (!feature.elements) return 'passed';
    
    let featureHasFailed = false;
    let featureHasSkipped = false;
    
    feature.elements.forEach(scenario => {
      // Skip background elements
      if (scenario.type === 'background') return;
      
      totalScenarios++;
      const scenarioStatus = getScenarioStatus(scenario);
      
      switch (scenarioStatus) {
        case 'passed':
          passedScenarios++;
          break;
        case 'failed':
          failedScenarios++;
          featureHasFailed = true;
          break;
        case 'skipped':
          skippedScenarios++;
          featureHasSkipped = true;
          break;
      }
      
      // Count steps
      scenario.steps?.forEach(step => {
        totalSteps++;
        totalDuration += step.result?.duration || 0;
        
        switch (step.result?.status) {
          case 'passed':
            passedSteps++;
            break;
          case 'failed':
            failedSteps++;
            break;
          case 'skipped':
            skippedSteps++;
            break;
        }
      });
    });
    
    if (featureHasFailed) return 'failed';
    if (featureHasSkipped) return 'skipped';
    return 'passed';
  });
  
  const passedFeatures = featureStatuses.filter(status => status === 'passed').length;
  const failedFeatures = featureStatuses.filter(status => status === 'failed').length;
  const skippedFeatures = featureStatuses.filter(status => status === 'skipped').length;
  
  const passRate = totalScenarios > 0 ? (passedScenarios / totalScenarios) * 100 : 0;
  
  return {
    totalFeatures: reportData.length,
    totalScenarios,
    totalSteps,
    passedFeatures,
    failedFeatures,
    skippedFeatures,
    passedScenarios,
    failedScenarios,
    skippedScenarios,
    passedSteps,
    failedSteps,
    skippedSteps,
    totalDuration,
    passRate
  };
};

export const checkFolderHasMatches = (
  folderData: { features: CucumberFeature[]; subfolders: Record<string, any> }, 
  searchTerm: string, 
  filterStatus: FilterStatus
): boolean => {
  // Check files in this folder
  const hasMatchingFiles = folderData.features?.some(feature => {
    const scenarios = filterScenarios(feature, searchTerm, filterStatus);
    return scenarios.length > 0;
  });
  
  if (hasMatchingFiles) return true;
  
  // Check subfolders recursively
  return Object.values(folderData.subfolders || {}).some(subfolder => 
    checkFolderHasMatches(subfolder, searchTerm, filterStatus)
  );
};
