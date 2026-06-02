import { calculateInvoiceTotals } from '../../utils/invoiceCalculations';

describe('calculateInvoiceTotals', () => {
  it('does not double-count manual tax when item tax already exists', () => {
    const result = calculateInvoiceTotals({
      items: [{ name: 'Item A', quantity: 1, rate: 100, discount: 0, tax: 18 }],
      isGstApplicable: true,
      manualTax: 18,
    });

    expect(result.subtotal).toBe(100);
    expect(result.totalTax).toBe(18);
    expect(result.total).toBe(118);
  });

  it('uses manual tax as fallback when item tax is zero', () => {
    const result = calculateInvoiceTotals({
      items: [{ name: 'Item A', quantity: 1, rate: 100, discount: 0, tax: 0 }],
      isGstApplicable: true,
      manualTax: 18,
    });

    expect(result.totalTax).toBe(18);
    expect(result.total).toBe(118);
  });
});
