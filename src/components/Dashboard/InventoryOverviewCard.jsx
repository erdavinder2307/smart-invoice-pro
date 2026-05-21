import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { Inventory, OpenInNew, Warning } from "@mui/icons-material";
import SectionPaper from "../common/SectionPaper";
import { safeClick } from "../../utils/safeClick";

/**
 * InventoryOverviewCard — Summary panel (right column next to Revenue chart)
 *
 * Shows: critical count, low count, total products + top-3 critical items
 * NOT a duplicate of the full Stock Detail table below
 *
 * Props:
 *   lowStock       Array<{product_id, name, stock, reorder_level}>
 *   totalProducts  number
 *   loading        boolean
 *   error          string
 *   onViewInventory   () => void  → /products
 *   onViewCritical    () => void  → /products?filter=Critical
 *   onItemClick       (item) => void  → /products/edit/:id
 */
const InventoryOverviewCard = ({
  lowStock = [],
  totalProducts = 0,
  loading = false,
  error = "",
  onViewInventory,
  onViewCritical,
  onItemClick,
  sx = {},
}) => {
  // Align with canonical stock buckets: Critical is <= 0, Low Stock is > 0 within lowStock feed
  const criticalItems = lowStock.filter((i) => i.stock <= 0);
  const lowItems = lowStock.filter((i) => i.stock > 0);
  const top3Critical = criticalItems.slice(0, 3);

  const formatStock = (stock) => {
    if (stock < 0) return `Out of stock (${Math.abs(stock)} units short)`;
    if (stock === 0) return "Out of stock";
    return `${stock} in stock`;
  };

  return (
    <SectionPaper
      title="Inventory Overview"
      subtitle="Stock alerts requiring action"
      action={
        <Chip
          label="View All"
          size="small"
          variant="outlined"
          icon={<OpenInNew sx={{ fontSize: "0.85rem !important" }} />}
          onClick={onViewInventory ? safeClick(onViewInventory) : undefined}
          sx={{
            borderColor: "divider",
            cursor: onViewInventory ? "pointer" : "default",
            fontSize: "0.75rem",
          }}
        />
      }
      sx={{ height: "100%", ...sx }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* Summary stats row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: criticalItems.length > 0 ? "error.50" : "grey.50",
                border: "1px solid",
                borderColor: criticalItems.length > 0 ? "error.200" : "divider",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color={criticalItems.length > 0 ? "error.main" : "text.secondary"}
                lineHeight={1}
              >
                {criticalItems.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Critical
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: lowItems.length > 0 ? "warning.50" : "grey.50",
                border: "1px solid",
                borderColor: lowItems.length > 0 ? "warning.200" : "divider",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color={lowItems.length > 0 ? "warning.main" : "text.secondary"}
                lineHeight={1}
              >
                {lowItems.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Low Stock
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1}>
                {totalProducts}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Products
              </Typography>
            </Box>
          </Box>

          {/* Top 3 critical items OR healthy state */}
          {lowStock.length === 0 ? (
            <Box
              sx={{
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Inventory sx={{ fontSize: 36, color: "success.light" }} />
              <Typography variant="body2" color="text.secondary" align="center">
                All products are well stocked
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={onViewInventory ? safeClick(onViewInventory) : undefined}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                View Inventory
              </Button>
            </Box>
          ) : (
            <>
              {top3Critical.length > 0 && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                    <Warning sx={{ fontSize: 14, color: "error.main" }} />
                    <Typography variant="caption" fontWeight={700} color="error.main">
                      CRITICAL — Immediate attention needed
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {top3Critical.map((item, idx) => (
                      <React.Fragment key={item.product_id || idx}>
                        <Box
                          sx={{
                            py: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: onItemClick ? "pointer" : "default",
                            borderRadius: 1,
                            px: 0.5,
                            "&:hover": onItemClick
                              ? { bgcolor: "error.50" }
                              : {},
                          }}
                          onClick={onItemClick ? safeClick(() => onItemClick(item)) : undefined}
                          role={onItemClick ? "button" : undefined}
                          aria-label={onItemClick ? `View ${item.name}` : undefined}
                          tabIndex={onItemClick ? 0 : undefined}
                        >
                          <Box sx={{ minWidth: 0, mr: 1 }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                              color="text.primary"
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="error.main">
                              {formatStock(item.stock)} · reorder at {item.reorder_level ?? '—'}
                            </Typography>
                          </Box>
                          <Chip
                            label="Critical"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 600, flexShrink: 0 }}
                          />
                        </Box>
                        {idx < top3Critical.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Box>
                </>
              )}

              {/* Action buttons */}
              <Stack direction="row" spacing={1} sx={{ mt: "auto", pt: 1 }}>
                {criticalItems.length > 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={onViewCritical ? safeClick(onViewCritical) : undefined}
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, flex: 1 }}
                  >
                    View Critical ({criticalItems.length})
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onViewInventory ? safeClick(onViewInventory) : undefined}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, flex: 1 }}
                >
                  View Inventory
                </Button>
              </Stack>
            </>
          )}
        </>
      )}
    </SectionPaper>
  );
};

export default InventoryOverviewCard;
