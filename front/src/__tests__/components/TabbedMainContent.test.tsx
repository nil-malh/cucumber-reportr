import { render, screen, fireEvent } from '@testing-library/react';
import TabbedMainContent from '../../components/TabbedMainContent';
import { mockFeature, mockScenario, createMockReportData } from '../testUtils';
import type { TabData, CucumberReport } from '../../types/cucumber';

// Mock child components
jest.mock('../../components/GlobalAnalytics', () => {
  return function MockGlobalAnalytics({ reportData }: any) {
    return <div data-testid="global-analytics">Analytics: {reportData.length} features</div>;
  };
});

jest.mock('../../components/MainContent', () => {
  return function MockMainContent({ activeTab }: any) {
    return <div data-testid="main-content">Tab: {activeTab.title}</div>;
  };
});

jest.mock('../../components/TabBar', () => {
  return function MockTabBar({ tabs, onTabClick, onTabClose }: any) {
    return (
      <div data-testid="tab-bar">
        {tabs.map((tab: TabData) => (
          <div key={tab.id} data-testid={`tab-${tab.id}`}>
            <button onClick={() => onTabClick(tab.id)}>{tab.title}</button>
            <button onClick={() => onTabClose(tab.id)} data-testid={`close-${tab.id}`}>x</button>
          </div>
        ))}
      </div>
    );
  };
});

describe('TabbedMainContent', () => {
  const reportData: CucumberReport = createMockReportData();

  it('renders empty state when no active tab', () => {
    render(
      <TabbedMainContent
        tabs={[]}
        activeTabId={null}
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        reportData={reportData}
      />
    );
    
    expect(screen.getByText('Click on a test to open it in a new tab')).toBeInTheDocument();
    expect(screen.getByText('Multiple tabs can be open simultaneously')).toBeInTheDocument();
  });

  it('renders GlobalAnalytics when active tab is analytics', () => {
    const tabs: TabData[] = [
      { id: 'analytics', title: 'Global Analytics', type: 'analytics', data: null }
    ];
    
    render(
      <TabbedMainContent
        tabs={tabs}
        activeTabId="analytics"
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        reportData={reportData}
      />
    );
    
    expect(screen.getByTestId('global-analytics')).toBeInTheDocument();
  });

  it('renders MainContent when active tab is a feature', () => {
    const feature = mockFeature();
    const tabs: TabData[] = [
      { id: 'feature-1', title: 'Feature Tab', type: 'feature', data: feature }
    ];
    
    render(
      <TabbedMainContent
        tabs={tabs}
        activeTabId="feature-1"
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        reportData={reportData}
      />
    );
    
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByText('Tab: Feature Tab')).toBeInTheDocument();
  });

  it('renders MainContent when active tab is a scenario', () => {
    const scenario = mockScenario();
    const tabs: TabData[] = [
      { id: 'scenario-1', title: 'Scenario Tab', type: 'scenario', data: scenario }
    ];
    
    render(
      <TabbedMainContent
        tabs={tabs}
        activeTabId="scenario-1"
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        reportData={reportData}
      />
    );
    
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('renders MainContent when active tab is a step', () => {
    const tabs: TabData[] = [
      { id: 'step-1', title: 'Step Tab', type: 'step', data: null as any }
    ];
    
    render(
      <TabbedMainContent
        tabs={tabs}
        activeTabId="step-1"
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        reportData={reportData}
      />
    );
    
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('passes onTabClick and onTabClose to TabBar', () => {
    const onTabClick = jest.fn();
    const onTabClose = jest.fn();
    const tabs: TabData[] = [
      { id: 'feature-1', title: 'Feature Tab', type: 'feature', data: mockFeature() }
    ];
    
    render(
      <TabbedMainContent
        tabs={tabs}
        activeTabId="feature-1"
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        reportData={reportData}
      />
    );
    
    // Click on a tab
    fireEvent.click(screen.getByText('Feature Tab'));
    expect(onTabClick).toHaveBeenCalledWith('feature-1');
    
    // Close a tab
    fireEvent.click(screen.getByTestId('close-feature-1'));
    expect(onTabClose).toHaveBeenCalledWith('feature-1');
  });
});
