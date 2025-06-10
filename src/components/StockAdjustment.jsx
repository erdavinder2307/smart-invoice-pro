import React, { useEffect, useState } from "react";
import axios from "axios";
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
} from "@mui/material";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import './StockAdjustment.css';

const adjustmentTypes = [
  { value: "IN", label: "Stock In" },
  { value: "OUT", label: "Stock Out" },
];

const StockAdjustment = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentStock, setCurrentStock] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/products")
      .then(res => {
        // If stock is available in product object, use it
        setProducts(res.data.map(p => ({ ...p, stock: p.stock ?? null })));
      })
      .catch(() => setProducts([]));
  }, [success]); // refetch on success to update stock

  useEffect(() => {
    if (selectedProduct) {
      axios.get(`http://127.0.0.1:5000/api/stock/${selectedProduct}`)
        .then(res => setCurrentStock(res.data.stock || 0))
        .catch(() => setCurrentStock(null));
      axios.get(`http://127.0.0.1:5000/api/stock/ledger/${selectedProduct}`)
        .then(res => setLedger(res.data || []))
        .catch(() => setLedger([]));
    } else {
      setCurrentStock(null);
      setLedger([]);
    }
  }, [selectedProduct, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedProduct) return setError("Select a product");
    if (!type) return setError("Select adjustment type");
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) return setError("Enter valid quantity");
    if (!reason.trim()) return setError("Enter reason/source");
    setLoading(true);
    try {
      const endpoint = type === "IN" ? "/stock/add" : "/stock/reduce";
      await axios.post(`http://127.0.0.1:5000/api${endpoint}`, {
        product_id: selectedProduct,
        quantity: Number(quantity),
        reason,
      });
      setSuccess("Stock adjusted successfully");
      setQuantity("");
      setReason("");
    } catch {
      setError("Failed to adjust stock");
    }
    setLoading(false);
  };

  return (
    <Box className="stock-adjustment-root">
      <Header />
      <Box className="stock-adjustment-main">
        <Sidebar />
        <Box className="stock-adjustment-content">
          <Paper elevation={3} className="stock-adjustment-card">
            <Typography variant="h5" className="stock-adjustment-title">
              Stock Adjustment
            </Typography>
            {error && <Alert severity="error" className="stock-adjustment-alert">{error}</Alert>}
            {success && <Alert severity="success" className="stock-adjustment-alert">{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit} autoComplete="off" className="stock-adjustment-form">
              <Grid container spacing={2} className="stock-adjustment-grid">
                {/* Form Fields Row */}
                <Grid item xs={12} md={6} className="stock-adjustment-field">
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Product</InputLabel>
                    <Select
                      label="Product"
                      value={selectedProduct}
                      onChange={e => setSelectedProduct(e.target.value)}
                    >
                      <MenuItem value="">Select Product</MenuItem>
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                          {typeof p.stock === 'number' && (
                            <span className="stock-adjustment-product-stock">
                              (Stock: {p.stock})
                            </span>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6} className="stock-adjustment-field">
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Adjustment Type</InputLabel>
                    <Select
                      label="Adjustment Type"
                      value={type}
                      onChange={e => setType(e.target.value)}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      {adjustmentTypes.map((t) => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4} className="stock-adjustment-field">
                  <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 1, step: 1 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={8} className="stock-adjustment-field">
                  <TextField
                    label="Reason / Source"
                    name="reason"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                </Grid>
                 <Grid item xs={12} className="stock-adjustment-actions">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    className="stock-adjustment-button"
                    startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  >
                    Adjust Stock
                  </Button>
                </Grid>
                {/* Stock Info and Ledger */}
      
                {/* Actions Row */}
               
              </Grid>
                        <Grid item xs={12} className="stock-adjustment-info">
                  {selectedProduct && (
                    <>
                      <Typography variant="subtitle1" className="stock-adjustment-stock-label">
                        Current Stock: <b>{currentStock !== null ? currentStock : "-"}</b>
                      </Typography>
                      {ledger.length > 0 && (
                        <Box className="stock-adjustment-ledger-wrapper">
                          <Typography variant="subtitle2" className="stock-adjustment-ledger-title">Stock Ledger</Typography>
                          <Paper variant="outlined" className="stock-adjustment-ledger-card">
                            <table className="stock-adjustment-ledger-table">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Type</th>
                                  <th>Qty</th>
                                  <th>Reason/Source</th>
                                  <th>Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ledger.map((entry, i) => (
                                  <tr key={i}>
                                    <td>{entry.date || '-'}</td>
                                    <td>{entry.type}</td>
                                    <td>{entry.quantity}</td>
                                    <td>{entry.reason}</td>
                                    <td>{entry.balance}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Paper>
                        </Box>
                      )}
                    </>
                  )}
                </Grid>
            </Box>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default StockAdjustment;
