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
  Container,
  FormControl,
  Select,
  MenuItem,
  TablePagination,
  Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentIcon from "@mui/icons-material/Payment";

const BillList = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsResponse, vendorsResponse] = await Promise.all([
        axios.get(createApiUrl("/api/bills")),
        axios.get(createApiUrl("/api/vendors"))
      ]);
      setBills(billsResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error) {
      setError("Failed to fetch bills");
      console.error(error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/bills/${id}`));
      await fetchData();
      setConfirmDeleteId(null);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete bill");
    }
    setLoading(false);
  };

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const vendor = vendors.find(v => v.id === bill.vendor_id);
    const vendorName = vendor ? vendor.vendor_name : "";

    const matchesSearch =
      bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || bill.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated bills
  const paginatedBills = filteredBills.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary stats
  const totalBillAmount = filteredBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const totalPaid = filteredBills.reduce((sum, bill) => sum + (bill.amount_paid || 0), 0);
  const totalDue = filteredBills.reduce((sum, bill) => sum + (bill.balance_due || 0), 0);
  const unpaidCount = filteredBills.filter(b => b.payment_status === "Unpaid").length;
  const paidCount = filteredBills.filter(b => b.payment_status === "Paid").length;

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
                Bills
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage vendor bills and payments
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/bills/add')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2
              }}
            >
              New Bill
            </Button>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Bills"
                value={`₹${totalBillAmount.toLocaleString()}`}
                icon={<ReceiptIcon />}
                accentColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Paid"
                value={`₹${totalPaid.toLocaleString()}`}
                icon={<PaymentIcon />}
                accentColor="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Due"
                value={`₹${totalDue.toLocaleString()}`}
                icon={<AttachMoneyIcon />}
                accentColor="error.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Unpaid / Paid"
                value={`${unpaidCount} / ${paidCount}`}
                icon={<ReceiptIcon />}
                accentColor="warning.main"
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
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search bills..."
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
                      <TableCell sx={{ fontWeight: 700 }}>Bill #</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Bill Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                          <ReceiptIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm || statusFilter !== "All" ? "No bills found" : "No bills yet"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== "All"
                              ? "Try adjusting your search or filters"
                              : "Click 'New Bill' to create your first bill"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBills.map((bill) => {
                        const vendor = vendors.find(v => v.id === bill.vendor_id);
                        return (
                          <TableRow key={bill.id} hover sx={{ "&:hover": { bgcolor: "grey.50" } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {bill.bill_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {vendor ? vendor.vendor_name : "Unknown Vendor"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{bill.subject || "-"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(bill.bill_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                ₹{bill.total_amount?.toLocaleString() || "0"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main">
                                ₹{bill.amount_paid?.toLocaleString() || "0"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error.main">
                                ₹{bill.balance_due?.toLocaleString() || "0"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={bill.payment_status} />
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={0.5} justifyContent="center">
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/bills/edit/${bill.id}`)}
                                    sx={{ color: "primary.main" }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmDeleteId(bill.id)}
                                    sx={{ color: "error.main" }}
                                    disabled={bill.payment_status === "Paid"}
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
                count={filteredBills.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Container>

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
            Delete Bill
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this bill?
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

export default BillList;
