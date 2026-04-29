import { useState, useCallback } from "react";

const STORAGE_PREFIX = "sip_sort_";

function readStoredSort(storageKey, defaultSortBy, defaultSortOrder) {
  if (!storageKey) return { sortBy: defaultSortBy, sortOrder: defaultSortOrder };
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        sortBy: parsed.sortBy !== undefined ? parsed.sortBy : defaultSortBy,
        sortOrder: parsed.sortOrder !== undefined ? parsed.sortOrder : defaultSortOrder,
      };
    }
  } catch {
    // ignore parse errors
  }
  return { sortBy: defaultSortBy, sortOrder: defaultSortOrder };
}

function writeStoredSort(storageKey, sortBy, sortOrder) {
  if (!storageKey) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify({ sortBy, sortOrder }));
  } catch {
    // ignore storage errors (private browsing, quota)
  }
}

/**
 * useTableSorting — shared sorting state for all list pages.
 *
 * Cycle on repeated column click: asc → desc → reset to module default
 *
 * @param {string|null} defaultSortBy    – initial column key (null = no sort)
 * @param {'asc'|'desc'} defaultSortOrder – initial direction
 * @param {string|null}  storageKey       – localStorage key for persistence (e.g. "invoices")
 *
 * Returns:
 *   sortBy       {string|null} – active column key
 *   sortOrder    {'asc'|'desc'}
 *   handleSort   (columnKey) => void – call on header click
 *   sortParams   {sort_by, sort_order} | {} – ready to spread into API params
 *   setSort      (sortBy, sortOrder) => void
 *   clearSort    () => void – reset to module defaults
 */
const useTableSorting = (defaultSortBy = null, defaultSortOrder = "asc", storageKey = null) => {
  const [sortBy, setSortBy] = useState(() =>
    readStoredSort(storageKey, defaultSortBy, defaultSortOrder).sortBy
  );
  const [sortOrder, setSortOrder] = useState(() =>
    readStoredSort(storageKey, defaultSortBy, defaultSortOrder).sortOrder
  );

  const setSort = useCallback(
    (nextSortBy, nextSortOrder = "asc") => {
      setSortBy(nextSortBy);
      setSortOrder(nextSortOrder);
      writeStoredSort(storageKey, nextSortBy, nextSortOrder);
    },
    [storageKey]
  );

  const clearSort = useCallback(() => {
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
    writeStoredSort(storageKey, defaultSortBy, defaultSortOrder);
  }, [defaultSortBy, defaultSortOrder, storageKey]);

  const handleSort = useCallback(
    (columnKey) => {
      let newSortBy;
      let newSortOrder;
      if (sortBy === columnKey) {
        if (sortOrder === "asc") {
          newSortBy = columnKey;
          newSortOrder = "desc";
        } else {
          // third click → reset to module defaults
          newSortBy = defaultSortBy;
          newSortOrder = defaultSortOrder;
        }
      } else {
        newSortBy = columnKey;
        newSortOrder = "asc";
      }
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      writeStoredSort(storageKey, newSortBy, newSortOrder);
    },
    [defaultSortBy, defaultSortOrder, sortBy, sortOrder, storageKey]
  );

  const sortParams = sortBy ? { sort_by: sortBy, sort_order: sortOrder } : {};

  return { sortBy, sortOrder, handleSort, sortParams, setSort, clearSort };
};

export default useTableSorting;
