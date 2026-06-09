# Cursor Agent — Solidev Books QA

You are executing **workflow-driven QA** for Solidev Books. Do not write one-off Playwright test files unless fixing the QA engine itself.

## Start

1. Read `qa/workflows/00-agent-instructions.md`
2. Load workflow: `npm run qa:parse -- <workflow-id>`
3. Start browser session: `npm run qa:run -- <workflow-id>` OR use **Playwright MCP** (`chrome`, `--headed`)
4. Credentials from `.env.qa`

## During execution

- Follow **business steps** in the workflow markdown (not brittle CSS-only scripts)
- Screenshot after each state change → `qa/screenshots/<runId>/<workflow>/`
- Track entities in `qa/evidence/<runId>/entities.json`
- Validate totals with `npm run qa:validate -- invoice <json-file>`
- On failure: `npm run qa:bug -- --title "..." --severity High --module Invoices --steps "step1|step2" --expected "..." --actual "..." --screenshot path`

## MCP tools

Prefer in order:

1. **Playwright MCP** — `browser_navigate`, `browser_click`, `browser_snapshot`, screenshots
2. **cursor-ide-browser** — exploratory testing when Playwright MCP unavailable

## Regression

```bash
npm run qa:regression    # plan all core workflows
npm run qa:run -- 01-login
npm run qa:run -- 11-invoice-lifecycle-full
```

## Rerun failed workflow

1. Read `qa/reports/<runId>/<workflow>-summary.json`
2. Fix blocker or note env issue
3. Re-run with same `QA_RUN_ID` if continuing: `QA_RUN_ID=20260503-120000 npm run qa:run -- 05-invoices`
