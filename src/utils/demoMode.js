const DEMO_HOST = 'demo.solidevbooks.com';

export const isDemoHost = () => {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }
  return window.location.hostname.toLowerCase() === DEMO_HOST;
};

export const isDemoUser = (user) => Boolean(user?.is_demo);

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
