import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
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
import MainLayout from './Layout/MainLayout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerSelect from './common/CustomerSelect';
import AppFormField from './common/form/AppFormField';
import FormLayout from './common/form/FormLayout';
import {
  C,
  cancelBtnSx,
  fieldSx,
  footerSx,
  saveBtnSx,
} from './common/formStyles';
import { useTranslation } from 'react-i18next';
import DevAutoFillButton from './common/DevAutoFillButton';
import { isAutoFillEnabled } from '../utils/autoFillAccess';

const TAX_OPTIONS = [0, 5, 12, 18, 28];
const EMPTY_ITEM = {
  product_id: '',
  name: '',
  quantity: 1,
  rate: 0,
  discount: 0,
  tax: 0,
  unit: '',
  stock: null,
  amount: 0,
};

const AUTO_FILL_MODES = [
  { value: 'minimal', label: 'Minimal Auto Fill (quick testing)' },
  { value: 'full', label: 'Full Auto Fill (realistic scenario)' },
  { value: 'edge', label: 'Edge Case Auto Fill (advanced testing)' },
];

const initialForm = {
  quote_number: '',
  customer_id: '',
  issue_date: '',
  expiry_date: '',
  payment_terms: '',
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  status: 'Draft',
  notes: '',
  terms_conditions: '',
  is_gst_applicable: false,
  subject: '',
  salesperson: '',
  reference_number: '',
  project_name: '',
  tds_tcs_mode: 'tds',
  tds_tcs_rate: '',
  adjustment_label: 'Adjustment',
  adjustment_amount: '',
  items: [EMPTY_ITEM],
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
  },
};

const ActionTextButton = ({ children, ...props }) => (
  <Button
    size="small"
    {...props}
    sx={{
      minWidth: 'auto',
      alignSelf: 'flex-start',
      px: 1.15,
      py: 0.55,
      textTransform: 'none',
      fontSize: '0.75rem',
      borderRadius: '4px',
      borderColor: '#d8deea',
      color: '#4b5563',
      bgcolor: '#f7f9fc',
      whiteSpace: 'nowrap',
      '&:hover': { bgcolor: '#eef3fa', borderColor: '#c7d3ea' },
      ...props.sx,
    }}
  >
    {children}
  </Button>
);

const AddEditQuote = () => {
  const isDevAutoFillEnabled = isAutoFillEnabled();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const quoteId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [customersError, setCustomersError] = useState(false);
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [showItemErrors, setShowItemErrors] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const cellRefs = useRef({});

  const selectedCustomer = useMemo(
    () => customers.find((customer) => String(customer.id) === String(form.customer_id)),
    [customers, form.customer_id],
  );

  const productOptions = useMemo(
    () => (Array.isArray(products) ? products : []).map((product) => {
      const price = Number(product.price ?? product.selling_price ?? product.rate ?? product.sales_rate ?? 0);
      const tax = Number(product.tax_rate ?? product.gst_rate ?? product.tax ?? 18);
      return {
        id: product.id,
        name: product.name || product.item_name || product.title || 'Unnamed Item',
        rate: Number.isFinite(price) ? price : 0,
        tax: Number.isFinite(tax) ? tax : 0,
        unit: product.unit || product.uom || '',
        stock: Number(product.stock ?? product.available_stock ?? product.quantity_on_hand ?? 0),
      };
    }),
    [products],
  );

  const productMap = useMemo(
    () => new Map(productOptions.map((product) => [String(product.name).toLowerCase(), product])),
    [productOptions],
  );

  const itemErrors = useMemo(
    () => (form.items || []).map((item) => ({
      name: item.name && String(item.name).trim() ? '' : 'Item is required.',
      quantity: Number(item.quantity) > 0 ? '' : 'Quantity must be greater than 0.',
    })),
    [form.items],
  );

  const randomFrom = useCallback((list) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }, []);

  const getDate = useCallback((days = 0) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + days);
    return dt.toISOString().slice(0, 10);
  }, []);

  const calculateAmount = useCallback((item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;
    const base = Math.max(0, quantity * rate - discount);
    return base + (base * tax) / 100;
  }, []);

  const makeItemFromProduct = useCallback((product, overrides = {}) => {
    const next = {
      ...EMPTY_ITEM,
      product_id: product?.id || '',
      name: product?.name || '',
      quantity: overrides.quantity ?? 1,
      rate: overrides.rate ?? Number(product?.rate || 0),
      discount: overrides.discount ?? 0,
      tax: overrides.tax ?? Number(product?.tax || 0),
      unit: overrides.unit ?? (product?.unit || ''),
      stock: product?.stock ?? null,
    };
    return {
      ...next,
      amount: calculateAmount(next),
    };
  }, [calculateAmount]);

  const setCellRef = useCallback((rowIndex, colName, node) => {
    if (!cellRefs.current[rowIndex]) cellRefs.current[rowIndex] = {};
    cellRefs.current[rowIndex][colName] = node;
  }, []);

  const focusCell = useCallback((rowIndex, colName) => {
    const node = cellRefs.current?.[rowIndex]?.[colName];
    if (node && typeof node.focus === 'function') {
      node.focus();
    }
  }, []);

  const autoFillQuote = useCallback((mode) => {
    if (!isDevAutoFillEnabled) return;

    if (!customers.length || !productOptions.length) {
      setError('Auto Fill requires at least one customer and one product.');
      return;
    }

    const customer = randomFrom(customers);
    const pickProduct = () => randomFrom(productOptions);

    const withBase = {
      customer_id: customer?.id || '',
      issue_date: getDate(0),
      expiry_date: getDate(30),
      payment_terms: 'Net 30',
      is_gst_applicable: true,
      adjustment_label: 'Adjustment',
      tds_tcs_mode: 'tds',
      tds_tcs_rate: '',
      adjustment_amount: '',
      notes: '',
      terms_conditions: '',
      subject: '',
      salesperson: '',
      project_name: '',
    };

    if (mode === 'minimal') {
      const product = pickProduct();
      const items = [makeItemFromProduct(product, { quantity: 1, discount: 0 })];
      setForm((prev) => ({
        ...prev,
        ...withBase,
        items,
      }));
      setShowItemErrors(false);
      return;
    }

    if (mode === 'edge') {
      const product = pickProduct();
      const largeQty = Math.max(250, (Number(product?.stock || 0) + 200));
      const item = makeItemFromProduct(product, {
        quantity: largeQty,
        discount: Number(product?.rate || 500) * 0.65,
        tax: 0,
      });
      setForm((prev) => ({
        ...prev,
        ...withBase,
        expiry_date: getDate(7),
        subject: '',
        salesperson: '',
        project_name: '',
        notes: 'Stress test quote with unusual pricing and quantity conditions.',
        terms_conditions: '',
        adjustment_amount: String(-Math.floor(Math.random() * 400 + 50)),
        tds_tcs_mode: 'tcs',
        tds_tcs_rate: '0',
        items: [item],
      }));
      setShowItemErrors(false);
      return;
    }

    // full
    const rowCount = Math.max(2, Math.min(5, Math.floor(Math.random() * 4) + 2));
    const items = [];
    let lowStockApplied = false;

    for (let i = 0; i < rowCount; i += 1) {
      const product = pickProduct();
      const stock = Number(product?.stock || 0);
      const lowStockRow = !lowStockApplied && i === rowCount - 1;
      const quantity = lowStockRow
        ? (stock > 0 ? stock + Math.floor(Math.random() * 4 + 1) : Math.floor(Math.random() * 60 + 40))
        : Math.floor(Math.random() * 10 + 1);
      const item = makeItemFromProduct(product, {
        quantity,
        discount: Math.floor(Math.random() * 11),
      });
      items.push(item);
      if (lowStockRow) lowStockApplied = true;
    }

    const withholdingRateOptions = ['0.1', '1', '2', '5'];
    const modePick = Math.random() > 0.5 ? 'tds' : 'tcs';
    setForm((prev) => ({
      ...prev,
      ...withBase,
      issue_date: getDate(-2),
      expiry_date: getDate(25),
      subject: 'Comprehensive proposal for software rollout and onboarding',
      salesperson: randomFrom(['Aarav Kapoor', 'Meera Shah', 'Rohan Gupta', 'Kavya Nair']) || 'Sales Team',
      project_name: randomFrom(['ERP Migration', 'Warehouse Automation', 'Retail POS Upgrade']) || 'Implementation Project',
      notes: 'Includes implementation support, onboarding, and 30-day hypercare window.',
      terms_conditions: 'Payment due within 30 days. Delivery schedule subject to final approval.',
      tds_tcs_mode: modePick,
      tds_tcs_rate: randomFrom(withholdingRateOptions) || '1',
      adjustment_amount: String((Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 90 + 10)),
      items,
    }));
    setShowItemErrors(false);
  }, [
    customers,
    getDate,
    isDevAutoFillEnabled,
    makeItemFromProduct,
    productOptions,
    randomFrom,
  ]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setPageLoading(true);
        setCustomersError(false);
        const [customersResponse, productsResponse] = await Promise.all([
          axios.get(createApiUrl('/api/customers')).catch(() => { setCustomersError(true); return { data: [] }; }),
          axios.get(createApiUrl('/api/products')),
        ]);
        if (!active) return;

        setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);

        if (quoteId) {
          const quoteResponse = await axios.get(createApiUrl(`/api/quotes/${quoteId}`));
          if (!active) return;
          const archived = String(quoteResponse.data?.lifecycle_status || quoteResponse.data?.status || '').toUpperCase() === 'ARCHIVED' || Boolean(quoteResponse.data?.is_deleted);
          setIsArchived(archived);
          setForm((prev) => ({
            ...prev,
            ...quoteResponse.data,
            reference_number: quoteResponse.data?.reference_number || '',
            project_name: quoteResponse.data?.project_name || '',
            tds_tcs_mode: quoteResponse.data?.tds_tcs_mode || 'tds',
            tds_tcs_rate: quoteResponse.data?.tds_tcs_rate || '',
            adjustment_label: quoteResponse.data?.adjustment_label || 'Adjustment',
            adjustment_amount: quoteResponse.data?.adjustment_amount || '',
            items: Array.isArray(quoteResponse.data?.items) && quoteResponse.data.items.length
              ? quoteResponse.data.items.map((item) => ({ ...EMPTY_ITEM, ...item }))
              : [EMPTY_ITEM],
          }));
        } else {
          const today = new Date().toISOString().slice(0, 10);
          const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const cloneSourceId = location.state?.cloneFrom?.id;
          try {
            const nextNumberResponse = await axios.get(createApiUrl('/api/quotes/next-number'));
            if (!active) return;
            const nextNumber = nextNumberResponse.data?.next_number || 'QT-000001';

            if (cloneSourceId) {
              const cloneResponse = await axios.get(createApiUrl(`/api/quotes/${cloneSourceId}`));
              if (!active) return;
              const src = cloneResponse.data;
              setForm((prev) => ({
                ...prev,
                ...src,
                id: undefined,
                quote_number: nextNumber,
                issue_date: today,
                expiry_date: expiry,
                status: 'Draft',
                items: Array.isArray(src.items) && src.items.length
                  ? src.items.map((item) => ({ ...EMPTY_ITEM, ...item }))
                  : [EMPTY_ITEM],
              }));
            } else {
              setForm((prev) => ({
                ...prev,
                quote_number: nextNumber,
                issue_date: today,
                expiry_date: expiry,
              }));
            }
          } catch {
            if (!active) return;
            setForm((prev) => ({ ...prev, quote_number: 'QT-000001', issue_date: today, expiry_date: expiry }));
          }
        }
      } catch {
        if (active) setError('Failed to load quote details.');
      } finally {
        if (active) setPageLoading(false);
      }
    };

    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, loadRetryKey]);

  useEffect(() => {
    const lineSubtotal = (form.items || []).reduce((sum, item) => {
      const baseAmount = Math.max(0, (Number(item.quantity) || 0) * (Number(item.rate) || 0) - (Number(item.discount) || 0));
      return sum + baseAmount;
    }, 0);

    const lineTaxTotal = (form.items || []).reduce((sum, item) => {
      const baseAmount = Math.max(0, (Number(item.quantity) || 0) * (Number(item.rate) || 0) - (Number(item.discount) || 0));
      return sum + (baseAmount * (Number(item.tax) || 0)) / 100;
    }, 0);

    const manualTax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const totalTax = lineTaxTotal + manualTax;
    const adjustment = Number(form.adjustment_amount || 0);
    const totalAmount = lineSubtotal + totalTax + adjustment;

    setForm((prev) => {
      if (
        Number(prev.subtotal) === Number(lineSubtotal)
        && Number(prev.total_tax) === Number(totalTax)
        && Number(prev.total_amount) === Number(totalAmount)
      ) {
        return prev;
      }

      return {
        ...prev,
        subtotal: lineSubtotal,
        total_tax: totalTax,
        total_amount: totalAmount,
      };
    });
  }, [form.items, form.cgst_amount, form.sgst_amount, form.igst_amount, form.adjustment_amount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const nextItem = { ...item, [field]: value };
        const total = calculateAmount(nextItem);
        return { ...nextItem, amount: total };
      }),
    }));
  };

  const applyProductToItem = useCallback((index, product) => {
    if (!product) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const nextItem = {
          ...item,
          product_id: product.id,
          name: product.name,
          rate: Number(product.rate || 0),
          tax: Number(product.tax || 0),
          unit: product.unit || '',
          stock: product.stock ?? null,
        };
        return {
          ...nextItem,
          amount: calculateAmount(nextItem),
        };
      }),
    }));
  }, [calculateAmount]);

  const handleItemNameChange = useCallback((index, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const nextItem = { ...item, name: value };
        return { ...nextItem, amount: calculateAmount(nextItem) };
      }),
    }));
    const matched = productMap.get(String(value || '').trim().toLowerCase());
    if (matched) applyProductToItem(index, matched);
  }, [applyProductToItem, calculateAmount, productMap]);

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));

  const handleCellKeyDown = useCallback((event, rowIndex, colName) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const columns = ['name', 'quantity', 'rate', 'discount', 'tax'];
    const colIndex = columns.indexOf(colName);
    if (colIndex === -1) return;

    if (colIndex < columns.length - 1) {
      focusCell(rowIndex, columns[colIndex + 1]);
      return;
    }

    const isLastRow = rowIndex === (form.items || []).length - 1;
    if (isLastRow) {
      addItem();
      setTimeout(() => focusCell(rowIndex + 1, 'name'), 0);
      return;
    }
    focusCell(rowIndex + 1, 'name');
  }, [focusCell, form.items]);

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, itemIndex) => itemIndex !== index) : [{ ...EMPTY_ITEM }],
    }));
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const removeFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isArchived) {
      setError('Archived quotes are read-only. Restore the quote to edit.');
      return;
    }
    const submitStatus = event.nativeEvent?.submitter?.value || form.status || 'Draft';

    setLoading(true);
    setError('');
    setShowItemErrors(true);

    if (!form.customer_id) {
      setError('Please select a customer.');
      setLoading(false);
      return;
    }

    if (form.expiry_date && form.issue_date && new Date(form.expiry_date) <= new Date(form.issue_date)) {
      setError('Expiry date must be after issue date.');
      setLoading(false);
      return;
    }

    const sanitizedItems = (form.items || []).map((item) => ({
      ...item,
      name: String(item.name || '').trim(),
      quantity: Number(item.quantity) || 0,
      rate: Number(item.rate) || 0,
      discount: Number(item.discount) || 0,
      tax: Number(item.tax) || 0,
      amount: Number(item.amount) || 0,
    }));
    const validItems = sanitizedItems.filter((item) => item.name);
    if (!validItems.length) {
      setError('Please add at least one valid item.');
      setLoading(false);
      return;
    }
    if (validItems.some((item) => item.quantity <= 0)) {
      setError('Item quantity must be greater than 0.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        status: submitStatus,
        customer_name: selectedCustomer?.name || selectedCustomer?.display_name || '',
        customer_email: selectedCustomer?.email || '',
        customer_phone: selectedCustomer?.phone || selectedCustomer?.mobile || '',
        customer_id: form.customer_id,
        adjustment_amount: Number(form.adjustment_amount || 0),
        items: sanitizedItems.map((item) => ({
          ...item,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          tax: item.tax,
          amount: item.amount,
        })),
      };

      if (quoteId) await axios.put(createApiUrl(`/api/quotes/${quoteId}`), payload);
      else await axios.post(createApiUrl('/api/quotes'), payload);
      navigate('/quotes');
    } catch (requestError) {
      setError(`Failed to save quote: ${requestError.response?.data?.error || requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <MainLayout title="Quote">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ bgcolor: '#f7f8fb', minHeight: '100vh', pb: 9 }}>
        <Container maxWidth={false} sx={{ pt: 2, px: { xs: 2, md: 3 } }}>
          <Box sx={{ width: '100%' }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
                {error}
              </Alert>
            )}

            {isArchived && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '4px' }}>
                Archived quotes are read-only. Restore this quote before editing.
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2, gap: 1 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#212121', textAlign: 'left' }}>
                {quoteId ? t('addEditQuote.editTitle') : t('addEditQuote.newTitle')}
              </Typography>
              {isDevAutoFillEnabled && (
                <DevAutoFillButton
                  modes={AUTO_FILL_MODES}
                  onSelectMode={autoFillQuote}
                />
              )}
            </Box>

            <Paper
              component="form"
              onSubmit={handleSubmit}
              autoComplete="off"
              elevation={0}
              sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
            >
              <Box sx={{ px: 3, py: 3 }}>
                <FormLayout>
                  {customersError && (
                    <Alert
                      severity="error"
                      sx={{ mb: 1.5, borderRadius: '4px' }}
                      action={
                        <Button color="inherit" size="small" onClick={() => setLoadRetryKey((k) => k + 1)}>
                          Retry
                        </Button>
                      }
                    >
                      Failed to load customers. Check your connection and retry.
                    </Alert>
                  )}
                  <AppFormField label="Customer Name" required testId="quote-field-customer">
                    <CustomerSelect
                      customers={customers}
                      value={form.customer_id}
                      onChange={handleChange}
                      name="customer_id"
                      required
                    />
                  </AppFormField>

                  <AppFormField label="Quote #" required layout="half" testId="quote-field-number">
                    <TextField
                      value={form.quote_number}
                      size="small"
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={{ ...formFieldSx, '& .MuiOutlinedInput-root': { ...fieldSx['& .MuiOutlinedInput-root'], bgcolor: '#fbfcff' } }}
                    />
                  </AppFormField>

                  <AppFormField label="Reference #" layout="half" testId="quote-field-reference">
                    <TextField
                      name="reference_number"
                      value={form.reference_number}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      sx={formFieldSx}
                    />
                  </AppFormField>

                  <AppFormField label="Quote Date" required layout="half" testId="quote-field-issue-date">
                    <TextField
                      name="issue_date"
                      value={form.issue_date}
                      onChange={handleChange}
                      type="date"
                      size="small"
                      required
                      fullWidth
                      sx={formFieldSx}
                    />
                  </AppFormField>

                  <AppFormField label="Expiry Date" layout="half" testId="quote-field-expiry-date">
                    <TextField
                      name="expiry_date"
                      value={form.expiry_date}
                      onChange={handleChange}
                      type="date"
                      size="small"
                      fullWidth
                      sx={formFieldSx}
                    />
                  </AppFormField>

                  <AppFormField label="Salesperson" layout="half" testId="quote-field-salesperson">
                    <TextField
                      name="salesperson"
                      value={form.salesperson}
                      onChange={handleChange}
                      size="small"
                      placeholder="Select or Add Salesperson"
                      fullWidth
                      sx={formFieldSx}
                    />
                  </AppFormField>

                  <AppFormField label="Project Name" layout="half" testId="quote-field-project-name">
                    <TextField
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      size="small"
                      placeholder="Select a project"
                      fullWidth
                      sx={formFieldSx}
                    />
                  </AppFormField>

                  <AppFormField label="Subject" testId="quote-field-subject">
                    <TextField
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      placeholder="Let your customer know what this Quote is for"
                      sx={formFieldSx}
                    />
                  </AppFormField>
                </FormLayout>
              </Box>

              <Box sx={{ px: 3, py: 1.7, borderTop: `1px solid ${C.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>Item Table</Typography>
                  <Button type="button" sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: '0.75rem', color: C.primary, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                    Bulk Actions
                  </Button>
                </Box>

                <TableContainer sx={{ border: `1px solid ${C.border}`, borderRadius: '4px', overflowX: 'auto' }}>
                  <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fb' }}>
                        {[
                          { label: 'ITEM DETAILS', align: 'left' },
                          { label: 'QUANTITY', align: 'right' },
                          { label: 'RATE', align: 'right' },
                          { label: 'DISCOUNT', align: 'right' },
                          { label: 'TAX', align: 'left' },
                          { label: 'AMOUNT', align: 'right' },
                          { label: '', align: 'center' },
                        ].map((column) => (
                          <TableCell
                            key={column.label}
                            align={column.align}
                            sx={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: '#7b8799',
                              borderColor: '#e6eaf0',
                              py: 0.9,
                              ...(column.label === 'ITEM DETAILS' ? { width: '39%' } : {}),
                              ...(column.label === 'QUANTITY' ? { width: '10%' } : {}),
                              ...(column.label === 'RATE' ? { width: '10%' } : {}),
                              ...(column.label === 'DISCOUNT' ? { width: '10%' } : {}),
                              ...(column.label === 'TAX' ? { width: '14%' } : {}),
                              ...(column.label === 'AMOUNT' ? { width: '11%' } : {}),
                              ...(column.label === '' ? { width: 38 } : {}),
                            }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.items.map((item, index) => {
                        const lineTotal = Number(item.amount || 0);
                        return (
                          <TableRow key={index} sx={{ '& td': { borderColor: '#e6eaf0', py: 0, px: 0 }, '&:hover': { bgcolor: '#fcfdff' } }}>
                            <TableCell>
                              <Autocomplete
                                freeSolo
                                options={productOptions}
                                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                value={item.name || ''}
                                onInputChange={(_, value) => handleItemNameChange(index, value)}
                                onChange={(_, value) => {
                                  if (value && typeof value === 'object') {
                                    applyProductToItem(index, value);
                                    return;
                                  }
                                  handleItemNameChange(index, value || '');
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Type or click to select an item."
                                    fullWidth
                                    sx={tableInputSx}
                                    inputRef={(node) => setCellRef(index, 'name', node)}
                                    onKeyDown={(event) => handleCellKeyDown(event, index, 'name')}
                                  />
                                )}
                              />
                              {showItemErrors && itemErrors[index]?.name && (
                                <Typography sx={{ fontSize: '0.68rem', color: '#dc2626', px: 1, py: 0.4 }}>
                                  {itemErrors[index].name}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.quantity}
                                onChange={(event) => updateItem(index, 'quantity', Number(event.target.value) || 0)}
                                inputProps={{ min: 0, step: 1 }}
                                fullWidth
                                sx={tableInputSx}
                                inputRef={(node) => setCellRef(index, 'quantity', node)}
                                onKeyDown={(event) => handleCellKeyDown(event, index, 'quantity')}
                              />
                              {showItemErrors && itemErrors[index]?.quantity && (
                                <Typography sx={{ fontSize: '0.68rem', color: '#dc2626', px: 1, py: 0.4 }}>
                                  {itemErrors[index].quantity}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.rate}
                                onChange={(event) => updateItem(index, 'rate', Number(event.target.value) || 0)}
                                inputProps={{ min: 0, step: 0.01 }}
                                fullWidth
                                sx={tableInputSx}
                                inputRef={(node) => setCellRef(index, 'rate', node)}
                                onKeyDown={(event) => handleCellKeyDown(event, index, 'rate')}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.discount}
                                onChange={(event) => updateItem(index, 'discount', Number(event.target.value) || 0)}
                                inputProps={{ min: 0, step: 0.01 }}
                                fullWidth
                                sx={tableInputSx}
                                inputRef={(node) => setCellRef(index, 'discount', node)}
                                onKeyDown={(event) => handleCellKeyDown(event, index, 'discount')}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                name={`item-tax-${index}`}
                                value={item.tax}
                                onChange={(event) => updateItem(index, 'tax', Number(event.target.value) || 0)}
                                fullWidth
                                sx={tableInputSx}
                                inputRef={(node) => setCellRef(index, 'tax', node)}
                                onKeyDown={(event) => handleCellKeyDown(event, index, 'tax')}
                              >
                                {TAX_OPTIONS.map((rate) => (
                                  <MenuItem key={rate} value={rate}>{rate}%</MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 1.2 }}>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#202124' }}>
                                {lineTotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Remove row">
                                <IconButton size="small" onClick={() => removeItem(index)} sx={{ color: '#ef4444' }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mt: 1.2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start', flex: '1 1 320px' }}>
                    <ActionTextButton variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addItem}>
                      Add New Row
                    </ActionTextButton>
                    <ActionTextButton variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addItem}>
                      Add Items in Bulk
                    </ActionTextButton>
                  </Box>

                  <Box sx={{ width: 245, maxWidth: '100%', position: { md: 'sticky' }, top: { md: 88 }, alignSelf: { md: 'flex-start' } }}>
                    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, bgcolor: '#fafbfc', borderRadius: '4px', p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Sub Total</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>{Number(form.subtotal || 0).toFixed(2)}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.05 }}>
                        <RadioGroup row name="tds_tcs_mode" value={form.tds_tcs_mode} onChange={handleChange} sx={{ gap: 0.75 }}>
                          <ButtonBaseRadio value="tds" label="TDS" />
                          <ButtonBaseRadio value="tcs" label="TCS" />
                        </RadioGroup>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 1.1 }}>
                        <Box sx={{ width: 98 }}>
                          <TextField
                            name="adjustment_label"
                            value={form.adjustment_label}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                            sx={fieldSx}
                          />
                        </Box>
                        <Box sx={{ width: 80 }}>
                          <TextField
                            name="adjustment_amount"
                            value={form.adjustment_amount}
                            onChange={handleChange}
                            size="small"
                            type="number"
                            fullWidth
                            inputProps={{ step: 0.01 }}
                            sx={fieldSx}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ borderTop: `1px solid ${C.divider}`, pt: 1.2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.9 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#6b7280' }}>Tax</Typography>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#111827' }}>{Number(form.total_tax || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.9 }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#6b7280' }}>Withholding</Typography>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#111827' }}>
                            {form.tds_tcs_rate ? `${form.tds_tcs_mode.toUpperCase()} ${form.tds_tcs_rate}%` : '—'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>Total ( ₹ )</Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#202124' }}>{Number(form.total_amount || 0).toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ px: 3, py: 1.8, borderTop: `1px solid ${C.divider}` }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 220px' }, gap: 2.2, alignItems: 'start' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#333', mb: 0.75 }}>Customer Notes</Typography>
                    <TextField
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Looking forward for your business."
                      sx={fieldSx}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#333', mb: 0.75 }}>Attach File(s) to Quote</Typography>
                    <Button component="label" variant="outlined" sx={{ ...cancelBtnSx, px: 1.6, py: 0.7, fontSize: '0.78rem' }}>
                      Upload File
                      <input hidden multiple type="file" onChange={handleFilesSelected} />
                    </Button>
                    <Typography sx={{ fontSize: '0.72rem', color: C.hint, mt: 0.7 }}>
                      You can upload a maximum of 5 files, 10MB each
                    </Typography>
                    {pendingFiles.length > 0 && (
                      <Box sx={{ mt: 0.9, display: 'grid', gap: 0.45 }}>
                        {pendingFiles.map((file, index) => (
                          <Box key={`${file.name}-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {file.name}
                            </Typography>
                            <IconButton size="small" onClick={() => removeFile(index)} sx={{ color: '#ef4444', p: '2px' }}>
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ px: 3, py: 1.7, borderTop: `1px solid ${C.divider}`, bgcolor: '#fbfcfe' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 220px' }, gap: 2.2, alignItems: 'end' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#333', mb: 0.75 }}>Terms & Conditions</Typography>
                    <TextField
                      name="terms_conditions"
                      value={form.terms_conditions}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                      sx={fieldSx}
                    />
                  </Box>

                  <Box sx={{ alignSelf: 'end' }}>
                    <Typography sx={{ fontSize: '0.74rem', color: C.hint, textAlign: { xs: 'left', md: 'right' } }}>
                      PDF Template: Spreadsheet Template
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ ...footerSx, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1.1, flexWrap: 'wrap' }}>
                  {quoteId && (form.status === 'Accepted' || form.status === 'Sent') && !form.converted_to_invoice_id && (
                    <Button
                      type="button"
                      variant="outlined"
                      disabled={loading}
                      onClick={() => navigate(`/quotes/convert/${quoteId}/invoice`)}
                      sx={{ ...cancelBtnSx, color: '#1565d8', borderColor: '#1565d8', '&:hover': { borderColor: '#1565d8', bgcolor: '#eff6ff' } }}
                    >
                      Convert to Invoice
                    </Button>
                  )}
                  {quoteId && form.converted_to_invoice_id && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => navigate(`/invoices/${form.converted_to_invoice_id}`)}
                      sx={{ textTransform: 'none', color: '#1565d8', fontSize: '0.8125rem' }}
                    >
                      View Invoice →
                    </Button>
                  )}
                  <Button type="submit" value="Draft" variant="outlined" disabled={loading || isArchived} sx={cancelBtnSx}>
                    {loading ? 'Saving…' : 'Save as Draft'}
                  </Button>
                  <Button
                    type="submit"
                    value="Sent"
                    variant="contained"
                    disabled={loading || isArchived}
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={saveBtnSx}
                  >
                    {loading ? 'Saving…' : 'Save and Send'}
                  </Button>
                  <Button type="button" variant="text" onClick={() => navigate('/quotes')} disabled={loading} sx={{ textTransform: 'none', color: '#4b5563', fontSize: '0.8125rem' }}>
                    Cancel
                  </Button>
                </Box>
                <Typography sx={{ fontSize: '0.74rem', color: C.hint, display: { xs: 'none', md: 'block' } }}>
                  Status on save: {form.status}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

const ButtonBaseRadio = ({ value, label }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
    <Radio value={value} size="small" sx={{ p: '3px', mr: '2px', color: '#b6bdc7', '&.Mui-checked': { color: C.primary } }} />
    <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{label}</Typography>
  </Box>
);

export default AddEditQuote;
