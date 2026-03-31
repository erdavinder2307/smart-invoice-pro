import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MODE_COLORS = {
  'Cash': '#4CAF50',
  'Bank Transfer': '#2196F3',
  'UPI': '#FF9800',
  'Cheque': '#9C27B0',
  'Credit Card': '#F44336',
  'Unknown': '#9E9E9E'
};

const PaymentsMade = () => {
  const navigate = useNavigate();
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr).id : null;

  const fetchReport = async () => {
    if (!userId) { setError('User not authenticated'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(createApiUrl('/api/reports/payments-made'), {
        params: { user_id: userId, start_date: startDate, end_date: endDate }
      });
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            💸 Payments Made
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField label="Start Date" type="date" fullWidth value={startDate}
                onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="End Date" type="date" fullWidth value={endDate}
                onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" fullWidth onClick={fetchReport} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="outlined" fullWidth onClick={() => {
                const now = new Date();
                setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
                setEndDate(now.toISOString().split('T')[0]);
              }}>
                This Year
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : reportData ? (
          <>
            {/* KPI cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Total Paid</Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {fmt(reportData.total_paid)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Transactions</Typography>
                    <Typography variant="h4" fontWeight="bold">{reportData.payment_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Avg per Transaction</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {fmt(reportData.payment_count > 0 ? reportData.total_paid / reportData.payment_count : 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Daily trend */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Daily Trend</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {reportData.daily_trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={reportData.daily_trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <RechartsTooltip formatter={(v) => fmt(v)} />
                        <Line type="monotone" dataKey="total" stroke="#F44336" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography color="text.secondary">No data for this period.</Typography>
                  )}
                </Paper>
              </Grid>

              {/* By payment mode */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>By Payment Mode</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {reportData.mode_breakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={reportData.mode_breakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="mode" type="category" tick={{ fontSize: 11 }} width={90} />
                        <RechartsTooltip formatter={(v) => fmt(v)} />
                        <Bar dataKey="total" fill="#F44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography color="text.secondary">No data.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Payments table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Payment Transactions</Typography>
              <Divider sx={{ mb: 2 }} />
              {reportData.payments.length === 0 ? (
                <Typography color="text.secondary">No payments in this period.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Bill #</strong></TableCell>
                        <TableCell><strong>Vendor</strong></TableCell>
                        <TableCell><strong>Mode</strong></TableCell>
                        <TableCell><strong>Reference</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.payments.map((p, idx) => (
                        <TableRow key={p.payment_id || idx}>
                          <TableCell>{p.payment_date}</TableCell>
                          <TableCell>{p.bill_number}</TableCell>
                          <TableCell>{p.vendor_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={p.payment_mode}
                              size="small"
                              sx={{
                                bgcolor: (MODE_COLORS[p.payment_mode] || '#9E9E9E') + '22',
                                color: MODE_COLORS[p.payment_mode] || '#616161',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>{p.reference || '—'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            {fmt(p.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Period:</strong> {reportData.period.start_date} — {reportData.period.end_date}
              </Typography>
            </Box>
          </>
        ) : null}
      </Container>
    </MainLayout>
  );
};

export default PaymentsMade;
