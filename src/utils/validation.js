/**
 * validation.js — shared client-side validators and form helpers.
 *
 * Each validator is a function that:
 *   - accepts a value
 *   - returns an error string when invalid
 *   - returns undefined (falsy) when valid
 *
 * Usage with runValidation():
 *
 *   import { runValidation, validators, scrollToFirstError } from '../utils/validation';
 *
 *   const errors = runValidation(form, {
 *     vendor_name: [validators.required('Vendor Name')],
 *     email:       [validators.email()],
 *     amount:      [validators.positiveNumber('Amount', { allowZero: false })],
 *     gst_number:  [validators.gst()],
 *   });
 *   if (Object.keys(errors).length) {
 *     setErrors(errors);
 *     scrollToFirstError(errors);
 *     return;
 *   }
 */

// ── Individual validators ────────────────────────────────────────────────────

export const validators = {
  /**
   * Required field.  Returns error if value is empty/null/undefined.
   */
  required: (label) => (value) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return `${label} is required`;
    }
    return undefined;
  },

  /**
   * Email format.  Returns error if format is invalid; passes empty strings
   * (use together with required() if the field is mandatory).
   */
  email: () => (value) => {
    if (!value) return undefined; // empty → handled by required()
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(String(value).trim())) {
      return 'Invalid email address';
    }
    return undefined;
  },

  /**
   * Indian GST number (15-char GSTIN).  Optional field — passes empty values.
   */
  gst: () => (value) => {
    if (!value || !String(value).trim()) return undefined;
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
    if (!re.test(String(value).trim())) {
      return 'Invalid GST number (e.g. 27AABCU9603R1ZX)';
    }
    return undefined;
  },

  /**
   * Indian PAN (10-char format).  Optional field — passes empty values.
   */
  pan: () => (value) => {
    if (!value || !String(value).trim()) return undefined;
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
    if (!re.test(String(value).trim())) {
      return 'Invalid PAN format (e.g. AAACI2405N)';
    }
    return undefined;
  },

  /**
   * Indian mobile number (10 digits, starts with 6–9).  Optional field.
   */
  mobile: () => (value) => {
    if (!value || !String(value).trim()) return undefined;
    const stripped = String(value).trim().replace(/[\s\-()]/g, '');
    if (!/^[6-9]\d{9}$/.test(stripped)) {
      return 'Invalid mobile number (10 digits starting with 6–9)';
    }
    return undefined;
  },

  /**
   * Positive (or non-negative) number.
   *
   * @param {string} label
   * @param {{ required?: boolean, allowZero?: boolean, max?: number, maxLabel?: string }} opts
   */
  positiveNumber: (label, opts = {}) => (value) => {
    const empty = value === '' || value === null || value === undefined;
    if (empty) {
      return opts.required !== false ? `${label} is required` : undefined;
    }
    const n = Number(value);
    if (isNaN(n)) return `${label} must be a valid number`;
    if (opts.allowZero === false && n <= 0) return `${label} must be greater than 0`;
    if (opts.allowZero !== false && n < 0) return `${label} cannot be negative`;
    if (opts.max !== undefined && n > opts.max) {
      const limit = opts.maxLabel || opts.max.toLocaleString('en-IN');
      return `${label} cannot exceed ${limit}`;
    }
    return undefined;
  },

  /**
   * Maximum string length.  Passes empty strings.
   */
  maxLength: (label, max) => (value) => {
    if (!value) return undefined;
    if (String(value).length > max) {
      return `${label} must be ${max} characters or fewer`;
    }
    return undefined;
  },

  /**
   * ISO date string (YYYY-MM-DD).  Required — returns error on empty/invalid.
   */
  date: (label) => (value) => {
    if (!value || !String(value).trim()) return `${label} is required`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) {
      return `${label} must be a valid date`;
    }
    return undefined;
  },
};

// ── Batch runner ─────────────────────────────────────────────────────────────

/**
 * Run a map of field validators against the provided form values.
 *
 * @param {Record<string, any>} values  — form state object
 * @param {Record<string, Array<(v: any) => string|undefined>>} rules
 *        — { fieldName: [validator1, validator2, ...] }
 * @returns {Record<string, string>}  — { fieldName: firstErrorMessage } (empty = valid)
 */
export function runValidation(values, rules) {
  const errors = {};
  for (const [field, fieldValidators] of Object.entries(rules)) {
    for (const validate of fieldValidators) {
      const error = validate(values[field]);
      if (error) {
        errors[field] = error;
        break; // first error wins per field
      }
    }
  }
  return errors;
}

// ── UX helpers ───────────────────────────────────────────────────────────────

/**
 * Scroll to the first form input that has an error.
 * Looks for an element with [name="<firstErrorField>"].
 *
 * @param {Record<string, string>} errors
 */
export function scrollToFirstError(errors) {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;
  const el = document.querySelector(`[name="${firstField}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') el.focus();
  }
}
