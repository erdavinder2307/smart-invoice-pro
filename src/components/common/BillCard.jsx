import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StatusBadge from "./StatusBadge";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

/**
 * BillCard — Mobile card view for a single vendor bill.
 *
 * Props:
 *   bill       {object}  — bill data
 *   vendorName {string}  — resolved vendor name
 *   onView     {fn}      — view handler
 *   onEdit     {fn}      — edit handler
 *   onDelete   {fn}      — delete handler (disabled when paid)
 *   onMarkPaid {fn}      — mark paid handler (disabled when no balance)
 */
const BillCard = ({ bill, vendorName, onView, onEdit, onDelete, onMarkPaid }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid #edf0f3",
      borderRadius: 2,
      transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      "&:hover": {
        borderColor: "#c7d2e8",
        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
      },
    }}
  >
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      {/* Row 1: bill number + payment status */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.25 }}>
        <Typography
          onClick={onEdit}
          sx={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#2563eb",
            cursor: "pointer",
            flex: 1,
            mr: 1,
            lineHeight: 1.3,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {bill.bill_number || `BILL-${bill.id}`}
        </Typography>
        <StatusBadge status={bill.payment_status || "Unpaid"} />
      </Box>

      {/* Row 2: vendor + total amount */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "#8b95a7",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 0.25,
            }}
          >
            Vendor
          </Typography>
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#1a1a2e",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {vendorName || "—"}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "#8b95a7",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 0.25,
            }}
          >
            Total
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a2e" }}>
            {formatCurrency(bill.total_amount)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />

      {/* Row 3: balance due + dates + actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#9aa0a6",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Balance Due
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: bill.balance_due > 0 ? "#dc2626" : "#16a34a",
              }}
            >
              {formatCurrency(bill.balance_due)}
            </Typography>
          </Box>
          {bill.due_date && (
            <Box>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "#9aa0a6",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Due Date
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
                {new Date(bill.due_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: "flex", gap: 0.25, flexShrink: 0 }}>
          <Tooltip title="View bill">
            <IconButton
              size="small"
              onClick={onView}
              sx={{ color: "#334155", "&:hover": { bgcolor: "#f8fafc" }, width: 34, height: 34 }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit bill">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete bill">
            <span>
              <IconButton
                size="small"
                onClick={onDelete}
                disabled={String(bill.payment_status || "").toLowerCase() === "paid"}
                sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" }, width: 34, height: 34 }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mt: 1.25 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<DoneAllIcon fontSize="small" />}
          onClick={onMarkPaid}
          disabled={Number(bill.balance_due || 0) <= 0}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Mark as Paid
        </Button>
      </Box>
    </CardContent>
  </Card>
);

export default BillCard;
