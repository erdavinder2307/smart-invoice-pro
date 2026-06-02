import {
  deriveDueDate,
  normalizePaymentTerms,
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
});
