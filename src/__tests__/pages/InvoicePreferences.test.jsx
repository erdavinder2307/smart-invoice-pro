import React from 'react';
import { renderWithProviders, screen } from '../../test-utils';
import { useAuth } from '../../context/AuthContext';
import { useInvoicePreferences } from '../../context/InvoicePreferencesContext';
import InvoicePreferences from '../../pages/InvoicePreferences';

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../context/InvoicePreferencesContext', () => ({
  PREFS_DEFAULTS: {
    invoice_prefix: 'INV-',
    invoice_suffix: '',
    next_invoice_number: 101,
    number_padding: 5,
    default_payment_terms: 'Net 30',
    default_due_days: 30,
    default_notes: 'Thank you for your business.',
    default_terms: 'Payment due within 30 days.',
    auto_generate_invoice_number: true,
  },
  useInvoicePreferences: jest.fn(),
}));

jest.mock('../../services/invoicePreferencesService', () => ({
  updateInvoicePreferences: jest.fn(),
}));

describe('InvoicePreferences layout', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ isAdmin: true });
    useInvoicePreferences.mockReturnValue({
      prefs: {
        invoice_prefix: 'INV-',
        invoice_suffix: '',
        next_invoice_number: 101,
        number_padding: 5,
        default_payment_terms: 'Net 30',
        default_due_days: 30,
        default_notes: 'Thank you for your business.',
        default_terms: 'Payment due within 30 days.',
        auto_generate_invoice_number: true,
      },
      setPrefs: jest.fn(),
    });
  });

  it('renders shared layout hooks for preferences fields', async () => {
    renderWithProviders(<InvoicePreferences />, { route: '/settings/invoice-preferences' });

    expect(await screen.findByText('Invoice Numbering')).toBeInTheDocument();

    expect(screen.getByTestId('invoice-pref-field-auto-generate')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('invoice-pref-field-preview')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('invoice-pref-field-notes')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('invoice-pref-field-terms')).toHaveAttribute('data-layout', 'full');

    [
      'invoice-pref-field-prefix',
      'invoice-pref-field-suffix',
      'invoice-pref-field-next-number',
      'invoice-pref-field-padding',
      'invoice-pref-field-payment-terms',
      'invoice-pref-field-due-days',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });
  });
});