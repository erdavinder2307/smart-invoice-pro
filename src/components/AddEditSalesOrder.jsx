import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Paper,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerSelect from './common/CustomerSelect';
import AppFormField from './common/form/AppFormField';
import FormLayout from './common/form/FormLayout';
import { AppSelect, C, ZohoRow, fieldSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import { useTranslation } from 'react-i18next';
import FormInput from './common/FormInput';
import useAutoFill from '../hooks/useAutoFill';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generateSalesOrderMockData } from '../utils/mockDataGenerators';

const statusOptions = ["Draft", "Confirmed", "Closed", "Invoiced", "Cancelled"];

const initialForm = {
  so_number: "",
  customer_id: "",
  order_date: "",
  delivery_date: "",
  payment_terms: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  status: "Draft",
  notes: "",
  terms_conditions: "",
  is_gst_applicable: false,
  subject: "",
  salesperson: "",
  items: [{ item_name: "", description: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const formFieldSx = {
  ...fieldSx,
  width: '100%',
};

const AddEditSalesOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();  const { t } = useTranslation();  const location = useLocation();
  const soId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const { applyAutoFill } = useAutoFill({
    setForm,
    generator: generateSalesOrderMockData,
    context: { customers },
    fillEmptyOnly: true,
  });

  useEffect(() => {
    // Fetch customers
    axios.get(createApiUrl("/api/customers")).then(res => {
      setCustomers(res.data);
      if (!soId) {
        const cloneSourceId = location.state?.cloneFrom?.id;
        // Fetch next SO number
        axios.get(createApiUrl("/api/sales-orders/next-number")).then(nextRes => {
          const today = new Date().toISOString().slice(0, 10);
          const nextNumber = nextRes.data.next_number || 'SO-001';
          if (cloneSourceId) {
            axios.get(createApiUrl(`/api/sales-orders/${cloneSourceId}`)).then(cloneRes => {
              const src = cloneRes.data;
              setForm(prev => ({
                ...prev,
                ...src,
                id: undefined,
                so_number: nextNumber,
                order_date: today,
                status: 'Draft',
              }));
            }).catch(() => {
              setForm(prev => ({ ...prev, so_number: nextNumber, order_date: today }));
            });
          } else {
            setForm(prev => ({ ...prev, so_number: nextNumber, order_date: today }));
          }
        }).catch(() => {
          const today = new Date().toISOString().slice(0, 10);
          setForm(prev => ({ ...prev, so_number: "SO-001", order_date: today }));
        });
      } else {
        // Fetch existing sales order
        axios.get(createApiUrl(`/api/sales-orders/${soId}`)).then(res2 => {
          const archived = String(res2.data?.lifecycle_status || res2.data?.status || '').toUpperCase() === 'ARCHIVED' || Boolean(res2.data?.is_deleted);
          setIsArchived(archived);
          setForm(res2.data);
        }).catch(err => {
          setError("Failed to load sales order");
          console.error(err);
        });
      }
    }).catch(err => {
      setError("Failed to load customers");
      console.error(err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soId]);

  // Calculate totals
  useEffect(() => {
    let subtotal = 0;
    form.items?.forEach(item => {
      const itemTotal = (item.quantity * item.rate - item.discount) * (1 + item.tax / 100);
      subtotal += itemTotal;
    });

    const total_tax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const total_amount = subtotal + total_tax;

    setForm(f => ({ ...f, subtotal, total_tax, total_amount }));
    // eslint-disable-next-line
  }, [form.items, form.cgst_amount, form.sgst_amount, form.igst_amount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isArchived) {
      setError("Archived sales orders are read-only. Restore the sales order to edit.");
      return;
    }
    setLoading(true);
    setError("");

    // Validation
    if (!form.customer_id) {
      setError("Please select a customer");
      setLoading(false);
      return;
    }

    if (form.delivery_date && new Date(form.delivery_date) < new Date(form.order_date)) {
      setError("Delivery date cannot be before order date");
      setLoading(false);
      return;
    }

    // Attach complete customer info
    const customer = customers.find(c => c.id === form.customer_id);
    const payload = {
      ...form,
      customer_name: customer ? (customer.name || customer.display_name || "") : "",
      customer_email: customer?.email || "",
      customer_phone: customer?.phone || customer?.mobile || ""
    };

    try {
      if (soId) {
        await axios.put(createApiUrl(`/api/sales-orders/${soId}`), payload);
      } else {
        await axios.post(createApiUrl("/api/sales-orders"), payload);
      }
      navigate("/sales-orders");
    } catch (err) {
      setError("Failed to save sales order: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <MainLayout title={id ? t('addEditSalesOrder.editTitle') : t('addEditSalesOrder.newTitle')}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Box sx={{ width: '100%', pt: 3 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          {isArchived && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '4px' }}>
              Archived sales orders are read-only. Restore this sales order before editing.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.25 }}>
            <DevAutoFillButton onClick={applyAutoFill} />
          </Box>

          <Paper
            component="form" onSubmit={handleSubmit}
            elevation={0}
            sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}
          >
            <Box sx={{ px: 3, py: 3, borderBottom: `1px solid ${C.divider}` }}>
              <FormLayout>
                <AppFormField label="Customer" required testId="sales-order-field-customer">
                  <CustomerSelect
                    customers={customers}
                    value={form.customer_id}
                    onChange={handleChange}
                    name="customer_id"
                    required
                  />
                </AppFormField>

                <AppFormField label="SO Number" required layout="half" testId="sales-order-field-number">
                  <TextField
                    name="so_number"
                    value={form.so_number}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    disabled={!!id}
                    sx={formFieldSx}
                  />
                </AppFormField>

                <AppFormField label="Status" required layout="half" testId="sales-order-field-status">
                  <AppSelect name="status" value={form.status} onChange={handleChange}>
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </AppSelect>
                </AppFormField>

                <AppFormField label="Order Date" required layout="half" testId="sales-order-field-order-date">
                  <TextField
                    name="order_date"
                    value={form.order_date}
                    onChange={handleChange}
                    type="date"
                    size="small"
                    fullWidth
                    sx={formFieldSx}
                  />
                </AppFormField>

                <AppFormField label="Delivery Date" layout="half" testId="sales-order-field-delivery-date">
                  <TextField
                    name="delivery_date"
                    value={form.delivery_date || ''}
                    onChange={handleChange}
                    type="date"
                    size="small"
                    fullWidth
                    sx={formFieldSx}
                  />
                </AppFormField>

                <AppFormField label="Payment Terms" layout="half" testId="sales-order-field-payment-terms">
                  <TextField
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    placeholder="e.g., Net 30"
                    sx={formFieldSx}
                  />
                </AppFormField>

                <AppFormField label="Salesperson" layout="half" testId="sales-order-field-salesperson">
                  <TextField
                    name="salesperson"
                    value={form.salesperson || ''}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    placeholder="Enter salesperson name"
                    sx={formFieldSx}
                  />
                </AppFormField>

                <AppFormField label="Subject" testId="sales-order-field-subject">
                  <TextField
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    placeholder="e.g., Office equipment order"
                    sx={formFieldSx}
                  />
                </AppFormField>
              </FormLayout>
            </Box>

            {/* ══ TAX INFORMATION ════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Tax Information
                </Typography>
              </Box>

              <ZohoRow label="GST Applicable" noDivider>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_gst_applicable"
                      checked={form.is_gst_applicable}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ZohoRow>

              {form.is_gst_applicable && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.25, minHeight: 52, borderBottom: `1px solid ${C.divider}` }}>
                    <Box sx={{ width: 180, minWidth: 180, flexShrink: 0, pr: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: C.label }}>CGST Amount</Typography>
                    </Box>
                    <TextField
                      name="cgst_amount" value={form.cgst_amount} onChange={handleChange}
                      type="number" size="small"
                      sx={{ ...fieldSx, width: 150 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.25, minHeight: 52, borderBottom: `1px solid ${C.divider}` }}>
                    <Box sx={{ width: 180, minWidth: 180, flexShrink: 0, pr: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: C.label }}>SGST Amount</Typography>
                    </Box>
                    <TextField
                      name="sgst_amount" value={form.sgst_amount} onChange={handleChange}
                      type="number" size="small"
                      sx={{ ...fieldSx, width: 150 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.25, minHeight: 52 }}>
                    <Box sx={{ width: 180, minWidth: 180, flexShrink: 0, pr: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: C.label }}>IGST Amount</Typography>
                    </Box>
                    <TextField
                      name="igst_amount" value={form.igst_amount} onChange={handleChange}
                      type="number" size="small"
                      sx={{ ...fieldSx, width: 150 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* ══ LINE ITEMS ════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Line Items</Typography>
                <Button startIcon={<AddIcon />} onClick={() => {
                  setForm({
                    ...form,
                    items: [...(form.items || []), { item_name: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }]
                  });
                }} size="small" sx={{ textTransform: 'none' }}>
                  Add Item
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Details</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell>Rate (₹)</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Tax %</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                      <TableCell align="center" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <TextField
                            size="small" fullWidth
                            placeholder="Enter item name"
                            value={item.item_name || ""}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].item_name = e.target.value;
                              setForm({ ...form, items: newItems });
                            }}
                            sx={fieldSx}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small" type="number" value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].quantity = parseInt(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0 }}
                            sx={{ ...fieldSx, width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small" type="number" value={item.rate}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].rate = parseFloat(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ ...fieldSx, width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small" type="number" value={item.discount}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].discount = parseFloat(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ ...fieldSx, width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small" type="number" value={item.tax}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].tax = parseFloat(e.target.value) || 0;
                              setForm({ ...form, items: newItems });
                            }}
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            sx={{ ...fieldSx, width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ₹{((item.quantity * item.rate - item.discount) * (1 + item.tax / 100)).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newItems = form.items.filter((_, i) => i !== idx);
                              setForm({ ...form, items: newItems.length > 0 ? newItems : [{ item_name: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }] });
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ══ TOTALS SUMMARY ════════════════════════════════════════ */}
            <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${C.divider}`, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Box sx={{ maxWidth: 400, ml: 'auto' }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Subtotal:</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>₹{form.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Total Tax:</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>₹{form.total_tax.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2} pt={2} sx={{ borderTop: '2px solid rgba(255,255,255,0.3)' }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>Total Amount:</Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>
                    ₹{form.total_amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ══ NOTES & TERMS ═════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Notes & Terms
                </Typography>
              </Box>

              <FormInput label="Customer Notes" name="notes" value={form.notes} onChange={handleChange}
                multiline rows={2} placeholder="Thank you for your business!" />

              <FormInput label="Terms & Conditions" noDivider name="terms_conditions" value={form.terms_conditions} onChange={handleChange}
                multiline rows={2} placeholder="Enter terms and conditions" />
            </Box>

            {/* ══ FOOTER ════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/sales-orders')} disabled={loading} sx={cancelBtnSx}>
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" disabled={loading || isArchived}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {loading ? 'Saving…' : id ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditSalesOrder;
