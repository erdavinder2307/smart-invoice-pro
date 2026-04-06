import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StatusBadge from "./StatusBadge";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

/**
 * PurchaseOrderCard — Mobile card view for a single purchase order.
 *
 * Props:
 *   po           {object}  — purchase order data
 *   vendorName   {string}  — resolved vendor name
 *   onEdit       {fn}      — edit handler
 *   onDelete     {fn}      — delete handler
 *   onActionMenu {fn}      — opens action menu (e, po)
 */
const PurchaseOrderCard = ({ po, vendorName, onEdit, onDelete, onActionMenu }) => (
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
      {/* Row 1: PO number + status */}
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
          {po.po_number || `PO-${po.id}`}
        </Typography>
        <StatusBadge status={po.status || "Draft"} />
      </Box>

      {/* Row 2: vendor + amount */}
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
            Amount
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a2e" }}>
            {formatCurrency(po.total_amount)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />

      {/* Row 3: dates + actions */}
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
              Order Date
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
              {po.order_date ? new Date(po.order_date).toLocaleDateString() : "—"}
            </Typography>
          </Box>
          {po.delivery_date && (
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
                Delivery
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
                {new Date(po.delivery_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Edit PO">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          {onActionMenu && (
            <Tooltip title="More actions">
              <IconButton
                size="small"
                onClick={onActionMenu}
                sx={{ color: "#6b7280", "&:hover": { bgcolor: "#f3f4f6" }, width: 34, height: 34 }}
              >
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete PO">
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
    </CardContent>
  </Card>
);

export default PurchaseOrderCard;
