import { render, screen, fireEvent } from '@testing-library/react';
import TabBar from '../../components/TabBar';
import { mockFeature, mockScenario } from '../testUtils';
import type { TabData } from '../../types/cucumber';

describe('TabBar', () => {
  const mockOnTabClick = jest.fn();
  const mockOnTabClose = jest.fn();

  beforeEach(() => {
    mockOnTabClick.mockClear();
    mockOnTabClose.mockClear();
  });

  it('renders nothing when no tabs provided', () => {
    const { container } = render(
      <TabBar 
        tabs={[]} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders tabs with correct titles', () => {
    const tabs: TabData[] = [
      {
        id: 'tab1',
        title: 'Feature 1',
        type: 'feature',
        data: mockFeature()
      },
      {
        id: 'tab2',
        title: 'Scenario 1',
        type: 'scenario',
        data: mockScenario()
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId="tab1" 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    const tabs: TabData[] = [
      {
        id: 'active-tab',
        title: 'Active Tab',
        type: 'feature',
        data: mockFeature()
      },
      {
        id: 'inactive-tab',
        title: 'Inactive Tab',
        type: 'feature',
        data: mockFeature()
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId="active-tab" 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    const activeTab = screen.getByText('Active Tab').closest('div');
    const inactiveTab = screen.getByText('Inactive Tab').closest('div');

    expect(activeTab).toHaveClass('bg-[#1e1e1e]', 'text-[#cccccc]');
    expect(inactiveTab).toHaveClass('bg-[#2d2d30]', 'text-[#969696]');
  });

  it('calls onTabClick when tab is clicked', () => {
    const tabs: TabData[] = [
      {
        id: 'clickable-tab',
        title: 'Clickable Tab',
        type: 'feature',
        data: mockFeature()
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    fireEvent.click(screen.getByText('Clickable Tab'));
    expect(mockOnTabClick).toHaveBeenCalledWith('clickable-tab');
  });

  it('calls onTabClose when close button is clicked', () => {
    const tabs: TabData[] = [
      {
        id: 'closable-tab',
        title: 'Closable Tab',
        type: 'feature',
        data: mockFeature()
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId="closable-tab" 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    // Find the close button (X icon)
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnTabClose).toHaveBeenCalledWith('closable-tab');
    expect(mockOnTabClick).not.toHaveBeenCalled(); // Should not trigger tab click
  });

  it('renders analytics tab icon correctly', () => {
    const tabs: TabData[] = [
      {
        id: 'analytics-tab',
        title: 'Analytics',
        type: 'analytics',
        data: null
      }
    ];

    const { container } = render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    // Check for BarChart3 icon by its color class instead
    expect(container.querySelector('.text-\\[\\#4ec9b0\\]')).toBeInTheDocument();
  });

  it('renders feature tab icon correctly', () => {
    const tabs: TabData[] = [
      {
        id: 'feature-tab',
        title: 'Feature',
        type: 'feature',
        data: mockFeature()
      }
    ];

    const { container } = render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    expect(container.querySelector('.lucide-file-text')).toBeInTheDocument();
  });

  it('renders scenario tab with status icon', () => {
    const tabs: TabData[] = [
      {
        id: 'scenario-tab',
        title: 'Scenario',
        type: 'scenario',
        data: mockScenario()
      }
    ];

    const { container } = render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    // Should render StatusIcon component (green check for passed scenario)
    expect(container.querySelector('.text-green-500')).toBeInTheDocument();
  });

  it('renders default icon for unknown tab type', () => {
    const tabs: TabData[] = [
      {
        id: 'unknown-tab',
        title: 'Unknown',
        type: 'unknown' as any,
        data: null
      }
    ];

    const { container } = render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    expect(container.querySelector('.lucide-file-text')).toBeInTheDocument();
  });

  it('handles scenario tab without data', () => {
    const tabs: TabData[] = [
      {
        id: 'scenario-no-data',
        title: 'Scenario No Data',
        type: 'scenario',
        data: null
      }
    ];

    const { container } = render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    // Should default to 'passed' status and render green icon
    expect(container.querySelector('.text-green-500')).toBeInTheDocument();
  });

  it('renders tab title in title attribute for truncation', () => {
    const tabs: TabData[] = [
      {
        id: 'long-title-tab',
        title: 'This is a very long tab title that might get truncated',
        type: 'feature',
        data: mockFeature()
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId={null} 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    const titleElement = screen.getByTitle('This is a very long tab title that might get truncated');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders multiple tabs correctly', () => {
    const tabs: TabData[] = [
      {
        id: 'tab1',
        title: 'Tab 1',
        type: 'feature',
        data: mockFeature()
      },
      {
        id: 'tab2',
        title: 'Tab 2',
        type: 'scenario',
        data: mockScenario()
      },
      {
        id: 'tab3',
        title: 'Tab 3',
        type: 'analytics',
        data: null
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId="tab2" 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();

    // Check that tab2 is active
    const activeTab = screen.getByText('Tab 2').closest('div');
    expect(activeTab).toHaveClass('bg-[#1e1e1e]');
  });

  it('close button is visible on active tab and hidden on inactive tabs', () => {
    const tabs: TabData[] = [
      {
        id: 'active-tab',
        title: 'Active',
        type: 'feature',
        data: mockFeature()
      },
      {
        id: 'inactive-tab',
        title: 'Inactive',
        type: 'feature',
        data: mockFeature()
      }
    ];

    render(
      <TabBar 
        tabs={tabs} 
        activeTabId="active-tab" 
        onTabClick={mockOnTabClick} 
        onTabClose={mockOnTabClose} 
      />
    );

    const activeTabButton = screen.getByText('Active').closest('div')?.querySelector('button');
    const inactiveTabButton = screen.getByText('Inactive').closest('div')?.querySelector('button');

    expect(activeTabButton).toHaveClass('opacity-100');
    expect(inactiveTabButton).toHaveClass('opacity-0');
  });
});
