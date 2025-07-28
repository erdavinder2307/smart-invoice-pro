import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
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
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
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
        backgroundColor: '#1976d2',
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Modern Dashboard Header */}
        <Box sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid #e5e7eb',
          px: { xs: 2, md: 4 }, 
          py: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                Dashboard Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's what's happening with your business today.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="large" sx={{ bgcolor: '#f3f4f6', '&:hover': { bgcolor: '#e5e7eb' } }}>
                <Notifications />
              </IconButton>
              <Avatar 
                src="https://i.pravatar.cc/40" 
                alt="user avatar" 
                sx={{ width: 48, height: 48, border: '2px solid #e5e7eb' }} 
              />
            </Box>
          </Box>
          <DashboardHeader />
        </Box>

        {/* Dashboard Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", overflowY: "auto" }}>
          <Grid container spacing={3}>
            {/* Key Metrics Cards */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)'
                      }
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <People sx={{ fontSize: 32 }} />
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h3" fontWeight={700} gutterBottom>
                        {summaryLoading ? <CircularProgress size={24} color="inherit" /> : 
                         summaryError ? '-' : 
                         summary?.total_customers ?? '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Customers
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        +12% from last month
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)'
                      }
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Inventory sx={{ fontSize: 32 }} />
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h3" fontWeight={700} gutterBottom>
                        {summaryLoading ? <CircularProgress size={24} color="inherit" /> : 
                         summaryError ? '-' : 
                         summary?.total_products ?? '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Products
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        +8% from last month
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)'
                      }
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Receipt sx={{ fontSize: 32 }} />
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h3" fontWeight={700} gutterBottom>
                        {summaryLoading ? <CircularProgress size={24} color="inherit" /> : 
                         summaryError ? '-' : 
                         summary?.total_invoices ?? '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Invoices
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        +15% from last month
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)'
                      }
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <AttachMoney sx={{ fontSize: 32 }} />
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h3" fontWeight={700} gutterBottom>
                        {summaryLoading ? <CircularProgress size={24} color="inherit" /> : 
                         summaryError ? '-' : 
                         summary?.total_revenue ?? '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Revenue
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        +18% from last month
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
                  p: 3, 
                  borderRadius: 3, 
                  border: '1px solid #e5e7eb',
                  minHeight: 400,
                  background: 'white'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : revenueError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>{revenueError}</Alert>
                ) : (
                  revenueChartData ? (
                    <Box sx={{ height: 300 }}>
                      <Bar data={revenueChartData} options={revenueChartOptions} />
                    </Box>
                  ) : (
                    <Typography color="text.secondary" align="center" sx={{ py: 8 }}>
                      No revenue data available
                    </Typography>
                  )
                )}
              </Paper>
            </Grid>

            {/* Right Sidebar - Quick Actions & Alerts */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      border: '1px solid #e5e7eb',
                      background: 'white'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Add />}
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
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
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
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
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
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
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
                      p: 3, 
                      borderRadius: 3, 
                      border: '1px solid #fecaca',
                      background: '#fef2f2'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Warning sx={{ color: '#dc2626', mr: 1 }} />
                      <Typography variant="h6" fontWeight={600} color="#dc2626">
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
                                py: 1,
                                borderBottom: idx < lowStock.slice(0, 3).length - 1 ? '1px solid #fecaca' : 'none'
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
                            <Button size="small" sx={{ mt: 1 }}>
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
      </Box>
    </Box>
  );
};

export default DashboardPage;
