import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Autocomplete,
  Popper,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  Build as BuildIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import './StockAdjustment.css';

const adjustmentTypes = [
  {
    value: "PURCHASE",
    label: "Purchase Receipt",
    icon: <ReceiptIcon />,
    color: "success",
    description: "Stock received from suppliers"
  },
  {
    value: "PRODUCTION",
    label: "Production/Manufacturing",
    icon: <BuildIcon />,
    color: "info",
    description: "Items produced in-house"
  },
  {
    value: "RETURN",
    label: "Customer Return",
    icon: <RefreshIcon />,
    color: "warning",
    description: "Returned items from customers"
  },
  {
    value: "SALE",
    label: "Sales/Issue",
    icon: <BusinessIcon />,
    color: "error",
    description: "Stock issued for sales"
  },
  {
    value: "DAMAGE",
    label: "Damage/Loss",
    icon: <WarningIcon />,
    color: "error",
    description: "Damaged or lost inventory"
  },
  {
    value: "TRANSFER",
    label: "Transfer/Movement",
    icon: <ShippingIcon />,
    color: "info",
    description: "Stock movement between locations"
  },
  {
    value: "ADJUSTMENT",
    label: "Manual Adjustment",
    icon: <AssignmentIcon />,
    color: "secondary",
    description: "Manual stock corrections"
  },
];

const StockAdjustment = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [currentStock, setCurrentStock] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [location, setLocation] = useState("Main Warehouse");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [recentAdjustments, setRecentAdjustments] = useState([]);

  const locations = ["Main Warehouse", "Store Front", "Secondary Storage", "Transit"];

  // Calculate if this is stock IN or OUT
  const isStockIn = () => {
    return ["PURCHASE", "PRODUCTION", "RETURN", "ADJUSTMENT"].includes(type) && quantity > 0;
  };

  const isStockOut = () => {
    return ["SALE", "DAMAGE", "TRANSFER"].includes(type) || (type === "ADJUSTMENT" && quantity < 0);
  };

  useEffect(() => {
    // Fetch products with enhanced stock information
    axios.get(createApiUrl("/api/products"))
      .then(async res => {
        const productsData = res.data || [];
        
        // Fetch current stock for each product from stock API
        const productsWithStock = await Promise.all(
          productsData.map(async (product) => {
            try {
              const stockRes = await axios.get(createApiUrl(`/api/stock/${product.id}`));
              const currentStock = stockRes.data.current_stock || stockRes.data.stock || 0;
              
              return { 
                ...product, 
                stock: currentStock,
                stockValue: currentStock * (product.price || 0),
                stockStatus: getStockStatus(currentStock)
              };
            } catch (error) {
              // If stock API fails, use product's stock field or default to 0
              const fallbackStock = product.stock || 0;
              return { 
                ...product, 
                stock: fallbackStock,
                stockValue: fallbackStock * (product.price || 0),
                stockStatus: getStockStatus(fallbackStock)
              };
            }
          })
        );
        
        setProducts(productsWithStock);
      })
      .catch(() => setProducts([]));
    
    // Fetch recent adjustments
    axios.get(createApiUrl("/api/stock/recent-adjustments"))
      .then(res => setRecentAdjustments(res.data || []))
      .catch(() => setRecentAdjustments([]));
  }, [success]);  useEffect(() => {
    if (selectedProduct?.id) {
      // Get detailed product information
      setProductDetails(selectedProduct);
      
      // Get current stock from the stock API
      axios.get(createApiUrl(`/api/stock/${selectedProduct.id}`))
        .then(res => {
          // The API returns current_stock field, so use that
          const stockValue = res.data.current_stock || res.data.stock || 0;
          setCurrentStock(stockValue);
        })
        .catch(() => {
          // Fallback to product's stock field if API fails
          setCurrentStock(selectedProduct.stock || 0);
        });
        
      // Get stock ledger with running balance
      axios.get(createApiUrl(`/api/stock/ledger/${selectedProduct.id}`))
        .then(res => {
          const ledgerData = res.data || [];
          // Ensure each entry has the expected fields
          const processedLedger = ledgerData.map(entry => ({
            ...entry,
            date: entry.date || entry.timestamp || new Date().toISOString(),
            type: entry.adjustment_type || entry.type || 'ADJUSTMENT',
            quantity: entry.quantity || 0,
            balance: entry.balance || 0
          }));
          setLedger(processedLedger);
        })
        .catch(() => setLedger([]));
    } else {
      setProductDetails(null);
      setCurrentStock(null);
      setLedger([]);
    }
  }, [selectedProduct, success]);  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: "Out of Stock", color: "error" };
    if (stock <= 10) return { label: "Low Stock", color: "warning" };
    if (stock <= 50) return { label: "Medium Stock", color: "info" };
    return { label: "Good Stock", color: "success" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Enhanced validation
    if (!selectedProduct) return setError("Please select a product");
    if (!type) return setError("Please select adjustment type");
    if (!quantity || isNaN(quantity) || Number(quantity) === 0) return setError("Enter valid quantity");
    if (!reason.trim()) return setError("Enter reason for adjustment");
    if (!location.trim()) return setError("Select location");
    
    // Validate stock OUT operations
    if (isStockOut() && Math.abs(Number(quantity)) > currentStock) {
      return setError(`Insufficient stock. Available: ${currentStock}`);
    }
    
    setLoading(true);
    try {
      const adjustmentData = {
        product_id: selectedProduct.id,
        type: type,
        quantity: isStockOut() ? -Math.abs(Number(quantity)) : Math.abs(Number(quantity)),
        reason: reason.trim(),
        reference_number: referenceNumber.trim() || null,
        unit_cost: unitCost ? Number(unitCost) : null,
        location: location,
        adjustment_date: new Date().toISOString().split('T')[0],
        user_id: "current_user", // Should come from auth context
      };

      await axios.post(createApiUrl("/api/stock/adjust"), adjustmentData);
      
      setSuccess(`Stock ${isStockOut() ? 'reduced' : 'increased'} successfully`);
      
      // Reset form
      setQuantity("");
      setReason("");
      setReferenceNumber("");
      setUnitCost("");
      setType("");
      
      // Refresh the current stock after successful adjustment
      if (selectedProduct?.id) {
        axios.get(createApiUrl(`/api/stock/${selectedProduct.id}`))
          .then(res => {
            const stockValue = res.data.current_stock || res.data.stock || 0;
            setCurrentStock(stockValue);
          })
          .catch(() => {
            // If API fails, recalculate based on the adjustment
            const newStock = isStockOut() 
              ? currentStock - Math.abs(Number(quantity)) 
              : currentStock + Math.abs(Number(quantity));
            setCurrentStock(newStock);
          });
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to adjust stock");
    }
    setLoading(false);
  };  return (
    <Box className="stock-adjustment-root">
      <Header />
      <Box className="stock-adjustment-main">
        <Sidebar />
        <Box className="stock-adjustment-content">
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <InventoryIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Stock Adjustment
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage inventory levels with professional stock adjustments
                </Typography>
              </Box>
            </Box>
          </Paper>

        
            {/* Stock Adjustment Form */}
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid rgba(102,126,234,0.08)',
                  boxShadow: '0 8px 32px rgba(102,126,234,0.12)'
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>
                    New Stock Adjustment
                  </Typography>
                </Box>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 3 }}
                    icon={<WarningIcon />}
                  >
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert
                    severity="success"
                    sx={{ mb: 3, borderRadius: 3 }}
                    icon={<CheckCircleIcon />}
                  >
                    {success}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                  <Grid container className="add-edit-product-grid">
                    <div className="invoice-form-row">

                      <Autocomplete
                        value={selectedProduct}
                        onChange={(event, newValue) => setSelectedProduct(newValue)}
                        options={products}
                        getOptionLabel={(option) => option.name || ""}
                        fullWidth
                        disablePortal={false}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Product"
                            required
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <InventoryIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'grey.50',
                                minHeight: '56px',
                                '&:hover': { bgcolor: 'grey.100' },
                                '&.Mui-focused': {
                                  bgcolor: 'white',
                                  boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                }
                              }
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            {...props}
                            sx={{
                              py: 2,
                              px: 2,
                              borderBottom: '1px solid rgba(0,0,0,0.06)',
                              '&:last-child': { borderBottom: 'none' },
                              '&:hover': {
                                bgcolor: 'rgba(102,126,234,0.04)',
                                transform: 'translateX(2px)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2} width="100%" minWidth={0}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: 'primary.50',
                                  color: 'primary.main',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(102,126,234,0.15)'
                                }}
                              >
                                <InventoryIcon />
                              </Avatar>
                              <Box flex={1} minWidth={0} sx={{ overflow: 'hidden' }}>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    mb: 0.5
                                  }}
                                >
                                  {option.name}
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                                  <Chip
                                    label={option.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: '0.75rem',
                                      height: '20px',
                                      bgcolor: 'info.50',
                                      borderColor: 'info.200',
                                      color: 'info.main'
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    ₹{option.price}/{option.unit}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box flexShrink={0} textAlign="right">
                                <Chip
                                  label={`${option.stock}`}
                                  size="small"
                                  color={option.stockStatus?.color || 'default'}
                                  variant="filled"
                                  sx={{
                                    fontWeight: 700,
                                    minWidth: '60px'
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                  Stock
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                        PopperComponent={(props) => (
                          <Popper
                            {...props}
                            placement="bottom-start"
                            modifiers={[
                              {
                                name: 'flip',
                                enabled: true,
                                options: {
                                  altBoundary: true,
                                  rootBoundary: 'document',
                                  padding: 8,
                                },
                              },
                              {
                                name: 'preventOverflow',
                                enabled: true,
                                options: {
                                  altAxis: true,
                                  altBoundary: true,
                                  tether: true,
                                  rootBoundary: 'document',
                                  padding: 8,
                                },
                              },
                            ]}
                            sx={{
                              zIndex: 1500,
                              '& .MuiPaper-root': {
                                marginTop: '8px !important',
                                boxShadow: '0 12px 40px rgba(102,126,234,0.15)',
                                border: '1px solid rgba(102,126,234,0.08)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                maxWidth: '600px',
                                minWidth: '400px'
                              },
                              '& .MuiAutocomplete-listbox': {
                                maxHeight: '320px',
                                padding: 0,
                                '&::-webkit-scrollbar': {
                                  width: '8px'
                                },
                                '&::-webkit-scrollbar-track': {
                                  background: '#f1f1f1',
                                  borderRadius: '4px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background: 'rgba(102,126,234,0.3)',
                                  borderRadius: '4px',
                                  '&:hover': {
                                    background: 'rgba(102,126,234,0.5)'
                                  }
                                }
                              },
                              '& .MuiAutocomplete-option': {
                                padding: 0
                              }
                            }}
                          />
                        )}
                        slotProps={{
                          paper: {
                            elevation: 0
                          }
                        }}
                      />
                      <FormControl
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          },
                          '& .MuiSelect-select': {
                            minHeight: '56px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                      >
                        <InputLabel>Adjustment Type</InputLabel>
                        <Select
                          value={type}
                          label="Adjustment Type"
                          onChange={(e) => setType(e.target.value)}
                          startAdornment={
                            <InputAdornment position="start">
                              <AssignmentIcon color="action" />
                            </InputAdornment>
                          }
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                maxHeight: 400,
                                minWidth: '380px',
                                boxShadow: '0 12px 40px rgba(102,126,234,0.15)',
                                border: '1px solid rgba(102,126,234,0.08)',
                                borderRadius: '12px',
                                mt: 1,
                                overflow: 'hidden',
                                '& .MuiList-root': {
                                  padding: 0,
                                  '&::-webkit-scrollbar': {
                                    width: '8px'
                                  },
                                  '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '4px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(102,126,234,0.3)',
                                    borderRadius: '4px',
                                    '&:hover': {
                                      background: 'rgba(102,126,234,0.5)'
                                    }
                                  }
                                }
                              }
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                            disablePortal: false
                          }}
                        >
                          {adjustmentTypes.map((adjType) => (
                            <MenuItem
                              key={adjType.value}
                              value={adjType.value}
                              sx={{
                                py: 2,
                                px: 2,
                                minHeight: 'auto',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                                '&:last-child': { borderBottom: 'none' },
                                '&:hover': {
                                  bgcolor: 'rgba(102,126,234,0.04)',
                                  transform: 'translateX(2px)',
                                  transition: 'all 0.2s ease'
                                },
                                '&.Mui-selected': {
                                  bgcolor: 'rgba(102,126,234,0.08)',
                                  '&:hover': {
                                    bgcolor: 'rgba(102,126,234,0.12)'
                                  }
                                }
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={2} width="100%" minWidth={0}>
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: `${adjType.color}.50`,
                                    color: `${adjType.color}.main`,
                                    flexShrink: 0,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {adjType.icon}
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                  <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    sx={{
                                      color: 'text.primary',
                                      mb: 0.5,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {adjType.label}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: 'block',
                                      lineHeight: 1.3,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {adjType.description}
                                  </Typography>
                                </Box>
                                <Box flexShrink={0}>
                                  <Chip
                                    label={adjType.value === "PURCHASE" || adjType.value === "PRODUCTION" || adjType.value === "RETURN" ? "IN" : "OUT"}
                                    size="small"
                                    color={adjType.value === "PURCHASE" || adjType.value === "PRODUCTION" || adjType.value === "RETURN" ? "success" : "error"}
                                    variant="filled"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>


                    </div>
                    <div className="invoice-form-row">
                      <FormControl
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          },
                          '& .MuiSelect-select': {
                            minHeight: '56px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                      >
                        <InputLabel>Location</InputLabel>
                        <Select
                          value={location}
                          label="Location"
                          onChange={(e) => setLocation(e.target.value)}
                          startAdornment={
                            <InputAdornment position="start">
                              <BusinessIcon color="action" />
                            </InputAdornment>
                          }
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                maxHeight: 300,
                                minWidth: '280px',
                                boxShadow: '0 12px 40px rgba(102,126,234,0.15)',
                                border: '1px solid rgba(102,126,234,0.08)',
                                borderRadius: '12px',
                                mt: 1,
                                overflow: 'hidden',
                                '& .MuiList-root': {
                                  padding: 0
                                }
                              }
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                            disablePortal: false
                          }}
                        >
                          {locations.map((loc, index) => (
                            <MenuItem
                              key={loc}
                              value={loc}
                              sx={{
                                py: 2,
                                px: 2,
                                borderBottom: index < locations.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                                '&:hover': {
                                  bgcolor: 'rgba(102,126,234,0.04)',
                                  transform: 'translateX(2px)',
                                  transition: 'all 0.2s ease'
                                },
                                '&.Mui-selected': {
                                  bgcolor: 'rgba(102,126,234,0.08)',
                                  '&:hover': {
                                    bgcolor: 'rgba(102,126,234,0.12)'
                                  }
                                }
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={2} width="100%">
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'info.50',
                                    color: 'info.main',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  <BusinessIcon />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body1" fontWeight={600} color="text.primary">
                                    {loc}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {loc === "Main Warehouse" ? "Primary storage location" :
                                      loc === "Store Front" ? "Retail display area" :
                                        loc === "Secondary Storage" ? "Backup storage facility" :
                                          "Items in transit"}
                                  </Typography>
                                </Box>
                                {location === loc && (
                                  <Chip
                                    label="Selected"
                                    size="small"
                                    color="primary"
                                    variant="filled"
                                    sx={{ fontWeight: 600 }}
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        fullWidth
                        required
                        inputProps={{ min: 1, step: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {isStockIn() ? <ArrowUpIcon color="success" /> : <ArrowDownIcon color="error" />}
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="invoice-form-row">
                      <TextField
                        label="Unit Cost (Optional)"
                        type="number"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              ₹
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                      <TextField
                        label="Reference Number"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        fullWidth
                        placeholder="Invoice/PO/Receipt No."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ReceiptIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="invoice-form-row">
                      <TextField
                        label="Reason for Adjustment"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth
                        required
                        multiline
                        rows={3}
                        placeholder="Provide detailed reason for this stock adjustment..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                              <InfoIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="invoice-form-row">
                      {/* {productDetails && (
                        <Grid item xs={12} width="100%">
                          <Card
                            sx={{
                              bgcolor: 'info.50',
                              border: '1px solid',
                              borderColor: 'info.200',
                              borderRadius: 3
                            }}
                          >
                            <CardContent>
                              <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Current Stock
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700}>
                                    {currentStock || 0} {productDetails.unit}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Unit Price
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700}>
                                    ₹{productDetails.price}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Stock Value
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700}>
                                    ₹{((currentStock || 0) * productDetails.price).toFixed(2)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Status
                                  </Typography>
                                  <Chip
                                    label={getStockStatus(currentStock || 0).label}
                                    color={getStockStatus(currentStock || 0).color}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      )} */}
                         {productDetails && (
                  <Paper width="100%"
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: '1px solid rgba(102,126,234,0.08)',
                      boxShadow: '0 8px 32px rgba(102,126,234,0.12)'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Avatar sx={{ bgcolor: 'success.50', color: 'success.main' }}>
                        <InventoryIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700}>
                        Current Stock
                      </Typography>
                    </Box>

                    <Box textAlign="center" mb={2}>
                      <Typography variant="h3" fontWeight={800} color="primary.main">
                        {currentStock || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {productDetails.unit} available
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Value
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{((currentStock || 0) * productDetails.price).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={getStockStatus(currentStock || 0).label}
                        color={getStockStatus(currentStock || 0).color}
                        size="small"
                      />
                    </Box>
                  </Paper>
                )}

                {/* Stock Ledger */}
                {ledger.length > 0 && (
                  <Paper width="100%"
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: '1px solid rgba(102,126,234,0.08)',
                      boxShadow: '0 8px 32px rgba(102,126,234,0.12)'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Avatar sx={{ bgcolor: 'info.50', color: 'info.main' }}>
                        <HistoryIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700}>
                        Recent Transactions
                      </Typography>
                    </Box>

                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Balance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ledger.slice(0, 10).map((entry, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Typography variant="caption">
                                  {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={entry.type}
                                  size="small"
                                  color={entry.quantity > 0 ? "success" : "error"}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  color={entry.quantity > 0 ? "success.main" : "error.main"}
                                  fontWeight={600}
                                >
                                  {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {entry.balance || 0}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
                    </div>
                    <div className="invoice-form-row">
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 700,
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
                          Process Adjustment
                        </Button>
                      </Box>
                    </div>
                  </Grid>

                </Box>
              </Paper>
            </Grid>

         
         
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default StockAdjustment;
