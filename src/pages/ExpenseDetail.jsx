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
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MainLayout from "../components/Layout/MainLayout";
import { getAuditLogs } from "../services/auditLogService";
import { getExpenseById } from "../services/expenseService";
import { createApiUrl } from "../config/api";

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const STATUS_COLORS = {
  Pending:  "warning",
  Paid:     "success",
  ARCHIVED: "secondary",
};

// ── Sub-component ──────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
    <Typography sx={{ fontSize: "0.8125rem", color: "#6b7280", minWidth: 160 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.8125rem", color: "#111827", fontWeight: 500 }}>
      {value || "—"}
    </Typography>
  </Box>
);

// ── Main component ─────────────────────────────────────────────────────────
const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receiptError, setReceiptError] = useState("");

  // Fetch expense
  const { data: expense, isLoading, isError } = useQuery({
    queryKey: ["expense-detail", id],
    queryFn: () => getExpenseById(id),
    enabled: Boolean(id),
  });

  // Fetch audit logs
  const { data: auditData } = useQuery({
    queryKey: ["expense-audit-logs", id],
    queryFn: () => getAuditLogs({ entity_type: "expense", entity_id: id, limit: 50 }),
    enabled: Boolean(id),
  });
  const auditLogs = auditData?.logs || [];

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 860, mx: "auto" }}>
          <Skeleton variant="text" width={220} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={140} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        </Box>
      </MainLayout>
    );
  }

  if (isError || !expense) {
    return (
      <MainLayout>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 860, mx: "auto" }}>
          <Alert severity="error">Failed to load expense. Please go back and try again.</Alert>
          <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => navigate("/expenses")}>
            Back to Expenses
          </Button>
        </Box>
      </MainLayout>
    );
  }

  const status = expense.status || expense.payment_status || "Pending";
  const isArchived = String(expense.lifecycle_status || "").toUpperCase() === "ARCHIVED";
  const receiptUrl = expense.receipt_url ? createApiUrl(expense.receipt_url) : null;
  const isImage = receiptUrl && !expense.receipt_url?.toLowerCase().endsWith(".pdf");

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 860, mx: "auto" }}>

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
              onClick={() => navigate("/expenses")}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Expenses
            </Button>
            <Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                {expense.vendor_name || "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#6b7280" }}>
                {formatDate(expense.date)} · {expense.category || "—"}
              </Typography>
            </Box>
            <Chip
              label={isArchived ? "Archived" : status}
              color={isArchived ? "secondary" : STATUS_COLORS[status] || "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "#ef4444" }}>
              {formatCurrency(expense.amount, expense.currency)}
            </Typography>
            {!isArchived && (
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/expenses/edit/${id}`)}
                sx={{ textTransform: "none" }}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>

        {receiptError && (
          <Alert severity="error" onClose={() => setReceiptError("")} sx={{ mb: 2 }}>
            {receiptError}
          </Alert>
        )}

        {/* ── Details ────────────────────────────────────────────────── */}
        <Paper
          variant="outlined"
          sx={{ p: 2.5, mb: 3, borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 3 }}
        >
          <Box sx={{ flex: "1 1 200px" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", mb: 1 }}>
              Expense Details
            </Typography>
            <InfoRow label="Vendor / Payee" value={expense.vendor_name} />
            <InfoRow label="Category" value={expense.category} />
            <InfoRow label="Date" value={formatDate(expense.date)} />
            <InfoRow label="Amount" value={formatCurrency(expense.amount, expense.currency)} />
            <InfoRow label="Currency" value={expense.currency || "INR"} />
          </Box>
          <Box sx={{ flex: "1 1 200px" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", mb: 1 }}>
              Payment & Billing
            </Typography>
            <InfoRow label="Payment Mode" value={expense.payment_mode} />
            <InfoRow label="Paid Through" value={expense.paid_through} />
            <InfoRow
              label="Billable"
              value={expense.billable ? "Yes" : "No"}
            />
            {expense.billable && expense.customer_name && (
              <InfoRow label="Customer" value={expense.customer_name} />
            )}
            {expense.notes && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", mb: 0.5 }}>
                  Notes
                </Typography>
                <Typography sx={{ fontSize: "0.84rem", color: "#374151", whiteSpace: "pre-wrap" }}>
                  {expense.notes}
                </Typography>
              </>
            )}
          </Box>
        </Paper>

        {/* ── Receipt ────────────────────────────────────────────────── */}
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", mb: 1.5 }}>
          Receipt
        </Typography>
        {receiptUrl ? (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            {isImage ? (
              <Box
                component="img"
                src={receiptUrl}
                alt="Receipt"
                onError={() => setReceiptError("Failed to load receipt image.")}
                sx={{ maxWidth: "100%", maxHeight: 400, borderRadius: 1, display: "block" }}
              />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PictureAsPdfIcon color="error" />
                <Typography sx={{ fontSize: "0.84rem", color: "#374151" }}>
                  PDF receipt attached
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none", ml: 1 }}
                >
                  Open PDF
                </Button>
              </Box>
            )}
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, textAlign: "center" }}>
            <Typography sx={{ color: "#9ca3af", fontSize: "0.84rem" }}>
              No receipt attached.
            </Typography>
          </Paper>
        )}

        {/* ── Activity Log ───────────────────────────────────────────── */}
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", mb: 1.5 }}>
          Activity Log
        </Typography>
        {auditLogs.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, textAlign: "center" }}>
            <Typography sx={{ color: "#9ca3af", fontSize: "0.84rem" }}>
              No activity recorded yet.
            </Typography>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            {auditLogs.map((log, idx) => (
              <Box
                key={log.id || idx}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  py: 1,
                  borderBottom: idx < auditLogs.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.82rem", color: "#111827" }}>
                    {log.description || log.action || "Action performed"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {log.changed_by || log.user_id || "—"} · {formatDate(log.timestamp || log.created_at)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </MainLayout>
  );
};

export default ExpenseDetail;
