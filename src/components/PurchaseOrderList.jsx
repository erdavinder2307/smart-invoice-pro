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
  TableRow,
  TableCell,
  CircularProgress,
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
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import StandardDataTable from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import PurchaseOrderCard from "./common/PurchaseOrderCard";
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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [emailDialog, setEmailDialog] = useState({ open: false, po: null, to: '', message: '', attachPdf: false, sending: false });
  const [toast, setToast] = useState({ open: false, message: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [posResponse, vendorsResponse] = await Promise.all([
        axios.get(createApiUrl("/api/purchase-orders")),
        axios.get(createApiUrl("/api/vendors"))
      ]);
      setPurchaseOrders(posResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error) {
      setError("Failed to fetch purchase orders");
      console.error(error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/purchase-orders/${id}`));
      await fetchData();
      setConfirmDeleteId(null);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete purchase order");
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (po) => {
    handleActionMenuClose();
    try {
      const res = await axios.get(createApiUrl(`/api/purchase-orders/${po.id}/pdf`), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${po.po_number || 'purchase-order'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF.');
    }
  };

  const handleEmailOpen = (po) => {
    setEmailDialog({ open: true, po, to: '', message: '', attachPdf: false, sending: false });
    handleActionMenuClose();
  };

  const handleEmailSend = async () => {
    const { po, to, message, attachPdf } = emailDialog;
    if (!to) return;
    setEmailDialog((d) => ({ ...d, sending: true }));
    try {
      await axios.post(createApiUrl(`/api/purchase-orders/${po.id}/send-email`), {
        recipient_email: to,
        message,
        attach_pdf: attachPdf,
      });
      setEmailDialog({ open: false, po: null, to: '', message: '', attachPdf: false, sending: false });
      setToast({ open: true, message: 'Purchase order emailed successfully.' });
      fetchData();
    } catch {
      setEmailDialog((d) => ({ ...d, sending: false }));
      setError('Failed to send email.');
    }
  };

  const handleConvertToBill = async () => {
    if (!selectedPO) return;
    try {
      const response = await axios.post(
        createApiUrl(`/api/purchase-orders/${selectedPO.id}/convert-bill`)
      );
      const billId = response.data.bill_id;
      navigate(`/bills/edit/${billId}`);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to convert to bill");
    }
    setActionMenuAnchor(null);
    setSelectedPO(null);
  };

  const handleActionMenuClick = (event, po) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedPO(po);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedPO(null);
  };

  // Filter POs
  const filteredPOs = purchaseOrders.filter((po) => {
    const vendor = vendors.find(v => v.id === po.vendor_id);
    const vendorName = vendor ? vendor.vendor_name : "";

    const matchesSearch =
      po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated POs
  const paginatedPOs = filteredPOs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary stats
  const totalValue = filteredPOs.reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const draftCount = filteredPOs.filter(po => po.status === "Draft").length;
  const confirmedCount = filteredPOs.filter(po => po.status === "Confirmed").length;
  const receivedCount = filteredPOs.filter(po => po.status === "Received").length;

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
                Purchase Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage vendor purchase orders
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/purchase-orders/add')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2
              }}
            >
              New Purchase Order
            </Button>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total PO Value"
                value={`₹${totalValue.toLocaleString()}`}
                icon={<ShoppingCartIcon />}
                accentColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Draft"
                value={draftCount}
                icon={<ReceiptIcon />}
                accentColor="warning.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Confirmed"
                value={confirmedCount}
                icon={<ReceiptIcon />}
                accentColor="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Received"
                value={receivedCount}
                icon={<LocalShippingIcon />}
                accentColor="success.main"
              />
            </Grid>
          </Grid>

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
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Received">Received</MenuItem>
                <MenuItem value="Billed">Billed</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search POs..."
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

        {/* Main Table */}
        <ResponsiveDataView
          isMobile={isMobile}
          renderCard={(po) => {
            const cardVendor = vendors.find(v => v.id === po.vendor_id);
            return (
              <PurchaseOrderCard
                po={po}
                vendorName={cardVendor ? cardVendor.vendor_name : "Unknown Vendor"}
                onEdit={() => navigate(`/purchase-orders/edit/${po.id}`)}
                onDelete={() => setConfirmDeleteId(po.id)}
                onActionMenu={(e) => handleActionMenuClick(e, po)}
              />
            );
          }}
          columns={[
            { key: 'po_number', label: 'PO #' },
            { key: 'vendor', label: 'Vendor' },
            { key: 'subject', label: 'Subject' },
            { key: 'order_date', label: 'Order Date' },
            { key: 'delivery_date', label: 'Delivery Date' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions', align: 'center' },
          ]}
          rows={paginatedPOs}
          loading={loading}
          emptyIcon={<ShoppingCartIcon sx={{ fontSize: 48 }} />}
          emptyTitle={searchTerm || statusFilter !== "All" ? "No purchase orders found" : "No purchase orders yet"}
          emptySubtitle={searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "Click 'New Purchase Order' to create your first PO"}
          renderRow={(po) => {
            const vendor = vendors.find(v => v.id === po.vendor_id);
            return (
              <TableRow key={po.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{po.po_number}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{vendor ? vendor.vendor_name : "Unknown Vendor"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{po.subject || "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{new Date(po.order_date).toLocaleDateString()}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>₹{po.total_amount?.toLocaleString() || "0"}</Typography>
                </TableCell>
                <TableCell>
                  <StatusBadge status={po.status} />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/purchase-orders/edit/${po.id}`)} sx={{ color: 'primary.main' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton size="small" onClick={(e) => handleActionMenuClick(e, po)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setConfirmDeleteId(po.id)} sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          }}
          pagination={{
            rowsPerPageOptions: [10, 25, 50],
            count: filteredPOs.length,
            rowsPerPage,
            page,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
        />
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleDownloadPDF(selectedPO)} sx={{py: 1.25}}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEmailOpen(selectedPO)} sx={{py: 1.25}}>
          <ListItemIcon><EmailIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/purchase-orders/edit/${selectedPO?.id}`); handleActionMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate('/purchase-orders/add', { state: { cloneFrom: selectedPO } }); handleActionMenuClose(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToBill}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Convert to Bill</ListItemText>
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
            Delete Purchase Order
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this purchase order?
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

      {/* Email dialog */}
      <Dialog open={emailDialog.open} onClose={() => setEmailDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Email Purchase Order {emailDialog.po?.po_number}</DialogTitle>
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

export default PurchaseOrderList;
