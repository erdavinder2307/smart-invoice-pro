import { getApiBaseUrl } from '../config/api';

/**
 * Turn API-relative upload paths (/uploads/...) into absolute URLs for <img src>.
 * Leaves blob:, data:, and absolute http(s) URLs unchanged.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${getApiBaseUrl()}${trimmed}`;
  }
  return trimmed;
}
