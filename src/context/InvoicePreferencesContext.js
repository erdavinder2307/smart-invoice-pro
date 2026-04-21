import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getInvoicePreferences } from '../services/invoicePreferencesService';

const InvoicePreferencesContext = createContext(null);

export const PREFS_DEFAULTS = {
  invoice_prefix:               'INV-',
  invoice_suffix:               '',
  next_invoice_number:          1,
  number_padding:               5,
  default_payment_terms:        'Net 30',
  default_due_days:             30,
  default_notes:                'Thank you for your business.',
  default_terms:                'Payment due within 30 days.',
  auto_generate_invoice_number: true,
};

export function InvoicePreferencesProvider({ children }) {
  const [prefs, setPrefs]   = useState(PREFS_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const refreshPrefs = useCallback(async () => {
    try {
      const data = await getInvoicePreferences();
      setPrefs({ ...PREFS_DEFAULTS, ...data });
    } catch {
      // keep defaults on network error (e.g. not yet logged in)
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshPrefs();
  }, [refreshPrefs]);

  return (
    <InvoicePreferencesContext.Provider value={{ prefs, setPrefs, refreshPrefs, loaded }}>
      {children}
    </InvoicePreferencesContext.Provider>
  );
}

export function useInvoicePreferences() {
  const ctx = useContext(InvoicePreferencesContext);
  if (!ctx) throw new Error('useInvoicePreferences must be used inside InvoicePreferencesProvider');
  return ctx;
}

/** Format the preview number exactly as backend would (JS-side, for display only). */
export function previewInvoiceNumber(prefs, overrideNext) {
  const prefix  = prefs.invoice_prefix  || 'INV-';
  const suffix  = prefs.invoice_suffix  || '';
  const padding = Math.max(1, Math.min(10, Number(prefs.number_padding) || 5));
  const n       = overrideNext != null ? overrideNext : (Number(prefs.next_invoice_number) || 1);
  return `${prefix}${String(n).padStart(padding, '0')}${suffix}`;
}
