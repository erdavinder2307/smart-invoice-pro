import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { Edit, Inventory, Refresh, Search, SwapVert, Tune } from "@mui/icons-material";
import EmptyState from "./common/EmptyState";
import { safeClick } from "../utils/safeClick";
import { getProductStockSummary } from "../services/productService";

// ── Status helpers ──────────────────────────────────────────────────────────
// ProductStockSummary receives condensed stock-summary records (id, name, sku,
// stock) without reorder_level. We therefore use fixed operational thresholds
// that mirror the canonical getStockMeta bucket boundaries as closely as
// possible, and map to the same canonical bucket keys so sort order is shared.

const getStockStatus = (stock) => {
  if (stock <= 0) return { key: "Critical",  color: "error",   label: "Out of Stock" };
  if (stock < 5)  return { key: "Critical",  color: "error",   label: "Critical" };
  if (stock < 10) return { key: "Low Stock", color: "warning", label: "Low Stock" };
  return               { key: "In Stock",  color: "success", label: "In Stock" };
};

const ROW_BG    = { Critical: "error.50",   "Low Stock": "warning.50", "In Stock": "inherit" };
const ROW_HOVER = { Critical: "error.100",  "Low Stock": "warning.100", "In Stock": "action.hover" };

// ── Component ─────────────────────────────────────────────────────────────────

const ProductStockSummary = () => {
  const navigate = useNavigate();

  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortField,    setSortField]    = useState("status");
  const [sortDir,      setSortDir]      = useState("asc");

  const fetchData = useCallback(() => {
    setLoading(true);
    setError("");
    getProductStockSummary()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to fetch inventory data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const enriched = useMemo(
    () => products.map((p) => {
      const stockStatus = getStockStatus(p.stock);
      return {
        ...p,
        stockStatus,
        replenishmentNeeded: stockStatus.key !== "In Stock",
      };
    }),
    [products]
  );

  const criticalCount = useMemo(
    () => enriched.filter((p) => p.stockStatus.key === "Critical").length,
    [enriched]
  );
  const lowCount = useMemo(
    () => enriched.filter((p) => p.stockStatus.key === "Low Stock").length,
    [enriched]
  );

  const filtered = useMemo(() => {
    let list = enriched;
    if (filterStatus !== "all") {
      list = list.filter((p) =>
        filterStatus === "critical"
          ? p.stockStatus.key === "Critical"
          : filterStatus === "low"
            ? p.stockStatus.key === "Low Stock"
            : filterStatus === "replenishment"
              ? p.replenishmentNeeded
            : filterStatus === "in-stock"
              ? p.stockStatus.key === "In Stock"
              : true
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => (p.name || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if      (sortField === "name")   cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortField === "stock")  cmp = (a.stock ?? 0) - (b.stock ?? 0);
      else if (sortField === "status") {
        // Use pre-computed stockStatus.key (canonical bucket) for sort rank
        const rankMap = { Critical: 0, "Low Stock": 1, "In Stock": 2, Archived: 3 };
        cmp = (rankMap[a.stockStatus.key] ?? 9) - (rankMap[b.stockStatus.key] ?? 9);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [enriched, filterStatus, searchQuery, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Inventory sx={{ color: "primary.main", fontSize: 24 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Stock Detail</Typography>
              <Typography variant="caption" color="text.secondary">Full inventory management view</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {criticalCount > 0 && (
              <Chip label={`${criticalCount} Critical`} size="small" color="error" variant="filled" sx={{ fontWeight: 700 }} />
            )}
            {lowCount > 0 && (
              <Chip label={`${lowCount} Low`} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={safeClick(fetchData)} aria-label="Refresh"
                sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Toolbar: search + filter tabs + sort */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <OutlinedInput
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            }
            inputProps={{ "aria-label": "Search products" }}
            sx={{ minWidth: 200, bgcolor: "background.paper", borderRadius: 2 }}
          />
          <ToggleButtonGroup
            size="small" exclusive value={filterStatus}
            onChange={(_, v) => v && setFilterStatus(v)}
            aria-label="Filter by stock status"
          >
            <ToggleButton value="all"      sx={{ textTransform: "none", px: 1.5 }}>All ({enriched.length})</ToggleButton>
            <ToggleButton value="critical" sx={{ textTransform: "none", px: 1.5 }}>Critical</ToggleButton>
            <ToggleButton value="low"      sx={{ textTransform: "none", px: 1.5 }}>Low</ToggleButton>
            <ToggleButton value="replenishment" sx={{ textTransform: "none", px: 1.5 }}>Replenishment Needed</ToggleButton>
            <ToggleButton value="in-stock" sx={{ textTransform: "none", px: 1.5 }}>In Stock</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Sort by stock level">
            <IconButton size="small" onClick={() => handleSort("stock")} aria-label="Sort by stock"
              sx={{ border: "1px solid", borderColor: sortField === "stock" ? "primary.main" : "divider",
                    color: sortField === "stock" ? "primary.main" : "text.secondary" }}>
              <SwapVert fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort by status">
            <IconButton size="small" onClick={() => handleSort("status")} aria-label="Sort by status"
              sx={{ border: "1px solid", borderColor: sortField === "status" ? "primary.main" : "divider",
                    color: sortField === "status" ? "primary.main" : "text.secondary" }}>
              <Tune fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50", borderBottom: "2px solid", borderColor: "divider", pl: 3 }}>
                <TableSortLabel active={sortField === "name"} direction={sortField === "name" ? sortDir : "asc"} onClick={() => handleSort("name")}>
                  Product
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderBottom: "2px solid", borderColor: "divider" }}>
                <TableSortLabel active={sortField === "stock"} direction={sortField === "stock" ? sortDir : "asc"} onClick={() => handleSort("stock")}>
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderBottom: "2px solid", borderColor: "divider" }}>
                <TableSortLabel active={sortField === "status"} direction={sortField === "status" ? sortDir : "asc"} onClick={() => handleSort("status")}>
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "grey.50", borderBottom: "2px solid", borderColor: "divider" }}>
                Replenishment
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "grey.50", borderBottom: "2px solid", borderColor: "divider", pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 5 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={28} />
                    <Typography color="text.secondary" variant="body2">Loading inventory data...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 3 }}>
                  <Alert severity="error" sx={{ maxWidth: 400, mx: "auto" }}
                    action={<Button size="small" onClick={safeClick(fetchData)}>Retry</Button>}>
                    {error}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 4 }}>
                  <EmptyState
                    icon={<Inventory />}
                    title={
                      searchQuery          ? "No products match your search"
                      : filterStatus !== "all"
                        ? `No ${filterStatus === "in-stock" ? "in stock" : filterStatus === "replenishment" ? "replenishment-needed" : filterStatus} items`
                      : "No products found"
                    }
                    subtitle={
                      searchQuery          ? "Try a different search term"
                      : filterStatus !== "all" ? "All products in this category are within normal levels"
                      : "Add products to see inventory data"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product, index) => {
                const { stockStatus } = product;
                return (
                  <TableRow
                    key={product.id || product.sku || index}
                    hover
                    sx={{
                      bgcolor: ROW_BG[stockStatus.key],
                      cursor: "pointer",
                      "&:hover": { bgcolor: ROW_HOVER[stockStatus.key] },
                    }}
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    data-testid={`stock-row-${product.id}`}
                  >
                    <TableCell sx={{ py: 1.5, pl: 3 }}>
                      <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.sku ? `SKU: ${product.sku}` : "No SKU"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      {product.stock < 0 ? (
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="error.main" display="block">Out of stock</Typography>
                          <Typography variant="caption" color="error.main">({Math.abs(product.stock)} units short)</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" fontWeight={700}
                          color={
                            stockStatus.key === "Critical" ? "error.main"
                            : stockStatus.key === "Low Stock" ? "warning.main"
                            : "text.primary"
                          }>
                          {product.stock.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                        variant={stockStatus.key === "In Stock" ? "outlined" : "filled"}
                        sx={{ fontWeight: 600, minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Chip
                        label={product.replenishmentNeeded ? "Needed" : "OK"}
                        color={product.replenishmentNeeded ? "warning" : "success"}
                        size="small"
                        variant={product.replenishmentNeeded ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, pr: 2 }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                        <Tooltip title="Edit product">
                          <IconButton size="small"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            aria-label={`Edit ${product.name}`}
                            sx={{ color: "text.secondary" }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adjust stock">
                          <IconButton size="small"
                            onClick={() => navigate(`/stock-adjustment?product_id=${product.id}`)}
                            aria-label={`Adjust stock for ${product.name}`}
                            sx={{ color: "text.secondary" }}>
                            <Tune fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      {!loading && !error && products.length > 0 && (
        <Box sx={{
          px: 3, py: 1.5,
          borderTop: "1px solid", borderColor: "divider",
          bgcolor: "grey.50",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filtered.length} of {products.length} products
          </Typography>
          <Button size="small" variant="outlined"
            onClick={() => navigate("/products")}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
            View All Products
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ProductStockSummary;
