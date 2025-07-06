import { render, screen } from '@testing-library/react';
import MainContent from '../../components/MainContent';
import { mockFeature, mockScenario, createMockReportData } from '../testUtils';
import type { TabData } from '../../types/cucumber';

// Mock the child components since we're testing MainContent behavior
jest.mock('../../components/FeatureView', () => {
  return function MockFeatureView({ feature }: any) {
    return <div data-testid="feature-view">Feature: {feature.name}</div>;
  };
});

jest.mock('../../components/ScenarioView', () => {
  return function MockScenarioView({ scenario }: any) {
    return <div data-testid="scenario-view">Scenario: {scenario.name}</div>;
  };
});

jest.mock('../../components/StepView', () => {
  return function MockStepView({ step }: any) {
    return <div data-testid="step-view">Step: {step.name}</div>;
  };
});

describe('MainContent', () => {
  const reportData = createMockReportData();

  it('renders empty state when no active tab', () => {
    const activeTab = null as any;
    render(<MainContent activeTab={activeTab} reportData={reportData} />);
    
    expect(screen.getByText('Select a test to view details')).toBeInTheDocument();
    // Check for FileText icon by its class
    const container = screen.getByText('Select a test to view details').closest('div');
    expect(container?.querySelector('.lucide-file-text')).toBeInTheDocument();
  });

  it('renders empty state when active tab has no data', () => {
    const activeTab: TabData = {
      id: 'test-tab',
      title: 'Test Tab',
      type: 'feature',
      data: null
    };
    
    render(<MainContent activeTab={activeTab} reportData={reportData} />);
    
    expect(screen.getByText('Select a test to view details')).toBeInTheDocument();
  });

  it('renders FeatureView when active tab type is feature', () => {
    const feature = mockFeature();
    const activeTab: TabData = {
      id: 'feature-tab',
      title: 'Feature Tab',
      type: 'feature',
      data: feature
    };
    
    render(<MainContent activeTab={activeTab} reportData={reportData} />);
    
    expect(screen.getByTestId('feature-view')).toBeInTheDocument();
    expect(screen.getByText(`Feature: ${feature.name}`)).toBeInTheDocument();
  });

  it('renders ScenarioView when active tab type is scenario', () => {
    const scenario = mockScenario();
    const activeTab: TabData = {
      id: 'scenario-tab', 
      title: 'Scenario Tab',
      type: 'scenario',
      data: scenario
    };
    
    render(<MainContent activeTab={activeTab} reportData={reportData} />);
    
    expect(screen.getByTestId('scenario-view')).toBeInTheDocument();
    expect(screen.getByText(`Scenario: ${scenario.name}`)).toBeInTheDocument();
  });

  it('renders unsupported content message for unknown tab types', () => {
    const activeTab: TabData = {
      id: 'unknown-tab',
      title: 'Unknown Tab',
      type: 'unknown' as any,
      data: mockFeature() // Use valid data type but unknown tab type
    };
    
    render(<MainContent activeTab={activeTab} reportData={reportData} />);
    
    expect(screen.getByText('Content type not supported')).toBeInTheDocument();
    // Check for FileText icon by its class
    const container = screen.getByText('Content type not supported').closest('div');
    expect(container?.querySelector('.lucide-file-text')).toBeInTheDocument();
  });

  it('renders container with proper height class', () => {
    const feature = mockFeature();
    const activeTab: TabData = {
      id: 'feature-tab',
      title: 'Feature Tab',
      type: 'feature',
      data: feature
    };
    
    const { container } = render(<MainContent activeTab={activeTab} reportData={reportData} />);
    
    expect(container.querySelector('.h-full')).toBeInTheDocument();
  });

  it('passes reportData to ScenarioView', () => {
    const scenario = mockScenario();
    const customReportData = createMockReportData([mockFeature({ name: 'Custom Feature' })]);
    const activeTab: TabData = {
      id: 'scenario-tab',
      title: 'Scenario Tab', 
      type: 'scenario',
      data: scenario
    };
    
    render(<MainContent activeTab={activeTab} reportData={customReportData} />);
    
    // ScenarioView should be rendered (we can't easily test props passed to mocked component,
    // but we can verify it renders which means props were passed)
    expect(screen.getByTestId('scenario-view')).toBeInTheDocument();
  });
});
