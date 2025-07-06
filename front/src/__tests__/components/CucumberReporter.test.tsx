import { render, screen } from '@testing-library/react';
import CucumberReporter from '../../components/CucumberReporter';

// Mock all the hooks
jest.mock('../../hooks/useCucumberReporter', () => ({
  useCucumberData: () => ({
    reportData: [],
    folderStructure: {},
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
      passRate: 0,
    }
  }),
  useExpandableItems: () => ({
    expandedFeatures: new Set(),
    expandedScenarios: new Set(),
    expandedFolders: new Set(),
    toggleFeature: jest.fn(),
    toggleScenario: jest.fn(),
    toggleFolder: jest.fn(),
    resetExpanded: jest.fn(),
    autoExpandMainFolders: jest.fn(),
  }),
  useFilters: () => ({
    searchTerm: '',
    setSearchTerm: jest.fn(),
    filterStatus: 'all',
    setFilterStatus: jest.fn(),
  }),
  useConsole: () => ({
    showConsole: false,
    setShowConsole: jest.fn(),
  }),
}));

jest.mock('../../hooks/useTabs', () => ({
  useTabs: () => ({
    tabs: [],
    activeTabId: null,
    openTab: jest.fn(),
    closeTab: jest.fn(),
    closeAllTabs: jest.fn(),
    setActiveTabId: jest.fn(),
    openAnalyticsTab: jest.fn(),
  }),
}));

describe('CucumberReporter', () => {
  it('renders main layout structure', () => {
    render(<CucumberReporter />);
    
    // Check that the main component renders without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('renders title bar', () => {
    render(<CucumberReporter />);
    
    // Should render the title (note: it's "Tests" not "Test")
    expect(screen.getByText('Cucumber Tests Results')).toBeInTheDocument();
  });

  it('renders sidebar with filters', () => {
    render(<CucumberReporter />);
    
    // Should render search input
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders stats bar', () => {
    render(<CucumberReporter />);
    
    // Should render some stats (all zeros in mock)
    expect(screen.getAllByText('0')).toHaveLength(4); // passed, failed, pending, skipped
  });
});
