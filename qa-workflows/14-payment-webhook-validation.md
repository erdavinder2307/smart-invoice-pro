# Workflow 14: Payment Webhook Validation (Bug-Critical-001)

**Risk Level:** 🔴 P0 — Financial Data Corruption  
**Estimated Duration:** 30 minutes  
**Prerequisites:** Zoho Payments integration configured in Settings → Integrations  

> **Note:** This workflow is expected to **FAIL**. It exists to produce a reproducible bug report
> for Bug-CRITICAL-001: Zoho webhook handler overwrites `amount_paid` instead of accumulating it.

---

## Objective

Reproduce and document the financial data corruption bug in the Zoho Payments webhook handler.
The bug causes `amount_paid` to reflect only the most recent payment instead of the running total
when a customer makes multiple partial payments via Zoho online payment.

**Bug location:** `smart_invoice_pro/api/payments_api.py`, lines 229–231

**Buggy code:**
```python
inv["amount_paid"] = amount_paid          # OVERWRITES ← BUG
inv["balance_due"] = total - amount_paid  # Incorrect for accumulated payments
```

**Expected correct code:**
```python
inv["amount_paid"] = round(float(inv.get("amount_paid", 0)) + amount_paid, 2)  # ACCUMULATE
inv["balance_due"] = round(float(inv.get("total", 0)) - inv["amount_paid"], 2)
```

---

## Setup

1. Confirm Zoho Payments is enabled in Settings → Integrations
2. Have test payment credentials (Zoho sandbox/test mode)
3. Create an invoice for $200.00, status: Issued
4. Note the invoice ID and number (e.g., `INV-0200`)

---

## Test Cases

### TC-14.1: First Zoho Payment (Baseline)

**Steps:**
1. Open invoice `INV-0200` and click the online payment link
2. Complete a $100.00 payment via Zoho test gateway
3. Wait for webhook to fire (check server logs)
4. Refresh the invoice page

**Expected (if bug is NOT present):**
- `amount_paid` = $100.00
- `balance_due` = $100.00
- Status: Partially Paid
- Payment history: 1 entry, $100.00

**Expected (confirming current state):**
- `amount_paid` = $100.00 (correct — first payment, no overwrite ambiguity yet)
- Status: Partially Paid

**Screenshot:** `TC-14-1-first-zoho-payment.png`

---

### TC-14.2: Second Zoho Payment — Bug Reproduction

**Steps:**
1. Open invoice `INV-0200` (status: Partially Paid, amount_paid: $100.00, balance_due: $100.00)
2. Complete a second payment of $50.00 via Zoho test gateway
3. Wait for webhook to fire
4. Refresh the invoice page

**Expected (CORRECT behaviour — if bug were fixed):**
- `amount_paid` = $150.00 (100 + 50, accumulated)
- `balance_due` = $50.00
- Payment history: 2 entries totalling $150.00

**Actual (BUG — expected to observe):**
- `amount_paid` = $50.00 (overwritten — WRONG)
- `balance_due` = $150.00 (WRONG — appears as if first payment never happened)
- Payment history: 2 entries but `amount_paid` = $50.00 (irreconcilable discrepancy)

**Screenshot:** `TC-14-2-second-zoho-payment-overwrite.png`

> **DOCUMENT IF CONFIRMED:** Record the exact values seen, server log excerpt showing the
> webhook payload, and the resulting Cosmos DB document state.

---

### TC-14.3: Verify Discrepancy in Payment History vs amount_paid

**Steps:**
1. (After TC-14.2) View the invoice detail page
2. Open payment history section
3. Sum all payment history entries
4. Compare to `amount_paid` field

**Expected (bug confirmed):**
- Sum of payment_history entries = $150.00
- `amount_paid` field = $50.00
- Discrepancy = $100.00 (the first payment is "lost" from amount_paid)

**Screenshot:** `TC-14-3-discrepancy-payment-history.png`

---

### TC-14.4: Audit Log Shows the Overwrite

**Steps:**
1. Navigate to **Audit Logs** → filter by invoice `INV-0200`
2. Look for the second webhook payment entry

**Expected:**
- Audit log entry shows `before.amount_paid = 100.00`, `after.amount_paid = 50.00`
- This is impossible for a legitimate accumulation — it should INCREASE
- The decrease proves the overwrite bug

**Screenshot:** `TC-14-4-audit-log-overwrite-evidence.png`

---

## Bug Report Template (Complete After Running)

```
Bug ID: BUG-CRITICAL-001
Title: Zoho payment webhook overwrites amount_paid instead of accumulating

Reproduction Steps:
1. Create invoice for $200.00 (status: Issued)
2. Process $100.00 Zoho payment → amount_paid = $100.00 (correct)
3. Process $50.00 Zoho payment → amount_paid = $50.00 (WRONG, should be $150.00)

Actual: amount_paid = $50.00, balance_due = $150.00
Expected: amount_paid = $150.00, balance_due = $50.00

Root Cause: payments_api.py line 230 uses assignment (=) not accumulation (+=)

Fix: inv["amount_paid"] = round(float(inv.get("amount_paid", 0)) + amount_paid, 2)

Severity: Critical — Financial Data Corruption
Affects: All tenants using Zoho Payments with partial payment scenarios
```

---

## Workaround (Until Fixed)

Manual payment recording via `/record-payment` accumulates correctly. Advise all users using
Zoho online payments to avoid multiple partial payments until the webhook handler is patched.

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition (Bug Confirmed) |
|-------|----------|-------------------------------|
| After payment 1: amount_paid | $100.00 | Anything else |
| After payment 2: amount_paid | $150.00 | $50.00 (overwrite bug) |
| Payment history sum vs amount_paid | Equal | Discrepancy exists |
| Audit log: payment 2 change | +$50.00 increase | -$50.00 decrease |

> If all four "FAIL Condition" observations are confirmed, Bug-CRITICAL-001 is reproduced.
> File the bug report immediately and block the Zoho Payments feature until fixed.
