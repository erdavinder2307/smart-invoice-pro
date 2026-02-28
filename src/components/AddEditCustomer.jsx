import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  NavigateNext as NavigateNextIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import MainLayout from './Layout/MainLayout';
import { createApiUrl } from '../config/api';
import axios from 'axios';

// ─── shared field styling (Zoho-like: subtle, compact, standard variant) ───────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    bgcolor: '#fff',
    fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#a9b4c0' },
    '&.Mui-focused fieldset': { borderColor: '#1a73e8', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
};

// ─── tab panel ───────────────────────────────────────────────────────────────
const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

// ─── password generator ───────────────────────────────────────────────────────
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ─── initial form state ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  customer_type: 'business',
  salutation: '',
  first_name: '',
  last_name: '',
  company_name: '',
  display_name: '',
  email: '',
  phone: '',
  mobile: '',
  language: 'en',
  // Other Details
  gst_treatment: '',
  place_of_supply: '',
  gst_number: '',
  pan: '',
  tax_preference: 'taxable',
  currency: 'INR',
  opening_balance: '',
  payment_terms: 'due_on_receipt',
  // Billing Address
  billing_street: '',
  billing_city: '',
  billing_state: '',
  billing_zip: '',
  billing_country: 'India',
  // Shipping Address
  shipping_street: '',
  shipping_city: '',
  shipping_state: '',
  shipping_zip: '',
  shipping_country: 'India',
  // Portal
  portal_enabled: false,
  portal_password: '',
  // Remarks
  remarks: '',
};

// ─── STATES for India (commonly used in GST) ─────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

const PAYMENT_TERMS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'custom', label: 'Custom' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AddEditCustomer = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [tab, setTab] = useState(0);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // ── load existing customer if editing ─────────────────────────────────────
  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(createApiUrl(`/api/customers/${customerId}`));
      setForm(prev => ({ ...prev, ...data }));
    } catch {
      setApiError('Failed to load customer. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) loadCustomer();
  }, [customerId, loadCustomer]);

  // ── field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── billing → shipping sync ───────────────────────────────────────────────
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (sameAsBilling) {
        const shippingKey = name.replace('billing_', 'shipping_');
        updated[shippingKey] = value;
      }
      return updated;
    });
  };

  const handleSameAsBillingChange = (e) => {
    const checked = e.target.checked;
    setSameAsBilling(checked);
    if (checked) {
      setForm(prev => ({
        ...prev,
        shipping_street: prev.billing_street,
        shipping_city: prev.billing_city,
        shipping_state: prev.billing_state,
        shipping_zip: prev.billing_zip,
        shipping_country: prev.billing_country,
      }));
    }
  };

  // ── validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.display_name.trim()) e.display_name = 'Display name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (form.customer_type === 'business' && !form.company_name.trim()) {
      e.company_name = 'Company name is required for Business type';
    }
    if (form.portal_enabled && !form.portal_password.trim()) {
      e.portal_password = 'Set a password to enable portal access';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        ...form,
        // backward-compat aliases
        name: form.display_name,
        address: form.billing_street,
      };
      if (customerId) {
        await axios.put(createApiUrl(`/api/customers/${customerId}`), payload);
      } else {
        await axios.post(createApiUrl('/api/customers'), payload);
      }
      navigate('/customers');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Customer">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={customerId ? 'Edit Customer' : 'New Customer'}>
      {/* ── Page shell: light grey background ── */}
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="xl" sx={{ pt: 2 }}>

          {/* ── Breadcrumb ── */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { color: 'text.disabled' } }}
          >
            <Link
              underline="hover"
              color="inherit"
              sx={{ fontSize: '0.8125rem', cursor: 'pointer' }}
              onClick={() => navigate('/customers')}
            >
              Customers
            </Link>
            <Typography color="text.primary" sx={{ fontSize: '0.8125rem' }}>
              {customerId ? 'Edit Customer' : 'New Customer'}
            </Typography>
          </Breadcrumbs>

          {/* ── Page Title ── */}
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
            {customerId ? 'Edit Customer' : 'New Customer'}
          </Typography>

          {/* ── GST Prefill Banner ── */}
          {!customerId && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#e8f0fe',
              border: '1px solid #c5d8fb',
              borderRadius: 1,
              px: 2,
              py: 1,
              mb: 2,
            }}>
              <InfoIcon sx={{ fontSize: 18, color: '#1a73e8' }} />
              <Typography variant="body2" sx={{ color: '#1a73e8' }}>
                Prefill Customer details from the GST portal using the Customer's GSTIN.{' '}
                <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                  Prefill &rsaquo;
                </Box>
              </Typography>
            </Box>
          )}

          {/* ── API Error ── */}
          {apiError && (
            <Alert severity="error" onClose={() => setApiError('')} sx={{ mb: 2, borderRadius: 1 }}>
              {apiError}
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              FLAT WHITE FORM PANEL (single Paper, no nested cards)
          ═══════════════════════════════════════════════════════════════════ */}
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {/* ────────────────────────────────────────────────────────────────
                1. CUSTOMER TYPE
            ──────────────────────────────────────────────────────────────── */}
            <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                Customer Type
              </Typography>
              <RadioGroup
                row
                name="customer_type"
                value={form.customer_type}
                onChange={handleChange}
                sx={{ gap: 3 }}
              >
                <FormControlLabel
                  value="business"
                  control={<Radio size="small" sx={{ py: 0.5 }} />}
                  label={<Typography variant="body2">Business</Typography>}
                />
                <FormControlLabel
                  value="individual"
                  control={<Radio size="small" sx={{ py: 0.5 }} />}
                  label={<Typography variant="body2">Individual</Typography>}
                />
              </RadioGroup>
            </Box>

            {/* ────────────────────────────────────────────────────────────────
                2. PRIMARY CONTACT
            ──────────────────────────────────────────────────────────────── */}
            <Box sx={{ px: 4, py: 2.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Primary Contact
                <span style={{ color: '#d32f2f', marginLeft: 2 }}>*</span>
                <Tooltip title="The main contact person for this customer" placement="top">
                  <InfoIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'pointer' }} />
                </Tooltip>
              </Typography>
              
              <Grid container spacing={1.5}>
                {/* Row 1: Salutation | First Name | Last Name */}
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small" sx={fieldSx}>
                    <InputLabel>Salutation</InputLabel>
                    <Select
                      name="salutation"
                      value={form.salutation}
                      label="Salutation"
                      onChange={handleChange}
                    >
                      <MenuItem value="">—</MenuItem>
                      {['Mr.', 'Mrs.', 'Ms.', 'Miss.', 'Dr.'].map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="First Name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Last Name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    sx={fieldSx}
                  />
                </Grid>

                {/* Row 2: Company Name (full width) */}
                {form.customer_type === 'business' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Company Name"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      required
                      error={!!errors.company_name}
                      helperText={errors.company_name}
                      sx={fieldSx}
                    />
                  </Grid>
                )}

                {/* Row 3: Display Name (full width) */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Display Name"
                    name="display_name"
                    value={form.display_name}
                    onChange={handleChange}
                    required
                    error={!!errors.display_name}
                    helperText={errors.display_name || 'This will be used in all transactions'}
                    sx={fieldSx}
                  />
                </Grid>

                {/* Row 4: Email (full width) */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>

                {/* Row 5: Work Phone | Mobile */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Work Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>

                {/* Row 6: Language */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" sx={fieldSx}>
                    <InputLabel>Customer Language</InputLabel>
                    <Select
                      name="language"
                      value={form.language}
                      label="Customer Language"
                      onChange={handleChange}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">Hindi</MenuItem>
                      <MenuItem value="ta">Tamil</MenuItem>
                      <MenuItem value="te">Telugu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* ────────────────────────────────────────────────────────────────
                3. TABBED SECTION
            ──────────────────────────────────────────────────────────────── */}
            <Box sx={{ px: 4, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    minHeight: 44,
                    px: 2,
                    color: 'text.secondary',
                  },
                  '& .Mui-selected': {
                    color: '#1a73e8 !important',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1a73e8',
                    height: 2,
                  },
                }}
              >
                <Tab label="Other Details" />
                <Tab label="Address" />
                <Tab label="Contact Persons" />
                <Tab label="Custom Fields" disabled />
                <Tab label="Reporting Tags" disabled />
                <Tab label="Remarks" />
              </Tabs>

              {/* ── Tab 0: Other Details ── */}
              <TabPanel value={tab} index={0}>
                <Grid container spacing={1.5} sx={{ pb: 2 }}>
                  {/* Row 1: GST Treatment | Place of Supply */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" sx={fieldSx}>
                      <InputLabel>GST Treatment</InputLabel>
                      <Select
                        name="gst_treatment"
                        value={form.gst_treatment}
                        label="GST Treatment"
                        onChange={handleChange}
                        displayEmpty
                      >
                        <MenuItem value=""><em>Select a GST treatment</em></MenuItem>
                        <MenuItem value="regular">Regular</MenuItem>
                        <MenuItem value="composition">Composition</MenuItem>
                        <MenuItem value="unregistered">Unregistered</MenuItem>
                        <MenuItem value="consumer">Consumer</MenuItem>
                        <MenuItem value="overseas">Overseas</MenuItem>
                        <MenuItem value="special_economic_zone">Special Economic Zone</MenuItem>
                        <MenuItem value="deemed_export">Deemed Export</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" sx={fieldSx}>
                      <InputLabel>Place of Supply</InputLabel>
                      <Select
                        name="place_of_supply"
                        value={form.place_of_supply}
                        label="Place of Supply"
                        onChange={handleChange}
                        displayEmpty
                      >
                        <MenuItem value=""><em>Select state</em></MenuItem>
                        {INDIAN_STATES.map(s => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Row 2: GST Number | PAN */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="GST Number"
                      name="gst_number"
                      value={form.gst_number}
                      onChange={handleChange}
                      placeholder="e.g. 27AABCU9603R1ZX"
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="PAN"
                      name="pan"
                      value={form.pan}
                      onChange={handleChange}
                      placeholder="e.g. AAACI2405N"
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      sx={fieldSx}
                    />
                  </Grid>

                  {/* Row 3: Tax Preference | Currency */}
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}>
                        Tax Preference
                      </Typography>
                      <RadioGroup
                        row
                        name="tax_preference"
                        value={form.tax_preference}
                        onChange={handleChange}
                        sx={{ gap: 3 }}
                      >
                        <FormControlLabel
                          value="taxable"
                          control={<Radio size="small" sx={{ py: 0.5 }} />}
                          label={<Typography variant="body2">Taxable</Typography>}
                        />
                        <FormControlLabel
                          value="tax_exempt"
                          control={<Radio size="small" sx={{ py: 0.5 }} />}
                          label={<Typography variant="body2">Tax Exempt</Typography>}
                        />
                      </RadioGroup>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" sx={fieldSx}>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        name="currency"
                        value={form.currency}
                        label="Currency"
                        onChange={handleChange}
                      >
                        <MenuItem value="INR">INR – Indian Rupee</MenuItem>
                        <MenuItem value="USD">USD – US Dollar</MenuItem>
                        <MenuItem value="EUR">EUR – Euro</MenuItem>
                        <MenuItem value="GBP">GBP – British Pound</MenuItem>
                        <MenuItem value="AED">AED – UAE Dirham</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Row 4: Opening Balance | Payment Terms */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Opening Balance"
                      name="opening_balance"
                      type="number"
                      value={form.opening_balance}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" color="text.secondary">
                              {form.currency === 'INR' ? '₹' : form.currency === 'USD' ? '$' : form.currency === 'EUR' ? '€' : '£'}
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0, step: '0.01' }}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" sx={fieldSx}>
                      <InputLabel>Payment Terms</InputLabel>
                      <Select
                        name="payment_terms"
                        value={form.payment_terms}
                        label="Payment Terms"
                        onChange={handleChange}
                      >
                        {PAYMENT_TERMS.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* ── Tab 1: Address ── */}
              <TabPanel value={tab} index={1}>
                <Grid container spacing={3} sx={{ pb: 2 }}>
                  {/* Billing Address */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                      Billing Address
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12}>
                        <TextField fullWidth size="small" label="Street" name="billing_street"
                          value={form.billing_street} onChange={handleBillingChange} multiline rows={2} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="City" name="billing_city"
                          value={form.billing_city} onChange={handleBillingChange} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" sx={fieldSx}>
                          <InputLabel>State</InputLabel>
                          <Select name="billing_state" value={form.billing_state}
                            label="State" onChange={handleBillingChange}>
                            <MenuItem value=""><em>Select</em></MenuItem>
                            {INDIAN_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="PIN Code" name="billing_zip"
                          value={form.billing_zip} onChange={handleBillingChange} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Country" name="billing_country"
                          value={form.billing_country} onChange={handleBillingChange} sx={fieldSx} />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Shipping Address */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'text.primary' }}>
                        Shipping Address
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={sameAsBilling}
                            onChange={handleSameAsBillingChange}
                          />
                        }
                        label={<Typography variant="caption">Same as Billing</Typography>}
                        sx={{ m: 0 }}
                      />
                    </Box>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12}>
                        <TextField fullWidth size="small" label="Street" name="shipping_street"
                          value={form.shipping_street} onChange={handleChange}
                          disabled={sameAsBilling} multiline rows={2} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="City" name="shipping_city"
                          value={form.shipping_city} onChange={handleChange}
                          disabled={sameAsBilling} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" sx={fieldSx}>
                          <InputLabel>State</InputLabel>
                          <Select name="shipping_state" value={form.shipping_state}
                            label="State" onChange={handleChange} disabled={sameAsBilling}>
                            <MenuItem value=""><em>Select</em></MenuItem>
                            {INDIAN_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="PIN Code" name="shipping_zip"
                          value={form.shipping_zip} onChange={handleChange}
                          disabled={sameAsBilling} sx={fieldSx} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Country" name="shipping_country"
                          value={form.shipping_country} onChange={handleChange}
                          disabled={sameAsBilling} sx={fieldSx} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* ── Tab 2: Contact Persons ── */}
              <TabPanel value={tab} index={2}>
                <Box sx={{ pb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Add additional contact persons for this customer.
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ borderRadius: '4px', textTransform: 'none' }}>
                    + Add Contact Person
                  </Button>
                </Box>
              </TabPanel>

              {/* ── Tab 5: Remarks ── */}
              <TabPanel value={tab} index={5}>
                <Box sx={{ pb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Remarks"
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Any additional notes about this customer"
                    sx={fieldSx}
                  />
                </Box>
              </TabPanel>
            </Box>

            {/* ────────────────────────────────────────────────────────────────
                4. PORTAL ACCESS — no card, minimal
            ──────────────────────────────────────────────────────────────── */}
            <Box sx={{ px: 4, py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                Portal Access
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    name="portal_enabled"
                    checked={form.portal_enabled}
                    onChange={handleChange}
                    sx={{ py: 0.5 }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Enable Portal Access</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customer can log in to view invoices, payments, and statements
                    </Typography>
                  </Box>
                }
              />

              {form.portal_enabled && (
                <Box sx={{ mt: 2, maxWidth: 360 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Portal Password"
                    name="portal_password"
                    type="password"
                    value={form.portal_password}
                    onChange={handleChange}
                    error={!!errors.portal_password}
                    helperText={errors.portal_password || 'Minimum 8 characters recommended'}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Generate random password">
                            <IconButton
                              size="small"
                              onClick={() => setForm(prev => ({ ...prev, portal_password: generatePassword() }))}
                              edge="end"
                            >
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

            {/* ────────────────────────────────────────────────────────────────
                5. FOOTER ACTIONS — right-aligned
            ──────────────────────────────────────────────────────────────── */}
            <Box
              sx={{
                px: 4,
                py: 2,
                bgcolor: '#fafafa',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                variant="outlined"
                size="medium"
                onClick={() => navigate('/customers')}
                disabled={saving}
                sx={{
                  textTransform: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  px: 3,
                  borderColor: '#d0d5dd',
                  color: 'text.secondary',
                  '&:hover': { borderColor: '#aab0bc', bgcolor: 'transparent' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="medium"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  textTransform: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  px: 3,
                  bgcolor: '#1a73e8',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' },
                }}
              >
                {saving ? 'Saving…' : customerId ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditCustomer;
