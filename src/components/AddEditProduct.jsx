import React, { useEffect, useState } from "react";
import axios from "axios";
import { createProduct, updateProduct } from "../services/productService";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";

const categoryOptions = ["Electronics", "Grocery", "Clothing", "Stationery", "Other"];
const unitOptions = ["pcs", "kg", "litre", "box", "pack"];

const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  unit: "",
  tax_rate: "",
};

const getRandomProduct = () => {
  const names = ["Laptop", "Rice Bag", "T-Shirt", "Notebook", "Pen Drive", "Coffee Mug", "Desk Lamp", "Backpack"];
  const descs = [
    "High performance laptop.",
    "Premium quality rice.",
    "100% cotton t-shirt.",
    "A4 size ruled notebook.",
    "32GB USB 3.0 pen drive.",
    "Ceramic mug for coffee.",
    "LED desk lamp.",
    "Spacious travel backpack."
  ];
  const categories = categoryOptions;
  const units = unitOptions;
  const idx = Math.floor(Math.random() * names.length);
  return {
    name: names[idx],
    description: descs[idx],
    category: categories[Math.floor(Math.random() * categories.length)],
    price: (Math.random() * 1000 + 10).toFixed(2),
    unit: units[Math.floor(Math.random() * units.length)],
    tax_rate: (Math.random() * 18).toFixed(2),
  };
};

const AddEditProduct = ({ onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = id;
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId) {
      axios.get(`http://127.0.0.1:5000/api/products/${productId}`)
        .then(res => setForm(res.data))
        .catch(() => setError("Failed to fetch product details"));
    } else {
      setForm(getRandomProduct());
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) return "Valid price is required";
    if (!form.unit.trim()) return "Unit is required";
    if (form.tax_rate === "" || isNaN(form.tax_rate) || Number(form.tax_rate) < 0) return "Valid tax rate is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validateForm();
    if (err) return setError(err);
    setLoading(true);
    try {
      if (productId) {
        await updateProduct(productId, form);
      } else {
        await createProduct(form);
      }
      if (onSuccess) onSuccess();
      navigate("/products");
    } catch (err) {
      setError("Failed to save product");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, bgcolor: '#f5f6fa', minHeight: 'calc(100vh - 128px)', p: 3 }}>
          <Paper elevation={3} sx={{ width: '100%', mx: 0, p: 4, mb: 4, borderRadius: 3, overflowX: 'auto' }}>
            <Typography variant="h5" fontWeight={700} mb={2} color="primary.main">
              {productId ? "Edit" : "Add"} Product
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {categoryOptions.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      label="Unit"
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                    >
                      {unitOptions.map((u) => (
                        <MenuItem key={u} value={u}>{u}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Tax Rate (%)"
                    name="tax_rate"
                    type="number"
                    value={form.tax_rate}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                  />
                </Grid>
                {productId && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Available Qty"
                      name="stock"
                      value={typeof form.stock === 'number' ? form.stock : '-'}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ minWidth: 140, mr: 2 }}
                    startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  >
                    {productId ? "Update" : "Add"} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => { if (onCancel) onCancel(); navigate("/products"); }}
                    sx={{ minWidth: 120 }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default AddEditProduct;
