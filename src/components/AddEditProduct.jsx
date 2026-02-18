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
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  Avatar,
  Chip,
  Fade,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Scale as ScaleIcon,
  Percent as PercentIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TipsAndUpdates as TipsIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";

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
    <MainLayout title={productId ? "Edit Product" : "Create New Product"} subtitle={productId ? "Update product details below" : "Add a new product to your inventory"}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Main Content Card */}
        <Card elevation={0} sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1,
          maxWidth: 1000,
          mx: 'auto'
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }}>
                  <InventoryIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                    {productId ? "Edit Product" : "Create New Product"}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" color="text.secondary">
                      {productId ? "Update product details below" : "Add a new product to your inventory"}
                    </Typography>
                    <Chip
                      label={productId ? "Edit Mode" : "Create Mode"}
                      size="small"
                      sx={{
                        bgcolor: productId ? 'warning.50' : 'success.50',
                        color: productId ? 'warning.700' : 'success.700',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            {error && (
              <Fade in={!!error}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': { fontSize: 24 }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={3}>
                {/* Product Information Section */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon color="primary" />
                        Product Information
                      </Typography>

                      <TextField
                        label="Product Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <InventoryIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          label="Category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon fontSize="small" color="action" />
                            </InputAdornment>
                          }
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(79,172,254,0.1)'
                            }
                          }}
                        >
                          {categoryOptions.map((c) => (
                            <MenuItem key={c} value={c}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CategoryIcon fontSize="small" />
                                {c}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Price per Unit"
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoneyIcon fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                '&:hover': { bgcolor: 'grey.100' },
                                '&.Mui-focused': {
                                  bgcolor: 'white',
                                  boxShadow: '0 0 0 3px rgba(79,172,254,0.1)'
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Unit</InputLabel>
                            <Select
                              label="Unit"
                              name="unit"
                              value={form.unit}
                              onChange={handleChange}
                              required
                              startAdornment={
                                <InputAdornment position="start">
                                  <ScaleIcon fontSize="small" color="action" />
                                </InputAdornment>
                              }
                              sx={{
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                '&.Mui-focused': {
                                  boxShadow: '0 0 0 3px rgba(79,172,254,0.1)'
                                }
                              }}
                            >
                              {unitOptions.map((u) => (
                                <MenuItem key={u} value={u}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <ScaleIcon fontSize="small" />
                                    {u}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <TextField
                        label="Tax Rate (%)"
                        name="tax_rate"
                        type="number"
                        value={form.tax_rate}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        sx={{ mt: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PercentIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        helperText="GST/tax rate as per applicable regulations"
                      />

                      {productId && (
                        <TextField
                          label="Available Stock"
                          name="stock"
                          value={typeof form.stock === 'number' ? form.stock : 'Not Available'}
                          fullWidth
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <InventoryIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mt: 3,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'info.50',
                              '&.Mui-focused': {
                                boxShadow: '0 0 0 3px rgba(13,110,253,0.1)'
                              }
                            }
                          }}
                          helperText="Use Stock Adjustment to update inventory"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Description & Tips Section */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', height: '100%' }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon color="primary" />
                        Description & Details
                      </Typography>

                      <TextField
                        label="Product Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={8}
                        placeholder="Enter detailed product description, features, specifications..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                              <DescriptionIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(79,172,254,0.1)'
                            }
                          }
                        }}
                      />

                      {/* Tips Section */}
                      <Box
                        sx={{
                          mt: 'auto',
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: 'info.50',
                          border: '1px solid',
                          borderColor: 'info.200'
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                          <TipsIcon color="info" fontSize="small" />
                          <Typography variant="body2" color="info.main" fontWeight={600}>
                            Product Tips
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          • Use descriptive names for easy identification
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          • Select appropriate category for better organization
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          • Include GST/tax rates as per regulations
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box display="flex" justifyContent="flex-end" gap={2} pt={3} mt={2} borderTop="1px solid" borderColor="grey.200">
                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  startIcon={<CancelIcon />}
                  onClick={() => { if (onCancel) onCancel(); navigate("/products"); }}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    boxShadow: '0 8px 24px rgba(79,172,254,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3b9cef 0%, #00d9e6 100%)',
                      boxShadow: '0 12px 32px rgba(79,172,254,0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {productId ? "Update" : "Create"} Product
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default AddEditProduct;
