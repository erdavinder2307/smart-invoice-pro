/**
 * OrgGstContext
 * =============
 * Provides the organisation's GST registration mode to every component
 * that needs it, without forcing each page to re-fetch /api/settings/gst-config.
 *
 * gst_mode values (mirrors backend org_tax_mode.py):
 *   'FULL_GST'    – Regular taxpayer. Full CGST/SGST/IGST on sales.
 *   'COMPOSITION' – Composition scheme. GSTIN required, no tax charged on sales.
 *   'NO_GST'      – Unregistered. No GSTIN required, no GST on any document.
 *
 * Convenience booleans derived from gst_mode:
 *   isGstEnabled      – true for FULL_GST and COMPOSITION
 *   isSalesTaxAllowed – true ONLY for FULL_GST (Composition cannot charge on sales)
 *   isComposition     – true when COMPOSITION
 *   isUnregistered    – true when NO_GST
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createApiUrl } from '../config/api';

const OrgGstContext = createContext(null);

const DEFAULT_STATE = {
  loading: true,
  error: null,
  gst_mode: 'FULL_GST',          // safe default — actual value loaded on mount
  gst_registration_type: 'regular',
  gst_enabled: true,
  gstin: '',
  seller_state: '',
  // derived
  isGstEnabled: true,
  isSalesTaxAllowed: true,
  isComposition: false,
  isUnregistered: false,
};

function deriveFlags(gst_mode) {
  return {
    isGstEnabled:      gst_mode !== 'NO_GST',
    isSalesTaxAllowed: gst_mode === 'FULL_GST',
    isComposition:     gst_mode === 'COMPOSITION',
    isUnregistered:    gst_mode === 'NO_GST',
  };
}

export function OrgGstProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);

  const loadGstConfig = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const res = await fetch(createApiUrl('/api/settings/gst-config'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const gst_mode = data.gst_mode || 'FULL_GST';
      setState({
        loading: false,
        error: null,
        gst_mode,
        gst_registration_type: data.gst_registration_type || 'regular',
        gst_enabled: data.gst_enabled ?? true,
        gstin: data.gstin || '',
        seller_state: data.seller_state || '',
        ...deriveFlags(gst_mode),
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
        // Keep safe defaults so the app doesn't break on transient failures
        ...deriveFlags('FULL_GST'),
      }));
    }
  }, []);

  useEffect(() => {
    loadGstConfig();
  }, [loadGstConfig]);

  const value = useMemo(
    () => ({ ...state, reload: loadGstConfig }),
    [state, loadGstConfig],
  );

  return <OrgGstContext.Provider value={value}>{children}</OrgGstContext.Provider>;
}

export function useOrgGst() {
  const ctx = useContext(OrgGstContext);
  if (!ctx) {
    throw new Error('useOrgGst must be used inside OrgGstProvider');
  }
  return ctx;
}

export default OrgGstContext;
