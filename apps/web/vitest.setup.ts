import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * jsdom polyfills.
 * matchMedia and IntersectionObserver are used by AuroraBackground (parallax
 * + reduced-motion checks) and StatTicker (in-view trigger). jsdom doesn't
 * ship either out of the box.
 */

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

if (typeof globalThis !== "undefined" && !("IntersectionObserver" in globalThis)) {
  class IO {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = IO;
}
