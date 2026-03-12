import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Fade,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PercentIcon from '@mui/icons-material/Percent';
import NotesIcon from '@mui/icons-material/Notes';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';

const frequencyOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
const statusOptions = ["Active", "Paused", "Expired", "Stopped"];

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
  items: [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
};

const AddEditRecurringProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileId = id;
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{
            bgcolor: 'primary.main',
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <EventRepeatIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {profileId ? "Edit Recurring Profile" : "Create Recurring Profile"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profileId ? "Update the recurring invoice profile" : "Set up automatic invoice generation"}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          {/* Profile Header */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <RepeatIcon color="primary" />
                Profile Information
              </Typography>
              <Grid container spacing={2.5}>
                {/* Profile Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Profile Name"
                    name="profile_name"
                    value={form.profile_name}
                    onChange={handleChange}
                    required
                    fullWidth
                    placeholder="e.g., Monthly Hosting Invoice"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }
                    }}
                  />
                </Grid>

                {/* Customer */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Customer</InputLabel>
                    <Select
                      label="Customer"
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        textAlign: 'left',
                        '& .MuiSelect-select': { textAlign: 'left' },
                      }}
                    >
                      <MenuItem value="">Select Customer</MenuItem>
                      {customers.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Frequency */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      label="Frequency"
                      name="frequency"
                      value={form.frequency}
                      onChange={handleChange}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        textAlign: 'left',
                        '& .MuiSelect-select': { textAlign: 'left' },
                      }}
                    >
                      {frequencyOptions.map((f) => (
                        <MenuItem key={f} value={f}>{f}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Status */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        textAlign: 'left',
                        '& .MuiSelect-select': { textAlign: 'left' },
                      }}
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Payment Terms */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Payment Terms"
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., Net 30"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }
                    }}
                  />
                </Grid>

                {/* Start Date */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Start Date"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }
                    }}
                  />
                </Grid>

                {/* End Date */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="End Date (Optional)"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }
                    }}
                  />
                </Grid>

                {/* Occurrence Limit */}
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Occurrence Limit (Optional)"
                    name="occurrence_limit"
                    type="number"
                    value={form.occurrence_limit}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Leave empty for unlimited"
                    inputProps={{ min: 1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }
                    }}
                  />
                </Grid>

                {/* Email Reminder */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.email_reminder}
                        onChange={handleChange}
                        name="email_reminder"
                        color="primary"
                      />
                    }
                    label="Send email reminder when invoice is generated"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Main Content Column (Left) */}
            <Grid item xs={12} md={8}>
              {/* Line Items */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="primary" />
                    Invoice Line Items
                  </Typography>
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', overflowX: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Rate (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Tax %</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, width: 40 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {form.items?.map((item, idx) => (
                          <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                            <TableCell align="center">
                              <TextField
                                size="small"
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...form.items];
                                  newItems[idx].quantity = parseInt(e.target.value) || 0;
                                  setForm({ ...form, items: newItems });
                                }}
                                inputProps={{ min: 0 }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.rate}
                                onChange={(e) => {
                                  const newItems = [...form.items];
                                  newItems[idx].rate = parseFloat(e.target.value) || 0;
                                  setForm({ ...form, items: newItems });
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.discount}
                                onChange={(e) => {
                                  const newItems = [...form.items];
                                  newItems[idx].discount = parseFloat(e.target.value) || 0;
                                  setForm({ ...form, items: newItems });
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.tax}
                                onChange={(e) => {
                                  const newItems = [...form.items];
                                  newItems[idx].tax = parseFloat(e.target.value) || 0;
                                  setForm({ ...form, items: newItems });
                                }}
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              ₹{((item.quantity * item.rate - item.discount) * (1 + item.tax / 100)).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newItems = form.items.filter((_, i) => i !== idx);
                                    setForm({ ...form, items: newItems.length > 0 ? newItems : [{ quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }] });
                                  }}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setForm({
                        ...form,
                        items: [...(form.items || []), { quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }]
                      });
                    }}
                    sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    variant="outlined"
                  >
                    Add Line Item
                  </Button>
                </CardContent>
              </Card>

              {/* Notes & Terms */}
              <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="primary" />
                    Notes & Terms
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        label="Customer Notes"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Thank you for your business!"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Terms & Conditions"
                        name="terms_conditions"
                        value={form.terms_conditions}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Payment terms, return policy, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={4}>
              {/* Tax & GST */}
              <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PercentIcon color="primary" />
                    Tax Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.is_gst_applicable}
                            onChange={handleChange}
                            name="is_gst_applicable"
                            color="primary"
                          />
                        }
                        label="GST Applicable"
                      />
                    </Grid>
                    {form.is_gst_applicable && (
                      <>
                        <Grid item xs={6}>
                          <TextField
                            label="CGST"
                            size="small"
                            type="number"
                            value={form.cgst_amount}
                            onChange={(e) => setForm({ ...form, cgst_amount: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="SGST"
                            size="small"
                            type="number"
                            value={form.sgst_amount}
                            onChange={(e) => setForm({ ...form, sgst_amount: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="IGST"
                            size="small"
                            type="number"
                            value={form.igst_amount}
                            onChange={(e) => setForm({ ...form, igst_amount: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                              }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate("/recurring-profiles")}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 }
              }}
            >
              {loading ? "Saving..." : (profileId ? "Update Profile" : "Create Profile")}
            </Button>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default AddEditRecurringProfile;
