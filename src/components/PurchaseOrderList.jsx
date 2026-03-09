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
  TablePagination,
  Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        <Paper sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>PO #</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Order Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Delivery Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPOs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <ShoppingCartIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm || statusFilter !== "All" ? "No purchase orders found" : "No purchase orders yet"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== "All"
                              ? "Try adjusting your search or filters"
                              : "Click 'New Purchase Order' to create your first PO"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPOs.map((po) => {
                        const vendor = vendors.find(v => v.id === po.vendor_id);
                        return (
                          <TableRow key={po.id} hover sx={{ "&:hover": { bgcolor: "grey.50" } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {po.po_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {vendor ? vendor.vendor_name : "Unknown Vendor"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{po.subject || "-"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(po.order_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                ₹{po.total_amount?.toLocaleString() || "0"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={po.status} />
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={0.5} justifyContent="center">
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/purchase-orders/edit/${po.id}`)}
                                    sx={{ color: "primary.main" }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleActionMenuClick(e, po)}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmDeleteId(po.id)}
                                    sx={{ color: "error.main" }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
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
                count={filteredPOs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
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
    </MainLayout>
  );
};

export default PurchaseOrderList;
