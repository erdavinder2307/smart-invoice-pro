#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../../.env.qa') });

const { loadConfig } = require('./paths');
const { loadWorkflow, listWorkflows } = require('./workflow-parser');
const { BrowserController } = require('./browser-controller');
const { ExecutionContext } = require('./execution-context');
const { loadTestData, compareExpectedActual } = require('./test-data-loader');
const { runValidation, runAllValidations } = require('./validators');
const { writeBugReport } = require('./bug-reporter');

const config = loadConfig();
const workflowsDir = path.join(config.qaRoot, 'workflows');
const testDataDir = path.join(config.qaRoot, 'test-data');

function printHelp() {
  console.log(`
Solidev Books QA OS — workflow-driven browser QA

Usage:
  node qa/engine/index.js <command> [options]

Commands:
  list                          List available workflows
  parse <workflow-id>           Output workflow as JSON for AI agents
  verify-browser                Launch headed Chrome, screenshot home page
  session login                 Open browser and log in (saves session for agent)
  run <workflow-id>             Start workflow session (login + agent plan JSON)
  regression                    Run all workflows in regression-manifest.json
  validate <type> <json-file>   Run bookkeeping validator on JSON payload
  test-data <filename>          Load and print test data (csv/xlsx/json)
  bug                           Report bug from CLI flags
  compare <json-file>           Compare expected vs actual fields in JSON

Environment (.env.qa):
  QA_BASE_URL, QA_API_URL, QA_USERNAME, QA_PASSWORD, QA_HEADLESS=false
`);
}

async function cmdVerifyBrowser() {
  const browser = new BrowserController(config);
  const ctx = new ExecutionContext(config, 'verify-browser');
  await browser.launch();
  let target = 'app-home';
  try {
    await browser.goto('/');
    await browser.page.waitForLoadState('domcontentloaded', { timeout: 8000 });
  } catch {
    await browser.goto('https://example.com');
    target = 'fallback-example-com';
  }
  await ctx.screenshots.capture(browser.page, target);
  const errors = browser.getConsoleErrors();
  await browser.close();
  const result = {
    pass: true,
    runId: ctx.runId,
    screenshot: ctx.screenshots.list()[0]?.path,
    consoleErrors: errors,
  };
  ctx.finalize(result);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

async function cmdSessionLogin() {
  const browser = new BrowserController(config);
  const ctx = new ExecutionContext(config, '01-login');
  await browser.launch();
  await browser.login();
  await ctx.screenshots.capture(browser.page, 'dashboard-after-login');
  console.log(`Session ready. Run ID: ${ctx.runId}`);
  console.log('Browser is open for agent control. Press Ctrl+C to close.');
  ctx.finalize({ pass: true, message: 'Login session established' });
  await new Promise(() => {});
}

async function cmdRun(workflowId) {
  const workflow = loadWorkflow(workflowsDir, workflowId);
  const ctx = new ExecutionContext(config, workflowId);
  const browser = new BrowserController(config);

  const plan = {
    runId: ctx.runId,
    workflow,
    agentInstructions: path.join(config.qaRoot, 'prompts', 'cursor-agent.md'),
    evidenceDir: path.join(config.qaRoot, 'evidence', ctx.runId),
    screenshotDir: path.join(config.qaRoot, 'screenshots', ctx.runId, workflowId),
  };

  await browser.launch();
  if (workflowId === '01-login' || workflow.preconditions.some((p) => /log(ged)? in/i.test(p))) {
    try {
      await browser.login();
      ctx.recordStep('login', 'pass');
      await ctx.screenshots.capture(browser.page, 'post-login-dashboard');
    } catch (err) {
      ctx.recordStep('login', 'fail', { error: err.message });
      await ctx.screenshots.capture(browser.page, 'login-failure').catch(() => {});
    }
  } else {
    await browser.goto('/');
  }

  const planPath = path.join(ctx.runDir, `${workflowId}-agent-plan.json`);
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));

  console.log('\n=== WORKFLOW PLAN (for AI agent) ===\n');
  console.log(JSON.stringify(plan, null, 2));
  console.log(`\nPlan written: ${planPath}`);
  console.log('Browser remains open for autonomous / MCP execution.');
  console.log('Use Cursor Playwright MCP or continue in this session. Ctrl+C to exit.\n');

  ctx.finalize({ pass: ctx.failures.length === 0, planPath });
  await new Promise(() => {});
}

async function cmdRegression() {
  const manifestPath = path.join(config.qaRoot, 'regression-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = [];
  for (const id of manifest.workflows) {
    const workflow = loadWorkflow(workflowsDir, id);
    results.push({ id, title: workflow.title, steps: workflow.steps.length, status: 'planned' });
  }
  const outPath = path.join(config.qaRoot, 'reports', `regression-plan-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ workflows: results }, null, 2));
  console.log(`Regression plan for ${results.length} workflows → ${outPath}`);
  console.log('Execute each with: npm run qa:run -- <workflow-id>');
}

function cmdParse(workflowId) {
  const workflow = loadWorkflow(workflowsDir, workflowId);
  console.log(JSON.stringify(workflow, null, 2));
}

function cmdValidate(type, jsonFile) {
  const payload = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const result = runValidation(type, payload);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.pass ? 0 : 1);
}

function cmdTestData(filename) {
  const data = loadTestData(testDataDir, filename);
  console.log(JSON.stringify(data, null, 2));
}

function cmdCompare(jsonFile) {
  const payload = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const { expected, actual, fields } = payload;
  const result = compareExpectedActual(expected, actual, fields || Object.keys(expected));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.pass ? 0 : 1);
}

function cmdBug(argv) {
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const issue = {
    title: get('--title') || 'Untitled QA Issue',
    severity: get('--severity') || 'Medium',
    module: get('--module') || 'General',
    workflow: get('--workflow'),
    runId: get('--run') || process.env.QA_RUN_ID,
    steps: (get('--steps') || '').split('|').filter(Boolean),
    expected: get('--expected'),
    actual: get('--actual'),
    screenshot: get('--screenshot'),
    recommendation: get('--recommendation'),
  };
  const paths = writeBugReport(config, issue);
  console.log(JSON.stringify(paths, null, 2));
}

async function main() {
  const [, , command, arg, ...rest] = process.argv;

  switch (command) {
    case 'list':
      console.log(listWorkflows(workflowsDir).join('\n'));
      break;
    case 'parse':
      if (!arg) throw new Error('workflow id required');
      cmdParse(arg);
      break;
    case 'verify-browser':
      await cmdVerifyBrowser();
      break;
    case 'session':
      if (arg === 'login') await cmdSessionLogin();
      else throw new Error('Use: session login');
      break;
    case 'run':
      if (!arg) throw new Error('workflow id required');
      await cmdRun(arg);
      break;
    case 'regression':
      await cmdRegression();
      break;
    case 'validate':
      cmdValidate(arg, rest[0]);
      break;
    case 'test-data':
      cmdTestData(arg);
      break;
    case 'compare':
      cmdCompare(arg);
      break;
    case 'bug':
      cmdBug(process.argv.slice(3));
      break;
    case 'help':
    case '--help':
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
