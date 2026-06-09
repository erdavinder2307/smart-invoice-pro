// ── REPLACED — see AddEditBill.jsx.bak for previous version ──────────────────
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { C, fieldSx, footerSx, cancelBtnSx, saveBtnSx } from "./common/formStyles";
import FormInput from "./common/FormInput";
import FormSelect from "./common/FormSelect";
import FormDatePicker from "./common/FormDatePicker";
import DevAutoFillButton from "./common/DevAutoFillButton";
import { generateBillMockData } from "../utils/mockDataGenerators";
import { parseApiError, applyApiErrors } from "../utils/apiErrors";
import { scrollToFirstError } from "../utils/validation";
import { isAutoFillEnabled } from "../utils/autoFillAccess";

const IS_DEV_AUTOFILL = isAutoFillEnabled();

const sectionTitleSx = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#333",
};

// ── Module-level helpers ──────────────────────────────────────────────────────

const createEmptyLineItem = () => ({
  item_id: "",
  item_name: "",
  quantity: 1,
  rate: 0,
  tax: 0,
  amount: 0,
});

const createEmptyExpense = () => ({
  expense_name: "",
  amount: 0,
  description: "",
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeItem = (item = {}) => {
  const quantity = toNumber(item.quantity, 0);
  const rate = toNumber(item.rate, 0);
  const tax = toNumber(item.tax, 0);
  const taxable = quantity * rate;
  return {
    item_id: item.item_id || "",
    item_name: item.item_name || "",
    quantity,
    rate,
    tax,
    amount: taxable + (taxable * tax) / 100,
  };
};

/**
 * Compute totals from items + expenses.
 * Expenses count towards subtotal (pre-tax), matching existing bill behaviour.
 */
const computeTotals = (items = [], expenses = [], amountPaid = 0) => {
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + toNumber(item.quantity) * toNumber(item.rate),
    0
  );
  const totalTax = items.reduce((sum, item) => {
    const taxable = toNumber(item.quantity) * toNumber(item.rate);
    return sum + (taxable * toNumber(item.tax)) / 100;
  }, 0);
  const expensesTotal = expenses.reduce((sum, exp) => sum + toNumber(exp.amount), 0);
  const subtotal = itemsSubtotal + expensesTotal;
  const totalAmount = subtotal + totalTax;
  return {
    subtotal,
    total_tax: totalTax,
    cgst_amount: totalTax / 2,
    sgst_amount: totalTax / 2,
    igst_amount: 0,
    total_amount: totalAmount,
    balance_due: Math.max(totalAmount - toNumber(amountPaid), 0),
  };
};

const initialForm = {
  bill_number: "",
  vendor_id: "",
  bill_date: "",
  due_date: "",
  subject: "",
  payment_status: "Unpaid",
  notes: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  amount_paid: 0,
  balance_due: 0,
  items: [createEmptyLineItem()],
  expenses: [],
};

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 2.5, pb: 2 }}>
    {value === index && children}
  </Box>
);

// ── Component ─────────────────────────────────────────────────────────────────

const AddEditBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [errors, setErrors] = useState({});
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [originalBillNumber, setOriginalBillNumber] = useState("");

  const itemInputRefs = useRef({});

  // ── Data fetch helpers ────────────────────────────────────────────────────

  const fetchVendors = useCallback(async () => {
    const res = await axios.get(createApiUrl("/api/vendors"));
    return Array.isArray(res.data) ? res.data : [];
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await axios.get(createApiUrl("/api/products"));
    return Array.isArray(res.data) ? res.data : [];
  }, []);

  const fetchNextBillNumber = useCallback(async () => {
    try {
      const res = await axios.get(createApiUrl("/api/bills/next-number"));
      return res.data?.next_number || "BILL-001";
    } catch {
      return "BILL-001";
    }
  }, []);

  const fetchBill = useCallback(async (billId) => {
    const res = await axios.get(createApiUrl(`/api/bills/${billId}`));
    return res.data || null;
  }, []);

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      setApiError("");
      try {
        const [vendorList, productList] = await Promise.all([
          fetchVendors(),
          fetchProducts(),
        ]);
        if (!active) return;
        setVendors(vendorList);
        setProducts(productList);

        if (id) {
          const bill = await fetchBill(id);
          if (!active || !bill) return;
          const archived = String(bill.lifecycle_status || bill.status || '').toUpperCase() === 'ARCHIVED' || Boolean(bill.is_deleted);
          setIsArchived(archived);
          const normalizedItems = (
            Array.isArray(bill.items) && bill.items.length
              ? bill.items
              : [createEmptyLineItem()]
          ).map(normalizeItem);
          const normalizedExpenses = Array.isArray(bill.expenses) ? bill.expenses : [];
          const totals = computeTotals(normalizedItems, normalizedExpenses, bill.amount_paid || 0);
          setForm({
            ...initialForm,
            ...bill,
            items: normalizedItems,
            expenses: normalizedExpenses,
            ...totals,
          });
          setOriginalBillNumber(String(bill.bill_number || "").trim());
          return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const nextBillNumber = await fetchNextBillNumber();
        if (!active) return;
        setForm((prev) => ({ ...prev, bill_number: nextBillNumber, bill_date: today }));
      } catch {
        if (active) setApiError("Failed to load bill form data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [fetchBill, fetchNextBillNumber, fetchProducts, fetchVendors, id]);

  // ── Product options ───────────────────────────────────────────────────────

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
        label: p.name || p.item_name || p.product_name || "Unnamed Item",
        rate: toNumber(p.price || p.selling_price || p.unit_price, 0),
        tax: toNumber(p.tax_rate, 0),
      })),
    [products]
  );

  // ── Field helpers ─────────────────────────────────────────────────────────

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBasicFieldChange = (e) => {
    const { name, value } = e.target;
    setFormField(name, value);
  };

  // ── Line item helpers ─────────────────────────────────────────────────────

  const updateLineItem = (index, patch) => {
    setForm((prev) => {
      const items = prev.items.map((item, i) =>
        i !== index ? item : normalizeItem({ ...item, ...patch })
      );
      return { ...prev, items, ...computeTotals(items, prev.expenses, prev.amount_paid) };
    });
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`item_${index}_`)) delete next[k];
      });
      return next;
    });
  };

  const addLineItem = () =>
    setForm((prev) => ({ ...prev, items: [...prev.items, createEmptyLineItem()] }));

  const duplicateLineItem = (index) => {
    setForm((prev) => {
      const clone = normalizeItem({ ...prev.items[index] });
      const items = [...prev.items];
      items.splice(index + 1, 0, clone);
      return { ...prev, items, ...computeTotals(items, prev.expenses, prev.amount_paid) };
    });
  };

  const removeLineItem = (index) => {
    setForm((prev) => {
      const remaining = prev.items.filter((_, i) => i !== index);
      const items = remaining.length ? remaining : [createEmptyLineItem()];
      return { ...prev, items, ...computeTotals(items, prev.expenses, prev.amount_paid) };
    });
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith("item_")) delete next[k];
      });
      return next;
    });
  };

  // ── Expense helpers ───────────────────────────────────────────────────────

  const updateExpense = (index, patch) => {
    setForm((prev) => {
      const expenses = prev.expenses.map((exp, i) =>
        i !== index ? exp : { ...exp, ...patch }
      );
      return { ...prev, expenses, ...computeTotals(prev.items, expenses, prev.amount_paid) };
    });
  };

  const addExpense = () =>
    setForm((prev) => ({ ...prev, expenses: [...prev.expenses, createEmptyExpense()] }));

  const removeExpense = (index) => {
    setForm((prev) => {
      const expenses = prev.expenses.filter((_, i) => i !== index);
      return { ...prev, expenses, ...computeTotals(prev.items, expenses, prev.amount_paid) };
    });
  };

  // ── Keyboard shortcut: Enter on last tax field → add row ──────────────────

  const focusItemInput = (index) => {
    setTimeout(() => {
      const target = itemInputRefs.current[index];
      if (target && typeof target.focus === "function") target.focus();
    }, 0);
  };

  const handleLineKeyDown = (event, rowIndex, field) => {
    if (event.key !== "Enter" || field !== "tax") return;
    if (rowIndex !== form.items.length - 1) return;
    event.preventDefault();
    addLineItem();
    focusItemInput(rowIndex + 1);
  };

  // ── Dev autofill ──────────────────────────────────────────────────────────

  const applyAutofill = useCallback(() => {
    if (!IS_DEV_AUTOFILL) return;

    const generated =
      generateBillMockData({ scenario: "full", context: { vendors, products } }) || {};

    const sourceItems =
      Array.isArray(generated.items) && generated.items.length
        ? generated.items
        : [createEmptyLineItem()];

    const resolvedItems = sourceItems.map((item, index) => {
      const match =
        productOptions.find((p) => p.id === item.item_id) ||
        productOptions.find((p) => p.label === item.item_name) ||
        productOptions[index % Math.max(productOptions.length, 1)] ||
        null;
      return normalizeItem({
        ...item,
        item_id: match?.id || item.item_id || "",
        item_name: match?.label || item.item_name || `Item ${index + 1}`,
        rate: item.rate ?? match?.rate ?? 0,
        tax: item.tax ?? match?.tax ?? 18,
        quantity: item.quantity ?? 1,
      });
    });

    const resolvedExpenses = Array.isArray(generated.expenses) ? generated.expenses : [];
    const totals = computeTotals(resolvedItems, resolvedExpenses, 0);

    setForm((prev) => ({
      ...prev,
      vendor_id: generated.vendor_id || prev.vendor_id,
      bill_date: generated.bill_date || prev.bill_date,
      due_date: generated.due_date || prev.due_date,
      subject: generated.subject || prev.subject,
      notes: generated.notes || prev.notes,
      payment_status: generated.payment_status || prev.payment_status,
      amount_paid: toNumber(generated.amount_paid, prev.amount_paid),
      items: resolvedItems,
      expenses: resolvedExpenses,
      ...totals,
    }));
    setErrors({});
    setApiError("");
  }, [vendors, products, productOptions]);

  // Dev keyboard shortcut (Cmd/Ctrl+Shift+F)
  useEffect(() => {
    if (!IS_DEV_AUTOFILL) return undefined;
    const onKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl || !e.shiftKey || String(e.key).toLowerCase() !== "f") return;
      e.preventDefault();
      applyAutofill();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyAutofill]);

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = useCallback((values) => {
    const fieldErrors = {};

    if (!String(values.bill_number || "").trim())
      fieldErrors.bill_number = "Bill Number is required";
    if (!String(values.vendor_id || "").trim())
      fieldErrors.vendor_id = "Vendor is required";
    if (!String(values.bill_date || "").trim())
      fieldErrors.bill_date = "Bill Date is required";
    if (!String(values.due_date || "").trim())
      fieldErrors.due_date = "Due Date is required";

    const items = Array.isArray(values.items) ? values.items : [];
    const hasAnyNamedItem = items.some((item) =>
      String(item.item_id || item.item_name || "").trim()
    );
    if (!hasAnyNamedItem) {
      fieldErrors.items = "At least one item is required";
    }

    items.forEach((item, index) => {
      if (!String(item.item_id || item.item_name || "").trim()) return;
      const qty = toNumber(item.quantity, NaN);
      const rate = toNumber(item.rate, NaN);
      if (isNaN(qty) || qty <= 0)
        fieldErrors[`item_${index}_quantity`] = "Quantity must be greater than 0";
      if (isNaN(rate) || rate <= 0)
        fieldErrors[`item_${index}_rate`] = "Rate must be greater than zero";
    });

    return fieldErrors;
  }, []);

  const syncErrors = useMemo(() => validateForm(form), [form, validateForm]);

  useEffect(() => {
    if (!didAttemptSubmit) return;
    setErrors(syncErrors);
  }, [didAttemptSubmit, syncErrors]);

  // ── Duplicate bill number check ───────────────────────────────────────────

  const checkDuplicateBillNumber = useCallback(
    async (billNumber) => {
      const normalized = String(billNumber || "").trim();
      if (!normalized) return false;
      try {
        setCheckingDuplicate(true);
        const res = await axios.get(createApiUrl("/api/bills"), {
          params: { include_meta: 1, q: normalized, page: 1, page_size: 20 },
        });
        const payload = res.data;
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        return rows.some(
          (row) =>
            String(row.bill_number || "").trim().toLowerCase() ===
              normalized.toLowerCase() && (!id || row.id !== id)
        );
      } catch {
        return false;
      } finally {
        setCheckingDuplicate(false);
      }
    },
    [id]
  );

  // ── Build payload ─────────────────────────────────────────────────────────

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

    const sanitizedExpenses = (sourceForm.expenses || []).map((exp) => ({
      expense_name: String(exp.expense_name || "").trim(),
      amount: toNumber(exp.amount),
      description: String(exp.description || "").trim(),
    }));

    const totals = computeTotals(
      sanitizedItems,
      sanitizedExpenses,
      sourceForm.amount_paid || 0
    );

    return {
      ...sourceForm,
      bill_number: String(sourceForm.bill_number || "").trim(),
      vendor_id: String(sourceForm.vendor_id || "").trim(),
      subject: String(sourceForm.subject || "").trim(),
      notes: String(sourceForm.notes || "").trim(),
      items: sanitizedItems,
      expenses: sanitizedExpenses,
      ...totals,
    };
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isArchived) {
      setApiError("Archived bills are read-only. Restore the bill to edit.");
      return;
    }
    setDidAttemptSubmit(true);
    setApiError("");

    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      if (fieldErrors.items) setActiveTab(0);
      scrollToFirstError(fieldErrors);
      return;
    }

    const shouldCheckDuplicate =
      !id || String(form.bill_number || "").trim() !== originalBillNumber;
    if (shouldCheckDuplicate) {
      const isDuplicate = await checkDuplicateBillNumber(form.bill_number);
      if (isDuplicate) {
        const duplicateErrors = { bill_number: "Bill Number already exists" };
        setErrors((prev) => ({ ...prev, ...duplicateErrors }));
        scrollToFirstError(duplicateErrors);
        return;
      }
    }

    const payload = buildPayload(form);
    setSaving(true);
    try {
      if (id) {
        await axios.put(createApiUrl(`/api/bills/${id}`), payload);
      } else {
        await axios.post(createApiUrl("/api/bills"), payload);
      }
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
      queryClient.invalidateQueries({ queryKey: ["bills-vendors"] });
      navigate("/bills");
    } catch (err) {
      const parsed = parseApiError(err, "Failed to save bill");
      const message = applyApiErrors(parsed, setErrors);
      setApiError(message);
      if (Object.keys(parsed.fields || {}).length) {
        scrollToFirstError(parsed.fields);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ minHeight: "100vh", pb: 6 }}>
        <Box sx={{ pt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: "1.85rem", fontWeight: 500, color: "#212121" }}>
              {id ? "Edit Bill" : "New Bill"}
            </Typography>
            {IS_DEV_AUTOFILL && <DevAutoFillButton onClick={applyAutofill} />}
          </Box>

          {apiError && (
            <Alert
              severity="error"
              onClose={() => setApiError("")}
              sx={{ mb: 2, borderRadius: "4px" }}
            >
              {apiError}
            </Alert>
          )}

          {isArchived && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: "4px" }}>
              Archived bills are read-only. Restore this bill before editing.
            </Alert>
          )}

          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{
              bgcolor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {/* ── BILL INFORMATION ──────────────────────────────────────── */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>Bill Information</Typography>
              </Box>

              <Grid container columnSpacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="Bill Number"
                    required
                    name="bill_number"
                    value={form.bill_number}
                    onChange={handleBasicFieldChange}
                    error={!!errors.bill_number}
                    helperText={errors.bill_number || ""}
                    sx={{ maxWidth: 280 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    label="Subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleBasicFieldChange}
                    noDivider
                    placeholder="Brief description of this bill"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ── VENDOR & DATES ─────────────────────────────────────────── */}
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
                    options={vendors.map((v) => ({
                      value: v.id,
                      label: v.vendor_name || v.name || "Vendor",
                    }))}
                    placeholder="Select vendor"
                    displayEmpty
                    width={340}
                    error={!!errors.vendor_id}
                    helperText={errors.vendor_id || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelect
                    label="Payment Status"
                    name="payment_status"
                    value={form.payment_status}
                    onChange={handleBasicFieldChange}
                    options={["Unpaid", "Partially Paid", "Paid", "Overdue"].map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    width={220}
                    noDivider
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormDatePicker
                    label="Bill Date"
                    required
                    name="bill_date"
                    value={form.bill_date}
                    onChange={handleBasicFieldChange}
                    error={!!errors.bill_date}
                    helperText={errors.bill_date || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormDatePicker
                    label="Due Date"
                    required
                    name="due_date"
                    value={form.due_date}
                    onChange={handleBasicFieldChange}
                    error={!!errors.due_date}
                    helperText={errors.due_date || ""}
                    noDivider
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ── ITEMS & EXPENSES (TABS) ────────────────────────────────── */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ borderBottom: `1px solid ${C.divider}` }}
              >
                <Tab label={`Items (${form.items.length})`} />
                <Tab label={`Expenses (${form.expenses.length})`} />
              </Tabs>

              {/* Items Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Typography sx={sectionTitleSx}>Line Items</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addLineItem}
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    Add Item
                  </Button>
                </Box>

                {errors.items && (
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    {errors.items}
                  </Alert>
                )}

                <TableContainer id="bill-items-section">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="34%">Item</TableCell>
                        <TableCell width="12%">Quantity</TableCell>
                        <TableCell width="14%">Rate</TableCell>
                        <TableCell width="12%">Tax %</TableCell>
                        <TableCell width="16%">Amount</TableCell>
                        <TableCell width="12%" align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.items.map((item, index) => {
                        const selectedProduct =
                          productOptions.find((o) => o.id === item.item_id) ||
                          (item.item_name
                            ? {
                                id: item.item_id || `custom-${index}`,
                                label: item.item_name,
                                rate: item.rate,
                                tax: item.tax,
                              }
                            : null);

                        return (
                          <TableRow key={`item-${index}`}>
                            <TableCell>
                              <Autocomplete
                                freeSolo
                                options={productOptions}
                                value={selectedProduct}
                                size="small"
                                getOptionLabel={(option) =>
                                  typeof option === "string"
                                    ? option
                                    : option?.label || ""
                                }
                                isOptionEqualToValue={(option, value) =>
                                  option?.id === value?.id
                                }
                                onChange={(_, selected) => {
                                  if (!selected) {
                                    updateLineItem(index, {
                                      item_id: "",
                                      item_name: "",
                                      rate: 0,
                                      tax: 0,
                                    });
                                  } else if (typeof selected === "object") {
                                    updateLineItem(index, {
                                      item_id: selected.id,
                                      item_name: selected.label,
                                      rate: selected.rate,
                                      tax: selected.tax,
                                    });
                                  } else {
                                    updateLineItem(index, {
                                      item_id: "",
                                      item_name: selected,
                                    });
                                  }
                                }}
                                onInputChange={(_, value, reason) => {
                                  if (reason === "input") {
                                    updateLineItem(index, {
                                      item_name: value,
                                      item_id: "",
                                    });
                                  }
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Search or type item..."
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
                                onChange={(e) =>
                                  updateLineItem(index, { quantity: e.target.value })
                                }
                                onKeyDown={(e) => handleLineKeyDown(e, index, "quantity")}
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
                                onChange={(e) =>
                                  updateLineItem(index, { rate: e.target.value })
                                }
                                onKeyDown={(e) => handleLineKeyDown(e, index, "rate")}
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
                                onChange={(e) =>
                                  updateLineItem(index, { tax: e.target.value })
                                }
                                onKeyDown={(e) => handleLineKeyDown(e, index, "tax")}
                                sx={fieldSx}
                                inputProps={{ min: 0, step: "any" }}
                              />
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ pt: 1 }}
                              >
                                ₹{toNumber(item.amount).toFixed(2)}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Tooltip title="Duplicate row">
                                <IconButton
                                  size="small"
                                  onClick={() => duplicateLineItem(index)}
                                >
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
              </TabPanel>

              {/* Expenses Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Typography sx={sectionTitleSx}>Additional Expenses</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addExpense}
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    Add Expense
                  </Button>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="30%">Expense Name</TableCell>
                        <TableCell width="20%">Amount</TableCell>
                        <TableCell width="40%">Description</TableCell>
                        <TableCell width="10%" align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              No expenses added
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        form.expenses.map((expense, index) => (
                          <TableRow key={`expense-${index}`}>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                sx={fieldSx}
                                value={expense.expense_name}
                                onChange={(e) =>
                                  updateExpense(index, { expense_name: e.target.value })
                                }
                                placeholder="e.g. Freight"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                sx={{ ...fieldSx, width: 120 }}
                                value={expense.amount}
                                onChange={(e) =>
                                  updateExpense(index, { amount: e.target.value })
                                }
                                inputProps={{ min: 0, step: "any" }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                sx={fieldSx}
                                value={expense.description}
                                onChange={(e) =>
                                  updateExpense(index, { description: e.target.value })
                                }
                                placeholder="Optional note"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Remove expense">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeExpense(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Box>

            {/* ── TOTALS SUMMARY ──────────────────────────────────────────── */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}`, py: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box
                  sx={{
                    width: { xs: "100%", md: 360 },
                    p: 2,
                    border: `1px solid ${C.divider}`,
                    borderRadius: "6px",
                    bgcolor: "#fcfdff",
                  }}
                >
                  <Typography sx={{ ...sectionTitleSx, mb: 1.2 }}>
                    Totals Summary
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />

                  {[
                    ["Subtotal", form.subtotal],
                    ["CGST", form.cgst_amount],
                    ["SGST", form.sgst_amount],
                    ["Total Tax", form.total_tax],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      display="flex"
                      justifyContent="space-between"
                      mb={0.7}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{toNumber(value).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    mt={1.3}
                    pt={1.4}
                    sx={{ borderTop: `2px solid ${C.divider}` }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
                      Total Amount:
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: "primary.main",
                      }}
                    >
                      ₹{toNumber(form.total_amount).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={0.7}>
                    <Typography variant="body2" color="success.main">
                      Amount Paid:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ₹{toNumber(form.amount_paid).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      Balance Due:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      ₹{toNumber(form.balance_due).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* ── NOTES ───────────────────────────────────────────────────── */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={sectionTitleSx}>Notes</Typography>
              </Box>
              <FormInput
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleBasicFieldChange}
                noDivider
                multiline
                rows={3}
                alignStart
                placeholder="Add internal notes about this bill…"
              />
            </Box>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <Box sx={footerSx}>
              <Button
                variant="outlined"
                onClick={() => navigate("/bills")}
                disabled={saving}
                sx={cancelBtnSx}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || checkingDuplicate || isArchived}
                startIcon={
                  saving || checkingDuplicate ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : null
                }
                sx={saveBtnSx}
              >
                {saving
                  ? "Saving..."
                  : checkingDuplicate
                  ? "Checking..."
                  : id
                  ? "Update"
                  : "Save"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditBill;
