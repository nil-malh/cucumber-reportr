import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the CucumberReporter component
jest.mock('../components/CucumberReporter', () => {
  const MockCucumberReporter = () => {
    return <div data-testid="cucumber-reporter">Cucumber Reporter Component</div>;
  };
  MockCucumberReporter.displayName = 'CucumberReporter';
  return MockCucumberReporter;
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('cucumber-reporter')).toBeInTheDocument();
  });

  it('renders the CucumberReporter component', () => {
    render(<App />);
    expect(screen.getByTestId('cucumber-reporter')).toBeInTheDocument();
    expect(screen.getByText('Cucumber Reporter Component')).toBeInTheDocument();
  });
});
