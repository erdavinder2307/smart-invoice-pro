# Invoice Lifecycle QA Bug Report

## Session Details
- **Date:** 2026-05-26
- **Workflow Executed:** qa-workflows/01-invoice-lifecycle.md
- **Base URL Tested:** http://localhost:3000
- **Tester:** GitHub Copilot Agent (GPT-5.3-Codex)
- **Browser:** Chrome (Playwright-controlled)

---

## Summary

| # | Severity | Workflow Step | Description | Evidence |
|---|----------|---------------|-------------|----------|
| 1 | High | Step 1/2 (Save as Draft, Verify Draft) | "Save as Draft" resulted in invoice status **Issued** instead of **Draft** | E2E screenshots + list/detail verification |
| 2 | High | Step 1/3 (Create/Edit invoice terms) | `payment_terms` value `net_30` is out-of-range for UI select options (`Net 30` expected) | Browser console warnings + empty terms select |
| 3 | High | Step 1/3 (Date handling) | Due date inconsistent across views: edit form showed `2026-05-25` while detail showed `25 Jun 2026` | Side-by-side flow checks |
| 4 | Critical | Step 3 (Edit invoice totals) | Total became inconsistent after edit (IGST appears effectively double-counted in final total) | Arithmetic mismatch during validation |
| 5 | Medium | Step 1/3 | Save buttons can become disabled with no inline validation guidance for missing required row item | Reproduced during draft save path |
| 6 | Medium | Step 1/3 | Numeric/spinbutton inputs append digits (e.g., `0` + typing `500` => `0500`) instead of replacing by default | Reproduced in line-item edits |
| 7 | Medium | Step 3/6 | Customer notes duplicated (`Thank you for your business.` repeated) after save/edit cycle | Detail and edit screens |
| 8 | Low | Step 6 (Payment history) | Payment history "Recorded By" shows UUID instead of user-friendly user name/email | Paid invoice detail |
| 9 | Medium | Step 3 | Edit screen status badge showed **Overdue** while detail/list showed **Issued** for same invoice state | Intra-page status mismatch |

---

## Bug Details

### BUG-001 — Save as Draft transitions invoice to Issued

**Severity:** High  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 1 Create New Invoice, 2 Verify Draft State

**Steps to Reproduce:**
1. Navigate to /invoices and create a valid invoice.
2. Click **Save as Draft**.
3. Open invoice from list/details.

**Expected Behaviour:**
Invoice status should remain **Draft**.

**Actual Behaviour:**
Invoice appears as **Issued** immediately after saving.

**Console Errors (if any):**
```text
None specific for this issue.
```

**API Errors (if any):**
```text
None observed in invoice save call path.
```

---

### BUG-002 — Terms enum mismatch (`net_30` vs UI options)

**Severity:** High  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 1 Create, 3 Edit

**Steps to Reproduce:**
1. Use a customer with persisted payment terms value `net_30`.
2. Open invoice create/edit form.
3. Observe payment terms select and due-date derivation.

**Expected Behaviour:**
Persisted value should map to valid UI option (`Net 30`) and due date should derive correctly.

**Actual Behaviour:**
Terms select becomes empty/out-of-range and warnings appear.

**Console Errors (if any):**
```text
MUI: You have provided an out-of-range value `net_30` for the select (name="payment_terms") component.
Available values: Due on Receipt, Net 7, Net 15, Net 30, Net 45.
```

**API Errors (if any):**
```text
None directly; data contract mismatch between persisted value and UI enum.
```

---

### BUG-003 — Due date inconsistent across edit/detail views

**Severity:** High  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 1/3 (Create and Edit)

**Steps to Reproduce:**
1. Open invoice details and note due date.
2. Open same invoice in edit mode.
3. Compare due date values.

**Expected Behaviour:**
Due date should be identical across views for the same invoice.

**Actual Behaviour:**
Edit form showed `2026-05-25` while detail page showed `25 Jun 2026`.

---

### BUG-004 — Total arithmetic mismatch after edit

**Severity:** Critical  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 3 Edit Invoice

**Steps to Reproduce:**
1. Edit invoice and change first line quantity from 2 to 3.
2. Save invoice.
3. Validate subtotal, tax, and total relationship.

**Expected Behaviour:**
`Total = Subtotal + Tax - Discounts +/- Round Off` exactly.

**Actual Behaviour:**
Observed total progression and intermediate values indicate IGST impact is inconsistent and effectively double-counted in one path.

---

### BUG-005 — Silent validation when Save is disabled

**Severity:** Medium  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 1 Create New Invoice

**Steps to Reproduce:**
1. Add a second row with description/amount but no selected item name.
2. Attempt save.

**Expected Behaviour:**
Inline error should explicitly indicate the invalid field.

**Actual Behaviour:**
Save buttons disable silently without clear user guidance.

---

### BUG-006 — Spinbutton/input append behavior

**Severity:** Medium  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 1/3

**Steps to Reproduce:**
1. Focus numeric field currently containing `0`.
2. Type `500`.

**Expected Behaviour:**
Field value should become `500`.

**Actual Behaviour:**
Field becomes `0500` unless user manually selects all first.

---

### BUG-007 — Notes duplication after save/edit

**Severity:** Medium  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 3 Edit, 6 Verify Paid

**Expected Behaviour:**
Single notes value should persist.

**Actual Behaviour:**
`Thank you for your business.` is duplicated as `Thank you for your business.Thank you for your business!`.

---

### BUG-008 — Payment history "Recorded By" uses UUID

**Severity:** Low  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 6 Verify Paid State

**Expected Behaviour:**
Display friendly user identity (name or email).

**Actual Behaviour:**
Displays raw UUID (`bded861f-40b5-4d1b-8e97-b2d684ab80f7`).

---

### BUG-009 — Status badge inconsistency across views

**Severity:** Medium  
**Workflow:** qa-workflows/01-invoice-lifecycle.md  
**Step:** 3 Edit Invoice

**Expected Behaviour:**
Status should be consistent between list, detail, and edit views.

**Actual Behaviour:**
Edit screen displayed **Overdue** while detail/list showed **Issued** for the same invoice snapshot.

---

## Passed Checks

- [x] Step 1 — Invoice creation flow completed with persisted invoice number (INV-01007)
- [x] Step 3 — Quantity edit (2 -> 3) persisted and line-item amount recalculated
- [x] Step 5 — Payment recording succeeded with full amount and Bank Transfer mode
- [x] Step 6 — Invoice transitioned to **Paid** and list/detail reflected paid state
- [x] Step 7 — PDF download action succeeded; local download file created (`INV-01007.pdf`)
- [x] Dashboard navigation and KPI visibility verified post-payment

---

## Observations & Notes

- Multiple Google Analytics `net::ERR_ABORTED` request failures were observed in local environment; these did not block business flow.
- UI behavior strongly suggests state/serialization normalization gaps between list/detail/edit models.
- Payment flow is functionally successful despite display-field issues.

---

## Recommended Priority for Fixes

1. **Critical (must fix before release):** BUG-004 (total arithmetic mismatch)
2. **High (fix this sprint):** BUG-001, BUG-002, BUG-003
3. **Medium (next sprint / near-term backlog):** BUG-005, BUG-006, BUG-007, BUG-009
4. **Low (nice to have):** BUG-008
