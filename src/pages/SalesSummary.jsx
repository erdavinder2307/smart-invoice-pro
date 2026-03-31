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
  LinearProgress
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

const SalesSummary = () => {
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
      const response = await axios.get(createApiUrl('/api/reports/sales-summary'), {
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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            📈 Sales Summary
          </Typography>
        </Box>

        {/* Date Filter */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date" type="date" fullWidth
                value={startDate} onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date" type="date" fullWidth
                value={endDate} onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
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
            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Total Revenue</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {fmt(reportData.total_revenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Total Collected</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {fmt(reportData.total_paid)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Invoices Issued</Typography>
                    <Typography variant="h5" fontWeight="bold">{reportData.invoice_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Avg Invoice Value</Typography>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {fmt(reportData.avg_invoice_value)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Monthly Trend */}
            {reportData.monthly_breakdown.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Monthly Revenue Trend</Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={reportData.monthly_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(v) => fmt(v)} />
                    <Line type="monotone" dataKey="total" stroke="#3f51b5" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {/* Sales by Customer */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Sales by Customer</Typography>
              <Divider sx={{ mb: 2 }} />
              {reportData.customer_summary.length === 0 ? (
                <Typography color="text.secondary">No data for this period.</Typography>
              ) : (
                <>
                  {/* Bar chart — top 10 */}
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={reportData.customer_summary.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="customer_name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <RechartsTooltip formatter={(v) => fmt(v)} />
                      <Bar dataKey="total_amount" fill="#3f51b5" />
                    </BarChart>
                  </ResponsiveContainer>

                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Customer</strong></TableCell>
                          <TableCell align="center"><strong>Invoices</strong></TableCell>
                          <TableCell align="right"><strong>Total Invoiced</strong></TableCell>
                          <TableCell align="right"><strong>Total Collected</strong></TableCell>
                          <TableCell align="right" sx={{ width: 160 }}><strong>% of Revenue</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.customer_summary.map((c, idx) => {
                          const pct = reportData.total_revenue > 0
                            ? (c.total_amount / reportData.total_revenue * 100)
                            : 0;
                          return (
                            <TableRow key={c.customer_id || idx}>
                              <TableCell>{c.customer_name}</TableCell>
                              <TableCell align="center">{c.invoice_count}</TableCell>
                              <TableCell align="right">{fmt(c.total_amount)}</TableCell>
                              <TableCell align="right">{fmt(c.total_paid)}</TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={pct}
                                    sx={{ width: 80, height: 6, borderRadius: 3 }}
                                  />
                                  <Typography variant="caption">{pct.toFixed(1)}%</Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow sx={{ bgcolor: 'grey.100', '& td': { fontWeight: 'bold' } }}>
                          <TableCell>Total</TableCell>
                          <TableCell align="center">{reportData.invoice_count}</TableCell>
                          <TableCell align="right">{fmt(reportData.total_revenue)}</TableCell>
                          <TableCell align="right">{fmt(reportData.total_paid)}</TableCell>
                          <TableCell align="right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
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

export default SalesSummary;
