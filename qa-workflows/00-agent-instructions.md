# Solidev Books — QA Agent Instructions

## Environment

| Key | Value |
|-----|-------|
| Base URL (local) | http://localhost:3000 |
| Base URL (staging) | Set per session |
| API URL (local) | http://127.0.0.1:5001 |
| Test user | See `.env.qa` (gitignored) — `QA_USERNAME` / `QA_PASSWORD` |
| Viewport | 1440 x 900 |

## Agent Behaviour Rules

1. **Always start fresh** — begin each workflow by navigating to the base URL
2. **Screenshot every state change** — after navigation, form submission, dialog, modal, or status update
3. **Save screenshots** to `qa-screenshots/<workflow-name>/step-NN-description.png`
4. **Log all anomalies** — unexpected redirects, console errors, wrong status badges, missing data
5. **Verify data integrity** — calculated totals must match line item sums; status badges must match document state
6. **Test both happy path and edge cases** — as defined in each workflow file
7. **Produce a bug report** at the end of each workflow run using the template in `99-bug-report-template.md`
8. **Never stop mid-workflow** — if a step fails, log the failure, take a screenshot, and continue with the remaining steps

## Selector Strategy (Priority Order)

1. Visible text / label (`getByText`, `getByLabel`)
2. ARIA role (`getByRole`)
3. `data-testid` attribute
4. CSS class (last resort)

## Verification Checklist (Apply to Every Workflow)

- [ ] Page title / heading matches expected
- [ ] No error toasts or banners visible
- [ ] Status badges show correct color and text
- [ ] Calculated totals are arithmetically correct
- [ ] Navigation breadcrumbs are correct
- [ ] Action buttons are enabled/disabled appropriately
- [ ] Empty states show correct placeholder (not blank screen)
- [ ] No console errors (check via Playwright `page.on('console')`)
