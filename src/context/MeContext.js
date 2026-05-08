import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getMe } from '../services/meService';

const MeContext = createContext(null);

export const MeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(false);

  const refreshMe = useCallback(async () => {
    if (!isAuthenticated) return;
    setMeLoading(true);
    try {
      const data = await getMe();
      setMe(data);
      // Keep localStorage in sync so TopUtilityBar / Sidebar (which read localStorage)
      // also display the correct name without requiring a re-login.
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        if (data.full_name) stored.name = data.full_name;
        if (data.display_name) stored.display_name = data.display_name;
        localStorage.setItem('user', JSON.stringify(stored));
      } catch (_) { /* ignore */ }
    } catch (_) {
      // Non-fatal: API may not exist on older deployments
    } finally {
      setMeLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshMe();
    } else {
      setMe(null);
    }
  }, [isAuthenticated, refreshMe]);

  const displayName = me?.full_name || me?.display_name || me?.username || '';
  const initials = (() => {
    if (!displayName) return 'U';
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  })();

  return (
    <MeContext.Provider value={{ me, meLoading, refreshMe, displayName, initials }}>
      {children}
    </MeContext.Provider>
  );
};

export const useMe = () => {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error('useMe must be used within a MeProvider');
  return ctx;
};
