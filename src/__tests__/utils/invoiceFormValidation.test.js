import {
  deriveDueDate,
  normalizePaymentTerms,
  validateInvoiceForm,
} from '../../utils/invoiceFormValidation';

describe('invoiceFormValidation helpers', () => {
  it('normalizes snake_case payment terms to UI labels', () => {
    expect(normalizePaymentTerms('net_30')).toBe('Net 30');
    expect(normalizePaymentTerms('due_on_receipt')).toBe('Due on Receipt');
  });

  it('derives due date for normalized net terms without timezone drift', () => {
    expect(deriveDueDate('2026-05-26', 'net_30')).toBe('2026-06-25');
  });

  it('keeps due date same day for due_on_receipt', () => {
    expect(deriveDueDate('2026-05-26', 'due_on_receipt')).toBe('2026-05-26');
  });

  it('rejects zero rate on meaningful line items', () => {
    const { itemErrors } = validateInvoiceForm({
      customer_id: 'c1',
      issue_date: '2026-05-26',
      due_date: '2026-06-25',
      items: [{ name: 'Widget', quantity: 2, rate: 0 }],
    });
    expect(itemErrors[0].rate).toBe('Rate must be greater than zero');
  });
});
