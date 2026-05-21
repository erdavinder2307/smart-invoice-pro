import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Button from "@mui/material/Button";
import EmptyState from "../components/common/EmptyState";
import { getStockLedger } from "../services/stockService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StatCard = ({ icon, label, value, color = "primary" }) => (
  <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Avatar sx={{ bgcolor: `${color}.50`, color: `${color}.main`, width: 38, height: 38 }}>
          {icon}
        </Avatar>
        <Typography sx={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stockLedger, setStockLedger] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchProduct = axios.get(createApiUrl(`/api/products/${id}`));
    const fetchLedger = getStockLedger(id).catch(() => []);
    const fetchAudit = axios
      .get(createApiUrl(`/api/audit-logs?entity_type=product&entity_id=${id}&limit=200`))
      .catch(() => ({ data: [] }));

    Promise.all([fetchProduct, fetchLedger, fetchAudit])
      .then(([prodRes, ledger, auditRes]) => {
        setProduct(prodRes.data);
        setStockLedger(Array.isArray(ledger) ? [...ledger].reverse() : []);
        // Extract price change events from audit log
        const auditEntries = Array.isArray(auditRes.data)
          ? auditRes.data
          : Array.isArray(auditRes.data?.items)
          ? auditRes.data.items
          : [];
        const priceChanges = auditEntries
          .filter((entry) => {
            const before = entry.before || {};
            const after = entry.after || {};
            return (
              entry.action === "UPDATE" &&
              (before.price !== after.price || before.purchase_rate !== after.purchase_rate)
            );
          })
          .map((entry) => ({
            id: entry.id,
            date: entry.created_at || entry.timestamp,
            sellingBefore: entry.before?.price,
            sellingAfter: entry.after?.price,
            costBefore: entry.before?.purchase_rate,
            costAfter: entry.after?.purchase_rate,
            changedBy: entry.username || entry.user_id || "—",
          }));
        setPriceHistory(priceChanges);
      })
      .catch(() => setError("Failed to load product details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ m: 3 }}>
          {error || "Product not found."}
        </Alert>
      </MainLayout>
    );
  }

  const currentStock = typeof product.stock === "number" ? product.stock : "—";
  const isService = product.item_type === "service";
  const isArchived =
    String(product.lifecycle_status || product.status || "").toUpperCase() === "ARCHIVED" ||
    Boolean(product.is_deleted);

  return (
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/products")}
            sx={{ textTransform: "none", color: "#6b7280", p: 0, "&:hover": { bgcolor: "transparent", color: "#111827" } }}
          >
            Items
          </Button>
          <Typography sx={{ color: "#d1d5db" }}>/</Typography>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}>
            {product.name}
          </Typography>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            {isArchived && <Chip label="Archived" size="small" color="warning" />}
            <Chip
              label={isService ? "Service" : "Goods"}
              size="small"
              color={isService ? "info" : "success"}
              variant="outlined"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/products/edit/${id}`)}
              sx={{ textTransform: "none" }}
            >
              Edit
            </Button>
          </Box>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUpIcon fontSize="small" />}
              label="Selling Price"
              value={product.sales_enabled ? formatCurrency(product.price) : "—"}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUpIcon fontSize="small" />}
              label="Cost Price"
              value={product.purchase_enabled ? formatCurrency(product.purchase_rate) : "—"}
              color="warning"
            />
          </Grid>
          {!isService && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<InventoryIcon fontSize="small" />}
                label="Stock on Hand"
                value={currentStock}
                color="primary"
              />
            </Grid>
          )}
          {!isService && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<InventoryIcon fontSize="small" />}
                label="Reorder Level"
                value={product.reorder_level ?? "—"}
                color="error"
              />
            </Grid>
          )}
        </Grid>

        {/* Details Card */}
        <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px", mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 2, color: "#111827" }}>
              Item Details
            </Typography>
            <Grid container spacing={2}>
              {[
                ["Unit", product.unit || "—"],
                ["HSN / SAC Code", product.hsn_sac || "—"],
                ["SKU / Item Code", product.sku || "—"],
                ["Category", product.category || "—"],
                ["Tax Preference", product.tax_preference || "—"],
                ["Tax Rate", product.tax_rate != null ? `${product.tax_rate}%` : "—"],
                ["Sales Account", product.sales_account || "—"],
                ["Purchase Account", product.purchase_account || "—"],
                ["Created", formatDate(product.created_at)],
                ["Last Updated", formatDate(product.updated_at)],
              ].map(([label, value]) => (
                <Grid item xs={6} md={3} key={label}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mb: 0.25 }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>{value}</Typography>
                </Grid>
              ))}
            </Grid>

            {product.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mb: 0.5 }}>Description</Typography>
                <Typography sx={{ fontSize: "0.875rem", color: "#374151" }}>{product.description}</Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stock History (goods only) */}
        {!isService && (
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px", mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 2, color: "#111827" }}>
                Stock History
              </Typography>
              {stockLedger.length === 0 ? (
                <EmptyState title="No stock transactions" subtitle="Stock movements will appear here." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }} align="right">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }} align="right">Balance</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }}>Reason / Source</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stockLedger.slice(0, 50).map((entry) => (
                        <TableRow key={entry.id} sx={{ "&:last-child td": { border: 0 } }}>
                          <TableCell sx={{ fontSize: "0.8rem" }}>{formatDate(entry.date || entry.timestamp)}</TableCell>
                          <TableCell>
                            <Chip
                              label={entry.type}
                              size="small"
                              color={entry.type === "IN" ? "success" : "error"}
                              sx={{ fontSize: "0.7rem", height: 20, borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontSize: "0.8rem", fontWeight: 500, color: entry.type === "IN" ? "#16a34a" : "#dc2626" }}
                          >
                            {entry.type === "IN" ? "+" : "−"}{Math.abs(entry.quantity)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8rem" }}>{entry.balance ?? "—"}</TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", color: "#6b7280", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.reason || entry.source || entry.adjustment_type || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Price History */}
        <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 2, color: "#111827" }}>
              Price History
            </Typography>
            {priceHistory.length === 0 ? (
              <EmptyState title="No price changes recorded" subtitle="Price updates will be tracked here." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }}>Field</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }} align="right">From</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }} align="right">To</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#6b7280" }}>Changed By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceHistory.map((entry) => {
                      const rows = [];
                      if (entry.sellingBefore !== entry.sellingAfter && entry.sellingAfter !== undefined) {
                        rows.push({ id: `${entry.id}-sp`, field: "Selling Price", from: formatCurrency(entry.sellingBefore), to: formatCurrency(entry.sellingAfter) });
                      }
                      if (entry.costBefore !== entry.costAfter && entry.costAfter !== undefined) {
                        rows.push({ id: `${entry.id}-cp`, field: "Cost Price", from: formatCurrency(entry.costBefore), to: formatCurrency(entry.costAfter) });
                      }
                      return rows.map((row, idx) => (
                        <TableRow key={row.id} sx={{ "&:last-child td": { border: 0 } }}>
                          {idx === 0 && (
                            <TableCell rowSpan={rows.length} sx={{ fontSize: "0.8rem", verticalAlign: "middle" }}>
                              {formatDate(entry.date)}
                            </TableCell>
                          )}
                          <TableCell sx={{ fontSize: "0.8rem", color: "#374151" }}>{row.field}</TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8rem", color: "#6b7280" }}>{row.from}</TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>{row.to}</TableCell>
                          {idx === 0 && (
                            <TableCell rowSpan={rows.length} sx={{ fontSize: "0.8rem", color: "#6b7280", verticalAlign: "middle" }}>
                              {entry.changedBy}
                            </TableCell>
                          )}
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default ProductDetail;
