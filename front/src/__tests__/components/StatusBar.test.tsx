import { render, screen, fireEvent } from '@testing-library/react';
import StatusBar from '../../components/StatusBar';
import { createMockStats } from '../testUtils';
import type { ReportStats } from '../../types/cucumber';

describe('StatusBar', () => {
  const stats: ReportStats = createMockStats();

  it('renders with app name and test count', () => {
    render(<StatusBar stats={stats} showConsole={false} onToggleConsole={jest.fn()} />);
    
    expect(screen.getByText('Cucumber Reporter')).toBeInTheDocument();
    expect(screen.getByText(`Tests: ${stats.totalScenarios}`)).toBeInTheDocument();
  });

  it('renders UTF-8 indicator', () => {
    render(<StatusBar stats={stats} showConsole={false} onToggleConsole={jest.fn()} />);
    
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
  });

  it('renders terminal toggle button', () => {
    render(<StatusBar stats={stats} showConsole={false} onToggleConsole={jest.fn()} />);
    
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });

  it('calls onToggleConsole with true when console is hidden', () => {
    const onToggleConsole = jest.fn();
    render(<StatusBar stats={stats} showConsole={false} onToggleConsole={onToggleConsole} />);
    
    fireEvent.click(screen.getByText('Terminal'));
    expect(onToggleConsole).toHaveBeenCalledWith(true);
  });

  it('calls onToggleConsole with false when console is visible', () => {
    const onToggleConsole = jest.fn();
    render(<StatusBar stats={stats} showConsole={true} onToggleConsole={onToggleConsole} />);
    
    fireEvent.click(screen.getByText('Terminal'));
    expect(onToggleConsole).toHaveBeenCalledWith(false);
  });

  it('renders with zero test count', () => {
    const emptyStats = createMockStats({ totalScenarios: 0 });
    render(<StatusBar stats={emptyStats} showConsole={false} onToggleConsole={jest.fn()} />);
    
    expect(screen.getByText('Tests: 0')).toBeInTheDocument();
  });
});
