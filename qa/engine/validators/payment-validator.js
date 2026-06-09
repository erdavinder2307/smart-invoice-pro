function validate({ payment, invoice }) {
  const errors = [];
  const warnings = [];

  const amount = Number(payment.amount ?? payment.payment_amount ?? 0);
  const invoiceTotal = Number(invoice?.total_amount ?? invoice?.total ?? 0);
  const priorPaid = Number(invoice?.amount_paid ?? 0) - amount;
  const balanceBefore = invoiceTotal - priorPaid;

  if (amount <= 0) errors.push('Payment amount must be positive');
  if (amount > balanceBefore + 0.02) {
    errors.push(`Overpayment: payment ${amount} exceeds balance ${balanceBefore.toFixed(2)}`);
  }

  const allocations = payment.allocations || payment.invoice_allocations || [];
  if (allocations.length) {
    const allocSum = allocations.reduce((s, a) => s + Number(a.amount ?? 0), 0);
    if (Math.abs(allocSum - amount) > 0.02) {
      errors.push(`Allocation sum ${allocSum} does not match payment ${amount}`);
    }
  }

  if (invoice?.status?.toLowerCase() === 'paid' && amount < balanceBefore - 0.02) {
    warnings.push('Partial payment recorded but invoice marked Paid');
  }

  return { pass: errors.length === 0, errors, warnings };
}

module.exports = { validate };
