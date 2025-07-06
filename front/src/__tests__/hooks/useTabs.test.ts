import { renderHook, act } from '@testing-library/react';
import { useTabs } from '../../hooks/useTabs';
import { createMockFeature, createMockScenario } from '../testUtils';

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
});
