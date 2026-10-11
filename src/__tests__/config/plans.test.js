import { PLANS, priceWithGst, formatInr } from '../../config/plans';

describe('plan config', () => {
  it('adds 18% GST and rounds to whole rupees', () => {
    expect(priceWithGst(599)).toBe(707);
    expect(priceWithGst(5999)).toBe(7079);
    expect(priceWithGst(1499)).toBe(1769);
  });

  it('formats rupees with Indian grouping', () => {
    expect(formatInr(5999)).toBe('₹5,999');
  });

  it('has Starter and Growth with the agreed prices and seats', () => {
    const byCode = Object.fromEntries(PLANS.map((p) => [p.code, p]));
    expect(byCode.starter.prices).toEqual({ monthly: 599, yearly: 5999 });
    expect(byCode.starter.seats).toBe(3);
    expect(byCode.growth.prices).toEqual({ monthly: 1499 });
    expect(byCode.growth.seats).toBe(10);
  });
});
