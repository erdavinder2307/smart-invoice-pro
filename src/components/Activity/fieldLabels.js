/** Human-readable labels for audit diff fields (compliance view). */
export const FIELD_LABELS = {
  due_date: "Due Date",
  issue_date: "Issue Date",
  bill_date: "Bill Date",
  invoice_number: "Invoice #",
  quote_number: "Quote #",
  bill_number: "Bill #",
  po_number: "PO #",
  purchase_order_number: "PO #",
  sales_order_number: "SO #",
  expense_number: "Expense #",
  status: "Status",
  total_amount: "Total",
  subtotal: "Subtotal",
  total_tax: "Tax",
  amount_paid: "Amount Paid",
  balance_due: "Balance Due",
  gst_enabled: "GST Enabled",
  gst_registration_type: "GST Registration",
  gstin: "GSTIN",
  organization_name: "Organization Name",
  bank_name: "Bank",
  account_name: "Account Name",
  account_type: "Account Type",
  customer_name: "Customer",
  vendor_name: "Vendor",
  name: "Name",
  email: "Email",
  role: "Role",
  match_status: "Match Status",
  description: "Description",
  amount: "Amount",
  filename: "File",
};

export function getFieldLabel(field) {
  if (!field) return "";
  return FIELD_LABELS[field] || field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatFieldValue(value) {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
