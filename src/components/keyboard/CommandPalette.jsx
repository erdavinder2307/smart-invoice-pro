import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Dialog,
  Divider,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import MoneyOffOutlinedIcon from '@mui/icons-material/MoneyOffOutlined';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// ── Static command list ──────────────────────────────────────────────────────

const ACTIONS = [
  { id: 'quick-create-invoice', labelKey: 'commandPalette.createInvoice', action: 'openQuickCreateInvoice', icon: <AddCircleOutlineIcon fontSize="small" />, categoryKey: 'commandPalette.actions' },
  { id: 'quick-create-customer', labelKey: 'commandPalette.addCustomer', action: 'openQuickCreateCustomer', icon: <PersonAddAltIcon fontSize="small" />, categoryKey: 'commandPalette.actions' },
];

const NAV_ITEMS = [
  { id: 'nav-dashboard', labelKey: 'commandPalette.dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-invoices', labelKey: 'commandPalette.invoices', path: '/invoices', icon: <ReceiptLongOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-customers', labelKey: 'commandPalette.customers', path: '/customers', icon: <PeopleAltOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-products', labelKey: 'commandPalette.products', path: '/products', icon: <Inventory2OutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-quotes', labelKey: 'commandPalette.quotes', path: '/quotes', icon: <FormatQuoteOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-vendors', labelKey: 'commandPalette.vendors', path: '/vendors', icon: <PeopleAltOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-bills', labelKey: 'commandPalette.bills', path: '/bills', icon: <ReceiptOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-expenses', labelKey: 'commandPalette.expenses', path: '/expenses', icon: <MoneyOffOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-purchases', labelKey: 'commandPalette.purchaseOrders', path: '/purchase-orders', icon: <ShoppingCartOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-banking', labelKey: 'commandPalette.bankAccounts', path: '/bank-accounts', icon: <AccountBalanceOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-reports', labelKey: 'commandPalette.reports', path: '/reports', icon: <AssessmentOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
  { id: 'nav-settings', labelKey: 'commandPalette.settings', path: '/settings', icon: <SettingsOutlinedIcon fontSize="small" />, categoryKey: 'commandPalette.navigation' },
];

const ALL_COMMANDS = [...ACTIONS, ...NAV_ITEMS];

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreMatch(item, query) {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  if (label.startsWith(q)) return 2;
  if (label.includes(q)) return 1;
  // word match
  if (label.split(' ').some((w) => w.startsWith(q))) return 1;
  return 0;
}

function filterCommands(query, commands) {
  if (!query.trim()) return commands;
  return commands
    .map((item) => ({ item, score: scoreMatch(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

// Group items by category, preserving insertion order
function groupBy(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category).push(item);
  }
  return map;
}

// ── Component ────────────────────────────────────────────────────────────────

const CommandPalette = () => {
  const { t } = useTranslation();
  const {
    commandPaletteOpen,
    closeCommandPalette,
    openShortcutsModal,
    openQuickCreateInvoice,
    openQuickCreateCustomer,
    recentCustomers,
  } = useKeyboardShortcutsContext();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Load recent searches when palette opens
  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [commandPaletteOpen]);

  const translatedCommands = useMemo(() => {
    return ALL_COMMANDS.map((cmd) => ({
      ...cmd,
      label: t(cmd.labelKey),
      category: t(cmd.categoryKey),
    }));
  }, [t]);

  const filtered = useMemo(() => filterCommands(query, translatedCommands), [query, translatedCommands]);

  // Build flat list: when no query, prepend recent customers
  const flatItems = useMemo(() => {
    const items = [];
    if (!query.trim() && recentCustomers.length > 0) {
      recentCustomers.slice(0, 5).forEach((c) => items.push({
        ...c,
        _isRecentCustomer: true,
        label: c.display_name || c.name || c.email || t('quickInvoice.unknown'),
        category: t('commandPalette.recentCustomers'),
      }));
    }
    filtered.forEach((cmd) => items.push(cmd));
    return items;
  }, [query, filtered, recentCustomers, t]);

  const grouped = useMemo(() => groupBy(flatItems), [flatItems]);

  // Reset active index when list changes
  useEffect(() => setActiveIndex(0), [flatItems.length]);

  const execute = useCallback((item) => {
    closeCommandPalette();
    if (item._isRecentCustomer) {
      navigate('/invoices/add', {
        state: {
          quickCreateCustomerId: item.id,
          focusItemInput: true,
        },
      });
      return;
    }

    if (item.action === 'openQuickCreateInvoice') {
      openQuickCreateInvoice();
      return;
    }

    if (item.action === 'openQuickCreateCustomer') {
      openQuickCreateCustomer();
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  }, [closeCommandPalette, navigate, openQuickCreateInvoice, openQuickCreateCustomer]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[activeIndex]) {
        execute(flatItems[activeIndex]);
      } else if (query.trim()) {
        // no-op when there are no command matches
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  };

  // Build a flat index map for highlighting
  let runningIndex = -1;
  const categoryEntries = [...grouped.entries()];

  return (
    <Dialog
      open={commandPaletteOpen}
      onClose={closeCommandPalette}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 2.5,
          overflow: 'hidden',
          // Position near top like VS Code / Linear
          position: 'absolute',
          top: '12vh',
          m: 0,
        },
      }}
      BackdropProps={{ sx: { backdropFilter: 'blur(2px)', bgcolor: 'rgba(0,0,0,0.35)' } }}
    >
      {/* Search input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', fontSize: 22, flexShrink: 0 }} />
        <InputBase
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
          onKeyDown={handleKeyDown}
          placeholder={t('commandPalette.placeholder')}
          sx={{ fontSize: '1rem', flex: 1 }}
          inputProps={{ 'aria-label': 'command palette search' }}
          endAdornment={
            <InputAdornment position="end">
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 0.75,
                  px: 0.75,
                  py: 0.25,
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                Esc
              </Typography>
            </InputAdornment>
          }
        />
      </Box>

      {/* Results */}
      <Paper
        elevation={0}
        sx={{ maxHeight: 400, overflowY: 'auto', borderRadius: 0 }}
      >
        {flatItems.length === 0 ? (
          <Box sx={{ py: 3, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('commandPalette.noCommands', { query })}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {categoryEntries.map(([category, items], catIdx) => (
              <Box key={category}>
                {catIdx > 0 && <Divider />}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    px: 2,
                    py: 0.75,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    color: 'text.secondary',
                    bgcolor: 'grey.50',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                  }}
                >
                  {category}
                </Typography>
                {items.map((item) => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <ListItemButton
                      key={item.id || item._id || idx}
                      selected={isActive}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => execute(item)}
                      sx={{
                        py: 0.875,
                        px: 2,
                        borderLeft: '3px solid',
                        borderColor: isActive ? 'primary.main' : 'transparent',
                        '&.Mui-selected': { bgcolor: 'primary.50' },
                        '&.Mui-selected:hover': { bgcolor: 'primary.100' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: isActive ? 'primary.main' : 'text.secondary' }}>
                        {item.icon || <SearchIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400 }}>
                            {item._isRecentCustomer ? item.label : item.label}
                          </Typography>
                        }
                        secondary={
                          item._isRecentCustomer ? (
                            <Typography variant="caption" color="text.disabled">
                              {item.email || t('commandPalette.recentCustomerFallback')}
                            </Typography>
                          ) : null
                        }
                      />
                      {/* Category badge for commands */}
                      {!item._isRecentCustomer && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', ml: 1, flexShrink: 0, fontSize: '0.7rem' }}
                        >
                          {item.category}
                        </Typography>
                      )}
                    </ListItemButton>
                  );
                })}
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[
            { key: '↑↓', label: t('commandPalette.footer.navigate') },
            { key: '↵', label: t('commandPalette.footer.select') },
            { key: 'Esc', label: t('commandPalette.footer.close') },
          ].map(({ key, label }) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.200',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 0.5,
                  px: 0.6,
                  fontSize: '0.65rem',
                  lineHeight: 1.6,
                }}
              >
                {key}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          onClick={() => { closeCommandPalette(); openShortcutsModal(); }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
            color: 'text.secondary',
          }}
        >
          <KeyboardIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
            {t('commandPalette.viewAllShortcuts')} &nbsp;{isMac ? '⌘/' : 'Ctrl+/'}
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CommandPalette;
