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
    <MainLayout title={invoiceId ? "Edit Invoice" : "Create New Invoice"} subtitle={invoiceId ? "Update invoice details below" : "Fill in the invoice information"}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Main Content Card */}
        <Card elevation={0} sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1,
          maxWidth: 1000,
          mx: 'auto'
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
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                    {invoiceId ? "Edit Invoice" : "Create New Invoice"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {invoiceId ? "Update invoice details below" : "Fill in the invoice information"}
                  </Typography>
                </Box>
              </Box>
            </Box>

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

            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              {/* Basic Information Section */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    Basic Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Invoice Number"
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
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Customer</InputLabel>
                        <Select
                          label="Customer"
                          name="customer_id"
                          value={form.customer_id}
                          onChange={handleChange}
                          required
                          startAdornment={
                            <InputAdornment position="start">
                              <PersonIcon fontSize="small" color="action" />
                            </InputAdornment>
                          }
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }}
                        >
                          <MenuItem value="">Select Customer</MenuItem>
                          {customers.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Issue Date"
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Payment Terms"
                        name="payment_terms"
                        value={form.payment_terms}
                        onChange={handleChange}
                        fullWidth
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
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Invoice Type</InputLabel>
                        <Select
                          label="Invoice Type"
                          name="invoice_type"
                          value={form.invoice_type}
                          onChange={handleChange}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
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

              {/* Financial Details Section */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon color="primary" />
                    Financial Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Subtotal"
                        name="subtotal"
                        type="number"
                        value={form.subtotal}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon fontSize="small" color="action" />
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
                    <Grid item xs={12} md={6}>
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
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  </Grid>

                  {/* Tax Details - Collapsible Accordion */}
                  <Accordion
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: 'grey.300'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <PercentIcon color="action" fontSize="small" />
                        <Typography fontWeight={600}>Tax Breakdown</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="CGST Amount"
                            name="cgst_amount"
                            type="number"
                            value={form.cgst_amount}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
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
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="SGST Amount"
                            name="sgst_amount"
                            type="number"
                            value={form.sgst_amount}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
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
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="IGST Amount"
                            name="igst_amount"
                            type="number"
                            value={form.igst_amount}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
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
                    </AccordionDetails>
                  </Accordion>

                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Total Tax"
                        name="total_tax"
                        value={form.total_tax}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <PercentIcon fontSize="small" color="success" />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                        helperText="Auto-calculated"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'success.50',
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(16,185,129,0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Total Amount"
                        name="total_amount"
                        value={form.total_amount}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon fontSize="small" color="success" />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                        helperText="Auto-calculated"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'success.50',
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(16,185,129,0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Balance Due"
                        name="balance_due"
                        value={form.balance_due}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon fontSize="small" color="warning" />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                        helperText="Auto-calculated"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'warning.50',
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(245,158,11,0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment Information Section */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon color="primary" />
                    Payment Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Amount Paid"
                        name="amount_paid"
                        type="number"
                        value={form.amount_paid}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon fontSize="small" color="action" />
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
                    <Grid item xs={12} md={4}>
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
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                            }
                          }}
                        >
                          {statusOptions.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Payment Mode"
                        name="payment_mode"
                        value={form.payment_mode}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaymentIcon fontSize="small" color="action" />
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

              {/* Additional Information - Collapsible */}
              <Accordion
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <NotesIcon color="action" fontSize="small" />
                    <Typography fontWeight={600}>Additional Information</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Notes"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
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
                        rows={3}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
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
                </AccordionDetails>
              </Accordion>

              {/* Action Buttons */}
              <Box display="flex" justifyContent="flex-end" gap={2} pt={2} borderTop="1px solid" borderColor="grey.200">
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
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default AddEditInvoice;
