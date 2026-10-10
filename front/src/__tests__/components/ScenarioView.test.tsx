import { render, screen, fireEvent } from '@testing-library/react';
import ScenarioView from '../../components/ScenarioView';
import { mockScenario, mockFeature, createMockReportData } from '../testUtils';

describe('ScenarioView', () => {
  const mockReportData = createMockReportData();

  it('renders invalid scenario message when passed feature data', () => {
    const feature = mockFeature();
    render(<ScenarioView scenario={feature} reportData={mockReportData} />);
    
    expect(screen.getByText('Invalid scenario data')).toBeInTheDocument();
  });

  it('renders basic scenario view with feature header', () => {
    const scenario = mockScenario();
    const feature = mockFeature({ 
      name: 'User Authentication',
      elements: [scenario]
    });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('Scenario View')).toBeInTheDocument();
    expect(screen.getByText('Feature:')).toBeInTheDocument();
    expect(screen.getByText('User Authentication')).toBeInTheDocument();
    expect(screen.getByText('Scenario:')).toBeInTheDocument();
    // Use getAllByText since the scenario name appears in both gherkin view and execution details
    expect(screen.getAllByText(scenario.name)).toHaveLength(2);
  });

  it('renders scenario with tags', () => {
    const scenario = mockScenario({
      tags: [
        { name: '@smoke', line: 1 },
        { name: '@regression', line: 1 }
      ]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('@smoke @regression')).toBeInTheDocument();
  });

  it('shows background note when feature has background', () => {
    const scenario = mockScenario();
    const background = {
      id: 'background-1',
      name: 'Background',
      line: 2,
      keyword: 'Background',
      type: 'background' as const,
      steps: [{ 
        keyword: 'Given ', 
        name: 'system is ready',
        line: 3,
        result: { status: 'passed' as const }
      }]
    };
    const feature = mockFeature({ 
      elements: [background, scenario]
    });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText(/Background steps are executed before this scenario/)).toBeInTheDocument();
  });

  it('renders scenario steps in gherkin format', () => {
    const scenario = mockScenario({
      steps: [
        {
          keyword: 'Given ',
          name: 'I am on the login page',
          line: 5,
          result: { status: 'passed' }
        },
        {
          keyword: 'When ',
          name: 'I enter valid credentials',
          line: 6,
          result: { status: 'passed' }
        },
        {
          keyword: 'Then ',
          name: 'I should be logged in',
          line: 7,
          result: { status: 'passed' }
        }
      ]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // Steps appear twice - once in gherkin view, once in execution details
    expect(screen.getAllByText('Given')).toHaveLength(2);
    expect(screen.getAllByText('I am on the login page')).toHaveLength(2);
    expect(screen.getAllByText('When')).toHaveLength(2);
    expect(screen.getAllByText('I enter valid credentials')).toHaveLength(2);
    expect(screen.getAllByText('Then')).toHaveLength(2);
    expect(screen.getAllByText('I should be logged in')).toHaveLength(2);
  });

  it('renders step with data table in gherkin format', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Given ',
        name: 'the following users exist',
        line: 5,
        result: { status: 'passed' },
        rows: [
          { cells: ['Name', 'Email'] },
          { cells: ['John', 'john@example.com'] },
          { cells: ['Jane', 'jane@example.com'] }
        ]
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // Step name appears twice - once in gherkin view, once in execution details
    expect(screen.getAllByText('the following users exist')).toHaveLength(2);
    expect(screen.getByText('| Name')).toBeInTheDocument();
    expect(screen.getByText('| Email')).toBeInTheDocument();
    expect(screen.getByText('| John')).toBeInTheDocument();
    expect(screen.getByText('| john@example.com')).toBeInTheDocument();
  });

  it('renders execution details section', () => {
    const scenario = mockScenario();
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('Execution Details')).toBeInTheDocument();
  });

  it('renders step execution details with line numbers and status', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Given ',
        name: 'I have a step',
        line: 10,
        result: { 
          status: 'passed',
          duration: 1500000 // 2ms
        }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // Line number
    expect(screen.getByText('2ms')).toBeInTheDocument(); // Duration
  });

  it('renders step with error message', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Then ',
        name: 'something should work',
        line: 15,
        result: { 
          status: 'failed',
          error_message: 'AssertionError: Expected true but was false'
        }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('AssertionError: Expected true but was false')).toBeInTheDocument();
  });

  it('renders step data table in execution details', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'When ',
        name: 'I submit the form with data',
        line: 12,
        result: { status: 'passed' },
        rows: [
          { cells: ['Field', 'Value'] },
          { cells: ['username', 'testuser'] },
          { cells: ['password', 'secret123'] }
        ]
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // Check for data table in execution details (not the gherkin format)
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('does not render duration for steps with zero duration', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Given ',
        name: 'a step with no duration',
        line: 8,
        result: { 
          status: 'passed',
          duration: 0
        }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.queryByText('0ms')).not.toBeInTheDocument();
  });

  it('handles scenario not found in report data', () => {
    const scenario = mockScenario({ id: 'non-existent-scenario' });
    const emptyReportData = [mockFeature({ elements: [] })];
    
    render(<ScenarioView scenario={scenario} reportData={emptyReportData} />);
    
    expect(screen.getByText('Scenario View')).toBeInTheDocument();
    // Feature name should be undefined/empty when scenario not found
    expect(screen.getByText('Feature:')).toBeInTheDocument();
  });

  it('renders steps without data tables correctly', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Given ',
        name: 'a simple step',
        line: 5,
        result: { status: 'passed' }
        // No rows property
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // Step name appears twice - once in gherkin view, once in execution details
    expect(screen.getAllByText('a simple step')).toHaveLength(2);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('collapses multi-line stack trace in execution details', () => {
    const multiLineError = 'ConsumerException: Consumer died\n    at ConsumerValidationService.executeConsumer(ConsumerValidationService.java:299)\n    at ConsumerValidationService.validateSingleRecord(ConsumerValidationService.java:470)';
    const scenario = mockScenario({
      steps: [{
        keyword: 'Then ',
        name: 'expected record from file',
        line: 51,
        result: { status: 'failed', error_message: multiLineError }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // First line visible
    expect(screen.getByText(/Consumer died/)).toBeInTheDocument();
    // Stack trace toggle shown
    expect(screen.getByText('Show stack trace (2 lines)')).toBeInTheDocument();
    // Stack trace hidden
    expect(screen.queryByText(/executeConsumer/)).not.toBeInTheDocument();
    
    // Expand
    fireEvent.click(screen.getByText('Show stack trace (2 lines)'));
    expect(screen.getByText(/executeConsumer/)).toBeInTheDocument();
    expect(screen.getByText(/validateSingleRecord/)).toBeInTheDocument();
  });

  it('renders single-line error in execution details without toggle', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Then ',
        name: 'single line error step',
        line: 10,
        result: { status: 'failed', error_message: 'Just a simple error' }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('Just a simple error')).toBeInTheDocument();
    expect(screen.queryByText(/Show stack trace/)).not.toBeInTheDocument();
  });

  it('renders doc_string in gherkin view and execution details', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Given ',
        name: 'a doc string step',
        line: 10,
        result: { status: 'passed' },
        doc_string: {
          value: 'Multi-line\ndoc string content',
          line: 11,
          content_type: 'text/plain'
        }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // doc_string appears in both gherkin view and execution details
    const docStringContents = screen.getAllByText(/Multi-line/);
    expect(docStringContents.length).toBeGreaterThanOrEqual(2);
    // content_type label appears in both views
    const contentTypeLabels = screen.getAllByText('text/plain');
    expect(contentTypeLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('renders doc_string without content_type in both views', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Given ',
        name: 'a plain doc string',
        line: 10,
        result: { status: 'passed' },
        doc_string: {
          value: 'Plain content',
          line: 11
        }
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    // doc_string value appears in both views (gherkin + execution)
    const contents = screen.getAllByText('Plain content');
    expect(contents.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('text/plain')).not.toBeInTheDocument();
  });

  it('renders embeddings in execution details', () => {
    const scenario = mockScenario({
      steps: [{
        keyword: 'Then ',
        name: 'screenshot captured',
        line: 15,
        result: { status: 'passed' },
        embeddings: [
          { mime_type: 'image/png', data: 'iVBORw0KGgo=', name: 'screenshot.png' }
        ]
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    const img = screen.getByAltText('screenshot.png');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('renders text embedding in execution details', () => {
    const base64Content = btoa('Text attachment content');
    const scenario = mockScenario({
      steps: [{
        keyword: 'Then ',
        name: 'text attached',
        line: 15,
        result: { status: 'passed' },
        embeddings: [
          { mime_type: 'text/plain', data: base64Content, name: 'output.txt' }
        ]
      }]
    });
    const feature = mockFeature({ elements: [scenario] });
    const reportData = [feature];
    
    render(<ScenarioView scenario={scenario} reportData={reportData} />);
    
    expect(screen.getByText('output.txt')).toBeInTheDocument();
    expect(screen.getByText('Text attachment content')).toBeInTheDocument();
  });
});
