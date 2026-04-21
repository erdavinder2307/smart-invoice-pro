import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import { exportBalanceSheetPDF, exportBalanceSheetExcel } from '../utils/reportExport';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const BalanceSheet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

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
      const response = await axios.get(createApiUrl('/api/reports/balance-sheet'), {
        params: {
          user_id: userId,
          as_of_date: asOfDate
        }
      });

      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report');
      console.error('Error fetching balance sheet:', err);
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
    if (reportData) exportBalanceSheetPDF(reportData, asOfDate);
    setExportAnchor(null);
  };
  const handleExportExcel = () => {
    if (reportData) exportBalanceSheetExcel(reportData, asOfDate);
    setExportAnchor(null);
  };

  // Prepare data for asset composition pie chart
  const assetChartData = reportData ? [
    { name: 'Cash', value: reportData.assets.cash, color: '#4CAF50' },
    { name: 'Accounts Receivable', value: reportData.assets.accounts_receivable, color: '#2196F3' },
    { name: 'Inventory', value: reportData.assets.inventory, color: '#FF9800' }
  ].filter(item => item.value > 0) : [];

  const isBalanced = reportData ? 
    Math.abs(reportData.assets.total - (reportData.liabilities.total + reportData.equity.total)) < 0.01 
    : false;

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/reports')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            📊 Balance Sheet
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
            {/* Balance Check Card */}
            <Card sx={{ mb: 3, bgcolor: isBalanced ? 'success.50' : 'error.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isBalanced ? (
                    <>
                      <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 32 }} />
                      <Typography variant="h6" color="success.main">
                        Balance Sheet is Balanced ✓
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ErrorIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
                      <Typography variant="h6" color="error.main">
                        Balance Sheet is Out of Balance
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                  Assets = Liabilities + Equity
                </Typography>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Total Assets
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      ${reportData.assets.total.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'warning.50' }}>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Total Liabilities
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      ${reportData.liabilities.total.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'success.50' }}>
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Total Equity
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      ${reportData.equity.total.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Asset Composition Chart */}
            {assetChartData.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Asset Composition
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {/* Detailed Balance Sheet */}
            <Grid container spacing={3}>
              {/* Assets Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    ASSETS
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer sx={{ overflowX: "hidden" }}>
                    <Table sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Current Assets</strong></TableCell>
                          <TableCell align="right"><strong>Amount</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ pl: 4 }}>Cash</TableCell>
                          <TableCell align="right">
                            ${reportData.assets.cash.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ pl: 4 }}>Accounts Receivable</TableCell>
                          <TableCell align="right">
                            ${reportData.assets.accounts_receivable.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ pl: 4 }}>Inventory</TableCell>
                          <TableCell align="right">
                            ${reportData.assets.inventory.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'primary.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Assets</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${reportData.assets.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Liabilities Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    LIABILITIES
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer sx={{ overflowX: "hidden" }}>
                    <Table sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Current Liabilities</strong></TableCell>
                          <TableCell align="right"><strong>Amount</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ pl: 4 }}>Accounts Payable</TableCell>
                          <TableCell align="right">
                            ${reportData.liabilities.accounts_payable.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'warning.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Liabilities</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${reportData.liabilities.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Equity Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    EQUITY
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer sx={{ overflowX: "hidden" }}>
                    <Table sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Owner's Equity</strong></TableCell>
                          <TableCell align="right"><strong>Amount</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ pl: 4 }}>Retained Earnings</TableCell>
                          <TableCell align="right">
                            ${reportData.equity.retained_earnings.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'success.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Equity</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${reportData.equity.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Accounting Equation */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Accounting Equation
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Chip
                      label={`Assets: $${reportData.assets.total.toLocaleString()}`}
                      color="primary"
                      sx={{ fontSize: '1rem', p: 2 }}
                    />
                    <Typography variant="h6">=</Typography>
                    <Chip
                      label={`Liabilities: $${reportData.liabilities.total.toLocaleString()}`}
                      color="warning"
                      sx={{ fontSize: '1rem', p: 2 }}
                    />
                    <Typography variant="h6">+</Typography>
                    <Chip
                      label={`Equity: $${reportData.equity.total.toLocaleString()}`}
                      color="success"
                      sx={{ fontSize: '1rem', p: 2 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

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

export default BalanceSheet;
