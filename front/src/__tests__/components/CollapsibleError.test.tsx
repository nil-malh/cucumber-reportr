import { render, screen, fireEvent } from '@testing-library/react';
import CollapsibleError from '../../components/CollapsibleError';

describe('CollapsibleError', () => {
  it('renders single-line error without stack trace toggle', () => {
    render(<CollapsibleError errorMessage="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText(/Show stack trace/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hide stack trace/)).not.toBeInTheDocument();
  });

  it('renders first line of multi-line error by default', () => {
    const error = 'java.lang.AssertionError: Expected true but was false\n    at com.example.Test.run(Test.java:42)';
    render(<CollapsibleError errorMessage={error} />);
    
    expect(screen.getByText('java.lang.AssertionError: Expected true but was false')).toBeInTheDocument();
    // Stack trace should not be visible by default
    expect(screen.queryByText(/Test\.run/)).not.toBeInTheDocument();
  });

  it('shows stack trace toggle for multi-line errors', () => {
    const error = 'Error line 1\nStack line 2\nStack line 3';
    render(<CollapsibleError errorMessage={error} />);
    
    expect(screen.getByText('Show stack trace (2 lines)')).toBeInTheDocument();
  });

  it('expands stack trace on click', () => {
    const error = 'Error: main message\n    at foo.Bar.baz(Bar.java:10)\n    at foo.Qux.main(Qux.java:5)';
    render(<CollapsibleError errorMessage={error} />);
    
    // Stack trace hidden initially
    expect(screen.queryByText(/foo\.Bar\.baz/)).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('Show stack trace (2 lines)'));
    
    // Stack trace now visible
    expect(screen.getByText(/foo\.Bar\.baz/)).toBeInTheDocument();
    expect(screen.getByText(/foo\.Qux\.main/)).toBeInTheDocument();
    expect(screen.getByText('Hide stack trace')).toBeInTheDocument();
  });

  it('collapses stack trace on second click', () => {
    const error = 'Error: main\n    at foo.Bar(Bar.java:10)';
    render(<CollapsibleError errorMessage={error} />);
    
    // Expand
    fireEvent.click(screen.getByText('Show stack trace (1 lines)'));
    expect(screen.getByText(/foo\.Bar/)).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(screen.getByText('Hide stack trace'));
    expect(screen.queryByText(/foo\.Bar/)).not.toBeInTheDocument();
    expect(screen.getByText('Show stack trace (1 lines)')).toBeInTheDocument();
  });

  it('handles empty error message gracefully', () => {
    render(<CollapsibleError errorMessage="" />);
    
    // Empty string still renders the first line (empty pre)
    const preElements = document.querySelectorAll('pre');
    expect(preElements.length).toBeGreaterThanOrEqual(1);
    // No stack trace toggle for single (empty) line
    expect(screen.queryByText(/Show stack trace/)).not.toBeInTheDocument();
  });

  it('handles error with only newlines', () => {
    const error = '\n\n\n';
    render(<CollapsibleError errorMessage={error} />);
    
    // Multiple lines so toggle should appear
    expect(screen.getByText(/Show stack trace/)).toBeInTheDocument();
  });

  it('displays correct line count in toggle text', () => {
    const error = 'Main error\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<CollapsibleError errorMessage={error} />);
    
    expect(screen.getByText('Show stack trace (4 lines)')).toBeInTheDocument();
  });

  it('renders real-world stack trace example', () => {
    const error = [
      'io.michelin.choreography.nrtengine.exceptions.ConsumerException: Error while waiting for record to appear in topic : io.michelin.choreography.nrtengine.exceptions.ConsumerException: Consumer died without finding any record (died after: 100000ms)',
      '    at io.michelin.choreography.nrtengine.steps.services.ConsumerValidationService.executeConsumer(ConsumerValidationService.java:299)',
      '    at io.michelin.choreography.nrtengine.steps.services.ConsumerValidationService.validateSingleRecord(ConsumerValidationService.java:470)',
      '    at io.michelin.choreography.nrtengine.steps.ValidationStepDefinition.expectedRecordsFromFileBasedOnSchema(ValidationStepDefinition.java:65)',
    ].join('\n');
    
    render(<CollapsibleError errorMessage={error} />);
    
    // First line visible
    expect(screen.getByText(/Consumer died without finding any record/)).toBeInTheDocument();
    // Toggle shows 3 lines
    expect(screen.getByText('Show stack trace (3 lines)')).toBeInTheDocument();
    
    // Expand
    fireEvent.click(screen.getByText('Show stack trace (3 lines)'));
    expect(screen.getByText(/ConsumerValidationService\.executeConsumer/)).toBeInTheDocument();
    expect(screen.getByText(/ValidationStepDefinition\.expectedRecordsFromFileBasedOnSchema/)).toBeInTheDocument();
  });
});
