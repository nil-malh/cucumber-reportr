import {
    loadCucumberReport,
    loadCucumberReportFromString,
    loadCucumberReportFromUrl,
} from '../../data/dataLoader';
import { createMockFeature } from '../testUtils';

// Mock fetch for URL loading tests
Object.defineProperty(window, 'fetch', {
    writable: true,
    value: jest.fn(),
});

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('dataLoader', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock window.setCucumberReportData
        Object.defineProperty(window, 'setCucumberReportData', {
            writable: true,
            value: jest.fn(),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('loadCucumberReport', () => {
        it('loads valid cucumber report data', () => {
            const mockData = [createMockFeature()];
            const result = loadCucumberReport(mockData);

            expect(result).toBe(true);
            expect(window.setCucumberReportData).toHaveBeenCalledWith(mockData);
            expect(mockConsoleLog).toHaveBeenCalledWith('Cucumber report data loaded successfully');
        });


        describe('loadCucumberReportFromString', () => {
            it('loads valid JSON string', () => {
                const mockData = [createMockFeature()];
                const jsonString = JSON.stringify(mockData);

                const result = loadCucumberReportFromString(jsonString);

                expect(result).toBe(true);
                expect(window.setCucumberReportData).toHaveBeenCalledWith(mockData);
            });
        });

        describe('loadCucumberReportFromUrl', () => {
            it('loads data from URL successfully', async () => {
                const mockData = [createMockFeature()];
                (window.fetch as jest.Mock).mockResolvedValue({
                    json: () => Promise.resolve(mockData),
                });

                const result = await loadCucumberReportFromUrl('http://example.com/data.json');

                expect(result).toBe(true);
                expect(window.fetch).toHaveBeenCalledWith('http://example.com/data.json');
                expect(window.setCucumberReportData).toHaveBeenCalledWith(mockData);
            });
        });
    });
});
