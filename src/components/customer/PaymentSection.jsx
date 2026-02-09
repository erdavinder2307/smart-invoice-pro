import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  Security
} from '@mui/icons-material';

const PaymentSection = ({ unpaidInvoices, onPayment }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');

  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handlePaymentDialog = () => {
    setPaymentDialogOpen(true);
    setSelectedInvoices(unpaidInvoices.map(inv => inv.id));
  };

  const handlePayment = () => {
    // Here you would integrate with payment gateway
    console.log('Processing payment for invoices:', selectedInvoices);
    console.log('Payment method:', paymentMethod);
    console.log('Total amount:', totalUnpaidAmount);
    
    // Mock payment processing
    alert(`Payment of $${totalUnpaidAmount.toFixed(2)} would be processed via ${paymentMethod}`);
    setPaymentDialogOpen(false);
  };

  const paymentMethods = [
    { value: 'stripe', label: 'Credit/Debit Card (Stripe)', icon: <CreditCard /> },
    { value: 'paypal', label: 'PayPal', icon: <Payment /> },
    { value: 'bank', label: 'Bank Transfer', icon: <AccountBalance /> }
  ];

  if (unpaidInvoices.length === 0) {
    return (
      <Card
        sx={{
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ py: 4 }}>
            <Payment sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h6" color="#4caf50" gutterBottom>
              All Invoices Paid!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have no outstanding payments at this time.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        sx={{
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#2c3e50',
              mb: 3
            }}
          >
            Payment Center
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Outstanding Balance
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{
                    color: '#f44336',
                    mb: 2
                  }}
                >
                  ${totalUnpaidAmount.toFixed(2)}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {unpaidInvoices.map((invoice) => (
                    <Chip
                      key={invoice.id}
                      label={`${invoice.id}: $${invoice.amount.toFixed(2)}`}
                      size="small"
                      sx={{
                        backgroundColor: invoice.status === 'Overdue' ? '#ffebee' : '#fff3e0',
                        color: invoice.status === 'Overdue' ? '#f44336' : '#ff9800',
                        border: `1px solid ${invoice.status === 'Overdue' ? '#f44336' : '#ff9800'}`
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePaymentDialog}
                  startIcon={<Payment />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                    }
                  }}
                >
                  Pay Now
                </Button>
                <Box display="flex" alignItems="center" gap={1}>
                  <Security sx={{ color: '#4caf50', fontSize: '1rem' }} />
                  <Typography variant="caption" color="text.secondary">
                    Secure payment processing
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Payment Checkout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            You are about to pay for {unpaidInvoices.length} outstanding invoice(s)
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Summary
            </Typography>
            {unpaidInvoices.map((invoice) => (
              <Box key={invoice.id} display="flex" justifyContent="space-between" py={1}>
                <Typography variant="body2">{invoice.id}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${invoice.amount.toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                ${totalUnpaidAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {method.icon}
                    {method.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert severity="warning" sx={{ mb: 2 }}>
            This is a demo payment interface. No actual charges will be processed.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={!paymentMethod}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px'
            }}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentSection;
