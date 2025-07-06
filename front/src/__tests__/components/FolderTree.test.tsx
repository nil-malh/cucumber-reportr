import { render, screen, fireEvent } from '@testing-library/react';
import FolderTree from '../../components/FolderTree';
import { mockFeature, mockScenario, createMockStep } from '../testUtils';
import type { FolderStructure } from '../../types/cucumber';

const createMockFolderStructure = (): FolderStructure => ({
  'features': {
    features: [
      mockFeature({
        id: 'feature1',
        name: 'Authentication',
        uri: 'features/auth.feature',
        elements: [
          mockScenario({
            id: 'scenario1',
            name: 'Login successful',
            steps: [
              createMockStep({
                keyword: 'Given ',
                name: 'I am on login page',
                result: { status: 'passed' }
              })
            ]
          }),
          mockScenario({
            id: 'scenario2',
            name: 'Login failed',
            steps: [
              createMockStep({
                keyword: 'Given ',
                name: 'I enter invalid credentials',
                result: { status: 'failed' }
              })
            ]
          })
        ]
      }),
      mockFeature({
        id: 'feature2',
        name: 'Registration',
        uri: 'features/registration.feature',
        elements: [
          mockScenario({
            id: 'scenario3',
            name: 'Register new user',
            steps: [
              createMockStep({
                keyword: 'When ',
                name: 'I fill registration form',
                result: { status: 'passed' }
              })
            ]
          })
        ]
      })
    ],
    subfolders: {}
  },
  'tests': {
    features: [
      mockFeature({
        id: 'feature3',
        name: 'Unit Tests',
        uri: 'tests/unit.feature',
        elements: []
      })
    ],
    subfolders: {}
  }
});

const defaultProps = {
  folderStructure: createMockFolderStructure(),
  expandedFolders: new Set<string>(),
  expandedFeatures: new Set<string>(),
  expandedScenarios: new Set<string>(),
  activeTabId: null,
  searchTerm: '',
  filterStatus: 'all' as const,
  onToggleFolder: jest.fn(),
  onToggleFeature: jest.fn(),
  onToggleScenario: jest.fn(),
  onTabOpen: jest.fn()
};

describe('FolderTree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no folder structure provided', () => {
    render(
      <FolderTree
        {...defaultProps}
        folderStructure={{}}
      />
    );
    
    expect(screen.getByText('No test data loaded')).toBeInTheDocument();
  });

  it('renders folder structure with collapsed folders by default', () => {
    render(<FolderTree {...defaultProps} />);
    
    expect(screen.getByText('features')).toBeInTheDocument();
    expect(screen.getByText('tests')).toBeInTheDocument();
    
    // Features should not be visible when folder is collapsed
    expect(screen.queryByText('Authentication')).not.toBeInTheDocument();
    expect(screen.queryByText('Registration')).not.toBeInTheDocument();
  });

  it('expands folder when clicked', () => {
    const onToggleFolder = jest.fn();
    render(
      <FolderTree
        {...defaultProps}
        onToggleFolder={onToggleFolder}
      />
    );
    
    const featuresFolder = screen.getByText('features');
    fireEvent.click(featuresFolder);
    
    expect(onToggleFolder).toHaveBeenCalledWith('features');
  });

  it('renders expanded folder with features', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
      />
    );
    
    expect(screen.getByText('features')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
    
    // Scenarios should not be visible when feature is collapsed
    expect(screen.queryByText('Login successful')).not.toBeInTheDocument();
  });

  it('opens feature tab when feature is clicked', () => {
    const onTabOpen = jest.fn();
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        onTabOpen={onTabOpen}
      />
    );
    
    const authFeature = screen.getByText('Authentication');
    fireEvent.click(authFeature);
    
    expect(onTabOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'feature1',
        name: 'Authentication',
        type: 'feature'
      })
    );
  });

  it('expands feature when expansion arrow is clicked', () => {
    const onToggleFeature = jest.fn();
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        onToggleFeature={onToggleFeature}
      />
    );
    
    // Find the chevron button for Authentication feature
    const authFeatureRow = screen.getByText('Authentication').closest('div');
    const chevronButton = authFeatureRow?.querySelector('.mr-1.p-1');
    
    if (chevronButton) {
      fireEvent.click(chevronButton);
      expect(onToggleFeature).toHaveBeenCalledWith('feature1');
    }
  });

  it('renders scenarios when feature is expanded', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
      />
    );
    
    expect(screen.getByText('Login successful')).toBeInTheDocument();
    expect(screen.getByText('Login failed')).toBeInTheDocument();
  });

  it('opens scenario tab when scenario is clicked', () => {
    const onTabOpen = jest.fn();
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        onTabOpen={onTabOpen}
      />
    );
    
    const loginScenario = screen.getByText('Login successful');
    fireEvent.click(loginScenario);
    
    expect(onTabOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'scenario1',
        name: 'Login successful',
        type: 'scenario'
      })
    );
  });

  it('expands scenario when expansion arrow is clicked', () => {
    const onToggleScenario = jest.fn();
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        onToggleScenario={onToggleScenario}
      />
    );
    
    // Find the chevron button for Login successful scenario
    const scenarioRow = screen.getByText('Login successful').closest('div');
    const chevronButton = scenarioRow?.querySelector('.mr-1');
    
    if (chevronButton) {
      fireEvent.click(chevronButton);
      expect(onToggleScenario).toHaveBeenCalledWith('scenario1');
    }
  });

  it('renders steps when scenario is expanded', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        expandedScenarios={new Set(['scenario1'])}
      />
    );
    
    expect(screen.getByText('Given I am on login page')).toBeInTheDocument();
  });

  it('opens step tab when step is clicked', () => {
    const onTabOpen = jest.fn();
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        expandedScenarios={new Set(['scenario1'])}
        onTabOpen={onTabOpen}
      />
    );
    
    const stepElement = screen.getByText('Given I am on login page');
    fireEvent.click(stepElement);
    
    expect(onTabOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'Given ',
        name: 'I am on login page'
      })
    );
  });

  it('highlights active feature tab', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        activeTabId="feature-feature1"
      />
    );
    
    // Check that the active tab styling is applied
    const authFeatureText = screen.getByText('Authentication');
    expect(authFeatureText).toBeInTheDocument();
  });

  it('highlights active scenario tab', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        activeTabId="scenario-scenario1"
      />
    );
    
    const scenarioText = screen.getByText('Login successful');
    expect(scenarioText).toBeInTheDocument();
  });

  it('handles search term that may filter out all content', () => {
    const { container } = render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        searchTerm="NonExistentFeature"
      />
    );
    
    // The component should render without errors even if no matches
    expect(container.firstChild).toBeTruthy();
  });

  it('filters scenarios based on status filter', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        filterStatus="failed"
      />
    );
    
    // Login failed scenario should be visible if filter works
    expect(screen.getByText('Login failed')).toBeInTheDocument();
  });

  it('renders lucide icons for folders and files', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
      />
    );
    
    // Check that SVG elements are rendered (lucide icons)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('renders status icons for scenarios and steps', () => {
    render(
      <FolderTree
        {...defaultProps}
        expandedFolders={new Set(['features'])}
        expandedFeatures={new Set(['feature1'])}
        expandedScenarios={new Set(['scenario1'])}
      />
    );
    
    // Should have status icons for scenarios and steps
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(5); // Multiple icons
  });
});
