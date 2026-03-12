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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TablePagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
    const customerName = customer ? customer.name : "";

    const matchesSearch =
      so.so_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.subject?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const handleConvertToInvoice = async () => {
    if (!selectedSalesOrder) return;
    
    try {
      // Get next invoice number
      const nextNumberResponse = await axios.get(createApiUrl("/api/invoices/next-number"));
      const invoiceNumber = nextNumberResponse.data.next_number;
      
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

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
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
            <Paper sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ overflowX: "hidden" }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>SO #</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Order Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Delivery Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedSalesOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                              <Typography color="text.secondary">No sales orders found</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedSalesOrders.map((so) => (
                            <TableRow
                              key={so.id}
                              sx={{
                                "&:hover": { bgcolor: "grey.50" },
                                cursor: "pointer"
                              }}
                              onClick={() => handleEdit(so)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {so.so_number}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {getCustomerName(so.customer_id)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {so.subject || "-"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(so.order_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {so.delivery_date ? new Date(so.delivery_date).toLocaleDateString() : "-"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600} color="primary">
                                  ₹{so.total_amount?.toLocaleString() || "0"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={so.status} color={getStatusColor(so.status)} />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActionMenuOpen(e, so);
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredSalesOrders.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </>
              )}
            </Paper>
          </Box>
        </Fade>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => { handleEdit(selectedSalesOrder); handleActionMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
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
    </MainLayout>
  );
};

export default SalesOrderList;
