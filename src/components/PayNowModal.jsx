import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, CircularProgress, Alert,
  Divider, Chip
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import axios from 'axios';
import { createApiUrl } from '../config/api';

/**
 * PayNowModal – opens a Zoho Payments checkout link for an unpaid invoice.
 *
 * Props:
 *   open       – boolean controlling visibility
 *   onClose    – called when modal is dismissed
 *   invoice    – invoice object { id, invoice_number, balance_due, total_amount, currency, status }
 *   onSuccess  – called after initiating payment (before webhook confirms)
 */
const PayNowModal = ({ open, onClose, invoice, onSuccess }) => {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [txnId, setTxnId]       = useState('');

  const userId = localStorage.getItem('user_id');

  const balanceDue = invoice?.balance_due ?? invoice?.total_amount ?? 0;
  const currency   = invoice?.currency ?? 'INR';
  const symbol     = currency === 'INR' ? '₹' : '$';

  const handleCreateSession = async () => {
    if (!invoice?.id) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(createApiUrl('/payments/create-session'), {
        invoice_id: invoice.id,
        user_id:    userId,
      });

      const { payment_url, transaction_id } = response.data;
      setPaymentUrl(payment_url);
      setTxnId(transaction_id);

      // Open Zoho Payments checkout in new tab
      window.open(payment_url, '_blank', 'noopener,noreferrer');

      if (onSuccess) onSuccess(transaction_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create payment session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentUrl('');
    setTxnId('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Pay Invoice Online</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {invoice && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Invoice Number</Typography>
              <Typography variant="body2" fontWeight="bold">{invoice.invoice_number}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Amount Due</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {symbol}{Number(balanceDue).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Currency</Typography>
              <Chip label={currency} size="small" />
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {!paymentUrl ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Clicking <strong>Pay Now</strong> will open a secure Zoho Payments checkout 
              page in a new tab. Your invoice will be marked as paid automatically once 
              the payment is confirmed.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">Secured by Zoho Payments</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">Supports UPI, Cards, Net Banking</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">PCI-DSS compliant</Typography>
            </Box>
          </Box>
        ) : (
          <Alert severity="success" sx={{ mb: 1 }}>
            Payment page opened in a new tab.{' '}
            <strong>
              <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                Click here
              </a>
            </strong>{' '}
            if it didn't open automatically.
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Transaction ID: {txnId}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {paymentUrl ? 'Close' : 'Cancel'}
        </Button>
        {!paymentUrl && (
          <Button
            variant="contained"
            onClick={handleCreateSession}
            disabled={loading || invoice?.status === 'Paid'}
            startIcon={loading ? <CircularProgress size={16} /> : <OpenInNewIcon />}
            sx={{ minWidth: 130 }}
          >
            {loading ? 'Creating...' : 'Pay Now'}
          </Button>
        )}
        {paymentUrl && (
          <Button
            variant="outlined"
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
          >
            Open Payment Page
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PayNowModal;
