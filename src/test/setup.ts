import { afterEach } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Configure global defaults for testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000, // 5 second default timeout for waitFor, waitForElementToBeRemoved, etc.
})

// Setup localStorage mock
function createLocalStorageMock() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

// Create and assign localStorage mock
const localStorageMock = createLocalStorageMock();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// cleanup after each test
afterEach(() => {
  cleanup()
  // Clear localStorage after each test
  localStorageMock.clear()
})

