const DEMO_HOST = 'demo.solidevbooks.com';
export const INTERACTIVE_WORKSPACE_URL = 'https://demo.solidevbooks.com';

/** Build a full URL on the Interactive Workspace host (demo subdomain). */
export const getInteractiveWorkspaceUrl = (path = '/') => {
  if (!path || path === '/') {
    return INTERACTIVE_WORKSPACE_URL;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${INTERACTIVE_WORKSPACE_URL}${normalized}`;
};

/** Navigate the browser to the demo subdomain (required for host-based demo mode). */
export const openInteractiveWorkspace = (path = '/') => {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.assign(getInteractiveWorkspaceUrl(path));
};

export const isDemoHost = () => {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }
  return window.location.hostname.toLowerCase() === DEMO_HOST;
};

export const isDemoUser = (user) => Boolean(user?.is_demo);

export const isInteractiveWorkspace = (user) => isDemoHost() || isDemoUser(user);

export const demoSettingsBlockedPrefixes = [
  '/settings/organization-profile',
  '/settings/branding',
  '/settings/invoice-preferences',
  '/settings/taxes',
  '/settings/inventory',
  '/settings/users',
  '/settings/roles',
  '/settings/automation',
  '/settings/integrations',
  '/settings/security',
  '/settings/audit-log',
  '/activity',
  '/admin',
  '/signup',
];

export const isDemoRestrictedPath = (pathname, user, onDemoHost = isDemoHost()) => {
  if (!onDemoHost && !isDemoUser(user)) {
    return false;
  }
  const path = pathname || '';
  return demoSettingsBlockedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
};
