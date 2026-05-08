import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { C, fieldSx, footerSx, cancelBtnSx, saveBtnSx } from "./common/formStyles";
import { useTranslation } from "react-i18next";
import FormInput from "./common/FormInput";
import FormSelect from "./common/FormSelect";
import FormDatePicker from "./common/FormDatePicker";
import DevAutoFillButton from "./common/DevAutoFillButton";
import { generatePurchaseOrderMockData } from "../utils/mockDataGenerators";
import { parseApiError, applyApiErrors } from "../utils/apiErrors";
import { scrollToFirstError } from "../utils/validation";
import { isAutoFillEnabled } from "../utils/autoFillAccess";

const IS_DEV_AUTOFILL = isAutoFillEnabled();
const INITIAL_STATUS = "Draft";

const createEmptyLineItem = () => ({
  item_id: "",
  item_name: "",
  quantity: 1,
  rate: 0,
  tax: 0,
  amount: 0,
});

const initialForm = {
  po_number: "",
  vendor_id: "",
  order_date: "",
  delivery_date: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  status: INITIAL_STATUS,
  notes: "",
  subject: "",
  items: [createEmptyLineItem()],
};

const sectionTitleSx = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#333",
};

const normalizePOStatus = (status) => {
  if (["Sent", "Confirmed", "Issued"].includes(status)) return "Issued";
  return status || INITIAL_STATUS;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeItem = (item = {}) => {
  const quantity = toNumber(item.quantity, 0);
  const rate = toNumber(item.rate, 0);
  const tax = toNumber(item.tax, 0);
  const taxable = quantity * rate;
  const taxAmount = (taxable * tax) / 100;

  return {
    item_id: item.item_id || item.id || "",
    item_name: item.item_name || item.name || "",
    quantity,
    rate,
    tax,
    amount: taxable + taxAmount,
  };
};

const computeTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + (toNumber(item.quantity) * toNumber(item.rate)), 0);
  const totalTax = items.reduce((sum, item) => {
    const taxable = toNumber(item.quantity) * toNumber(item.rate);
    return sum + ((taxable * toNumber(item.tax)) / 100);
  }, 0);
  const totalAmount = subtotal + totalTax;

  return {
    subtotal,
    total_tax: totalTax,
    cgst_amount: totalTax / 2,
    sgst_amount: totalTax / 2,
    igst_amount: 0,
    total_amount: totalAmount,
  };
};

const AddEditPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [form, setForm] = useState(initialForm);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalPoNumber, setOriginalPoNumber] = useState("");
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);

  const itemInputRefs = useRef({});

  const tt = (key, fallback, values) => {
    const translated = t(key, values);
    return translated === key ? fallback : translated;
  };

  const fetchVendors = useCallback(async () => {
    const response = await axios.get(createApiUrl("/api/vendors"));
    return Array.isArray(response.data) ? response.data : [];
  }, []);

  const fetchProducts = useCallback(async () => {
    const response = await axios.get(createApiUrl("/api/products"));
    return Array.isArray(response.data) ? response.data : [];
  }, []);

  const fetchNextPONumber = useCallback(async () => {
    try {
      const response = await axios.get(createApiUrl("/api/purchase-orders/next-number"));
      return response.data?.next_number || "PO-001";
    } catch {
      return "PO-001";
    }
  }, []);

  const fetchPO = useCallback(async (poId) => {
    const response = await axios.get(createApiUrl(`/api/purchase-orders/${poId}`));
    return response.data || null;
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      setApiError("");
      try {
        const [vendorList, productList] = await Promise.all([fetchVendors(), fetchProducts()]);
        if (!active) return;
        setVendors(vendorList);
        setProducts(productList);

        if (id) {
          const po = await fetchPO(id);
          if (!active || !po) return;
          const archived = String(po.lifecycle_status || po.status || '').toUpperCase() === 'ARCHIVED' || Boolean(po.is_deleted);
          setIsArchived(archived);
          const normalizedItems = (Array.isArray(po.items) && po.items.length ? po.items : [createEmptyLineItem()])
            .map(normalizeItem);
          const totals = computeTotals(normalizedItems);

          setForm({
            ...initialForm,
            ...po,
            status: normalizePOStatus(po.status),
            items: normalizedItems,
            ...totals,
          });
          setOriginalPoNumber(String(po.po_number || "").trim());
          return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const nextPoNumber = await fetchNextPONumber();
        if (!active) return;

        const cloneSourceId = location.state?.cloneFrom?.id;
        if (cloneSourceId) {
          const cloneSource = await fetchPO(cloneSourceId);
          if (!active || !cloneSource) return;
          const cloneItems = (Array.isArray(cloneSource.items) && cloneSource.items.length ? cloneSource.items : [createEmptyLineItem()])
            .map(normalizeItem);
          const totals = computeTotals(cloneItems);

          setForm({
            ...initialForm,
            ...cloneSource,
            id: undefined,
            po_number: nextPoNumber,
            order_date: today,
            status: INITIAL_STATUS,
            items: cloneItems,
            ...totals,
          });
        } else {
          setForm((prev) => ({
            ...prev,
            po_number: nextPoNumber,
            order_date: today,
            status: INITIAL_STATUS,
            items: [createEmptyLineItem()],
          }));
        }
      } catch {
        if (active) setApiError("Failed to load purchase order form data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [fetchNextPONumber, fetchPO, fetchProducts, fetchVendors, id, location.state]);

  const productOptions = useMemo(() => (
    products.map((product) => ({
      id: product.id,
      label: product.name || product.item_name || "Unnamed Item",
      rate: toNumber(product.price, 0),
      tax: toNumber(product.tax_rate, 0),
    }))
  ), [products]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const updateLineItem = (index, patch) => {
    setForm((prev) => {
      const items = prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = { ...item, ...patch };
        return normalizeItem(next);
      });

      const totals = computeTotals(items);
      return { ...prev, items, ...totals };
    });

    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`item_${index}_`)) delete next[key];
      });
      return next;
    });
  };

  const addLineItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, createEmptyLineItem()] }));
  };

  const duplicateLineItem = (index) => {
    setForm((prev) => {
      const row = prev.items[index] || createEmptyLineItem();
      const clone = normalizeItem({ ...row });
      const items = [...prev.items];
      items.splice(index + 1, 0, clone);
      const totals = computeTotals(items);
      return { ...prev, items, ...totals };
    });
  };

  const removeLineItem = (index) => {
    setForm((prev) => {
      const remaining = prev.items.filter((_, i) => i !== index);
      const items = remaining.length ? remaining : [createEmptyLineItem()];
      const totals = computeTotals(items);
      return { ...prev, items, ...totals };
    });

    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith("item_")) delete next[key];
      });
      return next;
    });
  };

  const focusItemInput = (index) => {
    setTimeout(() => {
      const target = itemInputRefs.current[index];
      if (target && typeof target.focus === "function") target.focus();
    }, 0);
  };

  const handleLineKeyDown = (event, rowIndex, field) => {
    if (event.key !== "Enter") return;
    if (field !== "tax") return;
    const isLastRow = rowIndex === form.items.length - 1;
    if (!isLastRow) return;

    event.preventDefault();
    addLineItem();
    focusItemInput(rowIndex + 1);
  };

  const applyAutofill = () => {
    if (!IS_DEV_AUTOFILL) return;
    if (!vendors.length) {
      setApiError("Auto Fill requires at least one vendor.");
      return;
    }

    const generated = generatePurchaseOrderMockData({
      scenario: "full",
      context: { vendors, products },
    }) || {};

    const selectedVendorId = generated.vendor_id || vendors[0]?.id || "";
    const sourceItems = Array.isArray(generated.items) && generated.items.length
      ? generated.items
      : [createEmptyLineItem(), createEmptyLineItem()];

    const resolvedItems = sourceItems.map((item, index) => {
      const preferredProduct = productOptions.find((product) => product.id === item.item_id)
        || productOptions.find((product) => product.label === item.item_name)
        || productOptions[index % Math.max(productOptions.length, 1)]
        || null;

      const normalized = normalizeItem({
        ...item,
        item_id: preferredProduct?.id || item.item_id || "",
        item_name: preferredProduct?.label || item.item_name || `Item ${index + 1}`,
        rate: item.rate ?? preferredProduct?.rate ?? 0,
        tax: item.tax ?? preferredProduct?.tax ?? 18,
        quantity: item.quantity ?? 1,
      });

      return normalized;
    });

    const totals = computeTotals(resolvedItems);

    setForm((prev) => ({
      ...prev,
      po_number: generated.po_number || prev.po_number,
      vendor_id: selectedVendorId,
      order_date: generated.order_date || prev.order_date || new Date().toISOString().slice(0, 10),
      delivery_date: generated.delivery_date || prev.delivery_date,
      status: normalizePOStatus(generated.status || prev.status || INITIAL_STATUS),
      subject: generated.subject || "Procurement request for monthly supplies",
      notes: generated.notes || "Please dispatch within agreed timeline and share shipping details.",
      items: resolvedItems,
      ...totals,
    }));

    setErrors({});
    setDidAttemptSubmit(false);
    setApiError("");
  };

  const validateForm = useCallback((nextForm) => {
    const fieldErrors = {};

    if (!String(nextForm.po_number || "").trim()) {
      fieldErrors.po_number = "PO Number is required";
    }

    if (!String(nextForm.vendor_id || "").trim()) {
      fieldErrors.vendor_id = "Vendor is required";
    }

    if (!String(nextForm.order_date || "").trim()) {
      fieldErrors.order_date = "Order Date is required";
    }

    const items = Array.isArray(nextForm.items) ? nextForm.items : [];
    const meaningfulItems = items.filter((item) => String(item.item_id || item.item_name || "").trim());

    if (meaningfulItems.length < 1) {
      fieldErrors.items = "At least one line item is required";
    }

    items.forEach((item, index) => {
      const hasIdentity = String(item.item_id || item.item_name || "").trim().length > 0;
      if (!hasIdentity) return;

      const quantity = toNumber(item.quantity, NaN);
      const rate = toNumber(item.rate, NaN);
      const tax = toNumber(item.tax, NaN);

      if (Number.isNaN(quantity) || quantity <= 0) {
        fieldErrors[`item_${index}_quantity`] = "Quantity must be greater than 0";
      }

      if (Number.isNaN(rate) || rate < 0) {
        fieldErrors[`item_${index}_rate`] = "Rate cannot be negative";
      }

      if (Number.isNaN(tax) || tax < 0) {
        fieldErrors[`item_${index}_tax`] = "Tax cannot be negative";
      }
    });

    return fieldErrors;
  }, []);

  const syncErrors = useMemo(() => validateForm(form), [form, validateForm]);
  const isFormValid = Object.keys(syncErrors).length === 0;

  useEffect(() => {
    if (!didAttemptSubmit) return;
    setErrors(syncErrors);
  }, [didAttemptSubmit, syncErrors]);

  const scrollToFirstPurchaseOrderError = (fieldErrors) => {
    if (fieldErrors.items) {
      const itemsSection = document.getElementById("po-items-section");
      if (itemsSection) {
        itemsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const firstKey = Object.keys(fieldErrors)[0];
    if (firstKey?.startsWith("item_")) {
      const input = document.querySelector(`[name="${firstKey}"]`);
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof input.focus === "function") input.focus();
        return;
      }
    }

    scrollToFirstError(fieldErrors);
  };

  const checkDuplicatePoNumber = useCallback(async (poNumber) => {
    const normalized = String(poNumber || "").trim();
    if (!normalized) return false;

    try {
      setCheckingDuplicate(true);
      const response = await axios.get(createApiUrl("/api/purchase-orders"), {
        params: {
          include_meta: 1,
          q: normalized,
          page: 1,
          limit: 20,
        },
      });

      const payload = response.data;
      const rows = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.data) ? payload.data : []);

      return rows.some((row) => (
        String(row.po_number || "").trim().toLowerCase() === normalized.toLowerCase()
        && (!id || row.id !== id)
      ));
    } catch {
      return false;
    } finally {
      setCheckingDuplicate(false);
    }
  }, [id]);

  const buildPayload = (sourceForm) => {
    const sanitizedItems = (sourceForm.items || [])
      .filter((item) => String(item.item_id || item.item_name || "").trim())
      .map((item) => ({
        item_id: item.item_id || undefined,
        item_name: String(item.item_name || "").trim(),
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        tax: toNumber(item.tax),
        amount: toNumber(item.amount),
      }));

    const totals = computeTotals(sanitizedItems);

    return {
      ...sourceForm,
      po_number: String(sourceForm.po_number || "").trim(),
      vendor_id: String(sourceForm.vendor_id || "").trim(),
      order_date: sourceForm.order_date,
      delivery_date: sourceForm.delivery_date || null,
      status: normalizePOStatus(sourceForm.status),
      subject: String(sourceForm.subject || "").trim(),
      notes: String(sourceForm.notes || "").trim(),
      items: sanitizedItems,
      ...totals,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isArchived) {
      setApiError('Archived purchase orders are read-only. Restore the purchase order to edit.');
      return;
    }
    setDidAttemptSubmit(true);
    setApiError("");

    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      scrollToFirstPurchaseOrderError(fieldErrors);
      return;
    }

    const shouldCheckDuplicate = !id || (id && String(form.po_number || "").trim() !== originalPoNumber);
    if (shouldCheckDuplicate) {
      const isDuplicate = await checkDuplicatePoNumber(form.po_number);
      if (isDuplicate) {
        const duplicateErrors = { po_number: "PO Number already exists" };
        setErrors((prev) => ({ ...prev, ...duplicateErrors }));
        scrollToFirstPurchaseOrderError(duplicateErrors);
        return;
      }
    }

    const payload = buildPayload(form);

    setSaving(true);
    try {
      if (id) {
        await axios.put(createApiUrl(`/api/purchase-orders/${id}`), payload);
      } else {
        await axios.post(createApiUrl("/api/purchase-orders"), payload);
      }
      navigate("/purchase-orders");
    } catch (err) {
      const parsed = parseApiError(err, "Failed to save purchase order");
      const message = applyApiErrors(parsed, setErrors);
      setApiError(message);
      if (Object.keys(parsed.fields || {}).length) {
        scrollToFirstPurchaseOrderError(parsed.fields);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBasicFieldChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ minHeight: "100vh", pb: 6 }}>
        <Box sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
            <Typography sx={{ fontSize: "1.85rem", fontWeight: 500, color: "#212121", textAlign: "left" }}>
              {id ? tt("addEditPurchaseOrder.editTitle", "Edit Purchase Order") : tt("addEditPurchaseOrder.newTitle", "New Purchase Order")}
            </Typography>
            {IS_DEV_AUTOFILL && <DevAutoFillButton onClick={applyAutofill} />}
          </Box>

          {apiError && (
            <Alert severity="error" onClose={() => setApiError("")} sx={{ mb: 2, borderRadius: "4px" }}>
              {apiError}
            </Alert>
          )}

          {isArchived && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: "4px" }}>
              Archived purchase orders are read-only. Restore this purchase order before editing.
            </Alert>
          )}

          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" }}
          >
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>Purchase Order Info</Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="PO Number"
                    required
                    name="po_number"
                    value={form.po_number}
                    onChange={handleBasicFieldChange}
                    error={!!errors.po_number}
                    helperText={errors.po_number || ""}
                    sx={{ maxWidth: 320 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleBasicFieldChange}
                    noDivider
                    placeholder="Add a clear subject for this purchase order"
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>Vendor & Dates</Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelect
                    label="Vendor"
                    required
                    name="vendor_id"
                    value={form.vendor_id}
                    onChange={handleBasicFieldChange}
                    options={vendors.map((vendor) => ({
                      value: vendor.id,
                      label: vendor.vendor_name || vendor.name || "Vendor",
                    }))}
                    placeholder="Select vendor"
                    displayEmpty
                    width={340}
                    error={!!errors.vendor_id}
                    helperText={errors.vendor_id || ""}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormDatePicker
                    label="Order Date"
                    required
                    name="order_date"
                    value={form.order_date}
                    onChange={handleBasicFieldChange}
                    error={!!errors.order_date}
                    helperText={errors.order_date || ""}
                  />

                  <FormDatePicker
                    label="Delivery Date"
                    name="delivery_date"
                    value={form.delivery_date}
                    onChange={handleBasicFieldChange}
                    noDivider
                    min={form.order_date || undefined}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box id="po-items-section" sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box
                sx={{
                  py: 1.5,
                  borderBottom: `1px solid ${C.divider}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={sectionTitleSx}>Line Items</Typography>
                <Button startIcon={<AddIcon />} onClick={addLineItem} size="small" sx={{ textTransform: "none" }}>
                  Add Row
                </Button>
              </Box>

              {errors.items && (
                <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                  {errors.items}
                </Alert>
              )}

              <TableContainer sx={{ mt: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="34%">Item</TableCell>
                      <TableCell width="12%">Quantity</TableCell>
                      <TableCell width="14%">Rate</TableCell>
                      <TableCell width="12%">Tax %</TableCell>
                      <TableCell width="16%">Amount</TableCell>
                      <TableCell width="12%" align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items.map((item, index) => {
                      const selectedProduct = productOptions.find((option) => option.id === item.item_id)
                        || (item.item_name ? { id: item.item_id || `custom-${index}`, label: item.item_name, rate: item.rate, tax: item.tax } : null);

                      return (
                        <TableRow key={`line-item-${index}`}>
                          <TableCell>
                            <Autocomplete
                              options={productOptions}
                              value={selectedProduct}
                              size="small"
                              getOptionLabel={(option) => option?.label || ""}
                              isOptionEqualToValue={(option, value) => option.id === value?.id}
                              onChange={(_, selected) => {
                                if (!selected) {
                                  updateLineItem(index, {
                                    item_id: "",
                                    item_name: "",
                                    rate: 0,
                                    tax: 0,
                                  });
                                  return;
                                }
                                updateLineItem(index, {
                                  item_id: selected.id,
                                  item_name: selected.label,
                                  rate: selected.rate,
                                  tax: selected.tax,
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Search item..."
                                  sx={fieldSx}
                                  inputRef={(ref) => {
                                    itemInputRefs.current[index] = ref;
                                  }}
                                />
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              name={`item_${index}_quantity`}
                              size="small"
                              type="number"
                              value={item.quantity}
                              onChange={(event) => updateLineItem(index, { quantity: event.target.value })}
                              onKeyDown={(event) => handleLineKeyDown(event, index, "quantity")}
                              sx={fieldSx}
                              error={!!errors[`item_${index}_quantity`]}
                              helperText={errors[`item_${index}_quantity`] || ""}
                              inputProps={{ min: 0, step: "any" }}
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              name={`item_${index}_rate`}
                              size="small"
                              type="number"
                              value={item.rate}
                              onChange={(event) => updateLineItem(index, { rate: event.target.value })}
                              onKeyDown={(event) => handleLineKeyDown(event, index, "rate")}
                              sx={fieldSx}
                              error={!!errors[`item_${index}_rate`]}
                              helperText={errors[`item_${index}_rate`] || ""}
                              inputProps={{ min: 0, step: "any" }}
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              name={`item_${index}_tax`}
                              size="small"
                              type="number"
                              value={item.tax}
                              onChange={(event) => updateLineItem(index, { tax: event.target.value })}
                              onKeyDown={(event) => handleLineKeyDown(event, index, "tax")}
                              sx={fieldSx}
                              error={!!errors[`item_${index}_tax`]}
                              helperText={errors[`item_${index}_tax`] || ""}
                              inputProps={{ min: 0, step: "any" }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600} sx={{ pt: 1 }}>
                              ₹{toNumber(item.amount).toFixed(2)}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Tooltip title="Duplicate row">
                              <IconButton size="small" onClick={() => duplicateLineItem(index)}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove row">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeLineItem(index)}
                                  disabled={form.items.length === 1}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}`, py: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box
                  sx={{
                    width: { xs: "100%", md: 360 },
                    position: { xs: "static", md: "sticky" },
                    top: { md: 16 },
                    alignSelf: "flex-start",
                    p: 2,
                    border: `1px solid ${C.divider}`,
                    borderRadius: "6px",
                    bgcolor: "#fcfdff",
                  }}
                >
                  <Typography sx={{ ...sectionTitleSx, mb: 1.2 }}>Totals Summary</Typography>
                  <Divider sx={{ mb: 1.5 }} />

                  {[
                    ["Subtotal", form.subtotal],
                    ["CGST", form.cgst_amount],
                    ["SGST", form.sgst_amount],
                    ["Total Tax", form.total_tax],
                  ].map(([label, value]) => (
                    <Box key={label} display="flex" justifyContent="space-between" mb={0.7}>
                      <Typography variant="body2" color="text.secondary">{label}:</Typography>
                      <Typography variant="body2" fontWeight={600}>₹{toNumber(value).toFixed(2)}</Typography>
                    </Box>
                  ))}

                  <Box display="flex" justifyContent="space-between" mt={1.3} pt={1.4} sx={{ borderTop: `2px solid ${C.divider}` }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>Total Amount:</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "primary.main" }}>
                      ₹{toNumber(form.total_amount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>Status & Notes</Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormSelect
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleBasicFieldChange}
                    options={["Draft", "Issued", "Received", "Cancelled", "Billed", "Closed"].map((status) => ({
                      value: status,
                      label: status,
                    }))}
                    width={220}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <FormInput
                    label="Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleBasicFieldChange}
                    noDivider
                    multiline
                    rows={3}
                    alignStart
                    placeholder="Add internal notes for this purchase order"
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate("/purchase-orders")} disabled={saving} sx={cancelBtnSx}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || checkingDuplicate || !isFormValid || isArchived}
                startIcon={(saving || checkingDuplicate) ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {saving ? "Saving..." : checkingDuplicate ? "Checking..." : id ? "Update" : "Save"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditPurchaseOrder;
