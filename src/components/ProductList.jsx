import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/productService";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
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
import ScaleIcon from '@mui/icons-material/Scale';
import PercentIcon from '@mui/icons-material/Percent';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const getStockStatus = (stock, openingStock, sold) => {
    const availableQty = typeof stock === 'number' ? stock : 
      (typeof openingStock === 'number' && typeof sold === 'number' ? (openingStock - sold) : 0);
    
    if (availableQty <= 0) return { status: 'Out of Stock', color: 'error', icon: <WarningIcon fontSize="small" /> };
    if (availableQty <= 10) return { status: 'Low Stock', color: 'warning', icon: <WarningIcon fontSize="small" /> };
    return { status: 'In Stock', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
  };

  const getAvailableQuantity = (product) => {
    return typeof product.stock === 'number' ? product.stock : 
      (typeof product.opening_stock === 'number' && typeof product.sold === 'number' ? 
        (product.opening_stock - product.sold) : 0);
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: 'calc(100vh - 128px)', 
          p: 3,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
            backdropFilter: 'blur(10px)'
          }
        }}>
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
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
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
              {/* Header Section */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <InventoryIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                      Product Inventory
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Manage your product catalog and inventory
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  sx={{ 
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      boxShadow: '0 12px 32px rgba(102,126,234,0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add New Product
                </Button>
              </Box>

              {/* Search and Filters */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
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
                <Grid item xs={12} md={4}>
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
                          <FilterListIcon color="action" />
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

              {/* Modern Table */}
              <TableContainer sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: 'grey.50',
                      '& .MuiTableCell-head': {
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '0.95rem',
                        borderBottom: '2px solid',
                        borderColor: 'grey.200',
                        py: 2
                      }
                    }}>
                      <TableCell>Product Info</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Pricing</TableCell>
                      <TableCell>Stock Status</TableCell>
                      <TableCell align="center" width={120}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <CircularProgress size={40} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Loading products...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <InventoryIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm || categoryFilter !== "All" ? 'No products found' : 'No products yet'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || categoryFilter !== "All" ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const availableQty = getAvailableQuantity(product);
                        const stockInfo = getStockStatus(product.stock, product.opening_stock, product.sold);
                        
                        return (
                          <Fade in={true} timeout={300 + index * 100} key={product.id}>
                            <TableRow sx={{
                              '&:hover': {
                                bgcolor: 'grey.50',
                                transform: 'scale(1.001)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              },
                              transition: 'all 0.2s ease',
                              '& .MuiTableCell-root': {
                                borderBottom: '1px solid',
                                borderColor: 'grey.100',
                                py: 2
                              }
                            }}>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                              <TableCell align="center">
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
                              </TableCell>
                            </TableRow>
                          </Fade>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
      </Box>
      <Footer />
    </Box>
  );
};

export default ProductList;
