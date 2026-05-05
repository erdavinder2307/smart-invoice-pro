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
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReceiptIcon from "@mui/icons-material/Receipt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { createApiUrl } from "../config/api";
import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import BillCard from "./common/BillCard";
import StatusBadge from "./common/StatusBadge";
import ResponsiveDataView from "./common/ResponsiveDataView";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import BulkActionBar from "./list/BulkActionBar";
import useListController from "../hooks/useListController";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useTableSorting from "../hooks/useTableSorting";
import { saveSearchHistory } from "../services/searchService";
import { invalidateSearchHistoryCache } from "./list/ListHeader";
import {
  deleteBillById,
  getBillsList,
  markBillAsPaid,
} from "../services/billService";

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

const resolveStatusBucket = (bill) => {
  const bucket = String(bill?.status_bucket || bill?.payment_status || "").trim().toLowerCase();
  if (bucket === "paid") return "Paid";
  if (bucket === "overdue") return "Overdue";
  if (bucket === "draft") return "Draft";

  const paid = Number(bill?.amount_paid || 0);
  const balance = Number(bill?.balance_due || 0);
  if (balance <= 0 && paid >= 0) return "Paid";
  return "Open";
};

const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB");
};

const BillList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [uiError, setUiError] = useState("");
  const [vendorFilter, setVendorFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("vendor_id") || "All";
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedBillForAction, setSelectedBillForAction] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const debouncedSearch = useDebouncedValue(search, 300);
  const { sortBy, sortOrder, handleSort, setSort } = useTableSorting("created_at", "desc", "bills");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextVendor = params.get("vendor_id") || "All";
    if (nextVendor !== vendorFilter) {
      setVendorFilter(nextVendor);
    }
  }, [location.search, vendorFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentBy = params.get("sort_by") || "created_at";
    const currentOrder = (params.get("sort_order") || "desc").toLowerCase();
    if (currentBy === sortBy && currentOrder === sortOrder) return;
    params.set("sort_by", sortBy || "created_at");
    params.set("sort_order", sortOrder || "desc");
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate, sortBy, sortOrder]);

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
    const currentVendor = params.get("vendor_id") || "All";
    if (currentVendor === vendorFilter || (vendorFilter === "All" && !params.has("vendor_id"))) {
      return;
    }

    if (vendorFilter === "All") params.delete("vendor_id");
    else params.set("vendor_id", vendorFilter);
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate, vendorFilter]);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      page_size: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      q: debouncedSearch,
      status: status === "All" ? "" : status,
      vendor_id: vendorFilter === "All" ? "" : vendorFilter,
      range: dateRange,
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
      vendorFilter,
    ]
  );

  const billsQuery = useQuery({
    queryKey: ["bills-list", queryParams],
    queryFn: ({ signal }) => getBillsList(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const vendorsQuery = useQuery({
    queryKey: ["bills-vendors"],
    queryFn: ({ signal }) => axios.get(createApiUrl("/api/vendors"), { signal }).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBillById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
      setUiError("");
      setConfirmDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== confirmDeleteId));
    },
    onError: (error) => setUiError(error?.response?.data?.error || t("billList.failedDelete")),
  });

  const markPaidMutation = useMutation({
    mutationFn: markBillAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
      setUiError("");
    },
    onError: (error) => setUiError(error?.response?.data?.error || "Failed to mark bill as paid."),
  });

  useEffect(() => {
    const query = debouncedSearch.trim();
    if (query.length < 2) return;

    Promise.resolve(saveSearchHistory({
      page: "bills",
      query,
      filters: {
        status,
        date_range: dateRange,
        vendor_id: vendorFilter === "All" ? "" : vendorFilter,
      },
    })).then(() => {
      invalidateSearchHistoryCache("bills");
    }).catch(() => {});
  }, [dateRange, debouncedSearch, status, vendorFilter]);

  const rows = useMemo(() => {
    const payload = billsQuery.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }, [billsQuery.data]);

  const totalCount = useMemo(() => {
    const payload = billsQuery.data;
    if (Array.isArray(payload)) return payload.length;
    return Number(payload?.total || 0);
  }, [billsQuery.data]);

  const summary = useMemo(() => {
    const payload = billsQuery.data;
    const base = {
      total: totalCount,
      draft: 0,
      open: 0,
      paid: 0,
      overdue: 0,
    };

    if (payload?.summary) {
      return {
        ...base,
        ...payload.summary,
        total: Number(payload.total || totalCount),
      };
    }

    return rows.reduce((acc, bill) => {
      const next = { ...acc };
      const bucket = resolveStatusBucket(bill).toLowerCase();
      next[bucket] = (next[bucket] || 0) + 1;
      return next;
    }, base);
  }, [billsQuery.data, rows, totalCount]);

  const vendorMap = useMemo(() => {
    const list = Array.isArray(vendorsQuery.data) ? vendorsQuery.data : [];
    const map = new Map();
    list.forEach((vendor) => {
      map.set(String(vendor.id), vendor.vendor_name || vendor.name || "");
    });
    return map;
  }, [vendorsQuery.data]);

  const liveSearchResults = useMemo(() => {
    const term = String(search || "").trim().toLowerCase();
    if (term.length < 1) return [];
    return rows
      .filter((bill) => {
        const vendorName = bill.vendor_name || vendorMap.get(String(bill.vendor_id)) || "";
        return [bill.bill_number, vendorName, bill.reference, bill.subject]
          .some((value) => String(value || "").toLowerCase().includes(term));
      })
      .slice(0, 7)
      .map((bill) => ({
        id: bill.id,
        value: bill.bill_number || vendorMap.get(String(bill.vendor_id)) || "",
        label: bill.bill_number || "Bill",
        subtitle: bill.vendor_name || vendorMap.get(String(bill.vendor_id)) || "Bill",
      }));
  }, [rows, search, vendorMap]);

  const allVisibleSelected = rows.length > 0 && rows.every((bill) => selectedIds.includes(bill.id));
  const someVisibleSelected = rows.some((bill) => selectedIds.includes(bill.id));

  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((bill) => bill.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !rows.some((bill) => bill.id === id)));
  };

  const handleRowSelect = (billId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(billId) ? prev : [...prev, billId];
      return prev.filter((id) => id !== billId);
    });
  };

  const handleActionMenuOpen = (event, bill) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedBillForAction(bill);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedBillForAction(null);
  };

  const runBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteBillById(id)));
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
      setSelectedIds([]);
      setUiError("");
    } catch (error) {
      setUiError(error?.response?.data?.error || "Failed to delete selected bills.");
    }
  };

  const runBulkMarkPaid = async () => {
    if (!selectedIds.length) return;
    try {
      const selectedRows = rows.filter((row) => selectedIds.includes(row.id));
      await Promise.all(selectedRows.map((row) => markBillAsPaid(row)));
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
      setUiError("");
    } catch (error) {
      setUiError(error?.response?.data?.error || "Failed to mark selected bills as paid.");
    }
  };

  const handleDelete = (billId) => {
    deleteMutation.mutate(billId);
  };

  const handleMarkAsPaid = (bill) => {
    markPaidMutation.mutate(bill);
    handleActionMenuClose();
  };

  const handleChangePage = (_, nextPage) => setPage(nextPage);
  const handleChangeRowsPerPage = (event) => setRowsPerPage(Number.parseInt(event.target.value, 10));

  const isLoading = billsQuery.isLoading && !billsQuery.data;
  const actionLoading = deleteMutation.isPending || markPaidMutation.isPending;

  return (
    <ListPageLayout maxWidth="xl">
      <ListHeader
        title={t("billList.title")}
        summary={`${totalCount} bills`}
        rightAction={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/bills/add")}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {t("billList.newBill")}
          </Button>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bills..."
        searchPage="bills"
        liveResults={liveSearchResults}
        onHistorySelect={setSearch}
      />

      <FilterBar
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "All", label: t("common.allStatus") },
          { value: "Draft", label: "Draft" },
          { value: "Open", label: "Open" },
          { value: "Paid", label: "Paid" },
          { value: "Overdue", label: "Overdue" },
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
              select
              size="small"
              label="Vendor"
              value={vendorFilter}
              onChange={(event) => {
                setVendorFilter(event.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="All">All Vendors</MenuItem>
              {(Array.isArray(vendorsQuery.data) ? vendorsQuery.data : []).map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.vendor_name || vendor.name || "Vendor"}
                </MenuItem>
              ))}
            </TextField>

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
            label: "Total Bills",
            value: summary.total || 0,
            active: status === "All",
            onClick: () => setStatus("All"),
          },
          {
            label: "Draft",
            value: summary.draft || 0,
            color: "default",
            active: status === "Draft",
            onClick: () => setStatus("Draft"),
          },
          {
            label: "Open",
            value: summary.open || 0,
            color: "info",
            active: status === "Open",
            onClick: () => setStatus("Open"),
          },
          {
            label: "Paid",
            value: summary.paid || 0,
            color: "success",
            active: status === "Paid",
            onClick: () => setStatus("Paid"),
          },
          {
            label: "Overdue",
            value: summary.overdue || 0,
            color: "error",
            active: status === "Overdue",
            onClick: () => setStatus("Overdue"),
          },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={[
          {
            label: "Mark Paid",
            color: "success",
            onClick: runBulkMarkPaid,
            disabled: selectedIds.length === 0,
          },
          {
            label: "Delete Selected",
            color: "error",
            onClick: runBulkDelete,
            disabled: selectedIds.length === 0,
          },
        ]}
      />

      {uiError && (
        <Alert severity="error" onClose={() => setUiError("")} sx={{ mb: 2, borderRadius: 2 }}>
          {uiError}
        </Alert>
      )}

      <ResponsiveDataView
        isMobile={isMobile}
        columns={[
          { key: "checkbox", label: "", width: CHECKBOX_COLUMN_WIDTH },
          { key: "bill_date", label: "Bill Date", sortable: true },
          { key: "bill_number", label: "Bill #", sortable: true },
          { key: "vendor_name", label: "Vendor", sortable: true },
          { key: "total_amount", label: "Amount", sortable: true, align: "right" },
          { key: "due_date", label: "Due Date", sortable: true },
          { key: "payment_status", label: "Status", sortable: true },
          { key: "actions", label: "Actions", width: 240, align: "right" },
        ]}
        rows={rows}
        loading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyIcon={<ReceiptIcon sx={{ fontSize: 48 }} />}
        emptyTitle={search || status !== "All" ? t("billList.noBills") : t("billList.noBillsYet")}
        emptySubtitle={search || status !== "All" ? "Try adjusting your search or filters" : "Create your first bill to get started."}
        emptyAction={{ label: "Create New Bill", onClick: () => navigate("/bills/add") }}
        renderCard={(bill) => (
          <BillCard
            bill={bill}
            vendorName={bill.vendor_name || vendorMap.get(String(bill.vendor_id)) || "Unknown Vendor"}
            onView={() => navigate(`/bills/${bill.id}`)}
            onEdit={() => navigate(`/bills/edit/${bill.id}`)}
            onDelete={() => setConfirmDeleteId(bill.id)}
            onMarkPaid={() => handleMarkAsPaid(bill)}
          />
        )}
        renderRow={(bill) => {
          const statusBucket = resolveStatusBucket(bill);
          return (
            <TableRow
              key={bill.id}
              hover
              sx={{
                cursor: "pointer",
                "& .MuiTableCell-root": {
                  py: 1.1,
                },
              }}
              onClick={() => navigate(`/bills/${bill.id}`)}
            >
              <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(bill.id)}
                  onChange={(event) => handleRowSelect(bill.id, event.target.checked)}
                />
              </TableCell>
              <TableCell>{formatDate(bill.bill_date || bill.created_at)}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{bill.bill_number || "-"}</Typography>
              </TableCell>
              <TableCell>{bill.vendor_name || vendorMap.get(String(bill.vendor_id)) || "Unknown Vendor"}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={700}>{formatAmount(bill.total_amount)}</Typography>
              </TableCell>
              <TableCell>{formatDate(bill.due_date)}</TableCell>
              <TableCell>
                <StatusBadge status={statusBucket} />
              </TableCell>
              <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<VisibilityIcon fontSize="small" />}
                    onClick={() => navigate(`/bills/${bill.id}`)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={() => navigate(`/bills/edit/${bill.id}`)}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Edit
                  </Button>
                  <IconButton size="small" aria-label="More" onClick={(event) => handleActionMenuOpen(event, bill)}>
                    <MoreVertIcon fontSize="small" />
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
        renderHeader={() => (
          <TableRow>
            <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }}>
              <Checkbox
                checked={allVisibleSelected}
                indeterminate={!allVisibleSelected && someVisibleSelected}
                onChange={(event) => handleSelectAllVisible(event.target.checked)}
              />
            </TableCell>
            {[
              { key: "bill_date", label: "Bill Date" },
              { key: "bill_number", label: "Bill #" },
              { key: "vendor_name", label: "Vendor" },
              { key: "total_amount", label: "Amount", align: "right" },
              { key: "due_date", label: "Due Date" },
              { key: "payment_status", label: "Status" },
            ].map((column) => (
              <TableCell
                key={column.key}
                align={column.align || "left"}
                onClick={() => handleSort(column.key)}
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                <TableSortLabel
                  active={sortBy === column.key}
                  direction={sortBy === column.key ? sortOrder : "asc"}
                  hideSortIcon={sortBy !== column.key}
                >
                  <Typography component="span" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                    {column.label}
                  </Typography>
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>Actions</TableCell>
          </TableRow>
        )}
      />

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem
          onClick={() => selectedBillForAction && handleMarkAsPaid(selectedBillForAction)}
          disabled={!selectedBillForAction || Number(selectedBillForAction.balance_due || 0) <= 0}
        >
          <ListItemIcon><DoneAllIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Mark as Paid</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedBillForAction) {
              setConfirmDeleteId(selectedBillForAction.id);
            }
            handleActionMenuClose();
          }}
          disabled={resolveStatusBucket(selectedBillForAction || {}) === "Paid"}
        >
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4,
          },
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
            disabled={actionLoading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </ListPageLayout>
  );
};

export default BillList;
