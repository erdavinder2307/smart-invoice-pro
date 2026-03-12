import React, { useEffect, useState, useCallback } from "react";
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
  Grid,
  CircularProgress,
  Alert,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const initialForm = {
  po_number: "",
  vendor_id: "",
  order_date: "",
  delivery_date: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  status: "Draft",
  notes: "",
  subject: "",
  items: [{ item_name: "", quantity: 1, rate: 0, tax: 0, amount: 0 }],
};

const AddEditPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchVendors = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/vendors"));
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  const fetchNextPONumber = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/purchase-orders/next-number"));
      setForm(prev => ({ ...prev, po_number: response.data.next_number }));
    } catch (error) {
      setForm(prev => ({ ...prev, po_number: "PO-001" }));
    }
  };

  const fetchPO = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl(`/api/purchase-orders/${id}`));
      setForm(response.data);
    } catch (error) {
      setError("Failed to fetch purchase order");
      console.error(error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchVendors();
    if (id) {
      fetchPO();
    } else {
      fetchNextPONumber();
      const today = new Date().toISOString().slice(0, 10);
      setForm(prev => ({ ...prev, order_date: today }));
    }
  }, [id, fetchPO]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    
    // Calculate item amount
    const quantity = parseFloat(items[index].quantity) || 0;
    const rate = parseFloat(items[index].rate) || 0;
    const tax = parseFloat(items[index].tax) || 0;
    const itemSubtotal = quantity * rate;
    const taxAmount = (itemSubtotal * tax) / 100;
    items[index].amount = itemSubtotal + taxAmount;

    setForm(prev => ({ ...prev, items }));
    recalculateTotals(items);
  };

  const recalculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);

    const totalTax = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const tax = parseFloat(item.tax) || 0;
      return sum + ((quantity * rate * tax) / 100);
    }, 0);

    const totalAmount = subtotal + totalTax;

    setForm(prev => ({
      ...prev,
      subtotal,
      total_tax: totalTax,
      cgst_amount: totalTax / 2,
      sgst_amount: totalTax / 2,
      igst_amount: 0,
      total_amount: totalAmount
    }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { item_name: "", quantity: 1, rate: 0, tax: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, items }));
    recalculateTotals(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (id) {
        await axios.put(createApiUrl(`/api/purchase-orders/${id}`), form);
      } else {
        await axios.post(createApiUrl("/api/purchase-orders"), form);
      }
      navigate("/purchase-orders");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save purchase order");
      console.error(error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/purchase-orders")}
            sx={{ mb: 2, textTransform: "none" }}
          >
            Back to Purchase Orders
          </Button>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {id ? "Edit Purchase Order" : "New Purchase Order"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Paper component="form" onSubmit={handleSubmit} elevation={0}
          sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
          
          {/* Basic Info */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="PO Number"
                  name="po_number"
                  value={form.po_number}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    name="vendor_id"
                    value={form.vendor_id}
                    onChange={handleChange}
                    label="Vendor"
                    sx={{ textAlign: 'left', '& .MuiSelect-select': { textAlign: 'left' } }}
                  >
                    {vendors.map(vendor => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.vendor_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Order Date"
                  name="order_date"
                  type="date"
                  value={form.order_date}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Delivery Date"
                  name="delivery_date"
                  type="date"
                  value={form.delivery_date}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* Items */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Items
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addItem} size="small">
                Add Item
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Tax %</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          size="small"
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ₹{item.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {form.items.length > 1 && (
                          <IconButton size="small" onClick={() => removeItem(index)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Summary */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item xs={12} sm={6} md={4}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight={600}>₹{form.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>CGST:</Typography>
                  <Typography fontWeight={600}>₹{form.cgst_amount.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>SGST:</Typography>
                  <Typography fontWeight={600}>₹{form.sgst_amount.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Tax:</Typography>
                  <Typography fontWeight={600}>₹{form.total_tax.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2} pt={2} borderTop="2px solid" borderColor="divider">
                  <Typography variant="h6" fontWeight={700}>Total Amount:</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    ₹{form.total_amount.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Notes & Status */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    label="Status"
                    sx={{ textAlign: 'left', '& .MuiSelect-select': { textAlign: 'left' } }}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Sent">Sent</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Received">Received</MenuItem>
                    <MenuItem value="Billed">Billed</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* Actions */}
          <Box sx={{ px: 4, py: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/purchase-orders")}
              sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
            >
              {saving ? "Saving..." : id ? "Update" : "Save"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default AddEditPurchaseOrder;
