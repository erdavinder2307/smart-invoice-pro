import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box, Button, TextField, Typography, CircularProgress, Alert, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Paper
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { C, fieldSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import { useTranslation } from 'react-i18next';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import FormDatePicker from './common/FormDatePicker';
import useAutoFill from '../hooks/useAutoFill';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generatePurchaseOrderMockData } from '../utils/mockDataGenerators';

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
  status: "Draft",
  notes: "",
  subject: "",
  items: [{ item_name: "", quantity: 1, rate: 0, tax: 0, amount: 0 }],
};

const AddEditPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();  const { t } = useTranslation();  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { applyAutoFill } = useAutoFill({
    setForm,
    generator: generatePurchaseOrderMockData,
    context: { vendors },
    fillEmptyOnly: true,
  });

  const fetchVendors = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/vendors"));
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  const fetchNextPONumber = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/purchase-orders/next-number"));
      setForm(prev => ({ ...prev, po_number: response.data.next_number }));
    } catch (error) {
      setForm(prev => ({ ...prev, po_number: "PO-001" }));
    }
  };

  const fetchPO = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl(`/api/purchase-orders/${id}`));
      setForm(response.data);
    } catch (error) {
      setError("Failed to fetch purchase order");
      console.error(error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchVendors();
    if (id) {
      fetchPO();
    } else {
      const cloneSourceId = location.state?.cloneFrom?.id;
      if (cloneSourceId) {
        Promise.all([
          axios.get(createApiUrl('/api/purchase-orders/next-number')).catch(() => ({ data: { next_number: 'PO-001' } })),
          axios.get(createApiUrl(`/api/purchase-orders/${cloneSourceId}`)),
        ]).then(([nextRes, cloneRes]) => {
          const today = new Date().toISOString().slice(0, 10);
          setForm({ ...cloneRes.data, id: undefined, po_number: nextRes.data.next_number, order_date: today, status: 'Draft' });
        }).catch(() => {
          fetchNextPONumber();
          const today = new Date().toISOString().slice(0, 10);
          setForm(prev => ({ ...prev, order_date: today }));
        });
      } else {
        fetchNextPONumber();
        const today = new Date().toISOString().slice(0, 10);
        setForm(prev => ({ ...prev, order_date: today }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchPO]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    
    // Calculate item amount
    const quantity = parseFloat(items[index].quantity) || 0;
    const rate = parseFloat(items[index].rate) || 0;
    const tax = parseFloat(items[index].tax) || 0;
    const itemSubtotal = quantity * rate;
    const taxAmount = (itemSubtotal * tax) / 100;
    items[index].amount = itemSubtotal + taxAmount;

    setForm(prev => ({ ...prev, items }));
    recalculateTotals(items);
  };

  const recalculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);

    const totalTax = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const tax = parseFloat(item.tax) || 0;
      return sum + ((quantity * rate * tax) / 100);
    }, 0);

    const totalAmount = subtotal + totalTax;

    setForm(prev => ({
      ...prev,
      subtotal,
      total_tax: totalTax,
      cgst_amount: totalTax / 2,
      sgst_amount: totalTax / 2,
      igst_amount: 0,
      total_amount: totalAmount
    }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { item_name: "", quantity: 1, rate: 0, tax: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, items }));
    recalculateTotals(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (id) {
        await axios.put(createApiUrl(`/api/purchase-orders/${id}`), form);
      } else {
        await axios.post(createApiUrl("/api/purchase-orders"), form);
      }
      navigate("/purchase-orders");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save purchase order");
      console.error(error);
    }
    setSaving(false);
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
    <MainLayout title={id ? t('addEditPurchaseOrder.editTitle') : t('addEditPurchaseOrder.newTitle')}>
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="lg" sx={{ pt: 3 }}>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
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
            {/* ══ PURCHASE ORDER INFORMATION ════════════════════════════ */}
            <Box sx={{ px: 3 }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Purchase Order Information
                </Typography>
              </Box>

              <FormInput label="PO Number" required name="po_number" value={form.po_number} onChange={handleChange}
                sx={{ maxWidth: 240 }} />

              <FormSelect label="Vendor" required name="vendor_id" value={form.vendor_id} onChange={handleChange}
                options={vendors.map(v => ({ value: v.id, label: v.vendor_name }))} width={300} />

              <FormDatePicker label="Order Date" required name="order_date" value={form.order_date} onChange={handleChange} />

              <FormDatePicker label="Delivery Date" name="delivery_date" value={form.delivery_date} onChange={handleChange} />

              <FormInput label="Subject" noDivider name="subject" value={form.subject} onChange={handleChange} />
            </Box>


            {/* ══ ITEMS ═════════════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>Items</Typography>
                <Button startIcon={<AddIcon />} onClick={addItem} size="small" sx={{ textTransform: 'none' }}>
                  Add Item
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Tax %</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={item.item_name}
                            onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                            size="small" fullWidth sx={fieldSx}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number" value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            size="small" sx={{ ...fieldSx, width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number" value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            size="small" sx={{ ...fieldSx, width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number" value={item.tax}
                            onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                            size="small" sx={{ ...fieldSx, width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ₹{item.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {form.items.length > 1 && (
                            <IconButton size="small" onClick={() => removeItem(index)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ══ TOTALS SUMMARY ════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}`, py: 2 }}>
              <Box sx={{ maxWidth: 320, ml: 'auto' }}>
                {[
                  ['Subtotal', form.subtotal],
                  ['CGST', form.cgst_amount],
                  ['SGST', form.sgst_amount],
                  ['Total Tax', form.total_tax],
                ].map(([label, value]) => (
                  <Box key={label} display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">{label}:</Typography>
                    <Typography variant="body2" fontWeight={600}>₹{(value || 0).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Box display="flex" justifyContent="space-between" mt={1.5} pt={1.5} sx={{ borderTop: `2px solid ${C.divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Total Amount:</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'primary.main' }}>
                    ₹{(form.total_amount || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ══ STATUS & NOTES ════════════════════════════════════════ */}
            <Box sx={{ px: 3, borderTop: `1px solid ${C.divider}` }}>
              <Box sx={{ py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#333' }}>
                  Status & Notes
                </Typography>
              </Box>

              <FormSelect label="Status" name="status" value={form.status} onChange={handleChange}
                options={['Draft', 'Sent', 'Confirmed', 'Received', 'Billed', 'Closed'].map(s => ({ value: s, label: s }))} width={220} />

              <FormInput label="Notes" noDivider name="notes" value={form.notes} onChange={handleChange}
                multiline rows={3} placeholder="Add any internal notes about this PO…" />
            </Box>

            {/* ══ FOOTER ════════════════════════════════════════════════ */}
            <Box sx={footerSx}>
              <Button variant="outlined" onClick={() => navigate('/purchase-orders')} disabled={saving} sx={cancelBtnSx}>
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={saveBtnSx}
              >
                {saving ? 'Saving…' : id ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AddEditPurchaseOrder;
