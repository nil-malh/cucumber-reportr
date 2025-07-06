import { formatDuration, buildFolderStructure, filterScenarios } from '../../utils/cucumberUtils';
import { createMockFeature, createMockScenario, createMockStep } from '../testUtils';

describe('formatDuration additional tests', () => {
  it('formats various durations correctly', () => {
    // Test milliseconds
    expect(formatDuration(1000000)).toBe('1ms');
    expect(formatDuration(999000000)).toBe('999ms');
    
    // Test seconds
    expect(formatDuration(1000000000)).toBe('1.00s');
    expect(formatDuration(1500000000)).toBe('1.50s');
    expect(formatDuration(2000000000)).toBe('2.00s');
    
    // Test edge cases
    expect(formatDuration(500000)).toBe('1ms'); // rounds up
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(undefined)).toBe('0ms');
  });
});

describe('buildFolderStructure additional tests', () => {
  it('handles features with different URI formats', () => {
    const features = [
      createMockFeature({ uri: 'file:///path/to/features/login.feature' }),
      createMockFeature({ uri: 'features/authentication/signup.feature' }),
      createMockFeature({ uri: 'tests/user-management.feature' }),
    ];

    const structure = buildFolderStructure(features);
    
    // Based on the actual implementation, it groups by main folder
    expect(Object.keys(structure)).toContain('path');
    expect(Object.keys(structure)).toContain('features'); // "features" becomes the main folder
    expect(Object.keys(structure)).toContain('tests');
    
    // Each should have features array
    expect(structure.path.features).toHaveLength(1);
    expect(structure.features.features).toHaveLength(1);
    expect(structure.tests.features).toHaveLength(1);
  });

  it('handles empty feature list', () => {
    const structure = buildFolderStructure([]);
    expect(structure).toEqual({});
  });

  it('groups features by main folder correctly', () => {
    const features = [
      createMockFeature({ uri: 'src/features/feature1.feature' }),
      createMockFeature({ uri: 'src/features/feature2.feature' }),
      createMockFeature({ uri: 'tests/feature3.feature' }),
    ];

    const structure = buildFolderStructure(features);
    
    expect(structure.src.features).toHaveLength(2);
    expect(structure.tests.features).toHaveLength(1);
  });
});

describe('filterScenarios additional tests', () => {
  it('filters by multiple criteria', () => {
    const scenario1 = createMockScenario({ name: 'Login test' });
    const scenario2 = createMockScenario({ name: 'Logout test' }); 
    const scenario3 = createMockScenario({ name: 'Register user' });
    
    const feature = createMockFeature({ elements: [scenario1, scenario2, scenario3] });

    // Filter by search term
    const results = filterScenarios(feature, 'Login', 'all');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Login test');
  });

  it('handles empty search term', () => {
    const scenario1 = createMockScenario({ name: 'Test 1' });
    const scenario2 = createMockScenario({ name: 'Test 2' });
    
    const feature = createMockFeature({ elements: [scenario1, scenario2] });
    
    const results = filterScenarios(feature, '', 'all');
    expect(results).toHaveLength(2);
  });

  it('filters by status', () => {
    const passedScenario = createMockScenario({ 
      name: 'Passed test',
      steps: [createMockStep({ result: { status: 'passed' } })]
    });
    const failedScenario = createMockScenario({ 
      name: 'Failed test',
      steps: [createMockStep({ result: { status: 'failed' } })]
    });
    
    const feature = createMockFeature({ elements: [passedScenario, failedScenario] });
    
    const passedResults = filterScenarios(feature, '', 'passed');
    expect(passedResults).toHaveLength(1);
    expect(passedResults[0].name).toBe('Passed test');
    
    const failedResults = filterScenarios(feature, '', 'failed');
    expect(failedResults).toHaveLength(1);
    expect(failedResults[0].name).toBe('Failed test');
  });
});
