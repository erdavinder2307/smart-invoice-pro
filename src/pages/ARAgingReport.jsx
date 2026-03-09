import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import { exportARAgingPDF, exportARAgingExcel } from '../utils/reportExport';
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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const ARAgingReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const userId = localStorage.getItem('user_id');

  const fetchReport = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(createApiUrl('/reports/aging'), {
        params: {
          user_id: userId,
          as_of_date: asOfDate
        }
      });

      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report');
      console.error('Error fetching A/R aging report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [exportAnchor, setExportAnchor] = useState(null);

  const handleExportPDF = () => {
    if (reportData) exportARAgingPDF(reportData, asOfDate);
    setExportAnchor(null);
  };
  const handleExportExcel = () => {
    if (reportData) exportARAgingExcel(reportData, asOfDate);
    setExportAnchor(null);
  };

  // Prepare data for chart
  const chartData = reportData ? [
    { name: 'Current', value: reportData.aging_buckets.current.total, color: '#4CAF50' },
    { name: '1-30 Days', value: reportData.aging_buckets['1-30'].total, color: '#2196F3' },
    { name: '31-60 Days', value: reportData.aging_buckets['31-60'].total, color: '#FF9800' },
    { name: '61-90 Days', value: reportData.aging_buckets['61-90'].total, color: '#F44336' },
    { name: '90+ Days', value: reportData.aging_buckets['90+'].total, color: '#9C27B0' }
  ] : [];

  const getSeverityColor = (bucket) => {
    switch (bucket) {
      case 'current': return 'success';
      case '1-30': return 'info';
      case '31-60': return 'warning';
      case '61-90': return 'error';
      case '90+': return 'error';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            📅 Accounts Receivable Aging
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            disabled={!reportData}
          >
            Export
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={handleExportPDF}>
              <ListItemIcon><PictureAsPdfIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Export as PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportExcel}>
              <ListItemIcon><TableChartIcon fontSize="small" color="success" /></ListItemIcon>
              <ListItemText>Export as Excel</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Date Filter */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="As of Date"
                type="date"
                fullWidth
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                fullWidth
                onClick={fetchReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setAsOfDate(new Date().toISOString().split('T')[0])}
              >
                Reset to Today
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : reportData ? (
          <>
            {/* Summary Card */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Outstanding
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      ${reportData.total_outstanding.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Across {reportData.total_invoices} unpaid invoice{reportData.total_invoices !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'error.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="error.main">
                        Overdue
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      ${(
                        reportData.aging_buckets['31-60'].total +
                        reportData.aging_buckets['61-90'].total +
                        reportData.aging_buckets['90+'].total
                      ).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Requires immediate attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Aging Chart */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aging Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Aging Summary Table */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aging Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Age Bracket</strong></TableCell>
                      <TableCell align="center"><strong>Count</strong></TableCell>
                      <TableCell align="right"><strong>Total Amount</strong></TableCell>
                      <TableCell align="right"><strong>% of Total</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(reportData.aging_buckets).map(([bucket, data]) => {
                      const percentage = reportData.total_outstanding > 0
                        ? (data.total / reportData.total_outstanding * 100).toFixed(1)
                        : 0;
                      return (
                        <TableRow key={bucket}>
                          <TableCell>
                            <Chip
                              label={bucket === 'current' ? 'Current' : `${bucket} Days`}
                              color={getSeverityColor(bucket)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{data.count}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${data.total.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ bgcolor: 'grey.100', '& td': { fontWeight: 'bold' } }}>
                      <TableCell>Total</TableCell>
                      <TableCell align="center">{reportData.total_invoices}</TableCell>
                      <TableCell align="right">${reportData.total_outstanding.toLocaleString()}</TableCell>
                      <TableCell align="right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Customer Summary */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Customers by Outstanding Balance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Customer</strong></TableCell>
                      <TableCell align="right"><strong>Outstanding Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.customer_summary.slice(0, 10).map((customer) => (
                      <TableRow key={customer.customer_id}>
                        <TableCell>{customer.customer_name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ${customer.total_outstanding.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Detailed Invoices by Bracket */}
            <Typography variant="h6" gutterBottom>
              Detailed Invoice Breakdown
            </Typography>
            {Object.entries(reportData.aging_buckets).map(([bucket, data]) => (
              data.count > 0 && (
                <Accordion key={bucket} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Chip
                        label={bucket === 'current' ? 'Current' : `${bucket} Days`}
                        color={getSeverityColor(bucket)}
                        size="small"
                      />
                      <Typography sx={{ flexGrow: 1 }}>
                        {data.count} invoice{data.count !== 1 ? 's' : ''}
                      </Typography>
                      <Typography fontWeight="bold">
                        ${data.total.toLocaleString()}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Issue Date</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell align="right">Days Overdue</TableCell>
                            <TableCell align="right">Balance Due</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.invoices.map((invoice) => (
                            <TableRow key={invoice.invoice_id}>
                              <TableCell>{invoice.invoice_number}</TableCell>
                              <TableCell>{invoice.customer_name}</TableCell>
                              <TableCell>{invoice.issue_date}</TableCell>
                              <TableCell>{invoice.due_date}</TableCell>
                              <TableCell align="right">
                                {invoice.days_overdue > 0 ? (
                                  <Chip
                                    label={`${invoice.days_overdue} days`}
                                    color="error"
                                    size="small"
                                    icon={<ErrorIcon />}
                                  />
                                ) : (
                                  <Chip label="Not due" color="success" size="small" />
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                ${invoice.balance_due.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              )
            ))}

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Report Date:</strong> {reportData.as_of_date}
              </Typography>
            </Box>
          </>
        ) : null}
      </Container>
    </MainLayout>
  );
};

export default ARAgingReport;
