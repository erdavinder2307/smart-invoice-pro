import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Storage helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'dashboard_filter';

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (_) {
    return null;
  }
}

function saveToStorage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (_) {}
}

function toLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── Defaults ────────────────────────────────────────────────────────────────

function todayISO() {
  return toLocalISODate(new Date());
}

function monthStartISO() {
  const d = new Date();
  return toLocalISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

function presetRangeDates(range) {
  const now = new Date();
  const today = startOfDay(now);
  const endToday = endOfDay(now);

  if (range === 'today') {
    return { start_date: toLocalISODate(today), end_date: toLocalISODate(endToday) };
  }

  if (range === 'last_7_days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(endToday) };
  }

  if (range === 'last_30_days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(endToday) };
  }

  if (range === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(endToday) };
  }

  if (range === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(end) };
  }

  if (range === 'this_quarter') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(endToday) };
  }

  if (range === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(endToday) };
  }

  if (range === 'last_year') {
    const year = now.getFullYear() - 1;
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return { start_date: toLocalISODate(start), end_date: toLocalISODate(end) };
  }

  return null;
}

// ── Context ─────────────────────────────────────────────────────────────────

const DashboardFilterContext = createContext(null);

export const DashboardFilterProvider = ({ children }) => {
  const stored = loadFromStorage();

  const initialRange = stored?.revenueRange || 'this_year';
  const initialPreset = presetRangeDates(initialRange);
  const initialStartDate = initialRange === 'custom'
    ? (stored?.customStartDate || monthStartISO())
    : (initialPreset?.start_date || monthStartISO());
  const initialEndDate = initialRange === 'custom'
    ? (stored?.customEndDate || todayISO())
    : (initialPreset?.end_date || todayISO());

  const [revenueRange, _setRevenueRange] = useState(initialRange);
  const [customStartDate, _setCustomStartDate] = useState(initialStartDate);
  const [customEndDate, _setCustomEndDate] = useState(initialEndDate);

  const setRevenueRange = useCallback((val) => {
    _setRevenueRange(val);
    if (val === 'custom') {
      _setCustomStartDate((start) => {
        _setCustomEndDate((end) => {
          saveToStorage({ revenueRange: val, customStartDate: start, customEndDate: end });
          return end;
        });
        return start;
      });
      return;
    }

    const preset = presetRangeDates(val);
    const start = preset?.start_date || monthStartISO();
    const end = preset?.end_date || todayISO();
    _setCustomStartDate(start);
    _setCustomEndDate(end);
    saveToStorage({ revenueRange: val, customStartDate: start, customEndDate: end });
  }, []);

  const setCustomStartDate = useCallback((val) => {
    _setCustomStartDate(val);
    _setRevenueRange(() => {
      _setCustomEndDate((end) => {
        saveToStorage({ revenueRange: 'custom', customStartDate: val, customEndDate: end });
        return end;
      });
      return 'custom';
    });
  }, []);

  const setCustomEndDate = useCallback((val) => {
    _setCustomEndDate(val);
    _setRevenueRange(() => {
      _setCustomStartDate((start) => {
        saveToStorage({ revenueRange: 'custom', customStartDate: start, customEndDate: val });
        return start;
      });
      return 'custom';
    });
  }, []);

  return (
    <DashboardFilterContext.Provider
      value={{
        revenueRange,
        setRevenueRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
      }}
    >
      {children}
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilter = () => {
  const ctx = useContext(DashboardFilterContext);
  // Return safe defaults if used outside the provider (e.g. in tests without wrapper)
  if (!ctx) {
    return {
      revenueRange: 'this_year',
      setRevenueRange: () => {},
      customStartDate: monthStartISO(),
      setCustomStartDate: () => {},
      customEndDate: todayISO(),
      setCustomEndDate: () => {},
    };
  }
  return ctx;
};

export default DashboardFilterContext;
