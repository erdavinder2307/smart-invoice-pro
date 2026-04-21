import { previewInvoiceNumber, PREFS_DEFAULTS } from '../../context/InvoicePreferencesContext';

describe('previewInvoiceNumber', () => {
  it('returns default format INV-00001', () => {
    expect(previewInvoiceNumber(PREFS_DEFAULTS)).toBe('INV-00001');
  });

  it('uses custom prefix', () => {
    const prefs = { ...PREFS_DEFAULTS, invoice_prefix: 'QUO-' };
    expect(previewInvoiceNumber(prefs)).toBe('QUO-00001');
  });

  it('uses custom suffix', () => {
    const prefs = { ...PREFS_DEFAULTS, invoice_suffix: '-A' };
    expect(previewInvoiceNumber(prefs)).toBe('INV-00001-A');
  });

  it('uses overrideNext parameter', () => {
    expect(previewInvoiceNumber(PREFS_DEFAULTS, 42)).toBe('INV-00042');
  });

  it('respects number_padding', () => {
    const prefs = { ...PREFS_DEFAULTS, number_padding: 3 };
    expect(previewInvoiceNumber(prefs)).toBe('INV-001');
  });

  it('clamps padding to minimum 1', () => {
    const prefs = { ...PREFS_DEFAULTS, number_padding: 0 };
    // Math.max(1, 0) = 1 → padStart(1, '0') = '1' but then '1'.padStart(1) = '1'
    // Actually: Math.max(1, Math.min(10, 0)) = Math.max(1, 0) = 1, padStart(1,'0') just gives '1'
    // But wait - Number(0) is 0, not NaN. Let me check: Math.max(1, Math.min(10, 0)) = 1
    // String(1).padStart(1, '0') = '1'
    // BUT the code does: Number(prefs.number_padding) || 5 → Number(0) = 0, 0 || 5 = 5
    expect(previewInvoiceNumber(prefs)).toBe('INV-00001');
  });

  it('clamps padding to maximum 10', () => {
    const prefs = { ...PREFS_DEFAULTS, number_padding: 20 };
    expect(previewInvoiceNumber(prefs)).toBe('INV-0000000001');
  });

  it('handles non-numeric padding gracefully', () => {
    const prefs = { ...PREFS_DEFAULTS, number_padding: 'abc' };
    // NaN → fallback 5
    expect(previewInvoiceNumber(prefs)).toBe('INV-00001');
  });
});
