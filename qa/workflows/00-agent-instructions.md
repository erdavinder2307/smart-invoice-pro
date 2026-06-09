# Solidev Books — QA Agent Operating Instructions

## Process documentation (canonical)

Human and agent **QA standards** (severity, templates, workflow checklists, execution process) live at:

**`../../docs/qa/`** (repo root: `invoicing/docs/qa/`)

| Document | Use |
|----------|-----|
| `QA_SEVERITY_MATRIX.md` | Classify every defect (bookkeeping-first) |
| `QA_RESULTS_TEMPLATE.md` | Bug and test result format |
| `QA_WORKFLOW_CHECKLIST.md` | What to verify per business workflow |
| `QA_TEST_EXECUTION_PROCESS.md` | 11-step manual + agent execution |
| `QA_TESTING_GUIDELINES.md` | Principles and test types |

File bugs and reports using those templates; align `npm run qa:bug --` fields with `qa/templates/bug-report.md`.

---

## Business Objective

Enable autonomous AI agents to execute bookkeeping workflows in a real Chrome browser, validate operational finance behavior, capture evidence, and produce regression-ready artifacts.

## Environment

| Key | Value |
|-----|-------|
| Base URL (local) | `http://localhost:3000` |
| API URL (local) | `http://127.0.0.1:5001` |
| Credentials | `.env.qa` → `QA_USERNAME` / `QA_PASSWORD` |
| Viewport | 1440 × 900 |
| Browser | Chrome, **headed** (not headless) |

## Agent Behaviour Rules

1. Load workflow from `qa/workflows/<id>.md` using `npm run qa:parse -- <id>`
2. Start session: `npm run qa:run -- <id>` or Playwright MCP with `--headed`
3. Screenshot every state change → `qa/screenshots/<runId>/<workflow>/`
4. Track created entities → `qa/evidence/<runId>/entities.json`
5. Run bookkeeping validators on API responses when possible
6. On failure: screenshot + `npm run qa:bug --` with structured fields
7. Never stop mid-workflow without logging remaining steps as blocked

## Selector Strategy

1. Visible text / `getByRole` / `getByLabel`
2. `data-testid` if present
3. CSS class (last resort)

## Legacy Workflows

Extended scenarios remain in `qa-workflows/` (e.g. multi-tenant, webhooks). Prefer `qa/workflows/` for core regression.
