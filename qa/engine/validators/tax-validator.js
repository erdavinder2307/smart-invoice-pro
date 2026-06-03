function validate({ subtotal, totalTax, lineItems = [], isGstApplicable = true }) {
  const errors = [];
  const warnings = [];

  if (!isGstApplicable && totalTax > 0.01) {
    errors.push('GST not applicable but tax amount is non-zero');
  }

  let lineTaxSum = 0;
  for (const item of lineItems) {
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const rate = Number(item.rate ?? item.unit_price ?? item.price ?? 0);
    const taxRate = Number(item.tax ?? item.tax_rate ?? 0);
    const lineBase = qty * rate;
    lineTaxSum += isGstApplicable ? (lineBase * taxRate) / 100 : 0;
  }

  if (isGstApplicable && Math.abs(lineTaxSum - totalTax) > 0.05) {
    warnings.push(
      `Line tax sum (${lineTaxSum.toFixed(2)}) differs from document tax (${totalTax}) — may use CGST/SGST split`
    );
  }

  const cgst = Number(subtotal?.cgst_amount ?? 0);
  const sgst = Number(subtotal?.sgst_amount ?? 0);
  if (typeof subtotal === 'object') {
    const doc = subtotal;
    if (doc.cgst_amount != null && doc.sgst_amount != null) {
      const splitSum = Number(doc.cgst_amount) + Number(doc.sgst_amount);
      if (Math.abs(splitSum - totalTax) > 0.05) {
        warnings.push(`CGST+SGST (${splitSum}) does not equal total_tax (${totalTax})`);
      }
    }
  }

  return { pass: errors.length === 0, errors, warnings };
}

module.exports = { validate };
