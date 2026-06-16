import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isDemoHost, isDemoRestrictedPath, isDemoUser } from '../utils/demoMode';

/**
 * Blocks organisation/admin routes for demo host or demo JWT sessions.
 */
const DemoRouteBlock = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const blocked = isDemoRestrictedPath(
    location.pathname,
    user,
    isDemoHost() || isDemoUser(user)
  );

  if (blocked) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default DemoRouteBlock;
