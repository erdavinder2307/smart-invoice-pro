# Workflow: Purchase Orders → Bills

## Business Objective

Validate PO creation, approval/send states, conversion to bill, and AP impact.

## Preconditions

- Vendor from `07-vendors`
- Routes: `/purchase-orders`, `/bills`

## Workflow Steps

### 1. Create PO
- `/purchase-orders/add` — select vendor, add line items
- Save draft/open
- Track `purchaseOrders` entity
- Screenshot: PO created

### 2. Issue PO
- Mark sent/approved per workflow
- Screenshot: issued PO

### 3. Convert to Bill (if supported)
- Create bill from PO or mirror amounts on `/bills/add`
- Track bill linkage
- Screenshot: bill from PO

### 4. AP Verification
- `/reports/ap-aging` — vendor appears with balance if bill unpaid
- Screenshot: AP aging snippet

## Validation Rules

- PO line totals = bill line totals on conversion
- Bill status affects vendor outstanding

## Bookkeeping Expectations

- PO is commitment; bill is AP liability
- Paid bill clears vendor outstanding

## Screenshots Required

- po-create
- po-issued
- bill-from-po

## Success Criteria

- PO → Bill path without amount drift

## Test Data

- `purchase-orders.json`
