# Workflow: Inventory & Stock Management

## Scope
Product creation, stock adjustment, low-stock alerts, purchase order flow, and stock ledger accuracy.

---

## Steps

### 1. Create Product with Stock Tracking
- Navigate to `/products`
- Click **New Product**
- Fill in:
  - Name: QA Test Product [timestamp]
  - SKU: QA-001
  - Unit price: 99.00
  - Enable stock tracking: YES
  - Opening stock: 50 units
  - Reorder point: 10 units
- Save
- Screenshot: new product with stock details

### 2. Verify Stock Ledger
- Open the product detail
- Navigate to **Stock Ledger** tab
- Confirm opening stock entry shows 50 units
- Screenshot: stock ledger

### 3. Manual Stock Adjustment (Add)
- Click **Adjust Stock**
- Type: Stock In / Purchase Received
- Quantity: +20
- Note: "Manual QA test addition"
- Save
- Verify stock level is now 70 units
- Screenshot: adjusted stock level

### 4. Manual Stock Adjustment (Remove)
- Adjust stock again: -65 units
- Verify stock level is now 5 units (below reorder point of 10)
- Screenshot: stock below reorder point

### 5. Low-Stock Alert Verification
- Navigate to `/dashboard`
- Confirm low-stock alert/banner appears for the test product
- Navigate to `/products` — verify low-stock badge on the product
- Screenshot: dashboard low-stock alert; screenshot: product list with badge

### 6. Stock Impact from Invoice
- Create a new invoice with the test product, quantity 2
- Save the invoice
- Navigate back to the product
- Verify stock has been reduced by 2 (now 3 units)
- Screenshot: stock ledger showing invoice deduction

### 7. Stock Summary Report
- Navigate to `/reports` (or product stock summary)
- Verify test product appears with correct current stock
- Screenshot: stock summary

---

## Expected Outcomes
- Stock adjustments are immediately reflected in ledger
- Low-stock threshold triggers dashboard alert
- Invoice creation deducts from stock automatically
- Stock ledger shows full history with timestamps

## Common Bugs to Watch For
- Stock not deducting when invoice is saved (only when marked as sent/paid?)
- Low-stock alert showing stale data (cached)
- Reorder point ignoring decimal quantities
- Stock ledger missing entries after bulk invoice creation
