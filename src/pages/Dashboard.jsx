import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController
} from 'chart.js';
import axios from "axios";
import ProductStockSummary from "../components/ProductStockSummary";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, LineController);

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
    axios.get("http://127.0.0.1:5000/api/dashboard/summary")
      .then(res => setSummary(res.data))
      .catch(() => setSummaryError("Failed to load summary"))
      .finally(() => setSummaryLoading(false));
    setLowStockLoading(true);
    axios.get("http://127.0.0.1:5000/api/dashboard/low-stock")
      .then(res => setLowStock(res.data))
      .catch(() => setLowStockError("Failed to load low stock items"))
      .finally(() => setLowStockLoading(false));
    setRevenueLoading(true);
    axios.get("http://127.0.0.1:5000/api/dashboard/monthly-revenue")
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, width: 0, p: { xs: 2, md: 4 }, bgcolor: "#f9f9f9", overflowY: "auto" }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Total Customers</Typography>
                {summaryLoading ? <CircularProgress size={24} /> : summaryError ? <Alert severity="error">{summaryError}</Alert> : <Typography variant="h4" fontWeight={700}>{summary?.total_customers ?? '-'}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#fff3e0', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Total Products</Typography>
                {summaryLoading ? <CircularProgress size={24} /> : summaryError ? <Alert severity="error">{summaryError}</Alert> : <Typography variant="h4" fontWeight={700}>{summary?.total_products ?? '-'}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#e8f5e9', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Total Invoices</Typography>
                {summaryLoading ? <CircularProgress size={24} /> : summaryError ? <Alert severity="error">{summaryError}</Alert> : <Typography variant="h4" fontWeight={700}>{summary?.total_invoices ?? '-'}</Typography>}
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Alert */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 180 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2} color="error.main">
                Low Stock Alert
              </Typography>
              {lowStockLoading ? <CircularProgress size={24} /> : lowStockError ? <Alert severity="error">{lowStockError}</Alert> : (
                lowStock.length === 0 ? <Typography color="text.secondary">No low stock items.</Typography> :
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {lowStock.slice(0, 5).map((item, idx) => (
                    <li key={item.id || idx} style={{ marginBottom: 8 }}>
                      <Typography variant="body1" fontWeight={500}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Stock: {item.stock}</Typography>
                    </li>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Revenue Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 180 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2} color="primary.main">
                Monthly Revenue
              </Typography>
              {revenueLoading ? <CircularProgress size={24} /> : revenueError ? <Alert severity="error">{revenueError}</Alert> : (
                revenueChartData ? <Bar data={revenueChartData} options={revenueChartOptions} height={180} /> : <Typography color="text.secondary">No revenue data.</Typography>
              )}
            </Paper>
          </Grid>
          {/* Product Stock Summary Table */}
          <Grid item xs={12}>
            <ProductStockSummary />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
