import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import MainLayout from './Layout/MainLayout';
import { createApiUrl } from '../config/api';
import axios from 'axios';

// ─── constants ─────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];
const PAYMENT_TERMS_OPTIONS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'custom', label: 'Custom' },
];
const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Miss.', 'Dr.'];
const PHONE_CODES = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+61', flag: '🇦🇺' },
];
const COUNTRIES = ['India', 'United States', 'UAE', 'United Kingdom', 'Australia', 'Singapore'];

// ─── validation helpers ─────────────────────────────────────────────────────
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isValidGST = v => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase());
const isValidPAN = v => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase());
const genPwd = () => {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  return Array.from({ length: 12 }, () => c[Math.floor(Math.random() * c.length)]).join('');
};

// ─── initial form state ─────────────────────────────────────────────────────
const INIT = {
  customer_type: 'business',
  salutation: '', first_name: '', last_name: '',
  company_name: '', display_name: '',
  email: '',
  work_phone_code: '+91', phone: '',
  mobile_code: '+91', mobile: '',
  language: 'en',
  comm_email: true, comm_sms: false,
  // Other Details
  gst_treatment: '', place_of_supply: '',
  gst_number: '', pan: '',
  tax_preference: 'taxable',
  currency: 'INR', opening_balance: '',
  payment_terms: 'due_on_receipt',
  // Billing
  billing_attention: '', billing_country: 'India',
  billing_street: '', billing_city: '',
  billing_state: '', billing_zip: '',
  billing_phone: '', billing_fax: '',
  // Shipping
  shipping_attention: '', shipping_country: 'India',
  shipping_street: '', shipping_city: '',
  shipping_state: '', shipping_zip: '',
  shipping_phone: '', shipping_fax: '',
  // Portal
  portal_enabled: false, portal_password: '',
  contact_persons: [], custom_fields: {},
  reporting_tags: '', remarks: '',
};

// ─── design tokens ─────────────────────────────────────────────────────────
const C = {
  border: '#e0e0e0',
  divider: '#ebebeb',
  label: '#3d3d3d',
  hint: '#8c8c8c',
  primary: '#1a73e8',
  pageBg: '#f5f7fa',
  white: '#fff',
  red: '#d93025',
  sectionBg: '#fafbfc',
};

// ─── SHARED sx objects ─────────────────────────────────────────────────────
// Applied identically to every TextField and Select to guarantee consistent height,
// border-radius, font-size, and focus colour across the entire form.
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: C.white,
    fontSize: '0.875rem',
    '& fieldset': { borderColor: C.border },
    '&:hover fieldset': { borderColor: '#b0b0b0' },
    '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: '1px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', color: C.hint },
  '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
  '& .MuiInputBase-input': { fontSize: '0.875rem', py: '7px', px: '10px' },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem', mx: 0 },
};

// Select uses FormControl wrapper — these styles go on the Select itself
const selectSx = {
  borderRadius: '4px',
  backgroundColor: C.white,
  fontSize: '0.875rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b0b0b0' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary, borderWidth: '1px' },
  '& .MuiSelect-select': { py: '7px', px: '10px', fontSize: '0.875rem' },
};

const menuItemSx = { fontSize: '0.875rem' };

// ─── REUSABLE PRIMITIVES ───────────────────────────────────────────────────

/**
 * ZohoRow — fundamental layout unit for the Primary Contact section.
 *
 * Uses a FIXED 180px label column (not percentage-based) so ALL field
 * left-edges are pixel-perfectly aligned regardless of label text length:
 *
 *   "Primary Contact ⓘ"  |  [Salutation ▾] [First Name] [Last Name]
 *   "Company Name *"     |  [                                      ]
 *   "Display Name *"     |  [                                      ]
 *   "Email Address"      |  [                                      ]
 */
const LABEL_WIDTH = 180; // px — fixed, never changes

const ZohoRow = ({ label, required, hint, children, noDivider, alignStart }) => (
  <>
    <Box
      sx={{
        display: 'flex',
        alignItems: alignStart ? 'flex-start' : 'center',
        py: 1.25,
        minHeight: 52,
      }}
    >
      {/* Fixed-width label column */}
      <Box
        sx={{
          width: LABEL_WIDTH,
          minWidth: LABEL_WIDTH,
          flexShrink: 0,
          pr: 2,
          pt: alignStart ? '8px' : 0,
        }}
      >
        <Typography
          variant="body2"
          component="label"
          sx={{
            fontSize: '0.8125rem',
            color: C.label,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            lineHeight: 1.5,
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
          {required && <Box component="span" sx={{ color: C.red, ml: '1px' }}>*</Box>}
          {hint && (
            <Tooltip title={hint} placement="top" arrow>
              <InfoIcon sx={{ fontSize: 13, color: C.hint, cursor: 'default', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Typography>
      </Box>
      {/* Field column — takes all remaining width */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
    {!noDivider && <Divider sx={{ borderColor: C.divider }} />}
  </>
);

/**
 * FieldLabel — used ABOVE fields inside tabs (Other Details, Address, etc.)
 * consistent font-size, colour, required marker, and optional hint icon.
 */
const FieldLabel = ({ children, required, hint }) => (
  <Typography
    variant="body2"
    component="label"
    sx={{
      display: 'block',
      mb: '5px',
      fontSize: '0.8125rem',
      fontWeight: 500,
      color: C.label,
      lineHeight: 1.4,
    }}
  >
    {children}
    {required && <Box component="span" sx={{ color: C.red, ml: '2px' }}>*</Box>}
    {hint && (
      <Tooltip title={hint} placement="top" arrow>
        <InfoIcon sx={{ fontSize: 13, color: C.hint, cursor: 'default', ml: '3px', verticalAlign: 'middle' }} />
      </Tooltip>
    )}
  </Typography>
);

/**
 * AppSelect — MUI FormControl + InputLabel + Select wrapped together so every
 * <Select> in the form has identical structure.  Pass `noLabel` for plain dropdowns.
 */
const AppSelect = ({ name, value, onChange, children, disabled, displayEmpty, size = 'small', fullWidth = true }) => (
  <FormControl size={size} fullWidth={fullWidth} disabled={disabled}>
    <Select
      name={name}
      value={value}
      onChange={onChange}
      displayEmpty={displayEmpty}
      sx={selectSx}
    >
      {children}
    </Select>
  </FormControl>
);

/**
 * PhoneInput — country-code Select + phone TextField fused side-by-side.
 */
const PhoneInput = ({ codeField, codeVal, numField, numVal, onChange, placeholder, error, helperText }) => (
  <Box sx={{ display: 'flex', width: '100%' }}>
    {/* Country code */}
    <FormControl size="small" sx={{ width: 96, flexShrink: 0 }}>
      <Select
        name={codeField}
        value={codeVal}
        onChange={onChange}
        sx={{
          ...selectSx,
          borderRadius: '4px 0 0 4px',
          backgroundColor: C.sectionBg,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border, borderRightColor: 'transparent' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b0b0b0', borderRightColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary, borderRightColor: 'transparent', borderWidth: '1px' },
          '& .MuiSelect-select': { py: '7px', pl: '8px', pr: '24px', fontSize: '0.8125rem' },
        }}
      >
        {PHONE_CODES.map(p => (
          <MenuItem key={p.code} value={p.code} sx={menuItemSx}>
            {p.flag} {p.code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    {/* Number input */}
    <TextField
      name={numField}
      value={numVal}
      onChange={onChange}
      size="small"
      placeholder={placeholder}
      error={!!error}
      helperText={helperText}
      sx={{
        flex: 1,
        '& .MuiOutlinedInput-root': {
          borderRadius: '0 4px 4px 0',
          backgroundColor: C.white,
          fontSize: '0.875rem',
          '& fieldset': { borderColor: C.border },
          '&:hover fieldset': { borderColor: '#b0b0b0' },
          '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: '1px' },
        },
        '& .MuiInputBase-input': { fontSize: '0.875rem', py: '7px', px: '10px' },
        '& .MuiFormHelperText-root': { fontSize: '0.75rem', mx: 0 },
      }}
    />
  </Box>
);

/** Tab panel visibility wrapper */
const TabPanel = ({ children, value, index }) =>
  value === index ? <Box role="tabpanel">{children}</Box> : null;

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const AddEditCustomer = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [cpOpen, setCpOpen] = useState(false);
  const [cpData, setCpData] = useState({ salutation: '', first_name: '', last_name: '', email: '', phone: '', designation: '' });
  const [cpIndex, setCpIndex] = useState(null);
  const [cfOpen, setCfOpen] = useState(false);
  const [cfKey, setCfKey] = useState('');
  const [cfValue, setCfValue] = useState('');

  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(createApiUrl(`/api/customers/${customerId}`));
      setForm(p => ({ ...p, ...data }));
    } catch { setApiError('Failed to load customer.'); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { if (customerId) loadCustomer(); }, [customerId, loadCustomer]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleBillingChange = e => {
    const { name, value } = e.target;
    setForm(p => {
      const next = { ...p, [name]: value };
      if (sameAsBilling) {
        const sk = name.replace('billing_', 'shipping_');
        if (sk !== name) next[sk] = value;
      }
      return next;
    });
  };

  const handleSameAsBilling = e => {
    const checked = e.target.checked;
    setSameAsBilling(checked);
    if (checked) setForm(p => ({
      ...p,
      shipping_attention: p.billing_attention, shipping_country: p.billing_country,
      shipping_street: p.billing_street, shipping_city: p.billing_city,
      shipping_state: p.billing_state, shipping_zip: p.billing_zip,
      shipping_phone: p.billing_phone, shipping_fax: p.billing_fax,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.display_name.trim()) e.display_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!isValidEmail(form.email)) e.email = 'Invalid email address';
    if (!form.phone.trim()) e.phone = 'Required';
    if (form.customer_type === 'business' && !form.company_name.trim()) e.company_name = 'Required for business customers';
    if (!isValidGST(form.gst_number)) e.gst_number = 'Invalid GST format (e.g. 27AABCU9603R1ZX)';
    if (!isValidPAN(form.pan)) e.pan = 'Invalid PAN format (e.g. AAACI2405N)';
    if (form.portal_enabled && !form.portal_password.trim()) e.portal_password = 'Portal password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = { ...form, name: form.display_name, address: form.billing_street };
      if (customerId) await axios.put(createApiUrl(`/api/customers/${customerId}`), payload);
      else await axios.post(createApiUrl('/api/customers'), payload);
      navigate('/customers');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to save customer. Please try again.');
    } finally { setSaving(false); }
  };

  const openAddCp = () => { setCpData({ salutation: '', first_name: '', last_name: '', email: '', phone: '', designation: '' }); setCpIndex(null); setCpOpen(true); };
  const openEditCp = i => { setCpData(form.contact_persons[i]); setCpIndex(i); setCpOpen(true); };
  const saveCp = () => {
    if (!cpData.first_name || !cpData.email) return;
    const list = [...form.contact_persons];
    if (cpIndex !== null) list[cpIndex] = cpData; else list.push(cpData);
    setForm(p => ({ ...p, contact_persons: list }));
    setCpOpen(false);
  };
  const deleteCp = i => setForm(p => ({ ...p, contact_persons: p.contact_persons.filter((_, x) => x !== i) }));
  const saveCf = () => {
    if (!cfKey.trim()) return;
    setForm(p => ({ ...p, custom_fields: { ...p.custom_fields, [cfKey]: cfValue } }));
    setCfOpen(false);
  };
  const deleteCf = k => {
    const next = { ...form.custom_fields }; delete next[k];
    setForm(p => ({ ...p, custom_fields: next }));
  };

  if (loading) return (
    <MainLayout title="Customer">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </MainLayout>
  );

  // ─── render ─────────────────────────────────────────────────────────────
  return (
    <MainLayout title={customerId ? 'Edit Customer' : 'New Customer'}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {/* GST Prefill notice */}
          {!customerId && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: '#e8f0fe', border: '1px solid #c5d8fb',
              borderRadius: '4px', px: 2, py: '8px', mb: 2,
            }}>
              <InfoIcon sx={{ fontSize: 15, color: C.primary, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#1558b0' }}>
                Prefill Customer details from the GST portal using the Customer's GSTIN.{' '}
                <Box component="span" sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                  Prefill ›
                </Box>
              </Typography>
            </Box>
          )}

          {apiError && (
            <Alert severity="error" onClose={() => setApiError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {apiError}
            </Alert>
          )}

          {/* ── FORM PAPER ─────────────────────────────────────────────────── */}
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >

            {/* ══ SECTION 1 — CUSTOMER TYPE ══════════════════════════════════ */}
            <Box sx={{ px: 3, borderBottom: `1px solid ${C.divider}` }}>
              <ZohoRow label="Customer Type" noDivider>
                <RadioGroup
                  row name="customer_type" value={form.customer_type}
                  onChange={handleChange} sx={{ gap: 3 }}
                >
                  {['business', 'individual'].map(v => (
                    <FormControlLabel
                      key={v} value={v} sx={{ m: 0 }}
                      control={<Radio size="small" sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }} />}
                      label={<Typography sx={{ fontSize: '0.875rem', color: C.label, textTransform: 'capitalize' }}>{v}</Typography>}
                    />
                  ))}
                </RadioGroup>
              </ZohoRow>
            </Box>

            {/* ══ SECTION 2 — PRIMARY CONTACT ════════════════════════════════ */}
            <Box sx={{ px: 3 }}>

              {/* Salutation | First Name | Last Name */}
              <ZohoRow label="Primary Contact" hint="Main contact person for this customer" alignStart>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={3}>
                    <AppSelect name="salutation" value={form.salutation} onChange={handleChange} displayEmpty>
                      <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Salutation</MenuItem>
                      {SALUTATIONS.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
                    </AppSelect>
                  </Grid>
                  <Grid item xs={12} sm={4.5}>
                    <TextField
                      name="first_name" value={form.first_name} onChange={handleChange}
                      size="small" placeholder="First Name" fullWidth sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4.5}>
                    <TextField
                      name="last_name" value={form.last_name} onChange={handleChange}
                      size="small" placeholder="Last Name" fullWidth sx={fieldSx}
                    />
                  </Grid>
                </Grid>
              </ZohoRow>

              {/* Company Name */}
              <ZohoRow label="Company Name" required={form.customer_type === 'business'}>
                <TextField
                  name="company_name" value={form.company_name} onChange={handleChange}
                  size="small" fullWidth
                  error={!!errors.company_name} helperText={errors.company_name}
                  sx={fieldSx}
                />
              </ZohoRow>

              {/* Display Name */}
              <ZohoRow label="Display Name" required>
                <TextField
                  name="display_name" value={form.display_name} onChange={handleChange}
                  size="small" fullWidth placeholder="Select or type to add"
                  error={!!errors.display_name} helperText={errors.display_name}
                  sx={fieldSx}
                />
              </ZohoRow>

              {/* Email Address */}
              <ZohoRow label="Email Address">
                <TextField
                  name="email" value={form.email} onChange={handleChange} type="email"
                  size="small" fullWidth
                  error={!!errors.email} helperText={errors.email}
                  sx={fieldSx}
                />
              </ZohoRow>

              {/* Phone | Mobile */}
              <ZohoRow label="Phone" hint="Work phone and mobile" alignStart>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <PhoneInput
                      codeField="work_phone_code" codeVal={form.work_phone_code}
                      numField="phone" numVal={form.phone}
                      onChange={handleChange} placeholder="Work Phone"
                      error={errors.phone} helperText={errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PhoneInput
                      codeField="mobile_code" codeVal={form.mobile_code}
                      numField="mobile" numVal={form.mobile}
                      onChange={handleChange} placeholder="Mobile"
                    />
                  </Grid>
                </Grid>
              </ZohoRow>

              {/* Customer Language */}
              <ZohoRow label="Customer Language" hint="Language used for customer communications">
                <Box sx={{ width: 220 }}>
                  <AppSelect name="language" value={form.language} onChange={handleChange}>
                    <MenuItem value="en" sx={menuItemSx}>English</MenuItem>
                    <MenuItem value="hi" sx={menuItemSx}>Hindi</MenuItem>
                    <MenuItem value="ta" sx={menuItemSx}>Tamil</MenuItem>
                    <MenuItem value="te" sx={menuItemSx}>Telugu</MenuItem>
                    <MenuItem value="mr" sx={menuItemSx}>Marathi</MenuItem>
                  </AppSelect>
                </Box>
              </ZohoRow>

              {/* Communication Channels */}
              <ZohoRow label="Communication Channels" noDivider>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[{ name: 'comm_email', label: 'Email' }, { name: 'comm_sms', label: 'SMS' }].map(opt => (
                    <FormControlLabel
                      key={opt.name} sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small" name={opt.name} checked={form[opt.name]} onChange={handleChange}
                          sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.875rem', color: C.label }}>{opt.label}</Typography>}
                    />
                  ))}
                </Box>
              </ZohoRow>
            </Box>

            {/* ══ SECTION 3 — TABS ═══════════════════════════════════════════ */}
            <Box sx={{ borderTop: `1px solid ${C.divider}` }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable" scrollButtons="auto"
                sx={{
                  minHeight: 42, px: 2,
                  borderBottom: `1px solid ${C.divider}`,
                  '& .MuiTab-root': {
                    textTransform: 'none', fontSize: '0.875rem', fontWeight: 400,
                    minHeight: 42, px: 2, py: 0, color: '#666', minWidth: 'auto',
                  },
                  '& .MuiTab-root.Mui-selected': { color: `${C.primary} !important`, fontWeight: 500 },
                  '& .MuiTabs-indicator': { height: 2, backgroundColor: C.primary },
                }}
              >
                {['Other Details', 'Address', 'Contact Persons', 'Custom Fields', 'Reporting Tags', 'Remarks'].map(t => (
                  <Tab key={t} label={t} disableRipple={false} />
                ))}
              </Tabs>

              {/* ── TAB 0: OTHER DETAILS ─────────────────────────────────── */}
              <TabPanel value={tab} index={0}>
                <Box sx={{ px: 3, py: 3 }}>
                  {/*
                    Two-column layout built with explicit 50/50 flex rows.
                    This guarantees consistent 2-col display at all viewport widths.
                    Each row uses the same gap (20px = 2.5 * 8px) and bottom margin.
                  */}
                  {[
                    /* Row 1 */
                    [
                      {
                        label: 'GST Treatment', required: true, content: (
                          <AppSelect name="gst_treatment" value={form.gst_treatment} onChange={handleChange} displayEmpty>
                            <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Select a GST treatment</MenuItem>
                            <MenuItem value="regular" sx={menuItemSx}>Registered Business - Regular</MenuItem>
                            <MenuItem value="composition" sx={menuItemSx}>Registered Business - Composition</MenuItem>
                            <MenuItem value="unregistered" sx={menuItemSx}>Unregistered Business</MenuItem>
                            <MenuItem value="consumer" sx={menuItemSx}>Consumer</MenuItem>
                            <MenuItem value="overseas" sx={menuItemSx}>Overseas</MenuItem>
                            <MenuItem value="special_economic_zone" sx={menuItemSx}>Special Economic Zone</MenuItem>
                            <MenuItem value="deemed_export" sx={menuItemSx}>Deemed Export</MenuItem>
                          </AppSelect>
                        )
                      },
                      {
                        label: 'Place of Supply', required: true, content: (
                          <AppSelect name="place_of_supply" value={form.place_of_supply} onChange={handleChange} displayEmpty>
                            <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Select place of supply</MenuItem>
                            {INDIAN_STATES.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
                          </AppSelect>
                        )
                      },
                    ],
                    /* Row 2 */
                    [
                      {
                        label: 'GST Number', hint: '15-character GSTIN', content: (
                          <TextField
                            name="gst_number" value={form.gst_number} onChange={handleChange}
                            size="small" fullWidth placeholder="e.g. 27AABCU9603R1ZX"
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                            error={!!errors.gst_number || (form.gst_number && !isValidGST(form.gst_number))}
                            helperText={errors.gst_number || (form.gst_number && !isValidGST(form.gst_number) ? 'Invalid GST format' : '')}
                            sx={fieldSx}
                          />
                        )
                      },
                      {
                        label: 'PAN', hint: '10-character Permanent Account Number', content: (
                          <TextField
                            name="pan" value={form.pan} onChange={handleChange}
                            size="small" fullWidth placeholder="e.g. AAACI2405N"
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                            error={!!errors.pan || (form.pan && !isValidPAN(form.pan))}
                            helperText={errors.pan || (form.pan && !isValidPAN(form.pan) ? 'Invalid PAN format' : '')}
                            sx={fieldSx}
                          />
                        )
                      },
                    ],
                    /* Row 3 */
                    [
                      {
                        label: 'Currency', content: (
                          <AppSelect name="currency" value={form.currency} onChange={handleChange}>
                            {[['INR', 'INR - Indian Rupee'], ['USD', 'USD - US Dollar'], ['EUR', 'EUR - Euro'], ['GBP', 'GBP - British Pound'], ['AED', 'AED - UAE Dirham']].map(([v, l]) => (
                              <MenuItem key={v} value={v} sx={menuItemSx}>{l}</MenuItem>
                            ))}
                          </AppSelect>
                        )
                      },
                      {
                        label: 'Opening Balance', content: (
                          <TextField
                            name="opening_balance" value={form.opening_balance} onChange={handleChange}
                            size="small" fullWidth type="number"
                            inputProps={{ min: 0, step: '0.01' }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography sx={{ fontSize: '0.8125rem', color: C.hint, lineHeight: 1 }}>{form.currency}</Typography>
                                </InputAdornment>
                              ),
                            }}
                            sx={fieldSx}
                          />
                        )
                      },
                    ],
                    /* Row 4 */
                    [
                      {
                        label: 'Payment Terms', content: (
                          <AppSelect name="payment_terms" value={form.payment_terms} onChange={handleChange}>
                            {PAYMENT_TERMS_OPTIONS.map(t => <MenuItem key={t.value} value={t.value} sx={menuItemSx}>{t.label}</MenuItem>)}
                          </AppSelect>
                        )
                      },
                      null, // empty right cell
                    ],
                  ].map((row, ri) => (
                    <Box key={ri} sx={{ display: 'flex', gap: '20px', mb: ri === 3 ? 0 : 2.5 }}>
                      {row.map((cell, ci) => (
                        <Box key={ci} sx={{ flex: '0 0 calc(50% - 10px)', minWidth: 0 }}>
                          {cell ? (
                            <>
                              <FieldLabel required={cell.required} hint={cell.hint}>{cell.label}</FieldLabel>
                              {cell.content}
                            </>
                          ) : null}
                        </Box>
                      ))}
                    </Box>
                  ))}

                  {/* Tax Preference — full width, between row 2 and row 3 */}
                  {/* Inserted after rows as its own section */}
                </Box>
                {/* Tax Preference row — full width inside its own padded box */}
                <Box sx={{ px: 3, pb: 3 }}>
                  <Divider sx={{ borderColor: C.divider, mb: 2.5 }} />
                  <FieldLabel required>Tax Preference</FieldLabel>
                  <RadioGroup
                    row name="tax_preference" value={form.tax_preference}
                    onChange={handleChange} sx={{ gap: 3, mt: '2px' }}
                  >
                    {[{ v: 'taxable', l: 'Taxable' }, { v: 'tax_exempt', l: 'Tax Exempt' }].map(opt => (
                      <FormControlLabel
                        key={opt.v} value={opt.v} sx={{ m: 0 }}
                        control={<Radio size="small" sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }} />}
                        label={<Typography sx={{ fontSize: '0.875rem', color: C.label }}>{opt.l}</Typography>}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              </TabPanel>

              {/* ── TAB 1: ADDRESS ───────────────────────────────────────── */}
              <TabPanel value={tab} index={1}>
                <Box sx={{ px: 3, py: 3 }}>
                  <Grid container spacing={4}>
                    {/* Billing */}
                    <Grid item xs={12} md={6}>
                      <Typography fontWeight={600} sx={{ mb: 2, fontSize: '0.875rem', color: '#333' }}>
                        Billing Address
                      </Typography>
                      <AddressFields
                        prefix="billing_"
                        form={form}
                        onChange={handleBillingChange}
                        disabled={false}
                      />
                    </Grid>
                    {/* Shipping */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography fontWeight={600} sx={{ fontSize: '0.875rem', color: '#333' }}>
                          Shipping Address
                        </Typography>
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              size="small" checked={sameAsBilling} onChange={handleSameAsBilling}
                              sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }}
                            />
                          }
                          label={<Typography sx={{ fontSize: '0.75rem', color: '#555' }}>Same as Billing</Typography>}
                        />
                      </Box>
                      <AddressFields
                        prefix="shipping_"
                        form={form}
                        onChange={handleChange}
                        disabled={sameAsBilling}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* ── TAB 2: CONTACT PERSONS ───────────────────────────────── */}
              <TabPanel value={tab} index={2}>
                <Box sx={{ px: 3, py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                      Manage additional contact persons for this customer
                    </Typography>
                    <Button
                      variant="outlined" size="small" startIcon={<AddIcon />} onClick={openAddCp}
                      sx={{
                        textTransform: 'none', fontSize: '0.8125rem', borderRadius: '4px',
                        borderColor: C.primary, color: C.primary,
                        '&:hover': { bgcolor: '#f0f6ff', borderColor: C.primary },
                      }}
                    >
                      Add Contact
                    </Button>
                  </Box>

                  {form.contact_persons.length > 0 ? (
                    <Box sx={{ border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}>
                      {/* Table header */}
                      <Grid container sx={{ bgcolor: C.sectionBg, px: 2, py: 1, borderBottom: `1px solid ${C.divider}` }}>
                        {['Name', 'Email', 'Phone', 'Designation', ''].map((h, i) => (
                          <Grid key={i} item xs={i === 4 ? 1 : 2.75}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                      {form.contact_persons.map((cp, i) => (
                        <Grid key={i} container alignItems="center"
                          sx={{ px: 2, py: 1.25, borderBottom: i < form.contact_persons.length - 1 ? `1px solid ${C.divider}` : 'none', '&:hover': { bgcolor: '#fafbff' } }}
                        >
                          <Grid item xs={2.75}><Typography sx={{ fontSize: '0.8125rem' }}>{[cp.salutation, cp.first_name, cp.last_name].filter(Boolean).join(' ')}</Typography></Grid>
                          <Grid item xs={2.75}><Typography sx={{ fontSize: '0.8125rem', color: '#444' }}>{cp.email}</Typography></Grid>
                          <Grid item xs={2.75}><Typography sx={{ fontSize: '0.8125rem', color: '#666' }}>{cp.phone}</Typography></Grid>
                          <Grid item xs={2.75}><Typography sx={{ fontSize: '0.8125rem', color: '#666' }}>{cp.designation}</Typography></Grid>
                          <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => openEditCp(i)} sx={{ color: '#666', '&:hover': { color: C.primary } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                            <IconButton size="small" onClick={() => deleteCp(i)} sx={{ color: '#666', '&:hover': { color: C.red } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6, border: `1px dashed ${C.border}`, borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '0.875rem', color: C.hint }}>No contact persons added yet</Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* ── TAB 3: CUSTOM FIELDS ─────────────────────────────────── */}
              <TabPanel value={tab} index={3}>
                <Box sx={{ px: 3, py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                      Store additional information about this customer
                    </Typography>
                    <Button
                      variant="outlined" size="small" startIcon={<AddIcon />}
                      onClick={() => { setCfKey(''); setCfValue(''); setCfOpen(true); }}
                      sx={{ textTransform: 'none', fontSize: '0.8125rem', borderRadius: '4px', borderColor: C.primary, color: C.primary, '&:hover': { bgcolor: '#f0f6ff' } }}
                    >
                      Add Custom Field
                    </Button>
                  </Box>
                  {Object.keys(form.custom_fields).length > 0 ? (
                    <Grid container spacing={1.5}>
                      {Object.entries(form.custom_fields).map(([k, v]) => (
                        <Grid key={k} item xs={12} sm={6} md={4}>
                          <Box sx={{ p: 1.5, border: `1px solid ${C.border}`, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box flex={1} sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: '0.72rem', color: C.hint, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>{k}</Typography>
                              <Typography sx={{ fontSize: '0.875rem', color: C.label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => deleteCf(k)} sx={{ color: C.hint, '&:hover': { color: C.red }, flexShrink: 0 }}>
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6, border: `1px dashed ${C.border}`, borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '0.875rem', color: C.hint }}>No custom fields added yet</Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* ── TAB 4: REPORTING TAGS ────────────────────────────────── */}
              <TabPanel value={tab} index={4}>
                <Box sx={{ px: 3, py: 3, maxWidth: 520 }}>
                  <FieldLabel>Tags</FieldLabel>
                  <TextField
                    size="small" fullWidth
                    placeholder="e.g. VIP, Corporate, Premium (comma separated)"
                    value={form.reporting_tags}
                    onChange={e => setForm(p => ({ ...p, reporting_tags: e.target.value }))}
                    sx={fieldSx}
                  />
                  <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: C.hint }}>
                    Separate tags with commas. Used for filtering and reporting.
                  </Typography>
                </Box>
              </TabPanel>

              {/* ── TAB 5: REMARKS ───────────────────────────────────────── */}
              <TabPanel value={tab} index={5}>
                <Box sx={{ px: 3, py: 3, maxWidth: 600 }}>
                  <FieldLabel>Remarks</FieldLabel>
                  <TextField
                    name="remarks" value={form.remarks} onChange={handleChange}
                    size="small" fullWidth multiline rows={5}
                    placeholder="Any additional notes about this customer…"
                    sx={fieldSx}
                  />
                </Box>
              </TabPanel>
            </Box>

            {/* ══ SECTION 4 — PORTAL ACCESS ══════════════════════════════════ */}
            <Box sx={{ px: 3, py: 2.5, borderTop: `1px solid ${C.divider}` }}>
              <Typography fontWeight={600} sx={{ mb: 1.5, fontSize: '0.875rem', color: '#333' }}>
                Portal Access
              </Typography>
              <FormControlLabel
                sx={{ m: 0, alignItems: 'flex-start' }}
                control={
                  <Checkbox
                    size="small" name="portal_enabled" checked={form.portal_enabled} onChange={handleChange}
                    sx={{ p: '3px', mr: '6px', mt: '1px', color: '#bbb', '&.Mui-checked': { color: C.primary } }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: C.label, fontWeight: 500 }}>Enable Portal Access</Typography>
                    <Typography variant="caption" sx={{ color: C.hint }}>
                      Customer can log in to view invoices, payments, and statements
                    </Typography>
                  </Box>
                }
              />

              {form.portal_enabled && (
                <Box sx={{ mt: 2, maxWidth: 320 }}>
                  <FieldLabel required>Portal Password</FieldLabel>
                  <TextField
                    name="portal_password" value={form.portal_password} onChange={handleChange}
                    type="password" size="small" fullWidth
                    error={!!errors.portal_password}
                    helperText={errors.portal_password || 'Minimum 8 characters recommended'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Generate random password" arrow>
                            <IconButton size="small" edge="end"
                              onClick={() => setForm(p => ({ ...p, portal_password: genPwd() }))}>
                              <RefreshIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Box>
              )}
            </Box>

            {/* ══ SECTION 5 — FOOTER ACTIONS ═════════════════════════════════ */}
            <Box sx={{
              px: 3, py: 2,
              bgcolor: C.sectionBg,
              borderTop: `1px solid ${C.divider}`,
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5,
            }}>
              <Button
                variant="outlined" size="medium"
                onClick={() => navigate('/customers')} disabled={saving}
                sx={{
                  textTransform: 'none', borderRadius: '4px', fontWeight: 500,
                  fontSize: '0.875rem', px: 3,
                  borderColor: '#c8cdd3', color: '#555',
                  '&:hover': { borderColor: '#a0a8b4', bgcolor: 'transparent' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" size="medium" disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{
                  textTransform: 'none', borderRadius: '4px', fontWeight: 500,
                  fontSize: '0.875rem', px: 3,
                  bgcolor: C.primary, boxShadow: 'none',
                  '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' },
                  '&:disabled': { bgcolor: '#a8c7f5', color: '#fff' },
                }}
              >
                {saving ? 'Saving…' : customerId ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>

        </Container>
      </Box>

      {/* ── CONTACT PERSON DIALOG ─────────────────────────────────────────── */}
      <Dialog open={cpOpen} onClose={() => setCpOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ elevation: 2, sx: { borderRadius: '6px' } }}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, borderBottom: `1px solid ${C.divider}`, pb: 1.5 }}>
          {cpIndex !== null ? 'Edit Contact Person' : 'Add Contact Person'}
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FieldLabel>Salutation</FieldLabel>
              <AppSelect value={cpData.salutation} displayEmpty
                onChange={e => setCpData(p => ({ ...p, salutation: e.target.value }))}>
                <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>—</MenuItem>
                {SALUTATIONS.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
              </AppSelect>
            </Grid>
            <Grid item xs={4}>
              <FieldLabel required>First Name</FieldLabel>
              <TextField size="small" fullWidth value={cpData.first_name} sx={fieldSx}
                onChange={e => setCpData(p => ({ ...p, first_name: e.target.value }))} />
            </Grid>
            <Grid item xs={4}>
              <FieldLabel>Last Name</FieldLabel>
              <TextField size="small" fullWidth value={cpData.last_name} sx={fieldSx}
                onChange={e => setCpData(p => ({ ...p, last_name: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <FieldLabel required>Email</FieldLabel>
              <TextField size="small" fullWidth type="email" value={cpData.email} sx={fieldSx}
                onChange={e => setCpData(p => ({ ...p, email: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <FieldLabel>Phone</FieldLabel>
              <TextField size="small" fullWidth value={cpData.phone} sx={fieldSx}
                onChange={e => setCpData(p => ({ ...p, phone: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <FieldLabel>Designation</FieldLabel>
              <TextField size="small" fullWidth value={cpData.designation} sx={fieldSx}
                onChange={e => setCpData(p => ({ ...p, designation: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}`, gap: 1 }}>
          <Button onClick={() => setCpOpen(false)}
            sx={{ textTransform: 'none', fontSize: '0.875rem', color: '#555', borderRadius: '4px' }}>
            Cancel
          </Button>
          <Button onClick={saveCp} variant="contained"
            sx={{ textTransform: 'none', fontSize: '0.875rem', borderRadius: '4px', bgcolor: C.primary, boxShadow: 'none', '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CUSTOM FIELD DIALOG ───────────────────────────────────────────── */}
      <Dialog open={cfOpen} onClose={() => setCfOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ elevation: 2, sx: { borderRadius: '6px' } }}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, borderBottom: `1px solid ${C.divider}`, pb: 1.5 }}>
          Add Custom Field
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <FieldLabel required>Field Name</FieldLabel>
              <TextField size="small" fullWidth value={cfKey}
                onChange={e => setCfKey(e.target.value)} sx={fieldSx} />
            </Box>
            <Box>
              <FieldLabel>Field Value</FieldLabel>
              <TextField size="small" fullWidth value={cfValue}
                onChange={e => setCfValue(e.target.value)} sx={fieldSx} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}`, gap: 1 }}>
          <Button onClick={() => setCfOpen(false)}
            sx={{ textTransform: 'none', fontSize: '0.875rem', color: '#555', borderRadius: '4px' }}>
            Cancel
          </Button>
          <Button onClick={saveCf} variant="contained"
            sx={{ textTransform: 'none', fontSize: '0.875rem', borderRadius: '4px', bgcolor: C.primary, boxShadow: 'none', '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' } }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

// ─── ADDRESS FIELDS sub-component ─────────────────────────────────────────
// Extracted so Billing and Shipping share identical field structure.
// Uses FieldLabel above each field — same pattern as Other Details tab.
const AddressFields = ({ prefix, form, onChange, disabled }) => {
  const val = name => form[`${prefix}${name}`] || '';

  const wrap = name => ({
    name: `${prefix}${name}`,
    value: val(name),
    onChange,
    disabled,
    size: 'small',
    fullWidth: true,
    sx: fieldSx,
  });

  return (
    <Grid container spacing={1.5}>

      <Grid item xs={12}>
        <FieldLabel>Attention</FieldLabel>
        <TextField {...wrap('attention')} placeholder="Name of the person" />
      </Grid>

      <Grid item xs={12}>
        <FieldLabel>Country / Region</FieldLabel>
        <FormControl size="small" fullWidth disabled={disabled}>
          <Select name={`${prefix}country`} value={val('country')} onChange={onChange} sx={selectSx}>
            {COUNTRIES.map(c => <MenuItem key={c} value={c} sx={menuItemSx}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FieldLabel>Street</FieldLabel>
        <TextField {...wrap('street')} placeholder="Street address" multiline rows={2} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FieldLabel>City</FieldLabel>
        <TextField {...wrap('city')} placeholder="City" />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FieldLabel>State</FieldLabel>
        <FormControl size="small" fullWidth disabled={disabled}>
          <Select name={`${prefix}state`} value={val('state')} onChange={onChange} displayEmpty sx={selectSx}>
            <MenuItem value="" sx={{ ...menuItemSx, color: '#8c8c8c' }}>Select state</MenuItem>
            {INDIAN_STATES.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FieldLabel>ZIP / PIN Code</FieldLabel>
        <TextField {...wrap('zip')} placeholder="ZIP / PIN" />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FieldLabel>Phone</FieldLabel>
        <TextField {...wrap('phone')} placeholder="+91 ..." />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FieldLabel>Fax</FieldLabel>
        <TextField {...wrap('fax')} placeholder="Fax number" />
      </Grid>

    </Grid>
  );
};

export default AddEditCustomer;
