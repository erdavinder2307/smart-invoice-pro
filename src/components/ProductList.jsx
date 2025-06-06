import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/productService";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleAdd = () => {
    navigate("/products/add");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      fetchProducts();
      setConfirmDeleteId(null);
    } catch (err) {
      setError("Failed to delete product");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, bgcolor: '#f5f6fa', minHeight: 'calc(100vh - 128px)', p: 3 }}>
          <Paper elevation={2} sx={{ width: '95%', mx: 0, p: 4, mb: 4, borderRadius: 3, overflow: 'visible' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Products
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                sx={{ fontWeight: 600 }}
              >
                + Add Product
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer sx={{ maxWidth: '100%', overflowX: { xs: 'auto', md: 'visible' } }}>
              <Table sx={{ minWidth: 650, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Tax Rate (%)</TableCell>
                    <TableCell>Available Qty</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.price}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>{p.tax_rate}</TableCell>
                      <TableCell>{typeof p.stock === 'number' ? p.stock : '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleEdit(p)} title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => setConfirmDeleteId(p.id)} title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 6 }}>
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                  <CircularProgress />
                </Box>
              )}
            </TableContainer>
          </Paper>
        </Box>
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs">
          <DialogTitle>Delete Product</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this product?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteId(null)} color="secondary" variant="outlined">Cancel</Button>
            <Button onClick={() => handleDelete(confirmDeleteId)} color="error" variant="contained" disabled={loading}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Footer />
    </Box>
  );
};

export default ProductList;
