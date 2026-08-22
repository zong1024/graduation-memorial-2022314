import { useEffect, useRef, useState } from 'react'

import { markIntroSeen, shouldPlayIntro } from '../introState'
import { gsap, useGSAP } from '../motion'

type IntroSequenceProps = {
  onComplete: () => void
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(shouldPlayIntro)

  useEffect(() => {
    if (visible) markIntroSeen()
    else onComplete()
  }, [onComplete, visible])

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current
      if (!visible || !root) return

      let finished = false
      const complete = () => {
        if (finished) return
        finished = true
        setVisible(false)
      }
      const finish = contextSafe ? contextSafe(complete) : complete
      const hardStop = window.setTimeout(finish, 720)
      const bars = root.querySelectorAll('.intro-sequence__bar')
      const mark = root.querySelector('.intro-sequence__mark')
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: finish,
      })

      timeline
        .fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.2, stagger: 0.03 })
        .fromTo(mark, { yPercent: 115 }, { yPercent: 0, duration: 0.2 }, '<0.06')
        .to(mark, { yPercent: -115, duration: 0.14 }, '+=0.08')
        .to(root, { yPercent: -100, duration: 0.26 }, '<')

      const finishOnIntent = () => finish()
      window.addEventListener('pointerdown', finishOnIntent, { passive: true, once: true })
      window.addEventListener('wheel', finishOnIntent, { passive: true, once: true })
      window.addEventListener('keydown', finishOnIntent, { once: true })

      return () => {
        window.clearTimeout(hardStop)
        window.removeEventListener('pointerdown', finishOnIntent)
        window.removeEventListener('wheel', finishOnIntent)
        window.removeEventListener('keydown', finishOnIntent)
        timeline.kill()
      }
    },
    { scope: rootRef, dependencies: [visible], revertOnUpdate: true },
  )

  if (!visible) return null

  return (
    <div className="intro-sequence" ref={rootRef} aria-hidden="true">
      <div className="intro-sequence__bars">
        <span className="intro-sequence__bar" />
        <span className="intro-sequence__bar" />
        <span className="intro-sequence__bar" />
      </div>
      <div className="intro-sequence__crop">
        <span className="intro-sequence__mark">909</span>
      </div>
      <span className="intro-sequence__caption">THE NEXT CHAPTER IS LOADING</span>
    </div>
  )
}
