import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './motolife_tests',

  fullyParallel: false,

  retries: process.env.CI ? 1 : 0,

  timeout: 60 * 1000,

  use: {
    baseURL: 'https://motolife.rootdevs.xyz',
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  expect: {
    timeout: 10_000,
  },

  globalSetup: require.resolve('./motolife_tests/global.setup.ts'),

  projects: [
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'motolife_tests/.auth/session.json',
      },
    },
  ],

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});