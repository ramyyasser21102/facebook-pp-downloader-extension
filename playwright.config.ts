import { defineConfig } from '@playwright/test';

// Chromium-only: Playwright cannot load Firefox extensions. Run `pnpm build`
// first; the tests load `.output/chrome-mv3`.
export default defineConfig({
  testDir: 'tests/e2e',
  workers: 1,
  timeout: 30_000,
  reporter: process.env.CI ? 'github' : 'list',
});
