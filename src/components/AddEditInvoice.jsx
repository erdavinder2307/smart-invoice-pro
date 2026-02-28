import React, { useEffect, useState } from "react";
import axios from "axios";
import { createInvoice, updateInvoice } from "../services/invoiceService";
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
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import PaymentIcon from '@mui/icons-material/Payment';
import NotesIcon from '@mui/icons-material/Notes';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const statusOptions = ["Draft", "Issued", "Paid", "Overdue", "Cancelled"];
const invoiceTypeOptions = ["Tax Invoice", "Proforma", "Credit Note"];

const initialForm = {
  invoice_number: "",
  customer_id: "",
  issue_date: "",
  due_date: "",
  payment_terms: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  amount_paid: 0,
  balance_due: 0,
  status: "Draft",
  payment_mode: "",
  notes: "",
  terms_conditions: "",
  is_gst_applicable: false,
  invoice_type: "Tax Invoice",
  subject: "",
  salesperson: "",
  items: [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const AddEditInvoice = ({ onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRandomInvoice = (customers) => {
    const paymentTerms = ["Net 7", "Net 15", "Net 30", "Due on Receipt"];
    const paymentModes = ["Bank Transfer", "Cash", "Credit Card", "UPI"];
    const notesArr = ["Thank you for your business!", "Payment due as per terms.", "Contact us for any queries."];
    const termsArr = ["Payment due in 15 days.", "Late fee applies after due date.", "No returns after 30 days."];
    const today = new Date();
    const issueDate = today.toISOString().slice(0, 10);
    const dueDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const subtotal = Math.floor(Math.random() * 9000) + 1000;
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const igst = 0;
    const amountPaid = Math.random() > 0.5 ? Math.floor(subtotal / 2) : 0;
    const customer = customers.length ? customers[Math.floor(Math.random() * customers.length)] : { id: "" };
    return {
      invoice_number: "INV-" + Math.floor(1000 + Math.random() * 9000),
      customer_id: customer.id,
      issue_date: issueDate,
      due_date: dueDate,
      payment_terms: paymentTerms[Math.floor(Math.random() * paymentTerms.length)],
      subtotal,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      total_tax: cgst + sgst + igst,
      total_amount: subtotal + cgst + sgst + igst,
      amount_paid: amountPaid,
      balance_due: subtotal + cgst + sgst + igst - amountPaid,
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      payment_mode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
      notes: notesArr[Math.floor(Math.random() * notesArr.length)],
      terms_conditions: termsArr[Math.floor(Math.random() * termsArr.length)],
      is_gst_applicable: true,
      invoice_type: invoiceTypeOptions[Math.floor(Math.random() * invoiceTypeOptions.length)],
    };
  };

  useEffect(() => {
    axios.get(createApiUrl("/api/customers")).then(res => {
      setCustomers(res.data);
      if (!invoiceId) {
        // Always show random dummy data for testing/debugging, but preserve next invoice number logic
        axios.get(createApiUrl("/api/invoices/next-number")).then(nextRes => {
          setForm({ ...getRandomInvoice(res.data), invoice_number: nextRes.data.next_invoice_number });
        }).catch(() => {
          setForm(getRandomInvoice(res.data));
        });
      } else {
        axios.get(createApiUrl(`/api/invoices/${invoiceId}`)).then(res2 => setForm(res2.data));
      }
    });
  }, [invoiceId]);

  useEffect(() => {
    const total_tax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const total_amount = Number(form.subtotal || 0) + total_tax;
    const balance_due = total_amount - Number(form.amount_paid || 0);
    setForm(f => ({ ...f, total_tax, total_amount, balance_due }));
    // eslint-disable-next-line
  }, [form.subtotal, form.cgst_amount, form.sgst_amount, form.igst_amount, form.amount_paid]);

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
    try {
      if (invoiceId) {
        await updateInvoice(invoiceId, form);
      } else {
        await createInvoice(form);
      }
      if (onSuccess) onSuccess();
      navigate("/invoices");
    } catch (err) {
      setError("Failed to save invoice");
    }
    setLoading(false);
  };


  return (
    <MainLayout 
      title={invoiceId ? "Edit Invoice" : "Create New Invoice"} 
      subtitle={invoiceId ? "Update invoice details below" : "Fill in the invoice information"}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header Section with Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{
            bgcolor: 'primary.main',
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <ReceiptIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {invoiceId ? "Edit Invoice" : "Create New Invoice"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {invoiceId ? "Update the invoice details" : "Create a new invoice for your customer"}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-icon': { fontSize: 24 } }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          {/* Section 1: Invoice Header */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Invoice Header
              </Typography>
              <Grid container spacing={2.5}>
                {/* Row 1: Customer + Invoice Number + Status */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Customer</InputLabel>
                    <Select
                      label="Customer"
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(102,126,234,0.1)' }
                      }}
                    >
                      <MenuItem value="">Select Customer</MenuItem>
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Invoice #"
                    name="invoice_number"
                    value={form.invoice_number}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                        '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(102,126,234,0.1)' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(102,126,234,0.1)' }
                      }}
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Row 2: Invoice Date + Payment Terms + Due Date + Salesperson */}
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Invoice Date"
                    name="issue_date"
                    type="date"
                    value={form.issue_date}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Payment Terms"
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., Net 30"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Due Date"
                    name="due_date"
                    type="date"
                    value={form.due_date}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Salesperson"
                    name="salesperson"
                    value={form.salesperson}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                {/* Row 3: Subject (Full Width) */}
                <Grid item xs={12}>
                  <TextField
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    fullWidth
                    placeholder="What is this invoice for?"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Main Content Column (Left) */}
            <Grid item xs={12} md={8}>
              {/* Section 2: Item Table */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    Line Items
                  </Typography>
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Qty</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Rate (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Discount</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Tax %</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Amount (₹)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', width: 40 }}>Action</TableCell>
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
                                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                sx={{ '& input': { textAlign: 'center', fontSize: '0.875rem' } }}
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
                                sx={{ fontSize: '0.875rem' }}
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
                                sx={{ fontSize: '0.875rem' }}
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
                                sx={{ fontSize: '0.875rem' }}
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

              {/* Section 3 Left: Notes & Attachments */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="primary" />
                    Notes & Attachments
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <NotesIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
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
                        placeholder="Payment due as per terms specified..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <DescriptionIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&:hover': { bgcolor: 'grey.100' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Column (Right) */}
            <Grid item xs={12} md={4}>
              {/* Section 2 Right: Summary Card */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', position: 'sticky', top: 20 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon color="primary" />
                    Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Subtotal */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="subtotal"
                          value={form.subtotal}
                          onChange={handleChange}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>₹</Typography>
                      </Box>
                    </Box>

                    {/* Tax */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="body2" color="text.secondary">Tax</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={form.total_tax}
                          InputProps={{ readOnly: true }}
                          sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'success.50',
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>₹</Typography>
                      </Box>
                    </Box>

                    {/* Adjustment */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="body2" color="text.secondary">Adjustment</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          placeholder="0.00"
                          defaultValue={0}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>₹</Typography>
                      </Box>
                    </Box>

                    {/* Total (Bold) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, bgcolor: 'primary.50', px: 2, borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight={700}>Total</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="total_amount"
                          value={form.total_amount}
                          onChange={handleChange}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 700
                            }
                          }}
                        />
                        <Typography variant="body1" fontWeight={700}>₹</Typography>
                      </Box>
                    </Box>

                    {/* Amount Paid */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, pb: 1.5, borderTop: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="amount_paid"
                          value={form.amount_paid}
                          onChange={handleChange}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>₹</Typography>
                      </Box>
                    </Box>

                    {/* Balance Due (Highlighted) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, px: 2, py: 1.5, bgcolor: 'warning.50', borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight={700} color="warning.dark">Balance Due</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          name="balance_due"
                          value={form.balance_due}
                          onChange={handleChange}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            width: 120,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 700
                            }
                          }}
                        />
                        <Typography variant="body1" fontWeight={700}>₹</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Tax & Payment Information */}
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PercentIcon color="primary" />
                    Tax & Payment
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.is_gst_applicable}
                            onChange={handleChange}
                            name="is_gst_applicable"
                            color="primary"
                          />
                        }
                        label="GST Applicable"
                      />
                    </Grid>
                    {form.is_gst_applicable && (
                      <>
                        <Grid item xs={6}>
                          <TextField
                            label="CGST %"
                            size="small"
                            type="number"
                            value={form.cgst_amount}
                            onChange={(e) => setForm({ ...form, cgst_amount: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="SGST %"
                            size="small"
                            type="number"
                            value={form.sgst_amount}
                            onChange={(e) => setForm({ ...form, sgst_amount: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="IGST %"
                            size="small"
                            type="number"
                            value={form.igst_amount}
                            onChange={(e) => setForm({ ...form, igst_amount: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <TextField
                        label="Payment Mode"
                        size="small"
                        name="payment_mode"
                        value={form.payment_mode}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Bank Transfer, Cash, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Invoice Type</InputLabel>
                        <Select
                          label="Invoice Type"
                          name="invoice_type"
                          value={form.invoice_type}
                          onChange={handleChange}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            fontSize: '0.875rem'
                          }}
                        >
                          {invoiceTypeOptions.map((t) => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={2} 
            pt={3} 
            sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', zIndex: 10, borderTop: '1px solid', borderColor: 'grey.200', px: 3, py: 2, borderRadius: '0 0 3px 3px' }}
          >
            <Button
              type="button"
              variant="outlined"
              size="large"
              startIcon={<CancelIcon />}
              onClick={() => { if (onCancel) onCancel(); navigate("/invoices"); }}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
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
              {invoiceId ? "Update" : "Create"} Invoice
            </Button>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default AddEditInvoice;
