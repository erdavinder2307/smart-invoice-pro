import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import { exportProfitLossPDF, exportProfitLossExcel } from '../utils/reportExport';
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ProfitAndLoss = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  
  // Default to current year
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr).id : null;

  const fetchReport = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(createApiUrl('/api/reports/profit-loss'), {
        params: {
          user_id: userId,
          start_date: startDate,
          end_date: endDate
        }
      });

      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report');
      console.error('Error fetching profit & loss report:', err);
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
    if (reportData) exportProfitLossPDF(reportData, startDate, endDate);
    setExportAnchor(null);
  };
  const handleExportExcel = () => {
    if (reportData) exportProfitLossExcel(reportData, startDate, endDate);
    setExportAnchor(null);
  };

  const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];

  // Prepare data for charts
  const summaryData = reportData ? [
    { name: 'Revenue', value: reportData.revenue.total, color: '#4CAF50' },
    { name: 'COGS', value: reportData.cost_of_goods_sold.total, color: '#FF9800' },
    { name: 'Expenses', value: reportData.expenses.total, color: '#F44336' },
    { name: 'Net Profit', value: reportData.net_profit, color: reportData.net_profit > 0 ? '#2196F3' : '#F44336' }
  ] : [];

  const expensesByCategory = reportData ? Object.entries(reportData.expenses.by_category).map(([name, value]) => ({
    name,
    value: Math.abs(value)
  })) : [];

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            📊 Profit & Loss Statement
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
                onClick={() => {
                  setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
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
                <Card sx={{ bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ${reportData.revenue.total.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reportData.revenue.invoice_count} invoices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: 'warning.50', borderLeft: 4, borderColor: 'warning.main' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Cost of Goods Sold
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      ${reportData.cost_of_goods_sold.total.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reportData.cost_of_goods_sold.bill_count} bills
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: 'error.50', borderLeft: 4, borderColor: 'error.main' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Operating Expenses
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      ${reportData.expenses.total.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reportData.expenses.expense_count} expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{
                  bgcolor: reportData.net_profit > 0 ? 'info.50' : 'error.50',
                  borderLeft: 4,
                  borderColor: reportData.net_profit > 0 ? 'info.main' : 'error.main'
                }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Net Profit
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={reportData.net_profit > 0 ? 'info.main' : 'error.main'}
                      >
                        ${Math.abs(reportData.net_profit).toLocaleString()}
                      </Typography>
                      {reportData.net_profit > 0 ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {reportData.net_margin.toFixed(2)}% margin
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Financial Overview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={summaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {summaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Expenses by Category
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                      <Typography color="text.secondary">No expense data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Detailed Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Statement
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer sx={{ overflowX: "hidden" }}>
                <Table sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Account</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ bgcolor: 'success.50' }}>
                      <TableCell><strong>Revenue</strong></TableCell>
                      <TableCell align="right"><strong>${reportData.revenue.total.toLocaleString()}</strong></TableCell>
                    </TableRow>
                    {Object.entries(reportData.revenue.by_category).map(([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell sx={{ pl: 4 }}>{category}</TableCell>
                        <TableCell align="right">${amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}

                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Cost of Goods Sold</strong></TableCell>
                      <TableCell align="right"><strong>-${reportData.cost_of_goods_sold.total.toLocaleString()}</strong></TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: 'info.50' }}>
                      <TableCell><strong>Gross Profit</strong></TableCell>
                      <TableCell align="right"><strong>${reportData.gross_profit.toLocaleString()}</strong></TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Operating Expenses</strong></TableCell>
                      <TableCell align="right"><strong>-${reportData.expenses.total.toLocaleString()}</strong></TableCell>
                    </TableRow>
                    {Object.entries(reportData.expenses.by_category).map(([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell sx={{ pl: 4 }}>{category}</TableCell>
                        <TableCell align="right">-${amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}

                    <TableRow sx={{
                      bgcolor: reportData.net_profit > 0 ? 'success.100' : 'error.100',
                      '& td': { fontWeight: 'bold', fontSize: '1.1rem' }
                    }}>
                      <TableCell>Net Profit</TableCell>
                      <TableCell align="right">
                        ${reportData.net_profit.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Report Period:</strong> {reportData.period.start_date} to {reportData.period.end_date}
                </Typography>
              </Box>
            </Paper>
          </>
        ) : null}
      </Container>
    </MainLayout>
  );
};

export default ProfitAndLoss;
