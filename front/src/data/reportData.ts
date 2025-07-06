// Global report data variable that can be modified by external scripts
// This variable will hold the cucumber report JSON data

import type { CucumberReport } from '../types/cucumber';

// Extend the Window interface to include our custom properties
declare global {
  interface Window {
    CUCUMBER_REPORT_DATA: CucumberReport | null;
    setCucumberReportData: (data: CucumberReport) => void;
    getCucumberReportData: () => CucumberReport | null;
  }
}

// Initialize with null only if it's not already defined
if (typeof window.CUCUMBER_REPORT_DATA === 'undefined') {
  window.CUCUMBER_REPORT_DATA = null;
}

// Helper function to set the report data
window.setCucumberReportData = function(data: CucumberReport) {
  window.CUCUMBER_REPORT_DATA = data;

  // Dispatch a custom event to notify components that data has changed
  const event = new CustomEvent('cucumberDataUpdated', { detail: data });
  window.dispatchEvent(event);
};

// Helper function to get the current report data
window.getCucumberReportData = function(): CucumberReport | null {
  return window.CUCUMBER_REPORT_DATA;
};

// Export the getter function for React components
export const getCucumberReportData = (): CucumberReport | null => window.CUCUMBER_REPORT_DATA;
