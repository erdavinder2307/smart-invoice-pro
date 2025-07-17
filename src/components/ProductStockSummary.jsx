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
  Chip
} from "@mui/material";

const ProductStockSummary = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(createApiUrl("/api/products/stock-summary"))
      .then(res => setProducts(res.data))
      .catch(() => setError("Failed to fetch product stock summary"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Paper elevation={2} sx={{ borderRadius: 3, p: 2, bgcolor: '#f9f9f9', mt: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Product Stock Summary
        </Typography>
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#e3f2fd' }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography color="text.secondary">No products found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id || p.sku || p.name} hover sx={{ bgcolor: p.stock < 10 ? '#fff8e1' : 'inherit' }}>
                  <TableCell>
                    <Typography fontWeight={500}>{p.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="text.secondary">{p.sku}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography fontWeight={p.stock < 10 ? 700 : 400} color={p.stock < 10 ? 'error.main' : 'text.primary'}>
                        {p.stock}
                      </Typography>
                      {typeof p.stock === 'number' && p.stock < 10 && (
                        <Chip label="Low Stock" color="error" size="small" sx={{ ml: 1, fontWeight: 700 }} />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProductStockSummary;
