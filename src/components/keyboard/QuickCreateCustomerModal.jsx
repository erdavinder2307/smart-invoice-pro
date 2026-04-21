import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createApiUrl } from '../../config/api';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';

const initialForm = {
  name: '',
  phone: '',
  email: '',
};

const QuickCreateCustomerModal = () => {
  const { t } = useTranslation();
  const {
    quickCreateCustomerOpen,
    closeQuickCreateCustomer,
    pushRecentCustomer,
  } = useKeyboardShortcutsContext();

  const nameRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    if (!quickCreateCustomerOpen) return;
    setForm(initialForm);
    setError('');
    setTimeout(() => nameRef.current?.focus(), 50);
  }, [quickCreateCustomerOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (saving) return;
    closeQuickCreateCustomer();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError(t('quickCustomer.nameRequired'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        display_name: name,
        name,
        company_name: name,
        phone: form.phone.trim(),
        email: form.email.trim(),
      };

      const { data } = await axios.post(createApiUrl('/api/customers'), payload);
      const customer = {
        id: data?.id,
        display_name: data?.display_name || data?.name || name,
        name: data?.name || name,
        email: data?.email || form.email.trim(),
      };

      pushRecentCustomer(customer);
      window.dispatchEvent(new CustomEvent('customer:created', { detail: customer }));
      closeQuickCreateCustomer();
      setToast({ open: true, message: t('quickCustomer.success') });
    } catch (err) {
      setError(err.response?.data?.error || t('quickCustomer.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={quickCreateCustomerOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 0.5 }}>{t('quickCustomer.title')}</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t('quickCustomer.subtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.2}>
              <TextField
                inputRef={nameRef}
                name="name"
                label={t('quickCustomer.name')}
                value={form.name}
                onChange={handleChange}
                required
                size="small"
                fullWidth
              />
              <TextField
                name="phone"
                label={t('quickCustomer.phone')}
                value={form.phone}
                onChange={handleChange}
                size="small"
                fullWidth
              />
              <TextField
                name="email"
                label={t('quickCustomer.email')}
                type="email"
                value={form.email}
                onChange={handleChange}
                size="small"
                fullWidth
              />
            </Stack>
            <DialogActions sx={{ px: 0, pt: 1.5 }}>
              <Button onClick={handleClose} disabled={saving}>{t('common.cancel')}</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? t('common.createProgress') : t('common.create')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2400}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
      />
    </>
  );
};

export default QuickCreateCustomerModal;
