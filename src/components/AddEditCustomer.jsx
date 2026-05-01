import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  InfoOutlined as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import MainLayout from './Layout/MainLayout';
import AppFormField from './common/form/AppFormField';
import FormLayout from './common/form/FormLayout';
import { C, fieldSx, selectSx, menuItemSx, ZohoRow, FieldLabel, AppSelect } from './common/formStyles';
import { createApiUrl } from '../config/api';
import axios from 'axios';
import { getCustomers } from '../services/customerService';
import { findDuplicateCustomer, getDuplicateFieldLabel } from '../utils/customerData';
import useAutoFill from '../hooks/useAutoFill';
import { useFormSubmitShortcut } from '../hooks/useFormSubmitShortcut';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generateCustomerMockData } from '../utils/mockDataGenerators';
import { parseApiError, applyApiErrors } from '../utils/apiErrors';
import { scrollToFirstError } from '../utils/validation';

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
const EMPTY_CP = {
  salutation: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  mobile: '',
  designation: '',
};

const TAB_CONFIG = [
  {
    labelKey: 'customerForm.tabs.otherDetails',
    fields: [
      'gst_treatment', 'place_of_supply', 'gst_number', 'pan', 'tax_preference',
      'currency', 'opening_balance', 'payment_terms', 'custom_payment_terms',
      'website_url', 'department', 'designation', 'x_handle', 'skype', 'facebook',
      'portal_enabled', 'portal_password', 'documents',
    ],
  },
  {
    labelKey: 'customerForm.tabs.address',
    fields: [
      'billing_attention', 'billing_country', 'billing_street', 'billing_street2', 'billing_city',
      'billing_state', 'billing_zip', 'billing_phone_code', 'billing_phone', 'billing_fax',
      'shipping_attention', 'shipping_country', 'shipping_street', 'shipping_street2', 'shipping_city',
      'shipping_state', 'shipping_zip', 'shipping_phone_code', 'shipping_phone', 'shipping_fax',
    ],
  },
  {
    labelKey: 'customerForm.tabs.contactPersons',
    fields: ['contact_persons', 'contact_persons_editor'],
  },
  {
    labelKey: 'customerForm.tabs.customFields',
    fields: ['custom_fields', 'custom_fields_editor'],
  },
  {
    labelKey: 'customerForm.tabs.reportingTags',
    fields: ['reporting_tags'],
  },
  {
    labelKey: 'customerForm.tabs.remarks',
    fields: ['remarks'],
  },
];

// ─── validation helpers ─────────────────────────────────────────────────────
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isValidGST = v => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase());
const isValidPAN = v => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase());

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
  custom_payment_terms: '',
  website_url: '', department: '', designation: '',
  x_handle: '', skype: '', facebook: '',
  documents: [],
  // Billing
  billing_attention: '', billing_country: 'India',
  billing_street: '', billing_street2: '', billing_city: '',
  billing_state: '', billing_zip: '',
  billing_phone_code: '+91', billing_phone: '', billing_fax: '',
  // Shipping
  shipping_attention: '', shipping_country: 'India',
  shipping_street: '', shipping_street2: '', shipping_city: '',
  shipping_state: '', shipping_zip: '',
  shipping_phone_code: '+91', shipping_phone: '', shipping_fax: '',
  // Portal
  portal_enabled: false, portal_password: '',
  contact_persons: [], custom_fields: {},
  reporting_tags: '', remarks: '',
};


const splitStreetLines = street => {
  const [line1 = '', ...rest] = String(street || '').split(/\r?\n/);
  return { line1, line2: rest.join(' ').trim() };
};


const SearchableTextSelect = ({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  freeSolo = false,
}) => (
  <Autocomplete
    fullWidth
    freeSolo={freeSolo}
    disabled={disabled}
    options={options}
    value={value || null}
    onChange={(_, nextValue) => onValueChange(name, typeof nextValue === 'string' ? nextValue : nextValue || '')}
    onInputChange={freeSolo ? (_, nextInputValue, reason) => {
      if (reason === 'input' || reason === 'clear') {
        onValueChange(name, nextInputValue);
      }
    } : undefined}
    autoHighlight
    openOnFocus
    selectOnFocus
    clearOnBlur={!freeSolo}
    handleHomeEndKeys
    forcePopupIcon
    isOptionEqualToValue={(option, selectedValue) => option === selectedValue}
    ListboxProps={{
      sx: {
        '& .MuiAutocomplete-option': {
          fontSize: '0.875rem',
          minHeight: 36,
          alignItems: 'center',
        },
      },
    }}
    renderInput={params => (
      <TextField
        {...params}
        size="small"
        placeholder={placeholder}
        sx={fieldSx}
      />
    )}
  />
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
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9aa0a6', borderRightColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary, borderRightColor: 'transparent', borderWidth: '1px' },
          '& .MuiSelect-select': { py: '7px', pl: '8px', pr: '24px', fontSize: '0.8125rem', textAlign: 'left' },
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
          transition: 'all 0.2s ease',
          '& fieldset': { borderColor: C.border },
          '&:hover': { backgroundColor: '#fcfdff' },
          '&:hover fieldset': { borderColor: '#9aa0a6' },
          '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(26,115,232,0.12)' },
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

const AddressPhoneInput = ({ codeField, codeVal, numField, numVal, onChange, disabled }) => (
  <Box sx={{ display: 'flex', width: '100%' }}>
    <FormControl size="small" sx={{ width: 84, flexShrink: 0 }} disabled={disabled}>
      <Select
        name={codeField}
        value={codeVal}
        onChange={onChange}
        sx={{
          ...selectSx,
          borderRadius: '4px 0 0 4px',
          backgroundColor: C.sectionBg,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border, borderRightColor: 'transparent' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9aa0a6', borderRightColor: 'transparent' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary, borderRightColor: 'transparent', borderWidth: '1px' },
          '& .MuiSelect-select': { py: '7px', pl: '8px', pr: '22px', fontSize: '0.8125rem', textAlign: 'left' },
        }}
      >
        {PHONE_CODES.map(p => (
          <MenuItem key={p.code} value={p.code} sx={menuItemSx}>
            {p.code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      name={numField}
      value={numVal}
      onChange={onChange}
      size="small"
      disabled={disabled}
      placeholder=""
      sx={{
        flex: 1,
        '& .MuiOutlinedInput-root': {
          borderRadius: '0 4px 4px 0',
          backgroundColor: C.white,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
          '& fieldset': { borderColor: C.border },
          '&:hover': { backgroundColor: '#fcfdff' },
          '&:hover fieldset': { borderColor: '#9aa0a6' },
          '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(26,115,232,0.12)' },
          '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: '1px' },
        },
        '& .MuiInputBase-input': { fontSize: '0.875rem', py: '7px', px: '10px' },
      }}
    />
  </Box>
);

const OTHER_DETAILS_LABEL_WIDTH = 128;

const OtherDetailsRow = ({ label, required, hint, children, alignStart = false }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: alignStart ? 'flex-start' : 'center',
      mb: 1.3,
      minHeight: 34,
    }}
  >
    <Typography
      sx={{
        width: OTHER_DETAILS_LABEL_WIDTH,
        minWidth: OTHER_DETAILS_LABEL_WIDTH,
        pr: 1.25,
        pt: alignStart ? '7px' : 0,
        fontSize: '0.8125rem',
        color: required ? '#e53935' : '#333',
        textAlign: 'left',
        lineHeight: 1.35,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {label}
      {required && <Box component="span" sx={{ color: '#e53935' }}>*</Box>}
      {hint && <InfoIcon sx={{ fontSize: 13, color: C.hint }} />}
    </Typography>
    <Box sx={{ width: { xs: '100%', sm: 360 }, maxWidth: '100%' }}>
      {children}
    </Box>
  </Box>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const AddEditCustomer = () => {
  const { t } = useTranslation();
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setSaveMode] = useState('save');
  const [gstPrefilling, setGstPrefilling] = useState(false);
  const [gstPrefillError, setGstPrefillError] = useState('');
  const [tab, setTab] = useState(0);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [cpData, setCpData] = useState(EMPTY_CP);
  const [cpIndex, setCpIndex] = useState(null);
  const [cpEditorOpen, setCpEditorOpen] = useState(false);
  const [cpErrors, setCpErrors] = useState({});
  const [cfOpen, setCfOpen] = useState(false);
  const [cfKey, setCfKey] = useState('');
  const [cfValue, setCfValue] = useState('');
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [existingCustomers, setExistingCustomers] = useState([]);
  const documentInputRef = useRef(null);
  const formRef = useRef(null);
  const saveModeRef = useRef('save');
  const { isAutoFillEnabled, applyAutoFill: applyFullAutoFill } = useAutoFill({
    setForm,
    generator: generateCustomerMockData,
    scenario: 'full',
    fillEmptyOnly: false,
  });
  const { applyAutoFill: applyMinimalAutoFill } = useAutoFill({
    setForm,
    generator: generateCustomerMockData,
    scenario: 'minimal',
    fillEmptyOnly: true,
    enableShortcut: false,
  });

  const tabErrors = useMemo(() => (
    TAB_CONFIG.map((config) =>
      config.fields.reduce((count, field) => count + (errors[field] ? 1 : 0), 0)
    )
  ), [errors]);

  const focusErrorContext = useCallback((fieldErrors) => {
    const fields = Object.keys(fieldErrors || {});
    if (!fields.length) return;

    const nextTabIndex = TAB_CONFIG.findIndex((config) =>
      fields.some((field) => config.fields.includes(field))
    );
    if (nextTabIndex >= 0) {
      setTab(nextTabIndex);
    }

    scrollToFirstError(fieldErrors);
  }, []);

  const requestSubmit = useCallback((nextMode = 'save') => {
    if (saving || loading || cpEditorOpen || cfOpen) return;
    saveModeRef.current = nextMode;
    setSaveMode(nextMode);
    formRef.current?.requestSubmit?.();
  }, [cfOpen, cpEditorOpen, loading, saving]);

  const submitWithShortcut = useCallback(() => {
    requestSubmit('save');
  }, [requestSubmit]);

  useFormSubmitShortcut(submitWithShortcut, !loading && !saving && !cpEditorOpen && !cfOpen);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      if (!isCmdOrCtrl || String(event.key).toLowerCase() !== 's') return;
      if (cpEditorOpen || cfOpen || loading || saving) return;
      event.preventDefault();
      requestSubmit('save');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cfOpen, cpEditorOpen, loading, requestSubmit, saving]);

  const loadExistingCustomers = useCallback(async () => {
    try {
      const data = await getCustomers();
      setExistingCustomers(Array.isArray(data) ? data : []);
    } catch {
      setExistingCustomers([]);
    }
  }, []);

  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(createApiUrl(`/api/customers/${customerId}`));
      const knownTerms = PAYMENT_TERMS_OPTIONS.map(t => t.value);
      const incomingPaymentTerms = data?.payment_terms || '';
      const isKnownPaymentTerm = knownTerms.includes(incomingPaymentTerms);
      const hasExtraDetails = [
        data?.website_url,
        data?.department,
        data?.designation,
        data?.x_handle,
        data?.skype,
        data?.facebook,
      ].some(v => String(v || '').trim());

      setForm(p => ({
        ...p,
        ...data,
        documents: Array.isArray(data?.documents) ? data.documents : [],
        billing_street: splitStreetLines(data?.billing_street).line1,
        billing_street2: splitStreetLines(data?.billing_street).line2,
        shipping_street: splitStreetLines(data?.shipping_street).line1,
        shipping_street2: splitStreetLines(data?.shipping_street).line2,
        payment_terms: isKnownPaymentTerm ? incomingPaymentTerms : 'custom',
        custom_payment_terms: isKnownPaymentTerm ? '' : incomingPaymentTerms,
      }));
      setPendingDocuments([]);
      setShowMoreDetails(hasExtraDetails);
    } catch { setApiError('Failed to load customer.'); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { if (customerId) loadCustomer(); }, [customerId, loadCustomer]);
  useEffect(() => { loadExistingCustomers(); }, [loadExistingCustomers]);

  const handleGstPrefill = async () => {
    const gstin = form.gst_number?.trim();
    
    // Validate GST format before calling API
    if (!gstin) {
      setGstPrefillError('Please enter a GST Number first.');
      return;
    }
    
    if (!isValidGST(gstin)) {
      setGstPrefillError('Please enter a valid 15-character GSTIN.');
      return;
    }
    
    try {
      setGstPrefilling(true);
      setGstPrefillError('');
      
      const { data } = await axios.get(createApiUrl(`/api/gst/prefill/${gstin.toUpperCase()}`));
      
      if (data.success && data.data) {
        const gstData = data.data;
        
        // Auto-populate form fields
        setForm(p => ({
          ...p,
          company_name: gstData.legal_name || p.company_name,
          display_name: gstData.trade_name || gstData.legal_name || p.display_name,
          billing_street: gstData.address || p.billing_street,
          place_of_supply: gstData.state || p.place_of_supply,
          billing_state: gstData.state || p.billing_state,
          gst_treatment: gstData.gst_treatment || p.gst_treatment,
        }));
        
        // Show success message briefly
        setGstPrefillError('');
      } else {
        setGstPrefillError(data.error || 'Failed to fetch GST details.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to connect to GST service. Please try again.';
      setGstPrefillError(errorMsg);
    } finally {
      setGstPrefilling(false);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => {
      const nextValue = type === 'checkbox' ? checked : value;
      const updates = { [name]: nextValue };

      if (name === 'gst_number') {
        const gst = String(value || '').toUpperCase().replace(/\s+/g, '');
        updates.gst_number = gst;

        const panFromGst = gst.slice(2, 12);
        if (/^\d{2}[A-Z]{5}[0-9]{4}[A-Z]/.test(gst) && panFromGst.length === 10) {
          updates.pan = panFromGst;
        }
      }

      if (name === 'pan') {
        updates.pan = String(value || '').toUpperCase().replace(/\s+/g, '');
      }

      if (name === 'payment_terms' && value !== 'custom') {
        updates.custom_payment_terms = '';
      }

      return { ...p, ...updates };
    });
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    if (name === 'gst_number' && errors.pan) setErrors(p => ({ ...p, pan: '' }));
  };

  const handleFieldValueChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleCopyBillingAddress = () => {
    setForm(p => ({
      ...p,
      shipping_attention: p.billing_attention, shipping_country: p.billing_country,
      shipping_street: p.billing_street, shipping_street2: p.billing_street2,
      shipping_city: p.billing_city,
      shipping_state: p.billing_state, shipping_zip: p.billing_zip,
      shipping_phone_code: p.billing_phone_code,
      shipping_phone: p.billing_phone,
      shipping_fax: p.billing_fax,
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
    if (form.payment_terms === 'custom' && !form.custom_payment_terms.trim()) {
      e.custom_payment_terms = 'Enter custom payment terms';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      focusErrorContext(e);
    }
    return !Object.keys(e).length;
  };

  const fileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleDocumentSelect = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingDocuments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removePendingDocument = idx => {
    setPendingDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingDocument = idx => {
    setForm(prev => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    const action = saveModeRef.current;
    if (!validate()) return;

    const duplicate = findDuplicateCustomer(existingCustomers, form, customerId);
    if (duplicate) {
      const duplicateField = getDuplicateFieldLabel(existingCustomers, form, customerId);
      const duplicateName = duplicate.display_name || duplicate.name || duplicate.company_name || 'existing customer';
      setApiError(`Duplicate customer detected via ${duplicateField}. Matches ${duplicateName}.`);
      saveModeRef.current = 'save';
      setSaveMode('save');
      return;
    }

    try {
      setSaving(true);
      const resolvedPaymentTerms = form.payment_terms === 'custom'
        ? form.custom_payment_terms.trim()
        : form.payment_terms;

      const billingStreet = [form.billing_street, form.billing_street2].filter(Boolean).join('\n').trim();
      const shippingStreet = [form.shipping_street, form.shipping_street2].filter(Boolean).join('\n').trim();
      const existingDocuments = (form.documents || [])
        .filter(d => d && d.url)
        .map(d => ({ name: d.name || d.document_filename || 'Document', url: d.url }));
      const newDocuments = await Promise.all(
        pendingDocuments.map(async file => ({
          document_filename: file.name,
          document_base64: await fileToBase64(file),
        }))
      );

      const payload = {
        ...form,
        billing_street: billingStreet,
        shipping_street: shippingStreet,
        documents: [...existingDocuments, ...newDocuments],
        payment_terms: resolvedPaymentTerms,
        name: form.display_name,
        address: billingStreet,
      };
      delete payload.billing_street2;
      delete payload.shipping_street2;
      if (customerId) await axios.put(createApiUrl(`/api/customers/${customerId}`), payload);
      else await axios.post(createApiUrl('/api/customers'), payload);
      window.dispatchEvent(new Event('customer:created'));
      if (!customerId && action === 'save_new') {
        navigate('/customers/add', { state: { successMessage: t('customerForm.createSuccess') } });
      } else {
        navigate('/customers', { state: { successMessage: customerId ? t('customerForm.updateSuccess') : t('customerForm.createSuccess') } });
      }
    } catch (err) {
      const parsed = parseApiError(err, t('customerForm.saveFailed'));
      const msg = applyApiErrors(parsed, setErrors);
      setApiError(msg);
      if (Object.keys(parsed.fields || {}).length) {
        focusErrorContext(parsed.fields);
      }
    } finally {
      setSaving(false);
      saveModeRef.current = 'save';
      setSaveMode('save');
    }
  };

  const openAddCp = () => {
    setCpData(EMPTY_CP);
    setCpIndex(null);
    setCpErrors({});
    setCpEditorOpen(true);
  };
  const openEditCp = i => {
    setCpData({ ...EMPTY_CP, ...(form.contact_persons[i] || {}) });
    setCpIndex(i);
    setCpErrors({});
    setCpEditorOpen(true);
  };
  const cancelCpEdit = () => {
    setCpData(EMPTY_CP);
    setCpIndex(null);
    setCpErrors({});
    setCpEditorOpen(false);
  };
  const saveCp = () => {
    const nextErrors = {};
    if (!cpData.first_name.trim()) nextErrors.first_name = 'Required';
    if (!cpData.email.trim()) nextErrors.email = 'Required';
    else if (!isValidEmail(cpData.email)) nextErrors.email = 'Invalid email';
    if (Object.keys(nextErrors).length) {
      setCpErrors(nextErrors);
      return;
    }

    const list = [...form.contact_persons];
    if (cpIndex !== null) list[cpIndex] = cpData; else list.push(cpData);
    setForm(p => ({ ...p, contact_persons: list }));
    cancelCpEdit();
  };
  const deleteCp = i => {
    setForm(p => ({ ...p, contact_persons: p.contact_persons.filter((_, x) => x !== i) }));
    if (cpEditorOpen && cpIndex === i) cancelCpEdit();
  };
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
    <MainLayout title={t('customerForm.title')}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </MainLayout>
  );

  // ─── render ─────────────────────────────────────────────────────────────
  return (
    <MainLayout title={customerId ? t('customerForm.editTitle') : t('customerForm.newTitle')}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 10 }}>
        <Container maxWidth={false} sx={{ pt: 2, px: 2.5 }}>
          {/* GST Prefill notice */}
          {!customerId && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: '#e8f0fe', border: '1px solid #c5d8fb',
              borderRadius: '4px', px: 2, py: '8px', mb: 2,
            }}>
              <InfoIcon sx={{ fontSize: 15, color: C.primary, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#1558b0' }}>
                {t('customerForm.gstPrefillNotice')}{' '}
                <Box component="span" sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                  {t('customerForm.prefill')} ›
                </Box>
              </Typography>
            </Box>
          )}

          {apiError && (
            <Alert severity="error" onClose={() => setApiError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mb: 1.25, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', color: '#475467', fontWeight: 600 }}>
                {customerId ? t('customerForm.editTitle') : t('customerForm.newTitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                Create a complete customer profile with primary contacts, tax details, addresses, and notes.
              </Typography>
            </Box>
            {isAutoFillEnabled && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={applyMinimalAutoFill}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Minimal Fill
                </Button>
                <DevAutoFillButton onClick={applyFullAutoFill} />
              </Box>
            )}
          </Box>

          {/* ── FORM PAPER ─────────────────────────────────────────────────── */}
          <Box
            ref={formRef}
            component="form"
            onSubmit={handleSubmit}
            sx={{
              bgcolor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
            }}
          >

            {/* ══ SECTION 1 — BASIC INFO ═════════════════════════════════════ */}
            <Box sx={{ px: 3, borderBottom: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Basic Info
                </Typography>
              </Box>
              <ZohoRow label={t('customerForm.customerType')} noDivider>
                <RadioGroup
                  row name="customer_type" value={form.customer_type}
                  onChange={handleChange} sx={{ gap: 3 }}
                >
                  {['business', 'individual'].map(v => (
                    <FormControlLabel
                      key={v} value={v} sx={{ m: 0 }}
                      control={<Radio size="small" sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }} />}
                      label={<Typography sx={{ fontSize: '0.875rem', color: C.label, textTransform: 'capitalize' }}>{t(`customerForm.customerTypeOptions.${v}`)}</Typography>}
                    />
                  ))}
                </RadioGroup>
              </ZohoRow>
            </Box>

            {/* ══ SECTION 2 — BUSINESS INFO ══════════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 3 }}>
                <FormLayout>
                  <AppFormField label={t('customerForm.primaryContact')} hint={t('customerForm.primaryContactHint')} testId="customer-field-primary-contact">
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <AppSelect name="salutation" value={form.salutation} onChange={handleChange} displayEmpty>
                          <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>{t('customerForm.salutation')}</MenuItem>
                          {SALUTATIONS.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
                        </AppSelect>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4.5 }}>
                        <TextField
                          name="first_name" value={form.first_name} onChange={handleChange}
                          size="small" placeholder={t('customerForm.firstName')} fullWidth sx={fieldSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4.5 }}>
                        <TextField
                          name="last_name" value={form.last_name} onChange={handleChange}
                          size="small" placeholder={t('customerForm.lastName')} fullWidth sx={fieldSx}
                        />
                      </Grid>
                    </Grid>
                  </AppFormField>

                  <AppFormField label={t('customerForm.companyName')} required={form.customer_type === 'business'} testId="customer-field-company-name">
                    <TextField
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      error={!!errors.company_name}
                      helperText={errors.company_name}
                      sx={fieldSx}
                    />
                  </AppFormField>

                  <AppFormField label={t('customerForm.displayName')} required testId="customer-field-display-name">
                    <TextField
                      name="display_name"
                      value={form.display_name}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      placeholder={t('customerForm.displayNamePlaceholder')}
                      error={!!errors.display_name}
                      helperText={errors.display_name}
                      sx={fieldSx}
                    />
                  </AppFormField>
                </FormLayout>
              </Box>
            </Box>

            {/* ══ SECTION 3 — CONTACT INFO ═══════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Contact Info
                </Typography>
              </Box>
              <Box sx={{ py: 3 }}>
                <FormLayout>

                  <AppFormField label={t('customerForm.emailAddress')} layout="half" testId="customer-field-email">
                    <TextField
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      size="small"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={fieldSx}
                    />
                  </AppFormField>

                  <AppFormField label={t('customerForm.customerLanguage')} hint={t('customerForm.customerLanguageHint')} layout="half" testId="customer-field-language">
                    <AppSelect name="language" value={form.language} onChange={handleChange}>
                      {[['en', 'English'], ['hi', 'Hindi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['mr', 'Marathi']].map(([value, label]) => (
                        <MenuItem key={value} value={value} sx={menuItemSx}>{label}</MenuItem>
                      ))}
                    </AppSelect>
                  </AppFormField>

                  <AppFormField label={t('customerForm.phone')} hint={t('customerForm.phoneHint')} testId="customer-field-phone">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PhoneInput
                          codeField="work_phone_code" codeVal={form.work_phone_code}
                          numField="phone" numVal={form.phone}
                          onChange={handleChange} placeholder={t('customerForm.workPhone')}
                          error={errors.phone} helperText={errors.phone}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PhoneInput
                          codeField="mobile_code" codeVal={form.mobile_code}
                          numField="mobile" numVal={form.mobile}
                          onChange={handleChange} placeholder={t('customerForm.mobile')}
                        />
                      </Grid>
                    </Grid>
                  </AppFormField>

                  <AppFormField label={t('customerForm.communicationChannels')} testId="customer-field-communication">
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', minHeight: 40 }}>
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
                  </AppFormField>
                </FormLayout>
              </Box>
            </Box>

            {/* ══ SECTION 4 — ADDITIONAL DETAILS ═════════════════════════════ */}
            <Box sx={{ borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Additional Details
                </Typography>
              </Box>
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
                {TAB_CONFIG.map((config, index) => (
                  <Tab
                    key={config.labelKey}
                    label={
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                        <span>{t(config.labelKey)}</span>
                        {tabErrors[index] > 0 && (
                          <Box
                            component="span"
                            sx={{
                              minWidth: 18,
                              height: 18,
                              px: 0.5,
                              borderRadius: 99,
                              bgcolor: '#fef2f2',
                              color: C.red,
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {tabErrors[index]}
                          </Box>
                        )}
                      </Box>
                    }
                    disableRipple={false}
                  />
                ))}
              </Tabs>

              {/* ── TAB 0: OTHER DETAILS ─────────────────────────────────── */}
              <TabPanel value={tab} index={0}>
                <Box sx={{ px: 3, py: 2.25 }}>
                  <FormLayout>
                    <AppFormField label={t('customerForm.gstTreatment')} required layout="half" testId="customer-detail-field-gst-treatment">
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
                    </AppFormField>

                    <AppFormField label={t('customerForm.placeOfSupply')} required layout="half" testId="customer-detail-field-place-of-supply">
                    <SearchableTextSelect
                      name="place_of_supply"
                      value={form.place_of_supply}
                      onValueChange={handleFieldValueChange}
                      options={INDIAN_STATES}
                      placeholder={t('customerForm.placeOfSupplyPlaceholder')}
                    />
                    </AppFormField>

                    <AppFormField label={t('customerForm.pan')} hint={t('customerForm.panHint')} layout="half" testId="customer-detail-field-pan">
                    <TextField
                      name="pan" value={form.pan} onChange={handleChange}
                      size="small" fullWidth placeholder=""
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      error={!!errors.pan || (form.pan && !isValidPAN(form.pan))}
                      helperText={errors.pan || (form.pan && !isValidPAN(form.pan) ? t('customerForm.invalidPan') : '')}
                      sx={fieldSx}
                    />
                    </AppFormField>

                    <AppFormField label={t('customerForm.taxPreference')} required layout="half" testId="customer-detail-field-tax-preference">
                    <RadioGroup
                      row name="tax_preference" value={form.tax_preference}
                      onChange={handleChange} sx={{ gap: 1.25, mt: '2px' }}
                    >
                      {[{ v: 'taxable', l: t('customerForm.taxable') }, { v: 'tax_exempt', l: t('customerForm.taxExempt') }].map(opt => (
                        <FormControlLabel
                          key={opt.v} value={opt.v} sx={{ m: 0 }}
                          control={<Radio size="small" sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }} />}
                          label={<Typography sx={{ fontSize: '0.8125rem', color: C.label }}>{opt.l}</Typography>}
                        />
                      ))}
                    </RadioGroup>
                    </AppFormField>

                    <AppFormField label={t('customerForm.currency')} layout="half" testId="customer-detail-field-currency">
                    <AppSelect name="currency" value={form.currency} onChange={handleChange}>
                      {[['INR', 'INR - Indian Rupee'], ['USD', 'USD - US Dollar'], ['EUR', 'EUR - Euro'], ['GBP', 'GBP - British Pound'], ['AED', 'AED - UAE Dirham']].map(([v, l]) => (
                        <MenuItem key={v} value={v} sx={menuItemSx}>{l}</MenuItem>
                      ))}
                    </AppSelect>
                    </AppFormField>

                    <AppFormField label={t('customerForm.openingBalance')} layout="half" testId="customer-detail-field-opening-balance">
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
                    </AppFormField>

                    <AppFormField label={t('customerForm.paymentTerms')} testId="customer-detail-field-payment-terms">
                      <Box>
                      <AppSelect name="payment_terms" value={form.payment_terms} onChange={handleChange}>
                        {PAYMENT_TERMS_OPTIONS.map(t => <MenuItem key={t.value} value={t.value} sx={menuItemSx}>{t.label}</MenuItem>)}
                      </AppSelect>
                      {form.payment_terms === 'custom' && (
                        <TextField
                          name="custom_payment_terms"
                          value={form.custom_payment_terms}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          placeholder={t('customerForm.customPaymentTermsPlaceholder')}
                          error={!!errors.custom_payment_terms}
                          helperText={errors.custom_payment_terms}
                          sx={{ ...fieldSx, mt: 1 }}
                        />
                      )}
                      </Box>
                    </AppFormField>

                    <AppFormField label={t('customerForm.enablePortal')} hint={t('customerForm.enablePortalHint')} testId="customer-detail-field-portal">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
                      <FormControlLabel
                        sx={{ m: 0, ml: 0, alignItems: 'flex-start' }}
                        control={
                          <Checkbox
                            size="small"
                            name="portal_enabled"
                            checked={form.portal_enabled}
                            onChange={handleChange}
                            sx={{ p: 0, mr: '6px', color: '#bbb', '&.Mui-checked': { color: C.primary } }}
                          />
                        }
                        label={<Typography sx={{ fontSize: '0.8125rem', color: C.label }}>{t('customerForm.allowPortalAccess')}</Typography>}
                      />
                    </Box>
                    </AppFormField>

                    <AppFormField label={t('customerForm.documents')} testId="customer-detail-field-documents">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => documentInputRef.current?.click()}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          borderColor: C.border,
                          color: '#444',
                          '&:hover': { bgcolor: '#fafbff', borderColor: '#b7bec8' },
                        }}
                      >
                        {t('customerForm.uploadFile')}
                      </Button>
                      <input
                        ref={documentInputRef}
                        type="file"
                        hidden
                        multiple
                        onChange={handleDocumentSelect}
                      />
                      <Typography sx={{ fontSize: '0.72rem', color: C.hint, mt: 0.6 }}>
                        {t('customerForm.uploadHint')}
                      </Typography>

                      {!!(form.documents || []).length && (
                        <Box sx={{ mt: 0.9, display: 'grid', gap: 0.5 }}>
                          {(form.documents || []).map((doc, idx) => (
                            <Box key={`existing-doc-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.75rem', color: '#444' }}>{doc.name || doc.document_filename || `Document ${idx + 1}`}</Typography>
                              <IconButton size="small" onClick={() => removeExistingDocument(idx)} sx={{ color: C.hint, p: '2px' }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {!!pendingDocuments.length && (
                        <Box sx={{ mt: 0.9, display: 'grid', gap: 0.5 }}>
                          {pendingDocuments.map((doc, idx) => (
                            <Box key={`new-doc-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.75rem', color: C.primary }}>{doc.name}</Typography>
                              <IconButton size="small" onClick={() => removePendingDocument(idx)} sx={{ color: C.hint, p: '2px' }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    </AppFormField>
                  </FormLayout>

                  <OtherDetailsRow label={t('customerForm.gstNumber')} hint={t('customerForm.gstNumberHint')} alignStart>
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          name="gst_number" value={form.gst_number} onChange={handleChange}
                          size="small" fullWidth placeholder=""
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          error={!!errors.gst_number || (form.gst_number && !isValidGST(form.gst_number))}
                          helperText={errors.gst_number || (form.gst_number && !isValidGST(form.gst_number) ? t('customerForm.invalidGst') : '')}
                          sx={fieldSx}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleGstPrefill}
                          disabled={gstPrefilling || !form.gst_number || !isValidGST(form.gst_number)}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            borderColor: C.primary,
                            color: C.primary,
                            minWidth: '94px',
                            height: '34px',
                            whiteSpace: 'nowrap',
                            '&:hover': { bgcolor: '#f0f6ff', borderColor: C.primary },
                            '&.Mui-disabled': { borderColor: '#ddd', color: '#999' },
                          }}
                        >
                          {gstPrefilling ? <CircularProgress size={14} sx={{ color: C.primary }} /> : t('customerForm.prefill')}
                        </Button>
                      </Box>
                      {gstPrefillError && (
                        <Typography sx={{ fontSize: '0.75rem', color: C.red, mt: 0.5 }}>
                          {gstPrefillError}
                        </Typography>
                      )}
                    </Box>
                  </OtherDetailsRow>

                  {!showMoreDetails && (
                    <Box sx={{ pl: `${OTHER_DETAILS_LABEL_WIDTH}px`, mt: 0.5 }}>
                      <Button
                        size="small"
                        onClick={() => setShowMoreDetails(true)}
                        sx={{
                          p: 0,
                          minWidth: 0,
                          textTransform: 'none',
                          fontSize: '0.8125rem',
                          color: C.primary,
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        }}
                      >
                        {t('customerForm.addMoreDetails')}
                      </Button>
                    </Box>
                  )}

                  {showMoreDetails && (
                    <>
                      <OtherDetailsRow label="Website URL">
                        <TextField
                          name="website_url"
                          value={form.website_url}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          placeholder="e.g. www.example.com"
                          sx={fieldSx}
                        />
                      </OtherDetailsRow>

                      <OtherDetailsRow label="Department">
                        <TextField
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          sx={fieldSx}
                        />
                      </OtherDetailsRow>

                      <OtherDetailsRow label="Designation">
                        <TextField
                          name="designation"
                          value={form.designation}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          sx={fieldSx}
                        />
                      </OtherDetailsRow>

                      <OtherDetailsRow label="X">
                        <TextField
                          name="x_handle"
                          value={form.x_handle}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          placeholder="https://x.com/"
                          sx={fieldSx}
                        />
                      </OtherDetailsRow>

                      <OtherDetailsRow label="Skype Name/Number">
                        <TextField
                          name="skype"
                          value={form.skype}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          sx={fieldSx}
                        />
                      </OtherDetailsRow>

                      <OtherDetailsRow label="Facebook">
                        <TextField
                          name="facebook"
                          value={form.facebook}
                          onChange={handleChange}
                          size="small"
                          fullWidth
                          placeholder="http://www.facebook.com/"
                          sx={fieldSx}
                        />
                      </OtherDetailsRow>

                      <Box sx={{ pl: `${OTHER_DETAILS_LABEL_WIDTH}px`, mt: 0.25 }}>
                        <Button
                          size="small"
                          onClick={() => setShowMoreDetails(false)}
                          sx={{
                            p: 0,
                            minWidth: 0,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            color: C.hint,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          Show fewer details
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </TabPanel>

              {/* ── TAB 1: ADDRESS ───────────────────────────────────────── */}
              <TabPanel value={tab} index={1}>
                <Box sx={{ px: 3, py: 3 }}>
                  <Grid container spacing={4}>
                    {/* Billing */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography fontWeight={600} sx={{ mb: 2, fontSize: '0.875rem', color: '#333' }}>
                        Billing Address
                      </Typography>
                      <AddressFields
                        prefix="billing_"
                        form={form}
                        onChange={handleChange}
                        onValueChange={handleFieldValueChange}
                        disabled={false}
                      />
                    </Grid>
                    {/* Shipping */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
                        <Typography fontWeight={600} sx={{ fontSize: '0.875rem', color: '#333' }}>
                          Shipping Address
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: C.hint }}>(</Typography>
                        <Button
                          size="small"
                          onClick={handleCopyBillingAddress}
                          sx={{
                            p: 0,
                            minWidth: 0,
                            lineHeight: 1,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            color: C.primary,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          ↓ Copy billing address
                        </Button>
                        <Typography sx={{ fontSize: '0.75rem', color: C.hint }}>)</Typography>
                      </Box>
                      <AddressFields
                        prefix="shipping_"
                        form={form}
                        onChange={handleChange}
                        onValueChange={handleFieldValueChange}
                        disabled={false}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 3,
                      px: 2,
                      py: 1.5,
                      borderLeft: '2px solid #f4b400',
                      bgcolor: '#fffef7',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#333', mb: 0.5 }}>
                      Note:
                    </Typography>
                    <Typography component="ul" sx={{ m: 0, pl: 2, color: '#444', fontSize: '0.75rem', lineHeight: 1.5 }}>
                      <li>Add and manage additional addresses from the customer details section.</li>
                      <li>Address display in transaction PDFs can be configured from customer preferences.</li>
                    </Typography>
                  </Box>
                </Box>
              </TabPanel>

              {/* ── TAB 2: CONTACT PERSONS ───────────────────────────────── */}
              <TabPanel value={tab} index={2}>
                <Box sx={{ px: 3, py: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                      Manage additional contact persons for this customer
                    </Typography>
                  </Box>

                  <Box sx={{ border: `1px solid ${C.border}`, borderRadius: '4px', overflowX: 'auto' }}>
                    <Box
                      sx={{
                        minWidth: 880,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1.2fr 1.2fr 2fr 1.3fr 1.3fr 96px',
                        bgcolor: C.sectionBg,
                        borderBottom: `1px solid ${C.divider}`,
                      }}
                    >
                      {['Salutation', 'First Name', 'Last Name', 'Email Address', 'Work Phone', 'Mobile', ''].map(h => (
                        <Box key={h} sx={{ px: 1.25, py: 1 }}>
                          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            {h}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {form.contact_persons.map((cp, i) => (
                      <Box
                        key={i}
                        sx={{
                          minWidth: 880,
                          display: 'grid',
                          gridTemplateColumns: '1fr 1.2fr 1.2fr 2fr 1.3fr 1.3fr 96px',
                          borderBottom: `1px solid ${C.divider}`,
                          alignItems: 'center',
                          '&:hover': { bgcolor: '#fafbff' },
                        }}
                      >
                        <Box sx={{ px: 1.25, py: 1 }}><Typography sx={{ fontSize: '0.8125rem' }}>{cp.salutation || '—'}</Typography></Box>
                        <Box sx={{ px: 1.25, py: 1 }}><Typography sx={{ fontSize: '0.8125rem' }}>{cp.first_name || '—'}</Typography></Box>
                        <Box sx={{ px: 1.25, py: 1 }}><Typography sx={{ fontSize: '0.8125rem' }}>{cp.last_name || '—'}</Typography></Box>
                        <Box sx={{ px: 1.25, py: 1 }}><Typography sx={{ fontSize: '0.8125rem', color: '#444' }}>{cp.email || '—'}</Typography></Box>
                        <Box sx={{ px: 1.25, py: 1 }}><Typography sx={{ fontSize: '0.8125rem', color: '#666' }}>{cp.phone || '—'}</Typography></Box>
                        <Box sx={{ px: 1.25, py: 1 }}><Typography sx={{ fontSize: '0.8125rem', color: '#666' }}>{cp.mobile || '—'}</Typography></Box>
                        <Box sx={{ px: 0.75, py: 0.5, display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                          <IconButton size="small" onClick={() => openEditCp(i)} sx={{ color: '#666', '&:hover': { color: C.primary } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                          <IconButton size="small" onClick={() => deleteCp(i)} sx={{ color: '#666', '&:hover': { color: C.red } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                        </Box>
                      </Box>
                    ))}

                    {cpEditorOpen && (
                      <Box
                        sx={{
                          minWidth: 880,
                          display: 'grid',
                          gridTemplateColumns: '1fr 1.2fr 1.2fr 2fr 1.3fr 1.3fr 96px',
                          alignItems: 'start',
                          bgcolor: '#fcfdff',
                          borderBottom: `1px solid ${C.divider}`,
                        }}
                      >
                        <Box sx={{ px: 1, py: 1 }}>
                          <AppSelect value={cpData.salutation} onChange={e => setCpData(p => ({ ...p, salutation: e.target.value }))} displayEmpty>
                            <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>—</MenuItem>
                            {SALUTATIONS.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
                          </AppSelect>
                        </Box>
                        <Box sx={{ px: 1, py: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={cpData.first_name}
                            onChange={e => setCpData(p => ({ ...p, first_name: e.target.value }))}
                            error={!!cpErrors.first_name}
                            helperText={cpErrors.first_name}
                            sx={fieldSx}
                          />
                        </Box>
                        <Box sx={{ px: 1, py: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={cpData.last_name}
                            onChange={e => setCpData(p => ({ ...p, last_name: e.target.value }))}
                            sx={fieldSx}
                          />
                        </Box>
                        <Box sx={{ px: 1, py: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            type="email"
                            value={cpData.email}
                            onChange={e => setCpData(p => ({ ...p, email: e.target.value }))}
                            error={!!cpErrors.email}
                            helperText={cpErrors.email}
                            sx={fieldSx}
                          />
                        </Box>
                        <Box sx={{ px: 1, py: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={cpData.phone}
                            onChange={e => setCpData(p => ({ ...p, phone: e.target.value }))}
                            sx={fieldSx}
                          />
                        </Box>
                        <Box sx={{ px: 1, py: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={cpData.mobile}
                            onChange={e => setCpData(p => ({ ...p, mobile: e.target.value }))}
                            sx={fieldSx}
                          />
                        </Box>
                        <Box sx={{ px: 0.75, py: 0.75, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                          <Button
                            size="small"
                            onClick={cancelCpEdit}
                            sx={{
                              textTransform: 'none',
                              minWidth: 0,
                              px: 0.75,
                              py: 0.25,
                              fontSize: '0.72rem',
                              color: '#666',
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            onClick={saveCp}
                            variant="contained"
                            sx={{
                              textTransform: 'none',
                              minWidth: 0,
                              px: 1,
                              py: 0.25,
                              fontSize: '0.72rem',
                              borderRadius: '4px',
                              boxShadow: 'none',
                              bgcolor: C.primary,
                              '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' },
                            }}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                      onClick={openAddCp}
                      disabled={cpEditorOpen}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.8125rem',
                        color: C.primary,
                        p: 0,
                        minWidth: 0,
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        '&.Mui-disabled': { color: '#9bb8e6' },
                      }}
                    >
                      Add Contact Person
                    </Button>
                  </Box>
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

            {/* ══ SECTION 4 — FOOTER ACTIONS ═════════════════════════════════ */}
            <Box sx={{
              position: 'sticky',
              bottom: 0,
              zIndex: 3,
              px: 3, py: 2,
              bgcolor: C.sectionBg,
              borderTop: `1px solid ${C.divider}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5,
              flexWrap: 'wrap',
              boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.06)',
            }}>
              <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                Required fields are marked. Use Cmd/Ctrl+Enter to submit or Cmd/Ctrl+S to save.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
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
                {t('common.cancel')}
              </Button>
              {!customerId && (
                <Button
                  type="submit"
                  variant="outlined"
                  size="medium"
                  disabled={saving}
                  onClick={() => {
                    saveModeRef.current = 'save_new';
                    setSaveMode('save_new');
                  }}
                  sx={{
                    textTransform: 'none', borderRadius: '4px', fontWeight: 500,
                    fontSize: '0.875rem', px: 3,
                  }}
                >
                  Save & New
                </Button>
              )}
              <Button
                type="submit" variant="contained" size="medium" disabled={saving}
                onClick={() => {
                  saveModeRef.current = 'save';
                  setSaveMode('save');
                }}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{
                  textTransform: 'none', borderRadius: '4px', fontWeight: 500,
                  fontSize: '0.875rem', px: 3,
                  bgcolor: C.primary, boxShadow: 'none',
                  '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' },
                  '&:disabled': { bgcolor: '#a8c7f5', color: '#fff' },
                }}
              >
                {saving ? t('common.saving') : customerId ? t('common.update') : t('common.save')}
              </Button>
              </Box>
            </Box>
          </Box>

        </Container>
      </Box>

      {/* ── CUSTOM FIELD DIALOG ───────────────────────────────────────────── */}
      <Dialog open={cfOpen} onClose={() => setCfOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ elevation: 2, sx: { borderRadius: '6px' } }}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, borderBottom: `1px solid ${C.divider}`, pb: 1.5 }}>
          {t('customerForm.addCustomField')}
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <FieldLabel required>{t('customerForm.fieldName')}</FieldLabel>
              <TextField size="small" fullWidth value={cfKey}
                onChange={e => setCfKey(e.target.value)} sx={fieldSx} />
            </Box>
            <Box>
              <FieldLabel>{t('customerForm.fieldValue')}</FieldLabel>
              <TextField size="small" fullWidth value={cfValue}
                onChange={e => setCfValue(e.target.value)} sx={fieldSx} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}`, gap: 1 }}>
          <Button onClick={() => setCfOpen(false)}
            sx={{ textTransform: 'none', fontSize: '0.875rem', color: '#555', borderRadius: '4px' }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={saveCf} variant="contained"
            sx={{ textTransform: 'none', fontSize: '0.875rem', borderRadius: '4px', bgcolor: C.primary, boxShadow: 'none', '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' } }}>
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

// ─── ADDRESS FIELDS sub-component ─────────────────────────────────────────
// Extracted so Billing and Shipping share identical field structure.
// Uses FieldLabel above each field — same pattern as Other Details tab.
const AddressFields = ({ prefix, form, onChange, onValueChange, disabled }) => {
  const { t } = useTranslation();
  const val = name => form[`${prefix}${name}`] || '';
  const LABEL_WIDTH = 120;

  const wrap = name => ({
    name: `${prefix}${name}`,
    value: val(name),
    onChange,
    disabled,
    size: 'small',
    fullWidth: true,
    sx: fieldSx,
  });

  const AddressRow = ({ label, children, alignStart = false }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: alignStart ? 'flex-start' : 'center',
        mb: 1.2,
        minHeight: 34,
      }}
    >
      <Typography
        sx={{
          width: LABEL_WIDTH,
          minWidth: LABEL_WIDTH,
          pr: 1.25,
          pt: alignStart ? '7px' : 0,
          fontSize: '0.8125rem',
          color: '#333',
          textAlign: 'left',
          lineHeight: 1.35,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );

  return (
    <Box>
      <AddressRow label={t('customerForm.address.attention')}>
        <TextField {...wrap('attention')} placeholder="" />
      </AddressRow>

      <AddressRow label={t('customerForm.address.countryRegion')}>
        <SearchableTextSelect
          name={`${prefix}country`}
          value={val('country')}
          onValueChange={onValueChange}
          options={COUNTRIES}
          placeholder={t('customerForm.address.searchCountry')}
          disabled={disabled}
          freeSolo
        />
      </AddressRow>

      <AddressRow label={t('customerForm.address.address')} alignStart>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <TextField {...wrap('street')} placeholder={t('customerForm.address.street1')} />
          <TextField {...wrap('street2')} placeholder={t('customerForm.address.street2')} />
        </Box>
      </AddressRow>

      <AddressRow label={t('customerForm.address.city')}>
        <TextField {...wrap('city')} placeholder="" />
      </AddressRow>

      <AddressRow label={t('customerForm.address.state')}>
        <SearchableTextSelect
          name={`${prefix}state`}
          value={val('state')}
          onValueChange={onValueChange}
          options={INDIAN_STATES}
          placeholder={t('customerForm.address.searchState')}
          disabled={disabled}
          freeSolo
        />
      </AddressRow>

      <AddressRow label={t('customerForm.address.pinCode')}>
        <TextField {...wrap('zip')} placeholder="" />
      </AddressRow>

      <AddressRow label={t('customerForm.address.phone')}>
        <AddressPhoneInput
          codeField={`${prefix}phone_code`}
          codeVal={val('phone_code') || '+91'}
          numField={`${prefix}phone`}
          numVal={val('phone')}
          onChange={onChange}
          disabled={disabled}
        />
      </AddressRow>

      <AddressRow label={t('customerForm.address.faxNumber')}>
        <TextField {...wrap('fax')} placeholder="" />
      </AddressRow>
    </Box>
  );
};

export default AddEditCustomer;
