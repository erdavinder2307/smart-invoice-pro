import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import StandardDataTable from "./common/StandardDataTable";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import MainLayout from "./Layout/MainLayout";
import { createApiUrl } from "../config/api";

const VIEW_OPTIONS = [
  { value: "All", label: "All Customers" },
  { value: "Active", label: "Active Customers" },
  { value: "Inactive", label: "Inactive Customers" },
];

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(amount || 0));

const normalizeCustomer = (customer) => {
  const displayName = customer.display_name
    || customer.name
    || [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim()
    || "Untitled Customer";

  return {
    ...customer,
    name: displayName,
    company_name: customer.company_name || displayName,
    email: customer.email || "-",
    phone: customer.phone || customer.mobile || "-",
    place_of_supply: customer.place_of_supply || customer.billing_state || customer.shipping_state || "-",
    receivables: Number(customer.receivables || 0),
    unused_credits: Number(customer.unused_credits || 0),
    status: customer.status || "Active",
  };
};

const CustomerList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(createApiUrl("/api/customers"));
      setCustomers(Array.isArray(res.data) ? res.data.map(normalizeCustomer) : []);
    } catch {
      setCustomers([]);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setToast({ open: true, message: location.state.successMessage });
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [
      customer.name,
      customer.company_name,
      customer.email,
      customer.phone,
      customer.gst_number,
      customer.place_of_supply,
    ].some((value) => String(value || "").toLowerCase().includes(term));

    const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/customers/${id}`));
      setConfirmDeleteId(null);
      setSelectedCustomers((prev) => prev.filter((customerId) => customerId !== id));
      await fetchCustomers();
    } catch {
      setError("Failed to delete customer.");
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCustomers(paginatedCustomers.map((customer) => customer.id));
      return;
    }
    setSelectedCustomers([]);
  };

  const handleSelectOne = (customerId) => {
    setSelectedCustomers((prev) => (
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    ));
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allVisibleSelected = paginatedCustomers.length > 0
    && paginatedCustomers.every((customer) => selectedCustomers.includes(customer.id));
  const someVisibleSelected = paginatedCustomers.some((customer) => selectedCustomers.includes(customer.id));

  return (
    <MainLayout>
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
          bgcolor: "#f7f8fb",
          minHeight: "100%",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
              mb: 1.5,
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 210,
                maxWidth: 260,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "transparent",
                  borderRadius: "8px",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#202124",
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                },
                "& .MuiSelect-select": {
                  px: 0,
                  py: 0,
                  pr: "28px !important",
                },
                "& .MuiSelect-icon": {
                  right: -2,
                  color: "#5f6368",
                },
              }}
            >
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {VIEW_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/customers/add")}
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                borderRadius: "7px",
                px: 1.8,
                py: 0.8,
                minWidth: "auto",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                boxShadow: "none",
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb", boxShadow: "none" },
              }}
            >
              New
            </Button>
          </Box>

          <StandardDataTable
            columns={[
              { key: 'checkbox', label: '', width: 46 },
              { key: 'name', label: 'NAME', width: '18%' },
              { key: 'company_name', label: 'COMPANY NAME', width: '18%' },
              { key: 'email', label: 'EMAIL', width: '19%' },
              { key: 'phone', label: 'WORK PHONE', width: '11%' },
              { key: 'place_of_supply', label: 'PLACE OF SUPPLY', width: '11%' },
              { key: 'receivables', label: 'RECEIVABLES (BCY)', align: 'right', width: '11%' },
              { key: 'unused_credits', label: 'UNUSED CREDITS (BCY)', align: 'right', width: '11%' },
              { key: 'actions', label: '', align: 'center', width: 72 },
            ]}
            rows={paginatedCustomers}
            loading={loading}
            emptyTitle={searchTerm ? "No customers matched your search." : "No customers available."}
            toolbar={
              <>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: "1px solid #edf0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minHeight: 36 }}>
                    {selectedCustomers.length > 0 && (
                      <Typography sx={{ fontSize: "0.8125rem", color: "#5f6368" }}>
                        {selectedCustomers.length} selected
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    size="small"
                    placeholder="Search in Customers"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: "#9aa0a6" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: { xs: "100%", md: 280 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#fbfcfe",
                        fontSize: "0.875rem",
                        "& fieldset": { borderColor: "#e3e7ee" },
                        "&:hover fieldset": { borderColor: "#cfd6df" },
                        "&.Mui-focused fieldset": { borderColor: "#4f8df7" },
                      },
                    }}
                  />
                </Box>

                {error && (
                  <Fade in={!!error}>
                    <Alert severity="error" onClose={() => setError("")} sx={{ m: 2, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  </Fade>
                )}
              </>
            }
            renderHeader={() => (
              <TableRow sx={{ bgcolor: "#fafbfc" }}>
                <TableCell padding="checkbox" sx={{ borderBottomColor: "#edf0f3", width: 46 }}>
                  <Checkbox
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                    sx={{ color: "#b6bdc7" }}
                  />
                </TableCell>
                {[
                  "NAME",
                  "COMPANY NAME",
                  "EMAIL",
                  "WORK PHONE",
                  "PLACE OF SUPPLY",
                  "RECEIVABLES (BCY)",
                  "UNUSED CREDITS (BCY)",
                  "",
                ].map((label, index) => (
                  <TableCell
                    key={`${label}-${index}`}
                    align={index >= 5 && index <= 6 ? "right" : index === 7 ? "center" : "left"}
                    sx={{
                      borderBottomColor: "#edf0f3",
                      py: 1.2,
                      color: "#8b95a7",
                      fontSize: "0.68rem",
                      letterSpacing: "0.05em",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      width: index === 0 ? "18%" : undefined,
                      maxWidth: index === 0 ? "18%" : undefined,
                      ...(index === 1 ? { width: "18%", maxWidth: "18%" } : {}),
                      ...(index === 2 ? { width: "19%", maxWidth: "19%" } : {}),
                      ...(index === 3 ? { width: "11%", maxWidth: "11%" } : {}),
                      ...(index === 4 ? { width: "11%", maxWidth: "11%" } : {}),
                      ...(index === 5 ? { width: "11%", maxWidth: "11%" } : {}),
                      ...(index === 6 ? { width: "11%", maxWidth: "11%" } : {}),
                      ...(index === 7 ? { width: 72, maxWidth: 72 } : {}),
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            )}
            renderRow={(customer) => {
              const isSelected = selectedCustomers.includes(customer.id);
              const receivablesColor = customer.receivables > 0 ? "#111827" : "#6b7280";
              const unusedCreditsColor = customer.unused_credits > 0 ? "#111827" : "#6b7280";
              return (
                <TableRow
                  key={customer.id}
                  hover
                  selected={isSelected}
                  sx={{
                    "& td": { borderBottomColor: "#edf0f3", py: 1.7 },
                    "&:hover": { bgcolor: "#fafcff" },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectOne(customer.id)}
                      sx={{ color: "#b6bdc7" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      title={customer.name}
                      sx={{
                        fontSize: "0.825rem",
                        fontWeight: 600,
                        color: "#2563eb",
                        cursor: "pointer",
                        display: "block",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {customer.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={customer.company_name} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.company_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={customer.email} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={customer.phone} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={customer.place_of_supply} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.place_of_supply}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: receivablesColor }}>
                      {formatCurrency(customer.receivables)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: unusedCreditsColor }}>
                      {formatCurrency(customer.unused_credits)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25 }}>
                      <Tooltip title="Edit customer">
                        <IconButton size="small" onClick={() => navigate(`/customers/edit/${customer.id}`)} sx={{ color: "#5f87e7" }}>
                          <EditIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete customer">
                        <IconButton size="small" onClick={() => setConfirmDeleteId(customer.id)} sx={{ color: "#ef4444" }}>
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            }}
            pagination={{
              rowsPerPageOptions: [10, 25, 50],
              count: filteredCustomers.length,
              rowsPerPage,
              page,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleChangeRowsPerPage,
            }}
          />
        </Box>
      </Container>

      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.25 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>
            Delete customer?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>
            This customer will be removed permanently. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmDeleteId(null)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 2.25,
              borderColor: "#d1d5db",
              color: "#4b5563",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(confirmDeleteId)}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 2.25,
              boxShadow: "none",
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setToast({ open: false, message: "" })}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default CustomerList;
