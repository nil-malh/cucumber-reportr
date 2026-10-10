import { renderHook, act } from '@testing-library/react';
import { useTabs } from '../../hooks/useTabs';
import { createMockFeature, createMockScenario, createMockStep } from '../testUtils';

describe('useTabs', () => {
  it('initializes with empty tabs', () => {
    const { result } = renderHook(() => useTabs());
    
    expect(result.current.tabs).toEqual([]);
    expect(result.current.activeTabId).toBeNull();
  });

  it('opens a new feature tab', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    
    act(() => {
      result.current.openTab(feature);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].type).toBe('feature');
    expect(result.current.activeTabId).toBe(`feature-${feature.id}`);
  });

  it('opens a new scenario tab', () => {
    const { result } = renderHook(() => useTabs());
    const scenario = createMockScenario();
    
    act(() => {
      result.current.openTab(scenario);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].type).toBe('scenario');
    expect(result.current.activeTabId).toBe(`scenario-${scenario.id}`);
  });

  it('opens analytics tab', () => {
    const { result } = renderHook(() => useTabs());
    
    act(() => {
      result.current.openAnalyticsTab();
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].type).toBe('analytics');
    expect(result.current.tabs[0].title).toBe('Global Analytics');
    expect(result.current.activeTabId).toBe('global-analytics');
  });

  it('switches between tabs', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    const scenario = createMockScenario();
    
    act(() => {
      result.current.openTab(feature);
    });

    act(() => {
      result.current.openTab(scenario);
    });

    expect(result.current.activeTabId).toBe(`scenario-${scenario.id}`);

    act(() => {
      result.current.setActiveTabId(`feature-${feature.id}`);
    });

    expect(result.current.activeTabId).toBe(`feature-${feature.id}`);
  });

  it('closes a tab', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    const scenario = createMockScenario();
    
    act(() => {
      result.current.openTab(feature);
    });

    act(() => {
      result.current.openTab(scenario);
    });

    expect(result.current.tabs).toHaveLength(2);
    expect(result.current.activeTabId).toBe(`scenario-${scenario.id}`);

    act(() => {
      result.current.closeTab(`scenario-${scenario.id}`);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeTabId).toBe(`feature-${feature.id}`);
  });

  it('closes all tabs', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    
    act(() => {
      result.current.openTab(feature);
    });

    act(() => {
      result.current.openAnalyticsTab();
    });

    expect(result.current.tabs).toHaveLength(2);

    act(() => {
      result.current.closeAllTabs();
    });

    expect(result.current.tabs).toHaveLength(0);
    expect(result.current.activeTabId).toBeNull();
  });

  it('does not add duplicate tabs', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    
    act(() => {
      result.current.openTab(feature);
    });

    act(() => {
      result.current.openTab(feature);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeTabId).toBe(`feature-${feature.id}`);
  });

  it('activates existing tab when trying to open duplicate', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    const scenario = createMockScenario();
    
    act(() => {
      result.current.openTab(feature);
    });

    act(() => {
      result.current.openTab(scenario);
    });

    expect(result.current.activeTabId).toBe(`scenario-${scenario.id}`);

    // Try to open feature again - should just activate it
    act(() => {
      result.current.openTab(feature);
    });

    expect(result.current.tabs).toHaveLength(2);
    expect(result.current.activeTabId).toBe(`feature-${feature.id}`);
  });

  it('opens a new step tab', () => {
    const { result } = renderHook(() => useTabs());
    const step = createMockStep();
    
    act(() => {
      result.current.openTab(step);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].type).toBe('step');
    expect(result.current.tabs[0].title).toBe(`${step.keyword}${step.name}`);
    expect(result.current.activeTabId).toContain('step-');
  });

  it('generates step tab id using name and line', () => {
    const { result } = renderHook(() => useTabs());
    const step = createMockStep({ name: 'my step', line: 99 });
    
    act(() => {
      result.current.openTab(step);
    });

    expect(result.current.activeTabId).toBe('step-my step-99');
  });

  it('generates step tab id with random when no line', () => {
    const { result } = renderHook(() => useTabs());
    const step = createMockStep({ name: 'no line step', line: 0 });
    
    act(() => {
      result.current.openTab(step);
    });

    expect(result.current.activeTabId).toContain('step-no line step-');
  });

  it('opens different step tabs for different steps', () => {
    const { result } = renderHook(() => useTabs());
    const step1 = createMockStep({ name: 'step one', line: 10 });
    const step2 = createMockStep({ name: 'step two', line: 20 });
    
    act(() => {
      result.current.openTab(step1);
    });

    act(() => {
      result.current.openTab(step2);
    });

    expect(result.current.tabs).toHaveLength(2);
    expect(result.current.tabs[0].type).toBe('step');
    expect(result.current.tabs[1].type).toBe('step');
  });

  it('does not add duplicate step tabs for same step', () => {
    const { result } = renderHook(() => useTabs());
    const step = createMockStep({ name: 'duplicate step', line: 42 });
    
    act(() => {
      result.current.openTab(step);
    });

    act(() => {
      result.current.openTab(step);
    });

    expect(result.current.tabs).toHaveLength(1);
  });

  it('closes a step tab and switches to remaining tab', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature();
    const step = createMockStep({ name: 'step to close', line: 42 });
    
    act(() => {
      result.current.openTab(feature);
    });

    act(() => {
      result.current.openTab(step);
    });

    expect(result.current.activeTabId).toContain('step-');

    act(() => {
      result.current.closeTab(result.current.activeTabId!);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeTabId).toBe(`feature-${feature.id}`);
  });

  it('closes active step tab when it is the only tab', () => {
    const { result } = renderHook(() => useTabs());
    const step = createMockStep({ name: 'only step', line: 42 });
    
    act(() => {
      result.current.openTab(step);
    });

    const stepTabId = result.current.activeTabId!;

    act(() => {
      result.current.closeTab(stepTabId);
    });

    expect(result.current.tabs).toHaveLength(0);
    expect(result.current.activeTabId).toBeNull();
  });

  it('handles unknown item type with fallback tab id and title', () => {
    const { result } = renderHook(() => useTabs());
    // Pass an object that doesn't match any type guard (no 'elements', 'steps', 'result', or analytics 'type')
    const unknownItem = { foo: 'bar' } as any;
    
    act(() => {
      result.current.openTab(unknownItem);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].type).toBe('feature'); // fallback type
    expect(result.current.tabs[0].title).toBe('Unknown'); // fallback title
    expect(result.current.activeTabId).toContain('tab-');
  });

  it('uses feature uri filename for feature tab title', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature({ uri: 'features/auth/login.feature' });
    
    act(() => {
      result.current.openTab(feature);
    });

    expect(result.current.tabs[0].title).toBe('login.feature');
  });

  it('uses feature name when uri has no filename', () => {
    const { result } = renderHook(() => useTabs());
    const feature = createMockFeature({ uri: '', name: 'Fallback Name Feature' });
    
    act(() => {
      result.current.openTab(feature);
    });

    expect(result.current.tabs[0].title).toBe('Fallback Name Feature');
  });

  it('uses scenario name for scenario tab title', () => {
    const { result } = renderHook(() => useTabs());
    const scenario = createMockScenario({ name: 'My Custom Scenario' });
    
    act(() => {
      result.current.openTab(scenario);
    });

    expect(result.current.tabs[0].title).toBe('My Custom Scenario');
  });
});
