# Workflow 18: Report Financial Accuracy

**Risk Level:** 🟠 P1 — Financial Reporting Integrity  
**Estimated Duration:** 60 minutes  
**Prerequisites:** Known transaction data in the system (at least 5 paid invoices, 3 expenses, 2 bills paid)  

---

## Objective

Cross-validate all 8 report pages against known transaction data to confirm the numbers reported
match the underlying records. Each report is read-only, but incorrect aggregation logic could
produce misleading financial statements.

**Reports to validate:**
1. Profit & Loss
2. Balance Sheet
3. Accounts Receivable Aging
4. Accounts Payable Aging
5. Cash Flow Statement
6. Sales Summary
7. GST / Tax Summary
8. Payments Received / Payments Made

---

## Setup — Seed Data (Record Before Running)

Before running reports, record the exact test data:

| Item | Amount | Date | Status |
|------|--------|------|--------|
| Invoice 1 | $500.00 | 1 May | Paid |
| Invoice 2 | $300.00 | 10 May | Paid |
| Invoice 3 | $200.00 | 15 May | Issued (outstanding) |
| Expense 1 | $100.00 | 5 May | Recorded |
| Expense 2 | $50.00 | 12 May | Recorded |
| Bill 1 paid | $250.00 | 8 May | Paid |
| GST on INV-1 | $45.45 | 1 May | Collected (10% on $500) |

**Expected totals:**
- Total revenue (paid invoices): $800.00
- Total outstanding AR: $200.00
- Total expenses: $150.00
- Total AP paid: $250.00
- Net profit (simplified): $800.00 - $150.00 - $250.00 = $400.00

---

## Test Cases

### TC-18.1: Profit & Loss Report

**Steps:**
1. Navigate to **Reports → Profit & Loss**
2. Set date range: 1 May 2026 – 31 May 2026
3. Click **Generate** / **Apply**

**Expected:**
- Revenue: $800.00 (sum of paid invoices in May)
- Expenses: $150.00 (sum of recorded expenses in May)
- Gross Profit: $650.00
- Net Profit: ~$400.00 (after bills/cost of goods)

**FAIL Condition:** Revenue shows $1,000.00 (includes Issued invoice, not just Paid)

**Screenshot:** `TC-18-1-profit-loss.png`

---

### TC-18.2: Accounts Receivable Aging

**Steps:**
1. Navigate to **Reports → AR Aging**
2. View as of today's date

**Expected:**
- Invoice 3 ($200.00) appears in the appropriate aging bucket (Current / 0-30 days)
- Invoices 1 and 2 (Paid) do NOT appear
- Total AR outstanding: $200.00

**FAIL Condition:** Paid invoices appear in AR aging, or total AR ≠ $200.00

**Screenshot:** `TC-18-2-ar-aging.png`

---

### TC-18.3: Accounts Payable Aging

**Steps:**
1. Navigate to **Reports → AP Aging**
2. View as of today's date

**Expected:**
- Bill 1 (Paid) does NOT appear in aging (already paid)
- Any unpaid bills appear in correct aging buckets
- If all bills are paid: total AP = $0.00

**Screenshot:** `TC-18-3-ap-aging.png`

---

### TC-18.4: GST / Tax Summary

**Steps:**
1. Navigate to **Reports → GST Tax Summary**
2. Set period: May 2026

**Expected:**
- GST collected on Invoice 1: $45.45 (10% of $500 if 10% GST applied)
- Total GST collected matches sum of tax on all issued/paid invoices in the period
- Input tax credits (GST on expenses/bills) shown separately

**FAIL Condition:** GST amounts don't match tax lines on individual invoices

**Screenshot:** `TC-18-4-gst-summary.png`

---

### TC-18.5: Sales Summary

**Steps:**
1. Navigate to **Reports → Sales Summary**
2. Set period: May 2026

**Expected:**
- Total sales (invoiced): $1,000.00 (all 3 invoices — revenue recognised at invoice creation)
- OR Total sales (paid only): $800.00 (depending on accounting basis)
- Top customer listed correctly
- Per-customer breakdown accurate

**Screenshot:** `TC-18-5-sales-summary.png`

---

### TC-18.6: Payments Received

**Steps:**
1. Navigate to **Reports → Payments Received**
2. Set period: May 2026

**Expected:**
- Lists all payment records from the period
- Total = $800.00 (Invoices 1 + 2, both paid in May)
- Each row shows: customer, invoice, amount, method, date

**Screenshot:** `TC-18-6-payments-received.png`

---

### TC-18.7: Cash Flow Statement

**Steps:**
1. Navigate to **Reports → Cash Flow**
2. Set period: May 2026

**Expected:**
- Operating inflows: $800.00 (payments received)
- Operating outflows: $150.00 (expenses) + $250.00 (bills paid) = $400.00
- Net cash flow: $400.00
- Opening / closing balances if bank accounts are linked

**Screenshot:** `TC-18-7-cash-flow.png`

---

### TC-18.8: Date Range Filtering Works Correctly

**Steps:**
1. Open any report (e.g., Profit & Loss)
2. Set date range to a future date range (e.g., June 2027)
3. Generate the report

**Expected:**
- All values show $0.00 (no data in future period)
- No error thrown
- Report renders correctly with empty/zero state

**Screenshot:** `TC-18-8-empty-date-range.png`

---

## Cross-Validation Checklist

| Report | Tested | Figures Match Source | Notes |
|--------|--------|---------------------|-------|
| Profit & Loss | ☐ | ☐ | |
| AR Aging | ☐ | ☐ | |
| AP Aging | ☐ | ☐ | |
| GST Summary | ☐ | ☐ | |
| Sales Summary | ☐ | ☐ | |
| Payments Received | ☐ | ☐ | |
| Cash Flow | ☐ | ☐ | |
| Balance Sheet | ☐ | ☐ | |

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| P&L revenue (paid only) | $800.00 | $1,000.00 (includes outstanding) |
| AR aging includes only outstanding | $200.00 | Includes paid invoices |
| Payments Received total | $800.00 | Different amount |
| Empty date range | All zeros | Error or non-zero values |
| GST figures match invoice tax lines | Match | Discrepancy of any amount |
