import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Grid,
  Divider,
  TextField,
} from "@mui/material";
import MainLayout from "./Layout/MainLayout";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ConvertQuote = () => {
  const { id, type } = useParams(); // type can be 'invoice' or 'sales-order'
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [soNumber, setSoNumber] = useState("");

  useEffect(() => {
    fetchQuote();
    if (type === 'invoice') {
      fetchNextInvoiceNumber();
    } else if (type === 'sales-order') {
      fetchNextSONumber();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl(`/api/quotes/${id}`));
      setQuote(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load quote: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
    setLoading(false);
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/invoices/next-number"));
      setInvoiceNumber(response.data.next_invoice_number || "INV-001");
    } catch (err) {
      setInvoiceNumber("INV-001");
    }
  };

  const fetchNextSONumber = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/sales-orders/next-number"));
      setSoNumber(response.data.next_number || "SO-001");
    } catch (err) {
      setSoNumber("SO-001");
    }
  };

  const handleConvert = async () => {
    if (type === 'invoice' && !invoiceNumber) {
      setError("Please provide an invoice number");
      return;
    }

    if (type === 'sales-order' && !soNumber) {
      setError("Please provide a sales order number");
      return;
    }

    setConverting(true);
    setError("");

    try {
      const payload = {
        convert_to: type === 'invoice' ? 'invoice' : 'sales_order'
      };

      if (type === 'invoice') {
        payload.invoice_number = invoiceNumber;
      } else if (type === 'sales-order') {
        payload.so_number = soNumber;
      }

      const response = await axios.post(
        createApiUrl(`/api/quotes/${id}/convert`),
        payload
      );

      // Redirect based on conversion type
      if (type === 'invoice') {
        // Show success message and redirect to invoices
        setTimeout(() => {
          navigate(`/invoices/edit/${response.data.invoice_id}`);
        }, 1500);
      } else {
        // For sales order, redirect to sales orders
        setTimeout(() => {
          navigate(`/sales-orders/edit/${response.data.sales_order_id}`);
        }, 1500);
      }
    } catch (err) {
      setError("Conversion failed: " + (err.response?.data?.error || err.message));
      console.error(err);
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (!quote) {
    return (
      <MainLayout>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mt: 4 }}>Quote not found</Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <RequestQuoteIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              {type === 'invoice' ? (
                <ReceiptIcon sx={{ fontSize: 48, color: 'success.main' }} />
              ) : (
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'info.main' }} />
              )}
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Convert Quote to {type === 'invoice' ? 'Invoice' : 'Sales Order'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review the quote details and confirm the conversion
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {converting && (
            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
              Converting quote... Please wait.
            </Alert>
          )}

          {/* Quote Details */}
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quote Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Quote Number</Typography>
                  <Typography variant="body1" fontWeight={600}>{quote.quote_number}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" fontWeight={600}>{quote.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Issue Date</Typography>
                  <Typography variant="body1">{new Date(quote.issue_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                  <Typography variant="body1">{new Date(quote.expiry_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Subject</Typography>
                  <Typography variant="body1">{quote.subject || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    Total Amount: ₹{quote.total_amount?.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Invoice Number Input (only for invoice conversion) */}
          {type === 'invoice' && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  New Invoice Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Invoice Number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  helperText="This will be the invoice number for the converted quote"
                />
              </CardContent>
            </Card>
          )}

          {/* SO Number Input (only for sales order conversion) */}
          {type === 'sales-order' && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  New Sales Order Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Sales Order Number"
                  value={soNumber}
                  onChange={(e) => setSoNumber(e.target.value)}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  helperText="This will be the sales order number for the converted quote"
                />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/quotes")}
              disabled={converting}
              sx={{
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={type === 'invoice' ? 'success' : 'info'}
              onClick={handleConvert}
              disabled={converting || (type === 'invoice' && !invoiceNumber) || (type === 'sales-order' && !soNumber)}
              startIcon={converting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 }
              }}
            >
              {converting ? 'Converting...' : `Convert to ${type === 'invoice' ? 'Invoice' : 'Sales Order'}`}
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default ConvertQuote;
