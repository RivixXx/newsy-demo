import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://newsy-demo.vercel.app',
    headless: true,
    screenshot: 'on',
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
});
