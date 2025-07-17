import React, { useEffect, useState } from "react";
import {
  getInvoices,
  deleteInvoice,
} from "../services/invoiceService";
import "./InvoiceList.css";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import axios from "axios";
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

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

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError("Failed to fetch invoices");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    // Fetch customers for dropdown
    axios.get("http://127.0.0.1:5000/api/customers").then(res => setCustomers(res.data)).catch(() => setCustomers([]));
    // Optionally, fetch next invoice number
    axios.get("http://127.0.0.1:5000/api/invoices/next-number").then(res => setForm(f => ({ ...f, invoice_number: res.data.invoice_number }))).catch(() => {});
  }, []);

  // Calculate fields
  useEffect(() => {
    const total_tax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const total_amount = Number(form.subtotal || 0) + total_tax;
    const balance_due = total_amount - Number(form.amount_paid || 0);
    setForm(f => ({ ...f, total_tax, total_amount, balance_due }));
    // eslint-disable-next-line
  }, [form.subtotal, form.cgst_amount, form.sgst_amount, form.igst_amount, form.amount_paid]);

  const handleEdit = (invoice) => {
    navigate(`/invoices/edit/${invoice.id}`);
  };

  const handleAdd = () => {
    navigate("/invoices/add");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    setLoading(true);
    try {
      await deleteInvoice(id);
      fetchInvoices();
    } catch (err) {
      setError("Failed to delete invoice");
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/generate-invoice-pdf",
        { invoice },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoice_number || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
    }
  };

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <Box sx={{ flex: 1, bgcolor: '#f5f6fa', minHeight: 'calc(100vh - 128px)', p: 3 }}>
            <Paper elevation={2} sx={{ width: '95%', mx: 0, p: 4, mb: 4, borderRadius: 3, overflow: 'visible' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  Customer Invoices
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAdd}
                  sx={{ fontWeight: 600 }}
                >
                  + Add Invoice
                </Button>
              </Box>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TableContainer sx={{ maxWidth: '100%', overflowX: { xs: 'auto', md: 'visible' } }}>
                <Table sx={{ minWidth: 650, width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv) => {
                      const customer = customers.find(c => c.id === inv.customer_id);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.invoice_number}</TableCell>
                          <TableCell>{customer ? customer.name : inv.customer_id}</TableCell>
                          <TableCell>{inv.invoice_type}</TableCell>
                          <TableCell>₹ {inv.total_amount}</TableCell>
                          <TableCell>{inv.due_date}</TableCell>
                          <TableCell>{inv.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{ mr: 1, fontWeight: 500 }}
                              onClick={() => handleEdit(inv)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              sx={{ mr: 1, fontWeight: 500 }}
                              onClick={() => handleDownloadPDF(inv)}
                            >
                              Download PDF
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              sx={{ fontWeight: 500 }}
                              onClick={() => handleDelete(inv.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {loading && (
                  <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                    <CircularProgress />
                  </Box>
                )}
              </TableContainer>
            </Paper>
          </Box>
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default InvoiceList;
