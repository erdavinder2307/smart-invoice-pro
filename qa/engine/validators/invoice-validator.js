const taxValidator = require('./tax-validator');

function validateLineItems(lineItems) {
  const errors = [];
  let computedSubtotal = 0;
  let computedTax = 0;

  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const rate = Number(item.rate ?? item.unit_price ?? item.price ?? 0);
    const taxRate = Number(item.tax ?? item.tax_rate ?? 0);
    const lineBase = qty * rate;
    const lineTax = item.is_gst_applicable === false ? 0 : (lineBase * taxRate) / 100;
    computedSubtotal += lineBase;
    computedTax += lineTax;

    if (qty <= 0) errors.push(`Line ${i + 1}: quantity must be positive`);
    if (rate <= 0) errors.push(`Line ${i + 1}: rate must be greater than zero`);
  }

  return { computedSubtotal, computedTax, computedTotal: computedSubtotal + computedTax, errors };
}

function validate(invoice) {
  const errors = [];
  const warnings = [];
  const { line_items: lineItems = [], items = [] } = invoice;
  const itemsList = lineItems.length ? lineItems : items;

  const lineCalc = validateLineItems(itemsList);
  errors.push(...lineCalc.errors);

  const subtotal = Number(invoice.subtotal ?? 0);
  const totalTax = Number(invoice.total_tax ?? invoice.tax_amount ?? 0);
  const total = Number(invoice.total_amount ?? invoice.total ?? 0);

  if (Math.abs(subtotal - lineCalc.computedSubtotal) > 0.02) {
    errors.push(
      `Subtotal mismatch: document=${subtotal}, computed=${lineCalc.computedSubtotal.toFixed(2)}`
    );
  }

  const taxCheck = taxValidator.validate({
    subtotal,
    totalTax,
    lineItems: itemsList,
    isGstApplicable: invoice.is_gst_applicable !== false,
  });
  errors.push(...taxCheck.errors);
  warnings.push(...(taxCheck.warnings || []));

  const expectedTotal = subtotal + totalTax;
  if (Math.abs(total - expectedTotal) > 0.02) {
    errors.push(`Total mismatch: total=${total}, subtotal+tax=${expectedTotal.toFixed(2)}`);
  }

  const status = (invoice.status || '').toLowerCase();
  const amountPaid = Number(invoice.amount_paid ?? invoice.paid_amount ?? 0);
  const balanceDue = Number(invoice.balance_due ?? invoice.outstanding ?? total - amountPaid);

  if (status === 'paid' && Math.abs(balanceDue) > 0.02) {
    errors.push(`Status is Paid but balance due is ${balanceDue}`);
  }
  if (status === 'draft' && amountPaid > 0) {
    warnings.push('Draft invoice has payments recorded');
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
    computed: lineCalc,
  };
}

module.exports = { validate, validateLineItems };
