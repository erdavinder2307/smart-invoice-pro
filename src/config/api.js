import { API_BASE_URL } from './environment';

// API configuration — BASE_URL is sourced exclusively from environment.js.
// No localhost fallback exists here. See environment.js for environment rules.
const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    CUSTOMERS: '/api/customers',
    CUSTOMER_LOGIN: '/api/customer/login',
    CUSTOMER_INVOICES: '/api/customer/invoices',
    INVOICES: '/api/invoices',
    PRODUCTS: '/api/products',
    NEXT_INVOICE_NUMBER: '/api/invoices/next-number',
    ORGANIZATION_PROFILE: '/api/settings/organization-profile',
    UPLOAD_ORG_LOGO: '/api/settings/upload-logo',
    BRANDING: '/api/settings/branding',
    INVOICE_PREFERENCES: '/api/settings/invoice-preferences',
  }
};

// Helper function to create full API URL
export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get API base URL
export const getApiBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};

// API Functions
export const getCustomerInvoices = async (token) => {
  const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customer invoices');
  }

  return await response.json();
};

export default API_CONFIG;
