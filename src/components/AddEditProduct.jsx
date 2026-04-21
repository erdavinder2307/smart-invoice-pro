import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createProduct, updateProduct } from '../services/productService';
import { createApiUrl } from '../config/api';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import {
  AppSelect,
  C,
  FieldLabel,
  ZohoRow,
  cancelBtnSx,
  fieldSx,
  footerSx,
  menuItemSx,
  saveBtnSx,
} from './common/formStyles';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import { useTranslation } from 'react-i18next';

const unitOptions = ['pcs', 'kg', 'litre', 'box', 'pack', 'hrs', 'set'];
const taxPreferenceOptions = [
  { value: 'taxable', label: 'Taxable' },
  { value: 'tax_exempt', label: 'Tax Exempt' },
];
const taxRateOptions = [
  { value: '0', intra: 'Tax Exempt', inter: 'Tax Exempt' },
  { value: '5', intra: 'GST5 [5%]', inter: 'IGST5 [5%]' },
  { value: '12', intra: 'GST12 [12%]', inter: 'IGST12 [12%]' },
  { value: '18', intra: 'GST18 [18%]', inter: 'IGST18 [18%]' },
  { value: '28', intra: 'GST28 [28%]', inter: 'IGST28 [28%]' },
];
const salesAccountOptions = ['Sales', 'Sales Returns', 'Other Income'];
const purchaseAccountOptions = ['Cost of Goods Sold', 'Purchases', 'Cost of Sales'];

const initialForm = {
  item_type: 'goods',
  name: '',
  hsn_sac: '',
  category: '',
  unit: '',
  tax_preference: 'taxable',
  tax_rate: '18',
  description: '',
  purchase_description: '',
  price: '',
  purchase_rate: '',
  sales_enabled: true,
  purchase_enabled: true,
  sales_account: 'Sales',
  purchase_account: 'Cost of Goods Sold',
  reorder_level: '',
  reorder_qty: '',
  preferred_vendor_id: '',
  stock: '',
};

const sectionTitleSx = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#333',
};

const helperLineSx = {
  fontSize: '0.75rem',
  color: C.hint,
  lineHeight: 1.6,
};

const TOP_FIELD_WIDTH = 360;
const ITEM_FORM_LABEL_WIDTH = 120;

const taxLabelSx = {
  fontSize: '0.8125rem',
  color: '#333',
  minWidth: 120,
};

const AddEditProduct = ({ onSuccess, onCancel }) => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [showInventoryFields, setShowInventoryFields] = useState(false);
  const [showTaxRateEditor, setShowTaxRateEditor] = useState(false);

  const selectedTaxRate = taxRateOptions.find((option) => option.value === String(form.tax_rate ?? '18')) || taxRateOptions[3];

  useEffect(() => {
    axios.get(createApiUrl('/api/vendors'))
      .then((res) => setVendors(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});

    if (productId) {
      setLoading(true);
      axios.get(createApiUrl(`/api/products/${productId}`))
        .then((res) => {
          setForm((prev) => ({
            ...prev,
            ...res.data,
            item_type: res.data?.item_type || 'goods',
            hsn_sac: res.data?.hsn_sac || '',
            tax_preference: res.data?.tax_preference || (Number(res.data?.tax_rate || 0) > 0 ? 'taxable' : 'tax_exempt'),
            purchase_description: res.data?.purchase_description || '',
            purchase_rate: res.data?.purchase_rate ?? '',
            sales_enabled: res.data?.sales_enabled ?? true,
            purchase_enabled: res.data?.purchase_enabled ?? true,
            sales_account: res.data?.sales_account || 'Sales',
            purchase_account: res.data?.purchase_account || 'Cost of Goods Sold',
          }));
        })
        .catch(() => setServerError(t('addEditProduct.failedFetch')))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Clear field error when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setForm((prev) => {
      const nextValue = type === 'checkbox' ? checked : value;
      const updates = { [name]: nextValue };

      if (name === 'tax_preference' && value === 'tax_exempt') {
        updates.tax_rate = '0';
      }

      if (name === 'sales_enabled' && !checked) {
        updates.price = '';
      }

      if (name === 'purchase_enabled' && !checked) {
        updates.purchase_rate = '';
      }

      return { ...prev, ...updates };
    });
  };

  const MAX_PRICE = 99999999;

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (form.name.trim().length > 255) {
      newErrors.name = 'Item name must be 255 characters or fewer';
    }
    if (!form.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (form.sales_enabled) {
      if (form.price === '' || form.price === null) {
        newErrors.price = 'Selling price is required';
      } else if (Number(form.price) < 0) {
        newErrors.price = 'Selling price cannot be negative';
      } else if (Number(form.price) > MAX_PRICE) {
        newErrors.price = `Selling price cannot exceed ₹${MAX_PRICE.toLocaleString('en-IN')}`;
      }
    }
    if (form.purchase_enabled) {
      if (form.purchase_rate === '' || form.purchase_rate === null) {
        newErrors.purchase_rate = 'Cost price is required';
      } else if (Number(form.purchase_rate) < 0) {
        newErrors.purchase_rate = 'Cost price cannot be negative';
      } else if (Number(form.purchase_rate) > MAX_PRICE) {
        newErrors.purchase_rate = `Cost price cannot exceed ₹${MAX_PRICE.toLocaleString('en-IN')}`;
      }
    }
    if (form.tax_preference === 'taxable' && (form.tax_rate === '' || Number(form.tax_rate) < 0)) {
      newErrors.tax_rate = 'Valid tax rate is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload = {
      ...form,
      price: form.sales_enabled ? Number(form.price || 0) : 0,
      purchase_rate: form.purchase_enabled ? Number(form.purchase_rate || 0) : 0,
      tax_rate: form.tax_preference === 'taxable' ? Number(form.tax_rate || 0) : 0,
      reorder_level: form.reorder_level === '' ? 0 : Number(form.reorder_level),
      reorder_qty: form.reorder_qty === '' ? 0 : Number(form.reorder_qty),
    };

    setLoading(true);
    try {
      if (productId) await updateProduct(productId, payload);
      else await createProduct(payload);
      if (onSuccess) onSuccess();
      navigate('/products');
    } catch (err) {
      const apiError = err.response?.data?.error || 'Failed to save product';
      const apiField = err.response?.data?.field;
      // Map server-side field errors to inline field errors
      if (apiField === 'name') {
        setErrors((prev) => ({ ...prev, name: apiError }));
      } else {
        setServerError(apiError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.name) {
    return (
      <MainLayout title="Product">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ pb: 6 }}>
        <Box sx={{ pt: 2 }}>
          {serverError && (
            <Alert severity="error" onClose={() => setServerError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {serverError}
            </Alert>
          )}

          <Typography sx={{ fontSize: '1.85rem', fontWeight: 500, color: '#212121', mb: 1.5, textAlign: 'left' }}>
            {productId ? t('addEditProduct.editTitle') : t('addEditProduct.newTitle')}
          </Typography>

          <Paper
            component="form"
            onSubmit={handleSubmit}
            autoComplete="off"
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            <Box sx={{ px: 3 }}>
              <ZohoRow label="Type" hint="Choose whether this item is a good or a service" labelWidth={ITEM_FORM_LABEL_WIDTH}>
                <RadioGroup row name="item_type" value={form.item_type} onChange={handleChange} sx={{ gap: 1.5 }}>
                  <FormControlLabel
                    value="goods"
                    control={<Radio size="small" sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }} />}
                    label={<Typography sx={{ fontSize: '0.8125rem', color: C.label }}>Goods</Typography>}
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    value="service"
                    control={<Radio size="small" sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }} />}
                    label={<Typography sx={{ fontSize: '0.8125rem', color: C.label }}>Service</Typography>}
                    sx={{ m: 0 }}
                  />
                </RadioGroup>
              </ZohoRow>

              <FormInput
                label="Name"
                labelWidth={ITEM_FORM_LABEL_WIDTH}
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || ''}
                inputProps={{ maxLength: 255 }}
                sx={{ width: TOP_FIELD_WIDTH, maxWidth: '100%' }}
              />

              <FormSelect
                label="Unit"
                labelWidth={ITEM_FORM_LABEL_WIDTH}
                hint="Unit used while selling or purchasing this item"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                displayEmpty
                placeholder="Select unit"
                width={TOP_FIELD_WIDTH}
                options={unitOptions.map((unit) => ({ value: unit, label: unit }))}
              />

              <FormInput
                label="HSN Code"
                labelWidth={ITEM_FORM_LABEL_WIDTH}
                name="hsn_sac"
                value={form.hsn_sac}
                onChange={handleChange}
                sx={{ width: TOP_FIELD_WIDTH, maxWidth: '100%' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ fontSize: 15, color: C.primary }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormSelect
                label="Tax Preference"
                labelWidth={ITEM_FORM_LABEL_WIDTH}
                required
                noDivider
                name="tax_preference"
                value={form.tax_preference}
                onChange={handleChange}
                width={TOP_FIELD_WIDTH}
                options={taxPreferenceOptions}
              />
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}` }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={sectionTitleSx}>Sales Information</Typography>
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={(
                        <Checkbox
                          size="small"
                          name="sales_enabled"
                          checked={form.sales_enabled}
                          onChange={handleChange}
                          sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }}
                        />
                      )}
                      label={<Typography sx={{ fontSize: '0.8125rem', color: C.label }}>Sellable</Typography>}
                    />
                  </Box>

                  <ZohoRow label="Selling Price" labelWidth={ITEM_FORM_LABEL_WIDTH} required noDivider={false}>
                    <TextField
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      type="number"
                      size="small"
                      fullWidth
                      disabled={!form.sales_enabled}
                      error={!!errors.price}
                      helperText={errors.price || ''}
                      inputProps={{ min: 0, max: 99999999, step: 0.01 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>INR</Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="Account" labelWidth={ITEM_FORM_LABEL_WIDTH} required noDivider={false}>
                    <AppSelect name="sales_account" value={form.sales_account} onChange={handleChange} disabled={!form.sales_enabled}>
                      {salesAccountOptions.map((account) => <MenuItem key={account} value={account} sx={menuItemSx}>{account}</MenuItem>)}
                    </AppSelect>
                  </ZohoRow>

                  <ZohoRow label="Description" labelWidth={ITEM_FORM_LABEL_WIDTH} alignStart noDivider>
                    <TextField
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      disabled={!form.sales_enabled}
                      inputProps={{ maxLength: 1000 }}
                      sx={fieldSx}
                    />
                  </ZohoRow>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={sectionTitleSx}>Purchase Information</Typography>
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={(
                        <Checkbox
                          size="small"
                          name="purchase_enabled"
                          checked={form.purchase_enabled}
                          onChange={handleChange}
                          sx={{ p: '3px', mr: '4px', color: '#bbb', '&.Mui-checked': { color: C.primary } }}
                        />
                      )}
                      label={<Typography sx={{ fontSize: '0.8125rem', color: C.label }}>Purchasable</Typography>}
                    />
                  </Box>

                  <ZohoRow label="Cost Price" labelWidth={ITEM_FORM_LABEL_WIDTH} required noDivider={false}>
                    <TextField
                      name="purchase_rate"
                      value={form.purchase_rate}
                      onChange={handleChange}
                      type="number"
                      size="small"
                      fullWidth
                      disabled={!form.purchase_enabled}
                      error={!!errors.purchase_rate}
                      helperText={errors.purchase_rate || ''}
                      inputProps={{ min: 0, max: 99999999, step: 0.01 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>INR</Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="Account" labelWidth={ITEM_FORM_LABEL_WIDTH} required noDivider={false}>
                    <AppSelect name="purchase_account" value={form.purchase_account} onChange={handleChange} disabled={!form.purchase_enabled}>
                      {purchaseAccountOptions.map((account) => <MenuItem key={account} value={account} sx={menuItemSx}>{account}</MenuItem>)}
                    </AppSelect>
                  </ZohoRow>

                  <ZohoRow label="Description" labelWidth={ITEM_FORM_LABEL_WIDTH} alignStart noDivider={false}>
                    <TextField
                      name="purchase_description"
                      value={form.purchase_description}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      disabled={!form.purchase_enabled}
                      inputProps={{ maxLength: 1000 }}
                      sx={fieldSx}
                    />
                  </ZohoRow>

                  <ZohoRow label="Preferred Vendor" labelWidth={ITEM_FORM_LABEL_WIDTH} noDivider>
                    <AppSelect
                      name="preferred_vendor_id"
                      value={form.preferred_vendor_id}
                      onChange={handleChange}
                      displayEmpty
                      disabled={!form.purchase_enabled}
                    >
                      <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>None</MenuItem>
                      {vendors.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.id} sx={menuItemSx}>{vendor.name || vendor.vendor_name}</MenuItem>
                      ))}
                    </AppSelect>
                  </ZohoRow>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                <Typography sx={{ ...sectionTitleSx, textAlign: 'left' }}>Default Tax Rates</Typography>
                <Button
                  type="button"
                  size="small"
                  onClick={() => setShowTaxRateEditor((prev) => !prev)}
                  sx={{
                    p: 0,
                    minWidth: 18,
                    lineHeight: 1,
                    color: C.primary,
                    '&:hover': { bgcolor: 'transparent' },
                  }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 14 }} />
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gap: 1.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={taxLabelSx}>Intra State Tax Rate</Typography>
                  {showTaxRateEditor ? (
                    <Box sx={{ width: 190, maxWidth: '100%' }}>
                      <AppSelect
                        name="tax_rate"
                        value={String(form.tax_rate ?? '18')}
                        onChange={handleChange}
                        disabled={form.tax_preference !== 'taxable'}
                      >
                        {taxRateOptions.map((option) => (
                          <MenuItem key={`intra-${option.value}`} value={option.value} sx={menuItemSx}>
                            {option.intra}
                          </MenuItem>
                        ))}
                      </AppSelect>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                      {form.tax_preference === 'taxable' ? selectedTaxRate.intra : 'Tax exempt'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={taxLabelSx}>Inter State Tax Rate</Typography>
                  {showTaxRateEditor ? (
                    <Box sx={{ width: 190, maxWidth: '100%' }}>
                      <AppSelect
                        name="tax_rate"
                        value={String(form.tax_rate ?? '18')}
                        onChange={handleChange}
                        disabled={form.tax_preference !== 'taxable'}
                      >
                        {taxRateOptions.map((option) => (
                          <MenuItem key={`inter-${option.value}`} value={option.value} sx={menuItemSx}>
                            {option.inter}
                          </MenuItem>
                        ))}
                      </AppSelect>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
                      {form.tax_preference === 'taxable' ? selectedTaxRate.inter : 'Tax exempt'}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}` }}>
              <Typography sx={{ ...helperLineSx, mb: 2 }}>
                Do you want to keep track of this item? Enable inventory to view its stock based on the sales and purchase transactions you record.
              </Typography>
              <Button
                type="button"
                size="small"
                onClick={() => setShowInventoryFields((prev) => !prev)}
                sx={{
                  p: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  color: C.primary,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                {showInventoryFields ? 'Hide inventory details' : 'Add inventory details'}
              </Button>

              {showInventoryFields && (
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={4}>
                    <FieldLabel hint="Alert when stock falls to this level">Reorder Level</FieldLabel>
                    <TextField
                      name="reorder_level"
                      value={form.reorder_level}
                      onChange={handleChange}
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FieldLabel hint="Quantity to order when restocking">Reorder Quantity</FieldLabel>
                    <TextField
                      name="reorder_qty"
                      value={form.reorder_qty}
                      onChange={handleChange}
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0, step: 1 }}
                      sx={fieldSx}
                    />
                  </Grid>
                  {productId && (
                    <Grid item xs={12} md={4}>
                      <FieldLabel>Available Stock</FieldLabel>
                      <TextField
                        value={typeof form.stock === 'number' ? form.stock : '—'}
                        size="small"
                        fullWidth
                        InputProps={{ readOnly: true }}
                        helperText="Use Stock Adjustment to update inventory"
                        sx={{ ...fieldSx, '& .MuiOutlinedInput-root': { bgcolor: C.sectionBg } }}
                      />
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>

            <Box sx={{ ...footerSx, justifyContent: 'flex-start' }}>
              <Button
                variant="outlined"
                onClick={() => { if (onCancel) onCancel(); navigate('/products'); }}
                disabled={loading}
                sx={cancelBtnSx}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {loading ? 'Saving…' : productId ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditProduct;
