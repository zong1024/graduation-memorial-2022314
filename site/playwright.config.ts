import { defineConfig } from '@playwright/test'

const functionalTests = /^(?!.*@(?:reduced|wide-touch|desktop-only))/
const touchTests = /^(?!.*@(?:reduced|mobile-only|wide-touch|desktop-only))/
const standardTests = /^(?!.*@(?:reduced|touch|mobile-only|wide-touch))/

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  outputDir: './node_modules/.cache/playwright-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'chrome',
    locale: 'zh-CN',
    colorScheme: 'light',
    screenshot: 'off',
    video: 'off',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-1440',
      grep: standardTests,
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet-768',
      grep: touchTests,
      use: { viewport: { width: 768, height: 1024 }, hasTouch: true },
    },
    {
      name: 'mobile-390',
      grep: functionalTests,
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
    {
      name: 'mobile-reduced-motion',
      grep: /@reduced/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
    {
      name: 'wide-touch-1024',
      grep: /@wide-touch/,
      use: {
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
