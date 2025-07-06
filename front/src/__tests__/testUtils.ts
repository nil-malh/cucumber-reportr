import type { 
  CucumberReport, 
  CucumberFeature, 
  CucumberScenario, 
  CucumberStep,
  ReportStats,
  FolderStructure 
} from '../types/cucumber';

export const createMockStep = (overrides: Partial<CucumberStep> = {}): CucumberStep => ({
  keyword: 'Given ',
  name: 'I have a test step',
  line: 10,
  result: {
    status: 'passed',
    duration: 1000000
  },
  ...overrides
});

export const createMockScenario = (overrides: Partial<CucumberScenario> = {}): CucumberScenario => ({
  id: 'scenario-1',
  name: 'Test scenario',
  line: 5,
  keyword: 'Scenario',
  type: 'scenario',
  steps: [
    createMockStep(),
    createMockStep({ keyword: 'When ', name: 'I perform an action' }),
    createMockStep({ keyword: 'Then ', name: 'I see the result' })
  ],
  ...overrides
});

export const createMockFeature = (overrides: Partial<CucumberFeature> = {}): CucumberFeature => ({
  id: 'feature-1',
  name: 'Test feature',
  line: 1,
  keyword: 'Feature',
  uri: 'test.feature',
  elements: [
    createMockScenario(),
    createMockScenario({ 
      id: 'scenario-2', 
      name: 'Another test scenario',
      steps: [
        createMockStep({ result: { status: 'failed', error_message: 'Test failed' } })
      ]
    })
  ],
  ...overrides
});

export const createMockReportData = (features: CucumberFeature[] = []): CucumberReport => {
  if (features.length === 0) {
    return [createMockFeature()];
  }
  return features;
};

export const createMockStats = (overrides: Partial<ReportStats> = {}): ReportStats => ({
  totalFeatures: 1,
  totalScenarios: 2,
  totalSteps: 6,
  passedFeatures: 1,
  failedFeatures: 0,
  skippedFeatures: 0,
  passedScenarios: 1,
  failedScenarios: 1,
  skippedScenarios: 0,
  passedSteps: 5,
  failedSteps: 1,
  skippedSteps: 0,
  totalDuration: 6000000,
  passRate: 50,
  ...overrides
});

export const createMockFolderStructure = (): FolderStructure => ({
  'test-features': {
    features: [createMockFeature()],
    subfolders: {}
  }
});

export const createFailedStep = (): CucumberStep => createMockStep({
  result: {
    status: 'failed',
    duration: 500000,
    error_message: 'Expected true but got false'
  }
});

export const createSkippedStep = (): CucumberStep => createMockStep({
  result: {
    status: 'skipped',
    duration: 0
  }
});

export const createPendingStep = (): CucumberStep => createMockStep({
  result: {
    status: 'pending',
    duration: 0
  }
});

export const createFailedScenario = (): CucumberScenario => createMockScenario({
  id: 'failed-scenario',
  name: 'Failed scenario',
  steps: [
    createMockStep(),
    createFailedStep(),
    createSkippedStep()
  ]
});

export const createPassedScenario = (): CucumberScenario => createMockScenario({
  id: 'passed-scenario',
  name: 'Passed scenario',
  steps: [
    createMockStep(),
    createMockStep({ keyword: 'When ', name: 'action is performed' }),
    createMockStep({ keyword: 'Then ', name: 'result is verified' })
  ]
});

export const createComplexFeature = (): CucumberFeature => createMockFeature({
  id: 'complex-feature',
  name: 'Complex test feature',
  uri: 'features/complex.feature',
  description: 'A complex feature with multiple scenarios',
  tags: [{ name: '@smoke', line: 1 }],
  elements: [
    createPassedScenario(),
    createFailedScenario(),
    {
      id: 'background-1',
      name: 'Background steps',
      line: 3,
      keyword: 'Background',
      type: 'background',
      steps: [
        createMockStep({ keyword: 'Given ', name: 'the application is running' })
      ]
    }
  ]
});

// Convenience aliases for backward compatibility
export const mockStep = createMockStep;
export const mockScenario = createMockScenario;
export const mockFeature = createMockFeature;
export const mockReportData = createMockReportData;
