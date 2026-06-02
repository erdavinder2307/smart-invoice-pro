# Workflow 12: Purchase Order to Bill (AP Lifecycle)

**Risk Level:** 🔴 P0 — Accounts Payable Financial Integrity  
**Estimated Duration:** 50 minutes  
**Prerequisites:** At least one Vendor and one Product (with stock tracking) in the system  

---

## Objective

Verify the complete Accounts Payable lifecycle: Create PO → Send → Mark Received → Create Bill
from PO → Pay Bill. Validate that stock levels update correctly on receiving, that the bill is
correctly linked to the PO, and that paying the bill is reflected in AP aging/reports.

**API route reference:**
- `POST /api/purchase-orders` → create PO
- `PUT /api/purchase-orders/<id>/mark_issued` → status to `Sent`
- `PUT /api/purchase-orders/<id>/mark_received` → status to `Received`, stock updated
- `POST /api/purchase-orders/<id>/create-bill` → create bill from PO
- `POST /api/bills/<id>/record-payment` → pay bill

---

## Setup

1. Log in as Admin
2. Confirm the following exist: a Vendor, a Product (with stock tracking enabled)
3. Note the current stock quantity of the product (e.g., 50 units)

---

## Test Cases

### TC-12.1: Create Purchase Order

**Steps:**
1. Navigate to **Purchase Orders** → **New Purchase Order**
2. Select vendor, add 1 line item: Product × 10 units @ $25.00 each (total: $250.00)
3. Set expected delivery date: 7 days from today
4. Save as Draft

**Expected:**
- PO saved with status **Draft**
- PO number assigned (e.g., `PO-0015`)
- Subtotal: $250.00, Tax if applicable, Total shown correctly

**Screenshot:** `TC-12-1-create-po.png`

---

### TC-12.2: Send Purchase Order to Vendor

**Steps:**
1. Open PO `PO-0015` (status: Draft)
2. Click **Mark as Sent** or **Send to Vendor**

**Expected:**
- Status changes to **Sent**
- Send date recorded
- PO is viewable but limited editing

**Screenshot:** `TC-12-2-po-sent.png`

---

### TC-12.3: Mark as Received — Stock Updates

**Steps:**
1. Open PO `PO-0015` (status: Sent or Confirmed)
2. Click **Mark as Received**
3. Confirm receiving all 10 units

**Expected:**
- Status changes to **Received**
- Product stock quantity increases by 10 (e.g., from 50 → 60)
- Stock ledger entry created: `+10 units — Purchase Order PO-0015 — today`
- Navigate to Products → confirm new stock level

**Screenshot:** `TC-12-3-stock-updated.png`

---

### TC-12.4: Create Bill from Purchase Order

**Steps:**
1. Open PO `PO-0015` (status: Received)
2. Click **Create Bill**
3. Verify bill details are pre-populated from PO
4. Confirm / Save bill

**Expected:**
- Bill created with status **Draft** (or `Received` depending on flow)
- Bill amount: $250.00 (matches PO total)
- Bill shows vendor: same as PO
- Bill has a link/reference back to PO number (`PO-0015`)
- PO status updates to **Billed**
- Bill number assigned (e.g., `BILL-0007`)

**Screenshot:** `TC-12-4-bill-from-po.png`

---

### TC-12.5: Pay the Bill

**Steps:**
1. Open bill `BILL-0007` (status: Draft or Open)
2. Note: balance_due = $250.00
3. Click **Record Payment** (or **Mark as Paid**)
4. Enter: amount $250.00, method: Bank Transfer, date: today
5. Save

**Expected:**
- Bill status changes to **Paid**
- `amount_paid` = $250.00
- `balance_due` = $0.00
- Payment method and date recorded

**Screenshot:** `TC-12-5-bill-paid.png`

---

### TC-12.6: AP Aging Report Reflects Payment

**Steps:**
1. Navigate to **Reports** → **AP Aging** (or Accounts Payable Aging)
2. Check for vendor

**Expected:**
- Vendor's outstanding balance decreases by $250.00 after bill is paid
- The paid bill no longer appears in the aging summary
- (If partial payment only) Shows correct outstanding amount

**Screenshot:** `TC-12-6-ap-aging-after-payment.png`

---

### TC-12.7: Cancel PO Before Receiving

**Steps:**
1. Create a new PO (any vendor/product)
2. Mark as Sent
3. Click **Cancel** on the PO

**Expected:**
- Status changes to **Cancelled**
- Stock levels are NOT affected (nothing was received)
- Cancelled PO cannot be reopened

**Screenshot:** `TC-12-7-cancel-po.png`

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| Stock after mark_received | +10 units | No change or wrong amount |
| Bill created from PO | Pre-populated, $250.00 | Empty or wrong amount |
| PO status after bill created | Billed | Stays Received or Sent |
| Bill paid status | Paid | Any other status |
| AP aging after payment | Balance decreased | Balance unchanged |
| Cancelled PO stock impact | No stock change | Stock decreases |
