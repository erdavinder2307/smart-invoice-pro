import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import MainLayout from "../components/Layout/MainLayout";
import EntityActivityPanel from "../components/Activity/EntityActivityPanel";
import { getQuoteById, downloadQuotePdf } from "../services/quoteService";

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

const STATUS_COLORS = {
  Draft:     "default",
  Sent:      "primary",
  Accepted:  "success",
  Declined:  "error",
  Expired:   "warning",
  Converted: "info",
  ARCHIVED:  "secondary",
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
const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfError, setPdfError] = useState("");

  // Fetch quote
  const { data: quote, isLoading, isError } = useQuery({
    queryKey: ["quote-detail", id],
    queryFn: () => getQuoteById(id),
    enabled: Boolean(id),
  });

  const handleDownloadPDF = async () => {
    setPdfError("");
    try {
      await downloadQuotePdf(id, quote?.quote_number);
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

  if (isError || !quote) {
    return (
      <MainLayout>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 960, mx: "auto" }}>
          <Alert severity="error">Failed to load quote. Please go back and try again.</Alert>
          <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate("/quotes")}>
            Back to Quotes
          </Button>
        </Box>
      </MainLayout>
    );
  }

  const items = Array.isArray(quote.items) ? quote.items : [];
  const canConvert = (quote.status === "Accepted" || quote.status === "Sent") && !quote.converted_to_invoice_id;
  const isConverted = Boolean(quote.converted_to_invoice_id);

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
              onClick={() => navigate("/quotes")}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Quotes
            </Button>
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>
              {quote.quote_number}
            </Typography>
            <Chip
              label={quote.status}
              color={STATUS_COLORS[quote.status] || "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
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
            {canConvert && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<SyncAltIcon />}
                onClick={() => navigate(`/quotes/convert/${id}/invoice`)}
                sx={{ textTransform: "none", color: "#1565d8", borderColor: "#1565d8" }}
              >
                Convert to Invoice
              </Button>
            )}
            {isConverted && (
              <Button
                size="small"
                variant="text"
                onClick={() => navigate(`/invoices/${quote.converted_to_invoice_id}`)}
                sx={{ textTransform: "none", color: "#1565d8" }}
              >
                View Invoice →
              </Button>
            )}
            {quote.status !== "Converted" && quote.status !== "ARCHIVED" && (
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/quotes/edit/${id}`)}
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
              {quote.customer_name || "—"}
            </Typography>
            {quote.customer_email && (
              <Typography sx={{ fontSize: "0.82rem", color: "#6b7280" }}>
                {quote.customer_email}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: "1 1 200px" }}>
            <InfoRow label="Issue Date" value={formatDate(quote.issue_date)} />
            <InfoRow label="Expiry Date" value={formatDate(quote.expiry_date)} />
            <InfoRow label="Payment Terms" value={quote.payment_terms} />
          </Box>
          <Box sx={{ flex: "1 1 200px" }}>
            <InfoRow label="Salesperson" value={quote.salesperson} />
            <InfoRow label="Reference #" value={quote.reference_number} />
            <InfoRow label="Subject" value={quote.subject} />
            {quote.notes && <InfoRow label="Notes" value={quote.notes} />}
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
                {["Item", "Qty", "Rate", "Tax %", "Amount"].map((col) => (
                  <TableCell key={col} sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#9ca3af", fontSize: "0.84rem" }}>
                    No items
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: "0.84rem", color: "#111827" }}>
                      {item.product_name || item.name || "—"}
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
            <TotalRow label="Subtotal" value={formatCurrency(quote.subtotal)} />
            {Number(quote.cgst_amount) > 0 && (
              <TotalRow label="CGST" value={`+ ${formatCurrency(quote.cgst_amount)}`} />
            )}
            {Number(quote.sgst_amount) > 0 && (
              <TotalRow label="SGST" value={`+ ${formatCurrency(quote.sgst_amount)}`} />
            )}
            {Number(quote.igst_amount) > 0 && (
              <TotalRow label="IGST" value={`+ ${formatCurrency(quote.igst_amount)}`} />
            )}
            {Number(quote.total_tax) > 0 &&
              !Number(quote.cgst_amount) && !Number(quote.sgst_amount) && !Number(quote.igst_amount) && (
                <TotalRow label="Tax" value={`+ ${formatCurrency(quote.total_tax)}`} />
              )}
            {Number(quote.adjustment_amount) !== 0 && (
              <TotalRow
                label={quote.adjustment_label || "Adjustment"}
                value={formatCurrency(quote.adjustment_amount)}
              />
            )}
            <Divider sx={{ my: 1 }} />
            <TotalRow label="Total" value={formatCurrency(quote.total_amount)} bold />
          </Paper>
        </Box>

        <EntityActivityPanel entityType="quote" entityId={id} />
      </Box>
    </MainLayout>
  );
};

export default QuoteDetail;
