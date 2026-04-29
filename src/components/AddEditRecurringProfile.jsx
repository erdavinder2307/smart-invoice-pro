import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box,
  Button,
  TextField,
  MenuItem,
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
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import { C, ZohoRow, AppSelect, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import { useTranslation } from 'react-i18next';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import FormDatePicker from './common/FormDatePicker';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerSelect from './common/CustomerSelect';
import useAutoFill from '../hooks/useAutoFill';
import DevAutoFillButton from './common/DevAutoFillButton';
import { generateRecurringProfileMockData } from '../utils/mockDataGenerators';

const frequencyOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
const statusOptions = ["Active", "Paused", "Expired", "Stopped"];
const paymentTermsOptions = ["Due on Receipt", "Net 15", "Net 30", "Net 45"];
const taxOptions = [0, 5, 12, 18, 28];

const initialForm = {
  profile_name: "",
  customer_id: "",
  frequency: "Monthly",
  start_date: "",
  end_date: "",
  occurrence_limit: "",
  occurrences_created: 0,
  next_run_date: "",
  last_run_date: null,
  status: "Active",
  email_reminder: false,
  payment_terms: "Net 30",
  notes: "",
  terms_conditions: "",
  is_gst_applicable: false,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  items: [{ name: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};



const itemAmount = (item) => ((item.quantity * item.rate - item.discount) * (1 + item.tax / 100));

const AddEditRecurringProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const profileId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { applyAutoFill } = useAutoFill({
    setForm,
    generator: generateRecurringProfileMockData,
    context: { customers },
    fillEmptyOnly: true,
  });

  useEffect(() => {
    // Fetch customers
    axios.get(createApiUrl("/api/customers")).then(res => {
      setCustomers(res.data);
      if (!profileId) {
        // Set default dates for new profile
        const today = new Date().toISOString().slice(0, 10);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().slice(0, 10);
        setForm(prev => ({ 
          ...prev, 
          start_date: today,
          next_run_date: nextMonthStr
        }));
      } else {
        // Fetch existing profile
        axios.get(createApiUrl(`/api/recurring-profiles/${profileId}`)).then(res2 => {
          setForm(res2.data);
        }).catch(err => {
          setError("Failed to load recurring profile");
          console.error(err);
        });
      }
    }).catch(err => {
      setError("Failed to load customers");
      console.error(err);
    });
  }, [profileId]);

  // Calculate totals
  useEffect(() => {
    let subtotal = 0;
    form.items?.forEach(item => {
      const itemTotal = (item.quantity * item.rate - item.discount);
      subtotal += itemTotal;
    });

    setForm(f => ({ ...f, subtotal }));
    // eslint-disable-next-line
  }, [form.items]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.customer_id) {
      setError("Please select a customer");
      setLoading(false);
      return;
    }

    if (!form.profile_name) {
      setError("Please enter a profile name");
      setLoading(false);
      return;
    }

    if (form.end_date && new Date(form.end_date) <= new Date(form.start_date)) {
      setError("End date must be after start date");
      setLoading(false);
      return;
    }

    // Get customer details
    const customer = customers.find(c => c.id === form.customer_id);
    const formData = {
      ...form,
      customer_name: customer?.name || "",
      customer_email: customer?.email || "",
      customer_phone: customer?.phone || ""
    };

    try {
      if (profileId) {
        await axios.put(createApiUrl(`/api/recurring-profiles/${profileId}`), formData);
      } else {
        await axios.post(createApiUrl("/api/recurring-profiles"), formData);
      }
      navigate("/recurring-profiles");
    } catch (err) {
      setError("Failed to save recurring profile: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
    setLoading(false);
  };

  const updateItem = (idx, key, value) => {
    const newItems = [...(form.items || [])];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...(form.items || []), { name: '', quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
    });
  };

  const removeItem = (idx) => {
    const next = (form.items || []).filter((_, i) => i !== idx);
    setForm({ ...form, items: next.length ? next : [{ name: '', quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }] });
  };

  const subtotal = Number(form.subtotal || 0);
  const gstTotal = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
  const grandTotal = subtotal + gstTotal;

  return (
    <MainLayout>
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: 1.5 }}>
        <Box sx={{ maxWidth: 1020, px: { xs: 1, md: 1.5 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '4px' }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} autoComplete="off" sx={{ bgcolor: '#fff' }}>
            <Box sx={{ px: 0.5, pt: 0.25, pb: 1.5, borderBottom: `1px solid ${C.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 500, color: '#151a25', textAlign: 'left' }}>
                {profileId ? t('addEditRecurringProfile.editTitle') : t('addEditRecurringProfile.newTitle')}
              </Typography>
              <DevAutoFillButton onClick={applyAutoFill} />
            </Box>

            <Box sx={{ px: 0.5 }}>
            <ZohoRow label="Customer Name" required>
              <CustomerSelect
                customers={customers}
                value={form.customer_id}
                onChange={handleChange}
                name="customer_id"
                required
              />
            </ZohoRow>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: 2, py: 2, borderBottom: `1px solid ${C.divider}` }}>
              <FormInput label="Profile Name" required noDivider name="profile_name" value={form.profile_name} onChange={handleChange}
                sx={{ width: 240 }} />

              <FormSelect label="Repeat Every" required noDivider name="frequency" value={form.frequency} onChange={handleChange}
                options={frequencyOptions.map(f => ({ value: f, label: f }))} width={240} />

              <FormDatePicker label="Start On" required noDivider name="start_date" value={form.start_date} onChange={handleChange} />

              <ZohoRow label="Ends On" noDivider>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <TextField
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    size="small"
                    sx={{ ...fieldSx, width: 160 }}
                  />
                  <Typography sx={{ fontSize: '0.8125rem', color: '#374151', minWidth: 100 }}>Occurrence Limit</Typography>
                  <TextField
                    name="occurrence_limit"
                    type="number"
                    value={form.occurrence_limit}
                    onChange={handleChange}
                    size="small"
                    placeholder=""
                    inputProps={{ min: 1 }}
                    sx={{ ...fieldSx, width: 120 }}
                  />
                </Box>
              </ZohoRow>

              <FormSelect label="Payment Terms" noDivider name="payment_terms" value={form.payment_terms} onChange={handleChange}
                options={paymentTermsOptions.map(t => ({ value: t, label: t }))} width={240} />

              <FormSelect label="Status" noDivider name="status" value={form.status} onChange={handleChange}
                options={statusOptions.map(s => ({ value: s, label: s }))} width={240} />
            </Box>

            <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1, bgcolor: '#f5f7fb', border: `1px solid ${C.border}`, borderBottom: 'none', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#1f2937' }}>Item Table</Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', fontSize: '0.78rem', p: 0 }}>Bulk Actions</Button>
                </Box>
              </Box>

              <TableContainer sx={{ border: `1px solid ${C.border}`, borderTop: 'none', overflowX: 'auto' }}>
                <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafbfd' }}>
                      <TableCell align="left" sx={{ width: '45%', fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8, px: 2, textAlign: 'left' }}>ITEM DETAILS</TableCell>
                      <TableCell sx={{ width: 90, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>QUANTITY</TableCell>
                      <TableCell sx={{ width: 90, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>RATE</TableCell>
                      <TableCell sx={{ width: 80, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>DISCOUNT</TableCell>
                      <TableCell sx={{ width: 105, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>TAX</TableCell>
                      <TableCell align="right" sx={{ width: 95, fontSize: '0.69rem', fontWeight: 700, color: '#687385', py: 0.8 }}>AMOUNT</TableCell>
                      <TableCell sx={{ width: 40, py: 0.8 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(form.items || []).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ py: 0, px: 2, borderColor: C.divider, textAlign: 'left' }}>
                          <TextField
                            size="small"
                            value={item.name || ''}
                            onChange={(e) => updateItem(idx, 'name', e.target.value)}
                            placeholder="Type or click to select an item."
                            sx={{ ...fieldSx, width: '100%' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0, borderColor: C.divider }}>
                          <TextField size="small" type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value, 10) || 0)} inputProps={{ min: 0 }} sx={{ ...fieldSx, width: '100%' }} />
                        </TableCell>
                        <TableCell sx={{ py: 0, borderColor: C.divider }}>
                          <TextField size="small" type="number" value={item.rate} onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.01 }} sx={{ ...fieldSx, width: '100%' }} />
                        </TableCell>
                        <TableCell sx={{ py: 0, borderColor: C.divider }}>
                          <TextField size="small" type="number" value={item.discount} onChange={(e) => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)} inputProps={{ min: 0, step: 0.01 }} sx={{ ...fieldSx, width: '100%' }} />
                        </TableCell>
                        <TableCell sx={{ py: 0, borderColor: C.divider }}>
                          <AppSelect name={`tax-${idx}`} value={Number(item.tax) || 0} onChange={(e) => updateItem(idx, 'tax', Number(e.target.value) || 0)}>
                            {taxOptions.map((tax) => <MenuItem key={tax} value={tax} sx={menuItemSx}>{tax}%</MenuItem>)}
                          </AppSelect>
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#161f2f', borderColor: C.divider }}>
                          {itemAmount(item).toFixed(2)}
                        </TableCell>
                        <TableCell align="center" sx={{ borderColor: C.divider }}>
                          <Tooltip title="Remove row">
                            <IconButton size="small" onClick={() => removeItem(idx)} sx={{ color: '#f87171', '&:hover': { color: '#ef4444' } }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mt: 1.4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                    onClick={addItem}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      px: 1,
                      py: 0.35,
                      minHeight: 28,
                      lineHeight: 1,
                      borderRadius: '4px',
                      border: '1px solid #d8dee9',
                      bgcolor: '#f7f9fc',
                      color: '#2563eb',
                      '&:hover': { bgcolor: '#eef2f8', borderColor: '#cfd8e6' },
                    }}
                  >
                    Add New Row
                  </Button>
                  <Button
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      px: 1,
                      py: 0.35,
                      minHeight: 28,
                      lineHeight: 1,
                      borderRadius: '4px',
                      border: '1px solid #d8dee9',
                      bgcolor: '#f7f9fc',
                      color: '#2563eb',
                      '&:hover': { bgcolor: '#eef2f8', borderColor: '#cfd8e6' },
                    }}
                  >
                    Add Items in Bulk
                  </Button>
                </Box>

                <Paper variant="outlined" sx={{ p: 1.5, width: { xs: '100%', sm: 360 }, borderColor: C.divider, bgcolor: '#fafbfd' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.84rem', color: '#1f2937', fontWeight: 600 }}>Sub Total</Typography>
                    <Typography sx={{ fontSize: '0.84rem', color: '#111827', fontWeight: 700 }}>{subtotal.toFixed(2)}</Typography>
                  </Box>

                  <Box sx={{ mb: 1.2 }}>
                    <FormControlLabel
                      control={<Checkbox checked={form.is_gst_applicable} onChange={handleChange} name="is_gst_applicable" size="small" />}
                      label={<Typography sx={{ fontSize: '0.8rem' }}>GST Applicable</Typography>}
                    />
                  </Box>

                  {form.is_gst_applicable && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 1.2 }}>
                      <TextField size="small" label="CGST" type="number" value={form.cgst_amount} onChange={(e) => setForm({ ...form, cgst_amount: parseFloat(e.target.value) || 0 })} inputProps={{ min: 0, step: 0.01 }} sx={fieldSx} />
                      <TextField size="small" label="SGST" type="number" value={form.sgst_amount} onChange={(e) => setForm({ ...form, sgst_amount: parseFloat(e.target.value) || 0 })} inputProps={{ min: 0, step: 0.01 }} sx={fieldSx} />
                      <TextField size="small" label="IGST" type="number" value={form.igst_amount} onChange={(e) => setForm({ ...form, igst_amount: parseFloat(e.target.value) || 0 })} inputProps={{ min: 0, step: 0.01 }} sx={fieldSx} />
                    </Box>
                  )}

                  <Divider sx={{ borderColor: C.divider, my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '1.03rem', fontWeight: 700, color: '#111827' }}>Total (₹)</Typography>
                    <Typography sx={{ fontSize: '1.03rem', fontWeight: 700, color: '#111827' }}>{grandTotal.toFixed(2)}</Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>

            <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}` }}>
              <Box sx={{ ml: 0, pl: 0 }}>
                <Typography sx={{ fontSize: '0.8125rem', color: '#2f3a4d', mb: 1.5, textAlign: 'left' }}>Customer Notes</Typography>
                <Box sx={{ ml: 0, pl: 0, width: '100%' }}>
                  <TextField
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="Thank you for the payment. You just made our day."
                    sx={{ ...fieldSx, width: '100%', ml: 0, '& .MuiInputBase-input': { textAlign: 'left' } }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: '#8b95a6', mt: 1.5, textAlign: 'left' }}>Will be displayed on the invoice</Typography>
              </Box>
            </Box>

            <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}`, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 460px' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: '#2f3a4d', mb: 0.8 }}>Terms & Conditions</Typography>
                <TextField
                  name="terms_conditions"
                  value={form.terms_conditions}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                  sx={{ ...fieldSx, width: '100%' }}
                />
              </Box>

              <Box sx={{ width: { xs: '100%', md: 280 } }}>
                <FormControlLabel
                  sx={{ mt: 0 }}
                  control={<Checkbox checked={form.email_reminder} onChange={handleChange} name="email_reminder" size="small" />}
                  label={<Typography sx={{ fontSize: '0.8rem' }}>Send email reminder when invoice is generated</Typography>}
                />
              </Box>
            </Box>
            </Box>

            <Box sx={{ ...footerSx, justifyContent: 'space-between', px: 0, bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button type="submit" variant="contained" disabled={loading} sx={saveBtnSx}>
                  {loading ? <CircularProgress size={18} color="inherit" /> : (profileId ? 'Update Profile' : 'Create Profile')}
                </Button>
                <Button type="button" variant="outlined" sx={cancelBtnSx} onClick={() => navigate('/recurring-profiles')}>
                  Cancel
                </Button>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>
                  Total Amount: ₹ {grandTotal.toFixed(2)}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Total Quantity: {(form.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditRecurringProfile;
