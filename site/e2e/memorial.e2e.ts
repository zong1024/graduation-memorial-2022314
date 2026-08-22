import { expect, test, type Page } from '@playwright/test'

const homeHeadingName = '深圳市龙华区高峰学校2025届909毕业纪念'

async function openHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const heading = page.getByRole('heading', { name: homeHeadingName })
  await expect(heading).toBeAttached()
  await expect(heading).toBeFocused()
  return heading
}

async function openGallery(page: Page) {
  await page.goto('/#gallery', { waitUntil: 'domcontentloaded' })
  const heading = page.getByRole('heading', { name: /909\s*照片档案/ })
  await expect(heading).toBeAttached()
  await expect(heading).toBeFocused()
  return heading
}

const delay = (milliseconds: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, milliseconds)
})

async function dragPageUp(page: Page, holdTouch = false) {
  const session = await page.context().newCDPSession(page)
  const startY = 700
  const endY = 180
  const x = 195
  const steps = 4

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: startY, radiusX: 8, radiusY: 8, force: 1, id: 1 }],
  })

  for (let index = 1; index <= steps; index += 1) {
    const y = startY + ((endY - startY) * index / steps)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y, radiusX: 8, radiusY: 8, force: 1, id: 1 }],
    })
    await delay(8)
  }

  const whileTouching = await page.evaluate(() => ({
    introVisible: Boolean(document.querySelector('.intro-sequence')),
    scrollY: Math.round(window.scrollY),
  }))

  if (!holdTouch) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }

  return {
    session,
    whileTouching,
    release: () => session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  }
}

test('home exposes the complete story and twelve memory-index entries', async ({ page }) => {
  await openHome(page)

  await expect(page.getByRole('heading', { name: '把三年，重新播放一次。' })).toBeAttached()
  await expect(page.getByRole('heading', { name: /十二个入口/ })).toBeAttached()
  const featuredItems = page.locator('.memory-index__item')
  await expect(featuredItems).toHaveCount(12)
  await expect(featuredItems.first()).toHaveAttribute('aria-label', /^打开完整图库：/)
  await expect(featuredItems.first().locator('img')).toHaveAttribute('src', /\/assets\/gallery\/thumbs\/gallery-\d+\.webp$/)
  await expect(page.getByRole('link', { name: /个人博客/ }).first()).toHaveAttribute('href', 'https://zongtech.xyz/')
})

test('menu traps focus, closes with Escape, and routes to a home chapter', async ({ page }) => {
  await openHome(page)
  const trigger = page.getByRole('button', { name: '打开网站目录' })

  await trigger.click()
  const menu = page.getByRole('dialog', { name: '网站目录' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('button', { name: '关闭网站目录' })).toBeFocused()
  await expect(page.locator('#main-content')).toHaveAttribute('inert', '')
  await expect(page.locator('.site-mark')).toHaveAttribute('inert', '')

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await menu.getByRole('button', { name: /三年三幕/ }).click()
  await expect(page).toHaveURL(/#story$/)
  await expect(page.getByRole('heading', { name: '把三年，重新播放一次。' })).toBeFocused()
})

test('skip link focuses the current main without changing the route', async ({ page }) => {
  await openHome(page)
  const skipLink = page.getByRole('link', { name: '跳到主要内容' })
  await skipLink.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page).not.toHaveURL(/#main-content$/)

  await openGallery(page)
  await skipLink.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page).toHaveURL(/#gallery$/)
  await expect(page.locator('.gallery-archive')).toBeVisible()
})

test('quote archive restores focus to its trigger', async ({ page }) => {
  await openHome(page)
  const trigger = page.getByRole('button', { name: /查看全部 103 条/ })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: /教师名言档案/ })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('direct gallery route keeps thumbnail order and the lightbox uses originals', async ({ page }) => {
  await openGallery(page)

  const photoButtons = page.getByRole('button', { name: /查看照片/ })
  const thumbnails = page.locator('.gallery-grid img')
  await expect(photoButtons).toHaveCount(137)
  await expect(thumbnails).toHaveCount(137)
  await expect(thumbnails.first()).toHaveAttribute('src', /\/assets\/gallery\/thumbs\/gallery-\d+\.webp$/)

  const firstPhoto = photoButtons.first()
  await firstPhoto.click()
  const lightbox = page.getByRole('dialog', { name: '照片查看器' })
  await expect(lightbox).toBeVisible()
  await expect(lightbox.getByRole('img')).toHaveAttribute('src', /\/assets\/gallery\/gallery-\d+\.webp/)
  await expect(lightbox.getByText('1 / 137', { exact: true })).toBeVisible()
  await expect(lightbox.getByRole('button', { name: '关闭照片查看器' })).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(lightbox.getByText('2 / 137', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(lightbox).toBeHidden()
  await expect(firstPhoto).toBeFocused()
})

test('lightbox swipe advances and reverses on touch @touch', async ({ page }) => {
  await openGallery(page)
  await page.getByRole('button', { name: /查看照片/ }).first().click()

  const lightbox = page.getByRole('dialog', { name: '照片查看器' })
  const stage = lightbox.locator('.photo-lightbox-stage')
  await expect(lightbox.getByText('1 / 137', { exact: true })).toBeVisible()

  await stage.evaluate((element) => {
    const start = new Touch({ identifier: 1, target: element, clientX: 320, clientY: 280 })
    const end = new Touch({ identifier: 1, target: element, clientX: 90, clientY: 285 })
    element.dispatchEvent(new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [start],
      changedTouches: [start],
    }))
    element.dispatchEvent(new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      changedTouches: [end],
    }))
  })
  await expect(lightbox.getByText('2 / 137', { exact: true })).toBeVisible()

  await stage.evaluate((element) => {
    const start = new Touch({ identifier: 2, target: element, clientX: 90, clientY: 280 })
    const end = new Touch({ identifier: 2, target: element, clientX: 320, clientY: 285 })
    element.dispatchEvent(new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [start],
      changedTouches: [start],
    }))
    element.dispatchEvent(new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      changedTouches: [end],
    }))
  })
  await expect(lightbox.getByText('1 / 137', { exact: true })).toBeVisible()
})

test('browser back and forward preserve the gallery hash route', async ({ page }) => {
  await openHome(page)

  await page.getByRole('button', { name: /打开完整照片档案/ }).click()
  await expect(page).toHaveURL(/#gallery$/)
  await expect(page.getByRole('heading', { name: /909\s*照片档案/ })).toBeFocused()

  await page.goBack()
  await expect(page).not.toHaveURL(/#gallery$/)
  await expect(page.getByRole('heading', { name: homeHeadingName })).toBeFocused()

  await page.goForward()
  await expect(page).toHaveURL(/#gallery$/)
  await expect(page.getByRole('heading', { name: /909\s*照片档案/ })).toBeFocused()
})

test('home and gallery never create horizontal page overflow', async ({ page }) => {
  const hasNoHorizontalOverflow = () => page.evaluate(() => (
    document.documentElement.scrollWidth <= window.innerWidth + 1
  ))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect.poll(hasNoHorizontalOverflow).toBe(true)

  await page.goto('/#gallery', { waitUntil: 'domcontentloaded' })
  await expect.poll(hasNoHorizontalOverflow).toBe(true)
})

test('sticky gallery filters remain below the fixed chrome and clickable', async ({ page }) => {
  await openGallery(page)
  const filter = page.getByRole('button', { name: /^全部 137$/ })
  await page.locator('.gallery-grid-item').nth(6).scrollIntoViewIfNeeded()

  await expect.poll(() => filter.evaluate((element) => {
    const filterRect = element.getBoundingClientRect()
    const chromeElements = Array.from(document.querySelectorAll<HTMLElement>('.site-mark, .site-chrome__actions'))
    const chromeBottom = Math.max(...chromeElements.map((item) => item.getBoundingClientRect().bottom))
    return filterRect.top >= chromeBottom
  })).toBe(true)

  expect(await filter.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    return hit === element || element.contains(hit)
  })).toBe(true)
})

test('intro leaves within 1.2s while native touch can scroll @mobile-only', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' })
  const intro = page.locator('.intro-sequence')
  await page.waitForFunction(() => {
    const element = document.querySelector<HTMLElement>('.intro-sequence')
    if (!element) return false
    const style = getComputedStyle(element)
    return style.display !== 'none' && style.visibility !== 'hidden'
  }, undefined, { polling: 'raf' })

  const introSeenAt = Date.now()
  const scrollingPolicy = await intro.evaluate((element) => ({
    overlayPointerEvents: getComputedStyle(element).pointerEvents,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    touchAction: getComputedStyle(document.documentElement).touchAction,
  }))
  expect(scrollingPolicy.overlayPointerEvents).toBe('none')
  expect(scrollingPolicy.htmlOverflowY).not.toBe('hidden')
  expect(scrollingPolicy.bodyOverflowY).not.toBe('hidden')
  expect(scrollingPolicy.touchAction).not.toBe('none')

  const { whileTouching, release } = await dragPageUp(page, true)
  expect(whileTouching.scrollY).toBeGreaterThan(0)
  await release()

  const remainingBudget = 1_200 - (Date.now() - introSeenAt)
  expect(remainingBudget).toBeGreaterThan(0)
  await expect(intro).toHaveCount(0, { timeout: remainingBudget })
})

test('mobile hero transforms with scroll without creating a pin spacer @mobile-only', async ({ page }) => {
  await openHome(page)
  await delay(1_300)

  const heroSelectors = [
    '.hero-scene__stage',
    '.hero-scene__image-wrap',
    '.hero-scene__number',
    '.hero-scene__meta',
  ]
  const readTransforms = () => page.evaluate((selectors) => selectors.map((selector) => {
    const element = document.querySelector(selector)
    return element ? getComputedStyle(element).transform : null
  }), heroSelectors)
  const before = await readTransforms()

  expect(await page.locator('.pin-spacer').count()).toBe(0)
  await dragPageUp(page)
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0)
  await expect.poll(async () => JSON.stringify(await readTransforms())).not.toBe(JSON.stringify(before))
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
})

test('intro plays once per tab session', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const intro = page.locator('.intro-sequence')
  await expect(intro).toBeVisible()
  await expect(intro).toHaveCount(0, { timeout: 1_200 })

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(intro).toHaveCount(0)
})

test('intro has no console errors or missing GSAP target warning @mobile-only', async ({ page }) => {
  const consoleProblems: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleProblems.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const intro = page.locator('.intro-sequence')
  await expect(intro).toBeVisible()
  await expect(intro).toHaveCount(0, { timeout: 1_200 })
  await page.waitForLoadState('load')
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))

  expect(consoleProblems.filter((message) => message.includes('GSAP target .intro-sequence not found'))).toEqual([])
  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(intro).toHaveCount(0)
  expect(consoleProblems).toEqual([])
  expect(pageErrors).toEqual([])
})

test('wide coarse touch never pins the hero or MemoryRun @wide-touch', async ({ page }) => {
  await openHome(page)
  await expect.poll(() => page.evaluate(() => (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  ))).toBe(true)

  const memoryRun = page.locator('.memory-run')
  await expect(memoryRun).toBeAttached()
  await memoryRun.scrollIntoViewIfNeeded()
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))

  await expect(page.locator('.hero-scene .pin-spacer')).toHaveCount(0)
  await expect(memoryRun.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
})

test('desktop resize keeps native scroll and all story chapters visible @desktop-only', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 })
  await openHome(page)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)

  await page.setViewportSize({ width: 800, height: 800 })
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect.poll(() => page.locator('.memory-scene').evaluateAll((scenes) => scenes.map((scene) => {
    const style = getComputedStyle(scene)
    return { opacity: style.opacity, visibility: style.visibility, position: style.position }
  }))).toEqual([
    { opacity: '1', visibility: 'visible', position: 'relative' },
    { opacity: '1', visibility: 'visible', position: 'relative' },
    { opacity: '1', visibility: 'visible', position: 'relative' },
  ])

  await page.setViewportSize({ width: 1000, height: 800 })
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.memory-scene')).toHaveCount(3)
})

test('runtime reduced-motion change keeps native scroll and visible content @desktop-only', async ({ page }) => {
  await openHome(page)
  await page.locator('.manifesto').scrollIntoViewIfNeeded()
  await delay(60)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect.poll(() => page.locator('.manifesto__character').evaluateAll((characters) => characters.every((character) => {
    const style = getComputedStyle(character)
    return style.opacity === '1' && style.visibility === 'visible' && style.transform === 'none'
  }))).toBe(true)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.memory-index__item')).toHaveCount(12)
})

test('short landscape ending keeps actions clear of the title @mobile-only', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await openHome(page)
  const ending = page.locator('.season-ending')
  await ending.scrollIntoViewIfNeeded()
  const overlaps = await ending.evaluate((element) => {
    const title = element.querySelector('h2')?.getBoundingClientRect()
    const actions = element.querySelector('.season-ending__actions')?.getBoundingClientRect()
    if (!title || !actions) return true
    return title.right > actions.left && title.left < actions.right && title.bottom > actions.top && title.top < actions.bottom
  })
  expect(overlaps).toBe(false)
})

test('mobile display headings do not clip or overlap their own lines @mobile-only', async ({ page }) => {
  await openHome(page)
  const viewportWidth = page.viewportSize()?.width ?? 390
  const manifestoLines = page.locator('.manifesto__line')
  await manifestoLines.first().scrollIntoViewIfNeeded()
  const lineBoxes = await manifestoLines.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect()
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
  }))
  expect(lineBoxes.every((box) => box.left >= -1 && box.right <= viewportWidth + 1)).toBe(true)
  expect(lineBoxes.slice(1).every((box, index) => box.top >= lineBoxes[index].bottom - 1)).toBe(true)

  for (const selector of ['.memory-run__heading h2', '.memory-index__heading h2', '.season-ending__copy h2']) {
    const heading = page.locator(selector)
    await heading.scrollIntoViewIfNeeded()
    const textLines = await heading.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return Array.from(range.getClientRects())
        .filter((rect) => rect.width > 0.5 && rect.height > 0.5)
        .map((rect) => ({
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        }))
    })
    expect(textLines.length, selector).toBeGreaterThan(0)
    expect(textLines.every((line) => line.left >= -1 && line.right <= viewportWidth + 1), selector).toBe(true)
    expect(
      textLines.slice(1).every((line, index) => line.top >= textLines[index].bottom - 1),
      `${selector}: ${JSON.stringify(textLines)}`,
    ).toBe(true)
  }
})

test('lightbox shows a cached preview while the original loads', async ({ page }) => {
  await page.route(/\/assets\/gallery\/gallery-\d+\.webp/, async (route) => {
    await delay(450)
    await route.continue()
  })
  await openGallery(page)
  await page.getByRole('button', { name: /查看照片/ }).first().click()
  const media = page.locator('.photo-lightbox-media')
  await expect(media).toHaveAttribute('aria-busy', 'true')
  await expect(media.locator('.photo-lightbox-placeholder')).toBeVisible()
  await expect(media).toHaveAttribute('aria-busy', 'false', { timeout: 8_000 })
  await expect(media.locator('.photo-lightbox-image')).toHaveCSS('opacity', '1')
})

test('reduced motion keeps content available without intro or pinned spacers @reduced', async ({ page }) => {
  await openHome(page)

  await expect.poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  await expect(page.locator('.intro-sequence')).toHaveCount(0)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.memory-index__item')).toHaveCount(12)

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.intro-sequence')).toHaveCount(0)

  await page.getByRole('button', { name: '打开网站目录' }).click()
  await page.getByRole('dialog', { name: '网站目录' }).getByRole('button', { name: /记忆索引/ }).click()
  await expect(page).toHaveURL(/#photos$/)
  await expect(page.getByRole('heading', { name: /十二个入口/ })).toBeFocused()
})
