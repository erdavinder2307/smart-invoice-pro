import React, { useEffect, useState } from "react";
import axios from "axios";
import { createProduct, updateProduct } from "../services/productService";
import { createApiUrl } from "../config/api";
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
import './AddEditProduct.css';

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
      axios.get(createApiUrl(`/api/products/${productId}`))
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
    <Box className="add-edit-product-root">
      <Header />
      <Box className="add-edit-product-main">
        <Sidebar />
        <Box className="add-edit-product-content">
          <Paper elevation={3} className="add-edit-product-card">
            <Typography variant="h5" className="add-edit-product-title">
              {productId ? "Edit" : "Add"} Product
            </Typography>
            {error && <Alert severity="error" className="add-edit-product-alert">{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} autoComplete="off" className="add-edit-product-form">
              <Grid container spacing={3} className="add-edit-product-grid">
                <Grid item xs={12} sm={6}>
                  <div className="invoice-form-row">
                    <TextField
                      label="Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      required
                      className="add-edit-product-field"
                    />
                    <FormControl fullWidth margin="normal" required className="add-edit-product-field">
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
                  </div>
                  <div className="invoice-form-row">
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
                      className="add-edit-product-field"
                    />
                    <FormControl fullWidth margin="normal" required className="add-edit-product-field">
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
                  </div>
                  <div className="invoice-form-row">
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
                      className="add-edit-product-field"
                    />
                    {productId && (
                      <TextField
                        label="Available Qty"
                        name="stock"
                        value={typeof form.stock === 'number' ? form.stock : '-'}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                        className="add-edit-product-field"
                      />
                    )}
                  </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={6}
                    className="add-edit-product-field"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box className="add-edit-product-actions">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      className="add-edit-product-btn add-edit-product-btn-primary"
                      startIcon={loading && <CircularProgress size={18} color="inherit" />}
                    >
                      {productId ? "Update" : "Add"} Product
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={() => { if (onCancel) onCancel(); navigate("/products"); }}
                      className="add-edit-product-btn add-edit-product-btn-cancel"
                    >
                      Cancel
                    </Button>
                  </Box>
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
