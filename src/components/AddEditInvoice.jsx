import React, { useEffect, useState } from "react";
import axios from "axios";
import { createInvoice, updateInvoice } from "../services/invoiceService";
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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";

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

const AddEditInvoice = ({ onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/customers").then(res => {
      setCustomers(res.data);
      if (!invoiceId) {
        axios.get("http://127.0.0.1:5000/api/invoices/next-number").then(nextRes => {
          setForm({ ...getRandomInvoice(res.data), invoice_number: nextRes.data.next_invoice_number });
        }).catch(() => {
          setForm(getRandomInvoice(res.data));
        });
      } else {
        // Edit mode: fetch invoice and set form
        axios.get(`http://127.0.0.1:5000/api/invoices/${invoiceId}`).then(res2 => setForm(res2.data)).catch(() => {});
      }
    }).catch(() => setCustomers([]));
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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, bgcolor: '#f5f6fa', minHeight: 'calc(100vh - 128px)', p: 3 }}>
          <Paper elevation={3} sx={{ width: '100%', mx: 0, p: 4, mb: 4, borderRadius: 3, overflowX: 'auto' }}>
            <Typography variant="h5" fontWeight={700} mb={2} color="primary.main">
              {invoiceId ? "Edit" : "Add"} Invoice
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                {/* Row 1 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Invoice Number"
                    name="invoice_number"
                    value={form.invoice_number}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Customer</InputLabel>
                    <Select
                      label="Customer"
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="">Select Customer</MenuItem>
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Row 2 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Issue Date"
                    name="issue_date"
                    type="date"
                    value={form.issue_date}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
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
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/* Row 3 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Payment Terms"
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Subtotal"
                    name="subtotal"
                    type="number"
                    value={form.subtotal}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                {/* Row 4 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="CGST Amount"
                    name="cgst_amount"
                    type="number"
                    value={form.cgst_amount}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SGST Amount"
                    name="sgst_amount"
                    type="number"
                    value={form.sgst_amount}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                {/* Row 5 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="IGST Amount"
                    name="igst_amount"
                    type="number"
                    value={form.igst_amount}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Tax"
                    name="total_tax"
                    value={form.total_tax}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                {/* Row 6 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Amount"
                    name="total_amount"
                    value={form.total_amount}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Amount Paid"
                    name="amount_paid"
                    type="number"
                    value={form.amount_paid}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                {/* Row 7 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Balance Due"
                    name="balance_due"
                    value={form.balance_due}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Row 8 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Payment Mode"
                    name="payment_mode"
                    value={form.payment_mode}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Invoice Type</InputLabel>
                    <Select
                      label="Invoice Type"
                      name="invoice_type"
                      value={form.invoice_type}
                      onChange={handleChange}
                    >
                      {invoiceTypeOptions.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Row 9 */}
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
                <Grid item xs={12} md={6}></Grid>
                {/* Row 10: Notes and Terms & Conditions */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Terms & Conditions"
                    name="terms_conditions"
                    value={form.terms_conditions}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={2}
                  />
                </Grid>
                {/* Actions */}
                <Grid item xs={12} display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ minWidth: 140, mr: 2 }}
                    startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  >
                    {invoiceId ? "Update" : "Add"} Invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => { if (onCancel) onCancel(); navigate("/invoices"); }}
                    sx={{ minWidth: 120 }}
                  >
                    Cancel
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

export default AddEditInvoice;
