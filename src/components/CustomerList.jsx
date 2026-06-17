import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TableCell,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import CustomerCard from "./common/CustomerCard";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PaymentsIcon from "@mui/icons-material/Payments";
import RestoreIcon from "@mui/icons-material/Restore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useTranslation } from "react-i18next";
import { formatCurrency as formatCurrencyByLocale } from "../utils/intlFormatters";
import axios from "axios";
import { createApiUrl } from "../config/api";
import { getCustomers, mergeCustomerInto } from "../services/customerService";
import { recordPayment } from "../services/invoiceService";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import BulkActionBar from "./list/BulkActionBar";
import ArchiveDialog from "./common/ArchiveDialog";
import LifecycleArchiveDialog from "./common/LifecycleArchiveDialog";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePermission } from "../context/PermissionContext";
import {
  buildApiDateFilterParams,
  formatDateFilterLabel,
  readDateFilterQuery,
} from "../utils/dateRangeFilters";
import { dedupeCustomers } from "../utils/customerData";
import useTableSorting from "../hooks/useTableSorting";
import { saveSearchHistory } from "../services/searchService";
import { invalidateSearchHistoryCache } from "./list/ListHeader";
import { buildSummaryFilterItems } from "../utils/summaryFilterChips";

const VIEW_OPTIONS = ["All", "Active", "Inactive", "Archived", "With Dues", "Overdue"];
const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Card", "Cheque"];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTranslationFallback = (translate, key, fallback, values) => {
  const translated = translate(key, values);
  return translated === key ? fallback : translated;
};

const normalizeCustomer = (customer) => {
  const displayName = customer.display_name
    || customer.name
    || [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim()
    || "Untitled Customer";

  return {
    ...customer,
    name: displayName,
    company_name: customer.company_name || displayName,
    email: customer.email || "—",
    phone: customer.phone || customer.mobile || "—",
    activityStatus: customer.status || (customer.is_active === false ? "Inactive" : "Active"),
    receivables: toNumber(customer.receivables || customer.outstanding_amount || customer.balance_due),
    overdueAmount: toNumber(customer.overdue_amount || customer.overdue || customer.overdue_receivables),
    totalRevenue: toNumber(customer.total_revenue || customer.revenue || customer.lifetime_value || customer.total_invoiced),
    lastTransactionDate: customer.last_transaction_date || customer.last_invoice_date || customer.last_payment_date || customer.updated_at || customer.created_at || "",
  };
};

const getHealthMeta = (customer, highValueThreshold, translate) => {
  const lastTxnTime = customer.lastTransactionDate ? new Date(customer.lastTransactionDate).getTime() : 0;
  const daysSinceTransaction = lastTxnTime > 0 ? Math.floor((Date.now() - lastTxnTime) / (1000 * 60 * 60 * 24)) : null;
  const isInactive = customer.activityStatus === "Inactive";
  const hasOverdue = customer.overdueAmount > 0;
  const hasReceivables = customer.receivables > 0;
  const isHighValue = customer.totalRevenue >= highValueThreshold && customer.totalRevenue > 0;

  let score = 85;
  if (isHighValue) score += 8;
  if (hasReceivables) score -= 12;
  if (hasOverdue) score -= 18;
  if (daysSinceTransaction !== null && daysSinceTransaction > 45) score -= 8;
  if (daysSinceTransaction !== null && daysSinceTransaction > 180) score -= 12;
  if (daysSinceTransaction === null) score -= 10;
  if (isInactive) score -= 25;
  score = Math.max(0, Math.min(100, score));

  if (isInactive) {
    return {
      type: "inactive",
      label: getTranslationFallback(translate, "customerList.status.inactive", "Inactive"),
      color: "default",
      score,
    };
  }

  if (hasOverdue || (hasReceivables && daysSinceTransaction !== null && daysSinceTransaction > 45) || score < 55) {
    return {
      type: "atRisk",
      label: getTranslationFallback(translate, "customerList.status.atRisk", "At Risk"),
      color: "error",
      score,
    };
  }

  if (isHighValue) {
    return {
      type: "highValue",
      label: getTranslationFallback(translate, "customerList.status.highValue", "High Value"),
      color: "secondary",
      score,
    };
  }

  return {
    type: "active",
    label: getTranslationFallback(translate, "customerList.status.active", "Active"),
    color: "success",
    score,
  };
};

const CustomerList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = usePermission();
  const canCreate = can('customers', 'create');
  const canEdit   = can('customers', 'edit');
  const canDelete = can('customers', 'delete');
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [restoreTargetId, setRestoreTargetId] = useState(null);
  const [confirmBulkArchiveOpen, setConfirmBulkArchiveOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [immediateSearchTerm, setImmediateSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const value = new URLSearchParams(location.search).get("view") || "All";
    return VIEW_OPTIONS.includes(value) ? value : "All";
  });
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    customer: null,
    invoices: [],
    invoiceId: "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: "Bank Transfer",
    loading: false,
    saving: false,
    error: "",
  });
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const effectiveSearchTerm = immediateSearchTerm || debouncedSearch;
  const lastSavedQueryRef = useRef("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const createdFilter = useMemo(() => readDateFilterQuery(location.search, "created"), [location.search]);
  const apiDateFilters = useMemo(() => buildApiDateFilterParams(createdFilter, "created"), [createdFilter]);
  const createdFilterLabel = useMemo(() => formatDateFilterLabel(createdFilter, t), [createdFilter, t]);

  const { sortBy, sortOrder, handleSort, sortParams } = useTableSorting("name", "asc", "customers");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [mergingIds, setMergingIds] = useState(new Set());
  const [mergedIds, setMergedIds] = useState(new Set());

  const tl = useCallback((key, fallback, values) => getTranslationFallback(t, key, fallback, values), [t]);

  const fetchCustomers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await getCustomers({ ...filters, lifecycle: "all" });
      setCustomers(Array.isArray(data) ? data.map(normalizeCustomer) : []);
    } catch {
      setCustomers([]);
      setError(tl("customerList.failedToLoad", "Failed to load customers."));
    } finally {
      setLoading(false);
    }
  }, [tl]);

  useEffect(() => {
    fetchCustomers({ ...apiDateFilters, ...sortParams });
  }, [apiDateFilters, fetchCustomers, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleCustomerCreated = () => {
      fetchCustomers(apiDateFilters);
    };

    window.addEventListener("customer:created", handleCustomerCreated);
    return () => window.removeEventListener("customer:created", handleCustomerCreated);
  }, [apiDateFilters, fetchCustomers]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setToast({ open: true, message: location.state.successMessage, severity: "success" });
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // Sync URL → state. Only re-run when the URL changes, NOT when statusFilter changes.
  // Including statusFilter in deps causes a flip-flop: the user selects "Active", Effect B
  // queues a navigate to ?view=Active, but this effect fires first (URL is still blank),
  // sees "All" ≠ "Active" and reverts statusFilter back to "All" — infinite loop.
  useEffect(() => {
    const value = new URLSearchParams(location.search).get("view") || "All";
    setStatusFilter(VIEW_OPTIONS.includes(value) ? value : "All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    setPage(0);
  }, [effectiveSearchTerm, statusFilter, location.search]);

  useEffect(() => {
    if (!immediateSearchTerm) return;
    if (immediateSearchTerm.trim().toLowerCase() === debouncedSearch.trim().toLowerCase()) {
      setImmediateSearchTerm("");
    }
  }, [debouncedSearch, immediateSearchTerm]);

  useEffect(() => {
    const query = debouncedSearch.trim();
    const normalized = query.toLowerCase();
    if (query.length < 2 || normalized === lastSavedQueryRef.current) return;

    lastSavedQueryRef.current = normalized;
    saveSearchHistory({
      page: "customers",
      query,
      filters: {
        view: statusFilter,
        created_range: createdFilter?.range || "",
      },
    }).then(() => {
      invalidateSearchHistoryCache("customers");
    }).catch(() => {});
  }, [createdFilter?.range, debouncedSearch, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentView = params.get("view") || "All";
    if (currentView === statusFilter || (statusFilter === "All" && !params.has("view"))) {
      return;
    }

    if (statusFilter === "All") params.delete("view");
    else params.set("view", statusFilter);
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate, statusFilter]);

  const { uniqueCustomers, duplicateCount, duplicateRecords } = useMemo(() => dedupeCustomers(customers), [customers]);

  const highValueThreshold = useMemo(() => {
    const ranked = uniqueCustomers
      .map((customer) => customer.totalRevenue)
      .filter((value) => value > 0)
      .sort((a, b) => b - a);
    return ranked[Math.min(4, Math.max(ranked.length - 1, 0))] || 100000;
  }, [uniqueCustomers]);

  const enrichedCustomers = useMemo(() => (
    uniqueCustomers.map((customer) => ({
      ...customer,
      health: getHealthMeta(customer, highValueThreshold, t),
    }))
  ), [highValueThreshold, t, uniqueCustomers]);

  const filteredCustomers = useMemo(() => {
    const term = effectiveSearchTerm.trim().toLowerCase();

    const filtered = enrichedCustomers.filter((customer) => {
      const isArchived = customer.status === "ARCHIVED";
      const matchesSearch = !term || [
        customer.name,
        customer.company_name,
        customer.email,
        customer.phone,
        customer.gst_number,
      ].some((value) => String(value || "").toLowerCase().includes(term));

      const matchesStatus = (
        statusFilter === "All"
        || (statusFilter === "Active" && customer.activityStatus === "Active" && !isArchived)
        || (statusFilter === "Inactive" && customer.activityStatus === "Inactive")
        || (statusFilter === "Archived" && isArchived)
        || (statusFilter === "With Dues" && customer.receivables > 0 && !isArchived)
        || (statusFilter === "Overdue" && customer.overdueAmount > 0 && !isArchived)
      );

      return matchesSearch && matchesStatus;
    });

    // Column sort (client-side for computed fields; backend already sorts for 'display_name')
    if (sortBy) {
      const dir = sortOrder === "asc" ? 1 : -1;
      return [...filtered].sort((a, b) => {
        if (sortBy === "name") return dir * String(a.name || "").localeCompare(String(b.name || ""));
        if (sortBy === "totalRevenue") return dir * (a.totalRevenue - b.totalRevenue);
        if (sortBy === "receivables") return dir * (a.receivables - b.receivables);
        if (sortBy === "overdueAmount") return dir * (a.overdueAmount - b.overdueAmount);
        return 0;
      });
    }

    // Default: overdue first, then outstanding, then revenue
    return filtered.sort((a, b) => {
      if (a.overdueAmount !== b.overdueAmount) return b.overdueAmount - a.overdueAmount;
      if (a.receivables !== b.receivables) return b.receivables - a.receivables;
      return b.totalRevenue - a.totalRevenue;
    });
  }, [effectiveSearchTerm, enrichedCustomers, sortBy, sortOrder, statusFilter]);

  const liveSearchResults = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (term.length < 1) return [];

    return enrichedCustomers
      .filter((customer) => [customer.name, customer.company_name, customer.email, customer.phone]
        .some((value) => String(value || "").toLowerCase().includes(term)))
      .slice(0, 7)
      .map((customer) => ({
        id: customer.id,
        value: customer.name,
        label: customer.name,
        subtitle: customer.email || customer.phone || "Customer",
      }));
  }, [enrichedCustomers, searchTerm]);

  const paginatedCustomers = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const summaryBaseCustomers = useMemo(() => {
    const term = effectiveSearchTerm.trim().toLowerCase();
    if (!term) return enrichedCustomers;
    return enrichedCustomers.filter((customer) => [
      customer.name,
      customer.company_name,
      customer.email,
      customer.phone,
      customer.gst_number,
    ].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [effectiveSearchTerm, enrichedCustomers]);

  const topCustomers = useMemo(() => (
    [...enrichedCustomers].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5)
  ), [enrichedCustomers]);

  const handleCreateInvoice = (customer) => {
    navigate("/invoices/add", { state: { quickCreateCustomerId: customer.id } });
  };

  const handleOpenPaymentDialog = async (customer) => {
    setPaymentDialog((prev) => ({
      ...prev,
      open: true,
      customer,
      invoices: [],
      invoiceId: "",
      amount: "",
      error: "",
      loading: true,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMode: "Bank Transfer",
    }));

    try {
      const { data } = await axios.get(createApiUrl(`/api/customers/${customer.id}/overview`));
      const openInvoices = (data?.invoices || []).filter((invoice) => toNumber(invoice.balance_due) > 0);
      const firstInvoice = openInvoices[0] || null;
      setPaymentDialog((prev) => ({
        ...prev,
        invoices: openInvoices,
        invoiceId: firstInvoice?.id || "",
        amount: firstInvoice ? String(toNumber(firstInvoice.balance_due)) : "",
        error: openInvoices.length ? "" : tl("customerList.noOutstandingInvoices", "No outstanding invoices for this customer."),
        loading: false,
      }));
    } catch {
      setPaymentDialog((prev) => ({
        ...prev,
        loading: false,
        error: tl("customerList.paymentLoadFailed", "Failed to load outstanding invoices."),
      }));
    }
  };

  const handlePaymentInvoiceChange = (invoiceId) => {
    setPaymentDialog((prev) => {
      const selectedInvoice = prev.invoices.find((invoice) => invoice.id === invoiceId);
      return {
        ...prev,
        invoiceId,
        amount: selectedInvoice ? String(toNumber(selectedInvoice.balance_due)) : prev.amount,
      };
    });
  };

  const handleSubmitPayment = async () => {
    if (!paymentDialog.invoiceId) return;

    setPaymentDialog((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      await recordPayment(paymentDialog.invoiceId, {
        amount: toNumber(paymentDialog.amount),
        payment_mode: paymentDialog.paymentMode,
        payment_date: paymentDialog.paymentDate,
        notes: `Recorded from ${tl("customerList.title", "Customer Management Dashboard")}`,
      });

      setPaymentDialog((prev) => ({
        ...prev,
        open: false,
        saving: false,
      }));
      setToast({ open: true, message: tl("customerList.paymentSuccess", "Payment recorded successfully."), severity: "success" });
      await fetchCustomers(apiDateFilters);
    } catch (err) {
      setPaymentDialog((prev) => ({
        ...prev,
        saving: false,
        error: err.response?.data?.error || tl("customerList.paymentSaveFailed", "Failed to record payment."),
      }));
    }
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialog({
      open: false,
      customer: null,
      invoices: [],
      invoiceId: "",
      amount: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMode: "Bank Transfer",
      loading: false,
      saving: false,
      error: "",
    });
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

  const clearFilters = () => {
    navigate("/customers");
  };

  const allVisibleSelected = paginatedCustomers.length > 0
    && paginatedCustomers.every((customer) => selectedCustomers.includes(customer.id));
  const someVisibleSelected = paginatedCustomers.some((customer) => selectedCustomers.includes(customer.id));

  const activeCount = summaryBaseCustomers.filter((customer) => customer.activityStatus === "Active" && customer.status !== "ARCHIVED").length;
  const inactiveCount = summaryBaseCustomers.filter((customer) => customer.activityStatus === "Inactive").length;
  const totalReceivables = summaryBaseCustomers
    .filter((customer) => customer.status !== "ARCHIVED" && customer.receivables > 0)
    .reduce((sum, customer) => sum + customer.receivables, 0);
  const totalOverdue = summaryBaseCustomers
    .filter((customer) => customer.status !== "ARCHIVED" && customer.overdueAmount > 0)
    .reduce((sum, customer) => sum + customer.overdueAmount, 0);

  const summaryItems = useMemo(() => (
    buildSummaryFilterItems({
      activeFilter: statusFilter,
      allFilterValue: "All",
      onFilterChange: setStatusFilter,
      filteredCount: filteredCustomers.length,
      filteredLabel: statusFilter,
      viewAllValue: summaryBaseCustomers.length,
      chips: [
        {
          label: tl("customerList.metrics.total", "Total customers"),
          value: summaryBaseCustomers.length,
          filterValue: "All",
        },
        {
          label: tl("customerList.metrics.active", "Active"),
          value: activeCount,
          color: "success",
          filterValue: "Active",
        },
        {
          label: tl("customerList.metrics.inactive", "Inactive"),
          value: inactiveCount,
          color: "default",
          filterValue: "Inactive",
        },
        {
          label: tl("customerList.metrics.receivables", "Receivables"),
          value: formatCurrencyByLocale(totalReceivables, i18n.language),
          color: "info",
          filterValue: "With Dues",
        },
        {
          label: tl("customerList.metrics.overdue", "Overdue"),
          value: formatCurrencyByLocale(totalOverdue, i18n.language),
          color: "error",
          filterValue: "Overdue",
        },
      ],
    })
  ), [
    activeCount,
    filteredCustomers.length,
    i18n.language,
    inactiveCount,
    setStatusFilter,
    statusFilter,
    summaryBaseCustomers.length,
    tl,
    totalOverdue,
    totalReceivables,
  ]);

  const filterOptions = VIEW_OPTIONS.map((value) => ({
    value,
    label: tl(`customerList.filters.${value.replace(/\s+/g, "").replace(/^./, (match) => match.toLowerCase())}`, value),
  }));

  return (
    <ListPageLayout>
      <ListHeader
        title={tl("customerList.title", "Customer Management Dashboard")}
        summary={loading ? tl("customerList.summaryLoading", "Loading...") : tl("customerList.summary", `${filteredCustomers.length} customers`, { count: filteredCustomers.length })}
        rightAction={canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/customers/add")}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            {tl("customerList.new", "New")}
          </Button>
        )}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onHistorySelect={setImmediateSearchTerm}
        searchPage="customers"
        liveResults={liveSearchResults}
        searchPlaceholder={tl("customerList.searchPlaceholder", "Search customers")}
      />

      <FilterBar
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={filterOptions}
        rightSlot={createdFilterLabel ? (
          <Chip
            label={createdFilterLabel}
            color="primary"
            variant="outlined"
            onDelete={clearFilters}
            deleteIcon={<CloseIcon data-testid="clear-created-filter" />}
          />
        ) : null}
      />

      {duplicateCount > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="warning"
              size="small"
              onClick={() => setDuplicateDialogOpen(true)}
            >
              {tl("customerList.reviewDuplicates", "Review Duplicates")}
            </Button>
          }
        >
          {tl("customerList.duplicateCollapseNotice", `${duplicateCount} duplicate customer records were collapsed from the dashboard view.`, { count: duplicateCount })}
        </Alert>
      )}

      <ListSummary
        items={summaryItems}
      />

      <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2, border: "1px solid", borderColor: "divider", mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{tl("customerList.topCustomersTitle", "Top Customers")}</Typography>
            <Typography variant="body2" color="text.secondary">{tl("customerList.topCustomersSubtitle", "Top 5 customers by revenue and health.")}</Typography>
          </Box>
        </Box>
        <Stack spacing={1.25}>
          {topCustomers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{tl("customerList.noTopCustomers", "No customer revenue data available yet.")}</Typography>
          ) : topCustomers.map((customer, index) => (
            <Box key={customer.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap", p: 1.25, borderRadius: 2, bgcolor: customer.overdueAmount > 0 ? "error.50" : "grey.50" }}>
              <Box>
                <Typography fontWeight={700}>{index + 1}. {customer.name}</Typography>
                <Typography variant="body2" color="text.secondary">{customer.company_name}</Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" icon={<StarBorderIcon />} label={`${tl("customerList.healthScore", "Health")} ${customer.health.score}`} color={customer.health.color} variant="outlined" />
                <Chip size="small" icon={<TrendingUpIcon />} label={formatCurrencyByLocale(customer.totalRevenue, i18n.language)} color="primary" variant="outlined" />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>

      <BulkActionBar
        selectedCount={selectedCustomers.length}
        actions={[
          {
            label: statusFilter === "Archived" ? tl("common.restore", "Restore Selected") : tl("customerList.bulk.delete", "Archive Selected"),
            color: statusFilter === "Archived" ? "success" : "warning",
            onClick: () => setConfirmBulkArchiveOpen(true),
            disabled: selectedCustomers.length === 0,
          },
        ]}
      />

      <Box className="tour-customer-list">
      <ResponsiveDataView
        isMobile={isMobile}
        renderCard={(customer) => {
          const isArchived = customer.status === "ARCHIVED";
          return (
            <CustomerCard
              customer={customer}
              onClick={() => {
                if (!isArchived) {
                  navigate(`/customers/${customer.id}`);
                }
              }}
              onEdit={canEdit ? (() => { if (!isArchived) { navigate(`/customers/edit/${customer.id}`); } }) : undefined}
              onDelete={canDelete ? (() => (statusFilter === "Archived" ? setRestoreTargetId(customer.id) : setConfirmDeleteId(customer.id))) : undefined}
              deleteLabel={statusFilter === "Archived" ? "Restore customer" : "Archive customer"}
              deleteColor={statusFilter === "Archived" ? "#059669" : "#ef4444"}
              deleteHoverBg={statusFilter === "Archived" ? "#ecfdf5" : "#fef2f2"}
              deleteIcon={statusFilter === "Archived" ? "restore" : "delete"}
              onCreateInvoice={() => handleCreateInvoice(customer)}
              onRecordPayment={() => handleOpenPaymentDialog(customer)}
            />
          );
        }}
        columns={[
          { key: "checkbox", label: "", width: CHECKBOX_COLUMN_WIDTH },
          { key: "name", label: tl("customerList.columns.customer", "CUSTOMER"), width: "28%" },
          { key: "status", label: tl("customerList.columns.status", "STATUS"), width: "12%" },
          { key: "revenue", label: tl("customerList.columns.totalRevenue", "TOTAL REVENUE"), align: "right", width: "13%" },
          { key: "outstanding", label: tl("customerList.columns.outstanding", "OUTSTANDING"), align: "right", width: "13%" },
          { key: "overdue", label: tl("customerList.columns.overdue", "OVERDUE"), align: "right", width: "13%" },
          { key: "last_transaction", label: tl("customerList.columns.lastTransaction", "LAST TRANSACTION"), width: "12%" },
          { key: "actions", label: "", align: "center", width: 160 },
        ]}
        rows={paginatedCustomers}
        loading={loading}
        emptyTitle={searchTerm ? tl("customerList.emptySearch", "No customers matched your search.") : tl("customerList.empty", "No customers available.")}
        toolbar={
          <>
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
            <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px", borderBottomColor: "#edf0f3" }}>
              <Checkbox
                indeterminate={someVisibleSelected && !allVisibleSelected}
                checked={allVisibleSelected}
                onChange={handleSelectAll}
                inputProps={{ "aria-label": "Select all customers" }}
                sx={{ color: "#b6bdc7" }}
              />
            </TableCell>
            {[
              { label: tl("customerList.columns.customer", "CUSTOMER"), width: "28%", sortKey: "name" },
              { label: tl("customerList.columns.status", "STATUS"), width: "12%" },
              { label: tl("customerList.columns.totalRevenue", "TOTAL REVENUE"), width: "13%", align: "right", sortKey: "totalRevenue" },
              { label: tl("customerList.columns.outstanding", "OUTSTANDING"), width: "13%", align: "right", sortKey: "receivables" },
              { label: tl("customerList.columns.overdue", "OVERDUE"), width: "13%", align: "right", sortKey: "overdueAmount" },
              { label: tl("customerList.columns.lastTransaction", "LAST TRANSACTION"), width: "12%" },
              { label: "", width: 160, align: "center" },
            ].map((column, index) => (
              <TableCell
                key={`${column.label}-${index}`}
                align={column.align || "left"}
                sx={{
                  width: column.width,
                  maxWidth: column.width,
                  borderBottomColor: "#edf0f3",
                  py: 1.2,
                  color: sortBy === column.sortKey ? "primary.main" : "#8b95a7",
                  fontSize: "0.68rem",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  ...(column.sortKey ? {
                    cursor: "pointer",
                    userSelect: "none",
                    bgcolor: sortBy === column.sortKey ? "action.selected" : undefined,
                    "&:hover": { bgcolor: "action.hover" },
                  } : {}),
                }}
              >
                {column.sortKey ? (
                  <TableSortLabel
                    active={sortBy === column.sortKey}
                    direction={sortBy === column.sortKey ? sortOrder : "asc"}
                    onClick={() => handleSort(column.sortKey)}
                    hideSortIcon={sortBy !== column.sortKey}
                    sx={{ fontSize: "inherit", letterSpacing: "inherit", fontWeight: "inherit", color: "inherit" }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : column.label}
              </TableCell>
            ))}
          </TableRow>
        )}
        renderRow={(customer) => {
          const isSelected = selectedCustomers.includes(customer.id);
          const isArchived = customer.status === "ARCHIVED";
          const rowBg = customer.overdueAmount > 0 ? "#fff7f7" : customer.receivables > 0 ? "#fffaf0" : "transparent";

          return (
            <TableRow
              key={customer.id}
              hover
              selected={isSelected}
              onClick={() => {
                if (!isArchived) {
                  navigate(`/customers/${customer.id}`);
                }
              }}
              sx={{
                "& td": { borderBottomColor: "#edf0f3", py: 1.7 },
                "&:hover": { bgcolor: customer.overdueAmount > 0 ? "#fff1f1" : "#fafcff" },
                bgcolor: rowBg,
                cursor: isArchived ? "default" : "pointer",
              }}
            >
              <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleSelectOne(customer.id)}
                  inputProps={{ "aria-label": `Select ${customer.name}` }}
                  sx={{ color: "#b6bdc7" }}
                />
              </TableCell>
              <TableCell>
                <Typography
                  title={customer.name}
                  sx={{
                    fontSize: "0.825rem",
                    fontWeight: 600,
                    color: isArchived ? "#374151" : "#2563eb",
                    cursor: isArchived ? "default" : "pointer",
                    display: "block",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    "&:hover": isArchived ? undefined : { textDecoration: "underline" },
                  }}
                >
                  {customer.name}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {customer.email} · {customer.phone}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={isArchived ? "Archived" : customer.activityStatus}
                    color={isArchived || customer.activityStatus === "Inactive" ? "default" : "success"}
                    variant="outlined"
                  />
                  {(customer.health.type === "atRisk" || customer.health.type === "highValue") && (
                    <Chip size="small" label={customer.health.label} color={customer.health.color} variant="filled" />
                  )}
                </Stack>
                <Typography sx={{ fontSize: "0.72rem", color: "#6b7280", mt: 0.5 }}>
                  {tl("customerList.healthScore", "Health")} {customer.health.score}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: customer.totalRevenue > 0 ? "#111827" : "#6b7280" }}>
                  {formatCurrencyByLocale(customer.totalRevenue, i18n.language)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: customer.receivables > 0 ? "#92400e" : "#6b7280" }}>
                  {formatCurrencyByLocale(customer.receivables, i18n.language)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: customer.overdueAmount > 0 ? "#dc2626" : "#6b7280" }}>
                  {formatCurrencyByLocale(customer.overdueAmount, i18n.language)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: "0.8125rem", color: "#2b3340" }}>
                  {formatDate(customer.lastTransactionDate)}
                </Typography>
              </TableCell>
              <TableCell align="center" onClick={(event) => event.stopPropagation()} sx={{ pl: 0.5, pr: 3, py: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.25 }}>
                  {!isArchived && (
                    <Tooltip title={tl("customerList.actions.createInvoice", "Create Invoice")}>
                      <IconButton aria-label={`Create invoice for ${customer.name}`} size="small" onClick={() => handleCreateInvoice(customer)} sx={{ color: "#2563eb" }}>
                        <NoteAddIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!isArchived && (
                    <Tooltip title={tl("customerList.actions.recordPayment", "Record Payment")}>
                      <IconButton aria-label={`Record payment for ${customer.name}`} size="small" onClick={() => handleOpenPaymentDialog(customer)} sx={{ color: "#059669" }}>
                        <PaymentsIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!isArchived && canEdit && (
                    <Tooltip title={tl("customerList.actions.edit", "Edit")}>
                      <IconButton aria-label={`Edit ${customer.name}`} size="small" onClick={() => navigate(`/customers/edit/${customer.id}`)} sx={{ color: "#5f87e7" }}>
                        <EditIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title={statusFilter === "Archived" ? tl("common.restore", "Restore") : tl("customerList.actions.delete", "Archive")}>
                      <IconButton
                        aria-label={statusFilter === "Archived" ? `Restore ${customer.name}` : `Archive ${customer.name}`}
                        size="small"
                        onClick={() => (statusFilter === "Archived" ? setRestoreTargetId(customer.id) : setConfirmDeleteId(customer.id))}
                        sx={{ color: statusFilter === "Archived" ? "#059669" : "#ef4444" }}
                      >
                        {statusFilter === "Archived" ? <RestoreIcon sx={{ fontSize: 17 }} /> : <DeleteIcon sx={{ fontSize: 17 }} />}
                      </IconButton>
                    </Tooltip>
                  )}
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

      <Dialog
        open={paymentDialog.open}
        onClose={handleClosePaymentDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography fontSize="1rem" fontWeight={700}>
            {tl("customerList.recordPaymentTitle", "Record Payment")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {paymentDialog.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              {paymentDialog.error && <Alert severity="error">{paymentDialog.error}</Alert>}
              <FormControl size="small" fullWidth>
                <Select
                  value={paymentDialog.invoiceId}
                  onChange={(event) => handlePaymentInvoiceChange(event.target.value)}
                  displayEmpty
                >
                  {paymentDialog.invoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} · {formatCurrencyByLocale(invoice.balance_due, i18n.language)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={tl("customerList.paymentAmount", "Amount")}
                type="number"
                size="small"
                value={paymentDialog.amount}
                onChange={(event) => setPaymentDialog((prev) => ({ ...prev, amount: event.target.value }))}
              />
              <TextField
                label={tl("customerList.paymentDate", "Payment Date")}
                type="date"
                size="small"
                value={paymentDialog.paymentDate}
                onChange={(event) => setPaymentDialog((prev) => ({ ...prev, paymentDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl size="small" fullWidth>
                <Select
                  value={paymentDialog.paymentMode}
                  onChange={(event) => setPaymentDialog((prev) => ({ ...prev, paymentMode: event.target.value }))}
                >
                  {PAYMENT_MODES.map((mode) => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} variant="outlined" sx={{ textTransform: "none" }}>
            {tl("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleSubmitPayment}
            variant="contained"
            sx={{ textTransform: "none" }}
            disabled={paymentDialog.loading || paymentDialog.saving || !paymentDialog.invoiceId || !toNumber(paymentDialog.amount)}
          >
            {paymentDialog.saving ? <CircularProgress size={18} color="inherit" /> : tl("customerList.actions.recordPayment", "Record Payment")}
          </Button>
        </DialogActions>
      </Dialog>

      <ArchiveDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        entityType="customer"
        entityId={confirmDeleteId}
        entityLabel="Customer"
        onArchived={async () => {
          setSelectedCustomers((prev) => prev.filter((customerId) => customerId !== confirmDeleteId));
          await fetchCustomers(apiDateFilters);
        }}
      />

      <LifecycleArchiveDialog
        open={!!restoreTargetId}
        onClose={() => setRestoreTargetId(null)}
        mode="restore"
        entityType="customer"
        entityId={restoreTargetId}
        entityLabel="Customer"
        onConfirmed={async () => {
          setSelectedCustomers((prev) => prev.filter((customerId) => customerId !== restoreTargetId));
          setRestoreTargetId(null);
          await fetchCustomers(apiDateFilters);
        }}
      />

      <LifecycleArchiveDialog
        open={confirmBulkArchiveOpen}
        onClose={() => setConfirmBulkArchiveOpen(false)}
        mode={statusFilter === "Archived" ? "bulk-restore" : "bulk-archive"}
        entityType="customer"
        entityIds={selectedCustomers}
        entityLabel="Customer"
        entityCount={selectedCustomers.length}
        onConfirmed={async () => {
          setSelectedCustomers([]);
          setConfirmBulkArchiveOpen(false);
          await fetchCustomers(apiDateFilters);
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ open: false, message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ open: false, message: "", severity: "success" })}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Duplicate Review Dialog */}
      <Dialog
        open={duplicateDialogOpen}
        onClose={() => setDuplicateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {tl("customerList.duplicateDialogTitle", `Duplicate Customer Records (${duplicateRecords.length})`, { count: duplicateRecords.length })}
        </DialogTitle>
        <DialogContent dividers>
          {duplicateRecords.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {tl("customerList.noDuplicates", "No duplicate records found.")}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {duplicateRecords.map((dup) => (
                <Paper
                  key={dup.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 1.5 }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {dup.display_name || dup.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[dup.email, dup.phone].filter(Boolean).join(" · ")}
                        {dup.gst_number ? ` · GST: ${dup.gst_number}` : ""}
                      </Typography>
                      {dup.matchedWith && (
                        <Typography variant="caption" color="warning.main">
                          {tl("customerList.duplicateMatchedWith", `Duplicate of: ${dup.matchedWith.display_name || dup.matchedWith.name}`, { name: dup.matchedWith.display_name || dup.matchedWith.name })}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => { setDuplicateDialogOpen(false); navigate(`/customers/${dup.id}`); }}
                      >
                        {tl("customerList.view", "View")}
                      </Button>
                      {dup.matchedWith && !mergedIds.has(dup.id) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          disabled={mergingIds.has(dup.id)}
                          onClick={async () => {
                            setMergingIds((prev) => new Set(prev).add(dup.id));
                            try {
                              await mergeCustomerInto(dup.id, dup.matchedWith.id);
                              setMergedIds((prev) => new Set(prev).add(dup.id));
                              setToast({ open: true, message: `Merged into ${dup.matchedWith.display_name || dup.matchedWith.name}`, severity: "success" });
                              await fetchCustomers();
                            } catch {
                              setToast({ open: true, message: "Merge failed. Please try again.", severity: "error" });
                            } finally {
                              setMergingIds((prev) => { const s = new Set(prev); s.delete(dup.id); return s; });
                            }
                          }}
                        >
                          {mergingIds.has(dup.id) ? "Merging…" : "Merge into Primary"}
                        </Button>
                      )}
                      {mergedIds.has(dup.id) && (
                        <Chip size="small" label="Merged" color="success" />
                      )}
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>
            {tl("common.close", "Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </ListPageLayout>
  );
};

export default CustomerList;
