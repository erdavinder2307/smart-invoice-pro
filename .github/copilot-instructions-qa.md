# Solidev Books — QA Agent Mode Instructions

## When to Apply
Apply these instructions when the user asks to:
- "run QA", "test the app", "execute workflow", "qa test"
- "check [feature] works", "validate [workflow]"
- "find bugs in [feature]"
- Any browser-based testing request

## QA Execution Process

### 1. Load workflow file
Read the relevant file from `qa-workflows/` before starting.

### 2. Start the app (if not running)
```bash
# Frontend
cd smart-invoice-pro && npm start &
# Backend
cd smart-invoice-pro-api-2 && source venv/bin/activate && python main.py &
```

### 3. Authenticate
Navigate to http://localhost:3000, log in using test credentials, confirm dashboard loads.

### 4. Execute workflow steps
- Use browser tools: navigate, click, type, screenshot at every significant state change
- Save screenshots to `qa-screenshots/<workflow-name>/step-NN-<description>.png`
- Capture all anomalies: wrong status, missing data, console errors, broken layout

### 5. Produce bug report
At the end, write a bug report to `qa-screenshots/<workflow-name>/bug-report.md`
using the template in `qa-workflows/99-bug-report-template.md`.

## Screenshot Naming Convention
```
qa-screenshots/
  01-invoice-lifecycle/
    step-01-draft-invoice.png
    step-02-sent-invoice.png
    step-03-payment-dialog.png
    step-04-paid-status.png
    bug-report.md
```

## Severity Classification
| Severity | Definition |
|----------|-----------|
| Critical | Data loss, authentication bypass, crash, financial calculation error |
| High | Feature broken, workflow cannot complete, wrong totals |
| Medium | UI glitch, wrong status badge, poor UX, missing validation |
| Low | Cosmetic issue, minor wording, non-blocking |
