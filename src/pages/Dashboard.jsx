import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import LinearProgress from "@mui/material/LinearProgress";
import { useTheme } from "@mui/material/styles";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController
} from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  People,
  Inventory,
  Receipt,
  AttachMoney,
  Warning,
  Add,
  Notifications,
  MoreVert
} from "@mui/icons-material";
import axios from "axios";
import { createApiUrl } from "../config/api";
import ProductStockSummary from "../components/ProductStockSummary";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement, LineController);

const DashboardPage = () => {
  const theme = useTheme();
  // Summary
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  // Low stock
  const [lowStock, setLowStock] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [lowStockError, setLowStockError] = useState("");
  // Revenue
  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState("");

  useEffect(() => {
    setSummaryLoading(true);
    axios.get(createApiUrl("/api/dashboard/summary"))
      .then(res => setSummary(res.data))
      .catch(() => setSummaryError("Failed to load summary"))
      .finally(() => setSummaryLoading(false));
    setLowStockLoading(true);
    axios.get(createApiUrl("/api/dashboard/low-stock"))
      .then(res => setLowStock(res.data))
      .catch(() => setLowStockError("Failed to load low stock items"))
      .finally(() => setLowStockLoading(false));
    setRevenueLoading(true);
    axios.get(createApiUrl("/api/dashboard/monthly-revenue"))
      .then(res => setRevenue(res.data))
      .catch(() => setRevenueError("Failed to load revenue chart"))
      .finally(() => setRevenueLoading(false));
  }, []);

  // Chart data
  const revenueChartData = revenue ? {
    labels: revenue.months,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: revenue.values,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 6,
      },
    ],
  } : null;

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <MainLayout
      title="Dashboard Overview"
      subtitle="Welcome back! Here's what's happening with your business today."
      showDashboardHeader={true}
    >
      <Box sx={{ flex: 1, p: { xs: 1.5, md: 2.5 }, bgcolor: "grey.50", overflowY: "auto" }}>
        <Grid container spacing={2}>
          {/* Key Metrics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${theme.palette.primary.main}30`,
                      '& .metric-icon': {
                        transform: 'scale(1.1)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      transform: 'translate(40px, -40px)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)'
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box
                        className="metric-icon"
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.15)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <People sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        px: 0.8,
                        py: 0.3
                      }}>
                        <TrendingUp sx={{ fontSize: 14, color: 'white', mr: 0.3 }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
                          +12%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      gutterBottom
                      sx={{
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        lineHeight: 1.1,
                        mb: 0.5
                      }}
                    >
                      {summaryLoading ? <CircularProgress size={20} color="inherit" /> :
                        summaryError ? '-' :
                          summary?.total_customers ?? '-'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 600,
                        mb: 0.3
                      }}
                    >
                      Total Customers
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.7rem'
                      }}
                    >
                      from last month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${theme.palette.secondary.main}30`,
                      '& .metric-icon': {
                        transform: 'scale(1.1)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      transform: 'translate(40px, -40px)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)'
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box
                        className="metric-icon"
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.15)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <Inventory sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        px: 0.8,
                        py: 0.3
                      }}>
                        <TrendingUp sx={{ fontSize: 14, color: 'white', mr: 0.3 }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
                          +8%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      gutterBottom
                      sx={{
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        lineHeight: 1.1,
                        mb: 0.5
                      }}
                    >
                      {summaryLoading ? <CircularProgress size={20} color="inherit" /> :
                        summaryError ? '-' :
                          summary?.total_products ?? '-'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 600,
                        mb: 0.3
                      }}
                    >
                      Total Products
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.7rem'
                      }}
                    >
                      from last month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${theme.palette.info.main}30`,
                      '& .metric-icon': {
                        transform: 'scale(1.1)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      transform: 'translate(40px, -40px)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)'
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box
                        className="metric-icon"
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.15)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <Receipt sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        px: 0.8,
                        py: 0.3
                      }}>
                        <TrendingUp sx={{ fontSize: 14, color: 'white', mr: 0.3 }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
                          +15%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      gutterBottom
                      sx={{
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        lineHeight: 1.1,
                        mb: 0.5
                      }}
                    >
                      {summaryLoading ? <CircularProgress size={20} color="inherit" /> :
                        summaryError ? '-' :
                          summary?.total_invoices ?? '-'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 600,
                        mb: 0.3
                      }}
                    >
                      Total Invoices
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.7rem'
                      }}
                    >
                      from last month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${theme.palette.success.main}30`,
                      '& .metric-icon': {
                        transform: 'scale(1.1)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      transform: 'translate(40px, -40px)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)'
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box
                        className="metric-icon"
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.15)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        px: 0.8,
                        py: 0.3
                      }}>
                        <TrendingUp sx={{ fontSize: 14, color: 'white', mr: 0.3 }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
                          +18%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      gutterBottom
                      sx={{
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        lineHeight: 1.1,
                        mb: 0.5
                      }}
                    >
                      {summaryLoading ? <CircularProgress size={20} color="inherit" /> :
                        summaryError ? '-' :
                          summary?.total_revenue ?? '-'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 600,
                        mb: 0.3
                      }}
                    >
                      Total Revenue
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.7rem'
                      }}
                    >
                      from last month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Charts and Analytics */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.300',
                minHeight: 350,
                background: 'white'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                    Revenue Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly revenue trends and performance
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="This Year" variant="outlined" size="small" />
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>
              {revenueLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : revenueError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{revenueError}</Alert>
              ) : (
                revenueChartData ? (
                  <Box sx={{ height: 250 }}>
                    <Bar data={revenueChartData} options={revenueChartOptions} />
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
                    No revenue data available
                  </Typography>
                )
              )}
            </Paper>
          </Grid>

          {/* Right Sidebar - Quick Actions & Alerts */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Quick Actions */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    background: 'white'
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        sx={{
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        New Invoice
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        sx={{
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Add Customer
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        sx={{
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Add Product
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          background: `linear-gradient(135deg, primary.main 0%, primary.dark 100%)`
                        }}
                      >
                        View Reports
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Low Stock Alert */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'error.light',
                    background: 'error.lighter'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Warning sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600} color="error.main">
                      Stock Alerts
                    </Typography>
                  </Box>
                  {lowStockLoading ? (
                    <CircularProgress size={24} />
                  ) : lowStockError ? (
                    <Alert severity="error">{lowStockError}</Alert>
                  ) : (
                    lowStock.length === 0 ? (
                      <Typography color="text.secondary">
                        All products are in stock ✅
                      </Typography>
                    ) : (
                      <Box>
                        {lowStock.slice(0, 3).map((item, idx) => (
                          <Box
                            key={item.id || idx}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.8,
                              borderBottom: idx < lowStock.slice(0, 3).length - 1 ? '1px solid' : 'none',
                              borderColor: 'error.light'
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Stock: {item.stock}
                              </Typography>
                            </Box>
                            <Chip
                              label="Low"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Box>
                        ))}
                        {lowStock.length > 3 && (
                          <Button size="small" sx={{ mt: 0.5 }}>
                            View All ({lowStock.length - 3} more)
                          </Button>
                        )}
                      </Box>
                    )
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Product Stock Summary Table */}
          <Grid item xs={12}>
            <ProductStockSummary />
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
