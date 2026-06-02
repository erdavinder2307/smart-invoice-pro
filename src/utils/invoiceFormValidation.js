const parseDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  const d = new Date(year, (month || 1) - 1, day || 1);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatYyyyMmDd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isRowMeaningful = (item = {}) =>
  String(item.name || "").trim() !== ""
  || String(item.description || "").trim() !== ""
  || Number(item.quantity || 0) > 0
  || Number(item.rate || 0) > 0;

export const buildPaymentTermsDaysMap = {
  "Due on Receipt": 0,
  "Net 7": 7,
  "Net 15": 15,
  "Net 30": 30,
  "Net 45": 45,
};

const PAYMENT_TERMS_ALIASES = {
  due_on_receipt: "Due on Receipt",
  net_7: "Net 7",
  net_15: "Net 15",
  net_30: "Net 30",
  net_45: "Net 45",
};

export const normalizePaymentTerms = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (buildPaymentTermsDaysMap[raw] != null) return raw;

  const directAlias = PAYMENT_TERMS_ALIASES[raw.toLowerCase()];
  if (directAlias) return directAlias;

  const netDaysMatch = raw.match(/net[\s_\-]?(\d+)/i);
  if (netDaysMatch) {
    const normalized = `Net ${Number(netDaysMatch[1])}`;
    if (buildPaymentTermsDaysMap[normalized] != null) return normalized;
  }

  if (/due[\s_\-]?on[\s_\-]?receipt/i.test(raw)) {
    return "Due on Receipt";
  }

  return raw;
};

export const deriveDueDate = (issueDate, paymentTerms) => {
  const issue = parseDate(issueDate);
  if (!issue) return "";
  const normalizedTerms = normalizePaymentTerms(paymentTerms);
  const days = buildPaymentTermsDaysMap[normalizedTerms] ?? 0;
  const due = new Date(issue);
  due.setDate(due.getDate() + days);
  return formatYyyyMmDd(due);
};

export const validateInvoiceForm = (form = {}, t) => {
  const errors = {};
  const itemErrors = [];

  if (!String(form.customer_id || "").trim()) {
    errors.customer_id = t?.("invoiceForm.customerRequired", "Please select a customer.") || "Please select a customer.";
  }

  const invoiceNumber = String(form.invoice_number || "").trim();
  if (invoiceNumber && /^([A-Z]+-\d+){2,}/.test(invoiceNumber)) {
    errors.invoice_number = "Invoice number appears malformed. Use the auto-generate option to reset.";
  }

  const issueDate = parseDate(form.issue_date);
  const dueDate = parseDate(form.due_date);

  if (!issueDate) {
    errors.issue_date = "Invoice date is required";
  }
  if (!dueDate) {
    errors.due_date = "Due date is required";
  }
  if (issueDate && dueDate && dueDate < issueDate) {
    errors.due_date = "Due date must be on or after invoice date";
  }

  const rows = Array.isArray(form.items) ? form.items : [];
  const meaningfulRows = rows.filter(isRowMeaningful);

  if (meaningfulRows.length < 1) {
    errors.items = t?.("invoiceForm.itemRequired", "Please add at least one item.") || "Please add at least one item.";
  }

  rows.forEach((row, index) => {
    const rowError = {};
    if (!isRowMeaningful(row)) {
      itemErrors[index] = rowError;
      return;
    }

    if (!String(row.name || "").trim()) rowError.name = "Item is required";

    const qty = Number(row.quantity);
    if (!Number.isFinite(qty) || qty <= 0) rowError.quantity = "Qty must be greater than 0";

    const rate = Number(row.rate);
    if (!Number.isFinite(rate) || rate < 0) rowError.rate = "Rate cannot be negative";

    const discount = Number(row.discount || 0);
    if (!Number.isFinite(discount) || discount < 0) rowError.discount = "Discount cannot be negative";

    const tax = Number(row.tax || 0);
    if (!Number.isFinite(tax) || tax < 0) rowError.tax = "Tax cannot be negative";

    itemErrors[index] = rowError;
  });

  const hasItemErrors = itemErrors.some((rowError) => rowError && Object.keys(rowError).length > 0);

  return {
    errors,
    itemErrors,
    isValid: Object.keys(errors).length === 0 && !hasItemErrors,
  };
};
