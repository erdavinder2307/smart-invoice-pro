# Workflow 15: Bank Reconciliation

**Risk Level:** 🟠 P1 — Bookkeeping Integrity  
**Estimated Duration:** 50 minutes  
**Prerequisites:** A bank account set up in the system; some paid invoices and expenses on record  

---

## Objective

Verify the complete bank reconciliation workflow: upload a bank statement CSV, auto-match
transactions to existing invoices/expenses, manually match unmatched items, unmatch if
incorrectly matched, and close a reconciliation period.

---

## Setup

1. Log in as Admin
2. Navigate to **Bank Accounts** — confirm at least one bank account exists (e.g., "Business Checking")
3. Have a CSV bank statement file ready. Minimum content (3 transactions):
   ```
   Date,Description,Amount,Type
   2026-05-01,Customer Payment INV-0042,300.00,Credit
   2026-05-03,Supplier Payment,250.00,Debit
   2026-05-10,Unknown Transaction,75.00,Debit
   ```
4. Ensure INV-0042 is in Paid status ($300.00) and one bill for $250.00 is paid

---

## Test Cases

### TC-15.1: Upload Bank Statement

**Steps:**
1. Navigate to **Bank Reconciliation** (Banking → Reconciliation, or `/bank-reconciliation`)
2. Select the bank account
3. Click **Upload Statement** / **Import CSV**
4. Upload the CSV file from Setup

**Expected:**
- 3 transactions imported successfully
- Transactions listed with date, description, amount, type (credit/debit)
- Status shows as "Unmatched" for all 3

**Screenshot:** `TC-15-1-uploaded-statement.png`

---

### TC-15.2: Auto-Match Identifies the Invoice Payment

**Steps:**
1. After upload, click **Auto Match** (or transactions auto-match on import)
2. Check the first transaction: "Customer Payment INV-0042 $300.00"

**Expected:**
- System auto-matches to Invoice `INV-0042` (Paid, $300.00)
- Match confidence shown (high/exact)
- Transaction shows match status: "Matched" → Invoice INV-0042

**Screenshot:** `TC-15-2-auto-matched-invoice.png`

---

### TC-15.3: Auto-Match Identifies the Bill Payment

**Steps:**
1. Check the second transaction: "Supplier Payment $250.00"

**Expected:**
- System auto-matches to the paid Bill for $250.00
- OR presents the bill as a suggested match (if not exact due to description mismatch)

**Screenshot:** `TC-15-3-auto-matched-bill.png`

---

### TC-15.4: Manual Match for Unknown Transaction

**Steps:**
1. Select the third transaction: "Unknown Transaction $75.00" (unmatched)
2. Click **Match Manually**
3. Search for matching expense or transaction in the modal
4. Select the correct expense record
5. Confirm match

**Expected:**
- Transaction marked as "Matched" with the selected expense
- Match shows: amount, document type, document number

**Screenshot:** `TC-15-4-manual-match.png`

---

### TC-15.5: Unmatch an Incorrectly Matched Transaction

**Steps:**
1. Select the auto-matched Invoice payment transaction
2. Click **Unmatch** or **Remove Match**

**Expected:**
- Transaction returns to "Unmatched" status
- Invoice INV-0042 is no longer marked as reconciled
- Can be re-matched to a different document or left unmatched

**Screenshot:** `TC-15-5-unmatch.png`

---

### TC-15.6: Reconciliation Period Summary

**Steps:**
1. After matching all transactions, view the reconciliation summary
2. Check totals: statement balance vs book balance

**Expected:**
- Statement total credits and debits shown
- Book balance (from system) shown
- Difference = $0.00 when all transactions are matched and correct
- OR clear indication of unreconciled difference

**Screenshot:** `TC-15-6-reconciliation-summary.png`

---

### TC-15.7: Close Reconciliation Period

**Steps:**
1. With all transactions matched (or acceptable difference)
2. Click **Close Period** / **Reconcile** / **Finalise**
3. Set the closing date (e.g., 31 May 2026)

**Expected:**
- Period is marked as closed
- Matched transactions are locked — cannot be unmatched after period close
- Bank account shows "Last reconciled: 31 May 2026"
- New reconciliation period starts fresh

**Screenshot:** `TC-15-7-period-closed.png`

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| CSV upload | 3 transactions imported | Error or 0 imported |
| Auto-match invoice | Invoice matched by amount/reference | Not matched |
| Manual match | Can search and assign | Search returns no results |
| Unmatch | Returns to Unmatched | Still shows as matched |
| Period close | Period locked | Can still edit after close |
| Reconciliation difference | $0.00 when all matched | Non-zero with all matched |
