import '@testing-library/jest-dom/vitest'

import { afterEach } from 'vitest'

let reducedMotion = true
const mediaQueryLists = new Set<MediaQueryList>()

function queryMatches(query: string) {
  const normalized = query.toLowerCase()

  if (normalized.includes('prefers-reduced-motion: reduce')) return reducedMotion
  if (normalized.includes('prefers-reduced-motion: no-preference')) return !reducedMotion
  if (normalized.includes('hover: hover') || normalized.includes('pointer: fine')) return false
  if (normalized.includes('hover: none') || normalized.includes('pointer: coarse')) return true

  const minimumWidth = normalized.match(/min-width:\s*(\d+)px/)
  if (minimumWidth && window.innerWidth < Number(minimumWidth[1])) return false

  const maximumWidth = normalized.match(/max-width:\s*(\d+)px/)
  if (maximumWidth && window.innerWidth > Number(maximumWidth[1])) return false

  return true
}

function createMediaQueryList(query: string) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const eventListeners = new Set<EventListenerOrEventListenerObject>()

  const mediaQueryList = {
    media: query,
    onchange: null,
    get matches() {
      return queryMatches(query)
    },
    addListener(listener: ((event: MediaQueryListEvent) => void) | null) {
      if (listener) listeners.add(listener)
    },
    removeListener(listener: ((event: MediaQueryListEvent) => void) | null) {
      if (listener) listeners.delete(listener)
    },
    addEventListener(_type: string, listener: EventListenerOrEventListenerObject | null) {
      if (listener) eventListeners.add(listener)
    },
    removeEventListener(_type: string, listener: EventListenerOrEventListenerObject | null) {
      if (listener) eventListeners.delete(listener)
    },
    dispatchEvent(event: Event) {
      listeners.forEach((listener) => listener(event as MediaQueryListEvent))
      eventListeners.forEach((listener) => {
        if (typeof listener === 'function') listener(event)
        else listener.handleEvent(event)
      })
      mediaQueryList.onchange?.(event as MediaQueryListEvent)
      return true
    },
  } as MediaQueryList

  mediaQueryLists.add(mediaQueryList)
  return mediaQueryList
}

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string) => createMediaQueryList(query),
})

Object.defineProperty(document, 'fonts', {
  configurable: true,
  value: {
    ready: Promise.resolve(),
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  },
})

Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  writable: true,
  value: () => undefined,
})

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  writable: true,
  value: () => undefined,
})

Object.defineProperty(window, 'requestAnimationFrame', {
  configurable: true,
  writable: true,
  value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0),
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  configurable: true,
  writable: true,
  value: (handle: number) => window.clearTimeout(handle),
})

if (!('ResizeObserver' in window)) {
  class TestResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: TestResizeObserver,
  })
}

if (!('IntersectionObserver' in window)) {
  class TestIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly scrollMargin = '0px'
    readonly thresholds = [0]

    disconnect() {}
    observe() {}
    takeRecords() { return [] }
    unobserve() {}
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: TestIntersectionObserver,
  })
}

if (!HTMLImageElement.prototype.decode) {
  HTMLImageElement.prototype.decode = () => Promise.resolve()
}

export function setReducedMotionForTest(value: boolean) {
  const previousMatches = new Map(
    Array.from(mediaQueryLists, (mediaQueryList) => [mediaQueryList, mediaQueryList.matches] as const),
  )

  reducedMotion = value

  mediaQueryLists.forEach((mediaQueryList) => {
    if (previousMatches.get(mediaQueryList) === mediaQueryList.matches) return

    const event = new Event('change')
    Object.defineProperties(event, {
      matches: { value: mediaQueryList.matches },
      media: { value: mediaQueryList.media },
    })
    mediaQueryList.dispatchEvent(event)
  })
}

afterEach(() => {
  reducedMotion = true
  mediaQueryLists.clear()
  window.sessionStorage.clear()
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  document.documentElement.style.overflow = ''
  delete document.body.dataset.modalOpen
})
