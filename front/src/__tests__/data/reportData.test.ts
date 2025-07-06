import { getCucumberReportData } from '../../data/reportData';
import { createMockReportData, createMockFeature } from '../testUtils';
import type { CucumberReport } from '../../types/cucumber';

describe('reportData', () => {
  let originalCucumberReportData: any;
  let originalSetCucumberReportData: any;
  let originalGetCucumberReportData: any;

  beforeEach(() => {
    // Store original values
    originalCucumberReportData = (window as any).CUCUMBER_REPORT_DATA;
    originalSetCucumberReportData = (window as any).setCucumberReportData;
    originalGetCucumberReportData = (window as any).getCucumberReportData;

    // Reset window properties
    delete (window as any).CUCUMBER_REPORT_DATA;
    delete (window as any).setCucumberReportData;
    delete (window as any).getCucumberReportData;

    // Clear module cache and re-import to trigger initialization
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original values
    (window as any).CUCUMBER_REPORT_DATA = originalCucumberReportData;
    (window as any).setCucumberReportData = originalSetCucumberReportData;
    (window as any).getCucumberReportData = originalGetCucumberReportData;
  });

  describe('initialization', () => {
    it('should initialize CUCUMBER_REPORT_DATA with null if undefined', async () => {
      await import('../../data/reportData');
      expect((window as any).CUCUMBER_REPORT_DATA).toBeNull();
    });

    it('should not overwrite existing CUCUMBER_REPORT_DATA', async () => {
      const existingData = createMockReportData();
      (window as any).CUCUMBER_REPORT_DATA = existingData;

      // Re-import to trigger initialization logic
      await import('../../data/reportData');

      expect((window as any).CUCUMBER_REPORT_DATA).toBe(existingData);
    });

    it('should define setCucumberReportData function on window', async () => {
      await import('../../data/reportData');
      expect(typeof (window as any).setCucumberReportData).toBe('function');
    });

    it('should define getCucumberReportData function on window', async () => {
      await import('../../data/reportData');
      expect(typeof (window as any).getCucumberReportData).toBe('function');
    });
  });

  describe('setCucumberReportData', () => {
    let dispatchEventSpy: jest.SpyInstance;

    beforeEach(async () => {
      await import('../../data/reportData');
      dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    });

    afterEach(() => {
      dispatchEventSpy.mockRestore();
    });

    it('should set CUCUMBER_REPORT_DATA with provided data', () => {
      const mockData = createMockReportData();
      
      (window as any).setCucumberReportData(mockData);
      
      expect((window as any).CUCUMBER_REPORT_DATA).toBe(mockData);
    });

    it('should dispatch cucumberDataUpdated event with data', () => {
      const mockData = createMockReportData();
      
      (window as any).setCucumberReportData(mockData);
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cucumberDataUpdated',
          detail: mockData
        })
      );
    });

    it('should handle empty report data', () => {
      const emptyData: CucumberReport = [];

      (window as any).setCucumberReportData(emptyData);
      
      expect((window as any).CUCUMBER_REPORT_DATA).toBe(emptyData);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cucumberDataUpdated',
          detail: emptyData
        })
      );
    });
  });

  describe('getCucumberReportData (window function)', () => {
    beforeEach(async () => {
      await import('../../data/reportData');
    });

    it('should return null when no data is set', () => {
      expect((window as any).getCucumberReportData()).toBeNull();
    });

    it('should return the current report data', () => {
      const mockData = createMockReportData();
      (window as any).CUCUMBER_REPORT_DATA = mockData;
      
      expect((window as any).getCucumberReportData()).toBe(mockData);
    });

    it('should return updated data after setCucumberReportData is called', () => {
      const mockData = createMockReportData();
      
      (window as any).setCucumberReportData(mockData);
      
      expect((window as any).getCucumberReportData()).toBe(mockData);
    });
  });

  describe('getCucumberReportData (exported function)', () => {
    beforeEach(async () => {
      await import('../../data/reportData');
    });

    it('should return null when no data is set', () => {
      expect(getCucumberReportData()).toBeNull();
    });

    it('should return the current report data', () => {
      const mockData = createMockReportData();
      (window as any).CUCUMBER_REPORT_DATA = mockData;
      
      expect(getCucumberReportData()).toBe(mockData);
    });

    it('should return updated data after setCucumberReportData is called', () => {
      const mockData = createMockReportData();
      
      (window as any).setCucumberReportData(mockData);
      
      expect(getCucumberReportData()).toBe(mockData);
    });
  });

  describe('event dispatching', () => {
    let dispatchEventSpy: jest.SpyInstance;

    beforeEach(async () => {
      await import('../../data/reportData');
      dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    });

    afterEach(() => {
      dispatchEventSpy.mockRestore();
    });

    it('should create CustomEvent with correct type and detail', () => {
      const mockData = createMockReportData();
      
      (window as any).setCucumberReportData(mockData);
      
      const calledEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(calledEvent.type).toBe('cucumberDataUpdated');
      expect(calledEvent.detail).toBe(mockData);
      expect(calledEvent instanceof CustomEvent).toBe(true);
    });

    it('should dispatch event with complex feature data', () => {
      const complexFeature = createMockFeature();
      const mockData = [complexFeature];
      
      (window as any).setCucumberReportData(mockData);
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cucumberDataUpdated',
          detail: mockData
        })
      );
    });
  });
});
