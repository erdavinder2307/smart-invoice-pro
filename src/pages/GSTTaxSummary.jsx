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
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PIE_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];

const GSTTaxSummary = () => {
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
      const response = await axios.get(createApiUrl('/api/reports/gst-tax-summary'), {
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

  const pieData = reportData?.tax_breakdown.filter(r => r.total_tax > 0).map(r => ({
    name: `GST ${r.tax_rate}`,
    value: r.total_tax
  })) || [];

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            🧾 GST Tax Summary
          </Typography>
        </Box>

        {/* Filters */}
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
                setStartDate(new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0]);
                setEndDate(now.toISOString().split('T')[0]);
              }}>
                Last Quarter
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>Total Taxable Value</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {fmt(reportData.totals.taxable_value)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Total GST Collected</Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {fmt(reportData.totals.total_tax)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>CGST + SGST</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {fmt(reportData.totals.cgst + reportData.totals.sgst)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>IGST</Typography>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {fmt(reportData.totals.igst)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Tax breakdown table */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>GST Rate-wise Summary</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {reportData.tax_breakdown.length === 0 ? (
                    <Typography color="text.secondary">No taxable invoices in this period.</Typography>
                  ) : (
                    <TableContainer sx={{ overflowX: "hidden" }}>
                      <Table sx={{ tableLayout: "fixed" }}>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>GST Rate</strong></TableCell>
                            <TableCell align="right"><strong>Taxable Value</strong></TableCell>
                            <TableCell align="right"><strong>CGST</strong></TableCell>
                            <TableCell align="right"><strong>SGST</strong></TableCell>
                            <TableCell align="right"><strong>IGST</strong></TableCell>
                            <TableCell align="right"><strong>Total Tax</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.tax_breakdown.map((row) => (
                            <TableRow key={row.tax_rate}>
                              <TableCell>
                                <Chip label={`GST ${row.tax_rate}`} size="small" color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">{fmt(row.taxable_value)}</TableCell>
                              <TableCell align="right">{fmt(row.cgst)}</TableCell>
                              <TableCell align="right">{fmt(row.sgst)}</TableCell>
                              <TableCell align="right">{fmt(row.igst)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {fmt(row.total_tax)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ bgcolor: 'grey.100', '& td': { fontWeight: 'bold' } }}>
                            <TableCell>Total</TableCell>
                            <TableCell align="right">{fmt(reportData.totals.taxable_value)}</TableCell>
                            <TableCell align="right">{fmt(reportData.totals.cgst)}</TableCell>
                            <TableCell align="right">{fmt(reportData.totals.sgst)}</TableCell>
                            <TableCell align="right">{fmt(reportData.totals.igst)}</TableCell>
                            <TableCell align="right">{fmt(reportData.totals.total_tax)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>

              {/* Pie chart */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Tax by Rate</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(v) => fmt(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                      No tax data
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Period:</strong> {reportData.period.start_date} — {reportData.period.end_date}
                &nbsp;|&nbsp; <strong>Invoices:</strong> {reportData.totals.invoice_count}
              </Typography>
            </Box>
          </>
        ) : null}
      </Container>
    </MainLayout>
  );
};

export default GSTTaxSummary;
