import React, { useEffect, useState } from "react";
import { getInvoices, deleteInvoice } from "../services/invoiceService";
import { createApiUrl } from "../config/api";
import "./InvoiceList.css";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Checkbox,
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
  TablePagination
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

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

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedInvoice(null);
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


  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            mb={3}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                All Invoices
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage all customer invoices and payments
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2
              }}
            >
              New Invoice
            </Button>
          </Box>

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

        {/* Main Invoice Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            overflow: "hidden"
          }}
        >
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
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
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Balance Due
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading invoices...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchTerm || statusFilter !== "All"
                          ? "No invoices found"
                          : "No invoices yet"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== "All"
                          ? "Try adjusting your search or filters"
                          : "Click 'New Invoice' to create your first invoice"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => {
                    const customer = customers.find((c) => c.id === invoice.customer_id);
                    return (
                      <TableRow
                        key={invoice.id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "grey.50" },
                          cursor: "pointer"
                        }}
                      >
                        <TableCell padding="checkbox">
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
                        <TableCell align="center">
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
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredInvoices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
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
    </MainLayout>
  );
};

export default InvoiceList;
