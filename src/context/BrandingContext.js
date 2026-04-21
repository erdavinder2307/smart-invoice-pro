import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import baseTheme from '../theme';
import { getBranding } from '../services/brandingService';

const BrandingContext = createContext(null);

// ── Defaults matching the backend ─────────────────────────────────────────────
export const BRANDING_DEFAULTS = {
  primary_color:   '#2563EB',
  secondary_color: '#10B981',
  accent_color:    '#2d6cdf',
  logo_url:        '',
  email_header_logo_url: '',
  invoice_template_settings: { show_logo: true, show_signature: false },
};

function buildTheme(branding) {
  return createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: {
        ...baseTheme.palette.primary,
        main:          branding.primary_color   || BRANDING_DEFAULTS.primary_color,
        dark:          adjustLightness(branding.primary_color   || BRANDING_DEFAULTS.primary_color, -20),
        light:         adjustLightness(branding.primary_color   || BRANDING_DEFAULTS.primary_color, +20),
        contrastText:  '#FFFFFF',
      },
      secondary: {
        ...baseTheme.palette.secondary,
        main:         branding.secondary_color || BRANDING_DEFAULTS.secondary_color,
        dark:         adjustLightness(branding.secondary_color || BRANDING_DEFAULTS.secondary_color, -20),
        light:        adjustLightness(branding.secondary_color || BRANDING_DEFAULTS.secondary_color, +20),
        contrastText: '#FFFFFF',
      },
    },
  });
}

/** Very simple lightness nudge — shifts hex colour ±shift (clamped to 0-255 per channel). */
function adjustLightness(hex, shift) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = clamp(((n >> 16) & 0xff) + shift);
    const g = clamp(((n >> 8)  & 0xff) + shift);
    const b = clamp((n & 0xff)         + shift);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  } catch {
    return hex;
  }
}

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(BRANDING_DEFAULTS);
  const [, setLoaded]     = useState(false);

  const refreshBranding = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;              // not authenticated yet
      const data = await getBranding();
      setBranding((prev) => ({ ...prev, ...data }));
    } catch {
      // silently fall back to defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  // Load on mount (once the user may already be logged in)
  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  const theme = useMemo(() => buildTheme(branding), [branding]);

  const value = useMemo(
    () => ({ branding, setBranding, refreshBranding }),
    [branding, setBranding, refreshBranding],
  );

  return (
    <BrandingContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used inside BrandingProvider');
  return ctx;
}
