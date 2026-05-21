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
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BlockIcon from "@mui/icons-material/Block";

import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import ArchiveDialog from "./common/ArchiveDialog";
import LifecycleArchiveDialog from "./common/LifecycleArchiveDialog";
import ResponsiveDataView from "./common/ResponsiveDataView";
import PurchaseOrderCard from "./common/PurchaseOrderCard";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import buildSummaryFilterItems from "../utils/summaryFilterChips";
import BulkActionBar from "./list/BulkActionBar";
import useTableSorting from "../hooks/useTableSorting";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useListController from "../hooks/useListController";
import { createApiUrl } from "../config/api";
import {
  bulkPurchaseOrderAction,
  convertPurchaseOrderToBill,
  getPurchaseOrdersList,
  sendPurchaseOrderEmail,
} from "../services/purchaseOrderService";
import { bulkArchiveEntities } from "../services/bulkArchiveService";

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

const normalizeStatus = (value) => {
  const status = String(value || "").trim();
  if (["Sent", "Confirmed", "Issued"].includes(status)) return "Issued";
  return status || "Draft";
};

const PurchaseOrderList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const tt = (key, fallback, values) => {
    const translated = t(key, values);
    return translated === key ? fallback : translated;
  };

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

  const [vendorFilter, setVendorFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("vendor_id") || "All";
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [archivePO, setArchivePO] = useState(null);
  const [restorePO, setRestorePO] = useState(null);
  const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [emailDialog, setEmailDialog] = useState({
    open: false,
    po: null,
    to: "",
    message: "",
    attachPdf: false,
    sending: false,
  });
  const [uiError, setUiError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const debouncedSearch = useDebouncedValue(search, 300);
  const { sortBy, sortOrder, handleSort, setSort } = useTableSorting("created_at", "desc", "purchase_orders");

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
      limit: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      q: debouncedSearch,
      status: status === "All" ? "" : status,
      vendor_id: vendorFilter === "All" ? "" : vendorFilter,
      date_range: dateRange,
      date_from: dateRange === "custom" ? dateFrom : "",
      date_to: dateRange === "custom" ? dateTo : "",
      include_meta: "1",
      lifecycle: status === "Archived" ? "archived" : "active",
    }),
    [
      dateFrom,
      dateRange,
      dateTo,
      debouncedSearch,
      page,
      rowsPerPage,
      sortBy,
      sortOrder,
      status,
      vendorFilter,
    ]
  );

  const poQuery = useQuery({
    queryKey: ["purchase-orders-list", queryParams],
    queryFn: ({ signal }) => getPurchaseOrdersList(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const vendorsQuery = useQuery({
    queryKey: ["purchase-orders-vendors"],
    queryFn: ({ signal }) => axios.get(createApiUrl("/api/vendors"), { signal }).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkPurchaseOrderAction,
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["purchase-orders-list"] });
      setUiError("");
      setToast({ open: true, message: "Bulk action applied.", severity: "success" });
    },
    onError: () => setUiError("Failed to apply bulk action."),
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: (ids) => bulkArchiveEntities("purchase_order", ids),
    onSuccess: (result) => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["purchase-orders-list"] });
      if (Number(result?.failedCount || 0) > 0) {
        setUiError(
          `${result.successCount || 0} purchase orders archived. ${result.failedCount || 0} could not be archived.`
        );
      } else {
        setUiError("");
      }
      setToast({ open: true, message: "Archive action completed.", severity: "success" });
    },
    onError: () => setUiError("Failed to archive selected purchase orders."),
  });

  const rows = useMemo(() => {
    const payload = poQuery.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }, [poQuery.data]);

  const totalCount = useMemo(() => {
    const payload = poQuery.data;
    if (Array.isArray(payload)) return payload.length;
    return Number(payload?.total || 0);
  }, [poQuery.data]);

  const vendorMap = useMemo(() => {
    const list = Array.isArray(vendorsQuery.data) ? vendorsQuery.data : [];
    const map = new Map();
    list.forEach((vendor) => {
      map.set(String(vendor.id), vendor.vendor_name || vendor.name || "");
    });
    return map;
  }, [vendorsQuery.data]);

  const summary = useMemo(() => {
    const payload = poQuery.data;
    const base = {
      total: totalCount,
      draft: 0,
      issued: 0,
      received: 0,
      cancelled: 0,
    };

    if (Array.isArray(payload?.data) && payload.summary) {
      return {
        ...base,
        ...payload.summary,
        total: Number(payload.total || totalCount),
      };
    }

    return rows.reduce((acc, po) => {
      const next = { ...acc };
      const normalized = normalizeStatus(po.status);
      if (normalized === "Draft") next.draft += 1;
      if (normalized === "Issued") next.issued += 1;
      if (normalized === "Received") next.received += 1;
      if (normalized === "Cancelled") next.cancelled += 1;
      return next;
    }, base);
  }, [poQuery.data, rows, totalCount]);

  const liveSearchResults = useMemo(() => {
    const term = String(search || "").trim().toLowerCase();
    if (term.length < 1) return [];
    return rows
      .filter((po) => {
        const vendorName = po.vendor_name || vendorMap.get(String(po.vendor_id)) || "";
        return [po.po_number, po.subject, vendorName, po.status]
          .some((value) => String(value || "").toLowerCase().includes(term));
      })
      .slice(0, 7)
      .map((po) => ({
        id: po.id,
        value: po.po_number || "",
        label: po.po_number || "Purchase Order",
        subtitle: po.vendor_name || vendorMap.get(String(po.vendor_id)) || po.status || "Purchase Order",
      }));
  }, [rows, search, vendorMap]);

  const allVisibleSelected = rows.length > 0 && rows.every((po) => selectedIds.includes(po.id));

  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((po) => po.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !rows.some((po) => po.id === id)));
  };

  const handleRowSelect = (poId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(poId) ? prev : [...prev, poId];
      return prev.filter((id) => id !== poId);
    });
  };

  const runBulkAction = (action, ids = selectedIds) => {
    if (!ids.length) return;
    if (action === "delete" || action === "archive") {
      bulkArchiveMutation.mutate(ids);
      return;
    }
    bulkMutation.mutate({ action, ids });
  };

  const handleDelete = (po) => {
    setArchivePO(po);
  };

  const handleDownloadPDF = async (po) => {
    if (!po?.id) return;
    handleActionMenuClose();
    try {
      const res = await axios.get(createApiUrl(`/api/purchase-orders/${po.id}/pdf`), { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${po.po_number || "purchase-order"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setUiError("Failed to download PDF.");
    }
  };

  const handleEmailOpen = (po) => {
    setEmailDialog({ open: true, po, to: "", message: "", attachPdf: false, sending: false });
    handleActionMenuClose();
  };

  const handleEmailSend = async () => {
    const { po, to, message, attachPdf } = emailDialog;
    if (!po || !to) return;
    setEmailDialog((prev) => ({ ...prev, sending: true }));
    try {
      await sendPurchaseOrderEmail(po.id, {
        recipient_email: to,
        message,
        attach_pdf: attachPdf,
      });
      setEmailDialog({ open: false, po: null, to: "", message: "", attachPdf: false, sending: false });
      setToast({ open: true, message: "Purchase order emailed successfully.", severity: "success" });
    } catch {
      setUiError("Failed to send email.");
      setEmailDialog((prev) => ({ ...prev, sending: false }));
    }
  };

  const handleConvertToBill = async () => {
    if (!selectedPO?.id) return;
    try {
      const response = await convertPurchaseOrderToBill(selectedPO.id, {});
      if (response?.bill_id) {
        navigate(`/bills/edit/${response.bill_id}`);
      } else {
        setToast({ open: true, message: "Converted to bill.", severity: "success" });
      }
      queryClient.invalidateQueries({ queryKey: ["purchase-orders-list"] });
    } catch {
      setUiError("Failed to convert purchase order to bill.");
    }
    handleActionMenuClose();
  };

  const handleActionMenuOpen = (event, po) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedPO(po);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedPO(null);
  };

  const handleChangePage = (_, nextPage) => setPage(nextPage);
  const handleChangeRowsPerPage = (event) => setRowsPerPage(Number.parseInt(event.target.value, 10));

  const getVendorName = (po) => po.vendor_name || vendorMap.get(String(po.vendor_id)) || "Unknown Vendor";

  const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-GB");
  };

  const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const isInitialLoading = poQuery.isLoading && !poQuery.data;

  return (
    <ListPageLayout>
      <ListHeader
        title={tt("purchaseOrderList.title", "Purchase Orders")}
        summary={`${totalCount} ${tt("purchaseOrderList.title", "Purchase Orders")}`}
        rightAction={
          <Button
            variant="contained"
            onClick={() => navigate("/purchase-orders/add")}
            startIcon={<AddIcon fontSize="small" />}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            {tt("purchaseOrderList.newPurchaseOrder", "New Purchase Order")}
          </Button>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tt("purchaseOrderList.searchPlaceholder", "Search purchase orders...")}
        searchPage="purchase-orders"
        liveResults={liveSearchResults}
        onHistorySelect={setSearch}
      />

      <FilterBar
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "All", label: "All Status" },
          { value: "Draft", label: "Draft" },
          { value: "Issued", label: "Issued" },
          { value: "Received", label: "Received" },
          { value: "Cancelled", label: "Cancelled" },
          { value: "Archived", label: "Archived" },
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
          </Box>
        }
      />

      <ListSummary
        items={buildSummaryFilterItems({
          activeFilter: status,
          allFilterValue: "All",
          onFilterChange: setStatus,
          filteredCount: totalCount,
          viewAllValue: summary.total || 0,
          chips: [
            { label: "Total",     value: summary.total     || 0, filterValue: "All" },
            { label: "Draft",     value: summary.draft     || 0, color: "default", filterValue: "Draft" },
            { label: "Issued",    value: summary.issued    || 0, color: "info",    filterValue: "Issued" },
            { label: "Received",  value: summary.received  || 0, color: "success", filterValue: "Received" },
            { label: "Cancelled", value: summary.cancelled || 0, color: "error",   filterValue: "Cancelled" },
          ],
        })}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={[
          {
            label: status === "Archived" ? "Restore Selected" : "Archive Selected",
            color: status === "Archived" ? "success" : "warning",
            onClick: () => (status === "Archived" ? setBulkRestoreOpen(true) : runBulkAction("archive")),
            disabled: bulkMutation.isPending || bulkArchiveMutation.isPending,
          },
          ...(status === "Archived"
            ? []
            : [
                {
                  label: "Mark Received",
                  onClick: () => runBulkAction("mark_received"),
                  disabled: bulkMutation.isPending || bulkArchiveMutation.isPending,
                },
                {
                  label: "Cancel",
                  onClick: () => runBulkAction("cancel"),
                  disabled: bulkMutation.isPending || bulkArchiveMutation.isPending,
                },
              ]),
        ]}
      />

      {(uiError || poQuery.isError) && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setUiError("")}>
          {uiError || tt("purchaseOrderList.failedFetch", "Failed to fetch purchase orders")}
        </Alert>
      )}

      <ResponsiveDataView
        isMobile={isMobile}
        renderCard={(po) => (
          <PurchaseOrderCard
            po={{ ...po, status: normalizeStatus(po.status) }}
            vendorName={getVendorName(po)}
            onEdit={() => {
              if (status !== "Archived") {
                navigate(`/purchase-orders/edit/${po.id}`);
              }
            }}
            onDelete={() => handleDelete(po)}
            onActionMenu={(event) => {
              event.stopPropagation();
              handleActionMenuOpen(event, po);
            }}
          />
        )}
        columns={[
          { key: "checkbox", label: "", width: CHECKBOX_COLUMN_WIDTH },
          { key: "po_number", label: "Purchase Order #", sortable: true },
          { key: "vendor_name", label: "Vendor Name", sortable: true },
          { key: "order_date", label: "Date", sortable: true },
          { key: "status", label: "Status", sortable: true },
          { key: "total_amount", label: "Total Amount", align: "right", sortable: true },
          { key: "balance_due", label: "Balance / Received", align: "right", sortable: true },
          { key: "actions", label: "Actions", align: "center", width: 160 },
        ]}
        rows={rows}
        loading={isInitialLoading}
        emptyTitle={tt("purchaseOrderList.noPurchaseOrders", "No purchase orders found")}
        emptySubtitle={tt("purchaseOrderList.noPurchaseOrdersYet", "Create your first Purchase Order")}
        emptyAction={{
          label: "Create your first Purchase Order",
          onClick: () => navigate("/purchase-orders/add"),
        }}
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
              {totalCount} purchase order{totalCount === 1 ? "" : "s"}
            </Typography>
            {poQuery.isFetching && (
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
                active={sortBy === "po_number"}
                direction={sortBy === "po_number" ? sortOrder : "asc"}
                onClick={() => handleSort("po_number")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >
                PURCHASE ORDER #
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "vendor_name"}
                direction={sortBy === "vendor_name" ? sortOrder : "asc"}
                onClick={() => handleSort("vendor_name")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >
                VENDOR NAME
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "order_date" || sortBy === "created_at"}
                direction={sortBy === "order_date" || sortBy === "created_at" ? sortOrder : "asc"}
                onClick={() => handleSort("order_date")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >
                DATE
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
              <TableSortLabel
                active={sortBy === "status"}
                direction={sortBy === "status" ? sortOrder : "asc"}
                onClick={() => handleSort("status")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >
                STATUS
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }} align="right">
              <TableSortLabel
                active={sortBy === "total_amount"}
                direction={sortBy === "total_amount" ? sortOrder : "asc"}
                onClick={() => handleSort("total_amount")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >
                TOTAL AMOUNT
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }} align="right">
              <TableSortLabel
                active={sortBy === "balance_due" || sortBy === "amount_paid"}
                direction={sortBy === "balance_due" || sortBy === "amount_paid" ? sortOrder : "asc"}
                onClick={() => handleSort("balance_due")}
                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}
              >
                BALANCE / RECEIVED
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }} align="center">
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                ACTIONS
              </Typography>
            </TableCell>
          </TableRow>
        )}
        renderRow={(po) => {
          const checked = selectedIds.includes(po.id);
          const normalized = normalizeStatus(po.status);
          const amountPaid = Number(po.amount_paid || 0);
          const balanceDue = Number(po.balance_due ?? (Number(po.total_amount || 0) - amountPaid));

          return (
            <TableRow
              key={po.id}
              hover
              sx={{
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
                  onChange={(event) => handleRowSelect(po.id, event.target.checked)}
                  sx={{ p: 0.5 }}
                />
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: "0.82rem", color: "#1565d8", fontWeight: 600 }}>
                  {po.po_number || "-"}
                </Typography>
              </TableCell>
              <TableCell>{getVendorName(po)}</TableCell>
              <TableCell>{formatDate(po.order_date || po.created_at)}</TableCell>
              <TableCell>{normalized}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
                {formatAmount(po.total_amount)}
              </TableCell>
              <TableCell align="right">
                <Typography component="span" sx={{ display: "block", fontWeight: 600, color: "#111827" }}>
                  {formatAmount(balanceDue)}
                </Typography>
                <Typography component="span" sx={{ display: "block", fontSize: "0.74rem", color: "#6b7280" }}>
                  Received {formatAmount(amountPaid)}
                </Typography>
              </TableCell>
              <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (status !== "Archived") {
                        navigate(`/purchase-orders/edit/${po.id}`);
                      }
                    }}
                    title="View"
                    disabled={status === "Archived"}
                  >
                    <VisibilityIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                  </IconButton>
                  {status !== "Archived" && (
                    <IconButton size="small" onClick={() => navigate(`/purchase-orders/edit/${po.id}`)} title="Edit">
                      <EditIcon sx={{ fontSize: 18, color: "#7b8493" }} />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => (status === "Archived" ? setRestorePO(po) : handleDelete(po))} title={status === "Archived" ? "Restore" : "Archive"}>
                    {status === "Archived" ? (
                      <RestoreIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                    ) : (
                      <ArchiveIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                    )}
                  </IconButton>
                  <IconButton size="small" onClick={(event) => handleActionMenuOpen(event, po)} title="More Actions">
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

      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            if (status !== "Archived") {
              navigate(`/purchase-orders/edit/${selectedPO?.id}`);
            }
            handleActionMenuClose();
          }}
          disabled={status === "Archived"}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownloadPDF(selectedPO)} sx={{ py: 1.25 }}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        {status !== "Archived" && (
          <MenuItem onClick={() => handleEmailOpen(selectedPO)} sx={{ py: 1.25 }}>
            <ListItemIcon><EmailIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText>Send Email</ListItemText>
          </MenuItem>
        )}
        {status !== "Archived" && (
          <MenuItem onClick={() => { navigate(`/purchase-orders/edit/${selectedPO?.id}`); handleActionMenuClose(); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { navigate("/purchase-orders/add", { state: { cloneFrom: selectedPO } }); handleActionMenuClose(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {status !== "Archived" && (
          <MenuItem onClick={handleConvertToBill}>
            <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Convert to Bill</ListItemText>
          </MenuItem>
        )}
        {status !== "Archived" && (
          <MenuItem
            onClick={() => {
              runBulkAction("mark_received", selectedPO?.id ? [selectedPO.id] : []);
              handleActionMenuClose();
            }}
            disabled={normalizeStatus(selectedPO?.status) === "Received"}
          >
            <ListItemIcon><LocalShippingIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Mark as Received</ListItemText>
          </MenuItem>
        )}
        {status !== "Archived" && (
          <MenuItem
            onClick={() => {
              runBulkAction("cancel", selectedPO?.id ? [selectedPO.id] : []);
              handleActionMenuClose();
            }}
            disabled={normalizeStatus(selectedPO?.status) === "Cancelled"}
          >
            <ListItemIcon><BlockIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Cancel Purchase Order</ListItemText>
          </MenuItem>
        )}
        {status === "Archived" && (
          <MenuItem onClick={() => { setRestorePO(selectedPO); handleActionMenuClose(); }}>
            <ListItemIcon><RestoreIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Restore</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <ArchiveDialog
        open={!!archivePO}
        entityType="purchase_order"
        entityId={archivePO?.id}
        entityLabel={archivePO?.po_number || "Purchase Order"}
        onClose={() => setArchivePO(null)}
        onArchived={() => {
          setArchivePO(null);
          setSelectedIds((prev) => prev.filter((id) => id !== archivePO?.id));
          queryClient.invalidateQueries({ queryKey: ["purchase-orders-list"] });
          setToast({ open: true, message: "Purchase order archived.", severity: "success" });
        }}
      />

      <LifecycleArchiveDialog
        open={!!restorePO}
        entityType="purchase_order"
        entityId={restorePO?.id}
        entityLabel={restorePO?.po_number || "Purchase Order"}
        mode="restore"
        onClose={() => setRestorePO(null)}
        onConfirmed={() => {
          setSelectedIds((prev) => prev.filter((id) => id !== restorePO?.id));
          setRestorePO(null);
          queryClient.invalidateQueries({ queryKey: ["purchase-orders-list"] });
          setToast({ open: true, message: "Purchase order restored.", severity: "success" });
        }}
      />

      <LifecycleArchiveDialog
        open={bulkRestoreOpen}
        onClose={() => setBulkRestoreOpen(false)}
        mode="bulk-restore"
        entityType="purchase_order"
        entityIds={selectedIds}
        entityLabel="Purchase Order"
        entityCount={selectedIds.length}
        onConfirmed={() => {
          setSelectedIds([]);
          setBulkRestoreOpen(false);
          queryClient.invalidateQueries({ queryKey: ["purchase-orders-list"] });
          setToast({ open: true, message: "Purchase orders restored.", severity: "success" });
        }}
      />

      <Dialog open={emailDialog.open} onClose={() => setEmailDialog((prev) => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Email Purchase Order {emailDialog.po?.po_number}</DialogTitle>
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

      <Dialog open={toast.open} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
        <DialogTitle>{toast.severity === "error" ? "Error" : "Success"}</DialogTitle>
        <DialogContent>
          <Typography>{toast.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToast((prev) => ({ ...prev, open: false }))}>Close</Button>
        </DialogActions>
      </Dialog>
    </ListPageLayout>
  );
};

export default PurchaseOrderList;
