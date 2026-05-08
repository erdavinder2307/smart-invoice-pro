import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import MainLayout from './Layout/MainLayout';
import {
  Alert, Box, Button, Card, CardContent, CardMedia,
  CircularProgress, Container, FormHelperText, IconButton, MenuItem,
  Paper, TextField, Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { C, ZohoRow, AppSelect, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import FormDatePicker from './common/FormDatePicker';
import { useTranslation } from 'react-i18next';
import useAutoFill from '../hooks/useAutoFill';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generateExpenseMockData } from '../utils/mockDataGenerators';
import { runValidation, validators, scrollToFirstError } from '../utils/validation';
import { parseApiError, applyApiErrors } from '../utils/apiErrors';

const CATEGORIES = [
  'Office Supplies', 'Travel', 'Utilities', 'Marketing', 'Software',
  'Equipment', 'Meals & Entertainment', 'Professional Services',
  'Rent', 'Insurance', 'Other',
];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const INITIAL_FORM = {
  vendor_name: '', date: '', category: 'Other',
  amount: '', currency: 'INR', notes: '',
};

const AddEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { applyAutoFill } = useAutoFill({
    setForm,
    generator: generateExpenseMockData,
    fillEmptyOnly: true,
  });

  const fetchExpense = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(createApiUrl(`/api/expenses/${id}`));
      const e = res.data;
      const archived = String(e.lifecycle_status || e.status || '').toUpperCase() === 'ARCHIVED' || Boolean(e.is_deleted);
      setIsArchived(archived);
      setForm({ vendor_name: e.vendor_name, date: e.date, category: e.category, amount: e.amount, currency: e.currency, notes: e.notes || '' });
      if (e.receipt_url) setExistingReceipt(e.receipt_url);
    } catch { setApiError(t('addEditExpense.failedFetch')); }
    setLoading(false);
  }, [id, t]);

  useEffect(() => {
    if (id) fetchExpense();
    else setForm(p => ({ ...p, date: new Date().toISOString().slice(0, 10) }));
  }, [id, fetchExpense]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    return runValidation(form, {
      vendor_name: [validators.required('Vendor / Payee')],
      date:        [validators.date('Date')],
      category:    [validators.required('Category')],
      amount:      [validators.positiveNumber('Amount', { allowZero: false })],
    });
  };

  const processFile = file => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) { setApiError('Please upload PNG, JPG, GIF or PDF (max 5 MB)'); return; }
    if (file.size > 5 * 1024 * 1024) { setApiError('File size must be less than 5 MB'); return; }
    setReceiptFile(file);
    setApiError('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setReceiptPreview(e.target.result);
      reader.readAsDataURL(file);
    } else { setReceiptPreview(null); }
  };

  const handleFileSelect = e => processFile(e.target.files[0]);
  const handleDragOver = e => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = e => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = e => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };
  const removeReceipt = () => { setReceiptFile(null); setReceiptPreview(null); setExistingReceipt(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isArchived) {
      setApiError('Archived expenses are read-only. Restore the expense to edit.');
      return;
    }
    setApiError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      scrollToFirstError(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (receiptFile) {
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(receiptFile);
        });
        payload.receipt_base64 = base64;
        payload.receipt_filename = receiptFile.name;
      }
      if (id) await axios.put(createApiUrl(`/api/expenses/${id}`), payload);
      else await axios.post(createApiUrl('/api/expenses'), payload);
      navigate('/expenses');
    } catch (err) {
      const parsed = parseApiError(err, t('addEditExpense.failedSave'));
      const msg = applyApiErrors(parsed, setErrors);
      setApiError(msg);
      if (Object.keys(parsed.fields).length) scrollToFirstError(parsed.fields);
    }
    setSaving(false);
  };;

  if (loading) return (
    <MainLayout title="Expense">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </MainLayout>
  );

  return (
    <MainLayout title={id ? t('addEditExpense.editTitle') : t('addEditExpense.newTitle')}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {apiError && (
            <Alert severity="error" onClose={() => setApiError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {apiError}
            </Alert>
          )}

          {isArchived && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '4px' }}>
              Archived expenses are read-only. Restore this expense before editing.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.25 }}>
            <DevAutoFillButton onClick={applyAutoFill} />
          </Box>

          <Paper
            component="form" onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            {/* ══ EXPENSE DETAILS ═════════════════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  {t('addEditExpense.expenseDetails')}
                </Typography>
              </Box>

              <FormInput label="Vendor / Payee" required name="vendor_name" value={form.vendor_name} onChange={handleChange}
                placeholder="e.g. Amazon, Uber, Office Depot"
                error={!!errors.vendor_name} helperText={errors.vendor_name} />

              <FormDatePicker label="Date" required name="date" value={form.date} onChange={handleChange}
                error={!!errors.date} helperText={errors.date} />

              <FormSelect label="Category" required name="category" value={form.category} onChange={handleChange}
                options={CATEGORIES.map(c => ({ value: c, label: c }))} width={280}
                error={!!errors.category} helperText={errors.category} />

              <ZohoRow label="Amount" required>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      name="amount" value={form.amount} onChange={handleChange}
                      type="number" size="small" required
                      inputProps={{ step: '0.01', min: '0' }}
                      sx={{ ...fieldSx, width: 200 }}
                      error={!!errors.amount}
                    />
                    <Box sx={{ width: 120 }}>
                      <AppSelect name="currency" value={form.currency} onChange={handleChange}>
                        {CURRENCIES.map(c => <MenuItem key={c} value={c} sx={menuItemSx}>{c}</MenuItem>)}
                      </AppSelect>
                    </Box>
                  </Box>
                  {errors.amount && (
                    <FormHelperText error sx={{ mx: 0 }}>{errors.amount}</FormHelperText>
                  )}
                </Box>
              </ZohoRow>

              <FormInput label="Notes" noDivider name="notes" value={form.notes} onChange={handleChange}
                multiline rows={3} placeholder="Add any additional notes about this expense…" />
            </Box>

            {/* ══ RECEIPT UPLOAD ══════════════════════════════════════════ */}
            <Box sx={{ px: 3, py: 2.5, borderTop: `1px solid ${C.divider}` }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333', mb: 0.5 }}>
                {t('addEditExpense.receipt')}
              </Typography>
              <Typography variant="caption" sx={{ color: C.hint, display: 'block', mb: 2 }}>
                {t('addEditExpense.uploadHint')}
              </Typography>

              {/* Drop zone */}
              {!receiptFile && !existingReceipt && (
                <Box
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  onClick={() => document.getElementById('receipt-upload-field').click()}
                  sx={{
                    border: `2px dashed ${isDragging ? C.primary : C.border}`,
                    borderRadius: '4px',
                    py: 4, px: 2,
                    textAlign: 'center',
                    bgcolor: isDragging ? '#e8f0fe' : C.sectionBg,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: C.primary, bgcolor: '#e8f0fe' },
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: C.hint, mb: 1 }} />
                  <Typography sx={{ fontSize: '0.875rem', color: C.label }}>
                    {t('addEditExpense.dragDrop')}
                  </Typography>
                </Box>
              )}

              {/* Preview */}
              {(receiptPreview || existingReceipt) && (
                <Card sx={{ maxWidth: 360, border: `1px solid ${C.border}`, boxShadow: 'none', borderRadius: '4px' }}>
                  {receiptPreview ? (
                    <CardMedia component="img" height="180" image={receiptPreview} alt="Receipt preview"
                      sx={{ objectFit: 'contain', bgcolor: C.sectionBg }} />
                  ) : receiptFile?.type === 'application/pdf' ? (
                    <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: C.sectionBg }}>
                      <PictureAsPdfIcon sx={{ fontSize: 72, color: '#d93025' }} />
                    </Box>
                  ) : existingReceipt ? (
                    <CardMedia component="img" height="180" image={createApiUrl(existingReceipt)} alt="Receipt"
                      sx={{ objectFit: 'contain', bgcolor: C.sectionBg }} />
                  ) : null}
                  <CardContent sx={{ py: 1.25, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                        {receiptFile ? receiptFile.name : 'Existing Receipt'}
                      </Typography>
                      {receiptFile && (
                        <Typography variant="caption" sx={{ color: C.hint }}>
                          {(receiptFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      )}
                    </Box>
                    <IconButton size="small" onClick={removeReceipt}
                      sx={{ color: C.hint, '&:hover': { color: '#d93025' } }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </CardContent>
                </Card>
              )}

              {/* Change button after upload */}
              {(receiptFile || existingReceipt) && (
                <Button
                  variant="outlined" size="small" startIcon={<CloudUploadIcon />}
                  onClick={() => document.getElementById('receipt-upload-field').click()}
                  sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.8125rem', borderRadius: '4px', borderColor: C.border, color: '#555' }}
                >
                  {t('addEditExpense.changeReceipt')}
                </Button>
              )}

              <input
                id="receipt-upload-field"
                type="file" accept="image/*,application/pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Box>

            {/* ══ FOOTER ═════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/expenses')} disabled={saving} sx={cancelBtnSx}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit" variant="contained" disabled={saving || isArchived}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {saving ? t('common.saving') : id ? t('common.update') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditExpense;
