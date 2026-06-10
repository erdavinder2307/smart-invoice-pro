import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { createApiUrl } from '../config/api';
import PayNowModal from '../components/PayNowModal';
import { resolveMediaUrl } from '../utils/mediaUrl';

const statusColors = {
  Paid: 'success',
  Draft: 'default',
  Issued: 'info',
  Overdue: 'error',
  Cancelled: 'warning',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const _DEFAULT_BRANDING = {
  primary_color: '#1a237e',
  accent_color:  '#2d6cdf',
  logo_url:      '',
  organization_name: 'Solidev Books',
  gst_mode: 'FULL_GST',
  gstin: '',
};

const PortalInvoiceView = () => {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [branding, setBranding] = useState(_DEFAULT_BRANDING);
  // Derived GST display flags from branding payload
  const portalGstMode = branding.gst_mode || 'FULL_GST';
  const showGstOnPortal = portalGstMode === 'FULL_GST' && Boolean(invoice?.is_gst_applicable);
  const isPortalComposition = portalGstMode === 'COMPOSITION';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payNowOpen, setPayNowOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await fetch(createApiUrl(`/api/portal/invoice/${token}`));
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
          if (data.branding) {
            setBranding({ ..._DEFAULT_BRANDING, ...data.branding });
          }
        } else {
          const err = await res.json();
          setError(err.error || 'Invoice not found.');
        }
      } catch {
        setError('Could not load invoice. Please check the link.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const isPaid = invoice?.status === 'Paid' || invoice?.status === 'Cancelled';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f7fa">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f7fa" p={3}>
        <Alert severity="error" sx={{ maxWidth: 480 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box bgcolor="#f5f7fa" minHeight="100vh" py={4}>
      <Container maxWidth="md">
        {/* Header bar */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            {branding.logo_url ? (
              <Box
                component="img"
                src={resolveMediaUrl(branding.logo_url)}
                alt={branding.organization_name || 'Logo'}
                sx={{ maxHeight: 44, maxWidth: 160, objectFit: 'contain' }}
              />
            ) : (
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: 2,
                  bgcolor: branding.primary_color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ReceiptIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {branding.organization_name || 'Solidev Books'}
              </Typography>
              <Typography variant="caption" color="text.secondary">Secure Invoice Portal</Typography>
            </Box>
          </Box>
          <Tooltip title={copied ? 'Copied!' : 'Copy this link'}>
            <Button
              variant="outlined"
              size="small"
              startIcon={copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
              onClick={handleCopyLink}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </Tooltip>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {/* Invoice header section */}
          <Box
            sx={{
              px: 4, py: 3,
              background: branding.primary_color,
              color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              flexWrap: 'wrap', gap: 2,
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 2 }}>Tax Invoice</Typography>
              <Typography variant="h4" fontWeight={800}>{invoice.invoice_number}</Typography>
              <Chip
                label={invoice.status}
                color={statusColors[invoice.status] || 'default'}
                size="small"
                sx={{ mt: 1, fontWeight: 600 }}
              />
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Total Amount</Typography>
              <Typography variant="h4" fontWeight={800}>{fmt(invoice.total_amount)}</Typography>
              {!isPaid && invoice.balance_due > 0 && (
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Balance Due: {fmt(invoice.balance_due)}
                </Typography>
              )}
            </Box>
          </Box>

          <Box px={4} py={3}>
            {/* Date & Customer row */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Issue Date</Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>{fmtDate(invoice.issue_date)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Due Date</Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5} color={invoice.status === 'Overdue' ? 'error.main' : 'text.primary'}>
                  {fmtDate(invoice.due_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Payment Terms</Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>{invoice.payment_terms || '—'}</Typography>
              </Grid>
            </Grid>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Billed To</Typography>
                  <Typography variant="body1" fontWeight={600} mt={0.5}>{invoice.customer_name || '—'}</Typography>
                  {invoice.customer_email && (
                    <Typography variant="body2" color="text.secondary">{invoice.customer_email}</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Line items */}
            {invoice.items && invoice.items.length > 0 ? (
              <TableContainer sx={{ mb: 3, overflowX: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Rate</TableCell>
                      {showGstOnPortal && (
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Tax</TableCell>
                      )}
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{item.name || item.product_name || '—'}</Typography>
                          {item.description && (
                            <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">{item.quantity || 1}</TableCell>
                        <TableCell align="right">{fmt(item.unit_price || item.rate || 0)}</TableCell>
                        {showGstOnPortal && (
                          <TableCell align="right">{item.tax_rate || item.gst_rate || 0}%</TableCell>
                        )}
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(item.amount || item.total || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box py={2} mb={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">No line items</Typography>
              </Box>
            )}

            {/* Totals */}
            <Box display="flex" justifyContent="flex-end" mb={3}>
              <Box sx={{ minWidth: 280 }}>
                <Box display="flex" justifyContent="space-between" py={0.75}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={500}>{fmt(invoice.subtotal)}</Typography>
                </Box>
                {showGstOnPortal && (
                  <>
                    {invoice.cgst_amount > 0 && (
                      <Box display="flex" justifyContent="space-between" py={0.75}>
                        <Typography variant="body2" color="text.secondary">CGST</Typography>
                        <Typography variant="body2">{fmt(invoice.cgst_amount)}</Typography>
                      </Box>
                    )}
                    {invoice.sgst_amount > 0 && (
                      <Box display="flex" justifyContent="space-between" py={0.75}>
                        <Typography variant="body2" color="text.secondary">SGST</Typography>
                        <Typography variant="body2">{fmt(invoice.sgst_amount)}</Typography>
                      </Box>
                    )}
                    {invoice.igst_amount > 0 && (
                      <Box display="flex" justifyContent="space-between" py={0.75}>
                        <Typography variant="body2" color="text.secondary">IGST</Typography>
                        <Typography variant="body2">{fmt(invoice.igst_amount)}</Typography>
                      </Box>
                    )}
                  </>
                )}
                {isPortalComposition && (
                  <Box py={0.75}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Composition Taxable Person. Not eligible to collect tax on supplies.
                    </Typography>
                  </Box>
                )}
                {invoice.total_tax > 0 && (
                  <Box display="flex" justifyContent="space-between" py={0.75}>
                    <Typography variant="body2" color="text.secondary">Total Tax</Typography>
                    <Typography variant="body2">{fmt(invoice.total_tax)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" py={0.75}>
                  <Typography variant="body1" fontWeight={700}>Total</Typography>
                  <Typography variant="body1" fontWeight={700}>{fmt(invoice.total_amount)}</Typography>
                </Box>
                {invoice.amount_paid > 0 && (
                  <Box display="flex" justifyContent="space-between" py={0.75}>
                    <Typography variant="body2" color="success.main">Amount Paid</Typography>
                    <Typography variant="body2" color="success.main">− {fmt(invoice.amount_paid)}</Typography>
                  </Box>
                )}
                {invoice.balance_due > 0 && (
                  <Box display="flex" justifyContent="space-between" py={0.75} sx={{ bgcolor: 'error.lighter', px: 1, borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight={700} color="error.main">Balance Due</Typography>
                    <Typography variant="body1" fontWeight={700} color="error.main">{fmt(invoice.balance_due)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Notes / Terms */}
            {invoice.notes && (
              <Box mb={2} p={2} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Notes</Typography>
                <Typography variant="body2" mt={0.5}>{invoice.notes}</Typography>
              </Box>
            )}
            {invoice.terms_conditions && (
              <Box mb={2} p={2} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Terms & Conditions</Typography>
                <Typography variant="body2" mt={0.5}>{invoice.terms_conditions}</Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Pay Now CTA */}
            {!isPaid ? (
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Outstanding balance: <strong>{fmt(invoice.balance_due)}</strong>
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setPayNowOpen(true)}
                  sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '1rem' }}
                >
                  Pay Now
                </Button>
              </Box>
            ) : (
              <Box textAlign="center" py={2}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="This invoice has been paid — thank you!"
                  color="success"
                  sx={{ fontWeight: 600, py: 2.5, px: 1 }}
                />
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box px={4} py={2} bgcolor="grey.50" borderTop="1px solid" borderColor="divider">
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              This is a secure, read-only invoice view.
              {branding.organization_name ? ` Issued by ${branding.organization_name}.` : ''}
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Pay Now Modal */}
      <PayNowModal
        open={payNowOpen}
        onClose={() => setPayNowOpen(false)}
        invoice={invoice}
        onSuccess={(txnId) => {
          setPayNowOpen(false);
          setPaymentSuccess(`Payment initiated! Transaction ID: ${txnId}. You will receive a confirmation shortly.`);
        }}
      />

      <Snackbar
        open={!!paymentSuccess}
        autoHideDuration={10000}
        onClose={() => setPaymentSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setPaymentSuccess('')} sx={{ width: '100%' }}>
          {paymentSuccess}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PortalInvoiceView;
