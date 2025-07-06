import { render, screen } from '@testing-library/react';
import GlobalAnalytics from '../../components/GlobalAnalytics';
import { mockFeature, mockScenario, createMockStep } from '../testUtils';
import type { CucumberReport } from '../../types/cucumber';

describe('GlobalAnalytics', () => {
  it('renders analytics dashboard with empty data', () => {
    render(<GlobalAnalytics reportData={[]} />);
    
    // Should render the analytics header
    expect(screen.getByText('Global Test Execution Analytics')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive analysis of test execution metrics and performance data')).toBeInTheDocument();
  });

  it('displays basic metrics sections', () => {
    const reportData: CucumberReport = [
      mockFeature({
        name: 'Test Feature',
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 1000000 } })
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display section labels
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getAllByText('Scenarios')).toHaveLength(2); // Appears in metrics and table
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
  });

  it('displays execution metrics section', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [mockScenario()]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display execution time metrics section
    expect(screen.getByText('Execution Time Metrics')).toBeInTheDocument();
    expect(screen.getByText('Total Execution Time:')).toBeInTheDocument();
    expect(screen.getByText('Average Step Duration:')).toBeInTheDocument();
  });

  it('displays feature performance table when data exists', () => {
    const reportData: CucumberReport = [
      mockFeature({
        name: 'Feature A',
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 1000000 } })
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display feature performance table headers
    expect(screen.getByText('Feature Performance Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getAllByText('Scenarios')).toHaveLength(2); // Appears in metrics and table
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  it('displays status distribution charts', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [mockScenario()]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display chart titles
    expect(screen.getByText('Scenario Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Step Status Distribution')).toBeInTheDocument();
  });

  it('displays performance charts section', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [mockScenario()]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display performance charts
    expect(screen.getByText('Top 5 Features by Execution Time')).toBeInTheDocument();
    expect(screen.getByText('Execution Time Metrics')).toBeInTheDocument();
  });

  it('renders SVG icons for different metrics', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [mockScenario()]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display various lucide icons
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(5);
  });

  it('handles multiple features correctly', () => {
    const reportData: CucumberReport = [
      mockFeature({
        name: 'Feature A',
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 100000000 } })
            ]
          })
        ]
      }),
      mockFeature({
        name: 'Feature B',
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 200000000 } })
            ]
          })
        ]
      })
    ];
    
    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display both feature names in the table (Feature names appear in charts and table)
    expect(screen.getAllByText('Feature A')).toHaveLength(2);
    expect(screen.getAllByText('Feature B')).toHaveLength(2);
  });

  it('displays chart sections with proper data', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'failed', duration: 100000000 } })
            ]
          })
        ]
      })
    ];
    
    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display chart containers with specific titles
    expect(screen.getByText('Scenario Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Step Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Top 5 Features by Execution Time')).toBeInTheDocument();
  });

  it('calculates pass rates correctly', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          mockScenario({
            name: 'Passed Scenario',
            steps: [
              createMockStep({ result: { status: 'passed', duration: 100000000 } })
            ]
          }),
          mockScenario({
            name: 'Failed Scenario',
            steps: [
              createMockStep({ result: { status: 'failed', duration: 200000000 } })
            ]
          })
        ]
      })
    ];
    
    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display calculated metrics (50.0% appears in multiple places)
    expect(screen.getAllByText('50.0%')).toHaveLength(4); // Pass rate appears in metrics, success rate, failure rate, and table
  });

  it('displays detailed execution metrics', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 100000000 } })
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should show execution metrics details
    expect(screen.getByText('Fastest Step:')).toBeInTheDocument();
    expect(screen.getByText('Slowest Step:')).toBeInTheDocument();
    expect(screen.getByText('Success Rate:')).toBeInTheDocument();
    expect(screen.getByText('Failure Rate:')).toBeInTheDocument();
  });

  it('shows all metric cards', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 100000000 } })
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should display all metric cards
    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('Avg Step Time')).toBeInTheDocument();
    expect(screen.getByText('Total Steps')).toBeInTheDocument();
  });

  it('handles features with background steps correctly', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          {
            id: 'bg',
            type: 'background' as const,
            name: 'Background',
            description: '',
            line: 1,
            keyword: 'Background',
            steps: [createMockStep({ result: { status: 'passed' } })]
          },
          mockScenario({
            steps: [createMockStep({ result: { status: 'passed' } })]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);
    
    // Should render without errors
    expect(screen.getByText('Global Test Execution Analytics')).toBeInTheDocument();
  });
});
