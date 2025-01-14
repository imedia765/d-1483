import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { expect, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Create a proper window object with all required properties
const window = dom.window;
const globalAny: any = global;

// Copy all enumerable properties from window to global
Object.getOwnPropertyNames(window).forEach(property => {
  if (!(property in globalAny)) {
    globalAny[property] = window[property];
  }
});

global.window = window as unknown as Window & typeof globalThis;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
} as Navigator;

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock window.matchMedia
global.window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock fetch API
global.fetch = vi.fn();
global.Headers = vi.fn();
global.Request = vi.fn();
global.Response = vi.fn() as unknown as typeof Response;

// Create a wrapper with providers for testing
export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

export { vi };