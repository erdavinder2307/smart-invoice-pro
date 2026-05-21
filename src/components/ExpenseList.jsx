import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import ListSummary from "./list/ListSummary";
import buildSummaryFilterItems from "../utils/summaryFilterChips";
import ArchiveDialog from "./common/ArchiveDialog";
import LifecycleArchiveDialog from "./common/LifecycleArchiveDialog";
import {
  Box,
  Button,
  Checkbox,
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
import ResponsiveDataView from "./common/ResponsiveDataView";
import ExpenseCard from "./common/ExpenseCard";
import BulkActionBar from "./list/BulkActionBar";
import { useNavigate, useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RestoreIcon from "@mui/icons-material/Restore";
import CategoryIcon from "@mui/icons-material/Category";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslation } from "react-i18next";
import { getDateRange, formatDateOnly } from "../utils/dateRangeFilters";
import useTableSorting from "../hooks/useTableSorting";

const STATUS_OPTIONS = ["All", "Pending", "Paid", "Archived"];

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
  const location = useLocation();
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ total: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => new URLSearchParams(location.search).get("status") || "All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [archiveExpense, setArchiveExpense] = useState(null);
  const [restoreExpense, setRestoreExpense] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmBulkArchiveOpen, setConfirmBulkArchiveOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(() => {
    const params = new URLSearchParams(location.search);
    const urlRange = params.get("range");
    const urlStart = params.get("start_date");
    if (urlStart) return urlStart;
    if (urlRange) {
      const dr = getDateRange(urlRange);
      return dr ? formatDateOnly(dr.start) : "";
    }
    return "";
  });
  const [endDate, setEndDate] = useState(() => {
    const params = new URLSearchParams(location.search);
    const urlRange = params.get("range");
    const urlEnd = params.get("end_date");
    if (urlEnd) return urlEnd;
    if (urlRange) {
      const dr = getDateRange(urlRange);
      return dr ? formatDateOnly(dr.end) : "";
    }
    return "";
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { sortBy, sortOrder, handleSort, sortParams } = useTableSorting("date", "desc", "expenses");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let url = createApiUrl("/api/expenses");
      const params = new URLSearchParams();
      
      if (statusFilter === "Archived") {
        params.append("lifecycle", "archived");
      } else {
        params.append("lifecycle", "active");
      }
      if (categoryFilter && categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }
      if (startDate) {
        params.append("start_date", startDate);
      }
      if (endDate) {
        params.append("end_date", endDate);
      }
      if (sortParams.sort_by) {
        params.append("sort_by", sortParams.sort_by);
        params.append("sort_order", sortParams.sort_order);
      }
      
      params.append("include_meta", "1");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      const payload = response.data;
      if (payload && payload.data) {
        setExpenses(payload.data);
        setExpenseSummary(payload.summary || { total: 0, paid: 0, pending: 0 });
      } else {
        setExpenses(Array.isArray(payload) ? payload : []);
        setExpenseSummary({ total: 0, paid: 0, pending: 0 });
      }
    } catch (error) {
      setError(t('expenseList.failedFetch'));
      console.error(error);
    }
    setLoading(false);
  }, [categoryFilter, endDate, sortParams, startDate, statusFilter, t]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (expense) => {
    setArchiveExpense(expense);
  };

  // Filter expenses by search term
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const normalizedStatus = String(expense.status || expense.payment_status || "").trim().toLowerCase();
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Archived"
          ? true
          : statusFilter === "Paid"
            ? normalizedStatus === "paid"
            : normalizedStatus !== "paid";

    return matchesSearch && matchesStatus;
  });

  // Paginated expenses
  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Status counts from server summary
  const allPaidCount = expenseSummary.paid || 0;
  const allPendingCount = expenseSummary.pending || 0;

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

  const handleToggleExpense = (expenseId, checked) => {
    setSelectedIds((prev) => (
      checked ? Array.from(new Set([...prev, expenseId])) : prev.filter((id) => id !== expenseId)
    ));
  };

  const handleBulkArchiveConfirmed = async () => {
    setSelectedIds([]);
    setConfirmBulkArchiveOpen(false);
    await fetchExpenses();
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
                {t('expenseList.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('expenseList.subtitle')}
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
              {t('expenseList.newExpense')}
            </Button>
          </Box>

          {/* Clickable summary chips */}
          <ListSummary
            items={buildSummaryFilterItems({
              activeFilter: statusFilter,
              allFilterValue: "All",
              onFilterChange: setStatusFilter,
              filteredCount: filteredExpenses.length,
              viewAllValue: expenseSummary.total || expenses.length,
              chips: [
                { label: "All Expenses", value: expenseSummary.total || expenses.length,  filterValue: "All" },
                { label: "Pending",      value: allPendingCount,  color: "warning", filterValue: "Pending" },
                { label: "Paid",         value: allPaidCount,     color: "success", filterValue: "Paid" },
              ],
            })}
          />

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
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
            {(startDate || endDate) && (
              <Chip
                label={startDate && endDate ? `${startDate} – ${endDate}` : startDate || endDate}
                onDelete={() => { setStartDate(""); setEndDate(""); navigate("/expenses"); }}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            )}
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

        {selectedIds.length > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.length}
            actions={[
              {
                label: statusFilter === "Archived" ? "Restore Selected" : "Archive Selected",
                color: statusFilter === "Archived" ? "success" : "warning",
                onClick: () => setConfirmBulkArchiveOpen(true),
              },
            ]}
            onClear={() => setSelectedIds([])}
            sx={{ mb: 2 }}
          />
        )}

        {/* Main Table */}
        <ResponsiveDataView
          isMobile={isMobile}
          renderCard={(expense) => (
            <ExpenseCard
              expense={expense}
              onEdit={() => {
                if (statusFilter !== "Archived") {
                  navigate(`/expenses/edit/${expense.id}`);
                }
              }}
              onDelete={() => (statusFilter === "Archived" ? setRestoreExpense(expense) : handleDelete(expense))}
              deleteLabel={statusFilter === "Archived" ? "Restore expense" : "Archive expense"}
              deleteColor={statusFilter === "Archived" ? "#059669" : "#ef4444"}
              deleteHoverBg={statusFilter === "Archived" ? "#ecfdf5" : "#fef2f2"}
              deleteIcon={statusFilter === "Archived" ? "restore" : "delete"}
            />
          )}
          columns={[
            { key: 'checkbox', label: '' },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'vendor', label: 'Vendor/Payee' },
            { key: 'category', label: 'Category' },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'currency', label: 'Currency' },
            { key: 'receipt', label: 'Receipt' },
            { key: 'notes', label: 'Notes' },
            { key: 'actions', label: 'Actions', align: 'center' },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          rows={paginatedExpenses}
          loading={loading}
          emptyIcon={<ReceiptIcon sx={{ fontSize: 48 }} />}
          emptyTitle={searchTerm || categoryFilter !== "All" || startDate || endDate ? "No expenses found" : "No expenses yet"}
          emptySubtitle={searchTerm || categoryFilter !== "All" || startDate || endDate ? "Try adjusting your filters" : "Click 'New Expense' to record your first expense"}
          renderRow={(expense) => (
            <TableRow key={expense.id} hover>
              <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  size="small"
                  checked={selectedIds.includes(expense.id)}
                  onChange={(event) => handleToggleExpense(expense.id, event.target.checked)}
                />
              </TableCell>
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
                  {statusFilter !== "Archived" && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/expenses/edit/${expense.id}`)} sx={{ color: "primary.main" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={statusFilter === "Archived" ? "Restore" : "Archive"}>
                    <IconButton
                      size="small"
                      onClick={() => (statusFilter === "Archived" ? setRestoreExpense(expense) : handleDelete(expense))}
                      sx={{ color: statusFilter === "Archived" ? "success.main" : "error.main" }}
                    >
                      {statusFilter === "Archived" ? <RestoreIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
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

      <ArchiveDialog
        open={!!archiveExpense}
        entityType="expense"
        entityId={archiveExpense?.id}
        entityLabel={archiveExpense?.vendor_name || "Expense"}
        onClose={() => setArchiveExpense(null)}
        onArchived={() => {
          setArchiveExpense(null);
          fetchExpenses();
        }}
      />

      <LifecycleArchiveDialog
        open={!!restoreExpense}
        entityType="expense"
        entityId={restoreExpense?.id}
        entityLabel={restoreExpense?.vendor_name || "Expense"}
        mode="restore"
        onClose={() => setRestoreExpense(null)}
        onConfirmed={() => {
          setRestoreExpense(null);
          fetchExpenses();
        }}
      />

      <LifecycleArchiveDialog
        open={confirmBulkArchiveOpen}
        entityType="expense"
        entityIds={selectedIds}
        entityCount={selectedIds.length}
        entityLabel="Expense"
        mode={statusFilter === "Archived" ? "bulk-restore" : "bulk-archive"}
        onClose={() => setConfirmBulkArchiveOpen(false)}
        onConfirmed={handleBulkArchiveConfirmed}
      />
    </MainLayout>
  );
};

export default ExpenseList;
