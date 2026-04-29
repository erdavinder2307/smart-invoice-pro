import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import MuiTooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Add, OpenInNew } from "@mui/icons-material";
import SectionPaper from "../common/SectionPaper";
import { safeClick } from "../../utils/safeClick";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * RevenueTrendChart
 *
 * Props:
 *   data               Array<{label, revenue, previous_revenue, percentage_change}>
 *   loading            boolean
 *   error              string
 *   rangeLabel         string  — e.g. "This Month"
 *   comparisonLabel    string  — e.g. "vs Last Month"
 *   onNavigateToRevenue  () => void  — chart click / chip click
 *   onCreateInvoice    () => void  — CTA in empty state
 */
const RevenueTrendChart = ({
  data = [],
  loading = false,
  error = "",
  rangeLabel = "",
  comparisonLabel = "",
  onNavigateToRevenue,
  onCreateInvoice,
  sx = {},
}) => {
  const theme = useTheme();

  const hasPrevious = data.some((d) => (d.previous_revenue ?? 0) > 0);

  const chartData =
    data.length > 0
      ? {
          labels: data.map((d) => d.label),
          datasets: [
            {
              label: rangeLabel || "Revenue",
              data: data.map((d) => d.revenue),
              backgroundColor: theme.palette.primary.main,
              borderRadius: 4,
              borderSkipped: false,
              order: 2,
            },
            ...(hasPrevious
              ? [
                  {
                    label: comparisonLabel || "Previous Period",
                    data: data.map((d) => d.previous_revenue ?? 0),
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.10)",
                    borderRadius: 4,
                    borderSkipped: false,
                    order: 3,
                  },
                ]
              : []),
          ],
        }
      : null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: hasPrevious,
        position: "top",
        labels: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
          boxWidth: 14,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const item = data[ctx.dataIndex];
            const value = `₹${(ctx.raw || 0).toLocaleString("en-IN")}`;
            if (ctx.datasetIndex === 0 && item?.percentage_change !== undefined) {
              const sign = item.percentage_change >= 0 ? "+" : "";
              return [`Revenue: ${value}`, `${sign}${item.percentage_change}% vs prev`];
            }
            return `${ctx.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: theme.palette.divider },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
          callback: (v) =>
            v >= 100000
              ? `₹${(v / 100000).toFixed(1)}L`
              : v >= 1000
              ? `₹${(v / 1000).toFixed(0)}K`
              : `₹${v}`,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 10 },
          maxRotation: 45,
          maxTicksLimit: 12,
        },
      },
    },
  };

  return (
    <SectionPaper
      title={`Revenue Trend — ${rangeLabel}`}
      subtitle={`Compared to ${comparisonLabel}`}
      action={
        <MuiTooltip title="View full revenue report">
          <Chip
            label="View Report"
            size="small"
            variant="outlined"
            icon={<OpenInNew sx={{ fontSize: "0.85rem !important" }} />}
            onClick={onNavigateToRevenue ? safeClick(onNavigateToRevenue) : undefined}
            sx={{
              borderColor: "divider",
              cursor: onNavigateToRevenue ? "pointer" : "default",
              fontSize: "0.75rem",
            }}
          />
        </MuiTooltip>
      }
      sx={{ minHeight: 340, ...sx }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 250,
          }}
        >
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : !chartData ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 250,
            gap: 2,
          }}
        >
          <Typography color="text.secondary" variant="body2">
            No revenue in this period
          </Typography>
          {onCreateInvoice && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={safeClick(onCreateInvoice)}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Create Invoice
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            height: 250,
            mt: 1,
            cursor: onNavigateToRevenue ? "pointer" : "default",
          }}
          onClick={onNavigateToRevenue ? safeClick(onNavigateToRevenue) : undefined}
          role={onNavigateToRevenue ? "button" : undefined}
          aria-label={onNavigateToRevenue ? "View revenue report" : undefined}
          tabIndex={onNavigateToRevenue ? 0 : undefined}
          data-testid="revenue-chart-area"
        >
          <Bar data={chartData} options={options} data-testid="revenue-bar-chart" />
        </Box>
      )}
    </SectionPaper>
  );
};

export default RevenueTrendChart;
