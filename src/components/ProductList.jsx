import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  IconButton,
  InputLabel,
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
import RestoreIcon from "@mui/icons-material/Restore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import BulkActionBar from "./list/BulkActionBar";
import ArchiveDialog from "./common/ArchiveDialog";
import LifecycleArchiveDialog from "./common/LifecycleArchiveDialog";
import { createApiUrl } from "../config/api";
import { getProducts } from "../services/productService";
import {
  getAvailableQuantity,
  getStockMeta,
  getStatusSortRank,
  needsReplenishment,
  canRestock,
  isArchivedProduct,
} from "../utils/stockHelpers";

import { updateProductStock } from "../services/stockService";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useTableSorting from "../hooks/useTableSorting";
import { saveSearchHistory } from "../services/searchService";
import { invalidateSearchHistoryCache } from "./list/ListHeader";

const VIEW_OPTIONS = [
  { value: "All", labelKey: "productList.allItems" },
  { value: "Archived", label: "Archived" },
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
  { value: "purchase_rate_asc", label: "Cost Price: Low to High" },
  { value: "purchase_rate_desc", label: "Cost Price: High to Low" },
  { value: "status_asc", label: "Status: Critical to In Stock" },
  { value: "status_desc", label: "Status: In Stock to Critical" },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));



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
  const [restoreTargetId, setRestoreTargetId] = useState(null);
  const [confirmBulkArchiveOpen, setConfirmBulkArchiveOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [immediateSearchTerm, setImmediateSearchTerm] = useState("");
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
  const [stockDialogError, setStockDialogError] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [stockReasonCustom, setStockReasonCustom] = useState("");
  const [stockReferenceNumber, setStockReferenceNumber] = useState("");
  const [stockAdjustDate, setStockAdjustDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [bulkStockMode, setBulkStockMode] = useState("increment");
  const [singleStockMode, setSingleStockMode] = useState("increment");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const effectiveSearchTerm = immediateSearchTerm || debouncedSearch;
  const lastSavedQueryRef = useRef("");
  const listHeaderRef = useRef(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts({ ...params, lifecycle: "all" });
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
  }, [effectiveSearchTerm, viewFilter, categoryFilter, colSortBy, colSortOrder]);

  useEffect(() => {
    if (!immediateSearchTerm) return;
    if (immediateSearchTerm.trim().toLowerCase() === debouncedSearch.trim().toLowerCase()) {
      setImmediateSearchTerm("");
    }
  }, [debouncedSearch, immediateSearchTerm]);

  useEffect(() => {
    const query = debouncedSearch.trim();
    const normalized = query.toLowerCase();
    if (query.length < 2 || normalized === lastSavedQueryRef.current) return;

    lastSavedQueryRef.current = normalized;
    saveSearchHistory({
      page: "items",
      query,
      filters: {
        view: viewFilter,
        category: categoryFilter,
      },
    }).then(() => {
      invalidateSearchHistoryCache("items");
      // Reload history in ListHeader to show the newly saved search immediately
      listHeaderRef.current?.reloadHistory();
    }).catch(() => {});
  }, [categoryFilter, debouncedSearch, viewFilter]);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(products.map((product) => String(product.category || "").trim()).filter(Boolean))
    );
    return ["All Categories", ...values.sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = effectiveSearchTerm.trim().toLowerCase();

    const list = products.filter((product) => {
      const isArchived = isArchivedProduct(product);
      const matchesSearch =
        !term ||
        [product.name, product.category]
          .some((value) => String(value || "").toLowerCase().includes(term));

      const stockMeta = getStockMeta(product);
      const matchesView =
        viewFilter === "All"
          ? !isArchived
          : viewFilter === "Archived"
            ? isArchived
            : !isArchived && stockMeta.bucket === viewFilter;
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
      const costA = Number(a.purchase_rate || 0);
      const costB = Number(b.purchase_rate || 0);
      const statusA = getStatusSortRank(a);
      const statusB = getStatusSortRank(b);

      const dir = colSortOrder === "asc" ? 1 : -1;
      if (colSortBy === "name") return dir * nameA.localeCompare(nameB);
      if (colSortBy === "price") return dir * (rateA - rateB);
      if (colSortBy === "purchase_rate") return dir * (costA - costB);
      if (colSortBy === "status") {
        if (statusA !== statusB) return dir * (statusA - statusB);
        return nameA.localeCompare(nameB);
      }
      return dir * (stockA - stockB);
    });
  }, [categoryFilter, colSortBy, colSortOrder, effectiveSearchTerm, products, viewFilter]);

  const liveSearchResults = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (term.length < 1) return [];

    return products
      .filter((product) => [product.name, product.category, product.sku]
        .some((value) => String(value || "").toLowerCase().includes(term)))
      .slice(0, 7)
      .map((product) => ({
        id: product.id,
        value: product.name || "",
        label: product.name || "Unnamed Item",
        subtitle: product.category || product.sku || "Item",
      }));
  }, [products, searchTerm]);

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      await axios.post(createApiUrl(`/api/products/${product.id}/restock`), {});
      setError("");
      // Refresh products to show updated data
      fetchProducts();
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
    setStockReason("");
    setStockReasonCustom("");
    setStockReferenceNumber("");
    setStockAdjustDate(new Date().toISOString().split("T")[0]);
    setStockDialog({ open: true, mode, product });
  };

  const handleCloseStockDialog = () => {
    setStockDialog({ open: false, mode: "single", product: null });
    setStockDialogError("");
    setStockReason("");
    setStockReasonCustom("");
    setStockReferenceNumber("");
    setStockAdjustDate(new Date().toISOString().split("T")[0]);
  };

  const handleConfirmStockAdjustment = async () => {
    const quantity = Math.max(0, Number(stockDelta || 0));
    if (!quantity) return;
    setStockDialogError("");

    // Guard against negative stock on single-item decrement
    if (stockDialog.mode === "single" && singleStockMode === "decrement" && stockDialog.product) {
      const available = getAvailableQuantity(stockDialog.product);
      if (quantity > available) {
        setStockDialogError(`Insufficient stock. Available: ${available}`);
        return;
      }
    }
    setLoading(true);
    try {
      if (stockDialog.mode === "single" && stockDialog.product) {
        await updateProductStock({
          productId: stockDialog.product.id,
          quantity,
          operation: singleStockMode,
          source: stockReason === "Other" ? (stockReasonCustom || "Manual adjustment") : (stockReason || "Manual adjustment"),
          reason: stockReason === "Other" ? (stockReasonCustom || undefined) : (stockReason || undefined),
          referenceNumber: stockReferenceNumber || undefined,
          adjustmentDate: stockAdjustDate || undefined,
        });
      }

      if (stockDialog.mode === "bulk") {
        const selectedItems = products.filter((item) => selectedProducts.includes(item.id) && !isArchivedProduct(item));
        if (!selectedItems.length) {
          setError("Bulk stock update applies only to active items. Select at least one active item.");
          setLoading(false);
          return;
        }
        await Promise.all(
          selectedItems.map((item) =>
            updateProductStock({
              productId: item.id,
              quantity,
              operation: bulkStockMode,
              source: stockReason === "Other" ? (stockReasonCustom || "Bulk manual adjustment") : (stockReason || "Bulk manual adjustment"),
              reason: stockReason === "Other" ? (stockReasonCustom || undefined) : (stockReason || undefined),
              referenceNumber: stockReferenceNumber || undefined,
              adjustmentDate: stockAdjustDate || undefined,
            })
          )
        );
      }

      handleCloseStockDialog();
      setSelectedProducts([]);
      await fetchProducts();
    } catch (err) {
      setStockDialogError(err.response?.data?.error || "Failed to adjust stock.");
      setLoading(false);
    }
  };

  const allVisibleSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((product) => selectedProducts.includes(product.id));
  const someVisibleSelected = paginatedProducts.some((product) => selectedProducts.includes(product.id));

  const selectedItems = useMemo(
    () => products.filter((item) => selectedProducts.includes(item.id)),
    [products, selectedProducts]
  );
  const selectedActiveItems = useMemo(
    () => selectedItems.filter((item) => !isArchivedProduct(item)),
    [selectedItems]
  );
  const selectedArchivedCount = selectedItems.length - selectedActiveItems.length;
  const selectedNeedsReplenishmentCount = useMemo(
    () => selectedActiveItems.filter((item) => needsReplenishment(item)).length,
    [selectedActiveItems]
  );
  const selectedHealthyCount = Math.max(0, selectedActiveItems.length - selectedNeedsReplenishmentCount);

  const lowStockCount = filteredProducts.filter((product) => getStockMeta(product).bucket === "Low Stock").length;
  const criticalCount = filteredProducts.filter((product) => getStockMeta(product).bucket === "Critical").length;
  const negativeStockCount = filteredProducts.filter((product) => getAvailableQuantity(product) < 0).length;

  return (
    <ListPageLayout>
      <ListHeader
        ref={listHeaderRef}
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
        onHistorySelect={setImmediateSearchTerm}
        searchPage="items"
        liveResults={liveSearchResults}
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
                  const sortParts = String(event.target.value).split("_");
                  const nextSortOrder = sortParts.pop();
                  const nextSortBy = sortParts.join("_");
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
        items={
          viewFilter === "All"
            ? [
                { label: "Total", value: filteredProducts.length },
                {
                  label: "Critical",
                  value: criticalCount,
                  color: "error",
                  active: viewFilter === "Critical",
                  onClick: () => setViewFilter("Critical"),
                },
                {
                  label: "Low Stock",
                  value: lowStockCount,
                  color: "warning",
                  active: viewFilter === "Low Stock",
                  onClick: () => setViewFilter("Low Stock"),
                },
              ]
            : [
                {
                  label: "Showing",
                  value: `${filteredProducts.length} ${viewFilter}`,
                  active: true,
                },
                {
                  label: "View All",
                  value: products.length,
                  onClick: () => setViewFilter("All"),
                },
              ]
        }
      />

      {negativeStockCount > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {negativeStockCount} items have negative stock. Restock immediately.
        </Alert>
      )}

      <BulkActionBar
        selectedCount={selectedProducts.length}
        infoText={[
          `${selectedNeedsReplenishmentCount} need replenishment`,
          `${selectedHealthyCount} healthy`,
          selectedArchivedCount > 0 ? `${selectedArchivedCount} archived (skipped)` : null,
        ].filter(Boolean).join(" • ")}
        actions={[
          ...(viewFilter === "Archived"
            ? []
            : [{
                label: "Update Stock",
                color: "primary",
                onClick: () => handleOpenStockDialog("bulk"),
                disabled: selectedActiveItems.length === 0,
              }]),
          {
            label: viewFilter === "Archived" ? "Restore Selected" : "Archive Selected",
            color: viewFilter === "Archived" ? "success" : "warning",
            onClick: () => setConfirmBulkArchiveOpen(true),
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

      <Box className="tour-inventory-status">
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
          const isArchived = isArchivedProduct(product);
          const availableQty = getAvailableQuantity(product);
          const stockMeta = getStockMeta(product);
          return (
            <ItemCard
              product={product}
              availableQty={availableQty}
              stockMeta={isArchived ? { ...stockMeta, label: "Archived", chipColor: "default" } : stockMeta}
              onEdit={() => {
                if (!isArchived) {
                  navigate(`/products/edit/${product.id}`);
                }
              }}
              onDelete={() => (viewFilter === "Archived" ? setRestoreTargetId(product.id) : setConfirmDeleteId(product.id))}
              deleteLabel={viewFilter === "Archived" ? "Restore item" : "Archive item"}
              deleteColor={viewFilter === "Archived" ? "#059669" : "#ef4444"}
              deleteHoverBg={viewFilter === "Archived" ? "#ecfdf5" : "#fef2f2"}
              deleteIcon={viewFilter === "Archived" ? "restore" : "delete"}
              onAddStock={!isArchived ? () => handleOpenStockDialog("single", product) : undefined}
              onRestock={canRestock(product) ? () => handleRestock(product) : undefined}
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
              { label: "COST PRICE", width: "14%", align: "right", sortKey: "purchase_rate" },
              { label: "STOCK", width: "20%", sortKey: "stock" },
              { label: "STATUS", width: "14%", sortKey: "status" },
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
          const isArchived = isArchivedProduct(product);
          const availableQty = getAvailableQuantity(product);
          const stockMeta = getStockMeta(product);
          const purchaseRate = product.purchase_rate ?? 0;
          const rate = product.price ?? 0;

          return (
            <TableRow
              key={product.id}
              hover
              selected={isSelected}
              onClick={() => {
                if (!isArchived) {
                  navigate(`/products/edit/${product.id}`);
                }
              }}
              sx={{
                "& td": { borderBottomColor: "#edf0f3", py: 1.5 },
                "&:hover": { bgcolor: stockMeta.highlight ? "#fef2f2" : "#fafcff" },
                bgcolor: stockMeta.highlight ? "#fff8f8" : "transparent",
                cursor: isArchived ? "default" : "pointer",
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
                  component="a"
                  href={`/products/${product.id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/products/${product.id}`); }}
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
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
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
                  color={isArchived ? "default" : stockMeta.chipColor}
                  variant={isArchived || stockMeta.bucket === "In Stock" ? "outlined" : "filled"}
                  label={isArchived ? "Archived" : stockMeta.label}
                />
              </TableCell>
              <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.15 }}>
                  {!isArchived && (
                    <Tooltip title="Add stock">
                      <IconButton aria-label="Add stock" size="small" onClick={() => handleOpenStockDialog("single", product)} sx={{ color: "#0369a1" }}>
                        <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!isArchived && (
                    <Tooltip title="Edit item">
                      <IconButton aria-label="Edit item" size="small" onClick={() => navigate(`/products/edit/${product.id}`)} sx={{ color: "#5f87e7" }}>
                        <EditIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={viewFilter === "Archived" ? "Restore item" : "Archive item"}>
                    <IconButton
                      aria-label={viewFilter === "Archived" ? "Restore item" : "Archive item"}
                      size="small"
                      onClick={() => (viewFilter === "Archived" ? setRestoreTargetId(product.id) : setConfirmDeleteId(product.id))}
                      sx={{ color: viewFilter === "Archived" ? "#059669" : "#ef4444" }}
                    >
                      {viewFilter === "Archived" ? <RestoreIcon sx={{ fontSize: 17 }} /> : <DeleteIcon sx={{ fontSize: 17 }} />}
                    </IconButton>
                  </Tooltip>
                  {canRestock(product) && (
                    <Tooltip title="Order from vendor">
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
      </Box>

      <Dialog open={stockDialog.open} onClose={handleCloseStockDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>
            {stockDialog.mode === "bulk" ? "Bulk stock update" : "Adjust stock"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {stockDialogError && (
            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setStockDialogError("")}>
              {stockDialogError}
            </Alert>
          )}
          {stockDialog.mode === "bulk" ? (
            <Typography sx={{ mb: 1.5, fontSize: "0.875rem", color: "#6b7280" }}>
              Apply stock change to {selectedActiveItems.length} active selected items.
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

          <FormControl size="small" fullWidth sx={{ mt: 1.5 }}>
            <InputLabel>Reason (optional)</InputLabel>
            <Select
              label="Reason (optional)"
              value={stockReason}
              onChange={(e) => setStockReason(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value="Purchase Receipt">Purchase Receipt</MenuItem>
              <MenuItem value="Stock Count Correction">Stock Count Correction</MenuItem>
              <MenuItem value="Damaged Goods">Damaged Goods</MenuItem>
              <MenuItem value="Customer Return">Customer Return</MenuItem>
              <MenuItem value="Opening Balance">Opening Balance</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          {stockReason === "Other" && (
            <TextField
              label="Specify reason"
              value={stockReasonCustom}
              onChange={(e) => setStockReasonCustom(e.target.value)}
              fullWidth
              size="small"
              inputProps={{ maxLength: 200 }}
              sx={{ mt: 1.5 }}
            />
          )}
          <TextField
            label="Reference Number (optional)"
            value={stockReferenceNumber}
            onChange={(e) => setStockReferenceNumber(e.target.value)}
            fullWidth
            size="small"
            inputProps={{ maxLength: 100 }}
            sx={{ mt: 1.5 }}
          />
          <TextField
            label="Adjustment Date"
            type="date"
            value={stockAdjustDate}
            onChange={(e) => setStockAdjustDate(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 1.5 }}
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

      <ArchiveDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        entityType="product"
        entityId={confirmDeleteId}
        entityLabel="Item"
        onArchived={async () => {
          setSelectedProducts((prev) => prev.filter((productId) => productId !== confirmDeleteId));
          await fetchProducts();
        }}
      />

      <LifecycleArchiveDialog
        open={!!restoreTargetId}
        onClose={() => setRestoreTargetId(null)}
        mode="restore"
        entityType="product"
        entityId={restoreTargetId}
        entityLabel="Item"
        onConfirmed={async () => {
          setSelectedProducts((prev) => prev.filter((productId) => productId !== restoreTargetId));
          setRestoreTargetId(null);
          await fetchProducts();
        }}
      />

      <LifecycleArchiveDialog
        open={confirmBulkArchiveOpen}
        onClose={() => setConfirmBulkArchiveOpen(false)}
        mode={viewFilter === "Archived" ? "bulk-restore" : "bulk-archive"}
        entityType="product"
        entityIds={selectedProducts}
        entityLabel="Item"
        entityCount={selectedProducts.length}
        onConfirmed={async () => {
          setSelectedProducts([]);
          setConfirmBulkArchiveOpen(false);
          await fetchProducts();
        }}
      />
    </ListPageLayout>
  );
};

export default ProductList;
