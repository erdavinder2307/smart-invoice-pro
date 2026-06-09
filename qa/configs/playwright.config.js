// @ts-check
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.qa') });

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: path.join(__dirname, '../engine'),
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, '../reports/playwright-html'), open: 'never' }],
  ],
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://localhost:3000',
    browserName: 'chromium',
    channel: 'chrome',
    headless: process.env.QA_HEADLESS === 'true',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  outputDir: path.join(__dirname, '../evidence/playwright-traces'),
};
