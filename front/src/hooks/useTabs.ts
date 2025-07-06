// Custom hook for managing VS Code-style tabs

import { useState, useCallback } from 'react';
import type { TabData, TabsHook, CucumberFeature, CucumberScenario, CucumberStep } from '../types/cucumber';

type TabItem = CucumberFeature | CucumberScenario | CucumberStep | { type: 'analytics'; name: string };

export const useTabs = (): TabsHook => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const generateTabId = (item: TabItem): string => {
    if ('type' in item && item.type === 'analytics') {
      return 'global-analytics';
    } else if ('elements' in item) {
      // This is a feature
      return `feature-${item.id}`;
    } else if ('steps' in item) {
      // This is a scenario
      return `scenario-${item.id}`;
    } else if ('result' in item) {
      // This is a step
      return `step-${item.name}-${item.line || Math.random()}`;
    }
    return `tab-${Math.random()}`;
  };

  const getTabTitle = (item: TabItem): string => {
    if ('type' in item && item.type === 'analytics') {
      return 'Global Analytics';
    } else if ('elements' in item) {
      // This is a feature
      const feature = item as CucumberFeature;
      return feature.uri?.split('/').pop() || feature.name || 'Feature';
    } else if ('steps' in item) {
      // This is a scenario
      return item.name || 'Scenario';
    } else if ('result' in item) {
      // This is a step
      const step = item as CucumberStep;
      return `${step.keyword}${step.name}`;
    }
    return 'Unknown';
  };

  const getTabType = (item: TabItem): 'feature' | 'scenario' | 'analytics' => {
    if ('type' in item && item.type === 'analytics') {
      return 'analytics';
    } else if ('elements' in item) {
      return 'feature';
    } else if ('steps' in item) {
      return 'scenario';
    }
    return 'feature'; // fallback
  };

  const openTab = useCallback((item: TabItem) => {
    const tabId = generateTabId(item);
    
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.id === tabId);
    if (existingTab) {
      // Just switch to existing tab
      setActiveTabId(tabId);
      return;
    }

    // Create new tab
    const newTab: TabData = {
      id: tabId,
      title: getTabTitle(item),
      type: getTabType(item),
      data: 'type' in item && item.type === 'analytics' ? null : item as (CucumberFeature | CucumberScenario)
    };

    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(tabId);
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to another tab
      if (tabId === activeTabId) {
        if (newTabs.length > 0) {
          // Switch to the tab to the right, or the last tab if this was the rightmost
          const closedTabIndex = prevTabs.findIndex(tab => tab.id === tabId);
          const nextTabIndex = closedTabIndex < newTabs.length ? closedTabIndex : newTabs.length - 1;
          setActiveTabId(newTabs[nextTabIndex]?.id || null);
        } else {
          setActiveTabId(null);
        }
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  const openAnalyticsTab = useCallback(() => {
    const analyticsItem = {
      type: 'analytics' as const,
      name: 'Global Analytics'
    };
    openTab(analyticsItem);
  }, [openTab]);

  return {
    tabs,
    activeTabId,
    openTab,
    openAnalyticsTab,
    closeTab,
    closeAllTabs,
    setActiveTabId
  };
};
