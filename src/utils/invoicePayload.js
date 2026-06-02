import { calculateInvoiceTotals } from "./invoiceCalculations";
import { normalizePaymentTerms } from "./invoiceFormValidation";

export const buildInvoicePayload = (form) => {
  const manualTax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
  const totals = calculateInvoiceTotals({
    items: form.items || [],
    isGstApplicable: Boolean(form.is_gst_applicable),
    manualTax,
    invoiceDiscount: Number(form.invoice_discount || 0),
    roundOff: Number(form.round_off || 0),
    amountPaid: Number(form.amount_paid || 0),
  });

  const items = totals.items
    .filter((item) => item.name || item.description || item.quantity || item.rate)
    .map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount,
      tax: item.tax,
      amount: item.amount,
    }));

  return {
    customer_id: form.customer_id,
    customer_name: form.customer_name || "",
    customer_email: form.customer_email || "",
    customer_phone: form.customer_phone || "",
    invoice_number: form.invoice_number,
    issue_date: form.issue_date,
    due_date: form.due_date,
    payment_terms: normalizePaymentTerms(form.payment_terms),
    status: form.status,
    payment_mode: form.payment_mode || "",
    invoice_type: form.invoice_type || "Tax Invoice",
    subject: form.subject || "",
    salesperson: form.salesperson || "",
    notes: form.notes || "",
    terms_conditions: form.terms_conditions || "",
    is_gst_applicable: Boolean(form.is_gst_applicable),
    place_of_supply: form.place_of_supply || "",
    gst_treatment: form.gst_treatment || "",
    items,
    subtotal: totals.subtotal,
    total_tax: totals.totalTax,
    cgst_amount: Number(form.cgst_amount || 0),
    sgst_amount: Number(form.sgst_amount || 0),
    igst_amount: Number(form.igst_amount || 0),
    invoice_discount: totals.invoiceDiscount,
    round_off: totals.roundOff,
    total_amount: totals.total,
    amount_paid: Number(form.amount_paid || 0),
    balance_due: totals.balanceDue,
  };
};
