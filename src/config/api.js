// API configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000',
  ENDPOINTS: {
    CUSTOMERS: '/api/customers',
    INVOICES: '/api/invoices',
    PRODUCTS: '/api/products',
    NEXT_INVOICE_NUMBER: '/api/invoices/next-number',
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

export default API_CONFIG;
