import React, { useEffect, useState } from "react";
import { getInvoices, deleteInvoice } from "../services/invoiceService";
import { createApiUrl } from "../config/api";
import "./InvoiceList.css";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
import SectionHeader from "./common/SectionHeader";
import StandardDataTable from "./common/StandardDataTable";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  TableCell,
  TableRow,
  CircularProgress,
  Alert,
  Checkbox,
  Chip,
  InputAdornment,
  TextField,
  Fade,
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
  FormControl,
  Select,
  Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import SendIcon from '@mui/icons-material/Send';
import PayNowModal from "./PayNowModal";
import { useAuth } from "../context/AuthContext";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [payNowOpen, setPayNowOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Approval-specific state
  const [rejectDialog, setRejectDialog] = useState({ open: false, invoiceId: null, reason: '' });
  const [approvalToast, setApprovalToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user, canApprove } = useAuth();

  const filteredInvoices = invoices.filter((invoice) => {
    const customer = customers.find((c) => c.id === invoice.customer_id);
    const customerName = customer ? customer.name : "";

    const matchesSearch =
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginated invoices
  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const activeInvoice = invoices.find((invoice) => invoice.id === activeInvoiceId) || null;
  const activeCustomer = activeInvoice
    ? customers.find((customer) => customer.id === activeInvoice.customer_id)
    : null;

  // Calculate summary metrics
  const totalOutstanding = invoices
    .filter((inv) => inv.status?.toLowerCase() !== "paid")
    .reduce((sum, inv) => sum + (inv.balance_due || inv.total_amount || 0), 0);

  const dueToday = invoices.filter((inv) => {
    const today = new Date().toISOString().split("T")[0];
    return inv.due_date === today && inv.status?.toLowerCase() !== "paid";
  }).length;

  const dueWithin30Days = invoices.filter((inv) => {
    if (inv.status?.toLowerCase() === "paid") return false;
    const today = new Date();
    const dueDate = new Date(inv.due_date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const overdueCount = invoices.filter(
    (inv) => inv.status?.toLowerCase() === "overdue"
  ).length;

  const avgDaysToGetPaid = invoices.length > 0 ? Math.floor(Math.random() * 15) + 10 : 0; // Mock data

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
    axios.get(createApiUrl("/api/customers")).then(res => setCustomers(res.data)).catch(() => setCustomers([]));
    // Optionally, fetch next invoice number
    axios.get(createApiUrl("/api/invoices/next-number")).then(res => setForm(f => ({ ...f, invoice_number: res.data.invoice_number }))).catch(() => { });
  }, []);

  useEffect(() => {
    if (!filteredInvoices.length) {
      setActiveInvoiceId(null);
      return;
    }

    const activeExists = filteredInvoices.some((invoice) => invoice.id === activeInvoiceId);
    if (!activeExists) {
      setActiveInvoiceId(filteredInvoices[0].id);
    }
  }, [filteredInvoices, activeInvoiceId]);

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
    setLoading(true);
    try {
      await deleteInvoice(id);
      fetchInvoices();
      setConfirmDeleteId(null);
    } catch (err) {
      setError("Failed to delete invoice");
    }
    setLoading(false);
  };

  const handleActionMenuOpen = (event, invoice) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleSelectInvoice = (invoice) => {
    setActiveInvoiceId(invoice.id);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedInvoice(null);
  };

  const handleCopyPortalLink = async (invoice) => {
    let token = invoice.portal_token;
    if (!token) {
      // Generate one on demand for legacy invoices
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await axios.post(
          createApiUrl(`/api/invoices/${invoice.id}/generate-portal-token`),
          {},
          { headers: { 'X-User-Id': storedUser.id || '' } }
        );
        token = res.data.portal_token;
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, portal_token: token } : inv));
      } catch {
        setError('Could not generate portal link. Please try again.');
        return;
      }
    }
    const link = `${window.location.origin}/portal/invoice/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3500);
    });
  };

  // ── Approval actions ──────────────────────────────────────────────────────
  const handleSubmitForApproval = async (invoice) => {
    try {
      await axios.post(
        createApiUrl(`/api/invoices/${invoice.id}/submit-for-approval`),
        {},
        { headers: { 'X-User-Id': user?.id || '' } }
      );
      setApprovalToast({ open: true, message: 'Invoice submitted for approval.', severity: 'info' });
      fetchInvoices();
    } catch (err) {
      setApprovalToast({ open: true, message: err.response?.data?.error || 'Submit failed.', severity: 'error' });
    }
  };

  const handleApproveInvoice = async (invoice) => {
    try {
      await axios.post(
        createApiUrl(`/api/invoices/${invoice.id}/approve`),
        {},
        { headers: { 'X-User-Id': user?.id || '' } }
      );
      setApprovalToast({ open: true, message: 'Invoice approved and set to Issued.', severity: 'success' });
      fetchInvoices();
    } catch (err) {
      setApprovalToast({ open: true, message: err.response?.data?.error || 'Approval failed.', severity: 'error' });
    }
  };

  const handleRejectConfirm = async () => {
    const { invoiceId, reason } = rejectDialog;
    try {
      await axios.post(
        createApiUrl(`/api/invoices/${invoiceId}/reject`),
        { reason },
        { headers: { 'X-User-Id': user?.id || '' } }
      );
      setApprovalToast({ open: true, message: 'Invoice rejected and returned to Draft.', severity: 'warning' });
      setRejectDialog({ open: false, invoiceId: null, reason: '' });
      fetchInvoices();
    } catch (err) {
      setApprovalToast({ open: true, message: err.response?.data?.error || 'Rejection failed.', severity: 'error' });
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const response = await axios.post(
        createApiUrl("/api/generate-invoice-pdf"),
        { invoice },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoice.invoice_number || "invoice"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedInvoices(paginatedInvoices.map((inv) => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  // Handle individual checkbox
  const handleSelectOne = (invoiceId) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const invoiceColumns = [
    {
      key: "select",
      label: (
        <Checkbox
          indeterminate={
            selectedInvoices.length > 0 &&
            selectedInvoices.length < paginatedInvoices.length
          }
          checked={
            paginatedInvoices.length > 0 &&
            selectedInvoices.length === paginatedInvoices.length
          }
          onChange={handleSelectAll}
        />
      ),
      width: 42,
    },
    { key: "date", label: "Date" },
    { key: "invoice", label: "Invoice #" },
    { key: "order", label: "Order Number" },
    { key: "customer", label: "Customer Name" },
    { key: "status", label: "Status" },
    { key: "due", label: "Due Date" },
    { key: "amount", label: "Amount", align: "right" },
    { key: "balance", label: "Balance Due", align: "right" },
    { key: "actions", label: "Actions", align: "center" },
  ];

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;


  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title="All Invoices"
            subtitle="Track and manage all customer invoices and payments"
            primaryAction={{
              label: "New Invoice",
              icon: <AddIcon />,
              onClick: handleAdd,
            }}
            sx={{ mb: 3 }}
          />

          {/* Payment Summary Strip */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              bgcolor: "background.paper"
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Payment Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  label="Outstanding Receivables"
                  value={`₹${totalOutstanding.toLocaleString()}`}
                  icon={<AttachMoneyIcon />}
                  accentColor="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <SummaryCard
                  label="Due Today"
                  value={dueToday}
                  icon={<TodayIcon />}
                  accentColor="warning.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <SummaryCard
                  label="Due Within 30 Days"
                  value={dueWithin30Days}
                  icon={<DateRangeIcon />}
                  accentColor="info.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <SummaryCard
                  label="Overdue"
                  value={overdueCount}
                  icon={<ErrorIcon />}
                  accentColor="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  label="Avg Days to Get Paid"
                  value={`${avgDaysToGetPaid} days`}
                  icon={<AccessTimeIcon />}
                  accentColor="success.main"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Filters and Search */}
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            alignItems="center"
            sx={{
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200"
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{
                flex: 1,
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </Box>

        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={2.2}>
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "grey.200",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "grey.200", bgcolor: "grey.50" }}>
                <Typography variant="subtitle1" fontWeight={700}>Invoices</Typography>
                <Typography variant="caption" color="text.secondary">Click any invoice to preview details</Typography>
              </Box>

              <StandardDataTable
                columns={invoiceColumns}
                rows={paginatedInvoices}
                loading={loading}
                emptyMessage={searchTerm || statusFilter !== "All" ? "No invoices found" : "No invoices yet"}
                pagination={{
                  rowsPerPageOptions: [10, 25, 50],
                  count: filteredInvoices.length,
                  rowsPerPage,
                  page,
                  onPageChange: handleChangePage,
                  onRowsPerPageChange: handleChangeRowsPerPage,
                }}
                renderRow={(invoice) => {
                  const customer = customers.find((c) => c.id === invoice.customer_id);
                  const isActive = invoice.id === activeInvoiceId;

                  return (
                    <TableRow
                      key={invoice.id}
                      hover
                      onClick={() => handleSelectInvoice(invoice)}
                      sx={{
                        "&:hover": { bgcolor: "grey.50" },
                        cursor: "pointer",
                        bgcolor: isActive ? "rgba(26, 115, 232, 0.08)" : "transparent",
                      }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectOne(invoice.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{invoice.issue_date || "—"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {invoice.invoice_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {invoice.order_number || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {customer ? customer.name : `Customer #${invoice.customer_id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status || "Draft"} />
                        {invoice.status === 'Pending Approval' && (
                          <Chip
                            label="Pending"
                            size="small"
                            color="warning"
                            icon={<HourglassEmptyIcon />}
                            sx={{ ml: 0.5, fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{invoice.due_date || "—"}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₹{invoice.total_amount?.toLocaleString() || "0"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={invoice.balance_due > 0 ? "error.main" : "success.main"}
                        >
                          ₹{invoice.balance_due?.toLocaleString() || "0"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenuOpen(e, invoice)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "grey.200",
                minHeight: 620,
                overflow: "hidden",
              }}
            >
              {!activeInvoice ? (
                <Box sx={{ p: 5, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Invoice Selected</Typography>
                  <Typography variant="body2" color="text.secondary">Choose an invoice from the left list to see details here.</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.200", bgcolor: "grey.50" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{activeInvoice.invoice_number || `INV-${activeInvoice.id}`}</Typography>
                        <Typography variant="body2" color="text.secondary">{activeCustomer?.name || `Customer #${activeInvoice.customer_id}`}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StatusBadge status={activeInvoice.status || "Draft"} />
                        <Button size="small" variant="outlined" onClick={() => handleEdit(activeInvoice)} sx={{ textTransform: "none" }}>
                          Edit
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => handleDownloadPDF(activeInvoice)} sx={{ textTransform: "none" }}>
                          PDF
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Invoice Date</Typography>
                        <Typography variant="body2" fontWeight={600}>{activeInvoice.issue_date || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Due Date</Typography>
                        <Typography variant="body2" fontWeight={600}>{activeInvoice.due_date || "—"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Payment Terms</Typography>
                        <Typography variant="body2" fontWeight={600}>{activeInvoice.payment_terms || "—"}</Typography>
                      </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2.5 }}>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", px: 2, py: 1, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "grey.200" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Item</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textAlign: "right" }}>Qty</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textAlign: "right" }}>Amount</Typography>
                      </Box>

                      {(activeInvoice.items || []).length ? (
                        activeInvoice.items.map((item, index) => (
                          <Box
                            key={`${activeInvoice.id}-${index}`}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1.8fr 1fr 1fr",
                              px: 2,
                              py: 1.1,
                              borderBottom: index === activeInvoice.items.length - 1 ? "none" : "1px solid",
                              borderColor: "grey.100",
                            }}
                          >
                            <Typography variant="body2">{item.name || "Untitled Item"}</Typography>
                            <Typography variant="body2" sx={{ textAlign: "right" }}>{item.quantity || 0}</Typography>
                            <Typography variant="body2" sx={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0))}</Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
                          No line items available for preview.
                        </Typography>
                      )}
                    </Paper>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={7}>
                        <Typography variant="caption" color="text.secondary">Notes</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                          {activeInvoice.notes || "No customer notes"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.8 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(activeInvoice.subtotal)}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Tax</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(activeInvoice.total_tax)}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Paid</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(activeInvoice.amount_paid)}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid", borderColor: "grey.200" }}>
                            <Typography variant="subtitle2" fontWeight={700}>Balance Due</Typography>
                            <Typography variant="subtitle2" fontWeight={700} color={Number(activeInvoice.balance_due || 0) > 0 ? "error.main" : "success.main"}>
                              {formatCurrency(activeInvoice.balance_due || activeInvoice.total_amount)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: 3
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleEdit(selectedInvoice);
            handleActionMenuClose();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit Invoice" />
        </MenuItem>
        {selectedInvoice && selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Cancelled' && (
          <MenuItem
            onClick={() => {
              setPayNowOpen(true);
              handleActionMenuClose();
            }}
            sx={{ py: 1.25 }}
          >
            <ListItemIcon>
              <PaymentIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Pay Now" secondary="Online via Zoho Payments" />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleDownloadPDF(selectedInvoice);
            handleActionMenuClose();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary="Download PDF" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCopyPortalLink(selectedInvoice);
            handleActionMenuClose();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <LinkIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Copy Portal Link" secondary="Share with customer" />
        </MenuItem>
        {/* ── Approval actions ─────────────────────────────────────────── */}
        {selectedInvoice?.status === 'Draft' && (
          <MenuItem
            onClick={() => {
              handleSubmitForApproval(selectedInvoice);
              handleActionMenuClose();
            }}
            sx={{ py: 1.25 }}
          >
            <ListItemIcon><SendIcon fontSize="small" color="info" /></ListItemIcon>
            <ListItemText primary="Submit for Approval" />
          </MenuItem>
        )}
        {selectedInvoice?.status === 'Pending Approval' && canApprove && (
          <MenuItem
            onClick={() => {
              handleApproveInvoice(selectedInvoice);
              handleActionMenuClose();
            }}
            sx={{ py: 1.25, color: 'success.main' }}
          >
            <ListItemIcon><ThumbUpAltIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText primary="Approve" />
          </MenuItem>
        )}
        {selectedInvoice?.status === 'Pending Approval' && canApprove && (
          <MenuItem
            onClick={() => {
              setRejectDialog({ open: true, invoiceId: selectedInvoice.id, reason: '' });
              handleActionMenuClose();
            }}
            sx={{ py: 1.25, color: 'error.main' }}
          >
            <ListItemIcon><ThumbDownAltIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary="Reject" />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setConfirmDeleteId(selectedInvoice.id);
            handleActionMenuClose();
          }}
          sx={{ py: 1.25, color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Invoice" />
        </MenuItem>
      </Menu>

      {/* Pay Now Modal */}
      <PayNowModal
        open={payNowOpen}
        onClose={() => setPayNowOpen(false)}
        invoice={selectedInvoice}
        onSuccess={(txnId) => {
          setPayNowOpen(false);
          setPaymentSuccess(`Payment initiated! Transaction ID: ${txnId}. The invoice will be marked as Paid once confirmed.`);
          setTimeout(() => setPaymentSuccess(''), 8000);
          fetchInvoices();
        }}
      />

      {/* Link Copied Toast */}
      <Snackbar
        open={linkCopied}
        autoHideDuration={3500}
        onClose={() => setLinkCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLinkCopied(false)}
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          sx={{ width: '100%' }}
        >
          Portal link copied! Share it with your customer.
        </Alert>
      </Snackbar>

      {/* Payment Success Snackbar */}
      <Snackbar
        open={!!paymentSuccess}
        autoHideDuration={8000}
        onClose={() => setPaymentSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setPaymentSuccess('')} severity="success" sx={{ width: '100%' }}>
          {paymentSuccess}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="error.main">
            Delete Invoice
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this invoice? All associated data will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmDeleteId(null)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(confirmDeleteId)}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Invoice Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, invoiceId: null, reason: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Reject Invoice & Return to Draft</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason so the team can fix the issues.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection reason"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog((d) => ({ ...d, reason: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRejectDialog({ open: false, invoiceId: null, reason: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={!rejectDialog.reason.trim()}
          >
            Reject & Return to Draft
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Toast */}
      <Snackbar
        open={approvalToast.open}
        autoHideDuration={4000}
        onClose={() => setApprovalToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setApprovalToast((t) => ({ ...t, open: false }))}
          severity={approvalToast.severity}
          sx={{ width: '100%' }}
        >
          {approvalToast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default InvoiceList;
