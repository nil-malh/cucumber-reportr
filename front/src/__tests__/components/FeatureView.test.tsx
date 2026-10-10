import { render, screen, fireEvent } from '@testing-library/react';
import FeatureView from '../../components/FeatureView';
import { mockFeature, mockScenario, createMockStep } from '../testUtils';

describe('FeatureView', () => {
  it('renders basic feature view with header', () => {
    const feature = mockFeature({
      name: 'User Authentication',
      uri: 'features/auth.feature'
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Feature File: features/auth.feature')).toBeInTheDocument();
    expect(screen.getByText('Feature:')).toBeInTheDocument();
    expect(screen.getByText('User Authentication')).toBeInTheDocument();
  });

  it('renders feature with description', () => {
    const feature = mockFeature({
      name: 'User Management',
      description: 'This feature covers user registration and login functionality',
      uri: 'features/users.feature'
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('This feature covers user registration and login functionality')).toBeInTheDocument();
  });

  it('renders feature without description', () => {
    const feature = mockFeature({
      name: 'Simple Feature',
      uri: 'features/simple.feature'
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Simple Feature')).toBeInTheDocument();
    expect(screen.queryByText(/This feature covers/)).not.toBeInTheDocument();
  });

  it('renders background steps when present', () => {
    const backgroundSteps = [
      createMockStep({
        keyword: 'Given ',
        name: 'the system is running',
        result: { status: 'passed', duration: 1000000 }
      }),
      createMockStep({
        keyword: 'And ',
        name: 'the database is clean',
        result: { status: 'passed' }
      })
    ];

    const background = {
      id: 'background-1',
      name: 'Setup',
      line: 3,
      keyword: 'Background',
      type: 'background' as const,
      steps: backgroundSteps
    };

    const feature = mockFeature({
      name: 'Feature with Background',
      elements: [background, mockScenario()]
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Background:')).toBeInTheDocument();
    expect(screen.getByText('the system is running')).toBeInTheDocument();
    expect(screen.getByText('the database is clean')).toBeInTheDocument();
    expect(screen.getByText('Background Steps: 2')).toBeInTheDocument();
  });

  it('renders scenario steps', () => {
    const steps = [
      createMockStep({
        keyword: 'Given ',
        name: 'I am on the login page'
      }),
      createMockStep({
        keyword: 'When ',
        name: 'I enter valid credentials'
      }),
      createMockStep({
        keyword: 'Then ',
        name: 'I should be logged in'
      })
    ];

    const scenario = mockScenario({
      name: 'Login flow',
      steps: steps
    });

    const feature = mockFeature({
      elements: [scenario]
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('I am on the login page')).toBeInTheDocument();
    expect(screen.getByText('I enter valid credentials')).toBeInTheDocument();
    expect(screen.getByText('I should be logged in')).toBeInTheDocument();
  });

  it('renders execution details section', () => {
    const feature = mockFeature();
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Feature Statistics')).toBeInTheDocument();
  });

  it('handles feature with empty elements array', () => {
    const feature = mockFeature({
      elements: []
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Feature:')).toBeInTheDocument();
    expect(screen.queryByText('Scenario:')).not.toBeInTheDocument();
  });

  it('renders collapsed error message in scenario step with collapsible stack trace', () => {
    const multiLineError = 'AssertionError: Expected true but was false\n    at com.example.Test.run(Test.java:42)\n    at com.example.Test.main(Test.java:10)';
    const scenario = mockScenario({
      name: 'Failing scenario',
      steps: [
        createMockStep({
          keyword: 'Then ',
          name: 'the result should be correct',
          result: { status: 'failed', error_message: multiLineError }
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    // First line of error is visible
    expect(screen.getByText(/AssertionError: Expected true but was false/)).toBeInTheDocument();
    // Stack trace toggle is shown
    expect(screen.getByText('Show stack trace (2 lines)')).toBeInTheDocument();
    // Stack trace lines are hidden by default
    expect(screen.queryByText(/com\.example\.Test\.run/)).not.toBeInTheDocument();
    
    // Expand stack trace
    fireEvent.click(screen.getByText('Show stack trace (2 lines)'));
    expect(screen.getByText(/com\.example\.Test\.run/)).toBeInTheDocument();
    expect(screen.getByText(/com\.example\.Test\.main/)).toBeInTheDocument();
  });

  it('renders collapsed error message in background step with collapsible stack trace', () => {
    const multiLineError = 'BackgroundError: Setup failed\n    at com.example.Setup.run(Setup.java:15)';
    const background = {
      id: 'background-1',
      name: 'Setup',
      line: 3,
      keyword: 'Background',
      type: 'background' as const,
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'the system is initialized',
          result: { status: 'failed', error_message: multiLineError }
        })
      ]
    };

    const feature = mockFeature({
      name: 'Feature with failing background',
      elements: [background, mockScenario()]
    });

    render(<FeatureView feature={feature} />);
    
    // First line visible
    expect(screen.getByText(/BackgroundError: Setup failed/)).toBeInTheDocument();
    // Toggle shown
    expect(screen.getByText('Show stack trace (1 lines)')).toBeInTheDocument();
    // Stack trace hidden
    expect(screen.queryByText(/com\.example\.Setup\.run/)).not.toBeInTheDocument();
    
    // Expand
    fireEvent.click(screen.getByText('Show stack trace (1 lines)'));
    expect(screen.getByText(/com\.example\.Setup\.run/)).toBeInTheDocument();
  });

  it('renders single-line error in scenario step without stack trace toggle', () => {
    const scenario = mockScenario({
      name: 'Simple failure',
      steps: [
        createMockStep({
          keyword: 'Then ',
          name: 'something should work',
          result: { status: 'failed', error_message: 'Simple single line error' }
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Simple single line error')).toBeInTheDocument();
    expect(screen.queryByText(/Show stack trace/)).not.toBeInTheDocument();
  });

  it('renders multiple scenario steps with errors independently', () => {
    const error1 = 'Error in step 1\n    at Stack1.frame(Frame1.java:1)';
    const error2 = 'Error in step 2\n    at Stack2.frame(Frame2.java:2)';
    
    const scenario = mockScenario({
      name: 'Multiple failures',
      steps: [
        createMockStep({
          keyword: 'When ',
          name: 'first action',
          result: { status: 'failed', error_message: error1 }
        }),
        createMockStep({
          keyword: 'Then ',
          name: 'second action',
          result: { status: 'failed', error_message: error2 }
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    // Both first lines visible
    expect(screen.getByText('Error in step 1')).toBeInTheDocument();
    expect(screen.getByText('Error in step 2')).toBeInTheDocument();
    
    // Both stack traces collapsed independently
    const toggles = screen.getAllByText(/Show stack trace/);
    expect(toggles).toHaveLength(2);
    
    // Expand only the first
    fireEvent.click(toggles[0]);
    expect(screen.getByText(/Stack1\.frame/)).toBeInTheDocument();
    // Second still collapsed
    expect(screen.queryByText(/Stack2\.frame/)).not.toBeInTheDocument();
  });

  it('renders invalid feature data when passed a scenario instead of feature', () => {
    const scenario = mockScenario();
    render(<FeatureView feature={scenario} />);
    
    expect(screen.getByText('Invalid feature data')).toBeInTheDocument();
  });

  it('renders background step with data table', () => {
    const background = {
      id: 'background-1',
      name: 'Setup',
      line: 3,
      keyword: 'Background',
      type: 'background' as const,
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'the following data exists',
          result: { status: 'passed', duration: 1000000 },
          rows: [
            { cells: ['key', 'value'] },
            { cells: ['name', 'test'] }
          ]
        })
      ]
    };

    const feature = mockFeature({
      name: 'Feature with background table',
      elements: [background, mockScenario()]
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Background:')).toBeInTheDocument();
    expect(screen.getByText('| key')).toBeInTheDocument();
    expect(screen.getByText('| name')).toBeInTheDocument();
  });

  it('renders scenario step with data table', () => {
    const scenario = mockScenario({
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'the following users',
          result: { status: 'passed' },
          rows: [
            { cells: ['Name', 'Role'] },
            { cells: ['Alice', 'Admin'] }
          ]
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('| Name')).toBeInTheDocument();
    expect(screen.getByText('| Alice')).toBeInTheDocument();
  });

  it('renders step without result status', () => {
    const scenario = mockScenario({
      steps: [
        {
          keyword: 'Then ',
          name: '',
          line: 0,
          result: undefined as any
        }
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    // Step with no result renders "Unnamed step" fallback for missing name
    // and renders a placeholder div instead of status icon
    expect(screen.getByText('Unnamed step')).toBeInTheDocument();
  });

  it('renders scenario step with line number', () => {
    const scenario = mockScenario({
      steps: [
        createMockStep({
          keyword: 'When ',
          name: 'I do something on line 42',
          line: 42,
          result: { status: 'passed' }
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('(Line 42)')).toBeInTheDocument();
  });

  it('renders scenario with tags', () => {
    const scenario = mockScenario({
      tags: [
        { name: '@smoke', line: 1 },
        { name: '@wip', line: 1 }
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('@smoke @wip')).toBeInTheDocument();
  });

  it('renders background step with duration', () => {
    const background = {
      id: 'background-1',
      name: 'Setup',
      line: 3,
      keyword: 'Background',
      type: 'background' as const,
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'system is ready',
          result: { status: 'passed', duration: 5000000 } // 5ms
        })
      ]
    };

    const feature = mockFeature({
      elements: [background, mockScenario()]
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('(5ms)')).toBeInTheDocument();
  });

  it('renders feature statistics with failed and skipped scenarios', () => {
    const scenario1 = mockScenario({ id: 's1', name: 'passed scenario' });
    const scenario2 = mockScenario({ 
      id: 's2', 
      name: 'failed scenario',
      steps: [createMockStep({ result: { status: 'failed', error_message: 'fail' } })]
    });
    
    const feature = mockFeature({ 
      name: 'Mixed results feature',
      elements: [scenario1, scenario2]
    });
    
    render(<FeatureView feature={feature} />);
    
    expect(screen.getByText('Feature Statistics')).toBeInTheDocument();
    // "Failed: 1" appears in both Scenarios and Steps sections
    const failedElements = screen.getAllByText(/Failed: 1/);
    expect(failedElements.length).toBe(2);
    expect(screen.getByText('Passed: 1')).toBeInTheDocument();
  });

  it('renders doc_string in background step', () => {
    const background = {
      id: 'background-1',
      name: 'Setup',
      line: 3,
      keyword: 'Background',
      type: 'background' as const,
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'a doc string is provided',
          result: { status: 'passed' },
          doc_string: {
            value: 'Background setup content\nmulti-line',
            line: 5,
            content_type: 'text/plain'
          }
        })
      ]
    };

    const feature = mockFeature({
      name: 'Feature with background doc string',
      elements: [background, mockScenario()]
    });

    render(<FeatureView feature={feature} />);

    expect(screen.getByText('text/plain')).toBeInTheDocument();
    expect(screen.getByText(/Background setup content/)).toBeInTheDocument();
  });

  it('renders doc_string in scenario step', () => {
    const scenario = mockScenario({
      name: 'Scenario with doc string',
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'a doc string',
          result: { status: 'passed' },
          doc_string: {
            value: '{"key": "value"}',
            line: 10,
            content_type: 'application/json'
          }
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);

    expect(screen.getByText('application/json')).toBeInTheDocument();
    expect(screen.getByText(/"key": "value"/)).toBeInTheDocument();
  });

  it('renders doc_string without content_type in scenario step', () => {
    const scenario = mockScenario({
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'a plain doc string',
          result: { status: 'passed' },
          doc_string: {
            value: 'Plain text content',
            line: 10
          }
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);

    expect(screen.getByText('Plain text content')).toBeInTheDocument();
    expect(screen.queryByText('text/plain')).not.toBeInTheDocument();
  });

  it('renders embeddings in background step', () => {
    const background = {
      id: 'background-1',
      name: 'Setup',
      line: 3,
      keyword: 'Background',
      type: 'background' as const,
      steps: [
        createMockStep({
          keyword: 'Given ',
          name: 'a screenshot is taken',
          result: { status: 'passed' },
          embeddings: [
            { mime_type: 'image/png', data: 'iVBORw0KGgo=', name: 'bg-screenshot.png' }
          ]
        })
      ]
    };

    const feature = mockFeature({
      name: 'Feature with background embedding',
      elements: [background, mockScenario()]
    });

    render(<FeatureView feature={feature} />);

    const img = screen.getByAltText('bg-screenshot.png');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('renders embeddings in scenario step', () => {
    const scenario = mockScenario({
      name: 'Scenario with embedding',
      steps: [
        createMockStep({
          keyword: 'Then ',
          name: 'a screenshot is captured',
          result: { status: 'failed' },
          embeddings: [
            { mime_type: 'image/png', data: 'iVBORw0KGgo=', name: 'screenshot.png' }
          ]
        })
      ]
    });

    const feature = mockFeature({ elements: [scenario] });
    render(<FeatureView feature={feature} />);

    expect(screen.getByAltText('screenshot.png')).toBeInTheDocument();
  });
});
