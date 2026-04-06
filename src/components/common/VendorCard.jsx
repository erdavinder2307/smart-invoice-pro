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
import StatusBadge from "./StatusBadge";

/**
 * VendorCard — Mobile card view for a single vendor.
 *
 * Props:
 *   vendor   {object}  — vendor data
 *   onEdit   {fn}      — edit handler
 *   onDelete {fn}      — delete handler
 */
const VendorCard = ({ vendor, onEdit, onDelete }) => (
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
      {/* Row 1: vendor name + status */}
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
          {vendor.vendor_name || "Untitled Vendor"}
        </Typography>
        <StatusBadge status={vendor.status || "Active"} />
      </Box>

      {/* Row 2: email + phone */}
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
            {vendor.email || "—"}
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
            {vendor.phone || "—"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />

      {/* Row 3: payment terms + actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          {vendor.contact_person && (
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
                Contact
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
                {vendor.contact_person}
              </Typography>
            </Box>
          )}
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
              Terms
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
              {vendor.payment_terms || "Net 30"}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Edit vendor">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete vendor">
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

export default VendorCard;
