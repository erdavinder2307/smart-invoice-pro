const fs = require('fs');
const path = require('path');

class ScreenshotManager {
  constructor(config, runId, workflowId) {
    this.qaRoot = config.qaRoot;
    this.baseDir = path.join(config.qaRoot, 'screenshots', runId, workflowId);
    this.evidenceDir = path.join(config.qaRoot, 'evidence', runId, workflowId);
    fs.mkdirSync(this.baseDir, { recursive: true });
    fs.mkdirSync(this.evidenceDir, { recursive: true });
    this.index = [];
  }

  async capture(page, name, meta = {}) {
    const safeName = name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    const filename = `${String(this.index.length + 1).padStart(2, '0')}-${safeName}.png`;
    const filePath = path.join(this.baseDir, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    const entry = {
      name,
      filename,
      path: filePath,
      relativePath: path.relative(this.qaRoot, filePath),
      capturedAt: new Date().toISOString(),
      url: page.url(),
      ...meta,
    };
    this.index.push(entry);
    const manifestPath = path.join(this.evidenceDir, 'screenshots.json');
    fs.writeFileSync(manifestPath, JSON.stringify(this.index, null, 2));
    return entry;
  }

  list() {
    return this.index;
  }
}

module.exports = { ScreenshotManager };
