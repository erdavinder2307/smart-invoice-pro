const fs = require('fs');
const path = require('path');

/**
 * Parse workflow markdown into structured data for AI agents and runners.
 */
function parseWorkflowMarkdown(content, workflowId) {
  const lines = content.split('\n');
  const meta = {
    id: workflowId,
    title: '',
    businessObjective: '',
    preconditions: [],
    steps: [],
    validationRules: [],
    bookkeepingExpectations: [],
    screenshotsRequired: [],
    successCriteria: [],
    testDataFiles: [],
    routes: [],
  };

  let section = null;
  let currentStep = null;

  const flushStep = () => {
    if (currentStep) {
      meta.steps.push(currentStep);
      currentStep = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h1 = line.match(/^# (.+)/);
    if (h1 && !meta.title) {
      meta.title = h1[1].replace(/^Workflow:\s*/i, '').trim();
      continue;
    }

    const h2 = line.match(/^## (.+)/);
    if (h2) {
      flushStep();
      const name = h2[1].toLowerCase();
      if (name.includes('business objective') || name === 'objective') section = 'objective';
      else if (name.includes('precondition')) section = 'preconditions';
      else if (name === 'steps' || name.includes('workflow steps')) section = 'steps';
      else if (name.includes('validation')) section = 'validationRules';
      else if (name.includes('bookkeeping')) section = 'bookkeepingExpectations';
      else if (name.includes('screenshot')) section = 'screenshotsRequired';
      else if (name.includes('success')) section = 'successCriteria';
      else if (name.includes('test data')) section = 'testData';
      else if (name.includes('route')) section = 'routes';
      else section = null;
      continue;
    }

    const h3 = line.match(/^### (.+)/);
    if (h3 && section === 'steps') {
      flushStep();
      currentStep = {
        name: h3[1].trim(),
        actions: [],
        validations: [],
        screenshot: null,
      };
      continue;
    }

    if (!line.trim() || line.startsWith('---')) continue;

    const routeMatch = line.match(/`(\/[a-z0-9\-/:]+)`/i);
    if (routeMatch) meta.routes.push(routeMatch[1]);

    const dataFileMatch = line.match(/`([^`]+\.(csv|xlsx|json))`/i);
    if (dataFileMatch) meta.testDataFiles.push(dataFileMatch[1]);

    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+\.\s+(.+)/);
    const text = bullet ? bullet[1] : numbered ? numbered[1] : null;

    if (!text) continue;

    if (section === 'objective') meta.businessObjective += (meta.businessObjective ? ' ' : '') + text;
    else if (section === 'preconditions') meta.preconditions.push(text);
    else if (section === 'validationRules') meta.validationRules.push(text);
    else if (section === 'bookkeepingExpectations') meta.bookkeepingExpectations.push(text);
    else if (section === 'screenshotsRequired') meta.screenshotsRequired.push(text);
    else if (section === 'successCriteria') meta.successCriteria.push(text);
    else if (section === 'steps' && currentStep) {
      if (/screenshot:/i.test(text)) {
        currentStep.screenshot = text.replace(/screenshot:\s*/i, '').trim();
      } else if (/^(verify|confirm|validate|expect)/i.test(text)) {
        currentStep.validations.push(text);
      } else {
        currentStep.actions.push(text);
      }
    }
  }
  flushStep();

  return meta;
}

function loadWorkflow(workflowsDir, workflowId) {
  const filePath = path.join(workflowsDir, `${workflowId}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Workflow not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return parseWorkflowMarkdown(content, workflowId);
}

function listWorkflows(workflowsDir) {
  if (!fs.existsSync(workflowsDir)) return [];
  return fs
    .readdirSync(workflowsDir)
    .filter((f) => f.endsWith('.md') && f !== '00-agent-instructions.md')
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

module.exports = { parseWorkflowMarkdown, loadWorkflow, listWorkflows };
