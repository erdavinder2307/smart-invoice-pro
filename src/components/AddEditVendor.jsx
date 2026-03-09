import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import MainLayout from './Layout/MainLayout';
import {
  Alert, Box, Button, CircularProgress, Container,
  MenuItem, Paper, TextField, Typography,
} from '@mui/material';
import { C, ZohoRow, AppSelect, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';

const INITIAL_FORM = {
  vendor_name: '', contact_person: '', email: '',
  phone: '', address: '', gst_number: '',
  payment_terms: 'Net 30', status: 'Active', notes: '',
};

const AddEditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(createApiUrl(`/api/vendors/${id}`));
      setForm(res.data);
    } catch { setError('Failed to fetch vendor details'); }
    setLoading(false);
  }, [id]);

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
    } catch (err) { setError(err.response?.data?.error || 'Failed to save vendor'); }
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
    <MainLayout title={id ? 'Edit Vendor' : 'New Vendor'}>
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
                  Vendor Information
                </Typography>
              </Box>

              <ZohoRow label="Vendor Name" required>
                <TextField
                  name="vendor_name" value={form.vendor_name} onChange={handleChange}
                  size="small" fullWidth required sx={fieldSx}
                />
              </ZohoRow>

              <ZohoRow label="Contact Person">
                <TextField
                  name="contact_person" value={form.contact_person} onChange={handleChange}
                  size="small" fullWidth sx={fieldSx}
                />
              </ZohoRow>

              <ZohoRow label="Email Address" required>
                <TextField
                  name="email" value={form.email} onChange={handleChange}
                  type="email" size="small" fullWidth required sx={fieldSx}
                />
              </ZohoRow>

              <ZohoRow label="Phone">
                <TextField
                  name="phone" value={form.phone} onChange={handleChange}
                  size="small" fullWidth sx={fieldSx}
                />
              </ZohoRow>
            </Box>

            {/* ══ ADDRESS & TAX ════════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Address & Tax Details
                </Typography>
              </Box>

              <ZohoRow label="Address" alignStart>
                <TextField
                  name="address" value={form.address} onChange={handleChange}
                  size="small" fullWidth multiline rows={2} sx={fieldSx}
                />
              </ZohoRow>

              <ZohoRow label="GST Number" noDivider>
                <TextField
                  name="gst_number" value={form.gst_number} onChange={handleChange}
                  size="small" sx={{ ...fieldSx, maxWidth: 320 }}
                  placeholder="e.g. 27AABCU9603R1ZX"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </ZohoRow>
            </Box>

            {/* ══ PAYMENT & STATUS ════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Payment & Status
                </Typography>
              </Box>

              <ZohoRow label="Payment Terms">
                <Box sx={{ width: 240 }}>
                  <AppSelect name="payment_terms" value={form.payment_terms} onChange={handleChange}>
                    {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'].map(t => (
                      <MenuItem key={t} value={t} sx={menuItemSx}>{t}</MenuItem>
                    ))}
                  </AppSelect>
                </Box>
              </ZohoRow>

              <ZohoRow label="Status">
                <Box sx={{ width: 180 }}>
                  <AppSelect name="status" value={form.status} onChange={handleChange}>
                    <MenuItem value="Active" sx={menuItemSx}>Active</MenuItem>
                    <MenuItem value="Inactive" sx={menuItemSx}>Inactive</MenuItem>
                  </AppSelect>
                </Box>
              </ZohoRow>

              <ZohoRow label="Notes" noDivider alignStart>
                <TextField
                  name="notes" value={form.notes} onChange={handleChange}
                  size="small" fullWidth multiline rows={3}
                  placeholder="Add any internal notes about this vendor…"
                  sx={fieldSx}
                />
              </ZohoRow>
            </Box>

            {/* ══ FOOTER ═════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/vendors')} disabled={saving} sx={cancelBtnSx}>
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {saving ? 'Saving…' : id ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditVendor;
