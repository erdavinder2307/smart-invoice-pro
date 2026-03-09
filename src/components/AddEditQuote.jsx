import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import {
  Alert, Box, Button, Checkbox, CircularProgress, Container,
  Divider, FormControlLabel, IconButton, MenuItem, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { C, ZohoRow, AppSelect, FieldLabel, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';

const statusOptions = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired', 'Converted'];

const initialForm = {
  quote_number: '', customer_id: '', issue_date: '', expiry_date: '',
  payment_terms: '', subtotal: 0, cgst_amount: 0, sgst_amount: 0,
  igst_amount: 0, total_tax: 0, total_amount: 0,
  status: 'Draft', notes: '', terms_conditions: '',
  is_gst_applicable: false, subject: '', salesperson: '',
  items: [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const CellField = ({ value, onChange, width = 90, inputProps }) => (
  <TextField
    size="small" type="number" value={value} onChange={onChange}
    inputProps={inputProps}
    sx={{
      width,
      '& .MuiOutlinedInput-root': {
        borderRadius: '4px', fontSize: '0.875rem',
        '& fieldset': { borderColor: C.border },
        '&:hover fieldset': { borderColor: '#b0b0b0' },
        '&.Mui-focused fieldset': { borderColor: C.primary },
      },
      '& .MuiInputBase-input': { py: '5px', px: '8px', fontSize: '0.875rem' },
    }}
  />
);

const AddEditQuote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quoteId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(createApiUrl('/api/customers')).then(res => {
      setCustomers(res.data);
      if (!quoteId) {
        const today = new Date().toISOString().slice(0, 10);
        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        axios.get(createApiUrl('/api/quotes/next-number'))
          .then(nr => setForm(f => ({ ...f, quote_number: nr.data.next_number, issue_date: today, expiry_date: expiry })))
          .catch(() => setForm(f => ({ ...f, quote_number: 'QT-001', issue_date: today, expiry_date: expiry })));
      } else {
        axios.get(createApiUrl(`/api/quotes/${quoteId}`))
          .then(r => setForm(r.data))
          .catch(() => setError('Failed to load quote'));
      }
    }).catch(() => setError('Failed to load customers'));
  }, [quoteId]);

  useEffect(() => {
    let subtotal = 0;
    form.items?.forEach(item => { subtotal += (item.quantity * item.rate - item.discount) * (1 + item.tax / 100); });
    const total_tax = +form.cgst_amount + +form.sgst_amount + +form.igst_amount;
    const total_amount = subtotal + total_tax;
    setForm(f => ({ ...f, subtotal, total_tax, total_amount }));
    // eslint-disable-next-line
  }, [form.items, form.cgst_amount, form.sgst_amount, form.igst_amount]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm(f => ({ ...f, items }));
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }] }));
  const removeItem = idx => {
    const items = form.items.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, items: items.length ? items : [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.customer_id) { setError('Please select a customer'); setLoading(false); return; }
    if (form.expiry_date && form.issue_date && new Date(form.expiry_date) <= new Date(form.issue_date)) {
      setError('Expiry date must be after issue date'); setLoading(false); return;
    }
    try {
      if (quoteId) await axios.put(createApiUrl(`/api/quotes/${quoteId}`), form);
      else await axios.post(createApiUrl('/api/quotes'), form);
      navigate('/quotes');
    } catch (err) { setError('Failed to save quote: ' + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  const itemTotal = item => ((item.quantity * item.rate - item.discount) * (1 + item.tax / 100));

  return (
    <MainLayout title={quoteId ? 'Edit Quote' : 'New Quote'}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>{error}</Alert>}

          <Paper
            component="form" onSubmit={handleSubmit} autoComplete="off"
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            {/* ══ HEADER FIELDS ══════════════════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Quote Details</Typography>
              </Box>

              <ZohoRow label="Customer" required>
                <Box sx={{ maxWidth: 400 }}>
                  <AppSelect name="customer_id" value={form.customer_id} onChange={handleChange} displayEmpty>
                    <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Select customer</MenuItem>
                    {customers.map(c => <MenuItem key={c.id} value={c.id} sx={menuItemSx}>{c.name}</MenuItem>)}
                  </AppSelect>
                </Box>
              </ZohoRow>

              <ZohoRow label="Quote #">
                <TextField value={form.quote_number} size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...fieldSx, maxWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: C.sectionBg } }} />
              </ZohoRow>

              <ZohoRow label="Status">
                <Box sx={{ width: 180 }}>
                  <AppSelect name="status" value={form.status} onChange={handleChange}>
                    {statusOptions.map(s => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
                  </AppSelect>
                </Box>
              </ZohoRow>

              <ZohoRow label="Issue Date">
                <TextField name="issue_date" value={form.issue_date} onChange={handleChange}
                  type="date" size="small" required InputLabelProps={{ shrink: true }}
                  sx={{ ...fieldSx, maxWidth: 220 }} />
              </ZohoRow>

              <ZohoRow label="Expiry Date">
                <TextField name="expiry_date" value={form.expiry_date} onChange={handleChange}
                  type="date" size="small" required InputLabelProps={{ shrink: true }}
                  sx={{ ...fieldSx, maxWidth: 220 }} />
              </ZohoRow>

              <ZohoRow label="Payment Terms">
                <TextField name="payment_terms" value={form.payment_terms} onChange={handleChange}
                  size="small" placeholder="e.g. Net 30" sx={{ ...fieldSx, maxWidth: 280 }} />
              </ZohoRow>

              <ZohoRow label="Salesperson">
                <TextField name="salesperson" value={form.salesperson} onChange={handleChange}
                  size="small" sx={{ ...fieldSx, maxWidth: 280 }} />
              </ZohoRow>

              <ZohoRow label="Subject">
                <TextField name="subject" value={form.subject} onChange={handleChange}
                  size="small" fullWidth placeholder="What is this quote for?" sx={fieldSx} />
              </ZohoRow>
            </Box>

            {/* ══ LINE ITEMS ════════════════════════════════════════════ */}
            <Box sx={{ px: 3, pt: 2.5, pb: 2, borderTop: `1px solid ${C.divider}` }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333', mb: 1.5 }}>Line Items</Typography>
              <TableContainer sx={{ border: `1px solid ${C.border}`, borderRadius: '4px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: C.sectionBg }}>
                      {['Qty', 'Rate (₹)', 'Discount (₹)', 'Tax %', 'Amount (₹)', ''].map((h, i) => (
                        <TableCell key={i} align={i >= 4 ? 'right' : 'left'}
                          sx={{ fontWeight: 600, fontSize: '0.8125rem', color: C.label, py: 1, borderColor: C.divider }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items?.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#fafbfc' } }}>
                        <TableCell sx={{ borderColor: C.divider }}>
                          <CellField width={70} value={item.quantity} inputProps={{ min: 0 }}
                            onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell sx={{ borderColor: C.divider }}>
                          <CellField width={100} value={item.rate} inputProps={{ min: 0, step: 0.01 }}
                            onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell sx={{ borderColor: C.divider }}>
                          <CellField width={100} value={item.discount} inputProps={{ min: 0, step: 0.01 }}
                            onChange={e => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell sx={{ borderColor: C.divider }}>
                          <CellField width={80} value={item.tax} inputProps={{ min: 0, max: 100, step: 0.1 }}
                            onChange={e => updateItem(idx, 'tax', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: C.primary, fontSize: '0.875rem', borderColor: C.divider }}>
                          ₹{itemTotal(item).toFixed(2)}
                        </TableCell>
                        <TableCell align="center" sx={{ borderColor: C.divider }}>
                          <Tooltip title="Remove">
                            <IconButton size="small" onClick={() => removeItem(idx)}
                              sx={{ color: C.hint, '&:hover': { color: '#d93025' } }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button size="small" startIcon={<AddIcon />} onClick={addItem} variant="outlined"
                sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.8125rem', color: C.primary, borderColor: C.border, borderRadius: '4px' }}>
                Add Line Item
              </Button>
            </Box>

            {/* ══ TOTALS + GST ════════════════════════════════════════ */}
            <Box sx={{ px: 3, py: 2.5, borderTop: `1px solid ${C.divider}`, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 320px' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333', mb: 2 }}>Tax Details</Typography>
                <FormControlLabel
                  control={<Checkbox checked={form.is_gst_applicable} onChange={handleChange} name="is_gst_applicable" size="small" />}
                  label={<Typography sx={{ fontSize: '0.875rem' }}>GST Applicable</Typography>}
                  sx={{ mb: 1, display: 'block' }}
                />
                {form.is_gst_applicable && (
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {[['CGST (₹)', 'cgst_amount'], ['SGST (₹)', 'sgst_amount'], ['IGST (₹)', 'igst_amount']].map(([lbl, key]) => (
                      <Box key={key} sx={{ flex: '1 1 100px' }}>
                        <FieldLabel>{lbl}</FieldLabel>
                        <TextField size="small" type="number" name={key} value={form[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                          inputProps={{ min: 0, step: 0.01 }} sx={{ ...fieldSx, width: '100%' }} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ flex: '0 0 260px', bgcolor: C.sectionBg, borderRadius: '4px', border: `1px solid ${C.border}`, p: 2 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333', mb: 1.5 }}>Summary</Typography>
                {[
                  ['Subtotal', `₹${(+form.subtotal).toFixed(2)}`, false],
                  ['Tax', `₹${(+form.total_tax).toFixed(2)}`, false],
                  ['Total', `₹${(+form.total_amount).toFixed(2)}`, true],
                ].map(([lbl, val, bold]) => (
                  <Box key={lbl} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: bold ? C.label : C.hint, fontWeight: bold ? 600 : 400 }}>{lbl}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: bold ? 700 : 500, color: bold ? C.primary : C.label }}>{val}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ══ NOTES & TERMS ══════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Notes & Terms</Typography>
              </Box>
              <ZohoRow label="Customer Notes" alignStart>
                <TextField name="notes" value={form.notes} onChange={handleChange}
                  size="small" fullWidth multiline rows={2}
                  placeholder="Thank you for your business!" sx={fieldSx} />
              </ZohoRow>
              <ZohoRow label="Terms & Conditions" alignStart noDivider>
                <TextField name="terms_conditions" value={form.terms_conditions} onChange={handleChange}
                  size="small" fullWidth multiline rows={2}
                  placeholder="Payment terms, return policy, etc." sx={fieldSx} />
              </ZohoRow>
            </Box>

            {/* ══ FOOTER ═════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/quotes')} disabled={loading} sx={cancelBtnSx}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}>
                {loading ? 'Saving…' : quoteId ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditQuote;
