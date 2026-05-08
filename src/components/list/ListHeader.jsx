import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { clearSearchHistory, deleteSearchHistoryItem, getSearchHistory } from "../../services/searchService";

const HISTORY_LIMIT = 7;

// Module-level cache shared across all instances (keyed by page).
const historyCache = new Map();

/**
 * Bust the history cache for a specific page so the next focus-load
 * will re-fetch and pick up the most recently saved entry.
 * Call this from list pages right after `saveSearchHistory` resolves.
 */
export const invalidateSearchHistoryCache = (page) => {
  if (page) historyCache.delete(page);
};

const normalizeQuery = (value) => String(value || "").trim().toLowerCase();

const readLocalHistory = (storageKey) => {
  if (!storageKey) return [];
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry, index) => {
        if (typeof entry === "string") {
          return {
            id: `local-${index}-${entry}`,
            query: entry,
            created_at: "",
          };
        }
        return {
          id: entry.id || `local-${index}-${entry.query || ""}`,
          query: String(entry.query || "").trim(),
          created_at: entry.created_at || "",
        };
      })
      .filter((entry) => entry.query);
  } catch {
    return [];
  }
};

const writeLocalHistory = (storageKey, items) => {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
};

const ListHeader = forwardRef(({
  title,
  summary,
  rightAction,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchPage,
  liveResults = [],
  onHistorySelect,
  historyStorageKey,
}, ref) => {
  // A single ref wrapping BOTH the trigger input area AND the Popper (via
  // disablePortal) so ClickAwayListener fires only on genuine outside clicks.
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cacheKey = historyStorageKey ? `local:${historyStorageKey}` : `api:${searchPage || "global"}`;

  // ── History loading ──────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    if (!searchPage && !historyStorageKey) {
      setHistoryItems([]);
      return;
    }

    if (historyCache.has(cacheKey)) {
      setHistoryItems(historyCache.get(cacheKey));
      return;
    }

    if (historyStorageKey) {
      const localItems = readLocalHistory(historyStorageKey);
      historyCache.set(cacheKey, localItems);
      setHistoryItems(localItems);
      return;
    }

    setLoadingHistory(true);
    try {
      const items = await getSearchHistory({ page: searchPage, limit: HISTORY_LIMIT });
      const list = Array.isArray(items) ? items : [];
      historyCache.set(cacheKey, list);
      setHistoryItems(list);
    } catch {
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [cacheKey, searchPage, historyStorageKey]);

  // ── Merged suggestions (live results + history) ──────────────────────────

  const trimmedInput = String(searchValue || "").trim();

  const mergedItems = useMemo(() => {
    const normalizedInput = normalizeQuery(searchValue);
    const suggestions = [];
    const seen = new Set();

    // Live results (current typed value matching in-memory data) come first.
    (liveResults || []).slice(0, HISTORY_LIMIT).forEach((item) => {
      const value = String(item?.value || "").trim();
      if (!value) return;
      const key = normalizeQuery(value);
      if (seen.has(key)) return;
      seen.add(key);
      suggestions.push({
        id: item.id || `live-${key}`,
        kind: "live",
        value,
        label: item.label || value,
        subtitle: item.subtitle || "",
      });
    });

    // History items filtered by current input (empty input = show all).
    const matchedHistory = (historyItems || []).filter((item) => {
      const q = String(item?.query || "");
      if (!normalizedInput) return true;
      return q.toLowerCase().includes(normalizedInput);
    });

    matchedHistory.slice(0, HISTORY_LIMIT).forEach((item) => {
      const value = String(item?.query || "").trim();
      if (!value) return;
      const key = normalizeQuery(value);
      if (seen.has(key)) return;
      seen.add(key);
      suggestions.push({
        id: item.id,
        kind: "history",
        value,
        label: value,
        subtitle: "Recent search",
      });
    });

    return suggestions.slice(0, HISTORY_LIMIT);
  }, [historyItems, liveResults, searchValue]);

  // ── Gate the popper: only show when there is something to display ────────

  const shouldOpen = open && (loadingHistory || mergedItems.length > 0 || trimmedInput.length > 0);

  // ── Dynamic header label ─────────────────────────────────────────────────

  const sectionLabel = trimmedInput
    ? "Recent + Live Results"
    : "Recent Searches";

  // ── Keyboard & interaction ────────────────────────────────────────────────

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchValue, open]);

  const handleSelectValue = (value, source) => {
    onSearchChange(value);
    onHistorySelect?.(value);
    setOpen(false);
    setActiveIndex(-1);

    if (source === "history") {
      // Bubble the chosen entry to the top of the local cache.
      setHistoryItems((prev) => {
        const next = [...prev];
        const idx = next.findIndex(
          (item) => normalizeQuery(item.query) === normalizeQuery(value)
        );
        if (idx > 0) {
          const [picked] = next.splice(idx, 1);
          next.unshift(picked);
        }
        historyCache.set(cacheKey, next);
        if (historyStorageKey) {
          writeLocalHistory(historyStorageKey, next);
        }
        return next;
      });
    }
  };

  const handleDeleteHistory = async (historyId) => {
    if (historyStorageKey) {
      setHistoryItems((prev) => {
        const next = prev.filter((item) => item.id !== historyId);
        historyCache.set(cacheKey, next);
        writeLocalHistory(historyStorageKey, next);
        return next;
      });
      return;
    }

    try {
      await deleteSearchHistoryItem(historyId);
      setHistoryItems((prev) => {
        const next = prev.filter((item) => item.id !== historyId);
        historyCache.set(cacheKey, next);
        return next;
      });
    } catch {
      // Silent — deleting a suggestion should never interrupt typing.
    }
  };

  const handleClearAll = async () => {
    if (historyStorageKey) {
      setHistoryItems([]);
      historyCache.set(cacheKey, []);
      writeLocalHistory(historyStorageKey, []);
      return;
    }

    if (!searchPage) return;
    try {
      await clearSearchHistory(searchPage);
      setHistoryItems([]);
      historyCache.set(cacheKey, []);
    } catch {
      // Silent
    }
  };

  // ── Exposed method for reloading history after external updates ────────
  useImperativeHandle(ref, () => ({
    reloadHistory: async () => {
      // Force a fresh load by invalidating cache
      historyCache.delete(cacheKey);
      await loadHistory();
    },
  }), [cacheKey, loadHistory]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!shouldOpen || mergedItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % mergedItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? mergedItems.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const item = mergedItems[activeIndex];
      if (item) handleSelectValue(item.value, item.kind);
    }
  };

  // ── Popper anchor width (capped for mobile) ──────────────────────────────

  const popperWidth = inputRef.current
    ? Math.min(480, Math.max(280, inputRef.current.clientWidth))
    : 320;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      {/* containerRef covers both the TextField trigger AND the disablePortal
          Popper below, so ClickAwayListener fires only on genuine outside clicks. */}
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        {/* Title + summary */}
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          {summary ? (
            <Typography variant="body2" color="text.secondary">
              {summary}
            </Typography>
          ) : null}
        </Box>

        {/* Right-side: action button + search field */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
            width: { xs: "100%", md: "auto" },
            position: "relative",
          }}
        >
          {rightAction}

          <TextField
            inputRef={inputRef}
            id={`list-search-${searchPage || "global"}`}
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onFocus={() => {
              setOpen(true);
              loadHistory();
            }}
            onKeyDown={handleKeyDown}
            onChange={(event) => {
              onSearchChange(event.target.value);
              if (!open) setOpen(true);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", md: 260 },
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          {/* disablePortal keeps the Popper inside containerRef's DOM subtree
              so ClickAwayListener correctly treats it as "inside". */}
          <Popper
            open={shouldOpen}
            anchorEl={inputRef.current}
            placement="bottom-start"
            disablePortal
            transition
            sx={{ zIndex: 1400, width: popperWidth }}
            modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={150}>
                <Paper
                  elevation={8}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    maxHeight: 360,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header row */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.875,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: "grey.50",
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {sectionLabel}
                    </Typography>
                    {historyItems.length > 0 && (
                      <Button
                        size="small"
                        onClick={handleClearAll}
                        sx={{
                          textTransform: "none",
                          minWidth: 0,
                          p: "2px 6px",
                          fontSize: "0.72rem",
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        Clear all
                      </Button>
                    )}
                  </Box>

                  <Divider />

                  {/* Body */}
                  <Box sx={{ overflowY: "auto", flex: 1 }}>
                    {loadingHistory ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5 }}>
                        <CircularProgress size={14} />
                        <Typography variant="body2" color="text.secondary">
                          Loading…
                        </Typography>
                      </Box>
                    ) : mergedItems.length === 0 ? (
                      <Box sx={{ p: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {trimmedInput
                            ? `No matches for "${trimmedInput}" in your search history.`
                            : "No recent searches yet — start typing to search."}
                        </Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {mergedItems.map((item, index) => {
                          const active = index === activeIndex;
                          const isHistory = item.kind === "history";
                          return (
                            <ListItemButton
                              key={`${item.kind}-${item.id}-${index}`}
                              selected={active}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => handleSelectValue(item.value, item.kind)}
                              sx={{
                                alignItems: "flex-start",
                                py: 0.85,
                                px: 1.25,
                                minWidth: 0,
                                borderLeft: "3px solid",
                                borderColor: active ? "primary.main" : "transparent",
                                bgcolor: active ? "primary.50" : "transparent",
                                transition: "background-color 0.1s ease, border-color 0.1s ease",
                              }}
                            >
                              {/* Icon: history clock vs live search magnifier */}
                              <ListItemIcon
                                sx={{ minWidth: 30, mt: 0.3, color: isHistory ? "text.disabled" : "primary.main" }}
                              >
                                {isHistory ? (
                                  <HistoryOutlinedIcon fontSize="small" />
                                ) : (
                                  <SearchIcon fontSize="small" />
                                )}
                              </ListItemIcon>

                              <ListItemText
                                noWrap
                                primary={item.label}
                                secondary={
                                  isHistory
                                    ? (item.subtitle || "Recent search")
                                    : (item.subtitle || "Live result")
                                }
                                primaryTypographyProps={{ variant: "body2", fontWeight: 600, noWrap: true }}
                                secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                              />

                              {/* Delete button only for history items */}
                              {isHistory && (
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteHistory(item.id);
                                  }}
                                  aria-label="delete history item"
                                  sx={{ ml: 0.5, color: "text.disabled", "&:hover": { color: "error.main" } }}
                                >
                                  <CloseOutlinedIcon fontSize="inherit" />
                                </IconButton>
                              )}
                            </ListItemButton>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Box>
      </Box>
    </ClickAwayListener>
  );
});

ListHeader.displayName = 'ListHeader';

export default ListHeader;
