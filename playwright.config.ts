import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Carrega .env.local PRIMEIRO (credenciais reais, gitignored), com fallback a .env
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

export default defineConfig({
  testDir: './automation/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['./automation/tests/bugs/_reporter.ts'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: 'https://www.kasa.live',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    {
      name: 'perf',
      testDir: './automation/tests/performance',
      use: {
        ...devices['Desktop Chrome'],
        // playwright-lighthouse exige porta CDP exposta
        launchOptions: { args: ['--remote-debugging-port=9222'] },
      },
    },
  ],
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
});
