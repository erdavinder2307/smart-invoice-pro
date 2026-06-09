const { chromium } = require('@playwright/test');
const path = require('path');

class BrowserController {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.consoleErrors = [];
  }

  async launch() {
    const headed = this.config.headed !== false && process.env.QA_HEADLESS !== 'true';
    this.browser = await chromium.launch({
      channel: 'chrome',
      headless: !headed,
    });
    this.context = await this.browser.newContext({
      viewport: this.config.viewport || { width: 1440, height: 900 },
      baseURL: this.config.baseUrl,
    });
    this.page = await this.context.newPage();
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push({ text: msg.text(), url: this.page?.url() });
      }
    });
    return this.page;
  }

  async goto(route = '/') {
    const url = route.startsWith('http') ? route : new URL(route, this.config.baseUrl).href;
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    return this.page;
  }

  async login(credentials = {}) {
    const username = credentials.username || process.env.QA_USERNAME;
    const password = credentials.password || process.env.QA_PASSWORD;
    if (!username || !password) {
      throw new Error('QA_USERNAME and QA_PASSWORD required (set in .env.qa)');
    }
    await this.goto('/login');
    await this.page.getByLabel(/username|email/i).first().fill(username);
    await this.page.getByLabel(/^password$/i).first().fill(password);
    await this.page.getByRole('button', { name: /sign in|log in/i }).click();
    await this.page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    return this.page;
  }

  async close() {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    this.page = null;
  }

  getConsoleErrors() {
    return this.consoleErrors;
  }
}

module.exports = { BrowserController };
