import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MainLayout from '../components/Layout/MainLayout';
import EmptyState from '../components/common/EmptyState';
import { searchGlobal, saveSearchHistory, trackRecentlyViewed } from '../services/searchService';
import { useTranslation } from 'react-i18next';

const CATEGORY_META = {
  features: { label: 'Features', icon: <AppsOutlinedIcon fontSize="small" color="primary" /> },
  customers: { label: 'Customers', icon: <PersonOutlineOutlinedIcon fontSize="small" color="info" /> },
  invoices: { label: 'Invoices', icon: <DescriptionOutlinedIcon fontSize="small" color="secondary" /> },
  products: { label: 'Products', icon: <Inventory2OutlinedIcon fontSize="small" color="success" /> },
};

const QUICK_ACTIONS = [
  { label: 'New Invoice', path: '/invoices/new' },
  { label: 'Add Customer', path: '/customers/new' },
  { label: 'Add Product', path: '/products/new' },
];

function renderHighlightedText(text, query) {
  const value = String(text || '');
  const q = String(query || '').trim();
  if (!q) return value;

  const index = value.toLowerCase().indexOf(q.toLowerCase());
  if (index < 0) return value;

  return (
    <>
      {value.slice(0, index)}
      <Box component="mark" sx={{ bgcolor: 'warning.100', borderRadius: 0.5, px: 0.25 }}>
        {value.slice(index, index + q.length)}
      </Box>
      {value.slice(index + q.length)}
    </>
  );
}

const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const query = (params.get('q') || '').trim();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({ results: { features: [], customers: [], invoices: [], products: [] }, total: 0 });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!query) {
        setPayload({ results: { features: [], customers: [], invoices: [], products: [] }, total: 0 });
        return;
      }

      setLoading(true);
      try {
        const data = await searchGlobal(query, 20);
        if (!cancelled) {
          setPayload(data);
          setActiveFilter('all');
        }
      } catch (_err) {
        if (!cancelled) {
          setPayload({ results: { features: [], customers: [], invoices: [], products: [] }, total: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (!query) return;
    saveSearchHistory({ query, type: 'free_text', entity_type: 'query' }).catch(() => {});
  }, [query]);

  const allSections = useMemo(() => {
    return Object.entries(payload.results || {}).map(([key, items]) => ({
      key,
      items: Array.isArray(items) ? items : [],
    }));
  }, [payload]);

  const filteredSections = useMemo(() => {
    if (activeFilter === 'all') return allSections;
    return allSections.filter((s) => s.key === activeFilter);
  }, [allSections, activeFilter]);

  const totalCount = useMemo(() => allSections.reduce((acc, s) => acc + s.items.length, 0), [allSections]);

  const filterOptions = useMemo(() => {
    return allSections
      .filter((s) => s.items.length > 0)
      .map((s) => ({ key: s.key, count: s.items.length, meta: CATEGORY_META[s.key] || { label: s.key } }));
  }, [allSections]);

  const handleItemClick = (item) => {
    const path = item.path || '/search';
    saveSearchHistory({
      query: item.title || query,
      type: item.type || 'entity',
      entity_id: item.entity_id || item.id || null,
      entity_type: item.entity_type || null,
      path,
    }).catch(() => {});

    if (item.entity_type && item.entity_type !== 'feature') {
      trackRecentlyViewed({
        entity_id: item.entity_id || item.id,
        entity_type: item.entity_type,
        title: item.title || '',
        subtitle: item.subtitle || '',
        path,
      }).catch(() => {});
    }

    navigate(path);
  };

  return (
    <MainLayout
      title={t('searchResults.title')}
      subtitle={query ? t('searchResults.subtitle', { query }) : t('searchResults.subtitleEmpty')}
    >
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {totalCount} result{totalCount !== 1 ? 's' : ''}
            {query && ` for "${query}"`}
          </Typography>
          {filterOptions.length > 1 && (
            <ToggleButtonGroup
              size="small"
              value={activeFilter}
              exclusive
              onChange={(_, val) => { if (val) setActiveFilter(val); }}
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: '0.75rem', px: 1.5 }}>
                All ({totalCount})
              </ToggleButton>
              {filterOptions.map(({ key, count, meta }) => (
                <ToggleButton key={key} value={key} sx={{ textTransform: 'none', fontSize: '0.75rem', px: 1.5 }}>
                  {meta.label} ({count})
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Box>

        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !query ? (
          <EmptyState title="Start searching" subtitle="Use the top search bar or add ?q=your-term in the URL." />
        ) : totalCount === 0 ? (
          <Box>
            <EmptyState
              title={`No results for "${query}"`}
              subtitle="Try a different keyword, or use one of the quick actions below."
            />
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.path}
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => navigate(action.path)}
                  sx={{ borderRadius: 6, textTransform: 'none' }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Box>
        ) : (
          filteredSections.map((section) => {
            if (!section.items.length) return null;
            const meta = CATEGORY_META[section.key] || { label: section.key, icon: <AppsOutlinedIcon fontSize="small" /> };

            return (
              <Box key={section.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                  {meta.icon}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {meta.label}
                  </Typography>
                  <Chip size="small" label={section.items.length} />
                </Box>

                <Grid container spacing={1.5}>
                  {section.items.map((item) => (
                    <Grid size={{ xs: 12, md: 6 }} key={`${section.key}-${item.id}`}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                        <CardActionArea onClick={() => handleItemClick(item)} sx={{ height: '100%' }}>
                          <CardContent sx={{ py: 1.25 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {renderHighlightedText(item.title, query)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {renderHighlightedText(item.subtitle, query)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })
        )}
      </Stack>
    </MainLayout>
  );
};

export default SearchResultsPage;
