import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getMe } from '../services/meService';

const MeContext = createContext(null);

function syncUserToLocalStorage(data) {
  if (!data) return;
  try {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    if (data.full_name) stored.name = data.full_name;
    if (data.display_name) stored.display_name = data.display_name;
    if (data.role) stored.role = data.role;
    if (data.email) stored.email = data.email;
    localStorage.setItem('user', JSON.stringify(stored));
  } catch (_) {
    /* ignore */
  }
}

export const MeProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(false);
  const [meError, setMeError] = useState(null);

  const refreshMe = useCallback(async () => {
    if (!isAuthenticated) {
      setMe(null);
      setMeError(null);
      return null;
    }
    setMeLoading(true);
    setMeError(null);
    try {
      const data = await getMe();
      setMe(data);
      syncUserToLocalStorage(data);
      return data;
    } catch (err) {
      setMeError(err?.response?.data?.error || 'Failed to load profile');
      throw err;
    } finally {
      setMeLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      refreshMe().catch(() => {});
    } else {
      setMe(null);
      setMeError(null);
    }
  }, [isAuthenticated, authLoading, refreshMe]);

  const displayName = me?.full_name || me?.display_name || me?.username || '';
  const initials = (() => {
    if (!displayName) return 'U';
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  })();

  return (
    <MeContext.Provider value={{ me, meLoading, meError, refreshMe, displayName, initials }}>
      {children}
    </MeContext.Provider>
  );
};

export const useMe = () => {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error('useMe must be used within a MeProvider');
  return ctx;
};
