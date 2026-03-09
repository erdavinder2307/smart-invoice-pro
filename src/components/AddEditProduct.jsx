import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createProduct, updateProduct } from '../services/productService';
import { createApiUrl } from '../config/api';
import {
  Alert, Box, Button, CircularProgress, Container,
  Grid, InputAdornment, MenuItem, Paper, TextField, Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import { C, ZohoRow, AppSelect, FieldLabel, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';

const categoryOptions = ['Electronics', 'Grocery', 'Clothing', 'Stationery', 'Other'];
const unitOptions = ['pcs', 'kg', 'litre', 'box', 'pack'];

const initialForm = {
  name: '', description: '', category: '',
  price: '', unit: '', tax_rate: '',
  reorder_level: '', reorder_qty: '', preferred_vendor_id: '',
};

const AddEditProduct = ({ onSuccess, onCancel }) => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    axios.get(createApiUrl('/api/vendors'))
      .then(res => setVendors(res.data))
      .catch(() => { });
    if (productId) {
      setLoading(true);
      axios.get(createApiUrl(`/api/products/${productId}`))
        .then(res => setForm(res.data))
        .catch(() => setError('Failed to fetch product details'))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Product name is required';
    if (!form.category.trim()) return 'Category is required';
    if (!form.price || Number(form.price) < 0) return 'Valid price is required';
    if (!form.unit.trim()) return 'Unit is required';
    if (form.tax_rate === '' || Number(form.tax_rate) < 0) return 'Valid tax rate is required';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const err = validateForm();
    if (err) return setError(err);
    setLoading(true);
    try {
      if (productId) await updateProduct(productId, form);
      else await createProduct(form);
      if (onSuccess) onSuccess();
      navigate('/products');
    } catch { setError('Failed to save product'); }
    setLoading(false);
  };

  if (loading && !form.name) return (
    <MainLayout title="Product">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </MainLayout>
  );

  return (
    <MainLayout title={productId ? 'Edit Product' : 'New Product'}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          <Paper
            component="form" onSubmit={handleSubmit} autoComplete="off"
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            {/* ══ PRODUCT DETAILS ════════════════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Product Information
                </Typography>
              </Box>

              <ZohoRow label="Product Name" required>
                <TextField
                  name="name" value={form.name} onChange={handleChange}
                  size="small" fullWidth required sx={fieldSx}
                />
              </ZohoRow>

              <ZohoRow label="Category" required>
                <Box sx={{ width: 280 }}>
                  <AppSelect name="category" value={form.category} onChange={handleChange} displayEmpty>
                    <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Select category</MenuItem>
                    {categoryOptions.map(c => <MenuItem key={c} value={c} sx={menuItemSx}>{c}</MenuItem>)}
                  </AppSelect>
                </Box>
              </ZohoRow>

              <ZohoRow label="Description" alignStart>
                <TextField
                  name="description" value={form.description} onChange={handleChange}
                  size="small" fullWidth multiline rows={3}
                  placeholder="Product description, features, specifications…"
                  sx={fieldSx}
                />
              </ZohoRow>
            </Box>

            {/* ══ PRICING & STOCK ══════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Pricing & Unit
                </Typography>
              </Box>

              <ZohoRow label="Price per Unit" required>
                <TextField
                  name="price" value={form.price} onChange={handleChange}
                  type="number" size="small" required
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>₹</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ...fieldSx, maxWidth: 240 }}
                />
              </ZohoRow>

              <ZohoRow label="Unit" required>
                <Box sx={{ width: 180 }}>
                  <AppSelect name="unit" value={form.unit} onChange={handleChange} displayEmpty>
                    <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Select unit</MenuItem>
                    {unitOptions.map(u => <MenuItem key={u} value={u} sx={menuItemSx}>{u}</MenuItem>)}
                  </AppSelect>
                </Box>
              </ZohoRow>

              <ZohoRow label="Tax Rate (%)" required>
                <TextField
                  name="tax_rate" value={form.tax_rate} onChange={handleChange}
                  type="number" size="small" required
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>%</Typography>
                      </InputAdornment>
                    ),
                  }}
                  helperText="GST/tax rate as per applicable regulations"
                  sx={{ ...fieldSx, maxWidth: 200 }}
                />
              </ZohoRow>

              {productId && (
                <ZohoRow label="Available Stock">
                  <TextField
                    value={typeof form.stock === 'number' ? form.stock : '—'}
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="Use Stock Adjustment to update inventory"
                    sx={{ ...fieldSx, maxWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: C.sectionBg } }}
                  />
                </ZohoRow>
              )}
            </Box>

            {/* ══ INVENTORY MANAGEMENT ════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Inventory Management
                </Typography>
              </Box>

              {/* Two-column grid for inventory fields */}
              <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel hint="Alert when stock falls to this level">Reorder Level</FieldLabel>
                    <TextField
                      name="reorder_level" value={form.reorder_level} onChange={handleChange}
                      type="number" size="small" fullWidth
                      inputProps={{ min: 0, step: 1 }} sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel hint="Quantity to order when restocking">Reorder Quantity</FieldLabel>
                    <TextField
                      name="reorder_qty" value={form.reorder_qty} onChange={handleChange}
                      type="number" size="small" fullWidth
                      inputProps={{ min: 0, step: 1 }} sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FieldLabel hint="Used for auto-generating restock orders">Preferred Vendor</FieldLabel>
                    <AppSelect
                      name="preferred_vendor_id" value={form.preferred_vendor_id}
                      onChange={handleChange} displayEmpty
                    >
                      <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>None</MenuItem>
                      {vendors.map(v => (
                        <MenuItem key={v.id} value={v.id} sx={menuItemSx}>{v.vendor_name}</MenuItem>
                      ))}
                    </AppSelect>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* ══ FOOTER ═════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button
                variant="outlined"
                onClick={() => { if (onCancel) onCancel(); navigate('/products'); }}
                disabled={loading} sx={cancelBtnSx}
              >
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" disabled={loading}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {loading ? 'Saving…' : productId ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditProduct;
