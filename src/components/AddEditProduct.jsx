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
  Divider,
  InputAdornment,
  Avatar,
  Chip,
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
} from "@mui/icons-material";
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
          <Paper 
            elevation={0} 
            className="add-edit-product-card"
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(102,126,234,0.08)',
              boxShadow: '0 8px 32px rgba(102,126,234,0.12)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          >
            {/* Header Section */}
            <Box sx={{ p: 4, pb: 2 }}>
              <Box display="flex" alignItems="center" gap={3} mb={2}>
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
                  }}
                >
                  <InventoryIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h4" 
                    className="add-edit-product-title"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    {productId ? "Edit Product" : "Add New Product"}
                  </Typography>
                  <Chip 
                    label={productId ? "Update Mode" : "Create Mode"} 
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
              <Divider sx={{ mt: 3, borderColor: 'rgba(102,126,234,0.1)' }} />
            </Box>
            
            {error && (
              <Box sx={{ px: 4 }}>
                <Alert 
                  severity="error" 
                  className="add-edit-product-alert"
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'error.200',
                    bgcolor: 'error.50',
                    '& .MuiAlert-icon': {
                      color: 'error.main'
                    }
                  }}
                >
                  {error}
                </Alert>
              </Box>
            )}
            
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              autoComplete="off" 
              className="add-edit-product-form"
              sx={{ p: 4, pt: 2 }}
            >
              <Grid container spacing={4} className="add-edit-product-grid">
                <Grid item xs={12} sm={6}>
                  <Box 
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      height: 'fit-content'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 40, height: 40 }}>
                        <InventoryIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Product Information
                      </Typography>
                    </Box>
                    
                    <div className="invoice-form-row">
                      <TextField
                        label="Product Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        className="add-edit-product-field"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <InventoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: 'grey.50',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                      <FormControl 
                        fullWidth 
                        margin="normal" 
                        required 
                        className="add-edit-product-field"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: 'grey.50',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      >
                        <InputLabel>Category</InputLabel>
                        <Select
                          label="Category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon color="action" />
                            </InputAdornment>
                          }
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
                    </div>
                    
                    <div className="invoice-form-row">
                      <TextField
                        label="Price per Unit"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                        className="add-edit-product-field"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: 'grey.50',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                      <FormControl 
                        fullWidth 
                        margin="normal" 
                        required 
                        className="add-edit-product-field"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: 'grey.50',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      >
                        <InputLabel>Unit of Measurement</InputLabel>
                        <Select
                          label="Unit"
                          name="unit"
                          value={form.unit}
                          onChange={handleChange}
                          startAdornment={
                            <InputAdornment position="start">
                              <ScaleIcon color="action" />
                            </InputAdornment>
                          }
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PercentIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: 'grey.50',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                      {productId && (
                        <TextField
                          label="Available Stock"
                          name="stock"
                          value={typeof form.stock === 'number' ? form.stock : 'Not Available'}
                          fullWidth
                          margin="normal"
                          InputProps={{ 
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <InventoryIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          className="add-edit-product-field"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: 'grey.100',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'grey.300',
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box 
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'success.50',
                      border: '1px solid',
                      borderColor: 'success.200',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Avatar sx={{ bgcolor: 'success.100', color: 'success.main', width: 40, height: 40 }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Description & Details
                      </Typography>
                    </Box>
                    
                    <TextField
                      label="Product Description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      minRows={8}
                      className="add-edit-product-field"
                      placeholder="Enter detailed product description, features, specifications..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: 'grey.50',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'success.main',
                            }
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                            boxShadow: '0 0 0 3px rgba(76,175,80,0.1)'
                          }
                        }
                      }}
                    />
                    
                    {/* Info Tips */}
                    <Box 
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'info.50',
                        border: '1px solid',
                        borderColor: 'info.200'
                      }}
                    >
                      <Typography variant="body2" color="info.main" fontWeight={600} gutterBottom>
                        💡 Product Tips
                      </Typography>
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
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 3, borderColor: 'rgba(102,126,234,0.1)' }} />
                  <Box className="add-edit-product-actions">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      className="add-edit-product-btn add-edit-product-btn-primary"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          boxShadow: '0 12px 32px rgba(102,126,234,0.4)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: 'grey.300',
                          transform: 'none',
                          boxShadow: 'none'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {productId ? "Update Product" : "Add Product"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={() => { if (onCancel) onCancel(); navigate("/products"); }}
                      className="add-edit-product-btn add-edit-product-btn-cancel"
                      startIcon={<CancelIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderColor: 'grey.300',
                        color: 'text.secondary',
                        '&:hover': {
                          borderColor: 'grey.400',
                          bgcolor: 'grey.50',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
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
