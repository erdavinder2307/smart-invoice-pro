import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getMyPermissions } from '../services/rolesService';

const PermissionContext = createContext({
  permissions: {},
  can: () => false,
  loading: false,
  refetch: () => {},
});

// All known modules — used for UI rendering
export const PERMISSION_MODULES = {
  invoices:        ['view', 'create', 'edit', 'delete'],
  quotes:          ['view', 'create', 'edit', 'delete'],
  customers:       ['view', 'create', 'edit', 'delete'],
  products:        ['view', 'create', 'edit', 'delete'],
  vendors:         ['view', 'create', 'edit', 'delete'],
  purchase_orders: ['view', 'create', 'edit', 'delete'],
  bills:           ['view', 'create', 'edit', 'delete'],
  expenses:        ['view', 'create', 'edit', 'delete'],
  reports:         ['view'],
  settings:        ['view', 'edit'],
};

export const MODULE_LABELS = {
  invoices:        'Invoices',
  quotes:          'Quotes',
  customers:       'Customers',
  products:        'Products & Inventory',
  vendors:         'Vendors',
  purchase_orders: 'Purchase Orders',
  bills:           'Bills',
  expenses:        'Expenses',
  reports:         'Reports',
  settings:        'Settings',
};

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions({});
      setIsAdmin(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyPermissions();
      setIsAdmin(Boolean(data.is_admin));
      setPermissions(data.permissions || {});
    } catch {
      // Fallback: if Admin by role string, grant full access silently
      if (user?.role === 'Admin') {
        setIsAdmin(true);
      }
      setPermissions({});
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /** Check if the current user can perform action on module */
  const can = useCallback(
    (module, action) => {
      if (isAdmin) return true;
      return Boolean(permissions[module]?.[action]);
    },
    [isAdmin, permissions]
  );

  return (
    <PermissionContext.Provider value={{ permissions, isAdmin, can, loading, refetch: fetchPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);

export default PermissionContext;
