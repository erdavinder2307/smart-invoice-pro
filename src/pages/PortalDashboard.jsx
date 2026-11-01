import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import {
  AccountBalanceWallet,
  CalendarToday,
  Payment,
  Receipt,
} from "@mui/icons-material";
import axios from "axios";
import { createApiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

// ── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon, iconColor }) => (
  <Card elevation={2} sx={{ borderRadius: 2, height: "100%" }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: `${iconColor}22`,
          color: iconColor,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

// ── Status chip ──────────────────────────────────────────────────────────────

const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "success";
    case "overdue":
      return "error";
    case "draft":
      return "default";
    default:
      return "warning";
  }
};

// ── Empty state ──────────────────────────────────────────────────────────────

const EmptyInvoices = () => (
  <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
    <Receipt sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
    <Typography variant="h6" gutterBottom>
      No invoices yet
    </Typography>
    <Typography variant="body2">
      Your invoices will appear here once your supplier creates them.
    </Typography>
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

const PortalDashboard = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");
        // Uses standard axios interceptor — Authorization header set automatically
        const res = await axios.get(createApiUrl("/api/customer/invoices"));
        setInvoices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("portal: failed to fetch invoices", err);
        setError("Unable to load your invoices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Stats
  const unpaid = invoices.filter((i) => ["Unpaid", "Overdue", "Issued"].includes(i.status));
  const outstandingBalance = unpaid.reduce(
    (s, i) => s + Number(i.total_amount || i.amount || 0),
    0
  );
  const paid = invoices.filter((i) => i.status === "Paid");
  const nextDue = unpaid
    .filter((i) => i.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Welcome back{user?.name ? `, ${user.name}` : ""}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Here's a summary of your account.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Balance"
            value={`$${outstandingBalance.toFixed(2)}`}
            icon={<AccountBalanceWallet />}
            iconColor="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={invoices.length}
            icon={<Receipt />}
            iconColor="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid Invoices"
            value={paid.length}
            icon={<Payment />}
            iconColor="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Next Due Date"
            value={
              nextDue
                ? new Date(nextDue.due_date).toLocaleDateString()
                : "None outstanding"
            }
            icon={<CalendarToday />}
            iconColor="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Invoice table */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Your Invoices
          </Typography>

          {invoices.length === 0 ? (
            <EmptyInvoices />
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell fontWeight={600}>Invoice #</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {inv.invoice_number || inv.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {inv.issue_date
                            ? new Date(inv.issue_date).toLocaleDateString()
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {inv.due_date
                            ? new Date(inv.due_date).toLocaleDateString()
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ${Number(inv.total_amount || inv.amount || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={inv.status || "Draft"}
                          color={statusColor(inv.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PortalDashboard;
