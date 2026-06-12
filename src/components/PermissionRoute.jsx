/**
 * PermissionRoute
 * ===============
 * A route wrapper that checks whether the current user has the required
 * module + action permission before rendering the child route.
 *
 * While permissions are loading, shows a spinner. If the user lacks permission
 * after load completes, redirects to /forbidden.
 *
 * Usage (in routes.js):
 *
 *   <Route element={<PermissionRoute module="invoices" action="view" />}>
 *     <Route path="invoices" element={<InvoiceList />} />
 *   </Route>
 */
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { usePermission } from '../context/PermissionContext';

const PermissionRoute = ({ module, action = 'view' }) => {
  const { can, isAdmin, loading, loaded } = usePermission();

  if (!loaded || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin) return <Outlet />;

  if (!can(module, action)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
