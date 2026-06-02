# Workflow: Expenses & Bills (AP Lifecycle)

## Scope
Accounts payable: vendor management, bill creation, expense recording, and AP aging report.

---

## Steps

### 1. Create Vendor
- Navigate to `/vendors`
- Add new vendor: "QA Supplier Pty Ltd", ABN, email
- Save
- Screenshot: vendor record

### 2. Create Bill
- Navigate to `/bills`
- Click **New Bill**
- Select the QA vendor
- Add line items (e.g., Office Supplies $200, Shipping $50)
- Set due date: 14 days from today
- Save as Draft
- Screenshot: draft bill

### 3. Mark Bill as Received / Approved
- Change status to **Received** or **Approved**
- Screenshot: approved bill

### 4. Record Bill Payment
- Click **Pay Bill** / **Record Payment**
- Enter full amount
- Submit
- Verify status → **Paid**
- Screenshot: paid bill

### 5. Create Expense
- Navigate to `/expenses`
- Add expense: category "Travel", amount $125.00, date today, description "Client meeting taxi"
- Attach receipt (if upload supported — try a test image)
- Save
- Screenshot: expense record

### 6. Expense Stats / Summary
- Navigate to Expense summary or Stats page
- Verify current month total includes the new $125.00 expense
- Screenshot: expense summary

### 7. AP Aging Report
- Navigate to `/reports` → AP Aging
- Verify QA Supplier Pty Ltd appears with correct outstanding amount (if bill is unpaid)
- Screenshot: AP aging report

---

## Expected Outcomes
- Bills appear in AP aging until paid
- Expense totals update in summary/dashboard
- Paid bills do not appear in overdue section

## Common Bugs to Watch For
- Bill due date not appearing correctly in AP aging buckets
- Expense category totals not matching individual expense sum
- Receipt upload silently failing
- Vendor with open bills can be deleted without warning
