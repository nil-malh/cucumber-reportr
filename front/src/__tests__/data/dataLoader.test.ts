import { 
  loadCucumberReport, 
  loadCucumberReportFromString, 
  loadCucumberReportFromUrl 
} from '../../data/dataLoader';
import { createMockReportData, createMockFeature } from '../testUtils';

// Mock fetch for URL loading tests  
Object.defineProperty(window, 'fetch', {
  writable: true,
  value: jest.fn(),
});
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock the global window object
Object.defineProperty(window, 'CUCUMBER_REPORT_DATA', {
  writable: true,
  value: null,
});

Object.defineProperty(window, 'getCucumberReportData', {
  writable: true,
  value: () => window.CUCUMBER_REPORT_DATA,
});

Object.defineProperty(window, 'setCucumberReportData', {
  writable: true,
  value: (data: any) => {
    window.CUCUMBER_REPORT_DATA = data;
    // Dispatch the custom event like the real implementation
    const event = new CustomEvent('cucumberDataUpdated', { detail: data });
    window.dispatchEvent(event);
  },
});

describe('dataLoader', () => {
  beforeEach(() => {
    window.CUCUMBER_REPORT_DATA = null;
    jest.clearAllMocks();
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadCucumberReport', () => {
    it('loads valid cucumber report data successfully', () => {
      const mockData = createMockReportData([createMockFeature()]);
      
      const result = loadCucumberReport(mockData);
      
      expect(result).toBe(true);
      expect(window.CUCUMBER_REPORT_DATA).toEqual(mockData);
      expect(console.log).toHaveBeenCalledWith('Cucumber report data loaded successfully');
    });

    it('returns false when data is not an array', () => {
      const invalidData = { not: 'an array' } as any;
      
      const result = loadCucumberReport(invalidData);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Cucumber report data should be an array');
    });

    it('returns false when setCucumberReportData is not available', () => {
      const originalSetFunction = window.setCucumberReportData;
      (window as any).setCucumberReportData = undefined;
      
      const mockData = createMockReportData([createMockFeature()]);
      const result = loadCucumberReport(mockData);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Cucumber reporter not found or not ready');
      
      // Restore the function
      window.setCucumberReportData = originalSetFunction;
    });

    it('handles errors during data setting', () => {
      const originalSetFunction = window.setCucumberReportData;
      window.setCucumberReportData = jest.fn(() => {
        throw new Error('Test error');
      });
      
      const mockData = createMockReportData([createMockFeature()]);
      const result = loadCucumberReport(mockData);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error loading cucumber report data:', expect.any(Error));
      
      // Restore the function
      window.setCucumberReportData = originalSetFunction;
    });
  });

  describe('loadCucumberReportFromString', () => {
    it('loads valid JSON string successfully', () => {
      const mockData = createMockReportData([createMockFeature()]);
      const jsonString = JSON.stringify(mockData);
      
      const result = loadCucumberReportFromString(jsonString);
      
      expect(result).toBe(true);
      expect(window.CUCUMBER_REPORT_DATA).toEqual(mockData);
    });

    it('returns false for invalid JSON string', () => {
      const invalidJson = '{ invalid json }';
      
      const result = loadCucumberReportFromString(invalidJson);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error parsing JSON string:', expect.any(Error));
    });

    it('returns false for empty string', () => {
      const result = loadCucumberReportFromString('');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error parsing JSON string:', expect.any(Error));
    });

    it('returns false when parsed data is not an array', () => {
      const nonArrayJson = JSON.stringify({ not: 'an array' });
      
      const result = loadCucumberReportFromString(nonArrayJson);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Cucumber report data should be an array');
    });
  });

  describe('loadCucumberReportFromUrl', () => {
    it('loads data from URL successfully', async () => {
      const mockData = createMockReportData([createMockFeature()]);
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockData)
      };
      mockFetch.mockResolvedValue(mockResponse as any);
      
      const result = await loadCucumberReportFromUrl('http://example.com/data.json');
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('http://example.com/data.json');
      expect(mockResponse.json).toHaveBeenCalled();
      expect(window.CUCUMBER_REPORT_DATA).toEqual(mockData);
    });

    it('returns false when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const result = await loadCucumberReportFromUrl('http://example.com/data.json');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error loading data from URL:', expect.any(Error));
    });

    it('returns false when response.json() fails', async () => {
      const mockResponse = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      mockFetch.mockResolvedValue(mockResponse as any);
      
      const result = await loadCucumberReportFromUrl('http://example.com/data.json');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error loading data from URL:', expect.any(Error));
    });

    it('returns false when URL returns non-array data', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ not: 'an array' })
      };
      mockFetch.mockResolvedValue(mockResponse as any);
      
      const result = await loadCucumberReportFromUrl('http://example.com/data.json');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Cucumber report data should be an array');
    });
  });

  describe('global function assignment', () => {
    it('assigns functions to window object', async () => {
      // Re-import to ensure global assignments are executed
      await import('../../data/dataLoader');
      
      expect((window as any).loadCucumberReport).toBeDefined();
      expect((window as any).loadCucumberReportFromString).toBeDefined();
      expect((window as any).loadCucumberReportFromUrl).toBeDefined();
    });
  });
});

// Mock the global window object
Object.defineProperty(window, 'CUCUMBER_REPORT_DATA', {
  writable: true,
  value: null,
});

Object.defineProperty(window, 'getCucumberReportData', {
  writable: true,
  value: () => window.CUCUMBER_REPORT_DATA,
});

Object.defineProperty(window, 'setCucumberReportData', {
  writable: true,
  value: (data: any) => {
    window.CUCUMBER_REPORT_DATA = data;
    // Dispatch the custom event like the real implementation
    const event = new CustomEvent('cucumberDataUpdated', { detail: data });
    window.dispatchEvent(event);
  },
});

describe('reportData', () => {
  beforeEach(() => {
    window.CUCUMBER_REPORT_DATA = null;
  });

  describe('getCucumberReportData', () => {
    it('returns data from window.CUCUMBER_REPORT_DATA when available', () => {
      const mockData = createMockReportData([createMockFeature()]);
      window.CUCUMBER_REPORT_DATA = mockData;

      const result = window.getCucumberReportData();
      expect(result).toEqual(mockData);
    });

    it('returns null when no data is available', () => {
      window.CUCUMBER_REPORT_DATA = null;

      const result = window.getCucumberReportData();
      expect(result).toBeNull();
    });
  });

  describe('setCucumberReportData', () => {
    it('sets report data correctly', () => {
      const feature = createMockFeature({
        name: 'Test Feature',
        uri: 'features/test.feature'
      });
      const reportData = [feature];

      window.setCucumberReportData(reportData);

      expect(window.CUCUMBER_REPORT_DATA).toEqual(reportData);
    });

    it('overwrites existing data', () => {
      const oldData = [createMockFeature({ name: 'Old Feature' })];
      const newData = [createMockFeature({ name: 'New Feature' })];

      window.setCucumberReportData(oldData);
      expect(window.CUCUMBER_REPORT_DATA).toEqual(oldData);

      window.setCucumberReportData(newData);
      expect(window.CUCUMBER_REPORT_DATA).toEqual(newData);
    });

    it('handles empty array', () => {
      window.setCucumberReportData([]);
      expect(window.CUCUMBER_REPORT_DATA).toEqual([]);
    });

    it('dispatches custom event when data is set', () => {
      const feature = createMockFeature();
      const mockListener = jest.fn();

      window.addEventListener('cucumberDataUpdated', mockListener);
      window.setCucumberReportData([feature]);

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cucumberDataUpdated',
          detail: [feature]
        })
      );

      window.removeEventListener('cucumberDataUpdated', mockListener);
    });
  });

  describe('data integrity', () => {
    it('maintains feature structure', () => {
      const feature = createMockFeature({
        name: 'Test Feature',
        uri: 'features/test.feature'
      });

      window.setCucumberReportData([feature]);
      const retrievedData = window.getCucumberReportData();

      expect(retrievedData).toHaveLength(1);
      expect(retrievedData?.[0].name).toBe('Test Feature');
      expect(retrievedData?.[0].uri).toBe('features/test.feature');
    });

    it('handles multiple features', () => {
      const features = [
        createMockFeature({ name: 'Feature 1' }),
        createMockFeature({ name: 'Feature 2' }),
        createMockFeature({ name: 'Feature 3' })
      ];

      window.setCucumberReportData(features);
      const retrievedData = window.getCucumberReportData();

      expect(retrievedData).toHaveLength(3);
      expect(retrievedData?.map(f => f.name)).toEqual(['Feature 1', 'Feature 2', 'Feature 3']);
    });

    it('preserves scenario and step data', () => {
      const feature = createMockFeature();

      window.setCucumberReportData([feature]);
      const retrievedData = window.getCucumberReportData();

      expect(retrievedData?.[0].elements).toBeDefined();
      expect(retrievedData?.[0].elements?.length).toBeGreaterThan(0);
      
      const scenario = retrievedData?.[0].elements?.[0];
      expect(scenario?.steps).toBeDefined();
      expect(scenario?.steps?.length).toBeGreaterThan(0);
    });
  });
});
