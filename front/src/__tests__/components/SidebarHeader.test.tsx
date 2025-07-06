import { render, screen, fireEvent } from '@testing-library/react';
import SidebarHeader from '../../components/SidebarHeader';
import type { FilterStatus } from '../../types/cucumber';

describe('SidebarHeader', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockOnOpenAnalytics = jest.fn();

  const defaultProps = {
    searchTerm: '',
    onSearchChange: mockOnSearchChange,
    filterStatus: 'all' as FilterStatus,
    onFilterChange: mockOnFilterChange,
    onOpenAnalytics: mockOnOpenAnalytics,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    expect(screen.getByText('Test Explorer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search tests...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Tests')).toBeInTheDocument();
  });

  it('displays the search input with correct value', () => {
    render(<SidebarHeader {...defaultProps} searchTerm="test search" />);
    
    const searchInput = screen.getByPlaceholderText('Search tests...') as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
  });

  it('calls onSearchChange when search input changes', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search tests...');
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
  });

  it('displays the correct filter status', () => {
    render(<SidebarHeader {...defaultProps} filterStatus="passed" />);
    
    expect(screen.getByDisplayValue('Passed')).toBeInTheDocument();
  });

  it('calls onFilterChange when filter selection changes', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const filterSelect = screen.getByDisplayValue('All Tests');
    fireEvent.change(filterSelect, { target: { value: 'failed' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith('failed');
  });

  it('shows all filter options', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    expect(screen.getByText('All Tests')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
  });

  it('calls onOpenAnalytics when analytics button is clicked', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const analyticsButton = screen.getByTitle('Open Global Analytics');
    fireEvent.click(analyticsButton);
    
    expect(mockOnOpenAnalytics).toHaveBeenCalledTimes(1);
  });

  it('renders all icons', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    // Check for SVG elements (icons)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(4); // Play, Search, Filter, BarChart3
  });

  it('has correct CSS classes applied', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const testExplorer = screen.getByText('Test Explorer');
    expect(testExplorer).toHaveClass('text-xs', 'font-semibold', 'uppercase');
    
    const searchInput = screen.getByPlaceholderText('Search tests...');
    expect(searchInput).toHaveClass('w-full', 'bg-[#3c3c3c]');
  });

  it('handles different filter statuses correctly', () => {
    const filterStatuses: FilterStatus[] = ['all', 'passed', 'failed', 'skipped'];
    
    filterStatuses.forEach(status => {
      const { rerender } = render(<SidebarHeader {...defaultProps} filterStatus={status} />);
      
      const expectedText = {
        'all': 'All Tests',
        'passed': 'Passed',
        'failed': 'Failed',
        'skipped': 'Skipped'
      }[status];
      
      expect(screen.getByDisplayValue(expectedText)).toBeInTheDocument();
      
      rerender(<div />); // Clean up
    });
  });

  it('handles multiple search changes', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search tests...');
    
    fireEvent.change(searchInput, { target: { value: 'first' } });
    fireEvent.change(searchInput, { target: { value: 'second' } });
    fireEvent.change(searchInput, { target: { value: 'third' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledTimes(3);
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(1, 'first');
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(2, 'second');
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(3, 'third');
  });

  it('handles multiple filter changes', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const filterSelect = screen.getByDisplayValue('All Tests');
    
    fireEvent.change(filterSelect, { target: { value: 'passed' } });
    fireEvent.change(filterSelect, { target: { value: 'failed' } });
    fireEvent.change(filterSelect, { target: { value: 'all' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'passed');
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'failed');
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'all');
  });

  it('handles empty search term', () => {
    render(<SidebarHeader {...defaultProps} searchTerm="" />);
    
    const searchInput = screen.getByPlaceholderText('Search tests...') as HTMLInputElement;
    expect(searchInput.value).toBe('');
  });

  it('handles focus and blur events on search input', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search tests...');
    
    // Just test that the events can be fired without errors
    expect(() => {
      fireEvent.focus(searchInput);
      fireEvent.blur(searchInput);
    }).not.toThrow();
  });

  it('handles focus and blur events on filter select', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const filterSelect = screen.getByDisplayValue('All Tests');
    
    // Just test that the events can be fired without errors
    expect(() => {
      fireEvent.focus(filterSelect);
      fireEvent.blur(filterSelect);
    }).not.toThrow();
  });

  it('analytics button has correct hover styles', () => {
    render(<SidebarHeader {...defaultProps} />);
    
    const analyticsButton = screen.getByTitle('Open Global Analytics');
    expect(analyticsButton).toHaveClass('hover:bg-[#4e4e4e]', 'transition-colors');
  });
});
