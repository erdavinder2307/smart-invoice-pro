import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box, Button, TextField, Typography, CircularProgress, Alert, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Paper, Tabs, Tab,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { C, fieldSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import FormDatePicker from './common/FormDatePicker';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      setError(t('addEditBill.failedFetch'));
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
      setError(error.response?.data?.error || t('addEditBill.failedSave'));
      console.error(error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <MainLayout title="Bill">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={id ? t('addEditBill.editTitle') : t('addEditBill.newTitle')}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          <Paper
            component="form" onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            {/* ══ BILL INFORMATION ═══════════════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  {t('addEditBill.billInfo')}
                </Typography>
              </Box>

              <FormInput label="Bill Number" required name="bill_number" value={form.bill_number} onChange={handleChange}
                sx={{ maxWidth: 240 }} />

              <FormSelect label="Vendor" required name="vendor_id" value={form.vendor_id} onChange={handleChange}
                options={vendors.map(v => ({ value: v.id, label: v.vendor_name }))} width={300} />

              <FormDatePicker label="Bill Date" required name="bill_date" value={form.bill_date} onChange={handleChange} />

              <FormDatePicker label="Due Date" name="due_date" value={form.due_date} onChange={handleChange} />

              <FormInput label="Subject" noDivider name="subject" value={form.subject} onChange={handleChange} />
            </Box>

            {/* ══ ITEMS & EXPENSES (TABS) ═══════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: `1px solid ${C.divider}` }}>
                <Tab label="Items" />
                <Tab label="Expenses" />
              </Tabs>

              {/* Items Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Items</Typography>
                  <Button startIcon={<AddIcon />} onClick={addItem} size="small" sx={{ textTransform: 'none' }}>
                    Add Item
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Tax %</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              value={item.item_name}
                              onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                              size="small" fullWidth sx={fieldSx}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number" value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              size="small" sx={{ ...fieldSx, width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number" value={item.rate}
                              onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                              size="small" sx={{ ...fieldSx, width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number" value={item.tax}
                              onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                              size="small" sx={{ ...fieldSx, width: 80 }}
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
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Expenses</Typography>
                  <Button startIcon={<AddIcon />} onClick={addExpense} size="small" sx={{ textTransform: 'none' }}>
                    Add Expense
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Expense Name</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary">No expenses added</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        form.expenses.map((expense, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                value={expense.expense_name}
                                onChange={(e) => handleExpenseChange(index, 'expense_name', e.target.value)}
                                size="small" fullWidth sx={fieldSx}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number" value={expense.amount}
                                onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                                size="small" sx={{ ...fieldSx, width: 120 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={expense.description}
                                onChange={(e) => handleExpenseChange(index, 'description', e.target.value)}
                                size="small" fullWidth sx={fieldSx}
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

            {/* ══ TOTALS SUMMARY ════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}`, py: 2 }}>
              <Box sx={{ maxWidth: 320, ml: 'auto' }}>
                {[
                  ['Subtotal', form.subtotal],
                  ['CGST', form.cgst_amount],
                  ['SGST', form.sgst_amount],
                  ['Total Tax', form.total_tax],
                ].map(([label, value]) => (
                  <Box key={label} display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">{label}:</Typography>
                    <Typography variant="body2" fontWeight={600}>₹{(value || 0).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Box display="flex" justifyContent="space-between" mt={1.5} pt={1.5} sx={{ borderTop: `2px solid ${C.divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Total Amount:</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'primary.main' }}>
                    ₹{(form.total_amount || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="body2" color="success.main">Amount Paid:</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">₹{(form.amount_paid || 0).toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="body2" color="error.main">Balance Due:</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">₹{(form.balance_due || 0).toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* ══ STATUS & NOTES ═══════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Status & Notes
                </Typography>
              </Box>

              <FormSelect label="Payment Status" name="payment_status" value={form.payment_status} onChange={handleChange}
                options={['Unpaid', 'Partially Paid', 'Paid', 'Overdue'].map(s => ({ value: s, label: s }))} width={220} />

              <FormInput label="Notes" noDivider name="notes" value={form.notes} onChange={handleChange}
                multiline rows={3} placeholder="Add any internal notes about this bill…" />
            </Box>

            {/* ══ FOOTER ════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/bills')} disabled={saving} sx={cancelBtnSx}>
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {saving ? 'Saving…' : id ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditBill;
