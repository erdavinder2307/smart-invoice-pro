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
  Paper,
  Tabs,
  Tab
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const initialForm = {
  bill_number: "",
  vendor_id: "",
  bill_date: "",
  due_date: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  amount_paid: 0,
  balance_due: 0,
  payment_status: "Unpaid",
  notes: "",
  subject: "",
  items: [{ item_name: "", quantity: 1, rate: 0, tax: 0, amount: 0 }],
  expenses: []
};

const AddEditBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/vendors"));
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  const fetchNextBillNumber = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/bills/next-number"));
      setForm(prev => ({ ...prev, bill_number: response.data.next_number }));
    } catch (error) {
      setForm(prev => ({ ...prev, bill_number: "BILL-001" }));
    }
  };

  const fetchBill = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl(`/api/bills/${id}`));
      setForm(response.data);
    } catch (error) {
      setError("Failed to fetch bill");
      console.error(error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchVendors();
    if (id) {
      fetchBill();
    } else {
      fetchNextBillNumber();
      const today = new Date().toISOString().slice(0, 10);
      setForm(prev => ({ ...prev, bill_date: today }));
    }
  }, [id, fetchBill]);

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
    recalculateTotals(items, form.expenses);
  };

  const handleExpenseChange = (index, field, value) => {
    const expenses = [...form.expenses];
    expenses[index][field] = value;
    
    // Calculate expense amount
    if (field === 'amount') {
      expenses[index].amount = parseFloat(value) || 0;
    }

    setForm(prev => ({ ...prev, expenses }));
    recalculateTotals(form.items, expenses);
  };

  const recalculateTotals = (items, expenses) => {
    const itemsSubtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);

    const itemsTax = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const tax = parseFloat(item.tax) || 0;
      return sum + ((quantity * rate * tax) / 100);
    }, 0);

    const expensesTotal = expenses.reduce((sum, exp) => {
      return sum + (parseFloat(exp.amount) || 0);
    }, 0);

    const subtotal = itemsSubtotal + expensesTotal;
    const totalTax = itemsTax;
    const totalAmount = subtotal + totalTax;
    const balanceDue = totalAmount - (form.amount_paid || 0);

    setForm(prev => ({
      ...prev,
      subtotal,
      total_tax: totalTax,
      cgst_amount: totalTax / 2,
      sgst_amount: totalTax / 2,
      igst_amount: 0,
      total_amount: totalAmount,
      balance_due: balanceDue
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
    recalculateTotals(items, form.expenses);
  };

  const addExpense = () => {
    setForm(prev => ({
      ...prev,
      expenses: [...prev.expenses, { expense_name: "", amount: 0, description: "" }]
    }));
  };

  const removeExpense = (index) => {
    const expenses = form.expenses.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, expenses }));
    recalculateTotals(form.items, expenses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (id) {
        await axios.put(createApiUrl(`/api/bills/${id}`), form);
      } else {
        await axios.post(createApiUrl("/api/bills"), form);
      }
      navigate("/bills");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save bill");
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
            onClick={() => navigate("/bills")}
            sx={{ mb: 2, textTransform: "none" }}
          >
            Back to Bills
          </Button>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {id ? "Edit Bill" : "New Bill"}
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
                  label="Bill Number"
                  name="bill_number"
                  value={form.bill_number}
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
                  label="Bill Date"
                  name="bill_date"
                  type="date"
                  value={form.bill_date}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  name="due_date"
                  type="date"
                  value={form.due_date}
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

          {/* Tabs for Items and Expenses */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="Items" />
              <Tab label="Expenses" />
            </Tabs>

            {/* Items Tab */}
            <TabPanel value={activeTab} index={0}>
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
            </TabPanel>

            {/* Expenses Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Expenses
                </Typography>
                <Button startIcon={<AddIcon />} onClick={addExpense} size="small">
                  Add Expense
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Expense Name</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No expenses added
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      form.expenses.map((expense, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              value={expense.expense_name}
                              onChange={(e) => handleExpenseChange(index, 'expense_name', e.target.value)}
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={expense.amount}
                              onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                              size="small"
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={expense.description}
                              onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => removeExpense(index)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
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
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography color="success.main">Amount Paid:</Typography>
                  <Typography fontWeight={600} color="success.main">₹{form.amount_paid.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography color="error.main">Balance Due:</Typography>
                  <Typography fontWeight={600} color="error.main">₹{form.balance_due.toFixed(2)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Notes & Status */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    name="payment_status"
                    value={form.payment_status}
                    onChange={handleChange}
                    label="Payment Status"
                  >
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                    <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Overdue">Overdue</MenuItem>
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
              onClick={() => navigate("/bills")}
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

export default AddEditBill;
