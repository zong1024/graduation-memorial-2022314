import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type PanInfo,
} from 'motion/react'

import { featuredGalleryImages } from '../galleryImages'
import { splitGraphemes } from '../motion'
import { featuredTeacherQuotes } from '../teacherQuotes'

type HomeSection = 'top' | 'story' | 'quotes' | 'photos'

type SeasonHomeProps = {
  introComplete: boolean
  activeSection?: HomeSection
  onOpenQuotes: (trigger: HTMLButtonElement) => void
  onGallery: () => void
}

const heroSlides = [
  {
    id: 'classroom-door',
    src: '/assets/hero-classroom-909.webp',
    mobileSrc: '/assets/hero-classroom-909-portrait-630.webp',
    width: 1134,
    height: 874,
    alt: '909班教室门口与九班班牌',
    chapter: 'STARTING GRID',
    title: '九班门口',
    note: '推开门，三年的声音都在里面。',
  },
  {
    id: 'ceremony',
    src: '/assets/graduation-ceremony-20250701-1280.webp',
    mobileSrc: '/assets/graduation-ceremony-20250701-portrait-768.webp',
    width: 1280,
    height: 960,
    alt: '909毕业典礼现场合影',
    chapter: 'FINAL CEREMONY',
    title: '掌声抵达',
    note: '毕业那天，掌声和盛夏一起抵达。',
  },
  {
    id: 'group',
    src: '/assets/graduation-group.webp',
    width: 1400,
    height: 1050,
    alt: '909班级毕业合影',
    chapter: 'SIDE BY SIDE',
    title: '并肩成队',
    note: '不是站成一排，是一直站在一起。',
  },
] as const

const storyChapters = [
  {
    number: '01',
    kicker: 'THE CEREMONY',
    title: '掌声与夏日',
    date: '2025.07.01',
    caption: '毕业典礼，掌声和夏日一起抵达。',
    src: '/assets/graduation-ceremony-20250701-1280.webp',
    alt: '909毕业典礼现场合影',
    width: 1280,
    height: 960,
  },
  {
    number: '02',
    kicker: 'SIDE BY SIDE',
    title: '同桌与笑声',
    date: '2022—2025',
    caption: '把三年的同桌、名字和笑声留在同一帧。',
    src: '/assets/graduation-group.webp',
    alt: '909班级毕业合影',
    width: 1400,
    height: 1050,
  },
  {
    number: '03',
    kicker: 'OUR CLASSROOM',
    title: '平常也珍贵',
    date: 'EVERYDAY',
    caption: '熟悉的教室，收藏最平常也最珍贵的日子。',
    src: '/assets/classroom-memory.webp',
    alt: '909教室里的毕业纪念照',
    width: 1400,
    height: 787,
  },
] as const

const sectionLinks: Array<{ id: HomeSection; number: string; label: string }> = [
  { id: 'top', number: '00', label: '起点' },
  { id: 'story', number: '01', label: '三年三幕' },
  { id: 'quotes', number: '02', label: '声音档案' },
  { id: 'photos', number: '03', label: '记忆索引' },
]

const spring = { type: 'spring', stiffness: 330, damping: 34, mass: 0.82 } as const
const calmSpring = { type: 'spring', stiffness: 220, damping: 28, mass: 0.9 } as const

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="section-label" aria-hidden="true">
      <span>{number}</span>
      <i />
      <strong>{children}</strong>
    </div>
  )
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return <span aria-hidden="true">{direction === 'left' ? '←' : '→'}</span>
}

function Hero({ introComplete }: { introComplete: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const slide = heroSlides[index]
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start start', 'end start'] })
  const stageY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.045])
  const numberY = useTransform(scrollYProgress, [0, 1], ['0%', '-7%'])
  const metaY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  const selectSlide = useCallback((next: number) => {
    const normalized = (next + heroSlides.length) % heroSlides.length
    setIndex((current) => {
      if (current === normalized) return current
      setDirection(normalized > current || (current === heroSlides.length - 1 && normalized === 0) ? 1 : -1)
      return normalized
    })
  }, [])

  const move = useCallback((step: number) => {
    setDirection(step > 0 ? 1 : -1)
    setIndex((current) => (current + step + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    const next = heroSlides[(index + 1) % heroSlides.length]
    const image = new Image()
    image.src = next.src
  }, [index])

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const projected = info.offset.x + info.velocity.x * 0.14
    if (projected < -72) move(1)
    if (projected > 72) move(-1)
  }

  return (
    <section className="hero-scene" id="top" ref={rootRef} aria-labelledby="page-title">
      <motion.div
        className="hero-scene__stage"
        style={reduceMotion ? undefined : { y: stageY }}
        initial={reduceMotion || !introComplete ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
      >
        <div className="hero-scene__grid" aria-hidden="true" />
        <motion.p className="hero-scene__eyebrow" style={reduceMotion ? undefined : { y: metaY }}>
          SHENZHEN · LONGHUA / CLASS OF 2025
        </motion.p>
        <div className="hero-scene__title" aria-hidden="true">
          <strong>909 青春赛季</strong>
          <span>2022—2025 · 高峰学校</span>
        </div>

        <motion.div className="hero-scene__number" style={reduceMotion ? undefined : { y: numberY }} aria-hidden="true">
          <span className="hero-scene__digit">9</span>
          <span className="hero-scene__digit">0</span>
          <span className="hero-scene__digit">9</span>
        </motion.div>

        <div className="hero-scene__viewport">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.figure
              className="hero-scene__image-wrap"
              key={slide.id}
              custom={direction}
              variants={{
                enter: (travel: number) => ({ opacity: 0, x: travel * 80, scale: 0.97 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit: (travel: number) => ({ opacity: 0, x: travel * -80, scale: 0.98 }),
              }}
              initial={reduceMotion ? false : 'enter'}
              animate="center"
              exit={reduceMotion ? undefined : 'exit'}
              transition={reduceMotion ? { duration: 0 } : spring}
              drag={reduceMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.62}
              onDragEnd={onDragEnd}
            >
              <picture>
                {'mobileSrc' in slide ? <source media="(max-width: 620px)" srcSet={slide.mobileSrc} /> : null}
                <motion.img
                  style={reduceMotion ? undefined : { scale: imageScale }}
                  src={slide.src}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  draggable={false}
                />
              </picture>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="hero-scene__meta">
          <div aria-live="polite" aria-atomic="true">
            <span>{slide.chapter}</span>
            <strong>{slide.title}</strong>
            <p>{slide.note}</p>
          </div>
          <div className="hero-scene__controls" aria-label="首页精选照片">
            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => move(-1)} aria-label="上一张首页照片">
              <Arrow direction="left" />
            </motion.button>
            <div className="hero-scene__dots">
              {heroSlides.map((item, itemIndex) => (
                <button
                  type="button"
                  key={item.id}
                  aria-label={`选择首页照片：${item.title}`}
                  aria-current={itemIndex === index ? 'true' : undefined}
                  onClick={() => selectSlide(itemIndex)}
                ><span /></button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => move(1)} aria-label="下一张首页照片">
              <Arrow direction="right" />
            </motion.button>
          </div>
          <span className="hero-scene__counter">{String(index + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}</span>
        </div>

        <a className="hero-scene__scroll" href="#story">
          <span>SCROLL TO REPLAY</span>
          <i aria-hidden="true">↓</i>
        </a>
      </motion.div>
    </section>
  )
}

function Manifesto() {
  const lines = ['我们从同一间教室出发，', '把三年写成同一个赛季。']

  return (
    <section className="manifesto" aria-label="写给 909">
      <SectionLabel number="00">SEASON STATEMENT</SectionLabel>
      <div className="manifesto__layout">
        <h2 className="manifesto__aside">写给909</h2>
        <div className="manifesto__display">
          <span className="sr-only">我们从同一间教室出发，把三年写成同一个赛季。</span>
          {lines.map((line) => (
            <span className="manifesto__line" aria-hidden="true" key={line}>
              {splitGraphemes(line).map((character, index) => (
                <motion.span
                  className="manifesto__character"
                  key={`${character}-${index}`}
                  initial={{ opacity: 0.26 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.85 }}
                  transition={{ duration: 0.28, delay: index * 0.018 }}
                >{character}</motion.span>
              ))}
            </span>
          ))}
        </div>
        <div className="manifesto__facts" aria-label="909 数字档案">
          <div><strong>03</strong><span>YEARS<br />并肩同行</span></div>
          <div><strong>103</strong><span>QUOTES<br />课堂声音</span></div>
          <div><strong>137</strong><span>PHOTOS<br />记忆帧数</span></div>
        </div>
      </div>
    </section>
  )
}

function MemoryRun() {
  return (
    <section className="memory-run" id="story" aria-labelledby="story-title">
      <SectionLabel number="01">THREE CHAPTERS</SectionLabel>
      <header className="memory-run__heading">
        <div>
          <p>2022 — 2025 / SEASON REVIEW</p>
          <h2 id="story-title" tabIndex={-1}>把三年，重新播放一次。</h2>
        </div>
        <p>没有被定义为“重要”的每一天，后来都成了我们最想回去的地方。</p>
      </header>

      <div className="memory-run__track">
        {storyChapters.map((chapter, index) => (
          <motion.article
            className="memory-scene"
            key={chapter.number}
            initial={{ opacity: 1, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.62, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <figure>
              <img
                src={chapter.src}
                alt={chapter.alt}
                width={chapter.width}
                height={chapter.height}
                loading="lazy"
                decoding="async"
              />
              <span className="memory-scene__number" aria-hidden="true">{chapter.number}</span>
            </figure>
            <div className="memory-scene__copy">
              <div><span>{chapter.kicker}</span><time>{chapter.date}</time></div>
              <h3>{chapter.title}</h3>
              <p>{chapter.caption}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function CampusSplit() {
  return (
    <section className="campus-split" aria-labelledby="campus-split-title">
      <SectionLabel number="01.5">TWO SIDES OF 909</SectionLabel>
      <header>
        <p>同一群人，两种日常。</p>
        <h2 id="campus-split-title" aria-label="课堂内与课堂外">课堂内 / 课堂外</h2>
      </header>
      <div className="campus-split__grid">
        <motion.figure whileHover={{ y: -6 }} transition={calmSpring}>
          <img src="/assets/classroom-memory.webp" alt="909同学在教室里的日常" width="1400" height="787" loading="lazy" decoding="async" />
          <figcaption><span>01 / INSIDE</span><strong>黑板、课桌与最后一排</strong><p>那些看起来普通的课堂，组成了三年最稳定的背景音。</p></figcaption>
        </motion.figure>
        <motion.figure whileHover={{ y: -6 }} transition={calmSpring}>
          <img src={featuredGalleryImages[9].thumbnailSrc} alt={featuredGalleryImages[9].alt} width={featuredGalleryImages[9].thumbnailWidth} height={featuredGalleryImages[9].thumbnailHeight} loading="lazy" decoding="async" />
          <figcaption><span>02 / OUTSIDE</span><strong>操场、活动与放学以后</strong><p>铃声之外，我们仍在一起向前，也一起留下笑声。</p></figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

function QuoteRail({ onOpenQuotes }: Pick<SeasonHomeProps, 'onOpenQuotes'>) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const quote = featuredTeacherQuotes[index]

  const move = (step: number) => {
    setDirection(step > 0 ? 1 : -1)
    setIndex((current) => (current + step + featuredTeacherQuotes.length) % featuredTeacherQuotes.length)
  }

  return (
    <section className="quote-rail" id="quotes" aria-labelledby="quotes-title">
      <SectionLabel number="02">VOICE ARCHIVE</SectionLabel>
      <div className="quote-rail__header">
        <div><p>103 条课堂声音，仍在回响。</p><h2 id="quotes-title" tabIndex={-1}>一开口，三年都回来了。</h2></div>
        <p>首页播放 12 条精选原文，完整档案保留全部 103 条。</p>
      </div>

      <div className="quote-rail__player">
        <div className="quote-rail__index" aria-hidden="true">
          <span>{String(index + 1).padStart(2, '0')}</span><i />
          <small>{String(featuredTeacherQuotes.length).padStart(2, '0')}</small>
        </div>
        <div className="quote-rail__stage" aria-live="polite" aria-atomic="true">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.blockquote
              key={quote.id}
              custom={direction}
              variants={{
                enter: (travel: number) => ({ opacity: 0, x: travel * 46 }),
                center: { opacity: 1, x: 0 },
                exit: (travel: number) => ({ opacity: 0, x: travel * -34 }),
              }}
              initial={reduceMotion ? false : 'enter'}
              animate="center"
              exit={reduceMotion ? undefined : 'exit'}
              transition={reduceMotion ? { duration: 0 } : calmSpring}
            >
              <p>“{quote.text}”</p>
              <cite>{quote.author ? `— ${quote.author}` : '— 909 课堂'}</cite>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="quote-rail__controls">
          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => move(-1)} aria-label="上一条精选名言"><Arrow direction="left" /></motion.button>
          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => move(1)} aria-label="下一条精选名言"><Arrow direction="right" /></motion.button>
        </div>
      </div>

      <div className="quote-rail__timeline" aria-label="精选名言索引">
        {featuredTeacherQuotes.map((item, itemIndex) => (
          <button
            type="button"
            key={item.id}
            aria-label={`播放精选名言 ${itemIndex + 1}`}
            aria-current={itemIndex === index ? 'true' : undefined}
            onClick={() => {
              setDirection(itemIndex > index ? 1 : -1)
              setIndex(itemIndex)
            }}
          ><span /></button>
        ))}
      </div>

      <button className="primary-action quote-rail__archive" type="button" aria-label="查看全部 103 条" onClick={(event) => onOpenQuotes(event.currentTarget)}>
        <span>查看全部 103 条教师名言</span><i aria-hidden="true">↗</i>
      </button>
    </section>
  )
}

function MemoryIndex({ onGallery }: Pick<SeasonHomeProps, 'onGallery'>) {
  return (
    <section className="memory-index" id="photos" aria-labelledby="photos-title">
      <SectionLabel number="03">MEMORY INDEX</SectionLabel>
      <header className="memory-index__heading">
        <div><p>12 SELECTED / 137 TOTAL</p><h2 id="photos-title" tabIndex={-1}>十二个入口，<br />一百三十七帧青春。</h2></div>
        <button className="text-action" type="button" onClick={onGallery}>浏览完整照片档案 <span aria-hidden="true">→</span></button>
      </header>

      <div className="memory-index__grid">
        {featuredGalleryImages.map((image, index) => (
          <motion.button
            className="memory-index__item"
            type="button"
            key={image.id}
            aria-label={`打开完整图库：${image.caption}`}
            onClick={onGallery}
            initial={{ opacity: 1, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.985 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.48, delay: (index % 4) * 0.045, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="memory-index__media">
              <img
                src={image.thumbnailSrc}
                srcSet={`${image.thumbnailSrc} ${image.thumbnailWidth}w`}
                sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw"
                width={image.thumbnailWidth}
                height={image.thumbnailHeight}
                alt={image.alt}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="memory-index__caption"><i>{String(index + 1).padStart(2, '0')}</i><strong>{image.caption}</strong><em aria-hidden="true">↗</em></span>
          </motion.button>
        ))}
      </div>

      <button className="primary-action memory-index__all" type="button" onClick={onGallery}>
        <span>打开完整照片档案 · 137</span><i aria-hidden="true">→</i>
      </button>
    </section>
  )
}

function SeasonEnding({ onGallery }: Pick<SeasonHomeProps, 'onGallery'>) {
  return (
    <footer className="season-ending">
      <div className="season-ending__track" aria-hidden="true"><span>909</span><span>GRADUATION IS A NEW START</span><span>2025</span></div>
      <div className="season-ending__copy">
        <p>FINAL LAP / NEXT CHAPTER</p>
        <h2>毕业不是终点，<br />是下一程的发车灯。</h2>
      </div>
      <div className="season-ending__actions">
        <button type="button" onClick={onGallery}><span>打开 137 帧记忆</span><i aria-hidden="true">→</i></button>
        <a href="https://zongtech.xyz/" rel="noopener noreferrer"><span>前往个人博客</span><i aria-hidden="true">↗</i></a>
      </div>
      <div className="season-ending__meta"><span>深圳市龙华区高峰学校</span><span>Designed by ZongRui</span><span>909 / CLASS OF 2025</span></div>
    </footer>
  )
}

export function SeasonHome({
  introComplete,
  activeSection = 'top',
  onOpenQuotes,
  onGallery,
}: SeasonHomeProps) {
  const [visibleSection, setVisibleSection] = useState<HomeSection>(activeSection)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const sections = sectionLinks
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    if (!sections.length) return

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target.id) setVisibleSection(visible.target.id as HomeSection)
    }, { rootMargin: '-24% 0px -58% 0px', threshold: [0, 0.12, 0.3, 0.55] })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="season-home" id="main-content" tabIndex={-1}>
      <h1 className="sr-only" id="page-title" tabIndex={-1}>
        深圳市龙华区高峰学校2025届909毕业纪念
      </h1>

      <nav className="season-rail" aria-label="章节进度">
        {sectionLinks.map((section) => (
          <a key={section.id} href={section.id === 'top' ? '#' : `#${section.id}`} aria-current={visibleSection === section.id ? 'location' : undefined}>
            <span>{section.number}</span><i /><strong>{section.label}</strong>
          </a>
        ))}
      </nav>

      <Hero introComplete={introComplete} />
      <Manifesto />
      <MemoryRun />
      <CampusSplit />
      <QuoteRail onOpenQuotes={onOpenQuotes} />
      <MemoryIndex onGallery={onGallery} />
      <SeasonEnding onGallery={onGallery} />
    </main>
  )
}
