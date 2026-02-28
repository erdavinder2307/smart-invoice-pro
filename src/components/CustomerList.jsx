import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApiUrl } from "../config/api";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Checkbox,
  InputAdornment,
  Fade,
  Grid,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  TablePagination,
  Container,
  Chip,
  Avatar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gst_number: "",
  password: "",
};

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.gst_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginated customers
  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary stats
  const totalReceivables = filteredCustomers.reduce(
    (sum, c) => sum + (c.receivables || 0),
    0
  );
  const totalUnusedCredits = filteredCustomers.reduce(
    (sum, c) => sum + (c.unused_credits || 0),
    0
  );

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(createApiUrl("/api/customers"));
      // Add mock data for receivables and unused credits if not present
      const enhancedCustomers = res.data.map(c => ({
        ...c,
        status: c.status || "Active",
        receivables: c.receivables || Math.floor(Math.random() * 50000),
        unused_credits: c.unused_credits || Math.floor(Math.random() * 5000),
        company_name: c.company_name || c.name,
        place_of_supply: c.place_of_supply || "Delhi"
      }));
      setCustomers(enhancedCustomers);
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getRandomCustomer = () => {
    const names = ["Amit Sharma", "Priya Singh", "Rahul Verma", "Sneha Patel", "Vikram Rao", "Neha Gupta", "Rohan Mehta", "Anjali Desai"];
    const emails = ["amit", "priya", "rahul", "sneha", "vikram", "neha", "rohan", "anjali"];
    const streets = ["MG Road", "Park Street", "Sector 21", "DLF Phase 3", "Bandra West", "Salt Lake", "Koramangala", "Powai"];
    const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"];
    const gst = ["27AAEPM1234C1ZV", "07AABCU9603R1Z2", "19AACCM9910C1ZP", "29AAACG2115R1Z6", "24AAACB2894G1ZB", "09AAACG2115R1Z2"];
    const idx = Math.floor(Math.random() * names.length);
    return {
      name: names[idx],
      email: emails[idx] + Math.floor(Math.random() * 1000) + "@example.com",
      phone: "9" + Math.floor(100000000 + Math.random() * 900000000),
      address: `${Math.floor(Math.random() * 100) + 1}, ${streets[idx]}, ${cities[idx]}`,
      gst_number: gst[Math.floor(Math.random() * gst.length)],
      password: "" // Empty password field for new customers
    };
  };

  const openModal = (customer = null) => {
    if (customer) {
      // When editing, copy all fields except password (we don't show existing password)
      setForm({
        ...customer,
        password: "" // Clear password field for editing
      });
      setEditingId(customer.id);
    } else {
      setForm(getRandomCustomer());
      setEditingId(null);
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingId(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Valid email is required";
    if (!form.phone.trim()) return "Phone is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.gst_number.trim()) return "GST Number is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setError(err);
    setLoading(true);
    try {
      // Prepare form data, only include password if it's provided
      const formData = { ...form };

      // For edit mode, only include password if it's not empty
      if (editingId && !formData.password) {
        delete formData.password;
      }

      if (editingId) {
        await axios.put(createApiUrl(`/api/customers/${editingId}`), formData);
      } else {
        await axios.post(createApiUrl("/api/customers"), formData);
      }
      fetchCustomers();
      closeModal();
    } catch {
      setError("Failed to save customer");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/customers/${id}`));
      fetchCustomers();
      setConfirmDeleteId(null);
    } catch {
      setError("Failed to delete customer");
    }
    setLoading(false);
  };

  // Handle select all checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCustomers(paginatedCustomers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Handle individual checkbox
  const handleSelectOne = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
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
                Customers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your customer relationships and track receivables
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/customers/add')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2
              }}
            >
              New Customer
            </Button>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="Total Customers"
                value={filteredCustomers.length}
                icon={<PeopleIcon />}
                accentColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="Total Receivables"
                value={`₹${totalReceivables.toLocaleString()}`}
                icon={<AttachMoneyIcon />}
                accentColor="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label="Unused Credits"
                value={`₹${totalUnusedCredits.toLocaleString()}`}
                icon={<AccountBalanceWalletIcon />}
                accentColor="info.main"
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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search customers..."
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
                        selectedCustomers.length > 0 &&
                        selectedCustomers.length < paginatedCustomers.length
                      }
                      checked={
                        paginatedCustomers.length > 0 &&
                        selectedCustomers.length === paginatedCustomers.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Company Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Work Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Place of Supply</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Receivables
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Unused Credits
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                        Loading customers...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <PeopleIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchTerm ? "No customers found" : "No customers yet"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Click 'New Customer' to add your first customer"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "grey.50" },
                        cursor: "pointer"
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectOne(customer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {customer.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{customer.company_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{customer.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{customer.phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{customer.place_of_supply}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          ₹{customer.receivables?.toLocaleString() || "0"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="info.main">
                          ₹{customer.unused_credits?.toLocaleString() || "0"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={customer.status || "Active"} />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/customers/edit/${customer.id}`)}
                              sx={{ color: "primary.main" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => setConfirmDeleteId(customer.id)}
                              sx={{ color: "error.main" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredCustomers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>

      {/* Modern Add/Edit Dialog */}
      <Dialog
        open={showModal}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Typography variant="h5" fontWeight={700}>
            {editingId ? "Edit Customer" : "Add New Customer"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingId ? "Update customer information" : "Enter customer details below"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
                type="email"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST Number"
                name="gst_number"
                value={form.gst_number}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Login Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                type="password"
                size="small"
                placeholder={editingId ? "Leave blank to keep current" : "Set login password"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                helperText={editingId ? "Leave blank to keep existing password" : "Password for customer portal"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={3}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5, borderTop: "1px solid", borderColor: "grey.200" }}>
          <Button
            onClick={closeModal}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : editingId ? "Update" : "Add Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Delete Confirmation Dialog */}
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
            Delete Customer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this customer? All associated data will be permanently
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

export default CustomerList;
