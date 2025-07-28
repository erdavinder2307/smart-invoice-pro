import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Button,
  IconButton,
  LinearProgress
} from "@mui/material";
import {
  Inventory,
  TrendingDown,
  TrendingUp,
  MoreVert,
  Refresh
} from "@mui/icons-material";

const ProductStockSummary = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    setError("");
    axios.get(createApiUrl("/api/products/stock-summary"))
      .then(res => setProducts(res.data))
      .catch(() => setError("Failed to fetch product stock summary"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStockStatus = (stock) => {
    if (stock < 5) return { status: 'critical', color: 'error', label: 'Critical' };
    if (stock < 10) return { status: 'low', color: 'warning', label: 'Low Stock' };
    if (stock < 50) return { status: 'moderate', color: 'info', label: 'Moderate' };
    return { status: 'good', color: 'success', label: 'Good Stock' };
  };

  const lowStockCount = products.filter(p => p.stock < 10).length;
  const criticalStockCount = products.filter(p => p.stock < 5).length;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        border: '1px solid #e5e7eb',
        background: 'white',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Inventory sx={{ color: '#3b82f6', mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Inventory Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time stock levels and alerts
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={fetchData} 
              size="small"
              sx={{ 
                bgcolor: 'white',
                border: '1px solid #d1d5db',
                '&:hover': { bgcolor: '#f3f4f6' }
              }}
            >
              <Refresh />
            </IconButton>
            <IconButton 
              size="small"
              sx={{ 
                bgcolor: 'white',
                border: '1px solid #d1d5db',
                '&:hover': { bgcolor: '#f3f4f6' }
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Stock Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Inventory />}
            label={`${products.length} Total Products`}
            variant="outlined"
            sx={{ 
              bgcolor: 'white',
              borderColor: '#d1d5db',
              fontWeight: 600
            }}
          />
          {criticalStockCount > 0 && (
            <Chip
              icon={<TrendingDown />}
              label={`${criticalStockCount} Critical Stock`}
              color="error"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
          {lowStockCount > 0 && (
            <Chip
              icon={<TrendingDown />}
              label={`${lowStockCount} Low Stock`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 700, 
                bgcolor: '#f8fafc', 
                borderBottom: '2px solid #e5e7eb',
                color: '#374151'
              }}>
                Product Details
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 700, 
                bgcolor: '#f8fafc', 
                borderBottom: '2px solid #e5e7eb',
                color: '#374151'
              }}>
                Current Stock
              </TableCell>
              <TableCell align="center" sx={{ 
                fontWeight: 700, 
                bgcolor: '#f8fafc', 
                borderBottom: '2px solid #e5e7eb',
                color: '#374151'
              }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={32} />
                    <Typography color="text.secondary">Loading inventory data...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                  <Alert 
                    severity="error" 
                    sx={{ maxWidth: 400, mx: 'auto' }}
                    action={
                      <Button size="small" onClick={fetchData}>
                        Retry
                      </Button>
                    }
                  >
                    {error}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Inventory sx={{ fontSize: 48, color: '#9ca3af' }} />
                    <Typography color="text.secondary" variant="h6">
                      No products found
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Add some products to see inventory data
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => {
                const stockInfo = getStockStatus(product.stock);
                return (
                  <TableRow 
                    key={product.id || product.sku || index}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: '#f8fafc' },
                      bgcolor: stockInfo.status === 'critical' ? '#fef2f2' : 
                               stockInfo.status === 'low' ? '#fffbeb' : 'inherit'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600} color="text.primary">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SKU: {product.sku || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        color={stockInfo.status === 'critical' ? 'error.main' : 
                               stockInfo.status === 'low' ? 'warning.main' : 'text.primary'}
                      >
                        {product.stock}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Chip
                        label={stockInfo.label}
                        color={stockInfo.color}
                        size="small"
                        variant={stockInfo.status === 'good' ? 'outlined' : 'filled'}
                        icon={
                          stockInfo.status === 'good' ? <TrendingUp /> : <TrendingDown />
                        }
                        sx={{ 
                          fontWeight: 600,
                          minWidth: 100
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      {!loading && !error && products.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #e5e7eb',
          bgcolor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {products.length} products
          </Typography>
          <Button 
            size="small" 
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            View All Products
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ProductStockSummary;
