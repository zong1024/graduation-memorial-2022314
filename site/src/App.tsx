import { useCallback, useEffect, useRef, useState } from 'react'

import { GalleryArchive } from './components/GalleryArchive'
import { IntroSequence } from './components/IntroSequence'
import { QuoteArchive } from './components/QuoteArchive'
import { SeasonHome } from './components/SeasonHome'
import { SiteChrome, type NavigationTarget } from './components/SiteChrome'
import { prefersReducedMotion, ScrollTrigger } from './motion'
import { teacherQuotes } from './teacherQuotes'
import { shouldPlayIntro } from './introState'

type HomeSection = Exclude<NavigationTarget, 'gallery'>
type Route =
  | { view: 'home'; section: HomeSection }
  | { view: 'gallery' }

const homeSections = new Set<HomeSection>(['top', 'story', 'quotes', 'photos'])

function routeFromLocation(): Route {
  if (typeof window === 'undefined') return { view: 'home', section: 'top' }

  const hash = window.location.hash.slice(1)
  if (hash === 'gallery') return { view: 'gallery' }
  if (homeSections.has(hash as HomeSection)) return { view: 'home', section: hash as HomeSection }
  return { view: 'home', section: 'top' }
}

function urlForTarget(target: NavigationTarget) {
  const base = `${window.location.pathname}${window.location.search}`
  if (target === 'top') return base
  return `${base}#${target}`
}

const focusTargetBySection: Record<HomeSection, string> = {
  top: 'page-title',
  story: 'story-title',
  quotes: 'quotes-title',
  photos: 'photos-title',
}

function focusWithoutScrolling(element: HTMLElement | null) {
  if (!element) return
  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

function App() {
  const [route, setRoute] = useState<Route>(routeFromLocation)
  const [showQuotes, setShowQuotes] = useState(false)
  const [introComplete, setIntroComplete] = useState(() => !shouldPlayIntro())
  const quoteTriggerRef = useRef<HTMLButtonElement | null>(null)
  const scrollBehaviorRef = useRef<ScrollBehavior>('auto')
  const scrollRequestRef = useRef(0)
  const handleIntroComplete = useCallback(() => setIntroComplete(true), [])
  const getQuoteTrigger = useCallback(() => quoteTriggerRef.current, [])

  const scrollToRoute = useCallback((nextRoute: Route, behavior: ScrollBehavior) => {
    const requestId = ++scrollRequestRef.current
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (requestId !== scrollRequestRef.current) return
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return

        let heading: HTMLElement | null = null
        ScrollTrigger.refresh()

        if (nextRoute.view === 'gallery') {
          heading = document.getElementById('gallery-title')
          window.scrollTo({ top: 0, behavior })
        } else {
          const section = document.getElementById(nextRoute.section)
          heading = document.getElementById(focusTargetBySection[nextRoute.section])
          if (nextRoute.section === 'top') {
            window.scrollTo({ top: 0, behavior })
          } else {
            section?.scrollIntoView({ block: 'start', behavior })
          }
        }

        window.requestAnimationFrame(() => {
          if (requestId !== scrollRequestRef.current) return
          if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
          focusWithoutScrolling(heading)
        })
      })
    })
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      scrollBehaviorRef.current = 'auto'
      setRoute(routeFromLocation())
    }

    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)
    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  useEffect(() => {
    const requestedBehavior = scrollBehaviorRef.current
    const behavior = prefersReducedMotion() ? 'auto' : requestedBehavior
    scrollBehaviorRef.current = 'auto'
    scrollToRoute(route, behavior)
    document.title = route.view === 'gallery'
      ? '909 照片档案｜高峰学校 2025 届毕业纪念'
      : '909 青春赛季｜高峰学校 2025 届毕业纪念'
  }, [route, scrollToRoute])

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
    }
  }, [])

  const navigate = useCallback((target: NavigationTarget) => {
    const nextRoute: Route = target === 'gallery'
      ? { view: 'gallery' }
      : { view: 'home', section: target }
    const nextUrl = urlForTarget(target)
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'

    if (currentUrl === nextUrl) {
      scrollToRoute(nextRoute, behavior)
      return
    }

    window.history.pushState(null, '', nextUrl)
    scrollBehaviorRef.current = behavior
    setRoute(nextRoute)
  }, [scrollToRoute])

  return (
    <div className="memorial-page">
      <IntroSequence onComplete={handleIntroComplete} />
      <div
        className="site-surface"
        aria-hidden={showQuotes ? true : undefined}
        inert={showQuotes ? true : undefined}
      >
        <SiteChrome
          currentView={route.view}
          currentSection={route.view === 'home' ? route.section : undefined}
          onNavigate={navigate}
        />
        {route.view === 'gallery' ? (
          <GalleryArchive onHome={() => navigate('top')} />
        ) : (
          <SeasonHome
            introComplete={introComplete}
            activeSection={route.section}
            onOpenQuotes={(trigger) => {
              quoteTriggerRef.current = trigger
              setShowQuotes(true)
            }}
            onGallery={() => navigate('gallery')}
          />
        )}
      </div>
      {showQuotes ? (
        <QuoteArchive
          teacherQuotes={teacherQuotes}
          onClose={() => setShowQuotes(false)}
          returnFocus={getQuoteTrigger}
        />
      ) : null}
    </div>
  )
}

export default App
