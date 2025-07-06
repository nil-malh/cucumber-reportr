import { 
  getScenarioStatus, 
  calculateStats, 
  formatDuration, 
  filterScenarios
} from '../../utils/cucumberUtils';
import { createMockFeature, createMockScenario, createMockStep } from '../testUtils';

describe('cucumberUtils', () => {
  describe('getScenarioStatus', () => {
    it('returns failed if any step failed', () => {
      const scenario = createMockScenario({
        steps: [
          createMockStep({ result: { status: 'passed' } }),
          createMockStep({ result: { status: 'failed', error_message: 'Test error' } }),
          createMockStep({ result: { status: 'skipped' } })
        ]
      });

      expect(getScenarioStatus(scenario)).toBe('failed');
    });

    it('returns passed if all steps passed', () => {
      const scenario = createMockScenario({
        steps: [
          createMockStep({ result: { status: 'passed' } }),
          createMockStep({ result: { status: 'passed' } }),
          createMockStep({ result: { status: 'passed' } })
        ]
      });

      expect(getScenarioStatus(scenario)).toBe('passed');
    });

    it('returns skipped if steps are skipped and none failed', () => {
      const scenario = createMockScenario({
        steps: [
          createMockStep({ result: { status: 'skipped' } }),
          createMockStep({ result: { status: 'skipped' } })
        ]
      });

      expect(getScenarioStatus(scenario)).toBe('skipped');
    });

    it('returns pending if steps are pending and none failed', () => {
      const scenario = createMockScenario({
        steps: [
          createMockStep({ result: { status: 'pending' } }),
          createMockStep({ result: { status: 'passed' } })
        ]
      });

      expect(getScenarioStatus(scenario)).toBe('pending');
    });

    it('returns passed for empty scenario', () => {
      const scenario = createMockScenario({ steps: [] });
      expect(getScenarioStatus(scenario)).toBe('passed');
    });
  });

  describe('calculateStats', () => {
    it('calculates correct statistics for report data', () => {
      const reportData = [
        createMockFeature({
          elements: [
            createMockScenario({
              steps: [
                createMockStep({ result: { status: 'passed' } }),
                createMockStep({ result: { status: 'passed' } })
              ]
            }),
            createMockScenario({
              steps: [
                createMockStep({ result: { status: 'failed', error_message: 'Error' } }),
                createMockStep({ result: { status: 'skipped' } })
              ]
            })
          ]
        })
      ];

      const stats = calculateStats(reportData);

      expect(stats.totalFeatures).toBe(1);
      expect(stats.totalScenarios).toBe(2);
      expect(stats.passedScenarios).toBe(1);
      expect(stats.failedScenarios).toBe(1);
      expect(stats.totalSteps).toBe(4);
      expect(stats.passedSteps).toBe(2);
      expect(stats.failedSteps).toBe(1);
      expect(stats.skippedSteps).toBe(1);
    });
  });

  describe('formatDuration', () => {
    it('formats nanoseconds to milliseconds correctly', () => {
      expect(formatDuration(1000000)).toBe('1ms');
      expect(formatDuration(1500000)).toBe('2ms');
      expect(formatDuration(500000000)).toBe('500ms');
    });

    it('handles undefined duration', () => {
      expect(formatDuration(undefined)).toBe('0ms');
    });

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0ms');
    });

    it('formats large durations to seconds', () => {
      expect(formatDuration(5000000000)).toBe('5.00s');
      expect(formatDuration(1000000000)).toBe('1.00s');
    });
  });

  describe('filterScenarios', () => {
    const feature = createMockFeature({
      elements: [
        createMockScenario({ 
          id: 'scenario-1',
          name: 'Passing scenario',
          steps: [createMockStep({ result: { status: 'passed' } })]
        }),
        createMockScenario({ 
          id: 'scenario-2',
          name: 'Failing scenario',
          steps: [createMockStep({ result: { status: 'failed', error_message: 'Error' } })]
        }),
        createMockScenario({ 
          id: 'scenario-3',
          name: 'Skipped scenario',
          steps: [createMockStep({ result: { status: 'skipped' } })]
        })
      ]
    });

    it('filters scenarios by passed status', () => {
      const filtered = filterScenarios(feature, '', 'passed');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Passing scenario');
    });

    it('filters scenarios by failed status', () => {
      const filtered = filterScenarios(feature, '', 'failed');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Failing scenario');
    });

    it('filters scenarios by skipped status', () => {
      const filtered = filterScenarios(feature, '', 'skipped');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Skipped scenario');
    });

    it('returns all scenarios when filter is "all"', () => {
      const filtered = filterScenarios(feature, '', 'all');
      expect(filtered).toHaveLength(3);
    });

    it('filters scenarios by search term', () => {
      const filtered = filterScenarios(feature, 'Passing', 'all');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Passing scenario');
    });

    it('filters scenarios by search term in steps', () => {
      const featureWithSteps = createMockFeature({
        elements: [
          createMockScenario({ 
            name: 'Test scenario',
            steps: [createMockStep({ name: 'I perform a unique action' })]
          })
        ]
      });

      const filtered = filterScenarios(featureWithSteps, 'unique action', 'all');
      expect(filtered).toHaveLength(1);
    });
  });
});
