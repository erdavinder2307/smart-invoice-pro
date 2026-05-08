import React, { useEffect, useMemo, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestoreIcon from '@mui/icons-material/Restore';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RepeatIcon from '@mui/icons-material/Repeat';

import { CHECKBOX_COLUMN_WIDTH } from './common/StandardDataTable';
import ArchiveDialog from './common/ArchiveDialog';
import LifecycleArchiveDialog from './common/LifecycleArchiveDialog';
import ResponsiveDataView from './common/ResponsiveDataView';
import RecurringProfileCard from './common/RecurringProfileCard';
import ListPageLayout from './list/ListPageLayout';
import ListHeader, { invalidateSearchHistoryCache } from './list/ListHeader';
import FilterBar from './list/FilterBar';
import ListSummary from './list/ListSummary';
import BulkActionBar from './list/BulkActionBar';
import useTableSorting from '../hooks/useTableSorting';
import useListController from '../hooks/useListController';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { saveSearchHistory } from '../services/searchService';
import {
  bulkRecurringProfileAction,
  getRecurringProfilesList,
  patchRecurringProfileAction,
} from '../services/recurringProfileService';

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Archived', label: 'Archived' },
];

const FREQUENCY_OPTIONS = [
  { value: 'All', label: 'All Frequency' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Yearly', label: 'Yearly' },
  { value: 'Custom', label: 'Custom' },
];

const statusStyle = {
  Active: { color: '#1f7a36', bg: '#eaf7ee' },
  Paused: { color: '#b45309', bg: '#fff7ed' },
  Completed: { color: '#1d4ed8', bg: '#eaf2ff' },
  Cancelled: { color: '#b91c1c', bg: '#fee2e2' },
  Expired: { color: '#1d4ed8', bg: '#eaf2ff' },
  Stopped: { color: '#b91c1c', bg: '#fee2e2' },
};

const normalizeStatusForUi = (status) => {
  if (status === 'Expired') return 'Completed';
  if (status === 'Stopped') return 'Cancelled';
  return status;
};

const RecurringProfileList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    search,
    setSearch,
    status,
    setStatus,
    dateRange,
    setDateRange,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  } = useListController({
    location,
    navigate,
    defaults: {
      page: 1,
      pageSize: 10,
      search: '',
      status: 'All',
      dateRange: 'all',
    },
  });

  const [frequency, setFrequency] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('frequency') || 'All';
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [restoreTargetId, setRestoreTargetId] = useState(null);
  const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [uiError, setUiError] = useState('');

  const debouncedSearch = useDebouncedValue(search, 300);
  const { sortBy, sortOrder, handleSort, setSort } = useTableSorting('created_at', 'desc', 'recurring_profiles');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextFrequency = params.get('frequency') || 'All';
    if (nextFrequency !== frequency) {
      setFrequency(nextFrequency);
    }
  }, [frequency, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const current = params.get('frequency') || 'All';
    if (current === frequency) return;

    if (frequency && frequency !== 'All') params.set('frequency', frequency);
    else params.delete('frequency');
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [frequency, location.pathname, location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSortBy = params.get('sort_by') || 'created_at';
    const urlSortOrder = (params.get('sort_order') || 'desc').toLowerCase();
    if (urlSortBy !== sortBy || urlSortOrder !== sortOrder) {
      setSort(urlSortBy, urlSortOrder === 'asc' ? 'asc' : 'desc');
    }
  }, [location.search, setSort, sortBy, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentSortBy = params.get('sort_by') || 'created_at';
    const currentSortOrder = (params.get('sort_order') || 'desc').toLowerCase();
    if (currentSortBy === sortBy && currentSortOrder === sortOrder) return;

    params.set('sort_by', sortBy || 'created_at');
    params.set('sort_order', sortOrder || 'desc');
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate, sortBy, sortOrder]);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      q: debouncedSearch,
      status: status === 'All' ? '' : status,
      frequency: frequency === 'All' ? '' : frequency,
      date_range: dateRange,
      date_from: dateRange === 'custom' ? dateFrom : '',
      date_to: dateRange === 'custom' ? dateTo : '',
    }),
    [dateFrom, dateRange, dateTo, debouncedSearch, frequency, page, rowsPerPage, sortBy, sortOrder, status]
  );

  const recurringQuery = useQuery({
    queryKey: ['recurring-profiles-list', queryParams],
    queryFn: ({ signal }) => getRecurringProfilesList(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => patchRecurringProfileAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-profiles-list'] });
      setUiError('');
      setActionMenuAnchor(null);
      setActiveProfile(null);
    },
    onError: () => setUiError('Failed to update recurring invoice status.'),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkRecurringProfileAction,
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['recurring-profiles-list'] });
      setUiError('');
    },
    onError: () => setUiError('Failed to apply bulk action.'),
  });

  useEffect(() => {
    const query = debouncedSearch.trim();
    if (query.length < 2) return;

    Promise.resolve(
      saveSearchHistory({
        page: 'recurring-invoices',
        query,
        filters: {
          status,
          frequency,
          date_range: dateRange,
        },
      })
    )
      .then(() => invalidateSearchHistoryCache('recurring-invoices'))
      .catch(() => {});
  }, [dateRange, debouncedSearch, frequency, status]);

  const rows = useMemo(() => {
    const payload = recurringQuery.data;
    if (Array.isArray(payload)) return payload;
    return Array.isArray(payload?.data) ? payload.data : [];
  }, [recurringQuery.data]);

  const totalCount = useMemo(() => {
    const payload = recurringQuery.data;
    if (Array.isArray(payload)) return payload.length;
    return Number(payload?.total || 0);
  }, [recurringQuery.data]);

  const summary = useMemo(() => {
    const defaults = {
      total: totalCount,
      Active: 0,
      Paused: 0,
      Completed: 0,
      Cancelled: 0,
    };

    return rows.reduce((acc, row) => {
      const next = { ...acc };
      const normalized = normalizeStatusForUi(row.status);
      next[normalized] = (next[normalized] || 0) + 1;
      return next;
    }, defaults);
  }, [rows, totalCount]);

  const liveSearchResults = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    if (term.length < 1) return [];

    return rows
      .filter((row) => [row.profile_name, row.customer_name]
        .some((value) => String(value || '').toLowerCase().includes(term)))
      .slice(0, 7)
      .map((row) => ({
        id: row.id,
        value: row.profile_name || row.customer_name || '',
        label: row.profile_name || 'Recurring Invoice',
        subtitle: row.customer_name || row.frequency || 'Recurring Invoice',
      }));
  }, [rows, search]);

  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((row) => row.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !rows.some((row) => row.id === id)));
  };

  const handleRowSelect = (rowId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(rowId) ? prev : [...prev, rowId];
      return prev.filter((id) => id !== rowId);
    });
  };

  const runBulkAction = (action) => {
    if (!selectedIds.length) return;
    bulkMutation.mutate({ action, ids: selectedIds });
  };

  const handleActionMenuOpen = (event, profile) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActiveProfile(profile);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActiveProfile(null);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-GB');
  };

  const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const getStatusChip = (status) => {
    const normalized = normalizeStatusForUi(status || 'Active');
    const style = statusStyle[normalized] || statusStyle.Active;
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          px: 0.8,
          py: 0.25,
          borderRadius: '10px',
          fontSize: '0.69rem',
          fontWeight: 700,
          letterSpacing: 0.22,
          color: style.color,
          bgcolor: style.bg,
          textTransform: 'uppercase',
        }}
      >
        {normalized}
      </Box>
    );
  };

  const isInitialLoading = recurringQuery.isLoading && !recurringQuery.data;
  const hasActiveFilters = Boolean(search || (status && status !== 'All') || (frequency && frequency !== 'All') || (dateRange && dateRange !== 'all'));

  return (
    <ListPageLayout>
      <ListHeader
        title="Recurring Invoices"
        summary={`${totalCount} recurring invoice${totalCount === 1 ? '' : 's'}`}
        rightAction={(
          <Button
            variant="contained"
            onClick={() => navigate('/recurring-profiles/add')}
            startIcon={<AddIcon fontSize="small" />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Create Recurring Invoice
          </Button>
        )}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search recurring invoices"
        searchPage="recurring-invoices"
        liveResults={liveSearchResults}
        onHistorySelect={setSearch}
      />

      <FilterBar
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        rightSlot={(
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select
              size="small"
              label="Frequency"
              value={frequency}
              onChange={(event) => {
                setFrequency(event.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Date"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              sx={{ minWidth: 140 }}
            >
              {DATE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>

            {dateRange === 'custom' && (
              <>
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </Box>
        )}
      />

      <ListSummary
        items={[
          { label: 'Total', value: summary.total || 0, active: status === 'All', onClick: () => setStatus('All') },
          { label: 'Active', value: summary.Active || 0, color: 'success', active: status === 'Active', onClick: () => setStatus('Active') },
          { label: 'Paused', value: summary.Paused || 0, color: 'warning', active: status === 'Paused', onClick: () => setStatus('Paused') },
          { label: 'Completed', value: summary.Completed || 0, color: 'primary', active: status === 'Completed', onClick: () => setStatus('Completed') },
          { label: 'Cancelled', value: summary.Cancelled || 0, color: 'error', active: status === 'Cancelled', onClick: () => setStatus('Cancelled') },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={[
          { label: 'Pause Selected', onClick: () => runBulkAction('pause'), disabled: bulkMutation.isPending },
          { label: 'Resume Selected', onClick: () => runBulkAction('resume'), disabled: bulkMutation.isPending },
          {
            label: status === 'Archived' ? 'Restore Selected' : 'Delete Selected',
            color: status === 'Archived' ? 'success' : 'error',
            onClick: () => (status === 'Archived' ? setBulkRestoreOpen(true) : runBulkAction('delete')),
            disabled: bulkMutation.isPending,
          },
        ]}
      />

      {(uiError || recurringQuery.isError) && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setUiError('')}>
          {uiError || 'Failed to fetch recurring invoices.'}
        </Alert>
      )}

      <ResponsiveDataView
        isMobile={isMobile}
        renderCard={(profile) => (
          <RecurringProfileCard
            profile={{
              ...profile,
              status: normalizeStatusForUi(profile.status),
            }}
            customerName={profile.customer_name || 'Unknown'}
            onEdit={() => {
              if (status !== 'Archived') {
                navigate(`/recurring-profiles/edit/${profile.id}`);
              }
            }}
            onActionMenu={(event) => handleActionMenuOpen(event, profile)}
            getStatusColor={(value) => {
              const normalized = normalizeStatusForUi(value);
              if (normalized === 'Active') return 'success';
              if (normalized === 'Paused') return 'warning';
              if (normalized === 'Cancelled') return 'error';
              return 'primary';
            }}
            getFrequencyIcon={() => <RepeatIcon fontSize="small" />}
          />
        )}
        columns={[
          { key: 'checkbox', label: '', width: CHECKBOX_COLUMN_WIDTH },
          { key: 'profile_name', label: 'PROFILE NAME' },
          { key: 'customer_name', label: 'CUSTOMER' },
          { key: 'amount', label: 'AMOUNT', align: 'right', width: 120 },
          { key: 'frequency', label: 'FREQUENCY', width: 110 },
          { key: 'next_run_date', label: 'NEXT RUN', width: 110 },
          { key: 'last_run_date', label: 'LAST RUN', width: 110 },
          { key: 'status', label: 'STATUS', width: 120 },
          { key: 'actions', label: '', align: 'center', width: 130 },
        ]}
        rows={rows}
        loading={isInitialLoading}
        emptyTitle={hasActiveFilters ? 'No matching records' : 'No recurring invoices yet'}
        emptySubtitle={hasActiveFilters ? 'Try changing your search or filters.' : 'Create recurring invoice'}
        emptyAction={{
          label: 'Create Recurring Invoice',
          onClick: () => navigate('/recurring-profiles/add'),
        }}
        toolbar={(
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              borderBottom: '1px solid #edf0f3',
              bgcolor: '#fbfcfd',
            }}
          >
            <Typography sx={{ fontSize: '0.82rem', color: '#6b7280' }}>
              {totalCount} recurring invoice{totalCount === 1 ? '' : 's'}
            </Typography>
            {recurringQuery.isFetching && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <CircularProgress size={14} />
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>Updating…</Typography>
              </Box>
            )}
          </Box>
        )}
        renderHeader={() => (
          <TableRow>
            <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: '0 4px', borderBottom: '1px solid #e6e9ee' }}>
              <Checkbox
                size="small"
                checked={allVisibleSelected}
                indeterminate={!allVisibleSelected && selectedIds.length > 0}
                onChange={(event) => handleSelectAllVisible(event.target.checked)}
                sx={{ p: 0.5 }}
              />
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee' }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}>PROFILE NAME</Typography>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee' }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}>CUSTOMER</Typography>
            </TableCell>
            <TableCell align="right" sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee', width: 120 }}>
              <TableSortLabel
                active={sortBy === 'amount'}
                direction={sortBy === 'amount' ? sortOrder : 'asc'}
                onClick={() => handleSort('amount')}
                sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}
              >AMOUNT</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee', width: 110 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}>FREQUENCY</Typography>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee', width: 110 }}>
              <TableSortLabel
                active={sortBy === 'next_run_date'}
                direction={sortBy === 'next_run_date' ? sortOrder : 'asc'}
                onClick={() => handleSort('next_run_date')}
                sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}
              >NEXT RUN</TableSortLabel>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee', width: 110 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}>LAST RUN</Typography>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee', width: 120 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}>STATUS</Typography>
            </TableCell>
            <TableCell sx={{ py: 0.8, borderBottom: '1px solid #e6e9ee', width: 130 }} align="center">
              <TableSortLabel
                active={sortBy === 'created_at'}
                direction={sortBy === 'created_at' ? sortOrder : 'asc'}
                onClick={() => handleSort('created_at')}
                sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7b8493', letterSpacing: 0.3 }}
              >ACTIONS</TableSortLabel>
            </TableCell>
          </TableRow>
        )}
        renderRow={(profile) => {
          const normalizedStatus = normalizeStatusForUi(profile.status);
          const checked = selectedIds.includes(profile.id);
          const isArchivedView = status === 'Archived';

          return (
            <TableRow
              key={profile.id}
              hover
              onClick={() => {
                if (!isArchivedView) {
                  navigate(`/recurring-profiles/edit/${profile.id}`);
                }
              }}
              sx={{
                cursor: isArchivedView ? 'default' : 'pointer',
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid #edf0f3',
                  fontSize: '0.82rem',
                  color: '#374151',
                  py: 0.72,
                },
              }}
            >
              <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: '0 4px' }} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  size="small"
                  checked={checked}
                  onChange={(event) => handleRowSelect(profile.id, event.target.checked)}
                  sx={{ p: 0.5 }}
                />
              </TableCell>

              <TableCell>
                <Typography sx={{ fontSize: '0.82rem', color: '#1565d8', fontWeight: 600 }}>
                  {profile.profile_name || '—'}
                </Typography>
              </TableCell>

              <TableCell>{profile.customer_name || '—'}</TableCell>

              <TableCell align="right" sx={{ fontWeight: 600, color: '#111827' }}>
                {formatAmount(profile.amount)}
              </TableCell>

              <TableCell>{profile.frequency || '—'}</TableCell>

              <TableCell>{formatDate(profile.next_run_date)}</TableCell>

              <TableCell>{formatDate(profile.last_run_date)}</TableCell>

              <TableCell>{getStatusChip(normalizedStatus)}</TableCell>

              <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.2 }}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (status !== 'Archived') {
                          navigate(`/recurring-profiles/edit/${profile.id}`);
                        }
                      }}
                      disabled={status === 'Archived'}
                    >
                      <VisibilityIcon sx={{ fontSize: 16, color: '#334155' }} />
                    </IconButton>
                  </Tooltip>

                  {status !== 'Archived' && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/recurring-profiles/edit/${profile.id}`)}>
                        <EditIcon sx={{ fontSize: 16, color: '#0f6cbd' }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {status === 'Archived' ? (
                    <Tooltip title="Restore">
                      <IconButton size="small" onClick={() => setRestoreTargetId(profile.id)}>
                        <RestoreIcon sx={{ fontSize: 16, color: '#1f7a36' }} />
                      </IconButton>
                    </Tooltip>
                  ) : normalizedStatus === 'Active' ? (
                    <Tooltip title="Pause">
                      <IconButton size="small" onClick={() => actionMutation.mutate({ id: profile.id, action: 'pause' })}>
                        <PauseCircleOutlineIcon sx={{ fontSize: 16, color: '#b45309' }} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Resume">
                      <IconButton size="small" onClick={() => actionMutation.mutate({ id: profile.id, action: 'resume' })}>
                        <PlayCircleOutlineIcon sx={{ fontSize: 16, color: '#1f7a36' }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={status === 'Archived' ? 'Restore' : 'Archive'}>
                    <IconButton size="small" onClick={() => (status === 'Archived' ? setRestoreTargetId(profile.id) : setConfirmDeleteId(profile.id))}>
                      {status === 'Archived' ? <RestoreIcon sx={{ fontSize: 16, color: '#1f7a36' }} /> : <DeleteIcon sx={{ fontSize: 16, color: '#b91c1c' }} />}
                    </IconButton>
                  </Tooltip>

                  <IconButton size="small" onClick={(event) => handleActionMenuOpen(event, profile)}>
                    <MoreVertIcon sx={{ fontSize: 18, color: '#7b8493' }} />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
        pagination={{
          rowsPerPageOptions: [10, 25, 50],
          count: totalCount,
          rowsPerPage,
          page,
          onPageChange: (_, nextPage) => setPage(nextPage),
          onRowsPerPageChange: (event) => setRowsPerPage(Number.parseInt(event.target.value, 10)),
        }}
      />

      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            if (status !== 'Archived') {
              navigate(`/recurring-profiles/edit/${activeProfile?.id}`);
            }
            handleActionMenuClose();
          }}
          disabled={status === 'Archived'}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {status !== 'Archived' && (
          <MenuItem onClick={() => { navigate(`/recurring-profiles/edit/${activeProfile?.id}`); handleActionMenuClose(); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {status !== 'Archived' && normalizeStatusForUi(activeProfile?.status) === 'Active' ? (
          <MenuItem onClick={() => actionMutation.mutate({ id: activeProfile?.id, action: 'pause' })}>
            <ListItemIcon><PauseCircleOutlineIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Pause</ListItemText>
          </MenuItem>
        ) : status !== 'Archived' ? (
          <MenuItem onClick={() => actionMutation.mutate({ id: activeProfile?.id, action: 'resume' })}>
            <ListItemIcon><PlayCircleOutlineIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Resume</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => { (status === 'Archived' ? setRestoreTargetId(activeProfile?.id) : setConfirmDeleteId(activeProfile?.id)); handleActionMenuClose(); }}>
          <ListItemIcon>
            {status === 'Archived' ? <RestoreIcon fontSize="small" color="success" /> : <DeleteIcon fontSize="small" color="error" />}
          </ListItemIcon>
          <ListItemText>{status === 'Archived' ? 'Restore' : 'Archive'}</ListItemText>
        </MenuItem>
      </Menu>

      <ArchiveDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        entityType="recurring_profile"
        entityId={confirmDeleteId}
        entityLabel="Recurring Invoice"
        onArchived={() => {
          queryClient.invalidateQueries({ queryKey: ['recurring-profiles-list'] });
          setConfirmDeleteId(null);
          setUiError('');
        }}
      />

      <LifecycleArchiveDialog
        open={Boolean(restoreTargetId)}
        onClose={() => setRestoreTargetId(null)}
        mode="restore"
        entityType="recurring_profile"
        entityId={restoreTargetId}
        entityLabel="Recurring Invoice"
        onConfirmed={() => {
          queryClient.invalidateQueries({ queryKey: ['recurring-profiles-list'] });
          setRestoreTargetId(null);
          setUiError('');
        }}
      />

      <LifecycleArchiveDialog
        open={bulkRestoreOpen}
        onClose={() => setBulkRestoreOpen(false)}
        mode="bulk-restore"
        entityType="recurring_profile"
        entityIds={selectedIds}
        entityLabel="Recurring Invoice"
        entityCount={selectedIds.length}
        onConfirmed={() => {
          queryClient.invalidateQueries({ queryKey: ['recurring-profiles-list'] });
          setSelectedIds([]);
          setBulkRestoreOpen(false);
          setUiError('');
        }}
      />
    </ListPageLayout>
  );
};

export default RecurringProfileList;
