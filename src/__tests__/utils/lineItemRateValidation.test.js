import { validateLineItemRate, hasInvalidLineItemRates } from '../../utils/lineItemRateValidation';

describe('lineItemRateValidation', () => {
  it('rejects zero and negative rates by default', () => {
    expect(validateLineItemRate(0)).toBe('Rate must be greater than zero');
    expect(validateLineItemRate(-1)).toBe('Rate cannot be negative');
    expect(validateLineItemRate(10)).toBe('');
  });

  it('allows zero when configured', () => {
    expect(validateLineItemRate(0, { allowZero: true })).toBe('');
  });

  it('detects invalid rates on line items', () => {
    expect(hasInvalidLineItemRates([{ name: 'A', quantity: 1, rate: 0 }])).toBe(true);
    expect(hasInvalidLineItemRates([{ name: 'A', quantity: 1, rate: 5 }])).toBe(false);
  });
});
