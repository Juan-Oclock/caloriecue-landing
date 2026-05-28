import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement IntersectionObserver, which several
// fade-in / count-up components in this codebase use. Provide a no-op
// stub so component renders don't throw. Tests that need to assert
// visibility-driven behavior can override per-test.
class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds = [];
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}
