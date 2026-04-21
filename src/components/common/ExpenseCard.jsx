import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

/**
 * ExpenseCard — Mobile card view for a single expense.
 *
 * Props:
 *   expense  {object}  — expense data
 *   onEdit   {fn}      — edit handler
 *   onDelete {fn}      — delete handler
 */
const ExpenseCard = ({ expense, onEdit, onDelete }) => (
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
      {/* Row 1: vendor name + category chip */}
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
          {expense.vendor_name || "Unknown Vendor"}
        </Typography>
        {expense.category && (
          <Chip
            label={expense.category}
            size="small"
            icon={<CategoryIcon />}
            sx={{ fontSize: "0.7rem", fontWeight: 600, flexShrink: 0, height: 22, borderRadius: 1.5 }}
          />
        )}
      </Box>

      {/* Row 2: amount + date */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
        <Box>
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
            Amount
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#dc2626" }}>
            {formatCurrency(expense.amount)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
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
            Date
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "#1a1a2e" }}>
            {expense.date ? new Date(expense.date).toLocaleDateString() : "—"}
          </Typography>
        </Box>
      </Box>

      {expense.notes && (
        <>
          <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Typography
              sx={{
                fontSize: "0.78rem",
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                mr: 1,
              }}
            >
              {expense.notes}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
              <Tooltip title="Edit expense">
                <IconButton
                  size="small"
                  onClick={onEdit}
                  sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete expense">
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" }, width: 34, height: 34 }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}

      {!expense.notes && (
        <>
          <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Edit expense">
                <IconButton
                  size="small"
                  onClick={onEdit}
                  sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete expense">
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" }, width: 34, height: 34 }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}
    </CardContent>
  </Card>
);

export default ExpenseCard;
