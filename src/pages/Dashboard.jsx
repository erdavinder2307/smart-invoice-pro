import React, { useEffect, useState } from "react";
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
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import {
  People,
  Inventory,
  Receipt,
  AttachMoney,
  Add,
  MoreVert,
  Search,
  AccountBalance,
  ReceiptLong,
  Payments,
  Warning,
  TrendingUp,
  OpenInNew,
} from "@mui/icons-material";

import axios from "axios";
import { createApiUrl } from "../config/api";
import ProductStockSummary from "../components/ProductStockSummary";
import StatCard from "../components/common/StatCard";
import SectionPaper from "../components/common/SectionPaper";
import FeatureCard from "../components/common/FeatureCard";
import SectionHeader from "../components/common/SectionHeader";
import StatusBadge from "../components/common/StatusBadge";
import { featureCapabilities } from "../data/dashboardData";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

// ────────────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // ── UI state ─────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [revenueRange, setRevenueRange] = useState("this_year");

  // ── API calls ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setSummaryLoading(true);
    axios
      .get(createApiUrl("/api/dashboard/summary"))
      .then((res) => setSummary(res.data))
      .catch(() => setSummaryError(t('dashboard.failedSummary')))
      .finally(() => setSummaryLoading(false));

    setLowStockLoading(true);
    axios
      .get(createApiUrl("/api/dashboard/low-stock"))
      .then((res) => setLowStock(res.data))
      .catch(() => setLowStockError(t('dashboard.failedLowStock')))
      .finally(() => setLowStockLoading(false));

    setRevenueLoading(true);
    axios
      .get(createApiUrl("/api/dashboard/monthly-revenue"))
      .then((res) => setRevenue(res.data))
      .catch(() => setRevenueError(t('dashboard.failedRevenue')))
      .finally(() => setRevenueLoading(false));

    setRecentLoading(true);
    axios
      .get(createApiUrl("/api/dashboard/recent-invoices"))
      .then((res) => setRecentInvoices(res.data))
      .catch(() => setRecentInvoices([]))
      .finally(() => setRecentLoading(false));
  }, [t]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const revenueChartData = revenue && Array.isArray(revenue) && revenue.length > 0
    ? {
      labels: revenue.map((r) => r.month),
      datasets: [
        {
          label: t('dashboard.chart.monthlyRevenueDataset'),
          data: revenue.map((r) => r.revenue),
          backgroundColor: theme.palette.primary.main,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }
    : null;

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary, font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary, font: { size: 11 } },
      },
    },
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (v) => (v !== undefined && v !== null ? v.toLocaleString() : "—");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const greetName = user.username || "there";

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
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 0.75,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                minWidth: 220,
              }}
            >
              <Search sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: "0.875rem", flex: 1 }}
                inputProps={{ "aria-label": t('dashboard.searchAriaLabel') }}
              />
            </Paper>

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
              <MenuItem value="this_week">{t('dashboard.filters.thisWeek')}</MenuItem>
              <MenuItem value="this_month">{t('dashboard.filters.thisMonth')}</MenuItem>
              <MenuItem value="this_quarter">{t('dashboard.filters.thisQuarter')}</MenuItem>
              <MenuItem value="this_year">{t('dashboard.filters.thisYear')}</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — KPI Summary Cards (Real + Derived)
        ══════════════════════════════════════════════════════════════════ */}
        {/* Overdue alert banner */}
        {!summaryLoading && summary?.overdue_count > 0 && (
          <Alert
            severity="error"
            icon={<Warning fontSize="inherit" />}
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate("/invoices")}>
                {t('dashboard.viewInvoices')}
              </Button>
            }
          >
            <strong>{t('dashboard.overdueMessage', { count: summary.overdue_count })}</strong>{" "}
            {t('dashboard.overdueFollowUp')}
          </Alert>
        )}
        <Container maxWidth="xl" disableGutters>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={600}
            sx={{ mb: 1.5, display: "block" }}
          >
            {t('dashboard.sections.businessOverview')}
          </Typography>

          {/* Row A — Real data */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<People sx={{ fontSize: 22, color: "primary.main" }} />}
                label={t('dashboard.kpi.totalCustomers')}
                value={summaryLoading ? undefined : summaryError ? "—" : fmt(summary?.total_customers)}
                loading={summaryLoading}
                trend={12}
                accentColor="primary.main"
                iconBg="primary.50"
                sx={{ height: "100%" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<Inventory sx={{ fontSize: 22, color: "secondary.main" }} />}
                label={t('dashboard.kpi.totalProducts')}
                value={summaryLoading ? undefined : summaryError ? "—" : fmt(summary?.total_products)}
                loading={summaryLoading}
                trend={8}
                accentColor="secondary.main"
                iconBg="secondary.50"
                sx={{ height: "100%" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<Receipt sx={{ fontSize: 22, color: "info.main" }} />}
                label={t('dashboard.kpi.totalInvoices')}
                value={summaryLoading ? undefined : summaryError ? "—" : fmt(summary?.total_invoices)}
                loading={summaryLoading}
                trend={15}
                accentColor="info.main"
                iconBg="info.50"
                sx={{ height: "100%" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<AttachMoney sx={{ fontSize: 22, color: "success.main" }} />}
                label={t('dashboard.kpi.totalRevenue')}
                value={summaryLoading ? undefined : summaryError ? "—" : `₹${fmt(summary?.total_revenue)}`}
                loading={summaryLoading}
                trend={18}
                accentColor="success.main"
                iconBg="success.50"
                sx={{ height: "100%" }}
              />
            </Grid>
          </Grid>

          {/* Row B — Receivables / Payables / Overdue / MRR */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<ReceiptLong sx={{ fontSize: 22, color: "warning.main" }} />}
                label={t('dashboard.kpi.totalReceivables')}
                value={summaryLoading ? undefined : `₹${fmt(summary?.total_receivables ?? 0)}`}
                loading={summaryLoading}
                accentColor="warning.main"
                iconBg="warning.50"
                sx={{ height: "100%" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<Payments sx={{ fontSize: 22, color: "error.main" }} />}
                label={t('dashboard.kpi.totalPayables')}
                value={summaryLoading ? undefined : `₹${fmt(summary?.total_payables ?? 0)}`}
                loading={summaryLoading}
                accentColor="error.main"
                iconBg="error.50"
                sx={{ height: "100%" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<Warning sx={{ fontSize: 22, color: "error.main" }} />}
                label={t('dashboard.kpi.overdueInvoices')}
                value={summaryLoading ? undefined : fmt(summary?.overdue_count ?? 0)}
                loading={summaryLoading}
                accentColor="error.main"
                iconBg="error.50"
                sx={{ height: "100%" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
              <StatCard
                icon={<TrendingUp sx={{ fontSize: 22, color: "secondary.main" }} />}
                label={t('dashboard.kpi.monthlyRecurringRevenue')}
                value={t('dashboard.kpi.comingSoon')}
                accentColor="secondary.main"
                iconBg="secondary.50"
                sx={{ height: "100%" }}
              />
            </Grid>
          </Grid>
        </Container>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Revenue Analytics
        ══════════════════════════════════════════════════════════════════ */}
        <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "block" }}>
          {t('dashboard.sections.revenueAnalytics')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Bar Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <SectionPaper
              title={t('dashboard.chart.monthlyRevenue')}
              subtitle={t('dashboard.chart.monthlyRevenueSubtitle')}
              action={
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip label={t('dashboard.chart.thisYearChip')} size="small" variant="outlined" sx={{ borderColor: "divider" }} />
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ minHeight: 340 }}
            >
              {revenueLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 250 }}>
                  <CircularProgress size={36} />
                </Box>
              ) : revenueError ? (
                <Alert severity="error" sx={{ mt: 1 }}>{revenueError}</Alert>
              ) : revenueChartData ? (
                <Box sx={{ height: 250, mt: 1 }}>
                  <Bar data={revenueChartData} options={revenueChartOptions} />
                </Box>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 8 }}>
                  {t('dashboard.chart.noData')}
                </Typography>
              )}
            </SectionPaper>
          </Grid>

          {/* Inventory Overview (right column) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionPaper title={t('dashboard.inventory.title')} sx={{ height: "100%" }}>
              {lowStockLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : lowStockError ? (
                <Alert severity="error">{lowStockError}</Alert>
              ) : (
                <>
                  {/* Summary chips */}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    <Chip
                      icon={<Inventory sx={{ fontSize: "1rem !important" }} />}
                      label={t('dashboard.inventory.totalChip', { count: summary?.total_products ?? 0 })}
                      size="small"
                      variant="outlined"
                    />
                    {lowStock.filter((i) => i.stock < 5).length > 0 && (
                      <Chip
                        label={t('dashboard.inventory.criticalChip', { count: lowStock.filter((i) => i.stock < 5).length })}
                        size="small"
                        color="error"
                      />
                    )}
                    {lowStock.filter((i) => i.stock >= 5).length > 0 && (
                      <Chip
                        label={t('dashboard.inventory.lowChip', { count: lowStock.filter((i) => i.stock >= 5).length })}
                        size="small"
                        color="warning"
                      />
                    )}
                  </Box>

                  {lowStock.length === 0 ? (
                    <Alert severity="success">{t('dashboard.inventory.wellStocked')}</Alert>
                  ) : (
                    <>
                      <Alert severity="warning" sx={{ mb: 1.5 }}>
                        {t('dashboard.inventory.needsAttention', { count: lowStock.length })}
                      </Alert>
                      <List disablePadding>
                        {lowStock.slice(0, 5).map((item, idx) => (
                          <React.Fragment key={item.id || idx}>
                            <ListItem
                              disablePadding
                              sx={{ py: 0.75, display: "flex", justifyContent: "space-between" }}
                            >
                              <ListItemText
                                primary={<Typography variant="body2" fontWeight={500}>{item.name}</Typography>}
                                secondary={<Typography variant="caption" color="text.secondary">{ t('dashboard.inventory.stockLabel', { count: item.stock }) }</Typography>}
                                sx={{ m: 0 }}
                              />
                              <Chip
                                label={item.stock < 5 ? t('dashboard.inventory.criticalBadge') : t('dashboard.inventory.lowBadge')}
                                size="small"
                                color={item.stock < 5 ? "error" : "warning"}
                                variant="outlined"
                                sx={{ fontWeight: 600, ml: 1 }}
                              />
                            </ListItem>
                            {idx < Math.min(lowStock.length, 5) - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </>
                  )}
                </>
              )}
            </SectionPaper>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — Full Inventory Table
        ══════════════════════════════════════════════════════════════════ */}
        <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "block" }}>
          {t('dashboard.sections.stockDetail')}
        </Typography>
        <Box sx={{ mb: 4 }}>
          <ProductStockSummary />
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — Recent Invoices Activity Feed
        ══════════════════════════════════════════════════════════════════ */}
        <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "block" }}>
          {t('dashboard.sections.recentActivity')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <SectionPaper
              title={t('dashboard.recentInvoices.title')}
              subtitle={t('dashboard.recentInvoices.subtitle')}
              action={
                <Button
                  size="small"
                  endIcon={<OpenInNew fontSize="small" />}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  onClick={() => navigate("/invoices")}
                >
                  {t('dashboard.recentInvoices.viewAll')}
                </Button>
              }
            >
              {recentLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : recentInvoices.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  {t('dashboard.recentInvoices.empty')}
                </Typography>
              ) : (
                <List disablePadding sx={{ mt: 0.5 }}>
                  {recentInvoices.map((inv, idx) => (
                    <React.Fragment key={inv.id}>
                      <ListItem
                        disablePadding
                        sx={{ py: 1.25, display: "flex", justifyContent: "space-between", gap: 2 }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 36, height: 36, borderRadius: 2,
                              bgcolor: "primary.50",
                              display: "flex", alignItems: "center",
                              justifyContent: "center", flexShrink: 0,
                            }}
                          >
                            <Receipt sx={{ fontSize: 18, color: "primary.main" }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {inv.invoice_number || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {inv.customer_name || t('dashboard.recentInvoices.unknownCustomer')} · {inv.issue_date || ""}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                          <StatusBadge status={inv.status} size="small" />
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 80, textAlign: "right" }}>
                            ₹{(inv.total_amount ?? 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </ListItem>
                      {idx < recentInvoices.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </SectionPaper>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — Quick Actions
        ══════════════════════════════════════════════════════════════════ */}
        <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: "block" }}>
          {t('dashboard.sections.quickActions')}
        </Typography>

        <SectionPaper sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 150 }}
              onClick={() => navigate("/invoices/add")}
            >
              {t('dashboard.quickActions.newInvoice')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 150 }}
              onClick={() => navigate("/customers/add")}
            >
              {t('dashboard.quickActions.addCustomer')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 150 }}
              onClick={() => navigate("/products/add")}
            >
              {t('dashboard.quickActions.addProduct')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountBalance />}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, minWidth: 180 }}
              disabled
            >
              {t('dashboard.quickActions.importBank')}
            </Button>
          </Stack>
        </SectionPaper>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — Product Capabilities Overview
        ══════════════════════════════════════════════════════════════════ */}
        <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
          {t('dashboard.sections.productCapabilities')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('dashboard.sections.capabilitiesSubtitle')}
        </Typography>

        <Grid container spacing={2.5}>
          {featureCapabilities.map((feat) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={feat.id}>
              <FeatureCard icon={feat.icon} title={feat.title} status={feat.status} />
            </Grid>
          ))}
        </Grid>

      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
