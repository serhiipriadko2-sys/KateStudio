import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './shared/__tests__/mocks/server';

// Start MSW server before all tests, reset after each, close when done
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

if (typeof window !== 'undefined') {
  // Mock window.matchMedia
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
      dispatchEvent: () => false,
    }),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: () => {},
  });
}
