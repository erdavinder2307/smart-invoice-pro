import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PaymentsIcon from "@mui/icons-material/Payments";
import RestoreIcon from "@mui/icons-material/Restore";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

/**
 * CustomerCard — Mobile card view for a single customer.
 *
 * Props:
 *   customer  {object}  — normalized customer data
 *   onClick   {fn}      — handler when name is tapped (navigate to detail)
 *   onEdit           {fn}  — edit action handler
 *   onDelete         {fn}  — delete action handler
 *   onCreateInvoice  {fn}  — create invoice action handler
 *   onRecordPayment  {fn}  — record payment action handler
 */
const CustomerCard = ({
  customer,
  onClick,
  onEdit,
  onDelete,
  onCreateInvoice,
  onRecordPayment,
  deleteLabel = "Delete customer",
  deleteColor = "#ef4444",
  deleteHoverBg = "#fef2f2",
  deleteIcon = "delete",
}) => (
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
      bgcolor: customer.overdueAmount > 0 ? "#fff7f7" : customer.receivables > 0 ? "#fffaf0" : "#ffffff",
    }}
  >
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.25 }}>
        <Typography
          onClick={onClick}
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
          {customer.name || "Untitled Customer"}
        </Typography>
        <Stack spacing={0.5} alignItems="flex-end">
          <Chip
            label={customer.activityStatus || customer.status || "Active"}
            size="small"
            color={(customer.activityStatus || customer.status) === "Inactive" ? "default" : "success"}
            variant="outlined"
            sx={{ fontSize: "0.7rem", fontWeight: 600, flexShrink: 0, height: 22 }}
          />
          {customer.health?.label ? (
            <Chip
              label={customer.health.label}
              size="small"
              color={customer.health.color || "default"}
              sx={{ fontSize: "0.7rem", fontWeight: 600, flexShrink: 0, height: 22 }}
            />
          ) : null}
        </Stack>
      </Box>

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
            Email
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
            {customer.email || "—"}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0 }}>
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
            Phone
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "#1a1a2e" }}>
            {customer.phone || "—"}
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
        <Chip
          size="small"
          variant="outlined"
          label={`Revenue ${formatCurrency(customer.totalRevenue)}`}
          color="primary"
        />
        <Chip
          size="small"
          variant="outlined"
          label={`Outstanding ${formatCurrency(customer.receivables)}`}
          color={customer.receivables > 0 ? "warning" : "default"}
        />
        {customer.overdueAmount > 0 ? (
          <Chip
            size="small"
            label={`Overdue ${formatCurrency(customer.overdueAmount)}`}
            color="error"
            sx={{ fontWeight: 600 }}
          />
        ) : null}
      </Stack>

      <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 1.5 }}>
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
              Receivables
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: customer.receivables > 0 ? "#111827" : "#6b7280",
              }}
            >
              {formatCurrency(customer.receivables)}
            </Typography>
          </Box>
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
              Last Transaction
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>
              {customer.lastTransactionDate ? new Date(customer.lastTransactionDate).toLocaleDateString("en-IN") : "—"}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          {onCreateInvoice ? (
            <Tooltip title="Create invoice">
              <IconButton
                size="small"
                onClick={onCreateInvoice}
                sx={{ color: "#2563eb", "&:hover": { bgcolor: "#eff6ff" }, width: 34, height: 34 }}
              >
                <NoteAddIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : null}
          {onRecordPayment ? (
            <Tooltip title="Record payment">
              <IconButton
                size="small"
                onClick={onRecordPayment}
                sx={{ color: "#059669", "&:hover": { bgcolor: "#ecfdf5" }, width: 34, height: 34 }}
              >
                <PaymentsIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="Edit customer">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={deleteLabel}>
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ color: deleteColor, "&:hover": { bgcolor: deleteHoverBg }, width: 34, height: 34 }}
            >
              {deleteIcon === "restore" ? <RestoreIcon sx={{ fontSize: 18 }} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {(onCreateInvoice || onRecordPayment) && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {onCreateInvoice ? (
            <Button size="small" variant="outlined" startIcon={<NoteAddIcon />} onClick={onCreateInvoice} sx={{ textTransform: "none", borderRadius: 2 }}>
              Create Invoice
            </Button>
          ) : null}
          {onRecordPayment ? (
            <Button size="small" variant="contained" startIcon={<PaymentsIcon />} onClick={onRecordPayment} sx={{ textTransform: "none", borderRadius: 2, boxShadow: "none" }}>
              Record Payment
            </Button>
          ) : null}
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default CustomerCard;
