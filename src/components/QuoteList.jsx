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
  FormControlLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TableSortLabel from "@mui/material/TableSortLabel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import QuoteCard from "./common/QuoteCard";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import BulkActionBar from "./list/BulkActionBar";
import useTableSorting from "../hooks/useTableSorting";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useListController from "../hooks/useListController";
import { createApiUrl } from "../config/api";
import {
  bulkQuoteAction,
  deleteQuoteById,
  getQuotesList,
  sendQuoteEmail,
} from "../services/quoteService";
import { saveSearchHistory } from "../services/searchService";
import { invalidateSearchHistoryCache } from "./list/ListHeader";

const statusStyle = {
  Draft: { color: "#9aa3af", bg: "transparent" },
  Sent: { color: "#0f6cbd", bg: "#eaf4ff" },
  Accepted: { color: "#1f7a36", bg: "#eaf7ee" },
  Declined: { color: "#a3320b", bg: "#feefe8" },
  Expired: { color: "#9a6700", bg: "#fff6d6" },
  Converted: { color: "#5b21b6", bg: "#f4efff" },
};

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

const QuoteList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [emailDialog, setEmailDialog] = useState({
    open: false,
    quote: null,
    to: "",
    message: "",
    attachPdf: false,
    sending: false,
  });
  const [uiError, setUiError] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const { sortBy, sortOrder, handleSort, setSort } = useTableSorting("created_at", "desc", "quotes");

  // Keep URL and sort state in sync for shareable list views.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextSortBy = params.get("sort_by") || "created_at";
    const nextSortOrder = (params.get("sort_order") || "desc").toLowerCase();
    if (nextSortBy !== sortBy || nextSortOrder !== sortOrder) {
      setSort(nextSortBy, nextSortOrder === "asc" ? "asc" : "desc");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentBy = params.get("sort_by") || "created_at";
    const currentOrder = (params.get("sort_order") || "desc").toLowerCase();
    if (currentBy === sortBy && currentOrder === sortOrder) return;
    params.set("sort_by", sortBy || "created_at");
    params.set("sort_order", sortOrder || "desc");
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate, sortBy, sortOrder]);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      page_size: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      q: debouncedSearch,
      status: status === "All" ? "" : status,
      date_range: dateRange,
      date_from: dateRange === "custom" ? dateFrom : "",
      date_to: dateRange === "custom" ? dateTo : "",
      min_amount: minAmount,
      max_amount: maxAmount,
      include_meta: "1",
    }),
    [
      dateFrom,
      dateRange,
      dateTo,
      debouncedSearch,
      maxAmount,
      minAmount,
      page,
      rowsPerPage,
      sortBy,
      sortOrder,
      status,
    ]
  );

  const quotesQuery = useQuery({
    queryKey: ["quotes-list", queryParams],
    queryFn: ({ signal }) => getQuotesList(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const customersQuery = useQuery({
    queryKey: ["quotes-customers"],
    queryFn: ({ signal }) => axios.get(createApiUrl("/api/customers"), { signal }).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuoteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes-list"] });
      setUiError("");
      setConfirmDeleteId(null);
    },
    onError: () => setUiError(t("quoteList.failedDelete") || "Failed to delete quote."),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkQuoteAction,
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["quotes-list"] });
      setUiError("");
    },
    onError: () => setUiError(t("quoteList.failedBulk") || "Failed to apply bulk action."),
  });

  useEffect(() => {
    const query = debouncedSearch.trim();
    if (query.length < 2) return;
    Promise.resolve(saveSearchHistory({
      page: "quotes",
      query,
      filters: {
        status,
        date_range: dateRange,
      },
    })).then(() => {
      invalidateSearchHistoryCache("quotes");
    }).catch(() => {});
  }, [dateRange, debouncedSearch, status]);

  const rows = useMemo(() => {
    const payload = quotesQuery.data;
    if (Array.isArray(payload)) return payload;
    return Array.isArray(payload?.items) ? payload.items : [];
  }, [quotesQuery.data]);

  const totalCount = useMemo(() => {
    const payload = quotesQuery.data;
    if (Array.isArray(payload)) return payload.length;
    return Number(payload?.total || 0);
  }, [quotesQuery.data]);

  const summary = useMemo(() => {
    const payload = quotesQuery.data;
    const defaultSummary = {
      total: totalCount,
      Draft: 0,
      Sent: 0,
      Accepted: 0,
      Converted: 0,
      Declined: 0,
      Expired: 0,
    };
    if (Array.isArray(payload)) {
      return payload.reduce((acc, item) => {
        const next = { ...acc };
        next[item.status] = (next[item.status] || 0) + 1;
        return next;
      }, defaultSummary);
    }
    return {
      ...defaultSummary,
      ...(payload?.summary || {}),
      total: Number(payload?.total || totalCount),
    };
  }, [quotesQuery.data, totalCount]);

  const customerMap = useMemo(() => {
    const list = Array.isArray(customersQuery.data) ? customersQuery.data : [];
    const map = new Map();
    list.forEach((customer) => {
      map.set(String(customer.id), customer.name || customer.display_name || "");
    });
    return map;
  }, [customersQuery.data]);

  const liveSearchResults = useMemo(() => {
    const term = String(search || "").trim().toLowerCase();
    if (term.length < 1) return [];
    return rows
      .filter((quote) => {
        const customerName = quote.customer_name || customerMap.get(String(quote.customer_id)) || "";
        return [quote.quote_number, customerName, quote.status, quote.reference_number]
          .some((value) => String(value || "").toLowerCase().includes(term));
      })
      .slice(0, 7)
      .map((quote) => ({
        id: quote.id,
        value: quote.quote_number || quote.customer_name || "",
        label: quote.quote_number || "Quote",
        subtitle: quote.customer_name || customerMap.get(String(quote.customer_id)) || quote.status || "Quote",
      }));
  }, [customerMap, rows, search]);

  const allVisibleSelected = rows.length > 0 && rows.every((quote) => selectedIds.includes(quote.id));

  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((quote) => quote.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !rows.some((quote) => quote.id === id)));
  };

  const handleRowSelect = (quoteId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(quoteId) ? prev : [...prev, quoteId];
      return prev.filter((id) => id !== quoteId);
    });
  };

  const handleDelete = (quoteId) => {
    deleteMutation.mutate(quoteId);
  };

  const runBulkAction = (action) => {
    if (!selectedIds.length) return;
    bulkMutation.mutate({ action, ids: selectedIds });
  };

  const handleActionMenuOpen = (event, quote) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedQuote(null);
  };

  const handleDownloadPDF = async (quote) => {
    handleActionMenuClose();
    try {
      const res = await axios.get(createApiUrl(`/api/quotes/${quote.id}/pdf`), { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${quote.quote_number || "quote"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setUiError(t("quoteList.failedDownload") || "Failed to download PDF.");
    }
  };

  const handleEmailOpen = (quote) => {
    setEmailDialog({ open: true, quote, to: "", message: "", attachPdf: false, sending: false });
    handleActionMenuClose();
  };

  const handleEmailSend = async () => {
    const { quote, to, message, attachPdf } = emailDialog;
    if (!to) return;
    setEmailDialog((prev) => ({ ...prev, sending: true }));
    try {
      await sendQuoteEmail(quote.id, {
        recipient_email: to,
        message,
        attach_pdf: attachPdf,
      });
      setEmailDialog({ open: false, quote: null, to: "", message: "", attachPdf: false, sending: false });
      queryClient.invalidateQueries({ queryKey: ["quotes-list"] });
    } catch {
      setUiError(t("quoteList.failedSendEmail") || "Failed to send email.");
      setEmailDialog((prev) => ({ ...prev, sending: false }));
    }
  };

  const handleConvertToInvoice = () => {
    if (selectedQuote) navigate(`/quotes/convert/${selectedQuote.id}/invoice`);
    handleActionMenuClose();
  };

  const handleConvertToSalesOrder = () => {
    if (selectedQuote) navigate(`/quotes/convert/${selectedQuote.id}/sales-order`);
    handleActionMenuClose();
  };

  const handleChangePage = (_, nextPage) => setPage(nextPage);
  const handleChangeRowsPerPage = (event) => setRowsPerPage(Number.parseInt(event.target.value, 10));

  const getCustomerName = (quote) => quote.customer_name || customerMap.get(String(quote.customer_id)) || "Unknown";

  const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-GB");
  };

  const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const isInitialLoading = quotesQuery.isLoading && !quotesQuery.data;

  return (
    <ListPageLayout>
      <ListHeader
        title={t("quoteList.title")}
        summary={`${totalCount} quotes`}
        rightAction={
          <Button
            variant="contained"
            onClick={() => navigate("/quotes/add")}
            startIcon={<AddIcon fontSize="small" />}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            {t("quoteList.newQuote")}
          </Button>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("quoteList.searchPlaceholder")}
        searchPage="quotes"
        liveResults={liveSearchResults}
        onHistorySelect={setSearch}
      />

      <FilterBar
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "All", label: "All Status" },
          { value: "Draft", label: "Draft" },
          { value: "Sent", label: "Sent" },
          { value: "Accepted", label: "Accepted" },
          { value: "Declined", label: "Declined" },
          { value: "Expired", label: "Expired" },
          { value: "Converted", label: "Converted" },
        ]}
        rightSlot={
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              select
              size="small"
              label="Date"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              sx={{ minWidth: 140 }}
            >
              {DATE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>

            {dateRange === "custom" && (
              <>
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            <TextField
              size="small"
              label="Min ₹"
              value={minAmount}
              onChange={(event) => setAmountRange(event.target.value, maxAmount)}
              sx={{ width: 110 }}
            />
            <TextField
              size="small"
              label="Max ₹"
              value={maxAmount}
              onChange={(event) => setAmountRange(minAmount, event.target.value)}
              sx={{ width: 110 }}
            />
          </Box>
        }
      />

      <ListSummary
        items={[
          {
            label: "Total",
            value: summary.total || 0,
            active: status === "All",
            onClick: () => setStatus("All"),
          },
          {
            label: "Draft",
            value: summary.Draft || 0,
            color: "default",
            active: status === "Draft",
            onClick: () => setStatus("Draft"),
          },
          {
            label: "Accepted",
            value: summary.Accepted || 0,
            color: "success",
            active: status === "Accepted",
            onClick: () => setStatus("Accepted"),
          },
          {
            label: "Converted",
            value: summary.Converted || 0,
            color: "info",
            active: status === "Converted",
            onClick: () => setStatus("Converted"),
          },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={[
          {
            label: "Delete",
            color: "error",
            onClick: () => runBulkAction("delete"),
            disabled: bulkMutation.isPending,
          },
          {
            label: "Mark Accepted",
            onClick: () => runBulkAction("mark_accepted"),
            disabled: bulkMutation.isPending,
          },
          {
            label: "Convert to Invoice",
            onClick: () => runBulkAction("convert_to_invoice"),
            disabled: bulkMutation.isPending,
          },
        ]}
      />

      {(uiError || quotesQuery.isError) && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setUiError("")}>
          {uiError || t("quoteList.failedFetch")}
        </Alert>
      )}

      <ResponsiveDataView
        isMobile={isMobile}
        renderCard={(quote) => (
          <QuoteCard
            quote={quote}
            customerName={getCustomerName(quote)}
            onEdit={() => navigate(`/quotes/edit/${quote.id}`)}
            onActionMenu={(event) => {
              event.stopPropagation();
              handleActionMenuOpen(event, quote);
            }}
          />
        )}
        columns={[
          { key: "checkbox", label: "", width: CHECKBOX_COLUMN_WIDTH },
          { key: "date", label: "DATE" },
          { key: "quote_number", label: "QUOTE NUMBER" },
          { key: "reference_number", label: "REFERENCE NUMBER" },
          { key: "customer_name", label: "CUSTOMER NAME" },
          { key: "status", label: "STATUS", width: 110 },
          { key: "amount", label: "AMOUNT", align: "right", width: 120 },
          { key: "actions", label: "", align: "center", width: 62 },
        ]}
        rows={rows}
        loading={isInitialLoading}
        emptyTitle={t("quoteList.noQuotes")}
        emptySubtitle={t("quoteList.createFirst")}
        emptyAction={{ label: t("quoteList.newQuote"), onClick: () => navigate("/quotes/add") }}
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
              {totalCount} quote{totalCount === 1 ? "" : "s"}
            </Typography>
            {quotesQuery.isFetching && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <CircularProgress size={14} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  Updating...
                </Typography>
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
                onChange={(event) => handleSelectAllVisible(event.target.checked)}
                sx={{ p: 0.5 }}
              />
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "created_at"}
                direction={sortBy === "created_at" ? sortOrder : "asc"}
                onClick={() => handleSort("created_at")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >DATE</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "quote_number"}
                direction={sortBy === "quote_number" ? sortOrder : "asc"}
                onClick={() => handleSort("quote_number")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >QUOTE NUMBER</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>REFERENCE NUMBER</Typography>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "customer_name"}
                direction={sortBy === "customer_name" ? sortOrder : "asc"}
                onClick={() => handleSort("customer_name")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >CUSTOMER NAME</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 110 }}>
              <TableSortLabel
                active={sortBy === "status"}
                direction={sortBy === "status" ? sortOrder : "asc"}
                onClick={() => handleSort("status")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >STATUS</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 120 }} align="right">
              <TableSortLabel
                active={sortBy === "total_amount"}
                direction={sortBy === "total_amount" ? sortOrder : "asc"}
                onClick={() => handleSort("total_amount")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >AMOUNT</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 62 }} align="center" />
          </TableRow>
        )}
        renderRow={(quote) => {
          const s = statusStyle[quote.status] || statusStyle.Draft;
          const checked = selectedIds.includes(quote.id);
          return (
            <TableRow
              key={quote.id}
              hover
              onClick={() => navigate(`/quotes/edit/${quote.id}`)}
              sx={{
                cursor: "pointer",
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #edf0f3",
                  fontSize: "0.82rem",
                  color: "#374151",
                  py: 0.72,
                },
              }}
            >
              <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  size="small"
                  checked={checked}
                  onChange={(event) => handleRowSelect(quote.id, event.target.checked)}
                  sx={{ p: 0.5 }}
                />
              </TableCell>
              <TableCell>{formatDate(quote.issue_date || quote.created_at)}</TableCell>
              <TableCell>
                <Typography sx={{ fontSize: "0.82rem", color: "#1565d8", fontWeight: 600 }}>
                  {quote.quote_number || "-"}
                </Typography>
              </TableCell>
              <TableCell>{quote.reference_number || "-"}</TableCell>
              <TableCell>{getCustomerName(quote)}</TableCell>
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
                  {quote.status || "Draft"}
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
                {formatAmount(quote.total_amount)}
              </TableCell>
              <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                <IconButton size="small" onClick={(event) => handleActionMenuOpen(event, quote)}>
                  <MoreVertIcon sx={{ fontSize: 18, color: "#7b8493" }} />
                </IconButton>
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

      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem onClick={() => handleDownloadPDF(selectedQuote)} sx={{ py: 1.25 }}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEmailOpen(selectedQuote)} sx={{ py: 1.25 }}>
          <ListItemIcon><EmailIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/quotes/edit/${selectedQuote?.id}`); handleActionMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate("/quotes/add", { state: { cloneFrom: selectedQuote } }); handleActionMenuClose(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToInvoice} disabled={selectedQuote?.status === "Converted"}>
          <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Convert to Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToSalesOrder} disabled={selectedQuote?.status === "Converted"}>
          <ListItemIcon><ShoppingCartIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Convert to Sales Order</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setConfirmDeleteId(selectedQuote?.id); handleActionMenuClose(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(confirmDeleteId)} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this quote? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button onClick={() => handleDelete(confirmDeleteId)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={emailDialog.open} onClose={() => setEmailDialog((prev) => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Email Quote {emailDialog.quote?.quote_number}</DialogTitle>
        <DialogContent sx={{ pt: "12px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Recipient Email"
            fullWidth
            size="small"
            type="email"
            value={emailDialog.to}
            onChange={(event) => setEmailDialog((prev) => ({ ...prev, to: event.target.value }))}
          />
          <TextField
            label="Message (optional)"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={emailDialog.message}
            onChange={(event) => setEmailDialog((prev) => ({ ...prev, message: event.target.value }))}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={emailDialog.attachPdf}
                onChange={(event) => setEmailDialog((prev) => ({ ...prev, attachPdf: event.target.checked }))}
              />
            }
            label="Attach PDF"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialog((prev) => ({ ...prev, open: false }))} disabled={emailDialog.sending}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailSend} disabled={emailDialog.sending || !emailDialog.to}>
            {emailDialog.sending ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </ListPageLayout>
  );
};

export default QuoteList;
