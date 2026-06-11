import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/mobile-overflow.spec.ts',
    },
    // モバイル実機（iPhone Safari）相当の横はみ出し回帰専用（mobile-overflow.spec.ts のみ実行）。
    // 390px（標準）と 375px（mini/SE 系の現行最小論理幅）の 2 幅で検証する
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 12'] },
      testMatch: '**/mobile-overflow.spec.ts',
    },
    {
      name: 'mobile-webkit-375',
      use: { ...devices['iPhone 11 Pro'] },
      testMatch: '**/mobile-overflow.spec.ts',
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
      },
})
