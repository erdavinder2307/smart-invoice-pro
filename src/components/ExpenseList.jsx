import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import SummaryCard from "./common/SummaryCard";
import {
  Box,
  Button,
  Typography,
  Paper,
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
  Container,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import StandardDataTable from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import ExpenseCard from "./common/ExpenseCard";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ImageIcon from "@mui/icons-material/Image";

const CATEGORIES = [
  "All",
  "Office Supplies",
  "Travel",
  "Utilities",
  "Marketing",
  "Software",
  "Equipment",
  "Meals & Entertainment",
  "Professional Services",
  "Rent",
  "Insurance",
  "Other"
];

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let url = createApiUrl("/api/expenses");
      const params = new URLSearchParams();
      
      if (categoryFilter && categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }
      if (startDate) {
        params.append("start_date", startDate);
      }
      if (endDate) {
        params.append("end_date", endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setExpenses(response.data);
    } catch (error) {
      setError("Failed to fetch expenses");
      console.error(error);
    }
    setLoading(false);
  }, [categoryFilter, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/expenses/${id}`));
      await fetchExpenses();
      setConfirmDeleteId(null);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete expense");
    }
    setLoading(false);
  };

  // Filter expenses by search term
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Paginated expenses
  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary stats
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const expenseCount = filteredExpenses.length;
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
  const withReceipts = filteredExpenses.filter(e => e.receipt_url).length;

  // Group by category for display
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    const cat = exp.category || "Other";
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {});

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
                Expenses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage your business expenses
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/expenses/add')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2
              }}
            >
              New Expense
            </Button>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Expenses"
                value={`₹${totalExpenses.toLocaleString()}`}
                icon={<AttachMoneyIcon />}
                accentColor="error.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Total Count"
                value={expenseCount}
                icon={<ReceiptIcon />}
                accentColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="Average Expense"
                value={`₹${avgExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                icon={<AccountBalanceWalletIcon />}
                accentColor="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                label="With Receipts"
                value={`${withReceipts} / ${expenseCount}`}
                icon={<ImageIcon />}
                accentColor="success.main"
              />
            </Grid>
          </Grid>

          {/* Filters */}
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size="small"
              placeholder="Search expenses..."
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
          renderCard={(expense) => (
            <ExpenseCard
              expense={expense}
              onEdit={() => navigate(`/expenses/edit/${expense.id}`)}
              onDelete={() => setConfirmDeleteId(expense.id)}
            />
          )}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'vendor', label: 'Vendor/Payee' },
            { key: 'category', label: 'Category' },
            { key: 'amount', label: 'Amount' },
            { key: 'currency', label: 'Currency' },
            { key: 'receipt', label: 'Receipt' },
            { key: 'notes', label: 'Notes' },
            { key: 'actions', label: 'Actions', align: 'center' },
          ]}
          rows={paginatedExpenses}
          loading={loading}
          emptyIcon={<ReceiptIcon sx={{ fontSize: 48 }} />}
          emptyTitle={searchTerm || categoryFilter !== "All" || startDate || endDate ? "No expenses found" : "No expenses yet"}
          emptySubtitle={searchTerm || categoryFilter !== "All" || startDate || endDate ? "Try adjusting your filters" : "Click 'New Expense' to record your first expense"}
          renderRow={(expense) => (
            <TableRow key={expense.id} hover>
              <TableCell>
                <Typography variant="body2">{new Date(expense.date).toLocaleDateString()}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{expense.vendor_name}</Typography>
              </TableCell>
              <TableCell>
                <Chip label={expense.category} size="small" icon={<CategoryIcon />} sx={{ borderRadius: 1.5 }} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} color="error.main">₹{expense.amount?.toLocaleString()}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{expense.currency || "INR"}</Typography>
              </TableCell>
              <TableCell>
                {expense.receipt_url ? (
                  <Tooltip title="Has receipt">
                    <Avatar src={createApiUrl(expense.receipt_url)} variant="rounded" sx={{ width: 40, height: 40, cursor: "pointer" }} onClick={() => window.open(createApiUrl(expense.receipt_url), '_blank')}>
                      <ImageIcon />
                    </Avatar>
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color="text.secondary">-</Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {expense.notes || "-"}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={0.5} justifyContent="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => navigate(`/expenses/edit/${expense.id}`)} sx={{ color: "primary.main" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setConfirmDeleteId(expense.id)} sx={{ color: "error.main" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          )}
          pagination={{
            rowsPerPageOptions: [10, 25, 50],
            count: filteredExpenses.length,
            rowsPerPage,
            page,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
        />

        {/* Category Breakdown (if expenses exist) */}
        {filteredExpenses.length > 0 && (
          <Paper sx={{ mt: 3, p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Expenses by Category
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(categoryTotals).map(([category, total]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>{category}</Typography>
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      ₹{total.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
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
            Delete Expense
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this expense?
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

export default ExpenseList;
