import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
import {
  Box,
  Button,
  Typography,
  Paper,
  TableRow,
  TableCell,
  Alert,
  InputAdornment,
  TextField,
  Fade,
  Grid,
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
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import StandardDataTable from "./common/StandardDataTable";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const SalesOrderList = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [emailDialog, setEmailDialog] = useState({ open: false, so: null, to: '', message: '', attachPdf: false, sending: false });
  const [toast, setToast] = useState({ open: false, message: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl("/api/sales-orders"));
      setSalesOrders(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch sales orders");
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/customers"));
      setCustomers(response.data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
    fetchCustomers();
  }, []);

  const filteredSalesOrders = salesOrders.filter((so) => {
    const customer = customers.find((c) => c.id === so.customer_id);
    const customerName = so.customer_name || (customer ? (customer.name || customer.display_name) : "") || "";

    const matchesSearch =
      (so.so_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (so.subject || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || so.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedSalesOrders = filteredSalesOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary metrics
  const totalOrderValue = salesOrders.reduce((sum, so) => sum + (so.total_amount || 0), 0);
  
  const confirmedCount = salesOrders.filter((so) => so.status === "Confirmed").length;
  
  const pendingCount = salesOrders.filter((so) => so.status === "Draft").length;
  
  const invoicedCount = salesOrders.filter((so) => so.status === "Invoiced").length;

  const handleEdit = (so) => {
    navigate(`/sales-orders/edit/${so.id}`);
  };

  const handleAdd = () => {
    navigate("/sales-orders/add");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/sales-orders/${id}`));
      fetchSalesOrders();
      setConfirmDeleteId(null);
      setError("");
    } catch (err) {
      setError("Failed to delete sales order");
      console.error(err);
    }
    setLoading(false);
  };

  const handleActionMenuOpen = (event, so) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedSalesOrder(so);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedSalesOrder(null);
  };

  const handleDownloadPDF = async (so) => {
    handleActionMenuClose();
    try {
      const res = await axios.get(createApiUrl(`/api/sales-orders/${so.id}/pdf`), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${so.so_number || 'sales-order'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF.');
    }
  };

  const handleEmailOpen = (so) => {
    setEmailDialog({ open: true, so, to: '', message: '', attachPdf: false, sending: false });
    handleActionMenuClose();
  };

  const handleEmailSend = async () => {
    const { so, to, message, attachPdf } = emailDialog;
    if (!to) return;
    setEmailDialog((d) => ({ ...d, sending: true }));
    try {
      await axios.post(createApiUrl(`/api/sales-orders/${so.id}/send-email`), {
        recipient_email: to,
        message,
        attach_pdf: attachPdf,
      });
      setEmailDialog({ open: false, so: null, to: '', message: '', attachPdf: false, sending: false });
      setToast({ open: true, message: 'Sales order emailed successfully.' });
      fetchSalesOrders();
    } catch {
      setEmailDialog((d) => ({ ...d, sending: false }));
      setError('Failed to send email.');
    }
  };

  const handleConvertToInvoice = async () => {
    if (!selectedSalesOrder) return;
    
    try {
      // Get next invoice number (API returns 'next_invoice_number')
      const nextNumberResponse = await axios.get(createApiUrl("/api/invoices/next-number"));
      const invoiceNumber = nextNumberResponse.data.next_invoice_number || nextNumberResponse.data.next_number;
      if (!invoiceNumber) {
        setError("Failed to generate invoice number. Please try again.");
        return;
      }
      
      // Convert to invoice
      await axios.post(
        createApiUrl(`/api/sales-orders/${selectedSalesOrder.id}/convert-invoice`),
        { invoice_number: invoiceNumber }
      );
      
      setError("");
      fetchSalesOrders();
      handleActionMenuClose();
      
      // Show success message
      alert("Sales Order converted to invoice successfully!");
    } catch (err) {
      setError("Failed to convert sales order to invoice");
      console.error(err);
    }
  };

  const handleConvertToPO = async () => {
    if (!selectedSalesOrder) return;
    
    try {
      // For now, use a simple PO number
      const poNumber = `PO-${Date.now()}`;
      
      // Convert to PO
      await axios.post(
        createApiUrl(`/api/sales-orders/${selectedSalesOrder.id}/convert-po`),
        { po_number: poNumber }
      );
      
      setError("");
      fetchSalesOrders();
      handleActionMenuClose();
      
      // Show success message
      alert("Sales Order converted to purchase order successfully (PO module pending)!");
    } catch (err) {
      setError("Failed to convert sales order to PO");
      console.error(err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCustomerName = (so) => {
    if (so.customer_name) return so.customer_name;
    const customer = customers.find((c) => c.id === so.customer_id);
    return customer ? (customer.name || customer.display_name || "Unknown") : "Unknown";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Draft: "default",
      Confirmed: "info",
      Closed: "secondary",
      Invoiced: "success",
      Cancelled: "error"
    };
    return statusColors[status] || "default";
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Fade in timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <ShoppingCartIcon fontSize="large" color="primary" />
                  Sales Orders
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage customer sales orders and conversions
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 }
                }}
              >
                New Sales Order
              </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Total Order Value"
                  value={`₹${totalOrderValue.toLocaleString()}`}
                  icon={<AttachMoneyIcon />}
                  color="#667eea"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Confirmed"
                  value={confirmedCount}
                  icon={<CheckCircleIcon />}
                  color="#48bb78"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Pending"
                  value={pendingCount}
                  icon={<PendingIcon />}
                  color="#ed8936"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Invoiced"
                  value={invoicedCount}
                  icon={<LocalShippingIcon />}
                  color="#38b2ac"
                />
              </Grid>
            </Grid>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search by SO number, customer, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "grey.50"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: "grey.50" }}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                      <MenuItem value="Invoiced">Invoiced</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary" textAlign="right">
                    {filteredSalesOrders.length} order{filteredSalesOrders.length !== 1 ? 's' : ''} found
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Table */}
            <StandardDataTable
              columns={[
                { key: 'so_number', label: 'SO #' },
                { key: 'customer', label: 'Customer' },
                { key: 'subject', label: 'Subject' },
                { key: 'order_date', label: 'Order Date' },
                { key: 'delivery_date', label: 'Delivery Date' },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions', align: 'center' },
              ]}
              rows={paginatedSalesOrders}
              loading={loading}
              emptyIcon={<ShoppingCartIcon sx={{ fontSize: 48 }} />}
              emptyTitle="No sales orders found"
              emptySubtitle="Create a sales order to track customer purchases"
              onRowClick={(so) => handleEdit(so)}
              renderRow={(so) => (
                <TableRow key={so.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleEdit(so)}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{so.so_number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{getCustomerName(so)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{so.subject || "-"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(so.order_date).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{so.delivery_date ? new Date(so.delivery_date).toLocaleDateString() : "-"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">₹{so.total_amount?.toLocaleString() || "0"}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={so.status} color={getStatusColor(so.status)} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleActionMenuOpen(e, so); }}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}
              pagination={{
                rowsPerPageOptions: [5, 10, 25, 50],
                count: filteredSalesOrders.length,
                rowsPerPage,
                page,
                onPageChange: handleChangePage,
                onRowsPerPageChange: handleChangeRowsPerPage,
              }}
            />
          </Box>
        </Fade>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleDownloadPDF(selectedSalesOrder)} sx={{py: 1.25}}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEmailOpen(selectedSalesOrder)} sx={{py: 1.25}}>
          <ListItemIcon><EmailIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEdit(selectedSalesOrder); handleActionMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate('/sales-orders/add', { state: { cloneFrom: selectedSalesOrder } }); handleActionMenuClose(); }}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToInvoice} disabled={selectedSalesOrder?.status === "Invoiced"}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Convert to Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToPO}>
          <ListItemIcon>
            <ShoppingCartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Convert to Purchase Order</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setConfirmDeleteId(selectedSalesOrder?.id); handleActionMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this sales order? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button onClick={() => handleDelete(confirmDeleteId)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email dialog */}
      <Dialog open={emailDialog.open} onClose={() => setEmailDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Email Sales Order {emailDialog.so?.so_number}</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Recipient Email" fullWidth size="small" type="email"
            value={emailDialog.to}
            onChange={(e) => setEmailDialog((d) => ({ ...d, to: e.target.value }))}
          />
          <TextField
            label="Message (optional)" fullWidth size="small" multiline rows={3}
            value={emailDialog.message}
            onChange={(e) => setEmailDialog((d) => ({ ...d, message: e.target.value }))}
          />
          <FormControlLabel
            control={<Checkbox checked={emailDialog.attachPdf} onChange={(e) => setEmailDialog((d) => ({ ...d, attachPdf: e.target.checked }))} />}
            label="Attach PDF"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialog((d) => ({ ...d, open: false }))} disabled={emailDialog.sending}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailSend} disabled={emailDialog.sending || !emailDialog.to}>
            {emailDialog.sending ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
      />
    </MainLayout>
  );
};

export default SalesOrderList;
