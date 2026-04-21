import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, ClickAwayListener, InputBase, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import {
  clearRecentlyViewed,
  clearSearchHistory,
  deleteRecentlyViewedItem,
  deleteSearchHistoryItem,
  getRecentlyViewed,
  getSearchHistory,
  saveSearchHistory,
  searchGlobal,
  trackRecentlyViewed,
} from '../../services/searchService';
import SearchDropdown from './SearchDropdown';

const MAX_RECENT_ITEMS = 7;
const MAX_RECENTLY_VIEWED = 5;

const emptyGroupedResults = {
  features: [],
  customers: [],
  invoices: [],
  products: [],
};

const getPathForResult = (item) => {
  if (item.path) return item.path;
  if (item.entity_type === 'customer') return `/customers/${item.entity_id || item.id}`;
  if (item.entity_type === 'invoice') return `/invoices/edit/${item.entity_id || item.id}`;
  if (item.entity_type === 'product') return `/products/edit/${item.entity_id || item.id}`;
  return '/search';
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const GlobalSearchInput = ({ placeholder = 'Search anything...', compact = false, onSearchChange }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const inputBaseRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [groupedResults, setGroupedResults] = useState(emptyGroupedResults);

  const trimmedQuery = query.trim();

  const sections = useMemo(() => {
    if (!trimmedQuery) {
      const result = [];
      if (recentSearches.length > 0) {
        result.push({ key: 'recent', items: recentSearches.slice(0, MAX_RECENT_ITEMS) });
      }
      if (recentlyViewed.length > 0) {
        result.push({ key: 'recentlyViewed', items: recentlyViewed.slice(0, MAX_RECENTLY_VIEWED) });
      }
      return result;
    }
    return [
      { key: 'features', items: groupedResults.features || [] },
      { key: 'customers', items: groupedResults.customers || [] },
      { key: 'invoices', items: groupedResults.invoices || [] },
      { key: 'products', items: groupedResults.products || [] },
    ];
  }, [trimmedQuery, groupedResults, recentSearches, recentlyViewed]);

  const flatItems = useMemo(() => {
    const items = [];
    sections.forEach((section) => {
      section.items.forEach((item) => items.push({ ...item, __section: section.key }));
    });
    return items;
  }, [sections]);

  const loadIdle = useCallback(async (cancelled) => {
    try {
      const [history, viewed] = await Promise.all([
        getSearchHistory(MAX_RECENT_ITEMS),
        getRecentlyViewed(MAX_RECENTLY_VIEWED),
      ]);
      if (cancelled?.current) return;
      if (Array.isArray(history)) {
        const seen = new Set();
        setRecentSearches(history.filter((item) => {
          const key = (item.query || '').toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }));
      }
      if (Array.isArray(viewed)) setRecentlyViewed(viewed);
    } catch (_err) {
      if (!cancelled?.current) {
        setRecentSearches([]);
        setRecentlyViewed([]);
      }
    }
  }, []);

  useEffect(() => {
    const cancelled = { current: false };
    if (open && !trimmedQuery) {
      loadIdle(cancelled);
    }
    return () => { cancelled.current = true; };
  }, [open, trimmedQuery, loadIdle]);

  useEffect(() => {
    const cancelled = { current: false };
    let timer;

    const runSearch = async () => {
      if (!trimmedQuery) {
        setGroupedResults(emptyGroupedResults);
        setLoading(false);
        setActiveIndex(-1);
        return;
      }
      setLoading(true);
      try {
        const payload = await searchGlobal(trimmedQuery, 5);
        if (!cancelled.current) {
          setGroupedResults(payload?.results || emptyGroupedResults);
          setActiveIndex(-1);
        }
      } catch (_err) {
        if (!cancelled.current) setGroupedResults(emptyGroupedResults);
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    };

    timer = setTimeout(runSearch, 300);
    return () => { cancelled.current = true; clearTimeout(timer); };
  }, [trimmedQuery]);

  const handleClose = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const saveAndNavigate = async (item) => {
    const path = getPathForResult(item);
    const isRecentlyViewed = item.__section === 'recentlyViewed';
    const isHistory = item.__section === 'recent';
    const isEntity = !isHistory && item.entity_type && item.entity_type !== 'feature';

    // Save search history for non-history non-recently-viewed items
    if (!isHistory && !isRecentlyViewed) {
      const historyPayload = {
        query: item.query || item.title || trimmedQuery,
        type: item.type || (item.entity_type === 'feature' ? 'feature' : 'entity'),
        entity_id: item.entity_id || item.id || null,
        entity_type: item.entity_type || null,
        path,
      };
      if (historyPayload.query) {
        saveSearchHistory(historyPayload).catch(() => {});
      }
    }

    // Track recently viewed for entity clicks (customers, invoices, products)
    if (isEntity || isRecentlyViewed) {
      trackRecentlyViewed({
        entity_id: item.entity_id || item.id,
        entity_type: item.entity_type,
        title: item.title || item.query || '',
        subtitle: item.subtitle || '',
        path,
      }).catch(() => {});
    }

    navigate(path);
    handleClose();
  };

  const submitFreeText = async () => {
    if (!trimmedQuery) return;
    saveSearchHistory({ query: trimmedQuery, type: 'free_text', entity_type: 'query' }).catch(() => {});
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    handleClose();
  };

  const handleKeyDown = (event) => {
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((prev) => (prev + 1) % flatItems.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!flatItems.length) return;
      setActiveIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        saveAndNavigate(flatItems[activeIndex]);
      } else {
        submitFreeText();
      }
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await deleteSearchHistoryItem(historyId);
      setRecentSearches((prev) => prev.filter((item) => item.id !== historyId));
    } catch (_err) {}
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setRecentSearches([]);
    } catch (_err) {}
  };

  const handleDeleteRecentlyViewed = async (itemId) => {
    try {
      await deleteRecentlyViewedItem(itemId);
      setRecentlyViewed((prev) => prev.filter((item) => item.id !== itemId));
    } catch (_err) {}
  };

  const handleClearRecentlyViewed = async () => {
    try {
      await clearRecentlyViewed();
      setRecentlyViewed([]);
    } catch (_err) {}
  };

  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box
          ref={inputRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: open ? 'primary.main' : 'divider',
            boxShadow: open ? '0 0 0 3px rgba(25, 118, 210, 0.12)' : 'none',
            borderRadius: 1.5,
            bgcolor: 'grey.50',
            px: 1,
            height: compact ? 34 : 38,
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
          <InputBase
            ref={inputBaseRef}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              onSearchChange?.(event.target.value);
              if (!open) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            sx={{ fontSize: '0.8125rem', width: '100%' }}
            inputProps={{ 'aria-label': 'global search' }}
          />
          {!open && !query && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                bgcolor: 'grey.200',
                px: 0.75,
                py: 0.25,
                borderRadius: 0.75,
                whiteSpace: 'nowrap',
                ml: 0.5,
                lineHeight: 1.6,
              }}
            >
              {shortcutHint}
            </Typography>
          )}
        </Box>

        <SearchDropdown
          anchorEl={inputRef.current}
          open={open}
          loading={loading}
          sections={sections}
          query={trimmedQuery}
          activeIndex={activeIndex}
          onHoverIndex={setActiveIndex}
          onSelect={saveAndNavigate}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
          onDeleteRecentlyViewed={handleDeleteRecentlyViewed}
          onClearRecentlyViewed={handleClearRecentlyViewed}
          onSubmitFreeText={submitFreeText}
        />
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearchInput;
