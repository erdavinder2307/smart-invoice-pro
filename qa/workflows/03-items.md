# Workflow: Items / Products (Inventory Master)

## Business Objective

Ensure products (goods and services) support invoicing, tax rates, stock tracking, and inventory impact on sales documents.

## Preconditions

- Completed `01-login`
- Test data: `items.json`

## Workflow Steps

### 1. Product List
- Navigate to `/products`
- Screenshot: product list

### 2. Create Good (Stock Item)
- New product from `items.json` row type=goods
- Set SKU, sale price, purchase price, tax %, track inventory if applicable
- Save and track entity `product`
- Screenshot: goods product created

### 3. Create Service Item
- Create service line item (no stock) from test data
- Screenshot: service product created

### 4. Stock Adjustment (if goods)
- Navigate to `/stock-adjustment`
- Increase stock for goods product by test quantity
- Verify stock on hand updates on product detail
- Screenshot: stock adjustment

### 5. Invoice Readiness
- Navigate to `/invoices/add`
- Confirm both products appear in line item selector with correct rates/tax
- Screenshot: products in invoice line picker

## Validation Rules

- Sale price ≥ 0; tax rate ≥ 0
- Stock quantity non-negative after adjustment
- Product archived → excluded from new invoice lines

## Bookkeeping Expectations

- Issuing invoice with stocked goods reduces on-hand quantity (post-send if configured)
- Service items have no inventory impact
- Tax on line follows product default tax rate

## Screenshots Required

- products-list
- product-goods-create
- product-service-create
- stock-adjustment
- products-on-invoice

## Success Criteria

- At least one goods + one service product tracked for invoice workflow
- Stock matches adjustment when inventory enabled

## Test Data

- `items.json`
- `items.csv`
- `items.xlsx`
