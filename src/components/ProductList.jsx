import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveDataView from "./common/ResponsiveDataView";
import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import ItemCard from "./common/ItemCard";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import BulkActionBar from "./list/BulkActionBar";
import { createApiUrl } from "../config/api";
import { deleteProduct, getProducts } from "../services/productService";
import { updateProductStock } from "../services/stockService";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useTableSorting from "../hooks/useTableSorting";

const VIEW_OPTIONS = [
  { value: "All", labelKey: "productList.allItems" },
  { value: "Critical", label: "Critical" },
  { value: "Low Stock", labelKey: "productList.lowStock" },
  { value: "In Stock", labelKey: "productList.inStock" },
];

const SORT_OPTIONS = [
  { value: "stock_asc", label: "Stock: Low to High" },
  { value: "stock_desc", label: "Stock: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "price_asc", label: "Rate: Low to High" },
  { value: "price_desc", label: "Rate: High to Low" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getAvailableQuantity = (product) =>
  product.stock !== undefined && product.stock !== null && product.stock !== ""
    ? toFiniteNumber(product.stock)
    : toFiniteNumber(product.opening_stock) - toFiniteNumber(product.sold);

const getStockMeta = (product) => {
  const availableQty = getAvailableQuantity(product);
  const reorderLevel = toFiniteNumber(product.reorder_level, 10);

  if (availableQty <= 0) {
    return {
      bucket: "Critical",
      label: "Out of Stock",
      chipColor: "error",
      textColor: "#dc2626",
      highlight: true,
    };
  }

  if (availableQty <= reorderLevel) {
    return {
      bucket: "Low Stock",
      label: "Low Stock",
      chipColor: "warning",
      textColor: "#b45309",
      highlight: false,
    };
  }

  return {
    bucket: "In Stock",
    label: "In Stock",
    chipColor: "success",
    textColor: "#166534",
    highlight: false,
  };
};

const buildCsv = (items) => {
  const headers = ["Name", "Category", "Selling Price", "Cost Price", "Stock", "Status"];
  const lines = items.map((item) => {
    const stock = getAvailableQuantity(item);
    const status = getStockMeta(item).label;

    return [
      item.name || "",
      item.category || "",
      Number(item.price || 0),
      Number(item.purchase_rate || 0),
      stock,
      status,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...lines].join("\n");
};

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    const urlFilter = params.get("filter");
    const validOptions = VIEW_OPTIONS.map((o) => o.value);
    return urlFilter && validOptions.includes(urlFilter) ? urlFilter : "All";
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const { sortBy: colSortBy, sortOrder: colSortOrder, handleSort, setSort } = useTableSorting("name", "asc", "products");
  const [stockDialog, setStockDialog] = useState({ open: false, mode: "single", product: null });
  const [stockDelta, setStockDelta] = useState(1);
  const [bulkStockMode, setBulkStockMode] = useState("increment");
  const [singleStockMode, setSingleStockMode] = useState("increment");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts(params);
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
      setError(t("productList.failedFetch"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Pass sort params to backend only for name/price (not stock — stock is computed)
    const backendSortBy = colSortBy === "stock" ? null : colSortBy;
    fetchProducts(backendSortBy ? { sort_by: backendSortBy, sort_order: colSortOrder } : {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colSortBy, colSortOrder]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, viewFilter, categoryFilter, colSortBy, colSortOrder]);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(products.map((product) => String(product.category || "").trim()).filter(Boolean))
    );
    return ["All Categories", ...values.sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    const list = products.filter((product) => {
      const matchesSearch =
        !term ||
        [product.name, product.category]
          .some((value) => String(value || "").toLowerCase().includes(term));

      const stockMeta = getStockMeta(product);
      const matchesView = viewFilter === "All" || stockMeta.bucket === viewFilter;
      const matchesCategory =
        categoryFilter === "All Categories" || String(product.category || "").trim() === categoryFilter;

      return matchesSearch && matchesView && matchesCategory;
    });

    return [...list].sort((a, b) => {
      const stockA = getAvailableQuantity(a);
      const stockB = getAvailableQuantity(b);
      const nameA = String(a.name || "").toLowerCase();
      const nameB = String(b.name || "").toLowerCase();
      const rateA = Number(a.price || 0);
      const rateB = Number(b.price || 0);

      const dir = colSortOrder === "asc" ? 1 : -1;
      if (colSortBy === "name") return dir * nameA.localeCompare(nameB);
      if (colSortBy === "price") return dir * (rateA - rateB);
      return dir * (stockA - stockB);
    });
  }, [categoryFilter, colSortBy, colSortOrder, debouncedSearch, products, viewFilter]);

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      setConfirmDeleteId(null);
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
      await fetchProducts();
    } catch {
      setError(t("productList.failedDelete"));
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) return;
    setLoading(true);
    try {
      await Promise.all(selectedProducts.map((id) => deleteProduct(id)));
      setSelectedProducts([]);
      await fetchProducts();
    } catch {
      setError("Failed to delete selected items.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelected = () => {
    if (!selectedProducts.length) return;
    const selectedItems = filteredProducts.filter((item) => selectedProducts.includes(item.id));
    const csv = buildCsv(selectedItems);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestock = async (product) => {
    if (!product.preferred_vendor_id) {
      setError(`Cannot restock ${product.name}: no preferred vendor set.`);
      return;
    }

    setLoading(true);
    try {
      await axios.post(createApiUrl(`/api/products/${product.id}/restock`));
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create restock purchase order.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProducts(paginatedProducts.map((product) => product.id));
      return;
    }
    setSelectedProducts([]);
  };

  const handleSelectOne = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenStockDialog = (mode, product = null) => {
    setStockDelta(1);
    setBulkStockMode("increment");
    setSingleStockMode("increment");
    setStockDialog({ open: true, mode, product });
  };

  const handleCloseStockDialog = () => {
    setStockDialog({ open: false, mode: "single", product: null });
  };

  const handleConfirmStockAdjustment = async () => {
    const quantity = Math.max(0, Number(stockDelta || 0));
    if (!quantity) return;

    setLoading(true);
    try {
      if (stockDialog.mode === "single" && stockDialog.product) {
        await updateProductStock({
          productId: stockDialog.product.id,
          quantity,
          operation: singleStockMode,
          source: "Manual adjustment",
        });
      }

      if (stockDialog.mode === "bulk") {
        const selectedItems = products.filter((item) => selectedProducts.includes(item.id));
        await Promise.all(
          selectedItems.map((item) =>
            updateProductStock({
              productId: item.id,
              quantity,
              operation: bulkStockMode,
              source: "Bulk manual adjustment",
            })
          )
        );
      }

      handleCloseStockDialog();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to adjust stock.");
      setLoading(false);
    }
  };

  const allVisibleSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((product) => selectedProducts.includes(product.id));
  const someVisibleSelected = paginatedProducts.some((product) => selectedProducts.includes(product.id));

  const lowStockCount = filteredProducts.filter((product) => getStockMeta(product).bucket === "Low Stock").length;
  const criticalCount = filteredProducts.filter((product) => getStockMeta(product).bucket === "Critical").length;
  const negativeStockCount = filteredProducts.filter((product) => getAvailableQuantity(product) < 0).length;

  return (
    <ListPageLayout>
      <ListHeader
        title={t("productList.title")}
        summary={`${filteredProducts.length} items`}
        rightAction={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/products/add")}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            {t("productList.new")}
          </Button>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t("productList.searchPlaceholder")}
      />

      <FilterBar
        statusValue={viewFilter}
        onStatusChange={(value) => setViewFilter(value)}
        statusOptions={VIEW_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label || t(option.labelKey),
        }))}
        rightSlot={
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                inputProps={{ "aria-label": "Category filter" }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <Select
                value={`${colSortBy || "stock"}_${colSortOrder || "asc"}`}
                onChange={(event) => {
                  const [nextSortBy, nextSortOrder] = String(event.target.value).split("_");
                  setSort(nextSortBy || "stock", nextSortOrder || "asc");
                }}
                inputProps={{ "aria-label": "Sort inventory" }}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        }
      />

      <ListSummary
        items={[
          { label: "Total", value: filteredProducts.length },
          { label: "Critical", value: criticalCount, color: "error" },
          { label: "Low Stock", value: lowStockCount, color: "warning" },
        ]}
      />

      {negativeStockCount > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {negativeStockCount} items have negative stock. Restock immediately.
        </Alert>
      )}

      <BulkActionBar
        selectedCount={selectedProducts.length}
        actions={[
          {
            label: "Update Stock",
            color: "primary",
            onClick: () => handleOpenStockDialog("bulk"),
            disabled: selectedProducts.length === 0,
          },
          {
            label: "Delete Selected",
            color: "error",
            onClick: handleBulkDelete,
            disabled: selectedProducts.length === 0,
          },
          {
            label: "Export",
            color: "secondary",
            onClick: handleExportSelected,
            disabled: selectedProducts.length === 0,
          },
        ]}
      />

      <ResponsiveDataView
        isMobile={isMobile}
        columns={[
          { key: "checkbox", label: "", width: CHECKBOX_COLUMN_WIDTH },
          { key: "name", label: "NAME", width: "28%" },
          { key: "rate", label: "SELLING PRICE", align: "right", width: "14%" },
          { key: "purchase_rate", label: "COST PRICE", align: "right", width: "14%" },
          { key: "stock", label: "STOCK", width: "20%" },
          { key: "status", label: "STATUS", width: "14%" },
          { key: "actions", label: "", align: "center", width: "10%" },
        ]}
        rows={paginatedProducts}
        renderCard={(product) => {
          const availableQty = getAvailableQuantity(product);
          const stockMeta = getStockMeta(product);
          return (
            <ItemCard
              product={product}
              availableQty={availableQty}
              stockMeta={stockMeta}
              onEdit={() => navigate(`/products/edit/${product.id}`)}
              onDelete={() => setConfirmDeleteId(product.id)}
              onAddStock={() => handleOpenStockDialog("single", product)}
              onRestock={product.preferred_vendor_id ? () => handleRestock(product) : undefined}
            />
          );
        }}
        loading={loading}
        emptyTitle={searchTerm ? t("productList.noItemsSearch") : t("productList.noItems")}
        toolbar={
          <>
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" onClose={() => setError("")} sx={{ m: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}
          </>
        }
        renderHeader={() => (
          <TableRow sx={{ bgcolor: "#fafbfc" }}>
            <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px", borderBottomColor: "#edf0f3" }}>
              <Checkbox
                indeterminate={someVisibleSelected && !allVisibleSelected}
                checked={allVisibleSelected}
                onChange={handleSelectAll}
                inputProps={{ "aria-label": "Select all products" }}
                sx={{ color: "#b6bdc7" }}
              />
            </TableCell>
            {[
              { label: "NAME", width: "28%", sortKey: "name" },
              { label: "SELLING PRICE", width: "14%", align: "right", sortKey: "price" },
              { label: "COST PRICE", width: "14%", align: "right" },
              { label: "STOCK", width: "20%", sortKey: "stock" },
              { label: "STATUS", width: "14%" },
              { label: "", width: "10%", align: "center" },
            ].map((column, index) => (
              <TableCell
                key={`${column.label}-${index}`}
                align={column.align || "left"}
                sx={{
                  width: column.width,
                  maxWidth: column.width,
                  borderBottomColor: "#edf0f3",
                  py: 1.2,
                  color: colSortBy === column.sortKey ? "primary.main" : "#8b95a7",
                  fontSize: "0.68rem",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  ...(column.sortKey ? {
                    cursor: "pointer",
                    userSelect: "none",
                    bgcolor: colSortBy === column.sortKey ? "action.selected" : undefined,
                    "&:hover": { bgcolor: "action.hover" },
                  } : {}),
                }}
              >
                {column.sortKey ? (
                  <TableSortLabel
                    active={colSortBy === column.sortKey}
                    direction={colSortBy === column.sortKey ? colSortOrder : "asc"}
                    onClick={() => handleSort(column.sortKey)}
                    hideSortIcon={colSortBy !== column.sortKey}
                    sx={{ fontSize: "inherit", letterSpacing: "inherit", fontWeight: "inherit", color: "inherit" }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : column.label}
              </TableCell>
            ))}
          </TableRow>
        )}
        renderRow={(product) => {
          const isSelected = selectedProducts.includes(product.id);
          const availableQty = getAvailableQuantity(product);
          const stockMeta = getStockMeta(product);
          const purchaseRate = product.purchase_rate ?? 0;
          const rate = product.price ?? 0;

          return (
            <TableRow
              key={product.id}
              hover
              selected={isSelected}
              onClick={() => navigate(`/products/edit/${product.id}`)}
              sx={{
                "& td": { borderBottomColor: "#edf0f3", py: 1.5 },
                "&:hover": { bgcolor: stockMeta.highlight ? "#fef2f2" : "#fafcff" },
                bgcolor: stockMeta.highlight ? "#fff8f8" : "transparent",
                cursor: "pointer",
              }}
            >
              <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleSelectOne(product.id)}
                  inputProps={{ "aria-label": `Select ${product.name || "product"}` }}
                  sx={{ color: "#b6bdc7" }}
                />
              </TableCell>
              <TableCell>
                <Typography
                  title={product.name || "Untitled Item"}
                  sx={{
                    display: "block",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.825rem",
                    fontWeight: 600,
                    color: "#2563eb",
                  }}
                >
                  {product.name || "Untitled Item"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {product.category || "Uncategorized"}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: "0.8125rem", color: "#2b3340" }}>{formatCurrency(rate)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: "0.8125rem", color: "#2b3340" }}>{formatCurrency(purchaseRate)}</Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ fontSize: "0.825rem", fontWeight: 600, color: stockMeta.textColor }}>
                    {availableQty}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>{stockMeta.label}</Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={stockMeta.chipColor}
                  variant={stockMeta.bucket === "In Stock" ? "outlined" : "filled"}
                  label={stockMeta.label}
                />
              </TableCell>
              <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.15 }}>
                  <Tooltip title="Add stock">
                    <IconButton aria-label="Add stock" size="small" onClick={() => handleOpenStockDialog("single", product)} sx={{ color: "#0369a1" }}>
                      <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit item">
                    <IconButton aria-label="Edit item" size="small" onClick={() => navigate(`/products/edit/${product.id}`)} sx={{ color: "#5f87e7" }}>
                      <EditIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete item">
                    <IconButton aria-label="Delete item" size="small" onClick={() => setConfirmDeleteId(product.id)} sx={{ color: "#ef4444" }}>
                      <DeleteIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                  {product.preferred_vendor_id && (
                    <Tooltip title="Restock item">
                      <IconButton aria-label="Restock item" size="small" onClick={() => handleRestock(product)} sx={{ color: "#16a34a" }}>
                        <ShoppingCartIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
        pagination={{
          rowsPerPageOptions: [10, 25, 50],
          count: filteredProducts.length,
          rowsPerPage,
          page,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleChangeRowsPerPage,
        }}
      />

      <Dialog open={stockDialog.open} onClose={handleCloseStockDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>
            {stockDialog.mode === "bulk" ? "Bulk stock update" : "Adjust stock"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {stockDialog.mode === "bulk" ? (
            <Typography sx={{ mb: 1.5, fontSize: "0.875rem", color: "#6b7280" }}>
              Apply stock change to {selectedProducts.length} selected items.
            </Typography>
          ) : (
            <Typography sx={{ mb: 1.5, fontSize: "0.875rem", color: "#6b7280" }}>
              {stockDialog.product?.name || "Item"} current stock: {stockDialog.product ? getAvailableQuantity(stockDialog.product) : 0}
            </Typography>
          )}

          {(stockDialog.mode === "bulk" || stockDialog.mode === "single") && (
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <Select
                value={stockDialog.mode === "bulk" ? bulkStockMode : singleStockMode}
                onChange={(event) => {
                  if (stockDialog.mode === "bulk") {
                    setBulkStockMode(event.target.value);
                  } else {
                    setSingleStockMode(event.target.value);
                  }
                }}
                inputProps={{ "aria-label": stockDialog.mode === "bulk" ? "Bulk stock mode" : "Stock mode" }}
              >
                <MenuItem value="increment">Increase stock</MenuItem>
                <MenuItem value="decrement">Decrease stock</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            type="number"
            value={stockDelta}
            onChange={(event) => setStockDelta(Math.max(0, Number(event.target.value || 0)))}
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 1 }}
            label="Quantity"
          />

          {stockDialog.mode === "single" && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RemoveCircleOutlineIcon />}
                onClick={() => {
                  setSingleStockMode("decrement");
                  setStockDelta((prev) => Number(prev || 0) + 1);
                }}
                sx={{ textTransform: "none" }}
              >
                Decrease
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => {
                  setSingleStockMode("increment");
                  setStockDelta((prev) => Number(prev || 0) + 1);
                }}
                sx={{ textTransform: "none" }}
              >
                Increase
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button onClick={handleCloseStockDialog} variant="outlined" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStockAdjustment}
            variant="contained"
            disabled={loading || Number(stockDelta || 0) <= 0}
            sx={{ textTransform: "none" }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.25 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>
            Delete item?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>
            This item will be removed permanently. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmDeleteId(null)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 2.25,
              borderColor: "#d1d5db",
              color: "#4b5563",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(confirmDeleteId)}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 2.25,
              boxShadow: "none",
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </ListPageLayout>
  );
};

export default ProductList;
