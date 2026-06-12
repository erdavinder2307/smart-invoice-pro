import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminProtectedRoute from './AdminProtectedRoute';
import AdminLogin from '../pages/Login';
import AdminDashboard from '../pages/Dashboard';
import Tenants from '../pages/Tenants';
import TenantDetail from '../pages/TenantDetail';
import Users from '../pages/Users';
import FeatureFlags from '../pages/FeatureFlags';
import AuditLogs from '../pages/AuditLogs';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="tenants"
        element={
          <AdminProtectedRoute>
            <Tenants />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="tenants/:tenantId"
        element={
          <AdminProtectedRoute>
            <TenantDetail />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="users"
        element={
          <AdminProtectedRoute>
            <Users />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="feature-flags"
        element={
          <AdminProtectedRoute>
            <FeatureFlags />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="audit-logs"
        element={
          <AdminProtectedRoute>
            <AuditLogs />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="stats"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route path="" element={<Navigate to="login" replace />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
