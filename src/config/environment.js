/**
 * environment.js — Single source of truth for all environment configuration.
 *
 * Rules:
 *  - Development (npm start): localhost fallback is allowed.
 *  - Production (npm run build): REACT_APP_API_BASE_URL MUST be set explicitly.
 *    An empty value is NOT accepted — it will never silently fall back to localhost.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_TEST = process.env.NODE_ENV === 'test';

const _rawApiUrl = process.env.REACT_APP_API_BASE_URL || '';

// Strip accidental trailing slash once, centrally.
const _trimmedApiUrl = _rawApiUrl.replace(/\/+$/, '');

/**
 * In development: fall back to localhost if the var is not set.
 * In production: use whatever is set — if it's empty the runtime guard
 * (src/index.js) will catch it before any request is ever made.
 */
export const API_BASE_URL = IS_PRODUCTION
  ? _trimmedApiUrl
  : (_trimmedApiUrl || 'http://127.0.0.1:5001');

export const ENVIRONMENT_NAME = IS_PRODUCTION ? 'production' : IS_TEST ? 'test' : 'development';

export { IS_PRODUCTION, IS_DEVELOPMENT, IS_TEST };
