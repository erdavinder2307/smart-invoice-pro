import React, { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SendIcon from "@mui/icons-material/Send";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import InvoiceCard from "./common/InvoiceCard";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import BulkActionBar from "./list/BulkActionBar";
import ArchiveDialog from "./common/ArchiveDialog";
import LifecycleArchiveDialog from "./common/LifecycleArchiveDialog";
import useTableSorting from "../hooks/useTableSorting";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useListController } from "../hooks/useListController";
import { createApiUrl } from "../config/api";
import {
  bulkInvoiceAction,
  getInvoicesList,
  recordPayment,
  sendInvoiceEmail,
} from "../services/invoiceService";
import { bulkArchiveEntities } from "../services/bulkArchiveService";
import { saveSearchHistory } from "../services/searchService";
import { invalidateSearchHistoryCache } from "./list/ListHeader";

// ── Status visual styles ────────────────────────────────────────────────────
const statusStyle = {
  Draft:              { color: "#9aa3af", bg: "transparent" },
  Issued:             { color: "#0f6cbd", bg: "#eaf4ff" },
  Paid:               { color: "#1f7a36", bg: "#eaf7ee" },
  "Partially Paid":   { color: "#7c5a1e", bg: "#fff6d6" },
  Overdue:            { color: "#c0392b", bg: "#feefe8" },
  Cancelled:          { color: "#6b7280", bg: "#f3f4f6" },
  ARCHIVED:           { color: "#7c3aed", bg: "#f5f3ff" },
};

// ── Date preset options ─────────────────────────────────────────────────────
const DATE_OPTIONS = [
  { value: "all",          label: "All Time" },
  { value: "this_week",    label: "This Week" },
  { value: "this_month",   label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year",    label: "This Year" },
  { value: "custom",       label: "Custom" },
];

const PAYMENT_MODES = ["Bank Transfer", "Cash", "UPI", "Cheque", "Credit Card", "Debit Card", "Other"];

const EMPTY_PAYMENT_DIALOG = {
  open: false,
  invoice: null,
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMode: "Bank Transfer",
  reference: "",
  submitting: false,
};

const EMPTY_EMAIL_DIALOG = {
  open: false,
  invoice: null,
  to: "",
  message: "",
  attachPdf: false,
  sending: false,
};

// ───────────────────────────────────────────────────────────────────────────

const InvoiceList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    search,
    setSearch,
    status,
    setStatus,
    dateRange,
    setDateRange,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    minAmount,
    maxAmount,
    setAmountRange,
  } = useListController({
    location,
    navigate,
    defaults: {
      page: 1,
      pageSize: 10,
      search: "",
      status: "All",
      dateRange: "all",
    },
  });

  const [selectedIds, setSelectedIds]       = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [restoreTargetId, setRestoreTargetId] = useState(null);
  const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeInvoice, setActiveInvoice]   = useState(null);
  const [paymentDialog, setPaymentDialog]   = useState(EMPTY_PAYMENT_DIALOG);
  const [emailDialog, setEmailDialog]       = useState(EMPTY_EMAIL_DIALOG);
  const [uiError, setUiError]               = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const { sortBy, sortOrder, handleSort, setSort } = useTableSorting("created_at", "desc", "invoices");

  // ── Sync sort ↔ URL ────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSortBy    = params.get("sort_by")    || "created_at";
    const urlSortOrder = (params.get("sort_order") || "desc").toLowerCase();
    if (urlSortBy !== sortBy || urlSortOrder !== sortOrder) {
      setSort(urlSortBy, urlSortOrder === "asc" ? "asc" : "desc");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentBy    = params.get("sort_by")    || "created_at";
    const currentOrder = (params.get("sort_order") || "desc").toLowerCase();
    if (currentBy === sortBy && currentOrder === sortOrder) return;
    params.set("sort_by", sortBy || "created_at");
    params.set("sort_order", sortOrder || "desc");
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate, sortBy, sortOrder]);

  // ── Query params memo ──────────────────────────────────────────────────
  const queryParams = useMemo(
    () => ({
      page: page + 1,
      page_size: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      q: debouncedSearch,
      status: status === "All" || status === "Archived" ? "" : status,
      lifecycle: status === "Archived" ? "archived" : "active",
      date_range: dateRange,
      date_from: dateRange === "custom" ? dateFrom : "",
      date_to:   dateRange === "custom" ? dateTo   : "",
      min_amount: minAmount,
      max_amount: maxAmount,
      include_meta: "1",
    }),
    [dateFrom, dateRange, dateTo, debouncedSearch, maxAmount, minAmount, page, rowsPerPage, sortBy, sortOrder, status]
  );

  // ── Data fetching ──────────────────────────────────────────────────────
  const invoicesQuery = useQuery({
    queryKey: ["invoices-list", queryParams],
    queryFn: ({ signal }) => getInvoicesList(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkInvoiceAction,
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
      setUiError("");
    },
    onError: () => setUiError("Failed to apply bulk action."),
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: (ids) => bulkArchiveEntities("invoice", ids),
    onSuccess: (result) => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
      if (Number(result?.failedCount || 0) > 0) {
        setUiError(
          `${result.successCount || 0} invoices archived. ${result.failedCount || 0} could not be archived.`
        );
      } else {
        setUiError("");
      }
    },
    onError: () => setUiError("Failed to archive selected invoices."),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, payload }) => recordPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
      setPaymentDialog(EMPTY_PAYMENT_DIALOG);
      setUiError("");
    },
    onError: () => {
      setPaymentDialog((prev) => ({ ...prev, submitting: false }));
      setUiError("Failed to record payment.");
    },
  });

  const emailMutation = useMutation({
    mutationFn: ({ id, payload }) => sendInvoiceEmail(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
      setEmailDialog(EMPTY_EMAIL_DIALOG);
      setUiError("");
    },
    onError: () => {
      setEmailDialog((prev) => ({ ...prev, sending: false }));
      setUiError("Failed to send email.");
    },
  });

  // ── Save search history ────────────────────────────────────────────────
  useEffect(() => {
    const query = debouncedSearch.trim();
    if (query.length < 2) return;
    Promise.resolve(
      saveSearchHistory({ page: "invoices", query, filters: { status, date_range: dateRange } })
    )
      .then(() => invalidateSearchHistoryCache("invoices"))
      .catch(() => {});
  }, [dateRange, debouncedSearch, status]);

  // ── Derived data ───────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const payload = invoicesQuery.data;
    if (Array.isArray(payload)) return payload;
    return Array.isArray(payload?.items) ? payload.items : [];
  }, [invoicesQuery.data]);

  const totalCount = useMemo(() => {
    const payload = invoicesQuery.data;
    if (Array.isArray(payload)) return payload.length;
    return Number(payload?.total || 0);
  }, [invoicesQuery.data]);

  const summary = useMemo(() => {
    const payload = invoicesQuery.data;
    const defaults = {
      total: totalCount,
      Draft: 0, Issued: 0, Paid: 0, "Partially Paid": 0, Overdue: 0, Cancelled: 0,
    };
    if (Array.isArray(payload)) {
      return payload.reduce((acc, inv) => {
        const next = { ...acc };
        next[inv.status] = (next[inv.status] || 0) + 1;
        return next;
      }, defaults);
    }
    return { ...defaults, ...(payload?.summary || {}), total: Number(payload?.total || totalCount) };
  }, [invoicesQuery.data, totalCount]);

  const liveSearchResults = useMemo(() => {
    const term = String(search || "").trim().toLowerCase();
    if (term.length < 1) return [];
    return rows
      .filter((inv) =>
        [inv.invoice_number, inv.customer_name, inv.status]
          .some((v) => String(v || "").toLowerCase().includes(term))
      )
      .slice(0, 7)
      .map((inv) => ({
        id: inv.id,
        value: inv.invoice_number || "",
        label: inv.invoice_number || "Invoice",
        subtitle: inv.customer_name || inv.status || "Invoice",
      }));
  }, [rows, search]);

  const allVisibleSelected = rows.length > 0 && rows.every((inv) => selectedIds.includes(inv.id));

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((inv) => inv.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !rows.some((inv) => inv.id === id)));
  };

  const handleRowSelect = (invoiceId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(invoiceId) ? prev : [...prev, invoiceId];
      return prev.filter((id) => id !== invoiceId);
    });
  };

  const handleActionMenuOpen = (event, invoice) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActiveInvoice(invoice);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActiveInvoice(null);
  };

  const runBulkAction = (action) => {
    if (!selectedIds.length) return;
    if (action === "archive" || action === "delete") {
      bulkArchiveMutation.mutate(selectedIds);
      return;
    }
    bulkMutation.mutate({ action, ids: selectedIds });
  };

  const handleOpenPayment = (invoice) => {
    setPaymentDialog({
      ...EMPTY_PAYMENT_DIALOG,
      open: true,
      invoice,
      paymentDate: new Date().toISOString().slice(0, 10),
    });
    handleActionMenuClose();
  };

  const handleSubmitPayment = () => {
    const { invoice, amount, paymentDate, paymentMode, reference } = paymentDialog;
    if (!invoice || !amount) return;
    setPaymentDialog((prev) => ({ ...prev, submitting: true }));
    paymentMutation.mutate({
      id: invoice.id,
      payload: { amount: Number(amount), payment_date: paymentDate, payment_mode: paymentMode, reference },
    });
  };

  const handleOpenEmail = (invoice) => {
    setEmailDialog({ ...EMPTY_EMAIL_DIALOG, open: true, invoice });
    handleActionMenuClose();
  };

  const handleSendEmail = () => {
    const { invoice, to, message, attachPdf } = emailDialog;
    if (!invoice || !to) return;
    setEmailDialog((prev) => ({ ...prev, sending: true }));
    emailMutation.mutate({
      id: invoice.id,
      payload: { recipient_email: to, message, attach_pdf: attachPdf },
    });
  };

  const handleDownloadPDF = async (invoice) => {
    handleActionMenuClose();
    try {
      const res = await axios.get(createApiUrl(`/api/invoices/${invoice.id}/pdf`), { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `${invoice.invoice_number || "invoice"}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setUiError("Failed to download PDF.");
    }
  };

  const handleChangePage = (_, nextPage) => setPage(nextPage);
  const handleChangeRowsPerPage = (event) => setRowsPerPage(Number.parseInt(event.target.value, 10));

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-GB");
  };

  const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const isInitialLoading = invoicesQuery.isLoading && !invoicesQuery.data;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <ListPageLayout>
      <ListHeader
        title="Invoices"
        summary={`${totalCount} invoice${totalCount === 1 ? "" : "s"}`}
        rightAction={
          <Button
            variant="contained"
            onClick={() => navigate("/invoices/add")}
            startIcon={<AddIcon fontSize="small" />}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            New Invoice
          </Button>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by invoice #, customer…"
        searchPage="invoices"
        liveResults={liveSearchResults}
        onHistorySelect={setSearch}
      />

      <FilterBar
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "All",            label: "All Status" },
          { value: "Draft",          label: "Draft" },
          { value: "Issued",         label: "Issued" },
          { value: "Paid",           label: "Paid" },
          { value: "Partially Paid", label: "Partially Paid" },
          { value: "Overdue",        label: "Overdue" },
          { value: "Cancelled",      label: "Cancelled" },
          { value: "Archived",       label: "Archived" },
        ]}
        rightSlot={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              select
              size="small"
              label="Date"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              {DATE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            {dateRange === "custom" && (
              <>
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            <TextField
              size="small"
              label="Min ₹"
              value={minAmount}
              onChange={(e) => setAmountRange(e.target.value, maxAmount)}
              sx={{ width: 110 }}
            />
            <TextField
              size="small"
              label="Max ₹"
              value={maxAmount}
              onChange={(e) => setAmountRange(minAmount, e.target.value)}
              sx={{ width: 110 }}
            />
          </Box>
        }
      />

      {/* Clickable summary chips */}
      <ListSummary
        items={[
          { label: "Total",   value: summary.total   || 0, active: status === "All",     onClick: () => setStatus("All") },
          { label: "Issued",  value: summary.Issued  || 0, color: "primary", active: status === "Issued",  onClick: () => setStatus("Issued") },
          { label: "Overdue", value: summary.Overdue || 0, color: "error",   active: status === "Overdue", onClick: () => setStatus("Overdue") },
          { label: "Paid",    value: summary.Paid    || 0, color: "success", active: status === "Paid",    onClick: () => setStatus("Paid") },
          { label: "Draft",   value: summary.Draft   || 0,                   active: status === "Draft",   onClick: () => setStatus("Draft") },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={[
          ...(status === "Archived"
            ? []
            : [
                { label: "Mark Paid", color: "success", onClick: () => runBulkAction("mark_paid"), disabled: bulkMutation.isPending || bulkArchiveMutation.isPending },
                { label: "Send", onClick: () => runBulkAction("send_email"), disabled: bulkMutation.isPending || bulkArchiveMutation.isPending },
              ]),
          {
            label: status === "Archived" ? "Restore Selected" : "Archive Selected",
            color: status === "Archived" ? "success" : "warning",
            onClick: () => (status === "Archived" ? setBulkRestoreOpen(true) : runBulkAction("archive")),
            disabled: bulkMutation.isPending || bulkArchiveMutation.isPending,
          },
        ]}
      />

      {(uiError || invoicesQuery.isError) && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setUiError("")}>
          {uiError || "Failed to fetch invoices."}
        </Alert>
      )}

      <ResponsiveDataView
        isMobile={isMobile}
        renderCard={(invoice) => (
          <InvoiceCard
            invoice={invoice}
            customerName={invoice.customer_name || ""}
            onEdit={() => {
              if (status !== "Archived") {
                navigate(`/invoices/edit/${invoice.id}`);
              }
            }}
            onActionMenu={(event) => handleActionMenuOpen(event, invoice)}
          />
        )}
        columns={[
          { key: "checkbox",     label: "",             width: CHECKBOX_COLUMN_WIDTH },
          { key: "invoice_number", label: "INVOICE #" },
          { key: "customer_name",  label: "CUSTOMER" },
          { key: "status",         label: "STATUS",      width: 130 },
          { key: "due_date",       label: "DUE DATE",    width: 100 },
          { key: "amount",         label: "AMOUNT",      align: "right", width: 120 },
          { key: "balance_due",    label: "BALANCE DUE", align: "right", width: 120 },
          { key: "actions",        label: "",            align: "center", width: 100 },
        ]}
        rows={rows}
        loading={isInitialLoading}
        emptyTitle="No invoices found"
        emptySubtitle="Create your first invoice to get started"
        emptyAction={{ label: "New Invoice", onClick: () => navigate("/invoices/add") }}
        toolbar={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              py: 1,
              borderBottom: "1px solid #edf0f3",
              bgcolor: "#fbfcfd",
            }}
          >
            <Typography sx={{ fontSize: "0.82rem", color: "#6b7280" }}>
              {totalCount} invoice{totalCount === 1 ? "" : "s"}
            </Typography>
            {invoicesQuery.isFetching && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <CircularProgress size={14} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>Updating…</Typography>
              </Box>
            )}
          </Box>
        }
        renderHeader={() => (
          <TableRow>
            <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px", borderBottom: "1px solid #e6e9ee" }}>
              <Checkbox
                size="small"
                checked={allVisibleSelected}
                indeterminate={!allVisibleSelected && selectedIds.length > 0}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                sx={{ p: 0.5 }}
              />
            </TableCell>

            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "invoice_number"}
                direction={sortBy === "invoice_number" ? sortOrder : "asc"}
                onClick={() => handleSort("invoice_number")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >INVOICE #</TableSortLabel>
            </TableCell>

            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "customer_name"}
                direction={sortBy === "customer_name" ? sortOrder : "asc"}
                onClick={() => handleSort("customer_name")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >CUSTOMER</TableSortLabel>
            </TableCell>

            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 130 }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                STATUS
              </Typography>
            </TableCell>

            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 100 }}>
              <TableSortLabel
                active={sortBy === "due_date"}
                direction={sortBy === "due_date" ? sortOrder : "asc"}
                onClick={() => handleSort("due_date")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >DUE DATE</TableSortLabel>
            </TableCell>

            <TableCell align="right" sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 120 }}>
              <TableSortLabel
                active={sortBy === "total_amount"}
                direction={sortBy === "total_amount" ? sortOrder : "asc"}
                onClick={() => handleSort("total_amount")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >AMOUNT</TableSortLabel>
            </TableCell>

            <TableCell align="right" sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 120 }}>
              <TableSortLabel
                active={sortBy === "balance_due"}
                direction={sortBy === "balance_due" ? sortOrder : "asc"}
                onClick={() => handleSort("balance_due")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >BALANCE DUE</TableSortLabel>
            </TableCell>

            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 100 }} align="center" />
          </TableRow>
        )}
        renderRow={(invoice) => {
          const s = statusStyle[invoice.status] || statusStyle.Draft;
          const checked = selectedIds.includes(invoice.id);
          const isArchivedView = status === "Archived";
          const isOverdue =
            invoice.status !== "Paid" &&
            invoice.due_date &&
            new Date(invoice.due_date) < new Date();

          return (
            <TableRow
              key={invoice.id}
              hover
              onClick={() => {
                if (!isArchivedView) {
                  navigate(`/invoices/edit/${invoice.id}`);
                }
              }}
              sx={{
                cursor: isArchivedView ? "default" : "pointer",
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #edf0f3",
                  fontSize: "0.82rem",
                  color: "#374151",
                  py: 0.72,
                },
              }}
            >
              <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  size="small"
                  checked={checked}
                  onChange={(e) => handleRowSelect(invoice.id, e.target.checked)}
                  sx={{ p: 0.5 }}
                />
              </TableCell>

              <TableCell>
                <Typography sx={{ fontSize: "0.82rem", color: "#1565d8", fontWeight: 600 }}>
                  {invoice.invoice_number || "—"}
                </Typography>
                {invoice.issue_date && (
                  <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.15 }}>
                    {formatDate(invoice.issue_date)}
                  </Typography>
                )}
              </TableCell>

              <TableCell>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>
                  {invoice.customer_name || "Unknown"}
                </Typography>
                {invoice.customer_email && (
                  <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.15 }}>
                    {invoice.customer_email}
                  </Typography>
                )}
              </TableCell>

              <TableCell>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    px: s.bg === "transparent" ? 0 : 0.8,
                    py: s.bg === "transparent" ? 0 : 0.25,
                    borderRadius: "10px",
                    fontSize: "0.69rem",
                    fontWeight: 700,
                    letterSpacing: 0.22,
                    color: s.color,
                    bgcolor: s.bg,
                    textTransform: "uppercase",
                  }}
                >
                  {invoice.status || "Draft"}
                </Box>
              </TableCell>

              <TableCell sx={{ color: isOverdue ? "#c0392b !important" : undefined, fontWeight: isOverdue ? 600 : 400 }}>
                {formatDate(invoice.due_date)}
              </TableCell>

              <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
                {formatAmount(invoice.total_amount)}
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  color: Number(invoice.balance_due) > 0 ? "#c0392b !important" : "#1f7a36 !important",
                }}
              >
                {formatAmount(invoice.balance_due)}
              </TableCell>

              <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.2 }}>
                  {status !== "Archived" && invoice.status !== "Paid" && (
                    <Tooltip title="Record Payment">
                      <IconButton size="small" onClick={() => handleOpenPayment(invoice)} sx={{ color: "#1f7a36" }}>
                        <AttachMoneyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {status !== "Archived" && (
                    <Tooltip title="Send Invoice">
                      <IconButton size="small" onClick={() => handleOpenEmail(invoice)} sx={{ color: "#0f6cbd" }}>
                        <SendIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, invoice)}>
                    <MoreVertIcon sx={{ fontSize: 18, color: "#7b8493" }} />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
        pagination={{
          rowsPerPageOptions: [10, 25, 50],
          count: totalCount,
          rowsPerPage,
          page,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
      />

      {/* ── More actions menu ──────────────────────────────────────────────── */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            if (status !== "Archived") {
              navigate(`/invoices/edit/${activeInvoice?.id}`);
            }
            handleActionMenuClose();
          }}
          disabled={status === "Archived"}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {status !== "Archived" && (
          <MenuItem onClick={() => handleOpenPayment(activeInvoice)} disabled={activeInvoice?.status === "Paid"}>
            <ListItemIcon><AttachMoneyIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Record Payment</ListItemText>
          </MenuItem>
        )}
        {status !== "Archived" && (
          <MenuItem
            onClick={() => {
              bulkMutation.mutate({ action: "mark_paid", ids: [activeInvoice?.id] });
              handleActionMenuClose();
            }}
            disabled={activeInvoice?.status === "Paid"}
          >
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Mark as Paid</ListItemText>
          </MenuItem>
        )}
        {status !== "Archived" && (
          <MenuItem onClick={() => handleOpenEmail(activeInvoice)}>
            <ListItemIcon><EmailIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText>Send Invoice</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDownloadPDF(activeInvoice)}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate("/invoices/add", { state: { cloneFrom: activeInvoice } }); handleActionMenuClose(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setConfirmDeleteId(activeInvoice?.id); handleActionMenuClose(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        {status === "Archived" && (
          <MenuItem onClick={() => { setRestoreTargetId(activeInvoice?.id); handleActionMenuClose(); }}>
            <ListItemIcon><RestoreIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Restore</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <ArchiveDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        entityType="invoice"
        entityId={confirmDeleteId}
        entityLabel="Invoice"
        onArchived={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
          setConfirmDeleteId(null);
          setUiError("");
        }}
      />

      <LifecycleArchiveDialog
        open={Boolean(restoreTargetId)}
        onClose={() => setRestoreTargetId(null)}
        mode="restore"
        entityType="invoice"
        entityId={restoreTargetId}
        entityLabel="Invoice"
        onConfirmed={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
          setRestoreTargetId(null);
        }}
      />

      <LifecycleArchiveDialog
        open={bulkRestoreOpen}
        onClose={() => setBulkRestoreOpen(false)}
        mode="bulk-restore"
        entityType="invoice"
        entityIds={selectedIds}
        entityLabel="Invoice"
        entityCount={selectedIds.length}
        onConfirmed={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices-list"] });
          setSelectedIds([]);
          setBulkRestoreOpen(false);
          setUiError("");
        }}
      />

      {/* ── Record payment dialog ──────────────────────────────────────────── */}
      <Dialog open={paymentDialog.open} onClose={() => setPaymentDialog(EMPTY_PAYMENT_DIALOG)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Record Payment</Typography>
          <Typography variant="body2" color="text.secondary">
            {paymentDialog.invoice?.invoice_number} · Balance: {formatAmount(paymentDialog.invoice?.balance_due || 0)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}>
          <TextField
            label="Amount"
            type="number"
            value={paymentDialog.amount}
            onChange={(e) => setPaymentDialog((d) => ({ ...d, amount: e.target.value }))}
            fullWidth size="small" required autoFocus
            inputProps={{ min: 0.01, step: "0.01" }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            label="Payment Date"
            type="date"
            value={paymentDialog.paymentDate}
            onChange={(e) => setPaymentDialog((d) => ({ ...d, paymentDate: e.target.value }))}
            fullWidth size="small" required
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={paymentDialog.paymentMode}
              onChange={(e) => setPaymentDialog((d) => ({ ...d, paymentMode: e.target.value }))}
              label="Payment Mode"
            >
              {PAYMENT_MODES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Reference / Transaction ID (optional)"
            value={paymentDialog.reference}
            onChange={(e) => setPaymentDialog((d) => ({ ...d, reference: e.target.value }))}
            fullWidth size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setPaymentDialog(EMPTY_PAYMENT_DIALOG)} disabled={paymentDialog.submitting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained" color="success"
            startIcon={paymentDialog.submitting ? <CircularProgress size={16} color="inherit" /> : <AttachMoneyIcon />}
            onClick={handleSubmitPayment}
            disabled={paymentDialog.submitting || !paymentDialog.amount}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            {paymentDialog.submitting ? "Saving…" : "Record Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Send email dialog ──────────────────────────────────────────────── */}
      <Dialog open={emailDialog.open} onClose={() => setEmailDialog(EMPTY_EMAIL_DIALOG)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Invoice {emailDialog.invoice?.invoice_number}</DialogTitle>
        <DialogContent sx={{ pt: "12px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Recipient Email"
            fullWidth size="small" type="email"
            value={emailDialog.to}
            onChange={(e) => setEmailDialog((prev) => ({ ...prev, to: e.target.value }))}
            autoFocus
          />
          <TextField
            label="Message (optional)"
            fullWidth size="small" multiline rows={3}
            value={emailDialog.message}
            onChange={(e) => setEmailDialog((prev) => ({ ...prev, message: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={emailDialog.attachPdf}
                onChange={(e) => setEmailDialog((prev) => ({ ...prev, attachPdf: e.target.checked }))}
              />
            }
            label="Attach PDF"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialog(EMPTY_EMAIL_DIALOG)} disabled={emailDialog.sending}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={emailDialog.sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSendEmail}
            disabled={emailDialog.sending || !emailDialog.to}
            sx={{ textTransform: "none" }}
          >
            {emailDialog.sending ? "Sending…" : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </ListPageLayout>
  );
};

export default InvoiceList;
