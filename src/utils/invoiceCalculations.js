const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const sanitizeItemForMath = (item = {}) => ({
  name: String(item.name || "").trim(),
  description: String(item.description || "").trim(),
  quantity: Math.max(0, toNumber(item.quantity, 0)),
  rate: Math.max(0, toNumber(item.rate, 0)),
  discount: Math.max(0, toNumber(item.discount, 0)),
  tax: Math.max(0, toNumber(item.tax, 0)),
});

export const calculateItemAmounts = (item = {}, isGstApplicable = true) => {
  const next = sanitizeItemForMath(item);
  const lineBase = Math.max(0, next.quantity * next.rate - next.discount);
  const lineTax = isGstApplicable ? (lineBase * next.tax) / 100 : 0;
  const lineAmount = lineBase + lineTax;
  return {
    ...next,
    line_base: lineBase,
    line_tax: lineTax,
    amount: lineAmount,
  };
};

export const calculateInvoiceTotals = ({
  items = [],
  isGstApplicable = true,
  manualTax = 0,
  invoiceDiscount = 0,
  roundOff = 0,
  amountPaid = 0,
}) => {
  const normalizedItems = items.map((item) => calculateItemAmounts(item, isGstApplicable));

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.line_base, 0);
  const itemTax = normalizedItems.reduce((sum, item) => sum + item.line_tax, 0);
  const safeManualTax = Math.max(0, toNumber(manualTax, 0));
  // If row-level tax has already been computed, don't add manual GST fields again.
  const totalTax = isGstApplicable ? (itemTax > 0 ? itemTax : safeManualTax) : 0;

  const safeInvoiceDiscount = Math.max(0, toNumber(invoiceDiscount, 0));
  const safeRoundOff = toNumber(roundOff, 0);
  const total = subtotal + totalTax - safeInvoiceDiscount + safeRoundOff;
  const balanceDue = total - Math.max(0, toNumber(amountPaid, 0));

  return {
    items: normalizedItems,
    subtotal,
    totalTax,
    total,
    balanceDue,
    invoiceDiscount: safeInvoiceDiscount,
    roundOff: safeRoundOff,
  };
};
