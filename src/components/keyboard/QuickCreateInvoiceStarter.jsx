import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createApiUrl } from '../../config/api';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';

const getDisplayName = (customer, fallback) =>
  customer?.display_name || customer?.name || customer?.company_name || customer?.email || fallback;

const QuickCreateInvoiceStarter = () => {
  const { t } = useTranslation();
  const {
    quickCreateInvoiceOpen,
    closeQuickCreateInvoice,
    pushRecentCustomer,
    recentCustomers,
  } = useKeyboardShortcutsContext();

  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!quickCreateInvoiceOpen) return;

    let active = true;
    setLoading(true);
    setError('');
    setValue(null);

    axios.get(createApiUrl('/api/customers'))
      .then((res) => {
        if (!active) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setCustomers(rows);
      })
      .catch(() => {
        if (!active) return;
        setError(t('quickInvoice.loadFailed'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    setTimeout(() => inputRef.current?.focus(), 60);

    return () => {
      active = false;
    };
  }, [quickCreateInvoiceOpen, t]);

  const customerOptions = useMemo(() => {
    const known = new Set(customers.map((c) => c.id));
    const merged = [...recentCustomers.filter((c) => c?.id && !known.has(c.id)), ...customers];
    return merged;
  }, [customers, recentCustomers]);

  const handleSelect = (_e, customer) => {
    if (!customer?.id) return;

    pushRecentCustomer(customer);
    closeQuickCreateInvoice();
    navigate('/invoices/add', {
      state: {
        quickCreateCustomerId: customer.id,
        focusItemInput: true,
      },
    });
  };

  return (
    <Dialog
      open={quickCreateInvoiceOpen}
      onClose={closeQuickCreateInvoice}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 0.5 }}>{t('quickInvoice.title')}</DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('quickInvoice.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 1.25 }}>
            {error}
          </Alert>
        )}

        <Autocomplete
          size="small"
          options={customerOptions}
          value={value}
          loading={loading}
          onChange={handleSelect}
          getOptionLabel={(option) => getDisplayName(option, t('quickInvoice.unknown'))}
          isOptionEqualToValue={(option, selected) => option.id === selected?.id}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Box component="li" key={key} {...rest} sx={{ py: 1 }}>
                <Box>
                  <Typography variant="body2">{getDisplayName(option, t('quickInvoice.unknown'))}</Typography>
                  {option?.email ? (
                    <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                  ) : null}
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              label={t('quickInvoice.customer')}
              placeholder={t('quickInvoice.searchPlaceholder')}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuickCreateInvoiceStarter;
