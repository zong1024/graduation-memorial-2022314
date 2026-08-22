import { prefersReducedMotion } from './motion'

export const introSessionKey = '909:intro:season-v2'

export function shouldPlayIntro() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false
  try {
    return window.sessionStorage.getItem(introSessionKey) !== 'seen'
  } catch {
    return true
  }
}

export function markIntroSeen() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(introSessionKey, 'seen')
  } catch {
    // Storage can be unavailable in strict privacy contexts; the intro still works.
  }
}
