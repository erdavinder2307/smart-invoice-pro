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

// ── Defaults ────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

// ── Context ─────────────────────────────────────────────────────────────────

const DashboardFilterContext = createContext(null);

export const DashboardFilterProvider = ({ children }) => {
  const stored = loadFromStorage();

  const [revenueRange, _setRevenueRange] = useState(stored?.revenueRange || 'this_year');
  const [customStartDate, _setCustomStartDate] = useState(stored?.customStartDate || monthStartISO());
  const [customEndDate, _setCustomEndDate] = useState(stored?.customEndDate || todayISO());

  const setRevenueRange = useCallback((val) => {
    _setRevenueRange(val);
    _setCustomStartDate((start) => {
      _setCustomEndDate((end) => {
        saveToStorage({ revenueRange: val, customStartDate: start, customEndDate: end });
        return end;
      });
      return start;
    });
  }, []);

  const setCustomStartDate = useCallback((val) => {
    _setCustomStartDate(val);
    _setRevenueRange((range) => {
      _setCustomEndDate((end) => {
        saveToStorage({ revenueRange: range, customStartDate: val, customEndDate: end });
        return end;
      });
      return range;
    });
  }, []);

  const setCustomEndDate = useCallback((val) => {
    _setCustomEndDate(val);
    _setRevenueRange((range) => {
      _setCustomStartDate((start) => {
        saveToStorage({ revenueRange: range, customStartDate: start, customEndDate: val });
        return start;
      });
      return range;
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
