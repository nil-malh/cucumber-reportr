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

  it('renders Top 5 Features chart with formatted durations', () => {
    const reportData: CucumberReport = [
      mockFeature({
        name: 'Slow Feature',
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 5000000000 } }) // 5s
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);

    // The formatted duration should appear in the Top 5 chart and table
    expect(screen.getAllByText('Slow Feature')).toHaveLength(2); // chart + table
    expect(screen.getAllByText('5.00s').length).toBeGreaterThan(0);
  });

  it('renders Top 5 Features chart with empty durations (0% width branch)', () => {
    const reportData: CucumberReport = [
      mockFeature({
        name: 'Zero Duration Feature',
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 0 } })
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);

    // Should render the chart without crashing even with 0 duration
    expect(screen.getByText('Top 5 Features by Execution Time')).toBeInTheDocument();
    expect(screen.getAllByText('Zero Duration Feature')).toHaveLength(2); // chart + table
  });

  it('renders donut charts with zero total (empty data branch)', () => {
    // Empty report data triggers the zero-total branches in DonutChart
    render(<GlobalAnalytics reportData={[]} />);

    // Charts should still render (with 0 total)
    expect(screen.getByText('Scenario Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Step Status Distribution')).toBeInTheDocument();
  });

  it('renders donut charts with data (non-zero total branch)', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          mockScenario({
            steps: [
              createMockStep({ result: { status: 'passed', duration: 1000000 } }),
              createMockStep({ result: { status: 'failed', duration: 2000000 } })
            ]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);

    // Donut charts should render with non-zero total
    expect(screen.getByText('Scenario Status Distribution')).toBeInTheDocument();
    // The total (1 scenario) should appear in the donut center
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('renders feature performance table with all columns', () => {
    const reportData: CucumberReport = [
      mockFeature({
        name: 'Complete Feature',
        elements: [
          mockScenario({
            name: 'Passed scenario',
            steps: [createMockStep({ result: { status: 'passed', duration: 1000000 } })]
          }),
          mockScenario({
            name: 'Failed scenario',
            steps: [createMockStep({ result: { status: 'failed', duration: 2000000 } })]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);

    // Table headers
    expect(screen.getByText('Feature Performance Breakdown')).toBeInTheDocument();
    expect(screen.getAllByText('Scenarios').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Steps').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Passed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Success Rate').length).toBeGreaterThan(0);

    // Feature name appears in both chart and table
    expect(screen.getAllByText('Complete Feature').length).toBeGreaterThan(0);
  });

  it('handles features with pending and skipped scenarios', () => {
    const reportData: CucumberReport = [
      mockFeature({
        elements: [
          mockScenario({
            name: 'Pending scenario',
            steps: [createMockStep({ result: { status: 'pending' } })]
          }),
          mockScenario({
            name: 'Skipped scenario',
            steps: [createMockStep({ result: { status: 'skipped' } })]
          })
        ]
      })
    ];

    render(<GlobalAnalytics reportData={reportData} />);

    // Pending and skipped should appear in the charts (may be split across elements)
    expect(screen.getAllByText(/Pending/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Skipped/).length).toBeGreaterThan(0);
  });
});
