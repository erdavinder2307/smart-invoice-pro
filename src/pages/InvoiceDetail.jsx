import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MainLayout from "../components/Layout/MainLayout";
import { createApiUrl } from "../config/api";
import EntityActivityPanel from "../components/Activity/EntityActivityPanel";
import { normalizePaymentTerms } from "../utils/invoiceFormValidation";

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const looksLikeUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));

const formatRecordedBy = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  if (looksLikeUuid(raw)) return "User";
  return raw;
};

const STATUS_COLORS = {
  Draft:            "default",
  Issued:           "primary",
  Paid:             "success",
  "Partially Paid": "warning",
  Overdue:          "error",
  Cancelled:        "default",
  ARCHIVED:         "secondary",
};

// ── Sub-components ─────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
    <Typography sx={{ fontSize: "0.8125rem", color: "#6b7280", minWidth: 140 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.8125rem", color: "#111827", fontWeight: 500 }}>
      {value || "—"}
    </Typography>
  </Box>
);

const TotalRow = ({ label, value, bold }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      mb: 0.75,
      ...(bold && { fontWeight: 700 }),
    }}
  >
    <Typography sx={{ fontSize: bold ? "0.95rem" : "0.84rem", color: bold ? "#111827" : "#6b7280", fontWeight: bold ? 700 : 400 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: bold ? "0.95rem" : "0.84rem", color: bold ? "#111827" : "#374151", fontWeight: bold ? 700 : 500 }}>
      {value}
    </Typography>
  </Box>
);

// ── Main component ─────────────────────────────────────────────────────────
const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfError, setPdfError] = useState("");

  // Fetch invoice
  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: async () => {
      const res = await axios.get(createApiUrl(`/api/invoices/${id}`));
      return res.data;
    },
    enabled: Boolean(id),
  });

  const handleDownloadPDF = async () => {
    setPdfError("");
    try {
      const res = await axios.get(createApiUrl(`/api/invoices/${id}/pdf`), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `${invoice?.invoice_number || "invoice"}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("Failed to download PDF.");
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 960, mx: "auto" }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        </Box>
      </MainLayout>
    );
  }

  if (isError || !invoice) {
    return (
      <MainLayout>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 960, mx: "auto" }}>
          <Alert severity="error">Failed to load invoice. Please go back and try again.</Alert>
          <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate("/invoices")}>
            Back to Invoices
          </Button>
        </Box>
      </MainLayout>
    );
  }

  const paymentHistory = Array.isArray(invoice.payment_history) ? invoice.payment_history : [];
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 960, mx: "auto" }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 3,
            pb: 2,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/invoices")}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Invoices
            </Button>
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>
              {invoice.invoice_number}
            </Typography>
            <Chip
              label={invoice.status}
              color={STATUS_COLORS[invoice.status] || "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {["Issued", "Partially Paid"].includes(invoice.status) &&
              invoice.due_date &&
              new Date(invoice.due_date) < new Date() && (
                <Chip
                  label="OVERDUE"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                />
              )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleDownloadPDF}
              sx={{ textTransform: "none" }}
            >
              Download PDF
            </Button>
            {invoice.status !== "Cancelled" && (
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/invoices/edit/${id}`)}
                sx={{ textTransform: "none" }}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>

        {pdfError && (
          <Alert severity="error" onClose={() => setPdfError("")} sx={{ mb: 2 }}>
            {pdfError}
          </Alert>
        )}

        {/* ── Summary ────────────────────────────────────────────────── */}
        <Paper
          variant="outlined"
          sx={{ p: 2.5, mb: 3, borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 3 }}
        >
          <Box sx={{ flex: "1 1 200px" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", mb: 1 }}>
              Customer
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>
              {invoice.customer_name || "—"}
            </Typography>
            {invoice.customer_email && (
              <Typography sx={{ fontSize: "0.82rem", color: "#6b7280" }}>
                {invoice.customer_email}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: "1 1 200px" }}>
            <InfoRow label="Issue Date" value={formatDate(invoice.issue_date)} />
            <InfoRow label="Due Date" value={formatDate(invoice.due_date)} />
            <InfoRow label="Payment Terms" value={normalizePaymentTerms(invoice.payment_terms)} />
          </Box>
          <Box sx={{ flex: "1 1 200px" }}>
            <InfoRow label="Salesperson" value={invoice.salesperson} />
            <InfoRow label="Subject" value={invoice.subject} />
            {invoice.notes && <InfoRow label="Notes" value={invoice.notes} />}
          </Box>
        </Paper>

        {/* ── Line Items ─────────────────────────────────────────────── */}
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", mb: 1.5 }}>
          Line Items
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2, overflowX: "auto" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                {["Item", "Description", "Qty", "Rate", "Tax %", "Amount"].map((col) => (
                  <TableCell key={col} sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#9ca3af", fontSize: "0.84rem" }}>
                    No items
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: "0.84rem", color: "#111827" }}>
                      {item.product_name || item.name || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.84rem", color: "#6b7280", maxWidth: 200 }}>
                      {item.description || ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.84rem" }}>{item.quantity}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem" }}>{formatCurrency(item.rate)}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem" }}>{item.tax != null ? `${item.tax}%` : "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem", fontWeight: 600 }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Totals ─────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, width: { xs: "100%", sm: 340 }, borderRadius: 2 }}>
            <TotalRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            {Number(invoice.cgst_amount) > 0 && (
              <TotalRow label="CGST" value={`+ ${formatCurrency(invoice.cgst_amount)}`} />
            )}
            {Number(invoice.sgst_amount) > 0 && (
              <TotalRow label="SGST" value={`+ ${formatCurrency(invoice.sgst_amount)}`} />
            )}
            {Number(invoice.igst_amount) > 0 && (
              <TotalRow label="IGST" value={`+ ${formatCurrency(invoice.igst_amount)}`} />
            )}
            {Number(invoice.total_tax) > 0 &&
              !invoice.cgst_amount && !invoice.sgst_amount && !invoice.igst_amount && (
                <TotalRow label="Tax" value={`+ ${formatCurrency(invoice.total_tax)}`} />
              )}
            {Number(invoice.invoice_discount) > 0 && (
              <TotalRow label="Discount" value={`- ${formatCurrency(invoice.invoice_discount)}`} />
            )}
            {Number(invoice.round_off) !== 0 && (
              <TotalRow label="Round Off" value={formatCurrency(invoice.round_off)} />
            )}
            <Divider sx={{ my: 1 }} />
            <TotalRow label="Total" value={formatCurrency(invoice.total_amount)} bold />
            {Number(invoice.amount_paid) > 0 && (
              <TotalRow label="Amount Paid" value={`- ${formatCurrency(invoice.amount_paid)}`} />
            )}
            {Number(invoice.balance_due) > 0 && (
              <TotalRow label="Balance Due" value={formatCurrency(invoice.balance_due)} bold />
            )}
          </Paper>
        </Box>

        {/* ── Payment History ─────────────────────────────────────────── */}
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", mb: 1.5 }}>
          Payment History
        </Typography>
        {paymentHistory.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, textAlign: "center" }}>
            <Typography sx={{ color: "#9ca3af", fontSize: "0.84rem" }}>
              No payments recorded yet.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2, overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  {["Date", "Amount", "Mode", "Reference", "Recorded By"].map((col) => (
                    <TableCell key={col} sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentHistory.map((pmt, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: "0.84rem" }}>{formatDate(pmt.payment_date || pmt.date)}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem", fontWeight: 600 }}>{formatCurrency(pmt.amount)}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem" }}>{pmt.payment_mode || "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem", color: "#6b7280" }}>{pmt.reference_number || pmt.reference || "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.84rem", color: "#6b7280" }}>{formatRecordedBy(pmt.recorded_by)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <EntityActivityPanel entityType="invoice" entityId={id} />

      </Box>
    </MainLayout>
  );
};

export default InvoiceDetail;
