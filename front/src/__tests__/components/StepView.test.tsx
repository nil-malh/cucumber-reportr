import { render, screen, fireEvent } from '@testing-library/react';
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
    // No stack trace toggle for single-line errors
    expect(screen.queryByText(/Show stack trace/)).not.toBeInTheDocument();
  });

  it('collapses multi-line stack trace by default and expands on click', () => {
    const multiLineError = [
      'io.michelin.choreography.nrtengine.exceptions.ConsumerException: Error while waiting for record to appear in topic',
      '    at io.michelin.choreography.nrtengine.steps.services.ConsumerValidationService.executeConsumer(ConsumerValidationService.java:299)',
      '    at io.michelin.choreography.nrtengine.steps.services.ConsumerValidationService.validateSingleRecord(ConsumerValidationService.java:470)',
    ].join('\n');
    
    const step: CucumberStep = {
      ...mockStep(),
      result: {
        status: 'failed',
        error_message: multiLineError
      }
    };
    
    render(<StepView step={step} />);
    
    // First line is shown by default
    expect(screen.getByText(/Error while waiting for record/)).toBeInTheDocument();
    // Stack trace toggle is visible
    expect(screen.getByText(/Show stack trace \(2 lines\)/)).toBeInTheDocument();
    // Stack trace lines are NOT rendered until expanded
    expect(screen.queryByText(/executeConsumer/)).not.toBeInTheDocument();
    
    // Expand stack trace
    fireEvent.click(screen.getByText(/Show stack trace/));
    
    // Stack trace lines are now rendered
    expect(screen.getByText(/Hide stack trace/)).toBeInTheDocument();
    expect(screen.getByText(/executeConsumer/)).toBeInTheDocument();
    
    // Collapse again
    fireEvent.click(screen.getByText(/Hide stack trace/));
    expect(screen.queryByText(/executeConsumer/)).not.toBeInTheDocument();
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
    
    // Check error message (first line shown by default)
    expect(screen.getByText(/Expected: 100/)).toBeInTheDocument();
    // Second line is in the collapsible stack trace (not rendered until expanded)
    expect(screen.getByText(/Show stack trace/)).toBeInTheDocument();
    expect(screen.queryByText(/Actual: 99/)).not.toBeInTheDocument();
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

  it('renders doc_string content', () => {
    const step: CucumberStep = {
      ...mockStep(),
      doc_string: {
        value: 'Some multi-line\ntext content',
        line: 10,
        content_type: 'text/plain'
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText('text/plain')).toBeInTheDocument();
    expect(screen.getByText(/Some multi-line/)).toBeInTheDocument();
    expect(screen.getByText(/text content/)).toBeInTheDocument();
  });

  it('renders doc_string without content_type', () => {
    const step: CucumberStep = {
      ...mockStep(),
      doc_string: {
        value: 'Plain doc string content',
        line: 10
      }
    };
    
    render(<StepView step={step} />);
    
    expect(screen.getByText('Plain doc string content')).toBeInTheDocument();
    expect(screen.queryByText('text/plain')).not.toBeInTheDocument();
  });

  it('renders embeddings in step', () => {
    const step: CucumberStep = {
      ...mockStep(),
      embeddings: [
        { mime_type: 'image/png', data: 'iVBORw0KGgo=', name: 'screenshot.png' }
      ]
    };
    
    render(<StepView step={step} />);
    
    const img = screen.getByAltText('screenshot.png');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });
});
