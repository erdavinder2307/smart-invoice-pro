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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, bgcolor: '#f5f6fa', minHeight: 'calc(100vh - 128px)', p: 3 }}>
          <Paper elevation={3} sx={{ width: '100%', mx: 0, p: 4, mb: 4, borderRadius: 3, overflowX: 'auto' }}>
            <Typography variant="h5" fontWeight={700} mb={2} color="primary.main">
              Stock Adjustment
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
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
                            <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                              (Stock: {p.stock})
                            </span>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={8}>
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
                <Grid item xs={12}>
                  {selectedProduct && (
                    <>
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        Current Stock: <b>{currentStock !== null ? currentStock : "-"}</b>
                      </Typography>
                      {ledger.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Stock Ledger</Typography>
                          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', minWidth: 400 }}>
                              <Box component="thead">
                                <Box component="tr">
                                  <Box component="th" sx={{ p: 1, fontWeight: 600 }}>Date</Box>
                                  <Box component="th" sx={{ p: 1, fontWeight: 600 }}>Type</Box>
                                  <Box component="th" sx={{ p: 1, fontWeight: 600 }}>Qty</Box>
                                  <Box component="th" sx={{ p: 1, fontWeight: 600 }}>Reason/Source</Box>
                                  <Box component="th" sx={{ p: 1, fontWeight: 600 }}>Balance</Box>
                                </Box>
                              </Box>
                              <Box component="tbody">
                                {ledger.map((entry, i) => (
                                  <Box component="tr" key={i}>
                                    <Box component="td" sx={{ p: 1 }}>{entry.date || '-'}</Box>
                                    <Box component="td" sx={{ p: 1 }}>{entry.type}</Box>
                                    <Box component="td" sx={{ p: 1 }}>{entry.quantity}</Box>
                                    <Box component="td" sx={{ p: 1 }}>{entry.reason}</Box>
                                    <Box component="td" sx={{ p: 1 }}>{entry.balance}</Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Paper>
                        </Box>
                      )}
                    </>
                  )}
                </Grid>
                <Grid item xs={12} display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ minWidth: 140 }}
                    startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  >
                    Adjust Stock
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

export default StockAdjustment;
