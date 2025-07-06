import '@testing-library/jest-dom';

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.CUCUMBER_REPORT_DATA
Object.defineProperty(window, 'CUCUMBER_REPORT_DATA', {
  writable: true,
  value: null,
});

// Mock global functions
Object.defineProperty(window, 'setCucumberReportData', {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, 'getCucumberReportData', {
  writable: true,
  value: () => null,
});
