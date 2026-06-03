const fs = require('fs');
const path = require('path');
const { EntityTracker } = require('./entity-tracker');
const { ScreenshotManager } = require('./screenshot-manager');
const { writeWorkflowSummary } = require('./bug-reporter');

function createRunId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

class ExecutionContext {
  constructor(config, workflowId) {
    this.config = config;
    this.workflowId = workflowId;
    this.runId = process.env.QA_RUN_ID || createRunId();
    this.runDir = path.join(config.qaRoot, 'evidence', this.runId);
    fs.mkdirSync(this.runDir, { recursive: true });
    this.entityTracker = new EntityTracker(this.runDir);
    this.screenshots = new ScreenshotManager(config, this.runId, workflowId);
    this.log = [];
    this.failures = [];
  }

  recordStep(stepName, status, detail = {}) {
    const entry = {
      step: stepName,
      status,
      at: new Date().toISOString(),
      ...detail,
    };
    this.log.push(entry);
    if (status === 'fail') this.failures.push(entry);
    return entry;
  }

  finalize(summary = {}) {
    const payload = {
      runId: this.runId,
      workflowId: this.workflowId,
      finishedAt: new Date().toISOString(),
      steps: this.log,
      failures: this.failures,
      pass: this.failures.length === 0,
      ...summary,
    };
    writeWorkflowSummary(this.config, this.runId, this.workflowId, payload);
    const logPath = path.join(this.runDir, `${this.workflowId}-execution.log.json`);
    fs.writeFileSync(logPath, JSON.stringify(payload, null, 2));
    return payload;
  }
}

module.exports = { ExecutionContext, createRunId };
