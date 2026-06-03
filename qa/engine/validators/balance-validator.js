function validate({ customer, invoices = [], payments = [] }) {
  const errors = [];
  const warnings = [];

  const reportedOutstanding = Number(
    customer?.outstanding_balance ?? customer?.balance ?? customer?.total_outstanding ?? 0
  );

  let computedOutstanding = 0;
  for (const inv of invoices) {
    const status = (inv.status || '').toLowerCase();
    if (['void', 'cancelled', 'archived'].includes(status)) continue;
    const total = Number(inv.total_amount ?? inv.total ?? 0);
    const paid = Number(inv.amount_paid ?? inv.paid_amount ?? 0);
    if (!['paid'].includes(status)) {
      computedOutstanding += total - paid;
    }
  }

  if (Math.abs(reportedOutstanding - computedOutstanding) > 0.05) {
    errors.push(
      `Customer outstanding mismatch: reported=${reportedOutstanding.toFixed(2)}, computed=${computedOutstanding.toFixed(2)}`
    );
  }

  const paymentSum = payments.reduce((s, p) => s + Number(p.amount ?? 0), 0);
  if (payments.length && paymentSum > computedOutstanding + 0.05) {
    warnings.push('Total payments exceed open invoice balance for customer');
  }

  return { pass: errors.length === 0, errors, warnings, computedOutstanding, reportedOutstanding };
}

module.exports = { validate };
