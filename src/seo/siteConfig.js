const rawSiteUrl = process.env.REACT_APP_SITE_URL || 'https://solidevbooks.com';

export const SITE_CONFIG = {
  siteName: 'Solidev Books',
  brandTitle: 'Workflow-Driven Financial Operating System',
  defaultLocale: 'en_US',
  twitterHandle: '@solidevbooks',
  defaultOgImage: '/logo512.png',
  siteUrl: rawSiteUrl.replace(/\/$/, '')
};

export const toAbsoluteUrl = (path = '/') => {
  if (!path) return SITE_CONFIG.siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_CONFIG.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
