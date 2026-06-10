import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../components/Layout/MainLayout";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import RevenueTrendChart from "../components/Dashboard/RevenueTrendChart";
import InventoryOverviewCard from "../components/Dashboard/InventoryOverviewCard";
import {
  People,
  Inventory,
  Receipt,
  AttachMoney,
  Add,
  AccountBalance,
  Payments,
  Warning,
  OpenInNew,
  MarkEmailRead,
  CheckCircle,
} from "@mui/icons-material";

import ProductStockSummary from "../components/ProductStockSummary";
import StatCard from "../components/common/StatCard";
import SectionPaper from "../components/common/SectionPaper";
import SectionHeader from "../components/common/SectionHeader";
import StatusBadge from "../components/common/StatusBadge";
import { useDashboardFilter } from "../context/DashboardFilterContext";
import DashboardSearchBox from "../components/Dashboard/DashboardSearchBox";
import { usePermission } from "../context/PermissionContext";
import { dashboardActions } from "./dashboardActions";
import { safeClick } from "../utils/safeClick";
import { getComparisonLabel } from "../utils/dashboardComparison";
import { recordPayment, sendInvoiceEmail } from "../services/invoiceService";
import {
  getDashboardLowStock,
  getDashboardMonthlyRevenue,
  getDashboardRecentInvoices,
  getDashboardSummary,
} from "../services/dashboardService";
import { getOrgProfile } from "../services/organizationProfileService";
import "./Dashboard.css";

// ────────────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const MAX_RECENT_ITEMS = 7;
  const DUE_SOON_DAYS = 2;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { can, isAdmin: permIsAdmin } = usePermission();

  // ── API state ─────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const [lowStock, setLowStock] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [lowStockError, setLowStockError] = useState("");

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState("");

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentFilter, setRecentFilter] = useState("all");
  const [invoiceActionLoading, setInvoiceActionLoading] = useState({});
  const [invoiceActionError, setInvoiceActionError] = useState("");
  const [orgName, setOrgName] = useState("");

  // ── UI state ─────────────────────────────────────────────────────────────
  // ── Time range from global context (persisted in localStorage) ────────────
  const {
    revenueRange,
    setRevenueRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
  } = useDashboardFilter();

  const buildRangeParams = useMemo(() => {
    const passthroughApiRanges = new Set(["this_month", "this_quarter", "this_year"]);
    const params = { range: revenueRange };

    if (!passthroughApiRanges.has(revenueRange)) {
      params.range = "custom";
      params.start_date = customStartDate;
      params.end_date = customEndDate;
    }

    return params;
  }, [revenueRange, customStartDate, customEndDate]);

  const actionHandlers = useMemo(() => ({
    goToCustomersAdded: dashboardActions.goToCustomersAdded(navigate, buildRangeParams),
    goToTotalCustomers: dashboardActions.goToTotalCustomers(navigate),
    goToProducts: dashboardActions.goToProducts(navigate),
    goToInvoicesCreated: dashboardActions.goToInvoicesCreated(navigate, buildRangeParams),
    goToRevenue: dashboardActions.goToRevenue(navigate, buildRangeParams),
    goToPaymentsReceived: dashboardActions.goToPaymentsReceived(navigate, buildRangeParams),
    goToPayablesExpenses: dashboardActions.goToPayablesExpenses(navigate, buildRangeParams),
    goToOverdue: dashboardActions.goToOverdue(navigate),
    goToDueToday: dashboardActions.goToDueToday(navigate),
    goToLowStockItems: dashboardActions.goToLowStockItems(navigate),
    goToCriticalStock: dashboardActions.goToCriticalStock(navigate),
    goToInvoicesWithContext: (extra = {}) => dashboardActions.goToInvoicesWithContext(navigate, buildRangeParams, extra)(),
    goToAddInvoice: dashboardActions.goToAddInvoice(navigate),
    goToAddCustomer: dashboardActions.goToAddCustomer(navigate),
    goToAddProduct: dashboardActions.goToAddProduct(navigate),
  }), [buildRangeParams, navigate]);

  const selectedRangeLabel = useMemo(() => {
    if (revenueRange === "today") return t("dashboard.filters.today", { defaultValue: "Today" });
    if (revenueRange === "last_7_days") return t("dashboard.filters.last7Days", { defaultValue: "Last 7 Days" });
    if (revenueRange === "last_30_days") return t("dashboard.filters.last30Days", { defaultValue: "Last 30 Days" });
    if (revenueRange === "this_month") return t("dashboard.filters.thisMonth");
    if (revenueRange === "last_month") return t("dashboard.filters.lastMonth", { defaultValue: "Last Month" });
    if (revenueRange === "this_quarter") return t("dashboard.filters.thisQuarter");
    if (revenueRange === "last_year") return t("dashboard.filters.lastYear", { defaultValue: "Last Year" });
    if (revenueRange === "custom") return t("dashboard.filters.customRange");
    return t("dashboard.filters.thisYear");
  }, [revenueRange, t]);

  // ── API calls ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setLowStockLoading(true);
    getDashboardLowStock()
      .then((data) => setLowStock(data))
      .catch(() => setLowStockError(t('dashboard.failedLowStock')))
      .finally(() => setLowStockLoading(false));
  }, [t]);

  useEffect(() => {
    getOrgProfile()
      .then((data) => setOrgName(data.organization_name || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setRecentLoading(true);
    if (
      revenueRange === "custom" &&
      (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate))
    ) {
      setRecentInvoices([]);
      setRecentLoading(false);
      return;
    }

    getDashboardRecentInvoices({ limit: 50, ...buildRangeParams })
      .then((data) => setRecentInvoices(data))
      .catch(() => setRecentInvoices([]))
      .finally(() => setRecentLoading(false));
  }, [buildRangeParams, customEndDate, customStartDate, revenueRange]);

  useEffect(() => {
    if (revenueRange === "custom") {
      if (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)) {
        return;
      }
    }

    setSummaryLoading(true);
    setSummaryError("");
    getDashboardSummary(buildRangeParams)
      .then((data) => setSummary(data))
      .catch(() => setSummaryError(t('dashboard.failedSummary')))
      .finally(() => setSummaryLoading(false));
  }, [buildRangeParams, customEndDate, customStartDate, revenueRange, t]);

  useEffect(() => {
    setRevenueLoading(true);
    setRevenueError("");

    if (revenueRange === "custom") {
      if (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)) {
        setRevenue([]);
        setRevenueError(t('dashboard.invalidCustomRange'));
        setRevenueLoading(false);
        return;
      }
    }

    getDashboardMonthlyRevenue(buildRangeParams)
      .then((data) => setRevenue(data))
      .catch(() => setRevenueError(t('dashboard.failedRevenue')))
      .finally(() => setRevenueLoading(false));
  }, [buildRangeParams, customEndDate, customStartDate, revenueRange, t]);

  const filteredRecentInvoices = useMemo(() => (Array.isArray(recentInvoices) ? recentInvoices : []), [recentInvoices]);
  const filteredRevenue = useMemo(() => (Array.isArray(revenue) ? revenue : []), [revenue]);

  const normalizedRecentInvoices = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const dueSoonLimit = new Date(now);
    dueSoonLimit.setDate(dueSoonLimit.getDate() + DUE_SOON_DAYS);

    return filteredRecentInvoices.map((inv) => {
      const statusRaw = (inv.status || "").toLowerCase();
      const dueKey = (inv.due_date || "").slice(0, 10);
      const issueTs = Date.parse(inv.issue_date || "") || 0;
      const dueTs = Date.parse(inv.due_date || "") || 0;
      const total = Number(inv.total_amount || 0);
      const balanceDue = Number(inv.balance_due ?? inv.total_amount ?? 0);
      const isPaid = statusRaw === "paid";
      const isCancelled = statusRaw === "cancelled";
      const isOverdue = !isPaid && !isCancelled && (statusRaw === "overdue" || (dueKey && dueKey < todayKey && balanceDue > 0));
      const isDueSoon = !isPaid && !isCancelled && !isOverdue && dueTs > 0 && dueTs <= dueSoonLimit.getTime() && dueKey >= todayKey;
      const priority = isOverdue ? 0 : isDueSoon ? 1 : isPaid ? 3 : 2;

      return {
        ...inv,
        issueTs,
        dueTs,
        total,
        balanceDue,
        isPaid,
        isOverdue,
        isDueSoon,
        priority,
      };
    });
  }, [DUE_SOON_DAYS, filteredRecentInvoices]);

  const groupedRecentInvoices = useMemo(() => {
    const base = [...normalizedRecentInvoices].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.priority <= 1 && a.dueTs !== b.dueTs) return a.dueTs - b.dueTs;
      if (a.priority === 3 && a.issueTs !== b.issueTs) return b.issueTs - a.issueTs;
      if (a.issueTs !== b.issueTs) return b.issueTs - a.issueTs;
      return b.total - a.total;
    });

    const filtered =
      recentFilter === "attention"
        ? base.filter((i) => i.isOverdue || i.isDueSoon)
        : recentFilter === "paid"
          ? base.filter((i) => i.isPaid)
          : base;

    const capped = filtered.slice(0, MAX_RECENT_ITEMS);
    return {
      total: filtered.length,
      items: capped,
      attention: capped.filter((i) => i.isOverdue || i.isDueSoon),
      recentlyCreated: capped.filter((i) => !i.isPaid && !i.isOverdue && !i.isDueSoon),
      recentlyPaid: capped.filter((i) => i.isPaid),
    };
  }, [MAX_RECENT_ITEMS, normalizedRecentInvoices, recentFilter]);

  const actionRequiredItems = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dueTodayCount = normalizedRecentInvoices.filter((i) => !i.isPaid && (i.due_date || "").slice(0, 10) === today).length;
    return [
      {
        key: "overdue",
        module: "invoices",
        label: "Overdue invoices",
        count: Number(summary?.overdue_count || 0),
        cta: "View",
        onClick: safeClick(actionHandlers.goToOverdue),
        color: "error.main",
      },
      {
        key: "due_today",
        module: "invoices",
        label: "Due today invoices",
        count: dueTodayCount,
        cta: "View",
        onClick: safeClick(actionHandlers.goToDueToday),
        color: "warning.main",
      },
      {
        key: "inventory",
        module: "products",
        label: "Inventory alerts",
        count: lowStock.length,
        cta: "Resolve",
        onClick: safeClick(actionHandlers.goToLowStockItems),
        color: "secondary.main",
      },
    ];
  }, [actionHandlers.goToDueToday, actionHandlers.goToLowStockItems, actionHandlers.goToOverdue, lowStock.length, normalizedRecentInvoices, summary?.overdue_count]);

  const handleSendReminder = async (invoice) => {
    const actionKey = `${invoice.id}-remind`;
    setInvoiceActionError("");
    setInvoiceActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      await sendInvoiceEmail(invoice.id, {
        message: `Friendly reminder: invoice ${invoice.invoice_number || ""} is pending payment.`,
      });
    } catch (error) {
      setInvoiceActionError(error?.response?.data?.error || "Failed to send reminder");
    } finally {
      setInvoiceActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleMarkAsPaid = async (invoice) => {
    const actionKey = `${invoice.id}-paid`;
    setInvoiceActionError("");
    setInvoiceActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      await recordPayment(invoice.id, {
        amount: Number(invoice.balanceDue || invoice.total || 0),
        payment_mode: "Bank Transfer",
        payment_date: new Date().toISOString().slice(0, 10),
        notes: "Marked paid from dashboard",
      });
      setRecentInvoices((prev) => prev.map((inv) =>
        inv.id === invoice.id
          ? { ...inv, status: "Paid", balance_due: 0 }
          : inv
      ));
    } catch (error) {
      setInvoiceActionError(error?.response?.data?.error || "Failed to mark invoice as paid");
    } finally {
      setInvoiceActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const metricContextLabel = useMemo(() => {
    const current = summary?.period?.current?.label || selectedRangeLabel;
    const previous = getComparisonLabel(revenueRange, t, summary?.period?.previous);
    return { current, previous };
  }, [revenueRange, selectedRangeLabel, summary, t]);

  const getMetric = (metricKey, fallbackValue = 0) => {
    const metric = summary?.metrics?.[metricKey];
    if (metric && typeof metric === "object") {
      return {
        value: metric.value ?? fallbackValue,
        previous_value: metric.previous_value ?? 0,
        percentage_change: metric.percentage_change,
      };
    }

    return {
      value: summary?.[metricKey] ?? fallbackValue,
      previous_value: 0,
      percentage_change: undefined,
    };
  };

  const performanceKpis = useMemo(() => [
    {
      key: "customers_added",
      module: "customers",
      label: t("dashboard.kpi.customersAdded"),
      icon: <People sx={{ fontSize: 22, color: "primary.main" }} />,
      accentColor: "primary.main",
      iconBg: "primary.50",
      onClick: safeClick(actionHandlers.goToCustomersAdded),
      emptyMessage: t("dashboard.empty.customersAdded", { range: selectedRangeLabel.toLowerCase() }),
      emptyActionLabel: t("dashboard.empty.addCustomer"),
      emptyAction: safeClick(actionHandlers.goToAddCustomer),
    },
    {
      key: "invoices_created",
      module: "invoices",
      label: t("dashboard.kpi.invoicesCreated"),
      icon: <Receipt sx={{ fontSize: 22, color: "info.main" }} />,
      accentColor: "info.main",
      iconBg: "info.50",
      onClick: safeClick(actionHandlers.goToInvoicesCreated),
      emptyMessage: t("dashboard.empty.invoicesCreated", { range: selectedRangeLabel.toLowerCase() }),
      emptyActionLabel: t("dashboard.empty.createInvoice"),
      emptyAction: safeClick(actionHandlers.goToAddInvoice),
    },
    {
      key: "revenue",
      module: "invoices",
      label: t("dashboard.kpi.revenue"),
      icon: <AttachMoney sx={{ fontSize: 22, color: "success.main" }} />,
      accentColor: "success.main",
      iconBg: "success.50",
      prefix: "₹",
      onClick: safeClick(actionHandlers.goToRevenue),
      emptyMessage: t("dashboard.empty.revenue", { range: selectedRangeLabel.toLowerCase() }),
      emptyActionLabel: t("dashboard.empty.createInvoice"),
      emptyAction: safeClick(actionHandlers.goToAddInvoice),
    },
    {
      key: "payments_received",
      module: "invoices",
      label: t("dashboard.kpi.paymentsReceived"),
      icon: <Payments sx={{ fontSize: 22, color: "secondary.main" }} />,
      accentColor: "secondary.main",
      iconBg: "secondary.50",
      prefix: "₹",
      onClick: safeClick(actionHandlers.goToPaymentsReceived),
      emptyMessage: t("dashboard.empty.paymentsReceived", { range: selectedRangeLabel.toLowerCase() }),
      emptyActionLabel: t("dashboard.empty.viewInvoices"),
      emptyAction: safeClick(actionHandlers.goToInvoicesCreated),
    },
    {
      key: "payables",
      module: "expenses",
      label: t("dashboard.kpi.expensesPayables"),
      icon: <AccountBalance sx={{ fontSize: 22, color: "error.main" }} />,
      accentColor: "error.main",
      iconBg: "error.50",
      prefix: "₹",
      onClick: safeClick(actionHandlers.goToPayablesExpenses),
      emptyMessage: t("dashboard.empty.payables", { range: selectedRangeLabel.toLowerCase() }),
      emptyActionLabel: t("dashboard.empty.addExpense"),
      emptyAction: safeClick(actionHandlers.goToPayablesExpenses),
    },
  ], [actionHandlers, selectedRangeLabel, t]);

  const currentStateKpis = useMemo(() => [
    {
      label: t("dashboard.kpi.overdueInvoicesCurrent"),
      module: "invoices",
      value: summary?.metrics?.overdue_invoices_current?.value ?? summary?.overdue_count ?? 0,
      icon: <Warning sx={{ fontSize: 22, color: "error.main" }} />,
      accentColor: "error.main",
      iconBg: "error.50",
      onClick: safeClick(actionHandlers.goToOverdue),
    },
    {
      label: t("dashboard.kpi.inventoryAlertsCurrent"),
      module: "products",
      value: lowStock.length,
      icon: <Inventory sx={{ fontSize: 22, color: "secondary.main" }} />,
      accentColor: "secondary.main",
      iconBg: "secondary.50",
      onClick: safeClick(actionHandlers.goToLowStockItems),
    },
  ], [actionHandlers, lowStock.length, summary, t]);

  const businessSizeKpis = useMemo(() => [
    {
      label: t("dashboard.kpi.totalCustomers"),
      module: "customers",
      value: summary?.metrics?.total_customers?.value ?? summary?.total_customers ?? 0,
      icon: <People sx={{ fontSize: 22, color: "primary.main" }} />,
      accentColor: "primary.main",
      iconBg: "primary.50",
      onClick: safeClick(actionHandlers.goToTotalCustomers),
    },
    {
      label: t("dashboard.kpi.totalProducts"),
      module: "products",
      value: summary?.metrics?.total_products?.value ?? summary?.total_products ?? 0,
      icon: <Inventory sx={{ fontSize: 22, color: "info.main" }} />,
      accentColor: "info.main",
      iconBg: "info.50",
      onClick: safeClick(actionHandlers.goToProducts),
    },
  ], [actionHandlers, summary, t]);

  // ── Permission-filtered KPI lists ─────────────────────────────────────────
  const visiblePerformanceKpis = useMemo(
    () => performanceKpis.filter(k => permIsAdmin || !k.module || can(k.module, 'view')),
    [performanceKpis, permIsAdmin, can]
  );
  const visibleCurrentStateKpis = useMemo(
    () => currentStateKpis.filter(k => permIsAdmin || !k.module || can(k.module, 'view')),
    [currentStateKpis, permIsAdmin, can]
  );
  const visibleBusinessSizeKpis = useMemo(
    () => businessSizeKpis.filter(k => permIsAdmin || !k.module || can(k.module, 'view')),
    [businessSizeKpis, permIsAdmin, can]
  );
  const visibleActionRequiredItems = useMemo(
    () => actionRequiredItems.filter(item => permIsAdmin || !item.module || can(item.module, 'view')),
    [actionRequiredItems, permIsAdmin, can]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (v) => (v !== undefined && v !== null ? v.toLocaleString() : "—");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.full_name || user.name || (user.username?.split('@')[0] || "there");
  const companyName = orgName || user.company_name || user.organization || "";
  const greetName = companyName ? `${userName} (${companyName})` : userName;

  return (
    <MainLayout
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      showDashboardHeader={false}
    >
      <Box
        component="section"
        sx={{
          flex: 1,
          p: { xs: 2, md: 3 },
          bgcolor: "grey.50",
          overflowY: "auto",
        }}
      >

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — Welcome + Search
        ══════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 4,
          }}
        >
          {/* Greeting */}
          <SectionHeader
            title={t('dashboard.greeting', { name: greetName })}
            subtitle={t('dashboard.greetingSubtitle')}
            sx={{ mb: 0, minWidth: 280, flex: 1 }}
          />

          {/* Search + date filter */}
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
            <DashboardSearchBox
              placeholder={t('dashboard.searchPlaceholder')}
              minWidth={240}
            />
            <Select
              size="small"
              value={revenueRange}
              onChange={(e) => setRevenueRange(e.target.value)}
              sx={{
                borderRadius: 2,
                fontSize: "0.875rem",
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              }}
            >
              <ListSubheader sx={{ py: 1, px: 2, bgcolor: 'action.hover', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', borderTop: '1px solid', borderColor: 'divider' }}>{t('dashboard.filters.quickRanges', { defaultValue: 'Quick Ranges' })}</ListSubheader>
              <MenuItem value="today">{t('dashboard.filters.today', { defaultValue: 'Today' })}</MenuItem>
              <MenuItem value="last_7_days">{t('dashboard.filters.last7Days', { defaultValue: 'Last 7 Days' })}</MenuItem>
              <MenuItem value="last_30_days">{t('dashboard.filters.last30Days', { defaultValue: 'Last 30 Days' })}</MenuItem>

              <ListSubheader sx={{ py: 1, px: 2, bgcolor: 'action.hover', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', borderTop: '1px solid', borderColor: 'divider' }}>{t('dashboard.filters.calendarPeriods', { defaultValue: 'Calendar Periods' })}</ListSubheader>
              <MenuItem value="this_month">{t('dashboard.filters.thisMonth')}</MenuItem>
              <MenuItem value="last_month">{t('dashboard.filters.lastMonth', { defaultValue: 'Last Month' })}</MenuItem>
              <MenuItem value="this_quarter">{t('dashboard.filters.thisQuarter')}</MenuItem>
              <MenuItem value="this_year">{t('dashboard.filters.thisYear')}</MenuItem>
              <MenuItem value="last_year">{t('dashboard.filters.lastYear', { defaultValue: 'Last Year' })}</MenuItem>

              <ListSubheader sx={{ py: 1, px: 2, bgcolor: 'action.hover', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', borderTop: '1px solid', borderColor: 'divider' }}>{t('dashboard.filters.advanced', { defaultValue: 'Advanced' })}</ListSubheader>
              <MenuItem value="custom">{t('dashboard.filters.customRange')}</MenuItem>
            </Select>

            <>
              <TextField
                size="small"
                type="date"
                label={t('dashboard.customStartLabel')}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ "aria-label": t('dashboard.customStartAriaLabel') }}
                sx={{ minWidth: 160, bgcolor: "background.paper", borderRadius: 2 }}
              />
              <TextField
                size="small"
                type="date"
                label={t('dashboard.customEndLabel')}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ "aria-label": t('dashboard.customEndAriaLabel') }}
                sx={{ minWidth: 160, bgcolor: "background.paper", borderRadius: 2 }}
              />
            </>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — KPI Summary Cards (Real + Derived)
        ══════════════════════════════════════════════════════════════════ */}
        {/* Overdue alert banner */}
        {!summaryLoading && summary?.overdue_count > 0 && (permIsAdmin || can('invoices', 'view')) && (
          <Alert
            severity="error"
            icon={<Warning fontSize="inherit" />}
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={safeClick(actionHandlers.goToOverdue)}>
                {t('dashboard.viewInvoices')}
              </Button>
            }
          >
            <strong>{t('dashboard.overdueMessage', { count: summary.overdue_count })}</strong>{" "}
            {t('dashboard.overdueFollowUp')}
          </Alert>
        )}
        <Container maxWidth="xl" disableGutters>
          {visiblePerformanceKpis.length > 0 && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "primary.main", flexShrink: 0 }} />
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t('dashboard.sections.performance')}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 3,
                  mb: 4,
                }}
              >
                {visiblePerformanceKpis.map((kpi) => {
                  const metric = getMetric(kpi.key, 0);
                  const trend = typeof metric.percentage_change === "number" ? metric.percentage_change : undefined;
                  const hasNoData = !summaryLoading && !summaryError && metric.value === 0;
                  const valueLabel = summaryLoading
                    ? undefined
                    : summaryError
                      ? "—"
                      : `${kpi.prefix || ""}${fmt(metric.value)}`;

                  return (
                    <StatCard
                      key={kpi.key}
                      icon={kpi.icon}
                      label={kpi.label}
                      value={valueLabel}
                      loading={summaryLoading}
                      trend={trend}
                      trendLabel={`${metricContextLabel.current} (${trend >= 0 ? "+" : ""}${trend ?? 0}% ${metricContextLabel.previous})`}
                      accentColor={kpi.accentColor}
                      iconBg={kpi.iconBg}
                      onClick={kpi.onClick}
                      emptyState={
                        hasNoData
                          ? {
                              message: kpi.emptyMessage,
                              actionLabel: kpi.emptyActionLabel,
                              onAction: kpi.emptyAction,
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </Box>
            </>
          )}

          {visibleCurrentStateKpis.length > 0 && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "error.main", flexShrink: 0 }} />
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t('dashboard.sections.currentState')}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 3,
                  mb: 4,
                }}
              >
                {visibleCurrentStateKpis.map((kpi) => {
                  const valueLabel = summaryLoading
                    ? undefined
                    : summaryError
                      ? "—"
                      : fmt(kpi.value);

                  return (
                    <StatCard
                      key={kpi.label}
                      icon={kpi.icon}
                      label={kpi.label}
                      value={valueLabel}
                      loading={summaryLoading}
                      accentColor={kpi.accentColor}
                      iconBg={kpi.iconBg}
                      onClick={kpi.onClick}
                      trendLabel={t('dashboard.kpi.currentState')}
                      sx={{ bgcolor: "error.50" }}
                    />
                  );
                })}
              </Box>
            </>
          )}

          {visibleBusinessSizeKpis.length > 0 && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "info.main", flexShrink: 0 }} />
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t('dashboard.sections.businessSize')}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 3,
                  mb: 4,
                }}
              >
                {visibleBusinessSizeKpis.map((kpi) => (
                  <StatCard
                    key={kpi.label}
                    icon={kpi.icon}
                    label={kpi.label}
                    value={summaryLoading ? undefined : summaryError ? "—" : fmt(kpi.value)}
                    loading={summaryLoading}
                    accentColor={kpi.accentColor}
                    iconBg={kpi.iconBg}
                    onClick={kpi.onClick}
                    trendLabel={t('dashboard.kpi.staticMetric')}
                    sx={{ bgcolor: "background.paper" }}
                  />
                ))}
              </Box>
            </>
          )}
        </Container>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Revenue Analytics (invoices permission required)
        ══════════════════════════════════════════════════════════════════ */}
        {(permIsAdmin || can('invoices', 'view')) && (
          <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "success.main", flexShrink: 0 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t('dashboard.sections.revenueAnalytics')}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: (permIsAdmin || can('products', 'view')) ? 8 : 12 }}>
            <RevenueTrendChart
              data={filteredRevenue}
              loading={revenueLoading}
              error={revenueError}
              rangeLabel={selectedRangeLabel}
              comparisonLabel={metricContextLabel.previous}
              onNavigateToRevenue={safeClick(actionHandlers.goToRevenue)}
              onCreateInvoice={safeClick(actionHandlers.goToAddInvoice)}
            />
          </Grid>
          {(permIsAdmin || can('products', 'view')) && (
          <Grid size={{ xs: 12, md: 4 }}>
            <InventoryOverviewCard
              lowStock={lowStock}
              loading={lowStockLoading}
              error={lowStockError}
              totalProducts={summary?.metrics?.total_products?.value ?? summary?.total_products ?? 0}
              onViewInventory={safeClick(actionHandlers.goToLowStockItems)}
              onViewCritical={safeClick(actionHandlers.goToCriticalStock)}
              onItemClick={(item) => navigate(`/products/edit/${item.product_id || item.id}`)}
            />
          </Grid>
          )}
        </Grid>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — Full Inventory Table (products permission)
        ══════════════════════════════════════════════════════════════════ */}
        {(permIsAdmin || can('products', 'view')) && (
          <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "warning.main", flexShrink: 0 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t('dashboard.sections.stockDetail')}
          </Typography>
        </Box>
        <Box sx={{ mb: 4 }}>
          <ProductStockSummary />
        </Box>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — Recent Invoices (Grouped + Actionable)
        ══════════════════════════════════════════════════════════════════ */}
        {(permIsAdmin || can('invoices', 'view')) && (
          <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "secondary.main", flexShrink: 0 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Recent Invoices
          </Typography>
        </Box>

        <SectionPaper
          sx={{ mb: 4 }}
          title="Priority Invoice Feed"
          subtitle="Overdue and due-soon invoices are pinned first"
          action={
            <Button
              size="small"
              endIcon={<OpenInNew fontSize="small" />}
              sx={{ textTransform: "none", fontWeight: 600 }}
              onClick={safeClick(() => actionHandlers.goToInvoicesWithContext({
                dashboard_filter: recentFilter,
                dashboard_sort: "priority",
              }))}
            >
              View All
            </Button>
          }
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap" }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={recentFilter}
              onChange={(_, value) => value && setRecentFilter(value)}
              aria-label="Recent invoice filter"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="attention">Attention</ToggleButton>
              <ToggleButton value="paid">Paid</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" color="text.secondary">
              Showing {groupedRecentInvoices.items.length} of {groupedRecentInvoices.total}
            </Typography>
          </Box>

          {invoiceActionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {invoiceActionError}
            </Alert>
          )}

          {recentLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : groupedRecentInvoices.items.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {t("dashboard.recentInvoices.empty")}
            </Typography>
          ) : (
            <Stack spacing={2}>
              {[
                { key: "attention", title: "Needs Attention", items: groupedRecentInvoices.attention },
                { key: "recent", title: "Recently Created", items: groupedRecentInvoices.recentlyCreated },
                { key: "paid", title: "Recently Paid", items: groupedRecentInvoices.recentlyPaid },
              ].map((group) => (
                group.items.length > 0 ? (
                  <Box key={group.key}>
                    <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em" }}>
                      {group.title}
                    </Typography>
                    <Stack spacing={1.25} sx={{ mt: 0.5 }}>
                      {group.items.map((invoice) => (
                        <Box
                          key={invoice.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: invoice.isOverdue ? "error.main" : invoice.isDueSoon ? "warning.main" : "divider",
                            bgcolor: invoice.isOverdue ? "error.50" : invoice.isDueSoon ? "warning.50" : "background.paper",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, flexWrap: "wrap" }}>
                            <Button
                              variant="text"
                              sx={{ p: 0, textTransform: "none", fontWeight: 700, minWidth: 0, justifyContent: "flex-start" }}
                              onClick={safeClick(dashboardActions.goToInvoiceEdit(navigate, invoice.id))}
                            >
                              {invoice.invoice_number || "Invoice"}
                            </Button>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <StatusBadge status={invoice.status} size="small" />
                              {(invoice.isOverdue || invoice.isDueSoon) && (
                                <Chip
                                  size="small"
                                  color={invoice.isOverdue ? "error" : "warning"}
                                  label={invoice.isOverdue ? "Overdue" : "Due Soon"}
                                />
                              )}
                            </Box>
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                            {invoice.customer_name || t("dashboard.recentInvoices.unknownCustomer")} · {invoice.issue_date || ""}
                            {invoice.due_date ? ` · Due ${invoice.due_date}` : ""}
                          </Typography>

                          <Box sx={{ mt: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                            <Typography variant="body2" fontWeight={700}>
                              ₹{(invoice.total || 0).toLocaleString()}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<MarkEmailRead fontSize="small" />}
                                disabled={invoice.isPaid || invoiceActionLoading[`${invoice.id}-remind`]}
                                onClick={safeClick(() => handleSendReminder(invoice))}
                                sx={{ textTransform: "none" }}
                              >
                                Send reminder
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle fontSize="small" />}
                                disabled={invoice.isPaid || invoiceActionLoading[`${invoice.id}-paid`]}
                                onClick={safeClick(() => handleMarkAsPaid(invoice))}
                                sx={{ textTransform: "none" }}
                              >
                                Mark as paid
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ) : null
              ))}
            </Stack>
          )}
        </SectionPaper>

        {visibleActionRequiredItems.length > 0 && (
          <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "error.main", flexShrink: 0 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Action Required
          </Typography>
        </Box>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {visibleActionRequiredItems.map((item) => (
            <Grid key={item.key} size={{ xs: 12, md: 4 }}>
              <SectionPaper>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>
                      {item.count}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" sx={{ textTransform: "none", fontWeight: 600 }} onClick={item.onClick}>
                    {item.cta}
                  </Button>
                </Box>
              </SectionPaper>
            </Grid>
          ))}
        </Grid>
          </>
        )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — Quick Actions (filtered by permissions)
        ══════════════════════════════════════════════════════════════════ */}
        {(permIsAdmin || can('invoices', 'create') || can('customers', 'create') || can('products', 'create')) && (
          <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "primary.main", flexShrink: 0 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t('dashboard.sections.quickActions')}
          </Typography>
        </Box>

        <SectionPaper sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {(permIsAdmin || can('invoices', 'create')) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, minWidth: 170 }}
              onClick={safeClick(actionHandlers.goToAddInvoice)}
            >
              New Invoice
              <Chip size="small" label="N" sx={{ ml: 1, height: 18, fontSize: 10 }} />
            </Button>
            )}
            {(permIsAdmin || can('customers', 'create')) && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 170 }}
              onClick={safeClick(actionHandlers.goToAddCustomer)}
            >
              Add Customer
              <Chip size="small" label="C" sx={{ ml: 1, height: 18, fontSize: 10 }} />
            </Button>
            )}
            {(permIsAdmin || can('products', 'create')) && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 170 }}
              onClick={safeClick(actionHandlers.goToAddProduct)}
            >
              Add Product
              <Chip size="small" label="P" sx={{ ml: 1, height: 18, fontSize: 10 }} />
            </Button>
            )}
            <Tooltip title="Coming Soon">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<AccountBalance />}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 180 }}
                  disabled
                >
                  Import Bank Feed
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </SectionPaper>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 8 — Smart Suggestions (admin/settings only)
        ══════════════════════════════════════════════════════════════════ */}
        {permIsAdmin && (
          <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 3, height: 18, borderRadius: 4, bgcolor: "info.main", flexShrink: 0 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Smart Suggestions
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionPaper title="Enable GST Auto Filing" subtitle="Reduce month-end compliance effort with auto-generated tax drafts.">
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600 }}
                onClick={safeClick(() => navigate("/settings?section=gst-config"))}
              >
                Setup
              </Button>
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionPaper title="Setup Payment Gateway" subtitle="Collect invoice payments faster by enabling online checkout links.">
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600 }}
                onClick={safeClick(() => navigate("/settings?section=integrations"))}
              >
                Configure
              </Button>
            </SectionPaper>
          </Grid>
        </Grid>
          </>
        )}

      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
