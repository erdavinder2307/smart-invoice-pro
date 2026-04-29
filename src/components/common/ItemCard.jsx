import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

/**
 * ItemCard — Mobile card view for a single product/item.
 *
 * Props:
 *   product      {object}  — product data object
 *   availableQty {number}  — computed available stock quantity
 *   stockMeta    {object}  — stock display metadata
 *   onEdit       {fn}      — edit action handler
 *   onDelete     {fn}      — delete action handler
 *   onAddStock   {fn}      — stock adjustment action
 *   onRestock    {fn|null} — restock action handler (omit if no preferred vendor)
 */
const ItemCard = ({ product, availableQty, stockMeta, onEdit, onDelete, onAddStock, onRestock }) => {
  const stockChipColor = stockMeta?.chipColor || "default";
  const stockTextColor = stockMeta?.textColor || "#2b3340";

  return (
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
        {/* Row 1: name + stock badge */}
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
            {product.name || "Untitled Item"}
          </Typography>
          <Chip
            label={stockMeta?.label || "In Stock"}
            size="small"
            color={stockChipColor}
            variant="outlined"
            sx={{ fontSize: "0.7rem", fontWeight: 600, flexShrink: 0, height: 22 }}
          />
        </Box>

        {/* Row 2: rate + stock qty */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
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
              Sale Rate
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a2e" }}>
              {formatCurrency(product.price ?? 0)}
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
              Stock
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: stockTextColor }}>
              {availableQty} ({stockMeta?.label || "In Stock"})
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />

        {/* Row 3: secondary info + action buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Stack direction="row" spacing={2}>
            {product.category && (
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
                  Category
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
                  {product.category}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Add stock">
              <IconButton
                size="small"
                onClick={onAddStock}
                sx={{
                  color: "#0369a1",
                  "&:hover": { bgcolor: "#eff6ff" },
                  width: 34,
                  height: 34,
                }}
              >
                <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit item">
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  color: "#5f87e7",
                  "&:hover": { bgcolor: "#eff4ff" },
                  width: 34,
                  height: 34,
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {onRestock && (
              <Tooltip title="Restock item">
                <IconButton
                  size="small"
                  onClick={onRestock}
                  sx={{
                    color: "#16a34a",
                    "&:hover": { bgcolor: "#f0fdf4" },
                    width: 34,
                    height: 34,
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete item">
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: "#ef4444",
                  "&:hover": { bgcolor: "#fef2f2" },
                  width: 34,
                  height: 34,
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
