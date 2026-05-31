import '@testing-library/jest-dom'

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver {
    private callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: { width: 1000, height: 600, top: 0, left: 0, right: 1000, bottom: 600, x: 0, y: 0 } as DOMRectReadOnly,
            borderBoxSize: [{ blockSize: 600, inlineSize: 1000 }],
            contentBoxSize: [{ blockSize: 600, inlineSize: 1000 }],
            devicePixelContentBoxSize: [{ blockSize: 600, inlineSize: 1000 }],
          } as ResizeObserverEntry,
        ],
        this,
      )
    }
    unobserve() {}
    disconnect() {}
  },
})

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
})
