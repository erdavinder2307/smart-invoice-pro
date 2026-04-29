/**
 * apiErrors.js — parse API error responses into a consistent shape.
 *
 * Handles three formats emitted by the backend:
 *   1. New standard  { success: false, error: { type, message, fields } }
 *   2. Legacy flat   { error: "string message" }
 *   3. Legacy detail { error: "Validation failed", details: { field: msg } }
 *
 * Always returns:
 *   { message: string, fields: Record<string, string>, type: string }
 */

/**
 * Parse an Axios error into a structured error object.
 *
 * @param {import('axios').AxiosError} err
 * @param {string} [fallbackMessage]
 * @returns {{ message: string, fields: Record<string, string>, type: string }}
 */
export function parseApiError(err, fallbackMessage = 'An unexpected error occurred') {
  // Network / no response
  if (!err.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      fields: {},
      type: 'network_error',
    };
  }

  const { status, data } = err.response;

  // ── 1. New standardised format ───────────────────────────────────────────
  if (data && data.success === false && data.error && typeof data.error === 'object') {
    return {
      message: data.error.message || fallbackMessage,
      fields: data.error.fields || {},
      type: data.error.type || 'error',
    };
  }

  // ── 2. Legacy flat format { error: "string" } ────────────────────────────
  if (data && typeof data.error === 'string') {
    return { message: data.error, fields: {}, type: 'error' };
  }

  // ── 3. Legacy detail format { error: "...", details: { field: msg } } ────
  if (data && data.details && typeof data.details === 'object') {
    const fields = data.details;
    const message = (typeof data.error === 'string' ? data.error : null)
      || Object.values(fields)[0]
      || fallbackMessage;
    return { message, fields, type: 'validation_error' };
  }

  // ── 4. HTTP status fallbacks ─────────────────────────────────────────────
  if (status === 404) {
    return { message: 'The requested resource was not found.', fields: {}, type: 'not_found' };
  }
  if (status === 403) {
    return {
      message: 'You do not have permission to perform this action.',
      fields: {},
      type: 'auth_error',
    };
  }
  if (status === 401) {
    return { message: 'Your session has expired. Please log in again.', fields: {}, type: 'auth_error' };
  }
  if (status >= 500) {
    return { message: 'Server error. Please try again later.', fields: {}, type: 'server_error' };
  }

  return { message: fallbackMessage, fields: {}, type: 'error' };
}

/**
 * Apply per-field errors from a parsed API error to a form's `setErrors` function.
 * Returns the top-level message string for banner/toast display.
 *
 * @param {{ message: string, fields: Record<string, string> }} parsedError
 * @param {(updater: (prev: Record<string, string>) => Record<string, string>) => void} setErrors
 * @returns {string}  top-level message
 */
export function applyApiErrors(parsedError, setErrors) {
  if (parsedError.fields && Object.keys(parsedError.fields).length > 0) {
    setErrors(prev => ({ ...prev, ...parsedError.fields }));
  }
  return parsedError.message;
}
