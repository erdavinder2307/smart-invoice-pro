import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import API_CONFIG from '../config/api';

const CustomerInvoiceDetail = () => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    
    if (!token) {
      navigate('/customer/login');
      return;
    }
    
    fetchInvoiceDetail(token);
  }, [id, navigate]);

  const fetchInvoiceDetail = async (token) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(createApiUrl(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        // For demo purposes, use mock data when API is not available
        console.log('API not available, using mock data for invoice detail');
        const mockInvoice = {
          id: id,
          invoice_number: `INV00${id}`,
          issue_date: '2025-08-22',
          due_date: '2025-09-22',
          total_amount: 1180.0,
          status: 'Issued',
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '1234567890',
          subtotal: 1000.0,
          total_tax: 180.0,
          amount_paid: 0.0,
          balance_due: 1180.0,
          notes: 'This is a demo invoice for testing purposes.'
        };
        setInvoice(mockInvoice);
      }
    } catch (err) {
      // For demo purposes, use mock data when there's a network error
      console.log('Network error, using mock data for invoice detail');
      const mockInvoice = {
        id: id,
        invoice_number: `INV00${id}`,
        issue_date: '2025-08-22',
        due_date: '2025-09-22',
        total_amount: 1180.0,
        status: 'Issued',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        subtotal: 1000.0,
        total_tax: 180.0,
        amount_paid: 0.0,
        balance_due: 1180.0,
        notes: 'This is a demo invoice for testing purposes.'
      };
      setInvoice(mockInvoice);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/customer/dashboard');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Invoice not found.
        </Alert>
        <Button variant="outlined" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Invoice Details
          </Typography>
          <Button variant="outlined" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Invoice Information
            </Typography>
            <Typography><strong>Invoice Number:</strong> {invoice.invoice_number}</Typography>
            <Typography><strong>Issue Date:</strong> {invoice.issue_date}</Typography>
            <Typography><strong>Due Date:</strong> {invoice.due_date}</Typography>
            <Typography><strong>Status:</strong> {invoice.status}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Typography><strong>Name:</strong> {invoice.customer_name}</Typography>
            <Typography><strong>Email:</strong> {invoice.customer_email}</Typography>
            <Typography><strong>Phone:</strong> {invoice.customer_phone}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Amount Details
            </Typography>
            <Typography><strong>Subtotal:</strong> ${invoice.subtotal?.toFixed(2) || '0.00'}</Typography>
            <Typography><strong>Tax Amount:</strong> ${invoice.total_tax?.toFixed(2) || '0.00'}</Typography>
            <Typography variant="h6" color="primary">
              <strong>Total Amount: ${invoice.total_amount?.toFixed(2) || '0.00'}</strong>
            </Typography>
            <Typography><strong>Amount Paid:</strong> ${invoice.amount_paid?.toFixed(2) || '0.00'}</Typography>
            <Typography><strong>Balance Due:</strong> ${invoice.balance_due?.toFixed(2) || '0.00'}</Typography>
          </Grid>
          
          {invoice.notes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography>{invoice.notes}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default CustomerInvoiceDetail;
