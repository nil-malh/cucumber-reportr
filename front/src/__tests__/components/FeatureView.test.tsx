import { render, screen } from '@testing-library/react';
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
});
