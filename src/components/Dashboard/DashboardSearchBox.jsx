import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { searchGlobal } from '../../services/searchService';

// ── Recent searches (localStorage) ─────────────────────────────────────────

const RECENT_KEY = 'dashboard_recent_searches';
const MAX_RECENT = 5;

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function pushRecent(query) {
  const existing = loadRecent().filter((q) => q !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...existing].slice(0, MAX_RECENT)));
}

function removeRecent(query) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(loadRecent().filter((q) => q !== query)));
}

// ── Category metadata ───────────────────────────────────────────────────────

const CATEGORY_ORDER = ['customers', 'invoices', 'products', 'features'];

const CATEGORY_META = {
  customers: { label: 'Customers', icon: <PersonOutlineIcon fontSize="small" color="info" /> },
  invoices:  { label: 'Invoices',  icon: <DescriptionOutlinedIcon fontSize="small" color="secondary" /> },
  products:  { label: 'Products',  icon: <Inventory2OutlinedIcon fontSize="small" color="success" /> },
  features:  { label: 'Features',  icon: <AppsOutlinedIcon fontSize="small" color="primary" /> },
};

function itemLabel(item, category) {
  return item.title || item.name || item.invoice_number || '—';
}

// ── Component ───────────────────────────────────────────────────────────────

const DashboardSearchBox = ({ placeholder = 'Search invoices, customers, products…', minWidth = 260 }) => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // null → show recent; {} → api results
  const [recentSearches, setRecentSearches] = useState(loadRecent);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced API fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchGlobal(query.trim(), 5);
        setResults(data?.results ?? {});
      } catch (_) {
        setResults({});
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFocus = useCallback(() => {
    setRecentSearches(loadRecent());
    setOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && query.trim()) {
        pushRecent(query.trim());
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
        setQuery('');
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [query, navigate]
  );

  const navigateToItem = useCallback(
    (item) => {
      if (query.trim()) {
        pushRecent(query.trim());
        setRecentSearches(loadRecent());
      }
      setOpen(false);
      setQuery('');
      navigate(item.path || '/search');
    },
    [query, navigate]
  );

  const handleRecentClick = useCallback(
    (term) => {
      navigate(`/search?q=${encodeURIComponent(term)}`);
      setOpen(false);
      setQuery('');
    },
    [navigate]
  );

  const handleRemoveRecent = useCallback((e, term) => {
    e.stopPropagation();
    removeRecent(term);
    setRecentSearches(loadRecent());
  }, []);

  const handleSeeAll = useCallback(() => {
    pushRecent(query.trim());
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery('');
  }, [query, navigate]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  }, []);

  // ── Dropdown content ────────────────────────────────────────────────────

  const renderDropdown = () => {
    // Loading spinner
    if (loading) {
      return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      );
    }

    // No query typed → show recent searches
    if (!query.trim()) {
      if (recentSearches.length === 0) return null;
      return (
        <>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', fontSize: '0.7rem', letterSpacing: '0.08em' }}
          >
            Recent Searches
          </Typography>
          <List dense disablePadding>
            {recentSearches.map((term) => (
              <ListItemButton
                key={term}
                onClick={() => handleRecentClick(term)}
                sx={{ px: 2, py: 0.75 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <HistoryIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2">{term}</Typography>}
                />
                <IconButton
                  size="small"
                  aria-label={`Remove ${term}`}
                  onClick={(e) => handleRemoveRecent(e, term)}
                  sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </>
      );
    }

    // Query typed — check if we have results
    const sections = CATEGORY_ORDER
      .map((key) => ({ key, items: results?.[key] || [] }))
      .filter((s) => s.items.length > 0);

    if (sections.length === 0) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No results for &ldquo;{query.trim()}&rdquo;. Press <strong>Enter</strong> to search all.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {sections.map((section, idx) => {
          const meta = CATEGORY_META[section.key] || { label: section.key, icon: <SearchIcon fontSize="small" /> };
          return (
            <React.Fragment key={section.key}>
              {idx > 0 && <Divider />}
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', fontSize: '0.7rem', letterSpacing: '0.08em' }}
              >
                {meta.label}
              </Typography>
              <List dense disablePadding>
                {section.items.map((item) => (
                  <ListItemButton
                    key={item.id || item.entity_id || Math.random()}
                    onClick={() => navigateToItem(item)}
                    sx={{ px: 2, py: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {meta.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {itemLabel(item, section.key)}
                        </Typography>
                      }
                      secondary={
                        item.subtitle
                          ? <Typography variant="caption" color="text.secondary" noWrap>{item.subtitle}</Typography>
                          : null
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </React.Fragment>
          );
        })}

        <Divider />
        <ListItemButton onClick={handleSeeAll} sx={{ px: 2, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <SearchIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" color="primary.main">
                See all results for &ldquo;{query.trim()}&rdquo;
              </Typography>
            }
          />
        </ListItemButton>
      </>
    );
  };

  const dropdownContent = open ? renderDropdown() : null;

  return (
    <Box ref={containerRef} sx={{ position: 'relative', minWidth }}>
      {/* Input */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.75,
          border: '1px solid',
          borderColor: open ? 'primary.main' : 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s',
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
        <InputBase
          inputRef={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: '0.875rem', flex: 1 }}
          inputProps={{
            'aria-label': 'search dashboard',
            'aria-autocomplete': 'list',
            'aria-expanded': open,
            'aria-haspopup': 'listbox',
          }}
        />
        {query && (
          <IconButton size="small" aria-label="clear search" onClick={handleClear}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Paper>

      {/* Dropdown */}
      {dropdownContent && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1300,
            borderRadius: 2,
            overflow: 'hidden',
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          {dropdownContent}
        </Paper>
      )}
    </Box>
  );
};

export default DashboardSearchBox;
