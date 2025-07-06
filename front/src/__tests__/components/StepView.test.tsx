import { render, screen } from '@testing-library/react';
import StepView from '../../components/StepView';
import { mockStep } from '../testUtils';
import type { CucumberStep } from '../../types/cucumber';

describe('StepView', () => {
  it('renders step with basic details', () => {
    const step = mockStep();
    render(<StepView step={step} />);
    
    expect(screen.getByText('Step Details')).toBeInTheDocument();
    expect(screen.getByText('Given')).toBeInTheDocument();
    expect(screen.getByText('I have a test step')).toBeInTheDocument();
  });

  it('renders step with line number and duration', () => {
    const step: CucumberStep = {
      ...mockStep(),
      line: 15,
      result: {
        status: 'passed',
        duration: 1500000 // 2ms (rounded)
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText(/Line 15/)).toBeInTheDocument();
    expect(screen.getByText(/Duration: 2ms/)).toBeInTheDocument();
  });

  it('renders step with only line number (no duration)', () => {
    const step: CucumberStep = {
      ...mockStep(),
      line: 20,
      result: {
        status: 'passed'
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText(/Line 20/)).toBeInTheDocument();
    expect(screen.queryByText(/Duration:/)).not.toBeInTheDocument();
  });

  it('renders step with only duration (no line)', () => {
    const step: CucumberStep = {
      keyword: 'Given ',
      name: 'I have a test step',
      line: 0, // No line number
      result: {
        status: 'passed',
        duration: 2500000 // 3ms (rounded)
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText(/Duration: 3ms/)).toBeInTheDocument();
    expect(screen.queryByText(/Line 0/)).not.toBeInTheDocument();
  });

  it('renders step with data table', () => {
    const step: CucumberStep = {
      ...mockStep(),
      rows: [
        { cells: ['Name', 'Age', 'City'] },
        { cells: ['John', '25', 'New York'] },
        { cells: ['Jane', '30', 'Boston'] }
      ]
    };
    
    render(<StepView step={step} />);
    
    // Check header row
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    
    // Check data rows
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Boston')).toBeInTheDocument();
  });

  it('renders step with error message', () => {
    const step: CucumberStep = {
      ...mockStep(),
      result: {
        status: 'failed',
        error_message: 'AssertionError: Expected true but was false'
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText('AssertionError: Expected true but was false')).toBeInTheDocument();
  });

  it('renders step with undefined status when no result', () => {
    const step: CucumberStep = {
      keyword: 'When',
      name: 'I perform an action',
      line: 0,
      result: {
        status: 'undefined'
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText('Step Details')).toBeInTheDocument();
    expect(screen.getByText('When')).toBeInTheDocument();
    expect(screen.getByText('I perform an action')).toBeInTheDocument();
  });

  it('renders step with all features combined', () => {
    const step: CucumberStep = {
      keyword: 'Then',
      name: 'the result should be correct',
      line: 25,
      result: {
        status: 'failed',
        duration: 3500000, // 4ms (rounded)
        error_message: 'Expected: 100\nActual: 99'
      },
      rows: [
        { cells: ['Expected', 'Actual'] },
        { cells: ['100', '99'] }
      ]
    };
    
    render(<StepView step={step} />);
    
    // Check basic step info
    expect(screen.getByText('Step Details')).toBeInTheDocument();
    expect(screen.getByText('Then')).toBeInTheDocument();
    expect(screen.getByText('the result should be correct')).toBeInTheDocument();
    
    // Check line and duration
    expect(screen.getByText(/Line 25/)).toBeInTheDocument();
    expect(screen.getByText(/Duration: 4ms/)).toBeInTheDocument();
    
    // Check data table
    expect(screen.getByText('Expected')).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    
    // Check error message
    expect(screen.getByText(/Expected: 100/)).toBeInTheDocument();
    expect(screen.getByText(/Actual: 99/)).toBeInTheDocument();
  });

  it('does not render data table when step has no rows', () => {
    const step = mockStep();
    render(<StepView step={step} />);
    
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('does not render data table when step has empty rows', () => {
    const step: CucumberStep = {
      ...mockStep(),
      rows: []
    };
    
    render(<StepView step={step} />);
    
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('does not render error section when no error message', () => {
    const step: CucumberStep = {
      ...mockStep(),
      result: {
        status: 'passed',
        duration: 1000000
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.queryByText(/AssertionError/)).not.toBeInTheDocument();
  });
});
