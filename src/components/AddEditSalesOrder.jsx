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
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Fade,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotesIcon from '@mui/icons-material/Notes';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const statusOptions = ["Draft", "Confirmed", "Closed", "Invoiced", "Cancelled"];

const initialForm = {
  so_number: "",
  customer_id: "",
  order_date: "",
  delivery_date: "",
  payment_terms: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  status: "Draft",
  notes: "",
  terms_conditions: "",
  is_gst_applicable: false,
  subject: "",
  salesperson: "",
  items: [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const AddEditSalesOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const soId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch customers
    axios.get(createApiUrl("/api/customers")).then(res => {
      setCustomers(res.data);
      if (!soId) {
        // Fetch next SO number
        axios.get(createApiUrl("/api/sales-orders/next-number")).then(nextRes => {
          const today = new Date().toISOString().slice(0, 10);
          setForm(prev => ({ 
            ...prev, 
            so_number: nextRes.data.next_number,
            order_date: today
          }));
        }).catch(() => {
          const today = new Date().toISOString().slice(0, 10);
          setForm(prev => ({ 
            ...prev, 
            so_number: "SO-001",
            order_date: today
          }));
        });
      } else {
        // Fetch existing sales order
        axios.get(createApiUrl(`/api/sales-orders/${soId}`)).then(res2 => {
          setForm(res2.data);
        }).catch(err => {
          setError("Failed to load sales order");
          console.error(err);
        });
      }
    }).catch(err => {
      setError("Failed to load customers");
      console.error(err);
    });
  }, [soId]);

  // Calculate totals
  useEffect(() => {
    let subtotal = 0;
    form.items?.forEach(item => {
      const itemTotal = (item.quantity * item.rate - item.discount) * (1 + item.tax / 100);
      subtotal += itemTotal;
    });

    const total_tax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const total_amount = subtotal + total_tax;

    setForm(f => ({ ...f, subtotal, total_tax, total_amount }));
    // eslint-disable-next-line
  }, [form.items, form.cgst_amount, form.sgst_amount, form.igst_amount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.customer_id) {
      setError("Please select a customer");
      setLoading(false);
      return;
    }

    if (form.delivery_date && new Date(form.delivery_date) < new Date(form.order_date)) {
      setError("Delivery date cannot be before order date");
      setLoading(false);
      return;
    }

    try {
      if (soId) {
        await axios.put(createApiUrl(`/api/sales-orders/${soId}`), form);
      } else {
        await axios.post(createApiUrl("/api/sales-orders"), form);
      }
      navigate("/sales-orders");
    } catch (err) {
      setError("Failed to save sales order: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{
            bgcolor: 'primary.main',
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <ShoppingCartIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {soId ? "Edit Sales Order" : "Create New Sales Order"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {soId ? "Update the sales order details" : "Create a new sales order for your customer"}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          </Fade>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Basic Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SO Number"
                    name="so_number"
                    value={form.so_number}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={!!soId}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Customer</InputLabel>
                    <Select
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      label="Customer"
                      sx={{ borderRadius: 2 }}
                    >
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      label="Status"
                      sx={{ borderRadius: 2 }}
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., Office equipment order"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Dates & Terms */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon color="primary" />
                Dates & Terms
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Order Date"
                    name="order_date"
                    value={form.order_date}
                    onChange={handleChange}
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Delivery Date (Optional)"
                    name="delivery_date"
                    value={form.delivery_date || ""}
                    onChange={handleChange}
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <LocalShippingIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Payment Terms"
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., Net 30"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Salesperson"
                    name="salesperson"
                    value={form.salesperson}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Enter salesperson name"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="primary" />
                Tax Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="is_gst_applicable"
                        checked={form.is_gst_applicable}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="GST Applicable"
                  />
                </Grid>
                {form.is_gst_applicable && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="CGST Amount"
                        name="cgst_amount"
                        value={form.cgst_amount}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="SGST Amount"
                        name="sgst_amount"
                        value={form.sgst_amount}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="IGST Amount"
                        name="igst_amount"
                        value={form.igst_amount}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon color="primary" />
                Line Items
              </Typography>
              <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rate (₹)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tax %</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 40 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items?.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].quantity = parseInt(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].rate = parseFloat(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.discount}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].discount = parseFloat(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.tax}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].tax = parseFloat(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ₹{((item.quantity * item.rate - item.discount) * (1 + item.tax / 100)).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newItems = form.items.filter((_, i) => i !== idx);
                                setForm({ ...form, items: newItems.length > 0 ? newItems : [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }] });
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setForm({
                    ...form,
                    items: [...(form.items || []), { quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }]
                  });
                }}
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                variant="outlined"
              >
                Add Line Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotesIcon color="primary" />
                Notes & Terms
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Customer Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Thank you for your business!"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Terms & Conditions"
                    name="terms_conditions"
                    value={form.terms_conditions}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter terms and conditions"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Subtotal:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    ₹{form.subtotal.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Total Tax:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    ₹{form.total_tax.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Total Amount:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                    ₹{form.total_amount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate("/sales-orders")}
              sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{ borderRadius: 2, px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, boxShadow: 3 }}
            >
              {loading ? "Saving..." : (soId ? "Update Sales Order" : "Create Sales Order")}
            </Button>
          </Box>
        </form>
      </Container>
    </MainLayout>
  );
};

export default AddEditSalesOrder;
