import { render, screen, fireEvent } from '@testing-library/react';
import ConsoleArea from '../../components/ConsoleArea';
import { createMockReportData, createMockFeature } from '../testUtils';
import type { ReportStats } from '../../types/cucumber';

describe('ConsoleArea', () => {
  const mockStats: ReportStats = {
    totalFeatures: 3,
    totalScenarios: 15,
    totalSteps: 45,
    passedFeatures: 2,
    failedFeatures: 1,
    skippedFeatures: 0,
    passedScenarios: 12,
    failedScenarios: 2,
    skippedScenarios: 1,
    passedSteps: 40,
    failedSteps: 4,
    skippedSteps: 1,
    passRate: 80.0,
    totalDuration: 5000000000, // 5 seconds in nanoseconds
  };

  const mockReportData = createMockReportData([createMockFeature()]);
  const mockOnToggleConsole = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when showConsole is false', () => {
    const { container } = render(
      <ConsoleArea 
        showConsole={false}
        onToggleConsole={mockOnToggleConsole}
        stats={mockStats}
        reportData={mockReportData}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders console area when showConsole is true', () => {
    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={mockStats}
        reportData={mockReportData}
      />
    );
    
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('Cucumber Test Results Loaded')).toBeInTheDocument();
  });

  it('displays all statistics correctly', () => {
    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={mockStats}
        reportData={mockReportData}
      />
    );
    
    expect(screen.getByText('Total Features: 3')).toBeInTheDocument();
    expect(screen.getByText('Total Scenarios: 15')).toBeInTheDocument();
    expect(screen.getByText('✓ Passed: 12')).toBeInTheDocument();
    expect(screen.getByText('✗ Failed: 2')).toBeInTheDocument();
    expect(screen.getByText('⊗ Skipped: 1')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate: 80.0%')).toBeInTheDocument();
    expect(screen.getByText('Total Duration: 5.00s')).toBeInTheDocument();
  });

  it('calls onToggleConsole when close button is clicked', () => {
    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={mockStats}
        reportData={mockReportData}
      />
    );
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnToggleConsole).toHaveBeenCalledTimes(1);
    expect(mockOnToggleConsole).toHaveBeenCalledWith(false);
  });

  it('displays Terminal icon', () => {
    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={mockStats}
        reportData={mockReportData}
      />
    );
    
    // Check for the SVG element (Terminal icon)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('handles zero values in stats', () => {
    const zeroStats: ReportStats = {
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
      passRate: 0,
      totalDuration: 0,
    };

    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={zeroStats}
        reportData={[]}
      />
    );
    
    expect(screen.getByText('Total Features: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Scenarios: 0')).toBeInTheDocument();
    expect(screen.getByText('✓ Passed: 0')).toBeInTheDocument();
    expect(screen.getByText('✗ Failed: 0')).toBeInTheDocument();
    expect(screen.getByText('⊗ Skipped: 0')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate: 0.0%')).toBeInTheDocument();
    expect(screen.getByText('Total Duration: 0.00s')).toBeInTheDocument();
  });

  it('handles large duration values correctly', () => {
    const largeStats: ReportStats = {
      ...mockStats,
      totalDuration: 123456789000000000, // Very large duration
    };

    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={largeStats}
        reportData={mockReportData}
      />
    );
    
    expect(screen.getByText('Total Duration: 123456789.00s')).toBeInTheDocument();
  });

  it('handles decimal pass rates correctly', () => {
    const decimalStats: ReportStats = {
      ...mockStats,
      passRate: 66.666666,
    };

    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={decimalStats}
        reportData={mockReportData}
      />
    );
    
    expect(screen.getByText('Pass Rate: 66.7%')).toBeInTheDocument();
  });

  it('has correct CSS classes applied', () => {
    render(
      <ConsoleArea 
        showConsole={true}
        onToggleConsole={mockOnToggleConsole}
        stats={mockStats}
        reportData={mockReportData}
      />
    );
    
    const outputContent = screen.getByText('Cucumber Test Results Loaded');
    expect(outputContent).toHaveClass('text-[#4ec9b0]');
  });
});
