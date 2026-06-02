# Workflow 11: Invoice Approval Workflow

**Risk Level:** 🔴 P0 — Operational Workflow Integrity  
**Estimated Duration:** 40 minutes  
**Prerequisites:** Two user accounts: one Admin/Manager (approver), one Staff (submitter)  

---

## Objective

Verify the full invoice approval workflow: Draft → Submit for Approval → Pending Approval →
Approve (→ Issued) or Reject (→ Draft). Confirm that only Admin/Manager roles can approve/reject,
and that Viewer/Staff roles cannot.

**API route reference:** `roles_api.py` — endpoints live at:
- `POST /api/invoices/<id>/submit` → status to `Pending Approval`
- `POST /api/invoices/<id>/approve` → status to `Issued`
- `POST /api/invoices/<id>/reject` → status to `Draft`
- `GET /api/approvals/pending` → list all pending approvals

---

## Setup

1. Log in as **Staff** user (non-admin, non-manager)
2. Create a new invoice — customer: any, total: $500.00
3. Save as Draft — note the invoice number (e.g., `INV-0101`)
4. Keep this Staff session open

---

## Test Cases

### TC-11.1: Staff Can Submit for Approval

**Steps:**
1. Open invoice `INV-0101` as Staff user (status: Draft)
2. Click **Submit for Approval** button (or equivalent action)
3. Confirm the action in any dialog

**Expected:**
- Invoice status changes to **Pending Approval**
- Toast: "Submitted for approval" (or similar)
- Invoice is now read-only (cannot be edited)
- Invoice no longer appears in Staff's editable invoices
- **Submit for Approval** button is replaced by **Pending Approval** badge/label

**Screenshot:** `TC-11-1-submitted-for-approval.png`

---

### TC-11.2: Pending Invoice Appears in Approvals Queue

**Steps:**
1. Log in as **Admin** or **Manager** user (separate session or use incognito)
2. Navigate to **Approvals** (sidebar or `/approvals/pending`)
3. Verify the queue

**Expected:**
- Invoice `INV-0101` appears in the pending approvals list
- Shows: invoice number, customer name, amount, submitted by (Staff user), date submitted
- Queue is filterable by type (Invoices / Purchase Orders)

**Screenshot:** `TC-11-2-approvals-queue.png`

---

### TC-11.3: Admin Can Approve Invoice

**Steps:**
1. (As Admin) Click on invoice `INV-0101` in the approvals queue
2. Click **Approve**
3. Optionally add a comment
4. Confirm

**Expected:**
- Invoice status changes to **Issued**
- Invoice disappears from the approvals queue
- Invoice is now sendable (Send button available)
- Audit log records: `approval` action, approved by Admin, timestamp
- Notification sent to the Staff user who submitted (if notification service is enabled)

**Screenshot:** `TC-11-3-approved-invoice.png`

---

### TC-11.4: Admin Can Reject Invoice (Returns to Draft)

**Steps:**
1. Create a second invoice as Staff, submit for approval
2. (As Admin) Open the new invoice in approvals queue
3. Click **Reject**
4. Add rejection reason: "Missing line item details"
5. Confirm

**Expected:**
- Invoice status changes back to **Draft**
- Invoice disappears from the approvals queue
- Staff user can edit the invoice again
- Rejection reason recorded in audit log / visible on the invoice

**Screenshot:** `TC-11-4-rejected-invoice.png`

---

### TC-11.5: Viewer Cannot Approve

**Steps:**
1. Log in as **Viewer** role user
2. Navigate to approvals queue (if accessible)

**Expected (Option A — route protected):**
- `/approvals/pending` shows no approve/reject buttons for Viewer role
- OR route redirects to 403/Unauthorized page

**Expected (Option B — API protected):**
- Viewer sees the pending invoice but clicking Approve calls the API
- API returns HTTP 403 ("Insufficient permissions to approve")
- No status change occurs

**Screenshot:** `TC-11-5-viewer-no-approve.png`

---

### TC-11.6: Cannot Edit a Pending Approval Invoice

**Steps:**
1. (As Staff) Try to open invoice `INV-0101` (status: Pending Approval) for editing
2. Attempt to change any field

**Expected:**
- All form fields are read-only / disabled while status is `Pending Approval`
- No Save button, OR Save button disabled
- Edit action should not be possible until rejected back to Draft

**Screenshot:** `TC-11-6-pending-approval-read-only.png`

---

### TC-11.7: Purchase Order Approval Works Identically

**Steps:**
1. Create a Purchase Order as Staff, submit for approval
2. As Admin, approve from the `/api/approvals/pending` queue

**Expected:**
- Same flow as invoices — `Pending Approval` → `Sent` (on approve) / `Draft` (on reject)
- Both appear in the same approvals queue

**Screenshot:** `TC-11-7-po-approval.png`

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| Submit changes status | Pending Approval | Any other status |
| Invoice in queue | Visible to Admin/Manager | Not visible |
| Approve → status | Issued | Any other status |
| Reject → status | Draft | Any other status |
| Viewer approve attempt | 403 or blocked UI | Status changes to Issued |
| Pending invoice editable | Not editable | Fields are editable |
| PO approval works | Same flow | Different flow or broken |
