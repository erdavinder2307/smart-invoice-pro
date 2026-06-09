const fs = require('fs');
const path = require('path');

function formatBugReport(issue) {
  const lines = [
    `# ${issue.title}`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Severity** | ${issue.severity || 'Medium'} |`,
    `| **Module** | ${issue.module || 'Unknown'} |`,
    `| **Workflow** | ${issue.workflow || '—'} |`,
    `| **Run ID** | ${issue.runId || '—'} |`,
    `| **Captured** | ${new Date().toISOString()} |`,
    '',
    '## Steps to Reproduce',
    ...(issue.steps || []).map((s, i) => `${i + 1}. ${s}`),
    '',
    '## Expected',
    issue.expected || '_Not specified_',
    '',
    '## Actual',
    issue.actual || '_Not specified_',
    '',
    '## Screenshot',
    issue.screenshot ? `![evidence](${issue.screenshot})` : '_No screenshot attached_',
    '',
    '## Recommendation',
    issue.recommendation || '_Investigate root cause and add regression workflow step._',
    '',
  ];
  if (issue.validationErrors?.length) {
    lines.push('## Validation Errors', '');
    issue.validationErrors.forEach((e) => lines.push(`- ${e}`));
    lines.push('');
  }
  return lines.join('\n');
}

function writeBugReport(config, issue) {
  const runId = issue.runId || 'manual';
  const bugsDir = path.join(config.qaRoot, 'bugs', runId);
  const reportsDir = path.join(config.qaRoot, 'reports', runId);
  fs.mkdirSync(bugsDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });

  const slug = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60);
  const filename = `${Date.now()}-${slug}.md`;
  const bugPath = path.join(bugsDir, filename);
  const reportPath = path.join(reportsDir, filename);

  const content = formatBugReport(issue);
  fs.writeFileSync(bugPath, content);
  fs.writeFileSync(reportPath, content);

  return { bugPath, reportPath, content };
}

function writeWorkflowSummary(config, runId, workflowId, summary) {
  const dir = path.join(config.qaRoot, 'reports', runId);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${workflowId}-summary.json`);
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  return filePath;
}

module.exports = { formatBugReport, writeBugReport, writeWorkflowSummary };
