import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { createInvoice, updateInvoice } from '../services/invoiceService';
import { createApiUrl } from '../config/api';
import { useInvoicePreferences } from '../context/InvoicePreferencesContext';
import { getTaxRates, calculateInvoiceTax } from '../services/taxService';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from './Layout/MainLayout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerSelect from './common/CustomerSelect';
import AppFormField from './common/form/AppFormField';
import FormLayout from './common/form/FormLayout';
import { C, AppSelect, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import { useFormSubmitShortcut } from '../hooks/useFormSubmitShortcut';
import { formatCurrency as formatCurrencyByLocale, formatNumber } from '../utils/intlFormatters';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generateInvoiceMockData } from '../utils/mockDataGenerators';
import { applyApiErrors, parseApiError } from '../utils/apiErrors';
import { calculateInvoiceTotals } from '../utils/invoiceCalculations';
import { buildInvoicePayload } from '../utils/invoicePayload';
import { deriveDueDate, validateInvoiceForm } from '../utils/invoiceFormValidation';

const paymentTermsOptions = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45'];
const AUTO_FILL_MODES = [
  { value: 'minimal', label: 'Minimal Auto Fill (quick testing)' },
  { value: 'full', label: 'Full Auto Fill (realistic scenario)' },
  { value: 'edge', label: 'Edge Case Auto Fill (advanced testing)' },
];
// taxOptions now loaded from API; these are fallback values used until API loads
const FALLBACK_TAX_OPTIONS = [
  { id: '0', name: 'Exempt (0%)', rate: 0 },
  { id: '5', name: 'GST 5%', rate: 5 },
  { id: '12', name: 'GST 12%', rate: 12 },
  { id: '18', name: 'GST 18%', rate: 18 },
  { id: '28', name: 'GST 28%', rate: 28 },
];
const tdsTaxOptions = [
  'Salary [as per slab] (Sec 192)',
  'Interest on securities [10%] (Sec 193)',
  'Dividend [10%] (Sec 194)',
  'Interest other than securities [10%] (Sec 194A)',
  'Winnings from lottery/crossword [30%] (Sec 194B)',
  'Winnings from horse race [30%] (Sec 194BB)',
  'Contractor payments [1% Individual/HUF, 2% Others] (Sec 194C)',
  'Insurance commission [5%] (Sec 194D)',
  'Life insurance payout [5% on income component] (Sec 194DA)',
  'NSS withdrawals [10%] (Sec 194EE)',
  'Commission on sale of lottery tickets [5%] (Sec 194G)',
  'Commission or brokerage [5%] (Sec 194H)',
  'Rent - plant/machinery [2%] (Sec 194I)',
  'Rent - land/building/furniture [10%] (Sec 194I)',
  'Professional/technical fees [10%] (Sec 194J)',
  'Royalty [10%] (Sec 194J)',
  'Non-compete fees [10%] (Sec 194J)',
  'Compensation on immovable property [10%] (Sec 194LA)',
  'Payment on transfer of immovable property [1%] (Sec 194IA)',
  'Rent by certain individuals/HUF [5%] (Sec 194IB)',
  'Payments by e-commerce operator [1%] (Sec 194O)',
  'Purchase of goods [0.1%] (Sec 194Q)',
  'Benefit or perquisite in business/profession [10%] (Sec 194R)',
  'Virtual digital assets transfer [1%] (Sec 194S)',
];
const tcsTaxOptions = [
  'Sale of Goods [0.1%]',
  'Sale of Timber [2.5%]',
  'Alcoholic Liquor [1%]',
  'Forest Produce [2.5%]',
  'Scrap [1%]',
];

const initialForm = {
  invoice_number: '', customer_id: '', issue_date: '', due_date: '',
  payment_terms: '', subtotal: 0, cgst_amount: 0, sgst_amount: 0,
  igst_amount: 0, total_tax: 0, total_amount: 0, amount_paid: 0,
  invoice_discount: 0, round_off: 0,
  balance_due: 0, status: 'Draft', payment_mode: '', notes: '',
  terms_conditions: '', is_gst_applicable: true,
  invoice_type: 'Tax Invoice', subject: '', salesperson: '',
  items: [{ name: '', description: '', quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const formFieldSx = {
  ...fieldSx,
  width: '100%',
};

const tableInputSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    borderRadius: 0,
    bgcolor: '#fff',
  },
  '& .MuiInputBase-input': {
    fontSize: '0.8125rem',
    py: '7px',
    px: '8px',
    textAlign: 'left',
  },
};

const CellField = ({ value, onChange, type = 'number', width = 90, inputProps, placeholder, inputRef }) => (
  <TextField
    size="small"
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    inputRef={inputRef}
    inputProps={inputProps}
    sx={{ ...tableInputSx, width }}
  />
);

const AddEditInvoice = ({ onSuccess, onCancel }) => {
  const isDevAutoFillEnabled = process.env.NODE_ENV !== 'production';
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceId = id;
  const quickCreateCustomerId = location.state?.quickCreateCustomerId || '';
  const shouldFocusItemInput = Boolean(location.state?.focusItemInput);
  const { prefs } = useInvoicePreferences();
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState([]);
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' });
  const [orderNumber, setOrderNumber] = useState('');
  const [dueDateManuallyEdited, setDueDateManuallyEdited] = useState(false);
  const [submitMode, setSubmitMode] = useState('send');
  const [tdsMode, setTdsMode] = useState('tds');
  const [tdsTaxOption, setTdsTaxOption] = useState('');
  const [tcsTaxOption, setTcsTaxOption] = useState('');
  const formRef = useRef(null);
  const firstItemInputRef = useRef(null);
  const [taxRates, setTaxRates] = useState(FALLBACK_TAX_OPTIONS);
  const [gstBreakdown, setGstBreakdown] = useState({ cgst: 0, sgst: 0, igst: 0, tax_type: 'NONE' });
  const [focusItemPending, setFocusItemPending] = useState(shouldFocusItemInput);

  const autoFillInvoice = useCallback((mode = 'full') => {
    if (!isDevAutoFillEnabled) return;
    if (!customers.length) {
      setError('Auto Fill requires at least one customer.');
      return;
    }

    const generated = generateInvoiceMockData({
      scenario: mode,
      context: { customers, products },
    }) || {};

    setForm((prev) => ({
      ...prev,
      ...generated,
      // Keep generated invoice number from API and current explicit status.
      invoice_number: prev.invoice_number,
      status: prev.status || 'Draft',
      items: Array.isArray(generated.items) && generated.items.length
        ? generated.items.map((item) => ({ ...initialForm.items[0], ...item }))
        : prev.items,
    }));

    setDueDateManuallyEdited(false);
    setErrors({});
    setItemErrors([]);
    setError('');
  }, [customers, isDevAutoFillEnabled, products]);

  const submitWithShortcut = useCallback(() => {
    setSubmitMode('send');
    formRef.current?.requestSubmit();
  }, []);

  useFormSubmitShortcut(submitWithShortcut, !pageLoading && !loading);

  const activeWithholdingOptions = tdsMode === 'tds' ? tdsTaxOptions : tcsTaxOptions;
  const activeWithholdingValue = tdsMode === 'tds' ? tdsTaxOption : tcsTaxOption;

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setPageLoading(true);
        const [customersResponse, productsResponse, taxRatesData] = await Promise.all([
          axios.get(createApiUrl('/api/customers')),
          axios.get(createApiUrl('/api/products')).catch(() => ({ data: [] })),
          getTaxRates().catch(() => null),
        ]);
        if (!active) return;

        setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
        if (Array.isArray(taxRatesData) && taxRatesData.length > 0) {
          setTaxRates(taxRatesData.map((r) => ({ id: r.id, name: r.name, rate: r.rate })));
        }

        if (invoiceId) {
          const invoiceResponse = await axios.get(createApiUrl(`/api/invoices/${invoiceId}`));
          if (!active) return;

          setForm((prev) => ({
            ...prev,
            ...invoiceResponse.data,
            items: Array.isArray(invoiceResponse.data?.items) && invoiceResponse.data.items.length
              ? invoiceResponse.data.items.map((item) => ({ ...initialForm.items[0], ...item }))
              : [...initialForm.items],
          }));
        } else {
          const today = new Date().toISOString().slice(0, 10);
          const cloneSourceId = location.state?.cloneFrom?.id;
          try {
            const nextNumberResponse = await axios.get(createApiUrl('/api/invoices/next-number'));
            if (!active) return;
            const nextNumber = nextNumberResponse.data?.next_invoice_number || 'INV-00001';

            if (cloneSourceId) {
              const cloneResponse = await axios.get(createApiUrl(`/api/invoices/${cloneSourceId}`));
              if (!active) return;
              const src = cloneResponse.data;
              setForm((prev) => ({
                ...prev,
                ...src,
                id: undefined,
                invoice_number: nextNumber,
                issue_date: today,
                due_date: deriveDueDate(today, src.payment_terms || prefs.default_payment_terms || 'Net 30'),
                amount_paid: 0,
                balance_due: src.total_amount || 0,
                status: 'Draft',
                items: Array.isArray(src.items) && src.items.length
                  ? src.items.map((item) => ({ ...initialForm.items[0], ...item }))
                  : [...initialForm.items],
              }));
            } else {
              setForm((prev) => ({
                ...prev,
                invoice_number:   nextNumber,
                issue_date:       today,
                due_date:         deriveDueDate(today, prefs.default_payment_terms || 'Net 30'),
                customer_id:      quickCreateCustomerId || prev.customer_id || '',
                payment_terms:    prefs.default_payment_terms || 'Net 30',
                notes:            prefs.default_notes         || '',
                terms_conditions: prefs.default_terms         || '',
                status: 'Draft',
              }));
            }
          } catch {
            if (!active) return;
            setForm((prev) => ({
              ...prev,
              invoice_number:   'INV-00001',
              issue_date:       today,
              due_date:         deriveDueDate(today, prefs.default_payment_terms || 'Net 30'),
              customer_id:      quickCreateCustomerId || prev.customer_id || '',
              payment_terms:    prefs.default_payment_terms || 'Net 30',
              notes:            prefs.default_notes         || '',
              terms_conditions: prefs.default_terms         || '',
              status: 'Draft',
            }));
          }
        }
      } catch {
        if (active) setError(t('invoiceForm.loadFailed'));
      } finally {
        if (active) setPageLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, prefs.default_payment_terms, quickCreateCustomerId, t]);

  useEffect(() => {
    if (!form.issue_date || !form.payment_terms || dueDateManuallyEdited) return;
    const nextDueDate = deriveDueDate(form.issue_date, form.payment_terms);
    if (nextDueDate && nextDueDate !== form.due_date) {
      setForm((prev) => ({ ...prev, due_date: nextDueDate }));
    }
  }, [dueDateManuallyEdited, form.due_date, form.issue_date, form.payment_terms]);

  useEffect(() => {
    if (!focusItemPending || pageLoading) return;
    if (!form.customer_id) return;

    const timer = setTimeout(() => {
      firstItemInputRef.current?.focus();
      if (typeof firstItemInputRef.current?.select === 'function') {
        firstItemInputRef.current.select();
      }
      setFocusItemPending(false);
    }, 80);

    return () => clearTimeout(timer);
  }, [focusItemPending, form.customer_id, pageLoading]);

  useEffect(() => {
    const manualTax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const totals = calculateInvoiceTotals({
      items: form.items || [],
      isGstApplicable: form.is_gst_applicable,
      manualTax,
      invoiceDiscount: Number(form.invoice_discount || 0),
      roundOff: Number(form.round_off || 0),
      amountPaid: Number(form.amount_paid || 0),
    });

    setForm((prev) => {
      if (
        Number(prev.subtotal) === Number(totals.subtotal)
        && Number(prev.total_tax) === Number(totals.totalTax)
        && Number(prev.total_amount) === Number(totals.total)
        && Number(prev.balance_due) === Number(totals.balanceDue)
      ) {
        return prev;
      }

      return {
        ...prev,
        items: totals.items,
        subtotal: totals.subtotal,
        total_tax: totals.totalTax,
        total_amount: totals.total,
        balance_due: totals.balanceDue,
      };
    });
  }, [form.amount_paid, form.cgst_amount, form.igst_amount, form.invoice_discount, form.is_gst_applicable, form.items, form.round_off, form.sgst_amount]);

  // ── Live GST breakdown from server ────────────────────────────────────────
  useEffect(() => {
    if (!form.is_gst_applicable || !form.customer_id) {
      setGstBreakdown({ cgst: 0, sgst: 0, igst: 0, tax_type: 'NONE' });
      return;
    }
    let active = true;
    const debounce = setTimeout(async () => {
      try {
        const result = await calculateInvoiceTax({
          items: form.items,
          customerId: form.customer_id,
          isGstApplicable: true,
        });
        if (!active) return;
        setGstBreakdown({
          cgst: result.cgst_amount || 0,
          sgst: result.sgst_amount || 0,
          igst: result.igst_amount || 0,
          tax_type: result.tax_type || 'NONE',
        });
        // Sync the breakdown values into form so they are submitted correctly
        setForm((prev) => ({
          ...prev,
          cgst_amount: result.cgst_amount || 0,
          sgst_amount: result.sgst_amount || 0,
          igst_amount: result.igst_amount || 0,
        }));
      } catch {
        // Silently ignore — totals will still be correct from client-side calc
      }
    }, 600);
    return () => {
      active = false;
      clearTimeout(debounce);
    };
  }, [form.customer_id, form.items, form.is_gst_applicable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'due_date') setDueDateManuallyEdited(true);
    if (name === 'payment_terms') setDueDateManuallyEdited(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const productOptions = useMemo(
    () => (Array.isArray(products) ? products : []).map((product) => ({
      id: product.id,
      label: product.name || product.item_name || product.sku || 'Item',
      description: product.description || '',
      rate: Number(product.price || product.sales_rate || 0),
      tax: Number(product.tax_rate || 0),
    })),
    [products]
  );

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm((prev) => ({ ...prev, items }));
    if (itemErrors[idx]?.[field]) {
      setItemErrors((prev) => {
        const next = [...prev];
        next[idx] = { ...(next[idx] || {}), [field]: '' };
        return next;
      });
    }
  };

  const applyProductToItem = (idx, option) => {
    if (!option) return;
    setForm((prev) => {
      const items = [...(prev.items || [])];
      items[idx] = {
        ...items[idx],
        name: option.label,
        description: option.description || items[idx]?.description || '',
        rate: Number(option.rate || 0),
        tax: Number(option.tax || 0),
      };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...(prev.items || []), { ...initialForm.items[0] }],
    }));
    setItemErrors((prev) => [...prev, {}]);
  };

  const removeItem = (idx) => {
    const items = form.items.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, items: items.length ? items : [{ ...initialForm.items[0] }] }));
    setItemErrors((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [{}];
    });
  };

  const { isValid } = useMemo(() => validateInvoiceForm(form, t), [form, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateInvoiceForm(form, t);
    setErrors(validation.errors);
    setItemErrors(validation.itemErrors);
    if (!validation.isValid) {
      setError(validation.errors.items || 'Please fix validation errors before saving.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nextStatus = submitMode === 'draft'
        ? 'Draft'
        : (form.status === 'Paid' || form.status === 'Cancelled' ? form.status : 'Issued');

      const payload = {
        ...buildInvoicePayload({ ...form, status: nextStatus }),
        status: nextStatus,
      };

      if (invoiceId) {
        await updateInvoice(invoiceId, payload);
      } else {
        await createInvoice(payload);
      }

      setToast({ open: true, severity: 'success', message: 'Invoice saved successfully.' });
      if (onSuccess) onSuccess();
      navigate('/invoices');
    } catch (err) {
      const parsed = parseApiError(err, t('invoiceForm.saveFailed'));
      const message = applyApiErrors(parsed, setErrors);
      setError(message);
      setToast({ open: true, severity: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: 1.5 }}>
        <Box sx={{ width: '100%', px: { xs: 1, md: 1.5 } }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            ref={formRef}
            onSubmit={handleSubmit}
            autoComplete="off"
            sx={{ bgcolor: '#fff' }}
          >
            {pageLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                <Box sx={{ px: 0.5, pt: 0.25, pb: 1.5, borderBottom: `1px solid ${C.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 500, color: '#151a25', textAlign: 'left' }}>
                    {invoiceId ? t('invoiceForm.editTitle') : t('invoiceForm.newTitle')}
                  </Typography>
                  {isDevAutoFillEnabled && (
                    <DevAutoFillButton
                      modes={AUTO_FILL_MODES}
                      onSelectMode={autoFillInvoice}
                    />
                  )}
                </Box>

                <Box sx={{ px: 0.5, py: 3, borderBottom: `1px solid ${C.divider}` }}>
                  <FormLayout>
                    <AppFormField label={t('invoiceForm.customerName')} required testId="invoice-field-customer">
                      <CustomerSelect
                        customers={customers}
                        value={form.customer_id}
                        onChange={handleChange}
                        name="customer_id"
                        required
                        error={!!errors.customer_id}
                        helperText={errors.customer_id}
                      />
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.invoiceNumber')} required layout="half" testId="invoice-field-number">
                      <TextField
                        name="invoice_number"
                        value={form.invoice_number}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        InputProps={{ readOnly: prefs.auto_generate_invoice_number }}
                        sx={{ ...formFieldSx, '& .MuiOutlinedInput-root': { ...fieldSx['& .MuiOutlinedInput-root'], bgcolor: prefs.auto_generate_invoice_number ? '#f8fafc' : C.white } }}
                      />
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.orderNumber')} layout="half" testId="invoice-field-order-number">
                      <TextField
                        size="small"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        fullWidth
                        sx={formFieldSx}
                      />
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.invoiceDate')} required layout="half" testId="invoice-field-issue-date">
                      <TextField
                        name="issue_date"
                        value={form.issue_date}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        fullWidth
                        error={!!errors.issue_date}
                        helperText={errors.issue_date || ''}
                        sx={formFieldSx}
                      />
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.dueDate')} layout="half" testId="invoice-field-due-date">
                      <TextField
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        fullWidth
                        error={!!errors.due_date}
                        helperText={errors.due_date || ''}
                        sx={formFieldSx}
                      />
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.terms')} layout="half" testId="invoice-field-payment-terms">
                      <AppSelect name="payment_terms" value={form.payment_terms} onChange={handleChange}>
                        {paymentTermsOptions.map((term) => (
                          <MenuItem key={term} value={term} sx={menuItemSx}>{term}</MenuItem>
                        ))}
                      </AppSelect>
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.salesperson')} layout="half" testId="invoice-field-salesperson">
                      <TextField
                        name="salesperson"
                        value={form.salesperson}
                        onChange={handleChange}
                        size="small"
                        placeholder={t('invoiceForm.salespersonPlaceholder')}
                        fullWidth
                        sx={formFieldSx}
                      />
                    </AppFormField>

                    <AppFormField label={t('invoiceForm.subject')} testId="invoice-field-subject">
                      <TextField
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        placeholder={t('invoiceForm.subjectPlaceholder')}
                        sx={formFieldSx}
                      />
                    </AppFormField>
                  </FormLayout>

                  <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}` }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      bgcolor: '#f5f7fb',
                      border: `1px solid ${C.border}`,
                      borderBottom: 'none',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                    }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#1f2937' }}>{t('invoiceForm.itemTable')}</Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', fontSize: '0.78rem', p: 0 }}>{t('invoiceForm.scanItem')}</Button>
                        <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', fontSize: '0.78rem', p: 0 }}>{t('invoiceForm.bulkActions')}</Button>
                      </Box>
                    </Box>

                    <TableContainer sx={{ border: `1px solid ${C.border}`, borderTop: 'none', overflowX: 'auto' }}>
                      <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#fafbfd' }}>
                            <TableCell align="left" sx={{ width: '45%', fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8, px: 2, textAlign: 'left' }}>{t('invoiceForm.itemDetails').toUpperCase()}</TableCell>
                            <TableCell sx={{ width: 90, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>{t('invoiceForm.quantity').toUpperCase()}</TableCell>
                            <TableCell sx={{ width: 90, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>{t('invoiceForm.rate').toUpperCase()}</TableCell>
                            <TableCell sx={{ width: 80, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>{t('invoiceForm.discount').toUpperCase()}</TableCell>
                            <TableCell sx={{ width: 105, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>{t('invoiceForm.tax').toUpperCase()}</TableCell>
                            <TableCell align="right" sx={{ width: 95, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>{t('invoiceForm.amount').toUpperCase()}</TableCell>
                            <TableCell sx={{ width: 40, py: 0.8 }} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(form.items || []).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ py: 0.5, px: 2, borderColor: C.divider, textAlign: 'left' }}>
                                <Autocomplete
                                  size="small"
                                  options={productOptions}
                                  value={productOptions.find((option) => option.label === item.name) || item.name || null}
                                  onChange={(_, option) => applyProductToItem(idx, option)}
                                  freeSolo
                                  getOptionLabel={(option) => (typeof option === 'string' ? option : option?.label || '')}
                                  onInputChange={(_, inputValue, reason) => {
                                    if (reason === 'input' || reason === 'clear') updateItem(idx, 'name', inputValue);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder={t('invoiceForm.itemPlaceholder')}
                                      inputRef={idx === 0 ? firstItemInputRef : undefined}
                                      inputProps={{
                                        ...params.inputProps,
                                        ...(idx === 0 ? { 'data-quick-item-input': 'true' } : {}),
                                      }}
                                      error={!!itemErrors[idx]?.name}
                                      helperText={itemErrors[idx]?.name || ''}
                                      sx={{ ...tableInputSx, width: '100%' }}
                                    />
                                  )}
                                />
                                <TextField
                                  size="small"
                                  value={item.description || ''}
                                  placeholder="Description"
                                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                  sx={{ ...tableInputSx, width: '100%', mt: 0.5 }}
                                />
                              </TableCell>

                              <TableCell sx={{ py: 0.5, borderColor: C.divider }}>
                                <CellField
                                  value={item.quantity}
                                  inputProps={{ min: 0, step: 1 }}
                                  onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                  width="100%"
                                />
                                {!!itemErrors[idx]?.quantity && (
                                  <Typography sx={{ color: '#dc2626', fontSize: '0.68rem', mt: 0.4 }}>{itemErrors[idx].quantity}</Typography>
                                )}
                              </TableCell>

                              <TableCell sx={{ py: 0.5, borderColor: C.divider }}>
                                <CellField
                                  value={item.rate}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                                  width="100%"
                                />
                                {!!itemErrors[idx]?.rate && (
                                  <Typography sx={{ color: '#dc2626', fontSize: '0.68rem', mt: 0.4 }}>{itemErrors[idx].rate}</Typography>
                                )}
                              </TableCell>

                              <TableCell sx={{ py: 0.5, borderColor: C.divider }}>
                                <CellField
                                  value={item.discount}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  onChange={(e) => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                                  width="100%"
                                />
                                {!!itemErrors[idx]?.discount && (
                                  <Typography sx={{ color: '#dc2626', fontSize: '0.68rem', mt: 0.4 }}>{itemErrors[idx].discount}</Typography>
                                )}
                              </TableCell>

                              <TableCell sx={{ py: 0.5, borderColor: C.divider }}>
                                <AppSelect
                                  name={`tax-${idx}`}
                                  value={Number(item.tax) || 0}
                                  onChange={(e) => updateItem(idx, 'tax', Number(e.target.value) || 0)}
                                >
                                  {taxRates.map((t) => (
                                    <MenuItem key={t.id || t.rate} value={t.rate} sx={menuItemSx}>{t.name}</MenuItem>
                                  ))}
                                </AppSelect>
                                {!!itemErrors[idx]?.tax && (
                                  <Typography sx={{ color: '#dc2626', fontSize: '0.68rem', mt: 0.4 }}>{itemErrors[idx].tax}</Typography>
                                )}
                              </TableCell>

                              <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#161f2f', borderColor: C.divider }}>
                                {formatCurrencyByLocale(item.amount || 0, i18n.language)}
                              </TableCell>

                              <TableCell align="center" sx={{ borderColor: C.divider }}>
                                <Tooltip title={t('invoiceForm.removeRow')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeItem(idx)}
                                    sx={{ color: '#f87171', '&:hover': { color: '#ef4444' } }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mt: 1.4, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                          onClick={addItem}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            px: 1,
                            py: 0.35,
                            minHeight: 28,
                            lineHeight: 1,
                            borderRadius: '4px',
                            border: '1px solid #d8dee9',
                            bgcolor: '#f7f9fc',
                            color: '#2563eb',
                            '&:hover': { bgcolor: '#eef2f8', borderColor: '#cfd8e6' },
                          }}
                        >
                          {t('invoiceForm.addNewRow')}
                        </Button>
                        <Button
                          size="small"
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            px: 1,
                            py: 0.35,
                            minHeight: 28,
                            lineHeight: 1,
                            borderRadius: '4px',
                            border: '1px solid #d8dee9',
                            bgcolor: '#f7f9fc',
                            color: '#2563eb',
                            '&:hover': { bgcolor: '#eef2f8', borderColor: '#cfd8e6' },
                          }}
                        >
                          {t('invoiceForm.addItemsInBulk')}
                        </Button>
                      </Box>

                      <Paper variant="outlined" sx={{ p: 1.5, width: { xs: '100%', sm: 360 }, borderColor: C.divider, bgcolor: '#fafbfd' }}>
                        {!!errors.items && (
                          <Alert severity="error" sx={{ mb: 1.2 }}>{errors.items}</Alert>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontSize: '0.84rem', color: '#1f2937', fontWeight: 600 }}>{t('invoiceForm.subTotal')}</Typography>
                          <Typography sx={{ fontSize: '0.84rem', color: '#111827', fontWeight: 700 }}>{formatCurrencyByLocale(form.subtotal || 0, i18n.language)}</Typography>
                        </Box>

                        {/* ── GST Breakdown ── */}
                        {form.is_gst_applicable && gstBreakdown.tax_type === 'CGST_SGST' && (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>CGST</Typography>
                              <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>+ {Number(gstBreakdown.cgst || 0).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>SGST</Typography>
                              <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>+ {Number(gstBreakdown.sgst || 0).toFixed(2)}</Typography>
                            </Box>
                          </>
                        )}
                        {form.is_gst_applicable && gstBreakdown.tax_type === 'IGST' && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>IGST</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>+ {Number(gstBreakdown.igst || 0).toFixed(2)}</Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <RadioGroup row value={tdsMode} onChange={(e) => setTdsMode(e.target.value)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.6 }}>
                              <Radio size="small" value="tds" sx={{ p: 0.3 }} />
                              <Typography sx={{ fontSize: '0.8rem' }}>{t('invoiceForm.tds')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Radio size="small" value="tcs" sx={{ p: 0.3 }} />
                              <Typography sx={{ fontSize: '0.8rem' }}>{t('invoiceForm.tcs')}</Typography>
                            </Box>
                          </RadioGroup>
                          <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>- 0.00</Typography>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Autocomplete
                            size="small"
                            options={activeWithholdingOptions}
                            value={activeWithholdingValue || null}
                            onChange={(_, selectedOption) => {
                              if (tdsMode === 'tds') {
                                setTdsTaxOption(selectedOption || '');
                              } else {
                                setTcsTaxOption(selectedOption || '');
                              }
                            }}
                            isOptionEqualToValue={(option, value) => option === value}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={t('invoiceForm.taxPlaceholder')}
                                sx={fieldSx}
                              />
                            )}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            value={'Invoice Discount'}
                            InputProps={{ readOnly: true }}
                            sx={{ ...fieldSx, width: 120 }}
                          />
                          <TextField
                            size="small"
                            value={form.invoice_discount}
                            name="invoice_discount"
                            onChange={handleChange}
                            type="number"
                            sx={{ ...fieldSx, width: 120 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            value={'Round Off'}
                            InputProps={{ readOnly: true }}
                            sx={{ ...fieldSx, width: 120 }}
                          />
                          <TextField
                            size="small"
                            value={form.round_off}
                            name="round_off"
                            onChange={handleChange}
                            type="number"
                            sx={{ ...fieldSx, width: 120 }}
                          />
                        </Box>

                        <Divider sx={{ borderColor: C.divider, my: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: '1.03rem', fontWeight: 700, color: '#111827' }}>{t('invoiceForm.total')}</Typography>
                          <Typography sx={{ fontSize: '1.03rem', fontWeight: 700, color: '#111827' }}>
                            {formatCurrencyByLocale(form.total_amount || 0, i18n.language)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>

                  <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}` }}>
                    <Box sx={{ ml: 0, pl: 0 }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#2f3a4d', mb: 1.5, textAlign: 'left' }}>{t('invoiceForm.customerNotes')}</Typography>
                      <Box sx={{ ml: 0, pl: 0, width: '100%' }}>
                        <TextField
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                          multiline
                          rows={2}
                          fullWidth
                          placeholder={t('invoiceForm.customerNotesPlaceholder')}
                          sx={{ ...fieldSx, width: '100%', ml: 0, '& .MuiInputBase-input': { textAlign: 'left' } }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', color: '#8b95a6', mt: 1.5, textAlign: 'left' }}>{t('invoiceForm.customerNotesHint')}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}`, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 460px' }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#2f3a4d', mb: 0.8 }}>{t('invoiceForm.termsAndConditions')}</Typography>
                      <TextField
                        name="terms_conditions"
                        value={form.terms_conditions}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        placeholder={t('invoiceForm.termsPlaceholder')}
                        sx={{ ...fieldSx, width: '100%' }}
                      />
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: 280 } }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#2f3a4d', mb: 0.8 }}>{t('invoiceForm.attachFiles')}</Typography>
                      <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>{t('invoiceForm.uploadFile')}</Button>
                      <Typography sx={{ fontSize: '0.72rem', color: '#8b95a6', mt: 0.8 }}>
                        {t('invoiceForm.uploadHint')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '0.79rem', color: '#111827' }}>{t('invoiceForm.paymentOptionHint')}</Typography>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Razorpay</Button>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Zoho Payments</Button>
                    </Box>
                  </Box>
                </Box>

                  <Box sx={{ ...footerSx, justifyContent: 'space-between', px: 0, bgcolor: '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      disabled={loading || !isValid}
                      sx={cancelBtnSx}
                      onClick={() => {
                        setSubmitMode('draft');
                        formRef.current?.requestSubmit();
                      }}
                    >
                      {t('invoiceForm.saveDraft')}
                    </Button>

                    <Button
                      type="button"
                      variant="contained"
                      disabled={loading || !isValid}
                      sx={saveBtnSx}
                      onClick={() => {
                        setSubmitMode('send');
                        formRef.current?.requestSubmit();
                      }}
                    >
                      {loading ? t('common.saving') : t('invoiceForm.saveAndSend')}
                    </Button>

                    <Button
                      variant="text"
                      disabled={loading}
                      sx={{ textTransform: 'none', fontSize: '0.84rem', color: '#374151' }}
                      onClick={() => {
                        if (onCancel) onCancel();
                        navigate('/invoices');
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>
                      {t('invoiceForm.totalAmount')}: {formatCurrencyByLocale(form.total_amount || 0, i18n.language)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {t('invoiceForm.totalQuantity')}: {formatNumber((form.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0), i18n.language)}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default AddEditInvoice;
