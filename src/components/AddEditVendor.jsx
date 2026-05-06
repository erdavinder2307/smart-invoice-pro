import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import MainLayout from './Layout/MainLayout';
import {
  Alert, Box, Button, CircularProgress, Grid,
  Paper, Typography,
} from '@mui/material';
import { C, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import { useTranslation } from 'react-i18next';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generateVendorMockData } from '../utils/mockDataGenerators';
import { runValidation, validators, scrollToFirstError } from '../utils/validation';
import { parseApiError, applyApiErrors } from '../utils/apiErrors';
import { isAutoFillEnabled } from '../utils/autoFillAccess';

const INITIAL_FORM = {
  vendor_name: '', contact_person: '', email: '',
  phone: '', address: '', gst_number: '',
  payment_terms: 'Net 30', status: 'Active', notes: '',
};

const IS_DEV_AUTOFILL = isAutoFillEnabled();
const PAYMENT_TERMS_OPTIONS = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60'];

const sectionTitleSx = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#333',
};

const AddEditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(createApiUrl(`/api/vendors/${id}`));
      setForm({
        ...INITIAL_FORM,
        ...(res.data || {}),
      });
    } catch { setApiError(t('addEditVendor.failedFetch')); }
    setLoading(false);
  }, [id, t]);

  useEffect(() => { if (id) fetchVendor(); }, [id, fetchVendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'gst_number' ? String(value || '').toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    // Clear field error on edit
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAutofill = () => {
    const generated = generateVendorMockData({ scenario: 'full' }) || {};
    const nextForm = {
      ...INITIAL_FORM,
      ...generated,
      gst_number: String(generated.gst_number || '').toUpperCase(),
      payment_terms: generated.payment_terms || 'Net 30',
      status: generated.status || 'Active',
    };
    setErrors({});
    setApiError('');
    setForm(nextForm);
  };

  const validate = () => {
    return runValidation(form, {
      vendor_name: [validators.required('Vendor Name')],
      email:       [validators.required('Email'), validators.email()],
      phone:       [validators.mobile()],
      gst_number:  [validators.gst()],
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      scrollToFirstError(fieldErrors);
      return;
    }

    const payload = {
      ...form,
      vendor_name: String(form.vendor_name || '').trim(),
      contact_person: String(form.contact_person || '').trim(),
      email: String(form.email || '').trim(),
      phone: String(form.phone || '').trim(),
      address: String(form.address || '').trim(),
      gst_number: String(form.gst_number || '').trim().toUpperCase(),
      notes: String(form.notes || '').trim(),
    };

    setSaving(true);
    try {
      if (id) await axios.put(createApiUrl(`/api/vendors/${id}`), payload);
      else await axios.post(createApiUrl('/api/vendors'), payload);
      navigate('/vendors');
    } catch (err) {
      const parsed = parseApiError(err, t('addEditVendor.failedSave'));
      const msg = applyApiErrors(parsed, setErrors);
      setApiError(msg);
      if (Object.keys(parsed.fields).length) scrollToFirstError(parsed.fields);
    }
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
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ minHeight: '100vh', pb: 6 }}>
        <Box sx={{ pt: 2 }}>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
            <Typography sx={{ fontSize: '1.85rem', fontWeight: 500, color: '#212121', textAlign: 'left' }}>
              {id ? t('addEditVendor.editTitle') : t('addEditVendor.newTitle')}
            </Typography>
            {IS_DEV_AUTOFILL && <DevAutoFillButton onClick={handleAutofill} />}
          </Box>

          {apiError && (
            <Alert severity="error" onClose={() => setApiError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {apiError}
            </Alert>
          )}

          <Paper
            component="form" onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>
                  Vendor Basics
                </Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="Vendor Name"
                    required
                    name="vendor_name"
                    value={form.vendor_name}
                    onChange={handleChange}
                    error={!!errors.vendor_name}
                    helperText={errors.vendor_name}
                  />

                  <FormInput
                    label="Contact Person"
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="Email"
                    required
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email}
                  />

                  <FormInput
                    label="Phone"
                    noDivider
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>
                  Business Details
                </Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="GST Number"
                    noDivider
                    name="gst_number"
                    value={form.gst_number}
                    onChange={handleChange}
                    placeholder="e.g. 27AABCU9603R1ZX"
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    sx={{ maxWidth: 340 }}
                    error={!!errors.gst_number}
                    helperText={errors.gst_number || 'Optional. Enter a valid GSTIN if available.'}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="Address"
                    noDivider
                    alignStart
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>
                  Financial Settings
                </Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelect
                    label="Payment Terms"
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    options={PAYMENT_TERMS_OPTIONS.map((term) => ({ value: term, label: term }))}
                    width={260}
                    helperText="Default due terms for bills from this vendor."
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelect
                    label="Status"
                    noDivider
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
                    width={180}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>
                  Additional Information
                </Typography>
              </Box>

              <FormInput label="Notes" noDivider alignStart name="notes" value={form.notes} onChange={handleChange}
                multiline rows={3} placeholder="Add any internal notes about this vendor…"
              />
            </Box>

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
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditVendor;
