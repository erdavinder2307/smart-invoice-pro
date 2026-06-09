const path = require('path');
const fs = require('fs');

const QA_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(QA_ROOT, '..');

function loadConfig() {
  const configPath = path.join(QA_ROOT, 'configs', 'qa.default.json');
  const defaults = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return {
    ...defaults,
    baseUrl: process.env.QA_BASE_URL || defaults.baseUrl,
    apiUrl: process.env.QA_API_URL || defaults.apiUrl,
    headed: process.env.QA_HEADLESS !== 'true' && defaults.headed,
    qaRoot: QA_ROOT,
    projectRoot: PROJECT_ROOT,
  };
}

function resolveFromProject(relativePath) {
  return path.join(PROJECT_ROOT, relativePath);
}

module.exports = { QA_ROOT, PROJECT_ROOT, loadConfig, resolveFromProject };
