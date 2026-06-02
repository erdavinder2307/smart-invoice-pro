# Workflow 10: Invoice Payment Integrity

**Risk Level:** 🔴 P0 — Financial Data Integrity  
**Estimated Duration:** 45 minutes  
**Prerequisites:** At least one invoice in `Issued` status with a known total amount  

---

## Objective

Verify that the manual payment recording system correctly **accumulates** partial payments into
`amount_paid`, correctly reduces `balance_due`, prevents overpayment, and records all payments
in `payment_history`. Validate that status transitions (Issued → Partially Paid → Paid) are automatic.

---

## Setup

1. Log in as Admin user
2. Navigate to **Invoices** → create a new invoice for `$300.00` total  
   - Customer: any existing customer  
   - Add 3 line items × $100.00 each  
   - Save as Draft, then mark as **Issued**
3. Note the invoice number (e.g., `INV-0042`)

---

## Test Cases

### TC-10.1: First Partial Payment

**Steps:**
1. Open invoice `INV-0042` (status: Issued, balance_due: $300.00)
2. Click **Record Payment**
3. Enter amount: `100.00`, date: today, method: Bank Transfer, note: "Partial 1"
4. Click **Save**

**Expected:**
- Status changes to **Partially Paid**
- `amount_paid` shows `$100.00`
- `balance_due` shows `$200.00`
- Payment history shows 1 entry: `$100.00 — Bank Transfer — today`
- Toast: "Payment recorded"

**Screenshot:** `TC-10-1-partial-payment-1.png`

---

### TC-10.2: Second Partial Payment Accumulates (Not Overwrites)

**Steps:**
1. Open the same invoice (status: Partially Paid)
2. Click **Record Payment**
3. Enter amount: `75.00`, method: Cash, note: "Partial 2"
4. Click **Save**

**Expected:**
- Status stays **Partially Paid**
- `amount_paid` shows `$175.00` (100 + 75, not 75 alone)
- `balance_due` shows `$125.00`
- Payment history shows 2 entries

**Screenshot:** `TC-10-2-accumulation-check.png`

> **CRITICAL CHECK:** If `amount_paid` shows `$75.00` instead of `$175.00`, this matches
> Bug-CRITICAL-001. Document as a critical failure.

---

### TC-10.3: Final Payment Triggers Paid Status

**Steps:**
1. Open the same invoice (status: Partially Paid, balance_due: $125.00)
2. Click **Record Payment**
3. Enter exact balance: `125.00`
4. Click **Save**

**Expected:**
- Status changes to **Paid**
- `amount_paid` shows `$300.00`
- `balance_due` shows `$0.00`
- Payment history shows 3 entries totalling $300.00
- Invoice cannot be edited (payment fields locked)

**Screenshot:** `TC-10-3-paid-status.png`

---

### TC-10.4: Overpayment is Rejected

**Steps:**
1. Create a new invoice for $50.00, mark as Issued
2. Click **Record Payment**
3. Enter amount: `100.00` (double the total)
4. Click **Save**

**Expected:**
- API returns error (HTTP 400)
- UI shows error message (e.g., "Payment exceeds balance due")
- Invoice status unchanged (still Issued)
- `amount_paid` unchanged at `$0.00`

**Screenshot:** `TC-10-4-overpayment-rejection.png`

---

### TC-10.5: Payment on Paid Invoice is Blocked

**Steps:**
1. Open the invoice from TC-10.3 (status: Paid)
2. Verify the **Record Payment** button is absent or disabled

**Expected:**
- No "Record Payment" button visible, OR
- Button disabled / shows tooltip "Invoice is already paid"

**Screenshot:** `TC-10-5-paid-invoice-no-payment-button.png`

---

### TC-10.6: Payment History Audit Entries

**Steps:**
1. Navigate to **Audit Logs** (Settings → Audit Log)
2. Filter by Invoice: `INV-0042`
3. Review all audit entries

**Expected:**
- 3 entries with action `payment`
- Each entry shows `before` snapshot (old amount_paid) and `after` snapshot (new amount_paid)
- User who recorded each payment is logged
- Timestamps are accurate

**Screenshot:** `TC-10-6-audit-log-payments.png`

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| Payment 1 balance | $200.00 | Any other amount |
| Payment 2 accumulated | $175.00 | Shows $75.00 (overwrite bug) |
| Final balance | $0.00 | Any non-zero amount |
| Status after full pay | Paid | Any other status |
| Overpayment response | 400 error | 200 or 201 success |
| Audit log entries | 3 entries | Missing or incorrect entries |
