import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const ITEM_ICONS = {
  history: <HistoryOutlinedIcon fontSize="small" />,
  customer: <PersonOutlineOutlinedIcon fontSize="small" />,
  invoice: <DescriptionOutlinedIcon fontSize="small" />,
  product: <Inventory2OutlinedIcon fontSize="small" />,
  feature: <AppsOutlinedIcon fontSize="small" />,
  recentlyViewed: <VisibilityOutlinedIcon fontSize="small" />,
};

const SECTION_TITLES = {
  recent: 'Recent Searches',
  recentlyViewed: 'Recently Viewed',
  features: 'Features',
  customers: 'Customers',
  invoices: 'Invoices',
  products: 'Products',
};

const QUICK_ACTIONS = [
  { label: 'New Invoice', path: '/invoices/add' },
  { label: 'Add Customer', path: '/customers/add' },
  { label: 'Add Product', path: '/products/add' },
];

function renderHighlightedText(text, query) {
  const value = String(text || '');
  const q = String(query || '').trim();
  if (!q) return value;

  const lowerValue = value.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const matchIndex = lowerValue.indexOf(lowerQuery);

  if (matchIndex < 0) return value;

  const before = value.slice(0, matchIndex);
  const match = value.slice(matchIndex, matchIndex + q.length);
  const after = value.slice(matchIndex + q.length);

  return (
    <>
      {before}
      <Box component="mark" sx={{ bgcolor: 'warning.100', px: 0.25, borderRadius: 0.5 }}>
        {match}
      </Box>
      {after}
    </>
  );
}

const SearchDropdown = ({
  anchorEl,
  open,
  loading,
  sections,
  query,
  activeIndex,
  onSelect,
  onHoverIndex,
  onDeleteHistory,
  onClearHistory,
  onDeleteRecentlyViewed,
  onClearRecentlyViewed,
  onSubmitFreeText,
}) => {
  let globalIndex = -1;
  const hasItems = sections.some((section) => section.items.length > 0);
  const showNoResults = !loading && query && !hasItems;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      sx={{ zIndex: 1400, width: anchorEl?.clientWidth || 560, mt: 1 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={120}>
          <Paper
            elevation={10}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              maxHeight: 480,
              bgcolor: 'background.paper',
            }}
          >
            {loading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : showNoResults ? (
              /* Empty state with quick-action buttons */
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No results found for <strong>"{query}"</strong>.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                  Quick actions
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.path}
                      size="small"
                      variant="outlined"
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      onClick={() => onSelect({ path: action.path, title: action.label, __section: 'quickAction' })}
                      sx={{ borderRadius: 6, fontSize: '0.75rem', textTransform: 'none' }}
                    >
                      {action.label}
                    </Button>
                  ))}
                  {onSubmitFreeText && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={onSubmitFreeText}
                      sx={{ borderRadius: 6, fontSize: '0.75rem', textTransform: 'none' }}
                    >
                      Search all for "{query}"
                    </Button>
                  )}
                </Stack>
              </Box>
            ) : !hasItems ? (
              /* Idle empty state (no recent searches yet) */
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start typing to search invoices, customers, products and more.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                  Quick actions
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.path}
                      size="small"
                      variant="outlined"
                      startIcon={<AddCircleOutlineIcon fontSize="small" />}
                      onClick={() => onSelect({ path: action.path, title: action.label, __section: 'quickAction' })}
                      sx={{ borderRadius: 6, fontSize: '0.75rem', textTransform: 'none' }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ) : (
              <List disablePadding sx={{ overflowY: 'auto', maxHeight: 480 }}>
                {sections.map((section) => {
                  if (section.items.length === 0) return null;
                  return (
                    <Box key={section.key}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ letterSpacing: 0.4, fontWeight: 700 }}>
                          {SECTION_TITLES[section.key] || section.key}
                        </Typography>
                        {section.key === 'recent' && section.items.length > 0 && (
                          <Typography
                            variant="caption"
                            onClick={onClearHistory}
                            sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Clear all
                          </Typography>
                        )}
                        {section.key === 'recentlyViewed' && section.items.length > 0 && (
                          <Typography
                            variant="caption"
                            onClick={onClearRecentlyViewed}
                            sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Clear all
                          </Typography>
                        )}
                      </Box>

                      {section.items.map((item) => {
                        globalIndex += 1;
                        const isActive = globalIndex === activeIndex;
                        let iconKey;
                        if (section.key === 'recent') iconKey = 'history';
                        else if (section.key === 'recentlyViewed') iconKey = item.entity_type || 'recentlyViewed';
                        else iconKey = item.entity_type;

                        const primaryText = section.key === 'recent'
                          ? renderHighlightedText(item.query, query)
                          : renderHighlightedText(item.title, query);

                        const secondaryText = section.key === 'recent'
                          ? 'Recent search'
                          : section.key === 'recentlyViewed'
                          ? `Recently viewed · ${item.entity_type || ''}`
                          : item.subtitle;

                        return (
                          <ListItemButton
                            key={`${section.key}-${item.id}-${globalIndex}`}
                            onMouseEnter={() => onHoverIndex(globalIndex)}
                            onClick={() => onSelect(item, section.key)}
                            sx={{
                              px: 1.5,
                              py: 1,
                              bgcolor: isActive ? 'primary.50' : 'transparent',
                              borderLeft: '3px solid',
                              borderColor: isActive ? 'primary.main' : 'transparent',
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                              {ITEM_ICONS[iconKey] || ITEM_ICONS.feature}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {primaryText}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {secondaryText}
                                </Typography>
                              }
                            />
                            {section.key === 'recent' && (
                              <IconButton
                                size="small"
                                aria-label="delete recent search"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteHistory(item.id);
                                }}
                              >
                                <CloseOutlinedIcon fontSize="inherit" />
                              </IconButton>
                            )}
                            {section.key === 'recentlyViewed' && (
                              <IconButton
                                size="small"
                                aria-label="remove from recently viewed"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteRecentlyViewed(item.id);
                                }}
                              >
                                <CloseOutlinedIcon fontSize="inherit" />
                              </IconButton>
                            )}
                          </ListItemButton>
                        );
                      })}
                    </Box>
                  );
                })}
              </List>
            )}
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default SearchDropdown;
