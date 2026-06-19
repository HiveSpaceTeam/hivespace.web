import { TextDecoder, TextEncoder } from 'node:util'

Object.defineProperty(globalThis, 'TextEncoder', {
  configurable: true,
  value: TextEncoder,
})

Object.defineProperty(globalThis, 'TextDecoder', {
  configurable: true,
  value: TextDecoder,
})

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }),
  })
}

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe() {
      return undefined
    }

    unobserve() {
      return undefined
    }

    disconnect() {
      return undefined
    }
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: ResizeObserverMock,
  })
}

if (!globalThis.IntersectionObserver) {
  class IntersectionObserverMock {
    observe() {
      return undefined
    }

    unobserve() {
      return undefined
    }

    disconnect() {
      return undefined
    }

    takeRecords() {
      return []
    }
  }

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: IntersectionObserverMock,
  })
}

if (!window.scrollTo) {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: () => undefined,
  })
}
