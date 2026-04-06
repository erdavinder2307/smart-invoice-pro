import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TableCell,
  TableRow,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MainLayout from "./Layout/MainLayout";
import { createApiUrl } from "../config/api";
import { deleteProduct, getProducts } from "../services/productService";

const VIEW_OPTIONS = [
  { value: "All", label: "All Items" },
  { value: "In Stock", label: "In Stock Items" },
  { value: "Low Stock", label: "Low Stock Items" },
  { value: "Out of Stock", label: "Out of Stock Items" },
];

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(amount || 0));

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getAvailableQuantity = (product) => (
  product.stock !== undefined && product.stock !== null && product.stock !== ""
    ? toFiniteNumber(product.stock)
    : toFiniteNumber(product.opening_stock) - toFiniteNumber(product.sold)
);

const getStockBucket = (product) => {
  const availableQty = getAvailableQuantity(product);
  const reorderLevel = toFiniteNumber(product.reorder_level, 10);

  if (availableQty <= 0) return "Out of Stock";
  if (availableQty <= reorderLevel) return "Low Stock";
  return "In Stock";
};

const ProductList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
      setError("Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, viewFilter]);

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [
      product.name,
      product.description,
      product.category,
      product.hsn_sac,
      product.unit,
    ].some((value) => String(value || "").toLowerCase().includes(term));

    const stockBucket = getStockBucket(product);
    const matchesView = viewFilter === "All" || stockBucket === viewFilter;

    return matchesSearch && matchesView;
  });

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      setConfirmDeleteId(null);
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
      await fetchProducts();
    } catch {
      setError("Failed to delete item.");
      setLoading(false);
    }
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
    setSelectedProducts((prev) => (
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    ));
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allVisibleSelected = paginatedProducts.length > 0
    && paginatedProducts.every((product) => selectedProducts.includes(product.id));
  const someVisibleSelected = paginatedProducts.some((product) => selectedProducts.includes(product.id));

  return (
    <MainLayout>
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
          bgcolor: "#f7f8fb",
          minHeight: "100%",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
              mb: 1.5,
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
                maxWidth: 240,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "transparent",
                  borderRadius: "8px",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#202124",
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                },
                "& .MuiSelect-select": {
                  px: 0,
                  py: 0,
                  pr: "28px !important",
                },
                "& .MuiSelect-icon": {
                  right: -2,
                  color: "#5f6368",
                },
              }}
            >
              <Select value={viewFilter} onChange={(event) => setViewFilter(event.target.value)}>
                {VIEW_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/products/add")}
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                borderRadius: "7px",
                px: 1.8,
                py: 0.8,
                minWidth: "auto",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                boxShadow: "none",
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb", boxShadow: "none" },
              }}
            >
              New
            </Button>
          </Box>

          <ResponsiveDataView
            isMobile={isMobile}
            columns={[
              { key: 'checkbox', label: '', width: CHECKBOX_COLUMN_WIDTH },
              { key: 'name', label: 'NAME', width: '22%' },
              { key: 'purchase_description', label: 'PURCHASE DESCRIPTION', width: '13%' },
              { key: 'purchase_rate', label: 'PURCHASE RATE', align: 'right', width: '9%' },
              { key: 'description', label: 'DESCRIPTION', width: '13%' },
              { key: 'rate', label: 'RATE', align: 'right', width: '8%' },
              { key: 'hsn_sac', label: 'HSN/SAC', width: '7%' },
              { key: 'unit', label: 'USAGE UNIT', width: '6%' },
              { key: 'stock', label: 'STOCK', align: 'right', width: '5%' },
              { key: 'actions', label: '', align: 'center', width: 72 },
            ]}
            rows={paginatedProducts}
            renderCard={(product) => {
              const availableQty = getAvailableQuantity(product);
              const stockBucket = getStockBucket(product);
              return (
                <ItemCard
                  product={product}
                  availableQty={availableQty}
                  stockBucket={stockBucket}
                  onEdit={() => navigate(`/products/edit/${product.id}`)}
                  onDelete={() => setConfirmDeleteId(product.id)}
                  onRestock={product.preferred_vendor_id ? () => handleRestock(product) : undefined}
                />
              );
            }}
            loading={loading}
            emptyTitle={searchTerm ? "No items matched your search." : "No items available."}
            toolbar={
              <>
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: "1px solid #edf0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minHeight: 36 }}>
                    {selectedProducts.length > 0 && (
                      <Typography sx={{ fontSize: "0.8125rem", color: "#5f6368" }}>
                        {selectedProducts.length} selected
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    size="small"
                    placeholder="Search in Items"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: "#9aa0a6" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: { xs: "100%", md: 280 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#fbfcfe",
                        fontSize: "0.875rem",
                        "& fieldset": { borderColor: "#e3e7ee" },
                        "&:hover fieldset": { borderColor: "#cfd6df" },
                        "&.Mui-focused fieldset": { borderColor: "#4f8df7" },
                      },
                    }}
                  />
                </Box>

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
                    sx={{ color: "#b6bdc7" }}
                  />
                </TableCell>
                {[
                  { label: "NAME", width: "22%" },
                  { label: "PURCHASE DESCRIPTION", width: "13%" },
                  { label: "PURCHASE RATE", width: "9%", align: "right" },
                  { label: "DESCRIPTION", width: "13%" },
                  { label: "RATE", width: "8%", align: "right" },
                  { label: "HSN/SAC", width: "7%" },
                  { label: "USAGE UNIT", width: "6%" },
                  { label: "STOCK", width: "5%", align: "right" },
                  { label: "", width: 72, align: "center" },
                ].map((column, index) => (
                  <TableCell
                    key={`${column.label}-${index}`}
                    align={column.align || "left"}
                    sx={{
                      width: column.width,
                      maxWidth: column.width,
                      borderBottomColor: "#edf0f3",
                      py: 1.2,
                      color: "#8b95a7",
                      fontSize: "0.68rem",
                      letterSpacing: "0.05em",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            )}
            renderRow={(product) => {
              const isSelected = selectedProducts.includes(product.id);
              const availableQty = getAvailableQuantity(product);
              const stockBucket = getStockBucket(product);
              const purchaseRate = product.purchase_rate ?? 0;
              const rate = product.price ?? 0;
              return (
                <TableRow
                  key={product.id}
                  hover
                  selected={isSelected}
                  sx={{
                    "& td": { borderBottomColor: "#edf0f3", py: 1.5 },
                    "&:hover": { bgcolor: "#fafcff" },
                  }}
                >
                  <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: "0 4px" }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectOne(product.id)}
                      sx={{ color: "#b6bdc7" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      title={product.name || "Untitled Item"}
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                      sx={{
                        display: "block",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.825rem",
                        fontWeight: 600,
                        color: "#2563eb",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {product.name || "Untitled Item"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={product.purchase_description || product.category || "-"} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.purchase_description || product.category || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: "0.8125rem", color: "#2b3340" }}>{formatCurrency(purchaseRate)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={product.description || "-"} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: "0.8125rem", color: "#2b3340" }}>{formatCurrency(rate)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={product.hsn_sac || "-"} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.hsn_sac || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography title={product.unit || "-"} sx={{ fontSize: "0.8125rem", color: "#2b3340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.unit || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: stockBucket === "Out of Stock" ? "#dc2626" : stockBucket === "Low Stock" ? "#b45309" : "#2b3340" }}>
                      {availableQty}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.15 }}>
                      <Tooltip title="Edit item">
                        <IconButton size="small" onClick={() => navigate(`/products/edit/${product.id}`)} sx={{ color: "#5f87e7" }}>
                          <EditIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      {product.preferred_vendor_id && (
                        <Tooltip title="Restock item">
                          <IconButton size="small" onClick={() => handleRestock(product)} sx={{ color: "#16a34a" }}>
                            <ShoppingCartIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete item">
                        <IconButton size="small" onClick={() => setConfirmDeleteId(product.id)} sx={{ color: "#ef4444" }}>
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
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
      </Container>

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
    </MainLayout>
  );
};

export default ProductList;
