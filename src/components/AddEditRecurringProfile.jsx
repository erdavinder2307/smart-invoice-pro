import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from './Layout/MainLayout';
import CustomerSelect from './common/CustomerSelect';
import DevAutoFillButton from './common/DevAutoFillButton';
import { C, fieldSx, footerSx, cancelBtnSx, saveBtnSx } from './common/formStyles';
import { getCustomers } from '../services/customerService';
import {
  createRecurringProfile,
  getRecurringProfileById,
  updateRecurringProfile,
} from '../services/recurringProfileService';
import { generateRecurringProfileMockData } from '../utils/mockDataGenerators';

const repeatOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const statusOptions = ['Active', 'Paused', 'Expired', 'Stopped'];
const paymentTermsOptions = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45'];
const taxOptions = [0, 5, 12, 18, 28];
const weekdayOptions = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];
const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const emptyItem = { name: '', quantity: 1, rate: 0, discount: 0, tax: 0 };

const initialForm = {
  profile_name: '',
  customer_id: '',
  frequency: 'Monthly',
  recurrence_interval: 1,
  recurrence_week_days: [],
  recurrence_day_of_month: 1,
  recurrence_month_of_year: 1,
  start_date: '',
  ends_type: 'never',
  end_date: '',
  occurrence_limit: '',
  status: 'Active',
  payment_terms: 'Net 30',
  auto_send: false,
  email_reminder: false,
  is_gst_applicable: false,
  items: [{ ...emptyItem }],
  notes: '',
  terms_conditions: '',
  occurrences_created: 0,
};

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const parseIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const clampDay = (year, month, day) => {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(Math.max(day, 1), lastDay);
};

const lineBaseAmount = (item) => {
  const quantity = Number(item.quantity || 0);
  const rate = Number(item.rate || 0);
  const discount = Number(item.discount || 0);
  return Math.max(0, quantity * rate - discount);
};

const lineTaxAmount = (item) => {
  const taxRate = Number(item.tax || 0);
  return (lineBaseAmount(item) * taxRate) / 100;
};

const buildRuleFromForm = (form) => ({
  frequency: form.frequency,
  interval: Math.max(1, Number(form.recurrence_interval || 1)),
  weekly_days: Array.isArray(form.recurrence_week_days)
    ? form.recurrence_week_days.map((d) => Number(d)).filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b)
    : [],
  day_of_month: Math.max(1, Math.min(31, Number(form.recurrence_day_of_month || 1))),
  month_of_year: Math.max(1, Math.min(12, Number(form.recurrence_month_of_year || 1))),
  ends_type: form.ends_type,
  end_date: form.ends_type === 'on_date' ? form.end_date : null,
  occurrence_limit: form.ends_type === 'after_occurrences' ? Number(form.occurrence_limit || 0) : null,
});

const getNextOccurrence = (currentDate, rule) => {
  const interval = Math.max(1, Number(rule.interval || 1));
  const next = new Date(currentDate);

  if (rule.frequency === 'Daily') {
    next.setDate(next.getDate() + interval);
    return next;
  }

  if (rule.frequency === 'Weekly') {
    const selectedDays = Array.isArray(rule.weekly_days) && rule.weekly_days.length
      ? [...rule.weekly_days].sort((a, b) => a - b)
      : [currentDate.getDay()];
    const currentDow = currentDate.getDay();
    const nextDow = selectedDays.find((dow) => dow > currentDow);

    if (nextDow !== undefined) {
      const delta = nextDow - currentDow;
      next.setDate(next.getDate() + delta);
      return next;
    }

    const firstDow = selectedDays[0];
    const daysUntilWeekEnd = 7 - currentDow;
    const weekJump = Math.max(0, interval - 1) * 7;
    next.setDate(next.getDate() + daysUntilWeekEnd + weekJump + firstDow);
    return next;
  }

  if (rule.frequency === 'Monthly') {
    const month = next.getMonth() + interval;
    const year = next.getFullYear() + Math.floor(month / 12);
    const normalizedMonth = month % 12;
    const day = clampDay(year, normalizedMonth + 1, Number(rule.day_of_month || 1));
    return new Date(year, normalizedMonth, day);
  }

  const year = next.getFullYear() + interval;
  const month = Math.max(1, Math.min(12, Number(rule.month_of_year || 1)));
  const day = clampDay(year, month, Number(rule.day_of_month || 1));
  return new Date(year, month - 1, day);
};

const generatePreviewDates = (startDateValue, rule, previewCount = 5) => {
  const startDate = parseIsoDate(startDateValue);
  if (!startDate) return [];

  const dates = [];
  let cursor = new Date(startDate);
  const endDate = parseIsoDate(rule.end_date);
  const occurrenceLimit = Number(rule.occurrence_limit || 0);

  while (dates.length < previewCount) {
    if (rule.ends_type === 'on_date' && endDate && cursor > endDate) break;
    if (rule.ends_type === 'after_occurrences' && occurrenceLimit > 0 && dates.length >= occurrenceLimit) break;
    dates.push(toIsoDate(cursor));
    cursor = getNextOccurrence(cursor, rule);
  }

  return dates;
};

const validateForm = (form) => {
  const nextErrors = {};
  const nextItemErrors = [];

  if (!form.customer_id) nextErrors.customer_id = 'Customer is required.';
  if (!String(form.profile_name || '').trim()) nextErrors.profile_name = 'Profile name is required.';
  if (!form.start_date) nextErrors.start_date = 'Start date is required.';

  const interval = Number(form.recurrence_interval || 0);
  if (!Number.isFinite(interval) || interval < 1) {
    nextErrors.recurrence_interval = 'Repeat interval must be a positive number.';
  }

  if (form.frequency === 'Weekly' && (!Array.isArray(form.recurrence_week_days) || !form.recurrence_week_days.length)) {
    nextErrors.recurrence_week_days = 'Select at least one weekday.';
  }

  if (form.ends_type === 'on_date') {
    if (!form.end_date) {
      nextErrors.end_date = 'End date is required.';
    } else if (form.start_date && new Date(`${form.end_date}T00:00:00`) <= new Date(`${form.start_date}T00:00:00`)) {
      nextErrors.end_date = 'End date must be greater than start date.';
    }
  }

  if (form.ends_type === 'after_occurrences') {
    const count = Number(form.occurrence_limit || 0);
    if (!Number.isFinite(count) || count < 1) {
      nextErrors.occurrence_limit = 'Occurrence count must be a positive integer.';
    }
  }

  (form.items || []).forEach((item, index) => {
    const itemError = {};
    if (!String(item.name || '').trim()) itemError.name = 'Item name is required.';
    if (Number(item.quantity || 0) <= 0) itemError.quantity = 'Quantity must be greater than 0.';
    if (Number(item.rate || 0) < 0) itemError.rate = 'Rate cannot be negative.';
    if (Number(item.discount || 0) < 0) itemError.discount = 'Discount cannot be negative.';
    if (Object.keys(itemError).length) {
      nextItemErrors[index] = itemError;
    }
  });

  return {
    errors: nextErrors,
    itemErrors: nextItemErrors,
    valid: Object.keys(nextErrors).length === 0 && nextItemErrors.length === 0,
  };
};

const AddEditRecurringProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDevAutoFillEnabled = process.env.NODE_ENV !== 'production';
  const profileId = id;

  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setPageLoading(true);
        const customersData = await getCustomers();
        if (!active) return;

        const normalizedCustomers = Array.isArray(customersData?.data)
          ? customersData.data
          : Array.isArray(customersData)
            ? customersData
            : [];
        setCustomers(normalizedCustomers);

        if (!profileId) {
          const today = new Date();
          setForm((prev) => ({
            ...prev,
            start_date: toIsoDate(today),
            recurrence_day_of_month: today.getDate(),
            recurrence_month_of_year: today.getMonth() + 1,
            recurrence_week_days: [today.getDay()],
          }));
          return;
        }

        const existing = await getRecurringProfileById(profileId);
        if (!active) return;

        const existingStartDate = existing.start_date || toIsoDate(new Date());
        const recurrenceRule = existing.recurrence_rule || {};

        setForm((prev) => ({
          ...prev,
          ...existing,
          frequency: existing.frequency || 'Monthly',
          recurrence_interval: Number(
            recurrenceRule.interval || existing.recurrence_interval || 1
          ),
          recurrence_week_days: Array.isArray(recurrenceRule.weekly_days)
            ? recurrenceRule.weekly_days.map((d) => Number(d)).filter((d) => d >= 0 && d <= 6)
            : Array.isArray(existing.recurrence_week_days)
              ? existing.recurrence_week_days.map((d) => Number(d)).filter((d) => d >= 0 && d <= 6)
              : [],
          recurrence_day_of_month: Number(
            recurrenceRule.day_of_month || existing.recurrence_day_of_month || parseIsoDate(existingStartDate)?.getDate() || 1
          ),
          recurrence_month_of_year: Number(
            recurrenceRule.month_of_year || existing.recurrence_month_of_year || parseIsoDate(existingStartDate)?.getMonth() + 1 || 1
          ),
          ends_type: existing.end_date ? 'on_date' : (existing.occurrence_limit ? 'after_occurrences' : 'never'),
          end_date: existing.end_date || '',
          occurrence_limit: existing.occurrence_limit || '',
          auto_send: Boolean(existing.auto_send || existing.email_reminder),
          email_reminder: Boolean(existing.email_reminder || existing.auto_send),
          items: Array.isArray(existing.items) && existing.items.length
            ? existing.items.map((item) => ({ ...emptyItem, ...item }))
            : [{ ...emptyItem }],
        }));
      } catch (err) {
        if (active) {
          setError(err.response?.data?.error || 'Failed to load recurring profile form data.');
        }
      } finally {
        if (active) setPageLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [profileId]);

  const summary = useMemo(() => {
    const subtotal = (form.items || []).reduce((sum, item) => sum + lineBaseAmount(item), 0);
    const tax = form.is_gst_applicable
      ? (form.items || []).reduce((sum, item) => sum + lineTaxAmount(item), 0)
      : 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [form.is_gst_applicable, form.items]);

  const recurrenceRule = useMemo(() => buildRuleFromForm(form), [form]);

  const nextDates = useMemo(
    () => generatePreviewDates(form.start_date, recurrenceRule, 5),
    [form.start_date, recurrenceRule]
  );

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const updateItem = (index, key, value) => {
    setForm((prev) => {
      const nextItems = [...(prev.items || [])];
      nextItems[index] = { ...nextItems[index], [key]: value };
      return { ...prev, items: nextItems };
    });

    setItemErrors((prev) => {
      if (!prev[index]?.[key]) return prev;
      const clone = [...prev];
      const rowErr = { ...(clone[index] || {}) };
      delete rowErr[key];
      clone[index] = rowErr;
      return clone;
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...(prev.items || []), { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      const nextItems = (prev.items || []).filter((_, i) => i !== index);
      return { ...prev, items: nextItems.length ? nextItems : [{ ...emptyItem }] };
    });
  };

  const applyDevAutoFill = useCallback(() => {
    if (!isDevAutoFillEnabled) return;

    const generated = generateRecurringProfileMockData({ context: { customers } }) || {};
    const startDate = generated.start_date || toIsoDate(new Date());
    const previewRule = {
      frequency: 'Weekly',
      interval: 1,
      weekly_days: [1, 3, 5],
      day_of_month: 1,
      month_of_year: 1,
      ends_type: 'after_occurrences',
      occurrence_limit: 12,
    };

    setForm((prev) => ({
      ...prev,
      ...generated,
      customer_id: generated.customer_id || customers?.[0]?.id || '',
      start_date: startDate,
      frequency: 'Weekly',
      recurrence_interval: 1,
      recurrence_week_days: [1, 3, 5],
      recurrence_day_of_month: 1,
      recurrence_month_of_year: 1,
      ends_type: 'after_occurrences',
      occurrence_limit: 12,
      end_date: '',
      status: 'Active',
      payment_terms: 'Net 30',
      auto_send: true,
      email_reminder: true,
      is_gst_applicable: true,
      notes: 'Automated QA profile. Generate and email recurring invoices each week.',
      terms_conditions: 'Payment due within 30 days from invoice date.',
      items: [
        { name: 'Subscription Plan - Pro', quantity: 1, rate: 1999, discount: 0, tax: 18 },
        { name: 'Managed Support', quantity: 2, rate: 800, discount: 0, tax: 18 },
      ],
      next_run_date: generatePreviewDates(startDate, previewRule, 1)[0] || startDate,
    }));

    setError('');
    setErrors({});
    setItemErrors([]);
  }, [customers, isDevAutoFillEnabled]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validation = validateForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      setItemErrors(validation.itemErrors);
      setError('Please correct the highlighted fields.');
      return;
    }

    const customer = customers.find((entry) => entry.id === form.customer_id);
    const payload = {
      ...form,
      customer_name: customer?.name || customer?.display_name || '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      end_date: form.ends_type === 'on_date' ? form.end_date : null,
      occurrence_limit: form.ends_type === 'after_occurrences' ? Number(form.occurrence_limit || 0) : null,
      recurrence_rule: recurrenceRule,
      recurrence_interval: recurrenceRule.interval,
      recurrence_week_days: recurrenceRule.weekly_days,
      recurrence_day_of_month: recurrenceRule.day_of_month,
      recurrence_month_of_year: recurrenceRule.month_of_year,
      next_run_date: nextDates[0] || form.start_date,
      items: (form.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
        rate: Number(item.rate || 0),
        discount: Number(item.discount || 0),
        tax: Number(item.tax || 0),
        amount: lineBaseAmount(item) + (form.is_gst_applicable ? lineTaxAmount(item) : 0),
      })),
      amount: summary.total,
      subtotal: summary.subtotal,
      total_tax: summary.tax,
      auto_send: Boolean(form.auto_send),
      email_reminder: Boolean(form.email_reminder),
    };

    try {
      setSaving(true);
      if (profileId) {
        await updateRecurringProfile(profileId, payload);
      } else {
        await createRecurringProfile(payload);
      }
      navigate('/recurring-profiles');
    } catch (err) {
      const details = err.response?.data?.details;
      if (details && typeof details === 'object') {
        setErrors((prev) => ({ ...prev, ...details }));
      }
      setError(err.response?.data?.error || 'Failed to save recurring profile.');
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <MainLayout>
        <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', py: 2.5, px: { xs: 1.5, md: 3 } }}>
        <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: { xs: '1.45rem', md: '1.85rem' }, fontWeight: 600, color: '#111827' }}>
              {profileId ? t('addEditRecurringProfile.editTitle') : t('addEditRecurringProfile.newTitle')}
            </Typography>
            {isDevAutoFillEnabled && <DevAutoFillButton onClick={applyDevAutoFill} />}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2.5}>
                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.5 }}>1. Basic Info</Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={12}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Customer</Typography>
                        <CustomerSelect
                          customers={customers}
                          value={form.customer_id}
                          onChange={(event) => updateField('customer_id', event.target.value)}
                          name="customer_id"
                          required
                        />
                        {errors.customer_id && <Typography sx={{ fontSize: '0.72rem', color: '#dc2626', mt: 0.5 }}>{errors.customer_id}</Typography>}
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Profile Name</Typography>
                        <TextField
                          name="profile_name"
                          size="small"
                          value={form.profile_name}
                          onChange={(event) => updateField('profile_name', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                          error={Boolean(errors.profile_name)}
                          helperText={errors.profile_name || ' '}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Status</Typography>
                        <TextField
                          select
                          size="small"
                          value={form.status}
                          onChange={(event) => updateField('status', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Payment Terms</Typography>
                        <TextField
                          select
                          size="small"
                          value={form.payment_terms}
                          onChange={(event) => updateField('payment_terms', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                        >
                          {paymentTermsOptions.map((term) => (
                            <MenuItem key={term} value={term}>{term}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Start Date</Typography>
                        <TextField
                          name="start_date"
                          type="date"
                          size="small"
                          value={form.start_date}
                          onChange={(event) => updateField('start_date', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                          error={Boolean(errors.start_date)}
                          helperText={errors.start_date || ' '}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.5 }}>2. Recurrence Rules</Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Repeat</Typography>
                        <TextField
                          select
                          size="small"
                          value={form.frequency}
                          onChange={(event) => updateField('frequency', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                        >
                          {repeatOptions.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Every</Typography>
                        <TextField
                          name="recurrence_interval"
                          size="small"
                          type="number"
                          value={form.recurrence_interval}
                          onChange={(event) => updateField('recurrence_interval', event.target.value)}
                          inputProps={{ min: 1 }}
                          fullWidth
                          sx={fieldSx}
                          error={Boolean(errors.recurrence_interval)}
                          helperText={errors.recurrence_interval || ' '}
                        />
                      </Grid>

                      {form.frequency === 'Weekly' && (
                        <Grid size={12}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.6 }}>Repeat On</Typography>
                          <ToggleButtonGroup
                            size="small"
                            value={form.recurrence_week_days}
                            onChange={(_, nextValue) => updateField('recurrence_week_days', nextValue || [])}
                          >
                            {weekdayOptions.map((day) => (
                              <ToggleButton key={day.value} value={day.value}>
                                {day.label}
                              </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                          {errors.recurrence_week_days && <Typography sx={{ fontSize: '0.72rem', color: '#dc2626', mt: 0.5 }}>{errors.recurrence_week_days}</Typography>}
                        </Grid>
                      )}

                      {form.frequency === 'Monthly' && (
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Day of Month</Typography>
                          <TextField
                            name="recurrence_day_of_month"
                            size="small"
                            type="number"
                            value={form.recurrence_day_of_month}
                            onChange={(event) => updateField('recurrence_day_of_month', event.target.value)}
                            inputProps={{ min: 1, max: 31 }}
                            fullWidth
                            sx={fieldSx}
                          />
                        </Grid>
                      )}

                      {form.frequency === 'Yearly' && (
                        <>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Month</Typography>
                            <TextField
                              name="recurrence_month_of_year"
                              select
                              size="small"
                              value={form.recurrence_month_of_year}
                              onChange={(event) => updateField('recurrence_month_of_year', event.target.value)}
                              fullWidth
                              sx={fieldSx}
                            >
                              {monthOptions.map((month) => (
                                <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Day</Typography>
                            <TextField
                              name="recurrence_day_of_month"
                              size="small"
                              type="number"
                              value={form.recurrence_day_of_month}
                              onChange={(event) => updateField('recurrence_day_of_month', event.target.value)}
                              inputProps={{ min: 1, max: 31 }}
                              fullWidth
                              sx={fieldSx}
                            />
                          </Grid>
                        </>
                      )}

                      <Grid size={12}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.4 }}>Ends</Typography>
                        <RadioGroup
                          row
                          value={form.ends_type}
                          onChange={(event) => updateField('ends_type', event.target.value)}
                        >
                          <FormControlLabel value="never" control={<Radio size="small" />} label="Never" />
                          <FormControlLabel value="on_date" control={<Radio size="small" />} label="On date" />
                          <FormControlLabel value="after_occurrences" control={<Radio size="small" />} label="After occurrences" />
                        </RadioGroup>
                      </Grid>

                      {form.ends_type === 'on_date' && (
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>End Date</Typography>
                          <TextField
                            name="end_date"
                            type="date"
                            size="small"
                            value={form.end_date}
                            onChange={(event) => updateField('end_date', event.target.value)}
                            fullWidth
                            sx={fieldSx}
                            error={Boolean(errors.end_date)}
                            helperText={errors.end_date || ' '}
                          />
                        </Grid>
                      )}

                      {form.ends_type === 'after_occurrences' && (
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Occurrences</Typography>
                          <TextField
                            name="occurrence_limit"
                            size="small"
                            type="number"
                            value={form.occurrence_limit}
                            onChange={(event) => updateField('occurrence_limit', event.target.value)}
                            inputProps={{ min: 1 }}
                            fullWidth
                            sx={fieldSx}
                            error={Boolean(errors.occurrence_limit)}
                            helperText={errors.occurrence_limit || ' '}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Paper>

                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.2 }}>3. Invoice Items</Typography>
                    <TableContainer sx={{ border: `1px solid ${C.border}`, borderRadius: '4px' }}>
                      <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell sx={{ width: '36%', fontSize: '0.72rem', fontWeight: 700 }}>ITEM</TableCell>
                            <TableCell sx={{ width: 90, fontSize: '0.72rem', fontWeight: 700 }}>QTY</TableCell>
                            <TableCell sx={{ width: 90, fontSize: '0.72rem', fontWeight: 700 }}>RATE</TableCell>
                            <TableCell sx={{ width: 90, fontSize: '0.72rem', fontWeight: 700 }}>DISCOUNT</TableCell>
                            <TableCell sx={{ width: 100, fontSize: '0.72rem', fontWeight: 700 }}>TAX</TableCell>
                            <TableCell align="right" sx={{ width: 110, fontSize: '0.72rem', fontWeight: 700 }}>LINE TOTAL</TableCell>
                            <TableCell sx={{ width: 40 }} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(form.items || []).map((item, index) => (
                            <TableRow key={`recurring-item-${index}`}>
                              <TableCell>
                                <TextField
                                  name={`item_name_${index}`}
                                  size="small"
                                  value={item.name}
                                  onChange={(event) => updateItem(index, 'name', event.target.value)}
                                  placeholder="Item name"
                                  fullWidth
                                  sx={fieldSx}
                                  error={Boolean(itemErrors[index]?.name)}
                                  helperText={itemErrors[index]?.name || ' '}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  name={`item_quantity_${index}`}
                                  size="small"
                                  type="number"
                                  value={item.quantity}
                                  onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                                  inputProps={{ min: 0 }}
                                  fullWidth
                                  sx={fieldSx}
                                  error={Boolean(itemErrors[index]?.quantity)}
                                  helperText={itemErrors[index]?.quantity || ' '}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  name={`item_rate_${index}`}
                                  size="small"
                                  type="number"
                                  value={item.rate}
                                  onChange={(event) => updateItem(index, 'rate', event.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  fullWidth
                                  sx={fieldSx}
                                  error={Boolean(itemErrors[index]?.rate)}
                                  helperText={itemErrors[index]?.rate || ' '}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  name={`item_discount_${index}`}
                                  size="small"
                                  type="number"
                                  value={item.discount}
                                  onChange={(event) => updateItem(index, 'discount', event.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  fullWidth
                                  sx={fieldSx}
                                  error={Boolean(itemErrors[index]?.discount)}
                                  helperText={itemErrors[index]?.discount || ' '}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  name={`item_tax_${index}`}
                                  select
                                  size="small"
                                  value={item.tax}
                                  onChange={(event) => updateItem(index, 'tax', Number(event.target.value || 0))}
                                  fullWidth
                                  sx={fieldSx}
                                >
                                  {taxOptions.map((tax) => (
                                    <MenuItem key={tax} value={tax}>{tax}%</MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                                {(lineBaseAmount(item) + (form.is_gst_applicable ? lineTaxAmount(item) : 0)).toFixed(2)}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Remove row">
                                  <IconButton size="small" onClick={() => removeItem(index)}>
                                    <DeleteIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 1.1 }}>
                      <Button
                        type="button"
                        size="small"
                        startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                        onClick={addItem}
                        sx={{ textTransform: 'none' }}
                      >
                        Add New Row
                      </Button>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.2 }}>5. Automation Settings</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={form.auto_send}
                            onChange={(event) => updateField('auto_send', event.target.checked)}
                            size="small"
                          />
                        )}
                        label="Auto-send generated invoices"
                      />
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={form.email_reminder}
                            onChange={(event) => updateField('email_reminder', event.target.checked)}
                            size="small"
                          />
                        )}
                        label="Send email reminder"
                      />
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={form.is_gst_applicable}
                            onChange={(event) => updateField('is_gst_applicable', event.target.checked)}
                            size="small"
                          />
                        )}
                        label="Tax applicable"
                      />
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.2 }}>6. Notes</Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={12}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Customer Notes</Typography>
                        <TextField
                          multiline
                          rows={3}
                          value={form.notes}
                          onChange={(event) => updateField('notes', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                          placeholder="Notes shown on generated invoice"
                        />
                      </Grid>
                      <Grid size={12}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#334155', mb: 0.5 }}>Terms & Conditions</Typography>
                        <TextField
                          multiline
                          rows={3}
                          value={form.terms_conditions}
                          onChange={(event) => updateField('terms_conditions', event.target.value)}
                          fullWidth
                          sx={fieldSx}
                          placeholder="Terms to include on each generated invoice"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 84 } }}>
                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.2 }}>4. Summary</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>Subtotal</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{summary.subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>Tax</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{summary.tax.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ borderTop: `1px solid ${C.divider}`, pt: 0.8, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Total</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>{summary.total.toFixed(2)}</Typography>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ borderColor: C.divider, p: 2 }}>
                    <Typography sx={{ fontSize: '0.98rem', fontWeight: 600, mb: 1 }}>Next 5 Invoice Dates</Typography>
                    {nextDates.length ? (
                      <Stack spacing={0.65}>
                        {nextDates.map((date) => (
                          <Typography key={date} sx={{ fontSize: '0.84rem', color: '#334155' }}>
                            {date}
                          </Typography>
                        ))}
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Add a valid start date and recurrence rules to preview schedule.
                      </Typography>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ ...footerSx, justifyContent: 'space-between', px: 0, mt: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button type="submit" variant="contained" disabled={saving} sx={saveBtnSx}>
                  {saving ? <CircularProgress size={18} color="inherit" /> : (profileId ? 'Update Profile' : 'Create Profile')}
                </Button>
                <Button type="button" variant="outlined" sx={cancelBtnSx} onClick={() => navigate('/recurring-profiles')}>
                  Cancel
                </Button>
              </Box>

              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                {(form.items || []).length} item(s) configured
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AddEditRecurringProfile;
