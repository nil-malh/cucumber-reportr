import { render, screen } from '@testing-library/react';
import StatsBar from '../../components/StatsBar';
import type { ReportStats } from '../../types/cucumber';

describe('StatsBar', () => {
  const mockStats: ReportStats = {
    totalFeatures: 5,
    totalScenarios: 10,
    totalSteps: 20,
    passedFeatures: 4,
    failedFeatures: 1,
    skippedFeatures: 0,
    passedScenarios: 7,
    failedScenarios: 3,
    skippedScenarios: 0,
    passedSteps: 15,
    failedSteps: 5,
    skippedSteps: 0,
    totalDuration: 5000000000, // 5 seconds in nanoseconds
    passRate: 70,
  };

  it('renders scenario stats correctly', () => {
    render(<StatsBar stats={mockStats} />);
    
    // Check for passed scenarios (green check icon + count)
    expect(screen.getByText('7')).toBeInTheDocument();
    
    // Check for failed scenarios (red x icon + count)  
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check for pending (hardcoded as 0)
    expect(screen.getAllByText('0')).toHaveLength(2); // pending and skipped scenarios
  });

  it('shows pass percentage correctly', () => {
    render(<StatsBar stats={mockStats} />);

    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows duration in formatted seconds', () => {
    render(<StatsBar stats={mockStats} />);

    // Should show formatted duration (5 seconds = 5.00s)
    expect(screen.getByText('5.00s')).toBeInTheDocument();
  });

  it('handles zero scenarios correctly', () => {
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
      totalDuration: 0,
      passRate: 0,
    };

    render(<StatsBar stats={zeroStats} />);

    // Should show 0% pass rate
    expect(screen.getByText('0%')).toBeInTheDocument();
    // Should show 0ms duration (formatDuration returns "0ms" for zero)
    expect(screen.getByText('0ms')).toBeInTheDocument();
  });

  it('calculates percentage correctly for 100% pass rate', () => {
    const perfectStats: ReportStats = {
      totalFeatures: 1,
      totalScenarios: 3,
      totalSteps: 6,
      passedFeatures: 1,
      failedFeatures: 0,
      skippedFeatures: 0,
      passedScenarios: 3,
      failedScenarios: 0,
      skippedScenarios: 0,
      passedSteps: 6,
      failedSteps: 0,
      skippedSteps: 0,
      totalDuration: 1500000000, // 1.5 seconds
      passRate: 100,
    };

    render(<StatsBar stats={perfectStats} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('1.50s')).toBeInTheDocument();
  });

  it('renders status icons with correct styling', () => {
    const { container } = render(<StatsBar stats={mockStats} />);

    // Check for SVG icons with correct classes
    const passedIcon = container.querySelector('.text-green-500');
    const failedIcon = container.querySelector('.text-red-500');
    const pendingIcon = container.querySelector('.text-yellow-500');
    const skippedIcon = container.querySelector('.text-gray-500');

    expect(passedIcon).toBeInTheDocument();
    expect(failedIcon).toBeInTheDocument();
    expect(pendingIcon).toBeInTheDocument();
    expect(skippedIcon).toBeInTheDocument();
  });
});
