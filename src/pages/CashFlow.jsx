import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import { exportCashFlowPDF, exportCashFlowExcel } from '../utils/reportExport';
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
  Cell,
  Legend
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const CashFlow = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  
  // Default to current year
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const userId = localStorage.getItem('user_id');

  const fetchReport = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(createApiUrl('/reports/cash-flow'), {
        params: {
          user_id: userId,
          start_date: startDate,
          end_date: endDate
        }
      });

      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report');
      console.error('Error fetching cash flow report:', err);
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
    if (reportData) exportCashFlowPDF(reportData, startDate, endDate);
    setExportAnchor(null);
  };
  const handleExportExcel = () => {
    if (reportData) exportCashFlowExcel(reportData, startDate, endDate);
    setExportAnchor(null);
  };

  const resetDates = () => {
    const currentYear = new Date().getFullYear();
    setStartDate(`${currentYear}-01-01`);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  // Prepare data for chart
  const chartData = reportData ? [
    { name: 'Cash Received', value: reportData.operating_activities.cash_received_from_customers, color: '#4CAF50' },
    { name: 'Expenses Paid', value: -reportData.operating_activities.cash_paid_for_expenses, color: '#F44336' },
    { name: 'Suppliers Paid', value: -reportData.operating_activities.cash_paid_to_suppliers, color: '#FF9800' }
  ] : [];

  const netCashFlow = reportData ? reportData.operating_activities.net_cash_from_operating : 0;
  const isPositive = netCashFlow >= 0;

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            💰 Cash Flow Statement
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

        {/* Date Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={fetchReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={resetDates}
              >
                Reset to Current Year
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
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%', bgcolor: 'success.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" color="success.main">
                        Cash Received
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ${reportData.operating_activities.cash_received_from_customers.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%', bgcolor: 'error.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" color="error.main">
                        Expenses Paid
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      ${reportData.operating_activities.cash_paid_for_expenses.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%', bgcolor: 'warning.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingDownIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" color="warning.main">
                        Suppliers Paid
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      ${reportData.operating_activities.cash_paid_to_suppliers.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%', bgcolor: isPositive ? 'primary.50' : 'grey.100' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {isPositive ? (
                        <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                      ) : (
                        <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="subtitle1" color={isPositive ? 'primary.main' : 'error.main'}>
                        Net Cash Flow
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color={isPositive ? 'primary.main' : 'error.main'}>
                      ${Math.abs(netCashFlow).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Cash Flow Chart */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cash Flow Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `$${Math.abs(value).toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Amount">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Operating Activities Detail */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cash Flow from Operating Activities
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Activity</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Cash Received from Customers</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        ${reportData.operating_activities.cash_received_from_customers.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Cash Paid for Operating Expenses</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        ($${reportData.operating_activities.cash_paid_for_expenses.toLocaleString()})
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Cash Paid to Suppliers</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        ($${reportData.operating_activities.cash_paid_to_suppliers.toLocaleString()})
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: isPositive ? 'success.50' : 'error.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Net Cash from Operating Activities
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: isPositive ? 'success.main' : 'error.main' }}>
                        {isPositive ? '$' : '($'}
                        {Math.abs(netCashFlow).toLocaleString()}
                        {!isPositive && ')'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Cash Flow Insights */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                💡 Cash Flow Insights
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Cash Inflow
                    </Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      ${reportData.operating_activities.cash_received_from_customers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Revenue collected from customers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Cash Outflow
                    </Typography>
                    <Typography variant="h5" color="error.main" fontWeight="bold">
                      ${(
                        reportData.operating_activities.cash_paid_for_expenses +
                        reportData.operating_activities.cash_paid_to_suppliers
                      ).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Expenses and supplier payments
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {netCashFlow < 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>Negative Cash Flow:</strong> Your business is spending more cash than it's bringing in during this period. 
                  Consider reviewing expenses and accelerating customer payments.
                </Alert>
              )}

              {netCashFlow > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <strong>Positive Cash Flow:</strong> Great! Your business generated positive cash flow during this period. 
                  This indicates healthy operations.
                </Alert>
              )}
            </Paper>

            {/* Report Period Footer */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Report Period:</strong> {reportData.start_date} to {reportData.end_date}
              </Typography>
            </Box>
          </>
        ) : null}
      </Container>
    </MainLayout>
  );
};

export default CashFlow;
