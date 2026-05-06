import React from 'react';
import { useLocation } from 'react-router-dom';
import SeoHead from './SeoHead';

const SELF_MANAGED_PUBLIC_ROUTES = new Set([
  '/',
  '/about',
  '/features',
  '/contact',
  '/pricing',
  '/support',
  '/api-docs',
  '/privacy',
  '/terms',
  '/cookies'
]);

const RouteSeoManager = () => {
  const location = useLocation();

  if (SELF_MANAGED_PUBLIC_ROUTES.has(location.pathname)) {
    return null;
  }

  return (
    <SeoHead
      title="Application Portal"
      description="Authenticated application routes for Solidev Books users."
      canonicalPath={location.pathname}
      robots="noindex,nofollow"
    />
  );
};

export default RouteSeoManager;
