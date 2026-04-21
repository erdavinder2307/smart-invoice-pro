import React, { useEffect, useState } from "react";
import { getInvoices, deleteInvoice, sendInvoiceEmail, recordPayment } from "../services/invoiceService";
import { createApiUrl } from "../config/api";
import "./InvoiceList.css";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
import SectionHeader from "./common/SectionHeader";
import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import InvoiceCard from "./common/InvoiceCard";
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
  InputLabel,
  Select,
  Snackbar,
  FormControlLabel,
  useMediaQuery,
  useTheme,
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
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PayNowModal from "./PayNowModal";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

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
  const [emailDialog, setEmailDialog] = useState({ open: false, invoice: null, recipientEmail: '', subject: '', message: '', attachPdf: false });
  const [emailSending, setEmailSending] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, invoice: null, amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'Bank Transfer', reference: '' });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Approval-specific state
  const [rejectDialog, setRejectDialog] = useState({ open: false, invoiceId: null, reason: '' });
  const [approvalToast, setApprovalToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user, canApprove } = useAuth();
  const { t } = useTranslation();

  const filteredInvoices = invoices.filter((invoice) => {
    const customer = customers.find((c) => c.id === invoice.customer_id);
    const customerName = customer ? customer.name : "";

    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      (invoice.invoice_number || "").toLowerCase().includes(lowerSearch) ||
      (customerName || "").toLowerCase().includes(lowerSearch) ||
      (invoice.invoice_type || "").toLowerCase().includes(lowerSearch) ||
      (invoice.customer_name || "").toLowerCase().includes(lowerSearch);

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

  const handleOpenEmailDialog = (invoice) => {
    if (!invoice) return;
    setEmailDialog({
      open: true,
      invoice,
      recipientEmail: invoice.customer_email || '',
      subject: `Invoice ${invoice.invoice_number || invoice.id} — Due ${invoice.due_date || ''}`,
      message: '',
      attachPdf: false,
    });
  };

  const handleSendEmailSubmit = async () => {
    const { invoice, recipientEmail, message, attachPdf } = emailDialog;
    if (!recipientEmail.trim()) {
      setApprovalToast({ open: true, message: 'Recipient email is required.', severity: 'error' });
      return;
    }
    setEmailSending(true);
    try {
      await sendInvoiceEmail(invoice.id, { recipient_email: recipientEmail.trim(), message, attach_pdf: attachPdf });
      setEmailDialog({ open: false, invoice: null, recipientEmail: '', subject: '', message: '', attachPdf: false });
      setApprovalToast({ open: true, message: `Invoice emailed to ${recipientEmail} successfully.`, severity: 'success' });
      fetchInvoices();
    } catch (err) {
      setApprovalToast({ open: true, message: err.response?.data?.error || 'Failed to send email. Please try again.', severity: 'error' });
    } finally {
      setEmailSending(false);
    }
  };

  const handleOpenPaymentDialog = (invoice) => {
    if (!invoice) return;
    setPaymentDialog({
      open: true,
      invoice,
      amount: invoice.balance_due > 0 ? String(invoice.balance_due) : '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      reference: '',
    });
  };

  const handleRecordPaymentSubmit = async () => {
    const { invoice, amount, paymentDate, paymentMode, reference } = paymentDialog;
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setApprovalToast({ open: true, message: 'Please enter a valid amount.', severity: 'error' });
      return;
    }
    setPaymentSubmitting(true);
    try {
      const result = await recordPayment(invoice.id, {
        amount: parsedAmount,
        payment_date: paymentDate,
        payment_mode: paymentMode,
        reference,
      });
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? result.invoice : inv));
      setPaymentDialog({ open: false, invoice: null, amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'Bank Transfer', reference: '' });
      setApprovalToast({ open: true, message: `Payment of ₹${parsedAmount.toLocaleString()} recorded successfully.`, severity: 'success' });
    } catch (err) {
      setApprovalToast({ open: true, message: err.response?.data?.error || 'Failed to record payment. Please try again.', severity: 'error' });
    } finally {
      setPaymentSubmitting(false);
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

  const allVisibleSelected =
    paginatedInvoices.length > 0 &&
    paginatedInvoices.every((inv) => selectedInvoices.includes(inv.id));
  const someVisibleSelected = paginatedInvoices.some((inv) =>
    selectedInvoices.includes(inv.id)
  );

  const invoiceColumns = [
    { key: "select", label: "", width: CHECKBOX_COLUMN_WIDTH },
    { key: "date", label: "DATE" },
    { key: "invoice", label: "INVOICE #" },
    { key: "order", label: "ORDER NUMBER" },
    { key: "customer", label: "CUSTOMER NAME" },
    { key: "status", label: "STATUS" },
    { key: "email_status", label: "EMAIL", align: "center" },
    { key: "due", label: "DUE DATE" },
    { key: "amount", label: "AMOUNT", align: "right" },
    { key: "balance", label: "BALANCE DUE", align: "right" },
    { key: "actions", label: "", align: "center" },
  ];

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;


  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title={t('invoiceList.title')}
            subtitle={t('invoiceList.subtitle')}
            primaryAction={{
              label: t('invoiceList.newInvoice'),
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
              {t('invoiceList.paymentSummary')}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  label={t('invoiceList.outstandingReceivables')}
                  value={`₹${totalOutstanding.toLocaleString()}`}
                  icon={<AttachMoneyIcon />}
                  accentColor="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <SummaryCard
                  label={t('invoiceList.dueToday')}
                  value={dueToday}
                  icon={<TodayIcon />}
                  accentColor="warning.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <SummaryCard
                  label={t('invoiceList.dueWithin30Days')}
                  value={dueWithin30Days}
                  icon={<DateRangeIcon />}
                  accentColor="info.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <SummaryCard
                  label={t('invoiceList.overdue')}
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

              <ResponsiveDataView
                isMobile={isMobile}
                renderCard={(invoice) => {
                  const cardCustomer = customers.find((c) => c.id === invoice.customer_id);
                  return (
                    <InvoiceCard
                      invoice={invoice}
                      customerName={cardCustomer ? cardCustomer.name : `Customer #${invoice.customer_id}`}
                      onEdit={() => handleEdit(invoice)}
                      onActionMenu={(e) => handleActionMenuOpen(e, invoice)}
                    />
                  );
                }}
                columns={invoiceColumns}
                rows={paginatedInvoices}
                loading={loading}
                emptyMessage={searchTerm || statusFilter !== "All" ? t('invoiceList.noInvoices') : t('invoiceList.noInvoices')}
                pagination={{
                  rowsPerPageOptions: [10, 25, 50],
                  count: filteredInvoices.length,
                  rowsPerPage,
                  page,
                  onPageChange: handleChangePage,
                  onRowsPerPageChange: handleChangeRowsPerPage,
                }}
                renderHeader={() => (
                  <TableRow sx={{ bgcolor: "#fafbfc" }}>
                    <TableCell
                      sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px", borderBottomColor: "#edf0f3" }}
                    >
                      <Checkbox
                        indeterminate={someVisibleSelected && !allVisibleSelected}
                        checked={allVisibleSelected}
                        onChange={handleSelectAll}
                        sx={{ color: "#b6bdc7" }}
                      />
                    </TableCell>
                    {[
                      { label: t('invoiceList.columns.date') },
                      { label: t('invoiceList.columns.invoiceNumber') },
                      { label: t('invoiceList.columns.orderNumber') },
                      { label: t('invoiceList.columns.customerName') },
                      { label: t('invoiceList.columns.status') },
                      { label: "EMAIL", align: "center" },
                      { label: t('invoiceList.columns.dueDate') },
                      { label: t('invoiceList.columns.amount'), align: "right" },
                      { label: t('invoiceList.columns.balanceDue'), align: "right" },
                      { label: "", align: "center" },
                    ].map((col, index) => (
                      <TableCell
                        key={`${col.label}-${index}`}
                        align={col.align || "left"}
                        sx={{
                          borderBottomColor: "#edf0f3",
                          py: 1.2,
                          color: "#8b95a7",
                          fontSize: "0.68rem",
                          letterSpacing: "0.05em",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
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
                      <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }} onClick={(e) => e.stopPropagation()}>
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
                      <TableCell align="center">
                        {invoice.email_status === 'sent' ? (
                          <Tooltip title={`Sent to ${invoice.last_sent_to || ''} on ${(invoice.email_sent_at || '').slice(0, 10)}`}>
                            <Chip label="Sent" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                          </Tooltip>
                        ) : invoice.email_status === 'failed' ? (
                          <Chip label="Failed" size="small" color="error" sx={{ fontSize: '0.65rem', height: 20 }} />
                        ) : (
                          <Chip label="Not Sent" size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'grey.200', color: 'text.secondary' }} />
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
                        <Button size="small" variant="outlined" startIcon={<EmailIcon />} onClick={() => handleOpenEmailDialog(activeInvoice)} sx={{ textTransform: "none" }}>
                          Email
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenPaymentDialog(activeInvoice)}
                          disabled={activeInvoice.status === 'Paid' || activeInvoice.status === 'Cancelled'}
                          sx={{ textTransform: "none", boxShadow: "none" }}
                        >
                          Record Payment
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

                    {(activeInvoice.payment_history || []).length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Payment History</Typography>
                        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', px: 2, py: 1, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
                            {['Amount', 'Date', 'Mode', 'Reference'].map(h => (
                              <Typography key={h} variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.3 }}>{h}</Typography>
                            ))}
                          </Box>
                          {activeInvoice.payment_history.map((p, i) => (
                            <Box key={p.id || i} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', px: 2, py: 1.25, borderBottom: i < activeInvoice.payment_history.length - 1 ? '1px solid' : 'none', borderColor: 'grey.100', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={600} color="success.main">{formatCurrency(p.amount)}</Typography>
                              <Typography variant="body2" color="text.secondary">{p.payment_date || '—'}</Typography>
                              <Typography variant="body2" color="text.secondary">{p.payment_mode || '—'}</Typography>
                              <Typography variant="body2" color="text.secondary">{p.reference || '—'}</Typography>
                            </Box>
                          ))}
                        </Paper>
                      </Box>
                    )}
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
            navigate('/invoices/add', { state: { cloneFrom: selectedInvoice } });
            handleActionMenuClose();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Duplicate" secondary="Copy as new draft" />
        </MenuItem>
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
        {selectedInvoice && selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Cancelled' && (
          <MenuItem
            onClick={() => {
              handleOpenPaymentDialog(selectedInvoice);
              handleActionMenuClose();
            }}
            sx={{ py: 1.25 }}
          >
            <ListItemIcon>
              <AttachMoneyIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Record Payment" secondary="Log an offline payment" />
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
            handleOpenEmailDialog(selectedInvoice);
            handleActionMenuClose();
          }}
          sx={{ py: 1.25 }}
        >
          <ListItemIcon>
            <EmailIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Send Email" secondary="Email invoice to customer" />
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

      {/* Send Email Dialog */}
      <Dialog
        open={emailDialog.open}
        onClose={() => !emailSending && setEmailDialog({ open: false, invoice: null, recipientEmail: '', subject: '', message: '', attachPdf: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Send Invoice by Email</Typography>
          <Typography variant="body2" color="text.secondary">
            {emailDialog.invoice?.invoice_number}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          <TextField
            label="To"
            value={emailDialog.recipientEmail}
            onChange={(e) => setEmailDialog((d) => ({ ...d, recipientEmail: e.target.value }))}
            fullWidth
            size="small"
            required
            type="email"
            autoFocus
          />
          <TextField
            label="Subject"
            value={emailDialog.subject}
            onChange={(e) => setEmailDialog((d) => ({ ...d, subject: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="Message (optional)"
            value={emailDialog.message}
            onChange={(e) => setEmailDialog((d) => ({ ...d, message: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Add a personal note to the customer..."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={emailDialog.attachPdf}
                onChange={(e) => setEmailDialog((d) => ({ ...d, attachPdf: e.target.checked }))}
                size="small"
              />
            }
            label={<Typography variant="body2">Attach PDF invoice</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setEmailDialog({ open: false, invoice: null, recipientEmail: '', subject: '', message: '', attachPdf: false })}
            disabled={emailSending}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={emailSending ? <CircularProgress size={16} color="inherit" /> : <EmailIcon />}
            onClick={handleSendEmailSubmit}
            disabled={emailSending || !emailDialog.recipientEmail.trim()}
            sx={{ textTransform: 'none' }}
          >
            {emailSending ? 'Sending…' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog
        open={paymentDialog.open}
        onClose={() => !paymentSubmitting && setPaymentDialog({ open: false, invoice: null, amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'Bank Transfer', reference: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Record Payment</Typography>
          <Typography variant="body2" color="text.secondary">
            {paymentDialog.invoice?.invoice_number} · Balance: {formatCurrency(paymentDialog.invoice?.balance_due || 0)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          <TextField
            label="Amount"
            type="number"
            value={paymentDialog.amount}
            onChange={(e) => setPaymentDialog((d) => ({ ...d, amount: e.target.value }))}
            fullWidth
            size="small"
            required
            autoFocus
            inputProps={{ min: 0.01, step: '0.01' }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            label="Payment Date"
            type="date"
            value={paymentDialog.paymentDate}
            onChange={(e) => setPaymentDialog((d) => ({ ...d, paymentDate: e.target.value }))}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={paymentDialog.paymentMode}
              onChange={(e) => setPaymentDialog((d) => ({ ...d, paymentMode: e.target.value }))}
              label="Payment Mode"
            >
              {['Bank Transfer', 'Cash', 'UPI', 'Cheque', 'Credit Card', 'Debit Card', 'Other'].map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Reference / Transaction ID (optional)"
            value={paymentDialog.reference}
            onChange={(e) => setPaymentDialog((d) => ({ ...d, reference: e.target.value }))}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setPaymentDialog({ open: false, invoice: null, amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'Bank Transfer', reference: '' })}
            disabled={paymentSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={paymentSubmitting ? <CircularProgress size={16} color="inherit" /> : <AttachMoneyIcon />}
            onClick={handleRecordPaymentSubmit}
            disabled={paymentSubmitting || !paymentDialog.amount}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {paymentSubmitting ? 'Saving…' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default InvoiceList;
