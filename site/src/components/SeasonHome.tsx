import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'

import { featuredGalleryImages, type GalleryImage } from '../galleryImages'
import { featuredTeacherQuotes } from '../teacherQuotes'

type HomeSection = 'top' | 'story' | 'quotes' | 'photos'

type SeasonHomeProps = {
  introComplete: boolean
  activeSection?: HomeSection
  onOpenQuotes: (trigger: HTMLButtonElement) => void
  onGallery: () => void
}

type MemoryFrame = Pick<
  GalleryImage,
  'id' | 'src' | 'thumbnailSrc' | 'width' | 'height' | 'alt' | 'category' | 'caption'
> & {
  title: string
  indexLabel: string
  note: string
}

const frameTitles = [
  '九班门口', '掌声抵达', '最后一排', '并肩成队', '教室晴天', '镜头之外',
  '操场回声', '青春合影', '活动时刻', '熟悉日常', '夏日留影', '下一段路',
]

const frameNotes = [
  '推开门，三年的声音都在里面。', '毕业那天，掌声和夏日一起抵达。',
  '课桌没有变，坐在这里的我们长大了。', '不是站成一排，是一直站在一起。',
  '最普通的一天，后来也变得很珍贵。', '有人看镜头，有人在笑，有人舍不得。',
  '下课铃响了，我们还没有散场。', '把名字、笑脸和盛夏留在同一帧。',
  '全力以赴的样子，也值得被记住。', '走廊、黑板和窗外，都是青春的坐标。',
  '照片会褪色，故事不会。', '毕业不是终点，只是下一程的发车灯。',
]

const categoryLabel = {
  graduation: '毕业现场', portrait: '师生合影', campus: '校园日常', activity: '活动瞬间',
} as const

const heroFrame: MemoryFrame = {
  id: 'hero-classroom',
  src: '/assets/hero-classroom-909.webp',
  thumbnailSrc: '/assets/hero-classroom-909-768.webp',
  width: 1134,
  height: 874,
  alt: '909班教室门口与九班班牌',
  category: 'campus',
  caption: '校园日常 · 九班门口',
  title: frameTitles[0],
  indexLabel: '2025 · 第 01 帧',
  note: frameNotes[0],
}

const memoryFrames: MemoryFrame[] = [
  heroFrame,
  ...featuredGalleryImages.slice(0, 11).map((image, index) => ({
    ...image,
    title: frameTitles[index + 1],
    indexLabel: `2025 · 第 ${String(index + 2).padStart(2, '0')} 帧`,
    note: frameNotes[index + 1],
  })),
]

const storyCards = [
  {
    number: '01', eyebrow: 'THE CEREMONY', title: '掌声与夏日',
    copy: '毕业典礼，掌声和夏日一起抵达。',
    src: '/assets/graduation-ceremony-20250701-1280.webp',
  },
  {
    number: '02', eyebrow: 'SIDE BY SIDE', title: '同桌与笑声',
    copy: '把三年的同桌与笑声留在这一帧。', src: '/assets/graduation-group.webp',
  },
  {
    number: '03', eyebrow: 'OUR CLASSROOM', title: '平常也珍贵',
    copy: '熟悉的教室，收藏最平常也最珍贵的日子。', src: '/assets/classroom-memory.webp',
  },
]

const spring = { type: 'spring', stiffness: 360, damping: 34, mass: 0.82 } as const
const calmSpring = { type: 'spring', stiffness: 240, damping: 30, mass: 0.9 } as const

function ArrowIcon({ direction }: { direction: 'previous' | 'next' }) {
  return <span aria-hidden="true">{direction === 'previous' ? '←' : '→'}</span>
}

export function SeasonHome({
  introComplete,
  activeSection = 'top',
  onOpenQuotes,
  onGallery,
}: SeasonHomeProps) {
  const reduceMotion = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [dockOpen, setDockOpen] = useState(false)
  const frame = memoryFrames[selectedIndex]
  const quote = featuredTeacherQuotes[selectedIndex % featuredTeacherQuotes.length]

  const selectFrame = useCallback((next: number) => {
    const normalized = (next + memoryFrames.length) % memoryFrames.length
    setSelectedIndex((current) => {
      if (current === normalized) return current
      const forwardDistance = (normalized - current + memoryFrames.length) % memoryFrames.length
      setDirection(forwardDistance <= memoryFrames.length / 2 ? 1 : -1)
      return normalized
    })
  }, [])

  const advance = useCallback((step: number) => {
    setDirection(step > 0 ? 1 : -1)
    setSelectedIndex((current) => (current + step + memoryFrames.length) % memoryFrames.length)
  }, [])

  useEffect(() => {
    if (activeSection === 'story') setDockOpen(true)
    if (activeSection === 'top') setDockOpen(false)
  }, [activeSection])

  useEffect(() => {
    const next = memoryFrames[(selectedIndex + 1) % memoryFrames.length]
    const previous = memoryFrames[(selectedIndex - 1 + memoryFrames.length) % memoryFrames.length]
    ;[next, previous].forEach((item) => {
      const image = new Image()
      image.src = item.src
    })
  }, [selectedIndex])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') advance(-1)
      if (event.key === 'ArrowRight') advance(1)
      if (event.key === 'Escape') setDockOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [advance])

  const dockShift = useMemo(() => {
    if (typeof window === 'undefined') return -148
    return window.innerWidth < 700 ? -94 : -150
  }, [])

  const onFrameDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const projected = info.offset.x + info.velocity.x * 0.16
    if (projected < -80) advance(1)
    if (projected > 80) advance(-1)
  }

  const onDockDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 74 || info.velocity.y > 620) setDockOpen(false)
  }

  return (
    <main className="memory-console" id="main-content" tabIndex={-1} data-dock-open={dockOpen || undefined}>
      <h1 className="sr-only" id="page-title" tabIndex={-1}>
        深圳市龙华区高峰学校 2025 届 909 毕业纪念
      </h1>

      <motion.header
        className="memory-headline"
        initial={reduceMotion || !introComplete ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : calmSpring}
      >
        <span>这一帧</span>
        <strong>{frame.indexLabel}</strong>
      </motion.header>

      <aside className="memory-tools" aria-label="记忆功能">
        <motion.button
          id="quotes" type="button" whileTap={{ scale: 0.93 }}
          onClick={(event) => onOpenQuotes(event.currentTarget)} aria-labelledby="quotes-title"
        >
          <span className="memory-tools__icon" aria-hidden="true">“</span>
          <span id="quotes-title" tabIndex={-1}>声音档案</span><small>103</small>
        </motion.button>
        <motion.button
          id="story" type="button" whileTap={{ scale: 0.93 }} onClick={() => setDockOpen((value) => !value)}
          aria-expanded={dockOpen} aria-controls="memory-dock" aria-labelledby="story-title"
        >
          <span className="memory-tools__icon" aria-hidden="true">＋</span>
          <span id="story-title" tabIndex={-1}>三年三幕</span><small>03</small>
        </motion.button>
      </aside>

      <motion.section
        className="memory-stage" id="top" aria-label="909 精选记忆播放器"
        animate={{ y: dockOpen ? dockShift : 0, scale: dockOpen ? 0.91 : 1 }}
        transition={reduceMotion ? { duration: 0 } : calmSpring}
      >
        <div className="memory-stage__watermark" aria-hidden="true">909</div>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.figure
            className="memory-frame" key={frame.id} custom={direction}
            variants={{
              enter: (travel: number) => ({ opacity: 0, x: travel * 120, scale: 0.94 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (travel: number) => ({ opacity: 0, x: travel * -120, scale: 0.96 }),
            }}
            initial={reduceMotion ? false : 'enter'} animate="center" exit={reduceMotion ? undefined : 'exit'}
            transition={reduceMotion ? { duration: 0 } : spring}
            drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.76}
            onDragEnd={onFrameDragEnd}
          >
            <img
              src={frame.src} alt={frame.alt} width={frame.width} height={frame.height}
              fetchPriority={selectedIndex === 0 ? 'high' : 'auto'} decoding="async" draggable={false}
            />
            <figcaption>
              <span>{categoryLabel[frame.category]}</span>
              <span>{String(selectedIndex + 1).padStart(2, '0')} / {memoryFrames.length}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </motion.section>

      <div className="memory-rail" id="photos" aria-labelledby="photos-title">
        <span className="sr-only" id="photos-title" tabIndex={-1}>记忆索引</span>
        <div className="memory-rail__label" aria-hidden="true">2022 — 2025</div>
        <div className="memory-rail__ticks">
          {memoryFrames.map((item, index) => (
            <button
              type="button" key={item.id} data-active={index === selectedIndex || undefined}
              aria-label={`选择第 ${index + 1} 帧：${item.title}`}
              aria-current={index === selectedIndex ? 'true' : undefined} onClick={() => selectFrame(index)}
            ><span /></button>
          ))}
        </div>
      </div>

      <motion.footer
        className="memory-caption" animate={{ y: dockOpen ? 120 : 0, opacity: dockOpen ? 0 : 1 }}
        transition={reduceMotion ? { duration: 0 } : calmSpring}
        aria-hidden={dockOpen || undefined} inert={dockOpen || undefined}
      >
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => advance(-1)} aria-label="上一帧">
          <ArrowIcon direction="previous" />
        </motion.button>
        <button className="memory-caption__copy" type="button" onClick={() => setDockOpen(true)}>
          <span>{frame.indexLabel}</span><strong>{frame.title}</strong><small>{frame.note}</small>
        </button>
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => advance(1)} aria-label="下一帧">
          <ArrowIcon direction="next" />
        </motion.button>
      </motion.footer>

      <AnimatePresence>
        {dockOpen ? (
          <motion.section
            className="memory-dock" id="memory-dock" role="region" aria-label="909 赛季档案"
            initial={reduceMotion ? false : { y: '110%' }} animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '110%' }}
            transition={reduceMotion ? { duration: 0 } : spring}
            drag={reduceMotion ? false : 'y'} dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.58 }} onDragEnd={onDockDragEnd}
          >
            <button className="memory-dock__handle" type="button" onClick={() => setDockOpen(false)} aria-label="收起赛季档案"><span /></button>
            <div className="memory-dock__intro">
              <span>909 / 2022—2025</span><h2>三年不是一条直线，<br />是我们并肩向前。</h2>
            </div>
            <div className="memory-dock__stories">
              {storyCards.map((story) => (
                <article key={story.number}>
                  <img src={story.src} alt="" loading="lazy" decoding="async" />
                  <div><span>{story.number} / {story.eyebrow}</span><h3>{story.title}</h3><p>{story.copy}</p></div>
                </article>
              ))}
            </div>
            <blockquote className="memory-dock__quote">
              <span>声音档案 / {quote.id}</span><p>“{quote.text}”</p>
              <cite>{quote.author ? `— ${quote.author}` : '— 909 课堂'}</cite>
              <button type="button" onClick={(event) => onOpenQuotes(event.currentTarget)}>全部 103 条 →</button>
            </blockquote>
            <div className="memory-dock__actions">
              <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onGallery}>打开 137 帧照片</motion.button>
              <a href="https://zongtech.xyz/" rel="noopener noreferrer">个人博客 ↗</a>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
