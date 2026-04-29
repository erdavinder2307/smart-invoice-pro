import { validators, runValidation } from '../../utils/validation';
import { parseApiError, applyApiErrors } from '../../utils/apiErrors';

// ── validators ───────────────────────────────────────────────────────────────

describe('validators.required', () => {
  const req = validators.required('Name');
  it('returns error for empty string', () => expect(req('')).toBeTruthy());
  it('returns error for null', () => expect(req(null)).toBeTruthy());
  it('returns error for undefined', () => expect(req(undefined)).toBeTruthy());
  it('returns error for whitespace', () => expect(req('  ')).toBeTruthy());
  it('returns undefined for valid value', () => expect(req('John')).toBeUndefined());
});

describe('validators.email', () => {
  const email = validators.email();
  it('passes empty value', () => expect(email('')).toBeUndefined());
  it('passes valid email', () => expect(email('a@b.com')).toBeUndefined());
  it('rejects missing @', () => expect(email('abc.com')).toBeTruthy());
  it('rejects missing domain', () => expect(email('a@')).toBeTruthy());
});

describe('validators.gst', () => {
  const gst = validators.gst();
  it('passes empty value', () => expect(gst('')).toBeUndefined());
  it('passes valid GSTIN', () => expect(gst('27AABCU9603R1ZX')).toBeUndefined());
  it('rejects short value', () => expect(gst('123')).toBeTruthy());
  it('rejects invalid format', () => expect(gst('ZZZZZ00000ZZZZZ')).toBeTruthy());
});

describe('validators.pan', () => {
  const pan = validators.pan();
  it('passes empty value', () => expect(pan('')).toBeUndefined());
  it('passes valid PAN', () => expect(pan('AAACI2405N')).toBeUndefined());
  it('rejects invalid format', () => expect(pan('1234567890')).toBeTruthy());
});

describe('validators.mobile', () => {
  const mob = validators.mobile();
  it('passes empty value', () => expect(mob('')).toBeUndefined());
  it('passes valid mobile', () => expect(mob('9876543210')).toBeUndefined());
  it('rejects 9-digit number', () => expect(mob('987654321')).toBeTruthy());
  it('rejects number starting with 1', () => expect(mob('1234567890')).toBeTruthy());
});

describe('validators.positiveNumber', () => {
  const pos = validators.positiveNumber('Amount');
  it('passes positive number', () => expect(pos(10)).toBeUndefined());
  it('rejects negative number', () => expect(pos(-1)).toBeTruthy());
  it('passes zero by default', () => expect(pos(0)).toBeUndefined());

  const posNoZero = validators.positiveNumber('Amount', { allowZero: false });
  it('rejects zero when allowZero:false', () => expect(posNoZero(0)).toBeTruthy());
});

// ── runValidation ────────────────────────────────────────────────────────────

describe('runValidation', () => {
  it('returns empty object when all valid', () => {
    const errors = runValidation(
      { name: 'Alice', email: 'a@b.com' },
      { name: [validators.required('Name')], email: [validators.email()] }
    );
    expect(errors).toEqual({});
  });

  it('returns first error per field', () => {
    const errors = runValidation(
      { name: '', email: 'bad' },
      {
        name: [validators.required('Name')],
        email: [validators.email()],
      }
    );
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });

  it('does not include fields that pass', () => {
    const errors = runValidation(
      { name: 'Alice', email: '' },
      { name: [validators.required('Name')], email: [validators.email()] }
    );
    expect(errors.name).toBeUndefined();
    expect(errors.email).toBeUndefined();
  });
});

// ── parseApiError ────────────────────────────────────────────────────────────

describe('parseApiError', () => {
  it('handles network error (no response)', () => {
    const result = parseApiError({ response: null });
    expect(result.message).toMatch(/network/i);
    expect(result.fields).toEqual({});
  });

  it('parses new standard format', () => {
    const err = {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            type: 'validation_error',
            message: 'Fix the fields',
            fields: { vendor_name: 'Vendor name is required' },
          },
        },
      },
    };
    const result = parseApiError(err);
    expect(result.message).toBe('Fix the fields');
    expect(result.fields.vendor_name).toBe('Vendor name is required');
    expect(result.type).toBe('validation_error');
  });

  it('parses legacy flat format', () => {
    const err = { response: { status: 400, data: { error: 'Something went wrong' } } };
    const result = parseApiError(err);
    expect(result.message).toBe('Something went wrong');
    expect(result.fields).toEqual({});
  });

  it('returns 404 message for 404 status', () => {
    const err = { response: { status: 404, data: {} } };
    const result = parseApiError(err);
    expect(result.message).toMatch(/not found/i);
    expect(result.type).toBe('not_found');
  });

  it('returns hardcoded 5xx message for server errors', () => {
    const err = { response: { status: 500, data: {} } };
    const result = parseApiError(err, 'My fallback');
    expect(result.message).toMatch(/server error/i);
    expect(result.type).toBe('server_error');
  });
});

// ── applyApiErrors ───────────────────────────────────────────────────────────

describe('applyApiErrors', () => {
  it('calls setErrors with field errors from parsed result', () => {
    const setErrors = jest.fn();
    const parsed = { message: 'Fix fields', fields: { name: 'Required' }, type: 'validation_error' };
    const msg = applyApiErrors(parsed, setErrors);
    expect(setErrors).toHaveBeenCalled();
    expect(msg).toBe('Fix fields');
  });

  it('does not call setErrors when no field errors', () => {
    const setErrors = jest.fn();
    const parsed = { message: 'Server error', fields: {}, type: 'server_error' };
    const msg = applyApiErrors(parsed, setErrors);
    // applyApiErrors only calls setErrors when there are fields
    expect(setErrors).not.toHaveBeenCalled();
    expect(msg).toBe('Server error');
  });
});
