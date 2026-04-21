import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import MainLayout from './Layout/MainLayout';
import {
  Alert, Box, Button, CircularProgress, Container,
  Paper, Typography,
} from '@mui/material';
import { C, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import { useTranslation } from 'react-i18next';

const INITIAL_FORM = {
  vendor_name: '', contact_person: '', email: '',
  phone: '', address: '', gst_number: '',
  payment_terms: 'Net 30', status: 'Active', notes: '',
};

const AddEditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(createApiUrl(`/api/vendors/${id}`));
      setForm(res.data);
    } catch { setError(t('addEditVendor.failedFetch')); }
    setLoading(false);
  }, [id, t]);

  useEffect(() => { if (id) fetchVendor(); }, [id, fetchVendor]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (id) await axios.put(createApiUrl(`/api/vendors/${id}`), form);
      else await axios.post(createApiUrl('/api/vendors'), form);
      navigate('/vendors');
    } catch (err) { setError(err.response?.data?.error || t('addEditVendor.failedSave')); }
    setSaving(false);
  };

  if (loading) return (
    <MainLayout title="Vendor">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    </MainLayout>
  );

  return (
    <MainLayout title={id ? t('addEditVendor.editTitle') : t('addEditVendor.newTitle')}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          <Paper
            component="form" onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            {/* ══ VENDOR INFORMATION ════════════════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  {t('addEditVendor.vendorInfo')}
                </Typography>
              </Box>

              <FormInput label="Vendor Name" required name="vendor_name" value={form.vendor_name} onChange={handleChange} />

              <FormInput label="Contact Person" name="contact_person" value={form.contact_person} onChange={handleChange} />

              <FormInput label="Email Address" required name="email" value={form.email} onChange={handleChange} type="email" />

              <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            </Box>

            {/* ══ ADDRESS & TAX ════════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  {t('addEditVendor.addressTax')}
                </Typography>
              </Box>

              <FormInput label="Address" alignStart name="address" value={form.address} onChange={handleChange} multiline rows={2} />

              <FormInput label="GST Number" noDivider name="gst_number" value={form.gst_number} onChange={handleChange}
                placeholder="e.g. 27AABCU9603R1ZX"
                inputProps={{ style: { textTransform: 'uppercase' } }}
                sx={{ maxWidth: 320 }}
              />
            </Box>

            {/* ══ PAYMENT & STATUS ════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  {t('addEditVendor.paymentStatus')}
                </Typography>
              </Box>

              <FormSelect label="Payment Terms" name="payment_terms" value={form.payment_terms} onChange={handleChange}
                options={['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'].map(t => ({ value: t, label: t }))}
                width={240}
              />

              <FormSelect label="Status" name="status" value={form.status} onChange={handleChange}
                options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
                width={180}
              />

              <FormInput label="Notes" noDivider name="notes" value={form.notes} onChange={handleChange}
                multiline rows={3} placeholder="Add any internal notes about this vendor…"
              />
            </Box>

            {/* ══ FOOTER ═════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/vendors')} disabled={saving} sx={cancelBtnSx}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit" variant="contained" disabled={saving}
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

export default AddEditVendor;
