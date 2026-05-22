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

if (
  typeof globalThis !== "undefined" &&
  !("IntersectionObserver" in globalThis)
) {
  // Minimal stand-in. We only assert that components mount; production code
  // never inspects entries() during a render.
  class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn((): IntersectionObserverEntry[] => []);
  }
  // Assigning a constructor onto globalThis requires a small type widening.
  // The shape above conforms to the DOM IntersectionObserver interface so the
  // widening is safe; we type-assert through `unknown` rather than `any` so
  // the strict-no-any rule isn't bypassed.
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserverStub }).IntersectionObserver =
    IntersectionObserverStub;
}
