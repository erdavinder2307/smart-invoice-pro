import { createApiUrl, getApiBaseUrl } from '../../config/api';
import API_CONFIG from '../../config/api';

describe('api config', () => {
  it('has a default BASE_URL', () => {
    expect(API_CONFIG.BASE_URL).toBeTruthy();
  });

  it('createApiUrl appends endpoint to base', () => {
    const url = createApiUrl('/api/invoices');
    expect(url).toContain('/api/invoices');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('getApiBaseUrl returns the base URL', () => {
    expect(getApiBaseUrl()).toBe(API_CONFIG.BASE_URL);
  });

  it('ENDPOINTS has expected keys', () => {
    expect(API_CONFIG.ENDPOINTS).toHaveProperty('CUSTOMERS');
    expect(API_CONFIG.ENDPOINTS).toHaveProperty('INVOICES');
    expect(API_CONFIG.ENDPOINTS).toHaveProperty('PRODUCTS');
    expect(API_CONFIG.ENDPOINTS).toHaveProperty('BRANDING');
  });
});
