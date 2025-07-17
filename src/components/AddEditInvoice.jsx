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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import "./AddEditInvoice.css";

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
    <Box className="add-edit-invoice-root">
      <Header />
      <Box className="add-edit-invoice-main">
        <Sidebar />
        <Box className="add-edit-invoice-content">
          <Paper elevation={3} className="add-edit-invoice-card add-edit-invoice-card-fullwidth">
            <Typography variant="h5" className="add-edit-invoice-title">
              {invoiceId ? "Edit" : "Add"} Invoice
            </Typography>
            <Divider className="add-edit-invoice-divider" />
            {error && <Alert severity="error" className="add-edit-invoice-alert">{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} autoComplete="off" className="add-edit-invoice-form">
              <Grid container spacing={3}>
                {/* Row 1 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
                    <TextField
                      label="Invoice Number"
                      name="invoice_number"
                      value={form.invoice_number}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />
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
                  </div>
                </Grid>
                {/* Row 2 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
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
                  </div>
                </Grid>
                {/* Row 3 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
                    <TextField
                      label="Payment Terms"
                      name="payment_terms"
                      value={form.payment_terms}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
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
                  </div>
                </Grid>
                {/* Row 4 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
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
                  </div>
                </Grid>
                {/* Row 5 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
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
                    <TextField
                      label="Total Tax"
                      name="total_tax"
                      value={form.total_tax}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </Grid>
                {/* Row 6 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
                    <TextField
                      label="Total Amount"
                      name="total_amount"
                      value={form.total_amount}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      margin="normal"
                    />
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
                  </div>
                </Grid>
                {/* Row 7 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
                    <TextField
                      label="Balance Due"
                      name="balance_due"
                      value={form.balance_due}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      margin="normal"
                    />
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
                  </div>
                </Grid>
                {/* Row 8 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
                    <TextField
                      label="Payment Mode"
                      name="payment_mode"
                      value={form.payment_mode}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                    />
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
                  </div>
                </Grid>
                {/* Row 9 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
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
                  </div>
                </Grid>
                {/* Row 10 */}
                <Grid item xs={12} sm={12}>
                  <div className="invoice-form-row">
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
                  </div>
                </Grid>
                {/* Actions */}
                <Grid item xs={12}>
                  <Box className="add-edit-invoice-actions">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={loading && <CircularProgress size={18} color="inherit" />}
                      className="add-edit-invoice-btn add-edit-invoice-btn-primary"
                    >
                      {invoiceId ? "Update" : "Add"} Invoice
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={() => { if (onCancel) onCancel(); navigate("/invoices"); }}
                      className="add-edit-invoice-btn add-edit-invoice-btn-cancel"
                    >
                      Cancel
                    </Button>
                  </Box>
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
