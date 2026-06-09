const { test, expect } = require('@playwright/test');
const path = require('path');

test('QA OS — Chrome headed smoke', async ({ page }, testInfo) => {
  const baseURL = process.env.QA_BASE_URL || 'http://localhost:3000';
  await page.goto(baseURL);
  await expect(page).toHaveTitle(/.+/);
  const shotDir = path.join(__dirname, '../screenshots/_verify');
  await page.screenshot({
    path: path.join(shotDir, `verify-${testInfo.project.name}.png`),
    fullPage: true,
  });
});
