import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { createInvoice, updateInvoice } from '../services/invoiceService';
import { createApiUrl } from '../config/api';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { C, AppSelect, fieldSx, menuItemSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';

const paymentTermsOptions = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45'];
const taxOptions = [0, 5, 12, 18, 28];
const tdsTaxOptions = [
  'Salary [as per slab] (Sec 192)',
  'Interest on securities [10%] (Sec 193)',
  'Dividend [10%] (Sec 194)',
  'Interest other than securities [10%] (Sec 194A)',
  'Winnings from lottery/crossword [30%] (Sec 194B)',
  'Winnings from horse race [30%] (Sec 194BB)',
  'Contractor payments [1% Individual/HUF, 2% Others] (Sec 194C)',
  'Insurance commission [5%] (Sec 194D)',
  'Life insurance payout [5% on income component] (Sec 194DA)',
  'NSS withdrawals [10%] (Sec 194EE)',
  'Commission on sale of lottery tickets [5%] (Sec 194G)',
  'Commission or brokerage [5%] (Sec 194H)',
  'Rent - plant/machinery [2%] (Sec 194I)',
  'Rent - land/building/furniture [10%] (Sec 194I)',
  'Professional/technical fees [10%] (Sec 194J)',
  'Royalty [10%] (Sec 194J)',
  'Non-compete fees [10%] (Sec 194J)',
  'Compensation on immovable property [10%] (Sec 194LA)',
  'Payment on transfer of immovable property [1%] (Sec 194IA)',
  'Rent by certain individuals/HUF [5%] (Sec 194IB)',
  'Payments by e-commerce operator [1%] (Sec 194O)',
  'Purchase of goods [0.1%] (Sec 194Q)',
  'Benefit or perquisite in business/profession [10%] (Sec 194R)',
  'Virtual digital assets transfer [1%] (Sec 194S)',
];
const tcsTaxOptions = [
  'Sale of Goods [0.1%]',
  'Sale of Timber [2.5%]',
  'Alcoholic Liquor [1%]',
  'Forest Produce [2.5%]',
  'Scrap [1%]',
];

const initialForm = {
  invoice_number: '', customer_id: '', issue_date: '', due_date: '',
  payment_terms: '', subtotal: 0, cgst_amount: 0, sgst_amount: 0,
  igst_amount: 0, total_tax: 0, total_amount: 0, amount_paid: 0,
  balance_due: 0, status: 'Draft', payment_mode: '', notes: '',
  terms_conditions: '', is_gst_applicable: true,
  invoice_type: 'Tax Invoice', subject: '', salesperson: '',
  items: [{ name: '', quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const rowLabelSx = {
  width: 170,
  minWidth: 170,
  pr: 2,
  fontSize: '0.8125rem',
  color: '#2d3748',
  lineHeight: 1.4,
};

const tableInputSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    borderRadius: 0,
    bgcolor: '#fff',
  },
  '& .MuiInputBase-input': {
    fontSize: '0.8125rem',
    py: '7px',
    px: '8px',
    textAlign: 'left',
  },
};

const CellField = ({ value, onChange, type = 'number', width = 90, inputProps, placeholder }) => (
  <TextField
    size="small"
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    inputProps={inputProps}
    sx={{ ...tableInputSx, width }}
  />
);

const AddEditInvoice = ({ onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [adjustment, setAdjustment] = useState('0');
  const [submitMode, setSubmitMode] = useState('send');
  const [tdsMode, setTdsMode] = useState('tds');
  const [tdsTaxOption, setTdsTaxOption] = useState('');
  const [tcsTaxOption, setTcsTaxOption] = useState('');
  const formRef = useRef(null);

  const activeWithholdingOptions = tdsMode === 'tds' ? tdsTaxOptions : tcsTaxOptions;
  const activeWithholdingValue = tdsMode === 'tds' ? tdsTaxOption : tcsTaxOption;

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setPageLoading(true);
        const customersResponse = await axios.get(createApiUrl('/api/customers'));
        if (!active) return;

        setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);

        if (invoiceId) {
          const invoiceResponse = await axios.get(createApiUrl(`/api/invoices/${invoiceId}`));
          if (!active) return;

          setForm((prev) => ({
            ...prev,
            ...invoiceResponse.data,
            items: Array.isArray(invoiceResponse.data?.items) && invoiceResponse.data.items.length
              ? invoiceResponse.data.items.map((item) => ({ ...initialForm.items[0], ...item }))
              : [...initialForm.items],
          }));
        } else {
          const today = new Date().toISOString().slice(0, 10);
          try {
            const nextNumberResponse = await axios.get(createApiUrl('/api/invoices/next-number'));
            if (!active) return;

            setForm((prev) => ({
              ...prev,
              invoice_number: nextNumberResponse.data?.next_invoice_number || 'INV-000001',
              issue_date: today,
              due_date: today,
              payment_terms: 'Due on Receipt',
              status: 'Draft',
            }));
          } catch {
            if (!active) return;
            setForm((prev) => ({
              ...prev,
              invoice_number: 'INV-000001',
              issue_date: today,
              due_date: today,
              payment_terms: 'Due on Receipt',
              status: 'Draft',
            }));
          }
        }
      } catch {
        if (active) setError('Failed to load invoice details.');
      } finally {
        if (active) setPageLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [invoiceId]);

  useEffect(() => {
    const lineSubtotal = (form.items || []).reduce((sum, item) => {
      const baseAmount = Math.max(0, (Number(item.quantity) || 0) * (Number(item.rate) || 0) - (Number(item.discount) || 0));
      return sum + baseAmount;
    }, 0);

    const lineTax = (form.items || []).reduce((sum, item) => {
      const baseAmount = Math.max(0, (Number(item.quantity) || 0) * (Number(item.rate) || 0) - (Number(item.discount) || 0));
      return sum + (baseAmount * (Number(item.tax) || 0)) / 100;
    }, 0);

    const manualTax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const totalTax = form.is_gst_applicable ? lineTax + manualTax : 0;
    const adjustedTotal = lineSubtotal + totalTax + Number(adjustment || 0);
    const balanceDue = adjustedTotal - Number(form.amount_paid || 0);

    setForm((prev) => {
      if (
        Number(prev.subtotal) === Number(lineSubtotal)
        && Number(prev.total_tax) === Number(totalTax)
        && Number(prev.total_amount) === Number(adjustedTotal)
        && Number(prev.balance_due) === Number(balanceDue)
      ) {
        return prev;
      }

      return {
        ...prev,
        subtotal: lineSubtotal,
        total_tax: totalTax,
        total_amount: adjustedTotal,
        balance_due: balanceDue,
      };
    });
  }, [adjustment, form.amount_paid, form.cgst_amount, form.igst_amount, form.is_gst_applicable, form.items, form.sgst_amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm((prev) => ({ ...prev, items }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...(prev.items || []), { ...initialForm.items[0] }],
    }));
  };

  const removeItem = (idx) => {
    const items = form.items.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, items: items.length ? items : [{ ...initialForm.items[0] }] }));
  };

  const itemTotal = (item) => {
    const baseAmount = Math.max(0, (Number(item.quantity) || 0) * (Number(item.rate) || 0) - (Number(item.discount) || 0));
    const taxAmount = form.is_gst_applicable ? (baseAmount * (Number(item.tax) || 0)) / 100 : 0;
    return baseAmount + taxAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const nextStatus = submitMode === 'draft'
        ? 'Draft'
        : (form.status === 'Paid' || form.status === 'Cancelled' ? form.status : 'Issued');

      const payload = {
        ...form,
        status: nextStatus,
        items: (form.items || []).map((item) => ({
          ...item,
          amount: itemTotal(item),
        })),
      };

      if (invoiceId) {
        await updateInvoice(invoiceId, payload);
      } else {
        await createInvoice(payload);
      }

      if (onSuccess) onSuccess();
      navigate('/invoices');
    } catch {
      setError('Failed to save invoice');
    }

    setLoading(false);
  };

  return (
    <MainLayout>
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: 1.5 }}>
        <Box sx={{ maxWidth: 1020, px: { xs: 1, md: 1.5 } }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            ref={formRef}
            onSubmit={handleSubmit}
            autoComplete="off"
            sx={{ bgcolor: '#fff', overflow: 'hidden' }}
          >
            {pageLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                <Box sx={{ px: 0.5, pt: 0.25, pb: 1.5, borderBottom: `1px solid ${C.divider}` }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 500, color: '#151a25', textAlign: 'left' }}>
                    {invoiceId ? 'Edit Invoice' : 'New Invoice'}
                  </Typography>
                </Box>

                <Box sx={{ px: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${C.divider}` }}>
                    <Typography sx={{ ...rowLabelSx, color: '#e53935' }}>Customer Name*</Typography>
                    <Box sx={{ flex: 1, maxWidth: 600, display: 'flex', gap: 0.8 }}>
                      <AppSelect
                        name="customer_id"
                        value={form.customer_id}
                        onChange={handleChange}
                        displayEmpty
                      >
                        <MenuItem value="" sx={{ ...menuItemSx, color: C.hint }}>Select or add a customer</MenuItem>
                        {customers.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id} sx={menuItemSx}>
                            {customer.name}
                          </MenuItem>
                        ))}
                      </AppSelect>
                      <IconButton
                        size="small"
                        sx={{
                          alignSelf: 'center',
                          border: '1px solid #d2d8e3',
                          borderRadius: '4px',
                          width: 34,
                          height: 34,
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 18, color: '#516173' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      columnGap: 2,
                      rowGap: 1.2,
                      py: 2,
                      borderBottom: `1px solid ${C.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <Typography sx={{ ...rowLabelSx, color: '#e53935' }}>Invoice#*</Typography>
                      <TextField
                        value={form.invoice_number}
                        size="small"
                        InputProps={{ readOnly: true }}
                        sx={{ ...fieldSx, width: 240, '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <Typography sx={rowLabelSx}>Order Number</Typography>
                      <TextField
                        size="small"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        sx={{ ...fieldSx, width: 240 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <Typography sx={{ ...rowLabelSx, color: '#e53935' }}>Invoice Date*</Typography>
                      <TextField
                        name="issue_date"
                        value={form.issue_date}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        sx={{ ...fieldSx, width: 240 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                      <Typography sx={rowLabelSx}>Terms</Typography>
                      <Box sx={{ width: 160 }}>
                        <AppSelect name="payment_terms" value={form.payment_terms} onChange={handleChange}>
                          {paymentTermsOptions.map((term) => (
                            <MenuItem key={term} value={term} sx={menuItemSx}>{term}</MenuItem>
                          ))}
                        </AppSelect>
                      </Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#374151', minWidth: 62 }}>Due Date</Typography>
                      <TextField
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                        type="date"
                        size="small"
                        sx={{ ...fieldSx, width: 166 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${C.divider}` }}>
                    <Typography sx={rowLabelSx}>Salesperson</Typography>
                    <TextField
                      name="salesperson"
                      value={form.salesperson}
                      onChange={handleChange}
                      size="small"
                      placeholder="Select or Add Salesperson"
                      sx={{ ...fieldSx, width: 240 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: `1px solid ${C.divider}` }}>
                    <Typography sx={rowLabelSx}>Subject</Typography>
                    <TextField
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      size="small"
                      placeholder="Let your customer know what this invoice is for"
                      sx={{ ...fieldSx, width: 520, maxWidth: '100%' }}
                    />
                  </Box>

                  <Box sx={{ py: 3, borderBottom: `1px solid ${C.divider}` }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      bgcolor: '#f5f7fb',
                      border: `1px solid ${C.border}`,
                      borderBottom: 'none',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                    }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#1f2937' }}>Item Table</Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', fontSize: '0.78rem', p: 0 }}>Scan Item</Button>
                        <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', fontSize: '0.78rem', p: 0 }}>Bulk Actions</Button>
                      </Box>
                    </Box>

                    <TableContainer sx={{ border: `1px solid ${C.border}`, borderTop: 'none', overflowX: 'hidden' }}>
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
                                <CellField
                                  type="text"
                                  value={item.name || ''}
                                  placeholder="Type or click to select an item."
                                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                  width="100%"
                                />
                              </TableCell>

                              <TableCell sx={{ py: 0, borderColor: C.divider }}>
                                <CellField
                                  value={item.quantity}
                                  inputProps={{ min: 0, step: 1 }}
                                  onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                  width="100%"
                                />
                              </TableCell>

                              <TableCell sx={{ py: 0, borderColor: C.divider }}>
                                <CellField
                                  value={item.rate}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                                  width="100%"
                                />
                              </TableCell>

                              <TableCell sx={{ py: 0, borderColor: C.divider }}>
                                <CellField
                                  value={item.discount}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  onChange={(e) => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                                  width="100%"
                                />
                              </TableCell>

                              <TableCell sx={{ py: 0, borderColor: C.divider }}>
                                <AppSelect
                                  name={`tax-${idx}`}
                                  value={Number(item.tax) || 0}
                                  onChange={(e) => updateItem(idx, 'tax', Number(e.target.value) || 0)}
                                >
                                  {taxOptions.map((tax) => (
                                    <MenuItem key={tax} value={tax} sx={menuItemSx}>{tax}%</MenuItem>
                                  ))}
                                </AppSelect>
                              </TableCell>

                              <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#161f2f', borderColor: C.divider }}>
                                {itemTotal(item).toFixed(2)}
                              </TableCell>

                              <TableCell align="center" sx={{ borderColor: C.divider }}>
                                <Tooltip title="Remove row">
                                  <IconButton
                                    size="small"
                                    onClick={() => removeItem(idx)}
                                    sx={{ color: '#f87171', '&:hover': { color: '#ef4444' } }}
                                  >
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
                          <Typography sx={{ fontSize: '0.84rem', color: '#111827', fontWeight: 700 }}>{Number(form.subtotal || 0).toFixed(2)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <RadioGroup row value={tdsMode} onChange={(e) => setTdsMode(e.target.value)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.6 }}>
                              <Radio size="small" value="tds" sx={{ p: 0.3 }} />
                              <Typography sx={{ fontSize: '0.8rem' }}>TDS</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Radio size="small" value="tcs" sx={{ p: 0.3 }} />
                              <Typography sx={{ fontSize: '0.8rem' }}>TCS</Typography>
                            </Box>
                          </RadioGroup>
                          <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>- 0.00</Typography>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Autocomplete
                            size="small"
                            options={activeWithholdingOptions}
                            value={activeWithholdingValue || null}
                            onChange={(_, selectedOption) => {
                              if (tdsMode === 'tds') {
                                setTdsTaxOption(selectedOption || '');
                              } else {
                                setTcsTaxOption(selectedOption || '');
                              }
                            }}
                            isOptionEqualToValue={(option, value) => option === value}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Search or select a Tax"
                                sx={fieldSx}
                              />
                            )}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <TextField
                            size="small"
                            value="Adjustment"
                            InputProps={{ readOnly: true }}
                            sx={{ ...fieldSx, width: 120 }}
                          />
                          <TextField
                            size="small"
                            value={adjustment}
                            onChange={(e) => setAdjustment(e.target.value)}
                            type="number"
                            sx={{ ...fieldSx, width: 120 }}
                          />
                        </Box>

                        <Divider sx={{ borderColor: C.divider, my: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: '1.03rem', fontWeight: 700, color: '#111827' }}>Total (₹)</Typography>
                          <Typography sx={{ fontSize: '1.03rem', fontWeight: 700, color: '#111827' }}>
                            {Number(form.total_amount || 0).toFixed(2)}
                          </Typography>
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
                      <Typography sx={{ fontSize: '0.8125rem', color: '#2f3a4d', mb: 0.8 }}>Attach File(s) to Invoice</Typography>
                      <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>Upload File</Button>
                      <Typography sx={{ fontSize: '0.72rem', color: '#8b95a6', mt: 0.8 }}>
                        You can upload a maximum of 10 files, 10MB each
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '0.79rem', color: '#111827' }}>Select an online payment option to get paid faster</Typography>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Razorpay</Button>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Zoho Payments</Button>
                    </Box>
                  </Box>
                </Box>

                  <Box sx={{ ...footerSx, justifyContent: 'space-between', px: 0, bgcolor: '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      disabled={loading}
                      sx={cancelBtnSx}
                      onClick={() => {
                        setSubmitMode('draft');
                        formRef.current?.requestSubmit();
                      }}
                    >
                      Save as Draft
                    </Button>

                    <Button
                      type="button"
                      variant="contained"
                      disabled={loading}
                      sx={saveBtnSx}
                      onClick={() => {
                        setSubmitMode('send');
                        formRef.current?.requestSubmit();
                      }}
                    >
                      {loading ? 'Saving...' : 'Save and Send'}
                    </Button>

                    <Button
                      variant="text"
                      disabled={loading}
                      sx={{ textTransform: 'none', fontSize: '0.84rem', color: '#374151' }}
                      onClick={() => {
                        if (onCancel) onCancel();
                        navigate('/invoices');
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>
                      Total Amount: ₹ {Number(form.total_amount || 0).toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Total Quantity: {(form.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditInvoice;
