import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

const outputDir = process.argv[2] ?? path.resolve('visual-audit-output')
const baseURL = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173'

const allProfiles = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
  { name: 'desktop-wide', viewport: { width: 1887, height: 1179 } },
  { name: 'tablet-768', viewport: { width: 768, height: 1024 }, hasTouch: true },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
  { name: 'wide-touch-1024', viewport: { width: 1024, height: 768 }, hasTouch: true },
  { name: 'mobile-reduced', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' },
]
const requestedProfiles = new Set((process.env.AUDIT_PROFILES ?? '').split(',').filter(Boolean))
const profiles = requestedProfiles.size > 0
  ? allProfiles.filter(({ name }) => requestedProfiles.has(name))
  : allProfiles
const stopWait = Number(process.env.AUDIT_STOP_WAIT ?? 350)

const homepageStops = [
  ['hero', '#top'],
  ['manifesto', '.manifesto'],
  ['story', '#story'],
  ['campus-split', '.campus-split'],
  ['quotes', '#quotes'],
  ['photos', '#photos'],
  ['ending', '.season-ending'],
]

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function settle(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.locator('.intro-sequence').waitFor({ state: 'detached', timeout: 1_500 }).catch(() => {})
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect()
      return rect.bottom >= -window.innerHeight && rect.top <= window.innerHeight * 2
    }).map((image) => image.decode().catch(() => undefined)))
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
  await sleep(160)
}

async function scan(page, label) {
  return page.evaluate((scanLabel) => {
    const isVisible = (element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0.02
        && rect.width > 0
        && rect.height > 0
        && rect.bottom >= -2
        && rect.top <= window.innerHeight + 2
    }

    const describe = (element, text = '') => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: typeof element.className === 'string' ? element.className : undefined,
      text: text.trim().replace(/\s+/g, ' ').slice(0, 100),
    })

    const textRects = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      if (!node.textContent?.trim()) continue
      const owner = node.parentElement
      if (!owner || !isVisible(owner) || owner.closest('.sr-only,[aria-hidden="true"]')) continue
      const style = getComputedStyle(owner)
      if (style.position === 'fixed' && owner.closest('.site-chrome')) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width < 1 || rect.height < 1 || rect.bottom < -2 || rect.top > innerHeight + 2) continue
        textRects.push({ owner, text: node.textContent, rect })
      }
    }

    const collisions = []
    for (let firstIndex = 0; firstIndex < textRects.length; firstIndex += 1) {
      const first = textRects[firstIndex]
      for (let secondIndex = firstIndex + 1; secondIndex < textRects.length; secondIndex += 1) {
        const second = textRects[secondIndex]
        if (first.owner === second.owner || first.owner.contains(second.owner) || second.owner.contains(first.owner)) continue
        if (first.owner.closest('.hero-scene__number,.season-ending__number,.quote-animation-layer')) continue
        if (second.owner.closest('.hero-scene__number,.season-ending__number,.quote-animation-layer')) continue
        const width = Math.min(first.rect.right, second.rect.right) - Math.max(first.rect.left, second.rect.left)
        const height = Math.min(first.rect.bottom, second.rect.bottom) - Math.max(first.rect.top, second.rect.top)
        if (width <= 2 || height <= 2 || width * height <= 18) continue
        collisions.push({
          first: describe(first.owner, first.text),
          second: describe(second.owner, second.text),
          overlap: { width: Math.round(width), height: Math.round(height) },
        })
      }
    }

    const clippedText = []
    for (const item of textRects) {
      let ancestor = item.owner
      while (ancestor && ancestor !== document.body) {
        const style = getComputedStyle(ancestor)
        if (/(hidden|clip)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`)) {
          const bounds = ancestor.getBoundingClientRect()
          const clippedX = item.rect.left < bounds.left - 1 || item.rect.right > bounds.right + 1
          const clippedY = item.rect.top < bounds.top - 1 || item.rect.bottom > bounds.bottom + 1
          if (clippedX || clippedY) {
            clippedText.push({
              content: describe(item.owner, item.text),
              clipAncestor: describe(ancestor),
              clippedX,
              clippedY,
            })
            break
          }
        }
        ancestor = ancestor.parentElement
      }
    }

    const tinyInteractive = Array.from(document.querySelectorAll('a,button,[role="button"]'))
      .filter(isVisible)
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width < 44 || rect.height < 44)
      .map(({ element, rect }) => ({ ...describe(element, element.textContent ?? ''), width: Math.round(rect.width), height: Math.round(rect.height) }))

    return {
      label: scanLabel,
      scrollY: Math.round(scrollY),
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      },
      collisions: collisions.slice(0, 80),
      clippedText: clippedText.filter((item, index, all) => (
        index === all.findIndex((other) => JSON.stringify(other) === JSON.stringify(item))
      )).slice(0, 80),
      tinyInteractive: tinyInteractive.slice(0, 80),
    }
  }, label)
}

async function screenshotStop(page, profileName, stopName, selector, findings) {
  const locator = page.locator(selector).first()
  if (await locator.count() === 0) return
  await locator.scrollIntoViewIfNeeded()
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await sleep(stopWait)
  const file = path.join(outputDir, `${profileName}-${stopName}.png`)
  await page.screenshot({ path: file, animations: 'disabled' })
  findings.push(await scan(page, stopName))
}

await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const report = {}

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      hasTouch: profile.hasTouch,
      isMobile: profile.isMobile,
      reducedMotion: profile.reducedMotion,
      locale: 'zh-CN',
      colorScheme: 'light',
    })
    const page = await context.newPage()
    const consoleProblems = []
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(`${message.type()}: ${message.text()}`)
    })
    page.on('pageerror', (error) => consoleProblems.push(`pageerror: ${error.message}`))

    const findings = []
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
    await settle(page)
    for (const [stopName, selector] of homepageStops) {
      await screenshotStop(page, profile.name, stopName, selector, findings)
    }

    await page.getByRole('button', { name: '打开网站目录' }).click()
    await sleep(stopWait)
    await page.screenshot({ path: path.join(outputDir, `${profile.name}-menu.png`), animations: 'disabled' })
    findings.push(await scan(page, 'menu'))
    await page.keyboard.press('Escape')

    await page.locator('#quotes').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: /查看全部 103 条/ }).click()
    await sleep(stopWait)
    await page.screenshot({ path: path.join(outputDir, `${profile.name}-quote-archive.png`), animations: 'disabled' })
    findings.push(await scan(page, 'quote-archive'))
    await page.keyboard.press('Escape')

    await page.goto(`${baseURL}/#gallery`, { waitUntil: 'domcontentloaded' })
    await settle(page)
    await page.waitForFunction(() => window.location.hash === '#gallery' && Boolean(document.querySelector('.gallery-archive')))
    await screenshotStop(page, profile.name, 'gallery-header', '.gallery-archive-header', findings)
    await screenshotStop(page, profile.name, 'gallery-grid', '.gallery-grid-item:nth-child(6)', findings)
    const photo = page.getByRole('button', { name: /查看照片/ }).first()
    await photo.click()
    await sleep(stopWait)
    await page.screenshot({ path: path.join(outputDir, `${profile.name}-lightbox.png`), animations: 'disabled' })
    findings.push(await scan(page, 'lightbox'))
    await page.keyboard.press('Escape')

    report[profile.name] = { findings, consoleProblems }
    await context.close()
  }
} finally {
  await browser.close()
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(path.join(outputDir, 'report.json'))
