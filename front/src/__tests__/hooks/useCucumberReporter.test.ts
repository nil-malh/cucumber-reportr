import { renderHook, act } from '@testing-library/react';
import {
  useCucumberData,
  useExpandableItems,
  useSelection,
  useFilters,
  useConsole,
} from '../../hooks/useCucumberReporter';
import { createMockFeature, createComplexFeature } from '../testUtils';
import * as reportData from '../../data/reportData';
import * as cucumberUtils from '../../utils/cucumberUtils';

// Mock external dependencies
jest.mock('../../data/reportData');
jest.mock('../../utils/cucumberUtils');

const mockGetCucumberReportData = reportData.getCucumberReportData as jest.MockedFunction<typeof reportData.getCucumberReportData>;
const mockBuildFolderStructure = cucumberUtils.buildFolderStructure as jest.MockedFunction<typeof cucumberUtils.buildFolderStructure>;
const mockCalculateStats = cucumberUtils.calculateStats as jest.MockedFunction<typeof cucumberUtils.calculateStats>;

describe('useCucumberReporter hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log and console.error to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useCucumberData', () => {
    const mockFeature = createMockFeature();
    const mockData = [mockFeature];
    const mockFolderStructure = { 'test-features': { features: mockData, subfolders: {} } };
    const mockStats = {
      totalFeatures: 1,
      totalScenarios: 2,
      totalSteps: 6,
      passedFeatures: 1,
      failedFeatures: 0,
      skippedFeatures: 0,
      passedScenarios: 1,
      failedScenarios: 1,
      skippedScenarios: 0,
      passedSteps: 5,
      failedSteps: 1,
      skippedSteps: 0,
      totalDuration: 6000000,
      passRate: 50,
    };

    beforeEach(() => {
      mockGetCucumberReportData.mockReturnValue(mockData);
      mockBuildFolderStructure.mockReturnValue(mockFolderStructure);
      mockCalculateStats.mockReturnValue(mockStats);
    });

    it('should initialize with processed data from getCucumberReportData', () => {
      const { result } = renderHook(() => useCucumberData());

      expect(result.current.reportData).toEqual(mockData);
      expect(result.current.folderStructure).toEqual(mockFolderStructure);
      expect(result.current.stats).toEqual(mockStats);
    });

    it('should handle null data', () => {
      mockGetCucumberReportData.mockReturnValue(null);
      
      const { result } = renderHook(() => useCucumberData());

      expect(result.current.reportData).toEqual([]);
      expect(result.current.folderStructure).toEqual({});
      expect(result.current.stats.totalFeatures).toBe(0);
    });

    it('should handle empty array data', () => {
      mockGetCucumberReportData.mockReturnValue([]);
      
      const { result } = renderHook(() => useCucumberData());

      expect(result.current.reportData).toEqual([]);
      expect(result.current.folderStructure).toEqual({});
      expect(result.current.stats.totalFeatures).toBe(0);
    });

    it('should handle nested array data (unwrap single nested array)', () => {
      const nestedData = [mockData] as any;
      mockGetCucumberReportData.mockReturnValue(nestedData);
      
      renderHook(() => useCucumberData());

      expect(mockBuildFolderStructure).toHaveBeenCalledWith(mockData);
      expect(mockCalculateStats).toHaveBeenCalledWith(mockData);
    });

    it('should listen for cucumberDataUpdated events', () => {
      const { result } = renderHook(() => useCucumberData());
      const newData = [createComplexFeature()];
      const newFolderStructure = { 'new-features': { features: newData, subfolders: {} } };
      const newStats = { ...mockStats, totalFeatures: 2 };

      // Set up mocks for the event handler
      mockBuildFolderStructure.mockReturnValue(newFolderStructure);
      mockCalculateStats.mockReturnValue(newStats);

      // Dispatch the event
      act(() => {
        const event = new CustomEvent('cucumberDataUpdated', { detail: newData });
        window.dispatchEvent(event);
      });

      expect(result.current.reportData).toEqual(newData);
      expect(result.current.folderStructure).toEqual(newFolderStructure);
      expect(result.current.stats).toEqual(newStats);
    });

    it('should clean up event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useCucumberData());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('cucumberDataUpdated', expect.any(Function));
    });
  });

  describe('useExpandableItems', () => {
    it('should initialize with empty sets', () => {
      const { result } = renderHook(() => useExpandableItems());

      expect(result.current.expandedFeatures.size).toBe(0);
      expect(result.current.expandedScenarios.size).toBe(0);
      expect(result.current.expandedFolders.size).toBe(0);
    });

    it('should toggle feature expansion', () => {
      const { result } = renderHook(() => useExpandableItems());

      act(() => {
        result.current.toggleFeature('feature-1');
      });

      expect(result.current.expandedFeatures.has('feature-1')).toBe(true);

      act(() => {
        result.current.toggleFeature('feature-1');
      });

      expect(result.current.expandedFeatures.has('feature-1')).toBe(false);
    });

    it('should toggle scenario expansion', () => {
      const { result } = renderHook(() => useExpandableItems());

      act(() => {
        result.current.toggleScenario('scenario-1');
      });

      expect(result.current.expandedScenarios.has('scenario-1')).toBe(true);

      act(() => {
        result.current.toggleScenario('scenario-1');
      });

      expect(result.current.expandedScenarios.has('scenario-1')).toBe(false);
    });

    it('should toggle folder expansion', () => {
      const { result } = renderHook(() => useExpandableItems());

      act(() => {
        result.current.toggleFolder('folder/path');
      });

      expect(result.current.expandedFolders.has('folder/path')).toBe(true);

      act(() => {
        result.current.toggleFolder('folder/path');
      });

      expect(result.current.expandedFolders.has('folder/path')).toBe(false);
    });

    it('should reset all expanded items', () => {
      const { result } = renderHook(() => useExpandableItems());

      act(() => {
        result.current.toggleFeature('feature-1');
        result.current.toggleScenario('scenario-1');
        result.current.toggleFolder('folder/path');
      });

      expect(result.current.expandedFeatures.size).toBe(1);
      expect(result.current.expandedScenarios.size).toBe(1);
      expect(result.current.expandedFolders.size).toBe(1);

      act(() => {
        result.current.resetExpanded();
      });

      expect(result.current.expandedFeatures.size).toBe(0);
      expect(result.current.expandedScenarios.size).toBe(0);
      expect(result.current.expandedFolders.size).toBe(0);
    });

    it('should auto-expand single main folder when no folders are expanded', () => {
      const { result } = renderHook(() => useExpandableItems());
      const folderStructure = { 'main-folder': { features: [], subfolders: {} } };

      act(() => {
        result.current.autoExpandMainFolders(folderStructure);
      });

      expect(result.current.expandedFolders.has('main-folder')).toBe(true);
    });

    it('should not auto-expand when multiple main folders exist', () => {
      const { result } = renderHook(() => useExpandableItems());
      const folderStructure = {
        'folder-1': { features: [], subfolders: {} },
        'folder-2': { features: [], subfolders: {} }
      };

      act(() => {
        result.current.autoExpandMainFolders(folderStructure);
      });

      expect(result.current.expandedFolders.size).toBe(0);
    });

    it('should not auto-expand when folders are already expanded', () => {
      const { result } = renderHook(() => useExpandableItems());
      const folderStructure = { 'main-folder': { features: [], subfolders: {} } };

      // First expand a folder manually
      act(() => {
        result.current.toggleFolder('existing-folder');
      });

      act(() => {
        result.current.autoExpandMainFolders(folderStructure);
      });

      expect(result.current.expandedFolders.has('main-folder')).toBe(false);
      expect(result.current.expandedFolders.has('existing-folder')).toBe(true);
    });
  });

  describe('useSelection', () => {
    it('should initialize with null selectedItem', () => {
      const { result } = renderHook(() => useSelection());

      expect(result.current.selectedItem).toBeNull();
    });

    it('should set selectedItem directly', () => {
      const { result } = renderHook(() => useSelection());
      const mockFeature = { ...createMockFeature(), type: 'feature' };

      act(() => {
        result.current.setSelectedItem(mockFeature);
      });

      expect(result.current.selectedItem).toEqual(mockFeature);
    });

    it('should handle feature click with valid feature', () => {
      const { result } = renderHook(() => useSelection());
      const mockFeature = createMockFeature();

      act(() => {
        result.current.handleFeatureClick(mockFeature);
      });

      expect(result.current.selectedItem).toEqual({ ...mockFeature, type: 'feature' });
    });

    it('should handle invalid feature (no id)', () => {
      const { result } = renderHook(() => useSelection());
      const invalidFeature = { ...createMockFeature(), id: '' } as any;

      act(() => {
        result.current.handleFeatureClick(invalidFeature);
      });

      expect(result.current.selectedItem).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid feature object:', invalidFeature);
    });

    it('should handle null feature', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.handleFeatureClick(null as any);
      });

      expect(result.current.selectedItem).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid feature object:', null);
    });

    it('should handle undefined feature', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.handleFeatureClick(undefined as any);
      });

      expect(result.current.selectedItem).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid feature object:', undefined);
    });

    it('should log selection changes in useEffect', () => {
      const { result } = renderHook(() => useSelection());
      const mockFeature = { ...createMockFeature(), type: 'feature' };

      act(() => {
        result.current.setSelectedItem(mockFeature);
      });

      expect(console.log).toHaveBeenCalledWith('=== SELECTED ITEM CHANGED ===');
      expect(console.log).toHaveBeenCalledWith('New selectedItem:', mockFeature);
      expect(console.log).toHaveBeenCalledWith('selectedItem type:', 'feature');
    });
  });

  describe('useFilters', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useFilters());

      expect(result.current.searchTerm).toBe('');
      expect(result.current.filterStatus).toBe('all');
    });

    it('should update search term', () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.setSearchTerm('test search');
      });

      expect(result.current.searchTerm).toBe('test search');
    });

    it('should update filter status', () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.setFilterStatus('failed');
      });

      expect(result.current.filterStatus).toBe('failed');

      act(() => {
        result.current.setFilterStatus('passed');
      });

      expect(result.current.filterStatus).toBe('passed');

      act(() => {
        result.current.setFilterStatus('skipped');
      });

      expect(result.current.filterStatus).toBe('skipped');
    });
  });

  describe('useConsole', () => {
    it('should initialize with showConsole as true', () => {
      const { result } = renderHook(() => useConsole());

      expect(result.current.showConsole).toBe(true);
    });

    it('should toggle console visibility', () => {
      const { result } = renderHook(() => useConsole());

      act(() => {
        result.current.setShowConsole(false);
      });

      expect(result.current.showConsole).toBe(false);

      act(() => {
        result.current.setShowConsole(true);
      });

      expect(result.current.showConsole).toBe(true);
    });
  });
});
