import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  InputAdornment,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAuth } from '../context/AuthContext';
import { useInvoicePreferences, PREFS_DEFAULTS } from '../context/InvoicePreferencesContext';
import {
  AppSelect,
  C,
  fieldSx,
  footerSx,
  saveBtnSx,
} from '../components/common/formStyles';
import AppFormField from '../components/common/form/AppFormField';
import FormLayout from '../components/common/form/FormLayout';
import { updateInvoicePreferences } from '../services/invoicePreferencesService';

const PAYMENT_TERMS_OPTIONS = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'];

function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333', textAlign: 'left' }}>
        {children}
      </Typography>
    </Box>
  );
}

// ── Live preview ──────────────────────────────────────────────────────────────
function NumberPreview({ prefix, suffix, padding, next }) {
  const padded = Math.max(1, Math.min(10, Number(padding) || 5));
  const n      = Number(next) || 1;
  const sample = `${prefix}${String(n).padStart(padded, '0')}${suffix}`;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 34,
        px: 1.25,
        bgcolor: 'action.hover',
        border: `1px solid ${C.border}`,
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: 700,
        fontFamily: 'monospace',
        color: C.primary,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {sample}
    </Box>
  );
}

// ── Empty form matching backend defaults ──────────────────────────────────────
const EMPTY = {
  invoice_prefix:               PREFS_DEFAULTS.invoice_prefix,
  invoice_suffix:               PREFS_DEFAULTS.invoice_suffix,
  next_invoice_number:          PREFS_DEFAULTS.next_invoice_number,
  number_padding:               PREFS_DEFAULTS.number_padding,
  default_payment_terms:        PREFS_DEFAULTS.default_payment_terms,
  default_due_days:             PREFS_DEFAULTS.default_due_days,
  default_notes:                PREFS_DEFAULTS.default_notes,
  default_terms:                PREFS_DEFAULTS.default_terms,
  auto_generate_invoice_number: PREFS_DEFAULTS.auto_generate_invoice_number,
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InvoicePreferences() {
  const { isAdmin } = useAuth();
  const { prefs: ctxPrefs, setPrefs: setCtxPrefs } = useInvoicePreferences();
  const navigate = useNavigate();

  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Admin guard
  useEffect(() => {
    if (!isAdmin) navigate('/dashboard', { replace: true });
  }, [isAdmin, navigate]);

  // Populate form from context once loaded
  useEffect(() => {
    if (!isAdmin) return;
    setForm({
      invoice_prefix:               ctxPrefs.invoice_prefix               ?? PREFS_DEFAULTS.invoice_prefix,
      invoice_suffix:               ctxPrefs.invoice_suffix               ?? PREFS_DEFAULTS.invoice_suffix,
      next_invoice_number:          ctxPrefs.next_invoice_number          ?? PREFS_DEFAULTS.next_invoice_number,
      number_padding:               ctxPrefs.number_padding               ?? PREFS_DEFAULTS.number_padding,
      default_payment_terms:        ctxPrefs.default_payment_terms        ?? PREFS_DEFAULTS.default_payment_terms,
      default_due_days:             ctxPrefs.default_due_days             ?? PREFS_DEFAULTS.default_due_days,
      default_notes:                ctxPrefs.default_notes                ?? PREFS_DEFAULTS.default_notes,
      default_terms:                ctxPrefs.default_terms                ?? PREFS_DEFAULTS.default_terms,
      auto_generate_invoice_number: ctxPrefs.auto_generate_invoice_number ?? PREFS_DEFAULTS.auto_generate_invoice_number,
    });
    setLoading(false);
  }, [ctxPrefs, isAdmin]);

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!String(form.invoice_prefix || '').trim()) errs.invoice_prefix = 'Prefix cannot be empty.';
    if (String(form.invoice_prefix || '').length > 20) errs.invoice_prefix = 'Max 20 characters.';
    if (String(form.invoice_suffix || '').length > 20) errs.invoice_suffix = 'Max 20 characters.';
    const n = Number(form.next_invoice_number);
    if (!Number.isInteger(n) || n < 1) errs.next_invoice_number = 'Must be a positive integer ≥ 1.';
    const p = Number(form.number_padding);
    if (!Number.isInteger(p) || p < 1 || p > 10) errs.number_padding = 'Must be between 1 and 10.';
    const d = Number(form.default_due_days);
    if (!Number.isInteger(d) || d < 0) errs.default_due_days = 'Must be a non-negative integer.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        next_invoice_number: Number(form.next_invoice_number),
        number_padding:      Number(form.number_padding),
        default_due_days:    Number(form.default_due_days),
      };
      const saved = await updateInvoicePreferences(payload);
      setCtxPrefs((prev) => ({ ...prev, ...saved }));
      setToast({ open: true, message: 'Invoice preferences saved.', severity: 'success' });
    } catch (err) {
      const fields = err.response?.data?.fields;
      if (fields) {
        setFieldErrors(fields);
        setToast({ open: true, message: 'Please fix the highlighted errors.', severity: 'error' });
      } else {
        const msg = err.response?.data?.error || 'Failed to save preferences.';
        setToast({ open: true, message: msg, severity: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY);
    setFieldErrors({});
  };

  if (loading) {
    return (
      <MainLayout title="Invoice Preferences">
        <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh' }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Invoice Preferences">
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth={false} sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>

            {/* Main form card */}
            <Box sx={{ minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >

                {/* ══ INVOICE NUMBERING ══════════════════════════════════════ */}
                <Box sx={{ px: 3 }}>
                  <SectionHeader>Invoice Numbering</SectionHeader>

                  <FormLayout>
                    <AppFormField label="Auto-generate Number" testId="invoice-pref-field-auto-generate">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.auto_generate_invoice_number}
                            onChange={(e) => set('auto_generate_invoice_number', e.target.checked)}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: '0.8125rem', color: C.label }}>
                            {form.auto_generate_invoice_number
                              ? 'Backend generates & increments the number automatically'
                              : 'Manually enter invoice number'}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </AppFormField>

                    <AppFormField label="Prefix" hint='Text before the number, e.g. "INV-"' layout="half" testId="invoice-pref-field-prefix">
                      <TextField
                        value={form.invoice_prefix}
                        onChange={(e) => set('invoice_prefix', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ maxLength: 20 }}
                        error={!!fieldErrors.invoice_prefix}
                        helperText={fieldErrors.invoice_prefix || ' '}
                        sx={fieldSx}
                      />
                    </AppFormField>

                    <AppFormField label="Suffix" hint='Optional text after the number, e.g. "-2026"' layout="half" testId="invoice-pref-field-suffix">
                      <TextField
                        value={form.invoice_suffix}
                        onChange={(e) => set('invoice_suffix', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ maxLength: 20 }}
                        placeholder="(none)"
                        error={!!fieldErrors.invoice_suffix}
                        helperText={fieldErrors.invoice_suffix || ' '}
                        sx={fieldSx}
                      />
                    </AppFormField>

                    <AppFormField label="Next Number" hint="The counter that will be assigned to the next new invoice." layout="half" testId="invoice-pref-field-next-number">
                      <TextField
                        type="number"
                        value={form.next_invoice_number}
                        onChange={(e) => set('next_invoice_number', e.target.value === '' ? '' : Number(e.target.value))}
                        size="small"
                        fullWidth
                        inputProps={{ min: 1, step: 1, style: { fontFamily: 'monospace' } }}
                        error={!!fieldErrors.next_invoice_number}
                        helperText={fieldErrors.next_invoice_number || ' '}
                        sx={fieldSx}
                      />
                    </AppFormField>

                    <AppFormField label="Zero-padding Width" hint="Length to pad the number to with leading zeros (1–10)." layout="half" testId="invoice-pref-field-padding">
                      <TextField
                        type="number"
                        value={form.number_padding}
                        onChange={(e) => set('number_padding', e.target.value === '' ? '' : Number(e.target.value))}
                        size="small"
                        fullWidth
                        inputProps={{ min: 1, max: 10, step: 1 }}
                        error={!!fieldErrors.number_padding}
                        helperText={fieldErrors.number_padding || ' '}
                        sx={fieldSx}
                      />
                    </AppFormField>

                    <AppFormField label="Preview" testId="invoice-pref-field-preview">
                      <NumberPreview
                        prefix={form.invoice_prefix}
                        suffix={form.invoice_suffix}
                        padding={form.number_padding}
                        next={form.next_invoice_number}
                      />
                    </AppFormField>
                  </FormLayout>
                </Box>

                {/* ══ PAYMENT TERMS ══════════════════════════════════════════ */}
                <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                  <SectionHeader>Payment Terms</SectionHeader>

                  <FormLayout>
                    <AppFormField label="Default Payment Terms" hint="Applied to new invoices when no term is specified." layout="half" testId="invoice-pref-field-payment-terms">
                      <AppSelect value={form.default_payment_terms} onChange={(e) => set('default_payment_terms', e.target.value)}>
                        {PAYMENT_TERMS_OPTIONS.map((term) => (
                          <MenuItem key={term} value={term}>{term}</MenuItem>
                        ))}
                      </AppSelect>
                    </AppFormField>

                    <AppFormField label="Default Due Days" hint="Days after issue date to set due date automatically (e.g. 30 for Net 30)." layout="half" testId="invoice-pref-field-due-days">
                      <TextField
                        type="number"
                        value={form.default_due_days}
                        onChange={(e) => set('default_due_days', e.target.value === '' ? '' : Number(e.target.value))}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 1 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>days</Typography>
                            </InputAdornment>
                          ),
                        }}
                        error={!!fieldErrors.default_due_days}
                        helperText={fieldErrors.default_due_days || ' '}
                        sx={fieldSx}
                      />
                    </AppFormField>
                  </FormLayout>
                </Box>

                {/* ══ DEFAULT CONTENT ════════════════════════════════════════ */}
                <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                  <SectionHeader>Default Content</SectionHeader>

                  <FormLayout>
                    <AppFormField label="Customer Notes" hint="Pre-filled in the Notes field of every new invoice." testId="invoice-pref-field-notes">
                      <TextField
                        multiline
                        rows={3}
                        value={form.default_notes}
                        onChange={(e) => set('default_notes', e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 2000 }}
                        placeholder="e.g. Thank you for your business."
                        sx={fieldSx}
                      />
                    </AppFormField>

                    <AppFormField label="Terms & Conditions" hint="Pre-filled in the Terms & Conditions field of every new invoice." testId="invoice-pref-field-terms">
                      <TextField
                        multiline
                        rows={3}
                        value={form.default_terms}
                        onChange={(e) => set('default_terms', e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 2000 }}
                        placeholder="e.g. Payment due within 30 days."
                        sx={fieldSx}
                      />
                    </AppFormField>
                  </FormLayout>
                </Box>

                {/* ══ FOOTER ═════════════════════════════════════════════════ */}
                <Box sx={footerSx}>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                    onClick={handleReset}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.8125rem',
                      color: C.hint,
                      mr: 1,
                      '&:hover': { color: C.label },
                    }}
                  >
                    Reset to Defaults
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={saveBtnSx}
                  >
                    {saving ? 'Saving…' : 'Save Preferences'}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
