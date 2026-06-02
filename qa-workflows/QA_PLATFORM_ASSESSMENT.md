# Solidev Books — QA Platform Assessment & Roadmap

**Assessment Date:** 26 May 2026
**Assessment Method:** Deep codebase analysis (frontend routes, API endpoints, service layer, backend route handlers)
**Analyst:** GitHub Copilot Agent (Claude Sonnet 4.6)

---

## Executive Summary

Solidev Books is a **mature-architecture, partially-validated** platform. The core financial data model is
well-designed with strong patterns (immutable payment accumulation via `/record-payment`, proper audit
logging, tenant isolation, permission matrix). However, several high-value workflows have **never been
operationally tested** and two **critical bugs** were identified via code analysis alone.

---

## Platform Module Inventory

| Module | Routes | API | Status |
|--------|--------|-----|--------|
| Invoices | ✅ Full CRUD + detail | ✅ Full lifecycle | 🟢 Mature |
| Customers | ✅ Full CRUD + detail | ✅ Full CRUD | 🟢 Mature |
| Products / Items | ✅ Full CRUD + detail | ✅ Full lifecycle | 🟢 Mature (unit tested) |
| Quotes | ✅ Full CRUD + detail | ✅ Full lifecycle | 🟢 Mature |
| Sales Orders | ✅ Full CRUD | ✅ Full lifecycle | 🟡 Untested |
| Vendors | ✅ Full CRUD | ✅ Full CRUD | 🟡 Untested |
| Purchase Orders | ✅ Full CRUD | ✅ PO → Bill workflow | 🟡 Untested |
| Bills | ✅ Full CRUD + detail | ✅ Full lifecycle | 🟡 Untested |
| Expenses | ✅ Full CRUD + detail | ✅ Full CRUD | 🟡 Untested |
| Reports (8) | ✅ All report pages | ✅ All report APIs | 🟡 Accuracy unvalidated |
| Bank Reconciliation | ✅ Full page | ✅ Upload/match/unmatch | 🟡 Untested |
| Recurring Profiles | ✅ Full CRUD | ✅ Stored only | 🔴 Generation engine MISSING |
| Approvals | ✅ PendingApprovals page | ✅ roles_api.py | 🟡 Untested |
| Audit Logs | ✅ Full page + filters | ✅ Full logging | 🟡 Completeness unvalidated |
| Notifications | ✅ 60s polling | ✅ API | 🟡 Delivery unvalidated |
| Customer Portal | ✅ Login + dashboard + invoice | ✅ Separate auth | 🟡 Untested |
| User / Role Management | ✅ Full pages | ✅ Permission matrix | 🟡 Enforcement unvalidated |
| Settings (9 sub-pages) | ✅ All pages | ✅ All APIs | 🟡 Persistence unvalidated |
| Admin Panel | ✅ Isolated module | ✅ Super admin API | 🟡 Untested |

---

## Critical Bugs Found (Code Analysis)

### BUG-CRITICAL-001 — Zoho Payment Webhook Overwrites `amount_paid`

**File:** `smart_invoice_pro/api/payments_api.py`, lines 229–231
**Severity:** Critical — Financial Data Corruption

When Zoho Payments fires a `payment.success` webhook, the handler sets:
```python
inv["amount_paid"] = amount_paid          # OVERWRITES — does not accumulate
inv["balance_due"] = total - amount_paid  # Incorrect for partial payment history
```

The manual `/record-payment` endpoint correctly accumulates:
```python
new_amount_paid = round(float(inv.get('amount_paid', 0)) + amount, 2)  # CORRECT
```

The webhook handler does NOT follow the same pattern. If a customer makes two partial payments via Zoho
gateway, the second payment overwrites `amount_paid` to only its own value — prior payments are erased
from the balance calculation while `payment_history` continues to accumulate, creating an irreconcilable
discrepancy between `payment_history` and `amount_paid`.

**Impact:** Customers using Zoho online payments with multiple partial payments will have:
- Incorrect `balance_due` showing a higher amount than reality
- `payment_history` entries not summing to `amount_paid`
- Potential double-billing of customers

**Fix Required:**
```python
# In payments_api.py webhook handler, replace:
inv["amount_paid"] = amount_paid

# With:
inv["amount_paid"] = round(float(inv.get("amount_paid", 0)) + amount_paid, 2)
inv["balance_due"] = round(float(inv.get("total", 0)) - inv["amount_paid"], 2)
```

---

### BUG-CRITICAL-002 — Recurring Invoice Generation Engine is Missing

**File:** `smart_invoice_pro/api/cron_jobs.py`, `azure-functions/`
**Severity:** Critical — Missing Feature (Silent Failure)

Recurring profiles correctly store `next_run_date`, `auto_send`, `frequency`, and `recurrence_rule`. The
frontend shows Active/Paused states with the next scheduled run date. However:
- `cron_jobs.py` only contains `check_low_stock()` — no recurring invoice generation
- `azure-functions/` only has `LowStockAlert/` — no recurring invoice Azure Function
- No API endpoint, background task, or cron generates invoices from Active recurring profiles

**Impact:** All Active recurring profiles silently never generate invoices. Users who configure recurring
billing believe automation is running when it is not. This is a **silent failure** — no error is reported.

**Fix Required:** Add either:
1. A new Azure Function `GenerateRecurringInvoices/` triggered on a timer (daily), or
2. A new endpoint `POST /api/cron/generate-recurring` callable from a scheduler

The function should query all Active recurring profiles where `next_run_date <= today`, generate invoices
from the profile template, update `next_run_date` using `calculate_next_run_date()`, and optionally
auto-send if `auto_send == true`.

---

## Architectural Strengths (Do Not Break)

1. **Payment immutability** — `amount_paid`/`balance_due`/`payment_history` are write-protected on the
   edit endpoint; only `/record-payment` can modify payment state
2. **Overpayment protection** — `/record-payment` rejects amounts exceeding `balance_due` with HTTP 400
3. **Stock integration** — Invoice status transitions correctly deduct/return stock via `_STOCK_COMMITTED`
   states: `{Issued, Partially Paid, Paid, Overdue}`
4. **Tenant isolation** — All queries filter by `tenant_id` from JWT middleware; no cross-tenant leakage
5. **Audit trail** — `log_audit()` called on all payment events with before/after snapshots
6. **Approval workflow** — Submit → `Pending Approval` → Approve/Reject fully implemented in `roles_api.py`
7. **Webhook events** — `invoice.paid` webhook dispatches + notification created on full payment
8. **Quote-to-invoice** — Conversion preserves all line items, customer, totals, with status linkage

---

## QA Roadmap

### P0 — Critical Financial Workflows (Test First)

| Priority | File | Risk | Covers |
|----------|------|------|--------|
| P0.1 | `10-invoice-payment-integrity.md` | Financial data integrity | Partial payments, accumulation, overpayment |
| P0.2 | `11-invoice-approval-workflow.md` | Operational workflow | Submit → Approve/Reject via roles_api |
| P0.3 | `12-purchase-order-to-bill.md` | AP financial integrity | PO → Received → Bill → Pay |
| P0.4 | `13-role-permission-enforcement.md` | Security — unauthorized access | 10-module permission matrix |
| P0.5 | `14-payment-webhook-validation.md` | Financial data corruption | Validate Bug-001 Zoho webhook |

### P1 — Operational Integrity

| Priority | File | Risk | Covers |
|----------|------|------|--------|
| P1.1 | `15-bank-reconciliation.md` | Bookkeeping integrity | CSV upload → match → close |
| P1.2 | `16-customer-portal.md` | Customer-facing broken | Portal auth → invoices → payment |
| P1.3 | `17-recurring-invoice-gap.md` | Silent automation failure | Validate Bug-002 recurring gap |
| P1.4 | `18-report-accuracy.md` | Financial reporting | Cross-validate reports vs transactions |
| P1.5 | `19-multi-tenant-isolation.md` | Data security | Tenant boundary enforcement |

### P2 — Enterprise Features

| Priority | Area | Risk | Action |
|----------|------|------|--------|
| P2.1 | Sales order lifecycle | Fulfillment workflow gap | New workflow file |
| P2.2 | Audit log completeness | Compliance / auditability | Extend `08-dashboard-reports.md` |
| P2.3 | Notification delivery | Operational visibility | New workflow file |
| P2.4 | Automation / payment reminders | Operational automation | Extend `09-settings.md` |

---

## Cross-Module Dependency Map

```
Quote ──[Convert]──→ Invoice ──[record-payment]──→ Paid ──→ webhook(invoice.paid)
     └──[Convert]──→ SalesOrder                              └──→ notification

PO ──[mark_received]──→ Bill ──[Pay Bill]──→ Expense/Payment recorded

RecurringProfile ──→ [MISSING: cron/Azure Function] ──→ Invoice  ← NEVER GENERATES

Invoice ──[Submit for Approval]──→ "Pending Approval"
                                   └──[Approve]──→ "Issued"
                                   └──[Reject]──→ "Draft"
                (all via roles_api.py /api/invoices/<id>/approve)

Invoice status change ──→ _STOCK_COMMITTED check ──→ stock container updated
Invoice Paid ──→ log_audit(before_snapshot, after_snapshot) ──→ audit_logs
Invoice Paid ──→ webhook dispatch ──→ notification record created

BankTransaction ──[auto-match]──→ reconciliation record ──→ Invoice marked reconciled
BankTransaction ──[manual-match]──→ reconciliation record
reconciliation ──[close period]──→ bank account balance confirmed

Customer Portal auth → SEPARATE JWT → portal_customers container (not main users)
Admin auth → SEPARATE JWT + is_super_admin claim → admin_token localStorage key
```

---

## Enterprise Readiness Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| Recurring invoice generation | 🔴 Critical | No cron/Azure Function — silent failure |
| Zoho webhook partial payment | 🔴 Critical | Overwrites instead of accumulates |
| Credit notes / void invoice | 🟠 High | Only `Cancelled` status — no formal credit document |
| Bad debt write-off | 🟠 High | No write-off workflow |
| Overpayment / unapplied credit | 🟡 Medium | Rejected at API — no credit memo concept |
| Email delivery end-to-end | 🟡 Medium | Azure Communication Services configured, delivery untested |
| Customer portal online payment | 🟡 Medium | Portal exists, no payment button found in frontend |
| Mobile app (Flutter) | 🟡 Medium | Complete Flutter app — zero QA coverage |

---

## Recommended Execution Schedule

```
Day 1:  10-invoice-payment-integrity.md      ← financial core
Day 1:  11-invoice-approval-workflow.md      ← operational workflow
Day 2:  12-purchase-order-to-bill.md         ← AP lifecycle
Day 2:  13-role-permission-enforcement.md    ← security
Day 3:  15-bank-reconciliation.md            ← banking
Day 3:  16-customer-portal.md               ← customer-facing
Day 4:  17-recurring-invoice-gap.md          ← validate Bug-002 (expected: FAIL)
Day 4:  14-payment-webhook-validation.md     ← validate Bug-001 (expected: FAIL)
Day 5:  18-report-accuracy.md               ← financial accuracy
Day 5:  19-multi-tenant-isolation.md         ← data security
```

> **Note:** Workflows 14 and 17 are expected to **FAIL** — they validate confirmed bugs. Their value is
> in producing documented bug reports with exact reproduction steps.
