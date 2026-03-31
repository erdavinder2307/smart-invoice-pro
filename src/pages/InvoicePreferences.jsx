import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import BrushIcon from '@mui/icons-material/Brush';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ExtensionIcon from '@mui/icons-material/Extension';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAuth } from '../context/AuthContext';
import { useInvoicePreferences, PREFS_DEFAULTS } from '../context/InvoicePreferencesContext';
import {
  C,
  ZohoRow,
  fieldSx,
  footerSx,
  saveBtnSx,
} from '../components/common/formStyles';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import { updateInvoicePreferences } from '../services/invoicePreferencesService';

// ── Settings sub-nav ──────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  { label: 'Organization Profile', path: '/settings/organization-profile', icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
  { label: 'Branding',             path: '/settings/branding',             icon: <BrushIcon sx={{ fontSize: 18 }} /> },
  { label: 'Invoice Preferences',  path: '/settings/invoice-preferences',  icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
  { label: 'Taxes',                path: '/settings/taxes',                icon: <ReceiptLongIcon sx={{ fontSize: 18 }} /> },
  { label: 'User Management',      path: '/settings/users',                icon: <PeopleIcon sx={{ fontSize: 18 }} /> },
  { label: 'Roles',      path: '/settings/roles',      icon: <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> },
  { label: 'Automation', path: '/settings/automation',  icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} /> },
  { label: 'Integrations', path: '/settings/integrations', icon: <ExtensionIcon sx={{ fontSize: 18 }} /> },
  { label: 'Audit Log',     path: '/settings/audit-log',    icon: <HistoryIcon sx={{ fontSize: 18 }} /> },
];

const PAYMENT_TERMS_OPTIONS = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'];

function SettingsSubNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Paper
      elevation={0}
      sx={{
        width: 210,
        flexShrink: 0,
        bgcolor: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: '4px',
        alignSelf: 'flex-start',
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${C.divider}` }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: C.hint,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Settings
        </Typography>
      </Box>
      <List disablePadding>
        {SETTINGS_NAV.map(({ label, path, icon }) => {
          const isActive = pathname === path || pathname.startsWith(path);
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                py: 0.875,
                px: 2,
                borderLeft: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                bgcolor: isActive ? '#e8f0fe' : 'transparent',
                '&:hover': { bgcolor: isActive ? '#e8f0fe' : C.sectionBg },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: isActive ? C.primary : C.hint }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.primary : C.label,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

function SectionHeader({ children }) {
  return (
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333', textAlign: 'left' }}>
        {children}
      </Typography>
    </Box>
  );
}

// ── Live preview chip ─────────────────────────────────────────────────────────
function NumberPreview({ prefix, suffix, padding, next }) {
  const padded = Math.max(1, Math.min(10, Number(padding) || 5));
  const n      = Number(next) || 1;
  const sample = `${prefix}${String(n).padStart(padded, '0')}${suffix}`;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        mt: 1,
        px: 2,
        py: 0.75,
        bgcolor: '#f0f4ff',
        border: `1px solid #c7d7f9`,
        borderRadius: '4px',
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', color: C.hint }}>Preview:</Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>
        {sample}
      </Typography>
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
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>

            {/* Left settings sub-nav */}
            <SettingsSubNav />

            {/* Main form card */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
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

                  <ZohoRow label="Auto-generate Number">
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
                  </ZohoRow>

                  <FormInput
                    label="Prefix"
                    hint='Text before the number, e.g. "INV-"'
                    value={form.invoice_prefix}
                    onChange={(e) => set('invoice_prefix', e.target.value)}
                    inputProps={{ maxLength: 20 }}
                    error={!!fieldErrors.invoice_prefix}
                    helperText={fieldErrors.invoice_prefix || ' '}
                    sx={{ width: 200 }}
                  />

                  <FormInput
                    label="Suffix"
                    hint='Optional text after the number, e.g. "-2026"'
                    value={form.invoice_suffix}
                    onChange={(e) => set('invoice_suffix', e.target.value)}
                    inputProps={{ maxLength: 20 }}
                    placeholder="(none)"
                    error={!!fieldErrors.invoice_suffix}
                    helperText={fieldErrors.invoice_suffix || ' '}
                    sx={{ width: 200 }}
                  />

                  <FormInput
                    label="Next Number"
                    hint="The counter that will be assigned to the next new invoice."
                    type="number"
                    value={form.next_invoice_number}
                    onChange={(e) => set('next_invoice_number', e.target.value === '' ? '' : Number(e.target.value))}
                    inputProps={{ min: 1, step: 1, style: { fontFamily: 'monospace' } }}
                    error={!!fieldErrors.next_invoice_number}
                    helperText={fieldErrors.next_invoice_number || ' '}
                    sx={{ width: 140 }}
                  />

                  <ZohoRow
                    label="Zero-padding Width"
                    hint="Length to pad the number to with leading zeros (1–10)."
                    noDivider
                  >
                    <Box>
                      <TextField
                        size="small"
                        type="number"
                        value={form.number_padding}
                        onChange={(e) => set('number_padding', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{ min: 1, max: 10, step: 1 }}
                        error={!!fieldErrors.number_padding}
                        helperText={fieldErrors.number_padding || ' '}
                        sx={{ ...fieldSx, width: 100 }}
                      />
                      <NumberPreview
                        prefix={form.invoice_prefix}
                        suffix={form.invoice_suffix}
                        padding={form.number_padding}
                        next={form.next_invoice_number}
                      />
                    </Box>
                  </ZohoRow>
                </Box>

                {/* ══ PAYMENT TERMS ══════════════════════════════════════════ */}
                <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                  <SectionHeader>Payment Terms</SectionHeader>

                  <FormSelect
                    label="Default Payment Terms"
                    hint="Applied to new invoices when no term is specified."
                    value={form.default_payment_terms}
                    onChange={(e) => set('default_payment_terms', e.target.value)}
                    width={200}
                    options={PAYMENT_TERMS_OPTIONS.map((t) => ({ value: t, label: t }))}
                  />

                  <ZohoRow
                    label="Default Due Days"
                    hint="Days after issue date to set due date automatically (e.g. 30 for Net 30)."
                    noDivider
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={form.default_due_days}
                        onChange={(e) => set('default_due_days', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{ min: 0, step: 1 }}
                        error={!!fieldErrors.default_due_days}
                        helperText={fieldErrors.default_due_days || ' '}
                        sx={{ ...fieldSx, width: 120 }}
                      />
                      <Typography sx={{ fontSize: '0.8125rem', color: C.hint, mb: 2.5 }}>days</Typography>
                    </Box>
                  </ZohoRow>
                </Box>

                {/* ══ DEFAULT CONTENT ════════════════════════════════════════ */}
                <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
                  <SectionHeader>Default Content</SectionHeader>

                  <FormInput
                    label="Customer Notes"
                    hint="Pre-filled in the Notes field of every new invoice."
                    multiline
                    rows={3}
                    value={form.default_notes}
                    onChange={(e) => set('default_notes', e.target.value)}
                    inputProps={{ maxLength: 2000 }}
                    placeholder="e.g. Thank you for your business."
                  />

                  <FormInput
                    label="Terms & Conditions"
                    hint="Pre-filled in the Terms & Conditions field of every new invoice."
                    noDivider
                    multiline
                    rows={3}
                    value={form.default_terms}
                    onChange={(e) => set('default_terms', e.target.value)}
                    inputProps={{ maxLength: 2000 }}
                    placeholder="e.g. Payment due within 30 days."
                  />
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
