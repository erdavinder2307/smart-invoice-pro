# Workflow: Dashboard & Reports Validation

## Scope
Validate that dashboard metrics and financial reports accurately reflect underlying transaction data.

---

## Setup (Run After Other Workflows)
Run this workflow AFTER completing workflows 01, 02, 06, and 07 so there is real data to validate against.

---

## Steps

### 1. Dashboard Summary
- Navigate to `/dashboard`
- Record the following values (screenshot):
  - Total Revenue (current month)
  - Outstanding Invoices
  - Overdue Invoices
  - Low-Stock alerts
- Cross-reference: count of paid invoices in current month × known totals

### 2. Monthly Revenue Chart
- Verify the chart shows data for recent months
- Verify current month bar/line reflects recorded payments
- Screenshot: revenue chart

### 3. Recent Invoices Widget
- Verify recent invoices list shows latest 5 invoices
- Verify status badges are correct
- Screenshot: recent invoices widget

### 4. Profit & Loss Report
- Navigate to `/reports` → Profit & Loss
- Set date range: current month
- Verify revenue section includes all paid invoices
- Verify expense section includes all bills and expenses
- Screenshot: P&L report

### 5. GST / Tax Summary Report
- Navigate to `/reports` → GST Tax Summary
- Verify GST collected and GST paid are calculated correctly
- Screenshot: GST summary

### 6. Sales Summary Report
- Navigate to `/reports` → Sales Summary
- Verify per-customer totals match known invoice data
- Screenshot: sales summary

### 7. Cash Flow Report
- Navigate to `/reports` → Cash Flow
- Verify inflows (payments received) and outflows (bills paid) are shown
- Screenshot: cash flow report

### 8. AR Aging Report
- Navigate to `/reports` → AR Aging (Accounts Receivable)
- Verify overdue invoices appear in correct age buckets (0-30, 31-60, 60+ days)
- Screenshot: AR aging

---

## Expected Outcomes
- Dashboard totals are consistent with reports
- Reports cover the correct date ranges
- GST calculations are accurate to 2 decimal places

## Common Bugs to Watch For
- Dashboard showing data for wrong tenant (multi-tenant bleed)
- Revenue not updating in real time after payment recording
- Report date filter not applying correctly (off-by-one-day issues)
- GST report including non-taxable items in taxable column
- AR aging putting invoices in wrong bucket due to timezone
