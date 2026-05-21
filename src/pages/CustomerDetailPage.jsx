import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createApiUrl } from "../config/api";
import MainLayout from "../components/Layout/MainLayout";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Alert,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import DownloadIcon from "@mui/icons-material/Download";
import EmptyState from "../components/common/EmptyState";
import { useTranslation } from "react-i18next";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid": return "success";
    case "overdue": return "error";
    case "draft": return "default";
    case "sent": return "info";
    case "partially paid": return "warning";
    case "cancelled":
    case "void": return "default";
    default: return "primary";
  }
};

const StatCard = ({ icon, label, value, color }) => (
  <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Avatar sx={{ bgcolor: `${color}.50`, color: `${color}.main`, width: 38, height: 38 }}>
          {icon}
        </Avatar>
        <Typography sx={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value }) =>
  value ? (
    <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
      <Typography sx={{ fontSize: "0.8125rem", color: "#6b7280", minWidth: 130 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.8125rem", color: "#111827", fontWeight: 500 }}>{value}</Typography>
    </Box>
  ) : null;

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyTab, setHistoryTab] = useState(0);

  const handleDownloadStatement = async () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const name = data?.customer?.display_name ||
      [data?.customer?.first_name, data?.customer?.last_name].filter(Boolean).join(" ") ||
      data?.customer?.company_name || "Customer";

    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Customer Statement", 14, 18);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Customer: ${name}`, 14, 27);
    if (billingAddress) doc.text(`Address: ${billingAddress}`, 14, 33);
    doc.text(`Generated: ${today}`, 14, billingAddress ? 39 : 33);

    const startY = billingAddress ? 46 : 40;
    const rows = (data?.invoices || []).map((inv) => [
      inv.invoice_number || "—",
      inv.issue_date ? new Date(inv.issue_date).toLocaleDateString("en-IN") : "—",
      inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "—",
      formatCurrency(inv.total_amount),
      formatCurrency(inv.amount_paid),
      formatCurrency(inv.balance_due),
    ]);
    rows.push([
      { content: "Total", styles: { fontStyle: "bold" } },
      "", "",
      { content: formatCurrency(data?.total_invoiced), styles: { fontStyle: "bold" } },
      { content: formatCurrency(data?.total_paid), styles: { fontStyle: "bold" } },
      { content: formatCurrency(data?.outstanding), styles: { fontStyle: "bold" } },
    ]);

    autoTable(doc, {
      startY,
      head: [["Invoice #", "Date", "Due Date", "Total", "Paid", "Balance"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const slug = name.replace(/\s+/g, "_");
    const dateSlug = new Date().toISOString().slice(0, 10);
    doc.save(`statement_${slug}_${dateSlug}.pdf`);
  };

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(createApiUrl(`/api/customers/${id}/overview`));
        setData(res.data);
      } catch {
        setError(t('customerDetail.failedFetch'));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [id, t]);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ m: 2 }}>{error || t('customerDetail.notFound')}</Alert>
      </MainLayout>
    );
  }

  const { customer, invoices, payments_received, quotes, total_invoiced, total_paid, outstanding, invoice_count } = data;

  const displayName =
    customer.display_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    customer.company_name ||
    "Unknown Customer";

  const billingAddress = [
    customer.billing_address,
    customer.billing_city,
    customer.billing_state,
    customer.billing_zip,
    customer.billing_country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <MainLayout>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/customers")}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              fontWeight: 500,
              fontSize: "0.8125rem",
              "&:hover": { bgcolor: "#f3f4f6" },
              borderRadius: "7px",
              px: 1.2,
              py: 0.6,
            }}
          >
            Customers
          </Button>
          <Typography sx={{ color: "#d1d5db" }}>/</Typography>
          <Typography sx={{ fontSize: "0.875rem", color: "#111827", fontWeight: 600 }}>
            {displayName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadStatement}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "7px",
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
            }}
          >
            Statement
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/customers/edit/${id}`)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "7px",
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
            }}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Customer Name + Status */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <Avatar sx={{ bgcolor: "#eff6ff", color: "#2563eb", width: 44, height: 44 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
            {displayName}
          </Typography>
          {customer.company_name && displayName !== customer.company_name && (
            <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {customer.company_name}
            </Typography>
          )}
        </Box>
        <Chip
          label={customer.status || "Active"}
          size="small"
          color={customer.status === "Inactive" ? "default" : "success"}
          sx={{ fontWeight: 600, ml: 0.5 }}
        />
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ReceiptLongIcon sx={{ fontSize: 18 }} />}
            label="Total Invoiced"
            value={formatCurrency(total_invoiced)}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PaymentsIcon sx={{ fontSize: 18 }} />}
            label="Total Paid"
            value={formatCurrency(total_paid)}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
            label="Outstanding"
            value={formatCurrency(outstanding)}
            color={outstanding > 0 ? "error" : "success"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FormatListNumberedIcon sx={{ fontSize: 18 }} />}
            label="Total Invoices"
            value={invoice_count}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Details + Invoice Table laid out in columns */}
      <Grid container spacing={2}>
        {/* Left: Contact Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px", height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#8b95a7",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  mb: 1.5,
                }}
              >
                Contact Details
              </Typography>
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Mobile" value={customer.mobile} />
              <InfoRow label="Customer Type" value={customer.customer_type} />
              <InfoRow label="Place of Supply" value={customer.place_of_supply} />
              <InfoRow label="Currency" value={customer.currency} />
              <InfoRow label="Payment Terms" value={customer.payment_terms} />

              {(customer.gst_treatment || customer.gst_number || customer.pan) && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#8b95a7",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      mb: 1.5,
                    }}
                  >
                    Tax Info
                  </Typography>
                  <InfoRow label="GST Treatment" value={customer.gst_treatment} />
                  <InfoRow label="GSTIN" value={customer.gst_number} />
                  <InfoRow label="PAN" value={customer.pan} />
                </>
              )}

              {billingAddress && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#8b95a7",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    Billing Address
                  </Typography>
                  <Typography sx={{ fontSize: "0.8125rem", color: "#374151", lineHeight: 1.6 }}>
                    {billingAddress}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Invoice / Payments / Quotes */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
            <CardContent sx={{ p: 0 }}>
              <Tabs
                value={historyTab}
                onChange={(_e, v) => setHistoryTab(v)}
                sx={{ px: 2, pt: 1, borderBottom: "1px solid #e5e7eb" }}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label={`Invoices (${(invoices || []).length})`} />
                <Tab label={`Payments (${(payments_received || []).length})`} />
                <Tab label={`Quotes (${(quotes || []).length})`} />
              </Tabs>

              {/* Invoices tab */}
              {historyTab === 0 && (
                (invoices || []).length === 0 ? (
                  <EmptyState icon={<ReceiptLongIcon />} title="No invoices yet" />
                ) : (
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#fafbfc" }}>
                          {["INVOICE #", "DATE", "DUE DATE", "AMOUNT", "STATUS", "BALANCE DUE"].map(
                            (col, i) => (
                              <TableCell
                                key={col}
                                align={i >= 3 ? "right" : "left"}
                                sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#8b95a7", letterSpacing: "0.05em", borderBottomColor: "#edf0f3", py: 1.2, whiteSpace: "nowrap" }}
                              >
                                {col}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.map((inv) => (
                          <TableRow
                            key={inv.id}
                            hover
                            sx={{ cursor: "pointer", "& td": { borderBottomColor: "#edf0f3", py: 1.4 } }}
                            onClick={() => navigate(`/invoices/edit/${inv.id}`)}
                          >
                            <TableCell>
                              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#2563eb" }}>
                                {inv.invoice_number || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>{formatDate(inv.issue_date)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>{formatDate(inv.due_date)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>{formatCurrency(inv.total_amount)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={inv.status || "Draft"} size="small" color={statusColor(inv.status)} sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: Number(inv.balance_due) > 0 ? "#dc2626" : "#16a34a" }}>
                                {formatCurrency(inv.balance_due)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}

              {/* Payments tab */}
              {historyTab === 1 && (
                (payments_received || []).length === 0 ? (
                  <EmptyState icon={<PaymentsIcon />} title="No payments recorded" />
                ) : (
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#fafbfc" }}>
                          {["DATE", "INVOICE #", "AMOUNT", "MODE"].map((col, i) => (
                            <TableCell
                              key={col}
                              align={i === 2 ? "right" : "left"}
                              sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#8b95a7", letterSpacing: "0.05em", borderBottomColor: "#edf0f3", py: 1.2 }}
                            >
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(payments_received || []).map((pmt, idx) => (
                          <TableRow
                            key={pmt.invoice_id || idx}
                            hover
                            sx={{ cursor: pmt.invoice_id ? "pointer" : "default", "& td": { borderBottomColor: "#edf0f3", py: 1.4 } }}
                            onClick={() => pmt.invoice_id && navigate(`/invoices/edit/${pmt.invoice_id}`)}
                          >
                            <TableCell><Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>{formatDate(pmt.issue_date)}</Typography></TableCell>
                            <TableCell><Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#2563eb" }}>{pmt.invoice_number || "—"}</Typography></TableCell>
                            <TableCell align="right"><Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>{formatCurrency(pmt.amount)}</Typography></TableCell>
                            <TableCell><Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>{pmt.payment_mode || "—"}</Typography></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}

              {/* Quotes tab */}
              {historyTab === 2 && (
                (quotes || []).length === 0 ? (
                  <EmptyState icon={<FormatListNumberedIcon />} title="No quotes yet" />
                ) : (
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#fafbfc" }}>
                          {["QUOTE #", "DATE", "AMOUNT", "STATUS"].map((col, i) => (
                            <TableCell
                              key={col}
                              align={i === 2 ? "right" : "left"}
                              sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#8b95a7", letterSpacing: "0.05em", borderBottomColor: "#edf0f3", py: 1.2 }}
                            >
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(quotes || []).map((q) => (
                          <TableRow
                            key={q.id}
                            hover
                            sx={{ cursor: "pointer", "& td": { borderBottomColor: "#edf0f3", py: 1.4 } }}
                            onClick={() => navigate(`/quotes/edit/${q.id}`)}
                          >
                            <TableCell><Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#2563eb" }}>{q.quote_number || "—"}</Typography></TableCell>
                            <TableCell><Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>{formatDate(q.issue_date)}</Typography></TableCell>
                            <TableCell align="right"><Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>{formatCurrency(q.total_amount)}</Typography></TableCell>
                            <TableCell>
                              <Chip label={q.status || "Draft"} size="small" color={statusColor(q.status)} sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default CustomerDetailPage;
