/**
 * PermissionRoute
 * ===============
 * A route wrapper that checks whether the current user has the required
 * module + action permission before rendering the child route.
 *
 * If the permission check is still loading, renders nothing (brief flash
 * prevention). If the user lacks permission, redirects to /forbidden.
 *
 * Usage (in routes.js):
 *
 *   <Route element={<PermissionRoute module="invoices" action="view" />}>
 *     <Route path="invoices" element={<InvoiceList />} />
 *   </Route>
 */
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { usePermission } from '../context/PermissionContext';

const PermissionRoute = ({ module, action = 'view' }) => {
  const { can, isAdmin, loading } = usePermission();

  // While permissions are still fetching don't redirect yet
  if (loading) return null;

  // Admins bypass all permission checks
  if (isAdmin) return <Outlet />;

  if (!can(module, action)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
