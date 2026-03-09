import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/productService";
import MainLayout from "./Layout/MainLayout";
import SectionHeader from "./common/SectionHeader";
import StandardDataTable from "./common/StandardDataTable";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  InputAdornment,
  TextField,
  Fade,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  // Helper function to get available quantity - defined before use
  const getAvailableQuantity = (product) => {
    return typeof product.stock === 'number' ? product.stock :
      (typeof product.opening_stock === 'number' && typeof product.sold === 'number' ?
        (product.opening_stock - product.sold) : 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    
    // Apply stock filter
    const availableQty = getAvailableQuantity(product);
    const reorderLevel = product.reorder_level || 10;
    let matchesStock = true;
    
    if (stockFilter === "Low Stock") {
      matchesStock = availableQty > 0 && availableQty <= reorderLevel;
    } else if (stockFilter === "Out of Stock") {
      matchesStock = availableQty <= 0;
    } else if (stockFilter === "In Stock") {
      matchesStock = availableQty > reorderLevel;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const getStockStatus = (stock, openingStock, sold) => {
    const availableQty = typeof stock === 'number' ? stock :
      (typeof openingStock === 'number' && typeof sold === 'number' ? (openingStock - sold) : 0);

    if (availableQty <= 0) return { status: 'Out of Stock', color: 'error', icon: <WarningIcon fontSize="small" /> };
    if (availableQty <= 10) return { status: 'Low Stock', color: 'warning', icon: <WarningIcon fontSize="small" /> };
    return { status: 'In Stock', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
  };

  const handleActionMenuOpen = (event, product) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedProduct(null);
  };

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

  const handleRestock = async (product) => {
    if (!product.preferred_vendor_id) {
      setError(`Cannot restock ${product.name}: No preferred vendor set`);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(createApiUrl(`/api/products/${product.id}/restock`));
      setError("");
      alert(`Purchase Order ${response.data.po_number} created successfully for ${product.name}`);
      // Optionally navigate to the PO page
      // navigate(`/purchase-orders/edit/${response.data.po_id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create restock PO");
    }
    setLoading(false);
    handleActionMenuClose();
  };


  return (
    <MainLayout title="Product Inventory" subtitle="Manage your product catalog and inventory">
      <Box sx={{ maxWidth: '100%' }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102,126,234,0.4)'
              }
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                <InventoryIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {products.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(67,233,123,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(67,233,123,0.4)'
              }
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {products.filter(p => {
                    const qty = getAvailableQuantity(p);
                    return qty > 10;
                  }).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  In Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(240,147,251,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(240,147,251,0.4)'
              }
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                <WarningIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {products.filter(p => {
                    const qty = getAvailableQuantity(p);
                    return qty <= 10 && qty > 0;
                  }).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Low Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(79,172,254,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(79,172,254,0.4)'
              }
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                <CategoryIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {categories.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Card */}
        <Card elevation={0} sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <CardContent sx={{ p: 4 }}>
            <SectionHeader
              title="Product Inventory"
              subtitle="Manage your product catalog and inventory"
              primaryAction={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                >
                  Add New Product
                </Button>
              }
              sx={{ mb: 4 }}
            />

            {/* Search and Filters */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search products by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  label="Filter by Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  label="Filter by Stock"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WarningIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                >
                  <option value="All">All Stock Levels</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </TextField>
              </Grid>
            </Grid>

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

            <StandardDataTable
              columns={[
                { id: 'product', label: 'Product Info' },
                { id: 'category', label: 'Category' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'stock', label: 'Stock Status' },
                { id: 'actions', label: 'Actions', align: 'center', width: 120 }
              ]}
              loading={loading}
              emptyMessage={
                searchTerm || categoryFilter !== "All" 
                  ? 'No products found. Try adjusting your search or filters.'
                  : 'No products yet. Add your first product to get started.'
              }
              renderRow={(product, index) => {
                const availableQty = getAvailableQuantity(product);
                const stockInfo = getStockStatus(product.stock, product.opening_stock, product.sold);
                const reorderLevel = product.reorder_level || 10;
                const isLowStock = availableQty > 0 && availableQty <= reorderLevel;
                const isOutOfStock = availableQty <= 0;

                return (
                  <Fade in={true} timeout={300 + index * 100} key={product.id}>
                    <Box
                      component="tr"
                      sx={{
                        bgcolor: isOutOfStock ? 'error.50' : (isLowStock ? 'warning.50' : 'transparent'),
                        '&:hover': {
                          bgcolor: isOutOfStock ? 'error.100' : (isLowStock ? 'warning.100' : 'grey.50')
                        }
                      }}
                    >
                      <Box component="td">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{
                            bgcolor: 'primary.50',
                            color: 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {product.name?.charAt(0)?.toUpperCase() || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {product.description || 'No description'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td">
                        <Chip
                          icon={<CategoryIcon fontSize="small" />}
                          label={product.category || 'Uncategorized'}
                          size="small"
                          sx={{
                            bgcolor: 'primary.50',
                            color: 'primary.700',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: 'primary.200'
                          }}
                        />
                      </Box>
                      <Box component="td">
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <AttachMoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2" color="text.primary" fontWeight={600}>
                              ₹{product.price || '0'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              / {product.unit || 'unit'}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PercentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {product.tax_rate || 0}% tax
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td">
                        <Box>
                          <Chip
                            icon={stockInfo.icon}
                            label={stockInfo.status}
                            size="small"
                            color={stockInfo.color}
                            sx={{ fontWeight: 600, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {availableQty} {product.unit || 'units'} available
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ textAlign: 'center' }}>
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenuOpen(e, product)}
                            sx={{
                              color: 'primary.main',
                              bgcolor: 'primary.50',
                              '&:hover': {
                                bgcolor: 'primary.100',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Fade>
                );
              }}
              data={filteredProducts}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleEdit(selectedProduct);
            handleActionMenuClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit Product" />
        </MenuItem>
        {selectedProduct && selectedProduct.preferred_vendor_id && (
          <MenuItem
            onClick={() => handleRestock(selectedProduct)}
            sx={{ py: 1.5, color: 'success.main' }}
          >
            <ListItemIcon>
              <ShoppingCartIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Restock (Generate PO)" />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setConfirmDeleteId(selectedProduct.id);
            handleActionMenuClose();
          }}
          sx={{ py: 1.5, color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Product" />
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: 'error.main'
        }}>
          <Avatar sx={{ bgcolor: 'error.100', color: 'error.main' }}>
            <DeleteIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Delete Product
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this product? All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={() => setConfirmDeleteId(null)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(confirmDeleteId)}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

    </MainLayout >
  );
};

export default ProductList;
