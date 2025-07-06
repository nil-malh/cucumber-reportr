// Script to load Cucumber report data
// This script can be injected into the page or included as a separate script tag

import type { CucumberReport } from '../types/cucumber';

// Example usage:
// loadCucumberReport(yourJsonData);

function loadCucumberReport(jsonData: CucumberReport): boolean {
  if (typeof window !== 'undefined' && window.setCucumberReportData) {
    try {
      // Validate that the data is an array (cucumber reports are typically arrays)
      if (!Array.isArray(jsonData)) {
        console.error('Cucumber report data should be an array');
        return false;
      }
      
      // Set the data using the global function
      window.setCucumberReportData(jsonData);
      console.log('Cucumber report data loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading cucumber report data:', error);
      return false;
    }
  } else {
    console.error('Cucumber reporter not found or not ready');
    return false;
  }
}

// Example of how to load data from a JSON string
function loadCucumberReportFromString(jsonString: string): boolean {
  try {
    const data: CucumberReport = JSON.parse(jsonString);
    return loadCucumberReport(data);
  } catch (error) {
    console.error('Error parsing JSON string:', error);
    return false;
  }
}

// Example of how to load data from a URL
async function loadCucumberReportFromUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    const data: CucumberReport = await response.json();
    return loadCucumberReport(data);
  } catch (error) {
    console.error('Error loading data from URL:', error);
    return false;
  }
}

// Make functions available globally
(window as any).loadCucumberReport = loadCucumberReport;
(window as any).loadCucumberReportFromString = loadCucumberReportFromString;
(window as any).loadCucumberReportFromUrl = loadCucumberReportFromUrl;

// Export for module usage
export {
  loadCucumberReport,
  loadCucumberReportFromString,
  loadCucumberReportFromUrl
};
