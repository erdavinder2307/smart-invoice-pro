import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TableCell,
  TableSortLabel,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CHECKBOX_COLUMN_WIDTH } from './common/StandardDataTable';
import ResponsiveDataView from './common/ResponsiveDataView';
import StatusBadge from './common/StatusBadge';
import ListPageLayout from './list/ListPageLayout';
import ListHeader, { invalidateSearchHistoryCache } from './list/ListHeader';
import FilterBar from './list/FilterBar';
import ListSummary from './list/ListSummary';
import BulkActionBar from './list/BulkActionBar';
import ArchiveDialog from './common/ArchiveDialog';
import LifecycleArchiveDialog from './common/LifecycleArchiveDialog';
import useTableSorting from '../hooks/useTableSorting';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { bulkVendorAction, getVendorsList } from '../services/vendorService';
import { bulkArchiveEntities, parseBulkArchiveResult } from '../services/bulkArchiveService';
import { formatCurrency as formatCurrencyByLocale } from '../utils/intlFormatters';

const OUTSTANDING_CLEAR = 'Cleared';
const OUTSTANDING_WITH_PAYABLES = 'With Payables';
const SEARCH_HISTORY_KEY = 'sip_search_history_vendors';
const SEARCH_HISTORY_LIMIT = 7;

const PAYMENT_TERMS = [
  'All Terms',
  'Due on Receipt',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
];

const tlFallback = (translate, key, fallback, values) => {
  const translated = translate(key, values);
  return translated === key ? fallback : translated;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getVendorName = (vendor) => (
  vendor?.vendor_name
  || vendor?.name
  || vendor?.company_name
  || vendor?.display_name
  || '—'
);

const formatDate = (value) => {
  const parsed = toDate(value);
  if (!parsed) return '—';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getNetDays = (paymentTerms) => {
  const match = String(paymentTerms || '').match(/net\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
};

const getOutstandingChipMeta = (vendor) => {
  const outstanding = toNumber(vendor.outstanding_amount);
  const lastTransaction = toDate(vendor.last_transaction_date);
  const netDays = getNetDays(vendor.payment_terms);

  if (outstanding <= 0) {
    return {
      label: 'Cleared',
      color: '#166534',
      bg: '#eaf7ee',
      priority: 0,
    };
  }

  if (outstanding >= 50000) {
    return {
      label: 'High Outstanding',
      color: '#b91c1c',
      bg: '#fee2e2',
      priority: 3,
    };
  }

  if (lastTransaction && netDays > 0) {
    const daysPassed = Math.floor((Date.now() - lastTransaction.getTime()) / (1000 * 60 * 60 * 24));
    if (daysPassed >= Math.max(1, netDays - 5)) {
      return {
        label: 'Due Soon',
        color: '#92400e',
        bg: '#fef3c7',
        priority: 2,
      };
    }
  }

  return {
    label: 'Payable',
    color: '#b45309',
    bg: '#fff7ed',
    priority: 1,
  };
};

const readLocalHistory = () => {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalHistory = (items) => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

const saveQueryToLocalHistory = (query) => {
  const normalized = String(query || '').trim();
  if (normalized.length < 2) return;

  const next = [
    { id: `local-${Date.now()}`, query: normalized, created_at: new Date().toISOString() },
    ...readLocalHistory().filter((item) => String(item.query || '').toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, SEARCH_HISTORY_LIMIT);

  writeLocalHistory(next);
  invalidateSearchHistoryCache('vendors');
};

const buildCsv = (items) => {
  const headers = [
    'Vendor Name',
    'Contact',
    'Total Purchases',
    'Outstanding Payable',
    'Payment Terms',
    'Last Transaction',
    'Status',
  ];

  const lines = items.map((vendor) => {
    const contact = [vendor.contact_person, vendor.email, vendor.phone].filter(Boolean).join(' | ');
    return [
      getVendorName(vendor),
      contact,
      toNumber(vendor.total_purchases),
      toNumber(vendor.outstanding_amount),
      vendor.payment_terms || '',
      vendor.last_transaction_date || '',
      vendor.status || '',
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...lines].join('\n');
};

const VendorList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tl = useCallback((key, fallback, values) => tlFallback(t, key, fallback, values), [t]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [page, setPage] = useState(() => Math.max(0, Number(params.get('page') || 1) - 1));
  const [rowsPerPage, setRowsPerPage] = useState(() => Math.max(1, Number(params.get('page_size') || 10)));
  const [search, setSearch] = useState(() => String(params.get('q') || ''));
  const [statusFilter, setStatusFilter] = useState(() => String(params.get('status') || 'All'));
  const [outstandingFilter, setOutstandingFilter] = useState(() => String(params.get('outstanding') || 'All'));
  const [paymentTermsFilter, setPaymentTermsFilter] = useState(() => String(params.get('payment_terms') || 'All Terms'));

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [restoreTargetId, setRestoreTargetId] = useState(null);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [archiveBulkPending, setArchiveBulkPending] = useState(false);
  const [uiError, setUiError] = useState('');
  const [actionAnchor, setActionAnchor] = useState(null);
  const [activeVendor, setActiveVendor] = useState(null);

  const [immediateSearchTerm, setImmediateSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const effectiveSearch = immediateSearchTerm || debouncedSearch;
  const lastSavedQueryRef = useRef('');

  const { sortBy, sortOrder, handleSort, setSort } = useTableSorting('vendor_name', 'asc', 'vendors');

  useEffect(() => {
    const nextSortBy = params.get('sort_by') || 'vendor_name';
    const nextSortOrder = (params.get('sort_order') || 'asc').toLowerCase();
    if (nextSortBy !== sortBy || nextSortOrder !== sortOrder) {
      setSort(nextSortBy, nextSortOrder === 'desc' ? 'desc' : 'asc');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const next = new URLSearchParams(location.search);

    next.set('page', String(page + 1));
    next.set('page_size', String(rowsPerPage));

    if (search.trim()) next.set('q', search.trim());
    else next.delete('q');

    if (statusFilter !== 'All') next.set('status', statusFilter);
    else next.delete('status');

    if (outstandingFilter !== 'All') {
      next.set('outstanding', outstandingFilter === OUTSTANDING_WITH_PAYABLES ? 'with_payables' : 'cleared');
    } else {
      next.delete('outstanding');
    }

    if (paymentTermsFilter !== 'All Terms') next.set('payment_terms', paymentTermsFilter);
    else next.delete('payment_terms');

    next.set('sort_by', sortBy || 'vendor_name');
    next.set('sort_order', sortOrder || 'asc');

    const currentString = location.search.replace(/^\?/, '');
    const nextString = next.toString();
    if (currentString !== nextString) {
      navigate(`${location.pathname}?${nextString}`, { replace: true });
    }
  }, [
    location.pathname,
    location.search,
    navigate,
    outstandingFilter,
    page,
    paymentTermsFilter,
    rowsPerPage,
    search,
    sortBy,
    sortOrder,
    statusFilter,
  ]);

  useEffect(() => {
    setPage(0);
  }, [effectiveSearch, statusFilter, outstandingFilter, paymentTermsFilter]);

  useEffect(() => {
    if (!immediateSearchTerm) return;
    if (immediateSearchTerm.trim().toLowerCase() === debouncedSearch.trim().toLowerCase()) {
      setImmediateSearchTerm('');
    }
  }, [debouncedSearch, immediateSearchTerm]);

  useEffect(() => {
    const query = debouncedSearch.trim();
    const normalized = query.toLowerCase();
    if (query.length < 2 || normalized === lastSavedQueryRef.current) return;
    lastSavedQueryRef.current = normalized;
    saveQueryToLocalHistory(query);
  }, [debouncedSearch]);

  const queryParams = useMemo(() => ({
    page: page + 1,
    page_size: rowsPerPage,
    q: effectiveSearch,
    status: statusFilter === 'All' ? '' : statusFilter,
    outstanding: outstandingFilter === 'All'
      ? ''
      : (outstandingFilter === OUTSTANDING_WITH_PAYABLES ? 'with_payables' : 'cleared'),
    payment_terms: paymentTermsFilter === 'All Terms' ? '' : paymentTermsFilter,
    sort_by: sortBy,
    sort_order: sortOrder,
    include_meta: '1',
  }), [effectiveSearch, outstandingFilter, page, paymentTermsFilter, rowsPerPage, sortBy, sortOrder, statusFilter]);

  const vendorsQuery = useQuery({
    queryKey: ['vendors-list', queryParams],
    queryFn: ({ signal }) => getVendorsList(queryParams, signal),
    placeholderData: keepPreviousData,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkVendorAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors-list'] });
      setUiError('');
    },
    onError: () => {
      setUiError(tl('vendorList.failedBulk', 'Failed to apply bulk action.'));
    },
  });

  const vendors = useMemo(() => {
    const payload = vendorsQuery.data;
    if (Array.isArray(payload)) return payload;
    return Array.isArray(payload?.data) ? payload.data : [];
  }, [vendorsQuery.data]);

  const totalCount = useMemo(() => {
    const payload = vendorsQuery.data;
    if (Array.isArray(payload)) return payload.length;
    return Number(payload?.total || 0);
  }, [vendorsQuery.data]);

  const summary = useMemo(() => {
    const payload = vendorsQuery.data;
    const fallback = {
      total_vendors: totalCount,
      active_vendors: vendors.filter((vendor) => (vendor.status || '').toLowerCase() === 'active').length,
      vendors_with_payables: vendors.filter((vendor) => toNumber(vendor.outstanding_amount) > 0).length,
      high_outstanding_vendors: vendors.filter((vendor) => toNumber(vendor.outstanding_amount) >= 50000).length,
    };

    if (Array.isArray(payload)) return fallback;
    return {
      ...fallback,
      ...(payload?.summary || {}),
    };
  }, [totalCount, vendors, vendorsQuery.data]);

  const liveSearchResults = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    if (term.length < 1) return [];

    return vendors
      .filter((vendor) => [vendor.vendor_name, vendor.contact_person, vendor.email, vendor.phone]
        .some((value) => String(value || '').toLowerCase().includes(term)))
      .slice(0, 7)
      .map((vendor) => ({
        id: vendor.id,
        value: getVendorName(vendor),
        label: getVendorName(vendor) || tl('vendorList.columns.vendorName', 'Vendor Name'),
        subtitle: vendor.email || vendor.contact_person || vendor.phone || tl('common.vendor', 'Vendor'),
      }));
  }, [search, tl, vendors]);

  const allVisibleSelected = vendors.length > 0 && vendors.every((vendor) => selectedIds.includes(vendor.id));
  const someVisibleSelected = vendors.some((vendor) => selectedIds.includes(vendor.id));

  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...vendors.map((vendor) => vendor.id)])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !vendors.some((vendor) => vendor.id === id)));
  };

  const handleSelectOne = (vendorId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(vendorId) ? prev : [...prev, vendorId];
      return prev.filter((id) => id !== vendorId);
    });
  };

  const openMenu = (event, vendor) => {
    setActionAnchor(event.currentTarget);
    setActiveVendor(vendor);
  };

  const closeMenu = () => {
    setActionAnchor(null);
    setActiveVendor(null);
  };

  const runBulkDelete = async () => {
    if (!selectedIds.length) return;
    setArchiveBulkPending(true);
    try {
      const result = await bulkArchiveEntities('vendor', selectedIds);
      const parsed = parseBulkArchiveResult(result);
      setSelectedIds([]);
      setConfirmBulkDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendors-list'] });
      if (parsed.hasPartialFailure) {
        setUiError(parsed.message);
      } else {
        setUiError('');
      }
    } catch {
      setUiError(tl('vendorList.failedBulk', 'Failed to archive vendors.'));
    } finally {
      setArchiveBulkPending(false);
    }
  };

  const runBulkMarkInactive = () => {
    if (!selectedIds.length) return;
    bulkMutation.mutate({ action: 'mark_inactive', ids: selectedIds });
  };

  const runExport = () => {
    const selectedVendors = vendors.filter((vendor) => selectedIds.includes(vendor.id));
    if (!selectedVendors.length) return;

    const csv = buildCsv(selectedVendors);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vendors-export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => formatCurrencyByLocale(toNumber(amount), i18n.language, {
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const tableColumns = useMemo(() => ([
    { key: 'checkbox', label: '' },
    { key: 'vendor_name', label: tl('vendorList.columns.vendorName', 'Vendor Name') },
    { key: 'contact', label: tl('vendorList.columns.contact', 'Contact') },
    { key: 'total_purchases', label: tl('vendorList.columns.totalPurchases', 'Total Purchases') },
    { key: 'outstanding_amount', label: tl('vendorList.columns.outstandingPayable', 'Outstanding Payable') },
    { key: 'payment_terms', label: tl('vendorList.columns.paymentTerms', 'Payment Terms') },
    { key: 'last_transaction_date', label: tl('vendorList.columns.lastTransaction', 'Last Transaction') },
    { key: 'status', label: tl('common.status', 'Status') },
    { key: 'actions', label: tl('common.actions', 'Actions') },
  ]), [tl]);

  const renderHeader = () => (
    <TableRow>
      <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: '0 4px' }}>
        <Checkbox
          checked={allVisibleSelected}
          indeterminate={!allVisibleSelected && someVisibleSelected}
          onChange={(event) => handleSelectAllVisible(event.target.checked)}
          inputProps={{ 'aria-label': tl('vendorList.bulk.selectAll', 'Select all vendors') }}
        />
      </TableCell>

      {tableColumns
        .filter((column) => !['checkbox', 'status', 'actions'].includes(column.key))
        .map((column) => {
        const sortableKeys = ['vendor_name', 'outstanding_amount', 'total_purchases', 'last_transaction_date'];
        const sortable = sortableKeys.includes(column.key);
        return (
          <TableCell key={column.key}>
            {sortable ? (
              <TableSortLabel
                active={sortBy === column.key}
                direction={sortBy === column.key ? sortOrder : 'asc'}
                onClick={() => handleSort(column.key)}
              >
                {column.label}
              </TableSortLabel>
            ) : column.label}
          </TableCell>
        );
      })}

      <TableCell align="center">{tl('common.status', 'Status')}</TableCell>
      <TableCell align="center">{tl('common.actions', 'Actions')}</TableCell>
    </TableRow>
  );

  const renderRow = (vendor) => {
    const outstandingMeta = getOutstandingChipMeta(vendor);
    const vendorName = getVendorName(vendor);
    const outstandingLabel = tl(
      `vendorList.outstanding.${outstandingMeta.label.toLowerCase().replace(/\s+/g, '')}`,
      outstandingMeta.label,
    );
    const contactDisplay = [vendor.contact_person, vendor.email, vendor.phone].filter(Boolean).join(' • ') || '—';

    return (
      <TableRow key={vendor.id} hover>
        <TableCell sx={{ width: CHECKBOX_COLUMN_WIDTH, padding: '0 4px' }}>
          <Checkbox
            checked={selectedIds.includes(vendor.id)}
            onChange={(event) => handleSelectOne(vendor.id, event.target.checked)}
            inputProps={{ 'aria-label': tl('vendorList.bulk.selectOne', 'Select vendor') }}
          />
        </TableCell>

        <TableCell>
          <Typography sx={{ fontWeight: 700, color: '#1d4ed8' }}>{vendorName}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">{contactDisplay}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{formatCurrency(vendor.total_purchases)}</Typography>
        </TableCell>

        <TableCell sx={{ minWidth: 180 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.45 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {formatCurrency(vendor.outstanding_amount)}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 0.85,
                py: 0.25,
                borderRadius: 1,
                bgcolor: outstandingMeta.bg,
                color: outstandingMeta.color,
                fontSize: '0.72rem',
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: '100%',
                whiteSpace: 'nowrap',
              }}
            >
              {outstandingLabel}
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{vendor.payment_terms || '—'}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{formatDate(vendor.last_transaction_date)}</Typography>
        </TableCell>

        <TableCell align="center">
          <StatusBadge status={vendor.status || 'Active'} />
        </TableCell>

        <TableCell align="center">
          <IconButton size="small" onClick={(event) => openMenu(event, vendor)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  const renderCard = (vendor) => {
    const outstandingMeta = getOutstandingChipMeta(vendor);
    const vendorName = getVendorName(vendor);
    return (
      <Box
        key={vendor.id}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.8,
          bgcolor: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography sx={{ fontWeight: 700, color: '#1d4ed8' }}>{vendorName}</Typography>
          <StatusBadge status={vendor.status || 'Active'} />
        </Box>

        <Typography variant="body2" color="text.secondary">
          {[vendor.contact_person, vendor.email, vendor.phone].filter(Boolean).join(' • ') || '—'}
        </Typography>

        <Typography variant="body2">
          {tl('vendorList.columns.totalPurchases', 'Total Purchases')}: {formatCurrency(vendor.total_purchases)}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.4 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {tl('vendorList.columns.outstandingPayable', 'Outstanding Payable')}: {formatCurrency(vendor.outstanding_amount)}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start', px: 1, py: 0.35, borderRadius: 1, bgcolor: outstandingMeta.bg, color: outstandingMeta.color, fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2 }}>
            {tl(`vendorList.outstanding.${outstandingMeta.label.toLowerCase().replace(/\s+/g, '')}`, outstandingMeta.label)}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {tl('vendorList.columns.lastTransaction', 'Last Transaction')}: {formatDate(vendor.last_transaction_date)}
          </Typography>
          <IconButton size="small" onClick={(event) => openMenu(event, vendor)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const payloadError = vendorsQuery.error ? tl('vendorList.failedFetch', 'Failed to fetch vendors.') : '';
  const visibleError = uiError || payloadError;

  return (
    <ListPageLayout>
      <ListHeader
        title={tl('vendorList.title', 'Vendors')}
        summary={tl('vendorList.subtitle', 'Manage your suppliers and track payables')}
        rightAction={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vendors/add')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {tl('vendorList.newVendor', 'New Vendor')}
          </Button>
        )}
        searchValue={search}
        onSearchChange={setSearch}
        onHistorySelect={setImmediateSearchTerm}
        searchPage="vendors"
        searchPlaceholder={tl('vendorList.searchPlaceholder', 'Search vendors...')}
        liveResults={liveSearchResults}
        historyStorageKey={SEARCH_HISTORY_KEY}
      />

      <FilterBar
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: 'All', label: tl('vendorList.filters.allStatus', 'All Status') },
          { value: 'Active', label: tl('vendorList.filters.active', 'Active') },
          { value: 'Inactive', label: tl('vendorList.filters.inactive', 'Inactive') },
          { value: 'Archived', label: tl('vendorList.filters.archived', 'Archived') },
        ]}
        rightSlot={(
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={outstandingFilter === OUTSTANDING_WITH_PAYABLES ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setOutstandingFilter(OUTSTANDING_WITH_PAYABLES)}
              sx={{ textTransform: 'none' }}
            >
              {tl('vendorList.filters.withPayables', 'With Payables')}
            </Button>
            <Button
              variant={outstandingFilter === OUTSTANDING_CLEAR ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setOutstandingFilter(OUTSTANDING_CLEAR)}
              sx={{ textTransform: 'none' }}
            >
              {tl('vendorList.filters.cleared', 'Cleared')}
            </Button>
            <Button
              variant={outstandingFilter === 'All' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setOutstandingFilter('All')}
              sx={{ textTransform: 'none' }}
            >
              {tl('vendorList.filters.allOutstanding', 'All Outstanding')}
            </Button>

            <Box sx={{ minWidth: 150 }}>
              <select
                value={paymentTermsFilter}
                onChange={(event) => setPaymentTermsFilter(event.target.value)}
                style={{
                  width: '100%',
                  height: 32,
                  borderRadius: 8,
                  borderColor: '#d1d5db',
                  padding: '0 10px',
                }}
                aria-label={tl('vendorList.filters.paymentTerms', 'Payment Terms')}
              >
                {PAYMENT_TERMS.map((terms) => (
                  <option key={terms} value={terms}>{terms}</option>
                ))}
              </select>
            </Box>
          </Box>
        )}
      />

      <ListSummary
        items={[
          { label: tl('vendorList.summary.totalVendors', 'Total Vendors'), value: summary.total_vendors || 0, color: 'default' },
          { label: tl('vendorList.summary.activeVendors', 'Active Vendors'), value: summary.active_vendors || 0, color: 'success' },
          { label: tl('vendorList.summary.withPayables', 'Vendors with Payables'), value: summary.vendors_with_payables || 0, color: 'warning' },
          { label: tl('vendorList.summary.highOutstanding', 'High Outstanding Vendors'), value: summary.high_outstanding_vendors || 0, color: 'error' },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={[
          ...(statusFilter === 'Archived'
            ? []
            : [{
                label: tl('vendorList.bulk.markInactive', 'Mark Inactive'),
                color: 'warning',
                onClick: runBulkMarkInactive,
                disabled: selectedIds.length === 0 || bulkMutation.isPending,
              }]),
          {
            label: tl('vendorList.bulk.export', 'Export'),
            onClick: runExport,
            disabled: selectedIds.length === 0,
          },
          {
            label: statusFilter === 'Archived'
              ? tl('common.restore', 'Restore Selected')
              : tl('vendorList.bulk.delete', 'Archive Selected'),
            color: statusFilter === 'Archived' ? 'success' : 'warning',
            onClick: () => setConfirmBulkDeleteOpen(true),
            disabled: selectedIds.length === 0 || archiveBulkPending,
          },
        ]}
      />

      {visibleError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUiError('')}>
          {visibleError}
        </Alert>
      )}

      <ResponsiveDataView
        isMobile={isMobile}
        columns={tableColumns}
        rows={vendors}
        loading={vendorsQuery.isLoading && !vendorsQuery.data}
        renderCard={renderCard}
        renderHeader={renderHeader}
        renderRow={renderRow}
        emptyIcon={<LocalShippingIcon sx={{ fontSize: 48 }} />}
        emptyTitle={tl('vendorList.noVendors', 'No vendors found')}
        emptySubtitle={tl('vendorList.createFirst', 'Create your first vendor to get started')}
        pagination={{
          rowsPerPageOptions: [10, 25, 50],
          count: totalCount,
          rowsPerPage,
          page,
          onPageChange: (_event, nextPage) => setPage(nextPage),
          onRowsPerPageChange: (event) => {
            setRowsPerPage(Number.parseInt(event.target.value, 10));
            setPage(0);
          },
        }}
      />

      <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => {
          if (activeVendor && statusFilter !== 'Archived') navigate(`/vendors/edit/${activeVendor.id}`);
          closeMenu();
        }} disabled={statusFilter === 'Archived'}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{tl('vendorList.actions.view', 'View')}</ListItemText>
        </MenuItem>

        {statusFilter !== 'Archived' && (
          <MenuItem onClick={() => {
            if (activeVendor) navigate(`/vendors/edit/${activeVendor.id}`);
            closeMenu();
          }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{tl('common.edit', 'Edit')}</ListItemText>
          </MenuItem>
        )}

        {statusFilter !== 'Archived' && (
          <MenuItem onClick={() => {
            if (activeVendor) navigate('/bills/add', { state: { vendorId: activeVendor.id, vendorName: activeVendor.vendor_name } });
            closeMenu();
          }}>
            <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{tl('vendorList.actions.createBill', 'Create Bill')}</ListItemText>
          </MenuItem>
        )}

        {statusFilter !== 'Archived' && (
          <MenuItem onClick={() => {
            if (activeVendor) navigate(`/reports/payments-made?vendor_id=${activeVendor.id}`);
            closeMenu();
          }}>
            <ListItemIcon><PaymentsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{tl('vendorList.actions.recordPayment', 'Record Payment')}</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => {
          if (activeVendor) setConfirmDeleteId(activeVendor.id);
          closeMenu();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{tl('common.delete', 'Archive')}</ListItemText>
        </MenuItem>
        {statusFilter === 'Archived' && (
          <MenuItem onClick={() => {
            if (activeVendor) setRestoreTargetId(activeVendor.id);
            closeMenu();
          }} sx={{ color: 'success.main' }}>
            <ListItemIcon><RestoreIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>{tl('common.restore', 'Restore')}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <ArchiveDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        entityType="vendor"
        entityId={confirmDeleteId}
        entityLabel="Vendor"
        onArchived={() => {
          setSelectedIds((prev) => prev.filter((id) => id !== confirmDeleteId));
          queryClient.invalidateQueries({ queryKey: ['vendors-list'] });
        }}
      />

      <LifecycleArchiveDialog
        open={Boolean(restoreTargetId)}
        onClose={() => setRestoreTargetId(null)}
        mode="restore"
        entityType="vendor"
        entityId={restoreTargetId}
        entityLabel="Vendor"
        onConfirmed={() => {
          setSelectedIds((prev) => prev.filter((id) => id !== restoreTargetId));
          setRestoreTargetId(null);
          queryClient.invalidateQueries({ queryKey: ['vendors-list'] });
        }}
      />

      <LifecycleArchiveDialog
        open={confirmBulkDeleteOpen}
        onClose={() => setConfirmBulkDeleteOpen(false)}
        mode={statusFilter === 'Archived' ? 'bulk-restore' : 'bulk-archive'}
        entityType="vendor"
        entityIds={selectedIds}
        entityLabel="Vendor"
        entityCount={selectedIds.length}
        onConfirmed={async () => {
          if (statusFilter === 'Archived') {
            setSelectedIds([]);
            setConfirmBulkDeleteOpen(false);
            queryClient.invalidateQueries({ queryKey: ['vendors-list'] });
            setUiError('');
            return;
          }
          await runBulkDelete();
        }}
      />
    </ListPageLayout>
  );
};

export default VendorList;
